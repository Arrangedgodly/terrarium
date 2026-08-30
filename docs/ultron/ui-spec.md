# The Algorithmic Terrarium — UI-01 Dashboard Composition

Status: approved by user
Mode: Operate
Target: responsive single-page dashboard

## Direction contract

Direction seed: `5ac0f6fa`, assigned grounded candidate 3. The remote challenger roll was unavailable in the sandbox, so this is a degraded seed with no challenger boards; the product brief’s pinned dark terrarium/dashboard cue remains authoritative.

### Thesis

Make the plant feel like a live specimen inside a small nocturnal field station: the environment controls are instruments, and the canvas is the growth chamber where their consequences appear.

### Own-world

Matte ink surfaces, hairline measurement marks, botanical contour traces, lichen/mint highlights, and one warm seed/amber accent. Typography pairs a calm humanist sans for explanation with a compact monospaced face for values and readouts. Avoid generic glassmorphism, stock dashboard grids, neon cyberpunk, and rounded-card accumulation.

### Story

The visitor reads the environment, adjusts an instrument, presses Grow plant, and immediately understands that a new seeded specimen reflects those conditions. The report translates the visual into a few plain-language traits without pretending to be botanical science.

### First viewport

On desktop, the first viewport is a two-part instrument panel: a large growth chamber on the left containing the plant and a slim control rail on the right. A compact masthead names the terrarium and explains the loop in one line. The primary Grow plant button stays in the control rail’s action block, visually connected to the controls rather than floating in a generic hero. The plant occupies most of the available height and remains the first visual read.

On mobile, the growth chamber comes first at a stable, generous height, followed by the plant reading strip and then the control rail, whose action block keeps Grow adjacent to the sliders it consumes. Because the action sits at the page's end and its consequence sits at the top, a growth that starts while the chamber is less than half visible brings the chamber into view (smoothly; instantly under reduced motion) so the witnessed grow-in is never missed. The reading follows the chamber so the post-grow report is the first thing after the animation, and the controls keep a clear scroll path.

### Form

Field-station instrument panel, assigned candidate 3 of the grounded direction list. The form is carried by measurement rails, specimen framing, compact readouts, and a strong but restrained grow action—not by decorative cards or a literal greenhouse illustration.

### Finish

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Information architecture

1. Masthead: product name, one-line mechanism statement, and a quiet “local experiment” cue.
2. Growth chamber: canvas, fallback description, subtle environment status, and a small specimen label such as “current growth”.
3. Control rail: four environmental sliders in the same order as the product contract, each with label, current value, helper hint, and endpoint context where useful.
4. Action block: primary “Grow plant” button, secondary “Reset defaults” action, and a short status line for ready/grown/recoverable-error states.
5. Plant reading: visible report with environment values and broad traits—height, branching, leaf density, and lean.

The interface should feel like one instrument with a reading, not a collection of unrelated cards.

## Visual system

### Color roles

Use semantic roles rather than hard-coded color names in component code:

- `--ink-950`: near-black green ink for the page ground.
- `--ink-900`: slightly lifted panel/frame surface.
- `--ink-700`: secondary surface and inactive track.
- `--lichen-200`: primary readable text and plant highlight.
- `--lichen-400`: active control/focus accent.
- `--mint-300`: generated foliage/positive state accent.
- `--amber-300`: Grow action, seed marker, and warm plant variation.
- `--muted-400`: secondary copy and inactive measurement marks.
- `--danger-300`: recoverable error only.

Contrast must be checked for every text role against its actual surface. Color may reinforce a trait but never carry the report by itself.

### Typography roles

- Display/product name: expressive but restrained sans, sentence case, clear at a glance.
- Body/helper copy: readable system sans with comfortable line height.
- Values/metadata: system monospace or tabular-numeral face for alignment and instrument character.
- Labels: compact uppercase or small caps only when paired with a readable value; do not turn all copy into labels.

Use local/system font stacks to preserve the local-only constraint; do not add a remote font dependency for the MVP.

### Shape, line, and depth language

- Main growth chamber: one generous radius, approximately 20–24px, with a thin border and quiet inner frame.
- Controls: small 8–12px radius, thin rules, native range thumb enlarged for touch.
- Buttons: one strong primary shape and one text/outline secondary action; no pill-only action system.
- Measurement rules: 1px hairlines, low-contrast but visible, with occasional short tick marks.
- Depth: one restrained frame shadow and surface contrast; avoid floating glass layers and heavy blur.

### Spacing rhythm

Use a compact 8px base rhythm: 8, 12, 16, 24, 32, 48. Give headings more space above than below. The growth chamber gets the largest breathing room; control rows stay dense enough to scan without feeling cramped.

## Responsive composition

### Wide desktop — 1440×900

- Page padding: generous outer margin; content max width around 1180–1280px.
- Two columns: growth chamber roughly 60–64% of the content width; control rail 36–40%.
- Masthead spans the page; report aligns to the growth chamber edge or sits as a lower reading strip.
- Canvas drawing area maintains a large square-ish or slightly tall ratio so the plant has room to branch.

### Laptop — 1024×768

- Preserve two columns if the canvas can remain at least approximately 420px tall; otherwise reduce outer padding before stacking.
- Keep the control rail’s action block visible without requiring a second scroll region.
- Shorten helper copy before shrinking the plant or control targets.

### Mobile — 390×844

- Stack growth chamber, report, control rail, and action row in that order unless the report can sit naturally below the chamber.
- Growth chamber gets a fixed responsive height range rather than collapsing to content height.
- Controls use full-width rows with a clear label/value line above the native range input.
- Actions become a full-width primary button plus a secondary text action beneath or beside it, with touch-safe spacing.
- No horizontal scrolling; focus rings and labels must remain visible at the narrow width.

## Interaction and state details

### Initial state

Show a complete default plant, populated values, and a report. The status copy can say “Ready to grow” and should not look like an empty state.

### Slider editing

Update the visible value immediately. Add a quiet “environment changed” cue to the action/status region, but keep the current plant stable until Grow plant is pressed.

### Grow success

Use a short 120–180ms visual acknowledgment only if it improves orientation; the plant must remain visible before, during, and after it. Update the report and status text after the new model is ready. With reduced motion, make the change immediate.

### Reset

Restore the exact product-contract defaults, grow a valid baseline, and return focus to the Reset defaults button or the first control according to the final keyboard flow; do not strand focus.

### Recoverable error

Keep the last valid plant visible if possible. Surface a concise status message and leave Grow plant and Reset defaults available. Never replace the canvas with a blank panel without explanation.

### Focus, hover, and disabled states

- Focus: a visible 2px `--lichen-400` outline with enough offset from the dark surface.
- Hover: increase border/text contrast and gently lift the primary action; do not rely on hover to reveal meaning.
- Pressed: reduce elevation/brightness briefly while preserving contrast.
- Disabled/generating: reduce decoration, preserve label readability, and expose a status reason if the action is unavailable.

## Accessibility and performance requirements

- Use semantic landmarks and headings for masthead, growth chamber, controls, actions, and plant reading.
- Use native range inputs with explicit labels and visible current values; do not build custom slider semantics.
- Keep the report visible and synchronize concise fallback text inside the canvas.
- Use `aria-live="polite"` only for completed grow/reset status/report updates, not for every slider tick.
- Honor `prefers-reduced-motion: reduce`; no essential transition may depend on animation.
- Keep touch targets comfortable and focus visible at all breakpoints.
- Use local/system assets only; avoid remote fonts, analytics, and decorative image downloads.
- Keep visual texture CSS-lightweight: thin rules and measured gradients are acceptable, but no large background raster is needed.

## Implementation tokens and component surfaces

The scaffold should define tokens for colors, spacing, radii, typography, and focus before composing the page. Expected semantic surfaces:

- `app-shell`
- `masthead`
- `growth-chamber`
- `environment-control`
- `action-block`
- `plant-reading`
- `status-message`

Keep generator state separate from DOM styling. The canvas frame owns the visual model; the report owns its accessible textual equivalent.

## UI-01 acceptance checklist

- [ ] The plant is the first visual read and receives the largest surface area.
- [ ] Controls, actions, and report form one instrument-panel hierarchy rather than a grid of generic cards.
- [ ] Desktop, laptop, and mobile compositions are explicit and avoid overflow.
- [ ] Color, typography, shape, spacing, focus, hover, disabled, error, and reduced-motion behavior are defined.
- [ ] The dark terrarium cue is preserved without sacrificing text/control contrast.
- [ ] No remote assets or scope-expanding UI features are required.
- [ ] The artifact gives FE-01 enough structure to build the shell without inventing visual behavior.
