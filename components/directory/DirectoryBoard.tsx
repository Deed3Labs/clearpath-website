'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CatChips } from '@/components/system/CatChips';
import { Chip } from '@/components/primitives';
import { LiveDot } from '@/components/primitives/Button';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';
import { EMPTY, MAP, OPENING, type Partner } from '@/content/directory';
import { Avatar } from './Avatar';
import { MapArt } from './MapArt';
import { PartnerRow } from './PartnerRow';

/* The directory board: search and the kinds of business above, the list on
   the left and the drawn map on the right (above the list below 900px).

   The list is the content. The map is the same partners again, as pins, and
   the two are linked: pointing at a row lights its pin, pointing at a pin
   lights its row and names it. Filtering fades the pins that drop out. Under
   the legend, a peek at the partner you are pointing at, or the towns, as
   chips that narrow the list to one. */

export function DirectoryBoard({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [town, setTown] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; p: Partner } | null>(null);
  const [bump, setBump] = useState(0);
  const q = query.trim().toLowerCase();

  const listRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bySlug = useMemo(() => new Map(partners.map((p) => [p.slug, p])), [partners]);
  const cats = useMemo(() => [...new Set(partners.map((p) => p.category))].sort((a, b) => a.localeCompare(b)), [partners]);
  const towns = useMemo(() => [...new Set(partners.map((p) => p.city))].sort((a, b) => a.localeCompare(b)), [partners]);

  const shown = partners.filter(
    (p) =>
      (cat === 'all' || p.category === cat) &&
      (!town || p.city === town) &&
      (!q || `${p.name} ${p.category} ${p.city}`.toLowerCase().includes(q)),
  );
  const off = new Set(partners.filter((p) => !shown.includes(p)).map((p) => p.slug));

  /* The tooltip sits over the pin, measured from the drawing as it is now. */
  const point = useCallback(
    (slug: string | null) => {
      setHot(slug);
      const wrap = mapRef.current;
      const pin = slug ? wrap?.querySelector(`.pin[data-slug="${CSS.escape(slug)}"] .pc2`) : null;
      const p = slug ? bySlug.get(slug) : undefined;
      if (!wrap || !pin || !p) return setTip(null);
      const r = pin.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      setTip({ x: r.left + r.width / 2 - w.left, y: r.top - w.top, p });
    },
    [bySlug],
  );

  /* Pins drop in once the board has arrived. */
  useEffect(() => {
    const wrap = mapRef.current;
    const pins = wrap?.querySelectorAll('.pin');
    if (!wrap || !pins?.length || !motionOK()) return;
    const ctx = gsap.context(() => {
      /* fromTo: the pins' CSS opacity transition must not be read as the
         end value. Pins filtered out keep their own faded opacity after. */
      gsap.fromTo(pins, { opacity: 0, y: -14 }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        delay: 0.9,
        ease: 'back.out(2)',
        clearProps: 'opacity,transform',
      });
    }, wrap);
    return () => ctx.revert();
  }, []);

  /* Rows re-enter after a change of category or town. */
  useIsoLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !bump || !motionOK() || !el.querySelector('.prow')) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.prow'), { opacity: 0, y: 8, duration: 0.35, stagger: 0.03, ease: 'power3.out', clearProps: 'opacity,transform' });
    }, el);
    return () => ctx.revert();
  }, [bump]);

  const onPin = (e: React.MouseEvent<HTMLDivElement>) => {
    const pin = (e.target as Element).closest('.pin');
    if (!pin) return;
    const slug = pin.getAttribute('data-slug')!;
    /* On a touch screen the first tap points (lights the pin and its row),
       the second goes. */
    if (window.matchMedia('(hover: none)').matches && hot !== slug) {
      point(slug);
      listRef.current?.querySelector(`.prow[data-slug="${CSS.escape(slug)}"]`)?.scrollIntoView({ block: 'nearest', behavior: motionOK() ? 'smooth' : 'auto' });
      return;
    }
    router.push(`/directory/${slug}`);
  };

  const hp = hot ? bySlug.get(hot) : undefined;
  const has = partners.length > 0;

  return (
    <>
      <div className="dbar">
        <label className={query ? 'srch has' : 'srch'} hidden={!has}>
          <span className="sr-only">{OPENING.searchLabel}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.75" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={OPENING.searchPlaceholder}
            autoComplete="off"
          />
          <button
            type="button"
            className="clr"
            aria-label={OPENING.clearSearch}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        </label>
        {has && (
          <CatChips
            label={OPENING.catLabel}
            options={[
              { value: 'all', label: OPENING.all, count: partners.length },
              ...cats.map((c) => ({ value: c, label: c, count: partners.filter((p) => p.category === c).length })),
            ]}
            value={cat}
            onChange={(c) => {
              setCat(c);
              setBump((b) => b + 1);
            }}
          />
        )}
      </div>

      <div className="dboard">
        <div className="dlist" ref={listRef} onPointerLeave={() => point(null)}>
          <div className="c-h">
            <span className="who">{OPENING.list}</span>
            <span className="ck" aria-live="polite">
              {has ? OPENING.count(shown.length) : OPENING.none}
            </span>
          </div>
          {!has ? (
            <div className="dempty">
              <Chip tone="underway">{EMPTY.chip}</Chip>
              <h3>{EMPTY.heading}</h3>
              <p>{EMPTY.lede}</p>
              <Link className="btn" data-variant="primary" href="/shops">
                <LiveDot />
                {EMPTY.shopButton}
              </Link>
            </div>
          ) : shown.length ? (
            <div
              onPointerOver={(e) => {
                const r = (e.target as Element).closest('.prow');
                const slug = r?.getAttribute('data-slug');
                if (slug && slug !== hot) point(slug);
              }}
            >
              {shown.map((p) => (
                <PartnerRow key={p.slug} p={p} q={q} hot={hot === p.slug} />
              ))}
            </div>
          ) : (
            <p className="dnone">{OPENING.noMatch}</p>
          )}
        </div>

        <aside className="dmap" aria-label={MAP.label}>
          <div className="dmap-in">
            <div className="c-h">
              <span className="who">{MAP.who}</span>
              <span className="ck">{MAP.ck}</span>
            </div>
            <div
              className="mapw"
              ref={mapRef}
              onPointerOver={(e) => {
                const pin = (e.target as Element).closest('.pin');
                const slug = pin?.getAttribute('data-slug');
                if (slug && slug !== hot) point(slug);
              }}
              onPointerOut={(e) => {
                const from = (e.target as Element).closest('.pin');
                const to = (e.relatedTarget as Element | null)?.closest?.('.pin');
                if (from && !to) point(null);
              }}
              onClick={onPin}
            >
              <MapArt partners={partners} hot={hot} off={off} />
              <div className={tip ? 'tip on' : 'tip'} style={tip ? { left: tip.x, top: tip.y } : undefined} aria-hidden="true">
                {tip && (
                  <>
                    {tip.p.name}
                    <small>
                      {tip.p.category} · {tip.p.city}
                    </small>
                  </>
                )}
              </div>
            </div>
            <div className="mlegend">
              <span>
                <i />
                {MAP.legendPay}
              </span>
              <span>
                <i className="s" />
                {MAP.legendSplit}
              </span>
            </div>
            <div className="peek">
              {hp ? (
                <>
                  <span className="label">{hp.splitPlans ? MAP.peekSplit : MAP.peekPay}</span>
                  <div className="pk">
                    <Avatar category={hp.category} name={hp.name} />
                    <div>
                      <b>{hp.name}</b>
                      <small>
                        {hp.category} · {hp.city}
                      </small>
                    </div>
                    <dl>
                      {hp.hours && (
                        <div>
                          <dt>{MAP.hours}</dt>
                          <dd>{hp.hours}</dd>
                        </div>
                      )}
                      {hp.address && (
                        <div>
                          <dt>{MAP.address}</dt>
                          <dd>{hp.address.replace(/, CA$/, '')}</dd>
                        </div>
                      )}
                      {hp.phone && (
                        <div>
                          <dt>{MAP.phone}</dt>
                          <dd>{hp.phone}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </>
              ) : !has ? (
                <>
                  <span className="label">{MAP.emptyLabel}</span>
                  <p className="ck">{MAP.emptyNote}</p>
                </>
              ) : (
                <>
                  <span className="label">{MAP.byTown}</span>
                  <div className="towns" role="group" aria-label={MAP.byTown}>
                    {towns.map((t) => (
                      <button
                        type="button"
                        key={t}
                        aria-pressed={town === t}
                        onClick={() => {
                          setTown((x) => (x === t ? null : t));
                          setBump((b) => b + 1);
                        }}
                      >
                        {t}
                        <span>{partners.filter((p) => p.city === t).length}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
