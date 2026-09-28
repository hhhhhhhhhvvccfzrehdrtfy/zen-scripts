// Usage: node tools/sheet.mjs "<query>" out.png
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
const [,, q, out] = process.argv;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + (e.stack || '')));
await page.goto('file://' + path.join(root, 'tools', 'sheet.html') + '?' + q);
await page.waitForFunction(() => window.__done === true, null, { timeout: 120000 });
const el = await page.$('#sheet');
await el.screenshot({ path: out });
console.log(await page.title());
if (errors.length) console.log(errors.slice(0, 5).join('\n'));
await browser.close();
