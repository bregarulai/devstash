'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PricingToggleProps {
  onToggle?: (billing: 'monthly' | 'yearly') => void;
}

export function PricingToggle({ onToggle }: PricingToggleProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const handleToggle = useCallback(
    (newBilling: 'monthly' | 'yearly') => {
      setBilling(newBilling);
      onToggle?.(newBilling);
    },
    [onToggle]
  );

  return (
    <div
      className="inline-flex items-center gap-1 p-1.5 bg-card border border-border rounded-full relative"
      role="group"
      aria-label="Billing period"
    >
      <button
        className={cn(
          'px-4.5 py-2 rounded-full text-[13px] font-semibold transition-colors',
          billing === 'monthly'
            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => handleToggle('monthly')}
      >
        Monthly
      </button>
      <button
        className={cn(
          'px-4.5 py-2 rounded-full text-[13px] font-semibold transition-colors',
          billing === 'yearly'
            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => handleToggle('yearly')}
      >
        Yearly
      </button>
      <span className="text-[11px] font-bold text-green-500 pr-2.5 pl-1">
        Save 25%
      </span>
    </div>
  );
}
