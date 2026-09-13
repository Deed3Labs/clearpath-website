'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { useBag } from './BagProvider';

/* The shop's one header: breadcrumbs on the left, the bag on the right. It
   stands in for the section label on every shop page, so a page never shows
   "Shop" twice. Kept out of the site header on purpose — the header's five
   links answer to the co-op, and a bag count there would sit on every page. */

const FIXED: Record<string, string> = { bag: 'Bag', thanks: 'Order' };

export function ShopBar({ names }: { names: Record<string, string> }) {
  const { count, ready } = useBag();
  const path = usePathname();
  const segment = path.replace(/^\/shop\/?/, '').split('/')[0];
  const here = segment ? FIXED[segment] ?? names[segment] : undefined;

  const crumbs = [{ href: '/shop', label: 'Shop' }, ...(here ? [{ href: path, label: here }] : [])];

  return (
    <div className="shop-bar hx-wrap">
      <nav aria-label="Breadcrumb">
        <ol className="shop-crumbs">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Fragment key={c.href}>
                {i > 0 && (
                  <li aria-hidden="true" className="shop-crumb-sep">
                    /
                  </li>
                )}
                <li>
                  {last ? (
                    <span aria-current="page" className="shop-crumb-here">
                      {c.label}
                    </span>
                  ) : (
                    <Link href={c.href} className="shop-bar-link">
                      {c.label}
                    </Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>

      {segment !== 'bag' && (
        <Link href="/shop/bag" className="shop-bag-pill">
          <svg className="shop-bag-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
            <path d="M2.5 5.5h11l-.9 8.5H3.4z" />
            <path d="M5.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" />
          </svg>
          Bag
          {/* Count only once storage has been read, so the server render and
              the first client render agree. An empty bag shows no badge. */}
          <span className="shop-bar-count" aria-label={ready && count ? `${count} items` : undefined}>
            {ready && count ? count : ''}
          </span>
        </Link>
      )}
    </div>
  );
}
