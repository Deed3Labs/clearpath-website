import type { ClosedReason } from '@/content/shop';
import { CLOSED } from '@/content/shop';
import { SHAPES } from './ProductPlate';

/* Behind the shop window's glass, one scene per reason the doors are shut:
   line drawings in the band's light ink — a rack and hangers, boxes, parcels,
   a calendar. Decorative (aria-hidden on the svg that holds it): the board
   beside it says why in words. Coordinates are the mockup's, in a 600×380
   box anchored bottom right. */

const HX = [362, 408, 454, 500, 546];

const ScTee = ({ x, s = 0.2 }: { x: number; s?: number }) => (
  <g transform={`translate(${x - 200 * s} ${132 - 74 * s}) scale(${s})`}>
    <path className="l" d={SHAPES.tee.body} vectorEffect="non-scaling-stroke" />
  </g>
);

const Hanger = ({ x, swing }: { x: number; swing?: boolean }) => (
  <g className={swing ? 'sw' : undefined} style={{ transformOrigin: `${x + 6}px 116px` }}>
    <path className="l" d={`M${x} 132 V122 q0 -8 6 -8 q6 0 6 6 M${x} 132 L${x - 24} 148 H${x + 24} Z`} />
  </g>
);

const Rack = () => (
  <>
    <path className="l" d="M326 116 H574 M338 116 L326 352 M562 116 L574 352 M312 352 H340 M560 352 H588" />
    <circle className="l" cx="326" cy="116" r="3" />
    <circle className="l" cx="574" cy="116" r="3" />
  </>
);

function Box({ x, y, w, h, t, open }: { x: number; y: number; w: number; h: number; t?: string; open?: boolean }) {
  const lid = open
    ? `M${x} ${y} L${x - 16} ${y - 14} L${x + w * 0.42 - 16} ${y - 14} L${x + w * 0.42} ${y} M${x + w} ${y} L${x + w + 16} ${y - 14} L${x + w * 0.58 + 16} ${y - 14} L${x + w * 0.58} ${y}`
    : `M${x + w / 2 - 9} ${y} v${h * 0.32} h18 v${-h * 0.32}`;
  return (
    <g>
      <path className="l" d={`M${x} ${y} h${w} v${h} h${-w} z ${lid}`} />
      {t && (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle">
          {t}
        </text>
      )}
    </g>
  );
}

const Parcel = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <g>
    <path className="l" d={`M${x} ${y} h${w} v${h} h${-w} z M${x + w * 0.7} ${y} v${h}`} />
    <path
      className="l2"
      d={`M${x + w * 0.1} ${y + h * 0.28} h${w * 0.42} v${h * 0.4} h${-w * 0.42} z M${x + w * 0.16} ${y + h * 0.42} h${w * 0.26} M${x + w * 0.16} ${y + h * 0.54} h${w * 0.18}`}
    />
  </g>
);

const Table = () => <path className="l" d="M318 248 H582 M318 256 H582 M330 256 V352 M570 256 V352" />;

function Calendar() {
  const x = 336, y = 26, cw = 24, ch = 26;
  const frame = `M${x} ${y} h120 v80 h-120 z M${x} ${y + 20} h120 M${x + 24} ${y - 6} v12 M${x + 96} ${y - 6} v12`;
  let grid = '';
  for (let c = 1; c < 5; c++) grid += `M${x + c * cw} ${y + 20} v60 `;
  grid += `M${x} ${y + 20 + ch + 2} h120`;
  let xs = '';
  [0, 1, 2].forEach((k) => {
    const cx = x + k * cw, cy = y + 20;
    xs += `M${cx + 6} ${cy + 6} l12 15 M${cx + 18} ${cy + 6} l-12 15 `;
  });
  return (
    <g>
      <path className="l" d={frame} />
      <path className="l2" d={grid} />
      <path className="l x2" d={xs} />
    </g>
  );
}

function Pieces({ reason }: { reason: ClosedReason }) {
  switch (reason) {
    case 'not-open-yet':
      return (
        <>
          <Rack />
          {HX.map((x) => (
            <Hanger key={x} x={x} />
          ))}
          <Box x={420} y={298} w={112} h={54} t={CLOSED.sceneBox} open />
        </>
      );
    case 'sold-out':
      return (
        <>
          <Rack />
          {HX.map((x, i) => (
            <Hanger key={x} x={x} swing={i === 2} />
          ))}
        </>
      );
    case 'restocking':
      return (
        <>
          <Rack />
          {HX.map((x, i) => (
            <g key={x}>
              <Hanger x={x} />
              {i < 2 && <ScTee x={x} />}
            </g>
          ))}
          <Box x={452} y={300} w={92} h={52} />
          <Box x={474} y={254} w={64} h={46} />
          <Box x={372} y={310} w={62} h={42} open />
        </>
      );
    case 'packing-orders':
      return (
        <>
          <Table />
          <Parcel x={334} y={206} w={76} h={42} />
          <Parcel x={422} y={186} w={96} h={62} />
          <Parcel x={528} y={216} w={42} h={32} />
          <Parcel x={392} y={312} w={88} h={40} />
          <Parcel x={492} y={320} w={60} h={32} />
        </>
      );
    case 'break':
      return (
        <>
          <Calendar />
          <Rack />
          {HX.map((x) => (
            <g key={x}>
              <Hanger x={x} />
              <ScTee x={x} />
            </g>
          ))}
        </>
      );
  }
}

export function ClosedScene({ reason }: { reason: ClosedReason }) {
  return (
    <svg className="sc" viewBox="0 0 600 380" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
      <path className="l2" d="M0 352.5 H600" />
      <g className="scg">
        <Pieces reason={reason} />
      </g>
    </svg>
  );
}
