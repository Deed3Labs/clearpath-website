import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { buyLabel, isShippoConfigured } from '@/lib/shop/shippo';
import { getStripe } from '@/lib/shop/stripe';

export const runtime = 'nodejs';

/* Stripe fulfilment webhook.
 *
 * In the Stripe dashboard, add an endpoint at
 *   https://useclear.org/api/shop/webhook
 * subscribed to `checkout.session.completed`, and put its signing secret in
 * STRIPE_WEBHOOK_SECRET. Test mode and live mode have separate endpoints and
 * separate secrets. Locally:
 *   stripe listen --forward-to localhost:8137/api/shop/webhook
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[shop/webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  // The signature covers the exact bytes Stripe sent, so read them raw.
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error('[shop/webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    await onPaid(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}

async function onPaid(session: Stripe.Checkout.Session) {
  const rateId = session.metadata?.shippo_rate_id;

  console.log('[shop/order] paid', {
    sessionId: session.id,
    email: session.customer_details?.email,
    items: session.metadata?.items,
    total: session.amount_total,
    shippoRateId: rateId,
  });

  /* TODO(owner): persist orders somewhere queryable. For now the Stripe
     dashboard is the record of truth, which is fine at merch volume. */

  if (session.payment_status !== 'paid') return;

  if (process.env.SHIPPO_AUTO_BUY_LABEL !== 'true') {
    console.log('[shop/order] auto-buy off; buy the label from the Shippo dashboard');
    return;
  }
  if (!rateId || !isShippoConfigured()) {
    console.warn('[shop/order] no Shippo rate on the session; skipping label purchase');
    return;
  }

  try {
    const tx = await buyLabel(rateId);
    if (tx.status === 'SUCCESS') {
      console.log('[shop/order] label bought', { tracking: tx.trackingNumber, label: tx.labelUrl });
    } else {
      console.error('[shop/order] label purchase failed', tx.messages);
    }
  } catch (err) {
    /* Never 500: Stripe would retry, and the customer has already paid.
       Log it and buy the label by hand. */
    console.error('[shop/order] label purchase threw', err);
  }
}
