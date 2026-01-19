import { NextRequest, NextResponse } from 'next/server';
import { QuizEngine } from '@/lib/quiz-engine';
import { auth } from '@clerk/nextjs/server';
import { AnswerOption, QuizSession } from '@/types/question';
import { ErrorHandler } from '@/lib/error-handling';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      const appError = ErrorHandler.handleError(parseError, 'validation');
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { session, selectedOption }: { 
      session: QuizSession; 
      selectedOption: AnswerOption | null 
    } = requestData;

    // Validate request data
    if (!session || selectedOption === undefined) {
      return NextResponse.json({ error: 'Missing required fields: session and selectedOption' }, { status: 400 });
    }

    // Validate that the session belongs to the authenticated user
    if (session.userId !== userId) {
      return NextResponse.json({ error: 'Access denied: session does not belong to user' }, { status: 403 });
    }

    // Validate answer option (allow null for skipped questions)
    if (selectedOption !== null && !['a', 'b', 'c', 'd'].includes(selectedOption)) {
      return NextResponse.json({ error: 'Invalid answer option. Must be a, b, c, d, or null for skipped questions' }, { status: 400 });
    }

    // Validate session status
    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Quiz session is not active' }, { status: 400 });
    }

    const updatedSession = QuizEngine.submitAnswer(session, selectedOption);
    
    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    const appError = ErrorHandler.handleError(error, 'quiz');
    ErrorHandler.logError(appError, 'Submit Answer');
    
    // Return appropriate status code based on error type
    let statusCode = 500;
    if (appError.code === 'QUIZ_NOT_FOUND' || appError.code === 'QUIZ_COMPLETED') {
      statusCode = 400; // Bad Request
    }
    
    return NextResponse.json(
      { error: appError.message },
      { status: statusCode }
    );
  }
}