import type { ReactNode } from 'react';
import { More } from '@/components/system';

/* SectionHead with a status chip at the right end of the label rule, as the
   spec draws every numbered section here. The shared SectionHead takes the
   label as a string, so this is a page-local copy of its markup with the
   chip slot added (the lead can fold the slot back into SectionHead). */

export function Head({
  n,
  label,
  chip,
  title,
  line,
  more,
}: {
  n: string;
  label: string;
  chip?: ReactNode;
  title: ReactNode;
  line?: ReactNode;
  more?: { href: string; label: string } | null;
}) {
  return (
    <div className="head">
      <div className="sec-label label">
        <b>{n}</b>
        {label}
        {chip}
      </div>
      <h2 className="h2">{title}</h2>
      {(line || more) && (
        <div className="aside">
          {line && <p className="line">{line}</p>}
          {more && <More href={more.href}>{more.label}</More>}
        </div>
      )}
    </div>
  );
}
