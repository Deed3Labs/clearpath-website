import { MAX_LINES, MAX_PER_LINE, MOVED } from '@/content/shop';
import type { BagLine } from '@/lib/shop/catalog';

/* Reading a saved bag. Plain functions (no React), so the tests can run them.
 *
 * A saved bag can outlive what it holds: a product taken down, or a variant
 * that no longer exists (the tee's sizes became colour × size, so a bag
 * saved with `member-tee/m` holds an id the shop no longer has). Checkout
 * refuses a whole bag over one unknown line, so such a line is taken out
 * when the bag loads, and the bag says so once. An old id is never mapped
 * to a colour: that would put a colour in the bag nobody picked.
 *
 * A product whose slug changed (MOVED) is the same product, so its lines
 * move to the new slug rather than being dropped. */

/* What the shop has: each product's variant ids. */
export type Known = { slug: string; variants: string[] }[];

export const clampQty = (n: number) => Math.max(0, Math.min(MAX_PER_LINE, Math.floor(Number.isFinite(n) ? n : 0)));

export function readBag(raw: unknown, known?: Known): { lines: BagLine[]; dropped: number } {
  if (!Array.isArray(raw)) return { lines: [], dropped: 0 };
  const lines = raw
    .filter((l): l is BagLine => !!l && typeof l.slug === 'string' && typeof l.variant === 'string' && typeof l.qty === 'number')
    .map((l) => ({ slug: MOVED[l.slug] ?? l.slug, variant: l.variant, qty: clampQty(l.qty) }))
    .filter((l) => l.qty > 0)
    .slice(0, MAX_LINES);
  if (!known) return { lines, dropped: 0 };
  const kept = lines.filter((l) => known.some((k) => k.slug === l.slug && k.variants.includes(l.variant)));
  return { lines: kept, dropped: lines.length - kept.length };
}
