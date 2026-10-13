import { BagView } from '@/components/shop/BagView';
import { isShopOpen, visibleProducts } from '@/lib/shop/catalog';

export const metadata = {
  title: 'Bag · Shop',
  robots: { index: false },
};

export default function Bag() {
  return (
    <div className="pg-shop">
      <section className="wrap vsec">
        {/* The catalog is handed down for display only. What gets charged is
            priced again on the server. */}
        <BagView products={visibleProducts()} open={isShopOpen()} />
      </section>
    </div>
  );
}
