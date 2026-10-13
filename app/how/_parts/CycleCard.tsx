'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motionOK, rr, useInView, useTrace } from '@/lib/anim';
import { CYCLE } from '@/content/how';

/* 05 · The cycle card, drawn flat. Four states, one component: the label
   never changes, the number never turns into prose, and the border carries
   the state. With motion the states step on their own while you watch (a
   rule under the current one times it), and light runs round the card on
   each change, in that state's colour. Picking a state stops the stepping.
   The server renders the first state, the only one that asks anything. */

export function CycleCard() {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const picked = useRef(false);
  const trace = useTrace(card, (w, h) => rr(-0.5, -0.5, w + 1, h + 1, 14, 'left'), { seg: 160, speed: 640 });
  const s = CYCLE.states[cur];

  const go = (i: number, user: boolean) => {
    clearTimeout(timer.current);
    if (user) {
      picked.current = true;
      setAuto(false);
    }
    setCur(i);
    if (motionOK()) trace.current.run({ ease: 'power2.inOut' });
  };

  useInView(card, () => {
    if (picked.current) return;
    setAuto(true);
    go(0, false);
  }, { start: 'top 75%' });

  /* While stepping on its own, each state holds for `dwell` seconds. */
  useEffect(() => {
    if (!auto) return;
    timer.current = window.setTimeout(() => go((cur + 1) % CYCLE.states.length, false), CYCLE.dwell * 1000);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, cur]);

  return (
    <div className="cyc-grid body-gap">
      <div>
        <div className="cycx" ref={card} data-state={s.key}>
          <div className="cx-r1">
            <div>
              <span className="label">{CYCLE.cardLabel}</span>
              <span className="fig cx-amt">{s.amt}</span>
            </div>
            <div className="cx-cd">
              <span className="fig cx-days">{CYCLE.days}</span>
              <span className="label">{CYCLE.daysLabel}</span>
            </div>
          </div>
          <div className="cx-r2">
            <span className="cx-st">
              <i className="cx-dot" />
              <span>{s.line}</span>
            </span>
            {s.btn && (
              <span className={'btn cx-btn' + (s.solid ? '' : ' quiet')} data-variant="primary">
                {s.btn}
              </span>
            )}
          </div>
        </div>
        <p className="cyc-note">{CYCLE.note}</p>
      </div>
      <div className="states">
        {CYCLE.states.map((x, i) => (
          <button
            key={`${x.key}-${i === cur && auto ? cur : 'x'}`}
            type="button"
            aria-pressed={i === cur}
            className={i === cur && auto ? 'timing' : undefined}
            style={{ '--dur': `${CYCLE.dwell}s` } as CSSProperties}
            onClick={() => go(i, true)}
          >
            <span className="t">{x.t}</span>
            <span className="v">{x.v}</span>
            <span className="d">{x.d}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
