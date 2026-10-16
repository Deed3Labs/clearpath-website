import { REWARDS } from '@/content/shopsTools';

/* The shop's own rules for its points, as the settings page lists them. */

export function RulesList() {
  const r = REWARDS.rules;
  return (
    <div className="cell">
      <div className="c-h">
        <span className="who">{r.who}</span>
        <span className="ck">{r.ck}</span>
      </div>
      <div className="c-m">
        <h3>{r.title}</h3>
        <dl className="kv3">
          {r.rows.map((row) => (
            <div key={row.k}>
              <dt>{row.k}</dt>
              <dd>{row.v}</dd>
            </div>
          ))}
        </dl>
        <p>{r.text}</p>
      </div>
    </div>
  );
}
