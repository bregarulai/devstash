import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import { getAllCollectionsPaginated } from '@/lib/db/collections/collections';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { COLLECTIONS_PER_PAGE } from '@/lib/db/constants/constants';
import type { SystemItemType, DashboardUser } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { CollectionsPageContent } from '@/components/collections/collectionsPageContent/CollectionsPageContent';

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const page = Math.max(1, Number(pageParam) || 1);

  let collections: Awaited<ReturnType<typeof getAllCollectionsPaginated>>['collections'] = [];
  let systemItemTypes: SystemItemType[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let hasError = false;

  try {
    const [collectionResult, types] = await Promise.all([
      getAllCollectionsPaginated(session.user.id, page, COLLECTIONS_PER_PAGE),
      getSystemItemTypesWithCounts(session.user.id),
    ]);

    collections = collectionResult.collections;
    totalCount = collectionResult.totalCount;
    totalPages = collectionResult.totalPages;
    systemItemTypes = types;
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
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        baseUrl="/collections"
        perPage={COLLECTIONS_PER_PAGE}
      />
    </DashboardWrapper>
  );
}
