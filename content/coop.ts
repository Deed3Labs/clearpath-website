/* The co-op — copy is final and lives here, never inline in JSX.
 *
 * Structural page: the reader is evaluating an entity, so "the co-op holds the
 * land and never sells it" is the correct register here, as on /capital.
 *
 * Ported to the redesign mockup (reference/redesign/coop.html). The hero puts
 * one sentence to the same vote twice — written as a policy it passes, written
 * as a reserved matter it is blocked. Then the org chart as the centrepiece,
 * governance, the protocol fork, and who is building it. */

export const META = {
  title: 'The co-op',
  description:
    'How Clear is put together: two balance sheets that never touch, the reserved matters a future board cannot reverse, and an ownerless foundation holding the protocol.',
} as const;

/* ── Hero ────────────────────────────────────────────────────────────────
   "Bank" is a restricted term and Clear is not one — the footer legal block
   says so on every page. "Lender" is accurate and keeps the sentence's
   incongruity: the thing that lends is the thing that builds. */
export const HERO = {
  label: { kicker: 'Structure', title: 'The co-op' },
  lines: ['A lender that builds houses.', 'Owned by the people who use it.'],
  lede: 'Your deposit is your share, every member has one vote, and the promises that matter are written where a future board cannot quietly reverse them.',
  primary: { href: '/join', label: 'Join the waitlist' },
  ghost: { href: '#structure', label: 'See the structure' },
  facts: [
    { k: 'Your deposit', v: 'Your share' },
    { k: 'Votes per member', v: 'One' },
    { k: 'Reserved matters', v: 'Five' },
    { k: 'The protocol', v: 'Owned by nobody' },
  ],
} as const;

/* The same sentence, written two ways, put to the same seven-seat vote. Four
   for, three against: a policy passes and is struck; the reserved matter is
   blocked, because it cannot pass without the co-op. `y` is for, `n` against,
   in seat order. */
export const VOTE = {
  quote: '“We never sell the land.”',
  motion: 'Motion to sell',
  votes: ['y', 'n', 'y', 'y', 'n', 'n', 'y'] as const,
  out: { waiting: 'Awaiting vote', voting: 'Voting', passes: 'Passes, 4 to 3', blocked: 'Blocked' },
  policy: {
    who: 'Written as a policy',
    ck: 'Set by a board',
    title: 'A board reverses it in an afternoon.',
    body: 'Policies are what a board sets, and what the next board is free to unset.',
  },
  reserved: {
    who: 'Written as a reserved matter',
    ck: 'Set in the structure',
    title: 'It cannot pass without the co-op.',
    body: 'No matter who else joins the board. The only kind of protection that survives the people who wrote it.',
  },
} as const;

/* ── 01 · Structure ──────────────────────────────────────────────────────
   The org chart's contents, so the drawing, its detail row and its text
   alternative are generated from one source and cannot drift apart. `bs`
   puts a box on a balance sheet in that view: `mon` money, `hou` housing. */
export type OrgNode = { id: string; name: string; note: string; what: string; by?: string; bs?: 'mon' | 'hou' };

export const STRUCTURE = {
  n: '01',
  label: 'Structure',
  title: 'Two balance sheets that never touch.',
  line: 'Housing on one side: land and contributed property. Money on the other: deposits, credit and loans.',
  seg: {
    label: 'View',
    options: [
      { value: 'own', label: 'Ownership' },
      { value: 'bs', label: 'Balance sheets' },
    ] as { value: 'own' | 'bs'; label: string }[],
  },
  legend: { owns: 'Owns', contract: 'Contract', ownerless: 'Ownerless', money: 'Money', housing: 'Housing' },
  root: {
    id: 'coop',
    name: 'The co-op',
    note: 'members, one member one vote',
    by: 'Owned by its members',
    what: 'One member, one vote. It owns everything in the tree except the foundation.',
  } as OrgNode,
  /* ClearLabs is the last child, beside the foundation it contracts with. */
  children: [
    { id: 'prog', name: 'Program entity', note: 'accounts, cards, payments', bs: 'mon', what: 'Accounts, cards and payments. Member money sits here, on the money side.' },
    { id: 'dtc', name: 'Deed & Title Co', note: 'records, administration', what: 'Records and administration for deeds and title.' },
    { id: 'hold', name: 'Clear Capital Holdings', note: 'where outside investors sit', what: 'A separate company with its own board, and the only place outside investors sit.' },
    { id: 'labs', name: 'ClearLabs', note: 'builds the protocol', what: 'Builds the protocol, and is paid by the foundation to maintain it.' },
  ] as OrgNode[],
  /* Sit under Clear Capital Holdings. */
  holdingsChildren: [
    { id: 'lend', name: 'Clear Lending', note: 'funds the credit book', bs: 'mon', what: 'Funds the credit book. The money side, and it never touches the land.' },
    { id: 'prop', name: 'Clear Properties', note: 'contributed property', bs: 'hou', what: 'Holds contributed property. The housing side, and it never backs a credit loss.' },
  ] as OrgNode[],
  /* Outside the ownership tree. A dashed outline means ownerless and nothing
     else — this is the only dashed box in the drawing. */
  foundation: {
    id: 'found',
    name: 'Protocol foundation',
    note: 'ownerless, holds the source',
    by: 'Owned by nobody',
    what: 'Holds the source, and contracts ClearLabs to maintain it.',
  } as OrgNode,
  contractLabel: 'contracts ClearLabs to maintain it',
  /* The seam between Clear Lending and Clear Properties, in the balance view. */
  seam: 'never touch',
  detail: {
    selected: 'Selected',
    /* "Owned by the co-op", "Owned by Clear Capital Holdings". */
    ownedBy: 'Owned by',
    more: { href: '/capital', label: 'How outside capital enters' },
  },
  /* The text alternative's wording around the node names. */
  alt: { owns: 'Owns', outside: 'Outside the ownership tree' },
  foot: [
    'Members hold no shares in Clear Capital Holdings. It is a separate company with its own board.',
    'Land backstops construction borrowing and never credit losses. A member’s savings never fund another member’s credit.',
  ],
} as const;

/* ── 02 · Governance ─────────────────────────────────────────────────────
   Three levels and one fraction, then the five things nobody decides alone.
   The balances are a picture of "votes do not scale with money". */
export const GOVERNANCE = {
  n: '02',
  label: 'Governance',
  title: 'Who decides what.',
  line: 'One vote each, councils where people actually live, and a third of the board delegated from them.',
  members: {
    who: 'Members',
    ck: 'Not by balance',
    line: 'One vote each.',
    head: { balance: 'Balance', votes: 'Votes' },
    /* Bar width in px beside each balance. */
    rows: [
      { balance: 240, bar: 14 },
      { balance: 3100, bar: 46 },
      { balance: 12800, bar: 110 },
    ],
    body: 'Your deposit makes you an owner. It does not make you a bigger one.',
  },
  councils: {
    who: 'Regional councils',
    ck: 'Per community',
    line: 'Residents govern their own place.',
    /* Residents per council, the first of each being its chair. */
    communities: [
      { label: 'Community 1', n: 9 },
      { label: 'Community 2', n: 6 },
      { label: 'Community 3', n: 12 },
    ],
    body: 'From outside it looks like an HOA. It is not one. Each council chair goes up to the board.',
  },
  board: {
    who: 'Delegate assembly',
    ck: 'A fraction, not a number',
    line: 'One third of the board.',
    sizeLabel: 'Board size',
    sizes: [6, 9, 12, 15],
    start: 9,
    /* "3 of 9 seats delegated from councils", the count in cobalt. */
    capOf: 'of',
    capTail: 'seats delegated from councils',
    body: 'Each community delegates its council chair. Written as a fraction so it holds at any board size.',
  },
  reserved: {
    who: 'Five reserved matters',
    ck: 'None pass without the co-op',
    items: [
      'Selling land',
      'Diluting members',
      'Amending the purpose',
      'Replacing the manager',
      'Related-party deals above a threshold',
    ],
  },
} as const;

/* ── 03 · The protocol ───────────────────────────────────────────────────
   A fork you can actually take, drawn as one main line and a branch. */
export const PROTOCOL = {
  n: '03',
  label: 'The protocol',
  title: 'Control is unnecessary when exit is credible.',
  line: 'The ledger, the credit issuers and the deed and title records run on open-source contracts held by a foundation nobody owns.',
  fork: {
    title: 'The protocol, held by a foundation nobody owns',
    titleNarrow: 'The protocol, held by nobody',
    labs: 'ClearLabs',
    anyone: 'Anyone else',
    fork: 'fork',
    branch: 'The co-op’s fork, if governance diverged',
    branchNarrow: ['The co-op’s fork,', 'if governance diverged'],
  },
  cells: [
    {
      who: 'Who maintains it',
      ck: 'Under contract',
      line: 'ClearLabs, and not only ClearLabs.',
      body: 'Paid to maintain the contracts today, and deliberately not the only party that could be.',
    },
    {
      who: 'If governance diverged',
      ck: 'A right and a capability',
      line: 'The co-op can fork the code.',
      body: 'It already funds the maintainer, so it has the capability and not just the right.',
    },
  ],
  source: { href: 'https://github.com/Deed3Labs/Protocol-Contracts', label: 'github.com/Deed3Labs/Protocol-Contracts', license: 'AGPL-3.0' },
} as const;

/* ── 04 · Who ────────────────────────────────────────────────────────────
   Small, local, and four open seats. */
export const WHO = {
  n: '04',
  label: 'Who',
  title: 'Small, local, and honest about it.',
  line: 'Built out of the Inland Empire by a very small team, starting with a handful of shops in one corridor rather than a launch.',
  progress: {
    who: 'In progress',
    ck: 'Since the design work started',
    year: 2017,
    /* The count runs down to the year from this one. */
    countFrom: 2026,
    rows: [
      { k: 'The credit waterfall', v: 'Built' },
      { k: 'The entity structure', v: 'Designed' },
      { k: 'The protocol', v: 'Open source' },
    ],
    body: 'The year the design work started, on the three pieces everything else rests on.',
  },
  corridor: {
    who: 'Why a corridor',
    ck: 'Density over reach',
    line: 'Ten merchants a mile apart compound.',
    maps: [
      { k: 'One corridor', v: 'Compounds' },
      { k: 'The county', v: 'Does not' },
    ],
    body: 'Ten across the county do not. What is new is that the first product is small enough to actually ship.',
  },
  hire: {
    /* The count is exact — one lead, one engineer, two advisers. */
    who: 'We are looking for four people',
    ck: 'Equity-only at this stage',
    rows: [
      { n: '1', role: 'A partnerships lead', area: 'Shops and land' },
      { n: '1', role: 'A protocol engineer', area: 'The contracts' },
      { n: '2', role: 'Advisers who know real estate and banking', area: 'Both sides' },
    ],
    note: 'We say equity-only in the first conversation rather than the fourth.',
    cta: { href: '/join?as=work', label: 'Get in touch' },
  },
} as const;
