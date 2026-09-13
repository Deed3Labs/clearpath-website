import Link from 'next/link';
import { BrokenMark } from '@/components/marks/BrokenMark';
import { Button } from '@/components/primitives/Button';
import { NOT_FOUND } from '@/content/notFound';

export const metadata = {
  title: 'Page not found',
  robots: { index: false },
};

/* Every route's 404, inside the site's own header and footer. Before this,
   Next's built-in page rendered instead: plain type, and black in dark mode,
   because it carries its own colours rather than the site's. */
export default function NotFound() {
  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>404</b> {NOT_FOUND.kicker}
        </p>
        <div className="hx-grid nf">
          <div className="c-half nf-copy">
            <h1 className="hx-h2">{NOT_FOUND.heading}</h1>
            <p className="hx-lede">{NOT_FOUND.lede}</p>
            <div className="nf-actions">
              <Button href="/">{NOT_FOUND.home}</Button>
              <Button href="/join" variant="ghost" live>
                {NOT_FOUND.join}
              </Button>
            </div>
          </div>

          <div className="c-half nf-art">
            <BrokenMark className="nf-mark" />
          </div>

          <nav className="c-full nf-links" aria-label={NOT_FOUND.linksLabel}>
            <p className="side-label">{NOT_FOUND.linksLabel}</p>
            <ul>
              {NOT_FOUND.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="nf-link">
                    <span className="nf-link-label">{l.label}</span>
                    <span className="t-sm nf-link-note">{l.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
}
