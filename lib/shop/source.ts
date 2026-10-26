import { PRODUCTS, type Colour, type Product, type ProductKind, type Variant } from '@/content/shop';

/* Where the shop's catalog comes from (the Command Center's Phase 11c).
 *
 * With COMMAND_CATALOG_URL set, the catalog is the Command Center's: what the
 * co-op edits there is what the shop sells. It's read on the server, cached
 * for a minute under the 'shop-catalog' tag, which Command's change clears at
 * once (app/api/shop/revalidate). The drafts come too, with the shared token,
 * and lib/shop/catalog shows them only where drafts show. Without the URL,
 * the catalog is content/shop.ts, as it always was.
 *
 * Command keeps what an owner changes; how a product is drawn (its plate's
 * tone and art, the hardware's renders and CAD sheets) stays in the content
 * file, matched by slug. A product Command added that the file doesn't know
 * is drawn as its kind's plain plate.
 *
 * The shop never goes down with Command: if Command doesn't answer, or
 * answers with nothing usable, the shop keeps the last catalog it read, and
 * failing that the content file.
 */

export const CATALOG_TAG = 'shop-catalog';
let lastGood: Product[] | null = null;

type Env = Record<string, string | undefined>;

/* The catalog for this render. */
export async function shopCatalog(env: Env = process.env, f: typeof fetch = fetch): Promise<Product[]> {
  const url = env.COMMAND_CATALOG_URL?.trim();
  if (!url) return PRODUCTS;
  try {
    const token = env.COMMAND_CATALOG_TOKEN?.trim();
    const r = await f(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, next: { revalidate: 60, tags: [CATALOG_TAG] } } as RequestInit);
    if (!r.ok) throw new Error(`answered ${r.status}`);
    const products = fromCommand((await r.json())?.products);
    lastGood = products;
    return products;
  } catch (e) {
    console.warn(`[shop] the Command Center's catalog: ${(e as Error).message}; using ${lastGood ? 'the last one read' : 'content/shop.ts'}`);
    return lastGood ?? PRODUCTS;
  }
}

/* Command's products as the site's: checked, then given their drawing from
   the content file. Throws on anything the shop can't sell from. */
export function fromCommand(products: unknown): Product[] {
  if (!Array.isArray(products) || !products.length) throw new Error('no products');
  return products.map((x) => {
    const p = x as Record<string, unknown>;
    const ok =
      typeof p.slug === 'string' &&
      (p.section === 'goods' || p.section === 'for-shops') &&
      typeof p.name === 'string' &&
      Number.isInteger(p.priceCents) &&
      (p.priceCents as number) > 0 &&
      Array.isArray(p.variants) &&
      (p.variants as unknown[]).length > 0 &&
      (p.status === 'live' || p.status === 'draft');
    if (!ok) throw new Error(`a product the shop can't sell from (${String(p.slug)})`);
    const local = PRODUCTS.find((l) => l.slug === p.slug);
    const colours = (p.colours as Colour[] | undefined) ?? [];
    const alsoIn = (p.alsoIn as string[] | undefined) ?? [];
    const product = {
      ...(p as unknown as Product),
      kind: p.kind as ProductKind,
      line: String(p.line ?? ''),
      description: String(p.description ?? ''),
      details: (p.details as string[] | undefined) ?? [],
      variants: p.variants as Variant[],
      // the content file leaves these out when there are none
      ...(alsoIn.length ? { alsoIn } : { alsoIn: undefined }),
      ...(colours.length ? { colours } : { colours: undefined }),
      // how it's drawn, from the content file; a new one on its first colour's ground
      tone: local?.tone ?? colours[0]?.tone ?? 'ink',
      ...(local?.plate ? { plate: local.plate } : {}),
      ...(local?.media ? { media: local.media } : {}),
    } as Product;
    for (const k of Object.keys(product) as (keyof Product)[]) if (product[k] === undefined) delete product[k];
    return product;
  });
}

/* For tests: forget the last catalog read. */
export function forgetLastCatalog() {
  lastGood = null;
}
