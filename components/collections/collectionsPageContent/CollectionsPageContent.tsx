'use client';

import Link from 'next/link';
import { AlertCircle, FolderOpen } from 'lucide-react';
import { CollectionCard } from '@/components/dashboard/collectionCard/CollectionCard';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { CollectionWithStats } from '@/types/db';

interface CollectionsPageContentProps {
  collections: CollectionWithStats[];
  hasError: boolean;
}

export function CollectionsPageContent({
  collections,
  hasError,
}: CollectionsPageContentProps) {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      {hasError && (
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>Failed to load collections. Please try again.</p>
        </div>
      )}
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50'>
          <FolderOpen className='h-5 w-5 text-muted-foreground' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Collections</h1>
          <p className='text-sm text-muted-foreground'>
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
          </p>
        </div>
      </div>

      {collections.length === 0 ? (
        <Empty>
          <EmptyMedia variant='icon'>
            <FolderOpen className='h-5 w-5 text-muted-foreground' />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No collections yet</EmptyTitle>
            <EmptyDescription>
              Create collections to organize your items.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className='focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl'
            >
              <CollectionCard collection={collection} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
