'use client';

import { useEffect, useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react';
import { gsap, ScrollTrigger, motionOK } from './gsap';

/* Layout effect on the client, plain effect on the server (where neither
   runs, but React warns about the layout one). A layout effect matters here:
   a `from` tween sets its start state before the browser paints, so an
   element never flashes at its end state and then jumps back. */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* gsap.context scoped to an element: every tween and ScrollTrigger created in
   `setup` is reverted on unmount or when deps change, so nothing leaks from
   one route into the next. Does nothing under reduced motion — the markup is
   already the end state. `setup` may return a cleanup of its own (timers,
   observers). */
export function useGsap(
  scope: RefObject<HTMLElement | SVGElement | null>,
  setup: (ctx: gsap.Context) => void | (() => void),
  deps: DependencyList = [],
) {
  const fn = useRef(setup);
  fn.current = setup;
  useIsoLayoutEffect(() => {
    if (!scope.current || !motionOK()) return;
    let extra: void | (() => void);
    const ctx = gsap.context((self) => {
      extra = fn.current(self);
    }, scope.current);
    return () => {
      if (typeof extra === 'function') extra();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

type Range = { start?: string; end?: string };

/* Run once when the element enters (ScrollTrigger's start grammar). */
export function useInView(
  ref: RefObject<HTMLElement | null>,
  onEnter: () => void | (() => void),
  { start = 'top 70%', once = true }: { start?: string; once?: boolean } = {},
) {
  const fn = useRef(onEnter);
  fn.current = onEnter;
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOK()) return;
    let extra: void | (() => void);
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      once,
      onEnter: () => {
        extra = fn.current();
      },
    });
    return () => {
      st.kill();
      if (typeof extra === 'function') extra();
    };
  }, [ref, start, once]);
}

/* True while the element is between start and end. For things that should
   only run while you can see them: streams, loops, clocks. */
export function useActive(
  ref: RefObject<HTMLElement | null>,
  onToggle: (active: boolean) => void,
  { start = 'top 85%', end = 'bottom 15%' }: Range = {},
) {
  const fn = useRef(onToggle);
  fn.current = onToggle;
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOK()) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onToggle: (s) => fn.current(s.isActive),
    });
    return () => {
      st.kill();
      fn.current(false);
    };
  }, [ref, start, end]);
}

/* Scrub: progress 0→1 between start and end. The caller sets its own start
   state (usually progress 0) inside onUpdate's first call; under reduced
   motion this never runs and the markup's end state stands. */
export function useScrub(
  ref: RefObject<HTMLElement | null>,
  onUpdate: (p: number) => void,
  { start = 'top 75%', end = 'bottom 75%', scrub = 0.4 }: Range & { scrub?: number | boolean } = {},
) {
  const fn = useRef(onUpdate);
  fn.current = onUpdate;
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !motionOK()) return;
    fn.current(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      scrub,
      onUpdate: (s) => fn.current(s.progress),
    });
    return () => {
      st.kill();
      fn.current(1);
    };
  }, [ref, start, end, scrub]);
}

/* Fires `cb` when the hero above has finished its intro (or immediately when
   there is no intro to wait for: reduced motion, or it already ran). */
export function useAfterHero(ref: RefObject<HTMLElement | null>, cb: () => void | (() => void)) {
  const fn = useRef(cb);
  fn.current = cb;
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOK()) return;
    const hero = el.closest('.hero') ?? document.querySelector('.hero');
    let extra: void | (() => void);
    const go = () => {
      extra = fn.current();
    };
    if (!hero || hero.getAttribute('data-intro') === 'done') go();
    else hero.addEventListener('hero:done', go, { once: true });
    return () => {
      hero?.removeEventListener('hero:done', go);
      if (typeof extra === 'function') extra();
    };
  }, [ref]);
}

/* Append page-specific beats to the hero's intro timeline. Must be called
   from a component rendered INSIDE the hero: child layout effects run before
   the hero's own, so the listener is in place when the timeline is built. */
export function useHeroIntro(
  ref: RefObject<HTMLElement | null>,
  extend: (tl: gsap.core.Timeline, hero: HTMLElement) => void,
) {
  const fn = useRef(extend);
  fn.current = extend;
  useIsoLayoutEffect(() => {
    const hero = ref.current?.closest<HTMLElement>('.hero');
    if (!hero || !motionOK()) return;
    const on = (e: Event) => fn.current((e as CustomEvent<{ tl: gsap.core.Timeline }>).detail.tl, hero);
    hero.addEventListener('hero:intro', on);
    return () => hero.removeEventListener('hero:intro', on);
  }, [ref]);
}
