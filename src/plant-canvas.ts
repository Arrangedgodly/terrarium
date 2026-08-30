import type { Plant, Point } from "./generator.ts";

export interface CanvasBackingStore {
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  devicePixelRatio: number;
}

export interface PlantCanvasRenderer {
  setPlant: (plant: Plant) => void;
  setGhosts: (ghosts: readonly Plant[]) => void;
  growPlant: (plant: Plant) => void;
  resize: () => void;
  destroy: () => void;
}

const MODEL_SIZE = 640;
const DPR_CAP = 2;
const MIN_STROKE_CSS_PX = 1.5;

/**
 * The witnessed-growth moment: after a Grow press the specimen develops over
 * ~600ms instead of appearing fully formed. Generation stays deterministic and
 * outside the loop; only the render phase animates.
 */
export const GROWTH_DURATION_MS = 600;

export interface MediaQueryCapableView {
  matchMedia: (query: string) => { matches: boolean };
}

/**
 * The CSS kill switch (styles.css) cannot see canvas rAF loops, so the grow-in
 * asks the same media query directly. With no view to ask, motion stays on:
 * reduced motion is an opt-out, and growPlant separately falls back to an
 * immediate render when the canvas has no usable window.
 */
export function prefersReducedMotion(view: MediaQueryCapableView | null | undefined): boolean {
  return view?.matchMedia("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Natural deceleration (the cubic-bezier(0.16, 1, 0.3, 1) family): growth
 * leaves the ground quickly and settles into its final posture. No bounce.
 */
export function easeGrow(t: number): number {
  return 1 - (1 - clamp(t, 0, 1)) ** 4;
}

// Staging windows on the normalized growth clock t ∈ [0, 1]. The ground wakes
// first, each branch depth starts once its parent is extending, leaves unfurl
// behind their branch, and sun-fed buds land as the finale. Every window
// closes at or before t = 1 so the settled frame is exactly the static render.
const GROUND_WINDOW = 0.4;
const SEGMENT_WINDOW = 0.46;
const STEM_PHASE_END = 0.56;
const LEAF_WINDOW = 0.4;
const LEAF_PHASE_END = 0.58;
const BUD_START = 0.64;
const BUD_WINDOW = 0.36;

function stageProgress(t: number, start: number, window: number): number {
  if (window <= 0) return t >= start ? 1 : 0;
  return clamp((t - start) / window, 0, 1);
}

function stagedStart(depth: number, levels: number, phaseStart: number, phaseEnd: number): number {
  return phaseStart + (phaseEnd - phaseStart) * (depth / levels);
}

/** Ground, glow, and root ring visibility during the grow-in. */
export function getGroundGrowth(t: number): number {
  return easeGrow(stageProgress(t, 0, GROUND_WINDOW));
}

/**
 * Extension progress for a branch segment: depth 0 rises first, deeper
 * branches follow while their parent is still extending.
 */
export function getSegmentGrowth(t: number, depth: number, maxDepth: number): number {
  const levels = Math.max(1, maxDepth + 1);
  const start = stagedStart(depth, levels, 0.02, STEM_PHASE_END);
  return easeGrow(stageProgress(t, start, SEGMENT_WINDOW));
}

/**
 * Unfurl progress for a leaf. Fruit buds are the finale: they wait until the
 * canopy has arrived.
 */
export function getLeafGrowth(t: number, depth: number, maxDepth: number, bud: boolean): number {
  if (bud) return easeGrow(stageProgress(t, BUD_START, BUD_WINDOW));
  const levels = Math.max(1, maxDepth + 1);
  const start = stagedStart(depth, levels, 0.34, LEAF_PHASE_END);
  return easeGrow(stageProgress(t, start, LEAF_WINDOW));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

// Ghost memory: the session's previous specimens linger in the chamber as faint
// traces behind the live one — comparison without a gallery, history without
// persistence. Recency is the alpha ramp: the most recent departure stays the
// most visible, the oldest is barely a breath, and every value sits far below
// the live specimen's 0.7–0.95 tissue alphas so a ghost never competes with it.
const GHOST_ALPHA_RAMP = [0.08, 0.12, 0.17] as const;

/** Resting trace alpha by position (oldest first); the newest ghost is the most visible. */
export function getGhostAlpha(index: number, total: number): number {
  if (total <= 0) return 0;
  // While the history is filling, use the newest alphas; beyond the ramp, the
  // oldest traces share the faintest value.
  const shift = GHOST_ALPHA_RAMP.length - total;
  return GHOST_ALPHA_RAMP[
    Math.min(GHOST_ALPHA_RAMP.length - 1, Math.max(0, index + shift))
  ];
}

const GHOST_DIM_WINDOW = 0.25;

/**
 * How far the newest ghost has dimmed from live visibility into its resting
 * trace over the first stretch of the grow-in clock: t = 0 keeps the frame
 * continuous with the moment of the press (the old specimen is still fully
 * there), and by a quarter of the clock it has settled into a trace while the
 * new seedling rises. Rides the existing grow clock — no loop of its own.
 */
export function getGhostDim(t: number): number {
  return easeGrow(clamp(t / GHOST_DIM_WINDOW, 0, 1));
}

export function getStrokeWidth(modelWidth: number, scale: number): number {
  return Math.max(MIN_STROKE_CSS_PX, modelWidth * scale);
}

function safeDimension(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getCanvasBackingStore(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
): CanvasBackingStore {
  const width = safeDimension(cssWidth, MODEL_SIZE);
  const height = safeDimension(cssHeight, MODEL_SIZE);
  const dpr = clamp(safeDimension(devicePixelRatio, 1), 1, DPR_CAP);

  return {
    cssWidth: width,
    cssHeight: height,
    pixelWidth: Math.max(1, Math.round(width * dpr)),
    pixelHeight: Math.max(1, Math.round(height * dpr)),
    devicePixelRatio: dpr,
  };
}

function mapPoint(point: Point, cssWidth: number, cssHeight: number): Point {
  return {
    x: (point.x / MODEL_SIZE) * cssWidth,
    y: (point.y / MODEL_SIZE) * cssHeight,
  };
}

function drawGround(
  context: CanvasRenderingContext2D,
  plant: Plant,
  cssWidth: number,
  cssHeight: number,
  growth: number,
): void {
  const groundGrowth = growth >= 1 ? 1 : getGroundGrowth(growth);
  if (groundGrowth <= 0) return;

  const canopyGlow = context.createRadialGradient(
    cssWidth * 0.5,
    cssHeight * 0.52,
    0,
    cssWidth * 0.5,
    cssHeight * 0.52,
    cssWidth * 0.34,
  );
  canopyGlow.addColorStop(0, plant.palette.accent);
  canopyGlow.addColorStop(1, "transparent");
  context.fillStyle = canopyGlow;
  context.globalAlpha = 0.1 * groundGrowth;
  context.fillRect(0, 0, cssWidth, cssHeight);

  const glow = context.createRadialGradient(
    cssWidth * 0.5,
    cssHeight * 0.76,
    0,
    cssWidth * 0.5,
    cssHeight * 0.76,
    cssWidth * 0.42,
  );
  glow.addColorStop(0, plant.palette.leaf);
  glow.addColorStop(1, plant.palette.ground);
  context.fillStyle = glow;
  context.globalAlpha = 0.2 * groundGrowth;
  context.fillRect(0, 0, cssWidth, cssHeight);
  context.globalAlpha = 1;

  context.beginPath();
  context.ellipse(
    cssWidth * 0.5,
    cssHeight * 0.86,
    cssWidth * 0.28,
    Math.max(5, cssHeight * 0.025),
    0,
    0,
    Math.PI * 2,
  );
  context.fillStyle = plant.palette.ground;
  context.globalAlpha = 0.8 * groundGrowth;
  context.fill();
  context.globalAlpha = 0.5 * groundGrowth;
  context.strokeStyle = plant.palette.accent;
  context.lineWidth = 1.25;
  context.stroke();
  context.globalAlpha = 1;
}

function drawSegments(
  context: CanvasRenderingContext2D,
  plant: Plant,
  cssWidth: number,
  cssHeight: number,
  growth: number,
  alphaScale = 1,
): void {
  const scale = Math.min(cssWidth, cssHeight) / MODEL_SIZE;
  const growing = growth < 1;
  const maxDepth = growing
    ? plant.segments.reduce((deepest, segment) => Math.max(deepest, segment.depth), 0)
    : 0;

  for (const segment of plant.segments) {
    const from = mapPoint(segment.from, cssWidth, cssHeight);
    const to = mapPoint(segment.to, cssWidth, cssHeight);
    const averageWidth = (segment.startWidth + segment.endWidth) / 2;
    let tip = to;
    let alpha = clamp(0.94 - segment.depth * 0.05, 0.7, 0.94);

    if (growing) {
      const progress = getSegmentGrowth(growth, segment.depth, maxDepth);
      if (progress <= 0) continue;
      if (progress < 1) {
        tip = {
          x: from.x + (to.x - from.x) * progress,
          y: from.y + (to.y - from.y) * progress,
        };
        alpha *= 0.35 + 0.65 * progress;
      }
    }

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(tip.x, tip.y);
    context.lineCap = "round";
    context.strokeStyle = plant.palette.stem;
    context.globalAlpha = alpha * alphaScale;
    context.lineWidth = getStrokeWidth(averageWidth, scale);
    context.stroke();
  }

  context.globalAlpha = 1;
}

function drawLeaves(
  context: CanvasRenderingContext2D,
  plant: Plant,
  cssWidth: number,
  cssHeight: number,
  growth: number,
  alphaScale = 1,
): void {
  const scale = Math.min(cssWidth, cssHeight) / MODEL_SIZE;
  const growing = growth < 1;
  const maxDepth = growing
    ? plant.leaves.reduce((deepest, leaf) => Math.max(deepest, leaf.depth), 0)
    : 0;

  for (const leaf of plant.leaves) {
    const position = mapPoint(leaf.position, cssWidth, cssHeight);
    const size = leaf.size * scale;
    const width = leaf.width * scale;
    let angle = leaf.angle;
    let unfurl = 1;

    if (growing) {
      const progress = getLeafGrowth(growth, leaf.depth, maxDepth, leaf.bud);
      if (progress <= 0) continue;
      if (progress < 1) {
        angle -= (1 - progress) * 0.35;
        unfurl = progress;
      }
    }

    context.save();
    context.translate(position.x, position.y);
    context.rotate(angle);

    if (leaf.bud) {
      context.beginPath();
      context.arc(-size * unfurl * 0.3, 0, Math.max(2.2, size * unfurl * 0.32) * unfurl, 0, Math.PI * 2);
      context.fillStyle = plant.palette.accent;
      context.globalAlpha = 0.95 * unfurl * alphaScale;
      context.fill();
      context.restore();
      continue;
    }

    context.beginPath();
    context.moveTo(-size * unfurl * 0.78, 0);
    context.quadraticCurveTo(-size * unfurl * 0.2, -width * unfurl * 0.78, size * unfurl * 0.84, 0);
    context.quadraticCurveTo(-size * unfurl * 0.2, width * unfurl * 0.78, -size * unfurl * 0.78, 0);
    context.closePath();
    context.fillStyle = plant.palette.leaf;
    context.globalAlpha = clamp(0.74 + leaf.depth * 0.04, 0.74, 0.95) * unfurl * alphaScale;
    context.fill();
    context.strokeStyle = plant.palette.accent;
    context.lineWidth = Math.max(1.2, 1.5 * scale);
    context.globalAlpha = 0.85 * unfurl * alphaScale;
    context.stroke();
    context.restore();
  }

  context.globalAlpha = 1;
}

/**
 * Draws a previous specimen as a settled ghost trace at `alphaScale` — the same
 * geometry and palette as the static render (growth 1, no ground, no glow), so
 * a ghost is exactly its specimen at a whisper. Never animated on its own.
 */
function drawGhostTissue(
  context: CanvasRenderingContext2D,
  plant: Plant,
  cssWidth: number,
  cssHeight: number,
  alphaScale: number,
): void {
  context.save();
  context.beginPath();
  context.rect(0, 0, cssWidth, cssHeight);
  context.clip();
  drawSegments(context, plant, cssWidth, cssHeight, 1, alphaScale);
  drawLeaves(context, plant, cssWidth, cssHeight, 1, alphaScale);
  context.restore();
}

export function createPlantCanvasRenderer(
  canvas: HTMLCanvasElement,
  initialPlant: Plant,
): PlantCanvasRenderer {
  let plant = initialPlant;
  let ghostPlants: Plant[] = [];
  let observer: ResizeObserver | undefined;
  let animationFrame: number | undefined;
  let growthProgress = 1;
  let cssWidth = MODEL_SIZE;
  let cssHeight = MODEL_SIZE;
  const ownerWindow = canvas.ownerDocument.defaultView;

  /**
   * The chamber's full frame: the live specimen's ground world, then the ghost
   * traces of the session's previous specimens behind it — oldest furthest back,
   * newest nearest, the newest still dimming into its trace during a grow-in —
   * and the live specimen last, always the vivid one on top.
   */
  const drawScene = (context: CanvasRenderingContext2D, growth: number): void => {
    const t = clamp(growth, 0, 1);
    context.save();
    context.beginPath();
    context.rect(0, 0, cssWidth, cssHeight);
    context.clip();
    context.clearRect(0, 0, cssWidth, cssHeight);
    drawGround(context, plant, cssWidth, cssHeight, t);
    for (let index = 0; index < ghostPlants.length; index += 1) {
      const restingAlpha = getGhostAlpha(index, ghostPlants.length);
      const dimming = index === ghostPlants.length - 1 && t < 1;
      const alphaScale = dimming
        ? restingAlpha + (1 - restingAlpha) * (1 - getGhostDim(t))
        : restingAlpha;
      drawGhostTissue(context, ghostPlants[index], cssWidth, cssHeight, alphaScale);
    }
    drawSegments(context, plant, cssWidth, cssHeight, t);
    drawLeaves(context, plant, cssWidth, cssHeight, t);
    context.restore();
  };

  const syncGhostDataset = (): void => {
    canvas.dataset.ghostCount = String(ghostPlants.length);
    canvas.dataset.ghostSeeds = ghostPlants.map((ghost) => ghost.seed.toString(16)).join(",");
  };

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const backingStore = getCanvasBackingStore(
      rect.width || canvas.clientWidth,
      rect.height || canvas.clientHeight,
      ownerWindow?.devicePixelRatio ?? 1,
    );
    const context = canvas.getContext("2d");

    canvas.width = backingStore.pixelWidth;
    canvas.height = backingStore.pixelHeight;
    canvas.dataset.rendered = "false";
    cssWidth = backingStore.cssWidth;
    cssHeight = backingStore.cssHeight;

    if (!context) return;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, backingStore.pixelWidth, backingStore.pixelHeight);
    context.setTransform(
      backingStore.devicePixelRatio,
      0,
      0,
      backingStore.devicePixelRatio,
      0,
      0,
    );
    drawScene(context, growthProgress);
    canvas.dataset.rendered = "true";
    canvas.dataset.cssWidth = String(Math.round(cssWidth));
    canvas.dataset.cssHeight = String(Math.round(cssHeight));
    canvas.dataset.seed = String(plant.seed);
    canvas.setAttribute(
      "aria-label",
      `Current seeded plant visualization with ${plant.traits.branchingLabel} branching and ${plant.traits.leafDensityLabel} leaf density.`,
    );
  };

  const stopGrowthAnimation = (): void => {
    if (animationFrame !== undefined && ownerWindow) {
      ownerWindow.cancelAnimationFrame(animationFrame);
    }
    animationFrame = undefined;
  };

  const renderGrowthFrame = (): void => {
    const context = canvas.getContext("2d");
    if (!context) {
      growthProgress = 1;
      return;
    }
    drawScene(context, growthProgress);
  };

  const startGrowthAnimation = (view: Window): void => {
    const startedAt = view.performance.now();

    const step = (now: number): void => {
      growthProgress = clamp((now - startedAt) / GROWTH_DURATION_MS, 0, 1);
      renderGrowthFrame();

      if (growthProgress < 1) {
        animationFrame = view.requestAnimationFrame(step);
      } else {
        animationFrame = undefined;
      }
    };

    animationFrame = view.requestAnimationFrame(step);
  };

  const setPlant = (nextPlant: Plant): void => {
    stopGrowthAnimation();
    growthProgress = 1;
    plant = nextPlant;
    resize();
  };

  /**
   * Sets the chamber's ghost history (oldest first) and redraws at the current
   * growth state. Ghosts are static, decorative traces — they never grow in —
   * and the history lives only here, in memory: a fresh page starts with none.
   */
  const setGhosts = (ghosts: readonly Plant[]): void => {
    ghostPlants = [...ghosts];
    syncGhostDataset();
    const context = canvas.getContext("2d");
    if (context) drawScene(context, growthProgress);
  };

  /**
   * Sets the specimen and grows it in over ~600ms. Safe to call at any time:
   * an in-progress grow is cancelled first, so rapid re-Grow or Reset restarts
   * from the new seed with one loop and no half-grown leftovers. A hidden tab
   * self-settles — the clock is elapsed-time based, so the next frame after
   * visibility returns draws the finished specimen and stops the loop. Under
   * prefers-reduced-motion (or without a usable window) the final specimen is
   * rendered immediately.
   */
  const growPlant = (nextPlant: Plant): void => {
    stopGrowthAnimation();
    plant = nextPlant;

    if (!ownerWindow || prefersReducedMotion(ownerWindow)) {
      growthProgress = 1;
      resize();
      return;
    }

    growthProgress = 0;
    resize();
    startGrowthAnimation(ownerWindow);
  };

  const destroy = (): void => {
    stopGrowthAnimation();
    observer?.disconnect();
    ownerWindow?.removeEventListener("resize", resize);
  };

  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
  } else {
    ownerWindow?.addEventListener("resize", resize);
  }

  resize();
  syncGhostDataset();

  return { setPlant, setGhosts, growPlant, resize, destroy };
}
