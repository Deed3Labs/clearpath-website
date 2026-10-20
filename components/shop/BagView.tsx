'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BAG, CLOSED, MAX_PER_LINE, PRODUCT_COPY, STATES, items, type Product } from '@/content/shop';
import { FieldSelect } from '@/components/interactive/FieldSelect';
import { More } from '@/components/system';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';
import { usd, usdExact } from '@/lib/shop/money';
import { FREE_SHIPPING_FROM_CENTS, hasGoods, hasPreorder, steps as stepsFor, totals, type OrderLine, type Step } from '@/lib/shop/order';
import { deposit, unitPrice } from '@/lib/shop/price';
import { useBag } from './BagProvider';
import { inSentence, shapeOf, swatchOf, toneOf, variantText } from './item';
import { ProductPlate } from './ProductPlate';

/* The bag, then checkout as steps that fold up once they are done: your
   shop (only with a pre-order in the bag), where it goes, how it ships
   (only with goods in the bag), and pay. The steps are numbered from the
   list this bag needs (order.steps), so a skipped one renumbers the rest.
 *
 * Shipping has to be quoted before payment (Stripe Checkout cannot fetch live
 * rates mid-flow), so this page does the part Checkout cannot: it takes the
 * address, asks Shippo for rates on the goods (/api/shop/rates), and lets the
 * customer choose one. Checkout (/api/shop/checkout) then collects the card
 * and charges exactly that. Pre-orders ship when they are built and are not
 * in the parcel; their deposits are charged now and the rest when each ships.
 *
 * Pre-orders are for shops on Clear: the Your shop step hands off to the
 * merchant app (/api/shop/account/connect) and comes back here signed in.
 * The shop comes from a verified, httpOnly session; this page only asks
 * /api/shop/account what to show.
 *
 * Totals here are for reading. The server prices the order again from the
 * catalog and re-reads the rate from Shippo, and that is what gets charged.
 * A quote is for this bag to this address: change either, or reopen the
 * address, and the rates are cleared. Nothing here says anything worked
 * until the API has answered 2xx; an error says nothing was charged.
 *
 * Closed, the bag still shows (it is saved on this device for when the shop
 * reopens) but rates and pay stay disabled, and the API refuses anyway. */

type Quote = { rateId: string; label: string; amountCents: number; estimatedDays: number | null };
type Phase = 'idle' | 'rating' | 'paying';
type Addr = { name: string; email: string; street1: string; street2: string; city: string; state: string; zip: string };

const EMPTY: Addr = { name: '', email: '', street1: '', street2: '', city: '', state: '', zip: '' };
const STATE_NAMES = STATES.map(([, n]) => n);
type ShopView = { name: string; owner: string; email?: string; approval: string; address?: { line1: string; line2?: string; city: string; state: string; zip: string } };
type Account = { mode: 'clear' | 'mock' | 'off'; shop: ShopView | null };

/* A figure that counts to its new value. The text is the end state; the
   count is decoration over it. */
function CountTo({ cents }: { cents: number }) {
  const ref = useRef<HTMLElement>(null);
  const last = useRef(cents);
  useEffect(() => {
    const el = ref.current;
    const from = last.current;
    last.current = cents;
    if (!el || from === cents || !motionOK()) return;
    const o = { v: from };
    const tw = gsap.to(o, {
      v: cents,
      duration: 0.7,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = usdExact(Math.round(o.v));
      },
      onComplete: () => {
        el.textContent = usdExact(cents);
      },
    });
    return () => {
      tw.kill();
      el.textContent = usdExact(cents);
    };
  }, [cents]);
  return (
    <b ref={ref} className="fig">
      {usdExact(cents)}
    </b>
  );
}

export function BagView({ products, open }: { products: Product[]; open: boolean }) {
  const { lines, ready, dropped, setQty, remove } = useBag();
  const [addr, setAddr] = useState<Addr>(EMPTY);
  const [bad, setBad] = useState<Set<keyof Addr>>(new Set());
  const [addrDone, setAddrDone] = useState(false);
  const [rates, setRates] = useState<Quote[] | null>(null);
  const [rateId, setRateId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  /* Bumped when the shop's address is filled in, so the State picker (which
     owns its own value) starts again from it. */
  const [prefill, setPrefill] = useState(0);
  const coRef = useRef<HTMLDivElement>(null);

  const priced = useMemo(
    () =>
      lines.map((l) => {
        const product = products.find((p) => p.slug === l.slug);
        const option = product?.variants.find((v) => v.id === l.variant);
        const available = !!product && !!option && !option.soldOut;
        const unitCents = product ? unitPrice(product, l.variant) : 0;
        const preorder = product?.section === 'for-shops';
        const depositCents = product && preorder ? deposit(product, l.variant) : 0;
        const order: OrderLine = {
          ...l,
          unitCents,
          preorder,
          depositCents,
          balanceCents: preorder ? unitCents - depositCents : 0,
          ships: product?.preorder?.ships,
        };
        return { ...l, product, option, available, order };
      }),
    [lines, products],
  );

  const orderLines = priced.filter((l) => l.available).map((l) => l.order);
  const preorderIn = hasPreorder(orderLines);
  const goodsIn = hasGoods(orderLines);
  const flow = stepsFor(orderLines);
  const rate = rates?.find((r) => r.rateId === rateId) ?? null;
  const t = totals(orderLines, rate?.amountCents ?? null);
  /* What a shipping amount reads as: Free at nothing. */
  const ship = (c: number) => (c === 0 ? BAG.free : usdExact(c));
  const unavailable = priced.some((l) => !l.available);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const shop = account?.shop ?? null;

  /* Which steps are done, in this bag's order; the first one not done is
     open, and the ones after it are locked. */
  const done: Record<Step, boolean> = { shop: !!shop, addr: addrDone, ship: !!rate, pay: false };
  const at = flow.findIndex((k) => !done[k]);
  const stateOf = (k: Step) => {
    const i = flow.indexOf(k);
    return i < at ? 'done' : i === at ? 'open' : 'locked';
  };
  const num = (k: Step) => String(flow.indexOf(k) + 1).padStart(2, '0');

  /* Who is signed in, and the note the hand-off came back with. */
  useEffect(() => {
    let live = true;
    fetch('/api/shop/account', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((a: Account | null) => live && setAccount(a ?? { mode: 'off', shop: null }))
      .catch(() => live && setAccount({ mode: 'off', shop: null }));
    const back = new URLSearchParams(window.location.search).get('shop');
    if (back === 'off') setError(BAG.shopOff);
    if (back === 'failed') setError(BAG.shopFailed);
    if (back) window.history.replaceState(null, '', window.location.pathname);
    return () => {
      live = false;
    };
  }, []);

  /* Signed in: where it goes starts from the shop's own details. */
  useEffect(() => {
    if (!shop) return;
    setAddr((a) => {
      if (a.street1 || a.name) return a;
      const ad = shop.address;
      return {
        name: shop.owner,
        email: shop.email ?? '',
        street1: ad?.line1 ?? '',
        street2: ad?.line2 ?? '',
        city: ad?.city ?? '',
        state: ad?.state ?? '',
        zip: ad?.zip ?? '',
      };
    });
    setPrefill((n) => n + 1);
  }, [shop]);

  /* A quote is for this bag to this address. Change either and it is stale. */
  const bagKey = JSON.stringify(lines);
  const addrKey = `${addr.street1}|${addr.street2}|${addr.city}|${addr.state}|${addr.zip}`;
  useEffect(() => {
    setRates(null);
    setRateId(null);
    setAddrDone(false);
  }, [bagKey, addrKey]);

  /* The step that opens fades up into place; the one that closes is folded
     to its summary line at once. Opacity and transform only. */
  const openKey = flow[at] ?? 'pay';
  const lastOpen = useRef(openKey);
  useIsoLayoutEffect(() => {
    if (lastOpen.current === openKey) return;
    lastOpen.current = openKey;
    const body = coRef.current?.querySelector<HTMLElement>(`.stp[data-k="${openKey}"] .stp-b`);
    if (!body || !motionOK()) return;
    const tw = gsap.from(body, { opacity: 0, y: 10, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' });
    const rows = body.querySelectorAll('.rate');
    const tw2 = rows.length ? gsap.from(rows, { opacity: 0, y: 8, duration: 0.45, stagger: 0.08, delay: 0.15, ease: 'power3.out', clearProps: 'opacity,transform' }) : null;
    return () => {
      tw.revert();
      tw2?.revert();
    };
  }, [openKey]);

  /* The thin rule that fills while the carriers are asked. */
  const probe = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = probe.current;
    if (phase !== 'rating' || !el || !motionOK()) return;
    const tw = gsap.fromTo(el, { scaleX: 0 }, { scaleX: 0.92, duration: 4, ease: 'power2.out' });
    return () => {
      tw.kill();
    };
  }, [phase]);

  const field = (k: keyof Addr) => ({
    name: k,
    value: addr[k],
    'aria-invalid': bad.has(k) || undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setAddr((a) => ({ ...a, [k]: v }));
      setBad((b) => {
        if (!b.has(k)) return b;
        const n = new Set(b);
        n.delete(k);
        return n;
      });
    },
  });

  const payload = () => ({
    lines,
    address: {
      name: addr.name,
      street1: addr.street1,
      street2: addr.street2 || undefined,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: 'US',
    },
  });

  async function post(url: string, body: unknown) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(BAG.failed);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || BAG.failed);
    return data;
  }

  function check(): (keyof Addr)[] {
    const out: (keyof Addr)[] = [];
    (['name', 'email', 'street1', 'city', 'state', 'zip'] as const).forEach((k) => {
      if (!addr[k].trim()) out.push(k);
    });
    if (addr.email.trim() && !/^\S+@\S+\.\S+$/.test(addr.email.trim())) out.push('email');
    if (addr.zip.trim() && !/^\d{5}(-\d{4})?$/.test(addr.zip.trim())) out.push('zip');
    return out;
  }

  /* Where it goes: with goods in the bag, this asks for their rates; with
     pre-orders alone, nothing ships now and it moves straight on to pay. */
  async function submitAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const wrong = check();
    if (wrong.length) {
      setBad(new Set(wrong));
      const first = wrong[0];
      const el =
        first === 'state'
          ? e.currentTarget.querySelector<HTMLElement>('.stw .fs-btn')
          : e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`);
      el?.focus();
      return;
    }
    if (!goodsIn) {
      setAddrDone(true);
      return;
    }
    setPhase('rating');
    try {
      const data = await post('/api/shop/rates', payload());
      setRates(data.rates);
      setRateId(null);
      setAddrDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPhase('idle');
    }
  }

  async function pay() {
    if (goodsIn && !rateId) return;
    setError('');
    setPhase('paying');
    try {
      const data = await post('/api/shop/checkout', { ...payload(), email: addr.email, ...(rateId && { rateId }) });
      window.location.assign(data.url);
    } catch (err) {
      setError((err as Error).message);
      setPhase('idle');
    }
  }

  async function changeShop() {
    setError('');
    await fetch('/api/shop/account/signout', { method: 'POST' }).catch(() => null);
    setAccount((a) => (a ? { ...a, shop: null } : a));
  }

  function removeLine(slug: string, variant: string, el: HTMLElement | null) {
    const go = () => remove(slug, variant);
    if (!el || !motionOK()) return go();
    setLeaving(`${slug}/${variant}`);
    gsap.to(el, { opacity: 0, x: -12, duration: 0.3, ease: 'power2.in', onComplete: () => { setLeaving(null); go(); } });
  }

  function change(k: 'addr' | 'ship') {
    setError('');
    if (k === 'addr') {
      setRates(null);
      setAddrDone(false);
    }
    setRateId(null);
  }

  const empty = ready && !lines.length;
  const goodsLines = priced.filter((l) => !(l.product?.section === 'for-shops'));
  const preLines = priced.filter((l) => l.product?.section === 'for-shops');

  /* "The member tee ships either way." when one kind of goods shares the bag. */
  const goodsNote = (() => {
    const g = goodsLines.filter((l) => l.available);
    if (!g.length) return '';
    if (g.length > 1) return BAG.goodsShipMany;
    const name = g[0].product!.name;
    return BAG.goodsShip(`The ${inSentence(name)}`);
  })();

  const lineItem = (l: (typeof priced)[number]) => {
    const key = `${l.slug}/${l.variant}`;
    const p = l.product;
    const pre = l.order.preorder;
    const render = pre ? p?.media?.find((m) => m.kind === 'render') : undefined;
    return (
      <li key={key} data-line={key} aria-busy={leaving === key || undefined}>
        {p ? (
          <Link href={`/shop/${l.slug}`} className="thumbl" tabIndex={-1} aria-hidden="true">
            {render ? (
              <span className="plate photo">
                <Image src={render.src} alt="" fill sizes="96px" />
              </span>
            ) : (
              <ProductPlate kind={p.kind} tone={toneOf(p, l.variant)} art={p.plate} swatch={swatchOf(p, l.variant)} patchShape={shapeOf(p, l.variant)} />
            )}
          </Link>
        ) : (
          <span className="thumbl" />
        )}
        <span className="nm">
          {p ? <Link href={`/shop/${l.slug}`}>{p.name}</Link> : BAG.unavailableName}
          <span className="vr">
            {!l.available
              ? BAG.unavailable
              : pre
                ? l.option!.label
                : `${variantText(p!, l.variant, PRODUCT_COPY.oneSize)} · ${usd(l.order.unitCents)} ${BAG.each}${p!.ships ? BAG.goodsShips(p!.ships) : ''}`}
          </span>
        </span>
        <span className="lt fig">{p && l.available ? usdExact(l.order.unitCents * l.qty) : ''}</span>
        {pre && l.available && (
          <span className="dep">
            {BAG.reserve} <b>{usdExact(l.order.depositCents * l.qty)}</b>
            {BAG.depLine(usdExact(l.order.balanceCents * l.qty), l.order.ships ?? '')}
          </span>
        )}
        <span className="ctl">
          {l.available ? (
            <span className="qty sm" role="group" aria-label={`${PRODUCT_COPY.quantity}, ${p!.name}`}>
              <button
                type="button"
                onClick={() => setQty(l.slug, l.variant, l.qty - 1)}
                aria-label={PRODUCT_COPY.fewer}
                disabled={l.qty <= 1}
              >
                −
              </button>
              <output>{l.qty}</output>
              <button
                type="button"
                onClick={() => setQty(l.slug, l.variant, l.qty + 1)}
                aria-label={PRODUCT_COPY.more}
                disabled={l.qty >= MAX_PER_LINE}
              >
                +
              </button>
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="rm"
            onClick={(e) => removeLine(l.slug, l.variant, e.currentTarget.closest('li'))}
          >
            {BAG.remove}
          </button>
        </span>
      </li>
    );
  };

  return (
    <>
      <div className="vhead">
        <h1 className="vh1">{BAG.heading}</h1>
        <span className="ck">{ready && count ? items(count) : ''}</span>
      </div>
      {!open && (
        <p className="closednote bagnote">
          {CLOSED.bagNote} <Link href="/shop">{CLOSED.seeWhy}</Link>
        </p>
      )}

      {!ready ? (
        <div className="bagwait" aria-hidden="true" />
      ) : (
        <div className="bx bagbx" data-empty={empty ? '' : undefined}>
          <div className="cell lines-c">
            <div className="c-h">
              <span className="who">{BAG.inBag}</span>
              <span className="ck">{BAG.limit}</span>
            </div>
            {dropped > 0 && (
              <p className="dropped" role="status">
                {BAG.dropped}
              </p>
            )}
            {empty ? (
              <div className="c-m empty">
                <p className="line">{BAG.empty}</p>
                <More href="/shop">{BAG.emptyLink}</More>
              </div>
            ) : preLines.length ? (
              <>
                {goodsLines.length > 0 && (
                  <>
                    <div className="grp">
                      <span>{goodsLines.some((l) => l.product?.ships) ? BAG.goodsPreorder : BAG.shipsNow}</span>
                    </div>
                    <ul className="lines">{goodsLines.map(lineItem)}</ul>
                  </>
                )}
                <div className="grp">
                  <span>{BAG.preorderGroup}</span>
                  <span className="chip" data-tone="underway">
                    {BAG.depositChip}
                  </span>
                </div>
                <ul className="lines">{preLines.map(lineItem)}</ul>
                <div className="tot">
                  {goodsIn && (
                    <>
                      <div>
                        <span>{BAG.goods}</span>
                        <b className="fig">{usdExact(t.goodsCents)}</b>
                      </div>
                      <div>
                        <span>{BAG.shippingGoods}</span>
                        {rate ? <b className="fig">{ship(rate.amountCents)}</b> : <b className="wait">{BAG.shippingWait}</b>}
                      </div>
                    </>
                  )}
                  <div>
                    <span>{BAG.deposits}</span>
                    <b className="fig">{usdExact(t.depositsCents)}</b>
                  </div>
                  <div className="gt">
                    <span>{BAG.today}</span>
                    <CountTo cents={t.todayCents} />
                  </div>
                  <div className="later">
                    <span>{BAG.later}</span>
                    <b className="fig">{BAG.plusShipping(usdExact(t.laterCents))}</b>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ul className="lines">{priced.map(lineItem)}</ul>
                <div className="tot">
                  <div>
                    <span>{BAG.subtotal}</span>
                    <b className="fig">{usdExact(t.goodsCents)}</b>
                  </div>
                  <div>
                    <span>{BAG.shipping}</span>
                    {rate ? <b className="fig">{ship(rate.amountCents)}</b> : <b className="wait">{BAG.shippingWait}</b>}
                  </div>
                  <div className="gt">
                    <span>{BAG.total}</span>
                    <CountTo cents={t.todayCents} />
                  </div>
                </div>
              </>
            )}
          </div>

          {!empty && (
            <div className="cell co" ref={coRef}>
              <div className="c-h">
                <span className="who">{BAG.checkout}</span>
                <span className="ck" aria-live="polite">
                  {BAG.stepOf(Math.min(at < 0 ? flow.length : at + 1, flow.length), flow.length)}
                </span>
              </div>

              {flow.includes('shop') && (
                <div className="stp" data-k="shop" data-state={stateOf('shop')}>
                  <div className="stp-h">
                    <b>{num('shop')}</b>
                    <h2 className="t">{BAG.shopHeading}</h2>
                    <span className="sum">{shop ? BAG.shopSum(shop.name, shop.owner) : ''}</span>
                    {shop && (
                      <button type="button" className="chg" onClick={changeShop}>
                        {BAG.change}
                      </button>
                    )}
                  </div>
                  <div className="stp-b" hidden={!!shop}>
                    <div className="stp-in shopc">
                      <p className="sub">{BAG.shopNote}</p>
                      <div className="two">
                        <a className="btn" data-variant="primary" href="/api/shop/account/connect">
                          {BAG.signIn}
                        </a>
                        <a className="btn" data-variant="ghost" href="/api/shop/account/connect?setup=1">
                          {BAG.setUp}
                        </a>
                      </div>
                      <p className="sub">
                        {BAG.shopRefund}
                        {goodsNote && ` ${goodsNote}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="stp" data-k="addr" data-state={stateOf('addr')}>
                <div className="stp-h">
                  <b>{num('addr')}</b>
                  <h2 className="t">{BAG.addressHeading}</h2>
                  <span className="sum">
                    {addrDone ? `${addr.street1}, ${addr.city}, ${addr.state} ${addr.zip}` : ''}
                  </span>
                  {addrDone && (
                    <button type="button" className="chg" onClick={() => change('addr')}>
                      {BAG.change}
                    </button>
                  )}
                </div>
                <div className="stp-b" hidden={stateOf('addr') !== 'open'}>
                  <div className="stp-in">
                    <p className="sub">{BAG.addressNote}</p>
                    <form className="addr" id="addr" noValidate onSubmit={submitAddress}>
                      <label className="f h3c">
                        <span className="lb">{BAG.fields.name}</span>
                        <input {...field('name')} autoComplete="name" required />
                      </label>
                      <label className="f h3c">
                        <span className="lb">{BAG.fields.email}</span>
                        <input {...field('email')} type="email" autoComplete="email" required />
                      </label>
                      <label className="f h4c">
                        <span className="lb">{BAG.fields.street1}</span>
                        <input {...field('street1')} autoComplete="address-line1" required />
                      </label>
                      <label className="f h2c">
                        <span className="lb">{BAG.fields.street2}</span>
                        <input {...field('street2')} autoComplete="address-line2" />
                      </label>
                      <label className="f h2c">
                        <span className="lb">{BAG.fields.city}</span>
                        <input {...field('city')} autoComplete="address-level2" required />
                      </label>
                      <div className="stw h2c st8">
                        <FieldSelect
                          key={prefill}
                          name="state-name"
                          label={BAG.fields.state}
                          placeholder={BAG.fields.statePlaceholder}
                          options={STATE_NAMES}
                          bad={bad.has('state')}
                          defaultValue={STATES.find(([c]) => c === addr.state)?.[1]}
                          onChange={(name) => {
                            const code = STATES.find(([, n]) => n === name)?.[0] ?? '';
                            setAddr((a) => ({ ...a, state: code }));
                            setBad((b) => {
                              const n = new Set(b);
                              n.delete('state');
                              return n;
                            });
                          }}
                        />
                      </div>
                      <label className="f h2c zip">
                        <span className="lb">{BAG.fields.zip}</span>
                        <input {...field('zip')} inputMode="numeric" autoComplete="postal-code" required />
                      </label>
                      <div className="ratesrow">
                        <button
                          type="submit"
                          className="btn ratesbtn"
                          data-variant="primary"
                          disabled={!open || phase !== 'idle' || unavailable}
                        >
                          {!goodsIn ? BAG.nextStep : phase === 'rating' ? BAG.gettingRates : BAG.getRates}
                        </button>
                        {phase === 'rating' && (
                          <div className="probe" aria-hidden="true">
                            <i ref={probe} />
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {flow.includes('ship') && (
                <div className="stp" data-k="ship" data-state={stateOf('ship')}>
                  <div className="stp-h">
                    <b>{num('ship')}</b>
                    <h2 className="t">{BAG.ratesHeading}</h2>
                    <span className="sum">{rate ? `${rate.label} · ${ship(rate.amountCents)}` : ''}</span>
                    {rate && (
                      <button type="button" className="chg" onClick={() => change('ship')}>
                        {BAG.change}
                      </button>
                    )}
                  </div>
                  <div className="stp-b" hidden={stateOf('ship') !== 'open'}>
                    <div className="stp-in">
                      <p className="freeship">
                        {t.goodsCents >= FREE_SHIPPING_FROM_CENTS ? BAG.freeYes : BAG.freeTo(usd(FREE_SHIPPING_FROM_CENTS - t.goodsCents))}
                      </p>
                      <div className="rates" role="radiogroup" aria-label={BAG.ratesHeading}>
                        {(rates ?? []).map((r) => (
                          <label className="rate" key={r.rateId}>
                            <input
                              type="radio"
                              name="rate"
                              value={r.rateId}
                              checked={rateId === r.rateId}
                              disabled={!open}
                              onChange={() => setRateId(r.rateId)}
                            />
                            <span className="rd" aria-hidden="true" />
                            <span>
                              <b>{r.label}</b>
                              {r.estimatedDays !== null && <small>{BAG.days(r.estimatedDays)}</small>}
                            </span>
                            <span className="amt fig">{ship(r.amountCents)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="stp" data-k="pay" data-state={stateOf('pay')}>
                <div className="stp-h">
                  <b>{num('pay')}</b>
                  <h2 className="t">{BAG.payHeading}</h2>
                  <span className="sum" />
                </div>
                <div className="stp-b" hidden={stateOf('pay') !== 'open'}>
                  <div className="stp-in">
                    {preorderIn && (
                      <div className="kv3">
                        <div>
                          <span>{BAG.chargedToday}</span>
                          <span>{usdExact(t.todayCents)}</span>
                        </div>
                        <div>
                          <span>{BAG.savedLater}</span>
                          <span>{BAG.plusShipping(usdExact(t.laterCents))}</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn pay"
                      data-variant="primary"
                      onClick={pay}
                      disabled={!open || (goodsIn && !rateId) || (preorderIn && !shop) || phase !== 'idle' || unavailable}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <rect x="2.5" y="7" width="11" height="7.5" />
                        <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                      </svg>
                      <span>
                        {phase === 'paying'
                          ? BAG.paying
                          : preorderIn
                            ? BAG.payReserve(usdExact(t.todayCents))
                            : `${BAG.pay} · ${usdExact(t.todayCents)}`}
                      </span>
                    </button>
                    <p className="sub">{preorderIn ? BAG.savedCardNote : BAG.taxNote}</p>
                  </div>
                </div>
              </div>

              <p className="bagerr" role="status" aria-live="polite">
                {error}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
