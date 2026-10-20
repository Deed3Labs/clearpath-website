/* The shop. Copy and catalog in one file, because the catalog IS the copy:
 * a product's name, line and details are words someone reads.
 *
 * Two sections. The goods are merchandise, not a product line: they pay a
 * little, but they are here so members can wear the co-op's name and people
 * ask what it is. For shops is the hardware that runs Clear at a shop,
 * reserved before it is built (a deposit now, the rest when it ships).
 *
 * A product shows on production once its status is 'live'; drafts only
 * render in development or when SHOP_SHOW_DRAFTS=true (see
 * lib/shop/catalog.ts). Flip a status and redeploy.
 *
 * The goods are on pre-order: paid in full today, made in one run, shipped
 * in GOODS_SHIPS. Their prices, colours and packed weights were decided with
 * the wearables brief (reference/redesign/wearables/PROMPT.md). The shelf
 * draws them; their pages add renders and mockups made from the flat
 * sketches, labelled as such, until there are photographs (`images`).
 */

/* The month the goods' first run ships, estimated: on every goods tile, page,
   bag line and receipt. TODO(owner): confirm it with the maker. */
export const GOODS_SHIPS = 'Jan 2027';

/* Goods are drawn from SHAPES (components/shop/ProductPlate.tsx); hardware
   from HW_SHAPES (components/shop/hardwareShapes.ts, generated from the spec). */
export type GoodsKind = 'tee' | 'tee-ls' | 'turtleneck' | 'hoodie' | 'cap' | 'tote' | 'patch';
export type HardwareKind =
  | 'point'
  | 'point-large'
  | 'pay-case'
  | 'tap'
  | 'tap-phone'
  | 'counter'
  | 'drawer'
  | 'printer'
  | 'stand'
  | 'panels'
  | 'kit';
export type ProductKind = GoodsKind | HardwareKind;

const GOODS_KINDS: readonly string[] = ['tee', 'tee-ls', 'turtleneck', 'hoodie', 'cap', 'tote', 'patch'] satisfies GoodsKind[];
export const isGoodsKind = (k: ProductKind): k is GoodsKind => GOODS_KINDS.includes(k);

/* The ground a product is drawn on when there is no photograph yet. Tokens,
   not hexes — see .plate in app/shop/shop.css. */
export type PlateTone = 'ink' | 'land' | 'paper';

/* A variant's price overrides the product's. `depositCents` is what a
   pre-order reserves now; the rest is charged when it ships. `per` replaces
   "each" after the price ("for ten").
   A garment in colours lists every colour × size as its own variant, so
   the bag, checkout, Stripe and the owner scripts still handle one
   `variant` string: `{ id: 'black-m', label: 'Black · M', colour: 'black',
   size: 'm' }`. */
export type Variant = {
  id: string;
  label: string;
  soldOut?: boolean;
  priceCents?: number;
  depositCents?: number;
  per?: string;
  /* A Colour's id, and the size's id ("m"), on a variant of a garment in colours. */
  colour?: string;
  size?: string;
};

/* A garment's colour. `swatch` is product data, the one colour on the site
   that is not a token: it is passed to the picker as an inline custom
   property. `tone` is the drawing's ground in that colour. */
export type Colour = {
  id: string;
  label: string;
  swatch: string;
  tone: PlateTone;
  /* Drawn filled with its swatch: a colour its tone's ground cannot show
     (Cobalt, on the dark ground). */
  fill?: boolean;
};

/* A hardware product's pictures, in gallery order: renders, then CAD sheets
   (the drawing from HW_SHAPES sits between them). `caption` follows the
   kind's word in the gallery: "Render · On a table, with the bill".
   Goods take renders and mockups made from the flat sketches; a picture
   with a `colour` (a Colour's id) shows only while that colour is picked.
   A picture with a `variant` (a variant's id, as the patch's shapes) shows
   only while that variant is picked; one with neither shows for all. */
export type Media = { kind: 'render' | 'mock' | 'cad'; src: string; alt: string; caption: string; colour?: string; variant?: string };

export type Product = {
  slug: string;
  /* 'goods' sit on the shelf; 'for-shops' is the hardware, in its own
     section of /shop. */
  section: 'goods' | 'for-shops';
  name: string;
  /* One line under the name. */
  line: string;
  description: string;
  /* In cents. Prices are only ever read on the server when charging. A
     variant's priceCents overrides this (see lib/shop/price.ts). */
  priceCents: number;
  kind: ProductKind;
  tone: PlateTone;
  /* The shelf's filter, and the tile's header: "Wear", "Headwear", "Carry"…
     The category chips only appear once five or more products are live. */
  category: string;
  /* More shelf filters this product is listed under, besides its category:
     a Logo garment is Wear and Logo, a Graphic Tee is Graphic Tees and
     Wear. */
  alsoIn?: string[];
  /* The large tile, once five or more products are live. Without one, the
     first product takes it. */
  featured?: boolean;
  /* Label for the variant picker, or omit for a one-size product. */
  variantLabel?: string;
  variants: Variant[];
  /* A garment's colours, in display order; the first is the default. */
  colours?: Colour[];
  details: string[];
  /* Packed weight of one unit, in ounces. Drives the Shippo parcel. */
  weightOz: number;
  /* Photographs, in /public. Until there are some, the plate is drawn. */
  images?: { src: string; alt: string }[];
  /* Goods sold before they are made: paid in full today, shipped in this
     month (a display month). Hardware uses `preorder` instead. */
  ships?: string;
  /* Hardware is reserved, not bought: a deposit now, the rest when it ships
     (`ships`, a display month). `fcc` marks a product awaiting FCC
     equipment authorization; its notice is `fcc` below. Neither is shown on
     the site (the owner took the notice off the product pages); kept as the
     record of which products await authorization. */
  preorder?: { ships: string; fcc: boolean };
  /* The FCC notice, worded for this product. */
  fcc?: string;
  /* The founding-partner note under the reserve button. */
  founding?: string;
  media?: Media[];
  /* What a product draws on top of its kind's plate (see PlateArt). */
  plate?: PlateArt;
  status: 'draft' | 'live';
};

/* A product's own layer on its kind's drawing: a Graphic Tee is the Logo
   Tee's plate with a print on the front, and its patch moved to the sleeve.
   - print: the print as drawn in the plate's 400 × 400 space, one image
     for a dark tee (`ink`) and one for the White tee (`paper`); `box` is
     where the print sits, `viewBox` the close-up that frames it.
   - patch: [cx, cy, side] in place of the kind's, turned `patchRotate`
     degrees about its centre (0 when left out). */
export type PlateArt = {
  print?: { src: { ink: string; paper: string }; box: [number, number, number, number]; viewBox: [number, number, number, number] };
  patch?: [number, number, number];
  patchRotate?: number;
};

/* Every hardware product's category: the shelf's For shops chip. */
export const FOR_SHOPS_CATEGORY = 'For shops';

/* The garments' colours. Black and navy are drawn on ink, white and
   off-white on paper, land on land. */
export const COLOURS = {
  black: { id: 'black', label: 'Black', swatch: '#232324', tone: 'ink' },
  white: { id: 'white', label: 'White', swatch: '#EDEDEA', tone: 'paper' },
  navy: { id: 'navy', label: 'Navy', swatch: '#252B3B', tone: 'ink' },
  offwhite: { id: 'offwhite', label: 'Off-white', swatch: '#E8E5DD', tone: 'paper' },
  land: { id: 'land', label: 'Land', swatch: '#6B7F5C', tone: 'land' },
  cobalt: { id: 'cobalt', label: 'Cobalt', swatch: '#1F4FA8', tone: 'ink', fill: true },
} as const satisfies Record<string, Colour>;

/* Every garment comes in these sizes, in every colour it is made in. */
export const SIZES = ['s', 'm', 'l', 'xl', 'xxl'] as const;

/* A garment's variants: each colour × size, "black-m" labelled "Black · M". */
function garment(colours: (keyof typeof COLOURS)[]): Variant[] {
  return colours.flatMap((c) =>
    SIZES.map((sz) => ({ id: `${c}-${sz}`, label: `${COLOURS[c].label} · ${sz.toUpperCase()}`, colour: c, size: sz })),
  );
}

/* Slugs that changed, old → new. next.config.ts redirects the old pages,
   and a saved bag's lines move with them (components/shop/bagLines.ts). */
export const MOVED: Readonly<Record<string, string>> = {
  'member-tee': 'logo-tee',
  'long-sleeve-mock-tee': 'logo-long-sleeve-tee',
  turtleneck: 'logo-turtleneck',
  hoodie: 'logo-hoodie',
};

/* The shelf's filters, in the order its chips show: every garment is Wear;
   the Logo line (the four Logo garments and the Logo Patch) is Logo; the
   printed tees are Graphic Tees; the patch is Accessories. */
export const WEAR = 'Wear';
export const LOGO = 'Logo';

/* The shelf's category for small things: the patch. (The cap and the tote,
   both drafts, keep Headwear and Carry.) */
export const ACCESSORIES = 'Accessories';

/* The shelf's category for the printed tees: its own filter chip. */
export const GRAPHIC_TEES = 'Graphic Tees';

/* The order the shelf's filter chips show in. */
export const SHELF_FILTERS: readonly string[] = [WEAR, LOGO, GRAPHIC_TEES, ACCESSORIES];

export const PRODUCTS: Product[] = [
  /* ─── Goods: the wearables, from the owner's flat sketches ───────────────
     reference/redesign/wearables/flats. Each carries the Clear patch (63.5 mm,
     embroidered; clear-patch-spec.md beside the flats). The Logo pieces were
     `member-tee`, `long-sleeve-mock-tee`, `turtleneck` and `hoodie`: MOVED
     (below) sends their old links and saved bags to the new slugs. Their
     pictures keep their folders.
     The galleries show the mockups and the drawing. The renders were taken
     out for now (the owner prefers the mockups); their files stay in
     public/shop/goods and their entries in reference/redesign/wearables/
     manifest.json, to put back as `{ kind: 'render', … }` lines. */
  {
    slug: 'logo-tee',
    section: 'goods',
    name: 'Logo Tee',
    line: 'Heavyweight cotton, mock neck, patch on the chest.',
    description:
      'A heavy tee with a wide mock neck and the Clear patch stitched small on the chest. A woven tag at the hem, nothing on the back.',
    priceCents: 2700,
    kind: 'tee',
    tone: 'ink',
    category: WEAR,
    alsoIn: [LOGO],
    variantLabel: 'Size',
    colours: [COLOURS.black, COLOURS.white, COLOURS.navy],
    variants: garment(['black', 'white', 'navy']),
    details: ['Heavyweight cotton jersey', 'Embroidered patch', 'Mock neck, cover-stitched hems'],
    weightOz: 9,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/member-tee/mock-black.jpg', colour: 'black', alt: 'A mockup of the black Logo Tee', caption: 'Black' },
      { kind: 'mock', src: '/shop/goods/member-tee/mock-white.jpg', colour: 'white', alt: 'A mockup of the white Logo Tee', caption: 'White' },
      { kind: 'mock', src: '/shop/goods/member-tee/mock-navy.jpg', colour: 'navy', alt: 'A mockup of the navy Logo Tee', caption: 'Navy' },
    ],
    status: 'live',
  },
  {
    slug: 'logo-long-sleeve-tee',
    section: 'goods',
    name: 'Logo Long-Sleeve Tee',
    line: 'The Logo Tee with long sleeves and rib cuffs.',
    description:
      'The same heavy mock-neck tee, with long sleeves finished in rib cuffs. The patch on the chest, a woven tag at the hem.',
    priceCents: 3200,
    kind: 'tee-ls',
    tone: 'ink',
    category: WEAR,
    alsoIn: [LOGO],
    variantLabel: 'Size',
    colours: [COLOURS.black, COLOURS.offwhite],
    variants: garment(['black', 'offwhite']),
    details: ['Heavyweight cotton jersey', 'Embroidered patch', 'Mock neck, rib cuffs'],
    weightOz: 11,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/long-sleeve-mock-tee/mock-black.jpg', colour: 'black', alt: 'A mockup of the black Logo Long-Sleeve Tee', caption: 'Black' },
      { kind: 'mock', src: '/shop/goods/long-sleeve-mock-tee/mock-offwhite.jpg', colour: 'offwhite', alt: 'A mockup of the off-white Logo Long-Sleeve Tee', caption: 'Off-white' },
    ],
    status: 'live',
  },
  {
    slug: 'logo-turtleneck',
    section: 'goods',
    name: 'Logo Turtleneck',
    line: 'A knit turtleneck with a folded collar.',
    description:
      'A knit turtleneck with a tall collar that folds over, and rib at the cuffs and hem. The patch on the chest.',
    priceCents: 9800,
    kind: 'turtleneck',
    tone: 'ink',
    category: WEAR,
    alsoIn: [LOGO],
    variantLabel: 'Size',
    colours: [COLOURS.navy],
    variants: garment(['navy']),
    details: ['Knit body', 'Embroidered patch', 'Rib collar, cuffs and hem'],
    weightOz: 20,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/turtleneck/mock-navy.jpg', colour: 'navy', alt: 'A mockup of the navy Logo Turtleneck', caption: 'Navy' },
    ],
    status: 'live',
  },
  {
    slug: 'logo-hoodie',
    section: 'goods',
    name: 'Logo Hoodie',
    line: 'Heavy fleece, kangaroo pocket, patch at the centre.',
    description:
      'A heavy pullover hoodie with a lined hood, drawcords and a kangaroo pocket. The patch sits at the centre of the chest.',
    priceCents: 8800,
    kind: 'hoodie',
    tone: 'ink',
    category: WEAR,
    alsoIn: [LOGO],
    variantLabel: 'Size',
    colours: [COLOURS.black, COLOURS.land],
    variants: garment(['black', 'land']),
    details: ['Heavy cotton fleece', 'Embroidered patch', 'Kangaroo pocket, rib cuffs and hem'],
    weightOz: 26,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/hoodie/mock-black.jpg', colour: 'black', alt: 'A mockup of the black Logo Hoodie', caption: 'Black' },
      { kind: 'mock', src: '/shop/goods/hoodie/mock-land.jpg', colour: 'land', alt: 'A mockup of the land Logo Hoodie', caption: 'Land' },
    ],
    status: 'live',
  },
  /* ─── Graphic Tees ─────────────────────────────────────────────────────
     The Logo Tee with a photograph printed on the front
     (reference/redesign/graphic-tees: plate data, print spec and the art
     for the factory). The patch moves to the wearer's right sleeve. On
     pre-order like the rest (the owner's call, 2026-10-20), with the art
     and licences still to finish before the run is printed. */
  {
    slug: 'graphic-tee-carousel-mall',
    section: 'goods',
    name: 'Carousel Mall Tee',
    line: 'The old Carousel Mall, printed big on the front.',
    description:
      'A photograph of San Bernardino’s Carousel Mall, printed large across the front of the Logo Tee. The patch moves to the sleeve.',
    priceCents: 4200,
    kind: 'tee',
    tone: 'ink',
    category: GRAPHIC_TEES,
    alsoIn: [WEAR],
    variantLabel: 'Size',
    colours: [COLOURS.black, COLOURS.cobalt, COLOURS.white],
    variants: garment(['black', 'cobalt', 'white']),
    details: ['Heavyweight cotton jersey', 'Embroidered patch on the sleeve', 'Large printed front, mock neck'],
    weightOz: 9,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/graphic-tee-carousel-mall/mock-black.jpg', colour: 'black', alt: 'A mockup of the Carousel Mall Tee in Black, front', caption: 'Black' },
      { kind: 'mock', src: '/shop/goods/graphic-tee-carousel-mall/mock-cobalt.jpg', colour: 'cobalt', alt: 'A mockup of the Carousel Mall Tee in Cobalt, front', caption: 'Cobalt' },
      { kind: 'mock', src: '/shop/goods/graphic-tee-carousel-mall/mock-white.jpg', colour: 'white', alt: 'A mockup of the Carousel Mall Tee in White, front', caption: 'White' },
    ],
    plate: {
      print: {
        src: { ink: '/shop/goods/graphic-tee-carousel-mall/plate-print.png', paper: '/shop/goods/graphic-tee-carousel-mall/plate-print-light.png' },
        box: [150.3, 110.4, 99.6, 86.8],
        viewBox: [138.3, 92.0, 123.5, 123.5],
      },
      patch: [106.5, 178.2, 16.6],
      patchRotate: 3,
    },
    // TODO(owner), before the run is printed: final art (lifted from mockups, with their wrinkle shadows);
    // confirm the credit (AWESTSIDESTORY) with the photographer; the coordinates are from published sources;
    // the photograph's licence.
    status: 'live',
  },
  {
    slug: 'graphic-tee-two-ten-overpass',
    section: 'goods',
    name: 'Two Ten Overpass Tee',
    line: 'The 210 overpass sign, printed tall down one side.',
    description:
      'A photograph of the San Bernardino sign over the 210, printed tall down one side of the Logo Tee. The patch moves to the sleeve.',
    priceCents: 4200,
    kind: 'tee',
    tone: 'ink',
    category: GRAPHIC_TEES,
    alsoIn: [WEAR],
    variantLabel: 'Size',
    colours: [COLOURS.black, COLOURS.cobalt, COLOURS.white],
    variants: garment(['black', 'cobalt', 'white']),
    details: ['Heavyweight cotton jersey', 'Embroidered patch on the sleeve', 'Large printed front, mock neck'],
    weightOz: 9,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/graphic-tee-two-ten-overpass/mock-black.jpg', colour: 'black', alt: 'A mockup of the Two Ten Overpass Tee in Black, front', caption: 'Black' },
      { kind: 'mock', src: '/shop/goods/graphic-tee-two-ten-overpass/mock-cobalt.jpg', colour: 'cobalt', alt: 'A mockup of the Two Ten Overpass Tee in Cobalt, front', caption: 'Cobalt' },
      { kind: 'mock', src: '/shop/goods/graphic-tee-two-ten-overpass/mock-white.jpg', colour: 'white', alt: 'A mockup of the Two Ten Overpass Tee in White, front', caption: 'White' },
    ],
    plate: {
      print: {
        src: { ink: '/shop/goods/graphic-tee-two-ten-overpass/plate-print.png', paper: '/shop/goods/graphic-tee-two-ten-overpass/plate-print-light.png' },
        box: [190.1, 99.9, 70.3, 115.7],
        viewBox: [153.5, 86.0, 143.5, 143.5],
      },
      patch: [106.5, 178.2, 16.6],
      patchRotate: 3,
    },
    // TODO(owner), before the run is printed: final art (lifted from mockups, with their wrinkle shadows);
    // confirm the credit (Christa Connelly) with the photographer; the coordinates are the owner's pin; the
    // photograph's licence.
    status: 'live',
  },
  {
    slug: 'graphic-tee-devore',
    section: 'goods',
    name: 'Devore Tee',
    line: 'Devore from above, printed big on the front.',
    description:
      'A photograph looking down over Devore toward the mountains, printed large across the front of the Logo Tee. The patch moves to the sleeve.',
    priceCents: 4200,
    kind: 'tee',
    tone: 'ink',
    category: GRAPHIC_TEES,
    alsoIn: [WEAR],
    variantLabel: 'Size',
    colours: [COLOURS.black, COLOURS.cobalt, COLOURS.white],
    variants: garment(['black', 'cobalt', 'white']),
    details: ['Heavyweight cotton jersey', 'Embroidered patch on the sleeve', 'Large printed front, mock neck'],
    weightOz: 9,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/graphic-tee-devore/mock-black.jpg', colour: 'black', alt: 'A mockup of the Devore Tee in Black, front', caption: 'Black' },
      { kind: 'mock', src: '/shop/goods/graphic-tee-devore/mock-cobalt.jpg', colour: 'cobalt', alt: 'A mockup of the Devore Tee in Cobalt, front', caption: 'Cobalt' },
      { kind: 'mock', src: '/shop/goods/graphic-tee-devore/mock-white.jpg', colour: 'white', alt: 'A mockup of the Devore Tee in White, front', caption: 'White' },
    ],
    plate: {
      print: {
        src: { ink: '/shop/goods/graphic-tee-devore/plate-print.png', paper: '/shop/goods/graphic-tee-devore/plate-print-light.png' },
        box: [153.7, 110.4, 92.8, 93.1],
        viewBox: [142.4, 99.2, 115.4, 115.4],
      },
      patch: [106.5, 178.2, 16.6],
      patchRotate: 3,
    },
    // TODO(owner), before the run is printed: final art (lifted from mockups, with their wrinkle shadows);
    // confirm the credit (Michael Rymer) with the photographer; the coordinates are from published sources and
    // may become the owner's own pin; the photograph's licence.
    status: 'live',
  },
  {
    slug: 'coop-cap',
    section: 'goods',
    name: 'Co-op cap',
    line: 'Six panels, unstructured, adjustable strap.',
    description:
      'A soft six-panel cap with the Clear patch on the front. One size, with a strap at the back.',
    priceCents: 3200,
    kind: 'cap',
    tone: 'land',
    category: 'Headwear',
    variants: [{ id: 'one', label: 'One size' }],
    details: ['Cotton twill', 'Embroidered patch', 'One size, adjustable'],
    weightOz: 4,
    ships: GOODS_SHIPS,
    // Off the shelf for now (the owner's call, 2026-10-19). 'live' brings it back.
    status: 'draft',
  },
  {
    slug: 'canvas-tote',
    section: 'goods',
    name: 'Canvas tote',
    line: 'Heavy canvas, long handles, carries a week of groceries.',
    description:
      'A heavy canvas tote with long handles and the Clear patch sewn on one side.',
    priceCents: 2800,
    kind: 'tote',
    tone: 'paper',
    category: 'Carry',
    variants: [{ id: 'one', label: 'One size' }],
    details: ['Heavy cotton canvas', 'Embroidered patch', 'Handles fit over a shoulder'],
    weightOz: 7,
    ships: GOODS_SHIPS,
    // Off the shelf for now (the owner's call, 2026-10-19). 'live' brings it back.
    status: 'draft',
  },

  /* ─── The patch, on its own ─────────────────────────────────────────────
     The same embroidered patch the wearables carry, square or round
     (reference/redesign/patch: plates, art and spec). Its drawing is the
     patch itself, large and stitched (components/shop/PatchPlate.tsx);
     picking a shape swaps the drawing and the pictures. */
  {
    slug: 'logo-patch',
    section: 'goods',
    name: 'Logo Patch',
    line: 'The Clear patch on its own, square or round.',
    description:
      'The same embroidered patch we sew on everything, to put on your own jacket, bag or cap. 63.5 mm across, with a satin border on the square and a merrowed edge on the round. It sews on; it isn’t iron-on, because iron-on peels.',
    priceCents: 900,
    kind: 'patch',
    /* On the dark green ground, as every garment's box is: the patch
       drawn light on it (the mockups show the real Ink patch). */
    tone: 'ink',
    category: ACCESSORIES,
    alsoIn: [LOGO],
    /* The shelf's large tile: the first piece, so the shelf reads cheapest
       first at every width. */
    featured: true,
    variantLabel: 'Shape',
    variants: [
      { id: 'square', label: 'Square' },
      { id: 'circle', label: 'Circle' },
    ],
    details: ['Embroidered, twill backing', 'Embroidered patch, 63.5 mm', 'Sew-on, square or round'],
    weightOz: 0.5,
    ships: GOODS_SHIPS,
    media: [
      { kind: 'mock', src: '/shop/goods/clear-patch/mock-square.jpg', variant: 'square', alt: 'The square Logo Patch on canvas', caption: 'Square' },
      { kind: 'mock', src: '/shop/goods/clear-patch/detail-square.jpg', variant: 'square', alt: 'The square patch’s satin border and stitched mark, up close', caption: 'Square, up close' },
      { kind: 'mock', src: '/shop/goods/clear-patch/mock-back-square.jpg', variant: 'square', alt: 'The square patch beside its twill backing', caption: 'Square, front and back' },
      { kind: 'mock', src: '/shop/goods/clear-patch/mock-circle.jpg', variant: 'circle', alt: 'The round Logo Patch on canvas', caption: 'Circle' },
      { kind: 'mock', src: '/shop/goods/clear-patch/detail-circle.jpg', variant: 'circle', alt: 'The round patch’s merrowed edge and stitched mark, up close', caption: 'Circle, up close' },
      { kind: 'mock', src: '/shop/goods/clear-patch/mock-back-circle.jpg', variant: 'circle', alt: 'The round patch beside its twill backing', caption: 'Circle, front and back' },
      { kind: 'mock', src: '/shop/goods/clear-patch/mock-pair.jpg', alt: 'The square and round Logo Patches side by side', caption: 'Both shapes' },
    ],
    // TODO(owner): order a strike-off of the round patch (merrowed edge) before its run; the square is the
    // one already on the garments.
    status: 'live',
  },

  /* ─── For shops: the hardware ───────────────────────────────────────────
     The hardware that runs Clear at a shop, reserved before it is built.
     In the spec's order (reference/redesign/shops-tools.html).

     Prices and deposits are per variant, in cents. The deposit is our build
     cost plus a margin for the unexpected, rounded up to the next $5, set by
     the owner. Never put costs on the site. */
  {
    slug: 'clear-point',
    section: 'for-shops',
    name: 'Clear Point',
    line: 'E-paper for every table and the counter.',
    description: 'Shows the table number and menu code, who is seated, the bill and the change due. Weeks on a battery at a table; plugged in at the counter. Works with the Clear merchant app.',
    priceCents: 8900,
    kind: 'point',
    tone: 'ink',
    category: FOR_SHOPS_CATEGORY,
    variantLabel: 'Size',
    variants: [
      { id: 'table', label: 'Table', priceCents: 8900, depositCents: 5500 },
      { id: 'counter', label: 'Counter', priceCents: 12900, depositCents: 6500 },
      { id: 'ten', label: 'Ten for tables', priceCents: 79000, depositCents: 52000, per: 'for ten' },
    ],
    details: [
      '4.2″ e-paper (table) or 7.5″ (counter)',
      'Battery for weeks at a table; USB-C at the counter',
      'Wi-Fi to Clear; pairs with Clear Tap',
      '93 × 80 × 8.5 mm (table)',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Feb 2027', fcc: true },
    // TODO(owner): counsel reviews this wording before launch.
    fcc: 'Clear Point is awaiting FCC equipment authorization. Delivery is conditional on that authorization being granted. FCC rules do not address consumer protection, contract or other provisions. If it is not authorized, your deposit is refunded in full and nothing more is charged.',
    // TODO(owner): kept as drawn; the lead raises it with the user.
    founding: 'Founding partners: the counter Point is on us, and table Points are $59.',
    media: [
      { kind: 'render', src: '/shop/hardware/renders/point.jpg', alt: 'On a table, with the bill', caption: 'On a table, with the bill' },
      { kind: 'render', src: '/shop/hardware/renders/pointtable.jpg', alt: 'Free, and held for a party', caption: 'Free, and held for a party' },
      { kind: 'render', src: '/shop/hardware/renders/pointpair.jpg', alt: 'The menu, and table ready', caption: 'The menu, and table ready' },
      { kind: 'render', src: '/shop/hardware/renders/pointlarge.jpg', alt: 'Counter size', caption: 'Counter size' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-pt-101-point-body.svg', alt: 'CLR-PT-101 · Body', caption: 'CLR-PT-101 · Body' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-pt-201-point-foot.svg', alt: 'CLR-PT-201 · Foot and assembly', caption: 'CLR-PT-201 · Foot and assembly' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-pt-102-point-large.svg', alt: 'CLR-PT-102 · Counter size', caption: 'CLR-PT-102 · Counter size' },
    ],
    status: 'live',
  },
  {
    slug: 'clear-tap',
    section: 'for-shops',
    name: 'Clear Tap',
    line: 'Stripe’s M2 reader in our dock. Tap, chip and swipe.',
    description: 'The reader your card money already runs through, standing in a dock that keeps it facing the customer. The Point above it shows the amount.',
    priceCents: 3500,
    kind: 'tap',
    tone: 'land',
    category: FOR_SHOPS_CATEGORY,
    variantLabel: 'Option',
    variants: [
      { id: 'dock', label: 'Dock only', priceCents: 3500, depositCents: 1000 },
      { id: 'm2', label: 'With an M2', priceCents: 8900, depositCents: 8000 },
    ],
    details: [
      'Holds a Stripe Reader M2, never covers it',
      'Stands on the counter or screws to the drawer',
      'The M2 runs on your own Stripe account',
      'No power of its own',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Mar 2027', fcc: false },
    media: [
      { kind: 'render', src: '/shop/hardware/renders/tapsolo.jpg', alt: 'With an M2', caption: 'With an M2' },
      { kind: 'render', src: '/shop/hardware/renders/tap.jpg', alt: 'Beside a counter Point', caption: 'Beside a counter Point' },
      { kind: 'render', src: '/shop/hardware/renders/tapdock.jpg', alt: 'The dock alone', caption: 'The dock alone' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-601-tap-dock.svg', alt: 'CLR-HW-601 · M2 dock', caption: 'CLR-HW-601 · M2 dock' },
    ],
    status: 'live',
  },
  {
    slug: 'clear-counter',
    section: 'for-shops',
    name: 'Clear Counter',
    line: 'An 8- or 10-inch rugged tablet, set up for the merchant app.',
    description: 'A rugged tablet that arrives signed in to your shop and locked to the merchant app. It runs the till, the floor and the drawer.',
    priceCents: 44900,
    kind: 'counter',
    tone: 'paper',
    category: FOR_SHOPS_CATEGORY,
    variantLabel: 'Size',
    variants: [
      { id: '8', label: '8-inch', priceCents: 44900, depositCents: 34500 },
      { id: '10', label: '10-inch, stand included', priceCents: 69900, depositCents: 55500 },
    ],
    details: [
      '8-inch, or 10-inch with the stand included',
      'Refurbished and tested by us; rugged, with corner bumpers',
      'Tap to Pay on the tablet itself',
      'Fee credit back once you process enough in 90 days',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Apr 2027', fcc: false },
    media: [
      { kind: 'render', src: '/shop/hardware/renders/counter.jpg', alt: '10-inch, on its stand', caption: '10-inch, on its stand' },
      { kind: 'render', src: '/shop/hardware/renders/counterback.jpg', alt: 'The Clear Mount at the back', caption: 'The Clear Mount at the back' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-301-counter-stand.svg', alt: 'CLR-HW-301 · Swivel stand', caption: 'CLR-HW-301 · Swivel stand' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-101-mount.svg', alt: 'CLR-HW-101 · Clear Mount', caption: 'CLR-HW-101 · Clear Mount' },
    ],
    status: 'live',
  },
  {
    slug: 'clear-drawer',
    section: 'for-shops',
    name: 'Clear Drawer',
    line: 'A 64 mm steel drawer the tablet opens. Panels swap.',
    description: 'Thin enough to live under the tablet. A cash sale opens it from the tablet directly, so it still works when the internet doesn’t.',
    priceCents: 19900,
    kind: 'drawer',
    tone: 'ink',
    category: FOR_SHOPS_CATEGORY,
    variants: [
      { id: 'one', label: 'One size', priceCents: 19900, depositCents: 15000 },
    ],
    details: [
      '1.2 mm steel, 64 mm tall',
      'Opens on a signed command from the tablet',
      '5 notes, 8 coins; key lock',
      'Face and top panels lift off without tools',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Apr 2027', fcc: true },
    // TODO(owner): counsel reviews this wording before launch.
    fcc: 'Clear Drawer is awaiting FCC equipment authorization. Delivery is conditional on that authorization being granted. FCC rules do not address consumer protection, contract or other provisions. If it is not authorized, your deposit is refunded in full and nothing more is charged.',
    media: [
      { kind: 'render', src: '/shop/hardware/renders/drawerclosed.jpg', alt: 'Closed', caption: 'Closed' },
      { kind: 'render', src: '/shop/hardware/renders/drawer.jpg', alt: 'Open, with a Cobalt face', caption: 'Open, with a Cobalt face' },
      { kind: 'render', src: '/shop/hardware/renders/finishes.jpg', alt: 'Four faces', caption: 'Four faces' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-701-drawer.svg', alt: 'CLR-HW-701 · Assembly', caption: 'CLR-HW-701 · Assembly' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-702-drawer-modules.svg', alt: 'CLR-HW-702 · Panels and insert', caption: 'CLR-HW-702 · Panels and insert' },
    ],
    status: 'live',
  },
  {
    slug: 'label-printer',
    section: 'for-shops',
    name: 'Label printer',
    line: '4-inch thermal. Receipts that stick to a delivery bag.',
    description: 'Prints receipts and bag labels as stickers, so a DoorDash order leaves with its ticket on the bag. Any 4-inch direct thermal labels work.',
    priceCents: 14900,
    kind: 'printer',
    tone: 'paper',
    category: FOR_SHOPS_CATEGORY,
    variants: [
      { id: 'one', label: 'One size', priceCents: 14900, depositCents: 7000 },
    ],
    details: [
      '4-inch direct thermal, 203 dpi',
      'USB and Wi-Fi',
      'Labels 1.57 to 4.1 inches wide',
      'Works with the merchant app’s receipts',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Mar 2027', fcc: false },
    media: [
      { kind: 'render', src: '/shop/hardware/renders/printer.jpg', alt: 'A bag label', caption: 'A bag label' },
      { kind: 'render', src: '/shop/hardware/renders/printerside.jpg', alt: 'From the side', caption: 'From the side' },
    ],
    status: 'live',
  },
  {
    slug: 'pay-case',
    section: 'for-shops',
    name: 'Point Pay case',
    line: 'An M2 under a table Point, with Call and Bill buttons.',
    description: 'Turns a table Point into a card terminal. Guests press Call or Bill, then tap their card right under the screen.',
    priceCents: 3900,
    kind: 'pay-case',
    tone: 'land',
    category: FOR_SHOPS_CATEGORY,
    variantLabel: 'Size',
    variants: [
      { id: 'table', label: 'Table', priceCents: 3900, depositCents: 3000 },
      { id: 'large', label: 'Counter', priceCents: 4900, depositCents: 3500 },
    ],
    details: [
      'Holds a Stripe Reader M2 (not included)',
      'Two metal buttons: Call and Bill',
      'One USB-C cable charges both',
      'Sits on a Clear Stand',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Mar 2027', fcc: true },
    // TODO(owner): counsel reviews this wording before launch.
    fcc: 'The Point Pay case is awaiting FCC equipment authorization. Delivery is conditional on that authorization being granted. FCC rules do not address consumer protection, contract or other provisions. If it is not authorized, your deposit is refunded in full and nothing more is charged.',
    media: [
      { kind: 'render', src: '/shop/hardware/renders/casetable.jpg', alt: 'On a table, someone coming over', caption: 'On a table, someone coming over' },
      { kind: 'render', src: '/shop/hardware/renders/casepair.jpg', alt: 'Table and counter', caption: 'Table and counter' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-pt-301-pay-case.svg', alt: 'CLR-PT-301 · Table case', caption: 'CLR-PT-301 · Table case' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-pt-302-pay-case-large.svg', alt: 'CLR-PT-302 · Counter case', caption: 'CLR-PT-302 · Counter case' },
    ],
    status: 'live',
  },
  {
    slug: 'tap-phone',
    section: 'for-shops',
    name: 'Clear Tap Phone',
    line: 'A 6.7-inch phone in our shell. Tap to Pay anywhere.',
    description: 'For trucks, stalls and paying at the table: a phone that takes contactless cards and phones with nothing plugged in.',
    priceCents: 24900,
    kind: 'tap-phone',
    tone: 'paper',
    category: FOR_SHOPS_CATEGORY,
    variants: [
      { id: 'one', label: 'One size', priceCents: 24900, depositCents: 18000 },
    ],
    details: [
      '6.7-inch screen; refurbished and tested by us',
      'Tap to Pay: cards and phones',
      'Runs the merchant app',
      'Clear’s shell hides the back',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Apr 2027', fcc: false },
    media: [
      { kind: 'render', src: '/shop/hardware/renders/tapphonesolo.jpg', alt: 'Ready for a tap', caption: 'Ready for a tap' },
      { kind: 'render', src: '/shop/hardware/renders/tapphone.jpg', alt: 'Front, and the mount on the back', caption: 'Front, and the mount on the back' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-201-tap-phone-shell.svg', alt: 'CLR-HW-201 · Shell and bezel', caption: 'CLR-HW-201 · Shell and bezel' },
    ],
    status: 'live',
  },
  {
    slug: 'clear-stand',
    section: 'for-shops',
    name: 'Clear Stand',
    line: 'One stand for the Points and tablets. Twist to lock.',
    description: 'A fixed stand with a steel plate and the Clear Mount socket. A Point, a Pay case or a tablet twists on and locks.',
    priceCents: 3900,
    kind: 'stand',
    tone: 'land',
    category: FOR_SHOPS_CATEGORY,
    variants: [
      { id: 'one', label: 'One size', priceCents: 3900, depositCents: 2000 },
    ],
    details: [
      'Steel plate, Clear Mount socket',
      'Fits every Point and both tablets',
      'Screws down or stands free',
      'Twist to lock, twist to lift',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Feb 2027', fcc: false },
    media: [
      { kind: 'render', src: '/shop/hardware/renders/standsolo.jpg', alt: 'The Clear Mount socket', caption: 'The Clear Mount socket' },
      { kind: 'render', src: '/shop/hardware/renders/casepair.jpg', alt: 'Holding two Pay cases', caption: 'Holding two Pay cases' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-302-stand.svg', alt: 'CLR-HW-302 · Fixed stand', caption: 'CLR-HW-302 · Fixed stand' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-101-mount.svg', alt: 'CLR-HW-101 · Clear Mount', caption: 'CLR-HW-101 · Clear Mount' },
    ],
    status: 'live',
  },
  {
    slug: 'drawer-panels',
    section: 'for-shops',
    name: 'Drawer panels',
    line: 'Faces, tops and till inserts. Swap without tools.',
    description: 'The drawer’s face, top and till change in seconds. Engrave your own logo, or put a mount on top for the Tap.',
    priceCents: 2900,
    kind: 'panels',
    tone: 'paper',
    category: FOR_SHOPS_CATEGORY,
    variantLabel: 'Panel',
    variants: [
      { id: 'paper', label: 'Face · Paper or Cobalt', priceCents: 2900, depositCents: 1000 },
      { id: 'walnut', label: 'Face · Walnut', priceCents: 5900, depositCents: 1500 },
      { id: 'logo', label: 'Face · your logo', priceCents: 7900, depositCents: 2000 },
      { id: 'mount', label: 'Top · Mount', priceCents: 4900, depositCents: 2000 },
      { id: 'wood', label: 'Top · Walnut or cork', priceCents: 6900, depositCents: 2000 },
      { id: 'insert', label: 'Insert · wider slots', priceCents: 2900, depositCents: 1000 },
      { id: 'lid', label: 'Locking lid', priceCents: 3900, depositCents: 1500 },
    ],
    details: [
      'Face panels hold on two magnets',
      'Tops screw down from inside',
      'Inserts lift out for counting',
      'Made by us, in small runs',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Apr 2027', fcc: false },
    media: [
      { kind: 'render', src: '/shop/hardware/renders/panels.jpg', alt: 'Walnut face, mount top', caption: 'Walnut face, mount top' },
      { kind: 'render', src: '/shop/hardware/renders/finishes.jpg', alt: 'Ink, Paper, Cobalt and Walnut', caption: 'Ink, Paper, Cobalt and Walnut' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-702-drawer-modules.svg', alt: 'CLR-HW-702 · Panels and insert', caption: 'CLR-HW-702 · Panels and insert' },
    ],
    status: 'live',
  },
  {
    slug: 'full-counter',
    section: 'for-shops',
    name: 'Full counter',
    line: 'Counter 10-inch, Tap, Drawer, printer and Point Large.',
    description: 'Everything for one till. $1,265 bought one by one.',
    priceCents: 114900,
    kind: 'kit',
    tone: 'ink',
    category: FOR_SHOPS_CATEGORY,
    variants: [
      { id: 'one', label: 'One set', priceCents: 114900, depositCents: 91000 },
    ],
    details: [
      'Clear Counter, 10-inch, with its stand',
      'Clear Tap with an M2',
      'Clear Drawer and a label printer',
      'Clear Point, counter size',
    ],
    weightOz: 16, // TODO(owner): packed weight, a placeholder
    // TODO(owner): the ship month is an estimate; confirm it.
    preorder: { ships: 'Apr 2027', fcc: true },
    // TODO(owner): counsel reviews this wording before launch.
    fcc: 'The Point and the drawer in this set are awaiting FCC equipment authorization. Delivery is conditional on that authorization being granted. FCC rules do not address consumer protection, contract or other provisions. If it is not authorized, your deposit is refunded in full and nothing more is charged.',
    media: [
      { kind: 'render', src: '/shop/hardware/renders/kit.jpg', alt: 'Everything in the set', caption: 'Everything in the set' },
      { kind: 'render', src: '/shop/hardware/renders/together.jpg', alt: 'One till', caption: 'One till' },
      { kind: 'render', src: '/shop/hardware/renders/staff.jpg', alt: 'From the staff side', caption: 'From the staff side' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-701-drawer.svg', alt: 'CLR-HW-701 · Drawer', caption: 'CLR-HW-701 · Drawer' },
      { kind: 'cad', src: '/shop/hardware/cad/clr-hw-301-counter-stand.svg', alt: 'CLR-HW-301 · Swivel stand', caption: 'CLR-HW-301 · Swivel stand' },
    ],
    status: 'live',
  },

];

/* The most of one line anyone can put in a bag. Keeps an order a parcel,
   not a pallet — larger orders are a conversation. */
export const MAX_PER_LINE = 10;
export const MAX_LINES = 20;

/* Where order questions go. Replies to the Stripe receipt should reach the
   same inbox: set it as the support email in Stripe's public business details. */
export const SUPPORT_EMAIL = 'support@useclear.org';

/* "1 item", "3 items". */
export const items = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`;

/* ─── The shelf (/shop, open) ──────────────────────────────────────────── */

export const OPENING = {
  /* One set line from 700px up. */
  lines: ['Wear the co-op.'],
  lede: 'A small run of well-made goods with the Clear name on them. Wear it and people ask what it is.',
  facts: [
    { k: 'Made', v: 'In small runs' },
    { k: 'Ships', v: `From ${GOODS_SHIPS}, in the US` },
    { k: 'What it earns', v: 'Back into the co-op' },
  ],
} as const;

export const SHELF = {
  /* The grid's accessible name, and the category filter's. */
  label: 'On the shelf',
  filterLabel: 'Categories',
  all: 'All',
  pieces: (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`,
  /* The large tile's chip, in place of its category. */
  featured: 'New this run',
  /* The drawn rail that closes the last row when the tiles run short. */
  filler: 'Room on the rack',
  add: (name: string) => `Add ${name} to bag`,
  /* A garment's tile offers one colour's sizes: "Size · Black". */
  sizesIn: (label: string, colour: string) => `${label} · ${colour}`,
  /* A goods pre-order tile's chip, in place of its category. */
  preorder: 'Pre-order',
} as const;

/* The panel that drops from the Bag pill after anything goes in. */
export const MINIBAG = {
  added: 'Added to your bag',
  view: (n: number) => `View bag · ${n}`,
  keep: 'Keep looking',
  close: 'Close',
} as const;

/* 01 under the shelf: the hardware, reserved before it is built. The
   section's id is what the shelf's For shops chip scrolls to. */
export const FOR_SHOPS = {
  id: 'for-shops',
  n: '01',
  kicker: 'For shops',
  chip: 'Pre-order',
  title: 'Made for the counter. Reserved at cost.',
  aside: 'The hardware that runs Clear at a shop. Reserve it for what it costs us to build, and pay the rest when it ships.',
  more: { href: '/shops/tools', label: 'What it all does' },
  /* The grid's accessible name. */
  label: 'For shops',
  /* "From $89" when the variants differ in price, "$199" when they do not. */
  from: (price: string) => `From ${price}`,
  /* "Reserve $55 · ships Feb 2027", the figure in bold. */
  reserve: 'Reserve',
  ships: 'ships',
  how: [
    {
      n: '01',
      title: 'Reserve at cost.',
      text: 'The deposit is what it costs us to build yours, plus a little for the unexpected. The rest is charged the day it ships.',
    },
    {
      n: '02',
      title: 'Refundable until we build it.',
      text: 'We email before we start on yours. Cancel before then and the whole deposit comes back. Miss our ship date and you can cancel for a full refund too.',
    },
    {
      n: '03',
      title: 'For shops on Clear.',
      text: 'Add anything to your bag. At checkout you sign in to your shop or set one up. If we can’t approve your shop, your deposit comes back automatically.',
    },
  ],
} as const;

/* 02 under the shelf. */
export const WHY = {
  n: '02',
  kicker: 'What it is for',
  title: 'Not a clothing business. Not cheap merch either.',
  aside: 'Made to last and priced like it. The margin only has to cover the line and help get the word out.',
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
  /* The labels drawn under each cell's figure. */
  art: {
    run1: 'Run 01',
    run2: 'Run 02 · maybe',
    three: 'Three that shrink',
    one: 'One good shirt',
    sale: 'A sale',
    coop: 'The co-op',
    word: 'The word out',
  },
} as const;

/* ─── A product (/shop/[slug]) ─────────────────────────────────────────── */

export const PRODUCT_COPY = {
  run: 'Small run',
  sizeLabel: 'Size',
  colourLabel: 'Colour',
  oneSize: 'One size',
  pickOne: 'Pick one',
  pickFirst: (label: string) => `Pick a ${label.toLowerCase()} first`,
  addToBag: 'Add to bag',
  added: 'Added',
  soldOut: 'Sold out',
  quantity: 'Quantity',
  fewer: 'One fewer',
  more: 'One more',
  details: 'Details',
  shipping: 'Ships within the US, free on orders of $35 or more. Shipping is quoted at checkout from live carrier rates.',
  /* A goods pre-order: paid today, made in the run, shipped in its month. */
  preorder: 'Pre-order',
  ships: (month: string) => `Ships ${month}, estimated`,
  preorderNote: 'Paid in full today. We make the run once the orders are in, and email you tracking when yours ships.',
  also: { kicker: 'Also', label: 'In the shop' },
} as const;

/* A hardware product (/shop/[slug] for a 'for-shops' product). */
export const HARDWARE_COPY = {
  /* "For shops · 01 / 10" */
  counter: (i: string, n: string) => `For shops · ${i} / ${n}`,
  chip: 'Pre-order',
  each: 'each',
  reserveNow: 'Reserve now',
  whenShips: 'When it ships',
  ships: 'Ships',
  estimated: (month: string) => `${month}, estimated`,
  reserve: (amount: string) => `Reserve · ${amount}`,
  forShops: 'For shops on Clear. Checkout asks you to sign in to your shop or set one up.',
  refund: 'Refundable in full until we start building yours. We email you before we do.',
  also: { kicker: 'Also', label: 'For shops', reserve: (amount: string) => `Reserve ${amount}` },
  gallery: {
    label: 'Views',
    render: 'Render',
    drawing: { b: 'Drawing', s: 'The shop’s drawing' },
    cad: 'CAD',
    note: 'Renders are made from our CAD models, not photographs. Prototype details may change.',
  },
} as const;

/* The gallery's three views. The mark view is named by the product's own
   detail about its mark ("Embroidered mark"); the back by what is there. */
export const GALLERY = {
  label: 'Views',
  front: { b: 'Front', s: 'As it is worn', patch: 'The stitched face' },
  mark: { b: 'Patch' },
  /* The close-up on a Graphic Tee frames its print instead of its patch. */
  print: { b: 'Print', s: 'The printed front' },
  back: {
    b: 'Back',
    s: {
      tee: 'Nothing on it',
      'tee-ls': 'Nothing on it',
      turtleneck: 'Nothing on it',
      hoodie: 'Nothing on it',
      cap: 'The strap',
      patch: 'Twill backing, sew-on',
      tote: 'The plain side',
    } satisfies Record<GoodsKind, string>,
  },
  /* The gallery's kind words: "Render · Black, laid flat", "Drawing · Front". */
  render: 'Render',
  drawing: 'Drawing',
  mock: 'Mockup',
  note: 'Mockups are made from our flat sketches, not photographs. The finished pieces may differ slightly.',
} as const;

/* ─── The bag (/shop/bag) ──────────────────────────────────────────────── */

export const BAG = {
  heading: 'Your bag.',
  inBag: 'In the bag',
  limit: `Up to ${MAX_PER_LINE} of each`,
  empty: 'Nothing in here yet.',
  emptyLink: 'Back to the shop',
  each: 'each',
  unavailable: 'No longer available. Remove it to check out.',
  /* When a saved bag held something the shop no longer has (a colour or
     size that changed), the line is taken out and this is said once. */
  dropped: 'Something in your bag changed in the shop, so we took it out.',
  unavailableName: 'Unavailable item',
  subtotal: 'Subtotal',
  shipping: 'Shipping',
  shippingWait: 'Next step',
  /* The address step's button when nothing ships now (pre-orders alone). */
  nextStep: 'Next step',
  total: 'Total',
  remove: 'Remove',
  checkout: 'Checkout',
  change: 'Change',
  addressHeading: 'Where should it go?',
  addressNote: 'US addresses only for now.',
  fields: {
    name: 'Full name',
    email: 'Email',
    street1: 'Street address',
    street2: 'Apt, suite (optional)',
    city: 'City',
    state: 'State',
    statePlaceholder: 'Choose',
    zip: 'ZIP',
  },
  getRates: 'Get shipping rates',
  gettingRates: 'Checking carriers…',
  ratesHeading: 'Choose shipping',
  /* Free shipping from $35 of goods (lib/shop/order.ts): the cheapest rate
     shows as Free, and the bag says how far off it is. */
  free: 'Free',
  freeYes: 'Free shipping on this order: the standard rate is on us.',
  freeTo: (amount: string) => `Add ${amount} more for free shipping.`,
  days: (n: number) => (n === 1 ? '1 business day' : `${n} business days`),
  payHeading: 'Pay',
  pay: 'Pay with card',
  paying: 'Opening checkout…',
  taxNote: 'Card payment is handled by Stripe. We never see your card number.',
  /* When fetch itself fails (offline), not when the API answers with an error. */
  failed: 'Something went wrong. Nothing was charged.',

  /* ── Pre-orders (For shops) in the same bag ── */
  stepOf: (n: number, of: number) => `Step ${n} of ${of}`,
  shipsNow: 'Ships now',
  /* The goods' group, and their line, when they are on pre-order. */
  goodsPreorder: 'Pre-order · paid today',
  goodsShips: (month: string) => ` · ships ${month}`,
  /* A goods pre-order's description on Stripe's page and receipt. */
  goodsDescription: (line: string, month: string) => `Pre-order: ships ${month}, estimated. ${line}`,
  preorderGroup: 'Pre-order · for shops',
  depositChip: 'Deposit now',
  /* "Reserve $220.00 now · $136.00 when it ships · Feb 2027", the deposit bold. */
  reserve: 'Reserve',
  depLine: (later: string, ships: string) => ` now · ${later} when it ships · ${ships}`,
  goods: 'Goods',
  shippingGoods: 'Shipping, goods',
  deposits: 'Deposits',
  today: 'Today',
  later: 'When each ships, on the saved card',
  plusShipping: (amount: string) => `${amount} + shipping`,
  shopHeading: 'Your shop',
  shopSum: (name: string, owner: string) => `${name} · ${owner}`,
  shopNote: 'Pre-orders are for shops on Clear. Sign in, or set up your shop; it takes about five minutes and your bag waits here.',
  signIn: 'Sign in to your shop',
  setUp: 'Set up a shop',
  shopRefund: 'If we can’t approve your shop, your deposit comes back automatically.',
  /* After shopRefund when goods share the bag: "The tee ships either way." */
  goodsShip: (what: string) => `${what} ships either way.`,
  goodsShipMany: 'The rest of your bag ships either way.',
  shopOff: 'Shop sign-in isn’t switched on yet, so pre-orders can’t be checked out. Nothing was charged.',
  shopFailed: 'That sign-in didn’t go through. Try again.',
  chargedToday: 'Charged today',
  savedLater: 'Saved for later',
  payReserve: (amount: string) => `Pay ${amount} and reserve`,
  savedCardNote: 'Stripe saves your card to charge the rest when each item ships. We email you first. Card payment is handled by Stripe; we never see your card number.',
  /* Shown by Stripe Checkout above its pay button for a reservation. */
  savedCard: 'Stripe saves your card to charge the rest when each item ships. We email you first.',
  /* The deposit line's description on Stripe's page and receipt. */
  depositDescription: (balance: string, ships: string) =>
    `${balance} more when it ships, ${ships}, estimated. Refundable in full until we start building yours.`,
  shopRequired: 'Pre-orders are for shops on Clear. Sign in to your shop first. Nothing was charged.',
  shopDeclined: 'This shop can’t take pre-orders. Nothing was charged.',
} as const;

/* US only (lib/shop/schema.ts). The listbox shows the name, the API gets the code. */
export const STATES: readonly (readonly [string, string])[] = 'AL Alabama|AK Alaska|AZ Arizona|AR Arkansas|CA California|CO Colorado|CT Connecticut|DE Delaware|DC District of Columbia|FL Florida|GA Georgia|HI Hawaii|ID Idaho|IL Illinois|IN Indiana|IA Iowa|KS Kansas|KY Kentucky|LA Louisiana|ME Maine|MD Maryland|MA Massachusetts|MI Michigan|MN Minnesota|MS Mississippi|MO Missouri|MT Montana|NE Nebraska|NV Nevada|NH New Hampshire|NJ New Jersey|NM New Mexico|NY New York|NC North Carolina|ND North Dakota|OH Ohio|OK Oklahoma|OR Oregon|PA Pennsylvania|RI Rhode Island|SC South Carolina|SD South Dakota|TN Tennessee|TX Texas|UT Utah|VT Vermont|VA Virginia|WA Washington|WV West Virginia|WI Wisconsin|WY Wyoming'
  .split('|')
  .map((s) => [s.slice(0, 2), s.slice(3)] as const);

/* ─── After paying (/shop/thanks) ──────────────────────────────────────────
   Deliberately nothing about the order itself: anyone can open this URL, so
   it cannot be the confirmation. Stripe's receipt email is. */

export const THANKS = {
  who: 'Order placed',
  heading: 'Thank you.',
  lede: 'Your order is in. Stripe is emailing a receipt, and we will send tracking once it ships.',
  steps: [
    { b: 'Order in', s: 'Paid at checkout', done: true },
    { b: 'Receipt', s: 'From Stripe, by email', done: true },
    { b: 'Tracking', s: 'By email, once it ships', done: false },
  ],
  questions: 'Questions about your order? Reply to the receipt, or email',
  back: 'Back to the shop',
} as const;

/* ─── After reserving (/shop/reserved) ───────────────────────────────────
   The slip shows only to the shop that placed the order (the session's shop
   must match the one signed in on this browser); anyone else who opens the
   URL sees the timeline and nothing about the order. */

export const RESERVED = {
  who: 'Order placed',
  chip: 'Reserved',
  heading: 'Reserved.',
  /* "Your deposits are in and the tee is on its way. We email you…" */
  ledeGoods: (what: string) => `Your deposits are in and ${what} is on its way.`,
  ledeGoodsMany: 'Your deposits are in and the rest of your order is on its way.',
  ledeOnly: 'Your deposits are in.',
  ledeTail: 'We email you when your shop is approved, before we start building, and when each piece ships.',
  steps: [
    { b: 'Reserved', s: (deposits: string) => `${deposits} in deposits, today`, sGeneric: 'Deposits paid today' },
    // TODO(owner): kept as drawn; depends on how long approval actually takes.
    { b: 'Shop approved', s: 'Usually within two business days' },
    { b: 'Building yours', s: 'We email first. Refundable until then' },
    { b: 'Ships', s: 'The rest is charged that day' },
  ],
  mind: 'Changed your mind before we build? Reply to the email, or write to',
  order: 'Your order',
  paidToday: 'Paid today',
  shipping: 'Shipping',
  deposit: (qty: number, name: string) => `Deposit · ${qty > 1 ? `${qty} × ` : ''}${name}`,
  today: 'Today',
  whenShips: 'When each ships',
  laterLine: (name: string, ships: string) => `${name}, ${ships}`,
  merchant: 'Also in the merchant app, under Settings › Devices › On order.',
  back: 'Back to the shop',
} as const;

/* ─── Closed ───────────────────────────────────────────────────────────────
   Open or closed. The shop closes for ordinary reasons — it sold out, it is
   restocking, it is packing a big batch of orders, it is on a break — and the
   closed page is one page whose words follow the reason. Closing is real, not
   cosmetic: product pages swap the buy button for a notice, the bag cannot
   get rates or pay, and the checkout API refuses.

   Change `open`/`reason` here and redeploy. SHOP_OPEN=true|false in the
   environment overrides `open` without a code change (still needs a
   redeploy, because the pages are static). The shop is also closed whenever
   no product is live, whatever this says. */

export type ClosedReason = 'not-open-yet' | 'sold-out' | 'restocking' | 'packing-orders' | 'break';

export const SHOP_STATUS: {
  open: boolean;
  reason: ClosedReason;
  /* ISO date (YYYY-MM-DD) or null. Only set a date you will keep. */
  reopensAt: string | null;
} = {
  open: true,
  reason: 'not-open-yet',
  reopensAt: null,
};

/* `lines` is the h1, set line by line from 700px up. */
export const CLOSED_REASONS: Record<
  ClosedReason,
  { label: string; sign: string; lines: readonly string[]; lede: string; ordersShipping: boolean }
> = {
  'not-open-yet': {
    label: 'Not open yet',
    sign: 'Opening soon',
    lines: ['Not open yet.'],
    lede: 'The first run is still being made. Leave an email and we will tell you the day the doors open.',
    ordersShipping: false,
  },
  'sold-out': {
    label: 'Sold out',
    sign: 'Sold out',
    lines: ['Sold out,', 'for now.'],
    lede: 'Everything from this run has gone. Leave an email and we will tell you when the next one is in.',
    ordersShipping: true,
  },
  restocking: {
    label: 'Restocking',
    sign: 'Restocking',
    lines: ['Restocking', 'the shelves.'],
    lede: 'New stock is on its way. Leave an email and we will tell you the day the doors reopen.',
    ordersShipping: true,
  },
  'packing-orders': {
    label: 'Packing orders',
    sign: 'Packing orders',
    lines: ['Packing', 'your orders.'],
    lede: 'We closed the doors for a few days to get every order out properly. Leave an email and we will tell you when we reopen.',
    ordersShipping: true,
  },
  break: {
    label: 'Short break',
    sign: 'Back soon',
    lines: ['Closed for a', 'short break.'],
    lede: 'The shop is taking a few days off. Leave an email and we will tell you when it reopens.',
    ordersShipping: true,
  },
};

export const CLOSED = {
  signTop: 'Sorry, we are',
  signWord: 'Closed',
  status: 'Closed',
  notifyLabel: 'Email',
  notifyPlaceholder: 'Your email',
  notifyButton: 'Email me when it opens',
  notifyNote: 'One email, the day the doors open. Nothing else.',
  sending: 'Adding you…',
  ok: 'Done. We will email you once, when the shop opens.',
  error: 'That did not send, and nothing was stored. Try again in a minute.',
  /* The box behind the glass while the first run is being made. */
  sceneBox: 'Run 01',
  board: {
    doors: 'Doors',
    title: 'On the door',
    reason: 'Why',
    back: 'Back',
    backUnset: 'When it is ready',
    orders: 'Orders already placed',
    ordersValue: 'Still shipping',
    bag: 'Your bag',
    bagValue: 'Saved here',
  },
  questions: 'Questions about an order?',
  /* Section 01: what someone arriving at a closed shop actually needs. */
  meanwhile: {
    n: '01',
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
