import { SearchBar } from '../searchBar/SearchBar';
import { Separator } from '@/components/ui/separator';
import { ItemCreateDialog } from '@/components/items/itemCreateDialog/ItemCreateDialog';
import { CollectionCreateDialog } from '@/components/collections/collectionCreateDialog/CollectionCreateDialog';

export function MobileSideBar() {
  return (
    <>
      <header className='flex align-middle justify-between sticky top-0 z-30 h-16 shrink-0 items-center gap-4 bg-background px-4 sm:px-6'>
        <div className=' min-w-0'>
          <SearchBar />
        </div>
        <div className='flex items-center gap-2'>
          <CollectionCreateDialog />
          <ItemCreateDialog />
        </div>
      </header>
      <Separator />
    </>
  );
}
