import { Bento } from '@/components/system';
import './hardware.css';

/* How reserving works: three numbered cells that close a hardware lineup.
   The words are the page's own (/shop and /shops/tools say it differently),
   so they come in as items. It sits flush under the lineup, sharing its
   seam. */

export type ReservingItem = { n: string; title: string; text: string };

export function HowReserving({ items, className }: { items: readonly ReservingItem[]; className?: string }) {
  return (
    <Bento cols={3} stack={980} className={['how3', className].filter(Boolean).join(' ')}>
      {items.map((it) => (
        <div className="cell" key={it.n}>
          <div className="c-m">
            <span className="n2">{it.n}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </div>
        </div>
      ))}
    </Bento>
  );
}
