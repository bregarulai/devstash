import Link from 'next/link';
import { Folder } from 'lucide-react';
import { ItemTypeIcon } from '@/app/dashboard/components/ItemTypeIcon';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    itemCount: number;
    isFavorite: boolean;
    itemTypeNames: string[];
    borderColor: string;
  };
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className={`group rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-md ${collection.borderColor ? `border-l-[3px] ${collection.borderColor}` : ''}`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
            <Folder className='h-5 w-5 text-muted-foreground' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{collection.name}</p>
            {collection.description && (
              <p className='truncate text-xs text-muted-foreground'>
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='mt-3 flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          {collection.itemTypeNames.length > 0 ? (
            collection.itemTypeNames.slice(0, 5).map((type, index) => (
              <span key={index} className='flex h-6 w-6 items-center justify-center rounded bg-muted/50'>
                <ItemTypeIcon type={type} className='h-3.5 w-3.5' />
              </span>
            ))
          ) : (
            <span className='text-xs text-muted-foreground'>No items</span>
          )}
        </div>
        <span className='shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground'>
          {collection.itemCount} items
        </span>
      </div>
    </Link>
  );
}
