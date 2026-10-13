'use client';

import { useRef } from 'react';
import { useHeroIntro, useTrace, rr } from '@/lib/anim';
import { Person } from '@/components/system/icons';
import { BOARDS } from '@/content/capital';

/* The hero's stage: two boards side by side, a seam between them that
   neither crosses. After the bento arrives the co-op board seats itself, the
   Holdings board follows a beat behind, and light runs round the first
   investor seat on a loop — the one place outside money sits. */

type Seat = (typeof BOARDS.coop.seats)[number];

function Seats({ seats, id, invRef }: { seats: readonly Seat[]; id: string; invRef?: React.Ref<HTMLSpanElement> }) {
  let firstInv = true;
  return (
    <div className="seats" id={id}>
      {seats.map((s, i) => {
        const isFirstInv = s.kind === 'inv' && firstInv;
        if (isFirstInv) firstInv = false;
        return (
          <span key={i} className={['seat', s.kind].filter(Boolean).join(' ')} ref={isFirstInv ? invRef : undefined}>
            <Person />
            <b>
              {s.role}
              <small>{s.tag}</small>
            </b>
          </span>
        );
      })}
    </div>
  );
}

export function Boards() {
  const root = useRef<HTMLDivElement>(null);
  const inv = useRef<HTMLSpanElement>(null);
  const trace = useTrace(inv, (w, h) => rr(0.5, 0.5, w - 1, h - 1, 0.01, 'top'), { seg: 70, speed: 220 });

  useHeroIntro(root, (tl, hero) => {
    tl.from(hero.querySelectorAll('#seats-co .seat'), { opacity: 0, y: 10, duration: 0.5, stagger: 0.07 }, '-=.4')
      .from(hero.querySelectorAll('#seats-h .seat'), { opacity: 0, y: 10, duration: 0.5, stagger: 0.07 }, '<.15')
      .add(() => trace.current.run({ repeat: -1, repeatDelay: 2.4 }), '+=.2');
  });

  const { coop, holdings } = BOARDS;
  return (
    <div className="bx boards" data-stage="bento" ref={root}>
      <div className="cell">
        <div className="c-h">
          <span className="who">{coop.who}</span>
          <span className="ck">{coop.ck}</span>
        </div>
        <div className="line2">{coop.line}</div>
        <Seats seats={coop.seats} id="seats-co" />
        <div className="c-m">
          <p>{coop.body}</p>
        </div>
      </div>
      <div className="cell">
        <div className="c-h">
          <span className="who">{holdings.who}</span>
          <span className="ck">{holdings.ck}</span>
        </div>
        <div className="line2">{holdings.line}</div>
        <Seats seats={holdings.seats} id="seats-h" invRef={inv} />
        <div className="c-m">
          <p>{holdings.body}</p>
        </div>
      </div>
      <div className="c-f">
        <span>{BOARDS.foot}</span>
        <span className="ck">{BOARDS.footCk}</span>
      </div>
    </div>
  );
}
