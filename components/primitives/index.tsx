import Link from 'next/link';

/* §4 — the shared blocks. A Ledger is the general case: anything that wants
   to be a fourth kind of container is one.
 *
 * Section, Cols, Col, Panel and Steps used to live here. They belonged to the
 * old two-column rail layout, which boxed every band into columns 3-12 and
 * made an edge-to-edge bento impossible; .hx-band, .hx-grid and the bento
 * replaced them page by page and nothing imports them any more. Panel went
 * with them because the site draws rules, not boxes.
 *
 * Stat, FigureXL, Tiles and the StepItem type went with the redesign, which
 * draws those shapes as bento cells (components/system). */
export type LedgerItem = {
  label: string;
  value: string;
  /* Cobalt appears once per viewport, on the figure that matters most. */
  live?: boolean;
  muted?: boolean;
  chip?: string;
  chipTone?: ChipTone;
  description?: React.ReactNode;
};

export function Ledger({ items }: { items: LedgerItem[] }) {
  return (
    <dl className="ledger">
      {items.map((it) => (
        <div className="ledger-row" key={it.label}>
          <dt className="t-sm">{it.label}</dt>
          <dd className={`fig${it.live ? ' is-live' : ''}${it.muted ? ' is-muted' : ''}`}>
            {it.chip ? <Chip tone={it.chipTone}>{it.chip}</Chip> : it.value}
          </dd>
          {it.description && <p className="ledger-desc t-sm">{it.description}</p>}
        </div>
      ))}
    </dl>
  );
}

export { Button } from './Button';

/* Tone is the status itself, not a colour name — "underway" survives a
   palette change, "amber" does not. */
export type ChipTone = 'live' | 'underway' | 'absent';

/* A status carries a dot in its own colour. Only "live" pulses: a ping on
   "not yet" or "in beta" would imply activity that is not happening, and the
   pulse means something only if it is kept for what is actually live. An
   untoned chip is a label, not a status, so it gets no dot. The word still
   carries the state; the dot is decoration, hence aria-hidden. */
export function Chip({ children, tone }: { children: React.ReactNode; tone?: ChipTone }) {
  return (
    <span className="chip" data-tone={tone}>
      {tone && <span className="live-dot chip-dot" data-still={tone === 'live' ? undefined : ''} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="t-note note-block">{children}</p>;
}

/* No arrow appended. §7. */
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="tlink">
      {children}
    </Link>
  );
}
