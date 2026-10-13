/* For shops. Copy lives here, never inline in JSX. The mockup
   (reference/redesign/shops.html) is the spec: the question every service
   writer can answer and the counter app, then the fee calculator, the
   counter steps, fit, founding partners, the money, and membership. */

export const META = {
  title: 'For shops',
  description:
    'Clear finances the customers who cannot pay that day at 2.5% of the ticket, pays you on net-30, and carries the default itself. No exclusivity and no hardware to buy.',
} as const;

export const HERO = {
  label: { kicker: 'Partners', title: 'For shops' },
  lines: ['How many jobs a week', 'do you write up and lose?'],
  lede: 'Every service writer knows the number. Clear finances those customers at 2.5% of the ticket, pays you on net‑30, and carries the default itself.',
  primary: { href: '/join?as=shop', label: 'Talk to us about your shop' },
  ghost: { href: '#counter', label: 'See the counter' },
  facts: [
    { k: 'Your rate', v: '2.5%', live: true },
    { k: 'You are paid', v: 'net‑30' },
    { k: 'Who bears a default', v: 'we do' },
    { k: 'Exclusivity', v: 'none' },
  ],
  stage: { caption: 'The counter app', sample: 'Sample shop' },
} as const;

/* The merchant counter app, owner signed in: a sample shop. The writer keys
   in $940 when the hero has finished. */
export const COUNTER_APP = {
  brand: 'Clear',
  shop: "Mike's Tire",
  tabs: ['Counter', 'Charges', 'Payouts', 'Staff'],
  initials: 'MK',
  newCharge: 'New charge',
  amount: 940,
  memo: 'Front pads and rotors',
  fee: 'Clear keeps 2.5%',
  net: 'You get, on net‑30',
  keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],
  go: 'Show the code',
  alt: ['Scan their code', 'Enter a phone number'],
  waiting: { label: 'Waiting', count: '1 charge' },
  wait: {
    name: 'D. Ramirez',
    amount: '$612.00',
    sub: 'Raised by Jen · 3 min ago · expires in 24 hours',
    receipts: [
      { label: 'Text delivered', ok: true },
      { label: 'Email delivered', ok: true },
      { label: 'Push sent', ok: false },
    ],
    actions: ['Resend', 'Cancel'],
  },
  today: { label: 'Today', sub: '4 charges · $2,215.00 approved' },
  rows: [
    { name: 'A. Nguyen', staff: 'Jen', amount: '$1,180.00', st: 'Approved', ok: true },
    { name: 'K. Brooks', staff: 'Luis', amount: '$455.00', st: 'Approved', ok: true },
    { name: 'T. Ortiz', staff: 'Jen', amount: '$387.00', st: 'Expired', ok: false },
    { name: 'M. Patel', staff: 'Jen', amount: '$580.00', st: 'Approved', ok: true },
  ],
  payout: { label: 'Next payout', sub: 'Lands November 14 · 23 charges', amount: '$4,210.00' },
} as const;

/* ── 01 · The difference, on ink ──────────────────────────────────────────
   A calculator: a 6% provider against Clear's 2.5%, and what the shop keeps
   over a year — the difference times twelve. An illustration, labelled. */
export const DIFFERENCE = {
  n: '01',
  label: 'The difference',
  title: 'Six to twelve per cent is not greed. It is the price of getting paid tomorrow.',
  line: 'Klarna and Affirm settle the same day and have to fund every dollar of it. We wait thirty days, and collect most of it before your payout.',
  volLabel: 'Financed through Clear each month',
  rangeLabel: 'Financed each month',
  min: 2000,
  max: 60000,
  step: 500,
  start: 12000,
  ends: ['$2,000', 'Drag to your month', '$60,000'],
  theirRate: 0.06,
  ourRate: 0.025,
  theirs: { who: 'A 6% provider', when: 'Paid tomorrow', take: 'What they take each month' },
  ours: { who: 'Clear', when: 'Paid on net‑30', take: 'What Clear takes each month' },
  kept: 'Kept over a year, for waiting three extra weeks on money you were not going to see at all if the customer walked.',
  note: 'Held at 6%, the low end. Longer 0% promotional plans and no-credit-needed programmes commonly run to 12% of the ticket. Rates vary by provider, plan length and customer; illustration, not a quote.',
} as const;

/* ── 02 · At the counter ──────────────────────────────────────────────────
   Four steps that drive the tablet beside them. */
export const COUNTER = {
  n: '02',
  label: 'At the counter',
  title: 'Two taps for your writer. Three minutes for the customer.',
  line: 'This is not a point of sale. It settles one number your own system already produced.',
  tablist: 'At the counter',
  steps: [
    { t: 'Enter the amount', b: 'The number your own system already produced. No items, no tips, no splitting the ticket.' },
    { t: 'Turn the screen', b: 'The tablet shows a code. A new customer scans it and the app installs; a member just gets a notification.' },
    { t: 'The customer approves on their phone', b: 'They pick how to clear it and approve. The split is never chosen on your device, which matters if there is ever a dispute.' },
    { t: 'You see it confirmed', b: 'The charge sits waiting if their phone is dead. You can see whether the text was delivered before they drive off.' },
  ],
  /* Seconds each step holds while the steps cycle on their own. */
  dwell: 4.2,
  tablet: {
    who: 'Jen · Counter',
    scan: "Scan with your phone's camera to approve",
    waitLabel: 'Waiting for the customer',
    choosing: 'D. Ramirez is choosing how to clear it.',
    ticket: '$940.00 · front pads and rotors · raised by Jen',
    receipts: [
      { k: 'Text', v: 'Delivered 4:12pm', ok: true },
      { k: 'Email', v: 'Delivered 4:12pm', ok: true },
      { k: 'Push', v: 'Sent', ok: false },
    ],
    walkLabel: 'If they walk away',
    walk: 'The charge waits for 24 hours. Nothing to re-enter.',
    walkActions: ['Resend', 'Cancel the charge'],
    approved: 'Approved',
    rows: { ticket: 'Ticket', choice: "Customer's choice", split: 'Split in 4' },
    next: 'New charge',
  },
  panels: [
    {
      title: 'Signup happens once per member, not once per shop.',
      text: 'The first customer through your door signs up from scratch. By your twentieth, most people walking in already hold a line.',
      k: 'By your twentieth',
      v: 'Just a number',
    },
    {
      title: 'Your existing signage is a reason to talk, not a reason not to.',
      text: 'Synchrony takes your prime customers. Snap and Acima take the declines and can cost that customer close to double the ticket.',
      k: 'Keep what you have',
      v: 'No exclusivity',
    },
    {
      title: 'There is no hardware to buy.',
      text: 'The merchant app installs from a browser. A tablet, a phone or the shop PC will do.',
      k: 'Runs at',
      v: 'merchant.useclear.org',
      href: 'https://merchant.useclear.org',
    },
  ],
} as const;

/* ── 03 · Fit ─────────────────────────────────────────────────────────── */
export const FIT = {
  n: '03',
  label: 'Fit',
  title: 'We would rather say it now than lose you in month two.',
  line: 'If Clear is wrong for your shop, we will say so on the first call.',
  yes: {
    title: 'This works for you if',
    items: ['Your tickets are $300 and up', 'You lose jobs because people cannot pay that day', 'You can wait thirty days for the money'],
    foot: 'Auto repair, tires, dental, veterinary, HVAC, appliances, furniture, equipment: trades where financing is already part of how the sale closes.',
  },
  no: {
    title: 'It does not work for you if',
    items: ['Your average ticket is twelve dollars', 'You need the cash the same week', 'Waiting thirty days would strain the shop'],
    foot: 'We would rather say that now than sign you and lose you in month two.',
  },
} as const;

/* ── 04 · Founding partners, on ink ───────────────────────────────────── */
export const FOUNDING = {
  n: '04',
  label: 'Founding partners',
  title: 'The first five shops are working out the kinks with us.',
  line: 'That is worth paying for, so we do. Founding partners are capped at five, and when they are gone they are gone.',
  perks: [
    { k: 'Rate', v: '2% for life', note: 'Standard is 2.5%.', live: true },
    { k: 'First twenty charges', v: 'No fee', note: 'The beta period, on us.' },
    { k: 'Named as a founding partner', v: 'In the app', note: 'In the partner directory every member sees.' },
    { k: 'Support', v: "The founder's number", note: 'Not a queue.' },
  ],
  setup: {
    title: 'Getting set up takes about twenty minutes.',
    steps: ['Start', 'Your shop', 'Your terms', 'Verify', 'Where payouts go', 'A $1.00 test charge'],
    text: 'At your back-office computer. The last step is a test charge you refund straight away, so your writers have run the loop once before a customer is standing there.',
    foot: 'Nobody from Clear ever sees your banking credentials.',
  },
  terms: {
    title: 'Your terms are six lines, not a document.',
    rows: [
      { k: 'Rate', v: '2.5% of the ticket' },
      { k: 'First twenty charges', v: 'No fee' },
      { k: 'Payout timing', v: 'Net‑30' },
      { k: 'Who bears a default', v: 'Clear' },
      { k: 'Approval cap', v: 'Up to $1,500 a charge' },
      { k: 'Leaving', v: 'Any time' },
    ],
    foot: 'An owner who reads six lines has actually read their agreement.',
  },
} as const;

/* ── 05 · The money ───────────────────────────────────────────────────────
   The clock from ticket to payout, then the refund hand-off: the writer
   starts it, only the owner can move the money. */
export const MONEY = {
  n: '05',
  label: 'The money',
  title: 'From a bank deposit back to the tickets.',
  line: 'A shop that cannot reconcile a payout against its own books will ask for a spreadsheet every month. So every payout opens up.',
  track: [
    { when: 'Day 0', what: 'The ticket closes.', text: 'Your writer enters the amount, the customer approves on their own phone, and the job leaves.' },
    { when: 'Day 30', what: 'Your payout lands.', text: 'Net‑30, every time. Withdrawals are capped by what the pool holds, and the app says so rather than failing silently.', live: true },
    { when: 'Any day', what: 'The deposit opens up.', text: 'Every payout traces to the charges inside it, so your books close without a call to us.' },
  ],
  refundTitle: 'Your writer can start a refund. Only you can move your money.',
  refundLine: 'The manager-override pattern every till already uses, so it needs no training. Try it.',
  writer: {
    initials: 'JN',
    role: 'Jen · counter',
    sees: 'Sees what the customer gets back',
    charge: 'Charge · K. Brooks',
    rows: [
      { k: 'Brake pads, wrong part', v: '$412.00' },
      { k: 'Customer gets back', v: '$99.91' },
      { k: 'Payments left', v: 'Cancelled' },
    ],
    send: 'Send to an owner',
    idle: 'Nothing moves yet, and nothing is said to the customer.',
    sent: 'Sent to an owner. Waiting for Mike.',
    done: 'Approved by Mike. Now tell the customer.',
  },
  owner: {
    initials: 'MK',
    role: 'Mike · owner',
    sees: 'Sees what it does to the payout',
    idle: 'Nothing to authorise',
    asks: 'Jen asks to refund K. Brooks · $412.00',
    approvedBy: 'Approved by Mike · 4:18pm',
    payout: '$4,210.00',
    after: '$3,808.30',
    sub: 'Your next payout · November 14',
    ifSub: 'Your next payout, if you approve · $401.70 less',
    approve: 'Approve with owner code',
    done: 'Refunded. Both names are on the record.',
  },
  carry: 'Carry is not refunded.',
  carryLine: 'A refund unwinds the purchase, not the time the customer held the plan. Here that is $8.24, the one cycle they carried.',
  again: 'Run it again',
} as const;

/* ── 06 · Membership: the page closes on its own numbered section ─────── */
export const MEMBERSHIP = {
  n: '06',
  label: 'Membership',
  title: 'Signing also makes you a partner member of the co-op.',
  line: 'You are not a vendor account. Both sides of every transaction are members of the same cooperative, which is why you appear in the directory members browse. You can leave any time.',
  primary: { href: '/join?as=shop', label: 'Start a conversation' },
} as const;
