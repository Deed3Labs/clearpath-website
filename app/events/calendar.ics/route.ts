import { calendar } from '@/lib/events/ics';
import { allEvents } from '@/lib/events/sources';

/* Five minutes, to match Clear's feeds (see CLEAR_FEED_REVALIDATE_SECONDS).
   City calendars inside are still fetched hourly: each fetch keeps its own
   cache, so re-rendering sooner does not ask their servers more often. */
export const revalidate = 300;

/* A subscribable calendar of Clear's own events. Local government meetings
   are left out: they belong to their cities' calendars, and a subscriber to
   Clear should not get forty planning commissions. */
export async function GET() {
  const events = (await allEvents()).filter((e) => e.source !== 'local');
  return new Response(calendar(events, 'Clear events'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}
