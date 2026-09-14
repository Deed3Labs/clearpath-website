import { calendar } from '@/lib/events/ics';
import { getEvent } from '@/lib/events/sources';

/* Five minutes, to match Clear's feeds (see CLEAR_FEED_REVALIDATE_SECONDS).
   City calendars inside are still fetched hourly: each fetch keeps its own
   cache, so re-rendering sooner does not ask their servers more often. */
export const revalidate = 300;

/* One event as an .ics file: "add to Apple Calendar / Outlook". */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return new Response('Not found', { status: 404 });
  return new Response(calendar([event], event.title), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
    },
  });
}
