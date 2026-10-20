import { useId } from 'react';
import { LogoMark } from '@/components/marks/Logo';

/* The Logo Patch's own drawing: the patch itself, large and stitched, on the
 * paper plate (light ground, the patch in the line colour, as the real Ink
 * patch is). Matches reference/redesign/patch/plates/clear-patch-*.svg.
 *
 * Front: the shape filled in the line colour; a satin border 7.5% of the
 * side wide, its stitches slanting across it in the ground colour (fanned
 * into the corners on the square, radial on the round) with an inner edge
 * line; a faint fill-stitch texture over the ground; the mark in the ground
 * colour with its stitch directions over it. Back: twill backing, the
 * border's bobbin stitches, the edge lines, the dashed line it is sewn on
 * by, and the mark showing through mirrored. A dimension line under both.
 *
 * Generated here rather than embedded, so it stays sharp and takes the
 * plate's colours. The mark is the site's own LogoMark; the stitch lines
 * over it are clipped to the same geometry (components/marks/Logo.tsx).
 *
 * Its parts carry the classes the gallery and draw-in already know: `.fx`
 * (front face), `.bx2` (back face), `.bd` (the outline that draws in) and
 * `.pr` (details that fade in after it). */

export type PatchShape = 'square' | 'circle';

const CX = 200;
const CY = 196;
const SIDE = 236;
const H = SIDE / 2; // 118: the outer edge
const IN = H - SIDE * 0.075; // 100.3: where the satin border ends
const SEW = IN - 4.5; // 95.8: the line it is sewn on by
const MARK = 0.51; // the mark's scale: 328 units across → 167 (68% of the side, and its glow room)

/* The C, as LogoMark draws it (centre at the origin, units of its viewBox). */
const C_PATH = 'M 148.28 -64 A 161.5 161.5 0 1 0 148.28 64 L 74.22 64 A 98 98 0 1 1 74.22 -64 Z';
const BAR = 'M 0 -8 H 114 V 8 H 0 Z';

const f = (n: number) => n.toFixed(2);
const rot = (x: number, y: number, a: number) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [CX + (x - CX) * c - (y - CY) * s, CY + (x - CX) * s + (y - CY) * c] as const;
};

/* The border's stitches, from its inner edge out to the edge: slanted a
   little, `step` apart; on the square they fan out of each inner corner. */
function satin(shape: PatchShape, step: number) {
  const out: string[] = [];
  const seg = (a: readonly [number, number], b: readonly [number, number]) => out.push(`M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`);
  if (shape === 'circle') {
    const n = Math.round((2 * Math.PI * IN) / step);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI;
      seg([CX + IN * Math.cos(a), CY + IN * Math.sin(a)], [CX + H * Math.cos(a + 0.02), CY + H * Math.sin(a + 0.02)]);
    }
    return out.join('');
  }
  /* The top side, then the same turned a quarter at a time. */
  for (let q = 0; q < 4; q++) {
    const r = (q * Math.PI) / 2;
    for (let x = CX - H + 1.6; x <= CX - IN + 0.01; x += step) seg(rot(CX - IN, CY - IN, r), rot(x, CY - H, r));
    for (let x = CX + IN; x <= CX + H - 1.6 + 0.01; x += step) seg(rot(CX + IN, CY - IN, r), rot(x, CY - H, r));
    for (let x = CX - IN + 0.7; x <= CX + IN - 1.6; x += step) seg(rot(x, CY - IN, r), rot(x + 1.6, CY - H, r));
  }
  return out.join('');
}

/* Stitch directions over the mark, in its own units: radial across the C
   and the small ring, an angled hatch on the dot, straight across the bar. */
function markStitches() {
  const ring: string[] = [];
  for (let i = 0; i < 256; i++) {
    const a = (i / 256) * 2 * Math.PI;
    ring.push(`M${f(98 * Math.cos(a))} ${f(98 * Math.sin(a))}L${f(162 * Math.cos(a + 0.012))} ${f(162 * Math.sin(a + 0.012))}`);
  }
  const eye: string[] = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * 2 * Math.PI;
    eye.push(`M${f(131.5 + 17.8 * Math.cos(a))} ${f(17.8 * Math.sin(a))}L${f(131.5 + 32.7 * Math.cos(a))} ${f(32.7 * Math.sin(a))}`);
  }
  const dot: string[] = [];
  for (let x = -80; x <= 40; x += 7) dot.push(`M${x} -40l40 80`);
  const bar: string[] = [];
  for (let x = 4; x <= 112; x += 6) bar.push(`M${x} -8V8`);
  return { ring: ring.join(''), eye: eye.join(''), dot: dot.join(''), bar: bar.join('') };
}

const SATIN = { square: satin('square', 2.3), circle: satin('circle', 2.3) };
const BOBBIN = { square: satin('square', 3.2), circle: satin('circle', 3.2) };
const STITCH = markStitches();

/* The shape at a half-width from the centre, as a path (so the outline can
   draw itself in, with pathLength). */
function outline(shape: PatchShape, h: number) {
  return shape === 'circle'
    ? `M${CX - h} ${CY}a${h} ${h} 0 1 0 ${2 * h} 0a${h} ${h} 0 1 0 ${-2 * h} 0Z`
    : `M${CX - h} ${CY - h}H${CX + h}V${CY + h}H${CX - h}Z`;
}

function Mark({ mirrored }: { mirrored?: boolean }) {
  const size = 328 * MARK;
  return (
    <g transform={`translate(${CX + 2 * MARK} ${CY})${mirrored ? ' scale(-1 1)' : ''} translate(${-size / 2} ${-size / 2})`}>
      <LogoMark size={size} variant="solid" />
    </g>
  );
}

const hidden = { opacity: 0 } as const;

export function PatchSvg({ shape = 'square', view, viewBox }: { shape?: PatchShape; view: 'front' | 'mark' | 'back'; viewBox: string }) {
  const id = useId();
  const back = view === 'back';
  const ids = { ground: `${id}g`, twill: `${id}t`, inner: `${id}i`, edge: `${id}e`, ring: `${id}r`, dot: `${id}d`, bar: `${id}b` };
  return (
    <svg viewBox={viewBox} aria-hidden="true" focusable="false">
      <defs>
        {/* The fill stitch: short diagonal rows, staggered. */}
        <pattern id={ids.ground} width="19.8" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 2.25H13M9.9 6.75H22.9M-9.9 6.75H3" className="pt-st" />
        </pattern>
        {/* The twill backing. */}
        <pattern id={ids.twill} width="10" height="4.24" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <path d="M0 2.12H10" className="pt-tw" />
        </pattern>
        <clipPath id={ids.inner}>
          <path d={outline(shape, IN)} />
        </clipPath>
        <clipPath id={ids.edge}>
          <path d={outline(shape, H)} />
        </clipPath>
        <clipPath id={ids.ring}>
          <path d={C_PATH} />
        </clipPath>
        <clipPath id={ids.dot}>
          <circle r="34" />
        </clipPath>
        <clipPath id={ids.bar}>
          <path d={BAR} />
        </clipPath>
      </defs>
      <g className="gar">
        {/* Front. */}
        <g className="fx" style={back ? hidden : undefined}>
          <path className="bd filled pe" d={outline(shape, H)} pathLength={1} />
          <g className="pr" data-back={back ? '' : undefined}>
            <rect className="pgr" x={CX - H} y={CY - H} width={SIDE} height={SIDE} fill={`url(#${ids.ground})`} clipPath={`url(#${ids.inner})`} />
            <path className="psa" d={SATIN[shape]} />
            <path className="pin" d={outline(shape, IN)} />
            <g className="pmk">
              <Mark />
            </g>
            <g className="pms" transform={`translate(${CX} ${CY}) scale(${MARK}) translate(2 0)`}>
              <path d={STITCH.ring} clipPath={`url(#${ids.ring})`} />
              <path d={STITCH.eye} />
              <path d={STITCH.dot} clipPath={`url(#${ids.dot})`} />
              <path d={STITCH.bar} clipPath={`url(#${ids.bar})`} />
            </g>
          </g>
        </g>
        {/* Back. */}
        <g className="bx2" style={back ? undefined : hidden}>
          <rect x={CX - H} y={CY - H} width={SIDE} height={SIDE} fill={`url(#${ids.twill})`} clipPath={`url(#${ids.edge})`} />
          <path className="pbo" d={BOBBIN[shape]} />
          <path className="pol" d={outline(shape, H)} />
          <path className="pin2" d={outline(shape, IN)} />
          <path className="psew" d={outline(shape, SEW)} />
          <g className="pmb">
            <Mark mirrored />
          </g>
        </g>
        {/* 63.5 mm, under both faces. */}
        <g className="dim">
          <path d={`M${CX - H} 330V342M${CX + H} 330V342M${CX - H} 336H${CX + H}`} />
          <rect x="166" y="328" width="68" height="16" />
          <text x={CX} y="340" textAnchor="middle">
            63.5 mm
          </text>
        </g>
      </g>
    </svg>
  );
}

/* The close-up: one corner of the border and the edge of the mark, where
   the stitches read. */
export const PATCH_CLOSE_VB = '72 68 112 112';
export const PATCH_FULL_VB = '0 0 400 400';
