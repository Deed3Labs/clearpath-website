import { PageHero, Device, Button, Section, SectionHead, More, Close } from '@/components/system';
import { SavingsScreen } from './_parts/SavingsScreen';
import { LandPlat, HousePlat } from './_parts/Plats';
import { NumbersBento } from './_parts/NumbersBento';
import { MonthlyBill } from './_parts/MonthlyBill';
import { HomesPlan } from './_parts/HomesPlan';
import { GateLadder } from './_parts/GateLadder';
import './page.css';
import { META, HERO, SPLIT, NUMBERS, MONTHLY, HOMES, BACKYARDS, GATE, CLOSE } from '@/content/housing';

export const metadata = { title: META.title, description: META.description };

/* Housing, ported from reference/redesign/housing.html: the land taken out of
   the price and the savings screen where the home path lives, then the land
   and the house as plats, the numbers on ink, the monthly bill, the site
   plan, backyards on ink, and the five-gate ladder to the deed. */

export default function Housing() {
  return (
    <div className="pg-housing">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(6.9vw, 96px)"
        phoneSize="clamp(40px, 11vw, 60px)"
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
        figs
      >
        <div className="stage">
          <div className="stagebox" data-stage="device">
            <Device trace="hero">
              <SavingsScreen />
            </Device>
          </div>
          <div className="stage-cap label">
            <span>{HERO.stage.caption}</span>
            <span>{HERO.stage.sample}</span>
          </div>
        </div>
      </PageHero>

      <Section id="split">
        <SectionHead n={SPLIT.n} label={SPLIT.label} title={SPLIT.title} line={SPLIT.line} />
        <div className="bx split body-gap">
          <div className="cell land">
            <div className="c-h">
              <span className="who">{SPLIT.land.who}</span>
              <span className="ck">{SPLIT.land.k}</span>
            </div>
            <div className="c-m">
              <LandPlat />
              <span className="big">{SPLIT.land.big}</span>
              <p>{SPLIT.land.text}</p>
            </div>
          </div>
          <div className="cell house">
            <div className="c-h">
              <span className="who">{SPLIT.house.who}</span>
              <span className="ck">{SPLIT.house.k}</span>
            </div>
            <div className="c-m">
              <HousePlat />
              <span className="big">{SPLIT.house.big}</span>
              <p>{SPLIT.house.text}</p>
            </div>
          </div>
        </div>
        <p className="note note-b">{SPLIT.note}</p>
      </Section>

      <Section ink id="numbers">
        <SectionHead n={NUMBERS.n} label={NUMBERS.label} title={NUMBERS.title} line={NUMBERS.line} />
        <NumbersBento />
      </Section>

      <Section id="monthly">
        <SectionHead n={MONTHLY.n} label={MONTHLY.label} title={MONTHLY.title} line={MONTHLY.line} />
        <MonthlyBill />
        <p className="note note-b">{MONTHLY.note}</p>
      </Section>

      <Section id="homes">
        <SectionHead n={HOMES.n} label={HOMES.label} title={HOMES.title} line={HOMES.line} />
        <HomesPlan />
      </Section>

      <Section ink id="backyards">
        <SectionHead n={BACKYARDS.n} label={BACKYARDS.label} title={BACKYARDS.title} line={BACKYARDS.line} />
        <div className="bx yard body-gap">
          {BACKYARDS.cells.map((c) => (
            <div className={`cell ${c.key}`} key={c.key}>
              <div className="c-h">
                <span className="who">{c.who}</span>
                <span className="ck">{c.n}</span>
              </div>
              <div>
                <div className="line2">{c.big}</div>
                <div className="sub">{c.sub}</div>
              </div>
              <div className="c-m">
                <p>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bx yard-f">
          <p>{BACKYARDS.foot}</p>
          <More href={BACKYARDS.more.href}>{BACKYARDS.more.label}</More>
        </div>
      </Section>

      <Section id="gate">
        <SectionHead n={GATE.n} label={GATE.label} title={GATE.title} line={GATE.line} />
        <GateLadder />
        <div className="bx gate-f">
          <p>{GATE.foot}</p>
          <Button href={GATE.primary.href} live>
            {GATE.primary.label}
          </Button>
        </div>
      </Section>

      <Close title={CLOSE.title} line={CLOSE.line} primary={CLOSE.primary} ghost={CLOSE.ghost} />
    </div>
  );
}
