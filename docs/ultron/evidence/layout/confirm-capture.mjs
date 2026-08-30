import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const OUT = new URL(".", import.meta.url).pathname;
const browser = await chromium.launch();
const results = {};
for (const [w, h, label] of [[800, 900, "mid800"], [1440, 900, "desktop1440"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("http://127.0.0.1:5196/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  results[label] = await page.evaluate(() => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    const chamber = r(".growth-chamber"), rail = r(".control-rail"), strip = r(".plant-reading");
    return {
      chamberH: Math.round(chamber.height), railH: Math.round(rail.height),
      concludeTogether: Math.abs(chamber.bottom - rail.bottom) < 2,
      stripH: Math.round(strip.height),
      pageH: Math.round(document.documentElement.scrollHeight),
    };
  });
  if (w === 800) await page.screenshot({ path: OUT + "mid-800-rest-full.png", fullPage: true });
  if (w === 1440) {
    await page.getByRole("button", { name: /Grow plant/ }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: OUT + "desktop-1440-postgrow-full.png", fullPage: true });
  }
  await page.close();
}
writeFileSync(OUT + "confirm-round.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
await browser.close();
