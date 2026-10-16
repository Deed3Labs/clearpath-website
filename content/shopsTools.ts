/* Tools for shops (/shops/tools). Copy lives here, never inline in JSX. The
   spec is the tools view of reference/redesign/shops-tools.html: the till on
   the stage, then the till's fees, tables on ink, rewards, online, the
   hardware on ink, what it costs, and the close.

   The figures are one sample shop's and must agree everywhere they appear:
   - the till: 38.75 + tax at 8.375% (3.25) = $42.00;
   - a $40 sale: Clear $0.60, card tapped $1.43, card by QR $1.76;
   - rewards: $13.55, and she earns 12 points.
   The totals are worked out below from the lines, so a changed line changes
   its total rather than contradicting it. */

const round2 = (n: number) => Math.round(n * 100) / 100;

export const META = {
  title: 'Tools for shops',
} as const;

export const HERO = {
  label: { kicker: 'For shops', title: 'Tools' },
  lines: ['One app for the', 'whole counter.'],
  lede: 'Financing is where Clear starts, not where it stops. The same app rings up the till, runs the floor, keeps your regulars and takes payments on your website. From a $4 coffee to a $940 brake job.',
  primary: { href: '/join?as=shop', label: 'Talk to us about your shop' },
  ghost: { href: '#hardware', label: 'See the hardware' },
  facts: [
    { k: 'The app', v: 'Free · invite-only' },
    { k: 'Card sales', v: 'Your Stripe + 30¢' },
    { k: 'Paid with Clear', v: '1.5%' },
    { k: 'Hardware', v: 'Optional' },
  ],
  stage: { caption: 'The till', sample: 'Sample shop' },
} as const;

/* The merchant app, signed in at a sample taco shop. Shared by the till and
   the tables screens. */
export const APP = {
  brand: 'Clear',
  shop: 'Mi Casa Tacos',
  tabs: ['Counter', 'Tables', 'Charges', 'Inventory'],
  initials: 'AR',
} as const;

/* ── The till (the hero's stage) ──────────────────────────────────────────
   The item grid, then the order: which items, how many. The order's lines,
   count, subtotal, tax and total all come from these two lists. */
const ITEMS = [
  { name: 'Al pastor taco', price: 4.5 },
  { name: 'Carne asada taco', price: 4.75 },
  { name: 'Pollo taco', price: 4.25 },
  { name: 'Fish taco', price: 5.25 },
  { name: 'Carne asada burrito', price: 12.5 },
  { name: 'Bean and cheese burrito', price: 9 },
  { name: 'Chips and salsa', price: 4.5 },
  { name: 'Guacamole', price: 5.5 },
  { name: 'Churros', price: 5.75 },
  { name: 'Mexican Coke', price: 3.5 },
  { name: 'Horchata', price: 3.5 },
  { name: 'Jamaica', price: 3.5 },
] as const;

const ORDER: readonly (readonly [string, number])[] = [
  ['Al pastor taco', 2],
  ['Carne asada burrito', 1],
  ['Chips and salsa', 1],
  ['Mexican Coke', 2],
  ['Churros', 1],
];

const TAX_RATE = 0.08375;
const priceOf = (name: string) => ITEMS.find((i) => i.name === name)?.price ?? 0;
const tillLines = ORDER.map(([name, q]) => ({ label: q > 1 ? `${q} × ${name}` : name, amount: round2(priceOf(name) * q) }));
const tillSubtotal = round2(tillLines.reduce((s, l) => s + l.amount, 0));
const tillTax = round2(tillSubtotal * TAX_RATE);

export const TILL = {
  who: 'Ana · Counter',
  search: 'Search items',
  cats: ['All', 'Tacos', 'Burritos', 'Sides', 'Drinks'],
  items: ITEMS.map((i) => ({ ...i, qty: ORDER.find(([n]) => n === i.name)?.[1] ?? 0 })),
  order: 'Order · Table 4',
  count: `${ORDER.reduce((s, [, q]) => s + q, 0)} items`,
  add: 'Add items',
  lines: tillLines,
  subtotal: { label: 'Subtotal', amount: tillSubtotal },
  tax: { label: 'Tax 8.375%', amount: tillTax },
  total: { label: 'Total', amount: round2(tillSubtotal + tillTax) },
  pay: ['Clear', 'Card', 'Cash'],
  payNote: 'Sent to their phone, or shown as a code on the Point',
  charge: 'Charge',
} as const;

/* ── 01 · At the till ─────────────────────────────────────────────────────
   What a $40 sale costs three ways. Stripe's standard US rates, plus Clear's
   30¢ on a card sale of $10 or more; the bars are sized against the dearest. */
const SALE = 40;
const fee = (pct: number, fixed: number) => round2((SALE * pct) / 100 + fixed);

export const FEES = {
  n: '01',
  label: 'At the till',
  chip: 'Invite-only',
  title: 'Ring it up. Take it however they pay.',
  line: 'Items, tips and tabs on one screen. Card runs on your own Stripe, cash opens the drawer, and Clear lets a member pay now or split it.',
  ck: 'On a $40 sale',
  cells: [
    { who: 'Paid with Clear', fee: fee(1.5, 0), note: '1.5% of the sale', ok: true },
    { who: 'Card, tapped', fee: fee(2.7, 0.05 + 0.3), note: 'Stripe’s in-person rate, plus Clear’s 30¢', ok: false },
    { who: 'Card, by QR', fee: fee(2.9, 0.3 + 0.3), note: 'Stripe’s online rate, plus Clear’s 30¢', ok: false },
  ],
  note: 'Stripe’s standard US rates, about 2.7% + 5¢ in person and 2.9% + 30¢ online. Clear’s 30¢ applies to card sales of $10 or more. An illustration, not a quote.',
} as const;

/* ── 02 · Tables, on ink ──────────────────────────────────────────────────
   The floor screen: who is asking, the eight tables, the wait list. Then the
   Point on the table, in its four states. */
export type TableState = 'free' | 'ord' | 'bill' | 'held' | 'seat' | 'paid' | 'call';

export const TABLES = {
  n: '02',
  label: 'Tables',
  chip: 'In build',
  title: 'The floor, the wait list and the bill on one screen.',
  line: 'A Clear Point on every table. Guests call, see the bill and pay from their seat, and you see who’s asking before they wave.',
  filters: ['All', 'Inside', 'Patio'],
  asking: 'Asking · 2',
  ask: [
    { kind: 'call', title: 'Table 12 · Kim', sub: 'Calling · 2 min ago', action: 'On my way' },
    { kind: 'bill', title: 'Table 4 · Okafor', sub: 'Asked for the bill · 4 min ago', status: 'On their Point' },
  ],
  floor: [
    { n: '1', state: 'free', seats: '2 seats', st: 'Free', meta: '' },
    { n: '2', state: 'ord', amt: '$35.76', st: 'Ordered', meta: 'Diaz · 4 · 38 min' },
    { n: '4', state: 'bill', amt: '$62.00', st: 'Bill sent', meta: 'Okafor · 3 · 52 min' },
    { n: '6', state: 'held', seats: '2 seats', st: 'Held', meta: 'For Ana · 2 min' },
    { n: '7', state: 'seat', seats: '2 seats', st: 'Seated', meta: 'Walk-in · 2 · 6 min' },
    { n: '9', state: 'paid', amt: '$27.40', st: 'Paid', meta: '2 min ago', clr: 'Clear' },
    { n: '12', state: 'call', amt: '$48.20', st: 'Calling', meta: 'Kim · 2 · 41 min' },
    { n: '14', state: 'free', seats: '4 seats', st: 'Free', meta: '' },
  ] as readonly { n: string; state: TableState; seats?: string; amt?: string; st: string; meta: string; clr?: string }[],
  wait: {
    label: 'Wait list · 3',
    add: 'Add a party',
    next: 'Next',
    rows: [
      { name: 'Lee', next: true, sub: ['Party of 4 · waited ', '22 min', ' · told 20 min'], action: 'Seat at 14', solid: true },
      { name: 'Marco', sub: ['Party of 3 · waited 12 min · told 15 min'], action: 'Seat' },
      { name: 'Priya', sub: ['Party of 2 · waited 6 min · told 15 min'], action: 'Seat at 1' },
    ] as readonly { name: string; next?: boolean; sub: readonly string[]; action: string; solid?: boolean }[],
  },
  /* The phone layout: the floor as a list, grouped by state. `tone` colours
     the right-hand figure: w waiting on you, k paid, f free. */
  phone: {
    tabs: ['Floor', 'Wait list · 3'],
    groups: [
      {
        label: 'Asking · 2',
        rows: [
          { n: '12', b: 'Kim · 2', s: 'Calling · 2 min ago', r: 'On my way', tone: 'w', call: true },
          { n: '4', b: 'Okafor · 3', s: 'Asked for the bill · 4 min', r: '$62.00', tone: 'w' },
        ],
      },
      {
        label: 'Seated',
        rows: [
          { n: '2', b: 'Diaz · 4', s: 'Ordered · 38 min', r: '$35.76' },
          { n: '7', b: 'Walk-in · 2', s: 'Seated · 6 min', r: '' },
        ],
      },
      { label: 'Held', rows: [{ n: '6', b: 'For Ana', s: '2 min', r: 'Held' }] },
      { label: 'Paid', rows: [{ n: '9', b: 'Paid · 2 min ago', s: 'Clears itself in 8 min', r: '$27.40', tone: 'k' }] },
      { label: 'Free', rows: [{ n: '1', b: '2 seats', s: 'Inside', r: 'Seat', tone: 'f' }] },
    ] as readonly {
      label: string;
      rows: readonly { n: string; b: string; s: string; r: string; tone?: 'w' | 'k' | 'f'; call?: boolean }[];
    }[],
  },
  /* The Point's screen in each state. The caption carries what the screen
     says, so the images are decorative. */
  points: [
    { src: '/shops/tools/point-free.jpg', k: 'Free', v: 'The number and the menu' },
    { src: '/shops/tools/point-held.jpg', k: 'Seated', v: 'Who it’s for' },
    { src: '/shops/tools/point-bill.jpg', k: 'Bill', v: 'Scan or tap to pay' },
    { src: '/shops/tools/point-call.jpg', k: 'Calling', v: 'Someone’s coming over' },
  ],
} as const;

/* ── 03 · Rewards ─────────────────────────────────────────────────────────
   Her phone, your cart, your rules. The cart's total comes from its lines. */
const rwLines = [
  { label: '2 × Al pastor taco', amount: 9 },
  { label: 'Horchata, Jamaica', amount: 7 },
];
const rwReward = -3.5;
const rwTax = 1.05;
const rwTotal = round2(rwLines.reduce((s, l) => s + l.amount, 0) + rwReward + rwTax);

export const REWARDS = {
  n: '03',
  label: 'Rewards',
  chip: 'In build',
  title: 'Your own rewards app. Nobody downloads anything.',
  line: 'Points and offers in your colours at useclear.org/s/yourshop. Scan a regular once at the cart, and the points land however they pay.',
  phone: {
    who: 'Their phone',
    url: 'useclear.org/s/micasa',
    src: '/shops/tools/rewards-micasa-home.png',
    alt: 'Mi Casa Tacos in its rewards app: 128 points, a free agua fresca ready, the Clear balance of $212.40, and two offers',
  },
  cart: {
    who: 'Your cart',
    ck: 'Scanned once',
    title: 'Their code joins the order. Nothing else gets scanned.',
    member: { initials: 'SM', name: 'Sofia M.', sub: '128 points · Clear member', act: 'Remove' },
    lines: rwLines,
    reward: { label: 'Free agua fresca', sub: '75 of her 128 points', amount: rwReward },
    tax: { label: 'Tax', amount: rwTax },
    total: { label: 'Total', amount: rwTotal },
    text: 'She earns 12 points. With Clear, the request goes straight to her phone; card and cash earn the same.',
  },
  rules: {
    who: 'Your rules',
    ck: 'Settings › Shop app',
    title: 'You decide what a point is worth.',
    rows: [
      { k: 'Points', v: '1 for every $1' },
      { k: 'Boost', v: 'Double on Tuesdays' },
      { k: 'Paying with Clear', v: '1.5×' },
      { k: 'Rewards at', v: '75 · 150 · 300 · 600' },
      { k: 'Points expire', v: 'Never' },
    ],
    text: 'Your own domain and an app in the stores are paid add-ons.',
  },
} as const;

/* ── 04 · Online ──────────────────────────────────────────────────────────
   The shop's own checkout with Clear's modal on top (a browser on a desk, a
   bottom sheet on a phone), the whole integration, and the link for a shop
   with no website. */
export const ONLINE = {
  n: '04',
  label: 'Online',
  chip: 'Planned',
  title: 'Pay with Clear, on your website.',
  line: 'Paste one script, or ask your AI to. Your own button opens Clear’s checkout, and card is always there.',
  checkout: {
    who: 'Your checkout',
    ck: 'Clear’s modal on top',
    url: 'micasatacos.com/catering/checkout',
    title: 'Your catering order',
    when: 'Saturday Oct 24 · pickup 11:30am',
    lines: [
      { k: 'Taco tray for 12', v: '$149.00' },
      { k: '2 × Agua fresca, gallon', v: '$22.00' },
      { k: 'Tax', v: '$14.32' },
    ],
    total: { k: 'Total', v: '$185.32' },
    button: 'Pay with Clear',
    buttonNote: 'Pay now, or split it. Card works too.',
    phone: { summary: 'Taco tray for 12, 2 × agua fresca', total: 'Total $185.32' },
  },
  modal: {
    initials: 'MC',
    shop: 'Mi Casa Tacos',
    amount: '$185.32',
    close: '×',
    title: 'Pay with Clear',
    text: 'Sign in to your Clear account to pay now or split it. New to Clear? You can join here.',
    field: { label: 'Email or phone', value: 'sofia.m@gmail.com' },
    go: 'Continue',
    or: 'or',
    card: 'Pay by card',
    secured: 'Secured by Clear · pay.useclear.org',
    phone: { text: 'Approve with Clear, or sign in with your email or phone.', approve: 'Approve with Clear', other: 'Use email or phone' },
  },
  integration: {
    who: 'The whole integration',
    ck: 'HTML',
    /* Each line of the snippet as runs: c comment, s string, k the call. */
    code: [
      [{ t: '<!-- your button, your styles -->', c: 'c' }],
      [{ t: '<button id=' }, { t: '"pay"', c: 's' }, { t: '>Pay with Clear</button>' }],
      [],
      [{ t: '<script src=' }, { t: '"https://js.useclear.org/v1"', c: 's' }, { t: '></script>' }],
      [{ t: '<script>' }],
      [{ t: '  ' }, { t: 'Clear', c: 'k' }, { t: '(' }, { t: '"pk_live_mc8Q2v"', c: 's' }, { t: ').attach(' }, { t: '"#pay"', c: 's' }, { t: ', {' }],
      [{ t: '    price: ' }, { t: '"price_tacotray12"', c: 's' }, { t: ',' }],
      [{ t: '    onSuccess: (p) => location.href = ' }, { t: '"/thanks"', c: 's' }, { t: ',' }],
      [{ t: '  });' }],
      [{ t: '</script>' }],
    ] as readonly (readonly { t: string; c?: 'c' | 's' | 'k' }[])[],
    text: 'With a server, create the payment there and hand the button its id. Either way the amount never comes from the page.',
    link: {
      title: 'No website? Send a link.',
      url: 'pay.useclear.org/l/micasa-tray12',
      note: 'A link or a QR for an amount or an item. Ships first.',
    },
  },
} as const;

/* ── 05 · Hardware, on ink ────────────────────────────────────────────────
   Five tiles from the catalog (content/shop.ts): the first render, the
   price and the deposit. A tile links to its product only when the shop
   shows it, and the two links into the shop show only when at least one
   piece of hardware is visible. */
export const HARDWARE = {
  n: '05',
  label: 'Hardware',
  chip: 'Pre-order',
  title: 'No hardware required. If you want ours, reserve it.',
  line: 'Points for tables and the counter, a dock for Stripe’s reader, 8- and 10-inch tablets, a thin drawer and a label printer. Keep the reader and printer you already have.',
  more: { href: '/shop#for-shops', label: 'Reserve in the shop' },
  lineup: ['clear-point', 'clear-tap', 'clear-counter', 'clear-drawer', 'label-printer'],
  from: 'From',
  reserve: 'Reserve',
  how: [
    { n: '01', title: 'Reserve at cost.', text: 'The deposit covers building yours. The rest is charged the day it ships.' },
    { n: '02', title: 'Refundable until we build it.', text: 'We email before we start. Change your mind before then and it all comes back.' },
    { n: '03', title: 'For shops on Clear.', text: 'Anyone can browse. Checkout asks you to sign in to your shop or set one up.' },
  ],
} as const;

/* ── 06 · What it costs ─────────────────────────────────────────────────── */
export const COSTS = {
  n: '06',
  label: 'What it costs',
  title: 'You pay on what you take.',
  line: 'No subscription to cancel and nothing to lease. Founding partners get better rates; ask us.',
  rows: [
    { k: 'The merchant app', v: 'Free', note: 'No monthly fee, no contract.' },
    { k: 'Financing', v: '2.5% of the ticket', note: 'Paid on net-30. Clear carries the default.', link: { href: '/shops', label: 'For shops' } },
    { k: 'Paid now with Clear', v: '1.5% of the sale', note: 'At the counter, at the table or online.' },
    { k: 'Cards', v: 'Your Stripe rate, plus 30¢', note: 'On card sales of $10 or more. The money lands in your own Stripe.' },
    { k: 'Rewards app', v: 'Free', note: 'At useclear.org/s/yourshop. Your own domain and a store app cost extra.' },
    { k: 'Pay with Clear online', v: 'The same as the counter', note: 'Clear at 1.5%, card at your Stripe rate plus 30¢.' },
    /* The link into the shop shows only when hardware is visible there. */
    { k: 'Hardware', v: 'Optional', note: 'Reserve at cost, the rest when it ships.', link: { href: '/shop#for-shops', label: 'See the shop' }, hardware: true },
  ] as readonly { k: string; v: string; note: string; link?: { href: string; label: string }; hardware?: boolean }[],
} as const;

/* ── 07 · Start (the close) ─────────────────────────────────────────────── */
export const CLOSE = {
  n: '07',
  label: 'Start',
  title: 'Start with the part you need.',
  line: 'Most shops start with the app and a Point on the counter. We set it up with you.',
  primary: { href: '/join?as=shop', label: 'Talk to us about your shop' },
  ghost: { href: '/shops', label: 'Back to For shops' },
} as const;

/* The shared link card. */
export const OG = {
  kicker: 'For shops · Tools',
  headline: 'One app for the whole counter.',
} as const;
