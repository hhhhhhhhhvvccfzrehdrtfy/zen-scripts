/* The Unmaker War — core utilities: math, easing, keyframes, noise, color. */
(function () {
  'use strict';
  const UW = (window.UW = window.UW || {});
  UW.W = 1920;
  UW.H = 1080;
  UW.FT = 40; // pixels per foot at zoom 1

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sat = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const unlerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
  const remap = (v, a, b, c, d) => lerp(c, d, sat(unlerp(a, b, v)));
  const fract = (x) => x - Math.floor(x);

  const Ease = {
    lin: (t) => t,
    in: (t) => t * t,
    out: (t) => 1 - (1 - t) * (1 - t),
    io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    in3: (t) => t * t * t,
    out3: (t) => 1 - Math.pow(1 - t, 3),
    io3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    in5: (t) => t * t * t * t * t,
    out5: (t) => 1 - Math.pow(1 - t, 5),
    expoOut: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    expoIn: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    outBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    inBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return c3 * t * t * t - c1 * t * t;
    },
    outElastic: (t) =>
      t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1,
    step: (t) => (t < 1 ? 0 : 1),
    hold: () => 0,
    smooth: (t) => t * t * (3 - 2 * t),
  };

  function easeFn(e) {
    if (!e) return Ease.io;
    if (typeof e === 'function') return e;
    return Ease[e] || Ease.io;
  }

  /* Keyframes: K(t, [[t0, v0], [t1, v1, ease], ...]) — values may be numbers or arrays.
     The ease on a key describes the approach into that key. */
  function K(t, keys, defEase) {
    const n = keys.length;
    if (!n) return 0;
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0;
    while (i < n - 1 && keys[i + 1][0] <= t) i++;
    const a = keys[i], b = keys[i + 1];
    const u = easeFn(b[2] || defEase)(sat((t - a[0]) / (b[0] - a[0] || 1)));
    const va = a[1], vb = b[1];
    if (Array.isArray(va)) return va.map((x, j) => lerp(x, vb[j], u));
    if (typeof va === 'string' || typeof vb === 'string') return u < 1 ? va : vb;
    return lerp(va, vb, u);
  }

  /* Progress of t through [t0, t1] with easing. */
  function P(t, t0, t1, e) {
    return easeFn(e)(sat((t - t0) / (t1 - t0 || 1e-6)));
  }
  /* Pulse up then down: 0 outside, 1 in middle. */
  function pulse(t, t0, t1, fadeIn, fadeOut) {
    fadeIn = fadeIn == null ? 0.2 : fadeIn;
    fadeOut = fadeOut == null ? fadeIn : fadeOut;
    if (t < t0 || t > t1) return 0;
    return Math.min(sat((t - t0) / (fadeIn || 1e-6)), sat((t1 - t) / (fadeOut || 1e-6)));
  }

  /* Hash noise */
  const hash = (n) => fract(Math.sin(n * 12.9898 + 4.1414) * 43758.5453);
  const hash2 = (a, b) => fract(Math.sin(a * 12.9898 + b * 78.233) * 43758.5453);
  function noise(x) {
    const i = Math.floor(x), f = x - i;
    const u = f * f * (3 - 2 * f);
    return lerp(hash(i), hash(i + 1), u) * 2 - 1;
  }
  function noise2(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
  }
  function fbm(x, oct) {
    let s = 0, a = 0.5, f = 1;
    for (let i = 0; i < (oct || 3); i++) { s += a * noise(x * f + i * 17.3); a *= 0.5; f *= 2.03; }
    return s;
  }
  function fbm2(x, y, oct) {
    let s = 0, a = 0.5, f = 1;
    for (let i = 0; i < (oct || 4); i++) { s += a * noise2(x * f + i * 7.1, y * f - i * 3.3); a *= 0.5; f *= 2.01; }
    return s;
  }

  /* Seeded RNG (mulberry32) */
  function rng(seed) {
    let a = (seed * 2654435761) >>> 0;
    const r = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (a2, b2) => a2 + (b2 - a2) * r();
    r.int = (a2, b2) => Math.floor(a2 + (b2 - a2 + 1) * r());
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.sign = () => (r() < 0.5 ? -1 : 1);
    return r;
  }

  /* Color */
  const colorCache = new Map();
  function rgb(c) {
    let v = colorCache.get(c);
    if (v) return v;
    let s = c.trim();
    if (s[0] === '#') {
      s = s.slice(1);
      if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
      const n = parseInt(s.slice(0, 6), 16);
      v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    } else {
      const m = s.match(/[\d.]+/g) || [0, 0, 0];
      v = [+m[0], +m[1], +m[2]];
    }
    colorCache.set(c, v);
    return v;
  }
  const h2 = (x) => {
    const s = Math.round(clamp(x, 0, 255)).toString(16);
    return s.length < 2 ? '0' + s : s;
  };
  const toHex = (r, g, b) => '#' + h2(r) + h2(g) + h2(b);
  function mix(c1, c2, t) {
    const a = rgb(c1), b = rgb(c2);
    return toHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
  }
  function shade(c, amt) {
    return amt < 0 ? mix(c, '#000000', -amt) : mix(c, '#ffffff', amt);
  }
  function rgba(c, a) {
    const v = rgb(c);
    return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')';
  }
  function hsl(h, s, l, a) {
    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + (a == null ? 1 : a) + ')';
  }
  /* Desaturate toward luminance */
  function gray(c, t) {
    const v = rgb(c);
    const L = v[0] * 0.3 + v[1] * 0.59 + v[2] * 0.11;
    return toHex(lerp(v[0], L, t), lerp(v[1], L, t), lerp(v[2], L, t));
  }

  /* Geometry helpers */
  const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  const angDir = (a) => [Math.sin(a), Math.cos(a)]; // rig convention: 0 = down, +a toward facing
  function rot(x, y, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  }

  /* Catmull-Rom spline through points, emitted as bezier curves on ctx. */
  function spline(ctx, pts, closed, tension) {
    const n = pts.length;
    if (n < 2) return;
    const k = (tension == null ? 0.5 : tension) / 3 * 2;
    const get = (i) => {
      if (closed) return pts[(i + n) % n];
      return pts[clamp(i, 0, n - 1)];
    };
    ctx.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1x = p1[0] + (p2[0] - p0[0]) * k / 2 * 1.0;
      const c1y = p1[1] + (p2[1] - p0[1]) * k / 2 * 1.0;
      const c2x = p2[0] - (p3[0] - p1[0]) * k / 2 * 1.0;
      const c2y = p2[1] - (p3[1] - p1[1]) * k / 2 * 1.0;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
    }
    if (closed) ctx.closePath();
  }

  function poly(ctx, pts, closed) {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (closed) ctx.closePath();
  }

  Object.assign(UW, {
    TAU, clamp, sat, lerp, unlerp, remap, fract, Ease, easeFn, K, P, pulse,
    hash, hash2, noise, noise2, fbm, fbm2, rng,
    rgb, mix, shade, rgba, hsl, gray, toHex,
    dist, angDir, rot, spline, poly,
  });
})();
