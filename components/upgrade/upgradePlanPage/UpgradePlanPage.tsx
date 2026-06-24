'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PricingToggle } from '@/components/homepage/pricingToggle/PricingToggle';
import { ItemTypeIcon } from '@/components/dashboard/itemTypeIcon/ItemTypeIcon';
import { createCheckoutAction } from '@/actions';
import { toTitleCase } from '@/lib/utils/utils';
import type { PlanInterval } from '@/lib/stripe/stripe';

const PRO_FEATURES = [
  'Unlimited items.',
  'Unlimited collections.',
  'AI tags, summaries, and search. Find anything by meaning, not just by name.',
  'File uploads with encrypted cloud storage.',
  'Code and markdown editors built in.',
];

const PRO_REASSURANCE = 'Files encrypted at rest. Private to your account.';

function friendlyCheckoutError(error: string): string {
  if (error === 'Unauthorized') {
    return 'Your session expired. Please sign in again.';
  }
  return 'Could not start checkout. Please try again.';
}

interface UpgradePlanPageProps {
  fromType?: { name: string; color: string };
  returnPath?: string;
}

export function UpgradePlanPage({
  fromType,
  returnPath = '/dashboard',
}: UpgradePlanPageProps) {
  const [billing, setBilling] = useState<PlanInterval>('monthly');
  const [isPending, startTransition] = useTransition();
  const [escapeProminent, setEscapeProminent] = useState(false);
  const titleType = fromType ? toTitleCase(fromType.name) : null;

  const handleCheckout = useCallback(() => {
    setEscapeProminent(false);
    startTransition(async () => {
      const result = await createCheckoutAction(billing, returnPath);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(friendlyCheckoutError(result.error ?? 'Checkout failed'));
      }
    });
  }, [billing, returnPath, startTransition]);

  useEffect(() => {
    if (!isPending) return;
    const id = setTimeout(() => setEscapeProminent(true), 3000);
    return () => clearTimeout(id);
  }, [isPending]);

  useEffect(() => {
    function onCheckoutKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 'Enter' || isPending || e.repeat) {
        return;
      }
      e.preventDefault();
      handleCheckout();
    }
    window.addEventListener('keydown', onCheckoutKey);
    return () => window.removeEventListener('keydown', onCheckoutKey);
  }, [handleCheckout, isPending]);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='mx-auto w-full max-w-xl px-5 pt-12 pb-8 text-center'>
        <h2 className='text-2xl font-semibold tracking-[-0.02em] text-balance'>
          Upgrade to Pro
        </h2>
        <p className='mt-2 text-muted-foreground text-sm text-balance'>
          Everything in Free, without the limits.
        </p>
        <div className='mt-6 flex justify-center'>
          <PricingToggle value={billing} onToggle={setBilling} />
        </div>
      </div>

      {fromType && titleType && (
        <div className='mx-auto mb-8 w-full max-w-xl px-5'>
          <aside
            aria-label="Why you're here"
            className='flex items-center gap-3 rounded-xl border border-border bg-card p-4'
            style={{
              backgroundColor: `color-mix(in oklch, ${fromType.color} 8%, transparent)`,
            }}
          >
            <div
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'
              style={{
                backgroundColor: `color-mix(in oklch, ${fromType.color} 14%, transparent)`,
              }}
              aria-hidden='true'
            >
              <ItemTypeIcon type={fromType.name} className='h-5 w-5' />
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <Lock className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              <p className='text-balance'>
                <span className='font-semibold'>{titleType}</span> is a Pro feature.
                Upgrade to upload and store{' '}
                {fromType.name === 'image' ? 'images' : 'files'}.
              </p>
            </div>
          </aside>
        </div>
      )}

      <div className='mx-auto w-full max-w-xl px-5 pb-8'>
        <article className='bg-card border border-border rounded-xl p-7 flex flex-col'>
          <div className='flex items-start justify-between gap-4 mb-5'>
            <div>
              <h3 className='text-lg font-semibold text-balance'>Pro</h3>
              <p className='text-muted-foreground text-sm'>
                For developers who live in their stash
              </p>
            </div>
            <div className='flex shrink-0 items-baseline gap-1'>
              <span className='text-lg text-foreground font-semibold'>$</span>
              <span className='text-[44px] font-extrabold tracking-[-0.02em] leading-none'>
                {billing === 'monthly' ? '8' : '6'}
              </span>
              <span className='text-muted-foreground text-sm ml-1'>/mo</span>
            </div>
          </div>
          <ul className='mb-6 flex flex-col gap-3'>
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className='flex items-center gap-2.5 text-sm'>
                <CheckCircle
                  className='w-4 h-4 text-success flex-none'
                  aria-hidden='true'
                />
                {feature}
              </li>
            ))}
          </ul>
          <p className='mb-6 text-xs text-muted-foreground'>
            {billing === 'yearly'
              ? 'Billed $72/year · Save $24 vs. monthly'
              : PRO_REASSURANCE}
          </p>
          <Button
            className='w-full'
            onClick={handleCheckout}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending
              ? 'Redirecting...'
              : billing === 'yearly'
                ? 'Upgrade · $72/year'
                : 'Upgrade · $8/month'}
          </Button>
          {isPending && (
            <p className='mt-3 text-center text-xs text-muted-foreground'>
              {escapeProminent && 'Taking a while? '}
              <Link href={returnPath} className='underline underline-offset-2'>
                Back to Dashboard
              </Link>
            </p>
          )}
        </article>

        <div className='mt-5 flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4'>
          <div className='text-sm'>
            <p className='font-medium'>Your current plan: Free</p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              50 items, 3 collections, all 6 item types.
            </p>
          </div>
          <Button variant='ghost' size='sm' asChild>
            <Link href={returnPath}>Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <p className='mx-auto pb-10 text-center text-xs text-muted-foreground'>
        Cancel anytime · Secure checkout via Stripe
      </p>
    </div>
  );
}
