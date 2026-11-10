import { Screen, Mark, Bell, Plus } from '@/components/system';
import { MEMBER_APP as A } from '@/content/home';

/* The member app's Home on a phone, as real UI rather than a picture of it:
   a 390 × 860 canvas scaled to fit, with only its top showing (600 canvas
   pixels, 760 at 900px and below). [data-a] parts assemble and [data-grow]
   bars draw in when the device scrolls into view (Device trace="inview"). */

export function MemberHome() {
  return (
    <Screen w={390} h={860} crop={{ h: 600, hm: 760 }}>
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
        <div className="bal" data-a="">
          <div className="bal-l">
            <span className="lbl">{A.balance.label}</span>
            <span className="num bal-n">{A.balance.value}</span>
            <span className="cap2">{A.balance.sub}</span>
          </div>
        </div>
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
              <span className="cap2">{A.cycle.detail}</span>
            </div>
            <span className="pillb lg">{A.cycle.action}</span>
          </div>
        </div>
        <div className="slot" data-a="">
          <div className="slot-r">
            <span>{A.slot.label}</span>
            <span className="pillb">{A.slot.action}</span>
          </div>
        </div>
        <div className="slab2" data-a="">
          <div className="blk">
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
                {A.credit.rows.map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="blk">
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
            </div>
          </div>
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
  );
}
