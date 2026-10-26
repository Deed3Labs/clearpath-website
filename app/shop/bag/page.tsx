import { BagView } from '@/components/shop/BagView';
import { isShopOpen, visibleProducts } from '@/lib/shop/catalog';
import { shopCatalog } from '@/lib/shop/source';

export const metadata = {
  title: 'Bag · Shop',
  robots: { index: false },
};

export default async function Bag() {
  const all = await shopCatalog();
  return (
    <div className="pg-shop">
      <section className="wrap vsec">
        {/* The catalog is handed down for display only. What gets charged is
            priced again on the server. */}
        <BagView products={visibleProducts(all)} open={isShopOpen(all)} />
      </section>
    </div>
  );
}
