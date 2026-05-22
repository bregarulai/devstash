'use client';

import Link from 'next/link';
import {
  CURRENT_USER,
  favoriteCollections,
  ITEM_TYPES,
  recentCollections,
  typeIcons,
  typePaths,
} from '@/lib/mock-data';
import { ChevronDown, ChevronLeft, PanelLeft, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  hideToggle?: boolean;
}

export function Sidebar({ isExpanded, onToggle, hideToggle }: SidebarProps) {
  return (
    <div className='relative flex h-screen flex-col bg-background'>
      {/* Header */}
      <div className='flex h-16 items-center px-4'>
        <Link href='/' className='text-lg font-bold'>
          {isExpanded && 'DevStash'}
        </Link>
      </div>
      <Separator />
      <div className='flex-1 overflow-y-auto py-2 border-r border-border'>
        {/* Navigation */}
        <div
          className={`flex items-center ${isExpanded ? 'justify-between mr-2' : 'justify-center'} mb-4`}
        >
          {isExpanded && (
            <p className='px-2 text-xs tracking-wider text-muted-foreground'>
              Navigation
            </p>
          )}
          <PanelLeft
            className='h-5 w-5 shrink-0 cursor-pointer'
            onClick={onToggle}
          />
        </div>
        <Separator className='mb-4' />
        {/* Item Types */}
        <div className='mb-4 mx-2'>
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
                  title={
                    isExpanded
                      ? undefined
                      : type.name.charAt(0).toUpperCase() + type.name.slice(1)
                  }
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
        {isExpanded && <Separator className='my-4' />}
        {/* Collections */}
        <div className='mb-4 mx-2'>
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
              <div className='mb-1 ml-2 pl-2'>
                <h3 className='mb-1 px-2 text-xs tracking-wider text-muted-foreground'>
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
              <div className='mb-1 ml-2 pl-2'>
                <h3 className='mb-1 px-2 text-xs tracking-wider text-muted-foreground'>
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
      <div className='border-t border-border p-3'>
        {isExpanded ? (
          <div className='flex items-center justify-center gap-3 rounded-lg p-2'>
            <Avatar>
              <AvatarImage
                src=''
                alt={CURRENT_USER.name}
                className='grayscale'
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <p className='truncate text-sm font-medium'>{CURRENT_USER.name}</p>
            <p className='truncate text-xs text-muted-foreground'>
              {CURRENT_USER.email}
            </p>
          </div>
        ) : (
          <div className='flex items-center justify-center'>
            <Avatar>
              <AvatarImage
                src=''
                alt={CURRENT_USER.name}
                className='grayscale'
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
}
