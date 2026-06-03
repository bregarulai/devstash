"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function DeleteAccountDialog() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  async function handleDelete() {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type DELETE MY ACCOUNT to confirm');
      return;
    }

    setError('');
    startTransition(async () => {
      try {
        const response = await fetch('/api/profile/delete-account', {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to delete account');
          return;
        }

        toast.success('Account deleted', {
          description: 'Your account has been permanently deleted.',
        });

        setOpen(false);
        setConfirmText('');
        window.location.href = '/sign-in';
      } catch {
        setError('An unexpected error occurred');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All your data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <code className="px-1.5 py-0.5 bg-muted rounded text-xs">DELETE MY ACCOUNT</code> to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError('');
              }}
              placeholder="DELETE MY ACCOUNT"
              className={error ? 'border-destructive' : ''}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || confirmText !== 'DELETE MY ACCOUNT'}
          >
            {isPending ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
