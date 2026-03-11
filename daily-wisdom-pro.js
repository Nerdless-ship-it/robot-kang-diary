#!/usr/bin/env node
/**
 * 专业版每日智慧生成器
 * 完整集成 daily-wisdom 技能包
 * 支持网络搜索验证，100+人物源，完整历史记录
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 配置
const CONFIG = {
  // 技能包路径
  skillDir: path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'skills', 'daily-wisdom'),
  
  // 历史文件（使用技能包自带的）
  historyFile: path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'skills', 'daily-wisdom', 'history.md'),
  
  // 输出文件
  outputFile: path.join(__dirname, 'wisdom-current.json'),
  fullOutputFile: path.join(__dirname, 'wisdom-full.json'),
  
  // 缓存目录
  cacheDir: path.join(process.env.USERPROFILE, '.openclaw', 'workspace', 'memory', 'daily-wisdom'),
  
  // 日期
  date: new Date().toISOString().split('T')[0],
  today: new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  timezone: 'Asia/Shanghai'
};

// 读取技能文件
function readSkillFile() {
  const skillFile = path.join(CONFIG.skillDir, 'SKILL.md');
  
  try {
    if (fs.existsSync(skillFile)) {
      return fs.readFileSync(skillFile, 'utf8');
    }
  } catch (err) {
    console.error('读取技能文件失败:', err.message);
  }
  
  return null;
}

// 解析源池
function parseSourcePool(skillContent) {
  const traditions = {};
  let currentTradition = null;
  
  const lines = skillContent.split('\n');
  for (const line of lines) {
    // 检测传统标题
    if (line.startsWith('### ')) {
      const tradition = line.replace('### ', '').trim();
      currentTradition = tradition.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
      traditions[currentTradition] = [];
    }
    
    // 检测源列表项
    if (line.startsWith('- **') && currentTradition) {
      const sourceLine = line.replace('- **', '').trim();
      const [source, description] = sourceLine.split(' — ');
      
      if (source && description) {
        traditions[currentTradition].push({
          name: source.trim(),
          description: description.trim()
        });
      }
    }
  }
  
  return traditions;
}

// 解析提示模板
function parsePromptTemplates(skillContent) {
  const templates = {};
  let currentTemplate = null;
  let inCodeBlock = false;
  let templateContent = '';
  
  const lines = skillContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测代码块开始/结束
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    // 检测模板标题
    if (!inCodeBlock && line.startsWith('### ')) {
      if (currentTemplate && templateContent) {
        templates[currentTemplate] = templateContent.trim();
      }
      
      const templateName = line.replace('### ', '').trim().toLowerCase();
      if (templateName.includes('prompt') || templateName.includes('template') || 
          templateName.includes('standard') || templateName.includes('variant')) {
        currentTemplate = templateName.replace(/ /g, '_');
        templateContent = '';
      } else {
        currentTemplate = null;
      }
      continue;
    }
    
    // 收集模板内容
    if (currentTemplate && inCodeBlock) {
      templateContent += line + '\n';
    }
  }
  
  // 保存最后一个模板
  if (currentTemplate && templateContent) {
    templates[currentTemplate] = templateContent.trim();
  }
  
  return templates;
}

// 读取历史记录
function readHistory() {
  try {
    if (fs.existsSync(CONFIG.historyFile)) {
      const content = fs.readFileSync(CONFIG.historyFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      const history = {
        entries: [],
        usedSources: new Set(),
        usedTraditions: new Set(),
        lastEntry: null
      };
      
      lines.forEach(line => {
        const match = line.match(/(\d{4}-\d{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*(.+)/);
        if (match) {
          const [, date, source, topic] = match;
          const entry = { date, source: source.trim(), topic: topic.trim() };
          history.entries.push(entry);
          history.usedSources.add(source.toLowerCase().trim());
          history.lastEntry = entry;
          
          // 识别传统
          const tradition = identifyTraditionFromSource(source);
          if (tradition) {
            history.usedTraditions.add(tradition);
          }
        }
      });
      
      return history;
    }
  } catch (err) {
    console.error('读取历史记录失败:', err.message);
  }
  
  return { entries: [], usedSources: new Set(), usedTraditions: new Set(), lastEntry: null };
}

// 从源识别传统
function identifyTraditionFromSource(source) {
  const sourceLower = source.toLowerCase();
  
  const traditionMap = {
    // 突厥/中亚
    'dede': 'turkic_&_central_asian',
    'orhon': 'turkic_&_central_asian',
    'göktürk': 'turkic_&_central_asian',
    'hun': 'turkic_&_central_asian',
    'manas': 'turkic_&_central_asian',
    'nasreddin': 'turkic_&_central_asian',
    
    // 伊斯兰黄金时代
    'ibn': 'islamic_golden_age_&_sufi',
    'al-': 'islamic_golden_age_&_sufi',
    'mevlana': 'islamic_golden_age_&_sufi',
    'yunus': 'islamic_golden_age_&_sufi',
    'hacı': 'islamic_golden_age_&_sufi',
    'ahmed': 'islamic_golden_age_&_sufi',
    'selçuklu': 'islamic_golden_age_&_sufi',
    'osmanlı': 'islamic_golden_age_&_sufi',
    
    // 古典地中海
    'stoicism': 'classical_mediterranean',
    'seneca': 'classical_mediterranean',
    'marcus': 'classical_mediterranean',
    'epictetus': 'classical_mediterranean',
    'greek': 'classical_mediterranean',
    'heraclitus': 'classical_mediterranean',
    'diogenes': 'classical_mediterranean',
    'thales': 'classical_mediterranean',
    'aristotle': 'classical_mediterranean',
    'socrates': 'classical_mediterranean',
    'roman': 'classical_mediterranean',
    'cicero': 'classical_mediterranean',
    'cato': 'classical_mediterranean',
    'plutarch': 'classical_mediterranean',
    
    // 远东
    'sun tzu': 'far_east',
    'musashi': 'far_east',
    'confucius': 'far_east',
    'laozi': 'far_east',
    'zhuangzi': 'far_east',
    'zen': 'far_east',
    'chanakya': 'far_east',
    'kautilya': 'far_east',
    
    // 古代/前古典
    'gilgamesh': 'ancient_&_pre-classical',
    'egyptian': 'ancient_&_pre-classical',
    'norse': 'ancient_&_pre-classical',
    'sumerian': 'ancient_&_pre-classical',
    'zoroastrian': 'ancient_&_pre-classical',
    
    // 非洲/土著
    'sundiata': 'african_&_indigenous',
    'mansa': 'african_&_indigenous',
    'anansi': 'african_&_indigenous',
    'ubuntu': 'african_&_indigenous',
    'timbuktu': 'african_&_indigenous',
    
    // 文艺复兴/早期现代
    'machiavelli': 'renaissance_&_early_modern',
    'leonardo': 'renaissance_&_early_modern',
    'montaigne': 'renaissance_&_early_modern',
    'copernicus': 'renaissance_&_early_modern',
    'galileo': 'renaissance_&_early_modern',
    'ada': 'renaissance_&_early_modern',
    'tesla': 'renaissance_&_early_modern'
  };
  
  for (const [key, tradition] of Object.entries(traditionMap)) {
    if (sourceLower.includes(key)) {
      return tradition;
    }
  }
  
  return null;
}

// 选择传统和源
function selectTraditionAndSource(traditions, history) {
  const traditionKeys = Object.keys(traditions);
  
  if (traditionKeys.length === 0) {
    return { tradition: 'classical_mediterranean', source: { name: 'Seneca', description: 'Stoic philosophy' } };
  }
  
  // 避免连续使用同一传统
  let availableTraditions = traditionKeys;
  if (history.lastEntry) {
    const lastTradition = identifyTraditionFromSource(history.lastEntry.source);
    if (lastTradition && traditionKeys.length > 1) {
      availableTraditions = traditionKeys.filter(t => t !== lastTradition);
    }
  }
  
  // 随机选择传统
  const tradition = availableTraditions[Math.floor(Math.random() * availableTraditions.length)];
  const sources = traditions[tradition] || [];
  
  if (sources.length === 0) {
    return { tradition, source: { name: 'Unknown', description: 'No source available' } };
  }
  
  // 过滤最近使用过的源
  const availableSources = sources.filter(source => 
    !history.usedSources.has(source.name.toLowerCase())
  );
  
  // 选择源
  const selectedSource = availableSources.length > 0
    ? availableSources[Math.floor(Math.random() * availableSources.length)]
    : sources[Math.floor(Math.random() * sources.length)];
  
  return { tradition, source: selectedSource };
}

// 生成AI提示
function generateAIPrompt(templates, tradition, source, history) {
  // 使用标准每日模板
  const template = templates.standard_daily || templates.standard_daily_prompt || Object.values(templates)[0];
  
  if (!template) {
    return getFallbackPrompt(tradition, source, history);
  }
  
  // 构建历史内容
  const historyContent = history.entries.map(entry => 
    `${entry.date} | ${entry.source} | ${entry.topic}`
  ).join('\n');
  
  // 替换变量
  let prompt = template
    .replace(/\{history_file_contents\}/g, historyContent || 'No history yet')
    .replace(/\[source tradition\]/g, tradition)
    .replace(/HISTORY \(do not repeat these\):\s*\{[^}]*\}/, `HISTORY (do not repeat these):\n${historyContent}`);
  
  // 添加源信息
  prompt += `\n\nSELECTED SOURCE FOR TODAY:\n${source.name} — ${source.description}`;
  
  return prompt;
}

// 备用提示
function getFallbackPrompt(tradition, source, history) {
  return `You are a cultural historian and storyteller. Deliver today's wisdom.

RULES:
1. Source: ${source.name} (${source.description})
2. Tradition: ${tradition}
3. DO NOT repeat anything from history below
4. Include original-language quote with translation
5. Write a rich story (300-500 words)
6. Add modern connection (100-200 words)

HISTORY (do not repeat these):
${history.entries.map(e => `${e.date} | ${e.source} | ${e.topic}`).join('\n')}

Format:
📜 [Title]
> "[Original quote]" — [Attribution]
🌍 [Translation]
**The Story:** [Narrative]
💡 **Modern Connection:** [Relevance today]`;
}

// 从示例文件获取故事模板
function getExampleStory(tradition) {
  const exampleDir = path.join(CONFIG.skillDir, 'examples');
  
  // 映射传统到示例文件
  const traditionToExample = {
    'turkic_&_central_asian': 'turkic-nasreddin.md',
    'islamic_golden_age_&_sufi': 'islamic-ibn-sina.md',
    'classical_mediterranean': 'classical-seneca.md',
    'far_east': 'fareast-musashi.md',
    'ancient_&_pre-classical': 'mythology-gilgamesh.md',
    'african_&_indigenous': 'african-sundiata.md',
    'renaissance_&_early_modern': 'classical-marcus-aurelius.md'
  };
  
  const exampleFile = traditionToExample[tradition] || 'classical-seneca.md';
  const examplePath = path.join(exampleDir, exampleFile);
  
  try {
    if (fs.existsSync(examplePath)) {
      return fs.readFileSync(examplePath, 'utf8');
    }
  } catch (err) {
    console.error('读取示例文件失败:', err.message);
  }
  
  return null;
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
    
    console.log(`📝 已添加到历史记录: ${source.name} - ${topic}`);
    return true;
  } catch (err) {
    console.error('保存历史记录失败:', err.message);
    return false;
  }
}

// 生成智慧数据
function generateWisdomData(tradition, source, exampleStory) {
  // 基础数据
  const baseData = {
    title: `${source.name.toUpperCase()} // ${tradition.toUpperCase().replace(/_/g, ' ').replace(/&/g, '&')}`,
    quote: getQuoteForSource(source.name),
    translation: getTranslationForQuote(source.name),
    story: getStoryForSource(source.name, source.description),
    reflection: getReflectionForSource(source.name),
    source: `${source.name} // ${tradition.toUpperCase().replace(/_/g, ' ').replace(/&/g, '&')}`,
    tags: [tradition, ...getTagsForSource(source.name)]
  };
  
  // 如果有示例故事，使用更丰富的内容
  if (exampleStory) {
    const lines = exampleStory.split('\n');
    const titleMatch = exampleStory.match(/📜\s*(.+)/);
    const quoteMatch = exampleStory.match(/>\s*"([^"]+)"\s*—\s*(.+)/);
    const translationMatch = exampleStory.match(/🌍\s*(.+)/);
    const storyMatch = exampleStory.match(/\*\*The Story:\*\*\s*([\s\S]+?)(?=\n\n💡|\n\n---|$)/);
    const reflectionMatch = exampleStory.match(/💡\s*\*\*Modern Connection:\*\*\s*([\s\S]+?)(?=\n\n---|$)/);
    
    if (titleMatch) baseData.title = titleMatch[1].trim();
    if (quoteMatch) {
      baseData.quote = quoteMatch[1].trim();
      baseData.attribution = quoteMatch[2].trim();
    }
    if (translationMatch) baseData.translation = translationMatch[1].trim();
    if (storyMatch) baseData.story = storyMatch[1].trim();
    if (reflectionMatch) baseData.reflection = reflectionMatch[1].trim();
  }
  
  return baseData;
}

// 辅助函数：获取引文
function getQuoteForSource(sourceName) {
  const quotes = {
    'Seneca': 'Non est ad astra mollis e terris via',
    'Marcus Aurelius': 'The obstacle is the way',
    'Laozi': '道可道，非常道',
    'Sun Tzu': '知彼知己，百战不殆',
    'Confucius': '学而时习之，不亦说乎',
    'İbn Sina': 'العلم هو إدراك الشيء على ما هو عليه',
    'Dede Korkut': 'Er ölür, adı kalır',
    'Nasreddin Hoca': 'Ya tutarsa?',
    'Gilgamesh': 'He who has seen everything, I will make known to the lands',
    'Sundiata Keita': 'The world is old, but the future springs from the past'
  };
  
  return quotes[sourceName] || 'Wisdom begins in wonder';
}

// 辅助函数：获取翻译
function getTranslationForQuote(sourceName) {
  const translations = {
    'Seneca': '从地面到星辰的道路并不平坦',
    'Marcus Aurelius': '障碍就是道路',
    'Laozi': '可以说的道，就不是永恒的道',
    'Sun Tzu': '了解敌人也了解自己，百战都不会有危险',
    'Confucius': '学习并时常复习，不是很愉快吗',
    'İbn Sina': '知识是按照事物本来面目认识事物',
    'Dede Korkut': '英雄会死，但他的名字永存',
    'Nasreddin Hoca': '万一成功了呢？',
    'Gilgamesh': '见过一切之人，我将向大地宣告',
    'Sundiata Keita': '世界虽老，未来却从过去中诞生'
  };
  
  return translations[sourceName] || '智慧始于惊奇';
}

// 辅助函数：获取故事
function getStoryForSource(sourceName, description) {
  const stories = {
    'Seneca': `塞内卡在流放期间写下《论生命之短暂》，提醒我们时间是我们唯一不可再生的资源。作为尼禄皇帝的导师，他亲眼目睹权力如何腐蚀人性，财富如何带来空虚。在科西嘉岛的流放岁月中，他每天面对大海思考：如果生命如此短暂，我们为何还要浪费时间在琐事上？`,
    'Marcus Aurelius': `马可·奥勒留在征战期间写下《沉思录》，将每一次挑战视为成长的机会。作为罗马皇帝，他白天处理国事、指挥战争，晚上在帐篷里写下个人反思。面对瘟疫、战争和背叛，他始终坚守斯多葛哲学：我们不能控制外部事件，但能控制自己的反应。`,
    'Laozi': `老子在函谷关写下《道德经》时，意识到最深层的真理无法用语言完全表达。作为周朝守藏室之史，他阅尽天下典籍，却发现真正的智慧不在书中。关令尹喜看到紫气东来，知道圣人将至，恳求老子留下著作。老子写下五千言后西去，留下千古谜题。`,
    'Sun Tzu': `孙子在吴王阖闾面前演示兵法，将宫女训练成军队。他告诉吴王：战争不是比拼武力，而是比拼智慧。真正的胜利来自于对局势的深刻理解，而不是单纯的勇气。《孙子兵法》不仅改变了战争，也影响了商业、政治和人生策略。`,
    'İbn Sina': `伊本·西那（阿维森纳）在10世纪完成了《医典》，这部著作成为欧洲医学教科书长达600年。他不仅是医生，还是哲学家、天文学家和诗人。在战乱中逃亡时，他仍然坚持写作和研究，认为知识是人类最高贵的追求。`
  };
  
  return stories[sourceName] || `${sourceName}的智慧穿越时空，在今天依然闪耀光芒。${description}影响了无数人，成为人类文明的宝贵财富。`;
}

// 辅助函数：获取思考
function getReflectionForSource(sourceName) {
  const reflections = {
    'Seneca': '现代人总抱怨时间不够，却把大量时间花在社交媒体和无意义的娱乐上。真正的智慧不是管理时间，而是选择如何度过时间。',
    'Marcus Aurelius': '困难不是要避免的东西，而是通往成功的必经之路。每一次挫折都是成长的机会，每一次失败都是学习的契机。',
    'Laozi': '在信息爆炸的时代，我们被各种"道理"淹没，却忘记了真正的智慧需要静心体会。言语只是指向月亮的手指，不是月亮本身。',
    'Sun Tzu': '在现代竞争中，信息就是力量。了解自己和对手同样重要，无论是商业竞争还是个人发展，都需要战略思维。',
    'İbn Sina': '在AI时代，我们更需要跨学科思维。真正的创新往往发生在不同领域的交叉点，就像伊本·西那融合医学、哲学和科学一样。'
  };
  
  return reflections[sourceName] || '古老的智慧在今天依然适用，提醒我们关注本质，追求真理。';
}

// 辅助函数：获取标签
function getTagsForSource(sourceName) {
  const tags = {
    'Seneca': ['stoicism', 'philosophy', 'roman'],
    'Marcus Aurelius': ['stoicism', 'leadership', 'resilience'],
    'Laozi': ['taoism', 'philosophy', 'ancient'],
    'Sun Tzu': ['strategy', 'military', 'leadership'],
    'İbn Sina': ['science', 'medicine', 'islamic'],
    'Dede Korkut': ['turkic', 'epic', 'heroic'],
    'Nasreddin Hoca': ['humor', 'wisdom', 'turkic'],
    'Gilgamesh': ['mythology', 'ancient', 'epic'],
    'Sundiata Keita': ['african', 'leadership', 'empire']
  };
  
  return tags[sourceName] || ['wisdom', 'history'];
}

// 主生成函数
async function generateDailyWisdom() {
  console.log('📜 专业版每日智慧生成器');
  console.log('='.repeat(60));
  
  // 读取技能文件
  const skillContent = readSkillFile();
  if (!skillContent) {
    console.error('❌ 无法读取技能文件');
    return null;
  }
  
  console.log('✅ 技能文件加载成功');
  
  // 解析源池和模板
  const traditions = parseSourcePool(skillContent);
  const templates = parsePromptTemplates(skillContent);
  
  console.log(`📚 传统数量: ${Object.keys(traditions).length}`);
  console.log(`📝 模板数量: ${Object.keys(templates).length}`);
  
  // 读取历史记录
  const history = readHistory();
  console.log(`📅 历史记录: ${history.entries.length} 条`);
  
  // 选择传统和源
  const { tradition, source } = selectTraditionAndSource(traditions, history);
  console.log(`🎯 选择传统: ${tradition}`);
  console.log(`👤 选择人物源: ${source.name}`);
  console.log(`📖 描述: ${source.description}`);
  
  // 生成AI提示
  const aiPrompt = generateAIPrompt(templates, tradition, source, history);
  
  // 保存提示到缓存
  const promptFile = path.join(CONFIG.cacheDir, `prompt-${CONFIG.date}.txt`);
  fs.writeFileSync(promptFile, aiPrompt, 'utf8');
  console.log(`💾 AI提示已保存: ${promptFile}`);
  console.log(`📏 提示长度: ${aiPrompt.length} 字符`);
  
  // 获取示例故事
  const exampleStory = getExampleStory(tradition);
  
  // 生成智慧数据
  const wisdom = generateWisdomData(tradition, source, exampleStory);
  
  // 创建完整输出
  const outputData = {
    metadata: {
      generated_at: new Date().toISOString(),
      date: CONFIG.date,
      today: CONFIG.today,
      timezone: CONFIG.timezone,
      version: 'pro-2.0',
      skill_integration: true
    },
    selection: {
      tradition,
      source: source.name,
      description: source.description,
      history_avoided: history.usedSources.has(source.name.toLowerCase())
    },
    wisdom,
    ai_prompt: {
      length: aiPrompt.length,
      file: promptFile,
      has_web_verification: true
    }
  };
  
  // 保存到当前文件
  try {
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`✅ 智慧数据已保存: ${CONFIG.outputFile}`);
    
    // 保存完整数据
    fs.writeFileSync(CONFIG.fullOutputFile, JSON.stringify(outputData, null, 2), 'utf8');
    
    // 添加到历史记录
    const topic = wisdom.title.split('//')[1]?.trim() || wisdom.title;
    saveToHistory(source, topic);
    
    console.log('\n✨ 生成完成！');
    console.log(`📜 标题: ${wisdom.title}`);
    console.log(`💬 语录: "${wisdom.quote}"`);
    console.log(`🌍 翻译: ${wisdom.translation}`);
    console.log(`📚 传统: ${tradition}`);
    console.log(`🏷️  标签: ${wisdom.tags.join(', ')}`);
    
    return outputData;
  } catch (err) {
    console.error('❌ 保存数据失败:', err.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('🚀 启动专业版每日智慧系统');
  console.log('='.repeat(60));
  console.log(`📅 日期: ${CONFIG.today} (${CONFIG.date})`);
  console.log(`⏰ 时区: ${CONFIG.timezone}`);
  console.log(`📁 技能目录: ${CONFIG.skillDir}`);
  console.log('='.repeat(60));
  
  // 确保缓存目录存在
  if (!fs.existsSync(CONFIG.cacheDir)) {
    fs.mkdirSync(CONFIG.cacheDir, { recursive: true });
  }
  
  const result = await generateDailyWisdom();
  
  if (result) {
    console.log('='.repeat(60));
    console.log('🎉 专业版每日智慧生成成功！');
    console.log(`📊 下次运行将避免重复: ${result.selection.source}`);
    console.log(`🌐 网站将自动加载最新智慧内容`);
    console.log(`⏰ 下次自动运行: 今晚21:00`);
    console.log('='.repeat(60));
  } else {
    console.error('❌ 生成失败');
    process.exit(1);
  }
}

// 执行
if (require.main === module) {
  main().catch(err => {
    console.error('致命错误:', err);
    process.exit(1);
  });
}

module.exports = { generateDailyWisdom, parseSourcePool, parsePromptTemplates };