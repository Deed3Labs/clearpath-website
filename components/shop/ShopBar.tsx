'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Crumbbar } from '@/components/system/Crumbbar';
import { Check } from '@/components/system/icons';
import { MINIBAG, PRODUCT_COPY, items } from '@/content/shop';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { usd, usdExact } from '@/lib/shop/money';
import { unitPrice } from '@/lib/shop/price';
import { useBag } from './BagProvider';
import { toneOf, variantText, type ShopItem } from './item';
import { fly, onAdded, type Added } from './motion';
import { ProductPlate } from './ProductPlate';

/* The shop's one header: breadcrumbs on the left, the bag on the right, on
   the shared Crumbbar. It stands in for the section label on every shop
   page, so a page never shows "Shop" twice. Kept out of the site header on
   purpose — the header's five links answer to the co-op, and a bag count
   there would sit on every page.

   After anything goes in the bag (motion.ts announces it), a dot flies to
   the count, the count bumps, and the mini-bag drops from the pill: what went
   in, and where to go next. It closes itself after five seconds, on a press
   anywhere else, on Escape and on navigation.

   On the closed shop the bar sits on the ink band's ground from the start
   (.inkbar), as the mockup has it; elsewhere HeaderInk swaps it over bands.
   The bar also carries .pg-shop, so the shop's scoped CSS reaches the
   mini-bag without a global rule. */

const FIXED: Record<string, string> = { bag: 'Bag', thanks: 'Order' };

export function ShopBar({ catalog, closed }: { catalog: ShopItem[]; closed: boolean }) {
  const { count, ready } = useBag();
  const path = usePathname();
  const segment = path.replace(/^\/shop\/?/, '').split('/')[0];
  const here = segment ? FIXED[segment] ?? catalog.find((p) => p.slug === segment)?.name : undefined;
  const crumbs = [{ href: '/shop', label: 'Shop' }, ...(here ? [{ href: path, label: here }] : [])];

  const countRef = useRef(count);
  countRef.current = count;
  /* While the dot is in the air the pill still shows the old count. */
  const [hold, setHold] = useState<number | null>(null);
  const [mini, setMini] = useState<Added | null>(null);
  const cnt = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bumped = useRef(false);
  const stopFly = useRef<() => void>(() => {});

  useEffect(() => {
    const off = onAdded((a) => {
      stopFly.current();
      setHold(countRef.current);
      setMini(null);
      stopFly.current = fly(a.from, cnt.current, () => {
        bumped.current = true;
        setHold(null);
        setMini(a);
      });
    });
    return () => {
      off();
      stopFly.current();
    };
  }, []);

  /* The bump, once the new count is on the pill. */
  useEffect(() => {
    if (hold !== null || !bumped.current) return;
    bumped.current = false;
    if (motionOK() && cnt.current) gsap.fromTo(cnt.current, { scale: 1.45 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .45)', clearProps: 'transform' });
  }, [hold]);

  /* The panel drops in, and goes on its own after five seconds. */
  useEffect(() => {
    if (!mini) return;
    if (motionOK() && panel.current) gsap.fromTo(panel.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', clearProps: 'opacity,transform' });
    const t = setTimeout(() => setMini(null), 5000);
    const down = (e: PointerEvent) => {
      const el = e.target as Element;
      if (!el.closest?.('.minibag, [data-add]')) setMini(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMini(null);
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [mini]);

  useEffect(() => setMini(null), [path]);

  const shown = ready ? hold ?? count : 0;
  const p = mini ? catalog.find((x) => x.slug === mini.slug) : undefined;

  return (
    <Crumbbar
      className={['shopbar-w', 'pg-shop', closed && !segment && 'inkbar'].filter(Boolean).join(' ')}
      crumbs={crumbs}
      action={
        segment !== 'bag' && (
          <>
            <Link href="/shop/bag" className="bagpill">
              <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                <path d="M2.5 5.5h11l-.9 8.5H3.4z" />
                <path d="M5.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" />
              </svg>
              Bag
              {/* Count only once storage has been read, so the server render
                  and the first client render agree. */}
              <span ref={cnt} className="cnt" data-zero={shown ? undefined : ''} aria-label={ready ? items(shown) : undefined}>
                {shown}
              </span>
            </Link>
            <div className="minibag" ref={panel} role="status" hidden={!p}>
              {p && mini && (
                <>
                  <div className="mb-h">
                    <Check />
                    <span>{MINIBAG.added}</span>
                    <button type="button" className="mb-x" aria-label={MINIBAG.close} onClick={() => setMini(null)}>
                      ×
                    </button>
                  </div>
                  <div className="mb-l">
                    {p.render ? (
                      <span className="plate photo">
                        <Image src={p.render.src} alt="" fill sizes="56px" />
                      </span>
                    ) : (
                      <ProductPlate kind={p.kind} tone={toneOf(p, mini.variant)} />
                    )}
                    <span>
                      {p.name}
                      <small>
                        {variantText(p, mini.variant, PRODUCT_COPY.oneSize)} · {mini.qty} × {usd(unitPrice(p, mini.variant))}
                      </small>
                    </span>
                    <span className="fig">{usdExact(unitPrice(p, mini.variant) * mini.qty)}</span>
                  </div>
                  <div className="mb-a">
                    <Link className="btn" data-variant="primary" href="/shop/bag">
                      {MINIBAG.view(count)}
                    </Link>
                    <button type="button" className="btn" data-variant="ghost" onClick={() => setMini(null)}>
                      {MINIBAG.keep}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )
      }
    />
  );
}
