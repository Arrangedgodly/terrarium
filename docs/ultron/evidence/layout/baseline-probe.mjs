import { chromium } from "@playwright/test";

const URL = "http://127.0.0.1:5196/";
const browser = await chromium.launch();

async function measure(width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  const data = await page.evaluate(() => {
    const chamber = document.querySelector(".growth-chamber").getBoundingClientRect();
    const rail = document.querySelector(".control-rail").getBoundingClientRect();
    const reading = document.querySelector(".plant-reading").getBoundingClientRect();
    const wrap = document.querySelector(".canvas-wrap").getBoundingClientRect();
    const canvas = document.querySelector("#plant-canvas").getBoundingClientRect();
    const readingInRail = !!document.querySelector(".control-rail .plant-reading");
    return {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      chamberH: Math.round(chamber.height), chamberBottom: Math.round(chamber.bottom),
      railH: Math.round(rail.height), railBottom: Math.round(rail.bottom),
      readingH: Math.round(reading.height), readingTop: Math.round(reading.top), readingBottom: Math.round(reading.bottom),
      readingInsideRail: readingInRail,
      wrapH: Math.round(wrap.height), apertureH: Math.round(canvas.height),
      pageH: Math.round(document.documentElement.scrollHeight),
    };
  });
  console.log(`[baseline ${label}]`, JSON.stringify(data));

  if (width <= 760) {
    // scroll to the Grow button (bottom of rail), click it, measure where the updated reading sits
    await page.getByRole("button", { name: /Grow plant/ }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.scrollY);
    await page.getByRole("button", { name: /Grow plant/ }).click();
    await page.waitForTimeout(900); // let grow-in + status settle
    const post = await page.evaluate(() => {
      const reading = document.querySelector(".plant-reading").getBoundingClientRect();
      return {
        scrollYAfterGrowClick: Math.round(window.scrollY),
        readingTopInViewport: Math.round(reading.top),
        readingBottomInViewport: Math.round(reading.bottom),
        readingAboveViewportBy: Math.round(-reading.bottom),
        readingFullyVisible: reading.top >= 0 && reading.bottom <= window.innerHeight,
      };
    });
    console.log(`[baseline ${label} post-grow]`, JSON.stringify(post));
  }
  await page.close();
}

await measure(1440, 900, "desktop-1440");
await measure(1024, 768, "laptop-1024");
await measure(800, 900, "mid-800");
await measure(390, 844, "mobile-390");
await browser.close();
