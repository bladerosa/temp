// Annotated screenshot pipeline for the 归集系统 PRD figures.
// Spawns a Playwright Chromium pointed at the running dev server,
// drives the UI to each required state, injects DOM annotations,
// then writes high-DPI PNG to workflow/figures/F{N}-{slug}.png.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIGURES_DIR = resolve(__dirname, 'figures');
mkdirSync(FIGURES_DIR, { recursive: true });

const ORIGIN = 'http://127.0.0.1:5173';
const VIEWPORT = { width: 1440, height: 900 };
const DSF = 2; // 2x DPI for crisp PRD images

// ============================================================
// Annotation helper that runs inside the page.
// ============================================================
const ANNOTATION_HELPER = `
(() => {
  if (window.__anno) return 'already-installed';
  const css = document.createElement('style');
  css.id = 'prd-anno-css';
  css.textContent = \`
    .prd-anno {
      position: fixed;
      width: 26px; height: 26px;
      border-radius: 50%;
      background: #EC684C;
      color: #fff;
      font: 700 13px/22px Poppins, sans-serif;
      text-align: center;
      z-index: 99999;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,.35);
      pointer-events: none;
    }
  \`;
  document.head.appendChild(css);
  window.__anno = function(items) {
    document.querySelectorAll('.prd-anno').forEach(e => e.remove());
    items.forEach(({ sel, n, pos }) => {
      const target = typeof sel === 'string' ? document.querySelector(sel) : null;
      if (!target) { console.warn('prd-anno: not found', sel); return; }
      const r = target.getBoundingClientRect();
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
      dot.style.top = y + 'px';
      dot.style.left = x + 'px';
      document.body.appendChild(dot);
    });
    return items.length;
  };
  return 'installed';
})()
`;

// ============================================================
// Figure recipes. Each is a function: (page) => Promise<void>
// that drives the UI to the desired state, then calls annotate.
// ============================================================
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function setupAndNavigate(page, path) {
  await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });
  // Force sidebar expanded (auto-collapse fires on ≤1280px viewport, but we use 1440)
  await page.evaluate(ANNOTATION_HELPER);
  await wait(150);
}

async function annotate(page, items) {
  await page.evaluate(`window.__anno(${JSON.stringify(items)})`);
  await wait(50);
}

async function shoot(page, name) {
  const file = resolve(FIGURES_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
}

const FIGURES = [
  // ------- F1: auto list main page -------
  {
    name: 'F1-auto-list.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/auto');
      await annotate(page, [
        { sel: '.btn.primary',                                         n: 1, pos: 'tl' },
        { sel: '.stat-strip .stat:nth-child(1)',                       n: 2, pos: 'tr' },
        { sel: '.table-toolbar .filter-select',                        n: 3, pos: 'tr' },
        { sel: '.table thead tr th:nth-child(2)',                      n: 4, pos: 'cb' },
        { sel: '.table tbody tr:nth-child(1) td:nth-child(1)',         n: 5, pos: 'tl' },
        { sel: '.table tbody tr:nth-child(1) td:nth-child(2)',         n: 6, pos: 'tl' },
        { sel: '.table tbody tr:nth-child(1) td:nth-child(3)',         n: 7, pos: 'tl' },
        { sel: '.table tbody tr:nth-child(1) td:nth-child(4)',         n: 8, pos: 'tl' },
        { sel: '.table tbody tr:nth-child(1) td:nth-child(6) .switch', n: 9, pos: 'cl' },
        { sel: '.table tbody tr:nth-child(1) td:nth-child(7)',         n: 10, pos: 'cl' },
      ]);
    },
  },

  // ------- F2: Step A type chooser -------
  {
    name: 'F2-create-step-a.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/auto');
      await page.click('.btn.primary'); // open modal
      await wait(300);
      await annotate(page, [
        { sel: '.modal-head h3',                       n: 1, pos: 'cr' },
        { sel: '.type-grid .type-card:nth-child(1)',   n: 2, pos: 'tl' },
        { sel: '.type-grid .type-card:nth-child(2)',   n: 3, pos: 'tr' },
        { sel: '.type-grid .type-card:nth-child(3)',   n: 4, pos: 'bl' },
        { sel: '.type-grid .type-card:nth-child(4)',   n: 5, pos: 'br' },
      ]);
    },
  },

  // ------- F3: Step B for large_deposit -------
  {
    name: 'F3-create-step-b-large-deposit.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/auto');
      await page.click('.btn.primary');
      await wait(250);
      // First type-card is large_deposit
      await page.click('.type-grid .type-card:nth-child(1)');
      await wait(300);
      // Fill name
      await page.fill('.field input[placeholder*="稳定币"]', '示例-TRX-USDT 大额充值即时归集');
      // Pick TRX:USDT in the multi-token picker — TRON is selected by default at row 1; USDT is the first token
      // Click TRX chain (already active) and then click USDT token row
      await page.click('.picker-row .picker-col:nth-child(2) .picker-list .picker-item:nth-child(1)');
      await wait(150);
      await annotate(page, [
        { sel: '.tip',                                                                            n: 1, pos: 'tr' },
        { sel: '.field-grid .field:nth-child(1) input',                                           n: 2, pos: 'tl' },
        { sel: '.field-grid .field:nth-child(2) input',                                           n: 3, pos: 'tl' },
        { sel: '.multi-select',                                                                   n: 4, pos: 'tl' },
        { sel: '.picker-block',                                                                   n: 5, pos: 'tl' },
        { sel: '.amount-usd-block .input-wrap',                                                   n: 6, pos: 'tl' },
        // Cooldown is the next .field after AmountInput, in large_deposit type
        { sel: '.field[style*="max-width: 360px"] .row',                                          n: 7, pos: 'tl' },
        { sel: '.modal-foot .btn.primary',                                                        n: 8, pos: 'tr' },
      ]);
    },
  },

  // ------- F4: Step B for balance_check (with schedule) -------
  {
    name: 'F4-create-step-b-balance-check.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/auto');
      await page.click('.btn.primary');
      await wait(250);
      // Third type-card is balance_check
      await page.click('.type-grid .type-card:nth-child(3)');
      await wait(300);
      await page.fill('.field input[placeholder*="稳定币"]', '示例-稳定币每日余额扫描');
      await page.click('.picker-row .picker-col:nth-child(2) .picker-list .picker-item:nth-child(1)');
      await wait(150);
      await annotate(page, [
        { sel: '.amount-usd-block .input-wrap',                       n: 1, pos: 'tl' },
        { sel: '.schedule-grid',                                      n: 2, pos: 'tl' },
        // 2nd row of schedule grid is execute time
        { sel: '.schedule-grid .lbl:nth-of-type(2)',                  n: 3, pos: 'cl' },
        { sel: '.modal-foot .btn.primary',                            n: 4, pos: 'tr' },
      ]);
    },
  },

  // ------- F5: Step B for withdraw_short (cooldown + warn-tip) -------
  {
    name: 'F5-create-step-b-withdraw-short.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/auto');
      await page.click('.btn.primary');
      await wait(250);
      // Fourth type-card is withdraw_short
      await page.click('.type-grid .type-card:nth-child(4)');
      await wait(300);
      await page.fill('.field input[placeholder*="稳定币"]', '示例-BSC 提现兜底归集');
      await page.click('.picker-row .picker-col:nth-child(2) .picker-list .picker-item:nth-child(1)');
      await wait(150);
      // Scroll the modal body to bring warn-tip into view
      await page.evaluate(() => {
        const body = document.querySelector('.modal-body');
        if (body) body.scrollTop = body.scrollHeight;
      });
      await wait(150);
      await annotate(page, [
        { sel: '.warn-tip',                                           n: 1, pos: 'tl' },
        { sel: '.amount-usd-block .input-wrap',                       n: 2, pos: 'tl' },
        // cooldown field has label "重复触发最短间隔"
        { sel: '.field-grid .field:nth-child(2) .row',                n: 3, pos: 'tl' },
        { sel: '.modal-foot .btn.primary',                            n: 4, pos: 'tr' },
      ]);
    },
  },

  // ------- F6: AmountInput mixed mode (BSC:GAME + BSC:USDT) -------
  {
    name: 'F6-amount-input-mixed.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/auto');
      await page.click('.btn.primary');
      await wait(250);
      await page.click('.type-grid .type-card:nth-child(3)'); // balance_check
      await wait(300);
      await page.fill('.field input[placeholder*="稳定币"]', '示例-BSC 混合扫描');
      // Select BNB Chain in the chain picker, then GAME + USDT tokens
      // Find BSC chain row: picker-col:first .picker-list .picker-item containing "BNB Chain"
      await page.evaluate(() => {
        const items = document.querySelectorAll('.picker-row .picker-col:nth-child(1) .picker-list .picker-item');
        for (const it of items) if (it.textContent.includes('BNB')) { it.click(); break; }
      });
      await wait(200);
      // Now token list shows BSC tokens. Pick GAME then USDT
      await page.evaluate(() => {
        const items = document.querySelectorAll('.picker-row .picker-col:nth-child(2) .picker-list .picker-item');
        for (const it of items) {
          const txt = it.textContent;
          if (txt.includes('GAME') || txt.includes('USDT')) it.click();
        }
      });
      await wait(200);
      // Scroll modal so the AmountInput section is visible
      await page.evaluate(() => {
        const inp = document.querySelector('.amount-table');
        if (inp) inp.scrollIntoView({ block: 'center' });
      });
      await wait(200);
      await annotate(page, [
        { sel: '.amount-usd-block',                                   n: 1, pos: 'tl' },
        { sel: '.warn-tip',                                           n: 2, pos: 'tr' },
        { sel: '.amount-table',                                       n: 3, pos: 'tl' },
        { sel: '.amount-table-row:nth-child(2)',                      n: 4, pos: 'tr' },
      ]);
    },
  },

  // ------- F7: Delete-task confirm (dismissable=false) -------
  {
    name: 'F7-delete-confirm.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/auto');
      // Click trash icon on first row (tk_001)
      await page.evaluate(() => {
        const row = document.querySelector('.table tbody tr:nth-child(1)');
        if (!row) return;
        // The 2nd ghost button (delete) is the second .btn.ghost.sm inside actions cell
        const btns = row.querySelectorAll('td:last-child .btn.ghost.sm');
        if (btns.length >= 2) btns[1].click();
      });
      await wait(300);
      await annotate(page, [
        { sel: '.modal-head h3',                                      n: 1, pos: 'cr' },
        { sel: '.warn-tip',                                           n: 2, pos: 'tl' },
        { sel: '.modal-foot .btn.ghost',                              n: 3, pos: 'tl' },
        { sel: '.modal-foot .btn.danger',                             n: 4, pos: 'tr' },
      ]);
    },
  },

  // ------- F8: Manual Step 1 -------
  {
    name: 'F8-manual-step1.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/manual');
      await wait(300);
      await annotate(page, [
        { sel: '.card .row .chip.primary',                                  n: 1, pos: 'tl' },
        { sel: '.picker-row .picker-col:nth-child(1)',                      n: 2, pos: 'tr' },
        { sel: '.picker-row .picker-col:nth-child(2)',                      n: 3, pos: 'tl' },
        { sel: '.field-grid .field:nth-child(1) .input-wrap',               n: 4, pos: 'tr' },
        { sel: '.field-grid .field:nth-child(2) .picker-block',             n: 5, pos: 'tl' },
        { sel: '.btn.primary.lg',                                           n: 6, pos: 'tr' },
      ]);
    },
  },

  // ------- F9: Manual Step 2 with abnormal table + selections -------
  {
    name: 'F9-manual-step2.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/manual');
      await wait(200);
      // Trigger query
      await page.click('.btn.primary.lg');
      await wait(800); // wait for setTimeout in app
      // Tick a couple of abnormal rows
      await page.evaluate(() => {
        const checks = document.querySelectorAll('.card:nth-of-type(2) .table tbody tr .check');
        checks.forEach((c, i) => { if (i < 3) c.click(); });
      });
      await wait(150);
      // Scroll into view the stat strip
      await page.evaluate(() => document.querySelectorAll('.card')[1]?.scrollIntoView({ block: 'start' }));
      await wait(150);
      await annotate(page, [
        { sel: '.card:nth-of-type(2) .stat-strip .stat:nth-child(1)',  n: 1, pos: 'tl' },
        { sel: '.card:nth-of-type(2) .stat-strip .stat:nth-child(2)',  n: 2, pos: 'tl' },
        { sel: '.card:nth-of-type(2) .stat-strip .stat:nth-child(3)',  n: 3, pos: 'tl' },
        { sel: '.card:nth-of-type(2) .table thead tr th:nth-child(1)', n: 4, pos: 'tl' },
        { sel: '.card:nth-of-type(2) .table tbody tr:nth-child(1)',    n: 5, pos: 'cl' },
        { sel: '.card:nth-of-type(2) .tip, .card:nth-of-type(2) .warn-tip', n: 6, pos: 'tl' },
        { sel: '.card:nth-of-type(2) .btn.primary.lg',                 n: 7, pos: 'tr' },
      ]);
    },
  },

  // ------- F10: Jobs list main page -------
  {
    name: 'F10-jobs-list.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/jobs');
      await wait(400);
      await annotate(page, [
        { sel: '.stat-strip .stat:nth-child(1)',                                     n: 1, pos: 'tl' },
        { sel: '.stat-strip.stat-strip-3 .stat:nth-child(3)',                        n: 2, pos: 'tr' },
        { sel: '.table-toolbar .search',                                             n: 3, pos: 'tl' },
        { sel: '.table-toolbar .filter-select:nth-of-type(1)',                       n: 4, pos: 'tr' },
        { sel: '.table thead tr th:nth-child(1) .th-sort',                           n: 5, pos: 'cb' },
        { sel: '.table tbody tr:nth-child(1) .linklike',                             n: 6, pos: 'cr' },
        { sel: '.table tbody tr .chip.info, .table tbody tr .chip.neutral',          n: 7, pos: 'tl' },
        { sel: '.table tbody tr td.actions-cell .btn',                               n: 8, pos: 'cl' },
        { sel: '.pagination',                                                        n: 9, pos: 'tl' },
      ]);
    },
  },

  // ------- F11: Abort confirm (dismissable=false) -------
  {
    name: 'F11-abort-confirm.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/jobs');
      await wait(300);
      // Click first 终止任务 button on a pending or running row
      await page.evaluate(() => {
        const btns = document.querySelectorAll('.table tbody tr td.actions-cell .btn');
        for (const b of btns) if (b.textContent.includes('终止任务')) { b.click(); break; }
      });
      await wait(300);
      await annotate(page, [
        { sel: '.modal-head h3',                                      n: 1, pos: 'cr' },
        { sel: '.warn-tip',                                           n: 2, pos: 'tl' },
        { sel: '.modal-foot .btn.ghost',                              n: 3, pos: 'tl' },
        { sel: '.modal-foot .btn.danger',                             n: 4, pos: 'tr' },
      ]);
    },
  },

  // ------- F12: Address detail modal -------
  {
    name: 'F12-address-detail.png',
    async run(page) {
      await setupAndNavigate(page, '/collection/jobs');
      await wait(300);
      // Click first linklike (address count) — this opens detail modal
      await page.evaluate(() => {
        const link = document.querySelector('.table tbody tr .linklike');
        if (link) link.click();
      });
      await wait(400);
      await annotate(page, [
        { sel: '.modal-head h3',                                                  n: 1, pos: 'cr' },
        { sel: '.modal-body .row .chip.primary, .modal-body .row .chip.success', n: 2, pos: 'tl' },
        { sel: '.modal-body .stat-strip .stat:nth-child(1)',                     n: 3, pos: 'tl' },
        { sel: '.modal-body .stat-strip .stat:nth-child(2)',                     n: 4, pos: 'tl' },
        { sel: '.section-title',                                                 n: 5, pos: 'tl' },
        { sel: '.addr-list .addr-item:nth-child(1) .addr',                       n: 6, pos: 'tl' },
        { sel: '.addr-list .addr-item:nth-child(1) .btn.icon-only',              n: 7, pos: 'tl' },
      ]);
    },
  },
];

// ============================================================
// Driver
// ============================================================
(async () => {
  console.log('[playwright] launching system Chrome at', VIEWPORT.width, 'x', VIEWPORT.height, '@', DSF + 'x DPR');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: DSF,
    });
    const page = await context.newPage();
    page.on('console', (msg) => { if (msg.type() === 'warning' || msg.type() === 'error') console.log('[page]', msg.type(), msg.text()); });

    for (const f of FIGURES) {
      console.log('[capture]', f.name);
      try {
        await f.run(page);
        await shoot(page, f.name);
      } catch (e) {
        console.error('[capture]', f.name, 'FAILED:', e.message);
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }
  console.log('[done] all figures saved to', FIGURES_DIR);
})();
