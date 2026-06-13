import { Button } from '@/components/ui/button';
import { FolderDown } from 'lucide-react';
import { SearchBar } from '../searchBar/SearchBar';
import { Separator } from '@/components/ui/separator';
import { ItemCreateDialog } from '@/components/items/itemCreateDialog/ItemCreateDialog';

export function MobileSideBar() {
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
          <ItemCreateDialog />
        </div>
      </header>
      <Separator />
    </>
  );
}
