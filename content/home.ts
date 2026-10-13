/* Home. Copy lives here, never inline in JSX. The mockup
   (reference/redesign/home.html) is the spec: a hero with the member app's
   Home screen, then five sections, each one crafted figure — the renting
   comparison paid in by scroll, the three-phase path on one rule, the
   counter hand-off you can run, what exists today, and the public ledger. */

export const HERO = {
  /* One sentence, set on two lines from 700px up and broken after "kept":
     the second line is the place the money stays — and "your" makes it the
     reader's neighbourhood rather than a general one. `headline` is the same
     sentence whole, for the metadata and the link-preview image
     (app/layout.tsx, app/opengraph-image.tsx). */
  headline: 'Your money kept in your neighborhood.',
  lines: ['Your money kept', 'in your neighborhood.'],
  /* What Clear is, then the four things it does, in the order the page
     covers them. Doubles as the meta and link-preview description, so it has
     to read on its own. "Toward a home of your own", not "the home you live
     in": equity is portable, and title comes after the gate. */
  lede: 'Clear is a member-owned cooperative. Save with us, open a credit line, pay local shops over time, and put your rent toward a home of your own.',
  primary: { href: '/join', label: 'Join the waitlist' },
  ghost: { href: '/shops', label: 'Bring Clear to your shop' },
  /* Three facts, each with what kind of fact it is. */
  facts: [
    { k: 'Local money, local returns', v: 'Co-op' },
    { k: 'One member, one vote', v: 'Governance' },
    { k: 'Inland Empire, California', v: 'Building' },
  ],
  stage: { caption: 'The member app', sample: 'Sample account' },
} as const;

/* The member app's Home screen, drawn as real UI from the live app
   (demo.useclear.org): the balance first, then the cycle card, the temporary
   slot, and the four-block slab. A sample account — every figure here is a
   picture of the product, labelled "Sample account" under the device. The
   phone canvas leaves out the action buttons under the balance, as the app's
   phone layout does. */
export const MEMBER_APP = {
  brand: 'Clear',
  tabs: ['Home', 'Savings', 'Earn', 'Send', 'Activity', 'Card'],
  phoneTabs: ['Home', 'Savings', 'Earn', 'Card'],
  initials: 'DR',
  balance: {
    label: 'Available to spend',
    value: '$5,718.42',
    sub: '$2,318.42 cash · $0.00 used · $3,400.00 left',
    actions: ['Add money', 'Send', 'Save', 'Pay'],
  },
  cycle: {
    label: 'To clear this cycle',
    amount: '$157.50',
    days: '9',
    daysLabel: 'days left',
    status: 'Your deposit covers it',
    detail: 'Rivera Auto Glass, 3 of 4 · clears October 21',
    phoneDetail: 'Clears October 21',
    action: 'Repay early',
  },
  slot: { label: 'Activate your card', action: 'Activate' },
  credit: {
    label: 'Credit used',
    value: '$0',
    of: 'of $3,400',
    rows: [
      ['Savings (CLRUSD) · free', '$1,500 · not drawn'],
      ['Assets · 0.75% / cycle', 'not added'],
      ['Income · 1.5% / cycle', '$1,900 · not drawn'],
      ['Clear Boost™ · 3% / cycle', 'not added'],
    ],
    /* The phone shows the two lines that are drawing. */
    phoneRows: [0, 2],
    action: 'Limit breakdown',
  },
  spendable: {
    label: 'Spendable',
    value: '$2,318.42',
    rows: [
      ['Card and payments', '$2,133.43'],
      ['Ready to allocate', '$184.99'],
    ],
    moves: ['Savings', 'Earn', 'Back to cash'],
    deposit: 'Direct deposit on',
    action: 'Details',
  },
  plans: {
    label: 'Term plans',
    value: '$315.00',
    of: 'of $3,000.00',
    open: { name: 'Rivera Auto Glass', value: '$315.00', detail: 'Split in 4 · $157.50 a cycle · ', cleared: '50% cleared', rate: ' · 2% / cycle' },
    cash: { name: 'Clear Cash™', lock: 'Locked', detail: 'Unlocks after six clean cycles · 2.5% / cycle' },
    homeRule: 'Your home · outside this limit',
    home: { name: 'ELPA — buy a home', lock: 'Locked', detail: '1,500 of 15,000 credits' },
    limit: ['Limit ', '$850.00/cycle'],
    from: ['Clears from ', 'Chase 4471'],
  },
  savings: {
    label: 'Savings',
    value: '$3,000.00',
    rows: [
      ['Cash (CLRUSD)', '$1,500.00', 'fg'],
      ['Vested', '$1,000', 'ok'],
      ['Vesting', '$500', 'warn'],
    ],
    credits: '1,500 of 15,000 credits',
  },
} as const;

/* ── 01 · If you rent today ───────────────────────────────────────────────
   Two columns on one clock: renting on the left, inside Clear on the right,
   and scrolling pays the months into both. The figures are an illustration
   of the model on a two-bedroom, labelled as one under the bento. */
export const GAP = {
  n: '01',
  label: 'If you rent today',
  title: 'Your rent is making someone else rich.',
  line: '$2,350 a month inside Clear, against $2,520 in rent. Most of it stays yours.',
  more: { href: '/housing', label: 'How the housing math works' },
  /* The bento's text alternative: the bars are aria-hidden. */
  summary:
    'Five years of payments. Renting at $2,520 a month: $151,200 paid out, $0 kept. Inside Clear at $2,350 a month: $141,000 paid in, $90,000 credited to your equity balance.',
  months: 60,
  keepLabel: 'Yours to keep',
  axis: ['Year 1', '2', '3', '4', '5'],
  rent: {
    who: 'Renting',
    monthly: 2520,
    rate: '$2,520 a month',
    legend: [{ key: 'gone', label: '$2,520 to the landlord' }],
    paidLabel: 'Paid out',
  },
  clear: {
    who: 'Inside Clear',
    monthly: 2350,
    /* Of each $2,350, the part credited to your equity. */
    equity: 1500,
    rate: '$2,350 a month',
    legend: [
      { key: 'keep', label: '$1,500 to your equity' },
      { key: 'fee', label: '$850 community fee' },
    ],
    paidLabel: 'Paid in',
  },
  month: ['Month ', ' of '],
  note: 'Two-bedroom, Inland Empire. Illustration, not a quote.',
} as const;

/* ── 02 · Take the ClearPath ──────────────────────────────────────────────
   Three phases on one rule. Each shows the thing a member sees at that gate,
   not a paragraph about it. */
export const PATH = {
  n: '02',
  label: 'Take the ClearPath',
  title: 'Renter, owner, earner.',
  line: 'Three phases, each with a gate you can see from your first day.',
  more: { href: '/housing', label: 'How ClearPath works' },
  gateLabel: 'The gate',
  renter: {
    who: 'Renter',
    n: '01',
    title: 'You rent, and save at the same time.',
    credits: 15000,
    creditsLabel: 'credits',
    /* Where the protections unlock on the way to the gate. */
    marks: [1500, 4000, 8000],
    caption: 'Every dollar saved is matched in credits. Protections unlock on the way.',
    gate: '15,000 credits',
  },
  owner: {
    who: 'Owner',
    n: '02',
    title: 'You own the house. The land is held in common.',
    rows: [
      { k: 'Your ELPA', v: 'Signed' },
      { k: 'Your Clear Deed', v: 'Signed' },
    ],
    caption: 'The financing, then the title, recorded on the Deed Protocol.',
    gate: 'Two signatures',
  },
  earner: {
    who: 'Earner',
    n: '03',
    title: 'You redeem it, and the equity travels.',
    rows: ['Move to another Clear home', 'Recontribute it to Clear Capital', 'Cash out at a fair, stable number'],
    gate: 'Portable',
  },
} as const;

/* ── 03 · The counter ─────────────────────────────────────────────────────
   Two columns, one hand-off. The shop keys in the charge and shows a code;
   the turn passes across the counter to your phone, where you pick the split
   and approve, and comes back. A sample charge, run on the real terms. */
export const COUNTER = {
  n: '03',
  label: 'If you run a shop, or shop at one',
  title: 'Whichever side of the counter you are on.',
  line: 'The shop keys in the charge and shows a code. You pick how to clear it on your own phone. Try it.',
  links: [
    { href: '/shops', label: 'For shops' },
    { href: '/how', label: 'How the member side works' },
  ],
  shop: {
    who: 'The shop',
    device: 'Counter tablet',
    /* What the header says at each of the side's three steps. */
    steps: ['Enter the charge', 'Show the code', 'Paid'],
    ticket: "Mike's Tire · ticket 2291",
    amount: 940,
    memo: 'Front pads and rotors',
    fee: 'Clear keeps 2.5%',
    net: 'Paid to the shop, net-30',
    showCode: 'Show the code',
    codeCap: 'Scan it with your own phone. A new customer joins from this same code.',
    scannedCap: 'Scanned on the customer’s phone. Waiting for them to approve.',
    elapsed: 'Elapsed',
    approved: 'Approved by the customer',
    paidNet: 916.5,
    paidMemo: "To Mike's Tire on net-30, whichever way the customer splits it. Clear carries the plan.",
    paidRows: { ticket: 'Ticket', plan: "Customer's plan", time: 'Code to approval' },
    status: {
      entering: 'Entering the charge',
      code: 'Code on screen',
      waiting: 'Waiting for approval',
      paid: 'Paid · $916.50 on net-30',
    },
  },
  you: {
    who: 'You',
    device: 'Your phone',
    steps: ['Get the charge', 'Pick a split', 'Approved'],
    waiting: 'Waiting on the shop',
    idle: 'Nothing to approve yet. When the shop shows its code, the charge lands here.',
    notifyApp: 'Clear',
    notifyWhen: 'now',
    notify: ["Mike's Tire", ' sent you a charge for ', '$940.00', '.'],
    notifySub: 'Front pads and rotors · you have not been charged',
    review: 'Review the charge',
    pickQ: "Mike's Tire · $940.00 · how do you want to clear it?",
    pickGroup: 'How to clear it',
    each: { many: 'a cycle', once: 'once' },
    total: 'Total',
    carry: 'Carry',
    doneBy: 'Done by',
    approve: 'Approve',
    approveNote: 'Clearing early always costs less.',
    approved: 'Approved',
    doneRows: { plan: 'Plan', total: 'Total', done: 'Done by', from: 'Clears from' },
    from: 'Chase 4471',
    again: 'Run it again',
    againNote: 'On your term-plans shelf, and in the ledger below.',
    planName: { once: 'In full', many: 'Split in ' },
    status: {
      none: 'Nothing yet',
      notCharged: 'Not charged yet',
      approved: 'Approved · first payment next cycle',
    },
  },
  /* The reference's own figures for $940, never recomputed here. */
  splits: [
    { label: 'In full', n: 1, each: 958.8, carry: 18.8, total: 958.8, done: 'October 2026' },
    { label: 'In 2', n: 2, each: 484.1, carry: 28.2, total: 968.2, done: 'November 2026' },
    { label: 'In 4', n: 4, each: 246.75, carry: 47.0, total: 987.0, done: 'January 2027' },
    { label: 'In 12', n: 12, each: 88.52, carry: 122.2, total: 1062.2, done: 'September 2027' },
  ],
  /* The split a reader sees first. */
  defaultSplit: 2,
  figs: [
    { fig: '2.5%', text: 'of the ticket for the shop, paid on net‑30' },
    { fig: '3 min', text: 'from the code on screen to an approved plan' },
    { fig: '2%', text: 'a cycle on what you still owe, so clearing early costs less' },
    { fig: '0', text: 'credit-score pulls to approve your first plan' },
  ],
  caption: 'Sample charge · the figures are the real terms',
} as const;

/* ── 04 · Status ──────────────────────────────────────────────────────────
   A plain list, because a list of facts is what it is. The two apps are
   live to invited members, so their chips are green. */
export const STATUS = {
  n: '04',
  label: 'Before you trust us with anything',
  title: 'What exists today, plainly.',
  line: 'A co-op that asks you to save with it should be straight about what it has built. Updated October 2026.',
  rows: [
    { name: 'Member app', desc: 'Savings, credit, term plans and the card', chip: 'Invite-only', tone: 'live' },
    { name: 'Merchant counter app', desc: 'Tablet-first, installs from a browser', chip: 'Invite-only', tone: 'live' },
    { name: 'Protocol contracts', desc: 'Public and open source', chip: 'In build', tone: 'underway' },
    { name: 'First merchant partners', desc: 'Auto repair and tires, Inland Empire', chip: 'Signing', tone: 'underway' },
    { name: 'First homes', desc: 'Twelve detached homes, land first', chip: 'Not yet', tone: 'absent' },
  ],
} as const;

/* ── 05 · The public ledger ───────────────────────────────────────────────
   Sample entries stream while the section is on screen; a plan you approve
   at the counter above is added at the top as "You, just now". */
export const LEDGER = {
  n: '05',
  label: 'The public ledger',
  title: 'You should not have to take our word for the numbers.',
  line: 'Balances, credit lines, deeds and titles run on an open-source protocol. The co-op uses it. It does not own it.',
  source: 'github.com/Deed3Labs/Protocol-Contracts · AGPL-3.0',
  more: { href: '/coop', label: 'How the co-op is put together' },
  cols: { block: 'Block', contract: 'Contract', event: 'Event', amount: 'Amount' },
  foot: { live: 'Sample entries, streaming', status: 'Contracts in build' },
  /* The block the sample stream starts from. */
  firstBlock: 18204331,
  /* [contract, event, amount, credit] */
  events: [
    ['StableCredit', 'CLRUSD minted on deposit', 250, true],
    ['CreditIssuer', 'credit line opened', 1500, false],
    ['LendingPool', 'plan payment cleared', 246.75, true],
    ['AssurancePool', 'reserve top-up from spread', 41.2, true],
    ['StableCredit', 'CLRUSD redeemed to cash', 120, false],
    ['CreditIssuer', 'cycle cleared in full', 312.4, true],
    ['BurnerBond', 'bond issued, 12 months', 4367.19, false],
    ['StableCredit', 'CLRUSD minted on deposit', 75, true],
    ['LendingPool', 'plan payment cleared', 88.52, true],
  ] as ReadonlyArray<readonly [string, string, number, boolean]>,
  mine: {
    who: 'You, just now',
    contract: 'LendingPool',
    /* "term plan approved, in 4, Mike’s Tire" */
    event: (split: string) => `term plan approved, ${split.toLowerCase()}, Mike’s Tire`,
    amount: 940,
  },
} as const;

export const CLOSE = {
  title: 'Your money kept in your neighborhood.',
  line: 'One member, one vote. Building in Inland Empire, California.',
  primary: { href: '/join', label: 'Join the waitlist' },
  ghost: { href: '/shops', label: 'Bring Clear to your shop' },
} as const;
