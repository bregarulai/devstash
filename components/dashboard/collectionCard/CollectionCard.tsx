'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const borderColor = collection.dominantItemTypeColor;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return;
    }
    router.push(`/collections/${collection.id}`);
  };

  return (
    <Card
      className='h-full cursor-pointer rounded-xl border-l-[3px] transition-all hover:shadow-md'
      style={borderColor ? { borderLeftColor: borderColor } : undefined}
      onClick={handleCardClick}
    >
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
            <CardDescription className='truncate text-xs'>
              {collection.description}
            </CardDescription>
          )}
        </div>
        <div data-dropdown-trigger>
          <CollectionCardMenu
            collectionId={collection.id}
            collectionName={collection.name}
            collectionDescription={collection.description}
            isFavorite={collection.isFavorite}
          />
        </div>
      </CardHeader>
      <CardContent className='pb-2'>
        <div className='flex items-center gap-2'>
          {collection.itemTypeNames.length > 0 ? (
            collection.itemTypeNames.slice(0, 5).map((type, index) => (
              <span
                key={index}
                className='flex h-6 w-6 items-center justify-center rounded bg-muted/50'
              >
                <ItemTypeIcon type={type} className='h-3.5 w-3.5' />
              </span>
            ))
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
  );
}
