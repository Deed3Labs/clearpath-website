import { NextResponse } from 'next/server';
import { isShopOpen, priceBag } from '@/lib/shop/catalog';
import { RatesBody } from '@/lib/shop/schema';
import { shippingCents, totals } from '@/lib/shop/order';
import { isShippoConfigured, quoteRates } from '@/lib/shop/shippo';

export const runtime = 'nodejs';

/* Stripe Checkout cannot fetch live rates mid-flow, so the order is inverted:
   the bag collects the address, this quotes Shippo, and the customer picks a
   rate BEFORE paying. Checkout then charges that rate and nothing else. */
export async function POST(request: Request) {
  if (!isShopOpen()) {
    return NextResponse.json({ error: 'The shop is closed right now. Nothing was charged.' }, { status: 503 });
  }
  if (!isShippoConfigured()) {
    return NextResponse.json(
      { error: 'Shipping is not switched on yet, so nothing can be ordered. Nothing was charged.' },
      { status: 503 },
    );
  }

  const parsed = RatesBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Check the address and try again.' }, { status: 400 });
  }

  const lines = priceBag(parsed.data.lines);
  if (!lines) {
    return NextResponse.json(
      { error: 'Something in your bag is no longer for sale. Remove it and try again.' },
      { status: 409 },
    );
  }

  /* Only goods ship now. Pre-orders ship when they are built, and their
     shipping is quoted and charged then, so they are left out of the parcel. */
  const goods = lines.filter((l) => !l.preorder);
  if (!goods.length) {
    return NextResponse.json({ error: 'Nothing in this bag ships now, so there is nothing to quote.' }, { status: 400 });
  }

  try {
    const rates = await quoteRates(parsed.data.address, goods);
    if (!rates.length) {
      return NextResponse.json(
        { error: 'No carrier could quote that address. Check it and try again.' },
        { status: 422 },
      );
    }
    /* $30 of goods or more: the cheapest is free, the rest cost the difference. */
    const { goodsCents } = totals(lines, null);
    const cheapest = rates[0].amountCents;
    return NextResponse.json({ rates: rates.map((r) => ({ ...r, amountCents: shippingCents(goodsCents, r.amountCents, cheapest) })) });
  } catch (err) {
    console.error('[shop/rates]', err);
    return NextResponse.json({ error: 'We could not reach the carriers just now.' }, { status: 502 });
  }
}
