import { auth } from '@/lib/auth/auth/auth';
import { loadProfileDataAsync } from '@/lib/db/user/user';
import { ProfilePageClient } from '@/components/profile/profilePageClient/ProfilePageClient';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { SystemItemType, CollectionWithStats } from '@/types/db';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections/collections';
import { ProfileErrorState } from '@/components/profile/profileErrorState/ProfileErrorState';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const profileData = await loadProfileDataAsync(session.user.id);
  const user = profileData.user;

  if (!user) {
    return <ProfileErrorState errorType="user-not-found" />;
  }

  let systemItemTypes: SystemItemType[] = [];
  let favoriteCollections: CollectionWithStats[] = [];
  let recentCollections: CollectionWithStats[] = [];

  try {
    const [types, favs, recents] = await Promise.all([
      getSystemItemTypesWithCounts(user.id),
      getFavoriteCollections(user.id),
      getRecentCollections(user.id, 5),
    ]);
    systemItemTypes = types;
    favoriteCollections = favs;
    recentCollections = recents;
  } catch (error) {
    console.error('Failed to load profile data:', error);
  }

  const hasPassword = user.hasPassword;

  return (
    <DashboardWrapper
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        isPro: user.isPro,
      }}
      systemItemTypes={systemItemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      <ProfilePageClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          isPro: user.isPro,
          createdAt: user.createdAt,
        }}
        itemStats={profileData.itemStats}
        itemTypeBreakdown={profileData.itemTypeBreakdown}
        hasPassword={hasPassword}
      />
    </DashboardWrapper>
  );
}
