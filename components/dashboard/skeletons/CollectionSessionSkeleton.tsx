'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CollectionSessionSkeletonProps {
  count?: number;
  className?: string;
}

export function CollectionSessionSkeleton({ count = 6, className }: CollectionSessionSkeletonProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-[var(--skeleton-collection-h, 100px)] w-full rounded-xl bg-muted',
            'ring-1 ring-foreground/5',
          )}
        />
      ))}
    </div>
  );
}
