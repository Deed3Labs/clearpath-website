# Clear homepage: add the Clear Card section

Copy this folder into the `clearpath-website` repo at `docs/card-section/`, then paste everything below the line into Claude Code.

---

The homepage redesign is already live in this repo. Make one change to it: **swap the member-app screenshot under the hero for the Clear Card section**, and **move that app screen into the "What exists today, plainly" status section**. Nothing else on the page changes.

Everything is in `docs/card-section/`:
- `reference/card-section.html` is the card section working on its own. Port it as it is: the markup, the CSS, the scroll script and the three.js module. Run it with `npx serve docs/card-section/reference`; it won't work from `file://`.
- `reference/card/` holds the 13 assets. Copy them to `public/card/`.
- `reference/home-mockup-v27.html` is the full homepage with both changes in place. It shows where the card section sits, and what the status section looks like with the phone screen (`status-grid`, `#shot`).
- `screens/` holds the target screenshots at 1440×900 and 390×844.

## Do
1. **Card section.** Replace the hero's `.stage` / `#stagebox` (the member-app device) and its steps in the hero timeline with the card section, placed right after the hero.
   - Use the site's existing GSAP and ScrollTrigger.
   - Add `three@0.160.0` from npm instead of the CDN import map.
   - Load the three.js module with a dynamic `import()` when the section is about 600px from the viewport.
   - Create the pin straight away; it doesn't need three.js.
   - Keep the two halves talking through `window.clearCard` (`p`, `ed`, `chipOn`, `setEdition`, `setChip`). The pin runs 2.8 screens: steps 01–04 use the first 80% of the scroll, and step 05 (the card tapping a door reader) uses the rest.
2. **Status section.** Move the member-app phone screen beside the status rows, as in the mockup.
   - Crop the screen to `data-h="600"`, or `data-hm="760"` at 900px and below.
   - Its assemble-in animation and the light running around its outline now start when it scrolls into view.
3. **ScrollTrigger order.** The pin uses `refreshPriority: 1`. Afterwards, check that the 01 bars, the 02 path rail, the 03 counter flow and the header's ink-band switch still fire in the right places.

## Check, and tell me what you found
At 390, 768, 1030×800 and 1440×900:
- [ ] Each stage matches `screens/`, and scrolling up runs it in reverse.
- [ ] The pin releases into section 01 without a jump.
- [ ] No horizontal scroll at any width, before, during or after the pin.
- [ ] The step buttons, the 01–05 counter, the editions, and the chip switch with its on/off light.
- [ ] Step 05: the reader slides in and the card taps it. The light goes green with the chip on, and red (the card shakes) with it off.
- [ ] Reduced motion: no pin, the card rests assembled, the steps still work.
- [ ] WebGL off: `fallback.webp` shows.
- [ ] Mobile Lighthouse: the hero's Largest Contentful Paint is no worse than before.

## Don't change without asking me
- **The copy.** These lines are product claims I still need to confirm:
  - "Stained, never painted"
  - "[Your key is] made in the chip and never leaves. Nothing to skim. Nothing to copy."
  - "Sealed against rain and spills"
  - "One tap in the app. We'll send a new one."
  - "Soon: co-work doors, partner discounts, and more." Keep the "Soon" until it's real.
- **The motion numbers** (springs, timings, card geometry) are tuned. Port them as they are.
- **The textures** (about 1 MB per edition) stay as they are unless Lighthouse flags them. If it does, propose a fix before making it.
