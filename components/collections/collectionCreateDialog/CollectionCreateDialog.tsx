'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FolderDown } from 'lucide-react';
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
import { collectionCreateSchema, type CollectionCreateValues } from '@/types/db';
import { createCollectionAction } from '@/actions';

interface CollectionCreateDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CollectionCreateDialog({ open: externalOpen, onOpenChange: externalOnOpenChange }: CollectionCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isOpen = externalOpen ?? internalOpen;
  const setOpen = externalOnOpenChange ?? setInternalOpen;

  const form = useForm<CollectionCreateValues>({
    resolver: zodResolver(collectionCreateSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = form;

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await createCollectionAction(data);

      if (result.success) {
        toast.success('Collection created successfully');
        setOpen(false);
        reset();
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
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button size='sm' variant='outline'>
            <FolderDown className='mr-2 h-4 w-4' />
            New Collection
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='max-w-md p-6' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Add a new collection to organize your items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className='space-y-4'>
          <Field data-invalid={errors.name ? 'true' : undefined}>
            <FieldLabel htmlFor='name'>
              Name <span className='text-destructive'>*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                id='name'
                {...register('name')}
                placeholder='Collection name'
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
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
              {isPending ? 'Creating...' : 'Create Collection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
