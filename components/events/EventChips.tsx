import { Chip } from '@/components/primitives';
import { GROUPS } from '@/content/events';
import type { CalEvent } from '@/lib/events/sources';

/* One tag per category the event belongs to — the same names as the filter
   buttons, so a tag says exactly which filters show the event. The event's
   type ("Board meeting", "Town hall") is on its own page, not in the tags. */
export function EventChips({ event: e }: { event: CalEvent }) {
  return (
    <>
      {e.groups.map((g) => (
        <Chip key={g}>{GROUPS.find((x) => x.key === g)?.label ?? g}</Chip>
      ))}
    </>
  );
}
