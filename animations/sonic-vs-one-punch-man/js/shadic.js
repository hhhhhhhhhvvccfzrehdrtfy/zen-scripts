'use strict';
/* Hyper Shadic, after the fan design: Sonic and Shadow fused with all fourteen emeralds. Pure white fur,
   tall Super-style quills swept up and back with cyan undersides and two red Shadow stripes, red eyes,
   a peach muzzle, a white chest tuft, plain white gloves with big cuffs, and red-and-white air shoes
   with gold soles. He keeps Sonic's body plan, so the hedgehog fight poses and IK helpers work on him
   unchanged. p.hyper 0 gives the navy everyday colours. Feet at (0, 0), facing right. */

// Quills, drawn back to front: [base centre, tip, bend, base width] in head space. A negative bend
// curls the tip upward; the top quill bends forward so it rises off the brow before sweeping back.
const SHC_QUILLS = [
  [[-20, 14], [-80, 36], -6, 34],
  [[-24, 0], [-118, 6], -14, 46],
  [[-22, -14], [-124, -40], -14, 50],
  [[-12, -22], [-102, -92], -12, 50],
  [[2, -22], [-40, -116], 22, 48],
];
const SHC_RED = [2, 3]; // the quills carrying Shadow's red stripes

// Outline of one quill: the centre line is a quadratic from base to tip, its width tapering to a point.
// up runs along the top edge, lo along the underside; each point carries u, 0 at the base and 1 at the tip.
function quillGeom([base, tip, bend, w0], wob) {
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const L = Math.hypot(dx, dy);
  const nx = dy / L;
  const ny = -dx / L;
  const cx = (base[0] + tip[0]) / 2 + nx * bend;
  const cy = (base[1] + tip[1]) / 2 + ny * bend;
  const tipY = tip[1] + wob;
  const n = 14;
  const up = [];
  const lo = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const qx = (1 - u) * (1 - u) * base[0] + 2 * u * (1 - u) * cx + u * u * tip[0];
    const qy = (1 - u) * (1 - u) * base[1] + 2 * u * (1 - u) * cy + u * u * tipY;
    const tx = 2 * (1 - u) * (cx - base[0]) + 2 * u * (tip[0] - cx);
    const ty = 2 * (1 - u) * (cy - base[1]) + 2 * u * (tipY - cy);
    const tl = Math.hypot(tx, ty) || 1;
    const w = (w0 / 2) * Math.pow(1 - u, 0.7);
    // for quills pointing back (-x), up lands on the underside and lo on the top edge
    up.push([qx + (ty / tl) * w, qy - (tx / tl) * w, u]);
    lo.push([qx - (ty / tl) * w, qy + (tx / tl) * w, u]);
  }
  return { up, lo };
}

// Polyline through pts; cont carries on the current subpath instead of starting a new one.
function tracePts(ctx, pts, cont = false) {
  pts.forEach(([x, y], i) => (i || cont ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

// One quill: white, a cyan band along the underside, and for some a red stripe above the cyan.
function drawQuill(ctx, q, i, pal, wob) {
  const { up, lo } = quillGeom(q, wob);
  ctx.beginPath();
  tracePts(ctx, up);
  tracePts(ctx, lo.slice().reverse(), true);
  ctx.closePath();
  ctx.fillStyle = pal.B;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const band = (f0, f1, u0, u1, col) => {
    const a = [];
    const b = [];
    for (let k = 0; k < up.length; k++) {
      const u = up[k][2];
      if (u < u0 || u > u1) continue;
      a.push([lerp(lo[k][0], up[k][0], f0), lerp(lo[k][1], up[k][1], f0)]);
      b.push([lerp(lo[k][0], up[k][0], f1), lerp(lo[k][1], up[k][1], f1)]);
    }
    if (a.length < 2) return;
    ctx.beginPath();
    tracePts(ctx, a);
    tracePts(ctx, b.reverse(), true);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  };
  // measured from lo (the top edge) toward up (the underside)
  band(0.72, 1.2, 0.08, 1, pal.cyan);
  if (SHC_RED.includes(i)) band(0.5, 0.73, 0.3, 0.93, pal.red);
  ctx.restore();
  ctx.beginPath();
  tracePts(ctx, up);
  tracePts(ctx, lo.slice().reverse(), true);
  ctx.closePath();
  ctx.lineJoin = 'round';
  strokeNow(ctx, 3.2, COL.ink);
}

function hsvHex(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const f = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return '#' + f(r) + f(g) + f(b);
}

function shadicPal(k) {
  return {
    B: mix('#24358a', '#ffffff', k),
    BL: mix('#4a68d8', '#ffffff', k),
    BD: mix('#0f1440', '#dbeef3', k),
    shade: mix('#16245e', '#e1f4f7', k),
    cyan: mix('#16245e', '#86e4ef', k),
    cyanD: mix('#0c1238', '#47c4d6', k),
    red: '#e3262f',
    redD: '#a3141e',
    iris: '#c0121f',
    irisL: '#ff5a50',
  };
}

function drawShadic(ctx, x, y, s, dir, o = {}) {
  const p = Object.assign(
    {
      lean: 0,
      legs: [[-0.1, -0.05], [0.13, -0.05]],
      arms: [[-0.1, 0.3], [0.15, 0.3]],
      expr: 'smirk',
      look: 0,
      blink: 0,
      hyper: 1,
      ball: 0,
      spin: 0,
      fig8: false,
      ph: 0,
      rot: 0,
      air: false,
      hipLift: 0,
      hands: ['fist', 'fist'],
      t: 0,
      talk: false,
      aura: 0,
      alpha: 1,
      carry: null,
      quillWob: 0,
      headTilt: 0,
      jet: 0,
    },
    o
  );
  const pal = shadicPal(p.hyper);
  ctx.save();
  if (p.alpha < 1) ctx.globalAlpha *= p.alpha;
  ctx.translate(x, y);
  ctx.scale(s * dir, s);
  if (p.rot) ctx.rotate(p.rot);
  if (p.aura > 0) hyperAura(ctx, p);
  if (p.ball) {
    shadicBall(ctx, p, pal);
    ctx.restore();
    return;
  }
  const hy = sonicHipY(p);
  const hx = 0;
  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  shadicArm(ctx, hx - 3, hy - 36, p.arms[0], true, p.hands[0], pal);
  poly(ctx, [[hx - 12, hy - 30], [hx - 33, hy - 22], [hx - 12, hy - 14]], pal.B, 3);
  ctx.restore();
  if (p.fig8) sonicFig8(ctx, hx, hy, p, pal);
  else {
    shadicLeg(ctx, hx - 4, hy, p.legs[0], true, p, pal);
    shadicLeg(ctx, hx + 4, hy, p.legs[1], false, p, pal);
  }
  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  shadicTorso(ctx, hx, hy, pal);
  ctx.save();
  if (p.headTilt) leanAbout(ctx, hx + 4, hy - 40, p.headTilt);
  shadicHead(ctx, hx + 5, hy - 68, p, pal);
  ctx.restore();
  const hand = shadicArm(ctx, hx + 3, hy - 37, p.arms[1], false, p.hands[1], pal);
  if (p.carry) p.carry(ctx, hand[0], hand[1]);
  ctx.restore();
  ctx.restore();
}

function shadicTorso(ctx, x, y, pal) {
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 4);
    ctx.quadraticCurveTo(x - 18, y - 22, x - 11, y - 44);
    ctx.lineTo(x + 11, y - 44);
    ctx.quadraticCurveTo(x + 18, y - 22, x + 12, y + 4);
    ctx.quadraticCurveTo(x, y + 9, x - 12, y + 4);
    ctx.closePath();
  };
  body();
  ctx.fillStyle = pal.B;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = pal.shade;
  ctx.beginPath();
  ctx.moveTo(x - 20, y - 50);
  ctx.quadraticCurveTo(x - 6, y - 24, x - 10, y + 10);
  ctx.lineTo(x - 20, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  body();
  strokeNow(ctx, 3.2, COL.ink);
  // the chest tuft
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 44);
  ctx.quadraticCurveTo(x + 10, y - 46, x + 17, y - 38);
  ctx.lineTo(x + 13, y - 31);
  ctx.lineTo(x + 17, y - 26);
  ctx.lineTo(x + 9, y - 23);
  ctx.lineTo(x + 11, y - 15);
  ctx.lineTo(x + 3, y - 20);
  ctx.lineTo(x - 1, y - 13);
  ctx.lineTo(x - 2, y - 24);
  ctx.lineTo(x - 7, y - 30);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  strokeNow(ctx, 2.2, COL.ink);
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 30);
  ctx.lineTo(x + 9, y - 25);
  strokeNow(ctx, 1.4, pal.cyanD);
}

function shadicLeg(ctx, x, y, [a1, rel], far, p, pal) {
  const [h, k, f, a2] = limb(x, y, a1, SON.thigh, rel, SON.shin);
  seg(ctx, [h, k, f], 8, far ? pal.BD : pal.B, 4.5);
  shadicShoe(ctx, f[0], f[1], clamp(-a2 * 0.6, -0.9, 1.1), far, p);
}

function airShoePath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-13, 8);
  ctx.quadraticCurveTo(-15, -6, -2, -7);
  ctx.quadraticCurveTo(12, -10, 24, -4);
  ctx.quadraticCurveTo(39, 1, 36, 11);
  ctx.lineTo(35, 15);
  ctx.lineTo(-12, 15);
  ctx.closePath();
}

// Shadow's air shoes: red with a white band, gold sole, and a white cuff at the ankle.
function shadicShoe(ctx, x, y, r, far, p) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  if (p.jet > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fl = (16 + 12 * noise(p.t * 30 + (far ? 5 : 0))) * p.jet;
    for (const [col, w, l] of [['rgba(120,230,255,0.7)', 9, 1], ['rgba(255,255,255,0.95)', 5, 0.6], ['rgba(255,220,120,0.7)', 3, 0.35]]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-6, 20);
      ctx.quadraticCurveTo(-12 - fl * l, 24 + fl * 0.4 * l, -26 - fl * 1.4 * l, 22 + fl * 0.8 * l);
      ctx.quadraticCurveTo(-8, 28 + w, 10, 21);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  // gold sole with treads
  ctx.beginPath();
  rr(ctx, -13, 12, 50, 9, 4);
  ctx.fillStyle = far ? '#c98a12' : '#ffb21e';
  ctx.fill();
  strokeNow(ctx, 2.6, COL.ink);
  for (const sx of [-4, 9, 22]) circle(ctx, sx, 19.5, 2.6, far ? '#a86a08' : '#ff8a00');
  airShoePath(ctx);
  const sg = ctx.createLinearGradient(0, -9, 0, 15);
  sg.addColorStop(0, far ? '#c42a33' : '#ff4048');
  sg.addColorStop(1, far ? '#7e0f18' : '#c2141e');
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = far ? '#d9d4de' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(4, -12);
  ctx.lineTo(13, -12);
  ctx.lineTo(19, 16);
  ctx.lineTo(10, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = far ? '#d9d4de' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(24, -6);
  ctx.quadraticCurveTo(34, -2, 37, 6);
  ctx.lineTo(33, 8);
  ctx.quadraticCurveTo(30, 1, 22, -2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(28, 0, 6, 2.5, -0.2, 0, TAU);
  ctx.fill();
  ctx.restore();
  airShoePath(ctx);
  strokeNow(ctx, 3, COL.ink);
  ell(ctx, -1, -8, 10.5, 6, 0, far ? '#d4cfd9' : '#ffffff', 2.6);
  ctx.beginPath();
  ctx.ellipse(-1, -9.5, 7, 2.4, 0, 0.2, Math.PI - 0.2);
  strokeNow(ctx, 1.2, '#9fdbe6');
  ctx.restore();
}

function shadicArm(ctx, sx, sy, [a1, rel], far, hand, pal) {
  const [s0, e, h, a2] = limb(sx, sy, a1, SON.upper, rel, SON.fore);
  seg(ctx, [s0, e, h], 6.5, far ? pal.BD : pal.B, 4.2);
  const c = far ? '#d6dde4' : '#ffffff';
  ctx.save();
  ctx.translate(h[0], h[1]);
  ctx.rotate(-a2);
  if (hand === 'point') seg(ctx, [[1, 10], [1, 23]], 5.5, c, 3);
  if (hand === 'thumb') seg(ctx, [[4, 6], [14, 1]], 5.5, c, 3);
  if (hand === 'open') for (const [fx, fy] of [[-7, 18], [-2, 20], [3, 20], [8, 17]]) seg(ctx, [[fx * 0.5, 9], [fx, fy]], 4.5, c, 3);
  if (hand === 'claw') for (const [fx, fy] of [[-7, 16], [-2, 18], [3, 18], [8, 15]]) seg(ctx, [[fx * 0.5, 9], [fx * 0.8, fy], [fx * 0.4, fy + 4]], 4, c, 3);
  ell(ctx, 0, 8, 10.5, 10, 0, c, 2.6);
  if (hand === 'fist' || !hand) {
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.quadraticCurveTo(0, 15, 6, 12);
    strokeNow(ctx, 1.2, '#a9b6c2');
  }
  ell(ctx, 0, -2, 10.5, 6, 0, c, 2.6);
  ctx.beginPath();
  ctx.ellipse(0, -3, 7, 2.2, 0, 0.1, Math.PI - 0.1);
  strokeNow(ctx, 1.1, '#a9b6c2');
  ctx.restore();
  return h;
}

function shadicHead(ctx, x, y, p, pal) {
  ctx.save();
  ctx.translate(x, y);
  SHC_QUILLS.forEach((q, i) => drawQuill(ctx, q, i, pal, p.quillWob ? Math.sin(p.t * 24 + i * 1.7) * p.quillWob * 2 : 0));
  poly(ctx, [[-22, -20], [-17, -53], [-4, -27]], pal.shade, 3);
  poly(ctx, [[-7, -26], [5, -59], [18, -23]], pal.B, 3.2);
  poly(ctx, [[-1, -27], [5, -50], [12, -25]], COL.peach, 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 29.5, 0, 0, TAU);
  ctx.fillStyle = pal.B;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = pal.shade;
  ctx.beginPath();
  ctx.ellipse(-20, 14, 22, 24, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 29.5, 0, 0, TAU);
  strokeNow(ctx, 3.4, COL.ink);
  // a forelock falling over the brow
  poly(ctx, [[2, -28], [20, -24], [9, -18]], pal.B, 2.6);
  ctx.beginPath();
  ctx.ellipse(13, 15, 15, 10.5, 0.12, 0, TAU);
  ctx.moveTo(35, 9);
  ctx.ellipse(25, 9.5, 10, 7, -0.15, 0, TAU);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = COL.peach;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = COL.peachD;
  ctx.fillRect(-10, 21, 60, 20);
  ctx.restore();
  shadicEyes(ctx, p, pal);
  ell(ctx, 34.5, 6, 4.4, 3.7, -0.2, COL.ink, 0);
  circle(ctx, 33.6, 4.8, 1.2, '#ffffff');
  sonicMouth(ctx, { ...p, mouth: p.mouth || SHADIC_MOUTH[p.expr] || 'smirk' });
  ctx.restore();
}

// Lid line [height at x = 0, slope], painted in fur colour over the top of the eyes: half-lidded and cool.
const SHADIC_LIDS = {
  smirk: [-12, 0.34],
  grin: [-14, 0.28],
  determined: [-11, 0.4],
  angry: [-9, 0.48],
  focus: [-10, 0.44],
  calm: [-13, 0.24],
  tired: [-5, 0.12],
  shock: [-40, 0],
  yell: [-12, 0.4],
};
const SHADIC_MOUTH = { smirk: 'smirk', grin: 'grin', determined: 'grit', angry: 'grit', focus: 'flat', calm: 'flat', tired: 'flat', shock: 'o', pain: 'grit', wince: 'grit', yell: 'openWide', closed: 'flat' };

function shadicEyes(ctx, p, pal) {
  const e = p.expr;
  if (e === 'closed') {
    ctx.beginPath();
    ctx.moveTo(1, -4);
    ctx.quadraticCurveTo(9, 0, 16, -4);
    ctx.moveTo(19, -3);
    ctx.quadraticCurveTo(25, 0, 30, -4);
    strokeNow(ctx, 3, COL.ink);
    return;
  }
  eyeMask(ctx);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.save();
  ctx.clip();
  if (e === 'pain' || e === 'wince') {
    ctx.beginPath();
    ctx.moveTo(3, -15);
    ctx.lineTo(13, -8);
    ctx.lineTo(3, -1);
    ctx.moveTo(28, -14);
    ctx.lineTo(19, -7);
    ctx.lineTo(28, 0);
    strokeNow(ctx, 3, COL.ink);
  } else {
    const sm = e === 'shock' ? 0.6 : 1;
    const lx = p.look * 3;
    ell(ctx, 12.5 + lx, -6, 7.2 * sm, 10.4 * sm, 0, pal.iris, 0);
    ell(ctx, 26.5 + lx, -5.5, 5.6 * sm, 9.6 * sm, 0, pal.iris, 0);
    ell(ctx, 12.5 + lx, -1.5, 3.4 * sm, 3.6 * sm, 0, pal.irisL, 0);
    ell(ctx, 26.5 + lx, -1, 2.4 * sm, 3.2 * sm, 0, pal.irisL, 0);
    ell(ctx, 13.8 + lx, -6.5, 3.2 * sm, 5.8 * sm, 0, COL.ink, 0);
    ell(ctx, 27.3 + lx, -6, 2.6 * sm, 5.2 * sm, 0, COL.ink, 0);
    circle(ctx, 11 + lx, -11, 2.3, '#ffffff');
    circle(ctx, 25 + lx, -10.5, 1.8, '#ffffff');
  }
  let lid = SHADIC_LIDS[e] || SHADIC_LIDS.smirk;
  if (e === 'pain' || e === 'wince') lid = [-40, 0];
  if (p.blink > 0) lid = [lerp(lid[0], 10, p.blink), lid[1]];
  if (lid[0] > -30) {
    const y0 = lid[0] - 6 * lid[1];
    const y1 = lid[0] + 36 * lid[1];
    ctx.beginPath();
    ctx.moveTo(-6, -34);
    ctx.lineTo(36, -34);
    ctx.lineTo(36, y1);
    ctx.lineTo(-6, y0);
    ctx.closePath();
    ctx.fillStyle = pal.B;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, y0);
    ctx.lineTo(36, y1);
    strokeNow(ctx, 3.4, COL.ink);
  }
  ctx.restore();
}

function shadicBall(ctx, p, pal) {
  const r = 36;
  ctx.save();
  ctx.translate(0, -r - 6);
  ctx.rotate(p.spin);
  ctx.beginPath();
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU;
    const a1 = ((i + 0.5) / n) * TAU;
    const a2 = ((i + 1) / n) * TAU;
    if (!i) ctx.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
    ctx.quadraticCurveTo(Math.cos(a1 - 0.25) * (r + 16), Math.sin(a1 - 0.25) * (r + 16), Math.cos(a2) * r, Math.sin(a2) * r);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-10, -12, 4, 0, 0, r + 10);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.6, pal.B);
  g.addColorStop(1, pal.cyan);
  ctx.fillStyle = g;
  ctx.fill();
  strokeNow(ctx, 3.5, COL.ink);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.64, (i * TAU) / 3, (i * TAU) / 3 + 1.4);
    strokeNow(ctx, 5, i === 1 ? pal.red : pal.cyanD);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0.3, 1.9);
  strokeNow(ctx, 5, COL.peach);
  if (p.hyper > 0.5) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 12, (i * TAU) / 6, (i * TAU) / 6 + 0.7);
      strokeNow(ctx, 4, `hsla(${(p.t * 400 + i * 60) % 360},100%,72%,0.75)`);
    }
  }
  ctx.restore();
}

// Hyper aura: a white-cyan glow with flame spikes that flicker through the rainbow, and orbiting sparkles.
function hyperAura(ctx, p) {
  const a = p.aura;
  const t = p.t;
  const cy = p.ball ? -42 : -96;
  const hue = (t * 260) % 360;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, cy, 10, 0, cy, 165);
  g.addColorStop(0, `rgba(235,255,255,${0.5 * a})`);
  g.addColorStop(0.5, `rgba(120,230,255,${0.2 * a})`);
  g.addColorStop(1, 'rgba(120,230,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, cy, 165, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * TAU;
    const up = 0.75 + 0.25 * -Math.sin(ang);
    const len = (90 + 34 * noise(t * 8 + i * 3.3)) * up;
    ctx.fillStyle = i % 3 ? `rgba(190,245,255,${0.26 * a})` : `hsla(${hue + i * 20},100%,72%,${0.3 * a})`;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang - 0.17) * 48, cy + Math.sin(ang - 0.17) * 58);
    ctx.lineTo(Math.cos(ang) * len, cy + Math.sin(ang) * len * 1.2 - 10);
    ctx.lineTo(Math.cos(ang + 0.17) * 48, cy + Math.sin(ang + 0.17) * 58);
    ctx.fill();
  }
  for (let i = 0; i < 7; i++) {
    const ang = t * (2 + i * 0.3) + i * 0.9;
    const rr = 70 + 26 * Math.sin(t * 3 + i);
    star4(ctx, Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 1.15, (5 + 4 * Math.sin(t * 9 + i)) * a, ang, `hsla(${hue + i * 51},100%,82%,${0.9 * a})`);
  }
  ctx.restore();
}
