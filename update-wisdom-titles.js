#!/usr/bin/env node
/**
 * 批量更新智慧内容标题
 * 将 // WISDOM 改为 // SYNTHWAVE INSIGHT
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'daily-wisdom-fixed.js');

// 读取文件
let content = fs.readFileSync(filePath, 'utf8');

// 定义要替换的标题模式
const titleReplacements = [
  { old: 'title: \'SENECA // ON THE SHORTNESS OF LIFE\',', new: 'title: \'SENECA // SYNTHWAVE INSIGHT\',' },
  { old: 'title: \'MARCUS AURELIUS // MEDITATIONS\',', new: 'title: \'MARCUS AURELIUS // SYNTHWAVE INSIGHT\',' },
  { old: 'title: \'LAOZI // DAO DE JING\',', new: 'title: \'LAOZI // SYNTHWAVE INSIGHT\',' },
  { old: 'title: \'SUN TZU // ART OF WAR\',', new: 'title: \'SUN TZU // SYNTHWAVE INSIGHT\',' },
  { old: 'title: \'İBN SINA // CANON OF MEDICINE\',', new: 'title: \'İBN SINA // SYNTHWAVE INSIGHT\',' }
];

// 执行替换
let updatedCount = 0;
titleReplacements.forEach(replacement => {
  if (content.includes(replacement.old)) {
    content = content.replace(replacement.old, replacement.new);
    updatedCount++;
    console.log(`✅ 替换: ${replacement.old.split('//')[0].trim()}...`);
  }
});

// 保存文件
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n🎉 完成！更新了 ${updatedCount} 个标题`);
console.log(`📁 文件: ${filePath}`);
console.log(`🎵 所有标题现在使用 "// SYNTHWAVE INSIGHT" 格式`);

// 验证更改
console.log('\n🔍 验证更改:');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('title:') && line.includes('SYNTHWAVE INSIGHT')) {
    console.log(`  行 ${index + 1}: ${line.trim()}`);
  }
});