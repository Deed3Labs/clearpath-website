'use client';

import { useRef } from 'react';
import { useScrub } from '@/lib/anim';
import { HELD } from '@/content/contribute';

/* Seven months against eighty-four, as two rows of the same 84 months. The
   long row fills month by month as you scroll through the bento, and its
   counter on the right runs with it. The axis below shares the rows' grid, so
   each year sits under its twelve months.

   The server renders the finished strip (all 84 lit, "84 mo"), which is what
   a reader without motion sees; the scrub takes it back to zero on mount. */

const TOTAL = HELD.strip.long.months;
const YEARS = TOTAL / 12;

export function HeldStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const ticks = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLElement>(null);

  useScrub(
    ref,
    (p) => {
      const n = Math.round(p * TOTAL);
      ticks.current?.querySelectorAll('i').forEach((t, i) => t.classList.toggle('on', i < n));
      if (count.current) count.current.textContent = `${n} ${HELD.strip.unit}`;
    },
    /* Scrubbed across the whole bento, as the mockup does. */
    { start: 'top 75%', end: 'bottom 70%' },
  );

  const { short, long, unit, year } = HELD.strip;
  return (
    <div className="months" aria-hidden="true" ref={ref}>
      <div className="mo-row seven-m">
        <span>{short.label}</span>
        <div className="ticks">
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={i < short.months ? 'on' : undefined} />
          ))}
        </div>
        <em>{`${short.months} ${unit}`}</em>
      </div>
      <div className="mo-row seven-y">
        <span>{long.label}</span>
        <div className="ticks" ref={ticks}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className="on" />
          ))}
        </div>
        <em ref={count}>{`${long.months} ${unit}`}</em>
      </div>
      <div className="mo-row mo-ax">
        <span />
        <div className="yrs">
          {Array.from({ length: YEARS }, (_, i) => (
            <span key={i}>
              {i === 0 && <i>{year} </i>}
              {i + 1}
            </span>
          ))}
        </div>
        <em />
      </div>
    </div>
  );
}
