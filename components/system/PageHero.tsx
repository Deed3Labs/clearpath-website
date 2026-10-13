import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { HeroScope } from './HeroScope';

/* The page hero: a ruled page label, an h1 set on fixed lines, then the lede
   and actions beside a short ruled list of facts.

   The h1's lines are set, not wrapped: each is a span that never breaks, and
   the font size is chosen per page so the longest line fits the measure from
   700px up. Below 700px the lines either wrap like prose (`wrap`), stack as
   blocks that may wrap (`block`), or stay set at a smaller size (`set`) — the
   mockup decides per page.

   Words are split into masked spans here, on the server, so the intro has
   nothing to rewrite in the DOM and the h1 reads the same with JS off. The
   mask is padded and comes off once the rise finishes (.revealed), so no
   descender or tight-tracked edge is ever clipped at rest. */

export type Fact = { k: string; v: string; live?: boolean };

/* A word written _like this_ in a line is the one the sentence leans on. It
   is set in <em>, which leans (a skew — Bricolage ships no italic, and a
   synthesised oblique is the browser guessing), so the stress survives in
   the accessibility tree as well as on screen. Punctuation after the closing
   underscore stays upright. */
function emph(word: string) {
  const m = word.match(/^_(.+)_(\W*)$/);
  if (!m) return word;
  return (
    <>
      <em>{m[1]}</em>
      {m[2]}
    </>
  );
}

export function PageHero({
  label,
  lines,
  size,
  phoneSize,
  phone = 'wrap',
  balance,
  lede,
  actions,
  facts,
  figs,
  side,
  home,
  stagger,
  className,
  children,
}: {
  label?: { kicker: string; title: string };
  lines: readonly string[];
  /* The h1's font-size from 700px up, e.g. 'min(7.9vw, 110px)'. */
  size: string;
  /* The h1's font-size below 700px. */
  phoneSize: string;
  phone?: 'wrap' | 'block' | 'set';
  balance?: boolean;
  lede?: ReactNode;
  actions?: ReactNode;
  facts?: readonly Fact[];
  /* Facts whose values are figures (text face, ink) rather than mono tags. */
  figs?: boolean;
  /* Replaces the facts list (the capital page's notice). */
  side?: ReactNode;
  /* The homepage hero: no page label, its own top rhythm. */
  home?: boolean;
  /* Seconds between words in the rise. */
  stagger?: number;
  className?: string;
  children?: ReactNode;
}) {
  const style = { '--h1': size, '--h1-phone': phoneSize } as CSSProperties;
  const cls = ['hero', !home && 'phero', 'wrap', className].filter(Boolean).join(' ');

  return (
    <HeroScope className={cls} style={style} stagger={stagger}>
      {label && (
        <div className="page-label label">
          <b>{label.kicker}</b>
          {label.title}
        </div>
      )}
      <h1 className="hero-h1" data-phone={phone} data-balance={balance ? '' : undefined}>
        {lines.map((ln, i) => (
          <span className="ln" key={i}>
            {ln.split(' ').map((w, j, all) => (
              <Fragment key={j}>
                <span className="w">
                  <span>{emph(w)}</span>
                </span>
                {j < all.length - 1 ? ' ' : null}
              </Fragment>
            ))}
            {i < lines.length - 1 ? ' ' : null}
          </span>
        ))}
      </h1>

      {(lede || actions || facts || side) && (
        <div className="hero-row">
          <div data-in>
            {lede && <p className="hero-lede">{lede}</p>}
            {actions && <div className="hero-actions">{actions}</div>}
          </div>
          {side ??
            (facts && (
              <ul className={figs ? 'facts figs' : 'facts'} data-in>
                {facts.map((f) => (
                  <li key={f.k}>
                    <span>{f.k}</span>
                    <span className={f.live ? 'live' : undefined}>{f.v}</span>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      )}

      {children}
    </HeroScope>
  );
}
