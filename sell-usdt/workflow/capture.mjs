// Capture annotated screenshots for the Sell USDT 申请 PRD.
//
// Pipeline (mirrors the F1–F12 approach the reference doc describes):
// 1. Launch system Chrome via Playwright at 1440×900 @ 2x DPI.
// 2. Navigate to a recipe's URL (dev server on http://localhost:5175).
// 3. Run pre-steps (clicks, hovers) to bring the surface into view.
// 4. Inject a real <div class="prd-anno"> overlay for each {selector, n, pos}.
//    Annotations are real DOM elements positioned via getBoundingClientRect →
//    they survive layout changes, hi-DPI, and re-runs.
// 5. page.screenshot() the result → PNG under workflow/figures/.

import { chromium } from 'playwright';

const BASE = 'http://localhost:5175';
const OUT_DIR = 'workflow/figures';

const ANNO_CSS = `
  .prd-anno {
    position: fixed;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: #EC684C;
    color: #fff;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.18);
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    z-index: 99999;
    pointer-events: none;
  }
`;

// Recipe = one figure. selectors are validated at capture time; mis-matches
// surface as a console warning so we don't ship a figure with floating dots.
const RECIPES = [
  {
    name: 'F01-sell-usdt-pending',
    url: '/dashboard/sell-usdt',
    pre: [],
    annos: [
      { sel: 'h1',                                          n: 1, pos: 'tr' },
      { sel: '[role="tab"]:nth-of-type(1)',                 n: 2, pos: 'tl' },
      { sel: '[role="tab"]:nth-of-type(2)',                 n: 3, pos: 'tl' },
      { sel: '[role="tab"]:nth-of-type(3)',                 n: 4, pos: 'tl' },
      { sel: '[role="tab"]:nth-of-type(4)',                 n: 5, pos: 'tl' },
      { sel: '[role="tab"]:nth-of-type(5)',                 n: 6, pos: 'tl' },
      { sel: 'main button:has-text("服务费设置")',          n: 7, pos: 'tr' },
      { sel: 'tbody tr:nth-child(1) button:has-text("详情")', n: 8, pos: 'cl' },
      { sel: 'tbody tr:nth-child(1) button:has-text("通过并发送至Lark")', n: 9, pos: 'cl' },
      { sel: 'tbody tr:nth-child(1) button:has-text("拒绝")', n: 10, pos: 'cl' },
    ],
  },
  {
    name: 'F02-fee-settings-modal',
    url: '/dashboard/sell-usdt',
    pre: [{ click: 'main button:has-text("服务费设置")' }],
    annos: [
      { sel: '.MuiDialog-paper input',                              n: 1, pos: 'tr' },
      { sel: '.MuiDialog-paper input[inputmode="decimal"]',         n: 2, pos: 'tr' },
      { sel: '.MuiDialog-paper button:has-text("保存")',            n: 3, pos: 'tr' },
    ],
  },
  {
    name: 'F03-order-detail-modal',
    url: '/dashboard/sell-usdt',
    pre: [{ click: 'tbody tr:nth-child(1) button:has-text("详情")' }],
    annos: [
      { sel: '.MuiDialog-paper :has-text("Order Info"):not(:has(*))', n: 1, pos: 'tl' },
      { sel: '.MuiDialog-paper :has-text("Recipient Info"):not(:has(*))', n: 2, pos: 'tl' },
      { sel: '.MuiDialog-paper button:has-text("复制信息")',          n: 3, pos: 'tr' },
    ],
  },
  {
    name: 'F04-approve-modal',
    url: '/dashboard/sell-usdt',
    pre: [{ click: 'tbody tr:nth-child(1) button:has-text("通过并发送至Lark")' }],
    annos: [
      { sel: '.MuiDialog-paper :has-text("请确认已经和供应商沟通好了"):not(:has(*))', n: 1, pos: 'tl' },
      { sel: '.MuiDialog-paper button:has-text("拒绝")',                                 n: 2, pos: 'tr' },
      { sel: '.MuiDialog-paper button:has-text("确认通过审核并发送到lark")',             n: 3, pos: 'tr' },
    ],
  },
  {
    name: 'F05-transfer-pending-list',
    url: '/dashboard/sell-usdt',
    pre: [{ click: '[role="tab"]:has-text("待转账给供应商")' }],
    annos: [
      { sel: 'thead th:nth-child(1)',                                     n: 1, pos: 'tl' },
      { sel: 'tbody tr:nth-child(1) button:has-text("确认转账")',         n: 2, pos: 'cl' },
      { sel: 'tbody tr:nth-child(2) button:has-text("详情")',             n: 3, pos: 'cl' },
    ],
  },
  {
    name: 'F06-confirm-transfer-modal',
    url: '/dashboard/sell-usdt',
    pre: [
      { click: '[role="tab"]:has-text("待转账给供应商")' },
      { click: 'tbody tr:nth-child(1) button:has-text("确认转账")' },
    ],
    annos: [
      { sel: '.MuiDialog-paper :has-text("供应商Cwallet账户转账信息"):not(:has(*))', n: 1, pos: 'tl' },
      { sel: '.MuiDialog-paper :has-text("上传转账凭证截图"):not(:has(*))',          n: 2, pos: 'tl' },
      { sel: '.MuiDialog-paper input[placeholder="转账记录ID号"]',                    n: 3, pos: 'tr' },
      { sel: '.MuiDialog-paper button:has-text("确认")',                                n: 4, pos: 'tr' },
    ],
  },
  {
    name: 'F07-paying-list',
    url: '/dashboard/sell-usdt',
    pre: [{ click: '[role="tab"]:has-text("待供应商付款")' }],
    annos: [
      { sel: 'thead th:nth-child(1)',                                       n: 1, pos: 'tl' },
      { sel: 'tbody tr:nth-child(1) button:has-text("确认付款")',           n: 2, pos: 'cl' },
      { sel: 'tbody tr:nth-child(1) button:has-text("供应商退款")',         n: 3, pos: 'cl' },
    ],
  },
  {
    name: 'F08-fiat-proof-modal',
    url: '/dashboard/sell-usdt',
    pre: [
      { click: '[role="tab"]:has-text("待供应商付款")' },
      { click: 'tbody tr:nth-child(1) button:has-text("确认付款")' },
    ],
    annos: [
      { sel: '.MuiDialog-paper :has-text("收款信息"):not(:has(*))', n: 1, pos: 'tl' },
      { sel: '.MuiDialog-paper :has-text("上传付款凭证截图"):not(:has(*))', n: 2, pos: 'tl' },
      { sel: '.MuiDialog-paper input[placeholder="付款凭证号"]', n: 3, pos: 'tr' },
      { sel: '.MuiDialog-paper :has-text("商家已冻结资产将在确认后"):not(:has(*))', n: 4, pos: 'tl' },
      { sel: '.MuiDialog-paper button:has-text("确认")', n: 5, pos: 'tr' },
    ],
  },
  {
    name: 'F09-supplier-refund-modal',
    url: '/dashboard/sell-usdt',
    pre: [
      { click: '[role="tab"]:has-text("待供应商付款")' },
      { click: 'tbody tr:nth-child(1) button:has-text("供应商退款")' },
    ],
    annos: [
      { sel: '.MuiDialog-paper :has-text("拒绝原因"):not(:has(*))',           n: 1, pos: 'tl' },
      { sel: '.MuiDialog-paper :has-text("退款地址"):not(:has(*))',           n: 2, pos: 'tl' },
      { sel: '.MuiDialog-paper :has-text("热钱包入账流水绑定"):not(:has(*))', n: 3, pos: 'tl' },
      { sel: '.MuiDialog-paper a:has-text("打开热钱包入账列表")',             n: 4, pos: 'tr' },
      { sel: '.MuiDialog-paper input[placeholder="输入热钱包入账 TxID"]',     n: 5, pos: 'tr' },
      { sel: '.MuiDialog-paper :has-text("收款进度"):not(:has(*))',           n: 6, pos: 'tl' },
    ],
  },
  {
    name: 'F10-paying-detail',
    url: '/dashboard/sell-usdt',
    pre: [
      { click: '[role="tab"]:has-text("待供应商付款")' },
      { click: 'tbody tr:nth-child(1) button:has-text("详情")' },
      { scrollDialogBottom: true },
    ],
    annos: [
      { sel: '.MuiDialog-paper :has-text("已通过审核"):not(:has(*))',         n: 1, pos: 'tl' },
      { sel: '.MuiDialog-paper :has-text("向Cwallet运营账户转账"):not(:has(*))', n: 2, pos: 'tl' },
      { sel: '.MuiDialog-paper :has-text("供应商Cwallet账户转账信息"):not(:has(*))', n: 3, pos: 'tl' },
    ],
  },
  {
    name: 'F11-rejected-detail',
    url: '/dashboard/sell-usdt',
    pre: [
      { click: '[role="tab"]:has-text("已拒绝")' },
      { click: 'tbody tr:nth-child(1) button:has-text("详情")' },
      { scrollDialogBottom: true },
    ],
    annos: [
      { sel: '.MuiDialog-paper :has-text("已拒绝"):not(:has(*))', n: 1, pos: 'tl' },
    ],
  },
  {
    name: 'F12-completed-detail',
    url: '/dashboard/sell-usdt',
    pre: [
      { click: '[role="tab"]:has-text("已完成")' },
      { click: 'tbody tr:nth-child(1) button:has-text("详情")' },
      { scrollDialogBottom: true },
    ],
    annos: [
      { sel: '.MuiDialog-paper :has-text("供应商法币履约凭证"):not(:has(*))', n: 1, pos: 'tl' },
    ],
  },
  {
    name: 'F13-merchant-fee-config',
    url: '/dashboard/merchant/list/detail',
    pre: [],
    annos: [
      { sel: 'h1',                                                       n: 1, pos: 'tr' },
      { sel: 'tbody tr:nth-child(7)',                                    n: 2, pos: 'cl' },
      { sel: 'tbody tr:nth-child(7) span:has-text("编辑")',              n: 3, pos: 'cr' },
    ],
  },
  {
    name: 'F15-paying-paid-pending',
    url: '/dashboard/sell-usdt',
    pre: [
      { click: '[role="tab"]:has-text("待供应商付款")' },
      // Mark three rows with three different markedAt values to showcase
      // the day / hour / minute unit downgrade together in one figure.
      { eval: `(() => {
        const NOW = Date.now();
        const DAY = 86400000;
        const MIN = 60000;
        window.__rootStore.ui.markPaidPending('202507...370816', NOW);
        window.__rootStore.ui.markPaidPending('202505...228032', NOW - 2.5 * DAY);
        window.__rootStore.ui.markPaidPending('202502...619264', NOW - (3 * DAY - 5 * MIN));
      })()` },
      { waitTimeout: 200 },
      // Scroll the table horizontally so the action column is on-screen.
      { eval: `(() => { const s = document.querySelector('.MuiTableContainer-root'); if (s) s.scrollLeft = s.scrollWidth; })()` },
      { waitTimeout: 150 },
    ],
    annos: [
      { sel: 'tbody tr:nth-child(1) span:has-text("天后自动确认")',   n: 1, pos: 'tl' },
      { sel: 'tbody tr:nth-child(2) span:has-text("小时后自动确认")', n: 2, pos: 'tl' },
      { sel: 'tbody tr:nth-child(3) span:has-text("分钟后自动确认")', n: 3, pos: 'tl' },
      { sel: 'tbody tr:nth-child(4) button:has-text("确认付款")',     n: 4, pos: 'cr' },
    ],
  },
  {
    name: 'F14-hot-wallet-page',
    url: '/dashboard/hot-wallet/assets',
    pre: [],
    annos: [
      { sel: 'h1',                                                                  n: 1, pos: 'tr' },
      { sel: '[role="tab"][aria-selected="true"]',                                  n: 2, pos: 'tl' },
      { sel: 'tbody tr:nth-child(4) span:has-text("点击标记")',                     n: 3, pos: 'cl' },
      { sel: 'tbody tr:nth-child(1)',                                               n: 4, pos: 'tr' },
    ],
  },
];

function buildAnnoFn() {
  // Returns a function that runs in the page to draw annotations.
  // Supports two Playwright-style selector extensions on top of native CSS:
  //   :has-text("substring")    → element whose textContent includes substring
  //   :not(:has(*))             → leaf element (no element children)
  return (items) => {
    function findEl(rawSel) {
      const txt = rawSel.match(/:has-text\("([^"]+)"\)/);
      const text = txt ? txt[1] : null;
      let base = rawSel.replace(/:has-text\("[^"]+"\)/, '');
      const requireLeaf = base.includes(':not(:has(*))');
      base = base.replace(':not(:has(*))', '');
      // Detect descendant pattern (trailing space) BEFORE trim — that's the
      // signal that pseudo applied to "any descendant" rather than to the
      // last-named element itself.
      const descendant = /\s$/.test(base);
      base = base.trim();

      let candidates;
      if (descendant) {
        // ".MuiDialog-paper :has-text(...)" → search descendants of base.
        const root = base ? document.querySelector(base) : document;
        candidates = root ? Array.from(root.querySelectorAll('*')) : [];
      } else {
        // "button:has-text(...)" → apply filter directly to elements matching base.
        candidates = Array.from(document.querySelectorAll(base || '*'));
      }

      for (const el of candidates) {
        if (text && !(el.textContent || '').includes(text)) continue;
        if (requireLeaf && el.children.length > 0) continue;
        return el;
      }
      return null;
    }

    document.querySelectorAll('.prd-anno').forEach((n) => n.remove());
    items.forEach(({ sel, n, pos }) => {
      const el = findEl(sel);
      if (!el) {
        console.warn(`anno: selector miss → ${sel}`);
        return;
      }
      const r = el.getBoundingClientRect();
      // Anchor offsets: 9 positions around the bounding box.
      const map = {
        tl: [r.left - 18, r.top - 18],
        tc: [r.left + r.width / 2 - 13, r.top - 18],
        tr: [r.right - 8, r.top - 18],
        cl: [r.left - 18, r.top + r.height / 2 - 13],
        cr: [r.right - 8, r.top + r.height / 2 - 13],
        cb: [r.left + r.width / 2 - 13, r.bottom - 8],
        bl: [r.left - 18, r.bottom - 8],
        bc: [r.left + r.width / 2 - 13, r.bottom - 8],
        br: [r.right - 8, r.bottom - 8],
      };
      const [x, y] = map[pos] || map.tr;
      const dot = document.createElement('div');
      dot.className = 'prd-anno';
      dot.style.left = `${Math.max(2, x)}px`;
      dot.style.top = `${Math.max(2, y)}px`;
      dot.textContent = String(n);
      document.body.appendChild(dot);
    });
  };
}

async function runRecipe(page, recipe) {
  console.log(`→ ${recipe.name}`);
  await page.goto(BASE + recipe.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  for (const step of recipe.pre) {
    if (step.click) {
      // Use first() to disambiguate when multiple matches exist.
      await page.locator(step.click).first().click({ timeout: 5000 });
      await page.waitForTimeout(200);
    }
    if (step.scrollDialogBottom) {
      await page.evaluate(() => {
        const s = document.querySelector('.MuiDialog-paper > div:nth-of-type(2)');
        if (s) s.scrollTop = s.scrollHeight;
      });
      await page.waitForTimeout(200);
    }
    if (step.eval) {
      await page.evaluate(step.eval);
    }
    if (step.waitTimeout) {
      await page.waitForTimeout(step.waitTimeout);
    }
  }

  await page.addStyleTag({ content: ANNO_CSS });
  await page.evaluate(buildAnnoFn(), recipe.annos);
  await page.waitForTimeout(150);

  await page.screenshot({
    path: `${OUT_DIR}/${recipe.name}.png`,
    fullPage: false,
  });
  console.log(`  ✓ ${OUT_DIR}/${recipe.name}.png`);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'warning' || msg.type() === 'error') {
      console.log(`  [${msg.type()}] ${msg.text()}`);
    }
  });

  const filter = process.argv[2];
  const recipes = filter
    ? RECIPES.filter((r) => r.name.includes(filter))
    : RECIPES;

  for (const recipe of recipes) {
    try {
      await runRecipe(page, recipe);
    } catch (err) {
      console.error(`  ✗ ${recipe.name}: ${err.message}`);
    }
  }

  await browser.close();
})();
