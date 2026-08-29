import { expect, test } from "@playwright/test";

test("keeps the current reading stable until grow, then supports reset", async ({ page }) => {
  await page.goto("/");

  const environmentReading = page.locator('[data-reading="environment"]');
  const canvas = page.locator("#plant-canvas");
  const initialSeed = await canvas.getAttribute("data-seed");

  await expect(environmentReading).toContainText("Humidity 55%");
  await expect(environmentReading).toContainText("Soil pH 6.5");

  await page.getByRole("slider", { name: "Humidity" }).fill("100");
  await page.getByRole("slider", { name: "Sunlight hours" }).fill("0");
  await page.getByRole("slider", { name: "Soil acidity" }).fill("9");
  await page.getByRole("slider", { name: "Gravity" }).fill("2");

  await expect(page.locator("#humidity-value")).toHaveText("100%");
  await expect(page.locator("#sunlight-value")).toHaveText("0 h");
  await expect(page.locator("#acidity-value")).toHaveText("pH 9.0");
  await expect(page.locator("#gravity-value")).toHaveText("2.0 g");
  await expect(environmentReading).toContainText("Humidity 55%");
  await expect(page.locator("#status-message")).toContainText("Environment changed");
  await expect(page.locator("#status-message")).toHaveAttribute("aria-live", "off");

  await page.getByRole("button", { name: /Grow plant/ }).click();

  await expect(environmentReading).toContainText("Humidity 100%");
  await expect(environmentReading).toContainText("Sunlight 0 h");
  await expect(environmentReading).toContainText("Soil pH 9.0");
  await expect(environmentReading).toContainText("Gravity 2.0 g");
  await expect(page.locator("#status-message")).toContainText("New specimen grown");
  await expect(page.locator("#status-message")).toHaveAttribute("aria-live", "polite");
  expect(await canvas.getAttribute("data-seed")).not.toBe(initialSeed);
  await expect(page.getByRole("button", { name: /Grow plant/ })).toBeFocused();

  await page.getByRole("button", { name: "Reset defaults" }).click();

  await expect(page.locator("#humidity-value")).toHaveText("55%");
  await expect(page.locator("#sunlight-value")).toHaveText("12 h");
  await expect(page.locator("#acidity-value")).toHaveText("pH 6.5");
  await expect(page.locator("#gravity-value")).toHaveText("1.0 g");
  await expect(environmentReading).toContainText("Humidity 55%");
  await expect(environmentReading).toContainText("Soil pH 6.5");
  await expect(page.locator("#status-message")).toContainText("Defaults restored");
  await expect(page.locator("#status-message")).toHaveAttribute("aria-live", "polite");
  expect(await canvas.getAttribute("data-seed")).toBe(initialSeed);
  await expect(page.getByRole("button", { name: "Reset defaults" })).toBeFocused();
});
