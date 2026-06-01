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
import { handleRegister } from '@/actions/auth';
import { RegisterToast } from '@/components/auth/registerToast/RegisterToast';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a DevStash account',
};

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
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
          <form action={handleRegister} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium'>
                Name
              </Label>
              <Input
                id='name'
                name='name'
                required
                placeholder='Brett Trend'
                className='h-10'
              />
            </div>

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

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword' className='text-sm font-medium'>
                Confirm Password
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
              Create account
            </Button>
          </form>
          <p className='text-center text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link
              href='/sign-in'
              className='font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors'
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
