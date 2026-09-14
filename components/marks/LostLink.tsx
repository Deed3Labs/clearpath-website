import { LogoMark } from './Logo';

/* The 404 illustration.
 *
 * The brand guide forbids redrawing, stretching or rotating the mark, so the
 * mark here is the real one, drawn by LogoMark and left untouched. The idea
 * lives beside it instead: the mark is a C with a link passing through, and
 * past its right edge a dotted trail runs out to an empty dashed ring — the
 * place the link was meant to reach, with nothing there.
 *
 * Coordinates share the mark's own space (its node at the origin, the ring's
 * outer edge at x 164.5), so the trail starts a clear gap after the mark.
 */
export function LostLink({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-172 -172 612 344"
      className={className}
      fill="none"
      role="img"
      aria-label="The Clear mark, with a dotted line leading to an empty ring"
    >
      {/* The mark, at 1:1 in this space: 328 units wide, centred on the node. */}
      <g transform="translate(-164 -164)">
        <LogoMark size={328} variant="outline" />
      </g>
      <path className="lost-link-trail" d="M 200 0 H 334" strokeWidth={4} strokeDasharray="1 16" strokeLinecap="round" />
      {/* Same outer size as the mark's ring (r 33), drawn as an absence. */}
      <circle className="lost-link-end" cx="392" cy="0" r="31" strokeWidth={4} strokeDasharray="10 9" />
    </svg>
  );
}
