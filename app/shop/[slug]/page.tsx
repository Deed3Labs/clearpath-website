import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddToBag } from '@/components/shop/AddToBag';
import { ProductPlate } from '@/components/shop/ProductPlate';
import { PRODUCT_COPY } from '@/content/shop';
import { getProduct, visibleProducts } from '@/lib/shop/catalog';
import { usd } from '@/lib/shop/money';

/* Only what this build sells gets a page. A draft's URL 404s in production
   rather than rendering a page whose button checkout would refuse. */
export const dynamicParams = false;

export function generateStaticParams() {
  return visibleProducts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: `${product.name} · Shop`, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <div className="hx-grid shop-product">
          <div className="c-half shop-gallery">
            {product.images?.length ? (
              product.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.src} src={img.src} alt={img.alt} className="shop-photo" />
              ))
            ) : (
              <ProductPlate kind={product.kind} tone={product.tone} label={product.name} />
            )}
          </div>

          <div className="c-half shop-buy">
            <div className="shop-buy-head">
              <h1 className="shop-name">{product.name}</h1>
              <p className="fig shop-price">{usd(product.priceCents)}</p>
            </div>
            <p className="hx-lede">{product.description}</p>

            <AddToBag slug={product.slug} variants={product.variants} variantLabel={product.variantLabel} />

            <div className="shop-details">
              <p className="side-label">{PRODUCT_COPY.details}</p>
              <ul>
                {product.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="t-sm shop-ship-note">{PRODUCT_COPY.shipping}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
