import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth/auth';
import {
  getFavoriteCollections,
  getRecentCollections,
} from '@/lib/db/collections/collections';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';
import { isProOnlyItemType } from '@/lib/constants/limits';
import { getSafeReturnPath } from '@/lib/utils/safeReturn';
import type {
  SystemItemType,
  CollectionWithStats,
  DashboardUser,
} from '@/types/db';
import { DashboardWrapper } from '@/components/dashboard/dashboardWrapper/DashboardWrapper';
import { UpgradePlanPage } from '@/components/upgrade/upgradePlanPage/UpgradePlanPage';

export const metadata: Metadata = {
  title: 'Upgrade to Pro · DevStash',
  description: 'Upgrade to DevStash Pro for unlimited items, AI features, and file uploads.',
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; return?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  if (session.user.isPro) {
    redirect('/dashboard');
  }

  const { from, return: returnParam } = await searchParams;
  const returnPath = getSafeReturnPath(returnParam) ?? '/dashboard';

  const [systemItemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getSystemItemTypesWithCounts(session.user.id).catch(() => [] as SystemItemType[]),
    getFavoriteCollections(session.user.id).catch(() => [] as CollectionWithStats[]),
    getRecentCollections(session.user.id).catch(() => [] as CollectionWithStats[]),
  ]);

  const user: DashboardUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email || '',
    image: session.user.image ?? null,
    isPro: session.user.isPro,
  };

  let fromType: { name: string; color: string } | undefined;
  if (from && isProOnlyItemType(from)) {
    const matched = systemItemTypes.find((t) => t.name === from);
    if (matched) {
      fromType = { name: matched.name, color: matched.color };
    } else {
      fromType = { name: from, color: 'var(--color-file)' };
    }
  }

  return (
    <DashboardWrapper
      user={user}
      systemItemTypes={systemItemTypes}
      favoriteCollections={favoriteCollections}
      recentCollections={recentCollections}
    >
      <UpgradePlanPage fromType={fromType} returnPath={returnPath} />
    </DashboardWrapper>
  );
}
