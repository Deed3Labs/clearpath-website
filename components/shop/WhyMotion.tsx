'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGsap } from '@/lib/anim';

/* "What it is for": when the bento is in view, the first run fills square by
   square, the three cheap shirts shrink and are struck through before the
   good one appears, and a sale's dot travels to the co-op and out as word of
   mouth (then again, on a loop). From a start state to the finished markup,
   so reduced motion and no JS see the drawings complete. */
export function WhyMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const root = ref.current!;
    const q = (s: string) => Array.from(root.querySelectorAll<SVGElement>(s));
    const runs = q('.run-f'), three = q('.three .sh'), strike = q('.strike'), one = q('.one');
    const dot = q('.goes-dot'), rings = q('.ring');
    gsap.set(runs, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(three, { svgOrigin: '81 106', scale: 1.12 });
    gsap.set(strike, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(one, { opacity: 0, y: 6 });
    gsap.set(rings, { opacity: 0 });
    const tl = gsap
      .timeline({ paused: true })
      .to(runs, { scale: 1, duration: 0.3, stagger: 0.07, ease: 'back.out(2)' }, 0)
      .to(three, { scale: 1, duration: 1.1, ease: 'power2.inOut' }, 0.2)
      .to(strike, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 1.3)
      .to(one, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.5);
    const loop = gsap
      .timeline({ paused: true, repeat: -1, repeatDelay: 0.8 })
      .set(dot, { x: 0, opacity: 1 })
      .to(dot, { x: 130, duration: 1.1, ease: 'power2.inOut' })
      .to(dot, { x: 260, duration: 1.1, ease: 'power2.inOut' }, '+=.4')
      .to(dot, { opacity: 0, duration: 0.15 })
      .fromTo(rings, { scale: 0.5, opacity: 0.7, svgOrigin: '290 62' }, { scale: 1, opacity: 0, duration: 1.2, stagger: 0.18, ease: 'power2.out' }, '<');
    ScrollTrigger.create({
      trigger: root,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        tl.play();
        loop.play();
      },
    });
  });
  return <div ref={ref}>{children}</div>;
}
