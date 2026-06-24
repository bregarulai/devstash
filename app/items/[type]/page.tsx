import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import { getItemsByTypeWithMetaPaginated } from '@/lib/db/items/items';
import { ITEMS_PER_PAGE } from '@/lib/db/constants/constants';
import { ITEM_TYPES } from '@/lib/constants';
import { isProOnlyItemType } from '@/lib/constants/limits';
import type { DashboardUser, SystemItemType } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { ItemsListContent } from '@/components/items/itemsListContent/ItemsListContent';

export async function generateStaticParams() {
  return ITEM_TYPES.map((type) => ({ type: type.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  return { title: `${type} items · DevStash` };
}

export default async function ItemsTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const page = Math.max(1, Number(pageParam) || 1);

  const user: DashboardUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email || '',
    image: session.user.image ?? null,
    isPro: session.user.isPro,
  };

  if (isProOnlyItemType(type) && !user.isPro) {
    redirect(`/upgrade?from=${encodeURIComponent(type)}&return=${encodeURIComponent(`/items/${type}`)}`);
  }

  let items: Awaited<ReturnType<typeof getItemsByTypeWithMetaPaginated>>['items'] = [];
  let types: SystemItemType[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let hasError = false;

  const result = await getItemsByTypeWithMetaPaginated(
    session.user.id,
    type,
    page,
    ITEMS_PER_PAGE,
  );
  items = result.items;
  types = result.types;
  totalCount = result.totalCount;
  totalPages = result.totalPages;
  hasError = result.hasError;

  const currentType = types.find((t) => t.name === type);

  if (!currentType) {
    notFound();
  }

  return (
    <DashboardWrapper
      user={user}
      systemItemTypes={types}
      favoriteCollections={[]}
      recentCollections={[]}
    >
      <ItemDrawerProvider>
        <ItemsListContent
          items={items}
          types={types}
          currentTypeName={type}
          hasError={hasError}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          baseUrl={`/items/${type}`}
          perPage={ITEMS_PER_PAGE}
          isPro={user.isPro}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
