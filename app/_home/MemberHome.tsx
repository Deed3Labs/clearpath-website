import { Screen, Mark, Bell, Plus } from '@/components/system';
import { MEMBER_APP as A } from '@/content/home';

/* The member app's Home, as real UI rather than a picture of it: a 1200-wide
   desktop canvas and a 390 × 860 phone canvas, each scaled to fit by CSS.
   [data-a] parts assemble in the hero intro; [data-grow] bars draw in. */

const tone = { fg: 'fg', ok: 'ok', warn: 'warn' } as const;

function CreditBlock({ phone }: { phone?: boolean }) {
  const rows = phone ? A.credit.phoneRows.map((i) => A.credit.rows[i]) : A.credit.rows;
  return (
    <div className="blk" data-a={phone ? undefined : ''}>
      <div className="bh">
        <span className="lbl">{A.credit.label}</span>
        <span className="num">
          {A.credit.value} <span>{A.credit.of}</span>
        </span>
      </div>
      <div className="bm">
        <span className="comp" aria-hidden="true">
          <i data-grow="" style={{ flexBasis: '44.1%', background: '#3E6B55' }} />
          <i data-grow="" style={{ flexBasis: '55.9%', background: '#4C5A4C' }} />
        </span>
        <div className="trows">
          {rows.map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>
      {!phone && (
        <div className="bf">
          <span className="pillb lg full">{A.credit.action}</span>
        </div>
      )}
    </div>
  );
}

function SpendableBlock({ phone }: { phone?: boolean }) {
  return (
    <div className="blk" data-a={phone ? undefined : ''}>
      <div className="bh">
        <span className="lbl">{A.spendable.label}</span>
        <span className="num">{A.spendable.value}</span>
      </div>
      <div className="bm">
        <div className="trows big">
          <div>
            <span>{A.spendable.rows[0][0]}</span>
            <span>{A.spendable.rows[0][1]}</span>
          </div>
          <div>
            <span>{A.spendable.rows[1][0]}</span>
            <span className="num">{A.spendable.rows[1][1]}</span>
          </div>
        </div>
        {!phone && (
          <div className="three">
            {A.spendable.moves.map((m) => (
              <span className="pillb lg" key={m}>
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
      {!phone && (
        <div className="bf">
          <span className="dd">
            <i />
            {A.spendable.deposit}
          </span>
          <span className="pillb lg">{A.spendable.action}</span>
        </div>
      )}
    </div>
  );
}

function Cycle({ phone }: { phone?: boolean }) {
  return (
    <div className="cyc" data-a="">
      <div className="cyc-r1">
        <div>
          <span className="lbl">{A.cycle.label}</span>
          <span className="num amt">{A.cycle.amount}</span>
        </div>
        <div className="cd">
          <span className="num">{A.cycle.days}</span>
          <span className="cap2">{A.cycle.daysLabel}</span>
        </div>
      </div>
      <div className="cyc-r2">
        <div className="st2">
          <span>{A.cycle.status}</span>
          <span className="cap2">{phone ? A.cycle.phoneDetail : A.cycle.detail}</span>
        </div>
        <span className="pillb lg">{A.cycle.action}</span>
      </div>
    </div>
  );
}

function Balance({ phone }: { phone?: boolean }) {
  return (
    <div className="bal" data-a="">
      <div className="bal-l">
        <span className="lbl">{A.balance.label}</span>
        <span className="num bal-n">{A.balance.value}</span>
        <span className="cap2">{A.balance.sub}</span>
      </div>
      {/* The phone canvas has no action buttons under the balance. */}
      {!phone && (
        <div className="acts">
          {A.balance.actions.map((a) => (
            <span className="pillb" key={a}>
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Slot() {
  return (
    <div className="slot" data-a="">
      <div className="slot-r">
        <span>{A.slot.label}</span>
        <span className="pillb">{A.slot.action}</span>
      </div>
    </div>
  );
}

export function MemberHome() {
  return (
    <>
      <Screen w={1200} h={1140} variant="desk">
        <div className="bar-top">
          <span className="lock">
            <Mark />
            {A.brand}
          </span>
          <div className="r">
            <span className="tabs">
              {A.tabs.map((t, i) => (
                <span key={t} className={i === 0 ? 'on' : undefined}>
                  {t}
                </span>
              ))}
            </span>
            <Bell className="bell" />
            <span className="ava">{A.initials}</span>
          </div>
        </div>
        <div className="hb">
          <Balance />
          <Cycle />
          <Slot />
          <div className="slab2">
            <CreditBlock />
            <SpendableBlock />
            <div className="blk" data-a="">
              <div className="bh">
                <span className="lbl">{A.plans.label}</span>
                <span className="num">
                  {A.plans.value} <span>{A.plans.of}</span>
                </span>
              </div>
              <div className="bm">
                <div className="plan">
                  <span>{A.plans.open.name}</span>
                  <span className="num">{A.plans.open.value}</span>
                  <span className="d">
                    {A.plans.open.detail}
                    <b>{A.plans.open.cleared}</b>
                    {A.plans.open.rate}
                  </span>
                </div>
                <div className="plan locked">
                  <span>{A.plans.cash.name}</span>
                  <span className="lk">{A.plans.cash.lock}</span>
                  <span className="d">{A.plans.cash.detail}</span>
                </div>
                <div className="sub-rule lbl">{A.plans.homeRule}</div>
                <div className="plan locked last">
                  <span>{A.plans.home.name}</span>
                  <span className="lk">{A.plans.home.lock}</span>
                  <span className="d">{A.plans.home.detail}</span>
                </div>
              </div>
              <div className="bf">
                <div className="split-foot">
                  <span>
                    {A.plans.limit[0]}
                    <b>{A.plans.limit[1]}</b>
                  </span>
                  <i />
                  <span>
                    {A.plans.from[0]}
                    <b>{A.plans.from[1]}</b>
                  </span>
                </div>
              </div>
            </div>
            <div className="blk" data-a="">
              <div className="bh">
                <span className="lbl">{A.savings.label}</span>
                <span className="num">{A.savings.value}</span>
              </div>
              <div className="bm">
                <span className="comp" aria-hidden="true">
                  <i data-grow="" style={{ flexBasis: '50%', background: '#DFE3DE' }} />
                  <i data-grow="" style={{ flexBasis: '33.3%', background: '#6FCB9F' }} />
                  <i data-grow="" style={{ flexBasis: '16.7%', background: '#E3B667' }} />
                </span>
                <div className="trows">
                  {A.savings.rows.map(([k, v, t], i) => (
                    <div key={k}>
                      <span className={i === 0 ? 'fg' : tone[t]}>{k}</span>
                      <span className="fg">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bf col">
                <span>{A.savings.credits}</span>
                <span className="cred" aria-hidden="true">
                  <i data-grow="" style={{ width: '10%' }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Screen>

      <Screen w={390} h={860} variant="phone">
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
        <div className="ph-body">
          <Balance phone />
          <Cycle phone />
          <Slot />
          <div className="slab2" data-a="">
            <CreditBlock phone />
            <SpendableBlock phone />
          </div>
        </div>
        <div className="navpill">
          {A.phoneTabs.map((t, i) => (
            <span key={t} className={i === 0 ? 'on' : undefined}>
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
