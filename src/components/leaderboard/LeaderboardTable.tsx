'use client';

import { LeaderboardEntry } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Clock, Target, User } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  loading?: boolean;
}

export function LeaderboardTable({ entries, currentUserId, loading }: LeaderboardTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDisplayName = (user: LeaderboardEntry['user']) => {
    return user.username || user.email.split('@')[0] || 'Anonymous';
  };

  const formatUnit = (unit?: string) => {
    if (!unit) return 'Random Quiz';
    return unit.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isTopThree = entry.rank <= 3;
            
            return (
              <div
                key={entry.id}
                className={`
                  flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-all duration-200 hover:shadow-md
                  ${isCurrentUser 
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                    : isTopThree 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
              >
                {/* Rank Icon */}
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                      {isCurrentUser && <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />}
                      {getDisplayName(entry.user)}
                    </p>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      <Target className="h-3 w-3" />
                      {formatUnit(entry.unit)} • {entry.totalQuestions || entry.answers?.length || 10} Qs
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                      <Award className="h-3 w-3 text-amber-500" />
                      {entry.accuracy.toFixed(1)}% accuracy
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.timeTaken)}
                    </div>
                  </div>
                </div>

                {/* Score and Rank Badge */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-base sm:text-lg font-bold text-gray-900">
                    {entry.score}
                  </div>
                  <Badge 
                    className={`text-xs ${getRankBadgeColor(entry.rank)}`}
                  >
                    #{entry.rank}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No quiz attempts yet. Be the first to take a quiz!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}