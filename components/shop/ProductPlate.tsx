import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoMark } from '@/components/marks/Logo';
import type { PlateTone, Product, ProductKind } from '@/content/shop';

/* The product, drawn, until there is a photograph.
 *
 * A line drawing on a flat ground rather than a mock-up render: the site
 * draws rules and diagrams, never renders, and a fake photo of a shirt that
 * does not exist yet would be the one dishonest image on it. Each silhouette
 * carries the mark where the real one will sit. Swap in `images` on the
 * product and the product page shows those instead.
 *
 * Three views, all in the one drawing so the gallery can turn between them:
 * the front (`fx` lines and the mark), the back (`bx2` lines, no mark), and
 * the mark close up, which is the front with the viewBox zoomed in to it.
 * Every path is pathLength 1, so the draw-in can run its dash from 1 to 0
 * whatever the shape's real length. The drawing is decoration: the product's
 * name always sits beside it in words. */

type Shape = { body: string; extra: string; back: string; mark: [number, number, number] };

export const SHAPES: Record<ProductKind, Shape> = {
  tee: {
    body: 'M140 92 L178 74 Q200 96 222 74 L260 92 L330 150 L298 192 L268 172 L268 334 L132 334 L132 172 L102 192 L70 150 Z',
    extra: 'M178 74 Q200 112 222 74',
    back: 'M178 74 Q200 88 222 74',
    mark: [236, 132, 22],
  },
  cap: {
    body: 'M96 246 Q96 124 206 118 Q318 124 318 246 Z',
    extra: 'M96 246 Q40 250 48 276 Q170 300 318 250 M206 118 L206 104',
    back: 'M96 246 Q206 262 318 246 M180 248 Q206 214 232 248 M206 118 L206 104',
    mark: [206, 190, 44],
  },
  tote: {
    body: 'M112 168 L288 168 L300 336 L100 336 Z',
    extra: 'M140 168 C140 96 196 96 196 168 M204 168 C204 96 260 96 260 168',
    back: 'M140 168 C140 96 196 96 196 168 M204 168 C204 96 260 96 260 168',
    mark: [200, 254, 58],
  },
};

export type PlateView = 'front' | 'mark' | 'back';

export const FULL_VB = '0 0 400 400';

/* The viewBox that frames the mark: a square a few marks wide round it. */
export function markViewBox(kind: ProductKind) {
  const [mx, my, size] = SHAPES[kind].mark;
  const k = Math.max(size * 3.6, 124);
  return `${mx - k / 2} ${my - k / 2} ${k} ${k}`;
}

/* An embroidered mark gets stitch dashes in the close-up; a printed one does
   not. Read from the product's own details, so the drawing never claims a
   finish the copy does not. */
export const isEmbroidered = (p: Pick<Product, 'details'>) => p.details.some((d) => /embroider/i.test(d));

/* The detail that names the mark ("Embroidered mark", "Printed wordmark"). */
export const markDetail = (p: Pick<Product, 'details'>) => p.details.find((d) => /mark/i.test(d)) ?? p.details[1] ?? '';

const hidden = { opacity: 0 } as const;

export function ProductPlate({
  kind,
  tone,
  view = 'front',
  stitch,
  href,
  className,
  caption,
}: {
  kind: ProductKind;
  tone: PlateTone;
  view?: PlateView;
  /* Draw the stitch ring round the mark (shown in the mark view). */
  stitch?: boolean;
  /* The tile's drawing links to the product. The name beside it is the
     link a reader or a keyboard uses; this one is a larger target for a
     pointer, so it is out of the tab order and the accessibility tree. */
  href?: string;
  className?: string;
  caption?: ReactNode;
}) {
  const s = SHAPES[kind];
  const [mx, my, size] = s.mark;
  const back = view === 'back';
  const svg = (
    <svg viewBox={view === 'mark' ? markViewBox(kind) : FULL_VB} aria-hidden="true" focusable="false">
      <g className="gar">
        <path className="bd" d={s.body} pathLength={1} />
        <path className="ln2 fx" d={s.extra} pathLength={1} style={back ? hidden : undefined} />
        <path className="ln2 bx2" d={s.back} pathLength={1} style={back ? undefined : hidden} />
        <g className="mkg" style={back ? hidden : undefined}>
          <g transform={`translate(${mx - size / 2} ${my - size / 2})`}>
            <g className="mk">
              <LogoMark size={size} variant="solid" />
            </g>
          </g>
          {stitch && <circle className="st" cx={mx} cy={my} r={size * 0.8} style={view === 'mark' ? { opacity: 0.8 } : undefined} />}
        </g>
      </g>
    </svg>
  );
  const cls = ['plate', className].filter(Boolean).join(' ');
  if (href) {
    return (
      <Link href={href} className={cls} data-tone={tone} data-kind={kind} tabIndex={-1} aria-hidden="true">
        {svg}
        {caption}
      </Link>
    );
  }
  return (
    <div className={cls} data-tone={tone} data-kind={kind}>
      {svg}
      {caption}
    </div>
  );
}
