# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Vanilla TypeScript with Vite, Vitest, Playwright Test, and pnpm, as approved in the Ultron research gate.

## Users

Inferred from the approved brief: curious, visually oriented desktop and mobile-web users who want a short creative experiment with generative art, plants, and environmental inputs. A secondary audience is developers and designers inspecting a polished procedural-graphics example.

## Product Purpose

The Algorithmic Terrarium lets users adjust humidity, sunlight hours, soil acidity, and gravity, then grow a distinct seeded digital plant shaped by those conditions. Success means users understand the cause-and-effect relationship, can create several coherent variations quickly, and can use the core loop without setup or technical knowledge.

## Positioning

Inferred from the approved brief: the product makes procedural generation tangible through a small environmental control surface and an immediately visible plant, pairing a visual canvas with a plain-language report instead of hiding the mechanism behind a technical grammar editor.

## Operating Context

Users arrive for a self-contained, local browser experience. They explore by adjusting four controls, press Grow plant to create a new seeded result, compare variations, and use Reset defaults to return to a known baseline. Evaluation includes first-use clarity, responsive behavior, keyboard operation, and canvas/text equivalence.

## Capabilities and Constraints

- Single-page, responsive, local-only MVP.
- Four native environmental controls: humidity, sunlight hours, soil acidity, and gravity.
- Seeded procedural plant generation rendered on an HTML5 canvas.
- Visible environment values, broad generated-trait report, grow action, and reset action.
- No accounts, persistence, collaboration, sharing, export, gallery, backend, analytics, or advanced editor in the MVP.
- Plant output is stylized and procedural; it must not make claims of botanical accuracy.
- Canvas cannot be the only representation of state; controls and report must remain semantic and accessible.

## Brand Commitments

- Product name: The Algorithmic Terrarium.
- Inferred voice: calm, experimental, and slightly magical; clear enough to explain cause and effect without sounding scientific or clinical.
- Explicit visual cue from the brief: a sleek dashboard with a dark terrarium surface and high-contrast controls.
- No existing logo, typeface, imagery, testimonials, or commercial proof assets are available; future work must not fabricate them.

## Evidence on Hand

- Approved product brief: `docs/ultron/town-hall.md`.
- Approved interaction contract: `docs/ultron/product-contract.md`.
- Approved research records: `docs/ultron/research/`.
- No existing application code or visual system.

## Product Principles

- Make the mechanism visible: environmental inputs should have recognizable visual consequences.
- Keep variation coherent: seeded novelty should remain within the current environment’s character.
- Make the canvas legible to everyone: semantic controls and text reporting are first-class output.
- Prefer a short, repeatable creative loop over feature breadth.

## Accessibility & Inclusion

The MVP must support keyboard operation, visible focus, explicit labels and values for native range controls, reduced-motion preferences, and a text equivalent for the canvas/report. Accessibility is part of the product promise because the plant pixels alone cannot communicate the complete state.
