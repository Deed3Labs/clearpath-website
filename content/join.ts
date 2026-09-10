/* Join. §6.8 — copy is final and lives here, never inline in JSX. */

export const OPENING = {
  rail: 'Join / 01',
  heading: 'Tell us which one you are.',
  lede:
    'We are onboarding a small number of members and shops in the Inland Empire first. If you are somewhere else, say so — the waitlist is how we decide where to go next.',
} as const;

export type ModeKey = 'member' | 'shop' | 'land' | 'work';

/* Three kinds of question, because three kinds of answer.
   A text box is right for a name and wrong for a quantity: it invites a
   sentence where the reader has to guess the format we want, and it gives us
   "about 40-50 a week" to parse. A select carries a list we already know, and
   a range carries a number the reader can feel rather than type. */
export type Field =
  | {
      kind: 'text';
      name: string;
      label: string;
      wide?: boolean;
      autoComplete?: string;
      /* Sets the phone keyboard, not a validation rule. A ZIP typed on the
         letter keyboard is four taps of hunting for the number row. */
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
      wide?: boolean;
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
      /* A ticket reads in whole dollars; a house does not. "$400,000 –
         $750,000" is nineteen characters beside its own label on a phone. */
      format: 'usd' | 'usdCompact';
      topLabel: string;
      wide?: boolean;
    }
  | {
      kind: 'range';
      name: string;
      label: string;
      min: number;
      max: number;
      step: number;
      start: number;
      /* How the live readout is written, not how the value is submitted. */
      format: 'usd' | 'count';
      /* The top of the scale is open-ended: a shop at the ceiling is telling
         us "at least this", not "exactly this". */
      topLabel: string;
      wide?: boolean;
    };

/* Each mode carries two asides. They were one paragraph, and every one of the
   four had the same shape inside it: what we will do, and then the thing that
   might make you walk away. Split, because the second half is the half that
   earns trust and it was riding at the end of a sentence about scheduling. */
export const MODES: {
  key: ModeKey;
  tab: string;
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
    tab: 'I want to join',
    nameLabel: 'Your name',
    fields: [{ kind: 'text', name: 'zip', label: 'ZIP', autoComplete: 'postal-code', numeric: true }],
    button: 'Join the waitlist',
    noteLabel: 'Anything we should know',
    next: 'You will hear from us before we open in your area, and we will not email you about anything else.',
    caveatLabel: 'What this is not',
    /* §7 Legal: a credit-advertising claim. Do not paraphrase it into
       anything stronger than it already is. */
    caveat: 'Joining the waitlist is not an application and does not affect your credit.',
  },
  {
    key: 'shop',
    tab: 'I run a shop',
    nameLabel: 'Contact person',
    /* The two questions that used to live inside the note are their own rows
       now. Buried in a textarea they were answered in prose or not at all,
       and both are the numbers that decide whether a shop is a fit. */
    fields: [
      { kind: 'text', name: 'business', label: 'Business name', wide: true, autoComplete: 'organization' },
      { kind: 'text', name: 'zip', label: 'ZIP', autoComplete: 'postal-code', numeric: true },
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
        wide: true,
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
        wide: true,
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
    tab: 'I own property',
    nameLabel: 'Your name',
    fields: [
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
        wide: true,
      },
      { kind: 'text', name: 'zip', label: 'ZIP', autoComplete: 'postal-code', numeric: true },
      /* Two handles for the same reason the ticket has two: nobody knows what
         their property is worth to the dollar, and asked for one number they
         either guess or leave it blank. A range is the honest answer and it
         is the one we can work with. Compact notation because these run to
         seven figures. */
      {
        kind: 'range2',
        nameMin: 'valueLow',
        nameMax: 'valueHigh',
        label: 'Estimated value',
        min: 50000,
        max: 2000000,
        step: 25000,
        startLow: 400000,
        startHigh: 750000,
        format: 'usdCompact',
        topLabel: '$2M+',
        wide: true,
      },
    ],
    button: 'Send the details',
    /* The value question left this line when it got a control of its own. */
    noteLabel: 'Where is it, and is there a mortgage on it?',
    next: 'We will walk through what a contribution would look like and what it would not.',
    caveatLabel: 'Bring your CPA',
    caveat: 'To the second conversation, not the first. We will send them the documents.',
  },
  {
    key: 'work',
    tab: 'I want to work on it',
    nameLabel: 'Your name',
    fields: [],
    button: 'Get in touch',
    noteLabel: 'What would you want to work on?',
    next: 'Everything at this stage is equity-only with no salary, and we say that in the first conversation.',
    caveatLabel: 'Before you write',
    caveat: 'If you need income in the next three months, this is the wrong thing for you.',
  },
];

/* §6.8: "Wire the form to a real endpoint or leave a clearly labelled TODO.
   Never a form that silently does nothing."

   The form is now built to submit for real: it posts to
   NEXT_PUBLIC_JOIN_ENDPOINT, and shipping is a matter of setting that
   variable. What it will never do is the thing §6.8 forbids — the live site's
   old form accepted an email, wrote it to localStorage and showed a success
   message. If the endpoint is missing or the request fails, this one says so
   and says nothing was stored. There is no path through it that reports
   success without a 2xx from a real endpoint. */
export const SUBMIT = {
  sending: 'Sending…',
  ok: 'We have it. You will hear from us.',
  /* No address in it, because the site does not publish one yet. When it
     does, add it here — a failure the reader can do something about is worth
     more than an apology. */
  error: 'That did not send, and nothing was stored. Please try again.',
} as const;
