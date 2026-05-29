import { Metadata } from 'next';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { handleForgotPassword } from '@/actions/forgot-password';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your DevStash password',
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Forgot your password?
          </h1>
          <p className='text-sm text-muted-foreground'>
            No worries, enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {success && (
          <div className='rounded-md bg-green-500/15 p-3 text-sm text-green-600'>
            {success}
          </div>
        )}

        {error && (
          <div className='rounded-md bg-red-500/15 p-3 text-sm text-red-600'>
            {error}
          </div>
        )}

        <form
          action={handleForgotPassword}
          className='space-y-4'
        >
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
              className='h-10'
            />
          </div>

          <Button type='submit' className='w-full h-10'>
            Send reset link
          </Button>
        </form>

        <p className='text-center text-sm text-muted-foreground'>
          <Link
            href='/sign-in'
            className='font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors'
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
