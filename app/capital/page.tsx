import { PageHero, Section, SectionHead, Bento, Button } from '@/components/system';
import { Boards } from './_parts/Boards';
import { HouseDrawing, LandDrawing, SharesDrawing } from './_parts/Drawings';
import { SplitMotion, ProtMotion, RedactMotion } from './_parts/Motion';
import { Terms } from './_parts/Terms';
import { PublicLedger } from './_parts/PublicLedger';
import './page.css';
import {
  META,
  HERO,
  SPLIT,
  CONTRIBUTIONS,
  PROTECTIONS,
  DOWNSIDES,
  DOWNSIDES_SECTION,
  NEXT,
} from '@/content/capital';

export const metadata = { title: META.title, description: META.description };

/* Clear Capital, ported from reference/redesign/capital.html.
 *
 * Legal is the binding constraint on this page: no terms, no rate, no
 * projected return and no yield figure anywhere, and the "Nothing on this
 * page is an offer" notice sits in the hero, in full, beside the lede.
 *
 * Hero: two boards. 01, on ink: three holders on one ground line and the two
 * balance sheets as a ledger of edges. 02: the same terms at any size. 03, on
 * ink: four structural protections. 04: the downsides plus the corridor. 05,
 * on ink: what we publish and what we will not. */

const DRAW = { house: HouseDrawing, land: LandDrawing, shares: SharesDrawing } as const;

export default function Capital() {
  return (
    <div className="pg-capital">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(7.6vw, 104px)"
        phoneSize="clamp(28px, 7.8vw, 58px)"
        phone="set"
        lede={HERO.lede}
        actions={
          <>
            <Button href={HERO.primary.href} live>
              {HERO.primary.label}
            </Button>
            <Button href={HERO.ghost.href} variant="ghost">
              {HERO.ghost.label}
            </Button>
          </>
        }
        side={
          <aside className="notice" data-in>
            <span className="label">{HERO.notice.label}</span>
            <p>{HERO.notice.text}</p>
          </aside>
        }
      >
        <Boards />
      </PageHero>

      {/* 01 · The split. */}
      <Section ink id="split">
        <SectionHead n={SPLIT.n} label={SPLIT.label} title={SPLIT.title} line={SPLIT.line} />
        <SplitMotion>
          <Bento className="split3 body-gap">
            {SPLIT.holders.map((h) => {
              const Draw = DRAW[h.draw];
              return (
                <div className={h.draw === 'land' ? 'cell co' : 'cell'} key={h.n}>
                  <div className="c-h">
                    <span className="who">{h.who}</span>
                    <span className="ck">{h.n}</span>
                  </div>
                  <div className="dw">
                    <Draw />
                  </div>
                  <div className="line2">{h.line}</div>
                  <div className="c-m">
                    <p>{h.body}</p>
                  </div>
                </div>
              );
            })}
          </Bento>
          <Bento className="backs">
            <div className="c-h">
              <span className="who">{SPLIT.backs.who}</span>
              <span className="ck">{SPLIT.backs.ck}</span>
            </div>
            {SPLIT.backs.rows.map((r) => (
              <div className={r.ok ? 'row' : 'row no'} key={r.to}>
                <span className="from">{r.from}</span>
                <span className="wire" aria-hidden="true">
                  <i />
                </span>
                <span className="to">{r.to}</span>
                <span className="vd">{r.verdict}</span>
              </div>
            ))}
          </Bento>
        </SplitMotion>
      </Section>

      {/* 02 · Contributions: the same terms at any size. */}
      <Section id="contributions">
        <SectionHead n={CONTRIBUTIONS.n} label={CONTRIBUTIONS.label} title={CONTRIBUTIONS.title} line={CONTRIBUTIONS.line} />
        <Terms />
      </Section>

      {/* 03 · Protections, a 2×2 on subgrid rows. */}
      <Section ink id="protections">
        <SectionHead n={PROTECTIONS.n} label={PROTECTIONS.label} title={PROTECTIONS.title} line={PROTECTIONS.line} />
        <ProtMotion>
          <Bento className="prot body-gap">
            <div className="cell">
              <div className="c-h">
                <span className="who">{PROTECTIONS.noPref.who}</span>
                <span className="ck">{PROTECTIONS.noPref.ck}</span>
              </div>
              <div className="fg">
                <div className="wf">
                  {PROTECTIONS.noPref.struck.map((k) => (
                    <div className="row x" key={k}>
                      <span>{k}</span>
                      <span className="bar">
                        <em>{PROTECTIONS.noPref.notInStack}</em>
                      </span>
                    </div>
                  ))}
                  <div className="row pr">
                    <span>
                      {PROTECTIONS.noPref.holder.k}
                      <small>{PROTECTIONS.noPref.holder.small}</small>
                    </span>
                    <span className="bar wf-bar" aria-hidden="true">
                      {Array.from({ length: 12 }, (_, i) => (
                        <i key={i} />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="c-m">
                <p>{PROTECTIONS.noPref.body}</p>
              </div>
            </div>

            <div className="cell">
              <div className="c-h">
                <span className="who">{PROTECTIONS.reserved.who}</span>
                <span className="ck">{PROTECTIONS.reserved.ck}</span>
              </div>
              <div className="fg">
                <ul className="rm rm-lit">
                  {PROTECTIONS.reserved.items.map((m) => (
                    <li className="on" key={m}>
                      {m}
                      <em>{PROTECTIONS.reserved.tag}</em>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="c-m">
                <p>{PROTECTIONS.reserved.body}</p>
              </div>
            </div>

            <div className="cell">
              <div className="c-h">
                <span className="who">{PROTECTIONS.board.who}</span>
                <span className="ck">{PROTECTIONS.board.ck}</span>
              </div>
              <div className="fg">
                <ul className="rm sc">
                  {PROTECTIONS.board.rows.map((r) => (
                    <li key={r.k}>
                      {r.k}
                      <em>{r.v}</em>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="c-m">
                <p>{PROTECTIONS.board.body}</p>
              </div>
            </div>

            <div className="cell">
              <div className="c-h">
                <span className="who">{PROTECTIONS.ledger.who}</span>
                <span className="ck">{PROTECTIONS.ledger.ck}</span>
              </div>
              <div className="fg">
                <PublicLedger />
              </div>
              <div className="c-m">
                <p>{PROTECTIONS.ledger.body}</p>
              </div>
            </div>
          </Bento>
        </ProtMotion>
      </Section>

      {/* 04 · The downsides: the five from /contribute, verbatim, and the
          corridor. */}
      <Section id="downsides">
        <SectionHead
          n={DOWNSIDES_SECTION.n}
          label={DOWNSIDES_SECTION.label}
          title={DOWNSIDES_SECTION.title}
          line={DOWNSIDES_SECTION.line}
        />
        <Bento className="down body-gap">
          <div className="c-h">
            <span className="who">{DOWNSIDES_SECTION.who}</span>
            <span className="ck">{DOWNSIDES_SECTION.ck}</span>
          </div>
          <ol>
            {[...DOWNSIDES, DOWNSIDES_SECTION.other].map((d, i) => (
              <li key={d.k} className={i === DOWNSIDES.length ? 'other' : undefined}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <em>{d.k}</em>
                <span>{d.v}</span>
              </li>
            ))}
          </ol>
        </Bento>
      </Section>

      {/* 05 · Next: what we publish, and what we will not. */}
      <Section ink id="next">
        <SectionHead n={NEXT.n} label={NEXT.label} title={NEXT.title} line={NEXT.line} />
        <RedactMotion>
          <Bento className="ts body-gap">
            <div className="cell">
              <div className="c-h">
                <span className="who">{NEXT.get.who}</span>
                <span className="ck">{NEXT.get.ck}</span>
              </div>
              <div className="c-m">
                {NEXT.get.rows.map((r) => (
                  <div className="ts-row" key={r.k}>
                    <span>{r.k}</span>
                    <b>{r.v}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="cell">
              <div className="c-h">
                <span className="who">{NEXT.withheld.who}</span>
                <span className="ck">{NEXT.withheld.ck}</span>
              </div>
              <div className="c-m">
                {NEXT.withheld.rows.map((k) => (
                  <div className="ts-row" key={k}>
                    <span>{k}</span>
                    <span className="rd">
                      <span>{NEXT.withheld.redacted}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="c-f">
              <p>{NEXT.note}</p>
              <Button href={NEXT.cta.href} live>
                {NEXT.cta.label}
              </Button>
            </div>
          </Bento>
        </RedactMotion>
      </Section>
    </div>
  );
}
