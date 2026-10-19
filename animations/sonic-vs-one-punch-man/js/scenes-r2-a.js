'use strict';
/* Round 2, part one: the title, breakfast delivery, the ruins, the first hand-keyed fight, and
   Shadow's arrival. Fight scenes are authored in action time; holds freeze the action on impact
   while the shake, flashes and impact frames keep running in real time. */

const SCENES = [];
BUB.shadow = { edge: '#c81e28', fill: '#ffffff', ink: '#1a1016' };
BUB.duo = { edge: '#7b3fe0', fill: '#ffffff', ink: '#2a1050' };
function scene(d) {
  SCENES.push(
    Object.assign({ fadeIn: 0.6, fadeOut: 0.6, fadeInColor: '#000', fadeOutColor: '#000', cues: [], lines: [], music: [[0, 'none']] }, d)
  );
}

// A scene whose lines, cues, music and length are written in action time and converted to real time.
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

const G2 = RUIN_G;
const HS = 0.8;
const hogTop = (x, y, s = HS) => [x, y - 186 * s];
const saiTop2 = (x, y, s = 1, dir = 1) => [x + dir * 5 * s, y - 238 * s];
const P = (base, o = {}) => ({ ...base, ...o });
const emeraldIn = (ctx, hx, hy) => drawEmerald(ctx, hx, hy - 16, 20, '#3ddc84', 0.9);

function pebble(ctx, x, y, r, seed) {
  ell(ctx, x, y, r * (1 + hash(seed) * 0.4), r * (0.75 + hash(seed + 1) * 0.3), hash(seed + 2) * 3, '#8f8899', 2.5);
}

function drawHog(fn, ctx, st, t, extra = {}) {
  fn(ctx, st.x, st.y, st.s ?? HS, st.dir ?? 1, { ...st, t, ...extra });
}
function drawSai(ctx, st, t, extra = {}) {
  drawSaitama(ctx, st.x, st.y, st.s ?? 1, st.dir ?? 1, { ...st, t, ...extra });
}

// Screen anchors for speech, through the camera.
function anchorsFor(cam, list) {
  const out = {};
  for (const [who, x, y] of list) out[who] = camPoint(cam, x, y);
  return out;
}

/* ---------- 1. Title ---------- */

scene({
  id: 'title2',
  name: 'Title',
  dur: 12,
  fadeIn: 0.01,
  poster: 10.4,
  music: [[0, 'none'], [4.2, 'rival']],
  cues: [[0.8, 'whoosh'], [1.8, 'whoosh'], [3.6, 'boom'], [3.7, 'hit'], [4.2, 'hit'], [6.3, 'spear'], [6.9, 'punch'], [6.95, 'boom'], [8.6, 'chaos']],
  draw(ctx, lt) {
    const amp = (lt > 3.6 ? 14 * (1 - prog(lt, 3.6, 5)) : 0) + (lt > 6.9 ? 16 * (1 - prog(lt, 6.9, 8)) : 0);
    const [qx, qy] = shakeXY(lt, amp);
    ctx.save();
    ctx.translate(qx, qy);
    sky(ctx, 'night');
    stars(ctx, lt, prog(lt, 0, 1.5));
    if (lt > 3.6) rays(ctx, 640, 380, lt, { a: 0.28 * prog(lt, 3.6, 4.2) * (1 - 0.6 * prog(lt, 6.9, 7.4)), c1: '#1d4ed8', c2: '#f5b700' });
    if (lt > 6.9) rays(ctx, 640, 380, -lt, { a: 0.35 * prog(lt, 6.9, 7.4), c1: '#7a0d16', c2: '#14070c' });
    if (lt < 4) {
      streak(ctx, -150, 700, 640, 380, E.in(prog(lt, 0.8, 3.6)), '#4f8cff', 18);
      streak(ctx, 1430, 40, 640, 380, E.in(prog(lt, 1.8, 3.6)), '#ffd84a', 18);
    }
    if (lt > 3.6) flash(ctx, 0.6 * (1 - prog(lt, 3.6, 4.1)));
    burst(ctx, 640, 380, prog(lt, 3.6, 4.4), 240, { c1: '#ffffff', c2: '#ffe27a' });
    if (lt > 6.3 && lt < 7.6) streak(ctx, -100, -60, 1380, 820, (lt - 6.3) / 0.5, '#ff2a3a', 22, 0.5);
    if (lt > 8.4) {
      const up = E.out3(prog(lt, 8.4, 9.4));
      ctx.save();
      ctx.globalAlpha = up;
      silhouette(ctx, (g) => drawShadow(g, 640, 860 - up * 60, 2.0, 1, { t: lt, ...HP.cross2 }), '#0c0710');
      ctx.restore();
      const [ex, ey] = hogPoint(640, 860 - up * 60, 2.0, 1, HP.cross2, 'head');
      const glow = 0.5 + 0.5 * Math.sin(lt * 6);
      for (const [dx, dy] of [[24, -14], [52, -12]]) {
        circle(ctx, ex + dx, ey + dy, 10 + glow * 4, `rgba(255,40,50,${0.35 * up})`);
        ell(ctx, ex + dx, ey + dy, 7, 4, 0.2, `rgba(255,70,70,${up})`, 0);
      }
    }
    const sx = kf(lt, [[3.7, -300], [4.3, 175, E.out3]]);
    const zx = kf(lt, [[4.2, 1560], [4.8, 1105, E.out3]]);
    if (lt > 3.7) drawSonic(ctx, sx, 770, 1.7, 1, { t: lt, ...POSE.sonicHip(), expr: 'grin', blink: blinkAt(lt, 3, 4) });
    if (lt > 4.2) drawSaitama(ctx, zx, 800, 1.5, -1, { t: lt, wind: 0.5, ...POSE.saiCross(), blink: blinkAt(lt, 3.5) });
    const a = slam(lt - 3.7);
    if (a) bigText(ctx, 'SONIC vs ONE PUNCH MAN', 640, 150, 62, { fill: '#ffffff', stroke: INK, sw: 12, scale: a.s, alpha: a.a, maxW: 980, shadow: '#2f6bff', rot: -0.02 });
    const b = slam(lt - 6.9);
    if (b) bigText(ctx, 'ROUND 2', 640, 330, 170, { fill: '#ff2a3a', stroke: '#14070c', sw: 20, scale: b.s, alpha: b.a, shadow: '#ffd21f', rot: 0.04 });
    const st = prog(lt, 9.4, 10.2);
    if (st > 0) bigText(ctx, '...with an unexpected visitor', 640, 470, 30, { fill: '#ffd0d0', alpha: st, face: FONT_T, stroke: INK, sw: 6 });
    ctx.restore();
  },
});

/* ---------- 2. Breakfast Delivery ---------- */

const L2b = [
  [0.4, 3.4, 'narrator', 'The next morning, outside Saitama\'s apartment.'],
  [7.0, 9.8, 'sonic', "Morning! A deal's a deal!"],
  [10.2, 13.2, 'saitama', '...You actually bought groceries.'],
  [13.6, 16.4, 'sonic', 'Cabbage, eggs, leeks, the works!'],
  [16.8, 19.4, 'sonic', 'Now. ROUND TWO!', { shout: true }],
  [19.8, 22.2, 'saitama', 'After breakfast.'],
  [22.6, 24.8, 'sonic', 'Ugh. Fine.'],
];

const SAI_WALK2 = makeTrack([
  { t: 0, x: 900, y: CITY_G, dir: -1, ...ZP.stand, ground: 1, wind: 0.15 },
  { t: 2.8, x: 900, ...ZP.stand },
  { t: 3.1, x: 878, ...POSE.saiWalk(0.6) },
  { t: 3.45, x: 846, ...POSE.saiWalk(1.9) },
  { t: 3.8, x: 812, ...POSE.saiWalk(3.4) },
  { t: 4.15, x: 778, ...POSE.saiWalk(4.9) },
  { t: 4.5, x: 744, ...POSE.saiWalk(0.4) },
  { t: 4.85, x: 712, ...POSE.saiWalk(1.8) },
  { t: 5.2, x: 682, ...POSE.saiWalk(3.3) },
  { t: 5.55, x: 660, ...POSE.saiWalk(4.6) },
  { t: 5.8, x: 652, ...ZP.stand },
  { t: 6.3, x: 652, ...ZP.stand, arms: [[-0.1, 0.2], [0.3, 0.3]], lean: -0.06 },
  { t: 6.6, ...ZP.stand },
  { t: 10.2, ...ZP.stand },
  { t: 10.5, arms: [[0.4, 1.6], [0.5, 1.7]], hands: ['open', 'open'], lean: 0.05 },
  { t: 13.0, arms: [[0.4, 1.7], [0.55, 1.75]] },
  { t: 13.3, ...ZP.stand, hands: ['fist', 'fist'] },
]);

const SON_ARRIVE2 = makeTrack([
  { t: 0, x: 1500, y: CITY_G, dir: -1, ...HP.stand, ground: 1, expr: 'grin', fig8: false },
  { t: 5.95, x: 1500, fig8: true, ground: 0, lean: 0.4, arms: [[2.8, 0.2], [2.9, 0.15]] },
  { t: 6.35, x: 1000, fig8: false, ground: 1, ...HP.skid, arms: [[2.8, 0.2], [2.9, 0.15]], e: E.out },
  { t: 6.7, x: 930, legs: [[0.3, -0.2], [0.55, -0.2]], lean: -0.15, arms: [[2.75, 0.25], [2.95, 0.12]], e: E.out3 },
  { t: 7.0, x: 930, legs: HP.stand.legs, lean: 0.02, arms: [[2.85, 0.18], [2.9, 0.14]] },
  { t: 13.6, arms: [[2.85, 0.18], [2.9, 0.14]] },
  { t: 14.4, arms: [[2.7, 0.3], [2.95, 0.1]], lean: -0.04 },
  { t: 16.2, arms: [[2.85, 0.18], [2.9, 0.14]], lean: 0 },
  { t: 16.6, arms: [[-0.3, 0.4], [1.5, 0.05]], hands: ['fist', 'point'], lean: 0.12 },
  { t: 19.4, arms: [[-0.25, 0.45], [1.6, 0.1]], lean: 0.1 },
  { t: 22.6, ...HP.stand, arms: [[-0.05, 0.1], [0.05, 0.1]], hands: ['fist', 'fist'], lean: 0.25, headTilt: 0.15, expr: 'sheepish' },
  { t: 24.8, lean: 0.28, headTilt: 0.2 },
]);

function bagStack(ctx, x, y, t, n = 5) {
  for (let i = 0; i < n; i++) {
    const w = Math.sin(t * 3 + i * 0.7) * 0.06 * i;
    drawBag(ctx, x + Math.sin(t * 2.4 + i) * 2 * i, y - i * 46, 1, w);
  }
}

scene({
  id: 'breakfast',
  name: 'Breakfast Delivery',
  dur: 32,
  lines: L2b,
  music: [[0, 'calm'], [6, 'speed'], [19.6, 'calm'], [25, 'none']],
  cues: [[5.95, 'whoosh'], [6.3, 'skid'], [10.4, 'sparkle'], [16.6, 'thud'], [25.6, 'pop']],
  draw(ctx, lt) {
    const G = CITY_G;
    apartmentExterior(ctx, 3000);
    const z = SAI_WALK2(lt);
    const s = SON_ARRIVE2(lt);
    const happy = lt > 10.2 && lt < 13.4;
    drawSai(ctx, z, lt, {
      expr: happy ? 'happy' : lt > 4 && lt < 5 ? 'yawn' : 'ok',
      blink: blinkAt(lt, 3.3),
      talk: speaking(lt, L2b, 'saitama'),
    });
    if (happy) for (let i = 0; i < 4; i++) star4(ctx, z.x - 30 + i * 22, G - 250 + Math.sin(lt * 5 + i) * 10, 8 + 4 * Math.sin(lt * 9 + i), lt, '#fff3a0');
    if (lt > 5.95) {
      if (lt < 6.4) streak(ctx, 1450, G - 70, s.x, G - 70, 1, '#4f8cff', 20, 1);
      if (lt < 7) puffs(ctx, s.x + 30, G, prog(lt, 6.3, 7.2), { n: 6, spread: 90, seed: 3, size: 22, dx: 60 });
      drawHog(drawSonic, ctx, s, lt, { talk: speaking(lt, L2b, 'sonic'), blink: blinkAt(lt, 2.9, 5) });
      const [hx, hy] = hogPoint(s.x, s.y, HS, -1, s, 'hand');
      if (lt < 16.6) bagStack(ctx, hx - 6, hy - 64, lt);
      else bagStack(ctx, s.x + 70, G - 60, 0, 3);
    }
    if (lt > 25.2) {
      const k = Math.min(prog(lt, 25.2, 25.7), 1 - prog(lt, 31, 31.8));
      ctx.save();
      ctx.globalAlpha = k;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      const sl = slam(lt - 25.6);
      if (sl) bigText(ctx, 'ONE BREAKFAST LATER...', 640, 360, 70, { fill: INK, alpha: sl.a * k, scale: sl.s, maxW: 1100 });
    }
    talk(ctx, lt, L2b, { saitama: saiTop2(z.x, z.y, 1, -1), sonic: hogTop(s.x, s.y - 150) });
  },
});

/* ---------- 3. The Ruins ---------- */

const L3b = [
  [0.5, 4.4, 'narrator', 'The ruins of City Z. Nobody comes here anymore.'],
  [5.4, 8.2, 'saitama', "Don't hit the groceries this time."],
  [8.6, 11.2, 'sonic', "Promise! I've been training!"],
  [18.2, 19.8, 'sonic', 'Ready?'],
  [20.3, 21.8, 'saitama', 'Sure.'],
];

const CAM3 = makeTrack([
  { t: 0, x: 1250, y: 380, z: 1.0, r: 0 },
  { t: 4.4, x: 760, y: 380, z: 1.0, r: 0 },
  { t: 8.4, x: 640, y: 390, z: 1.05, r: 0 },
  { t: 11.6, x: 640, y: 390, z: 1.05, r: 0 },
  { t: 12.2, x: 360, y: 470, z: 1.65, r: 0.02, e: E.out3 },
  { t: 13.6, x: 380, y: 470, z: 1.7, r: 0.02 },
  { t: 13.9, x: 700, y: 420, z: 1.6, r: -0.02, e: E.out3 },
  { t: 15.3, x: 690, y: 420, z: 1.65, r: -0.02 },
  { t: 15.7, x: 1040, y: 240, z: 1.9, r: 0, e: E.out3 },
  { t: 17.2, x: 1040, y: 240, z: 1.9, r: 0 },
  { t: 17.6, x: 540, y: 410, z: 1.1, r: 0, e: E.out3 },
  { t: 24, x: 520, y: 420, z: 1.12, r: 0 },
]);

const SAI3 = makeTrack([
  { t: 0, x: 1340, y: G2, dir: -1, ...ZP.stand, ground: 1, wind: 0.3, arms: [[0.4, 0.6], [0.6, 0.7]] },
  { t: 0.8, ...ZP.stand },
  { t: 1.2, x: 1306, ...POSE.saiWalk(0.6) },
  { t: 1.6, x: 1262, ...POSE.saiWalk(2.0) },
  { t: 2.0, x: 1216, ...POSE.saiWalk(3.5) },
  { t: 2.4, x: 1170, ...POSE.saiWalk(5.0) },
  { t: 2.8, x: 1124, ...POSE.saiWalk(0.3) },
  { t: 3.2, x: 1078, ...POSE.saiWalk(1.7) },
  { t: 3.6, x: 1032, ...POSE.saiWalk(3.2) },
  { t: 4.0, x: 986, ...POSE.saiWalk(4.7) },
  { t: 4.4, x: 940, ...POSE.saiWalk(0.2) },
  { t: 4.8, x: 894, ...POSE.saiWalk(1.6) },
  { t: 5.2, x: 850, ...POSE.saiWalk(3.0) },
  { t: 5.6, x: 806, ...POSE.saiWalk(4.4) },
  { t: 6.0, x: 762, ...POSE.saiWalk(5.9) },
  { t: 6.4, x: 722, ...POSE.saiWalk(1.2) },
  { t: 6.75, x: 700, ...ZP.stand },
  { t: 20.2, ...ZP.stand },
  { t: 20.6, arms: [[-0.1, 0.15], [0.2, 0.2]], lean: 0.03 },
]);

const SON3 = makeTrack([
  { t: 0, x: 340, y: G2, dir: 1, ...HP.stand, ground: 1, expr: 'smirk' },
  { t: 8.6, ...HP.stand },
  { t: 9.0, ...HP.raise, arms: [[2.7, 0.6], [2.9, 0.3]], hands: ['open', 'open'], lean: -0.1, expr: 'grin' },
  { t: 9.5, arms: [[2.9, 0.4], [2.6, 0.7]], lean: 0.1 },
  { t: 10.0, ...HP.stand, legs: [[-0.6, -0.1], [0.7, -1.0]], arms: [[0.5, 0.4], [1.1, 0.5]], lean: 0.35, hands: ['fist', 'fist'] },
  { t: 10.6, legs: [[-0.7, -0.1], [0.75, -1.15]], lean: 0.42 },
  { t: 11.2, ...HP.stand, lean: 0 },
  { t: 11.6, ...HP.stance, expr: 'determined' },
  { t: 18.0, ...HP.stance },
  { t: 18.4, ...HP.stance, lean: 0.22, arms: [[0.6, 1.8], [0.95, 1.9]] },
  { t: 22.4, ...HP.stance },
  { t: 23.0, ...HP.crouch, e: E.out3 },
  { t: 24, ...HP.crouch, lean: 0.55 },
]);

scene({
  id: 'ruins',
  name: 'The Ruins',
  dur: 24,
  lines: L3b,
  fadeOut: 0.15,
  music: [[0, 'tension']],
  cues: [[2.5, 'wind'], [9.0, 'pop'], [16.0, 'twinkle'], [23, 'skid']],
  draw(ctx, lt) {
    const c = CAM3(lt);
    ctx.save();
    camApply(ctx, c);
    ruinsBG(ctx, { px: c.x - 640, t: lt });
    ruinTower(ctx);
    ruinWall(ctx);
    groceriesSlab(ctx, true);
    if (lt > 15.9 && lt < 17.3) {
      const k = env(lt, 15.9, 17.3, 0.2);
      circle(ctx, 1046, 112, 3.5, `rgba(255,40,50,${k})`);
      circle(ctx, 1058, 113, 3.5, `rgba(255,40,50,${k})`);
      star4(ctx, 1060, 108, 18 * k, lt * 3, '#ffffff');
    }
    const z = SAI3(lt);
    const s = SON3(lt);
    drawSai(ctx, z, lt, { blink: blinkAt(lt, 3.4), talk: speaking(lt, L3b, 'saitama') });
    drawHog(drawSonic, ctx, s, lt, { talk: speaking(lt, L3b, 'sonic'), blink: blinkAt(lt, 3.1, 9) });
    for (let i = 0; i < 6; i++) {
      const y = 260 + hash(i) * 330;
      const x = ((lt * 420 + hash(i + 4) * 2400) % 2600) - 700;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 70, y - 8, x + 150, y);
      ctx.stroke();
    }
    ctx.restore();
    talk(ctx, lt, L3b, anchorsFor(c, [['saitama', ...saiTop2(z.x, z.y, 1, -1)], ['sonic', ...hogTop(s.x, s.y)]]));
  },
});

/* ---------- 4. Round Two (Sonic vs Saitama, hand-keyed) ---------- */

const ZX4 = 700;
const ZHEAD4 = saiPoint(ZX4, G2, 1, -1, ZP.stand, 'head');
const BR = 36 * HS; // Sonic's ball radius on screen
const BALL_UP = 42 * HS; // feet-to-ball-centre offset

function homingContact(from, to, gap) {
  const dx = from[0] - to[0];
  const dy = from[1] - to[1];
  const d = Math.hypot(dx, dy) || 1;
  return [to[0] + (dx / d) * gap, to[1] + (dy / d) * gap];
}
const HC1 = homingContact([905, 196 - BALL_UP], ZHEAD4, 44);
const HC2 = homingContact([790, 160 - BALL_UP], ZHEAD4, 44);
const KICK4 = P(HP.kickLow, { hipLift: -24, legs: [[1.0, -1.9], [1.45, -0.05]], lean: 0.1 });
const KICK4X = hogPlace(HS, -1, P(KICK4, { ground: 1 }), 'foot', ZX4 + 14, 0)[0];
const AXE4 = P(HP.axeDown, { ground: 0, legs: [[-0.45, -0.35], [1.25, 0.02]] });
const AXE4P = hogPlace(HS, -1, AXE4, 'foot', ZHEAD4[0] + 6, ZHEAD4[1] - 24);
const SON4_HEAD = hogPoint(540, G2, HS, 1, HP.stance, 'head');
const BOOP_T = [SON4_HEAD[0] + 20, SON4_HEAD[1] - 12];
const BOOP_PRE = saiReachIK(640, G2, 1, -1, ZP.stand, BOOP_T[0] + 16, BOOP_T[1], false, true);
const BOOP_HIT = saiReachIK(640, G2, 1, -1, ZP.stand, BOOP_T[0] - 2, BOOP_T[1], false, true);
const RUB4 = saiReachIK(ZX4, G2, 1, -1, ZP.stand, ZHEAD4[0] + 2, ZHEAD4[1] - 26);

const ST4 = makeTrack([
  { t: 0, x: 340, y: G2, dir: 1, ...HP.stance, ground: 1, rot: 0, ball: 0, fig8: false, spin: 0, expr: 'determined' },
  { t: 0.4, ...HP.stance, lean: 0.2, arms: [[0.6, 1.8], [0.95, 1.9]] },
  { t: 0.9, ...HP.crouch, lean: 0.45, e: E.out3 },
  { t: 1.25, ...HP.crouch, lean: 0.58, hipLift: -4 },
  { t: 1.3, fig8: true, ground: 0, lean: 0.46, arms: [[-1.5, 0.3], [-1.3, 0.4]], x: 352, hipLift: 0, expr: 'grin' },
  { t: 1.62, x: 600, e: E.in },
  { t: 1.63, fig8: false, ...HP.tuck, ground: 0, y: G2 - 30 },
  { t: 1.72, x: 618, y: 300, rot: 0.9, e: E.out },
  { t: 1.86, x: 700, y: 160, rot: Math.PI, arms: [[1.4, 1.5], [1.2, 1.6]], e: E.lin },
  { t: 2.0, x: 782, y: 300, rot: 5.0, e: E.lin },
  { t: 2.12, x: 800, y: G2, rot: TAU, ...HP.land, ground: 1, e: E.in },
  { t: 2.121, rot: 0 },
  { t: 2.2, dir: -1, ...HP.land, lean: 0.35, arms: [[-0.4, 0.5], [1.0, 0.6]] },
  { t: 2.34, ...HP.chamber, hipLift: -18, legs: [[0.9, -1.6], [1.4, -1.8]], lean: 0.05, x: KICK4X + 8 },
  { t: 2.45, ...KICK4, x: KICK4X, e: E.out3 },
  { t: 2.6, ...KICK4, legs: [[1.0, -1.9], [1.35, -0.1]], expr: 'shock' },
  { t: 2.75, ...HP.stand, legs: [[-0.05, -0.05], [0.9, -2.0]], arms: [[1.0, 0.9], [1.2, 0.8]], lean: 0.28, expr: 'wince', hipLift: 0 },
  { t: 2.85, y: G2 - 18, legs: [[0.05, -0.1], [0.95, -2.1]], lean: 0.2, e: E.out },
  { t: 2.95, y: G2, legs: [[-0.05, -0.05], [0.85, -1.95]], lean: 0.3, e: E.in },
  { t: 3.02, ...HP.crouch, lean: 0.3, expr: 'determined' },
  { t: 3.06, ...HP.tuck, ground: 0, y: G2 - 40, rot: 0 },
  { t: 3.2, x: 900, y: G2 - 170, rot: -3.1, e: E.out },
  { t: 3.35, x: 960, y: G2 - 60, rot: -5.4, e: E.lin },
  { t: 3.45, x: 980, y: G2, rot: -TAU, ...HP.land, ground: 1, e: E.in },
  { t: 3.451, rot: 0 },
  { t: 3.5, dir: 1, ...HP.stance, lean: 0.25 },
  { t: 3.55, fig8: true, ground: 0, lean: 0.45, arms: [[-1.5, 0.3], [-1.3, 0.4]], x: 990, expr: 'grin' },
  { t: 3.8, x: 1094, e: E.in },
  { t: 3.801, rot: -Math.PI / 2, x: 1118, y: G2 - 14 },
  { t: 4.45, y: 262, e: E.lin },
  { t: 4.46, fig8: false, ball: 1, rot: 0, x: 1104, y: 262, spin: 0 },
  { t: 4.7, x: 960, y: 200, spin: 9, e: E.out },
  { t: 4.95, x: 905, y: 196, spin: 16 },
  { t: 5.1, x: 900, y: 200, spin: 22 },
  { t: 5.3, x: HC1[0], y: HC1[1] + BALL_UP, spin: 30, e: E.in },
  { t: 5.6, x: 800, y: 150, spin: 40, e: E.out },
  { t: 5.75, x: 790, y: 160, spin: 46 },
  { t: 5.95, x: HC2[0], y: HC2[1] + BALL_UP, spin: 54, e: E.in },
  { t: 6.2, x: 760, y: 70, spin: 66, e: E.out },
  { t: 6.3, ball: 0, ...HP.axeUp, dir: -1, ground: 0, x: 744, y: 150, rot: 0, expr: 'angry' },
  { t: 6.45, legs: [[-0.2, -0.25], [3.15, -0.05]], arms: [[-1.1, 0.5], [-0.9, 0.6]], x: AXE4P[0] + 10, y: AXE4P[1] - 26, lean: -0.5 },
  { t: 6.6, ...AXE4, x: AXE4P[0], y: AXE4P[1], e: E.in3 },
  { t: 6.75, ...HP.recoil, ground: 0, x: 640, y: 250, rot: 1.2, expr: 'wince', e: E.out },
  { t: 6.95, ...HP.tuck, x: 560, y: 280, rot: 3.4, e: E.lin },
  { t: 7.15, x: 500, y: 500, rot: 5.6, e: E.lin },
  { t: 7.3, ...HP.land, ground: 1, x: 470, y: G2, rot: TAU, e: E.in },
  { t: 7.301, rot: 0 },
  { t: 7.36, dir: 1, ...HP.stand, legs: [[-0.05, -0.05], [0.9, -2.0]], arms: [[1.0, 0.9], [1.2, 0.8]], lean: 0.25 },
  { t: 7.6, legs: [[-0.08, -0.05], [0.8, -1.8]], lean: 0.22 },
  { t: 7.9, ...HP.stance, expr: 'angry' },
  { t: 9.2, ...HP.stance, lean: 0.24 },
  { t: 9.6, ...HP.crouch, lean: 0.5, e: E.out3 },
  { t: 9.62, fig8: true, ground: 0, x: 480, lean: 0.45, arms: [[-1.5, 0.3], [-1.3, 0.4]] },
  { t: 9.8, x: 612, e: E.in },
  { t: 9.85, fig8: false, ...HP.tuck, ground: 0, x: 622, y: G2 - 90, e: E.out },
  { t: 9.92, ...HP.stance, x: 628, y: G2 - 120, lean: 0.1, e: E.out },
  { t: 10.0, ...HP.jab, x: 614, y: G2 - 122, e: E.out3 },
  { t: 10.1, ...HP.stance, x: 616, y: G2 - 124 },
  { t: 10.16, ...HP.cross, x: 618, y: G2 - 124, e: E.out3 },
  { t: 10.26, ...HP.stance, x: 630, y: G2 - 125 },
  { t: 10.32, ...HP.chamber, x: 626, y: G2 - 118 },
  { t: 10.42, ...HP.kickHigh, x: 616, y: G2 - 104, e: E.out3 },
  { t: 10.56, ...HP.chamber, x: 620, y: G2 - 110 },
  { t: 10.6, ...HP.tuck, rot: 0, x: 622, y: G2 - 112 },
  { t: 10.75, ...HP.kickMid, rot: 3.6, x: 628, y: G2 - 118, e: E.lin },
  { t: 10.86, ...HP.kickMid, rot: TAU, x: 640, y: G2 - 120, e: E.out },
  { t: 10.861, rot: 0 },
  { t: 10.95, ...HP.crouch, ground: 0, x: 650, y: G2 - 116, lean: 0.4 },
  { t: 11.05, ...HP.upper, x: 664, y: G2 - 130, e: E.out3 },
  { t: 11.12, ...HP.stance, x: 664, y: G2 - 126 },
  { t: 11.18, ...HP.jab, x: 648, y: G2 - 126, e: E.out3 },
  { t: 11.24, ...HP.stance, x: 648, y: G2 - 124 },
  { t: 11.3, ...HP.jab, x: 652, y: G2 - 124, arms: [[0.6, 1.75], [1.6, 0.1]], e: E.out3 },
  { t: 11.36, ...HP.stance, x: 652, y: G2 - 122 },
  { t: 11.44, ...HP.cross, x: 656, y: G2 - 122, e: E.out3 },
  { t: 11.5, ...HP.stance, x: 660, y: G2 - 118 },
  { t: 11.55, ...HP.chamber, legs: [[-0.3, -0.2], [2.1, -2.4]], x: 684, y: G2 - 128, e: E.out3 },
  { t: 11.66, ...HP.tuck, x: 670, y: G2 - 60 },
  { t: 11.72, ...HP.crouch, ground: 1, x: 666, y: G2, e: E.in },
  { t: 11.82, ...HP.kickLow, ground: 1, hipLift: -26, legs: [[1.05, -2.0], [1.5, -0.05]], lean: 0.12, x: 668, e: E.out3 },
  { t: 11.96, ...HP.crouch, x: 660 },
  { t: 12.1, ...HP.stance, x: 540, lean: 0.05, expr: 'angry', e: E.out },
  { t: 12.2, ...HP.crouch, x: 540, e: E.out3 },
  { t: 12.26, ...HP.tuck, ground: 0, y: G2 - 70, rot: 0 },
  { t: 12.45, y: G2 - 110, rot: TAU, e: E.out },
  { t: 12.62, ...HP.kickMid, y: G2 - 104, rot: TAU * 2, e: E.lin },
  { t: 12.621, rot: 0 },
  { t: 12.7, ...HP.kickMid, y: G2 - 90, legs: [[-0.3, -0.1], [1.55, -0.05]] },
  { t: 12.82, ...HP.land, ground: 1, y: G2, e: E.in },
  { t: 13.0, ...HP.stance, lean: 0.25, expr: 'grin' },
  { t: 13.4, ...HP.stance },
  { t: 13.5, ...HP.stand, arms: [[-0.2, 0.2], [0.1, 0.2]], lean: -0.08, expr: 'shock' },
  { t: 14.4, lean: -0.1 },
  { t: 14.45, ...HP.stand, lean: -0.25, headTilt: -0.25, e: E.out3 },
  { t: 14.6, ...HP.heels, x: 500, headTilt: -0.15, expr: 'wince', e: E.out3 },
  { t: 15.1, ...HP.heels, x: 330, lean: -0.4, e: E.out },
  { t: 15.5, ...HP.heels, x: 262, lean: -0.3, e: E.out3 },
  { t: 15.65, ...HP.dizzy, x: 258, headTilt: 0.1, lean: 0.1, expr: 'dizzy' },
  { t: 15.8, ...HP.dizzy, lean: -0.12, headTilt: -0.1 },
  { t: 15.95, ...HP.stance, lean: 0.05, headTilt: 0, expr: 'grin' },
  { t: 18.4, ...HP.stance, lean: 0.25 },
  { t: 18.7, ...HP.crouch, e: E.out3 },
  { t: 18.9, ball: 1, spin: 0, x: 258, y: G2 },
  { t: 19.9, spin: 70, e: E.in },
  { t: 19.95, spin: 74, x: 262 },
  { t: 20.05, x: 360, spin: 80, e: E.in },
  { t: 20.25, x: 300, y: G2 - 50, spin: 84, e: E.out },
  { t: 20.4, x: 270, y: G2, spin: 88, e: E.in },
]);

const ZT4 = makeTrack([
  { t: 0, x: ZX4, y: G2, dir: -1, ...ZP.stand, ground: 1, wind: 0.3, expr: 'ok' },
  { t: 1.62, ...ZP.stand },
  { t: 1.76, tilt: -0.26, e: E.out },
  { t: 2.02, tilt: -0.08 },
  { t: 2.2, tilt: 0 },
  { t: 2.45, wind: 0.85, e: E.out3 },
  { t: 2.8, wind: 0.3 },
  { t: 5.3, tilt: 0.07, wind: 0.95, e: E.out3 },
  { t: 5.6, tilt: 0, wind: 0.3 },
  { t: 5.95, tilt: -0.07, wind: 0.95, e: E.out3 },
  { t: 6.3, tilt: 0, wind: 0.35 },
  { t: 6.6, wind: 1.3, e: E.out3 },
  { t: 7.0, wind: 0.5, arms: [[-0.05, 0.12], RUB4], hands: ['fist', 'open'] },
  { t: 7.3, arms: [[-0.05, 0.12], [RUB4[0] + 0.15, RUB4[1] - 0.1]] },
  { t: 7.6, arms: [[-0.05, 0.12], RUB4] },
  { t: 7.9, ...ZP.stand, hands: ['fist', 'fist'], wind: 0.3 },
  { t: 9.9, ...ZP.stand },
  { t: 9.98, ...ZP.dodgeBack, lean: -0.18, e: E.out3 },
  { t: 10.1, ...ZP.stand },
  { t: 10.15, tilt: 0.28, e: E.out3 },
  { t: 10.3, tilt: 0 },
  { t: 10.38, ...ZP.duck, e: E.out3 },
  { t: 10.58, ...ZP.stand },
  { t: 10.84, ...ZP.dodgeBack, x: 728, e: E.out3 },
  { t: 10.95, ...ZP.stand, x: 728 },
  { t: 11.03, legs: ZP.dodgeBack.legs, lean: -0.26, e: E.out3 },
  { t: 11.12, legs: ZP.stand.legs, lean: 0 },
  { t: 11.17, tilt: -0.22, e: E.out3 },
  { t: 11.28, tilt: 0.22, e: E.out3 },
  { t: 11.42, tilt: 0, lean: -0.2, e: E.out3 },
  { t: 11.5, lean: 0 },
  { t: 11.54, tilt: 0.3, e: E.out3 },
  { t: 11.68, tilt: 0 },
  { t: 11.78, ...ZP.hop, ground: 0, y: G2 - 46, e: E.out },
  { t: 11.98, ...ZP.stand, ground: 1, y: G2, e: E.in },
  { t: 13.25, expr: 'ah', lean: 0.05 },
  { t: 13.5, expr: 'ok', lean: 0 },
  { t: 13.6, x: 728, ...ZP.stand },
  { t: 13.75, x: 706, legs: [[0.3, -0.05], [-0.3, -0.4]], arms: [[0.2, 0.15], [-0.2, 0.15]] },
  { t: 13.9, x: 684, legs: [[-0.25, -0.05], [0.25, -0.05]], arms: [[-0.05, 0.12], [0.07, 0.12]] },
  { t: 14.05, x: 660, legs: [[-0.3, -0.4], [0.3, -0.05]], arms: [[-0.2, 0.15], [0.2, 0.15]] },
  { t: 14.2, x: 640, ...ZP.stand },
  { t: 14.32, arms: [[-0.05, 0.12], BOOP_PRE], hands: ['fist', 'finger'], e: E.out },
  { t: 14.45, arms: [[-0.05, 0.12], BOOP_HIT], e: E.out3 },
  { t: 14.75, arms: [[-0.05, 0.12], BOOP_PRE] },
  { t: 15.0, ...ZP.stand, hands: ['fist', 'fist'] },
  { t: 20.0, ...ZP.stand },
  { t: 20.2, tilt: -0.2, lean: -0.05 },
]);

const CAM4 = makeTrack([
  { t: 0, x: 520, y: 430, z: 1.1, r: 0 },
  { t: 0.9, x: 420, y: 460, z: 1.4, r: 0.03 },
  { t: 1.3, x: 470, y: 450, z: 1.3, r: 0.02 },
  { t: 1.62, x: 640, y: 430, z: 1.15, r: 0 },
  { t: 1.86, x: 700, y: 360, z: 1.05, r: -0.03 },
  { t: 2.15, x: 780, y: 450, z: 1.2, r: 0.02 },
  { t: 2.45, x: 760, y: 520, z: 1.6, r: 0.05, e: E.out3 },
  { t: 2.95, x: 800, y: 470, z: 1.3, r: 0 },
  { t: 3.45, x: 920, y: 440, z: 1.15, r: 0 },
  { t: 3.8, x: 1000, y: 420, z: 1.05, r: 0 },
  { t: 4.45, x: 980, y: 320, z: 1.08, r: -0.04 },
  { t: 4.95, x: 830, y: 300, z: 1.08, r: 0 },
  { t: 5.3, x: 750, y: 330, z: 1.32, r: 0.04, e: E.out3 },
  { t: 5.75, x: 770, y: 270, z: 1.15, r: 0 },
  { t: 5.95, x: 730, y: 310, z: 1.3, r: -0.04, e: E.out3 },
  { t: 6.4, x: 715, y: 255, z: 1.12, r: 0 },
  { t: 6.6, x: 705, y: 360, z: 1.55, r: 0.06, e: E.out3 },
  { t: 7.3, x: 590, y: 440, z: 1.22, r: 0 },
  { t: 9.6, x: 600, y: 440, z: 1.25, r: 0 },
  { t: 9.9, x: 670, y: 430, z: 1.55, r: -0.04 },
  { t: 10.6, x: 680, y: 420, z: 1.62, r: 0.05 },
  { t: 11.4, x: 690, y: 430, z: 1.62, r: -0.05 },
  { t: 11.95, x: 660, y: 450, z: 1.35, r: 0 },
  { t: 12.6, x: 640, y: 440, z: 1.25, r: 0 },
  { t: 13.5, x: 640, y: 440, z: 1.3, r: 0 },
  { t: 14.2, x: 600, y: 430, z: 1.45, r: 0 },
  { t: 14.45, x: 575, y: 420, z: 1.8, r: -0.06, e: E.out3 },
  { t: 14.9, x: 440, y: 440, z: 1.3, r: 0 },
  { t: 15.6, x: 360, y: 450, z: 1.32, r: 0.02 },
  { t: 18.6, x: 380, y: 460, z: 1.45, r: 0 },
  { t: 19.9, x: 420, y: 450, z: 1.3, r: 0 },
  { t: 20.4, x: 470, y: 420, z: 1.05, r: 0 },
]);

const L4b = [
  [2.62, 3.4, 'sonic', 'OW!', { shout: true }],
  [7.45, 9.25, 'saitama', 'Are you done warming up?'],
  [9.3, 10.5, 'sonic', 'Not even close!'],
  [13.5, 14.3, 'sonic', '...What.'],
  [15.95, 18.6, 'sonic', 'Okay... THAT was cool. My turn!'],
];

const HITS4 = [
  [2.45, ZX4 + 14, G2 - 44, 0.6],
  [5.3, (HC1[0] + ZHEAD4[0]) / 2, (HC1[1] + ZHEAD4[1]) / 2, 0.9],
  [5.95, (HC2[0] + ZHEAD4[0]) / 2, (HC2[1] + ZHEAD4[1]) / 2, 0.9],
  [6.6, ZHEAD4[0] + 4, ZHEAD4[1] - 26, 1.6],
];
const MISSES4 = [10.0, 10.16, 10.42, 10.86, 11.05, 11.18, 11.3, 11.44, 11.55, 11.82];

fightScene({
  id: 'fight1',
  name: 'Round Two',
  dur: 20.4,
  fadeOut: 0.2,
  fadeOutColor: '#fff6c0',
  lines: L4b,
  holds: [[2.45, 0.08, 8], [5.3, 0.12, 12], [5.95, 0.1, 12], [6.6, 0.22, 20, true], [14.45, 0.14, 12, true], [20.05, 0.16, 18]],
  music: [[0, 'fight'], [7.4, 'none'], [9.6, 'fight'], [13.5, 'none'], [16.0, 'fight']],
  cues: [
    [0.9, 'skid'], [1.3, 'whoosh'], [1.65, 'whoosh'], [2.45, 'clink'], [2.47, 'hit'], [3.06, 'whoosh'], [3.55, 'zip'], [3.82, 'skid'],
    [4.46, 'spring'], [4.9, 'tick'], [5.0, 'tick'], [5.1, 'zip'], [5.3, 'punch'], [5.7, 'tick'], [5.8, 'zip'], [5.95, 'punch'],
    [6.45, 'whoosh'], [6.6, 'boom'], [6.6, 'punch'], [7.3, 'thud'], [9.62, 'zip'],
    ...MISSES4.map((t) => [t - 0.02, 'miss']),
    [12.1, 'zip'], [12.3, 'whirl'], [13.3, 'pff'], [14.45, 'poke'], [14.47, 'hit'], [14.6, 'skid'], [18.9, 'rev'], [19.45, 'rev'], [19.95, 'whoosh'], [19.9, 'spear'], [20.05, 'boom'],
  ],
  render(ctx, a, lt, hs) {
    const c = CAM4(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs));
    const s = ST4(a);
    const z = ZT4(a);
    const actors = (g) => {
      drawSai(g, z, a, { blink: blinkAt(a, 3.4, 2), talk: speaking(lt, L4b, 'saitama') });
      const fast = (a > 1.3 && a < 2.12) || (a > 3.55 && a < 4.45) || (a > 9.6 && a < 9.85) || (a > 12.1 && a < 12.65);
      if (fast) ghosts(3, 0.03, a, (ta, al) => drawHog(drawSonic, g, ST4(ta), ta, { alpha: al, quillWob: 1 }), 0.3);
      drawHog(drawSonic, g, s, a, { talk: speaking(lt, L4b, 'sonic'), blink: blinkAt(a, 2.9, 7), quillWob: s.fig8 ? 1.5 : 0 });
    };
    ctx.save();
    camApply(ctx, c, qx, qy);
    ruinsBG(ctx, { px: c.x - 640, t: lt });
    ruinTower(ctx);
    ruinWall(ctx);
    groceriesSlab(ctx, true);
    if (a > 6.6) cracks(ctx, ZX4, G2 + 4, prog(a, 6.6, 6.8), 4, 1.2);
    puffs(ctx, 360, G2, prog(a, 0.9, 1.9), { n: 8, spread: 120, seed: 11, size: 24, dx: -60 });
    puffs(ctx, ZX4, G2, prog(lt, realT(6.6, hs), realT(6.6, hs) + 1.4), { n: 14, spread: 260, seed: 12, size: 30 });
    if (a > 3.8 && a < 4.45) puffs(ctx, 1118, s.y, (a * 6) % 1, { n: 3, spread: 30, seed: Math.floor(a * 6), size: 12, dx: 30, flat: 1.2 });
    // the heel trench as Sonic skids back from the poke
    if (a > 14.5) {
      ctx.strokeStyle = 'rgba(40,30,50,0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(520, G2 + 2);
      ctx.lineTo(Math.min(520, s.x + 10), G2 + 2);
      ctx.stroke();
      if (a < 15.6) puffs(ctx, s.x + 10, G2, (a * 5) % 1, { n: 4, spread: 50, seed: Math.floor(a * 5), size: 16, dx: 40 });
    }
    if (a > 18.9 && a < 20) puffs(ctx, s.x - 20, G2, (a * 4) % 1, { n: 4, spread: 60, seed: Math.floor(a * 4) + 70, size: 16, dx: -70 });
    actors(ctx);
    // smears on the fast blitz strikes
    if (a > 9.9 && a < 11.9) {
      const pts = [];
      const part = a > 10.3 && a < 10.9 ? 'foot' : 'hand';
      for (let k = 0; k < 6; k++) pts.push(hogPoint(...(() => { const st = ST4(a - k * 0.012); return [st.x, st.y, HS, st.dir, st]; })(), part));
      smear(ctx, pts, '#d8ecff', 10);
    }
    for (const m of MISSES4) {
      const sm = a - m;
      if (sm > 0 && sm < 0.25) {
        ctx.save();
        ctx.globalAlpha = 1 - sm / 0.25;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ZHEAD4[0] - 6, ZHEAD4[1] + 20 + hash(m) * 40, 40 + sm * 120, -2.4 + hash(m) * 0.6, -1.2 + hash(m) * 0.6);
        ctx.stroke();
        ctx.restore();
      }
    }
    for (const [ha, hx, hy, sz] of HITS4) hitFx(ctx, hx, hy, lt - realT(ha, hs), sz, '#ffe27a', ha);
    if (a > 4.85 && a < 5.3) reticle(ctx, ZHEAD4[0], ZHEAD4[1], lt, prog(a, 4.85, 5.1));
    if (a > 5.62 && a < 5.95) reticle(ctx, ZHEAD4[0], ZHEAD4[1], lt, prog(a, 5.62, 5.8));
    // Sonic Wind, blown away
    if (a > 12.62 && a < 13.7) {
      const u = prog(a, 12.62, 13.3);
      const die = prog(a, 13.32, 13.55);
      miniTornado(ctx, lerp(600, 690, E.out(u)), G2 - 4, a, lerp(0.4, 1.1, u) * (1 - die));
      puffs(ctx, 690, G2 - 60, prog(a, 13.32, 13.9), { n: 8, spread: 90, seed: 33, size: 20, color: '#dff0ff', shade: '#a9c8ee' });
    }
    if (a > 13.28 && a < 13.5) {
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ZHEAD4[0] - 30 - i * 14, ZHEAD4[1] + 10 + i * 6);
        ctx.lineTo(ZHEAD4[0] - 70 - i * 18, ZHEAD4[1] + 16 + i * 10);
        ctx.stroke();
      }
    }
    hitFx(ctx, BOOP_T[0], BOOP_T[1], lt - realT(14.45, hs), 0.7, '#ffffff', 5);
    // the first Chaos Spear lands between them
    if (a > 19.85) {
      const u = prog(a, 19.85, 20.05);
      if (u < 1) chaosSpear(ctx, lerp(1500, 420, u), lerp(-200, G2 - 10, u), Math.atan2(G2 + 190, -1080), 1.4);
      else chaosSpear(ctx, 432, G2 - 22, Math.atan2(G2 + 190, -1080), 1.4, 1 - prog(a, 20.05, 20.4));
      hitFx(ctx, 420, G2 - 10, lt - realT(20.05, hs), 1.8, '#ffe066', 9);
    }
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, c, actors, fr.h.a === 14.45 ? BOOP_T[0] : ZHEAD4[0], fr.h.a === 14.45 ? BOOP_T[1] : ZHEAD4[1], lt);
    talk(ctx, lt, L4b, anchorsFor(c, [['saitama', ...saiTop2(z.x, z.y, 1, -1)], ['sonic', ...hogTop(s.x, s.y)]]));
  },
});

/* ---------- 5. Chaos Spear ---------- */

const SPEARS5 = [[470, 0.0], [520, 0.18], [380, 0.34], [560, 0.5], [440, 0.66], [500, 0.82], [410, 1.0]];
const TOWER_TOP = [928, 148];

const SH5 = makeTrack([
  { t: 0, x: TOWER_TOP[0], y: TOWER_TOP[1], dir: -1, ...HP.cross2, ground: 1, expr: 'closed', alpha: 1 },
  { t: 3.9, ...HP.cross2, expr: 'closed' },
  { t: 4.0, expr: 'scowl', headTilt: -0.05 },
  { t: 6.2, ...HP.cross2, headTilt: 0 },
  { t: 8.2, ...HP.raise, arms: [[-0.2, 0.4], [2.9, 0.15]], e: E.out3 },
  { t: 9.8, arms: [[-0.25, 0.45], [2.95, 0.12]] },
  { t: 10.0, alpha: 1 },
  { t: 10.05, alpha: 0 },
  { t: 10.25, x: 470, y: G2, alpha: 0, ...HP.land, dir: 1, arms: [[-0.6, 0.4], [0.9, 0.7]] },
  { t: 10.3, alpha: 1 },
  { t: 10.6, ...HP.stand, lean: 0 },
  { t: 11.1, ...HP.cross2 },
]);

const SON5 = makeTrack([
  { t: 0, x: 270, y: G2, dir: 1, ...HP.crouch, ground: 1, ball: 1, spin: 0, expr: 'shock' },
  { t: 0.5, x: 262, spin: 12, e: E.out },
  { t: 0.55, ball: 0, ...HP.crouch },
  { t: 0.9, ...HP.stand, arms: [[-0.6, 0.6], [-0.3, 0.5]], lean: -0.1 },
  { t: 2.4, headTilt: -0.25, lean: -0.05 },
  { t: 6.4, ...HP.stand, headTilt: -0.3, lean: -0.15, arms: [[1.2, 0.6], [1.0, 0.7]], hands: ['open', 'open'] },
  { t: 8.0, ...HP.stance, headTilt: -0.1, hands: ['fist', 'fist'], expr: 'determined' },
  { t: 10.4, ...HP.stance, headTilt: 0, expr: 'shock' },
]);

const SAI5 = makeTrack([
  { t: 0, x: 640, y: G2, dir: -1, ...ZP.stand, ground: 1, wind: 0.6 },
  { t: 1.4, tilt: 0, wind: 0.3 },
  { t: 2.4, tilt: 0.35 },
  { t: 10.3, tilt: 0.35 },
  { t: 10.5, tilt: 0 },
]);

const CAM5 = makeTrack([
  { t: 0, x: 470, y: 430, z: 1.05, r: 0 },
  { t: 1.6, x: 520, y: 400, z: 1.0, r: 0 },
  { t: 2.8, x: 925, y: 150, z: 1.55, r: -0.02 },
  { t: 6.2, x: 930, y: 150, z: 1.65, r: -0.02 },
  { t: 6.4, x: 300, y: 470, z: 1.6, r: 0.03, e: E.out3 },
  { t: 8.0, x: 300, y: 470, z: 1.6, r: 0.03 },
  { t: 8.2, x: 930, y: 140, z: 1.6, r: 0, e: E.out3 },
  { t: 9.9, x: 930, y: 140, z: 1.7, r: 0 },
  { t: 10.2, x: 470, y: 420, z: 1.05, r: 0, e: E.out3 },
  { t: 14, x: 470, y: 420, z: 1.05, r: 0 },
]);

const L5b = [
  [4.2, 6.0, 'shadow', 'Faker.'],
  [6.5, 8.0, 'sonic', 'SHADOW?!', { shout: true }],
  [8.4, 9.8, 'shadow', 'Chaos...'],
  [10.0, 11.4, 'shadow', 'CONTROL.', { shout: true }],
];

scene({
  id: 'spear',
  name: 'Chaos Spear',
  dur: 14,
  fadeIn: 0.3,
  fadeInColor: '#fff6c0',
  lines: L5b,
  music: [[0, 'none'], [2.6, 'rival']],
  cues: [...SPEARS5.map(([, t]) => [t, 'spear']), [0.2, 'boom'], [2.6, 'wind'], [4.0, 'twinkle'], [10.0, 'chaos'], [10.28, 'thud']],
  draw(ctx, lt) {
    const c = CAM5(lt);
    const [qx, qy] = shakeXY(lt, 9 * env(lt, 0, 1.4, 0.1));
    const sh = SH5(lt);
    const s = SON5(lt);
    const z = SAI5(lt);
    ctx.save();
    camApply(ctx, c, qx, qy);
    ruinsBG(ctx, { px: c.x - 640, t: lt });
    ruinTower(ctx);
    ruinWall(ctx);
    groceriesSlab(ctx, true);
    for (const [x, t0] of SPEARS5) {
      const u = prog(lt, t0 - 0.2, t0);
      const rot = Math.atan2(G2 + 190, x - 1500);
      if (u < 1 && lt > t0 - 0.2) chaosSpear(ctx, lerp(1500, x, u), lerp(-200, G2 - 10, u), rot, 1.2);
      if (lt > t0) {
        chaosSpear(ctx, x + 8, G2 - 16, rot, 1.2, 1 - prog(lt, t0 + 0.6, t0 + 2.4));
        hitFx(ctx, x, G2 - 6, lt - t0, 0.9, '#ffe066', x);
        puffs(ctx, x, G2, prog(lt, t0, t0 + 2), { n: 6, spread: 90, seed: x, size: 26 });
      }
    }
    chaosSpear(ctx, 432, G2 - 22, Math.atan2(G2 + 190, -1080), 1.4, 1 - prog(lt, 0, 1.6));
    drawSai(ctx, z, lt, { blink: blinkAt(lt, 3.4), look: 0.6 });
    drawHog(drawSonic, ctx, s, lt, { talk: speaking(lt, L5b, 'sonic'), blink: blinkAt(lt, 3, 3) });
    if (sh.alpha > 0.01) drawHog(drawShadow, ctx, sh, lt, { talk: speaking(lt, L5b, 'shadow'), carry: lt > 8.2 && lt < 10.05 ? emeraldIn : null, wind: 1 });
    if (lt > 9.95 && lt < 10.6) {
      shock(ctx, TOWER_TOP[0], TOWER_TOP[1] - 90, prog(lt, 9.95, 10.4), 220, { w: 14, col: '#7dffb0' });
      shock(ctx, 470, G2 - 90, prog(lt, 10.2, 10.6), 220, { w: 14, col: '#7dffb0' });
    }
    if (lt > 4 && lt < 4.4) star4(ctx, TOWER_TOP[0] - 30, TOWER_TOP[1] - 120, 26 * env(lt, 4, 4.4, 0.1), lt * 4, '#ff6060');
    ctx.restore();
    if (lt > 10 && lt < 10.4) flash(ctx, 0.5 * (1 - prog(lt, 10, 10.4)), '#bfffd8');
    talk(ctx, lt, L5b, anchorsFor(c, [['shadow', ...hogTop(sh.x, sh.y)], ['sonic', ...hogTop(s.x, s.y)]]));
  },
});

/* ---------- 6. The Ultimate Lifeform ---------- */

const L6b = [
  [0.5, 3.4, 'sonic', 'What are you doing here, Shadow?!'],
  [3.8, 8.0, 'shadow', 'I heard of a man who defeats any enemy with one punch.'],
  [8.4, 11.6, 'shadow', '...This is him? He looks like an egg.'],
  [12.0, 13.8, 'saitama', '...Hey.'],
  [14.4, 17.4, 'saitama', "Who's the angry hedgehog?"],
  [17.8, 21.2, 'sonic', "That's Shadow. He's... a lot."],
  [21.6, 25.2, 'shadow', 'I am the Ultimate Lifeform. Step aside, Faker.'],
  [25.6, 28.0, 'shadow', 'This one is mine.'],
  [28.4, 30.6, 'saitama', '...Sure. I just do this for fun.'],
];

const CAM6 = makeTrack([
  { t: 0, x: 460, y: 430, z: 1.05, r: 0 },
  { t: 3.6, x: 460, y: 430, z: 1.05, r: 0 },
  { t: 3.8, x: 480, y: 460, z: 1.7, r: 0.02, e: E.out3 },
  { t: 8.2, x: 490, y: 455, z: 1.75, r: 0.02 },
  { t: 8.4, x: 540, y: 440, z: 1.5, r: 0, e: E.out3 },
  { t: 11.8, x: 550, y: 440, z: 1.55, r: 0 },
  { t: 12.0, x: 640, y: 420, z: 1.75, r: -0.02, e: E.out3 },
  { t: 17.6, x: 640, y: 420, z: 1.8, r: -0.02 },
  { t: 17.8, x: 280, y: 470, z: 1.7, r: 0.02, e: E.out3 },
  { t: 21.4, x: 285, y: 470, z: 1.72, r: 0.02 },
  { t: 21.6, x: 480, y: 460, z: 1.7, r: 0.03, e: E.out3 },
  { t: 28.2, x: 500, y: 455, z: 1.6, r: 0.03 },
  { t: 28.4, x: 460, y: 430, z: 1.05, r: 0, e: E.out3 },
  { t: 31, x: 460, y: 430, z: 1.05, r: 0 },
]);

const SH6 = makeTrack([
  { t: 0, x: 470, y: G2, dir: 1, ...HP.cross2, ground: 1, expr: 'scowl' },
  { t: 3.8, ...HP.cross2, headTilt: 0.04 },
  { t: 8.4, ...HP.cross2, expr: 'smirk', headTilt: -0.06 },
  { t: 11.6, ...HP.cross2, expr: 'smirk' },
  { t: 21.6, expr: 'scowl', headTilt: 0 },
  { t: 23.0, ...HP.stand, arms: [[-0.2, 0.3], [0.2, 0.4]], lean: 0.05 },
  { t: 25.6, arms: [[-0.2, 0.3], [1.55, 0.05]], hands: ['fist', 'point'], lean: 0.15, e: E.out3 },
  { t: 28.0, arms: [[-0.25, 0.32], [1.5, 0.1]] },
  { t: 28.4, ...HP.stance, hands: ['fist', 'fist'], expr: 'determined' },
]);

const SON6 = makeTrack([
  { t: 0, x: 260, y: G2, dir: 1, ...HP.stand, ground: 1, expr: 'shock', arms: [[1.1, 0.7], [1.3, 0.6]], hands: ['open', 'open'] },
  { t: 3.4, ...HP.stand, expr: 'smirk' },
  { t: 17.8, ...HP.stand, arms: [[1.0, 1.2], [1.3, 1.1]], hands: ['open', 'open'], expr: 'sheepish', headTilt: 0.12 },
  { t: 21.2, ...HP.stand, hands: ['fist', 'fist'], headTilt: 0 },
  { t: 25.2, ...HP.stand, expr: 'shock' },
  { t: 28.6, ...POSE.sonicHip(), expr: 'smirk', legs: HP.stand.legs },
]);

const SAI6 = makeTrack([
  { t: 0, x: 680, y: G2, dir: -1, ...ZP.stand, ground: 1, wind: 0.3 },
  { t: 12.0, vein: 0 },
  { t: 12.3, vein: 1, e: E.back },
  { t: 18.0, vein: 1 },
  { t: 18.4, vein: 0 },
]);

scene({
  id: 'lifeform',
  name: 'The Ultimate Lifeform',
  dur: 31,
  lines: L6b,
  music: [[0, 'tension'], [21.6, 'rival']],
  cues: [[12.1, 'pop']],
  draw(ctx, lt) {
    const c = CAM6(lt);
    const sh = SH6(lt);
    const s = SON6(lt);
    const z = SAI6(lt);
    ctx.save();
    camApply(ctx, c);
    ruinsBG(ctx, { px: c.x - 640, t: lt });
    ruinTower(ctx);
    ruinWall(ctx);
    groceriesSlab(ctx, true);
    drawSai(ctx, z, lt, { expr: z.vein > 0.5 ? 'annoyed' : 'ok', blink: blinkAt(lt, 3.4), talk: speaking(lt, L6b, 'saitama') });
    drawHog(drawSonic, ctx, s, lt, { talk: speaking(lt, L6b, 'sonic'), blink: blinkAt(lt, 3, 3) });
    drawHog(drawShadow, ctx, sh, lt, { talk: speaking(lt, L6b, 'shadow'), blink: blinkAt(lt, 4.2, 6) });
    ctx.restore();
    talk(ctx, lt, L6b, anchorsFor(c, [['shadow', ...hogTop(sh.x, sh.y)], ['sonic', ...hogTop(s.x, s.y)], ['saitama', ...saiTop2(z.x, z.y, 1, -1)]]));
  },
});
