import { useState, useEffect, useCallback } from 'react';
import { useRealtimeLeaderboard } from './useRealtimeLeaderboard';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  accuracy: number;
  timeTaken: number;
  createdAt: string;
  rank: number;
  user: {
    id: string;
    email: string;
    username: string | null;
  };
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  totalCount: number;
  hasMore: boolean;
}

export interface UseLeaderboardReturn {
  data: LeaderboardData | null;
  loading: boolean;
  error: string | null;
  currentUserRank: number | null;
  isRealtimeConnected: boolean;
  fetchLeaderboard: (limit?: number, offset?: number) => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

export function useLeaderboard(
  initialLimit: number = 50,
  currentUserId?: string,
  enableRealtime: boolean = true
): UseLeaderboardReturn {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const fetchLeaderboard = useCallback(async (limit = initialLimit, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentLimit(limit);
      setCurrentOffset(offset);

      const response = await fetch(`/api/leaderboard?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const leaderboardData: LeaderboardData = await response.json();
      setData(leaderboardData);

      // Find current user's rank if userId is provided
      if (currentUserId) {
        const userEntry = leaderboardData.leaderboard.find(
          entry => entry.userId === currentUserId
        );
        if (userEntry) {
          setCurrentUserRank(userEntry.rank);
        } else {
          // If user is not in current page, we need to fetch their stats separately
          try {
            const statsResponse = await fetch('/api/user/stats');
            if (statsResponse.ok) {
              const userStats = await statsResponse.json();
              setCurrentUserRank(userStats?.globalRank || null);
            }
          } catch (statsError) {
            console.error('Error fetching user stats:', statsError);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [initialLimit, currentUserId]);

  const refreshLeaderboard = useCallback(() => {
    return fetchLeaderboard(currentLimit, currentOffset);
  }, [fetchLeaderboard, currentLimit, currentOffset]);

  // Set up real-time subscription for leaderboard updates
  const { isConnected } = useRealtimeLeaderboard({
    onLeaderboardUpdate: refreshLeaderboard,
    onConnectionStatusChange: setIsRealtimeConnected,
    enabled: enableRealtime
  });

  useEffect(() => {
    setIsRealtimeConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    data,
    loading,
    error,
    currentUserRank,
    isRealtimeConnected,
    fetchLeaderboard,
    refreshLeaderboard
  };
}