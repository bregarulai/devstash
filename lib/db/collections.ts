import { prisma } from '@/lib/prisma';


export interface CollectionWithStats {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  isFavorite: boolean;
  itemTypeNames: string[];
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
      .filter((type): type is { name: string } => type != null);
    const distinctNames = Array.from(
      new Set(itemTypes.map((type) => type.name)),
    );

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
      .filter((type): type is { name: string } => type != null);
    const distinctNames = Array.from(
      new Set(itemTypes.map((type) => type.name)),
    );

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
      .filter((type): type is { name: string } => type != null);
    const distinctNames = Array.from(
      new Set(itemTypes.map((type) => type.name)),
    );

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
      contentTypeCounts,
      createdAt: collection.createdAt,
    };
  });
}
