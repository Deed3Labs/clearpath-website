import { money } from '@/lib/format';
import { FEES } from '@/content/shopsTools';
import { Rise } from './Rise';

/* What a $40 sale costs three ways. Each bar is sized against the dearest
   fee, card by QR, and is drawn finished: the markup is the end state. */

const top = Math.max(...FEES.cells.map((c) => c.fee));

export function FeeCells() {
  return (
    <Rise className="bx c3 body-gap">
      {FEES.cells.map((c) => (
        <div className="cell" key={c.who}>
          <div className="c-h">
            <span className="who">{c.who}</span>
            <span className="ck">{FEES.ck}</span>
          </div>
          <div className="c-m fee">
            <span className={c.ok ? 'big ok' : 'big'}>{money(c.fee)}</span>
            <span className={c.ok ? 'bar ok' : 'bar'} aria-hidden="true">
              <i style={{ width: `${((c.fee / top) * 100).toFixed(1)}%` }} />
            </span>
            <p>{c.note}</p>
          </div>
        </div>
      ))}
    </Rise>
  );
}
