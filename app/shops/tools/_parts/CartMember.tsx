import { money } from '@/lib/format';
import { REWARDS } from '@/content/shopsTools';
import { amt, minus } from './fmt';

/* Your cart with a regular's code scanned in: her reward applied, then the
   total. The toggle beside the reward is a picture of the app's switch. */

export function CartMember() {
  const c = REWARDS.cart;
  return (
    <div className="cell">
      <div className="c-h">
        <span className="who">{c.who}</span>
        <span className="ck">{c.ck}</span>
      </div>
      <div className="c-m">
        <h3>{c.title}</h3>
        <div className="cartm">
          <div>
            <span className="who2">
              <i>{c.member.initials}</i>
              <span>
                {c.member.name}
                <br />
                <small>{c.member.sub}</small>
              </span>
            </span>
            <span className="act">{c.member.act}</span>
          </div>
          {c.lines.map((l) => (
            <div key={l.label}>
              <span>{l.label}</span>
              <span>{amt(l.amount)}</span>
            </div>
          ))}
          <div>
            <span className="rwd">
              {c.reward.label}
              <br />
              <small>{c.reward.sub}</small>
            </span>
            <span className="tg2">
              {minus(c.reward.amount)}
              <i aria-hidden="true" />
            </span>
          </div>
          <div>
            <span>{c.tax.label}</span>
            <span>{amt(c.tax.amount)}</span>
          </div>
          <div className="tot2">
            <span>{c.total.label}</span>
            <span>{money(c.total.amount)}</span>
          </div>
        </div>
        <p>{c.text}</p>
      </div>
    </div>
  );
}
