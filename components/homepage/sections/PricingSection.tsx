'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/homepage/reveal/Reveal';
import { PricingToggle } from '@/components/homepage/pricingToggle/PricingToggle';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const FREE_FEATURES = ['50 items', '3 collections', 'All 6 item types', 'Instant search', 'GitHub & email sign-in'];

const PRO_FEATURES = [
  'Unlimited items',
  'Unlimited collections',
  'AI tags, summaries & search',
  'File uploads (R2 storage)',
  'Code & markdown editors',
  'Priority support',
];

const PRO_REASSURANCE = 'Files stored encrypted in R2. Private to your account.';

export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-5 pb-10">
      <Reveal className="max-w-6xl mx-auto pt-20 pb-9 text-center">
        <h2 className="text-[clamp(26px,4.5vw,40px)] tracking-[-0.02em] font-bold leading-[1.15] text-balance">
          Start free. Upgrade when you outgrow it.
        </h2>
        <div className="mt-6">
          <PricingToggle onToggle={setBilling} />
        </div>
      </Reveal>

      <div className="grid gap-4.5 max-w-[760px] mx-auto sm:grid-cols-2">
        <Reveal className="h-full">
          <article className="bg-card border border-border rounded-2xl p-7 transition-colors duration-200 hover:border-foreground/20 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-1 text-balance">Free</h3>
            <p className="text-muted-foreground text-sm mb-4.5">For getting your stash in order</p>
            <div className="flex items-baseline gap-[3px] mb-5.5">
              <span className="text-lg text-muted-foreground font-semibold">$</span>
              <span className="text-[44px] font-extrabold tracking-[-0.02em] leading-none">0</span>
              <span className="text-muted-foreground text-sm ml-1">/forever</span>
            </div>
            <ul className="flex flex-col gap-[11px] mb-6">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-none" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-auto" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </article>
        </Reveal>

        <Reveal className="h-full">
          <article className="relative bg-card border border-border rounded-2xl p-7 ring-1 ring-primary/40 transition-colors duration-200 hover:border-foreground/20 h-full flex flex-col">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold normal-case py-[5px] px-3.5 rounded-full bg-primary text-primary-foreground">
              Most Popular
            </span>
            <h3 className="text-xl font-bold mb-1 text-balance">Pro</h3>
            <p className="text-muted-foreground text-sm mb-4.5">For developers who live in their stash</p>
            <div className="flex items-baseline gap-[3px] mb-5.5">
              <span className="text-lg text-muted-foreground font-semibold">$</span>
              <span
                className={cn(
                  'text-[44px] font-extrabold tracking-[-0.02em] leading-none',
                  billing === 'yearly' && 'hidden'
                )}
              >
                8
              </span>
              <span
                className={cn(
                  'text-[44px] font-extrabold tracking-[-0.02em] leading-none',
                  billing === 'monthly' && 'hidden'
                )}
              >
                72
              </span>
              <span className="text-muted-foreground text-sm ml-1">
                {billing === 'monthly' ? '/mo' : '/year'}
              </span>
            </div>
            <ul className="flex flex-col gap-[11px] mb-6">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-none" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground text-xs mb-6">{PRO_REASSURANCE}</p>
            <Button className="w-full mt-auto" asChild>
              <Link href="/register">Upgrade to Pro</Link>
            </Button>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
