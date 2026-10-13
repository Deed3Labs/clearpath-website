'use client';

/* The category filter: a row of pills with a mono count in each, one pressed.
   Toggle buttons in a labelled group, which is what a filter over the list
   beside it is. On a phone the row scrolls inside itself, with an edge fade
   so it reads as more to the right rather than as cut off. */

export type CatOption<T extends string> = { value: T; label: string; count?: number };

export function CatChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly CatOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={['cats', className].filter(Boolean).join(' ')} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
