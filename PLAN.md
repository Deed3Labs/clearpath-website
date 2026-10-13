# Redesign plan

Port of the eight mockups in `reference/redesign/` (prompt: the redesign brief). Mockups are the
spec for layout, motion, interaction and copy. This file is the contract between the lead
(Phase 1 shared system, Phase 3 QA) and the two page workers (Phase 2).

## Ground rules for everyone

- **Copy lives in `content/<page>.ts`.** JSX holds no sentences. Data arrays the scripts use
  (splits, ledger events, tiers, org nodes, votes) live there too.
- **Token names.** The mockups' short tokens are the repo's `--color-*` tokens. Rename on port:

  | mockup | repo | mockup | repo |
  |---|---|---|---|
  | `--paper` | `--color-paper` | `--ink`, `--ink-70/50/28/13` | `--color-ink`, `--color-ink-70/50/28/13` |
  | `--paper-2` | `--color-paper-2` | `--ground` | `--color-ink-ground` |
  | `--live` | `--color-live` | `--settled` `--underway` `--absent` | `--color-settled` … |
  | `--sig-deep` `--sig-light` | `--color-signal-deep` `--color-signal-light` | `--f-display/text/mono` | `--font-display/text/mono` |
  | `--s1`…`--s6` | `--spacing-1`…`--spacing-6` | `--inset` `--max` `--sec` `--ease` | same names (on `:root`) |

  `.band-ink` rebinds the `--color-*` tokens exactly as the mockup's `.band-ink` does. Never
  hard-code a hex that a token covers. The app canvases (`.app`) keep their own `--a-*` tokens.
- **CSS placement.**
  - Shared system: `app/styles/system.css` (imported by `app/layout.tsx` after `globals.css`).
  - Page CSS: `app/<route>/page.css`, imported by that `page.tsx`, with **every rule nested under
    `.pg-<route>`** (native nesting, e.g. `.pg-shops { .calc { … } @media (…) { … } }`). App
    Router keeps a route's CSS loaded after you navigate away, so unscoped page rules leak.
  - The page root is `<div className="pg-<route>">` inside `<main>`.
  - Do not reuse names the old system still owns globally (`.hx-*`, `.ledger*`, `.tally*`,
    `.versus*`, `.door*`, `.side*`, `.stat*`, `.tiles`, `.crit` outside your scope). Inside
    `.pg-*` nesting this is safe, but check computed styles.
  - Avoid class names that are exact Tailwind utilities (`hidden`, `block`, `grid`, `flex`,
    `table`, `border`, `shadow`, `blur`, `grow`, `container`, `fixed`, `sticky`, …). Tailwind
    generates them if they appear in source.
- **Motion.** `gsap@3.12.5` + ScrollTrigger via `@/lib/anim` only. Every effect cleans up
  (`useGsap` = `gsap.context` + `revert`). With JS off or reduced motion, the server-rendered
  markup **is** the end state: final figures, filled bars, reached rail steps, the join form's
  real fields, the co-op vote showing its result. Animations go *from* a start state *to* what
  the markup already shows. Only `transform`/`opacity`/`clip` animate, so nothing shifts layout.
- **Numbers.** Format with `@/lib/format` (`money`, `int`). Never `toLocaleString`/`Intl` in
  anything rendered on both server and client (hydration mismatch, proven on /join).
- **Accessibility.** Decorative SVG `aria-hidden`. Informational drawings get a text
  alternative in the DOM. Toggles: `aria-pressed`. Tabs: `role="tab"` + `aria-selected`.
  Every field has a label. Focus rings stay visible.
- **Do not touch** `components/layout/Header.tsx`, `NavMenu.tsx`, `MobileNav.tsx`, `NavLink.tsx`,
  `NavIcon.tsx`. Do not port the mockups' header, sheet, footer, `.mock-flag` or CDN tags.
- **Do not edit `PLAN.md` or `components/system/*` / `lib/anim/*`.** If a shared piece is
  missing something, add a page-local version and say so in your report; the lead folds it back.

## Phase 1: shared system (lead)

All in `components/system/` (import from `@/components/system`) and `lib/anim/`.

| Piece | Props / API | Renders |
|---|---|---|
| `Section` | `id?`, `ink?`, `className?`, `style?`, `children` | `<section class="sec [band-ink]"><div class="wrap">` |
| `SectionHead` | `n`, `label`, `title: ReactNode`, `line?`, `more?: {href,label}`, `links?: {href,label}[]`, `aside?: ReactNode` (replaces line/more), `className?` | `.head` with `.sec-label` (number cobalt), `.h2`, `.aside` (7/5 grid, stacks < 900px) |
| `More` | `href`, `children` | `.more` link with the arrow |
| `Close` | `title`, `line`, `actions: {primary, ghost}`, `label?: {n,text}` | the `.sec.close` block |
| `PageHero` | `label?: {kicker,title}`, `lines: string[]`, `size` (desktop CSS font-size, e.g. `'min(7.9vw, 110px)'`), `phoneSize`, `phone?: 'wrap'\|'block'\|'set'`, `balance?`, `tracking?`, `lede?`, `actions?: ReactNode`, `facts?: {k,v,live?}[]`, `figs?`, `home?`, `afterRow?`, `children` | `.hero(.phero)`. h1 lines are `.ln` spans, words pre-split into `.w > span` on the server. Runs the intro (below). |
| `Bento` | `as?`, `className?`, `id?`, `cols?: 2\|3\|4`, `rows?: number` (subgrid), `stack?: 680\|760\|860\|900\|980`, `style?` | `.bx` (`--line`, `--px`, border, `.bx + .bx` seam) |
| `Cell` | `head?`, `foot?`, `className?`, `headClass?`, `mainClass?`, `footClass?`, `children` (main) | `.cell > .c-h / .c-m / .c-f` |
| `Rail` (client) | `className?`, `id?`, `vertical: 640\|760\|860`, `start?='top 78%'`, `end?='bottom 60%'`, `children` | `.bx.rail` + `.rail-fill`; scrubs the fill, toggles `.reached` on each direct child holding a `.knob` as the fill passes the knob's centre. Fires `rail:progress` (`detail.p`) on itself. |
| `Knob` | `live?` | `<span class="knob">` centred in its column (vertical: on the wall) |
| `Chip` | `tone?: 'live'\|'underway'\|'absent'`, `children` | existing `Chip` (moved/re-exported) |
| `Fig` | `as?`, `live?`, `className?`, `children` | `<span class="fig">` |
| `Seg` (client) | `label`, `options: {value,label}[]`, `value`, `onChange` | pill segmented toggle, `aria-pressed` |
| `Device` (client) | `id?`, `className?`, `trace?: 'hero'` | `.device` outline; `trace="hero"` loops light round it after the hero intro |
| `Screen` | `w`, `h`, `variant?: 'desk'\|'phone'`, `className?`, `canvasClassName?`, `children` | `.screen` + `.canvas.app` at its real size, scaled to fit **in CSS** (`container-type` + `tan(atan2(100cqw, w))`), so it works with JS off and never shifts |
| icons | `Arrow`, `Check`, `Back`, `Bell`, `Plus`, `Del`, `Mark` | the mockups' `<symbol>`s as components (`aria-hidden`) |
| `Qr` | `id?`, `className?`, `seed?=7` | the mockups' seeded decorative QR, rendered on the server |

`lib/anim`:

- `gsap`, `ScrollTrigger` (registered once), `motionOK()`.
- `useGsap(ref, setup, deps)`: runs `setup` inside `gsap.context(…, ref)` in a layout effect,
  reverts on cleanup, and does nothing under reduced motion.
- `useInView(ref, onEnter, {start='top 70%', once=true})`, `useActive(ref, onToggle, {start,end})`,
  `useScrub(ref, onUpdate(p), {start, end, scrub=.4})`.
- `useAfterHero(ref, cb)`: run `cb` once the hero intro has finished (traces, key-ins).
  `useHeroIntro(ref, (tl, hero) => …)`: append beats to the intro timeline from a component
  rendered inside the hero.
- `useRail(ref, {vertical, start, end, onProgress})`: the rail logic without the component.
- `rr(x,y,w,h,r,start)` and `useTrace(hostRef, build(w,h,host), {seg, speed})` returning
  `{ run(opts), kill() }`: the mockups' `makeTrace` (halo + core, rebuilt on resize, uses the
  global `#glow` filter rendered in the layout).
- Hero intro (inside `PageHero`): words rise (`yPercent 105`, stagger .06; home .07, then
  `.revealed` drops the mask) → `[data-in]` → `[data-stage]` (`="device"`: y 24, 1s;
  `="bento"`: y 20, .9s) → `[data-a]` → `[data-grow]` (scaleX). Page-specific follow-ups listen
  on the hero element: `hero:intro` (`detail.tl`, append to the timeline) and `hero:done`.
  First paint is pre-hidden by a tiny inline script (`html.motion`), with a 3s fail-safe.
- `HeaderInk` (in the layout): makes the header sticky and toggles `.on-ink` while a `.band-ink`
  is under it, and `.scrolled` after 8px. Header components are untouched.
- `lib/format`: `money(n, dp=2)`, `int(n)`.

Canvas sizes measured from the mockups (use these `h` values): home desk 1200×1140, home phone
390×860; shops desk 1200×728, phone 390×690, counter 760×480 / narrow 400×526; housing desk
1200×766, phone 390×820. The home hero (`app/page.tsx`, `app/_home/MemberHome.tsx`,
`app/page.css`) is the worked example of PageHero + Device + Screen + page CSS.

Footer: restyled to the mockup's `.foot` (five columns, mono headings), same links, legal block
unchanged.

## Phase 2: pages

Each page: `app/<route>/page.tsx` (server) + `app/<route>/page.css` + page-local client
components in `app/<route>/_parts/` (or `components/<route>/`). The hero h1 sizes below are the
mockup's `.phero .hero-h1` values.

### Worker A

**Home `/`** (`content/home.ts`: keep `HERO.lede`, it feeds metadata and the OG image)
- Hero: `home`, lines `Your money, kept` / `in the neighborhood.`, size `min(9.4vw,132px)`,
  phone `clamp(46px,13.4vw,72px)` wrap. Facts (3). Stage: `Device trace="hero"` with
  `Screen w=1200` (desk) + `Screen w=390 h=860` (phone). Member Home as real UI: balance header
  (56px rows), the two-row cycle card, activate slot, the four-block slab. **Phone canvas has no
  action buttons under the balance** (the desk `.acts` stay). `data-a` / `data-grow` as mockup.
- 01 `#gap` ink: renting vs Clear `.cmp`, 60 bars per column built finished, `useScrub`
  ('top 72%' → 'bottom 72%') pays months in. Label "Illustration, not a quote."
- 02 `#path`: Renter/Owner/Earner on subgrid with centred knobs → `Rail` (vertical 760) or the
  same logic via `useRail`; credits count to 15,000, ladder fills.
- 03 `#counter`: the two-column hand-off (`.duo3`): shop states, QR (seeded generator), clock,
  your states, split picker, hand-off/hand-back traces. Must work stacked on mobile (wait for
  `youSeen`). Reduced motion: rest mid-flow with your turn open (mockup's `!G` branch).
  `.kfigs` + "Sample charge · the figures are the real terms".
- 04 `#status`: rows; member app and merchant counter app chips **green, "Invite-only"**;
  protocol "In build"; partners "Signing"; homes "Not yet".
- 05 `#ledger` ink: streaming ledger in the `.led` bento, "Sample entries, streaming";
  your approved plan is prepended as "You, just now".
- Close.

**How it works `/how`** (`content/how.ts`; `SplitChooser` logic kept, restyled)
- Hero: size `min(8.2vw,114px)`, phone `clamp(42px,12vw,64px)` wrap + balance; `.jump` nav.
- 01 `#draw` draw order: tier fill + range; "Bonds and pool shares" on one line, columns sized
  so the labels align (min track for the small tier). Animates to 2,800 on arrival.
- 02 `#plans` term plans `.tg`: full-width open plan with its payment schedule, two locked
  rungs, clear-a-cycle / clear-early / reset logic from the mockup.
- 03 `#split`: `SplitChooser` restyled to `.split` (opts, segs, ledger2, big total).
- 04 `#savings` ink: stats4, gate with the **three-segment** bar (scrubbed), sides, nots.
- 05 `#cycle`: the four-state cycle card with the border-carried state + trace, auto-steps.
- 06 `#compare`: `.vs` + honest rows. Close.

**For shops `/shops`** (`content/shops.ts`; `MerchantCalculator` replaced)
- Hero: size `min(7.9vw,110px)`, phone `clamp(42px,11.6vw,64px)` balance. Counter app canvas
  (desk 1200 / phone 390) with keyIn of $940 after the intro.
- 01 `#difference` ink: fee calculator, 6% vs 2.5%, kept per year = (theirs − ours) × 12.
- 02 `#counter`: step buttons (`role=tab`, `aria-selected`) driving the tablet canvas; narrow
  400×526 canvas when the screen's column is under 560px (wide 760×480).
- 03 `#fit`: two columns on subgrid. 04 `#founding` ink: perks + two cells.
- 05 `#money`: the money track with centred knobs (`Rail`, day 30 knob cobalt) and the
  **flat ruled refund component** with its hand-back trace. 06 Membership (close with label).

**Housing `/housing`** (`content/housing.ts`)
- Hero: size `min(6.9vw,96px)`, phone `clamp(40px,11vw,60px)` balance. Savings screen: home
  path with the five-protection ladder, "what you hold", protections.
- 01 `#split` land/house plats. 02 `#numbers` ink: bars grow on arrival.
- 03 `#monthly`: slider $500–1,500; "All in, including utilities" = $2,000 + contribution
  (**$2,500 → $3,500**); comparison is **"A comparable single-family mortgage" $4,500–5,500**;
  **no divider above the equity contribution line**; five years bars.
- 04 `#homes`: site plans ported as static SVG components (keep drafting classes and zone
  highlighting; auto-walks the three zones until pointed at).
- 05 `#backyards` ink. 06 `#gate`: five-node ladder `Rail`, credits count to 15,000. Close.

### Worker B

**Contribute land `/contribute`** (`content/contribute.ts`)
- Hero: **three** set lines, size `min(8.4vw,116px)`, phone `clamp(30px,8.6vw,58px)` set
  (`nowrap`, tracking −0.045em). Facts. Offer bento (`data-stage="bento"`): selling vs
  contributing, solid bar vs hatched tax bar, the shares bar.
- 01 `#how` ink: four §721 steps on a `Rail` (vertical 640). Each step: headline, one short
  sentence, three ruled rows whose values fade in as the rail reaches the step.
- 02 `#downsides`: ruled table. 03 `#who`: three cells, paragraphs ≤ 3 lines from 1100px up.
- 04 `#held` ink: two cells, then the 84-month strip with right-hand counters and an axis
  aligned to the strip, scrubbed.

**Clear Capital `/capital`** (`content/capital.ts`)
- Hero: size `min(7.6vw,104px)`, phone `clamp(28px,7.8vw,58px)` set. The **"Nothing on this
  page is an offer…" disclaimer in the hero, in full**. Two-board bento: co-op board seven
  member seats; holdings board seven seats in order: directly elected chair, two co-op reserved,
  neutral seat named jointly, open (free) seat, two investor seats in cobalt (trace on the
  investor seat). **No terms, rate, yield or projected return anywhere.**
- 01 `#split` ink: three-holder drawings on one ground line (draw-in), "Two balance sheets"
  edges ledger.
- 02 `#contributions`: `Seg` One duplex / A portfolio; tweens property value and shares,
  moves the pool bar; pool slices switch to their short label when the full one does not fit
  (**measure the slice, no breakpoint**; a slice may grow to fit the short label); term rows
  flash "Same". Flips once on its own when first seen.
- 03 `#protections` ink: 2×2 (no-preferred-return waterfall bar, reserved matters lighting in
  turn, share-class rows, streaming public ledger). 04 `#downsides` + corridor row.
- 05 `#next` ink: publish vs will-not-publish with redaction sweeps.

**The co-op `/coop`** (`content/coop.ts`)
- Hero: size `min(6.1vw,84px)`, phone `clamp(36px,10.4vw,56px)` block. "We never sell the
  land." put to the same 4–3 vote in both cells on a loop while in view; policy version struck,
  reserved-matter version blocked. JS off / reduced: final result.
- 01 `#structure` ink: **extend `components/marks/StructureDiagram.tsx`**: keep constants-derived
  coordinates, dashed foundation only, dotted labelled contract line, ClearLabs last, portrait
  spine < 860px, text alternative in the DOM. Add draw-in on scroll, hover/tap to light the line
  of ownership to the root with the detail row, and the `Seg` Ownership / Balance sheets toggle
  (money solid, housing cobalt hatch, "never touch" seam between Clear Lending and Clear
  Properties).
- 02 `#governance`: balances vs votes rows, councils, `Seg`-style 6/9/12/15 board sizes with
  one third delegated, five reserved matters row.
- 03 `#protocol` ink: fork drawing (wide + narrow). 04 `#who`: 2017 with three rows (credit
  waterfall **"Built"**, entity structure "Designed", protocol "Open source"), two corridor
  maps, hiring bento.

**Join `/join`** (`content/join.ts`; rebuild `components/interactive/JoinForm.tsx`)
- Hero: size `min(7.8vw,108px)`, phone `clamp(44px,13vw,72px)` block. Facts (figs).
- Form bento: four modes as the header row (`role=tablist`, arrow keys, sliding cobalt bar),
  `?as=` selects the mode. Name and email lead; narrow fields pair, a lone narrow field takes
  the row. Dropdowns = `FieldSelect` restyled (button + listbox + hidden input, underline field,
  floating menu, never a native select). Ranges = `FieldRange`/`FieldRangeDual` restyled with
  the mockup's formats (`$5,000+`, `$2M+`, `200+`, compact `$400K` via plain arithmetic).
- Side panel: what happens next, the caveat (member: "Joining the waitlist is not an
  application and does not affect your credit." verbatim), "Your answers" progress bar.
- Submit: **keep the existing endpoint logic and rule**: POST to `NEXT_PUBLIC_JOIN_ENDPOINT`,
  confirmation only after a 2xx, otherwise the existing error string and "nothing was stored".
  Confirmation repeats back what was sent; below 1000px scroll it into view. No mockup
  simulated submit, no "Preview of the confirmed state" note.

## Content files

Every page's content file is rewritten to the mockup's copy, section by section. Suggested
export shape: one object per section (`HERO`, then one per numbered section, `CLOSE`), each with
`n`, `label`, `title`, `line`, `more`, plus that section's data. Exports that no longer have a
consumer are removed. Comments that describe old copy are rewritten or removed. Workers report
the copy changes per file in their final message; the lead consolidates them in the PR.

Known fixed strings that must survive unchanged: the footer legal block; the /capital hero
disclaimer (full text, from `content/capital.ts`) and no figures for terms/rate/yield/return; the
/join member caveat; every "illustrative"/"sample" label exactly as the mockup gives it.

## Phase 3: integrate and QA (lead)

Merge, fold duplicated helpers into `components/system` / `lib/anim`, `npm run typecheck`,
`lint`, `build` clean. Playwright at 360/390/900/1280/1440 for all eight routes: console and
page errors, `scrollWidth > clientWidth`, hero h1 = 2 lines from 700px (3 on /contribute), one
cobalt accent per view, spot-check against the mockups. Non-redesigned routes still render.
Remove dead CSS/components (old `.hx-*` pieces once nothing uses them, `lib/motion.ts`,
`MerchantCalculator`, …) after searching. PR from `redesign`.
