'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { retryProfileData } from '@/actions/profile';

export function ProfileRetryForm() {
  return (
    <form action={retryProfileData}>
      <Button type="submit" variant="outline" className="gap-2">
        <RefreshCw className="size-4" />
        Retry loading profile
      </Button>
    </form>
  );
}
