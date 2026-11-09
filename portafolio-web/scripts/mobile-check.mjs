import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto('http://localhost:8083/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2600));

const spots = [ '#sobremi', '#apps', '#codigo', '#contacto' ];
const out = 'C:/Users/User/AppData/Local/Temp/portafolio-qa/';
let idx = 0;
for (const sel of spots) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    el && el.scrollIntoView({ block: 'start' });
  }, sel);
  await new Promise((r) => setTimeout(r, 1400));
  await page.screenshot({ path: out + `mobile-${++idx}-${sel.replace('#','')}.png` });
}
console.log('ok');
await browser.close();
