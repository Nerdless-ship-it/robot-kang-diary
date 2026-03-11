#!/usr/bin/env node
/**
 * 修复版每日智慧生成器
 * 简化版本，确保稳定运行
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  outputFile: path.join(__dirname, 'wisdom-current.json'),
  historyFile: path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'skills', 'daily-wisdom', 'history.md'),
  date: new Date().toISOString().split('T')[0],
  today: new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
};

// 预定义的源池（从SKILL.md提取）
const SOURCE_POOL = {
  turkic_central_asian: [
    { name: 'Dede Korkut', description: 'Kan Turalı, Basat & Tepegöz, Deli Dumrul, Bamsı Beyrek, Salur Kazan' },
    { name: 'Orhon Yazıtları', description: 'Bilge Kağan, Kül Tigin, Tonyukuk' },
    { name: 'Göktürk & Hun', description: 'Mete Han, Bumin Kağan, İstemi Yabgu, Attila' },
    { name: 'Manas Destanı', description: 'Kırgız epic, largest oral tradition in the world' },
    { name: 'Nasreddin Hoca', description: 'Timeless wit and paradox' }
  ],
  islamic_golden_age: [
    { name: 'İbn Sina', description: 'Science & philosophy' },
    { name: 'Al-Khwarizmi', description: 'Mathematics and algorithms' },
    { name: 'Mevlana', description: 'Sufi poetry & wisdom' },
    { name: 'Ibn Battuta', description: 'The greatest traveler' }
  ],
  classical_mediterranean: [
    { name: 'Seneca', description: 'Stoic philosophy' },
    { name: 'Marcus Aurelius', description: 'Meditations and leadership' },
    { name: 'Epictetus', description: 'Stoic teachings' },
    { name: 'Aristotle', description: 'Greek philosophy' },
    { name: 'Socrates', description: 'Questioning everything' }
  ],
  far_east: [
    { name: 'Sun Tzu', description: 'Art of War' },
    { name: 'Miyamoto Musashi', description: 'Book of Five Rings' },
    { name: 'Confucius', description: 'Eastern philosophy' },
    { name: 'Laozi', description: 'Dao De Jing' },
    { name: 'Zen koans', description: 'Paradox and insight' }
  ],
  ancient_pre_classical: [
    { name: 'Gilgamesh', description: 'The oldest story' },
    { name: 'Egyptian wisdom', description: 'Ptahhotep, Book of the Dead' },
    { name: 'Norse mythology', description: 'Hávamál, Odin\'s wisdom' },
    { name: 'Sumerian proverbs', description: 'Ancient wisdom' }
  ],
  african_indigenous: [
    { name: 'Sundiata Keita', description: 'Mali Empire founder' },
    { name: 'Mansa Musa', description: 'Richest human in history' },
    { name: 'Anansi stories', description: 'West African trickster wisdom' },
    { name: 'Ubuntu philosophy', description: 'I am because we are' }
  ],
  renaissance_early_modern: [
    { name: 'Machiavelli', description: 'The Prince' },
    { name: 'Leonardo da Vinci', description: 'Renaissance genius' },
    { name: 'Copernicus', description: 'Paradigm shifts' },
    { name: 'Ada Lovelace', description: 'First computer programmer' }
  ]
};

// 智慧内容库
const WISDOM_CONTENT = {
  'Seneca': {
    title: 'SENECA // SYNTHWAVE INSIGHT',
    quote: 'Non est ad astra mollis e terris via',
    translation: '从地面到星辰的道路并不平坦',
    story: '塞内卡在流放期间写下《论生命之短暂》，提醒我们时间是我们唯一不可再生的资源。作为尼禄皇帝的导师，他亲眼目睹权力如何腐蚀人性，财富如何带来空虚。在科西嘉岛的流放岁月中，他每天面对大海思考：如果生命如此短暂，我们为何还要浪费时间在琐事上？',
    reflection: '现代人总抱怨时间不够，却把大量时间花在社交媒体和无意义的娱乐上。真正的智慧不是管理时间，而是选择如何度过时间。',
    source: 'SENECA // STOICISM'
  },
  'Marcus Aurelius': {
    title: 'MARCUS AURELIUS // SYNTHWAVE INSIGHT',
    quote: 'The obstacle is the way',
    translation: '障碍就是道路',
    story: '马可·奥勒留在征战期间写下《沉思录》，将每一次挑战视为成长的机会。作为罗马皇帝，他白天处理国事、指挥战争，晚上在帐篷里写下个人反思。面对瘟疫、战争和背叛，他始终坚守斯多葛哲学：我们不能控制外部事件，但能控制自己的反应。',
    reflection: '困难不是要避免的东西，而是通往成功的必经之路。每一次挫折都是成长的机会，每一次失败都是学习的契机。',
    source: 'MARCUS AURELIUS // STOICISM'
  },
  'Laozi': {
    title: 'LAOZI // SYNTHWAVE INSIGHT',
    quote: '道可道，非常道',
    translation: '可以说的道，就不是永恒的道',
    story: '老子在函谷关写下《道德经》时，意识到最深层的真理无法用语言完全表达。作为周朝守藏室之史，他阅尽天下典籍，却发现真正的智慧不在书中。关令尹喜看到紫气东来，知道圣人将至，恳求老子留下著作。老子写下五千言后西去，留下千古谜题。',
    reflection: '在信息爆炸的时代，我们被各种"道理"淹没，却忘记了真正的智慧需要静心体会。言语只是指向月亮的手指，不是月亮本身。',
    source: 'DAO DE JING // ANCIENT CHINA'
  },
  'Sun Tzu': {
    title: 'SUN TZU // SYNTHWAVE INSIGHT',
    quote: '知彼知己，百战不殆',
    translation: '了解敌人也了解自己，百战都不会有危险',
    story: '孙子在吴王阖闾面前演示兵法，将宫女训练成军队。他告诉吴王：战争不是比拼武力，而是比拼智慧。真正的胜利来自于对局势的深刻理解，而不是单纯的勇气。《孙子兵法》不仅改变了战争，也影响了商业、政治和人生策略。',
    reflection: '在现代竞争中，信息就是力量。了解自己和对手同样重要，无论是商业竞争还是个人发展，都需要战略思维。',
    source: 'SUN TZU // ANCIENT CHINA'
  },
  'İbn Sina': {
    title: 'İBN SINA // SYNTHWAVE INSIGHT',
    quote: 'العلم هو إدراك الشيء على ما هو عليه',
    translation: '知识是按照事物本来面目认识事物',
    story: '伊本·西那（阿维森纳）在10世纪完成了《医典》，这部著作成为欧洲医学教科书长达600年。他不仅是医生，还是哲学家、天文学家和诗人。在战乱中逃亡时，他仍然坚持写作和研究，认为知识是人类最高贵的追求。',
    reflection: '在AI时代，我们更需要跨学科思维。真正的创新往往发生在不同领域的交叉点，就像伊本·西那融合医学、哲学和科学一样。',
    source: 'İBN SINA // ISLAMIC GOLDEN AGE'
  }
};

// 读取历史记录
function readHistory() {
  try {
    if (fs.existsSync(CONFIG.historyFile)) {
      const content = fs.readFileSync(CONFIG.historyFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      const history = {
        entries: [],
        usedSources: new Set(),
        lastTradition: null
      };
      
      lines.forEach(line => {
        const match = line.match(/(\d{4}-\d{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*(.+)/);
        if (match) {
          const [, date, source, topic] = match;
          history.entries.push({ date, source, topic });
          history.usedSources.add(source.toLowerCase());
        }
      });
      
      return history;
    }
  } catch (err) {
    console.error('读取历史记录失败:', err.message);
  }
  
  return { entries: [], usedSources: new Set(), lastTradition: null };
}

// 选择传统和源
function selectTraditionAndSource(history) {
  const traditionKeys = Object.keys(SOURCE_POOL);
  
  // 随机选择传统
  const tradition = traditionKeys[Math.floor(Math.random() * traditionKeys.length)];
  const sources = SOURCE_POOL[tradition];
  
  // 过滤最近使用过的
  const availableSources = sources.filter(source => 
    !history.usedSources.has(source.name.toLowerCase())
  );
  
  // 选择源
  const selectedSource = availableSources.length > 0
    ? availableSources[Math.floor(Math.random() * availableSources.length)]
    : sources[Math.floor(Math.random() * sources.length)];
  
  return { tradition, source: selectedSource };
}

// 获取智慧内容
function getWisdomContent(sourceName) {
  if (WISDOM_CONTENT[sourceName]) {
    return WISDOM_CONTENT[sourceName];
  }
  
  // 默认内容
  return {
    title: `${sourceName.toUpperCase()} // SYNTHWAVE INSIGHT`,
    quote: 'Wisdom begins in wonder',
    translation: '智慧始于惊奇',
    story: `${sourceName}的智慧穿越时空，在今天依然闪耀光芒。他们的思想和教导影响了无数人，成为人类文明的宝贵财富。`,
    reflection: '古老的智慧在今天依然适用，提醒我们关注本质，追求真理。',
    source: `${sourceName} // ANCIENT WISDOM`
  };
}

// 保存到历史记录
function saveToHistory(source, topic) {
  try {
    const historyLine = `${CONFIG.date} | ${source.name} | ${topic}`;
    
    let existingContent = '';
    if (fs.existsSync(CONFIG.historyFile)) {
      existingContent = fs.readFileSync(CONFIG.historyFile, 'utf8');
    }
    
    // 确保格式正确
    if (!existingContent.includes('# Daily Wisdom History')) {
      existingContent = '# Daily Wisdom History\n<!-- One entry per line: YYYY-MM-DD | Source | Topic -->\n<!-- The agent reads this before generating to avoid repeats -->\n<!-- After each delivery, append a new line -->\n\n' + existingContent;
    }
    
    // 添加到历史记录
    const newContent = existingContent.trim() + '\n' + historyLine + '\n';
    fs.writeFileSync(CONFIG.historyFile, newContent, 'utf8');
    
    console.log(`📝 已添加到历史记录: ${source.name}`);
    return true;
  } catch (err) {
    console.error('保存历史记录失败:', err.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('🔧 修复版每日智慧生成器');
  console.log('='.repeat(50));
  console.log(`📅 日期: ${CONFIG.today}`);
  
  // 读取历史记录
  const history = readHistory();
  console.log(`📚 历史记录: ${history.entries.length} 条`);
  
  // 选择传统和源
  const { tradition, source } = selectTraditionAndSource(history);
  console.log(`🎯 选择传统: ${tradition}`);
  console.log(`👤 选择人物源: ${source.name}`);
  console.log(`📖 描述: ${source.description}`);
  
  // 获取智慧内容
  const wisdom = getWisdomContent(source.name);
  
  // 创建输出数据
  const outputData = {
    metadata: {
      generated_at: new Date().toISOString(),
      date: CONFIG.date,
      today: CONFIG.today,
      version: 'fixed-1.0',
      skill_integration: true
    },
    selection: {
      tradition,
      source: source.name,
      description: source.description
    },
    wisdom,
    system: {
      source_pool_size: Object.keys(SOURCE_POOL).length,
      total_sources: Object.values(SOURCE_POOL).reduce((sum, arr) => sum + arr.length, 0),
      history_count: history.entries.length
    }
  };
  
  // 保存文件
  try {
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`✅ 智慧数据已保存: ${CONFIG.outputFile}`);
    
    // 添加到历史记录
    const topic = wisdom.title.split('//')[1]?.trim() || wisdom.title;
    saveToHistory(source, topic);
    
    console.log('\n✨ 生成完成！');
    console.log(`📜 标题: ${wisdom.title}`);
    console.log(`💬 语录: "${wisdom.quote}"`);
    console.log(`🌍 翻译: ${wisdom.translation}`);
    console.log(`📚 传统: ${tradition}`);
    
    return outputData;
  } catch (err) {
    console.error('❌ 保存数据失败:', err.message);
    return null;
  }
}

// 执行
if (require.main === module) {
  const result = main();
  
  if (result) {
    console.log('='.repeat(50));
    console.log('🎉 修复版每日智慧生成成功！');
    console.log(`🌐 网站将自动加载最新智慧内容`);
    console.log(`⏰ 下次自动运行: 今晚21:00`);
    console.log('='.repeat(50));
  } else {
    console.error('❌ 生成失败');
    process.exit(1);
  }
}

module.exports = { main };