import Link from 'next/link';
import { Logo } from '@/components/marks/Logo';
import { BRAND_LINE, FOOTER_COLUMNS, LEGAL } from '@/content/footer';

/* §7 — Footer, every page. The brand, four link columns, then the legal
   block, which §8 requires on every route without exception. One ruled grid
   on the page measure: the brand takes the wider first column, the four
   columns share the rest, and the legal block runs the full width under a
   hairline. Two columns on a tablet, the brand on its own row. */

export function Footer() {
  return (
    <footer className="site-footer wrap">
      <div className="foot">
        <div className="about">
          <Link href="/" aria-label="Clear — home" className="brand">
            <Logo size={21} />
          </Link>
          <p>{BRAND_LINE}</p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p className="foot-h">{col.heading}</p>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a href={l.href} rel="noreferrer noopener">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href}>{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="legal">
          {LEGAL.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </footer>
  );
}
