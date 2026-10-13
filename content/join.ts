/* Join — copy is final and lives here, never inline in JSX.
 *
 * Ported to the redesign mockup (reference/redesign/join.html): the hero and
 * the form are one composition. The four answers are the form bento's header
 * row, the fields follow the chosen answer, and a side panel says what
 * happens next, the one thing that might make you walk away, and how far
 * through the form you are. */

export const META = {
  title: 'Join',
  description:
    'We are onboarding a small number of members and shops in the Inland Empire first. Tell us which one you are.',
} as const;

export const HERO = {
  label: { kicker: 'Join', title: 'The waitlist' },
  lines: ['Tell us which', 'one you are.'],
  lede: 'We are onboarding a small number of members and shops in the Inland Empire first. If you are somewhere else, say so. The waitlist is how we decide where to go next.',
  facts: [
    { k: 'Where we start', v: 'Inland Empire' },
    { k: 'Somewhere else', v: 'Tell us' },
    { k: 'Who reads it', v: 'A founder' },
  ],
} as const;

export type ModeKey = 'member' | 'shop' | 'land' | 'work';

/* Three kinds of question, because three kinds of answer.
   A text box is right for a name and wrong for a quantity: it invites a
   sentence where the reader has to guess the format we want. A select
   carries a list we already know, and a range carries a number the reader
   can feel rather than type. */
export type Field =
  | {
      kind: 'text';
      name: string;
      label: string;
      wide?: boolean;
      autoComplete?: string;
      /* Sets the phone keyboard and a five-character limit. A ZIP typed on
         the letter keyboard is four taps of hunting for the number row. */
      numeric?: boolean;
    }
  | {
      kind: 'select';
      name: string;
      label: string;
      /* Never a pre-selected first option. An untouched control that already
         reads like an answer is how a form collects a value nobody chose. */
      placeholder: string;
      options: string[];
    }
  /* Two handles. A typical ticket is a spread, not a number — a shop doing
     $350 brake jobs and $1,500 transmissions has no single answer, and asked
     for one it picks a middle that describes nothing. */
  | {
      kind: 'range2';
      nameMin: string;
      nameMax: string;
      label: string;
      min: number;
      max: number;
      step: number;
      startLow: number;
      startHigh: number;
      /* A ticket reads in whole dollars ($1,500); a house in thousands
         ($400K) and millions ($1.25M). */
      format: 'usd' | 'usdCompact';
      /* The top of the scale is open-ended: at the ceiling the reader is
         telling us "at least this". */
      topLabel: string;
    }
  | {
      kind: 'range';
      name: string;
      label: string;
      min: number;
      max: number;
      step: number;
      start: number;
      format: 'usd' | 'count';
      topLabel: string;
    };

const ZIP: Field = { kind: 'text', name: 'zip', label: 'ZIP', autoComplete: 'postal-code', numeric: true };

/* Each mode carries two notes: what we will do, and then the thing that might
   make you walk away. The second half is the half that earns trust. */
export const MODES: {
  key: ModeKey;
  n: string;
  tab: string;
  /* Under the tab: what the answer is about. */
  sub: string;
  /* Every mode asks for a name; only the wording changes. A shop is giving us
     a person to call, which is not the same request as "your name". */
  nameLabel: string;
  fields: Field[];
  button: string;
  noteLabel: string;
  next: string;
  caveatLabel: string;
  caveat: string;
}[] = [
  {
    key: 'member',
    n: '01',
    tab: 'I want to join',
    sub: 'Housing and credit',
    nameLabel: 'Your name',
    fields: [ZIP],
    button: 'Join the waitlist',
    noteLabel: 'Anything we should know',
    next: 'You will hear from us before we open in your area, and we will not email you about anything else.',
    caveatLabel: 'What this is not',
    /* Legal: a credit-advertising claim. Verbatim; do not paraphrase it into
       anything stronger than it already is. */
    caveat: 'Joining the waitlist is not an application and does not affect your credit.',
  },
  {
    key: 'shop',
    n: '02',
    tab: 'I run a shop',
    sub: 'Take Clear Pay',
    nameLabel: 'Contact person',
    fields: [
      { kind: 'text', name: 'business', label: 'Business name', wide: true, autoComplete: 'organization' },
      ZIP,
      {
        kind: 'select',
        name: 'industry',
        label: 'What do you do',
        placeholder: 'Choose a trade',
        options: [
          'Auto repair',
          'Tires and wheels',
          'Plumbing, electrical or HVAC',
          'Appliance and home repair',
          'Dental or medical',
          'Veterinary',
          'Furniture and mattress',
          'Something else',
        ],
      },
      {
        kind: 'range2',
        nameMin: 'ticketLow',
        nameMax: 'ticketHigh',
        label: 'Typical ticket',
        min: 100,
        max: 5000,
        step: 50,
        startLow: 350,
        startHigh: 1500,
        format: 'usd',
        topLabel: '$5,000+',
      },
      {
        kind: 'range',
        name: 'jobsPerWeek',
        label: 'Jobs a week, roughly',
        min: 5,
        max: 200,
        step: 5,
        start: 40,
        format: 'count',
        topLabel: '200+',
      },
    ],
    button: 'Request a call',
    noteLabel: 'Anything else we should know?',
    next: 'A founder calls you, not a sales team.',
    caveatLabel: 'The first question',
    caveat: 'Whether you can wait thirty days for the money. If the answer is no, we will say this is not a fit rather than sign you.',
  },
  {
    key: 'land',
    n: '03',
    tab: 'I own property',
    sub: 'Contribute it',
    nameLabel: 'Your name',
    fields: [
      ZIP,
      {
        kind: 'select',
        name: 'propertyType',
        label: 'What do you own',
        placeholder: 'Choose a property type',
        options: [
          'Single-family home',
          'Duplex or fourplex',
          'Vacant land',
          'Commercial building',
          'Mixed-use building',
          'Something else',
        ],
      },
      /* Two handles for the same reason the ticket has two: nobody knows what
         their property is worth to the dollar. Land runs cheap — a small
         parcel is four figures — so the floor and the step are $1,000. */
      {
        kind: 'range2',
        nameMin: 'valueLow',
        nameMax: 'valueHigh',
        label: 'Estimated value',
        min: 1000,
        max: 2000000,
        step: 1000,
        startLow: 400000,
        startHigh: 750000,
        format: 'usdCompact',
        topLabel: '$2M+',
      },
    ],
    button: 'Send the details',
    noteLabel: 'Where is it, and is there a mortgage on it?',
    next: 'We will walk through what a contribution would look like and what it would not.',
    caveatLabel: 'Bring your CPA',
    caveat: 'To the second conversation, not the first. We will send them the documents.',
  },
  {
    key: 'work',
    n: '04',
    tab: 'I want to work on it',
    sub: 'Equity-only',
    nameLabel: 'Your name',
    fields: [],
    button: 'Get in touch',
    noteLabel: 'What would you want to work on?',
    next: 'Everything at this stage is equity-only with no salary, and we say that in the first conversation.',
    caveatLabel: 'Before you write',
    caveat: 'If you need income in the next three months, this is the wrong thing for you.',
  },
];

/* The form's own words: the question the tabs answer, the email field, the
   side panel's labels, and the two halves of a range's spoken name. */
export const FORM = {
  question: 'What are you getting in touch about?',
  email: 'Email',
  next: 'What happens next',
  answers: 'Your answers',
  /* "2 of 3 answered", then "Ready to send". */
  answered: 'answered',
  of: 'of',
  ready: 'Ready to send',
  where: 'Onboarding first in the Inland Empire',
  rangeLow: 'low',
  rangeHigh: 'high',
  /* Client-side check before anything is sent. */
  missingOne: 'One field needs an answer.',
  missingMany: 'fields need an answer.',
} as const;

/* Submitting. The form posts to NEXT_PUBLIC_JOIN_ENDPOINT, and shipping is a
   matter of setting that variable. What it will never do is report success
   without a 2xx from a real endpoint: the live site's old form wrote the
   email to localStorage and showed a success message. If the endpoint is
   missing or the request fails, this says so and says nothing was stored.
   The confirmation repeats back what was sent. */
export const SUBMIT = {
  sending: 'Sending…',
  ok: 'We have it.',
  youSaid: 'You said',
  again: 'Send another',
  /* No address in it, because the site does not publish one yet. When it
     does, add it here — a failure the reader can act on is worth more than
     an apology. */
  error: 'That did not send, and nothing was stored. Please try again.',
} as const;
