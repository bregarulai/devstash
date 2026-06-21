import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

export type PlanInterval = 'monthly' | 'yearly';

export function priceIdToPlan(priceId: string): PlanInterval | null {
  if (priceId === STRIPE_PRICE_IDS.monthly) return 'monthly';
  if (priceId === STRIPE_PRICE_IDS.yearly) return 'yearly';
  return null;
}
