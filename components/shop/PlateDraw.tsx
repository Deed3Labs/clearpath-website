'use client';

import { useRef, type ReactNode } from 'react';
import { usePlateDraw } from './motion';

/* A box whose drawings draw themselves in as they come into view. */
export function PlateDraw({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  usePlateDraw(ref);
  return (
    <div ref={ref} className={className} data-draw="">
      {children}
    </div>
  );
}
