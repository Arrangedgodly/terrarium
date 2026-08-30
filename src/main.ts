import "./styles.css";
import { APP_TITLE, getViewportOverlapRatio } from "./app-shell.ts";
import { generatePlant, type Environment, type Plant } from "./generator.ts";
import { createPlantCanvasRenderer, prefersReducedMotion } from "./plant-canvas.ts";
import {
  CONTROL_KEYS,
  DEFAULT_ENVIRONMENT,
  DEFAULT_SEED,
  buildPlantReading,
  formatSpecimenSeed,
  nextSeed,
  rememberSpecimen,
  type ControlKey,
} from "./terrarium-state.ts";

document.title = APP_TITLE;

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing required terrarium element: ${selector}`);
  }

  return element;
}

const canvas = required<HTMLCanvasElement>("#plant-canvas");
const inputs = {
  humidity: required<HTMLInputElement>("#humidity"),
  sunlightHours: required<HTMLInputElement>("#sunlight"),
  soilAcidity: required<HTMLInputElement>("#acidity"),
  gravity: required<HTMLInputElement>("#gravity"),
} satisfies Record<ControlKey, HTMLInputElement>;
const outputs = {
  humidity: required<HTMLOutputElement>("#humidity-value"),
  sunlightHours: required<HTMLOutputElement>("#sunlight-value"),
  soilAcidity: required<HTMLOutputElement>("#acidity-value"),
  gravity: required<HTMLOutputElement>("#gravity-value"),
} satisfies Record<ControlKey, HTMLOutputElement>;
const growButton = required<HTMLButtonElement>('[data-action="grow"]');
const resetButton = required<HTMLButtonElement>('[data-action="reset"]');
const statusMessage = required<HTMLElement>("#status-message");
const statusTag = required<HTMLElement>(".status-tag");
const specimenSeedLabel = required<HTMLElement>('[data-specimen="seed"]');
const readingTitle = required<HTMLElement>('[data-reading="title"]');
const readingCopy = required<HTMLElement>('[data-reading="copy"]');
const readingEnvironment = required<HTMLElement>('[data-reading="environment"]');
const readingValues = {
  height: required<HTMLElement>('[data-reading="height"]'),
  branching: required<HTMLElement>('[data-reading="branching"]'),
  leafDensity: required<HTMLElement>('[data-reading="leafDensity"]'),
  lean: required<HTMLElement>('[data-reading="lean"]'),
};

type StatusState = "ready" | "draft" | "grown" | "recovery";

function formatControlValue(key: ControlKey, value: number): string {
  switch (key) {
    case "humidity":
      return `${value.toFixed(0)}%`;
    case "sunlightHours":
      return `${value.toFixed(0)} h`;
    case "soilAcidity":
      return `pH ${value.toFixed(1)}`;
    case "gravity":
      return `${value.toFixed(1)} g`;
  }
}

function syncControlOutputs(): void {
  for (const key of CONTROL_KEYS) {
    outputs[key].textContent = formatControlValue(key, inputs[key].valueAsNumber);
  }
}

function readEnvironment(): Environment {
  return {
    humidity: inputs.humidity.valueAsNumber,
    sunlightHours: inputs.sunlightHours.valueAsNumber,
    soilAcidity: inputs.soilAcidity.valueAsNumber,
    gravity: inputs.gravity.valueAsNumber,
  };
}

function applyEnvironment(environment: Environment): void {
  inputs.humidity.value = String(environment.humidity);
  inputs.sunlightHours.value = String(environment.sunlightHours);
  inputs.soilAcidity.value = String(environment.soilAcidity);
  inputs.gravity.value = String(environment.gravity);
  syncControlOutputs();
}

function setStatus(message: string, state: StatusState): void {
  statusMessage.textContent = message;
  statusMessage.dataset.tone = state;
  statusMessage.setAttribute("aria-live", state === "draft" ? "off" : "polite");
  statusTag.textContent = state;
  statusTag.dataset.status = state;
}

function setActionBusy(isBusy: boolean): void {
  growButton.disabled = isBusy;
  resetButton.disabled = isBusy;
  growButton.setAttribute("aria-busy", String(isBusy));
  resetButton.setAttribute("aria-busy", String(isBusy));
}

function updateReading(environment: Environment, plant: Plant): void {
  const reading = buildPlantReading(environment, plant);

  readingTitle.textContent = reading.title;
  readingCopy.textContent = reading.copy;
  readingEnvironment.textContent = reading.environment;
  readingValues.height.textContent = reading.values.height;
  readingValues.branching.textContent = reading.values.branching;
  readingValues.leafDensity.textContent = reading.values.leafDensity;
  readingValues.lean.textContent = reading.values.lean;
  canvas.textContent = reading.fallback;
  canvas.setAttribute("aria-label", reading.fallback);
}

let currentSeed = DEFAULT_SEED;
let currentPlant = generatePlant(DEFAULT_ENVIRONMENT, currentSeed);
// Session-only specimen memory: the chamber's ghost history. It lives in this
// module's state alone — never storage — so a reload returns the instrument to
// its empty baseline. Reset restores the default specimen but keeps the memory:
// the session's comparisons survive, only the page reload forgets.
let specimenHistory: Plant[] = [];
const renderer = createPlantCanvasRenderer(canvas, currentPlant);

function updateSpecimenSeed(seed: number): void {
  specimenSeedLabel.textContent = `SPECIMEN / ${formatSpecimenSeed(seed)}`;
}

// On the single-column layout the action and its consequence are vertically
// separated, so the viewport follows the growth; on the two-column layout they
// sit side by side and the viewport stays with the user's point of action.
const SINGLE_COLUMN_LAYOUT = "(max-width: 760px)";

function bringChamberIntoView(): void {
  if (!window.matchMedia(SINGLE_COLUMN_LAYOUT).matches) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;

  if (getViewportOverlapRatio(rect.top, rect.bottom, viewportHeight) >= 0.5) {
    return;
  }

  canvas.scrollIntoView({
    behavior: prefersReducedMotion(window) ? "auto" : "smooth",
    block: "center",
  });
}

applyEnvironment(DEFAULT_ENVIRONMENT);
updateReading(DEFAULT_ENVIRONMENT, currentPlant);
updateSpecimenSeed(currentSeed);
setStatus("Ready to grow a new specimen.", "ready");

function renderNextPlant(
  environment: Environment,
  seed: number,
  successMessage: string,
  successState: Extract<StatusState, "ready" | "grown">,
): boolean {
  setActionBusy(true);

  try {
    const nextPlant = generatePlant(environment, seed);
    specimenHistory = rememberSpecimen(specimenHistory, currentPlant);
    renderer.setGhosts(specimenHistory);
    renderer.growPlant(nextPlant);
    bringChamberIntoView();
    currentSeed = seed;
    currentPlant = nextPlant;
    updateSpecimenSeed(seed);
    updateReading(environment, currentPlant);
    setStatus(successMessage, successState);
    return true;
  } catch {
    setStatus(
      "Could not grow a new specimen. Your last valid plant is still shown—try Grow plant again or reset defaults.",
      "recovery",
    );
    return false;
  } finally {
    setActionBusy(false);
  }
}

for (const key of CONTROL_KEYS) {
  inputs[key].addEventListener("input", () => {
    outputs[key].textContent = formatControlValue(key, inputs[key].valueAsNumber);
    setStatus("Environment changed. Grow when ready.", "draft");
  });
}

growButton.addEventListener("click", () => {
  const environment = readEnvironment();
  const nextGeneratedSeed = nextSeed(currentSeed);

  renderNextPlant(
    environment,
    nextGeneratedSeed,
    "New specimen grown from the current environment.",
    "grown",
  );
  // The render may have moved the viewport to the chamber; restoring focus
  // (dropped to the body while the buttons were briefly disabled) must not
  // scroll back to the action.
  growButton.focus({ preventScroll: true });
});

resetButton.addEventListener("click", () => {
  const didReset = renderNextPlant(
    DEFAULT_ENVIRONMENT,
    DEFAULT_SEED,
    "Defaults restored. Baseline specimen grown.",
    "ready",
  );

  if (didReset) applyEnvironment(DEFAULT_ENVIRONMENT);
  resetButton.focus({ preventScroll: true });
});
