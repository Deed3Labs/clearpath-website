import { NextResponse } from 'next/server';
import { priceBag } from '@/lib/shop/catalog';
import { RatesBody } from '@/lib/shop/schema';
import { isShippoConfigured, quoteRates } from '@/lib/shop/shippo';

export const runtime = 'nodejs';

/* Stripe Checkout cannot fetch live rates mid-flow, so the order is inverted:
   the bag collects the address, this quotes Shippo, and the customer picks a
   rate BEFORE paying. Checkout then charges that rate and nothing else. */
export async function POST(request: Request) {
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

  try {
    const rates = await quoteRates(parsed.data.address, lines);
    if (!rates.length) {
      return NextResponse.json(
        { error: 'No carrier could quote that address. Check it and try again.' },
        { status: 422 },
      );
    }
    return NextResponse.json({ rates });
  } catch (err) {
    console.error('[shop/rates]', err);
    return NextResponse.json({ error: 'We could not reach the carriers just now.' }, { status: 502 });
  }
}
