'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ItemCreateFormBody } from './ItemCreateFormBody';
import { useItemCreateForm } from '@/hooks/useItemCreateForm/useItemCreateForm';

interface ItemCreateDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ItemCreateDialog({ open: externalOpen, onOpenChange: externalOnOpenChange }: ItemCreateDialogProps) {
  const {
    open: internalOpen,
    isPending,
    isUploading,
    uploadProgress,
    form,
    onSubmit,
    selectedType,
    contentValue,
    languageValue,
    collectionIds,
    handleOpenChange: internalHandleOpenChange,
    handleItemTypeSelect,
    handleFileSelect,
    handleTagsChange,
    handleCollectionChange,
  } = useItemCreateForm();

  const isOpen = externalOpen ?? internalOpen;
  const handleOpenChange = externalOnOpenChange ?? internalHandleOpenChange;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            New Item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className='max-w-md p-6 sm:max-w-lg sm:p-6'
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your collection.
          </DialogDescription>
        </DialogHeader>
        <ItemCreateFormBody
          form={form}
          onSubmit={onSubmit}
          selectedType={selectedType}
          contentValue={contentValue}
          languageValue={languageValue}
          collectionIds={collectionIds}
          isPending={isPending}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          handleItemTypeSelect={handleItemTypeSelect}
          handleFileSelect={handleFileSelect}
          handleTagsChange={handleTagsChange}
          handleCollectionChange={handleCollectionChange}
          setOpen={handleOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
