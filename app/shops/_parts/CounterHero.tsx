'use client';

import { useRef, useState } from 'react';
import { Screen, Mark, Del } from '@/components/system';
import { useHeroIntro } from '@/lib/anim';
import { money } from '@/lib/format';
import { COUNTER_APP as A } from '@/content/shops';
import { fee, keyIn } from './keys';

/* The merchant counter app, owner signed in: action on the left, context on
   the right, the layout of the real app at tablet width (1200 × 728), and a
   phone fallback (390 × 690) with the charge and nothing else. The server
   renders the finished $940 ticket; with motion the ticket starts at zero
   when the intro begins and the writer keys in $940 as it ends. */

export function Keypad({ className }: { className?: string }) {
  return (
    <div className={['keys', className].filter(Boolean).join(' ')}>
      {A.keys.map((k) => (
        <span key={k}>{k}</span>
      ))}
      <span>
        <Del />
      </span>
    </div>
  );
}

export function CounterHero() {
  const [v, setV] = useState<number>(A.amount);
  const root = useRef<HTMLDivElement>(null);

  useHeroIntro(root, (tl) => {
    setV(0);
    tl.call(
      () => {
        const desk = !window.matchMedia('(max-width: 699px)').matches;
        const keys = root.current?.querySelector<HTMLElement>(desk ? '.screen-desk .keys' : '.screen-phone .keys');
        if (!keys) return setV(A.amount);
        const end = keyIn(keys, String(A.amount), setV, 0.2, 0.3);
        window.setTimeout(() => {
          const g = root.current?.querySelector<HTMLElement>(desk ? '.screen-desk .go' : '.screen-phone .go');
          g?.classList.add('hit');
          window.setTimeout(() => g?.classList.remove('hit'), 160);
        }, (end + 0.4) * 1000);
      },
      undefined,
      '-=.2',
    );
  });

  const kv = (
    <div className="kv2" data-a="">
      <div>
        <span>{A.fee}</span>
        <b>{money(fee(v))}</b>
      </div>
      <div className="ok">
        <span>{A.net}</span>
        <b>{money(v - fee(v))}</b>
      </div>
    </div>
  );

  return (
    <div ref={root}>
      <Screen w={1200} h={728} variant="desk">
        <div className="bar-top">
          <span className="lock">
            <Mark />
            {A.brand}
            <i />
            <em>{A.shop}</em>
          </span>
          <div className="r">
            <span className="tabs">
              {A.tabs.map((t, i) => (
                <span key={t} className={i === 0 ? 'on' : undefined}>
                  {t}
                </span>
              ))}
            </span>
            <span className="ava">{A.initials}</span>
          </div>
        </div>
        <div className="mc">
          <div className="mc-l">
            <span className="lbl" data-a="">
              {A.newCharge}
            </span>
            <span className="num mc-amt" data-a="">
              {money(v)}
            </span>
            <div className="memo" data-a="">
              {A.memo}
            </div>
            {kv}
            <div data-a="">
              <Keypad />
            </div>
            <span className="go" data-a="">
              {A.go}
            </span>
            <div className="alt2" data-a="">
              {A.alt.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
          </div>
          <div className="mc-r">
            <div className="sec-h" data-a="">
              <span className="lbl">{A.waiting.label}</span>
              <span className="cap2">{A.waiting.count}</span>
            </div>
            <div className="wait" data-a="">
              <div className="t">
                <span>{A.wait.name}</span>
                <span className="num">{A.wait.amount}</span>
              </div>
              <span className="s">{A.wait.sub}</span>
              <div className="rcpt">
                {A.wait.receipts.map((r) => (
                  <span key={r.label}>
                    <i className={r.ok ? undefined : 'p'} />
                    {r.label}
                  </span>
                ))}
              </div>
              <div className="acts2">
                {A.wait.actions.map((a) => (
                  <span className="pillb" key={a}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div data-a="">
              <div className="sec-h">
                <span className="lbl">{A.today.label}</span>
                <span className="cap2">{A.today.sub}</span>
              </div>
              <div className="rows2">
                {A.rows.map((r) => (
                  <div key={r.name}>
                    <span>{r.name}</span>
                    <span className="stf">{r.staff}</span>
                    <span className="num">{r.amount}</span>
                    <span className={'st3' + (r.ok ? ' ok' : '')}>{r.st}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pay-f" data-a="">
              <div>
                <span className="lbl">{A.payout.label}</span>
                <span className="cap2">{A.payout.sub}</span>
              </div>
              <span className="num">{A.payout.amount}</span>
            </div>
          </div>
        </div>
      </Screen>

      <Screen w={390} h={690} variant="phone">
        <div className="bar-top ph">
          <span className="lock">
            <Mark />
            {A.brand}
            <i />
            <em>{A.shop}</em>
          </span>
          <span className="ava">{A.initials}</span>
        </div>
        <div className="mp">
          <span className="lbl" data-a="">
            {A.newCharge}
          </span>
          <span className="num mc-amt" data-a="">
            {money(v)}
          </span>
          <div className="memo" data-a="">
            {A.memo}
          </div>
          {kv}
          <div data-a="">
            <Keypad />
          </div>
          <span className="go" data-a="">
            {A.go}
          </span>
          <div className="alt2" data-a="">
            {A.alt.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
        </div>
      </Screen>
    </div>
  );
}
