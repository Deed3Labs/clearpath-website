import Link from 'next/link';
import { Arrow } from '@/components/system/icons';
import { TAGS, type Partner } from '@/content/directory';
import { Avatar } from './Avatar';

/* The search match, marked. */
function Hl({ s, q }: { s: string; q?: string }) {
  const i = q ? s.toLowerCase().indexOf(q) : -1;
  if (!q || i < 0) return <>{s}</>;
  return (
    <>
      {s.slice(0, i)}
      <mark>{s.slice(i, i + q.length)}</mark>
      {s.slice(i + q.length)}
    </>
  );
}

/* One partner in a list. Every partner takes Clear Pay, so a row only tags
   what is extra (split plans). The name is the link and stretches over the
   whole row. */
export function PartnerRow({ p, q, hot }: { p: Partner; q?: string; hot?: boolean }) {
  return (
    <article className={hot ? 'prow hot' : 'prow'} data-slug={p.slug}>
      <Avatar category={p.category} name={p.name} />
      <div>
        <h3>
          <Link href={`/directory/${p.slug}`}>
            <Hl s={p.name} q={q} />
          </Link>
        </h3>
        <p className="meta">
          <Hl s={p.category} q={q} /> · <Hl s={p.city} q={q} />
        </p>
      </div>
      <div className="tags">{p.splitPlans && <span className="chip">{TAGS.split}</span>}</div>
      <Arrow />
    </article>
  );
}
