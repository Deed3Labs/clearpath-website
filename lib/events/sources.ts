import {
  CLEAR_FEEDS,
  EVENTS,
  LOCAL_HORIZON_DAYS,
  LOCAL_SOURCES,
  type EventFormat,
  type EventType,
  type LocalSource,
} from '@/content/events';
import { pacificToDate, parseClock } from './time';

/* Every source, normalised to one shape. */
export type CalEvent = {
  slug: string;
  source: 'clear' | 'feed' | 'local';
  title: string;
  type: EventType;
  start: Date;
  end: Date | null;
  /* True when a calendar gave a date but no time. */
  timeUnknown?: boolean;
  format: EventFormat;
  location?: string;
  summary?: string;
  description: string[];
  agenda?: string[];
  host?: string;
  /* The city or county, for local meetings. */
  place?: string;
  registerUrl?: string;
  officialUrl?: string;
  price?: string;
  cancelled: boolean;
  /* Set when the time comes from a regular schedule rather than an agenda. */
  provisional?: boolean;
};

/* How long a pulled calendar is trusted before it is fetched again. */
export const REVALIDATE_SECONDS = 3600;

/* Some city sites answer Vercel's servers far slower than a home connection,
   and some connections never open at all: San Bernardino's feed answers
   locally in 300ms but from Vercel has taken over 8s, and once failed to
   connect in 10s. A dropped connection usually succeeds on the next try, so
   each fetch gets a second attempt rather than one long wait. */
const TIMEOUT_MS = 10_000;
const ATTEMPTS = 2;

export function showDrafts(): boolean {
  if (process.env.EVENTS_SHOW_DRAFTS === 'true') return true;
  if (process.env.EVENTS_SHOW_DRAFTS === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

/* Fetchers THROW on failure. The listing catches per source, so one calendar
   being down costs only its own rows. An event page does not catch: a
   calendar that failed is not the same as a meeting that does not exist, and
   answering "not found" there got cached as a 404 for an hour. */
class HttpError extends Error {}

async function getText(url: string, accept: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: accept },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new HttpError(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      /* Retry a timeout or a dropped connection; a server that answered with
         an error status has answered, and asking again will not change it. */
      const retry = attempt < ATTEMPTS && !(err instanceof HttpError);
      console.error(
        `[events] fetch failed (attempt ${attempt}/${ATTEMPTS}${retry ? ', retrying' : ''})`,
        url,
        (err as Error).message,
      );
      if (!retry) throw err;
    }
  }
}

async function getJson<T>(url: string): Promise<T> {
  return JSON.parse(await getText(url, 'application/json')) as T;
}

/* Run every source; keep what succeeded. */
async function settled(jobs: Promise<CalEvent[]>[]): Promise<CalEvent[]> {
  return (await Promise.allSettled(jobs)).flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

/* ── Clear, by hand ─────────────────────────────────────────────────────── */

function clearEvents(): CalEvent[] {
  const drafts = showDrafts();
  return EVENTS.filter((e) => e.status !== 'draft' || drafts).map((e) => ({
    slug: e.slug,
    source: 'clear',
    title: e.title,
    type: e.type,
    start: new Date(e.startsAt),
    end: e.endsAt ? new Date(e.endsAt) : null,
    format: e.format,
    location: e.location,
    summary: e.summary,
    description: e.description,
    agenda: e.agenda,
    host: e.host,
    registerUrl: e.registerUrl,
    price: e.price,
    cancelled: e.status === 'cancelled',
  }));
}

/* ── iCal feeds (a Luma calendar's subscribe link, Google Calendar…) ────── */

function unescapeIcs(v: string): string {
  return v.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
}

function parseIcsDate(raw: string, params: string): { date: Date; timeUnknown: boolean } | null {
  if (/VALUE=DATE(?!-)/.test(params) || /^\d{8}$/.test(raw)) {
    const ymd = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    return { date: pacificToDate(ymd, 0, 0), timeUnknown: true };
  }
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (z) return { date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)), timeUnknown: false };
  // Floating or TZID time. Pacific is the only zone this calendar deals in.
  return { date: pacificToDate(`${y}-${mo}-${d}`, +h, +mi), timeUnknown: false };
}

function shortHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function classify(title: string): Exclude<EventType, 'local-government'> {
  if (/investor|capital/i.test(title)) return 'investor-call';
  if (/town ?hall/i.test(title)) return 'town-hall';
  if (/hearing/i.test(title)) return 'public-hearing';
  if (/forum|proposal/i.test(title)) return 'forum';
  return 'community-call';
}

export function parseIcs(text: string): CalEvent[] {
  const lines = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
  const out: CalEvent[] = [];
  let cur: Record<string, { value: string; params: string }> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') cur = {};
    else if (line === 'END:VEVENT' && cur) {
      const start = cur.DTSTART && parseIcsDate(cur.DTSTART.value, cur.DTSTART.params);
      const title = unescapeIcs(cur.SUMMARY?.value ?? '').trim();
      if (start && title) {
        const end = cur.DTEND && parseIcsDate(cur.DTEND.value, cur.DTEND.params);
        const description = unescapeIcs(cur.DESCRIPTION?.value ?? '');
        const location = unescapeIcs(cur.LOCATION?.value ?? '').trim();
        const url =
          cur.URL?.value ||
          [location, description].join(' ').match(/https?:\/\/(?:lu\.ma|luma\.com)\/[^\s)>"]+/)?.[0];
        const online = !location || /^https?:\/\//.test(location) || /zoom|meet\.google|online/i.test(location);
        out.push({
          slug: `cal-${shortHash(cur.UID?.value ?? `${title}${cur.DTSTART.value}`)}`,
          source: 'feed',
          title,
          type: classify(title),
          start: start.date,
          end: end ? end.date : null,
          timeUnknown: start.timeUnknown,
          format: online ? 'online' : 'in-person',
          location: online ? 'Online' : location,
          description: description
            .split(/\n{2,}/)
            .map((p) => p.replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .slice(0, 6),
          registerUrl: url,
          cancelled: /CANCELLED/i.test(cur.STATUS?.value ?? ''),
        });
      }
      cur = null;
    } else if (cur) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      const [name, ...params] = line.slice(0, i).split(';');
      cur[name.toUpperCase()] = { value: line.slice(i + 1), params: params.join(';') };
    }
  }
  return out;
}

async function getIcs(url: string): Promise<CalEvent[]> {
  return parseIcs(await getText(url, 'text/calendar'));
}

function feedUrls(): string[] {
  const extra = (process.env.EVENTS_ICS_URLS ?? '').split(',').map((u) => u.trim());
  return [...new Set([...CLEAR_FEEDS, ...extra].filter(Boolean))];
}

async function feedEvents(): Promise<CalEvent[]> {
  return settled(feedUrls().map(getIcs));
}

/* ── Local government ───────────────────────────────────────────────────── */

type LegistarEvent = {
  EventId: number;
  EventBodyName: string;
  EventDate: string;
  EventTime: string | null;
  EventLocation: string | null;
  EventComment: string | null;
  EventInSiteURL: string | null;
};

type WithAppsPage = {
  data: {
    pagination: { totalPages: number };
    records: {
      resourceId: number;
      name: string;
      startsAtUtc: string;
      endsAtUtc: string | null;
      location: string | null;
      closed: boolean;
    }[];
  };
};

type PrimeGovMeeting = {
  id: number;
  title: string;
  dateTime: string;
  location: string | null;
  zoomMeetingLink: string | null;
  meetingOnline?: boolean;
};

/* Locations arrive as whatever the clerk typed: line breaks, ALL CAPS, and
   sometimes a phone number and browser advice after the address. Keep the
   address, drop the rest, and set capitals as capitals. */
function tidyPlace(s: string | null): string | undefined {
  if (!s) return undefined;
  const parts = s
    .split(/\s*(?:\r?\n|,)\s*/)
    .map((p) => p.replace(/\s{2,}/g, ' ').trim())
    .filter((p) => p && !/\(\d{3}\)|\*|clerk|browser/i.test(p));
  const joined = parts.join(', ');
  return joined === joined.toUpperCase() ? titleCase(joined).replace(/\b(Ca)\b/g, 'CA') : joined;
}

function titleCase(t: string): string {
  const small = new Set(['and', 'of', 'the', 'for', 'to', 'a', 'an', 'in', 'on']);
  return t
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/* "CLOSED SESSION AND REGULAR MEETING OF THE MAYOR AND CITY COUNCIL - 09/16/2026" */
function tidyTitle(s: string): string {
  const t = s.replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/, '').trim();
  return t === t.toUpperCase() ? titleCase(t) : t;
}

function localEvent(src: LocalSource, id: number, title: string, start: Date, extra: Partial<CalEvent>): CalEvent {
  return {
    slug: `${src.kind}-${src.client}-${id}`,
    source: 'local',
    title,
    type: 'local-government',
    start,
    end: null,
    format: 'in-person',
    description: [],
    place: src.place,
    cancelled: false,
    ...extra,
  };
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fromSource(src: LocalSource): Promise<CalEvent[]> {
  const now = new Date();
  const horizon = new Date(now.getTime() + LOCAL_HORIZON_DAYS * 86_400_000);
  /* A month back as well as ahead, so an event page still resolves the day
     after the meeting. The listing drops what is over. */
  const since = new Date(now.getTime() - 30 * 86_400_000);

  if (src.kind === 'legistar') {
    const q = `$filter=EventDate ge datetime'${ymd(since)}' and EventDate le datetime'${ymd(horizon)}'&$orderby=EventDate`;
    const rows = await getJson<LegistarEvent[]>(`https://webapi.legistar.com/v1/${src.client}/events?${encodeURI(q)}`);
    return rows
      .filter((r) => src.bodies.test(r.EventBodyName))
      .map((r) => {
        const time = parseClock(r.EventTime);
        const start = pacificToDate(r.EventDate.slice(0, 10), time?.[0] ?? 0, time?.[1] ?? 0);
        return localEvent(src, r.EventId, `${src.place}: ${r.EventBodyName.trim()}`, start, {
          timeUnknown: !time,
          location: tidyPlace(r.EventLocation),
          officialUrl: r.EventInSiteURL ?? `https://${src.client}.legistar.com/Calendar.aspx`,
          cancelled: /cancel/i.test(r.EventComment ?? ''),
        });
      });
  }

  if (src.kind === 'ics') {
    return (await getIcs(src.url))
      .filter((e) => src.bodies.test(e.title) && e.start >= since && e.start <= horizon)
      .map((e) => ({
        ...e,
        slug: `ics-${src.client}-${e.slug.replace(/^cal-/, '')}`,
        source: 'local' as const,
        type: 'local-government' as const,
        title: `${src.place}: ${e.title.replace(/\s+meeting$/i, '').trim()}`,
        // CivicPlus ends every meeting at 23:59, which is not a real end time.
        end: null,
        format: 'in-person' as const,
        // "Library > Auditorium - 555 West 6th Street  San Bernardino CA 92410"
        location: tidyPlace(e.location?.replace(/\s+[>-]\s+/g, ', ') ?? null),
        description: [],
        registerUrl: undefined,
        place: src.place,
        officialUrl: src.agendasUrl,
        provisional: true,
      }));
  }

  if (src.kind === 'withapps') {
    const base = `https://api.withapps.io/api/v2/organizations/${src.organizationId}/calendar/resources`;
    const range =
      `filterBy%5BstartsAt%5D=${Math.floor(since.getTime() / 1000)}` +
      `&filterBy%5BendsAt%5D=${Math.floor(horizon.getTime() / 1000)}` +
      `&communityIds%5B0%5D=${src.communityId}&variant=full`;
    const records: WithAppsPage['data']['records'] = [];
    // Ten per page; a city calendar runs to a few pages over sixty days.
    for (let page = 1; page <= 10; page++) {
      const res = await getJson<WithAppsPage>(`${base}?${range}&page=${page}`);
      records.push(...res.data.records);
      if (page >= res.data.pagination.totalPages) break;
    }
    return records
      .filter((r) => src.bodies.test(r.name))
      .map((r) =>
        localEvent(src, r.resourceId, `${src.place}: ${r.name.replace(/\s+meeting$/i, '').trim()}`, new Date(r.startsAtUtc), {
          location: tidyPlace(r.location?.replace(/,\s*USA$/, '') ?? null),
          officialUrl: src.agendasUrl,
          cancelled: r.closed || /cancel/i.test(r.name),
          provisional: true,
        }),
      );
  }

  const rows = await getJson<PrimeGovMeeting[]>(
    `https://${src.client}.primegov.com/api/v2/PublicPortal/ListUpcomingMeetings`,
  );
  return rows
    .filter((r) => src.bodies.test(r.title))
    .map((r) => {
      const [date, clockPart = '00:00'] = r.dateTime.split('T');
      const [h, m] = clockPart.split(':').map(Number);
      const title = tidyTitle(r.title);
      return localEvent(src, r.id, `${src.place}: ${title}`, pacificToDate(date, h, m), {
        location: tidyPlace(r.location),
        format: r.zoomMeetingLink || r.meetingOnline ? 'hybrid' : 'in-person',
        // Agenda deep links on PrimeGov redirect to an error page for
        // anonymous visitors, so the link is the public portal itself.
        officialUrl: `https://${src.client}.primegov.com/public/portal`,
        cancelled: /cancel/i.test(r.title),
      });
    })
    .filter((e) => e.start <= horizon);
}

/* One meeting, two listings: a city's calendar has the schedule months out
   and its agenda system adds the same meeting once the agenda is posted. The
   agenda is the better record, so a scheduled entry is dropped when an
   agenda listing exists for the same place, day and kind of body. */
const BODY_KIND = /council|planning|supervisors|housing/i;

function pacificDay(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(d);
}

function dedupe(events: CalEvent[]): CalEvent[] {
  const posted = new Set(
    events
      .filter((e) => !e.provisional)
      .map((e) => `${e.place}|${pacificDay(e.start)}|${e.title.match(BODY_KIND)?.[0].toLowerCase()}`),
  );
  return events.filter(
    (e) => !e.provisional || !posted.has(`${e.place}|${pacificDay(e.start)}|${e.title.match(BODY_KIND)?.[0].toLowerCase()}`),
  );
}

async function localEvents(): Promise<CalEvent[]> {
  if (process.env.EVENTS_LOCAL === 'false') return [];
  return dedupe(await settled(LOCAL_SOURCES.map(fromSource)));
}

/* ── Together ───────────────────────────────────────────────────────────── */

export async function allEvents(): Promise<CalEvent[]> {
  const [feed, local] = await Promise.all([feedEvents(), localEvents()]);
  return [...clearEvents(), ...feed, ...local].sort((a, b) => a.start.getTime() - b.start.getTime());
}

/* Still worth showing: not over. An event without an end is treated as two
   hours long, a date-only one as the whole day. */
export function isUpcoming(e: CalEvent, now = new Date()): boolean {
  const end = e.end ?? new Date(e.start.getTime() + (e.timeUnknown ? 24 : 2) * 3_600_000);
  return end.getTime() > now.getTime();
}

/* An event page asks only the calendar its slug came from. Asking every
   source made a page depend on eight city servers at once, and a timeout in
   any one of them — even an unrelated city — could lose the meeting.
   Failures propagate (see getText); only a calendar that answered and does
   not list the slug is "not found". */
export async function getEvent(slug: string): Promise<CalEvent | undefined> {
  const find = (events: CalEvent[]) => events.find((e) => e.slug === slug);

  const local = LOCAL_SOURCES.find((src) => slug.startsWith(`${src.kind}-${src.client}-`));
  if (local) return find(await fromSource(local));

  if (slug.startsWith('cal-')) {
    for (const url of feedUrls()) {
      const hit = find(await getIcs(url));
      if (hit) return hit;
    }
    return undefined;
  }

  return find(clearEvents());
}

export function clearEventSlugs(): string[] {
  return clearEvents().map((e) => e.slug);
}
