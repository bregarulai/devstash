import { Eye, EyeOff } from 'lucide-react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function PasswordField({
  label,
  name,
  show,
  toggle,
  error,
}: {
  label: string;
  name: string;
  show: boolean;
  toggle: () => void;
  error?: string;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <Input
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete="new-password"
          className={error ? 'border-destructive' : ''}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        {error && <FieldError>{error}</FieldError>}
      </div>
    </Field>
  );
}
