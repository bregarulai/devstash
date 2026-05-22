import { prisma } from '@/lib/prisma';

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


export interface CollectionWithStats {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  isFavorite: boolean;
  itemTypeNames: string[];
  dominantItemTypeColor: string;
  contentTypeCounts: Record<string, number>;
  createdAt: Date;
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
    take: 10,
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

  return collections.map((collection) => {
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
  });
}

export async function getRecentCollections(
  userId: string,
  limit: number = 10,
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

  return collections.map((collection) => {
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
  });
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

  return collections.map((collection) => {
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
  });
}
