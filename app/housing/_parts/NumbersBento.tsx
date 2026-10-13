'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGsap } from '@/lib/anim';
import { NUMBERS } from '@/content/housing';

/* 02 · The numbers: three figures, each with a bar to the same scale (the
   comparable home is the full width). The server renders the bars at their
   lengths; with motion they grow from zero, in turn, when the bento comes
   into view. */

export function NumbersBento() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    const bars = root.current?.querySelectorAll('.nbar i');
    if (!bars) return;
    gsap.set(bars, { scaleX: 0 });
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top 72%',
      once: true,
      onEnter: () => gsap.to(bars, { scaleX: 1, duration: 1.2, stagger: 0.18, ease: 'power3.inOut' }),
    });
  });

  return (
    <div className="bx nums body-gap" ref={root}>
      {NUMBERS.cells.map((c) => (
        <div className={`cell ${c.key}`} key={c.key}>
          <div className="c-h">
            <span className="who">{c.who}</span>
            <span className="ck">{c.k}</span>
          </div>
          <div className="c-m">
            <span className="fig n">{c.fig}</span>
            <span className="nbar" aria-hidden="true">
              <i style={{ width: `${c.w}%` }} />
            </span>
            <span className="ck">{c.note}</span>
          </div>
        </div>
      ))}
      <div className="nums-f">
        <span className="fig">{NUMBERS.below}</span>
        <p>{NUMBERS.belowText}</p>
      </div>
    </div>
  );
}
