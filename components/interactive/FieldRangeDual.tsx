'use client';

import { useId, useState } from 'react';
import { formatRange, type RangeFormat } from './FieldRange';

/* Two handles, because a typical ticket — or what a property is worth — is a
 * range and not a number.
 *
 * A shop that does $350 brake jobs and $1,500 transmissions has no single
 * "typical"; asked for one they pick a middle that describes nothing. Two
 * handles let them say the thing that is actually true.
 *
 * There is no dual-handle input in HTML, so this is two range inputs lying on
 * top of each other over one drawn rule, with the cobalt span between the
 * handles. Only the thumbs take pointer events. The handles keep one step
 * apart, so they can never land on the same pixel and strand each other.
 */

type Props = {
  nameMin: string;
  nameMax: string;
  label: string;
  /* Appended to the label for each handle's spoken name: "Typical ticket,
     low". From the page's content file. */
  lowWord: string;
  highWord: string;
  min: number;
  max: number;
  step: number;
  startLow: number;
  startHigh: number;
  format: RangeFormat;
  topLabel: string;
};

export function FieldRangeDual({
  nameMin,
  nameMax,
  label,
  lowWord,
  highWord,
  min,
  max,
  step,
  startLow,
  startHigh,
  format,
  topLabel,
}: Props) {
  const [lo, setLo] = useState(startLow);
  const [hi, setHi] = useState(startHigh);
  const id = useId();

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const loRead = formatRange(lo, format);
  const hiRead = formatRange(hi, format, topLabel, max);

  return (
    <div className="f range wide">
      <span className="lb" id={`${id}-l`}>
        {label}
        {/* The pair is the answer, so the pair is what the readout shows. */}
        <output aria-hidden="true">{`${loRead} – ${hiRead}`}</output>
      </span>
      <div className="rg">
        <span className="tr" aria-hidden="true" />
        <span className="fl" aria-hidden="true" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
        <input
          type="range"
          name={nameMin}
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={`${label}, ${lowWord}`}
          aria-valuetext={loRead}
          onChange={(e) => setLo(Math.min(Number(e.currentTarget.value), hi - step))}
        />
        <input
          type="range"
          name={nameMax}
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={`${label}, ${highWord}`}
          aria-valuetext={hiRead}
          onChange={(e) => setHi(Math.max(Number(e.currentTarget.value), lo + step))}
        />
        <span className="ax" aria-hidden="true">
          <span>{formatRange(min, format)}</span>
          <span>{topLabel}</span>
        </span>
      </div>
    </div>
  );
}
