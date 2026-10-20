# Shop: the Clear Patch, sold on its own

## Before you start

- This builds on the wearables change (`shop-wearables`), which added the patch drawing to the plates. If that hasn't landed on `main`, do it first.
- It doesn't depend on the Graphic Tees change. Either order works.
- `git pull` main, then branch `shop-patch` from main. Open a PR; never push to `main`.
- One agent is enough for this.

## Attachments

Copy these into the repo:

- `public/shop/goods/clear-patch/` → `public/shop/goods/clear-patch/` as it is. It holds the gallery pictures:
  - `mock-square.jpg`, `mock-circle.jpg`, `mock-pair.jpg`;
  - `mock-back-square.jpg`, `mock-back-circle.jpg`;
  - `detail-square.jpg`, `detail-circle.jpg`.
- `plates/*.svg` → `reference/redesign/patch/plates/`. Reference for the line drawings: front and back, square and round. Do not ship them.
- `artwork/`, `clear-patch-spec.md` → `reference/redesign/patch/`. These are the true-size patch art and the production spec, now with the round version. Replace the older `clear-patch-spec.md` there, if one exists. They're for the owner and the supplier, not shipped.
- `clearPatch.json`: the product data below, in one place.

## 1. Catalog (`content/shop.ts`)

| Product | Slug | Price | Options | Status |
|---|---|---|---|---|
| Clear Patch | `clear-patch` | **$9** | Square, Circle | `live` |

- **Kind:** a new goods kind `patch`. Add it to `GoodsKind` and `GOODS_KINDS`.
- **Category:** the same one the cap and tote use.
- **Variants:** `{ id: 'square', label: 'Square' }` and `{ id: 'circle', label: 'Circle' }`. There's no colour and no size; both are the Ink colourway.
- **Picker:** the product page shows the existing size-style picker, labelled **"Shape"**:
  - one tab stop, arrows move;
  - sold-out states as usual;
  - Square is the default.
- **Shelf tile:** two options means quick-add can offer them, the same way as sizes. If the tile can only show one picker, show Shape.
- **Packed weight:** 0.5 oz. Use whatever shipping rule the shop already applies to light goods. Don't add a new shipping method.
- **Bag and Stripe labels:** "Clear Patch (Square)" and "Clear Patch (Circle)", through the existing label code.

## 2. Plate (`components/shop/ProductPlate.tsx`)

The plate for `patch` is the patch itself, drawn large, in the **paper** tone: light ground, the patch in the line colour. That matches the real Ink patch. Match `plates/clear-patch-*-front.svg` and `-back.svg` closely; they're the reference.

- **Front:** the patch at centre `(200, 196)`, side `236` (63.5 mm across), with its stitching drawn:
  - **Shape:** filled in the line colour, outlined at the usual line weight.
  - **Satin border:** a band 7.5 % of the side wide. Fine stitches run across it in the ground colour, slightly slanted and mitred into the corners on the square. An inner edge line marks where it ends.
  - **Ground:** a faint fill-stitch texture of short diagonal rows, in the ground colour at low opacity.
  - **Mark:** in the ground colour, with its stitch directions in the line colour at low opacity:
    - radial stitches across the ring and the small eye;
    - an angled hatch on the dot;
    - straight stitches across the bar.
  - **Circle:** the same drawing as a circle; the satin stitches run radially round the edge.
  - **Dimension line:** under the patch, reading "63.5 mm" in the plate's mono type.
- **Back:** the backing:
  - fine diagonal twill hatching;
  - the border's bobbin stitches showing faintly;
  - the outline and inner border lines;
  - a dashed line where it's sewn on;
  - the mark mirrored at low opacity;
  - the same dimension line.
- **Close-up ("Patch"):** zoom the front view onto one corner of the border and the edge of the mark, so the stitches read.
- **Shape follows the picker:** switching Square / Circle switches the plate's shape, with the same transition the back-turn uses. Respect reduced motion.
- **Data:** add optional `patchShape?: 'square' | 'circle'` to the plate's patch drawing so the shape can be passed in. Default `'square'`, so every garment stays as it is. Garment plates keep their small, unstitched patch; the stitch detail is only for the patch's own plate.
- **Build it as SVG in the component** (paths generated in code, as the reference does), not as embedded images, so it stays sharp and themed by the tone tokens.

## 3. Gallery media

Picking a shape swaps the gallery to that shape's pictures, like colours do on the other goods. Extend `Media` with an optional `variant?: string` (a variant id) for this. Media without `variant` show for both shapes.

| src | variant | caption | alt |
|---|---|---|---|
| `/shop/goods/clear-patch/mock-square.jpg` | square | Square | The square Clear Patch on canvas |
| `/shop/goods/clear-patch/detail-square.jpg` | square | Square, up close | The square patch's satin border and stitched mark, up close |
| `/shop/goods/clear-patch/mock-back-square.jpg` | square | Square, front and back | The square patch beside its twill backing |
| `/shop/goods/clear-patch/mock-circle.jpg` | circle | Circle | The round Clear Patch on canvas |
| `/shop/goods/clear-patch/detail-circle.jpg` | circle | Circle, up close | The round patch's merrowed edge and stitched mark, up close |
| `/shop/goods/clear-patch/mock-back-circle.jpg` | circle | Circle, front and back | The round patch beside its twill backing |
| `/shop/goods/clear-patch/mock-pair.jpg` | (none) | Both shapes | The square and round Clear Patches side by side |

- **Kind:** all of these are `kind: 'mock'`, labelled "Mockup" as on the other goods.
- **Gallery order:** that shape's mockups, then the three drawing views (Front, Patch, Back), then the pair.
- **Note under the gallery:** the same note as the other goods.

## 4. Copy (`content/shop.ts`)

| field | text |
|---|---|
| line | The Clear patch on its own, square or round. |
| description | The same embroidered patch we sew on everything, to put on your own jacket, bag or cap. 63.5 mm across, with a satin border on the square and a merrowed edge on the round. It sews on; it isn't iron-on, because iron-on peels. |
| details | Embroidered, twill backing · Embroidered patch, 63.5 mm · Sew-on, square or round |

- **Patch detail second:** keep "Embroidered patch" as `details[1]`, as the gallery reads it.
- **`GALLERY.back.s` for the patch:** "Twill backing, sew-on".

## 5. Tests (`tests/shop/`)

- Each variant prices at $9.
- The Stripe line names read "Clear Patch (Square)" and "Clear Patch (Circle)".
- Picking Circle switches the gallery to the circle media and the plate to the circle shape.
- Garments still draw a square patch: `patchShape` defaults to square.

## Rules

- **Scope:** only the shop. `content/shop.ts`, `components/shop/*`, `app/shop/*`, `tests/shop/*`, and `lib/shop/*` only if something genuinely needs it.
- **Tokens for every colour.**
- **Pictures:** mockups only in the gallery, labelled as mockups. The shelf tile is the line drawing.

## Check before the PR

- **Screenshots:**
  - `/shop` and `/shop/clear-patch` at 1440, 900, 390 and 360 wide;
  - the plate's Front, Patch and Back views for both shapes;
  - the bag holding one of each.
- **Compare the plates** with `plates/clear-patch-*.svg`.
- **Build:** `typecheck`, `lint`, `test` and `build` are clean, with no horizontal scroll at 360.
- **PR description:** list any `TODO(owner)`.

## Owner check

- **Strike-off:** the round patch is new. Order its own strike-off (merrowed edge) before selling it. The square one is the same as on the garments.
- **Stock:** if neither shape is in stock yet, use the same pre-order status the other goods use until it is.
