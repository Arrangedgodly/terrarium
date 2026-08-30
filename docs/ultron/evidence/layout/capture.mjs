import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const APP_URL = "http://127.0.0.1:5196/";
const OUT = new URL(".", import.meta.url).pathname;
const browser = await chromium.launch();
const results = {};

async function openPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  return page;
}

async function geometry(page) {
  return page.evaluate(() => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    const chamber = r(".growth-chamber"), rail = r(".control-rail"), reading = r(".plant-reading"),
      wrap = r(".canvas-wrap"), canvas = r("#plant-canvas"), shell = r(".app-shell"),
      grow = document.querySelector('[data-action="grow"]').getBoundingClientRect();
    return {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      chamber: { h: Math.round(chamber.height), bottom: Math.round(chamber.bottom + window.scrollY) },
      rail: { h: Math.round(rail.height), bottom: Math.round(rail.bottom + window.scrollY) },
      deadUnderChamber: Math.round(rail.bottom - chamber.bottom),
      reading: { h: Math.round(reading.height), top: Math.round(reading.top + window.scrollY), bottom: Math.round(reading.bottom + window.scrollY) },
      readingFollowsChamber: Math.round(reading.top + window.scrollY - chamber.bottom) ,
      wrapH: Math.round(wrap.height), apertureH: Math.round(canvas.height),
      pageH: Math.round(document.documentElement.scrollHeight),
      growButtonTop: Math.round(grow.top + window.scrollY),
    };
  });
}

// Desktop 1440x900
{
  const page = await openPage(1440, 900);
  results.desktop1440 = await geometry(page);
  await page.screenshot({ path: OUT + "desktop-1440-rest-viewport.png" });
  await page.screenshot({ path: OUT + "desktop-1440-rest-full.png", fullPage: true });
  await page.getByRole("button", { name: /Grow plant/ }).click();
  await page.waitForTimeout(900);
  results.desktop1440.postGrow = await geometry(page);
  await page.screenshot({ path: OUT + "desktop-1440-postgrow-full.png", fullPage: true });
  await page.close();
}

// Laptop 1024x768
{
  const page = await openPage(1024, 768);
  results.laptop1024 = await geometry(page);
  await page.screenshot({ path: OUT + "laptop-1024-rest-full.png", fullPage: true });
  await page.getByRole("button", { name: /Grow plant/ }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: OUT + "laptop-1024-postgrow-full.png", fullPage: true });
  await page.close();
}

// Mid band 800x900 (two-column risk zone)
{
  const page = await openPage(800, 900);
  results.mid800 = await geometry(page);
  await page.screenshot({ path: OUT + "mid-800-rest-full.png", fullPage: true });
  await page.close();
}

// Mobile 390x844 — rest, post-grow at the button, post-grow after one flick to the reading
{
  const page = await openPage(390, 844);
  results.mobile390 = await geometry(page);
  await page.screenshot({ path: OUT + "mobile-390-rest-full.png", fullPage: true });
  await page.screenshot({ path: OUT + "mobile-390-rest-viewport.png" });

  const grow = page.getByRole("button", { name: /Grow plant/ });
  await grow.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await grow.click();
  await page.waitForTimeout(900);
  results.mobile390.postGrowAtButton = await page.evaluate(() => {
    const reading = document.querySelector(".plant-reading").getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      readingTopInViewport: Math.round(reading.top),
      readingBottomInViewport: Math.round(reading.bottom),
      pxFromViewportTopToReadingBottom: Math.round(-reading.bottom),
      statusVisible: document.querySelector("#status-message").getBoundingClientRect().top < window.innerHeight,
    };
  });
  await page.screenshot({ path: OUT + "mobile-390-postgrow-at-button.png" });
  await page.evaluate(() => document.querySelector(".plant-reading").scrollIntoView({ block: "start" }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + "mobile-390-postgrow-reading-visible.png" });
  results.mobile390.postGrowReadingScrolled = await page.evaluate(() => {
    const reading = document.querySelector(".plant-reading").getBoundingClientRect();
    const chamber = document.querySelector(".growth-chamber").getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      readingFullyVisible: reading.top >= 0 && reading.bottom <= window.innerHeight,
      readingTopInViewport: Math.round(reading.top),
      chamberBottomInViewport: Math.round(chamber.bottom),
    };
  });
  await page.close();
}

writeFileSync(OUT + "layout-evidence.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
