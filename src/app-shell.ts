export const APP_TITLE = "The Algorithmic Terrarium";

/**
 * First-view semantic surfaces in DOM order: the action keys follow the chamber
 * so a grow tap happens with the grow-in already in view, the reading stays
 * adjacent to the specimen, and the controls close the page as the last group.
 */
export const SHELL_SURFACES = [
  "growth-chamber",
  "action-block",
  "plant-reading",
  "environment-controls",
] as const;
