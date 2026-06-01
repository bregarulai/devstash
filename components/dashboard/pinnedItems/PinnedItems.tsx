'use client'; // Required for ClientLoader interactivity (mounted state)

import { Pin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { formatDaysAgo } from '@/lib/utils';
import { ItemTypeIcon } from '../itemTypeIcon/ItemTypeIcon';
import { ClientLoader } from '../clientLoader/ClientLoader';
import { PinnedItemsSkeleton } from '../skeletons/PinnedItemsSkeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ItemWithDetails {
  id: string;
  title: string;
  description: string | null;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: { id: string; name: string }[];
  updatedAt: Date;
}

interface PinnedItemsProps {
  items: ItemWithDetails[];
}

export function PinnedItems({ items }: PinnedItemsProps) {
  const content = (
    <section>
      <div className='flex items-center gap-2 py-4'>
        <Pin className='h-4 w-4 text-muted-foreground' />
        <h2 className='text-lg font-semibold'>Pinned Items</h2>
      </div>

      <div className='flex flex-col gap-3 py-6'>
        {items.map((item) => (
          <Card
            key={item.id}
            className='h-full border border-border overflow-hidden ring-0 hover:bg-muted/50 transition-all rounded-xl border-l-[3px]'
            style={{ borderLeftColor: item.itemType.color }}
          >
            <CardContent className='flex items-center gap-4 p-4'>
              <div
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'
                style={{
                  backgroundColor: `${item.itemType.color}15`,
                  borderColor: item.itemType.color,
                }}
              >
                <ItemTypeIcon type={item.itemType.name} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{item.title}</p>
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
          </Card>
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
              <a href='/items'>
                Browse items
                <ArrowRight className='ml-2 h-4 w-4' />
              </a>
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
