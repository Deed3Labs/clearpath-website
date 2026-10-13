'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, motionOK, useInView, useIsoLayoutEffect, useTrace } from '@/lib/anim';
import { money } from '@/lib/format';
import { Qr, Check, Mark, LiveDot } from '@/components/system';
import { COUNTER } from '@/content/home';

/* 03 · The counter: two columns, one hand-off. Each column is one surface
   moving through its own states; its header rule is that side's progress.
   The shop keys in the charge and shows a code, light runs along the header
   rules to your side, you pick a split and approve, and the light runs back.

   The server renders the flow resting mid-way with your turn open — code on
   the shop's screen, the split picker on yours — which is what a reader with
   no JavaScript or with reduced motion sees, and it still works by hand from
   there. With motion it resets on mount and runs itself when it comes into
   view; your side only moves on its own while you can see it. */

const S = COUNTER.shop;
const Y = COUNTER.you;
const SPLITS = COUNTER.splits;

type ShopState = 'enter' | 'code' | 'paid';
type YouState = 'idle' | 'notify' | 'pick' | 'done';
type Tone = '' | 'wait' | 'ok';
type SideOf<T> = { state: T; step: number; final: boolean };
type Flow = {
  shop: SideOf<ShopState>;
  you: SideOf<YouState>;
  turn: 'shop' | 'you' | null;
  shopSt: [string, Tone];
  youSt: [string, Tone];
  ticket: number;
  scanned: boolean;
  scanning: boolean;
  spent: boolean;
  clock: number;
  pick: number;
  shown: number;
  swap: boolean;
  ask: boolean;
  done: { i: number; secs: number } | null;
};

/* Mid-flow, your turn open: the mockup's no-motion branch. */
const REST: Flow = {
  shop: { state: 'code', step: 2, final: false },
  you: { state: 'pick', step: 2, final: false },
  turn: 'you',
  shopSt: [S.status.waiting, 'wait'],
  youSt: [Y.status.notCharged, 'wait'],
  ticket: S.amount,
  scanned: true,
  scanning: false,
  spent: false,
  clock: 0,
  pick: COUNTER.defaultSplit,
  shown: COUNTER.defaultSplit,
  swap: false,
  ask: true,
  done: null,
};

const START: Flow = {
  ...REST,
  shop: { state: 'enter', step: 1, final: false },
  you: { state: 'idle', step: 0, final: false },
  turn: 'shop',
  shopSt: [S.status.entering, ''],
  youSt: [Y.status.none, ''],
  ticket: 0,
  scanned: false,
  ask: false,
};

const fee = (v: number) => Math.round(v * 2.5) / 100;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const planName = (n: number) => (n === 1 ? Y.planName.once : `${Y.planName.many}${n}`);

function Prog({ step, final }: { step: number; final: boolean }) {
  return (
    <span className="prog" aria-hidden="true">
      {[0, 1, 2].map((k) => {
        const done = k < step - 1 || (final && k === step - 1);
        const on = !final && k === step - 1;
        return <i key={k} className={done ? 'done' : on ? 'on' : undefined} />;
      })}
    </span>
  );
}

export function CounterFlow() {
  const [f, setF] = useState<Flow>(REST);
  const patch = (p: Partial<Flow> | ((f: Flow) => Partial<Flow>)) =>
    setF((cur) => ({ ...cur, ...(typeof p === 'function' ? p(cur) : p) }));

  const flowRef = useRef<HTMLDivElement>(null);
  const shopCol = useRef<HTMLDivElement>(null);
  const youCol = useRef<HTMLDivElement>(null);
  const youStage = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const segRef = useRef<HTMLDivElement>(null);
  const btn = {
    show: useRef<HTMLButtonElement>(null),
    review: useRef<HTMLButtonElement>(null),
    approve: useRef<HTMLButtonElement>(null),
  };

  const G = useRef(false);
  const stage = useRef<'enter' | 'code' | 'notify' | 'pick' | 'done'>('pick');
  const pick = useRef<number>(COUNTER.defaultSplit);
  const touched = useRef(false);
  const youSeen = useRef(false);
  const visible = useRef(true);
  const timers = useRef<number[]>([]);
  const tick = useRef<number | undefined>(undefined);
  const elapsed = useRef(0);
  const animSeg = useRef<{ delay: number } | null>(null);

  /* The hand-off runs along the header rules: from the end of the shop's
     second step to the end of your first. Stacked, it runs down the wall. */
  const rule = (col: HTMLDivElement | null) => {
    if (!col) return 0;
    const h = col.querySelector<HTMLElement>('.c-h');
    return col.offsetTop + (h?.offsetHeight ?? 0) - 0.5;
  };
  const stacked = () => (youCol.current?.offsetTop ?? 0) > 0;
  const handoff = useTrace(
    flowRef,
    (w) => {
      const ys = rule(shopCol.current), yy = rule(youCol.current);
      const ws = shopCol.current?.offsetWidth ?? 0, wy = youCol.current?.offsetWidth ?? 0;
      return stacked()
        ? `M ${(w * 2) / 3} ${ys} L ${w + 0.5} ${ys} L ${w + 0.5} ${yy} L ${w / 3} ${yy}`
        : `M ${(ws * 2) / 3} ${ys} L ${ws + wy / 3} ${yy}`;
    },
    { seg: 150, speed: 760 },
  );
  const handback = useTrace(
    flowRef,
    (w) => {
      const ys = rule(shopCol.current), yy = rule(youCol.current);
      const ws = shopCol.current?.offsetWidth ?? 0;
      return stacked()
        ? `M ${(w * 2) / 3} ${yy} L ${w + 0.5} ${yy} L ${w + 0.5} ${ys} L ${(w * 2) / 3} ${ys}`
        : `M ${w} ${yy} L ${(ws * 2) / 3} ${ys}`;
    },
    { seg: 150, speed: 900 },
  );

  /* Timers belong to one run, so "Run it again" never inherits a stray step. */
  const later = (sec: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, sec * 1000));
  };
  const cancel = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const whenSeen = (sec: number, fn: () => void) => later(sec, () => (youSeen.current ? fn() : whenSeen(0.5, fn)));
  const press = (b: HTMLButtonElement | null, fn: () => void) => {
    b?.classList.add('hit');
    later(0.16, () => {
      b?.classList.remove('hit');
      fn();
    });
  };
  const qrRects = () => Array.from(scanRef.current?.querySelectorAll('rect') ?? []);

  /* The clock measures the visitor, and only while they are looking at it. */
  const clockOn = () => {
    elapsed.current = 0;
    let last = Date.now();
    clearInterval(tick.current);
    patch({ clock: 0 });
    tick.current = window.setInterval(() => {
      const now = Date.now();
      if (visible.current) elapsed.current += now - last;
      last = now;
      patch({ clock: Math.floor(elapsed.current / 1000) });
    }, 250);
  };

  const paint = (i: number, animate: boolean) => {
    pick.current = i;
    if (!animate) return patch({ pick: i, shown: i });
    patch({ pick: i, swap: true });
    /* Swap, never count: a tween would pass through figures no split produces. */
    window.setTimeout(() => {
      if (G.current) animSeg.current = { delay: 0 };
      patch({ shown: i, swap: false });
    }, 150);
  };

  const reset = () => {
    cancel();
    clearInterval(tick.current);
    handoff.current.kill();
    handback.current.kill();
    stage.current = 'enter';
    touched.current = false;
    pick.current = COUNTER.defaultSplit;
    const rects = qrRects();
    gsap.killTweensOf(rects);
    gsap.set(rects, { opacity: G.current ? 0 : 1 });
    setF(START);
  };

  const toCode = () => {
    if (stage.current !== 'enter') return;
    stage.current = 'code';
    cancel();
    patch({ ticket: S.amount, shop: { state: 'code', step: 2, final: false }, shopSt: [S.status.code, 'wait'] });
    if (G.current) gsap.to(qrRects(), { opacity: 1, duration: 0.02, stagger: { each: 0.0012, from: 'random' }, delay: 0.25 });
    else gsap.set(qrRects(), { opacity: 1 });
    later(0.9, () => {
      patch({ scanning: true });
      clockOn();
    });
    later(G.current ? 3.3 : 0, scanned);
  };

  const scanned = () => {
    patch({ scanning: false, scanned: true, shopSt: [S.status.waiting, 'wait'], turn: null });
    handoff.current.run({ ease: 'power2.inOut', done: toNotify });
  };

  const toNotify = () => {
    stage.current = 'notify';
    patch({ turn: 'you', you: { state: 'notify', step: 1, final: false }, youSt: [Y.status.notCharged, 'wait'] });
    if (G.current) whenSeen(2.2, () => stage.current === 'notify' && press(btn.review.current, toPick));
  };

  const toPick = () => {
    if (stage.current !== 'notify') return;
    stage.current = 'pick';
    cancel();
    if (G.current) animSeg.current = { delay: 0.3 };
    patch({ you: { state: 'pick', step: 2, final: false }, ask: true });
    /* If nobody touches it, it finishes on its own so the hand-back is seen. */
    if (G.current) whenSeen(9, () => stage.current === 'pick' && !touched.current && press(btn.approve.current, approve));
  };

  const approve = () => {
    if (stage.current !== 'pick') return;
    stage.current = 'done';
    cancel();
    clearInterval(tick.current);
    const i = pick.current;
    const secs = Math.max(1, Math.round(elapsed.current / 1000));
    patch({
      done: { i, secs },
      you: { state: 'done', step: 3, final: true },
      youSt: [Y.status.approved, 'ok'],
      turn: null,
      spent: true,
    });
    window.dispatchEvent(new CustomEvent('clear:plan', { detail: { split: SPLITS[i].label } }));
    handback.current.run({
      ease: 'power2.inOut',
      done: () => patch({ shop: { state: 'paid', step: 3, final: true }, shopSt: [S.status.paid, 'ok'] }),
    });
  };

  const run = () => {
    reset();
    [9, 94, 940, 94000].forEach((c, i) => later(0.35 + i * 0.28, () => patch({ ticket: c / 100 })));
    later(1.9, () => stage.current === 'enter' && press(btn.show.current, toCode));
  };

  /* Motion: start from the top, before anything paints. */
  useIsoLayoutEffect(() => {
    G.current = motionOK();
    if (G.current) reset();
    return () => {
      cancel();
      clearInterval(tick.current);
      gsap.killTweensOf(qrRects());
    };
  }, []);

  /* On arrival: the shop keys it in, then hands it across. */
  useInView(flowRef, run, { start: 'top 70%' });

  useEffect(() => {
    const ys = youStage.current, fl = flowRef.current;
    if (!ys || !fl) return;
    const a = new IntersectionObserver((es) => es.forEach((e) => (youSeen.current = e.isIntersecting)), { threshold: 0.5 });
    const b = new IntersectionObserver((es) => es.forEach((e) => (visible.current = e.isIntersecting)));
    a.observe(ys);
    b.observe(fl);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  /* The split bar draws in when it changes, or when the picker opens. */
  useIsoLayoutEffect(() => {
    const a = animSeg.current;
    if (!a || !segRef.current) return;
    animSeg.current = null;
    const t = gsap.from(segRef.current.children, { scaleX: 0, duration: 0.45, stagger: 0.03, ease: 'power3.out', delay: a.delay });
    return () => {
      t.kill();
    };
  }, [f.shown, f.you.state]);

  const shown = SPLITS[f.shown];
  const doneI = f.done?.i ?? COUNTER.defaultSplit;
  const doneT = SPLITS[doneI];
  const on = (cur: string, st: string) => (cur === st ? ' on' : '');

  return (
    <div className="duo3 body-gap" ref={flowRef}>
      {/* The shop's side, one surface moving through its states */}
      <div ref={shopCol} className={'col shop' + (f.turn === 'shop' ? ' active' : '')}>
        <div className="c-h">
          <span className="who">{S.who}</span>
          <span className="now">{f.shop.step ? S.steps[f.shop.step - 1] : S.steps[0]}</span>
          <Prog step={f.shop.step} final={f.shop.final} />
        </div>
        <div className="c-stage">
          <div className={'state' + on(f.shop.state, 'enter')}>
            <span className="ck">{S.ticket}</span>
            <div className="amt-row">
              <span className="fig big-fig">{money(f.ticket)}</span>
              <span className="memo2">{S.memo}</span>
            </div>
            <dl className="pay">
              <div>
                <dt>{S.fee}</dt>
                <dd>{money(fee(f.ticket))}</dd>
              </div>
              <div className="pos">
                <dt>{S.net}</dt>
                <dd>{money(f.ticket - fee(f.ticket))}</dd>
              </div>
            </dl>
            <button type="button" ref={btn.show} className="btn act" data-variant="primary" onClick={toCode}>
              {S.showCode}
            </button>
          </div>
          <div className={'state mid' + on(f.shop.state, 'code')}>
            <div ref={scanRef} className={'scan' + (f.scanning ? ' scanning' : '') + (f.spent ? ' spent' : '')}>
              <Qr className="qr" />
              <span className="scanline" aria-hidden="true" />
              <span className="okmark" hidden={!f.spent}>
                <Check />
              </span>
            </div>
            <div className="code-cap">
              <span className="fig">{money(S.amount)}</span>
              <p className="memo2">{f.scanned ? S.scannedCap : S.codeCap}</p>
            </div>
            <div className="clock2">
              <span className="ck">{S.elapsed}</span>
              <span className="fig">{fmt(f.clock)}</span>
            </div>
          </div>
          <div className={'state' + on(f.shop.state, 'paid')}>
            <span className="ok-l">
              <Check />
              {S.approved}
            </span>
            <div className="amt-row">
              <span className="fig big-fig">{money(S.paidNet)}</span>
              <span className="memo2">{S.paidMemo}</span>
            </div>
            <dl className="pay">
              <div>
                <dt>{S.paidRows.ticket}</dt>
                <dd>{money(S.amount)}</dd>
              </div>
              <div>
                <dt>{S.paidRows.plan}</dt>
                <dd>{planName(doneT.n)}</dd>
              </div>
              <div className="pos">
                <dt>{S.paidRows.time}</dt>
                <dd>{fmt(f.done?.secs ?? 0)}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="c-f">
          <span className={'st ' + f.shopSt[1]}>
            <i />
            <span>{f.shopSt[0]}</span>
          </span>
          <span className="ck">{S.device}</span>
        </div>
      </div>

      {/* Your side, which only starts when the shop hands off */}
      <div
        ref={youCol}
        className={'col you' + (f.turn === 'you' ? ' active' : '')}
        onPointerDown={() => (touched.current = true)}
      >
        <div className="c-h">
          <span className="who">{Y.who}</span>
          <span className="now">{f.you.step ? Y.steps[f.you.step - 1] : Y.waiting}</span>
          <Prog step={f.you.step} final={f.you.final} />
        </div>
        <div className="c-stage" ref={youStage}>
          <div className={'state mid' + on(f.you.state, 'idle')}>
            <Mark className="idle-mark" />
            <p className="memo2">{Y.idle}</p>
          </div>
          <div className={'state' + on(f.you.state, 'notify')}>
            <div className="notif3">
              <span className="n-h">
                <Mark />
                {Y.notifyApp}
                <span className="ck">{Y.notifyWhen}</span>
              </span>
              <span className="n-b">
                <b>{Y.notify[0]}</b>
                {Y.notify[1]}
                <b>{Y.notify[2]}</b>
                {Y.notify[3]}
              </span>
              <span className="ck">{Y.notifySub}</span>
            </div>
            <button type="button" ref={btn.review} className="btn act" data-variant="primary" onClick={toPick}>
              {Y.review}
            </button>
          </div>
          <div className={'state' + on(f.you.state, 'pick')}>
            <span className="ck">{Y.pickQ}</span>
            <div className={'choose' + (f.ask ? ' ask' : '')} role="group" aria-label={Y.pickGroup}>
              {SPLITS.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  aria-pressed={f.pick === i}
                  onClick={() => {
                    touched.current = true;
                    paint(i, true);
                    patch({ ask: false });
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="fsegs" ref={segRef} aria-hidden="true">
              {Array.from({ length: shown.n }, (_, k) => (
                <span key={`${f.shown}-${k}`} />
              ))}
            </div>
            <div className={'result' + (f.swap ? ' swap' : '')} aria-live="polite">
              <div className="r-main">
                <span className="fig big-fig">{money(shown.each)}</span>
                <span className="r-unit">{shown.n === 1 ? Y.each.once : Y.each.many}</span>
              </div>
              <div className="r-row">
                <div>
                  <span className="ck">{Y.total}</span>
                  <span className="fig">{money(shown.total)}</span>
                </div>
                <div>
                  <span className="ck">{Y.carry}</span>
                  <span className="fig">{money(shown.carry)}</span>
                </div>
                <div>
                  <span className="ck">{Y.doneBy}</span>
                  <span className="fig">{shown.done}</span>
                </div>
              </div>
            </div>
            <div className="act2">
              <button type="button" ref={btn.approve} className="btn act" data-variant="primary" onClick={approve}>
                <LiveDot />
                {Y.approve}
              </button>
              <span className="memo2">{Y.approveNote}</span>
            </div>
          </div>
          <div className={'state' + on(f.you.state, 'done')}>
            <span className="ok-l">
              <Check />
              {Y.approved}
            </span>
            <div className="r-main">
              <span className="fig big-fig">{money(doneT.each)}</span>
              <span className="r-unit">{doneT.n === 1 ? Y.each.once : Y.each.many}</span>
            </div>
            <dl className="pay">
              <div>
                <dt>{Y.doneRows.plan}</dt>
                <dd>{planName(doneT.n)}</dd>
              </div>
              <div>
                <dt>{Y.doneRows.total}</dt>
                <dd>{money(doneT.total)}</dd>
              </div>
              <div>
                <dt>{Y.doneRows.done}</dt>
                <dd>{doneT.done}</dd>
              </div>
              <div>
                <dt>{Y.doneRows.from}</dt>
                <dd>{Y.from}</dd>
              </div>
            </dl>
            <div className="act2">
              <button type="button" className="btn" data-variant="ghost" onClick={run}>
                {Y.again}
              </button>
              <span className="memo2">{Y.againNote}</span>
            </div>
          </div>
        </div>
        <div className="c-f">
          <span className={'st ' + f.youSt[1]}>
            <i />
            <span>{f.youSt[0]}</span>
          </span>
          <span className="ck">{Y.device}</span>
        </div>
      </div>
    </div>
  );
}
