/* §4 — the shared primitives that outlived the old layout system. Chip is
 * the status pill every page uses; Button lives beside it. Everything else
 * that once lived here (Ledger, Stat, Tiles, Note, TextLink and the old
 * Section/Cols/Panel) was replaced by components/system and is gone. */

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
