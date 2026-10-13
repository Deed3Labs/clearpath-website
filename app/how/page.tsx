import { PageHero, Button, Section, SectionHead, Close } from '@/components/system';
import { SplitChooser } from '@/components/interactive/SplitChooser';
import { DrawOrder } from './_parts/DrawOrder';
import { TermPlans } from './_parts/TermPlans';
import { GateBox } from './_parts/GateBox';
import { CycleCard } from './_parts/CycleCard';
import './page.css';
import { META, HERO, DRAW, PLANS, SPLIT, SAVINGS, CYCLE, COMPARE, CLOSE } from '@/content/how';

export const metadata = { title: META.title, description: META.description };

/* How it works, ported from reference/redesign/how.html: the claim and a jump
   list, then six sections — draw order, term plans, the split, savings on
   ink, the cycle, and the comparison. Interactive parts render their end
   state on the server and animate from a start state with motion. */

export default function How() {
  return (
    <div className="pg-how">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(8.2vw, 114px)"
        phoneSize="clamp(42px, 12vw, 64px)"
        phone="wrap"
        balance
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
        <nav className="jump" aria-label={HERO.jumpLabel} data-in="">
          {HERO.jump.map((j) => (
            <a key={j.href} href={j.href}>
              <b>{j.n}</b>
              {j.label}
            </a>
          ))}
        </nav>
      </PageHero>

      <Section id="draw" className="first">
        <SectionHead n={DRAW.n} label={DRAW.label} title={DRAW.title} line={DRAW.line} />
        <DrawOrder />
      </Section>

      <Section id="plans">
        <SectionHead n={PLANS.n} label={PLANS.label} title={PLANS.title} line={PLANS.line} more={PLANS.more} />
        <TermPlans />
        <p className="wf-note plans-note">{PLANS.note}</p>
      </Section>

      <Section id="split">
        <SectionHead n={SPLIT.n} label={SPLIT.label} title={SPLIT.title} line={SPLIT.line} />
        <SplitChooser />
      </Section>

      <Section ink id="savings">
        <SectionHead n={SAVINGS.n} label={SAVINGS.label} title={SAVINGS.title} line={SAVINGS.line} />
        <div className="stats4 body-gap">
          {SAVINGS.stats.map((s) => (
            <div key={s.fig}>
              <span className="fig">{s.fig}</span>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <GateBox />
        <div className="sides2">
          {SAVINGS.sides.map((s) => (
            <div key={s.label}>
              <span className="label">{s.label}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <div className="nots">
          <span className="label">{SAVINGS.notsLabel}</span>
          <ul>
            {SAVINGS.nots.map((n) => (
              <li key={n.k}>
                <b>{n.k}</b>
                <span>{n.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="cycle">
        <SectionHead n={CYCLE.n} label={CYCLE.label} title={CYCLE.title} line={CYCLE.line} />
        <CycleCard />
      </Section>

      <Section id="compare" className="flush">
        <SectionHead n={COMPARE.n} label={COMPARE.label} title={COMPARE.title} line={COMPARE.line} />
        <div className="vs body-gap">
          {(['theirs', 'ours'] as const).map((k) => (
            <div className={k} key={k}>
              <span className="label">{COMPARE[k].label}</span>
              <span className="say">{COMPARE[k].say}</span>
              <p>{COMPARE[k].text}</p>
            </div>
          ))}
        </div>
        <ul className="honest">
          {COMPARE.honest.map((h) => (
            <li key={h.k}>
              <span className="k label">{h.k}</span>
              <span className="v">{h.v}</span>
              <p>{h.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Close className="flush" title={CLOSE.title} line={CLOSE.line} primary={CLOSE.primary} ghost={CLOSE.ghost} />
    </div>
  );
}
