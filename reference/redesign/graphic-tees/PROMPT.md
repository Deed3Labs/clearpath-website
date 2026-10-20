# Shop: Logo Tees renamed and repriced, and three Graphic Tees

## Before you start

- **This builds on the wearables change** (`shop-wearables`, prompt in `wearables/clear-shop-wearables-prompt.md` in this bundle). Check `main`:
  - **If it has landed:** branch `shop-graphic-tees` from main and apply this prompt.
  - **If it hasn't:** do the wearables prompt first, on its own branch and PR, using the names and prices below instead of its own. Then branch from it for this one.
- `git pull` main first. Open a PR; never push to `main`.
- **Work as a lead with one worker:**
  - **Lead:** catalog, prices and copy (sections 1, 2 and 4), then integration and checks.
  - **Worker:** the plate print layer and the gallery (section 3), once the lead has the types in.

## Attachments

Copy these into the repo:

- `public/shop/goods/graphic-tee-*/` → `public/shop/goods/` as they are. Each folder has:
  - `mock-black.jpg`, `mock-cobalt.jpg`, `mock-white.jpg`: the front-facing mocks, for the gallery;
  - `plate-print.png` (for dark plates: Black and Cobalt) and `plate-print-light.png` (for the White tee): the print for the line drawing, drawn in the plate's two inks, in the plate's 400 × 400 space at 4×. On the White tee the type and boxes are inverted to dark.
- `graphicTees.json` → `reference/redesign/graphic-tees/`. Plate data per product:
  - `printLayer`, `printBox`, `cornerText`;
  - `patch`, `patchRotate`;
  - `printViewBox`.
- `plates/*-dark.svg` and `plates/*-white.svg` → `reference/redesign/graphic-tees/plates/`. Reference for how each front view should look on a dark tee and on the White tee. Do not ship them.
- `print-artwork/` (separate art for dark tees and the White tee), `print-spec.md` → `reference/redesign/graphic-tees/`. For the owner and the factory, not shipped.

## 1. Names and prices (`content/shop.ts`)

| Product | Slug | Price | Colours | Category |
|---|---|---|---|---|
| Logo Tee (was Mock tee) | `member-tee` (kept) | **$27** | Black, White, Navy | Wear |
| Logo Long-Sleeve Tee (was Long-sleeve mock tee) | `long-sleeve-mock-tee` (kept) | **$32** | Black, Off-white | Wear |
| Carousel Mall Tee | `graphic-tee-carousel-mall` | **$42** | Black, Cobalt, White | Graphic Tees |
| Two Ten Overpass Tee | `graphic-tee-two-ten-overpass` | **$42** | Black, Cobalt, White | Graphic Tees |
| Devore Tee | `graphic-tee-devore` | **$42** | Black, Cobalt, White | Graphic Tees |

- **Unchanged:** the turtleneck ($98), hoodie ($88), cap ($32) and tote ($28) keep their prices.
- **Slugs:** keep the old slugs for the two Logo Tees so links, tests and orders still resolve. Only the names change.
- **Graphic Tees:**
  - kind `tee`, the same garment and plate shape as the Logo Tee;
  - colours Black, Cobalt and White, in that order; sizes S, M, L, XL and XXL, so variant ids run `black-s` … `white-xxl`;
  - new colour: `cobalt` Cobalt `#1F4FA8`, tone `ink`. Black and White reuse the existing `black` and `white` entries (tones `ink` and `paper`);
  - packed weight 9 oz, like the Logo Tee.
- **Category:** add `Graphic Tees` as a new category, so the shelf's category chips can filter to them. The Logo Tees stay in `Wear`.
- **Status:** see "Owner check" before deciding.
  - Ship the three Graphic Tees in the shop's not-yet-on-sale status (whatever the catalog calls it, e.g. coming soon), not `live`.
  - If the catalog has no such status, leave them out of the shelf behind a flag and say so in the PR. Do not invent a new status system.
- **Featured:** the Logo Tee stays featured.

## 2. The patch moves to the sleeve on Graphic Tees

- The print fills the chest, so on Graphic Tees the Clear patch sits on the wearer's right sleeve.
- **Plate:**
  - draw the patch at `patch` from `graphicTees.json`, rotated by `patchRotate` degrees about its centre;
  - drawn in the same style as every other patch: the filled square, the inner border and the `LogoMark`.
- **Shape data:** add optional `patchRotate?: number` to the product's plate data. Default 0, so other products are unchanged.

## 3. Plates and gallery (`components/shop/ProductPlate.tsx`, gallery)

**The print on the line drawing (front view only):**
- Add optional `print?: { src: { ink: string; paper: string }; box: [x, y, w, h]; viewBox: [x, y, w, h] }` to the product's plate data. Fill it from `graphicTees.json`:
  - `printLayer` → `src` (pick by the selected colour's tone: `ink` for Black and Cobalt, `paper` for White);
  - `printBox` → `box`;
  - `printViewBox` → `viewBox`.
- **Front view, dark tones (Black, Cobalt), in order:**
  1. the body filled in the plate's line colour;
  2. the interior lines in a muted line colour, so seams and the collar still read on the dark fill;
  3. `src.ink` as an SVG `<image>` at 0, 0, 400, 400, clipped to the body path;
  4. the patch on top, drawn inverted: a ground-colour square with the mark in the line colour.
- **Front view, paper tone (White):** the plate as every other plate draws it (outline and lines in the line colour, no fill), then `src.paper` clipped to the body, then the patch in its usual style.
- **Match the look of `plates/*.svg`.** Use tokens for the colours: the plate's line and ground colours, plus a muted line token. If no muted token exists, add one.
- **Placement is baked into each print layer.** Don't re-centre anything:
  - Carousel Mall and Devore are centred and sit lower on the chest;
  - Two Ten Overpass sits off to the wearer's left side by design.
- **Back view:** unchanged. A plain black back, which matches the products: nothing is printed on the back.
- **Close-up view:**
  - For Graphic Tees the close-up frames the print using `print.viewBox`, and is labelled "Print".
  - The patch close-up is not needed for these three. Products without `print` keep "Patch".
- **Draw-in:** let the print layer fade in after the outline draws. Respect reduced motion as the outline does.
- **Shelf tiles:** the plate front view, as for every other good.

**Gallery media (`media` on each Graphic Tee):** one mock per colour, so the colour picker swaps them like the other goods:
- `{ kind: 'mock', src: '/shop/goods/<slug>/mock-<colour>.jpg', colour: '<colour>', alt: 'A mockup of the <Name> in <Colour>, front', caption: '<Colour>' }` for `black`, `cobalt` and `white`.
- **No renders yet.** The gallery order stays: renders (none), the three drawing views (Front, Print, Back), then mockups.

**Logo Tees:** rename "mock tee" to "Logo Tee" in every caption and alt text in their `media`.
- "The black mock tee, laid flat" becomes "The black Logo Tee, laid flat".
- "Long-sleeve mock tee" becomes "Logo Long-Sleeve Tee".

## 4. Copy (`content/shop.ts`)

Plain and short, in the shop's voice. Keep three details. Put the patch detail second on every product, because the gallery reads `details[1]` (it finds "patch").

| Product | line | description | details |
|---|---|---|---|
| Logo Tee | Heavyweight cotton, mock neck, patch on the chest. | A heavy tee with a wide mock neck and the Clear patch stitched small on the chest. A woven tag at the hem, nothing on the back. | Heavyweight cotton jersey · Embroidered patch · Mock neck, cover-stitched hems |
| Logo Long-Sleeve Tee | The Logo Tee with long sleeves and rib cuffs. | The same heavy mock-neck tee, with long sleeves finished in rib cuffs. The patch on the chest, a woven tag at the hem. | Heavyweight cotton jersey · Embroidered patch · Mock neck, rib cuffs |
| Carousel Mall Tee | The old Carousel Mall, printed big on the front. | A photograph of San Bernardino's Carousel Mall, printed large across the front of the Logo Tee. The patch moves to the sleeve. | Heavyweight cotton jersey · Embroidered patch on the sleeve · Large printed front, mock neck |
| Two Ten Overpass Tee | The 210 overpass sign, printed tall down one side. | A photograph of the San Bernardino sign over the 210, printed tall down one side of the Logo Tee. The patch moves to the sleeve. | Heavyweight cotton jersey · Embroidered patch on the sleeve · Large printed front, mock neck |
| Devore Tee | Devore from above, printed big on the front. | A photograph looking down over Devore toward the mountains, printed large across the front of the Logo Tee. The patch moves to the sleeve. | Heavyweight cotton jersey · Embroidered patch on the sleeve · Large printed front, mock neck |

- **`GALLERY.back.s`** for the Graphic Tees: "Nothing on it".
- **Category chip label:** "Graphic Tees".
- **Stripe line names**, through the existing label code: "Logo Tee (Black · M)", "Devore Tee (Black · M)".

## 5. Tests (`tests/shop/`)

- Update any assertion on the old names or prices: Logo Tee $27, long-sleeve $32.
- **Add:**
  - a Graphic Tee variant prices at $42, for each of `black-m`, `cobalt-m` and `white-m`;
  - the plate picks `print.src.paper` for White and `print.src.ink` for Black and Cobalt;
  - a Graphic Tee in the not-on-sale status can't be added to the bag or sent to checkout, if that status exists;
  - the Stripe line name for a Graphic Tee reads "Devore Tee (Black · M)";
  - the `Graphic Tees` category filters to exactly the three.

## Owner check before merging

- **Paid orders:** if anyone has paid for a Mock tee at the old $42, decide what to tell them (refund the difference or not) before the price change ships.
- **The Graphic Tee artwork isn't final:**
  - the body text is real now (short local histories). Carousel Mall is credited to AWESTSIDESTORY (owner to confirm with the photographer); the overpass and Devore credits still read "Photographer's name";
  - the corner coordinates: Carousel Mall and Devore are full pairs from published sources (Devore may change to the owner's own pin); the overpass uses the owner's pin;
  - the art was lifted from mockups and carries their wrinkle shadows.
- **Photo licences:** the photographs need a licence from whoever took them before the shirts are sold.
- That's why they go in as coming soon. Leave a `TODO(owner)` on each Graphic Tee for: final art, photo credits, coordinates and photo licence.

## Rules

- **Scope:** only the shop. `content/shop.ts`, `components/shop/*`, `app/shop/*`, `tests/shop/*`, and `lib/shop/*` only if something genuinely needs it.
- **Tokens for every colour,** except product swatches.
- **Pictures:**
  - the mocks appear only in galleries, labelled "Mockup";
  - shelf tiles stay line drawings;
  - `images` stays empty until there are real photographs.

## Check before the PR

- **Screenshots** of `/shop` and each Graphic Tee page at 1440, 900, 390 and 360 wide, plus:
  - each Graphic Tee's Front, Print and Back views, in Black, Cobalt and White;
  - the shelf filtered to Graphic Tees.
- **Compare the plates with `plates/*-dark.svg` and `plates/*-white.svg`:**
  - the print sits in the same place, at the same size, with the overpass off to the side;
  - Black and Cobalt plates have the body filled dark; the White plate is outline-only with dark type;
  - switching colour swaps the print layer and the mockup;
  - the patch is on the wearer's right sleeve, at a slight angle.
- **Prices:**
  - the Logo Tee shows $27 and the long-sleeve $32 on the shelf, the product page, the bag and the Stripe line;
  - the Graphic Tees show $42.
- **Build:** `typecheck`, `lint`, `test` and `build` are clean, with no horizontal scroll at 360.
- **PR description:** list every `TODO(owner)` left.
