// Build The Unmaker War pages.
//   node build.mjs          -> index.html (dev, loads src/*.js), dist/the-unmaker-war.html (standalone), dist/artifact.html (fragment)
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const page = fs.readFileSync(path.join(root, 'page.html'), 'utf8');
const srcDir = path.join(root, 'src');
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.js')).sort();

const split = page.indexOf('<main');
const headPart = page.slice(0, split).trim();
const bodyPart = page.slice(split).trim();

const meta = '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
const full = (scripts) =>
  `<!doctype html>\n<html lang="en">\n<head>\n${meta}\n${headPart}\n</head>\n<body>\n${bodyPart.replace('<!--SCRIPTS-->', scripts)}\n</body>\n</html>\n`;

// dev
const devScripts = files.map((f) => `<script src="src/${f}"></script>`).join('\n');
fs.writeFileSync(path.join(root, 'index.html'), full(devScripts));

// inline
const code = files
  .map((f) => `/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(srcDir, f), 'utf8'))
  .join('\n')
  .replace(/<\/script/gi, '<\\/script');
const inline = `<script>\n${code}\n</script>`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'the-unmaker-war.html'), full(inline));
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), page.replace('<!--SCRIPTS-->', inline));
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log('built', files.length, 'modules;', kb(Buffer.byteLength(inline)), 'of script');
