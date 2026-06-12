'use client';

import { cn } from '@/lib/utils/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentItemsSkeletonProps {
  count?: number;
  className?: string;
}

export function RecentItemsSkeleton({ count = 6, className }: RecentItemsSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-[var(--skeleton-item-h, 72px)] w-full rounded-xl bg-muted',
            'ring-1 ring-foreground/5',
          )}
        />
      ))}
    </div>
  );
}
