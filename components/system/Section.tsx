import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Arrow } from './icons';

/* Section rhythm. Every section is the same shape at the top — a full-width
   label rule with its number in cobalt, the headline on the left seven
   twelfths, and one line plus a link on the right, bottom-aligned to the
   headline — so what changes from section to section is the one crafted
   figure underneath. Paper sections alternate with ink bands. */

export function Section({
  id,
  ink,
  className,
  style,
  children,
}: {
  id?: string;
  ink?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const cls = ['sec', ink && 'band-ink', className].filter(Boolean).join(' ');
  return (
    <section id={id} className={cls} style={style}>
      <div className="wrap">{children}</div>
    </section>
  );
}

type LinkSpec = { href: string; label: string };

export function More({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:/.test(href);
  const body = (
    <>
      {children}
      <Arrow />
    </>
  );
  return external ? (
    <a className="more" href={href} rel="noreferrer noopener">
      {body}
    </a>
  ) : (
    <Link className="more" href={href}>
      {body}
    </Link>
  );
}

export function SectionHead({
  n,
  label,
  title,
  line,
  more,
  links,
  aside,
  className,
  titleClassName,
}: {
  n?: string;
  label?: string;
  title: ReactNode;
  line?: ReactNode;
  more?: LinkSpec;
  links?: LinkSpec[];
  /* Replaces line + more when the aside carries something else (a source
     line, a pair of figures). */
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={['head', className].filter(Boolean).join(' ')}>
      {label && (
        <div className="sec-label label">
          {n && <b>{n}</b>}
          {label}
        </div>
      )}
      <h2 className={['h2', titleClassName].filter(Boolean).join(' ')}>{title}</h2>
      {(aside || line || more || links) && (
        <div className="aside">
          {aside ?? (
            <>
              {line && <p className="line">{line}</p>}
              {more && <More href={more.href}>{more.label}</More>}
              {links && (
                <div className="links">
                  {links.map((l) => (
                    <More key={l.href} href={l.href}>
                      {l.label}
                    </More>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
