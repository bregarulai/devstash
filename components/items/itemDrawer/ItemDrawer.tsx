'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { UnsavedChangesDialog } from '@/components/shared/UnsavedChangesDialog/UnsavedChangesDialog';
import { useItemDrawer } from './ItemDrawerProvider';
import { DrawerHeader } from './DrawerHeader';
import { DrawerActions } from './DrawerActions';
import { DrawerSkeleton } from './DrawerSkeleton';
import { DrawerError } from './DrawerError';
import { DrawerContent } from './DrawerContent';
import { DrawerEditContent, type DrawerEditContentHandle } from './DrawerEditContent';
import { updateItemAction } from '@/actions';
import { triggerDownload } from '@/lib/utils/download';
import { useUnsavedChanges } from './UnsavedChangesProvider';

function ItemDrawerContent() {
  const {
    isOpen,
    item,
    isLoading,
    error,
    isEditing,
    isPro,
    closeDrawer,
    updateItem,
    startEditing,
    stopEditing,
  } = useItemDrawer();

  const router = useRouter();
  const editRef = useRef<DrawerEditContentHandle>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'close' | 'stopEditing' | null>(null);

  const { registerCheckFn, unregisterCheckFn } = useUnsavedChanges();

  const checkUnsavedChanges = useCallback(() => {
    return isEditing && (editRef.current?.hasUnsavedChanges() ?? false);
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      registerCheckFn(checkUnsavedChanges);
    } else {
      unregisterCheckFn();
    }
    return () => unregisterCheckFn();
  }, [isEditing, checkUnsavedChanges, registerCheckFn, unregisterCheckFn]);

  useEffect(() => {
    if (!isEditing) return;

    const handler = (e: BeforeUnloadEvent) => {
      if (editRef.current?.hasUnsavedChanges()) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isEditing]);

  const handleStartEditing = useCallback(() => {
    setCanSave(false);
    startEditing();
  }, [startEditing]);

  const handleStopEditing = useCallback(() => {
    if (editRef.current?.hasUnsavedChanges()) {
      setPendingAction('stopEditing');
      setShowUnsavedDialog(true);
    } else {
      setCanSave(false);
      stopEditing();
    }
  }, [stopEditing]);

  const handleCloseDrawer = useCallback(() => {
    if (isEditing && editRef.current?.hasUnsavedChanges()) {
      setPendingAction('close');
      setShowUnsavedDialog(true);
    } else {
      closeDrawer();
    }
  }, [isEditing, closeDrawer]);

  const handleConfirmDiscard = useCallback(() => {
    setShowUnsavedDialog(false);
    if (pendingAction === 'close') {
      closeDrawer();
    } else if (pendingAction === 'stopEditing') {
      setCanSave(false);
      stopEditing();
    }
    setPendingAction(null);
  }, [pendingAction, closeDrawer, stopEditing]);

  const handleCancelDiscard = useCallback(() => {
    setShowUnsavedDialog(false);
    setPendingAction(null);
  }, []);

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

  const handleDownload = useCallback(() => {
    triggerDownload(item?.fileUrl, item?.fileName);
  }, [item]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleCloseDrawer()}>
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
                onMutate={() => router.refresh()}
                onClose={handleCloseDrawer}
              />
            </div>
          )}

          <div className='flex-1 overflow-y-auto px-6'>
            {isLoading && <DrawerSkeleton />}
            {error && <DrawerError message={error} />}
            {!isLoading && !error && item && !isEditing && (
              <DrawerContent item={item} onDownload={handleDownload} />
            )}
            {!isLoading && !error && item && isEditing && (
              <DrawerEditContent ref={editRef} item={item} isPro={isPro} onCanSaveChange={setCanSave} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
      />
    </>
  );
}

export function ItemDrawer() {
  return <ItemDrawerContent />;
}
