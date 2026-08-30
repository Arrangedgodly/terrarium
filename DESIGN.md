---
name: The Algorithmic Terrarium
description: Grow a distinct procedural plant from four environmental conditions inside a nocturnal field station.
colors:
  forest-floor-ink: "#0b1410"
  moss-shade-ink: "#101d17"
  thicket-green: "#2b4033"
  lichen-bloom: "#e5f1df"
  lichen-flare: "#a9d9ae"
  seedling-mint: "#b2f4c6"
  seed-kernel-amber: "#f2c476"
  dried-stem-sage: "#91a79a"
  sunscald-coral: "#ff9e89"
  hairline-lichen: "rgba(190, 228, 192, 0.18)"
  marked-lichen: "rgba(190, 228, 192, 0.32)"
typography:
  display:
    fontFamily: "Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.35rem, 5vw, 4.8rem)"
    fontWeight: 500
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2vw, 1.7rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.55
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "0.72rem"
    letterSpacing: "0.12em"
rounded:
  frame: "22px"
  control: "10px"
  pill: "999px"
spacing:
  "1": "8px"
  "2": "12px"
  "3": "16px"
  "4": "24px"
  "5": "32px"
  "6": "48px"
components:
  button-primary:
    backgroundColor: "{colors.seed-kernel-amber}"
    textColor: "#1a221a"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "#ffd58f"
    textColor: "#1a221a"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.lichen-bloom}"
    rounded: "{rounded.control}"
    height: "48px"
  panel-frame:
    backgroundColor: "rgba(16, 29, 23, 0.82)"
    rounded: "{rounded.frame}"
  status-tag:
    textColor: "{colors.seedling-mint}"
    rounded: "{rounded.pill}"
    padding: "7px 9px"
---

# Design System: The Algorithmic Terrarium

## Overview

**Creative North Star: "The Nocturnal Field Station"**

The interface is a small outdoor laboratory after dark: matte ink surfaces, hairline measurement marks, and one warm amber signal, with a living specimen growing in the chamber. The mood is calm scientific wonder — patient, observant, and slightly magical. Measurement is presented as care for the specimen, not cold engineering: every readout exists so the plant can be understood, not so the machine can be admired.

The system runs on two voices. A calm humanist sans speaks in sentences — names, explanations, and the one-line story of the loop. A compact monospaced face measures — uppercase eyebrows, live values, trait readouts, and footer labels. Depth comes from tonal steps between ink surfaces and hairline rules, not from stacked shadows or glass. Motion is brief (160ms ease) and tactile: the grow action lifts one pixel, sliders respond under the hand, nothing else performs. The one authored exception belongs to the specimen itself: after a Grow press the plant grows in over ~600ms on the chamber canvas — ground and trunk first, branches extending outward by depth, leaves unfurling behind them, fruit buds arriving last — with quartic ease-out (fast start, settled arrival, no bounce); under `prefers-reduced-motion` the finished specimen appears immediately.

The specimen itself is procedural and paints in its own environment-driven palette (see Colors), so the chrome stays deliberately quiet: matte, low-saturation, and green-dark, letting the plant carry saturation and surprise.

**Key Characteristics:**

- Matte, near-black green ink surfaces with tonal (not shadow-based) depth.
- Two typographic voices: humanist sans for prose, monospace for measurement.
- One warm accent (amber) reserved for living readouts and the grow action.
- Hairline rules and measurement marks as the primary structural ornament.
- Circular specimen aperture with a faint 44px measurement grid.
- Session-only specimen memory: the last three plants linger as faint ghost traces behind the live one, and the footer names the current seed.
- Local system fonts only — the terrarium is self-contained.

## Colors

A botanical palette for after dark: deep forest inks form the ground, quiet lichens carry text and interaction, and a single kernel of amber signals life.

### Primary
- **Seed Kernel Amber** (#f2c476): The single warm voice. Carries the Grow plant action, live control values (`output`), the environment readout line, the "seeded output" note, and the draft status. Wherever amber appears, something is alive or about to be.

### Secondary
- **Lichen Flare** (#a9d9ae): The instrument accent — slider `accent-color`, focus outlines, and the hover border of the secondary action. It is the color of touching the instrument.
- **Seedling Mint** (#b2f4c6): The grown-state voice — "grown" status tag, grown status message, and text selection. Fresh growth reads mint.

### Tertiary
- **Sunscald Coral** (#ff9e89): Recovery and error only — the recovery status tag and tone. Named for the real plant condition; used as rarely as its namesake.

### Neutral
- **Forest-Floor Ink** (#0b1410): Page ground and the base of the body's 145° ink gradient.
- **Moss-Shade Ink** (#101d17): Panel surface, applied as `rgba(16, 29, 23, 0.82)` over the ground so the gradient breathes through.
- **Thicket Green** (#2b4033): Inactive track and scrollbar thumb.
- **Lichen Bloom** (#e5f1df): Primary readable text on ink.
- **Dried-Stem Sage** (#91a79a): Secondary copy — masthead copy, rail intro, hints, measurement labels, footers.
- **Hairline Lichen** (rgba(190, 228, 192, 0.18)): The 1px rules that structure every panel.
- **Marked Lichen** (rgba(190, 228, 192, 0.32)): Stronger hairlines: axis marks and the secondary action's resting border.

### Named Rules
**The Living Readout Rule.** Amber marks everything the environment is currently saying: the grow action, live control values, and draft state. If it is not alive, it is not amber. Chrome, headings, and static copy never take the warm hue.

**The Specimen Saturation Rule.** The procedural plant (canvas) owns saturation. Chrome accents stay below it in chroma so the specimen is always the first visual read. The plant's palette is generated per specimen in `src/generator.ts` (`createPalette`): stems `hsl(25–65 34–48% 36–43%)` shifting with humidity (dry = warm woody brown, wet = cool green), leaves `hsl(35–137 46–56% 44–52%)` with hue shifting by acidity (acidic = chartreuse-gold, alkaline = deep green) and chroma by humidity and sunlight, accents `hsl(9–69 72–82% 61–68%)` shifting with sunlight (dim = ember, full = gold) and carried by leaf edges, fruit dots at sun-fed tips, and the specimen glow — the code is the canonical source; do not freeze these values into tokens.

## Typography

**Display Font:** Avenir Next (with Segoe UI, system-ui, sans-serif)
**Body Font:** Avenir Next (with Segoe UI, system-ui, sans-serif)
**Label/Mono Font:** ui-monospace (with SFMono-Regular, Consolas, Liberation Mono)

**Character:** A calm humanist sans explains; a compact monospace measures. The pairing makes the page read as one instrument with a voice and a scale, never as a document with captions.

### Hierarchy
- **Display** (500, clamp(2.35rem, 5vw, 4.8rem), 0.94): The terrarium's name in the masthead; capped at 12ch so it stacks like a specimen label.
- **Headline** (500, clamp(1.35rem, 2vw, 1.7rem), 1.05): Section titles — chamber, controls, reading. Tight (-0.04em) like the display.
- **Body** (400, 1rem, 1.55): Explanatory prose; rail intro runs 0.9rem. Measure stays under ~34rem.
- **Label** (400, 0.72rem, 0.12em, uppercase): Eyebrows, status tags, mono footer labels, reading terms, and range hints — one shared mono floor (11.52px computed at default zoom); nothing in the interface renders below 11px. Above the floor, live values run 0.82rem mono in sentence case and the amber environment line runs 0.76rem.

### Named Rules
**The Two Voices Rule.** Sans explains, mono measures. Prose is never set in mono; values, traits, and measurement labels are never set in the sans. When a new readout is added, it joins the mono voice.

## Layout

One instrument, two regions, one log. The page shell is `min(100% - 48px, 1260px)` centered, with 40px top and 56px bottom padding. The masthead names the study and states the loop in one line; below it, `app-shell` is a two-column grid — growth chamber at `minmax(0, 1.34fr)`, control rail at `minmax(320px, 0.86fr)` — separated by a 24px gap, with the plant reading as a full-width strip spanning both columns beneath them. The two columns always conclude on one baseline: the chamber stretches to the rail's height and its measurement field absorbs the difference. The rail is a single vertical instrument — heading, four controls, action block, in that order, each section separated by hairlines rather than gaps. The reading strip is the instrument's log: on wide screens an intro block (eyebrow, headline, one sentence) sits left of a hairline-divided data block — the amber environment line over a four-across trait row.

In DOM order the reading follows the chamber and the rail comes last, so small screens read specimen → log → instruments. The chamber's canvas region holds `min-height: clamp(420px, 61vh, 650px)` and grows to fill the column; the circular specimen aperture stays at `min(78%, 620px)`. At 940px the rhythm tightens (16px section padding, 760px shell) and the reading strip stacks its zones with the trait row still four-across. At 760px the grid dissolves to a single column: chamber first at a stable height, plant reading directly beneath it, rail under both with the action block closing it; the trait row becomes two-by-two. Spacing runs on a six-step scale — 8, 12, 16, 24, 32, 48px (`--space-1`–`--space-6`).

## Elevation & Depth

Depth is tonal, not cast. Surfaces step from Forest-Floor Ink to Moss-Shade Ink (as 0.82 alpha), structure comes from 1px hairlines, and atmosphere from two quiet gradients: the body's 145° ink wash and the chamber's radial moss glow at 50% 68%. Exactly one shadow exists in the system.

### Shadow Vocabulary
- **Chamber grounding** (`box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2)`): The growth chamber frame only — it grounds the specimen's world the way a lamp grounds a field station bench. Nothing else casts.

### Named Rules
**The Single Grounding Shadow Rule.** Only the growth chamber casts a shadow. Every other surface is flat; if a new element seems to need elevation, it needs a tonal step or a hairline instead.

## Shapes

Soft-rectangular frames with one circular exception. Panels take the 22px frame radius (`--radius-frame`); controls inside them take 10px (`--radius-control`); status tags are full pills (999px). The specimen aperture is a perfect circle (`border-radius: 50%`) with its own faint radial vignette — the one place the geometry echoes the specimen itself. Structure is otherwise carried by 1px hairlines, and the chamber's background doubles as instrumentation: a 44px measurement grid with center axis marks.

## Components

### Buttons
- **Shape:** 10px radius, 48px minimum height — confident instrument keys.
- **Primary (Grow plant):** Seed Kernel Amber fill, ink text (#1a221a), 700 weight, arrow glyph at the trailing edge; padding 0 16px.
- **Hover / Focus:** Hover brightens to #ffd58f and lifts 1px (`translateY(-1px)`, 160ms ease); active settles back. Focus-visible takes a 2px Lichen Flare outline (4px offset) plus the focus ring. Disabled dims to 0.58 opacity amber; generation is synchronous, so the disabled state never visibly waits — the cursor stays `default`, never `wait`.
- **Secondary (Reset defaults):** Ghost — transparent ground, Marked Lichen border, Lichen Bloom text. Hover fills with 8% lichen; disabled drops to sage on a hairline.

### Inputs / Fields (environment sliders)
- **Style:** Native range inputs, full width, 44px minimum hit height, `accent-color: Lichen Flare`.
- **Label row:** Sans label (0.9rem, Lichen Bloom) left; live mono value (0.82rem, amber `output`) right.
- **Hints:** 0.72rem uppercase mono endpoints (dry/wet, light/heavy) below the track in sage at 0.08em tracking — they sit on the mono floor, kept subordinate by color and tracking rather than size.
- **Focus:** Shared focus-visible treatment — 2px Lichen Flare outline, 4px offset, ring shadow.

### Status Tag
- **Style:** Pill (999px, 7px 9px padding), uppercase mono 0.72rem, 1px self-colored border at ~0.5 alpha over an 8% tint.
- **State:** `ready` (mint on mint tint), `draft` (amber — conditions changed since growth), `grown` (mint), `recovery` (Sunscald Coral). Border, text, and tint all shift in 160ms.

### Cards / Containers (panels)
- **Corner Style:** 22px frame radius; chamber crops content (`overflow: hidden`).
- **Background:** `rgba(16, 29, 23, 0.82)` over the page gradient.
- **Shadow Strategy:** Chamber only (see Elevation).
- **Border:** 1px Hairline Lichen; header and footer rows carry their own hairline separators.
- **Internal Padding:** 32px (`--space-5`) sections, 24px at 940px.

### Navigation
Not present — a single-page instrument with no routes. The masthead is identification, not navigation.

### The Growth Chamber (signature)
The defining component: a 22px frame containing a header row (eyebrow, headline, status tag), the canvas region, and a mono footer strip ("SPECIMEN / #5EED1234 · MODEL / SEEDED BRANCHING"). The footer's first label is the seed readout: it names the current specimen by its seed in the mono voice and changes with every grow, so results are nameable (#5EED1234 style, 8 hex digits) and a new seed per grow is visible. The canvas region layers a 44px measurement grid (1px lines at 3.5% lichen), a radial moss glow behind the specimen, four edge axis marks in Marked Lichen, and the circular aperture holding the procedural plant.

The chamber remembers its session: behind the live specimen, the last three plants linger as faint ghost traces — settled geometry in each specimen's own palette at a whisper of its living alpha (~0.08–0.17, recency-graded so the most recent departure is the most visible), drawn without ground or glow so they never add light or shadow. The newest trace dims from live visibility into its resting alpha over the first quarter of the grow-in clock, so the replaced specimen recedes as the new one rises; under reduced motion it appears at rest immediately. Ghosts are decorative history: the canvas label and fallback text describe only the current specimen. The memory is session-only — in-memory, never storage — so it survives Reset (which grows the baseline specimen but keeps the session's comparisons) and clears on reload. The current specimen is always the vivid one.

Fallback text inside the canvas keeps the chamber legible without pixels.

### The Plant Reading (signature)
The instrument's log: eyebrow + headline, one sentence of plain-language copy, a mono environment line in amber, then a definition list of four traits (Height / Branching / Leaf density / Lean) — four cells across in the full-width reading strip, two-by-two on small screens. Terms are uppercase mono sage; values are mono Lichen Bloom with hairline tops. Em dashes mark the pre-growth state.

## Do's and Don'ts

### Do:
- **Do** structure with hairlines first: a 1px Hairline Lichen rule before any fill, card, or divider.
- **Do** keep amber living: Grow action, live values, draft state — and nothing else.
- **Do** set every measurement in the mono voice (uppercase 0.12em tracking) and every explanation in the sans.
- **Do** hold 44px minimum hit height on sliders and 48px on buttons.
- **Do** move in 160ms ease with a 1px lift at most, and honor `prefers-reduced-motion` with the global kill switch (the specimen's ~600ms canvas grow-in is the one authored exception, and it collapses to the finished frame under reduced motion).
- **Do** let the specimen own saturation; keep chrome accents quieter than the plant.
- **Do** keep specimen memory session-only: ghosts and seed names live in the page's memory, survive Reset, and clear on reload — the terrarium never persists.

### Don't:
- **Don't** use glassmorphism, blur, or frosted translucency — surfaces are matte ink.
- **Don't** fall into a stock dashboard grid of repeated cards; this is one instrument with regions, not a grid of widgets.
- **Don't** reach for neon cyberpunk glow; the darkness is botanical, not synthetic.
- **Don't** accumulate rounded cards; the 22px frame belongs to real containers, not decoration.
- **Don't** add shadows beyond the growth chamber's grounding shadow.
- **Don't** load remote fonts or assets; the stack is local/system only.
- **Don't** let color carry meaning alone — every state also exists in text (status messages, the reading, the canvas fallback).
