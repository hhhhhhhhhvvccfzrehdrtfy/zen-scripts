'use strict';
/* Fight toolkit for Round 2: pose tracks that blend between keyframes, two-bone IK so fists and feet
   land where they are aimed, a scene camera, hit-stop (time freezes on impact while effects keep
   moving), anime impact frames, motion smears, sparks, debris and action backdrops. */

/* ---------- pose libraries (angles from straight down, + swings forward) ---------- */

// Sonic and Shadow share a body plan, so they share fight poses.
const HP = {
  stand: { legs: [[-0.1, -0.05], [0.13, -0.05]], arms: [[-0.1, 0.3], [0.15, 0.3]], lean: 0 },
  stance: { legs: [[-0.38, -0.3], [0.42, -0.5]], arms: [[0.55, 1.75], [0.85, 1.85]], lean: 0.15 },
  crouch: { legs: [[1.0, -2.0], [1.25, -2.1]], arms: [[-1.3, 0.5], [-1.1, 0.6]], lean: 0.5 },
  jab: { legs: [[-0.45, -0.25], [0.5, -0.45]], arms: [[0.55, 1.8], [1.55, 0.05]], lean: 0.3 },
  cross: { legs: [[-0.5, -0.2], [0.45, -0.5]], arms: [[1.6, 0.0], [0.5, 1.8]], lean: 0.42 },
  upper: { legs: [[-0.3, -0.3], [0.5, -0.6]], arms: [[0.4, 1.8], [2.6, 0.2]], lean: -0.1 },
  chamber: { legs: [[-0.2, -0.1], [1.7, -2.2]], arms: [[-0.6, 1.2], [0.5, 1.5]], lean: -0.1 },
  kickLow: { legs: [[-0.2, -0.1], [1.15, -0.05]], arms: [[-0.7, 0.8], [-0.5, 0.9]], lean: -0.15 },
  kickMid: { legs: [[-0.25, -0.1], [1.65, -0.05]], arms: [[-0.9, 0.8], [-0.6, 0.9]], lean: -0.32 },
  kickHigh: { legs: [[-0.15, -0.1], [2.45, -0.05]], arms: [[-1.4, 0.5], [-1.2, 0.6]], lean: -0.62 },
  axeUp: { legs: [[-0.1, -0.1], [3.0, -0.1]], arms: [[-1.0, 0.6], [-0.8, 0.6]], lean: -0.4 },
  axeDown: { legs: [[-0.4, -0.3], [1.3, 0]], arms: [[1.6, 0.6], [1.9, 0.5]], lean: 0.35 },
  tuck: { legs: [[1.9, -2.3], [2.0, -2.4]], arms: [[1.2, 1.6], [1.0, 1.7]], lean: 0.4 },
  land: { legs: [[0.9, -1.8], [1.15, -1.9]], arms: [[-0.6, 0.4], [0.9, 0.7]], lean: 0.45 },
  skid: { legs: [[0.75, -0.3], [1.0, -0.15]], arms: [[-1.4, 0.4], [-1.6, 0.3]], lean: -0.32 },
  heels: { legs: [[0.55, -0.15], [0.8, -0.1]], arms: [[-0.6, 1.4], [-0.4, 1.5]], lean: -0.45 },
  recoil: { legs: [[-0.5, -0.3], [0.7, -0.5]], arms: [[2.6, 0.3], [2.3, 0.4]], lean: -0.5 },
  float: { legs: [[-0.15, -0.5], [0.2, -0.7]], arms: [[-0.7, 0.5], [-0.5, 0.6]], lean: 0.05 },
  skate: { legs: [[-0.9, -0.2], [0.45, -0.7]], arms: [[-1.3, 0.3], [-1.1, 0.4]], lean: 0.38 },
  throw: { legs: [[-0.4, -0.2], [0.45, -0.45]], arms: [[-0.8, 0.6], [1.75, 0.05]], lean: 0.3 },
  windThrow: { legs: [[-0.45, -0.2], [0.4, -0.5]], arms: [[0.3, 1.2], [-1.9, 0.5]], lean: -0.2 },
  cross2: { legs: [[-0.12, -0.04], [0.16, -0.06]], arms: [[0.3, 1.35], [0.55, -2.05]], lean: -0.05 },
  raise: { legs: [[-0.12, -0.04], [0.16, -0.06]], arms: [[-0.2, 0.4], [2.9, 0.15]], lean: -0.05 },
  dizzy: { legs: [[-0.3, -0.1], [0.4, -0.2]], arms: [[-0.6, 0.4], [0.7, 0.3]], lean: -0.1 },
};

const ZP = {
  stand: { legs: [[-0.06, -0.03], [0.08, -0.03]], arms: [[-0.05, 0.12], [0.07, 0.12]], lean: 0, tilt: 0 },
  dodgeBack: { legs: [[-0.24, -0.05], [0.14, -0.08]], arms: [[-0.2, 0.15], [-0.1, 0.15]], lean: -0.24 },
  dodgeFwd: { legs: [[-0.1, -0.05], [0.25, -0.2]], arms: [[-0.05, 0.12], [0.1, 0.15]], lean: 0.2 },
  duck: { legs: [[0.6, -1.2], [0.8, -1.3]], arms: [[-0.3, 0.3], [0.2, 0.3]], lean: 0.25 },
  yawn: { legs: [[-0.06, -0.03], [0.08, -0.03]], arms: [[-0.05, 0.12], [0.85, 2.35]] },
  brush: { arms: [[-0.05, 0.12], [0.5, 2.75]] },
  finger: { arms: [[-0.05, 0.12], [1.45, 0.08]] },
  block: { legs: [[-0.3, -0.1], [0.3, -0.2]], arms: [[1.15, 1.95], [1.3, 1.85]], lean: -0.05 },
  ready: { legs: [[-0.45, -0.05], [0.4, -0.25]], arms: [[0.6, 1.6], [0.9, 1.7]], lean: 0.08 },
  windup: { legs: [[-0.5, -0.04], [0.45, -0.35]], arms: [[1.2, 0.6], [-1.1, 2.3]], lean: -0.12 },
  punch: { legs: [[-0.42, -0.04], [0.38, -0.2]], arms: [[-0.7, 1.9], [1.57, 0]], lean: 0.14 },
  punchFar: { legs: [[-0.42, -0.04], [0.38, -0.2]], arms: [[1.57, 0], [-0.7, 1.9]], lean: 0.18 },
  toss: { legs: [[-0.1, -0.05], [0.2, -0.1]], arms: [[-0.05, 0.12], [2.6, 0.3]], lean: -0.1 },
  hop: { legs: [[0.4, -0.9], [0.6, -1.1]], arms: [[-0.3, 0.3], [-0.2, 0.3]], lean: 0 },
  spread: { legs: [[-0.35, -0.05], [0.35, -0.05]], arms: [[1.5, 0.1], [1.4, 0.1]], lean: 0 },
};

/* ---------- tracks ---------- */

const TRACK_NUM = ['x', 'y', 'rot', 'lean', 'hipLift', 'ground', 'headTilt', 'tilt', 'wind', 'aura', 'sup', 'alpha', 'look', 's', 'z', 'r', 'spin', 'jet', 'vein', 'blink'];

// A track is a list of keys {t, ...fields}; each key inherits everything from the previous one, so a key
// only names what changes. Numbers, legs and arms blend with the easing on the destination key (e);
// everything else (dir, expr, hands, ball...) switches when its key is reached.
function makeTrack(keys, base = {}) {
  const ks = [];
  let prev = { ...base };
  for (const k of keys) {
    prev = { ...prev, ...k, e: k.e };
    ks.push(prev);
  }
  const f = (t) => {
    if (t <= ks[0].t) return ks[0];
    let i = 1;
    while (i < ks.length && ks[i].t <= t) i++;
    if (i >= ks.length) return ks[ks.length - 1];
    const a = ks[i - 1];
    const b = ks[i];
    const u = (b.e || E.inOut)(clamp((t - a.t) / (b.t - a.t)));
    const o = { ...a };
    for (const n of TRACK_NUM) if (typeof a[n] === 'number' && typeof b[n] === 'number') o[n] = lerp(a[n], b[n], u);
    if (a.legs && b.legs) o.legs = a.legs.map((l, j) => [lerp(l[0], b.legs[j][0], u), lerp(l[1], b.legs[j][1], u)]);
    if (a.arms && b.arms) o.arms = a.arms.map((l, j) => [lerp(l[0], b.arms[j][0], u), lerp(l[1], b.arms[j][1], u)]);
    return o;
  };
  f.keys = ks;
  return f;
}

// Blend two pose objects (legs, arms and numeric fields) by u.
function blendPose(a, b, u) {
  const o = { ...a };
  for (const n of TRACK_NUM) if (typeof a[n] === 'number' && typeof b[n] === 'number') o[n] = lerp(a[n], b[n], u);
  if (a.legs && b.legs) o.legs = a.legs.map((l, j) => [lerp(l[0], b.legs[j][0], u), lerp(l[1], b.legs[j][1], u)]);
  if (a.arms && b.arms) o.arms = a.arms.map((l, j) => [lerp(l[0], b.arms[j][0], u), lerp(l[1], b.arms[j][1], u)]);
  return o;
}

// Strike curve for one attack cycle u in [0, 1): quick snap out, hold, slower recovery.
function strikeCurve(u, hit = 0.32) {
  if (u < hit) return E.out3(u / hit);
  if (u < hit + 0.12) return 1;
  return 1 - E.inOut((u - hit - 0.12) / (1 - hit - 0.12));
}

/* ---------- reach and IK ---------- */

function rigToWorld(x, y, s, dir, rot, hy, lean, lx, ly, leaned) {
  let px = lx;
  let py = ly;
  if (leaned && lean) {
    const dx = px;
    const dy = py - hy;
    const c = Math.cos(lean);
    const sn = Math.sin(lean);
    px = dx * c - dy * sn;
    py = hy + dx * sn + dy * c;
  }
  if (rot) {
    const c = Math.cos(rot);
    const sn = Math.sin(rot);
    const qx = px * c - py * sn;
    py = px * sn + py * c;
    px = qx;
  }
  return [x + px * s * dir, y + py * s];
}

const HOG_BASE = { legs: HP.stand.legs, arms: HP.stand.arms, lean: 0, rot: 0, hipLift: 0 };
const SAI_BASE = { legs: ZP.stand.legs, arms: ZP.stand.arms, lean: 0, rot: 0, hipLift: 0 };

// World position of a body part for a Sonic-shaped rig (Sonic or Shadow).
function hogPoint(x, y, s, dir, o, part) {
  const p = { ...HOG_BASE, ...o };
  const hy = sonicHipY(p);
  let lx;
  let ly;
  let leaned = true;
  if (part === 'hand' || part === 'handFar') {
    const far = part === 'handFar';
    const [a1, rel] = p.arms[far ? 0 : 1];
    const [, , h, a2] = limb(far ? -3 : 3, hy - (far ? 36 : 37), a1, SON.upper, rel, SON.fore);
    lx = h[0] + Math.sin(a2) * 8;
    ly = h[1] + Math.cos(a2) * 8;
  } else if (part === 'foot' || part === 'footFar') {
    const far = part === 'footFar';
    const [a1, rel] = p.legs[far ? 0 : 1];
    const [, , f] = limb(far ? -4 : 4, hy, a1, SON.thigh, rel, SON.shin);
    lx = f[0] + 10;
    ly = f[1] + 6;
    leaned = false;
  } else if (part === 'head') {
    lx = 5;
    ly = hy - 68;
  } else if (part === 'nose') {
    lx = 38;
    ly = hy - 62;
  } else {
    lx = 2;
    ly = hy - 22;
  }
  return rigToWorld(x, y, s, dir, p.rot, hy, p.lean, lx, ly, leaned);
}

function saiPoint(x, y, s, dir, o, part) {
  const p = { ...SAI_BASE, ...o };
  const hy = saiHipY(p);
  let lx;
  let ly;
  let leaned = true;
  if (part === 'hand' || part === 'handFar' || part === 'finger') {
    const far = part === 'handFar';
    const [a1, rel] = p.arms[far ? 0 : 1];
    const [, , h, a2] = limb(far ? -8 : 6, hy - 58, a1, SAI.upper, rel, SAI.fore);
    const ext = part === 'finger' ? 23 : 6;
    lx = h[0] + Math.sin(a2) * ext;
    ly = h[1] + Math.cos(a2) * ext;
  } else if (part === 'foot') {
    const [a1, rel] = p.legs[1];
    const [, , f] = limb(5, hy, a1, SAI.thigh, rel, SAI.shin);
    lx = f[0] + 8;
    ly = f[1] + 5;
    leaned = false;
  } else if (part === 'head') {
    lx = 5;
    ly = hy - 92;
  } else if (part === 'back') {
    lx = -20;
    ly = hy - 40;
  } else {
    lx = 8;
    ly = hy - 40;
  }
  return rigToWorld(x, y, s, dir, p.rot, hy, p.lean, lx, ly, leaned);
}

// Two-bone IK in rig-local space. bend -1 puts the joint below the reach line (elbows), +1 above (knees).
function ik2(sx, sy, tx, ty, l1, l2, bend) {
  const dx = tx - sx;
  const dy = ty - sy;
  const L = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01);
  const th = Math.atan2(dx, dy);
  const al = Math.acos(clamp((l1 * l1 + L * L - l2 * l2) / (2 * l1 * L), -1, 1));
  const a1 = th + bend * al;
  const ex = sx + Math.sin(a1) * l1;
  const ey = sy + Math.cos(a1) * l1;
  let rel = Math.atan2(tx - ex, ty - ey) - a1;
  rel = ((((rel + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  return [a1, rel];
}

function toLocal(x, y, s, dir, hy, lean, tx, ty) {
  let lx = (tx - x) / (s * dir);
  let ly = (ty - y) / s;
  if (lean) {
    const dy = ly - hy;
    const c = Math.cos(-lean);
    const sn = Math.sin(-lean);
    const nx = lx * c - dy * sn;
    ly = hy + lx * sn + dy * c;
    lx = nx;
  }
  return [lx, ly];
}

// Arm angles that put Saitama's fist (or fingertip) on a world point.
function saiReachIK(x, y, s, dir, o, tx, ty, far = false, finger = false) {
  const p = { ...SAI_BASE, ...o };
  const hy = saiHipY(p);
  const [lx, ly] = toLocal(x, y, s, dir, hy, p.lean, tx, ty);
  return ik2(far ? -8 : 6, hy - 58, lx, ly, SAI.upper, SAI.fore + (finger ? 23 : 6), -1);
}

function hogReachIK(x, y, s, dir, o, tx, ty, far = false) {
  const p = { ...HOG_BASE, ...o };
  const hy = sonicHipY(p);
  const [lx, ly] = toLocal(x, y, s, dir, hy, p.lean, tx, ty);
  return ik2(far ? -3 : 3, hy - 37, lx, ly, SON.upper, SON.fore + 8, -1);
}

// Origin that puts a body part of a hog rig on (tx, ty).
function hogPlace(s, dir, o, part, tx, ty) {
  const [px, py] = hogPoint(0, 0, s, dir, o, part);
  return [tx - px, ty - py];
}

/* ---------- camera ---------- */

function camApply(ctx, c, sx = 0, sy = 0) {
  ctx.translate(W / 2 + sx, H / 2 + sy);
  if (c.r) ctx.rotate(c.r);
  ctx.scale(c.z, c.z);
  ctx.translate(-c.x, -c.y);
}

function camPoint(c, x, y) {
  const dx = (x - c.x) * c.z;
  const dy = (y - c.y) * c.z;
  const cs = Math.cos(c.r || 0);
  const sn = Math.sin(c.r || 0);
  return [W / 2 + dx * cs - dy * sn, H / 2 + dx * sn + dy * cs];
}

/* ---------- hit-stop ---------- */

// holds: [[actionTime, holdSeconds, shake, impactFrame?]], sorted. Returns holds with their real start r.
function makeHolds(list) {
  let acc = 0;
  return list.map(([a, d, k = 10, frame = false]) => {
    const h = { a, d, k, frame, r: a + acc };
    acc += d;
    return h;
  });
}

// Real (wall-clock) scene time to action time: action stands still during each hold.
function warp(lt, hs) {
  let at = lt;
  for (const h of hs) {
    if (at <= h.a) break;
    if (at < h.a + h.d) return h.a;
    at -= h.d;
  }
  return at;
}

function realT(a, hs) {
  let r = a;
  for (const h of hs) {
    if (h.a < a) r += h.d;
    else break;
  }
  return r;
}

function holdShake(lt, hs) {
  let s = 0;
  for (const h of hs) {
    const u = lt - h.r;
    if (u >= 0 && u < 0.55) s = Math.max(s, h.k * (1 - u / 0.55));
  }
  return s;
}

// The impact frame showing at lt, if any: { h, phase } with phase 0 then 1.
function frameAt(lt, hs) {
  if (REDUCED) return null;
  for (const h of hs) {
    if (!h.frame) continue;
    const len = Math.min(h.d, 0.2);
    if (lt >= h.r && lt < h.r + len) return { h, phase: lt - h.r < len / 2 ? 0 : 1 };
  }
  return null;
}

// Time since the most recent hold at or before lt (real seconds), and that hold.
function sinceHit(lt, hs) {
  let best = null;
  for (const h of hs) if (h.r <= lt) best = h;
  return best ? [lt - best.r, best] : [99, null];
}

/* ---------- impact frames ---------- */

const _ifc = { c: null };

// Anime impact frame: flat background, actors as solid silhouettes, focus lines.
// phase 0: white ground, ink figures. phase 1: ink ground, white figures.
function impactFrame(ctx, phase, cam, drawActors, fx, fy, t, accent = '#e3262f') {
  if (!_ifc.c) _ifc.c = makeCanvas(W, H);
  const g = _ifc.c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.save();
  camApply(g, cam);
  drawActors(g);
  g.restore();
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = phase ? '#ffffff' : INK;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.fillStyle = phase ? INK : '#ffffff';
  ctx.fillRect(-50, -50, W + 100, H + 100);
  const [sx, sy] = camPoint(cam, fx, fy);
  focusLines(ctx, sx, sy, t * 3, { color: phase ? accent : INK, alpha: 0.85, r0: 90, n: 150 });
  ctx.drawImage(_ifc.c, 0, 0);
  ctx.restore();
}

/* ---------- motion effects ---------- */

// Fading polyline through recent positions (newest first).
function smear(ctx, pts, col, w, glow = true) {
  if (pts.length < 2) return;
  ctx.save();
  if (glow) ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.strokeStyle = col;
  for (let i = 1; i < pts.length; i++) {
    const k = 1 - i / pts.length;
    ctx.globalAlpha = k * 0.85;
    ctx.lineWidth = w * k + 1.5;
    ctx.beginPath();
    ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
    ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  ctx.restore();
}

// Draw fn(t) at earlier times as fading afterimages.
function ghosts(n, dt, at, fn, alpha = 0.3) {
  for (let k = n; k >= 1; k--) fn(at - k * dt, alpha * (1 - (k - 1) / n));
}

function sparks(ctx, x, y, p, o = {}) {
  if (p <= 0 || p >= 1) return;
  const n = o.n ?? 10;
  const seed = o.seed ?? 1;
  const len = o.len ?? 70;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.strokeStyle = o.col || '#fff3a0';
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? 0) + (hash(seed + i) - 0.5) * (o.spread ?? TAU);
    const d0 = len * E.out3(p) * (0.5 + hash(seed + i * 3) * 0.7);
    const d1 = d0 * 0.5;
    ctx.globalAlpha = 1 - p;
    ctx.lineWidth = 3.5 * (1 - p) + 1;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * d1, y + Math.sin(a) * d1);
    ctx.lineTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0);
    ctx.stroke();
  }
  ctx.restore();
}

// A hit: flash disc, star, sparks and a ring, all driven by real seconds since contact.
function hitFx(ctx, x, y, since, size = 1, col = '#ffe27a', seed = 1) {
  if (since < 0 || since > 0.6) return;
  const p = since / 0.45;
  if (since < 0.07) circle(ctx, x, y, 40 * size, 'rgba(255,255,255,0.9)');
  burst(ctx, x, y, p, 90 * size, { c2: col, rot: seed });
  sparks(ctx, x, y, since / 0.5, { n: 9, len: 90 * size, seed, col: '#fff6c0' });
  shock(ctx, x, y, since / 0.5, 120 * size, { w: 8 * size });
}

// Homing-attack lock-on marker.
function reticle(ctx, x, y, t, k) {
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  const sc = lerp(2, 1, E.out3(clamp(k)));
  ctx.scale(sc, sc);
  ctx.globalAlpha *= Math.min(1, k * 3);
  ctx.rotate(t * 4);
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((i * TAU) / 3);
    poly(ctx, [[0, -44], [-10, -28], [10, -28]], '#ff3b3b', 2.5);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, TAU);
  strokeNow(ctx, 3, '#39e66b');
  ctx.restore();
}

function cracks(ctx, x, y, k, seed = 1, size = 1) {
  if (k <= 0) return;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    let px = x;
    let py = y;
    ctx.lineWidth = 3 - i * 0.2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    const n = 4;
    for (let j = 1; j <= n; j++) {
      px += side * (18 + hash(seed + i * 9 + j) * 34) * size * k;
      py += (hash(seed + i * 5 + j) - 0.45) * 10 * size;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Chunks thrown from (x, y) under gravity; t is seconds since the break.
function debris(ctx, x, y, t, o = {}) {
  if (t < 0 || t > (o.life ?? 2.5)) return;
  const n = o.n ?? 10;
  const seed = o.seed ?? 1;
  const floor = o.floor ?? y + 20;
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? -Math.PI / 2) + (hash(seed + i) - 0.5) * (o.spread ?? 2.4);
    const v = (o.v ?? 600) * (0.45 + hash(seed + i * 3) * 0.75);
    const px = x + Math.cos(a) * v * t;
    const py = Math.min(floor, y + Math.sin(a) * v * t + 900 * t * t);
    const r = (o.size ?? 9) * (0.6 + hash(seed + i * 7) * 0.9);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t * 8 * (hash(seed + i * 11) - 0.5));
    poly(ctx, [[-r, -r * 0.6], [r * 0.4, -r], [r, r * 0.2], [-r * 0.2, r * 0.8]], o.col || '#a8603e', 2.2);
    ctx.restore();
  }
}

// Anime backdrop: a hot radial gradient with converging lines, for big moments.
function actionBackdrop(ctx, t, o = {}) {
  const cx = o.x ?? W / 2;
  const cy = o.y ?? H / 2;
  ctx.save();
  ctx.globalAlpha *= o.a ?? 1;
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 900);
  g.addColorStop(0, o.c0 || '#fff6c8');
  g.addColorStop(0.35, o.c1 || '#ffb43c');
  g.addColorStop(1, o.c2 || '#9b2a1a');
  ctx.fillStyle = g;
  ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  focusLines(ctx, cx, cy, t, { color: o.lines || '#fff2b0', alpha: 0.5, r0: 150, n: 150 });
  ctx.restore();
}

// Diagonal speed backdrop for chase beats.
function speedBackdrop(ctx, t, o = {}) {
  ctx.save();
  ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = o.bg || '#1c2a6b';
  ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.translate(W / 2, H / 2);
  ctx.rotate(o.angle ?? -0.25);
  ctx.translate(-W / 2, -H / 2);
  speedLines(ctx, t, { n: 70, alpha: 0.7, speed: o.speed ?? 3600, color: o.lines || '#9ec2ff', y0: -300, y1: H + 300 });
  ctx.restore();
}

// Drain colour from everything drawn so far (Chaos Control). k 0..1.
function desaturate(ctx, k, tint = '#8fd8a8') {
  if (k <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'saturation';
  ctx.globalAlpha = k;
  ctx.fillStyle = '#808080';
  ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.35 * k;
  ctx.fillStyle = tint;
  ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.restore();
}

// One flying fist for Saitama's barrage, pointing along +x.
function drawFist(ctx, x, y, s, rot, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  seg(ctx, [[-60, 0], [-14, 0]], 16, COL.red, 4);
  seg(ctx, [[-100, 0], [-58, 0]], 14, COL.suit, 4);
  ell(ctx, 0, 0, 15, 14, 0, COL.red, 3);
  ctx.beginPath();
  ctx.moveTo(4, -9);
  ctx.lineTo(4, 9);
  strokeNow(ctx, 1.6, COL.redD);
  ctx.restore();
}

// Draw something as a flat silhouette in one colour (title teaser, impact frames).
function silhouette(ctx, drawFn, col) {
  if (!_ifc.c) _ifc.c = makeCanvas(W, H);
  const g = _ifc.c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  drawFn(g);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(_ifc.c, 0, 0);
}

// Sonic's Sonic Wind: a small spinning whirlwind. k scales it, fading as it dies.
function miniTornado(ctx, x, y, t, k) {
  if (k <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let j = 0; j < 7; j++) {
    const ry = 5 + j * 2.4;
    const rx = (18 + j * 9) * k;
    const yy = y - j * 16 * k;
    ctx.globalAlpha = 0.75 * Math.min(1, k * 1.5);
    ctx.strokeStyle = j % 2 ? '#bfe0ff' : '#3b74ff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    const a0 = t * 14 + j;
    ctx.ellipse(x + Math.sin(t * 9 + j) * 4, yy, rx, ry, 0, a0, a0 + 4.2);
    ctx.stroke();
  }
  ctx.restore();
}
