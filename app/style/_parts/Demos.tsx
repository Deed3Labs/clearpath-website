'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Seg, Knob, type SegOption } from '@/components/system';
import { useGsap, gsap, ScrollTrigger } from '@/lib/anim';

/* The guide's working examples. Each is the site's own component; only the
   wiring that makes it a demonstration lives here. */

/* 06: the segmented toggle, holding its own choice. */
export function SegDemo<T extends string>({ label, options }: { label: string; options: readonly SegOption<T>[] }) {
  const [value, setValue] = useState<T>(options[0].value);
  return <Seg label={label} options={options} value={value} onChange={setValue} />;
}

/* 06: the rail. On a page the line is scrubbed by scroll (Rail, useRail);
   here it runs on its own, on a loop while it is in view, so it can be seen
   without scrolling. It is the site's .rail, .rail-fill and Knob, drawn
   finished on the server: every column reached, the line full. */
export function RailDemo({ steps }: { steps: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const el = ref.current!;
    const fill = el.querySelector<HTMLElement>(':scope > .rail-fill')!;
    const cells = Array.from(el.querySelectorAll<HTMLElement>(':scope > div'));
    const set = (p: number) => {
      fill.style.transform = `scaleX(${p})`;
      cells.forEach((c, i) => c.classList.toggle('reached', p >= (i + 0.5) / cells.length - 0.001));
    };
    const o = { p: 0 };
    const loop = gsap.to(o, { p: 1, duration: 3, ease: 'none', repeat: -1, repeatDelay: 1, paused: true, onUpdate: () => set(o.p) });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      end: 'bottom 10%',
      onToggle: (s) => (s.isActive ? loop.play() : loop.pause()),
    });
    return () => {
      fill.style.transform = '';
      set(1);
    };
  });
  return (
    <div ref={ref} className="bx rail raild">
      <span className="rail-fill" aria-hidden="true" />
      {steps.map((s) => (
        <div className="reached" key={s}>
          <Knob />
          {s}
        </div>
      ))}
    </div>
  );
}

/* 05: three columns on subgrid, and the same three without it. Dashed guides
   sit on the line where each figure starts: one line when the rows are
   shared, two when they are not. They are measured, so they appear once
   the page can measure them. */
export function SubgridDemo({
  who,
  seg,
  cols,
  children,
}: {
  who: string;
  seg: { label: string; on: string; off: string };
  cols: readonly { h: string; p: string }[];
  children: ReactNode;
}) {
  const [mode, setMode] = useState<'on' | 'off'>('on');
  const [guides, setGuides] = useState<{ a: number; b: number } | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sg = grid.current;
    if (!sg) return;
    const place = () => {
      const top = sg.getBoundingClientRect().top;
      const ys = Array.from(sg.querySelectorAll('.fgr')).map((f) => f.getBoundingClientRect().top - top);
      setGuides({ a: Math.min(...ys), b: Math.max(...ys) });
    };
    const raf = requestAnimationFrame(place);
    const ro = new ResizeObserver(place);
    ro.observe(sg);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode]);

  return (
    <div className="cell full">
      <div className="c-h">
        <span className="who">{who}</span>
        <Seg
          label={seg.label}
          options={[
            { value: 'on', label: seg.on },
            { value: 'off', label: seg.off },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <div className="c-m">
        <div className="guides">
          <div className={mode === 'off' ? 'sgdemo off' : 'sgdemo'} ref={grid}>
            {cols.map((c) => (
              <div key={c.h}>
                <h4>{c.h}</h4>
                <span className="fgr" aria-hidden="true" />
                <p>{c.p}</p>
              </div>
            ))}
          </div>
          {guides && (
            <>
              <span className="gl" aria-hidden="true" style={{ top: guides.a }} />
              <span className="gl" aria-hidden="true" style={{ top: guides.b }} data-off={guides.b - guides.a > 1 ? undefined : ''} />
            </>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

/* 04: the spacing bars grow in, once, as the scale arrives. */
export function GrowBars({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    gsap.from(ref.current!.querySelectorAll('.bar'), {
      scaleX: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
    });
  });
  return (
    <div ref={ref} className="sp">
      {children}
    </div>
  );
}
