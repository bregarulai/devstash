import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import {
  getAllCollectionsPaginated,
  getFavoriteCollections,
  getRecentCollections,
} from '@/lib/db/collections/collections';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { COLLECTIONS_PER_PAGE } from '@/lib/db/constants/constants';
import type {
  SystemItemType,
  DashboardUser,
  CollectionWithStats,
} from '@/types/db';
import type { SortOption } from '@/types/sort';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { CollectionsPageContent } from '@/components/collections/collectionsPageContent/CollectionsPageContent';

const VALID_SORTS: SortOption[] = [
  'newest',
  'oldest',
  'name-asc',
  'name-desc',
  'type',
];

function parseSort(value: string | undefined): SortOption | undefined {
  return value && VALID_SORTS.includes(value as SortOption)
    ? (value as SortOption)
    : undefined;
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
}) {
  const { page: pageParam, q, sort } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const search = q?.trim() || undefined;
  const sortBy = parseSort(sort);

  const errors: string[] = [];

  const [collectionResult, favoriteCollections, recentCollections, systemItemTypes] =
    await Promise.all([
      getAllCollectionsPaginated(
        session.user.id,
        page,
        COLLECTIONS_PER_PAGE,
        { search, sortBy },
      ).catch((error) => {
        console.error('Failed to load collections:', error);
        errors.push('collections');
        return {
          collections: [] as CollectionWithStats[],
          totalCount: 0,
          totalPages: 0,
        };
      }),
      getFavoriteCollections(session.user.id).catch((error) => {
        console.error('Failed to fetch favorite collections:', error);
        return [] as CollectionWithStats[];
      }),
      getRecentCollections(session.user.id).catch((error) => {
        console.error('Failed to fetch recent collections:', error);
        return [] as CollectionWithStats[];
      }),
      getSystemItemTypesWithCounts(session.user.id).catch((error) => {
        console.error('Failed to fetch system item types:', error);
        return [] as SystemItemType[];
      }),
    ]);

  const hasError = errors.includes('collections');

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
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      <CollectionsPageContent
        collections={collectionResult.collections}
        hasError={hasError}
        page={page}
        totalPages={collectionResult.totalPages}
        totalCount={collectionResult.totalCount}
        baseUrl='/collections'
        perPage={COLLECTIONS_PER_PAGE}
        search={search ?? ''}
        sort={sortBy ?? 'newest'}
      />
    </DashboardWrapper>
  );
}
