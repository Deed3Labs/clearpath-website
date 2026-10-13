'use client';

import { useEffect, useState } from 'react';

/* A clock that counts down to a start. The server cannot know the second the
   page is read, so it renders a static "Starts …" line, and the clock takes
   over once this has mounted. Both are laid out in the same box (the line
   sits over the hidden cells), so nothing moves when it does. With JavaScript
   off the line is all there is, and it is complete. */

type Parts = { d: number; h: number; m: number; s: number };

function parts(ms: number): Parts {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, '0');

function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

/* The hero card's four cells. */
export function Countdown({
  at,
  label,
  units,
  fallback,
}: {
  at: string;
  label: string;
  units: { d: string; h: string; m: string; s: string };
  fallback: string;
}) {
  const now = useNow();
  const p = now === null ? null : parts(Date.parse(at) - now);
  const cells: [keyof Parts, string][] = [
    ['d', p ? String(p.d) : '0'],
    ['h', p ? pad(p.h) : '00'],
    ['m', p ? pad(p.m) : '00'],
    ['s', p ? pad(p.s) : '00'],
  ];
  return (
    <div className="cd" data-live={p ? '' : undefined}>
      <div className="cd-cells" role="timer" aria-label={label} aria-hidden={p ? undefined : true}>
        {cells.map(([u, v]) => (
          <div key={u}>
            <b>{v}</b>
            <span>{units[u]}</span>
          </div>
        ))}
      </div>
      {!p && <p className="cd-s">{fallback}</p>}
    </div>
  );
}

/* The ticket's one line: "Starts in 2d 4h 05m", or under a day the seconds. */
export function StartsIn({
  at,
  label,
  fallbackLabel,
  fallback,
}: {
  at: string;
  label: string;
  fallbackLabel: string;
  fallback: string;
}) {
  const now = useNow();
  if (now === null) {
    return (
      <p className="starts">
        <span>{fallbackLabel}</span>
        <b>{fallback}</b>
      </p>
    );
  }
  const p = parts(Date.parse(at) - now);
  return (
    <p className="starts">
      <span>{label}</span>
      <b role="timer">{p.d ? `${p.d}d ${p.h}h ${pad(p.m)}m` : `${p.h}h ${pad(p.m)}m ${pad(p.s)}s`}</b>
    </p>
  );
}
