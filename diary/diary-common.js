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
    const fontSize = 14;

    let width, height, columns, drops;

    function init() {
        width  = canvas.width  = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / fontSize);
        drops   = Array(columns).fill(1);
    }

    function draw() {
        ctx.fillStyle = 'rgba(9, 0, 20, 0.04)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#00FFFF';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.globalAlpha = Math.random() * 0.45 + 0.15;
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        ctx.globalAlpha = 1;
    }

    init();
    window.addEventListener('resize', init);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setInterval(draw, 50);
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
