# ✅ PRD 准出证书 — v1.4（完美阈值）

## 基本信息

- **PRD 文件**：`workflow/prd.md`（v1.4）
- **首版完成时间**：2026-05-08（v1.0）
- **最终修订时间**：2026-05-08（v1.4）
- **总迭代轮次**：5 轮
- **最终结论**：**通过（P0=0, P1=0, P2=0 — 完美阈值）**

## 审查历程

| 轮次 | 版本 | P0 | P1 | P2 | verdict | 关键变化 |
|------|------|----|----|----|---------|---|
| 1 | v1.0 | 0 | 1 | 9 | pass | 首版 PRD（mermaid wireframe）|
| 2 | v1.1 | 0 | 0 | 4 | pass | 修复 P1-1 + 5 条 P2 |
| 3 | v1.2 | 0 | 0 | 5 | pass | 12 个 mermaid 升级为真实标注截图 |
| 4 | v1.3 | **1** | 0 | 2 | **fail** | Orchestrator 错指令导致 AC-011 cooldown 边界与 5.1.1 矛盾 |
| 5 | **v1.4** | **0** | **0** | **0** | **pass** | **修复 P0 + 2 P2，达成完美阈值** |

## 质量曲线

```
        P1+P2 累计
v1.0    ██████████  10
v1.1    ████         4
v1.2    █████        5
v1.3    ███          3 (含 1 P0)
v1.4    ░            0  ← FINAL
```

## v1.4 关键修复

### P0-R4-1（v1.3 引入的 cooldown 矛盾）— 已修复
- 5.1.1（业务规则）/ 5.1.4（状态说明）一直定义为「`now - completedAt ≤ cooldown` → 跳过；只有严格 `> cooldown` 才允许触发」
- v1.3 时 orchestrator 错把 AC-011 第 7 条写成「`= cooldown` 时已超过冷却、可执行」（用 `>= cooldown`）
- v1.4 改回「`= cooldown` 仍跳过、只有严格 `> cooldown` 才放行」，全文运算符语义一致

### P2-R4-1（编号统一）
- AC-001-4 第 2 条「F5 截图标注 1」→ **`F5#1`**

### P2-R4-2（断言对象精确化）
- AC-011 第 6 条「归集任务列表」→ **「自动归集任务列表（F1）」**

---

## 12 张原型图（v1.2 起入正式产物）

| # | 文件 | 主题 |
|---|---|---|
| F1 | `figures/F1-auto-list.png` | 自动归集主页 |
| F2 | `figures/F2-create-step-a.png` | 新建任务 Step A |
| F3 | `figures/F3-create-step-b-large-deposit.png` | Step B 大额充值检测 |
| F4 | `figures/F4-create-step-b-balance-check.png` | Step B 地址余额检测 |
| F5 | `figures/F5-create-step-b-withdraw-short.png` | Step B 提现不足触发 |
| F6 | `figures/F6-amount-input-mixed.png` | AmountInput 混合模式 |
| F7 | `figures/F7-delete-confirm.png` | 删除任务确认 |
| F8 | `figures/F8-manual-step1.png` | 手动归集 Step 1（v1.4 重抓 #2/#3 配位）|
| F9 | `figures/F9-manual-step2.png` | 手动归集 Step 2 |
| F10 | `figures/F10-jobs-list.png` | 归集任务主列表 |
| F11 | `figures/F11-abort-confirm.png` | 终止任务确认 |
| F12 | `figures/F12-address-detail.png` | 归集地址明细 |

---

**PRD v1.4 已正式准出（P0=0, P1=0, P2=0），可进入 HLD 阶段。**
