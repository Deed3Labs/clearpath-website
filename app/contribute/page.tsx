import Link from 'next/link';
import { PageHero, Section, SectionHead, Bento, Cell, Fig, Knob, Rail, Button, More } from '@/components/system';
import { money, int } from '@/lib/format';
import { HeroBeat } from './_parts/HeroBeat';
import { HeldStrip } from './_parts/HeldStrip';
import './page.css';
import {
  META,
  PROPERTY_VALUE,
  HERO,
  OFFER,
  HOW,
  DOWNSIDES,
  DOWNSIDES_SECTION,
  WHO,
  HELD,
} from '@/content/contribute';

export const metadata = { title: META.title, description: META.description };

/* Contribute land, ported from reference/redesign/contribute.html.
 *
 * Hero on three set lines, then the offer: one property sold against the same
 * property contributed. 01 is four §721 steps on one rule, on ink; 02 the
 * downsides as a ruled list; 03 three people; 04, on ink, seven years of
 * months against seven. */

/* Step 02's two figures come from the worked example. */
const rowValue = (v: string) => (v === 'value' ? money(PROPERTY_VALUE, 0) : v === 'shares' ? int(PROPERTY_VALUE) : v);

export default function Contribute() {
  return (
    <div className="pg-contribute">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(8.4vw, 116px)"
        phoneSize="clamp(30px, 8.6vw, 58px)"
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
        facts={HERO.facts}
        figs
      >
        <div data-stage="bento">
        <Bento className="offer">
          <Cell className="sell" head={<><span className="who">{OFFER.sell.who}</span><span className="ck">{OFFER.sell.ck}</span></>}>
            <div className="prop">
              <div className="prop-top">
                <span>{OFFER.propLabel}</span>
                <Fig>{money(PROPERTY_VALUE, 0)}</Fig>
              </div>
              <div className="vbar" aria-hidden="true">
                <span className="keep">{OFFER.sell.keep}</span>
                <span className="tax">{OFFER.sell.tax}</span>
              </div>
              <div className="vleg">
                <span><i className="k" />{OFFER.sell.legend.keep}</span>
                <span><i className="t" />{OFFER.sell.legend.tax}</span>
              </div>
            </div>
            <span className="big">{OFFER.sell.big}</span>
            <p>{OFFER.sell.body}</p>
          </Cell>
          <Cell className="give" head={<><span className="who">{OFFER.give.who}</span><span className="ck">{OFFER.give.ck}</span></>}>
            <div className="prop">
              <div className="prop-top">
                <span>{OFFER.propLabel}</span>
                <Fig>{`${int(PROPERTY_VALUE)} ${OFFER.give.unit}`}</Fig>
              </div>
              <div className="vbar" aria-hidden="true">
                <span className="shares">{OFFER.give.bar}</span>
              </div>
              <div className="vleg">
                <span><i className="s" />{OFFER.give.legend}</span>
              </div>
            </div>
            <span className="big">{OFFER.give.big}</span>
            <p>{OFFER.give.body}</p>
          </Cell>
          <p className="offer-f">{OFFER.note}</p>
        </Bento>
        </div>
        <HeroBeat beats={[{ sel: '.offer .vbar span', from: { scaleX: 0, duration: 1, stagger: 0.15, ease: 'power3.inOut' }, at: '-=.4' }]} />
      </PageHero>

      {/* 01 · Four steps on one rule. Each step's three values arrive as the
          rule reaches its knob; the markup has every step reached. */}
      <Section ink id="how">
        <SectionHead n={HOW.n} label={HOW.label} title={HOW.title} line={HOW.line} />
        <Rail className="steps4 body-gap" vertical={640} end="bottom 70%">
          {HOW.steps.map((s) => (
            <div className="stp4 reached" key={s.n}>
              <div className="c-h">
                <Knob />
                <span className="who">{s.n}</span>
                <span className="meta">{s.meta}</span>
              </div>
              <h3>{s.title}</h3>
              <div className="c-m">
                <p>{s.body}</p>
              </div>
              <div className="vis">
                {s.rows.map((r) => (
                  <div className="mini-row" key={r.k}>
                    <span>{r.k}</span>
                    <b className={'live' in r && r.live ? 'live' : undefined}>{rowValue(r.v)}</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Rail>
        <Bento className="steps4-f">{HOW.foot}</Bento>
      </Section>

      {/* 02 · The downsides, as a ruled list. */}
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
            {DOWNSIDES.map((d, i) => (
              <li key={d.k}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <em>{d.k}</em>
                <span>{d.v}</span>
              </li>
            ))}
          </ol>
          <div className="c-f">{DOWNSIDES_SECTION.foot}</div>
        </Bento>
      </Section>

      {/* 03 · Who this is for. Three cells on subgrid rows, so the three
          headlines and paragraphs start on the same lines. */}
      <Section id="who" className="sec-who">
        <SectionHead n={WHO.n} label={WHO.label} title={WHO.title} line={WHO.line} />
        <Bento className="who3 body-gap">
          {WHO.columns.map((c) => (
            <div className="cell" key={c.n}>
              <div className="c-h">
                <span className="who">{c.who}</span>
                <span className="ck">{c.n}</span>
              </div>
              <div className="line2">{c.line}</div>
              <div className="c-m">
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </Bento>
        <Bento className="who3-f">
          <span>{WHO.foot}</span>
          <More href={WHO.more.href}>{WHO.more.label}</More>
        </Bento>
      </Section>

      {/* 04 · Held: two cells, then seven years of months against seven. */}
      <Section ink id="held">
        <SectionHead n={HELD.n} label={HELD.label} title={HELD.title} line={HELD.line} />
        <Bento className="held body-gap">
          <Cell head={<><span className="who">{HELD.why.who}</span><span className="ck">{HELD.why.ck}</span></>}>
            <p>{HELD.why.body}</p>
          </Cell>
          <Cell className="win" head={<><span className="who">{HELD.win.who}</span><span className="ck">{HELD.win.ck}</span></>}>
            <Fig className="yrs">{HELD.win.figure}</Fig>
          </Cell>
          <HeldStrip />
          <div className="held-f">
            <p>
              {HELD.foot.before}
              <Link href={HELD.foot.link.href}>{HELD.foot.link.label}</Link>
              {HELD.foot.after}
            </p>
            <Button href={HELD.cta.href} live>
              {HELD.cta.label}
            </Button>
          </div>
        </Bento>
      </Section>
    </div>
  );
}
