import { SearchBar } from '../searchBar/SearchBar';
import { Separator } from '@/components/ui/separator';
import { ItemCreateDialog } from '@/components/items/itemCreateDialog/ItemCreateDialog';
import { CollectionCreateDialog } from '@/components/collections/collectionCreateDialog/CollectionCreateDialog';

export function MobileSideBar() {
  return (
    <>
      <header className='flex align-middle sticky top-0 z-30 h-16 shrink-0 items-center gap-2 bg-background px-4 sm:px-6'>
        <div className='flex-1 lg:flex-none lg:mx-auto lg:w-full lg:max-w-md'>
          <SearchBar />
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <CollectionCreateDialog />
          <ItemCreateDialog />
        </div>
      </header>
      <Separator />
    </>
  );
}
