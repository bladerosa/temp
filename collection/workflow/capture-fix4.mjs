// Patch run #4: re-shoot F8 with markers anchored to column headings.
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIGURES_DIR = resolve(__dirname, 'figures');
const ORIGIN = 'http://127.0.0.1:5173';
const VIEWPORT = { width: 1440, height: 900 };
const DSF = 2;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const PLACE_FN = `
window.place = function(anns) {
  document.querySelectorAll('.prd-anno').forEach(e => e.remove());
  for (const { sel, n, pos = 'tl', xy } of anns) {
    let r;
    if (xy) r = { left: xy[0], top: xy[1], right: xy[0], bottom: xy[1], width: 0, height: 0 };
    else {
      const el = document.querySelector(sel);
      if (!el) { console.warn('not found', sel); continue; }
      r = el.getBoundingClientRect();
    }
    let x = r.left - 13, y = r.top - 13;
    if (pos === 'tr') { x = r.right - 13; y = r.top - 13; }
    else if (pos === 'cl') { x = r.left - 13; y = r.top + r.height/2 - 13; }
    else if (pos === 'cr') { x = r.right - 13; y = r.top + r.height/2 - 13; }
    const dot = document.createElement('div');
    dot.className = 'prd-anno';
    dot.textContent = n;
    dot.style.cssText = \`position:fixed;top:\${y}px;left:\${x}px;width:26px;height:26px;border-radius:50%;background:#EC684C;color:#fff;font:700 13px/22px Poppins,sans-serif;text-align:center;z-index:99999;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);\`;
    document.body.appendChild(dot);
  }
};
`;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'warning') console.log('[page]', m.text().slice(0, 200)); });

  console.log('[capture] F8 (corrected #2/#3 placement)');
  await page.goto(ORIGIN + '/collection/manual', { waitUntil: 'networkidle' });
  await wait(300);
  await page.evaluate(PLACE_FN);
  await page.evaluate(() => {
    const cols = document.querySelectorAll('.picker-row .picker-col');
    const chainHeading = cols[0]?.querySelector('h5');
    const tokenHeading = cols[1]?.querySelector('h5');
    const anns = [
      { sel: '.card .row .chip.primary',                          n: 1, pos: 'tl' },
    ];
    if (chainHeading) {
      const r = chainHeading.getBoundingClientRect();
      // Place LEFT of the heading text
      anns.push({ n: 2, pos: 'cl', xy: [r.left, r.top + r.height/2] });
    }
    if (tokenHeading) {
      const r = tokenHeading.getBoundingClientRect();
      // Place LEFT of the heading text (clearly on TOKEN column)
      anns.push({ n: 3, pos: 'cl', xy: [r.left, r.top + r.height/2] });
    }
    anns.push(
      { sel: '.field-grid .field:nth-child(1) .input-wrap',       n: 4, pos: 'tr' },
      { sel: '.field-grid .field:nth-child(2) .picker-block',     n: 5, pos: 'tl' },
      { sel: '.btn.primary.lg',                                   n: 6, pos: 'tr' },
    );
    window.place(anns);
  });
  await page.screenshot({ path: resolve(FIGURES_DIR, 'F8-manual-step1.png'), fullPage: false });
  console.log('saved F8-manual-step1.png');

  await ctx.close();
  await browser.close();
  console.log('[done]');
})();
