'use client';

import { cn } from '@/lib/utils';
import type { PlanInterval } from '@/lib/stripe/stripe';

interface PricingToggleProps {
  value: PlanInterval;
  onToggle?: (billing: PlanInterval) => void;
}

export function PricingToggle({ value, onToggle }: PricingToggleProps) {
  return (
    <div className='inline-flex items-center gap-2'>
      <div
        className='inline-flex items-center gap-1 p-1.5 bg-card border border-border rounded-full relative'
        role='radiogroup'
        aria-label='Billing period'
        aria-live='polite'
      >
        <button
          role='radio'
          aria-checked={value === 'monthly'}
          className={cn(
            'px-4.5 py-2 rounded-full text-[13px] font-semibold transition-colors',
            value === 'monthly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => onToggle?.('monthly')}
        >
          Monthly
        </button>
        <button
          role='radio'
          aria-checked={value === 'yearly'}
          className={cn(
            'px-4.5 py-2 rounded-full text-[13px] font-semibold transition-colors',
            value === 'yearly'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => onToggle?.('yearly')}
        >
          Yearly
        </button>
      </div>
      <span className='text-xs font-medium text-foreground'>Save 25%</span>
    </div>
  );
}
