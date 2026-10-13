'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';

/* The hero's intro, in the order every mockup runs it: the h1's words rise
   out of their masks, the lede and facts follow, then the stage (a device or
   a bento) arrives and its parts assemble.

   Page-specific beats hook in without this file knowing about them:
   - `hero:intro` fires on the section with { tl } before the timeline plays,
     so a component inside the hero can append to it;
   - `hero:done` fires when it ends (data-intro="done" for late listeners).

   First paint: a tiny inline script in the layout puts `motion` on <html>
   when motion is allowed, and CSS holds the hero's parts at their start state
   until this effect marks the section `data-intro`. The marking and the
   tweens' start values land in the same task, so nothing paints in between.
   If this never runs, the script takes `motion` off again after three
   seconds and the hero shows as it was rendered. */

export function HeroScope({
  className,
  style,
  stagger = 0.06,
  children,
}: {
  className: string;
  style?: CSSProperties;
  stagger?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!motionOK()) {
      el.setAttribute('data-intro', 'done');
      return;
    }
    el.setAttribute('data-intro', 'run');
    const h1 = el.querySelector('.hero-h1');
    const q = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(q('.hero-h1 .w > span'), {
        yPercent: 105,
        duration: 1,
        stagger,
        onComplete: () => h1?.classList.add('revealed'),
      });
      const into = q('[data-in]');
      if (into.length) tl.from(into, { opacity: 0, y: 14, duration: 0.8, stagger: 0.1 }, '-=.6');

      const stage = el.querySelector<HTMLElement>('[data-stage]');
      if (stage) {
        const device = stage.getAttribute('data-stage') === 'device';
        tl.from(stage, device ? { opacity: 0, y: 24, duration: 1 } : { opacity: 0, y: 20, duration: 0.9 }, device ? '-=.55' : '-=.5');
      }
      const parts = q('[data-a]');
      if (parts.length) tl.from(parts, { opacity: 0, y: 8, duration: 0.6, stagger: 0.06 }, '-=.6');
      const grow = q('[data-grow]');
      if (grow.length) tl.from(grow, { scaleX: 0, duration: 1.1, stagger: 0.05, ease: 'power2.inOut' }, '-=.2');

      el.dispatchEvent(new CustomEvent('hero:intro', { detail: { tl } }));
      tl.call(() => {
        el.setAttribute('data-intro', 'done');
        el.dispatchEvent(new CustomEvent('hero:done'));
      });
    }, el);

    return () => {
      ctx.revert();
      h1?.classList.remove('revealed');
      el.setAttribute('data-intro', 'done');
    };
  }, [stagger]);

  return (
    <section ref={ref} className={className} style={style}>
      {children}
    </section>
  );
}
