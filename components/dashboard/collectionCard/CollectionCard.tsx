'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Star } from 'lucide-react';
import { ItemTypeIcon } from '../itemTypeIcon/ItemTypeIcon';
import { CollectionCardMenu } from '@/components/collections/collectionCardMenu/CollectionCardMenu';

const MAX_TYPE_ICONS = 3;

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    itemCount: number;
    isFavorite: boolean;
    itemTypeNames: string[];
    dominantItemTypeColor: string;
    contentTypeCounts: Record<string, number>;
  };
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const visibleTypes = collection.itemTypeNames.slice(0, MAX_TYPE_ICONS);
  const hiddenTypeCount = Math.max(
    0,
    collection.itemTypeNames.length - MAX_TYPE_ICONS,
  );

  return (
    <Link
      href={`/collections/${collection.id}`}
      aria-label={`Open ${collection.name}`}
      className='group/card-link block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
    >
      <Card className='h-full transition-colors hover:bg-muted/40'>
        <CardHeader className='flex flex-row items-center gap-3 space-y-0 pb-2'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5'>
              <CardTitle className='truncate text-sm font-medium'>
                {collection.name}
              </CardTitle>
              {collection.isFavorite && (
                <Star className='size-3.5 shrink-0 fill-current text-favorite' />
              )}
            </div>
            {collection.description && (
              <CardDescription
                className='truncate text-xs'
                title={collection.description}
              >
                {collection.description}
              </CardDescription>
            )}
          </div>
          <CollectionCardMenu
            collectionId={collection.id}
            collectionName={collection.name}
            collectionDescription={collection.description}
            isFavorite={collection.isFavorite}
          />
        </CardHeader>
        <CardContent className='pb-2'>
          <div className='flex items-center gap-2'>
            {visibleTypes.length > 0 ? (
              <>
                {visibleTypes.map((type) => (
                  <span
                    key={type}
                    className='flex h-6 w-6 items-center justify-center rounded bg-muted/50'
                  >
                    <ItemTypeIcon type={type} className='h-3.5 w-3.5' />
                  </span>
                ))}
                {hiddenTypeCount > 0 && (
                  <span className='text-xs text-muted-foreground'>
                    +{hiddenTypeCount}
                  </span>
                )}
              </>
            ) : (
              <span className='text-xs text-muted-foreground'>No items</span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <span className='rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground'>
            {collection.itemCount} items
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
