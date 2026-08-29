import { expect, test } from "@playwright/test";

test("loads the terrarium shell with its core regions", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("The Algorithmic Terrarium");
  await expect(page.getByRole("main", { name: "Terrarium dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current specimen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Set the conditions" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Grow plant/ })).toBeVisible();
  await expect(page.getByRole("slider", { name: "Humidity" })).toHaveValue("55");
  await expect(page.locator("#status-message")).toContainText("Ready to grow");

  const canvas = page.locator("#plant-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("role", "img");
  await expect.poll(async () => canvas.getAttribute("data-rendered")).toBe("true");
  const backingStore = await canvas.evaluate((element) => ({
    width: element.width,
    height: element.height,
    cssWidth: element.getBoundingClientRect().width,
    cssHeight: element.getBoundingClientRect().height,
  }));
  expect(backingStore.width).toBeGreaterThan(0);
  expect(backingStore.height).toBeGreaterThan(0);
  expect(backingStore.cssWidth).toBeGreaterThan(0);
  expect(backingStore.cssHeight).toBeGreaterThan(0);
});
