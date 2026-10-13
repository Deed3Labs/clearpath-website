import type { CSSProperties } from 'react';
import { Screen, Mark, Bell, Plus } from '@/components/system';
import { SAVINGS_APP as A } from '@/content/housing';

/* The member app's Savings screen, where the home path lives: the home path
   with its five-protection ladder, what you hold, and the protections. A
   1200 × 766 desktop canvas and a 390 × 820 phone canvas, scaled by CSS.
   [data-a] parts assemble in the hero intro; [data-grow] bars draw in (the
   rung in progress grows to its own 8%). */

const COMP = [
  { basis: '50%', bg: '#DFE3DE' },
  { basis: '33.3%', bg: '#6FCB9F' },
  { basis: '16.7%', bg: '#E3B667' },
];

function Comp() {
  return (
    <span className="comp" aria-hidden="true">
      {COMP.map((c) => (
        <i key={c.basis} data-grow="" style={{ flexBasis: c.basis, background: c.bg }} />
      ))}
    </span>
  );
}

function Ladder({ phone }: { phone?: boolean }) {
  return (
    <div className="ladder5">
      {A.path.ladder.map((r) => {
        const cls = r.fill >= 1 ? 'got' : r.fill > 0 ? 'now' : undefined;
        return (
          <div key={r.name} className={cls}>
            <i>
              {r.fill > 0 && (
                <b data-grow="" style={r.fill < 1 ? ({ transform: `scaleX(${r.fill})` } as CSSProperties) : undefined} />
              )}
            </i>
            <em>{phone ? r.phoneAt : r.at}</em>
            <span>{phone ? r.phone : r.name}</span>
          </div>
        );
      })}
    </div>
  );
}

function Rows({ phone }: { phone?: boolean }) {
  return (
    <div className="trows">
      {A.hold.rows.map((r) => (
        <div key={r.k}>
          <span className={r.tone}>{phone ? r.phone : r.k}</span>
          <span className="fg">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

export function SavingsScreen() {
  return (
    <>
      <Screen w={1200} h={766} variant="desk">
        <div className="bar-top">
          <span className="lock">
            <Mark />
            {A.brand}
          </span>
          <div className="r">
            <span className="tabs">
              {A.tabs.map((t, i) => (
                <span key={t} className={i === 1 ? 'on' : undefined}>
                  {t}
                </span>
              ))}
            </span>
            <Bell className="bell" />
            <span className="ava">{A.initials}</span>
          </div>
        </div>
        <div className="sv">
          <div className="sv-top" data-a="">
            <div className="l">
              <span className="lbl">{A.label}</span>
              <span className="num sv-n">{A.value}</span>
              <span className="cap2">{A.sub}</span>
            </div>
            <div className="acts">
              <span className="pillb lg">{A.actions[0]}</span>
              <span className="pillb lg solid">{A.actions[1]}</span>
            </div>
          </div>
          <div className="slab">
            <div className="blk" data-a="">
              <div className="bh">
                <span className="lbl">{A.path.label}</span>
                <span className="cap2">{A.path.track}</span>
              </div>
              <div className="bm">
                <div className="hp-n">
                  <span className="num">{A.path.credits}</span>
                  <span className="cap2">{A.path.of}</span>
                </div>
                <Ladder />
                <div className="nextu">
                  <span>
                    {A.path.next[0]}
                    <b>{A.path.next[1]}</b>
                  </span>
                  <span className="cap2">{A.path.togo}</span>
                </div>
              </div>
              <div className="bf">
                <span>
                  {A.path.saving[0]}
                  <b>{A.path.saving[1]}</b>
                  {A.path.saving[2]}
                </span>
                <span className="pillb">{A.path.change}</span>
              </div>
            </div>
            <div className="blk" data-a="">
              <div className="bh">
                <span className="lbl">{A.hold.label}</span>
                <span className="num">{A.hold.value}</span>
              </div>
              <div className="bm">
                <Comp />
                <Rows />
              </div>
              <div className="bf">
                <span>
                  {A.hold.adds[0]}
                  <b>{A.hold.adds[1]}</b>
                  {A.hold.adds[2]}
                </span>
                <span className="pillb">{A.hold.details}</span>
              </div>
            </div>
          </div>
          <div className="prot" data-a="">
            <div className="bh">
              <span className="lbl">{A.protections.label}</span>
              <span className="cap2">{A.protections.note}</span>
            </div>
            <div className="prot-rows">
              {A.protections.rows.map((r) => (
                <div key={r.k}>
                  <b>{r.k}</b>
                  <span>{r.v}</span>
                  <span className={'chp' + (r.on ? ' ok' : '')}>{r.chip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Screen>

      <Screen w={390} h={820} variant="phone">
        <div className="ph-top">
          <span className="lock">
            <Mark />
            {A.brand}
          </span>
          <span className="r">
            <Bell className="bell" />
            <span className="ava">{A.initials}</span>
          </span>
        </div>
        <div className="ph-sv">
          <div className="sv-top" data-a="">
            <div className="l">
              <span className="lbl">{A.label}</span>
              <span className="num sv-n">{A.value}</span>
              <span className="cap2">{A.phoneSub}</span>
            </div>
          </div>
          <div className="slab" data-a="">
            <div className="blk">
              <div className="bh">
                <span className="lbl">{A.path.label}</span>
                <span className="cap2">{A.path.phoneTrack}</span>
              </div>
              <div className="bm">
                <div className="hp-n">
                  <span className="num">{A.path.credits}</span>
                  <span className="cap2">{A.path.of}</span>
                </div>
                <Ladder phone />
                <div className="nextu">
                  <span>
                    {A.path.phoneNext[0]}
                    <b>{A.path.phoneNext[1]}</b>
                  </span>
                  <span className="cap2">{A.path.phoneTogo}</span>
                </div>
              </div>
            </div>
            <div className="blk ph-hold">
              <div className="bh">
                <span className="lbl">{A.hold.label}</span>
                <span className="num">{A.hold.value}</span>
              </div>
              <div className="bm">
                <Comp />
                <Rows phone />
              </div>
            </div>
          </div>
        </div>
        <div className="navpill">
          {A.phoneTabs.map((t, i) => (
            <span key={t} className={i === 1 ? 'on' : undefined}>
              {t}
            </span>
          ))}
        </div>
        <span className="navact">
          <Plus />
        </span>
      </Screen>
    </>
  );
}
