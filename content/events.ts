/* Events. The calendar holds the information and a link out; registration
 * and tickets live on Luma (or wherever registerUrl points).
 *
 * Two kinds of event share the calendar:
 *
 *   Clear's own — community calls, investor calls, town halls, public
 *   hearings, proposal forums. Written here by hand (EVENTS below) and/or
 *   pulled from any iCal feed in EVENTS_ICS_URLS, which is how a Luma
 *   calendar gets in without anyone copying it over.
 *
 *   Local government — council, supervisor and planning meetings in the
 *   Inland Empire, pulled automatically from the public calendars listed in
 *   LOCAL_SOURCES. Nobody types these in.
 *
 * Everything pulled is re-fetched at most hourly (the pages revalidate), so
 * there is no server to run.
 *
 * Legal (§8): investor calls describe the call, never terms, rates or
 * returns, and carry the securities line from the footer on their page.
 */

export type EventType =
  | 'community-call'
  | 'investor-call'
  | 'town-hall'
  | 'public-hearing'
  | 'forum'
  | 'local-government';

export type EventGroup = 'community' | 'investors' | 'governance' | 'local';

export const TYPES: Record<EventType, { label: string; group: EventGroup }> = {
  'community-call': { label: 'Community call', group: 'community' },
  'investor-call': { label: 'Investor call', group: 'investors' },
  'town-hall': { label: 'Town hall', group: 'governance' },
  'public-hearing': { label: 'Public hearing', group: 'governance' },
  forum: { label: 'Proposal forum', group: 'governance' },
  'local-government': { label: 'Local government', group: 'local' },
};

export const GROUPS: { key: EventGroup | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'community', label: 'Community' },
  { key: 'investors', label: 'Investors' },
  { key: 'governance', label: 'Governance' },
  { key: 'local', label: 'Local government' },
];

export type EventFormat = 'online' | 'in-person' | 'hybrid';

/* A Clear event, written by hand. */
export type ClearEventInput = {
  slug: string;
  title: string;
  type: Exclude<EventType, 'local-government'>;
  /* ISO with offset, e.g. 2026-10-08T17:00:00-07:00 */
  startsAt: string;
  endsAt?: string;
  format: EventFormat;
  /* A place for in-person, or "Online" details for online. */
  location?: string;
  summary: string;
  description: string[];
  agenda?: string[];
  host?: string;
  /* Luma (or other) registration link. Without one the page says so. */
  registerUrl?: string;
  /* Free unless a price label is given, e.g. "$10". */
  price?: string;
  status: 'draft' | 'scheduled' | 'cancelled';
};

/* TODO(owner): the drafts below are layout stand-ins — titles, dates and
   descriptions are placeholders, and drafts render only in `next dev` or
   with EVENTS_SHOW_DRAFTS=true. */
export const EVENTS: ClearEventInput[] = [
  {
    slug: 'community-call-how-clear-works',
    title: 'Community call: how Clear works',
    type: 'community-call',
    startsAt: '2026-10-08T17:30:00-07:00',
    endsAt: '2026-10-08T18:30:00-07:00',
    format: 'online',
    location: 'Online. The link comes with your registration.',
    summary: 'A walk through the co-op in plain words, then as many questions as there is time for.',
    description: [
      'Half an hour on how membership, savings and shop plans fit together, and half an hour of questions.',
      'Bring anything. Nobody will ask you to sign up for something on the call.',
    ],
    agenda: ['What the co-op is', 'How a shop plan works', 'Questions'],
    host: 'Clear',
    registerUrl: 'https://lu.ma/',
    status: 'draft',
  },
  {
    slug: 'town-hall-first-cohort',
    title: 'Town hall: the first cohort',
    type: 'town-hall',
    startsAt: '2026-10-22T18:00:00-07:00',
    endsAt: '2026-10-22T19:30:00-07:00',
    format: 'hybrid',
    location: 'Inland Empire, and online',
    summary: 'Where the first homes stand, what members decide next, and how to have a say.',
    description: ['An open meeting for members and anyone thinking of joining.'],
    host: 'Clear',
    registerUrl: 'https://lu.ma/',
    status: 'draft',
  },
  {
    slug: 'investor-call-q4',
    title: 'Investor call',
    type: 'investor-call',
    startsAt: '2026-11-05T10:00:00-08:00',
    endsAt: '2026-11-05T11:00:00-08:00',
    format: 'online',
    location: 'Online. Registration required.',
    summary: 'An update for people considering capital in the co-op. Introductions only.',
    description: ['A progress update and open questions.'],
    host: 'Clear Capital',
    registerUrl: 'https://lu.ma/',
    status: 'draft',
  },
];

/* Public meeting calendars pulled automatically. Each was checked against
   its live API; Redlands and Riverside County publish on systems with no
   public feed, so they are not here yet. `bodies` keeps a source to the
   meetings that decide land, housing and money — a city publishes dozens of
   committees a month. */
export type LocalSource =
  | { kind: 'legistar'; client: string; place: string; bodies: RegExp }
  | { kind: 'primegov'; client: string; place: string; bodies: RegExp };

const KEY_BODIES = /council|supervisors|planning|housing/i;

export const LOCAL_SOURCES: LocalSource[] = [
  { kind: 'legistar', client: 'sanbernardino', place: 'San Bernardino County', bodies: /supervisors/i },
  { kind: 'primegov', client: 'sanbernardino', place: 'City of San Bernardino', bodies: KEY_BODIES },
  { kind: 'primegov', client: 'ranchocucamonga', place: 'Rancho Cucamonga', bodies: KEY_BODIES },
  { kind: 'legistar', client: 'fontana', place: 'Fontana', bodies: KEY_BODIES },
  { kind: 'legistar', client: 'rialto', place: 'Rialto', bodies: KEY_BODIES },
  { kind: 'legistar', client: 'chino', place: 'Chino', bodies: KEY_BODIES },
  { kind: 'legistar', client: 'hesperia', place: 'Hesperia', bodies: KEY_BODIES },
  { kind: 'legistar', client: 'murrieta', place: 'Murrieta', bodies: KEY_BODIES },
];

/* How far ahead to list pulled meetings. Some calendars carry placeholder
   rows years out; past this they are noise. */
export const LOCAL_HORIZON_DAYS = 60;

export const OPENING = {
  kicker: 'Events',
  heading: 'Come to the meeting.',
  lede: 'Community calls, investor calls and co-op governance, most of them free and online. Plus the local meetings that decide what gets built here.',
  subscribe: 'Add Clear events to your calendar',
} as const;

export const LISTING = {
  clearHeading: 'Clear events',
  localHeading: 'Local government',
  localNote: 'Pulled from each city and county calendar and checked hourly. Times and agendas can change; the official listing is the source.',
  register: 'Register',
  details: 'Details',
  free: 'Free',
  cancelled: 'Cancelled',
  noMatches: 'Nothing on the calendar in this category right now.',
} as const;

/* The empty state: no Clear events scheduled. The local meetings still list
   beneath it, so the page is rarely bare. */
export const EMPTY = {
  heading: 'Nothing on the calendar right now.',
  lede: 'Calls and town halls are posted here a few weeks ahead. Leave an email and we will tell you when the next one is scheduled.',
  notify: {
    label: 'Email',
    button: 'Email me when one is posted',
    sending: 'Adding you…',
    ok: 'Done. We will email you when the next event is posted.',
    error: 'That did not send, and nothing was stored. Try again in a minute.',
  },
  localEmpty: 'No upcoming meetings have been posted by these calendars yet.',
} as const;

export const KINDS = {
  kicker: 'What goes on this calendar',
  sides: [
    { label: 'Community', line: 'Community calls.', note: 'How the co-op works, in plain words, with time for questions. Free and online.' },
    { label: 'Investors', line: 'Investor calls.', note: 'Updates for people considering capital in the co-op. Registration required.' },
    { label: 'Governance', line: 'Town halls and hearings.', note: 'Where members hear proposals, argue them out and have a say before a vote.' },
    { label: 'Local government', line: 'The meetings next door.', note: 'Council and planning meetings decide what can be built. They are public, and you can speak.' },
  ],
} as const;

export const DETAIL = {
  when: 'When',
  where: 'Where',
  host: 'Host',
  heldBy: 'Held by',
  price: 'Price',
  agenda: 'Agenda',
  register: 'Register on Luma',
  registerGeneric: 'Register',
  noRegister: 'Registration opens soon.',
  addGoogle: 'Google Calendar',
  addIcs: 'Apple, Outlook (.ics)',
  addTo: 'Add to calendar',
  ended: 'This event has ended.',
  cancelled: 'This event was cancelled.',
  online: 'Online',
  inPerson: 'In person',
  hybrid: 'In person and online',
  localAbout:
    'A public meeting. Anyone can attend, and most allow public comment in person or in writing. The agenda is usually posted a few days before.',
  officialListing: 'Official listing and agenda',
  investorLegal:
    'Nothing on this call or this page is an offer to sell or a solicitation to buy any security.',
} as const;
