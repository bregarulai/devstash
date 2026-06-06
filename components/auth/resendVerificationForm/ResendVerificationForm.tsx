'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { handleResendVerification } from '@/actions/resend-verification';
import { Loader2 } from 'lucide-react';

interface ResendVerificationFormProps {
  email: string;
}

export function ResendVerificationForm({ email }: ResendVerificationFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await handleResendVerification(email);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type='submit'
        disabled={isPending}
        className='w-full h-10'
      >
        {isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Resending...
          </>
        ) : (
          'Resend verification email'
        )}
      </Button>
    </form>
  );
}
