/* The shop. Copy and catalog in one file, because the catalog IS the copy:
 * a product's name, line and details are words someone reads.
 *
 * Merchandise, not a product line. It pays a little, but it is here so
 * members can wear the co-op's name and people ask what it is.
 *
 * Nothing is on sale yet. Every product below is status 'draft', and drafts
 * only render in development or when SHOP_SHOW_DRAFTS=true (see
 * lib/shop/catalog.ts). In production the shop shows its coming-soon state
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

export const SOON = {
  heading: 'The shop opens soon.',
  lede: 'A small run of well-made goods with the Clear name on them. Leave an email and we will tell you when it opens.',
  notifyLabel: 'Email',
  notifyButton: 'Tell me when it opens',
  sending: 'Sending…',
  ok: 'Done. We will email you once, when the shop opens.',
  error: 'That did not send, and nothing was stored. Try again in a minute.',
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
  back: 'Back to the shop',
} as const;
