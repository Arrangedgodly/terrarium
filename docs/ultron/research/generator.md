# R-02 — Procedural Generator Choice

Status: committed; user approval recorded
Priority: P0
Affected tasks: R-02, FE-02, FE-03, FE-04, QA-01
Date: 2026-08-25

## Question

Which lightweight procedural method makes humidity, sunlight, soil acidity, and gravity visibly meaningful while keeping output deterministic, bounded, and easy to summarize?

## Constraints and evaluation criteria

- A fixed environment plus fixed seed must reproduce the same plant.
- Repeated grows with unchanged inputs must vary by seed without becoming incoherent noise.
- Every supported slider endpoint and representative combination must render safely.
- Each environmental input must influence a visible trait and the report.
- The generator should have no package dependency and should be straightforward to unit test.
- The MVP is stylized digital flora, not botanical simulation.

## Options considered

### Option A — Full L-system grammar/runtime

Fit: High for plant-like branching. L-systems have a strong history in procedural plant modeling and can express self-similar branching compactly.

User/developer impact: The algorithm is conceptually aligned with the product, but direct mappings from four sliders to grammar rules, branch bounds, leaf placement, and reportable traits require more design work than the MVP needs.

Effort/maintenance: Medium-high if a grammar interpreter or package is introduced; lower if a small interpreter is built, but that still adds a domain-specific layer.

Prefer it if: Later scope needs species grammars, multi-stage growth, formal rule editing, or a collection of plant families.

### Option B — Custom seeded recursive branching/turtle geometry (recommended)

Fit: High for this MVP. A trunk/branch recursion can directly map environmental values to height, branching, leaf density, angle, and droop, while a seeded PRNG supplies bounded variation.

User/developer impact: Cause-and-effect is legible: sunlight can affect reach/upward bias, humidity can affect branch/leaf fullness, soil acidity can affect stylized palette/leaf aspect, and gravity can affect droop/lean.

Effort/maintenance: Low-medium. It is a small pure module with explicit limits and no external dependency. The tradeoff is less expressive than a general grammar system.

Prefer it if: The product prioritizes clear controls, fast implementation, and deterministic testing over formal botanical modeling.

### Option C — Pure fractal/IFS pattern

Fit: Medium. It is easy to bound and deterministic, but tends to produce repeated self-similarity and offers fewer natural places to attach reportable traits such as leaves and lean.

Prefer it if: The product’s visual goal becomes abstract mathematical forms rather than digital plants.

## Recommendation

Choose Option B: a custom seeded recursive branching generator with a turtle-like drawing model. Do not add an L-system package in the MVP. Keep the model/render boundary explicit so an L-system grammar can replace the generator later without changing controls or accessibility surfaces.

### Proposed model contract

Input:

```text
environment = {
  humidity: 0..100,
  sunlightHours: 0..24,
  soilAcidity: 3..9,
  gravity: 0.2..2.0
}
seed: integer
viewport: { width, height }
```

Output:

```text
plant = {
  segments: bounded list of line/curve commands,
  leaves: bounded list of leaf commands,
  palette: local color tokens,
  traits: { heightRatio, branchCount, leafCount, leanDegrees }
}
```

Mapping defaults:

- Sunlight controls trunk height and upward growth bias.
- Humidity controls branch fullness and leaf density.
- Gravity controls droop, lean, and downward angle bias.
- Soil acidity controls a stylized palette/leaf-aspect axis, explicitly described as visual interpretation rather than botanical fact.
- Seed controls angle jitter, branch selection, leaf placement, and small palette variation within safe ranges.

Safety bounds:

- Maximum recursion depth: 6.
- Maximum child branches per node: 2.
- Maximum segment/branch nodes: 127 for a full binary depth-6 walk before leaves and decoration.
- Add a command budget and an early return guard so future mapping changes cannot create runaway work.
- Normalize all inputs before geometry math and clamp final positions to the drawing frame.

The depth bound was sanity-checked with a disposable Node.js 24.9.0 spike: a full binary recursion at depth 6 produces 127 nodes. This is a bound check only, not production implementation or a visual quality judgment.

Trait reporting should derive values from generated geometry, not duplicate control values: height ratio from the highest segment, branch count from emitted branch nodes, leaf count from emitted leaves, and lean from the trunk/centroid vector. This keeps the report honest when the generator evolves.

## Evidence

- [Developmental Models of Herbaceous Plants for Computer Imagery Purposes](https://algorithmicbotany.org/papers/developmental.sig1988.html) — describes a formal L-system method for modeling plant architecture, leaves, and flowers; this supports L-systems as a credible alternative while not requiring them for this MVP.
- [Modeling plant growth and development](https://www.sciencedirect.com/science/article/abs/pii/S1369526603001389) — summarizes L-systems as an established methodology for simulating branching architecture; this supports the alternative’s domain fit.
- [The Algorithmic Beauty of Plants PDF](https://www.algorithmicbotany.org/papers/lsfp.pdf) — primary reference material for plant modeling with L-systems and geometric interpretations.
- [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) — documents the browser 2D drawing context and bounded path/line operations used by the recommended render model.

## Tradeoffs, risks, and mitigations

- Risk: The output may look like stylized trees rather than varied plants. Mitigation: vary leaf silhouette, palette, branch taper, and baseline posture through controlled seed/environment mappings; review visually during production.
- Risk: Soil acidity could imply a false scientific relationship. Mitigation: call the mapping a visual “acidic/alkaline tint” in helper text/report copy and avoid claims about real plant physiology.
- Risk: A custom generator can accumulate special cases. Mitigation: keep the model pure, cap commands, test each input independently, and postpone flowers/species grammars.
- Risk: The algorithm may not satisfy “completely unique” literally. Mitigation: product copy says “new seeded plant” or “distinct generated plant,” not mathematical uniqueness.

## Confidence and decision

Confidence: high for the MVP outcome; medium for final visual quality until a production spike is rendered.

Decision priority: P0.

The recommendation was explicitly approved during the research gate and is committed for FE-02.
