'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGsap, useHeroIntro, useIsoLayoutEffect } from '@/lib/anim';

/* The hero intro's tail on a board page: once the h1 and the hero's parts
   are up, the controls and the board arrive, then their rows. Rendered
   inside the hero (so it hears the timeline being built); the board itself
   sits below it, so it is found by selector. Under reduced motion nothing
   runs and the board is simply there. */
export function BoardIntro({ bar, board, rows }: { bar: string; board: string; rows: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useHeroIntro(ref, (tl) => {
    const parts = document.querySelectorAll(`${bar}, ${board}`);
    if (parts.length) tl.from(parts, { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, '-=.5');
    const rs = document.querySelectorAll(rows);
    if (rs.length) tl.from(rs, { opacity: 0, y: 8, duration: 0.4, stagger: 0.03 }, '-=.4');
  });
  return <span ref={ref} hidden />;
}

/* Parts rising in, as their block comes into view (or at once, for a block
   at the top of the page). The markup is already the end state; this only
   starts them lower and transparent.

   `sel` picks the parts (default: the children). `gate` is for a block that
   is on the first screen: CSS holds its parts back (html.motion
   [data-rise]:not([data-risen])) until this has set their start state, so
   the server-rendered page does not show them, hide them, then fade them
   in. The layout's motion gate lets go after three seconds if it never runs. */
export function RiseIn({
  className,
  id,
  sel,
  y = 18,
  duration = 0.7,
  stagger = 0.08,
  gate,
  children,
}: {
  className: string;
  id?: string;
  sel?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  gate?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    ref.current?.setAttribute('data-risen', '');
  }, []);
  useGsap(ref, () => {
    const el = ref.current;
    if (!el) return;
    const parts = sel ? el.querySelectorAll(sel) : el.children;
    gsap.from(parts, {
      opacity: 0,
      y,
      duration,
      stagger,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
      ...(gate ? {} : { scrollTrigger: { trigger: el, start: 'top 80%' } }),
    });
  });
  return (
    <div ref={ref} className={className} id={id} data-rise={gate ? '' : undefined}>
      {children}
    </div>
  );
}
