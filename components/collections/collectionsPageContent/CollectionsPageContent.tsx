'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, FolderOpen, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/components/dashboard/collectionCard/CollectionCard';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { CollectionsToolbar } from '@/components/collections/collectionsToolbar/CollectionsToolbar';
import type { SortOption } from '@/types/sort';
import type { CollectionWithStats } from '@/types/db';

interface CollectionsPageContentProps {
  collections: CollectionWithStats[];
  hasError: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  baseUrl: string;
  perPage: number;
  search: string;
  sort: SortOption;
}

export function CollectionsPageContent({
  collections,
  hasError,
  page,
  totalPages,
  totalCount,
  baseUrl,
  perPage,
  search,
  sort,
}: CollectionsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputSearch, setInputSearch] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setInputSearch(search);
  }

  const updateUrl = useCallback(
    (next: { q?: string; sort?: SortOption }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.q !== undefined) params.set('q', next.q);
      if (next.sort !== undefined) params.set('sort', next.sort);
      params.delete('page');
      router.replace(`${baseUrl}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, baseUrl],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (inputSearch !== search) {
        updateUrl({ q: inputSearch });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [inputSearch, search, updateUrl]);

  const handleSortChange = useCallback(
    (value: SortOption) => {
      updateUrl({ sort: value });
    },
    [updateUrl],
  );

  const handleClearSearch = useCallback(() => {
    setInputSearch('');
    updateUrl({ q: '' });
  }, [updateUrl]);

  const preserveParams = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    return params.toString();
  }, [searchParams]);

  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalCount);

  if (hasError) {
    return (
      <div className='flex flex-col gap-6'>
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>Failed to load collections. Please try again.</p>
          <Button
            variant='link'
            size='sm'
            onClick={() => router.refresh()}
            className='ml-auto'
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50'>
          <FolderOpen className='h-5 w-5 text-muted-foreground' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Collections</h1>
          {totalCount > 0 && (
            <p className='text-sm text-muted-foreground'>
              {`Showing ${startItem}-${endItem} of ${totalCount} ${totalCount === 1 ? 'collection' : 'collections'}`}
            </p>
          )}
        </div>
      </div>

      <CollectionsToolbar
        search={inputSearch}
        sort={sort}
        onSearchChange={setInputSearch}
        onSortChange={handleSortChange}
        onClearSearch={handleClearSearch}
      />

      {collections.length === 0 ? (
        search ? (
          <Empty>
            <EmptyMedia variant='icon'>
              <SearchX className='h-5 w-5 text-muted-foreground' />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{`No collections match "${search}"`}</EmptyTitle>
              <EmptyDescription>
                Try a different search term or clear the search.
              </EmptyDescription>
            </EmptyHeader>
            <Button variant='outline' size='sm' onClick={handleClearSearch}>
              Clear search
            </Button>
          </Empty>
        ) : (
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
        )
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        baseUrl={baseUrl}
        preserveParams={preserveParams}
      />
    </div>
  );
}
