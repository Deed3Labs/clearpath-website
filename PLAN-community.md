# Community pages plan: Shop, Events, Directory

Port of `reference/redesign/{shop,events,directory}.html` (brief:
`clear-community-pages-prompt.md`). Read `PLAN.md` first: every rule there still holds
(token renames, `.pg-<route>` scoped page CSS, server markup is the end state, motion only
through `@/lib/anim`, `money`/`int` from `@/lib/format`, copy in `content/*.ts`, no Tailwind
utility class names).

Branch `redesign-community`, cut from `main`. The `redesign` branch exists but is merged and
behind `main` (four fixes since), so it is not the base.

## Ground rules specific to these pages

- **Plumbing is frozen.** Do not change `lib/shop/*`, `app/api/shop/*`, `BagProvider`'s storage,
  `lib/events/*`, the `.ics` routes, `app/events/[slug]/error.tsx`, `lib/directory.ts`, or
  `dynamicParams = false`. Closed shop stays really closed (no buy, no rates, no pay,
  checkout refuses). Drafts keep their env gates.
- **No sample data ships.** The mockups' extra products, moved dates, stand-in events, local
  rows, sample businesses, prefilled address and fake rates are design aids only. Real data
  comes from the content files and pipelines. To test 7 products, use a dev-only fixture you
  do not commit.
- **Forms: success only after a 2xx.** `ShopNotify`, `NotifyForm`, `ReferForm`, the bag's
  rates and pay keep their endpoints and error strings; a failure says nothing was stored.
- **Filters use `aria-pressed`** (the shop mockup's `role=tab` chips become pressed toggles).
  Size pickers are radio groups with arrow keys; sold-out sizes disabled.
- **Listboxes:** `FieldSelect` only (it is restyled on `/join` — reuse that underline style).
- **Countdowns** render a static "Starts …" line on the server; the ticking is client-only.
- **Times:** only `lib/events/time.ts` formats event dates (Pacific).

## Shared pieces (Phase 1, lead): `@/components/system`

| Piece | Props | Renders |
|---|---|---|
| `Crumbbar` | `crumbs: {href?, label}[]` (last = current page), `action?: ReactNode`, `className?` | `.crumbbar-w` (sticky under the header at `var(--head-h)`, on-ink over ink bands) › `.wrap` › `.crumbbar`: breadcrumb `<nav><ol class="crumbs">` left, one action right |
| `CrumbLink` | `href`, `children` | the right-hand "All events →" style link (`.sub-link`) |
| `Ticket` | `who`, `ck?`, `facts: {k, v: ReactNode}[]`, `children` (the actions), `as?`, `className?` | `.cell.tk`: `.c-h` header, `dl` facts, `.perf` (dashed rule with half-circle notches, `aria-hidden`), `.act` |
| `PillField` | `label` (visually hidden), `button: ReactNode`, `note?`, `invalid?`, `done?: ReactNode` (replaces the field), `size?: 'md' \| 'lg'`, plus any `<input>` props | `.nf` input and button in **one** pill (tops and bottoms on one line); stacks on phones; `.done3` when done |
| `DateBlock` | `date: Date`, `size?: 'sm' \| 'md'` | `.dt`: weekday / day / month in a ruled box, Pacific, `aria-hidden` (the row text carries the date) |
| `CatChips` (client) | `label`, `options: {value, label, count}[]`, `value`, `onChange`, `className?` | `.cats` pill filter row with mono counts, `aria-pressed`, scrolls inside itself with an edge fade on phones |

Also done in Phase 1, on real routes: `ShopBar` is built on `Crumbbar` (bag pill as the
action), and `NotifyForm` (shared by the shop and events) is built on `PillField`: same endpoint,
same 2xx rule, `size`, `placeholder` and `note` added. Workers style around these rather than
rebuild them.

`HeaderInk` also sets `--head-h` (the header's live height) on `<html>` and gives every
`.crumbbar-w` the same on-ink swap as the header.

## Worker A: Shop

Routes `/shop`, `/shop/[slug]`, `/shop/bag`, `/shop/thanks`, closed `/shop`.
Owns: `app/shop/**`, `components/shop/**`, `content/shop.ts`.
- `ShopBar` → built on `Crumbbar` with the bag pill as its action (count, dot-fly target,
  mini-bag panel). Already switched in Phase 1; extend it.
- `Product` gains `category: string` (required; Member tee Wear, Co-op cap Headwear, Canvas
  tote Carry) and `featured?: boolean`. `CLOSED_REASONS[*].lines: string[]` for the h1.
- `ProductPlate` gains the back-view `SHAPES` and the mark zoom; keep its API additive.
- Rebuild: shelf grid (column / featured / filter / filler rules for 1 to many products),
  quick add + mini-bag, product page gallery and buy panel, bag lines + three folding
  checkout steps (`FieldSelect` for State), thanks (timeline and questions; **no receipt or
  ship-to**: anyone can open the URL), closed band + window scenes per reason.
- Keep `AddToBag`/`BagView` logic (rates, pay, closed guards); restyle and restructure around it.

## Worker B: Events and Directory

Routes `/events`, `/events/[slug]`, `/directory`, `/directory/[slug]`.
Owns: `app/events/**` (not the `.ics` routes or `error.tsx` logic), `app/directory/**`,
`components/events/**`, `components/directory/**`, `content/events.ts`, `content/directory.ts`.
- Events: hero with "Next up" card (falls back to the next public meeting), board (sticky
  month calendar + agenda, 64px headers / 48px sub-rows aligned; day strip below 900px),
  "n public calendars" built from `LOCAL_SOURCES`, ink section 02 with the four `KINDS`
  cells. Event page: `Crumbbar`, body cell, `Ticket`, also-coming-up rows.
- Directory: hero facts computed from partners (empty fallbacks), search pill + `CatChips`,
  list rows + sticky drawn map (town table in `content/directory.ts`; unmapped city lists
  without a pin), peek panel / By town, refer form as a framed cell with underline fields,
  ink section 02 drawings. Partner page: `Crumbbar`, body cell with small map, `Ticket`,
  "Also takes Clear Pay" nearest three.
- `ReferForm` rebuilt as the framed cell with underline fields; endpoint and error strings
  unchanged. `NotifyForm` is already on `PillField` (Phase 1): pass `copy.placeholder` /
  `copy.note` from `content/events.ts`.

## Phase 3 (lead)

Merge, fold duplicates into the shared pieces, typecheck / lint / build, Playwright sweep of
every route at 360 / 390 / 900 / 1280 / 1440 in Chrome and WebKit (errors, overflow, one
cobalt per view, + buttons measure as circles, events headers aligned), shop safety with
Stripe test keys (closed disables buy / rates / pay; checkout API refuses), delete dead
`.shop-*` / `.ev-*` / `.dir-*` CSS after searching, PR.
