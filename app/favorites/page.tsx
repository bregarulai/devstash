import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import { getFavoriteItems, getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { getFavoriteCollections } from '@/lib/db/collections/collections';
import type { SystemItemType, DashboardUser, ItemWithDetails, CollectionWithStats } from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { ItemDrawerProvider } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemDrawer } from '@/components/items/itemDrawer/ItemDrawer';
import { FavoritesPageContent } from '@/components/favorites/favoritesPageContent/FavoritesPageContent';

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  let favoriteItems: ItemWithDetails[] = [];
  let favoriteCollections: CollectionWithStats[] = [];
  let systemItemTypes: SystemItemType[] = [];
  let hasError = false;

  try {
    const [items, collections, types] = await Promise.all([
      getFavoriteItems(session.user.id),
      getFavoriteCollections(session.user.id),
      getSystemItemTypesWithCounts(session.user.id),
    ]);

    favoriteItems = items;
    favoriteCollections = collections;
    systemItemTypes = types;
  } catch (error) {
    console.error('Failed to load favorites:', error);
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
      <ItemDrawerProvider>
        <FavoritesPageContent
          favoriteItems={favoriteItems}
          favoriteCollections={favoriteCollections}
          hasError={hasError}
        />
        <ItemDrawer />
      </ItemDrawerProvider>
    </DashboardWrapper>
  );
}