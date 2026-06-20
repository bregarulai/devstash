import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import { getCollectionByIdPaginated } from '@/lib/db/collections/collections';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { COLLECTIONS_PER_PAGE } from '@/lib/db/constants/constants';
import type { DashboardUser, SystemItemType, CollectionDetail } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { CollectionItemsContent } from '@/components/collections/collectionItemsContent/CollectionItemsContent';

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const page = Math.max(1, Number(pageParam) || 1);

  let collection: CollectionDetail | null = null;
  let systemItemTypes: SystemItemType[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let hasError = false;

  try {
    const [collectionResult, types] = await Promise.all([
      getCollectionByIdPaginated(session.user.id, id, page, COLLECTIONS_PER_PAGE),
      getSystemItemTypesWithCounts(session.user.id),
    ]);

    collection = collectionResult.collection;
    totalCount = collectionResult.totalCount;
    totalPages = collectionResult.totalPages;
    hasError = collectionResult.hasError;
    systemItemTypes = types;
  } catch {
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
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          baseUrl={`/collections/${id}`}
          perPage={COLLECTIONS_PER_PAGE}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
