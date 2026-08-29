# The Algorithmic Terrarium — Implementation Plan

Status: approved plan; production complete

This plan turns the approved town-hall brief into bite-sized, verifiable work. It preserves the local-only, single-page MVP and does not include accounts, persistence, sharing, export, galleries, or advanced plant editing.

## Deep-research result proposals

The research phase narrowed the implementation choices. These decisions were explicitly approved during the research gate and are now committed for production.

| Task | Proposed choice | Production consequence | Status |
| --- | --- | --- | --- |
| R-01 | Vanilla TypeScript + Vite 8.x, Vitest 4.1.x, Playwright Test 1.62.1; use pnpm in this workspace | FE-01 scaffolds the Vite vanilla TypeScript template; QA-01 uses Vitest for pure logic and Playwright for browser behavior | completed |
| R-02 | Custom seeded recursive branching/turtle geometry; no generator package in MVP | FE-02 owns a pure bounded generator with max depth 6, max two children per node, a command budget, and geometry-derived traits | completed |
| R-03 | Native 2D canvas + ResizeObserver + `min(devicePixelRatio, 2)` backing-store scale + semantic fallback/report + native range inputs | FE-03/FE-04 implement the rendering/accessibility contract; QA uses semantic assertions and manual visual review instead of pixel snapshots | completed |

Research records: [`docs/ultron/research/summary.md`](research/summary.md), [`frontend-stack.md`](research/frontend-stack.md), [`generator.md`](research/generator.md), and [`canvas-qa.md`](research/canvas-qa.md).

## Planning decisions proposed for approval

These are product-level implementation contracts needed to make the plan concrete. They do not commit a library or algorithm before research.

| Contract | Proposed decision | Rationale |
| --- | --- | --- |
| Humidity | 0–100%, default 55% | Familiar percentage scale and enough room for dry/wet extremes |
| Sunlight | 0–24 hours, default 12 hours | Directly understandable environmental input |
| Soil acidity | pH 3.0–9.0, default 6.5 | Avoids unrealistic extremes while showing acidic/neutral/alkaline variation |
| Gravity | 0.2–2.0g, default 1.0g | Keeps generated forms bounded while allowing visibly different posture |
| Generation cadence | Slider changes update values immediately; the plant changes when “Grow plant” is pressed | Keeps the current plant stable while users explore inputs and makes creation legible |
| Repeated grows | Each grow uses a new internal seed; the environment stays fixed | Produces variation without losing environmental identity |
| Report vocabulary | Environment values plus broad traits: height, branching, leaf density, and lean | Explains the result without making botanical claims |
| Reset | Restores the defaults above and grows a valid baseline plant | Provides a known comparison point and recovery path |

If these contracts change the user problem, MVP boundary, success measures, non-goals, or acceptance criteria, return to town hall. Otherwise, they are ready to be fixed by plan approval.

## Role lanes

### Product and UX

#### UX-01 — Freeze the interaction contract

- Owner: Product/UX
- Status: completed
- Outcome: A written contract for slider ranges/defaults, grow/reset behavior, plant report vocabulary, and first-visit copy.
- Scope: Resolve the planning-level product questions from town hall using the proposed decisions above.
- User journey: First visit, exploration loop, repeat generation, reset.
- Inputs: Approved `town-hall.md`.
- Expected output: Approved contract incorporated into the implementation decisions and UI acceptance checks.
- Dependencies: None.
- Parallel with: UI-01, R-01, R-02, R-03.
- Likely surfaces: Control labels, helper text, report/status area.
- Acceptance: Every committed control has a range/default and every journey has an explicit state transition.
- Validation: Review the contract against every town-hall acceptance criterion and the plan approval gate.
- Risks/assumptions: Values are product defaults, not claims about real horticulture.
- Size: small.

### UI and visual design

#### UI-01 — Define the responsive dashboard composition

- Owner: UI/Visual Design
- Status: completed
- Outcome: A visual/layout specification for the canvas, control panel, report, actions, states, and responsive breakpoints.
- Scope: Define hierarchy, spacing, color/contrast direction, typography roles, focus/hover/disabled states, and reduced-motion behavior without implementing production code.
- User journey: First visit and exploration loop.
- Inputs: Approved town-hall brief and UX-01 contract.
- Expected output: An implementation-ready visual checklist or token/layout notes in the plan/research record.
- Dependencies: UX-01 for final labels and state inventory.
- Parallel with: R-01, R-02, R-03.
- Likely surfaces: App shell, canvas frame, sliders, buttons, report card.
- Acceptance: The plant is the visual focal point; controls remain discoverable; contrast/focus requirements are explicit for mobile and desktop.
- Validation: Review the layout against the first-visit, reset, error, keyboard-focus, and reduced-motion states.
- Risks/assumptions: Avoid decorative treatment that harms contrast or performance.
- Size: medium.

### Research and architecture

#### R-01 — Select the frontend scaffold and testable runtime

- Owner: Frontend Architecture
- Status: completed
- Outcome: A documented choice of frontend language/framework, build tool, test runner, and browser-test strategy that fits an empty workspace.
- Scope: Compare the smallest viable options for a client-only responsive canvas app; include setup cost, TypeScript support, test ergonomics, and local visual QA.
- User journey: All journeys, because the scaffold affects delivery and validation.
- Inputs: Empty workspace constraint and approved MVP.
- Expected output: Research recommendation with primary sources and a concrete scaffold decision.
- Dependencies: None.
- Parallel with: R-02, R-03, UX-01, UI-01.
- Likely surfaces: Project root, package manifest, source/test directories.
- Acceptance: The choice supports deterministic pure-function tests, canvas rendering, responsive layout, and a repeatable local build.
- Validation: Research record includes a minimal proof or documented rationale; no production implementation yet.
- Risks/assumptions: Avoid library choice based only on popularity; the app is intentionally small.
- Size: medium.
- Research question: Which stack provides the lowest-friction, maintainable path for a small local-only canvas app with automated browser-level checks?

#### R-02 — Choose and bound the procedural generation approach

- Owner: Generative Graphics Engineering
- Status: completed
- Outcome: A selected generator family and parameter contract that maps the four environmental inputs to bounded visual traits.
- Scope: Compare L-system, recursive branching/fractal, and equivalent lightweight approaches for controllability, determinism, performance, and reportable traits.
- User journey: Exploration loop and repeat generation.
- Inputs: UX-01 contract, four controls, seeded variation requirement.
- Expected output: Research record with the chosen algorithm, seed strategy, parameter mappings, bounds, and failure handling.
- Dependencies: UX-01 for ranges/defaults; R-01 for runtime constraints.
- Parallel with: R-03 after the interaction contract is fixed.
- Likely surfaces: Pure generator module, seed utilities, trait summary model.
- Acceptance: Each input has at least one meaningful visible influence; fixed seed is repeatable; repeated seeds differ; all endpoint combinations remain bounded.
- Validation: Proposed unit/property cases and a small visual comparison matrix in the research record.
- Risks/assumptions: “Unique” means visibly distinct seeded output, not a mathematical guarantee.
- Size: medium.
- Research question: Which lightweight procedural method gives the clearest environmental cause-and-effect while staying deterministic and performant on mobile browsers?

#### R-03 — Define canvas rendering, responsive, and visual QA strategy

- Owner: Frontend Platform/QA
- Status: completed
- Outcome: A practical rendering and validation strategy for device-pixel-ratio, resize, reduced motion, viewport coverage, and canvas/text equivalence.
- Scope: Establish sizing and redraw rules, supported viewport matrix, manual visual review method, and non-pixel-brittle test seams.
- User journey: First visit, exploration loop, edge/failure states.
- Inputs: Approved MVP, UI-01 layout direction, R-01 runtime candidate.
- Expected output: Research recommendation with responsive/rendering constraints and a QA matrix.
- Dependencies: R-01 for available browser/test tooling.
- Parallel with: R-02.
- Likely surfaces: Canvas component/module, CSS layout, browser tests, accessibility checks.
- Acceptance: Strategy covers mobile and desktop, endpoint states, resize, keyboard focus, reduced motion, and an equivalent text report.
- Validation: Research record names concrete viewport cases and checks that can run locally.
- Risks/assumptions: Visual appearance is manually reviewed; semantics and generation logic are automated.
- Size: medium.
- Research question: What canvas sizing and QA approach gives sharp, bounded output without making tests fragile or excluding non-visual users?

### Frontend implementation

#### FE-01 — Scaffold the application shell

- Owner: Frontend Engineering
- Status: completed
- Outcome: The selected project scaffold builds and serves a responsive shell with semantic regions for the canvas, controls, actions, and report.
- Scope: Initialize the project using the R-01 decision; add the page structure, base styles, responsive containers, and a healthy initial test/build command.
- User journey: First visit.
- Inputs: UX-01, UI-01, R-01.
- Expected output: Running app shell with no generator dependency yet.
- Dependencies: UX-01, UI-01, R-01.
- Parallel with: FE-02 can begin only after the scaffold exposes the agreed module/test structure.
- Likely surfaces: Project manifest, app entrypoint, global styles, shell components.
- Acceptance: The app loads without uncaught errors at planned desktop/mobile viewports; semantic regions and focusable action placeholders exist.
- Validation: Run build, unit/test, and local browser smoke check.
- Risks/assumptions: No production code begins before research decisions are approved.
- Size: medium.

#### FE-02 — Implement the deterministic generator and trait summary

- Owner: Frontend/Generative Graphics Engineering
- Status: completed
- Outcome: A pure, seeded generator converts an environment plus seed into bounded plant geometry/colors and a reportable trait summary.
- Scope: Implement the algorithm selected in R-02, including normalization, bounds, seed handling, and stable trait extraction.
- User journey: Exploration loop and repeat generation.
- Inputs: UX-01, R-02.
- Expected output: Pure generator module with unit/property tests and a render-ready model.
- Dependencies: FE-01, R-02.
- Parallel with: None on the critical path; UI wiring follows this contract.
- Likely surfaces: Generator, seed utilities, model types, unit tests.
- Acceptance: Deterministic fixed-seed output; distinct repeated seeds; meaningful mapping for all four controls; safe endpoint combinations.
- Validation: Run generator tests and inspect a small fixed comparison set.
- Risks/assumptions: Geometry is bounded before canvas drawing and cannot hang on extreme inputs.
- Size: medium.

#### FE-03 — Render the plant with responsive canvas handling

- Owner: Frontend Engineering
- Status: completed
- Outcome: The canvas displays the generated plant sharply and safely across the supported viewport matrix.
- Scope: Implement drawing, canvas sizing/device-pixel-ratio handling, resize behavior, bounded clipping, and reduced-motion-safe transitions from R-03.
- User journey: First visit, exploration loop, edge/failure states.
- Inputs: FE-02 render model, UI-01, R-03.
- Expected output: Canvas module/component integrated into the shell.
- Dependencies: FE-01, FE-02, R-03.
- Parallel with: FE-04 can be developed against the generator/render contract once FE-02 is stable.
- Likely surfaces: Canvas component/module, styles, resize observer/event handling.
- Acceptance: Initial plant renders; redraws do not overflow; canvas remains legible at supported viewports; reduced-motion preference is honored.
- Validation: Manual viewport matrix plus browser smoke checks and console-error check.
- Risks/assumptions: Visual QA does not require brittle pixel snapshots.
- Size: medium.

#### FE-04 — Build controls, grow/reset flow, and plant report

- Owner: Frontend Engineering
- Status: completed
- Outcome: All four controls, grow action, reset action, visible values, and the text-equivalent report drive the generator and canvas.
- Scope: Use native range inputs, accessible labels, current values, validation-safe state, new seed per grow, defaults on reset, focus behavior, and report updates.
- User journey: Exploration loop, repeat generation, reset, keyboard path.
- Inputs: UX-01, UI-01, FE-02, FE-03.
- Expected output: End-to-end interactive MVP loop.
- Dependencies: FE-03 and FE-02.
- Parallel with: QA-01 can prepare test cases while implementation proceeds.
- Likely surfaces: Controls, action buttons, report/status region, state wiring.
- Acceptance: All four inputs visibly influence the next generated plant; repeated grows vary; reset restores defaults; report exposes environment and broad traits; focus remains visible and logical.
- Validation: Browser interaction tests plus manual keyboard/screen-reader-oriented review.
- Risks/assumptions: Slider edits do not redraw until grow, per proposed contract.
- Size: medium.

#### FE-05 — Apply visual polish and failure/recovery states

- Owner: Frontend/UI Engineering
- Status: completed
- Outcome: The MVP feels cohesive and handles recoverable draw failures or slow states without misleading the user.
- Scope: Apply UI-01 visual system, loading/transition treatment if needed, empty/error status copy, disabled/action states, and reduced-motion behavior.
- User journey: All journeys, especially edge/failure states.
- Inputs: UI-01, FE-03, FE-04, R-03.
- Expected output: Polished, resilient interface.
- Dependencies: FE-04.
- Parallel with: QA-02, SEC-01.
- Likely surfaces: CSS/tokens, status area, action state styling.
- Acceptance: Plant remains focal; no essential information depends on color or motion; failure can recover via grow/reset; contrast/focus requirements pass.
- Validation: Visual review and accessibility checks at the planned viewport matrix.
- Risks/assumptions: Keep animation optional and subordinate to the generation action.
- Size: small.

### Quality, accessibility, security, and delivery

#### QA-01 — Add automated core behavior coverage

- Owner: QA/Test Engineering
- Status: completed
- Outcome: Automated tests cover generation determinism, control mapping, reset, report data, and key interaction behavior.
- Scope: Add the test cases enabled by R-01/R-02, favoring pure logic and semantic browser assertions over canvas pixel snapshots.
- User journey: Exploration, repeat generation, reset, endpoint states.
- Inputs: FE-02, FE-04, R-01, R-02.
- Expected output: Repeatable test suite with clear failure messages.
- Dependencies: FE-02 for generator contract; FE-04 for end-to-end control wiring.
- Parallel with: FE-05 and SEC-01 after interfaces stabilize.
- Likely surfaces: Unit tests, browser tests, test utilities.
- Acceptance: Tests cover fixed-seed repeatability, new-seed variation, all slider endpoints, representative combinations, reset, report values, and grow action.
- Validation: Run the project’s canonical test command and record evidence in `production-log.md`.
- Risks/assumptions: Do not rely on exact raster pixels unless research proves a stable narrow use.
- Size: medium.

#### QA-02 — Validate responsive visual and interaction quality

- Owner: QA/UX Quality
- Status: completed
- Outcome: Manual validation evidence for the supported viewport matrix, first-use clarity, transitions, and failure/recovery states.
- Scope: Execute the R-03 visual QA matrix and compare observed behavior against UI-01 and acceptance criteria.
- User journey: All journeys and important states.
- Inputs: FE-05, R-03.
- Expected output: Findings and pass/fail evidence recorded in `production-log.md`.
- Dependencies: FE-05.
- Parallel with: SEC-01 and A11Y-01.
- Likely surfaces: Running app in browser, screenshots/observations.
- Acceptance: No clipping/overflow, controls remain usable, initial and reset states are clear, endpoint plants remain bounded, and no uncaught errors appear.
- Validation: Browser inspection at each planned viewport and representative parameter set.
- Risks/assumptions: Manual visual review is required for the canvas output.
- Size: medium.

#### A11Y-01 — Verify accessibility and reduced-motion behavior

- Owner: Accessibility/QA
- Status: completed
- Outcome: Evidence that the dashboard is operable and understandable without relying on canvas pixels alone.
- Scope: Check native labels/values, keyboard order/focus, contrast, status/report semantics, screen-reader text equivalent, and reduced-motion behavior.
- User journey: First visit, exploration, reset, keyboard path.
- Inputs: FE-04, FE-05, R-03.
- Expected output: Accessibility findings, fixes, and final pass record.
- Dependencies: FE-05.
- Parallel with: QA-02, SEC-01.
- Likely surfaces: Form controls, buttons, report/status region, CSS media query behavior.
- Acceptance: Every input/action is keyboard operable and labeled; focus is visible; report communicates environment and broad traits; motion is non-essential or suppressed.
- Validation: Automated accessibility check plus manual keyboard and screen-reader-oriented review.
- Risks/assumptions: Full conformance audit is outside MVP; critical blockers must still be fixed.
- Size: medium.

#### SEC-01 — Confirm local-only privacy and dependency posture

- Owner: Security/Delivery
- Status: completed
- Outcome: A lightweight review confirming no unnecessary data collection, network dependency, or unsafe input handling was introduced.
- Scope: Inspect dependencies, asset loading, client-side state, and any user-controlled values reaching the generator/drawing path.
- User journey: All journeys.
- Inputs: R-01, FE-04, FE-05.
- Expected output: Security/privacy checklist and any remediation notes.
- Dependencies: FE-04 for final state flow; R-01 for dependency list.
- Parallel with: QA-02, A11Y-01.
- Likely surfaces: Dependency manifest, source, build output.
- Acceptance: No accounts/analytics/external submissions; values are range-bounded; no avoidable remote runtime dependency; build contains no obvious secrets.
- Validation: Dependency/build inspection and production smoke check.
- Risks/assumptions: Future export/sharing would require a new review.
- Size: small.

## Dependency-ordered task index

| ID | Owner | Status | Depends on | Milestone |
| --- | --- | --- | --- | --- |
| UX-01 | Product/UX | completed | — | M0 |
| UI-01 | UI/Visual Design | completed | UX-01 | M0 |
| R-01 | Frontend Architecture | completed | — | M0 |
| R-02 | Generative Graphics Engineering | completed | UX-01, R-01 | M0 |
| R-03 | Frontend Platform/QA | completed | R-01, UI-01 | M0 |
| FE-01 | Frontend Engineering | completed | UX-01, UI-01, R-01 | M1 |
| FE-02 | Frontend/Generative Graphics Engineering | completed | FE-01, R-02 | M2 |
| FE-03 | Frontend Engineering | completed | FE-01, FE-02, R-03 | M2 |
| FE-04 | Frontend Engineering | completed | FE-02, FE-03 | M3 |
| QA-01 | QA/Test Engineering | completed | FE-02, FE-04 | M3 |
| FE-05 | Frontend/UI Engineering | completed | FE-04 | M4 |
| QA-02 | QA/UX Quality | completed | FE-05 | M5 |
| A11Y-01 | Accessibility/QA | completed | FE-05 | M5 |
| SEC-01 | Security/Delivery | completed | FE-04 | M5 |

## Milestones

### M0 — Approved contracts and research-ready architecture

Complete UX-01 and UI-01 alongside the approved R-01 through R-03 decisions. Outcome: fixed product interaction contract, visual/layout direction, selected stack, selected generator strategy, and QA/rendering strategy. This milestone is the research gate and exposes mistaken assumptions before code is built.

### M1 — Loadable dashboard shell

Complete FE-01. Outcome: the app launches into a responsive semantic shell with stable regions and canonical build/test commands.

### M2 — First visible procedural plant

Complete FE-02 and FE-03. Outcome: a seeded plant renders in the canvas with bounded geometry and responsive handling, even before all controls are wired.

### M3 — Complete growth loop

Complete FE-04 and QA-01. Outcome: users can adjust all four controls, grow varied plants, reset defaults, and read the environment/trait report with automated behavior coverage.

### M4 — Polished resilient experience

Complete FE-05. Outcome: the app handles normal and recoverable states with the intended visual hierarchy and reduced-motion behavior.

### M5 — Validated MVP

Complete QA-02, A11Y-01, and SEC-01. Outcome: responsive, accessibility, privacy, and delivery checks pass; evidence is recorded in `production-log.md`.

## Critical path and parallel work

The critical path is:

`UX-01 → R-01 → R-02/R-03 → FE-01 → FE-02 → FE-03 → FE-04 → FE-05 → QA-02/A11Y-01/SEC-01`

UX-01, R-01, and initial UI-01 work can overlap. Once R-01 is selected, R-02 and R-03 can proceed in parallel. QA-01 should prepare tests alongside FE-04, while FE-05, QA-02, A11Y-01, and SEC-01 form the final validation cluster.

## Handoff and phase gate

### Fixed by approved scope

- Local-only, single-page MVP.
- Four environmental controls: humidity, sunlight hours, soil acidity, and gravity.
- Canvas plant plus textual report.
- Seeded variation, reset, responsive behavior, keyboard operation, reduced-motion consideration, and endpoint safety.
- No accounts, persistence, sharing, export, gallery, or advanced editor.

### Delegated to deep research

- Frontend scaffold and testing runtime (R-01).
- Procedural generation family, seed strategy, and parameter mapping details (R-02).
- Canvas rendering, responsive sizing, visual QA, and semantic equivalence strategy (R-03).

### Research findings approved

- R-01 approved: Vanilla TypeScript + Vite 8.x with Vitest 4.1.x and Playwright Test 1.62.1; pnpm is the workspace implementation default because the local npm shim is broken.
- R-02 approved: a custom seeded recursive branching/turtle generator with bounded depth/commands instead of an L-system package.
- R-03 approved: native 2D canvas with ResizeObserver, capped DPR scaling, semantic fallback/report, native range inputs, and semantic browser tests plus manual visual QA.

### Return-to-town-hall conditions

Return to town hall if research or implementation proposes persistence, sharing/export, multiple plants, a different user journey, a new primary input model, removal of the text report, or any change to the MVP boundary, success measures, non-goals, or acceptance criteria.

### Production approval cursor

All committed tasks are complete and approved. The validated MVP production plan is closed.
