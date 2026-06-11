'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useItemDrawer } from './ItemDrawerProvider';
import { DrawerHeader } from './DrawerHeader';
import { DrawerActions } from './DrawerActions';
import { DrawerSkeleton } from './DrawerSkeleton';
import { DrawerError } from './DrawerError';
import { DrawerContent } from './DrawerContent';

function ItemDrawerContent() {
  const { isOpen, item, isLoading, error, closeDrawer, updateItem } = useItemDrawer();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side='right'
        aria-describedby={undefined}
        className='flex flex-col gap-0 overflow-hidden p-0 sm:max-w-sm'
      >
        <DrawerHeader item={item} />

        {item && (
          <div className='border-b border-border px-6 py-3'>
            <DrawerActions item={item} updateItem={updateItem} />
          </div>
        )}

        <div className='flex-1 overflow-y-auto px-6'>
          {isLoading && <DrawerSkeleton />}
          {error && <DrawerError message={error} />}
          {!isLoading && !error && item && <DrawerContent item={item} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ItemDrawer() {
  return <ItemDrawerContent />;
}
