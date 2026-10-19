'use strict';
/* Shadow the Hedgehog, built on Sonic's body plan: black fur, upswept quills with red stripes, red
   eyes with red markings, white chest tuft, red stripes on arms and legs, gold inhibitor rings on
   wrists and ankles, and jet-powered hover shoes. Feet at (0, 0), facing right. */

const SHD = {
  B: '#2a2731',
  BL: '#575263',
  BD: '#121016',
  red: '#e3262f',
  redD: '#a3141e',
  tuft: '#f6f3ee',
  ring: '#f2c230',
  iris: '#d61e2b',
  irisL: '#ff7b6e',
};

const SHD_QUILLS = [
  [2, -30],
  [-40, -32, -76, -54],
  [-52, -24, -28, -12],
  [-62, -8, -90, -28],
  [-58, 0, -30, 6],
  [-60, 16, -84, 0],
  [-50, 26, -12, 26],
];
// Centre lines of the three big quills, for their red stripes.
const SHD_STRIPES = [
  [[-12, -27], [-42, -36], [-66, -47]],
  [[-28, -6], [-56, -10], [-80, -24]],
  [[-26, 12], [-54, 14], [-75, 3]],
];

function drawShadow(ctx, x, y, s, dir, o = {}) {
  const p = Object.assign(
    {
      lean: 0,
      legs: [[-0.1, -0.05], [0.13, -0.05]],
      arms: [[-0.1, 0.3], [0.15, 0.3]],
      expr: 'scowl',
      look: 0,
      blink: 0,
      ball: 0,
      spin: 0,
      rot: 0,
      air: false,
      hipLift: 0,
      hands: ['fist', 'fist'],
      t: 0,
      talk: false,
      aura: 0,
      alpha: 1,
      carry: null,
      jet: 0,
      rings: 1,
      headTilt: 0,
    },
    o
  );
  ctx.save();
  if (p.alpha < 1) ctx.globalAlpha *= p.alpha;
  ctx.translate(x, y);
  ctx.scale(s * dir, s);
  if (p.rot) ctx.rotate(p.rot);
  if (p.aura > 0) shadowAura(ctx, p);
  if (p.ball) {
    shadowBall(ctx, p);
    ctx.restore();
    return;
  }
  const g = ctx.createLinearGradient(0, -170, 0, 0);
  g.addColorStop(0, SHD.BL);
  g.addColorStop(0.4, SHD.B);
  g.addColorStop(1, SHD.BD);
  const hy = sonicHipY(p);
  const hx = 0;
  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  shadowArm(ctx, hx - 3, hy - 36, p.arms[0], true, p.hands[0], p.rings);
  poly(ctx, [[hx - 12, hy - 30], [hx - 33, hy - 24], [hx - 12, hy - 14]], SHD.B, 3);
  ctx.restore();
  shadowLeg(ctx, hx - 4, hy, p.legs[0], true, p);
  shadowLeg(ctx, hx + 4, hy, p.legs[1], false, p);
  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  shadowTorso(ctx, hx, hy, g);
  ctx.save();
  if (p.headTilt) leanAbout(ctx, hx + 4, hy - 40, p.headTilt);
  shadowHead(ctx, hx + 5, hy - 68, p, g);
  ctx.restore();
  const hand = shadowArm(ctx, hx + 3, hy - 37, p.arms[1], false, p.hands[1], p.rings);
  if (p.carry) p.carry(ctx, hand[0], hand[1]);
  ctx.restore();
  ctx.restore();
}

function shadowTorso(ctx, x, y, g) {
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
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = COL.peach;
  ctx.beginPath();
  ctx.ellipse(x + 8, y - 6, 7, 11, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  body();
  strokeNow(ctx, 3.2, COL.ink);
  // the white chest tuft
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 44);
  ctx.quadraticCurveTo(x + 10, y - 46, x + 17, y - 38);
  ctx.lineTo(x + 13, y - 30);
  ctx.lineTo(x + 16, y - 26);
  ctx.lineTo(x + 9, y - 22);
  ctx.lineTo(x + 10, y - 16);
  ctx.lineTo(x + 3, y - 20);
  ctx.lineTo(x - 1, y - 14);
  ctx.lineTo(x - 2, y - 24);
  ctx.lineTo(x - 7, y - 30);
  ctx.closePath();
  ctx.fillStyle = SHD.tuft;
  ctx.fill();
  strokeNow(ctx, 2.4, COL.ink);
}

function shadowLeg(ctx, x, y, [a1, rel], far, p) {
  const [h, k, f, a2] = limb(x, y, a1, SON.thigh, rel, SON.shin);
  seg(ctx, [h, k, f], 8, far ? SHD.BD : SHD.B, 4.5);
  seg(ctx, [[lerp(k[0], f[0], 0.25), lerp(k[1], f[1], 0.25)], [lerp(k[0], f[0], 0.5), lerp(k[1], f[1], 0.5)]], 8.5, far ? SHD.redD : SHD.red, 0);
  shadowShoe(ctx, f[0], f[1], clamp(-a2 * 0.6, -0.9, 1.1), far, p);
}

function hoverShoePath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-13, 9);
  ctx.quadraticCurveTo(-15, -6, -2, -7);
  ctx.quadraticCurveTo(12, -10, 24, -4);
  ctx.quadraticCurveTo(38, 1, 35, 11);
  ctx.lineTo(34, 18);
  ctx.lineTo(-12, 18);
  ctx.closePath();
}

function shadowShoe(ctx, x, y, r, far, p) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  if (p.jet > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fl = (14 + 10 * noise(p.t * 30 + (far ? 5 : 0))) * p.jet;
    for (const [col, w, l] of [['rgba(255,140,40,0.75)', 9, 1], ['rgba(255,230,120,0.9)', 5, 0.65], ['rgba(120,200,255,0.7)', 3, 0.35]]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-6, 18);
      ctx.quadraticCurveTo(-12 - fl * l, 22 + fl * 0.4 * l, -26 - fl * 1.4 * l, 20 + fl * 0.8 * l);
      ctx.quadraticCurveTo(-8, 26 + w, 10, 19);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  hoverShoePath(ctx);
  ctx.fillStyle = far ? '#cfcbd6' : '#ffffff';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = far ? SHD.redD : SHD.red;
  ctx.beginPath();
  ctx.moveTo(16, -12);
  ctx.lineTo(40, -12);
  ctx.lineTo(40, 10);
  ctx.quadraticCurveTo(26, 4, 16, -12);
  ctx.fill();
  ctx.fillStyle = far ? '#5a5560' : '#2b2830';
  ctx.fillRect(-20, 11, 64, 9);
  ctx.fillStyle = far ? SHD.redD : SHD.red;
  ctx.fillRect(-20, 12, 64, 2.5);
  ctx.fillStyle = far ? SHD.redD : SHD.red;
  ctx.fillRect(-16, -2, 10, 5);
  ctx.restore();
  hoverShoePath(ctx);
  strokeNow(ctx, 3, COL.ink);
  if (p.rings > 0.5) ell(ctx, -1, -8, 9.5, 4.8, 0, SHD.ring, 2.6);
  else ell(ctx, -1, -8, 8, 4, 0, far ? SHD.BD : SHD.B, 2.4);
  ctx.restore();
}

function shadowArm(ctx, sx, sy, [a1, rel], far, hand, rings) {
  const [s0, e, h, a2] = limb(sx, sy, a1, SON.upper, rel, SON.fore);
  seg(ctx, [s0, e, h], 6.5, far ? SHD.BD : SHD.B, 4.2);
  seg(ctx, [[lerp(s0[0], e[0], 0.45), lerp(s0[1], e[1], 0.45)], [lerp(s0[0], e[0], 0.75), lerp(s0[1], e[1], 0.75)]], 7, far ? SHD.redD : SHD.red, 0);
  const c = far ? '#d4cfd9' : '#ffffff';
  ctx.save();
  ctx.translate(h[0], h[1]);
  ctx.rotate(-a2);
  if (hand === 'point') seg(ctx, [[1, 10], [1, 23]], 5.5, c, 3);
  if (hand === 'thumb') seg(ctx, [[4, 6], [14, 1]], 5.5, c, 3);
  if (hand === 'open') for (const [fx, fy] of [[-7, 18], [-2, 20], [3, 20], [8, 17]]) seg(ctx, [[fx * 0.5, 9], [fx, fy]], 4.5, c, 3);
  ell(ctx, 0, 8, 10, 9.5, 0, c, 2.6);
  if (rings > 0.5) ell(ctx, 0, -1, 9.5, 5, 0, SHD.ring, 2.5);
  else ell(ctx, 0, -1, 8.5, 4.4, 0, c, 2.4);
  ctx.restore();
  return h;
}

function shadowQuillPath(ctx) {
  const q = SHD_QUILLS;
  ctx.beginPath();
  ctx.moveTo(q[0][0], q[0][1]);
  for (let i = 1; i < q.length; i++) ctx.quadraticCurveTo(q[i][0], q[i][1], q[i][2], q[i][3]);
  ctx.closePath();
}

function shadowHead(ctx, x, y, p, g) {
  ctx.save();
  ctx.translate(x, y);
  shadowQuillPath(ctx);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.lineCap = 'round';
  for (const [a, b, c] of SHD_STRIPES) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]);
    strokeNow(ctx, 8, SHD.red);
  }
  ctx.restore();
  shadowQuillPath(ctx);
  strokeNow(ctx, 3.4, COL.ink);
  poly(ctx, [[-22, -20], [-18, -54], [-4, -27]], SHD.BD, 3);
  poly(ctx, [[-7, -26], [4, -60], [18, -23]], SHD.B, 3.2);
  poly(ctx, [[-1, -27], [4, -50], [12, -25]], '#d99c7c', 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 29.5, 0, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = SHD.BD;
  ctx.beginPath();
  ctx.ellipse(-16, 12, 26, 28, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(4, -18, 14, 6, -0.25, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 29.5, 0, 0, TAU);
  strokeNow(ctx, 3.4, COL.ink);
  ctx.beginPath();
  ctx.ellipse(13, 15, 15, 10.5, 0.12, 0, TAU);
  ctx.moveTo(35, 9);
  ctx.ellipse(25, 9.5, 10, 7, -0.15, 0, TAU);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = COL.peach;
  ctx.fill();
  shadowEyes(ctx, p);
  ell(ctx, 34.5, 6, 4.4, 3.7, -0.2, COL.ink, 0);
  circle(ctx, 33.6, 4.8, 1.2, '#ffffff');
  shadowMouth(ctx, p);
  ctx.restore();
}

const SHADOW_LIDS = {
  scowl: [-12, 0.36],
  smirk: [-12, 0.36],
  angry: [-9, 0.46],
  determined: [-11, 0.4],
  shock: [-26, 0.05],
  pain: [-12, 0.3],
  smile: [-15, 0.18],
  calm: [-14, 0.2],
};

function shadowEyes(ctx, p) {
  const e = p.expr;
  if (e === 'closed') {
    ctx.beginPath();
    ctx.moveTo(1, -4);
    ctx.quadraticCurveTo(9, 0, 16, -4);
    ctx.moveTo(19, -3);
    ctx.quadraticCurveTo(25, 0, 30, -4);
    strokeNow(ctx, 3, COL.ink);
    ctx.beginPath();
    ctx.moveTo(-14, -12);
    ctx.quadraticCurveTo(-4, -8, 2, -6);
    strokeNow(ctx, 3, SHD.red);
    return;
  }
  ctx.beginPath();
  ctx.ellipse(8, -8, 10.5, 14, -0.12, 0, TAU);
  ctx.moveTo(31.5, -7);
  ctx.ellipse(23.5, -7, 8, 13, 0.12, 0, TAU);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.save();
  ctx.clip();
  const lx = p.look * 3;
  const sm = e === 'shock' ? 0.55 : 1;
  if (e === 'pain') {
    ctx.beginPath();
    ctx.moveTo(3, -14);
    ctx.lineTo(13, -7);
    ctx.lineTo(3, 0);
    ctx.moveTo(29, -13);
    ctx.lineTo(20, -6);
    ctx.lineTo(29, 1);
    strokeNow(ctx, 3, COL.ink);
  } else {
    ell(ctx, 12 + lx, -5, 6.6 * sm, 9.5 * sm, 0, SHD.iris, 0);
    ell(ctx, 26 + lx, -4.5, 5.2 * sm, 8.8 * sm, 0, SHD.iris, 0);
    ell(ctx, 12 + lx, -2, 4 * sm, 4.8 * sm, 0, SHD.irisL, 0);
    ell(ctx, 13.2 + lx, -5.5, 2.8 * sm, 5.4 * sm, 0, COL.ink, 0);
    ell(ctx, 26.8 + lx, -5, 2.3 * sm, 5 * sm, 0, COL.ink, 0);
    circle(ctx, 10.5 + lx, -10, 2, '#ffffff');
    circle(ctx, 24.5 + lx, -9.5, 1.6, '#ffffff');
  }
  let lid = SHADOW_LIDS[e] || SHADOW_LIDS.scowl;
  if (p.blink > 0) lid = [lerp(lid[0], 10, p.blink), lid[1]];
  const y0 = lid[0] - 6 * lid[1];
  const y1 = lid[0] + 36 * lid[1];
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(36, -34);
  ctx.lineTo(36, y1);
  ctx.lineTo(-6, y0);
  ctx.closePath();
  ctx.fillStyle = SHD.B;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6, y0);
  ctx.lineTo(36, y1);
  strokeNow(ctx, 4.5, SHD.red);
  strokeNow(ctx, 1.5, COL.ink);
  ctx.restore();
  // the red streak that runs back from his eyes
  ctx.beginPath();
  ctx.moveTo(-2, y0 + 1);
  ctx.quadraticCurveTo(-12, y0 - 2, -20, y0 - 8);
  strokeNow(ctx, 4, SHD.red);
}

const SHADOW_MOUTH = { scowl: 'frown', smirk: 'smirk', angry: 'grit', determined: 'flat', shock: 'o', pain: 'grit', smile: 'smile', calm: 'flat', closed: 'flat' };

function shadowMouth(ctx, p) {
  let m = p.mouth || SHADOW_MOUTH[p.expr] || 'frown';
  if (p.talk && Math.floor(p.t * 9) % 2 === 0) m = m === 'grit' ? 'openWide' : 'open';
  ctx.beginPath();
  switch (m) {
    case 'frown':
      ctx.moveTo(16, 19);
      ctx.quadraticCurveTo(22, 16.5, 28.5, 18.5);
      strokeNow(ctx, 2.4, COL.ink);
      break;
    case 'smirk':
      ctx.moveTo(16, 19);
      ctx.quadraticCurveTo(23, 20, 28.5, 15);
      strokeNow(ctx, 2.4, COL.ink);
      break;
    case 'smile':
      ctx.moveTo(15, 17.5);
      ctx.quadraticCurveTo(22, 22.5, 28.5, 16.5);
      strokeNow(ctx, 2.3, COL.ink);
      break;
    case 'flat':
      ctx.moveTo(16, 19);
      ctx.lineTo(28, 18);
      strokeNow(ctx, 2.4, COL.ink);
      break;
    case 'open':
      ell(ctx, 21.5, 19.5, 5, 4.2, 0, COL.mouth, 2.2);
      break;
    case 'openWide':
      ell(ctx, 21, 20, 6.8, 6, 0, COL.mouth, 2.3);
      break;
    case 'o':
      ell(ctx, 21.5, 20, 2.8, 3.5, 0, COL.mouth, 2);
      break;
    case 'grit':
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
  }
}

function shadowBall(ctx, p) {
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
  g.addColorStop(0, SHD.BL);
  g.addColorStop(0.6, SHD.B);
  g.addColorStop(1, SHD.BD);
  ctx.fillStyle = g;
  ctx.fill();
  strokeNow(ctx, 3.5, COL.ink);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.64, (i * TAU) / 3, (i * TAU) / 3 + 1.4);
    strokeNow(ctx, 5, SHD.red);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0.3, 1.9);
  strokeNow(ctx, 5, SHD.tuft);
  ctx.restore();
}

// Red chaos energy, used when the inhibitor rings come off.
function shadowAura(ctx, p) {
  const a = p.aura;
  const t = p.t;
  const cy = p.ball ? -42 : -96;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, cy, 10, 0, cy, 160);
  g.addColorStop(0, `rgba(255,120,110,${0.45 * a})`);
  g.addColorStop(0.5, `rgba(220,30,40,${0.25 * a})`);
  g.addColorStop(1, 'rgba(160,0,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, cy, 160, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,90,80,${0.7 * a})`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const a0 = hash(i + Math.floor(t * 12)) * TAU;
    ctx.beginPath();
    let px = Math.cos(a0) * 40;
    let py = cy + Math.sin(a0) * 50;
    ctx.moveTo(px, py);
    for (let j = 0; j < 4; j++) {
      px += Math.cos(a0) * 22 + (hash(i * 7 + j + Math.floor(t * 12)) - 0.5) * 30;
      py += Math.sin(a0) * 22 + (hash(i * 3 + j + Math.floor(t * 12)) - 0.5) * 30;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// A Chaos Spear: a bolt of yellow energy pointing along +x.
function chaosSpear(ctx, x, y, rot, s = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(-90, 0, 30, 0);
  g.addColorStop(0, 'rgba(255,220,60,0)');
  g.addColorStop(1, 'rgba(255,240,140,0.9)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(-10, -10);
  ctx.lineTo(-90, 0);
  ctx.lineTo(-10, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,230,0.95)';
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.lineTo(-4, -4);
  ctx.lineTo(-50, 0);
  ctx.lineTo(-4, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
