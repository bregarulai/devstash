'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, Folder, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn, formatDaysAgo } from '@/lib/utils/utils';
import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { SortControls, type SortOption } from '@/components/favorites/sortControls/SortControls';
import { sortItems, sortCollections } from '@/lib/utils/sort';
import { toggleItemFavoriteAction } from '@/actions/items/Items';
import { toggleCollectionFavoriteAction } from '@/actions/collections/Collections';
import type { ItemWithDetails, CollectionWithStats } from '@/types/db';

const itemTypeColorMap: Record<string, string> = {
  snippet: 'border-snippet/50 text-snippet',
  prompt: 'border-prompt/50 text-prompt',
  command: 'border-command/50 text-command',
  note: 'border-note/50 text-note',
  file: 'border-file/50 text-file',
  image: 'border-image/50 text-image',
  link: 'border-link/50 text-link',
};

interface FavoritesPageContentProps {
  favoriteItems: ItemWithDetails[];
  favoriteCollections: CollectionWithStats[];
  hasError: boolean;
}

export function FavoritesPageContent({
  favoriteItems,
  favoriteCollections,
  hasError,
}: FavoritesPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openDrawer } = useItemDrawer();

  const itemsSortParam = searchParams.get('itemsSort') as SortOption | null;
  const collectionsSortParam = searchParams.get('collectionsSort') as SortOption | null;
  const [itemsSort, setItemsSort] = useState<SortOption>(itemsSortParam ?? 'newest');
  const [collectionsSort, setCollectionsSort] = useState<SortOption>(collectionsSortParam ?? 'newest');
  const [localItems, setLocalItems] = useState<ItemWithDetails[]>(favoriteItems);
  const [localCollections, setLocalCollections] = useState<CollectionWithStats[]>(favoriteCollections);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [togglingCollectionId, setTogglingCollectionId] = useState<string | null>(null);

  const updateSortParam = useCallback(
    (key: string, value: SortOption) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`/favorites?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleItemsSortChange = (value: SortOption) => {
    setItemsSort(value);
    updateSortParam('itemsSort', value);
  };

  const handleCollectionsSortChange = (value: SortOption) => {
    setCollectionsSort(value);
    updateSortParam('collectionsSort', value);
  };

  const sortedItems = useMemo(() => sortItems(localItems, itemsSort), [localItems, itemsSort]);
  const sortedCollections = useMemo(() => sortCollections(localCollections, collectionsSort), [localCollections, collectionsSort]);

  const handleToggleItemFavorite = useCallback(async (item: ItemWithDetails) => {
    setTogglingItemId(item.id);
    const previousItems = localItems;
    setLocalItems((prev) => prev.filter((i) => i.id !== item.id));

    try {
      const result = await toggleItemFavoriteAction(item.id);
      if (!result.success) throw new Error(result.error ?? 'Failed to unfavorite');
      toast.success('Removed from favorites');
    } catch {
      setLocalItems(previousItems);
      toast.error('Failed to unfavorite item');
    } finally {
      setTogglingItemId(null);
    }
  }, [localItems]);

  const handleToggleCollectionFavorite = useCallback(async (collection: CollectionWithStats) => {
    setTogglingCollectionId(collection.id);
    const previousCollections = localCollections;
    setLocalCollections((prev) => prev.filter((c) => c.id !== collection.id));

    try {
      const result = await toggleCollectionFavoriteAction(collection.id, { isFavorite: false });
      if (!result.success) throw new Error(result.error ?? 'Failed to unfavorite');
      toast.success('Removed from favorites');
    } catch {
      setLocalCollections(previousCollections);
      toast.error('Failed to unfavorite collection');
    } finally {
      setTogglingCollectionId(null);
    }
  }, [localCollections]);

  return (
    <div className='flex flex-1 flex-col gap-6'>
      {hasError && (
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>Failed to load favorites. Please try again.</p>
          <Button
            variant='link'
            size='sm'
            onClick={() => router.refresh()}
            className='ml-auto'
          >
            Retry
          </Button>
        </div>
      )}

      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50'>
          <Star className='h-5 w-5 text-favorite' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Favorites</h1>
        </div>
      </div>

      {localItems.length === 0 && localCollections.length === 0 ? (
        <Empty>
          <EmptyMedia variant='icon'>
            <Star className='h-5 w-5 text-muted-foreground' />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No favorites yet</EmptyTitle>
            <EmptyDescription>
              Star items and collections to see them here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='space-y-6'>
          {localItems.length > 0 && (
            <div>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-sm font-medium text-muted-foreground'>Items</h2>
                  <Badge variant='secondary' className='text-xs'>
                    {localItems.length}
                  </Badge>
                </div>
                <SortControls value={itemsSort} onChange={handleItemsSortChange} />
              </div>
              <div className='space-y-1 text-sm'>
                {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    role='button'
                    tabIndex={0}
                    onClick={() => openDrawer(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDrawer(item.id);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer',
                      'hover:bg-muted/50 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    )}
                  >
                    <ItemTypeIcon type={item.itemType.name} className='h-4 w-4' />
                    <span className='flex-1 truncate font-medium'>{item.title}</span>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-xs shrink-0',
                        itemTypeColorMap[item.itemType.name] || 'border-border text-foreground'
                      )}
                    >
                      {item.itemType.name}
                    </Badge>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      {formatDaysAgo(item.updatedAt)}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItemFavorite(item);
                      }}
                      disabled={togglingItemId === item.id}
                      aria-label='Remove from favorites'
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          'fill-favorite text-favorite'
                        )}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {localCollections.length > 0 && (
            <div>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-sm font-medium text-muted-foreground'>Collections</h2>
                  <Badge variant='secondary' className='text-xs'>
                    {localCollections.length}
                  </Badge>
                </div>
                <SortControls value={collectionsSort} onChange={handleCollectionsSortChange} />
              </div>
              <div className='space-y-1 text-sm'>
                {sortedCollections.map((collection) => (
                  <div
                    key={collection.id}
                    role='button'
                    tabIndex={0}
                    onClick={() => router.push(`/collections/${collection.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/collections/${collection.id}`);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer',
                      'hover:bg-muted/50 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    )}
                  >
                    <Folder className='h-4 w-4 text-muted-foreground' />
                    <span className='flex-1 truncate font-medium'>{collection.name}</span>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      {formatDaysAgo(collection.createdAt)}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCollectionFavorite(collection);
                      }}
                      disabled={togglingCollectionId === collection.id}
                      aria-label='Remove from favorites'
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          'fill-favorite text-favorite'
                        )}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
