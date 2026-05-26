'use client';

import Link from 'next/link';
import { ChevronDown, PanelLeft, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { SystemItemType } from '@/lib/db/items';
import { CollectionWithStats } from '@/lib/db/collections';
import { ItemTypeIcon } from '../itemTypeIcon/ItemTypeIcon';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  systemItemTypes: SystemItemType[];
  favoriteCollections: CollectionWithStats[];
  recentCollections: CollectionWithStats[];
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function Sidebar({
  isExpanded,
  onToggle,
  systemItemTypes,
  favoriteCollections,
  recentCollections,
  user,
}: SidebarProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const displayName = user.name || user.email || 'User';
  const displayImage = user.image || undefined;
  const fallbackName = (user.name || user.email || 'U').charAt(0).toUpperCase();

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
              ITEMS
            </h3>
          )}
          <div className='space-y-0.5'>
            {systemItemTypes.map((type) => (
              <Link
                key={type.name}
                href={`/items/${type.name}`}
                className={`group flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${isExpanded ? 'gap-3 px-2 py-1.5 text-sm' : 'justify-center px-1 py-2'}`}
                title={
                  isExpanded
                    ? undefined
                    : type.name.charAt(0).toUpperCase() + type.name.slice(1)
                }
              >
                <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
                  <ItemTypeIcon type={type.name} className='h-4 w-4' />
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
            ))}
          </div>
        </div>
        {isExpanded && <Separator className='my-4' />}
        {/* Collections */}
        {isExpanded && (
          <div className='mb-4 mx-2'>
            <Collapsible
              open={collectionsOpen}
              onOpenChange={setCollectionsOpen}
            >
              <CollapsibleTrigger className='flex w-full items-center gap-1.5 cursor-pointer px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground'>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${collectionsOpen ? 'rotate-0' : '-rotate-90'}`}
                />
                COLLECTIONS
              </CollapsibleTrigger>
              <CollapsibleContent className='mt-1 space-y-0.5'>
                {favoriteCollections.length > 0 && (
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
                          <Star className='h-4 w-4 fill-note text-note' />
                          <span className='truncate'>{collection.name}</span>
                          <span className='ml-auto text-xs text-muted-foreground'>
                            {collection.itemCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {recentCollections.length > 0 && (
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
                          <span
                            className='h-3 w-3 shrink-0 rounded-full'
                            style={{
                              backgroundColor: collection.dominantItemTypeColor,
                            }}
                          />
                          <span className='truncate'>{collection.name}</span>
                          <span className='ml-auto text-xs text-muted-foreground'>
                            {collection.itemCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        {isExpanded && (
          <div className='px-2 pb-2'>
            <Link
              href='/collections'
              className='block text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1'
            >
              View all collections
            </Link>
          </div>
        )}
      </div>

      {/* User Avatar */}
      <div className='border-t border-r border-border p-3'>
        {isExpanded ? (
          <div className='flex items-center justify-center gap-3 rounded-lg p-2'>
            <Avatar>
              <AvatarImage
                src={displayImage || ''}
                alt={displayName}
                className='grayscale'
              />
              <AvatarFallback>{fallbackName}</AvatarFallback>
            </Avatar>

            <p className='truncate text-sm font-medium'>{displayName}</p>
            <p className='truncate text-xs text-muted-foreground'>
              {user.email}
            </p>
          </div>
        ) : (
          <div className='flex items-center justify-center'>
            <Avatar>
              <AvatarImage
                src={displayImage || ''}
                alt={displayName}
                className='grayscale'
              />
              <AvatarFallback>{fallbackName}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
}
