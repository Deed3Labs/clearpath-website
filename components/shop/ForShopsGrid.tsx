'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Chip } from '@/components/primitives';
import { Plus } from '@/components/system/icons';
import { FOR_SHOPS, SHELF } from '@/content/shop';
import { gsap, ScrollTrigger, useGsap } from '@/lib/anim';
import { usd } from '@/lib/shop/money';
import { fromDeposit, fromLabel } from '@/lib/shop/price';
import { useBag } from './BagProvider';
import { pad2, type ShopItem } from './item';
import { announceAdd } from './motion';
import { columns, fillers } from './Shelf';

/* For shops: the hardware, in the shelf's own grid. The first product takes
   the large tile, and the empty rack closes the last row (one rack per
   layout, CSS shows the one whose column count is showing, as on the shelf).

   Each tile shows the product's first render, its price ("From $89" when
   the variants differ), and what it reserves and when it ships. Add puts
   the default variant in the bag: there is no size row, because a variant
   here changes what is reserved, and that is the product page's job. */

function Rack2({ r, span }: { r: string; span: number }) {
  return (
    <div className="fill2" data-r={r} style={{ gridColumn: `span ${span}` }} aria-hidden="true">
      <svg viewBox="0 0 300 110">
        <path d="M20 30 H280 M28 30 L18 104 M272 30 L282 104" />
        <text x="150" y="70" textAnchor="middle">
          {SHELF.filler}
        </text>
      </svg>
    </div>
  );
}

export function ForShopsGrid({ products }: { products: ShopItem[] }) {
  const { add } = useBag();
  const [done, setDone] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const n = products.length;
  const feat = n >= 5;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* The tiles rise into place once, as the grid comes into view. */
  useGsap(grid, () => {
    const tiles = Array.from(grid.current!.children);
    const tw = gsap.from(tiles, { opacity: 0, y: 14, duration: 0.6, stagger: 0.05, ease: 'power3.out', paused: true, clearProps: 'opacity,transform' });
    ScrollTrigger.create({ trigger: grid.current, start: 'top 80%', once: true, onEnter: () => void tw.play() });
  });

  function quickAdd(p: ShopItem, from: Element) {
    const variant = p.variants[0].id;
    announceAdd({ slug: p.slug, variant, qty: 1, from: from.getBoundingClientRect() });
    add(p.slug, variant, 1);
    setDone(p.slug);
    timers.current.push(setTimeout(() => setDone((d) => (d === p.slug ? null : d)), 900));
  }

  return (
    <div
      ref={grid}
      className={['shelf2', 'hwgrid', feat && 'wide', 'body-gap'].filter(Boolean).join(' ')}
      data-n={feat ? undefined : columns(n).lg}
      role="list"
      aria-label={FOR_SHOPS.label}
    >
      {products.map((p, i) => {
        const isFeat = feat && i === 0;
        return (
          <article key={p.slug} role="listitem" className={['pc', isFeat && 'feat'].filter(Boolean).join(' ')} data-slug={p.slug}>
            <div className="c-h">
              <span className="label">{pad2(i + 1)}</span>
              <Chip tone="underway">{FOR_SHOPS.chip}</Chip>
            </div>
            <div className="pw">
              {/* A larger target for a pointer; the name is the link a reader uses. */}
              <Link href={`/shop/${p.slug}`} className="plate photo" tabIndex={-1} aria-hidden="true">
                {p.render && (
                  <Image
                    src={p.render.src}
                    alt=""
                    fill
                    sizes={isFeat ? '(max-width: 640px) 100vw, (max-width: 1100px) 66vw, 50vw' : '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw'}
                  />
                )}
              </Link>
              <button
                type="button"
                className={['padd', done === p.slug && 'done'].filter(Boolean).join(' ')}
                data-add=""
                aria-label={SHELF.add(p.name)}
                disabled={p.variants.every((v) => v.soldOut)}
                onClick={(e) => quickAdd(p, e.currentTarget)}
              >
                <Plus />
              </button>
            </div>
            <div className="pf">
              <Link className="pn" href={`/shop/${p.slug}`}>
                {p.name}
              </Link>
              <span className="pp fig">{fromLabel(p)}</span>
              <p className="pl">{p.line}</p>
              {p.preorder && (
                <p className="rs">
                  {FOR_SHOPS.reserve} <b>{usd(fromDeposit(p))}</b> · {FOR_SHOPS.ships} {p.preorder.ships}
                </p>
              )}
            </div>
          </article>
        );
      })}
      {fillers(n, n, feat).map((f) => (
        <Fragment key={f.r}>
          <Rack2 r={f.r} span={f.span} />
        </Fragment>
      ))}
    </div>
  );
}
