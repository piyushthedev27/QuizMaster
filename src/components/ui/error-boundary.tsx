'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { ErrorHandler, AppError } from '@/lib/error-handling'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError) => void
}

interface State {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = ErrorHandler.handleError(error, 'error-boundary')
    return {
      hasError: true,
      error: appError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorHandler.handleError(error, 'error-boundary')
    ErrorHandler.logError(appError, 'React Error Boundary')
    
    // Call optional error callback
    this.props.onError?.(appError)
    
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-red-500">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                {this.state.error?.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error?.retryable && (
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={this.handleGoHome}
                className="w-full"
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
              
              {process.env.NODE_ENV === 'development' && this.state.error?.details && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {JSON.stringify(this.state.error.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Specific error boundaries for different parts of the app
export function QuizErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Quiz Error</h2>
          <p className="text-gray-600 mb-4">
            There was a problem with the quiz. Please try starting a new quiz.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">
            There was a problem with authentication. Please try logging in again.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Go to Login
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}