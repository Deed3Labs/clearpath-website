import Link from 'next/link';
import { COSTS } from '@/content/shopsTools';

/* What it costs, row by row. The hardware row's link into the shop shows
   only when the shop has hardware to show. */

export function CostTable({ hardwareVisible }: { hardwareVisible: boolean }) {
  return (
    <dl className="cost body-gap">
      {COSTS.rows.map((r) => (
        <div key={r.k}>
          <dt>{r.k}</dt>
          <dd className="v">
            {r.v}
            <small>
              {r.note}
              {r.link && (!r.hardware || hardwareVisible) && (
                <>
                  {' '}
                  <Link className="inl" href={r.link.href}>
                    {r.link.label}
                  </Link>
                </>
              )}
            </small>
          </dd>
        </div>
      ))}
    </dl>
  );
}
