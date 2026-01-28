'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardTable } from './LeaderboardTable';
import { LeaderboardPagination } from './LeaderboardPagination';
import { RealtimeIndicator } from './RealtimeIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle, ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PAGE_SIZE = 20;

export function Leaderboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdate, setLastUpdate] = useState<Date | undefined>();
  
  const {
    data,
    loading,
    error,
    currentUserRank,
    isRealtimeConnected,
    fetchLeaderboard,
    refreshLeaderboard
  } = useLeaderboard(PAGE_SIZE, user?.id, true);

  // Track when data updates for real-time indicator
  useEffect(() => {
    if (data && !loading) {
      setLastUpdate(new Date());
    }
  }, [data, loading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const offset = (page - 1) * PAGE_SIZE;
    fetchLeaderboard(PAGE_SIZE, offset);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    refreshLeaderboard();
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              onClick={handleBackToDashboard}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load leaderboard
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button 
            onClick={handleBackToDashboard}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Header Card */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                    Leaderboard
                  </CardTitle>
                  {currentUserRank && (
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Your rank: <span className="font-semibold text-blue-600">#{currentUserRank}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                <RealtimeIndicator 
                  isConnected={isRealtimeConnected} 
                  lastUpdate={lastUpdate}
                />
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Ready for Challenge Card - Only show if user has no attempts */}
        {data && data.totalCount === 0 && (
          <Card className="mb-6 sm:mb-8 border-blue-200 bg-blue-50">
            <CardContent className="text-center py-6 sm:py-8 px-4 sm:px-6">
              <div className="p-3 bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">
                Ready for a Challenge?
              </h3>
              <p className="text-sm sm:text-base text-blue-700 mb-4">
                Be the first to take the quiz and claim the top spot on the leaderboard!
              </p>
              <Button 
                onClick={() => router.push('/quiz')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Your First Quiz
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardContent className="p-0">
            <LeaderboardTable
              entries={data?.leaderboard || []}
              currentUserId={user?.id}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {data && data.totalCount > PAGE_SIZE && (
          <div className="mt-4 sm:mt-6">
            <LeaderboardPagination
              currentPage={currentPage}
              totalCount={data.totalCount}
              pageSize={PAGE_SIZE}
              hasMore={data.hasMore}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        )}

        {/* Stats Footer */}
        {data && data.totalCount > 0 && (
          <Card className="mt-4 sm:mt-6">
            <CardContent className="text-center py-3 sm:py-4 px-4 sm:px-6">
              <div className="text-xs sm:text-sm text-gray-500">
                Showing {data.leaderboard.length} of {data.totalCount} quiz attempts
                {lastUpdate && (
                  <span className="block mt-1">
                    Real-time updates {isRealtimeConnected ? 'enabled' : 'disconnected'} • Last sync: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}