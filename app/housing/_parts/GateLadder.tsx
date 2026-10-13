'use client';

import { useRef } from 'react';
import { useRail } from '@/lib/anim';
import { int } from '@/lib/format';
import { Knob } from '@/components/system';
import { GATE } from '@/content/housing';

/* 06 · The gate: five unlocks on one rule. The rule fills as you scroll
   (useRail), each knob darkens as the line reaches it (the last one green),
   and the credits above count to 15,000 with it. The server renders the
   finished rule, every gate reached, at 15,000. */

export function GateLadder() {
  const ldr = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useRail(ldr, {
    vertical: 760,
    onProgress: (p) => {
      if (num.current) num.current.textContent = int(Math.round(p * (GATE.credits / 50)) * 50);
    },
  });

  return (
    <>
      <div className="bx gate-h body-gap">
        <h3>{GATE.head}</h3>
        <div className="cap">
          <span className="fig" ref={num}>
            {int(GATE.credits)}
          </span>
          <p>{GATE.cap}</p>
        </div>
      </div>
      <div className="bx rail ldr" data-v="760" ref={ldr}>
        <span className="rail-fill" aria-hidden="true" />
        {GATE.steps.map((s, i) => (
          <div key={s.at} className={'st reached' + (i === GATE.steps.length - 1 ? ' last' : '')}>
            <Knob />
            <span className="fig at">{s.at}</span>
            <span className="nm">{s.name}</span>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
