import { Folder } from 'lucide-react';
import { recentCollections } from '@/lib/mock-data';

export function RecentCollections() {
  return (
    <section className='rounded-xl border border-border bg-card'>
      <div className='flex items-center gap-2 border-b border-border px-6 py-4'>
        <Folder className='h-4 w-4 text-muted-foreground' />
        <h2 className='text-lg font-semibold'>Recent Collections</h2>
      </div>
      <div className='divide-y divide-border'>
        {recentCollections.map((collection) => (
          <div
            key={collection.id}
            className='flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50'
          >
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
              <Folder className='h-5 w-5 text-muted-foreground' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{collection.name}</p>
              <p className='text-xs text-muted-foreground'>
                {collection.itemCount} items
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
