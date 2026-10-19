'use strict';
/* Saitama in his hero suit, after the anime model sheet: egg-shaped bald head with the round-eyed
   "OK" face, white shoulder mantle with black buttons, ring zipper pull, black belt with a round gold
   buckle, red gloves, flared red boots, and a cape that reaches his ankles.
   Feet at (0, 0), facing right. About 230 units tall at scale 1. */

const SAI = { thigh: 50, shin: 50, foot: 12, upper: 37, fore: 34 };

function drawSaitama(ctx, x, y, s, dir, o = {}) {
  const p = Object.assign(
    {
      lean: 0,
      legs: [[-0.06, -0.03], [0.08, -0.03]],
      arms: [[-0.05, 0.12], [0.07, 0.12]],
      expr: 'ok',
      look: 0,
      blink: 0,
      wind: 0.15,
      t: 0,
      air: false,
      hipLift: 0,
      hands: ['fist', 'fist'],
      talk: false,
      tilt: 0,
      vein: 0,
      rot: 0,
      alpha: 1,
      carry: null,
    },
    o
  );
  ctx.save();
  if (p.alpha < 1) ctx.globalAlpha *= p.alpha;
  ctx.translate(x, y);
  ctx.scale(s * dir, s);
  if (p.rot) ctx.rotate(p.rot);
  const hy = saiHipY(p);
  const hx = 0;
  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  saiCape(ctx, hx, hy, p);
  saiArm(ctx, hx - 8, hy - 58, p.arms[0], true, p.hands[0]);
  ctx.restore();
  saiLeg(ctx, hx - 5, hy, p.legs[0], true);
  saiLeg(ctx, hx + 5, hy, p.legs[1], false);
  ctx.save();
  leanAbout(ctx, hx, hy, p.lean);
  saiTorso(ctx, hx, hy, p.rip);
  ell(ctx, hx + 4, hy - 70, 6.5, 8, 0, COL.skin, 2.6);
  saiHead(ctx, hx + 5, hy - 92, p);
  saiCollar(ctx, hx, hy);
  const hand = saiArm(ctx, hx + 6, hy - 58, p.arms[1], false, p.hands[1]);
  if (p.carry) p.carry(ctx, hand[0], hand[1]);
  ctx.restore();
  ctx.restore();
}

// Hip height above the feet; same ground blend as Sonic's.
function saiHipY(p) {
  const hl = p.hipLift || 0;
  const g = p.ground ?? (p.air ? 0 : 1);
  const airY = -112 - hl;
  if (g <= 0) return airY;
  let reach = 0;
  for (const [a1, rel] of p.legs) reach = Math.max(reach, Math.cos(a1) * SAI.thigh + Math.cos(a1 + rel) * SAI.shin);
  const gy = -(reach + SAI.foot) - hl;
  return g >= 1 ? gy : lerp(airY, gy, g);
}

function saiLeg(ctx, x, y, [a1, rel], far) {
  const [h, k, f, a2] = limb(x, y, a1, SAI.thigh, rel, SAI.shin);
  const Y = far ? COL.suitD : COL.suit;
  const R = far ? COL.redD : COL.red;
  seg(ctx, [h, k, f], 16, Y);
  const b = [lerp(k[0], f[0], 0.14), lerp(k[1], f[1], 0.14)];
  seg(ctx, [b, f], 18, R, 4);
  ctx.save();
  ctx.translate(b[0], b[1]);
  ctx.rotate(-a2);
  ell(ctx, 0, 0, 12, 5, 0, R, 2.6);
  ctx.restore();
  if (!far) {
    ctx.beginPath();
    ctx.moveTo(lerp(k[0], f[0], 0.3) + 5, lerp(k[1], f[1], 0.3));
    ctx.lineTo(lerp(k[0], f[0], 0.85) + 4, lerp(k[1], f[1], 0.85));
    strokeNow(ctx, 2, 'rgba(255,255,255,0.35)');
  }
  ctx.save();
  ctx.translate(f[0], f[1]);
  ctx.rotate(clamp(-a2 * 0.5, -0.8, 0.9));
  ell(ctx, 8, 5, 16, 7.5, 0, R, 3);
  ctx.restore();
}

function saiArm(ctx, x, y, [a1, rel], far, hand) {
  const [s0, e, h, a2] = limb(x, y, a1, SAI.upper, rel, SAI.fore);
  const Y = far ? COL.suitD : COL.suit;
  const R = far ? COL.redD : COL.red;
  seg(ctx, [s0, e, h], 14, Y);
  const g = [lerp(e[0], h[0], 0.42), lerp(e[1], h[1], 0.42)];
  seg(ctx, [g, h], 16, R, 4);
  ctx.save();
  ctx.translate(h[0], h[1]);
  ctx.rotate(-a2);
  if (hand === 'finger') {
    seg(ctx, [[0, 8], [0, 23]], 6, R, 3.5);
    ell(ctx, 0, 5, 9, 8.5, 0, R, 3);
  } else if (hand === 'open') {
    seg(ctx, [[-6, 4], [-12, 11]], 5, R, 3);
    ell(ctx, 0, 7, 8.5, 11, 0, R, 3);
  } else if (hand === 'thumb') {
    ell(ctx, 0, 6, 10.5, 10.5, 0, R, 3);
    seg(ctx, [[-6, 2], [-15, -4]], 6, R, 3);
  } else if (hand === 'big') ell(ctx, 0, 7, 14, 14, 0, R, 3.5);
  else ell(ctx, 0, 6, 10.5, 10.5, 0, R, 3);
  ctx.restore();
  return h;
}

function torsoPath(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 15, y + 5);
  ctx.lineTo(x + 17, y + 5);
  ctx.quadraticCurveTo(x + 21, y - 28, x + 22, y - 52);
  ctx.quadraticCurveTo(x + 21, y - 65, x + 8, y - 67);
  ctx.lineTo(x - 9, y - 67);
  ctx.quadraticCurveTo(x - 22, y - 66, x - 21, y - 50);
  ctx.quadraticCurveTo(x - 20, y - 24, x - 15, y + 5);
  ctx.closePath();
}

// Ragged holes torn in the suit, as [cx, cy, size] in torso space; rip 0..1 opens them in order.
const SAI_RIPS = [[8, -34, 11], [-8, -18, 9], [12, -16, 7], [-12, -48, 8]];

function saiTorso(ctx, x, y, rip = 0) {
  torsoPath(ctx, x, y);
  ctx.fillStyle = COL.suit;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = COL.suitD;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 70);
  ctx.quadraticCurveTo(x - 10, y - 30, x - 14, y + 8);
  ctx.lineTo(x - 30, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 46);
  ctx.quadraticCurveTo(x + 12, y - 38, x + 22, y - 42);
  strokeNow(ctx, 1.6, COL.suitD);
  ctx.globalAlpha = 1;
  SAI_RIPS.forEach(([cx, cy, sz], i) => {
    const k = clamp(rip * SAI_RIPS.length - i);
    if (k <= 0) return;
    const r = sz * k;
    ctx.beginPath();
    for (let j = 0; j < 10; j++) {
      const a = (j / 10) * TAU;
      const rr2 = r * (j % 2 ? 0.55 : 1) * (0.8 + hash(i * 13 + j) * 0.4);
      ctx.lineTo(x + cx + Math.cos(a) * rr2, y + cy + Math.sin(a) * rr2 * 0.8);
    }
    ctx.closePath();
    ctx.fillStyle = COL.skin;
    ctx.fill();
    strokeNow(ctx, 1.6, COL.ink);
  });
  ctx.restore();
  torsoPath(ctx, x, y);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 16, y - 56);
  ctx.lineTo(x + 17, y - 12);
  strokeNow(ctx, 1.8, '#b38a00');
  ctx.beginPath();
  rr(ctx, x - 17, y - 10, 39, 12, 3);
  ctx.fillStyle = COL.belt;
  ctx.fill();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ell(ctx, x + 14, y - 4, 8, 7.5, 0, COL.buckle, 2.5);
  ell(ctx, x + 14, y - 4, 4.5, 4, 0, null, 1.4);
}

// White mantle over the shoulders, with the black button and the zipper's ring pull.
function saiCollar(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 58);
  ctx.quadraticCurveTo(x - 16, y - 74, x + 2, y - 74);
  ctx.quadraticCurveTo(x + 22, y - 72, x + 22, y - 58);
  ctx.quadraticCurveTo(x + 12, y - 51, x - 2, y - 53);
  ctx.quadraticCurveTo(x - 16, y - 50, x - 22, y - 58);
  ctx.closePath();
  ctx.fillStyle = COL.cape;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = COL.capeD;
  ctx.fillRect(x - 26, y - 58, 50, 10);
  ctx.restore();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ell(ctx, x + 15, y - 59, 4.4, 4.4, 0, '#1b1b1f', 1.8);
  circle(ctx, x + 14, y - 60.5, 1.2, '#777');
  ctx.beginPath();
  ctx.arc(x + 20, y - 50, 3.2, 0, TAU);
  strokeNow(ctx, 1.8, '#8c8c8c');
}

function saiCape(ctx, x, y, p) {
  const w = p.wind;
  const t = p.t;
  const f1 = Math.sin(t * 9) * (2 + w * 7);
  const f2 = Math.sin(t * 9 + 1.2) * (3 + w * 12);
  const f3 = Math.sin(t * 9 + 2.3) * (3 + w * 14);
  // capeRot swings the whole cape about the collar, for flying straight up or down
  ctx.save();
  if (p.capeRot) leanAbout(ctx, x + 6, y - 68, p.capeRot);
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 68);
    ctx.quadraticCurveTo(x - 10, y - 72, x - 22, y - 60);
    if (p.torn) {
      // shredded by an explosion: shorter, with a ragged hem
      const bx = x - 34 - w * 90;
      const by = y + 30 + f2 - w * 60;
      const fx = x + 2 - w * 44;
      const fy = y + 46 - w * 50;
      ctx.quadraticCurveTo(x - 30 - w * 40, y - 10 + f1, bx, by);
      for (let i = 1; i <= 7; i++) {
        const u = i / 7;
        ctx.lineTo(lerp(bx, fx, u), lerp(by, fy, u) + (i % 2 ? 16 : -6) + Math.sin(i * 1.7) * 4);
      }
    } else {
      ctx.quadraticCurveTo(x - 32 - w * 40, y - 6 + f1, x - 38 - w * 100, y + 60 + f2 - w * 66);
      ctx.quadraticCurveTo(x - 22 - w * 76, y + 98 + f3 - w * 70, x + 2 - w * 48, y + 90 - w * 58);
    }
    ctx.quadraticCurveTo(x + 8, y + 10, x + 6, y - 68);
    ctx.closePath();
  };
  path();
  ctx.fillStyle = COL.cape;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = COL.capeD;
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 60);
  ctx.quadraticCurveTo(x - 16 - w * 40, y + 10 + f1, x - 12 - w * 60, y + 100 - w * 60);
  ctx.lineTo(x + 20, y + 100);
  ctx.lineTo(x + 20, y - 60);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  path();
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 3.4;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 50);
  ctx.quadraticCurveTo(x - 26 - w * 34, y + 10 + f1, x - 26 - w * 70, y + 70 + f2 * 0.6 - w * 60);
  strokeNow(ctx, 1.8, '#b9b6ab');
  ctx.restore();
}

function headPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.bezierCurveTo(-19, -26, 18, -28, 18.5, -3);
  ctx.bezierCurveTo(19, 10, 14, 20, 5, 21.5);
  ctx.bezierCurveTo(-6, 22, -17, 14, -18, -2);
  ctx.closePath();
}

function saiHead(ctx, x, y, p) {
  ctx.save();
  ctx.translate(x, y);
  if (p.tilt) ctx.rotate(p.tilt);
  headPath(ctx);
  ctx.fillStyle = COL.skin;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = COL.skinD;
  ctx.globalAlpha = p.expr === 'serious' ? 0.8 : 0.6;
  ctx.beginPath();
  ctx.ellipse(-15, 6, 13, 24, 0, 0, TAU);
  ctx.fill();
  if (p.expr === 'serious') {
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(8, 22, 16, 6, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  headPath(ctx);
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = p.expr === 'serious' ? 4 : 3.2;
  ctx.stroke();
  ell(ctx, -4, -16, 7, 3.5, -0.45, 'rgba(255,255,255,0.85)', 0);
  ell(ctx, -6, 2, 3.6, 5.6, 0, COL.skin, 2.3);
  ctx.beginPath();
  ctx.arc(-6, 2, 2, -1.2, 1.2);
  strokeNow(ctx, 1, '#b88a66');
  saiFace(ctx, p);
  if (p.vein) saiVein(ctx, -8, -12, p.vein);
  ctx.restore();
}

function saiFace(ctx, p) {
  const e = p.expr;
  const lx = p.look * 1.3;
  const talking = p.talk && Math.floor(p.t * 9) % 2 === 0;
  const okEyes = () => {
    ell(ctx, 6 + lx, -3, 3.4, 3.7, 0, '#ffffff', 1.4);
    circle(ctx, 6.5 + lx, -2.8, 1.15, COL.ink);
    ell(ctx, 14.2 + lx, -3, 3, 3.5, 0, '#ffffff', 1.4);
    circle(ctx, 14.6 + lx, -2.8, 1.05, COL.ink);
  };
  const closedEyes = () => {
    ctx.beginPath();
    ctx.moveTo(3, -3);
    ctx.lineTo(9, -3);
    ctx.moveTo(11.5, -3);
    ctx.lineTo(17, -3);
    strokeNow(ctx, 1.8, COL.ink);
  };
  const brows = (ang = 0) => {
    ctx.beginPath();
    ctx.moveTo(3, -9.5 - ang);
    ctx.lineTo(8.5, -9.8 + ang);
    ctx.moveTo(11.5, -9.8 + ang);
    ctx.lineTo(16, -9.4 - ang);
    strokeNow(ctx, 1.3, COL.ink);
  };
  const nose = () => {
    ctx.beginPath();
    ctx.moveTo(17, 1.5);
    ctx.quadraticCurveTo(19, 4.5, 16.5, 5.5);
    strokeNow(ctx, 1.2, '#a8785a');
  };
  const flatMouth = () => {
    ctx.beginPath();
    ctx.moveTo(7.5, 11.5);
    ctx.lineTo(12.5, 11.5);
    strokeNow(ctx, 1.8, COL.ink);
  };
  const talkMouth = () => ell(ctx, 10, 11.5, 2.8, 2.3, 0, COL.mouth, 1.5);
  switch (e) {
    case 'serious': {
      ctx.beginPath();
      ctx.moveTo(1.5, -3);
      ctx.quadraticCurveTo(6, -7, 10, -3.6);
      ctx.quadraticCurveTo(6, -0.8, 1.5, -3);
      ctx.moveTo(11.5, -3.6);
      ctx.quadraticCurveTo(14.5, -6.6, 17.5, -3.8);
      ctx.quadraticCurveTo(14.5, -1.2, 11.5, -3.6);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      strokeNow(ctx, 1.5, COL.ink);
      circle(ctx, 7 + lx, -3.4, 1.8, COL.ink);
      circle(ctx, 15 + lx, -3.6, 1.5, COL.ink);
      ctx.beginPath();
      ctx.moveTo(1, -9.5);
      ctx.lineTo(9.5, -6.8);
      ctx.moveTo(12, -7);
      ctx.lineTo(18, -9.6);
      strokeNow(ctx, 2.6, COL.ink);
      ctx.beginPath();
      ctx.moveTo(16.5, -1);
      ctx.lineTo(19.5, 4.5);
      ctx.lineTo(16, 5.8);
      strokeNow(ctx, 1.4, COL.ink);
      ctx.beginPath();
      ctx.moveTo(1, 3);
      ctx.quadraticCurveTo(3, 8, 4.5, 13);
      ctx.moveTo(3, 0.5);
      ctx.lineTo(8, 1);
      ctx.moveTo(12.5, 0.6);
      ctx.lineTo(16, 0.4);
      strokeNow(ctx, 1.1, '#a8785a');
      if (talking) ell(ctx, 10.5, 12, 3.2, 2.2, 0, COL.mouth, 1.5);
      else {
        ctx.beginPath();
        ctx.moveTo(6.5, 12);
        ctx.lineTo(14, 11.6);
        strokeNow(ctx, 2, COL.ink);
      }
      ctx.beginPath();
      ctx.moveTo(8.5, 15.5);
      ctx.lineTo(12, 15.5);
      strokeNow(ctx, 1.1, '#a8785a');
      break;
    }
    case 'puff':
      // holding his breath: round eyes, cheeks blown out
      okEyes();
      brows(-0.6);
      ell(ctx, 14, 8.5, 10.5, 8.5, 0.1, COL.skin, 1.8);
      ell(ctx, 14.5, 6.5, 4.5, 2, 0.1, 'rgba(255,160,140,0.75)', 0);
      ctx.beginPath();
      ctx.moveTo(17.5, 12);
      ctx.lineTo(20, 12.5);
      strokeNow(ctx, 1.8, COL.ink);
      break;
    case 'happy':
      ctx.beginPath();
      ctx.arc(6, -1.5, 3, Math.PI, TAU);
      ctx.moveTo(17, -1.5);
      ctx.arc(14.2, -1.5, 2.8, Math.PI, TAU);
      strokeNow(ctx, 1.8, COL.ink);
      nose();
      if (talking) talkMouth();
      else {
        ctx.beginPath();
        ctx.arc(10, 8, 4.5, 0.3, Math.PI - 0.3);
        strokeNow(ctx, 1.8, COL.ink);
      }
      break;
    case 'shock':
      ell(ctx, 6, -4, 4.6, 5.6, 0, '#ffffff', 1.7);
      ell(ctx, 14.8, -4, 4, 5, 0, '#ffffff', 1.7);
      circle(ctx, 6.3, -4, 1, COL.ink);
      circle(ctx, 15, -4, 0.9, COL.ink);
      ell(ctx, 10.5, 12.5, 6, 8, 0, COL.mouth, 2);
      ctx.beginPath();
      ctx.moveTo(6.5, 7.2);
      ctx.lineTo(14.5, 7.2);
      strokeNow(ctx, 2.4, '#ffffff');
      break;
    case 'yawn':
      closedEyes();
      ell(ctx, 10, 12, 4.2, 6, 0, COL.mouth, 1.7);
      break;
    case 'ah':
      ctx.beginPath();
      ctx.moveTo(2, -6);
      ctx.lineTo(8, -3);
      ctx.lineTo(2, -0.5);
      ctx.moveTo(17, -6);
      ctx.lineTo(12, -3);
      ctx.lineTo(17, -0.5);
      strokeNow(ctx, 1.9, COL.ink);
      ell(ctx, 10.5, 12, 3.2 + Math.sin(p.t * 10) * 0.5, 3.2, 0, COL.mouth, 1.5);
      circle(ctx, 17.5, 4, 1.1, COL.ink);
      break;
    case 'achoo':
      ctx.beginPath();
      ctx.moveTo(1, -7);
      ctx.lineTo(8, -3);
      ctx.lineTo(1, 0);
      ctx.moveTo(18, -7);
      ctx.lineTo(12, -3);
      ctx.lineTo(18, 0);
      strokeNow(ctx, 2.2, COL.ink);
      ell(ctx, 11, 12, 6.5, 6, 0, COL.mouth, 1.9);
      break;
    case 'sad':
      okEyes();
      brows(-1.5);
      ctx.beginPath();
      ctx.moveTo(6, 1);
      ctx.quadraticCurveTo(4, 10, 6, 21);
      ctx.moveTo(14.5, 1);
      ctx.quadraticCurveTo(16.5, 10, 14.5, 21);
      strokeNow(ctx, 2.4, '#7cc8ff');
      ctx.beginPath();
      ctx.moveTo(6.5, 12.5);
      ctx.quadraticCurveTo(8.5, 10, 10.5, 12.5);
      ctx.quadraticCurveTo(12.5, 15, 14, 12);
      strokeNow(ctx, 1.7, COL.ink);
      break;
    case 'annoyed':
      okEyes();
      brows(1.6);
      nose();
      if (talking) talkMouth();
      else flatMouth();
      break;
    default:
      if (p.blink > 0.5) closedEyes();
      else okEyes();
      brows();
      nose();
      if (talking) talkMouth();
      else flatMouth();
  }
}

function saiVein(ctx, x, y, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.strokeStyle = '#e3262f';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 2 + 0.6);
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.quadraticCurveTo(6, 2, 7, 6);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
