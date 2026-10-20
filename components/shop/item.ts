import type { PlateTone, Product } from '@/content/shop';
import { patchShapeOf } from './gallerySlides';
import { fillOf } from './plateArt';

/* What a client component needs to show a product: no status, no weight,
   no photographs beyond the first render. Prices travel for display only;
   checkout prices the order again on the server from the catalog.

   Goods on pre-order carry their ship month, and a garment its colours (a
   plate is drawn on its colour's ground; `tone` is the first colour's).
   Hardware also carries its section, its pre-order terms and its first
   render, so the mini-bag and Also can show the render. The goods' renders
   stay on their product pages: everywhere else a garment is drawn. */
export type ShopItem = Pick<
  Product,
  'slug' | 'section' | 'name' | 'line' | 'priceCents' | 'kind' | 'tone' | 'category' | 'featured' | 'variants' | 'variantLabel' | 'details' | 'preorder' | 'ships' | 'colours' | 'plate'
> & { render?: { src: string; alt: string } };

export const toItem = (p: Product): ShopItem => {
  const r = p.section === 'for-shops' ? p.media?.find((m) => m.kind === 'render') : undefined;
  return {
    slug: p.slug,
    section: p.section,
    name: p.name,
    line: p.line,
    priceCents: p.priceCents,
    kind: p.kind,
    tone: p.colours?.[0].tone ?? p.tone,
    category: p.category,
    featured: p.featured,
    variants: p.variants,
    variantLabel: p.variantLabel,
    details: p.details,
    preorder: p.preorder,
    ships: p.ships,
    colours: p.colours,
    plate: p.plate,
    render: r ? { src: r.src, alt: r.alt } : undefined,
  };
};

/* A product's name inside a sentence ("The hoodie ships either way"): a
   common name drops its capital, a proper one ("Logo Tee") keeps it. */
export const inSentence = (name: string) => (/[A-Z]/.test(name.slice(1)) ? name : `${name.charAt(0).toLowerCase()}${name.slice(1)}`);

/* The body fill for a line's colour (or the product's first): only a colour
   its ground cannot show has one (plateArt fillOf). */
export function swatchOf(p: Pick<Product, 'variants' | 'colours'>, id: string): string | undefined {
  const c = p.variants.find((v) => v.id === id)?.colour;
  return fillOf(p.colours?.find((x) => x.id === c) ?? p.colours?.[0]);
}

/* The patch's shape for a line in the bag: round for the circle. */
export const shapeOf = (p: Pick<Product, 'kind'>, id: string) => patchShapeOf(p.kind, id);

/* The ground a line in the bag is drawn on: its colour's, else the product's. */
export function toneOf(p: Pick<Product, 'variants' | 'colours' | 'tone'>, id: string): PlateTone {
  const c = p.variants.find((v) => v.id === id)?.colour;
  return p.colours?.find((x) => x.id === c)?.tone ?? p.colours?.[0].tone ?? p.tone;
}

/* "Size M", "Black · M" for a garment in colours, or "One size" for a
   product with one variant. */
export function variantText(p: Pick<Product, 'variants' | 'variantLabel'>, id: string, oneSize: string) {
  const v = p.variants.find((x) => x.id === id);
  if (v?.colour) return v.label;
  if (p.variants.length <= 1) return oneSize;
  return `${p.variantLabel ?? ''} ${v?.label ?? id}`.trim();
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
