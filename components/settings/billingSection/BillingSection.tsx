'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createCheckoutAction, createPortalAction } from '@/actions';
import { FREE_TIER_LIMITS } from '@/lib/constants/limits';
import type { PlanTier } from '@/types/db';

interface UsageStats {
  totalItems: number;
  totalCollections: number;
}

interface BillingSectionProps {
  planTier: PlanTier;
  usage?: UsageStats;
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const atLimit = used >= limit;

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-muted-foreground'>{label}</span>
        <span className={atLimit ? 'font-medium text-destructive' : 'font-medium text-foreground'}>
          {used}/{limit}
        </span>
      </div>
      <Progress value={pct} className={atLimit ? '[&>[data-slot=progress-indicator]]:bg-destructive' : ''} />
    </div>
  );
}

export function BillingSection({ planTier, usage }: BillingSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingInterval, setPendingInterval] = useState<'monthly' | 'yearly' | null>(null);

  function handleCheckout(interval: 'monthly' | 'yearly') {
    setPendingInterval(interval);
    startTransition(async () => {
      const result = await createCheckoutAction(interval);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error);
        setPendingInterval(null);
      }
    });
  }

  function handlePortal() {
    startTransition(async () => {
      const result = await createPortalAction();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error);
      }
    });
  }

  const planLabel = planTier === 'free' ? 'Free' : planTier === 'monthly' ? 'Pro (Monthly)' : 'Pro (Annual)';
  const isPro = planTier !== 'free';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Billing</CardTitle>
        <CardDescription>
          {isPro
            ? 'Your Pro subscription is active. Manage billing, update payment methods, or cancel anytime.'
            : 'Free plan includes 50 items and 3 collections. Pro unlocks unlimited storage, file uploads, and AI-powered tagging.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <p className='text-sm font-medium text-foreground'>Current plan</p>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted-foreground'>{planLabel}</p>
              {isPro && <Badge className='bg-brand text-brand-foreground'>PRO</Badge>}
            </div>
          </div>
        </div>
        {!isPro && usage && (
          <div className='space-y-3 rounded-lg border border-border bg-muted/40 p-4'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Plan usage
            </p>
            <UsageRow label='Items' used={usage.totalItems} limit={FREE_TIER_LIMITS.maxItems} />
            <UsageRow label='Collections' used={usage.totalCollections} limit={FREE_TIER_LIMITS.maxCollections} />
          </div>
        )}
        {isPro ? (
          <Button onClick={handlePortal} disabled={isPending} variant='outline'>
            {isPending ? 'Redirecting...' : 'Manage subscription'}
          </Button>
        ) : (
          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              onClick={() => handleCheckout('monthly')}
              disabled={isPending}
              className='sm:w-auto'
            >
              <Sparkles className='mr-2 h-4 w-4' />
              {isPending && pendingInterval === 'monthly' ? 'Redirecting...' : 'Upgrade: $8/mo'}
            </Button>
            <Button
              onClick={() => handleCheckout('yearly')}
              disabled={isPending}
              variant='outline'
              className='sm:w-auto'
            >
              {isPending && pendingInterval === 'yearly' ? 'Redirecting...' : 'Upgrade: $72/yr'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
