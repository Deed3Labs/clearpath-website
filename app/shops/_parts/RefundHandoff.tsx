'use client';

import { useRef, useState } from 'react';
import { headRuleY, motionOK, useTrace } from '@/lib/anim';
import { MONEY } from '@/content/shops';

/* 05 · The refund hand-off: a ruled component, not a screenshot. The writer
   starts the refund and sees what the customer gets back; the request travels
   across the seam between the two people (light along the header rules) and
   the owner sees what it does to the payout, and approves with the owner
   code. Works the same with motion off — the light simply does not run. */

const W = MONEY.writer;
const O = MONEY.owner;
type Stage = 'idle' | 'sent' | 'asked' | 'done';

export function RefundHandoff() {
  const [stage, setStage] = useState<Stage>('idle');
  const rf = useRef<HTMLDivElement>(null);
  const cells = () => Array.from(rf.current?.querySelectorAll<HTMLElement>(':scope > .cell') ?? []);

  const handoff = useTrace(
    rf,
    (w) => {
      const [a, b] = cells();
      if (!a || !b) return 'M 0 0';
      const ya = headRuleY(a);
      const yb = headRuleY(b);
      return b.offsetTop > 0
        ? `M ${w * 0.5} ${ya} L ${w + 0.5} ${ya} L ${w + 0.5} ${yb} L ${w * 0.5} ${yb}`
        : `M ${a.offsetWidth * 0.5} ${ya} L ${a.offsetWidth + b.offsetWidth * 0.5} ${yb}`;
    },
    { seg: 150, speed: 760 },
  );

  const send = () => {
    setStage('sent');
    if (motionOK()) handoff.current.run({ ease: 'power2.inOut', done: () => setStage('asked') });
    else setStage('asked');
  };

  const reset = () => {
    handoff.current.kill();
    setStage('idle');
  };

  const asked = stage === 'asked';
  const done = stage === 'done';
  const wmsg = done ? W.done : stage === 'idle' ? W.idle : W.sent;

  return (
    <>
      <div className="bx rf" ref={rf}>
        <div className="cell">
          <div className="c-h">
            <span className="role">
              <span className="av">{W.initials}</span>
              {W.role}
            </span>
            <span className="ck">{W.sees}</span>
          </div>
          <div className="c-m">
            <div className="pane">
              <span className="lbl">{W.charge}</span>
              {W.rows.map((r) => (
                <div className="row" key={r.k}>
                  <span>{r.k}</span>
                  <b>{r.v}</b>
                </div>
              ))}
              {!done && (
                <button type="button" className="pbtn" disabled={stage !== 'idle'} onClick={send}>
                  {W.send}
                </button>
              )}
              <span className={'msg' + (done ? ' ok' : '')} aria-live="polite">
                {wmsg}
              </span>
            </div>
          </div>
        </div>
        <div className="cell">
          <div className="c-h">
            <span className="role">
              <span className="av">{O.initials}</span>
              {O.role}
            </span>
            <span className="ck">{O.sees}</span>
          </div>
          <div className="c-m">
            <div className={'pane' + (asked || done ? '' : ' idle')}>
              <span className="lbl">{done ? O.approvedBy : asked ? O.asks : O.idle}</span>
              <span>
                <span className="bigp">{asked || done ? O.after : O.payout}</span>
                <span className="was" hidden={!(asked || done)}>
                  {O.payout}
                </span>
              </span>
              <span className="msg">{asked ? O.ifSub : O.sub}</span>
              {!done && (
                <button type="button" className="pbtn" disabled={!asked} onClick={() => setStage('done')}>
                  {O.approve}
                </button>
              )}
              <span className={'msg' + (done ? ' ok' : '')} aria-live="polite">
                {done ? O.done : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bx rf-f">
        <span className="fig">{MONEY.carry}</span>
        <p>{MONEY.carryLine}</p>
        <button type="button" className="btn again" data-variant="ghost" onClick={reset}>
          {MONEY.again}
        </button>
      </div>
    </>
  );
}
