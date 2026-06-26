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
  labelAction?: ReactNode;
  children: ReactNode;
}

export function CreateFormField({
  label,
  htmlFor,
  required = false,
  error,
  labelAction,
  children,
}: CreateFormFieldProps) {
  return (
    <Field data-invalid={error ? 'true' : undefined}>
      <div className='flex items-center justify-between gap-2'>
        <FieldLabel htmlFor={htmlFor}>
          {label} {required && <span className='text-destructive'>*</span>}
        </FieldLabel>
        {labelAction}
      </div>
      <FieldContent>
        {children}
        {error && <FieldError>{error}</FieldError>}
      </FieldContent>
    </Field>
  );
}
