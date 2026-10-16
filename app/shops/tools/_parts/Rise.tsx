'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap, useGsap } from '@/lib/anim';

/* Tiles and cells fading up as their block comes into view, once. The
   markup is the end state: this only starts the parts lower and clear, and
   clears what it set when it lands. Under reduced motion (or with no JS)
   nothing runs and the block is simply there. */

export function Rise({
  className,
  id,
  style,
  sel,
  children,
}: {
  className?: string;
  id?: string;
  style?: CSSProperties;
  /* The parts that rise; the block's children by default. */
  sel?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const el = ref.current;
    if (!el) return;
    const parts = sel ? el.querySelectorAll(sel) : el.children;
    if (!parts.length) return;
    gsap.from(parts, {
      opacity: 0,
      y: 18,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
  return (
    <div ref={ref} className={className} id={id} style={style}>
      {children}
    </div>
  );
}
