'use client';

import Link from 'next/link';
import {
  favoriteCollections,
  ITEM_TYPES,
  recentCollections,
  typeIcons,
  typePaths,
} from '@/lib/mock-data';
import { ChevronDown, ChevronLeft, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  return (
    <div className='relative flex h-screen flex-col border-r border-border bg-background'>
      {/* Header */}
      <div className='flex h-16 items-center px-4'>
        <Link href='/' className='text-lg font-bold'>
          DevStash
        </Link>
      </div>

      <div className='flex-1 overflow-y-auto p-2'>
        {/* Item Types */}
        <div className='mb-4'>
          {isExpanded && (
            <h3 className='mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              TYPES
            </h3>
          )}
          <div className='space-y-0.5'>
            {ITEM_TYPES.map((type) => {
              const Icon = typeIcons[type.name];
              return (
                <Link
                  key={type.name}
                  href={typePaths[type.name]}
                  className={`group flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${isExpanded ? 'gap-3 px-2 py-1.5 text-sm' : 'justify-center px-1 py-2'}`}
                  title={isExpanded ? undefined : type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                >
                  <span
                    className='flex h-5 w-5 shrink-0 items-center justify-center'
                    style={{ color: type.color }}
                  >
                    {Icon}
                  </span>
                  {isExpanded && (
                    <span className='truncate font-medium'>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </span>
                  )}
                  {isExpanded && (
                    <span className='ml-auto text-xs text-muted-foreground'>
                      {type.itemCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <Separator className='my-4' />
        {/* Collections */}
        <div className='mb-4'>
          {isExpanded && (
            <button
              onClick={() => {
                const section = document.getElementById('collections-section');
                if (section) {
                  section.dataset.open =
                    section.dataset.open === 'true' ? 'false' : 'true';
                }
              }}
              className='flex w-full items-center gap-1.5 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground'
            >
              <>
                <ChevronDown className='h-3.5 w-3.5' />
                COLLECTIONS
              </>
            </button>
          )}
          {isExpanded && (
            <div
              id='collections-section'
              className='mt-1 space-y-0.5'
              data-open='true'
            >
              <div className='mb-1 ml-2 border-l border-border pl-2'>
                <h3 className='mb-1 px-2 text-xs font-semibold tracking-wider text-muted-foreground'>
                  Favorites
                </h3>
                <div className='space-y-0.5'>
                  {favoriteCollections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      className='group flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground text-sm'
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
                      className='group flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground text-sm'
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
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isExpanded && (
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
      )}

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center rounded-full bg-background border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors'
      >
        <ChevronLeft className={`h-4 w-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}
