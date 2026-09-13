import Link from 'next/link';
import { LogoMark } from '@/components/marks/Logo';
import { ProductPlate } from '@/components/shop/ProductPlate';
import { ShopNotify } from '@/components/shop/ShopNotify';
import { OPENING, SOON, WHY } from '@/content/shop';
import { visibleProducts } from '@/lib/shop/catalog';
import { usd } from '@/lib/shop/money';

export const metadata = {
  title: 'Shop',
  description: 'Well-made goods with the Clear name on them, in small runs.',
};

/* Two states from one page. With nothing live it is a coming-soon page whose
 * one job is the email field; the empty shelf under it says "things will sit
 * here" without inventing the things. With products it is the shelf, full.
 *
 * Rhythm either way: the opening on paper, then what the shop is for on ink.
 */

export default function Shop() {
  const products = visibleProducts();
  const open = products.length > 0;

  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        {open ? (
          <div className="hx-grid">
            <h1 className="hx-h2 c-two-thirds">{OPENING.heading}</h1>
            <p className="hx-lede c-third shop-lede">{OPENING.lede}</p>

            <ul className="c-full shop-grid">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/shop/${p.slug}`} className="shop-card">
                    <ProductPlate kind={p.kind} tone={p.tone} />
                    <span className="shop-card-row">
                      <span className="shop-card-name">{p.name}</span>
                      <span className="fig shop-card-price">{usd(p.priceCents)}</span>
                    </span>
                    <span className="t-sm shop-card-line">{p.line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="hx-grid">
            <h1 className="hx-h2 c-two-thirds">{SOON.heading}</h1>
            <div className="c-third shop-soon-side">
              <p className="hx-lede">{SOON.lede}</p>
              <ShopNotify />
            </div>

            <ul className="c-full shop-shelf" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <li className="shop-slot" key={n}>
                  <span className="shop-slot-ground">
                    <LogoMark size={96} variant="outline" />
                  </span>
                  <span className="shop-slot-cap">
                    <span>{String(n).padStart(2, '0')}</span>
                    <span>In the works</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="hx-band" data-tone="ink">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>01</b> {WHY.kicker}
          </p>
          <div className="hx-cols shop-why" data-n="3" data-rows="3">
            {WHY.sides.map((s) => (
              <div className="side" key={s.label}>
                <p className="side-label">{s.label}</p>
                <p className="side-line">{s.line}</p>
                <p className="t-sm side-note">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
