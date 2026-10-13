'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BAG, CLOSED, MAX_PER_LINE, PRODUCT_COPY, STATES, items, type Product } from '@/content/shop';
import { FieldSelect } from '@/components/interactive/FieldSelect';
import { More } from '@/components/system';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';
import { usd, usdExact } from '@/lib/shop/money';
import { useBag } from './BagProvider';
import { variantText } from './item';
import { ProductPlate } from './ProductPlate';

/* The bag, then checkout as three steps that fold up once they are done:
   where it goes, how it ships, and pay.
 *
 * Shipping has to be quoted before payment (Stripe Checkout cannot fetch live
 * rates mid-flow), so this page does the part Checkout cannot: it takes the
 * address, asks Shippo for rates (/api/shop/rates), and lets the customer
 * choose one. Checkout (/api/shop/checkout) then collects the card and
 * charges exactly that.
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
const STEPS = ['addr', 'ship', 'pay'] as const;

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
  const { lines, ready, setQty, remove } = useBag();
  const [addr, setAddr] = useState<Addr>(EMPTY);
  const [bad, setBad] = useState<Set<keyof Addr>>(new Set());
  const [rates, setRates] = useState<Quote[] | null>(null);
  const [rateId, setRateId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState<string | null>(null);
  const coRef = useRef<HTMLDivElement>(null);

  const priced = useMemo(
    () =>
      lines.map((l) => {
        const product = products.find((p) => p.slug === l.slug);
        const option = product?.variants.find((v) => v.id === l.variant);
        return { ...l, product, option, available: !!product && !!option && !option.soldOut };
      }),
    [lines, products],
  );

  const subtotal = priced.reduce((n, l) => n + (l.available ? l.product!.priceCents * l.qty : 0), 0);
  const rate = rates?.find((r) => r.rateId === rateId) ?? null;
  const total = subtotal + (rate?.amountCents ?? 0);
  const unavailable = priced.some((l) => !l.available);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const step = rate ? 2 : rates ? 1 : 0;

  /* A quote is for this bag to this address. Change either and it is stale. */
  const bagKey = JSON.stringify(lines);
  const addrKey = `${addr.street1}|${addr.street2}|${addr.city}|${addr.state}|${addr.zip}`;
  useEffect(() => {
    setRates(null);
    setRateId(null);
  }, [bagKey, addrKey]);

  /* The step that opens fades up into place; the one that closes is folded
     to its summary line at once. Opacity and transform only. */
  const lastStep = useRef(step);
  useIsoLayoutEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    const body = coRef.current?.querySelector<HTMLElement>(`.stp[data-k="${STEPS[step]}"] .stp-b`);
    if (!body || !motionOK()) return;
    const tw = gsap.from(body, { opacity: 0, y: 10, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' });
    const rows = body.querySelectorAll('.rate');
    const tw2 = rows.length ? gsap.from(rows, { opacity: 0, y: 8, duration: 0.45, stagger: 0.08, delay: 0.15, ease: 'power3.out', clearProps: 'opacity,transform' }) : null;
    return () => {
      tw.revert();
      tw2?.revert();
    };
  }, [step]);

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

  async function getRates(e: React.FormEvent<HTMLFormElement>) {
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
    setPhase('rating');
    try {
      const data = await post('/api/shop/rates', payload());
      setRates(data.rates);
      setRateId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPhase('idle');
    }
  }

  async function pay() {
    if (!rateId) return;
    setError('');
    setPhase('paying');
    try {
      const data = await post('/api/shop/checkout', { ...payload(), email: addr.email, rateId });
      window.location.assign(data.url);
    } catch (err) {
      setError((err as Error).message);
      setPhase('idle');
    }
  }

  function removeLine(slug: string, variant: string, el: HTMLElement | null) {
    const go = () => remove(slug, variant);
    if (!el || !motionOK()) return go();
    setLeaving(`${slug}/${variant}`);
    gsap.to(el, { opacity: 0, x: -12, duration: 0.3, ease: 'power2.in', onComplete: () => { setLeaving(null); go(); } });
  }

  function change(k: 'addr' | 'ship') {
    setError('');
    if (k === 'addr') setRates(null);
    setRateId(null);
  }

  const empty = ready && !lines.length;
  const stateOf = (i: number) => (i < step ? 'done' : i === step ? 'open' : 'locked');

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
            {empty ? (
              <div className="c-m empty">
                <p className="line">{BAG.empty}</p>
                <More href="/shop">{BAG.emptyLink}</More>
              </div>
            ) : (
              <>
                <ul className="lines">
                  {priced.map((l) => {
                    const key = `${l.slug}/${l.variant}`;
                    const p = l.product;
                    return (
                      <li key={key} data-line={key} aria-busy={leaving === key || undefined}>
                        {p ? (
                          <Link href={`/shop/${l.slug}`} className="thumbl" tabIndex={-1} aria-hidden="true">
                            <ProductPlate kind={p.kind} tone={p.tone} />
                          </Link>
                        ) : (
                          <span className="thumbl" />
                        )}
                        <span className="nm">
                          {p ? <Link href={`/shop/${l.slug}`}>{p.name}</Link> : BAG.unavailableName}
                          <span className="vr">
                            {l.available
                              ? `${variantText(p!, l.variant, PRODUCT_COPY.oneSize)} · ${usd(p!.priceCents)} ${BAG.each}`
                              : BAG.unavailable}
                          </span>
                        </span>
                        <span className="lt fig">{p && l.available ? usdExact(p.priceCents * l.qty) : ''}</span>
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
                  })}
                </ul>
                <div className="tot">
                  <div>
                    <span>{BAG.subtotal}</span>
                    <b className="fig">{usdExact(subtotal)}</b>
                  </div>
                  <div>
                    <span>{BAG.shipping}</span>
                    {rate ? <b className="fig">{usdExact(rate.amountCents)}</b> : <b className="wait">{BAG.shippingWait}</b>}
                  </div>
                  <div className="gt">
                    <span>{BAG.total}</span>
                    <CountTo cents={total} />
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
                  {BAG.step(step + 1)}
                </span>
              </div>

              <div className="stp" data-k="addr" data-state={stateOf(0)}>
                <div className="stp-h">
                  <b>01</b>
                  <h2 className="t">{BAG.addressHeading}</h2>
                  <span className="sum">{step > 0 ? `${addr.name} · ${addr.city}, ${addr.state} ${addr.zip}` : ''}</span>
                  {step > 0 && (
                    <button type="button" className="chg" onClick={() => change('addr')}>
                      {BAG.change}
                    </button>
                  )}
                </div>
                <div className="stp-b" hidden={step !== 0}>
                  <div className="stp-in">
                    <p className="sub">{BAG.addressNote}</p>
                    <form className="addr" id="addr" noValidate onSubmit={getRates}>
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
                          name="state-name"
                          label={BAG.fields.state}
                          placeholder={BAG.fields.statePlaceholder}
                          options={STATE_NAMES}
                          bad={bad.has('state')}
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
                          {phase === 'rating' ? BAG.gettingRates : BAG.getRates}
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

              <div className="stp" data-k="ship" data-state={stateOf(1)}>
                <div className="stp-h">
                  <b>02</b>
                  <h2 className="t">{BAG.ratesHeading}</h2>
                  <span className="sum">{rate ? `${rate.label} · ${usdExact(rate.amountCents)}` : ''}</span>
                  {step > 1 && (
                    <button type="button" className="chg" onClick={() => change('ship')}>
                      {BAG.change}
                    </button>
                  )}
                </div>
                <div className="stp-b" hidden={step !== 1}>
                  <div className="stp-in">
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
                          <span className="amt fig">{usdExact(r.amountCents)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="stp" data-k="pay" data-state={stateOf(2)}>
                <div className="stp-h">
                  <b>03</b>
                  <h2 className="t">{BAG.payHeading}</h2>
                  <span className="sum" />
                </div>
                <div className="stp-b" hidden={step !== 2}>
                  <div className="stp-in">
                    <button
                      type="button"
                      className="btn pay"
                      data-variant="primary"
                      onClick={pay}
                      disabled={!open || !rateId || phase !== 'idle' || unavailable}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <rect x="2.5" y="7" width="11" height="7.5" />
                        <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                      </svg>
                      <span>{phase === 'paying' ? BAG.paying : `${BAG.pay} · ${usdExact(total)}`}</span>
                    </button>
                    <p className="sub">{BAG.taxNote}</p>
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
