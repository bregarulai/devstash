import { auth } from '@/lib/auth';
import { loadProfileDataAsync } from '@/lib/db/user';
import { ProfilePageClient } from '@/components/profile/profilePageClient/ProfilePageClient';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { getSystemItemTypesWithCounts, SystemItemType } from '@/lib/db/items';
import { CollectionWithStats, getFavoriteCollections, getRecentCollections } from '@/lib/db/collections';
import { ProfileRetryForm } from '@/components/profile/profileRetryForm/ProfileRetryForm';
import { ProfileErrorState } from '@/components/profile/profileErrorState/ProfileErrorState';
import { ProfilePageLoading } from '@/components/profile/profilePageLoading/ProfilePageLoading';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <p className="text-lg">Sign in to view your profile</p>
        </div>
      </div>
    );
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
      getSystemItemTypesWithCounts(),
      getFavoriteCollections(user.id),
      getRecentCollections(user.id, 5),
    ]);
    systemItemTypes = types;
    favoriteCollections = favs;
    recentCollections = recents;
  } catch (error) {
    console.error('Failed to load profile data:', error);
  }

  const hasPassword = user.password !== null;

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
