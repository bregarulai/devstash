'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardsSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsCardsSkeleton({ count = 4, className }: StatsCardsSkeletonProps) {
  return (
    <div className={cn('flex gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-[var(--skeleton-stats-h, 60px)] w-[var(--skeleton-stats-w, 120px)] rounded-xl bg-muted',
            'ring-1 ring-foreground/5',
          )}
        />
      ))}
    </div>
  );
}
