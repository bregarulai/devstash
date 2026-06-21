import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RegisterToast } from '@/components/auth/registerToast/RegisterToast';
import { RegisterForm } from '@/components/registerForm/RegisterForm';
import { SiteHeader } from '@/components/homepage/siteHeader/SiteHeader';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a DevStash account',
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await auth();
  const { error, success } = await searchParams;

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background px-4 pt-16'>
      <SiteHeader isAuthenticated={false} isHomepage={false} isAuthPage={true} />
      <RegisterToast />
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Create your account</CardTitle>
          <CardDescription>
            Sign up with your email to get started
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
              {decodeURIComponent(error)}
            </div>
          )}

          <RegisterForm defaultValues={success ? { name: '', email: '' } : undefined} />

          <p className='text-center text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link
              href='/sign-in'
              className='font-medium text-foreground underline underline-offset-4 hover:text-foreground transition-colors'
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
