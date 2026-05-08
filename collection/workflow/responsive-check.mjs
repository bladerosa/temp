// Responsive snapshot rig — captures the same routes at 375 / 768 / 1024 / 1440 widths.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'responsive-shots');
mkdirSync(OUT, { recursive: true });

const ORIGIN = 'http://127.0.0.1:5173';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: 'mobile-375',  w: 375,  h: 812 },   // iPhone X-ish
  { name: 'tablet-768',  w: 768,  h: 1024 },  // iPad portrait
  { name: 'desktop-1024', w: 1024, h: 768 },  // small laptop
  { name: 'wide-1440',   w: 1440, h: 900 },   // standard laptop
];

const ROUTES = [
  { name: 'auto',   path: '/collection/auto' },
  { name: 'manual', path: '/collection/manual' },
  { name: 'jobs',   path: '/collection/jobs' },
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    for (const r of ROUTES) {
      await page.goto(ORIGIN + r.path, { waitUntil: 'networkidle' });
      await wait(400);
      const file = resolve(OUT, `${vp.name}__${r.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log('saved', file);
    }
    // Also capture the auto page with the mobile drawer open (only for mobile-375)
    if (vp.name === 'mobile-375') {
      await page.goto(ORIGIN + '/collection/auto', { waitUntil: 'networkidle' });
      await wait(300);
      // click hamburger
      await page.click('.menu-toggle');
      await wait(300);
      await page.screenshot({ path: resolve(OUT, `${vp.name}__auto-drawer-open.png`), fullPage: false });
      console.log('saved drawer-open snapshot');
    }
    await ctx.close();
  }
  await browser.close();
  console.log('[done]');
})();
