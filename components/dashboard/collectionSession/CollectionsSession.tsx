import Link from 'next/link';
import { getAllCollections } from '@/lib/db/collections';
import { CollectionCard } from '../collectionCard/CollectionCard';

interface CollectionsSessionProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export async function CollectionsSession({ user }: CollectionsSessionProps) {
  const result = {
    success: false,
    data: [] as Awaited<ReturnType<typeof getAllCollections>>,
    error: null as Error | null,
  };

  try {
    result.data = await getAllCollections(user.id);
    result.success = true;
  } catch (error) {
    result.error = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to fetch collections:', result.error);
  }

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
          {result.data.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}
