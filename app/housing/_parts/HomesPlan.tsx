'use client';

import { useEffect, useRef, useState } from 'react';
import { motionOK, useInView } from '@/lib/anim';
import { HOMES } from '@/content/housing';
import { SitePlan } from './SitePlan';

/* 04 · The plan answers to the three cells: point at (or tap, or focus) a
   cell and its zone lights on the drawing. With motion the plan walks the
   three zones once it comes into view, until you point at one. */

export function HomesPlan() {
  const [zone, setZone] = useState(0);
  const [walking, setWalking] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const user = useRef(false);

  useInView(root, () => setWalking(true), { start: 'top 70%' });

  useEffect(() => {
    if (!walking || !motionOK()) return;
    const id = window.setInterval(() => {
      if (user.current) return clearInterval(id);
      setZone((z) => (z + 1) % HOMES.zones.length);
    }, HOMES.walk * 1000);
    return () => clearInterval(id);
  }, [walking]);

  const pick = (z: number) => {
    user.current = true;
    setZone(z);
  };

  return (
    <div className="bx plan-x body-gap" ref={root}>
      <div className="plan-d">
        <SitePlan zone={zone} />
      </div>
      {HOMES.zones.map((c, i) => (
        <div
          key={c.n}
          className={'cell' + (zone === i ? ' on' : '')}
          tabIndex={0}
          onMouseEnter={() => pick(i)}
          onFocus={() => pick(i)}
          onClick={() => pick(i)}
        >
          <div className="c-m">
            <span className="n">{c.n}</span>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </div>
          <div className="c-f">
            <span className="fig">{c.fig}</span>
            <span className="ck">{c.k}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
