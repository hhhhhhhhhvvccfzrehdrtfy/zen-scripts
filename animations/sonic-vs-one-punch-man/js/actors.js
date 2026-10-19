'use strict';
/* Character rigs and props. Every rig draws in local units with its feet at (0, 0), facing right (+x).
   Limb angles are measured from straight down; positive swings the limb forward. */

const COL = {
  ink: INK,
  blue: '#2463eb',
  blueD: '#183f9e',
  gold: '#ffd23f',
  goldD: '#e3a514',
  peach: '#f6c793',
  peachD: '#d39c66',
  red: '#e3262f',
  redD: '#9c1520',
  white: '#ffffff',
  gloveD: '#cfcad9',
  eye: '#2fae52',
  eyeS: '#e0283a',
  skin: '#f9d8b6',
  skinD: '#e2b088',
  suit: '#ffd21f',
  suitD: '#d9a400',
  cape: '#fbfaf3',
  capeD: '#d5d2c6',
  belt: '#232027',
  buckle: '#f2c230',
  mouth: '#5b0f18',
};

function seg(ctx, pts, w, col, ow = 4.5) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (ow) {
    ctx.strokeStyle = COL.ink;
    ctx.lineWidth = w + ow;
    ctx.stroke();
  }
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.stroke();
}

function ell(ctx, x, y, rx, ry, rot, fill, lw = 3) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (lw) {
    ctx.strokeStyle = COL.ink;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function poly(ctx, pts, fill, lw = 3) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (lw) {
    ctx.strokeStyle = COL.ink;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

function strokeNow(ctx, w, col) {
  ctx.lineWidth = w;
  ctx.strokeStyle = col;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// Two-segment limb from (x, y). Returns [root, joint, end, endAngle].
function limb(x, y, a1, l1, rel, l2) {
  const kx = x + Math.sin(a1) * l1;
  const ky = y + Math.cos(a1) * l1;
  const a2 = a1 + rel;
  return [[x, y], [kx, ky], [kx + Math.sin(a2) * l2, ky + Math.cos(a2) * l2], a2];
}

function leanAbout(ctx, px, py, a) {
  if (!a) return;
  ctx.translate(px, py);
  ctx.rotate(a);
  ctx.translate(-px, -py);
}

/* ---------- pose generators ---------- */

const POSE = {
  sonicRun(ph, amp = 1) {
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    return {
      legs: [[-1.0 * s * amp, -0.3 - 1.1 * Math.max(0, -c) * amp], [1.0 * s * amp, -0.3 - 1.1 * Math.max(0, c) * amp]],
      arms: [[0.9 * s * amp, 1.2], [-0.9 * s * amp, 1.2]],
      lean: 0.3 * amp,
      hipLift: Math.abs(c) * 3 * amp,
    };
  },
  sonicDash(ph) {
    return { fig8: true, ph, arms: [[-1.5, 0.3], [-1.3, 0.4]], lean: 0.42 };
  },
  sonicSkid() {
    return { legs: [[0.75, -0.3], [1.0, -0.15]], arms: [[-1.4, 0.4], [-1.6, 0.3]], lean: -0.32 };
  },
  sonicHip() {
    return { legs: [[-0.16, -0.04], [0.2, -0.06]], arms: [[0.05, 0.2], [-0.7, 1.72]], hands: ['open', 'fist'] };
  },
  sonicTap(t) {
    const up = Math.max(0, Math.sin(t * 11));
    return { legs: [[-0.12, -0.06], [0.2 + up * 0.25, -0.1 - up * 0.3]], arms: [[-0.2, 0.5], [0.15, 0.55]] };
  },
  sonicThumb() {
    return { arms: [[-0.2, 0.5], [0.95, 0.7]], hands: ['fist', 'thumb'] };
  },
  sonicPointUp(t) {
    return { arms: [[-0.25, 0.5], [2.35, 0.45 + Math.sin(t * 10) * 0.28]], hands: ['fist', 'point'] };
  },
  sonicCrouch() {
    return { legs: [[1.0, -2.0], [1.2, -2.1]], arms: [[-1.2, 0.6], [-1.0, 0.7]], lean: 0.45 };
  },
  sonicHover(t) {
    return { air: true, legs: [[-0.15, -0.5], [0.2, -0.7]], arms: [[-0.7, 0.5], [-0.5, 0.6]], lean: 0.05, hipLift: Math.sin(t * 3) * 3 };
  },
  sonicSit() {
    return { air: true, hipLift: -48, legs: [[1.4, -0.05], [1.5, -0.1]], arms: [[-0.6, 0.2], [-0.4, 0.2]], lean: -0.15 };
  },
  sonicKick() {
    return { air: true, legs: [[-0.5, -1.2], [1.75, 0]], arms: [[-1.8, 0.6], [-1.5, 0.5]], lean: -0.35 };
  },
  saiWalk(ph, amp = 1) {
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    return {
      legs: [[-0.42 * s * amp, -0.05 - 0.55 * Math.max(0, -c) * amp], [0.42 * s * amp, -0.05 - 0.55 * Math.max(0, c) * amp]],
      arms: [[0.3 * s * amp, 0.18], [-0.3 * s * amp, 0.18]],
    };
  },
  saiJog(ph) {
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    return {
      legs: [[-0.62 * s, -0.2 - 0.95 * Math.max(0, -c)], [0.62 * s, -0.2 - 0.95 * Math.max(0, c)]],
      arms: [[0.45 * s, 1.55], [-0.45 * s, 1.55]],
      lean: 0.1,
      hipLift: Math.abs(c) * 4,
    };
  },
  saiPunch(k) {
    return {
      legs: [[lerp(-0.07, -0.42, k), -0.04], [lerp(0.09, 0.38, k), lerp(-0.03, -0.2, k)]],
      arms: [[lerp(-0.05, -0.7, k), lerp(0.12, 1.9, k)], [lerp(0.07, 1.57, k), lerp(0.12, 0, k)]],
      lean: 0.14 * k,
      hands: ['fist', k > 0.5 ? 'big' : 'fist'],
    };
  },
  saiWindup(k) {
    return {
      legs: [[lerp(-0.07, -0.5, k), -0.04], [lerp(0.09, 0.45, k), lerp(-0.03, -0.35, k)]],
      arms: [[lerp(-0.05, 1.2, k), lerp(0.12, 0.6, k)], [lerp(0.07, -1.1, k), lerp(0.12, 2.3, k)]],
      lean: -0.12 * k,
    };
  },
  saiFinger() {
    return { arms: [[-0.05, 0.12], [1.5, 0.05]], hands: ['fist', 'finger'] };
  },
  saiLookHand() {
    return { arms: [[-0.05, 0.12], [0.9, 1.25]], hands: ['fist', 'open'] };
  },
  saiLookFist() {
    return { arms: [[-0.05, 0.12], [0.75, 1.75]], hands: ['fist', 'fist'] };
  },
  saiCrouch(k) {
    return { legs: [[lerp(-0.07, 0.75, k), lerp(-0.03, -1.55, k)], [lerp(0.09, 0.95, k), lerp(-0.03, -1.65, k)]], arms: [[lerp(-0.05, -0.8, k), 0.3], [lerp(0.07, -0.6, k), 0.3]], lean: 0.35 * k };
  },
  saiJump() {
    return { air: true, legs: [[0.35, -0.9], [0.7, -1.3]], arms: [[-0.4, 0.3], [-0.3, 0.3]], lean: 0.1 };
  },
  saiSitLedge(t) {
    return { air: true, hipLift: -50, legs: [[1.52, -1.45 + Math.sin(t * 2) * 0.12], [1.6, -1.6 + Math.sin(t * 2 + 1.5) * 0.12]], arms: [[0.3, 0.6], [0.5, 0.9]] };
  },
  saiCross() {
    return { legs: [[-0.12, -0.03], [0.12, -0.04]], arms: [[0.43, 2.0], [0.95, -2.5]] };
  },
  saiWave(t) {
    return { arms: [[-0.05, 0.12], [2.55, 0.35 + Math.sin(t * 8) * 0.35]], hands: ['fist', 'open'] };
  },
};

/* ---------- the Crab Emperor ---------- */

function drawCrab(ctx, x, y, s, dir, o = {}) {
  const p = Object.assign({ t: 0, claw: 0, snap: 0, walk: 0, rot: 0, talk: false }, o);
  const R = '#d63a2f';
  const RD = '#9b2119';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * dir, s);
  if (p.rot) ctx.rotate(p.rot);
  for (let i = 0; i < 3; i++) {
    const ph = p.walk + i * 1.7;
    const bx = -60 + i * 22;
    seg(ctx, [[bx, -95], [bx - 34 - i * 6, -62 + Math.sin(ph) * 6], [bx - 44 - i * 8, 0]], 10, RD);
    seg(ctx, [[bx + 70, -95], [bx + 96 + i * 4, -62 + Math.cos(ph) * 6], [bx + 104 + i * 6, 0]], 10, R);
  }
  crabClaw(ctx, -40, -150, p, true);
  ctx.beginPath();
  ctx.ellipse(0, -118, 118, 62, 0, 0, TAU);
  ctx.fillStyle = R;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = RD;
  ctx.fillRect(-130, -96, 260, 60);
  ctx.fillStyle = '#f07a5a';
  for (let i = 0; i < 6; i++) circle(ctx, -70 + i * 26, -150 + (i % 2) * 12, 6 + (i % 3) * 2, '#f07a5a');
  ctx.restore();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  seg(ctx, [[22, -168], [14, -212]], 9, R);
  seg(ctx, [[62, -164], [70, -206]], 9, R);
  ell(ctx, 14, -222, 15, 15, 0, '#fff', 3.5);
  ell(ctx, 70, -216, 14, 14, 0, '#fff', 3.5);
  circle(ctx, 19, -220, 5.5, COL.ink);
  circle(ctx, 75, -214, 5, COL.ink);
  ctx.beginPath();
  ctx.moveTo(-2, -244);
  ctx.lineTo(28, -232);
  ctx.moveTo(56, -232);
  ctx.lineTo(84, -240);
  strokeNow(ctx, 5, COL.ink);
  const open = p.talk && Math.floor(p.t * 8) % 2 === 0 ? 12 : 4;
  ctx.beginPath();
  ctx.moveTo(30, -130);
  for (let i = 0; i <= 8; i++) ctx.lineTo(30 + i * 9, -130 + (i % 2 ? open : 0));
  ctx.lineTo(102, -128 + open + 8);
  ctx.lineTo(30, -124 + open + 8);
  ctx.closePath();
  ctx.fillStyle = COL.mouth;
  ctx.fill();
  strokeNow(ctx, 2.5, COL.ink);
  crabClaw(ctx, 70, -140, p, false);
  ctx.restore();
}

function crabClaw(ctx, x, y, p, far) {
  const R = far ? '#9b2119' : '#d63a2f';
  const raise = p.claw;
  const elbow = [x + 50, y - 10 - raise * 70];
  const hand = [x + 95 - raise * 20, y - 20 - raise * 130];
  seg(ctx, [[x, y], elbow, hand], 18, R);
  const open = 0.2 + 0.35 * Math.abs(Math.sin(p.snap));
  ctx.save();
  ctx.translate(hand[0], hand[1]);
  ctx.rotate(-0.3 - raise * 0.9);
  ctx.save();
  ctx.rotate(-open);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(40, -42, 82, -6);
  ctx.quadraticCurveTo(44, -8, 0, 0);
  ctx.fillStyle = R;
  ctx.fill();
  strokeNow(ctx, 3.5, COL.ink);
  ctx.restore();
  ctx.save();
  ctx.rotate(open);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(36, 32, 68, 8);
  ctx.quadraticCurveTo(34, 6, 0, 0);
  ctx.fillStyle = R;
  ctx.fill();
  strokeNow(ctx, 3.5, COL.ink);
  ctx.restore();
  ell(ctx, 0, 0, 22, 20, 0, R, 3.5);
  ctx.restore();
}

/* ---------- props ---------- */

function drawCabbage(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ell(ctx, 0, 0, r, r * 0.9, 0, '#7cc96f', 2.5);
  ctx.beginPath();
  ctx.arc(-r * 0.2, r * 0.1, r * 0.7, -1.2, 0.8);
  ctx.moveTo(r * 0.5, -r * 0.5);
  ctx.quadraticCurveTo(r * 0.1, 0, r * 0.4, r * 0.6);
  strokeNow(ctx, 1.6, '#3e8f3a');
  ctx.restore();
}

// Grocery bag hanging from a handle point at (x, y).
function drawBag(ctx, x, y, s = 1, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-11, 20);
  ctx.quadraticCurveTo(-5, -4, 0, 0);
  ctx.quadraticCurveTo(5, -4, 11, 20);
  strokeNow(ctx, 3, '#bdb7a6');
  seg(ctx, [[8, 24], [19, -8]], 6, '#f4f6e8', 3);
  seg(ctx, [[17, -2], [24, -24]], 6, '#4caf50', 3);
  drawCabbage(ctx, -5, 20, 13);
  ctx.beginPath();
  rr(ctx, -20, 20, 40, 40, 6);
  ctx.fillStyle = '#f2eee2';
  ctx.fill();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#e3262f';
  ctx.fillRect(-19, 33, 38, 5);
  ctx.restore();
}

function drawRing(ctx, x, y, t, s = 1) {
  const w = Math.abs(Math.cos(t * 5)) * 13 + 2.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.ellipse(0, 0, w, 16, 0, 0, TAU);
  strokeNow(ctx, 7, '#7a4b00');
  strokeNow(ctx, 4.5, '#ffd23f');
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.max(1, w - 2.5), 13.5, 0, Math.PI * 1.1, Math.PI * 1.55);
  strokeNow(ctx, 1.6, '#fff6c0');
  ctx.restore();
}

const GEM_COLS = ['#3ddc84', '#3b82f6', '#ef4444', '#facc15', '#a855f7', '#22d3ee', '#f1f5f9'];

function drawEmerald(ctx, x, y, size, col, glow = 0, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (glow > 0) {
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 2.2);
    g.addColorStop(0, rgba(col, 0.7 * glow));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(-size * 2.2, -size * 2.2, size * 4.4, size * 4.4);
  }
  ctx.rotate(rot);
  const s = size;
  poly(ctx, [[-s * 0.5, -s * 0.3], [-s * 0.26, -s * 0.58], [s * 0.26, -s * 0.58], [s * 0.5, -s * 0.3], [0, s * 0.62]], col, 2.5);
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.3);
  ctx.lineTo(s * 0.5, -s * 0.3);
  ctx.moveTo(-s * 0.26, -s * 0.58);
  ctx.lineTo(-s * 0.13, -s * 0.3);
  ctx.lineTo(0, s * 0.62);
  ctx.moveTo(s * 0.26, -s * 0.58);
  ctx.lineTo(s * 0.13, -s * 0.3);
  ctx.lineTo(0, s * 0.62);
  strokeNow(ctx, 1.4, 'rgba(255,255,255,0.65)');
  poly(ctx, [[-s * 0.2, -s * 0.52], [-s * 0.08, -s * 0.52], [-s * 0.2, -s * 0.34]], 'rgba(255,255,255,0.85)', 0);
  ctx.restore();
}

function drawChiliDog(ctx, x, y, s = 1, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ell(ctx, 0, 3, 22, 8, 0, '#e8a85a', 2.5);
  ell(ctx, 0, -2, 21, 5, 0, '#b8442c', 2.2);
  ctx.beginPath();
  for (let i = 0; i < 7; i++) ctx.arc(-15 + i * 5, -6, 3.2, Math.PI, TAU);
  ctx.fillStyle = '#7a2a14';
  ctx.fill();
  ctx.restore();
}

function drawTumbleweed(ctx, x, y, r, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = '#8a6334';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, r * (0.5 + hash(i) * 0.5), r * (0.3 + hash(i + 9) * 0.6), i * 0.7, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRock(ctx, x, y, w, h, seed = 1, col = '#a8603e') {
  const pts = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = Math.PI + u * Math.PI;
    const j = 0.8 + hash(seed + i) * 0.3;
    pts.push([x + Math.cos(a) * w * 0.5 * j, y + Math.sin(a) * h * j]);
  }
  poly(ctx, pts, col, 3.5);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.25, y - h * 0.55);
  ctx.lineTo(x - w * 0.05, y - h * 0.35);
  ctx.lineTo(x + w * 0.2, y - h * 0.6);
  strokeNow(ctx, 2, 'rgba(0,0,0,0.25)');
}

function drawSpring(ctx, x, y, k = 0) {
  const h = 34 - k * 18;
  ctx.fillStyle = '#5b5f6b';
  ctx.fillRect(x - 26, y - 8, 52, 8);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 26, y - 8, 52, 8);
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) ctx.lineTo(x + (i % 2 ? 16 : -16), y - 8 - (i / 6) * h);
  strokeNow(ctx, 4, '#c9cdd8');
  ctx.beginPath();
  rr(ctx, x - 30, y - 18 - h, 60, 12, 4);
  ctx.fillStyle = '#ffd21f';
  ctx.fill();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#e3262f';
  ctx.fillRect(x - 30, y - 12 - h, 60, 4);
}

function drawRobot(ctx, x, y, t, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ell(ctx, -6, -8, 9, 9, 0, '#6b6f7c', 3);
  ctx.beginPath();
  ctx.arc(0, -16, 30, Math.PI, TAU);
  ctx.closePath();
  ctx.fillStyle = '#e3262f';
  ctx.fill();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  circle(ctx, -12, -30, 5, COL.ink);
  circle(ctx, 6, -36, 5, COL.ink);
  circle(ctx, 14, -22, 4, COL.ink);
  ell(ctx, 30, -16, 10, 10, 0, '#c9cdd8', 3);
  circle(ctx, 33, -17, 3.5, Math.floor(t * 4) % 2 ? '#ff4040' : '#ffd23f');
  ctx.restore();
}

function drawBird(ctx, x, y, t, s = 1) {
  const f = Math.sin(t * 30) * 0.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  poly(ctx, [[-4, -2], [-20, -14 - f * 12], [-10, 2]], '#3b82f6', 2.5);
  ell(ctx, 0, 0, 12, 9, 0, '#3b82f6', 2.5);
  circle(ctx, 6, -3, 2, COL.ink);
  poly(ctx, [[11, -1], [18, 1], [11, 3]], '#ffb020', 2);
  ctx.restore();
}

// A tiny eighth note, drawn rather than typed so it never depends on a font.
function drawNote(ctx, x, y, s, rot, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ell(ctx, 0, 0, 6, 4.5, -0.4, INK, 0);
  ctx.beginPath();
  ctx.moveTo(5, -2);
  ctx.lineTo(5, -22);
  ctx.quadraticCurveTo(12, -18, 13, -10);
  strokeNow(ctx, 2.4, INK);
  ctx.restore();
}
