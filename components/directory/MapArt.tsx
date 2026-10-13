import { TOWNS, type Partner } from '@/content/directory';

/* The drawn Inland Empire: towns where they really are relative to each
   other, the freeways simplified, a pin for each partner in a mapped town.
   Decorative (aria-hidden): every partner, town and kind on it is also in
   the list beside it, so the map carries nothing the list does not.

   Pure markup, so the partner page renders it on the server and the
   directory board renders it in its own tree with the same output. */

const W = 640;
const H = 420;

/* [path, shield number, shield x, shield y]. The paths run past the edges so
   a cropped view never shows a road stopping short. */
const ROADS: [string, string, number, number][] = [
  ['M-20 214 L111 210 L220 204 L330 200 L446 192 L544 210 L660 216', '10', 604, 214],
  ['M120 128 L165 132 L311 146 L380 128 L446 116 L520 150 L560 192', '210', 240, 132],
  ['M347 340 L380 270 L420 200 L446 150 L460 80 L476 -20', '215', 470, 28],
  ['M318 -20 L258 90 L238 150 L226 230 L214 320 L202 440', '15', 296, 24],
  ['M-20 268 L180 286 L300 320 L347 326 L460 310 L660 300', '60', 604, 300],
];

export const onMap = (p: Partner) => p.city in TOWNS;

/* Pins in the same town fan out a little so none hides another. */
export function pinPos(p: Partner, all: Partner[]): [number, number] {
  const t = TOWNS[p.city];
  const same = all.filter((q) => q.city === p.city);
  const k = same.indexOf(p);
  if (same.length < 2) return [t.x, t.y - 14];
  return [t.x + (k - (same.length - 1) / 2) * 16, t.y - 14];
}

/* The partner page's crop: 440 × 220 around the town, held inside the map. */
export function cropAround(city: string): [number, number, number, number] {
  const t = TOWNS[city] ?? { x: W / 2, y: H / 2 };
  const clamp = (v: number, hi: number) => Math.min(Math.max(v, 0), hi);
  return [clamp(t.x - 220, W - 440), clamp(t.y - 110, H - 220), 440, 220];
}

export function MapArt({
  partners,
  crop,
  small,
  hot,
  off,
}: {
  partners: Partner[];
  crop?: [number, number, number, number];
  /* No freeway shields (the partner page's small map). */
  small?: boolean;
  hot?: string | null;
  /* Slugs filtered out: their pins fade. */
  off?: Set<string>;
}) {
  const pinned = partners.filter(onMap);
  /* In a crop, a town whose label would be cut by the edge keeps its dot
     and loses its name. */
  const fits = (t: string, x: number, y: number) => {
    if (!crop) return true;
    const [cx, cy, cw, ch] = crop;
    const [dx, dy] = TOWNS[t].label;
    const hw = t.length * 3.4 + 4;
    const lx = x + dx;
    return lx - hw >= cx && lx + hw <= cx + cw && y + dy - 10 >= cy && y + dy + 4 <= cy + ch;
  };
  return (
    <svg viewBox={(crop ?? [0, 0, W, H]).join(' ')} aria-hidden="true" focusable="false">
      {ROADS.map(([d, n, sx, sy]) => (
        <g key={n}>
          <path className="fw2" d={d} />
          {!small && (
            <>
              <rect className="shd-b" x={sx - 13} y={sy - 9} width="26" height="15" />
              <text className="shd" x={sx} y={sy + 2} textAnchor="middle">
                {n}
              </text>
            </>
          )}
        </g>
      ))}
      {Object.entries(TOWNS).map(([t, { x, y, label }]) => {
        const named = fits(t, x, y);
        const empty = !partners.some((p) => p.city === t);
        return (
          <g className={named && empty ? 'town empty' : 'town'} key={t}>
            <circle cx={x} cy={y} r="3.5" />
            {named && (
              <text x={x + label[0]} y={y + label[1]} textAnchor="middle">
                {t}
              </text>
            )}
          </g>
        );
      })}
      {pinned.map((p) => {
        const [x, y] = pinPos(p, pinned);
        const cls = ['pin', p.splitPlans && 'split', hot === p.slug && 'hot', off?.has(p.slug) && 'off'].filter(Boolean).join(' ');
        return (
          <g className={cls} data-slug={p.slug} key={p.slug}>
            <circle className="pr2" cx={x} cy={y} r="12" />
            <circle className="pc2" cx={x} cy={y} r="6" />
          </g>
        );
      })}
    </svg>
  );
}
