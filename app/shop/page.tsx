import { Bento, Chip, HeroWords, LiveDot, More, PageHero, Section, SectionHead } from '@/components/system';
import { Arrow } from '@/components/system/icons';
import { HeroScope } from '@/components/system/HeroScope';
import { ShopNotify } from '@/components/shop/ShopNotify';
import { Shelf } from '@/components/shop/Shelf';
import { ForShopsGrid } from '@/components/shop/ForShopsGrid';
import { HowReserving } from '@/components/shop/HowReserving';
import { toItem } from '@/components/shop/item';
import { WhyMotion } from '@/components/shop/WhyMotion';
import { GoesArt, LastArt, RunsArt } from '@/components/shop/WhyArt';
import { ClosedScene } from '@/components/shop/ClosedScene';
import { BagRow, ClosedBeats, NotifyLink } from '@/components/shop/ClosedParts';
import { CLOSED, CLOSED_REASONS, FOR_SHOPS, OPENING, SHOP_STATUS, SUPPORT_EMAIL, WHY, type Product } from '@/content/shop';
import { forShopsProducts, goodsProducts, isShopOpen } from '@/lib/shop/catalog';
import { shopCatalog } from '@/lib/shop/source';

export const metadata = {
  title: 'Shop',
  description: 'Well-made goods with the Clear name on them, in small runs.',
};

/* Two states from one page, ported from reference/redesign/shop.html: open
 * (the shelf) and closed.
 *
 * Open: the hero with "Wear the co-op." on one line, the shelf (a grid that
 * grows with the catalog, see Shelf), 01 For shops (the hardware, reserved
 * before it is built, from reference/redesign/shops-tools.html), and 02,
 * what the shop is for. For shops only renders when some hardware is
 * visible, and like everything else here only while the shop is open.
 *
 * Closed is an ordinary state the shop goes into and comes out of — sold out,
 * restocking, packing a big batch of orders, a break, or not open yet. So it
 * is built like a shop door: an ink band with the reason as the headline and
 * the notify field, then the window (the sign, and through the glass a scene
 * for the reason) beside what is written on the door. Section 01 is what
 * someone arriving needs: their order still ships, how to hear when it
 * reopens, who to ask. The words come from SHOP_STATUS.reason. */

export default async function Shop() {
  const all = await shopCatalog();
  return isShopOpen(all) ? <OpenShop all={all} /> : <ClosedShop />;
}

function OpenShop({ all }: { all: Product[] }) {
  const products = goodsProducts(all).map(toItem);
  const hardware = forShopsProducts(all).map(toItem);
  return (
    <div className="pg-shop">
      <PageHero
        className="shelf-hero"
        lines={OPENING.lines}
        size="min(9.4vw, 132px)"
        phoneSize="clamp(46px, 13.4vw, 72px)"
        lede={OPENING.lede}
        facts={OPENING.facts}
      >
        <Shelf products={products} forShops={hardware.length} />
      </PageHero>

      {hardware.length > 0 && (
        <Section id={FOR_SHOPS.id} className="hwsec">
          <div className="head">
            <div className="sec-label label">
              <b>{FOR_SHOPS.n}</b>
              {FOR_SHOPS.kicker}
              <Chip tone="underway">{FOR_SHOPS.chip}</Chip>
            </div>
            <h2 className="h2">{FOR_SHOPS.title}</h2>
            <div className="aside">
              <p className="line">{FOR_SHOPS.aside}</p>
              <More href={FOR_SHOPS.more.href}>{FOR_SHOPS.more.label}</More>
            </div>
          </div>
          <ForShopsGrid products={hardware} />
          <HowReserving items={FOR_SHOPS.how} />
        </Section>
      )}

      <Section id="why">
        <SectionHead n={WHY.n} label={WHY.kicker} title={WHY.title} line={WHY.aside} />
        <WhyMotion>
          <Bento className="why3 body-gap">
            {WHY.sides.map((s, i) => (
              <div className="cell" key={s.label}>
                <div className="c-h">
                  <span className="who">{s.label}</span>
                  <span className="ck">{`0${i + 1}`}</span>
                </div>
                <div className="c-m">
                  <div className="art" aria-hidden="true">
                    {i === 0 ? <RunsArt /> : i === 1 ? <LastArt /> : <GoesArt />}
                  </div>
                  <h3>{s.line}</h3>
                  <p>{s.note}</p>
                </div>
              </div>
            ))}
          </Bento>
        </WhyMotion>
      </Section>
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* By hand rather than Intl, so server and client print the same string. */
function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/* The closed band's h1: the shared word masks (HeroWords), wrapped on a phone. */
function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <h1 className="hero-h1" data-phone="wrap">
      <HeroWords lines={lines} />
    </h1>
  );
}

function ClosedShop() {
  const why = CLOSED_REASONS[SHOP_STATUS.reason];
  const m = CLOSED.meanwhile;
  const b = CLOSED.board;
  const cards = [
    ...(why.ordersShipping ? [{ ...m.ordered, foot: <Chip tone="live">{b.ordersValue}</Chip> }] : []),
    {
      ...m.list,
      foot: (
        <NotifyLink>
          {CLOSED.closing.button}
          <Arrow />
        </NotifyLink>
      ),
    },
    {
      ...m.question,
      note: (
        <>
          {m.question.note}{' '}
          <a className="inl" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          .
        </>
      ),
      foot: (
        <a href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
          <Arrow />
        </a>
      ),
    },
  ];

  return (
    <div className="pg-shop">
      <HeroScope className="hero band-ink closedhero">
        <div className="wrap">
          <Lines lines={why.lines} />
          <div className="hero-row">
            <p className="hero-lede" data-in>
              {why.lede}
            </p>
            <div data-in>
              <ShopNotify />
            </div>
          </div>

          <Bento className="shopwin">
            <div className="cell win">
              <div className="c-h">
                <span className="who">{b.doors}</span>
                <Chip tone="absent">{CLOSED.status}</Chip>
              </div>
              <div className="scene">
                <ClosedScene reason={SHOP_STATUS.reason} />
                <div className="sign" role="img" aria-label={`${CLOSED.signTop} ${CLOSED.signWord}. ${why.sign}.`}>
                  <svg className="string" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M50 3 L16 100 M50 3 L84 100" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <span className="nail" aria-hidden="true" />
                  <span className="board" aria-hidden="true">
                    <span className="top3">{CLOSED.signTop}</span>
                    <span className="word">{CLOSED.signWord}</span>
                    <span className="foot3">{why.sign}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="cell">
              <div className="c-h">
                <span className="who">{b.title}</span>
              </div>
              <dl className="board2">
                <div>
                  <dt>{b.reason}</dt>
                  <dd>
                    <span className="v">{why.label}</span>
                  </dd>
                </div>
                <div>
                  <dt>{b.back}</dt>
                  <dd className={SHOP_STATUS.reopensAt ? undefined : 'muted'}>
                    <span className="v">{SHOP_STATUS.reopensAt ? longDate(SHOP_STATUS.reopensAt) : b.backUnset}</span>
                  </dd>
                </div>
                {why.ordersShipping && (
                  <div>
                    <dt>{b.orders}</dt>
                    <dd>
                      <span className="v">
                        <Chip tone="live">{b.ordersValue}</Chip>
                      </span>
                    </dd>
                  </div>
                )}
                <BagRow />
              </dl>
              <div className="c-f">
                <span className="ck">
                  {CLOSED.questions}{' '}
                  <a className="inl" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                </span>
              </div>
            </div>
          </Bento>
          <ClosedBeats />
        </div>
      </HeroScope>

      <Section>
        <div className="sec-label label">
          <b>{m.n}</b>
          {m.kicker}
        </div>
        <Bento className="mw" style={{ '--n': cards.length } as React.CSSProperties}>
          {cards.map((c) => (
            <div className="cell" key={c.label}>
              <div className="c-h">
                <span className="who">{c.label}</span>
              </div>
              <div className="c-m">
                <p className="line2">{c.line}</p>
                <p>{c.note}</p>
              </div>
              <div className="c-f">{c.foot}</div>
            </div>
          ))}
        </Bento>
        <div className="closing2">
          <p>{CLOSED.closing.line}</p>
          <NotifyLink className="btn" variant="primary">
            <LiveDot />
            {CLOSED.closing.button}
          </NotifyLink>
        </div>
      </Section>
    </div>
  );
}
