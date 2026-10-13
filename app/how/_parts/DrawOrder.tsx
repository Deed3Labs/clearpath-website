'use client';

import { useRef, useState } from 'react';
import { gsap, useGsap, ScrollTrigger } from '@/lib/anim';
import { money } from '@/lib/format';
import { DRAW } from '@/content/how';

/* 01 · Draw order: one composition bar, filled cheapest first. The server
   renders the line drawn to $2,800; with motion it starts at zero and draws
   to $2,800 when the bar comes into view, then it is yours to drag. Each
   tier's fill is a scaleX, so dragging never moves layout. */

const TOTAL = DRAW.tiers.reduce((a, t) => a + t.limit, 0);
/* Columns sized by each tier's limit, each with a floor that keeps its name
   on one line, so the four labels align under the bar. */
const cols = DRAW.tiers.map((t) => `minmax(${t.min}px, ${t.limit}fr)`).join(' ');

function split(v: number) {
  let left = v;
  return DRAW.tiers.map((t) => {
    const d = Math.max(0, Math.min(t.limit, left));
    left -= d;
    return d;
  });
}

export function DrawOrder() {
  const [v, setV] = useState<number>(DRAW.start);
  const root = useRef<HTMLDivElement>(null);
  const drawn = split(v);

  useGsap(root, () => {
    setV(0);
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: root.current?.querySelector('.wfbar'),
      start: 'top 80%',
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: DRAW.start,
          duration: 1.8,
          ease: 'power2.inOut',
          onUpdate: () => setV(Math.round(o.v / DRAW.step) * DRAW.step),
        }),
    });
    return () => setV(DRAW.start);
  });

  return (
    <div className="wf body-gap" ref={root}>
      <div className="wf-top">
        <span className="fig wf-amt">
          {money(v)}
          <small>{DRAW.of(money(TOTAL))}</small>
        </span>
        <span className="label">{DRAW.drag}</span>
      </div>
      <input
        className="range"
        type="range"
        min={0}
        max={TOTAL}
        step={DRAW.step}
        value={v}
        aria-label={DRAW.rangeLabel}
        onChange={(e) => setV(+e.target.value)}
      />
      <div className="wfbar" aria-hidden="true" style={{ gridTemplateColumns: cols }}>
        {DRAW.tiers.map((t, i) => (
          <div className={'tseg' + (drawn[i] > 0 && drawn[i] < t.limit ? ' now' : '')} key={t.n}>
            <i style={{ transform: `scaleX(${drawn[i] / t.limit})` }} />
          </div>
        ))}
      </div>
      <div className="wfcols" style={{ gridTemplateColumns: cols }}>
        {DRAW.tiers.map((t, i) => (
          <div key={t.n}>
            <span className="n label">{t.n}</span>
            <h3>{t.name}</h3>
            <span className="cost">{t.cost}</span>
            <span className="drawn">
              <b>{money(drawn[i], 0)}</b>
              {DRAW.drawnOf}
              {money(t.limit, 0)}
            </span>
          </div>
        ))}
      </div>
      <p className="wf-note">{DRAW.note}</p>
    </div>
  );
}
