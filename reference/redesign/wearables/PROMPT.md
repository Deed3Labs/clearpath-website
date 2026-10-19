# Shop: the wearables from the flats, with the patch

## Products, prices and colours (decided)

| Product | Slug | Price | Colours | Weight (packed) | Featured |
|---|---|---|---|---|---|
| Mock tee (short sleeve, replaces Member tee) | `member-tee` (kept) | $42 | Black, White, Navy | 9 oz | yes |
| Long-sleeve mock tee | `long-sleeve-mock-tee` | $52 | Black, Off-white | 11 oz | |
| Turtleneck | `turtleneck` | $98 | Navy | 20 oz | |
| Hoodie | `hoodie` | $88 | Black, Land | 26 oz | |
| Co-op cap | `coop-cap` (kept) | $32 | (keep) | (keep) | |
| Canvas tote | `canvas-tote` (kept) | $28 | (keep) | (keep) | |

- **Colour ids and swatches:** `black` Black `#232324`, `white` White `#EDEDEA`, `navy` Navy `#252B3B`, `offwhite` Off-white `#E8E5DD`, `land` Land `#6B7F5C`. The ids are used in variant ids (`offwhite-m`) and in the media manifest.
- **Sizes:** S, M, L, XL, XXL for all four garments.
- **Status:** all six `live`.
- **Why these prices:** blanks of this weight cost roughly $10–20 for a tee and $25–45 for fleece or knit at small runs. On top of that come the patch (about $2), sewing it on, the woven hem tag and packing. These prices clear that cost with room for the run and for getting the word out, as the shop's copy says, without being a clothing business.

**Owner check before merging:** the tee, cap and tote are live on pre-order. If anyone has paid for one, they ordered the old description (a crew-neck tee with an embroidered mark; a printed tote). Confirm there are no paid goods orders, or decide what to tell those buyers, before this merges.

---

## Attachments

Copy these into `reference/redesign/wearables/`:

- `flats/`: the owner's flat sketches. They are the source of truth for every garment:
  - `tee-ss.png`, `tee-ls.png`, `turtle-folded.png`, `turtle-unfolded.png`, `hoodie.png`
  - each image has front on the left and back on the right
- `goodsShapes.ts`: the four garments traced from those flats into the plate format, plus the patch positions for the cap and tote.
- `clear-patch-spec.md`, `clear-patch-{ink,land,paper}.svg`: the patch (63.5 mm square, embroidered, satin border) and where it goes on each garment.
- `media/`: the pictures for the goods galleries (see section 3b). The four product folders go into `public/shop/goods/` as they are (`public/shop/goods/member-tee/render-black.jpg`, …). `manifest.json` lists them per product and is not shipped.

## Setup

- `git pull` main first. Shop work has landed since the local checkout was last updated (#64 to #77: hardware reservations, goods on pre-order).
- Branch `shop-wearables` from main. Open a PR; never push to `main`.
- Work as a lead with at most two workers:
  - **Lead:** catalog and colour plumbing (sections 1 and 2), then integration and checks.
  - **Worker A:** the plates and gallery (section 3).
  - **Worker B:** copy and tests (sections 4 and 5), once the lead has the types in.

## What changes

The goods become six pieces:
- the four wearables from the flats (short-sleeve mock tee, long-sleeve mock tee, turtleneck, hoodie);
- the cap and the tote.

Every one carries the Clear patch instead of a bare mark or a printed wordmark.

The galleries mix three kinds of picture, the way the hardware pages already do:
- the line drawings (front, patch close-up, back);
- photo-real renders;
- mockups.

The shelf tiles keep the line drawing.

### 1. Catalog (`content/shop.ts`)

**Kinds:**
- `GoodsKind` becomes `'tee' | 'tee-ls' | 'turtleneck' | 'hoodie' | 'cap' | 'tote'`.
- Update `GOODS_KINDS` to match.

**Slugs:**
- Keep `member-tee` and kind `tee` for the short-sleeve mock tee: links, tests and any orders already point at it.
- New slugs: `long-sleeve-mock-tee`, `turtleneck`, `hoodie`.
- All four take category `Wear`.
- Mark the short-sleeve tee `featured: true` (the shelf now has six goods, so the featured tile and category chips switch on; check both, see "Check").

**Colours live in the variant id**, so the bag, checkout, the Stripe metadata, the webhook and the owner scripts keep handling one `variant` string and need no change:
- Add optional `colour?: string` and `size?: string` to `Variant`.
- A product with colours lists every colour × size, e.g. `{ id: 'black-m', label: 'Black · M', colour: 'black', size: 'm' }`.
- Add optional `colours?: { id: string; label: string; swatch: string; tone: PlateTone }[]` to `Product`, in display order. Map tones as:
  - Black and Navy → `ink`
  - White and Off-white → `paper`
  - Land → `land`
- A one-colour product still lists its colour, so its label reads "Navy · M" in the bag and on the receipt.
- `priceBag` needs nothing new. Do confirm that a sold-out colour/size pair is refused like any sold-out variant.
- **Saved bags:** the tee's old ids (`s`, `m`, …) no longer exist, and a saved bag holding one would make checkout refuse the whole bag.
  - When the bag loads, drop any line whose product or variant is gone, and show a one-line note in the bag.
  - Do not map old ids to a colour silently.

### 2. Picking a colour

**Product page:** a colour picker above the size picker.
- Swatch pills with the colour name, in a radio group that behaves exactly like `Sizes` (one tab stop, arrows move, sold-out disabled and named).
- Picking a colour:
  - filters the size picker to that colour's variants;
  - keeps the chosen size if that colour has it;
  - switches the plate's tone to the colour's `tone`.
- Default to the first colour.
- No hexes in CSS: the swatch colour is product data, passed as an inline custom property.

**Shelf tile:**
- With one colour, quick-add works as today.
- With more than one colour, the tile's add control goes to the product page instead of offering sizes. One picker on a tile is the limit.
- The tile's plate uses the first colour's tone.

### 3. Plates and gallery (`components/shop/ProductPlate.tsx`, `Gallery.tsx`)

**Shapes:**
- Add the four `TRACED` shapes from `goodsShapes.ts` to `SHAPES`, replacing the old `tee`.
- Move the file to `components/shop/goodsShapes.ts` and keep its header: it is generated from the flats.
- Do not redraw or simplify the paths. They follow the owner's sketches line for line, including:
  - the wide mock collar;
  - the sleeve bands and hem line (the cover-stitching);
  - the woven tag at the hem;
  - the turtleneck's ribs and the hoodie's cords and pocket.

**`backBody`:**
- The back view swaps the outline for `backBody` (mock-neck and turtleneck backs sit higher than the front).
- Draw it as a second outline that `faces()` toggles alongside `.fx` / `.bx2`.
- Give it `pathLength={1}` so the draw-in still works.
- The cap and tote have no `backBody`: fall back to `body`.

**The patch:**
- Every goods product draws the patch where it used to draw the mark. The `mark` field becomes `patch: [cx, cy, side]`.
  - The four garments take their values from `TRACED`.
  - The cap and tote take theirs from `PATCH_ONLY`.
- Draw it as:
  - a filled square in the plate's line colour;
  - an inner border at 7.5% of the side, in the plate's ground colour;
  - the `LogoMark` centred at 68% of the side, in the ground colour.
- In the close-up view, add a dashed running stitch just inside the edge, in the ground colour. This replaces the stitch circle.
- Patches are drawn at true scale on the garment; the close-up view is what makes them legible:
  - check `markViewBox` still frames the patch with room around it;
  - rename it `patchViewBox`.

**Labels:**
- Name the gallery's close-up "Patch" (`GALLERY.mark.b`).
- Update `markDetail` to find "patch" as well as "mark".
- `isEmbroidered` already matches "Embroidered patch".

**Placement (already in the traced values, listed so nobody "corrects" it):**
- Tees and turtleneck: patch on the wearer's left chest.
- Hoodie: centred between the drawcords. On the left chest the cord would hang across it.

### 3b. Renders and mockups in the goods gallery

**Media:**
- Goods get `media` like the hardware.
- Extend `Media` to `kind: 'render' | 'mock' | 'cad'` and add an optional `colour?: string` (a colour id).
- The file list for each product is in `media/manifest.json` in the attachment. Copy it into each product's `media` in the order given.

**Gallery order:**
1. that colour's renders (or the colourless ones);
2. the three drawing views (Front, Patch, Back), working exactly as they do now;
3. the mockups.

**Gallery behaviour:**
- Picking a colour swaps the renders and mockups to that colour's set and keeps the current position in the gallery where it can.
- The hardware's `HardwareGallery` is the pattern: same thumbnails, caption ("Render · Black, front"), sticky behaviour and keyboard handling. Share the component rather than copying it, if the two can stay one.
- **Captions:** "Render", "Drawing" and "Mockup" are the kind words.

**Labels:**
- Under the gallery: "Renders and mockups are made from our flat sketches, not photographs. The finished pieces may differ slightly." This is the same honesty the hardware note keeps.
- Until there are real photographs, `images` stays empty.

### 4. Copy (`content/shop.ts`)

Plain, short, in the shop's voice. Each product keeps three details, with the patch detail second, because the gallery reads `details[1]`.

| Product | line | description | details |
|---|---|---|---|
| Mock tee | Heavyweight cotton, mock neck, patch on the chest. | A heavy tee with a wide mock neck and the Clear patch stitched small on the chest. A woven tag at the hem, nothing on the back. | Heavyweight cotton jersey · Embroidered patch · Mock neck, cover-stitched hems |
| Long-sleeve mock tee | The mock tee with long sleeves and rib cuffs. | The same heavy mock-neck tee, with long sleeves finished in rib cuffs. The patch on the chest, a woven tag at the hem. | Heavyweight cotton jersey · Embroidered patch · Mock neck, rib cuffs |
| Turtleneck | A knit turtleneck with a folded collar. | A knit turtleneck with a tall collar that folds over, and rib at the cuffs and hem. The patch on the chest. | Knit body · Embroidered patch · Rib collar, cuffs and hem |
| Hoodie | Heavy fleece, kangaroo pocket, patch at the centre. | A heavy pullover hoodie with a lined hood, drawcords and a kangaroo pocket. The patch sits at the centre of the chest. | Heavy cotton fleece · Embroidered patch · Kangaroo pocket, rib cuffs and hem |
| Co-op cap | (keep) | A soft six-panel cap with the Clear patch on the front. One size, with a strap at the back. | Cotton twill · Embroidered patch · One size, adjustable |
| Canvas tote | (keep) | A heavy canvas tote with long handles and the Clear patch sewn on one side. | Heavy cotton canvas · Embroidered patch · Handles fit over a shoulder |

- `GALLERY.back.s`: `tee`, `tee-ls`, `turtleneck` and `hoodie` → "Nothing on it". The cap and tote keep theirs.
- Colour picker label: "Colour" (British spelling, as the rest of the site).
- The dropped-line note in the bag: "Something in your bag changed in the shop, so we took it out."
- The opening facts and lede stay as they are.

### 5. Tests (`tests/shop/`)

- Update every `member-tee` / `variant: 'm'` line to the new id (`black-m`).
- **Add:**
  - a colour/size variant prices from the product;
  - a sold-out pair is refused;
  - a one-colour product's label reads "Navy · M";
  - a saved bag line with a vanished variant is dropped on load, not sent to checkout.
- The Stripe line name becomes "Mock tee (Black · M)" through the existing label code. Assert it.

## Rules

- **Scope:** only the shop. `content/shop.ts`, `components/shop/*`, `lib/shop/*` only if something genuinely needs it, `app/shop/*`, `tests/shop/*`.
- **Pictures:** the shelf tiles stay line drawings. Renders and mockups appear only in a product's gallery, always labelled as what they are. `images` stays empty until there are real photographs.
- **Tokens for every colour** except the product swatches.
- **Reduced motion:** the plate draw-in and the back-turn respect it as they do now.

## Check before the PR

- **Screenshots:** `/shop` and each goods page at 1440, 900, 390 and 360 wide, plus:
  - the bag holding a Black M tee and a Navy L turtleneck;
  - each gallery view (front, patch, back) for all six goods.
- **Compare with the flats:** every garment's front and back match the owner's sketch, and the patch sits where the spec says.
- **Shelf:** with six goods live, the featured tile is the tee, the category chips appear, and the last row closes cleanly.
- **Bag:** load a bag saved with the old `member-tee/m` (seed `localStorage` by hand). The line is dropped with the note and checkout still works.
- **Build:** `typecheck`, `lint`, `test` and `build` are clean; no horizontal scroll at 360.
- **Gallery:** each colour shows its own renders and mockups; the note under the gallery is present; images are served at sensible sizes (use `next/image` as the hardware does).
- **PR description:** list every `TODO(owner)` left.
