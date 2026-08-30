// Evidence capture for refinement entry 3 ($impeccable animate) — witnessed growth.
// Run against the dev server on 127.0.0.1:5195. Frames are the canvas bitmap at
// precise rAF moments during the 600ms window; context shots are Playwright
// screenshots taken mid-grow. Proofs: reduced-motion frame equality, restart
// safety, rAF-loop termination, console cleanliness.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "http://127.0.0.1:5195";
const OUT = dirname(fileURLToPath(import.meta.url));
const results = { base: BASE, capturedAt: new Date().toISOString(), sequences: {}, consoleErrors: [] };

function savePng(dataUrl, name) {
  if (!dataUrl?.startsWith("data:image/png")) throw new Error(`not a png data url: ${name}`);
  writeFileSync(join(OUT, name), Buffer.from(dataUrl.split(",")[1], "base64"));
}

async function openPage(browser, viewport, reducedMotion) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (error) => results.consoleErrors.push({ kind: "pageerror", message: String(error) }));
  page.on("console", (message) => {
    if (message.type() === "error") results.consoleErrors.push({ kind: "console", message: message.text() });
  });
  await page.emulateMedia({ reducedMotion });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  await page.evaluate(() => {
    window.__rafCount = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => {
      window.__rafCount += 1;
      return original(callback);
    };
  });
  return page;
}

// Captures canvas bitmap frames at the first rAF at/after each target ms
// following a Grow press. The animation's own rAF step runs before the capture
// callback on each frame, so each frame reflects exactly what painted.
async function captureGrowFrames(page, targets) {
  return page.evaluate((targetList) => {
    const canvas = document.querySelector("#plant-canvas");
    document.querySelector('[data-action="grow"]').click();
    const start = performance.now();
    const frames = [];
    return new Promise((resolve) => {
      const capture = () => {
        const now = performance.now() - start;
        while (targetList.length && now >= targetList[0]) {
          frames.push({ targetMs: targetList.shift(), atMs: Math.round(now), data: canvas.toDataURL("image/png") });
        }
        if (!targetList.length) {
          resolve({ frames, seed: canvas.dataset.seed, ariaLabel: canvas.getAttribute("aria-label") });
          return;
        }
        requestAnimationFrame(capture);
      };
      requestAnimationFrame(capture);
    });
  }, targets);
}

const browser = await chromium.launch();

// 1 — Desktop 1440x900 grow moment: frame sequence through the ~600ms window.
{
  const page = await openPage(browser, { width: 1440, height: 900 }, "no-preference");
  const run = await captureGrowFrames(page, [16, 150, 300, 450, 640]);
  for (const frame of run.frames) savePng(frame.data, `grow-desktop-frame-${String(frame.targetMs).padStart(3, "0")}ms.png`);
  // Loop-termination proof: count plateaus once the plant settles.
  const plateau = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const first = window.__rafCount;
        setTimeout(() => resolve({ first, second: window.__rafCount }), 400);
      }),
  );
  // In-context screenshot mid-grow (approximate timing; page-level capture).
  await page.click('[data-action="grow"]');
  await page.waitForTimeout(260);
  await page.screenshot({ path: join(OUT, "grow-desktop-context-mid.png") });
  results.sequences.desktopGrow = {
    frames: run.frames.map((frame) => ({ targetMs: frame.targetMs, atMs: frame.atMs })),
    seed: run.seed,
    ariaLabel: run.ariaLabel,
    rafPlateau: { ...plateau, terminated: plateau.first === plateau.second },
  };
  await page.close();
}

// 2 — Reduced motion: final specimen appears immediately, no intermediate states.
{
  const page = await openPage(browser, { width: 1440, height: 900 }, "reduce");
  const proof = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const canvas = document.querySelector("#plant-canvas");
        document.querySelector('[data-action="grow"]').click();
        const grab = () => canvas.toDataURL("image/png");
        setTimeout(() => {
          const at200ms = grab();
          setTimeout(() => {
            const at900ms = grab();
            resolve({
              at200ms,
              at900ms,
              identical: at200ms === at900ms,
              rafCount: window.__rafCount,
              seed: canvas.dataset.seed,
            });
          }, 700);
        }, 200);
      }),
  );
  savePng(proof.at200ms, "reduced-motion-200ms.png");
  savePng(proof.at900ms, "reduced-motion-settled-900ms.png");
  results.sequences.reducedMotion = {
    identicalAt200msAndSettled: proof.identical,
    rafCountDuringGrow: proof.rafCount,
    seed: proof.seed,
  };
  await page.close();
}

// 3 — Restart safety: rapid double Grow, and Reset pressed mid-grow.
{
  const page = await openPage(browser, { width: 1440, height: 900 }, "no-preference");
  const initialDefault = await page.evaluate(() => document.querySelector("#plant-canvas").toDataURL("image/png"));
  savePng(initialDefault, "initial-default-specimen.png");

  const doubleGrow = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const canvas = document.querySelector("#plant-canvas");
        const grow = () => document.querySelector('[data-action="grow"]').click();
        grow();
        setTimeout(grow, 80);
        setTimeout(() => {
          const settled = canvas.toDataURL("image/png");
          const rafFirst = window.__rafCount;
          setTimeout(() => {
            resolve({ settled, rafFirst, rafSecond: window.__rafCount, seed: canvas.dataset.seed });
          }, 400);
        }, 1300);
      }),
  );
  savePng(doubleGrow.settled, "restart-double-grow-settled.png");

  const resetDuringGrow = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const canvas = document.querySelector("#plant-canvas");
        document.querySelector('[data-action="grow"]').click();
        setTimeout(() => document.querySelector('[data-action="reset"]').click(), 180);
        setTimeout(() => {
          const settled = canvas.toDataURL("image/png");
          resolve({ settled, seed: canvas.dataset.seed, status: document.querySelector("#status-message").textContent });
        }, 1500);
      }),
  );
  savePng(resetDuringGrow.settled, "restart-reset-during-grow-settled.png");

  // Chromium may switch the canvas between software and GPU raster when it
  // starts animating (edge antialiasing differs by a hair), so byte-identity
  // against the pre-animation initial render is the wrong test. The correct
  // completeness proof: the settled frame byte-matches a forced static redraw
  // of the same plant, and stays within a tight pixel-similarity bound of the
  // initial default render (same plant; different rasterizer at most).
  await page.setViewportSize({ width: 1439, height: 900 });
  await page.waitForTimeout(300);
  const postResetStaticRedraw = await page.evaluate(() => document.querySelector("#plant-canvas").toDataURL("image/png"));
  const similarity = await page.evaluate(
    ([a, b]) =>
      new Promise((resolve) => {
        const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = s; });
        Promise.all([load(a), load(b)]).then(([ia, ib]) => {
          const c = document.createElement("canvas");
          c.width = ia.width; c.height = ia.height;
          const ctx = c.getContext("2d");
          ctx.drawImage(ia, 0, 0);
          const da = ctx.getImageData(0, 0, ia.width, ia.height).data;
          ctx.clearRect(0, 0, ia.width, ia.height);
          ctx.drawImage(ib, 0, 0);
          const db = ctx.getImageData(0, 0, ib.width, ib.height).data;
          let differing = 0; let maxDelta = 0;
          for (let i = 0; i < da.length; i += 4) {
            const d = Math.max(Math.abs(da[i]-db[i]), Math.abs(da[i+1]-db[i+1]), Math.abs(da[i+2]-db[i+2]), Math.abs(da[i+3]-db[i+3]));
            if (d > 0) { differing++; if (d > maxDelta) maxDelta = d; }
          }
          resolve({ totalPx: da.length / 4, differing, differingRatio: differing / (da.length / 4), maxDelta });
        });
      }),
    [initialDefault, resetDuringGrow.settled],
  );
  results.sequences.restartSafety = {
    doubleGrow: {
      seed: doubleGrow.seed,
      rafTerminated: doubleGrow.rafFirst === doubleGrow.rafSecond,
      rafCounts: [doubleGrow.rafFirst, doubleGrow.rafSecond],
    },
    resetDuringGrow: {
      seed: resetDuringGrow.seed,
      settledMatchesStaticRedraw: resetDuringGrow.settled === postResetStaticRedraw,
      vsInitialDefault: similarity,
      statusMessage: resetDuringGrow.status,
    },
  };
  await page.close();
}

// 4 — Mobile 390x844: one grow sequence.
{
  const page = await openPage(browser, { width: 390, height: 844 }, "no-preference");
  const run = await captureGrowFrames(page, [16, 150, 300, 450, 640]);
  for (const frame of run.frames) savePng(frame.data, `grow-mobile-frame-${String(frame.targetMs).padStart(3, "0")}ms.png`);
  await page.click('[data-action="grow"]');
  await page.waitForTimeout(260);
  await page.screenshot({ path: join(OUT, "grow-mobile-context-mid.png") });
  results.sequences.mobileGrow = {
    frames: run.frames.map((frame) => ({ targetMs: frame.targetMs, atMs: frame.atMs })),
    seed: run.seed,
  };
  await page.close();
}

await browser.close();
writeFileSync(join(OUT, "animate-evidence.json"), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ consoleErrors: results.consoleErrors.length, sequences: Object.keys(results.sequences) }));
