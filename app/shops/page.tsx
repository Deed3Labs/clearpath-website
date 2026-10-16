import { PageHero, Device, Button, Section, SectionHead, Close, Rail, Knob, Check, More } from '@/components/system';
import { CounterHero } from './_parts/CounterHero';
import { FeeCalc } from './_parts/FeeCalc';
import { CounterSteps } from './_parts/CounterSteps';
import { RefundHandoff } from './_parts/RefundHandoff';
import './page.css';
import { META, HERO, DIFFERENCE, COUNTER, FIT, FOUNDING, MONEY, MEMBERSHIP } from '@/content/shops';

export const metadata = { title: META.title, description: META.description };

/* For shops, ported from reference/redesign/shops.html: the question every
   service writer can answer and the counter app, then the fee calculator on
   ink, the counter steps driving the tablet, fit, founding partners on ink,
   the money (the clock to payout and the refund hand-off), and membership. */

export default function Shops() {
  return (
    <div className="pg-shops">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(7.9vw, 110px)"
        phoneSize="clamp(42px, 11.6vw, 64px)"
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
              <CounterHero />
            </Device>
          </div>
          <div className="stage-cap label">
            <span>{HERO.stage.caption}</span>
            <span>{HERO.stage.sample}</span>
          </div>
        </div>
      </PageHero>

      <Section ink id="difference">
        <SectionHead n={DIFFERENCE.n} label={DIFFERENCE.label} title={DIFFERENCE.title} line={DIFFERENCE.line} />
        <FeeCalc />
        <p className="note calc-note">{DIFFERENCE.note}</p>
      </Section>

      <Section id="counter">
        <SectionHead n={COUNTER.n} label={COUNTER.label} title={COUNTER.title} line={COUNTER.line} />
        <CounterSteps />
        <div className="bx pan3">
          {COUNTER.panels.map((p) => (
            <div className="cell" key={p.title}>
              <div className="c-m">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
              <div className={'more' in p ? 'c-f has-more' : 'c-f'}>
                <span className="ck">{p.k}</span>
                {'href' in p ? (
                  <a className="fig" href={p.href}>
                    {p.v}
                  </a>
                ) : (
                  <span className="fig">{p.v}</span>
                )}
                {'more' in p && <More href={p.more.href}>{p.more.label}</More>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="fit">
        <SectionHead n={FIT.n} label={FIT.label} title={FIT.title} line={FIT.line} />
        <div className="bx fit body-gap">
          <div className="cell yes">
            <div className="c-h">
              <span className="mk y">
                <Check />
              </span>
              <h3>{FIT.yes.title}</h3>
            </div>
            <ul className="fitlist">
              {FIT.yes.items.map((t) => (
                <li key={t}>
                  <span className="y2">
                    <Check />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="c-f">{FIT.yes.foot}</div>
          </div>
          <div className="cell no">
            <div className="c-h">
              <span className="mk n">
                <span className="x" />
              </span>
              <h3>{FIT.no.title}</h3>
            </div>
            <ul className="fitlist">
              {FIT.no.items.map((t) => (
                <li key={t}>
                  <span className="x" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="c-f">
              {FIT.no.foot}
              <p className="fit-after">{FIT.no.after}</p>
              <More href={FIT.no.more.href}>{FIT.no.more.label}</More>
            </div>
          </div>
        </div>
      </Section>

      <Section ink id="founding">
        <SectionHead n={FOUNDING.n} label={FOUNDING.label} title={FOUNDING.title} line={FOUNDING.line} />
        <div className="bx perk body-gap">
          {FOUNDING.perks.map((p) => (
            <div key={p.k} className={'live' in p ? 'live' : undefined}>
              <span className="ck">{p.k}</span>
              <span className="fig">{p.v}</span>
              <span className="note">{p.note}</span>
            </div>
          ))}
        </div>
        <div className="bx fnd2">
          <div className="cell">
            <div className="c-m">
              <h3>{FOUNDING.setup.title}</h3>
              <ol className="six">
                {FOUNDING.setup.steps.map((s, i) => (
                  <li key={s} className={i === FOUNDING.setup.steps.length - 1 ? 'last' : undefined}>
                    <b>{i + 1}</b>
                    {s}
                  </li>
                ))}
              </ol>
              <p>{FOUNDING.setup.text}</p>
            </div>
            <div className="c-f">
              <span className="ck">{FOUNDING.setup.foot}</span>
            </div>
          </div>
          <div className="cell">
            <div className="c-m">
              <h3>{FOUNDING.terms.title}</h3>
              <dl className="terms6">
                {FOUNDING.terms.rows.map((r) => (
                  <div key={r.k}>
                    <dt>{r.k}</dt>
                    <dd>{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="c-f">
              <span className="ck">{FOUNDING.terms.foot}</span>
            </div>
          </div>
        </div>
      </Section>

      <Section id="money">
        <SectionHead n={MONEY.n} label={MONEY.label} title={MONEY.title} line={MONEY.line} />
        <Rail className="mtrack body-gap" vertical={860}>
          {MONEY.track.map((t) => (
            <div key={t.when} className={'reached' + ('live' in t ? ' day30' : '')}>
              <Knob live={'live' in t} />
              <span className="fig when">{t.when}</span>
              <span className="what">{t.what}</span>
              <p>{t.text}</p>
            </div>
          ))}
        </Rail>
        <div className="bx rf-h">
          <h3>{MONEY.refundTitle}</h3>
          <p>{MONEY.refundLine}</p>
        </div>
        <RefundHandoff />
      </Section>

      <Close n={MEMBERSHIP.n} label={MEMBERSHIP.label} title={MEMBERSHIP.title} line={MEMBERSHIP.line} primary={MEMBERSHIP.primary} ghost={MEMBERSHIP.ghost} />
    </div>
  );
}
