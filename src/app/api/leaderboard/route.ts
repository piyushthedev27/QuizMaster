import { NextRequest, NextResponse } from 'next/server';
import { ResultCalculator } from '@/lib/result-calculator';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 });
    }

    if (offset < 0) {
      return NextResponse.json({ error: 'Offset must be non-negative' }, { status: 400 });
    }

    const leaderboardData = await ResultCalculator.getLeaderboard(limit, offset);
    
    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}