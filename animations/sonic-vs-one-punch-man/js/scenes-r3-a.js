'use strict';
/* Round 3, part one: the fusion, Saitama's launch, and the fight in Earth orbit. The fight is one
   battle across several chapters, each handing off to the next on a hard cut in mid-action.
   Fighters are keyed by their body centre (see fight3.js); fight time runs in action time with
   hit-stop holds, as in Round 2. */

const SCENES = [];
BUB.shadic = { edge: '#8a4bff', fill: '#ffffff', ink: '#1d1240' };
BUB.shadow = { edge: '#c81e28', fill: '#ffffff', ink: '#1a1016' };

function scene(d) {
  SCENES.push(
    Object.assign({ fadeIn: 0.01, fadeOut: 0, fadeInColor: '#000', fadeOutColor: '#000', cues: [], lines: [], music: [[0, 'none']] }, d)
  );
}

// A scene written in action time: its lines, cues, music and length are converted to real time.
function fightScene(d) {
  const hs = makeHolds(d.holds || []);
  const R = (a) => realT(a, hs);
  const def = {
    ...d,
    dur: R(d.dur),
    lines: (d.lines || []).map((l) => [R(l[0]), R(l[1]), ...l.slice(2)]),
    cues: (d.cues || []).map((c) => [R(c[0]), ...c.slice(1)]),
    music: (d.music || [[0, 'none']]).map(([a, m]) => [R(a), m]),
    holds: hs,
  };
  def.draw = (ctx, lt) => d.render(ctx, warp(lt, hs), lt, hs, def);
  scene(def);
}

function anchorsFor(cam, list) {
  const out = {};
  for (const [who, x, y] of list) out[who] = camPoint(cam, x, y);
  return out;
}

const K = (...parts) => Object.assign({}, ...parts);

// The fourteen emeralds on a tilted ring; front picks the near half so fighters can sit between.
function emeraldRing(ctx, cx, cy, rx, ry, ang, glow, front) {
  for (let i = 0; i < 14; i++) {
    const a = ang + (i / 14) * TAU;
    const s = Math.sin(a);
    if (s > 0 !== front) continue;
    const big = i % 2 === 1;
    drawEmerald(ctx, cx + Math.cos(a) * rx, cy + s * ry, (big ? 21 : 14) * (0.85 + 0.15 * s), GEM_COLS[Math.floor(i / 2)], glow, a * 0.7);
  }
}

/* ---------- 1. Fusion ---------- */

const BUMP1 = [640, 372];
const SON1_BUMP = { x: 604, y: 392, dir: 1, arms: [[-0.5, 0.7], [0, 0]] };
const SHD1_BUMP = { x: 676, y: 388, dir: -1, arms: [[-0.5, 0.7], [0, 0]] };

// Sonic: hyped, talking with his whole body.
const SON1 = animate(makeTrack3([
  { t: 0, x: 500, y: 392, dir: 1, legs: [[-0.35, -0.6], [0.3, -0.95]], arms: [[-0.45, 0.7], [0.1, 0.9]], lean: 0.05, headTilt: 0.05, rot: 0.04, expr: 'grin', hands: ['fist', 'fist'] },
  { t: 0.45, arms: [[-0.6, 0.8], [-0.2, 1.4]], lean: -0.04, e: E.out },
  { t: 0.7, x: 506, arms: [[-0.3, 0.6], [1.35, 0.9]], hands: ['fist', 'open'], lean: 0.14, headTilt: -0.06, e: E.out3 },
  { t: 1.25, arms: [[-0.25, 0.65], [1.5, 0.6]], lean: 0.17 },
  { t: 1.55, arms: [[-0.5, 1.0], [0.6, 1.7]], rot: -0.06, headTilt: 0.12, expr: 'sheepish', e: E.inOut },
  { t: 2.05, arms: [[-0.4, 0.6], [0.8, 2.05]], hands: ['fist', 'thumb'], lean: 0, rot: 0.02, headTilt: -0.08, expr: 'smirk', e: E.out },
  { t: 2.7, arms: [[-0.5, 0.7], [0.2, 1.1]], hands: ['fist', 'fist'], lean: 0.04, headTilt: 0 },
  { t: 3.4, arms: [[-0.6, 0.8], [-0.3, 1.0]], lean: -0.05, headTilt: 0.18, expr: 'sheepish' },
  { t: 4.0, y: 384, legs: [[-0.5, -0.4], [0.35, -1.0]], arms: [[-0.45, -1.5], [0.4, 1.75]], hands: ['open', 'open'], lean: -0.08, headTilt: 0.2, e: E.out3 },
  { t: 4.5, y: 388, arms: [[-0.35, -1.3], [0.3, 1.6]], headTilt: 0.14 },
  { t: 4.75, x: 504, legs: [[0.4, -1.2], [0.7, -1.5]], arms: [[-0.9, 0.5], [-0.6, 1.2]], hands: ['fist', 'fist'], lean: -0.2, rot: -0.1, headTilt: 0.05, expr: 'grin', e: E.out },
  { t: 5.0, x: 520, y: 380, legs: [[-0.6, -0.2], [0.4, -0.6]], arms: [[-0.9, 0.5], [2.3, 0.1]], lean: 0.16, rot: 0.06, headTilt: -0.05, e: E.out3 },
  { t: 5.35, x: 556, y: 386, arms: [[-0.8, 0.6], [2.1, 0.4]] },
  { t: 5.62, x: 590, y: 392, arms: [[-0.5, 0.7], [0.6, 2.2]], legs: [[-0.45, -0.4], [0.35, -0.8]], lean: 0.2, rot: 0, e: E.inOut },
  { t: 5.8, ...hitArmH({ ...SON1_BUMP, legs: [[-0.45, -0.4], [0.35, -0.8]], lean: 0.2 }, BUMP1[0], BUMP1[1]), still: 1, e: E.out3 },
  { t: 6.05, x: 600, still: 0 },
  { t: 6.3, x: 610, legs: [[1.6, -2.3], [1.8, -2.4]], arms: [[1.1, 1.9], [1.3, 1.8]], lean: 0.5, rot: 0.6, e: E.in },
]), { seed: 1 });

// Shadow: arms folded, looking anywhere but at Sonic, then giving in.
const SHD1 = animate(makeTrack3([
  { t: 0, x: 780, y: 388, dir: -1, legs: [[-0.2, -0.4], [0.35, -0.7]], arms: HP.cross2.arms, lean: -0.06, headTilt: -0.1, rot: -0.03, expr: 'scowl', hands: ['fist', 'fist'] },
  { t: 1.4, headTilt: -0.16, expr: 'closed' },
  { t: 2.75, headTilt: 0.05, lean: 0.1, expr: 'scowl', e: E.out },
  { t: 3.3, x: 772, arms: [[0.3, 1.35], [1.4, 0.2]], hands: ['fist', 'point'], lean: 0.18, e: E.out3 },
  { t: 3.9, arms: [[0.3, 1.35], [0.7, 0.4]], hands: ['fist', 'open'], lean: 0.1 },
  { t: 4.6, arms: HP.cross2.arms, hands: ['fist', 'fist'], lean: -0.04, headTilt: -0.12, expr: 'scowl' },
  { t: 4.95, x: 790, lean: -0.15, headTilt: -0.18, e: E.out },
  { t: 5.15, x: 770, arms: [[-0.4, 0.6], [0.1, 0.9]], lean: 0.05, headTilt: 0.05, expr: 'smirk' },
  { t: 5.55, x: 712, arms: [[-0.5, 0.7], [0.6, 2.1]], lean: 0.18 },
  { t: 5.8, ...hitArmH({ ...SHD1_BUMP, legs: [[-0.2, -0.4], [0.35, -0.7]], lean: 0.18 }, BUMP1[0], BUMP1[1]), still: 1, e: E.out3 },
  { t: 6.05, x: 680, still: 0 },
  { t: 6.3, x: 670, legs: [[1.6, -2.3], [1.8, -2.4]], arms: [[1.1, 1.9], [1.3, 1.8]], lean: 0.5, rot: 0.6, e: E.in },
]), { seed: 2 });

// Hyper Shadic's first breath.
const HY1 = animate(makeTrack3([
  { t: 8.4, x: 640, y: 392, s: 0.9, dir: 1, legs: [[1.7, -2.4], [1.9, -2.5]], arms: [[1.0, 1.9], [1.2, 1.8]], lean: 0.55, rot: 0.2, hyper: 1, aura: 0.3, expr: 'closed' },
  { t: 8.95, y: 386, rot: 0.1, lean: 0.45, aura: 0.6 },
  { t: 9.25, legs: [[-0.55, -0.15], [0.6, -0.35]], arms: [[-1.0, 0.35], [1.2, 0.4]], lean: -0.3, rot: -0.08, aura: 1.4, sq: 0.12, e: E.out3 },
  { t: 9.5, legs: [[-0.35, -0.45], [0.4, -0.8]], arms: [[-0.5, 0.6], [0.55, 0.9]], lean: -0.05, rot: 0.03, aura: 1.1, sq: 0 },
  { t: 9.75, headTilt: 0.08, expr: 'focus' },
  { t: 10.4, arms: [[-0.45, 0.65], [0.9, 1.9]], lean: 0.05 },
  { t: 10.95, y: 372, legs: [[1.3, -2.1], [1.5, -2.2]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: -0.25, rot: -0.35, aura: 1.4, e: E.out },
  { t: 11.12, x: 650, y: 470, legs: [[-0.2, -0.15], [-0.05, -0.25]], arms: [[2.75, 0.2], [2.95, 0.1]], lean: 0.05, rot: Math.PI, sq: 0.25, e: E.in },
  { t: 11.4, x: 680, y: 1300, e: E.in },
]), { seed: 3 });

const CAM1 = makeTrack([
  { t: 0, x: 630, y: 372, z: 1.25, r: -0.03 },
  { t: 2.7, x: 650, y: 366, z: 1.42, r: -0.01 },
  { t: 4.7, x: 640, y: 362, z: 1.5, r: 0.01 },
  { t: 6.4, x: 640, y: 372, z: 1.3, r: 0.02, e: E.inOut },
  { t: 8.4, x: 640, y: 380, z: 1.45, r: -0.16, e: E.in },
  { t: 8.401, x: 640, y: 380, z: 1.3, r: 0 },
  { t: 9.25, x: 640, y: 372, z: 1.16, r: 0, e: E.out3 },
  { t: 11.0, x: 640, y: 364, z: 1.22, r: 0.01 },
  { t: 11.4, x: 650, y: 420, z: 1.1, r: 0, e: E.in },
]);

const L1 = [
  [0.5, 2.6, 'sonic', 'Two of us lost last time. So this time...'],
  [2.8, 4.6, 'shadow', 'That is NOT how fighting works.'],
  [4.8, 6.2, 'sonic', 'It is now! READY?!', { shout: true }],
  [9.9, 11.1, 'shadic', '...Hyper Shadic.'],
  [13.6, 15.0, 'saitama', '...Seriously?'],
];

// Fusion: the two spin as balls around the midpoint, closing in as they speed up.
function fusionAt(t) {
  const u = prog(t, 6.4, 8.4);
  const th = 2 * (5 * u + (29 * u * u * u) / 3);
  const r = 92 * (1 - E.in(u));
  return { u, th, r };
}

const SKYWRITE = (u) => [lerp(230, 1190, u), 200 + Math.sin(u * TAU * 3.5) * 52];
const ROOF_X = 860;

function rainbowFill(ctx, w) {
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  ['#ff4d6d', '#ffb02e', '#ffe14d', '#57ff95', '#4fa3ff', '#b06bff'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  return g;
}

scene({
  id: 'fusion',
  name: 'Fusion',
  dur: 19.2,
  poster: 10.6,
  lines: L1,
  music: [[0, 'space'], [6.4, 'none'], [11.4, 'hyper']],
  cues: [
    [5.8, 'clink'], [5.82, 'sparkle'], [6.4, 'fuse'], [6.6, 'whirl'], [7.6, 'whirl'], [8.4, 'bigboom'], [8.42, 'chaos'],
    [9.25, 'charge'], [9.75, 'twinkle'], [11.08, 'blast'], [11.7, 'whoosh'], [12.3, 'punch'], [13.1, 'zip'], [14.5, 'thud'],
    [15.0, 'skid'], [15.35, 'blast'], [15.36, 'crack'], [15.9, 'wind'], [16.0, 'punch'], [16.4, 'hit'], [16.7, 'punch'],
  ],
  draw(ctx, lt) {
    if (lt < 11.4) fusionShot(ctx, lt);
    else if (lt < 15.6) roofShot(ctx, lt);
    else launchShot(ctx, lt);
  },
});

function fusionShot(ctx, lt) {
  const c = CAM1(lt);
  const shakeAmt = lt > 7 && lt < 8.4 ? 6 * prog(lt, 7, 8.4) : lt > 8.4 && lt < 9.4 ? 16 * (1 - prog(lt, 8.4, 9.4)) : lt > 11.08 ? 10 : 0;
  const [qx, qy] = shakeXY(lt, shakeAmt);
  const c2 = { ...c, x: c.x - qx, y: c.y - qy };
  starfield(ctx, c2, lt);
  layer(ctx, c2, 0.05, (g) => {
    const gl = g.createRadialGradient(470, -250, 4, 470, -250, 200);
    gl.addColorStop(0, 'rgba(255,252,230,1)');
    gl.addColorStop(0.15, 'rgba(255,230,160,0.45)');
    gl.addColorStop(1, 'rgba(255,210,140,0)');
    g.fillStyle = gl;
    g.fillRect(270, -450, 400, 400);
  });
  layer(ctx, c2, 0.14, (g) => earth(g, -80, 1420, 1220, lt, { spin: 0.003, shade: 0.5 }));
  ctx.save();
  camApply(ctx, c2);
  const M = [640, 384];
  if (lt < 6.4) {
    const ang = lt * 0.7;
    emeraldRing(ctx, M[0], M[1] + 30, 250, 50, ang, 0.3, false);
    const s = SON1(lt);
    const d = SHD1(lt);
    drawHogC(drawSonic, ctx, s, lt, { talk: speaking(lt, L1, 'sonic'), blink: blinkAt(lt, 3, 3) });
    drawHogC(drawShadow, ctx, d, lt, { talk: speaking(lt, L1, 'shadow'), blink: blinkAt(lt, 4, 6) });
    emeraldRing(ctx, M[0], M[1] + 30, 250, 50, ang, 0.3, true);
    if (lt > 5.8 && lt < 6.3) {
      hitFx(ctx, BUMP1[0], BUMP1[1], lt - 5.8, 0.5, '#ffffff', 4);
      for (let i = 0; i < 4; i++) star4(ctx, BUMP1[0] + Math.cos(i * 1.6) * 30, BUMP1[1] - 20 + Math.sin(i * 1.6) * 20, 10 * env(lt, 5.8, 6.3, 0.1), lt * 5 + i, '#ffffff');
    }
  } else if (lt < 8.4) {
    const { u, th, r } = fusionAt(lt);
    const ang = lt * 0.7 + u * u * 14;
    const er = 230 * (1 - E.in(u));
    const glow = ctx.createRadialGradient(M[0], M[1], 4, M[0], M[1], 60 + 260 * u);
    glow.addColorStop(0, `rgba(255,255,255,${0.3 + 0.7 * u})`);
    glow.addColorStop(0.4, `hsla(${lt * 400},100%,75%,${0.4 * u})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(M[0] - 400, M[1] - 400, 800, 800);
    for (let i = 0; i < 14; i++) {
      const a = ang + (i / 14) * TAU;
      const x = M[0] + Math.cos(a) * er;
      const y = M[1] + Math.sin(a) * er * 0.28;
      const xb = M[0] + Math.cos(a - 0.5) * er * 1.08;
      const yb = M[1] + Math.sin(a - 0.5) * er * 0.3;
      streak(ctx, xb, yb, x, y, 1, GEM_COLS[Math.floor(i / 2)], 6, 1);
    }
    emeraldRing(ctx, M[0], M[1], er, er * 0.28, ang, 1, false);
    const sx = M[0] + Math.cos(th) * r;
    const sy = M[1] + Math.sin(th) * r * 0.45;
    const hx = M[0] - Math.cos(th) * r;
    const hy = M[1] - Math.sin(th) * r * 0.45;
    const front = Math.sin(th) > 0;
    const drawS = () => drawSonic(ctx, sx, sy + 42 * SS, SS, 1, { ball: 1, spin: th * 3, t: lt, aura: u });
    const drawD = () => drawShadow(ctx, hx, hy + 42 * SS, SS, 1, { ball: 1, spin: th * 3, t: lt, aura: u });
    if (front) {
      drawD();
      drawS();
    } else {
      drawS();
      drawD();
    }
    emeraldRing(ctx, M[0], M[1], er, er * 0.28, ang, 1, true);
    rays(ctx, M[0], M[1], lt * 4, { a: 0.25 * u, c1: '#ffffff', c2: `hsl(${lt * 300},100%,70%)` });
  } else {
    const h = HY1(lt);
    if (lt > 11.08) rainbowRibbon(ctx, pastPts(HY1, lt, 10, 0.02), 26, lt);
    drawH(ctx, h, lt, { blink: lt > 9.75 ? blinkAt(lt, 3.3, 8) : 0, talk: speaking(lt, L1, 'shadic') });
    if (lt < 9.6) {
      const k = 1 - prog(lt, 8.4, 9.6);
      ctx.save();
      ctx.globalAlpha = k;
      ctx.globalCompositeOperation = 'lighter';
      const gl = ctx.createRadialGradient(640, 300, 10, 640, 300, 220);
      gl.addColorStop(0, 'rgba(255,255,255,1)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(400, 60, 480, 480);
      ctx.restore();
    }
    shock(ctx, 640, 300, prog(lt, 8.4, 9.2), 520, { w: 22, col: '#ffffff' });
    shock(ctx, 640, 300, prog(lt, 8.55, 9.5), 700, { w: 14, col: `hsl(${lt * 300},100%,70%)` });
    shock(ctx, 640, 320, prog(lt, 9.25, 9.8), 300, { w: 12, col: '#bff7ff' });
  }
  ctx.restore();
  if (lt > 8.4 && lt < 9.0) flash(ctx, 1 - prog(lt, 8.4, 9.0));
  const h = HY1(Math.max(lt, 8.4));
  talk(ctx, lt, L1, {
    sonic: headAnchor(c2, ptH(SON1(lt), 'head')),
    shadow: headAnchor(c2, ptH(SHD1(lt), 'head')),
    shadic: headAnchor(c2, ptH(h, 'head'), 80),
  });
}

function roofShot(ctx, lt) {
  const jump = 15.35;
  const amp = lt > jump ? 16 * (1 - prog(lt, jump, jump + 0.6)) : lt > 11.6 && lt < 13.2 ? 2 : 0;
  const [qx, qy] = shakeXY(lt, amp);
  ctx.save();
  ctx.translate(qx, qy);
  rooftopBG(ctx, lt);
  // the sky-writing: a rainbow streak spells the round
  const u = prog(lt, 11.7, 13.1);
  const titleA = 1 - prog(lt, 13.45, 13.75);
  if (lt > 11.7) {
    const [hx] = SKYWRITE(u);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, hx, H);
    ctx.clip();
    bigText(ctx, 'ROUND 3', 660, 200, 150, { fill: rainbowFill(ctx, 820), stroke: '#ffffff', sw: 10, shadow: 'rgba(120,60,255,0.6)', rot: -0.03, alpha: titleA });
    ctx.restore();
    const pts = [];
    for (let k = 0; k < 16; k++) {
      const tt = lt - k * 0.025;
      if (tt < 11.7) break;
      pts.push(tt < 13.1 ? SKYWRITE(prog(tt, 11.7, 13.1)) : [lerp(1190, 1500, prog(tt, 13.1, 13.4)), lerp(200, -120, prog(tt, 13.1, 13.4))]);
    }
    rainbowRibbon(ctx, pts, 22, lt);
  }
  const sl = slam(lt - 12.3);
  if (sl) bigText(ctx, 'SONIC vs ONE PUNCH MAN', 640, 76, 50, { fill: '#ffffff', stroke: INK, sw: 10, scale: sl.s, alpha: sl.a * titleA, maxW: 980, shadow: '#2f6bff', rot: -0.02 });
  const bagDown = lt > 14.8;
  const zx = ROOF_X;
  const zy = 548;
  if (lt < jump) {
    const crouch = prog(lt, 14.95, 15.25);
    const down = env(lt, 14.35, 14.95, 0.2);
    let pose;
    if (crouch > 0) pose = { ...POSE.saiCrouch(E.out3(crouch)) };
    else pose = { legs: ZP.stand.legs, arms: [[-0.05, 0.12], [lerp(0.2, 0.9, down), lerp(0.25, 0.5, down)]], lean: 0.35 * down };
    const look = lt > 11.9 ? -0.3 * prog(lt, 11.9, 12.3) * (1 - prog(lt, 14.3, 14.6)) : 0;
    drawSaitama(ctx, zx, zy, 1, -1, {
      t: lt,
      ...pose,
      tilt: look,
      wind: 0.25,
      expr: 'ok',
      blink: blinkAt(lt, 3.4, 2),
      talk: speaking(lt, L1, 'saitama'),
      carry: bagDown ? null : (g, hx, hy) => drawBag(g, hx + 4, hy + 34, 0.8, Math.sin(lt * 2) * 0.05),
    });
  } else {
    const k = prog(lt, jump, jump + 0.12);
    if (k < 1) streak(ctx, zx, zy - 120, zx, -200, k * 1.4, '#ffe27a', 30, 0.8);
    cracks(ctx, zx, zy + 2, prog(lt, jump, jump + 0.15), 7, 1.4);
    puffs(ctx, zx, zy, prog(lt, jump, jump + 1.6), { n: 14, spread: 220, seed: 21, size: 30, color: '#6f6787', shade: '#4d4766' });
    shock(ctx, zx, zy, prog(lt, jump, jump + 0.5), 300, { w: 14, flat: 0.25 });
  }
  if (bagDown) drawBag(ctx, zx - 50, zy - 2, 0.8, 0);
  ctx.restore();
  talk(ctx, lt, L1, { saitama: [zx - 5, zy - 250] });
}

function launchShot(ctx, lt) {
  const k = prog(lt, 15.6, 18.6);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mix('#0a1440', '#020208', k));
  g.addColorStop(1, mix('#28407a', '#06061a', k));
  ctx.fillStyle = g;
  ctx.fillRect(-50, -50, W + 100, H + 100);
  if (k > 0.2) {
    ctx.save();
    ctx.globalAlpha = prog(k, 0.2, 0.8);
    ctx.drawImage(BG.starTile, 0, 0);
    ctx.drawImage(BG.starTile, 1024, 0);
    ctx.restore();
  }
  const eu = prog(lt, 17.4, 19.2);
  if (eu > 0) earth(ctx, 640, lerp(2700, 1950, E.out(eu)), 1500, lt, { spin: 0.002, shade: 0.4 });
  starStreaks(ctx, lt, -Math.PI / 2, 1 - 0.5 * k, { speed: 3400, n: 60 });
  if (lt < 17.6) {
    for (let i = 0; i < 7; i++) {
      const y = ((lt - 15.6) * 2200 + hash(i * 3.3) * 1400) % 1500 - 300;
      const x = hash(i * 7.7) * W;
      ctx.save();
      ctx.globalAlpha = 0.55 * (1 - prog(lt, 16.8, 17.6));
      ell(ctx, x, y, 160 + hash(i) * 120, 40 + hash(i * 2) * 20, 0, '#c9d3ee', 0);
      ell(ctx, x + 40, y - 14, 90, 30, 0, '#eef2ff', 0);
      ctx.restore();
    }
  }
  const [jx, jy] = shakeXY(lt, 3);
  const sw = Math.sin(lt * 7);
  drawZ(ctx, { x: 640 + jx, y: lerp(560, 450, prog(lt, 15.6, 19.2)) + jy, s: 1.12, dir: 1, legs: [[-0.05, -0.03 - 0.03 * sw], [0.05, -0.08 + 0.03 * sw]], arms: [[-0.16, 0.08], [0.1, 0.05 + 0.04 * sw]], lean: 0.02 * sw, rot: 0.03 * Math.sin(lt * 3) }, lt, { wind: 1.5, capeRot: -1.45, expr: 'puff', blink: blinkAt(lt, 3, 4) });
  const fade = 1 - prog(lt, 18.2, 18.7);
  const s1 = slam(lt - 16.0);
  if (s1) {
    ctx.save();
    ctx.translate(640, 110);
    bigText(ctx, 'HYPER SHADIC', 0, 0, 92, { fill: rainbowFill(ctx, 760), stroke: INK, sw: 14, scale: s1.s, alpha: s1.a * fade, shadow: '#ffffff', rot: -0.03, maxW: 1100 });
    ctx.restore();
  }
  const s2 = slam(lt - 16.4);
  if (s2) bigText(ctx, 'vs', 640, 196, 50, { fill: '#ffffff', stroke: INK, sw: 10, scale: s2.s, alpha: s2.a * fade });
  const s3 = slam(lt - 16.7);
  if (s3) bigText(ctx, 'SERIOUS SAITAMA', 640, 280, 88, { fill: '#ffd21f', stroke: INK, sw: 14, scale: s3.s, alpha: s3.a * fade, shadow: '#e3262f', rot: 0.03, maxW: 1100 });
}
