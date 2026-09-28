/* The Unmaker War — renderer: canvas sizing, camera, offscreen caches, post effects. */
(function () {
  'use strict';
  const UW = window.UW;
  const { W, H } = UW;

  const R = (UW.R = {
    canvas: null,
    ctx: null,
    s: 1, // backing pixels per logical pixel
    quality: 1,
    cam: { x: 0, y: 0, z: 1, r: 0, sx: 0, sy: 0 },
    caches: new Map(),
  });

  R.init = function (canvas) {
    R.canvas = canvas;
    R.ctx = canvas.getContext('2d', { alpha: false });
    R.resize();
  };

  /* Size the backing store to the displayed size (capped at 1920 wide), times quality. */
  R.resize = function (force) {
    const c = R.canvas;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let bw = Math.min(W, Math.max(320, rect.width * dpr));
    if (R.fixedWidth) bw = R.fixedWidth;
    bw = Math.round(bw * R.quality);
    const bh = Math.round(bw * H / W);
    if (force || c.width !== bw || c.height !== bh) {
      c.width = bw;
      c.height = bh;
    }
    R.s = c.width / W;
  };

  R.begin = function (bg) {
    const ctx = R.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = bg || '#000';
    ctx.fillRect(0, 0, R.canvas.width, R.canvas.height);
    ctx.setTransform(R.s, 0, 0, R.s, 0, 0);
    const cam = R.cam;
    cam.x = 0; cam.y = 0; cam.z = 1; cam.r = 0; cam.sx = 0; cam.sy = 0;
  };

  R.setCam = function (x, y, z, r) {
    const cam = R.cam;
    if (x != null) cam.x = x;
    if (y != null) cam.y = y;
    if (z != null) cam.z = z;
    if (r != null) cam.r = r;
  };

  /* Camera shake with noise; amp in logical px. */
  R.shake = function (t, amp, freq) {
    if (!amp) return;
    freq = freq || 22;
    R.cam.sx += UW.noise(t * freq + 11.3) * amp;
    R.cam.sy += UW.noise(t * freq + 71.9) * amp * 0.8;
    R.cam.r += UW.noise(t * freq * 0.7 + 5.1) * amp * 0.0004;
  };

  /* World transform with parallax factor p (1 = world, 0 = fixed to screen). */
  R.world = function (p) {
    if (p == null) p = 1;
    const ctx = R.ctx, cam = R.cam;
    ctx.setTransform(R.s, 0, 0, R.s, 0, 0);
    ctx.translate(W / 2 + cam.sx * (0.3 + 0.7 * p), H / 2 + cam.sy * (0.3 + 0.7 * p));
    ctx.rotate(cam.r * p);
    const z = 1 + (cam.z - 1) * p;
    ctx.scale(z, z);
    ctx.translate(-cam.x * p, -cam.y * p);
    return ctx;
  };

  R.screen = function () {
    R.ctx.setTransform(R.s, 0, 0, R.s, 0, 0);
    return R.ctx;
  };

  R.toScreen = function (x, y, p) {
    if (p == null) p = 1;
    const cam = R.cam;
    const z = 1 + (cam.z - 1) * p;
    let dx = (x - cam.x * p) * z, dy = (y - cam.y * p) * z;
    const c = Math.cos(cam.r * p), s = Math.sin(cam.r * p);
    return [W / 2 + cam.sx + dx * c - dy * s, H / 2 + cam.sy + dx * s + dy * c];
  };

  /* Visible world rect (approx, ignoring rotation) for parallax p. */
  R.view = function (p) {
    if (p == null) p = 1;
    const cam = R.cam;
    const z = 1 + (cam.z - 1) * p;
    const hw = W / 2 / z + 40, hh = H / 2 / z + 40;
    return { x0: cam.x * p - hw, x1: cam.x * p + hw, y0: cam.y * p - hh, y1: cam.y * p + hh, z };
  };

  /* Offscreen caches (LRU). */
  R.makeCanvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  };
  R.cache = function (key, w, h, draw) {
    let e = R.caches.get(key);
    if (e) {
      R.caches.delete(key);
      R.caches.set(key, e);
      return e;
    }
    e = R.makeCanvas(w, h);
    draw(e.getContext('2d'), e.width, e.height);
    R.caches.set(key, e);
    if (R.caches.size > 48) {
      const first = R.caches.keys().next().value;
      R.caches.delete(first);
    }
    return e;
  };

  /* A persistent copy of the frame, so effects never draw the canvas onto itself
     (a self-draw allocates a full snapshot every call and floods the heap). */
  let scratch = null;
  R.snapshot = function () {
    const c = R.canvas;
    if (!scratch) scratch = R.makeCanvas(c.width, c.height);
    if (scratch.width !== c.width || scratch.height !== c.height) {
      scratch.width = c.width;
      scratch.height = c.height;
    }
    const g = scratch.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'copy';
    g.drawImage(c, 0, 0);
    g.globalCompositeOperation = 'source-over';
    return scratch;
  };

  /* ---------- Post effects (all in screen space) ---------- */
  let vigGrad = null;
  R.vignette = function (a, color) {
    if (a <= 0) return;
    const ctx = R.screen();
    if (!vigGrad) {
      vigGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 1.0);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(0.6, 'rgba(0,0,0,0.35)');
      vigGrad.addColorStop(1, 'rgba(0,0,0,1)');
    }
    ctx.save();
    ctx.globalAlpha = UW.sat(a);
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);
    if (color) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = color;
      ctx.globalAlpha = UW.sat(a) * 0.5;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  };

  let grainCanvas = null;
  R.grain = function (a, t) {
    if (a <= 0 || UW.LITE) return;
    if (!grainCanvas) {
      grainCanvas = R.makeCanvas(256, 256);
      const g = grainCanvas.getContext('2d');
      const img = g.createImageData(256, 256);
      const r = UW.rng(7);
      for (let i = 0; i < img.data.length; i += 4) {
        const light = r() < 0.5;
        const v = light ? 255 : 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = Math.floor(r() * 90);
      }
      g.putImageData(img, 0, 0);
    }
    const ctx = R.screen();
    ctx.save();
    ctx.globalAlpha = UW.sat(a * 1.6);
    const pat = ctx.createPattern(grainCanvas, 'repeat');
    const f = Math.floor(t * 24);
    ctx.translate(-UW.hash(f) * 256, -UW.hash(f + 3.7) * 256);
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
  };

  R.letterbox = function (a) {
    if (a <= 0) return;
    const ctx = R.screen();
    const h = 132 * UW.sat(a);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, h);
    ctx.fillRect(0, H - h, W, h);
  };

  R.flash = function (color, a, mode) {
    if (a <= 0) return;
    const ctx = R.screen();
    ctx.save();
    ctx.globalAlpha = UW.sat(a);
    ctx.globalCompositeOperation = mode || 'source-over';
    ctx.fillStyle = color;
    ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.restore();
  };

  R.grade = function (color, a, mode) {
    if (a <= 0) return;
    R.flash(color, a, mode || 'soft-light');
  };

  /* Drain color from the frame (Unmaker proximity). */
  R.desat = function (a) {
    if (a <= 0) return;
    R.flash('#808080', a, 'saturation');
  };

  /* Horizontal slice displacement glitch. */
  R.glitch = function (amount, t, seed) {
    if (amount <= 0) return;
    const ctx = R.ctx, c = R.canvas;
    const cw = c.width, ch = c.height;
    const f = Math.floor(t * 18) + (seed || 0) * 131;
    const n = Math.floor(2 + amount * 10);
    const src = R.snapshot();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < n; i++) {
      if (UW.hash(f * 3.1 + i * 7.7) > 0.35 + amount * 0.4) continue;
      const y = Math.floor(UW.hash(f + i * 13.13) * ch);
      const hh = Math.max(2, Math.floor((0.004 + UW.hash(f * 1.7 + i) * 0.05 * amount) * ch));
      const dx = Math.round((UW.hash(f * 2.3 + i * 3.3) - 0.5) * 0.12 * cw * amount);
      ctx.drawImage(src, 0, y, cw, hh, dx, y, cw, hh);
      if (UW.hash(i + f * 0.37) < 0.3 * amount) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = UW.hash(i + f) < 0.5 ? '#000' : '#9a9a9a';
        ctx.fillRect(Math.floor(UW.hash(f + i * 5) * cw), y, Math.floor(UW.hash(f + i * 9) * cw * 0.3), hh);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  };

  /* Ghost double image (impact aberration). */
  R.doubleImage = function (a, dx, dy) {
    if (a <= 0) return;
    const ctx = R.ctx, c = R.canvas;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const src = R.snapshot();
    ctx.globalAlpha = UW.sat(a) * 0.5;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(src, (dx || 8) * R.s, (dy || 0) * R.s);
    ctx.restore();
  };

  /* Radial zoom smear for big impacts. */
  R.zoomBlur = function (a, cx, cy, steps) {
    if (a <= 0) return;
    const ctx = R.ctx, c = R.canvas;
    steps = steps || 3;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const px = (cx == null ? W / 2 : cx) * R.s, py = (cy == null ? H / 2 : cy) * R.s;
    const src = R.snapshot();
    for (let i = 1; i <= steps; i++) {
      const k = 1 + 0.025 * i * a;
      ctx.globalAlpha = 0.22 * a;
      ctx.drawImage(src, px - px * k, py - py * k, c.width * k, c.height * k);
    }
    ctx.restore();
  };
})();
