/* The brand and style guide, ported from reference/redesign/style.html.
 *
 * Copy lives here. No colour, contrast ratio, pass or fail, CMYK value,
 * spacing step, radius, ease, page measure or file size is written in this
 * file: the page reads every one of them from the files the site is built
 * from, through lib/brandTokens.ts. Where an entry below names a token, that
 * is the token the page reads. */

export const META = {
  title: 'Brand and style guide',
  description:
    'The Clear logo, colour, type, space, layout, components, motion, drawings and voice, with downloadable files: the reference for sites, apps, print and social.',
} as const;

/* The tags that mark what changed in this edition of the guide. */
export const NEW = 'New';
export const UPDATED = 'Updated';

/* ── Hero ─────────────────────────────────────────────────────────────── */
export const HERO = {
  label: { kicker: 'Brand', title: 'Style guide' },
  lines: ['How Clear looks,', 'sounds and is built.'],
  lede: 'The reference for anything with the Clear name on it: a site, an app, a flyer or a post. Every value here is the one the website is built from.',
  indexLabel: 'On this page',
  index: [
    { id: 'logo', n: '01', label: 'Logo', isNew: false },
    { id: 'colour', n: '02', label: 'Colour', isNew: false },
    { id: 'type', n: '03', label: 'Type', isNew: false },
    { id: 'space', n: '04', label: 'Space and shape', isNew: false },
    { id: 'layout', n: '05', label: 'Layout', isNew: true },
    { id: 'components', n: '06', label: 'Components', isNew: false },
    { id: 'motion', n: '07', label: 'Motion', isNew: true },
    { id: 'drawings', n: '08', label: 'Drawings', isNew: true },
    { id: 'dot', n: '09', label: 'The dot', isNew: false },
    { id: 'voice', n: '10', label: 'Voice', isNew: false },
    { id: 'applications', n: '11', label: 'Social and print', isNew: false },
    { id: 'downloads', n: '12', label: 'Downloads', isNew: false },
  ],
  /* The cover plate: the system on one strip. */
  plate: {
    mark: { who: 'The mark', ck: 'Outline' },
    page: {
      who: 'The page',
      ck: 'Paper, ink, one cobalt',
      swatches: [
        { token: 'color-paper', name: 'Paper' },
        { token: 'color-ink', name: 'Ink' },
        { token: 'color-live', name: 'Cobalt' },
        { token: 'color-settled', name: 'Settled' },
      ],
    },
    faces: { who: 'The faces', ck: 'Three, one job each', display: 'Clear.', text: 'Instrument Sans for reading.', mono: 'Plex Mono · labels' },
  },
} as const;

/* ── 01 Logo ──────────────────────────────────────────────────────────── */
export const LOGO = {
  n: '01',
  label: 'Logo',
  title: 'A C that opens, and a link that passes through it.',
  line: 'One drawing in two weights. The wordmark is Bricolage Grotesque set tight, with no separately drawn lettering.',
  outline: { who: 'Outline', ck: 'From 96px · 15mm' },
  solid: {
    who: 'Solid',
    ck: 'Below that, down to 16px',
    sizes: [
      { px: 64, cap: '64px' },
      { px: 40, cap: '40px' },
      { px: 24, cap: '24px' },
      { px: 16, cap: '16px, the floor' },
    ],
  },
  rules: [
    {
      k: 'Outline or solid',
      v: 'By size',
      d: 'Outline from 96px on screen or 15mm in print. Below that the thin line falls under a pixel, so use the solid mark.',
    },
    { k: 'Clear space', v: '⅕ of the mark', d: 'A margin the width of the ring on every side. Nothing else sits inside it.' },
    { k: 'Smallest size', v: '16px · 6mm', d: 'The solid mark, never smaller. At that size, drop the wordmark.' },
    { k: 'Wordmark', v: 'Bricolage 800', d: '−3.5% tracking, at 95% of the mark’s height, with a gap of 0.55× the type size.' },
  ],
  never: {
    who: 'Never',
    ck: 'Four ways to break it',
    items: [
      'Recolour it outside ink or paper',
      'Stretch, rotate or add effects',
      'Put it on a busy photo without a ground',
      'Redraw or retype the wordmark',
    ],
  },
} as const;

/* ── 02 Colour ────────────────────────────────────────────────────────── */
/* How a colour is used decides which contrast bar applies, so the guide can
   only grade it honestly if it knows. Text needs 4.5:1, a shape or a line
   3:1. A surface and a hairline have no bar, so they are not graded. */
export type ColourUse = 'text' | 'graphic' | 'surface' | 'rule';

/* Where the page reads a swatch from: a token, a token as the ink band
   rebinds it, the quiet trace (drawn on /capital, not a token), or the two
   ink tints shown as one. */
export type ColourSource =
  | { token: string }
  | { band: string }
  | { quiet: 'halo' }
  | { tints: readonly [string, string] };

export type ColourEntry = { name: string; role: string; use: ColourUse; src: ColourSource };

export const COLOUR = {
  n: '02',
  label: 'Colour',
  title: 'A mineral page, green-black ink, and one cobalt.',
  line: 'The page is a cool grey-green, not white and not cream. Every swatch is graded against both grounds it sits on.',
  groups: [
    {
      title: 'Ground and ink',
      entries: [
        { name: 'Paper', role: 'The page. Most of every layout.', use: 'surface', src: { token: 'color-paper' } },
        { name: 'Paper raised', role: 'Raised surfaces, menus, the selected tab.', use: 'surface', src: { token: 'color-paper-2' } },
        { name: 'Ink', role: 'Text and drawn lines. Also the dark band.', use: 'text', src: { token: 'color-ink' } },
        { name: 'Cobalt', role: 'The one figure that is moving. Once per view.', use: 'text', src: { token: 'color-live' } },
      ],
    },
    {
      title: 'Status and land',
      entries: [
        { name: 'Settled', role: 'Live, owned, paid. Invite-only.', use: 'text', src: { token: 'color-settled' } },
        { name: 'Underway', role: 'In build, in progress.', use: 'text', src: { token: 'color-underway' } },
        { name: 'Absent', role: 'Not yet, and what we will not do.', use: 'text', src: { token: 'color-absent' } },
        { name: 'Land', role: 'Land and parcels, as a fill.', use: 'graphic', src: { token: 'color-land' } },
      ],
    },
    {
      title: 'On ink, and quiet',
      entries: [
        { name: 'Signal light', role: 'The live dot and the trace, on ink.', use: 'graphic', src: { token: 'color-signal-light' } },
        { name: 'Cobalt on ink', role: 'Cobalt, rebound inside a dark band.', use: 'text', src: { band: 'color-live' } },
        { name: 'Faded cobalt', role: 'The quiet trace. Pointing, not live.', use: 'graphic', src: { quiet: 'halo' } },
        { name: 'Ink 28 · 13', role: 'Borders and hairlines. Never text.', use: 'rule', src: { tints: ['color-ink-28', 'color-ink-13'] } },
      ],
    },
  ] satisfies { title: string; entries: ColourEntry[] }[],
  grounds: { paper: 'Paper', ink: 'Ink' },
  na: 'n/a',
  /* Read out after each grade, since a pass is otherwise shown only by colour. */
  passes: 'passes',
  below: 'below',
  /* {a} and {b} are the two tints' strengths, read from their tokens. */
  tints: 'ink at {a}% · {b}%',
  once: {
    good: {
      verdict: 'Once per view',
      use: 'Cobalt goes on the one figure that is moving. Everything else stays ink.',
    },
    bad: {
      verdict: 'Not this',
      use: 'Three cobalts and nothing is current. It reads as a link style, not a signal.',
    },
    /* The same three rows on both sides; `live` is the one that is moving. */
    rows: [
      { k: 'Balance', v: 5718.42, live: false },
      { k: 'This cycle', v: 412.6, live: true },
      { k: 'Credit left', v: 3400, live: false },
    ],
    live: 'Green light runs along a line when something is live: a payment going through.',
    quiet: 'Faded cobalt is the quiet version, for pointing at something without calling it live.',
  },
} as const;

/* ── 03 Type ──────────────────────────────────────────────────────────── */
export const TYPE = {
  n: '03',
  label: 'Type',
  title: 'Three faces, each with one job.',
  line: 'Display for what we are saying, text for everything a reader works through, and mono only for labels.',
  faces: [
    {
      kind: 'display',
      family: 'Bricolage Grotesque',
      job: 'Display',
      sample: ['Your money kept in your neighborhood.'],
      body: 'Headlines, statements, the wordmark. 800 for headlines, 600 for sub-heads. Tracking −3.5% to −4.5%, line height 0.92–1.05.',
    },
    {
      kind: 'text',
      family: 'Instrument Sans',
      job: 'Text and figures',
      sample: ['A cooperative where the rent you already pay builds equity toward a home of your own.'],
      body: 'Body, figures, buttons, forms. Body 17px on 1.6. Figures 600 with tabular numerals.',
    },
    {
      kind: 'mono',
      family: 'IBM Plex Mono',
      job: 'Labels only',
      sample: ['01 · How it works', 'Figures illustrative'],
      body: 'Section labels, tags, chips and axis notes. 10.5–11.5px, uppercase, +8–10% tracking. Never a figure, never a sentence.',
    },
  ],
  /* `x` is the sample, set in the style the row names. */
  scale: [
    { key: 'hero', n: 'Hero', s: 'Bricolage 800 · 84–132px · −4.5% · two set lines', x: 'Two set lines' },
    { key: 'section', n: 'Section heading', s: 'Bricolage 800 · 36–72px · −3.8%', x: 'Who decides what.' },
    { key: 'cell', n: 'Cell headline', s: 'Bricolage 800 · 28–46px · −3.5%', x: 'One vote each.' },
    { key: 'sub', n: 'Sub-heading', s: 'Bricolage 600 · 20–26px · −2.2%', x: 'You receive shares.' },
    { key: 'lede', n: 'Lede', s: 'Instrument 400 · 18–22px · 1.45', x: 'The line that answers the heading.' },
    { key: 'body', n: 'Body', s: 'Instrument 400 · 15–17px · 1.55', x: 'Everything a reader works through, three lines at most in a cell.' },
    { key: 'figure', n: 'Figure', s: 'Instrument 600 · tabular · −2%', x: '$1,062.20' },
    { key: 'label', n: 'Label', s: 'Plex Mono 400 · 11.5px · caps +10%', x: '04 · You pick the split' },
  ],
} as const;

/* ── 04 Space and shape ───────────────────────────────────────────────── */
export const SPACE = {
  n: '04',
  label: 'Space and shape',
  title: 'Six steps of space, and corners that mean something.',
  line: 'Every gap comes from one scale. A corner tells you what a thing is: drawn, touched, or a device.',
  scale: { who: 'The scale', ck: 'No seventh step' },
  corners: {
    who: 'Corners',
    ck: 'Three, and only three',
    /* `radius` is the token each shape is drawn with; the device's figure is
       read from it and printed beside its name. */
    items: [
      { radius: 'none', name: 'Square', body: 'Anything drawn or documented: cells, tables, fields, drawings.', showValue: false, updated: false },
      { radius: 'pill', name: 'Pill', body: 'Anything you interact with: buttons, toggles, range handles, chips.', showValue: false, updated: true },
      { radius: 'device', name: 'Device', body: 'The one exception: the thin outline around an app screen.', showValue: true, updated: false },
    ],
  },
  meet: {
    good: { verdict: 'Rules that meet', body: 'A bento is one grid of shared seams. Every rule runs wall to wall and nothing floats.' },
    bad: { verdict: 'Not boxes that float', body: 'Rounded, padded, shadowed cards. Each one is its own object, and the page turns into a dashboard.' },
    note: 'The rule was “draw rules, not boxes.” It still is: a bordered bento is rules that meet, so it passes. A floating card does not.',
    tag: 'Restated',
  },
} as const;

/* ── 05 Layout ────────────────────────────────────────────────────────── */
export const LAYOUT = {
  n: '05',
  label: 'Layout',
  title: 'Every section is built the same four ways.',
  line: 'A head that answers itself, a bento of cells, columns that line up, and paper broken by ink.',
  head: {
    who: 'The section head',
    ck: '7 / 5, stacks below 900px',
    demo: { n: '02', label: 'The split', title: 'The land is why this works.', aside: 'One line that adds what the headline does not.' },
    body: 'A full-width label rule with the number in cobalt, the headline, and one aside line. Hero headlines sit on two set lines from tablet up.',
  },
  cell: {
    who: 'The cell',
    ck: 'Header · main · footer',
    demo: { who: 'Who maintains it', header: 'Header', main: 'Main', foot: 'A footnote or a link', footer: 'Footer' },
    body: 'Name left, a quiet tag right. The footer is optional and always full width.',
  },
  subgrid: {
    who: 'Columns that line up',
    seg: { label: 'Subgrid', on: 'Subgrid on', off: 'Off' },
    cols: [
      { h: 'One vote each.', p: 'Headlines of different lengths.' },
      { h: 'Residents govern their own place.', p: 'The figures still start on one line.' },
      { h: 'One third.', p: 'Because the rows are shared.' },
    ],
    body: {
      before: 'Cells in a row share their row tracks (',
      code: 'grid-template-rows: subgrid',
      after: '), so a two-line headline pushes every figure in the row down together.',
    },
  },
  bands: {
    who: 'Paper, broken by ink',
    ck: 'The rhythm',
    rows: [
      { ink: false, label: 'Hero · paper' },
      { ink: true, label: '01 · ink band' },
      { ink: false, label: '02 · paper' },
      { ink: true, label: '03 · ink band' },
    ],
    body: 'Ink bands redefine the tokens rather than adding colours, so every component works on both. Two paper sections in a row drop the second one’s top padding.',
  },
  widths: {
    who: 'Widths',
    ck: 'Designed three times',
    /* {max} is the page measure, read from the site's own CSS. */
    rows: [
      { k: 'Desktop', v: '{max} max, 1440 tested' },
      { k: 'Tablet', v: '900' },
      { k: 'Phone', v: '390, nothing scrolls sideways at 360' },
    ],
    body: 'Visitors split evenly across the three, so each is designed on its own terms, not squeezed.',
  },
} as const;

/* ── 06 Components ────────────────────────────────────────────────────── */
export const COMPONENTS = {
  n: '06',
  label: 'Components',
  title: 'The pieces every page is built from.',
  line: 'These are working components, not pictures of them. Try them.',
  pill: 'Pill',
  buttons: {
    who: 'Buttons',
    primary: { label: 'Join the waitlist', href: '/join' },
    ghost: { label: 'How it works', href: '/how' },
    use: 'One primary per view, with the live dot. The ghost is the second choice.',
  },
  chips: {
    who: 'Status chips',
    items: [
      { tone: 'live', label: 'Invite-only' },
      { tone: 'underway', label: 'In build' },
      { tone: 'absent', label: 'Not yet' },
    ],
    use: 'Say exactly where a thing is. “Invite-only” over “beta”: it is the honest word.',
  },
  seg: {
    who: 'Segmented toggle',
    label: 'Example',
    options: [
      { value: 'one', label: 'One duplex' },
      { value: 'many', label: 'A portfolio' },
    ],
    use: 'Two to four views of the same thing. The page changes; the layout does not.',
  },
  select: {
    who: 'Dropdown',
    name: 'trade',
    label: 'Trade',
    placeholder: 'Choose a trade',
    options: ['Auto repair', 'Tires and wheels', 'Dental or medical', 'Something else'],
    use: 'A listbox, never the system menu. Arrows move, Enter chooses, Escape closes.',
  },
  range: {
    who: 'Range',
    label: 'Typical ticket',
    lowWord: 'low',
    highWord: 'high',
    min: 100,
    max: 5000,
    step: 50,
    startLow: 350,
    startHigh: 1500,
    use: 'For a number a reader feels rather than types. Two handles when the honest answer is a spread.',
  },
  rail: {
    who: 'The rail',
    steps: ['01', '02', '03', '04'],
    use: 'Progress along a bento’s top edge, scrubbed by scroll. Knobs sit centred in their columns.',
  },
  facts: {
    who: 'Facts list',
    ck: 'Hero, beside the lede',
    rows: [
      { k: 'Tax when you contribute', v: 'None, §721', live: true },
      { k: 'What you receive', v: 'Shares, 1:1', live: false },
      { k: 'Tenants and repairs', v: 'Not yours', live: false },
    ],
  },
  ledger: {
    who: 'Ledger rows',
    ck: 'Label · value · one line',
    rows: [
      { k: 'Issued by', v: 'Value' },
      { k: 'Distributions', v: 'Pro rata' },
      { k: 'Tax distributions', v: 'Mandatory' },
    ],
  },
} as const;

/* ── 07 Motion ────────────────────────────────────────────────────────── */
export const MOTION = {
  n: '07',
  label: 'Motion',
  title: 'Motion shows what changed. It never hides what is there.',
  line: 'Four moves, used everywhere. With reduced motion, each one shows its end state instead.',
  replay: 'Replay',
  rise: {
    who: 'The rise',
    ck: 'Hero headlines, once',
    text: 'Words rise into place.',
    body: 'Each word lifts out of a padded mask, and the mask comes off when it lands, so no descender or edge is ever clipped.',
  },
  scrub: {
    who: 'The scrub',
    ck: 'Tied to scroll',
    readout: 'Scroll position',
    body: 'Fills, rails and month strips follow the scroll, so the reader controls the pace and can go back.',
  },
  trace: {
    who: 'The trace',
    ck: 'Light along a line',
    live: 'Live: green',
    quiet: 'Quiet: faded cobalt',
    body: 'A short lit segment runs once around an outline, then rests. It follows the thing it outlines when the layout wraps.',
  },
  count: {
    who: 'The count',
    ck: 'Figures that change',
    to: 30000,
    body: 'A figure counts to its new value with tabular numerals, so the width never jumps.',
  },
  rules: {
    who: 'Rules',
    ck: 'GSAP and ScrollTrigger',
    first: 'Nothing animates that a reader needs before it finishes. Content is complete with scripts off.',
    /* The ease itself is read from the site's tokens and set between these. */
    ease: { before: 'One ease for everything: a fast start that settles (', after: ').' },
    rest: [
      'Loops pause when they scroll out of view, and run only on things that are actually live.',
      'With reduced motion, show every end state: the final figure, the drawn line, the result of the vote.',
    ],
  },
} as const;

/* ── 08 Drawings ──────────────────────────────────────────────────────── */
export type DrawingKind = 'solid' | 'dotted' | 'dashed' | 'dashdot' | 'hatch' | 'cobalt' | 'cobaltHatch' | 'label';

export const DRAWINGS = {
  n: '08',
  label: 'Drawings',
  title: 'A line means one thing, everywhere it appears.',
  line: 'Plans, plats and org charts share one drafting language, so a reader learns it once.',
  /* `kind` picks the drawing; `tag` is the word set inside it, if any. */
  items: [
    { kind: 'solid', who: 'Solid', ck: 'Owns', tag: '', body: 'An ownership line. Every coordinate derived, never typed.' },
    { kind: 'dotted', who: 'Dotted', ck: 'Contract', tag: 'contracts', body: 'A relationship that is not ownership. Always labelled.' },
    { kind: 'dashed', who: 'Dashed box', ck: 'Ownerless', tag: 'foundation', body: 'Means ownerless and nothing else. One per drawing at most.' },
    { kind: 'dashdot', who: 'Dash-dot', ck: 'Lot and parcel', tag: '', body: 'A legal boundary: the parcel, a lot line, the title.' },
    { kind: 'hatch', who: 'Hatch', ck: 'Held in common', tag: '', body: 'Land the members hold together. Never “ours” against “yours”.' },
    { kind: 'cobalt', who: 'Cobalt', ck: 'Yours, or current', tag: 'yours', body: 'The one home, seat or figure the reader should find first.' },
    { kind: 'cobaltHatch', who: 'Cobalt hatch', ck: 'Housing side', tag: '', body: 'Land and property when a drawing splits money from housing.' },
    { kind: 'label', who: 'The label', ck: 'Every sample figure', tag: 'Figures illustrative', body: 'Any made-up number says so right beside it, not in a footnote.' },
  ] satisfies { kind: DrawingKind; who: string; ck: string; tag: string; body: string }[],
} as const;

/* ── 09 The dot ───────────────────────────────────────────────────────── */
export const DOT = {
  n: '09',
  label: 'The dot',
  title: 'One dot, two jobs.',
  line: 'It says something is open now, or it tags a status. Only the first job moves.',
  pulsing: {
    who: 'Pulsing',
    ck: 'Open now',
    button: { label: 'Join', href: '/join' },
    chip: 'Invite-only',
    body: 'On Join, on each page’s main button, and on something open now. The ping runs.',
  },
  still: {
    who: 'Still',
    ck: 'A status',
    chips: [
      { tone: 'underway', label: 'In build' },
      { tone: 'absent', label: 'Not yet' },
    ],
    body: 'In build, signing, not yet. The core and the glow, and no ping.',
  },
  /* Every value on these rows is read from the dot's CSS (lib/brandTokens.ts
     dotSpec, swatch). The words here only wrap them: {placeholders} are
     filled in on the page. */
  anatomy: {
    who: 'Anatomy',
    ck: 'Measured from the site',
    inPill: '{v} in a pill',
    rows: [
      { k: 'Core', v: 'A solid circle in the dot colour.' },
      { k: 'Glow', v: 'A soft blur of the same colour around it.', pill: 'In a pill it softens to {blur} at {strength}.' },
      { k: 'Ping', v: 'A copy that grows and fades, then waits.' },
      { k: 'Gap', v: 'The space between the dot and its word.' },
    ],
  },
  colour: { who: 'Colour', ck: 'It follows the button, not the band' },
  colourRules: [
    { where: 'On a light button', token: 'color-signal-deep', ground: 'paper', on: 'on light' },
    { where: 'On a dark button', token: 'color-signal-light', ground: 'ink', on: 'on dark' },
  ],
  pillRule: { where: 'In a status pill', value: 'Its status', rule: 'The dot takes the pill’s own status colour.' },
  recreate: {
    dev: {
      who: 'For developers',
      ck: 'Plain CSS with hex values',
      lang: 'CSS',
      foot: 'Works outside this codebase. Generated from the site’s own values, so it cannot drift.',
      /* The comment in the copied CSS. */
      onDark: 'On a dark ground, use {hex}.',
    },
    design: {
      who: 'For designers',
      ck: 'Figma, After Effects or video',
      rows: [
        { k: 'Core layer', v: '{size} circle', d: 'Dot colour, 100% opacity.' },
        { k: 'Glow', v: '{blur} blur', d: 'Drop shadow, no offset, {spread} spread, dot colour at {strength}.' },
        { k: 'Ping at 0s', v: '{fromScale} · {fromOpacity}', d: 'A duplicate of the core, above it.' },
        { k: 'Ping at {settle}s', v: '{toScale} · {toOpacity}', d: 'Ease out. Then hold, invisible, until {total}s.' },
        { k: 'Loop', v: 'Every {total}s', d: 'Seamless. Nothing on the core moves.' },
      ],
    },
    copy: { idle: 'Copy', copied: 'Copied', failed: 'Copy failed', saidCopied: 'CSS copied to the clipboard', saidFailed: 'Copy failed' },
  },
  rules: {
    who: 'Rules',
    items: [
      'Pulse only what is actually open.',
      'Never on every button, never as a bullet.',
      'Always beside a word that says the same thing. The dot is never the only signal.',
      'With reduced motion, keep the dot and stop the ping.',
    ],
  },
} as const;

/* ── 10 Voice ─────────────────────────────────────────────────────────── */
export const VOICE = {
  n: '10',
  label: 'Voice',
  title: 'Say it the way a person would.',
  line: 'Plain words, short paragraphs, and never a promise we cannot keep.',
  head: { rule: 'Rule', say: 'Say', not: 'Not' },
  pairs: [
    {
      k: 'Plain words',
      y: 'You should not have to take our word for the numbers.',
      n: 'Nobody should be the only party able to check its own arithmetic.',
      isNew: false,
    },
    { k: 'No promises of return', y: 'The rent you already pay builds equity toward a home of your own.', n: 'Clear makes you rich.', isNew: false },
    { k: 'Say what an acronym means', y: 'The ELPA is the Equity-Lease Participation Agreement.', n: 'Sign your ELPA at 15,000 credits.', isNew: false },
    { k: 'Honest status', y: 'Invite-only.', n: 'Live. Now in beta.', isNew: true },
    { k: 'The land', y: 'The land is held in common by members.', n: 'The land stays ours. The house becomes yours.', isNew: true },
    { k: 'Less to read', y: 'One headline, one line, then show it.', n: 'A paragraph explaining a figure the reader can see.', isNew: true },
  ],
  rows: [
    { k: 'Paragraphs', v: 'Three lines', d: 'At most, in a cell, at every width from 1100px up. Longer does not get read.' },
    { k: 'Names', v: 'Clear · ClearPath', d: 'Clear is the co-op. ClearPath is the housing programme. “Shares”, not units, on the partner pages.' },
    { k: 'Never', v: 'Bank, yield, insured', d: 'Do not call Clear a bank, publish a rate or return, or say deposits are insured.' },
    { k: 'Place', v: 'Inland Empire', d: 'Inland Empire, California.' },
  ],
} as const;

/* ── 11 Social and print ──────────────────────────────────────────────── */
export const APPLICATIONS = {
  n: '11',
  label: 'Social and print',
  title: 'The same system, off the screen.',
  line: 'One statement in Bricolage, one line in Instrument, and paper and ink do the rest.',
  canvases: {
    who: 'Canvas sizes',
    ck: 'Drawn to scale',
    /* `box` is the drawing's size on the page, in the canvas's proportions. */
    items: [
      { w: 1080, h: 1080, label: 'Feed, square', box: [72, 72] },
      { w: 1080, h: 1350, label: 'Feed, portrait', box: [72, 90] },
      { w: 1080, h: 1920, label: 'Story and reel', box: [54, 96] },
      { w: 1200, h: 630, label: 'Link preview', box: [110, 58] },
      { w: 1500, h: 500, label: 'X header', box: [120, 40] },
    ],
  },
  social: {
    who: 'Social',
    items: [
      'A margin of 8% of the short edge on every side.',
      'On stories, keep text out of the top and bottom 14%.',
      'Body no smaller than 28px on a 1080px canvas.',
      'One statement per graphic.',
    ],
  },
  print: {
    who: 'Print',
    ck: '3mm bleed · 5mm safe · 9pt min',
    items: [
      'Flood the paper colour, or choose an uncoated stock close to it.',
      'Outline mark from 15mm, solid below.',
      'Use the CMYK values as a start and proof before a full run.',
    ],
  },
} as const;

/* ── 12 Downloads ─────────────────────────────────────────────────────── */
/* Every href is a file in public/. The page checks that it exists, and reads
   a PNG's pixel width from the file itself for its label. */
export type Download = { label: string; kind: 'SVG' | 'PNG'; href: string; use: string };

const lockupFiles: Download[] = [
  { label: 'Lockup, ink', kind: 'SVG', href: '/brand/clear-lockup-ink.svg', use: 'Light grounds' },
  { label: 'Lockup, paper', kind: 'SVG', href: '/brand/clear-lockup-paper.svg', use: 'Dark grounds' },
  { label: 'Solid lockup, ink', kind: 'SVG', href: '/brand/clear-lockup-solid-ink.svg', use: 'Small sizes' },
  { label: 'Solid lockup, paper', kind: 'SVG', href: '/brand/clear-lockup-solid-paper.svg', use: 'Small sizes, dark' },
  { label: 'Lockup, ink', kind: 'PNG', href: '/brand/clear-lockup-ink.png', use: 'Transparent' },
];

const markFiles: Download[] = [
  { label: 'Mark, ink', kind: 'SVG', href: '/brand/clear-mark-ink.svg', use: 'Light grounds' },
  { label: 'Solid mark, ink', kind: 'SVG', href: '/brand/clear-mark-solid-ink.svg', use: 'Small sizes' },
  { label: 'Avatar, ink ground', kind: 'PNG', href: '/brand/clear-avatar-ink.png', use: 'Profile picture' },
  { label: 'Avatar, paper ground', kind: 'PNG', href: '/brand/clear-avatar-paper.png', use: 'Profile picture' },
  { label: 'App icon', kind: 'PNG', href: '/icon-512.png', use: 'Home screen' },
];

export const DOWNLOADS = {
  n: '12',
  label: 'Downloads',
  title: 'Files, ready to use.',
  line: 'Vector for anything that scales, PNG wherever an upload is all you get.',
  lockup: { who: 'Lockup', ck: 'Wordmark outlined', files: lockupFiles },
  mark: { who: 'Mark and social', files: markFiles },
} as const;
