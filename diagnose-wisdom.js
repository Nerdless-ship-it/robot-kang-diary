#!/usr/bin/env node
/**
 * 诊断每日智慧系统问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 诊断每日智慧系统问题');
console.log('='.repeat(60));

// 检查文件
const filesToCheck = [
  'index.html',
  'wisdom-loader.js',
  'wisdom-current.json',
  'daily-wisdom-fixed.js'
];

let allPassed = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  console.log(`\n📄 检查: ${file}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ 文件不存在: ${file}`);
    allPassed = false;
    return;
  }
  
  const stats = fs.statSync(filePath);
  console.log(`  ✅ 文件存在 (${stats.size} 字节)`);
  
  // 检查特定文件内容
  if (file === 'wisdom-current.json') {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`  ✅ JSON格式正确`);
      console.log(`  📊 数据结构:`);
      console.log(`     - 元数据: ${data.metadata ? '✅' : '❌'}`);
      console.log(`     - 选择信息: ${data.selection ? '✅' : '❌'}`);
      console.log(`     - 智慧内容: ${data.wisdom ? '✅' : '❌'}`);
      
      if (data.wisdom) {
        const requiredFields = ['title', 'quote', 'translation', 'story', 'reflection', 'source'];
        const missing = requiredFields.filter(f => !data.wisdom[f]);
        
        if (missing.length === 0) {
          console.log(`  ✅ 所有必要字段完整`);
          console.log(`  🎯 当前智慧: ${data.wisdom.title}`);
          console.log(`  🌍 传统: ${data.selection?.tradition || '未知'}`);
          console.log(`  👤 人物源: ${data.selection?.source || '未知'}`);
        } else {
          console.log(`  ❌ 缺少字段: ${missing.join(', ')}`);
          allPassed = false;
        }
      }
    } catch (err) {
      console.log(`  ❌ JSON解析错误: ${err.message}`);
      allPassed = false;
    }
  }
  
  if (file === 'index.html') {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否包含wisdom-section
    if (content.includes('wisdom-section')) {
      console.log(`  ✅ 包含wisdom-section`);
    } else {
      console.log(`  ❌ 不包含wisdom-section`);
      allPassed = false;
    }
    
    // 检查是否加载wisdom-loader.js
    if (content.includes('wisdom-loader.js')) {
      console.log(`  ✅ 加载wisdom-loader.js`);
    } else {
      console.log(`  ❌ 未加载wisdom-loader.js`);
      allPassed = false;
    }
  }
  
  if (file === 'wisdom-loader.js') {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查关键函数
    const functions = ['loadWisdomData', 'displayWisdom', 'displayFallbackWisdom'];
    functions.forEach(func => {
      if (content.includes(func)) {
        console.log(`  ✅ 包含函数: ${func}`);
      } else {
        console.log(`  ❌ 缺少函数: ${func}`);
        allPassed = false;
      }
    });
    
    // 检查是否尝试加载wisdom-current.json
    if (content.includes("fetch('wisdom-current.json')")) {
      console.log(`  ✅ 尝试加载wisdom-current.json`);
    } else {
      console.log(`  ❌ 未尝试加载wisdom-current.json`);
      allPassed = false;
    }
  }
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('🎉 所有检查通过！系统应该正常工作。');
  console.log('\n📋 建议的下一步：');
  console.log('1. 打开浏览器开发者工具 (F12)');
  console.log('2. 访问网站主页');
  console.log('3. 检查控制台是否有错误');
  console.log('4. 检查网络面板是否成功加载wisdom-current.json');
} else {
  console.log('⚠️  发现一些问题，需要修复。');
  console.log('\n🔧 修复建议：');
  console.log('1. 确保所有文件都存在且可访问');
  console.log('2. 检查wisdom-current.json的JSON格式');
  console.log('3. 确保文件编码为UTF-8（无BOM）');
  console.log('4. 检查wisdom-loader.js是否正确加载');
}

console.log('\n' + '='.repeat(60));
console.log('🌐 测试网站: https://Nerdless-ship-it.github.io/robot-kang-diary/');
console.log('📝 测试页面: test-wisdom.html');
console.log('🔄 手动生成: node daily-wisdom-fixed.js');
console.log('⏰ 自动运行: 每天21:00 (cron任务)');

// 测试生成新智慧
console.log('\n' + '='.repeat(60));
console.log('🧪 测试生成新智慧...');

try {
  const { main } = require('./daily-wisdom-fixed.js');
  console.log('✅ daily-wisdom-fixed.js 可正常导入');
  
  // 检查是否可以生成新内容
  const wisdomData = require('./wisdom-current.json');
  console.log(`✅ 当前智慧: ${wisdomData.wisdom.title}`);
  console.log(`✅ 传统: ${wisdomData.selection.tradition}`);
  console.log(`✅ 人物源: ${wisdomData.selection.source}`);
  
} catch (err) {
  console.log(`❌ 测试失败: ${err.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('诊断完成！');