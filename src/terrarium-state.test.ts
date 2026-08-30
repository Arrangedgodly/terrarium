import { describe, expect, it } from "vitest";
import { generatePlant, type Plant } from "./generator";
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_SEED,
  SPECIMEN_HISTORY_LIMIT,
  buildPlantReading,
  formatEnvironment,
  formatSpecimenSeed,
  nextSeed,
  rememberSpecimen,
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

    expect(reading.title).toBe("Medium specimen");
    expect(reading.copy).toContain("stylized visual interpretation");
    expect(reading.copy).toMatch(
      /balanced branching, medium leaf density, and an upright posture \(\d+°\)/,
    );
    expect(reading.environment).toContain("Humidity 55%");
    expect(reading.values.height).toBe(plant.traits.heightLabel);
    expect(reading.values.lean).toMatch(/^upright \(\d+°\)$/);
    expect(reading.fallback).toContain("Environment:");
    expect(reading.fallback).toContain("an upright posture");
  });

  it("describes a leaning plant without understating the angle", () => {
    const leaning = generatePlant({ ...DEFAULT_ENVIRONMENT, gravity: 2 }, 0x9e3779b9);
    const reading = buildPlantReading({ ...DEFAULT_ENVIRONMENT, gravity: 2 }, leaning);

    expect(leaning.traits.leanLabel).toBe("right");
    expect(reading.copy).toMatch(/a lean of \d+° to the right/);
    expect(reading.copy).not.toContain("slight");
    expect(reading.values.lean).toMatch(/^right \(\d+°\)$/);
    expect(reading.fallback).toMatch(/a lean of \d+° to the right/);
  });

  it("advances the internal seed for repeated grows", () => {
    const first = nextSeed(DEFAULT_SEED);
    const second = nextSeed(first);

    expect(first).not.toBe(DEFAULT_SEED);
    expect(second).not.toBe(first);
  });
});

describe("specimen seed readout", () => {
  it("names the baseline specimen #5EED1234", () => {
    expect(formatSpecimenSeed(DEFAULT_SEED)).toBe("#5EED1234");
  });

  it("formats every seed as an 8-digit uppercase name, padding small values", () => {
    expect(formatSpecimenSeed(0xff)).toBe("#000000FF");
    expect(formatSpecimenSeed(1)).toBe("#00000001");
    expect(formatSpecimenSeed(-1)).toMatch(/^#[0-9A-F]{8}$/);
  });

  it("gives every grow a different, well-formed name", () => {
    let seed = DEFAULT_SEED;
    const names = new Set<string>();

    for (let grow = 0; grow < 12; grow += 1) {
      seed = nextSeed(seed);
      const name = formatSpecimenSeed(seed);
      expect(name).toMatch(/^#[0-9A-F]{8}$/);
      names.add(name);
    }

    expect(names.size).toBe(12);
  });
});

describe("session specimen history", () => {
  const plants = Array.from({ length: 5 }, (_, index) => generatePlant(DEFAULT_ENVIRONMENT, index + 1));

  it("remembers the specimen each grow replaced, most recent last", () => {
    const history = rememberSpecimen([], plants[0]);

    expect(history).toEqual([plants[0]]);
  });

  it("holds exactly the last three specimens, evicting the oldest", () => {
    expect(SPECIMEN_HISTORY_LIMIT).toBe(3);

    let history: Plant[] = [];
    for (const plant of plants) {
      history = rememberSpecimen(history, plant);
    }

    expect(history).toEqual([plants[2], plants[3], plants[4]]);
  });

  it("tracks the real grow loop: after four grows the default is evicted and the last three remain", () => {
    let seed = DEFAULT_SEED;
    let current = generatePlant(DEFAULT_ENVIRONMENT, seed);
    let history: Plant[] = [];
    const grown: Plant[] = [];

    for (let grow = 0; grow < 4; grow += 1) {
      seed = nextSeed(seed);
      const next = generatePlant(DEFAULT_ENVIRONMENT, seed);
      history = rememberSpecimen(history, current);
      grown.push(current);
      current = next;
    }

    expect(history).toEqual(grown.slice(1));
    expect(history).not.toContain(grown[0]);
  });

  it("never mutates the history it was given", () => {
    const original = [plants[0], plants[1]];
    const next = rememberSpecimen(original, plants[2]);

    expect(original).toEqual([plants[0], plants[1]]);
    expect(next).not.toBe(original);
  });
});
