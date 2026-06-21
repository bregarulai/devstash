import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma/prisma';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sess = event.data.object;
        const userId = sess.client_reference_id ?? sess.metadata?.userId;
        const subscriptionId = typeof sess.subscription === 'string' ? sess.subscription : null;
        const customerId = typeof sess.customer === 'string' ? sess.customer : null;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              stripeSubscriptionId: subscriptionId,
              ...(customerId ? { stripeCustomerId: customerId } : {}),
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata.userId;
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: isActive,
              stripeSubscriptionId: isActive ? sub.id : null,
            },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Stripe webhook handler failed:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
