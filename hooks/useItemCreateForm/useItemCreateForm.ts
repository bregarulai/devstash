import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { itemCreateSchema, type ItemCreateValues, type ItemType } from '@/types/db';
import { createItemAction } from '@/actions';
import { useFileUpload } from '@/hooks/useFileUpload/useFileUpload';

export function useItemCreateForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const fileUpload = useFileUpload();

  const useFormReturn = useForm<ItemCreateValues>({
    resolver: zodResolver(itemCreateSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      itemType: 'snippet',
      content: '',
      language: '',
      url: '',
      fileUrl: '',
      fileName: '',
      fileSize: undefined,
      tags: [],
      collectionIds: [],
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
  } = useFormReturn;

  const selectedType = useWatch({ control, name: 'itemType' }) as ItemType;
  const contentValue = useWatch({ control, name: 'content' });
  const languageValue = useWatch({ control, name: 'language' });
  const collectionIds = (useWatch({ control, name: 'collectionIds' }) ?? []) as string[];

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      let fileUrl = data.fileUrl ?? '';
      let fileName = data.fileName ?? '';
      let fileSize = data.fileSize;

      if (fileUpload.pendingFile) {
        try {
          const result = await fileUpload.upload();
          fileUrl = result.url;
          fileName = result.name;
          fileSize = result.size;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'File upload failed');
          return;
        }
      }

      const result = await createItemAction({
        ...data,
        fileUrl,
        fileName,
        fileSize,
      });

      if (result.success) {
        toast.success('Item created successfully');
        setOpen(false);
        reset();
        fileUpload.reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      fileUpload.reset();
    }
  }

  function handleItemTypeSelect(type: ItemType) {
    reset((prev) => ({
      ...prev,
      itemType: type,
      fileUrl: '',
      fileName: '',
      fileSize: undefined,
    }));
    fileUpload.reset();
  }

  function handleFileSelect(file: File) {
    fileUpload.handleFileSelect(file);
    setValue('fileName', file.name, { shouldValidate: true });
    setValue('fileSize', file.size, { shouldValidate: true });
  }

  function handleTagsChange(value: string) {
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    reset((prev) => ({ ...prev, tags }));
  }

  function handleCollectionChange(ids: string[]) {
    reset((prev) => ({ ...prev, collectionIds: ids }));
  }

  const isUploading = isPending && !!fileUpload.pendingFile;

  return {
    open,
    setOpen,
    isPending,
    isUploading,
    uploadProgress: fileUpload.uploadProgress,
    form: useFormReturn,
    onSubmit,
    selectedType,
    contentValue,
    languageValue,
    collectionIds,
    handleOpenChange,
    handleItemTypeSelect,
    handleFileSelect,
    handleTagsChange,
    handleCollectionChange,
  };
}
