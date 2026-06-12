import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/prisma';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { ResendVerificationForm } from '@/components/auth/resendVerificationForm/ResendVerificationForm';

export const metadata: Metadata = {
  title: 'Verify Your Email - DevStash',
  description: 'Verify your email to access your DevStash account',
};

export const dynamic = 'force-dynamic';

export default async function VerifyRequiredPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/sign-in');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { emailVerified: true },
  });

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION !== "false";
  if (emailVerificationEnabled && dbUser?.emailVerified) {
    redirect('/dashboard');
  }

  const email = session.user.email;
  const maskedEmail = maskEmail(email);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4'>
            <Mail className='h-12 w-12 text-muted-foreground' />
          </div>
          <CardTitle className='text-2xl'>Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to {maskedEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground text-center'>
            Please verify your email to access your account. Didn&apos;t receive
            the email? Click the button below to resend.
          </p>

          <ResendVerificationForm email={email} />

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                Or
              </span>
            </div>
          </div>

          <div className='text-center'>
            <Link
              href='/sign-in'
              className='text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors'
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
