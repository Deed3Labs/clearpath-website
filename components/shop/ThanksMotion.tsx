'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGsap } from '@/lib/anim';

/* The thank-you timeline: each step arrives in turn and the rule between the
   finished ones fills. The markup is the finished timeline. */
export function ThanksMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const lis = ref.current!.querySelectorAll('li');
    const bars = ref.current!.querySelectorAll<HTMLElement>('li[data-s="done"] .bar');
    gsap.from(lis, { opacity: 0, y: 6, duration: 0.5, stagger: 0.35, delay: 0.2 });
    gsap.from(bars, { scaleX: 0, duration: 0.7, stagger: 0.35, delay: 0.3, ease: 'power2.inOut' });
  });
  return <div ref={ref}>{children}</div>;
}
