'use client';

import { useRef } from 'react';
import { useHeroIntro, useTrace, rr } from '@/lib/anim';
import { Person } from '@/components/system/icons';
import { BOARDS } from '@/content/capital';

/* The hero's stage: two boards side by side, a seam between them that
   neither crosses. After the bento arrives the co-op board seats itself, the
   Holdings board follows a beat behind, and light runs round the two
   investor seats together on a loop — the pair is the one place outside
   money sits. */

type Seat = (typeof BOARDS.coop.seats)[number];

function Seats({ seats, id, seatsRef }: { seats: readonly Seat[]; id: string; seatsRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div className="seats" id={id} ref={seatsRef}>
      {seats.map((s, i) => {
        return (
          <span key={i} className={['seat', s.kind].filter(Boolean).join(' ')}>
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
  const held = useRef<HTMLDivElement>(null);
  /* Round the outside of both investor seats, measured from the seats
     themselves, so it follows them when the row wraps on a phone. */
  const trace = useTrace(
    held,
    (_w, _h, host) => {
      const s = Array.from(host.querySelectorAll<HTMLElement>('.seat.inv'));
      if (!s.length) return 'M 0 0';
      const o = 4;
      const L = Math.min(...s.map((e) => e.offsetLeft)), T = Math.min(...s.map((e) => e.offsetTop));
      const R = Math.max(...s.map((e) => e.offsetLeft + e.offsetWidth)), B = Math.max(...s.map((e) => e.offsetTop + e.offsetHeight));
      return rr(L - o, T - o, R - L + o * 2, B - T + o * 2, 0.01, 'top');
    },
    { seg: 110, speed: 260 },
  );

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
        <Seats seats={holdings.seats} id="seats-h" seatsRef={held} />
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
