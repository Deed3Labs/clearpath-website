import { PRODUCTS, type Product } from '@/content/shop';

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

/* The shop is open when there is anything to buy. */
export function isShopOpen(): boolean {
  return visibleProducts().length > 0;
}

export type BagLine = { slug: string; variant: string; qty: number };

export type PricedLine = BagLine & { product: Product; variantLabel: string };

/* Resolve a bag against the catalog. Returns null if any line names a
   product or variant this build does not sell, or a sold-out variant —
   checkout refuses the whole bag rather than quietly dropping a line. */
export function priceBag(lines: BagLine[]): PricedLine[] | null {
  const out: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug);
    const variant = product?.variants.find((v) => v.id === line.variant);
    if (!product || !variant || variant.soldOut) return null;
    out.push({ ...line, product, variantLabel: variant.label });
  }
  return out;
}
