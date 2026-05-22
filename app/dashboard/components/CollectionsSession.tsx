import { Folder } from 'lucide-react';
import { CollectionCard } from './CollectionCard';
import { getAllCollections } from '@/lib/db/collections';

interface CollectionsSessionProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export async function CollectionsSession({ user }: CollectionsSessionProps) {
  const collections = await getAllCollections(user.id);

  return (
    <section className='space-y-6'>
      {/* Collections Session */}
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <Folder className='h-4 w-4 text-muted-foreground' />
          <h2 className='text-lg font-semibold'>Collections</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}
