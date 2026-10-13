'use client';

import { useRef, type ReactNode } from 'react';
import { useGsap, gsap, ScrollTrigger } from '@/lib/anim';

/* Scroll-triggered motion for server-rendered figures on this page. Each
   wrapper animates FROM a start state TO the markup it was given, so with
   reduced motion (where useGsap does nothing) or without JS the figures
   simply stand finished. Every tween and trigger lives in the gsap context
   and is reverted on unmount. */

const all = <T extends Element = HTMLElement>(root: Element, sel: string) => Array.from(root.querySelectorAll<T>(sel));

/* 01: the three drawings draw themselves on one ground line; then the edges
   of the two balance sheets — one connects, two stop short. */
export function SplitMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const root = ref.current!;
    const split = root.querySelector('.split3')!;
    const draws = all<SVGGeometryElement>(split, '.draw');
    draws.forEach((p) => {
      const L = Math.ceil(p.getTotalLength());
      p.style.setProperty('--L', String(L));
      gsap.set(p, { strokeDashoffset: L });
    });
    const ht = all(split, '.ht'), blk = all(split, '.blk'), pin = all(split, '.pin');
    gsap.set(ht, { opacity: 0 });
    gsap.set(blk, { opacity: 0, y: 6 });
    gsap.set(pin, { scale: 0, transformOrigin: 'center' });
    ScrollTrigger.create({
      trigger: split,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        gsap.to(draws, { strokeDashoffset: 0, duration: 1.3, stagger: 0.05, ease: 'power2.inOut' });
        gsap.to(ht, { opacity: 1, duration: 0.5, stagger: 0.01, delay: 0.6 });
        gsap.to(blk, { opacity: 1, y: 0, duration: 0.35, stagger: 0.025, delay: 0.7 });
        gsap.to(pin, { scale: 1, duration: 0.4, stagger: 0.1, delay: 1.1, ease: 'back.out(2)' });
      },
    });

    const backs = root.querySelector('.backs')!;
    gsap.set(all(backs, '.wire i'), { scaleX: 0 });
    gsap.set(all(backs, '.vd, .wire'), { opacity: 0 });
    ScrollTrigger.create({
      trigger: backs,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        all(backs, '.row').forEach((r, i) => {
          gsap
            .timeline({ delay: i * 0.35 })
            .to(r.querySelector('.wire'), { opacity: 1, duration: 0.01 })
            .to(r.querySelector('.wire i'), { scaleX: 1, duration: 0.7, ease: 'power2.inOut' })
            .to(r.querySelector('.vd'), { opacity: 1, duration: 0.4 }, '-=.1');
        });
      },
    });
  });
  return <div ref={ref}>{children}</div>;
}

/* 03: the pro rata bar fills, the reserved matters check in one by one. */
export function ProtMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const root = ref.current!;
    const bars = all(root, '.wf-bar i');
    const items = all(root, '.rm-lit li');
    gsap.set(bars, { scaleY: 0 });
    items.forEach((x) => x.classList.remove('on'));
    const timers: ReturnType<typeof setTimeout>[] = [];
    ScrollTrigger.create({
      trigger: root,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        gsap.to(bars, { scaleY: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' });
        items.forEach((x, i) => timers.push(setTimeout(() => x.classList.add('on'), 400 + i * 260)));
      },
    });
    return () => {
      timers.forEach(clearTimeout);
      items.forEach((x) => x.classList.add('on'));
    };
  });
  return <div ref={ref}>{children}</div>;
}

/* 05: the redactions sweep in over the three things we do not publish. */
export function RedactMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const rd = all(ref.current!, '.rd');
    gsap.set(rd, { '--rd': 0 });
    ScrollTrigger.create({
      trigger: ref.current!,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(rd, { '--rd': 1, duration: 0.6, stagger: 0.18, ease: 'power3.inOut' });
      },
    });
  });
  return <div ref={ref}>{children}</div>;
}
