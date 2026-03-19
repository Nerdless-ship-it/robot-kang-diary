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
        colColors = Array.from({ length: columns }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
    }

    let lastTime = 0;
    function draw(ts) {
        raf = requestAnimationFrame(draw);
        if (ts - lastTime < INTERVAL) return;
        lastTime = ts;

        ctx.fillStyle = 'rgba(9, 0, 20, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = fontSize + 'px monospace';

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
                colColors[i] = COLORS[Math.floor(Math.random() * COLORS.length)];
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
    window.addEventListener('resize', () => { stop(); init(); start(); });

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
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
