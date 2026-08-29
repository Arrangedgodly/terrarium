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
  }
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
});
