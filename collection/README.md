# CCPayment 运营后台 · 归集系统

CCPayment 后台「归集系统」一级菜单的前端工程。覆盖三个子模块：

- **自动归集**（`/dashboard/collection/auto`） — 4 类自动任务（大额充值检测 / 地址未活跃 / 地址余额检测 / 提现不足触发）的列表 + 启停 + 创建编辑
- **手动归集**（`/dashboard/collection/manual`） — 一次性手动触发；查询未归集分布、提交归集；异常金额地址表为只读展示
- **归集任务**（`/dashboard/collection/jobs`） — 自动 / 手动统一观测视图；筛选、排序、分页、终止、明细

## 技术栈

| 关键依赖 | 版本 |
|---|---|
| Vite | 5.4 |
| React | 18.3 |
| TypeScript | 5.6 |
| React Router | 6.27 |
| MUI Material | 5.16 |
| MUI X Date Pickers | 7.22 |
| Emotion (styled / react) | 11 |
| MobX + mobx-react-lite | 6 / 4 |
| dayjs | 1.11 |

设计系统遵循 [CCPayment Design System](https://api.anthropic.com/v1/design/h/IYACLiYske6DzTDVE_nEng)。

## 目录结构

```
src/
├── api/          # 与后端的单一接缝；目前以 mock 数据 + Promise 包装实现
├── components/   # 通用组件（CryptoBadge / TokenPicker / AmountInput / ScheduleEditor / ConfirmDialog / EmptyState / ToastHost）
├── data/         # 业务类型 + tokens 注册表 + mock 数据
├── layouts/
│   └── dashboard/  # DashboardLayout + Sidebar + Header
├── pages/        # AutoCollection / ManualCollection / CollectionJobs / NotFound
├── routes/       # 路由表 + paths 常量
├── stores/       # MobX 根 store（Collection / Ui / Toast）+ React context
├── theme/        # MUI 主题（palette / typography / shadows / 组件 override）+ tokens.css overlay
├── utils/        # 数字与日期格式化
├── App.tsx       # 仅渲染 <AppRoutes/>
└── main.tsx      # ThemeProvider + StoresProvider + LocalizationProvider 的根挂载
```

## 本地开发

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # tsc -b + vite build
npm run preview  # 预览生产构建
```

## 后端接入

所有"假"操作集中在 `src/api/collection.ts`。把每个方法换成真实 fetch / axios 调用即可，`src/stores/CollectionStore.ts` 不需要任何修改 —— 这是接入后端的唯一接缝。

## 关键约定

- **MobX**：所有读取 store 的组件用 `observer()` 包裹，`useStores()` 取实例；mutations 走 store 方法、不直接改字段。
- **MUI sx**：所有样式用 `sx={{ ... }}`，不引入 `styled()`。
- **路由**：`paths` 常量集中在 `src/routes/paths.ts`，避免硬编码字符串。
- **响应式**：≤767px 抽屉式 sidebar；768–1279 收缩为图标轨；≥1280 完整 280px 侧栏。
- **手动归集 v1.1**：异常金额地址表为只读展示，不参与归集（对照 `pages/ManualCollection.tsx` 第 49 行注释）。
