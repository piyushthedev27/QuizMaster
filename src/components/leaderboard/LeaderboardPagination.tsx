'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LeaderboardPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function LeaderboardPagination({
  currentPage,
  totalCount,
  pageSize,
  hasMore,
  onPageChange,
  loading = false
}: LeaderboardPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const canGoPrevious = currentPage > 1;
  const canGoNext = hasMore && currentPage < totalPages;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious || loading}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext || loading}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium"
        >
          Next
        </Button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              const isCurrentPage = pageNum === currentPage;
              
              return (
                <Button
                  key={pageNum}
                  variant={isCurrentPage ? "default" : "outline"}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    isCurrentPage
                      ? 'z-10 bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}