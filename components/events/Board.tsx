'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CatChips } from '@/components/system/CatChips';
import { Back } from '@/components/system/icons';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { BOARD, EMPTY, GROUPS, LISTING, type EventGroup } from '@/content/events';

/* The board: the category chips, a month on the left and the agenda on the
   right (below 900px a strip of the next 35 days stands in for the month).

   The rows are rendered on the server and handed in whole, with plain keys
   beside them ("2026-10-15"), so every date the reader sees was formatted by
   lib/events/time.ts and this file only compares strings and counts days.
   The first render is the whole calendar, unfiltered, which is what a reader
   without JavaScript gets. */

export type Filter = EventGroup | 'all';
export type BoardRow = { slug: string; day: string; month: string; groups: EventGroup[]; local: boolean; node: ReactNode };
export type Month = { title: string; long: string; short: string };

/* ── Shared state: the board and section 02's "See them" both set it ──── */

type State = {
  filter: Filter;
  day: string | null;
  pick: (f: Filter) => void;
  pickDay: (k: string | null) => void;
  see: (f: Filter) => void;
  bump: number;
};
const Ctx = createContext<State | null>(null);

const headH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head-h')) || 68;

export function BoardState({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [day, setDay] = useState<string | null>(null);
  /* Counts user changes, so the rows re-enter only after one. */
  const [bump, setBump] = useState(0);

  const pick = useCallback((f: Filter) => {
    setFilter(f);
    setDay(null);
    setBump((b) => b + 1);
  }, []);
  const pickDay = useCallback((k: string | null) => {
    setDay((d) => (d === k ? null : k));
    setBump((b) => b + 1);
  }, []);
  const see = useCallback((f: Filter) => {
    setFilter(f);
    setDay(null);
    /* Scroll once the filtered board has rendered: the page is shorter by
       then, and WebKit drops a smooth scroll whose page shrinks under it. */
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const cal = document.getElementById('cal');
        if (cal) window.scrollTo({ top: cal.getBoundingClientRect().top + window.scrollY - headH() - 12, behavior: motionOK() ? 'smooth' : 'auto' });
        window.setTimeout(() => setBump((b) => b + 1), motionOK() ? 450 : 0);
      }),
    );
  }, []);

  const value = useMemo(() => ({ filter, day, pick, pickDay, see, bump }), [filter, day, pick, pickDay, see, bump]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useBoard(): State {
  const s = useContext(Ctx);
  if (!s) throw new Error('BoardState is missing');
  return s;
}

/* Section 02's action: set the filter, go to the board. */
export function SeeThem({ group, children }: { group: EventGroup; children: ReactNode }) {
  const { see } = useBoard();
  return (
    <button type="button" onClick={() => see(group)}>
      {children}
    </button>
  );
}

/* ── Day arithmetic on keys. A key is already a Pacific day, so plain UTC
   dates count days without any time zone getting a say. ───────────────── */

const pad = (n: number) => String(n).padStart(2, '0');
const parse = (k: string) => k.split('-').map(Number);
const keyOf = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function Pips({ clear, local }: { clear: number; local: number }) {
  return (
    <span className="pips" aria-hidden="true">
      {Array.from({ length: Math.min(clear, 2) }, (_, i) => (
        <i className="pip" key={`c${i}`} />
      ))}
      {Array.from({ length: Math.min(local, 2) }, (_, i) => (
        <i className="pip lo" key={`l${i}`} />
      ))}
    </span>
  );
}

export function Board({
  rows,
  months,
  today,
  todayLabel,
  clearEmpty,
  calendars,
}: {
  rows: BoardRow[];
  months: Record<string, Month>;
  today: string;
  todayLabel: string;
  /* The empty state with the notify field, for when no Clear event is posted. */
  clearEmpty: ReactNode;
  calendars: { place: string; systems: string }[];
}) {
  const { filter, day, pick, pickDay, bump } = useBoard();
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const todayMonth = today.slice(0, 7);

  /* ── What matches ─────────────────────────────────────────────────────── */
  const inCat = useCallback((r: BoardRow) => filter === 'all' || r.groups.includes(filter), [filter]);
  const match = (r: BoardRow) => inCat(r) && (!day || r.day === day);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) for (const g of r.groups) c[g] = (c[g] ?? 0) + 1;
    return c;
  }, [rows]);

  const byDay = useMemo(() => {
    const m = new Map<string, BoardRow[]>();
    for (const r of rows) m.set(r.day, [...(m.get(r.day) ?? []), r]);
    return m;
  }, [rows]);

  const clearRows = rows.filter((r) => !r.local);
  const localRows = rows.filter((r) => r.local);
  const cVis = clearRows.filter(match).length;
  const lVis = localRows.filter(match).length;
  const showClear = cVis > 0 || (!clearRows.length && filter === 'all' && !day);
  const showLocal = lVis > 0 || (!localRows.length && (filter === 'all' || filter === 'local') && !day);
  const dayName = (k: string) => `${months[k.slice(0, 7)]?.short ?? ''} ${Number(k.slice(8))}`;
  const longDay = (k: string) => `${months[k.slice(0, 7)]?.long ?? ''} ${Number(k.slice(8))}`;

  /* ── The month: today's, then only months with something on ───────────── */
  const navMonths = useMemo(
    () => [...new Set([todayMonth, ...rows.map((r) => r.month)])].filter((m) => m >= todayMonth).sort(),
    [rows, todayMonth],
  );
  const [month, setMonth] = useState(todayMonth);
  const mi = navMonths.indexOf(month);
  const shift = (n: number) => {
    const next = navMonths[mi + n];
    if (!next) return;
    setMonth(next);
    const grid = gridRef.current;
    if (grid && motionOK())
      requestAnimationFrame(() => gsap.from(grid.querySelectorAll('.day'), { opacity: 0, x: n * 8, duration: 0.3, stagger: 0.006 }));
  };

  /* A day picked on the strip may sit in another month; the month follows. */
  useEffect(() => {
    if (day && navMonths.includes(day.slice(0, 7))) setMonth(day.slice(0, 7));
  }, [day, navMonths]);

  const dayCell = (k: string, n: number, strip?: string) => {
    const es = byDay.get(k) ?? [];
    const has = es.length > 0;
    const dim = has && !es.some(inCat);
    const cls = ['day', !strip && k < today && 'past', k === today && 'today', has && 'has', dim && 'dim'].filter(Boolean).join(' ');
    const pips = <Pips clear={es.filter((e) => !e.local).length} local={es.filter((e) => e.local).length} />;
    if (!has && !strip)
      return (
        <span className={cls} key={k}>
          {n}
          <span className="pips" />
        </span>
      );
    return (
      <button
        type="button"
        className={cls}
        key={k}
        aria-pressed={day === k}
        aria-label={has ? BOARD.dayLabel(longDay(k), es.length) : undefined}
        disabled={!has}
        onClick={() => pickDay(k)}
      >
        {strip && <i>{strip}</i>}
        {n}
        {pips}
      </button>
    );
  };

  const [y, m] = parse(month);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const [ty, tm, td] = parse(today);
  const strip = Array.from({ length: 35 }, (_, i) => new Date(Date.UTC(ty, tm - 1, td + i)));

  /* ── After a change: the day's row into view, and the rows re-enter ──── */
  const lastDay = useRef<string | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !bump) return;
    if (day && day !== lastDay.current && window.innerWidth > 900) {
      const r = root.querySelector<HTMLElement>(`.agenda .row[data-day="${day}"]`);
      const cal = document.getElementById('cal');
      if (r && cal) {
        const top = r.getBoundingClientRect().top + window.scrollY - 160;
        const calTop = cal.getBoundingClientRect().top + window.scrollY - headH() - 12;
        window.scrollTo({ top: Math.max(top, calTop), behavior: motionOK() ? 'smooth' : 'auto' });
      }
    }
    lastDay.current = day;
    if (!motionOK()) return;
    const ctx = gsap.context(() => {
      gsap.from(root.querySelectorAll('.agenda .row, .agenda .mo'), {
        opacity: 0,
        y: 8,
        duration: 0.4,
        stagger: 0.025,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      });
    }, root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bump]);

  /* ── The calendars list under "9 public calendars" ───────────────────── */
  const [srcOpen, setSrcOpen] = useState(false);
  const srcRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!srcOpen) return;
    const down = (e: PointerEvent) => {
      if (!srcRef.current?.contains(e.target as Node)) setSrcOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSrcOpen(false);
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [srcOpen]);

  const list = (rs: BoardRow[]) => {
    const out: ReactNode[] = [];
    let last = '';
    for (const r of rs.filter(match)) {
      if (r.month !== last) {
        out.push(
          <p className="mo" key={`mo-${r.month}`}>
            {months[r.month]?.title}
          </p>,
        );
        last = r.month;
      }
      out.push(
        <article className="row" key={r.slug} data-day={r.day}>
          {r.node}
        </article>,
      );
    }
    return out;
  };

  const options = GROUPS.filter((g) => g.key === 'all' || counts[g.key]).map((g) => ({
    value: g.key as Filter,
    label: g.label,
    count: counts[g.key] ?? 0,
  }));

  return (
    <div ref={ref} className="board-w">
      <div className="evbar">
        <CatChips label={BOARD.filterLabel} options={options} value={filter} onChange={pick} />
        <span className="ck">{day ? BOARD.onDay(cVis + lVis, dayName(day)) : BOARD.upcoming(cVis + lVis)}</span>
      </div>

      <div className="board">
        <aside className="mcal" aria-label={BOARD.calLabel}>
          <div className="mcal-in">
            <div className="c-h">
              <span className="mt">{months[month]?.title}</span>
              <span className="mnav">
                <button type="button" aria-label={BOARD.prev} disabled={mi <= 0} onClick={() => shift(-1)}>
                  <Back />
                </button>
                <button type="button" className="fw" aria-label={BOARD.next} disabled={mi >= navMonths.length - 1} onClick={() => shift(1)}>
                  <Back />
                </button>
              </span>
            </div>
            <div className="grid7" ref={gridRef}>
              {BOARD.weekdays.map((w, i) => (
                <span className="wd" key={i} aria-hidden="true">
                  {w}
                </span>
              ))}
              {Array.from({ length: first }, (_, i) => (
                <span className="day out" key={`o${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => dayCell(`${month}-${pad(i + 1)}`, i + 1))}
            </div>
            <div className="legend">
              <span>
                <i className="pip" aria-hidden="true" />
                {BOARD.legendClear}
              </span>
              <span>
                <i className="pip lo" aria-hidden="true" />
                {BOARD.legendLocal}
              </span>
            </div>
            <div className="c-f">
              {day ? (
                <>
                  <span>{BOARD.showing(dayName(day))}</span>
                  <button type="button" onClick={() => pickDay(day)}>
                    {BOARD.showAll}
                  </button>
                </>
              ) : (
                <span>{BOARD.today(todayLabel)}</span>
              )}
            </div>
          </div>
        </aside>

        <div className="agenda">
          <div className="dstrip" role="group" aria-label={BOARD.stripLabel}>
            {strip.map((d) => dayCell(keyOf(d), d.getUTCDate(), BOARD.stripWeekdays[d.getUTCDay()]))}
          </div>

          {showClear && (
            <section className="ag-sec" aria-labelledby="ag-clear">
              <header className="ag-h">
                <h2 id="ag-clear">{LISTING.clearHeading}</h2>
                <span className="ck">{cVis ? BOARD.upcoming(cVis) : ''}</span>
              </header>
              {clearRows.length ? list(clearRows) : clearEmpty}
            </section>
          )}

          {showLocal && (
            <section className="ag-sec" aria-labelledby="ag-local">
              <header className="ag-h">
                <h2 id="ag-local">{LISTING.localHeading}</h2>
                <div className="srcs" ref={srcRef}>
                  <button type="button" aria-expanded={srcOpen} aria-controls="srcs-l" onClick={() => setSrcOpen((o) => !o)}>
                    <span className="live-dot" aria-hidden="true" />
                    {LISTING.sources(calendars.length)}
                  </button>
                  <ul id="srcs-l" hidden={!srcOpen}>
                    {calendars.map((c) => (
                      <li key={c.place}>
                        {c.place}
                        <span>{c.systems}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </header>
              <p className="ag-note">{LISTING.localNote}</p>
              {localRows.length ? list(localRows) : <p className="nomatch">{EMPTY.localEmpty}</p>}
            </section>
          )}

          {!showClear && !showLocal && <p className="nomatch">{LISTING.noMatches}</p>}
        </div>
      </div>
    </div>
  );
}
