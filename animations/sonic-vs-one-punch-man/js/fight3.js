'use strict';
/* Round 3 fight helpers. In space nobody stands on anything, so tracks key each fighter by the centre of
   his body (x, y) and spin him about it (rot). These helpers turn that into the rig origin, find where a
   fist or foot is, and solve arms and legs onto targets with the spin taken into account.

   On top of the keyed poses sits a layer of secondary motion (animate): limbs drag behind the body and
   swing through when it stops, the body leans into acceleration, quills and cape react to speed, the
   body stretches along fast moves and squashes on impact, and a slow breathing drift means no pose is
   ever held dead still. Key paths run along smooth curves through their keys rather than straight lines. */

const HC = 92; // Shadic's body centre above his feet, in rig units, with his legs hanging free
const ZC = 150; // Saitama's
const SS = 0.8; // Shadic's scale

const H_BASE = { ...HOG_BASE, ground: 0, s: SS, dir: 1 };
const Z_BASE = { ...SAI_BASE, ground: 0, s: 1, dir: 1 };

TRACK_NUM.push('still', 'sq', 'rip', 'hyper', 'quillWob', 'capeRot');

/* ---------- curved key paths ---------- */

// Like makeTrack, but x and y follow a Catmull-Rom curve through the keys, so a body moving through
// three or more keys swings along an arc instead of zigzagging. A key with cut: true jumps there;
// lin: true runs straight into it (a ricochet's sharp corner).
function makeTrack3(keys, base = {}) {
  const f = makeTrack(keys, base);
  const ks = f.keys;
  // cut and lin belong to the key they are written on; makeTrack would carry them forward
  const cut = keys.map((k) => !!k.cut);
  const lin = keys.map((k) => !!k.lin);
  const g = (t) => {
    const o = f(t);
    if (t <= ks[0].t || t >= ks[ks.length - 1].t) return o;
    let i = 1;
    while (i < ks.length && ks[i].t <= t) i++;
    const a = ks[i - 1];
    const b = ks[i];
    if (cut[i]) return f(a.t); // hold everything, then jump at the cut
    if (lin[i]) return o;
    if (a.x === b.x && a.y === b.y) return o;
    const u = (b.e || E.inOut)(clamp((t - a.t) / (b.t - a.t)));
    const p0 = i > 1 && !cut[i - 1] && !lin[i - 1] ? ks[i - 2] : a;
    const p3 = i + 1 < ks.length && !cut[i + 1] && !lin[i + 1] ? ks[i + 1] : b;
    const tan = (prev, next, from, to) => {
      // flat where the body holds still on either side, so holds never drift
      if ((prev.x === from.x && prev.y === from.y && prev !== from) || (next.x === to.x && next.y === to.y && next !== to)) return [0, 0];
      return [(next.x - prev.x) * 0.5, (next.y - prev.y) * 0.5];
    };
    const [m0x, m0y] = tan(p0, b, a, a);
    const [m1x, m1y] = tan(a, p3, b, b);
    const u2 = u * u;
    const u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1;
    const h10 = u3 - 2 * u2 + u;
    const h01 = -2 * u3 + 3 * u2;
    const h11 = u3 - u2;
    return { ...o, x: h00 * a.x + h10 * m0x + h01 * b.x + h11 * m1x, y: h00 * a.y + h10 * m0y + h01 * b.y + h11 * m1y };
  };
  g.keys = ks;
  return g;
}

/* ---------- secondary motion ---------- */

// Wrap a centre-keyed track with secondary motion. o.cape: Saitama's cape follows the motion;
// o.seed varies the breathing so two characters never sway in step. A key's still (0..1) switches the
// layer off, for frames where a fist or foot must sit exactly on its target.
function animate(track, o = {}) {
  const seed = o.seed ?? 1;
  const w = TAU * (o.hz ?? 3.0);
  const kk = w * w;
  const cc = 2 * (o.damp ?? 0.3) * w;
  const step = 1 / 60;
  const span = 0.75;
  const f = (t) => {
    const p = { ...track(t) };
    // a lagging point on a damped spring, driven by the body's acceleration, integrated from rest
    let Lx = 0;
    let Ly = 0;
    let Vx = 0;
    let Vy = 0;
    let cur = track(t - span);
    const pre = track(t - span - step);
    let pvx = (cur.x - pre.x) / step;
    let pvy = (cur.y - pre.y) / step;
    let svx = pvx;
    let svy = pvy;
    for (let n = 1; n <= Math.round(span / step); n++) {
      const nx = track(t - span + n * step);
      const dx = nx.x - cur.x;
      const dy = nx.y - cur.y;
      if (dx * dx + dy * dy > 150 * 150 || (nx.alpha ?? 1) < 0.05) {
        // a cut or a teleport: start the spring again from rest
        Lx = Ly = Vx = Vy = 0;
        pvx = pvy = svx = svy = 0;
        cur = nx;
        continue;
      }
      const vx = dx / step;
      const vy = dy / step;
      Vx += (-kk * Lx - cc * Vx - (vx - pvx) / step) * step;
      Vy += (-kk * Ly - cc * Vy - (vy - pvy) / step) * step;
      Lx += Vx * step;
      Ly += Vy * step;
      pvx = vx;
      pvy = vy;
      svx = lerp(svx, vx, 0.35);
      svy = lerp(svy, vy, 0.35);
      cur = nx;
    }
    const Lm = Math.hypot(Lx, Ly);
    if (Lm > 90) {
      Lx *= 90 / Lm;
      Ly *= 90 / Lm;
    }
    const live = 1 - clamp(p.still || 0);
    const speed = Math.hypot(svx, svy);
    // into rig space: undo facing and spin
    const dir = p.dir ?? 1;
    const r = p.rot || 0;
    const toRig = (x, y) => {
      const lx = x / dir;
      return [lx * Math.cos(r) + y * Math.sin(r), -lx * Math.sin(r) + y * Math.cos(r)];
    };
    const [lx, ly] = toRig(Lx, Ly);
    const lm = Math.hypot(lx, ly);
    const phi = Math.atan2(lx, ly);
    const g = live * Math.min(0.8, lm / 60);
    const drag = (limb, k1, k2) => {
      const a1 = limb[0] + g * k1 * Math.sin(phi - limb[0]);
      const rel = limb[1] + g * k2 * Math.sin(phi - (a1 + limb[1]));
      return [a1, rel];
    };
    const idle = live * (1 - clamp(speed / 260));
    const nz = (k, sp = 0.7) => noise(t * sp + seed * 13.7 + k * 5.1);
    if (p.arms) p.arms = p.arms.map((a, j) => drag([a[0] + nz(j) * 0.09 * idle, a[1] + nz(j + 2) * 0.07 * idle], 0.85, 0.55));
    if (p.legs) p.legs = p.legs.map((a, j) => drag([a[0] + nz(j + 4, 0.5) * 0.07 * idle, a[1] + nz(j + 6, 0.5) * 0.06 * idle], 0.6, 0.45));
    p.lean = (p.lean || 0) + live * clamp(lx * 0.005, -0.38, 0.38) + nz(9, 0.45) * 0.035 * idle;
    if (o.cape) p.tilt = (p.tilt || 0) + live * clamp(lx * 0.002, -0.15, 0.15) + nz(11, 0.4) * 0.04 * idle;
    else p.headTilt = (p.headTilt || 0) + live * clamp(lx * 0.003, -0.2, 0.2) + nz(11, 0.4) * 0.05 * idle;
    p.y += Math.sin(t * 1.7 + seed * 2.1) * 2.6 * idle;
    p.x += Math.sin(t * 1.1 + seed * 4.3) * 1.4 * idle;
    p.quillWob = (p.quillWob || 0) + live * Math.min(2.4, lm / 26 + speed / 1300);
    if (o.cape) {
      p.wind = Math.max(p.wind ?? 0.15, 0.2 + Math.min(1.5, speed / 650 + lm / 80));
      if (p.capeRot == null) {
        // the cape streams away from the direction of travel, and floats loose when he is still
        const [vx, vy] = toRig(svx, svy);
        const k = clamp(speed / 450);
        let ang = speed > 1 ? Math.atan2(-vy, -vx) - Math.atan2(-0.25, -1) : 0;
        ang -= TAU * Math.round(ang / TAU);
        p.capeRot = ang * k + nz(13, 0.6) * 0.12 * (1 - k);
      }
    }
    p.stretch = live * Math.min(0.26, speed / 3400) + (p.sq || 0);
    p.stretchAng = Math.atan2(svy, svx);
    return p;
  };
  f.keys = track.keys;
  f.raw = track;
  return f;
}

// Squash and stretch about the body centre along an angle.
function withStretch(ctx, p, fn) {
  const st = p.stretch || 0;
  if (Math.abs(st) < 0.005) return fn();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.stretchAng || 0);
  ctx.scale(1 + st, 1 / (1 + st));
  ctx.rotate(-(p.stretchAng || 0));
  ctx.translate(-p.x, -p.y);
  fn();
  ctx.restore();
}

function orgOf(st, C) {
  const s = st.s;
  const d = st.dir ?? 1;
  const r = st.rot || 0;
  return [st.x - s * d * C * Math.sin(r), st.y + s * C * Math.cos(r)];
}

function drawH(ctx, st, t, extra = {}) {
  const p = { ...H_BASE, ...st, t, ...extra };
  if (p.alpha != null && p.alpha <= 0.01) return;
  const [ox, oy] = orgOf(p, HC);
  withStretch(ctx, p, () => drawShadic(ctx, ox, oy, p.s, p.dir, p));
}

// Sonic or Shadow (or Shadic) through any hedgehog draw function, keyed by centre.
function drawHogC(fn, ctx, st, t, extra = {}) {
  const p = { ...H_BASE, ...st, t, ...extra };
  if (p.alpha != null && p.alpha <= 0.01) return;
  const [ox, oy] = orgOf(p, HC);
  withStretch(ctx, p, () => fn(ctx, ox, oy, p.s, p.dir, p));
}

function drawZ(ctx, st, t, extra = {}) {
  const p = { ...Z_BASE, ...st, t, ...extra };
  if (p.alpha != null && p.alpha <= 0.01) return;
  // unless told otherwise, the cape trails behind him whichever way he is spun
  if (p.capeRot == null && p.rot) p.capeRot = -(p.rot - TAU * Math.round(p.rot / TAU));
  const [ox, oy] = orgOf(p, ZC);
  withStretch(ctx, p, () => drawSaitama(ctx, ox, oy, p.s, p.dir, p));
}

function ptH(st, part) {
  const p = { ...H_BASE, ...st };
  if (part === 'center') return [p.x, p.y];
  const [ox, oy] = orgOf(p, HC);
  return hogPoint(ox, oy, p.s, p.dir, p, part);
}

function ptZ(st, part) {
  const p = { ...Z_BASE, ...st };
  if (part === 'center') return [p.x, p.y];
  const [ox, oy] = orgOf(p, ZC);
  return saiPoint(ox, oy, p.s, p.dir, p, part);
}

// World point to rig-local, undoing scale, facing, spin and (for arms) the upper-body lean.
function toLocal3(ox, oy, s, dir, rot, hy, lean, tx, ty) {
  let lx = (tx - ox) / (s * dir);
  let ly = (ty - oy) / s;
  if (rot) {
    const c = Math.cos(rot);
    const sn = Math.sin(rot);
    const qx = lx * c + ly * sn;
    ly = -lx * sn + ly * c;
    lx = qx;
  }
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

// Arm angles putting Shadic's fist on (tx, ty).
function armH(st, tx, ty, far = false) {
  const p = { ...H_BASE, ...st };
  const hy = sonicHipY(p);
  const [ox, oy] = orgOf(p, HC);
  const [lx, ly] = toLocal3(ox, oy, p.s, p.dir, p.rot || 0, hy, p.lean, tx, ty);
  return ik2(far ? -3 : 3, hy - (far ? 36 : 37), lx, ly, SON.upper, SON.fore + 8, -1);
}

// Leg angles putting Shadic's toe on (tx, ty).
function legH(st, tx, ty, far = false) {
  const p = { ...H_BASE, ...st };
  const hy = sonicHipY(p);
  const [ox, oy] = orgOf(p, HC);
  const [lx, ly] = toLocal3(ox, oy, p.s, p.dir, p.rot || 0, hy, 0, tx, ty);
  return ik2(far ? -4 : 4, hy, lx - 10, ly - 6, SON.thigh, SON.shin, 1);
}

function armZ(st, tx, ty, far = false, finger = false) {
  const p = { ...Z_BASE, ...st };
  const hy = saiHipY(p);
  const [ox, oy] = orgOf(p, ZC);
  const [lx, ly] = toLocal3(ox, oy, p.s, p.dir, p.rot || 0, hy, p.lean, tx, ty);
  return ik2(far ? -8 : 6, hy - 58, lx, ly, SAI.upper, SAI.fore + (finger ? 23 : 6), -1);
}

function legZ(st, tx, ty, far = false) {
  const p = { ...Z_BASE, ...st };
  const hy = saiHipY(p);
  const [ox, oy] = orgOf(p, ZC);
  const [lx, ly] = toLocal3(ox, oy, p.s, p.dir, p.rot || 0, hy, 0, tx, ty);
  return ik2(far ? -5 : 5, hy, lx - 8, ly - 5, SAI.thigh, SAI.shin, 1);
}

// Shift a pose so that one of its parts lands on (tx, ty).
function putH(st, part, tx, ty) {
  const [px, py] = ptH(st, part);
  return { ...st, x: st.x + tx - px, y: st.y + ty - py };
}
function putZ(st, part, tx, ty) {
  const [px, py] = ptZ(st, part);
  return { ...st, x: st.x + tx - px, y: st.y + ty - py };
}

// Strike keys: solve the striking limb onto a target and return the pose with that limb set.
function hitArmH(st, tx, ty, far = false) {
  const a = armH(st, tx, ty, far);
  const arms = far ? [a, st.arms[1]] : [st.arms[0], a];
  return { ...st, arms };
}
function hitLegH(st, tx, ty, far = false) {
  const l = legH(st, tx, ty, far);
  const legs = far ? [l, st.legs[1]] : [st.legs[0], l];
  return { ...st, legs };
}
function hitArmZ(st, tx, ty, far = false, finger = false) {
  const a = armZ(st, tx, ty, far, finger);
  const arms = far ? [a, st.arms[1]] : [st.arms[0], a];
  return { ...st, arms };
}
function hitLegZ(st, tx, ty, far = false) {
  const l = legZ(st, tx, ty, far);
  const legs = far ? [l, st.legs[1]] : [st.legs[0], l];
  return { ...st, legs };
}

/* ---------- zero-g poses ---------- */

// Hedgehog poses for floating and flying (angles as in HP). Flight poses are meant to be spun with rot.
const HQ = {
  drift: { legs: [[-0.25, -0.45], [0.3, -0.75]], arms: [[-0.5, 0.6], [-0.2, 0.7]], lean: 0.05 },
  guard: { legs: [[-0.3, -0.5], [0.45, -0.9]], arms: [[1.25, 1.75], [1.45, 1.7]], lean: 0.12 },
  fly: { legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[-0.6, 0.3], [2.8, 0.15]], lean: 0.1 },
  dive: { legs: [[-0.2, -0.15], [-0.05, -0.25]], arms: [[2.75, 0.2], [2.95, 0.1]], lean: 0.05 },
  brake: { legs: [[0.9, -1.2], [1.3, -1.6]], arms: [[-1.2, 0.5], [-1.4, 0.4]], lean: -0.35 },
  coil: { legs: [[1.5, -2.2], [1.7, -2.3]], arms: [[1.0, 1.9], [1.2, 1.8]], lean: 0.45 },
  spread: { legs: [[-0.45, -0.2], [0.5, -0.3]], arms: [[-0.75, 0.45], [0.85, 0.45]], lean: -0.18 },
  hurt: { legs: [[-0.6, -0.5], [0.9, -0.3]], arms: [[-2.2, 0.4], [2.4, 0.5]], lean: -0.5 },
  wind: { legs: [[-0.4, -0.3], [0.5, -0.6]], arms: [[0.3, 1.3], [-2.0, 0.6]], lean: -0.25 },
  throw: { legs: [[-0.5, -0.2], [0.55, -0.5]], arms: [[-0.9, 0.6], [1.7, 0.05]], lean: 0.35 },
};

// Saitama in zero-g.
const ZQ = {
  drift: { legs: [[-0.15, -0.25], [0.2, -0.35]], arms: [[-0.35, 0.3], [0.3, 0.35]], lean: 0 },
  missile: { legs: [[-0.03, -0.02], [0.03, -0.02]], arms: [[-0.12, 0.04], [0.1, 0.04]], lean: 0 },
  ready: { legs: [[-0.45, -0.25], [0.45, -0.5]], arms: [[0.6, 1.6], [0.9, 1.7]], lean: 0.08 },
  block: { legs: [[-0.3, -0.3], [0.35, -0.5]], arms: [[1.15, 1.95], [1.3, 1.85]], lean: -0.05 },
  punch: { legs: [[-0.5, -0.1], [0.4, -0.4]], arms: [[-0.7, 1.9], [1.57, 0]], lean: 0.18 },
  windup: { legs: [[-0.55, -0.1], [0.5, -0.5]], arms: [[1.2, 0.6], [-1.1, 2.3]], lean: -0.12 },
  flyFist: { legs: [[-0.25, -0.15], [-0.05, -0.35]], arms: [[-0.6, 0.5], [2.95, 0.05]], lean: 0.05 },
  crouch: { legs: [[1.2, -2.1], [1.4, -2.2]], arms: [[-0.6, 0.6], [-0.4, 0.6]], lean: 0.4 },
  tuck: { legs: [[1.7, -2.4], [1.9, -2.5]], arms: [[0.9, 1.6], [1.1, 1.5]], lean: 0.5 },
  spread: { legs: [[-0.45, -0.1], [0.45, -0.1]], arms: [[-1.5, 0.1], [1.5, 0.1]], lean: 0 },
  thumb: { legs: [[-0.15, -0.25], [0.2, -0.35]], arms: [[-0.35, 0.3], [0.95, 1.4]], hands: ['fist', 'fist'], lean: 0 },
};

/* ---------- effects ---------- */

// Ribbon through recent positions (newest first), its hue running along the length.
function rainbowRibbon(ctx, pts, w, t, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) {
    const k = 1 - i / pts.length;
    ctx.globalAlpha = alpha * k * 0.9;
    ctx.strokeStyle = `hsl(${(t * 300 + i * 22) % 360},100%,65%)`;
    ctx.lineWidth = w * k + 2;
    ctx.beginPath();
    ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
    ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = w * 0.3;
  ctx.beginPath();
  pts.slice(0, Math.ceil(pts.length * 0.5)).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
}

// Sample a track's centres (or a part) back in time.
function pastPts(track, a, n, dt, part = 'center', pt = ptH) {
  const out = [];
  for (let k = 0; k < n; k++) out.push(pt(track(a - k * dt), part));
  return out;
}

function ghostsOf(ctx, track, a, n, dt, draw, alpha = 0.3, extra = {}) {
  for (let k = n; k >= 1; k--) draw(ctx, track(a - k * dt), a - k * dt, { ...extra, alpha: alpha * (1 - (k - 1) / n) });
}

// Chaos Control: a green ring snapping open where someone blinks out or in.
function warpRing(ctx, x, y, since, size = 1) {
  if (since < 0 || since > 0.5) return;
  const u = since / 0.5;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 1 - u;
  ctx.lineWidth = 10 * (1 - u) + 2;
  ctx.strokeStyle = '#7dffb0';
  ctx.beginPath();
  ctx.ellipse(x, y, 30 + 120 * E.out3(u) * size, (30 + 120 * E.out3(u) * size) * 0.4, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 90 * size * (1 - u));
  ctx.lineTo(x, y + 90 * size * (1 - u));
  ctx.stroke();
  ctx.restore();
}

// A rainbow-and-white hit for Shadic's blows; plain gold for Saitama's.
function hit3(ctx, x, y, since, size = 1, seed = 1, rainbow = true) {
  hitFx(ctx, x, y, since, size, rainbow ? `hsl(${(seed * 67) % 360},100%,70%)` : '#ffe27a', seed);
}

// A pressure cone from a punch: arcs racing outward along ang.
function punchWave(ctx, x, y, ang, since, len = 900, o = {}) {
  if (since < 0 || since > (o.life ?? 0.9)) return;
  const u = since / (o.life ?? 0.9);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = 1 - u;
  ctx.strokeStyle = o.col || '#ffffff';
  for (let i = 0; i < 4; i++) {
    const d = len * E.out3(clamp(u * 1.3 - i * 0.12));
    if (d <= 0) continue;
    const r = 40 + d * 0.35;
    ctx.lineWidth = (12 - i * 2) * (1 - u) + 1;
    ctx.beginPath();
    ctx.arc(d - r, 0, r, -0.5, 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

// Screen-space speech anchor a little above a head point.
function headAnchor(c, pt, up = 70) {
  const [x, y] = camPoint(c, pt[0], pt[1]);
  return [x, y - up * c.z];
}

// Knee positions, for knee strikes and checks.
function kneeH(st, far = false) {
  const p = { ...H_BASE, ...st };
  const hy = sonicHipY(p);
  const a1 = p.legs[far ? 0 : 1][0];
  const [ox, oy] = orgOf(p, HC);
  return rigToWorld(ox, oy, p.s, p.dir, p.rot || 0, hy, 0, (far ? -4 : 4) + Math.sin(a1) * SON.thigh, hy + Math.cos(a1) * SON.thigh, false);
}
function kneeZ(st, far = false) {
  const p = { ...Z_BASE, ...st };
  const hy = saiHipY(p);
  const a1 = p.legs[far ? 0 : 1][0];
  const [ox, oy] = orgOf(p, ZC);
  return rigToWorld(ox, oy, p.s, p.dir, p.rot || 0, hy, 0, (far ? -5 : 5) + Math.sin(a1) * SAI.thigh, hy + Math.cos(a1) * SAI.thigh, false);
}

// Shadic's Chaos Spear: a white-hot bolt with a cyan glow and a rainbow fringe, pointing along +x.
function hyperSpear(ctx, x, y, rot, s = 1, alpha = 1, t = 0) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(-110, 0, 30, 0);
  g.addColorStop(0, 'rgba(90,220,255,0)');
  g.addColorStop(1, 'rgba(140,240,255,0.85)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.lineTo(-8, -12);
  ctx.lineTo(-110, 0);
  ctx.lineTo(-8, 12);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `hsla(${(t * 500) % 360},100%,70%,0.8)`;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(-2, -4.5);
  ctx.lineTo(-56, 0);
  ctx.lineTo(-2, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Whiff: a pale arc where a blow cut the air.
function whiff(ctx, x, y, ang, since, r = 50) {
  if (since < 0 || since > 0.25) return;
  const u = since / 0.25;
  ctx.save();
  ctx.globalAlpha = 1 - u;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4 * (1 - u) + 1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, r + u * 40, ang - 0.7, ang + 0.7);
  ctx.stroke();
  ctx.restore();
}
