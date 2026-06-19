'use client';

import { useMemo } from 'react';
import { AlertCircle, FolderOpen } from 'lucide-react';
import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemCard } from '@/components/items/itemCard/ItemCard';
import { ImageCard } from '@/components/items/imageCard/ImageCard';
import { FileListRow } from '@/components/items/fileListRow/FileListRow';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { CollectionActions } from '@/components/collections/collectionActions/CollectionActions';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { CollectionDetail, ItemWithDetails } from '@/types/db';

interface CollectionItemsContentProps {
  collection: CollectionDetail | null;
  hasError: boolean;
}

interface GroupedItems {
  typeName: string;
  typeColor: string;
  items: ItemWithDetails[];
}

export function CollectionItemsContent({
  collection,
  hasError,
}: CollectionItemsContentProps) {
  const { openDrawer } = useItemDrawer();

  const items = useMemo(() => collection?.items ?? [], [collection?.items]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, GroupedItems>();
    
    for (const item of items) {
      const typeName = item.itemType?.name ?? 'other';
      const typeColor = item.itemType?.color ?? '#6b7280';
      
      if (!groups.has(typeName)) {
        groups.set(typeName, {
          typeName,
          typeColor,
          items: [],
        });
      }
      groups.get(typeName)!.items.push(item);
    }
    
    return Array.from(groups.values());
  }, [items]);

  if (!collection) {
    return null;
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      {hasError && (
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>Failed to load collection items. Please try again.</p>
        </div>
      )}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50'>
            <FolderOpen className='h-5 w-5 text-muted-foreground' />
          </div>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {collection.name}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <CollectionActions
          collectionId={collection.id}
          collectionName={collection.name}
          collectionDescription={collection.description}
          isFavorite={collection.isFavorite}
        />
      </div>

      {collection.description && (
        <p className='text-sm text-muted-foreground'>{collection.description}</p>
      )}

      {items.length === 0 ? (
        <Empty>
          <EmptyMedia variant='icon'>
            <FolderOpen className='h-5 w-5 text-muted-foreground' />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No items in this collection</EmptyTitle>
            <EmptyDescription>
              Add items to this collection from the item drawer.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groupedItems.map((group) => (
          <div key={group.typeName} className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <div
                className='flex h-6 w-6 items-center justify-center rounded-md'
                style={{
                  backgroundColor: `${group.typeColor}15`,
                  color: group.typeColor,
                }}
              >
                <ItemTypeIcon type={group.typeName} className='h-3.5 w-3.5' />
              </div>
              <h2 className='text-sm font-medium capitalize'>
                {group.typeName}
              </h2>
              <span className='text-xs text-muted-foreground'>
                ({group.items.length})
              </span>
            </div>

            {group.typeName === 'file' ? (
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-4 px-4 py-3 text-xs font-medium text-muted-foreground'>
                  <span className='w-9 shrink-0' />
                  <span className='min-w-0 flex-1'>Name</span>
                  <span className='hidden shrink-0 sm:block'>Size</span>
                  <span className='hidden shrink-0 md:block'>Uploaded</span>
                  <span className='w-8 shrink-0' />
                </div>
                {group.items.map((item) => (
                  <FileListRow
                    key={item.id}
                    item={item}
                    onOpen={openDrawer}
                  />
                ))}
              </div>
            ) : group.typeName === 'image' ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {group.items.map((item) => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    onOpen={openDrawer}
                  />
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {group.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpen={openDrawer}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
