// Usage: node tools/shoot.mjs <url-relative-to-unmaker-war> <out.png> [waitMs]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
const [,, rel, out, wait] = process.argv;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + (e.stack||'')));
await page.goto('file://' + path.join(root, rel));
await page.waitForTimeout(+(wait || 300));
await page.screenshot({ path: out });
if (errors.length) console.log(errors.join('\n'));
await browser.close();
