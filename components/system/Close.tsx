import { Button } from '@/components/primitives/Button';

/* The closing section: one sentence at section scale, one line, the actions.
   No ruled label unless the close carries a numbered section of its own (the
   shops page ends on membership). */

type Action = { href: string; label: string };

export function Close({
  title,
  line,
  primary,
  ghost,
  n,
  label,
  className,
}: {
  title: string;
  line: string;
  primary: Action;
  ghost?: Action;
  n?: string;
  label?: string;
  className?: string;
}) {
  return (
    <section className={['sec', 'close', className].filter(Boolean).join(' ')}>
      <div className="wrap head">
        {label && (
          <div className="sec-label label">
            {n && <b>{n}</b>}
            {label}
          </div>
        )}
        <h2 className="h2">{title}</h2>
        <div className="aside">
          <p className="line">{line}</p>
          <div className="hero-actions" style={{ marginTop: 0 }}>
            <Button href={primary.href} live>
              {primary.label}
            </Button>
            {ghost && (
              <Button href={ghost.href} variant="ghost">
                {ghost.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
