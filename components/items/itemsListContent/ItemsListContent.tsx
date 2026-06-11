'use client';

import { AlertCircle, File } from 'lucide-react';
import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemCard } from '@/components/items/itemCard/ItemCard';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import type { ItemWithDetails, SystemItemType } from '@/types/db';

interface ItemsListContentProps {
  items: ItemWithDetails[];
  types: SystemItemType[];
  currentTypeName: string;
  hasError: boolean;
}

export function ItemsListContent({
  items,
  types,
  currentTypeName,
  hasError,
}: ItemsListContentProps) {
  const { openDrawer } = useItemDrawer();

  const currentType = types.find((t) => t.name === currentTypeName);

  if (!currentType) {
    return null;
  }

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
            {items.length} {items.length === 1 ? 'item' : 'items'}
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
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onOpen={openDrawer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
