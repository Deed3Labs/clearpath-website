'use client';

import { useState } from 'react';
import { GROUPS, type EventGroup } from '@/content/events';

/* The category chips. The list itself is rendered on the server; this only
   sets data-filter on the board, and CSS hides what does not match. So the
   whole calendar is in the HTML for anyone without JavaScript, and nothing
   about dates is formatted in the browser. */
export function EventFilter({
  counts,
  children,
}: {
  counts: Record<EventGroup | 'all', number>;
  children: React.ReactNode;
}) {
  const [filter, setFilter] = useState<EventGroup | 'all'>('all');

  return (
    <div className="ev-board" data-filter={filter}>
      <div className="ev-filter" role="group" aria-label="Show events">
        {/* A category with nothing in it is not offered. */}
        {GROUPS.filter((g) => g.key === 'all' || counts[g.key] > 0).map((g) => (
          <button
            key={g.key}
            type="button"
            className="ev-filter-chip"
            aria-pressed={filter === g.key}
            onClick={() => setFilter(g.key)}
          >
            {g.label}
            <span className="ev-filter-count">{counts[g.key]}</span>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
