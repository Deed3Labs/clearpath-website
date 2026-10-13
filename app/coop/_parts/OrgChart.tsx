'use client';

import { useRef, useState } from 'react';
import { Seg, More } from '@/components/system';
import { useGsap, gsap, ScrollTrigger } from '@/lib/anim';
import { StructureDiagram, StructureDiagramStacked, StructureList, nodeOf, parentOf } from '@/components/marks/StructureDiagram';
import { STRUCTURE } from '@/content/coop';

/* 01: the org chart, the page's centrepiece. The drawing itself lives in
   components/marks/StructureDiagram; this owns what you can do with it:
   - pick a box (hover with a mouse, tap, or Enter/Space) and its line of
     ownership lights back to the root, with the detail row underneath;
   - switch to the balance-sheet view: money solid, housing in cobalt hatch,
     and the "never touch" seam between Clear Lending and Clear Properties;
   - on first sight the tree draws itself from the root down, then the
     contract line and the foundation. The server markup is the drawn tree. */

type View = 'own' | 'bs';
const S = STRUCTURE;

export function OrgChart() {
  const [view, setView] = useState<View>('own');
  const [sel, setSel] = useState(S.root.id);
  const chart = useRef<HTMLDivElement>(null);

  const n = nodeOf(sel);
  const parent = parentOf(sel);
  const by = n.by ?? `${S.detail.ownedBy} ${parent ? parent.name.replace(/^The /, 'the ') : ''}`;

  const onView = (v: View) => {
    setView(v);
    setSel(v === 'bs' ? 'prop' : S.root.id);
  };

  useGsap(chart, () => {
    const el = chart.current!;
    const svg = el.querySelector<SVGSVGElement>(window.matchMedia('(max-width: 860px)').matches ? 'svg.stack' : 'svg.wide');
    if (!svg) return;
    const edges = Array.from(svg.querySelectorAll<SVGPathElement>('.e'));
    edges.forEach((p) => {
      const L = Math.ceil(p.getTotalLength());
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
    });
    const root = svg.querySelectorAll('.n.root');
    const boxes = svg.querySelectorAll('.n:not(.root):not(.found)');
    const tail = svg.querySelectorAll('.n.found, .k, .cl');
    gsap.set(root, { opacity: 0, y: -8 });
    gsap.set(boxes, { opacity: 0, y: 8 });
    gsap.set(tail, { opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        gsap
          .timeline()
          .to(root, { opacity: 1, y: 0, duration: 0.5 })
          .to(edges, { strokeDashoffset: 0, duration: 0.8, stagger: 0.08, ease: 'power2.inOut' }, '-=.1')
          .to(boxes, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 }, '-=.6')
          .to(tail, { opacity: 1, duration: 0.6 }, '-=.1');
      },
    });
  });

  const L = S.legend;
  return (
    <div className={view === 'bs' ? 'bx org bs body-gap' : 'bx org body-gap'}>
      <div className="c-h">
        <Seg label={S.seg.label} options={S.seg.options} value={view} onChange={onView} />
        <div className="legend">
          {view === 'own' ? (
            <>
              <span><i />{L.owns}</span>
              <span><i className="ctr" />{L.contract}</span>
              <span><i className="box" />{L.ownerless}</span>
            </>
          ) : (
            <>
              <span><i className="mon" />{L.money}</span>
              <span><i className="hou" />{L.housing}</span>
            </>
          )}
        </div>
      </div>
      <div className="chart" ref={chart}>
        <StructureDiagram selected={sel} onSelect={setSel} />
        <StructureDiagramStacked selected={sel} onSelect={setSel} />
      </div>
      <div className="org-d" aria-live="polite">
        <div>
          <span className="k1">{S.detail.selected}</span>
          <span className="v1">{n.name}</span>
        </div>
        <div>
          <span className="k1">{by}</span>
          <span className="v2">{n.what}</span>
        </div>
        <div>
          <More href={S.detail.more.href}>{S.detail.more.label}</More>
        </div>
      </div>
      <div className="org-f">
        {S.foot.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
      <StructureList />
    </div>
  );
}
