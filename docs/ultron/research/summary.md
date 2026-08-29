# The Algorithmic Terrarium — Deep Research Summary

Status: approved; decisions committed
Date: 2026-08-25

## Scope

This research resolves the approved plan’s R-01, R-02, and R-03 questions without expanding the MVP. The workspace is empty, local-only, and currently has Node.js 24.9.0 and pnpm 11.19.0 available. The `npm` shim is present but fails to locate its CLI module, so the implementation default uses pnpm and a committed lockfile.

Delegation: direct fallback. No subagent was used because the available workflow tools did not expose a task-level research delegation primitive; each planned research track was investigated directly and recorded below.

## Decision matrix

| ID / priority | Question | Recommendation | Alternatives considered | Status | User disposition |
| --- | --- | --- | --- | --- | --- |
| R-01 / P0 | Which frontend and test runtime fits an empty, local-only canvas app? | Vanilla TypeScript with Vite 8.x, Vitest 4.1.x, Playwright Test 1.62.1, and pnpm | React + Vite; no-framework TypeScript with a hand-rolled build | Committed | Approved |
| R-02 / P0 | Which generator gives clear environmental cause-and-effect with bounded performance? | Custom seeded recursive branching/turtle geometry; no generator package | Full L-system grammar; pure fractal/IFS | Committed | Approved |
| R-03 / P0 | How should canvas rendering, accessibility, responsiveness, and QA work? | Native 2D canvas + ResizeObserver + capped DPR + semantic HTML/report + Vitest/Playwright/manual visual matrix | Canvas pixel snapshots; SVG-first rendering; custom ARIA sliders | Committed | Approved |

## Cross-track recommendation

Use a small, framework-free TypeScript application with a pure generator module and a thin DOM/canvas integration layer. Keep all user-visible state in semantic HTML controls and a text report; treat the canvas as the visual projection of the model, not the source of truth. This gives the MVP direct manipulation, deterministic testing, low dependency weight, and a clear path to later export without requiring a backend now.

## Implementation consequences

- FE-01 should scaffold the Vite vanilla TypeScript template and use pnpm scripts for `dev`, `build`, `typecheck`, `test`, and `test:e2e`.
- FE-02 should implement a pure environment-to-plant model with an internal seeded PRNG, max depth 6, max two child branches per node, and explicit command/segment limits.
- FE-03 should size the canvas from its container with `ResizeObserver`, scale the backing store for `min(devicePixelRatio, 2)`, and draw in CSS-pixel coordinates.
- FE-04 should use native `<input type="range">` controls, explicit labels, visible values, and a polite live report updated on grow/reset.
- QA-01 should use Vitest for pure generator/state behavior and Playwright for user-visible browser behavior; avoid pixel snapshots as the primary correctness mechanism.
- QA-02/A11Y-01 should validate the three primary viewport sizes, keyboard focus, the canvas fallback/report, reduced motion, and representative parameter extremes.
- SEC-01 should confirm that all runtime assets are local or system-provided and that no analytics, accounts, network submissions, or secrets are introduced.

## Approval gate

The user must explicitly approve, revise, defer, or reject R-01, R-02, and R-03 individually. A deferred decision must include an owner, revisit trigger, implementation default, and affected tasks. No research choice enters production until its disposition is recorded in `state.md` and the revised `plan.md` is approved as a whole if the choice changes architecture or acceptance criteria.

## Track records

- [R-01 frontend stack](frontend-stack.md)
- [R-02 procedural generator](generator.md)
- [R-03 canvas, accessibility, and QA](canvas-qa.md)
