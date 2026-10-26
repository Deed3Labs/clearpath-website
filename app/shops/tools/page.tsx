import type { Metadata } from 'next';
import { PageHero, Device, Button, Section, Close, Chip } from '@/components/system';
import { TillScreen } from './_parts/TillScreen';
import { FeeCells } from './_parts/FeeCells';
import { TablesScreen } from './_parts/TablesScreen';
import { PointStates } from './_parts/PointStates';
import { RewardsPhone } from './_parts/RewardsPhone';
import { CartMember } from './_parts/CartMember';
import { RulesList } from './_parts/RulesList';
import { OnlineCheckout } from './_parts/OnlineCheckout';
import { Snippet } from './_parts/Snippet';
import { LinkCell } from './_parts/LinkCell';
import { CostTable } from './_parts/CostTable';
import { Head } from './_parts/Head';
import { Rise } from './_parts/Rise';
import { HardwareLineup } from './_parts/HardwareLineup';
import { HowReserving } from '@/components/shop/HowReserving';
import { forShopsProducts } from '@/lib/shop/catalog';
import { shopCatalog } from '@/lib/shop/source';
import './page.css';
import { META, HERO, FEES, TABLES, REWARDS, ONLINE, HARDWARE, COSTS, CLOSE } from '@/content/shopsTools';

export const metadata: Metadata = { title: META.title, description: HERO.lede };

/* Tools for shops, ported from the tools view of
   reference/redesign/shops-tools.html: the till on the stage, then what a
   sale costs, tables on ink, rewards, online, the hardware on ink, what it
   costs, and the close. */

export default async function ShopsTools() {
  /* The links into the shop show only when it has hardware to show. */
  const hardwareVisible = forShopsProducts(await shopCatalog()).length > 0;

  return (
    <div className="pg-shops-tools">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(9.4vw, 132px)"
        phoneSize="clamp(46px, 13.4vw, 72px)"
        phone="wrap"
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
            <Device>
              <TillScreen />
            </Device>
          </div>
          <div className="stage-cap label">
            <span>{HERO.stage.caption}</span>
            <span>{HERO.stage.sample}</span>
          </div>
        </div>
      </PageHero>

      <Section id="till">
        <Head n={FEES.n} label={FEES.label} chip={<Chip tone="live">{FEES.chip}</Chip>} title={FEES.title} line={FEES.line} />
        <FeeCells />
        <p className="foot-note">{FEES.note}</p>
      </Section>

      <Section ink id="tables">
        <Head n={TABLES.n} label={TABLES.label} chip={<Chip tone="underway">{TABLES.chip}</Chip>} title={TABLES.title} line={TABLES.line} />
        <div className="body-gap">
          <TablesScreen />
        </div>
        <PointStates />
      </Section>

      <Section id="rewards">
        <Head n={REWARDS.n} label={REWARDS.label} chip={<Chip tone="underway">{REWARDS.chip}</Chip>} title={REWARDS.title} line={REWARDS.line} />
        <Rise className="bx c3 body-gap">
          <RewardsPhone />
          <CartMember />
          <RulesList />
        </Rise>
      </Section>

      <Section id="online">
        {/* Planned is a plan, not a state with activity: the chip carries no
            dot, as the spec draws it. */}
        <Head
          n={ONLINE.n}
          label={ONLINE.label}
          chip={
            <span className="chip" data-tone="underway">
              {ONLINE.chip}
            </span>
          }
          title={ONLINE.title}
          line={ONLINE.line}
        />
        <Rise className="bx c2 body-gap">
          <div className="cell">
            <div className="c-h">
              <span className="who">{ONLINE.checkout.who}</span>
              <span className="ck">{ONLINE.checkout.ck}</span>
            </div>
            <div className="c-m">
              <OnlineCheckout />
            </div>
          </div>
          <div className="cell">
            <div className="c-h">
              <span className="who">{ONLINE.integration.who}</span>
              <span className="ck">{ONLINE.integration.ck}</span>
            </div>
            <div className="c-m">
              <Snippet />
              <p>{ONLINE.integration.text}</p>
            </div>
            <LinkCell />
          </div>
        </Rise>
      </Section>

      <Section ink id="hardware">
        <Head
          n={HARDWARE.n}
          label={HARDWARE.label}
          chip={<Chip tone="underway">{HARDWARE.chip}</Chip>}
          title={HARDWARE.title}
          line={HARDWARE.line}
          more={hardwareVisible ? HARDWARE.more : null}
        />
        <HardwareLineup />
        <HowReserving items={HARDWARE.how} />
      </Section>

      <Section id="costs">
        <Head n={COSTS.n} label={COSTS.label} title={COSTS.title} line={COSTS.line} />
        <CostTable hardwareVisible={hardwareVisible} />
      </Section>

      <Close n={CLOSE.n} label={CLOSE.label} title={CLOSE.title} line={CLOSE.line} primary={CLOSE.primary} ghost={CLOSE.ghost} />
    </div>
  );
}
