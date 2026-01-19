import { NextRequest, NextResponse } from 'next/server';
import { ResultCalculator } from '@/lib/result-calculator';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userStats = await ResultCalculator.getUserStats(userId);
    
    return NextResponse.json({ userStats });
  } catch (error) {
    console.error('User stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}