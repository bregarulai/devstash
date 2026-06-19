import { prisma } from '@/lib/prisma/prisma';
import { DEFAULT_RECENT_LIMIT } from '@/lib/db/constants/constants';
import { deleteFromR2, extractR2Key } from '@/lib/r2';
import type { ItemWithDetails, SystemItemType, ItemEditValues, ItemCreateValues, ItemStats } from '@/types/db';

export async function createItem(
  userId: string,
  data: ItemCreateValues,
): Promise<ItemWithDetails> {
  const itemType = await prisma.itemType.findFirst({
    where: { name: data.itemType, isSystem: true },
  });
  if (!itemType) {
    throw new Error(`Item type "${data.itemType}" not found`);
  }

  const tagNames = data.tags ?? [];

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      contentType: data.itemType === 'link' ? 'URL' : data.itemType === 'file' || data.itemType === 'image' ? 'FILE' : 'TEXT',
      content: !['link', 'file', 'image'].includes(data.itemType) ? (data.content ?? null) : null,
      url: data.itemType === 'link' ? (data.url ?? null) : null,
      fileUrl: (data.itemType === 'file' || data.itemType === 'image') ? (data.fileUrl ?? null) : null,
      fileName: (data.itemType === 'file' || data.itemType === 'image') ? (data.fileName ?? null) : null,
      fileSize: (data.itemType === 'file' || data.itemType === 'image') ? (data.fileSize ?? null) : null,
      language: data.language ?? null,
      userId,
      itemTypeId: itemType.id,
      tags: {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
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

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function deleteItem(
  itemId: string,
  userId: string,
): Promise<boolean> {
  const item = await prisma.item.findUnique({
    where: { id: itemId, userId },
    select: { fileUrl: true },
  });

  if (item?.fileUrl) {
    const r2Key = extractR2Key(item.fileUrl);
    if (r2Key) {
      await deleteFromR2(r2Key).catch(console.error);
    }
  }

  await prisma.item.delete({
    where: { id: itemId, userId },
  });
  return true;
}

export type { SystemItemType };

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

  return items;
}

export async function getRecentItems(
  userId: string,
  limit: number = DEFAULT_RECENT_LIMIT,
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

  return items;
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

  return items;
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

  return items;
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

  return items;
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

  return items;
}

export async function getItemStats(userId: string): Promise<ItemStats> {
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

export async function getSystemItemTypesWithCounts(userId?: string): Promise<SystemItemType[]> {
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
    where: userId ? { userId } : {},
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

export async function getItemsByTypeWithMeta(
  userId: string,
  itemTypeName: string,
): Promise<{
  items: ItemWithDetails[];
  types: SystemItemType[];
  hasError: boolean;
}> {
  let items: ItemWithDetails[] = [];
  let types: SystemItemType[] = [];
  let hasError = false;

  try {
    [items, types] = await Promise.all([
      getItemsByType(userId, itemTypeName).catch(() => []),
      getSystemItemTypesWithCounts(userId).catch(() => []),
    ]);
  } catch (error) {
    console.error('Failed to load items by type:', error);
    hasError = true;
  }

  return { items, types, hasError };
}

export async function updateItem(
  itemId: string,
  userId: string,
  data: ItemEditValues,
): Promise<ItemWithDetails> {
  const tagNames = data.tags ?? [];

  const item = await prisma.item.update({
    where: { id: itemId, userId },
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url === '' ? null : data.url ?? null,
      language: data.language ?? null,
      tags: {
        set: [],
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
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

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
