import { Field, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <Field>
      <InputGroup>
        <InputGroupAddon align='inline-start'>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder='Search...' />
      </InputGroup>
    </Field>
  );
}
