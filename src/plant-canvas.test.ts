import { describe, expect, it } from "vitest";
import { getCanvasBackingStore } from "./plant-canvas";

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
