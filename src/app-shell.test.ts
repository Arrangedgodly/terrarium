import { describe, expect, it } from "vitest";
import { APP_TITLE, SHELL_SURFACES } from "./app-shell.ts";

describe("application shell contract", () => {
  it("names the product", () => {
    expect(APP_TITLE).toBe("The Algorithmic Terrarium");
  });

  it("declares the first-view semantic surfaces in DOM order: action keys right after the chamber, controls last", () => {
    expect(SHELL_SURFACES).toEqual([
      "growth-chamber",
      "action-block",
      "plant-reading",
      "environment-controls",
    ]);
  });
});
