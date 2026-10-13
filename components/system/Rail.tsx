'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useRail } from '@/lib/anim/rail';

/* A bento whose top rule is a progress line (see lib/anim/rail.ts). Each
   direct child that holds a <Knob/> is a step; give the steps their `reached`
   class in the markup — that is the end state a reader without motion sees,
   and the rail takes it away and gives it back as the line passes.

   A page that needs the progress itself (a counter that runs with the rail)
   listens for `rail:progress` on this element, or uses useRail directly. */

export function Rail({
  className,
  id,
  vertical,
  start,
  end,
  style,
  children,
}: {
  className?: string;
  id?: string;
  vertical: 640 | 760 | 860;
  start?: string;
  end?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRail(ref, { vertical, start, end });
  return (
    <div ref={ref} id={id} className={['bx', 'rail', className].filter(Boolean).join(' ')} data-v={vertical} style={style}>
      <span className="rail-fill" aria-hidden="true" />
      {children}
    </div>
  );
}
