'use client';

import { useRef, useState } from 'react';
import { gsap, motionOK, useIsoLayoutEffect } from '@/lib/anim';
import { SPLIT } from '@/content/how';

/* /how 03 · the split chooser: a segmented control against a short ledger,
   with the total set large beside it.

   The figures are declining-balance and are never recomputed here from a
   flat rate — flat carry would cost the same whether the plan is cleared in
   month one or month four, which contradicts the one line that separates
   this from buy-now-pay-later. A change swaps the figures (a 150ms fade)
   rather than counting through them, because a tween would pass through
   figures no split produces. The bar is the balance cut into N equal
   segments: a count, decoration for the ledger, hence aria-hidden. */

export function SplitChooser() {
  const [pressed, setPressed] = useState<number>(SPLIT.initial);
  const [shown, setShown] = useState<number>(SPLIT.initial);
  const [swap, setSwap] = useState(false);
  const segs = useRef<HTMLDivElement>(null);
  const grow = useRef(false);
  const t = SPLIT.options[shown];

  const choose = (i: number) => {
    setPressed(i);
    if (!motionOK()) return setShown(i);
    setSwap(true);
    window.setTimeout(() => {
      grow.current = true;
      setShown(i);
      setSwap(false);
    }, 150);
  };

  useIsoLayoutEffect(() => {
    if (!grow.current || !segs.current) return;
    grow.current = false;
    const tw = gsap.from(segs.current.children, { scaleX: 0, duration: 0.45, stagger: 0.03, ease: 'power3.out' });
    return () => {
      tw.kill();
    };
  }, [shown]);

  return (
    <div className="split body-gap">
      <div className="chs">
        <div className="balance">
          <span>{SPLIT.balance.label}</span>
          <span className="fig">{SPLIT.balance.figure}</span>
        </div>
        <div className="opts" role="group" aria-label={SPLIT.group}>
          {SPLIT.options.map((o, i) => (
            <button key={o.label} type="button" aria-pressed={pressed === i} onClick={() => choose(i)}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="segs2" ref={segs} aria-hidden="true">
          {Array.from({ length: t.n }, (_, k) => (
            <span key={`${shown}-${k}`} />
          ))}
        </div>
        <dl className={'ledger2' + (swap ? ' swap' : '')} aria-live="polite">
          <div>
            <dt>{t.n === 1 ? SPLIT.rows.once : SPLIT.rows.each}</dt>
            <dd>{t.each}</dd>
          </div>
          <div>
            <dt>{SPLIT.rows.now}</dt>
            <dd>{t.now}</dd>
          </div>
          <div>
            <dt>{SPLIT.rows.plan}</dt>
            <dd>{t.plan}</dd>
          </div>
          <div>
            <dt>{SPLIT.rows.done}</dt>
            <dd>{t.done}</dd>
          </div>
        </dl>
        <span className="wf-note">{SPLIT.rate}</span>
      </div>
      <div className="split-side">
        <span className="label">{SPLIT.totalLabel}</span>
        <span className={'fig big' + (swap ? ' swap' : '')}>{t.total}</span>
        <p>{SPLIT.close}</p>
      </div>
    </div>
  );
}
