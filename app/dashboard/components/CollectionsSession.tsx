import Link from 'next/link';
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
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>Collections</h2>
          </div>
          <Link
            href='/collections'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            View All
          </Link>
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
