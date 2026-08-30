import { describe, expect, it } from "vitest";
import { generatePlant, type Environment, type Plant, type Point, type Viewport } from "./generator";

const baseline: Environment = {
  humidity: 55,
  sunlightHours: 12,
  soilAcidity: 6.5,
  gravity: 1,
};

const viewport: Viewport = { width: 640, height: 640 };

function expectFinitePoint(point: Point): void {
  expect(Number.isFinite(point.x)).toBe(true);
  expect(Number.isFinite(point.y)).toBe(true);
}

function expectSafePlant(plant: Plant, currentViewport: Viewport): void {
  expect(plant.segments.length).toBeGreaterThan(0);
  expect(plant.segments.length).toBeLessThanOrEqual(127);
  expect(plant.leaves.length).toBeGreaterThan(0);
  expect(plant.leaves.length).toBeLessThanOrEqual(128);

  for (const segment of plant.segments) {
    expectFinitePoint(segment.from);
    expectFinitePoint(segment.to);
    expect(segment.from.x).toBeGreaterThanOrEqual(0);
    expect(segment.from.x).toBeLessThanOrEqual(currentViewport.width);
    expect(segment.from.y).toBeGreaterThanOrEqual(0);
    expect(segment.from.y).toBeLessThanOrEqual(currentViewport.height);
    expect(segment.to.x).toBeGreaterThanOrEqual(0);
    expect(segment.to.x).toBeLessThanOrEqual(currentViewport.width);
    expect(segment.to.y).toBeGreaterThanOrEqual(0);
    expect(segment.to.y).toBeLessThanOrEqual(currentViewport.height);
    expect(Number.isFinite(segment.startWidth)).toBe(true);
    expect(Number.isFinite(segment.endWidth)).toBe(true);
    expect(segment.startWidth).toBeGreaterThanOrEqual(1.5);
    expect(segment.endWidth).toBeGreaterThanOrEqual(1.5);
  }

  for (const leaf of plant.leaves) {
    expectFinitePoint(leaf.position);
    expect(leaf.position.x).toBeGreaterThanOrEqual(0);
    expect(leaf.position.x).toBeLessThanOrEqual(currentViewport.width);
    expect(leaf.position.y).toBeGreaterThanOrEqual(0);
    expect(leaf.position.y).toBeLessThanOrEqual(currentViewport.height);
    expect(Number.isFinite(leaf.angle)).toBe(true);
    expect(Number.isFinite(leaf.size)).toBe(true);
    expect(Number.isFinite(leaf.width)).toBe(true);
    expect(typeof leaf.bud).toBe("boolean");
  }
}

function parsePaletteColor(
  color: string,
): { hue: number; saturation: number; lightness: number } {
  const match = /^hsl\((-?\d+) (-?\d+)% (-?\d+)%\)$/.exec(color);

  if (!match) {
    throw new Error(`Unparseable palette color: ${color}`);
  }

  return {
    hue: Number(match[1]),
    saturation: Number(match[2]),
    lightness: Number(match[3]),
  };
}

describe("generatePlant", () => {
  it("repeats exactly for a fixed environment, seed, and viewport", () => {
    const first = generatePlant(baseline, 42, viewport);
    const second = generatePlant(baseline, 42, viewport);

    expect(second).toEqual(first);
  });

  it("produces a distinct bounded result for a different seed", () => {
    const first = generatePlant(baseline, 42, viewport);
    const second = generatePlant(baseline, 43, viewport);

    expect(second).not.toEqual(first);
    expectSafePlant(first, viewport);
    expectSafePlant(second, viewport);
  });

  it("maps each environmental control to an observable output", () => {
    const dry = generatePlant({ ...baseline, humidity: 0 }, 42, viewport);
    const lush = generatePlant({ ...baseline, humidity: 100 }, 42, viewport);
    const lowSun = generatePlant({ ...baseline, sunlightHours: 0 }, 42, viewport);
    const highSun = generatePlant({ ...baseline, sunlightHours: 24 }, 42, viewport);
    const acidic = generatePlant({ ...baseline, soilAcidity: 3 }, 42, viewport);
    const alkaline = generatePlant({ ...baseline, soilAcidity: 9 }, 42, viewport);
    const lowGravity = generatePlant({ ...baseline, gravity: 0.2 }, 42, viewport);
    const highGravity = generatePlant({ ...baseline, gravity: 2 }, 42, viewport);

    expect(lush.traits.branchCount).toBeGreaterThan(dry.traits.branchCount);
    expect(lush.traits.leafCount).toBeGreaterThan(dry.traits.leafCount);
    expect(highSun.traits.heightRatio).toBeGreaterThan(lowSun.traits.heightRatio);
    expect(alkaline.palette.leaf).not.toBe(acidic.palette.leaf);
    expect(highGravity.traits.leanDegrees).not.toBe(lowGravity.traits.leanDegrees);
    expect(highGravity.traits.leanLabel).not.toBe(lowGravity.traits.leanLabel);
  });

  it("labels every plant truthfully across the environment space", () => {
    const seeds = Array.from({ length: 40 }, (_, index) => 0x1000 + index * 7919);
    const labelSets = (environment: Environment) =>
      seeds.map((seed) => generatePlant(environment, seed, viewport).traits);

    // Default conditions sit mid-scale in every dimension the instrument can
    // reach: a default plant must not read as an extreme.
    for (const traits of labelSets(baseline)) {
      expect(traits.heightRatio).toBeGreaterThanOrEqual(0.34);
      expect(traits.heightRatio).toBeLessThan(0.68);
      expect(traits.heightLabel).toBe("medium");
      expect(traits.branchCount).toBeGreaterThanOrEqual(48);
      expect(traits.branchCount).toBeLessThan(96);
      expect(traits.branchingLabel).toBe("balanced");
      expect(traits.leafCount).toBeGreaterThanOrEqual(34);
      expect(traits.leafCount).toBeLessThan(72);
      expect(traits.leafDensityLabel).toBe("medium");
      expect(Math.abs(traits.leanDegrees)).toBeLessThan(7);
      expect(traits.leanLabel).toBe("upright");
    }

    // Environmental extremes earn the extreme words at every seed.
    for (const traits of labelSets({ ...baseline, humidity: 0 })) {
      expect(traits.heightLabel).toBe("medium");
      expect(traits.branchingLabel).toBe("sparse");
      expect(traits.leafDensityLabel).toBe("light");
    }

    for (const traits of labelSets({ ...baseline, sunlightHours: 0 })) {
      expect(traits.heightRatio).toBeLessThan(0.34);
      expect(traits.heightLabel).toBe("short");
      expect(traits.branchingLabel).toBe("balanced");
      expect(traits.leafDensityLabel).toBe("medium");
    }

    for (const traits of labelSets({ ...baseline, humidity: 0, sunlightHours: 0 })) {
      expect(traits.heightLabel).toBe("short");
      expect(traits.branchingLabel).toBe("sparse");
      expect(traits.leafDensityLabel).toBe("light");
    }

    for (const traits of labelSets({ ...baseline, humidity: 100 })) {
      expect(traits.branchingLabel).toBe("dense");
      expect(traits.leafDensityLabel).toBe("lush");
    }

    for (const traits of labelSets({ ...baseline, sunlightHours: 24 })) {
      expect(traits.heightRatio).toBeGreaterThanOrEqual(0.68);
      expect(traits.heightLabel).toBe("tall");
    }

    for (const traits of labelSets({ ...baseline, gravity: 0.2 })) {
      expect(traits.leanDegrees).toBeLessThan(-7);
      expect(traits.leanLabel).toBe("left");
    }

    for (const traits of labelSets({ ...baseline, gravity: 2 })) {
      expect(traits.leanDegrees).toBeGreaterThan(7);
      expect(traits.leanLabel).toBe("right");
    }
  });

  it("stays bounded across endpoint combinations and small viewports", () => {
    const humidities = [0, 100];
    const sunlightHours = [0, 24];
    const acidities = [3, 9];
    const gravities = [0.2, 2];
    const smallViewports: Viewport[] = [
      { width: 1, height: 1 },
      { width: 80, height: 120 },
      { width: 1440, height: 900 },
    ];

    for (const currentViewport of smallViewports) {
      for (const humidity of humidities) {
        for (const sunlight of sunlightHours) {
          for (const acidity of acidities) {
            for (const gravity of gravities) {
              const plant = generatePlant(
                {
                  humidity,
                  sunlightHours: sunlight,
                  soilAcidity: acidity,
                  gravity,
                },
                0xdecafbad,
                currentViewport,
              );

              expectSafePlant(plant, currentViewport);
            }
          }
        }
      }
    }
  });

  it("grows from a trunk that carries the plant and tapers toward the tips", () => {
    const plant = generatePlant(baseline, 42, viewport);
    const trunk = plant.segments[0];

    expect(trunk.startWidth).toBeGreaterThanOrEqual(12);
    expect(trunk.endWidth).toBeLessThan(trunk.startWidth);

    const deepest = plant.segments.reduce(
      (maximum, segment) => Math.max(maximum, segment.depth),
      0,
    );
    const tipWidths = plant.segments
      .filter((segment) => segment.depth === deepest)
      .map((segment) => segment.endWidth);

    for (const width of tipWidths) {
      expect(width).toBeGreaterThanOrEqual(1.5);
      expect(width).toBeLessThanOrEqual(trunk.startWidth * 0.3);
    }
  });

  it("gives mature leaves visible presence across the humidity range", () => {
    const scenarios = [
      { plant: generatePlant(baseline, 42, viewport), minAverage: 20, minLargest: 26 },
      { plant: generatePlant({ ...baseline, humidity: 0 }, 42, viewport), minAverage: 12, minLargest: 18 },
    ];

    for (const { plant, minAverage, minLargest } of scenarios) {
      const sizes = plant.leaves.map((leaf) => leaf.size);
      const average = sizes.reduce((total, size) => total + size, 0) / sizes.length;

      expect(average).toBeGreaterThanOrEqual(minAverage);
      expect(Math.max(...sizes)).toBeGreaterThanOrEqual(minLargest);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(10);
    }
  });

  it("marks a sun-fed minority of tips as buds", () => {
    const darkPlant = generatePlant({ ...baseline, sunlightHours: 0 }, 42, viewport);
    const brightPlant = generatePlant({ ...baseline, sunlightHours: 24 }, 42, viewport);
    const countBuds = (plant: Plant): number =>
      plant.leaves.filter((leaf) => leaf.bud).length;

    expect(countBuds(darkPlant)).toBeGreaterThan(0);
    expect(countBuds(brightPlant)).toBeGreaterThan(countBuds(darkPlant));
    expect(countBuds(brightPlant)).toBeLessThan(brightPlant.leaves.length / 2);
  });

  it("paints richer per-environment palettes", () => {
    const dry = generatePlant({ ...baseline, humidity: 0 }, 42, viewport);
    const wet = generatePlant({ ...baseline, humidity: 100 }, 42, viewport);
    const dark = generatePlant({ ...baseline, sunlightHours: 0 }, 42, viewport);
    const bright = generatePlant({ ...baseline, sunlightHours: 24 }, 42, viewport);
    const acidic = generatePlant({ ...baseline, soilAcidity: 3 }, 42, viewport);
    const alkaline = generatePlant({ ...baseline, soilAcidity: 9 }, 42, viewport);

    const dryStem = parsePaletteColor(dry.palette.stem);
    const wetStem = parsePaletteColor(wet.palette.stem);
    const darkAccent = parsePaletteColor(dark.palette.accent);
    const brightAccent = parsePaletteColor(bright.palette.accent);
    const acidicLeaf = parsePaletteColor(acidic.palette.leaf);
    const alkalineLeaf = parsePaletteColor(alkaline.palette.leaf);

    expect(wetStem.hue - dryStem.hue).toBeGreaterThanOrEqual(25);
    expect(brightAccent.hue - darkAccent.hue).toBeGreaterThanOrEqual(30);
    expect(Math.abs(alkalineLeaf.hue - acidicLeaf.hue)).toBeGreaterThanOrEqual(60);

    for (const plant of [dry, wet, dark, bright, acidic, alkaline]) {
      const accent = parsePaletteColor(plant.palette.accent);
      const leaf = parsePaletteColor(plant.palette.leaf);

      expect(accent.saturation).toBeGreaterThanOrEqual(70);
      expect(leaf.saturation).toBeGreaterThanOrEqual(44);
      expect(accent.saturation).toBeGreaterThan(leaf.saturation);
    }
  });
});
