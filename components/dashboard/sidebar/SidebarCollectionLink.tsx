import { ProtectedLink } from '@/components/shared/protectedLink/ProtectedLink';
import { Star } from 'lucide-react';
import { CollectionWithStats } from '@/types/db';

interface SidebarCollectionLinkProps {
  collection: CollectionWithStats;
  variant: 'favorite' | 'recent';
}

export function SidebarCollectionLink({ collection, variant }: SidebarCollectionLinkProps) {
  return (
    <ProtectedLink
      href={`/collections/${collection.id}`}
      className='group flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground text-sm'
    >
      {variant === 'favorite' ? (
        <Star className='h-4 w-4 fill-note text-note' />
      ) : (
        <span
          className='h-3 w-3 shrink-0 rounded-full'
          style={{
            backgroundColor: collection.dominantItemTypeColor,
          }}
        />
      )}
      <span className='truncate'>{collection.name}</span>
      <span className='ml-auto text-xs text-muted-foreground'>
        {collection.itemCount}
      </span>
    </ProtectedLink>
  );
}
