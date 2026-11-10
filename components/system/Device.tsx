'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { rr, useTrace } from '@/lib/anim/trace';
import { useAfterHero, useInView, useIsoLayoutEffect } from '@/lib/anim/hooks';

/* A device is only its outline: one thin line at the guide's 14px radius,
   the screen pushed almost to it. Light travels round that line, then again
   every few seconds:
   - `hero`: once the hero's intro has finished (the intro assembles the
     screen's parts);
   - `inview`: further down a page, when the device scrolls into view. Its
     screen's parts ([data-a]) assemble and its bars ([data-grow]) draw in
     first, then the light starts. */

export function Device({
  id,
  className,
  trace,
  children,
}: {
  id?: string;
  className?: string;
  trace?: 'hero' | 'inview';
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTrace(ref, (w, h) => rr(0.5, 0.5, w - 1, h - 1, 14, 'left'), { seg: 160, speed: 620 });
  useAfterHero(ref, () => {
    if (trace !== 'hero') return;
    t.current.run({ repeat: -1, repeatDelay: 4.5, ease: 'power2.inOut' });
    return () => t.current.kill();
  });

  /* `inview`: the parts wait at their start state, set before first paint;
     under reduced motion they are never hidden. */
  const parts = (s: string) => Array.from(ref.current?.querySelectorAll<HTMLElement>(s) ?? []);
  useIsoLayoutEffect(() => {
    if (trace !== 'inview' || !motionOK()) return;
    const a = parts('[data-a]'), g = parts('[data-grow]');
    gsap.set(a, { opacity: 0, y: 8 });
    gsap.set(g, { scaleX: 0 });
    return () => {
      gsap.set(a, { clearProps: 'opacity,transform' });
      gsap.set(g, { clearProps: 'transform' });
    };
  }, [trace]);
  useInView(
    ref,
    () => {
      if (trace !== 'inview') return;
      const tl = gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(parts('[data-a]'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.06 })
        .to(parts('[data-grow]'), { scaleX: 1, duration: 1.1, stagger: 0.05, ease: 'power2.inOut' }, '-=.2')
        .call(() => t.current.run({ repeat: -1, repeatDelay: 4.5, ease: 'power2.inOut' }), undefined, '-=.2');
      return () => {
        tl.kill();
        t.current.kill();
      };
    },
    { start: 'top 80%' },
  );

  return (
    <div ref={ref} id={id} className={['device', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
