import { DashboardWrapper } from './components/DashboardWrapper';
import { StatsCards } from './components/StatsCards';
import { CollectionsSession } from './components/CollectionsSession';
import { PinnedItems } from './components/PinnedItems';
import { RecentItems } from './components/RecentItems';
import { prisma } from '@/lib/prisma';
import { getPinnedItems, getRecentItems, getSystemItemTypesWithCounts } from '@/lib/db/items';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections';

export default async function DashboardPage() {
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
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

  const [pinnedItems, recentItems, systemItemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getPinnedItems(user.id),
    getRecentItems(user.id),
    getSystemItemTypesWithCounts(),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id, 5),
  ]);

  return (
    <DashboardWrapper user={user} systemItemTypes={systemItemTypes} favoriteCollections={favoriteCollections} recentCollections={recentCollections}>
      <div className='space-y-6'>
        <StatsCards userId={user.id} />
        <CollectionsSession user={user} />
        <PinnedItems items={pinnedItems} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardWrapper>
  );
}
