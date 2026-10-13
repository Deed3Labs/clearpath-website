'use client';

import { Fragment, useRef, useSyncExternalStore } from 'react';
import { useGsap, useScrub, useTrace, rr, gsap, ScrollTrigger, motionOK } from '@/lib/anim';
import { money } from '@/lib/format';
import type { MOTION } from '@/content/style';

/* 07: the four moves, each run on the site's own engine (lib/anim). They run
   once when the bento arrives — the rise, then the trace, then the count —
   and each can be replayed.

   The server renders every one finished: the words up, the scrub full, the
   outlines at rest, the figure at its value. With reduced motion nothing
   runs and that is what stays, so the replay buttons (which would do
   nothing) are only shown when motion is allowed. */

type M = typeof MOTION;

const subscribe = () => () => {};
const useMotionOK = () => useSyncExternalStore(subscribe, motionOK, () => false);

const box = (w: number, h: number) => rr(0.5, 0.5, w - 1, h - 1, 0.01, 'top');

function ReplayIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M10 6a4 4 0 1 1-1.2-2.8M10 1.5V4H7.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function MotionDemos({ m }: { m: M }) {
  const root = useRef<HTMLDivElement>(null);
  const rise = useRef<HTMLDivElement>(null);
  const scrub = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const tb1 = useRef<HTMLSpanElement>(null);
  const tb2 = useRef<HTMLSpanElement>(null);
  const cnt = useRef<HTMLSpanElement>(null);
  const ctx = useRef<gsap.Context | null>(null);
  const motion = useMotionOK();

  const live = useTrace(tb1, box, { seg: 70, speed: 240 });
  const quiet = useTrace(tb2, box, { seg: 70, speed: 240, className: 'quiet' });

  useScrub(
    scrub,
    (p) => {
      if (fill.current) fill.current.style.transform = `scaleX(${p})`;
      if (pct.current) pct.current.textContent = String(Math.round(p * 100));
    },
    { start: 'top 85%', end: 'bottom 20%', scrub: 0.3 },
  );

  const runRise = () => {
    const el = rise.current;
    if (!el) return;
    el.classList.remove('revealed');
    el.classList.add('masked');
    gsap.fromTo(
      el.querySelectorAll('.w > span'),
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        overwrite: true,
        onComplete: () => {
          el.classList.remove('masked');
          el.classList.add('revealed');
        },
      },
    );
  };
  const runTrace = () => {
    live.current.run();
    quiet.current.run();
  };
  const count = useRef<gsap.core.Tween | null>(null);
  const runCount = () => {
    const el = cnt.current;
    if (!el) return;
    count.current?.kill();
    const o = { v: 0 };
    count.current = gsap.to(o, {
      v: m.count.to,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = money(Math.round(o.v / 100) * 100, 0);
      },
    });
  };
  const runs = { rise: runRise, trace: runTrace, count: runCount };
  const replay = (k: keyof typeof runs) => ctx.current?.add(() => runs[k]());

  useGsap(root, (self) => {
    ctx.current = self;
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        runRise();
        gsap.delayedCall(0.4, runTrace);
        gsap.delayedCall(0.6, runCount);
      },
    });
    return () => {
      ctx.current = null;
      if (cnt.current) cnt.current.textContent = money(m.count.to, 0);
      rise.current?.classList.remove('masked');
      rise.current?.classList.add('revealed');
    };
  });

  const replayButton = (k: keyof typeof runs, who: string) =>
    motion ? (
      <button type="button" className="replay" onClick={() => replay(k)} aria-label={`${m.replay}: ${who}`}>
        <ReplayIcon />
        {m.replay}
      </button>
    ) : null;

  const words = m.rise.text.split(' ');

  return (
    <div ref={root} className="bx g2 body-gap mo">
      <div className="cell">
        <div className="c-h">
          <span className="who">{m.rise.who}</span>
          <span className="ck">{m.rise.ck}</span>
        </div>
        <div className="c-m">
          <div className="stg">
            <div className="rise revealed" ref={rise}>
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span className="w">
                    <span>{w}</span>
                  </span>
                  {i < words.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </div>
            {replayButton('rise', m.rise.who)}
          </div>
          <p>{m.rise.body}</p>
        </div>
      </div>

      <div className="cell">
        <div className="c-h">
          <span className="who">{m.scrub.who}</span>
          <span className="ck">{m.scrub.ck}</span>
        </div>
        <div className="c-m">
          <div className="stg">
            <div className="scrub" ref={scrub} aria-hidden="true">
              <i ref={fill} />
            </div>
            <span className="code">
              {m.scrub.readout} · <span ref={pct}>100</span>%
            </span>
          </div>
          <p>{m.scrub.body}</p>
        </div>
      </div>

      <div className="cell">
        <div className="c-h">
          <span className="who">{m.trace.who}</span>
          <span className="ck">{m.trace.ck}</span>
        </div>
        <div className="c-m">
          <div className="stg">
            <div className="trbox">
              <div>
                <span className="tb" ref={tb1} aria-hidden="true" />
                <span>{m.trace.live}</span>
              </div>
              <div>
                <span className="tb" ref={tb2} aria-hidden="true" />
                <span>{m.trace.quiet}</span>
              </div>
            </div>
            {replayButton('trace', m.trace.who)}
          </div>
          <p>{m.trace.body}</p>
        </div>
      </div>

      <div className="cell">
        <div className="c-h">
          <span className="who">{m.count.who}</span>
          <span className="ck">{m.count.ck}</span>
        </div>
        <div className="c-m">
          <div className="stg">
            <span className="cnt" ref={cnt}>
              {money(m.count.to, 0)}
            </span>
            {replayButton('count', m.count.who)}
          </div>
          <p>{m.count.body}</p>
        </div>
      </div>
    </div>
  );
}
