# PRD Studio 状态

## 基本信息

- **需求描述**：归集系统 — 见 `workflow/requirement.md`
- **PRD 类型**：新功能（有 UI）
- **交互原型**：`/Users/yuu/Documents/claude workspace/ccpayment-collection/`（dev server `http://127.0.0.1:5173`）
- **开始时间**：2026-05-08
- **结束时间**：2026-05-08
- **当前状态**：✅ 准出通过（v1.4，**完美阈值 P0=0, P1=0, P2=0**）

## 迭代记录

| 轮次 | 阶段 | 时间 | 结果 |
|------|------|------|------|
| 1 | Writer | 2026-05-08 | PRD v1.0（961 行 / 12 张 mermaid）|
| 1 | Reviewer | 2026-05-08 | pass（P0=0, P1=1, P2=9）|
| 2 | Writer | 2026-05-08 | PRD v1.1（修复 P1-1 + 5 P2）|
| 2 | Reviewer | 2026-05-08 | pass（P0=0, P1=0, P2=4）|
| 3 | Writer | 2026-05-08 | PRD v1.2（12 mermaid → 真实截图）|
| 3 | Reviewer | 2026-05-08 | pass（P0=0, P1=0, P2=5）|
| 4 | Writer | 2026-05-08 | PRD v1.3（修复 5 条 P2）|
| 4 | Reviewer | 2026-05-08 | **fail**（P0=1，cooldown 边界矛盾）|
| 5 | Writer | 2026-05-08 | PRD v1.4（修复 P0 + 2 P2）|
| 5 | Reviewer | 2026-05-08 | **pass（P0=0, P1=0, P2=0 — 完美）**|

## 输出物

- `workflow/prd.md` — PRD v1.4 最终版
- `workflow/figures/F1.png ~ F12.png` — 12 张真实标注截图
- `workflow/review-report.md` — 第 5 轮审查报告（最终）
- `workflow/certificate.md` — 准出证书
- `workflow/requirement.md` — 输入需求 spec
- `workflow/capture.mjs` / `capture-fix2.mjs` / `capture-fix3.mjs` / `capture-fix4.mjs` — 截图采集脚本

## 截图回归

```bash
cd workflow/
# 安装 playwright 到 /tmp 后 cp -r /tmp/node_modules .
node capture.mjs       # 首抓 12 张
node capture-fix2.mjs  # F5/F6 修补
node capture-fix3.mjs  # F3/F4/F9 taller viewport
node capture-fix4.mjs  # F8 marker 配位（v1.4 修补）
```
