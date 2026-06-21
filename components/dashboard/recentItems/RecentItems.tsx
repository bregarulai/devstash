'use client';

import { Clock, Star } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { formatDaysAgo } from '@/lib/utils/utils';
import { ItemTypeIcon } from '../itemTypeIcon/ItemTypeIcon';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { ItemWithDetails } from '@/types/db';

interface RecentItemsProps {
  items: ItemWithDetails[];
  onOpen?: (itemId: string) => void;
}

export function RecentItems({ items, onOpen }: RecentItemsProps) {
  if (items.length === 0) {
    return (
      <section>
        <div className='flex items-center gap-2 py-4'>
          <Clock className='h-4 w-4 text-muted-foreground' />
          <h2 className='text-lg font-semibold'>Recent Items</h2>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No recent items</EmptyTitle>
            <EmptyDescription>Items you view or edit will appear here for quick access.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );
  }

  return (
    <section>
      <div className='flex items-center gap-2 py-4'>
        <Clock className='h-4 w-4 text-muted-foreground' />
        <h2 className='text-lg font-semibold'>Recent Items</h2>
      </div>

      <div className='flex flex-col gap-3 py-6'>
        {items.map((item) => (
          <button
            key={item.id}
            type='button'
            onClick={() => onOpen?.(item.id)}
            className='h-full w-full text-left ring-1 ring-foreground/10 overflow-hidden hover:bg-muted/50 transition-all rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <CardContent className='flex items-center gap-4 p-3'>
              <div
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'
                style={{
                  backgroundColor: `${item.itemType.color}15`,
                }}
              >
                <ItemTypeIcon type={item.itemType.name} />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <p className='truncate text-sm font-medium'>{item.title}</p>
                  {item.isFavorite && (
                    <Star className='size-3.5 shrink-0 fill-current text-favorite' />
                  )}
                </div>
                <p className='truncate text-xs text-muted-foreground'>
                  {item.description ?? ''}
                </p>
              </div>
              <span
                className='shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium'
                style={{
                  color: item.itemType.color,
                  backgroundColor: `${item.itemType.color}15`,
                }}
              >
                {item.itemType.name}
              </span>
              <span className='shrink-0 text-xs text-muted-foreground'>
                {formatDaysAgo(item.updatedAt)}
              </span>
            </CardContent>
          </button>
        ))}
      </div>
    </section>
  );
}
