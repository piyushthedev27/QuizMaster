import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  )
}

// Specific skeleton components for different UI elements
export function QuestionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Question text skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Options skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      
      {/* Timer skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      {/* Table skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex space-x-8">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      
      {/* Action button skeleton */}
      <div className="text-center">
        <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
      </div>
    </div>
  )
}

export function ResultsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
      </div>
      
      {/* Score card skeleton */}
      <div className="p-8 border rounded-lg space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-24 mx-auto" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-6 w-16 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons skeleton */}
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}