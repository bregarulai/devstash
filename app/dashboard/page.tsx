import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  getPinnedItems,
  getRecentItems,
  getSystemItemTypesWithCounts,
  getItemStats,
} from '@/lib/db/items';
import {
  getFavoriteCollections,
  getRecentCollections,
} from '@/lib/db/collections';
import type { ItemWithDetails, SystemItemType, CollectionWithStats, ItemStats } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { DashboardContent } from '@/components/dashboard/dashboardContent/DashboardContent';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="min-h-screen flex items-center justify-center">Not signed in</div>;
  }

  let user: { id: string; name: string | null; email: string; image: string | null; isPro: boolean } | null = null;

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

  let pinnedItems: ItemWithDetails[] = [];
  let recentItems: ItemWithDetails[] = [];
  let systemItemTypes: SystemItemType[] = [];
  let favoriteCollections: CollectionWithStats[] = [];
  let recentCollections: CollectionWithStats[] = [];
  let itemStats: ItemStats = {
    totalItems: 0,
    totalCollections: 0,
    favoriteItems: 0,
    favoriteCollections: 0,
  };

  try {
    [
      pinnedItems,
      recentItems,
      systemItemTypes,
      favoriteCollections,
      recentCollections,
      itemStats,
    ] = await Promise.all([
      getPinnedItems(user.id).catch(() => []),
      getRecentItems(user.id).catch(() => []),
      getSystemItemTypesWithCounts().catch(() => []),
      getFavoriteCollections(user.id).catch(() => []),
      getRecentCollections(user.id, 5).catch(() => []),
      getItemStats(user.id).catch(() => ({
        totalItems: 0,
        totalCollections: 0,
        favoriteItems: 0,
        favoriteCollections: 0,
      })),
    ]);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }

  return (
    <DashboardWrapper
      user={user}
      systemItemTypes={systemItemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      <ItemDrawerProvider>
        <DashboardContent
          user={user}
          favoriteCollections={favoriteCollections}
          itemStats={itemStats}
          pinnedItems={pinnedItems}
          recentItems={recentItems}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
