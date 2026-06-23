'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, FolderOpen, SearchX } from 'lucide-react';
import { useItemDrawer } from '@/components/items/itemDrawer/ItemDrawerProvider';
import { ItemCard } from '@/components/items/itemCard/ItemCard';
import { ImageCard } from '@/components/items/imageCard/ImageCard';
import { FileListRow } from '@/components/items/fileListRow/FileListRow';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { CollectionActions } from '@/components/collections/collectionActions/CollectionActions';
import { CollectionsToolbar } from '@/components/collections/collectionsToolbar/CollectionsToolbar';
import { ItemCreateDialog } from '@/components/items/itemCreateDialog/ItemCreateDialog';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type {
  CollectionDetail,
  ItemWithDetails,
  SystemItemType,
} from '@/types/db';
import type { SortOption } from '@/types/sort';

interface CollectionItemsContentProps {
  collection: CollectionDetail | null;
  hasError: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  baseUrl: string;
  perPage: number;
  search: string;
  sort: SortOption;
  systemItemTypes: SystemItemType[];
}

interface GroupedItems {
  typeName: string;
  typeColor: string;
  items: ItemWithDetails[];
}

export function CollectionItemsContent({
  collection,
  hasError,
  page,
  totalPages,
  totalCount,
  baseUrl,
  perPage,
  search,
  sort,
  systemItemTypes,
}: CollectionItemsContentProps) {
  const { openDrawer } = useItemDrawer();
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

  const items = useMemo(() => collection?.items ?? [], [collection?.items]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, GroupedItems>();

    for (const item of items) {
      const typeName = item.itemType?.name ?? 'other';
      const typeColor = item.itemType?.color ?? 'var(--muted-foreground)';

      if (!groups.has(typeName)) {
        groups.set(typeName, {
          typeName,
          typeColor,
          items: [],
        });
      }
      groups.get(typeName)!.items.push(item);
    }

    const typeOrder = new Map<string, number>();
    systemItemTypes.forEach((type, index) => {
      typeOrder.set(type.name, index);
    });

    return Array.from(groups.values()).sort((a, b) => {
      const aOrder = typeOrder.get(a.typeName);
      const bOrder = typeOrder.get(b.typeName);
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      return a.typeName.localeCompare(b.typeName);
    });
  }, [items, systemItemTypes]);

  if (hasError && !collection) {
    return (
      <div className='flex flex-col gap-6 p-6'>
        <CollectionBreadcrumb name='Collection' />
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>
            Failed to load this collection. Please try again.
          </p>
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

  if (!collection) {
    return null;
  }

  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalCount);
  const hasActiveSearch = search.length > 0;

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <CollectionBreadcrumb name={collection.name} />

      {hasError && (
        <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <p className='text-sm'>
            Some items failed to load. You can still see what loaded.
          </p>
          <Button
            variant='link'
            size='sm'
            onClick={() => router.refresh()}
            className='ml-auto'
          >
            Retry
          </Button>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50'>
            <FolderOpen className='h-5 w-5 text-muted-foreground' />
          </div>
          <div className='min-w-0'>
            <h1 className='truncate text-2xl font-semibold tracking-tight'>
              {collection.name}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {totalCount === 0
                ? 'No items'
                : `Showing ${startItem}-${endItem} of ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
            </p>
          </div>
        </div>
        <CollectionActions
          collectionId={collection.id}
          collectionName={collection.name}
          collectionDescription={collection.description}
          isFavorite={collection.isFavorite}
        />
      </div>

      {collection.description && (
        <p className='text-sm text-muted-foreground'>
          {collection.description}
        </p>
      )}

      <CollectionsToolbar
        search={inputSearch}
        sort={sort}
        onSearchChange={setInputSearch}
        onSortChange={handleSortChange}
        onClearSearch={handleClearSearch}
        placeholder='Search items'
        searchLabel='Search items in this collection'
      />

      <PaginationControls
        page={page}
        totalPages={totalPages}
        baseUrl={baseUrl}
        preserveParams={preserveParams}
      />

      {items.length === 0 ? (
        hasActiveSearch ? (
          <Empty>
            <EmptyMedia variant='icon'>
              <SearchX className='h-5 w-5 text-muted-foreground' />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{`No items match "${search}"`}</EmptyTitle>
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
              <EmptyTitle>No items in this collection yet</EmptyTitle>
              <EmptyDescription>
                Add your first snippet, prompt, command, or note to this
                collection.
              </EmptyDescription>
            </EmptyHeader>
            <ItemCreateDialog
              defaultCollectionIds={[collection.id]}
              isPro={false}
            />
          </Empty>
        )
      ) : (
        groupedItems.map((group) => (
          <div key={group.typeName} className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <div
                className='flex h-6 w-6 items-center justify-center rounded-md'
                style={{
                  backgroundColor: `color-mix(in oklch, ${group.typeColor} 12%, transparent)`,
                  color: group.typeColor,
                }}
              >
                <ItemTypeIcon type={group.typeName} className='h-3.5 w-3.5' />
              </div>
              <h2 className='text-sm font-medium capitalize'>
                {group.typeName}
              </h2>
              <span className='text-xs text-muted-foreground'>
                ({group.items.length})
              </span>
            </div>

            {group.typeName === 'file' ? (
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-4 px-4 py-3 text-xs font-medium text-muted-foreground'>
                  <span className='w-9 shrink-0' />
                  <span className='min-w-0 flex-1'>Name</span>
                  <span className='hidden shrink-0 sm:block'>Size</span>
                  <span className='hidden shrink-0 md:block'>Uploaded</span>
                  <span className='w-8 shrink-0' />
                </div>
                {group.items.map((item) => (
                  <FileListRow
                    key={item.id}
                    item={item}
                    onOpen={openDrawer}
                  />
                ))}
              </div>
            ) : group.typeName === 'image' ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {group.items.map((item) => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    onOpen={openDrawer}
                  />
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {group.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpen={openDrawer}
                  />
                ))}
              </div>
            )}
          </div>
        ))
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

function CollectionBreadcrumb({ name }: { name: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href='/collections'>Collections</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className='truncate'>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
