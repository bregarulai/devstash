import { DashboardWrapper } from './components/DashboardWrapper';
import { StatsCards } from './components/StatsCards';
import { PinnedItems } from './components/PinnedItems';
import { RecentItems } from './components/RecentItems';
import { RecentCollections } from './components/RecentCollections';

export default function DashboardPage() {
  return (
    <DashboardWrapper>
      <div className='space-y-6'>
        <StatsCards />
        <PinnedItems />
        <RecentItems />
        <RecentCollections />
      </div>
    </DashboardWrapper>
  );
}
