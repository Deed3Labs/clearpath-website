import { BagProvider } from '@/components/shop/BagProvider';
import { ShopBar } from '@/components/shop/ShopBar';
import { visibleProducts } from '@/lib/shop/catalog';

/* The bag's state is scoped to /shop. Nothing else on the site is a client
   tree, and a provider in the root layout would make it one. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <BagProvider>
      {/* Names for the breadcrumb; the bar is a client component and cannot read the catalog. */}
      <ShopBar names={Object.fromEntries(visibleProducts().map((p) => [p.slug, p.name]))} />
      {children}
    </BagProvider>
  );
}
