import { NextResponse } from 'next/server';
import { isShopOpen, priceBag } from '@/lib/shop/catalog';
import { shopCatalog } from '@/lib/shop/source';
import { gate, sessionParams, shopCustomer } from '@/lib/shop/checkout';
import { currentShop } from '@/lib/shop/currentShop';
import { FREE_SHIPPING_FROM_CENTS, hasGoods, hasPreorder, shippingCents, totals } from '@/lib/shop/order';
import { CheckoutBody } from '@/lib/shop/schema';
import { cheapestCents, getRate, isShippoConfigured, type Quote } from '@/lib/shop/shippo';
import { getStripe, isStripeConfigured } from '@/lib/shop/stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  /* priced from the catalog the pages showed: the Command Center's, or the content file's */
  const all = await shopCatalog();
  if (!isShopOpen(all)) {
    return NextResponse.json({ error: 'The shop is closed right now. Nothing was charged.' }, { status: 503 });
  }
  if (!isStripeConfigured() || !isShippoConfigured()) {
    return NextResponse.json(
      { error: 'Checkout is not switched on yet. Nothing was charged.' },
      { status: 503 },
    );
  }

  const parsed = CheckoutBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'That order did not look right. Check the form.' }, { status: 400 });
  }
  const { address, email, rateId } = parsed.data;

  /* Every amount on the session comes from the server: prices and deposits
     from the catalog, shipping re-read from Shippo. The browser only says
     WHAT and HOW MANY. */
  const lines = priceBag(parsed.data.lines, all);
  if (!lines) {
    return NextResponse.json(
      { error: 'Something in your bag is no longer for sale. Remove it and try again.' },
      { status: 409 },
    );
  }

  /* Pre-orders are for shops on Clear: the shop comes from the verified
     session, never from the request. */
  const shop = hasPreorder(lines) ? await currentShop() : null;
  const refused = gate(lines, shop);
  if (refused) return NextResponse.json({ error: refused }, { status: 403 });

  let rate: Quote | null = null;
  if (hasGoods(lines)) {
    if (!rateId) {
      return NextResponse.json({ error: 'Choose shipping first. Nothing was charged.' }, { status: 400 });
    }
    try {
      const r = await getRate(rateId);
      const { goodsCents } = totals(lines, null);
      /* Free shipping from $30 of goods, from the carrier's own quotes for
         this shipment: the cheapest of them, not anything the bag sent. */
      const amountCents =
        goodsCents >= FREE_SHIPPING_FROM_CENTS && r.shipment ? shippingCents(goodsCents, r.amountCents, await cheapestCents(r.shipment)) : r.amountCents;
      rate = { rateId: r.rateId, label: r.label, amountCents, estimatedDays: r.estimatedDays };
    } catch (err) {
      console.error('[shop/checkout] could not re-read rate', rateId, err);
      return NextResponse.json(
        { error: 'That shipping quote expired. Get rates again and retry.' },
        { status: 409 },
      );
    }
  }

  const origin = new URL(request.url).origin;
  const taxOn = process.env.STRIPE_AUTOMATIC_TAX === 'true';

  try {
    const stripe = getStripe();
    const customerId = shop ? await shopCustomer(stripe, shop, email, address) : undefined;
    const session = await stripe.checkout.sessions.create(
      sessionParams({ lines, rate, address, email, shop, customerId, origin, taxOn }),
    );
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[shop/checkout]', err);
    return NextResponse.json({ error: 'We could not open checkout. Nothing was charged.' }, { status: 502 });
  }
}
