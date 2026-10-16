import type Stripe from 'stripe';
import { Bento, Chip, More } from '@/components/system';
import { ClearBag } from '@/components/shop/ClearBag';
import { ThanksMotion } from '@/components/shop/ThanksMotion';
import { PRODUCTS, RESERVED, SUPPORT_EMAIL } from '@/content/shop';
import { currentShop } from '@/lib/shop/currentShop';
import { usdExact } from '@/lib/shop/money';
import { readReservation } from '@/lib/shop/order';
import { getStripe, isStripeConfigured } from '@/lib/shop/stripe';

export const metadata = {
  title: 'Reserved · Shop',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/* After a reservation is paid. Stripe sends the customer here with the
 * Checkout Session's id, which is long and unguessable; even so, the order
 * slip shows only when the shop signed in on this browser is the shop that
 * placed it. Anyone else sees the timeline and nothing about the order, as
 * /shop/thanks does. Every figure on the slip is read back from Stripe, not
 * from the bag. */

type Row = { label: string; cents: number };
type Slip = { shop: string; paid: Row[]; shipping: number; today: number; later: Row[]; deposits: number; goods: string[] };

const productOf = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
const variantOf = (slug: string, variant: string) => productOf(slug)?.variants.find((v) => v.id === variant)?.label ?? variant;

async function slipFor(sessionId: string | undefined): Promise<Slip | null> {
  if (!sessionId || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId) || !isStripeConfigured()) return null;
  const shop = await currentShop();
  if (!shop) return null;
  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product', 'payment_intent'],
    });
  } catch {
    return null;
  }
  if (session.metadata?.kind !== 'reservation' || session.metadata.shop_id !== shop.id) return null;
  if (session.payment_status !== 'paid') return null;

  const paid: Row[] = [];
  const goods: string[] = [];
  for (const li of session.line_items?.data ?? []) {
    const product = li.price?.product as Stripe.Product | undefined;
    const m = product?.metadata ?? {};
    const p = m.slug ? productOf(m.slug) : undefined;
    if (!p) {
      paid.push({ label: li.description ?? '', cents: li.amount_total });
      continue;
    }
    const many = p.variants.length > 1;
    if (m.kind === 'deposit') {
      paid.push({ label: RESERVED.deposit(li.quantity ?? 1, many ? `${p.name}, ${variantOf(m.slug, m.variant)}` : p.name), cents: li.amount_total });
    } else {
      paid.push({ label: many ? `${p.name} · ${variantOf(m.slug, m.variant)}` : p.name, cents: li.amount_total });
      goods.push(p.name);
    }
  }

  const intent = session.payment_intent as Stripe.PaymentIntent | null;
  const lines = readReservation(intent?.metadata);
  return {
    shop: shop.name,
    paid,
    goods,
    shipping: session.shipping_cost?.amount_total ?? 0,
    today: session.amount_total ?? 0,
    deposits: lines.reduce((n, l) => n + l.depositCents * l.qty, 0),
    later: lines.map((l) => ({
      label: RESERVED.laterLine(productOf(l.slug)?.name ?? l.slug, l.ships),
      cents: (l.unitCents - l.depositCents) * l.qty,
    })),
  };
}

export default async function Reserved({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const slip = await slipFor((await searchParams).session_id);
  const lede = !slip
    ? RESERVED.ledeOnly
    : slip.goods.length === 1
      ? RESERVED.ledeGoods(`the ${slip.goods[0].charAt(0).toLowerCase()}${slip.goods[0].slice(1)}`)
      : slip.goods.length > 1
        ? RESERVED.ledeGoodsMany
        : RESERVED.ledeOnly;

  return (
    <div className="pg-shop">
      <ClearBag />
      <section className="wrap vsec">
        <Bento className={slip ? 'tbx rsvd' : 'tbx'}>
          <div className="cell">
            <div className="c-h">
              <span className="who">{RESERVED.who}</span>
              <Chip tone="live">{RESERVED.chip}</Chip>
            </div>
            <div className="c-m">
              <h1 className="vh1">{RESERVED.heading}</h1>
              <p className="tlede">
                {lede} {RESERVED.ledeTail}
              </p>
              <ThanksMotion>
                <ol className="tl tl4">
                  {RESERVED.steps.map((s, i) => (
                    <li key={s.b} data-s={i === 0 ? 'done' : undefined}>
                      <span className="bar" aria-hidden="true" />
                      <b>{s.b}</b>
                      <small>
                        {'sGeneric' in s ? (slip ? s.s(usdExact(slip.deposits)) : s.sGeneric) : s.s}
                      </small>
                    </li>
                  ))}
                </ol>
              </ThanksMotion>
            </div>
            <div className="c-f">
              <span>
                {RESERVED.mind}{' '}
                <a className="inl" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </span>
              {!slip && <More href="/shop">{RESERVED.back}</More>}
            </div>
          </div>
          {slip && (
            <div className="cell">
              <div className="c-h">
                <span className="who">{RESERVED.order}</span>
                <span className="ck">{slip.shop}</span>
              </div>
              <div className="c-m">
                <div className="slip2">
                  <div className="h3">
                    <span>{RESERVED.paidToday}</span>
                    <span />
                  </div>
                  {slip.paid
                    .filter((r) => !r.label.startsWith('Deposit'))
                    .map((r) => (
                      <div key={r.label}>
                        <span>{r.label}</span>
                        <span>{usdExact(r.cents)}</span>
                      </div>
                    ))}
                  {slip.shipping > 0 && (
                    <div>
                      <span>{RESERVED.shipping}</span>
                      <span>{usdExact(slip.shipping)}</span>
                    </div>
                  )}
                  {slip.paid
                    .filter((r) => r.label.startsWith('Deposit'))
                    .map((r) => (
                      <div key={r.label}>
                        <span>{r.label}</span>
                        <span>{usdExact(r.cents)}</span>
                      </div>
                    ))}
                  <div className="g">
                    <span>{RESERVED.today}</span>
                    <span>{usdExact(slip.today)}</span>
                  </div>
                  <div className="h3">
                    <span>{RESERVED.whenShips}</span>
                    <span />
                  </div>
                  {slip.later.map((r) => (
                    <div className="lt2" key={r.label}>
                      <span>{r.label}</span>
                      <span>{usdExact(r.cents)}</span>
                    </div>
                  ))}
                </div>
                <p className="note">{RESERVED.merchant}</p>
              </div>
              <div className="c-f">
                <More href="/shop">{RESERVED.back}</More>
              </div>
            </div>
          )}
        </Bento>
      </section>
    </div>
  );
}
