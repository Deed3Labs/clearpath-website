'use client';

import { useRef, type ReactNode } from 'react';
import { rr, useTrace } from '@/lib/anim/trace';
import { useAfterHero } from '@/lib/anim/hooks';

/* A device is only its outline: one thin line at the guide's 14px radius,
   the screen pushed almost to it. In the hero, light travels round that line
   once the intro has finished, then again every few seconds. */

export function Device({
  id,
  className,
  trace,
  children,
}: {
  id?: string;
  className?: string;
  trace?: 'hero';
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTrace(ref, (w, h) => rr(0.5, 0.5, w - 1, h - 1, 14, 'left'), { seg: 160, speed: 620 });
  useAfterHero(ref, () => {
    if (trace !== 'hero') return;
    t.current.run({ repeat: -1, repeatDelay: 4.5, ease: 'power2.inOut' });
    return () => t.current.kill();
  });
  return (
    <div ref={ref} id={id} className={['device', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
