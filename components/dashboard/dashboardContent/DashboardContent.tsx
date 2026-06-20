'use client';

import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { StatsCards } from '@/components/dashboard/statsCards/StatsCards';
import { CollectionsSession } from '@/components/dashboard/collectionsSession/CollectionsSession';
import { PinnedItems } from '@/components/dashboard/pinnedItems/PinnedItems';
import { RecentItems } from '@/components/dashboard/recentItems/RecentItems';
import { GetStartedHero } from '@/components/dashboard/getStartedHero/GetStartedHero';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { ItemWithDetails, CollectionWithStats, ItemStats } from '@/types/db';

interface DashboardContentProps {
  recentCollections: CollectionWithStats[];
  itemStats: ItemStats;
  pinnedItems: ItemWithDetails[];
  recentItems: ItemWithDetails[];
  errors?: string[];
}

export function DashboardContent({
  recentCollections,
  itemStats,
  pinnedItems,
  recentItems,
  errors = [],
}: DashboardContentProps) {
  const { openDrawer } = useItemDrawer();

  return (
    <>
      {errors.length > 0 && (
        <Alert variant='destructive' className='mb-4'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Some data couldn&apos;t load</AlertTitle>
          <AlertDescription>
            Failed to load: {errors.join(', ')}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}
      <div className='space-y-6'>
        {itemStats.totalItems === 0 ? (
          <GetStartedHero />
        ) : (
          <>
            <StatsCards stats={itemStats} />
            <div className='mt-2 mb-2'>
              <CollectionsSession collections={recentCollections} />
            </div>
            <div className='border-b border-border/50 pb-6'>
              <PinnedItems items={pinnedItems} onOpen={openDrawer} />
            </div>
            <RecentItems items={recentItems} onOpen={openDrawer} />
          </>
        )}
      </div>
    </>
  );
}
