import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gallerySlides, patchShapeOf } from '@/components/shop/gallerySlides';
import { GALLERY, PRODUCTS } from '@/content/shop';
import { priceBag } from '@/lib/shop/catalog';
import { sessionParams, type Address } from '@/lib/shop/checkout';
import type { Quote } from '@/lib/shop/shippo';

/* The Logo Patch, sold on its own: Square or Circle, $9. */

const address: Address = { name: 'Ana R.', street1: '1450 N Mountain Ave', city: 'Ontario', state: 'CA', zip: '91762', country: 'US' };
const rate: Quote = { rateId: 'rate_1', label: 'USPS Ground', amountCents: 640, estimatedDays: 3 };
const patch = PRODUCTS.find((p) => p.slug === 'logo-patch')!;
const copy = { render: GALLERY.render, drawing: GALLERY.drawing, mock: GALLERY.mock, cad: '' };
const views = [
  { b: 'Front', s: '' },
  { b: 'Patch', s: '' },
  { b: 'Back', s: '' },
];

test('each shape prices at $9', () => {
  for (const variant of ['square', 'circle']) {
    const [l] = priceBag([{ slug: 'logo-patch', variant, qty: 1 }]) ?? [];
    assert.ok(l, variant);
    assert.equal(l.unitCents, 900);
    assert.equal(l.preorder, false);
  }
  assert.equal(patch.status, 'live');
});

test('the Stripe line names read "Logo Patch (Square)" and "Logo Patch (Circle)"', () => {
  const lines = priceBag([
    { slug: 'logo-patch', variant: 'square', qty: 1 },
    { slug: 'logo-patch', variant: 'circle', qty: 1 },
  ]);
  assert.ok(lines);
  const p = sessionParams({ lines, rate, address, email: 'a@b.co', shop: null, origin: 'https://www.useclear.org', taxOn: false });
  assert.deepEqual(
    p.line_items!.map((li) => li.price_data!.product_data!.name),
    ['Logo Patch (Square)', 'Logo Patch (Circle)'],
  );
});

test('picking Circle swaps the gallery to the circle pictures and the drawing to the round patch', () => {
  const srcs = (variant: string) =>
    gallerySlides(patch.media!, { variant }, copy, views).map((s) => (s.kind === 'drawing' ? `drawing:${s.view}` : s.src!.split('/').pop()));
  assert.deepEqual(srcs('circle'), ['mock-circle.jpg', 'detail-circle.jpg', 'mock-back-circle.jpg', 'drawing:front', 'drawing:mark', 'drawing:back', 'mock-pair.jpg']);
  assert.deepEqual(srcs('square'), ['mock-square.jpg', 'detail-square.jpg', 'mock-back-square.jpg', 'drawing:front', 'drawing:mark', 'drawing:back', 'mock-pair.jpg']);
  // The same place in the gallery across shapes: the second picture is the close-up in both.
  const key = (variant: string) => gallerySlides(patch.media!, { variant }, copy, views)[1].key;
  assert.equal(key('square'), key('circle'));
  assert.equal(patchShapeOf('patch', 'circle'), 'circle');
  assert.equal(patchShapeOf('patch', 'square'), 'square');
});

test('garments still draw a square patch', () => {
  for (const p of PRODUCTS.filter((x) => x.section === 'goods' && x.kind !== 'patch')) {
    assert.equal(patchShapeOf(p.kind, p.variants[0].id), 'square', p.slug);
  }
  assert.equal(patchShapeOf('tee', 'circle'), 'square', 'only the patch itself goes round');
});
