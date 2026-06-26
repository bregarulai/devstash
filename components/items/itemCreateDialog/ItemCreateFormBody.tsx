'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/fileUpload/FileUpload/FileUpload';
import { LanguageSelect } from '@/components/codeEditor/LanguageSelect/LanguageSelect';
import { ItemTypeSelector } from './ItemTypeSelector';
import { ContentTypeField } from './ContentTypeField';
import { UploadProgressIndicator } from './UploadProgressIndicator';
import { CreateFormField } from './CreateFormField';
import { CollectionPicker } from '@/components/collections/collectionPicker/CollectionPicker';
import {
  SHOW_CONTENT,
  SHOW_URL,
  SHOW_FILE_UPLOAD,
  SHOW_LANGUAGE,
  getFileConfig,
} from '@/lib/constants';
import type { ItemType, ItemCreateValues } from '@/types/db';
import type { UseFormReturn } from 'react-hook-form';

interface ItemCreateFormBodyProps {
  form: UseFormReturn<ItemCreateValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  selectedType: ItemType;
  contentValue: string | null | undefined;
  languageValue: string | null | undefined;
  collectionIds: string[];
  isPending: boolean;
  isUploading: boolean;
  uploadProgress: number;
  isPro: boolean;
  handleItemTypeSelect: (type: ItemType) => void;
  handleFileSelect: (file: File) => void;
  handleTagsChange: (value: string) => void;
  handleCollectionChange: (ids: string[]) => void;
  setOpen: (open: boolean) => void;
}

export function ItemCreateFormBody({
  form,
  onSubmit,
  selectedType,
  contentValue,
  languageValue,
  collectionIds,
  isPending,
  isUploading,
  uploadProgress,
  isPro,
  handleItemTypeSelect,
  handleFileSelect,
  handleTagsChange,
  handleCollectionChange,
  setOpen,
}: ItemCreateFormBodyProps) {
  const { register, formState } = form;
  const { errors } = formState;
  const fileConfig = getFileConfig(selectedType);

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <CreateFormField
        label='Type'
        error={errors.itemType?.message}
      >
        <ItemTypeSelector
          selectedType={selectedType}
          onSelect={handleItemTypeSelect}
          isPro={isPro}
        />
      </CreateFormField>

      <CreateFormField
        label='Title'
        htmlFor='title'
        required
        error={errors.title?.message}
      >
        <Input
          id='title'
          {...register('title')}
          placeholder='Item title'
        />
      </CreateFormField>

      <CreateFormField
        label='Description'
        htmlFor='description'
        error={errors.description?.message}
      >
        <Textarea
          id='description'
          {...register('description')}
          placeholder='Optional description'
          rows={2}
          className='resize-none'
        />
      </CreateFormField>

      {SHOW_FILE_UPLOAD.includes(selectedType) && (
        <CreateFormField
          label={selectedType === 'image' ? 'Image' : 'File'}
          required
          error={errors.fileUrl?.message}
        >
          <FileUpload
            accept={fileConfig.accept}
            maxSize={fileConfig.maxSize}
            fileType={fileConfig.fileType}
            onFileSelect={handleFileSelect}
            onError={(err) => toast.error(err)}
          />
        </CreateFormField>
      )}

      {SHOW_LANGUAGE.includes(selectedType) && (
        <CreateFormField
          label='Language'
          htmlFor='language'
          error={errors.language?.message}
        >
          <LanguageSelect
            id='language'
            value={languageValue || ''}
            onChange={(value) => form.setValue('language', value, { shouldValidate: true })}
          />
        </CreateFormField>
      )}

      {SHOW_CONTENT.includes(selectedType) && (
        <CreateFormField
          label='Content'
          htmlFor='content'
          required
          error={errors.content?.message}
        >
          <ContentTypeField
            selectedType={selectedType}
            contentValue={contentValue || ''}
            languageValue={languageValue || ''}
            register={register}
            setValue={form.setValue}
          />
        </CreateFormField>
      )}

      {SHOW_URL.includes(selectedType) && (
        <CreateFormField
          label='URL'
          htmlFor='url'
          required
          error={errors.url?.message}
        >
          <Input
            id='url'
            {...register('url')}
            placeholder='https://...'
          />
        </CreateFormField>
      )}

      <CreateFormField
        label='Tags'
        htmlFor='tags'
        error={errors.tags?.message}
      >
        <Input
          id='tags'
          placeholder='Comma-separated tags'
          onChange={(e) => handleTagsChange(e.target.value)}
        />
      </CreateFormField>

      <CreateFormField
        label='Collections'
        error={errors.collectionIds?.message}
      >
        <CollectionPicker
          value={collectionIds}
          onChange={handleCollectionChange}
        />
      </CreateFormField>

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
  );
}
