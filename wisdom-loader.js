/**
 * 每日智慧加载器
 * 用于网站前端动态加载智慧内容
 */

document.addEventListener('DOMContentLoaded', function() {
  const wisdomContainer = document.getElementById('wisdomContainer');
  if (!wisdomContainer) return;
  
  // 移除加载提示
  const loadingEl = wisdomContainer.querySelector('.wisdom-loading');
  if (loadingEl) {
    loadingEl.remove();
  }
  
  // 尝试加载智慧数据
  loadWisdomData();
  
  // 点击展开/收起功能
  wisdomContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('wisdom-toggle')) {
      const storyEl = wisdomContainer.querySelector('.wisdom-story');
      const reflectionEl = wisdomContainer.querySelector('.wisdom-reflection');
      
      if (storyEl.style.display === 'none') {
        storyEl.style.display = 'block';
        reflectionEl.style.display = 'block';
        e.target.textContent = '[收起]';
      } else {
        storyEl.style.display = 'none';
        reflectionEl.style.display = 'none';
        e.target.textContent = '[展开]';
      }
    }
  });
});

// 加载智慧数据
function loadWisdomData() {
  const container = document.getElementById('wisdomContainer');
  
  // 尝试从本地存储加载
  const cachedWisdom = localStorage.getItem('dailyWisdom');
  const cacheDate = localStorage.getItem('dailyWisdomDate');
  const today = new Date().toISOString().split('T')[0];
  
  if (cachedWisdom && cacheDate === today) {
    // 使用缓存数据
    displayWisdom(JSON.parse(cachedWisdom));
    return;
  }
  
  // 从文件加载
  fetch('wisdom-current.json')
    .then(response => {
      if (!response.ok) throw new Error('网络响应不正常');
      return response.json();
    })
    .then(data => {
      // 缓存到本地存储
      localStorage.setItem('dailyWisdom', JSON.stringify(data.wisdom));
      localStorage.setItem('dailyWisdomDate', data.date);
      
      // 显示智慧内容
      displayWisdom(data.wisdom);
    })
    .catch(error => {
      console.error('加载智慧数据失败:', error);
      displayFallbackWisdom();
    });
}

// 显示智慧内容
function displayWisdom(wisdom) {
  const container = document.getElementById('wisdomContainer');
  
  // 处理不同的数据结构
  let wisdomData, date, tradition;
  
  if (wisdom.wisdom) {
    // 新格式：包含metadata和wisdom
    wisdomData = wisdom.wisdom;
    date = wisdom.today || wisdom.metadata?.today || new Date().toLocaleDateString('zh-CN');
    tradition = wisdom.selection?.tradition ? ` • ${wisdom.selection.tradition.toUpperCase().replace(/_/g, ' ')}` : '';
  } else {
    // 旧格式：直接就是智慧数据
    wisdomData = wisdom;
    date = new Date().toLocaleDateString('zh-CN');
    tradition = '';
  }
  
  const html = `
    <div class="wisdom-header">
      <span class="wisdom-icon">📜</span>
      <span class="wisdom-label">DAILY_WISDOM</span>
      <span class="wisdom-date" style="margin-left: auto; font-size: 0.7rem; color: var(--fg-muted);">${date}${tradition}</span>
    </div>
    
    <h3 class="wisdom-title">${wisdomData.title}</h3>
    
    <div class="wisdom-quote">
      "${wisdomData.quote}" — ${wisdomData.translation}
    </div>
    
    <div class="wisdom-story" style="display: none;">
      <p>${wisdomData.story}</p>
    </div>
    
    <div class="wisdom-reflection" style="display: none;">
      <div class="wisdom-reflection-label">>> ANALYSIS:</div>
      <div class="wisdom-reflection-text">${wisdomData.reflection}</div>
    </div>
    
    <div class="wisdom-footer">
      — ${wisdomData.source}
      <button class="wisdom-toggle" style="margin-left: 10px; background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.8rem;">[展开]</button>
    </div>
  `;
  
  // 创建新的内容容器
  const contentDiv = document.createElement('div');
  contentDiv.className = 'wisdom-content';
  contentDiv.innerHTML = html;
  
  // 清空容器并添加新内容
  container.innerHTML = '';
  container.appendChild(contentDiv);
}

// 显示备用智慧内容（当加载失败时）
function displayFallbackWisdom() {
  const container = document.getElementById('wisdomContainer');
  
  const fallbackWisdom = {
    title: "LAOZI // DAO DE JING",
    quote: "道可道，非常道",
    translation: "可以说的道，就不是永恒的道",
    story: "老子在函谷关写下《道德经》时，意识到最深层的真理无法用语言完全表达。语言只是指向月亮的手指，而不是月亮本身。作为周朝守藏室之史，他阅尽天下典籍，却发现真正的智慧不在书中。",
    reflection: "在信息爆炸的时代，我们被各种'道理'淹没，却忘记了真正的智慧需要静心体会。言语只是指向月亮的手指，不是月亮本身。",
    source: "DAO DE JING // ANCIENT CHINA",
    tradition: "far_east"
  };
  
  displayWisdom(fallbackWisdom);
  
  // 添加错误提示
  const errorMsg = document.createElement('div');
  errorMsg.style.cssText = 'font-size: 0.7rem; color: var(--accent-orange); margin-top: 10px; text-align: center;';
  errorMsg.textContent = '⚠️ 使用备用数据，高级生成器可能未运行';
  container.querySelector('.wisdom-content').appendChild(errorMsg);
}

// 手动刷新智慧内容（用于测试）
window.refreshWisdom = function() {
  localStorage.removeItem('dailyWisdom');
  localStorage.removeItem('dailyWisdomDate');
  loadWisdomData();
  return '智慧内容已刷新，请重新加载页面查看';
};