'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { usePasswordToggle } from '@/hooks/usePasswordToggle/usePasswordToggle';
import { PasswordField } from '@/components/shared/PasswordField/PasswordField';
import { handleChangePassword } from '@/actions';
import { changePasswordSchema, type ChangePasswordValues } from '@/types/db';

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const currentToggle = usePasswordToggle();
  const newToggle = usePasswordToggle();
  const confirmToggle = usePasswordToggle();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    startTransition(() => {
      setGeneralError(null);
    });

    try {
      const result = await handleChangePassword(data);

      if ('error' in result) {
        setGeneralError(result.error ?? 'An unexpected error occurred');
        return;
      }

      toast.success('Password updated', {
        description: 'Your password has been changed successfully.',
      });

      onSuccess?.();
      reset();
      setGeneralError(null);
    } catch {
      setGeneralError('An unexpected error occurred');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Lock className='size-5' />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generalError && (
          <Alert variant='destructive' className='mb-4'>
            <AlertTriangle className='size-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <PasswordField
            label='Current Password'
            show={currentToggle.show}
            toggle={currentToggle.toggle}
            error={fieldErrors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <PasswordField
            label='New Password'
            show={newToggle.show}
            toggle={newToggle.toggle}
            error={fieldErrors.newPassword?.message}
            {...register('newPassword')}
          />

          <PasswordField
            label='Confirm New Password'
            show={confirmToggle.show}
            toggle={confirmToggle.toggle}
            error={fieldErrors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type='submit'
            disabled={isPending}
            className='w-full sm:w-auto'
          >
            {isPending ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
