'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BAG, MAX_PER_LINE, type Product } from '@/content/shop';
import { usd, usdExact } from '@/lib/shop/money';
import { useBag } from './BagProvider';
import { ProductPlate } from './ProductPlate';

/* The bag, the address, the rate, then Stripe.
 *
 * Shipping has to be quoted before payment (Stripe Checkout cannot fetch live
 * rates mid-flow), so this page does the part Checkout cannot: it takes the
 * address, asks Shippo for rates, and lets the customer choose one. Checkout
 * then collects the card and charges exactly that.
 *
 * Totals here are for reading. The server prices the order again from the
 * catalog and re-reads the rate from Shippo, and that is what gets charged.
 */

type Quote = { rateId: string; label: string; amountCents: number; estimatedDays: number | null };

type Phase = 'idle' | 'rating' | 'paying';

const EMPTY = { name: '', email: '', street1: '', street2: '', city: '', state: '', zip: '' };

export function BagView({ products }: { products: Product[] }) {
  const { lines, ready, setQty, remove } = useBag();
  const [addr, setAddr] = useState(EMPTY);
  const [rates, setRates] = useState<Quote[] | null>(null);
  const [rateId, setRateId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');

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
  const unavailable = priced.some((l) => !l.available);

  /* A quote is for this bag to this address. Change either and it is stale. */
  const bagKey = JSON.stringify(lines);
  const addrKey = `${addr.street1}|${addr.street2}|${addr.city}|${addr.state}|${addr.zip}`;
  useEffect(() => {
    setRates(null);
    setRateId(null);
  }, [bagKey, addrKey]);

  const field = (k: keyof typeof EMPTY) => ({
    id: `bag-${k}`,
    name: k,
    value: addr[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddr((a) => ({ ...a, [k]: e.target.value })),
  });

  const payload = () => ({
    lines,
    address: {
      name: addr.name,
      street1: addr.street1,
      street2: addr.street2 || undefined,
      city: addr.city,
      state: addr.state.toUpperCase(),
      zip: addr.zip,
      country: 'US',
    },
  });

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Nothing was charged.');
    return data;
  }

  async function getRates(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setPhase('rating');
    try {
      const data = await post('/api/shop/rates', payload());
      setRates(data.rates);
      setRateId(data.rates[0]?.rateId ?? null);
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

  if (!ready) return <div className="shop-bag-fallback" aria-hidden="true" />;

  if (!lines.length) {
    return (
      <div className="c-full shop-bag-empty">
        <p className="d3">{BAG.empty}</p>
        <Link href="/shop" className="btn" data-variant="ghost">
          {BAG.emptyLink}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="c-half">
        <ul className="shop-lines">
          {priced.map((l) => (
            <li className="shop-line" key={`${l.slug}/${l.variant}`}>
              {l.product ? (
                <Link href={`/shop/${l.slug}`} className="shop-line-thumb" tabIndex={-1} aria-hidden="true">
                  <ProductPlate kind={l.product.kind} tone={l.product.tone} />
                </Link>
              ) : (
                <span className="shop-line-thumb" />
              )}
              <div className="shop-line-main">
                <p className="shop-line-name">
                  {l.product ? <Link href={`/shop/${l.slug}`}>{l.product.name}</Link> : 'Unavailable item'}
                </p>
                <p className="t-sm shop-line-meta">
                  {l.available
                    ? [
                        l.product!.variants.length > 1 && `${l.product!.variantLabel ?? 'Option'} ${l.option!.label}`,
                        `${usd(l.product!.priceCents)} each`,
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    : 'No longer available. Remove it to check out.'}
                </p>
                <div className="shop-line-actions">
                  {l.available && (
                    <div className="shop-qty" role="group" aria-label={`Quantity of ${l.product!.name}`}>
                      <button type="button" onClick={() => setQty(l.slug, l.variant, l.qty - 1)} aria-label="One fewer">
                        −
                      </button>
                      <output>{l.qty}</output>
                      <button
                        type="button"
                        onClick={() => setQty(l.slug, l.variant, l.qty + 1)}
                        aria-label="One more"
                        disabled={l.qty >= MAX_PER_LINE}
                      >
                        +
                      </button>
                    </div>
                  )}
                  <button type="button" className="shop-inline-link" onClick={() => remove(l.slug, l.variant)}>
                    {BAG.remove}
                  </button>
                </div>
              </div>
              <p className="fig shop-line-price">{l.product && l.available ? usdExact(l.product.priceCents * l.qty) : ''}</p>
            </li>
          ))}
        </ul>

        <dl className="shop-totals">
          <div>
            <dt>{BAG.subtotal}</dt>
            <dd className="fig">{usdExact(subtotal)}</dd>
          </div>
          <div>
            <dt>{BAG.shipping}</dt>
            <dd className="fig">{rate ? usdExact(rate.amountCents) : '—'}</dd>
          </div>
          <div className="shop-totals-total">
            <dt>{BAG.total}</dt>
            <dd className="fig">{usdExact(subtotal + (rate?.amountCents ?? 0))}</dd>
          </div>
        </dl>
      </div>

      <div className="c-half">
        <form className="join-form shop-address" onSubmit={getRates}>
          <fieldset>
            <legend className="shop-legend">
              <span className="d3">{BAG.addressHeading}</span>
              <span className="t-sm">{BAG.addressNote}</span>
            </legend>
            <div className="join-field">
              <label htmlFor="bag-name">Full name</label>
              <input {...field('name')} autoComplete="name" required />
            </div>
            <div className="join-field">
              <label htmlFor="bag-email">Email</label>
              <input {...field('email')} type="email" autoComplete="email" required />
            </div>
            <div className="join-field is-wide">
              <label htmlFor="bag-street1">Street address</label>
              <input {...field('street1')} autoComplete="address-line1" required />
            </div>
            <div className="join-field is-wide">
              <label htmlFor="bag-street2">Apartment, suite (optional)</label>
              <input {...field('street2')} autoComplete="address-line2" />
            </div>
            <div className="join-field is-wide">
              <label htmlFor="bag-city">City</label>
              <input {...field('city')} autoComplete="address-level2" required />
            </div>
            <div className="join-field">
              <label htmlFor="bag-state">State</label>
              <input
                {...field('state')}
                autoComplete="address-level1"
                maxLength={2}
                pattern="[A-Za-z]{2}"
                title="Two-letter state, like CA"
                placeholder="CA"
                required
              />
            </div>
            <div className="join-field">
              <label htmlFor="bag-zip">ZIP</label>
              <input
                {...field('zip')}
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="\d{5}(-\d{4})?"
                title="Five-digit ZIP"
                required
              />
            </div>

            {!rates && (
              <div className="join-submit is-wide">
                <button type="submit" className="btn" data-variant="ghost" disabled={phase !== 'idle' || unavailable}>
                  {phase === 'rating' ? BAG.gettingRates : BAG.getRates}
                </button>
              </div>
            )}
          </fieldset>
        </form>

        {rates && (
          <div className="shop-rates" role="radiogroup" aria-label={BAG.ratesHeading}>
            <p className="side-label">{BAG.ratesHeading}</p>
            {rates.map((r) => (
              <label className="shop-rate" key={r.rateId}>
                <input
                  type="radio"
                  name="rate"
                  value={r.rateId}
                  checked={rateId === r.rateId}
                  onChange={() => setRateId(r.rateId)}
                />
                <span className="shop-rate-label">
                  {r.label}
                  {r.estimatedDays !== null && (
                    <span className="t-sm shop-rate-days">
                      {r.estimatedDays === 1 ? '1 business day' : `${r.estimatedDays} business days`}
                    </span>
                  )}
                </span>
                <span className="fig">{usdExact(r.amountCents)}</span>
              </label>
            ))}
            <div className="join-submit">
              <button type="button" className="btn" data-variant="primary" onClick={pay} disabled={!rateId || phase !== 'idle'}>
                {phase === 'paying' ? BAG.paying : `${BAG.pay} · ${usdExact(subtotal + (rate?.amountCents ?? 0))}`}
              </button>
            </div>
            <p className="t-sm shop-pay-note">{BAG.taxNote}</p>
          </div>
        )}

        <p className="t-sm join-status shop-error" role="status" aria-live="polite">
          {error}
        </p>
      </div>
    </>
  );
}
