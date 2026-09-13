import Link from 'next/link';
import { Button } from '@/components/primitives/Button';
import { Ledger } from '@/components/primitives';
import { ProductPlate } from '@/components/shop/ProductPlate';
import { ShopNotify } from '@/components/shop/ShopNotify';
import { CLOSED, CLOSED_REASONS, OPENING, SHOP_STATUS, WHY } from '@/content/shop';
import { isShopOpen, visibleProducts } from '@/lib/shop/catalog';
import { usd } from '@/lib/shop/money';

export const metadata = {
  title: 'Shop',
  description: 'Well-made goods with the Clear name on them, in small runs.',
};

/* Two states from one page: open (the shelf) and closed.
 *
 * Closed is an ordinary state the shop goes into and comes out of — sold out,
 * restocking, packing a big batch of orders, a break, or not open yet. So it
 * is built like a shop door, not a launch page: the sign, a status board that
 * says why and when, and what someone arriving needs to know (their order
 * still ships, how to hear when it reopens, who to ask). The words come from
 * SHOP_STATUS.reason in content/shop.ts.
 */

export default function Shop() {
  return isShopOpen() ? <OpenShop products={visibleProducts()} /> : <ClosedShop />;
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

function ClosedShop() {
  const why = CLOSED_REASONS[SHOP_STATUS.reason];
  const m = CLOSED.meanwhile;
  const cards = [...(why.ordersShipping ? [m.ordered] : []), m.list, m.question];

  return (
    <div className="hx">
      <section className="hx-band shop-closed" data-tone="ink">
        <div className="hx-wrap">
          <div className="hx-grid shop-closed-grid">
            <div className="c-half shop-door">
              <div className="shop-sign" role="img" aria-label={`${CLOSED.signTop} ${CLOSED.signWord}. ${why.sign}.`}>
                <svg className="shop-sign-string" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M50 3 L16 100 M50 3 L84 100" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="shop-sign-nail" aria-hidden="true" />
                <span className="shop-sign-board" aria-hidden="true">
                  <span className="shop-sign-top">{CLOSED.signTop}</span>
                  <span className="shop-sign-word">{CLOSED.signWord}</span>
                  <span className="shop-sign-foot">{why.sign}</span>
                </span>
              </div>
            </div>

            <div className="c-half shop-closed-copy">
              <h1 className="shop-closed-h">{why.heading}</h1>
              <p className="hx-lede">{why.lede}</p>
              <ShopNotify />

              <Ledger
                items={[
                  { label: CLOSED.board.doors, value: CLOSED.status, chip: CLOSED.status, chipTone: 'absent' },
                  { label: CLOSED.board.reason, value: why.label },
                  {
                    label: CLOSED.board.back,
                    value: SHOP_STATUS.reopensAt ? longDate(SHOP_STATUS.reopensAt) : CLOSED.board.backUnset,
                    muted: !SHOP_STATUS.reopensAt,
                  },
                  ...(why.ordersShipping
                    ? [{ label: CLOSED.board.orders, value: CLOSED.board.ordersValue, chip: CLOSED.board.ordersValue, chipTone: 'live' as const }]
                    : []),
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b> {m.kicker}
        </p>
        <div className="hx-grid">
          <div className="c-full hx-cols" data-n={cards.length} data-rows="3">
            {cards.map((c) => (
              <div className="side" key={c.label}>
                <p className="side-label">{c.label}</p>
                <p className="side-line shop-meanwhile-line">{c.line}</p>
                <p className="t-sm side-note">{c.note}</p>
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
