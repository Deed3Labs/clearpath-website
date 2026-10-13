'use client';

import { useState, type CSSProperties } from 'react';
import { money } from '@/lib/format';
import { DIFFERENCE as D } from '@/content/shops';

/* 01 · The fee calculator: drag to your month. A 6% provider against Clear's
   2.5%, and what you keep over a year — the difference, times twelve. The
   bars are the two rates against each other, so they never move. */

export function FeeCalc() {
  const [v, setV] = useState<number>(D.start);
  const theirs = v * D.theirRate;
  const ours = v * D.ourRate;
  const p = ((v - D.min) / (D.max - D.min)) * 100;

  return (
    <div className="bx feecalc body-gap">
      <div className="calc-h">
        <div className="vol">
          <span className="ck">{D.volLabel}</span>
          <span className="fig">{money(v, 0)}</span>
        </div>
        <div className="rng">
          <input
            type="range"
            min={D.min}
            max={D.max}
            step={D.step}
            value={v}
            aria-label={D.rangeLabel}
            style={{ '--p': `${p}%` } as CSSProperties}
            onChange={(e) => setV(+e.target.value)}
          />
          <div className="ends">
            {D.ends.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="cell theirs">
        <div className="c-h">
          <span className="who">{D.theirs.who}</span>
          <span className="ck">{D.theirs.when}</span>
        </div>
        <div className="c-m">
          <span className="ck">{D.theirs.take}</span>
          <span className="fig take">{money(theirs, 0)}</span>
          <span className="tbar" aria-hidden="true">
            <i style={{ width: '100%' }} />
          </span>
        </div>
      </div>
      <div className="cell ours">
        <div className="c-h">
          <span className="who">{D.ours.who}</span>
          <span className="ck">{D.ours.when}</span>
        </div>
        <div className="c-m">
          <span className="ck">{D.ours.take}</span>
          <span className="fig take">{money(ours, 0)}</span>
          <span className="tbar" aria-hidden="true">
            <i style={{ width: `${((D.ourRate / D.theirRate) * 100).toFixed(1)}%` }} />
          </span>
        </div>
      </div>
      <div className="calc-f">
        <span className="fig">{money((theirs - ours) * 12, 0)}</span>
        <p>{D.kept}</p>
      </div>
    </div>
  );
}
