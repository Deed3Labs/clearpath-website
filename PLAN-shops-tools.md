# Tools for shops: plan for Phases 3 and 4

- **The brief:** `claude-code-site-tools-prompt.md`, held by the lead.
- **The spec:** `reference/redesign/shops-tools.html`, with its images in `reference/redesign/assets/`.
- **`PLAN.md` still governs how code is written:**
  - copy in `content/`;
  - `--color-*` tokens;
  - page CSS nested under `.pg-<route>`;
  - motion only through `@/lib/anim`, with the server markup as the end state;
  - numbers through `@/lib/format`, or `@/lib/shop/money` in the shop;
  - its accessibility rules;
  - never touch the header components.
- This file is the contract between the lead and the two workers.

## Branches, worktrees, ports

| | Worktree | Branch (from `feat/shops-tools`) | Ports |
|---|---|---|---|
| Worker A: `/shops/tools` (Phase 3) | `~/dev/clearpath-website-wt-tools` | `feat/shops-tools-page` | dev 8151, prod 8161 |
| Worker B: catalog, plates, For shops (Phase 4) | `~/dev/clearpath-website-wt-hw` | `feat/shop-hardware` | dev 8152, prod 8162 |

- **Commits:** commit with explicit pathspecs, push your own branch only, and never touch `main` or the other worktree. **Never `git stash`.**
- **Builds:** don't run `npm run build` while your own dev server is up, and stop servers when you're done. Use Node 22 (`export PATH=/usr/local/bin:$PATH`).
- **Playwright:** `playwright-core` is in the lead's scratchpad, `…/scratchpad/pw/node_modules` (Chrome via `channel: 'chrome'`, plus WebKit). Localhost needs the Bash sandbox disabled.

## Fixed rules (from the brief and the user's decisions)

1. **Copy is exact.** The mockup bar, its notes and the dashed "The shelf as it is today…" placeholder are mockup-only. The shelf's chip counts come from the catalog, not the spec.
2. **The name is "Pay with Clear"**, never "Clear Pay" or "Clearpay". The verb is "take Clear".
3. **The repo is public.**
   - The deposit comment must not name a percentage. Write: "The deposit is our build cost plus a margin for the unexpected, rounded up to the next $5, set by the owner. Never put costs on the site."
   - Never write a cost figure anywhere.
4. **The figures must agree** with the brief everywhere: the till is $42.00 ($8.00 change from $50); a $40 sale is $0.60, $1.43 or $1.76; rewards come to $13.55 and 12 points.
5. **Status chips on `/shops/tools`, no more than this:**
   - till "Invite-only", `tone="live"`;
   - Tables and Rewards "In build";
   - Online "Planned" (the lead may change this after review);
   - Hardware "Pre-order".
6. **Hardware tiles derive from the catalog.** Clear Tap reads "From $35 · Reserve $10" everywhere, including `/shops/tools` §05, where the spec says $89/$80.
7. **Draft products 404**, and every hardware product starts `status: 'draft'`. Link a hardware tile (on `/shops/tools` or anywhere outside the shop) only when `getProduct(slug)` returns it. "Reserve in the shop" and "See the shop" links show only when at least one hardware product is visible. Otherwise render the tile without a link.
8. **The FCC notice** appears only on `preorder.fcc` products (Clear Point, Point Pay case, Clear Drawer, Full counter). Its wording is per product, as the spec gives it. Mark it `TODO(owner): counsel reviews this wording before launch`.
9. **Ship months** are the spec's, each marked `TODO(owner)` in the catalog. **Hardware weights** are `TODO(owner)` (use a placeholder number with the comment).
10. **Keep these lines as drawn:** the founding-partner note (Clear Point only), Clear Counter's "Fee credit back…", and the rewards "earns 12 points" line. The lead raises them with the user.

## Foundation: Worker B lands this first, as one commit, and pushes it

Commit message: **`Shop hardware: catalog foundation`**. Worker A merges it from `origin/feat/shop-hardware` before building the hardware lineup.

- **`content/shop.ts` types:**
  - `ProductKind` gains `point | point-large | pay-case | tap | tap-phone | counter | drawer | printer | stand | panels | kit`.
  - `Product` gains `section: 'goods' | 'for-shops'` (the existing goods are `'goods'`), `preorder?: { ships: string; fcc: boolean }`, `fcc?` notice text (or a copy map keyed by slug), and `media?: { kind: 'render' | 'cad'; src: string; alt: string; caption: string }[]`.
  - `Variant` gains `priceCents?` and `depositCents?`. A variant's price overrides the product's.
- **`content/shop.ts` data:** the ten hardware products, in the spec's order (point, tap, counter, drawer, printer, pay-case, tap-phone, stand, panels, full-counter). Each gets the slug, name, line, description, variants (with the price and deposit table from the brief), the four details, `preorder.ships` (e.g. `'Feb 2027'`), `fcc`, and `media` in the gallery order the spec shows. Add `ships` as a display string plus a `TODO(owner)`.
- **Helpers in `lib/shop/catalog.ts`:** `unitPrice(product, variantId)`, `deposit(product, variantId)`, `fromPrice(product)`, `fromDeposit(product)`, `goodsProducts()` and `forShopsProducts()`. `priceBag` keeps its shape for now; Phase 5 extends it.
- **Assets:**
  - `reference/redesign/assets/renders/*.jpg` → `public/shop/hardware/renders/`
  - `assets/cad/*.svg` → `public/shop/hardware/cad/`
  - `assets/screens/*` → `public/shops/tools/`
- **`components/shop/hardwareShapes.ts`:** each hardware product's drawing, taken from the spec's "Drawing · The shop's drawing" slide for that product. Generate it with a script from the spec's SVG markup; **don't redraw**. Store it as data: elements with `tag`, attrs (`d`, `x`, `y`, `transform`, `className` …) and text. The classes are `bd`, `ln2`, `oc` (occluding fill), `tx`, `tx big`, `tx mono`, `tx dim`, `tx neg`, `tx2`, `ns`, and any others the spec uses. Keep every path `pathLength={1}` where the goods do, so `PlateDraw` animates them.
- **`ProductPlate`:** renders hardware kinds from `hardwareShapes`. Goods are unchanged. The CSS for `.oc` and `.tx*` goes in `app/shop/shop.css` (spec lines ~812–828). Plates used outside `/shop` need the same CSS, so put the hardware plate rules where both routes get them: a small shared block in `app/styles/system.css` under a `.hwplate` scope, or a CSS file imported by `ProductPlate`.
- **`components/shop/HowReserving.tsx`:** three cells (`n`, `title`, `text`). It takes its items as a prop, because `/shop` and `/shops/tools` use different copy.

## Worker A: `/shops/tools` (Phase 3)

- **Files:**
  - `app/shops/tools/page.tsx`
  - `app/shops/tools/page.css`, every rule under `.pg-shops-tools`
  - `content/shopsTools.ts`
  - `app/shops/tools/_parts/*`
  - `app/shops/tools/opengraph-image.tsx`, using the shared OG card (below)
  - `app/sitemap.ts`
- **The spec:** the `v-tools` view (spec ~1254–1386); its CSS is at ~833–1076 and ~1141+ for the phone canvases. The canvases are desk 1180×600 and phone 390×720 (till), desk 1180×640 and phone 390×780 (tables), desk 760×520 and phone 390×640 (online).
- **Parts:**
  - `TillScreen` (desk and phone)
  - `FeeCells` (bars sized against $1.76, then the foot note)
  - `TablesScreen` (desk and phone)
  - `PointStates`: images `public/shops/tools/point-{free,held,bill,call}.jpg`, labelled Free, Seated, Bill and Calling. Seated is `point-held.jpg`.
  - `RewardsPhone`: an image, `rewards-micasa-home.png`, with the spec's alt text
  - `CartMember`, `RulesList`
  - `OnlineCheckout` (desk browser frame plus phone bottom sheet)
  - `Snippet`, `LinkCell` (use `Qr` from the system)
  - `HardwareLineup`: five tiles from the catalog, each showing the product's first render through `next/image`; links per rule 7
  - `HowReserving`: from the foundation, with the `/shops/tools` copy
  - `CostTable`
  - the close, through the existing `Close`, with label `07 Start`
- **Reuse** `PageHero`, `Section`, `SectionHead`, `Device`, `Screen`, `Bento`, `Cell`, `Chip` and `Qr` from `@/components/system`.
- **Motion:** words rise as on `/shops`; tiles and cells fade up on scroll; the till's Charge button and the Tables "Asking" item pulse once. Use only the `@/lib/anim` hooks.
- **Metadata:** title "Tools for shops"; description = the hero lede.
- **OG:** refactor `app/opengraph-image.tsx` into a shared `app/_og/card.tsx` (`renderCard(headline, kicker?)`). Root keeps the same output, and `/shops/tools` gets its own. Check the subset Bricolage TTF in `app/_og` has every glyph of the new headline; if one's missing, report it rather than swapping fonts.
- **Before the lineup:** build everything else first. Then `git fetch origin && git merge origin/feat/shop-hardware` (merge, don't rebase), once the foundation commit is there. If it isn't there yet, build the lineup last and say so in your report.

## Worker B: catalog, plates, gallery, For shops (Phase 4)

After the foundation:

- **The For shops section on `/shop`** (spec ~1414–1460, CSS ~1091–1140):
  - It sits between the shelf and "What it is for", numbered 01. **`WHY.n` becomes `'02'`.**
  - Its own grid: the large first tile, and the rack filling the last row.
  - Tiles show the first render (`next/image`), the Pre-order chip (`tone="underway"`), name, "From $89", the line, and "Reserve **$55** · ships Feb 2027".
  - Add (+) puts the default variant in the bag (no size row).
  - The three How reserving cells close the section, with the `/shop` copy.
- **Shelf:** the grid shows goods only. The category chips count the whole catalog and gain **For shops** with its count. That chip scrolls to `#for-shops` instead of filtering. The 5+ layout rules count goods only.
- **The hardware product page** (`/shop/[slug]` when `section === 'for-shops'`; spec ~1461–1730, CSS ~369–444 and ~1041–1076):
  - **`HardwareGallery`:**
    - The main image is 16:11. Renders are covered (`next/image`); the drawing (`ProductPlate`) and the CAD sheets (plain `<img>` on `--color-paper-2`) are contained.
    - A caption sits bottom-left ("Render · …", "Drawing · The shop's drawing", "CAD · CLR-PT-101 · Body").
    - A thumb row scrolls sideways (`role="tablist"`, thumbs `role="tab"` with `aria-selected`, arrow keys). The order is renders, then the drawing, then CAD.
    - The line under it: "Renders are made from our CAD models, not photographs. Prototype details may change."
    - Sticky on desktop.
  - **The buy column:**
    - "For shops · 01 / 10" and the Pre-order chip.
    - Name, line, "$89 each" ("for ten" on the Ten for tables variant), description.
    - Variant radios (reuse `Sizes`) that update the price and the reservation block: Reserve now, When it ships, Ships "Feb 2027, estimated". The quantity stepper multiplies them.
    - The button "Reserve · $55" (× qty), then "For shops on Clear. Checkout asks you to sign in to your shop or set one up."
    - The founding-partner note (Clear Point only), the numbered details list, `FccNotice` when `fcc`, and the footer line "Refundable in full until we start building yours. We email you before we do."
  - **Also:** three other For shops products. Clear Point shows Pay case, Stand and Tap; every other product shows Point, Tap and Counter, minus itself (Clear Tap shows Point, Counter and Drawer), as in the spec.
  - Adding to the bag uses the existing `BagProvider` (slug, variant, qty). The bag itself is Phase 5; don't change `BagView` beyond making it not crash on hardware lines.
- **`ShopItem`/`toItem`** carry `section`, `preorder` and the first render's src and alt, so the shelf, the mini-bag and Also can show the render. Goods are unchanged.
- **Closed shop:** the For shops section follows `isShopOpen()` like everything else, so production stays closed. Test the open state with a prod build using `SHOP_OPEN=true SHOP_SHOW_DRAFTS=true`.

## QA, both workers, before reporting

- `npm run typecheck`, `npm run lint` and `npm run build` must be clean.
- On your prod build, in Chrome and WebKit at 1440, 900 and 390:
  - no page errors and no hydration warnings;
  - no horizontal scroll;
  - JS off and reduced motion show the end state;
  - the hero h1 is 2 lines from 700px.
- Count the rules your page CSS parses in WebKit vs Chrome, and keep them equal. postcss-nesting flattens the CSS; check the served CSS has no nested rules.
- Screenshots of your pages at 1440 and 390, saved to `…/scratchpad/hs/`.
- **Report:**
  - what you built (files);
  - every copy change by content file;
  - any deviation from the spec, with why;
  - anything you found that conflicts with this plan.
