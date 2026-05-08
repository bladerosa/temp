// Patch run #3: re-shoot F3, F4 at 1440x1200 viewport so the cooldown / save
// button below the 900-pt fold are also captured with their markers.
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIGURES_DIR = resolve(__dirname, 'figures');
const ORIGIN = 'http://127.0.0.1:5173';
const VIEWPORT = { width: 1440, height: 1200 };
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
    else if (pos === 'br') { x = r.right - 13; y = r.bottom - 13; }
    else if (pos === 'bl') { x = r.left - 13; y = r.bottom - 13; }
    else if (pos === 'cr') { x = r.right - 13; y = r.top + r.height/2 - 13; }
    else if (pos === 'cl') { x = r.left - 13; y = r.top + r.height/2 - 13; }
    else if (pos === 'cb') { x = r.left + r.width/2 - 13; y = r.bottom - 13; }
    const dot = document.createElement('div');
    dot.className = 'prd-anno';
    dot.textContent = n;
    dot.style.cssText = \`position:fixed;top:\${y}px;left:\${x}px;width:26px;height:26px;border-radius:50%;background:#EC684C;color:#fff;font:700 13px/22px Poppins,sans-serif;text-align:center;z-index:99999;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);\`;
    document.body.appendChild(dot);
  }
};
`;

async function shoot(page, name) {
  await page.screenshot({ path: resolve(FIGURES_DIR, name), fullPage: false });
  console.log('saved', name);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'warning') console.log('[page]', m.text().slice(0, 200)); });

  // F3 — large_deposit
  console.log('[capture] F3');
  await page.goto(ORIGIN + '/collection/auto', { waitUntil: 'networkidle' });
  await page.click('.btn.primary');
  await wait(300);
  await page.click('.type-grid .type-card:nth-child(1)');
  await wait(350);
  await page.fill('.field input[placeholder*="稳定币"]', '示例-TRX-USDT 大额充值即时归集');
  await page.click('.picker-row .picker-col:nth-child(2) .picker-list .picker-item:nth-child(1)');
  await wait(200);
  await page.evaluate(PLACE_FN);
  await page.evaluate(() => {
    const labels = [...document.querySelectorAll('.field > label')];
    const cooldownLabel = labels.find((l) => l.textContent.trim().startsWith('重复触发最短间隔'));
    const cooldownRow = cooldownLabel?.parentElement.querySelector('.row');
    const anns = [
      { sel: '.tip',                                          n: 1, pos: 'tr' },
      { sel: '.field-grid .field:nth-child(1) input',         n: 2, pos: 'tl' },
      { sel: '.field-grid .field:nth-child(2) input',         n: 3, pos: 'tl' },
      { sel: '.multi-select',                                 n: 4, pos: 'tl' },
      { sel: '.picker-block',                                 n: 5, pos: 'tl' },
      { sel: '.amount-usd-block .input-wrap',                 n: 6, pos: 'tl' },
      { sel: '.modal-foot .btn.primary',                      n: 8, pos: 'tr' },
    ];
    if (cooldownRow) {
      const r = cooldownRow.getBoundingClientRect();
      anns.push({ n: 7, pos: 'tl', xy: [r.left, r.top] });
    }
    window.place(anns);
  });
  await shoot(page, 'F3-create-step-b-large-deposit.png');

  // F4 — balance_check
  console.log('[capture] F4');
  await page.goto(ORIGIN + '/collection/auto', { waitUntil: 'networkidle' });
  await page.click('.btn.primary');
  await wait(300);
  await page.click('.type-grid .type-card:nth-child(3)'); // balance_check
  await wait(350);
  await page.fill('.field input[placeholder*="稳定币"]', '示例-稳定币每日余额扫描');
  await page.click('.picker-row .picker-col:nth-child(2) .picker-list .picker-item:nth-child(1)');
  await wait(200);
  await page.evaluate(PLACE_FN);
  await page.evaluate(() => {
    const scheduleGrid = document.querySelector('.schedule-grid');
    const lbls = scheduleGrid ? [...scheduleGrid.querySelectorAll('.lbl')] : [];
    const execTimeLabel = lbls.find((l) => l.textContent.includes('执行时刻'));
    const anns = [
      { sel: '.amount-usd-block .input-wrap',     n: 1, pos: 'tl' },
      { sel: '.schedule-grid',                    n: 2, pos: 'tl' },
      { sel: '.modal-foot .btn.primary',          n: 4, pos: 'tr' },
    ];
    if (execTimeLabel) {
      const r = execTimeLabel.getBoundingClientRect();
      anns.push({ n: 3, pos: 'cl', xy: [r.left, r.top + r.height/2] });
    }
    window.place(anns);
  });
  await shoot(page, 'F4-create-step-b-balance-check.png');

  // F9 also benefits from taller viewport — re-shoot
  console.log('[capture] F9 (taller)');
  await page.goto(ORIGIN + '/collection/manual', { waitUntil: 'networkidle' });
  await wait(200);
  await page.click('.btn.primary.lg');
  await wait(900);
  await page.evaluate(() => {
    const checks = [...document.querySelectorAll('.table tbody tr .check')];
    checks.slice(0, 3).forEach((c) => c.click());
  });
  await wait(200);
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.scroll > .card');
    if (cards.length >= 2) cards[1].scrollIntoView({ block: 'start' });
  });
  await wait(200);
  await page.evaluate(PLACE_FN);
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.scroll > .card');
    const step2 = cards[1];
    if (!step2) return;
    const stats = step2.querySelectorAll('.stat-strip .stat');
    const tableHead = step2.querySelector('.table thead tr th:first-child');
    const tableRow = step2.querySelector('.table tbody tr:first-child');
    const tip = step2.querySelector('.warn-tip, .tip');
    const submit = step2.querySelector('.btn.primary.lg');
    const anns = [];
    const r = (el) => el.getBoundingClientRect();
    if (stats[0]) anns.push({ n: 1, pos: 'tl', xy: [r(stats[0]).left, r(stats[0]).top] });
    if (stats[1]) anns.push({ n: 2, pos: 'tl', xy: [r(stats[1]).left, r(stats[1]).top] });
    if (stats[2]) anns.push({ n: 3, pos: 'tl', xy: [r(stats[2]).left, r(stats[2]).top] });
    if (tableHead) anns.push({ n: 4, pos: 'tl', xy: [r(tableHead).left, r(tableHead).top] });
    if (tableRow) anns.push({ n: 5, pos: 'cl', xy: [r(tableRow).left, r(tableRow).top + r(tableRow).height/2] });
    if (tip) anns.push({ n: 6, pos: 'tl', xy: [r(tip).left, r(tip).top] });
    if (submit) anns.push({ n: 7, pos: 'tr', xy: [r(submit).right, r(submit).top] });
    window.place(anns);
  });
  await shoot(page, 'F9-manual-step2.png');

  await ctx.close();
  await browser.close();
  console.log('[done]');
})();
