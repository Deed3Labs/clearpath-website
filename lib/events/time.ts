/* Time, pinned to the Inland Empire.
 *
 * Every event is shown in Pacific time with the zone written out, because an
 * online call is joined from anywhere and "6:00 PM" alone is a guess. Dates
 * are formatted on the server only; nothing here runs in the browser, so the
 * Node-vs-browser Intl differences that bit the join form cannot reach a
 * hydration check.
 */

export const TZ = 'America/Los_Angeles';

/* Minutes east of UTC for Pacific time on a given UTC instant (-420 in
   summer, -480 in winter). */
function pacificOffsetMinutes(at: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value; // "GMT-7"
  const m = name?.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!m) return -480;
  const h = Number(m[1]);
  return h * 60 + Math.sign(h) * Number(m[2] ?? 0);
}

/* A wall-clock time in Pacific ("2026-09-15", 18, 0) as a real instant.
   Council calendars publish local times with no zone, so this is how they
   become comparable with everything else. */
export function pacificToDate(ymd: string, hour: number, minute: number): Date {
  const [y, mo, d] = ymd.split('-').map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d, hour, minute));
  const offset = pacificOffsetMinutes(guess);
  const at = new Date(guess.getTime() - offset * 60_000);
  // Re-check across a DST boundary: the offset at the real instant wins.
  const settled = pacificOffsetMinutes(at);
  return settled === offset ? at : new Date(guess.getTime() - settled * 60_000);
}

/* "6:00 PM", " 1:00AM", "18:00" → [18, 0]. Null when there is no time. */
export function parseClock(s: string | null | undefined): [number, number] | null {
  const m = s?.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return [h, min];
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts });

export const dayNumber = (d: Date) => fmt({ day: 'numeric' }).format(d);
export const weekdayShort = (d: Date) => fmt({ weekday: 'short' }).format(d);
export const monthShort = (d: Date) => fmt({ month: 'short' }).format(d);
export const monthYear = (d: Date) => fmt({ month: 'long', year: 'numeric' }).format(d);
export const longDate = (d: Date) => fmt({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d);
export const clock = (d: Date) => fmt({ hour: 'numeric', minute: '2-digit' }).format(d);

export function timeRange(start: Date, end?: Date | null): string {
  const zone = fmt({ timeZoneName: 'short' }).formatToParts(start).find((p) => p.type === 'timeZoneName')?.value ?? 'PT';
  return end ? `${clock(start)} – ${clock(end)} ${zone}` : `${clock(start)} ${zone}`;
}

/* Month key for grouping, in Pacific: "2026-09". */
export function monthKey(d: Date): string {
  const parts = fmt({ year: 'numeric', month: '2-digit' }).formatToParts(d);
  return `${parts.find((p) => p.type === 'year')?.value}-${parts.find((p) => p.type === 'month')?.value}`;
}

/* iCalendar UTC stamp: 20260915T010000Z */
export function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
