import { Fragment } from 'react';
import { EventFilter } from '@/components/events/EventFilter';
import { EventRow } from '@/components/events/EventRow';
import { NotifyForm } from '@/components/interactive/NotifyForm';
import { EMPTY, KINDS, LISTING, OPENING, TYPES, type EventGroup } from '@/content/events';
import { allEvents, isUpcoming, type CalEvent } from '@/lib/events/sources';
import { monthKey, monthYear } from '@/lib/events/time';

export const metadata = {
  title: 'Events',
  description:
    'Community calls, investor calls, co-op town halls and the Inland Empire council and planning meetings that decide what gets built.',
};

/* Five minutes, to match Clear's feeds (see CLEAR_FEED_REVALIDATE_SECONDS).
   City calendars inside are still fetched hourly: each fetch keeps its own
   cache, so re-rendering sooner does not ask their servers more often. */
export const revalidate = 300;

/* A calendar, not a feature page: the list is the content, so it starts on
 * the first screen. Two sections because they are two kinds of thing —
 * Clear's events, which you register for, and the public meetings next door,
 * which you just turn up to. The empty state belongs to the first section
 * only: with no Clear events scheduled it says so and takes an email, and
 * the local meetings still list underneath.
 */

function byMonth(events: CalEvent[]) {
  const months = new Map<string, CalEvent[]>();
  for (const e of events) {
    const k = monthKey(e.start);
    months.set(k, [...(months.get(k) ?? []), e]);
  }
  return [...months.values()];
}

const groupsOf = (events: CalEvent[]) => [...new Set(events.flatMap((e) => e.groups))].join(' ');

function Months({ events }: { events: CalEvent[] }) {
  return (
    <>
      {byMonth(events).map((month) => (
        <section className="ev-month" key={monthKey(month[0].start)} data-groups={groupsOf(month)}>
          <h3 className="ev-month-h">{monthYear(month[0].start)}</h3>
          {month.map((e) => (
            <EventRow key={e.slug} event={e} />
          ))}
        </section>
      ))}
    </>
  );
}

export default async function Events() {
  const now = new Date();
  const upcoming = (await allEvents()).filter((e) => isUpcoming(e, now));
  const clear = upcoming.filter((e) => e.source !== 'local');
  const local = upcoming.filter((e) => e.source === 'local');

  const counts = { all: upcoming.length, community: 0, investors: 0, governance: 0, local: 0 } as Record<
    EventGroup | 'all',
    number
  >;
  // An event in two categories counts in both; All counts it once.
  for (const e of upcoming) for (const g of e.groups) counts[g]++;

  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b> {OPENING.kicker}
        </p>
        <div className="hx-grid">
          <h1 className="hx-h2 c-two-thirds">{OPENING.heading}</h1>
          <div className="c-third ev-intro">
            <p className="hx-lede">{OPENING.lede}</p>
            <a href="/events/calendar.ics" className="shop-inline-link t-sm">
              {OPENING.subscribe}
            </a>
          </div>

          <div className="c-full">
            <EventFilter counts={counts}>
              <section className="ev-section" data-section="clear" data-groups={groupsOf(clear)}>
                <header className="ev-section-head">
                  <h2 className="d3">{LISTING.clearHeading}</h2>
                </header>

                {clear.length ? (
                  <>
                    <Months events={clear} />
                    <p className="t-sm ev-nomatch">{LISTING.noMatches}</p>
                  </>
                ) : (
                  <div className="ev-empty">
                    <div>
                      <p className="ev-empty-h">{EMPTY.heading}</p>
                      <p className="t-sm ev-empty-lede">{EMPTY.lede}</p>
                    </div>
                    <NotifyForm as="events" copy={EMPTY.notify} />
                  </div>
                )}
              </section>

              <section className="ev-section" data-section="local" data-groups={local.length ? 'local' : ''}>
                <header className="ev-section-head">
                  <h2 className="d3">{LISTING.localHeading}</h2>
                  <p className="t-sm ev-section-note">{LISTING.localNote}</p>
                </header>
                {local.length ? (
                  <Fragment>
                    <Months events={local} />
                  </Fragment>
                ) : (
                  <p className="t-sm ev-local-empty">{EMPTY.localEmpty}</p>
                )}
              </section>
            </EventFilter>
          </div>
        </div>
      </section>

      <section className="hx-band" data-tone="ink">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>02</b> {KINDS.kicker}
          </p>
          <div className="hx-cols ev-kinds" data-n="2" data-rows="3">
            {KINDS.sides.map((s) => (
              <div className="side" key={s.label}>
                <p className="side-label">{s.label}</p>
                <p className="side-line">{s.line}</p>
                <p className="t-sm side-note">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
