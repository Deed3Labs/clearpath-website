import Link from 'next/link';
import { Chip, DateBlock, LiveDot } from '@/components/system';
import { DETAIL, LISTING } from '@/content/events';
import type { CalEvent } from '@/lib/events/sources';
import { groupLabel, isLocal, shortTitle, timeLabel, whereShort } from './model';

/* The chips on an event: one per category, named as the filters are, so a
   chip says which filters show it. A local meeting's one chip is its place. */
export function EventChips({ event: e }: { event: CalEvent }) {
  if (isLocal(e)) return <span className="chip k">{e.place}</span>;
  return (
    <>
      {e.groups.map((g) => (
        <Chip key={g}>{groupLabel(g)}</Chip>
      ))}
    </>
  );
}

/* The little arrow that says a link leaves the site. */
export function Ext() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 9L9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/* One line of the agenda. The title is the link to the event's page and
   stretches over the whole row; Register and Agenda sit above that overlay,
   so each is its own target rather than a link inside a link. */
export function EventRowBody({ event: e }: { event: CalEvent }) {
  const local = isLocal(e);
  const where = whereShort(e);
  return (
    <>
      <DateBlock date={e.start} />
      <div className="rm">
        <div className="chips">
          <EventChips event={e} />
          {e.cancelled && <Chip tone="absent">{LISTING.cancelled}</Chip>}
        </div>
        <h3>
          {/* Only hand-written Clear events prefetch. A feed event's or a
              local meeting's page asks its calendar (Luma, a city) when it
              renders, and prefetching every row in view fired bursts at
              those servers that drew 429s. */}
          <Link href={`/events/${e.slug}`} prefetch={e.source === 'clear' ? undefined : false}>
            {shortTitle(e)}
          </Link>
        </h3>
        <p className="meta">
          <time dateTime={e.start.toISOString()}>{timeLabel(e)}</time>
          {where && ` · ${where}`}
          {e.provisional && <span className="cav">{DETAIL.scheduleCaveat}</span>}
        </p>
      </div>
      <div className="ra">
        {local
          ? e.officialUrl && (
              <a className="ext" href={e.officialUrl} target="_blank" rel="noopener noreferrer">
                {LISTING.agenda}
                <Ext />
              </a>
            )
          : !e.cancelled && (
              <>
                <span className="pr">{e.price ?? LISTING.free}</span>
                {e.registerUrl && (
                  <a className="btn" data-variant="primary" href={e.registerUrl} target="_blank" rel="noopener noreferrer">
                    <LiveDot />
                    {LISTING.register}
                  </a>
                )}
              </>
            )}
      </div>
    </>
  );
}

export function EventRow({ event: e }: { event: CalEvent }) {
  return (
    <article className="row">
      <EventRowBody event={e} />
    </article>
  );
}

/* A calendar with a plus: "add to your calendar". */
export function CalAdd() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2.5" y="3.5" width="13" height="12" />
      <path d="M2.5 7h13M6 2v3M12 2v3M9 9.5v4M7 11.5h4" />
    </svg>
  );
}
