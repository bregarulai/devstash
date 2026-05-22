import { DashboardWrapper } from './components/DashboardWrapper';
import { StatsCards } from './components/StatsCards';
import { CollectionsSession } from './components/CollectionsSession';
import { prisma } from '@/lib/prisma';

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

  return (
    <DashboardWrapper>
      <div className='space-y-6'>
        <StatsCards />
        <CollectionsSession user={user} />
      </div>
    </DashboardWrapper>
  );
}
