'use client';

/* The segmented toggle: a pill holding two to four pills, one pressed. A pill
   because it is a control — the one shape the site rounds. Each option is a
   toggle button (aria-pressed) inside a labelled group, which is what a
   screen reader expects of a choice that changes the view beside it. */

export type SegOption<T extends string> = { value: T; label: string };

export function Seg<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={['seg', className].filter(Boolean).join(' ')} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
