import { LogoMark } from '@/components/marks/Logo';
import { WHY } from '@/content/shop';
import { SHAPES } from './ProductPlate';

/* The three drawings under "What it is for", on one baseline with one label
   row. Rendered finished; WhyMotion runs them when the bento comes into view.
   Decorative: each cell's headline and line say the same thing in words. */

const A = WHY.art;

/* Twelve squares across the cell, as many runs as there are. */
const squares = (y: number) => Array.from({ length: 12 }, (_, i) => +(i * (22 + 48 / 11)).toFixed(1)).map((x) => ({ x, y }));

export function RunsArt() {
  return (
    <svg viewBox="0 0 320 140">
      <g>
        {squares(30.5).map((s) => (
          <rect key={`r${s.x}`} className="r" x={s.x} y={s.y} width="22" height="22" />
        ))}
        {squares(30.5).map((s) => (
          <rect key={`f${s.x}`} className="f run-f" x={s.x} y={s.y} width="22" height="22" />
        ))}
      </g>
      <g>
        {squares(72.5).map((s) => (
          <rect key={`d${s.x}`} className="r" x={s.x} y={s.y} width="22" height="22" strokeDasharray="3 3" />
        ))}
      </g>
      <rect className="f" x="0" y="125" width="9" height="9" />
      <text x="16" y="133">
        {A.run1}
      </text>
      <rect className="r" x="150.5" y="125.5" width="8" height="8" strokeDasharray="2 2" />
      <text x="166" y="133">
        {A.run2}
      </text>
    </svg>
  );
}

function Tee({ x, s, mark }: { x: number; s: number; mark?: boolean }) {
  const t = SHAPES.tee;
  return (
    <g transform={`translate(${x - 70 * s} ${106 - 260 * s - 74 * s}) scale(${s})`}>
      <path className="o" d={t.body} vectorEffect="non-scaling-stroke" />
      <path className="o" d={t.extra} vectorEffect="non-scaling-stroke" />
      {mark && (
        <g transform="translate(225 121)">
          <LogoMark size={22} variant="solid" />
        </g>
      )}
    </g>
  );
}

export function LastArt() {
  return (
    <svg viewBox="0 0 320 140">
      <path className="floor" d="M0 106.5 H320" />
      <g className="three">
        {[
          [0, 0.22],
          [67, 0.18],
          [124, 0.14],
        ].map(([x, s]) => (
          <g className="sh" key={x}>
            <Tee x={x} s={s} />
          </g>
        ))}
      </g>
      <path className="x strike" d="M-4 76 L166 90" pathLength={1} />
      <g className="one">
        <Tee x={254 - 130 * 0.36} s={0.36} mark />
      </g>
      <text x="81" y="133" textAnchor="middle">
        {A.three}
      </text>
      <text x="254" y="133" textAnchor="middle">
        {A.one}
      </text>
    </svg>
  );
}

export function GoesArt() {
  return (
    <svg viewBox="0 0 320 140">
      <path className="r" d="M30 62 H290" />
      <circle className="o ring" cx="290" cy="62" r="20" />
      <circle className="o ring" cx="290" cy="62" r="32" />
      <circle className="o ring" cx="290" cy="62" r="44" />
      <rect className="bgk" x="12" y="44" width="36" height="36" />
      <rect className="o" x="12.5" y="44.5" width="35" height="35" />
      <path className="o" d="M22 55h16l-1.4 15h-13.2z M26 55v-2.2a4 4 0 0 1 8 0V55" />
      <rect className="f" x="142" y="44" width="36" height="36" />
      <g transform="translate(148 50)" className="on-f">
        <LogoMark size={24} variant="solid" />
      </g>
      <rect className="bgk" x="272" y="44" width="36" height="36" />
      <rect className="o" x="272.5" y="44.5" width="35" height="35" />
      <path className="o" d="M282 58 h7 l8 -6 v20 l-8 -6 h-7 z" />
      <circle className="live goes-dot" cx="30" cy="62" r="4.5" />
      <text x="30" y="133" textAnchor="middle">
        {A.sale}
      </text>
      <text x="160" y="133" textAnchor="middle">
        {A.coop}
      </text>
      <text x="290" y="133" textAnchor="middle">
        {A.word}
      </text>
    </svg>
  );
}
