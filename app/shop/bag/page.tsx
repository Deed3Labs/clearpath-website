import { BagView } from '@/components/shop/BagView';
import { BAG } from '@/content/shop';
import { isShopOpen, visibleProducts } from '@/lib/shop/catalog';

export const metadata = {
  title: 'Bag · Shop',
  robots: { index: false },
};

export default function Bag() {
  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <div className="hx-grid">
          <h1 className="hx-h2 c-full">{BAG.heading}</h1>
          {/* The catalog is handed down for display only. What gets charged is
              priced again on the server. */}
          <BagView products={visibleProducts()} open={isShopOpen()} />
        </div>
      </section>
    </div>
  );
}
