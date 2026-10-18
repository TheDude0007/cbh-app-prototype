// Automated version of the "before you present" checklist in README.md.
// Usage: npm test            (checks production: Vercel deep, GitHub Pages parity)
//        npm test -- <url>   (deep-checks a single arbitrary URL, e.g. a PR preview)
import { chromium } from 'playwright';
import fs from 'node:fs';

const arg = process.argv[2];
const SITES = arg
  ? { target: arg }
  : {
      vercel: 'https://cbh-app-prototype.vercel.app/',
      pages: 'https://thedude0007.github.io/cbh-app-prototype/',
    };

const SHOT_DIR = new URL('../test-results/', import.meta.url).pathname;
fs.mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
function log(ok, label, detail) {
  results.push({ ok, label, detail: detail || '' });
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + label + (detail ? '  — ' + detail : ''));
}

async function run(browser, name, url, { deep }) {
  const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('requestfailed', (req) => failedRequests.push(req.url() + ' — ' + (req.failure()?.errorText || 'failed')));

  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  log(resp && resp.ok(), `[${name}] page loads`, `HTTP ${resp && resp.status()}`);

  const title = await page.title();
  log(title === 'ColoradoBassHeads app prototype', `[${name}] title correct`, title);

  if (!deep) {
    log(consoleErrors.length === 0, `[${name}] no console errors`, consoleErrors.slice(0, 3).join(' | '));
    await context.close();
    return;
  }

  // tap Play on a headliner — confirm SoundCloud actually loads
  const playBtn = page.locator('.sc-load').first();
  await playBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  if (await playBtn.count()) {
    await playBtn.click();
    try {
      const frame = page.locator('iframe[src*="soundcloud.com"]').first();
      await frame.waitFor({ state: 'attached', timeout: 10000 });
      const src = await frame.getAttribute('src');
      log(!!src && src.includes('soundcloud.com'), `[${name}] tap Play loads SoundCloud iframe`, src);
    } catch {
      log(false, `[${name}] tap Play loads SoundCloud iframe`, 'iframe never appeared');
    }
  } else {
    log(false, `[${name}] tap Play loads SoundCloud iframe`, 'no .sc-load button found on load');
  }

  // Multipass rail — confirm flyers actually render (real S3 images, not just DOM nodes)
  const railImgs = page.locator('.rail .mp-card img');
  const railCount = await railImgs.count();
  let loadedCount = 0;
  for (let i = 0; i < railCount; i++) {
    const nw = await railImgs.nth(i).evaluate((img) => img.naturalWidth).catch(() => 0);
    if (nw > 0) loadedCount++;
  }
  log(railCount > 0 && loadedCount > 0, `[${name}] Multipass rail flyers load`, `${loadedCount}/${railCount} images rendered`);

  const flyerSrcs = await railImgs.evaluateAll((imgs) => imgs.map((i) => i.src));
  let s3Ok = 0;
  for (const src of flyerSrcs.slice(0, 5)) {
    try {
      const r = await context.request.get(src);
      if (r.ok()) s3Ok++;
    } catch {}
  }
  log(s3Ok === Math.min(5, flyerSrcs.length) && flyerSrcs.length > 0, `[${name}] Multipass flyer S3 URLs return 200`, `${s3Ok}/${Math.min(5, flyerSrcs.length)} checked OK`);

  // Owner portal switch
  await page.locator('button[data-act="mode"][data-v="owner"]').click();
  log((await page.locator('#ownerView.on').count()) > 0, `[${name}] Owner portal switch works`);

  // flyer-to-show sample flow, end to end
  await page.locator('#ownerNav button[data-act="opage"][data-v="newshow"]').click();
  const sampleBtn = page.locator('button[data-act="sample"]');
  await sampleBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  if (await sampleBtn.count()) {
    await sampleBtn.click();
    try {
      const publishBtn = page.locator('button[data-act="publish"]:not([disabled])');
      await publishBtn.waitFor({ state: 'visible', timeout: 10000 });
      log(true, `[${name}] AI flyer read completes, Publish enables`);
      await publishBtn.click();
      const toast = page.locator('#ownerToast.on');
      await toast.waitFor({ state: 'visible', timeout: 5000 });
      const toastText = (await toast.textContent() || '').trim();
      log(toastText.toLowerCase().includes('published'), `[${name}] Publish confirms to owner`, toastText);
    } catch {
      log(false, `[${name}] AI flyer read completes, Publish enables`, 'Publish button never enabled');
    }
  } else {
    log(false, `[${name}] flyer sample flow`, '"Use the sample flyer" button not found');
  }

  log(consoleErrors.length === 0, `[${name}] no console errors`, consoleErrors.slice(0, 5).join(' | '));
  log(pageErrors.length === 0, `[${name}] no uncaught JS errors`, pageErrors.slice(0, 5).join(' | '));
  log(failedRequests.length === 0, `[${name}] no failed network requests`, failedRequests.slice(0, 5).join(' | '));

  await page.screenshot({ path: `${SHOT_DIR}/${name}-final.png` });
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const entries = Object.entries(SITES);
  for (const [name, url] of entries) {
    await run(browser, name, url, { deep: true });
  }
  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log('\n' + '='.repeat(60));
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach((f) => console.log(' - ' + f.label + (f.detail ? ' (' + f.detail + ')' : '')));
  }
  process.exit(failed.length ? 1 : 0);
})();
