'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import { getCollectionsForPickerAction } from '@/actions';
import { Check, ChevronsUpDown, Folder, X } from 'lucide-react';

interface CollectionPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export function CollectionPicker({ value, onChange, className }: CollectionPickerProps) {
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCollectionsForPickerAction();
        if (result.success) {
          setCollections(result.data);
        } else {
          setError(result.error);
        }
      } catch {
        setError('Failed to load collections');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function toggleCollection(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function removeCollection(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  const selectedCollections = collections.filter((c) => value.includes(c.id));

  if (isLoading) {
    return (
      <div className={cn('flex gap-1.5', className)}>
        <div className='h-9 flex-1 rounded-md border border-input bg-muted/50 animate-pulse' />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-sm text-destructive', className)}>
        {error}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No collections yet. Create one first.
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-start h-9 font-normal'
          >
            <Folder className='mr-2 size-4 shrink-0 opacity-50' />
            {selectedCollections.length > 0
              ? `${selectedCollections.length} selected`
              : 'Select collections...'}
            <ChevronsUpDown className='ml-auto size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent side='top' align='start' className='w-[--radix-popover-trigger-width] p-0'>
          <Command>
            <CommandInput placeholder='Search collections...' />
            <CommandList className='pt-1'>
              <CommandEmpty>No collections found.</CommandEmpty>
              {collections.map((collection) => (
                <CommandItem
                  key={collection.id}
                  onSelect={() => toggleCollection(collection.id)}
                  data-checked={value.includes(collection.id)}
                >
                  <Check
                    className={cn(
                      'size-4 shrink-0',
                      value.includes(collection.id) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {collection.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCollections.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {selectedCollections.map((collection) => (
            <Badge
              key={collection.id}
              variant='secondary'
              className='gap-1 pr-1'
            >
              {collection.name}
              <button
                type='button'
                onClick={() => removeCollection(collection.id)}
                className='ml-0.5 rounded-full p-0.5 hover:bg-muted'
              >
                <X className='size-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
