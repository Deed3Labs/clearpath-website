import Link from 'next/link';
import { Button } from '@/components/primitives/Button';
import { Ledger } from '@/components/primitives';
import { Parcel } from '@/components/shop/Parcel';
import { ProductPlate } from '@/components/shop/ProductPlate';
import { ShopNotify } from '@/components/shop/ShopNotify';
import { CLOSED, OPENING, WHY, type PlateTone } from '@/content/shop';
import { visibleProducts } from '@/lib/shop/catalog';
import { usd } from '@/lib/shop/money';

export const metadata = {
  title: 'Shop',
  description: 'Well-made goods with the Clear name on them, in small runs.',
};

/* Two states from one page: open (the shelf) and closed.
 *
 * Closed is not "coming soon". It is a shop with its doors shut: the lights
 * are off (the ink band), there is a sign on the door, and a status board
 * beside it that anyone checking back reads first. Under that, the goods are
 * wrapped. The page asks for one thing, an email, and asks twice: once at the
 * door and once after the parcels, for whoever scrolled to look.
 */

export default function Shop() {
  const products = visibleProducts();
  return products.length ? <OpenShop products={products} /> : <ClosedShop />;
}

function OpenShop({ products }: { products: ReturnType<typeof visibleProducts> }) {
  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
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
      </section>

      <WhyBand />
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* By hand rather than Intl, so server and client print the same string. */
function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const WRAP_TONES: PlateTone[] = ['ink', 'land', 'paper'];
const WRAP_TILT = [-4, 3, -2];

function ClosedShop() {
  return (
    <div className="hx">
      {/* Lights off. */}
      <section className="hx-band shop-closed" data-tone="ink">
        <div className="hx-wrap">
          <div className="hx-grid shop-closed-grid">
            <div className="c-half shop-door">
              <div className="shop-sign" role="img" aria-label={`${CLOSED.sign.top} ${CLOSED.sign.word}. ${CLOSED.sign.foot}.`}>
                <svg className="shop-sign-string" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M50 3 L16 100 M50 3 L84 100" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="shop-sign-nail" aria-hidden="true" />
                <span className="shop-sign-board" aria-hidden="true">
                  <span className="shop-sign-top">{CLOSED.sign.top}</span>
                  <span className="shop-sign-word">{CLOSED.sign.word}</span>
                  <span className="shop-sign-foot">{CLOSED.sign.foot}</span>
                </span>
              </div>
            </div>

            <div className="c-half shop-closed-copy">
              <h1 className="shop-closed-h">{CLOSED.heading}</h1>
              <p className="hx-lede">{CLOSED.lede}</p>
              <ShopNotify />

              <Ledger
                items={[
                  { label: CLOSED.board.doors, value: CLOSED.status, chip: CLOSED.status, chipTone: 'absent' },
                  {
                    label: CLOSED.board.opening,
                    value: CLOSED.opensAt ? longDate(CLOSED.opensAt) : CLOSED.board.openingUnset,
                    muted: !CLOSED.opensAt,
                  },
                  { label: CLOSED.board.first, value: CLOSED.board.firstValue },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* The goods, wrapped. */}
      <section className="hx-band hx-wrap">
        <p className="hx-label">
          <b>01</b> {CLOSED.wraps.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{CLOSED.wraps.heading}</h2>
          <p className="hx-lede c-third shop-lede">{CLOSED.wraps.lede}</p>

          <div className="c-full hx-cols shop-wraps" data-n="3" data-rows="4">
            {WHY.sides.map((s, i) => (
              <div className="shop-wrap" key={s.label}>
                <Parcel tone={WRAP_TONES[i]} tilt={WRAP_TILT[i]} />
                <p className="side-label">
                  No. {String(i + 1).padStart(2, '0')} · {s.label}
                </p>
                <p className="side-line">{s.line}</p>
                <p className="t-sm side-note">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="c-full shop-closing">
            <p className="shop-closing-line">{CLOSED.closing.line}</p>
            <Button href="#notify" live>
              {CLOSED.closing.button}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function WhyBand() {
  return (
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
  );
}
