'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crumbbar } from '@/components/system/Crumbbar';
import { useBag } from './BagProvider';

/* The shop's one header: breadcrumbs on the left, the bag on the right, on the
   shared Crumbbar. It stands in for the section label on every shop page, so
   a page never shows "Shop" twice. Kept out of the site header on purpose —
   the header's five links answer to the co-op, and a bag count there would
   sit on every page. */

const FIXED: Record<string, string> = { bag: 'Bag', thanks: 'Order' };

export function ShopBar({ names }: { names: Record<string, string> }) {
  const { count, ready } = useBag();
  const path = usePathname();
  const segment = path.replace(/^\/shop\/?/, '').split('/')[0];
  const here = segment ? FIXED[segment] ?? names[segment] : undefined;

  const crumbs = [{ href: '/shop', label: 'Shop' }, ...(here ? [{ href: path, label: here }] : [])];

  return (
    <Crumbbar
      className="shopbar-w"
      crumbs={crumbs}
      action={
        segment !== 'bag' && (
          <Link href="/shop/bag" className="bagpill">
            <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <path d="M2.5 5.5h11l-.9 8.5H3.4z" />
              <path d="M5.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" />
            </svg>
            Bag
            {/* Count only once storage has been read, so the server render and
                the first client render agree. */}
            <span className="cnt" data-zero={ready && count ? undefined : ''} aria-label={ready ? `${count} items` : undefined}>
              {ready ? count : 0}
            </span>
          </Link>
        )
      }
    />
  );
}
