/* The Unmaker War — realm backdrops. Screen-space skies, parallax layers, grounds. */
(function () {
  'use strict';
  const UW = window.UW;
  const { W, H, TAU, lerp, sat, hash, noise, fbm2, mix, shade, rgba, clamp } = UW;
  const R = UW.R;
  const FX = UW.FX;
  const BG = (UW.BG = {});

  /* ---------- shared pieces ---------- */
  function vgrad(ctx, stops, y0, y1) {
    const g = ctx.createLinearGradient(0, y0 == null ? 0 : y0, 0, y1 == null ? H : y1);
    stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s));
    return g;
  }
  BG.sky = function (stops) {
    const ctx = R.screen();
    ctx.fillStyle = vgrad(ctx, stops);
    ctx.fillRect(0, 0, W, H);
  };

  /* Nebula clouds, cached per key (screen space, slightly oversized for parallax drift). */
  function nebulaCanvas(key, hues, seed, density) {
    return R.cache('neb|' + key, 960, 540, (g, w, h) => {
      const img = g.createImageData(w, h);
      const d = img.data;
      const cols = hues.map((c) => UW.rgb(c));
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x / w * 3.2 + seed * 1.7, ny = y / h * 1.8 + seed;
          const n1 = fbm2(nx, ny, 5) * 0.5 + 0.5;
          const n2 = fbm2(nx * 1.7 + 9, ny * 1.7 - 3, 4) * 0.5 + 0.5;
          const v = Math.pow(sat((n1 - 0.42) * 2.2), 1.6) * (density || 1);
          const c = n2 < 0.5 ? cols[0] : cols[1 % cols.length];
          const c2 = cols[2 % cols.length];
          const k = sat((n2 - 0.35) * 2);
          const i = (y * w + x) * 4;
          d[i] = lerp(c[0], c2[0], k) * v;
          d[i + 1] = lerp(c[1], c2[1], k) * v;
          d[i + 2] = lerp(c[2], c2[2], k) * v;
          d[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    });
  }
  BG.nebulaCanvas = nebulaCanvas;

  /* Star layers drawn in world space with parallax p. */
  BG.stars = function (t, p, n, seed, o) {
    o = o || {};
    const ctx = R.world(p);
    const v = R.view(p);
    const span = 4200;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const hx = hash(seed + i * 1.37), hy = hash(seed * 1.3 + i * 2.11);
      let x = v.x0 + ((hx * span - v.x0) % span + span) % span;
      if (x > v.x1) continue;
      const y = (o.y0 == null ? -1400 : o.y0) + hy * (o.h || 2400);
      if (y < v.y0 || y > v.y1) continue;
      const s = (o.size || 2) * (0.35 + hash(i * 7.3 + seed) * 1.1);
      const tw = 0.55 + 0.45 * Math.sin(t * (1 + hash(i) * 3) + i);
      ctx.globalAlpha = (o.alpha || 0.9) * tw;
      ctx.fillStyle = hash(i * 3.3) < 0.15 ? '#ffd9b0' : hash(i * 5.1) < 0.2 ? '#b8d0ff' : '#ffffff';
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
      if (s > 2.4) FX.glow(ctx, x, y, s * 4, '#cfe0ff', 0.25 * tw);
    }
    ctx.restore();
  };

  BG.space = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(o.sky || ['#020208', '#05040f', '#0a0616']);
    const neb = nebulaCanvas(o.key || 'space', o.neb || ['#3b1e6e', '#0e2a5a', '#6a1e4e'], o.seed || 1, o.density || 1);
    const ctx = R.screen();
    const cam = R.cam;
    ctx.save();
    ctx.globalAlpha = o.nebA == null ? 0.9 : o.nebA;
    ctx.globalCompositeOperation = 'lighter';
    const dx = -cam.x * 0.03, dy = -cam.y * 0.03;
    ctx.drawImage(neb, -120 + dx, -80 + dy, W + 240, H + 160);
    ctx.restore();
    BG.stars(t, 0.05, 260, o.seed || 3, { size: 1.6, alpha: 0.8 });
    BG.stars(t, 0.15, 110, (o.seed || 3) + 11, { size: 2.4, alpha: 0.9 });
    if (o.galaxy) BG.galaxy(t, o.galaxy);
  };

  BG.galaxy = function (t, g) {
    const ctx = R.world(g.p || 0.08);
    ctx.save();
    ctx.translate(g.x || 0, g.y || -400);
    ctx.rotate(g.rot || -0.4);
    ctx.scale(1, g.tilt || 0.35);
    FX.glow(ctx, 0, 0, g.r || 260, g.c || '#c9a2ff', 0.55);
    FX.glow(ctx, 0, 0, (g.r || 260) * 0.25, '#ffffff', 0.8, true);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 160; i++) {
      const a = hash(i * 1.7) * TAU * 2 + t * 0.02;
      const rr = (g.r || 260) * Math.sqrt(hash(i * 3.1));
      const arm = a + rr * 0.012;
      ctx.fillStyle = rgba(g.c || '#c9a2ff', 0.6);
      ctx.fillRect(Math.cos(arm) * rr, Math.sin(arm) * rr, 2, 2);
    }
    ctx.restore();
  };

  /* ---------- ground & horizon ---------- */
  BG.ground = function (S, o) {
    o = o || {};
    const ctx = R.world(1);
    const v = R.view(1);
    const y0 = o.y == null ? 0 : o.y;
    const g = ctx.createLinearGradient(0, y0, 0, y0 + (o.depth || 700));
    g.addColorStop(0, o.c1 || '#2a2522');
    g.addColorStop(1, o.c2 || '#0c0a09');
    ctx.fillStyle = g;
    ctx.fillRect(v.x0 - 50, y0, v.x1 - v.x0 + 100, 3000);
    // rim line
    ctx.fillStyle = o.rim || rgba('#ffffff', 0.06);
    ctx.fillRect(v.x0 - 50, y0, v.x1 - v.x0 + 100, 2);
    // debris & cracks tiled deterministically
    if (o.debris !== false) {
      const step = 70;
      const i0 = Math.floor(v.x0 / step) - 1, i1 = Math.ceil(v.x1 / step) + 1;
      for (let i = i0; i <= i1; i++) {
        const h1 = hash(i * 1.93 + (o.seed || 0));
        if (h1 < 0.45) continue;
        const x = i * step + hash(i * 3.7) * step;
        const y = y0 + 4 + hash(i * 5.3) * 120;
        const s = 4 + hash(i * 9.1) * 16 * (0.4 + (y - y0) / 120);
        ctx.fillStyle = shade(o.c1 || '#2a2522', h1 < 0.7 ? -0.35 : 0.12);
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.lineTo(x - s * 0.3, y - s * 0.6);
        ctx.lineTo(x + s * 0.7, y - s * 0.3);
        ctx.lineTo(x + s, y + s * 0.2);
        ctx.closePath();
        ctx.fill();
        if (hash(i * 11.3) < 0.25) {
          ctx.strokeStyle = rgba('#000000', 0.5);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y + 8);
          ctx.lineTo(x + 40 * hash(i), y + 30);
          ctx.lineTo(x + 70 * hash(i * 2), y + 36);
          ctx.stroke();
        }
      }
    }
    if (o.glowCracks) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const step = 160;
      const i0 = Math.floor(v.x0 / step) - 1, i1 = Math.ceil(v.x1 / step) + 1;
      for (let i = i0; i <= i1; i++) {
        if (hash(i * 4.4) < 0.5) continue;
        const x = i * step;
        ctx.strokeStyle = rgba(o.glowCracks, 0.55);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y0 + 6);
        for (let j = 1; j < 5; j++) ctx.lineTo(x + j * 30 + hash(i + j) * 30, y0 + 6 + j * 14 * hash(i * j + 1));
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  /* Silhouette ridge (mountains, ruins) drawn at parallax p; baseline in parallax world y. */
  BG.ridge = function (S, o) {
    const p = o.p == null ? 0.3 : o.p;
    const ctx = R.world(p);
    const v = R.view(p);
    const base = o.y == null ? 0 : o.y;
    const hgt = o.h || 200;
    const step = o.step || 60;
    ctx.save();
    ctx.fillStyle = o.c || '#1a1618';
    ctx.beginPath();
    const x0 = Math.floor(v.x0 / step) * step - step, x1 = v.x1 + step;
    ctx.moveTo(x0, base + 2000);
    for (let x = x0; x <= x1; x += step) {
      let y;
      if (o.kind === 'ruins') {
        const k = Math.floor(x / step);
        const tall = hash(k * 2.3 + (o.seed || 0));
        y = base - (tall < 0.35 ? hgt * 0.15 : hgt * (0.3 + tall * 0.9));
        ctx.lineTo(x, y);
        ctx.lineTo(x + step * (0.4 + hash(k) * 0.5), y);
        if (hash(k * 7.7) < 0.3) ctx.lineTo(x + step * 0.7, y - hgt * 0.3);
        ctx.lineTo(x + step * 0.9, base - hgt * 0.1);
        continue;
      } else if (o.kind === 'city') {
        const k = Math.floor(x / step);
        const r1 = hash(k * 1.7 + (o.seed || 0)), r2 = hash(k * 3.9 + (o.seed || 0)), r3 = hash(k * 7.3 + (o.seed || 0));
        const bw = step * (0.55 + r1 * 0.4);
        const bh = hgt * (0.25 + r2 * r2 * 0.95);
        ctx.lineTo(x, base);
        ctx.lineTo(x, base - bh);
        if (r3 < 0.22) {
          ctx.lineTo(x + bw * 0.35, base - bh);
          ctx.lineTo(x + bw * 0.5, base - bh - hgt * (0.25 + r1 * 0.35));
          ctx.lineTo(x + bw * 0.65, base - bh);
        } else if (r3 < 0.36) {
          ctx.lineTo(x + bw * 0.15, base - bh);
          ctx.quadraticCurveTo(x + bw * 0.5, base - bh - bw * 0.7, x + bw * 0.85, base - bh);
        }
        ctx.lineTo(x + bw, base - bh);
        ctx.lineTo(x + bw, base);
        ctx.lineTo(x + step, base);
        continue;
      } else if (o.kind === 'spires') {
        const k = Math.floor(x / step);
        const tall = hash(k * 3.1 + (o.seed || 0));
        ctx.lineTo(x, base - hgt * 0.12);
        if (tall > 0.55) {
          ctx.lineTo(x + step * 0.35, base - hgt * (0.6 + tall));
          ctx.lineTo(x + step * 0.5, base - hgt * (0.9 + tall * 1.2));
          ctx.lineTo(x + step * 0.65, base - hgt * (0.6 + tall));
        }
        ctx.lineTo(x + step, base - hgt * 0.12);
        continue;
      } else {
        y = base - hgt * (0.35 + 0.65 * (noise(x * 0.004 + (o.seed || 0)) * 0.5 + 0.5)) - hgt * 0.25 * noise(x * 0.017 + 3);
      }
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x1, base + 2000);
    ctx.closePath();
    ctx.fill();
    if (o.lights && o.kind === 'city') {
      ctx.globalCompositeOperation = 'lighter';
      for (let x = x0; x <= x1; x += step) {
        const k = Math.floor(x / step);
        const r1 = hash(k * 1.7 + (o.seed || 0)), r2 = hash(k * 3.9 + (o.seed || 0));
        const bw = step * (0.55 + r1 * 0.4), bh = hgt * (0.25 + r2 * r2 * 0.95);
        const cols = Math.max(1, Math.floor(bw / 14)), rows = Math.max(1, Math.floor(bh / 18));
        for (let cx = 0; cx < cols; cx++) for (let ry = 1; ry < rows; ry++) {
          if (hash(k * 131 + cx * 7 + ry * 13) < 0.72) continue;
          ctx.fillStyle = rgba(o.lights, 0.35 + 0.5 * hash(k + cx + ry));
          ctx.fillRect(x + 4 + cx * 14, base - ry * 18, 4, 6);
        }
      }
    } else if (o.lights) {
      ctx.globalCompositeOperation = 'lighter';
      for (let x = x0; x <= x1; x += 9) {
        const k = Math.floor(x / 9);
        if (hash(k * 1.3 + (o.seed || 0)) < 0.8) continue;
        ctx.fillStyle = rgba(o.lights, 0.5 + 0.5 * hash(k));
        ctx.fillRect(x, base - hgt * hash(k * 5.1) * 0.6 - 4, 2, 2);
      }
    }
    ctx.restore();
    if (o.haze) {
      const sctx = R.screen();
      const hy = R.toScreen(0, base - hgt * 0.2, p)[1];
      const g = sctx.createLinearGradient(0, hy - 200, 0, hy + 100);
      g.addColorStop(0, rgba(o.haze, 0));
      g.addColorStop(1, rgba(o.haze, o.hazeA || 0.35));
      sctx.fillStyle = g;
      sctx.fillRect(0, hy - 200, W, 300);
    }
  };

  /* Smoke columns rising far away */
  BG.smokeColumns = function (S, o) {
    const p = o.p || 0.35;
    const ctx = R.world(p);
    const t = S.T;
    for (let i = 0; i < (o.n || 5); i++) {
      const x = (hash(i * 3.3 + (o.seed || 0)) - 0.5) * (o.spread || 3000);
      for (let j = 0; j < 14; j++) {
        const k = j / 14;
        const y = (o.y || 0) - k * (o.h || 900) - ((t * 20) % 60);
        const r = 40 + k * 160;
        FX.soft(ctx, x + Math.sin(k * 5 + t * 0.2 + i) * 40 * k + k * 120, y, r, o.c || '#1a1412', 0.35 * (1 - k * 0.6));
      }
      if (o.fire) FX.glow(ctx, x, o.y || 0, 120, o.fire, 0.5);
    }
  };

  /* God rays from a point (screen space) */
  BG.rays = function (S, x, y, color, a, n) {
    const ctx = R.screen();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < (n || 9); i++) {
      const ang = Math.PI / 2 + (hash(i * 3.7) - 0.5) * 1.6 + Math.sin(S.T * 0.2 + i) * 0.05;
      const w = 0.03 + hash(i * 1.3) * 0.06;
      const L = 1800;
      const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L);
      g.addColorStop(0, rgba(color, a * (0.3 + hash(i) * 0.4)));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang - w) * L, y + Math.sin(ang - w) * L);
      ctx.lineTo(x + Math.cos(ang + w) * L, y + Math.sin(ang + w) * L);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- realms ---------- */

  /* Primordial Aegis Realms: luminous blueprint void where universes are templated. */
  BG.aegis = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(['#04121c', '#0a2233', '#07131d']);
    const ctx = R.world(0.25);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // blueprint rings
    for (let i = 0; i < 7; i++) {
      const x = (hash(i * 2.1) - 0.5) * 3000, y = -300 + (hash(i * 5.3) - 0.5) * 900;
      const r = 90 + hash(i * 7.7) * 260;
      for (let k = 0; k < 4; k++) FX.ring(ctx, x, y, r * (0.4 + k * 0.22), 1.5, '#5fd9ff', 0.28);
      ctx.strokeStyle = rgba('#7fe6ff', 0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a < TAU * 3; a += 0.1) {
        const rr = r * 0.1 + a * r * 0.045;
        const px = x + Math.cos(a + t * 0.1 * (i % 2 ? 1 : -1)) * rr, py = y + Math.sin(a + t * 0.1) * rr;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
    // grid floor
    const g = R.world(1);
    const v = R.view(1);
    g.save();
    g.fillStyle = vgrad(g, [[0, '#0b2a3a'], [1, '#031018']], 0, 900);
    g.fillRect(v.x0, 0, v.x1 - v.x0, 3000);
    g.strokeStyle = rgba('#6fe3ff', 0.22);
    g.lineWidth = 1.5;
    for (let x = Math.floor(v.x0 / 120) * 120; x < v.x1; x += 120) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x * 1.6, 1200);
      g.stroke();
    }
    for (let k = 0; k < 12; k++) {
      const y = Math.pow(k / 12, 1.8) * 900;
      g.beginPath();
      g.moveTo(v.x0, y);
      g.lineTo(v.x1, y);
      g.stroke();
    }
    g.restore();
    // floating monolith templates
    const m = R.world(0.5);
    for (let i = 0; i < 6; i++) {
      const x = (hash(i * 9.1) - 0.5) * 2600, y = -500 - hash(i * 3.3) * 500 + Math.sin(t * 0.4 + i) * 20;
      const w = 30 + hash(i) * 50, h = 120 + hash(i * 2) * 200;
      m.fillStyle = rgba('#bff3ff', 0.12);
      m.strokeStyle = rgba('#aef0ff', 0.5);
      m.lineWidth = 1.5;
      m.beginPath();
      m.moveTo(x, y - h / 2);
      m.lineTo(x + w / 2, y);
      m.lineTo(x, y + h / 2);
      m.lineTo(x - w / 2, y);
      m.closePath();
      m.fill();
      m.stroke();
    }
    FX.field(R.world(0.7), t, { n: 50, x0: -1600, x1: 1600, y0: -1100, y1: 100, vy: -12, size: 2, color: '#b8f2ff', alpha: 0.6, kind: 'dot', twinkle: true, seed: 12 });
  };

  /* Celestial Veil: shifting light curtains (war council of powers). */
  BG.veil = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(['#0c0618', '#1a0c2e', '#0a0512']);
    const ctx = R.screen();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cols = o.cols || ['#6b3cff', '#ff5ac8', '#4ad6ff', '#ffd36a'];
    for (let i = 0; i < 7; i++) {
      const c = cols[i % cols.length];
      ctx.beginPath();
      const y0 = 120 + i * 90;
      ctx.moveTo(0, y0);
      for (let x = 0; x <= W; x += 40) {
        ctx.lineTo(x, y0 + Math.sin(x * 0.004 + t * 0.35 + i * 1.3) * 90 + Math.sin(x * 0.011 - t * 0.2 + i) * 30);
      }
      ctx.lineTo(W, y0 + 300);
      ctx.lineTo(0, y0 + 300);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, y0 - 100, 0, y0 + 300);
      g.addColorStop(0, rgba(c, 0));
      g.addColorStop(0.4, rgba(c, 0.12));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.restore();
    BG.stars(t, 0.1, 140, 21, { size: 1.8, alpha: 0.6 });
    // luminous floor
    const f = R.world(1);
    const v = R.view(1);
    const g = f.createLinearGradient(0, 0, 0, 600);
    g.addColorStop(0, rgba('#c9b6ff', 0.35));
    g.addColorStop(0.05, rgba('#2a1c48', 0.9));
    g.addColorStop(1, '#07040d');
    f.fillStyle = g;
    f.fillRect(v.x0, 0, v.x1 - v.x0, 3000);
    f.save();
    f.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) FX.ring(f, 0, 30, 300 + i * 260, 2, '#b89bff', 0.25, 0.12);
    f.restore();
  };

  /* Flood citadel terrace at dusk over a vast city. */
  BG.citadel = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(o.sky || ['#1a1030', '#3e2244', '#9a4a44', '#f0a060']);
    const ctx = R.screen();
    const sunY = R.toScreen(0, -140, 0.05)[1];
    FX.glow(ctx, W * 0.72, sunY, 520, '#ffb070', 0.55);
    FX.glow(ctx, W * 0.72, sunY, 110, '#fff0c0', 0.85, true);
    BG.stars(t, 0.05, 80, 5, { size: 1.5, alpha: 0.35, y0: -1500, h: 900 });
    BG.ridge(S, { p: 0.06, y: -60, h: 160, c: '#5a2e44', seed: 3, haze: '#e0906a', hazeA: 0.25 });
    BG.ridge(S, { p: 0.14, y: 40, h: 300, c: '#3a1f36', kind: 'city', step: 46, seed: 5, lights: '#ffcf90', haze: '#c07060', hazeA: 0.2 });
    BG.ridge(S, { p: 0.28, y: 90, h: 420, c: '#26142a', kind: 'city', step: 90, seed: 8, lights: '#ffd6a0' });
    // terrace floor
    const f = R.world(1);
    const v = R.view(1);
    f.fillStyle = vgrad(f, [[0, '#3a3440'], [0.02, '#221e28'], [1, '#0d0b10']], 0, 600);
    f.fillRect(v.x0, 0, v.x1 - v.x0, 3000);
    f.strokeStyle = rgba('#ffffff', 0.06);
    f.lineWidth = 2;
    for (let x = Math.floor(v.x0 / 200) * 200; x < v.x1; x += 200) {
      f.beginPath();
      f.moveTo(x, 0);
      f.lineTo(x * 1.4, 700);
      f.stroke();
    }
    if (o.rail !== false) {
      const rr = R.world(0.9);
      const vr = R.view(0.9);
      rr.fillStyle = '#16121a';
      for (let x = Math.floor(vr.x0 / 70) * 70; x < vr.x1; x += 70) rr.fillRect(x, -70, 12, 70);
      rr.fillRect(vr.x0, -80, vr.x1 - vr.x0, 14);
      rr.fillStyle = rgba('#ffb070', 0.18);
      rr.fillRect(vr.x0, -80, vr.x1 - vr.x0, 3);
    }
  };

  /* Ruined battlefield. mood: 'fire' | 'dusk' | 'gray' | 'storm' | 'night' */
  BG.battlefield = function (S, o) {
    o = o || {};
    const t = S.T;
    const mood = o.mood || 'fire';
    const P = {
      fire: { sky: ['#140606', '#3a0f0a', '#8a2a12', '#d0602a'], r1: '#2a1210', r2: '#1a0b0a', r3: '#120807', g1: '#2e211c', haze: '#ff6a2a', glow: '#ff7a30' },
      dusk: { sky: ['#0b0a18', '#2a1a36', '#6a3040', '#b06050'], r1: '#2a1c2c', r2: '#1c1320', r3: '#120c14', g1: '#2a2226', haze: '#c07060', glow: '#ffb070' },
      gray: { sky: ['#1a1a1c', '#2e2e30', '#4a4a4c', '#6a6a6a'], r1: '#3a3a3c', r2: '#2a2a2c', r3: '#1c1c1e', g1: '#333335', haze: '#8a8a8a', glow: '#bbbbbb' },
      storm: { sky: ['#07070c', '#12121c', '#22202e', '#3a3446'], r1: '#1c1a24', r2: '#14121a', r3: '#0c0b10', g1: '#1e1c22', haze: '#6a6a80', glow: '#9a9ab0' },
      night: { sky: ['#03040a', '#0a0c1a', '#161a2e', '#232842'], r1: '#161826', r2: '#10121c', r3: '#0a0b12', g1: '#1a1b22', haze: '#4a5070', glow: '#8090c0' },
    }[mood];
    BG.sky(o.sky || P.sky);
    if (mood === 'night' || mood === 'storm') BG.stars(t, 0.05, 120, 9, { size: 1.5, alpha: 0.4, y0: -1500, h: 1000 });
    const ctx = R.screen();
    if (mood === 'fire' || mood === 'dusk') FX.glow(ctx, W * (o.sunX || 0.3), H * 0.7, 520, P.glow, 0.45);
    if (o.giants) o.giants(S);
    BG.ridge(S, { p: 0.1, y: -20, h: 220, c: P.r1, seed: 2, haze: P.haze, hazeA: 0.25 });
    if (o.smoke !== false) BG.smokeColumns(S, { p: 0.2, y: 0, n: 4, seed: 4, c: mood === 'gray' ? '#555' : '#1a1210', fire: mood === 'fire' ? '#ff5a20' : null });
    BG.ridge(S, { p: 0.3, y: 20, h: 200, c: P.r2, kind: 'ruins', step: 70, seed: 6, haze: P.haze, hazeA: 0.2 });
    BG.ridge(S, { p: 0.55, y: 40, h: 150, c: P.r3, kind: 'ruins', step: 90, seed: 9 });
    BG.ground(S, { c1: P.g1, c2: '#080607', glowCracks: mood === 'fire' ? '#ff5a1a' : null, seed: o.seed || 1 });
    if (o.embers !== false && mood === 'fire') FX.field(R.world(0.8), t, { n: 60, x0: -2200, x1: 2200, y0: -1200, y1: 100, vy: -40, vx: 20, size: 3, color: ['#ff9a3a', '#ffcf6a', '#ff5a1a'], kind: 'ember', alpha: 0.8, seed: 4, wobble: 12 });
    if (mood === 'gray') FX.field(R.world(0.8), t, { n: 70, x0: -2200, x1: 2200, y0: -1200, y1: 100, vy: 25, vx: -10, size: 3, color: ['#9a9a9a', '#6a6a6a'], kind: 'ash', alpha: 0.6, seed: 8 });
  };

  /* A dead universe: colorless, dead stars, the region an army boxed the Unmaker into. */
  BG.dead = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(['#0c0c0d', '#18181a', '#222224']);
    BG.stars(t, 0.06, 90, 31, { size: 2, alpha: 0.35 });
    const ctx = R.world(0.12);
    for (let i = 0; i < 5; i++) {
      const x = (hash(i * 4.1) - 0.5) * 2600, y = -700 + hash(i * 2.2) * 400;
      const r = 30 + hash(i) * 80;
      ctx.fillStyle = '#2c2c2e';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#3c3c3e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    BG.ridge(S, { p: 0.25, y: 10, h: 180, c: '#1e1e20', kind: 'ruins', step: 120, seed: 13 });
    if (!o.noGround) BG.ground(S, { c1: '#2a2a2b', c2: '#0e0e0f', seed: 5 });
    FX.field(R.world(0.8), t, { n: 50, x0: -2200, x1: 2200, y0: -1200, y1: 100, vy: 18, vx: -6, size: 3, color: ['#8a8a8a', '#5a5a5a'], kind: 'ash', alpha: 0.5, seed: 18 });
  };

  /* Nowhere: the idea of place removed. k = 0..1 how much place remains. */
  BG.nowhere = function (S, o) {
    o = o || {};
    const t = S.T;
    const k = o.k == null ? 0 : o.k;
    const ctx = R.screen();
    ctx.fillStyle = mix('#7a7a7a', '#1b1b1d', k);
    ctx.fillRect(0, 0, W, H);
    // perspective lines that fail to agree
    ctx.save();
    ctx.strokeStyle = rgba('#000000', 0.25 * (1 - k));
    ctx.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      const f = Math.floor(t * 3 + i);
      const x1 = hash(f * 1.3 + i) * W, y1 = hash(f * 2.7) * H;
      const a = hash(i * 9.1 + f) * TAU;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + Math.cos(a) * 900, y1 + Math.sin(a) * 900);
      ctx.stroke();
    }
    ctx.restore();
    FX.staticBlocks(ctx, t, W / 2, H / 2, W, H, 40, 3, 0.7 * (1 - k));
  };

  /* Floor of light rebuilt by Chase: navigable arena. k = 0..1 built amount, cx = origin */
  BG.lightFloor = function (S, k, cx, color) {
    if (k <= 0) return;
    const ctx = R.world(1);
    const v = R.view(1);
    const c = color || '#bcd9ff';
    const w = (v.x1 - v.x0) * UW.Ease.out3(k) + 200;
    const x0 = (cx || 0) - w / 2, x1 = (cx || 0) + w / 2;
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, 500);
    g.addColorStop(0, rgba('#20283a', 0.95 * k));
    g.addColorStop(1, rgba('#0a0d14', 0.95 * k));
    ctx.fillStyle = g;
    ctx.fillRect(x0, 0, x1 - x0, 3000);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(c, 0.8 * k);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x1, 0);
    ctx.stroke();
    ctx.strokeStyle = rgba(c, 0.2 * k);
    ctx.lineWidth = 1.5;
    for (let x = Math.floor(x0 / 100) * 100; x < x1; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo((x - (cx || 0)) * 1.8 + (cx || 0), 900);
      ctx.stroke();
    }
    for (let j = 1; j < 8; j++) {
      const y = Math.pow(j / 8, 1.7) * 700;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }
    ctx.restore();
    // horizon line in sky
    const s = R.screen();
    const hy = R.toScreen(0, -30, 0.2)[1];
    s.save();
    s.globalCompositeOperation = 'lighter';
    s.fillStyle = rgba(c, 0.25 * k);
    s.fillRect(W / 2 - W * k / 2, hy, W * k, 2);
    s.restore();
  };

  /* Tapestry of Narratives: vast woven threads. */
  BG.tapestry = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(['#07060d', '#120d22', '#0a0814']);
    const ctx = R.world(0.35);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const y = -1200 + i * 32;
      const c = i % 7 === 0 ? '#ffe7a8' : i % 3 === 0 ? '#a8c8ff' : '#d8c8ff';
      ctx.strokeStyle = rgba(c, 0.1 + hash(i) * 0.18);
      ctx.lineWidth = 1 + hash(i * 3) * 1.5;
      ctx.beginPath();
      for (let x = -2600; x <= 2600; x += 60) {
        const yy = y + Math.sin(x * 0.003 + i * 0.7 + t * 0.2) * 24;
        if (x === -2600) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 50; i++) {
      const x = -2400 + i * 100;
      ctx.strokeStyle = rgba('#ffffff', 0.05 + hash(i * 5) * 0.08);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, -1300);
      ctx.bezierCurveTo(x + 60, -600, x - 60, 0, x + 20, 900);
      ctx.stroke();
    }
    ctx.restore();
    FX.field(R.world(0.6), t, { n: 60, x0: -2000, x1: 2000, y0: -1200, y1: 300, vx: 8, size: 2.5, color: ['#ffe7a8', '#cfd8ff'], kind: 'star', alpha: 0.7, twinkle: true, seed: 33 });
  };

  /* Red Hall of the Apostles */
  BG.redHall = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(['#120204', '#2a0508', '#3a0a0c']);
    const ctx = R.world(0.5);
    const v = R.view(0.5);
    for (let x = Math.floor(v.x0 / 380) * 380; x < v.x1 + 380; x += 380) {
      ctx.fillStyle = '#1a0406';
      ctx.fillRect(x - 50, -1400, 100, 1500);
      ctx.fillStyle = '#240609';
      ctx.fillRect(x - 70, -40, 140, 40);
      ctx.fillRect(x - 70, -1000, 140, 40);
      // gothic arch
      ctx.strokeStyle = '#2c080b';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(x + 50, -700);
      ctx.quadraticCurveTo(x + 190, -1000, x + 330, -700);
      ctx.stroke();
      FX.glow(ctx, x + 190, -560, 120, '#ff2a1a', 0.18 + 0.05 * Math.sin(t * 3 + x));
    }
    // banners
    for (let x = Math.floor(v.x0 / 380) * 380; x < v.x1 + 380; x += 380) {
      ctx.fillStyle = '#5a0a10';
      ctx.beginPath();
      ctx.moveTo(x + 130, -900);
      ctx.lineTo(x + 250, -900);
      ctx.lineTo(x + 250, -500);
      ctx.lineTo(x + 190, -540);
      ctx.lineTo(x + 130, -500);
      ctx.closePath();
      ctx.fill();
    }
    const f = R.world(1);
    const vv = R.view(1);
    f.fillStyle = vgrad(f, [[0, '#2a0a0c'], [1, '#070102']], 0, 600);
    f.fillRect(vv.x0, 0, vv.x1 - vv.x0, 3000);
    f.save();
    f.globalAlpha = 0.25;
    f.fillStyle = '#5a1014';
    f.fillRect(vv.x0, 0, vv.x1 - vv.x0, 3);
    f.restore();
  };

  /* High above an inhabited realm — planet curve, city lights, thin atmosphere. */
  BG.orbit = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.space(S, { neb: ['#0c1a3a', '#1a0e30', '#0a2a3a'], key: 'orbit', seed: 7, nebA: 0.6 });
    const ctx = R.world(o.p || 0.4);
    const R0 = o.r || 5200;
    const cy = (o.y || 900) + R0;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, cy, R0, 0, TAU);
    const g = ctx.createRadialGradient(0, cy, R0 * 0.9, 0, cy, R0);
    g.addColorStop(0, '#07101a');
    g.addColorStop(0.97, '#10304a');
    g.addColorStop(1, '#3a7abf');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 600; i++) {
      const a = -Math.PI / 2 + (hash(i * 1.1) - 0.5) * 0.9;
      const rr = R0 * (0.94 + hash(i * 2.3) * 0.055);
      const cl = hash(Math.floor(i / 12) * 3.3);
      if (cl < 0.4) continue;
      ctx.fillStyle = rgba('#ffcf7a', 0.35 + hash(i) * 0.5);
      ctx.fillRect(Math.cos(a) * rr, cy + Math.sin(a) * rr, 2.5, 2.5);
    }
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba('#6ab8ff', 0.5);
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, cy, R0 + 6, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.strokeStyle = rgba('#bfe4ff', 0.35);
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.arc(0, cy, R0 + 22, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.restore();
  };

  /* Malevolor's pocket dimension: red sky, black manor, a lawn. */
  BG.lawn = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.sky(['#12020a', '#3a0612', '#6a0e16', '#2a0408']);
    const ctx = R.screen();
    FX.glow(ctx, W * 0.26, H * 0.34, 160, '#ff3a2a', 0.5);
    ctx.fillStyle = '#ffd0c0';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(W * 0.26, H * 0.34, 46, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    // manor silhouette
    const m = R.world(0.3);
    m.fillStyle = '#0a0205';
    m.beginPath();
    m.moveTo(300, 20);
    m.lineTo(300, -300);
    m.lineTo(360, -360);
    m.lineTo(420, -300);
    m.lineTo(420, -220);
    m.lineTo(700, -220);
    m.lineTo(760, -420);
    m.lineTo(820, -220);
    m.lineTo(1100, -220);
    m.lineTo(1100, 20);
    m.closePath();
    m.fill();
    for (let i = 0; i < 8; i++) {
      m.fillStyle = rgba('#ff5a3a', 0.35 + 0.1 * Math.sin(t + i));
      m.fillRect(460 + i * 75, -170, 18, 30);
    }
    // lone dead tree
    const tr = R.world(0.6);
    tr.strokeStyle = '#0a0306';
    tr.lineCap = 'round';
    function branch(x, y, a, l, w, d) {
      if (d > 6 || l < 6) return;
      const x2 = x + Math.sin(a) * l, y2 = y - Math.cos(a) * l;
      tr.lineWidth = w;
      tr.beginPath();
      tr.moveTo(x, y);
      tr.lineTo(x2, y2);
      tr.stroke();
      branch(x2, y2, a - 0.4 - hash(d * 3 + l) * 0.3, l * 0.72, w * 0.68, d + 1);
      branch(x2, y2, a + 0.35 + hash(d * 7 + l) * 0.3, l * 0.7, w * 0.66, d + 1);
    }
    branch(-700, 20, 0.05, 150, 26, 0);
    // lawn
    const f = R.world(1);
    const v = R.view(1);
    f.fillStyle = vgrad(f, [[0, '#1a2a12'], [1, '#050803']], 0, 500);
    f.fillRect(v.x0, 0, v.x1 - v.x0, 3000);
    f.strokeStyle = '#0c1508';
    f.lineWidth = 2;
    for (let x = Math.floor(v.x0 / 12) * 12; x < v.x1; x += 12) {
      const hh = 8 + hash(x * 0.37) * 14;
      const sway = Math.sin(t * 1.2 + x * 0.01) * 3;
      f.beginPath();
      f.moveTo(x, 2);
      f.lineTo(x + sway, -hh);
      f.stroke();
    }
    FX.field(R.world(0.9), t, { n: 30, x0: -1600, x1: 1600, y0: -900, y1: 50, vx: 6, vy: 4, size: 2.5, color: ['#ff6a4a'], kind: 'ember', alpha: 0.4, seed: 44 });
  };

  /* Shadow Verse: black-purple, drifting shadow shapes. */
  BG.shadowVerse = function (S, o) {
    const t = S.T;
    BG.sky(['#030104', '#0c0512', '#050208']);
    const ctx = R.world(0.4);
    for (let i = 0; i < 16; i++) {
      const x = (hash(i * 3.1) - 0.5) * 3000 + Math.sin(t * 0.2 + i) * 60;
      const y = -600 + hash(i * 1.7) * 800;
      FX.soft(ctx, x, y, 200 + hash(i) * 300, i % 3 ? '#1a0a28' : '#2a0e3a', 0.6);
    }
    FX.field(R.world(0.7), t, { n: 50, x0: -2000, x1: 2000, y0: -1200, y1: 200, vy: -10, size: 2, color: ['#8a4aff', '#5a2aaa'], kind: 'glow', alpha: 0.35, seed: 71 });
    const f = R.world(1);
    const v = R.view(1);
    f.fillStyle = vgrad(f, [[0, '#120818'], [1, '#020103']], 0, 400);
    f.fillRect(v.x0, 0, v.x1 - v.x0, 3000);
  };

  /* Celestial River: star-water flowing, lantern boats. */
  BG.river = function (S, o) {
    o = o || {};
    const t = S.T;
    BG.space(S, { neb: ['#1a1440', '#0a2a4a', '#3a1a4a'], key: 'river', seed: 4, nebA: 0.7 });
    const f = R.world(1);
    const v = R.view(1);
    const g = f.createLinearGradient(0, -20, 0, 600);
    g.addColorStop(0, '#1a2a5a');
    g.addColorStop(1, '#040814');
    f.fillStyle = g;
    f.fillRect(v.x0, -10, v.x1 - v.x0, 3000);
    f.save();
    f.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 160; i++) {
      const y = hash(i * 2.3) * 500;
      const sp = 60 + hash(i) * 120;
      const x = v.x0 + (((hash(i * 7.1) * 3000 + t * sp) % 3000) + 3000) % 3000;
      const s = 1 + (y / 500) * 3;
      f.fillStyle = rgba(hash(i) < 0.3 ? '#ffe7a8' : '#bcd4ff', 0.5 + hash(i * 3) * 0.4);
      f.fillRect(x, y, s * 3, s * 0.7);
    }
    f.restore();
  };

  /* Undefined wound through several realities: layered realms split by a void seam. k opening 0..1 */
  BG.wound = function (S, o) {
    o = o || {};
    const t = S.T;
    const k = o.k == null ? 1 : o.k;
    BG.space(S, { neb: ['#2a1a5a', '#5a1a3a', '#1a3a5a'], key: 'wound', seed: 9, nebA: 0.8 });
    const ctx = R.world(o.p || 0.6);
    ctx.save();
    // layered realities as tilted slabs
    const slabs = [['#3a5a8a', -500], ['#6a3a5a', -250], ['#3a6a4a', 0], ['#8a6a3a', 250]];
    slabs.forEach(([c, y], i) => {
      ctx.fillStyle = rgba(c, 0.25);
      ctx.beginPath();
      ctx.moveTo(-3000, y + Math.sin(t * 0.3 + i) * 10);
      ctx.lineTo(3000, y - 120 + Math.sin(t * 0.3 + i) * 10);
      ctx.lineTo(3000, y - 40);
      ctx.lineTo(-3000, y + 80);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
    // the wound seam
    const cx = o.x || 0, cy = o.y || -300;
    const h = 1400 * k, w = 260 * k;
    ctx.save();
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const y = cy - h / 2 + u * h;
      const wid = w * Math.sin(Math.PI * u) * (0.7 + 0.3 * noise(u * 8 + t * 2));
      pts.push([cx + wid + noise(u * 13 + t) * 20, y]);
    }
    for (let i = 40; i >= 0; i--) {
      const u = i / 40;
      const y = cy - h / 2 + u * h;
      const wid = w * Math.sin(Math.PI * u) * (0.7 + 0.3 * noise(u * 9 - t * 2));
      pts.push([cx - wid + noise(u * 11 - t) * 20, y]);
    }
    FX.darkGlow(ctx, cx, cy, w * 3 + 200, 0.8 * k);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    UW.poly(ctx, pts, true);
    ctx.fill();
    FX.brokenOutline(ctx, pts, t, 'rgba(220,220,220,0.9)', 3, k, 5, 14);
    ctx.restore();
    S.woundPts = pts;
  };

  /* The stabilized reality — soft, no hard edges, definitions that do not hurt. k = 0..1 */
  BG.stable = function (S, o) {
    o = o || {};
    const t = S.T;
    const k = o.k == null ? 1 : o.k;
    const ctx = R.screen();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix('#1a1622', '#f3dcc8', k * 0.9));
    g.addColorStop(0.55, mix('#221c2a', '#e8c9d8', k * 0.9));
    g.addColorStop(1, mix('#0e0c12', '#b9a6c8', k * 0.9));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    FX.glow(ctx, W * 0.5, H * 0.58, 700, '#fff3e0', 0.35 * k);
    // soft rolling hills, no outlines
    for (let l = 0; l < 3; l++) {
      const p = 0.2 + l * 0.25;
      const c = R.world(p);
      const v = R.view(p);
      c.fillStyle = rgba(mix('#2a2233', ['#d9b9cf', '#c6a8c4', '#b096b8'][l], k), 0.9);
      c.beginPath();
      c.moveTo(v.x0, 2000);
      for (let x = v.x0; x <= v.x1 + 40; x += 40) c.lineTo(x, 40 * l - 60 - 90 * (noise(x * 0.0025 + l * 7) * 0.5 + 0.5) + Math.sin(t * 0.2 + l) * 4);
      c.lineTo(v.x1 + 40, 2000);
      c.closePath();
      c.fill();
    }
    FX.field(R.world(0.7), t, { n: 70, x0: -2000, x1: 2000, y0: -1100, y1: 200, vy: -8, vx: 4, size: 3, color: ['#fff6e8', '#ffd9e6'], kind: 'glow', alpha: 0.5 * k, seed: 91, wobble: 20 });
  };

  /* Hall of Remembrance where the Silent Judges write names. */
  BG.judgesHall = function (S, o) {
    const t = S.T;
    BG.sky(['#05060a', '#0b0d14', '#101320']);
    const ctx = R.world(0.35);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const x = -2400 + i * 190;
      for (let j = 0; j < 30; j++) {
        const y = -1300 + j * 42 - ((t * 10 + i * 13) % 42);
        ctx.fillStyle = rgba('#dfe6ff', 0.05 + hash(i * 30 + j) * 0.12);
        ctx.fillRect(x, y, 60 + hash(i + j * 7) * 70, 3);
      }
    }
    ctx.restore();
    const f = R.world(1);
    const v = R.view(1);
    f.fillStyle = vgrad(f, [[0, '#1a1c26'], [1, '#040508']], 0, 500);
    f.fillRect(v.x0, 0, v.x1 - v.x0, 3000);
  };

  /* Nexus lab — cold white room (memory). */
  BG.lab = function (S, o) {
    const t = S.T;
    BG.sky(['#c8d2d6', '#aeb9be', '#8d989e']);
    const c = R.world(0.6);
    const v = R.view(0.6);
    for (let x = Math.floor(v.x0 / 240) * 240; x < v.x1; x += 240) {
      c.fillStyle = '#9aa6ac';
      c.fillRect(x, -900, 8, 1000);
      c.fillStyle = rgba('#ffffff', 0.5);
      c.fillRect(x + 40, -820, 150, 26);
    }
    const f = R.world(1);
    const vv = R.view(1);
    f.fillStyle = vgrad(f, [[0, '#7e8a90'], [1, '#3a4246']], 0, 500);
    f.fillRect(vv.x0, 0, vv.x1 - vv.x0, 3000);
  };
})();
