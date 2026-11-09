import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto('http://localhost:8083/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2600));

// ir a la sección de apps
await page.evaluate(() => document.querySelector('#apps')?.scrollIntoView());
await new Promise((r) => setTimeout(r, 1400));

// abrir modal del inventario
const cards = await page.$$('section#apps .glass button');
// botón "Vista en vivo" de la primera tarjeta
const buttons = await page.$$('section#apps button, section#apps a');
for (const b of buttons) {
  const t = (await b.evaluate((el) => el.textContent)) || '';
  if (t.includes('Vista en vivo')) { await b.click(); break; }
}
await new Promise((r) => setTimeout(r, 2600));
await page.screenshot({ path: 'C:/Users/User/AppData/Local/Temp/portafolio-qa/modal-inventario.png' });
// cerrar con Escape
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 700));

// abrir consola API (ReservasLabAPI)
const buttons2 = await page.$$('section#apps button');
let opened = 0;
for (const b of buttons2) {
  const t = (await b.evaluate((el) => el.textContent)) || '';
  if (t.includes('Vista en vivo')) {
    await b.click();
    if (++opened === 3) break; // tercera tarjeta visible: ReservasLab
  }
}
await new Promise((r) => setTimeout(r, 1000));
// pulsar Probar
const probar = await page.$$('button');
for (const b of probar) {
  const t = (await b.evaluate((el) => el.textContent)) || '';
  if (t.includes('Probar')) { await b.click(); break; }
}
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: 'C:/Users/User/AppData/Local/Temp/portafolio-qa/modal-api.png' });

console.log('ok');
await browser.close();
