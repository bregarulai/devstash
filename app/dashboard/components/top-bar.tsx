import { Button } from '@/components/ui/button';
import { FolderDown, Plus } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { Separator } from '@/components/ui/separator';

export function TopBar() {
  return (
    <>
      <header className='flex align-middle justify-between sticky top-0 z-30 h-16 shrink-0 items-center gap-4 bg-background px-4 sm:px-6'>
        <div className=' min-w-0'>
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
      <Separator />
    </>
  );
}
