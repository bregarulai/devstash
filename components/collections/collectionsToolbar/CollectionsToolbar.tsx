'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SortControls, type SortOption } from '@/components/favorites/sortControls/SortControls';

interface CollectionsToolbarProps {
  search: string;
  sort: SortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onClearSearch: () => void;
  placeholder?: string;
  searchLabel?: string;
}

export function CollectionsToolbar({
  search,
  sort,
  onSearchChange,
  onSortChange,
  onClearSearch,
  placeholder = 'Search collections',
  searchLabel = 'Search collections',
}: CollectionsToolbarProps) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='relative w-full sm:max-w-xs'>
        <Search className='pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='search'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          aria-label={searchLabel}
          className='h-9 pl-8 pr-8'
        />
        {search && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClearSearch}
            aria-label='Clear search'
            className='absolute right-0.5 top-1/2 size-7 -translate-y-1/2'
          >
            <X className='size-3.5' />
          </Button>
        )}
      </div>
      <SortControls value={sort} onChange={onSortChange} />
    </div>
  );
}
