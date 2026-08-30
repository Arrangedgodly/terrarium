# Ultron Impeccable — Refinement Queue

Phase: ultron-impeccable (approval mode) · Source critique: `.impeccable/critique/2026-08-30T05-15-38Z__index-html.md` (29/40, first run for `index-html`)

> Critique run note: the orchestrator's session exposed no sub-agent tool, so Assessments A and B ran sequentially in one context under the isolation protocol with the degraded banner shown — the fallback ultron-impeccable permits, recorded here.

## User decisions (critique closing gates)

- Start: both P1s together.
- Specimen: bolder + witnessed growth (grow-in animation included).
- Scope: all 5 issues.
- Constraints: generator is fair game (trait thresholds and plant weight may change; mobile DOM may be reordered).

## Checklist

| # | Command | Critique finding | Status |
|---|---------|------------------|--------|
| 1 | `$impeccable bolder` | [P1] Specimen underwhelms — stems taper below 1px, leaves ~16 model px; "balanced" plants read as sparse saplings; the grow click lands flat. User chose bolder weight + richer per-environment palettes (animation is entry 3). | done (approved by user) |
| 2 | `$impeccable clarify` | [P1] Report contradicts pixels — text claims "balanced branching / medium leaf density" beside a sparse sapling. Recalibrate trait thresholds in `src/generator.ts` against rendered geometry; tick-meter readouts if needed. | done (approved by user) |
| 3 | `$impeccable animate` | Witnessed growth (user-selected extension of finding 1) — ~600ms grow-in moment, reduced-motion safe, honoring the reduced-motion kill switch. | done (approved by user) |
| 4 | `$impeccable layout` | [P2] Desktop ~500px dead column under the rail + ragged bottom; mobile plant reading sits below the fold so post-grow updates go unseen. Mobile reorder approved. | done (approved by user) |
| 5 | `$impeccable typeset` | [P2] 12 elements below the 11px floor — the 0.68rem mono voice renders 10.88px, environment line 11.2px, range hints ~9.3px. Raise mono floor to 0.70–0.72rem, environment line to 0.76rem, re-check hints. | done (approved by user) |
| 6 | `$impeccable polish` | [P2] No in-session variation memory — session-only ghost strip of last 3 specimens + visible seed readout (`SPECIMEN / #5EED1234`); doubles as the final pass over the whole queue. | done (approved by user) |

## Entry log

_Outcomes and evidence are appended per entry as workers complete them; `done` is recorded only after user approval (approval mode)._

### Entry 1 — `$impeccable bolder` (done — approved by user; outcome recorded)

**Critique target.** Priority Issue 1 [P1]: "The specimen underwhelms — the peak moment lands flat" (stems tapering below 1px, ~16 model-px leaves, "balanced" plants reading as sparse saplings). User direction: bolder weight + richer per-environment palettes; animation excluded (entry 3), trait labels excluded (entry 2).

**What changed**

- `src/generator.ts` — visual weight and palette richness:
  - Trunk start width `max(2.4, scale*0.016)` → `max(4, scale*0.028)` (10.2 → 17.9 model px at 640); taper `(0.68 − depth*0.025)` floored at 0.7 → `(0.74 − depth*0.018)` floored at 1.5 — no mature tip below 1.5 model px (default tips ≈ 2.0).
  - Base leaf size `scale*(0.018 + humidity*0.013)` → `scale*(0.03 + humidity*0.02)` (≈1.6× presence), with new internal leaves along depth ≥ 1 branches (55% chance, 0.72 size factor) so the canopy fills the mid-plant instead of clustering at tips only.
  - Structure: root length `0.18 + sun*0.32` → `0.08 + sun*0.2` and decay `0.62 + …` → `0.7 + …` so the first fork sits low and the crown occupies the middle of the aperture (leaf pixels measured in canvas bands 30–60% vs. 0–40% before); branch spread `0.24 + hum*0.38` → `0.28 + hum*0.4`.
  - New `Leaf.bud`: sun-fed fruit points (chance `0.1 + sun*0.28`; default ≈ 13 of 49 tips) rendered as accent-colored dots.
  - `createPalette` enriched: stem hue 28–62 / sat 34–48 / light 36–43 (dry = warm woody, wet = cool green); leaf hue ≈ 35–137 by acidity (acid = chartreuse-gold, alkaline = deep green), sat 46–56 by humidity, light 44–52 by sunlight; accent hue 16–62 / sat 72–82 / light 61–68 by sunlight (dim = ember, full = gold); seed hue shift widened ±4 → ±7.
- `src/plant-canvas.ts` — rendering conviction: stroke floor `max(0.8, w)` → exported `getStrokeWidth` with a 1.5 CSS px floor; stem alpha floor 0.56 → 0.70; leaf fill alpha 0.66–0.94 → 0.74–0.95 and accent edge stroke `max(0.65, 0.9·scale)` @ 0.7 → `max(1.2, 1.5·scale)` @ 0.85; bud leaves drawn as accent dots (radius `max(2.2, size*0.32)`); specimen glow strengthened (root glow 0.16 → 0.2 alpha, new warm accent canopy glow at 0.1, ground-ring stroke 1px/0.4 → 1.25px/0.5).
- `src/generator.test.ts` — new intended-behavior assertions: ≥1.5 width floor on all segments across the endpoint sweep, trunk ≥ 12 with true taper, leaf presence (average ≥ 20 / largest ≥ 26 default; ≥ 12 / ≥ 18 dry), buds exist / grow with sunlight / stay a minority, palette richness (accent sat ≥ 70 and above leaf sat everywhere; hue spans ≥ 25° stem-humidity, ≥ 30° accent-sun, ≥ 60° leaf-acidity).
- `src/plant-canvas.test.ts` — `getStrokeWidth` floor (1.5px at mobile and desktop scales) and scaling tests.
- `DESIGN.md` — Specimen Saturation Rule's documented ranges updated to the new `createPalette` ranges (code stays canonical). `.impeccable/design.json` cites no numeric ranges; frontmatter chrome tokens untouched.

**Evidence**

- Screenshots (14): `docs/ultron/evidence/bolder/01–09-desktop-*.png` (1440×900 full-page: default grow + humidity 0/100, sun 0/24 h, pH 3/9, gravity 0.2/2), `10–12-mobile-*.png` (390×844: default, wet/bright/acid, dry/dark/heavy), `13–14-specimen-closeup-*.png` (element-level default and wet/bright/acid). Closeups confirm: 20–40 leaves distributed along branches (not tip-only), ~15–20 amber fruit dots, bold trunk with visible twigs, canopy filling the aperture's mid-band (pixel-measured: ~13k leaf-hue pixels, bands 30–60%).
- Gates: `corepack pnpm test` 17/17 green; `corepack pnpm typecheck` clean; `corepack pnpm build` clean.
- Detector (`detect.mjs --json` over the four changed TS files): 0 findings.
- Dev server (port 5193) stopped via TaskStop after evidence capture; port re-check refused connections.

**Handoff notes**

- Entry 2 (clarify): geometry shifts moved labels — default now reads "tall / balanced / lush" (leaf density crossed the 48 "lush" threshold; low-sun reads "short"); thresholds need recalibration against the fuller geometry as planned.
- Entry 3 (animate): renderer still paints in a single synchronous `drawPlant` pass; the new `getStrokeWidth` helper and per-leaf `bud` flag are animation-friendly extension points.
- Chrome (ink surfaces, hairlines, amber discipline, mono voice, `prefers-reduced-motion` kill switch) untouched; no new dependencies or remote assets.

### Entry 2 — `$impeccable clarify` (done — approved by user; outcome recorded)

**Critique target.** Priority Issue 2 [P1]: "The report contradicts the pixels" — trait words beside a plant that visibly is neither. Entry 1's bolder geometry had drifted the labels (default crossed the 48-leaf "lush" threshold). User direction: generator thresholds are fair game; keep the product contract's vocabulary; no geometry changes (entry 1 frozen), no new visual components (tick-meters out of scope).

**Calibration method.** Measured the generator's actual output across a 225-combo environment grid (humidity 0/25/55/80/100 × sun 0/6/12/18/24 h × pH 3/6.5/9 × gravity 0.2/1/2) × 40 seeds = 9,000 plants (deterministic given seed+environment): branch counts quantize to 31/63/125 with humidity; leaf counts cluster ~21–28 (dry) / 41–53 (default) / 89–103 (wet); height ratio tracks sunlight 0.21/0.36/0.53/0.73/0.835 (gravity modulates ±0.07); lean at gravity 2 droops the canopy 28.5° while the trunk-only measurement reported 20.6°. Thresholds were then placed in the empty gaps between those clusters, so every word is seed-stable.

**What changed**

- `src/generator.ts` — thresholds and the lean measurement only; no geometry:
  - Height bands: tall ≥ 0.56 → ≥ **0.68**, medium ≥ 0.34 (kept) — the sunlight slider now sweeps short (0–4 h) → medium (5–17 h) → tall (18–24 h) of the aperture.
  - Leaf-density bands: lush ≥ 48 → ≥ **72**, medium ≥ 24 → ≥ **34** — dry reads "light", default "medium", wet "lush"; the boundary sits between the 28-leaf dry maximum and the 41-leaf default minimum.
  - Branching bands 48/96 kept (already truthful: 31=sparse, 63=balanced, 125=dense).
  - `leanDegrees` now measures the posture the eye sees — the root→canopy-centroid angle over leaves + branch tips — instead of the first trunk segment; a header comment documents the anchor. Gravity 2 now reports 26–29° right (was 20.6°), matching the visible droop; default gravity reads 1–2° (upright).
- `src/terrarium-state.ts` — honest lean wording: "slight left lean (19°)" understated a visible lean; now "a lean of 19° to the left" in copy/fallback and "left (19°)" in the reading cell; upright renders "an upright posture (1°)" / "upright (1°)". Contract vocabulary (short/medium/tall, sparse/balanced/dense, light/medium/lush, left/upright/right) unchanged.
- `src/plant-canvas.ts` — canvas aria-label: "${density} leaves" → "${density} leaf density" (canvas/text equivalence kept exact; the label, the reading, and the canvas fallback all derive from the same traits).
- `src/generator.test.ts` — new "labels every plant truthfully across the environment space" contract: across 40 seeds each, default must read medium/balanced/medium/upright with the measured ratios inside the bands, and every extreme (humidity 0/100, sun 0/24, gravity 0.2/2, dry+dark combined) must earn its extreme word.
- `src/terrarium-state.test.ts` — default reading pinned ("Medium specimen", "balanced branching, medium leaf density, and an upright posture (N°)"); new case asserts a gravity-2 plant gets "a lean of N° to the right" and that "slight" never appears.

**Evidence** (`docs/ultron/evidence/clarify/`)

- `label-sweep.txt` — 9,000-plant sweep: label distribution across the space height 26.8/40.2/33.0%, branching 20/40/40, leaf density 20/40/40, lean 33.3/33.3/33.3 — all three words of every scale meaningfully represented; per-environment tables show each word set is single-valued (no seed flapping) with the geometry behind it.
- `01–07*.png` (1440×900 fullPage) + `screenshot-readings.json` — default + humidity 0/100, sun 0/24, gravity 2/0.2 with the report visible; each entry pairs the shown words with in-page canvas pixel measurements (alpha-filtered to plant tissue): default spans 58.9% of the aperture with 25.7k tissue px ("medium"); sun 0 spans 25.9% ("short"); sun 24 spans 88.4% touching the aperture top ("tall"); dry 13.3k px / wet 46.6k px at equal spans ("light"/"lush" beside balanced height); gravity shifts the tissue centroid −15.4%/+14.5% ("left (21°)"/"right (26°)").
- Gates: `corepack pnpm test` 19/19 green; `corepack pnpm typecheck` clean; `corepack pnpm build` clean. Detector (`detect.mjs --json` over `generator.ts`, `terrarium-state.ts`, `plant-canvas.ts`): 0 findings. Dev server (port 5194) stopped via TaskStop; port re-check refused connections.

**Notes for the queue**

- No DESIGN.md change required — the Plant Reading section documents structure, not trait words; `docs/ultron/product-contract.md`'s vocabulary is preserved verbatim.
- Entry 4 (layout): the verification pass re-confirmed the reading panel sits below the fold at 1440×900 (it took fullPage captures to show words+pixels together) — the mobile/desktop visibility finding stands for that entry.
- Entry 5 (typeset): trait dd values ("upright (1°)") are 0.82rem mono — inside that entry's scope, untouched here.

### Entry 3 — `$impeccable animate` (done — approved by user)

**Critique target.** The user-selected "Questions to Consider" extension of finding 1: witnessed growth — a ~600ms grow-in so the specimen develops before the user's eyes instead of appearing fully formed. Constraints: no geometry/palette changes (entry 1 frozen), no trait-label changes (entry 2 frozen), reduced-motion safe, restart-safe, bounded work, chrome motion untouched.

**Motion thesis.** One authored moment — the Grow press: the ground wakes, the trunk rises, branches extend outward depth-by-depth, leaves unfurl behind their branches, and sun-fed buds land as the finale. Quartic ease-out (fast start, settled arrival, no bounce). Deterministic `generatePlant` stays outside the loop; only the render phase animates, and the settled frame skips all animation math so the resting render stays identical to entry 1's approved pixels.

**What changed**

- `src/plant-canvas.ts` — the grow-in, hand-rolled on the existing canvas:
  - New exports: `GROWTH_DURATION_MS` (600), `prefersReducedMotion(view)` (asks `matchMedia('(prefers-reduced-motion: reduce)')` — the CSS kill switch cannot see canvas rAF loops), `easeGrow` (quartic ease-out), and staged-progress helpers `getGroundGrowth` / `getSegmentGrowth` / `getLeafGrowth` (normalized clock t ∈ [0,1]: ground 0→0.4; segment depth d starts at `0.02 + 0.54·d/(maxDepth+1)` with a 0.46 window so children begin while parents extend; leaves trail their branch depth 0.34→0.58 with a 0.4 window and a 0.35 rad unfurl rotation; buds 0.64→1.0 as the finale).
  - `drawPlant` gains a `growth = 1` parameter; `growth < 1` draws staged intermediates (segments interpolate their tip and ramp alpha 0.35→1; leaves scale, unfurl, and fade; buds grow from radius 0), while `growth >= 1` takes the exact pre-animation code path — rest state and reduced-motion renders are byte-identical to the static renderer.
  - `createPlantCanvasRenderer` gains `growPlant(plant)`: cancels any in-flight loop, sets the new plant, renders the empty first frame via `resize()` (datasets/aria update immediately to the final traits), then runs one bounded rAF loop on the elapsed clock. Rapid re-Grow or Reset restarts cleanly from the new seed; a hidden tab self-settles (next frame after visibility draws t=1 and stops); `destroy()` and every new grow cancel the loop; `ResizeObserver` resizes mid-grow re-render at the current progress (no final-plant flash, no restart). Reduced motion (or a detached canvas) renders the finished specimen immediately.
- `src/main.ts` — `renderNextPlant` calls `renderer.growPlant(nextPlant)` so Grow, Reset, and the recoverable-error path all share the animated/witnessed flow; initial page load keeps the immediate static render (no page-load choreography).
- `src/plant-canvas.test.ts` — +6 tests (27 total): duration pinned at 600ms; easing decelerates monotonically with no overshoot; every structure reaches exactly 1 at t=1 (rest identity, swept over the generator's real depth range 0–6); root-before-branches ordering; leaves strictly trail their segments mid-grow; buds wait until 0.64 and land last; `prefersReducedMotion` short-circuit (true/false/null/undefined).
- `DESIGN.md` + `.impeccable/design.json` — motion vocabulary recorded: the Overview motion sentence and the motion Do now name the specimen's ~600ms grow-in as the one authored exception; `extensions.motion` gains the `grow-in` entry.

**Evidence** (`docs/ultron/evidence/animate/` — `capture.mjs` is the capture script of record)

- Grow moment (desktop 1440×900): `grow-desktop-frame-{016,150,300,450,640}ms.png` — canvas frames captured on exact rAF beats (at 27/161/310/461/644 ms). Sequence reads: seedling nub over a waking ground glow → bare woody trunk with the first fork → branches at near-full spread with the first small leaves → near-complete canopy with amber buds arriving → settled bold specimen. `grow-desktop-context-mid.png` shows the same mid-grow state in the full chamber.
- Reduced-motion proof: `reduced-motion-200ms.png` ≡ `reduced-motion-settled-900ms.png` — byte-identical (final plant fully formed at 200 ms, zero intermediate states) and `rafCountDuringGrow: 0` (the loop never starts).
- Restart safety: `restart-double-grow-settled.png` — two Grow presses 80 ms apart settle to one coherent specimen (seed advanced exactly twice); rAF count plateaus 43→43 (loop terminated). `restart-reset-during-grow-settled.png` — Reset at 180 ms mid-grow returns the default seed (0x5eed1234) with status "Defaults restored. Baseline specimen grown."; the settled frame byte-matches a forced static redraw of the same plant (completeness proof). Vs the page-load render it differs on 0.34% of pixels at ≤12/255 — Chromium's software→GPU raster switch on the newly animated canvas, not a drawing difference. Zero console/page errors across all sequences; no idle rAF after settle (counts plateau).
- Mobile 390×844: `grow-mobile-frame-{016,150,300,450,640}ms.png` + `grow-mobile-context-mid.png` — same witnessed sequence at mobile scale.
- Gates: `corepack pnpm test` 27/27 green; `corepack pnpm typecheck` clean; `corepack pnpm build` clean. Detector (`detect.mjs --json` over `plant-canvas.ts`, `plant-canvas.test.ts`, `main.ts`): 0 findings.
- Dev server (port 5195, `corepack pnpm exec vite --port 5195 --strictPort` after `pnpm dev --` forwarded a stray `--`) stopped via TaskStop; port re-check refused connections.

**Notes for the queue**

- Chrome motion untouched: 160ms state transitions, 1px key lift, and the global CSS reduced-motion kill switch are exactly as they were; the grow-in is invisible to that switch by design, so it queries `matchMedia` itself.
- Entry 6 (polish): if the ghost-specimen strip renders past specimens, it should use `setPlant`-style static draws (or `drawPlant` at growth 1), never `growPlant`, so ghosts don't animate.

### Entry 4 — `$impeccable layout` (done — approved by user)

**Critique target.** Priority Issue 3 [P2]: desktop composition imbalance (rail 1246px towering over the 742px chamber, ~500px dead ground, ragged bottom) + mobile reading order (plant reading last in DOM, so post-grow updates land below the fold). Approved constraints: mobile DOM may be reordered; desktop composition is the main fix; the reading must stay strongly associated with the specimen; the chamber stays the first visual read.

**Spatial thesis.** The reading explains the current specimen, so it follows the chamber; the rail keeps controls + action block as one instrument to the end. Desktop: the reading becomes a full-width log strip under both columns (the ui-spec's sanctioned "lower reading strip") AND the two columns conclude on one shared baseline — the chamber stretches, its measurement field absorbing the difference. Mobile: chamber → reading → rail, DOM order = visual order.

**What changed**

- `index.html` — `<section class="plant-reading">` moved out of the control rail to a direct child of `main`, between the chamber and the rail (DOM: `growth-chamber → plant-reading → control-rail`). Inner structure split into `.reading-intro` (eyebrow, h2, copy) and `.reading-data` (amber environment line, trait `dl`) for the strip layout. All `data-reading` hooks, `aria-labelledby="reading-title"`, and heading levels unchanged; the FIRST VIEWPORT thesis comment now names the strip.
- `src/styles.css` —
  - `.app-shell`: named grid areas `"chamber rail" / "reading reading"`, `align-items: start → stretch`; ≤760 becomes `"chamber" / "reading" / "rail"` single-column grid (replacing `display: block` + margin-top juggling).
  - Chamber stretch chain: `.growth-chamber` flex column, `.chamber-frame` `flex: 1` + flex column, `.canvas-wrap` `flex: 1` (min-height clamp kept as floor). Aperture sizing (`min(78%, 620px)`) untouched.
  - `.plant-reading`: its own panel (hairline border, 22px radius, ink surface) laid out as the strip — intro left, hairline-divided data right, `dl` four-across; ≤940 zones stack (data full-width, trait row still 4-across); ≤760 `dl` two-by-two.
  - Rail: `.action-block` loses its bottom hairline (it now closes the rail; was doubling against the reading's edge), dead `.plant-reading { flex: 1 }` / rail flex-column rules removed, `.reading-environment` gets its own margin rule. No font-size or color values touched (entry 5's scope).
- `src/app-shell.ts` + `src/app-shell.test.ts` — `SHELL_SURFACES` reordered to `growth-chamber, plant-reading, environment-controls, action-block`, encoding the new DOM contract with a comment; test expectation updated. Playwright specs (`tests/*.spec.ts`) are selector-based and needed no changes.
- `DESIGN.md` — Layout section rewritten for the shipped composition ("One instrument, two regions, one log": full-width reading strip, columns concluding on one baseline, DOM order note, per-breakpoint strip behavior); Plant Reading signature now documents the four-across/two-by-two trait row.
- `.impeccable/design.json` — breakpoint values unchanged (940/760 stand); `sm` purpose text now describes chamber → reading → rail with 2×2 traits, and the Plant Reading Row component CSS updated to the four-across grid with a ≤760 two-by-two override.

**Before → after (dead space)**

| Viewport | before chamber/rail | after chamber/rail | dead ground under chamber | page height |
|---|---|---|---|---|
| 1440×900 | 742 / 1246 | **908 / 908** | 504px → **0px** | 1591 → 1442 |
| 1024×768 | 619 / 1274 | **902 / 902** | 655px → **0px** | 1580 → 1413 |
| 800×900 | 700 / 1210 | **854 / 854** | 510px → **0px** | 1483 → 1324 |

Chamber canvas region absorbs the difference (wrap 586 → 752 at 1440); aperture stays 586/451/312 (width-bound, untouched). The reading strip is 164px (1440) / 181px (≤940) tall.

**Mobile reading order + post-grow reachability (390×844).** Reading moved from the page tail (y 1666–2020 of a 2077px page, orphaned after the action block) to directly under the chamber (y 812–1160, 16px below the chamber's edge — exactly the ui-spec's mobile order: chamber, report, control rail, action row). After pressing Grow (scrollY 1246 at the button): the reading's bottom edge is 86px above the viewport top — the nearest content above the button (before: its top sat 558px inside the viewport with its tail cut below the fold at the page's end). One flick up brings specimen + report into view together (`mobile-390-postgrow-reading-visible.png`: all four trait cells, environment line, and headline readable); the controls/action block remain reachable by scrolling back down — no displacement without a scroll path.

**A11y-order notes.** DOM in `main`: `growth-chamber → plant-reading → control-rail` (matches mobile visual order exactly; on desktop grid areas place the rail right of the chamber and the reading below both). Tab order is unchanged — all six focusables (4 sliders, Grow, Reset) live in the rail, the reading introduces none, so focus cannot jump. Heading order stays H1 → H2 chamber → H2 reading → H2 controls; the reading keeps its named-section landmark (`aria-labelledby="reading-title"`). Evidence: `a11y-order.json`.

**Evidence** (`docs/ultron/evidence/layout/`)

- Screenshots: `desktop-1440-rest-{viewport,full}.png`, `desktop-1440-postgrow-full.png`, `laptop-1024-{rest,postgrow}-full.png`, `mid-800-rest-full.png`, `mobile-390-rest-{full,viewport}.png`, `mobile-390-postgrow-at-button.png`, `mobile-390-postgrow-reading-visible.png`.
- Measurements: `layout-evidence.json` (all viewports, rest + post-grow), `confirm-round.json` (post-fix), `a11y-order.json`; probes of record `baseline-probe.mjs` / `capture.mjs` / `wrap-check.mjs` / `verify-cells.mjs`.
- Round discipline: one batched screenshot round found three text wraps in the 761–940 band ("Leaf density" dt, "upright (1°)" dd, environment line — data zone too narrow at 4-across in a split strip); fixed by stacking the strip's zones at ≤940; wrap-check across 1440/1180/1024/941/900/800/761/760/390 now reports zero wraps; one confirm round re-captured 800 + desktop post-grow. Stop.
- Gates: `corepack pnpm test` 27/27 green, `corepack pnpm typecheck` clean, `corepack pnpm build` clean (all re-run after the final CSS fix).
- Detector (`detect.mjs --json` over `index.html`, `src/styles.css`, `src/app-shell.ts`): 12 advisories, all pre-existing and documented (markup-scan color false positive on the eyebrow, the chamber measurement-grid/moss-glow signatures, the documented `#ffd58f` hover, and the micro font sizes entry 5 owns) — zero findings introduced by this entry (no new colors, font sizes, or off-scale spacing; all spacing on `--space-*` tokens).
- Dev server (port 5196, `corepack pnpm exec vite --port 5196 --strictPort`; the `pnpm dev --` form forwarded a stray `--` again) stopped via `pkill -f "vite --port 5196"`; port re-check refused connections.

**Notes for the queue**

- Entry 5 (typeset): the strip's dd values ("upright (1°)") sit in 173px-wide cells at ≤940 and 148px at 1440 — comfortable at the current 0.82rem; any size bump should re-check the ≤940 four-across row (wrap floor measured at ~95px content width).
- Entry 6 (polish): the rail now closes with the action block; if the ghost strip lands in the chamber footer, no rail re-balance is needed — the chamber stretch recomputes automatically from whatever is tallest.

### Entry 5 — `$impeccable typeset` (done — approved by user)

**Critique target.** Priority Issue 4 [P2]: "Micro-text below the 11px floor (12 elements)" — the in-page detector's `undersized-ui-text` cluster (11 × 10.88px mono voice) plus the 11.2px amber environment line (`tiny-text`), with range hints at ~9.3px. Constraints: entry 4's strip grid frozen (only text metrics move), sans body sizes shift only if rhythm demands, Two Voices Rule and local stacks intact.

**What changed**

- `src/styles.css` — three size moves plus one wrap accommodation:
  - Mono measurement floor (`.eyebrow, .mono-label, .local-note, .status-tag, .range-hints, .reading-list dt`): 0.68rem → **0.72rem** (10.88 → 11.52px computed) — eyebrows, status tag, chamber footer labels, masthead local note, and reading terms now share one floor.
  - `.range-hints`: the 0.58rem override deleted — hints inherit the 0.72rem floor (9.28 → 11.52px); subordination kept by Dried-Stem Sage color and the existing 0.08em tracking (vs the group's 0.12em), not by size.
  - `.reading-environment` (amber line): 0.7rem → **0.76rem** (11.2 → 12.16px).
  - `.chamber-footer`: `flex-wrap: wrap` + `var(--space-1)` vertical padding (base and ≤940 override) — at ≤390px the two larger labels no longer wrap internally into ragged 2–3 lines but stack as two whole one-line rows inside the 52px min-height; desktop unchanged (labels fit side-by-side, wrap never triggers). Sans scale (1rem / 0.9rem / 0.82rem) untouched — rhythm held without shifts.
- `DESIGN.md` — frontmatter `typography.label.fontSize` → 0.72rem; Hierarchy Label bullet rewritten (one shared mono floor at 0.72rem = 11.52px computed, nothing in the interface renders below 11px; live values 0.82rem sentence case; environment line 0.76rem); Inputs Hints bullet (0.72rem at 0.08em — subordinate by color and tracking rather than size); Status Tag style value.
- `.impeccable/design.json` — label `typographyMeta` purpose names the floor; component CSS updated where sizes changed (Environment Slider hints, Status Tag, Instrument Panel eyebrow, Plant Reading Row `dt`).

**Measured minimum text size (before → after)**

| Scope | before (critique detector) | after (computed-px probe) |
|---|---|---|
| Range hints | 9.28px (0.58rem) | **11.52px** |
| Mono voice cluster (11 elements) | 10.88px (0.68rem) | **11.52px** |
| Environment line | 11.2px (0.7rem) | **12.16px** |
| Page minimum (all 46 text elements) | 9.28px | **11.52px at 1440, 390, and 320** — zero elements under 11px |

**Evidence** (`docs/ultron/evidence/typeset/`)

- `probe.mjs` (probe of record) + `typeset-evidence.json`: DOM enumeration of every text-bearing element (46 per viewport) with computed px, per-element line counts, frame-clip and overflow checks at 1440×900 / 390×844 / 320px. Zero undersized, zero document horizontal overflow, zero clipped-by-frame at all three widths; size histogram at 1440: 11.52×21, 12.16×2, 13.12×8, 14.4×6, 16×5, 27.2×3, 72×1.
- Screenshots: `desktop-1440-full.png`, `mobile-390-full.png`, `min-320-full.png` (post-fix), `min-320-chamber-footer.png` (element crop proving the two footer labels one-line-each at the min width). Status tag, range hints, trait terms/values, environment line, and local-note all render single-line (local-note 2 lines by `<br>` design) with no wraps, clips, or overflows.
- Round discipline: one batched round found one issue (chamber-footer internal wrapping at ≤390px, worsened by the size bump); fixed in one batch (the flex-wrap accommodation above); one confirm round — zero flags. Stop.
- Gates: `corepack pnpm test` 27/27 green, `corepack pnpm typecheck` clean, `corepack pnpm build` clean (re-run after the final CSS fix).
- Detector (`detect.mjs --json index.html src/styles.css`, one run): **`undersized-ui-text` and `tiny-text` are gone — zero findings reference any size below 11px.** 12 advisories remain, all documented-intentional: the markup-scan color false positive on the eyebrow (index.html links no stylesheet), the chamber measurement-grid/moss-glow signature colors, the documented `#ffd58f` hover, and `design-system-font-size` ramp advisories on the intermediate steps (0.9 / 0.82 / 0.76rem, mobile h1 clamp) that live in the Hierarchy prose rather than the frontmatter ramp — the same pre-existing set entry 4 recorded; the frontmatter ramp was deliberately not reshaped (no scale redesign).
- Dev server (port 5197, `corepack pnpm exec vite --port 5197 --strictPort`) stopped via TaskStop; port re-check refused connections.

**Notes for the queue**

- Entry 6 (polish): the seed readout (`SPECIMEN / #5EED1234`) joins the mono voice at the 0.72rem floor — not below it; if a ghost strip lands in the chamber footer, the footer now wraps gracefully, so extra labels have room at small widths.

### Entry 6 — `$impeccable polish` (done — approved by user)

**Critique target.** Priority Issue 5 [P2]: "No in-session variation memory — the compare loop runs entirely in the user's head." User-approved fix: a session-only ghost strip of the last 3 specimens + a visible seed readout (`SPECIMEN / #5EED1234`), with placement and Reset behavior delegated to this entry. This entry also closed the queue's named minor observations.

**Design decisions (owned per the brief)**

- **Ghost placement: canvas traces inside the aperture, not a DOM strip.** The critique's own implication ("haunted the chamber as faint ghost traces") — comparison without a gallery. Ghosts are settled geometry (growth 1, `drawGhostTissue`) in each specimen's own palette at recency-graded alpha 0.08 / 0.12 / 0.17 (oldest → newest; newest ≈ 1:5 against the live specimen's 0.7–0.95 tissue), drawn without ground or glow between the live ground and the live tissue. All plants share the aperture's root anchor, so the traces superimpose as a palimpsest — shape/spread/lean differences read directly.
- **Ghost transition rides the frozen grow clock.** The newest ghost dims from full live alpha into its resting trace over the first quarter (150ms) of entry 3's unchanged 600ms clock (`getGhostDim`) — frame-continuous at the press (no pop), settled by t=0.25, immediate under reduced motion. No new timers, no second loop.
- **Reset keeps history; reload clears it.** Reset restores the baseline specimen but does not amnesia the session's comparisons (the ghost strip is the instrument's working memory, and reset uses the same grow path). The memory lives only in `main.ts` module state — never storage — so a reload returns the chamber to its empty baseline (no-persistence constraint honored). Documented as a durable rule in DESIGN.md's Do's.
- **Seed readout home: the chamber footer's first label.** `SPECIMEN / CURRENT GROWTH` (a placeholder saying nothing) becomes `SPECIMEN / #5EED1234` — the real name of the current specimen, in the mono voice at the 0.72rem floor, sage like its footer sibling (a measurement, not a "living" value, so not amber under the Living Readout Rule). Shorter than the label it replaced, so entry 5's footer wrap behavior is preserved.

**What changed**

- `src/terrarium-state.ts` — `SPECIMEN_HISTORY_LIMIT` (3), `formatSpecimenSeed` (`#` + 8 uppercase hex), and `rememberSpecimen` (pure, immutable push-with-eviction). Comments document the session-only contract.
- `src/plant-canvas.ts` — ghost rendering: `GHOST_ALPHA_RAMP` + exported `getGhostAlpha` (recency-graded, robust to any count) and `getGhostDim` (press-continuous dim on the existing grow clock); `drawSegments`/`drawLeaves` gained an `alphaScale`; new `drawGhostTissue` (settled geometry, no ground); the renderer's draw path became `drawScene` (ground → ghosts oldest-first, newest dimming during grow-in → live tissue) used by both `resize` and the rAF loop; `setGhosts` joins the renderer API and mirrors history into `data-ghost-count`/`data-ghost-seeds` for probes. The now-dead exported `drawPlant` was removed (dead-code discipline); `setPlant` retained as the static primitive.
- `src/main.ts` — session history wiring: each successful grow/reset remembers the replaced specimen, pushes ghosts, then grows the next plant; `updateSpecimenSeed` names the current specimen at init and per grow. The recovery path touches no history.
- `index.html` — footer seed readout (`data-specimen="seed"`, true default content), right axis mark added, `theme-color` fixed.
- `src/styles.css` — `.axis-mark-right` (symmetric with left: 16×1 at 20px inset); disabled cursor `wait` → `default` (nothing ever waits — generation is synchronous).
- Tests — `terrarium-state.test.ts` +7: seed names (baseline `#5EED1234`, 8-digit padding, 12 distinct names across the seed chain), history semantics (accumulate, cap at 3 with oldest evicted, the real 4-grow loop evicting the default, input immutability). `plant-canvas.test.ts` +5: ghost alpha ramp (recency ordering, all subordinate < 0.7, newest alphas while filling, empty → 0) and `getGhostDim` (0 at press, settled by t=0.25, monotonic).
- `DESIGN.md` — Growth Chamber signature rewritten (seed readout + the ghost-memory paragraph: alphas, dim choreography, decorative/aria status, session-only/Reset/reload semantics); Key Characteristics + a new Do (session-only rule); disabled-cursor sentence made true.
- `.impeccable/design.json` — new Growth Chamber (signature) component (footer seed readout + ghost layer CSS); Primary Action disabled `cursor: wait` → `default`; keyCharacteristics + dos mirror DESIGN.md.

**Minor-observation dispositions (final pass)**

- `theme-color` drift: **fixed** — `#0d1713` → `#0b1410` (verified against the computed html ground in evidence).
- Missing right axis mark: **added** — no documented intent existed anywhere, so the asymmetry read as the oversight it was; four marks now (probe confirms position/centering).
- `cursor: wait` on disabled buttons: **removed** (→ `default`) — generation is synchronous, so the disabled state never paints and nothing ever waits; the busy lock itself stays as a reentrancy guard. DESIGN.md/design.json updated to match.
- Ready-tag tint and the kicker/glow/grid detector signatures: left as-is (defensible/documented per the critique; out of the brief's named set).

**Evidence** (`docs/ultron/evidence/polish/` — `capture.mjs` is the probe of record; zero assertion failures)

- Ghost capacity/eviction: after 4 grows exactly 3 ghosts with seeds = grows 1–3 and the default evicted (`ghost-seeds` probe); after 1 grow exactly 1 (the default).
- Session-only proof: reload → `ghost-count` 0, seed label back to `SPECIMEN / #5EED1234`, and an A/B pixel census at the same ~30ms grow-in instant (3 ghosts vs none) isolating 998,756 alpha mass of ghost tissue — glow and seedling cancel out.
- Rapid double-grow: history coherent (`[default, control, first-of-pair]`, no duplicates/missing), live seed advanced twice, rAF loop terminated (plateau), zero console errors.
- Reduced motion with ghosts present: frame at 150ms byte-identical to settled, rAF count 0, ghosts intact.
- Seed readout: visible in the chamber footer, tracks the live seed every grow (desktop + mobile), 11.52px mono.
- Text floor: 46 text elements at 1440 and 390, minimum 11.52px, zero under 11px; footer labels one line each at 390 and whole-line wrapping at 320.
- Screenshots: `01` initial, `02` after 1 grow, `03` mid-grow ghost-dim context frame, `04` after 4 grows, `05` aperture closeup (vivid live specimen over subordinate traces — visually verified: exactly one bold plant, ghosts faint, no artifacts), `06` after reload, `07` rapid double-grow settled, `08` reduced-motion grow, `09–11` mobile initial/after-4-grows/after-reload. Full data in `polish-evidence.json`.
- Round discipline: one batched round caught only probe-side arithmetic (decimal-vs-hex seed strings, a glow-contaminated pixel band, one miscounted ghost expectation — the app was correct in every case; no UI code changed); probes corrected and re-run green. Stop.
- Gates: `corepack pnpm test` 39/39 green; `corepack pnpm typecheck` clean; `corepack pnpm build` clean. Detector (`detect.mjs --json` over `index.html`, `src/styles.css`, `src/main.ts`, `src/plant-canvas.ts`, `src/terrarium-state.ts`): 12 advisories — exactly entry 5's documented set, zero new findings.
- Dev server (port 5198, `corepack pnpm exec vite --port 5198 --strictPort`) stopped via TaskStop; port re-check refused connections.

**Queue close-out note.** All six entries of the approved queue are now implemented; the compare loop works like this: press Grow, watch the previous specimen recede into a faint trace as the new one rises, note the new `SPECIMEN / #…` name if a result matters, and compare up to three remembered specimens against the vivid current one — all within the visit, all gone on reload.
