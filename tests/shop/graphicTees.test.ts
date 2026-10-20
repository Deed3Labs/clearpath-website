import { test } from 'node:test';
import assert from 'node:assert/strict';
import { printSrc } from '@/components/shop/plateArt';
import { COLOURS, GRAPHIC_TEES, PRODUCTS } from '@/content/shop';
import { priceBag } from '@/lib/shop/catalog';
import { sessionParams, type Address } from '@/lib/shop/checkout';
import { unitPrice } from '@/lib/shop/price';
import type { Quote } from '@/lib/shop/shippo';

/* The Graphic Tees: the Logo Tee with a print, in Black, Cobalt and White,
   drafts until the art and licences are final. */

const SLUGS = ['graphic-tee-carousel-mall', 'graphic-tee-two-ten-overpass', 'graphic-tee-devore'];
const address: Address = { name: 'Ana R.', street1: '1450 N Mountain Ave', city: 'Ontario', state: 'CA', zip: '91762', country: 'US' };
const rate: Quote = { rateId: 'rate_1', label: 'USPS Ground', amountCents: 640, estimatedDays: 3 };
const tee = (slug: string) => PRODUCTS.find((p) => p.slug === slug)!;

/* Drafts shown ('true', as on a preview deploy, and as `npm test` runs) or
   hidden ('false', as on production). */
function drafts<T>(shown: boolean, fn: () => T): T {
  const was = process.env.SHOP_SHOW_DRAFTS;
  process.env.SHOP_SHOW_DRAFTS = String(shown);
  try {
    return fn();
  } finally {
    if (was === undefined) delete process.env.SHOP_SHOW_DRAFTS;
    else process.env.SHOP_SHOW_DRAFTS = was;
  }
}

test('a Graphic Tee prices at $42 in every colour', () => {
  for (const slug of SLUGS) {
    for (const v of ['black-m', 'cobalt-m', 'white-m']) {
      assert.equal(unitPrice(tee(slug), v), 4200, `${slug}/${v}`);
      const [l] = drafts(true, () => priceBag([{ slug, variant: v, qty: 1 }])) ?? [];
      assert.ok(l, `${slug}/${v} prices once drafts are shown`);
      assert.equal(l.unitCents, 4200);
    }
    assert.deepEqual(tee(slug).colours, [COLOURS.black, COLOURS.cobalt, COLOURS.white]);
  }
});

test('the plate draws the paper print on White and the ink print on Black and Cobalt', () => {
  for (const slug of SLUGS) {
    const { plate, colours } = tee(slug);
    const by = Object.fromEntries(colours!.map((c) => [c.id, printSrc(plate, c.tone)]));
    assert.equal(by.white, plate!.print!.src.paper, slug);
    assert.equal(by.black, plate!.print!.src.ink, slug);
    assert.equal(by.cobalt, plate!.print!.src.ink, slug);
  }
  assert.equal(printSrc(tee('member-tee').plate, 'ink'), null, 'a tee without a print draws none');
});

test('a Graphic Tee not yet on sale cannot go in the bag or to checkout', () => {
  for (const slug of SLUGS) {
    assert.equal(tee(slug).status, 'draft');
    assert.equal(drafts(false, () => priceBag([{ slug, variant: 'black-m', qty: 1 }])), null, slug);
  }
});

test('the Stripe line name reads "Devore Tee (Black · M)"', () => {
  const lines = drafts(true, () => priceBag([{ slug: 'graphic-tee-devore', variant: 'black-m', qty: 1 }]));
  assert.ok(lines);
  const p = sessionParams({ lines, rate, address, email: 'a@b.co', shop: null, origin: 'https://www.useclear.org', taxOn: false });
  assert.deepEqual(
    p.line_items!.map((li) => li.price_data!.product_data!.name),
    ['Devore Tee (Black · M)'],
  );
});

test('the Graphic Tees category is exactly the three', () => {
  assert.deepEqual(
    PRODUCTS.filter((p) => p.category === GRAPHIC_TEES).map((p) => p.slug),
    SLUGS,
  );
});

test('the Logo Tees: $27 and $32, under their old slugs', () => {
  assert.equal(tee('member-tee').name, 'Logo Tee');
  assert.equal(tee('member-tee').priceCents, 2700);
  assert.equal(tee('long-sleeve-mock-tee').name, 'Logo Long-Sleeve Tee');
  assert.equal(tee('long-sleeve-mock-tee').priceCents, 3200);
});
