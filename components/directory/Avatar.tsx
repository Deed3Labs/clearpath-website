import { initials } from '@/lib/directory';

/* A partner's square: the line icon for its kind of business, or its
   initials for a kind with no icon yet. Decorative — the name is beside it. */

const ICON: Record<string, string[]> = {
  'Auto & tires': ['M10 3a7 7 0 1 1 0 14a7 7 0 1 1 0-14z', 'M10 7.4a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0-5.2z', 'M10 3v4.4M10 12.6V17M3 10h4.4M12.6 10H17'],
  'Food & drink': ['M4 7.5h10v4.5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z M14 9h1.2a2.2 2.2 0 0 1 0 4.4H14 M7.5 2.5v2.5 M10.5 2.5v2.5'],
  Trades: ['M11.5 2 5 11h4.5L8.5 18 15 9h-4.5z'],
  'Personal care': ['M5.5 12a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z', 'M14.5 12a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z', 'M7.4 12.8 15 3M12.6 12.8 5 3'],
  'Home & garden': ['M3 9.5 10 3.5l7 6 M5 8.2V17h10V8.2 M8.5 17v-4.5h3V17'],
  Services: ['M4 2.5h12v15H4z', 'M10 7.4a3.6 3.6 0 1 1 0 7.2a3.6 3.6 0 1 1 0-7.2z', 'M6.5 5.5h3'],
};

export function Avatar({ category, name }: { category: string; name: string }) {
  const icon = ICON[category];
  return (
    <span className="av" aria-hidden="true">
      {icon ? (
        <svg viewBox="0 0 20 20">
          {icon.map((d) => (
            <path d={d} key={d} />
          ))}
        </svg>
      ) : (
        <span className="ini">{initials(name)}</span>
      )}
    </span>
  );
}
