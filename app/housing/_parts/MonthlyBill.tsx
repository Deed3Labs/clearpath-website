'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { gsap, useGsap } from '@/lib/anim';
import { money } from '@/lib/format';
import { MONTHLY as M } from '@/content/housing';

/* 03 · Every month: the bill's two lines kept apart, and what the first one
   becomes. Drag the contribution ($500–1,500): the five-year total, the
   year labels and "All in" ($2,000 of fee and utilities on top, so $2,500 to
   $3,500) follow it. The year bars rise once, the first time you see them. */

const H = [17, 34, 51, 68, 85];

export function MonthlyBill() {
  const [v, setV] = useState<number>(M.start);
  const yrs = useRef<HTMLDivElement>(null);
  const p = ((v - M.min) / (M.max - M.min)) * 100;

  useGsap(yrs, () => {
    gsap.from(yrs.current!.querySelectorAll('i'), {
      scaleY: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: yrs.current, start: 'top 80%', once: true },
    });
  });

  return (
    <div className="bx bill body-gap">
      <div className="cell">
        <div className="c-h">
          <span className="who">{M.bill.who}</span>
          <span className="ck">{M.bill.k}</span>
        </div>
        <div className="c-m">
          <dl className="bl">
            <div className="yours">
              <dt>
                {M.equity.k}
                <span className="yours-chip">{M.equity.yours}</span>
              </dt>
              <dd>{money(v, 0)}</dd>
              <small>{M.equity.note}</small>
            </div>
            <div>
              <dt>{M.fee.k}</dt>
              <dd>{M.fee.v}</dd>
              <small>{M.fee.note}</small>
            </div>
            <div className="var">
              <dt>{M.utilities.k}</dt>
              <dd>{M.utilities.v}</dd>
              <small>{M.utilities.note}</small>
            </div>
          </dl>
          <div />
          <div className="rng">
            <input
              type="range"
              min={M.min}
              max={M.max}
              step={M.step}
              value={v}
              aria-label={M.rangeLabel}
              style={{ '--p': `${p}%` } as CSSProperties}
              onChange={(e) => setV(+e.target.value)}
            />
            <div className="ends">
              {M.ends.map((e) => (
                <span key={e}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="cell">
        <div className="c-h">
          <span className="who">{M.becomes.who}</span>
          <span className="ck">{M.becomes.k}</span>
        </div>
        <div className="c-m">
          <div className="kept5">
            <span className="ck">{M.kept}</span>
            <span className="fig">{money(v * 12 * M.years, 0)}</span>
          </div>
          <div className="yrs" ref={yrs} aria-hidden="true">
            {H.map((h, i) => (
              <div key={h}>
                <span>{money(v * 12 * (i + 1), 0)}</span>
                <i style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="yrs-ax" aria-hidden="true">
            {M.axis.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="cmp2">
            <div>
              <span>{M.allIn}</span>
              <b>{money(M.rest + v, 0)}</b>
            </div>
            <div className="muted">
              <span>{M.compare.k}</span>
              <b>{M.compare.v}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
