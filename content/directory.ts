/* The directory: local businesses that take Clear Pay.
 *
 * The member app has the same list (Clear Partners). Its data is placeholder
 * today, and a public page must never show a business as a partner that is
 * not one — so nothing here renders on the live site until it is real:
 *
 *   status 'listed' — a real partner that has agreed to be listed. Shows.
 *   status 'draft'  — a layout stand-in. Shows only in `next dev`, or on a
 *                     deploy with DIRECTORY_SHOW_DRAFTS=true.
 *
 * The fields follow the merchant app's profile (name, category, town, partner
 * since) so a feed from the merchant database can replace this file later
 * without the pages changing. Until then, add a partner here and redeploy.
 */

export type Partner = {
  slug: string;
  name: string;
  category: string;
  city: string;
  /* One or two sentences in the business's own words, or ours. */
  about?: string;
  address?: string;
  hours?: string;
  website?: string;
  phone?: string;
  /* Members can split a purchase here ("Split plans"), as well as pay. */
  splitPlans?: boolean;
  /* YYYY-MM, when they started taking Clear. */
  partnerSince?: string;
  status: 'draft' | 'listed';
};

/* TODO(owner): stand-ins only. They are invented and must stay 'draft'. */
export const PARTNERS: Partner[] = [
  {
    slug: 'sample-auto-and-tire',
    name: 'Sample Auto & Tire',
    category: 'Auto & tires',
    city: 'Redlands',
    about: 'Brakes, tires and repairs. Big jobs can be split into a plan.',
    address: '100 Example Street, Redlands, CA',
    hours: 'Mon–Sat, 8 AM – 6 PM',
    website: 'https://example.com',
    splitPlans: true,
    partnerSince: '2026-08',
    status: 'draft',
  },
  {
    slug: 'sample-coffee',
    name: 'Sample Coffee',
    category: 'Food & drink',
    city: 'San Bernardino',
    about: 'Coffee and pastries, a block from the library.',
    address: '200 Example Avenue, San Bernardino, CA',
    hours: 'Every day, 6 AM – 3 PM',
    partnerSince: '2026-09',
    status: 'draft',
  },
  {
    slug: 'sample-electric',
    name: 'Sample Electric',
    category: 'Trades',
    city: 'Fontana',
    about: 'Residential electrical work, panel upgrades and EV chargers.',
    phone: '(909) 555-0100',
    splitPlans: true,
    status: 'draft',
  },
];

/* ── The page's copy, ported from reference/redesign/directory.html ─────── */

export const META = {
  title: 'Directory',
  description: 'Local businesses in the Inland Empire that take Clear Pay.',
} as const;

export const OPENING = {
  label: { kicker: 'Community', title: 'Directory' },
  lines: ['Spend it close', 'to home.'],
  lede: 'Local businesses that take Clear Pay. Paying them keeps money inside the co-op.',
  searchLabel: 'Search the directory',
  searchPlaceholder: 'Search by name, kind of business or city',
  clearSearch: 'Clear search',
  catLabel: 'Kind of business',
  all: 'All',
  list: 'Partners',
  noMatch: 'No businesses match that. Try another search or category.',
  count: (n: number) => (n === 1 ? '1 business' : `${n} businesses`),
  none: 'None listed yet',
} as const;

/* The hero's facts. With partners each line is counted from the listed
   partners (the figure, then the words after it); with none they say what
   is happening instead. */
export const FACTS = {
  listed: [
    { k: 'Businesses', after: 'take Clear Pay' },
    { k: 'Towns', after: 'so far' },
    { k: 'Split plans', after: 'offer them' },
  ],
  empty: [
    { k: 'Businesses', v: 'Signing on now' },
    { k: 'Where first', v: 'Inland Empire' },
    { k: 'How they join', v: 'Members refer them' },
  ],
} as const;

export const TAGS = {
  pay: 'Clear Pay',
  split: 'Split plans',
} as const;

/* The map beside the list. Drawn, not to scale. */
export const MAP = {
  label: 'Map',
  who: 'Inland Empire',
  ck: 'Drawn, not to scale',
  legendPay: 'Takes Clear Pay',
  legendSplit: 'Also offers split plans',
  byTown: 'By town',
  peekPay: 'Takes Clear Pay',
  peekSplit: 'Clear Pay and split plans',
  hours: 'Hours',
  address: 'Address',
  phone: 'Phone',
  emptyLabel: 'Where first',
  emptyNote: 'The Inland Empire. Pins appear as partners start taking Clear Pay.',
} as const;

/* The towns on the map, placed from their real relative positions (longitude
   and latitude projected onto the 640 × 420 drawing; roads simplified), with
   where each label sits from its dot. A partner in a town missing here still
   lists, without a pin: add the town to put it on the map. */
export const TOWNS: Record<string, { x: number; y: number; label: [number, number] }> = {
  'Rancho Cucamonga': { x: 165, y: 139, label: [0, 22] },
  Fontana: { x: 311, y: 157, label: [0, 24] },
  Rialto: { x: 371, y: 139, label: [0, 22] },
  'San Bernardino': { x: 446, y: 137, label: [0, -32] },
  Redlands: { x: 544, y: 202, label: [0, 30] },
  Riverside: { x: 347, y: 333, label: [0, 24] },
  Ontario: { x: 111, y: 194, label: [0, -12] },
  Chino: { x: 76, y: 258, label: [0, 22] },
};

/* No listed partners yet. The page still has two jobs: sign a shop up, and
   collect the places members already go. */
export const EMPTY = {
  chip: 'Signing on',
  heading: 'The first partners are signing on.',
  lede: 'Shops in the Inland Empire are joining now. They appear here once they take Clear Pay.',
  shopButton: 'Bring Clear to your shop',
  referN: '01',
  referLabel: 'Refer a business',
  referHeading: 'Know a business that should be here?',
  referLede: 'Tell us where you already spend. Members refer most partners.',
} as const;

export const REFER = {
  who: 'Refer a business',
  ck: 'Takes a minute',
  business: 'Business name',
  businessPlaceholder: 'What it is called',
  city: 'City',
  cityPlaceholder: 'Where it is',
  email: 'Your email',
  emailPlaceholder: 'you@example.com',
  foot: 'Your email is only used to tell you if they join.',
  button: 'Refer a business',
  sending: 'Sending…',
  sent: 'Sent',
  ok: (business: string) => `Thank you. We will reach out to ${business}, and tell you if they join.`,
  again: 'Refer another',
  error: 'That did not send, and nothing was stored. Try again in a minute.',
} as const;

export const WHY = {
  n: '02',
  label: 'Why spend here',
  title: 'The money goes round, and stays.',
  line: 'A purchase at a partner pays a neighbour, not a card network.',
  sides: [
    { label: 'For members', line: 'Money stays local.', note: 'Every purchase at a partner keeps money inside the co-op and the Inland Empire.' },
    { label: 'For shops', line: 'Paid right away.', note: 'Partners are paid instantly, with no card processing fee.' },
    { label: 'For everyone', line: 'Refer where you go.', note: 'Most partners join because a member asked them to.' },
  ],
  /* The words inside the three drawings. */
  art: {
    member: 'Member',
    partner: 'Partner',
    coop: 'Co-op',
    clearPay: 'Clear Pay',
    salePaid: 'Sale · paid',
    card: 'Card',
    sale: 'Sale',
    later: 'Paid, days later',
    referred: 'Referred by a member',
  },
} as const;

export const PROFILE = {
  crumb: 'Directory',
  all: 'All partners',
  visit: 'Visit',
  address: 'Address',
  hours: 'Hours',
  phone: 'Phone',
  accepts: 'Takes',
  acceptsSplit: 'Clear Pay, split plans',
  since: 'Partner since',
  directions: 'Get directions',
  website: 'Visit website',
  call: (phone: string) => `Call ${phone}`,
  splitNote: 'Members can split a purchase here into a plan.',
  mapCaption: 'Drawn, not to scale',
  near: { n: 'Near', label: 'Also takes Clear Pay' },
} as const;
