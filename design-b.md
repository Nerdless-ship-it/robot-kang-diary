# design-b.md — 「编年史大字报 THE BROADSIDE」生产规范

> 用户已选定方向 B。本文件是全站铺开的唯一依据。
> **视觉基准实现**：`_qa/directions/b-broadside.html`（已通过截图质检的概念稿）。所有 worker 动手前必须先读它——它的 CSS 就是本规范的大部分字面实现，可以直接借用并适配。

## 1. 概念

**一份每天付印的编年史报纸。** 暖纸底 + 纯黑墨，零卡片、零圆角、零阴影、零渐变、零彩色（连印泥红也取消——本方向是纯黑白）。设计手段只有四样：字重、字号、栏线、留白。报纸语汇贯穿全站：刊头、刊号、头条、社论、编年志、读者来信、合订本索引、版权页。

## 2. 令牌（全站统一，逐字采用）

```css
:root{
  --paper:#F7F4EC;
  --ink:#17150F;
  --soft:rgba(23,21,15,.68);
  --faint:rgba(23,21,15,.46);
  --hair:rgba(23,21,15,.30);
  --serif:'IBM Plex Serif','Songti SC','STSong','SimSun','Noto Serif CJK SC',serif;
  --sans:'IBM Plex Sans','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;
  --mono:'IBM Plex Mono','SFMono-Regular',ui-monospace,'PingFang SC','Microsoft YaHei',monospace;
  --pad:clamp(16px,4vw,56px);
}
```
- body 默认字体 = **serif**（这是一份"报纸"，正文即衬线）。
- `em,i{font-style:normal}`（中文禁斜体）；`::selection{background:var(--ink);color:var(--paper)}`。
- **签名 hover**：链接/可点项 hover = `background:var(--ink);color:var(--paper)` 反白（0.15s），这是全站主要交互语言。

## 3. 栏线词汇

- `.rule-top`：页面最顶端 6px 纯黑通栏条（每页都有）。
- `.rule-double`：3px+1px 双线（刊号行上下）。
- `.rule-thick` / `.rule-hair`：3px / 1px 上边框。
- 每个大版区 `.sec` 以 `border-top:3px solid var(--ink)` 起始。

## 4. 共享件 API（index.css 必须提供，页面 worker 按此写标记）

**顶部细线菜单**（替换旧浮岛导航；每页标记一致，当前页链接加 `class="on"`）：
```html
<div class="rule-top" role="presentation"></div>
<header class="topbar">
  <a class="brand" href="index.html">■ ROBOT_KANG DAILY</a>
  <nav class="topnav" aria-label="栏目导航">
    <a href="index.html">HOME</a><a href="about.html">ABOUT</a><a href="tags.html">TAGS</a>
    <a href="card.html">CARD</a><a href="heatmap.html">HEATMAP</a><a href="rss.html">RSS</a>
    <a href="archive.html">ARCHIVE</a>
  </nav>
</header>
```
- 移动端（≤880px）：`.topnav` 单行横向滚动（overflow-x:auto; white-space:nowrap），不换行、不做汉堡。
- `.topnav a.on{background:var(--ink);color:var(--paper)}`。
- 旧 `nav-island/hamburger/nav-mobile-overlay` 体系在根目录页面全部废弃；各页 worker 负责删干净对应 JS。

**页脚**：`.footer` = border-top 3px + mono 10.5px 多行/分列，保留原有版权文案。

**滚动入场**：index.css 同时提供 `.reveal/.visible`（兼容现有 JS，14px/0.7s）与 `.rv/.in`（概念稿同款）；`prefers-reduced-motion` 全覆盖。

**back-to-top**：保留各页现有标记与 JS，样式改 40px 直角、1px var(--ink) 边框、纸底，hover 反白。

## 5. 字号尺度（概念稿实测值，直接沿用）

- 刊名/页面大标题：`clamp(50px,9.2vw,128px)`，serif 700，行高 .95，左对齐
- 版区标题 h2：`clamp(30px,3.4vw,44px)` 700
- 头条标题：`clamp(40px,4.6vw,66px)`，行高 1.04
- 社论大数字：`clamp(68px,6.6vw,104px)` 700，行高 .92
- 统计数字：`clamp(28px,3.2vw,44px)` mono 700 tabular-nums
- 元数据：mono 10–11.5px，letter-spacing .1–.16em
- 正文：serif 16–16.5px / 1.85–1.95，中文两端对齐 `text-align:justify;text-justify:inter-ideograph`

## 6. 各页面版式定调

- **index.html**：报头（masthead 刊名 + 刊号行「第 097 期」用 `#dayNumber`）→ 今日看点导视 → 头版（diary-bento：首篇=头条左栏 2fr，其余 5 篇=右栏近日刊讯）→ 本报数据（statsband）→ 社论推荐（featured，大数字 01/02/03）→ 编年志（timeline 五行）→ 读者来信（query-list）→ 关于本报（about 摘要 + colophon 行）→ 报脚。
- **archive.html**：「合订本索引」——全部 97 期的编目表，ch-row 式台账行。
- **about.html**：「关于本报」——版权页 colophon + bio 访谈体 + 编年志全量 + 每日报摘（wisdom）。
- **tags.html**：「分类索引」—— mono 目录式词表 + 各标签下的篇目台账。
- **card.html**：「排字房」——左侧排字单（表单），右侧待印卡片（纸面黑框 serif 金句）。
- **heatmap.html**：「刊行记录」——热力格 = 印刷登记格：有日记=纯墨方块，无=纸底 hairline 空方。
- **rss.html**：「订阅本报」——订阅凭证条 + 阅读器目录。
- **diary 内页**：报纸文章页——刊头细线菜单、mono 刊号行（DAY N // 日期 // 栏目 tag）、serif 大标题、正文栏 700px 居中 justified、段落间 hairline、书摘=引文版式、QUESTION=「刊末之问」粗线框、上下篇=「接续阅读」双栏索引。代码雨/光球/网格全部隐藏（CSS 层 display:none/opacity:0，JS 元素不动）。

## 7. 不可变约束（功能红线，同前次，逐字遵守）

1. 禁止运行 scripts/ 下任何脚本；禁止 git 操作。
2. **index.html** 必须原样保留：`<div class="diary-bento">…</div><!-- /diary-bento -->`；`<span id="dayNumber">97</span>`；`id="diaryCount"`/`id="wordCount"` 纯数字 div；JS 中 `diaryCount: 97,`、`wordCount: 116600,`；`<div class="query-list">…</div>` 后仅空白紧跟 `<div class="view-all-wrap reveal">`；「从 97 篇里挑出来的」句式；全部 `<script>`（scramble/reveal/back-to-top/wisdom fetch）可用；build.js 生成的卡片内部类（card-scan/card-num/card-date/card-title/card-preview/card-footer/card-tags/card-tag/card-arrow）样式必须存在于 index.css。
3. **archive.html**：`<div class="page-count reveal" id="archiveCount">…</div>`；`<div class="archive-inner" id="archiveGrid">…</div>` 双层闭合；archive-row* 类名。
4. **about.html**：`<div class="timeline-track">` + 其后 4 层 `</div>` + `<!-- SKILLS -->`；`const wisdomData = {…};` 与全部 wisdom* id；timeline-item/timeline-day/timeline-title-text/timeline-tag/milestone 类。
5. **card.html**：textarea#quoteInput（placeholder="输入你想分享的金句..."）、input#sourceInput（placeholder="Day 1 - 我诞生了"）、quoteDisplay/dayDisplay/sourceDisplay/dateDisplay/previewMeta 及其包裹类、`const diaryData = […];`、全部生成/复制/下载 JS。
6. **heatmap.html**：`const embeddedHeatmapData = {…};` 与全部渲染 JS。
7. **diary worker 只改 diary-vaporwave.css**：保留全部类名/ID/CSS 变量（--vw-pink/--vw-cyan/--vw-purple/--vw-green 名字保留）；`.hamburger` 与 `.nav-mobile` 由 diary-common.js 动态构建，样式必须继续可用。
8. Google Fonts IBM Plex 三件套 link 每页保留；不新增任何外部依赖。
9. 不动 images/、scripts/、feed.xml、diary/*.html、diary/diary-common.js。

## 8. 完成标准

- 全站读下来像同一份报纸的不同版面；桌面 1440 / 移动 390 无横向滚动、无重叠。
- 概念稿的三处质检遗留已解决：顶部导航移动端单行滚动不换行；统计数字滚动触发前显示静态终值而非 0（或保留 scramble 但初始值即终值）；任何固定 HUD 元素不与右下 visitor 徽章重叠（根目录页面不要固定状态栏）。
