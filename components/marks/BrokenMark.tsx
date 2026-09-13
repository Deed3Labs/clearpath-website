import { C_PATH } from './Logo';

/* The mark with its link broken, for the 404.
 *
 * The Clear mark is a C that opens so a link can pass through it: a node at
 * the centre, a bar, and a ring sitting in the mouth. A page that is not
 * there is a link that goes nowhere, so here the bar stops short and the ring
 * has come loose, drifted out of the mouth and tipped. A dashed line marks
 * where the bar should have reached.
 *
 * Same geometry as LogoMark (viewBox centred on the node), drawn in the
 * outline weight because this is always shown large.
 */
export function BrokenMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-180 -180 460 360"
      className={className}
      fill="none"
      stroke="currentColor"
      role="img"
      aria-label="The Clear mark with its link broken"
    >
      <path d={C_PATH} strokeWidth={4} />
      <circle cx="0" cy="0" r="34" fill="currentColor" stroke="none" />
      {/* The bar, snapped: it stops well before the mouth. */}
      <path d="M 0 -8 H 62 L 70 0 L 62 8 H 0 Z" fill="currentColor" stroke="none" />
      {/* Where it should have gone. */}
      <path className="broken-mark-gap" d="M 84 0 H 196" strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" />
      {/* The ring, loose: out past the C and tilted off its axis. */}
      <g transform="translate(226 58) rotate(24)">
        <circle cx="0" cy="0" r="25.25" strokeWidth={15.5} />
      </g>
    </svg>
  );
}
