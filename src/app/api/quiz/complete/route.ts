import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { QuizSession } from '@/types/question';
import { ErrorHandler } from '@/lib/error-handling';
import { ResultCalculator } from '@/lib/result-calculator';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      const appError = ErrorHandler.handleError(parseError, 'validation');
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const { session }: { session: QuizSession } = requestData;

    // Validate request data
    if (!session) {
      return NextResponse.json({ error: 'Missing required field: session' }, { status: 400 });
    }

    // Validate that the session belongs to the authenticated user
    if (session.userId !== userId) {
      return NextResponse.json({ error: 'Access denied: session does not belong to user' }, { status: 403 });
    }

    // Validate session status
    if (session.status !== 'completed') {
      return NextResponse.json({ error: 'Quiz session is not completed' }, { status: 400 });
    }

    // Get user email and username from Clerk
    const userEmail = user.emailAddresses[0]?.emailAddress || '';
    const username = user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || '';

    // Calculate results using ResultCalculator, passing user email and username for database creation
    const results = await ResultCalculator.calculateResults(session, userId, userEmail, username);
    
    return NextResponse.json({ results });
  } catch (error) {
    const appError = ErrorHandler.handleError(error, 'quiz');
    ErrorHandler.logError(appError, 'Complete Quiz');
    
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