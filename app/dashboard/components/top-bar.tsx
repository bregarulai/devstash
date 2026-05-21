'use client';

import { Button } from '@/components/ui/button';
import { FolderDown, Plus } from 'lucide-react';
import { SearchBar } from './SearchBar';

export function TopBar() {
  return (
    <header className='flex h-16 items-center justify-between border-b border-border bg-background pr-6'>
      <div className='flex items-center gap-4'>
        <div className='flex items-center justify-center w-64'>
          <SearchBar />
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Button size='sm' variant='outline'>
          <FolderDown className='mr-2 h-4 w-4' />
          New Collection
        </Button>
        <Button size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          New Item
        </Button>
      </div>
    </header>
  );
}
