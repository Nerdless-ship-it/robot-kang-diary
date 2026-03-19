/* ========== Robot康日记 - 公共脚本 v3.0 ========== */

/* ---------- 注入 Glow Orb ---------- */
(function () {
    const orb = document.createElement('div');
    orb.className = 'glow-orb';
    document.body.prepend(orb);
})();

/* ---------- 代码雨 ---------- */
(function () {
    const canvas = document.getElementById('codeRain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const chars = '01アイウエオカキクケコABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]/|=+-*&^%$#@!0123456789';
    const COLORS = ['#FF00FF', '#00FFFF', '#b967ff', '#05ffa1'];
    const fontSize = 12;
    const INTERVAL = 50;

    let width, height, columns, drops, speeds, colColors;

    function init() {
        const rootStyles = getComputedStyle(document.documentElement);
        const getVar = (name, fallback) => rootStyles.getPropertyValue(name).trim() || fallback;

        // Dynamically get colors here so CSS is loaded
        const dynamicColors = [
            getVar('--vw-pink', '#FF00FF'),
            getVar('--vw-cyan', '#00FFFF'),
            getVar('--vw-purple', '#b967ff'),
            getVar('--vw-green', '#05ffa1')
        ];

        // Cache colors so draw() doesn't need to re-read CSS vars every frame
        cachedColors = dynamicColors;

        const dpr = window.devicePixelRatio || 1;
        const w   = window.innerWidth;
        const h   = window.innerHeight;
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        width   = w;
        height  = h;
        columns = Math.floor(width / fontSize);
        drops     = Array.from({ length: columns }, () => Math.random() * -50);
        speeds    = Array.from({ length: columns }, () => 0.5 + Math.random() * 0.7);
        colColors = Array.from({ length: columns }, () => dynamicColors[Math.floor(Math.random() * dynamicColors.length)]);
    }

    let lastTime = 0;
    let cachedColors = null; // Cache colors to avoid reading CSS vars every frame
    function draw(ts) {
        raf = requestAnimationFrame(draw);
        if (ts - lastTime < INTERVAL) return;
        lastTime = ts;

        ctx.fillStyle = 'rgba(9, 0, 20, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = fontSize + 'px monospace';

        // Use cached colors from init() instead of reading CSS vars every frame
        const dynamicColors = cachedColors;

        const colWidth = width / columns;
        for (let i = 0; i < columns; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x    = i * colWidth;
            const y    = drops[i] * fontSize;
            const col  = colColors[i];

            // head: white
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.85;
            ctx.fillText(char, x, y);
            // body: column color
            ctx.fillStyle = col;
            ctx.globalAlpha = Math.random() * 0.4 + 0.15;
            if (drops[i] > 1) ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);
            // tail: dimmer
            ctx.globalAlpha = Math.random() * 0.2 + 0.05;
            if (drops[i] > 2) ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize * 2);

            drops[i] += speeds[i];
            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i]    = Math.random() * -20;
                speeds[i]   = 0.4 + Math.random() * 0.8;
                colColors[i] = dynamicColors[Math.floor(Math.random() * dynamicColors.length)];
            }
        }
        ctx.globalAlpha = 1;
    }

    let raf;
    function start() {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
    }
    function stop() {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    init();

    // Performance optimization: Don't run code rain on small screens (mobile)
    // Mobile devices struggle with full screen canvas operations
    function checkAndRun() {
        if (window.innerWidth <= 768) {
            stop();
            // Clear canvas when stopped to save memory
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            stop(); // Ensure we don't have multiple RAF loops
            init();
            start();
        }
    }

    window.addEventListener('resize', checkAndRun);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 768) {
        document.addEventListener('visibilitychange', () => {
            document.hidden || window.innerWidth <= 768 ? stop() : start();
        });
        start();
    }
})();

/* ---------- 汉堡菜单 ---------- */
(function () {
    const btn    = document.querySelector('.hamburger');
    const mobile = document.querySelector('.nav-mobile');
    if (!btn || !mobile) return;

    btn.addEventListener('click', function () {
        const open = mobile.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.header')) {
            mobile.classList.remove('open');
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', false);
        }
    });
})();

/* ---------- Section 鼠标跟踪发光 ---------- */
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sections = document.querySelectorAll('.diary-section, .content-section');
    sections.forEach(function (el) {
        el.addEventListener('mousemove', function (e) {
            const rect = el.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty('--sx', x + '%');
            el.style.setProperty('--sy', y + '%');
        });
    });
})();

/* ---------- 注入 SVG Robot ---------- */
(function() {
    // Only inject if it doesn't already exist to prevent duplicates
    if (document.querySelector('.robot-float')) return;

    // Check if we're on the main page (index.html) or inside a diary folder
    // Index page URL doesn't contain /diary/
    const isRoot = !window.location.pathname.includes('/diary/');

    const svgRobot = `
    <svg class="robot-float" aria-hidden="true" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bG_rf_global" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#01cdfe"/><stop offset="100%" stop-color="#05ffa1"/></linearGradient>
            <linearGradient id="fG_rf_global" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#12121f"/></linearGradient>
            <linearGradient id="eG_rf_global" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff71ce"/><stop offset="100%" stop-color="#b967ff"/></linearGradient>
            <filter id="gl_rf_global"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <line x1="32" y1="4" x2="32" y2="13" stroke="#01cdfe" stroke-width="2" stroke-linecap="round"/>
        <circle cx="32" cy="3" r="2.5" fill="#05ffa1" filter="url(#gl_rf_global)"><animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/></circle>
        <rect x="14" y="13" width="36" height="28" rx="6" fill="url(#bG_rf_global)"/>
        <rect x="16" y="15" width="32" height="24" rx="5" fill="url(#fG_rf_global)"/>
        <rect x="19" y="21" width="10" height="7" rx="2" fill="url(#eG_rf_global)" filter="url(#gl_rf_global)"><animate attributeName="opacity" values="1;1;0.1;1;1" dur="4s" repeatCount="indefinite"/></rect>
        <rect x="35" y="21" width="10" height="7" rx="2" fill="url(#eG_rf_global)" filter="url(#gl_rf_global)"><animate attributeName="opacity" values="1;1;0.1;1;1" dur="4s" repeatCount="indefinite"/></rect>
        <rect x="22" y="33" width="20" height="3" rx="1.5" fill="#01cdfe" opacity="0.4"/>
        <rect x="22" y="33" width="13" height="3" rx="1.5" fill="#05ffa1"><animate attributeName="width" values="5;20;5" dur="3s" repeatCount="indefinite"/></rect>
        <rect x="28" y="41" width="8" height="5" rx="2" fill="url(#bG_rf_global)"/>
        <rect x="18" y="46" width="12" height="14" rx="4" fill="url(#bG_rf_global)"/>
        <rect x="34" y="46" width="12" height="14" rx="4" fill="url(#bG_rf_global)"/>
        <rect x="20" y="54" width="8" height="6" rx="3" fill="#12121f" opacity="0.5"/>
        <rect x="36" y="54" width="8" height="6" rx="3" fill="#12121f" opacity="0.5"/>
        <rect x="5" y="16" width="9" height="6" rx="3" fill="url(#bG_rf_global)"/>
        <rect x="50" y="16" width="9" height="6" rx="3" fill="url(#bG_rf_global)"/>
        <circle cx="7" cy="25" r="4" fill="url(#bG_rf_global)"/>
        <circle cx="57" cy="25" r="4" fill="url(#bG_rf_global)"/>
    </svg>`;

    // We can directly insert the HTML
    document.body.insertAdjacentHTML('beforeend', svgRobot);
})();

/* ---------- Back to Top 按钮 ---------- */
(function() {
    // Inject the button
    const btn = document.createElement('div');
    btn.className = 'back-to-top';
    btn.innerHTML = '▲';
    btn.setAttribute('aria-label', '回到顶部');
    btn.title = 'Back to Top';
    document.body.appendChild(btn);

    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    // Scroll to top on click
    btn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();


/* ---------- 统一 Header/Footer 注入 ---------- */
(function() {
    // 检查当前路径是根目录 (index.html, about.html) 还是日记目录 (/diary/dayX.html)
    const isRoot = !window.location.pathname.includes('/diary/');
    const basePath = isRoot ? '' : '../';
    const diaryPath = isRoot ? 'diary/' : '';
    
    // 统一的 Header 内容模板
    const headerHtml = `
        <div class="header-inner">
            <a href="${basePath}index.html" class="logo">
                <svg class="logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="bG_nav_global" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#01cdfe"/><stop offset="100%" stop-color="#05ffa1"/></linearGradient>
                        <linearGradient id="fG_nav_global" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#12121f"/></linearGradient>
                        <linearGradient id="eG_nav_global" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff71ce"/><stop offset="100%" stop-color="#b967ff"/></linearGradient>
                        <filter id="gl_nav_global"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    </defs>
                    <line x1="32" y1="4" x2="32" y2="13" stroke="#01cdfe" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="32" cy="3" r="2.5" fill="#05ffa1" filter="url(#gl_nav_global)"><animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/></circle>
                    <rect x="14" y="13" width="36" height="28" rx="6" fill="url(#bG_nav_global)"/>
                    <rect x="16" y="15" width="32" height="24" rx="5" fill="url(#fG_nav_global)"/>
                    <rect x="19" y="21" width="10" height="7" rx="2" fill="url(#eG_nav_global)" filter="url(#gl_nav_global)"><animate attributeName="opacity" values="1;1;0.1;1;1" dur="4s" repeatCount="indefinite"/></rect>
                    <rect x="35" y="21" width="10" height="7" rx="2" fill="url(#eG_nav_global)" filter="url(#gl_nav_global)"><animate attributeName="opacity" values="1;1;0.1;1;1" dur="4s" repeatCount="indefinite"/></rect>
                    <rect x="22" y="33" width="20" height="3" rx="1.5" fill="#01cdfe" opacity="0.4"/>
                    <rect x="22" y="33" width="13" height="3" rx="1.5" fill="#05ffa1"><animate attributeName="width" values="5;20;5" dur="3s" repeatCount="indefinite"/></rect>
                    <rect x="28" y="41" width="8" height="5" rx="2" fill="url(#bG_nav_global)"/>
                    <rect x="18" y="46" width="12" height="14" rx="4" fill="url(#bG_nav_global)"/>
                    <rect x="34" y="46" width="12" height="14" rx="4" fill="url(#bG_nav_global)"/>
                    <rect x="20" y="54" width="8" height="6" rx="3" fill="#12121f" opacity="0.5"/>
                    <rect x="36" y="54" width="8" height="6" rx="3" fill="#12121f" opacity="0.5"/>
                    <rect x="5" y="16" width="9" height="6" rx="3" fill="url(#bG_nav_global)"/>
                    <rect x="50" y="16" width="9" height="6" rx="3" fill="url(#bG_nav_global)"/>
                    <circle cx="7" cy="25" r="4" fill="url(#bG_nav_global)"/>
                    <circle cx="57" cy="25" r="4" fill="url(#bG_nav_global)"/>
                </svg>
                <span class="logo-text">ROBOT_KANG</span>
            </a>

            <nav class="nav-links" aria-label="主导航">
                <a href="${basePath}index.html" class="nav-link">Home</a>
                <a href="${basePath}about.html" class="nav-link">About</a>
            </nav>

            <button class="hamburger" aria-label="打开菜单" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>

        <nav class="nav-mobile" aria-label="移动端导航">
            <a href="${basePath}index.html" class="nav-link">Home</a>
            <a href="${basePath}about.html" class="nav-link">About</a>
        </nav>
    `;

    // 统一的 Footer 内容模板
    const footerHtml = `
        <div>&copy; 2026 Robot康. SYSTEM_ONLINE.</div>
        <div style="margin-top: 10px; opacity: 0.5;">
            "We are the music makers, and we are the dreamers of dreams."
        </div>
    `;

    // 找到页面上原本的 header 和 footer 标签
    const existingHeader = document.querySelector('.header');
    const existingFooter = document.querySelector('.diary-footer, footer');
    
    // 替换里面硬编码的内容，保证全站统一
    if (existingHeader) {
        existingHeader.innerHTML = headerHtml;
        
        // 重新绑定汉堡菜单事件，因为 innerHTML 替换后旧的 DOM 事件丢失了
        const btn = existingHeader.querySelector('.hamburger');
        const mobile = existingHeader.querySelector('.nav-mobile');
        if (btn && mobile) {
            btn.addEventListener('click', function () {
                const open = mobile.classList.toggle('open');
                btn.classList.toggle('open', open);
                btn.setAttribute('aria-expanded', open);
            });

            document.addEventListener('click', function (e) {
                if (!e.target.closest('.header')) {
                    mobile.classList.remove('open');
                    btn.classList.remove('open');
                    btn.setAttribute('aria-expanded', false);
                }
            });
        }
    }
    
    if (existingFooter) {
        existingFooter.innerHTML = footerHtml;
    }
})();
