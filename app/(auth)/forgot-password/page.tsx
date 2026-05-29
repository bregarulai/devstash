import { Metadata } from 'next';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { handleForgotPassword } from '@/actions/forgot-password';
import { ForgotPasswordToast } from '@/components/auth/forgot-password-toast';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your DevStash password',
};

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
      <ForgotPasswordToast />
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Forgot your password?</CardTitle>
          <CardDescription>
            No worries, enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form action={handleForgotPassword} className='space-y-4'>
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
        </CardContent>
      </Card>
    </div>
  );
}
