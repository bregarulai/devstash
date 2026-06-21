import { unstable_cache } from 'next/cache';
import { auth } from '@/lib/auth/auth/auth';
import { loadProfileDataAsync } from '@/lib/db/user/user';
import { SettingsPageClient } from '@/components/settings/settingsPageClient/SettingsPageClient';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { type SystemItemType, type CollectionWithStats, type PlanTier } from '@/types/db';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections/collections';
import { stripe, priceIdToPlan } from '@/lib/stripe/stripe';
import { redirect } from 'next/navigation';

const getCachedPlanTier = unstable_cache(
  async (subscriptionId: string): Promise<PlanTier> => {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0]?.price.id;
      return priceId ? (priceIdToPlan(priceId) ?? 'free') : 'free';
    } catch {
      return 'free';
    }
  },
  ['stripe-plan-tier'],
  { revalidate: 60, tags: ['stripe-subscription'] }
);

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const profileData = await loadProfileDataAsync(session.user.id);
  const user = profileData.user;

  if (!user) {
    redirect('/sign-in');
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
    console.error('Failed to load settings data:', error);
  }

  const hasPassword = user.hasPassword;

  let planTier: PlanTier = 'free';
  if (user.isPro && user.stripeSubscriptionId) {
    planTier = await getCachedPlanTier(user.stripeSubscriptionId);
  }

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
      <SettingsPageClient
        hasPassword={hasPassword}
        planTier={planTier}
        usage={{
          totalItems: profileData.itemStats.totalItems,
          totalCollections: profileData.itemStats.totalCollections,
        }}
      />
    </DashboardWrapper>
  );
}
