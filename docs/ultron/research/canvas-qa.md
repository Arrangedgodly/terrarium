# R-03 — Canvas, Accessibility, Responsive Rendering, and QA

Status: committed; user approval recorded
Priority: P0
Affected tasks: R-03, FE-03, FE-04, FE-05, QA-01, QA-02, A11Y-01, SEC-01
Date: 2026-08-25

## Question

How should the plant render sharply and safely across viewports while remaining understandable to keyboard and screen-reader users and testable without brittle pixel assertions?

## Constraints and evaluation criteria

- Canvas is the primary visual output but cannot be the only representation of state.
- The plant must resize without clipping or blur on common screens.
- The MVP has no essential animation and must respect reduced-motion preferences.
- Controls must be native, labeled, keyboard-operable, and visibly valued.
- Tests should verify user-visible behavior and pure model invariants without overfitting to raster pixels.

## Options considered

### Option A — Native 2D canvas plus semantic HTML/report (recommended)

Fit: High and directly aligned with the concept. The canvas handles the procedural projection; native controls and a visible report carry interaction and meaning.

Rendering: Use a `ResizeObserver` on the canvas container. Set CSS dimensions from layout, set the backing store to `floor(cssSize * min(devicePixelRatio, 2))`, and normalize the drawing coordinate system with a transform so generator geometry stays in CSS-pixel units.

Accessibility: Use explicit `<label>` elements and native `<input type="range">` controls. Put a concise fallback description inside the `<canvas>` and expose the current environment/traits in a visible `output`/report region with `aria-live="polite"` on grow/reset.

QA: Vitest for generator/state invariants; Playwright for semantic interactions, report updates, focus, responsive bounds, and console errors; manual visual review for plant appearance.

### Option B — Canvas pixel snapshots as the main correctness test

Fit: Low-medium. Pixel snapshots can catch gross visual regressions but are brittle across browser engines, device-pixel-ratio, fonts, antialiasing, and operating systems. They also do not prove that controls/report semantics work.

Use only as: An optional later visual regression check after the layout stabilizes, never the primary acceptance mechanism.

### Option C — SVG-first rendering with custom controls

Fit: Medium. SVG gives inspectable shapes, but custom pointer/keyboard controls and a different rendering model add work. It also diverges from the user’s explicit HTML5 canvas concept.

### Option D — Custom ARIA slider widgets

Fit: Low for this MVP. Native range inputs already provide slider semantics, keyboard behavior, min/max/step, and browser integration. A custom widget would recreate those behaviors and increase accessibility risk.

## Recommendation

Choose Option A.

### Rendering contract

- Render immediately on initial load and after each grow/reset; do not animate the essential result.
- Use `ResizeObserver` to redraw when the container’s content box changes.
- Use `devicePixelRatio` for sharp backing-store sizing, capped at 2 to bound memory on unusually dense displays.
- Clear/reset the drawing context each render and use explicit transforms/styles so state does not leak between plant parts.
- Clamp the generator model before drawing and clip the final canvas to its own frame.
- Keep the canvas fallback text synchronized with the visible report, for example: “A generated plant with tall branching, medium leaf density, and a slight right lean. Environment: …”.

### Accessibility contract

- Use native `<input type="range">` for all four sliders with explicit visible `<label>` associations.
- Show current values next to controls; use `aria-valuetext` only when the formatted unit meaning is not already clear from the label/value presentation.
- Keep a visible keyboard focus indicator and a logical tab order: controls, grow, reset, report.
- Update the report/status region on grow/reset; do not announce every slider movement because slider edits do not redraw until grow.
- Include fallback content inside the `<canvas>` and keep a visible text report because canvas pixels are not exposed as semantic HTML.
- Use `@media (prefers-reduced-motion: reduce)` to remove any decorative grow transition. The MVP must remain fully understandable with no motion.

### QA matrix

Primary viewport checks:

- 1440 × 900: wide desktop composition and canvas focal hierarchy.
- 1024 × 768: laptop-sized layout and control wrapping pressure.
- 390 × 844: mobile stacking, touch target spacing, and canvas height.

Behavioral cases:

- Initial default plant renders and report matches the default environment.
- Each slider changes its visible value and affects the next generated model.
- Grow twice with unchanged controls: report remains environmentally stable while the seeded plant varies.
- Reset restores all defaults and a valid baseline.
- All 16 four-control endpoint combinations pass bounded generator tests; visual review samples defaults, one-axis extremes, and combined extremes.
- Resize the container and verify the canvas remains within bounds and redraws without a console error.
- Tab through controls/actions, operate sliders with keyboard, and verify focus after grow/reset.
- Toggle reduced motion and verify no essential transition remains.
- Run a final smoke pass in Chromium, Firefox, and WebKit through Playwright’s browser projects when browser binaries are available.

## Evidence

- [Window.devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) — documents using device-pixel-ratio to size the backing canvas for sharper HiDPI output.
- [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) — provides element-size observation for responsive redraws rather than relying only on window resize.
- [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) — documents the 2D context and clear/draw operations used by the renderer.
- [Canvas basic usage and accessible fallback](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage) — recommends fallback content inside canvas for users who cannot experience the pixels.
- [Canvas HTML element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas) — notes that canvas content is not exposed as semantic HTML and needs fallback/accessibility support.
- [`input type="range"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range) — documents native range semantics, min/max/step, input/change events, and the implicit slider role.
- [MDN input labels](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input) — explains that explicit/implicit labels provide the accessible name and larger activation target.
- [WAI slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) — documents expected keyboard behavior and warns about touch-assistive-technology issues for custom sliders.
- [MDN slider role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/slider_role) — recommends native `<input type="range">` when it provides the needed semantics.
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) — documents the media feature for honoring the user’s reduced-motion preference.
- [Playwright best practices](https://playwright.dev/docs/best-practices) — recommends user-visible assertions and isolated tests.
- [Playwright assertions](https://playwright.dev/docs/test-assertions) — documents web-first retrying assertions suitable for status/report updates.

## Tradeoffs, risks, and mitigations

- Risk: Capping DPR at 2 sacrifices some density on very high-DPR displays. Mitigation: bound memory and keep visual sharpness sufficient for the MVP; make the cap a single constant if later testing supports a higher value.
- Risk: A text report may not describe every visual nuance. Mitigation: expose the four inputs and four broad traits; do not claim it is a full scene transcript.
- Risk: Browser-rendered canvas output can differ slightly. Mitigation: test model invariants and semantics automatically, and reserve appearance for manual visual QA.
- Risk: Updating an `aria-live` region on every grow could be noisy if animation is added later. Mitigation: only update after completed generation and keep copy concise.

## Confidence and decision

Confidence: high for the MVP architecture and accessibility baseline; medium for the exact visual breakpoint/pixel values until the layout is implemented.

Decision priority: P0.

The recommendation was explicitly approved during the research gate and is committed for FE-03 and the downstream QA tasks.
