'use client';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/fileUpload/FileUpload/FileUpload';
import { ItemTypeSelector } from './ItemTypeSelector';
import { ContentTypeField } from './ContentTypeField';
import { UploadProgressIndicator } from './UploadProgressIndicator';
import { useItemCreateForm } from '@/hooks/useItemCreateForm/useItemCreateForm';
import {
  SHOW_CONTENT,
  SHOW_URL,
  SHOW_FILE_UPLOAD,
  SHOW_LANGUAGE,
  IMAGE_ACCEPT,
  FILE_ACCEPT,
  IMAGE_MAX_SIZE,
  FILE_MAX_SIZE,
} from '@/lib/constants';

export function ItemCreateDialog() {
  const {
    open,
    setOpen,
    isPending,
    isUploading,
    uploadProgress,
    register,
    errors,
    selectedType,
    contentValue,
    languageValue,
    setValue,
    onSubmit,
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
        <form onSubmit={onSubmit} className='space-y-4'>
          <Field data-invalid={errors.itemType ? 'true' : undefined}>
            <FieldLabel htmlFor='itemType'>Type</FieldLabel>
            <FieldContent>
              <ItemTypeSelector
                selectedType={selectedType}
                onSelect={handleItemTypeSelect}
              />
              {errors.itemType && (
                <FieldError>{errors.itemType.message}</FieldError>
              )}
            </FieldContent>
          </Field>

          <Field data-invalid={errors.title ? 'true' : undefined}>
            <FieldLabel htmlFor='title'>
              Title <span className='text-destructive'>*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                id='title'
                {...register('title')}
                placeholder='Item title'
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field data-invalid={errors.description ? 'true' : undefined}>
            <FieldLabel htmlFor='description'>Description</FieldLabel>
            <FieldContent>
              <Textarea
                id='description'
                {...register('description')}
                placeholder='Optional description'
                rows={2}
                className='resize-none'
              />
              {errors.description && (
                <FieldError>{errors.description.message}</FieldError>
              )}
            </FieldContent>
          </Field>

          {SHOW_FILE_UPLOAD.includes(selectedType) && (
            <Field data-invalid={errors.fileUrl ? 'true' : undefined}>
              <FieldLabel>
                {selectedType === 'image' ? 'Image' : 'File'} <span className='text-destructive'>*</span>
              </FieldLabel>
              <FieldContent>
                <FileUpload
                  accept={selectedType === 'image' ? IMAGE_ACCEPT : FILE_ACCEPT}
                  maxSize={selectedType === 'image' ? IMAGE_MAX_SIZE : FILE_MAX_SIZE}
                  fileType={selectedType === 'image' ? 'image' : 'file'}
                  onFileSelect={handleFileSelect}
                  onError={(err) => toast.error(err)}
                />
                {errors.fileUrl && (
                  <FieldError>{errors.fileUrl.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          )}

          {SHOW_CONTENT.includes(selectedType) && (
            <Field data-invalid={errors.content ? 'true' : undefined}>
              <FieldLabel htmlFor='content'>
                Content <span className='text-destructive'>*</span>
              </FieldLabel>
              <FieldContent>
                <ContentTypeField
                  selectedType={selectedType}
                  contentValue={contentValue || ''}
                  languageValue={languageValue || ''}
                  register={register}
                  setValue={setValue}
                />
                {errors.content && (
                  <FieldError>{errors.content.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          )}

          {SHOW_URL.includes(selectedType) && (
            <Field data-invalid={errors.url ? 'true' : undefined}>
              <FieldLabel htmlFor='url'>
                URL <span className='text-destructive'>*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id='url'
                  {...register('url')}
                  placeholder='https://...'
                />
                {errors.url && <FieldError>{errors.url.message}</FieldError>}
              </FieldContent>
            </Field>
          )}

          {SHOW_LANGUAGE.includes(selectedType) && (
            <Field data-invalid={errors.language ? 'true' : undefined}>
              <FieldLabel htmlFor='language'>Language</FieldLabel>
              <FieldContent>
                <Input
                  id='language'
                  {...register('language')}
                  placeholder='e.g. typescript, python'
                />
                {errors.language && (
                  <FieldError>{errors.language.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          )}

          <Field data-invalid={errors.tags ? 'true' : undefined}>
            <FieldLabel htmlFor='tags'>Tags</FieldLabel>
            <FieldContent>
              <Input
                id='tags'
                placeholder='Comma-separated tags'
                onChange={(e) => handleTagsChange(e.target.value)}
              />
              {errors.tags && <FieldError>{errors.tags.message}</FieldError>}
            </FieldContent>
          </Field>

          {isUploading && (
            <UploadProgressIndicator progress={uploadProgress} />
          )}

          <div className='flex justify-end gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isUploading ? 'Uploading...' : isPending ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
