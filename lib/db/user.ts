import { prisma } from '@/lib/prisma';
import { getInitials } from '@/lib/utils';

export interface ItemTypeBreakdown {
  name: string;
  icon: string;
  color: string;
  count: number;
}

export type ProfileErrorType = 'db-failure' | 'user-not-found' | null;

export interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isPro: boolean;
    createdAt: Date;
    password: string | null;
  } | null;
  itemStats: {
    totalItems: number;
    totalCollections: number;
    favoriteItems: number;
    favoriteCollections: number;
  };
  itemTypeBreakdown: ItemTypeBreakdown[];
  errorType: ProfileErrorType;
}

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

    let itemStats = {
      totalItems: 0,
      totalCollections: 0,
      favoriteItems: 0,
      favoriteCollections: 0,
    };

    try {
      const { getItemStats } = await import('@/lib/db/items');
      itemStats = await getItemStats(user.id);
    } catch {
      itemStats = {
        totalItems: 0,
        totalCollections: 0,
        favoriteItems: 0,
        favoriteCollections: 0,
      };
    }

    let itemTypeBreakdown: ItemTypeBreakdown[] = [];

    try {
      itemTypeBreakdown = await getUserItemTypeBreakdown(user.id);
    } catch {
      itemTypeBreakdown = [];
    }

    return {
      user,
      itemStats,
      itemTypeBreakdown,
      errorType: null,
    };
  } catch {
    return { ...defaultResult, errorType: 'db-failure' };
  }
}

export async function getUserItemTypeBreakdown(userId: string): Promise<ItemTypeBreakdown[]> {
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
