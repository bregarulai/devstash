'use client';

import { useTransition, useState, useMemo } from 'react';
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
import { handleRegister } from '@/actions/auth';
import {
  registerSchema,
  type RegisterFormData,
  passwordRequirements,
} from '@/types/register';

interface RegisterFormProps {
  error?: string;
  defaultValues?: Partial<RegisterFormData>;
}

export function RegisterForm({ error, defaultValues }: RegisterFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const passwordMet = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);

  const confirmPasswordMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return confirmPassword === password;
  }, [confirmPassword, password]);

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData();
    formData.set('name', data.name);
    formData.set('email', data.email);
    formData.set('password', data.password);
    formData.set('confirmPassword', data.confirmPassword);
    startTransition(() => {
      handleRegister(formData);
    });
  });

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <Field data-invalid={errors.name ? 'true' : undefined}>
        <FieldLabel htmlFor='name' className='text-sm font-medium'>
          Name
        </FieldLabel>
        <FieldContent>
          <Input
            id='name'
            className='h-10'
            type='text'
            placeholder='Your name'
            autoComplete='name'
            aria-invalid={errors.name ? 'true' : undefined}
            {...register('name')}
          />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </FieldContent>
      </Field>

      <Field data-invalid={errors.email ? 'true' : undefined}>
        <FieldLabel htmlFor='email' className='text-sm font-medium'>
          Email
        </FieldLabel>
        <FieldContent>
          <Input
            id='email'
            className='h-10'
            type='text'
            placeholder='you@example.com'
            autoComplete='email'
            aria-invalid={errors.email ? 'true' : undefined}
            {...register('email')}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
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
              autoComplete='new-password'
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
          {password && (
            <div className='mt-2 space-y-1.5' aria-live='polite'>
              {passwordMet.map((req) => (
                <div
                  key={req.label}
                  className={`flex items-center gap-2 text-xs ${req.met ? 'text-success' : 'text-muted-foreground'}`}
                >
                  <svg
                    className={`h-3.5 w-3.5 shrink-0 ${req.met ? 'text-success' : 'text-muted-foreground/40'}`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    {req.met ? (
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    ) : (
                      <circle cx='12' cy='12' r='10' strokeDasharray='2 2' />
                    )}
                  </svg>
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </FieldContent>
      </Field>

      <Field data-invalid={errors.confirmPassword ? 'true' : undefined}>
        <FieldLabel htmlFor='confirmPassword' className='text-sm font-medium'>
          Confirm Password
        </FieldLabel>
        <FieldContent>
          <div className='relative'>
            <Input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='••••••••'
              autoComplete='new-password'
              aria-invalid={errors.confirmPassword ? 'true' : undefined}
              className='h-10 pr-10'
              {...register('confirmPassword')}
            />
            <button
              type='button'
              className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {confirmPassword && (
            <div
              className={`mt-1.5 text-xs ${confirmPasswordMatch === true ? 'text-success' : confirmPasswordMatch === false ? 'text-destructive' : 'text-muted-foreground'}`}
              aria-live='polite'
            >
              {confirmPasswordMatch === true
                ? 'Passwords match'
                : confirmPasswordMatch === false
                  ? 'Passwords do not match'
                  : ''}
            </div>
          )}
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}
        </FieldContent>
      </Field>

      <Button type='submit' disabled={isPending} className='w-full h-10'>
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
