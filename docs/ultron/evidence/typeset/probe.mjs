import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const APP_URL = "http://127.0.0.1:5197/";
const OUT = new URL(".", import.meta.url).pathname;
const browser = await chromium.launch();
const results = { appUrl: APP_URL, viewports: {} };

async function openPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  return page;
}

// In-page probe: enumerate every text-bearing element (direct non-empty text node),
// its computed font-size in px, and per-element line count via Range rects.
const PROBE = () => {
  const strip = (s) => s.replace(/\s+/g, " ").trim().slice(0, 40);
  const isTextBearing = (el) =>
    Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);

  const lineInfo = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1);
    const tops = new Set(rects.map((r) => Math.round(r.top)));
    return { lines: tops.size };
  };

  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let el;
  while ((el = walker.nextNode())) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (!isTextBearing(el)) continue;
    const r = el.getBoundingClientRect();
    out.push({
      selector: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ").join(".") : ""),
      text: strip(el.textContent),
      fontSizePx: parseFloat(cs.fontSize),
      fontFamily: cs.fontFamily.split(",")[0],
      lineHeightPx: Math.round(parseFloat(cs.lineHeight) * 10) / 10,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      ...lineInfo(el),
    });
  }
  return out;
};

// Named wrap/clip checks for the elements the brief calls out.
const NAMED = () => {
  const q = (sel) => Array.from(document.querySelectorAll(sel));
  const frame = document.querySelector(".chamber-frame");
  const frameRect = frame.getBoundingClientRect();
  const panelRect = document.querySelector(".plant-reading").getBoundingClientRect();
  const checks = [];
  const check = (el, kind, expectedLines) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = Array.from(range.getClientRects()).filter((x) => x.width > 1 && x.height > 1);
    const lines = new Set(rects.map((x) => Math.round(x.top))).size;
    const clippedByFrame = el.closest(".chamber-frame")
      ? r.left < frameRect.left - 0.5 || r.right > frameRect.right + 0.5 || r.top < frameRect.top - 0.5 || r.bottom > frameRect.bottom + 0.5
      : null;
    checks.push({
      kind,
      selector: el.tagName.toLowerCase() + "." + String(el.className).split(" ").join("."),
      text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 44),
      fontSizePx: parseFloat(cs.fontSize),
      lines,
      expectedLines,
      wrapped: expectedLines !== null && lines > expectedLines,
      hOverflow: el.scrollWidth > el.clientWidth + 1,
      clippedByFrame,
      outsideReadingPanel:
        el.closest(".plant-reading") && !el.classList.contains("reading-environment")
          ? r.right > panelRect.right + 0.5
          : null,
    });
  };
  q(".eyebrow").forEach((el) => check(el, "eyebrow", 1));
  q(".status-tag").forEach((el) => check(el, "status-tag", 1));
  q(".range-hints span").forEach((el) => check(el, "range-hint", 1));
  q(".mono-label").forEach((el) => check(el, "chamber-footer-label", 1));
  q(".reading-list dt").forEach((el) => check(el, "reading-term", 1));
  q(".reading-list dd").forEach((el) => check(el, "reading-value", 1));
  q(".local-note").forEach((el) => check(el, "masthead-local-note", 2)); // 2 lines by <br> design
  q(".reading-environment").forEach((el) => check(el, "environment-line", null)); // paragraph: wrapping allowed, count recorded
  q(".control-label-row output").forEach((el) => check(el, "live-value", 1));
  return {
    checks,
    docHorizontalOverflow: document.scrollingElement.scrollWidth - window.innerWidth,
    viewport: { w: window.innerWidth, h: window.innerHeight },
  };
};

for (const [name, vp] of [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["mobile-390", { width: 390, height: 844 }],
  ["min-320", { width: 320, height: 800 }],
]) {
  const page = await openPage(vp.width, vp.height);
  const elements = await page.evaluate(PROBE);
  const named = await page.evaluate(NAMED);
  const sizes = elements.map((e) => e.fontSizePx);
  const min = Math.min(...sizes);
  results.viewports[name] = {
    viewport: vp,
    textElementCount: elements.length,
    minFontSizePx: Math.round(min * 100) / 100,
    minElements: elements.filter((e) => Math.abs(e.fontSizePx - min) < 0.001).map((e) => ({ selector: e.selector, text: e.text })),
    sizeHistogram: Object.entries(
      elements.reduce((acc, e) => {
        const k = Math.round(e.fontSizePx * 100) / 100;
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([px, n]) => ({ px: parseFloat(px), n }))
      .sort((a, b) => a.px - b.px),
    undersized: elements.filter((e) => e.fontSizePx < 11).map((e) => ({ selector: e.selector, text: e.text, fontSizePx: e.fontSizePx })),
    named,
    elements,
  };
  await page.screenshot({ path: OUT + `${name}-full.png`, fullPage: true });
  await page.close();
}

await browser.close();
writeFileSync(OUT + "typeset-evidence.json", JSON.stringify(results, null, 2));
const summary = Object.fromEntries(
  Object.entries(results.viewports).map(([k, v]) => [
    k,
    { min: v.minFontSizePx, undersized: v.undersized.length, docOverflow: v.named.docHorizontalOverflow },
  ])
);
console.log(JSON.stringify(summary, null, 2));
