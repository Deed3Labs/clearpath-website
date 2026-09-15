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

export const OPENING = {
  kicker: 'Directory',
  heading: 'Spend it close to home.',
  lede: 'Local businesses that take Clear Pay. Paying them keeps money inside the co-op.',
  searchLabel: 'Search the directory',
  searchPlaceholder: 'Search by name, kind of business or city',
  all: 'All',
  noMatch: 'No businesses match that. Try another search or category.',
  count: (n: number) => (n === 1 ? '1 business' : `${n} businesses`),
} as const;

export const TAGS = {
  pay: 'Clear Pay',
  split: 'Split plans',
} as const;

/* No listed partners yet. The page still has two jobs: sign a shop up, and
   collect the places members already go. */
export const EMPTY = {
  heading: 'The first partners are signing on.',
  lede: 'Shops in the Inland Empire are joining now. They appear here once they take Clear Pay.',
  shopButton: 'Bring Clear to your shop',
  referHeading: 'Know a business that should be here?',
  referLede: 'Tell us where you already spend. Members refer most partners.',
} as const;

export const REFER = {
  business: 'Business name',
  city: 'City',
  email: 'Your email',
  button: 'Refer a business',
  sending: 'Sending…',
  ok: 'Thank you. We will reach out to them, and tell you if they join.',
  error: 'That did not send, and nothing was stored. Try again in a minute.',
} as const;

export const WHY = {
  kicker: 'Why spend here',
  sides: [
    { label: 'For members', line: 'Money stays local.', note: 'Every purchase at a partner keeps money inside the co-op and the Inland Empire.' },
    { label: 'For shops', line: 'Paid right away.', note: 'Partners are paid instantly, with no card processing fee.' },
    { label: 'For everyone', line: 'Refer where you go.', note: 'Most partners join because a member asked them to.' },
  ],
} as const;

export const PROFILE = {
  address: 'Address',
  hours: 'Hours',
  phone: 'Phone',
  website: 'Website',
  accepts: 'Takes',
  since: 'Partner since',
  directions: 'Get directions',
  visit: 'Visit website',
  splitNote: 'Members can split a purchase here into a plan.',
  back: 'Directory',
} as const;
