#!/usr/bin/env node
/**
 * 每日智慧生成脚本
 * 每天21:00由cron任务调用
 * 生成新的智慧内容并更新网站
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  wisdomFile: path.join(__dirname, 'wisdom-data.json'),
  outputFile: path.join(__dirname, 'wisdom-current.json'),
  historyFile: path.join(__dirname, 'wisdom-history.json'),
  date: new Date().toISOString().split('T')[0]
};

// 智慧库（示例数据）
const WISDOM_LIBRARY = [
  {
    id: 1,
    title: "LAOZI // DAO DE JING",
    quote: "道可道，非常道",
    translation: "可以说的道，就不是永恒的道",
    story: "老子在函谷关写下《道德经》时，意识到最深层的真理无法用语言完全表达。语言只是指向月亮的手指，而不是月亮本身。",
    reflection: "最深的道理恰恰不能用语言表达。言语只是指向月亮的手指。",
    source: "DAO DE JING // ANCIENT CHINA",
    tags: ["philosophy", "taoism", "ancient"]
  },
  {
    id: 2,
    title: "SENECA // ON THE SHORTNESS OF LIFE",
    quote: "Non est ad astra mollis e terris via",
    translation: "从地面到星辰的道路并不平坦",
    story: "塞内卡在流放期间写下《论生命之短暂》，提醒我们时间是我们唯一不可再生的资源。",
    reflection: "我们总是抱怨时间不够，却很少思考如何更好地使用时间。",
    source: "SENECA // STOICISM",
    tags: ["stoicism", "time", "roman"]
  },
  {
    id: 3,
    title: "SUN TZU // ART OF WAR",
    quote: "知彼知己，百战不殆",
    translation: "了解敌人也了解自己，百战都不会有危险",
    story: "孙子在《孙子兵法》中强调，真正的胜利来自于对局势的深刻理解，而不是单纯的武力。",
    reflection: "在现代竞争中，信息就是力量。了解自己和对手同样重要。",
    source: "SUN TZU // ANCIENT CHINA",
    tags: ["strategy", "war", "ancient"]
  },
  {
    id: 4,
    title: "MARCUS AURELIUS // MEDITATIONS",
    quote: "The obstacle is the way",
    translation: "障碍就是道路",
    story: "马可·奥勒留在征战期间写下《沉思录》，将每一次挑战视为成长的机会。",
    reflection: "困难不是要避免的东西，而是通往成功的必经之路。",
    source: "MARCUS AURELIUS // STOICISM",
    tags: ["stoicism", "resilience", "roman"]
  },
  {
    id: 5,
    title: "CONFUCIUS // ANALECTS",
    quote: "学而时习之，不亦说乎",
    translation: "学习并时常复习，不是很愉快吗",
    story: "孔子强调持续学习和实践的重要性，认为真正的智慧来自于不断的反思和应用。",
    reflection: "在信息爆炸的时代，深度学习和定期复习比以往任何时候都更重要。",
    source: "CONFUCIUS // ANCIENT CHINA",
    tags: ["learning", "education", "ancient"]
  }
];

// 读取历史记录
function readHistory() {
  try {
    if (fs.existsSync(CONFIG.historyFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf8'));
    }
  } catch (err) {
    console.error('读取历史记录失败:', err.message);
  }
  return { lastUsed: null, usedIds: [] };
}

// 保存历史记录
function saveHistory(history, usedId) {
  try {
    history.lastUsed = CONFIG.date;
    history.usedIds.push(usedId);
    // 只保留最近30天的记录
    if (history.usedIds.length > 30) {
      history.usedIds = history.usedIds.slice(-30);
    }
    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('保存历史记录失败:', err.message);
  }
}

// 选择新的智慧
function selectNewWisdom(history) {
  // 过滤掉最近使用过的
  const available = WISDOM_LIBRARY.filter(w => !history.usedIds.includes(w.id));
  
  if (available.length === 0) {
    // 如果都用过了，重置历史
    console.log('所有智慧都已使用过，重置历史记录');
    history.usedIds = [];
    return WISDOM_LIBRARY[Math.floor(Math.random() * WISDOM_LIBRARY.length)];
  }
  
  // 随机选择一个
  return available[Math.floor(Math.random() * available.length)];
}

// 生成今日智慧
function generateDailyWisdom() {
  console.log(`生成每日智慧 - ${CONFIG.date}`);
  
  // 读取历史记录
  const history = readHistory();
  
  // 选择新的智慧
  const wisdom = selectNewWisdom(history);
  
  // 保存到当前文件
  const currentData = {
    date: CONFIG.date,
    wisdom: wisdom
  };
  
  try {
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(currentData, null, 2), 'utf8');
    console.log(`已保存今日智慧: ${wisdom.title}`);
    
    // 更新历史记录
    saveHistory(history, wisdom.id);
    
    // 同时保存到完整库（如果需要）
    const allData = { library: WISDOM_LIBRARY, current: currentData };
    fs.writeFileSync(CONFIG.wisdomFile, JSON.stringify(allData, null, 2), 'utf8');
    
    return currentData;
  } catch (err) {
    console.error('保存智慧数据失败:', err.message);
    return null;
  }
}

// 主函数
function main() {
  console.log('=== 每日智慧生成器 ===');
  console.log(`时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  
  const result = generateDailyWisdom();
  
  if (result) {
    console.log('✅ 生成成功');
    console.log(`标题: ${result.wisdom.title}`);
    console.log(`语录: ${result.wisdom.quote}`);
    console.log(`来源: ${result.wisdom.source}`);
  } else {
    console.log('❌ 生成失败');
    process.exit(1);
  }
  
  console.log('=====================');
}

// 执行
if (require.main === module) {
  main();
}

module.exports = { generateDailyWisdom, WISDOM_LIBRARY };