import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import {
  getItemsByTypeWithMeta,
  getSystemItemTypesWithCounts,
} from '@/lib/db/items/items';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { ItemsListContent } from '@/components/items/itemsListContent/ItemsListContent';

export async function generateStaticParams() {
  const types = await getSystemItemTypesWithCounts();
  return types.map((type) => ({ type: type.name }));
}

export default async function ItemsTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const { items, types, hasError } = await getItemsByTypeWithMeta(
    session.user.id,
    type,
  );

  const currentType = types.find((t) => t.name === type);

  if (!currentType) {
    notFound();
  }

  return (
    <DashboardWrapper
      user={{
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email || '',
        image: session.user.image ?? null,
        isPro: session.user.isPro,
      }}
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
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}
