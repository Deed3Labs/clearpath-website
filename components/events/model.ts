import { DETAIL, GROUPS, LISTING, LOCAL_SOURCES, type EventFormat, type EventGroup } from '@/content/events';
import type { CalEvent } from '@/lib/events/sources';
import { dayNumber, monthKey, monthShort, monthYear, timeRange, weekdayShort } from '@/lib/events/time';

/* What the events pages say about an event, worked out once on the server.
   Every date string comes from lib/events/time.ts (Pacific); the browser only
   ever receives finished strings and plain keys ("2026-10-15"), so nothing
   about time is formatted on both sides of hydration. */

export const FORMAT: Record<EventFormat, string> = {
  online: DETAIL.online,
  'in-person': DETAIL.inPerson,
  hybrid: DETAIL.hybrid,
};

export const isLocal = (e: CalEvent) => e.source === 'local';

export const groupLabel = (g: EventGroup) => GROUPS.find((x) => x.key === g)?.label ?? g;

/* A local meeting's chip already names the place, so its title drops the
   "Place: " the feeds put in front ("Redlands: City Council" → "City
   Council"). */
export function shortTitle(e: CalEvent): string {
  if (!isLocal(e) || !e.place) return e.title;
  const prefix = `${e.place}: `;
  return e.title.startsWith(prefix) ? e.title.slice(prefix.length) : e.title;
}

/* Where, in a row: an address for a meeting, "Online" for a call. */
export function whereShort(e: CalEvent): string | undefined {
  if (isLocal(e)) return e.location;
  return e.format === 'online' ? FORMAT.online : (e.location ?? FORMAT[e.format]);
}

/* Where, on the ticket: an address already says "in person", so it stands
   alone; the format is only spelled out when it adds something. */
export function whereLong(e: CalEvent): string {
  if (isLocal(e)) return e.location ?? FORMAT[e.format];
  if (!e.location || e.location === DETAIL.online) return FORMAT[e.format];
  if (e.format === 'hybrid') return `${FORMAT[e.format]}. ${e.location}`;
  return e.location;
}

export const timeLabel = (e: CalEvent) => (e.timeUnknown ? LISTING.timeTbd : timeRange(e.start, e.end));

/* "2026-10-15", the event's day in Pacific. */
export function dayKey(d: Date): string {
  return `${monthKey(d)}-${dayNumber(d).padStart(2, '0')}`;
}

export type MonthName = { title: string; long: string; short: string };

export function monthName(d: Date): MonthName {
  const title = monthYear(d);
  return { title, long: title.replace(/\s+\d{4}$/, ''), short: monthShort(d) };
}

/* "Thu, Oct 15" */
export const shortDate = (d: Date) => `${weekdayShort(d)}, ${monthShort(d)} ${dayNumber(d)}`;

/* The calendars the local meetings come from: one line per place, with the
   systems it is read from. Built from LOCAL_SOURCES, never typed in. */
export function localCalendars(): { place: string; systems: string }[] {
  const by = new Map<string, Set<string>>();
  for (const s of LOCAL_SOURCES) {
    const set = by.get(s.place) ?? new Set<string>();
    set.add(LISTING.systems[s.kind]);
    by.set(s.place, set);
  }
  return [...by].map(([place, systems]) => ({ place, systems: [...systems].join(' · ') }));
}
