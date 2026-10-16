import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bento } from '@/components/system';
import { AddToBag } from '@/components/shop/AddToBag';
import { Gallery } from '@/components/shop/Gallery';
import { PlateDraw } from '@/components/shop/PlateDraw';
import { isEmbroidered, markDetail, ProductPlate } from '@/components/shop/ProductPlate';
import { pad2 } from '@/components/shop/item';
import { CLOSED, GALLERY, PRODUCT_COPY, isGoodsKind } from '@/content/shop';
import { getProduct, isShopOpen, visibleProducts } from '@/lib/shop/catalog';
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

/* A product, ported from the mockup's #p/<slug> view: the drawing with its
   three views beside the buy panel, then up to three other pieces, the same
   category first. Closed, the buy row becomes the closed notice. */
export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const all = visibleProducts();
  const i = all.findIndex((p) => p.slug === product.slug);
  const others = all.filter((p) => p.slug !== product.slug);
  const also = [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)].slice(0, 3);
  const open = isShopOpen();

  return (
    <div className="pg-shop">
      <section className="wrap vsec">
        <Bento className="pd">
          {product.images?.length ? (
            <div className="gal">
              <div className="gal-wrap photos">
                {product.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.src} src={img.src} alt={img.alt} />
                ))}
              </div>
            </div>
          ) : isGoodsKind(product.kind) ? (
            <Gallery
              kind={product.kind}
              tone={product.tone}
              stitch={isEmbroidered(product)}
              mark={markDetail(product)}
              back={GALLERY.back.s[product.kind]}
            />
          ) : null}

          <div className="buy">
            <div className="c-h">
              <span className="label">
                {pad2(i + 1)} / {pad2(all.length)}
              </span>
              <span className="ck">{PRODUCT_COPY.run}</span>
            </div>
            <div className="c-m">
              <h1 className="pname">{product.name}</h1>
              <p className="pline">{product.line}</p>
              <span className="pprice fig">{usd(product.priceCents)}</span>
              <p className="pdesc">{product.description}</p>
              <AddToBag
                slug={product.slug}
                priceCents={product.priceCents}
                variants={product.variants}
                variantLabel={product.variantLabel}
                closed={
                  open ? undefined : (
                    <p className="closednote">
                      {CLOSED.productNote}{' '}
                      <Link href="/shop">{CLOSED.seeWhy}</Link>
                    </p>
                  )
                }
              />
              <ol className="dets" aria-label={PRODUCT_COPY.details}>
                {product.details.map((d, k) => (
                  <li key={d}>
                    <b aria-hidden="true">{pad2(k + 1)}</b>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="c-f">
              <svg viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
                <path d="M1.5 5h9v7.5h-9zM10.5 7.5h3.5l2.5 2.6v2.4h-6z" />
                <circle cx="4.5" cy="13.5" r="1.4" />
                <circle cx="13" cy="13.5" r="1.4" />
              </svg>
              <span>{PRODUCT_COPY.shipping}</span>
            </div>
          </div>
        </Bento>

        {also.length > 0 && (
          <div className="also">
            <div className="sec-label label">
              <b>{PRODUCT_COPY.also.kicker}</b>
              {PRODUCT_COPY.also.label}
            </div>
            <PlateDraw className="bx also2">
              {also.map((x) => (
                <Link className="mini" href={`/shop/${x.slug}`} key={x.slug}>
                  <ProductPlate kind={x.kind} tone={x.tone} />
                  <span>
                    <b>{x.name}</b>
                    <small>{x.line}</small>
                  </span>
                  <span className="fig">{usd(x.priceCents)}</span>
                </Link>
              ))}
            </PlateDraw>
          </div>
        )}
      </section>
    </div>
  );
}
