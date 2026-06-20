import { prisma } from '@/lib/prisma/prisma';
import {
  DEFAULT_FAVORITE_LIMIT,
  DEFAULT_RECENT_COLLECTIONS_LIMIT,
  DEFAULT_SAMPLE_COUNT,
  COLLECTIONS_PER_PAGE,
} from '@/lib/db/constants/constants';
import type { CollectionWithStats, CollectionDetail, CollectionSelect, ItemWithDetails } from '@/types/db';

export type { CollectionWithStats, CollectionDetail };

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

export async function getAllCollectionsPaginated(
  userId: string,
  page: number,
  perPage: number = COLLECTIONS_PER_PAGE,
): Promise<{
  collections: CollectionWithStats[];
  totalCount: number;
  totalPages: number;
}> {
  const skip = (page - 1) * perPage;

  const [collections, totalCount] = await Promise.all([
    prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: perPage,
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
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  return {
    collections: collections.map(mapCollectionToStats),
    totalCount,
    totalPages,
  };
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

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: { name: string; description?: string | null },
): Promise<CollectionSelect | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!existing) {
    return null;
  }

  const collection = await prisma.collection.update({
    where: { id: collectionId },
    data: {
      name: data.name,
      description: data.description ?? null,
    },
  });

  return collection;
}

export async function deleteCollection(
  userId: string,
  collectionId: string,
): Promise<boolean> {
  const { count } = await prisma.collection.deleteMany({
    where: { id: collectionId, userId },
  });

  return count > 0;
}

export async function toggleCollectionFavorite(
  userId: string,
  collectionId: string,
  isFavorite: boolean,
): Promise<CollectionSelect | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!existing) {
    return null;
  }

  const collection = await prisma.collection.update({
    where: { id: collectionId },
    data: { isFavorite },
  });

  return collection;
}

export async function getCollectionById(
  userId: string,
  collectionId: string,
): Promise<CollectionDetail | null> {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        include: {
          item: {
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
              collections: {
                select: {
                  collection: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!collection) {
    return null;
  }

  const stats = mapCollectionToStats(collection);
  const items: ItemWithDetails[] = collection.items
    .map((ic) => ic.item)
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item) => ({
      ...item,
      collections: item.collections.map((ic) => ({
        id: ic.collection.id,
        name: ic.collection.name,
      })),
    })) as ItemWithDetails[];

  return {
    ...stats,
    items,
  };
}

export async function getCollectionByIdPaginated(
  userId: string,
  collectionId: string,
  page: number,
  perPage: number = COLLECTIONS_PER_PAGE,
): Promise<{
  collection: CollectionDetail | null;
  totalCount: number;
  totalPages: number;
  hasError: boolean;
}> {
  let collection: CollectionDetail | null = null;
  let totalCount = 0;
  let hasError = false;

  const skip = (page - 1) * perPage;

  try {
    const dbCollection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId,
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          skip,
          take: perPage,
          include: {
            item: {
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
                collections: {
                  select: {
                    collection: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (dbCollection) {
      const stats = mapCollectionToStats(dbCollection);
      const items: ItemWithDetails[] = dbCollection.items
        .map((ic) => ic.item)
        .filter((item): item is NonNullable<typeof item> => item != null)
        .map((item) => ({
          ...item,
          collections: item.collections.map((ic) => ({
            id: ic.collection.id,
            name: ic.collection.name,
          })),
        })) as ItemWithDetails[];

      collection = {
        ...stats,
        items,
      };

      totalCount = dbCollection._count.items;
    }
  } catch (error) {
    console.error('Failed to load collection by id:', error);
    hasError = true;
  }

  const totalPages = Math.ceil(totalCount / perPage);

  return { collection, totalCount, totalPages, hasError };
}
