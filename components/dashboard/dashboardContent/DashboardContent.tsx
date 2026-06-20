'use client';

import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { StatsCards } from '@/components/dashboard/statsCards/StatsCards';
import { CollectionsSession } from '@/components/dashboard/collectionSession/CollectionsSession';
import { PinnedItems } from '@/components/dashboard/pinnedItems/PinnedItems';
import { RecentItems } from '@/components/dashboard/recentItems/RecentItems';
import { DashboardDataRetry } from '@/components/dashboard/dashboardDataRetry/DashboardDataRetry';
import { GetStartedHero } from '@/components/dashboard/getStartedHero/GetStartedHero';
import { KeyboardHint } from '@/components/dashboard/keyboardHint/KeyboardHint';
import type { ItemWithDetails, CollectionWithStats, ItemStats } from '@/types/db';

interface DashboardContentProps {
  recentCollections: CollectionWithStats[];
  itemStats: ItemStats;
  pinnedItems: ItemWithDetails[];
  recentItems: ItemWithDetails[];
}

export function DashboardContent({
  recentCollections,
  itemStats,
  pinnedItems,
  recentItems,
}: DashboardContentProps) {
  const { openDrawer } = useItemDrawer();

  return (
    <>
      <div className='flex items-center gap-2 px-2 py-1'>
        <span className='text-xs text-muted-foreground'>Quick commands:</span>
        <KeyboardHint shortcut="Ctrl+K" />
      </div>
      <DashboardDataRetry>
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
      </DashboardDataRetry>
    </>
  );
}
