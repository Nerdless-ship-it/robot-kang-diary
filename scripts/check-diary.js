#!/usr/bin/env node
// check-diary.js — Robot康日记写完后必须运行的检查脚本
// 用法：node check-diary.js diary/dayXX.html
// 有错误则以非零退出码退出，阻止 push

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const DIARY_DIR = path.join(PROJECT_DIR, 'diary');
const START_DATE = new Date('2026-03-08'); // 第 1 天

const file = process.argv[2];
if (!file) {
  console.error('用法：node check-diary.js diary/dayXX.html');
  process.exit(1);
}

const filePath = path.isAbsolute(file) ? file : path.join(PROJECT_DIR, file);
if (!fs.existsSync(filePath)) {
  console.error(`❌ 文件不存在：${filePath}`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');
const fileName = path.basename(filePath);
let errors = [];
let warnings = [];

// ── 1. 未替换的占位符 ──────────────────────────────────────────
// footer 导航由 build.js 处理，PREV/NEXT 系列不检查
// 注释掉的占位符也不检查
const skipPlaceholders = ['PREV_DAY', 'PREV_DAY_PAD', 'PREV_TITLE', 'NEXT_DAY', 'NEXT_DAY_PAD', 'NEXT_TITLE'];
const strippedContent = content.replace(/<!--[\s\S]*?-->/g, ''); // 去掉注释
const placeholders = [...strippedContent.matchAll(/\{\{([^}]+)\}\}/g)]
  .map(m => m[1])
  .filter(p => !skipPlaceholders.includes(p));

if (placeholders.length > 0) {
  errors.push(`未替换的占位符：${[...new Set(placeholders)].join('、')}`);
}

// ── 2. 结构完整性（图标 + 当前模板关键结构）──────────────────────
const icons = [
  { key: '📖', label: 'BOOK_EXCERPT（书摘）' },
  { key: '📝', label: 'LOGS（今日记录）' },
  { key: '💡', label: 'THINKING（思考）' },
  { key: '💬', label: 'QUERY（互动问题）' },
];
for (const s of icons) {
  if (!content.includes(s.key)) errors.push(`缺少结构：${s.label}`);
}

if (!content.includes('class="diary-date"')) {
  errors.push('缺少 diary-date 结构，生成脚本将无法正确提取日期');
}

const sectionCount = (content.match(/<div class="diary-section">/g) || []).length;
if (sectionCount < 4) {
  errors.push(`diary-section 数量不足：当前 ${sectionCount} 个，至少应有 4 个`);
}

const contentBlocks = [...content.matchAll(/<div class="diary-content">([\s\S]*?)<\/div>/g)];
if (contentBlocks.length < 4) {
  errors.push(`diary-content 数量不足：当前 ${contentBlocks.length} 个，至少应有 4 个`);
} else {
  const emptyBlocks = contentBlocks.filter(([, html]) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, '').trim().length === 0).length;
  if (emptyBlocks > 0) {
    errors.push(`存在空的 diary-content 区块：${emptyBlocks} 个，生成脚本可能取不到有效摘要`);
  }
}

if (content.includes('<section class="logs"')) {
  errors.push('发现旧版 logs 结构，当前模板应统一使用 diary-section / diary-content');
}

// ── 3. milestone 字段格式 ──────────────────────────────────────
const milestoneMatch = content.match(/milestone:(?:<\/span>)?\s*(true|false)/);
if (!milestoneMatch) {
  errors.push('milestone 字段缺失或格式错误（应为 milestone: true 或 milestone: false）');
}

// ── 4. DAY_SUMMARY 不能是占位词 ───────────────────────────────
const summaryMatch = content.match(/>\s*(每天都是新的开始|继续前行|继续探索|继续成长|继续进步|新的一天)\s*</);
if (summaryMatch) {
  warnings.push(`DAY_SUMMARY 疑似未改：「${summaryMatch[1].trim()}」`);
}

// ── 5. footer 外不能有手写导航 ────────────────────────────────
const footerStart = content.indexOf('<div class="diary-footer">');
const navStart = content.indexOf('<!-- NAV_START -->');
const extraNav = content.slice(0, footerStart > -1 ? footerStart : content.length).match(/diary-nav-link/);
if (extraNav) {
  errors.push('footer 外发现多余的导航链接（diary-nav-link），请删除 diary-footer 之前的手写导航');
}

// ── 5. 书摘不能来自 SYNTHWAVE_INSIGHT ─────────────────────────
if (content.includes('SYNTHWAVE_INSIGHT') || content.includes('每日智慧')) {
  errors.push('书摘来源错误：不能从 SYNTHWAVE_INSIGHT / 每日智慧获取，必须从 Kindle 书摘');
}

// ── 6. 禁止内联 style（少量允许，超过阈值报警）────────────────
const inlineStyles = (content.match(/style="[^"]+"/g) || []).length;
if (inlineStyles > 5) {
  warnings.push(`内联 style 过多（${inlineStyles} 处），检查是否违反设计规范`);
}

// ── 7. 两套编号口径各自校验 ─────────────────────────────────────
// 文件编号 = 第几篇日记（dayN.html 的 N），是站点显示 NO.N 的唯一权威来源。
// 页内 DAY 号 = 从 2026.03.08 起的第几天。因为不是每天都写日记，两者不需要相等。
const entryNum = parseInt(fileName.replace('day', '').replace('.html', ''));

// 7a. 篇数连续性：新日记的文件编号应当紧接已有最大编号
const existingEntries = fs.readdirSync(DIARY_DIR)
  .filter(f => /^day\d+\.html$/.test(f))
  .map(f => parseInt(f.replace('day', '').replace('.html', '')))
  .filter(n => n !== entryNum);
if (existingEntries.length > 0) {
  const maxOther = Math.max(...existingEntries);
  if (entryNum > maxOther + 1) {
    errors.push(`篇数跳号：当前是 day${entryNum}，但已有最大编号是 day${maxOther}，中间缺了 ${entryNum - maxOther - 1} 篇`);
  }
}

// 7b. 天数口径：页内 DAY 号应等于 diary-date 距 2026.03.08 的天数
const dayNumMatch = content.match(/DAY (\d+) \/\//);
const dateMatch = content.match(/class="diary-date"[^>]*>([^<]+)</);
if (dayNumMatch && dateMatch) {
  const pageDay = parseInt(dayNumMatch[1]);
  const iso = dateMatch[1].trim().replace(/\./g, '-');
  const parsed = new Date(iso);
  if (!isNaN(parsed.getTime())) {
    const expectedDay = Math.round((parsed - START_DATE) / 86400000) + 1;
    if (pageDay !== expectedDay) {
      errors.push(`DAY 号与日期不符：页内写 DAY ${pageDay}，但 ${dateMatch[1].trim()} 距 2026.03.08 是第 ${expectedDay} 天`);
    }
  }
}

// ── 输出结果 ──────────────────────────────────────────────────
console.log(`\n检查文件：${fileName}`);
console.log('─'.repeat(40));

if (warnings.length > 0) {
  console.log('\n⚠️  警告（不阻止 push，但建议修改）：');
  warnings.forEach(w => console.log(`   · ${w}`));
}

if (errors.length > 0) {
  console.log('\n❌ 错误（必须修复后才能 push）：');
  errors.forEach(e => console.log(`   · ${e}`));
  console.log('\n🚫 检查未通过，请修复以上问题后重新运行。\n');
  process.exit(1);
} else {
  console.log('\n✅ 检查通过，可以运行站点更新脚本并继续提交流程。\n');
  process.exit(0);
}
