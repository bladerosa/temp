// Patch run #2: F5 + F6 — simpler, more robust selectors.
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIGURES_DIR = resolve(__dirname, 'figures');
const ORIGIN = 'http://127.0.0.1:5173';
const VIEWPORT = { width: 1440, height: 900 };
const DSF = 2;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// In-page annotation helper. Defines window.place so subsequent evaluate()
// calls can invoke it directly.
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
    else if (pos === 'ct') { x = r.left + r.width/2 - 13; y = r.top - 13; }
    else if (pos === 'cb') { x = r.left + r.width/2 - 13; y = r.bottom - 13; }
    const dot = document.createElement('div');
    dot.className = 'prd-anno';
    dot.textContent = n;
    dot.style.cssText = \`position:fixed;top:\${y}px;left:\${x}px;width:26px;height:26px;border-radius:50%;background:#EC684C;color:#fff;font:700 13px/22px Poppins,sans-serif;text-align:center;z-index:99999;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);\`;
    document.body.appendChild(dot);
  }
}
`;

async function setup(page) {
  // Inject style + helper once after navigation
  await page.addStyleTag({ content: '.prd-anno{font-family:Poppins,sans-serif}' });
}
async function shoot(page, name) {
  const f = resolve(FIGURES_DIR, name);
  await page.screenshot({ path: f, fullPage: false });
  console.log('saved', f);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DSF });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'warning') console.log('[page]', m.text().slice(0, 200)); });

  // ============ F5 — withdraw_short with cooldown + warn-tip ============
  console.log('[capture] F5');
  await page.goto(ORIGIN + '/collection/auto', { waitUntil: 'networkidle' });
  await page.click('.btn.primary');
  await wait(300);
  await page.click('.type-grid .type-card:nth-child(4)'); // withdraw_short
  await wait(350);
  await page.fill('.field input[placeholder*="稳定币"]', '示例-BSC 提现兜底归集');
  await page.click('.picker-row .picker-col:nth-child(2) .picker-list .picker-item:nth-child(1)');
  await wait(200);
  // Scroll modal body to show warn-tip (which is at the bottom of modal-body)
  await page.evaluate(() => {
    const body = document.querySelector('.modal-body');
    if (body) body.scrollTo({ top: body.scrollHeight });
  });
  await wait(200);
  await page.evaluate(PLACE_FN);
  await page.evaluate(() => {
    const labels = [...document.querySelectorAll('.field > label')];
    const cooldownLabel = labels.find((l) => l.textContent.trim().startsWith('重复触发最短间隔'));
    const cooldownField = cooldownLabel ? cooldownLabel.parentElement : null;
    const cooldownRow = cooldownField ? cooldownField.querySelector('.row') : null;

    const anns = [
      { sel: '.warn-tip',                      n: 1, pos: 'tl' },
      { sel: '.amount-usd-block .input-wrap',  n: 2, pos: 'tl' },
      { sel: '.modal-foot .btn.primary',       n: 4, pos: 'tr' },
    ];
    if (cooldownRow) {
      const r = cooldownRow.getBoundingClientRect();
      anns.push({ n: 3, pos: 'tl', xy: [r.left, r.top] });
    }
    window.place(anns);
  });
  await shoot(page, 'F5-create-step-b-withdraw-short.png');

  // ============ F6 — Mixed mode by EDITING tk_005 ============
  console.log('[capture] F6 (via edit tk_005)');
  // Close the previous modal first
  await page.evaluate(() => {
    const cancel = [...document.querySelectorAll('.modal-foot .btn.ghost')].find((b) => b.textContent.includes('取消'));
    if (cancel) cancel.click();
  });
  await wait(300);
  // Find the row with tk_005 and click 编辑
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.table tbody tr')];
    const target = rows.find((r) => r.textContent.includes('tk_005'));
    if (!target) throw new Error('tk_005 row not found');
    const editBtn = [...target.querySelectorAll('td:last-child .btn.ghost.sm')].find((b) => b.textContent.includes('编辑'));
    if (editBtn) editBtn.click();
  });
  await wait(400);
  // Scroll modal body to bring AmountInput area into view
  await page.evaluate(() => {
    const block = document.querySelector('.amount-usd-block');
    if (block) block.scrollIntoView({ block: 'start' });
  });
  await wait(250);
  await page.evaluate(PLACE_FN);
  await page.evaluate(() => {
    window.place([
      { sel: '.amount-usd-block',                              n: 1, pos: 'tl' },
      { sel: '.amount-usd-block .input-wrap',                  n: 2, pos: 'tr' },
      { sel: '.warn-tip',                                      n: 3, pos: 'tl' },
      { sel: '.amount-table',                                  n: 4, pos: 'tl' },
      { sel: '.amount-table .amount-table-row:nth-child(2)',   n: 5, pos: 'tr' },
    ]);
  });
  await shoot(page, 'F6-amount-input-mixed.png');

  await ctx.close();
  await browser.close();
  console.log('[done]');
})();
