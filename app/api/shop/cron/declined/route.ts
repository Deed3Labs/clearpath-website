import { NextResponse } from 'next/server';
import { readReservation } from '@/lib/shop/order';
import { shopAccountMode, shopApproval } from '@/lib/shop/shopAccount';
import { getStripe, isStripeConfigured } from '@/lib/shop/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* The one automatic money movement in the shop: refund the deposits of a
 * shop the Clear API reports as declined. Run daily by Vercel Cron
 * (vercel.json), which sends `Authorization: Bearer $CRON_SECRET`.
 *
 * Inert until the real shop account exists: with SHOP_ACCOUNT anything but
 * `clear`, or no answer from the API, approval is 'unknown' and nothing is
 * refunded. Only lines still `reserved` are refunded (a declined shop's
 * units are never built), each PaymentIntent once (idempotency key), and the
 * goods in the same order are left alone. Balances are never charged here. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (shopAccountMode() !== 'clear' || !isStripeConfigured()) {
    return NextResponse.json({ skipped: 'shop approval is not available yet' });
  }

  const stripe = getStripe();
  const refunded: string[] = [];
  let page: string | undefined;
  do {
    const res = await stripe.paymentIntents.search({
      query: "metadata['kind']:'reservation' AND status:'succeeded'",
      limit: 100,
      ...(page && { page }),
    });
    for (const pi of res.data) {
      const m = pi.metadata;
      if (!m.reserved_at || m.declined_refund || !m.shop_id) continue;
      if ((await shopApproval(m.shop_id)) !== 'declined') continue;
      const open = readReservation(m).filter((l) => l.status === 'reserved');
      const amount = open.reduce((n, l) => n + l.depositCents * l.qty, 0);
      if (amount <= 0) continue;
      try {
        const refund = await stripe.refunds.create(
          { payment_intent: pi.id, amount, metadata: { reason: 'shop declined', lines: open.map((l) => l.n).join(',') } },
          { idempotencyKey: `decline-${pi.id}` },
        );
        const marks: Record<string, string> = { declined_refund: refund.id };
        for (const l of open) marks[`s${l.n}`] = 'refunded';
        await stripe.paymentIntents.update(pi.id, { metadata: marks });
        refunded.push(pi.id);
        console.log('[shop/declined] refunded deposits', { paymentIntent: pi.id, shop: m.shop_id, amount });
      } catch (err) {
        console.error('[shop/declined] refund failed', pi.id, err);
      }
    }
    page = res.has_more ? res.next_page ?? undefined : undefined;
  } while (page);

  return NextResponse.json({ refunded });
}
