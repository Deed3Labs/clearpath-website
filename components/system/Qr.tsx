/* A decorative QR-shaped code: three finder squares, timing rows, and a seeded
   field of modules. Seeded, so the server and the browser draw the same code
   and it never changes between visits. It encodes nothing — it is a picture
   of the code a counter shows, never something to scan. */

const N = 29;

function modules(seed: number) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cells: [number, number][] = [];
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      const ax = x - fx, ay = y - fy;
      if (ax >= 0 && ax < 7 && ay >= 0 && ay < 7) return [ax, ay] as const;
    }
    return null;
  };
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const f = finder(x, y);
      if (f) {
        const [ax, ay] = f;
        if (ax === 0 || ax === 6 || ay === 0 || ay === 6 || (ax > 1 && ax < 5 && ay > 1 && ay < 5)) cells.push([x, y]);
      } else if (
        !(x === 7 || y === 7 || x === N - 8 || y === N - 8) &&
        (x === 6 || y === 6 ? (x + y) % 2 === 0 : rnd() > 0.52)
      )
        cells.push([x, y]);
    }
  return cells;
}

export function Qr({ id, className, seed = 7 }: { id?: string; className?: string; seed?: number }) {
  return (
    <svg id={id} className={className} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {modules(seed).map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" />
      ))}
    </svg>
  );
}
