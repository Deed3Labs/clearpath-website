import type { KeyboardEvent, PointerEvent } from 'react';
import { STRUCTURE, type OrgNode } from '@/content/coop';

/* The ownership tree, drawn from data.
 *
 * Rules the drawing obeys:
 *   · A dashed outline means ownerless and NOTHING else. Only the foundation
 *     is dashed.
 *   · Ownership lines solid. The foundation-to-ClearLabs line is dotted and
 *     labelled, because a contract is not ownership.
 *   · Below 860px the landscape drawing gives way to the same tree laid out
 *     portrait, as a spine, at its real size on a phone. The text alternative
 *     (StructureList) is in the DOM at every width.
 *
 * Two notes for whoever changes this next.
 *
 * ClearLabs is drawn as the last of the four children, so it sits beside the
 * foundation it contracts with. Any other order routes the dotted line
 * straight through Clear Capital Holdings, which would read as a relationship
 * that does not exist.
 *
 * Every coordinate is derived from the constants below rather than typed in.
 * "When a row gains or loses a box, every connector below it silently
 * mis-aligns" — so nothing here is free to mis-align: add a child and the
 * bus, the stems and the drops all move together.
 *
 * The redesign adds three things, all driven from outside through props so
 * this file stays free of hooks (the coop page's OrgChart owns the state):
 *   · `selected`: the chosen box is lit, with every ownership edge on its line
 *     back to the root (and the contract line, for ClearLabs or the
 *     foundation). Each edge carries the id of the box it leads to.
 *   · `onSelect`: boxes are buttons — click, Enter/Space, or a mouse hover.
 *   · The balance-sheet view is pure CSS on the parent (`.org.bs`): boxes
 *     carry their sheet (`mon` money, `hou` housing), the hatch pattern is
 *     defined here, and the "never touch" seam between Clear Lending and
 *     Clear Properties is drawn here, hidden until that view.
 * Edges and the contract line carry `.draw` for the draw-in on scroll. */

const { root, children, holdingsChildren, foundation, contractLabel, seam } = STRUCTURE;

/* Clear Capital Holdings is the third child; its subtree hangs from it. */
const HOLDINGS_I = 2;
const CLEARLABS_I = children.length - 1;
const ALL = [root, ...children, ...holdingsChildren, foundation];

export const nodeOf = (id: string) => ALL.find((n) => n.id === id) ?? root;
export const parentOf = (id: string): OrgNode | null =>
  children.some((c) => c.id === id) ? root : holdingsChildren.some((g) => g.id === id) ? children[HOLDINGS_I] : null;

/* The ids on a box's line of ownership, up to (not including) the root. */
function chainOf(id: string) {
  const chain: string[] = [];
  let cur: OrgNode | null = nodeOf(id);
  while (cur && cur.id !== root.id) {
    chain.push(cur.id);
    cur = parentOf(cur.id);
  }
  return chain;
}

type Interact = { selected?: string; onSelect?: (id: string) => void };

function Box({
  n,
  x,
  y,
  w,
  h,
  extra,
  selected,
  onSelect,
}: { n: OrgNode; x: number; y: number; w: number; h: number; extra?: string } & Interact) {
  const on = selected === n.id;
  const cls = ['n', extra, n.bs, on && 'on'].filter(Boolean).join(' ');
  const pick = () => onSelect?.(n.id);
  return (
    <g
      className={cls}
      data-id={n.id}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? n.name : undefined}
      aria-pressed={onSelect ? on : undefined}
      onClick={onSelect ? pick : undefined}
      onKeyDown={
        onSelect
          ? (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pick();
              }
            }
          : undefined
      }
      onPointerEnter={onSelect ? (e: PointerEvent) => e.pointerType === 'mouse' && pick() : undefined}
    >
      <rect x={x} y={y} width={w} height={h} />
      <text x={x + w / 2} y={y + h / 2 - 3} className="nm" aria-hidden="true">
        {n.name}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 15} className="nt" aria-hidden="true">
        {n.note}
      </text>
    </g>
  );
}

function Edge({ to, d, contract, chain, selected }: { to: string; d: string; contract?: boolean; chain: string[]; selected?: string }) {
  const hl = contract ? selected === foundation.id || selected === children[CLEARLABS_I].id : chain.includes(to);
  return <path className={[contract ? 'k' : 'e', 'draw', hl && 'hl'].filter(Boolean).join(' ')} data-to={to} d={d} />;
}

/* The balance-sheet view fills housing with a cobalt hatch. */
function Hatch({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="var(--color-ink-ground)" />
        <g className="hatch">
          <line x1="0" y1="0" x2="0" y2="6" />
        </g>
      </pattern>
    </defs>
  );
}

/* ── Landscape ─────────────────────────────────────────────────────────── */

const W = 1000;
const BOX_H = 76;
const ROOT_H = 68;
const ROOT_W = 260;
const ROW1_Y = 8;
const ROW2_Y = 142;
const ROW3_Y = 292;
const CHILD_W = 180;
const CHILD_GAP = 16;
const CHILD_X0 = 8;
const childX = (i: number) => CHILD_X0 + i * (CHILD_W + CHILD_GAP);
const centreOf = (i: number) => childX(i) + CHILD_W / 2;
const FOUNDATION_W = 180;
const FOUNDATION_X = childX(children.length);
const GC_W = 172;
/* Wide enough for the "never touch" seam to sit between the two. */
const GC_GAP = 64;
/* How far above a row its bus runs. */
const BUS = 30;

export function StructureDiagram({ selected, onSelect }: Interact) {
  const chain = selected ? chainOf(selected) : [];

  /* Centred over its OWN children, not over the canvas. The foundation sits
     outside the ownership tree and to the right, so centring on the canvas
     pushes the root off its own subtree. */
  const rootCx = (centreOf(0) + centreOf(children.length - 1)) / 2;
  const busY = ROW2_Y - BUS;

  /* Grandchildren are centred under Holdings, whatever Holdings' index is. */
  const holdingsCx = centreOf(HOLDINGS_I);
  const gcTotal = holdingsChildren.length * GC_W + (holdingsChildren.length - 1) * GC_GAP;
  const gcX = (i: number) => holdingsCx - gcTotal / 2 + i * (GC_W + GC_GAP);
  const gcCentre = (i: number) => gcX(i) + GC_W / 2;
  const gcBusY = ROW3_Y - BUS;

  /* The dotted contract line drops below both boxes and elbows across, so the
     label has somewhere to sit that is not on top of the drawing. */
  const elbowY = ROW2_Y + BOX_H + 24;
  const foundationCx = FOUNDATION_X + FOUNDATION_W / 2;
  const clearlabsCx = centreOf(CLEARLABS_I);

  /* The seam sits midway between the two grandchildren. */
  const seamX = (gcCentre(0) + gcCentre(1)) / 2;
  const it = { selected, onSelect };

  return (
    <svg className="wide" viewBox={`0 0 ${W} ${ROW3_Y + BOX_H + 8}`} focusable="false" aria-hidden={onSelect ? undefined : true}>
      <Hatch id="hatch-w" />
      {children.map((c, i) => (
        <Edge key={c.id} to={c.id} chain={chain} d={`M ${rootCx} ${ROW1_Y + ROOT_H} V ${busY} H ${centreOf(i)} V ${ROW2_Y}`} />
      ))}
      {holdingsChildren.map((g, i) => (
        <Edge key={g.id} to={g.id} chain={chain} d={`M ${holdingsCx} ${ROW2_Y + BOX_H} V ${gcBusY} H ${gcCentre(i)} V ${ROW3_Y}`} />
      ))}
      <Edge
        to={foundation.id}
        contract
        chain={chain}
        selected={selected}
        d={`M ${foundationCx} ${ROW2_Y + BOX_H} V ${elbowY} H ${clearlabsCx} V ${ROW2_Y + BOX_H}`}
      />
      <text className="cl" x={(foundationCx + clearlabsCx) / 2} y={elbowY + 20} textAnchor="middle" aria-hidden="true">
        {contractLabel}
      </text>

      <g className="gap" aria-hidden="true">
        <line x1={seamX - 5} y1={ROW3_Y + 10} x2={seamX - 5} y2={ROW3_Y + BOX_H - 10} />
        <line x1={seamX + 5} y1={ROW3_Y + 10} x2={seamX + 5} y2={ROW3_Y + BOX_H - 10} />
        <text x={seamX} y={ROW3_Y - 8}>
          {seam}
        </text>
      </g>

      <Box n={root} x={rootCx - ROOT_W / 2} y={ROW1_Y} w={ROOT_W} h={ROOT_H} extra="root" {...it} />
      {children.map((c, i) => (
        <Box key={c.id} n={c} x={childX(i)} y={ROW2_Y} w={CHILD_W} h={BOX_H} {...it} />
      ))}
      {/* The only dashed box on the drawing. */}
      <Box n={foundation} x={FOUNDATION_X} y={ROW2_Y} w={FOUNDATION_W} h={BOX_H} extra="found" {...it} />
      {holdingsChildren.map((g, i) => (
        <Box key={g.id} n={g} x={gcX(i)} y={ROW3_Y} w={GC_W} h={BOX_H} {...it} />
      ))}
    </svg>
  );
}

/* ── The same drawing, laid out portrait ──────────────────────────────────
 * Scaling the landscape layout to a phone column puts its labels at 4px. This
 * is the same tree reflowed as a vertical spine — the shape a file tree takes
 * — so it renders about 1:1 on a phone and the labels stay at their real
 * size. Same data, same rules: one dashed box and one dotted contract line. */

const M_W = 360;
const M_ROOT_H = 58;
const M_BOX_H = 54;
const M_GC_H = 50;
const M_GAP = 12;
const M_IND1 = 28;
const M_IND2 = 56;
const M_SPINE1 = 14;
const M_SPINE2 = 42;
/* Room for the contract label between ClearLabs and the foundation. */
const M_CONTRACT_GAP = 50;

export function StructureDiagramStacked({ selected, onSelect }: Interact) {
  const chain = selected ? chainOf(selected) : [];

  /* Depth-first, so the grandchildren sit directly beneath the parent they
     belong to and the spine reads the way a file tree does. */
  type Row = { n: OrgNode; kind: 'child' | 'gc'; y: number; h: number };
  const rows: Row[] = [];
  let y = M_ROOT_H + 16;
  children.forEach((c, i) => {
    rows.push({ n: c, kind: 'child', y, h: M_BOX_H });
    y += M_BOX_H + M_GAP;
    if (i === HOLDINGS_I) {
      holdingsChildren.forEach((g) => {
        rows.push({ n: g, kind: 'gc', y, h: M_GC_H });
        y += M_GC_H + M_GAP;
      });
    }
  });
  const mid = (r: Row) => r.y + r.h / 2;
  const childRows = rows.filter((r) => r.kind === 'child');
  const gcRows = rows.filter((r) => r.kind === 'gc');
  const last = childRows[childRows.length - 1];
  const holdings = childRows[HOLDINGS_I];
  const foundationY = y + M_CONTRACT_GAP;
  const seamY = gcRows[0].y + gcRows[0].h + M_GAP / 2;
  const it = { selected, onSelect };

  return (
    <svg className="stack" viewBox={`0 0 ${M_W} ${foundationY + M_BOX_H + 4}`} focusable="false" aria-hidden={onSelect ? undefined : true}>
      <Hatch id="hatch-s" />
      {childRows.map((r) => (
        <Edge key={r.n.id} to={r.n.id} chain={chain} d={`M ${M_SPINE1} ${M_ROOT_H} V ${mid(r)} H ${M_IND1}`} />
      ))}
      {gcRows.map((r) => (
        <Edge key={r.n.id} to={r.n.id} chain={chain} d={`M ${M_SPINE2} ${holdings.y + holdings.h} V ${mid(r)} H ${M_IND2}`} />
      ))}
      <Edge to={foundation.id} contract chain={chain} selected={selected} d={`M ${M_SPINE2} ${last.y + last.h} V ${foundationY}`} />
      <text className="cl" x={M_IND2} y={last.y + last.h + 30} aria-hidden="true">
        {contractLabel}
      </text>

      <g className="gap" aria-hidden="true">
        <line x1={M_IND2 + 40} y1={seamY - 3} x2={M_W - 40} y2={seamY - 3} />
        <line x1={M_IND2 + 40} y1={seamY + 3} x2={M_W - 40} y2={seamY + 3} />
      </g>

      <Box n={root} x={0} y={0} w={M_W} h={M_ROOT_H} extra="root" {...it} />
      {rows.map((r) => {
        const x = r.kind === 'gc' ? M_IND2 : M_IND1;
        return <Box key={r.n.id} n={r.n} x={x} y={r.y} w={M_W - x} h={r.h} {...it} />;
      })}
      <Box n={foundation} x={M_IND1} y={foundationY} w={M_W - M_IND1} h={M_BOX_H} extra="found" {...it} />
    </svg>
  );
}

/* The text alternative, in the DOM at every width (visually hidden): the
   same tree as nested lists, read from the same data. */
export function StructureList() {
  const { alt } = STRUCTURE;
  const item = (n: OrgNode) => `${n.name}, ${n.note}`;
  return (
    <div className="sr-only">
      <ul>
        <li>
          {item(root)}. {alt.owns}:
          <ul>
            {children.map((c, i) => (
              <li key={c.id}>
                {item(c)}
                {i === HOLDINGS_I && (
                  <>
                    . {alt.owns}:
                    <ul>
                      {holdingsChildren.map((g) => (
                        <li key={g.id}>{item(g)}</li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        </li>
        <li>
          {alt.outside}: {item(foundation)}. {foundation.what}
        </li>
      </ul>
    </div>
  );
}
