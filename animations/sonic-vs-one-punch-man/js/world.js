'use strict';
/* Backgrounds: skies, parallax city skylines, checkered hills, mesas, cloud seas, rooftops.
   Heavy layers are painted once into offscreen canvases by buildWorld(). */

const BG = {};
const CITY_G = 600;
const HILL_G = 560;
const MESA_G = 600;

function rnd(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function skylineLayer(seed, w, h, o) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const r = rnd(seed);
  let x = 0;
  while (x < w) {
    let bw = o.minW + r() * (o.maxW - o.minW);
    if (w - (x + bw) < o.minW) bw = w - x;
    const bh = o.minH + r() * (o.maxH - o.minH);
    const top = h - bh;
    g.fillStyle = o.col;
    g.fillRect(x, top, bw + 1, bh);
    const kind = r();
    if (kind < 0.22) g.fillRect(x + bw * 0.3, top - 16, bw * 0.4, 17);
    else if (kind < 0.38) {
      g.fillRect(x + bw * 0.5 - 1.5, top - 42, 3, 42);
      if (o.beacon) {
        g.fillStyle = '#ff5a5a';
        g.fillRect(x + bw * 0.5 - 3, top - 46, 6, 5);
      }
    } else if (kind < 0.48) {
      g.fillRect(x + bw * 0.2, top - 28, 24, 18);
      g.fillRect(x + bw * 0.2 + 3, top - 10, 3, 10);
      g.fillRect(x + bw * 0.2 + 18, top - 10, 3, 10);
    }
    g.fillStyle = o.win;
    const cols = Math.floor((bw - 12) / 14);
    const rows = Math.floor((bh - 20) / 20);
    const ox = x + (bw - cols * 14) / 2 + 3;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (r() < o.lit) {
          g.globalAlpha = 0.5 + r() * 0.5;
          g.fillRect(ox + i * 14, top + 14 + j * 20, 7, 10);
        }
      }
    }
    g.globalAlpha = 1;
    x += bw + (r() < 0.3 ? 6 + r() * 14 : 0);
  }
  return c;
}

function mesaLayer(seed, w, h, col, edge, minH, maxH) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const r = rnd(seed);
  let x = -60;
  while (x < w) {
    const mw = 180 + r() * 340;
    const mh = minH + r() * (maxH - minH);
    const s1 = 30 + r() * 50;
    const s2 = 30 + r() * 50;
    g.beginPath();
    g.moveTo(x, h);
    g.lineTo(x + s1 * 0.6, h - mh * 0.55);
    g.lineTo(x + s1, h - mh * 0.6);
    g.lineTo(x + s1 + 6, h - mh);
    g.lineTo(x + mw - s2 - 6, h - mh);
    g.lineTo(x + mw - s2, h - mh * 0.62);
    g.lineTo(x + mw - s2 * 0.4, h - mh * 0.5);
    g.lineTo(x + mw, h);
    g.closePath();
    g.fillStyle = col;
    g.fill();
    g.fillStyle = edge;
    g.fillRect(x + s1 + 6, h - mh, mw - s1 - s2 - 12, 5);
    for (let k = 1; k < 4; k++) g.fillRect(x + s1 * 0.6, h - mh * (0.55 - k * 0.12), mw - s1 * 0.6 - s2 * 0.4, 2);
    x += mw * (0.55 + r() * 0.5);
  }
  // wrap the seam so the tile repeats cleanly
  const t = makeCanvas(w, h);
  const tg = t.getContext('2d');
  tg.drawImage(c, 0, 0);
  tg.drawImage(c, -w, 0);
  return t;
}

function cloudSprite(seed, w, h, top, shade) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const r = rnd(seed);
  const blobs = [];
  for (let i = 0; i < 14; i++) {
    const u = r();
    const rad = h * (0.18 + r() * 0.22) * (1 - Math.abs(u - 0.5));
    blobs.push([w * 0.12 + u * w * 0.76, h * 0.62 - r() * h * 0.3, rad + h * 0.12]);
  }
  for (const [x, y, rad] of blobs) {
    g.beginPath();
    g.arc(x, y + rad * 0.18, rad, 0, TAU);
    g.fillStyle = shade;
    g.fill();
  }
  for (const [x, y, rad] of blobs) {
    g.beginPath();
    g.arc(x, y, rad * 0.94, 0, TAU);
    g.fillStyle = top;
    g.fill();
  }
  return c;
}

function starLayer(seed, n) {
  const c = makeCanvas(W, H);
  const g = c.getContext('2d');
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W;
    const y = r() * H * 0.85;
    g.globalAlpha = 0.35 + r() * 0.65;
    g.fillStyle = r() < 0.15 ? '#ffe9b0' : '#ffffff';
    const s = r() < 0.08 ? 2.4 : r() < 0.4 ? 1.6 : 1;
    g.fillRect(x, y, s, s);
  }
  return c;
}

function buildWorld() {
  BG.dusk = [
    skylineLayer(11, 2400, 360, { col: '#7a4a7e', win: '#ffd6a0', lit: 0.12, minH: 110, maxH: 250, minW: 50, maxW: 120 }),
    skylineLayer(23, 2200, 420, { col: '#4c2c62', win: '#ffd27a', lit: 0.22, minH: 160, maxH: 330, minW: 70, maxW: 150, beacon: true }),
    skylineLayer(37, 2000, 500, { col: '#2b1a3d', win: '#ffe19a', lit: 0.3, minH: 220, maxH: 450, minW: 110, maxW: 210 }),
  ];
  BG.night = [
    skylineLayer(11, 2400, 360, { col: '#1d2150', win: '#ffe7a8', lit: 0.25, minH: 110, maxH: 250, minW: 50, maxW: 120 }),
    skylineLayer(23, 2200, 420, { col: '#141638', win: '#ffd27a', lit: 0.35, minH: 160, maxH: 330, minW: 70, maxW: 150, beacon: true }),
    skylineLayer(37, 2000, 500, { col: '#0b0c22', win: '#ffe19a', lit: 0.42, minH: 220, maxH: 450, minW: 110, maxW: 210 }),
  ];
  BG.stars = starLayer(5, 260);
  BG.mesaFar = mesaLayer(7, 2400, 260, '#d08a68', '#e6a582', 90, 210);
  BG.mesaMid = mesaLayer(19, 2200, 220, '#a8553c', '#c06c4c', 60, 160);
  BG.cloudsDay = [cloudSprite(3, 380, 150, '#ffffff', '#d7e7f7'), cloudSprite(8, 300, 120, '#ffffff', '#d7e7f7')];
  BG.cloudsDusk = [
    cloudSprite(4, 460, 170, '#ffe2d0', '#d99aae'),
    cloudSprite(9, 400, 150, '#ffd8c4', '#cf8ea8'),
    cloudSprite(14, 520, 190, '#ffe9da', '#dca4b8'),
  ];
}

/* ---------- skies ---------- */

const SKY = {
  dusk: [[0, '#2a1b4d'], [0.45, '#8e3b72'], [0.75, '#e8706a'], [1, '#ffc27a']],
  night: [[0, '#05071a'], [0.6, '#121a45'], [1, '#2b2f6b']],
  day: [[0, '#2f7ff0'], [0.55, '#8ccaf7'], [1, '#fff0c2']],
  sunset: [[0, '#4a2c7a'], [0.45, '#d9566a'], [0.78, '#ff9a55'], [1, '#ffd08a']],
  storm: [[0, '#120c2a'], [0.5, '#3b1d56'], [0.85, '#a8405a'], [1, '#e2785a']],
  battle: [[0, '#26195a'], [0.45, '#7a3b8f'], [0.8, '#ff8a5c'], [1, '#ffcf87']],
};
const _skyGrad = {};

function sky(ctx, name, alpha = 1) {
  let g = _skyGrad[name];
  if (!g) {
    g = ctx.createLinearGradient(0, 0, 0, H);
    for (const [o, c] of SKY[name]) g.addColorStop(o, c);
    _skyGrad[name] = g;
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = g;
  ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.restore();
}

function sunDisc(ctx, x, y, r, col, glow) {
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3.2);
  g.addColorStop(0, glow + '0.55)');
  g.addColorStop(1, glow + '0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  circle(ctx, x, y, r, col);
}

function moon(ctx, x, y, r) {
  sunDisc(ctx, x, y, r, '#f6f0cf', 'rgba(220,225,255,');
  circle(ctx, x - r * 0.3, y - r * 0.2, r * 0.18, '#e4dcb4');
  circle(ctx, x + r * 0.25, y + r * 0.3, r * 0.13, '#e4dcb4');
  circle(ctx, x + r * 0.35, y - r * 0.35, r * 0.09, '#e4dcb4');
}

function stars(ctx, t, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(BG.stars, 0, 0);
  for (let i = 0; i < 10; i++) {
    const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + hash(i) * 2) + i * 4);
    star4(ctx, hash(i * 3.1) * W, hash(i * 5.7) * H * 0.6, 3 + 5 * tw, 0, 'rgba(255,255,255,0.85)');
  }
  ctx.restore();
}

function tile(ctx, img, scroll, y, alpha = 1) {
  const w = img.width;
  let x = -(((scroll % w) + w) % w) - Math.ceil(1000 / w) * w;
  if (alpha < 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
  }
  for (; x < W + 1000; x += w) ctx.drawImage(img, Math.round(x), Math.round(y));
  if (alpha < 1) ctx.restore();
}

function clouds(ctx, sprites, scroll, y, gap, scale = 1, alpha = 1, seed = 1) {
  const span = gap * sprites.length * 3;
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (let i = 0; i < sprites.length * 3; i++) {
    const img = sprites[i % sprites.length];
    const base = i * gap + hash(seed + i) * gap * 0.5;
    const x = ((((base - scroll) % span) + span) % span) - img.width * scale - 1000;
    if (x > W + 1000) continue;
    ctx.drawImage(img, x, y + hash(seed + i * 2) * 40 - img.height * scale, img.width * scale, img.height * scale);
  }
  ctx.restore();
}

/* ---------- City Z ---------- */

function cityBG(ctx, cam, o = {}) {
  const night = !!o.night;
  const camY = o.camY || 0;
  sky(ctx, night ? 'night' : 'dusk');
  if (night) {
    stars(ctx, o.t || 0);
    moon(ctx, 1010, 150, 56);
  } else sunDisc(ctx, 930, 470 + camY * 0.3, 62, '#fff1c1', 'rgba(255,190,120,');
  ctx.save();
  ctx.translate(0, camY);
  const L = night ? BG.night : BG.dusk;
  tile(ctx, L[0], cam * 0.1, CITY_G - 20 - L[0].height);
  tile(ctx, L[1], cam * 0.25, CITY_G - 16 - L[1].height);
  const hz = ctx.createLinearGradient(0, CITY_G - 260, 0, CITY_G);
  hz.addColorStop(0, night ? 'rgba(30,40,90,0)' : 'rgba(255,150,120,0)');
  hz.addColorStop(1, night ? 'rgba(30,40,90,0.35)' : 'rgba(255,150,120,0.35)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, CITY_G - 260, W, 260);
  tile(ctx, L[2], cam * 0.5, CITY_G - 14 - L[2].height);
  if (!o.noStreet) street(ctx, cam, night);
  ctx.restore();
}

function street(ctx, cam, night) {
  const y0 = CITY_G - 14;
  ctx.fillStyle = night ? '#2e2a3d' : '#6a5d78';
  ctx.fillRect(-50, y0, W + 100, 50);
  ctx.fillStyle = night ? '#3b3650' : '#8a7a9c';
  ctx.fillRect(-50, y0, W + 100, 4);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 2;
  for (let x = -(((cam % 90) + 90) % 90); x < W + 20; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, y0 + 4);
    ctx.lineTo(x - 14, y0 + 50);
    ctx.stroke();
  }
  ctx.fillStyle = night ? '#1d1a28' : '#3c3247';
  ctx.fillRect(-50, y0 + 50, W + 100, 9);
  ctx.fillStyle = night ? '#15131d' : '#2b2533';
  ctx.fillRect(-50, y0 + 59, W + 100, H - y0);
  ctx.fillStyle = '#e8d9a8';
  ctx.globalAlpha = 0.75;
  for (let x = -(((cam % 160) + 160) % 160); x < W + 20; x += 160) ctx.fillRect(x, y0 + 98, 80, 6);
  ctx.globalAlpha = 1;
  const first = Math.floor((cam - 200) / 560);
  const last = Math.floor((cam + W + 200) / 560);
  for (let i = first; i <= last; i++) lamp(ctx, i * 560 + 180 - cam, y0 + 2, night);
}

function lamp(ctx, x, y, night) {
  ctx.fillStyle = '#231c2c';
  ctx.fillRect(x - 3, y - 190, 6, 190);
  ctx.fillRect(x - 3, y - 190, 34, 5);
  const g = ctx.createRadialGradient(x + 30, y - 178, 2, x + 30, y - 178, 90);
  g.addColorStop(0, night ? 'rgba(255,230,160,0.5)' : 'rgba(255,230,160,0.25)');
  g.addColorStop(1, 'rgba(255,230,160,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 60, y - 268, 180, 180);
  ctx.fillStyle = '#ffe9b0';
  ctx.beginPath();
  ctx.ellipse(x + 30, y - 183, 10, 4, 0, 0, TAU);
  ctx.fill();
}

/* ---------- checkered hills ---------- */

function ridge(ctx, off, base, amp, freq, col, seed) {
  ctx.beginPath();
  ctx.moveTo(-10, H);
  for (let x = -10; x <= W + 16; x += 16) {
    const wx = x + off;
    const y = base - amp * (0.5 + 0.5 * Math.sin(wx * freq + seed)) * (0.7 + 0.3 * Math.sin(wx * freq * 2.7 + seed * 3));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W + 16, H);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

function palm(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  for (let i = 0; i < 7; i++) {
    const yy = -i * 22;
    const xx = Math.sin(i * 0.35) * 10;
    ell(ctx, xx, yy - 10, 11, 12, 0, i % 2 ? '#a0612b' : '#c27a3a', 2.5);
  }
  const tx = Math.sin(7 * 0.35) * 10;
  const ty = -160;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(40, -18, 78, 16);
    ctx.quadraticCurveTo(40, 4, 0, 0);
    ctx.fillStyle = i % 2 ? '#2e9e45' : '#3dbb52';
    ctx.fill();
    strokeNow(ctx, 2.5, INK);
    ctx.restore();
  }
  ctx.restore();
}

function checker(ctx, cam, x0, x1, y0, size, c1, c2) {
  for (let wx = Math.floor((cam + x0) / size) * size; wx < cam + x1; wx += size) {
    const sx = wx - cam;
    const ci = Math.round(wx / size);
    for (let j = 0; y0 + j * size < H; j++) {
      ctx.fillStyle = (ci + j) & 1 ? c1 : c2;
      ctx.fillRect(sx, y0 + j * size, size + 1, size + 1);
    }
  }
}

function hillsBG(ctx, cam, o = {}) {
  const camY = o.camY || 0;
  sky(ctx, 'day');
  sunDisc(ctx, 1040, 150 + camY * 0.2, 44, '#fffbe6', 'rgba(255,240,180,');
  clouds(ctx, BG.cloudsDay, cam * 0.04 + (o.t || 0) * 12, 210 + camY * 0.3, 520, 1, 0.95, 2);
  ctx.save();
  ctx.translate(0, camY);
  ridge(ctx, cam * 0.06, 430, 120, 0.004, '#9cc0ea', 1);
  ctx.save();
  if (o.cliffX != null) {
    cityInValley(ctx, o.cliffX);
    ctx.beginPath();
    ctx.rect(-20, -400, o.cliffX + 20, H + 800);
    ctx.clip();
  }
  ridge(ctx, cam * 0.16, 500, 80, 0.007, '#4fae62', 2);
  ridge(ctx, cam * 0.16, 512, 60, 0.0071, '#3d9a52', 2.3);
  ctx.restore();
  for (let i = Math.floor((cam * 0.55 - 400) / 430); i <= Math.floor((cam * 0.55 + W + 200) / 430); i++) {
    const x = i * 430 + 120 - cam * 0.55;
    if (o.cliffX != null && x > o.cliffX - 60) continue;
    palm(ctx, x, HILL_G + 4, 0.8 + hash(i) * 0.35);
  }
  hillGround(ctx, cam, o.cliffX);
  ctx.restore();
}

function hillGround(ctx, cam, cliffX) {
  const right = cliffX == null ? W + 20 : cliffX;
  ctx.save();
  ctx.beginPath();
  ctx.rect(-20, HILL_G, right + 20, H - HILL_G + 400);
  ctx.clip();
  checker(ctx, cam, -40, right + 40, HILL_G + 16, 32, '#b05c1e', '#7d3f12');
  const g = ctx.createLinearGradient(0, HILL_G, 0, H);
  g.addColorStop(0, 'rgba(60,20,0,0)');
  g.addColorStop(1, 'rgba(60,20,0,0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(-20, HILL_G, right + 40, H);
  ctx.fillStyle = '#2fb24a';
  ctx.fillRect(-20, HILL_G, right + 40, 18);
  for (let wx = Math.floor((cam - 40) / 24) * 24; wx < cam + right + 40; wx += 24) {
    circle(ctx, wx - cam + 12, HILL_G + 18, 10, '#2fb24a');
  }
  ctx.fillStyle = '#7ee07a';
  ctx.fillRect(-20, HILL_G, right + 40, 4);
  ctx.restore();
  if (cliffX != null) {
    ctx.fillStyle = '#5a2c0c';
    ctx.beginPath();
    ctx.moveTo(cliffX, HILL_G);
    ctx.lineTo(cliffX + 10, HILL_G + 40);
    ctx.lineTo(cliffX - 4, HILL_G + 90);
    ctx.lineTo(cliffX + 6, H + 10);
    ctx.lineTo(cliffX - 30, H + 10);
    ctx.lineTo(cliffX - 30, HILL_G);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function cityInValley(ctx, cliffX) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(cliffX - 40, 0, W - cliffX + 80, H);
  ctx.clip();
  const g = ctx.createLinearGradient(0, 470, 0, H);
  g.addColorStop(0, '#8fb98a');
  g.addColorStop(1, '#4f7f5a');
  ctx.fillStyle = g;
  ctx.fillRect(cliffX - 40, 560, W, H);
  const img = BG.dusk[1];
  const sc = 0.55;
  ctx.globalAlpha = 0.9;
  ctx.drawImage(img, 0, 0, img.width, img.height, cliffX + 30, 572 - img.height * sc, img.width * sc, img.height * sc);
  ctx.globalAlpha = 1;
  const hz = ctx.createLinearGradient(0, 380, 0, 600);
  hz.addColorStop(0, 'rgba(190,215,235,0)');
  hz.addColorStop(1, 'rgba(190,215,235,0.55)');
  ctx.fillStyle = hz;
  ctx.fillRect(cliffX - 40, 380, W, 220);
  bigText(ctx, 'CITY Z', cliffX + 330, 352, 30, { fill: '#ffffff', stroke: '#3a2a55', sw: 6, alpha: 0.9 });
  ctx.restore();
}

// Vertical loop: running surface at radius R around (cx, gy - R).
function drawLoop(ctx, cx, gy, R) {
  const cy = gy - R;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R + 30, 0, TAU);
  ctx.arc(cx, cy, R, 0, TAU, true);
  ctx.clip();
  for (let y = cy - R - 40; y < gy + 40; y += 30) {
    for (let x = cx - R - 40; x < cx + R + 40; x += 30) {
      ctx.fillStyle = (Math.round((x - cx) / 30) + Math.round((y - cy) / 30)) & 1 ? '#b05c1e' : '#7d3f12';
      ctx.fillRect(x, y, 31, 31);
    }
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, R + 30, 0, TAU);
  strokeNow(ctx, 4, INK);
  ctx.beginPath();
  ctx.arc(cx, cy, R + 3, 0, TAU);
  strokeNow(ctx, 8, '#2fb24a');
  ctx.beginPath();
  ctx.arc(cx, cy, R - 1, 0, TAU);
  strokeNow(ctx, 3, INK);
}

/* ---------- mesa ---------- */

function mesaBG(ctx, cam, o = {}) {
  const dark = o.dark || 0;
  sky(ctx, 'sunset');
  if (dark > 0) sky(ctx, 'storm', dark);
  sunDisc(ctx, 280, 430, 72, '#fff0c8', 'rgba(255,170,90,');
  clouds(ctx, BG.cloudsDusk, cam * 0.03 + (o.t || 0) * 8, 260, 600, 0.8, 0.8, 5);
  tile(ctx, BG.mesaFar, cam * 0.08, MESA_G - 34 - BG.mesaFar.height);
  tile(ctx, BG.mesaMid, cam * 0.2, MESA_G - 16 - BG.mesaMid.height);
  const g = ctx.createLinearGradient(0, MESA_G - 22, 0, H);
  g.addColorStop(0, '#d6915f');
  g.addColorStop(1, '#9b5434');
  ctx.fillStyle = g;
  ctx.fillRect(-50, MESA_G - 22, W + 100, H - MESA_G + 80);
  ctx.fillStyle = '#e8a877';
  ctx.fillRect(-50, MESA_G - 22, W + 100, 4);
  ctx.strokeStyle = 'rgba(80,30,10,0.25)';
  ctx.lineWidth = 2;
  for (let i = Math.floor((cam - 300) / 170); i < (cam + W + 300) / 170; i++) {
    const x = i * 170 - cam + hash(i) * 80;
    const y = MESA_G + 20 + hash(i * 3) * 80;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 40, y + 6);
    ctx.lineTo(x + 70, y + 2);
    ctx.stroke();
    ell(ctx, x + 110, y - 10, 6 + hash(i * 7) * 6, 4, 0, '#b8714a', 2);
  }
  if (dark > 0) {
    ctx.fillStyle = `rgba(30,10,40,${0.35 * dark})`;
    ctx.fillRect(-50, -50, W + 100, H + 100);
  }
}

/* ---------- above the clouds ---------- */

function skyBattleBG(ctx, t, o = {}) {
  sky(ctx, 'battle');
  sunDisc(ctx, 640, 540, 96, '#fff4d6', 'rgba(255,180,110,');
  clouds(ctx, BG.cloudsDusk, t * 30, 230, 700, 0.7, 0.55, 11);
  const hole = o.hole || 0;
  if (hole > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(640, 600, hole, hole * 0.32, 0, 0, TAU);
    ctx.clip();
    const g = ctx.createLinearGradient(0, 480, 0, H);
    g.addColorStop(0, '#d6915f');
    g.addColorStop(1, '#8a4a2c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 400, W, H);
    ctx.globalAlpha = 0.8;
    ctx.drawImage(BG.mesaMid, 0, 0, BG.mesaMid.width, BG.mesaMid.height, 0, 540, BG.mesaMid.width * 0.5, BG.mesaMid.height * 0.5);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  ctx.save();
  if (hole > 0) {
    ctx.beginPath();
    ctx.rect(-50, -50, W + 100, H + 100);
    ctx.ellipse(640, 600, hole * 1.02, hole * 0.33, 0, 0, TAU);
    ctx.clip('evenodd');
  }
  const push = hole * 0.25;
  clouds(ctx, BG.cloudsDusk, t * 60 - push, 600, 380, 1.1, 1, 21);
  clouds(ctx, BG.cloudsDusk, t * 110 + 200 + push, 690, 330, 1.3, 1, 31);
  clouds(ctx, BG.cloudsDusk, t * 170 + 90, 790, 300, 1.5, 1, 41);
  ctx.restore();
}

/* ---------- night rooftop ---------- */

function rooftopBG(ctx, t) {
  sky(ctx, 'night');
  stars(ctx, t);
  moon(ctx, 1010, 140, 60);
  tile(ctx, BG.night[0], 300, 640 - BG.night[0].height);
  tile(ctx, BG.night[1], 700, 660 - BG.night[1].height);
  tile(ctx, BG.night[2], 1100, 700 - BG.night[2].height);
  ctx.fillStyle = '#1c1830';
  ctx.fillRect(-50, 560, W + 100, H);
  ctx.fillStyle = '#3a3358';
  ctx.fillRect(-50, 548, W + 100, 14);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(-50, 548, W + 100, 14);
  ctx.fillStyle = '#141024';
  ctx.fillRect(110, 400, 70, 150);
  ctx.fillRect(100, 380, 90, 30);
  ctx.fillRect(120, 300, 50, 80);
  ctx.fillRect(1160, 470, 60, 80);
}

/* ---------- supermarket ---------- */

function martBG(ctx, t, o = {}) {
  cityBG(ctx, 3900, { night: false });
  const [qx, qy] = shakeXY(t, o.shake || 0);
  ctx.save();
  ctx.translate(qx, qy);
  const x0 = 280;
  const x1 = 1000;
  const top = 240;
  const base = CITY_G - 14;
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(x0, top, x1 - x0, base - top);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(x0, top, x1 - x0, base - top);
  ctx.fillStyle = '#e03a3a';
  ctx.fillRect(x0 - 10, top + 18, x1 - x0 + 20, 62);
  ctx.strokeRect(x0 - 10, top + 18, x1 - x0 + 20, 62);
  bigText(ctx, 'SUPERMART', (x0 + x1) / 2, top + 50, 40, { fill: '#fff', stroke: INK, sw: 6 });
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i % 2 ? '#2a9d55' : '#f4f1e6';
    ctx.fillRect(x0 + i * 80, top + 80, 80, 22);
  }
  ctx.strokeRect(x0, top + 80, x1 - x0, 22);
  const win = (x, w) => {
    ctx.fillStyle = '#fff6cf';
    ctx.fillRect(x, top + 130, w, 200);
    ctx.fillStyle = '#d8c9a0';
    for (let k = 0; k < 3; k++) ctx.fillRect(x + 10, top + 180 + k * 50, w - 20, 8);
    ctx.strokeRect(x, top + 130, w, 200);
  };
  win(x0 + 30, 230);
  win(x1 - 260, 230);
  ctx.save();
  ctx.translate(x0 + 145, top + 230);
  ctx.rotate(-0.05);
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(-90, -70, 180, 140);
  ctx.strokeRect(-90, -70, 180, 140);
  bigText(ctx, 'CABBAGE', 0, -34, 30, { fill: '#e3262f' });
  bigText(ctx, '50% OFF', 0, 8, 38, { fill: '#e3262f' });
  bigText(ctx, 'TODAY UNTIL 7PM', 0, 48, 15, { fill: INK, face: FONT_T });
  drawCabbage(ctx, 70, 52, 16, 0.3);
  ctx.restore();
  ctx.save();
  ctx.translate(x1 - 145, top + 230);
  ctx.rotate(0.04);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-80, -60, 160, 120);
  ctx.strokeRect(-80, -60, 160, 120);
  bigText(ctx, 'CHILI DOGS', 0, -22, 22, { fill: '#b8442c' });
  drawChiliDog(ctx, 0, 22, 1.6);
  ctx.restore();
  const dx = 580;
  const dw = 120;
  ctx.fillStyle = o.closed ? '#6b6377' : '#fffbe8';
  ctx.fillRect(dx, top + 140, dw, base - top - 140);
  ctx.strokeRect(dx, top + 140, dw, base - top - 140);
  ctx.beginPath();
  ctx.moveTo(dx + dw / 2, top + 140);
  ctx.lineTo(dx + dw / 2, base);
  ctx.stroke();
  ctx.fillStyle = o.closed ? '#e3262f' : '#2a9d55';
  ctx.fillRect(dx + 20, top + 200, dw - 40, 30);
  ctx.strokeRect(dx + 20, top + 200, dw - 40, 30);
  bigText(ctx, o.closed ? 'CLOSED' : 'OPEN', dx + dw / 2, top + 216, 16, { fill: '#fff' });
  ctx.fillStyle = '#1b1a22';
  ctx.fillRect(dx - 10, top + 100, dw + 20, 34);
  ctx.strokeRect(dx - 10, top + 100, dw + 20, 34);
  font(ctx, 24, '"JetBrains Mono", ui-monospace, monospace', '700');
  ctx.fillStyle = o.clockRed ? '#ff5050' : '#7dffa0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(o.clock || '18:59:52', dx + dw / 2, top + 118);
  ctx.restore();
}
