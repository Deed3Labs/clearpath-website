import { NextResponse } from 'next/server';
import { isShopOpen, priceBag } from '@/lib/shop/catalog';
import { CheckoutBody } from '@/lib/shop/schema';
import { getRate, isShippoConfigured } from '@/lib/shop/shippo';
import { getStripe, isStripeConfigured } from '@/lib/shop/stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isShopOpen()) {
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

  /* Every amount on the session comes from the server: prices from the
     catalog, shipping re-read from Shippo. The browser only says WHAT. */
  const lines = priceBag(parsed.data.lines);
  if (!lines) {
    return NextResponse.json(
      { error: 'Something in your bag is no longer for sale. Remove it and try again.' },
      { status: 409 },
    );
  }

  let rate;
  try {
    rate = await getRate(rateId);
  } catch (err) {
    console.error('[shop/checkout] could not re-read rate', rateId, err);
    return NextResponse.json(
      { error: 'That shipping quote expired. Get rates again and retry.' },
      { status: 409 },
    );
  }

  const origin = new URL(request.url).origin;
  const taxOn = process.env.STRIPE_AUTOMATIC_TAX === 'true';

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: lines.map((l) => ({
        quantity: l.qty,
        price_data: {
          currency: 'usd',
          unit_amount: l.product.priceCents,
          product_data: {
            name: l.product.variants.length > 1 ? `${l.product.name} (${l.variantLabel})` : l.product.name,
            description: l.product.line,
            ...(l.product.images?.length && { images: [`${origin}${l.product.images[0].src}`] }),
            metadata: { slug: l.slug, variant: l.variant },
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: rate.label,
            fixed_amount: { amount: rate.amountCents, currency: 'usd' },
            ...(rate.estimatedDays !== null && {
              delivery_estimate: {
                minimum: { unit: 'business_day' as const, value: Math.max(1, rate.estimatedDays) },
                maximum: { unit: 'business_day' as const, value: Math.max(1, rate.estimatedDays) + 2 },
              },
            }),
          },
        },
      ],
      payment_intent_data: {
        shipping: {
          name: address.name,
          address: {
            line1: address.street1,
            line2: address.street2,
            city: address.city,
            state: address.state,
            postal_code: address.zip,
            country: address.country,
          },
        },
      },
      /* Stripe Tax needs an address to tax against and Checkout will not take
         the shipping address from payment_intent_data, so switching tax on
         also asks for a billing address. Off until the account is registered
         to collect in the states that require it. */
      automatic_tax: { enabled: taxOn },
      ...(taxOn && { billing_address_collection: 'required' as const }),
      /* The webhook buys exactly this label. Items ride along so an order can
         be packed from the Stripe dashboard alone. Metadata values cap at 500
         characters; MAX_LINES keeps this well inside that. */
      metadata: {
        shippo_rate_id: rate.rateId,
        items: lines.map((l) => `${l.slug}/${l.variant}x${l.qty}`).join(',').slice(0, 500),
      },
      success_url: `${origin}/shop/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/bag`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[shop/checkout]', err);
    return NextResponse.json({ error: 'We could not open checkout. Nothing was charged.' }, { status: 502 });
  }
}
