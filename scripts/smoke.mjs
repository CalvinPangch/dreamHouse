/**
 * Smoke test for the terrace model.
 *
 * A static site always returns 200, even when the scene is broken - so this
 * loads the page in a real browser, walks every view, and fails on console
 * errors, failed requests or a frame that rendered nothing.
 *
 *   BASE_URL=http://127.0.0.1:8080 node scripts/smoke.mjs
 *   SHOT_DIR=shots ... (optional) writes a screenshot per view
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base = (process.env.BASE_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
const shotDir = process.env.SHOT_DIR || '';
const views = ['street', 'facade', 'aerial', 'cutaway', 'ground', 'upper', 'interior'];
const assets = ['/favicon.svg', '/preview.png', '/src/main.js', '/vendor/three/three.module.min.js'];

const problems = [];
const fail = (msg) => problems.push(msg);

if (shotDir) mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on('pageerror', (e) => fail(`uncaught exception: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && fail(`console error: ${m.text()}`));
page.on('requestfailed', (r) => fail(`request failed: ${r.url()} (${r.failure()?.errorText})`));

try {
  const res = await page.goto(`${base}/`, { waitUntil: 'load', timeout: 60_000 });
  if (!res?.ok()) fail(`GET / responded ${res?.status()}`);

  // main.js publishes window.dreamHouse once the scene is up
  await page.waitForFunction(() => !!window.dreamHouse, null, { timeout: 60_000 });
  await page.waitForTimeout(1500);

  for (const path of assets) {
    const r = await page.request.get(base + path);
    if (!r.ok()) fail(`GET ${path} responded ${r.status()}`);
  }

  for (const view of views) {
    await page.click(`[data-view="${view}"]`);
    await page.waitForTimeout(1000);
    const triangles = await page.evaluate(() => window.dreamHouse.renderer.info.render.triangles);
    if (!(triangles > 1000)) fail(`view "${view}" drew only ${triangles} triangles`);
    if (shotDir) await page.screenshot({ path: `${shotDir}/${view}.png` });
  }

  const setRange = (sel, value) =>
    page.$eval(sel, (el, v) => {
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);

  await setRange('#pairs', '3'); // rebuilds the whole street
  await page.waitForTimeout(1500);
  await setRange('#hour', '20'); // night lighting
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => window.dreamHouse.state);
  if (state.pairs !== 3) fail(`pair slider did not rebuild the street (pairs=${state.pairs})`);
  if (shotDir) await page.screenshot({ path: `${shotDir}/night-3-pairs.png` });
} catch (err) {
  fail(`${err.name}: ${err.message}`);
} finally {
  await browser.close();
}

if (problems.length) {
  console.error(`FAIL - ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`PASS - ${views.length} views rendered from ${base} with no errors`);
