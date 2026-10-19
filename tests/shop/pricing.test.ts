import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '@/content/shop';
import { priceBag } from '@/lib/shop/catalog';
import { totals } from '@/lib/shop/order';

/* Rule 1 of the brief: every price and deposit, in cents. The balance is the
   price less the deposit, charged when the item ships. */
const TABLE: [slug: string, variant: string, price: number, deposit: number][] = [
  ['clear-point', 'table', 8900, 5500],
  ['clear-point', 'counter', 12900, 6500],
  ['clear-point', 'ten', 79000, 52000],
  ['clear-tap', 'dock', 3500, 1000],
  ['clear-tap', 'm2', 8900, 8000],
  ['clear-counter', '8', 44900, 34500],
  ['clear-counter', '10', 69900, 55500],
  ['clear-drawer', 'one', 19900, 15000],
  ['label-printer', 'one', 14900, 7000],
  ['pay-case', 'table', 3900, 3000],
  ['pay-case', 'large', 4900, 3500],
  ['tap-phone', 'one', 24900, 18000],
  ['clear-stand', 'one', 3900, 2000],
  ['full-counter', 'one', 114900, 91000],
];

test('every hardware price, deposit and balance matches rule 1', async (t) => {
  for (const [slug, variant, price, dep] of TABLE) {
    await t.test(`${slug}/${variant}`, () => {
      const [l] = priceBag([{ slug, variant, qty: 1 }]) ?? [];
      assert.ok(l, `${slug}/${variant} is in the catalog`);
      assert.equal(l.unitCents, price);
      assert.equal(l.depositCents, dep);
      assert.equal(l.balanceCents, price - dep);
      assert.equal(l.preorder, true);
      assert.ok(l.ships, 'has a ship month');
    });
  }
});

test('the seven drawer panels', () => {
  const PANELS: [string, number, number][] = [
    ['Face · Paper or Cobalt', 2900, 1000],
    ['Face · Walnut', 5900, 1500],
    ['Face · your logo', 7900, 2000],
    ['Top · Mount', 4900, 2000],
    ['Top · Walnut or cork', 6900, 2000],
    ['Insert · wider slots', 2900, 1000],
    ['Locking lid', 3900, 1500],
  ];
  assert.equal(priceBag([{ slug: 'drawer-panels', variant: 'x', qty: 1 }]), null, 'an unknown variant refuses the bag');
  for (const [label, price, dep] of PANELS) {
    const v = priceBagByLabel('drawer-panels', label);
    assert.ok(v, label);
    assert.equal(v.unitCents, price, label);
    assert.equal(v.depositCents, dep, label);
    assert.equal(v.balanceCents, price - dep, label);
  }
});

function priceBagByLabel(slug: string, label: string) {
  const id = PRODUCTS.find((p) => p.slug === slug)?.variants.find((v) => v.label === label)?.id;
  return id ? priceBag([{ slug, variant: id, qty: 1 }])?.[0] : undefined;
}

test('goods are paid in full: no deposit, no balance', () => {
  const [tee] = priceBag([{ slug: 'member-tee', variant: 'black-m', qty: 2 }]) ?? [];
  assert.equal(tee.preorder, false);
  assert.equal(tee.unitCents, 4200);
  assert.equal(tee.depositCents, 0);
  assert.equal(tee.balanceCents, 0);
});

test('the bag example: $348.40 today, $145.00 later, $342.00 before shipping', () => {
  const lines = priceBag([
    { slug: 'member-tee', variant: 'black-m', qty: 1 },
    { slug: 'clear-point', variant: 'table', qty: 4 },
    { slug: 'clear-tap', variant: 'm2', qty: 1 },
  ]);
  assert.ok(lines);
  const before = totals(lines, null);
  assert.equal(before.goodsCents, 4200);
  assert.equal(before.depositsCents, 30000);
  assert.equal(before.todayCents, 34200);
  assert.equal(before.laterCents, 14500);
  const after = totals(lines, 640);
  assert.equal(after.todayCents, 34840);
  assert.equal(after.laterCents, 14500);
  // $136.00 for the four table Points and $9.00 for the Tap with an M2.
  assert.deepEqual(
    lines.filter((l) => l.preorder).map((l) => l.balanceCents * l.qty),
    [13600, 900],
  );
});
