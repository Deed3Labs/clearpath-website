'use client';

import { useEffect, useRef, useState } from 'react';
import { Device, Screen, Mark, Check, Qr } from '@/components/system';
import { gsap, motionOK, useInView } from '@/lib/anim';
import { money } from '@/lib/format';
import { COUNTER, COUNTER_APP as A } from '@/content/shops';
import { Keypad } from './CounterHero';
import { fee, keyIn } from './keys';

/* 02 · At the counter: four steps (tabs) drive the tablet beside them. With
   motion the steps cycle on their own once the bento comes into view, a
   cobalt rule under the current step timing it, and the writer keys in $940
   on the first; picking a step stops the cycling.

   The tablet is authored at 760 × 480. When its column is narrower than
   560px it swaps to a 400 × 526 canvas with the same states reflowed, so
   the screen stays readable. The swap is a container query on the device,
   not script, so it is right with no JavaScript and never jumps. */

const T = COUNTER.tablet;

function States({ cur, amt }: { cur: number; amt: number }) {
  const on = (i: number) => (cur === i ? ' on' : '');
  return (
    <>
      <div className="bar-top">
        <span className="lock">
          <Mark />
          {A.brand}
          <i />
          <em>{A.shop}</em>
        </span>
        <span className="who2">{T.who}</span>
      </div>
      <div className={'ts tab-st ts-1' + on(0)}>
        <div>
          <span className="lbl">{A.newCharge}</span>
          <span className="num mc-amt">{money(amt)}</span>
          <div className="memo">{A.memo}</div>
          <div className="kv2">
            <div>
              <span>{A.fee}</span>
              <b>{money(fee(A.amount))}</b>
            </div>
            <div className="ok">
              <span>{A.net}</span>
              <b>{money(A.amount - fee(A.amount))}</b>
            </div>
          </div>
        </div>
        <div>
          <Keypad />
          <span className="go">{A.go}</span>
        </div>
      </div>
      <div className={'ts tab-st ts-c' + on(1)}>
        <div className="qrbox">
          <Qr />
        </div>
        <span className="num qr-amt">{money(A.amount)}</span>
        <span className="a70">{T.scan}</span>
        <div className="alt2">
          {A.alt.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
      <div className={'ts tab-st ts-3' + on(2)}>
        <div>
          <span className="lbl">{T.waitLabel}</span>
          <span className="big2">{T.choosing}</span>
          <span className="a70">{T.ticket}</span>
          <div className="rlist">
            {T.receipts.map((r) => (
              <div key={r.k}>
                <span>{r.k}</span>
                <span className={r.ok ? 'ok' : 'p'}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="lbl">{T.walkLabel}</span>
          <span className="a70">{T.walk}</span>
          {T.walkActions.map((a) => (
            <span className="pillb" key={a}>
              {a}
            </span>
          ))}
        </div>
      </div>
      <div className={'ts tab-st ts-c ts-4' + on(3)}>
        <span className="okc">
          <Check />
        </span>
        <span className="big2">{T.approved}</span>
        <div className="kv2">
          <div>
            <span>{T.rows.ticket}</span>
            <b>{money(A.amount)}</b>
          </div>
          <div>
            <span>{T.rows.choice}</span>
            <b>{T.rows.split}</b>
          </div>
          <div className="ok">
            <span>{A.net}</span>
            <b>{money(A.amount - fee(A.amount))}</b>
          </div>
        </div>
        <span className="go">{T.next}</span>
      </div>
    </>
  );
}

export function CounterSteps() {
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState(false);
  const [picked, setPicked] = useState(false);
  const [amt, setAmt] = useState<number>(A.amount);
  const root = useRef<HTMLDivElement>(null);

  useInView(root, () => setSeen(true), { start: 'top 70%' });

  useEffect(() => {
    const el = root.current;
    if (!el || !motionOK()) return;
    const timers: number[] = [];
    const sched = (s: number, fn: () => void) => void timers.push(window.setTimeout(fn, s * 1000));
    const tweens: gsap.core.Tween[] = [];
    const pgs = Array.from(el.querySelectorAll<HTMLElement>('.stp .pg'));
    gsap.set(pgs, { scaleX: 0 });

    if (cur === 0 && seen) {
      /* Type into whichever tablet canvas is showing. */
      const keys = Array.from(el.querySelectorAll<HTMLElement>('.ts-1 .keys')).find((k) => k.offsetParent);
      if (keys) {
        setAmt(0);
        const end = keyIn(keys, String(A.amount), setAmt, 0.3, 0.26, sched);
        sched(end + 0.5, () => {
          const g = keys.parentElement?.querySelector('.go');
          g?.classList.add('hit');
          window.setTimeout(() => g?.classList.remove('hit'), 160);
        });
      }
    }
    if (cur === 3) tweens.push(gsap.from(el.querySelectorAll('.ts-4.on > *'), { opacity: 0, y: 8, duration: 0.5, stagger: 0.07, ease: 'power3.out' }));
    if (seen && !picked && pgs[cur])
      tweens.push(
        gsap.to(pgs[cur], { scaleX: 1, duration: COUNTER.dwell, ease: 'none', onComplete: () => setCur((c) => (c + 1) % 4) }),
      );
    return () => {
      timers.forEach(clearTimeout);
      tweens.forEach((t) => t.kill());
      gsap.set(pgs, { scaleX: 0 });
    };
  }, [cur, seen, picked]);

  return (
    <div className="bx ctr body-gap" ref={root}>
      <div className="stp" role="tablist" aria-label={COUNTER.tablist}>
        {COUNTER.steps.map((s, i) => (
          <button
            key={s.t}
            type="button"
            role="tab"
            aria-selected={cur === i}
            className={cur === i ? 'on' : i < cur ? 'done' : undefined}
            onClick={() => {
              setPicked(true);
              setAmt(A.amount);
              setCur(i);
            }}
          >
            <span className="n">{i + 1}</span>
            <span className="t">{s.t}</span>
            <span className="b">
              <span>{s.b}</span>
            </span>
            <span className="pg" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="ctr-s">
        <Device className="ctr-device">
          <Screen w={760} h={480} className="ctr-wide">
            <States cur={cur} amt={amt} />
          </Screen>
          <Screen w={400} h={526} className="ctr-narrow" canvasClassName="narrow">
            <States cur={cur} amt={amt} />
          </Screen>
        </Device>
      </div>
    </div>
  );
}
