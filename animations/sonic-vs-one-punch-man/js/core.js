'use strict';
/* Stage constants, math, easing, and the text and effect helpers every scene shares.
   Everything here is a pure function of its arguments so any frame can be drawn at any time. */

const W = 1280;
const H = 720;
const TAU = Math.PI * 2;
const INK = '#17131f';
const FONT_D = '"Dela Gothic One", "Arial Black", Impact, sans-serif';
const FONT_T = '"Comic Neue", "Comic Sans MS", "Chalkboard SE", "Trebuchet MS", sans-serif';
const REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));

const E = {
  lin: (t) => t,
  in: (t) => t * t,
  out: (t) => 1 - (1 - t) * (1 - t),
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  in3: (t) => t * t * t,
  out3: (t) => 1 - Math.pow(1 - t, 3),
  back: (t) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
};

function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function noise(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u) * 2 - 1;
}

// Piecewise keyframes: [[time, value, easing?], ...]. The easing on a key shapes the segment ending there.
function kf(t, keys, ef = E.inOut) {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < n; i++) {
    const k = keys[i];
    if (t < k[0]) {
      const p = keys[i - 1];
      return lerp(p[1], k[1], (k[2] || ef)((t - p[0]) / (k[0] - p[0])));
    }
  }
  return keys[n - 1][1];
}

// Area under a piecewise-linear speed curve from its first key to t: turns speed keys into distance.
function integ(keys, t) {
  let d = 0;
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1];
    const [t1, v1] = keys[i];
    if (t <= t0) return d;
    const te = Math.min(t, t1);
    const ve = lerp(v0, v1, (te - t0) / (t1 - t0));
    d += ((v0 + ve) / 2) * (te - t0);
    if (t <= t1) return d;
  }
  const last = keys[keys.length - 1];
  return d + last[1] * (t - last[0]);
}

// 0 outside [a, b], ramps to 1 over r seconds at both ends.
function env(t, a, b, r = 0.3) {
  if (t <= a || t >= b) return 0;
  return Math.min(1, (t - a) / r, (b - t) / r);
}

// Short arc 0 -> peak -> 0 over [a, b].
function hop(t, a, b, h) {
  const u = prog(t, a, b);
  return u > 0 && u < 1 ? Math.sin(Math.PI * u) * h : 0;
}

function blinkAt(t, period = 3.2, seed = 1) {
  const ph = (t + hash(seed) * period) % period;
  return ph < 0.13 ? 1 : 0;
}

const _rgbCache = new Map();
function rgb(h) {
  let v = _rgbCache.get(h);
  if (!v) {
    const n = parseInt(h.slice(1), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    _rgbCache.set(h, v);
  }
  return v;
}

// Blend two hex colours. Returns a hex input unchanged at the ends so results can be blended again there.
function mix(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const A = rgb(a);
  const B = rgb(b);
  const c = (i) => Math.round(lerp(A[i], B[i], t)).toString(16).padStart(2, '0');
  return '#' + c(0) + c(1) + c(2);
}

function rgba(h, a) {
  const c = rgb(h);
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

function shakeXY(t, amp) {
  if (amp <= 0.01) return [0, 0];
  const a = REDUCED ? amp * 0.15 : amp;
  return [noise(t * 31) * a, noise(t * 37 + 50) * a];
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/* ---------- shapes ---------- */

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function star4(ctx, x, y, r, rot, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const rr2 = i % 2 ? r * 0.28 : r;
    ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

/* ---------- text ---------- */

function font(ctx, size, face = FONT_T, weight = '700') {
  ctx.font = `${weight} ${size}px ${face}`;
}

function wrapLines(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (cur && ctx.measureText(test).width > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Display lettering. o: fill, stroke, sw, rot, scale, alpha, maxW, face, shadow.
function bigText(ctx, s, x, y, size, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  const sc = o.scale ?? 1;
  ctx.scale(sc, sc);
  ctx.globalAlpha *= o.alpha ?? 1;
  const face = o.face || FONT_D;
  const weight = face === FONT_D ? '400' : '700';
  let sz = size;
  font(ctx, sz, face, weight);
  if (o.maxW) {
    const w = ctx.measureText(s).width;
    if (w > o.maxW) {
      sz *= o.maxW / w;
      font(ctx, sz, face, weight);
    }
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const sw = o.sw ?? sz * 0.14;
  if (o.shadow) {
    ctx.fillStyle = o.shadow;
    ctx.strokeStyle = o.shadow;
    ctx.lineWidth = sw;
    if (o.stroke) ctx.strokeText(s, sz * 0.05, sz * 0.07);
    ctx.fillText(s, sz * 0.05, sz * 0.07);
  }
  if (o.stroke) {
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = sw;
    ctx.strokeText(s, 0, 0);
  }
  ctx.fillStyle = o.fill || '#fff';
  ctx.fillText(s, 0, 0);
  ctx.restore();
}

// Scale and alpha for lettering that slams onto the screen p seconds after it starts.
function slam(p) {
  if (p < 0) return null;
  return { s: p < 0.3 ? lerp(2.4, 1, E.out3(p / 0.3)) : 1 + Math.min(p - 0.3, 6) * 0.006, a: clamp(p / 0.1) };
}

// Comic sound-effect lettering that pops in at t0 and fades out after dur.
function sfx(ctx, s, x, y, size, lt, t0, dur, o = {}) {
  if (lt < t0 || lt > t0 + dur) return;
  const p = lt - t0;
  const sc = p < 0.16 ? lerp(0.3, 1.18, p / 0.16) : p < 0.28 ? lerp(1.18, 1, (p - 0.16) / 0.12) : 1 + (p - 0.28) * 0.05;
  const [jx, jy] = shakeXY(lt * 2, p < 0.5 ? 4 : 1);
  bigText(ctx, s, x + jx, y + jy, size, {
    fill: o.fill || '#ffd21f',
    stroke: o.stroke || INK,
    sw: o.sw,
    rot: o.rot ?? -0.08,
    scale: sc,
    alpha: prog(t0 + dur - lt, 0, 0.25),
    shadow: o.shadow === undefined ? INK : o.shadow,
    maxW: o.maxW,
  });
}

/* ---------- speech ---------- */

const BUB = {
  sonic: { edge: '#1d4ed8', fill: '#ffffff', ink: '#0f1a3d' },
  saitama: { edge: INK, fill: '#ffffff', ink: INK },
  crab: { edge: '#c81e28', fill: '#fff3ee', ink: '#5c0b10' },
};

function bubblePath(ctx, x, y, w, h, r, tx, ax, ay) {
  const tw = 13;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(tx + tw, y + h);
  ctx.lineTo(ax, ay);
  ctx.lineTo(tx - tw, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBubble(ctx, text, ax, ay, o) {
  const st = BUB[o.who] || BUB.saitama;
  const shout = !!o.shout;
  const size = shout ? 32 : 27;
  ctx.save();
  if (shout) font(ctx, size, FONT_D, '400');
  else font(ctx, size, FONT_T, '700');
  const lines = wrapLines(ctx, text, shout ? 520 : 390);
  const lh = size * 1.2;
  let tw = 0;
  for (const l of lines) tw = Math.max(tw, ctx.measureText(l).width);
  const pw = shout ? 34 : 22;
  const ph = shout ? 26 : 15;
  const bw = tw + pw * 2;
  const bh = lines.length * lh + ph * 2;
  const bx = clamp(ax - bw / 2, 16, W - 16 - bw);
  const by = Math.max(12, ay - 48 - bh);
  const tx = clamp(ax, bx + 30, bx + bw - 30);
  const tipY = Math.max(ay - 6, by + bh + 12);
  ctx.globalAlpha *= o.alpha;
  const sc = 0.55 + 0.45 * o.k;
  ctx.translate(tx, by + bh);
  ctx.scale(sc, sc);
  ctx.translate(-tx, -(by + bh));
  ctx.lineJoin = 'round';
  if (o.think) {
    ctx.beginPath();
    rr(ctx, bx, by, bw, bh, Math.min(bh / 2, 30));
    ctx.fillStyle = st.fill;
    ctx.fill();
    ctx.setLineDash([2, 7]);
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = st.edge;
    ctx.stroke();
    ctx.setLineDash([]);
    const steps = [0.35, 0.62, 0.85];
    steps.forEach((f, i) => {
      const cx = lerp(tx, ax, f);
      const cy = lerp(by + bh + 6, tipY, f);
      ctx.beginPath();
      ctx.arc(cx, cy, 7 - i * 2, 0, TAU);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  } else if (shout) {
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    ctx.beginPath();
    ctx.moveTo(tx - 16, cy + bh * 0.3);
    ctx.lineTo(ax, tipY);
    ctx.lineTo(tx + 16, cy + bh * 0.3);
    ctx.closePath();
    ctx.fillStyle = st.fill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = st.edge;
    ctx.stroke();
    ctx.beginPath();
    const n = 22;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * TAU;
      const f = i % 2 ? 1 : 1.16 + hash(i * 3.3 + text.length) * 0.1;
      ctx.lineTo(cx + Math.cos(a) * (bw / 2 + 8) * f, cy + Math.sin(a) * (bh / 2 + 8) * f);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    bubblePath(ctx, bx, by, bw, bh, 18, tx, ax, tipY);
    ctx.fillStyle = st.fill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = st.edge;
    ctx.stroke();
  }
  ctx.fillStyle = shout ? st.edge : st.ink;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  let left = o.chars;
  lines.forEach((l, i) => {
    if (left <= 0) return;
    const shown = l.slice(0, Math.max(0, Math.floor(left)));
    left -= l.length + 1;
    const lx = bx + pw + (tw - ctx.measureText(l).width) / 2;
    ctx.fillText(shown, lx, by + ph + i * lh + 2);
  });
  ctx.restore();
}

function drawCaption(ctx, text, o) {
  ctx.save();
  font(ctx, 25, FONT_T, '700');
  const lines = wrapLines(ctx, text, 620);
  let tw = 0;
  for (const l of lines) tw = Math.max(tw, ctx.measureText(l).width);
  const x = 34 - (1 - o.k) * 40;
  const y = 28;
  const w = tw + 40;
  const h = lines.length * 31 + 24;
  ctx.globalAlpha *= o.alpha;
  ctx.fillStyle = INK;
  ctx.fillRect(x + 6, y + 6, w, h);
  ctx.fillStyle = '#fff4cf';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = INK;
  ctx.textBaseline = 'top';
  let left = o.chars;
  lines.forEach((l, i) => {
    if (left <= 0) return;
    ctx.fillText(l.slice(0, Math.max(0, Math.floor(left))), x + 20, y + 13 + i * 31);
    left -= l.length + 1;
  });
  ctx.restore();
}

const TYPE_RATE = 40;

// Draw every line active at lt. lines: [t0, t1, who, text, opts]. anchors: who -> [x, y] above the head.
function talk(ctx, lt, lines, anchors) {
  for (const L of lines) {
    const [t0, t1, who, text, o = {}] = L;
    if (lt < t0 || lt > t1) continue;
    const k = E.back(prog(lt, t0, t0 + 0.28));
    const alpha = Math.min(prog(lt, t0, t0 + 0.1), prog(t1 - lt, 0, 0.22));
    const chars = (lt - t0) * (o.shout ? 28 : TYPE_RATE);
    if (who === 'narrator') {
      drawCaption(ctx, text, { k: E.out3(prog(lt, t0, t0 + 0.35)), alpha, chars });
      continue;
    }
    const a = o.at || anchors[who];
    if (!a) continue;
    drawBubble(ctx, text, a[0], a[1], { who, k, alpha, chars, shout: o.shout, think: o.think });
  }
}

// True while `who` is mid-sentence, so the rig can flap its mouth.
function speaking(lt, lines, who) {
  for (const L of lines) {
    const [t0, t1, w, text, o] = L;
    if (w !== who || (o && o.think)) continue;
    const end = Math.min(t1, t0 + text.length / (o && o.shout ? 28 : TYPE_RATE) + 0.15);
    if (lt >= t0 && lt < end) return true;
  }
  return false;
}

/* ---------- effects ---------- */

// Horizontal streaks moving opposite to the direction of travel.
function speedLines(ctx, t, o = {}) {
  const n = o.n ?? 40;
  const sp = o.speed ?? 2400;
  const a = o.alpha ?? 0.5;
  const y0 = o.y0 ?? 0;
  const y1 = o.y1 ?? H;
  ctx.save();
  ctx.strokeStyle = o.color ?? '#ffffff';
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const r1 = hash(i * 3.1 + 1);
    const r2 = hash(i * 7.7 + 2);
    const r3 = hash(i * 1.3 + 9);
    const len = 80 + r2 * 260;
    const span = W + len + 200;
    const x = span - ((r1 * span + t * sp * (0.6 + r3 * 0.8)) % span) - len;
    const y = y0 + r3 * (y1 - y0);
    ctx.globalAlpha = a * (0.3 + 0.7 * r2);
    ctx.lineWidth = 1 + r1 * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

// Manga focus lines converging on (cx, cy).
function focusLines(ctx, cx, cy, t, o = {}) {
  const n = o.n ?? 110;
  const r0 = o.r0 ?? 230;
  const fl = Math.floor(t * 14);
  ctx.save();
  ctx.fillStyle = o.color ?? INK;
  ctx.globalAlpha *= o.alpha ?? 0.7;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * TAU + (hash(i * 13.1 + fl) - 0.5) * 0.06;
    const r = r0 * (0.8 + hash(i * 3.7 + fl * 1.3) * 0.7);
    const wd = 0.004 + hash(i + fl * 0.7) * 0.012;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    ctx.lineTo(cx + Math.cos(ang - wd) * 1500, cy + Math.sin(ang - wd) * 1500);
    ctx.lineTo(cx + Math.cos(ang + wd) * 1500, cy + Math.sin(ang + wd) * 1500);
    ctx.fill();
  }
  ctx.restore();
}

// Rotating two-colour sunburst.
function rays(ctx, cx, cy, t, o = {}) {
  const n = 18;
  ctx.save();
  ctx.globalAlpha *= o.a ?? 0.3;
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.15);
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 1500, a0, a0 + TAU / n / 2);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? o.c1 || '#2563eb' : o.c2 || '#ffd21f';
    ctx.fill();
  }
  ctx.restore();
}

// Spiky impact star; p runs 0 -> 1 over its life.
function burst(ctx, x, y, p, size = 110, o = {}) {
  if (p <= 0 || p >= 1) return;
  const s = size * (0.45 + 0.75 * E.out3(Math.min(1, p * 2.2)));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? hash(size) * TAU);
  ctx.globalAlpha *= 1 - E.in(p);
  const n = o.n ?? 12;
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * TAU;
    const r = i % 2 ? s * 0.42 : s * (0.8 + 0.35 * hash(i + size));
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = o.c2 || '#ffd23f';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = o.edge || INK;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.36, 0, TAU);
  ctx.fillStyle = o.c1 || '#ffffff';
  ctx.fill();
  ctx.restore();
}

function shock(ctx, x, y, p, maxR, o = {}) {
  if (p <= 0 || p >= 1) return;
  const r = maxR * E.out3(p);
  ctx.save();
  ctx.globalAlpha *= 1 - p;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * (o.flat ?? 1), 0, 0, TAU);
  ctx.lineWidth = (o.w ?? 16) * (1 - p) + 1;
  ctx.strokeStyle = o.col || '#ffffff';
  ctx.stroke();
  ctx.restore();
}

// Dust or smoke puffs drifting out from (x, y).
function puffs(ctx, x, y, p, o = {}) {
  if (p <= 0 || p >= 1) return;
  const n = o.n ?? 8;
  const sp = o.spread ?? 90;
  const seed = o.seed ?? 1;
  const sz = o.size ?? 24;
  const dx = o.dx ?? 0;
  const col = o.color ?? '#efe3cf';
  const shade = o.shade ?? '#cbb89c';
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = Math.PI + hash(seed + i * 1.7) * Math.PI;
    const d = sp * (0.4 + hash(seed + i * 2.3) * 0.8) * E.out3(p);
    const px = x + Math.cos(a) * d + dx * p;
    const py = y + Math.sin(a) * d * (o.flat ?? 0.5) - p * (o.rise ?? 20);
    const r = sz * (0.5 + hash(seed + i * 4.1)) * (0.6 + p * 0.9);
    ctx.globalAlpha = (1 - p) * 0.9;
    circle(ctx, px, py + r * 0.15, r, shade);
    circle(ctx, px, py, r * 0.92, col);
  }
  ctx.restore();
}

// Glowing motion streak from (x0, y0) toward (x1, y1). p is how far the head has travelled;
// past 1 the head waits at the end while the tail catches up, so the streak clears itself.
function streak(ctx, x0, y0, x1, y1, p, col, w = 16, tail = 0.45) {
  const hp = clamp(p);
  const q = clamp(p - tail);
  if (hp - q < 0.002) return;
  const hx = lerp(x0, x1, hp);
  const hy = lerp(y0, y1, hp);
  const tx = lerp(x0, x1, q);
  const ty = lerp(y0, y1, q);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  const g = ctx.createLinearGradient(tx, ty, hx, hy);
  g.addColorStop(0, rgba(col, 0));
  g.addColorStop(1, rgba(col, 0.95));
  ctx.strokeStyle = g;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(hx, hy);
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = w * 2.4;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineWidth = w;
  ctx.stroke();
  const g2 = ctx.createLinearGradient(tx, ty, hx, hy);
  g2.addColorStop(0, 'rgba(255,255,255,0)');
  g2.addColorStop(1, 'rgba(255,255,255,0.95)');
  ctx.strokeStyle = g2;
  ctx.lineWidth = w * 0.35;
  ctx.stroke();
  ctx.restore();
}

function flash(ctx, a, col = '#ffffff') {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = REDUCED ? a * 0.45 : a;
  ctx.fillStyle = col;
  ctx.fillRect(-50, -50, W + 100, H + 100);
  ctx.restore();
}

function letterbox(ctx, k) {
  if (k <= 0) return;
  const h = 64 * k;
  ctx.fillStyle = '#000';
  ctx.fillRect(-50, -50, W + 100, h + 50);
  ctx.fillRect(-50, H - h, W + 100, h + 50);
}

let _vig = null;
function vignette(ctx, a = 1) {
  if (!_vig) {
    _vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    _vig.addColorStop(0, 'rgba(10,6,20,0)');
    _vig.addColorStop(1, 'rgba(10,6,20,0.55)');
  }
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = _vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
