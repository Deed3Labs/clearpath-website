import type { Product } from '@/content/shop';

/* What a client component needs to show a product: no status, no weight,
   no photographs beyond the first render. Prices travel for display only;
   checkout prices the order again on the server from the catalog.

   Goods on pre-order carry their ship month. Hardware also carries its section, its pre-order terms and its first
   render, so the shelf, the mini-bag and Also can show the render. */
export type ShopItem = Pick<
  Product,
  'slug' | 'section' | 'name' | 'line' | 'priceCents' | 'kind' | 'tone' | 'category' | 'featured' | 'variants' | 'variantLabel' | 'details' | 'preorder' | 'ships'
> & { render?: { src: string; alt: string } };

export const toItem = (p: Product): ShopItem => {
  const r = p.media?.find((m) => m.kind === 'render');
  return {
    slug: p.slug,
    section: p.section,
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
    preorder: p.preorder,
    ships: p.ships,
    render: r ? { src: r.src, alt: r.alt } : undefined,
  };
};

/* "Size M", or "One size" for a product with one variant. */
export function variantText(p: Pick<Product, 'variants' | 'variantLabel'>, id: string, oneSize: string) {
  if (p.variants.length <= 1) return oneSize;
  const v = p.variants.find((x) => x.id === id);
  return `${p.variantLabel ?? ''} ${v?.label ?? id}`.trim();
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
