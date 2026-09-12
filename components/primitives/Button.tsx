import Link from 'next/link';

/* §4 — radius 999px on interactive controls, and only on interactive
   controls. Hover and focus at 200ms; no other motion. Height is 44px so the
   tap target passes §8.4 without a hit-area hack.
   Styling lives entirely in globals.css under .btn: an inline `border`
   shorthand here silently outranked the variant's border-colour rule and
   made the ghost button borderless. */

type Variant = 'primary' | 'ghost';

export function Button({
  href,
  children,
  variant = 'primary',
  className,
  live = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /* A pulsing dot for "this is open now". Kept to the Join entry points on
     purpose: a signal on every button is a signal on none. */
  live?: boolean;
}) {
  return (
    <Link href={href} data-variant={variant} className={['btn', className].filter(Boolean).join(' ')}>
      {live && <LiveDot />}
      {children}
    </Link>
  );
}

/* Decorative, so hidden from assistive tech — the button's label already says
   what it does, and "pulsing green circle" is not information. */
export function LiveDot() {
  return <span className="live-dot" aria-hidden="true" />;
}
