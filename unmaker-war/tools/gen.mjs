// Regenerates tool pages that load every src module except the player.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const files = fs.readdirSync(path.join(root, 'src')).filter((f) => f.endsWith('.js') && !f.startsWith('50-')).sort();
const tags = files.map((f) => `<script src="../src/${f}"></script>`).join('\n');
const page = (tool) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Instrument+Sans:wght@400;500;700&display=swap">
<style>html,body{margin:0;background:#111}canvas{display:block}</style></head>
<body><canvas id="c" width="1920" height="1080"></canvas><canvas id="sheet"></canvas>
${tags}
<script src="${tool}"></script></body></html>`;
fs.writeFileSync(path.join(root, 'tools', 'sheet.html'), page('sheet.js'));
console.log('tools regenerated with', files.length, 'modules');
