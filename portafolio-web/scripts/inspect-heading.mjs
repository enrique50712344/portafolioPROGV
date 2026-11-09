import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:8083/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2400));
await page.evaluate(() => document.querySelector('#sobremi')?.scrollIntoView());
await new Promise((r) => setTimeout(r, 1600));

const info = await page.evaluate(() => {
  const h2s = [...document.querySelectorAll('#sobremi h2')];
  return h2s.map((h2) => {
    const spans = [...h2.querySelectorAll('span')].map((s) => {
      const cs = getComputedStyle(s);
      const r = s.getBoundingClientRect();
      return {
        text: s.textContent,
        cls: s.className,
        color: cs.color,
        bg: cs.backgroundImage?.slice(0, 60),
        bgClip: cs.webkitBackgroundClip || cs.backgroundClip,
        opacity: cs.opacity,
        transform: cs.transform,
        w: Math.round(r.width),
        h: Math.round(r.height),
        display: cs.display,
      };
    });
    return { h2Text: h2.textContent, spans };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
