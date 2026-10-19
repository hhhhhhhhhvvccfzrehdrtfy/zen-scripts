'use strict';
/* Sonic, modelled on his modern game design: tall and lanky, tan arms and chest, long curved quills
   sweeping back, one joined eye mask with green irises, puffy gloves and socks, big strapped shoes.
   Feet at (0, 0), facing right. About 185 units tall to the ear tips at scale 1. */

const SON = { thigh: 26, shin: 26, ankle: 18, upper: 22, fore: 21 };

// Quill outline as quadratic segments [cx, cy, x, y] after a start point; normal and Super forms.
const QUILLS = [
  [[2, -30], [-38, -42, -74, -10], [-46, -14, -30, -8], [-58, -4, -78, 22], [-50, 14, -30, 12], [-46, 26, -60, 46], [-36, 38, -12, 26]],
  [[2, -30], [-18, -66, -42, -86], [-34, -40, -26, -16], [-48, -40, -80, -48], [-52, -14, -32, 2], [-60, -8, -88, -6], [-48, 22, -12, 26]],
];

function sonicPal(k) {
  return {
    B: mix('#2361ea', '#ffcf2e', k),
    BL: mix('#4b8cff', '#fff08a', k),
    BD: mix('#163894', '#d08f0c', k),
    iris: k > 0.5 ? '#e0283a' : '#2fae52',
    irisL: k > 0.5 ? '#ff7a85' : '#7be08f',
  };
}

function drawSonic(ctx, x, y, s, dir, o = {}) {
  const p = Object.assign(
    {
      lean: 0,
      legs: [[-0.1, -0.05], [0.13, -0.05]],
      arms: [[-0.1, 0.3], [0.15, 0.3]],
      expr: 'smirk',
      look: 0,
      blink: 0,
      sup: 0,
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
    },
    o
  );
  const pal = sonicPal(p.sup);
  ctx.save();
  if (p.alpha < 1) ctx.globalAlpha *= p.alpha;
  ctx.translate(x, y);
  ctx.scale(s * dir, s);
  if (p.rot) ctx.rotate(p.rot);
  if (p.aura > 0) sonicAura(ctx, p);
  if (p.ball) {
    sonicBall(ctx, p, pal);
    ctx.restore();
    return;
  }
  const g = ctx.createLinearGradient(0, -170, 0, 0);
  g.addColorStop(0, pal.BL);
  g.addColorStop(0.45, pal.B);
  g.addColorStop(1, pal.BD);
  pal.fill = g;

  let hy;
  if (p.fig8) hy = -70 - p.hipLift;
  else if (p.air) hy = -70 - p.hipLift;
  else {
    let reach = 0;
    for (const [a1, rel] of p.legs) reach = Math.max(reach, Math.cos(a1) * SON.thigh + Math.cos(a1 + rel) * SON.shin);
    hy = -(reach + SON.ankle) - p.hipLift;
  }
  const hx = 0;

  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  sonicArm(ctx, hx - 3, hy - 36, p.arms[0], true, p.hands[0]);
  poly(ctx, [[hx - 12, hy - 30], [hx - 32, hy - 20], [hx - 12, hy - 14]], pal.B, 3);
  ctx.restore();

  if (p.fig8) sonicFig8(ctx, hx, hy, p, pal);
  else {
    sonicLeg(ctx, hx - 4, hy, p.legs[0], true, pal);
    sonicLeg(ctx, hx + 4, hy, p.legs[1], false, pal);
  }

  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  sonicTorso(ctx, hx, hy, pal);
  ctx.save();
  if (p.headTilt) leanAbout(ctx, hx + 4, hy - 40, p.headTilt);
  sonicHead(ctx, hx + 5, hy - 68, p, pal);
  ctx.restore();
  const hand = sonicArm(ctx, hx + 3, hy - 37, p.arms[1], false, p.hands[1]);
  if (p.carry) p.carry(ctx, hand[0], hand[1]);
  ctx.restore();
  ctx.restore();
}

function sonicTorso(ctx, x, y, pal) {
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 4);
  ctx.quadraticCurveTo(x - 18, y - 22, x - 11, y - 44);
  ctx.lineTo(x + 11, y - 44);
  ctx.quadraticCurveTo(x + 18, y - 22, x + 12, y + 4);
  ctx.quadraticCurveTo(x, y + 9, x - 12, y + 4);
  ctx.closePath();
  ctx.fillStyle = pal.fill;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = COL.peach;
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 46);
  ctx.quadraticCurveTo(x + 6, y - 30, x - 1, y - 18);
  ctx.quadraticCurveTo(x - 3, y - 4, x + 6, y + 2);
  ctx.lineTo(x + 20, y + 2);
  ctx.lineTo(x + 20, y - 46);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = COL.peachD;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = pal.BD;
  ctx.fillRect(x - 20, y - 50, 9, 60);
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 4);
  ctx.quadraticCurveTo(x - 18, y - 22, x - 11, y - 44);
  ctx.moveTo(x + 11, y - 44);
  ctx.quadraticCurveTo(x + 18, y - 22, x + 12, y + 4);
  ctx.quadraticCurveTo(x, y + 9, x - 12, y + 4);
  strokeNow(ctx, 3.2, COL.ink);
}

function sonicLeg(ctx, x, y, [a1, rel], far, pal) {
  const [h, k, f, a2] = limb(x, y, a1, SON.thigh, rel, SON.shin);
  seg(ctx, [h, k, f], 8, far ? pal.BD : pal.B, 4.5);
  sonicShoe(ctx, f[0], f[1], clamp(-a2 * 0.6, -0.9, 1.1), far);
}

function shoePath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-13, 8);
  ctx.quadraticCurveTo(-15, -6, -2, -6);
  ctx.quadraticCurveTo(10, -9, 22, -4);
  ctx.quadraticCurveTo(37, 0, 34, 10);
  ctx.quadraticCurveTo(31, 18, 14, 18);
  ctx.lineTo(-5, 18);
  ctx.quadraticCurveTo(-13, 17, -13, 8);
  ctx.closePath();
}

function sonicShoe(ctx, x, y, r, far) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  shoePath(ctx);
  const g = ctx.createLinearGradient(0, -9, 0, 18);
  g.addColorStop(0, far ? '#c42a33' : '#ff4b52');
  g.addColorStop(1, far ? '#7e0f18' : '#c2141e');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = far ? '#c9c3cf' : '#f4f1ee';
  ctx.beginPath();
  ctx.moveTo(4, -12);
  ctx.lineTo(13, -12);
  ctx.lineTo(10, 22);
  ctx.lineTo(1, 22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = far ? '#5a0a10' : '#7a1018';
  ctx.fillRect(-20, 14, 60, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(24, -1, 7, 3, -0.2, 0, TAU);
  ctx.fill();
  ctx.restore();
  shoePath(ctx);
  strokeNow(ctx, 3, COL.ink);
  ctx.beginPath();
  rr(ctx, 5.5, 4, 6, 6, 1.5);
  ctx.fillStyle = '#f5c53a';
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = COL.ink;
  ctx.stroke();
  ell(ctx, -1, -6, 9.5, 5.5, 0, far ? '#d4cfd9' : '#ffffff', 2.6);
  ctx.beginPath();
  ctx.ellipse(-1, -7.5, 6.5, 2.4, 0, 0.2, Math.PI - 0.2);
  strokeNow(ctx, 1.2, '#b9b3c4');
  ctx.restore();
}

function sonicArm(ctx, sx, sy, [a1, rel], far, hand) {
  const [s0, e, h, a2] = limb(sx, sy, a1, SON.upper, rel, SON.fore);
  seg(ctx, [s0, e, h], 6.5, far ? COL.peachD : COL.peach, 4.2);
  sonicGlove(ctx, h[0], h[1], a2, far, hand);
  return h;
}

// Glove at the wrist; local +y runs along the forearm, past the knuckles.
function sonicGlove(ctx, x, y, a, far, type) {
  const c = far ? '#d4cfd9' : '#ffffff';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-a);
  if (type === 'point') seg(ctx, [[1, 10], [1, 23]], 5.5, c, 3);
  if (type === 'thumb') seg(ctx, [[4, 6], [14, 1]], 5.5, c, 3);
  if (type === 'open') {
    for (const [fx, fy] of [[-7, 18], [-2, 20], [3, 20], [8, 17]]) seg(ctx, [[fx * 0.5, 9], [fx, fy]], 4.5, c, 3);
  }
  ell(ctx, 0, 8, 10, 9.5, 0, c, 2.6);
  if (type === 'fist' || !type) {
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.quadraticCurveTo(0, 15, 6, 12);
    strokeNow(ctx, 1.2, '#a9a3b6');
  }
  ell(ctx, 0, -1, 9, 4.8, 0, c, 2.5);
  ctx.beginPath();
  ctx.ellipse(0, -2, 6, 1.8, 0, 0.1, Math.PI - 0.1);
  strokeNow(ctx, 1.1, '#a9a3b6');
  ctx.restore();
}

function quillPath(ctx, k, wob, t) {
  const A = QUILLS[0];
  const B = QUILLS[1];
  const pt = (i, j) => lerp(A[i][j], B[i][j], k) + (wob && i > 0 && j % 2 ? Math.sin(t * 24 + i * 1.7) * wob : 0);
  ctx.beginPath();
  ctx.moveTo(pt(0, 0), pt(0, 1));
  for (let i = 1; i < A.length; i++) ctx.quadraticCurveTo(pt(i, 0), pt(i, 1), pt(i, 2), pt(i, 3));
  ctx.closePath();
}

function sonicHead(ctx, x, y, p, pal) {
  ctx.save();
  ctx.translate(x, y);
  quillPath(ctx, p.sup, p.quillWob, p.t);
  ctx.fillStyle = pal.fill;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = pal.BD;
  ctx.beginPath();
  ctx.ellipse(-44, 30, 46, 22, -0.4, 0, TAU);
  ctx.fill();
  ctx.restore();
  quillPath(ctx, p.sup, p.quillWob, p.t);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3.4;
  ctx.lineJoin = 'round';
  ctx.stroke();
  poly(ctx, [[-22, -20], [-17, -52], [-4, -27]], pal.BD, 3);
  poly(ctx, [[-7, -26], [5, -58], [18, -23]], pal.B, 3.2);
  poly(ctx, [[-1, -27], [5, -49], [12, -25]], COL.peach, 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 29.5, 0, 0, TAU);
  ctx.fillStyle = pal.fill;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = pal.BD;
  ctx.beginPath();
  ctx.ellipse(-16, 12, 26, 28, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(4, -18, 15, 7, -0.25, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 29.5, 0, 0, TAU);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3.4;
  ctx.stroke();

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

  sonicEyes(ctx, p, pal);
  ell(ctx, 34.5, 6, 4.4, 3.7, -0.2, COL.ink, 0);
  circle(ctx, 33.6, 4.8, 1.2, '#ffffff');
  sonicMouth(ctx, p);
  if (p.expr === 'sheepish') {
    ctx.beginPath();
    ctx.moveTo(-16, -24);
    ctx.quadraticCurveTo(-23, -12, -16, -7);
    ctx.quadraticCurveTo(-9, -12, -16, -24);
    ctx.fillStyle = '#9fd8ff';
    ctx.fill();
    strokeNow(ctx, 2, COL.ink);
  }
  ctx.restore();
}

// Lid line [height at x=0, slope]; the lid is painted in head colour over the top of the eyes.
const SONIC_LIDS = {
  smirk: [-17, 0.2],
  grin: [-17, 0.2],
  determined: [-14, 0.34],
  angry: [-12, 0.42],
  sheepish: [-13, -0.14],
  neutral: [-20, 0.08],
  wince: [-20, 0.08],
  dizzy: [-40, 0],
  shock: [-40, 0],
};

function eyeMask(ctx) {
  ctx.beginPath();
  ctx.ellipse(8, -9, 11.2, 16, -0.08, 0, TAU);
  ctx.moveTo(32, -8);
  ctx.ellipse(23.5, -8, 8.6, 14.5, 0.1, 0, TAU);
}

function sonicEyes(ctx, p, pal) {
  const e = p.expr;
  if (e === 'happy' || e === 'laugh') {
    ctx.beginPath();
    ctx.arc(9, -2, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.moveTo(18.5, -4);
    ctx.arc(23.5, -1.5, 6, Math.PI * 1.1, Math.PI * 1.9);
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
  if (e === 'dizzy') {
    for (const [cx, cy, r] of [[9, -8, 8], [23, -7, 6]]) {
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const a = i * 0.45 + p.t * 8;
        const rr2 = (i / 40) * r;
        ctx.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2);
      }
      strokeNow(ctx, 1.8, COL.ink);
    }
  } else if (e === 'wince') {
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
    ell(ctx, 12.5 + lx, -7, 7.4 * sm, 10.8 * sm, 0, pal.iris, 0);
    ell(ctx, 26.5 + lx, -6.5, 5.8 * sm, 10 * sm, 0, pal.iris, 0);
    ell(ctx, 12.5 + lx, -3.5, 4.6 * sm, 5.6 * sm, 0, pal.irisL, 0);
    ell(ctx, 26.5 + lx, -3, 3.4 * sm, 5.2 * sm, 0, pal.irisL, 0);
    ell(ctx, 13.8 + lx, -7.5, 3.5 * sm, 6.2 * sm, 0, COL.ink, 0);
    ell(ctx, 27.3 + lx, -7, 2.8 * sm, 5.6 * sm, 0, COL.ink, 0);
    circle(ctx, 11 + lx, -12.5, 2.5, '#ffffff');
    circle(ctx, 25 + lx, -11.5, 1.9, '#ffffff');
  }
  let lid = SONIC_LIDS[e] || SONIC_LIDS.neutral;
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
    strokeNow(ctx, 3.2, COL.ink);
  }
  ctx.restore();
}

const SONIC_MOUTH = {
  smirk: 'smirk',
  grin: 'grin',
  determined: 'grit',
  angry: 'grit',
  shock: 'o',
  happy: 'grin',
  laugh: 'open',
  dizzy: 'wavy',
  wince: 'grit',
  sheepish: 'flat',
  neutral: 'smirk',
};

function sonicMouth(ctx, p) {
  let m = p.mouth || SONIC_MOUTH[p.expr] || 'smirk';
  if (p.talk && Math.floor(p.t * 9) % 2 === 0) m = m === 'grit' || m === 'o' ? 'openWide' : 'open';
  switch (m) {
    case 'smirk':
      ctx.beginPath();
      ctx.moveTo(15, 19.5);
      ctx.quadraticCurveTo(22.5, 22.5, 28.5, 16);
      strokeNow(ctx, 2.4, COL.ink);
      ctx.beginPath();
      ctx.moveTo(27.5, 13.5);
      ctx.lineTo(29.8, 17.5);
      strokeNow(ctx, 2, COL.ink);
      break;
    case 'grin':
      ctx.beginPath();
      ctx.moveTo(13.5, 16);
      ctx.quadraticCurveTo(22, 28, 29.5, 15);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      strokeNow(ctx, 2.6, COL.ink);
      break;
    case 'open':
      ell(ctx, 21.5, 19.5, 5.2, 4.4, 0, COL.mouth, 2.2);
      break;
    case 'openWide':
      ell(ctx, 21, 20, 6.8, 6, 0, COL.mouth, 2.3);
      break;
    case 'o':
      ell(ctx, 21.5, 20, 2.8, 3.5, 0, COL.mouth, 2);
      break;
    case 'grit':
      ctx.beginPath();
      ctx.moveTo(14.5, 16.5);
      ctx.lineTo(29, 14.5);
      ctx.lineTo(28.5, 20.5);
      ctx.lineTo(16, 21.5);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      strokeNow(ctx, 2.4, COL.ink);
      ctx.beginPath();
      ctx.moveTo(15, 19);
      ctx.lineTo(28.7, 17.5);
      strokeNow(ctx, 1.4, COL.ink);
      break;
    case 'flat':
      ctx.beginPath();
      ctx.moveTo(16, 19);
      ctx.lineTo(28, 18);
      strokeNow(ctx, 2.4, COL.ink);
      break;
    case 'wavy':
      ctx.beginPath();
      ctx.moveTo(14.5, 19);
      ctx.quadraticCurveTo(18, 15.5, 21.5, 19);
      ctx.quadraticCurveTo(25, 22.5, 28.5, 18);
      strokeNow(ctx, 2.4, COL.ink);
      break;
  }
}

// The figure-eight leg blur Sonic gets at top speed.
function sonicFig8(ctx, hx, hy, p, pal) {
  const cx = hx + 8;
  const cy = hy + 46;
  const a = 34;
  const b = 30;
  ell(ctx, hx + 4, hy + 14, 11, 17, 0.25, pal.B, 0);
  ctx.beginPath();
  for (let i = 0; i <= 56; i++) {
    const t = (i / 56) * TAU;
    const px = cx + a * Math.sin(t);
    const py = cy + b * Math.sin(t) * Math.cos(t);
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.closePath();
  strokeNow(ctx, 19, COL.ink);
  strokeNow(ctx, 14, COL.red);
  strokeNow(ctx, 4, '#ff9096');
  for (const off of [0, Math.PI]) {
    const t = p.ph + off;
    circle(ctx, cx + a * Math.sin(t), cy + b * Math.sin(t) * Math.cos(t), off ? 5 : 6.5, off ? '#dddddd' : '#ffffff');
  }
}

function sonicBall(ctx, p, pal) {
  const r = 36;
  ctx.save();
  ctx.translate(0, -r - 6);
  ctx.rotate(p.spin);
  const g = ctx.createRadialGradient(-10, -12, 4, 0, 0, r + 10);
  g.addColorStop(0, pal.BL);
  g.addColorStop(0.6, pal.B);
  g.addColorStop(1, pal.BD);
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
  ctx.fillStyle = g;
  ctx.fill();
  strokeNow(ctx, 3.5, COL.ink);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.64, (i * TAU) / 3, (i * TAU) / 3 + 1.4);
    strokeNow(ctx, 5, pal.BD);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0.3, 1.9);
  strokeNow(ctx, 5, COL.peach);
  ctx.restore();
}

function sonicAura(ctx, p) {
  const a = p.aura;
  const t = p.t;
  const cy = p.ball ? -42 : -96;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, cy, 10, 0, cy, 150);
  g.addColorStop(0, `rgba(255,236,140,${0.5 * a})`);
  g.addColorStop(0.5, `rgba(255,190,40,${0.22 * a})`);
  g.addColorStop(1, 'rgba(255,170,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, cy, 150, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255,214,90,${0.38 * a})`;
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * TAU;
    const up = 0.75 + 0.25 * -Math.sin(ang);
    const len = (90 + 34 * noise(t * 7 + i * 3.3)) * up;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang - 0.18) * 50, cy + Math.sin(ang - 0.18) * 60);
    ctx.lineTo(Math.cos(ang) * len, cy + Math.sin(ang) * len * 1.2 - 10);
    ctx.lineTo(Math.cos(ang + 0.18) * 50, cy + Math.sin(ang + 0.18) * 60);
    ctx.fill();
  }
  ctx.restore();
}
