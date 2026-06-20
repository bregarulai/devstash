'use client';

import { AlertCircle, File } from 'lucide-react';
import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { useAutoOpenDrawer } from '@/hooks/useAutoOpenDrawer/useAutoOpenDrawer';
import { ItemCard } from '@/components/items/itemCard/ItemCard';
import { ImageCard } from '@/components/items/imageCard/ImageCard';
import { FileListRow } from '@/components/items/fileListRow/FileListRow';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { isImageItem } from '@/lib/utils/items';
import type { ItemWithDetails, SystemItemType } from '@/types/db';

interface ItemsListContentProps {
  items: ItemWithDetails[];
  types: SystemItemType[];
  currentTypeName: string;
  hasError: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  baseUrl: string;
  perPage: number;
}

export function ItemsListContent({
  items,
  types,
  currentTypeName,
  hasError,
  page,
  totalPages,
  totalCount,
  baseUrl,
  perPage,
}: ItemsListContentProps) {
  const { openDrawer } = useItemDrawer();
  useAutoOpenDrawer();

  const currentType = types.find((t) => t.name === currentTypeName);

  if (!currentType) {
    return null;
  }

  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalCount);

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      {hasError && (
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>Failed to load items. Please try again.</p>
        </div>
      )}
      <div className='flex items-center gap-3'>
        <div
          className='flex h-10 w-10 items-center justify-center rounded-lg'
          style={{
            backgroundColor: `${currentType.color}15`,
            color: currentType.color,
          }}
        >
          <ItemTypeIcon type={currentType.name} className='h-5 w-5' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {currentType.name.charAt(0).toUpperCase() +
              currentType.name.slice(1)}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {totalCount === 0
              ? 'No items'
              : `Showing ${startItem}-${endItem} of ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty>
          <EmptyMedia variant='icon'>
            <File className='h-5 w-5 text-muted-foreground' />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No items yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t added any {currentType.name} items yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : currentTypeName === 'file' ? (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-4 px-4 py-3 text-xs font-medium text-muted-foreground'>
            <span className='w-9 shrink-0' />
            <span className='min-w-0 flex-1'>Name</span>
            <span className='hidden shrink-0 sm:block'>Size</span>
            <span className='hidden shrink-0 md:block'>Uploaded</span>
            <span className='w-8 shrink-0' />
          </div>
          {items.map((item) =>
            isImageItem(item) ? (
              <ImageCard
                key={item.id}
                item={item}
                onOpen={openDrawer}
              />
            ) : (
              <FileListRow
                key={item.id}
                item={item}
                onOpen={openDrawer}
              />
            )
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {items.map((item) =>
            isImageItem(item) ? (
              <ImageCard
                key={item.id}
                item={item}
                onOpen={openDrawer}
              />
            ) : (
              <ItemCard
                key={item.id}
                item={item}
                onOpen={openDrawer}
              />
            )
          )}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} baseUrl={baseUrl} />
    </div>
  );
}
