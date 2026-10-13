'use client';

import { useId, useState } from 'react';
import { money } from '@/lib/format';

/* A quantity you drag rather than type.
 *
 * "Jobs a week" is an estimate, and a text box asks for a precision the
 * reader does not have — so it gets "about forty", or nothing. A range always
 * returns a number, and the reader can see the size of what they are saying
 * while they say it.
 *
 * Drawn as the join form draws it: the label and the live readout on one
 * line, then one rule with a cobalt span up to a round handle (round because
 * it is the thing you move), and the two ends of the scale under it. The top
 * of the scale is open: somebody at the ceiling is telling us "at least
 * this", so the readout says so rather than pretending the number is exact.
 */

export type RangeFormat = 'usd' | 'usdCompact' | 'count';

/* Whole dollars ($1,500), thousands and millions ($400K, $1.25M), or a plain
   count. Plain arithmetic, never Intl: Intl's compact notation is not the
   same function on both sides of hydration (Node once rendered "$400.0K"
   where the browser rendered "$400K", and React threw). At or past `max`
   the open-ended `top` label is the answer. */
export function formatRange(v: number, format: RangeFormat, top?: string, max = Infinity): string {
  if (top && v >= max) return top;
  if (format === 'count') return String(v);
  if (format === 'usdCompact') {
    if (v >= 1_000_000) {
      const s = (v / 1_000_000).toFixed(v % 1_000_000 ? 2 : 0);
      return `$${s.includes('.') ? s.replace(/\.?0+$/, '') : s}M`;
    }
    return `$${Math.round(v / 1000)}K`;
  }
  return money(v, 0);
}

type Props = {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  start: number;
  format: RangeFormat;
  topLabel: string;
};

export function FieldRange({ name, label, min, max, step, start, format, topLabel }: Props) {
  const [value, setValue] = useState(start);
  const id = useId();
  const read = formatRange(value, format, topLabel, max);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="f range wide">
      {/* The readout is aria-hidden: the input announces its own value, with
          the same "or more" at the ceiling. */}
      <span className="lb">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} aria-hidden="true">
          {read}
        </output>
      </span>
      <div className="rg">
        <span className="tr" aria-hidden="true" />
        <span className="fl" aria-hidden="true" style={{ left: '0%', width: `${pct}%` }} />
        <input
          id={id}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={read}
          onChange={(e) => setValue(Number(e.currentTarget.value))}
        />
        <span className="ax" aria-hidden="true">
          <span>{formatRange(min, format)}</span>
          <span>{topLabel}</span>
        </span>
      </div>
    </div>
  );
}
