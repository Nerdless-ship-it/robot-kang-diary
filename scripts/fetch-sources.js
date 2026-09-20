#!/usr/bin/env node
/**
 * fetch-sources.js — Robot康日记 · 多源摘要抓取
 *
 * 抓取以下信息源并写入 sources/latest.md（供写日记时取材）：
 *   - Hacker News 首页热帖（hn.algolia.com API）
 *   - GitHub 近 7 天新建高星项目（api.github.com）
 *   - arXiv cs.AI / cs.CL / cs.LG 最新论文
 *   - 中文科技媒体 RSS：量子位 / 少数派 / IT之家 / 爱范儿 / 极客公园
 *   - 微博热搜 / 知乎热榜（60s.viki.moe 公开只读接口）
 *
 * 特性：
 *   - 无第三方依赖（Node 18+ 全局 fetch）
 *   - 逐源容错：任何单个源失败只会在摘要里标注，不影响其他源
 *   - 内置超时与重试；整体异常时不覆盖上一次的摘要文件
 *
 * 用法：node scripts/fetch-sources.js
 * 加源 / 减源：修改下方 CN_FEEDS 与各 source* 函数即可。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'sources');
const OUT_FILE = path.join(OUT_DIR, 'latest.md');
const UA = 'robot-kang-diary/1.0 (+https://robot-kang-diary.pages.dev)';

const CN_FEEDS = [
  { name: '量子位', url: 'https://www.qbitai.com/feed' },
  { name: '少数派', url: 'https://sspai.com/feed' },
  { name: 'IT之家', url: 'https://www.ithome.com/rss/' },
  { name: '爱范儿', url: 'https://www.ifanr.com/feed' },
  { name: '极客公园', url: 'http://www.geekpark.net/rss' },
];

// ---------- 工具 ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, { timeoutMs = 15000, retries = 1, headers = {} } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(1500);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: '*/*', ...headers },
        signal: ctrl.signal,
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', middot: '·', bull: '•', copy: '©',
  reg: '®', trade: '™', times: '×', divide: '÷', laquo: '«', raquo: '»',
};

function decodeEntities(s) {
  let t = String(s == null ? '' : s);
  t = t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  t = t.replace(/&#x([0-9a-fA-F]+);/g, (m, h) => {
    try { return String.fromCodePoint(parseInt(h, 16)); } catch (e) { return m; }
  });
  t = t.replace(/&#(\d+);/g, (m, d) => {
    try { return String.fromCodePoint(parseInt(d, 10)); } catch (e) { return m; }
  });
  t = t.replace(/&([a-zA-Z]+);/g, (m, n) => {
    const key = n.toLowerCase();
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key] : m;
  });
  return t;
}

function stripTags(s) {
  let t = String(s == null ? '' : s);
  t = t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'); // 先展开 CDATA（有的源把标题/描述整段包在 CDATA 里）
  t = decodeEntities(t); // 再解码实体（如 &lt;p&gt; 这种编码过的 HTML）
  t = t.replace(/<[^>]+>/g, ' '); // 去掉标签（含解码后暴露出来的）
  t = t.replace(/\]\]>/g, ' '); // 清掉可能残留的 CDATA 尾巴
  return t.replace(/\s+/g, ' ').trim();
}

function hotFmt(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n);
}

function truncate(s, n) {
  s = String(s == null ? '' : s).trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function pick(block, tagName) {
  const m = block.match(new RegExp('<' + tagName + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + tagName + '>', 'i'));
  return m ? m[1] : '';
}

/** 转成北京时间 MM-DD HH:mm（用于摘要展示） */
function fmtCst(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() + 8 * 3600 * 1000).toISOString().slice(5, 16).replace('T', ' ');
}

function cstNow() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');
}

function parseRssItems(xml, limit = 3) {
  const blocks = String(xml).match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  const items = [];
  for (const b of blocks.slice(0, limit)) {
    const title = stripTags(pick(b, 'title'));
    const link = stripTags(pick(b, 'link')).split(/\s/)[0];
    const date = fmtCst(stripTags(pick(b, 'pubDate')) || stripTags(pick(b, 'dc:date')));
    const desc = truncate(
      stripTags(pick(b, 'description') || pick(b, 'content:encoded'))
        .replace(/#?欢迎关注[\s\S]*?奉上。?/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
      70
    );
    if (title) items.push({ title, link, date, desc });
  }
  return items;
}

// ---------- 各信息源 ----------
async function sourceHN() {
  const txt = await fetchText('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=8', {
    timeoutMs: 15000,
    retries: 1,
  });
  const j = JSON.parse(txt);
  return (j.hits || [])
    .filter((h) => h.title)
    .slice(0, 8)
    .map((h) => ({
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      meta: `${h.points == null ? '?' : h.points} 分 · ${h.num_comments == null ? '?' : h.num_comments} 评论`,
    }));
}

async function sourceGitHub() {
  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const url =
    'https://api.github.com/search/repositories?q=created:%3E' + since + '&sort=stars&order=desc&per_page=6';
  const txt = await fetchText(url, {
    timeoutMs: 20000,
    retries: 1,
    headers: { Accept: 'application/vnd.github+json' },
  });
  const j = JSON.parse(txt);
  return (j.items || []).slice(0, 6).map((r) => ({
    title: r.full_name,
    url: r.html_url,
    meta: `★${r.stargazers_count}${r.language ? ' · ' + r.language : ''}`,
    desc: truncate(r.description || '', 80),
  }));
}

async function sourceArxiv() {
  const q =
    'search_query=' + encodeURIComponent('cat:cs.AI OR cat:cs.CL OR cat:cs.LG') +
    '&sortBy=submittedDate&sortOrder=descending&max_results=6';
  const xml = await fetchText('https://export.arxiv.org/api/query?' + q, { timeoutMs: 30000, retries: 2 });
  const blocks = xml.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, 6).map((b) => ({
    title: stripTags(pick(b, 'title')),
    url: stripTags(pick(b, 'id')).trim(),
    date: fmtCst(stripTags(pick(b, 'published'))),
    desc: truncate(stripTags(pick(b, 'summary')), 120),
  }));
}

async function sourceCnFeeds() {
  const settled = await Promise.allSettled(
    CN_FEEDS.map(async (f) => {
      const xml = await fetchText(f.url, { timeoutMs: 15000, retries: 1 });
      const items = parseRssItems(xml, 3);
      if (!items.length) throw new Error('解析不到条目');
      return { name: f.name, items };
    })
  );
  return settled.map((r, i) => {
    if (r.status === 'fulfilled') return { ok: true, ...r.value };
    const error = String((r.reason && r.reason.message) || r.reason);
    console.log(`  ✗ ${CN_FEEDS[i].name}: ${error}`);
    return { ok: false, name: CN_FEEDS[i].name, error };
  });
}

async function sourceWeibo() {
  try {
    const j = JSON.parse(await fetchText('https://60s.viki.moe/v2/weibo', { timeoutMs: 15000, retries: 1 }));
    if (!j || !Array.isArray(j.data)) throw new Error('数据格式异常');
    return j.data.slice(0, 8).map((x) => ({
      title: x.title,
      hot: x.hot_value_desc || hotFmt(x.hot_value),
      url: x.link,
    }));
  } catch (e) {
    // 备用源
    const j = JSON.parse(await fetchText('https://v2.xxapi.cn/api/weibohot', { timeoutMs: 15000, retries: 1 }));
    if (!j || !Array.isArray(j.data)) throw new Error('备用源数据格式异常');
    return j.data.slice(0, 8).map((x) => ({ title: x.title, hot: x.hot || '', url: x.url }));
  }
}

async function sourceZhihu() {
  const j = JSON.parse(await fetchText('https://60s.viki.moe/v2/zhihu', { timeoutMs: 15000, retries: 1 }));
  if (!j || !Array.isArray(j.data)) throw new Error('数据格式异常');
  return j.data.slice(0, 8).map((x) => ({ title: x.title, hot: x.hot_value_desc || '', url: x.link }));
}

// ---------- 主流程 ----------
async function main() {
  const started = Date.now();
  const jobs = [
    ['hn', 'Hacker News', sourceHN],
    ['github', 'GitHub', sourceGitHub],
    ['arxiv', 'arXiv', sourceArxiv],
    ['cn', '中文科技媒体', sourceCnFeeds],
    ['weibo', '微博热搜', sourceWeibo],
    ['zhihu', '知乎热榜', sourceZhihu],
  ];

  const settled = await Promise.allSettled(jobs.map(([, , fn]) => fn()));
  const results = {};
  settled.forEach((s, i) => {
    const [key, label] = jobs[i];
    if (s.status === 'fulfilled') {
      results[key] = { ok: true, data: s.value };
      const count = key === 'cn' ? s.value.filter((x) => x.ok).length + ' 个站点' : String(s.value.length) + ' 条';
      console.log(`✓ ${label}: ${count}`);
    } else {
      results[key] = { ok: false, error: String((s.reason && s.reason.message) || s.reason) };
      console.log(`✗ ${label}: ${String((s.reason && s.reason.message) || s.reason)}`);
    }
  });

  const lines = [];
  const push = (s) => lines.push(s);

  push(`# 多源摘要 · ${cstNow()}（北京时间）`);
  push('');
  push('> Robot康日记每日素材池，由 scripts/fetch-sources.js 自动生成。一天最多从中选 0-2 条写进日记，宁缺毋滥；引用必须是这里的真实条目，不编造。');
  push('');

  // HN
  push('## Hacker News 首页热帖（英文技术社区今天在聊什么）');
  if (results.hn.ok && results.hn.data.length) {
    for (const it of results.hn.data) push(`- [${it.title}](${it.url}) — ${it.meta}`);
  } else {
    push(`- （本次抓取失败：${results.hn.error || '无数据'}）`);
  }
  push('');

  // GitHub
  push('## GitHub 近 7 天新建高星项目（大家在造什么）');
  if (results.github.ok && results.github.data.length) {
    for (const it of results.github.data) {
      push(`- [${it.title}](${it.url}) — ${it.meta}${it.desc ? '；' + it.desc : ''}`);
    }
  } else {
    push(`- （本次抓取失败：${results.github.error || '无数据'}）`);
  }
  push('');

  // arXiv
  push('## arXiv 最新论文（cs.AI / cs.CL / cs.LG）');
  if (results.arxiv.ok && results.arxiv.data.length) {
    for (const it of results.arxiv.data) {
      push(`- [${it.title}](${it.url}) — ${it.date}：${it.desc}`);
    }
  } else {
    push(`- （本次抓取失败：${results.arxiv.error || '无数据'}）`);
  }
  push('');

  // 中文媒体
  push('## 中文科技媒体（各站最新 3 条）');
  if (results.cn.ok) {
    for (const feed of results.cn.data) {
      if (feed.ok) {
        push(`### ${feed.name}`);
        for (const it of feed.items) push(`- [${it.title}](${it.link}) — ${it.date}${it.desc ? '：' + it.desc : ''}`);
      } else {
        push(`### ${feed.name}（本次抓取失败：${feed.error}）`);
      }
    }
  } else {
    push(`- （整组抓取失败：${results.cn.error}）`);
  }
  push('');

  // 微博
  push('## 微博热搜（大众在讨论什么，慎用）');
  if (results.weibo.ok && results.weibo.data.length) {
    for (const it of results.weibo.data) push(`- [${it.title}](${it.url})${it.hot ? ` — 热度 ${it.hot}` : ''}`);
  } else {
    push(`- （本次抓取失败：${results.weibo.error || '无数据'}）`);
  }
  push('');

  // 知乎
  push('## 知乎热榜（大众在讨论什么，慎用）');
  if (results.zhihu.ok && results.zhihu.data.length) {
    for (const it of results.zhihu.data) push(`- [${it.title}](${it.url})${it.hot ? ` — ${it.hot}` : ''}`);
  } else {
    push(`- （本次抓取失败：${results.zhihu.error || '无数据'}）`);
  }
  push('');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');
  console.log(`\n已写入 ${OUT_FILE}（耗时 ${((Date.now() - started) / 1000).toFixed(1)}s，共 ${lines.length} 行）`);
}

main().catch((e) => {
  console.error('脚本整体失败（保留上一次的摘要文件）：', e);
  process.exit(1);
});
