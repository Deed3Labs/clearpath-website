/* For shops. §6.3 — copy is final and lives here, never inline in JSX. */

import type { LedgerItem, StepItem } from '@/components/primitives';

export const OPENING = {
  rail: 'Shops / 01',
  heading: 'How many jobs a week do you write up and lose?',
  lede:
    'Every service writer knows the number. Clear finances those customers at 2.5% of the ticket, pays you on net-30, and carries the default itself.',
  cta: { href: '/join?as=shop', label: 'Talk to us about your shop' },
  ledger: [
    /* Cobalt once per viewport, on the figure that matters most: the rate. */
    { label: 'Your rate', value: '2.5%', live: true },
    { label: 'You are paid', value: 'net-30' },
    { label: 'Who bears a default', value: 'we do' },
    { label: 'Exclusivity', value: 'none' },
  ] satisfies LedgerItem[],
} as const;

export const DIFFERENCE = {
  rail: 'Shops / 02 — the difference',
  heading: 'Six to twelve per cent is not greed. It is the price of getting paid tomorrow.',
  standfirst:
    'Klarna and Affirm settle the same day and have to fund every dollar of it. We wait thirty days, and collect most of it before your payout.',
  /* §6.3 S2 — the calculator's four stats and their arithmetic. */
  range: { min: 2000, max: 60000, step: 500, initial: 12000 },
  stats: [
    { key: 'volume', caption: 'Financed through Clear each month' },
    { key: 'theirs', caption: 'What a 6% provider takes' },
    { key: 'ours', caption: 'What Clear takes' },
    {
      key: 'kept',
      caption:
        'Kept over a year, for waiting three extra weeks on money you were not going to see at all if the customer walked.',
    },
  ],
  /* The comparison is held at 6% on purpose. Pay-in-four sits there; the
     longer 0% promotions and the no-credit-needed tiers run higher, and the
     high end of that spread is not the number to argue from. Comparing
     against their cheapest product is the position that cannot be picked
     apart, and it is still 2.4x our rate. */
  note:
    'Held at 6% — the low end. Longer 0% promotional plans and no-credit-needed programmes commonly run to 12% of the ticket. Rates vary by provider, plan length and customer; illustration, not a quote.',
} as const;

export const COUNTER = {
  rail: 'Shops / 03 — at the counter',
  heading: 'Two taps for your writer. Three minutes for the customer.',
  steps: [
    {
      title: 'Enter the amount',
      body: 'The number your own system already produced. No items, no tips, no splitting the ticket — this is not a point of sale.',
    },
    {
      title: 'Turn the screen',
      body: 'The tablet shows a code. A new customer scans it and the app installs; a member just gets a notification.',
    },
    {
      title: 'The customer approves on their phone',
      body: 'They pick how to clear it and approve. The split is never chosen on your device, which matters if there is ever a dispute.',
    },
    {
      title: 'You see it confirmed',
      body: 'The charge sits waiting if their phone is dead. You can see whether the text was delivered before they drive off.',
    },
  ] satisfies StepItem[],
  /* Three, not two. Two columns of ~660px left the pair reading as one block
     of prose with a seam in it; three at ~410px each hold a heading and three
     lines and let the row breathe. The third is the hardware question, which
     is the first thing a shop owner asks after seeing the steps and which was
     buried as a footnote four sections further down. */
  panels: [
    {
      title: 'Signup happens once per member, not once per shop.',
      body: 'The first customer through your door signs up from scratch. By your twentieth, most people walking in already hold a line — nothing for your writer to do but enter a number.',
    },
    {
      title: 'Your existing signage is a reason to talk, not a reason not to.',
      body: 'Synchrony takes your prime customers. Snap and Acima take the declines and can cost that customer close to double the ticket.',
    },
    {
      title: 'There is no hardware to buy.',
      body: 'The merchant app runs at merchant.useclear.org and installs from a browser — a tablet, a phone or the shop PC will do.',
    },
  ],
} as const;

/* Both sides were a paragraph of conditions strung together on middots. A shop
   owner reading this is scanning for the one term that rules them in or out,
   and a sentence makes them parse the whole thing to find it. Three conditions
   a side, one per row; the prose that remains is the part that is genuinely an
   argument rather than a criterion. */
export const FIT = {
  rail: 'Shops / 04 — fit',
  works: {
    heading: 'This works for you if',
    criteria: [
      'Your tickets are $300 and up',
      'You lose jobs because people cannot pay that day',
      'You can wait thirty days for the money',
    ],
    body: 'Auto repair, tires, dental, veterinary, HVAC, appliances, furniture, equipment — trades where financing is already part of how the sale closes.',
  },
  doesnt: {
    heading: 'It does not work for you if',
    criteria: [
      'Your average ticket is twelve dollars',
      'You need the cash the same week',
      'Waiting thirty days would strain the shop',
    ],
    body: 'We would rather say that now than sign you and lose you in month two. If that is you, we will say so on the first call.',
  },
} as const;

export const FOUNDING = {
  rail: 'Shops / 05 — founding partners',
  heading: 'The first five shops are working out the kinks with us.',
  standfirst:
    'That is worth paying for, so we do. Founding partners are capped at five, and when they are gone they are gone.',
  ledger: [
    { label: 'Rate', value: '2% for life', live: true, description: 'Standard is 2.5%.' },
    { label: 'First twenty charges', value: 'no fee', description: 'The beta period, on us.' },
    {
      label: 'Named as a founding partner',
      value: 'in the app',
      description: 'In the partner directory every member sees.',
    },
    { label: 'Support', value: 'the founder’s number', description: 'Not a queue.' },
  ] satisfies LedgerItem[],
  /* A matched pair: title, body, note on both sides, so the two columns line
     up row for row. The left was one 355-character paragraph carrying a
     sentence about banking credentials that had nothing to do with the steps
     — that sentence is the note now, which is where a reassurance belongs.
     The hardware line moved up to the counter section, where it is asked. */
  panel: {
    title: 'Getting set up takes about twenty minutes.',
    body: 'Six steps at your back-office computer: shop details, terms, verification, where payouts go, and training the counter. The last step is a one-dollar test charge you refund straight away, so your writers have run the loop once before a customer is standing there.',
    note: 'Nobody from Clear ever sees your banking credentials.',
  },
  terms: {
    title: 'Your terms are six lines, not a document.',
    body: 'Rate · fee on the first twenty charges · payout timing · who bears a default · approval cap · leaving any time.',
    note: 'An owner who reads six lines has actually read their agreement.',
  },
} as const;

/* ── 06 · The money ───────────────────────────────────────────────────────
   This was the one section on the page with no shape: two headings, two
   paragraphs and a ledger, sitting between a tile row and a stage line. Every
   other section here is carried by a figure or a structure.

   It is two things, so it gets two shapes. Getting paid is a clock, and a
   clock is a track — three marks on a rule, the time in mono, the sentence
   short. Refunds are two people looking at different numbers, which was the
   most interesting fact in the section and was buried as a ledger row; it is
   the visual moment now.

   §7 Legal: net-30 only. net-14 is not published anywhere. */
export const MONEY = {
  rail: 'Shops / 06 — the money',
  heading: 'From a bank deposit back to the tickets.',
  lede: 'A shop that cannot reconcile a payout against its own books will ask for a spreadsheet every month for the rest of the relationship.',
  track: [
    {
      when: 'Day 0',
      what: 'The ticket closes.',
      note: 'Your writer enters the amount, the customer approves on their own phone, and the job leaves.',
    },
    {
      when: 'Day 30',
      what: 'Your payout lands.',
      note: 'Net-30, every time. Withdrawals are capped by what the pool holds, and the app says so rather than failing silently.',
      live: true,
    },
    {
      when: 'Any day',
      what: 'The deposit opens up.',
      note: 'Every payout traces to the charges inside it, so your books close without a call to us.',
    },
  ],
  refunds: {
    heading: 'Your writer can start a refund. Only you can move your money.',
    body: 'The manager-override pattern every till already uses, so it needs no training. Your writer begins the refund with the customer standing there; your owner code submits it.',
    sides: [
      { label: 'Your writer sees', line: 'What the customer gets back.' },
      {
        label: 'You see',
        line: 'What it does to your payout.',
        /* The figure the person actually authorising cares about. */
        live: true,
      },
    ],
    note: 'Nothing is said to the customer until an owner has authorised it. A refund a writer promised and an owner declined is the worst possible counter conversation.',
    carry: {
      when: 'Carry is not refunded',
      what: 'The time stands.',
      note: 'A refund unwinds the purchase, not the time the customer held the plan.',
    },
  },
} as const;

export const MEMBERSHIP = {
  rail: 'Shops / 07',
  heading: 'Signing also makes you a partner member of the co-op.',
  body: 'You are not a vendor account. The merchant agreement admits your business as a partner member, which is why you appear in the directory members browse, and why both sides of every transaction are members of the same cooperative. You can leave any time.',
  cta: { href: '/join?as=shop', label: 'Start a conversation' },
} as const;
