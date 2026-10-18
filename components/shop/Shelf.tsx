'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Chip } from '@/components/primitives';
import { Plus } from '@/components/system/icons';
import { FOR_SHOPS, FOR_SHOPS_CATEGORY, SHELF } from '@/content/shop';
import { gsap, motionOK } from '@/lib/anim/gsap';
import type { CatOption } from '@/components/system/CatChips';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';
import { usd } from '@/lib/shop/money';
import { useBag } from './BagProvider';
import { pad2, type ShopItem } from './item';
import { announceAdd, usePlateDraw } from './motion';
import { ProductPlate } from './ProductPlate';
import { Sizes } from './Sizes';

/* The shelf: one flat bento whose seams are a 1px gap over the rule colour,
   so the rules stay right however the tiles span. It grows with the catalog.

   - Up to four products sit as that many equal tiles (two on a phone). One
     product takes half the row, beside the empty rack, rather than a square
     the width of the page.
   - From five, the grid is four columns (three under 1100px, two at 640px),
     the featured product (or the first) takes a 2×2 tile while every tile
     shows, and the categories become filters.
   - An empty rack closes the last row so no rule stops short. Which columns
     are showing is a matter of width, so the rack is rendered for each of
     the three layouts and CSS shows the one that applies — no measuring,
     and it is right with JS off.

   The grid holds the goods; the hardware has its own section below (For
   shops, ForShopsGrid). The category chips count the whole catalog, and
   For shops is one of them: it is a link that takes you down to that
   section rather than a filter. The layout rules above count goods only.

   Every tile adds to the bag without leaving the shelf: one size goes
   straight in; with sizes, a row of them slides up over the foot of the
   drawing and choosing one adds it. */

type Range = 'lg' | 'md' | 'sm';

export function columns(n: number): Record<Range, number> {
  if (n >= 5) return { lg: 4, md: 3, sm: 2 };
  if (n <= 1) return { lg: 2, md: 2, sm: 2 };
  return { lg: n, md: n, sm: 2 };
}

/* Columns left empty in the last row, per layout. The featured tile takes
   four cells on three or four columns, and a full row on two. */
export function fillers(n: number, visible: number, feat: boolean) {
  const cols = columns(n);
  return (Object.keys(cols) as Range[])
    .map((r) => {
      const c = cols[r];
      const used = visible - (feat ? 1 : 0) + (feat ? (c >= 3 ? 4 : c) : 0);
      const rem = used % c;
      return { r, span: rem ? c - rem : 0 };
    })
    .filter((f) => f.span > 0);
}

function Rack({ r, span }: { r: Range; span: number }) {
  const hx = Array.from({ length: Math.min(span * 3, 7) }, (_, k) => k);
  return (
    <div className="fill" data-r={r} style={{ gridColumn: `span ${span}` }} aria-hidden="true">
      <svg viewBox="0 0 300 110" preserveAspectRatio="xMidYMid meet">
        <path d="M20 30 H280 M28 30 L18 104 M272 30 L282 104" />
        {hx.map((k) => {
          const x = 150 + (k - (hx.length - 1) / 2) * 38;
          return <path key={k} d={`M${x} 46 V38 q0 -7 5 -7 q5 0 5 5 M${x} 46 L${x - 16} 58 H${x + 16} Z`} />;
        })}
      </svg>
      <span className="label">{SHELF.filler}</span>
    </div>
  );
}

/* The shared CatChips row, plus the For shops chip as a link down the page.
   Local because CatChips only renders filter toggles; the lead may fold a
   link option back into it. The link is styled as a chip in shop.css. */
function ShelfChips({
  options,
  value,
  onChange,
  forShops,
}: {
  options: readonly CatOption<string>[];
  value: string;
  onChange: (v: string) => void;
  forShops: number;
}) {
  return (
    <div className="cats" role="group" aria-label={SHELF.filterLabel}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span>{o.count}</span>}
        </button>
      ))}
      {forShops > 0 && (
        <a
          className="catlink"
          href={`#${FOR_SHOPS.id}`}
          onClick={(e) => {
            const el = document.getElementById(FOR_SHOPS.id);
            if (!el || !motionOK()) return;
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', `#${FOR_SHOPS.id}`);
          }}
        >
          {FOR_SHOPS_CATEGORY}
          <span>{forShops}</span>
        </a>
      )}
    </div>
  );
}

export function Shelf({ products, forShops = 0 }: { products: ShopItem[]; forShops?: number }) {
  const { add } = useBag();
  const n = products.length;
  const [cat, setCat] = useState<string>(SHELF.all);
  const [picking, setPicking] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cats = useMemo(() => {
    const order: string[] = [];
    for (const p of products) if (!order.includes(p.category)) order.push(p.category);
    return [
      { value: SHELF.all, label: SHELF.all, count: n + forShops },
      ...order.map((c) => ({ value: c, label: c, count: products.filter((p) => p.category === c).length })),
    ];
  }, [products, n, forShops]);

  const featSlug = (products.find((p) => p.featured) ?? products[0])?.slug;
  const visible = products.filter((p) => cat === SHELF.all || p.category === cat);
  const feat = n >= 5 && cat === SHELF.all && visible.length >= 4;
  /* The featured tile leads, so the dense flow packs the rest round it. */
  const ordered = feat ? [...products].sort((a, b) => Number(b.slug === featSlug) - Number(a.slug === featSlug)) : products;

  usePlateDraw(grid, { first: 0.4 });

  /* A filter brings its tiles in; the first render needs nothing. */
  const firstCat = useRef(true);
  useIsoLayoutEffect(() => {
    if (firstCat.current) {
      firstCat.current = false;
      return;
    }
    const el = grid.current;
    if (!el || !motionOK()) return;
    const tiles = Array.from(el.querySelectorAll<HTMLElement>('.pc:not([hidden]), .fill'));
    const tw = gsap.from(tiles, { opacity: 0, y: 10, duration: 0.45, stagger: 0.04, ease: 'power3.out', clearProps: 'opacity,transform' });
    return () => {
      tw.revert();
    };
  }, [cat]);

  /* Escape or a press anywhere else puts the sizes away. */
  useEffect(() => {
    if (!picking) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const btn = grid.current?.querySelector<HTMLElement>(`.pc[data-slug="${picking}"] .padd`);
      setPicking(null);
      btn?.focus();
    };
    const down = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(`.pc[data-slug="${picking}"]`)) setPicking(null);
    };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', down);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', down);
    };
  }, [picking]);

  /* The sizes rise into place, and the first size on sale takes focus. */
  useIsoLayoutEffect(() => {
    if (!picking) return;
    const row = grid.current?.querySelector<HTMLElement>(`.pc[data-slug="${picking}"] .psz`);
    if (!row) return;
    row.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    if (!motionOK()) return;
    const tw = gsap.from(row.children, { opacity: 0, y: 6, duration: 0.3, stagger: 0.04, ease: 'power3.out', clearProps: 'opacity,transform' });
    return () => {
      tw.revert();
    };
  }, [picking]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function quickAdd(p: ShopItem, variant: string, from: Element) {
    announceAdd({ slug: p.slug, variant, qty: 1, from: from.getBoundingClientRect() });
    add(p.slug, variant, 1);
    setDone(p.slug);
    timers.current.push(
      setTimeout(() => {
        setDone((d) => (d === p.slug ? null : d));
        setPicking((s) => (s === p.slug ? null : s));
      }, 900),
    );
  }

  const cols = columns(n);
  const wide = n >= 5;

  return (
    <>
      {n + forShops >= 5 && (
        <div className="shelfbar">
          <ShelfChips options={cats} value={cat} onChange={setCat} forShops={forShops} />
          <span className="ck">{SHELF.pieces(n + forShops)}</span>
        </div>
      )}
      <div
        ref={grid}
        className={['shelf2', wide && 'wide'].filter(Boolean).join(' ')}
        data-n={wide ? undefined : cols.lg}
        data-draw=""
        role="list"
        aria-label={SHELF.label}
      >
        {ordered.map((p) => {
          const i = products.indexOf(p);
          const multi = p.variants.length > 1;
          const isFeat = feat && p.slug === featSlug;
          const open = picking === p.slug;
          const sizesId = `psz-${p.slug}`;
          return (
            <article
              key={p.slug}
              role="listitem"
              className={['pc', isFeat && 'feat', open && 'picking'].filter(Boolean).join(' ')}
              data-slug={p.slug}
              hidden={!visible.includes(p)}
            >
              <div className="c-h">
                <span className="label">{pad2(i + 1)}</span>
                {/* A goods pre-order says so the way a hardware tile does: one chip, one
                    line at any width. The ship month is on its page and in the bag. */}
                {p.ships ? (
                  <Chip tone="underway">{SHELF.preorder}</Chip>
                ) : isFeat ? (
                  <Chip tone="live">{SHELF.featured}</Chip>
                ) : (
                  <span className="ck">{p.category}</span>
                )}
              </div>
              <div className="pw">
                <ProductPlate kind={p.kind} tone={p.tone} href={`/shop/${p.slug}`} />
                {multi && (
                  <div className="psz" id={sizesId} hidden={!open}>
                    <span className="label">{p.variantLabel}</span>
                    <Sizes
                      label={p.variantLabel ?? ''}
                      variants={p.variants}
                      value={null}
                      arrows="move"
                      onPick={(v, el) => quickAdd(p, v, el)}
                    />
                  </div>
                )}
                <button
                  type="button"
                  className={['padd', done === p.slug && 'done'].filter(Boolean).join(' ')}
                  data-add=""
                  aria-label={SHELF.add(p.name)}
                  aria-expanded={multi ? open : undefined}
                  aria-controls={multi ? sizesId : undefined}
                  disabled={p.variants.every((v) => v.soldOut)}
                  onClick={(e) => {
                    if (!multi) return quickAdd(p, p.variants[0].id, e.currentTarget);
                    setPicking(open ? null : p.slug);
                  }}
                >
                  <Plus />
                </button>
              </div>
              <div className="pf">
                <Link className="pn" href={`/shop/${p.slug}`}>
                  {p.name}
                </Link>
                <span className="pp fig">{usd(p.priceCents)}</span>
                <p className="pl">{p.line}</p>
              </div>
            </article>
          );
        })}
        {fillers(n, visible.length, feat).map((f) => (
          <Fragment key={f.r}>
            <Rack r={f.r} span={f.span} />
          </Fragment>
        ))}
      </div>
    </>
  );
}
