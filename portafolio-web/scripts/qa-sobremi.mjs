import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto('http://localhost:8083/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2400));
await page.evaluate(() => document.querySelector('#sobremi')?.scrollIntoView());
await new Promise((r) => setTimeout(r, 1600));
await page.screenshot({ path: 'C:/Users/User/AppData/Local/Temp/portafolio-qa/sobremi-heading.png' });
console.log('ok');
await browser.close();
