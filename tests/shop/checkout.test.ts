import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BAG } from '@/content/shop';
import { priceBag, type PricedLine } from '@/lib/shop/catalog';
import { gate, sessionParams, type Address } from '@/lib/shop/checkout';
import { readReservation, steps } from '@/lib/shop/order';
import { CheckoutBody } from '@/lib/shop/schema';
import type { Quote } from '@/lib/shop/shippo';
import { MOCK_SHOP, type Shop } from '@/lib/shop/shopAccount';

const address: Address = { name: 'Ana R.', street1: '1450 N Mountain Ave', city: 'Ontario', state: 'CA', zip: '91762', country: 'US' };
const rate: Quote = { rateId: 'rate_1', label: 'USPS Ground', amountCents: 640, estimatedDays: 3 };
const origin = 'https://www.useclear.org';
const price = (lines: { slug: string; variant: string; qty: number }[]) => {
  const out = priceBag(lines);
  assert.ok(out, 'the bag prices');
  return out as PricedLine[];
};

test('tampering: a price or deposit sent by the browser is dropped and ignored', () => {
  const body = CheckoutBody.parse({
    lines: [
      { slug: 'clear-point', variant: 'table', qty: 1, priceCents: 1, depositCents: 1, unitCents: 1 },
      { slug: 'member-tee', variant: 'black-m', qty: 1, priceCents: 1 },
    ],
    address,
    email: 'ana@micasatacos.test',
    rateId: 'rate_1',
    shop: { id: 'someone-else' },
  });
  assert.deepEqual(Object.keys(body.lines[0]).sort(), ['qty', 'slug', 'variant']);
  assert.equal('shop' in body, false);
  const params = sessionParams({ lines: price(body.lines), rate, address, email: body.email, shop: MOCK_SHOP, customerId: 'cus_1', origin, taxOn: false });
  const amounts = params.line_items!.map((li) => li.price_data!.unit_amount);
  assert.deepEqual(amounts, [4200, 5500]);
});

test('the shop gate: a pre-order without a verified shop is refused', () => {
  const lines = price([{ slug: 'clear-point', variant: 'table', qty: 1 }]);
  assert.equal(gate(lines, null), BAG.shopRequired);
  const declined: Shop = { ...MOCK_SHOP, approval: 'declined' };
  assert.equal(gate(lines, declined), BAG.shopDeclined);
  assert.equal(gate(lines, MOCK_SHOP), null);
  assert.throws(() => sessionParams({ lines, rate: null, address, email: 'a@b.co', shop: null, origin, taxOn: false }));
  // Goods alone never need a shop.
  assert.equal(gate(price([{ slug: 'member-tee', variant: 'black-m', qty: 1 }]), null), null);
});

test('mixed bags: goods alone build exactly the session they always did', () => {
  const lines = price([{ slug: 'member-tee', variant: 'black-m', qty: 2 }]);
  const params = sessionParams({ lines, rate, address, email: 'ana@micasatacos.test', shop: null, origin, taxOn: false });
  assert.deepEqual(params, {
    mode: 'payment',
    customer_email: 'ana@micasatacos.test',
    line_items: [
      {
        quantity: 2,
        price_data: {
          currency: 'usd',
          unit_amount: 4200,
          product_data: {
            name: 'Mock tee (Black · M)',
            description: 'Pre-order: ships Jan 2027, estimated. Heavyweight cotton, mock neck, patch on the chest.',
            images: [`${origin}/shop/goods/member-tee/render-black.jpg`],
            metadata: { slug: 'member-tee', variant: 'black-m' },
          },
        },
      },
    ],
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'USPS Ground',
          fixed_amount: { amount: 640, currency: 'usd' },
          delivery_estimate: { minimum: { unit: 'business_day', value: 3 }, maximum: { unit: 'business_day', value: 5 } },
        },
      },
    ],
    payment_intent_data: {
      shipping: {
        name: 'Ana R.',
        address: { line1: '1450 N Mountain Ave', line2: undefined, city: 'Ontario', state: 'CA', postal_code: '91762', country: 'US' },
      },
    },
    automatic_tax: { enabled: false },
    metadata: { shippo_rate_id: 'rate_1', items: 'member-tee/black-mx2' },
    success_url: `${origin}/shop/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/bag`,
  });
});

test('mixed bags: goods at full price, a deposit line per pre-order, the card saved', () => {
  const lines = price([
    { slug: 'member-tee', variant: 'black-m', qty: 1 },
    { slug: 'clear-point', variant: 'table', qty: 4 },
    { slug: 'clear-tap', variant: 'm2', qty: 1 },
  ]);
  const p = sessionParams({ lines, rate, address, email: 'ana@micasatacos.test', shop: MOCK_SHOP, customerId: 'cus_1', origin, taxOn: false });
  assert.equal(p.customer, 'cus_1');
  assert.equal(p.customer_email, undefined);
  assert.deepEqual(
    p.line_items!.map((li) => [li.price_data!.product_data!.name, li.price_data!.unit_amount, li.quantity]),
    [
      ['Mock tee (Black · M)', 4200, 1],
      ['Deposit · Clear Point, Table', 5500, 4],
      ['Deposit · Clear Tap, With an M2', 8000, 1],
    ],
  );
  assert.equal(p.payment_intent_data!.setup_future_usage, 'off_session');
  assert.equal(p.shipping_options!.length, 1);
  assert.equal(p.success_url, `${origin}/shop/reserved?session_id={CHECKOUT_SESSION_ID}`);
  const meta = p.payment_intent_data!.metadata as Record<string, string>;
  assert.equal(meta.kind, 'reservation');
  assert.equal(meta.shop_id, MOCK_SHOP.id);
  assert.deepEqual(
    readReservation(meta).map((l) => [l.slug, l.variant, l.qty, l.unitCents, l.depositCents, l.ships, l.status]),
    [
      ['clear-point', 'table', 4, 8900, 5500, 'Feb 2027', 'reserved'],
      ['clear-tap', 'm2', 1, 8900, 8000, 'Mar 2027', 'reserved'],
    ],
  );
  assert.equal(p.metadata!.kind, 'reservation');
  assert.equal(p.metadata!.items, 'member-tee/black-mx1');
});

test('shipping: a hardware-only bag skips the shipping step and sends no rate', () => {
  const hw = price([{ slug: 'clear-point', variant: 'table', qty: 1 }]);
  assert.deepEqual(steps(hw), ['shop', 'addr', 'pay']);
  assert.deepEqual(steps(price([{ slug: 'member-tee', variant: 'black-m', qty: 1 }])), ['addr', 'ship', 'pay']);
  assert.deepEqual(
    steps(price([{ slug: 'member-tee', variant: 'black-m', qty: 1 }, { slug: 'clear-tap', variant: 'dock', qty: 1 }])),
    ['shop', 'addr', 'ship', 'pay'],
  );
  const p = sessionParams({ lines: hw, rate: null, address, email: 'a@b.co', shop: MOCK_SHOP, customerId: 'cus_1', origin, taxOn: false });
  assert.equal(p.shipping_options, undefined);
  assert.equal(p.metadata!.shippo_rate_id, undefined);
  // And a bag with goods cannot be built without a rate.
  assert.throws(() =>
    sessionParams({ lines: price([{ slug: 'member-tee', variant: 'black-m', qty: 1 }]), rate: null, address, email: 'a@b.co', shop: null, origin, taxOn: false }),
  );
});

test('the reservation record stays inside Stripe metadata limits at 20 lines', () => {
  const twenty = price(
    ['clear-point/table', 'clear-point/counter', 'clear-point/ten', 'clear-tap/dock', 'clear-tap/m2', 'clear-counter/8', 'clear-counter/10', 'clear-drawer/one', 'label-printer/one', 'pay-case/table', 'pay-case/large', 'tap-phone/one', 'clear-stand/one', 'full-counter/one']
      .map((k) => ({ slug: k.split('/')[0], variant: k.split('/')[1], qty: 10 }))
      .concat(
        ['paper', 'walnut', 'logo', 'mount', 'wood', 'insert'].map((v) => ({ slug: 'drawer-panels', variant: v, qty: 10 })),
      ),
  );
  assert.equal(twenty.length, 20);
  const p = sessionParams({ lines: twenty, rate: null, address, email: 'a@b.co', shop: MOCK_SHOP, customerId: 'cus_1', origin, taxOn: false });
  const meta = p.payment_intent_data!.metadata as Record<string, string>;
  assert.ok(Object.keys(meta).length <= 50, `${Object.keys(meta).length} keys`);
  for (const [k, v] of Object.entries(meta)) {
    assert.ok(k.length <= 40, k);
    assert.ok(v.length <= 500, k);
  }
});
