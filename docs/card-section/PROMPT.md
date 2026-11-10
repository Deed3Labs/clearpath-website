# Clear homepage: the Clear Card scroll section

Paste everything below the line into Claude Code, run from the root of the `clearpath-website` repo. Before you start, copy this whole folder (`PROMPT.md`, `reference/`, `screens/`) into the repo at `docs/card-section/`.

---

## The job

On the useclear.org homepage, **replace the member-app screenshot under the hero with the Clear Card section**: a 3D wooden card that pins under the header and builds itself as you scroll. Its four pieces (back, core, chip, face) come together, the card turns its edge to you, rises to face you, then turns over to show its back. Scrolling up runs it in reverse. Then **move the member-app screen into the "What exists today, plainly" status section**, as a smaller phone screen beside the status rows.

Nothing else on the homepage changes: hero copy, header, the mobile full-screen menu, and the other sections all stay exactly as they are.

The reference has already been designed and signed off. Port it; don't redesign it.

## Reference files (in `docs/card-section/`)

| File | What it is |
|---|---|
| `reference/card-section.html` | **The source of truth.** The card section running on its own: tokens, CSS, markup, the scroll controller and the three.js scene. Serve the folder over http (`npx serve docs/card-section/reference`) and open it. Textures don't load from `file://`. |
| `reference/card/` | The 13 assets: face/back textures per edition, bump maps, core textures, and `fallback.webp`. Copy them as they are. |
| `reference/home-mockup-v20.html` | The full homepage mockup, for context only. Use it for where the section sits, and for the status-section change with the member-app phone screen (search for `status-grid` and `shot`). Don't port anything else from it; the live site's existing sections win. |
| `screens/desktop-*.png`, `screens/phone-*.png` | Visual targets at 1440×900 and 390×844, one per stage: 1 open, 2 chip seated, 3 edge, 3b front, 4 back. |

## Work in phases. Use at most 2 agents.

### Phase 1: Explore, then report before editing
Find out and tell me, in a short list:
1. The framework and how pages and components are built (Next, Astro, plain HTML, …), and where the homepage lives.
2. Whether GSAP and ScrollTrigger are already on the site, and how they're loaded (npm or CDN), plus any version.
3. Where the design tokens live (colours, `--f-*` fonts, spacing `--s1…--s6`, `--inset`, `--max`, `--ease`), and whether they match the `:root` block at the top of `card-section.html`.
4. The header's height and how it's sticky. The pin starts at the header's bottom edge.
5. Where the hero's product screenshot and the status section are in the homepage code.
6. Any existing ScrollTriggers on the homepage, and the order they're created in.

Then stop and wait for me to say go.

### Phase 2: Port the section
- **Dependencies.** Add `three@0.160.0` from npm, and GSAP 3.12.x with ScrollTrigger if it isn't already there. Use package imports, not CDN script tags. The reference uses CDN tags only so that it runs standalone.
- **Assets.** Copy `reference/card/*` to `public/card/`. Keep the filenames, because the scene loads them as `card/<name>`, so adjust the base path to the site's asset path.
- **Structure.** Split it into:
  - the section markup and CSS (a component in the site's style),
  - a small **scroll controller**, which is the "Page side of the card" script in the reference,
  - the **3D scene module**, which is the `<script type="module">` in the reference.

  The two talk only through the shared state object `window.clearCard = { p, ed, setEdition }`. Keep that contract, or swap it for an equivalent store, but keep the split: the controller owns scroll, and the scene only reads `p` and draws.
- **Client-only, loaded lazily.** three.js must never run on the server. Load the scene module with a dynamic `import()` when the section is within about 600px of the viewport (IntersectionObserver), so the hero isn't held up by three.js or the textures. Create the pin itself immediately, because it doesn't depend on three.js.
- **Pin order.** The pin is created with `refreshPriority: 1`. If other homepage ScrollTriggers are created first, call `ScrollTrigger.refresh()` after the pin exists, and confirm that the section 01 bar chart, the 02 path rail, the 03 counter flow and the header's ink-band colour switch still fire at the right places.
- **Copy markup and CSS as they are**, including class names unless they clash. If they clash, prefix with `card-`. Map the reference's tokens to the site's tokens. If a token is missing, add it with the reference value.

### Phase 3: Move the member-app screen into the status section
In `home-mockup-v20.html`, look at `#status`:
- The status rows and the phone screen sit in a two-column grid: rows on the left, the phone at `clamp(280px, 25vw, 340px)` on the right.
- Below 900px they stack, and the phone is centered at up to 400px wide.
- The phone canvas is cropped:
  - `data-h="600"` on desktop and `data-hm="760"` at 900px and below, read by the mockup's `fit()` scaler. If the live site has no scaler, port that function too.
  - A mask fades out the bottom 22%.
- The member-app's assemble-in animation and the light running around the device outline now start when the phone scrolls into view (`ScrollTrigger` on `#shot`, `once: true`), not in the hero timeline.
- Remove the hero's old stage, `#stagebox`, and its timeline steps.

### Phase 4: QA. Report results; don't just claim them.
Check at **390×844, 768×1024, 1030×800, 1440×900, 1280×1000**, plus a short desktop at 1440×640:
- [ ] Each stage matches `screens/` (open, chip seated, edge with the 2.5 mm callout, front, back).
- [ ] Scrolling up runs the sequence in reverse; the pin releases cleanly into section 01 with no jump.
- [ ] **No horizontal scroll at any width**, before, during or after the pin. Check `document.documentElement.scrollWidth === clientWidth`, and swipe sideways on a real phone.
- [ ] Desktop: the card and the copy share one center line, and the stage stops growing past 720px tall.
- [ ] Clicking a step scrolls smoothly to that point; the counter reads 01–04; the Scroll cue fades once you start.
- [ ] The Light, Dark and Contrast editions swap textures, and the card gives a small spin and a sheen.
- [ ] `prefers-reduced-motion`: no pin, the card rests assembled, steps can still be clicked, no springs or effects.
- [ ] WebGL off, or three.js failing to load: `fallback.webp` shows after 9 seconds at the latest and the page still works.
- [ ] Performance: Lighthouse on the homepage, mobile. The hero's Largest Contentful Paint must not get worse than before this change. three.js and the textures load only as the section comes into view.
- [ ] The sticky header, the mobile full-screen menu and every other homepage section look and behave as before.

## How the section behaves (the spec)

Most of this is already implemented in the reference. It's written out here so that you can check your port against intent, not just pixels.

**Scroll.** Pinned from the header's bottom edge for `2.2 × viewport height`. Progress `p` runs from 0 to 1.

| p | What happens | Step |
|---|---|---|
| 0 – .06 | Stack open: back, core, chip and face float apart, breathing slightly | 01 Three sheets of birch |
| .06 – .42 | They come together: the core lands, then the chip seats (its coil flashes gold at p .30), then the face closes. Each lands with a small bounce. | 02 from p .20 |
| ≈ .42 | The face seals: the card dips, a warm pulse runs out from the chip through the engraved rings, and a sheen passes across the wood | |
| .40 – .51 | It tips toward you so the long edge faces you; the camera moves in; the "Three layers · 2.5 mm" callout appears | 03 from p .40 |
| .57 – .70 | It rises to face you | |
| .74 – .94 | It turns over to the back in an arc, toward you and over; a sheen plays when the back arrives (p .93) | 04 from p .74 |

**Motion feel.** Scroll only sets targets. Every value follows its target on a damped spring, stepped at a fixed 240 Hz so it behaves the same at any frame rate. The constants are in `SP` in the scene module; keep them. Sheets can't pass through each other: they stop and bounce at 22% of their speed. The mouse adds a slight parallax on desktop.

**Drawing.** Dashed guide lines at the four outer corners, drawn only in the gaps between sheets, fading as the stack closes. There is only one callout, the 2.5 mm one on the edge view. Earlier per-layer and chip callouts were removed on purpose because they collided with the card, so don't add them back.

**Layout.**
- Desktop (above 1000px): columns 7fr / 5fr, the stage capped at 720px tall and vertically centered.
- 1000px and below: the card on top. Under it, a four-part progress rule and one step at a time. The intro heading and paragraph are hidden. Under 620px the open stack is framed tighter (see `narrow()` in the scene).

**Effects are in the shader.** The sheen and the ring pulse are injected into the two engraved materials with `onBeforeCompile` (`uSheen`, `uPulse`, `uChip`). The pulse is masked by the bump map, so only the engraved lines glow.

**Geometry is real.** It's built from the Rev C numbers: ISO card 85.6 × 53.98 mm, corner radius 3.18 mm, three 0.8 mm sheets, 0.05 mm bond film, a 27.2 mm chip pocket whose edge sits 3 mm in from the right edge, and a 27 mm chip. Keep these numbers.

## Things to flag, not fix
- The step 01 copy says the colour comes "from dye, not paint". The card build plan still lists dye soaking through the edges as an open risk, so ask me before launch whether that line stands.
- The chip is drawn as a dark disc with gold coil rings. That's a stand-in, not a photo-accurate Arx HaLo chip.
- The textures are JPGs at 2048px, about 1 MB per edition. Only Light loads up front; Dark and Contrast load when picked. If Lighthouse complains, propose KTX2/Basis or 1536px textures. Don't change them silently.
