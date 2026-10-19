import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readBag } from '@/components/shop/bagLines';
import { PRODUCTS } from '@/content/shop';
import { priceBag, type PricedLine } from '@/lib/shop/catalog';
import { sessionParams, type Address } from '@/lib/shop/checkout';
import type { Quote } from '@/lib/shop/shippo';

/* The wearables: colours live in the variant id ("black-m"), so the bag,
   checkout and Stripe still handle one variant string. */

const address: Address = { name: 'Ana R.', street1: '1450 N Mountain Ave', city: 'Ontario', state: 'CA', zip: '91762', country: 'US' };
const rate: Quote = { rateId: 'rate_1', label: 'USPS Ground', amountCents: 640, estimatedDays: 3 };
const origin = 'https://www.useclear.org';
const names = (lines: PricedLine[]) =>
  sessionParams({ lines, rate, address, email: 'a@b.co', shop: null, origin, taxOn: false }).line_items!.map((li) => li.price_data!.product_data!.name);

test('a colour/size variant prices from its product', () => {
  const [l] = priceBag([{ slug: 'hoodie', variant: 'land-l', qty: 1 }]) ?? [];
  assert.ok(l, 'hoodie/land-l is in the catalog');
  assert.equal(l.unitCents, 8800);
  assert.equal(l.variantLabel, 'Land · L');
  assert.equal(l.preorder, false);
  // Every garment is every colour × every size.
  for (const p of PRODUCTS.filter((x) => x.colours)) {
    assert.equal(p.variants.length, p.colours!.length * 5, p.slug);
    for (const v of p.variants) assert.equal(v.id, `${v.colour}-${v.size}`, p.slug);
  }
});

test('a sold-out colour/size pair is refused like any sold-out variant', () => {
  const v = PRODUCTS.find((p) => p.slug === 'member-tee')!.variants.find((x) => x.id === 'navy-xl')!;
  v.soldOut = true;
  try {
    assert.equal(priceBag([{ slug: 'member-tee', variant: 'navy-xl', qty: 1 }]), null);
    assert.ok(priceBag([{ slug: 'member-tee', variant: 'navy-l', qty: 1 }]), 'another size of that colour still sells');
  } finally {
    delete v.soldOut;
  }
});

test('a one-colour product still names its colour: "Navy · M"', () => {
  const lines = priceBag([{ slug: 'turtleneck', variant: 'navy-m', qty: 1 }]);
  assert.ok(lines);
  assert.equal(lines[0].variantLabel, 'Navy · M');
  assert.deepEqual(names(lines), ['Turtleneck (Navy · M)']);
});

test('the Stripe line name is "Mock tee (Black · M)"', () => {
  const lines = priceBag([{ slug: 'member-tee', variant: 'black-m', qty: 1 }]);
  assert.ok(lines);
  assert.deepEqual(names(lines), ['Mock tee (Black · M)']);
});

test('a saved bag line with a vanished variant is dropped on load, not sent to checkout', () => {
  const known = PRODUCTS.map((p) => ({ slug: p.slug, variants: p.variants.map((v) => v.id) }));
  const saved = [
    { slug: 'member-tee', variant: 'm', qty: 1 },
    { slug: 'turtleneck', variant: 'navy-l', qty: 1 },
  ];
  // As it was saved, the old line would refuse the whole bag at checkout.
  assert.equal(priceBag(saved), null);
  const bag = readBag(saved, known);
  assert.equal(bag.dropped, 1);
  assert.deepEqual(bag.lines, [{ slug: 'turtleneck', variant: 'navy-l', qty: 1 }]);
  assert.ok(priceBag(bag.lines), 'what is left prices');
  // Never mapped to a colour.
  assert.equal(bag.lines.some((l) => l.slug === 'member-tee'), false);
});

test('the Stripe picture is the colour bought', () => {
  const lines = priceBag([
    { slug: 'member-tee', variant: 'white-s', qty: 1 },
    { slug: 'hoodie', variant: 'land-xl', qty: 1 },
    { slug: 'coop-cap', variant: 'one', qty: 1 },
  ]);
  assert.ok(lines);
  const imgs = sessionParams({ lines, rate, address, email: 'a@b.co', shop: null, origin, taxOn: false }).line_items!.map(
    (li) => li.price_data!.product_data!.images,
  );
  assert.deepEqual(imgs, [[`${origin}/shop/goods/member-tee/render-white.jpg`], [`${origin}/shop/goods/hoodie/render-land.jpg`], undefined]);
});
