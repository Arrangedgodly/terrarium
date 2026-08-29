# The Algorithmic Terrarium — Town Hall Brief

Status: awaiting user approval

## Problem and target users

People who enjoy generative art, plants, and playful creative tools need a fast way to explore how environmental conditions can produce different forms. The product should make procedural generation feel understandable and alive: users change a small set of environmental inputs and see a distinct digital plant grow from those conditions.

Primary users are curious, visually oriented desktop and mobile-web users who want a short creative experiment rather than a horticulture simulator or a technical L-system editor. A secondary audience is developers/designers looking for a polished example of deterministic procedural graphics.

Desired outcome: a user can understand the relationship between the four environmental sliders and the plant, create several visually distinct plants in one sitting, and feel that the result is both responsive and intentional.

## Proposed MVP

Build a single-page, responsive dashboard called The Algorithmic Terrarium with:

- A prominent HTML5 canvas terrarium showing one generated plant.
- Four clearly labeled environmental controls: humidity, sunlight hours, soil acidity, and gravity.
- A readable current value for every control, with sensible ranges and units/qualifiers where appropriate.
- A primary “Grow plant” interaction that generates a new plant from the current environment plus a new internal seed.
- A reset/defaults interaction so the user can return to a known baseline.
- A short, human-readable “plant report” or status area describing the current environment and the plant’s broad traits (for example, branching, height, or leaf density).
- A coherent visual system: dark terrarium/dashboard surface, high-contrast controls, and a canvas treatment that keeps the plant as the focal point.

The plant generator may use an L-system, recursive branching, fractal geometry, or a similarly lightweight procedural method. The exact algorithm is an implementation/research decision, provided the output is deterministic for a given environment and seed and the controls have visibly meaningful influence.

### Must-have behavior

1. The initial load displays a complete plant without requiring setup.
2. Changing any slider updates its visible value and changes the next generated plant in a recognizable but coherent way.
3. “Grow plant” produces a new valid plant without page reload; repeated generations are not identical.
4. The canvas scales cleanly within the responsive layout and remains legible at common viewport sizes.
5. Keyboard users can reach and operate every control and action.
6. The interface remains usable when the canvas is unavailable to a screen reader by providing an equivalent textual summary of the current generated plant/environment.
7. Reset restores the documented defaults and produces a valid baseline plant.

## Explicit non-goals

- User accounts, server-side storage, collaboration, sharing links, or a database.
- Botanical accuracy, species identification, or scientific claims about real plants.
- A full editor for custom grammars, manual branch editing, or arbitrary parameter authoring.
- Multiple simultaneous plants or a persistent collection/gallery.
- Exporting images, though the architecture should not prevent a later export feature.
- Complex animation, audio, or game mechanics in the MVP.
- External APIs, analytics, or third-party integrations.

## Primary journey and important states

### First visit

The user sees a default plant, the four controls, a clear primary action, and a short explanation that the environment shapes the plant. No empty state should appear during normal startup.

### Exploration loop

The user adjusts one or more sliders, sees values update immediately, then selects “Grow plant.” The canvas transitions to the new plant with a restrained visual cue, and the plant report updates with the current values and broad traits.

### Repeat generation

The user presses “Grow plant” without changing inputs and receives a different plant from a new seed. The result remains within the same environmental character so the interaction feels procedural rather than random noise.

### Reset

The user selects reset, all controls return to their defaults, and the canvas/report return to a valid baseline state.

### Edge and failure states

- Extremely low/high slider values still produce a recognizable, bounded plant rather than invalid geometry.
- Very small viewports preserve access to controls and avoid canvas overflow.
- A slow or failed draw must not leave stale controls that imply a different plant; show a compact recoverable status if needed.
- Reduced-motion preferences avoid unnecessary animated growth.
- Keyboard focus remains visible and logical after grow/reset actions.

## Success measures

For an MVP review, success means:

- A first-time user can identify all four inputs and grow a plant without instructions beyond the interface copy.
- Each slider produces an observable change in at least one plant trait across a controlled comparison.
- Two consecutive grows with unchanged inputs differ while remaining valid and visually coherent.
- The page remains responsive during interaction on a typical laptop and a mid-range mobile viewport.
- Automated checks cover the core control/generation/reset logic, and a manual accessibility pass confirms labels, focus, contrast, and a text equivalent for the canvas.

## Acceptance criteria

- [ ] The app loads into a complete, polished dashboard with an initial procedural plant.
- [ ] Humidity, sunlight hours, soil acidity, and gravity each have an accessible label, range, current value, and keyboard operation.
- [ ] The current environment is represented in the generated plant and in the textual plant report.
- [ ] The primary grow action creates a new seeded result without a reload and without uncaught errors.
- [ ] Defaults are documented in the UI or accessible label/help text, and reset restores them.
- [ ] The generated plant is clipped or scaled safely inside the canvas at supported responsive sizes.
- [ ] The plant remains bounded and renderable at every supported slider endpoint and at representative combinations.
- [ ] A screen-reader-friendly text summary exposes the current environment and broad generated traits without requiring interpretation of pixels.
- [ ] Reduced motion is respected, or the MVP uses no essential motion.
- [ ] Core generation and control behavior has automated test coverage appropriate to the project stack.

## Constraints, assumptions, dependencies, and risks

### Constraints

- The workspace is currently empty and is not initialized as a Git repository, so the app must establish its own minimal project structure without relying on existing conventions.
- MVP is client-side and local-only.
- The canvas is the primary visual output, but it cannot be the only way to communicate state.

### Assumptions

- The target is a modern browser with HTML5 canvas support.
- A single-screen experience is more valuable initially than persistence or sharing.
- The intended tone is calm, experimental, and slightly magical rather than scientific or cartoonish.
- The user is asking for the complete product workflow, so implementation will follow the phase gates rather than begin immediately.

### Dependencies

- A browser-capable frontend stack and test runner must be selected during planning/research.
- Visual QA needs a repeatable way to render or inspect the responsive page.
- The generator needs a stable seeded random source so repeatability and variation can both be tested.

### Risks

- If environmental controls are only decorative, the core promise fails. Trait-to-input mapping must be explicit and tested.
- Pure randomness can make the product feel noisy or unrepeatable. Seed handling and bounded parameters are important.
- Canvas-only output can be inaccessible. The textual report must be treated as a first-class output.
- Overbuilding the dashboard can distract from the growth loop. Gallery, export, accounts, and advanced parameters should remain deferred.
- Dense branching or high-resolution redraws can affect mobile performance. Research should establish practical generation limits.

## Role perspectives

### Product and user value

Support: The four-input model is small enough to understand and rich enough to create a satisfying exploration loop.

Dissent: “Unique” can be interpreted as infinite novelty, while a seeded generator produces controlled variation. The product should promise a distinct generated plant, not mathematical uniqueness.

Exposure: The primary risk is a visually impressive demo with no understandable cause-and-effect.

Smallest resolution: Define and test one visible trait per input before expanding the visual vocabulary.

### UX/UI and visual design

Support: A dashboard with one dominant canvas and a compact control panel gives the interaction a clear hierarchy.

Dissent: A four-slider control panel can feel like a settings form. Values, short helper text, and a strong grow action are needed to frame it as experimentation.

Exposure: Decorative glassmorphism, gradients, or animation can reduce contrast and compete with the plant.

Smallest resolution: Establish a visual hierarchy and an accessible, high-contrast control pattern during planning/research before polishing.

### Frontend engineering

Support: A client-side seeded generator is a good fit for fast redraws, deterministic tests, and no backend dependency.

Dissent: Canvas rendering and responsive sizing introduce device-pixel-ratio, resize, and cleanup pitfalls.

Exposure: A visually correct desktop canvas can blur, clip, or become expensive on mobile.

Smallest resolution: Choose a bounded render model with a resize strategy and a small set of representative viewport checks.

### Backend, data, and integrations

Support: No backend is needed for the MVP; keeping the loop local makes the product immediate and privacy-light.

Dissent: Without persistence, users cannot return to a favorite plant or share it.

Exposure: Adding storage or accounts now would expand scope without improving the first-use experiment.

Smallest resolution: Explicitly defer persistence/export and keep a stable internal seed in the client so later sharing can be added cleanly.

### Quality and reliability

Support: The core behavior is testable as pure generation/control logic even though the final output is visual.

Dissent: Snapshotting canvas pixels is brittle and can hide semantic regressions.

Exposure: A broken trait mapping or invalid geometry may only appear at parameter extremes.

Smallest resolution: Test deterministic seeds, endpoint combinations, bounds, trait mapping, reset, and the text report; use manual visual QA for appearance.

### Security and privacy

Support: A local-only app has minimal data and attack surface.

Dissent: Future sharing/export could introduce file, URL, or user-content concerns.

Exposure: Unnecessary analytics or remote assets would conflict with the privacy-light premise and add failure points.

Smallest resolution: Keep MVP free of external submissions, account data, and third-party tracking; revisit if scope changes.

### Accessibility

Support: Native range inputs, explicit labels, visible values, focus states, and a text summary can make the experience broadly usable.

Dissent: Canvas is inherently visual, and a terse “plant report” may not fully convey shape.

Exposure: Low contrast, color-only trait changes, or focus loss after generation could exclude users.

Smallest resolution: Define the report vocabulary and keyboard/focus behavior as acceptance criteria, then validate with automated and manual checks.

## Decisions and rejected alternatives

- Decision: local-only client-side MVP. Rationale: fastest feedback loop and smallest risk surface. Rejected for MVP: accounts/cloud persistence.
- Decision: four environmental controls only. Rationale: preserves learnability and the concept’s identity. Rejected for MVP: advanced plant editor and dozens of parameters.
- Decision: explicit grow action plus reset. Rationale: gives the user a legible moment of creation and a recovery path. Rejected for MVP: continuous uncontrolled animation as the only feedback.
- Decision: seeded variation. Rationale: enables both repeatable tests and different results for repeated grows. Rejected: unbounded unseeded randomness.
- Decision: text report alongside canvas. Rationale: accessibility and causal explanation. Rejected: canvas as the sole source of meaning.

## Open questions and disposition

| Question | Owner/phase | Blocks receiving phase? |
| --- | --- | --- |
| Which frontend stack and project scaffold best fit this empty workspace? | Planning | Yes, planning |
| Which generator family gives the clearest controllable traits at low complexity? | Deep research | Yes, research before production |
| What exact slider ranges, defaults, and trait mappings should be used? | Planning, validated in research | Yes, planning |
| Should changes redraw immediately, or only on “Grow plant”? | Planning | Yes, planning |
| What browser/viewport matrix is sufficient for visual QA? | Research | No, informs research/production |
| What wording and trait vocabulary makes the report useful without claiming botanical truth? | Planning | No, informs planning |
| What exact easing or transition is used after generation? | Production | No, implementation detail if reduced-motion behavior is preserved |

## Handoff to plan-it-out

The next phase should convert this approved scope into a dependency-aware task index. It should resolve the interaction cadence, stack/scaffold, parameter contract, testing seams, and visual QA workflow without adding persistence, sharing, export, or advanced editing. Any change to the MVP boundary, success measures, non-goals, or acceptance criteria must return to town hall.
