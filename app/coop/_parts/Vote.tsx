'use client';

import { useEffect, useRef, useState } from 'react';
import { useActive } from '@/lib/anim';
import { VOTE } from '@/content/coop';

/* The hero's stage: "We never sell the land." written twice and put to the
   same seven-seat vote. The seats fill in turn, 4 for and 3 against; the
   policy passes and is struck through, the reserved matter is blocked. It
   runs on a loop while the bento is on screen and settles on the result when
   it leaves.

   The server renders the result — every seat cast, the policy struck, the
   reserved matter blocked — which is what a reader without JS or with
   reduced motion sees (useActive never fires for them). */

type Seat = '' | 'y' | 'n';
type State = { seats: Seat[]; struck: boolean; held: boolean; polOut: string; resOut: string };

const FINAL: State = {
  seats: [...VOTE.votes],
  struck: true,
  held: true,
  polOut: VOTE.out.passes,
  resOut: VOTE.out.blocked,
};
const STEP = 260;
const LEAD = 500;
const LOOP = 7600;

function Cell({ side, state, pol }: { side: { who: string; ck: string; title: string; body: string }; state: State; pol: boolean }) {
  const isPol = pol;
  const cls = isPol ? ['cell', 'pol', state.struck && 'struck'] : ['cell', 'res', state.held && 'held'];
  return (
    <div className={cls.filter(Boolean).join(' ')}>
      <div className="c-h">
        <span className="who">{side.who}</span>
        <span className="ck">{side.ck}</span>
      </div>
      <div className="q">{VOTE.quote}</div>
      <div className="vote">
        <span>{VOTE.motion}</span>
        <span className="seats7" aria-hidden="true">
          {state.seats.map((s, i) => (
            <i key={i} className={s || undefined} />
          ))}
        </span>
        <span className="out">{isPol ? state.polOut : state.resOut}</span>
      </div>
      <div className="c-m">
        <h3>{side.title}</h3>
        <p>{side.body}</p>
      </div>
    </div>
  );
}

export function Vote() {
  const [st, setSt] = useState<State>(FINAL);
  const ref = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const loop = useRef<ReturnType<typeof setInterval>>(undefined);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = () => {
    clear();
    const blank = VOTE.votes.map(() => '' as Seat);
    setSt({ seats: blank, struck: false, held: false, polOut: VOTE.out.voting, resOut: VOTE.out.voting });
    VOTE.votes.forEach((v, k) =>
      timers.current.push(
        setTimeout(() => setSt((s) => ({ ...s, seats: s.seats.map((x, j) => (j === k ? v : x)) })), LEAD + k * STEP),
      ),
    );
    const end = LEAD + VOTE.votes.length * STEP + 300;
    timers.current.push(setTimeout(() => setSt((s) => ({ ...s, struck: true, polOut: VOTE.out.passes })), end));
    timers.current.push(setTimeout(() => setSt((s) => ({ ...s, held: true, resOut: VOTE.out.blocked })), end + 500));
  };

  useActive(
    ref,
    (on) => {
      clearInterval(loop.current);
      if (on) {
        run();
        loop.current = setInterval(run, LOOP);
      } else {
        clear();
        setSt(FINAL);
      }
    },
    { start: 'top 85%', end: 'bottom 10%' },
  );

  useEffect(
    () => () => {
      clear();
      clearInterval(loop.current);
    },
    [],
  );

  return (
    <div className="bx vs" data-stage="bento" ref={ref}>
      <Cell side={VOTE.policy} state={st} pol />
      <Cell side={VOTE.reserved} state={st} pol={false} />
    </div>
  );
}
