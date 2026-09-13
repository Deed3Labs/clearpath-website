import Link from 'next/link';
import { Logo } from '@/components/marks/Logo';
import { BRAND_LINE, FOOTER_COLUMNS, LEGAL } from '@/content/footer';

/* §7 — Footer, every page. The brand, the link columns, then the legal block,
   which §8 requires on every route without exception. The link columns sit in
   their own grid so a fourth one splits the space evenly instead of squeezing
   into two of the page's twelve tracks. */

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="hx-grid">
        <div className="footer-brand">
          <Link href="/" aria-label="Clear — home">
            <Logo size={21} />
          </Link>
          <p className="t-sm" style={{ marginTop: 'var(--spacing-2)', maxWidth: '28ch' }}>
            {BRAND_LINE}
          </p>
        </div>

        <div className="footer-cols">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.heading} className="footer-col" aria-label={col.heading}>
              <p className="footer-heading">{col.heading}</p>
              <ul className="t-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} className="tlink" rel="noreferrer noopener">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="tlink">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="footer-legal">
        {LEGAL.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </footer>
  );
}
