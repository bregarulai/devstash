'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Code, Sparkles, Terminal, StickyNote, Link } from 'lucide-react';
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
import { CodeEditor } from '@/components/codeEditor/CodeEditor/CodeEditor';
import { itemCreateSchema, type ItemCreateValues } from '@/types/db';
import { createItemAction } from '@/actions';
import { CODE_EDITOR_TYPES } from '@/lib/constants';

const ITEM_TYPES = [
  { value: 'snippet' as const, label: 'Snippet', icon: Code },
  { value: 'prompt' as const, label: 'Prompt', icon: Sparkles },
  { value: 'command' as const, label: 'Command', icon: Terminal },
  { value: 'note' as const, label: 'Note', icon: StickyNote },
  { value: 'link' as const, label: 'Link', icon: Link },
] as const;

const SHOW_CONTENT = ['snippet', 'prompt', 'command', 'note'];
const SHOW_LANGUAGE = ['snippet', 'command'];
const SHOW_URL = ['link'];
export function ItemCreateDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ItemCreateValues>({
    resolver: zodResolver(itemCreateSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      itemType: 'snippet',
      content: '',
      language: '',
      url: '',
      tags: [],
    },
  });

  const selectedType = useWatch({ control, name: 'itemType' });
  const contentValue = useWatch({ control, name: 'content' });
  const languageValue = useWatch({ control, name: 'language' });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await createItemAction(data);
      if (result.success) {
        toast.success('Item created successfully');
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
              <div className='flex flex-wrap gap-2'>
                {ITEM_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type='button'
                      onClick={() => {
                        reset((prev) => ({
                          ...prev,
                          itemType: type.value,
                        }));
                      }}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedType === type.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className='h-4 w-4' />
                      {type.label}
                    </button>
                  );
                })}
              </div>
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

          {SHOW_CONTENT.includes(selectedType) && (
            <Field data-invalid={errors.content ? 'true' : undefined}>
              <FieldLabel htmlFor='content'>
                Content <span className='text-destructive'>*</span>
              </FieldLabel>
              <FieldContent>
                {CODE_EDITOR_TYPES.includes(selectedType) ? (
                  <CodeEditor
                    value={contentValue || ''}
                    onChange={(v) => setValue('content', v, { shouldValidate: true })}
                    language={languageValue || 'plaintext'}
                  />
                ) : (
                  <Textarea
                    id='content'
                    {...register('content')}
                    placeholder='Content'
                    rows={4}
                    className='resize-none font-mono text-sm'
                  />
                )}
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
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);
                  reset((prev) => ({ ...prev, tags }));
                }}
              />
              {errors.tags && <FieldError>{errors.tags.message}</FieldError>}
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
              {isPending ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
