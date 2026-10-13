import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Chip, CrumbLink, Crumbbar, LiveDot, Ticket, type TicketFact } from '@/components/system';
import { StartsIn } from '@/components/events/Countdown';
import { EventChips, EventRow } from '@/components/events/EventRow';
import { RiseIn } from '@/components/events/Motion';
import { isLocal, shortDate, shortTitle, timeLabel, whereLong } from '@/components/events/model';
import { DETAIL, LISTING, TYPES } from '@/content/events';
import { googleCalendarUrl } from '@/lib/events/ics';
import { allEvents, clearEventSlugs, getEvent, isUpcoming } from '@/lib/events/sources';
import { longDate, timeRange } from '@/lib/events/time';
import '../page.css';

/* Five minutes, to match Clear's feeds (see CLEAR_FEED_REVALIDATE_SECONDS).
   City calendars inside are still fetched hourly: each fetch keeps its own
   cache, so re-rendering sooner does not ask their servers more often. */
export const revalidate = 300;

/* Clear's own events are built ahead; pulled ones (feeds, council meetings)
   render on first request and are cached for the hour. */
export function generateStaticParams() {
  return clearEventSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getEvent((await params).slug);
  if (!e) return {};
  return {
    title: `${e.title} · Events`,
    description: e.summary ?? `${TYPES[e.type].label}, ${longDate(e.start)}.`,
    ...(e.source === 'local' && { robots: { index: false } }),
  };
}

/* An event's page, ported from the mockup's event view: the crumb bar, the
   body cell (what it is, in full), and a ticket beside it (when and where,
   then what to do). Under it, the next few of the same kind.

   The event itself comes from getEvent, which asks only the calendar its
   slug came from and throws when that calendar is down (error.tsx says so).
   "Also coming up" reads the whole calendar, which never throws: a city
   that is down only costs its own rows there. */
export default async function EventPage({ params }: Props) {
  const e = await getEvent((await params).slug);
  if (!e) notFound();

  const over = !isUpcoming(e);
  const local = isLocal(e);
  const investors = e.type === 'investor-call' || e.groups.includes('investors');

  const facts: TicketFact[] = [
    /* A meeting's type is its category, so it is not repeated for those. */
    ...(!local ? [{ k: DETAIL.type, v: TYPES[e.type].label }] : []),
    {
      k: DETAIL.when,
      v: (
        <>
          {longDate(e.start)}
          <br />
          {timeLabel(e)}
          {e.provisional && <span className="cav">{DETAIL.scheduleCaveat}</span>}
        </>
      ),
    },
    { k: DETAIL.where, v: whereLong(e) },
    ...(e.host || e.place ? [{ k: local ? DETAIL.heldBy : DETAIL.host, v: e.host ?? e.place }] : []),
    ...(!local ? [{ k: DETAIL.price, v: e.price ?? LISTING.free }] : []),
  ];

  const now = new Date();
  const more = (await allEvents().catch(() => []))
    .filter((x) => isUpcoming(x, now) && x.slug !== e.slug && isLocal(x) === local)
    .slice(0, 3);

  const startsAt = `${shortDate(e.start)}${e.timeUnknown ? '' : `, ${timeRange(e.start)}`}`;

  return (
    <div className="pg-events">
      <Crumbbar
        crumbs={[{ href: '/events', label: DETAIL.crumb }, { label: local ? (e.place ?? TYPES[e.type].label) : TYPES[e.type].label }]}
        action={<CrumbLink href="/events">{DETAIL.all}</CrumbLink>}
      />
      <section className="wrap vsec">
        <RiseIn className="ed" id="ed" gate sel=":scope > .body > *, :scope > .tk > *" y={12} duration={0.5} stagger={0.05}>
          <div className="cell body" data-cancelled={e.cancelled ? '' : undefined}>
            <div className="chips">
              <EventChips event={e} />
              {e.cancelled ? <Chip tone="absent">{LISTING.cancelled}</Chip> : over ? <Chip>{DETAIL.endedChip}</Chip> : null}
            </div>
            <h1>{shortTitle(e)}</h1>
            {e.summary && <p className="lede">{e.summary}</p>}
            {e.description.map((p) => (
              <p className="copy" key={p}>
                {p}
              </p>
            ))}
            {local && <p className="copy">{DETAIL.localAbout}</p>}
            {e.agenda?.length ? (
              <div>
                <span className="label">{DETAIL.agenda}</span>
                <ol className="agl">
                  {e.agenda.map((a, i) => (
                    <li key={a}>
                      <b>{String(i + 1).padStart(2, '0')}</b>
                      {a}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {investors && <p className="legal2">{DETAIL.investorLegal}</p>}
          </div>

          <Ticket who={local ? DETAIL.publicMeeting : DETAIL.whenWhere} ck={local ? DETAIL.open : (e.price ?? LISTING.free)} facts={facts}>
            {e.cancelled ? (
              <p className="state">{DETAIL.cancelled}</p>
            ) : over ? (
              <>
                <p className="state">{DETAIL.ended}</p>
                {local && e.officialUrl && (
                  <a className="inl state" href={e.officialUrl} target="_blank" rel="noopener noreferrer">
                    {DETAIL.officialListing}
                  </a>
                )}
              </>
            ) : (
              <>
                <StartsIn at={e.start.toISOString()} label={DETAIL.startsIn} fallbackLabel={DETAIL.starts} fallback={startsAt} />
                {local ? (
                  e.officialUrl && (
                    <a className="btn" data-variant="primary" href={e.officialUrl} target="_blank" rel="noopener noreferrer">
                      <LiveDot />
                      {DETAIL.officialListing}
                    </a>
                  )
                ) : e.registerUrl ? (
                  <a className="btn" data-variant="primary" href={e.registerUrl} target="_blank" rel="noopener noreferrer">
                    <LiveDot />
                    {/lu\.ma|luma\.com/.test(e.registerUrl) ? DETAIL.register : DETAIL.registerGeneric}
                  </a>
                ) : (
                  <p className="state">{DETAIL.noRegister}</p>
                )}
                <span className="label adds-l">{DETAIL.addTo}</span>
                <div className="adds">
                  <a className="btn" data-variant="ghost" href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer">
                    {DETAIL.addGoogle}
                  </a>
                  <a className="btn" data-variant="ghost" href={`/events/${e.slug}/ics`}>
                    {DETAIL.addIcs}
                  </a>
                </div>
              </>
            )}
          </Ticket>
        </RiseIn>

        {more.length > 0 && (
          <div className="more2">
            <div className="sec-label label">
              <b>{DETAIL.more.n}</b>
              {DETAIL.more.label}
            </div>
            <div className="bx2">
              {more.map((x) => (
                <EventRow event={x} key={x.slug} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
