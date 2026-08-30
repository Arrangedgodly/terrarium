import { describe, expect, it } from "vitest";
import { APP_TITLE, SHELL_SURFACES, getViewportOverlapRatio } from "./app-shell.ts";

describe("application shell contract", () => {
  it("names the product", () => {
    expect(APP_TITLE).toBe("The Algorithmic Terrarium");
  });

  it("declares the first-view semantic surfaces in DOM order: reading after the chamber, actions with the controls", () => {
    expect(SHELL_SURFACES).toEqual([
      "growth-chamber",
      "plant-reading",
      "environment-controls",
      "action-block",
    ]);
  });
});

describe("viewport overlap ratio", () => {
  it("reports 1 when the span is fully inside the viewport", () => {
    expect(getViewportOverlapRatio(100, 500, 800)).toBe(1);
  });

  it("reports 0 when the span sits entirely above the viewport", () => {
    expect(getViewportOverlapRatio(-600, -100, 800)).toBe(0);
  });

  it("reports the visible fraction when the span straddles the top edge", () => {
    expect(getViewportOverlapRatio(-100, 300, 800)).toBeCloseTo(0.75);
  });

  it("reports the visible fraction when the span straddles the bottom edge", () => {
    expect(getViewportOverlapRatio(600, 1400, 800)).toBeCloseTo(0.25);
  });

  it("returns 0 for degenerate spans or viewports", () => {
    expect(getViewportOverlapRatio(100, 100, 800)).toBe(0);
    expect(getViewportOverlapRatio(100, 400, 0)).toBe(0);
  });
});
