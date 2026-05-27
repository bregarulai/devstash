import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  getPinnedItems,
  getRecentItems,
  getSystemItemTypesWithCounts,
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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="min-h-screen flex items-center justify-center">Not signed in</div>;
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
    },
  });

  if (!user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex items-center justify-center h-64 text-muted-foreground'>
          No user found. Please sign in to view the dashboard.
        </div>
      </div>
    );
  }

  const [
    pinnedItems,
    recentItems,
    systemItemTypes,
    favoriteCollections,
    recentCollections,
  ] = await Promise.all([
    getPinnedItems(user.id),
    getRecentItems(user.id),
    getSystemItemTypesWithCounts(),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id, 5),
  ]);

  return (
    <DashboardWrapper
      user={user}
      systemItemTypes={systemItemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      <div className='space-y-6'>
        <StatsCards userId={user.id} />
        <CollectionsSession user={user} />
        <PinnedItems items={pinnedItems} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardWrapper>
  );
}
