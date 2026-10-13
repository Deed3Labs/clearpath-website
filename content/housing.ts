/* Housing. Copy lives here, never inline in JSX. The mockup
   (reference/redesign/housing.html) is the spec: the land taken out of the
   price and the savings screen where the home path lives, then the split,
   the numbers, the monthly bill, the homes, backyards, and the gate. Every
   housing figure is a first-cohort illustration and is labelled as one. */

export const META = {
  title: 'Housing',
  description:
    'The land under a Clear community is held in common by its members and is never sold. What you buy, pay down and take title to is the house — cost plus fifteen per cent, and we show the cost.',
} as const;

export const HERO = {
  label: { kicker: 'ClearPath', title: 'Housing' },
  lines: ['Take the land out of the price', 'and the price changes.'],
  lede: 'The land under a Clear community is held in common by its members and is never sold. What you buy is the house.',
  primary: { href: '/join', label: 'Start saving' },
  ghost: { href: '#numbers', label: 'See the numbers' },
  facts: [
    { k: 'What you pay for the house', v: 'Cost + 15%', live: true },
    { k: 'The land', v: 'Never sold' },
    { k: 'Income test', v: 'None' },
    { k: 'The gate to your deed', v: '15,000 credits' },
  ],
  stage: { caption: 'Your home path', sample: 'Sample account' },
} as const;

/* The member app's Savings screen, where the home path lives: a sample
   account, labelled "Sample account" under the device. */
export const SAVINGS_APP = {
  brand: 'Clear',
  tabs: ['Home', 'Savings', 'Earn', 'Send', 'Activity', 'Card'],
  phoneTabs: ['Home', 'Savings', 'Earn', 'Card'],
  initials: 'DR',
  label: 'Savings',
  value: '$3,000.00',
  sub: '$1,500.00 in cash · 1,500 credits, matched one-for-one',
  phoneSub: '$1,500.00 cash · 1,500 credits',
  actions: ['Auto-save', 'Move money'],
  path: {
    label: 'Your home path',
    track: 'On track for December 2027',
    phoneTrack: 'Dec 2027',
    credits: '1,500',
    of: 'of 15,000 credits',
    /* The five protections, in the order they unlock. `fill` is how much of
       each rung the sample account has: two reached, the third begun. */
    ladder: [
      { at: 'DAY ONE', phoneAt: 'DAY 1', name: 'Cycle assurance', phone: 'Cycle', fill: 1 },
      { at: '1,500', phoneAt: '1,500', name: 'Home repair assurance', phone: 'Repair', fill: 1 },
      { at: '4,000', phoneAt: '4,000', name: 'Income assurance', phone: 'Income', fill: 0.08 },
      { at: '8,000', phoneAt: '8,000', name: 'Deposit assurance', phone: 'Deposit', fill: 0 },
      { at: '15,000', phoneAt: '15,000', name: 'Rent assurance and your Clear Deed', phone: 'Your deed', fill: 0 },
    ],
    next: ['Next unlock · ', 'Income assurance'],
    phoneNext: ['Next · ', 'Income assurance'],
    togo: '2,500 credits to go',
    phoneTogo: '2,500 to go',
    saving: ['Saving ', '$1,000.00 a month', ' · matched for 36 months'],
    change: 'Change',
  },
  hold: {
    label: 'What you hold',
    value: '$3,000.00',
    rows: [
      { k: 'Cash (CLRUSD)', phone: 'Cash (CLRUSD)', v: '$1,500.00', tone: 'fg' },
      { k: 'Vested credits', phone: 'Vested', v: '$1,000', tone: 'ok' },
      { k: 'Vesting, about 30 days', phone: 'Vesting', v: '$500', tone: 'warn' },
    ],
    adds: ['Adds ', '$1,500', ' to your credit line'],
    details: 'Details',
  },
  protections: {
    label: 'Protections',
    note: 'Nothing on this list is ever paid back',
    rows: [
      { k: 'Cycle assurance', v: 'Two grace cycles a year', chip: 'On', on: true },
      { k: 'Home repair', v: 'Covered by the co-op', chip: 'On', on: true },
      { k: 'Income', v: 'Your limit holds a cycle', chip: '4,000', on: false },
      { k: 'Deposit', v: 'Paid to your landlord', chip: '8,000', on: false },
      { k: 'Rent', v: 'Two months on job loss', chip: '15,000', on: false },
    ],
  },
} as const;

/* ── 01 · Two things, kept apart ──────────────────────────────────────── */
export const SPLIT = {
  n: '01',
  label: 'Two things, kept apart',
  title: 'The land and the house are not the same purchase.',
  line: "Most of a home's price is the ground under it. Separate the two, and what is left has a cost you can point at.",
  land: {
    who: 'The land',
    k: 'Held by every member',
    plat: 'One parcel · eight homes · held by every member',
    big: 'Held in common. Never sold.',
    text: 'Appreciation stays in the commons and every member holds a share of it, so members and investors are never reaching for the same dollar.',
  },
  house: {
    who: 'The house',
    k: 'Yours to hold title to',
    plat: 'The house you hold title to · 33 × 28 ft',
    yours: 'Yours',
    big: 'Yours, at cost plus 15%.',
    text: 'Unlike land, a house has a cost you can point at. It is also why the price sits below market with no subsidy, no covenant and no income test.',
  },
  note: 'ClearPath is the housing program of the Clear cooperative.',
} as const;

/* ── 02 · The numbers, on ink ─────────────────────────────────────────── */
export const NUMBERS = {
  n: '02',
  label: 'The numbers',
  title: 'Cost plus fifteen per cent, and we show the cost.',
  line: 'This is not affordable housing. No income restrictions and no qualifying bands. Mixing incomes inside one neighbourhood is the point, not a compromise.',
  /* `w` is each figure against the comparable home, as a bar width. */
  cells: [
    { key: 'build', who: 'To build the structure', k: 'First cohort', fig: '$289,099', w: 64.24, note: 'Inland Empire, the house alone.' },
    { key: 'member', who: 'What a member pays', k: 'Cost + 15%', fig: '$332,464', w: 73.88, note: 'The build cost plus fifteen per cent, and nothing else.' },
    { key: 'market', who: 'A comparable home', k: 'Open market', fig: '~$450,000', w: 100, note: 'Same corridor, land included.' },
  ],
  below: '~$117,500',
  belowText: 'Below a comparable home, with no subsidy behind it. First-cohort figures for the Inland Empire, shown as illustrations of how the model works rather than quotes, offers or predictions.',
} as const;

/* ── 03 · Every month ─────────────────────────────────────────────────────
   The bill's two lines, kept apart, and what the first one becomes. The
   contribution slides from $500 to $1,500; "All in" is that plus $2,000 of
   community fee and utilities, so it runs from $2,500 to $3,500. The
   comparison is a comparable single-family mortgage, not a rental. */
export const MONTHLY = {
  n: '03',
  label: 'Every month',
  title: 'Two lines on the bill, and the app keeps them apart.',
  line: 'One of them ends up being yours and one of them does not, so they are never shown to you as a single number.',
  bill: { who: 'Your monthly bill', k: 'Two lines, never one' },
  equity: { k: 'Equity contribution', yours: 'Yours', note: 'Straight to your balance. This is the part you keep.' },
  fee: { k: 'Community fee', v: '~$850', note: 'Property taxes, insurance and shared costs. It moves when those move.' },
  utilities: { k: 'Utilities', v: 'Variable', note: 'Electric, gas, water and internet. They move with what you use.' },
  min: 500,
  max: 1500,
  step: 50,
  start: 500,
  /* Community fee plus utilities, added to the contribution for "All in". */
  rest: 2000,
  rangeLabel: 'Equity contribution each month',
  ends: ['From $500', 'Drag your contribution', '$1,500'],
  becomes: { who: 'What the first line becomes', k: 'Five years' },
  kept: 'Yours after five years',
  years: 5,
  axis: ['Year 1', '2', '3', '4', '5'],
  allIn: 'All in, including utilities',
  compare: { k: 'A comparable single-family mortgage', v: '$4,500–5,500' },
  note: 'First-cohort illustrations for the Inland Empire. Not quotes, offers or predictions.',
} as const;

/* ── 04 · The homes ───────────────────────────────────────────────────────
   A drawn site plan, and the three parts of one house beside it. The plan
   walks the three zones until you point at one. */
export const HOMES = {
  n: '04',
  label: 'The homes',
  title: 'A porch at both ends.',
  line: 'Permitted, code-compliant California dwellings built from panelised kits and finished by local trades. The community owns the solar and storage, and residents buy their power from it.',
  planLabel:
    'Site plan of one lot: a covered front porch at the street, a two bed two bath house with the living room at the back, a rear porch and patio onto an L-shaped yard, and a workshop off the perimeter drive.',
  /* Room and zone names drawn on the plan. */
  plan: {
    bed1: 'Bed 1',
    bed2: 'Bed 2',
    bedSize: '11 × 12',
    parlor: 'Parlor',
    bath: 'Bath',
    living: 'Living',
    livingSize: '22 × 11',
    kitchen: 'Kitchen',
    front: 'Front porch',
    rear: 'Rear porch',
    patio: 'Patio',
    yard: 'Yard',
    workshop: 'Workshop',
    workshopSize: '20 × 16',
    drive: 'Perimeter drive',
    street: 'Street',
    width: `28'-0"`,
    depth: `33'-0"`,
    lot: `120'-0" lot`,
    scale: ['0', '5', '10', '20', 'ft'],
    north: 'N',
    caption: 'Site plan · 2 bed, 2 bath · 924 sq ft · illustrative',
  },
  /* Seconds each zone holds while the plan walks them. */
  walk: 2.8,
  zones: [
    { n: '01', title: 'The front is arrival and neighbours.', text: 'A covered porch on every home, set at the street. It is the half of the house your neighbours meet.', fig: '1–3 bed', k: 'the unit mix inside every community' },
    { n: '02', title: 'The back is where you actually live.', text: 'A rear porch onto a patio and yard, proportioned so the smallest home has the ratio of the largest.', fig: '900–950', k: 'square feet at the smallest, two bed and two bath' },
    { n: '03', title: 'The garage is a workshop, set back.', text: 'Behind and to the side, off a perimeter drive that wraps the yard into an L.', fig: '1.5 car', k: 'on every home, off the perimeter drive' },
  ],
} as const;

/* ── 05 · Backyards, on ink ───────────────────────────────────────────── */
export const BACKYARDS = {
  n: '05',
  label: 'Before the communities',
  title: 'Backyards first, because they are available now.',
  line: 'A master-planned community is an eighteen-to-thirty-six month problem. A backyard is not. The co-op leases them from homeowners and places relocatable studios and one-bedrooms on them.',
  cells: [
    { key: 'owner', who: 'You own the backyard', n: '01', big: 'Income, and a veto.', sub: 'a ground lease on the back of your lot', text: 'You stay passive. Clear handles permitting and the leasing, and every decision on the unit comes to you to approve or decline.' },
    { key: 'unit', who: 'The unit itself', n: '02', big: '450–650', sub: 'square feet, one open volume with high ceilings', text: 'Built to come apart and move, so when a lease ends the structure goes somewhere else and the next placement costs less.' },
    { key: 'renter', who: 'Whoever lives in it', n: '03', big: 'One person.', sub: 'the household almost nothing gets built for', text: 'Renting alone is close to impossible without roommates, and almost nothing gets built for the person trying to do it anyway.' },
  ],
  foot: 'Own a lot with real separation between the house and the back fence? We would like to talk about a ground lease.',
  more: { href: '/contribute', label: 'How contributions work' },
} as const;

/* ── 06 · The gate ────────────────────────────────────────────────────────
   Five unlocks on one rule; the credits count to the deed as it fills. */
export const GATE = {
  n: '06',
  label: 'The gate',
  title: 'The path to a deed is visible from your first deposit.',
  line: 'Your deposit is your membership share. Every gate on the way unlocks something real, and none of it is paid back.',
  head: 'You sign, and the deed is yours.',
  credits: 15000,
  cap: 'equity credits, and you sign for the deed to your home',
  steps: [
    { at: 'Day one', name: 'Cycle assurance', text: 'Two grace cycles a year, from your first deposit.' },
    { at: '1,500', name: 'Home repair assurance', text: 'Repairs to the home you live in, covered by the co-op.' },
    { at: '4,000', name: 'Income assurance', text: 'If your income drops, your limit holds and credits keep vesting.' },
    { at: '8,000', name: 'Deposit assurance', text: 'The co-op covers a deposit on a new place, paid to the landlord.' },
    { at: '15,000', name: 'Rent assurance and your deed', text: "Two months' rent on job loss, and you sign your ELPA and your Clear Deed." },
  ],
  foot: 'The land stays in the commons, and the house is yours to hold title to outright. You can see where you are, and the date you are on track for, from the screen where you save.',
  primary: { href: '/join', label: 'Start saving' },
} as const;

export const CLOSE = {
  title: 'Your money, kept in the neighborhood.',
  line: 'One member, one vote. Building in Inland Empire, California.',
  primary: { href: '/join', label: 'Join the waitlist' },
  ghost: { href: '/contribute', label: 'Contribute land' },
} as const;
