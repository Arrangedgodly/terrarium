export interface Environment {
  humidity: number;
  sunlightHours: number;
  soilAcidity: number;
  gravity: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BranchSegment {
  from: Point;
  to: Point;
  startWidth: number;
  endWidth: number;
  depth: number;
}

export interface Leaf {
  position: Point;
  angle: number;
  size: number;
  width: number;
  depth: number;
}

export interface PlantPalette {
  stem: string;
  leaf: string;
  accent: string;
  ground: string;
}

export interface PlantTraits {
  heightRatio: number;
  branchCount: number;
  leafCount: number;
  leanDegrees: number;
  heightLabel: "short" | "medium" | "tall";
  branchingLabel: "sparse" | "balanced" | "dense";
  leafDensityLabel: "light" | "medium" | "lush";
  leanLabel: "left" | "upright" | "right";
}

export interface Plant {
  seed: number;
  segments: BranchSegment[];
  leaves: Leaf[];
  palette: PlantPalette;
  traits: PlantTraits;
}

interface NormalizedEnvironment {
  humidity: number;
  sunlight: number;
  acidity: number;
  gravity: number;
}

const MAX_SEGMENTS = 127;
const MAX_LEAVES = 128;
const DEFAULT_VIEWPORT = { width: 640, height: 640 } satisfies Viewport;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeEnvironment(environment: Environment): NormalizedEnvironment {
  const humidity = clamp(finiteOr(environment.humidity, 55), 0, 100) / 100;
  const sunlight = clamp(finiteOr(environment.sunlightHours, 12), 0, 24) / 24;
  const acidity = clamp(finiteOr(environment.soilAcidity, 6.5), 3, 9);
  const gravity = clamp(finiteOr(environment.gravity, 1), 0.2, 2);

  return {
    humidity,
    sunlight,
    acidity: (acidity - 3) / 6,
    gravity: (gravity - 0.2) / 1.8,
  };
}

function normalizeSeed(seed: number): number {
  const safeSeed = Number.isFinite(seed) ? Math.trunc(seed) : 0x5eed1234;
  return safeSeed >>> 0;
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeViewport(viewport: Viewport): Viewport {
  return {
    width: Math.max(1, finiteOr(viewport.width, DEFAULT_VIEWPORT.width)),
    height: Math.max(1, finiteOr(viewport.height, DEFAULT_VIEWPORT.height)),
  };
}

function clampPoint(point: Point, viewport: Viewport, margin: number): Point {
  return {
    x: clamp(point.x, margin, Math.max(margin, viewport.width - margin)),
    y: clamp(point.y, margin, Math.max(margin, viewport.height - margin)),
  };
}

function getHeightLabel(heightRatio: number): PlantTraits["heightLabel"] {
  if (heightRatio >= 0.56) return "tall";
  if (heightRatio >= 0.34) return "medium";
  return "short";
}

function getBranchingLabel(branchCount: number): PlantTraits["branchingLabel"] {
  if (branchCount >= 96) return "dense";
  if (branchCount >= 48) return "balanced";
  return "sparse";
}

function getLeafDensityLabel(leafCount: number): PlantTraits["leafDensityLabel"] {
  if (leafCount >= 48) return "lush";
  if (leafCount >= 24) return "medium";
  return "light";
}

function getLeanLabel(leanDegrees: number): PlantTraits["leanLabel"] {
  if (leanDegrees <= -7) return "left";
  if (leanDegrees >= 7) return "right";
  return "upright";
}

function createPalette(environment: NormalizedEnvironment, random: () => number): PlantPalette {
  const acidityHue = 92 + (environment.acidity - 0.5) * 54;
  const seedShift = (random() - 0.5) * 8;
  const leafHue = Math.round(acidityHue + seedShift);
  const stemHue = Math.round(34 + environment.humidity * 22 + seedShift * 0.4);
  const accentHue = Math.round(23 + environment.sunlight * 26 + seedShift);

  return {
    stem: `hsl(${stemHue} 31% 38%)`,
    leaf: `hsl(${leafHue} 46% 48%)`,
    accent: `hsl(${accentHue} 72% 65%)`,
    ground: `hsl(${Math.round(28 + environment.acidity * 18)} 24% 18%)`,
  };
}

export function generatePlant(
  environment: Environment,
  seed: number,
  viewport: Viewport = DEFAULT_VIEWPORT,
): Plant {
  const normalizedEnvironment = normalizeEnvironment(environment);
  const normalizedViewport = normalizeViewport(viewport);
  const normalizedSeed = normalizeSeed(seed);
  const random = createRandom(normalizedSeed);
  const scale = Math.min(normalizedViewport.width, normalizedViewport.height);
  const margin = Math.min(scale * 0.04, 16);
  const maxDepth = 4 + Math.round(normalizedEnvironment.humidity * 2);
  const segments: BranchSegment[] = [];
  const leaves: Leaf[] = [];
  const root: Point = {
    x: normalizedViewport.width / 2,
    y: normalizedViewport.height * 0.86,
  };
  const rootLength = scale * (0.18 + normalizedEnvironment.sunlight * 0.32);
  const rootAngle =
    (normalizedEnvironment.gravity - 0.5) * 0.65 + (random() - 0.5) * 0.1;
  const branchSpread = 0.24 + normalizedEnvironment.humidity * 0.38;
  const leafAspect = 0.72 + normalizedEnvironment.acidity * 0.68;
  const baseLeafSize = scale * (0.018 + normalizedEnvironment.humidity * 0.013);

  const addLeaf = (position: Point, angle: number, depth: number): void => {
    if (leaves.length >= MAX_LEAVES) return;

    const size = baseLeafSize * (0.72 + random() * 0.56);
    leaves.push({
      position,
      angle,
      size,
      width: size * leafAspect,
      depth,
    });
  };

  const grow = (from: Point, angle: number, length: number, depth: number, startWidth: number): void => {
    if (segments.length >= MAX_SEGMENTS) return;

    const gravityBend = normalizedEnvironment.gravity * depth * 0.055;
    const segmentAngle = angle + gravityBend;
    const safeLength = Math.max(scale * 0.008, length);
    const to = clampPoint(
      {
        x: from.x + Math.sin(segmentAngle) * safeLength,
        y:
          from.y - Math.cos(segmentAngle) * safeLength +
          normalizedEnvironment.gravity * safeLength * 0.1,
      },
      normalizedViewport,
      margin,
    );
    const endWidth = Math.max(0.7, startWidth * (0.68 - depth * 0.025));

    segments.push({ from, to, startWidth, endWidth, depth });

    if (depth >= maxDepth || segments.length >= MAX_SEGMENTS - 2) {
      addLeaf(to, segmentAngle + (random() - 0.5) * 0.4, depth);
      return;
    }

    const decay =
      0.62 + normalizedEnvironment.sunlight * 0.12 - normalizedEnvironment.gravity * 0.06;
    const nextLength = safeLength * decay;
    const leftAngle = segmentAngle - branchSpread * (0.78 + random() * 0.18);
    const rightAngle = segmentAngle + branchSpread * (0.78 + random() * 0.18);
    const nextWidth = endWidth;

    grow(to, leftAngle, nextLength * (0.96 + random() * 0.08), depth + 1, nextWidth);
    grow(to, rightAngle, nextLength * (0.96 + random() * 0.08), depth + 1, nextWidth);
  };

  grow(root, rootAngle, rootLength, 0, Math.max(2.4, scale * 0.016));

  const firstSegment = segments[0];
  const highestY = segments.reduce(
    (minimum, segment) => Math.min(minimum, segment.from.y, segment.to.y),
    root.y,
  );
  const heightRatio = clamp((root.y - highestY) / normalizedViewport.height, 0, 1);
  const leanDegrees = firstSegment
    ? clamp(
        (Math.atan2(firstSegment.to.x - firstSegment.from.x, firstSegment.from.y - firstSegment.to.y) *
          180) /
          Math.PI,
        -90,
        90,
      )
    : 0;
  const palette = createPalette(normalizedEnvironment, random);
  const traits: PlantTraits = {
    heightRatio,
    branchCount: segments.length,
    leafCount: leaves.length,
    leanDegrees,
    heightLabel: getHeightLabel(heightRatio),
    branchingLabel: getBranchingLabel(segments.length),
    leafDensityLabel: getLeafDensityLabel(leaves.length),
    leanLabel: getLeanLabel(leanDegrees),
  };

  return {
    seed: normalizedSeed,
    segments,
    leaves,
    palette,
    traits,
  };
}
