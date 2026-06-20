'use client';

import { Star, FolderOpen, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn, formatDaysAgo } from '@/lib/utils/utils';
import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import type { ItemWithDetails, CollectionWithStats } from '@/types/db';

const itemTypeColorMap: Record<string, string> = {
  snippet: 'border-snippet/50 text-snippet',
  prompt: 'border-prompt/50 text-prompt',
  command: 'border-command/50 text-command',
  note: 'border-note/50 text-note',
  file: 'border-file/50 text-file',
  image: 'border-image/50 text-image',
  link: 'border-link/50 text-link',
};

interface FavoritesPageContentProps {
  favoriteItems: ItemWithDetails[];
  favoriteCollections: CollectionWithStats[];
  hasError: boolean;
}

export function FavoritesPageContent({
  favoriteItems,
  favoriteCollections,
  hasError,
}: FavoritesPageContentProps) {
  const router = useRouter();
  const { openDrawer } = useItemDrawer();
  const totalCount = favoriteItems.length + favoriteCollections.length;

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      {hasError && (
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>Failed to load favorites. Please try again.</p>
        </div>
      )}

      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50'>
          <Star className='h-5 w-5 text-favorite' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Favorites</h1>
          <p className='text-sm text-muted-foreground'>
            {totalCount === 0
              ? 'No favorites yet'
              : `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
          </p>
        </div>
      </div>

      {totalCount === 0 ? (
        <Empty>
          <EmptyMedia variant='icon'>
            <Star className='h-5 w-5 text-muted-foreground' />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No favorites yet</EmptyTitle>
            <EmptyDescription>
              Star items and collections to see them here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='space-y-6'>
          {favoriteItems.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <h2 className='text-sm font-medium text-muted-foreground'>Items</h2>
                <Badge variant='secondary' className='text-xs'>
                  {favoriteItems.length}
                </Badge>
              </div>
              <div className='space-y-1 font-mono text-sm'>
                {favoriteItems.map((item) => (
                  <div
                    key={item.id}
                    role='button'
                    tabIndex={0}
                    onClick={() => openDrawer(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDrawer(item.id);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer',
                      'hover:bg-muted/50 transition-colors'
                    )}
                  >
                    <ItemTypeIcon type={item.itemType.name} className='h-4 w-4' />
                    <Star className='size-3.5 shrink-0 fill-current text-favorite' />
                    <span className='flex-1 truncate font-medium'>{item.title}</span>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-xs shrink-0',
                        itemTypeColorMap[item.itemType.name] || 'border-border text-foreground'
                      )}
                    >
                      {item.itemType.name}
                    </Badge>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      {formatDaysAgo(item.updatedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {favoriteCollections.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <h2 className='text-sm font-medium text-muted-foreground'>Collections</h2>
                <Badge variant='secondary' className='text-xs'>
                  {favoriteCollections.length}
                </Badge>
              </div>
              <div className='space-y-1 font-mono text-sm'>
                {favoriteCollections.map((collection) => (
                  <div
                    key={collection.id}
                    role='button'
                    tabIndex={0}
                    onClick={() => router.push(`/collections/${collection.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/collections/${collection.id}`);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer',
                      'hover:bg-muted/50 transition-colors'
                    )}
                  >
                    <FolderOpen className='h-4 w-4 text-muted-foreground' />
                    <Star className='size-3.5 shrink-0 fill-current text-favorite' />
                    <span className='flex-1 truncate font-medium'>{collection.name}</span>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      {formatDaysAgo(collection.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}