import { PROTOCOL } from '@/content/coop';

/* Static drawings for this page, decorative (each sits beside text that says
   what it shows).

   The fork: the protocol as one main line of commits, maintained by ClearLabs
   and by anyone else, with the co-op's branch peeling off it. Two versions:
   wide (1000 × 172) and narrow for phones (360 × 196), switched in CSS. */

const F = PROTOCOL.fork;

/* Commits on the main line: x, and whether it is ClearLabs' (filled). */
const WIDE_MAIN: [number, boolean][] = [
  [70, false], [160, true], [250, true], [340, false], [430, true], [520, true], [690, false], [780, true], [870, true], [950, false],
];
const WIDE_FORK = [770, 870, 960];
const NARROW_MAIN: [number, boolean][] = [
  [30, false], [80, true], [130, true], [230, false], [280, true], [340, true],
];
const NARROW_FORK = [280, 340];

export function ForkDrawings() {
  return (
    <>
      <svg className="wide" viewBox="0 0 1000 172" aria-hidden="true" focusable="false">
        <text className="t1" x="20" y="24">{F.title}</text>
        <path className="main" d="M20 60 H980" />
        <path className="br" d="M600 60 C 650 60, 650 128, 700 128 H980" />
        {WIDE_MAIN.map(([x, lab]) => (
          <circle key={x} className={lab ? 'cm lab' : 'cm'} cx={x} cy="60" r="7" />
        ))}
        <text x="160" y="92" textAnchor="middle">{F.labs}</text>
        <text x="340" y="92" textAnchor="middle">{F.anyone}</text>
        {WIDE_FORK.map((x) => (
          <circle key={x} className="cm fk" cx={x} cy="128" r="7" />
        ))}
        <text className="fk-t" x="604" y="104">{F.fork}</text>
        <text className="t2 fk-t" x="700" y="162">{F.branch}</text>
      </svg>
      <svg className="narrow" viewBox="0 0 360 196" aria-hidden="true" focusable="false">
        <text className="t1" x="4" y="20">{F.titleNarrow}</text>
        <path className="main" d="M8 54 H352" />
        <path className="br" d="M180 54 C 206 54, 206 118, 232 118 H352" />
        {NARROW_MAIN.map(([x, lab]) => (
          <circle key={x} className={lab ? 'cm lab' : 'cm'} cx={x} cy="54" r="6" />
        ))}
        <text x="80" y="84" textAnchor="middle">{F.labs}</text>
        {NARROW_FORK.map((x) => (
          <circle key={x} className="cm fk" cx={x} cy="118" r="6" />
        ))}
        <text className="fk-t" x="150" y="98">{F.fork}</text>
        <text className="t2 fk-t" x="4" y="164">{F.branchNarrow[0]}</text>
        <text className="t2 fk-t" x="4" y="182">{F.branchNarrow[1]}</text>
      </svg>
    </>
  );
}

/* The two maps: ten merchants along one corridor, and ten scattered across
   the county, on the same grid of roads (200 × 120). */
const ROADS = ['M0 22 H200', 'M0 58 H200', 'M0 94 H200', 'M38 0 V120', 'M96 0 V120', 'M154 0 V120'];
const CORRIDOR: [number, number][] = [
  [72.1, 69.8], [78.9, 67.8], [81.8, 67.7], [94.1, 69.2], [98.4, 60.9], [102.1, 58.9], [104.7, 54.7], [110.6, 60.4], [121.0, 56.7], [126.3, 48.0],
];
const COUNTY: [number, number][] = [
  [14, 12], [70, 30], [176, 14], [120, 48], [30, 72], [186, 70], [84, 104], [142, 96], [56, 52], [166, 110],
];

export function CorridorMap({ spread }: { spread?: boolean }) {
  const pts = spread ? COUNTY : CORRIDOR;
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" focusable="false">
      {ROADS.map((d) => (
        <path key={d} className="rd" d={d} />
      ))}
      {!spread && <path className="cor" d="M8 104 L192 20" />}
      {pts.map(([x, y]) => (
        <circle key={`${x}-${y}`} className="m" cx={x} cy={y} r="3.2" />
      ))}
      {!spread && <ellipse className="ring" cx="98" cy="62" rx="40" ry="16" transform="rotate(-24.5 98 62)" />}
    </svg>
  );
}
