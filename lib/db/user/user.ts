import { prisma } from '@/lib/prisma/prisma';
import type { ProfileData, SidebarItemTypeBreakdown } from '@/types/db';
import { getSystemItemTypesWithCounts } from '@/lib/db/items/items';


export type ProfileErrorType = 'db-failure' | 'user-not-found' | null;

export async function loadProfileDataAsync(userId: string): Promise<ProfileData> {
  const defaultResult: ProfileData = {
    user: null,
    itemStats: {
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    },
    itemTypeBreakdown: [],
    errorType: null,
  };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPro: true,
        createdAt: true,
        password: true,
      },
    });

    if (!user) {
      return { ...defaultResult, errorType: 'user-not-found' };
    }

    const hasPassword = user?.password !== null;

    let itemStats = {
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    };

    let itemTypeBreakdown: SidebarItemTypeBreakdown[] = [];

    try {
      const { getItemStats } = await import('@/lib/db/items/items');
      const [stats, breakdown] = await Promise.all([
        getItemStats(user.id),
        getUserItemTypeBreakdown(user.id),
      ]);
      itemStats = stats;
      itemTypeBreakdown = breakdown;
    } catch {
      itemStats = {
        totalItems: 0,
        totalCollections: 0,
        favoriteItems: 0,
        favoriteCollections: 0,
      };
      itemTypeBreakdown = [];
    }

    return {
      user: { ...user, hasPassword },
      itemStats,
      itemTypeBreakdown,
      errorType: null,
    };
  } catch {
    return { ...defaultResult, errorType: 'db-failure' };
  }
}

export async function getUserItemTypeBreakdown(userId: string): Promise<SidebarItemTypeBreakdown[]> {
  const types = await getSystemItemTypesWithCounts(userId);
  return types.map((type) => ({
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: type.itemCount,
  }));
}
