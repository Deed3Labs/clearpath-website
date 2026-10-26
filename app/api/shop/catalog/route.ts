import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { MOVED, PRODUCTS, type Product } from '@/content/shop';
import { full } from '@/lib/shop/fullRecord';

export const runtime = 'nodejs';

/* The catalog as data, for the Clear Command Center: it reads what the shop
   sells from here instead of keeping a copy that would drift. Live products
   for anyone; drafts too when asked with COMMAND_CATALOG_TOKEN (the same
   value in the API's env). Only what Command needs: no descriptions, media
   or weights; and the renamed slugs. Read-only; nothing here changes the shop.
   With the token and ?full=1, each product's whole record but how it's drawn
   (lib/shop/fullRecord): Command imports the catalog from it once (Phase 11), and from
   then on runs it. */
export async function GET(request: Request) {
  const drafts = isCommand(request.headers.get('authorization'));
  const whole = drafts && new URL(request.url).searchParams.get('full') === '1';
  const products = PRODUCTS.filter((p) => drafts || p.status === 'live').map((p) => (whole ? full(p) : pick(p)));
  /* moved: old slugs to new, so a record kept under an old one still finds its product */
  return NextResponse.json(
    { products, moved: MOVED },
    { headers: { 'Cache-Control': drafts ? 'private, no-store' : 'public, max-age=300' } },
  );
}

function isCommand(header: string | null): boolean {
  const want = process.env.COMMAND_CATALOG_TOKEN?.trim();
  const got = header?.replace(/^Bearer\s+/i, '').trim();
  if (!want || !got) return false;
  /* compared as hashes, so the comparison takes the same time whatever the length */
  const a = createHash('sha256').update(want).digest();
  const b = createHash('sha256').update(got).digest();
  return timingSafeEqual(a, b);
}

function pick(p: Product) {
  return {
    slug: p.slug,
    section: p.section,
    name: p.name,
    line: p.line,
    kind: p.kind,
    category: p.category,
    alsoIn: p.alsoIn ?? [],
    priceCents: p.priceCents,
    status: p.status,
    ships: p.ships ?? p.preorder?.ships ?? null,
    colours: (p.colours ?? []).map((c) => ({ id: c.id, label: c.label })),
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      ...(v.priceCents !== undefined && { priceCents: v.priceCents }),
      ...(v.depositCents !== undefined && { depositCents: v.depositCents }),
      ...(v.colour && { colour: v.colour }),
      ...(v.size && { size: v.size }),
      ...(v.soldOut && { soldOut: true }),
    })),
  };
}
