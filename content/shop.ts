/* The shop. Copy and catalog in one file, because the catalog IS the copy:
 * a product's name, line and details are words someone reads.
 *
 * Merchandise, not a product line. It pays a little, but it is here so
 * members can wear the co-op's name and people ask what it is.
 *
 * Nothing is on sale yet. Every product below is status 'draft', and drafts
 * only render in development or when SHOP_SHOW_DRAFTS=true (see
 * lib/shop/catalog.ts). In production the shop shows its closed state
 * until at least one product is 'live' — flip a status and redeploy.
 *
 * TODO(owner): the three drafts are layout stand-ins. Names, prices, sizes,
 * weights and details are placeholders to design against, not decisions.
 */

export type ProductKind = 'tee' | 'cap' | 'tote';

/* The ground a product is drawn on when there is no photograph yet. Tokens,
   not hexes — see .shop-plate in globals.css. */
export type PlateTone = 'ink' | 'land' | 'paper';

export type Variant = { id: string; label: string; soldOut?: boolean };

export type Product = {
  slug: string;
  name: string;
  /* One line under the name. */
  line: string;
  description: string;
  /* In cents. Prices are only ever read on the server when charging. */
  priceCents: number;
  kind: ProductKind;
  tone: PlateTone;
  /* Label for the variant picker, or omit for a one-size product. */
  variantLabel?: string;
  variants: Variant[];
  details: string[];
  /* Packed weight of one unit, in ounces. Drives the Shippo parcel. */
  weightOz: number;
  /* Photographs, in /public. Until there are some, the plate is drawn. */
  images?: { src: string; alt: string }[];
  status: 'draft' | 'live';
};

export const PRODUCTS: Product[] = [
  {
    slug: 'member-tee',
    name: 'Member tee',
    line: 'Heavyweight cotton, mark on the chest.',
    description:
      'A plain, heavy tee with the Clear mark embroidered small on the chest. Nothing on the back, nothing to explain.',
    priceCents: 3200,
    kind: 'tee',
    tone: 'ink',
    variantLabel: 'Size',
    variants: [
      { id: 's', label: 'S' },
      { id: 'm', label: 'M' },
      { id: 'l', label: 'L' },
      { id: 'xl', label: 'XL' },
      { id: 'xxl', label: 'XXL' },
    ],
    details: ['100% cotton', 'Embroidered mark', 'Relaxed fit'],
    weightOz: 8,
    status: 'draft',
  },
  {
    slug: 'coop-cap',
    name: 'Co-op cap',
    line: 'Six panels, unstructured, adjustable strap.',
    description:
      'A soft six-panel cap with the mark on the front. One size, with a strap at the back.',
    priceCents: 2800,
    kind: 'cap',
    tone: 'land',
    variants: [{ id: 'one', label: 'One size' }],
    details: ['Cotton twill', 'Embroidered mark', 'One size, adjustable'],
    weightOz: 4,
    status: 'draft',
  },
  {
    slug: 'canvas-tote',
    name: 'Canvas tote',
    line: 'Heavy canvas, long handles, carries a week of groceries.',
    description:
      'A heavy canvas tote with long handles and the wordmark printed on one side.',
    priceCents: 2400,
    kind: 'tote',
    tone: 'paper',
    variants: [{ id: 'one', label: 'One size' }],
    details: ['Heavy cotton canvas', 'Printed wordmark', 'Handles fit over a shoulder'],
    weightOz: 7,
    status: 'draft',
  },
];

/* The most of one line anyone can put in a bag. Keeps an order a parcel,
   not a pallet — larger orders are a conversation. */
export const MAX_PER_LINE = 10;
export const MAX_LINES = 20;

export const OPENING = {
  heading: 'Wear the co-op.',
  lede: 'A small run of well-made goods with the Clear name on them. Wear it and people ask what it is.',
} as const;

/* Open or closed. The shop closes for ordinary reasons — it sold out, it is
   restocking, it is packing a big batch of orders, it is on a break — and the
   closed page is one page whose words follow the reason. Closing is real, not
   cosmetic: product pages swap the buy button for a notice, the bag cannot
   get rates or pay, and the checkout API refuses.

   Change `open`/`reason` here and redeploy. SHOP_OPEN=true|false in the
   environment overrides `open` without a code change (still needs a
   redeploy, because the pages are static). The shop is also closed whenever
   no product is live, whatever this says. */
/* Where order questions go. Replies to the Stripe receipt should reach the
   same inbox: set it as the support email in Stripe's public business details. */
export const SUPPORT_EMAIL = 'support@useclear.org';

export type ClosedReason = 'not-open-yet' | 'sold-out' | 'restocking' | 'packing-orders' | 'break';

export const SHOP_STATUS: {
  open: boolean;
  reason: ClosedReason;
  /* ISO date (YYYY-MM-DD) or null. Only set a date you will keep. */
  reopensAt: string | null;
} = {
  open: false,
  reason: 'not-open-yet',
  reopensAt: null,
};

export const CLOSED_REASONS: Record<
  ClosedReason,
  { label: string; sign: string; heading: string; lede: string; ordersShipping: boolean }
> = {
  'not-open-yet': {
    label: 'Not open yet',
    sign: 'Opening soon',
    heading: 'Not open yet.',
    lede: 'The first run is still being made. Leave an email and we will tell you the day the doors open.',
    ordersShipping: false,
  },
  'sold-out': {
    label: 'Sold out',
    sign: 'Sold out',
    heading: 'Sold out, for now.',
    lede: 'Everything from this run has gone. Leave an email and we will tell you when the next one is in.',
    ordersShipping: true,
  },
  restocking: {
    label: 'Restocking',
    sign: 'Restocking',
    heading: 'Restocking the shelves.',
    lede: 'New stock is on its way. Leave an email and we will tell you the day the doors reopen.',
    ordersShipping: true,
  },
  'packing-orders': {
    label: 'Packing orders',
    sign: 'Packing orders',
    heading: 'Packing your orders.',
    lede: 'We closed the doors for a few days to get every order out properly. Leave an email and we will tell you when we reopen.',
    ordersShipping: true,
  },
  break: {
    label: 'Short break',
    sign: 'Back soon',
    heading: 'Closed for a short break.',
    lede: 'The shop is taking a few days off. Leave an email and we will tell you when it reopens.',
    ordersShipping: true,
  },
};

export const CLOSED = {
  signTop: 'Sorry, we are',
  signWord: 'Closed',
  status: 'Closed',
  notifyLabel: 'Email',
  notifyButton: 'Email me when it opens',
  sending: 'Adding you…',
  ok: 'Done. We will email you once, when the shop opens.',
  error: 'That did not send, and nothing was stored. Try again in a minute.',
  board: {
    doors: 'Doors',
    reason: 'Why',
    back: 'Back',
    backUnset: 'When it is ready',
    orders: 'Orders already placed',
    ordersValue: 'Still shipping',
  },
  /* The second band: what someone arriving at a closed shop actually needs. */
  meanwhile: {
    kicker: 'While we are closed',
    ordered: {
      label: 'Already ordered?',
      line: 'It still ships.',
      note: 'Orders placed before we closed go out as normal. Tracking comes by email.',
    },
    list: {
      label: 'Want to know first?',
      line: 'Join the list.',
      note: 'One email the day the doors open. Nothing else.',
    },
    question: {
      label: 'Question about an order?',
      line: 'Reply to your receipt.',
      note: 'Reply to your order confirmation, or email us at',
    },
  },
  /* Product pages and the bag, while closed. */
  productNote: 'The shop is closed right now, so this cannot be ordered.',
  bagNote: 'The shop is closed right now. Your bag is saved on this device for when it reopens.',
  seeWhy: 'See why',
  closing: {
    line: 'Doors closed. List open.',
    button: 'Email me when it opens',
  },
} as const;

export const WHY = {
  kicker: 'What it is for',
  sides: [
    {
      label: 'Small runs',
      line: 'Made in batches.',
      note: 'Nothing is stocked by the thousand. When something sells out it may not come back.',
    },
    {
      label: 'Made to last',
      line: 'Worth wearing twice.',
      note: 'We would rather sell you one good shirt than three that shrink.',
    },
    {
      label: 'Where it goes',
      line: 'Back into the co-op.',
      note: 'What the shop earns pays for getting the word out, so more people hear about Clear.',
    },
  ],
} as const;

export const PRODUCT_COPY = {
  addToBag: 'Add to bag',
  added: 'Added',
  soldOut: 'Sold out',
  quantity: 'Quantity',
  details: 'Details',
  shipping: 'Ships within the US. Shipping is quoted at checkout from live carrier rates.',
} as const;

export const BAG = {
  heading: 'Your bag.',
  empty: 'Nothing in here yet.',
  emptyLink: 'Back to the shop',
  subtotal: 'Subtotal',
  shipping: 'Shipping',
  total: 'Total',
  remove: 'Remove',
  addressHeading: 'Where should it go?',
  addressNote: 'US addresses only for now.',
  getRates: 'Get shipping rates',
  gettingRates: 'Checking carriers…',
  ratesHeading: 'Choose shipping',
  pay: 'Pay with card',
  paying: 'Opening checkout…',
  taxNote: 'Card payment is handled by Stripe. We never see your card number.',
} as const;

export const THANKS = {
  heading: 'Thank you.',
  lede: 'Your order is in. Stripe is emailing a receipt, and we will send tracking once it ships.',
  questions: 'Questions about your order? Reply to the receipt, or email',
  back: 'Back to the shop',
} as const;
