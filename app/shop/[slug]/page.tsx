import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Bento, Chip } from '@/components/system';
import { AddToBag } from '@/components/shop/AddToBag';
import { ColourProvider } from '@/components/shop/ColourContext';
import { GoodsGallery } from '@/components/shop/GoodsGallery';
import { HardwareBuy } from '@/components/shop/HardwareBuy';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { PlateDraw } from '@/components/shop/PlateDraw';
import { isEmbroidered, markDetail, ProductPlate } from '@/components/shop/ProductPlate';
import { pad2 } from '@/components/shop/item';
import { CLOSED, GALLERY, HARDWARE_COPY, PRODUCT_COPY, isGoodsKind, type Product } from '@/content/shop';
import { forShopsProducts, fromDeposit, fromPrice, getProduct, goodsProducts, isShopOpen, visibleProducts } from '@/lib/shop/catalog';
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
   category first. Closed, the buy row becomes the closed notice.

   Hardware (section 'for-shops') has its own page, from shops-tools.html:
   the renders, drawing and CAD sheets beside the reservation. */
export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  if (product.section === 'for-shops') return <HardwarePage product={product} />;

  const all = goodsProducts();
  const i = all.findIndex((p) => p.slug === product.slug);
  const others = all.filter((p) => p.slug !== product.slug);
  const also = [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)].slice(0, 3);
  const open = isShopOpen();

  /* A garment in colours shares the colour picked between its gallery and
     its buy panel. */
  const page = (
    <div className="pg-shop">
      <section className="wrap vsec">
        <Bento className={product.images?.length ? 'pd' : 'pd md gd'}>
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
            <GoodsGallery
              slug={product.slug}
              kind={product.kind}
              tone={product.tone}
              media={product.media ?? []}
              stitch={isEmbroidered(product)}
              patch={markDetail(product)}
              back={GALLERY.back.s[product.kind]}
              art={product.plate}
            />
          ) : null}

          <div className="buy">
            <div className="c-h">
              <span className="label">
                {pad2(i + 1)} / {pad2(all.length)}
              </span>
              {product.ships ? <Chip tone="underway">{PRODUCT_COPY.preorder}</Chip> : <span className="ck">{PRODUCT_COPY.run}</span>}
            </div>
            <div className="c-m">
              <h1 className="pname">{product.name}</h1>
              <p className="pline">{product.line}</p>
              <span className="pprice fig">{usd(product.priceCents)}</span>
              {product.ships && <p className="pships">{PRODUCT_COPY.ships(product.ships)}</p>}
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
              <span>{product.ships ? `${PRODUCT_COPY.preorderNote} ${PRODUCT_COPY.shipping}` : PRODUCT_COPY.shipping}</span>
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
                  <ProductPlate kind={x.kind} tone={x.colours?.[0].tone ?? x.tone} art={x.plate} />
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
  return product.colours?.length ? <ColourProvider colours={product.colours}>{page}</ColourProvider> : page;
}

function ClosedNote() {
  return (
    <p className="closednote">
      {CLOSED.productNote} <Link href="/shop">{CLOSED.seeWhy}</Link>
    </p>
  );
}

/* What Also shows under a hardware product: the Point is shown with what
   goes with it; everything else with the Point, Tap and Counter, minus
   itself, the Drawer making up the three. Only what this build shows. */
const ALSO_POINT = ['pay-case', 'clear-stand', 'clear-tap'];
const ALSO_REST = ['clear-point', 'clear-tap', 'clear-counter', 'clear-drawer'];

function HardwarePage({ product }: { product: Product }) {
  const all = forShopsProducts();
  const i = all.findIndex((p) => p.slug === product.slug);
  const also = (product.slug === 'clear-point' ? ALSO_POINT : ALSO_REST)
    .filter((s) => s !== product.slug)
    .map((s) => getProduct(s))
    .filter((p): p is Product => !!p)
    .slice(0, 3);
  const open = isShopOpen();
  const c = HARDWARE_COPY;

  return (
    <div className="pg-shop">
      <section className="wrap vsec">
        <Bento className="pd md hw">
          <ProductGallery
            slug={product.slug}
            kind={product.kind}
            tone={product.tone}
            media={product.media ?? []}
            copy={{ label: c.gallery.label, render: c.gallery.render, drawing: c.gallery.drawing.b, mock: '', cad: c.gallery.cad, note: c.gallery.note }}
            drawing={[c.gallery.drawing]}
          />

          <div className="buy">
            <div className="c-h">
              <span className="label">{c.counter(pad2(i + 1), pad2(all.length))}</span>
              <Chip tone="underway">{c.chip}</Chip>
            </div>
            <div className="c-m">
              <h1 className="pname">{product.name}</h1>
              <p className="pline">{product.line}</p>
              <HardwareBuy
                slug={product.slug}
                priceCents={product.priceCents}
                variants={product.variants}
                variantLabel={product.variantLabel}
                description={product.description}
                ships={product.preorder?.ships ?? ''}
                closed={open ? undefined : <ClosedNote />}
              />
              {product.founding && <p className="fnd">{product.founding}</p>}
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
              <svg viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M9 1.5l6 2.5v4.5c0 3.6-2.5 6.6-6 8-3.5-1.4-6-4.4-6-8V4z" />
                <path d="M6.2 9l2 2 3.6-4" />
              </svg>
              <span>{c.refund}</span>
            </div>
          </div>
        </Bento>

        {also.length > 0 && (
          <div className="also">
            <div className="sec-label label">
              <b>{c.also.kicker}</b>
              {c.also.label}
            </div>
            <div className="bx also2">
              {also.map((x) => {
                const r = x.media?.find((m) => m.kind === 'render');
                return (
                  <Link className="mini" href={`/shop/${x.slug}`} key={x.slug}>
                    <span className="plate photo">{r && <Image src={r.src} alt="" fill sizes="96px" />}</span>
                    <span>
                      <b>{x.name}</b>
                      <small>{c.also.reserve(usd(fromDeposit(x)))}</small>
                    </span>
                    <span className="fig">{usd(fromPrice(x))}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
