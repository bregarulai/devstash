'use client';

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from '@/components/ui/field';
import { handleSignIn } from '@/actions/sign-in';
import { signInSchema, type SignInFormData } from '@/types/db';

interface SignInFormProps {
  email?: string;
}

export function SignInForm({ email }: SignInFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: email || '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    formData.set('email', data.email);
    formData.set('password', data.password);
    startTransition(() => {
      (async () => {
        await handleSignIn(formData);
      })();
    });
  });

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <Field data-invalid={errors.email ? 'true' : undefined}>
        <FieldLabel htmlFor='email' className='text-sm font-medium'>
          Email
        </FieldLabel>
        <FieldContent>
          <Input
            id='email'
            type='text'
            placeholder='you@example.com'
            autoComplete='username'
            aria-invalid={errors.email ? 'true' : undefined}
            className='h-10'
            {...register('email')}
          />
          {errors.email && (
            <FieldError>{errors.email.message}</FieldError>
          )}
        </FieldContent>
      </Field>

      <Field data-invalid={errors.password ? 'true' : undefined}>
        <FieldLabel htmlFor='password' className='text-sm font-medium'>
          Password
        </FieldLabel>
        <FieldContent>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              autoComplete='current-password'
              aria-invalid={errors.password ? 'true' : undefined}
              className='h-10 pr-10'
              {...register('password')}
            />
            <button
              type='button'
              className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </FieldContent>
      </Field>

      <Button type='submit' disabled={isPending} className='w-full h-10'>
        {isPending ? 'Signing in...' : 'Sign in with email'}
      </Button>
    </form>
  );
}
