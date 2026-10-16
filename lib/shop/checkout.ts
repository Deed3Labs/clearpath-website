import type Stripe from 'stripe';
import { BAG } from '@/content/shop';
import type { PricedLine } from './catalog';
import { usdExact } from './money';
import { hasPreorder, reservationMetadata } from './order';
import type { ShipAddress, Quote } from './shippo';
import type { Shop } from './shopAccount';

/* The Checkout Session for a bag, as a pure function of what the server has
 * already worked out: lines priced by catalog.priceBag, the shipping rate
 * re-read from Shippo, the verified shop. The route does the I/O; this does
 * the shape, so the rules below are tested without a network.
 *
 * - Goods are charged in full, and ship now with the chosen rate. A bag of
 *   goods alone builds exactly the session it always did.
 * - Each pre-order line is a deposit line ("Deposit · Clear Point, Table").
 *   Its balance is charged later to the card saved here: setup_future_usage
 *   off_session, on a Stripe Customer tied to the shop. Pre-orders ship
 *   later, and their shipping is charged then, so no rate covers them now.
 * - The reservation record rides on the PaymentIntent's metadata (it stays
 *   editable after payment, unlike the session's), so Stripe is the record
 *   until the Clear API holds reservations. See order.reservationMetadata.
 * - A pre-order without a verified shop is refused by gate(), before this. */

export type Address = { name: string; street1: string; street2?: string; city: string; state: string; zip: string; country: string };

export function gate(lines: Pick<PricedLine, 'preorder'>[], shop: Shop | null): string | null {
  if (!hasPreorder(lines)) return null;
  if (!shop) return BAG.shopRequired;
  if (shop.approval === 'declined') return BAG.shopDeclined;
  return null;
}

const lineName = (l: PricedLine) =>
  l.product.variants.length > 1 ? `${l.product.name} (${l.variantLabel})` : l.product.name;

const depositName = (l: PricedLine) =>
  `Deposit · ${l.product.name}${l.product.variants.length > 1 ? `, ${l.variantLabel}` : ''}`;

/* The picture Stripe shows beside a line: a photograph or a render. */
function image(l: PricedLine, origin: string) {
  const src = l.product.images?.[0]?.src ?? l.product.media?.find((m) => m.kind === 'render')?.src;
  return src ? { images: [`${origin}${src}`] } : {};
}

export function sessionParams(input: {
  lines: PricedLine[];
  rate: Quote | null;
  address: Address;
  email: string;
  shop: Shop | null;
  customerId?: string;
  origin: string;
  taxOn: boolean;
}): Stripe.Checkout.SessionCreateParams {
  const { lines, rate, address, email, shop, customerId, origin, taxOn } = input;
  const goods = lines.filter((l) => !l.preorder);
  const pre = lines.filter((l) => l.preorder);
  const reserving = pre.length > 0;
  if (reserving && (!shop || !customerId)) throw new Error('a pre-order needs a verified shop and its customer');
  if (goods.length && !rate) throw new Error('goods need a shipping rate');

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    ...goods.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: 'usd',
        unit_amount: l.unitCents,
        product_data: {
          name: lineName(l),
          description: l.product.line,
          ...image(l, origin),
          metadata: { slug: l.slug, variant: l.variant },
        },
      },
    })),
    ...pre.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: 'usd',
        unit_amount: l.depositCents,
        product_data: {
          name: depositName(l),
          description: BAG.depositDescription(usdExact(l.balanceCents), l.ships ?? ''),
          ...image(l, origin),
          metadata: { slug: l.slug, variant: l.variant, kind: 'deposit' },
          /* TODO(owner): with Stripe Tax on, a deposit is marked not taxable
             here and tax is charged on the balance at delivery, as most
             states tax a sale. Confirm with the accountant before launch. */
          ...(taxOn && { tax_code: 'txcd_00000000' }),
        },
      },
    })),
  ];

  const shipping = {
    name: address.name,
    address: {
      line1: address.street1,
      line2: address.street2,
      city: address.city,
      state: address.state,
      postal_code: address.zip,
      country: address.country,
    },
  };

  const metadata: Record<string, string> = {};
  if (rate) {
    /* The webhook buys exactly this label. Items ride along so an order can
       be packed from the Stripe dashboard alone. Metadata values cap at 500
       characters; MAX_LINES keeps this well inside that. */
    metadata.shippo_rate_id = rate.rateId;
    metadata.items = goods.map((l) => `${l.slug}/${l.variant}x${l.qty}`).join(',').slice(0, 500);
  }
  if (reserving) {
    metadata.kind = 'reservation';
    metadata.shop_id = shop!.id;
  }

  return {
    mode: 'payment',
    ...(reserving ? { customer: customerId } : { customer_email: email }),
    line_items,
    ...(rate && {
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
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
    }),
    payment_intent_data: {
      shipping,
      ...(reserving && {
        setup_future_usage: 'off_session' as const,
        metadata: {
          kind: 'reservation',
          shop_id: shop!.id,
          shop: shop!.name.slice(0, 200),
          ...reservationMetadata(pre),
        },
      }),
    },
    ...(reserving && { custom_text: { submit: { message: BAG.savedCard } } }),
    /* Stripe Tax needs an address to tax against and Checkout will not take
       the shipping address from payment_intent_data, so switching tax on
       also asks for a billing address. Off until the account is registered
       to collect in the states that require it. */
    automatic_tax: { enabled: taxOn },
    ...(taxOn && { billing_address_collection: 'required' as const }),
    metadata,
    success_url: reserving
      ? `${origin}/shop/reserved?session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/shop/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/bag`,
  };
}

/* The shop's Stripe Customer: found by its shop id, or made. Its shipping
   address is where the pre-orders go, read again when each one ships. */
export async function shopCustomer(stripe: Stripe, shop: Shop, email: string, ship: ShipAddress): Promise<string> {
  const fields: Stripe.CustomerCreateParams = {
    name: shop.name,
    email,
    shipping: {
      name: ship.name,
      address: { line1: ship.street1, line2: ship.street2, city: ship.city, state: ship.state, postal_code: ship.zip, country: ship.country },
    },
    metadata: { shop_id: shop.id, shop: shop.name.slice(0, 200), owner: shop.owner.slice(0, 200) },
  };
  /* Search only ids that cannot break out of the query string. Search is
     eventually consistent, so two checkouts within a minute may make two
     customers for one shop; harmless, and the owner scripts list by shop id. */
  if (/^[A-Za-z0-9_-]{1,100}$/.test(shop.id)) {
    const found = await stripe.customers.search({ query: `metadata['shop_id']:'${shop.id}'`, limit: 1 });
    const hit = found.data[0];
    if (hit) {
      await stripe.customers.update(hit.id, fields);
      return hit.id;
    }
  }
  return (await stripe.customers.create(fields)).id;
}
