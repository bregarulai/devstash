'use server';

import { auth } from '@/lib/auth/auth/auth';
import { getAllItems } from '@/lib/db/items/items';
import { getAllCollections } from '@/lib/db/collections/collections';
import type { ItemWithDetails, CollectionWithStats } from '@/types/db';

export type SearchData = {
  items: ItemWithDetails[];
  collections: CollectionWithStats[];
};

export async function getSearchData(): Promise<SearchData> {
  const session = await auth();
  if (!session?.user?.id) {
    return { items: [], collections: [] };
  }

  const [items, collections] = await Promise.all([
    getAllItems(session.user.id).catch(() => []),
    getAllCollections(session.user.id).catch(() => []),
  ]);

  return { items, collections };
}
