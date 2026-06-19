import { type ReactNode } from 'react';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from '@/components/ui/field';

interface CreateFormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function CreateFormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
}: CreateFormFieldProps) {
  return (
    <Field data-invalid={error ? 'true' : undefined}>
      <FieldLabel htmlFor={htmlFor}>
        {label} {required && <span className='text-destructive'>*</span>}
      </FieldLabel>
      <FieldContent>
        {children}
        {error && <FieldError>{error}</FieldError>}
      </FieldContent>
    </Field>
  );
}
