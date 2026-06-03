"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { usePasswordToggle } from '@/hooks/usePasswordToggle';
import { PasswordField } from '@/components/shared/PasswordField/PasswordField';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const currentToggle = usePasswordToggle();
  const newToggle = usePasswordToggle();
  const confirmToggle = usePasswordToggle();
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = changePasswordSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/profile/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({ general: data.error || 'Failed to change password' });
          return;
        }

        toast.success('Password updated', {
          description: 'Your password has been changed successfully.',
        });

        (e.currentTarget as HTMLFormElement).reset();
        setErrors({});
      } catch {
        setErrors({ general: 'An unexpected error occurred' });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="size-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {errors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            show={currentToggle.show}
            toggle={currentToggle.toggle}
            error={errors.currentPassword}
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            show={newToggle.show}
            toggle={newToggle.toggle}
            error={errors.newPassword}
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            show={confirmToggle.show}
            toggle={confirmToggle.toggle}
            error={errors.confirmPassword}
          />

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
