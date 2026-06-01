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
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { StatsCards } from '@/components/dashboard/statsCards/StatsCards';
import { CollectionsSession } from '@/components/dashboard/collectionSession/CollectionsSession';
import { PinnedItems } from '@/components/dashboard/pinnedItems/PinnedItems';
import { RecentItems } from '@/components/dashboard/recentItems/RecentItems';
import { DashboardDataRetry } from '@/components/dashboard/dashboardDataRetry/DashboardDataRetry';
import { GetStartedHero } from '@/components/dashboard/getStartedHero/GetStartedHero';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { KeyboardHint } from '@/components/dashboard/keyboardHint/KeyboardHint';

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

  let pinnedItems: Awaited<ReturnType<typeof getPinnedItems>> = [];
  let recentItems: Awaited<ReturnType<typeof getRecentItems>> = [];
  let systemItemTypes: Awaited<ReturnType<typeof getSystemItemTypesWithCounts>> = [];
  let favoriteCollections: Awaited<ReturnType<typeof getFavoriteCollections>> = [];
  let recentCollections: Awaited<ReturnType<typeof getRecentCollections>> = [];
  let itemStats: Awaited<ReturnType<typeof getItemStats>> = {
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
              <CollectionsSession user={user} collections={favoriteCollections} />
              <PinnedItems items={pinnedItems} />
              <RecentItems items={recentItems} />
            </>
          )}
        </div>
      </DashboardDataRetry>
    </DashboardWrapper>
  );
}
