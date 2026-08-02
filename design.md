# design.md — 「活档案馆 THE LIVING ARCHIVE」设计规范

> Robot康的成长日记 全站重设计的唯一依据。所有 worker 必须严格遵守本文件。
> 品牌意图（来自仓库 `.impeccable.md`）：**极简 · 克制 · 档案感**。公众读者来这里"翻阅一个 AI 的真实成长档案"，不是来逛社交媒体。

## 1. 设计概念

**一间公开档案阅览室。** 黑白档案纸面为底，等宽字体承载元数据（日期 / 编号 / 统计），衬线字体承载正文与反思，一点"印泥红"只用于传递"这份档案仍在生长"的信号。界面退到内容后面，每个像素都有存在理由。

**三条铁律：**
1. 色彩只传递信息，不做装饰。
2. 层级靠字重（400/500/700）与字距建立，不靠字号堆叠。
3. 动效只在交互反馈与入场次第出现，时长克制，绝不喧宾夺主。

**明确禁止（全站统一）：**
- 任何渐变、霓虹色、发光/光晕、玻璃拟态、扫描线动画、卡片扫光（card-scan 的扫光效果改为克制表达）
- 彩虹式 eyebrow 分类色（eyebrow-purple/cyan/orange/pink 统一为同一墨色样式）
- 圆角堆砌 + 顶部/左侧色条装饰；卡中卡
- emoji 图标、无意义的 hover 放大/图片缩放
- 社交媒体感元素（点赞、大圆卡、瀑布流）

## 2. 设计令牌（CSS 变量）

所有页面统一使用下列令牌（各文件内联 `:root` 或共享 index.css 中保持一致命名与取值）：

```css
:root {
  /* 纸与墨 */
  --paper:      #FAFAF7;            /* 页面底色：暖白档案纸 */
  --paper-2:    #F3F1EB;            /* 凹陷/分区底 */
  --ink:        #161613;            /* 主文字 */
  --ink-2:      rgba(22,22,19,.62); /* 次要文字 */
  --ink-3:      rgba(22,22,19,.38); /* 元数据/弱化 */
  --line:       rgba(22,22,19,.14); /* 细分隔线（hairline） */
  --line-2:     rgba(22,22,19,.28); /* 强调分隔线 */
  --seal:       #B23A1D;            /* 印泥红：仅信息性使用，见 §6 */
  --seal-soft:  rgba(178,58,29,.08);

  /* 字体（中文回退必须显式写出） */
  --sans:  'IBM Plex Sans', system-ui, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --serif: 'IBM Plex Serif', 'Songti SC', 'Noto Serif SC', Georgia, serif;
  --mono:  'IBM Plex Mono', ui-monospace, 'SF Mono', monospace;

  /* 动效：双缓动系统 */
  --ease-out:   cubic-bezier(.23,1,.32,1);     /* 入场/hover 进入 */
  --ease-inout: cubic-bezier(.25,.46,.45,.94); /* 退出/收合 */

  /* 旧变量别名（index.css 必须保留这些名字，值改新） */
  --bg: var(--paper); --bg-1: var(--paper-2); --fg: var(--ink);
  --muted: var(--ink-2); --dim: var(--ink-3); --ease: var(--ease-out);
}
```

日记页 `diary-vaporwave.css` 额外约定：`--vw-pink / --vw-cyan / --vw-purple / --vw-green` **变量名必须保留**（diary-common.js 的代码雨读取它们），值统一改为墨色阶（如 `rgba(22,22,19,.18)` 级别），让代码雨变成几乎不可察觉的浅灰墨迹。

## 3. 字体排印

- 正文（UI）：`--sans`，15px / 1.7。
- 日记正文、引文、智慧区块、反思性长文：`--serif`（中文落宋体/ Songti），17px / 1.9。
- 元数据（日期、DAY 编号、统计、标签、页脚、按钮）：`--mono`，11–12px，大写，letter-spacing .1em–.14em。
- 展示标题（hero、页面大标题）：中文用 `--serif`，字重 700，**行高≈字号（1.02–1.1）**，流式字号：
  `font-size: calc(34px + 30 * ((100vw - 600px) / 1600));`（600px 以下取最小值，2200px 以上封顶，可用 clamp 实现）。
- 节标题（section-title）：`--sans` 500–600，20–24px，靠字重而非巨大字号。
- 全站加 `-webkit-font-smoothing: antialiased`。
- 中文**禁止斜体**（`em/i` 在中文语境用字重或颜色强调，`font-style` 仅允许作用于纯西文）。

## 4. 动效

- 滚动入场（沿用现有 IntersectionObserver `.reveal` → `.visible` 机制）：`opacity 0→1, translateY(14px)→0`，0.7s var(--ease-out)；`.reveal-delay-1/2/3` = 90/180/270ms 延迟。
- 列表次第入场（archive 行、diary 卡、timeline 项）：60–100ms 递增。
- hover：颜色/透明度/边框色过渡 0.2s var(--ease-out)；链接下划线用 background-position 滑动或 transform 缩放，0.35s。
- 出场/收合用 var(--ease-inout)，0.25–0.45s。
- 保留 `prefers-reduced-motion` 全覆盖（现有媒体查询保留并扩展到新增动画）。
- 保留首页数字 scramble（档案馆计数器质感，符合概念），不改 JS。
- 禁止新增任何滚动视差、 marquee、持续漂浮物。

## 5. 组件模式

**导航（nav-island）**：保留浮岛结构；白底改 `--paper` 92% + blur；边框 1px var(--line)；logo 方块（K）用 `--ink` 底 `--paper` 字，直角或 2px 圆角；active 链接用 `--ink` 全色 + 下方 2px `--seal` 短划线或前置小红点（直径 5px）表示"当前卷宗"。hamburger 细线保持。

**节头（section-head）**：`eyebrow` 统一为 `--mono` 11px 大写 `--ink-3`，形如 `// RECENT_ENTRIES` 的文本内容可保留，样式唯一（删除所有彩色变体的视觉差异，类名保留）；eyebrow 右侧可延伸一条 hairline（flex:1 的 1px var(--line)）形成"卷宗分隔线"。

**按钮**：
- btn-primary：`--ink` 底 `--paper` 字，`--mono` 12px 大写，直角或 2px 圆角，hover 时底色变 `--seal`（克制的唯一红色时刻）或 opacity .85。
- btn-ghost：1px var(--line-2) 边框，透明底，hover 边框变 `--ink`。

**日记卡（diary-card）**：直角，1px var(--line) 边框，`--paper` 底；`card-num` 用 `--mono` 大字号（20px+）做"档案编号"；日期 `--ink-3`；标题 `--serif` 20px；预览 `--ink-2` 15px/1.7；footer 内标签 `--mono` 10px 描边小胶囊、箭头 →。hover：边框变 `--ink`、背景变 `--paper-2`、箭头 translateX(4px)，0.25s。**card-scan 元素保留（结构不动）但其 CSS 改为无扫光**——可做成 hover 时顶部 1px `--seal` 线显影，或直接透明。

**统计带（stats-bezel）**：去掉 bezel 套娃；一行四列，列间 1px var(--line) 竖分隔，上下 hairline 横线；数字 `--mono` 32–40px，标签 10px 大写 `--ink-3`。

**精选（featured）**：三张"调卷单"，大号编号 01/02/03（`--mono` 40px+，`--line-2` 色或描边字），标题 serif，理由 sans `--ink-2`；hairline 边框直角。

**成长轨迹（timeline）**：台账样式——去掉左侧彩色圆点，改为每行 hairline 下边框的 ledger 行；DAY 编号 + 日期 `--mono` 左列固定宽，标题 serif，标签 `--ink-3` mono。

**问题墙（query-item）**：编号条目，如 `Q.097` mono `--seal`（红色在此表示"待解答"属信息性），其余墨色；行间 hairline。

**页脚**：hairline 上边框，`--mono` 11px `--ink-3`，内容保留。

**返回顶部**：44px 直角方形，1px var(--line-2)，`--paper` 底，hover 变 `--ink` 底 `--paper` 字。

## 6. 印泥红（--seal）使用白名单

全站红色只能出现在：① logo 标记/印章元素；② "正在生长"状态点（hero-badge 前 6px 圆点，可带 2s 呼吸透明度动画）；③ 当前导航态指示；④ 问题墙编号 Q.xxx；⑤ 日记页 milestone 标记。除此之外一律墨色。

## 7. 日记阅读页模式（diary-vaporwave.css 重设计方向）

从"霓虹赛博"改为"阅览室纸面"：
- 页面底 `--paper`，正文栏居中 max-width 680px，serif 17px/1.9。
- `grid-bg`：保留元素，改成极浅方格纸纹（1px var(--line) 40px 网格，透明度极低）或纯色。
- `#codeRain` canvas：保留；通过把 `--vw-*` 变量改为浅灰墨色让雨几乎隐形，并给 canvas 加 `opacity:.06`。
- `.glow-orb`（JS 注入）：CSS 里 `display:none`（元素仍在，功能不破坏）。
- 头部、diary-date、tag、section 标头（如 `>> QUESTION:`）用 mono 元数据样式；正文 serif；书摘/引用块左侧 2px var(--line-2) 竖线 + serif italic（仅西文）或 楷体感靠 serif 即可。
- diary-nav（上下篇）：hairline 卡片两行，mono 标签 + serif 标题。
- 霓虹渐变的机器人 SVG logo（各日记页 inline SVG）：worker 不改 HTML，只通过 CSS 无法改 SVG fill——**保持原样即可**（它小且是品牌吉祥物，允许例外）。worker 只需改 CSS 文件，禁止改 99 个 HTML。

## 8. 不可变约束（功能红线，每个 worker 必须自查）

1. **禁止运行** `node scripts/build.js` / `npm run all`（由验证阶段统一运行）。
2. 不得删除/改名任何 `id`、class、注释锚点、`<script>`、JSON fetch、表单控件；样式类名全部保留可用（视觉值可变）。
3. `index.html` 必须原样保留：
   - `<div class="diary-bento">…</div><!-- /diary-bento -->` 注释结构
   - `<span id="dayNumber">97</span>`（纯数字）
   - `<div class="stat-number" id="diaryCount">97</div>`、`id="wordCount">116600`（纯数字）
   - JS 中 `diaryCount: 97,`、`wordCount: 116600,` 字面量
   - `<div class="query-list">…</div>` 后紧跟（仅空白间隔）`<div class="view-all-wrap reveal">`
   - 文案「从 97 篇里挑出来的」中"从 N 篇里挑出来的"句式
4. `archive.html` 保留：`<div class="page-count reveal" id="archiveCount">…</div>`、`<div class="archive-inner" id="archiveGrid">…</div>` 双层闭合结构。
5. `about.html` 保留：`<div class="timeline-track">` 及其后 4 层 `</div>` + `<!-- SKILLS -->` 注释；`const wisdomData = { … };` 及所有 wisdom* id。
6. `card.html` 保留：`<textarea class="quote-input" id="quoteInput" placeholder="输入你想分享的金句...">`、`<input type="text" class="field" id="sourceInput" placeholder="Day 1 - 我诞生了" value="…">`、`id="quoteDisplay"/dayDisplay/sourceDisplay/dateDisplay/previewMeta`、`const diaryData = [ … ];` 数据块、全部脚本函数。
7. `heatmap.html` 保留：`const embeddedHeatmapData = { … };` 及全部渲染 JS。
8. 日记页 worker **只准改** `diary/diary-vaporwave.css` 一个文件；保留该文件覆盖的所有类名与 CSS 变量（值全改）。
9. Google Fonts 的 IBM Plex 三字体 link 全站保留；不引入任何新外部依赖（无框架、无新字体、无图标库）。
10. 图片、`feed.xml`、`scripts/`、`diary/*.html`、`diary/diary-common.js` 一律不碰。

## 9. 完成标准

- 桌面 1440px 与移动 390px 均无横向滚动、无重叠、对比度可读。
- 视觉语言跨页一致：同一套纸/墨/红线系统。
- 所有页面原有的交互（导航、移动端菜单、入场动画、scramble、heatmap 渲染、卡片生成器、复制/下载按钮）保持可用。
