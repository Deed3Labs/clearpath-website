'use client';

import { useRef, type CSSProperties } from 'react';
import { useScrub } from '@/lib/anim';
import { money } from '@/lib/format';
import { GAP } from '@/content/home';

/* 01 · Two columns, one clock. Sixty bars a side, built finished: the server
   renders month 60 with every bar up and the five-year totals, which is what
   a reader without motion sees. With motion, scrolling through the bento pays
   the months in from zero — bars rise (scaleY), a cursor walks the months
   (translateX), and the totals count with them. */

const M = GAP.months;
/* The Clear column's bars stand at 2,350 of 2,520; the green inside each is
   the 1,500 that is yours. */
const clearH = `${((GAP.clear.monthly / GAP.rent.monthly) * 100).toFixed(2)}%`;
const keepH = `${((GAP.clear.equity / GAP.clear.monthly) * 100).toFixed(2)}%`;
const bars = Array.from({ length: M }, (_, i) => i);

export function GapCompare() {
  const root = useRef<HTMLDivElement>(null);
  const last = useRef(-1);

  useScrub(
    root,
    (p) => {
      const el = root.current;
      if (!el) return;
      const m = Math.max(0, Math.min(M, Math.round(p * M)));
      if (m === last.current) return;
      last.current = m;
      el.querySelectorAll<HTMLElement>('.bar').forEach((b) => {
        b.style.transform = Number(b.dataset.i) < m ? '' : 'scaleY(0)';
      });
      el.querySelectorAll<HTMLElement>('.cursor').forEach((c) => {
        c.style.transform = `translateX(${(m / M) * 100}%)`;
        c.style.opacity = m > 0 && m < M ? '1' : '0';
      });
      const set = (k: string, v: string) => {
        const t = el.querySelector(`[data-k="${k}"]`);
        if (t) t.textContent = v;
      };
      set('mo', String(m));
      set('rent-paid', money(m * GAP.rent.monthly, 0));
      set('clear-paid', money(m * GAP.clear.monthly, 0));
      set('clear-kept', money(m * GAP.clear.equity, 0));
    },
    { start: 'top 72%', end: 'bottom 72%', scrub: 0.4 },
  );

  return (
    <div ref={root} className="cmp body-gap" role="figure" aria-label={GAP.summary}>
      <div className="cmp-col rent">
        <div className="cmp-h">
          <span className="who">{GAP.rent.who}</span>
          <span className="fig">{GAP.rent.rate}</span>
        </div>
        <div className="cmp-m">
          <div className="keep">
            <span className="ck">{GAP.keepLabel}</span>
            <span className="fig kept">{money(0, 0)}</span>
          </div>
          <div className="bars" aria-hidden="true">
            {bars.map((i) => (
              <span className="bar" data-i={i} key={i} style={{ height: '100%' }} />
            ))}
            <span className="cursor" />
          </div>
          <div className="axis" aria-hidden="true">
            {GAP.axis.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="legend" aria-hidden="true">
            {GAP.rent.legend.map((l) => (
              <span key={l.key}>
                <i className={l.key} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="cmp-f">
          <span className="ck">{GAP.rent.paidLabel}</span>
          <span className="fig" data-k="rent-paid">
            {money(M * GAP.rent.monthly, 0)}
          </span>
        </div>
      </div>
      <div className="cmp-col clear">
        <div className="cmp-h">
          <span className="who">{GAP.clear.who}</span>
          <span className="fig">{GAP.clear.rate}</span>
        </div>
        <div className="cmp-m">
          <div className="keep">
            <span className="ck">{GAP.keepLabel}</span>
            <span className="fig kept" data-k="clear-kept">
              {money(M * GAP.clear.equity, 0)}
            </span>
          </div>
          <div className="bars keeps" aria-hidden="true" style={{ '--keep': keepH } as CSSProperties}>
            {bars.map((i) => (
              <span className="bar" data-i={i} key={i} style={{ height: clearH }} />
            ))}
            <span className="cursor" />
          </div>
          <div className="axis" aria-hidden="true">
            {GAP.axis.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="legend" aria-hidden="true">
            {GAP.clear.legend.map((l) => (
              <span key={l.key}>
                <i className={l.key} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="cmp-f">
          <span className="ck">{GAP.clear.paidLabel}</span>
          <span className="fig" data-k="clear-paid">
            {money(M * GAP.clear.monthly, 0)}
          </span>
        </div>
      </div>
      <div className="cmp-foot">
        <span className="mo">
          {GAP.month[0]}
          <b data-k="mo">{M}</b>
          {GAP.month[1]}
          {M}
        </span>
        <span className="label">{GAP.note}</span>
      </div>
    </div>
  );
}
