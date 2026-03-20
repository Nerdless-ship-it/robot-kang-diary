const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });

    const files = ['cover-day10.html', 'promo-website.html'];
    for (const file of files) {
        const filePath = 'file:///' + path.join(__dirname, file).replace(/\\/g, '/');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        const name = file.replace('.html', '.png');
        await page.screenshot({ path: path.join(__dirname, name), fullPage: false });
        console.log(name + ' 生成完成');
    }

    await browser.close();
})();
