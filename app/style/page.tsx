import { Chip, Ledger, Note, TextLink } from '@/components/primitives';
import { Button } from '@/components/primitives/Button';
import { Logo, LogoMark } from '@/components/marks/Logo';
import { CodeBlock } from '@/components/interactive/CodeBlock';
import { dotSpec, inkSwatch, scale, swatch } from '@/lib/brandTokens';
import {
  APPLICATIONS,
  COLOUR,
  COMPONENTS,
  DOT,
  DOWNLOADS,
  LOGO,
  OPENING,
  SECTIONS,
  SPACE,
  TYPE,
  VOICE,
} from '@/content/style';

export const metadata = {
  title: 'Brand and style guide',
  description:
    'The Clear logo, colour, type, spacing, components and voice, with downloadable assets — the reference for sites, apps, print and social.',
};

/* The brand and style guide.
 *
 * Every colour, spacing and radius value is read from lib/tokens.css at build
 * time (lib/brandTokens.ts), and every component is the real one, so this page
 * cannot quietly disagree with the site it documents. Copy is in
 * content/style.ts.
 *
 * Rhythm: statement and contents -> the mark on paper and on ink -> a palette
 * -> three specimens and a scale -> space -> live components on ink -> do and
 * don't -> two ledgers -> files. */

const ratio = (n: number) => `${n.toFixed(1)}:1`;

/* Graded only when a bar applies. A hairline rule is decorative and has no
   requirement, so it shows its ratio plainly rather than a false "fail". */
function Rating({ n, bar }: { n: number; bar: number | null }) {
  if (bar === null) return <span>{ratio(n)} · decorative</span>;
  const ok = n >= bar;
  return (
    <span className={ok ? 'sg-pass' : 'sg-fail'}>
      {ratio(n)} {ok ? `passes ${bar}:1` : `below ${bar}:1`}
    </span>
  );
}

export default function Style() {
  const spacing = scale('spacing');
  /* Computed, like every other value here: the dot's two greens and the
     contrast each one has against the button ground it is used on. */
  const signalDeep = swatch('color-signal-deep');
  const signalLight = swatch('color-signal-light');
  const underway = swatch('color-underway');
  const dot = dotSpec();

  /* A copy-and-paste version with literal values, generated from the same
     spec the page shows, so the snippet cannot disagree with the site. */
  const alpha = (pct: string) => (Number(pct.replace('%', '')) / 100).toString().replace(/^0/, '');
  const scaleNum = (pct: string) => (Number(pct.replace('%', '')) / 100).toString();
  const snippet = `.live-dot {
  position: relative;
  display: inline-block;
  width: ${dot.button.size};
  height: ${dot.button.size};
  border-radius: 50%;
  background: ${signalDeep.hex};
  box-shadow: 0 0 ${dot.button.glow.blur} ${dot.button.glow.spread} rgb(${signalDeep.rgb} / ${alpha(dot.button.glow.strength)});
}
.live-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  animation: live-ping ${dot.ping.duration} ${dot.ping.easing} infinite;
}
@keyframes live-ping {
  0% { transform: scale(${scaleNum(dot.ping.from.scale)}); opacity: ${alpha(dot.ping.from.opacity)}; }
  ${dot.ping.settlesAt}, 100% { transform: scale(${scaleNum(dot.ping.to.scale)}); opacity: 0; }
}
/* On a dark ground, use ${signalLight.hex}. */
@media (prefers-reduced-motion: reduce) {
  .live-dot::after { animation: none; opacity: 0; }
}`;
  const seconds = Number(dot.ping.duration.replace('s', ''));
  const settleSec = (seconds * Number(dot.ping.settlesAt.replace('%', ''))) / 100;

  return (
    <div className="hx">
      {/* S1 - What this is, and where everything is. */}
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b> {OPENING.kicker}
        </p>
        <div className="hx-grid">
          <h1 className="hx-h2 c-two-thirds">{OPENING.heading}</h1>
          <p className="hx-lede c-third">{OPENING.lede}</p>
          <nav className="c-full sg-contents" aria-label="On this page">
            <ol>
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span>{String(i + 2).padStart(2, '0')}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* S2 - Logo. The mark on both grounds it is allowed on, then the rules. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="logo">
        <p className="hx-label">
          <b>02</b> {LOGO.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{LOGO.heading}</h2>
          <p className="hx-lede c-third">{LOGO.lede}</p>
        </div>

        <div className="sg-logo-grid">
          <figure className="sg-plate" data-ground="paper">
            <LogoMark size={180} variant="outline" />
            <figcaption>Outline · ink on paper</figcaption>
          </figure>
          <figure className="sg-plate" data-ground="ink">
            <LogoMark size={180} variant="outline" />
            <figcaption>Outline · paper on ink</figcaption>
          </figure>
          <figure className="sg-plate" data-ground="paper">
            <div className="sg-small-marks">
              <LogoMark size={48} variant="solid" />
              <LogoMark size={32} variant="solid" />
              <LogoMark size={16} variant="solid" />
            </div>
            <figcaption>Solid · 48, 32 and 16px</figcaption>
          </figure>
          <figure className="sg-plate sg-plate-wide" data-ground="paper">
            <Logo size={64} />
            <figcaption>Lockup · mark and wordmark</figcaption>
          </figure>
        </div>

        <div className="hx-grid sg-after-plates">
          <div className="c-two-thirds">
            <Ledger items={[...LOGO.rules]} />
          </div>
          <div className="c-third">
            <p className="side-label">Do not</p>
            <ul className="crit">
              {LOGO.donts.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* S3 - Colour. Values, contrast and print approximations, all computed. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="colour">
        <p className="hx-label">
          <b>03</b> {COLOUR.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{COLOUR.heading}</h2>
          <p className="hx-lede c-third">{COLOUR.lede}</p>
        </div>

        {COLOUR.groups.map((g) => (
          <div className="sg-colour-group" key={g.title}>
            <p className="side-label">{g.title}</p>
            <div className="sg-swatches">
              {g.entries.map((e) => {
                const s = swatch(e.token);
                const ink = inkSwatch(e.token);
                const bar = e.use === 'text' ? 4.5 : e.use === 'graphic' ? 3 : null;
                /* Colours the ink band does not rebind are never used on ink —
                   except ink itself, which IS that ground. */
                const onInkCell =
                  e.token === 'color-ink' ? (
                    'The dark ground'
                  ) : ink && e.use === 'surface' ? (
                    `${ink.hex} · raised surface`
                  ) : ink ? (
                    <>
                      {ink.hex} · <Rating n={ink.onInk} bar={bar} />
                    </>
                  ) : (
                    'Not used on ink'
                  );
                return (
                  <article className="sg-swatch" key={e.token}>
                    <div className="sg-chip-row">
                      <span className="sg-colour" style={{ background: s.hex }} aria-hidden="true" />
                      {ink && (
                        <span
                          className="sg-colour sg-colour-ink"
                          style={{ background: ink.hex }}
                          aria-hidden="true"
                          title="On the ink ground"
                        />
                      )}
                    </div>
                    <h3 className="sg-swatch-name">{e.name}</h3>
                    <p className="sg-swatch-role">{e.role}</p>
                    <dl className="sg-values">
                      <dt>HEX</dt>
                      <dd>{s.hex}</dd>
                      <dt>RGB</dt>
                      <dd>{s.rgb}</dd>
                      <dt>CMYK</dt>
                      <dd>{s.cmyk}</dd>
                      <dt>On paper</dt>
                      <dd>{e.token === 'color-paper' ? 'The page itself' : e.use === 'surface' ? 'Raised surface' : <Rating n={s.onPaper} bar={bar} />}</dd>
                      <dt>On ink</dt>
                      <dd>{onInkCell}</dd>
                      <dt>Token</dt>
                      <dd>{s.token}</dd>
                    </dl>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
        <Note>{COLOUR.note}</Note>
      </section>

      {/* S4 - Type. The three faces at size, then the scale. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="type">
        <p className="hx-label">
          <b>04</b> {TYPE.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{TYPE.heading}</h2>
          <p className="hx-lede c-third">{TYPE.lede}</p>
        </div>

        <div className="sg-faces">
          {TYPE.faces.map((f) => (
            <article className="sg-face" key={f.family}>
              <p className={`sg-specimen ${f.className}`}>{f.sample}</p>
              <div className="sg-face-meta">
                <h3 className="d4">{f.family}</h3>
                <p className="sg-swatch-role">{f.role}</p>
                <p className="sg-swatch-role">{f.weights}</p>
                <p className="sg-swatch-role">{f.settings}</p>
                <p className="sg-face-link">
                  <TextLink href={f.href}>Get the font</TextLink> <span className="sg-token">{f.cssVar}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="sg-scale">
          {TYPE.scale.map((t) => (
            <div className="sg-scale-row" key={t.name}>
              <p className="side-label">{t.name}</p>
              <p className="sg-scale-spec">{t.spec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* S5 - Space and shape. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="space">
        <p className="hx-label">
          <b>05</b> {SPACE.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{SPACE.heading}</h2>
          <p className="hx-lede c-third">{SPACE.lede}</p>
        </div>

        <div className="sg-spacing">
          {spacing.map((s) => (
            <div className="sg-spacing-row" key={s.token}>
              <span className="sg-token">{s.token}</span>
              <span className="sg-bar" style={{ width: s.value }} aria-hidden="true" />
              <span className="sg-spacing-value">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="hx-grid sg-after-plates">
          <div className="c-half sides-pair">
            {SPACE.radius.map((r) => (
              <div className="side" key={r.token}>
                <p className="side-label">{r.name}</p>
                <span className="sg-radius" data-shape={r.token === '--radius-pill' ? 'pill' : 'square'} aria-hidden="true" />
                <p className="side-note">{r.use}</p>
                <p className="sg-token">{r.token}</p>
              </div>
            ))}
          </div>
          <div className="c-half">
            <div className="side">
              <p className="side-label">The rule</p>
              <p className="side-line">{SPACE.principle.title}</p>
              <p className="side-note">{SPACE.principle.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* S6 - Components, live, on the ink band so they are seen on both grounds. */}
      <section className="hx-band" data-tone="ink" id="components">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>06</b> {COMPONENTS.kicker}
          </p>
          <div className="hx-grid">
            <h2 className="hx-h2 c-two-thirds">{COMPONENTS.heading}</h2>
            <p className="hx-lede c-third">{COMPONENTS.lede}</p>
          </div>

          <div className="sg-components">
            <div className="sg-component">
              <p className="side-label">Buttons</p>
              <div className="sg-button-row">
                <Button href="/join">Primary</Button>
                <Button href="/join" variant="ghost">
                  Ghost
                </Button>
              </div>
              <p className="side-note">One primary per view. Pill shaped, 44px tall.</p>
            </div>

            <div className="sg-component">
              <p className="side-label">Status</p>
              <div className="sg-button-row">
                <Chip tone="live">live</Chip>
                <Chip tone="underway">in beta</Chip>
                <Chip tone="absent">not yet</Chip>
                <Chip>neutral</Chip>
              </div>
              <p className="side-note">
                Mono caps inside a pill, with a dot in the same colour. Only live pulses; the others hold still,
                because a pulse on “not yet” would imply something is happening.
              </p>
            </div>

            <div className="sg-component">
              <p className="side-label">Section label</p>
              <p className="hx-label sg-label-demo">
                <b>04</b> You pick the split
              </p>
              <p className="side-note">Number in cobalt, words in ink 50, above a hairline.</p>
            </div>

            <div className="sg-component">
              <p className="side-label">Figure</p>
              <p className="fig sg-figure-demo">$90,000</p>
              <p className="side-note">Instrument Sans 600 with tabular numerals. Never mono.</p>
            </div>
          </div>
        </div>
      </section>

      {/* S7 - The dot, as an element in its own right: two behaviours drawn
             large, its anatomy and colour logic, and how to rebuild it. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="dot">
        <p className="hx-label">
          <b>07</b> {DOT.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{DOT.heading}</h2>
          <p className="hx-lede c-third">{DOT.lede}</p>
        </div>

        <div className="sg-dot-plates">
          <figure className="sg-dot-plate">
            <div className="sg-dot-stage" aria-hidden="true">
              {/* The real element, scaled up — not a drawing of it. */}
              <span className="live-dot sg-dot-big" style={{ ['--dot' as string]: signalDeep.hex }} />
            </div>
            <div className="sg-dot-context">
              <Button href="/join" live>
                Join as a member
              </Button>
              <Chip tone="live">live</Chip>
            </div>
            <figcaption>
              <span className="side-label">{DOT.behaviours[0].label}</span>
              <span className="side-line">{DOT.behaviours[0].line}</span>
              <span className="side-note">{DOT.behaviours[0].note}</span>
            </figcaption>
          </figure>

          <figure className="sg-dot-plate">
            <div className="sg-dot-stage" aria-hidden="true">
              <span className="live-dot sg-dot-big sg-dot-still" style={{ ['--dot' as string]: underway.hex }} />
            </div>
            <div className="sg-dot-context">
              <Chip tone="underway">in beta</Chip>
              <Chip tone="absent">not yet</Chip>
            </div>
            <figcaption>
              <span className="side-label">{DOT.behaviours[1].label}</span>
              <span className="side-line">{DOT.behaviours[1].line}</span>
              <span className="side-note">{DOT.behaviours[1].note}</span>
            </figcaption>
          </figure>
        </div>

        <div className="hx-grid sg-after-plates">
          <div className="c-half">
            <p className="side-label">Anatomy</p>
            <Ledger
              items={[
                {
                  label: DOT.anatomy[0].part,
                  value: `${dot.button.size} · ${dot.chip.size} in a pill`,
                  description: DOT.anatomy[0].what,
                },
                {
                  label: DOT.anatomy[1].part,
                  value: `${dot.button.glow.blur} blur · ${dot.button.glow.strength}`,
                  description: `${DOT.anatomy[1].what} In a pill it softens to ${dot.chip.glow.blur} at ${dot.chip.glow.strength}.`,
                },
                {
                  label: DOT.anatomy[2].part,
                  value: `${dot.ping.to.scale} · ${dot.ping.duration}`,
                  description: DOT.anatomy[2].what,
                },
                {
                  label: 'Gap to the word',
                  value: `${dot.button.gap} · ${dot.chip.gap} in a pill`,
                },
              ]}
            />
          </div>
          <div className="c-half">
            <p className="side-label">Colour</p>
            <Ledger
              items={[
                {
                  label: DOT.colourRules[0].where,
                  value: signalDeep.hex,
                  description: `--${DOT.colourRules[0].token} · ${ratio(signalDeep.onPaper)} on light`,
                },
                {
                  label: DOT.colourRules[1].where,
                  value: signalLight.hex,
                  description: `--${DOT.colourRules[1].token} · ${ratio(signalLight.onInk)} on dark`,
                },
                { label: 'In a status pill', value: 'its status', description: DOT.pillRule },
              ]}
            />
            <ul className="crit">
              {DOT.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hx-grid sg-after-plates">
          <div className="c-half">
            <p className="side-label">{DOT.recreate.devTitle}</p>
            <p className="side-note sg-recreate-note">{DOT.recreate.devNote}</p>
            <CodeBlock code={snippet} language="CSS" />
          </div>
          <div className="c-half">
            <p className="side-label">{DOT.recreate.designTitle}</p>
            <p className="side-note sg-recreate-note">{DOT.recreate.designNote}</p>
            <Ledger
              items={[
                { label: 'Core layer', value: `${dot.button.size} circle`, description: 'Dot colour, 100% opacity.' },
                {
                  label: 'Glow',
                  value: `${dot.button.glow.blur} blur`,
                  description: `Drop shadow, no offset, ${dot.button.glow.spread} spread, dot colour at ${dot.button.glow.strength}.`,
                },
                {
                  label: 'Ping at 0s',
                  value: `${dot.ping.from.scale} · ${dot.ping.from.opacity}`,
                  description: 'A duplicate of the core, above it.',
                },
                {
                  label: `Ping at ${settleSec}s`,
                  value: `${dot.ping.to.scale} · ${dot.ping.to.opacity}`,
                  description: `Ease out. Then hold, invisible, until ${seconds}s.`,
                },
                { label: 'Loop', value: `every ${seconds}s`, description: 'Seamless. Nothing on the core moves.' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* S7 - Voice. Pairs, then the short rules. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="voice">
        <p className="hx-label">
          <b>08</b> {VOICE.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{VOICE.heading}</h2>
          <p className="hx-lede c-third">{VOICE.lede}</p>
        </div>

        <div className="sg-voice">
          {VOICE.rules.map((r) => (
            <article className="sg-voice-pair" key={r.label}>
              <p className="side-label">{r.label}</p>
              <p className="sg-say" data-kind="do">
                <span>Say</span>
                {r.do}
              </p>
              <p className="sg-say" data-kind="dont">
                <span>Not</span>
                {r.dont}
              </p>
            </article>
          ))}
        </div>

        <div className="hx-grid sg-after-plates">
          <div className="c-full">
            <Ledger
              items={VOICE.checklist.map((c) => ({ label: c.label, value: '', description: c.rule }))}
            />
          </div>
        </div>
      </section>

      {/* S8 - Social and print. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="applications">
        <p className="hx-label">
          <b>09</b> {APPLICATIONS.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{APPLICATIONS.heading}</h2>
          <p className="hx-lede c-third">{APPLICATIONS.lede}</p>
        </div>

        <div className="hx-grid sg-after-plates">
          <div className="c-half">
            <p className="side-label">Social sizes</p>
            <Ledger items={APPLICATIONS.social.map((s) => ({ label: s.label, value: s.value }))} />
            <ul className="crit">
              {APPLICATIONS.socialRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="c-half">
            <p className="side-label">Print</p>
            <Ledger items={APPLICATIONS.print.map((s) => ({ label: s.label, value: s.value }))} />
            <ul className="crit">
              {APPLICATIONS.printRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* S9 - Files. */}
      <section className="hx-band hx-wrap" data-pad="tight" id="downloads">
        <p className="hx-label">
          <b>10</b> {DOWNLOADS.kicker}
        </p>
        <div className="hx-grid">
          <h2 className="hx-h2 c-two-thirds">{DOWNLOADS.heading}</h2>
          <p className="hx-lede c-third">{DOWNLOADS.lede}</p>
        </div>

        <div className="hx-grid sg-after-plates">
          {DOWNLOADS.groups.map((g) => (
            <div className="c-half" key={g.title}>
              <p className="side-label">{g.title}</p>
              <ul className="sg-files">
                {g.files.map((f) => (
                  <li key={f.href}>
                    <a href={f.href} download>
                      <span className="sg-file-name">{f.label}</span>
                      <span className="sg-file-use">{f.use}</span>
                      <span className="sg-file-format">{f.format}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="c-full">
            <Note>{DOWNLOADS.pending}</Note>
          </div>
        </div>
      </section>
    </div>
  );
}
