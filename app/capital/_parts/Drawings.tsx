/* The three holders, drawn on one ground line (viewBox 300 × 146, ground at
   y 100). Members hold the structure, the co-op holds the land, contributors
   hold shares. Drafting strokes only; decorative, since each cell's headline
   says what its drawing shows. Strokes that draw themselves in carry .draw.

   The ground below the line is hatched: faint under the house and the
   shares, cobalt under the land, because the land is the co-op's. */

const GROUND = 100;
const HATCH_DEPTH = 24;

function Hatch({ id, live }: { id: string; live?: boolean }) {
  const lines = [];
  for (let x = -44; x <= 300; x += 8) {
    lines.push(
      <line key={x} className={live ? 'ht live' : 'ht faint'} x1={x} y1={GROUND + HATCH_DEPTH} x2={x + HATCH_DEPTH} y2={GROUND} />,
    );
  }
  return (
    <>
      <clipPath id={id}>
        <rect x="0" y={GROUND} width="300" height={HATCH_DEPTH} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{lines}</g>
    </>
  );
}

const Ground = () => <line className="gl draw" x1="0" y1={GROUND} x2="300" y2={GROUND} />;

/* The house's outline, shared by the drawn house and the land's ghost. */
const HOUSE = ['M95 100 V56 H205 V100', 'M84 61 L150 22 L216 61', 'M141 100 V74 H159 V100'];

export function HouseDrawing() {
  return (
    <svg viewBox="0 0 300 146" aria-hidden="true" focusable="false">
      <Hatch id="hc1" />
      {HOUSE.map((d) => (
        <path key={d} className="ln1 draw" d={d} />
      ))}
      <rect className="ln2" x="108" y="66" width="20" height="15" />
      <rect className="ln2" x="172" y="66" width="20" height="15" />
      <path className="ln2" d="M118 66v15M182 66v15" />
      <Ground />
    </svg>
  );
}

export function LandDrawing() {
  return (
    <svg viewBox="0 0 300 146" aria-hidden="true" focusable="false">
      {HOUSE.map((d) => (
        <path key={d} className="gh" d={d} />
      ))}
      <Hatch id="hc2" live />
      <Ground />
      <circle className="pin" cx="22" cy={GROUND} r="4" />
      <circle className="pin" cx="278" cy={GROUND} r="4" />
      <path className="ln2" d="M22 130v12M278 130v12M22 136H278" />
    </svg>
  );
}

/* Six stacks of shares, one of them filled; heights in blocks. */
const STACKS = [5, 3, 7, 2, 4, 6];
const FILLED = 2;

export function SharesDrawing() {
  return (
    <svg viewBox="0 0 300 146" aria-hidden="true" focusable="false">
      <Hatch id="hc3" />
      {STACKS.map((n, c) =>
        Array.from({ length: n }, (_, k) => (
          <rect key={`${c}-${k}`} className={c === FILLED ? 'blk f' : 'blk'} x={24 + c * 44} y={88 - k * 10} width="32" height="8" />
        )),
      )}
      <Ground />
    </svg>
  );
}
