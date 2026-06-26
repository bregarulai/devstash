import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import {
  getCollectionByIdPaginated,
  getFavoriteCollections,
  getRecentCollections,
} from '@/lib/db/collections/collections';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import {
  COLLECTIONS_PER_PAGE,
  DEFAULT_RECENT_COLLECTIONS_LIMIT,
} from '@/lib/db/constants/constants';
import type {
  DashboardUser,
  SystemItemType,
  CollectionDetail,
  CollectionWithStats,
} from '@/types/db';
import type { SortOption } from '@/types/sort';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { CollectionItemsContent } from '@/components/collections/collectionItemsContent/CollectionItemsContent';

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

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam, q, sort } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const page = Math.max(1, Number(pageParam) || 1);
  const search = q?.trim() || undefined;
  const sortBy = parseSort(sort);

  let collection: CollectionDetail | null = null;
  let systemItemTypes: SystemItemType[] = [];
  let favoriteCollections: CollectionWithStats[] = [];
  let recentCollections: CollectionWithStats[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let hasError = false;

  try {
    const [collectionResult, types, favorites, recent] = await Promise.all([
      getCollectionByIdPaginated(
        session.user.id,
        id,
        page,
        COLLECTIONS_PER_PAGE,
        { search, sortBy },
      ),
      getSystemItemTypesWithCounts(session.user.id),
      getFavoriteCollections(session.user.id).catch((error) => {
        console.error('Failed to fetch favorite collections:', error);
        return [] as CollectionWithStats[];
      }),
      getRecentCollections(session.user.id).catch((error) => {
        console.error('Failed to fetch recent collections:', error);
        return [] as CollectionWithStats[];
      }),
    ]);

    collection = collectionResult.collection;
    totalCount = collectionResult.totalCount;
    totalPages = collectionResult.totalPages;
    hasError = collectionResult.hasError;
    systemItemTypes = types;
    favoriteCollections = favorites;
    recentCollections = recent;
  } catch {
    hasError = true;
  }

  if (!collection && !hasError) {
    notFound();
  }

  if (collection && totalPages > 0 && page > totalPages) {
    const params = new URLSearchParams();
    params.set('page', String(totalPages));
    if (search) params.set('q', search);
    if (sortBy) params.set('sort', sortBy);
    redirect(`/collections/${id}?${params.toString()}`);
  }

  const recentWithCurrent = collection
    ? [
        collection,
        ...recentCollections.filter((r) => r.id !== collection.id),
      ]
        .slice(0, DEFAULT_RECENT_COLLECTIONS_LIMIT)
        .map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          itemCount: r.itemCount,
          isFavorite: r.isFavorite,
          itemTypeNames: r.itemTypeNames,
          dominantItemTypeColor: r.dominantItemTypeColor,
          contentTypeCounts: r.contentTypeCounts,
          createdAt: r.createdAt,
        }))
    : recentCollections;

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
      recentCollections={recentWithCurrent}
    >
      <ItemDrawerProvider isPro={user.isPro}>
        <CollectionItemsContent
          collection={collection}
          hasError={hasError}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          baseUrl={`/collections/${id}`}
          perPage={COLLECTIONS_PER_PAGE}
          search={search ?? ''}
          sort={sortBy ?? 'newest'}
          systemItemTypes={systemItemTypes}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
