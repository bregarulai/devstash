'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useItemDrawer } from './ItemDrawerProvider';
import { DrawerHeader } from './DrawerHeader';
import { DrawerActions } from './DrawerActions';
import { DrawerSkeleton } from './DrawerSkeleton';
import { DrawerError } from './DrawerError';
import { DrawerContent } from './DrawerContent';
import { DrawerEditContent, type DrawerEditContentHandle } from './DrawerEditContent';
import { updateItemAction } from '@/actions/items';

function ItemDrawerContent() {
  const {
    isOpen,
    item,
    isLoading,
    error,
    isEditing,
    closeDrawer,
    updateItem,
    startEditing,
    stopEditing,
  } = useItemDrawer();

  const router = useRouter();
  const editRef = useRef<DrawerEditContentHandle>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [canSave, setCanSave] = useState(false);

  const handleStartEditing = useCallback(() => {
    setCanSave(false);
    startEditing();
  }, [startEditing]);

  const handleStopEditing = useCallback(() => {
    setCanSave(false);
    stopEditing();
  }, [stopEditing]);

  const handleSave = useCallback(async () => {
    if (!item || !editRef.current) return;

    const formData = editRef.current.getFormData();
    setIsSaving(true);

    try {
      const result = await updateItemAction(item.id, formData);

      if (result.success) {
        updateItem(result.data);
        handleStopEditing();
        toast.success('Item updated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update item');
      }
    } catch {
      toast.error('Failed to update item');
    } finally {
      setIsSaving(false);
    }
  }, [item, updateItem, handleStopEditing, router]);

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
            <DrawerActions
              item={item}
              updateItem={updateItem}
              isEditing={isEditing}
              onStartEditing={handleStartEditing}
              onStopEditing={handleStopEditing}
              isSaving={isSaving}
              canSave={canSave}
              onSave={handleSave}
            />
          </div>
        )}

        <div className='flex-1 overflow-y-auto px-6'>
          {isLoading && <DrawerSkeleton />}
          {error && <DrawerError message={error} />}
          {!isLoading && !error && item && !isEditing && (
            <DrawerContent item={item} />
          )}
          {!isLoading && !error && item && isEditing && (
            <DrawerEditContent ref={editRef} item={item} onCanSaveChange={setCanSave} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ItemDrawer() {
  return <ItemDrawerContent />;
}
