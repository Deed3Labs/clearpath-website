'use client';

import { useRef } from 'react';
import { Screen, Mark, Bell, Device } from '@/components/system';
import { gsap, useGsap } from '@/lib/anim';
import { APP, TABLES } from '@/content/shopsTools';

/* The floor: who is asking, the eight tables and the wait list. One canvas
   (1180 × 600), the app's desktop layout at every width, scaled to fit. When
   the screen comes into view the table that is calling pulses once. */

function BillIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
      <path d="M4 2.5h10v13l-2-1.3-1.6 1.3-1.4-1.3-1.4 1.3L6 14.2l-2 1.3z M6.5 6h5 M6.5 9h5" />
    </svg>
  );
}

function Lock() {
  return (
    <span className="lock">
      <Mark />
      {APP.brand}
      <i />
      <em>{APP.shop}</em>
    </span>
  );
}

export function TablesScreen() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    const el = root.current;
    if (!el) return;
    /* Spans, never the <svg> itself: GSAP measures an svg's box by moving it
       into a scratch svg and back, and puts it back after the text. */
    const ask = el.querySelectorAll('.tb-ask .call .ic, .tt.call .st .bi');
    if (!ask.length) return;
    gsap.to(ask, {
      scale: 1.3,
      duration: 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 65%', once: true },
    });
  });

  return (
    <div ref={root}>
      <Device>
        <Screen w={1180} h={600} canvasClassName="tb">
          <div className="bar-top">
            <div className="l">
              <Lock />
              <span className="tabs">
                {APP.tabs.map((t, i) => (
                  <span key={t} className={i === 1 ? 'on' : undefined}>
                    {t}
                  </span>
                ))}
              </span>
            </div>
            <span className="flt">
              {TABLES.filters.map((f, i) => (
                <span key={f} className={i === 0 ? 'on' : undefined}>
                  {f}
                </span>
              ))}
              <span className="ava">{APP.initials}</span>
            </span>
          </div>
          <div className="tb-ask">
            <div>
              <span className="lbl">{TABLES.asking}</span>
            </div>
            {TABLES.ask.map((a) => (
              <div key={a.title} className={a.kind}>
                <span className="ic">{a.kind === 'call' ? <Bell /> : <BillIcon />}</span>
                <span className="tx2">
                  <b>{a.title}</b>
                  <small>{a.sub}</small>
                </span>
                {'action' in a ? <span className="pillb solid">{a.action}</span> : <span className="st2">{a.status}</span>}
              </div>
            ))}
          </div>
          <div className="tb-b">
            <div className="tb-floor">
              {TABLES.floor.map((t) => (
                <div key={t.n} className={`tt ${t.state}`}>
                  <div className="top">
                    <span className="n">{t.n}</span>
                    {t.amt ? <span className="amt">{t.amt}</span> : <span className="seats">{t.seats}</span>}
                  </div>
                  <span />
                  <div>
                    <span className="st">
                      {t.state === 'call' ? (
                        <span className="bi">
                          <Bell />
                        </span>
                      ) : (
                        <i />
                      )}
                      {t.st}
                    </span>
                    <div className="meta">{t.meta || ' '}</div>
                  </div>
                  {t.clr && <span className="clr">{t.clr}</span>}
                </div>
              ))}
            </div>
            <div className="tb-wait">
              <div className="h">
                <span className="lbl">{TABLES.wait.label}</span>
                <span className="pillb">{TABLES.wait.add}</span>
              </div>
              {TABLES.wait.rows.map((r) => (
                <div className="r" key={r.name}>
                  <b>
                    {r.name}
                    {r.next && <span className="nx">{TABLES.wait.next}</span>}
                  </b>
                  <small>
                    {r.sub.map((s, i) => (i === 1 ? <em key={i}>{s}</em> : s))}
                  </small>
                  <span className={r.solid ? 'pillb solid' : 'pillb'}>{r.action}</span>
                </div>
              ))}
            </div>
          </div>
        </Screen>

      </Device>
    </div>
  );
}
