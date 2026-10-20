import { PRODUCTS, SHOP_STATUS, type Product } from '@/content/shop';
import { fromPrice } from './price';

/* Which products exist, as far as this build is concerned.
 *
 * Drafts render in `next dev` so the pages can be designed against something,
 * and on any deploy with SHOP_SHOW_DRAFTS=true (set it on Vercel Preview to
 * review a product before it goes live). They are refused by checkout in the
 * same way they are hidden from the pages, so a draft can never be bought on
 * production by someone who guessed its URL.
 */
export function showDrafts(): boolean {
  // An explicit value wins either way, so the closed state can be seen in dev too.
  if (process.env.SHOP_SHOW_DRAFTS === 'true') return true;
  if (process.env.SHOP_SHOW_DRAFTS === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

export function visibleProducts(): Product[] {
  const drafts = showDrafts();
  return PRODUCTS.filter((p) => p.status === 'live' || drafts);
}

export function getProduct(slug: string): Product | undefined {
  return visibleProducts().find((p) => p.slug === slug);
}

/* The shelf's goods, and the For shops hardware, as far as this build shows. */
/* The goods run from cheapest to dearest, on the shelf and everywhere they
   are counted ("01 / 08"); products at one price keep the catalog's order. */
export function goodsProducts(): Product[] {
  return visibleProducts()
    .filter((p) => p.section === 'goods')
    .map((p, i) => ({ p, i }))
    .sort((a, b) => fromPrice(a.p) - fromPrice(b.p) || a.i - b.i)
    .map(({ p }) => p);
}

export function forShopsProducts(): Product[] {
  return visibleProducts().filter((p) => p.section === 'for-shops');
}

export { deposit, fromDeposit, fromLabel, fromPrice, priceVaries, unitPrice } from './price';

/* Open means the switch is on AND there is something to buy. */
export function isShopOpen(): boolean {
  const env = process.env.SHOP_OPEN;
  const open = env === 'true' ? true : env === 'false' ? false : SHOP_STATUS.open;
  return open && visibleProducts().length > 0;
}

export type BagLine = { slug: string; variant: string; qty: number };

export type PricedLine = BagLine & {
  product: Product;
  variantLabel: string;
  /* Per unit, in cents, from the catalog: never from the browser. */
  unitCents: number;
  /* A pre-order reserves `depositCents` a unit now and charges `balanceCents`
     a unit when it ships. Goods are paid in full now: deposit 0, balance 0. */
  preorder: boolean;
  depositCents: number;
  balanceCents: number;
  /* The estimated ship month, for a pre-order ("Feb 2027"). */
  ships?: string;
};

/* Resolve a bag against the catalog. Returns null if any line names a
   product or variant this build does not sell, or a sold-out variant —
   checkout refuses the whole bag rather than quietly dropping a line.
   This is the one place an order is priced: the rates and checkout routes
   both call it, and the browser only ever says what and how many. A
   pre-order variant without a deposit, or with one that is not below its
   price, is a catalog mistake and refuses the bag the same way. */
export function priceBag(lines: BagLine[]): PricedLine[] | null {
  const out: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug);
    const variant = product?.variants.find((v) => v.id === line.variant);
    if (!product || !variant || variant.soldOut) return null;
    const unitCents = variant.priceCents ?? product.priceCents;
    const preorder = product.section === 'for-shops';
    const depositCents = preorder ? variant.depositCents ?? 0 : 0;
    if (preorder && !(depositCents > 0 && depositCents < unitCents && product.preorder)) return null;
    out.push({
      ...line,
      product,
      variantLabel: variant.label,
      unitCents,
      preorder,
      depositCents,
      balanceCents: preorder ? unitCents - depositCents : 0,
      ships: preorder ? product.preorder?.ships : undefined,
    });
  }
  return out;
}
