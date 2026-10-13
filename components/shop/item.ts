import type { Product } from '@/content/shop';

/* What a client component needs to show a product: no status, no weight,
   no photographs. Prices travel for display only; checkout prices the order
   again on the server from the catalog. */
export type ShopItem = Pick<
  Product,
  'slug' | 'name' | 'line' | 'priceCents' | 'kind' | 'tone' | 'category' | 'featured' | 'variants' | 'variantLabel' | 'details'
>;

export const toItem = (p: Product): ShopItem => ({
  slug: p.slug,
  name: p.name,
  line: p.line,
  priceCents: p.priceCents,
  kind: p.kind,
  tone: p.tone,
  category: p.category,
  featured: p.featured,
  variants: p.variants,
  variantLabel: p.variantLabel,
  details: p.details,
});

/* "Size M", or "One size" for a product with one variant. */
export function variantText(p: Pick<Product, 'variants' | 'variantLabel'>, id: string, oneSize: string) {
  if (p.variants.length <= 1) return oneSize;
  const v = p.variants.find((x) => x.id === id);
  return `${p.variantLabel ?? ''} ${v?.label ?? id}`.trim();
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
