'use client';

import { useId, useState } from 'react';

/* Two handles, because a typical ticket is a range and not a number.
 *
 * A shop that does $350 brake jobs and $1,500 transmissions has no single
 * "typical" — asked for one they pick a middle that describes nothing. Two
 * handles let them say the thing that is actually true, and the spread is
 * more useful to us than any midpoint would have been.
 *
 * There is no dual-handle input in HTML, so this is two range inputs lying on
 * top of each other with a drawn track behind them. Only the thumbs take
 * pointer events; everything else about the track is painted by the rail.
 */

type Props = {
  nameMin: string;
  nameMax: string;
  label: string;
  min: number;
  max: number;
  step: number;
  startLow: number;
  startHigh: number;
  format: 'usd' | 'usdCompact';
  topLabel: string;
  wide?: boolean;
};

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/* $400K, $1.3M. Seven-figure numbers written out put nineteen characters
   next to their own label, which on a phone is a line break in the middle of
   an answer. */
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function FieldRangeDual({
  nameMin,
  nameMax,
  label,
  min,
  max,
  step,
  startLow,
  startHigh,
  format,
  topLabel,
  wide,
}: Props) {
  const [lo, setLo] = useState(startLow);
  const [hi, setHi] = useState(startHigh);
  const id = useId();

  /* One step of clearance so the two thumbs can never land on the same pixel
     and strand each other — the classic way a dual range gets stuck. */
  const setLow = (v: number) => setLo(Math.min(v, hi - step));
  const setHigh = (v: number) => setHi(Math.max(v, lo + step));

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const money = (v: number) => (format === 'usdCompact' ? usdCompact : usd).format(v);
  const highRead = hi >= max ? topLabel : money(hi);
  const read = `${money(lo)} – ${highRead}`;

  return (
    <div className={`join-field fr fr2${wide ? ' is-wide' : ''}`}>
      <div className="fr-head">
        <span className="fr-label" id={`${id}-label`}>
          {label}
        </span>
        {/* The pair is the answer, so the pair is what the readout shows. */}
        <output className="fr-value fig" aria-hidden="true">
          {read}
        </output>
      </div>

      <div className="fr-track">
        <span className="fr-end" aria-hidden="true">
          {money(min)}
        </span>

        <div
          className="fr2-rail"
          style={{
            ['--lo' as string]: `${pct(lo)}%`,
            ['--hi' as string]: `${pct(hi)}%`,
          }}
        >
          <span className="fr2-line" aria-hidden="true" />
          <span className="fr2-fill" aria-hidden="true" />

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={lo}
            name={nameMin}
            aria-label={`${label} — lowest`}
            aria-valuetext={money(lo)}
            onChange={(e) => setLow(Number(e.currentTarget.value))}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={hi}
            name={nameMax}
            aria-label={`${label} — highest`}
            aria-valuetext={highRead}
            onChange={(e) => setHigh(Number(e.currentTarget.value))}
          />
        </div>

        <span className="fr-end" aria-hidden="true">
          {topLabel}
        </span>
      </div>
    </div>
  );
}
