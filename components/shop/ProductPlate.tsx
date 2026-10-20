import Link from 'next/link';
import { createElement, useId, type CSSProperties, type ReactNode } from 'react';
import { LogoMark } from '@/components/marks/Logo';
import { isGoodsKind, type GoodsKind, type PlateArt, type PlateTone, type Product, type ProductKind } from '@/content/shop';
import { PATCH_ONLY, TRACED } from './goodsShapes';
import { PATCH_CLOSE_VB, PatchSvg, type PatchShape } from './PatchPlate';
import { printSrc } from './plateArt';
import { HW_SHAPES, NAMED, type DrawingName, type HwNode, type HwShape } from './hardwareShapes';
import './hardware.css';

/* The product, drawn, until there is a photograph.
 *
 * A line drawing on a flat ground rather than a mock-up render: the site
 * draws rules and diagrams, never renders, and a fake photo of a shirt that
 * does not exist yet would be the one dishonest image on it. Each silhouette
 * carries the mark where the real one will sit. Swap in `images` on the
 * product and the product page shows those instead.
 *
 * Three views, all in the one drawing so the gallery can turn between them:
 * the front (`fx` lines and the patch), the back (`bx2` lines and the back
 * outline, no patch), and the patch close up, which is the front with the
 * viewBox zoomed in to it. Every path is pathLength 1, so the draw-in can run
 * its dash from 1 to 0 whatever the shape's real length. The drawing is
 * decoration: the product's name always sits beside it in words.
 *
 * The four garments are traced from the owner's flat sketches
 * (goodsShapes.ts, generated: never redraw or simplify them). The patch is
 * drawn at true scale, so on the garment it is small; the close-up is what
 * makes it legible.
 *
 * Hardware is drawn from HW_SHAPES (generated from the spec's drawings): one
 * view, with its screen. Those plates carry .hwplate, whose rules live in
 * hardware.css beside this file rather than in the shop's page CSS, so a
 * hardware plate is drawn right on any route. Named drawings (the Point's
 * screens, the counter with the till) render the same way, by `drawing`. */

/* `patch` is [cx, cy, side]: the centre and side of the square patch.
   `backBody` is the outline from behind, where the neckline sits higher;
   without one the back uses `body`. `traced` shapes carry many fine
   interior lines, drawn thinner than the outline. */
type Shape = { body: string; backBody?: string; extra: string; back: string; patch: [number, number, number]; traced?: boolean };

const traced = (k: keyof typeof TRACED): Shape => ({ ...TRACED[k], traced: true });

/* Every goods kind but the patch, which is drawn as itself (PatchPlate). */
export const SHAPES: Record<Exclude<GoodsKind, 'patch'>, Shape> = {
  tee: traced('tee'),
  'tee-ls': traced('tee-ls'),
  turtleneck: traced('turtleneck'),
  hoodie: traced('hoodie'),
  cap: {
    body: 'M96 246 Q96 124 206 118 Q318 124 318 246 Z',
    extra: 'M96 246 Q40 250 48 276 Q170 300 318 250 M206 118 L206 104',
    back: 'M96 246 Q206 262 318 246 M180 248 Q206 214 232 248 M206 118 L206 104',
    patch: PATCH_ONLY.cap,
  },
  tote: {
    body: 'M112 168 L288 168 L300 336 L100 336 Z',
    extra: 'M140 168 C140 96 196 96 196 168 M204 168 C204 96 260 96 260 168',
    back: 'M140 168 C140 96 196 96 196 168 M204 168 C204 96 260 96 260 168',
    patch: PATCH_ONLY.tote,
  },
};

export type PlateView = 'front' | 'mark' | 'back';

export const FULL_VB = '0 0 400 400';

/* The viewBox that frames the patch: a square a few patches wide round it,
   so the patch is legible with some of the garment round it for context. */
export function patchViewBox(kind: GoodsKind, art?: PlateArt) {
  if (kind === 'patch') return PATCH_CLOSE_VB;
  const [cx, cy, side] = art?.patch ?? SHAPES[kind].patch;
  const k = Math.max(side * 3.4, 64);
  return `${cx - k / 2} ${cy - k / 2} ${k} ${k}`;
}

/* The close-up: the print, on a product that has one, else the patch. */
export function closeViewBox(kind: GoodsKind, art?: PlateArt) {
  return art?.print ? art.print.viewBox.join(' ') : patchViewBox(kind, art);
}

/* An embroidered patch gets its running stitch in the close-up; a printed
   mark does not. Read from the product's own details, so the drawing never claims a
   finish the copy does not. */
export const isEmbroidered = (p: Pick<Product, 'details'>) => p.details.some((d) => /embroider/i.test(d));

/* The detail that names the patch or mark ("Embroidered patch", "Printed wordmark"). */
export const markDetail = (p: Pick<Product, 'details'>) => p.details.find((d) => /patch|mark/i.test(d)) ?? p.details[1] ?? '';

const hidden = { opacity: 0 } as const;

/* One node of a generated drawing. ['mark', …] is the Clear mark, as it is. */
function hwNode(n: HwNode, k: number): ReactNode {
  if (n[0] === 'mark') {
    const { x, y, size } = n[1] as { x: number; y: number; size: number };
    return (
      <g key={k} transform={`translate(${x} ${y})`}>
        <g className="mk">
          <LogoMark size={size} variant="solid" />
        </g>
      </g>
    );
  }
  const [tag, attrs, kids] = n;
  return createElement(tag, { key: k, ...attrs }, typeof kids === 'string' ? kids : kids?.map(hwNode));
}

export function ProductPlate({
  kind,
  drawing,
  viewBox,
  tone,
  view = 'front',
  stitch,
  href,
  className,
  caption,
  art,
  swatch,
  patchShape,
}: ({ kind: ProductKind; drawing?: undefined } | { kind?: ProductKind; drawing: DrawingName }) & {
  /* `drawing`: a named drawing from hardwareShapes ("pointStates.bill",
     "counterTill") in place of the product kind's own, drawn in its own
     cropped viewBox. `viewBox` overrides the crop of either. */
  viewBox?: string;
  tone: PlateTone;
  view?: PlateView;
  /* Draw the patch's running stitch (shown in the close-up). */
  stitch?: boolean;
  /* The tile's drawing links to the product. The name beside it is the
     link a reader or a keyboard uses; this one is a larger target for a
     pointer, so it is out of the tab order and the accessibility tree. */
  href?: string;
  className?: string;
  caption?: ReactNode;
  /* The product's own layer: a print, a moved patch (content/shop.ts PlateArt). */
  art?: PlateArt;
  /* A colour its ground cannot show (fillOf: Cobalt): the body is filled with it. */
  swatch?: string;
  /* The patch's shape: the Logo Patch's own drawing, or the small patch on a
     garment. Square unless said, so every garment stays as it is. */
  patchShape?: PatchShape;
}) {
  const shape: HwShape | null = drawing ? NAMED[drawing] : kind && !isGoodsKind(kind) ? HW_SHAPES[kind] : null;
  const hw = !!shape;
  const svg = shape ? (
    <svg viewBox={viewBox ?? shape.viewBox} aria-hidden="true" focusable="false">
      <g className="gar">{shape.nodes.map(hwNode)}</g>
    </svg>
  ) : (
    kind === 'patch' ? (
      <PatchSvg shape={patchShape} view={view} viewBox={viewBox ?? (view === 'mark' ? PATCH_CLOSE_VB : FULL_VB)} />
    ) : (
      <GoodsSvg kind={kind as Exclude<GoodsKind, 'patch'>} view={view} stitch={stitch} viewBox={viewBox} tone={tone} art={art} shape={patchShape} filled={!!swatch} />
    )
  );
  /* Every goods plate stands on its tone's ground: a printed tee too (Black
     and Cobalt on the dark one, White on the light), so the boxes match. */
  const ground: PlateTone = tone;
  const style = swatch ? ({ '--body': swatch } as CSSProperties) : undefined;
  const cls = ['plate', hw && 'hwplate', className].filter(Boolean).join(' ');
  if (href) {
    return (
      <Link href={href} className={cls} data-tone={ground} data-kind={kind} style={style} tabIndex={-1} aria-hidden="true">
        {svg}
        {caption}
      </Link>
    );
  }
  return (
    <div className={cls} data-tone={ground} data-kind={kind} style={style}>
      {svg}
      {caption}
    </div>
  );
}

function GoodsSvg({
  kind,
  view,
  stitch,
  viewBox,
  tone,
  art,
  shape = 'square',
  filled,
}: {
  kind: Exclude<GoodsKind, 'patch'>;
  view: PlateView;
  stitch?: boolean;
  viewBox?: string;
  tone: PlateTone;
  art?: PlateArt;
  shape?: PatchShape;
  filled?: boolean;
}) {
  const s = SHAPES[kind];
  const back = view === 'back';
  const thin = s.traced ? ' fine' : '';
  const clip = useId();
  const print = art?.print;
  /* A colour the ground cannot show (Cobalt) fills the body; everything
     else is drawn as the other goods are, the print over it. */
  const fill = filled ? ' filled' : '';
  const lines = thin;
  return (
    <svg viewBox={viewBox ?? (view === 'mark' ? closeViewBox(kind, art) : FULL_VB)} aria-hidden="true" focusable="false">
      {print && (
        <defs>
          <clipPath id={clip}>
            <path d={s.body} />
          </clipPath>
        </defs>
      )}
      <g className="gar">
        {/* The front and back outlines turn with the faces (Gallery's faces()). */}
        <path className={`${s.backBody ? 'bd fx' : 'bd'}${fill}`} d={s.body} pathLength={1} style={back && s.backBody ? hidden : undefined} />
        {s.backBody && <path className={`bd bx2${fill}`} d={s.backBody} pathLength={1} style={back ? undefined : hidden} />}
        <path className={`ln2 fx${lines}`} d={s.extra} pathLength={1} style={back ? hidden : undefined} />
        <path className={`ln2 bx2${lines}`} d={s.back} pathLength={1} style={back ? undefined : hidden} />
        {print && (
          /* .pr: drawn in the plate's own space, so it is placed as the art
             was (Two Ten Overpass sits off to one side on purpose). */
          <image
            className="pr fx"
            href={printSrc(art, tone)!}
            x={0}
            y={0}
            width={400}
            height={400}
            clipPath={`url(#${clip})`}
            style={back ? hidden : undefined}
            data-back={back ? '' : undefined}
          />
        )}
        <g className="mkg" style={back ? hidden : undefined}>
          {/* .mk: the patch lands last in the draw-in, as the mark did. */}
          <g className="mk">
            <g transform={art?.patchRotate ? `rotate(${art.patchRotate} ${(art.patch ?? s.patch)[0]} ${(art.patch ?? s.patch)[1]})` : undefined}>
              <Patch at={art?.patch ?? s.patch} shape={shape} stitch={stitch && !print} close={view === 'mark'} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/* The Clear patch (reference/redesign/wearables/clear-patch-spec.md): a
   square in the plate's line colour with a border inset at 7.5% of its side
   and the mark at 68%, both in the ground colour. Embroidered, it has a
   running stitch just inside the edge, shown in the close-up (`.st`). */
function Patch({
  at: [cx, cy, side],
  shape,
  stitch,
  close,
}: {
  at: [number, number, number];
  shape: PatchShape;
  stitch?: boolean;
  close: boolean;
}) {
  const x = cx - side / 2, y = cy - side / 2;
  /* Round: the same square, cornered all the way. */
  const r = (w: number) => (shape === 'circle' ? w / 2 : 0);
  const b = side * 0.075;
  const m = side * 0.68;
  const st = side * 0.035;
  return (
    <>
      <rect className="pt" x={x} y={y} width={side} height={side} rx={r(side)} />
      <rect className="pb" x={x + b} y={y + b} width={side - 2 * b} height={side - 2 * b} rx={r(side - 2 * b)} style={{ strokeWidth: side * 0.03 }} />
      <g transform={`translate(${cx - m / 2} ${cy - m / 2})`}>
        <g className="pm">
          <LogoMark size={m} variant="solid" />
        </g>
      </g>
      {stitch && (
        <rect
          className="st"
          x={x + st}
          y={y + st}
          width={side - 2 * st}
          height={side - 2 * st}
          rx={r(side - 2 * st)}
          style={{ strokeWidth: side * 0.012, strokeDasharray: `${side * 0.03} ${side * 0.025}`, ...(close ? { opacity: 0.8 } : null) }}
        />
      )}
    </>
  );
}
