'use client';

import { useEffect, useRef, useState } from 'react';
import { useActive } from '@/lib/anim';
import { PROTECTIONS } from '@/content/capital';

/* 03: the public ledger, streaming. Five rows are on the page from the start
   (the server render, and what a reader without motion sees). While the cell
   is on screen a new entry arrives every 2.2s: it slides in above the top
   row, the rest step down one row, and anything below the fifth fades and is
   dropped. Positions are transforms, so nothing reflows. */

const { events, ages } = PROTECTIONS.ledger;
const RH = 37;
const SHOW = 5;

type Row = { id: number; a: string; b: string; age: string; pos: number; op: number; fresh: boolean };

const initial: Row[] = Array.from({ length: SHOW }, (_, i) => ({
  id: i,
  a: events[i % events.length][0],
  b: events[i % events.length][1],
  age: ages[i],
  pos: i,
  op: 1,
  fresh: i === 0,
}));

export function PublicLedger() {
  const [rows, setRows] = useState(initial);
  const next = useRef(SHOW);
  const ref = useRef<HTMLDivElement>(null);
  const timers = useRef<{ iv?: ReturnType<typeof setInterval>; t: ReturnType<typeof setTimeout>[]; raf: number[] }>({ t: [], raf: [] });

  function tick() {
    const n = next.current++;
    const [a, b] = events[n % events.length];
    setRows((r) => [
      { id: n, a, b, age: ages[0], pos: -1, op: 0, fresh: true },
      ...r.map((x, i) => ({ ...x, fresh: false, age: ages[Math.min(i + 1, ages.length - 1)] })),
    ]);
    /* Two frames, so the new row is painted at its start before it moves.
       The previous tick's handles have all fired by now (2.2s apart). */
    const T = timers.current;
    T.t = [];
    T.raf = [];
    T.raf.push(
      requestAnimationFrame(() =>
        T.raf.push(requestAnimationFrame(() => setRows((r) => r.map((x, i) => ({ ...x, pos: i, op: i >= SHOW ? 0 : 1 }))))),
      ),
    );
    T.t.push(setTimeout(() => setRows((r) => r.slice(0, SHOW)), 700));
  }

  useActive(
    ref,
    (on) => {
      const T = timers.current;
      clearInterval(T.iv);
      if (on) T.iv = setInterval(tick, 2200);
    },
    { start: 'top 90%', end: 'bottom 10%' },
  );

  useEffect(() => {
    const T = timers.current;
    return () => {
      clearInterval(T.iv);
      T.t.forEach(clearTimeout);
      T.raf.forEach(cancelAnimationFrame);
    };
  }, []);

  return (
    <div className="pl" aria-hidden="true" ref={ref}>
      {rows.map((r) => (
        <div
          key={r.id}
          className={r.fresh ? 'pl-row new' : 'pl-row'}
          style={{ transform: `translateY(${r.pos * RH}px)`, opacity: r.op }}
        >
          <i className="d" />
          <b>{r.a}</b>
          <span className="s">{r.b}</span>
          <span className="t">{r.age}</span>
        </div>
      ))}
    </div>
  );
}
