'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGsap } from '@/lib/anim';

/* The partner page's pin drops onto its town. The pin is already there in
   the markup; this only starts it higher. */
export function PinDrop({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const pin = ref.current?.querySelector('.pin');
    /* fromTo, not from: the pin's CSS opacity transition would otherwise be
       read mid-flight as the end value when the effect re-runs. */
    if (pin) gsap.fromTo(pin, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'back.out(2.4)', clearProps: 'opacity,transform' });
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
