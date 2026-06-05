'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
import { handleDeleteAccount } from '@/actions/auth';

export function DeleteAccountDialog() {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  async function handleDelete() {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type DELETE MY ACCOUNT to confirm');
      return;
    }

    setError('');
    setIsPending(true);
    try {
      const result = await handleDeleteAccount();

      if ('error' in result) {
        setError(result.error || 'Failed to delete account');
        setIsPending(false);
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
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
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
              className={`${error ? 'border-destructive' : ''} mt-2`}
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
