'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';

/* An app screen, authored at its real canvas size and scaled to fit, so the
   product reads like a screenshot at every width.

   Two layers, the same answer from each:
   - Script (the one that counts): the screen measures its own width and sets
     --s = width ÷ canvas width, the mockups' fit(), re-run whenever the
     screen resizes. It works in every engine.
   - CSS (the fallback before or without script): the screen is a size
     container and the canvas scales by 100cqw ÷ its own width, written as
     tan(atan2()) to turn a ratio of two lengths into a plain number. Desktop
     Chrome evaluates that, but WebKit on the phone did not, and with no scale
     the 1200px canvas drew at full size: a zoomed-in crop of the screen.
   The screen's height comes from its aspect ratio in both cases, so it never
   moves once painted.

   `variant` pairs a desktop canvas with a phone canvas: the desk one shows
   from 700px up, the phone one below. */

export function Screen({
  w,
  h,
  variant,
  className,
  canvasClassName,
  canvasStyle,
  label,
  children,
}: {
  w: number;
  h: number;
  variant?: 'desk' | 'phone';
  className?: string;
  canvasClassName?: string;
  canvasStyle?: CSSProperties;
  /* A screen is a picture of the product. Its text is real and readable, so
     it stays in the accessibility tree unless the page says otherwise. */
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      /* A hidden screen (the phone canvas on a desktop) measures 0; leave it
         until it is shown, when the observer fires again. */
      const cw = el.clientWidth;
      if (cw > 0) el.style.setProperty('--s', String(cw / w));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  return (
    <div
      ref={ref}
      className={['screen', variant && `screen-${variant}`, className].filter(Boolean).join(' ')}
      style={{ '--w': w, '--h': h } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <div className={['canvas', 'app', canvasClassName].filter(Boolean).join(' ')} style={canvasStyle}>
        {children}
      </div>
    </div>
  );
}
