'use client';

import Link from 'next/link';
import { ChevronDown, PanelLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { SystemItemType, CollectionWithStats } from '@/types/db';
import { SidebarItemTypeLink } from './SidebarItemTypeLink';
import { SidebarCollectionLink } from './SidebarCollectionLink';
import { SidebarUserMenu } from './SidebarUserMenu';

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
    isPro: boolean;
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
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
            tabIndex={0}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          />
        </div>
        <Separator className='mb-4' />
        {/* Item Types */}
        <div className='mb-4 mx-2'>
          {isExpanded && (
            <h3 className='mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Types
            </h3>
          )}
          <div className='space-y-0.5'>
            {systemItemTypes.map((type) => (
              <SidebarItemTypeLink
                key={type.name}
                type={type}
                isExpanded={isExpanded}
              />
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
                        <SidebarCollectionLink
                          key={collection.id}
                          collection={collection}
                          variant='favorite'
                        />
                      ))}
                    </div>
                  </div>
                )}
                {recentCollections.length > 0 && (
                  <div className='mb-1 ml-2 pl-2'>
                    <h3 className='mb-1 px-2 text-xs tracking-wider text-muted-foreground'>
                      ALL COLLECTIONS
                    </h3>
                    <div className='space-y-0.5 ml-6'>
                      {recentCollections.map((collection) => (
                        <SidebarCollectionLink
                          key={collection.id}
                          collection={collection}
                          variant='recent'
                        />
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
      <div className='border-t border-r border-border p-3 relative'>
        <SidebarUserMenu user={user} isExpanded={isExpanded} />
      </div>
    </div>
  );
}
