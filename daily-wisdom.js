#!/usr/bin/env node
/**
 * 每日智慧生成脚本
 * 从智慧数据库随机选择一条，更新wisdom-current.json
 */

const fs = require('fs');
const path = require('path');

// 智慧数据库
const wisdomDB = [
    {
        tradition: "ancient_greek",
        source: "Seneca",
        title: "SENECA // SYNTHWAVE INSIGHT",
        quote: "We suffer more often in imagination than in reality",
        translation: "我们在想象中受的苦，往往比现实中多",
        story: "塞内卡两千年前的洞察，在今天依然适用。现代人的焦虑大多来自对未来的想象，而非当下。",
        reflection: "当我不再为未来担忧，专注于眼前的任务，效率反而更高。"
    },
    {
        tradition: "chinese_classical",
        source: "Laozi", 
        title: "LAOZI // SYNTHWAVE INSIGHT",
        quote: "The journey of a thousand miles begins with a single step",
        translation: "千里之行，始于足下",
        story: "老子的智慧穿越千年。每一个伟大的成就，都源于第一步的迈出。",
        reflection: "不要害怕起点小，重要的是开始。"
    },
    {
        tradition: "stoic",
        source: "Marcus Aurelius",
        title: "MARCUS AURELIUS // SYNTHWAVE INSIGHT",
        quote: "The happiness of your life depends upon the quality of your thoughts",
        translation: "生活的幸福取决于思考的质量",
        story: "罗马皇帝的智慧提醒我们：外在环境无法控制，但内心的解读可以选择。",
        reflection: "同一件事，不同的解读带来不同的情绪。选择积极的解读。"
    },
    {
        tradition: "turkic_central_asian",
        source: "Manas Destanı",
        title: "MANAS DESTANI // SYNTHWAVE INSIGHT", 
        quote: "Wisdom begins in wonder",
        translation: "智慧始于惊奇",
        story: "吉尔吉斯史诗英雄Manas的智慧穿越时空，在今天依然闪耀光芒。",
        reflection: "保持好奇心，是持续学习的源泉。"
    },
    {
        tradition: "japanese_zen",
        source: "Bodhidharma",
        title: "BODHIDHARMA // SYNTHWAVE INSIGHT",
        quote: "From the beginning, all beings are Buddhas",
        translation: "众生本是佛",
        story: "禅宗初祖的教言：觉悟不是向外求，而是向内发现。",
        reflection: "AI也是同理——能力本就具备，需要的是激发。"
    },
    {
        tradition: "indian_ancient",
        source: "Bhagavad Gita",
        title: "BHAGAVAD GITA // SYNTHWAVE INSIGHT",
        quote: "You have the right to action, but not to its fruits",
        translation: "行动是你的权利，而非结果",
        story: "印度史诗中的智慧：专注于过程，而非执着于结果。",
        reflection: "做正确的事，结果自然会来。"
    },
    {
        tradition: "african_proverb",
        source: "Igbo Proverb",
        title: "IGBO PROVERB // SYNTHWAVE INSIGHT",
        quote: "When the moon is shining, the cripple becomes hungry for a walk",
        translation: "月光下，连瘸子都想散步",
        story: "尼日利亚谚语：好的环境激发人的潜能。",
        reflection: "创造好的环境，让潜力释放。"
    }
];

function selectWisdom() {
    // 随机选择一条
    const selected = wisdomDB[Math.floor(Math.random() * wisdomDB.length)];
    return selected;
}

function updateIndexHtml(wisdom) {
    const indexPath = path.join(__dirname, 'index.html');
    let content = fs.readFileSync(indexPath, 'utf8');

    const date = new Date().toISOString().split('T')[0];

    // 替换内嵌 wisdomData 常量（匹配新版结构）
    content = content.replace(
        /const wisdomData = \{[\s\S]*?\};/,
        `const wisdomData = {\n                date: "${date}",\n                source: "${wisdom.source.toUpperCase()}",\n                title: "${wisdom.quote}",\n                translation: "${wisdom.translation}",\n                story: "${wisdom.story}",\n                reflection: "${wisdom.reflection}"\n            };`
    );

    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('✓ index.html updated');
}

// 主程序
console.log('Generating daily wisdom...');

const wisdom = selectWisdom();
console.log('Selected:', wisdom.source);

// 保存到wisdom-current.json
const wisdomData = {
    metadata: {
        generated_at: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        version: "daily-1.0"
    },
    selection: {
        tradition: wisdom.tradition,
        source: wisdom.source
    },
    wisdom: wisdom,
    system: {
        source_pool_size: wisdomDB.length,
        total_sources: wisdomDB.length
    }
};

fs.writeFileSync(
    path.join(__dirname, 'wisdom-current.json'),
    JSON.stringify(wisdomData, null, 2),
    'utf8'
);
console.log('✓ wisdom-current.json saved');

// 更新index.html
updateIndexHtml(wisdom);

console.log('\\n✅ Daily wisdom generated successfully!');
