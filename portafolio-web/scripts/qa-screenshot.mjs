// QA visual del portafolio: recorre la página, espera animaciones y captura pantallas.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve(import.meta.dirname, '..');
const OUT = path.join(process.env.TEMP || '/tmp', 'portafolio-qa');
fs.mkdirSync(OUT, { recursive: true });

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
const errors = [];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  env: { ...process.env, LANG: 'es' },
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- escritorio ---------- */
const page = await browser.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200));
});
page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url().slice(0, 140) + ' :: ' + r.failure()?.errorText));

const isSmall = process.argv.includes('--mobile');
await page.setViewport({ width: isSmall ? 390 : 1440, height: isSmall ? 844 : 900, deviceScaleFactor: isSmall ? 2 : 1 });
await page.goto('http://localhost:8083/', { waitUntil: 'networkidle2', timeout: 40000 });

/* deja correr el preloader */
await wait(2800);

/* recorre con el scroll para disparar las animaciones whileInView */
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 640) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await wait(260);
}
await page.evaluate(() => window.scrollTo(0, 0));
await wait(900);

await page.screenshot({ path: path.join(OUT, isSmall ? 'mobile-full.png' : 'desktop-full.png'), fullPage: true });
await page.screenshot({ path: path.join(OUT, isSmall ? 'mobile-hero.png' : 'desktop-hero.png') });

console.log('[qa] capturas en', OUT);
console.log(errors.length ? `[qa] ${errors.length} problemas de consola:\n` + errors.slice(0, 12).join('\n') : '[qa] sin errores de consola');
await browser.close();
