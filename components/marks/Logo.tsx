/* The Clear mark, traced from assets/logo.png rather than redrawn by eye.
 *
 * Geometry, measured off the 500px raster and re-expressed around an origin
 * at the centre of the mark (viewBox -164 -164 328 328):
 *
 *   C          two concentric circles, centreline radii 161.5 and 98, one
 *              closed path, uniform 4-unit stroke, cut open on the right by
 *              a horizontal chord at y = ±64 — so the mouth is ±23.35° at
 *              the outer radius and ±40.77° at the inner one.
 *   node       filled circle, r 34, dead centre of the mark.
 *   bar        y ±8, running from the centre out to x 114, which is where
 *              the ring's hole begins — it stops there rather than crossing,
 *              exactly as the original does.
 *   ring       centre x 131.5, outer radius 33, hole 17.5. It sits inside
 *              the mouth and spans the full width of the band, which is the
 *              whole idea of the mark: the C opens and a link passes through.
 *
 * Two variants, because one geometry cannot serve both ends of the scale.
 * The original is an outline drawing sized for a large glossy badge. Its
 * 4-unit stroke renders at size × 4/328, so it holds up to about 96px and
 * then falls under a device pixel — 0.78px at 64, 0.26px at 21, by which
 * point the C has disappeared and only the link is left. `solid` fills the
 * same path, so the silhouette, the mouth and the link are unchanged and the
 * mark survives a header. The crossover is where the stroke stops being a
 * whole pixel, not a round number picked by eye.
 */

export const OUTLINE_FLOOR = 96;

type Variant = 'outline' | 'solid';

/* One closed path: outer arc the long way round, chord, inner arc back. */
const C_PATH =
  'M 148.28 -64' +
  ' A 161.5 161.5 0 1 0 148.28 64' +
  ' L 74.22 64' +
  ' A 98 98 0 1 1 74.22 -64' +
  ' Z';

export function LogoMark({
  size = 24,
  variant,
  className,
}: {
  size?: number;
  variant?: Variant;
  className?: string;
}) {
  const v: Variant = variant ?? (size < OUTLINE_FLOOR ? 'solid' : 'outline');

  return (
    <svg
      viewBox="-164 -164 328 328"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* The C. Stroked in both variants so the outer edge lands in the same
          place either way; `solid` additionally fills the band. */}
      <path d={C_PATH} strokeWidth={4} fill={v === 'solid' ? 'currentColor' : 'none'} />

      {/* The link. Bar first, so the two nodes sit over its ends. */}
      <path d="M 0 -8 H 114 V 8 H 0 Z" fill="currentColor" stroke="none" />
      <circle cx="0" cy="0" r="34" fill="currentColor" stroke="none" />
      <circle cx="131.5" cy="0" r="25.25" strokeWidth={15.5} />
    </svg>
  );
}

/* Mark plus wordmark. The wordmark is the display face at its tightest —
   there is no separately drawn lettering, and inventing one is not Phase 2's
   job. Rendered as a single flex row so the mark's optical centre sits on
   the x-height rather than the cap line. */
export function Logo({ size = 21 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55em',
        fontFamily: 'var(--font-display)',
        fontSize: `${Math.round(size * 0.95)}px`,
        fontWeight: 800,
        letterSpacing: '-0.035em',
        lineHeight: 1,
      }}
    >
      <LogoMark size={size} />
      Clear
    </span>
  );
}
