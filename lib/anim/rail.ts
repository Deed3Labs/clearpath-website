'use client';

/* The rail: a progress rule along a bento's top edge (or down its wall on a
   phone), scrubbed by scroll. Each column carries a knob centred in it; a
   column turns `reached` when the fill passes its knob's centre.

   The server renders the end state — full rule, every column reached — so a
   reader without JavaScript, or with reduced motion, sees the finished
   drawing. With motion, the rail resets to zero on mount and fills as you
   scroll. */

import { useRef, type RefObject } from 'react';
import { ScrollTrigger, motionOK } from './gsap';
import { useIsoLayoutEffect } from './hooks';

export type RailOpts = {
  /* Below this width the rail runs down the wall instead of along the top. */
  vertical: number;
  start?: string;
  end?: string;
  scrub?: number;
  onProgress?: (p: number) => void;
};

export function useRail(ref: RefObject<HTMLElement | null>, opts: RailOpts) {
  const o = useRef(opts);
  o.current = opts;
  const { vertical, start = 'top 78%', end = 'bottom 60%', scrub = 0.4 } = opts;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !motionOK()) return;
    const fill = el.querySelector<HTMLElement>(':scope > .rail-fill');
    const steps = Array.from(el.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && !!c.querySelector('.knob'),
    );
    const mq = window.matchMedia(`(max-width: ${vertical}px)`);

    /* Where a knob sits along the rail, as a fraction of its length. Measured
       from layout boxes, so a rail whose columns are unequal still lights each
       knob exactly when the line reaches it. */
    const at = (st: HTMLElement) => {
      const k = st.querySelector<HTMLElement>('.knob')!;
      const r = el.getBoundingClientRect(), kr = k.getBoundingClientRect();
      return mq.matches
        ? (kr.top + kr.height / 2 - r.top) / r.height
        : (kr.left + kr.width / 2 - r.left) / r.width;
    };
    let marks = steps.map(at);
    const remeasure = () => {
      marks = steps.map(at);
    };

    const set = (p: number) => {
      if (fill) fill.style.transform = mq.matches ? `scaleY(${p})` : `scaleX(${p})`;
      steps.forEach((st, i) => st.classList.toggle('reached', p >= marks[i] - 0.002));
      el.style.setProperty('--rail', String(p));
      o.current.onProgress?.(p);
      el.dispatchEvent(new CustomEvent('rail:progress', { detail: { p } }));
    };

    set(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      scrub,
      onUpdate: (s) => set(s.progress),
      onRefresh: (s) => {
        remeasure();
        set(s.progress);
      },
    });
    return () => {
      st.kill();
      if (fill) fill.style.transform = '';
      steps.forEach((s) => s.classList.add('reached'));
      el.style.removeProperty('--rail');
    };
  }, [ref, vertical, start, end, scrub]);
}
