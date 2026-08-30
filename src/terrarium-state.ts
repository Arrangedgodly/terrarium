import type { Environment, Plant } from "./generator.ts";

export const DEFAULT_ENVIRONMENT: Environment = {
  humidity: 55,
  sunlightHours: 12,
  soilAcidity: 6.5,
  gravity: 1,
};

export const DEFAULT_SEED = 0x5eed1234;

export const CONTROL_KEYS = ["humidity", "sunlightHours", "soilAcidity", "gravity"] as const;

export type ControlKey = (typeof CONTROL_KEYS)[number];

export interface PlantReading {
  title: string;
  copy: string;
  environment: string;
  values: {
    height: string;
    branching: string;
    leafDensity: string;
    lean: string;
  };
  fallback: string;
}

function formatLeanDegrees(plant: Plant): number {
  return Math.round(Math.abs(plant.traits.leanDegrees));
}

function formatLeanPhrase(plant: Plant): string {
  const degrees = formatLeanDegrees(plant);
  return plant.traits.leanLabel === "upright"
    ? `an upright posture (${degrees}°)`
    : `a lean of ${degrees}° to the ${plant.traits.leanLabel}`;
}

function formatLeanValue(plant: Plant): string {
  const degrees = formatLeanDegrees(plant);
  return plant.traits.leanLabel === "upright"
    ? `upright (${degrees}°)`
    : `${plant.traits.leanLabel} (${degrees}°)`;
}

export function formatEnvironment(environment: Environment): string {
  return [
    `Humidity ${environment.humidity.toFixed(0)}%`,
    `Sunlight ${environment.sunlightHours.toFixed(0)} h`,
    `Soil pH ${environment.soilAcidity.toFixed(1)}`,
    `Gravity ${environment.gravity.toFixed(1)} g`,
  ].join(" · ");
}

export function buildPlantReading(environment: Environment, plant: Plant): PlantReading {
  const leanPhrase = formatLeanPhrase(plant);
  const environmentText = formatEnvironment(environment);
  const title = `${plant.traits.heightLabel[0].toUpperCase()}${plant.traits.heightLabel.slice(1)} specimen`;
  const copy = `This stylized visual interpretation shows ${plant.traits.branchingLabel} branching, ${plant.traits.leafDensityLabel} leaf density, and ${leanPhrase}.`;

  return {
    title,
    copy,
    environment: environmentText,
    values: {
      height: plant.traits.heightLabel,
      branching: plant.traits.branchingLabel,
      leafDensity: plant.traits.leafDensityLabel,
      lean: formatLeanValue(plant),
    },
    fallback: `A generated plant with ${plant.traits.heightLabel} height, ${plant.traits.branchingLabel} branching, ${plant.traits.leafDensityLabel} leaf density, and ${leanPhrase}. Environment: ${environmentText}.`,
  };
}

export function nextSeed(seed: number): number {
  let value = (Math.trunc(seed) + 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return (value ^ (value >>> 15)) >>> 0;
}

/**
 * How many previous specimens linger in the chamber as ghost traces. The memory
 * is session-only by design: it lives in module state, never in storage, so a
 * reload returns the instrument to its empty baseline (no persistence in the MVP).
 */
export const SPECIMEN_HISTORY_LIMIT = 3;

/**
 * Names a specimen by its seed (#5EED1234 style) so results are nameable and a
 * new seed per grow is visible. Purely in-memory identification: the name can be
 * noted, not re-entered (no seed entry in the MVP).
 */
export function formatSpecimenSeed(seed: number): string {
  return `#${(seed >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

/**
 * Remembers the specimen a Grow just replaced, most recent last, evicting the
 * oldest beyond the limit. Pure and immutable: rapid re-grows append cleanly and
 * the caller's array is never mutated, and a reload starts from nothing because
 * nothing is persisted.
 */
export function rememberSpecimen(history: readonly Plant[], previous: Plant): Plant[] {
  const next = [...history, previous];
  return next.length > SPECIMEN_HISTORY_LIMIT
    ? next.slice(next.length - SPECIMEN_HISTORY_LIMIT)
    : next;
}
