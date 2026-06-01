'use client';

import { useTransition, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { handleSignIn } from '@/actions/sign-in';

interface SignInFormProps {
  email?: string;
}

export function SignInForm({ email }: SignInFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      await handleSignIn(new FormData(form));
    });
  };

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-medium'>
          Email
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          required
          placeholder='you@example.com'
          autoComplete='username'
          defaultValue={email}
          className='h-10'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password' className='text-sm font-medium'>
          Password
        </Label>
        <div className='relative'>
          <Input
            id='password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            required
            placeholder='••••••••'
            autoComplete='current-password'
            className='h-10 pr-10'
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
      </div>

      <Button type='submit' disabled={isPending} className='w-full h-10'>
        {isPending ? 'Signing in...' : 'Sign in with email'}
      </Button>
    </form>
  );
}
