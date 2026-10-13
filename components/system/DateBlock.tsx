import { dayNumber, monthShort, weekdayShort } from '@/lib/events/time';

/* Weekday, day, month in a ruled box, in Pacific time like every other event
   date on the site. Decorative: the row or ticket beside it states the date
   in words, so the box is hidden from assistive tech rather than read twice. */

export function DateBlock({ date, size = 'md', className }: { date: Date; size?: 'sm' | 'md'; className?: string }) {
  return (
    <span className={['dt', className].filter(Boolean).join(' ')} data-size={size} aria-hidden="true">
      <i>{weekdayShort(date)}</i>
      <b>{dayNumber(date)}</b>
      <em>{monthShort(date)}</em>
    </span>
  );
}
