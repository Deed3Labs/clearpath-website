'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MAX_PER_LINE, PRODUCT_COPY, type Variant } from '@/content/shop';
import { LiveDot } from '@/components/primitives/Button';
import { useBag } from './BagProvider';

export function AddToBag({
  slug,
  variants,
  variantLabel,
}: {
  slug: string;
  variants: Variant[];
  variantLabel?: string;
}) {
  const { add } = useBag();
  const oneSize = variants.length === 1;
  /* A one-size product is chosen already. A sized one is not: pre-selecting
     M is how people end up with the wrong shirt. */
  const [variant, setVariant] = useState<string | null>(oneSize ? variants[0].id : null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 4000);
    return () => clearTimeout(t);
  }, [added]);

  const allSoldOut = variants.every((v) => v.soldOut);
  const chosen = variants.find((v) => v.id === variant);

  return (
    <div className="shop-add">
      {!oneSize && (
        <div className="shop-variants" role="group" aria-label={variantLabel ?? 'Option'}>
          <p className="side-label">{variantLabel ?? 'Option'}</p>
          <div className="shop-variant-row">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className="shop-variant"
                aria-pressed={variant === v.id}
                disabled={v.soldOut}
                onClick={() => setVariant(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="shop-add-row">
        <div className="shop-qty" role="group" aria-label={PRODUCT_COPY.quantity}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One fewer" disabled={qty <= 1}>
            −
          </button>
          <output aria-live="polite">{qty}</output>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(MAX_PER_LINE, q + 1))}
            aria-label="One more"
            disabled={qty >= MAX_PER_LINE}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="btn"
          data-variant="primary"
          disabled={allSoldOut || !chosen || chosen.soldOut}
          onClick={() => {
            if (!chosen) return;
            add(slug, chosen.id, qty);
            setAdded(true);
          }}
        >
          {chosen && !chosen.soldOut && <LiveDot />}
          {allSoldOut
            ? PRODUCT_COPY.soldOut
            : !chosen
              ? `Choose a ${(variantLabel ?? 'option').toLowerCase()}`
              : PRODUCT_COPY.addToBag}
        </button>
      </div>

      <p className="t-sm shop-add-status" role="status" aria-live="polite">
        {added && (
          <>
            {PRODUCT_COPY.added}. <Link href="/shop/bag" className="shop-inline-link">View bag</Link>
          </>
        )}
      </p>
    </div>
  );
}
