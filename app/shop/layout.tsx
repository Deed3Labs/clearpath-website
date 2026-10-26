import { BagProvider } from '@/components/shop/BagProvider';
import { ShopBar } from '@/components/shop/ShopBar';
import { toItem } from '@/components/shop/item';
import { isShopOpen, visibleProducts } from '@/lib/shop/catalog';
import { shopCatalog } from '@/lib/shop/source';
import './shop.css';

/* The bag's state is scoped to /shop. Nothing else on the site is a client
   tree, and a provider in the root layout would make it one. The bar is a
   client component and cannot read the catalog, so it is handed what it
   shows: names for the breadcrumb, and the drawing, name and price of
   whatever just went in the bag. The provider is told what the shop has, so
   a saved bag holding something it no longer sells is cleaned up on load. */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const all = await shopCatalog();
  return (
    <BagProvider known={visibleProducts(all).map((p) => ({ slug: p.slug, variants: p.variants.map((v) => v.id) }))}>
      <ShopBar catalog={visibleProducts(all).map(toItem)} closed={!isShopOpen(all)} />
      {children}
    </BagProvider>
  );
}
