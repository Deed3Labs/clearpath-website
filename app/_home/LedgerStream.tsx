'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, motionOK, useActive, useIsoLayoutEffect } from '@/lib/anim';
import { int, money } from '@/lib/format';
import { LiveDot } from '@/components/system';
import { LEDGER } from '@/content/home';

/* 05 · The public ledger. Ten sample entries are rendered on the server;
   while the section is on screen a new one arrives every 2.6 seconds, and a
   plan approved at the counter above lands at the top as "You, just now".
   A new row slides the stream down (transform) and fades in; the stream's
   box is a fixed height, so nothing outside it moves. */

type Row = { key: number; blk: string; c: string; w: string; v: number; up: boolean; mine: boolean };

const EV = LEDGER.events;

/* The sample stream is deterministic, so the server and the browser draw
   the same ten rows. */
function maker() {
  let blk = LEDGER.firstBlock;
  let ei = 0;
  let key = 0;
  const row = (c: string, w: string, v: number, up: boolean, mine: boolean): Row => {
    blk += 3 + ((ei * 7) % 11);
    return { key: key++, blk: mine ? LEDGER.mine.who : `#${int(blk)}`, c, w, v, up, mine };
  };
  const next = () => {
    const [c, w, v, up] = EV[ei++ % EV.length];
    return row(c, w, v, up, false);
  };
  const mine = (split: string) => row(LEDGER.mine.contract, LEDGER.mine.event(split), LEDGER.mine.amount, false, true);
  return { next, mine };
}

function initial() {
  const m = maker();
  return { m, rows: Array.from({ length: 10 }, () => m.next()) };
}

/* Keep eleven rows, never dropping one of yours. */
function trim(rows: Row[]) {
  const out = [...rows];
  for (let i = out.length - 1; i >= 0 && out.length > 11; i--) if (!out[i].mine) out.splice(i, 1);
  return out;
}

export function LedgerStream() {
  const [state] = useState(initial);
  const [rows, setRows] = useState<Row[]>(state.rows);
  const root = useRef<HTMLDivElement>(null);
  const stream = useRef<HTMLDivElement>(null);
  const on = useRef(false);
  const pushed = useRef(false);

  const push = (r: Row) => {
    pushed.current = true;
    setRows((cur) => trim([r, ...cur]));
  };

  useActive(root, (a) => (on.current = a), { start: 'top 85%', end: 'bottom 15%' });

  useEffect(() => {
    if (!motionOK()) return;
    const id = window.setInterval(() => {
      if (on.current) push(state.m.next());
    }, 2600);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    const onPlan = (e: Event) => push(state.m.mine((e as CustomEvent<{ split: string }>).detail.split));
    window.addEventListener('clear:plan', onPlan);
    return () => window.removeEventListener('clear:plan', onPlan);
  }, [state]);

  useIsoLayoutEffect(() => {
    if (!pushed.current || !motionOK() || !stream.current) return;
    pushed.current = false;
    const first = stream.current.firstElementChild as HTMLElement | null;
    if (!first) return;
    const h = first.offsetHeight;
    const a = gsap.from(stream.current, { y: -h, duration: 0.55, ease: 'power3.out' });
    const b = gsap.from(first, { opacity: 0, duration: 0.55, ease: 'power3.out' });
    return () => {
      a.progress(1).kill();
      b.progress(1).kill();
    };
  }, [rows]);

  return (
    <div className="led body-gap" ref={root}>
      <div className="led-head label">
        <span className="blk">{LEDGER.cols.block}</span>
        <span>{LEDGER.cols.contract}</span>
        <span className="ev2">{LEDGER.cols.event}</span>
        <span>{LEDGER.cols.amount}</span>
      </div>
      <div className="led-body">
        <div ref={stream}>
          {rows.map((r) => (
            <div key={r.key} className={'ev' + (r.mine ? ' mine' : '')}>
              <span className="blk">{r.blk}</span>
              <span>{r.c}</span>
              <span className="ev2">{r.w}</span>
              <span className={'val' + (r.up ? ' up' : '')}>{money(r.v)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="led-foot label">
        <span className="on">
          <LiveDot />
          {LEDGER.foot.live}
        </span>
        <span>{LEDGER.foot.status}</span>
      </div>
    </div>
  );
}
