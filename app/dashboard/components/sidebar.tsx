'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  favoriteCollections,
  ITEM_TYPES,
  ItemType,
  recentCollections,
  typeIcons,
  typePaths,
} from '@/lib/mock-data';
import { ChevronLeft, ChevronRight, ChevronDown, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function ItemTypeItem({ type }: { type: ItemType }) {
  const Icon = typeIcons[type.name];

  return (
    <Link
      href={typePaths[type.name]}
      className='group flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
    >
      <span
        className='flex h-5 w-5 shrink-0 items-center justify-center'
        style={{ color: type.color }}
      >
        {Icon}
      </span>
      <span className='truncate font-medium'>
        {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
      </span>
    </Link>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='mb-4'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center gap-1.5 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground'
      >
        {isOpen ? (
          <ChevronDown className='h-3.5 w-3.5' />
        ) : (
          <ChevronRight className='h-3.5 w-3.5' />
        )}
        {title}
      </button>
      {isOpen && <div className='mt-1 space-y-0.5'>{children}</div>}
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative flex h-screen w-64 flex-col border-r border-border bg-background'>
      {/* Header */}
      <div className='flex h-16 items-center justify-between px-4'>
        <Link href='/' className='text-lg font-bold'>
          DevStash
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground'
        >
          {isOpen ? (
            <ChevronLeft className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-2'>
        {/* Item Types */}
        <div className='mb-4'>
          <h3 className='mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            TYPES
          </h3>
          <div className='space-y-0.5'>
            {ITEM_TYPES.map((type) => (
              <ItemTypeItem key={type.name} type={type} />
            ))}
          </div>
        </div>
        <Separator className='my-4' />
        {/* Collections */}
        <CollapsibleSection title='COLLECTIONS' defaultOpen={true}>
          <div className='mb-1 ml-2 border-l border-border pl-2'>
            <h3 className='mb-1 px-2 text-xs font-semibold tracking-wider text-muted-foreground'>
              Favorites
            </h3>
            <div className='space-y-0.5'>
              {favoriteCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className='group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
                >
                  {collection.isFavorite ? (
                    <Star className='h-4 w-4 fill-(--color-note) text-(--color-note)' />
                  ) : null}
                  <span className='truncate'>{collection.name}</span>
                  <span className='ml-auto text-xs text-muted-foreground'>
                    {collection.itemCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className='mb-1 ml-2 border-l border-border pl-2'>
            <h3 className='mb-1 px-2 text-xs font-semibold tracking-wider text-muted-foreground'>
              Recent
            </h3>
            <div className='space-y-0.5 ml-6'>
              {recentCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className='group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
                >
                  {collection.isFavorite ? (
                    <Star className='h-4 w-4 fill-(--color-note) text-(--color-note)' />
                  ) : null}
                  <span className='truncate'>{collection.name}</span>
                  <span className='ml-auto text-xs text-muted-foreground'>
                    {collection.itemCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* User Avatar */}
      <div className='border-t border-border p-3'>
        <div className='flex items-center gap-3 rounded-lg p-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'>
            JD
          </div>
          <div className='flex-1 overflow-hidden'>
            <p className='truncate text-sm font-medium'>John Doe</p>
            <p className='truncate text-xs text-muted-foreground'>
              demo@devstash.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
