'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardDataRetryProps {
  children: React.ReactNode;
}

export function DashboardDataRetry({ children }: DashboardDataRetryProps) {
  const router = useRouter();
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}
      {showRetry && (
        <Alert variant='default' className='mt-4 border-border bg-background'>
          <AlertCircle className='h-4 w-4 text-muted-foreground' />
          <AlertDescription className='flex items-center justify-between gap-4'>
            <span className='text-sm text-muted-foreground'>
              Dashboard data may not have loaded correctly.
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.refresh()}
            >
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
