import { DashboardWrapper } from './components/DashboardWrapper';
import { StatsCards } from './components/StatsCards';
import { CollectionsSession } from './components/CollectionsSession';
import { PinnedItems } from './components/PinnedItems';
import { RecentItems } from './components/RecentItems';
import { prisma } from '@/lib/prisma';
import { getPinnedItems, getRecentItems } from '@/lib/db/items';

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
      <DashboardWrapper>
        <div className='flex items-center justify-center h-64 text-muted-foreground'>
          No user found. Please sign in to view the dashboard.
        </div>
      </DashboardWrapper>
    );
  }

  const [pinnedItems, recentItems] = await Promise.all([
    getPinnedItems(user.id),
    getRecentItems(user.id),
  ]);

  return (
    <DashboardWrapper>
      <div className='space-y-6'>
        <StatsCards userId={user.id} />
        <CollectionsSession user={user} />
        <PinnedItems items={pinnedItems} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardWrapper>
  );
}
