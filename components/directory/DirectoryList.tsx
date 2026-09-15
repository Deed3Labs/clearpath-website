'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { OPENING, TAGS, type Partner } from '@/content/directory';
import { initials } from '@/lib/directory';

/* Search and category chips over the listed partners. The list is small and
   already on the page, so filtering happens here rather than in a request;
   the chips reuse the events page's filter so the two read as one site. */
export function DirectoryList({ partners }: { partners: Partner[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(
    () => [...new Set(partners.map((p) => p.category))].sort((a, b) => a.localeCompare(b)),
    [partners],
  );

  const shown = partners.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    const q = query.trim().toLowerCase();
    return !q || `${p.name} ${p.category} ${p.city}`.toLowerCase().includes(q);
  });

  return (
    <div className="dir">
      <div className="dir-controls">
        <label className="dir-search">
          <span className="sr-only">{OPENING.searchLabel}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.75" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={OPENING.searchPlaceholder}
          />
        </label>

        <div className="ev-filter" role="group" aria-label="Kind of business">
          {['all', ...categories].map((c) => (
            <button
              key={c}
              type="button"
              className="ev-filter-chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c === 'all' ? OPENING.all : c}
              <span className="ev-filter-count">
                {c === 'all' ? partners.length : partners.filter((p) => p.category === c).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="t-sm dir-count" aria-live="polite">
        {OPENING.count(shown.length)}
      </p>

      {shown.length ? (
        <ul className="dir-list">
          {shown.map((p) => (
            <li key={p.slug} className="dir-row">
              <span className="dir-avatar" aria-hidden="true">
                {initials(p.name)}
              </span>
              <div className="dir-main">
                <h3 className="dir-name">
                  <Link href={`/directory/${p.slug}`} className="dir-link">
                    {p.name}
                  </Link>
                </h3>
                <p className="t-sm dir-meta">
                  {p.category} · {p.city}
                </p>
              </div>
              <div className="dir-tags">
                <span className="chip" data-tone="live">
                  <span className="live-dot chip-dot" data-still="" aria-hidden="true" />
                  {TAGS.pay}
                </span>
                {p.splitPlans && <span className="chip">{TAGS.split}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="t-sm dir-nomatch">{OPENING.noMatch}</p>
      )}
    </div>
  );
}

