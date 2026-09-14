import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Chip } from '@/components/primitives';
import { LiveDot } from '@/components/primitives/Button';
import { EventChips } from '@/components/events/EventChips';
import { DETAIL, TYPES } from '@/content/events';
import { googleCalendarUrl } from '@/lib/events/ics';
import { clearEventSlugs, getEvent, isUpcoming } from '@/lib/events/sources';
import { longDate, timeRange } from '@/lib/events/time';

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

const FORMAT = { online: DETAIL.online, 'in-person': DETAIL.inPerson, hybrid: DETAIL.hybrid } as const;

export default async function EventPage({ params }: Props) {
  const e = await getEvent((await params).slug);
  if (!e) notFound();

  const over = !isUpcoming(e);
  const local = e.source === 'local';

  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b>
          <Link href="/events" className="shop-inline-link">
            Events
          </Link>
          <span aria-hidden="true">/</span>
          <span>{TYPES[e.type].label}</span>
        </p>

        <div className="hx-grid ev-detail">
          <div className="c-two-thirds ev-body">
            <div className="ev-chips">
              <EventChips event={e} />
              {e.cancelled ? (
                <Chip tone="absent">{DETAIL.cancelled.replace(/\.$/, '')}</Chip>
              ) : over ? (
                <Chip>Ended</Chip>
              ) : null}
            </div>
            <h1 className="ev-detail-title">{e.title}</h1>
            {e.summary && <p className="hx-lede">{e.summary}</p>}

            {e.description.map((p) => (
              <p className="t-body hx-prose" key={p}>
                {p}
              </p>
            ))}

            {local && <p className="t-body hx-prose">{DETAIL.localAbout}</p>}

            {e.agenda?.length ? (
              <div className="ev-agenda">
                <p className="side-label">{DETAIL.agenda}</p>
                <ol>
                  {e.agenda.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {e.type === 'investor-call' && <p className="t-sm ev-legal">{DETAIL.investorLegal}</p>}
          </div>

          <aside className="c-third ev-ticket">
            <dl className="ev-facts">
              {/* The type lives here rather than in the tags, which name
                  categories. A meeting's type is its category, so it is
                  not repeated for those. */}
              {!local && (
                <div>
                  <dt>{DETAIL.type}</dt>
                  <dd>{TYPES[e.type].label}</dd>
                </div>
              )}
              <div>
                <dt>{DETAIL.when}</dt>
                <dd>
                  {longDate(e.start)}
                  <br />
                  {e.timeUnknown ? 'Time to be posted' : timeRange(e.start, e.end)}
                  {e.provisional && <span className="ev-caveat">{DETAIL.scheduleCaveat}</span>}
                </dd>
              </div>
              <div>
                <dt>{DETAIL.where}</dt>
                {/* An address already says "in person", so it stands alone; the
                    format is only spelled out when it adds something. */}
                <dd>
                  {!e.location || e.location === DETAIL.online
                    ? FORMAT[e.format]
                    : e.format === 'hybrid'
                      ? `${FORMAT[e.format]}. ${e.location}`
                      : // An in-person address, or an online note that already says "Online".
                        e.location}
                </dd>
              </div>
              {(e.host || e.place) && (
                <div>
                  <dt>{local ? DETAIL.heldBy : DETAIL.host}</dt>
                  <dd>{e.host ?? e.place}</dd>
                </div>
              )}
              {!local && (
                <div>
                  <dt>{DETAIL.price}</dt>
                  <dd>{e.price ?? 'Free'}</dd>
                </div>
              )}
            </dl>

            {e.cancelled ? (
              <p className="t-sm ev-state">{DETAIL.cancelled}</p>
            ) : over ? (
              <p className="t-sm ev-state">{DETAIL.ended}</p>
            ) : local ? (
              e.officialUrl && (
                <a href={e.officialUrl} className="btn ev-cta" data-variant="primary" target="_blank" rel="noopener noreferrer">
                  <LiveDot />
                  {DETAIL.officialListing}
                </a>
              )
            ) : e.registerUrl ? (
              <a href={e.registerUrl} className="btn ev-cta" data-variant="primary" target="_blank" rel="noopener noreferrer">
                <LiveDot />
                {/lu\.ma|luma\.com/.test(e.registerUrl) ? DETAIL.register : DETAIL.registerGeneric}
              </a>
            ) : (
              <p className="t-sm ev-state">{DETAIL.noRegister}</p>
            )}

            {!over && !e.cancelled && (
              <div className="ev-add">
                <p className="side-label">{DETAIL.addTo}</p>
                <div className="ev-add-row">
                  <a href={googleCalendarUrl(e)} className="shop-inline-link" target="_blank" rel="noopener noreferrer">
                    {DETAIL.addGoogle}
                  </a>
                  <a href={`/events/${e.slug}/ics`} className="shop-inline-link">
                    {DETAIL.addIcs}
                  </a>
                </div>
              </div>
            )}

            {local && e.officialUrl && over && (
              <a href={e.officialUrl} className="shop-inline-link t-sm" target="_blank" rel="noopener noreferrer">
                {DETAIL.officialListing}
              </a>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
