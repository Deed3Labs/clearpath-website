import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceBag } from '@/lib/shop/catalog';
import { sessionParams, type Address } from '@/lib/shop/checkout';
import { FREE_SHIPPING_FROM_CENTS, shippingCents, totals } from '@/lib/shop/order';

/* Free shipping from $30 of goods: the cheapest rate is free, a faster one
   costs what it adds over that. Pre-order deposits do not count. */

const address: Address = { name: 'Ana R.', street1: '1450 N Mountain Ave', city: 'Ontario', state: 'CA', zip: '91762', country: 'US' };

test('$30 of goods and over ships free on the cheapest rate', () => {
  assert.equal(FREE_SHIPPING_FROM_CENTS, 3000);
  assert.equal(shippingCents(2999, 624, 624), 624, 'under $30, the rate as quoted');
  assert.equal(shippingCents(3000, 624, 624), 0, 'at $30, the cheapest is free');
  assert.equal(shippingCents(4200, 922, 624), 298, 'a faster rate costs only the difference');
});

test('the bag counts goods, not deposits', () => {
  const patchAndPoint = priceBag([
    { slug: 'logo-patch', variant: 'square', qty: 1 },
    { slug: 'clear-point', variant: 'table', qty: 1 },
  ]);
  assert.ok(patchAndPoint);
  assert.equal(totals(patchAndPoint, null).goodsCents, 900);
  const tee = priceBag([{ slug: 'logo-tee', variant: 'black-m', qty: 1 }, { slug: 'logo-patch', variant: 'circle', qty: 1 }]);
  assert.ok(tee);
  assert.equal(totals(tee, null).goodsCents, 3600);
});

test('a free rate goes to Stripe as a $0 shipping option', () => {
  const lines = priceBag([{ slug: 'logo-tee', variant: 'black-m', qty: 2 }]);
  assert.ok(lines);
  const p = sessionParams({
    lines,
    rate: { rateId: 'rate_1', label: 'UPS Ground Saver', amountCents: shippingCents(totals(lines, null).goodsCents, 624, 624), estimatedDays: 3 },
    address,
    email: 'a@b.co',
    shop: null,
    origin: 'https://www.useclear.org',
    taxOn: false,
  });
  assert.equal(p.shipping_options![0].shipping_rate_data!.fixed_amount!.amount, 0);
  assert.equal(p.metadata!.shippo_rate_id, 'rate_1', 'the label bought is still the carrier rate picked');
});
