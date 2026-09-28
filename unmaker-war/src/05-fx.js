/* The Unmaker War — effects: glows, beams, slashes, shockwaves, lightning, particles, erasure. */
(function () {
  'use strict';
  const UW = window.UW;
  const { TAU, lerp, sat, hash, noise, rgba, clamp } = UW;
  const FX = (UW.FX = {});

  /* ---------- sprites ---------- */
  const sprites = new Map();
  function glowSprite(color, hot) {
    const key = color + (hot ? '|h' : '');
    let s = sprites.get(key);
    if (s) return s;
    s = UW.R.makeCanvas(128, 128);
    const g = s.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    if (hot) {
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.12, rgba(UW.mix(color, '#ffffff', 0.5), 0.95));
      gr.addColorStop(0.35, rgba(color, 0.45));
    } else {
      gr.addColorStop(0, rgba(color, 1));
      gr.addColorStop(0.25, rgba(color, 0.55));
    }
    gr.addColorStop(0.6, rgba(color, 0.12));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    sprites.set(key, s);
    return s;
  }
  FX.glowSprite = glowSprite;

  function softSprite(color) {
    const key = 'soft|' + color;
    let s = sprites.get(key);
    if (s) return s;
    s = UW.R.makeCanvas(128, 128);
    const g = s.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, rgba(color, 0.9));
    gr.addColorStop(0.5, rgba(color, 0.45));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    sprites.set(key, s);
    return s;
  }
  FX.softSprite = softSprite;

  /* Additive glow. */
  FX.glow = function (ctx, x, y, r, color, a, hot) {
    if (a <= 0.003 || r <= 0) return;
    const pa = ctx.globalAlpha, pc = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = pa * clamp(a, 0, 1);
    ctx.drawImage(glowSprite(color, hot), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = pa;
    ctx.globalCompositeOperation = pc;
  };
  /* Dark "anti-glow" — light that fails to illuminate. */
  FX.darkGlow = function (ctx, x, y, r, a) {
    if (a <= 0.003) return;
    const pa = ctx.globalAlpha;
    ctx.globalAlpha = pa * clamp(a, 0, 1);
    ctx.drawImage(softSprite('#000000'), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = pa;
  };
  FX.soft = function (ctx, x, y, r, color, a) {
    if (a <= 0.003) return;
    const pa = ctx.globalAlpha;
    ctx.globalAlpha = pa * clamp(a, 0, 1);
    ctx.drawImage(softSprite(color), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = pa;
  };

  /* ---------- lines & beams ---------- */
  FX.line = function (ctx, x1, y1, x2, y2, w, color, a, add) {
    if (a <= 0) return;
    ctx.save();
    if (add) ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= sat(a);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  FX.beam = function (ctx, x1, y1, x2, y2, w, color, a, t) {
    if (a <= 0) return;
    const fl = 0.85 + 0.15 * Math.sin((t || 0) * 60);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const layers = [[w * 3.2, 0.12], [w * 1.8, 0.25], [w, 0.55]];
    for (const [lw, la] of layers) {
      ctx.globalAlpha = a * la * fl;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = a * 0.95;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, w * 0.32);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
    FX.glow(ctx, x1, y1, w * 3, color, a * 0.8, true);
    FX.glow(ctx, x2, y2, w * 4, color, a * 0.9, true);
  };

  /* Polyline glow path (streaks, trails). pts = [[x,y],...] */
  FX.trail = function (ctx, pts, w, color, a, taper) {
    if (a <= 0 || pts.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const n = pts.length;
    for (let pass = 0; pass < 3; pass++) {
      const pw = pass === 0 ? w * 3 : pass === 1 ? w * 1.4 : w * 0.45;
      const pa = pass === 0 ? 0.15 : pass === 1 ? 0.4 : 0.95;
      const col = pass === 2 ? UW.mix(color, '#ffffff', 0.7) : color;
      for (let i = 1; i < n; i++) {
        const k = taper ? i / (n - 1) : 1;
        ctx.globalAlpha = a * pa * (taper ? k : 1);
        ctx.strokeStyle = col;
        ctx.lineWidth = pw * (taper ? 0.3 + 0.7 * k : 1);
        ctx.beginPath();
        ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
        ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  /* ---------- rings & shockwaves ---------- */
  FX.ring = function (ctx, x, y, r, w, color, a, squash) {
    if (a <= 0 || r <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y);
    ctx.scale(1, squash || 1);
    for (const [k, la] of [[2.6, 0.15], [1.4, 0.35], [0.5, 0.9]]) {
      ctx.globalAlpha = a * la;
      ctx.strokeStyle = k < 1 ? UW.mix(color, '#ffffff', 0.6) : color;
      ctx.lineWidth = w * k;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* Expanding shockwave between t0 and t0+dur. */
  FX.shock = function (ctx, t, t0, dur, x, y, maxR, color, w, squash) {
    if (t < t0 || t > t0 + dur) return;
    const u = (t - t0) / dur;
    const r = maxR * UW.Ease.out3(u);
    FX.ring(ctx, x, y, r, (w || 18) * (1 - u * 0.7), color, (1 - u) * 1.1, squash);
    if (u < 0.25) FX.glow(ctx, x, y, maxR * 0.35 * (1 - u * 2), color, (0.25 - u) * 4, true);
  };

  /* Radial impact spikes. */
  FX.impact = function (ctx, t, t0, dur, x, y, size, color, seed) {
    if (t < t0 || t > t0 + dur) return;
    const u = (t - t0) / dur;
    const n = 14;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU + hash(i + (seed || 0)) * 0.5;
      const len = size * (0.4 + hash(i * 3.3 + (seed || 0)) * 0.9) * UW.Ease.out3(Math.min(1, u * 2.5));
      const r0 = size * 0.15 + len * 0.2 * u;
      ctx.globalAlpha = (1 - u) * 0.9;
      ctx.fillStyle = i % 2 ? '#ffffff' : color;
      const wv = size * 0.035 * (1 - u);
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * r0 - Math.sin(ang) * wv, Math.sin(ang) * r0 + Math.cos(ang) * wv);
      ctx.lineTo(Math.cos(ang) * (r0 + len), Math.sin(ang) * (r0 + len));
      ctx.lineTo(Math.cos(ang) * r0 + Math.sin(ang) * wv, Math.sin(ang) * r0 - Math.cos(ang) * wv);
      ctx.fill();
    }
    ctx.restore();
    FX.glow(ctx, x, y, size * (0.6 + u), color, (1 - u) * 1.2, true);
  };

  /* ---------- lightning ---------- */
  function boltPts(x1, y1, x2, y2, seed, rough, depth) {
    let pts = [[x1, y1], [x2, y2]];
    let disp = Math.hypot(x2 - x1, y2 - y1) * (rough || 0.25);
    for (let d = 0; d < (depth || 6); d++) {
      const np = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const nx = -(b[1] - a[1]), ny = b[0] - a[0];
        const nl = Math.hypot(nx, ny) || 1;
        const o = (hash(seed * 7.13 + d * 31.7 + i * 3.17) - 0.5) * disp;
        np.push([mx + (nx / nl) * o, my + (ny / nl) * o], b);
      }
      pts = np;
      disp *= 0.55;
    }
    return pts;
  }
  FX.boltPts = boltPts;
  FX.lightning = function (ctx, x1, y1, x2, y2, seed, color, w, a, branches) {
    if (a <= 0) return;
    const pts = boltPts(x1, y1, x2, y2, seed, 0.28, 6);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const draw = (p, lw, col, al) => {
      ctx.globalAlpha = al;
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
      ctx.stroke();
    };
    draw(pts, w * 5, color, a * 0.15);
    draw(pts, w * 2, color, a * 0.5);
    draw(pts, w * 0.7, '#ffffff', a);
    const nb = branches == null ? 3 : branches;
    for (let b = 0; b < nb; b++) {
      const i = Math.floor(hash(seed + b * 9.1) * (pts.length - 2)) + 1;
      const p = pts[i];
      const ang = Math.atan2(y2 - y1, x2 - x1) + (hash(seed + b * 4.4) - 0.5) * 1.6;
      const len = Math.hypot(x2 - x1, y2 - y1) * (0.12 + hash(seed * 2 + b) * 0.25);
      const bp = boltPts(p[0], p[1], p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len, seed + b * 13, 0.35, 4);
      draw(bp, w * 1.2, color, a * 0.4);
      draw(bp, w * 0.4, '#ffffff', a * 0.7);
    }
    ctx.restore();
  };

  /* ---------- slashes ---------- */
  /* Crescent slash arc centered (cx,cy), radius r, sweeping angle a0→a1. u = reveal progress 0..1, fade 0..1 */
  FX.slash = function (ctx, cx, cy, r, a0, a1, w, color, u, fade) {
    const alpha = 1 - (fade || 0);
    if (alpha <= 0 || u <= 0) return;
    const aEnd = a0 + (a1 - a0) * sat(u);
    const aStart = a0 + (a1 - a0) * Math.max(0, sat(u) - 0.85) ;
    const n = 28;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const outer = [], inner = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const ang = aStart + (aEnd - aStart) * k;
      const th = w * Math.sin(Math.PI * Math.pow(k, 0.8)) * (0.25 + 0.75 * k);
      outer.push([cx + Math.cos(ang) * (r + th * 0.5), cy + Math.sin(ang) * (r + th * 0.5)]);
      inner.push([cx + Math.cos(ang) * (r - th * 0.5), cy + Math.sin(ang) * (r - th * 0.5)]);
    }
    const drawShape = (col, al, grow) => {
      ctx.globalAlpha = al * alpha;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(outer[0][0], outer[0][1]);
      for (let i = 1; i <= n; i++) ctx.lineTo(outer[i][0] + (outer[i][0] - cx) * grow, outer[i][1] + (outer[i][1] - cy) * grow);
      for (let i = n; i >= 0; i--) ctx.lineTo(inner[i][0] - (inner[i][0] - cx) * grow, inner[i][1] - (inner[i][1] - cy) * grow);
      ctx.closePath();
      ctx.fill();
    };
    drawShape(color, 0.25, 0.04);
    drawShape(color, 0.6, 0.0);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, w * 0.08);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = outer[i];
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
    ctx.restore();
  };

  /* ---------- particles ---------- */
  /* Deterministic burst: particles born at t0, positions computed analytically.
     o: {n, x, y, speed:[a,b], dir, spread, life:[a,b], g, drag, size:[a,b], color, kind, seed} */
  FX.burst = function (ctx, t, t0, o) {
    const age0 = t - t0;
    if (age0 < 0) return;
    const n = o.n || 30;
    const seed = o.seed || 1;
    const lifeA = o.life ? o.life[0] : 0.6, lifeB = o.life ? o.life[1] : 1.4;
    if (age0 > lifeB) return;
    const drag = o.drag == null ? 2 : o.drag;
    const g = o.g == null ? 600 : o.g;
    const spread = o.spread == null ? TAU : o.spread;
    const dir = o.dir || 0;
    const kind = o.kind || 'spark';
    ctx.save();
    if (o.add !== false && kind !== 'debris' && kind !== 'blood' && kind !== 'ash' && kind !== 'shard' && kind !== 'feather') ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const h1 = hash(seed * 13.7 + i * 1.371), h2 = hash(seed * 7.3 + i * 2.913), h3 = hash(seed * 3.1 + i * 5.77);
      const life = lerp(lifeA, lifeB, h3);
      const age = age0 - (o.stagger || 0) * hash(i * 9.1 + seed);
      if (age < 0 || age > life) continue;
      const ang = dir + (h1 - 0.5) * spread;
      const sp = lerp(o.speed ? o.speed[0] : 200, o.speed ? o.speed[1] : 900, h2);
      const vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp;
      const k = drag > 0 ? (1 - Math.exp(-drag * age)) / drag : age;
      const x = (o.x || 0) + (o.rx || 0) * (hash(i * 3.7 + seed) - 0.5) + vx * k;
      const y = (o.y || 0) + (o.ry || 0) * (hash(i * 5.3 + seed) - 0.5) + vy * k + 0.5 * g * age * age;
      const lu = age / life;
      const size = lerp(o.size ? o.size[0] : 2, o.size ? o.size[1] : 6, hash(i * 11.1 + seed)) * (o.shrink === false ? 1 : 1 - lu * 0.7);
      const alpha = (o.alpha == null ? 1 : o.alpha) * (1 - lu) * (lu < 0.05 ? lu / 0.05 : 1);
      const col = Array.isArray(o.color) ? o.color[i % o.color.length] : o.color || '#ffcc66';
      drawParticle(ctx, kind, x, y, size, col, alpha, vx * Math.exp(-drag * age), vy * Math.exp(-drag * age) + g * age, i + seed, age);
    }
    ctx.restore();
  };

  function drawParticle(ctx, kind, x, y, size, col, alpha, vx, vy, id, age) {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha;
    switch (kind) {
      case 'spark': {
        const l = Math.hypot(vx, vy) * 0.018 + size;
        const a = Math.atan2(vy, vx);
        ctx.strokeStyle = col;
        ctx.lineWidth = size * 0.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      }
      case 'glow':
        FX.glow(ctx, x, y, size * 3, col, alpha);
        break;
      case 'dot':
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, TAU);
        ctx.fill();
        break;
      case 'blood': {
        ctx.fillStyle = col;
        const a = Math.atan2(vy, vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.6, size * 0.8, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'debris':
      case 'shard': {
        ctx.fillStyle = col;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(age * (hash(id) - 0.5) * 14 + id);
        ctx.beginPath();
        ctx.moveTo(-size, -size * 0.6);
        ctx.lineTo(size * 0.9, -size * 0.9 * hash(id * 2));
        ctx.lineTo(size * 0.6, size * 0.8);
        ctx.lineTo(-size * 0.7, size * 0.5 * hash(id * 3));
        ctx.closePath();
        ctx.fill();
        if (kind === 'debris') {
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      case 'ember': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x + Math.sin(age * 6 + id) * 4, y, size * 0.5, 0, TAU);
        ctx.fill();
        FX.glow(ctx, x, y, size * 2.2, col, alpha * 0.6);
        break;
      }
      case 'ash': {
        ctx.fillStyle = col;
        ctx.save();
        ctx.translate(x + Math.sin(age * 3 + id) * 10, y);
        ctx.rotate(age * 2 + id);
        ctx.fillRect(-size, -size * 0.4, size * 2, size * 0.8);
        ctx.restore();
        break;
      }
      case 'feather': {
        ctx.save();
        ctx.translate(x + Math.sin(age * 2.5 + id) * 18, y);
        ctx.rotate(Math.sin(age * 2 + id) * 0.8 + id);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.45, size * 1.6, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.6);
        ctx.lineTo(0, size * 1.6);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'star': {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, TAU);
        ctx.fill();
        FX.glow(ctx, x, y, size * 3, col, alpha * 0.8);
        break;
      }
      default:
        ctx.fillStyle = col;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }
  FX.drawParticle = drawParticle;

  /* Ambient looping field of particles inside rect. o: {n, x0,x1,y0,y1, vx, vy, size, color, kind, seed, alpha, wobble} */
  FX.field = function (ctx, t, o) {
    const n = o.n || 60;
    const seed = o.seed || 3;
    const w = o.x1 - o.x0, h = o.y1 - o.y0;
    ctx.save();
    if (o.add) ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const hx = hash(seed + i * 1.13), hy = hash(seed * 2 + i * 2.71), hs = hash(seed * 3 + i * 0.77);
      const sp = 0.5 + hs;
      let x = o.x0 + ((hx * w + (o.vx || 0) * sp * t) % w + w) % w;
      let y = o.y0 + ((hy * h + (o.vy || 0) * sp * t) % h + h) % h;
      if (o.wobble) x += Math.sin(t * 1.3 + i) * o.wobble;
      const size = (o.size || 3) * (0.4 + hs);
      const tw = o.twinkle ? 0.5 + 0.5 * Math.sin(t * (2 + hs * 4) + i) : 1;
      const col = Array.isArray(o.color) ? o.color[i % o.color.length] : o.color || '#fff';
      drawParticle(ctx, o.kind || 'dot', x, y, size, col, (o.alpha == null ? 0.8 : o.alpha) * tw, o.vx || 0, o.vy || 0, i, t + i);
    }
    ctx.restore();
  };

  /* ---------- screen-space graphic accents ---------- */
  FX.speedLines = function (ctx, t, a, angle, color) {
    if (a <= 0) return;
    const { W, H } = UW;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(angle || 0);
    ctx.globalAlpha = sat(a);
    ctx.strokeStyle = color || 'rgba(255,255,255,0.7)';
    const f = Math.floor(t * 30);
    for (let i = 0; i < 40; i++) {
      const y = (hash(i * 3.3 + f * 0.013) - 0.5) * H * 1.3;
      const len = 200 + hash(i + f) * 700;
      const x = ((hash(i * 7.7) * 3000 + t * 4000 * (0.5 + hash(i))) % 3000) - 1500;
      ctx.lineWidth = 1 + hash(i * 2.2) * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - len, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  FX.focusLines = function (ctx, t, a, cx, cy, color) {
    if (a <= 0) return;
    const { W, H } = UW;
    cx = cx == null ? W / 2 : cx;
    cy = cy == null ? H / 2 : cy;
    const f = Math.floor(t * 20);
    ctx.save();
    ctx.globalAlpha = sat(a);
    ctx.fillStyle = color || '#000';
    for (let i = 0; i < 90; i++) {
      const ang = (i / 90) * TAU + hash(i + f * 0.1) * 0.05;
      const r0 = 380 + hash(i * 3 + f) * 260;
      const r1 = 1500;
      const w = 0.004 + hash(i * 5.5) * 0.01;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      ctx.lineTo(cx + Math.cos(ang - w) * r1, cy + Math.sin(ang - w) * r1);
      ctx.lineTo(cx + Math.cos(ang + w) * r1, cy + Math.sin(ang + w) * r1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- erasure vocabulary ---------- */
  /* Black angular shards jittering around a point — fragments of unfinished darkness. */
  FX.voidShards = function (ctx, t, x, y, radius, n, seed, a) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = sat(a);
    for (let i = 0; i < n; i++) {
      const s = (seed || 0) + i * 3.71;
      const orbit = radius * (0.35 + hash(s) * 0.75);
      const sp = (hash(s + 1) - 0.5) * 0.8;
      const ang = hash(s + 2) * TAU + t * sp;
      const jump = Math.floor(t * (2 + hash(s + 3) * 6));
      const jx = (hash(s + jump) - 0.5) * radius * 0.08;
      const px = x + Math.cos(ang) * orbit + jx;
      const py = y + Math.sin(ang) * orbit * 0.8 + (hash(s + jump * 1.3) - 0.5) * radius * 0.06;
      const sz = radius * (0.02 + hash(s + 4) * 0.06);
      if (hash(s + jump * 0.7) < 0.12) continue; // flicker out of existence
      ctx.fillStyle = hash(s + 5) < 0.85 ? '#000' : '#8a8a8a';
      ctx.beginPath();
      ctx.moveTo(px - sz, py - sz * 0.3);
      ctx.lineTo(px + sz * 0.2, py - sz);
      ctx.lineTo(px + sz, py + sz * 0.4);
      ctx.lineTo(px - sz * 0.3, py + sz * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  /* Missing-information blocks: gray/black rectangles that pop in and out. */
  FX.staticBlocks = function (ctx, t, x, y, w, h, n, seed, a) {
    if (a <= 0) return;
    const f = Math.floor(t * 12);
    ctx.save();
    for (let i = 0; i < n; i++) {
      const s = (seed || 0) + i * 5.13 + f * 0.917;
      if (hash(s) > 0.55) continue;
      const bx = x + (hash(s + 1) - 0.5) * w;
      const by = y + (hash(s + 2) - 0.5) * h;
      const bw = 6 + hash(s + 3) * w * 0.12;
      const bh = 3 + hash(s + 4) * h * 0.04;
      ctx.globalAlpha = a * (0.5 + hash(s + 5) * 0.5);
      const v = hash(s + 6);
      ctx.fillStyle = v < 0.5 ? '#000' : v < 0.8 ? '#7d7d7d' : '#c8c8c8';
      ctx.fillRect(bx, by, bw, bh);
    }
    ctx.restore();
  };

  /* An outline drawn in broken, offset pieces — edges that fail to stay continuous. */
  FX.brokenOutline = function (ctx, pts, t, color, w, a, seed, jitter) {
    if (a <= 0 || pts.length < 2) return;
    const f = Math.floor(t * 10);
    ctx.save();
    ctx.globalAlpha = sat(a);
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = 'butt';
    for (let i = 0; i < pts.length; i++) {
      const s = (seed || 0) + i * 2.3 + f * 0.31;
      if (hash(s) < 0.25) continue;
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const ox = (hash(s + 1) - 0.5) * (jitter || 6), oy = (hash(s + 2) - 0.5) * (jitter || 6);
      ctx.beginPath();
      ctx.moveTo(p[0] + ox, p[1] + oy);
      ctx.lineTo(q[0] + ox, q[1] + oy);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* Ragged hole in reality: a void with a failing edge. */
  FX.voidHole = function (ctx, t, x, y, r, a, seed, sx, sy) {
    if (a <= 0 || r <= 0) return;
    const n = 48;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU;
      const f = Math.floor(t * 8 + hash(i + (seed || 0)) * 3);
      const rr = r * (0.86 + 0.18 * hash(i * 3.3 + f * 0.7 + (seed || 0)) + 0.06 * Math.sin(ang * 5 + t));
      pts.push([x + Math.cos(ang) * rr * (sx || 1), y + Math.sin(ang) * rr * (sy || 1)]);
    }
    ctx.save();
    ctx.globalAlpha = sat(a);
    FX.darkGlow(ctx, x, y, r * 1.9, 0.75 * a);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    UW.poly(ctx, pts, true);
    ctx.fill();
    ctx.restore();
    FX.brokenOutline(ctx, pts, t, 'rgba(210,210,210,0.8)', 2, a * 0.8, seed, 10);
  };

  /* Glyphs — runes, fate marks, archival script. */
  FX.rune = function (ctx, x, y, size, seed, color, a, lw) {
    if (a <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = sat(a);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw || Math.max(1, size * 0.09);
    ctx.lineCap = 'round';
    ctx.beginPath();
    const n = 3 + Math.floor(hash(seed) * 3);
    for (let i = 0; i < n; i++) {
      const s = seed * 3.1 + i * 1.7;
      const x1 = (hash(s) - 0.5) * size, y1 = (hash(s + 1) - 0.5) * size;
      const x2 = (hash(s + 2) - 0.5) * size, y2 = (hash(s + 3) - 0.5) * size;
      if (hash(s + 4) < 0.3) {
        ctx.moveTo(x1 + size * 0.2, y1);
        ctx.arc(x1, y1, size * 0.2, 0, TAU);
      } else {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  FX.runeRing = function (ctx, t, x, y, r, n, color, a, seed, spin) {
    if (a <= 0) return;
    FX.ring(ctx, x, y, r, 3, color, a * 0.6);
    FX.ring(ctx, x, y, r * 0.82, 1.5, color, a * 0.4);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU + t * (spin || 0.3);
      FX.rune(ctx, x + Math.cos(ang) * r * 0.91, y + Math.sin(ang) * r * 0.91, r * 0.1, (seed || 0) + i, color, a);
    }
    FX.glow(ctx, x, y, r * 1.2, color, a * 0.25);
  };

  /* Luminous threads (fate threads, anchors). from [x,y] to [x,y] with sag and shimmer */
  FX.thread = function (ctx, x1, y1, x2, y2, sag, color, w, a, t, seed) {
    if (a <= 0) return;
    const mx = (x1 + x2) / 2 + Math.sin(t * 1.3 + (seed || 0)) * sag * 0.2;
    const my = (y1 + y2) / 2 + sag;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const [lw, la, col] of [[w * 4, 0.12, color], [w * 1.6, 0.4, color], [w * 0.5, 0.9, '#ffffff']]) {
      ctx.globalAlpha = a * la;
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* Soft smoke/dust puffs (normal blend). */
  FX.smoke = function (ctx, t, t0, o) {
    const age0 = t - t0;
    if (age0 < 0) return;
    const n = o.n || 12;
    const life = o.life || 2;
    for (let i = 0; i < n; i++) {
      const s = (o.seed || 1) * 3.3 + i * 1.91;
      const age = age0 - hash(s) * (o.stagger || 0.2);
      if (age < 0 || age > life) continue;
      const u = age / life;
      const ang = (o.dir || -Math.PI / 2) + (hash(s + 1) - 0.5) * (o.spread == null ? 2.4 : o.spread);
      const sp = (o.speed || 120) * (0.4 + hash(s + 2));
      const x = o.x + Math.cos(ang) * sp * UW.Ease.out(u) * life * 0.6 + (hash(s + 5) - 0.5) * (o.rx || 0);
      const y = o.y + Math.sin(ang) * sp * UW.Ease.out(u) * life * 0.6 - (o.rise || 0) * u;
      const r = (o.size || 60) * (0.5 + hash(s + 3) * 0.8) * (0.6 + u * 1.2);
      FX.soft(ctx, x, y, r, o.color || '#555555', (o.alpha || 0.5) * (1 - u) * Math.min(1, age * 8));
    }
  };
})();
