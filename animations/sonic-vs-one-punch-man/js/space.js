'use strict';
/* Round 3 sets, all in space: a parallax starfield, Earth, the Moon (from afar and from its surface),
   the asteroid belt, Jupiter (from afar and inside its clouds), Saturn and its rings, and the Sun.
   Background layers sit at a depth d: 1 moves with the action, 0 is pinned to the screen. */

const MOON_G = 620;
const RING_Y = 560;

function starTile(seed, size, n, big) {
  const c = makeCanvas(size, size);
  const g = c.getContext('2d');
  const r = rnd(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * size;
    const y = r() * size;
    g.globalAlpha = 0.3 + r() * 0.7;
    const roll = r();
    g.fillStyle = roll < 0.12 ? '#ffe2b0' : roll < 0.22 ? '#b9d4ff' : '#ffffff';
    const s = (r() < 0.06 ? 2.6 : r() < 0.35 ? 1.6 : 1) * big;
    g.beginPath();
    g.arc(x, y, s * 0.6, 0, TAU);
    g.fill();
  }
  return c;
}

function nebulaSprite(seed) {
  const c = makeCanvas(1600, 900);
  const g = c.getContext('2d');
  const r = rnd(seed);
  const cols = ['120,60,200', '40,90,220', '210,60,150', '60,160,220'];
  for (let i = 0; i < 14; i++) {
    const x = r() * 1600;
    const y = r() * 900;
    const rad = 160 + r() * 360;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    const col = cols[i % cols.length];
    gr.addColorStop(0, `rgba(${col},${0.16 + r() * 0.1})`);
    gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return c;
}

// Lumpy outline of n points around (0, 0), radius r, as a closed path.
function lumpPath(g, r, seed, n = 11, jag = 0.28) {
  g.beginPath();
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const rr2 = r * (1 - jag / 2 + hash(seed + i * 1.37) * jag);
    pts.push([Math.cos(a) * rr2, Math.sin(a) * rr2]);
  }
  const mid = (i) => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
  const m0 = mid(n - 1);
  g.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const m = mid(i);
    g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  g.closePath();
}

function rockSprite(seed) {
  const c = makeCanvas(240, 240);
  const g = c.getContext('2d');
  g.translate(120, 120);
  lumpPath(g, 100, seed, 11, 0.34);
  const gr = g.createRadialGradient(-30, -36, 10, 0, 0, 120);
  gr.addColorStop(0, '#a99a8c');
  gr.addColorStop(0.6, '#776a60');
  gr.addColorStop(1, '#4a4038');
  g.fillStyle = gr;
  g.fill();
  g.save();
  g.clip();
  for (let i = 0; i < 6; i++) {
    const x = (hash(seed + i * 3.1) - 0.5) * 140;
    const y = (hash(seed + i * 5.3) - 0.5) * 140;
    const rr2 = 8 + hash(seed + i * 7.7) * 20;
    g.fillStyle = 'rgba(40,30,26,0.45)';
    g.beginPath();
    g.ellipse(x, y, rr2, rr2 * 0.8, 0, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(220,205,190,0.45)';
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(x, y, rr2, rr2 * 0.8, 0, 0.2, 1.9);
    g.stroke();
  }
  g.fillStyle = 'rgba(20,14,20,0.35)';
  g.beginPath();
  g.ellipse(36, 44, 100, 80, -0.5, 0, TAU);
  g.fill();
  g.restore();
  lumpPath(g, 100, seed, 11, 0.34);
  g.strokeStyle = INK;
  g.lineWidth = 7;
  g.lineJoin = 'round';
  g.stroke();
  return c;
}

function iceSprite(seed) {
  const c = makeCanvas(160, 160);
  const g = c.getContext('2d');
  g.translate(80, 80);
  lumpPath(g, 64, seed, 7, 0.5);
  const gr = g.createLinearGradient(-60, -60, 60, 60);
  gr.addColorStop(0, '#ffffff');
  gr.addColorStop(0.5, '#d6e6f5');
  gr.addColorStop(1, '#9fb4cf');
  g.fillStyle = gr;
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = 'rgba(255,255,255,0.8)';
  g.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.moveTo((hash(seed + i) - 0.5) * 80, -70);
    g.lineTo((hash(seed + i + 9) - 0.5) * 80, 70);
    g.stroke();
  }
  g.restore();
  lumpPath(g, 64, seed, 7, 0.5);
  g.strokeStyle = '#2b3550';
  g.lineWidth = 5;
  g.lineJoin = 'round';
  g.stroke();
  return c;
}

function buildWorld3() {
  BG.starTile = starTile(31, 1024, 900, 0.9);
  BG.starTile2 = starTile(47, 1024, 140, 1.7);
  BG.nebula = nebulaSprite(5);
  BG.rocks = Array.from({ length: 10 }, (_, i) => rockSprite(100 + i * 13));
  BG.ice = Array.from({ length: 6 }, (_, i) => iceSprite(200 + i * 7));
}

/* ---------- layers and sky ---------- */

// Draw fn at depth d under camera c. Content is laid out around the screen centre as seen when the
// camera sits at the anchor (ax, ay); at d = 1 it moves exactly with the action.
function layer(ctx, c, d, fn, ax = 640, ay = 360) {
  ctx.save();
  ctx.translate(W / 2, H / 2);
  if (c.r) ctx.rotate(c.r);
  const z = lerp(1, c.z, d);
  ctx.scale(z, z);
  ctx.translate(-(c.x - ax) * d, -(c.y - ay) * d);
  fn(ctx, z);
  ctx.restore();
}

function starPattern(ctx, c, img, d, alpha = 1) {
  if (!img._pat) img._pat = ctx.createPattern(img, 'repeat');
  layer(ctx, c, d, (g) => {
    g.globalAlpha *= alpha;
    g.fillStyle = img._pat;
    g.fillRect(-4000, -4000, 8000, 8000);
  });
}

function starfield(ctx, c, t, o = {}) {
  ctx.fillStyle = o.bg || '#070615';
  ctx.fillRect(-50, -50, W + 100, H + 100);
  if ((o.neb ?? 1) > 0) {
    layer(ctx, c, 0.02, (g) => {
      g.globalAlpha *= o.neb ?? 1;
      g.drawImage(BG.nebula, -800 + (o.nx || 0), -450 + (o.ny || 0));
    });
  }
  starPattern(ctx, c, BG.starTile, 0.03, o.stars ?? 1);
  starPattern(ctx, c, BG.starTile2, 0.08, o.stars ?? 1);
  layer(ctx, c, 0.05, (g) => {
    for (let i = 0; i < 8; i++) {
      const tw = 0.5 + 0.5 * Math.sin(t * (1.3 + hash(i) * 2) + i * 4);
      star4(g, (hash(i * 3.1) - 0.5) * 1400, (hash(i * 5.7) - 0.5) * 800, 3 + 5 * tw, 0, 'rgba(255,255,255,0.8)');
    }
  });
}

// Streaking stars when the camera moves fast along angle ang. k fades them in.
function starStreaks(ctx, t, ang, k, o = {}) {
  if (k <= 0) return;
  const n = o.n ?? 70;
  const sp = o.speed ?? 3000;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(ang);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const r1 = hash(i * 3.1 + 7);
    const r2 = hash(i * 7.7 + 3);
    const len = (80 + r2 * 340) * (o.len ?? 1);
    const span = 2400;
    const x = span / 2 - (((r1 * span + t * sp * (0.5 + r2)) % span) + span) % span;
    const y = (hash(i * 1.9 + 11) - 0.5) * 1500;
    ctx.globalAlpha = k * (0.25 + 0.6 * r2);
    ctx.strokeStyle = o.col || (i % 5 ? '#ffffff' : '#a9c8ff');
    ctx.lineWidth = 1 + r1 * 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len, y);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- planets ---------- */

function blobPath(ctx, x, y, r, seed, n = 9, jag = 0.5) {
  ctx.save();
  ctx.translate(x, y);
  lumpPath(ctx, r, seed, n, jag);
  ctx.restore();
}

const EARTH_LAND = [[-0.55, -0.25, 0.32, 3], [-0.2, 0.3, 0.28, 8], [0.35, -0.35, 0.3, 14], [0.6, 0.25, 0.22, 21], [0.05, -0.62, 0.18, 27], [-0.75, 0.45, 0.16, 33]];
const EARTH_CLOUD = [[-0.4, -0.05, 0.5, 0.06], [0.2, 0.15, 0.6, 0.05], [0.5, -0.5, 0.4, 0.05], [-0.1, 0.55, 0.45, 0.06], [-0.6, 0.65, 0.3, 0.05], [0.7, -0.15, 0.35, 0.04]];

function earth(ctx, cx, cy, R, t, o = {}) {
  const spin = (o.spin ?? 0.004) * t;
  ctx.save();
  const ga = ctx.createRadialGradient(cx, cy, R * 0.97, cx, cy, R * 1.14);
  ga.addColorStop(0, 'rgba(150,210,255,0.95)');
  ga.addColorStop(0.3, 'rgba(90,160,255,0.4)');
  ga.addColorStop(1, 'rgba(60,120,255,0)');
  ctx.fillStyle = ga;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.14, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.save();
  ctx.clip();
  const go = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
  go.addColorStop(0, '#5fb0ff');
  go.addColorStop(0.6, '#2a6fd0');
  go.addColorStop(1, '#14397e');
  ctx.fillStyle = go;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  for (const [u, v, r, seed] of EARTH_LAND) {
    const uu = ((((u + spin + 1) % 2) + 2) % 2) - 1;
    const sq = Math.sqrt(Math.max(0, 1 - v * v));
    const px = cx + uu * sq * R;
    const k = Math.sqrt(Math.max(0.05, 1 - uu * uu));
    ctx.save();
    ctx.translate(px, cy + v * R);
    ctx.scale(k, 1);
    blobPath(ctx, 0, 0, r * R, seed, 9, 0.55);
    ctx.fillStyle = '#58b25e';
    ctx.fill();
    ctx.lineWidth = Math.max(2, R * 0.006);
    ctx.strokeStyle = '#2f7a3d';
    ctx.stroke();
    blobPath(ctx, -r * R * 0.2, -r * R * 0.1, r * R * 0.45, seed + 4, 7, 0.6);
    ctx.fillStyle = '#c9b26b';
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 0.75;
  for (const [u, v, w, h] of EARTH_CLOUD) {
    const uu = ((((u + spin * 1.6 + 1) % 2) + 2) % 2) - 1;
    ell(ctx, cx + uu * R, cy + v * R, w * R * Math.sqrt(Math.max(0.05, 1 - uu * uu)), h * R, -0.08, '#ffffff', 0);
  }
  ctx.globalAlpha = 1;
  const sh = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  const sa = o.shade ?? 0.6;
  sh.addColorStop(0, 'rgba(5,10,30,0)');
  sh.addColorStop(0.55, 'rgba(5,10,30,0)');
  sh.addColorStop(1, `rgba(5,10,30,${sa})`);
  ctx.fillStyle = sh;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  if (o.hole) {
    // the cloud hole a missed punch blows over the ocean
    ctx.globalAlpha = 1;
    const [hx, hy, hr] = [cx + o.hole[0] * R, cy + o.hole[1] * R, o.hole[2] * R];
    ell(ctx, hx, hy, hr * 1.15, hr * 0.52, 0, 'rgba(255,255,255,0.85)', 0);
    ell(ctx, hx, hy, hr, hr * 0.45, 0, '#2a6fd0', 0);
    ctx.strokeStyle = 'rgba(200,225,255,0.8)';
    ctx.lineWidth = Math.max(2, R * 0.006);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(hx, hy, hr * (1.25 + i * 0.12), hr * (0.56 + i * 0.05), 0, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.lineWidth = Math.max(3, R * 0.004);
  ctx.strokeStyle = 'rgba(200,235,255,0.9)';
  ctx.stroke();
  ctx.restore();
}

function moonDisc(ctx, cx, cy, R, o = {}) {
  ctx.save();
  const gl = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.25);
  gl.addColorStop(0, 'rgba(220,220,240,0.35)');
  gl.addColorStop(1, 'rgba(220,220,240,0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.25, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  g.addColorStop(0, '#f1eef5');
  g.addColorStop(0.7, '#bdb8c6');
  g.addColorStop(1, '#8a8597');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 12; i++) {
    const x = cx + (hash(i * 2.3) - 0.5) * R * 1.6;
    const y = cy + (hash(i * 4.1) - 0.5) * R * 1.6;
    const r = R * (0.05 + hash(i * 6.7) * 0.14);
    ell(ctx, x, y, r, r * 0.9, 0, 'rgba(110,104,124,0.45)', 0);
  }
  if (o.canyon) {
    ctx.strokeStyle = '#3d384a';
    ctx.lineWidth = R * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.9, cy + R * 0.1);
    ctx.quadraticCurveTo(cx, cy + R * 0.05 * o.canyon, cx + R * 0.95 * o.canyon, cy - R * 0.2);
    ctx.stroke();
  }
  const sh = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
  sh.addColorStop(0, 'rgba(10,8,25,0)');
  sh.addColorStop(0.6, 'rgba(10,8,25,0)');
  sh.addColorStop(1, 'rgba(10,8,25,0.55)');
  ctx.fillStyle = sh;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  strokeNow(ctx, Math.max(3, R * 0.02), INK);
  ctx.restore();
}

// Standing on the Moon: black sky, Earth hanging over the horizon, grey ground at y = MOON_G.
function moonSurface(ctx, c, t, o = {}) {
  starfield(ctx, c, t, { neb: 0.45 });
  layer(ctx, c, 0.05, (g) => earth(g, o.ex ?? 330, o.ey ?? -210, 74, t, { spin: 0.01 }));
  layer(ctx, c, 0.4, (g) => {
    g.beginPath();
    g.moveTo(-2400, 170);
    for (let x = -2400; x <= 2400; x += 80) g.lineTo(x, 150 - Math.abs(noise(x * 0.004 + 3)) * 90 - hash(Math.floor(x / 80)) * 18);
    g.lineTo(2400, 1200);
    g.lineTo(-2400, 1200);
    g.closePath();
    g.fillStyle = '#5c5868';
    g.fill();
    strokeNow(g, 3, INK);
  });
  layer(ctx, c, 0.7, (g) => {
    g.beginPath();
    g.moveTo(-2600, 230);
    for (let x = -2600; x <= 2600; x += 60) g.lineTo(x, 214 - Math.abs(noise(x * 0.006 + 9)) * 60);
    g.lineTo(2600, 1200);
    g.lineTo(-2600, 1200);
    g.closePath();
    g.fillStyle = '#7f7a8c';
    g.fill();
    strokeNow(g, 3, INK);
  });
  ctx.save();
  camApply(ctx, c);
  const x0 = c.x - 2600;
  const x1 = c.x + 2600;
  const g = ctx.createLinearGradient(0, MOON_G, 0, MOON_G + 600);
  g.addColorStop(0, '#b9b5c4');
  g.addColorStop(1, '#6d687b');
  ctx.fillStyle = g;
  ctx.fillRect(x0, MOON_G, x1 - x0, 2400);
  ctx.beginPath();
  ctx.moveTo(x0, MOON_G);
  ctx.lineTo(x1, MOON_G);
  strokeNow(ctx, 4, INK);
  const k0 = Math.floor(x0 / 360);
  for (let k = k0; k < k0 + 16; k++) {
    const x = k * 360 + hash(k) * 160;
    const y = MOON_G + 30 + hash(k * 3) * 120;
    const r = 40 + hash(k * 5) * 90;
    ell(ctx, x, y, r, r * 0.2, 0, 'rgba(90,84,104,0.55)', 0);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.2, 0, 0.1, Math.PI - 0.1);
    strokeNow(ctx, 2.5, 'rgba(235,232,245,0.7)');
    if (hash(k * 7) < 0.5) poly(ctx, [[x + r * 1.2, MOON_G + 8], [x + r * 1.25 + 10, MOON_G - 12], [x + r * 1.3 + 30, MOON_G - 8], [x + r * 1.3 + 36, MOON_G + 8]], '#9a95a8', 2.5);
  }
  if (o.trench) {
    const [ta, tb, tk] = o.trench;
    ctx.fillStyle = '#58536a';
    ctx.beginPath();
    ctx.moveTo(ta, MOON_G);
    ctx.lineTo(lerp(ta, tb, tk), MOON_G);
    ctx.lineTo(lerp(ta, tb, tk) - 20, MOON_G + 18);
    ctx.lineTo(ta + 20, MOON_G + 22);
    ctx.closePath();
    ctx.fill();
    strokeNow(ctx, 3, INK);
  }
  if (o.canyon) {
    // the punch that missed: a canyon ripped across the plain toward the horizon
    const [cx0, k] = o.canyon;
    const x1 = cx0 + 2400 * k;
    ctx.beginPath();
    ctx.moveTo(cx0 - 10, MOON_G);
    for (let x = cx0; x <= x1; x += 40) ctx.lineTo(x, MOON_G + 70 + Math.min(1, (x - cx0) / 200) * 70 + noise(x * 0.03) * 22);
    ctx.lineTo(x1 + 20, MOON_G);
    ctx.closePath();
    ctx.fillStyle = '#25212f';
    ctx.fill();
    strokeNow(ctx, 3, INK);
    ctx.beginPath();
    for (let x = cx0; x <= x1; x += 40) ctx.lineTo(x, MOON_G + 14 + noise(x * 0.05 + 4) * 6);
    strokeNow(ctx, 2.5, 'rgba(210,205,225,0.5)');
  }
  if (o.crater) {
    const [cx0, w, k] = o.crater;
    ell(ctx, cx0, MOON_G + 12, w * k, w * 0.22 * k, 0, '#5e5970', 3);
    ctx.beginPath();
    ctx.ellipse(cx0, MOON_G + 12, w * k, w * 0.22 * k, 0, 0.15, Math.PI - 0.15);
    strokeNow(ctx, 3, '#d9d5e4');
  }
  ctx.restore();
}

/* ---------- asteroids ---------- */

function rock(ctx, x, y, r, i, rot = 0, alpha = 1) {
  const img = BG.rocks[((i % BG.rocks.length) + BG.rocks.length) % BG.rocks.length];
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.drawImage(img, -r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
  ctx.restore();
}

// Drifting rocks in parallax layers around the camera. o.fg adds dark foreground rocks that whip past.
function asteroidField(ctx, c, t, o = {}) {
  starfield(ctx, c, t, { neb: 1, nx: 300 });
  layer(ctx, c, 0.04, (g) => {
    const sx = o.sunX ?? 520;
    const sy = o.sunY ?? -260;
    const gl = g.createRadialGradient(sx, sy, 4, sx, sy, 160);
    gl.addColorStop(0, 'rgba(255,250,220,0.95)');
    gl.addColorStop(0.2, 'rgba(255,220,140,0.35)');
    gl.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = gl;
    g.fillRect(sx - 160, sy - 160, 320, 320);
  });
  const layers = [
    { d: 0.2, sp: 260, sz: 16, a: 0.4, seed: 11 },
    { d: 0.45, sp: 340, sz: 34, a: 0.7, seed: 23 },
    { d: 0.75, sp: 520, sz: 60, a: 1, seed: 37 },
  ];
  for (const L of layers) asteroidLayer(ctx, c, t, L);
  if (o.fg) asteroidLayer(ctx, c, t, { d: 1.6, sp: 1100, sz: 70, a: 1, seed: 51, dark: true });
}

function asteroidLayer(ctx, c, t, L) {
  layer(ctx, c, L.d, (g, z) => {
    const midX = (c.x - 640) * L.d;
    const midY = (c.y - 360) * L.d;
    const half = W / z / 2 + 500;
    const k0 = Math.floor((midX - half) / L.sp);
    const k1 = Math.ceil((midX + half) / L.sp);
    for (let k = k0; k <= k1; k++) {
      for (let row = -2; row <= 2; row++) {
        const h = hash(k * 7.1 + row * 13.3 + L.seed);
        if (h < 0.45) continue;
        const x = k * L.sp + hash(k * 3.3 + row + L.seed) * L.sp * 0.7;
        const y = midY + row * 300 + (hash(k * 5.9 + row * 2 + L.seed) - 0.5) * 220 - midY * 0.0;
        const r = L.sz * (0.5 + h);
        const rot = t * (hash(k + row * 9 + L.seed) - 0.5) * 0.8 + h * 6;
        if (L.dark) {
          if (h < 0.75 || Math.abs(row) > 1) continue;
          g.save();
          g.translate(x, y);
          g.rotate(rot);
          lumpPath(g, r, k * 3 + row, 10, 0.3);
          g.fillStyle = '#2a2026';
          g.fill();
          g.lineWidth = 6;
          g.strokeStyle = '#0d0a10';
          g.stroke();
          g.restore();
        } else rock(g, x, y, r, k * 5 + row * 3, rot, L.a);
      }
    }
  });
}

/* ---------- Jupiter ---------- */

const JUP_BANDS = [
  [-1.0, '#e8dcc6'], [-0.84, '#c99d70'], [-0.72, '#efe4cf'], [-0.58, '#b9805a'], [-0.42, '#f3e8d3'], [-0.27, '#cd915f'],
  [-0.1, '#f6ecda'], [0.08, '#b5704a'], [0.24, '#ecdcc1'], [0.4, '#c88f63'], [0.56, '#f0e3cb'], [0.72, '#bb8a66'], [0.88, '#e4d4b8'],
];

// o.spot: where the Great Red Spot sits (fraction of R); o.hole 0..1: the sneeze punching through the clouds.
function jupiter(ctx, cx, cy, R, t, o = {}) {
  ctx.save();
  const gl = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.1);
  gl.addColorStop(0, 'rgba(255,220,170,0.4)');
  gl.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.1, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.save();
  ctx.clip();
  const step = R / 18;
  JUP_BANDS.forEach(([v, col], i) => {
    const y0 = cy + v * R;
    ctx.beginPath();
    ctx.moveTo(cx - R - step, cy + R + 10);
    for (let x = cx - R - step; x <= cx + R + step; x += step) {
      const wob = Math.sin((x - cx) / R * 8 + t * 0.25 + i * 1.7) * R * 0.012 + Math.sin((x - cx) / R * 23 + i) * R * 0.005;
      ctx.lineTo(x, y0 + wob);
    }
    ctx.lineTo(cx + R + step, cy + R + 10);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  });
  const [su, sv] = o.spot || [0.28, 0.22];
  const hole = o.hole || 0;
  const spx = cx + su * R;
  const spy = cy + sv * R;
  if (hole < 1) {
    ctx.globalAlpha = 1 - hole;
    ell(ctx, spx, spy, R * 0.17, R * 0.095, 0, '#c4553c', 0);
    ell(ctx, spx, spy, R * 0.11, R * 0.058, 0, '#e07b58', 0);
    ell(ctx, spx - R * 0.02, spy - R * 0.01, R * 0.05, R * 0.025, 0, '#f2a27a', 0);
    ctx.globalAlpha = 1;
  }
  if (hole > 0) {
    // a clean channel blown through the cloud decks, deeper layers showing through
    const hr = R * 0.42 * E.out3(Math.min(1, hole * 1.3));
    const g = ctx.createRadialGradient(spx, spy, 0, spx, spy, hr);
    g.addColorStop(0, '#3b1d12');
    g.addColorStop(0.55, '#7a3a1e');
    g.addColorStop(0.85, '#c07a4a');
    g.addColorStop(1, 'rgba(232,210,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(spx, spy, hr, hr * 0.55, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,215,0.85)';
    ctx.lineWidth = Math.max(2, R * 0.008);
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(spx, spy, hr * (0.7 + i * 0.08), hr * (0.38 + i * 0.045), 0, -2.6 + i * 0.3, -0.5 + i * 0.2);
      ctx.stroke();
    }
  }
  const ld = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.3, cx, cy, R);
  ld.addColorStop(0, 'rgba(60,30,10,0)');
  ld.addColorStop(0.75, 'rgba(60,30,10,0.08)');
  ld.addColorStop(1, 'rgba(40,20,10,0.55)');
  ctx.fillStyle = ld;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  strokeNow(ctx, Math.max(3, R * 0.006), '#2b1a14');
  ctx.restore();
}

// Inside Jupiter's clouds: an orange haze with cloud decks drifting at several depths.
// o.flash 0..1 lights everything up; o.blast clears a cone of cloud (sneeze), [x, y, ang, k].
function jupiterClouds(ctx, c, t, o = {}) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#2a120a');
  sky.addColorStop(0.45, '#8a4a26');
  sky.addColorStop(1, '#e7b47a');
  ctx.fillStyle = sky;
  ctx.fillRect(-50, -50, W + 100, H + 100);
  const decks = [
    { d: 0.15, y: -60, col: '#a2603a', hi: '#c27a4c', sz: 70, sp: 30 },
    { d: 0.35, y: 60, col: '#c78350', hi: '#e2a46c', sz: 90, sp: 55 },
    { d: 0.6, y: 170, col: '#e0a76e', hi: '#f6cf98', sz: 120, sp: 80 },
    { d: 0.95, y: 300, col: '#efc28a', hi: '#fde3b8', sz: 160, sp: 120 },
  ];
  for (const D of decks) {
    layer(ctx, c, D.d, (g, z) => {
      const midX = (c.x - 640) * D.d;
      const half = W / z / 2 + 400;
      const drift = t * D.sp;
      const x0 = Math.floor((midX - half + drift) / D.sz) * D.sz - drift;
      g.beginPath();
      g.moveTo(x0, D.y + 1600);
      for (let x = x0; x < midX + half + D.sz; x += D.sz) {
        const k = Math.round((x + drift) / D.sz);
        const h = D.sz * (0.35 + hash(k * 3.7 + D.d * 10) * 0.5);
        g.lineTo(x, D.y);
        g.quadraticCurveTo(x + D.sz / 2, D.y - h, x + D.sz, D.y);
      }
      g.lineTo(midX + half + D.sz, D.y + 1600);
      g.closePath();
      g.fillStyle = D.col;
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = D.hi;
      g.globalAlpha = 0.6;
      g.fillRect(midX - half - D.sz, D.y - D.sz, half * 2 + D.sz * 2, D.sz * 0.45);
      g.restore();
      g.strokeStyle = 'rgba(60,24,10,0.5)';
      g.lineWidth = 3;
      g.stroke();
    });
  }
  if (o.flash > 0) flash(ctx, o.flash * 0.75, '#fff3dc');
}

function lightning(ctx, x0, y0, x1, y1, seed, k) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pts = [[x0, y0]];
  for (let i = 1; i < 9; i++) {
    const u = i / 9;
    pts.push([lerp(x0, x1, u) + (hash(seed + i) - 0.5) * 80, lerp(y0, y1, u) + (hash(seed + i * 3) - 0.5) * 30]);
  }
  pts.push([x1, y1]);
  for (const [w, col] of [[14, 'rgba(255,220,150,0.35)'], [5, 'rgba(255,250,230,0.95)']]) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineWidth = w;
    ctx.strokeStyle = col;
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- Saturn ---------- */

function saturnRings(ctx, cx, cy, R, tilt, half) {
  // half: -1 draws the back half (above centre), +1 the front half
  ctx.save();
  ctx.beginPath();
  if (half < 0) ctx.rect(cx - R * 3, cy - R * 3, R * 6, R * 3);
  else ctx.rect(cx - R * 3, cy, R * 6, R * 3);
  ctx.clip();
  const bands = [[2.25, 'rgba(225,205,160,0.5)', 0.12], [2.05, 'rgba(240,222,180,0.9)', 0.16], [1.82, 'rgba(10,8,20,0.6)', 0.03], [1.74, 'rgba(214,190,140,0.95)', 0.22], [1.45, 'rgba(180,160,120,0.6)', 0.14]];
  for (const [rr2, col, w] of bands) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * rr2, R * rr2 * tilt, -0.12, 0, TAU);
    ctx.lineWidth = R * w;
    ctx.strokeStyle = col;
    ctx.stroke();
  }
  ctx.restore();
}

function saturn(ctx, cx, cy, R, t) {
  saturnRings(ctx, cx, cy, R, 0.28, -1);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.save();
  ctx.clip();
  const cols = ['#efdcae', '#d9b97f', '#f3e2b8', '#c9a46c', '#efd9a8', '#d6b37a', '#f1e0b6'];
  cols.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(cx - R, cy - R + (i * 2 * R) / cols.length, R * 2, (2 * R) / cols.length + 1);
  });
  const ld = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R);
  ld.addColorStop(0, 'rgba(60,40,10,0)');
  ld.addColorStop(1, 'rgba(50,30,10,0.55)');
  ctx.fillStyle = ld;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  strokeNow(ctx, Math.max(2, R * 0.01), '#2b2014');
  ctx.restore();
  saturnRings(ctx, cx, cy, R, 0.28, 1);
}

// Standing on Saturn's rings: Saturn fills the sky, the ring is a road of ice at y = RING_Y.
// o.lane: [x0, x1, k] a channel ploughed along the ring; o.gone: [x0, x1] a section lifted away.
function ringPlane(ctx, c, t, o = {}) {
  starfield(ctx, c, t, { neb: 0.6, nx: -200 });
  layer(ctx, c, 0.06, (g) => saturn(g, o.sx ?? -120, o.sy ?? -140, 330, t));
  layer(ctx, c, 0.35, (g, z) => {
    const midX = (c.x - 640) * 0.35;
    const half = W / z / 2 + 300;
    for (let k = Math.floor((midX - half) / 90); k < (midX + half) / 90; k++) {
      const h = hash(k * 1.7 + 5);
      if (h < 0.3) continue;
      const img = BG.ice[k % BG.ice.length < 0 ? 0 : k % BG.ice.length];
      const r = 10 + h * 18;
      g.globalAlpha = 0.65;
      g.drawImage(img, k * 90 + h * 50 - r, 150 + hash(k * 3.3) * 60 - r, r * 2, r * 2);
    }
    g.globalAlpha = 1;
  });
  ctx.save();
  camApply(ctx, c);
  const x0 = c.x - 2600;
  const x1 = c.x + 2600;
  const stripes = [[0, '#f0e1bd'], [26, '#d9c093'], [50, '#efdcb2'], [86, '#c9ab78'], [120, '#e6d1a5'], [170, '#bfa071'], [230, '#dcc59b']];
  const gone = o.gone;
  const drawRoad = () => {
    for (let i = 0; i < stripes.length; i++) {
      const [dy, col] = stripes[i];
      const dy2 = i + 1 < stripes.length ? stripes[i + 1][0] : 600;
      ctx.fillStyle = col;
      ctx.fillRect(x0, RING_Y + dy, x1 - x0, dy2 - dy + 1);
    }
  };
  ctx.save();
  if (gone) {
    ctx.beginPath();
    ctx.rect(x0, RING_Y - 50, gone[0] - x0, 2000);
    ctx.rect(gone[1], RING_Y - 50, x1 - gone[1], 2000);
    ctx.clip();
  }
  drawRoad();
  ctx.beginPath();
  ctx.moveTo(x0, RING_Y);
  ctx.lineTo(x1, RING_Y);
  strokeNow(ctx, 4, '#3a2f20');
  const k0 = Math.floor(x0 / 140);
  for (let k = k0; k < k0 + 40; k++) {
    const h = hash(k * 2.9 + 1);
    if (h < 0.35) continue;
    const img = BG.ice[((k % BG.ice.length) + BG.ice.length) % BG.ice.length];
    const r = 14 + h * 26;
    ctx.drawImage(img, k * 140 + h * 60 - r, RING_Y - r * 0.9 + hash(k * 4.1) * 160, r * 2, r * 2);
  }
  if (o.lane) {
    const [la, lb, lk] = o.lane;
    ctx.fillStyle = 'rgba(12,10,24,0.9)';
    ctx.beginPath();
    ctx.moveTo(la, RING_Y + 54);
    ctx.lineTo(lerp(la, lb, lk), RING_Y + 50);
    ctx.lineTo(lerp(la, lb, lk), RING_Y + 96);
    ctx.lineTo(la, RING_Y + 92);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

/* ---------- the Sun ---------- */

function sunBody(ctx, cx, cy, R, t) {
  ctx.save();
  const co = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 2.3);
  co.addColorStop(0, 'rgba(255,214,120,0.75)');
  co.addColorStop(0.3, 'rgba(255,160,60,0.28)');
  co.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = co;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 2.3, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * TAU + t * 0.04;
    const len = R * (1.25 + 0.3 * noise(t * 0.8 + i * 2.1));
    ctx.fillStyle = 'rgba(255,190,90,0.18)';
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a - 0.06) * R, cy + Math.sin(a - 0.06) * R);
    ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    ctx.lineTo(cx + Math.cos(a + 0.06) * R, cy + Math.sin(a + 0.06) * R);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  const g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.05, cx, cy, R);
  g.addColorStop(0, '#fffdf0');
  g.addColorStop(0.5, '#ffe27a');
  g.addColorStop(0.85, '#ffab36');
  g.addColorStop(1, '#ff7a1a');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 60; i++) {
    const x = cx + (hash(i * 2.1) - 0.5) * R * 1.9;
    const y = cy + (hash(i * 3.7) - 0.5) * R * 1.9;
    circle(ctx, x + Math.sin(t + i) * R * 0.01, y, R * (0.03 + hash(i * 5.3) * 0.05), i % 3 ? '#ff9a2a' : '#ffffff');
  }
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const a = hash(i * 9.1) * TAU;
    const h = R * (0.12 + 0.08 * Math.sin(t * 0.7 + i));
    const px = cx + Math.cos(a) * R;
    const py = cy + Math.sin(a) * R;
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    ctx.beginPath();
    ctx.moveTo(px - tx * R * 0.06, py - ty * R * 0.06);
    ctx.bezierCurveTo(px - tx * R * 0.08 + Math.cos(a) * h * 2, py - ty * R * 0.08 + Math.sin(a) * h * 2, px + tx * R * 0.08 + Math.cos(a) * h * 2, py + ty * R * 0.08 + Math.sin(a) * h * 2, px + tx * R * 0.06, py + ty * R * 0.06);
    ctx.lineWidth = R * 0.025;
    ctx.strokeStyle = 'rgba(255,110,40,0.85)';
    ctx.stroke();
  }
  ctx.restore();
}

// Near the Sun: a hot sky with the Sun's face behind the fighters.
function sunSky(ctx, c, t, o = {}) {
  starfield(ctx, c, t, { neb: 0.4, stars: 0.5, bg: '#140805' });
  layer(ctx, c, 0.08, (g) => sunBody(g, o.sx ?? 200, o.sy ?? 120, o.R ?? 520, t));
  const g = ctx.createRadialGradient(W * 0.4, H * 0.45, 100, W * 0.5, H * 0.5, 900);
  g.addColorStop(0, 'rgba(255,170,60,0.12)');
  g.addColorStop(1, 'rgba(255,90,20,0.22)');
  ctx.fillStyle = g;
  ctx.fillRect(-50, -50, W + 100, H + 100);
}

/* ---------- props ---------- */

function satellite(ctx, x, y, s, rot, crush = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s * (1 - crush * 0.5));
  for (const sx of [-1, 1]) {
    ctx.save();
    ctx.translate(sx * 70, 0);
    ctx.rotate(sx * crush * 0.6);
    ctx.fillStyle = '#28408f';
    ctx.fillRect(-45, -16, 90, 32);
    ctx.strokeStyle = '#8fb0ff';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 18, -16);
      ctx.lineTo(i * 18, 16);
      ctx.stroke();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(-45, -16, 90, 32);
    ctx.restore();
  }
  ctx.beginPath();
  rr(ctx, -26, -24, 52, 48, 6);
  ctx.fillStyle = '#d8d2c2';
  ctx.fill();
  strokeNow(ctx, 3.5, INK);
  ctx.fillStyle = '#e8b13a';
  ctx.fillRect(-20, -18, 40, 12);
  ell(ctx, 0, -36, 14, 6, 0, '#eeeeee', 2.5);
  ctx.restore();
}

// Chunks flung straight out with no gravity; since in seconds.
function spaceDebris(ctx, x, y, since, o = {}) {
  if (since < 0 || since > (o.life ?? 2.4)) return;
  const n = o.n ?? 12;
  const seed = o.seed ?? 1;
  const k = 1 - since / (o.life ?? 2.4);
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? 0) + (hash(seed + i) - 0.5) * (o.spread ?? TAU);
    const v = (o.v ?? 380) * (0.35 + hash(seed + i * 3) * 0.9);
    const px = x + Math.cos(a) * v * since;
    const py = y + Math.sin(a) * v * since;
    const r = (o.size ?? 10) * (0.5 + hash(seed + i * 7));
    ctx.save();
    ctx.globalAlpha *= Math.min(1, k * 2);
    ctx.translate(px, py);
    ctx.rotate(since * 6 * (hash(seed + i * 11) - 0.5) + i);
    if (o.ice) {
      const img = BG.ice[i % BG.ice.length];
      ctx.drawImage(img, -r, -r, r * 2, r * 2);
    } else poly(ctx, [[-r, -r * 0.6], [r * 0.4, -r], [r, r * 0.2], [-r * 0.2, r * 0.8]], o.col || '#8a7c70', 2.2);
    ctx.restore();
  }
}
