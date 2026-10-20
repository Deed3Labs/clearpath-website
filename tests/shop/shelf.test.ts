import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inFilter } from '@/components/shop/item';
import { SHELF_FILTERS } from '@/content/shop';
import { goodsProducts } from '@/lib/shop/catalog';
import { fromPrice } from '@/lib/shop/price';

/* The shelf: cheapest first, so the Logo Patch leads, and the filters are
   Wear (every garment), Logo (the Logo line), Graphic Tees and Accessories. */

const live = () => {
  const was = process.env.SHOP_SHOW_DRAFTS;
  process.env.SHOP_SHOW_DRAFTS = 'false';
  try {
    return goodsProducts();
  } finally {
    if (was === undefined) delete process.env.SHOP_SHOW_DRAFTS;
    else process.env.SHOP_SHOW_DRAFTS = was;
  }
};

test('the goods run cheapest first, the Logo Patch leading', () => {
  const goods = live();
  assert.equal(goods[0].slug, 'logo-patch');
  const prices = goods.map((p) => fromPrice(p));
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  assert.deepEqual(
    goods.map((p) => p.slug),
    [
      'logo-patch',
      'logo-tee',
      'logo-long-sleeve-tee',
      'graphic-tee-carousel-mall',
      'graphic-tee-two-ten-overpass',
      'graphic-tee-devore',
      'logo-hoodie',
      'logo-turtleneck',
    ],
  );
});

test('the filters: Wear is every garment, Logo the Logo line, then Graphic Tees and Accessories', () => {
  const goods = live();
  const under = (f: string) => goods.filter((p) => inFilter(p, f)).map((p) => p.slug);
  assert.deepEqual(SHELF_FILTERS, ['Wear', 'Logo', 'Graphic Tees', 'Accessories']);
  assert.deepEqual(under('Wear'), [
    'logo-tee',
    'logo-long-sleeve-tee',
    'graphic-tee-carousel-mall',
    'graphic-tee-two-ten-overpass',
    'graphic-tee-devore',
    'logo-hoodie',
    'logo-turtleneck',
  ]);
  assert.deepEqual(under('Logo'), ['logo-patch', 'logo-tee', 'logo-long-sleeve-tee', 'logo-hoodie', 'logo-turtleneck']);
  assert.deepEqual(under('Graphic Tees'), ['graphic-tee-carousel-mall', 'graphic-tee-two-ten-overpass', 'graphic-tee-devore']);
  assert.deepEqual(under('Accessories'), ['logo-patch']);
});
