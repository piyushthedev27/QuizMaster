import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuizSession } from '@/types/question';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { session }: { session: QuizSession } = await request.json();

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

    // Calculate basic results WITHOUT database operations
    const totalQuestions = session.questions.length;
    let correctAnswers = 0;

    // Calculate correct answers
    session.answers.forEach((answer, index) => {
      if (answer && session.questions[index]?.answer === answer) {
        correctAnswers++;
      }
    });

    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Calculate time taken in seconds
    const timeTaken = session.endTime && session.startTime 
      ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
      : 0;

    const score = correctAnswers;

    const results = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
      timeTaken,
      score,
      globalRank: 1 // Temporary rank for testing
    };

    console.log('Simple quiz completion successful:', results);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Simple quiz completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete quiz' },
      { status: 500 }
    );
  }
}