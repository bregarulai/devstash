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
import { handleResetPassword } from '@/actions';
import { ResetPasswordToast } from '@/components/auth/resetPasswordToast/ResetPasswordToast';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your DevStash account',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
      <ResetPasswordToast />
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form action={handleResetPassword} className='space-y-4'>
            <input type='hidden' name='token' value={token || ''} />
            <input type='hidden' name='email' value={email || ''} />

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                New password
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

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword' className='text-sm font-medium'>
                Confirm new password
              </Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                placeholder='••••••••'
                className='h-10'
              />
            </div>

            <Button type='submit' className='w-full h-10'>
              Reset password
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
