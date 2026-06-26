import { auth } from '@/lib/auth/auth/auth';
import { getUserById } from '@/lib/db/users/users';
import {
  getPinnedItems,
  getRecentItems,
  getSystemItemTypesWithCounts,
  getItemStats,
} from '@/lib/db/items/items';
import {
  getFavoriteCollections,
  getRecentCollections,
} from '@/lib/db/collections/collections';
import { DASHBOARD_COLLECTIONS_LIMIT, DASHBOARD_RECENT_ITEMS_LIMIT } from '@/lib/db/constants/constants';
import type {
  ItemWithDetails,
  SystemItemType,
  CollectionWithStats,
  ItemStats,
  DashboardUser,
} from '@/types/db';
import { EMPTY_ITEM_STATS } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { DashboardContent } from '@/components/dashboard/dashboardContent/DashboardContent';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type DashboardData = {
  pinnedItems: ItemWithDetails[];
  recentItems: ItemWithDetails[];
  systemItemTypes: SystemItemType[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  itemStats: ItemStats;
  errors: string[];
};

async function loadDashboardData(userId: string): Promise<DashboardData> {
  const errors: string[] = [];
  
  const [pinnedItems, recentItems, systemItemTypes, favoriteCollections, recentCollections, itemStats] =
    await Promise.all([
      getPinnedItems(userId).catch((error) => {
        console.error('Failed to fetch pinned items:', error);
        errors.push('pinned items');
        return [];
      }),
      getRecentItems(userId, DASHBOARD_RECENT_ITEMS_LIMIT).catch((error) => {
        console.error('Failed to fetch recent items:', error);
        errors.push('recent items');
        return [];
      }),
      getSystemItemTypesWithCounts(userId).catch((error) => {
        console.error('Failed to fetch system item types:', error);
        errors.push('item types');
        return [];
      }),
      getFavoriteCollections(userId).catch((error) => {
        console.error('Failed to fetch favorite collections:', error);
        errors.push('favorite collections');
        return [];
      }),
      getRecentCollections(userId, DASHBOARD_COLLECTIONS_LIMIT).catch((error) => {
        console.error('Failed to fetch recent collections:', error);
        errors.push('recent collections');
        return [];
      }),
      getItemStats(userId).catch((error) => {
        console.error('Failed to fetch item stats:', error);
        errors.push('item stats');
        return EMPTY_ITEM_STATS;
      }),
    ]);

  return { pinnedItems, recentItems, systemItemTypes, favoriteCollections, recentCollections, itemStats, errors };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Not signed in</div>;
  }

  let user: DashboardUser | null = null;

  try {
    user = await getUserById(session.user.id);
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center gap-4 h-64 text-muted-foreground'>
          <p>Unable to load dashboard. Please try again.</p>
          <Button asChild variant='default'>
            <Link href="/dashboard">Retry</Link>
          </Button>
        </div>
      </div>
    );
  }

  let data: DashboardData = {
    pinnedItems: [],
    recentItems: [],
    systemItemTypes: [],
    favoriteCollections: [],
    recentCollections: [],
    itemStats: EMPTY_ITEM_STATS,
    errors: [],
  };

  try {
    data = await loadDashboardData(user.id);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }

  return (
    <DashboardWrapper
      user={user}
      systemItemTypes={data.systemItemTypes}
      favoriteCollections={data.favoriteCollections}
      recentCollections={data.recentCollections}
    >
      <ItemDrawerProvider isPro={user.isPro}>
        <DashboardContent
          recentCollections={data.recentCollections}
          itemStats={data.itemStats}
          pinnedItems={data.pinnedItems}
          recentItems={data.recentItems}
          errors={data.errors}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
