import { describe, expect, it } from "vitest";
import { APP_TITLE, SHELL_SURFACES } from "./app-shell.ts";

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
