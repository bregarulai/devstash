'use client';

import { useState, useTransition } from 'react';
import { Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createCheckoutAction } from '@/actions';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { toTitleCase } from '@/lib/utils/utils';

interface UpgradePageProps {
  typeName: string;
  typeColor: string;
}

const PRO_FEATURES = [
  'Upload files and images',
  'Unlimited items and collections',
  'AI auto-tagging, summaries & search',
  'Code explanation & prompt optimization',
] as const;

function friendlyCheckoutError(error: string): string {
  if (error === 'Unauthorized') {
    return 'Your session expired. Please sign in again.';
  }
  return 'Could not start checkout. Please try again.';
}

export function UpgradePage({ typeName, typeColor }: UpgradePageProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingInterval, setPendingInterval] = useState<'monthly' | 'yearly' | null>(null);
  const titleType = toTitleCase(typeName);

  function handleCheckout(interval: 'monthly' | 'yearly') {
    setPendingInterval(interval);
    startTransition(async () => {
      const result = await createCheckoutAction(interval);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(friendlyCheckoutError(result.error ?? 'Checkout failed'));
        setPendingInterval(null);
      }
    });
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center gap-3'>
        <div
          className='flex h-10 w-10 items-center justify-center rounded-lg'
          style={{
            backgroundColor: `color-mix(in oklch, ${typeColor} 12%, transparent)`,
            color: typeColor,
          }}
          aria-hidden='true'
        >
          <ItemTypeIcon type={typeName} className='h-5 w-5' />
        </div>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>{titleType}</h1>
          <p className='text-sm text-muted-foreground'>Pro feature</p>
        </div>
      </div>

      <Card className='mx-auto w-full max-w-lg'>
        <CardHeader className='text-center'>
          <div
            className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'
            style={{
              backgroundColor: `color-mix(in oklch, ${typeColor} 12%, transparent)`,
              color: typeColor,
            }}
            aria-hidden='true'
          >
            <Lock className='h-6 w-6' />
          </div>
          <CardTitle className='text-xl'>Upgrade to Pro</CardTitle>
          <CardDescription>Everything in Free, plus:</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <ul className='flex flex-col gap-2.5'>
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className='flex items-center gap-2.5 text-sm'>
                <Check className='h-4 w-4 shrink-0 text-success' aria-hidden='true' />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-2.5 sm:flex-row'>
              <Button
                onClick={() => handleCheckout('yearly')}
                disabled={isPending}
                aria-busy={isPending && pendingInterval === 'yearly'}
                className='h-11 flex-1 sm:h-8'
              >
                {isPending && pendingInterval === 'yearly'
                  ? 'Redirecting...'
                  : 'Yearly · $6/mo'}
              </Button>
              <Button
                onClick={() => handleCheckout('monthly')}
                disabled={isPending}
                variant='outline'
                aria-busy={isPending && pendingInterval === 'monthly'}
                className='h-11 flex-1 sm:h-8'
              >
                {isPending && pendingInterval === 'monthly'
                  ? 'Redirecting...'
                  : 'Monthly · $8/mo'}
              </Button>
            </div>
            <p className='text-center text-xs text-muted-foreground'>
              Save $24/yr with yearly · Cancel anytime
            </p>
            <Link
              href='/dashboard'
              className='inline-flex h-11 items-center justify-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:h-8'
            >
              Maybe later
            </Link>
          </div>

          <span className='sr-only' aria-live='polite'>
            {isPending && pendingInterval
              ? `Redirecting to checkout for the ${pendingInterval} plan.`
              : ''}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
