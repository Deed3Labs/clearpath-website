import type { CalEvent } from './sources';
import { icsStamp } from './time';

const SITE = 'https://useclear.org';

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
}

/* RFC 5545 wants lines under 75 octets, continued with a leading space. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    out.push(rest.slice(0, 73));
    rest = ` ${rest.slice(73)}`;
  }
  out.push(rest);
  return out.join('\r\n');
}

export function endOf(e: CalEvent): Date {
  return e.end ?? new Date(e.start.getTime() + (e.timeUnknown ? 24 : 1) * 3_600_000);
}

function vevent(e: CalEvent): string[] {
  const url = e.registerUrl ?? e.officialUrl ?? `${SITE}/events/${e.slug}`;
  const details = [e.summary, `${SITE}/events/${e.slug}`].filter(Boolean).join('\n\n');
  return [
    'BEGIN:VEVENT',
    `UID:${e.slug}@useclear.org`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(e.start)}`,
    `DTEND:${icsStamp(endOf(e))}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(details)}`,
    ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
    `URL:${url}`,
    ...(e.cancelled ? ['STATUS:CANCELLED'] : []),
    'END:VEVENT',
  ];
}

export function calendar(events: CalEvent[], name: string): string {
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Clear Cooperative//Events//EN',
      'CALSCALE:GREGORIAN',
      `X-WR-CALNAME:${esc(name)}`,
      'X-WR-TIMEZONE:America/Los_Angeles',
      ...events.flatMap(vevent),
      'END:VCALENDAR',
    ]
      .map(fold)
      .join('\r\n') + '\r\n'
  );
}

export function googleCalendarUrl(e: CalEvent): string {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${icsStamp(e.start)}/${icsStamp(endOf(e))}`,
    details: [e.summary, `${SITE}/events/${e.slug}`].filter(Boolean).join('\n\n'),
    ...(e.location ? { location: e.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
