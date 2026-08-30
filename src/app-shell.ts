export const APP_TITLE = "The Algorithmic Terrarium";

/**
 * First-view semantic surfaces in DOM order: the reading follows the chamber so the
 * specimen's explanation stays adjacent to it (and first in reach on small screens),
 * while the rail keeps the controls and their actions together as the last group.
 */
export const SHELL_SURFACES = [
  "growth-chamber",
  "plant-reading",
  "environment-controls",
  "action-block",
] as const;
