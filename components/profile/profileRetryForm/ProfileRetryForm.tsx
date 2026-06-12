'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { retryProfileDataAction } from '@/actions';

interface ProfileRetryFormProps {
  errorType?: 'db-failure' | 'user-not-found' | null;
}

export function ProfileRetryForm({ errorType }: ProfileRetryFormProps) {
  if (errorType === 'user-not-found') {
    return null;
  }

  return (
    <form action={retryProfileDataAction}>
      <Button type="submit" variant="outline" className="gap-2">
        <RefreshCw className="size-4" />
        Retry loading profile
      </Button>
    </form>
  );
}
