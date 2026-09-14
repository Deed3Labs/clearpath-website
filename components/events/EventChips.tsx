import { Chip } from '@/components/primitives';
import { GROUPS, TYPES } from '@/content/events';
import type { CalEvent } from '@/lib/events/sources';

/* The type ("Board meeting"), then one tag per extra category the event also
   belongs to ("Investors"). The type already implies its own category, so
   that one is not repeated. */
export function EventChips({ event: e }: { event: CalEvent }) {
  const primary = TYPES[e.type].group;
  const extra = e.groups.filter((g) => g !== primary);
  return (
    <>
      <Chip>{TYPES[e.type].label}</Chip>
      {extra.map((g) => (
        <Chip key={g}>{GROUPS.find((x) => x.key === g)?.label ?? g}</Chip>
      ))}
    </>
  );
}
