import { prisma } from '@/lib/prisma';

export interface ItemWithDetails {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  content: string | null;
  url: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getPinnedItems(
  userId: string,
): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      isPinned: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      itemType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function getRecentItems(
  userId: string,
  limit: number = 10,
): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
    include: {
      itemType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function getAllItems(
  userId: string,
  limit?: number,
): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    ...(limit ? { take: limit } : {}),
    include: {
      itemType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function getFavoriteItems(
  userId: string,
  limit?: number,
): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      isFavorite: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    ...(limit ? { take: limit } : {}),
    include: {
      itemType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function getItemsByType(
  userId: string,
  itemTypeName: string,
  limit?: number,
): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: {
        name: itemTypeName,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    ...(limit ? { take: limit } : {}),
    include: {
      itemType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function searchItems(
  userId: string,
  query: string,
): Promise<ItemWithDetails[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      itemType: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function getItemStats(userId: string): Promise<{
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);

  return {
    totalItems,
    totalCollections,
    favoriteItems,
    favoriteCollections,
  };
}

export interface SystemItemType {
  name: string;
  icon: string;
  color: string;
  itemCount: number;
}

export async function getSystemItemTypesWithCounts(): Promise<SystemItemType[]> {
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
    where: {},
  });

  const countMap = new Map<string, number>();
  for (const c of counts) {
    countMap.set(c.itemTypeId, c._count.id);
  }

  return types.map((type) => ({
    name: type.name,
    icon: type.icon,
    color: type.color,
    itemCount: countMap.get(type.id) || 0,
  }));
}
