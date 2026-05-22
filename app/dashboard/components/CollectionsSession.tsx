import { Folder, Star } from 'lucide-react';
import { CollectionCard } from './CollectionCard';
import { getFavoriteCollections, getRecentCollections } from '@/lib/db/collections';

interface CollectionsSessionProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export async function CollectionsSession({ user }: CollectionsSessionProps) {
  const [favoriteCollections, recentCollections] = await Promise.all([
    getFavoriteCollections(user.id),
    getRecentCollections(user.id, 6),
  ]);

  return (
    <section className='space-y-6'>
      {/* Favorite Collections */}
      {favoriteCollections.length > 0 && (
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <Star className='h-4 w-4 fill-note text-note' />
            <h2 className='text-lg font-semibold'>Favorite Collections</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {favoriteCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Collections */}
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <Folder className='h-4 w-4 text-muted-foreground' />
          <h2 className='text-lg font-semibold'>Recent Collections</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {recentCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}
