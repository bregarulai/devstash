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

export function ItemCreateDialog() {
  const {
    open,
    setOpen,
    isPending,
    isUploading,
    uploadProgress,
    form,
    onSubmit,
    selectedType,
    contentValue,
    languageValue,
    handleOpenChange,
    handleItemTypeSelect,
    handleFileSelect,
    handleTagsChange,
  } = useItemCreateForm();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          New Item
        </Button>
      </DialogTrigger>
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
          isPending={isPending}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          handleItemTypeSelect={handleItemTypeSelect}
          handleFileSelect={handleFileSelect}
          handleTagsChange={handleTagsChange}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
