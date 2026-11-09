// --------------------------------------------------------------------------
// capture.mjs — capturas reales de las apps que corren en local
// Genera public/shots/*.png con Chrome headless (puppeteer-core).
// --------------------------------------------------------------------------
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve(import.meta.dirname, '..');
const OUT = path.join(BASE, 'public', 'shots');
fs.mkdirSync(OUT, { recursive: true });

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error('[shots] no encontré Chrome/Edge instalado');
  process.exit(1);
}
console.log('[shots] navegador:', executablePath);

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=es'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  env: { ...process.env, LANG: 'es' },
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- 1. Nexorys: login + dashboard ---------- */
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/gestion-inventario/login', { waitUntil: 'networkidle2', timeout: 25000 });
  await wait(700);
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.click('input[name="username"]', { clickCount: 3 });
  await page.type('input[name="username"]', 'admin');
  await page.click('input[name="password"]', { clickCount: 3 });
  await page.type('input[name="password"]', '1234');
  const personal = {
    id: 'inventario-dashboard',
  };
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await wait(1800);
  await page.screenshot({ path: path.join(OUT, `${personal.id}.png`) });
  console.log(`[shots] ${personal.id} -> ${page.url()}`);
  await page.close();
} catch (e) {
  // respaldo: página de login
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/gestion-inventario/', { waitUntil: 'networkidle2', timeout: 20000 });
    await wait(600);
    await page.screenshot({ path: path.join(OUT, 'inventario-dashboard.png') });
    console.log('[shots] inventario-dashboard (respaldo: login)');
  } catch (e2) {
    console.error('[shots] inventario falló:', e2.message);
  }
}

/* ---------- 2. RRHH: listado de departamentos ---------- */
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:8081/rrhh/departamentos', { waitUntil: 'networkidle2', timeout: 20000 });
  await wait(700);
  await page.screenshot({ path: path.join(OUT, 'rrhh-departamentos.png') });
  console.log('[shots] rrhh-departamentos');
  await page.close();
} catch (e) {
  console.error('[shots] rrhh falló:', e.message);
}

await browser.close();
console.log('[shots] listo');
