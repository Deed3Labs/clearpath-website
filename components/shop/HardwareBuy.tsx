'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HARDWARE_COPY, MAX_PER_LINE, PRODUCT_COPY, type Variant } from '@/content/shop';
import { Check } from '@/components/system/icons';
import { usd, usdExact } from '@/lib/shop/money';
import { deposit, unitPrice } from '@/lib/shop/price';
import { useBag } from './BagProvider';
import { announceAdd } from './motion';
import { Sizes } from './Sizes';

/* A hardware product's price, options and reservation: the price ("$89
 * each", or "for ten"), the description, the variants (radios, the first
 * chosen: a variant here is a size or an option, not a fit to get wrong),
 * then what is reserved now and what is charged when it ships, the
 * quantity stepper that multiplies both, and "Reserve · $55".
 *
 * The bag only records slug, variant and quantity; what a reservation
 * charges is worked out again at checkout. While the shop is closed the
 * page passes `closed`, which takes the reserve row's place. */

export function HardwareBuy({
  slug,
  priceCents,
  variants,
  variantLabel,
  description,
  ships,
  closed,
}: {
  slug: string;
  priceCents: number;
  variants: Variant[];
  variantLabel?: string;
  description: string;
  ships: string;
  closed?: ReactNode;
}) {
  const { add } = useBag();
  const c = HARDWARE_COPY;
  const product = { priceCents, variants };
  const [variant, setVariant] = useState(variants.find((v) => !v.soldOut)?.id ?? variants[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const chosen = variants.find((v) => v.id === variant)!;
  const price = unitPrice(product, variant);
  const dep = deposit(product, variant);
  const allSoldOut = variants.every((v) => v.soldOut);
  const label = variantLabel ?? PRODUCT_COPY.sizeLabel;

  function onReserve() {
    announceAdd({ slug, variant, qty, from: btn.current!.getBoundingClientRect() });
    add(slug, variant, qty);
    setAdded(true);
  }

  return (
    <>
      <span className="pprice fig">
        {usd(price)} <span className="of">{chosen.per ?? c.each}</span>
      </span>
      <p className="pdesc">{description}</p>
      {variants.length > 1 && (
        <div className="opt">
          <div className="row">
            <span className="label">{label}</span>
            <span className="ck">{chosen.label}</span>
          </div>
          <Sizes label={label} variants={variants} value={variant} onPick={(id) => setVariant(id)} />
        </div>
      )}
      <dl className="rsv">
        <div>
          <dt>{c.reserveNow}</dt>
          <dd className="fig">{usdExact(dep * qty)}</dd>
        </div>
        <div>
          <dt>{c.whenShips}</dt>
          <dd className="fig">{usdExact((price - dep) * qty)}</dd>
        </div>
        <div>
          <dt>{c.ships}</dt>
          <dd className="est">{c.estimated(ships)}</dd>
        </div>
      </dl>
      {closed ?? (
        <>
          <div className="buyrow">
            <div className="qty" role="group" aria-label={PRODUCT_COPY.quantity}>
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={PRODUCT_COPY.fewer} disabled={qty <= 1}>
                −
              </button>
              <output aria-live="polite">{qty}</output>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(MAX_PER_LINE, q + 1))}
                aria-label={PRODUCT_COPY.more}
                disabled={qty >= MAX_PER_LINE}
              >
                +
              </button>
            </div>
            <button
              ref={btn}
              type="button"
              className="btn addb"
              data-variant="primary"
              data-add=""
              disabled={allSoldOut || added || !!chosen.soldOut}
              onClick={onReserve}
            >
              <span className="lbl2" aria-live="polite">
                {allSoldOut ? (
                  PRODUCT_COPY.soldOut
                ) : added ? (
                  <>
                    <Check />
                    {PRODUCT_COPY.added}
                  </>
                ) : (
                  c.reserve(usd(dep * qty))
                )}
              </span>
            </button>
          </div>
          <p className="forshops">{c.forShops}</p>
        </>
      )}
    </>
  );
}
