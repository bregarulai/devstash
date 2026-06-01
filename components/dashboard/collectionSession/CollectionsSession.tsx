'use client'; // Required for ClientLoader interactivity (mounted state)

import Link from 'next/link';
import { CollectionCard } from '../collectionCard/CollectionCard';
import { ClientLoader } from '../clientLoader/ClientLoader';
import { CollectionSessionSkeleton } from '../skeletons/CollectionSessionSkeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { CollectionWithStats } from '@/lib/db/collections';
import type { User } from '@/types/user';

interface CollectionsSessionProps {
  user: User;
  collections: CollectionWithStats[];
}

export function CollectionsSession({ collections }: CollectionsSessionProps) {
  const content = (
    <section className='space-y-6'>
      <div>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>Collections</h2>
          </div>
          <Link
            href='/collections'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1'
          >
            View All
            <span className='ml-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded'>Go</span>
          </Link>
        </div>
        {collections.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No collections yet</EmptyTitle>
              <EmptyDescription>Collections organize your items by topic. Create one to get started.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <a href='/collections/new'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create collection
                </a>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <ClientLoader fallback={<CollectionSessionSkeleton />}>
      {content}
    </ClientLoader>
  );
}
