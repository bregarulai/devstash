import { prisma } from '@/lib/prisma/prisma';
import { auth } from '@/lib/auth/auth/auth';
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
};

async function loadDashboardData(userId: string): Promise<DashboardData> {
  const [pinnedItems, recentItems, systemItemTypes, favoriteCollections, recentCollections, itemStats] =
    await Promise.all([
      getPinnedItems(userId).catch(() => []),
      getRecentItems(userId).catch(() => []),
      getSystemItemTypesWithCounts(userId).catch(() => []),
      getFavoriteCollections(userId).catch(() => []),
      getRecentCollections(userId).catch(() => []),
      getItemStats(userId).catch(() => EMPTY_ITEM_STATS),
    ]);

  return { pinnedItems, recentItems, systemItemTypes, favoriteCollections, recentCollections, itemStats };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="min-h-screen flex items-center justify-center">Not signed in</div>;
  }

  let user: DashboardUser | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPro: true,
      },
    });
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
      <ItemDrawerProvider>
        <DashboardContent
          user={user}
          recentCollections={data.recentCollections}
          itemStats={data.itemStats}
          pinnedItems={data.pinnedItems}
          recentItems={data.recentItems}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
