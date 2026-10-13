'use client';

import { useRef } from 'react';
import { useScrub } from '@/lib/anim';
import { int } from '@/lib/format';
import { SAVINGS } from '@/content/how';

/* 04 · The gate: credits run to 15,000 as you scroll, across a three-segment
   bar of 5,000 each that turns green when it is full. The server renders it
   full and green at 15,000. */

export function GateBox() {
  const track = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useScrub(
    track,
    (p) => {
      const b = box.current, tr = track.current;
      if (!b || !tr) return;
      const v = Math.round((p * SAVINGS.gate) / 50) * 50;
      const n = b.querySelector('[data-gate]');
      if (n) n.textContent = int(v);
      tr.querySelectorAll<HTMLElement>('.gbar i').forEach((el, i) => {
        el.style.transform = `scaleX(${Math.min(1, Math.max(0, p * 3 - i))})`;
      });
      tr.classList.toggle('done', p >= 0.999);
    },
    { start: 'top 85%', end: 'top 35%', scrub: 0.5 },
  );

  return (
    <div className="gatebox" ref={box}>
      <div>
        <span className="label">{SAVINGS.gateLabel}</span>
        <div className="fig huge" data-gate="">
          {int(SAVINGS.gate)}
        </div>
        <p>{SAVINGS.gateText}</p>
      </div>
      <div className="gtrack done" ref={track} aria-hidden="true">
        <div className="gbar">
          {SAVINGS.ticks.map((t) => (
            <span key={t[0]}>
              <i />
            </span>
          ))}
        </div>
        <div className="gticks">
          {SAVINGS.ticks.map((t) => (
            <span key={t[0]}>
              <b>{t[0]}</b>
              <b>{t[1]}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
