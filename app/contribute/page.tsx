import { Note, Button, TextLink } from '@/components/primitives';
import { OPENING, HOW, DOWNSIDES, DOWNSIDES_INTRO, WHO, CLOSE } from '@/content/contribute';

export const metadata = {
  title: 'Contribute land',
  description:
    'Contribute rental property or land to Clear Properties in exchange for units under section 721, rather than selling it and paying tax on the whole gain this year.',
};

/* Migrated to the .hx layout system. The numbered rail is gone; the section
 * number is an inline label.
 *
 * The page was four sections of heading and paragraph, and its whole argument
 * — that contributing is not selling — was a subordinate clause inside the
 * lede. It is the opening pair now, and the honest downsides have their own
 * section instead of a sidebar, because a list called "the honest downsides"
 * sitting in a 3-column panel is not being honest about how much it means it.
 *
 * Rhythm: a pair of statements -> four equal cells on full-bleed ink -> a list
 * -> three columns -> one sentence and one figure. No two consecutive sections
 * share a shape. */

export default function Contribute() {
  return (
    <div className="hx">
      {/* S1 - Two ways to stop being a landlord, side by side. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b> {OPENING.kicker}
        </p>
        <div className="hx-grid">
          <h1 className="hx-h2 c-two-thirds">{OPENING.heading}</h1>
          <p className="hx-lede c-third">{OPENING.lede}</p>

          <div className="c-full hx-cols" data-n="2" data-rows="3">
            {OPENING.sides.map((side) => (
              <div
                className="side"
                key={side.label}
                data-live={'live' in side && side.live ? '' : undefined}
              >
                <p className="side-label">{side.label}</p>
                <p className="side-line">{side.line}</p>
                <p className="t-sm side-note">{side.note}</p>
              </div>
            ))}
          </div>

          {/* Full width: this disclaimer qualifies the section, not the
              column it happened to start under. */}
          <div className="c-full note-wide">
            <Note>{OPENING.note}</Note>
          </div>
        </div>
      </section>

      {/* S2 - How it works, on this page's one ink band. Four equal cells;
          the mono line carries the step number and the term it turns on. */}
      <section className="hx-band" data-tone="ink" id="how-it-works">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>02</b> {HOW.kicker}
          </p>
          <div className="hx-grid" style={{ marginBottom: 'clamp(32px, 4vw, 64px)' }}>
            <h2 className="hx-h2 c-two-thirds">{HOW.heading}</h2>
            <p className="hx-lede c-third">{HOW.sub}</p>
          </div>
        </div>

        <div className="hx-bento">
          {HOW.steps.map((s, i) => (
            <article className="cell" data-size="eq4" key={s.title}>
              <p className="cell-n">
                {String(i + 1).padStart(2, '0')} · {s.meta}
              </p>
              <h3 className="cell-title">{s.title}</h3>
              <p className="t-sm cell-body">{s.body}</p>
            </article>
          ))}
        </div>

        <div className="hx-wrap" style={{ marginTop: 'clamp(32px, 4vw, 64px)' }}>
          <Note>{HOW.note}</Note>
        </div>
      </section>

      {/* S3 - The honest downsides. Its own section, set in the same type as
          everything else, because that is what makes it honest. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>03</b> {DOWNSIDES_INTRO.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{DOWNSIDES.title}</h2>
          <p className="hx-lede c-third">{DOWNSIDES_INTRO.sub}</p>
          <div className="c-full">
            <ul className="crit" data-cols="2">
              {DOWNSIDES.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* S4 - Who this is for. Three people, three columns. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>04</b> {WHO.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{WHO.heading}</h2>

          <div className="c-full hx-cols" data-n="3" data-rows="3">
            {WHO.columns.map((col) => (
              <div className="door" key={col.key}>
                <h3 className="door-head">{col.heading}</h3>
                <p className="door-line">{col.line}</p>
                <p className="t-sm door-body">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S5 - The close. One sentence, one figure, and the thing most likely
          to save someone a wasted call. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>05</b> {CLOSE.kicker}
        </p>
        <div className="hx-grid">
          {/* Two rows, each a statement beside the thing that qualifies it.
              The figure block carries no rule of its own: a 2px rule over one
              column, with an 80px headline and no rule beside it, reads as a
              line someone forgot to finish rather than as structure. */}
          <p className="hx-stage-line c-two-thirds">{CLOSE.statement}</p>
          <div className="c-third fig-stack">
            <p className="side-label">The window</p>
            <p className="side-fig">{CLOSE.figure}</p>
            <p className="t-sm side-note">{CLOSE.figureCaption}</p>
          </div>

          {/* The button sits under the paragraph it acts on, not stranded
              beside the headline with 95px of nothing under it. */}
          <div className="c-two-thirds">
            <p className="t-body hx-prose">{CLOSE.body}</p>
            <div style={{ marginTop: 'clamp(28px, 3.4vw, 48px)' }}>
              <Button href={CLOSE.cta.href} live>{CLOSE.cta.label}</Button>
            </div>
          </div>
          <div className="c-third">
            <p className="t-sm hx-prose">
              {CLOSE.onward.before}
              <TextLink href={CLOSE.onward.link.href}>{CLOSE.onward.link.label}</TextLink>
              {CLOSE.onward.after}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
