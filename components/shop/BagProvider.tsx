'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MAX_LINES, MAX_PER_LINE } from '@/content/shop';
import type { BagLine } from '@/lib/shop/catalog';

/* The bag lives in localStorage and nowhere else until checkout. It holds
   what someone picked, never a price — prices are read from the catalog
   wherever they are shown and on the server when charged. */

const KEY = 'clear.shop.bag.v1';

type Bag = {
  lines: BagLine[];
  /* False until storage has been read, so the server render and the first
     client render agree (an empty bag) and React does not throw. */
  ready: boolean;
  count: number;
  add: (slug: string, variant: string, qty: number) => void;
  setQty: (slug: string, variant: string, qty: number) => void;
  remove: (slug: string, variant: string) => void;
  clear: () => void;
};

const BagContext = createContext<Bag | null>(null);

const clampQty = (n: number) => Math.max(0, Math.min(MAX_PER_LINE, Math.floor(Number.isFinite(n) ? n : 0)));

function sanitize(raw: unknown): BagLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is BagLine =>
        !!l && typeof l.slug === 'string' && typeof l.variant === 'string' && typeof l.qty === 'number',
    )
    .map((l) => ({ slug: l.slug, variant: l.variant, qty: clampQty(l.qty) }))
    .filter((l) => l.qty > 0)
    .slice(0, MAX_LINES);
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setLines(sanitize(JSON.parse(window.localStorage.getItem(KEY) ?? '[]')));
    } catch {
      // Blocked or corrupt storage: an empty bag is the right fallback.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      // Non-fatal: the bag still works for this visit.
    }
  }, [lines, ready]);

  const same = (l: BagLine, slug: string, variant: string) => l.slug === slug && l.variant === variant;

  const add = useCallback((slug: string, variant: string, qty: number) => {
    setLines((prev) => {
      const hit = prev.find((l) => same(l, slug, variant));
      if (hit) return prev.map((l) => (l === hit ? { ...l, qty: clampQty(l.qty + qty) } : l));
      if (prev.length >= MAX_LINES) return prev;
      return [...prev, { slug, variant, qty: clampQty(qty) }];
    });
  }, []);

  const setQty = useCallback((slug: string, variant: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) => (same(l, slug, variant) ? { ...l, qty: clampQty(qty) } : l)).filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((slug: string, variant: string) => {
    setLines((prev) => prev.filter((l) => !same(l, slug, variant)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Bag>(
    () => ({ lines, ready, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, clear }),
    [lines, ready, add, setQty, remove, clear],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag(): Bag {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag must be used inside <BagProvider>');
  return ctx;
}
