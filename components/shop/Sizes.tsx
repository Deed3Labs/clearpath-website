'use client';

import { forwardRef, useRef } from 'react';
import type { Variant } from '@/content/shop';
import { PRODUCT_COPY } from '@/content/shop';

/* A size picker: a radio group of pills. Sold-out sizes are disabled (and
   struck through), and named as sold out to a screen reader.

   One stop in the tab order (the chosen size, or the first one on sale);
   arrows move between the sizes on sale. On the product page an arrow also
   chooses, as radios do. On a shelf tile choosing a size puts it in the bag,
   so there an arrow only moves, and Enter or Space chooses. */

type Props = {
  label: string;
  variants: Variant[];
  value: string | null;
  onPick: (id: string, el: HTMLButtonElement) => void;
  arrows?: 'select' | 'move';
  className?: string;
  id?: string;
};

export const Sizes = forwardRef<HTMLDivElement, Props>(function Sizes(
  { label, variants, value, onPick, arrows = 'select', className, id },
  ref,
) {
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const firstOpen = variants.findIndex((v) => !v.soldOut);
  const stop = value && variants.some((v) => v.id === value && !v.soldOut) ? variants.findIndex((v) => v.id === value) : firstOpen;

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = variants.length;
    for (let k = 1; k <= n; k++) {
      const j = (i + d * k + n) % n;
      if (variants[j].soldOut) continue;
      const b = btns.current[j];
      if (!b) return;
      b.focus();
      if (arrows === 'select') onPick(variants[j].id, b);
      return;
    }
  }

  return (
    <div ref={ref} id={id} className={['sizes', className].filter(Boolean).join(' ')} role="radiogroup" aria-label={label}>
      {variants.map((v, i) => (
        <button
          key={v.id}
          ref={(b) => {
            btns.current[i] = b;
          }}
          type="button"
          role="radio"
          aria-checked={value === v.id}
          aria-label={v.soldOut ? `${v.label}, ${PRODUCT_COPY.soldOut.toLowerCase()}` : undefined}
          disabled={v.soldOut}
          tabIndex={i === stop ? 0 : -1}
          onClick={(e) => onPick(v.id, e.currentTarget)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
});
