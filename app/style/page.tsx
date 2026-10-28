import type { CSSProperties, ReactNode } from 'react';
import { PageHero, Section, SectionHead, Bento, Button, Chip, type ChipTone } from '@/components/system';
import { Logo, LogoMark } from '@/components/marks/Logo';
import { FieldSelect } from '@/components/interactive/FieldSelect';
import { FieldRangeDual } from '@/components/interactive/FieldRangeDual';
import { money } from '@/lib/format';
import {
  bandSwatch,
  denseScale,
  dotSpec,
  download,
  ease,
  measure,
  quietTrace,
  radius,
  scale,
  swatch,
  tint,
  type Swatch,
} from '@/lib/brandTokens';
import { SegDemo, RailDemo, SubgridDemo, GrowBars } from './_parts/Demos';
import { MotionDemos } from './_parts/MotionDemos';
import { CodeBlock } from './_parts/CodeBlock';
import './page.css';
import {
  META,
  NEW,
  UPDATED,
  HERO,
  LOGO,
  COLOUR,
  TYPE,
  SPACE,
  LAYOUT,
  COMPONENTS,
  MOTION,
  DRAWINGS,
  DOT,
  VOICE,
  APPLICATIONS,
  DOWNLOADS,
  type ColourEntry,
  type DrawingKind,
  type Download,
  type Mark,
} from '@/content/style';

export const metadata = { title: META.title, description: META.description };

/* The brand and style guide, ported from reference/redesign/style.html.
 *
 * The guide never retypes a brand value. Every colour, contrast ratio and
 * grade, CMYK value, spacing step, radius, the ease, the page measure and
 * each download's pixel size is read at build time from the files the site
 * is built from (lib/brandTokens.ts), which throws if one goes missing. And
 * every component it shows is the real one, so it is built the way it tells
 * you to build. Copy is in content/style.ts.
 *
 * Hero: the index and a cover plate. Then twelve sections, paper and ink in
 * turn: logo, colour (ink), type, space (ink), layout, components (ink),
 * motion, drawings (ink), the dot, voice (ink), social and print, downloads
 * (ink). Colour, type, space, layout, components, drawings, the dot and
 * voice each end with the product's notes: the apps and the Command
 * Center. */

const quiet = quietTrace();
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k]));

/* ── Colour: one swatch, graded against both grounds ─────────────────── */

function resolve(e: ColourEntry): { sw?: Swatch; tints?: { value: string; pct: number }[] } {
  const src = e.src;
  if ('token' in src) return { sw: swatch(src.token) };
  if ('band' in src) return { sw: bandSwatch(src.band) };
  if ('quiet' in src) return { sw: quiet[src.quiet] };
  return { tints: src.tints.map(tint) };
}

/* A grade is shown by colour, so its verdict is also said in words. */
function Grade({ ratio, ground, bar }: { ratio: number | null; ground: string; bar: number | null }) {
  if (ratio === null || bar === null) return <span className="na">{`${ground} · ${COLOUR.na}`}</span>;
  const ok = ratio >= bar;
  return (
    <span className={ok ? 'ok' : undefined}>
      {`${ground} ${ratio.toFixed(1)}`}
      <span className="sr-only">{`, ${ok ? COLOUR.passes : COLOUR.below} ${bar}:1`}</span>
    </span>
  );
}

function SwatchCell({ e, i }: { e: ColourEntry; i: number }) {
  const { sw, tints } = resolve(e);
  const bar = e.use === 'text' ? 4.5 : e.use === 'graphic' ? 3 : null;
  const graded = sw && bar !== null;
  /* The tints are shown as laid on paper, which is how they are used. */
  const chip = tints
    ? `linear-gradient(90deg, ${tints[0].value} 50%, ${tints[1].value} 50%), ${swatch('color-paper').hex}`
    : sw!.hex;
  return (
    <div className={['sw', i % 2 ? 'r' : '', i > 1 ? 't' : ''].filter(Boolean).join(' ')}>
      <span className="chipc" style={{ background: chip }} aria-hidden="true" />
      <div className="info">
        <span className="nm">{e.name}</span>
        <span className="hx">{tints ? fill(COLOUR.tints, { a: tints[0].pct, b: tints[1].pct }) : sw!.hex}</span>
        {sw && <span className="hx">{sw.cmyk}</span>}
        <span className="rl">{e.role}</span>
        <span className="cr">
          <Grade ratio={graded ? sw!.onPaper : null} ground={COLOUR.grounds.paper} bar={bar} />
          <Grade ratio={graded ? sw!.onInk : null} ground={COLOUR.grounds.ink} bar={bar} />
        </span>
      </div>
    </div>
  );
}

/* ── The dot: every number read from its CSS ─────────────────────────── */

/* The dot's construction (app/globals.css .live-dot, .chip .chip-dot and
   @keyframes live-ping) and the colours it is drawn in. The rows, the
   copyable CSS and the drawn dots all come from here, so none of them can
   disagree with the dot on the site. */
function dotValues() {
  const d = dotSpec();
  const deep = swatch('color-signal-deep');
  const light = swatch('color-signal-light');
  const underway = swatch('color-underway');
  const num = (pct: string) => Number(pct.replace('%', '')) / 100;
  /* CSS's short form: .55, but 0 and 1 stay as they are. */
  const alpha = (pct: string) => num(pct).toString().replace(/^0\./, '.');
  const total = Number(d.ping.duration.replace('s', ''));
  const settle = (total * Number(d.ping.settlesAt.replace('%', ''))) / 100;
  const css = `.live-dot {
  position: relative;
  display: inline-block;
  width: ${d.button.size};
  height: ${d.button.size};
  border-radius: 50%;
  background: ${deep.hex};
  box-shadow: 0 0 ${d.button.glow.blur} ${d.button.glow.spread} rgb(${deep.rgb} / ${alpha(d.button.glow.strength)});
}
.live-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  animation: live-ping ${d.ping.duration} ${d.ping.easing} infinite;
}
@keyframes live-ping {
  0% { transform: scale(${num(d.ping.from.scale)}); opacity: ${alpha(d.ping.from.opacity)}; }
  ${d.ping.settlesAt}, 100% { transform: scale(${num(d.ping.to.scale)}); opacity: ${alpha(d.ping.to.opacity)}; }
}
/* ${fill(DOT.recreate.dev.onDark, { hex: light.hex })} */
@media (prefers-reduced-motion: reduce) {
  .live-dot::after { animation: none; opacity: 0; }
}`;
  /* The drawn dots take the button dot's own proportions (times --k in the
     CSS) rather than a transform, which Safari would rasterise soft. */
  const px = (v: string) => (v === '0' ? '0px' : v);
  const vars = {
    '--d-size': d.button.size,
    '--d-blur': px(d.button.glow.blur),
    '--d-spread': px(d.button.glow.spread),
    '--d-glow': d.button.glow.strength,
    '--d-dur': d.ping.duration,
    '--d-ease': d.ping.easing,
    '--d-settle': d.ping.settlesAt,
  } as CSSProperties;
  return { d, deep, light, underway, total, settle, css, vars };
}

const ratioText = (r: number) => `${r.toFixed(1)}:1`;

function BigDot({ colour, vars, still, sm }: { colour: string; vars: CSSProperties; still?: boolean; sm?: boolean }) {
  return (
    <span
      className={['bigdot', still && 'still', sm && 'sm'].filter(Boolean).join(' ')}
      style={{ ...vars, ['--dot' as string]: colour }}
    />
  );
}

/* ── Product pieces ───────────────────────────────────────────────────── */

/* A status square in its token's colour, as the band it sits on binds it. */
function Sq({ token, hex }: { token?: string; hex?: string }) {
  return <i className="sq" style={{ '--c': hex ?? `var(--${token})` } as CSSProperties} aria-hidden="true" />;
}

const NewTag = () => <span className="tag new">{NEW}</span>;

/* A tag set after a line of copy, with the space before it. */
function After({ mark }: { mark?: Mark | boolean }) {
  if (!mark) return null;
  return (
    <>
      {' '}
      <span className="tag new">{mark === 'updated' ? UPDATED : NEW}</span>
    </>
  );
}

/* ── Drawings: the drafting language, one line each ───────────────────── */

function Drawing({ kind, tag }: { kind: DrawingKind; tag: string }) {
  const svg = (children: ReactNode) => (
    <svg viewBox="0 0 200 70" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
  switch (kind) {
    case 'solid':
      return svg(
        <>
          <rect className="bx2" x="70" y="4" width="60" height="22" />
          <path className="s1" d="M100 26V40H40V48M100 40H160V48" />
          <rect className="bx2" x="14" y="48" width="52" height="18" />
          <rect className="bx2" x="134" y="48" width="52" height="18" />
        </>,
      );
    case 'dotted':
      return svg(
        <>
          <rect className="bx2" x="14" y="10" width="60" height="22" />
          <rect className="bx2 dash" x="126" y="10" width="60" height="22" />
          <path className="s2" d="M44 32V52H156V32" />
          <text className="mid" x="100" y="64">
            {tag}
          </text>
        </>,
      );
    case 'dashed':
      return svg(
        <>
          <rect x="50" y="14" width="100" height="40" className="s3" />
          <text className="mid c" x="100" y="34">
            {tag}
          </text>
        </>,
      );
    case 'dashdot':
      return svg(<rect x="10" y="8" width="180" height="54" className="s4" />);
    case 'hatch':
      return svg(
        <>
          <defs>
            <pattern id="sg-h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="ht" x1="0" y1="0" x2="0" y2="7" />
            </pattern>
          </defs>
          <rect x="10" y="8" width="180" height="54" className="s4 hatch" />
        </>,
      );
    case 'cobalt':
      return svg(
        <>
          <rect className="tl" x="66" y="10" width="68" height="50" />
          <rect className="yr" x="72" y="16" width="56" height="38" />
          <text className="yt mid c" x="100" y="35">
            {tag}
          </text>
        </>,
      );
    case 'cobaltHatch':
      return svg(
        <>
          <defs>
            <pattern id="sg-hb" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="hlb" />
            </pattern>
          </defs>
          <rect x="40" y="10" width="120" height="50" className="hb" />
        </>,
      );
    case 'label':
      return <Chip>{tag}</Chip>;
    case 'productHatch':
      return svg(
        <>
          <defs>
            <pattern id="sg-hp" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="hl" />
            </pattern>
          </defs>
          <path className="hl" d="M14 64H186" />
          <rect className="bar" x="34" y="36" width="30" height="28" />
          <rect className="bar" x="85" y="24" width="30" height="40" />
          <rect className="est" x="136" y="14" width="30" height="50" />
          <text className="mid" x="151" y="9">
            {tag}
          </text>
        </>,
      );
    case 'arrow':
      return svg(
        <>
          <rect className="bx2" x="10" y="24" width="52" height="22" />
          <rect className="bx2" x="138" y="24" width="52" height="22" />
          <path className="s1" d="M62 35H136M128 29l8 6-8 6" />
        </>,
      );
    case 'end':
      return svg(
        <>
          <path className="s1" d="M22 35H100" />
          <path className="s2" d="M100 35H176" />
          <path className="s1 end" d="M178 25V45" />
        </>,
      );
    case 'legend':
      return svg(
        <>
          {DRAWINGS.legend.map((k, i) => (
            <g key={k}>
              <rect className={`k-${k}`} x="14" y={14 + i * 17} width="9" height="9" />
              <text x="30" y={22 + i * 17}>
                {k}
              </text>
            </g>
          ))}
          <path className="hl" d="M100 62H190" />
          <path className="ln k-housing" d="M100 54L124 36L150 42L174 22L190 10" />
          <path className="ln k-land" d="M100 60L124 52L150 54L174 44L190 40" />
          <path className="ln k-shop" d="M100 46L124 50L150 30L174 34L190 26" />
        </>,
      );
  }
}

/* A file row. download() fails the build if the file is not in public/, and
   gives a PNG's real pixel width for its label. */
function Downloads({ files }: { files: readonly Download[] }) {
  return (
    <div className="dl">
      {files.map((f) => {
        const d = download(f.href);
        return (
          <a href={d.href} download key={f.href}>
            <span className="n">{f.label}</span>
            <span className="u">{f.use}</span>
            <span className="f">{d.width ? `${f.kind} ${d.width}` : f.kind}</span>
          </a>
        );
      })}
    </div>
  );
}

function Head({ who, ck, tag }: { who: string; ck?: string; tag?: { text: string; isNew?: boolean } }) {
  return (
    <div className="c-h">
      <span className="who">{who}</span>
      {ck && (
        <span className="ck">
          {ck}
          {tag && ' · '}
          {tag && <span className={tag.isNew ? 'tag new' : 'tag'}>{tag.text}</span>}
        </span>
      )}
      {!ck && tag && <span className={tag.isNew ? 'tag new' : 'tag'}>{tag.text}</span>}
    </div>
  );
}

export default function Style() {
  const spacing = scale('spacing');
  const max = measure().replace(/px$/, '');
  const rootStyle = { '--quiet-halo': quiet.halo.hex, '--quiet-core': quiet.core.hex } as CSSProperties;
  const dot = dotValues();
  const dense = denseScale();
  const isNew = { text: NEW, isNew: true };

  return (
    <div className="pg-style" style={rootStyle}>
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(7.4vw, 102px)"
        phoneSize="clamp(38px, 11vw, 60px)"
        phone="block"
        lede={HERO.lede}
        side={
          <nav className="idx" data-in aria-label={HERO.indexLabel}>
            {HERO.index.map((s) => (
              <a href={`#${s.id}`} key={s.id}>
                <b>{s.n}</b>
                {s.label}
                {s.isNew && <span className="tag new">{NEW}</span>}
              </a>
            ))}
          </nav>
        }
      >
        <div data-stage="bento">
          <Bento className="plate">
            <div className="cell">
              <Head who={HERO.plate.mark.who} ck={HERO.plate.mark.ck} />
              <div className="c-m pm">
                <LogoMark size={170} variant="outline" />
              </div>
            </div>
            <div className="cell">
              <Head who={HERO.plate.page.who} ck={HERO.plate.page.ck} />
              <div className="c-m">
                <div className="sw6">
                  {HERO.plate.page.swatches.map((s) => (
                    <div key={s.token}>
                      <i style={{ background: swatch(s.token).hex }} aria-hidden="true" />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="cell">
              <Head who={HERO.plate.faces.who} ck={HERO.plate.faces.ck} />
              <div className="c-m faces">
                <span className="d">{HERO.plate.faces.display}</span>
                <span className="t">{HERO.plate.faces.text}</span>
                <span className="m">{HERO.plate.faces.mono}</span>
              </div>
            </div>
          </Bento>
        </div>
      </PageHero>

      {/* 01 · Logo: the mark in two weights, the lockup on both grounds. */}
      <Section id="logo">
        <SectionHead n={LOGO.n} label={LOGO.label} title={LOGO.title} line={LOGO.line} />
        <Bento className="g2 body-gap">
          <div className="cell">
            <Head who={LOGO.outline.who} ck={LOGO.outline.ck} />
            <div className="c-m lg-big">
              <LogoMark size={220} variant="outline" />
            </div>
          </div>
          <div className="cell">
            <Head who={LOGO.solid.who} ck={LOGO.solid.ck} />
            <div className="c-m">
              <div className="lg-sizes">
                {LOGO.solid.sizes.map((s) => (
                  <figure key={s.px}>
                    <LogoMark size={s.px} variant="solid" />
                    <figcaption>{s.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
          <div className="full lg-on">
            <div>
              <Logo size={56} />
            </div>
            <div className="ink">
              <Logo size={56} />
            </div>
          </div>
        </Bento>
        <Bento className="rows">
          {LOGO.rules.map((r) => (
            <div key={r.k}>
              <span className="k">{r.k}</span>
              <span className="v">{r.v}</span>
              <span className="d">{r.d}</span>
            </div>
          ))}
        </Bento>
        <Bento>
          <Head who={LOGO.never.who} ck={LOGO.never.ck} />
          <ul className="rules no g2">
            {LOGO.never.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Bento>
      </Section>

      {/* 02 · Colour, on ink: every swatch graded against both grounds. */}
      <Section ink id="colour">
        <SectionHead n={COLOUR.n} label={COLOUR.label} title={COLOUR.title} line={COLOUR.line} />
        <Bento className="swg body-gap">
          {COLOUR.groups.map((g) => [
            <div className="swh" key={g.title}>
              {g.title}
            </div>,
            ...g.entries.map((e, i) => <SwatchCell e={e} i={i} key={e.name} />),
          ])}
        </Bento>
        <Bento className="once">
          {(['good', 'bad'] as const).map((side) => (
            <div className={side} key={side}>
              <span className="verdict">{COLOUR.once[side].verdict}</span>
              <div className="mini-led">
                {COLOUR.once.rows.map((r) => (
                  <div key={r.k}>
                    <span>{r.k}</span>
                    <b className={side === 'good' && r.live ? 'live' : undefined}>{money(r.v)}</b>
                  </div>
                ))}
              </div>
              <p className="use">{COLOUR.once[side].use}</p>
            </div>
          ))}
          <div className="full">
            <div className="quiet">
              <i className="lit" aria-hidden="true" />
              <span>{COLOUR.once.live}</span>
              <i className="faded" aria-hidden="true" />
              <span>{COLOUR.once.quiet}</span>
              <span className="tag new">{NEW}</span>
            </div>
          </div>
        </Bento>
        <Bento>
          <Head who={COLOUR.product.who} tag={isNew} />
          <div className="rows">
            {COLOUR.product.rows.map((r) => (
              <div key={r.k}>
                <span className="k">
                  {r.token && <Sq token={r.token} />}
                  {r.k}
                </span>
                <span className="v">{r.v}</span>
                <span className="d">
                  {r.d}
                  <After mark={r.isNew} />
                </span>
              </div>
            ))}
          </div>
        </Bento>
      </Section>

      {/* 03 · Type: three faces on subgrid, then the scale. */}
      <Section id="type">
        <SectionHead n={TYPE.n} label={TYPE.label} title={TYPE.title} line={TYPE.line} />
        <Bento className="g3 sub body-gap">
          {TYPE.faces.map((f) => (
            <div className="cell face" key={f.family}>
              <Head who={f.family} ck={f.job} />
              <div className={`spec ${f.kind[0]}`}>
                {f.sample.length > 1 ? f.sample.map((s) => <span key={s}>{s}</span>) : f.sample[0]}
              </div>
              <div className="c-m">
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </Bento>
        <Bento className="scale">
          {TYPE.scale.map((t) => (
            <div key={t.key}>
              <span className="n">{t.n}</span>
              <span className="s">{t.s}</span>
              <span className={t.key === 'figure' ? 'x fig' : t.key === 'label' ? 'x label' : 'x'} data-k={t.key}>
                {t.x}
              </span>
            </div>
          ))}
        </Bento>
        <Bento>
          <Head who={TYPE.product.who} ck={TYPE.product.ck} tag={isNew} />
          <div className="scale">
            {TYPE.product.scale.map((t) => (
              <div key={t.key}>
                <span className="n">{t.n}</span>
                <span className="s">
                  {t.s}
                  <After mark={t.isNew} />
                </span>
                <span className="x" data-k={t.key}>
                  {t.x}
                </span>
              </div>
            ))}
          </div>
          <div className="c-f">
            <span className="ck">
              {TYPE.product.foot} <NewTag />
            </span>
          </div>
        </Bento>
      </Section>

      {/* 04 · Space and shape, on ink. */}
      <Section ink id="space">
        <SectionHead n={SPACE.n} label={SPACE.label} title={SPACE.title} line={SPACE.line} />
        <Bento className="g2 body-gap">
          <div className="cell">
            <Head who={SPACE.scale.who} ck={SPACE.scale.ck} />
            <GrowBars>
              {spacing.map((s) => (
                <div key={s.token}>
                  <span className="t">{s.token}</span>
                  <span className="px">{s.value}</span>
                  <span className="bar" style={{ width: s.value }} aria-hidden="true" />
                </div>
              ))}
            </GrowBars>
          </div>
          <div className="cell">
            <Head who={SPACE.corners.who} ck={SPACE.corners.ck} />
            <div className="corners">
              {SPACE.corners.items.map((c) => (
                <div key={c.radius}>
                  <span className={c.radius === 'pill' ? 'shape pill' : c.radius === 'device' ? 'shape dev' : 'shape'} aria-hidden="true" />
                  <b>{c.showValue ? `${c.name}, ${radius(c.radius)}` : c.name}</b>
                  <p>
                    {c.body}
                    {c.updated && (
                      <>
                        {' '}
                        <span className="tag new">{UPDATED}</span>
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Bento>
        <Bento className="meet">
          {(['good', 'bad'] as const).map((side) => (
            <div className={side} key={side}>
              <span className="verdict">{SPACE.meet[side].verdict}</span>
              <div className="demo" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <p>{SPACE.meet[side].body}</p>
            </div>
          ))}
          <div className="full">
            {SPACE.meet.note} <span className="tag new">{SPACE.meet.tag}</span>
          </div>
        </Bento>
        <Bento className="g2 rows3">
          <div className="cell">
            <Head who={SPACE.dense.who} ck={SPACE.dense.ck} tag={isNew} />
            <GrowBars>
              {dense.map((s) => (
                <div key={s.token}>
                  <span className="t">{s.token}</span>
                  <span className="px">{s.value}</span>
                  <span className="bar" style={{ width: s.value }} aria-hidden="true" />
                </div>
              ))}
            </GrowBars>
            <div className="c-f">
              <span className="ck">{SPACE.dense.foot}</span>
            </div>
          </div>
          <div className="cell">
            <Head who={SPACE.heights.who} ck={SPACE.heights.ck} tag={isNew} />
            <div className="c-m">
              <ul className="factsd">
                {SPACE.heights.rows.map((r) => (
                  <li key={r.k}>
                    <span>{r.k}</span>
                    <span>{r.v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="c-f">
              <span className="ck">{SPACE.heights.foot}</span>
            </div>
          </div>
        </Bento>
      </Section>

      {/* 05 · Layout: the four ways every section is built. */}
      <Section id="layout">
        <SectionHead n={LAYOUT.n} label={LAYOUT.label} title={LAYOUT.title} line={LAYOUT.line} />
        <Bento className="g2 body-gap">
          <div className="cell">
            <Head who={LAYOUT.head.who} ck={LAYOUT.head.ck} />
            <div className="c-m">
              <div className="anat-head" aria-hidden="true">
                <div className="lr">
                  <b>{LAYOUT.head.demo.n}</b>
                  {LAYOUT.head.demo.label}
                  <span className="call">{LAYOUT.head.demo.rule}</span>
                </div>
                <div className="hrow">
                  <span className="hl">{LAYOUT.head.demo.title}</span>
                  <span className="as">{LAYOUT.head.demo.aside}</span>
                </div>
                <div className="cols">
                  {LAYOUT.head.demo.cols.map((c) => (
                    <span className="call" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <p>{LAYOUT.head.body}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={LAYOUT.cell.who} ck={LAYOUT.cell.ck} />
            <div className="c-m">
              <div className="anat-cell" aria-hidden="true">
                <div className="h">
                  <span className="who">{LAYOUT.cell.demo.who}</span>
                  <span className="call">{LAYOUT.cell.demo.header}</span>
                </div>
                <div className="m">
                  <span className="call">{LAYOUT.cell.demo.main}</span>
                  <i style={{ width: '70%' }} />
                  <i style={{ width: '90%' }} />
                  <i style={{ width: '50%' }} />
                </div>
                <div className="f">
                  <span className="ck">{LAYOUT.cell.demo.foot}</span>
                  <span className="call">{LAYOUT.cell.demo.footer}</span>
                </div>
              </div>
              <p>{LAYOUT.cell.body}</p>
            </div>
          </div>
          <SubgridDemo who={LAYOUT.subgrid.who} seg={LAYOUT.subgrid.seg} cols={LAYOUT.subgrid.cols}>
            <p>
              {LAYOUT.subgrid.body.before}
              <span className="code">{LAYOUT.subgrid.body.code}</span>
              {LAYOUT.subgrid.body.after}
            </p>
          </SubgridDemo>
        </Bento>
        <Bento className="g2">
          <div className="cell">
            <Head who={LAYOUT.bands.who} ck={LAYOUT.bands.ck} />
            <div className="c-m">
              <div className="bands" aria-hidden="true">
                {LAYOUT.bands.rows.map((b) => (
                  <i className={b.ink ? 'band-ink' : undefined} key={b.label}>
                    {b.label}
                  </i>
                ))}
              </div>
              <p>{LAYOUT.bands.body}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={LAYOUT.widths.who} ck={LAYOUT.widths.ck} />
            <div className="c-m">
              <ul className="factsd">
                {LAYOUT.widths.rows.map((r) => (
                  <li key={r.k}>
                    <span>
                      {r.k}
                      <After mark={r.isNew} />
                    </span>
                    <span>{fill(r.v, { max })}</span>
                  </li>
                ))}
              </ul>
              <p>{LAYOUT.widths.body}</p>
            </div>
          </div>
        </Bento>
        <Bento className="g2">
          <div className="cell">
            <Head who={LAYOUT.page.who} ck={LAYOUT.page.ck} tag={isNew} />
            <div className="c-m">
              <div className="pga" aria-hidden="true">
                <div>
                  <span className="ctx">
                    <i />
                    {LAYOUT.page.context}
                  </span>
                  <em className="cl">{LAYOUT.page.calls.context}</em>
                </div>
                <div>
                  <span className="brief">
                    {LAYOUT.page.brief.before}
                    <u>{LAYOUT.page.brief.link}</u>
                    {LAYOUT.page.brief.after}
                  </span>
                  <em className="cl">{LAYOUT.page.calls.brief}</em>
                </div>
                <div>
                  <span className="vit">
                    {LAYOUT.page.vitals.map((v) => (
                      <span key={v.k}>
                        <small>{v.k}</small>
                        <b>{v.v}</b>
                        <i style={{ '--w': `${v.w}%` } as CSSProperties} />
                      </span>
                    ))}
                  </span>
                  <em className="cl">{LAYOUT.page.calls.vitals}</em>
                </div>
                <div>
                  <span className="tabs">
                    {LAYOUT.page.tabs.map((t, i) => (
                      <span className={i === 0 ? 'on' : undefined} key={t}>
                        {t}
                      </span>
                    ))}
                  </span>
                  <em className="cl">{LAYOUT.page.calls.tabs}</em>
                </div>
              </div>
              <p>{LAYOUT.page.body}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={LAYOUT.list.who} ck={LAYOUT.list.ck} tag={isNew} />
            <div className="c-m">
              <div className="lsd" aria-hidden="true">
                <div className="lh">
                  {LAYOUT.list.cols.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                {LAYOUT.list.bands.map((b) => [
                  <div className="lb" key={b.day}>
                    <span>{b.day}</span>
                    <span>{b.rows.length}</span>
                  </div>,
                  ...b.rows.map((r) => (
                    <div className="lr" key={r.name}>
                      <span>
                        <b>{r.name}</b>
                        <small>{r.sub}</small>
                      </span>
                      <span className="stat">
                        <Sq token={r.status} />
                        {r.word}
                      </span>
                    </div>
                  )),
                ])}
                <div className="lx hatch" />
                <div className="lf">
                  <span>{LAYOUT.list.foot.count}</span>
                  <b>{LAYOUT.list.foot.link}</b>
                </div>
              </div>
              <p>{LAYOUT.list.body}</p>
            </div>
          </div>
        </Bento>
        <Bento>
          <Head who={LAYOUT.listRules.who} tag={isNew} />
          <ul className="rules g2">
            {LAYOUT.listRules.items.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Bento>
      </Section>

      {/* 06 · Components, on ink: working, not pictures of them. */}
      <Section ink id="components">
        <SectionHead n={COMPONENTS.n} label={COMPONENTS.label} title={COMPONENTS.title} line={COMPONENTS.line} />
        <Bento className="g3 body-gap cmp-c">
          <div className="cell">
            <Head who={COMPONENTS.buttons.who} tag={{ text: COMPONENTS.pill }} />
            <div className="c-m">
              <div className="stg">
                <Button href={COMPONENTS.buttons.primary.href} live>
                  {COMPONENTS.buttons.primary.label}
                </Button>
                <Button href={COMPONENTS.buttons.ghost.href} variant="ghost">
                  {COMPONENTS.buttons.ghost.label}
                </Button>
              </div>
              <p className="use">{COMPONENTS.buttons.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.chips.who} tag={{ text: COMPONENTS.pill }} />
            <div className="c-m">
              <div className="stg">
                {COMPONENTS.chips.items.map((c) => (
                  <Chip tone={c.tone as ChipTone} key={c.label}>
                    {c.label}
                  </Chip>
                ))}
                <span className="stat">
                  <Sq token={COMPONENTS.chips.stat.token} />
                  {COMPONENTS.chips.stat.label}
                </span>
              </div>
              <p className="use">
                {COMPONENTS.chips.use} <span className="tag new">{UPDATED}</span>
              </p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.seg.who} tag={{ text: NEW, isNew: true }} />
            <div className="c-m">
              <div className="stg">
                <SegDemo label={COMPONENTS.seg.label} options={COMPONENTS.seg.options} />
              </div>
              <p className="use">{COMPONENTS.seg.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.select.who} tag={{ text: NEW, isNew: true }} />
            <div className="c-m">
              <div className="stg">
                <FieldSelect
                  name={COMPONENTS.select.name}
                  label={COMPONENTS.select.label}
                  placeholder={COMPONENTS.select.placeholder}
                  options={[...COMPONENTS.select.options]}
                />
              </div>
              <p className="use">{COMPONENTS.select.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.range.who} tag={{ text: NEW, isNew: true }} />
            <div className="c-m">
              <div className="stg">
                <FieldRangeDual
                  nameMin="ticketLow"
                  nameMax="ticketHigh"
                  label={COMPONENTS.range.label}
                  lowWord={COMPONENTS.range.lowWord}
                  highWord={COMPONENTS.range.highWord}
                  min={COMPONENTS.range.min}
                  max={COMPONENTS.range.max}
                  step={COMPONENTS.range.step}
                  startLow={COMPONENTS.range.startLow}
                  startHigh={COMPONENTS.range.startHigh}
                  format="usd"
                  topLabel={`${money(COMPONENTS.range.max, 0)}+`}
                />
              </div>
              <p className="use">{COMPONENTS.range.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.rail.who} tag={{ text: NEW, isNew: true }} />
            <div className="c-m">
              <div className="stg">
                <RailDemo steps={COMPONENTS.rail.steps} />
              </div>
              <p className="use">{COMPONENTS.rail.use}</p>
            </div>
          </div>
        </Bento>
        <Bento className="g2">
          <div className="cell">
            <Head who={COMPONENTS.facts.who} ck={COMPONENTS.facts.ck} />
            <div className="c-m">
              <ul className="facts figs">
                {COMPONENTS.facts.rows.map((r) => (
                  <li key={r.k}>
                    <span>{r.k}</span>
                    <span className={r.live ? 'live' : undefined}>{r.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.ledger.who} ck={COMPONENTS.ledger.ck} />
            <div className="c-m">
              <div className="mini-led">
                {COMPONENTS.ledger.rows.map((r) => (
                  <div key={r.k}>
                    <span>{r.k}</span>
                    <b>{r.v}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Bento>
        <Bento className="g3 cmp-c">
          <div className="cell">
            <Head who={COMPONENTS.leaf.who} tag={isNew} />
            <div className="c-m">
              <div className="stg">
                <div className="leafs pw">
                  {COMPONENTS.leaf.items.map((l) => (
                    <div className="lfr" key={l.title}>
                      {l.date ? (
                        <span className="leaf">
                          <small>{l.day}</small>
                          <b>{l.date}</b>
                          <small>{l.month}</small>
                        </span>
                      ) : (
                        <span className="leaf tie" aria-hidden="true" />
                      )}
                      <span className="lt">
                        <b>{l.title}</b>
                        <small>{l.sub}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="use">{COMPONENTS.leaf.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.panel.who} tag={isNew} />
            <div className="c-m">
              <div className="stg">
                <div className="pnd pw" aria-hidden="true">
                  <div className="pm">
                    {[80, 60, 70, 45].map((w) => (
                      <i style={{ width: `${w}%` }} key={w} />
                    ))}
                  </div>
                  <div className="pp">
                    <div className="ph">
                      <span className="lab">{COMPONENTS.panel.title}</span>
                      <span className="lab">{COMPONENTS.panel.close}</span>
                    </div>
                    <div className="pb">
                      {[85, 60, 70].map((w) => (
                        <i style={{ width: `${w}%` }} key={w} />
                      ))}
                    </div>
                    <div className="pf">
                      <span className="pbtn">{COMPONENTS.panel.actions.secondary}</span>
                      <span className="pbtn s">{COMPONENTS.panel.actions.main}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="use">{COMPONENTS.panel.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.toast.who} tag={isNew} />
            <div className="c-m">
              <div className="stg">
                {/* The toast is drawn light on the band, so its square takes
                    underway's paper value, not the band's. */}
                <div className="tst pw">
                  <Sq hex={swatch('color-underway').hex} />
                  <span>
                    <b>{COMPONENTS.toast.lead}</b>
                    {COMPONENTS.toast.rest}
                  </span>
                </div>
              </div>
              <p className="use">{COMPONENTS.toast.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.masked.who} tag={isNew} />
            <div className="c-m">
              <div className="stg">
                <div className="mkd pw">
                  <div className="mini-led">
                    {COMPONENTS.masked.rows.map((r) => (
                      <div key={r.k}>
                        <span>{r.k}</span>
                        <b>{r.v}</b>
                      </div>
                    ))}
                  </div>
                  <div className="rv">
                    <span>{COMPONENTS.masked.reason}</span>
                    <span className="pbtn">{COMPONENTS.masked.reveal}</span>
                  </div>
                </div>
              </div>
              <p className="use">{COMPONENTS.masked.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.twoPerson.who} tag={isNew} />
            <div className="c-m">
              <div className="stg">
                <div className="tpr pw">
                  {COMPONENTS.twoPerson.steps.map((st) => (
                    <div className={st.hatch ? 'hatch' : st.off ? 'off' : undefined} key={st.label}>
                      <b>
                        <Sq token={st.token} />
                        {st.label}
                      </b>
                      <small>{st.by}</small>
                    </div>
                  ))}
                </div>
              </div>
              <p className="use">{COMPONENTS.twoPerson.use}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={COMPONENTS.access.who} tag={isNew} />
            <div className="c-m">
              <div className="stg">
                {/* Each level fills one more of four squares. */}
                <div className="lvl pw">
                  {COMPONENTS.access.levels.map((l, i) => (
                    <span key={l}>
                      <span className="q" aria-hidden="true">
                        {[0, 1, 2, 3].map((q) => (
                          <i className={q < i ? 'f' : undefined} key={q} />
                        ))}
                      </span>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <p className="use">{COMPONENTS.access.use}</p>
            </div>
          </div>
        </Bento>
        <Bento>
          <Head who={COMPONENTS.trust.who} ck={COMPONENTS.trust.ck} tag={isNew} />
          <ul className="rules g2">
            {COMPONENTS.trust.items.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Bento>
      </Section>

      {/* 07 · Motion: the four moves, working, then the rules. */}
      <Section id="motion">
        <SectionHead n={MOTION.n} label={MOTION.label} title={MOTION.title} line={MOTION.line} />
        <MotionDemos m={MOTION} />
        <Bento>
          <Head who={MOTION.rules.who} ck={MOTION.rules.ck} />
          <ul className="rules">
            <li>{MOTION.rules.first}</li>
            <li>
              {MOTION.rules.ease.before}
              <span className="code">{ease()}</span>
              {MOTION.rules.ease.after}
            </li>
            {MOTION.rules.rest.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Bento>
      </Section>

      {/* 08 · Drawings, on ink: one line, one meaning. */}
      <Section ink id="drawings">
        <SectionHead n={DRAWINGS.n} label={DRAWINGS.label} title={DRAWINGS.title} line={DRAWINGS.line} />
        <Bento className="g4 body-gap dwk">
          {DRAWINGS.items.map((d) => (
            <div className="cell" key={d.kind}>
              <Head who={d.who} ck={d.ck} />
              <div className="c-m">
                <div className="stg">
                  <Drawing kind={d.kind} tag={d.tag} />
                </div>
                <p>
                  {d.body}
                  <After mark={'mark' in d ? d.mark : undefined} />
                </p>
              </div>
            </div>
          ))}
        </Bento>
      </Section>

      {/* 09 · The dot: pulsing when open, still when a status. Drawn large,
          measured, and how to rebuild it. */}
      <Section id="dot">
        <SectionHead n={DOT.n} label={DOT.label} title={DOT.title} line={DOT.line} />
        <Bento className="g2 body-gap dotd">
          <div className="cell">
            <Head who={DOT.pulsing.who} ck={DOT.pulsing.ck} />
            <div className="dstage" aria-hidden="true">
              <BigDot colour={dot.deep.hex} vars={dot.vars} />
            </div>
            <div className="c-m">
              <div className="stg">
                <Button href={DOT.pulsing.button.href} live>
                  {DOT.pulsing.button.label}
                </Button>
                <Chip tone="live">{DOT.pulsing.chip}</Chip>
              </div>
              <p>{DOT.pulsing.body}</p>
            </div>
          </div>
          <div className="cell">
            <Head who={DOT.still.who} ck={DOT.still.ck} />
            <div className="dstage" aria-hidden="true">
              <BigDot colour={dot.underway.hex} vars={dot.vars} still />
            </div>
            <div className="c-m">
              <div className="stg">
                {DOT.still.chips.map((c) => (
                  <Chip tone={c.tone as ChipTone} key={c.label}>
                    {c.label}
                  </Chip>
                ))}
              </div>
              <p>
                {DOT.still.body} <span className="tag new">{UPDATED}</span>
              </p>
            </div>
          </div>
        </Bento>
        <Bento className="g2">
          <div className="cell">
            <Head who={DOT.anatomy.who} ck={DOT.anatomy.ck} />
            <div className="anat3">
              {DOT.anatomy.rows.map((r) => {
                const { d } = dot;
                const inPill = (v: string) => fill(DOT.anatomy.inPill, { v });
                const value = {
                  Core: `${d.button.size} · ${inPill(d.chip.size)}`,
                  Glow: `${d.button.glow.blur} blur · ${d.button.glow.strength}`,
                  Ping: `${d.ping.to.scale} · ${d.ping.duration}`,
                  Gap: `${d.button.gap} · ${inPill(d.chip.gap)}`,
                }[r.k];
                return (
                  <div key={r.k}>
                    <b>{r.k}</b>
                    <em>{value}</em>
                    <span>
                      {r.v}
                      {'pill' in r && ` ${fill(r.pill, { blur: d.chip.glow.blur, strength: d.chip.glow.strength })}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="cell">
            <Head who={DOT.colour.who} ck={DOT.colour.ck} />
            <div className="anat3 col3">
              {DOT.colourRules.map((c) => {
                const sw = c.token === 'color-signal-deep' ? dot.deep : dot.light;
                return (
                  <div key={c.token}>
                    <b>
                      <i className="dsw" style={{ background: sw.hex }} aria-hidden="true" />
                      {c.where}
                    </b>
                    <em>{sw.hex}</em>
                    <span>
                      <code>{`--${c.token}`}</code> · {ratioText(c.ground === 'paper' ? sw.onPaper : sw.onInk)} {c.on}
                    </span>
                  </div>
                );
              })}
              <div>
                <b>
                  <i className="dsw pill" aria-hidden="true" />
                  {DOT.pillRule.where}
                </b>
                <em>{DOT.pillRule.value}</em>
                <span>{DOT.pillRule.rule}</span>
              </div>
            </div>
          </div>
        </Bento>
        <Bento className="g2 recreate">
          <div className="cell">
            <Head who={DOT.recreate.dev.who} ck={DOT.recreate.dev.ck} />
            <CodeBlock code={dot.css} language={DOT.recreate.dev.lang} copy={DOT.recreate.copy} />
            <div className="c-f">
              <span className="ck">{DOT.recreate.dev.foot}</span>
            </div>
          </div>
          <div className="cell">
            <Head who={DOT.recreate.design.who} ck={DOT.recreate.design.ck} />
            <div className="ptime" aria-hidden="true" style={dot.vars}>
              <BigDot colour={dot.deep.hex} vars={dot.vars} sm />
              <div className="track">
                <i className="grow" />
                <i className="hold" />
                <b className="head" />
                <span className="t0">0s</span>
                <span className="t1">{`${dot.settle}s`}</span>
                <span className="t2">{`${dot.total}s`}</span>
              </div>
            </div>
            <div className="anat3 keys">
              {DOT.recreate.design.rows.map((r) => {
                const { d } = dot;
                const v = {
                  size: d.button.size,
                  blur: d.button.glow.blur,
                  spread: d.button.glow.spread,
                  strength: d.button.glow.strength,
                  fromScale: d.ping.from.scale,
                  fromOpacity: d.ping.from.opacity,
                  toScale: d.ping.to.scale,
                  toOpacity: d.ping.to.opacity,
                  settle: dot.settle,
                  total: dot.total,
                };
                return (
                  <div key={r.k}>
                    <b>{fill(r.k, v)}</b>
                    <em>{fill(r.v, v)}</em>
                    <span>{fill(r.d, v)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Bento>
        <Bento>
          <div className="cell">
            <Head who={DOT.rules.who} />
            <ul className="rules g2">
              {DOT.rules.items.map((r) => (
                <li key={r}>{r}</li>
              ))}
              {DOT.rules.added.map((r) => (
                <li key={r}>
                  {r} <NewTag />
                </li>
              ))}
            </ul>
          </div>
        </Bento>
      </Section>

      {/* 10 · Voice, on ink: say, not. */}
      <Section ink id="voice">
        <SectionHead n={VOICE.n} label={VOICE.label} title={VOICE.title} line={VOICE.line} />
        <Bento className="dd body-gap">
          <div className="hd" aria-hidden="true">
            <span>{VOICE.head.rule}</span>
            <span>{VOICE.head.say}</span>
            <span>{VOICE.head.not}</span>
          </div>
          {VOICE.pairs.map((p) => (
            <div key={p.k}>
              <span className="k">
                {p.k}
                {p.isNew && <span className="tag new">{NEW}</span>}
              </span>
              <span className="y">
                <span className="sr-only">{`${VOICE.head.say}: `}</span>
                {p.y}
              </span>
              <span className="n">
                <span className="sr-only">{`${VOICE.head.not}: `}</span>
                {p.n}
              </span>
            </div>
          ))}
        </Bento>
        <Bento className="rows">
          {VOICE.rows.map((r) => (
            <div key={r.k}>
              <span className="k">
                {r.k}
                <After mark={r.isNew} />
              </span>
              <span className="v">{r.v}</span>
              <span className="d">{r.d}</span>
            </div>
          ))}
        </Bento>
      </Section>

      {/* 11 · Social and print. */}
      <Section id="applications">
        <SectionHead n={APPLICATIONS.n} label={APPLICATIONS.label} title={APPLICATIONS.title} line={APPLICATIONS.line} />
        <Bento className="body-gap">
          <Head who={APPLICATIONS.canvases.who} ck={APPLICATIONS.canvases.ck} />
          <div className="fmt">
            {APPLICATIONS.canvases.items.map((c) => (
              <figure key={c.label}>
                <i style={{ width: c.box[0], height: c.box[1] }} aria-hidden="true" />
                <figcaption>
                  <b>{`${c.w} × ${c.h}`}</b>
                  {c.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </Bento>
        <Bento className="g2">
          <div className="cell">
            <Head who={APPLICATIONS.social.who} />
            <ul className="rules">
              {APPLICATIONS.social.items.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="cell">
            <Head who={APPLICATIONS.print.who} ck={APPLICATIONS.print.ck} />
            <ul className="rules">
              {APPLICATIONS.print.items.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </Bento>
      </Section>

      {/* 12 · Downloads, on ink: the real files in public/. */}
      <Section ink id="downloads">
        <SectionHead n={DOWNLOADS.n} label={DOWNLOADS.label} title={DOWNLOADS.title} line={DOWNLOADS.line} />
        <Bento className="g2 body-gap">
          <div className="cell">
            <Head who={DOWNLOADS.lockup.who} ck={DOWNLOADS.lockup.ck} />
            <Downloads files={DOWNLOADS.lockup.files} />
          </div>
          <div className="cell">
            <Head who={DOWNLOADS.mark.who} />
            <Downloads files={DOWNLOADS.mark.files} />
          </div>
        </Bento>
      </Section>
    </div>
  );
}
