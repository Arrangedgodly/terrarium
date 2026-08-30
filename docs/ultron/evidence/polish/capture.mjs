import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

// Entry 6 ($impeccable polish) evidence — one batched round.
// Proves: session-only ghost history (capacity 3, oldest evicted, cleared on reload),
// the seed readout per grow, rapid re-grow coherence, reduced-motion ghost behavior,
// the three minor-observation fixes, and the 11px text floor surviving the new label.

const APP_URL = "http://127.0.0.1:5198/";
const OUT = new URL(".", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = { appUrl: APP_URL, failures: [], steps: {}, textFloor: {}, notes: {} };
const fail = (step, message) => results.failures.push({ step, message });
const ok = (step, condition, message) => {
  if (!condition) fail(step, message);
};

async function newPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  return { page, errors };
}

const STATE = () => {
  const canvas = document.querySelector("#plant-canvas");
  const label = document.querySelector('[data-specimen="seed"]');
  return {
    seedLabel: label?.textContent ?? null,
    liveSeed: canvas?.dataset.seed ?? null,
    ghostCount: Number(canvas?.dataset.ghostCount ?? -1),
    ghostSeeds: canvas?.dataset.ghostSeeds ?? null,
  };
};

// dataset.seed is a decimal string; ghosts are unpadded hex — normalize comparisons.
const hex = (seed) => Number(seed).toString(16);
const seedName = (seed) => "#" + Number(seed).toString(16).toUpperCase().padStart(8, "0");

// Settled = the frame stops changing (the grow-in loop has ended).
async function waitSettled(page, timeoutMs = 4000) {
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector("#plant-canvas");
      const current = canvas.toDataURL();
      if (window.__lastFrame === current) return true;
      window.__lastFrame = current;
      return false;
    },
    { polling: 120, timeout: timeoutMs }
  );
}

const GROW = async (page) => {
  await page.click('[data-action="grow"]');
  await waitSettled(page);
  return page.evaluate(STATE);
};

// Canvas alpha census. The chamber's moss glow occupies the low-alpha band too,
// so ghost presence is proven by an A/B comparison at the same grow-in instant:
// a mid-grow frame pressed with ghosts vs one pressed without them — the glow and
// the seedling cancel out, and whatever alpha mass remains is ghost tissue.
const PIXELS = () => {
  const canvas = document.querySelector("#plant-canvas");
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let ghostBand = 0; // alpha 5..60 — resting ghost tissue over weak glow
  let faint = 0; // alpha 61..120 — antialiased edges, ghost-over-glow composites
  let bold = 0; // alpha > 120 — live specimen tissue
  let alphaSum = 0;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    alphaSum += a;
    if (a > 120) bold += 1;
    else if (a >= 61) faint += 1;
    else if (a >= 5) ghostBand += 1;
  }
  return { ghostBand, faint, bold, alphaSum };
};

const EARLY_FRAME_MS = 30; // first grow-in frame(s) drawn; the live specimen is barely risen

const MINORS = () => {
  const meta = document.querySelector('meta[name="theme-color"]');
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  const marks = Array.from(document.querySelectorAll(".axis-mark"));
  const wrap = document.querySelector(".canvas-wrap").getBoundingClientRect();
  const right = document.querySelector(".axis-mark-right")?.getBoundingClientRect();
  const btn = document.querySelector('[data-action="grow"]');
  btn.disabled = true;
  const disabledCursor = getComputedStyle(btn).cursor;
  btn.disabled = false;
  return {
    themeColor: meta?.content ?? null,
    htmlBackgroundColor: htmlBg,
    axisMarkCount: marks.length,
    rightAxisMark: right
      ? { present: true, rightOffsetPx: Math.round(wrap.right - right.right), verticallyCentered: Math.abs((right.top + right.height / 2) - (wrap.top + wrap.height / 2)) < 1 }
      : { present: false },
    disabledCursor,
  };
};

// Entry 5's floor probe, abbreviated: every text-bearing element's computed size.
const TEXT_FLOOR = () => {
  const isTextBearing = (el) =>
    Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let el;
  while ((el = walker.nextNode())) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || !isTextBearing(el)) continue;
    out.push({
      selector: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.split(" ").join(".") : ""),
      text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 40),
      fontSizePx: parseFloat(cs.fontSize),
    });
  }
  return out;
};

const linesOf = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1);
    return new Set(rects.map((r) => Math.round(r.top))).size;
  }, selector);

// ───────────────────────── Desktop 1440×900 ─────────────────────────
{
  const step = "desktop";
  const { page, errors } = await newPage(1440, 900);

  // (a) initial state
  const initial = await page.evaluate(STATE);
  results.steps.a_initial = initial;
  const minors = await page.evaluate(MINORS);
  results.steps.a_initial_minors = minors;
  ok(step, initial.seedLabel === "SPECIMEN / #5EED1234", `initial seed label: ${initial.seedLabel}`);
  ok(step, initial.ghostCount === 0, `initial ghost count: ${initial.ghostCount}`);
  ok(step, minors.themeColor === "#0b1410" && minors.htmlBackgroundColor === "rgb(11, 20, 16)", `theme-color: ${minors.themeColor} vs ground ${minors.htmlBackgroundColor}`);
  ok(step, minors.axisMarkCount === 4 && minors.rightAxisMark.present && minors.rightAxisMark.rightOffsetPx === 20 && minors.rightAxisMark.verticallyCentered, `axis marks: ${minors.axisMarkCount} right=${JSON.stringify(minors.rightAxisMark)}`);
  ok(step, minors.disabledCursor === "default", `disabled cursor: ${minors.disabledCursor}`);
  await page.screenshot({ path: OUT + "01-desktop-initial.png" });

  // (b) after 1 grow — the default specimen becomes the one ghost, seed renamed
  const after1 = await GROW(page);
  results.steps.b_after_1_grow = after1;
  ok(step, after1.seedLabel === `SPECIMEN / ${seedName(after1.liveSeed)}`, `seed label tracks live seed: ${after1.seedLabel} vs ${seedName(after1.liveSeed)}`);
  ok(step, after1.seedLabel !== initial.seedLabel, "seed label changed on grow");
  ok(step, after1.ghostCount === 1, `ghosts after 1 grow: ${after1.ghostCount}`);
  ok(step, after1.ghostSeeds === hex(initial.liveSeed), `ghost seed after 1 grow: ${after1.ghostSeeds} (expected ${hex(initial.liveSeed)})`);
  await page.screenshot({ path: OUT + "02-desktop-after-1-grow.png" });

  // mid-grow moment of grow #2: newest ghost dimming behind the rising seedling
  await page.click('[data-action="grow"]');
  await page.waitForTimeout(150);
  await page.locator(".chamber-frame").screenshot({ path: OUT + "03-desktop-midgrow-ghost-dim.png" });
  await waitSettled(page);
  const after2 = await page.evaluate(STATE);

  // (c) grows 3 and 4 — capacity 3, oldest evicted
  const after3 = await GROW(page);
  const after4 = await GROW(page);
  results.steps.c_after_4_grows = { after2, after3, after4 };
  const expectedGhosts = [after1.liveSeed, after2.liveSeed, after3.liveSeed].map(hex).join(",");
  ok(step, after4.ghostCount === 3, `ghosts after 4 grows: ${after4.ghostCount}`);
  ok(step, after4.ghostSeeds === expectedGhosts, `ghost seeds after 4 grows: ${after4.ghostSeeds} (expected ${expectedGhosts} — default ${hex(initial.liveSeed)} evicted)`);
  ok(step, !after4.ghostSeeds.split(",").includes(hex(initial.liveSeed)), "oldest (default) ghost evicted at capacity");
  ok(step, after3.ghostCount === 3, `ghosts after 3 grows already capped: ${after3.ghostCount}`);
  await page.screenshot({ path: OUT + "04-desktop-after-4-grows.png" });
  await page.locator("#plant-canvas").screenshot({ path: OUT + "05-desktop-ghost-closeup.png" });
  results.steps.c_pixel_census_settled_with_ghosts = await page.evaluate(PIXELS);

  // Treatment frame for the ghost pixel proof: press a 5th grow and census the
  // early frame (~30ms) — the live specimen has barely risen, so the bitmap is
  // glow + seedling + three ghost traces.
  await page.click('[data-action="grow"]');
  await page.waitForTimeout(EARLY_FRAME_MS);
  const treatment = await page.evaluate(PIXELS);
  await waitSettled(page);
  results.steps.c_pixel_census_early_frame_with_ghosts = treatment;

  // (d) reload — session-only proof: history lives only in memory
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  const reloaded = await page.evaluate(STATE);
  results.steps.d_after_reload = reloaded;
  ok(step, reloaded.ghostCount === 0 && reloaded.ghostSeeds === "", `reload clears history: count=${reloaded.ghostCount} seeds="${reloaded.ghostSeeds}"`);
  ok(step, reloaded.seedLabel === "SPECIMEN / #5EED1234", `reload restores baseline name: ${reloaded.seedLabel}`);
  await page.screenshot({ path: OUT + "06-desktop-after-reload.png" });

  // Control frame for the ghost pixel proof: from the empty (reloaded) history,
  // the same early-instant census without any ghosts — glow and seedling only.
  await page.click('[data-action="grow"]');
  await page.waitForTimeout(EARLY_FRAME_MS);
  const control = await page.evaluate(PIXELS);
  await waitSettled(page);
  results.steps.d_pixel_census_early_frame_without_ghosts = control;
  const ghostAlphaMass = treatment.alphaSum - control.alphaSum;
  results.steps.pixel_proof = {
    withGhostsAlphaSum: treatment.alphaSum,
    withoutGhostsAlphaSum: control.alphaSum,
    ghostAlphaMass,
    note: "same grow-in instant (~30ms): the difference is ghost tissue alone",
  };
  ok(step, ghostAlphaMass > 400_000, `ghost alpha mass at the early frame: ${ghostAlphaMass} (treatment ${treatment.alphaSum} vs control ${control.alphaSum})`);

  // (e) rapid double-grow — history coherent, one loop, no corruption
  // (state: one grow already made since reload, so history holds the default)
  await page.evaluate(() => {
    window.__rafCount = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      window.__rafCount += 1;
      return original(cb);
    };
  });
  await page.click('[data-action="grow"]');
  await page.waitForTimeout(80);
  await page.click('[data-action="grow"]');
  await waitSettled(page);
  const rapidRaf1 = await page.evaluate(() => window.__rafCount);
  await page.waitForTimeout(300);
  const rapidRaf2 = await page.evaluate(() => window.__rafCount);
  const rapid = await page.evaluate(STATE);
  results.steps.e_rapid_double_grow = { ...rapid, rafAtSettle: rapidRaf1, rafPlateau: rapidRaf2 };
  // From the post-control state (history holds the default, count 1), two rapid
  // grows must leave [default, control specimen, first-of-the-pair] in history
  // with the second-of-the-pair live — no half-grown, missing, or duplicated entries.
  const rapidGhostList = rapid.ghostSeeds.split(",").filter(Boolean);
  ok(step, rapid.ghostCount === 3, `rapid double-grow ghost count: ${rapid.ghostCount}`);
  ok(step, rapidGhostList[0] === hex(reloaded.liveSeed), `rapid history keeps default first: ${rapid.ghostSeeds}`);
  ok(step, rapidGhostList[2] !== rapidGhostList[0] && rapidGhostList[2] !== hex(rapid.liveSeed), `rapid history's newest is the first of the pair: ${rapid.ghostSeeds}`);
  ok(step, hex(rapid.liveSeed) !== rapidGhostList[2], `live seed advanced twice: ${rapid.liveSeed}`);
  ok(step, new Set(rapidGhostList).size === rapidGhostList.length, `rapid history has no duplicates: ${rapid.ghostSeeds}`);
  ok(step, rapidRaf1 === rapidRaf2, `rAF loop terminated (plateau ${rapidRaf1} → ${rapidRaf2})`);
  await page.screenshot({ path: OUT + "07-desktop-rapid-double-grow.png" });

  // (f) reduced-motion grow with ghosts present — immediate final frame, ghosts intact
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    window.__rafCount = 0;
  });
  const preReduced = await page.evaluate(STATE);
  await page.click('[data-action="grow"]');
  await page.waitForTimeout(150);
  const frameEarly = await page.evaluate(() => document.querySelector("#plant-canvas").toDataURL());
  const earlyRaf = await page.evaluate(() => window.__rafCount);
  await page.waitForTimeout(700);
  const frameSettled = await page.evaluate(() => document.querySelector("#plant-canvas").toDataURL());
  const settledRaf = await page.evaluate(() => window.__rafCount);
  const reduced = await page.evaluate(STATE);
  results.steps.f_reduced_motion = { preReduced, reduced, earlyRaf, settledRaf, byteIdentical: frameEarly === frameSettled };
  ok(step, frameEarly === frameSettled, "reduced-motion frame fully formed at 150ms (byte-identical to settled)");
  ok(step, earlyRaf === 0 && settledRaf === 0, `no rAF loop under reduced motion: ${earlyRaf}/${settledRaf}`);
  ok(step, reduced.ghostCount === 3, `ghosts preserved under reduced motion: ${reduced.ghostCount}`);
  await page.screenshot({ path: OUT + "08-desktop-reduced-motion-grow.png" });

  // text floor at 1440 (entry 5 probe, rerun with the new seed label in the DOM)
  const texts = await page.evaluate(TEXT_FLOOR);
  const min = Math.min(...texts.map((t) => t.fontSizePx));
  results.textFloor["desktop-1440"] = {
    count: texts.length,
    minFontSizePx: Math.round(min * 100) / 100,
    undersized: texts.filter((t) => t.fontSizePx < 11).map((t) => `${t.selector} ${t.fontSizePx}px`),
    seedReadout: texts.find((t) => t.text.startsWith("SPECIMEN / #")) ?? null,
  };
  ok(step, min >= 11.52, `min text size 1440: ${min}`);

  results.notes.desktopConsoleErrors = errors;
  ok(step, errors.length === 0, `console errors: ${JSON.stringify(errors)}`);
  await page.close();
}

// ───────────────────────── Mobile 390×844 ─────────────────────────
{
  const step = "mobile";
  const { page, errors } = await newPage(390, 844);

  const initial = await page.evaluate(STATE);
  ok(step, initial.seedLabel === "SPECIMEN / #5EED1234" && initial.ghostCount === 0, `mobile initial: ${JSON.stringify(initial)}`);
  await page.screenshot({ path: OUT + "09-mobile-initial.png" });

  await GROW(page);
  await GROW(page);
  await GROW(page);
  const after4 = await GROW(page);
  results.steps.mobile_after_4_grows = after4;
  ok(step, after4.ghostCount === 3, `mobile ghosts after 4 grows: ${after4.ghostCount}`);
  ok(step, after4.seedLabel.startsWith("SPECIMEN / #"), `mobile seed label: ${after4.seedLabel}`);
  await page.screenshot({ path: OUT + "10-mobile-after-4-grows.png" });

  const footerLines1 = await linesOf(page, '[data-specimen="seed"]');
  const footerLines2 = await linesOf(page, ".chamber-footer .mono-label:last-child");
  results.steps.mobile_footer_lines = { seedLabel: footerLines1, modelLabel: footerLines2 };
  ok(step, footerLines1 === 1 && footerLines2 === 1, `mobile footer labels one line each: ${footerLines1}/${footerLines2}`);

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("#plant-canvas")?.dataset.rendered === "true");
  const reloaded = await page.evaluate(STATE);
  ok(step, reloaded.ghostCount === 0, `mobile reload clears ghosts: ${reloaded.ghostCount}`);
  await page.screenshot({ path: OUT + "11-mobile-after-reload.png" });

  const texts = await page.evaluate(TEXT_FLOOR);
  const min = Math.min(...texts.map((t) => t.fontSizePx));
  results.textFloor["mobile-390"] = {
    count: texts.length,
    minFontSizePx: Math.round(min * 100) / 100,
    undersized: texts.filter((t) => t.fontSizePx < 11).map((t) => `${t.selector} ${t.fontSizePx}px`),
  };
  ok(step, min >= 11.52, `min text size 390: ${min}`);

  // 320px footer wrap guard (label text changed this entry)
  await page.setViewportSize({ width: 320, height: 800 });
  const narrowLines = { seed: await linesOf(page, '[data-specimen="seed"]'), model: await linesOf(page, ".chamber-footer .mono-label:last-child") };
  results.steps.min320_footer_lines = narrowLines;
  ok(step, narrowLines.seed <= 2 && narrowLines.model <= 2, `320px footer labels wrap whole-line: ${JSON.stringify(narrowLines)}`);

  results.notes.mobileConsoleErrors = errors;
  ok(step, errors.length === 0, `mobile console errors: ${JSON.stringify(errors)}`);
  await page.close();
}

await browser.close();
writeFileSync(OUT + "polish-evidence.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify({ failures: results.failures, textFloor: results.textFloor, pixelProof: results.steps.pixel_proof }, null, 2));
process.exit(results.failures.length > 0 ? 1 : 0);
