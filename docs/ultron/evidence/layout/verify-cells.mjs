import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [w, h, label] of [[1440, 900, "1440"], [1024, 768, "1024"], [800, 900, "800"], [390, 844, "390"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("http://127.0.0.1:5196/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  const cells = await page.evaluate(() => {
    const dts = [...document.querySelectorAll(".reading-list dt")];
    const tops = new Set();
    const info = dts.map((dt) => {
      const r = dt.getBoundingClientRect();
      tops.add(Math.round(r.top));
      return { text: dt.textContent, oneLine: r.height < 20, w: Math.round(r.width) };
    });
    const strip = document.querySelector(".plant-reading").getBoundingClientRect();
    const data = document.querySelector(".reading-data").getBoundingClientRect();
    const env = document.querySelector(".reading-environment");
    return {
      dtInfo: info,
      dtRows: tops.size,
      stripH: Math.round(strip.height),
      dataZoneLeftBorderRunsFullHeight: Math.round(data.height) >= Math.round(strip.height) - 48,
      envLineCount: Math.round(env.getBoundingClientRect().height / (0.7 * 16 * 1.5)),
      ddOverflow: [...document.querySelectorAll(".reading-list dd")].map((dd) => dd.scrollWidth > dd.clientWidth + 1),
    };
  });
  console.log(label, JSON.stringify(cells));
  await page.close();
}
await browser.close();
