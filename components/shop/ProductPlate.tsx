import { LogoMark } from '@/components/marks/Logo';
import type { PlateTone, ProductKind } from '@/content/shop';

/* The product, drawn, until there is a photograph.
 *
 * A line drawing on a flat ground rather than a mock-up render: the site
 * draws rules and diagrams, never renders, and a fake photo of a shirt that
 * does not exist yet would be the one dishonest image on it. Each silhouette
 * carries the mark where the real one will sit. Swap in `images` on the
 * product and this is not used.
 */

const SHAPES: Record<ProductKind, { body: string; extra?: string; mark: [number, number, number] }> = {
  tee: {
    body: 'M140 92 L178 74 Q200 96 222 74 L260 92 L330 150 L298 192 L268 172 L268 334 L132 334 L132 172 L102 192 L70 150 Z',
    extra: 'M178 74 Q200 112 222 74',
    mark: [236, 132, 22],
  },
  cap: {
    body: 'M96 246 Q96 124 206 118 Q318 124 318 246 Z',
    extra: 'M96 246 Q40 250 48 276 Q170 300 318 250 M206 118 L206 104',
    mark: [206, 190, 44],
  },
  tote: {
    body: 'M112 168 L288 168 L300 336 L100 336 Z',
    extra: 'M140 168 C140 96 196 96 196 168 M204 168 C204 96 260 96 260 168',
    mark: [200, 254, 58],
  },
};

export function ProductPlate({
  kind,
  tone,
  label,
  className,
}: {
  kind: ProductKind;
  tone: PlateTone;
  /* Pass a label when the plate is the only picture of the product; leave it
     off where the product name sits right beside it. */
  label?: string;
  className?: string;
}) {
  const s = SHAPES[kind];
  const [mx, my, size] = s.mark;
  return (
    <div className={['shop-plate', className].filter(Boolean).join(' ')} data-tone={tone}>
      <svg
        viewBox="0 0 400 400"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <path className="shop-plate-body" d={s.body} />
        {s.extra && <path className="shop-plate-line" d={s.extra} />}
        <g className="shop-plate-mark" transform={`translate(${mx - size / 2} ${my - size / 2})`}>
          <LogoMark size={size} variant="solid" />
        </g>
      </svg>
    </div>
  );
}
