import type { CSSProperties, ReactNode } from 'react';

/* An app screen, authored at its real canvas size and scaled to fit, so the
   product reads like a screenshot at every width.

   The scaling is CSS, not script: the screen is a size container, and the
   canvas scales by 100cqw ÷ its own width (tan(atan2()) turns that ratio of
   two lengths into the plain number scale() needs). The screen's height is
   fixed by its aspect ratio. So the drawing is right before any JavaScript
   runs, right with none at all, and never moves once painted.

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
  return (
    <div
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
