'use client';

import { useRef } from 'react';
import { Screen, Mark } from '@/components/system';
import { useHeroIntro } from '@/lib/anim';
import { money } from '@/lib/format';
import { APP, TILL } from '@/content/shopsTools';
import { amt } from './fmt';

/* The till: the merchant app at the counter of a sample taco shop, the
   item grid beside the order. One canvas (1180 × 640), the app's desktop
   layout at every width, scaled to fit. When the hero has finished, the
   Charge button pulses once. */

function Totals() {
  return (
    <div className="ms-tot">
      <div>
        <span>{TILL.subtotal.label}</span>
        <span>{amt(TILL.subtotal.amount)}</span>
      </div>
      <div>
        <span>{TILL.tax.label}</span>
        <span>{amt(TILL.tax.amount)}</span>
      </div>
      <div className="g">
        <span>{TILL.total.label}</span>
        <span>{money(TILL.total.amount)}</span>
      </div>
    </div>
  );
}

function Pay() {
  return (
    <div className="ms-pay">
      <div className="ms-seg">
        {TILL.pay.map((p, i) => (
          <span key={p} className={i === 0 ? 'on' : undefined}>
            {p}
          </span>
        ))}
      </div>
      <small>{TILL.payNote}</small>
      <span className="ms-go">
        {TILL.charge} {money(TILL.total.amount)}
      </span>
    </div>
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

export function TillScreen() {
  const root = useRef<HTMLDivElement>(null);

  useHeroIntro(root, (tl) => {
    const go = root.current?.querySelectorAll('.ms-go');
    if (!go?.length) return;
    tl.to(go, { scale: 1.04, duration: 0.28, ease: 'power2.out', yoyo: true, repeat: 1, clearProps: 'transform' }, '+=.1');
  });

  return (
    <div ref={root}>
      <Screen w={1180} h={640} canvasClassName="ms">
        <div className="bar-top">
          <div className="l">
            <Lock />
            <span className="tabs">
              {APP.tabs.map((t, i) => (
                <span key={t} className={i === 0 ? 'on' : undefined}>
                  {t}
                </span>
              ))}
            </span>
          </div>
          <span className="who3">
            {TILL.who}
            <span className="ava">{APP.initials}</span>
          </span>
        </div>
        <div className="ms-b">
          <div className="ms-items">
            <div className="ms-tools">
              <span className="ms-search">{TILL.search}</span>
              <span className="ms-tabs">
                {TILL.cats.map((c, i) => (
                  <span key={c} className={i === 0 ? 'on' : undefined}>
                    {c}
                  </span>
                ))}
              </span>
            </div>
            <div className="ms-grid">
              {TILL.items.map((it) => (
                <div key={it.name} className={it.qty ? 'sel' : undefined}>
                  <b>{it.name}</b>
                  <span>{amt(it.price)}</span>
                  {it.qty > 0 && <i>{it.qty}</i>}
                </div>
              ))}
            </div>
          </div>
          <div className="ms-cart">
            <div className="h">
              <b>{TILL.order}</b>
              <span className="lbl">{TILL.count}</span>
            </div>
            <div className="ms-lines">
              {TILL.lines.map((l) => (
                <div key={l.label}>
                  <span>{l.label}</span>
                  <span>{amt(l.amount)}</span>
                </div>
              ))}
            </div>
            <Totals />
            <Pay />
          </div>
        </div>
      </Screen>

    </div>
  );
}
