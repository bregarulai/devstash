import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your DevStash account',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const { error } = await searchParams;

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='text-center space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Sign in to DevStash
          </h1>
          <p className='text-sm text-muted-foreground'>
            Use your email or GitHub account to sign in
          </p>
        </div>

        {error === 'InvalidCredentials' && (
          <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
            Invalid email or password. Please try again.
          </div>
        )}

        <div className='space-y-4'>
          <form
            action={async (formData) => {
              'use server';
              try {
                await signIn('credentials', formData);
              } catch (error) {
                if (error instanceof AuthError) {
                  redirect('/sign-in?error=InvalidCredentials');
                }
                throw error;
              }
            }}
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

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Password
              </Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                placeholder='••••••••'
                className='h-10'
              />
            </div>

            <Button type='submit' className='w-full h-10'>
              Sign in with email
            </Button>
          </form>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>

          <form
            action={async () => {
              'use server';
              await signIn('github', { redirectTo: '/dashboard' });
            }}
          >
            <Button type='submit' variant='outline' className='w-full h-10'>
              <svg
                className='mr-2 h-4 w-4'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
              </svg>
              Sign in with GitHub
            </Button>
          </form>
        </div>

        <p className='text-center text-sm text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link
            href='/register'
            className='font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors'
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
