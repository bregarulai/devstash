import { auth } from '@/lib/auth/auth/auth';
import { loadProfileDataAsync } from '@/lib/db/user/user';
import { SettingsPageClient } from '@/components/settings/settingsPageClient/SettingsPageClient';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { SystemItemType, CollectionWithStats } from '@/types/db';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections/collections';
import { stripe, priceIdToPlan } from '@/lib/stripe/stripe';
import { redirect } from 'next/navigation';

type PlanTier = 'free' | 'monthly' | 'yearly';

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
    try {
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const priceId = sub.items.data[0]?.price.id;
      planTier = priceId ? (priceIdToPlan(priceId) ?? 'free') : 'free';
    } catch (error) {
      console.error('Failed to retrieve Stripe subscription:', error);
      planTier = 'free';
    }
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
