import Link from 'next/link';
import { Chip } from '@/components/primitives';
import { LiveDot } from '@/components/primitives/Button';
import { DETAIL, LISTING, TYPES } from '@/content/events';
import type { CalEvent } from '@/lib/events/sources';
import { dayNumber, monthShort, timeRange, weekdayShort } from '@/lib/events/time';

const FORMAT: Record<CalEvent['format'], string> = {
  online: 'Online',
  'in-person': 'In person',
  hybrid: 'In person and online',
};

/* One line of the calendar. The title is the link to the detail page and
   stretches over the whole row; Register sits above that overlay so it is its
   own target, not a link nested inside a link. */
export function EventRow({ event: e }: { event: CalEvent }) {
  const group = TYPES[e.type].group;
  const where = e.source === 'local' ? e.location : e.format === 'online' ? FORMAT.online : e.location ?? FORMAT[e.format];

  return (
    <article className="ev-row" data-group={group} data-cancelled={e.cancelled ? '' : undefined}>
      <p className="ev-date" aria-hidden="true">
        <span className="ev-date-wk">{weekdayShort(e.start)}</span>
        <span className="ev-date-day">{dayNumber(e.start)}</span>
        <span className="ev-date-mo">{monthShort(e.start)}</span>
      </p>

      <div className="ev-main">
        <div className="ev-chips">
          <Chip>{TYPES[e.type].label}</Chip>
          {e.cancelled && <Chip tone="absent">{LISTING.cancelled}</Chip>}
        </div>
        <h3 className="ev-title">
          <Link href={`/events/${e.slug}`} className="ev-link">
            {e.title}
          </Link>
        </h3>
        <p className="t-sm ev-meta">
          <time dateTime={e.start.toISOString()}>{e.timeUnknown ? 'Time to be posted' : timeRange(e.start, e.end)}</time>
          {where && <span> · {where}</span>}
          {e.provisional && <span className="ev-caveat">{DETAIL.scheduleCaveat}</span>}
        </p>
      </div>

      <div className="ev-aside">
        {e.source !== 'local' && !e.cancelled && (
          <>
            <span className="ev-price">{e.price ?? LISTING.free}</span>
            {e.registerUrl && (
              <a href={e.registerUrl} className="btn ev-register" data-variant="primary" target="_blank" rel="noopener noreferrer">
                <LiveDot />
                {LISTING.register}
              </a>
            )}
          </>
        )}
      </div>
    </article>
  );
}
