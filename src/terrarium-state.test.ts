import { describe, expect, it } from "vitest";
import { generatePlant } from "./generator";
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_SEED,
  buildPlantReading,
  formatEnvironment,
  nextSeed,
} from "./terrarium-state";

describe("terrarium state helpers", () => {
  it("formats the approved environment contract", () => {
    expect(formatEnvironment(DEFAULT_ENVIRONMENT)).toBe(
      "Humidity 55% · Sunlight 12 h · Soil pH 6.5 · Gravity 1.0 g",
    );
  });

  it("creates a text reading from generated traits and environment", () => {
    const plant = generatePlant(DEFAULT_ENVIRONMENT, DEFAULT_SEED);
    const reading = buildPlantReading(DEFAULT_ENVIRONMENT, plant);

    expect(reading.title).toMatch(/specimen$/);
    expect(reading.copy).toContain("stylized visual interpretation");
    expect(reading.copy).toMatch(/an upright posture|a slight (left|right) lean/);
    expect(reading.environment).toContain("Humidity 55%");
    expect(reading.values.height).toBe(plant.traits.heightLabel);
    expect(reading.fallback).toContain("Environment:");
  });

  it("advances the internal seed for repeated grows", () => {
    const first = nextSeed(DEFAULT_SEED);
    const second = nextSeed(first);

    expect(first).not.toBe(DEFAULT_SEED);
    expect(second).not.toBe(first);
  });
});
