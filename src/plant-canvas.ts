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
  resize: () => void;
  destroy: () => void;
}

const MODEL_SIZE = 640;
const DPR_CAP = 2;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
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
): void {
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
  context.globalAlpha = 0.16;
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
  context.globalAlpha = 0.8;
  context.fill();
  context.globalAlpha = 0.4;
  context.strokeStyle = plant.palette.accent;
  context.lineWidth = 1;
  context.stroke();
  context.globalAlpha = 1;
}

function drawSegments(
  context: CanvasRenderingContext2D,
  plant: Plant,
  cssWidth: number,
  cssHeight: number,
): void {
  const scale = Math.min(cssWidth, cssHeight) / MODEL_SIZE;

  for (const segment of plant.segments) {
    const from = mapPoint(segment.from, cssWidth, cssHeight);
    const to = mapPoint(segment.to, cssWidth, cssHeight);
    const averageWidth = (segment.startWidth + segment.endWidth) / 2;

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.lineCap = "round";
    context.strokeStyle = plant.palette.stem;
    context.globalAlpha = clamp(0.92 - segment.depth * 0.055, 0.56, 0.92);
    context.lineWidth = Math.max(0.8, averageWidth * scale);
    context.stroke();
  }

  context.globalAlpha = 1;
}

function drawLeaves(
  context: CanvasRenderingContext2D,
  plant: Plant,
  cssWidth: number,
  cssHeight: number,
): void {
  const scale = Math.min(cssWidth, cssHeight) / MODEL_SIZE;

  for (const leaf of plant.leaves) {
    const position = mapPoint(leaf.position, cssWidth, cssHeight);
    const size = leaf.size * scale;
    const width = leaf.width * scale;

    context.save();
    context.translate(position.x, position.y);
    context.rotate(leaf.angle);
    context.beginPath();
    context.moveTo(-size * 0.78, 0);
    context.quadraticCurveTo(-size * 0.2, -width * 0.78, size * 0.84, 0);
    context.quadraticCurveTo(-size * 0.2, width * 0.78, -size * 0.78, 0);
    context.closePath();
    context.fillStyle = plant.palette.leaf;
    context.globalAlpha = clamp(0.66 + leaf.depth * 0.045, 0.66, 0.94);
    context.fill();
    context.strokeStyle = plant.palette.accent;
    context.lineWidth = Math.max(0.65, 0.9 * scale);
    context.globalAlpha = 0.7;
    context.stroke();
    context.restore();
  }

  context.globalAlpha = 1;
}

export function drawPlant(
  context: CanvasRenderingContext2D,
  plant: Plant,
  cssWidth: number,
  cssHeight: number,
): void {
  context.save();
  context.beginPath();
  context.rect(0, 0, cssWidth, cssHeight);
  context.clip();
  context.clearRect(0, 0, cssWidth, cssHeight);
  drawGround(context, plant, cssWidth, cssHeight);
  drawSegments(context, plant, cssWidth, cssHeight);
  drawLeaves(context, plant, cssWidth, cssHeight);
  context.restore();
}

export function createPlantCanvasRenderer(
  canvas: HTMLCanvasElement,
  initialPlant: Plant,
): PlantCanvasRenderer {
  let plant = initialPlant;
  let observer: ResizeObserver | undefined;
  const ownerWindow = canvas.ownerDocument.defaultView;

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
    drawPlant(context, plant, backingStore.cssWidth, backingStore.cssHeight);
    canvas.dataset.rendered = "true";
    canvas.dataset.cssWidth = String(Math.round(backingStore.cssWidth));
    canvas.dataset.cssHeight = String(Math.round(backingStore.cssHeight));
    canvas.dataset.seed = String(plant.seed);
    canvas.setAttribute(
      "aria-label",
      `Current seeded plant visualization with ${plant.traits.branchingLabel} branching and ${plant.traits.leafDensityLabel} leaves.`,
    );
  };

  const setPlant = (nextPlant: Plant): void => {
    plant = nextPlant;
    resize();
  };

  const destroy = (): void => {
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

  return { setPlant, resize, destroy };
}
