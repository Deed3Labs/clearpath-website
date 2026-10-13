import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { Arrow } from './icons';

/* The bar that sticks under the header on the shop, event and partner pages:
   where you are on the left, the one thing to do next on the right. It stands
   in for the page label, so a page never says "Shop" twice. The last crumb is
   the current page and is not a link. */

export type Crumb = { href?: string; label: string };

export function Crumbbar({ crumbs, action, className }: { crumbs: readonly Crumb[]; action?: ReactNode; className?: string }) {
  return (
    <div className={['crumbbar-w', className].filter(Boolean).join(' ')}>
      <div className="wrap">
        <div className="crumbbar">
          <nav aria-label="Breadcrumb">
            <ol className="crumbs">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <Fragment key={`${c.label}-${i}`}>
                    {i > 0 && (
                      <li className="sep" aria-hidden="true">
                        /
                      </li>
                    )}
                    <li>{last || !c.href ? <span aria-current={last ? 'page' : undefined}>{c.label}</span> : <Link href={c.href}>{c.label}</Link>}</li>
                  </Fragment>
                );
              })}
            </ol>
          </nav>
          {action}
        </div>
      </div>
    </div>
  );
}

/* The right-hand link: "All events →". */
export function CrumbLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="sub-link" href={href}>
      {children}
      <Arrow />
    </Link>
  );
}
