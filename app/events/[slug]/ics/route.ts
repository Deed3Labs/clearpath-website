import { calendar } from '@/lib/events/ics';
import { getEvent } from '@/lib/events/sources';

export const revalidate = 3600;

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
