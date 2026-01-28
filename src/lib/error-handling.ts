import { AuthError } from '@supabase/supabase-js'

// Error types for different parts of the application
export interface AppError {
  type: 'auth' | 'quiz' | 'database' | 'network' | 'realtime' | 'validation' | 'unknown'
  message: string
  code?: string
  details?: any
  retryable?: boolean
  timestamp: Date
}

// Error classification and user-friendly message mapping
export class ErrorHandler {
  private static readonly ERROR_MESSAGES = {
    // Authentication errors
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'email_not_confirmed': 'Please check your email and click the confirmation link before signing in.',
    'too_many_requests': 'Too many login attempts. Please wait a few minutes before trying again.',
    'weak_password': 'Password must be at least 6 characters long.',
    'email_address_invalid': 'Please enter a valid email address.',
    'signup_disabled': 'New registrations are currently disabled. Please contact support.',
    'over_email_send_rate_limit': 'Too many signup attempts. Please wait a few minutes before trying again, or try using a different email address.',
    
    // Quiz engine errors
    'insufficient_questions': 'Not enough questions available to start a quiz. Please contact support.',
    'quiz_not_found': 'Quiz session not found. Please start a new quiz.',
    'quiz_already_completed': 'This quiz has already been completed.',
    'invalid_answer': 'Invalid answer format. Please select a valid option.',
    'timer_expired': 'Time has expired for this question.',
    
    // Database errors
    'connection_failed': 'Database connection failed. Please check your internet connection and try again.',
    'query_timeout': 'The request took too long to complete. Please try again.',
    'permission_denied': 'You do not have permission to perform this action.',
    'record_not_found': 'The requested data was not found.',
    'constraint_violation': 'Data validation failed. Please check your input.',
    
    // Network errors
    'network_error': 'Network connection failed. Please check your internet connection and try again.',
    'timeout_error': 'Request timed out. Please try again.',
    'server_error': 'Server error occurred. Please try again later.',
    
    // Real-time errors
    'realtime_connection_failed': 'Real-time connection failed. Updates may be delayed.',
    'subscription_failed': 'Failed to subscribe to live updates. Refreshing manually.',
    'websocket_error': 'WebSocket connection error. Attempting to reconnect...',
    
    // Default messages
    'default': 'An unexpected error occurred. Please try again.'
  }

  private static readonly RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000] // Exponential backoff

  /**
   * Classify and format errors into user-friendly messages
   */
  static handleError(error: any, context?: string): AppError {
    const timestamp = new Date()
    
    // Handle Supabase Auth errors
    if (error?.name === 'AuthError' || error?.message?.includes('auth')) {
      return this.handleAuthError(error, timestamp)
    }
    
    // Handle network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return {
        type: 'network',
        message: this.ERROR_MESSAGES['network_error'],
        code: 'NETWORK_ERROR',
        retryable: true,
        timestamp
      }
    }
    
    // Handle timeout errors
    if (error?.name === 'TimeoutError' || error?.code === 'TIMEOUT') {
      return {
        type: 'network',
        message: this.ERROR_MESSAGES['timeout_error'],
        code: 'TIMEOUT',
        retryable: true,
        timestamp
      }
    }
    
    // Handle database errors
    if (error?.code?.startsWith('P') || error?.message?.includes('Prisma')) {
      return this.handleDatabaseError(error, timestamp)
    }
    
    // Handle quiz engine errors
    if (context === 'quiz' || error?.message?.includes('quiz')) {
      return this.handleQuizError(error, timestamp)
    }
    
    // Handle real-time errors
    if (error?.message?.includes('realtime') || error?.message?.includes('websocket')) {
      return this.handleRealtimeError(error, timestamp)
    }
    
    // Default error handling
    return {
      type: 'unknown',
      message: error?.message || this.ERROR_MESSAGES['default'],
      code: error?.code || 'UNKNOWN_ERROR',
      details: error,
      retryable: false,
      timestamp
    }
  }

  private static handleAuthError(error: any, timestamp: Date): AppError {
    const message = error?.message?.toLowerCase() || ''
    
    if (message.includes('invalid login credentials')) {
      return {
        type: 'auth',
        message: this.ERROR_MESSAGES['invalid_credentials'],
        code: 'INVALID_CREDENTIALS',
        retryable: false,
        timestamp
      }
    }
    
    if (message.includes('email not confirmed')) {
      return {
        type: 'auth',
        message: this.ERROR_MESSAGES['email_not_confirmed'],
        code: 'EMAIL_NOT_CONFIRMED',
        retryable: false,
        timestamp
      }
    }
    
    if (message.includes('too many requests') || error?.code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
      return {
        type: 'auth',
        message: 'Too many signup attempts. Please wait a few minutes before trying again, or try using a different email address.',
        code: 'TOO_MANY_REQUESTS',
        retryable: true,
        timestamp
      }
    }
    
    if (message.includes('password') && message.includes('weak')) {
      return {
        type: 'auth',
        message: this.ERROR_MESSAGES['weak_password'],
        code: 'WEAK_PASSWORD',
        retryable: false,
        timestamp
      }
    }
    
    if (message.includes('email') && message.includes('invalid')) {
      return {
        type: 'auth',
        message: this.ERROR_MESSAGES['email_address_invalid'],
        code: 'INVALID_EMAIL',
        retryable: false,
        timestamp
      }
    }
    
    return {
      type: 'auth',
      message: error?.message || this.ERROR_MESSAGES['default'],
      code: error?.code || 'AUTH_ERROR',
      retryable: false,
      timestamp
    }
  }

  private static handleDatabaseError(error: any, timestamp: Date): AppError {
    const code = error?.code || ''
    const message = error?.message?.toLowerCase() || ''
    
    // Handle connection termination errors specifically
    if (message.includes('connection terminated unexpectedly') || 
        message.includes('connection closed') ||
        message.includes('connection refused') ||
        message.includes('econnreset') ||
        message.includes('enotfound')) {
      return {
        type: 'database',
        message: 'Database connection failed. Please check your internet connection and try again.',
        code: 'CONNECTION_TERMINATED',
        retryable: true,
        timestamp
      }
    }
    
    if (code === 'P2002') {
      return {
        type: 'database',
        message: 'This record already exists. Please use different values.',
        code: 'DUPLICATE_RECORD',
        retryable: false,
        timestamp
      }
    }
    
    if (code === 'P2025') {
      return {
        type: 'database',
        message: this.ERROR_MESSAGES['record_not_found'],
        code: 'RECORD_NOT_FOUND',
        retryable: false,
        timestamp
      }
    }
    
    if (message.includes('connection') || message.includes('timeout') || message.includes('timed out')) {
      return {
        type: 'database',
        message: this.ERROR_MESSAGES['connection_failed'],
        code: 'CONNECTION_FAILED',
        retryable: true,
        timestamp
      }
    }
    
    // Handle Prisma-specific errors
    if (message.includes('prisma') || code.startsWith('P')) {
      return {
        type: 'database',
        message: 'Database operation failed. Please try again.',
        code: code || 'PRISMA_ERROR',
        retryable: true,
        timestamp
      }
    }
    
    return {
      type: 'database',
      message: this.ERROR_MESSAGES['default'],
      code: 'DATABASE_ERROR',
      retryable: true,
      timestamp
    }
  }

  private static handleQuizError(error: any, timestamp: Date): AppError {
    const message = error?.message?.toLowerCase() || ''
    
    if (message.includes('insufficient questions')) {
      return {
        type: 'quiz',
        message: this.ERROR_MESSAGES['insufficient_questions'],
        code: 'INSUFFICIENT_QUESTIONS',
        retryable: false,
        timestamp
      }
    }
    
    if (message.includes('not found') || message.includes('session')) {
      return {
        type: 'quiz',
        message: this.ERROR_MESSAGES['quiz_not_found'],
        code: 'QUIZ_NOT_FOUND',
        retryable: false,
        timestamp
      }
    }
    
    if (message.includes('completed')) {
      return {
        type: 'quiz',
        message: this.ERROR_MESSAGES['quiz_already_completed'],
        code: 'QUIZ_COMPLETED',
        retryable: false,
        timestamp
      }
    }
    
    return {
      type: 'quiz',
      message: error?.message || this.ERROR_MESSAGES['default'],
      code: 'QUIZ_ERROR',
      retryable: true,
      timestamp
    }
  }

  private static handleRealtimeError(error: any, timestamp: Date): AppError {
    const message = error?.message?.toLowerCase() || ''
    
    if (message.includes('connection') || message.includes('websocket')) {
      return {
        type: 'realtime',
        message: this.ERROR_MESSAGES['realtime_connection_failed'],
        code: 'REALTIME_CONNECTION_FAILED',
        retryable: true,
        timestamp
      }
    }
    
    if (message.includes('subscription')) {
      return {
        type: 'realtime',
        message: this.ERROR_MESSAGES['subscription_failed'],
        code: 'SUBSCRIPTION_FAILED',
        retryable: true,
        timestamp
      }
    }
    
    return {
      type: 'realtime',
      message: this.ERROR_MESSAGES['websocket_error'],
      code: 'WEBSOCKET_ERROR',
      retryable: true,
      timestamp
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: string
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const appError = this.handleError(error, context)
        
        // Don't retry if error is not retryable
        if (!appError.retryable || attempt === maxRetries) {
          throw appError
        }
        
        // Wait before retrying with exponential backoff
        const delay = this.RETRY_DELAYS[Math.min(attempt, this.RETRY_DELAYS.length - 1)]
        await new Promise(resolve => setTimeout(resolve, delay))
        
        console.log(`Retrying operation (attempt ${attempt + 2}/${maxRetries + 1}) after ${delay}ms delay`)
      }
    }
    
    throw this.handleError(lastError, context)
  }

  /**
   * Log errors for debugging and monitoring
   */
  static logError(error: AppError, context?: string): void {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      code: error.code,
      message: error.message,
      context,
      details: error.details,
      retryable: error.retryable
    }
    
    console.error('Application Error:', JSON.stringify(logData, null, 2))
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or similar
  }
}

// Utility function for handling async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
  maxRetries?: number
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await ErrorHandler.retryOperation(operation, maxRetries, context)
    return { data, error: null }
  } catch (error) {
    const appError = error instanceof Error ? ErrorHandler.handleError(error, context) : error as AppError
    ErrorHandler.logError(appError, context)
    return { data: null, error: appError }
  }
}