import { NextRequest, NextResponse } from 'next/server';
import { QuizEngine } from '@/lib/quiz-engine';
import { auth } from '@clerk/nextjs/server';
import { ErrorHandler } from '@/lib/error-handling';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body to get question count and unit
    const body = await request.json().catch(() => ({}));
    const questionCount = body.questionCount || 10; // Default to 10 questions
    const unit = body.unit; // Optional unit parameter

    // Validate question count
    if (![10, 30, 50, 100].includes(questionCount)) {
      return NextResponse.json({ error: 'Invalid question count. Must be 10, 30, 50, or 100' }, { status: 400 });
    }

    const session = await QuizEngine.initializeQuizSession(userId, questionCount, unit);
    
    return NextResponse.json({ session });
  } catch (error) {
    const appError = ErrorHandler.handleError(error, 'quiz');
    ErrorHandler.logError(appError, 'Quiz Initialize');
    
    // Return appropriate status code based on error type
    let statusCode = 500;
    if (appError.code === 'INSUFFICIENT_QUESTIONS') {
      statusCode = 503; // Service Unavailable
    } else if (appError.type === 'database') {
      statusCode = 503; // Service Unavailable
    }
    
    return NextResponse.json(
      { error: appError.message },
      { status: statusCode }
    );
  }
}