import { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RegisterToast } from '@/components/auth/registerToast/RegisterToast';
import { RegisterForm } from '@/components/registerForm/RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a DevStash account',
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
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
