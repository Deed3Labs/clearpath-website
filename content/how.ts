/* How it works. Copy lives here, never inline in JSX. The mockup
   (reference/redesign/how.html) is the spec: the claim, then six sections —
   the draw order you can drag, the term-plan shelf you can pay back, the
   split you pick, what saving changes, the four states of a cycle, and the
   honest comparison. */

export const META = {
  title: 'How it works',
  description:
    'One balance, drawn cheapest first. Savings-backed credit that gets cheaper the longer you hold it, and a term-plan shelf with a single ceiling across every shop.',
} as const;

export const HERO = {
  label: { kicker: 'Members', title: 'How it works' },
  lines: ['Credit that gets cheaper', 'the longer you hold it.'],
  lede: 'Every other lender writes you a loan and hopes you keep needing one. Clear is built so your third year costs less than your first.',
  primary: { href: '/join', label: 'Join the waitlist' },
  ghost: { href: '#cycle', label: 'See a cycle' },
  facts: [
    { k: 'Your deposit is your share', v: 'Membership' },
    { k: 'No membership fee, nothing to buy', v: 'Cost' },
    { k: 'One member, one vote', v: 'Governance' },
  ],
  /* The on-page jump list under the hero. */
  jumpLabel: 'On this page',
  jump: [
    { href: '#draw', n: '01', label: 'Draw order' },
    { href: '#plans', n: '02', label: 'Term plans' },
    { href: '#split', n: '03', label: 'The split' },
    { href: '#savings', n: '04', label: 'Savings' },
    { href: '#cycle', n: '05', label: 'The cycle' },
    { href: '#compare', n: '06', label: 'The comparison' },
  ],
} as const;

/* ── 01 · Draw order ──────────────────────────────────────────────────────
   One composition bar, filled cheapest first. A sample line of $4,500; it
   draws to $2,800 as you arrive, then it is yours to drag. */
export const DRAW = {
  n: '01',
  label: 'Draw order',
  title: 'One balance, drawn cheapest first.',
  line: 'You do not choose a product. You spend, and the line takes from the cheapest thing backing you first.',
  /* The amount the line is drawn to, and the slider's step. */
  start: 2800,
  step: 50,
  of: (line: string) => `of a ${line} line`,
  drag: 'Drag to spend',
  rangeLabel: 'Amount spent on the line',
  drawnOf: ' of ',
  /* `min` is a floor on the tier's column, in px, so its name stays on one
     line and the four columns still align under the bar at tablet widths. */
  tiers: [
    { n: '01', name: 'Your own savings', cost: 'Free', limit: 1500, min: 0 },
    { n: '02', name: 'Bonds and pool shares', cost: 'Lowest paid rate', limit: 1000, min: 178 },
    { n: '03', name: 'Your income', cost: 'Middle', limit: 1500, min: 0 },
    { n: '04', name: 'Clear Boost™', cost: 'Highest', limit: 500, min: 108 },
  ],
  note: 'Sample line. You see the cost before you take it. Cost accrues on what you still owe, so clearing early always costs less, and nothing compounds. The most expensive part unwinds first.',
} as const;

/* ── 02 · Term plans ──────────────────────────────────────────────────────
   One open plan with its payment schedule, two locked rungs, and one
   ceiling. Clearing a cycle pays it down and counts toward Clear Cash;
   clearing early pays the principal left plus only this cycle's carry. */
export const PLANS = {
  n: '02',
  label: 'Term plans',
  title: 'Not three lenders. One co-op you own.',
  line: 'A repair at a shop, cash in your account, the house you buy. Three rungs, one membership. Pay this one back and watch what it unlocks.',
  more: { href: '/coop', label: 'How the co-op works' },
  owedLabel: 'Owed on term plans',
  ceiling: 3000,
  ceilingOf: 'of one $3,000.00 ceiling',
  stats: { room: 'Room', paid: 'Paid back', saved: 'Carry saved' },
  free: ' free',
  /* Carry is 2% a cycle on the principal still owed. */
  carry: 0.02,
  plan: {
    kind: 'Partner shop · 2% a cycle',
    name: "Mike's Tire",
    memo: 'Front pads and rotors · $940.00',
    principal: 940,
    n: 4,
    cleared: 'Cleared',
    progress: (n: number, each: string, pct: number) => [`Split in ${n} · ${each} a cycle · `, `${pct}% cleared`] as const,
    done: (n: number) => [`Split in ${n} · `, '100% cleared'] as const,
    onSchedule: (total: string) => `Cleared on schedule. ${total} in total.`,
    early: (saved: string) => `Cleared early. ${saved} of carry you never pay.`,
    left: (k: number, n: number) => `${k} of ${n} payments left`,
    nothing: 'Nothing owed',
    clearEarly: (v: string) => `Clear early · ${v}`,
    schedule: 'Payment schedule',
    due: ['October 2026', 'November 2026', 'December 2026', 'January 2027'],
    status: { early: 'Cleared early', paid: 'Paid', now: 'Due this cycle', upcoming: 'Upcoming' },
  },
  cash: {
    head: 'Unlocks after six clean cycles',
    locked: 'Locked',
    unlocked: 'Unlocked',
    name: 'Clear Cash™',
    type: 'Cash to your account · 2.5% a cycle',
    /* Clean cycles the sample member already has, and the number needed. */
    start: 4,
    need: 6,
    progress: (k: number) => `${k} of 6 clean cycles`,
    done: ['Unlocked', ' after six clean cycles'],
  },
  home: {
    head: 'Outside this limit',
    chip: 'Saving',
    name: 'Equity-Lease Participation Agreement',
    type: 'Backed by the house itself · set at signing',
    progress: '1,500 of 15,000 credits',
    pct: 10,
  },
  dueLabel: 'Due this cycle',
  dueSub: 'Limit $850.00 a cycle · clears from Chase 4471',
  rule: [
    'You can hold several plans. You cannot hold several limits.',
    ' Five stores usually means five ceilings and a hidden total. Here there is one, and paying back frees it.',
  ],
  clearCycle: 'Clear this cycle',
  reset: 'Reset',
  note: 'Sample member. Carry is 2% a cycle on what you still owe, so clearing early always costs less.',
} as const;

/* ── 03 · The split ───────────────────────────────────────────────────────
   The figures are the reference's own, declining-balance, and never
   recomputed from a flat rate. */
export const SPLIT = {
  n: '03',
  label: 'You pick the split',
  title: 'You choose how to clear it, and you can change your mind.',
  line: 'Spreading it further costs more, and the screen says so in dollars, not in a rate.',
  balance: { label: "Balance at Mike's Tire", figure: '$940.00' },
  group: 'How to clear it',
  rows: { each: 'Each cycle', once: 'Once', now: 'Carry this cycle', plan: 'Carry over the plan', done: 'Done by' },
  options: [
    { label: 'In full', n: 1, each: '$958.80', now: '$18.80', plan: '$18.80', total: '$958.80', done: 'October 2026' },
    { label: 'In 2', n: 2, each: '$484.10', now: '$18.80', plan: '$28.20', total: '$968.20', done: 'November 2026' },
    { label: 'In 4', n: 4, each: '$246.75', now: '$18.80', plan: '$47.00', total: '$987.00', done: 'January 2027' },
    { label: 'In 12', n: 12, each: '$88.52', now: '$18.80', plan: '$122.20', total: '$1,062.20', done: 'September 2027' },
  ],
  initial: 2,
  rate: '2% a cycle on what you still owe.',
  totalLabel: 'Total',
  close: 'Clearing early always costs less. Pick a split at the counter, and pick a different one later that week or three cycles in.',
} as const;

/* ── 04 · Savings, on ink ─────────────────────────────────────────────── */
export const SAVINGS = {
  n: '04',
  label: 'Savings',
  title: 'Saving is the thing that changes your terms.',
  line: 'Every dollar you save is matched one-for-one in equity credits, and raises your credit limit by a dollar.',
  stats: [
    { fig: '1:1', text: 'Matched in equity credits, dollar for dollar' },
    { fig: '36 mo', text: 'The match runs for your first thirty-six months of saving' },
    { fig: '$1,500', text: 'The most matched in any one month' },
    { fig: '~30 days', text: 'Before credits vest, so the number tracks money that stayed' },
  ],
  gateLabel: 'The gate',
  gate: 15000,
  gateText: 'credits unlocks your Equity-Lease Participation Agreement and your Clear Deed. Most first-cohort members are expected to reach it in twelve to eighteen months.',
  /* Three segments of 5,000 credits. */
  ticks: [
    ['0', '5,000'],
    ['5,000', '10,000'],
    ['10,000', '15,000'],
  ],
  sides: [
    { label: 'Drawing on savings', title: 'A pause, not a penalty.', text: 'New credits stop accruing while you are drawn against. The ones you have already earned are never taken back.' },
    { label: 'While you live there', title: 'You borrow, not withdraw.', text: 'Contributions are not withdrawable while you live in a Clear home. They come out on conversion or exit.' },
  ],
  notsLabel: 'What we do not do',
  nots: [
    { k: 'No late fees', v: 'ever' },
    { k: 'No compounding', v: 'the balance never grows on its own' },
    { k: 'No credit-score pull', v: 'to approve a first plan' },
    { k: 'No shopping app', v: 'competing with the shops you use' },
  ],
} as const;

/* ── 05 · The cycle ───────────────────────────────────────────────────────
   One component, four states. The label never changes and the number never
   turns into prose; the border carries the state. */
export const CYCLE = {
  n: '05',
  label: 'The cycle',
  title: 'Every thirty days, one number.',
  line: 'A cycle closes, the balance rebalances, and you are told where you stand in one line.',
  cardLabel: 'To clear this cycle',
  days: '9',
  daysLabel: 'days left',
  states: [
    { key: 'short', amt: '$1,140.00', line: 'Your deposit falls $240.00 short.', btn: 'Repay', solid: true, t: 'You are short this cycle', v: 'Repay', d: 'The only state that asks anything of you.' },
    { key: 'covered', amt: '$1,140.00', line: 'Your deposit on the 15th covers it.', btn: 'Repay early', solid: false, t: 'Your deposit covers it', v: 'Repay early', d: 'Nothing is required. Clearing early still costs less.' },
    { key: 'savings', amt: '$0.00', line: 'Using $600.00 of your own savings. Nothing owed.', btn: 'Top off', solid: false, t: 'Carrying only your own savings', v: 'Top off', d: 'Nothing is owed, but your progress toward a home is paused until you top it back up.' },
    { key: 'clear', amt: '$0.00', line: 'All clear. Nothing carried.', btn: '', solid: false, t: 'Nothing carried', v: 'All clear', d: 'Everything is at zero.' },
  ],
  /* Seconds each state holds while it steps on its own. */
  dwell: 4.2,
  note: 'The label never changes and the number never turns into prose. The border carries the state.',
} as const;

/* ── 06 · The comparison ──────────────────────────────────────────────── */
export const COMPARE = {
  n: '06',
  label: 'The comparison',
  title: 'The honest version of the comparison.',
  line: 'Including the part where they beat us.',
  theirs: { label: "Klarna's best outcome for you", say: 'You owe nothing.', text: 'Then you are back where you started, and their app is trying to sell you something else.' },
  ours: { label: 'Ours', say: 'You own something.', text: 'The waterfall is designed to move you from borrowing to spending your own money.' },
  honest: [
    { k: 'Their advantage we cannot match', v: 'One tap', text: 'Klarna is a single tap at checkout. Your first Clear transaction asks for a membership and a linked account, and takes about three minutes.' },
    { k: 'What happens after that', v: 'No application', text: 'You sign up once, not once per shop. Every later purchase anywhere in the network is just your existing line.' },
  ],
} as const;

export const CLOSE = {
  title: 'Your money, kept in the neighborhood.',
  line: 'One member, one vote. Building in Inland Empire, California.',
  primary: { href: '/join', label: 'Join the waitlist' },
  ghost: { href: '/shops', label: 'Bring Clear to your shop' },
} as const;
