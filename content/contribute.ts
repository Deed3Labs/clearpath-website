/* Contribute land — copy is final and lives here, never inline in JSX.
 *
 * /contribute is THE ACTION, for an individual with one property. /capital is
 * the vehicle, for someone evaluating rather than acting. That division has to
 * stay clean or the two pages cannibalise each other.
 *
 * Ported to the redesign mockup (reference/redesign/contribute.html): a hero
 * set on three lines with the selling-against-contributing offer under it,
 * four §721 steps on one rule, the downsides as a ruled list, three people,
 * and seven years against seven months.
 *
 * Naming: the instrument is "yield-bearing shares", not "units". On a site
 * where /housing calls a dwelling a unit, "units" read as housing rather than
 * as the thing you receive for contributing property. The full term appears
 * on first use and "shares" carries it thereafter. */

export const META = {
  title: 'Contribute land',
  description:
    'Contribute rental property or land to Clear Properties in exchange for yield-bearing shares under section 721, rather than selling it and paying tax on the whole gain this year.',
} as const;

/* The one worked example on the page: a property of this value, contributed,
   becomes this many shares (one per dollar). The offer bento and step 02 both
   read it, so the two can never disagree. */
export const PROPERTY_VALUE = 437000;

/* ── Hero ────────────────────────────────────────────────────────────────
   Three set lines from 700px up: what you do, what you keep, what you stop. */
export const HERO = {
  label: { kicker: 'Partners', title: 'Contribute land' },
  lines: ['Put the property in.', 'Keep the income.', 'Stop managing it.'],
  lede: 'If you own rental property or land you have been sitting on, you can contribute it to Clear Properties in exchange for yield-bearing shares.',
  primary: { href: '/join?as=land', label: 'Send us the property details' },
  ghost: { href: '#how', label: 'How it works' },
  facts: [
    { k: 'Tax when you contribute', v: 'None, §721', live: true },
    { k: 'What you receive', v: 'Shares, 1:1' },
    { k: 'The income', v: 'Keeps arriving' },
    { k: 'Tenants and repairs', v: 'Not yours' },
  ],
} as const;

/* The offer: one property, two outcomes. Selling draws a solid bar of what
   you keep beside a hatched bar of this year's tax; contributing draws the
   whole bar as shares. */
export const OFFER = {
  propLabel: 'Your property',
  sell: {
    who: 'Selling it',
    ck: 'A closing',
    keep: 'What you keep',
    tax: 'Tax, this year',
    legend: { keep: 'Cash after tax', tax: 'Recapture, capital gains, state tax' },
    big: 'Tax on the whole gain, this year.',
    body: 'Depreciation recapture, capital gains and state tax, all at once.',
  },
  give: {
    who: 'Contributing it',
    ck: 'Section 721',
    /* Follows the share count: "437,000 shares". */
    unit: 'shares',
    bar: 'All of it, as shares',
    legend: 'Yield-bearing shares, one for each dollar of value',
    big: 'Shares. The income keeps arriving.',
    body: 'Under section 721, contributing property to a partnership in exchange for an interest in it is not a taxable event.',
  },
  /* Stays near the top and stays plain. */
  note: 'We are not your tax adviser. Everything here is how the structure works, not advice about your situation. Bring your CPA to the second conversation and we will send them the documents.',
} as const;

/* ── 01 · How it works ───────────────────────────────────────────────────
   Four steps on one rule. Each is a headline, one short sentence, and the
   same three ruled rows, whose values arrive as the rule reaches the step.
   Step 02's values 'value' and 'shares' are filled from PROPERTY_VALUE. */
export const HOW = {
  n: '01',
  label: 'How it works',
  title: 'A contribution, not a sale.',
  line: 'Four steps, and none of them is a closing.',
  steps: [
    {
      n: '01',
      meta: '§721',
      title: 'You put the property in.',
      body: 'The deed goes into a nominee trust instead of to a buyer.',
      rows: [
        { k: 'Title', v: 'Nominee trust' },
        { k: 'Beneficiary', v: 'Clear Properties' },
        { k: 'Taxable event', v: 'None' },
      ],
    },
    {
      n: '02',
      meta: '1:1 by value',
      title: 'You receive shares.',
      body: 'One share for each dollar of value. No boot, no balancing mechanism.',
      rows: [
        { k: 'Property value', v: 'value' },
        { k: 'Shares issued', v: 'shares', live: true },
        { k: 'Boot', v: '$0' },
      ],
    },
    {
      n: '03',
      meta: 'Pro rata',
      title: 'The cash keeps arriving.',
      body: 'Rent is earned at the project, which pays its own costs first.',
      rows: [
        { k: 'Rent', v: 'At the project' },
        { k: 'Taxes, upkeep', v: 'Paid first' },
        { k: 'The rest', v: 'To every holder' },
      ],
    },
    {
      n: '04',
      meta: 'Same terms',
      title: 'Nobody goes first.',
      body: 'Clear Capital holds shares on the terms you do.',
      rows: [
        { k: 'Pool', v: 'The same one' },
        { k: 'Priority', v: 'None' },
        { k: 'Preferred return', v: 'None' },
      ],
    },
  ],
  foot: 'The agreement requires mandatory tax distributions, so you are never handed a K-1 for income you did not receive in cash.',
} as const;

/* ── 02 · The downsides ──────────────────────────────────────────────────
   /capital reuses this list VERBATIM and must not soften it for an
   institutional reader. It is exported from here and re-exported there, so
   "verbatim" is enforced by the module system rather than by remembering. */
export const DOWNSIDES = [
  { k: 'Liquidity', v: 'Shares are illiquid compared with cash.' },
  { k: 'Control', v: 'You do not control the properties.' },
  { k: 'Paperwork', v: 'You get a K-1, which arrives later than a 1099, and your accountant will charge for it.' },
  { k: 'Deferred tax', v: 'The deferred gain still exists, and comes due if you ever sell the shares.' },
  { k: 'Concentration', v: 'Risk moves from your one building to a fund. Usually better, but a change, not a removal.' },
] as const;

export const DOWNSIDES_SECTION = {
  n: '02',
  label: 'The downsides',
  title: 'The honest downsides.',
  line: 'Every one is a real cost of doing it this way.',
  who: 'Five costs',
  ck: 'Read before you sign',
  foot: 'We would rather you read these here than discover them after you sign.',
} as const;

/* ── 03 · Who this is for ────────────────────────────────────────────────
   Three people, three cells. Each leads with the sentence that tells a
   reader whether they are the person being described; the paragraph under it
   is held to three lines from 1100px up. */
export const WHO = {
  n: '03',
  label: 'Who this is for',
  title: 'Three people this is built for.',
  line: 'Each one is giving up something different, and getting the same thing back.',
  columns: [
    {
      who: 'Tired landlords',
      n: '01',
      line: 'You are done with tenants.',
      body: 'Rentals, ideally paid off, and no appetite left for 3 a.m. calls. Selling triggers the tax all at once. Contributing does not.',
    },
    {
      who: 'People holding raw land',
      n: '02',
      line: 'Pooled, it becomes scale.',
      body: 'A parcel you meant to build on. Alone it is hard to sell in a thin market. Pooled, it can be financed and developed.',
    },
    {
      who: 'Homeowners with a backyard',
      n: '03',
      line: 'Your yard, earning.',
      body: 'A ground lease, a removable unit and monthly income. You approve decisions, and Clear handles permitting.',
    },
  ],
  foot: 'Backyards are covered in full on the housing page.',
  more: { href: '/housing', label: 'How backyards work' },
} as const;

/* ── 04 · Held ───────────────────────────────────────────────────────────
   The thing most likely to save someone a wasted call, drawn as seven years
   of months against seven. */
export const HELD = {
  n: '04',
  label: 'One thing worth saying out loud',
  title: 'A contribution is designed to be held.',
  line: 'If you are looking to trade property every couple of years, this is the wrong vehicle, and we will tell you that on the first call.',
  why: {
    who: 'Why it has to be held',
    ck: 'Anti-abuse rules',
    body: 'The rules that make the deferral work also make swapping in and out every couple of years unworkable.',
  },
  win: { who: 'The window they turn on', ck: 'Not seven months', figure: '7 years' },
  strip: {
    short: { label: 'Seven months', months: 7 },
    long: { label: 'Seven years', months: 84 },
    unit: 'mo',
    /* The axis reads "Year 1, 2 … 7"; "Year" drops on a phone. */
    year: 'Year',
  },
  foot: {
    before: 'If you hold a portfolio rather than a property, or you are evaluating this on someone else’s behalf, ',
    link: { href: '/capital', label: 'Clear Capital' },
    after: ' sets out the structure.',
  },
  cta: { href: '/join?as=land', label: 'Send us the property details' },
} as const;
