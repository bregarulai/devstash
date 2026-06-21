'use client';

import { Field } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useCommandPalette } from '@/hooks/useCommandPalette/useCommandPalette';

interface SearchBarProps {
  iconOnly?: boolean;
}

export function SearchBar({ iconOnly = false }: SearchBarProps) {
  const { openPalette } = useCommandPalette();

  if (iconOnly) {
    return (
      <Button variant='ghost' size='icon' onClick={openPalette} aria-label='Search'>
        <Search className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <Field>
      <InputGroup onClick={openPalette} className='cursor-pointer'>
        <InputGroupAddon align='inline-start'>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder='Search...' readOnly className='cursor-pointer' />
        <InputGroupAddon align='inline-end'>
          <span className='text-xs text-muted-foreground'>⌘K</span>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
