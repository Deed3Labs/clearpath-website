import type { ElementType, ReactNode } from 'react';

/* A ticket: what it is and where, as a list of facts, then a perforated rule
   with a half-circle notch at each wall, then what to do about it. Used for an
   event's "When and where" and a partner's "Visit". The perforation is
   decoration; the facts and actions carry everything. */

export type TicketFact = { k: string; v: ReactNode };

export function Ticket({
  as: Tag = 'aside',
  who,
  ck,
  facts,
  className,
  children,
}: {
  as?: ElementType;
  who: ReactNode;
  ck?: ReactNode;
  facts: readonly TicketFact[];
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag className={['cell', 'tk', className].filter(Boolean).join(' ')}>
      <div className="c-h">
        <span className="who">{who}</span>
        {ck !== undefined && <span className="ck">{ck}</span>}
      </div>
      <dl>
        {facts.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd>{f.v}</dd>
          </div>
        ))}
      </dl>
      <div className="perf" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="act">{children}</div>
    </Tag>
  );
}
