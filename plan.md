# 网站重设计执行方案 — Robot康的成长日记

目标：全站视觉重设计（"活档案馆"方向，遵循仓库内 `.impeccable.md` 的极简·克制·档案感），**不影响任何现有功能**。

## 现状盘点（已完成）

- 静态站，GitHub Pages 部署，无框架。根目录 7 个页面 + `index.css`；`diary/` 99 篇日记共用 `diary-vaporwave.css` + `diary-common.js`。
- `scripts/build.js` 依赖各页面中的固定标记做正则替换（diary-bento 网格、统计数字、query-list、archive 行、card 字段、heatmap 内嵌数据、about timeline、NAV_START/END 等），标记必须原样保留。
- `scripts/check-diary.js` 校验日记页结构；`diary-common.js` 从 CSS 变量 `--vw-pink/--vw-cyan/--vw-purple/--vw-green` 读取代码雨颜色。
- 现状风格割裂：根目录页面是浅色极简但带彩色 eyebrow/扫描光效；日记页是全霓虹 vaporwave，与 `.impeccable.md` 的设计意图（黑白档案感、Linear 精度）相悖。

## 阶段

- Stage 0 — 设计定调（Orchestrator 本人）：参考检索完成，产出 `design.md` 设计规范（令牌/字体/动效/组件模式/各页面不可变约束）。
- Stage 1 — 并行实施（9 个 coder worker，每人独占一个文件，互不冲突）：
  1. `index.css` — 全量重写（共享基础 + 首页样式），保留所有现有选择器可用
  2. `index.html` — 标记结构精修，保留全部 build.js 锚点
  3. `about.html` — 内联样式重设计，保留 timeline-track / `<!-- SKILLS -->` / wisdomData
  4. `archive.html` — 目录页重设计为编号档案目录，保留 `#archiveCount` / `#archiveGrid` 结构
  5. `tags.html` — 重设计，保留标签页 JS
  6. `card.html` — 卡片生成器重设计，保留全部输入控件 ID 与 diaryData 数据块
  7. `heatmap.html` — 热力图页重设计，保留 embeddedHeatmapData 与渲染 JS
  8. `rss.html` — 重设计
  9. `diary/diary-vaporwave.css` — 日记阅读页全量重设计（一次改动覆盖 99 篇），保留全部类名/结构/CSS 变量
- Stage 2 — 验证（待 Stage 1 完成后）：
  - 运行 `node scripts/build.js` 必须零报错（验证所有锚点存活）
  - `node scripts/check-diary.js` 抽查多篇日记
  - puppeteer 截图（桌面 + 移动）逐页目检，发现问题派发修复 worker
