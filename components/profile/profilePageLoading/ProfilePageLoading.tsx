'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface ProfilePageLoadingProps {
  variant?: 'avatar' | 'full';
}

export function ProfilePageLoading({ variant = 'full' }: ProfilePageLoadingProps) {
  if (variant === 'avatar') {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 py-12 max-w-2xl w-full px-4">
        {/* Avatar and name */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>

        {/* Item type breakdown */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
