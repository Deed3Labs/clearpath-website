import Link from 'next/link';
import { Ledger, Note, Stat, Tiles } from '@/components/primitives';
import { SplitChooser } from '@/components/interactive/SplitChooser';
import { OPENING, DRAW_ORDER, TERM_PLANS, SPLIT, SAVINGS, CYCLE, COMPARISON } from '@/content/how';

export const metadata = {
  title: 'How it works',
  description:
    'One balance, drawn cheapest first. Savings-backed credit that gets cheaper the longer you hold it, and a term-plan shelf with a single ceiling across every shop.',
};

/* Second pass on the .hx system.
 *
 * The migration changed the containers and left the composition alone, so the
 * page kept its real fault: four sections put a sentence in a one-third column
 * beside a tall table, and that column ran out 162px, 389px and 404px above
 * the bottom of its row. A column that short is not a column, it is a caption.
 * Tables run full width now, and what sat beside them is either a list, a pair
 * of statements, or gone.
 *
 * Rhythm: a claim and its terms -> the mechanism on full-bleed ink -> a rate
 * table -> the chooser -> the figures -> four states -> the closing pair. No
 * two consecutive sections share a shape, and the one dark band is spent on
 * the draw order, which is what the whole page is about. */

export default function How() {
  return (
    <div className="hx">
      {/* S1 - The claim, and what membership actually costs. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b> {OPENING.kicker}
        </p>
        <div className="hx-grid">
          <h1 className="hx-h2 c-two-thirds">{OPENING.heading}</h1>
          <p className="hx-lede c-third">{OPENING.lede}</p>

          {/* Four facts, read as four. It was one 155-character paragraph in
              a half-width block with nothing beside it. */}
          <div className="c-full">
            <p className="d3">{OPENING.membership.title}</p>
            <ul className="crit" data-cols="2">
              {OPENING.membership.criteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* S2 - The mechanism, on this page's one ink band. Four equal cells;
          the number carries the order, not the width. */}
      <section className="hx-band" data-tone="ink" id="draw-order">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>02</b> {DRAW_ORDER.kicker}
          </p>
          <div className="hx-grid" style={{ marginBottom: 'clamp(32px, 4vw, 64px)' }}>
            <h2 className="hx-h2 c-two-thirds">{DRAW_ORDER.heading}</h2>
            <p className="hx-lede c-third">{DRAW_ORDER.sub}</p>
          </div>
        </div>

        <div className="hx-bento">
          {DRAW_ORDER.steps.map((t, i) => (
            <article className="cell" data-size="eq4" key={t.title}>
              <p className="cell-n">
                {String(i + 1).padStart(2, '0')} · {t.meta}
              </p>
              <h3 className="cell-title">{t.title}</h3>
              <p className="t-sm cell-body">{t.body}</p>
            </article>
          ))}
        </div>

        <div className="hx-wrap" style={{ marginTop: 'clamp(32px, 4vw, 64px)' }}>
          <div className="hx-cols" data-n="2" data-rows="2">
            <div>
              <p className="d4">Repayment runs the other way.</p>
              <p className="t-sm hx-prose">{DRAW_ORDER.standfirst}</p>
            </div>
            <div>
              <p className="d4">Every rate is on the screen where you take it.</p>
              <p className="t-sm hx-prose">{DRAW_ORDER.close}</p>
            </div>
          </div>
        </div>
      </section>

      {/* S3 - One shelf, one ceiling. The shelf runs full width. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>03</b> {TERM_PLANS.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">
            {TERM_PLANS.heading.lead}
            {/* The one link the site sets in display type. The inner span is
                what leans; the rule under it belongs to the anchor, so it
                stays level while the word goes oblique. */}
            <Link href={TERM_PLANS.heading.link.href} className="lean">
              <span>{TERM_PLANS.heading.link.label}</span>
            </Link>
            {TERM_PLANS.heading.tail}
          </h2>
          <p className="hx-lede c-third">{TERM_PLANS.sub}</p>

          <div className="c-full">
            <Ledger items={[...TERM_PLANS.ledger]} />
          </div>

          <div className="c-full hx-cols" data-n="2" data-rows="3">
            <div>
              <p className="d4">{TERM_PLANS.asks.title}</p>
              <ul className="crit">
                {TERM_PLANS.asks.criteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="t-sm hx-prose">{TERM_PLANS.asks.note}</p>
            </div>
            <div>
              <p className="d4">{TERM_PLANS.stacking.title}</p>
              <p className="t-sm hx-prose">{TERM_PLANS.stacking.body}</p>
              {/* The ELPA line lives here rather than as a full-width note
                  under the table: it gives this column the weight to match
                  the list beside it, instead of ending 350px short. */}
              <Note>{TERM_PLANS.close}</Note>
            </div>
          </div>
        </div>
      </section>

      {/* S4 - You choose how to clear it. The chooser runs full width; it was
          two-thirds of a row with a two-sentence column beside it, and that
          column ran out 404px above the bottom. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>04</b> {SPLIT.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{SPLIT.heading}</h2>
          <p className="hx-lede c-third">{SPLIT.sub}</p>

          {/* No pair here: SplitChooser prints SPLIT.caption and SPLIT.close
              itself, and putting them above it too showed the same two lines
              twice on one screen. */}
          <div className="c-full">
            <p className="t-body hx-prose">{SPLIT.standfirst}</p>
          </div>

          <div className="c-full">
            <SplitChooser />
          </div>
        </div>
      </section>

      {/* S5 - What moves you along that order. The page's figures. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>05</b> {SAVINGS.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{SAVINGS.heading}</h2>
          <p className="hx-lede c-third">{SAVINGS.sub}</p>

          {/* Four facts that were one sixty-word sentence. */}
          <div className="c-full">
            <div className="stat-row">
              {SAVINGS.stats.map((s) => (
                <Stat key={s.figure} figure={s.figure} caption={s.caption} />
              ))}
            </div>
          </div>

          {/* One row of three, all on the same rule. The figure used to sit
              in its own column with no rule and no label beside two blocks
              that had both, so the row read as two things and a stray. */}
          <div className="c-full hx-cols" data-n="3" data-rows="3">
            <div className="side" data-live="">
              <p className="side-label">{SAVINGS.gate.label}</p>
              <p className="side-fig">{SAVINGS.gate.figure}</p>
              <p className="t-sm side-note">{SAVINGS.gate.caption}</p>
            </div>
            {SAVINGS.sides.map((side) => (
              <div className="side" key={side.label}>
                <p className="side-label">{side.label}</p>
                <p className="side-line">{side.line}</p>
                <p className="t-sm side-note">{side.note}</p>
              </div>
            ))}
          </div>

          <div className="c-full">
            <p className="d4" style={{ marginBottom: 'var(--spacing-2)' }}>
              {SAVINGS.tilesHeading}
            </p>
            <Tiles items={SAVINGS.tiles} />
          </div>
        </div>
      </section>

      {/* S6 - The cycle. Four states, full width. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>06</b> {CYCLE.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{CYCLE.heading}</h2>
          <p className="hx-lede c-third">{CYCLE.sub}</p>

          <div className="c-full">
            <Ledger items={[...CYCLE.ledger]} />
          </div>

          <div className="c-full hx-cols" data-n="2" data-rows="2">
            {CYCLE.pair.map((c) => (
              <div key={c.title}>
                <p className="d4">{c.title}</p>
                <p className="t-sm hx-prose">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S7 - The page ends on its strongest line, not on a table. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>07</b> {COMPARISON.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{COMPARISON.heading}</h2>
          <p className="hx-lede c-third">{COMPARISON.sub}</p>

          {/* The page closes on this. Two statements at set-piece size,
              each breaking after the verb, one sentence under each — the
              other six sections are dense, and this one is meant to be the
              place the reader stops. */}
          <div className="c-full hx-cols" data-n="2" data-rows="3">
            {[
              { ...COMPARISON.pair.theirs, note: COMPARISON.ours[0].description, ours: false },
              { ...COMPARISON.pair.ours, note: COMPARISON.ours[1].description, ours: true },
            ].map((side) => (
              <div className={side.ours ? 'versus is-ours' : 'versus'} key={side.label}>
                <p className="t-note">{side.label}</p>
                <p className="versus-line" data-grand="">
                  {side.lines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </p>
                <p className="t-sm versus-note hx-prose">{side.note}</p>
              </div>
            ))}
          </div>

          <div className="c-full">
            <Ledger items={[...COMPARISON.theirs]} />
          </div>
        </div>
      </section>
    </div>
  );
}
