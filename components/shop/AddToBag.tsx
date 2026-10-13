'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MAX_PER_LINE, PRODUCT_COPY, type Variant } from '@/content/shop';
import { Check } from '@/components/system/icons';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { usd } from '@/lib/shop/money';
import { useBag } from './BagProvider';
import { announceAdd } from './motion';
import { Sizes } from './Sizes';

/* The product page's options and buy row: sizes (or "One size"), a quantity
   stepper up to MAX_PER_LINE, and "Add to bag · $X", which follows the
   quantity. A sized product starts with nothing chosen — pre-selecting M is
   how people end up with the wrong shirt — so adding without a size nudges
   the sizes and says "Pick a size first".

   While the shop is closed the page passes `closed` (the notice and "See
   why"), which takes the buy row's place: nothing here can reach the bag. */

export function AddToBag({
  slug,
  priceCents,
  variants,
  variantLabel,
  closed,
}: {
  slug: string;
  priceCents: number;
  variants: Variant[];
  variantLabel?: string;
  closed?: ReactNode;
}) {
  const { add } = useBag();
  const oneSize = variants.length <= 1;
  const label = variantLabel ?? PRODUCT_COPY.sizeLabel;
  const [variant, setVariant] = useState<string | null>(oneSize ? variants[0]?.id ?? null : null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [nudge, setNudge] = useState(false);
  const sizes = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const allSoldOut = variants.every((v) => v.soldOut);
  const chosen = variants.find((v) => v.id === variant);

  function onAdd() {
    if (!chosen) {
      setNudge(true);
      const el = sizes.current;
      if (el && motionOK()) gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, .3)', clearProps: 'transform' });
      el?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
      return;
    }
    announceAdd({ slug, variant: chosen.id, qty, from: btn.current!.getBoundingClientRect() });
    add(slug, chosen.id, qty);
    setAdded(true);
  }

  return (
    <>
      <div className="opt">
        <div className="row">
          <span className="label">{label}</span>
          {oneSize ? (
            <span className="onesize">{PRODUCT_COPY.oneSize}</span>
          ) : (
            <span className="ck" data-bad={nudge && !chosen ? '' : undefined} aria-live="polite">
              {chosen ? chosen.label : nudge ? PRODUCT_COPY.pickFirst(label) : PRODUCT_COPY.pickOne}
            </span>
          )}
        </div>
        {!oneSize && (
          <Sizes
            ref={sizes}
            label={label}
            variants={variants}
            value={variant}
            onPick={(id) => {
              setVariant(id);
              setNudge(false);
            }}
          />
        )}
      </div>

      {closed ?? (
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
            disabled={allSoldOut || added || !!chosen?.soldOut}
            onClick={onAdd}
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
                `${PRODUCT_COPY.addToBag} · ${usd(priceCents * qty)}`
              )}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
