/* The brand and style guide. Copy lives here; every colour, size and spacing
 * value on the page is read from lib/tokens.css by lib/brandTokens.ts, so
 * nothing in this file is a number that could drift from the site. */

export const OPENING = {
  kicker: 'Brand and style guide',
  heading: 'How Clear looks, sounds and is built.',
  lede: 'The reference for anything with the Clear name on it — a site, an app, a flyer or a post. Every value on this page is read from the same files the website is built from.',
} as const;

export const SECTIONS = [
  { id: 'logo', label: 'Logo' },
  { id: 'colour', label: 'Colour' },
  { id: 'type', label: 'Type' },
  { id: 'space', label: 'Space and shape' },
  { id: 'components', label: 'Components' },
  { id: 'dot', label: 'The dot' },
  { id: 'voice', label: 'Voice' },
  { id: 'applications', label: 'Social and print' },
  { id: 'downloads', label: 'Downloads' },
] as const;

/* ── Logo ─────────────────────────────────────────────────────────────── */
export const LOGO = {
  kicker: 'Logo',
  heading: 'A C that opens, and a link that passes through it.',
  lede: 'The mark is one drawing in two weights. The wordmark is Bricolage Grotesque set tight — there is no separately drawn lettering.',
  rules: [
    {
      label: 'Outline or solid',
      value: 'by size',
      description:
        'Outline from 96px on screen or 15mm in print. Below that the thin line falls under a pixel, so use the solid mark — same silhouette, filled.',
    },
    {
      label: 'Clear space',
      value: '⅕ of the mark',
      description: 'Keep a margin the width of the ring on every side. Nothing else sits inside it.',
    },
    {
      label: 'Smallest size',
      value: '16px · 6mm',
      description: 'The solid mark, never smaller. At that size, drop the wordmark and use the mark alone.',
    },
    {
      label: 'Wordmark',
      value: 'Bricolage 800',
      description: 'Set in Bricolage Grotesque ExtraBold with −3.5% tracking, at 95% of the mark’s height, with a gap of 0.55× the type size.',
    },
  ],
  donts: [
    'Recolour it outside ink or paper',
    'Stretch, rotate or add effects',
    'Put it on a busy photo without a ground',
    'Redraw or retype the wordmark',
  ],
} as const;

/* ── Colour ───────────────────────────────────────────────────────────── */
/* How a colour is used decides which contrast bar applies, so the guide can
   only grade it honestly if it knows. Text needs 4.5:1, a shape or icon 3:1.
   A surface and a decorative hairline have no bar, and marking them "fail"
   would imply a defect that is not there. */
export type ColourUse = 'text' | 'graphic' | 'surface' | 'rule';
export type ColourEntry = { token: string; name: string; role: string; use: ColourUse };

export const COLOUR = {
  kicker: 'Colour',
  heading: 'A mineral page, green-black ink, and one cobalt.',
  lede: 'The page is a cool grey-green, not white and not cream. Cobalt marks the one thing that is current, so it appears once per view.',
  groups: [
    {
      title: 'Ground and ink',
      entries: [
        { token: 'color-paper', name: 'Paper', role: 'The page. Most of every layout.', use: 'surface' },
        { token: 'color-paper-2', name: 'Paper raised', role: 'Inputs and raised surfaces.', use: 'surface' },
        { token: 'color-ink', name: 'Ink', role: 'Text and drawn lines. Also the dark ground.', use: 'text' },
      ],
    },
    {
      title: 'Accent',
      entries: [
        { token: 'color-live', name: 'Cobalt', role: 'The figure that is moving. Once per view.', use: 'text' },
        { token: 'color-land', name: 'Land', role: 'Land and parcels, as a fill.', use: 'graphic' },
        { token: 'color-land-ink', name: 'Land as text', role: 'The same role when it has to be read.', use: 'text' },
      ],
    },
    {
      title: 'Status',
      entries: [
        { token: 'color-settled', name: 'Settled', role: 'Live, owned, paid.', use: 'text' },
        { token: 'color-underway', name: 'Underway', role: 'In progress.', use: 'text' },
        { token: 'color-absent', name: 'Absent', role: 'Not yet.', use: 'text' },
      ],
    },
    {
      title: 'Ink tints',
      entries: [
        { token: 'color-ink-70', name: 'Ink 70', role: 'Secondary text.', use: 'text' },
        { token: 'color-ink-50', name: 'Ink 50', role: 'The lightest text allowed.', use: 'text' },
        { token: 'color-ink-28', name: 'Ink 28', role: 'Borders. Never text.', use: 'rule' },
        { token: 'color-ink-13', name: 'Ink 13', role: 'Hairline rules. Never text.', use: 'rule' },
      ],
    },
  ] satisfies { title: string; entries: ColourEntry[] }[],
  note: 'Contrast is measured against paper and against the ink ground. Text needs 4.5:1; lines and shapes need 3:1. CMYK values are device approximations — proof before printing.',
} as const;

/* ── Type ─────────────────────────────────────────────────────────────── */
export const TYPE = {
  kicker: 'Type',
  heading: 'Three faces, each with one job.',
  lede: 'Display for what we are saying, text for everything a reader works through, and mono only for labels. All three are free and open-licensed.',
  faces: [
    {
      family: 'Bricolage Grotesque',
      cssVar: '--font-display',
      role: 'Headlines, statements and the wordmark.',
      weights: 'ExtraBold 800 for headlines · SemiBold 600 for sub-heads',
      settings: 'Tracking −3.5% to −4%. Line height 0.95–1.05.',
      sample: 'Your rent is making someone else rich.',
      className: 'sg-face-display',
      href: 'https://fonts.google.com/specimen/Bricolage+Grotesque',
    },
    {
      family: 'Instrument Sans',
      cssVar: '--font-text',
      role: 'Body copy, figures, buttons and forms.',
      weights: 'Regular 400 for body · Medium 500 for buttons · SemiBold 600 for figures',
      settings: 'Body 17px on 1.6. Figures use tabular numerals.',
      sample: 'A cooperative where the rent you already pay builds equity toward a home of your own.',
      className: 'sg-face-text',
      href: 'https://fonts.google.com/specimen/Instrument+Sans',
    },
    {
      family: 'IBM Plex Mono',
      cssVar: '--font-mono',
      role: 'Section labels, rails and small notes. Never figures.',
      weights: 'Regular 400',
      settings: '11.5px, uppercase, +10% tracking.',
      sample: '01  How it works',
      className: 'sg-face-mono',
      href: 'https://fonts.google.com/specimen/IBM+Plex+Mono',
    },
  ],
  scale: [
    { name: 'Hero', spec: 'Bricolage 800 · 96–172px · −4%', sample: 'Rent' },
    { name: 'Section heading', spec: 'Bricolage 800 · 38–104px · −3.8%', sample: 'Renter, owner.' },
    { name: 'Statement', spec: 'Bricolage 800 · 32–76px · −3.5%', sample: 'One sentence.' },
    { name: 'Sub-heading', spec: 'Bricolage 600 · 19–30px · −2%', sample: 'Each rung asks for something real.' },
    { name: 'Lede', spec: 'Instrument 400 · 17–22px · 1.45', sample: 'The line that answers the heading.' },
    { name: 'Body', spec: 'Instrument 400 · 17px · 1.6', sample: 'Everything a reader works through.' },
    { name: 'Figure', spec: 'Instrument 600 · tabular · −2%', sample: '$1,062.20' },
    { name: 'Label', spec: 'Plex Mono 400 · 11.5px · caps +10%', sample: '04 You pick the split' },
  ],
} as const;

/* ── Space and shape ──────────────────────────────────────────────────── */
export const SPACE = {
  kicker: 'Space and shape',
  heading: 'Six steps of space, and two corners.',
  lede: 'Every gap comes from one scale of six values. There is no seventh — if a layout seems to need one, the layout is wrong.',
  radius: [
    { token: '--radius-none', name: 'Square', use: 'Anything drawn or documented: fields, tables, cards, images.' },
    { token: '--radius-pill', name: 'Pill', use: 'Buttons and status chips, and nothing else.' },
  ],
  principle: {
    title: 'Draw rules, not boxes.',
    body: 'Separate content with a line and space before reaching for a border or a background. A box is for something you interact with.',
  },
} as const;

/* ── Components ───────────────────────────────────────────────────────── */
export const COMPONENTS = {
  kicker: 'Components',
  heading: 'The pieces every page is built from.',
  lede: 'These are the live components from the site, not pictures of them.',
} as const;

/* ── The dot ──────────────────────────────────────────────────────────── */
export const DOT = {
  kicker: 'The dot',
  heading: 'One dot, two jobs.',
  lede: 'It says something is open now, or it tags a status. Same element, same build. Only the first job moves.',
  behaviours: [
    {
      label: 'Pulsing',
      line: 'Open now.',
      note: 'On Join, on each page’s main button and on a live status. The ping runs.',
    },
    {
      label: 'Still',
      line: 'A status.',
      note: 'In beta, in build, signing, not yet. The core and the glow, and no ping.',
    },
  ],
  anatomy: [
    { part: 'Core', what: 'A solid circle in the dot colour.' },
    { part: 'Glow', what: 'A soft blur of the same colour around the core.' },
    { part: 'Ping', what: 'A copy of the core that grows and fades, then waits.' },
  ],
  colourRules: [
    { where: 'On a light button', token: 'color-signal-deep', ground: 'paper' },
    { where: 'On a dark button', token: 'color-signal-light', ground: 'ink' },
  ],
  pillRule: 'In a status pill, the dot takes the pill’s own status colour.',
  rules: [
    'Pulse only what is actually live or open.',
    'Never on every button, and never as a bullet point.',
    'Always beside a word that says the same thing. The dot is never the only signal.',
    'With reduced motion, keep the dot and stop the ping.',
  ],
  recreate: {
    devTitle: 'For developers',
    devNote: 'Plain CSS with hex values, so it works outside this codebase.',
    designTitle: 'For designers',
    designNote: 'The same motion for Figma, After Effects or a video export.',
  },
} as const;

/* ── Voice ────────────────────────────────────────────────────────────── */
export const VOICE = {
  kicker: 'Voice',
  heading: 'Say it the way a person would.',
  lede: 'Plain words, short paragraphs, and never a promise we cannot keep.',
  rules: [
    {
      label: 'Plain words',
      do: 'You should not have to take our word for the numbers.',
      dont: 'Nobody should be the only party able to check its own arithmetic.',
    },
    {
      label: 'Answer the headline',
      do: 'Your rent is making someone else rich. So we built the alternative.',
      dont: 'Your rent is making someone else rich. The money you pay ends up elsewhere.',
    },
    {
      label: 'No promises of return',
      do: 'The rent you already pay builds equity toward a home of your own.',
      dont: 'Clear makes you rich.',
    },
    {
      label: 'Say what an acronym means',
      do: 'The ELPA is the Equity-Lease Participation Agreement.',
      dont: 'Sign your ELPA at 15,000 credits.',
    },
  ],
  checklist: [
    { label: 'Paragraphs', rule: 'Three to four lines on a phone. Longer does not get read.' },
    { label: 'Openings', rule: 'Do not repeat the heading in the first sentence below it.' },
    { label: 'Punctuation', rule: 'No em-dash asides in the middle of a sentence.' },
    { label: 'Names', rule: 'Clear is the co-op. ClearPath is the housing programme. It is the Clear protocol.' },
    { label: 'Never', rule: 'Call Clear a bank, publish a yield or rate, or say deposits are insured.' },
    { label: 'Illustrations', rule: 'Label an example figure right beside it, not in a footnote.' },
    { label: 'Place', rule: 'Inland Empire, California.' },
  ],
} as const;

/* ── Social and print ─────────────────────────────────────────────────── */
export const APPLICATIONS = {
  kicker: 'Social and print',
  heading: 'The same system, off the screen.',
  lede: 'Lead with one statement in Bricolage, support it with one line in Instrument, and let paper and ink do the rest.',
  social: [
    { label: 'Feed, square', value: '1080 × 1080' },
    { label: 'Feed, portrait', value: '1080 × 1350' },
    { label: 'Story and reel', value: '1080 × 1920' },
    { label: 'Link preview', value: '1200 × 630' },
    { label: 'X header', value: '1500 × 500' },
  ],
  socialRules: [
    'Keep a margin of 8% of the short edge on every side.',
    'On stories, keep text out of the top and bottom 14% — the app covers it.',
    'Body text no smaller than 28px on a 1080px canvas.',
    'One statement per graphic. If it needs a paragraph, it is a post, not an image.',
  ],
  print: [
    { label: 'Bleed', value: '3mm' },
    { label: 'Safe margin', value: '5mm' },
    { label: 'Smallest body', value: '9pt' },
    { label: 'Colour', value: 'CMYK, proofed' },
  ],
  printRules: [
    'Paper is a printed ground, not a stock colour. Flood it, or choose an uncoated stock close to it — bright white will not match.',
    'Use the outline mark from 15mm wide and the solid mark below that.',
    'Convert with the CMYK values here as a starting point, then check a proof before a full run.',
  ],
} as const;

/* ── Downloads ────────────────────────────────────────────────────────── */
export const DOWNLOADS = {
  kicker: 'Downloads',
  heading: 'Files, ready to use.',
  lede: 'Vector for anything that scales, PNG for anywhere a file upload is all you get.',
  groups: [
    {
      title: 'Mark',
      files: [
        { label: 'Mark, ink', format: 'SVG', href: '/brand/clear-mark-ink.svg', use: 'Light grounds' },
        { label: 'Mark, paper', format: 'SVG', href: '/brand/clear-mark-paper.svg', use: 'Dark grounds' },
        { label: 'Solid mark, ink', format: 'SVG', href: '/brand/clear-mark-solid-ink.svg', use: 'Small sizes, light' },
        { label: 'Solid mark, paper', format: 'SVG', href: '/brand/clear-mark-solid-paper.svg', use: 'Small sizes, dark' },
        { label: 'Mark, ink', format: 'PNG 1024', href: '/brand/clear-mark-ink.png', use: 'Transparent' },
        { label: 'Mark, paper', format: 'PNG 1024', href: '/brand/clear-mark-paper.png', use: 'Transparent' },
      ],
    },
    {
      title: 'Social',
      files: [
        { label: 'Avatar, ink ground', format: 'PNG 1080', href: '/brand/clear-avatar-ink.png', use: 'Profile picture' },
        { label: 'Avatar, paper ground', format: 'PNG 1080', href: '/brand/clear-avatar-paper.png', use: 'Profile picture' },
        { label: 'Link preview', format: 'PNG 1200×630', href: '/opengraph-image', use: 'Shared links' },
        { label: 'App icon', format: 'PNG 512', href: '/icon-512.png', use: 'Home screen' },
      ],
    },
  ],
  pending:
    'Not here yet: the lockup of mark and wordmark as outlined vector. The wordmark needs converting to shapes so it prints without the font installed. Until then, set it from the rules in the Logo section.',
} as const;
