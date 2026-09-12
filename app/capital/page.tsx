import { Ledger, Note, Button, TextLink } from '@/components/primitives';
import {
  OPENING,
  SPLIT,
  SCALE,
  PROTECTIONS,
  DOWNSIDES,
  DOWNSIDES_SECTION,
  NEXT,
} from '@/content/capital';

export const metadata = {
  title: 'Clear Capital',
  description:
    'Clear Capital Holdings is the separate company through which investors and property contributors participate in the cooperative’s assets — and what stops it ending up on the opposite side of the members.',
};

/* Migrated to the .hx layout system. The numbered rail is gone; the section
 * number is an inline label.
 *
 * §7 Legal is the binding constraint on this page and nothing about it
 * changed: no terms, no rate, no projected return, no yield, and the "nothing
 * here is an offer" disclaimer stays at the top, in full, where a reader meets
 * it before anything else.
 *
 * The page was six sections of heading, paragraph and table. Its argument —
 * that the two sides are separated by structure rather than by promise — was
 * the second half of a 300-character lede; it opens the page.
 *
 * Rhythm: a pair of boards -> three holders on full-bleed ink -> a table ->
 * four equal cells edge to edge -> a list -> one sentence. No two consecutive
 * sections share a shape. */

export default function Capital() {
  return (
    <div className="hx">
      {/* S1 - Two boards, which is the whole answer to "whose side are you
          on". §7 Legal: the offer disclaimer runs the full band. */}
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

          <div className="c-full note-wide">
            <Note>{OPENING.note}</Note>
          </div>
        </div>
      </section>

      {/* S2 - Three holders, on this page's one ink band. */}
      <section className="hx-band" data-tone="ink" id="the-split">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>02</b> {SPLIT.kicker}
          </p>
          <div className="hx-grid">
            <h2 className="hx-h2 c-two-thirds">{SPLIT.heading}</h2>
            <p className="hx-lede c-third">{SPLIT.sub}</p>

            <div className="c-full hx-cols" data-n="3" data-rows="3">
              {SPLIT.columns.map((col) => (
                <div
                  className="side"
                  key={col.label}
                  data-live={'live' in col && col.live ? '' : undefined}
                >
                  <p className="side-label">{col.label}</p>
                  <p className="side-line">{col.line}</p>
                  <p className="t-sm side-note">{col.note}</p>
                </div>
              ))}
            </div>

            <div className="c-two-thirds">
              <p className="t-body hx-prose">{SPLIT.close}</p>
            </div>
          </div>
        </div>
      </section>

      {/* S3 - The four terms, as a table, because that is what they are. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>03</b> {SCALE.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{SCALE.heading}</h2>
          <p className="hx-lede c-third">{SCALE.sub}</p>

          <div className="c-full">
            <Ledger items={[...SCALE.ledger]} />
          </div>

          <div className="c-full hx-cols" data-n="2" data-rows="2">
            <div>
              <p className="d4">One duplex or a portfolio.</p>
              <p className="t-sm hx-prose">{SCALE.scale}</p>
            </div>
            <div>
              <p className="d4">A single property works the same way.</p>
              <p className="t-sm hx-prose">
                <TextLink href={SCALE.link.href}>{SCALE.link.label}</TextLink>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* S4 - Protections. Four equal cells; the mono line carries the term
          each one turns on. */}
      <section className="hx-band" data-pad="tight">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>04</b> {PROTECTIONS.kicker}
          </p>
          <div className="hx-grid" style={{ marginBottom: 'clamp(32px, 4vw, 64px)' }}>
            <h2 className="hx-h2 c-two-thirds">{PROTECTIONS.heading}</h2>
            <p className="hx-lede c-third">{PROTECTIONS.sub}</p>
          </div>
        </div>

        <div className="hx-bento">
          {PROTECTIONS.steps.map((s, i) => (
            <article className="cell" data-size="eq4" key={s.title}>
              <p className="cell-n">
                {String(i + 1).padStart(2, '0')} · {s.meta}
              </p>
              <h3 className="cell-title">{s.title}</h3>
              <p className="t-sm cell-body">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* S5 - The honest downsides. DOWNSIDES is imported from
          content/contribute, so "verbatim" is enforced by the module system
          rather than by remembering, and it is not softened here. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>05</b> {DOWNSIDES_SECTION.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{DOWNSIDES.title}</h2>
          <p className="hx-lede c-third">{DOWNSIDES_SECTION.sub}</p>

          <div className="c-full">
            <ul className="crit" data-cols="2">
              {DOWNSIDES.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="c-two-thirds">
            <p className="d4">{DOWNSIDES_SECTION.extra.title}</p>
            <p className="t-sm hx-prose">{DOWNSIDES_SECTION.extra.body}</p>
          </div>
        </div>
      </section>

      {/* S6 - What we will not publish, which is itself the argument. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>06</b> {NEXT.kicker}
        </p>
        <div className="hx-grid">
          <p className="hx-stage-line c-two-thirds">{NEXT.statement}</p>
          {/* The button follows the sentence that describes what happens on
              the call, not the refusal above it — and it closes a 121px hole
              under that column. */}
          <div className="c-third">
            <p className="t-sm hx-prose">{NEXT.body}</p>
            <div style={{ marginTop: 'clamp(24px, 2.6vw, 36px)' }}>
              <Button href={NEXT.cta.href} live>{NEXT.cta.label}</Button>
            </div>
          </div>

          <div className="c-full note-wide">
            <Note>{NEXT.note}</Note>
          </div>
        </div>
      </section>
    </div>
  );
}
