import type { ItemWithDetails, CollectionWithStats } from '@/types/db';
import type { SortOption } from '@/types/sort';

function compareDates(a: Date, b: Date, direction: 'asc' | 'desc'): number {
  const diff = a.getTime() - b.getTime();
  return direction === 'asc' ? diff : -diff;
}

function compareStrings(a: string, b: string, direction: 'asc' | 'desc'): number {
  const cmp = a.localeCompare(b);
  return direction === 'asc' ? cmp : -cmp;
}

export function sortItems(items: ItemWithDetails[], sort: SortOption): ItemWithDetails[] {
  const sorted = [...items];

  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => compareDates(a.createdAt, b.createdAt, 'desc'));
    case 'oldest':
      return sorted.sort((a, b) => compareDates(a.createdAt, b.createdAt, 'asc'));
    case 'name-asc':
      return sorted.sort((a, b) => compareStrings(a.title, b.title, 'asc'));
    case 'name-desc':
      return sorted.sort((a, b) => compareStrings(a.title, b.title, 'desc'));
    case 'type':
      return sorted.sort((a, b) => {
        const typeCmp = compareStrings(a.itemType.name, b.itemType.name, 'asc');
        return typeCmp !== 0 ? typeCmp : compareStrings(a.title, b.title, 'asc');
      });
    default:
      return sorted;
  }
}

export function sortCollections(collections: CollectionWithStats[], sort: SortOption): CollectionWithStats[] {
  const sorted = [...collections];

  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => compareDates(a.createdAt, b.createdAt, 'desc'));
    case 'oldest':
      return sorted.sort((a, b) => compareDates(a.createdAt, b.createdAt, 'asc'));
    case 'name-asc':
      return sorted.sort((a, b) => compareStrings(a.name, b.name, 'asc'));
    case 'name-desc':
      return sorted.sort((a, b) => compareStrings(a.name, b.name, 'desc'));
    case 'type':
      return sorted.sort((a, b) => {
        const countDiff = b.itemCount - a.itemCount;
        return countDiff !== 0 ? countDiff : compareStrings(a.name, b.name, 'asc');
      });
    default:
      return sorted;
  }
}
