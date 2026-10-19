'use client';

import { useRef, type CSSProperties } from 'react';
import { PRODUCT_COPY, type Colour } from '@/content/shop';

/* A colour picker: swatch pills with the colour's name, as a radio group
   that behaves exactly like Sizes. One stop in the tab order, arrows move
   and choose, and a colour with every size sold out is disabled and named
   as sold out. The swatch is the product's own data, passed in as --sw:
   the one colour on the site that is not a token. */

export function Colours({
  label,
  colours,
  value,
  soldOut,
  onPick,
}: {
  label: string;
  colours: readonly Colour[];
  value: string;
  soldOut: (id: string) => boolean;
  onPick: (id: string) => void;
}) {
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const firstOpen = colours.findIndex((c) => !soldOut(c.id));
  const stop = colours.some((c) => c.id === value && !soldOut(c.id)) ? colours.findIndex((c) => c.id === value) : firstOpen;

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = colours.length;
    for (let k = 1; k <= n; k++) {
      const j = (i + d * k + n) % n;
      if (soldOut(colours[j].id)) continue;
      btns.current[j]?.focus();
      onPick(colours[j].id);
      return;
    }
  }

  return (
    <div className="sizes colours" role="radiogroup" aria-label={label}>
      {colours.map((c, i) => {
        const out = soldOut(c.id);
        return (
          <button
            key={c.id}
            ref={(b) => {
              btns.current[i] = b;
            }}
            type="button"
            role="radio"
            aria-checked={value === c.id}
            aria-label={out ? `${c.label}, ${PRODUCT_COPY.soldOut.toLowerCase()}` : undefined}
            disabled={out}
            tabIndex={i === stop ? 0 : -1}
            onClick={() => onPick(c.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            style={{ '--sw': c.swatch } as CSSProperties}
          >
            <i aria-hidden="true" />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
