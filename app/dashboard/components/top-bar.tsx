import { Button } from '@/components/ui/button';
import { FolderDown, Plus } from 'lucide-react';
import { SearchBar } from './SearchBar';

export function TopBar() {
  return (
    <header className='sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:px-6'>
      <div className='flex flex-1 items-center gap-4 min-w-0'>
        <SearchBar />
      </div>
      <div className='flex items-center gap-2'>
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
