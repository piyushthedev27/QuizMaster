import { NextRequest, NextResponse } from 'next/server';
import { QuizEngine } from '@/lib/quiz-engine';
import { auth } from '@clerk/nextjs/server';
import { QuizSession } from '@/types/question';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session }: { session: QuizSession } = await request.json();

    // Validate that the session belongs to the authenticated user
    if (session.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedSession = QuizEngine.autoSubmitQuestion(session);
    
    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Auto-submit error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-submit question' },
      { status: 500 }
    );
  }
}