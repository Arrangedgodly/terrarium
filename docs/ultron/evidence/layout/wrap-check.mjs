import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const width of [1440, 1180, 1024, 941, 900, 800, 761, 760, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto("http://127.0.0.1:5196/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  const wraps = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(".reading-list dt, .reading-list dd, .reading-environment")) {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 16;
      const lines = Math.round(el.getBoundingClientRect().height / lh);
      if (lines > 1) out.push(`${el.tagName}.${el.dataset.reading ?? el.textContent.slice(0, 12)}:${lines}L`);
    }
    const strip = document.querySelector(".plant-reading").getBoundingClientRect();
    return { wrapped: out, stripH: Math.round(strip.height) };
  });
  console.log(width, JSON.stringify(wraps));
  await page.close();
}
await browser.close();
