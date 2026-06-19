'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from '@/components/ui/field';
import { collectionUpdateSchema, type CollectionUpdateValues } from '@/types/db';
import { updateCollectionAction } from '@/actions';

interface CollectionEditDialogProps {
  collectionId: string;
  collectionName: string;
  collectionDescription: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CollectionEditDialog({
  collectionId,
  collectionName,
  collectionDescription,
  open: externalOpen,
  onOpenChange,
  trigger,
}: CollectionEditDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const open = externalOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<CollectionUpdateValues>({
    resolver: zodResolver(collectionUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      name: collectionName,
      description: collectionDescription ?? '',
    },
  });

  const { register, handleSubmit, reset, formState: { errors }, setValue } = form;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setValue('name', collectionName);
      setValue('description', collectionDescription ?? '');
    } else {
      reset();
    }
  };

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await updateCollectionAction(collectionId, data);

      if (result.success) {
        toast.success('Collection updated');
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant='ghost' size='sm' className='cursor-pointer'>
            <Pencil className='size-4' />
            <span className='text-xs text-muted-foreground'>Edit</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='max-w-md p-6' showCloseButton={false} onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update the collection name and description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className='space-y-4'>
          <Field data-invalid={errors.name ? 'true' : undefined}>
            <FieldLabel htmlFor='edit-name'>
              Name <span className='text-destructive'>*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                id='edit-name'
                {...register('name')}
                placeholder='Collection name'
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field data-invalid={errors.description ? 'true' : undefined}>
            <FieldLabel htmlFor='edit-description'>Description</FieldLabel>
            <FieldContent>
              <Textarea
                id='edit-description'
                {...register('description')}
                placeholder='Optional description'
                rows={2}
                className='resize-none'
              />
              {errors.description && <FieldError>{errors.description.message}</FieldError>}
            </FieldContent>
          </Field>

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
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
