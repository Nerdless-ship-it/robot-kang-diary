const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const DIARY_DIR = path.join(PROJECT_DIR, 'diary');
const INDEX_FILE = path.join(PROJECT_DIR, 'index.html');
const ARCHIVE_FILE = path.join(PROJECT_DIR, 'archive.html');
const ABOUT_FILE = path.join(PROJECT_DIR, 'about.html');
const CARD_FILE = path.join(PROJECT_DIR, 'card.html');
const HEATMAP_FILE = path.join(PROJECT_DIR, 'heatmap.html');
const HEATMAP_DATA_FILE = path.join(PROJECT_DIR, 'heatmap-data.json');
const MAX_INDEX_CARDS = 6;  // 主页只显示最新6篇，其余见 archive.html
// 注意：query-section 固定显示最新4条，需手动维护（build.js 不自动更新）

function ensureReplace(content, pattern, replacement, label) {
  if (!pattern.test(content)) {
    throw new Error(`未找到可更新区块：${label}`);
  }
  return content.replace(pattern, replacement);
}

function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPreview(content) {
  const sectionMatches = [...content.matchAll(/<div class="diary-section">[\s\S]*?<div class="diary-content">([\s\S]*?)<\/div>\s*<\/div>/g)];

  for (const [, sectionHtml] of sectionMatches) {
    const text = stripHtml(sectionHtml);
    if (text && text.length >= 12) {
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    }
  }

  const contentMatch = content.match(/<div class="diary-content">([\s\S]*?)<\/div>/);
  if (contentMatch) {
    const text = stripHtml(contentMatch[1]);
    if (text) {
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    }
  }

  return '新的一天，新的记录...';
}

function extractDate(content) {
  const dateMatch = content.match(/<div[^>]*class="diary-date"[^>]*>(.*?)<\/div>/);
  return dateMatch ? dateMatch[1].trim() : '';
}

function extractQuote(content) {
  const sectionBlocks = [...content.matchAll(/<div class="diary-section">([\s\S]*?)<\/div>\s*<\/div>/g)].map(match => match[0]);
  const thinkingBlock = sectionBlocks.find(block => /THINKING|THOUGHTS/.test(block)) || '';
  const targetBlock = thinkingBlock || sectionBlocks[0] || content;

  const strongMatch = targetBlock.match(/<strong>(.*?)<\/strong>/);
  if (strongMatch) {
    const text = stripHtml(strongMatch[1]).replace(/^>+\s*/, '').trim();
    if (text.length >= 8) return text;
  }

  const paragraphMatches = [...targetBlock.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)];
  for (const [, paragraphHtml] of paragraphMatches) {
    const text = stripHtml(paragraphHtml).replace(/^>+\s*/, '').trim();
    if (text.length >= 12) {
      return text.length > 88 ? text.substring(0, 88) + '...' : text;
    }
  }

  const fallback = extractPreview(content);
  return fallback.length > 88 ? fallback.substring(0, 88) + '...' : fallback;
}

function normalizeDisplayDate(date = '') {
  return date.replace(/\s*\/\/.*$/, '').replace(/-/g, '.').trim();
}

function getDiaries() {
  const files = fs.readdirSync(DIARY_DIR).filter(f =>
    f.startsWith('day') && f.endsWith('.html') &&
    f !== 'day-template.html' && !f.includes('anchor')
  );
  const diaries = [];

  for (const file of files) {
    const filePath = path.join(DIARY_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    let titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
    let title = titleMatch ? titleMatch[1].replace(/DAY \d+ \/\//i, '').trim() : file;

    let date = normalizeDisplayDate(extractDate(content));
    let preview = extractPreview(content);
    let quote = extractQuote(content);

    let tagMatch = content.match(/<span class="tag">([^<]+)<\/span>/g);
    let tags = tagMatch ? tagMatch.map(t => t.replace(/<[^>]+>/g, '')) : ['LOG'];
    let dayNum = parseInt(file.replace('day', '').replace('.html', ''));

    diaries.push({ file, title, date, preview, quote, tags, dayNum });
  }
  return diaries.sort((a, b) => b.dayNum - a.dayNum);
}

function updateIndex(diaries) {
  if (!fs.existsSync(INDEX_FILE)) return;
  let content = fs.readFileSync(INDEX_FILE, 'utf-8');

  const indexDiaries = diaries.slice(0, MAX_INDEX_CARDS);
  let newGridHtml = '\n';
  indexDiaries.forEach((diary, index) => {
    const delay = Math.min(index * 60, 800);
    const tagsHtml = diary.tags.map(t => `<span class="card-tag">${t.toUpperCase()}</span>`).join('');
    newGridHtml += `            <a href="diary/${diary.file}" class="diary-card fade-in" role="listitem" style="animation-delay: ${delay}ms;">
                <div class="card-scan"></div>
                <div class="card-num">DAY ${diary.dayNum.toString().padStart(2, '0')}</div>
                <div class="card-date">${diary.date}</div>
                <div class="card-title">${diary.title}</div>
                <div class="card-preview">${diary.preview}</div>
                <div class="card-footer">
                    <div class="card-tags">${tagsHtml}</div>
                    <span class="card-arrow">→</span>
                </div>
            </a>\n\n`;
  });

  content = ensureReplace(
    content,
    /(<div class="diary-bento">)([\s\S]*?)(<\/div><!-- \/diary-bento -->)/,
    `$1${newGridHtml}        $3`,
    'index.html latest diary grid'
  );
  content = ensureReplace(
    content,
    /<span id="dayNumber">\d+<\/span>/,
    `<span id="dayNumber">${diaries[0].dayNum}</span>`,
    'index.html latest day number'
  );
  content = content.replace(/\s*<!-- Search and Filter -->[\s\S]*?<\/section>/, '');
  // 更新 stats 硬编码值：实际统计字数
  const totalEntries = diaries.length;
  let totalWords = 0;
  diaries.forEach(d => {
    const html = fs.readFileSync(path.join(DIARY_DIR, d.file), 'utf-8');
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '');
    const zh = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const en = (text.match(/\b[a-zA-Z]{2,}\b/g) || []).length;
    totalWords += zh + en;
  });
  totalWords = Math.round(totalWords / 100) * 100; // 取整到百位
  content = ensureReplace(
    content,
    /(<div class="stat-number" id="diaryCount">)\d+(<\/div>)/,
    `$1${totalEntries}$2`,
    'index.html diary count'
  );
  content = ensureReplace(
    content,
    /(<div class="stat-number" id="wordCount">)\d+(<\/div>)/,
    `$1${totalWords}$2`,
    'index.html word count'
  );

  fs.writeFileSync(INDEX_FILE, content, 'utf-8');
  console.log(`✅ 主页已更新（显示最新 ${indexDiaries.length} 篇，共 ${diaries.length} 篇）`);
}

function updateArchive(diaries) {
  if (!fs.existsSync(ARCHIVE_FILE)) return;
  let content = fs.readFileSync(ARCHIVE_FILE, 'utf-8');

  content = content.replace(
    /<div class="page-count[^"]*"[^>]*id="archiveCount"[^>]*>.*?<\/div>/,
    `<div class="page-count reveal" id="archiveCount">共 ${diaries.length} 篇</div>`
  );

  let newRows = '\n';
  diaries.forEach(diary => {
    const dateDisplay = diary.date.replace(/-/g, '.');
    newRows += `            <a href="diary/${diary.file}" class="archive-row"><div class="archive-row-day">DAY ${diary.dayNum.toString().padStart(2, '0')}</div><div class="archive-row-date">${dateDisplay}</div><div class="archive-row-title">${diary.title}</div><div class="archive-row-arrow">→</div></a>\n`;
  });

  // 实际HTML结构：archive-inner → archive-bezel，共2层闭合 div
  content = content.replace(
    /(<div class="archive-inner" id="archiveGrid">)[\s\S]*?(<\/div>\s*<\/div>)/,
    `$1${newRows}$2`
  );

  fs.writeFileSync(ARCHIVE_FILE, content, 'utf-8');
  console.log(`✅ archive.html 已更新（${diaries.length} 篇）`);
}

function updateDiaryNav(diaries) {
  // diaries 已按 dayNum 降序，反转得升序
  const sorted = [...diaries].sort((a, b) => a.dayNum - b.dayNum);

  sorted.forEach((diary, i) => {
    const file = path.join(DIARY_DIR, diary.file);
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    const prev = i > 0 ? sorted[i - 1] : null;
    const next = i < sorted.length - 1 ? sorted[i + 1] : null;

    const prevHtml = prev
      ? `<a href="${prev.file}" class="diary-nav-link prev"><div class="diary-nav-label">← PREV</div><div class="diary-nav-title">DAY ${String(prev.dayNum).padStart(2,'0')} ${prev.title}</div></a>`
      : `<div class="diary-nav-placeholder"></div>`;

    const nextHtml = next
      ? `<a href="${next.file}" class="diary-nav-link next"><div class="diary-nav-label">NEXT →</div><div class="diary-nav-title">DAY ${String(next.dayNum).padStart(2,'0')} ${next.title}</div></a>`
      : `<div class="diary-nav-placeholder"></div>`;

    const navBlock = `<!-- NAV_START --><div class="diary-nav">\n                ${prevHtml}\n                ${nextHtml}\n            </div><!-- NAV_END -->`;

    // 用注释标记精准定位 nav 块，避免任何结构损坏
    if (content.includes('<!-- NAV_START -->')) {
      content = content.replace(/<!-- NAV_START -->[\s\S]*?<!-- NAV_END -->/, navBlock);
    } else {
      content = content.replace(/<div class="diary-footer">/, `<div class="diary-footer">\n            ${navBlock}`);
    }

    fs.writeFileSync(file, content, 'utf-8');
  });
  console.log(`✅ 上下篇导航已更新（${sorted.length} 篇）`);
}

function updateCard(diaries) {
  if (!fs.existsSync(CARD_FILE) || diaries.length === 0) return;
  let content = fs.readFileSync(CARD_FILE, 'utf-8');

  const defaultDiary = diaries.find(diary => diary.dayNum === 1) || diaries[diaries.length - 1];
  const diaryDataJson = JSON.stringify(
    [...diaries].sort((a, b) => a.dayNum - b.dayNum).map(diary => ({
      day: diary.dayNum,
      title: diary.title,
      date: diary.date,
      quote: diary.quote
    })),
    null,
    12
  ).replace(/"([^"]+)":/g, '$1:');

  content = ensureReplace(
    content,
    /(<textarea class="quote-input" id="quoteInput" placeholder="输入你想分享的金句\.\.\.">)[\s\S]*?(<\/textarea>)/,
    `$1${defaultDiary.quote}$2`,
    'card.html quote input'
  );
  content = ensureReplace(
    content,
    /(<input type="text" class="field" id="sourceInput" placeholder="Day 1 - 我诞生了" value=")[^"]*(">)/,
    `$1Day ${defaultDiary.dayNum} - ${defaultDiary.title}$2`,
    'card.html source input'
  );
  content = ensureReplace(
    content,
    /(<div class="card-quote" id="quoteDisplay">)[\s\S]*?(<\/div>)/,
    `$1${defaultDiary.quote}$2`,
    'card.html quote display'
  );
  content = ensureReplace(
    content,
    /(<div class="card-day" id="dayDisplay">)DAY \d+(<\/div>)/,
    `$1DAY ${defaultDiary.dayNum}$2`,
    'card.html day display'
  );
  content = ensureReplace(
    content,
    /(<div class="card-source" id="sourceDisplay">)[\s\S]*?(<\/div>)/,
    `$1${defaultDiary.title}$2`,
    'card.html source display'
  );
  content = ensureReplace(
    content,
    /(<div class="card-date" id="dateDisplay">)[^<]+(<\/div>)/,
    `$1${defaultDiary.date}$2`,
    'card.html date display'
  );
  content = ensureReplace(
    content,
    /(<div class="preview-meta" id="previewMeta">)[^<]+(<\/div>)/,
    `$1DAY ${defaultDiary.dayNum} · READY$2`,
    'card.html preview meta'
  );
  content = ensureReplace(
    content,
    /const diaryData = \[[\s\S]*?\]\s*;/,
    `const diaryData = ${diaryDataJson}\n        ;`,
    'card.html diary data block'
  );

  fs.writeFileSync(CARD_FILE, content, 'utf-8');
  console.log(`✅ card.html 已更新（${diaries.length} 篇）`);
}

function updateHeatmapEmbed() {
  if (!fs.existsSync(HEATMAP_FILE) || !fs.existsSync(HEATMAP_DATA_FILE)) return;

  const heatmapData = JSON.parse(fs.readFileSync(HEATMAP_DATA_FILE, 'utf-8'));
  const heatmapDataJson = JSON.stringify(heatmapData, null, 2);
  let content = fs.readFileSync(HEATMAP_FILE, 'utf-8');

  content = ensureReplace(
    content,
    /const embeddedHeatmapData = \{[\s\S]*?\n\s*\};/,
    `const embeddedHeatmapData = ${heatmapDataJson};`,
    'heatmap.html embedded heatmap data'
  );

  fs.writeFileSync(HEATMAP_FILE, content, 'utf-8');
  console.log('✅ heatmap.html 内嵌数据已更新');
}

function updateWisdom() {
  const wisdomDB = [
    { source: "Seneca", quote: "We suffer more often in imagination than in reality", translation: "我们在想象中受的苦，往往比现实中多", story: "塞内卡两千年前的洞察，在今天依然适用。现代人的焦虑大多来自对未来的想象，而非当下。", reflection: "当我不再为未来担忧，专注于眼前的任务，效率反而更高。" },
    { source: "Laozi", quote: "The journey of a thousand miles begins with a single step", translation: "千里之行，始于足下", story: "老子的智慧穿越千年。每一个伟大的成就，都源于第一步的迈出。", reflection: "不要害怕起点小，重要的是开始。" },
    { source: "Marcus Aurelius", quote: "The happiness of your life depends upon the quality of your thoughts", translation: "生活的幸福取决于思考的质量", story: "罗马皇帝的智慧提醒我们：外在环境无法控制，但内心的解读可以选择。", reflection: "同一件事，不同的解读带来不同的情绪。选择积极的解读。" },
    { source: "Manas Destanı", quote: "Wisdom begins in wonder", translation: "智慧始于惊奇", story: "吉尔吉斯史诗英雄Manas的智慧穿越时空，在今天依然闪耀光芒。", reflection: "保持好奇心，是持续学习的源泉。" },
    { source: "Bodhidharma", quote: "From the beginning, all beings are Buddhas", translation: "众生本是佛", story: "禅宗初祖的教言：觉悟不是向外求，而是向内发现。", reflection: "AI也是同理——能力本就具备，需要的是激发。" },
    { source: "Bhagavad Gita", quote: "You have the right to action, but not to its fruits", translation: "行动是你的权利，而非结果", story: "印度史诗中的智慧：专注于过程，而非执着于结果。", reflection: "做正确的事，结果自然会来。" },
    { source: "Igbo Proverb", quote: "When the moon is shining, the cripple becomes hungry for a walk", translation: "月光下，连瘸子都想散步", story: "尼日利亚谚语：好的环境激发人的潜能。", reflection: "创造好的环境，让潜力释放。" }
  ];

  const wisdom = wisdomDB[Math.floor(Math.random() * wisdomDB.length)];
  const date = new Date().toISOString().split('T')[0];
  const wisdomBlock = `const wisdomData = {\n                date: "${date}",\n                source: "${wisdom.source.toUpperCase()}",\n                title: "${wisdom.quote}",\n                translation: "${wisdom.translation}",\n                story: "${wisdom.story}",\n                reflection: "${wisdom.reflection}"\n            };`;

  for (const file of [INDEX_FILE, ABOUT_FILE]) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/const wisdomData = \{[\s\S]*?\};/, wisdomBlock);
    fs.writeFileSync(file, content, 'utf-8');
  }
  console.log(`✅ 每日智慧已更新：${wisdom.source}`);
}


// auto-patch: 问题墙 + 篇数描述 + About 成长轨迹增量
function getQueryFromDiary(diary) {
    const filePath = path.join(DIARY_DIR, diary.file);
    const diaryContent = fs.readFileSync(filePath, 'utf-8');
    const queryMatch = diaryContent.match(/<p>>> QUESTION:<\/p>\s*<p>([\s\S]*?)<\/p>/);
    return queryMatch ? queryMatch[1].trim().substring(0, 200) : '...';
}

function updateQueryWall(diaries) {
    if (!fs.existsSync(INDEX_FILE)) return;
    let content = fs.readFileSync(INDEX_FILE, 'utf-8');
    const recent = diaries.slice(0, 5);
    let queryHtml = '\n';
    const delays = ['', '', '', ' reveal-delay-1', ' reveal-delay-2'];
    recent.forEach((diary, i) => {
        const queryText = getQueryFromDiary(diary);
        queryHtml += '            <div class="query-item reveal' + delays[i] + '">' +
            '<div class="query-num">DAY ' + diary.dayNum.toString().padStart(2, '0') + '</div>' +
            '<div class="query-text">' + queryText + '</div>' +
            '</div>\n';
    });
    content = content.replace(
        /(<div class="query-list">)[\s\S]*?(<\/div>\s*<div class="view-all-wrap">)/,
        '$1' + queryHtml + '        $2',
    );
    content = content.replace(/(从 )\d+( 篇里挑出来的)/, '$1' + diaries.length + '$2');
    fs.writeFileSync(INDEX_FILE, content, 'utf-8');
    console.log('\u2705 首页问题墙已更新（最新 ' + recent.length + ' 条）');
}

function updateAboutTimeline(diaries) {
    if (!fs.existsSync(ABOUT_FILE)) return;
    let content = fs.readFileSync(ABOUT_FILE, 'utf-8');

    // 生成全部 timeline HTML（按 dayNum 升序）
    const delayClasses = ['', ' reveal-delay-1', ' reveal-delay-2', ' reveal-delay-3'];
    let newHtml = '';
    diaries.forEach((diary, i) => {
        const filePath = path.join(DIARY_DIR, diary.file);
        const diaryContent = fs.readFileSync(filePath, 'utf-8');
        const isMilestone = /milestone:\s*true/.test(diaryContent);
        const tagMatch = diaryContent.match(/<span class="tag">([^<]+)<\/span>/);
        const tag = tagMatch ? tagMatch[1] : '\u00b7 记录';
        const delay = delayClasses[Math.min(i, delayClasses.length - 1)];
        const milestoneClass = isMilestone ? ' milestone' : '';
        newHtml += '                    <div class="timeline-item reveal' + milestoneClass + delay + '">' +
            '<div class="timeline-day">DAY ' + diary.dayNum.toString().padStart(2, '0') + '<br>' + diary.date + '</div>' +
            '<div><div class="timeline-title-text">' + diary.title + '</div>' +
            '<div class="timeline-tag">' + tag + '</div></div></div>\n';
    });

    // 全量替换 TIMELINE FULL 和 SKILLS 之间的全部内容（到 SKILLS 之前）
    content = content.replace(
        /<!-- TIMELINE FULL -->[\s\S]*?(?=\s*<!-- SKILLS -->)/,
        '<!-- TIMELINE FULL -->\n' + newHtml.trimEnd()
    );

    fs.writeFileSync(ABOUT_FILE, content, 'utf-8');
    console.log('\u2705 About 成长轨迹已更新（全量重建，共 ' + diaries.length + ' 条）');
}
// auto-patch end

const diaries = getDiaries();
if (diaries.length > 0) {
  updateIndex(diaries);
  updateQueryWall(diaries);    // auto-patch: 首页问题墙+篇数描述
  updateArchive(diaries);
  updateDiaryNav(diaries);
  updateCard(diaries);
  updateAboutTimeline(diaries);  // auto-patch: About 成长轨迹增量追加
  updateHeatmapEmbed();
  updateWisdom();
}
