'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { PlanTier } from '@/types/db';

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
      <div className='mx-auto max-w-4xl space-y-8'>
        {/* Page Title */}
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold text-foreground'>Settings</h1>
          <p className='text-sm text-muted-foreground'>
            Billing, editor preferences, and account management.
          </p>
        </div>

        {/* Billing */}
        <BillingSection planTier={planTier} usage={usage} />

        {/* Editor Preferences */}
        <EditorPreferencesForm />

        {/* Account Security */}
        {hasPassword && (
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold text-foreground'>Password</h2>
            <p className='text-sm text-muted-foreground'>
              Update your password to keep your account secure.
            </p>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline'>
                  <Lock className='size-4 mr-2' />
                  Change password
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <ChangePasswordForm onSuccess={() => setPasswordDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Delete Account */}
        <div className='space-y-3 rounded-xl border border-destructive/30 p-6'>
          <h2 className='text-lg font-semibold text-destructive'>Delete account</h2>
          <p className='text-sm text-muted-foreground'>
            Permanently remove your account and all associated data. This action
            cannot be undone.
          </p>
          <DeleteAccountDialog />
        </div>
      </div>
  );
}
