import { describe, expect, it } from "vitest";
import {
  GROWTH_DURATION_MS,
  easeGrow,
  getCanvasBackingStore,
  getGhostAlpha,
  getGhostDim,
  getGroundGrowth,
  getLeafGrowth,
  getSegmentGrowth,
  getStrokeWidth,
  prefersReducedMotion,
  type MediaQueryCapableView,
} from "./plant-canvas";
import { generatePlant } from "./generator.ts";

describe("getCanvasBackingStore", () => {
  it("caps dense-display scaling at two device pixels", () => {
    expect(getCanvasBackingStore(320, 240, 3)).toEqual({
      cssWidth: 320,
      cssHeight: 240,
      pixelWidth: 640,
      pixelHeight: 480,
      devicePixelRatio: 2,
    });
  });

  it("keeps invalid layout inputs renderable with safe defaults", () => {
    const backingStore = getCanvasBackingStore(Number.NaN, 0, Number.NaN);

    expect(backingStore.cssWidth).toBe(640);
    expect(backingStore.cssHeight).toBe(640);
    expect(backingStore.pixelWidth).toBe(640);
    expect(backingStore.pixelHeight).toBe(640);
    expect(backingStore.devicePixelRatio).toBe(1);
  });
});

describe("getStrokeWidth", () => {
  it("holds the boldness floor at 1.5 css pixels for thin tips", () => {
    expect(getStrokeWidth(0.6, 1)).toBe(1.5);
    expect(getStrokeWidth(3, 0.4)).toBe(1.5);
  });

  it("scales model widths with the canvas scale above the floor", () => {
    expect(getStrokeWidth(10, 2)).toBe(20);
    expect(getStrokeWidth(6, 0.92)).toBeCloseTo(5.52);
  });
});

describe("witnessed growth", () => {
  it("runs the authored moment at ~600ms", () => {
    expect(GROWTH_DURATION_MS).toBe(600);
  });

  it("eases with natural deceleration and no overshoot", () => {
    expect(easeGrow(0)).toBe(0);
    expect(easeGrow(1)).toBe(1);
    expect(easeGrow(0.5)).toBeGreaterThan(0.9);
    expect(easeGrow(0.5)).toBeLessThanOrEqual(1);

    let previousSlope = easeGrow(0.25) - easeGrow(0);
    for (let t = 0.25; t < 1; t += 0.25) {
      const slope = easeGrow(t + 0.25) - easeGrow(t);
      expect(slope).toBeLessThanOrEqual(previousSlope + 1e-12);
      previousSlope = slope;
    }
  });

  it("settles every structure to full growth by the end of the clock", () => {
    const plant = generatePlant({ humidity: 100, sunlightHours: 24, soilAcidity: 9, gravity: 2 }, 0x5eed1234);
    const maxSegmentDepth = Math.max(...plant.segments.map((segment) => segment.depth));
    const maxLeafDepth = Math.max(...plant.leaves.map((leaf) => leaf.depth));

    for (let depth = 0; depth <= maxSegmentDepth; depth += 1) {
      expect(getSegmentGrowth(1, depth, maxSegmentDepth)).toBe(1);
    }
    for (let depth = 0; depth <= maxLeafDepth; depth += 1) {
      expect(getLeafGrowth(1, depth, maxLeafDepth, false)).toBe(1);
    }
    expect(getLeafGrowth(1, maxLeafDepth, maxLeafDepth, true)).toBe(1);
    expect(getGroundGrowth(1)).toBe(1);
  });

  it("grows root before trunk before branches: deeper structure starts later", () => {
    const maxDepth = 6;
    const early = 0.15;
    const growthByDepth = Array.from({ length: maxDepth + 1 }, (_, depth) =>
      getSegmentGrowth(early, depth, maxDepth),
    );

    for (let depth = 1; depth <= maxDepth; depth += 1) {
      expect(growthByDepth[depth]).toBeLessThanOrEqual(growthByDepth[depth - 1]);
    }
    expect(growthByDepth[0]).toBeGreaterThan(0);
    expect(growthByDepth[1]).toBeGreaterThan(growthByDepth[2]);
    expect(growthByDepth[maxDepth]).toBe(0);
  });

  it("keeps the chamber empty at the press and unfurls leaves behind their branches", () => {
    expect(getGroundGrowth(0)).toBe(0);
    expect(getSegmentGrowth(0, 0, 6)).toBe(0);
    expect(getLeafGrowth(0, 0, 6, false)).toBe(0);
    expect(getLeafGrowth(0, 6, 6, true)).toBe(0);

    const midGrow = 0.4;
    for (let depth = 0; depth <= 6; depth += 1) {
      const leaf = getLeafGrowth(midGrow, depth, 6, false);
      const segment = getSegmentGrowth(midGrow, depth, 6);
      expect(leaf).toBeLessThanOrEqual(segment);
      if (segment > 0) expect(leaf).toBeLessThan(segment);
    }
    expect(getLeafGrowth(midGrow, 0, 6, false)).toBeGreaterThan(0);
  });

  it("lands fruit buds as the finale, after the canopy", () => {
    const beforeBuds = 0.6;
    expect(getLeafGrowth(beforeBuds, 6, 6, true)).toBe(0);
    expect(getLeafGrowth(beforeBuds, 6, 6, false)).toBeGreaterThan(0);
    expect(getLeafGrowth(1, 6, 6, true)).toBe(1);

    let previous = 0;
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const growth = getSegmentGrowth(t, 0, 6);
      expect(growth).toBeGreaterThanOrEqual(previous - 1e-12);
      previous = growth;
    }
  });
});

describe("ghost traces", () => {
  it("grades visibility by recency: the newest departure is the most visible", () => {
    expect(getGhostAlpha(0, 3)).toBeLessThan(getGhostAlpha(1, 3));
    expect(getGhostAlpha(1, 3)).toBeLessThan(getGhostAlpha(2, 3));
  });

  it("keeps every ghost subordinate to the live specimen's tissue alphas", () => {
    for (let index = 0; index < 3; index += 1) {
      expect(getGhostAlpha(index, 3)).toBeGreaterThan(0);
      expect(getGhostAlpha(index, 3)).toBeLessThan(0.7);
    }
  });

  it("uses the newest alphas while the history is still filling", () => {
    expect(getGhostAlpha(0, 1)).toBe(getGhostAlpha(2, 3));
    expect(getGhostAlpha(0, 2)).toBe(getGhostAlpha(1, 3));
    expect(getGhostAlpha(1, 2)).toBe(getGhostAlpha(2, 3));
  });

  it("returns no trace alpha for an empty history", () => {
    expect(getGhostAlpha(0, 0)).toBe(0);
  });

  it("dims the newest ghost from full visibility into its trace without a pop", () => {
    expect(getGhostDim(0)).toBe(0);
    expect(getGhostDim(0.25)).toBe(1);
    expect(getGhostDim(1)).toBe(1);

    let previous = -Infinity;
    for (const t of [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.6]) {
      const dim = getGhostDim(t);
      expect(dim).toBeGreaterThanOrEqual(previous - 1e-12);
      previous = dim;
    }
  });
});

describe("prefersReducedMotion", () => {
  const view = (matches: boolean): MediaQueryCapableView => ({
    matchMedia: (query: string) => {
      if (query === "(prefers-reduced-motion: reduce)") return { matches };
      return { matches: false };
    },
  });

  it("short-circuits the grow-in when the user asks for reduced motion", () => {
    expect(prefersReducedMotion(view(true))).toBe(true);
  });

  it("animates when the preference is absent or unanswered", () => {
    expect(prefersReducedMotion(view(false))).toBe(false);
    expect(prefersReducedMotion(null)).toBe(false);
    expect(prefersReducedMotion(undefined)).toBe(false);
  });
});
