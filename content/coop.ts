/* The co-op. §6.7 — copy is final and lives here, never inline in JSX.
 *
 * Structural page: the reader is evaluating an entity, so "the co-op holds the
 * land and never sells it" is the correct register here, as on /capital. (§6)
 *
 * Rewritten for the layout system. The page had one genuinely strong idea —
 * that a promise written as a policy and the same promise written as a
 * reserved matter are different objects — and it was a sidebar panel next to
 * the headline. It opens the page now.
 *
 * The five reserved matters were a comma list inside one ledger row's
 * description, where a reader evaluating governance would never find them.
 * They are five rows of their own. */

import type { LedgerItem } from '@/components/primitives';

/* ── 01 · The claim ──────────────────────────────────────────────────────
   The same sentence, written two ways. */
export const OPENING = {
  kicker: 'The co-op',
  /* "Bank" is a restricted term and Clear is not one — the footer legal block
     on every page says so explicitly. An H1 claiming it while the footer
     disclaims it is a contradiction a regulator would read as the claim, not
     the disclaimer. "Lender" is accurate, unrestricted, and keeps the
     sentence's incongruity — the thing that lends is the thing that builds. */
  heading: 'A lender that happens to build houses, owned by the people who use it.',
  lede: 'Your deposit is your share, every member has one vote regardless of balance, and the promises that matter are written where a future board cannot quietly reverse them.',
  quote: '“We never sell the land.”',
  sides: [
    {
      label: 'Written as a policy',
      line: 'A board reverses it in an afternoon.',
      note: 'Policies are what a board sets, and what the next board is free to unset. Nothing about the sentence itself protects it.',
    },
    {
      label: 'Written as a reserved matter',
      line: 'It cannot pass without the co-op.',
      note: 'No matter who else joins the board. The protection is structural, which is the only kind that survives the people who wrote it.',
      live: true,
    },
  ],
} as const;

/* ── 02 · Structure ──────────────────────────────────────────────────────
   The drawing takes the page's one ink band. It is the thing a reader came
   for, and it spent the old page as a figure in the middle of a column. */
export const STRUCTURE = {
  kicker: 'Structure',
  heading: 'Two balance sheets that never touch.',
  sub: 'Housing on one side — land and contributed property. Money on the other — deposits, credit and loans.',
  prose:
    'Land backstops construction borrowing and never credit losses, and a member’s savings never fund another member’s credit.',
  /* The diagram's contents, so the drawing and its text alternative are
     generated from one source and cannot drift apart. */
  root: { name: 'The co-op', note: 'members, one member one vote' },
  children: [
    { name: 'Program entity', note: 'accounts, cards, payments' },
    { name: 'Deed & Title Co', note: 'records, administration' },
    { name: 'Clear Capital Holdings', note: 'where outside investors sit' },
    { name: 'ClearLabs', note: 'builds the protocol' },
  ],
  /* Sit under Clear Capital Holdings. */
  holdingsChildren: [
    { name: 'Clear Lending', note: 'funds the credit book' },
    { name: 'Clear Properties', note: 'contributed' },
  ],
  /* Outside the ownership tree. A dashed outline means ownerless and nothing
     else — this is the only dashed box in the drawing. */
  foundation: { name: 'Protocol foundation', note: 'ownerless, holds the source' },
  contractLabel: 'contracts ClearLabs to maintain it',
  footnotes: [
    'Members hold no shares in Clear Capital Holdings; it is a separate company with its own board.',
    'Investors can hold a seat on that board; the co-op board is elected by members and stays member-only.',
  ],
  link: { href: '/capital', label: 'How outside capital enters' },
} as const;

/* ── 03 · Governance ─────────────────────────────────────────────────────
   Who decides what, as a table, and then the five things nobody decides
   alone — which were a comma list inside one row's description. */
export const GOVERNANCE = {
  kicker: 'Governance',
  heading: 'Who decides what.',
  sub: 'One vote each, councils where people actually live, and a third of the board delegated from them.',
  ledger: [
    {
      label: 'Members',
      value: 'one vote each',
      description:
        'Not proportional to balance. Your deposit makes you an owner; it does not make you a bigger one.',
    },
    {
      label: 'Regional councils',
      value: 'per community',
      description:
        'Actual residents, governing their own place. From outside it looks like an HOA. It is not one.',
    },
    {
      label: 'Delegate assembly',
      value: 'one third of the board',
      description:
        'Each community delegates its council chair. Written as a fraction so it holds at any board size.',
    },
  ] satisfies LedgerItem[],
  reserved: {
    title: 'Five reserved matters, none of which pass without the co-op.',
    list: [
      'Selling land',
      'Diluting members',
      'Amending the purpose',
      'Replacing the manager',
      'Related-party deals above a threshold',
    ],
  },
} as const;

/* ── 04 · The protocol ───────────────────────────────────────────────────
   Its own section rather than a column beside the governance table. The last
   sentence of it is the best line on the page and it was the second half of
   a paragraph. */
export const PROTOCOL = {
  kicker: 'The protocol',
  statement: 'Control is unnecessary when exit is credible.',
  body: 'The ledger, the credit issuers and the tokenized deed and title records run on open-source contracts held by a Wyoming statutory foundation that nobody owns.',
  sides: [
    {
      label: 'Who maintains it',
      line: 'ClearLabs, and not only ClearLabs.',
      note: 'Currently paid to maintain the contracts, and deliberately not the only party that could be.',
    },
    {
      label: 'If governance diverged',
      line: 'The co-op can fork the code.',
      note: 'It already funds the maintainer, so it has the capability and not just the right.',
      live: true,
    },
  ],
  note: 'github.com/Deed3Labs/Protocol-Contracts · AGPL-3.0',
} as const;

/* ── 05 · Who ────────────────────────────────────────────────────────────
   The one figure on the page is the year the work started, which was the
   middle of a sentence. */
export const WHO = {
  kicker: 'Who',
  heading: 'Small, local, and honest about it.',
  sub: 'Clear is being built out of the Inland Empire by a very small team, starting with a handful of shops in one corridor rather than a launch.',
  /* Two blocks of the same shape — a label, one big thing, a note — so they
     can share rows without one dragging the other out of position. The
     corridor argument was a closing paragraph sitting under everything else
     with nothing to do; it is the second half of the pair. */
  sides: [
    {
      label: 'In progress',
      figure: '2017',
      note: 'since the design work started — the credit waterfall, the entity structure, the protocol',
    },
    {
      label: 'Why a corridor',
      line: 'Ten merchants a mile apart compound.',
      note: 'Ten across the county do not. What is new is that the first product is small enough to actually ship.',
    },
  ],
  hiring: {
    /* "Working on this?" reads as an invitation to something already
       happening; it never says these are open roles. The count is exact —
       one lead, one engineer, two advisers. */
    title: 'We are looking for four people.',
    list: [
      'A partnerships lead',
      'A protocol engineer',
      'Two advisers who know real estate and banking',
    ],
    note: 'Equity-only at this stage, and we say that in the first conversation rather than the fourth.',
    link: { href: '/join?as=work', label: 'Get in touch' },
  },
} as const;
