/* Clear Capital — copy is final and lives here, never inline in JSX.
 *
 * This is a STRUCTURAL page: the reader is evaluating an entity, not deciding
 * where to live, so "the co-op holds the land and never sells it" is the
 * correct register here and must not be find-and-replaced into the
 * member-facing "held in common" voice used on Home, How it works and
 * Housing. Two registers, chosen by audience.
 *
 * Legal is the binding constraint on this page: no terms, no rate, no
 * projected return, no yield figure anywhere, and the "Nothing on this page
 * is an offer" notice sits in the hero, in full, where a reader meets it
 * before anything else.
 *
 * Ported to the redesign mockup (reference/redesign/capital.html): two boards
 * in the hero, three holders on one ground line, the same terms at any size,
 * four structural protections, the downsides plus the corridor, and what we
 * publish against what we will not. */

/* Naming: "yield-bearing shares", not "units" — see the note in ./contribute.
   It names the instrument, not a projection: distributions are pro rata out
   of what the project earns, and no rate, term or projected return appears
   anywhere on this page. */
export { DOWNSIDES } from './contribute';

export const META = {
  title: 'Clear Capital',
  description:
    'Clear Capital Holdings is the separate company through which investors and property contributors take part in the cooperative’s assets — and what stops it ending up on the opposite side of the members.',
} as const;

/* ── Hero ────────────────────────────────────────────────────────────────
   Two boards, which is the whole answer to "whose side are you on". */
export const HERO = {
  label: { kicker: 'Partners', title: 'Clear Capital' },
  lines: ['Outside money sits here.', 'Not on the members’ side.'],
  lede: 'Clear Capital Holdings is the company through which investors and property contributors take part in the cooperative’s assets.',
  primary: { href: '/join?as=land', label: 'Start a conversation' },
  ghost: { href: '#split', label: 'How it is split' },
  notice: {
    label: 'Not an offer',
    /* Legal. In the hero, in full, and not softened or paraphrased. */
    text: 'Nothing on this page is an offer. No terms, no rate, no subscription. This page describes how the structure is built; anything further happens in a private conversation and under the applicable exemption.',
  },
} as const;

/* Seats, in board order. `kind` draws the seat: a chair is ruled double, the
   neutral seat hatched, the open seat dashed, the investor seats cobalt. */
type Seat = { role: string; tag: string; kind?: 'chair' | 'neu' | 'open' | 'inv' };

const member = (tag: string): Seat => ({ role: 'Member', tag });

export const BOARDS = {
  coop: {
    who: 'The co-op board',
    ck: 'Elected by members',
    line: 'Member-only.',
    seats: [member('Chair'), ...Array.from({ length: 6 }, () => member('Elected'))] as Seat[],
    body: 'What protects a member is written here, and it is not up for negotiation with anyone outside the membership.',
  },
  holdings: {
    who: 'The Holdings board',
    ck: 'Clear Capital Holdings',
    line: 'Its own company. Its own board.',
    /* Order is fixed: a directly elected chair, two seats reserved for the
       co-op, a neutral seat named jointly, an open seat, two investor seats. */
    seats: [
      { role: 'Chair', tag: 'Elected', kind: 'chair' },
      { role: 'Co-op', tag: 'Reserved' },
      { role: 'Co-op', tag: 'Reserved' },
      { role: 'Neutral', tag: 'Joint', kind: 'neu' },
      { role: 'Open', tag: 'Free', kind: 'open' },
      { role: 'Investor', tag: 'Financial', kind: 'inv' },
      { role: 'Investor', tag: 'Financial', kind: 'inv' },
    ] as Seat[],
    body: 'Two investor seats, two reserved for the co-op, a neutral seat named jointly, one open seat, and a chair who is directly elected.',
  },
  foot: 'Neither board can quietly become the other, which is the point of there being two.',
  /* The co-op board's seven seats are a picture, not a bylaw. */
  footCk: 'Co-op seat count illustrative',
} as const;

/* ── 01 · The split ──────────────────────────────────────────────────────
   Three holders on one ground line, then the two balance sheets as a ledger
   of edges: one connects, two stop short. */
export const SPLIT = {
  n: '01',
  label: 'The split',
  title: 'The land is why this works for both sides.',
  line: 'Member equity accrues in the structure. Appreciation accrues to the land, which backs construction borrowing as the portfolio grows.',
  holders: [
    {
      who: 'Members hold',
      n: '01',
      draw: 'house',
      line: 'The structure.',
      body: 'Bought down through an Equity-Lease Participation Agreement, ending in a Clear Deed.',
    },
    {
      who: 'The co-op holds',
      n: '02',
      draw: 'land',
      line: 'The land.',
      body: 'Permanently. Selling it is a reserved matter that cannot pass without the co-op.',
    },
    {
      who: 'Contributors hold',
      n: '03',
      draw: 'shares',
      line: 'Shares.',
      body: 'Yield-bearing shares in Clear Properties, pro rata, on the same terms as everyone in the pool.',
    },
  ],
  backs: {
    who: 'Two balance sheets',
    ck: 'They do not touch',
    rows: [
      { from: 'The land', to: 'Construction borrowing', verdict: 'Backs', ok: true },
      { from: 'The land', to: 'Credit losses', verdict: 'Never', ok: false },
      { from: 'A member’s savings', to: 'Another member’s credit', verdict: 'Never', ok: false },
    ],
  },
} as const;

/* ── 02 · Contributions ──────────────────────────────────────────────────
   The same four terms at any size. The toggle moves the figures and the pool
   bar; every term row confirms it did not move. */
export type ScaleKey = 'one' | 'port';

export const CONTRIBUTIONS = {
  n: '02',
  label: 'Contributions',
  title: 'Not a sale, and not a fund raise.',
  line: 'Property comes in under section 721 for yield-bearing shares issued by value. Nothing is trued up with cash, so there is no boot.',
  seg: {
    label: 'Size of the contribution',
    options: [
      { value: 'one', label: 'One duplex' },
      { value: 'port', label: 'A portfolio' },
    ] as { value: ScaleKey; label: string }[],
  },
  /* The two sizes are pictures of the mechanism, labelled as such. `cc` is
     Clear Capital's share of the pool bar, in percent. */
  ck: 'Figures illustrative',
  scales: {
    one: { prop: 640000, name: 'One duplex, at appraised value', cc: 76 },
    port: { prop: 9200000, name: 'Fourteen properties, at appraised value', cc: 18 },
  } as Record<ScaleKey, { prop: number; name: string; cc: number }>,
  sum: {
    prop: 'Property in',
    shares: 'Shares issued',
    sharesNote: 'One for each dollar of value',
    pool: 'The pool',
    poolNote: 'Clear Capital’s position shrinks as more property comes in.',
  },
  /* Each slice drops to its short name when the full one does not fit. */
  pool: {
    cc: { full: 'Clear Capital', short: 'Clear Co.' },
    ct: { full: 'Contributed property', short: 'Contributed' },
  },
  same: 'Same',
  terms: [
    { label: 'Issued by', value: 'Value', desc: 'Contribute at appraised value, receive shares one-for-one against it.' },
    {
      label: 'Clear Capital’s own position',
      value: 'Same pool, no priority',
      desc: 'Exactly the terms every contributor gets. No preferred return, and no priority.',
    },
    {
      label: 'Distributions',
      value: 'Pro rata',
      desc: 'The project pays taxes, insurance, upkeep and management. The fund sets reserves, takes its fee and distributes the rest.',
    },
    {
      label: 'Tax distributions',
      value: 'Mandatory',
      desc: 'Required by the agreement, so no holder gets a K-1 for income they did not receive in cash.',
    },
  ],
  foot: 'The mechanics are identical at any size. What changes at scale is the diligence, not the structure.',
  more: { href: '/contribute', label: 'How a single-property contribution works' },
} as const;

/* ── 03 · Protections ────────────────────────────────────────────────────
   Four structural guards, each with a small figure. */
export const PROTECTIONS = {
  n: '03',
  label: 'Protections',
  title: 'Structural, not promises.',
  line: 'A promise is a policy, and a board reverses a policy in an afternoon. These are written where a future board cannot.',
  noPref: {
    who: 'No preferred return',
    ck: 'Anywhere in the stack',
    struck: ['Preferred return', 'Sponsor catch-up'],
    notInStack: 'Not in the stack',
    holder: { k: 'Every holder', small: 'Clear Capital included' },
    body: 'Including for the sponsor. There is no waterfall in which somebody is paid before you.',
  },
  reserved: {
    who: 'Reserved matters',
    ck: 'Five of them',
    items: [
      'Selling land',
      'Diluting members',
      'Amending the purpose',
      'Replacing the manager',
      'Related-party deals above a threshold',
    ],
    tag: 'Needs the co-op',
    body: 'None of the five can pass on a Holdings vote alone.',
  },
  board: {
    who: 'Board composition',
    ck: 'Fixed by kind',
    rows: [
      { k: 'Two reserved seats', v: 'Co-op class' },
      { k: 'The reserved matters', v: 'Co-op class' },
      { k: 'Two investor seats', v: 'Financial class' },
      { k: 'A neutral seat', v: 'Named jointly' },
      { k: 'The chair', v: 'Directly elected' },
    ],
    body: 'Investors hold two Holdings seats. The co-op board is elected by members and stays member-only.',
  },
  ledger: {
    who: 'The ledger is public',
    ck: 'Open source',
    /* The kinds of entry the public ledger carries, streamed in a loop while
       the cell is on screen. A picture of the ledger, not a feed. */
    events: [
      ['Balance', 'Updated'],
      ['Credit line', 'Drawn'],
      ['Title record', 'Recorded'],
      ['Distribution', 'Paid pro rata'],
      ['Credit line', 'Repaid'],
      ['Balance', 'Updated'],
      ['Title record', 'Transferred'],
      ['Reserve', 'Funded'],
    ] as [string, string][],
    ages: ['just now', '4s ago', '9s ago', '15s ago', '22s ago'],
    body: 'Balances, credit lines and title records run on contracts held by an ownerless foundation.',
  },
} as const;

/* ── 04 · The downsides ──────────────────────────────────────────────────
   DOWNSIDES is re-exported from ./contribute, verbatim and unsoftened, and
   the corridor is the one more an underwriter has to price. */
export const DOWNSIDES_SECTION = {
  n: '04',
  label: 'The downsides',
  title: 'The honest downsides.',
  line: 'The same five as a single property, and none is softened because the contribution is larger.',
  who: 'Five costs, and one more',
  ck: 'Read before you sign',
  other: {
    k: 'One corridor',
    v: 'Early cohorts sit in one corridor by design, because that is what makes the merchant and housing sides compound. Anyone underwriting this should price that.',
  },
} as const;

/* ── 05 · Next ───────────────────────────────────────────────────────────
   No terms, no rates, no projected returns, and that refusal is itself the
   argument. The right-hand cell draws each one redacted. */
export const NEXT = {
  n: '05',
  label: 'Next',
  title: 'We do not publish terms, rates or projected returns.',
  line: 'You should be sceptical of a housing cooperative that does.',
  get: {
    who: 'What you get from us',
    ck: 'In a private conversation',
    rows: [
      { k: 'The structure', v: 'Walked through with you' },
      { k: 'The documents', v: 'Sent to your advisers' },
      { k: 'Your CPA and counsel', v: 'Every question answered' },
    ],
  },
  withheld: {
    who: 'What you will not find here',
    ck: 'By design',
    rows: ['Rate', 'Terms', 'Projected return'],
    redacted: 'Not published',
  },
  note: 'We are not your tax or legal advisers, and nothing here is advice about your situation.',
  cta: { href: '/join?as=land', label: 'Start a conversation' },
} as const;
