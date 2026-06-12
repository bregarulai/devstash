import { useState } from 'react';
import { toast } from 'sonner';

export function useDeleteAccount() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  async function deleteAccount(password: string) {
    let token = '';

    try {
      const res = await fetch('/api/auth/csrf');
      const data = await res.json();
      token = data.csrfToken || '';
    } catch {
      setError('Security error. Please refresh and try again.');
      return;
    }

    if (!token) {
      setError('Security error. Please refresh and try again.');
      return;
    }

    setError('');
    setIsPending(true);

    try {
      const res = await fetch('/api/profile/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to delete account');
        setIsPending(false);
        return;
      }

      toast.success('Account deleted', {
        description: 'Your account has been permanently deleted.',
      });

      window.location.href = '/sign-in';
    } catch {
      setError('An unexpected error occurred');
      setIsPending(false);
    }
  }

  function reset() {
    setError('');
  }

  return { isPending, error, deleteAccount, reset };
}
