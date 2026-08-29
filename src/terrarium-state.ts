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

function formatLean(plant: Plant): string {
  const degrees = Math.round(Math.abs(plant.traits.leanDegrees));
  return plant.traits.leanLabel === "upright"
    ? `upright posture (${degrees}°)`
    : `slight ${plant.traits.leanLabel} lean (${degrees}°)`;
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
  const lean = formatLean(plant);
  const leanArticle = lean.startsWith("upright") ? "an" : "a";
  const environmentText = formatEnvironment(environment);
  const title = `${plant.traits.heightLabel[0].toUpperCase()}${plant.traits.heightLabel.slice(1)} specimen`;
  const copy = `This stylized visual interpretation shows ${plant.traits.branchingLabel} branching, ${plant.traits.leafDensityLabel} leaf density, and ${leanArticle} ${lean}.`;

  return {
    title,
    copy,
    environment: environmentText,
    values: {
      height: plant.traits.heightLabel,
      branching: plant.traits.branchingLabel,
      leafDensity: plant.traits.leafDensityLabel,
      lean,
    },
    fallback: `A generated plant with ${plant.traits.heightLabel} height, ${plant.traits.branchingLabel} branching, ${plant.traits.leafDensityLabel} leaf density, and ${leanArticle} ${lean}. Environment: ${environmentText}.`,
  };
}

export function nextSeed(seed: number): number {
  let value = (Math.trunc(seed) + 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return (value ^ (value >>> 15)) >>> 0;
}
