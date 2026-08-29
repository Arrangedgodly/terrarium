# R-01 — Frontend Stack and Test Runtime

Status: committed; user approval recorded
Priority: P0
Affected tasks: R-01, FE-01, QA-01, FE-03, SEC-01
Date: 2026-08-25

## Question

Which frontend stack and test runtime gives an empty, local-only, responsive canvas app the smallest maintainable path to implementation and verification?

## Constraints and evaluation criteria

- The workspace has no existing application scaffold or conventions.
- The MVP needs a responsive page, a native form-control surface, an HTML5 canvas, pure deterministic logic, and browser-level interaction checks.
- No backend, data store, authentication, or third-party integration is required.
- The stack should keep state transparent and avoid framework overhead that does not support the user journey.
- Type checking must be explicit because build-time transpilation alone is insufficient.
- Local reproducibility matters: the current `npm` shim is broken, while pnpm is available.

## Options considered

### Option A — Vanilla TypeScript + Vite + Vitest + Playwright Test (recommended)

Fit: High. Vite supports `.ts` imports and provides a fast dev server/build; Vitest uses Vite’s config and transform pipeline; Playwright supplies isolated browser fixtures, web-first assertions, and Chromium/Firefox/WebKit coverage.

User/developer impact: The DOM and canvas remain close to the product model, so a slider maps directly to state and a plant model maps directly to drawing. There is no component abstraction to learn before the user-visible loop exists.

Effort/maintenance: Low initial setup and a small dependency surface. The tradeoff is that we must define our own small DOM state wiring and cleanup patterns.

Accessibility/security: Native HTML controls and labels are easy to retain. No runtime framework or remote service is needed.

Lock-in: Low. The pure generator and semantic HTML can move to another host later.

### Option B — React + Vite + TypeScript + Vitest + Playwright

Fit: Medium. It offers component conventions and familiar test patterns, but the MVP has one page, four controls, one canvas, and no routing or shared component library.

User/developer impact: A component model may help if the app expands into galleries, saved plants, or multiple views, but it adds state/rendering ceremony for the first loop.

Effort/maintenance: Medium. More dependencies and an additional framework boundary without a current product need.

Prefer it if: The product scope expands to multiple interactive screens or a larger design system before implementation begins.

### Option C — Hand-rolled TypeScript modules with a custom/no bundler build

Fit: Medium-low. It can work for native modules, but production builds, asset handling, type-checking, and browser-test startup would become bespoke decisions.

User/developer impact: The runtime is simple, but the delivery workflow becomes less obvious.

Effort/maintenance: Higher than the MVP warrants; it increases operational risk without improving the core experience.

Prefer it if: The app must ship as a zero-tool static bundle and the delivery environment forbids a package manager/build step.

## Recommendation

Choose Option A: Vanilla TypeScript with Vite, Vitest, and Playwright Test. Use pnpm 11.19.0 in this workspace because it is available and the npm shim currently fails. Keep exact resolved versions in `pnpm-lock.yaml`; use the stable versions available at implementation time, with the research snapshot below as the starting point.

Recommended development commands:

```text
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm test:e2e
```

Use a separate `typecheck` script such as `tsc --noEmit`; Vite’s documentation explicitly states that Vite transpiles TypeScript but does not perform type checking.

## Evidence

- [Vite Getting Started](https://vite.dev/guide/) — Vite provides a dev server and production build, and the current guide documents modern-browser assumptions and the current Node compatibility line.
- [Vite Features: TypeScript](https://vite.dev/guide/features) — Vite supports `.ts` imports, but transpiles without type checking; the guide recommends explicit TypeScript configuration.
- [Vite package page](https://www.npmjs.com/package/vite?activeTab=versions) — observed latest stable `8.2.2` on 2026-08-25.
- [Vitest Getting Started](https://vitest.dev/guide/) — Vitest is powered by Vite and supports standard test scripts.
- [Vitest Features](https://vitest.dev/guide/features) — Vitest shares Vite configuration/transform behavior and supports TypeScript, projects, coverage, and browser mode.
- [Vitest package page](https://www.npmjs.com/package/vitest) and [npm search snapshot](https://www.npmjs.com/search?q=vitest) — observed the current stable line as `4.1.x` on 2026-08-25; the page/search snapshots differed by a patch version, so the lockfile must be authoritative.
- [Playwright running tests](https://playwright.dev/docs/running-tests) — Playwright Test runs headless by default, supports browser projects, and provides UI/debug modes.
- [Playwright best practices](https://playwright.dev/docs/best-practices) — recommends user-visible assertions and isolated tests rather than implementation-detail coupling.
- [Playwright package page](https://www.npmjs.com/package/%40playwright/test?activeTab=versions) — observed stable `1.62.1` on 2026-08-25 with Chromium, Firefox, and WebKit support.
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases) — Node 24 is an LTS line as of the research date; the local runtime is `v24.9.0`.

## Risks and mitigations

- Risk: Package versions move quickly. Mitigation: install stable versions once, commit the pnpm lockfile, and use the lockfile for validation.
- Risk: pnpm is a local environment constraint rather than a universal user requirement. Mitigation: document the package-manager choice in the README and keep scripts package-manager agnostic after installation.
- Risk: Vanilla DOM wiring can become tangled. Mitigation: keep generator/state pure and limit the integration layer to one app controller plus small render functions.

## Confidence and decision

Confidence: high for this MVP. The recommendation is proposed, not committed, until the user explicitly approves R-01.

Decision priority: P0.
