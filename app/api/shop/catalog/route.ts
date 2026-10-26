import { NextResponse } from 'next/server';
import { MOVED, PRODUCTS, type Product } from '@/content/shop';
import { isCommand } from '@/lib/shop/commandToken';
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
  /* moved: old slugs to new, so a record kept under an old one still finds its product.
     The CDN keys its cache by address, not by who asks: a public answer
     cached for ?full=1 was served to Command's request with the token. So
     ?full=1 is never cached, and the rest varies by Authorization. */
  const asked = new URL(request.url).searchParams.get('full') === '1';
  return NextResponse.json(
    { products, moved: MOVED },
    { headers: { 'Cache-Control': drafts || asked ? 'private, no-store' : 'public, max-age=300', Vary: 'Authorization' } },
  );
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
