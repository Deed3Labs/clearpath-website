import { FOR_SHOPS } from '@/content/shop';
import type { Product } from '@/content/shop';
import { usd } from './money';

/* Prices and deposits, from a product's own fields. Pure functions over the
 * product's shape, with no catalog import, so client components can use
 * them on a ShopItem without pulling the catalog into the browser. Re-exported
 * from lib/shop/catalog. Display only: checkout prices the order again on
 * the server. */

type Priced = Pick<Product, 'priceCents' | 'variants'>;

/* A variant's price, else the product's. */
export function unitPrice(p: Priced, variantId: string): number {
  return p.variants.find((v) => v.id === variantId)?.priceCents ?? p.priceCents;
}

/* What a pre-order reserves now, per unit. 0 for goods, which are paid in full. */
export function deposit(p: Priced, variantId: string): number {
  return p.variants.find((v) => v.id === variantId)?.depositCents ?? 0;
}

/* The cheapest variant: the one "From" quotes, and whose deposit goes with it. */
function cheapest(p: Priced) {
  return p.variants.reduce<Priced['variants'][number] | undefined>(
    (best, v) => (!best || unitPrice(p, v.id) < unitPrice(p, best.id) ? v : best),
    undefined,
  );
}

export function fromPrice(p: Priced): number {
  const v = cheapest(p);
  return v ? unitPrice(p, v.id) : p.priceCents;
}

export function fromDeposit(p: Priced): number {
  const v = cheapest(p);
  return v ? deposit(p, v.id) : 0;
}

/* True when the variants are not all one price, so a tile says "From". */
export function priceVaries(p: Priced): boolean {
  return new Set(p.variants.map((v) => unitPrice(p, v.id))).size > 1;
}

/* "From $89", or "$199" when every variant costs the same. */
export function fromLabel(p: Priced): string {
  const s = usd(fromPrice(p));
  return priceVaries(p) ? FOR_SHOPS.from(s) : s;
}
