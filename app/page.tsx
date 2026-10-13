import { PageHero, Device, Button, Section, SectionHead, More, Close, Chip, Arrow, Check } from '@/components/system';
import { int } from '@/lib/format';
import { MemberHome } from './_home/MemberHome';
import { GapCompare } from './_home/GapCompare';
import { PathRail } from './_home/PathRail';
import { CounterFlow } from './_home/CounterFlow';
import { LedgerStream } from './_home/LedgerStream';
import './page.css';
import { HERO, GAP, PATH, COUNTER, STATUS, LEDGER, CLOSE } from '@/content/home';

/* The home page, ported from reference/redesign/home.html. The hero shows the
   member app's Home as real UI; then five sections, each one crafted figure,
   alternating paper and ink. Every animated part is rendered here at its end
   state, so the page reads in full with no JavaScript and under reduced
   motion; the client parts animate from a start state back to it. */

export default function Home() {
  return (
    <div className="pg-home">
      <PageHero
        home
        lines={HERO.lines}
        size="min(9.4vw, 132px)"
        phoneSize="clamp(46px, 13.4vw, 72px)"
        stagger={0.07}
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
      >
        <div className="stage">
          <div className="stagebox" data-stage="device">
            <Device trace="hero">
              <MemberHome />
            </Device>
          </div>
          <div className="stage-cap label">
            <span>{HERO.stage.caption}</span>
            <span>{HERO.stage.sample}</span>
          </div>
        </div>
      </PageHero>

      {/* 01 · renting against Clear, paid in month by month as you scroll */}
      <Section ink id="gap">
        <SectionHead n={GAP.n} label={GAP.label} title={GAP.title} line={GAP.line} more={GAP.more} />
        <GapCompare />
      </Section>

      {/* 02 · the path: three phases on one rule */}
      <Section id="path">
        <SectionHead n={PATH.n} label={PATH.label} title={PATH.title} line={PATH.line} more={PATH.more} />
        <PathRail>
          <div className="ph reached">
            <div className="ph-h">
              <span className="knob" aria-hidden="true" />
              <span className="who">{PATH.renter.who}</span>
              <span className="n">{PATH.renter.n}</span>
            </div>
            <h3 className="ph-t">{PATH.renter.title}</h3>
            <div className="ph-v">
              <div className="cred-n">
                <span className="fig" data-cred="">
                  {int(PATH.renter.credits)}
                </span>
                <span className="ck">{PATH.renter.creditsLabel}</span>
              </div>
              <span className="ladder" aria-hidden="true">
                <i data-ladder="" />
                {PATH.renter.marks.map((m) => (
                  <b key={m} style={{ left: `${((m / PATH.renter.credits) * 100).toFixed(1)}%` }} />
                ))}
              </span>
              <p className="ph-c">{PATH.renter.caption}</p>
            </div>
            <div className="ph-f">
              <span className="ck">{PATH.gateLabel}</span>
              <span className="fig">{PATH.renter.gate}</span>
            </div>
          </div>
          <div className="ph reached">
            <div className="ph-h">
              <span className="knob" aria-hidden="true" />
              <span className="who">{PATH.owner.who}</span>
              <span className="n">{PATH.owner.n}</span>
            </div>
            <h3 className="ph-t">{PATH.owner.title}</h3>
            <div className="ph-v">
              <ul className="ph-l">
                {PATH.owner.rows.map((r) => (
                  <li className="ok" key={r.k}>
                    <Check />
                    <span>{r.k}</span>
                    <span className="r">{r.v}</span>
                  </li>
                ))}
              </ul>
              <p className="ph-c">{PATH.owner.caption}</p>
            </div>
            <div className="ph-f">
              <span className="ck">{PATH.gateLabel}</span>
              <span className="fig">{PATH.owner.gate}</span>
            </div>
          </div>
          <div className="ph reached">
            <div className="ph-h">
              <span className="knob" aria-hidden="true" />
              <span className="who">{PATH.earner.who}</span>
              <span className="n">{PATH.earner.n}</span>
            </div>
            <h3 className="ph-t">{PATH.earner.title}</h3>
            <div className="ph-v">
              <ul className="ph-l">
                {PATH.earner.rows.map((r) => (
                  <li key={r}>
                    <span>{r}</span>
                    <Arrow />
                  </li>
                ))}
              </ul>
            </div>
            <div className="ph-f">
              <span className="ck">{PATH.gateLabel}</span>
              <span className="fig">{PATH.earner.gate}</span>
            </div>
          </div>
        </PathRail>
      </Section>

      {/* 03 · the counter: the shop's flow, handed across to yours */}
      <Section id="counter">
        <SectionHead n={COUNTER.n} label={COUNTER.label} title={COUNTER.title} line={COUNTER.line} links={[...COUNTER.links]} />
        <CounterFlow />
        <div className="kfigs">
          {COUNTER.figs.map((f) => (
            <div key={f.fig}>
              <span className="fig">{f.fig}</span>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
        <p className="flow-cap label">{COUNTER.caption}</p>
      </Section>

      {/* 04 · what exists today */}
      <Section id="status">
        <SectionHead n={STATUS.n} label={STATUS.label} title={STATUS.title} line={STATUS.line} />
        <ul className="rows body-gap">
          {STATUS.rows.map((r) => (
            <li key={r.name}>
              <span className="nm">{r.name}</span>
              <span className="ds">{r.desc}</span>
              <Chip tone={r.tone}>{r.chip}</Chip>
            </li>
          ))}
        </ul>
      </Section>

      {/* 05 · the public ledger */}
      <Section ink id="ledger">
        <SectionHead
          n={LEDGER.n}
          label={LEDGER.label}
          title={LEDGER.title}
          aside={
            <>
              <div>
                <p className="line">{LEDGER.line}</p>
                <p className="src">{LEDGER.source}</p>
              </div>
              <More href={LEDGER.more.href}>{LEDGER.more.label}</More>
            </>
          }
        />
        <LedgerStream />
      </Section>

      <Close title={CLOSE.title} line={CLOSE.line} primary={CLOSE.primary} ghost={CLOSE.ghost} />
    </div>
  );
}
