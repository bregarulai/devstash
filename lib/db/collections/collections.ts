import { prisma } from '@/lib/prisma/prisma';
import {
  DEFAULT_FAVORITE_LIMIT,
  DEFAULT_SAMPLE_COUNT,
  DEFAULT_RECENT_COLLECTIONS_LIMIT,
} from '@/lib/db/constants/constants';
import type { CollectionWithStats, CollectionSelect } from '@/types/db';

export type { CollectionWithStats };

function getDominantItemTypeColor(
  itemTypes: Array<{ name: string; color: string }>,
): string {
  const colorCounts = new Map<string, number>();

  for (const itemType of itemTypes) {
    const count = colorCounts.get(itemType.color) || 0;
    colorCounts.set(itemType.color, count + 1);
  }

  let dominantColor = '';
  let maxCount = 0;
  for (const [color, count] of colorCounts) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }

  return dominantColor;
}

function mapCollectionToStats(collection: {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
  _count: { items: number };
  items: Array<{
    item: {
      contentType: string | null;
      itemType: { name: string; color: string } | null;
    } | null;
  }>;
}): CollectionWithStats {
  const itemTypes = collection.items
    .map((ic) => ic.item?.itemType)
    .filter((type): type is { name: string; color: string } => type != null);
  const distinctNames = Array.from(
    new Set(itemTypes.map((type) => type.name)),
  );

  const dominantColor = getDominantItemTypeColor(itemTypes);

  const contentTypes = collection.items
    .map((ic) => ic.item?.contentType)
    .filter(Boolean) as string[];
  const contentTypeCounts: Record<string, number> = {};
  for (const ct of contentTypes) {
    contentTypeCounts[ct] = (contentTypeCounts[ct] || 0) + 1;
  }

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    itemCount: collection._count.items,
    isFavorite: collection.isFavorite,
    itemTypeNames: distinctNames,
    dominantItemTypeColor: dominantColor,
    contentTypeCounts,
    createdAt: collection.createdAt,
  };
}


export async function getFavoriteCollections(
  userId: string,
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where: {
      userId,
      isFavorite: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: DEFAULT_FAVORITE_LIMIT,
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        take: DEFAULT_SAMPLE_COUNT,
        include: {
          item: {
            include: {
              itemType: {
                select: {
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return collections.map(mapCollectionToStats);
}

export async function getRecentCollections(
  userId: string,
  limit: number = DEFAULT_RECENT_COLLECTIONS_LIMIT,
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        take: DEFAULT_SAMPLE_COUNT,
        include: {
          item: {
            include: {
              itemType: {
                select: {
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return collections.map(mapCollectionToStats);
}

export async function getAllCollections(
  userId: string,
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        take: 5,
        include: {
          item: {
            include: {
              itemType: {
                select: {
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return collections.map(mapCollectionToStats);
}

export async function getUserCollectionList(
  userId: string,
): Promise<{ id: string; name: string }[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return collections;
}

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null },
): Promise<CollectionSelect> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
  });

  return collection;
}
