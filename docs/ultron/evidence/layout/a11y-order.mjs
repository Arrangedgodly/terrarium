import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const OUT = new URL(".", import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://127.0.0.1:5196/", { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
const result = await page.evaluate(() => {
  const focusables = [...document.querySelectorAll("button, input, [tabindex]:not([tabindex='-1'])")]
    .map((el) => ({ tag: el.tagName.toLowerCase(), id: el.id || el.dataset.action || el.getAttribute("aria-label") }));
  const headings = [...document.querySelectorAll("h1, h2")].map((h) => `${h.tagName}: ${h.textContent.trim()}`);
  const landmarks = [...document.querySelectorAll("header, main, aside, section[aria-labelledby], form[aria-label]")]
    .map((el) => `${el.tagName.toLowerCase()}${el.getAttribute("aria-labelledby") ? "#" + el.getAttribute("aria-labelledby") : ""}`);
  const order = [...document.querySelector(".app-shell").children].map((el) => el.className);
  const readingLive = document.querySelector('[data-reading="environment"]').closest("section").getAttribute("aria-labelledby");
  return { domOrderInMain: order, tabOrder: focusables, headings, landmarks, readingAriaOwner: readingLive };
});
writeFileSync(OUT + "a11y-order.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
