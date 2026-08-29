# The Algorithmic Terrarium — Product Interaction Contract

Status: approved by user for UX-01

This contract freezes the MVP interaction behavior approved in the plan and research phases. It does not claim botanical accuracy; the values shape a stylized procedural plant.

## Controls

| Control | Range | Step | Default | Display |
| --- | ---: | ---: | ---: | --- |
| Humidity | 0–100% | 1 | 55% | percentage |
| Sunlight hours | 0–24 hours | 1 | 12 hours | hours |
| Soil acidity | pH 3.0–9.0 | 0.1 | pH 6.5 | one decimal |
| Gravity | 0.2–2.0g | 0.1 | 1.0g | one decimal |

Each control uses a native range input with an explicit visible label, current value, keyboard operation, and visible focus state.

## Interaction behavior

1. Initial load shows a valid default plant and the default environment values.
2. Slider edits update the displayed values immediately but do not replace the current plant.
3. “Grow plant” generates a new plant using the current environment and a new internal seed. Repeated grows with unchanged inputs vary in detail while preserving the environment’s broad visual character.
4. “Reset defaults” restores the four defaults above and generates a valid baseline plant.
5. The report updates after grow/reset, not on every slider movement.
6. No essential information depends on animation; reduced-motion users receive the same result without a decorative transition.

## Trait mapping contract

- Humidity influences branch fullness and leaf density.
- Sunlight hours influence trunk height and upward growth bias.
- Soil acidity influences a stylized palette tint and leaf aspect; this is an artistic interpretation, not a claim about real plant physiology.
- Gravity influences branch droop, overall lean, and downward angle bias.
- Seed influences bounded angle jitter, branch selection, leaf placement, and small palette variation.

## Report vocabulary

The visible report and canvas fallback expose:

- the four current environment values;
- height: short, medium, or tall;
- branching: sparse, balanced, or dense;
- leaf density: light, medium, or lush;
- lean: left, upright, or right with a restrained degree description.

Trait labels derive from generated geometry, not only from the input sliders. Copy should use “generated,” “stylized,” and “visual interpretation” language rather than botanical claims.

## Acceptance checks

- All four controls have the exact range/default contract above.
- Slider edits do not redraw until grow.
- Grow changes the seed and plant without reloading the page.
- Reset restores defaults and a valid baseline.
- The report is concise, visible, and available as text fallback for the canvas.
- Keyboard focus remains visible and logical after grow/reset.
