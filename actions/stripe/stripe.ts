'use server';

import { auth } from '@/lib/auth/auth/auth';
import { stripe, STRIPE_PRICE_IDS, type PlanInterval } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma/prisma';
import { getSafeReturnPath } from '@/lib/utils/safeReturn';

type ActionResult =
  | { success: true; data: { url: string }; error: null }
  | { success: false; data: null; error: string };

const VALID_INTERVALS: readonly PlanInterval[] = ['monthly', 'yearly'] as const;

function baseUrl(): string {
  return process.env.APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';
}

export async function createCheckoutAction(
  interval: PlanInterval,
  returnTo?: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, data: null, error: 'Unauthorized' };
  }

  if (!VALID_INTERVALS.includes(interval)) {
    return { success: false, data: null, error: 'Invalid interval' };
  }

  const priceId =
    interval === 'monthly' ? STRIPE_PRICE_IDS.monthly : STRIPE_PRICE_IDS.yearly;

  try {
    let { stripeCustomerId } = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        metadata: { userId: session.user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId },
      });
    }

    const safeReturn = getSafeReturnPath(returnTo);
    const successUrl = safeReturn
      ? `${baseUrl()}${safeReturn}${safeReturn.includes('?') ? '&' : '?'}checkout=success`
      : `${baseUrl()}/settings?checkout=success`;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: `${baseUrl()}/settings?checkout=cancelled`,
      client_reference_id: session.user.id,
      subscription_data: {
        metadata: { userId: session.user.id },
      },
    });

    if (!checkoutSession.url) {
      return { success: false, data: null, error: 'Checkout failed' };
    }

    return { success: true, data: { url: checkoutSession.url }, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Checkout failed',
    };
  }
}

export async function createPortalAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, data: null, error: 'Unauthorized' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return { success: false, data: null, error: 'No subscription found' };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl()}/settings`,
    });

    return { success: true, data: { url: portalSession.url }, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Portal failed',
    };
  }
}
