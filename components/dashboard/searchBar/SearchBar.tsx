'use client';

import { Field } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Search } from 'lucide-react';
import { useCommandPalette } from '@/hooks/useCommandPalette/useCommandPalette';

export function SearchBar() {
  const { openPalette } = useCommandPalette();

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
