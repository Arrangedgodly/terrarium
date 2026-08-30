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

/**
 * Fraction of a vertical span that currently sits inside the viewport, 0–1.
 * Decides whether a triggered growth animation is visible enough to watch
 * without moving the viewport.
 */
export function getViewportOverlapRatio(
  top: number,
  bottom: number,
  viewportHeight: number,
): number {
  if (viewportHeight <= 0 || bottom <= top) {
    return 0;
  }

  const visible = Math.min(bottom, viewportHeight) - Math.max(top, 0);

  return Math.min(Math.max(visible / (bottom - top), 0), 1);
}
