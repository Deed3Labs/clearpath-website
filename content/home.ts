/* Home. §7.1 — copy is final and lives here, never inline in JSX.
 *
 * Rewritten for the layout system: every section now declares which archetype
 * it is, and the copy is cut to what that archetype can hold. The old page was
 * six sections of heading-plus-two-paragraphs, which is why nothing on it had
 * hierarchy — a reader met the same shape six times and skimmed none of it.
 *
 * Prose survives only where a sentence does something a figure cannot: the
 * caveat, the mechanism, the thing that would be a lie if it were shortened. */

import type { LedgerItem } from '@/components/primitives';

export const HERO = {
  /* One sentence, no second line: a payoff line after it only delays the
     hit, and the misregistration runs over the whole headline anyway.
     States what the co-op is for rather than what is wrong — the accusing
     version ('Your rent is making someone else rich.') read past the
     shopkeepers and savers the page also has to speak to. */
  headline: 'Your money, kept in the neighborhood.',
  /* What Clear is, then the four things it does, in the order the page
     covers them: save, borrow against it, pay local shops over time, and
     put rent toward a home. Doubles as the meta and link-preview
     description (app/layout.tsx), so it has to read on its own, away from
     the headline.

     Not "the home you live in": while you are renting you do not own that
     one yet, and the equity is portable into another Clear home anyway, so
     tying it to the current address is wrong twice over. "Toward a home of
     your own" is the accurate direction — equity accrues to a gate, and
     title comes after it. */
  lede: 'Clear is a member-owned cooperative. Save with us, open a credit line, pay local shops over time, and put your rent toward a home of your own.',
  primary: { href: '/join', label: 'Join the waitlist' },
  ghost: { href: '/shops', label: 'Bring Clear to your shop' },
  /* The place comes last. The two facts above it are the ones that say what
     is being built and that it can be checked; the location answers "where"
     once a reader already cares. */
  meta: [
    'First cohort — 12 detached homes',
    'Protocol source is public',
    'Building in Inland Empire, California',
  ],
} as const;

/* Alternates, already weighed. Kept here so the decision is visible in the
   code rather than lost in a document, and so nobody writes a sixth.
     · 'Your rent is making someone else rich.' — the line the page opened
       with. It argues with renting, which is one of the three audiences,
       and it names a beneficiary on a site where /contribute and /capital
       ask landlords to bring their property in.
     · 'Rent builds equity. Just not yours.' — withholds the hook until the
       second line, which is a beat too long.
     · 'Your rent is making someone rich. Just not you.'
     · 'You are already buying a house. Someone else is keeping it.'
     · 'You already pay for a house every month. It just isn\'t yours.' */

/* ── 01 · The gap ─────────────────────────────────────────────────────────
   The page's big moment, on ink. Two figures at set-piece size and one line
   between them. It was two paragraphs and a ledger; the paragraphs said in
   forty words what the two numbers say by sitting next to each other. */
type TallyColumn = {
  key: string;
  label: string;
  paid: string;
  paidNote: string;
  kept: string;
  keptNote: string;
  /* Optional, so `as const` does not narrow the union to two shapes where one
     lacks the key — which makes c.live unreachable at the call site. */
  live?: boolean;
};

export const GAP = {
  rail: '01 / The gap',
  kicker: 'If you rent today',
  heading: 'Same money. But you end up owning something.',
  columns: [
    {
      key: 'rent',
      label: 'Renting',
      paid: '$151,200',
      paidNote: 'paid out over five years',
      kept: '$0',
      keptNote: 'no equity, no title, no claim',
    },
    {
      key: 'clear',
      label: 'Inside Clear',
      paid: '$141,000',
      paidNote: 'paid out over the same five years',
      kept: '$90,000',
      keptNote: 'credited to your equity balance',
      live: true,
    },
  ] satisfies TallyColumn[],
  /* The one thing the figures cannot say. */
  close:
    'The monthly total inside Clear is $2,350 against $2,520 in rent — lower, not higher. The difference is where it lands.',
  note: 'Illustration of how the model works, on a two-bedroom in the Inland Empire. Not a quote.',
  /* The figures invite exactly one question, and /housing is the answer. */
  link: { href: '/housing', label: 'How the housing math works' },
} as const;

/* ── 02 · Three phases ────────────────────────────────────────────────────
   A bento: three cells of unequal size, because the phases are of unequal
   length and a three-up of identical cards said the opposite. Each carries a
   gate rather than a paragraph — the gate is the thing a reader wants. */
export type Phase = {
  n: string;
  title: string;
  gate: string;
  gateNote: string;
  body: string;
  size: 'lg' | 'md' | 'sm' | 'eq3';
};

export const PHASES = {
  rail: '02 / Three phases',
  kicker: 'Take the ClearPath',
  heading: 'Renter, owner, earner.',
  standfirst: 'Not three ways of describing the same payment. Three phases, each with a gate you can see from your first day.',
  steps: [
    {
      n: '01',
      title: 'You rent, and save at the same time.',
      gate: '15,000',
      gateNote: 'credits unlocks the home path',
      body: 'Your deposit is your membership share. Saving earns matched credits and a credit line, at no cost.',
      size: 'eq3',
    },
    {
      n: '02',
      title: 'You take title. The land stays common.',
      /* Not "ELPA". It is our own acronym, and this is the first page a
         stranger reads — a gate nobody can parse is not a gate. The two
         documents, named plainly. /how carries the full definition. */
      gate: 'Two signatures',
      gateNote: 'a purchase agreement and your deed',
      body: 'Your payment splits into equity and a community fee. The land underneath is never sold.',
      size: 'eq3',
    },
    {
      n: '03',
      title: 'You redeem it, and the equity travels.',
      gate: 'Portable',
      gateNote: 'into another Clear home',
      body: 'Once your contributions cover the structure you hold it outright.',
      size: 'eq3',
    },
  ] satisfies Phase[],
} as const;

/* ── 03 · Two ways in ─────────────────────────────────────────────────────
   Three columns, not two: the shop's price, the mechanism that connects the
   two sides, and the member's price. Two columns of ~660px left the section
   both horizontally empty and vertically tall; three fill the measure and cut
   the height without adding anything that was not already true.

   The middle column is not new copy — it is the handoff already described on
   /shops (the tablet shows a code, and the customer approves on their own
   phone rather than on the shop's device). It was the one part of this
   section that had nowhere to live. */
export const WAYS_IN = {
  rail: '03 / Two ways in',
  kicker: 'If you run a shop, or shop at one',
  heading: 'Whichever side of the counter you are on.',
  columns: [
    {
      key: 'shop',
      heading: 'You run the shop',
      figure: '2.5%',
      figureNote: 'of the ticket, and you are paid on net-30',
      body: 'Jobs walk out every week because the customer cannot pay that day. The same job runs 6% to 12% on Klarna, Affirm or a store card.',
      link: { href: '/shops', label: 'The merchant terms in full' },
    },
    {
      key: 'between',
      heading: 'Between you',
      figure: '3 min',
      figureNote: 'from the code on screen to an approved plan',
      body: 'The shop enters the amount and turns the screen. You scan the code and approve it on your own phone — the split is never chosen on their device.',
      link: null,
    },
    {
      key: 'member',
      heading: 'You are standing at a counter',
      figure: '2%',
      figureNote: 'a cycle on what you still owe, so clearing early costs less',
      body: 'Your car needs $940 of work today. You pick how to clear it — in full, or split two, four or twelve ways.',
      /* §7 Legal: a credit-advertising claim. Do not paraphrase it into
         anything stronger than it already is. */
      note: 'No credit-score pull to approve your first plan.',
      link: { href: '/how', label: 'How the member side works' },
    },
  ],
} as const;

/* ── 04 · Status ──────────────────────────────────────────────────────────
   An index: the one section that should be a plain list, because a list of
   facts is what it is. */
export const STATUS = {
  rail: '04 / Status',
  kicker: 'Before you trust us with anything',
  heading: 'What exists today, plainly.',
  standfirst: 'A co-op that asks people to save with it should be straight about what it has built. This list is maintained, not marketing.',
  ledger: [
    {
      label: 'Member app — savings, credit, term plans, card',
      value: 'live',
      chip: 'live',
      chipTone: 'live',
      description: 'Savings, credit, term plans and the card are running. Accounts and cards on Lithic, wallets on Privy.',
    },
    {
      label: 'Merchant counter app',
      value: 'in beta',
      chip: 'in beta',
      chipTone: 'underway',
      description: 'Built and ready for the first counters. Tablet-first, installs from a browser. Charge, show a code, refund with an owner code.',
    },
    {
      label: 'Protocol contracts',
      value: 'in build',
      chip: 'in build',
      chipTone: 'underway',
      description: 'Public and open source. Savings-backed credit needs no outside capital, so it ships first.',
    },
    {
      label: 'First merchant partners',
      value: 'signing',
      chip: 'signing',
      chipTone: 'underway',
      description: 'Auto repair, tires and similar trades in the Inland Empire.',
    },
    {
      label: 'First homes',
      value: 'not yet',
      chip: 'not yet',
      chipTone: 'absent',
      description: 'Twelve detached homes, paced to member savings and financing capacity. Land first.',
    },
  ] satisfies LedgerItem[],
} as const;

/* ── 05 · Underneath ──────────────────────────────────────────────────────
   A stage: one sentence at display size. The paragraph under it was 55 words
   restating the sentence. */
export const UNDERNEATH = {
  rail: '05 / Underneath',
  kicker: 'The public ledger',
  statement: 'You should not have to take our word for the numbers.',
  body: 'Balances, credit lines, deeds and titles run on an open-source protocol held by an ownerless Wyoming foundation. The co-op is a user of it, not its owner.',
  source: 'github.com/Deed3Labs/Protocol-Contracts · AGPL-3.0',
  link: { href: '/coop', label: 'How the co-op is put together' },
} as const;
