'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { ChangePasswordForm } from '@/components/settings/changePasswordForm/ChangePasswordForm';
import { DeleteAccountDialog } from '@/components/settings/deleteAccountDialog/DeleteAccountDialog';
import { EditorPreferencesForm } from '@/components/settings/editorPreferencesForm/EditorPreferencesForm';
import { BillingSection } from '@/components/settings/billingSection/BillingSection';

type PlanTier = 'free' | 'monthly' | 'yearly';

interface SettingsPageClientProps {
  hasPassword: boolean;
  planTier: PlanTier;
  usage?: {
    totalItems: number;
    totalCollections: number;
  };
}

export function SettingsPageClient({
  hasPassword,
  planTier,
  usage,
}: SettingsPageClientProps) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  return (
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Page Title */}
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold text-foreground'>Settings</h1>
          <p className='text-sm text-muted-foreground'>
            Manage your account settings and preferences.
          </p>
        </div>

        <Separator />

        {/* Billing */}
        <BillingSection planTier={planTier} usage={usage} />

        {/* Editor Preferences */}
        <EditorPreferencesForm />

        {/* Account Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col sm:flex-row gap-3'>
              {hasPassword && (
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline'>
                      <Lock className='size-4 mr-2' />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Update your account password. Make sure to use a strong,
                        unique password.
                      </DialogDescription>
                    </DialogHeader>
                    <ChangePasswordForm onSuccess={() => setPasswordDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
              <DeleteAccountDialog />
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
