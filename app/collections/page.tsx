import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import { getAllCollections } from '@/lib/db/collections/collections';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import type { CollectionWithStats, SystemItemType, DashboardUser } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { CollectionsPageContent } from '@/components/collections/collectionsPageContent/CollectionsPageContent';

export default async function CollectionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  let collections: CollectionWithStats[] = [];
  let systemItemTypes: SystemItemType[] = [];
  let hasError = false;

  try {
    [collections, systemItemTypes] = await Promise.all([
      getAllCollections(session.user.id),
      getSystemItemTypesWithCounts(session.user.id),
    ]);
  } catch (error) {
    console.error('Failed to load collections:', error);
    hasError = true;
  }

  const user: DashboardUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email || '',
    image: session.user.image ?? null,
    isPro: session.user.isPro,
  };

  return (
    <DashboardWrapper
      user={user}
      systemItemTypes={systemItemTypes}
      favoriteCollections={[]}
      recentCollections={[]}
    >
      <CollectionsPageContent
        collections={collections}
        hasError={hasError}
      />
    </DashboardWrapper>
  );
}
