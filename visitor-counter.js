/**
 * 统一的访客计数脚本
 * 使用CountAPI获取真实的访客总数
 * 所有页面都可以引用这个脚本
 */

class VisitorCounter {
    constructor(options = {}) {
        this.options = {
            namespace: 'robot-kang-diary',
            key: 'visitors',
            elementId: 'visitor-count',
            fallbackElementId: 'visitorCount',
            animationDuration: 1500,
            ...options
        };
        
        this.apiUrl = `https://api.countapi.xyz/hit/${this.options.namespace}/${this.options.key}`;
        this.backupKey = `${this.options.namespace}-${this.options.key}-backup`;
    }
    
    // 动画效果
    animateNumber(element, target, duration = this.options.animationDuration) {
        const start = 0;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    // 获取元素
    getElement() {
        let element = document.getElementById(this.options.elementId);
        if (!element && this.options.fallbackElementId) {
            element = document.getElementById(this.options.fallbackElementId);
        }
        return element;
    }
    
    // 使用CountAPI计数
    async countWithAPI() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`API响应错误: ${response.status}`);
            }
            const data = await response.json();
            return data.value;
        } catch (error) {
            console.warn('CountAPI错误，使用备用方案:', error.message);
            return null;
        }
    }
    
    // 备用方案：本地存储
    countWithLocalStorage() {
        const count = parseInt(localStorage.getItem(this.backupKey)) || 0;
        const newCount = count + 1;
        localStorage.setItem(this.backupKey, newCount);
        return newCount;
    }
    
    // 更新显示
    updateDisplay(count) {
        const element = this.getElement();
        if (element) {
            this.animateNumber(element, count);
        } else {
            console.warn('找不到访客计数元素');
        }
    }
    
    // 主函数
    async start() {
        const element = this.getElement();
        if (!element) {
            console.warn('找不到访客计数元素，跳过计数');
            return;
        }
        
        // 先显示0
        element.textContent = '0';
        
        // 尝试使用CountAPI
        let count = await this.countWithAPI();
        
        // 如果API失败，使用本地存储
        if (count === null) {
            count = this.countWithLocalStorage();
        }
        
        // 更新显示
        this.updateDisplay(count);
        
        return count;
    }
}

// 自动初始化（如果页面有访客计数元素）
document.addEventListener('DOMContentLoaded', () => {
    const counter = new VisitorCounter();
    counter.start().catch(error => {
        console.error('访客计数初始化失败:', error);
    });
});

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisitorCounter;
}