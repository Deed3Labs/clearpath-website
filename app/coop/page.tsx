import { PageHero, Section, SectionHead, Bento, Button } from '@/components/system';
import { money } from '@/lib/format';
import { Vote } from './_parts/Vote';
import { OrgChart } from './_parts/OrgChart';
import { GovMotion, BoardSize, ForkMotion, YearCount } from './_parts/Motion';
import { ForkDrawings, CorridorMap } from './_parts/Drawings';
import './page.css';
import { META, HERO, STRUCTURE, GOVERNANCE, PROTOCOL, WHO } from '@/content/coop';

export const metadata = { title: META.title, description: META.description };

/* The co-op, ported from reference/redesign/coop.html.
 *
 * Hero: the same sentence put to the same vote twice. 01, on ink: the org
 * chart (components/marks/StructureDiagram, driven by OrgChart). 02:
 * governance — one vote each, councils, a third of the board delegated, and
 * the five reserved matters. 03, on ink: the protocol and its fork. 04: who
 * is building it, and the four people we are looking for. */

export default function Coop() {
  const G = GOVERNANCE;
  return (
    <div className="pg-coop">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(6.1vw, 84px)"
        phoneSize="clamp(36px, 10.4vw, 56px)"
        phone="block"
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
        facts={HERO.facts}
        figs
      >
        <Vote />
      </PageHero>

      {/* 01 · Structure: the org chart. */}
      <Section ink id="structure">
        <SectionHead n={STRUCTURE.n} label={STRUCTURE.label} title={STRUCTURE.title} line={STRUCTURE.line} />
        <OrgChart />
      </Section>

      {/* 02 · Governance: three levels and one fraction. */}
      <Section id="governance">
        <SectionHead n={G.n} label={G.label} title={G.title} line={G.line} />
        <GovMotion>
          <Bento className="gov body-gap">
            <div className="cell">
              <div className="c-h">
                <span className="who">{G.members.who}</span>
                <span className="ck">{G.members.ck}</span>
              </div>
              <div className="line2">{G.members.line}</div>
              <div className="fg">
                <div className="bal">
                  <div className="h">
                    <span>{G.members.head.balance}</span>
                    <span />
                    <b>{G.members.head.votes}</b>
                  </div>
                  {G.members.rows.map((r) => (
                    <div key={r.balance}>
                      <span>{money(r.balance, 0)}</span>
                      <span className="bar" style={{ width: r.bar }} aria-hidden="true" />
                      <b>1</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="c-m">
                <p>{G.members.body}</p>
              </div>
            </div>

            <div className="cell">
              <div className="c-h">
                <span className="who">{G.councils.who}</span>
                <span className="ck">{G.councils.ck}</span>
              </div>
              <div className="line2">{G.councils.line}</div>
              <div className="fg">
                <div className="cns">
                  {G.councils.communities.map((c) => (
                    <div key={c.label}>
                      <span className="dots" aria-hidden="true">
                        {Array.from({ length: c.n }, (_, i) => (
                          <i key={i} className={i === 0 ? 'ch' : undefined} />
                        ))}
                      </span>
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="c-m">
                <p>{G.councils.body}</p>
              </div>
            </div>

            <div className="cell">
              <div className="c-h">
                <span className="who">{G.board.who}</span>
                <span className="ck">{G.board.ck}</span>
              </div>
              <div className="line2">{G.board.line}</div>
              <div className="fg">
                <BoardSize />
              </div>
              <div className="c-m">
                <p>{G.board.body}</p>
              </div>
            </div>
          </Bento>
          <Bento className="rsv">
            <div className="c-h">
              <span className="who">{G.reserved.who}</span>
              <span className="ck">{G.reserved.ck}</span>
            </div>
            <ol>
              {G.reserved.items.map((m, i) => (
                <li key={m}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{m}</span>
                </li>
              ))}
            </ol>
          </Bento>
        </GovMotion>
      </Section>

      {/* 03 · The protocol: a fork you can actually take. */}
      <Section ink id="protocol">
        <SectionHead n={PROTOCOL.n} label={PROTOCOL.label} title={PROTOCOL.title} line={PROTOCOL.line} />
        <Bento className="proto body-gap">
          <ForkMotion>
            <ForkDrawings />
          </ForkMotion>
          {PROTOCOL.cells.map((c) => (
            <div className="cell" key={c.who}>
              <div className="c-h">
                <span className="who">{c.who}</span>
                <span className="ck">{c.ck}</span>
              </div>
              <div className="line2">{c.line}</div>
              <div className="c-m">
                <p>{c.body}</p>
              </div>
            </div>
          ))}
          <div className="c-f">
            <a href={PROTOCOL.source.href} rel="noreferrer noopener">
              {PROTOCOL.source.label}
            </a>
            <span className="ck">{PROTOCOL.source.license}</span>
          </div>
        </Bento>
      </Section>

      {/* 04 · Who: small, local, and four open seats. */}
      <Section id="who">
        <SectionHead n={WHO.n} label={WHO.label} title={WHO.title} line={WHO.line} />
        <Bento className="who2 body-gap">
          <div className="cell">
            <div className="c-h">
              <span className="who">{WHO.progress.who}</span>
              <span className="ck">{WHO.progress.ck}</span>
            </div>
            <div className="big">
              <YearCount />
              <div className="tl3">
                {WHO.progress.rows.map((r) => (
                  <span key={r.k}>
                    {r.k}
                    <em>{r.v}</em>
                  </span>
                ))}
              </div>
            </div>
            <div className="c-m">
              <p>{WHO.progress.body}</p>
            </div>
          </div>
          <div className="cell">
            <div className="c-h">
              <span className="who">{WHO.corridor.who}</span>
              <span className="ck">{WHO.corridor.ck}</span>
            </div>
            <div className="big">
              <span className="line2">{WHO.corridor.line}</span>
              <div className="maps">
                {WHO.corridor.maps.map((m, i) => (
                  <figure key={m.k}>
                    <CorridorMap spread={i === 1} />
                    <figcaption>
                      <span>{m.k}</span>
                      <b>{m.v}</b>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className="c-m">
              <p>{WHO.corridor.body}</p>
            </div>
          </div>
        </Bento>
        <Bento className="hire">
          <div className="c-h">
            <span className="who">{WHO.hire.who}</span>
            <span className="ck">{WHO.hire.ck}</span>
          </div>
          {WHO.hire.rows.map((r) => (
            <div className="row" key={r.role}>
              <b>{r.n}</b>
              <span>{r.role}</span>
              <em>{r.area}</em>
            </div>
          ))}
          <div className="c-f">
            <p>{WHO.hire.note}</p>
            <Button href={WHO.hire.cta.href} live>
              {WHO.hire.cta.label}
            </Button>
          </div>
        </Bento>
      </Section>
    </div>
  );
}
