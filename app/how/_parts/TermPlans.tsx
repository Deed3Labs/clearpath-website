'use client';

import { useState } from 'react';
import { Chip, LiveDot } from '@/components/system';
import { money } from '@/lib/format';
import { PLANS } from '@/content/how';

/* 02 · Term plans, as an enclosed bento: what is owed and the one ceiling it
   sits under, the open plan with its payment schedule, the two locked rungs,
   and the footer that pays it back. Each plan levels principal plus carry
   into equal payments; carry is 2% a cycle on the principal still owed, so
   clearing early pays the principal left plus only this cycle's carry — the
   reference's own "in full" figure for $940 on day one is $958.80. */

const P = PLANS.plan;
const r2 = (v: number) => Math.round(v * 100) / 100;
type Plan = { principal: number; n: number; k: number; early: number | null; note: string };

const pay = (p: Plan) => r2((p.principal + (p.principal * PLANS.carry * (p.n + 1)) / 2) / p.n);
const owed = (p: Plan) => (p.k >= p.n ? 0 : r2(pay(p) * (p.n - p.k)));
const payoff = (p: Plan) => r2(((p.principal / p.n) * (p.n - p.k)) * (1 + PLANS.carry));

/* The shared Chip draws no dot on an untoned chip; the mockup's "Locked" and
   "Saving" chips carry a still one, so this page draws its own. */
function DotChip({ children }: { children: string }) {
  return (
    <span className="chip">
      <span className="live-dot chip-dot" data-still="" aria-hidden="true" />
      {children}
    </span>
  );
}

const fresh = () => ({
  plans: [{ principal: P.principal, n: P.n, k: 0, early: null, note: '' }] as Plan[],
  clean: PLANS.cash.start as number,
  paid: 0,
  saved: 0,
  flash: { plan: 0, cash: 0 },
});

export function TermPlans() {
  const [s, setS] = useState(fresh);

  const clearCycle = () =>
    setS((c) => {
      let paid = c.paid;
      const plans = c.plans.map((p) => {
        if (p.k >= p.n) return p;
        paid = r2(paid + pay(p));
        const k = p.k + 1;
        return { ...p, k, note: k >= p.n ? P.onSchedule(money(pay(p) * p.n)) : '' };
      });
      const clean = Math.min(PLANS.cash.need, c.clean + 1);
      return {
        ...c,
        plans,
        paid,
        clean,
        flash: { plan: c.flash.plan + 1, cash: clean === PLANS.cash.need ? c.flash.cash + 1 : c.flash.cash },
      };
    });

  const clearEarly = (i: number) =>
    setS((c) => {
      const p = c.plans[i];
      const o = owed(p), po = payoff(p);
      const plans = c.plans.map((q, j) => (j === i ? { ...q, note: P.early(money(o - po)), early: q.k, k: q.n } : q));
      return { ...c, plans, paid: r2(c.paid + po), saved: r2(c.saved + (o - po)), flash: { ...c.flash, plan: c.flash.plan + 1 } };
    });

  const total = s.plans.reduce((a, p) => a + owed(p), 0);
  const due = s.plans.reduce((a, p) => a + (p.k < p.n ? pay(p) : 0), 0);
  const room = PLANS.ceiling - total;
  const unlocked = s.clean >= PLANS.cash.need;

  return (
    <div className="tg body-gap">
      <div className="tg-head">
        <div className="tg-tot">
          <span className="tc-k">{PLANS.owedLabel}</span>
          <span className="fig tg-owed">{money(total)}</span>
          <span className="of">{PLANS.ceilingOf}</span>
        </div>
        <div className="tg-ceil">
          <div className="cx-bar" aria-hidden="true">
            {s.plans.map((p, i) =>
              owed(p) > 0 ? (
                <span key={i} className={`p${i}`} style={{ flexGrow: owed(p) }}>
                  {owed(p) >= 300 ? money(owed(p), 0) : ''}
                </span>
              ) : null,
            )}
            <span className="room" style={{ flexGrow: room }}>
              {money(room, 0)}
              {PLANS.free}
            </span>
          </div>
          <div className="tg-stats">
            <div>
              <span className="tc-k">{PLANS.stats.room}</span>
              <span className="fig">{money(room)}</span>
            </div>
            <div>
              <span className="tc-k">{PLANS.stats.paid}</span>
              <span className="fig">{money(s.paid)}</span>
            </div>
            <div className="pos">
              <span className="tc-k">{PLANS.stats.saved}</span>
              <span className="fig">{money(s.saved)}</span>
            </div>
          </div>
        </div>
      </div>

      {s.plans.map((p, i) => {
        const done = p.k >= p.n;
        const pct = Math.round((p.k / p.n) * 100);
        const pl = done ? P.done(p.n) : P.progress(p.n, money(pay(p)), pct);
        return (
          <div
            key={`${i}-${s.flash.plan}`}
            className={'tg-cell plan-cell full' + (done ? ' cleared' : '') + (s.flash.plan ? ' flash' : '')}
          >
            <div className="tc-h">
              <span className="tc-k">{P.kind}</span>
              {done && <Chip tone="live">{P.cleared}</Chip>}
            </div>
            <div className="pc-body">
              <div className="tc-m">
                <span className="tc-name">{P.name}</span>
                <span className="tc-ty">{P.memo}</span>
                <span className="fig tc-amt">{money(owed(p))}</span>
                <div className="ticks" aria-hidden="true">
                  {Array.from({ length: p.n }, (_, j) => (
                    <span key={j} className={j < p.k ? 'on' : j === p.k && !done ? 'now' : undefined} />
                  ))}
                </div>
                <span className="tc-pl">
                  {pl[0]}
                  <b>{pl[1]}</b>
                </span>
                {p.note && <span className="tc-note">{p.note}</span>}
              </div>
              <ol className="sched" aria-label={P.schedule}>
                {Array.from({ length: p.n }, (_, j) => {
                  const cls = p.early !== null && j >= p.early ? 'early' : j < p.k ? 'paid' : j === p.k ? 'now' : '';
                  const st = cls === 'early' ? P.status.early : cls === 'paid' ? P.status.paid : cls === 'now' ? P.status.now : P.status.upcoming;
                  return (
                    <li key={j} className={cls || undefined}>
                      <span className="sn">{j + 1}</span>
                      <span>{P.due[j]}</span>
                      <span className="fig">{money(pay(p))}</span>
                      <span className="ss">{st}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="tc-f">
              <span className="tc-k">{done ? P.nothing : P.left(p.n - p.k, p.n)}</span>
              {!done && (
                <button type="button" className="pill-sm" onClick={() => clearEarly(i)}>
                  {P.clearEarly(money(payoff(p)))}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div
        key={`cash-${s.flash.cash}`}
        className={'tg-cell l lock-cell' + (unlocked ? ' unlocked' : '') + (s.flash.cash ? ' flash' : '')}
      >
        <div className="tc-h">
          <span className="tc-k">{PLANS.cash.head}</span>
          {unlocked ? <Chip tone="live">{PLANS.cash.unlocked}</Chip> : <DotChip>{PLANS.cash.locked}</DotChip>}
        </div>
        <div className="tc-m">
          <span className="tc-name">{PLANS.cash.name}</span>
          <span className="tc-ty">{PLANS.cash.type}</span>
          <div className="ticks" aria-hidden="true">
            {Array.from({ length: PLANS.cash.need }, (_, j) => (
              <span key={j} className={j < s.clean ? 'on' : undefined} />
            ))}
          </div>
          <span className="tc-pl">
            {unlocked ? (
              <>
                <b>{PLANS.cash.done[0]}</b>
                {PLANS.cash.done[1]}
              </>
            ) : (
              PLANS.cash.progress(s.clean)
            )}
          </span>
        </div>
      </div>
      <div className="tg-cell r lock-cell">
        <div className="tc-h">
          <span className="tc-k">{PLANS.home.head}</span>
          <DotChip>{PLANS.home.chip}</DotChip>
        </div>
        <div className="tc-m">
          <span className="tc-name">{PLANS.home.name}</span>
          <span className="tc-ty">{PLANS.home.type}</span>
          <div className="gauge" aria-hidden="true">
            <i style={{ width: `${PLANS.home.pct}%` }} />
          </div>
          <span className="tc-pl">{PLANS.home.progress}</span>
        </div>
      </div>

      <div className="tg-foot">
        <div className="tg-due">
          <span className="tc-k">{PLANS.dueLabel}</span>
          <span className="fig">{money(due)}</span>
          <span className="of">{PLANS.dueSub}</span>
        </div>
        <p className="tg-rule">
          <b>{PLANS.rule[0]}</b>
          {PLANS.rule[1]}
        </p>
        <div className="sx-acts">
          <button type="button" className="btn" data-variant="primary" disabled={due === 0} onClick={clearCycle}>
            <LiveDot />
            {PLANS.clearCycle}
          </button>
          <button type="button" className="btn" data-variant="ghost" onClick={() => setS(fresh())}>
            {PLANS.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
