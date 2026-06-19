import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import { getCollectionById } from '@/lib/db/collections/collections';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import type { DashboardUser, SystemItemType, CollectionDetail } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { CollectionItemsContent } from '@/components/collections/collectionItemsContent/CollectionItemsContent';

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  let collection: CollectionDetail | null = null;
  let systemItemTypes: SystemItemType[] = [];
  let hasError = false;

  try {
    [collection, systemItemTypes] = await Promise.all([
      getCollectionById(session.user.id, id),
      getSystemItemTypesWithCounts(session.user.id),
    ]);
  } catch (error) {
    console.error('Failed to load collection:', error);
    hasError = true;
  }

  if (!collection && !hasError) {
    notFound();
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
      <ItemDrawerProvider>
        <CollectionItemsContent
          collection={collection}
          hasError={hasError}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
