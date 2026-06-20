'use client';

import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { StatsCards } from '@/components/dashboard/statsCards/StatsCards';
import { CollectionsSession } from '@/components/dashboard/collectionSession/CollectionsSession';
import { PinnedItems } from '@/components/dashboard/pinnedItems/PinnedItems';
import { RecentItems } from '@/components/dashboard/recentItems/RecentItems';
import { GetStartedHero } from '@/components/dashboard/getStartedHero/GetStartedHero';
import { KeyboardHint } from '@/components/dashboard/keyboardHint/KeyboardHint';
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
      <div className='flex items-center gap-2 px-2 py-1'>
        <span className='text-xs text-muted-foreground'>Quick commands:</span>
        <KeyboardHint shortcut="Ctrl+K" />
      </div>
      <div className='space-y-6'>
        {itemStats.totalItems === 0 ? (
          <GetStartedHero />
        ) : (
          <>
            <StatsCards stats={itemStats} />
            <CollectionsSession collections={recentCollections} />
            <PinnedItems items={pinnedItems} onOpen={openDrawer} />
            <RecentItems items={recentItems} onOpen={openDrawer} />
          </>
        )}
      </div>
    </>
  );
}
