'use client'; // Required for ClientLoader interactivity (mounted state)

import { Pin, Star } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

import { ItemTypeIcon } from '../itemTypeIcon/ItemTypeIcon';
import { ClientLoader } from '../clientLoader/ClientLoader';
import { PinnedItemsSkeleton } from '../skeletons/PinnedItemsSkeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ItemWithDetails } from '@/types/db';

interface PinnedItemsProps {
  items: ItemWithDetails[];
  onOpen?: (itemId: string) => void;
}

export function PinnedItems({ items, onOpen }: PinnedItemsProps) {
  const content = (
    <section>
      <div className='flex items-center gap-2 py-4'>
        <Pin className='h-4 w-4 text-muted-foreground' />
        <h2 className='text-lg font-semibold'>Pinned Items</h2>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 py-6'>
        {items.map((item) => (
          <button
            key={item.id}
            type='button'
            onClick={() => onOpen?.(item.id)}
            className='h-full w-full text-left ring-1 ring-foreground/10 overflow-hidden hover:bg-muted/50 transition-all rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <CardContent className='flex items-center gap-3 p-4'>
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
                  <Pin className='size-3.5 shrink-0 fill-current text-pin' />
                </div>
                <p className='truncate text-xs text-muted-foreground'>
                  {item.itemType.name}
                </p>
              </div>
            </CardContent>
            </button>
        ))}
      </div>
    </section>
  );

  if (items.length === 0) {
    return (
      <ClientLoader fallback={<PinnedItemsSkeleton />}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No pinned items</EmptyTitle>
            <EmptyDescription>Pin your most important snippets, prompts, and links to find them instantly.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href='/items'>
                Browse items
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </ClientLoader>
    );
  }

  return (
    <ClientLoader fallback={<PinnedItemsSkeleton />}>
      {content}
    </ClientLoader>
  );
}
