import { prisma } from '@/lib/prisma/prisma';
import type { ProfileData, SidebarItemTypeBreakdown } from '@/types/db';


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
      },
    });

    if (!user) {
      return { ...defaultResult, errorType: 'user-not-found' };
    }

    const userWithPassword = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    const hasPassword = userWithPassword?.password !== null;

    let itemStats = {
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    };

    try {
      const { getItemStats } = await import('@/lib/db/items/items');
      itemStats = await getItemStats(user.id);
    } catch {
      itemStats = {
        totalItems: 0,
        totalCollections: 0,
        favoriteItems: 0,
        favoriteCollections: 0,
      };
    }

    let itemTypeBreakdown: SidebarItemTypeBreakdown[] = [];

    try {
      itemTypeBreakdown = await getUserItemTypeBreakdown(user.id);
    } catch {
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
  const types = await prisma.itemType.findMany({
    where: {
      isSystem: true,
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });

  const counts = await prisma.item.groupBy({
    by: ['itemTypeId'],
    _count: {
      id: true,
    },
    where: {
      userId,
    },
  });

  const countMap = new Map<string, number>();
  for (const c of counts) {
    countMap.set(c.itemTypeId, c._count.id);
  }

  return types.map((type) => ({
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: countMap.get(type.id) || 0,
  }));
}
