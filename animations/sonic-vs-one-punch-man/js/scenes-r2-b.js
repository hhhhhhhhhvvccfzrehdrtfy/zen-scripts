'use strict';
/* Round 2, part two: Shadow vs Saitama, Chaos Control, the rings come off, Chaos Blast, the team-up,
   Consecutive Normal Punches, hot pot, and the credits. */

const ZX7 = 680;
const ZHEAD7 = saiPoint(ZX7, G2, 1, -1, ZP.stand, 'head');
const ZBACK7 = [ZX7 + 18, G2 - 150];

function ringDrop(ctx, x0, y0, t, seed) {
  if (t < 0) return;
  const fall = Math.min(t, 0.45);
  let y = y0 + 900 * fall * fall * 0.5 * 2;
  y = Math.min(y, G2 - 6);
  let bounce = 0;
  if (t > 0.45) bounce = Math.abs(Math.sin((t - 0.45) * 12)) * 26 * Math.exp(-(t - 0.45) * 4);
  const x = x0 + Math.min(t, 1.4) * 40 * (hash(seed) - 0.3);
  ctx.save();
  ctx.translate(x, y - bounce);
  ctx.rotate(t * 6);
  ell(ctx, 0, 0, 11, 5 + 3 * Math.abs(Math.sin(t * 9)), 0, null, 0);
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 5 + 3 * Math.abs(Math.sin(t * 9)), 0, 0, TAU);
  strokeNow(ctx, 6, INK);
  strokeNow(ctx, 3.5, SHD.ring);
  ctx.restore();
}

/* ---------- 7. Shadow vs Saitama (hand-keyed) ---------- */

const KHB7 = P(HP.kickHigh, { ground: 0, legs: [[-0.2, -0.15], [2.35, -0.05]], lean: -0.55 });
const KHB7P = hogPlace(HS, -1, KHB7, 'foot', ZHEAD7[0] + 22, ZHEAD7[1] - 2);
const AXE7 = P(HP.axeDown, { ground: 0, legs: [[-0.45, -0.35], [1.2, 0.02]] });
const AXE7P = hogPlace(HS, -1, AXE7, 'foot', ZHEAD7[0] + 12, ZHEAD7[1] - 26);
const FLY7 = P(HP.kickMid, { ground: 0, legs: [[-0.35, -0.6], [1.6, 0]], lean: -0.25 });
const CATCH7 = [ZX7 + 44, G2 - 170];
const CATCH7IK = saiReachIK(ZX7, G2, 1, 1, ZP.stand, CATCH7[0], CATCH7[1]);
const LIFT7IK = saiReachIK(ZX7, G2, 1, 1, ZP.stand, CATCH7[0] - 8, CATCH7[1] - 58);
const TOSS7IK = saiReachIK(ZX7, G2, 1, 1, ZP.stand, CATCH7[0] + 26, CATCH7[1] - 86);
const SPEAR7 = [
  { t0: 2.68, t1: 2.88, from: [478, 470], to: [ZHEAD7[0] - 4, ZHEAD7[1]], end: [1150, 360] },
  { t0: 2.98, t1: 3.16, from: [480, 480], to: [ZX7 - 8, G2 - 150], end: [1150, G2 - 6] },
  { t0: 3.3, t1: 3.42, from: [482, 470], to: [ZHEAD7[0] - 40, ZHEAD7[1] + 4], end: null },
];
const CATCHSPEAR = saiReachIK(ZX7, G2, 1, -1, ZP.stand, SPEAR7[2].to[0], SPEAR7[2].to[1], false, true);
const LOOKSPEAR = saiReachIK(ZX7, G2, 1, -1, ZP.stand, ZHEAD7[0] - 34, ZHEAD7[1] + 10, false, true);

const SH7 = makeTrack([
  { t: 0, x: 470, y: G2, dir: 1, ...HP.stance, ground: 1, rot: 0, jet: 0, alpha: 1, expr: 'determined' },
  { t: 0.25, ...HP.crouch, jet: 0.4, e: E.out3 },
  { t: 0.4, ...HP.skate, ground: 0.6, y: G2 + 8, jet: 1, x: 482 },
  { t: 0.7, x: 760, y: G2 + 14, legs: [[-1.0, -0.2], [0.5, -0.8]], e: E.in },
  { t: 0.95, x: 1000, y: G2 + 8, legs: [[-0.85, -0.25], [0.4, -0.7]], e: E.lin },
  { t: 1.1, x: 1046, ...HP.skid, ground: 1, y: G2, jet: 0.6, e: E.out },
  { t: 1.12, dir: -1 },
  { t: 1.3, ...HP.skate, ground: 0.6, x: 1010, jet: 1, e: E.out },
  { t: 1.55, x: 810, legs: [[-0.95, -0.2], [0.5, -0.75]], e: E.in },
  { t: 1.62, ...HP.kickLow, ground: 1, hipLift: -30, legs: [[1.1, -2.1], [1.5, -0.05]], lean: 0.15, x: 760, jet: 0.8 },
  { t: 1.75, x: 640, e: E.lin },
  { t: 1.95, x: 480, legs: [[1.05, -2.0], [1.45, -0.1]], e: E.lin },
  { t: 2.2, x: 430, ...HP.crouch, hipLift: 0, jet: 0.2, e: E.out },
  { t: 2.4, ...HP.stance, jet: 0 },
  { t: 2.45, dir: 1 },
  { t: 2.5, ...HP.windThrow, x: 430, e: E.out3 },
  { t: 2.68, ...HP.throw, e: E.out3 },
  { t: 2.82, ...HP.windThrow, lean: -0.28, arms: [[0.4, 1.3], [-2.1, 0.6]] },
  { t: 2.98, ...HP.throw, arms: [[-0.9, 0.5], [1.85, 0.0]], lean: 0.35, e: E.out3 },
  { t: 3.15, ...HP.stance, arms: [[-1.2, 1.4], [-1.0, 1.5]], lean: -0.1 },
  { t: 3.3, ...HP.throw, arms: [[1.55, 0.05], [1.65, 0.0]], lean: 0.3, e: E.out3 },
  { t: 3.45, expr: 'shock' },
  { t: 4.0, ...HP.stand, arms: [[-0.4, 0.4], [-0.2, 0.5]], lean: -0.1 },
  { t: 4.1, expr: 'angry' },
  { t: 4.3, ...HP.raise, arms: [[-0.2, 0.4], [2.6, 0.2]], e: E.out3 },
  { t: 4.45, alpha: 1 },
  { t: 4.5, alpha: 0 },
  { t: 4.6, x: KHB7P[0] + 24, y: KHB7P[1] - 20, dir: -1, ...HP.chamber, ground: 0, legs: [[-0.2, -0.2], [1.9, -2.3]], alpha: 0 },
  { t: 4.62, alpha: 1 },
  { t: 4.75, ...KHB7, x: KHB7P[0], y: KHB7P[1], e: E.out3 },
  { t: 4.9, ...HP.recoil, x: 900, y: G2 - 200, rot: -1.5, e: E.out },
  { t: 5.15, ...HP.tuck, x: 960, y: G2 - 120, rot: -4.0, e: E.lin },
  { t: 5.35, ...HP.land, ground: 1, x: 980, y: G2, rot: -TAU, e: E.in },
  { t: 5.351, rot: 0 },
  { t: 5.5, ...HP.skate, ground: 0.6, jet: 1, x: 970 },
  { t: 5.7, x: 760, ...HP.stance, ground: 1, jet: 0.3, e: E.in },
  { t: 5.78, ...HP.jab, x: 758, e: E.out3 },
  { t: 5.86, ...HP.stance, x: 760 },
  { t: 5.95, ...HP.cross, x: 756, e: E.out3 },
  { t: 6.04, ...HP.stance, x: 760 },
  { t: 6.12, ...HP.chamber, x: 762, jet: 0.6 },
  { t: 6.2, ...HP.kickMid, x: 772, jet: 1, e: E.out3 },
  { t: 6.3, ...HP.tuck, ground: 0.5, rot: 0, x: 772, y: G2 - 20, jet: 0.3 },
  { t: 6.45, ...HP.kickMid, rot: 3.9, ground: 0, y: G2 - 60, e: E.lin },
  { t: 6.58, ...HP.kickHigh, rot: TAU, y: G2 - 70, jet: 1, e: E.out },
  { t: 6.581, rot: 0 },
  { t: 6.68, ...HP.crouch, ground: 1, y: G2, x: 758, jet: 0.2 },
  { t: 6.78, ...HP.upper, x: 750, e: E.out3 },
  { t: 6.9, ...HP.tuck, ground: 0, y: G2 - 110, x: 760, e: E.out },
  { t: 7.02, ...HP.kickHigh, legs: [[0.6, -1.4], [2.5, -0.05]], y: G2 - 122, e: E.out3 },
  { t: 7.15, ...HP.axeUp, x: AXE7P[0] + 6, y: AXE7P[1] - 30 },
  { t: 7.3, ...AXE7, x: AXE7P[0], y: AXE7P[1], e: E.in3 },
  { t: 7.45, ...HP.land, ground: 1, x: 790, y: G2, e: E.in },
  { t: 7.62, ...HP.crouch, x: 800, lean: 0.55 },
  { t: 7.8, ...FLY7, x: 800, y: G2 - 120, jet: 1, expr: 'angry', e: E.out },
  { t: 7.98, ...FLY7, x: hogPlace(HS, -1, FLY7, 'foot', CATCH7[0], CATCH7[1])[0], y: hogPlace(HS, -1, FLY7, 'foot', CATCH7[0], CATCH7[1])[1], e: E.lin },
  { t: 8.05, expr: 'shock', jet: 0 },
  { t: 8.5, ...FLY7, rot: -0.9, arms: [[2.6, 0.4], [2.3, 0.5]] },
  { t: 9.2, rot: -1.2, arms: [[2.8, 0.3], [2.5, 0.4]] },
  { t: 9.3, ...HP.tuck, rot: -1.2 },
  { t: 10.0, ...HP.float, rot: -TAU * 1.5, jet: 1, expr: 'angry' },
  { t: 10.001, rot: 0 },
  { t: 10.5, ...HP.land, ground: 1, jet: 0.3 },
  { t: 10.8, ...HP.cross2, jet: 0, expr: 'smirk' },
  { t: 14.3, ...HP.cross2 },
  { t: 14.5, ...HP.raise, arms: [[-0.2, 0.4], [2.85, 0.15]], expr: 'angry', e: E.out3 },
]);

const ZT7 = makeTrack([
  { t: 0, x: ZX7, y: G2, dir: -1, ...ZP.stand, ground: 1, wind: 0.3, vein: 0 },
  { t: 1.55, ...ZP.stand },
  { t: 1.62, ...ZP.hop, ground: 0, y: G2 - 58, e: E.out },
  { t: 1.92, ...ZP.stand, ground: 1, y: G2, e: E.in },
  { t: 2.75, ...ZP.stand },
  { t: 2.8, tilt: -0.32, e: E.out3 },
  { t: 2.95, tilt: 0 },
  { t: 3.05, ...ZP.dodgeBack, e: E.out3 },
  { t: 3.18, ...ZP.stand },
  { t: 3.3, arms: [[-0.05, 0.12], [CATCHSPEAR[0] - 0.3, CATCHSPEAR[1] + 0.3]], hands: ['fist', 'finger'] },
  { t: 3.42, arms: [[-0.05, 0.12], CATCHSPEAR], e: E.out3 },
  { t: 3.7, arms: [[-0.05, 0.12], LOOKSPEAR], tilt: 0.12 },
  { t: 3.98, arms: [[-0.05, 0.12], [LOOKSPEAR[0] + 0.05, LOOKSPEAR[1] + 0.1]] },
  { t: 4.02, arms: [[-0.05, 0.12], [LOOKSPEAR[0] - 0.1, LOOKSPEAR[1] - 0.3]], e: E.out3 },
  { t: 4.3, ...ZP.stand, hands: ['fist', 'fist'], tilt: 0 },
  { t: 4.75, wind: 1.0, tilt: 0.05, e: E.out3 },
  { t: 5.0, wind: 0.4, tilt: 0 },
  { t: 5.78, wind: 0.8 },
  { t: 5.86, wind: 0.4 },
  { t: 5.95, wind: 0.85 },
  { t: 6.04, wind: 0.4 },
  { t: 6.2, wind: 0.95 },
  { t: 6.3, wind: 0.45 },
  { t: 6.58, wind: 1.0 },
  { t: 6.68, wind: 0.5 },
  { t: 6.78, wind: 0.9 },
  { t: 7.02, wind: 1.0, tilt: -0.05 },
  { t: 7.3, wind: 1.2, tilt: 0.04 },
  { t: 7.5, wind: 0.4, tilt: 0 },
  { t: 7.82, ...ZP.stand },
  { t: 7.85, dir: 1, arms: [[-0.05, 0.12], [CATCH7IK[0] - 0.4, CATCH7IK[1] + 0.3]], hands: ['fist', 'open'] },
  { t: 7.98, arms: [[-0.05, 0.12], CATCH7IK], hands: ['fist', 'fist'], e: E.out3 },
  { t: 8.8, arms: [[-0.05, 0.12], CATCH7IK] },
  { t: 9.2, arms: [[-0.05, 0.12], LIFT7IK], lean: -0.05 },
  { t: 9.3, arms: [[-0.05, 0.12], TOSS7IK], hands: ['fist', 'open'], lean: -0.1, e: E.out3 },
  { t: 9.7, ...ZP.stand, hands: ['fist', 'fist'] },
  { t: 12.9, vein: 0 },
  { t: 13.2, vein: 1, e: E.back },
  { t: 14.2, vein: 1 },
]);

// After the catch, Shadow hangs from Saitama's fist, then rides a toss arc onto the tower.
function shadow7(a) {
  const st = SH7(a);
  if (a < 7.98) return st;
  const z = ZT7(a);
  if (a < 9.3) {
    const hand = saiPoint(z.x, z.y, 1, z.dir, z, 'hand');
    const [ox, oy] = hogPlace(HS, -1, st, 'foot', hand[0], hand[1]);
    return { ...st, x: ox, y: oy };
  }
  const z0 = ZT7(9.3);
  const h0 = saiPoint(z0.x, z0.y, 1, z0.dir, z0, 'hand');
  const u = prog(a, 9.3, 10.5);
  return { ...st, x: lerp(h0[0], TOWER_TOP[0], E.inOut(u)), y: lerp(h0[1] + 60, TOWER_TOP[1], u) - Math.sin(Math.PI * u) * 240 };
}

const CAM7 = makeTrack([
  { t: 0, x: 560, y: 430, z: 1.1, r: 0 },
  { t: 0.4, x: 600, y: 450, z: 1.25, r: 0.02 },
  { t: 0.8, x: 800, y: 450, z: 1.2, r: -0.02 },
  { t: 1.1, x: 960, y: 440, z: 1.3, r: 0.03 },
  { t: 1.5, x: 790, y: 450, z: 1.25, r: 0 },
  { t: 1.75, x: 650, y: 470, z: 1.42, r: -0.04 },
  { t: 2.2, x: 530, y: 450, z: 1.25, r: 0 },
  { t: 2.6, x: 560, y: 430, z: 1.2, r: 0 },
  { t: 3.3, x: 620, y: 420, z: 1.3, r: 0 },
  { t: 3.42, x: 640, y: 400, z: 1.62, r: 0.04, e: E.out3 },
  { t: 3.98, x: 650, y: 395, z: 1.78, r: 0.03 },
  { t: 4.1, x: 560, y: 420, z: 1.2, r: 0, e: E.out3 },
  { t: 4.6, x: 760, y: 380, z: 1.35, r: 0 },
  { t: 4.75, x: 720, y: 380, z: 1.65, r: -0.06, e: E.out3 },
  { t: 5.3, x: 860, y: 430, z: 1.2, r: 0 },
  { t: 5.7, x: 740, y: 430, z: 1.45, r: 0.04 },
  { t: 6.6, x: 730, y: 420, z: 1.55, r: -0.04 },
  { t: 7.3, x: 720, y: 395, z: 1.62, r: 0.05, e: E.out3 },
  { t: 7.6, x: 740, y: 440, z: 1.3, r: 0 },
  { t: 7.98, x: 720, y: 420, z: 1.55, r: -0.04, e: E.out3 },
  { t: 8.8, x: 740, y: 410, z: 1.35, r: 0 },
  { t: 9.3, x: 800, y: 380, z: 1.15, r: 0 },
  { t: 10.5, x: 880, y: 220, z: 1.25, r: 0 },
  { t: 12.6, x: 870, y: 240, z: 1.2, r: 0 },
  { t: 12.8, x: 690, y: 420, z: 1.6, r: 0, e: E.out3 },
  { t: 14.3, x: 690, y: 420, z: 1.6, r: 0 },
  { t: 14.5, x: 925, y: 140, z: 1.55, r: 0, e: E.out3 },
  { t: 15.2, x: 925, y: 140, z: 1.6, r: 0 },
]);

const CONTACTS7 = [[5.78, 'hand'], [5.95, 'hand'], [6.2, 'foot'], [6.58, 'foot'], [6.78, 'hand'], [7.02, 'foot']];

const L7b = [
  [4.0, 5.0, 'sonic', 'He SNAPPED it?!', { shout: true }],
  [5.8, 8.0, 'saitama', 'Did I put the eggs in the fridge?', { think: true }],
  [10.8, 12.6, 'shadow', 'Impressive... for a bald man.'],
  [12.9, 14.2, 'saitama', '...Hey.'],
];

fightScene({
  id: 'fight2',
  name: 'Shadow vs Saitama',
  dur: 15.2,
  lines: L7b,
  holds: [[3.42, 0.1, 6], [4.75, 0.15, 14, true], [7.3, 0.1, 10], [7.98, 0.12, 10, true]],
  music: [[0, 'rival'], [10.6, 'none'], [14.4, 'tension']],
  cues: [
    [0.4, 'jet'], [0.7, 'whoosh'], [1.1, 'skid'], [1.3, 'jet'], [1.62, 'whoosh'], [2.68, 'spear'], [2.98, 'spear'], [3.0, 'hit'], [3.2, 'hit'],
    [3.3, 'spear'], [3.42, 'clink'], [4.0, 'snap'], [4.45, 'chaos'], [4.75, 'punch'], [4.76, 'boom'], [5.5, 'jet'],
    ...CONTACTS7.map(([t]) => [t, 'hit']), [7.3, 'punch'], [7.8, 'jet'], [7.98, 'clink'], [9.3, 'whoosh'], [10.0, 'jet'], [10.5, 'thud'], [12.95, 'pop'],
  ],
  render(ctx, a, lt, hs) {
    const c = CAM7(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs));
    const sh = shadow7(a);
    const z = ZT7(a);
    const sonicBg = { x: 160, y: G2, dir: 1, ...HP.stand, expr: a > 3.4 && a < 5 ? 'shock' : a > 9.3 && a < 10.8 ? 'laugh' : 'smirk', arms: [[-0.1, 0.3], [0.15, 0.3]] };
    const actors = (g) => {
      drawHog(drawSonic, g, sonicBg, a, { talk: speaking(lt, L7b, 'sonic'), blink: blinkAt(a, 3, 21) });
      drawSai(g, z, a, { expr: z.vein > 0.5 ? 'annoyed' : 'ok', blink: blinkAt(a, 3.4, 4), talk: speaking(lt, L7b, 'saitama') });
      const fast = (a > 0.4 && a < 2.2) || (a > 5.5 && a < 5.7) || (a > 6.3 && a < 6.6) || (a > 7.6 && a < 7.98);
      if (fast && sh.alpha > 0.5) ghosts(3, 0.03, a, (ta, al) => drawHog(drawShadow, g, shadow7(ta), ta, { alpha: al }), 0.28);
      if (sh.alpha > 0.01) drawHog(drawShadow, g, sh, a, { talk: speaking(lt, L7b, 'shadow'), blink: blinkAt(a, 4.1, 8), carry: (a > 4.3 && a < 4.5) || a > 14.5 ? emeraldIn : null });
    };
    ctx.save();
    camApply(ctx, c, qx, qy);
    ruinsBG(ctx, { px: c.x - 640, t: lt });
    ruinTower(ctx);
    ruinWall(ctx);
    groceriesSlab(ctx, true);
    actors(ctx);
    // spears: thrown, dodged, caught, snapped
    for (const [i, sp] of SPEAR7.entries()) {
      const rot = Math.atan2(sp.to[1] - sp.from[1], sp.to[0] - sp.from[0]);
      if (a > sp.t0 && a < sp.t1) {
        const u = (a - sp.t0) / (sp.t1 - sp.t0);
        chaosSpear(ctx, lerp(sp.from[0], sp.to[0], u), lerp(sp.from[1], sp.to[1], u), rot, 1);
      } else if (sp.end && a >= sp.t1 && a < sp.t1 + 0.12) {
        const u = (a - sp.t1) / 0.12;
        chaosSpear(ctx, lerp(sp.to[0], sp.end[0], u), lerp(sp.to[1], sp.end[1], u), rot, 1);
      }
      if (sp.end) hitFx(ctx, sp.end[0], sp.end[1], lt - realT(sp.t1 + 0.12, hs), 0.7, '#ffe066', i);
    }
    if (a >= 3.42 && a < 4.0) {
      const tip = saiPoint(z.x, z.y, 1, z.dir, z, 'finger');
      chaosSpear(ctx, tip[0] - 4, tip[1], Math.PI, 1);
    }
    if (a >= 4.0 && a < 5.2) {
      const t = a - 4.0;
      const tip = saiPoint(ZT7(4.0).x, G2, 1, -1, ZT7(4.0), 'finger');
      chaosSpear(ctx, tip[0] - 20, tip[1] + 300 * t * t + 10 * t, Math.PI + t * 6, 0.55, 1 - prog(t, 0.6, 1.2));
      chaosSpear(ctx, tip[0] + 10, tip[1] + 300 * t * t + 4 * t, -t * 7, 0.5, 1 - prog(t, 0.6, 1.2));
      sparks(ctx, tip[0], tip[1], t / 0.4, { n: 8, len: 50, seed: 3 });
    }
    if (a > 4.42 && a < 4.62) shock(ctx, 430, G2 - 90, prog(a, 4.42, 4.6), 160, { w: 10, col: '#7dffb0' });
    hitFx(ctx, ZHEAD7[0] + 20, ZHEAD7[1], lt - realT(4.75, hs), 1.1, '#ff9a6a', 4);
    for (const [ct, part] of CONTACTS7) {
      const st = SH7(ct);
      const p = hogPoint(st.x, st.y, HS, st.dir, st, part);
      hitFx(ctx, p[0], p[1], lt - realT(ct, hs), 0.7, '#ff9a6a', ct * 10);
    }
    hitFx(ctx, ZHEAD7[0] + 10, ZHEAD7[1] - 26, lt - realT(7.3, hs), 1.1, '#ff9a6a', 7);
    hitFx(ctx, CATCH7[0], CATCH7[1], lt - realT(7.98, hs), 0.8, '#ffffff', 8);
    if (a > 0.4 && a < 2.1) puffs(ctx, sh.x - 30, G2, (a * 5) % 1, { n: 3, spread: 40, seed: Math.floor(a * 5), size: 14, dx: -60 });
    if (a > 1.0 && a < 1.2) sparks(ctx, sh.x + 10, G2 - 6, prog(a, 1.0, 1.2), { n: 10, len: 70, seed: 5, a0: 0, spread: 1.6, col: '#ffb060' });
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, c, actors, fr.h.a === 7.98 ? CATCH7[0] : ZHEAD7[0], fr.h.a === 7.98 ? CATCH7[1] : ZHEAD7[1], lt);
    talk(ctx, lt, L7b, anchorsFor(c, [['shadow', ...hogTop(sh.x, sh.y)], ['sonic', ...hogTop(160, G2)], ['saitama', ...saiTop2(z.x, z.y, 1, z.dir)]]));
  },
});

/* ---------- 8. Chaos Control ---------- */

const ZX8b = 680;
const ZCHEST8 = [ZX8b + 10, G2 - 150];
const MARKS8 = [
  [3.8, ZX8b + 18, G2 - 150],
  [4.1, ZX8b + 16, G2 - 110],
  [4.4, ZX8b + 10, G2 - 206],
  [4.8, ZX8b + 14, G2 - 178],
  [5.2, ZX8b + 20, G2 - 140],
  [5.6, ZX8b + 6, G2 - 214],
];

const SH8 = makeTrack([
  { t: 0, x: TOWER_TOP[0], y: TOWER_TOP[1], dir: -1, ...HP.raise, arms: [[-0.2, 0.4], [2.85, 0.15]], ground: 1, expr: 'angry', rot: 0 },
  { t: 1.2, arms: [[-0.25, 0.45], [3.0, 0.1]], lean: -0.1 },
  { t: 1.9, ...HP.crouch },
  { t: 2.0, ...HP.tuck, ground: 0, y: TOWER_TOP[1] - 30 },
  { t: 2.3, x: 900, y: 300, e: E.out },
  { t: 2.55, x: 840, y: G2, ...HP.land, ground: 1, e: E.in },
  { t: 2.75, ...HP.stand, expr: 'smirk' },
  { t: 2.95, x: 818, legs: [[-0.35, -0.1], [0.35, -0.4]], arms: [[0.3, 0.3], [-0.3, 0.3]] },
  { t: 3.15, x: 796, legs: [[0.3, -0.4], [-0.3, -0.1]], arms: [[-0.3, 0.3], [0.3, 0.3]] },
  { t: 3.35, x: 774, legs: [[-0.35, -0.1], [0.35, -0.4]], arms: [[0.3, 0.3], [-0.3, 0.3]] },
  { t: 3.55, x: 752, ...HP.stance },
  { t: 3.8, ...HP.jab, x: 746, e: E.out3 },
  { t: 3.95, ...HP.stance, x: 748 },
  { t: 4.1, ...HP.kickMid, x: 760, e: E.out3 },
  { t: 4.22, ...HP.tuck, ground: 0.4, rot: 0, y: G2 - 30 },
  { t: 4.4, ...HP.kickHigh, rot: TAU, ground: 0, y: G2 - 60, x: 768, e: E.out },
  { t: 4.401, rot: 0 },
  { t: 4.6, ...HP.crouch, ground: 1, y: G2, x: 752 },
  { t: 4.8, ...HP.upper, x: 744, e: E.out3 },
  { t: 5.0, ...HP.stance, x: 748 },
  { t: 5.2, ...HP.throw, arms: [[1.5, 0.1], [1.6, 0.05]], hands: ['open', 'open'], x: 742, e: E.out3 },
  { t: 5.35, ...HP.crouch, x: 750 },
  { t: 5.6, ...HP.chamber, ground: 0, y: G2 - 130, x: 742, legs: [[-0.3, -0.3], [2.0, -2.5]], e: E.out },
  { t: 5.85, ...HP.tuck, y: G2 - 80, x: 790 },
  { t: 6.05, ...HP.land, ground: 1, y: G2, x: 820, e: E.in },
  { t: 6.2, dir: 1, ...HP.stand },
  { t: 6.35, ...HP.cross2, expr: 'closed' },
  { t: 10.55, ...HP.cross2, expr: 'closed' },
  { t: 10.6, expr: 'shock' },
  { t: 10.95, dir: -1, ...HP.stand, arms: [[-0.6, 0.4], [-0.4, 0.4]], lean: -0.15 },
  { t: 15.6, ...HP.stand, arms: [[1.2, 0.9], [1.4, 0.8]], hands: ['open', 'open'], lean: 0.12, expr: 'angry' },
  { t: 18.4, ...HP.stand, arms: [[-0.6, 0.4], [-0.4, 0.4]], lean: 0, expr: 'shock' },
  { t: 21.0, ...HP.stand },
  { t: 21.2, ...HP.recoil, ground: 1, lean: -0.3, e: E.out3 },
  { t: 21.8, ...HP.stand, expr: 'angry' },
]);

const ZT8 = makeTrack([
  { t: 0, x: ZX8b, y: G2, dir: 1, ...ZP.stand, ground: 1, wind: 0.3, look: 0 },
  { t: 8.2, look: 0 },
  { t: 8.45, look: -1 },
  { t: 8.8, look: 0.8, tilt: 0.1 },
  { t: 10.6, look: 0.8, tilt: 0 },
  { t: 12.6, ...ZP.stand },
  { t: 12.85, dir: -1, x: 652, legs: [[0.3, -0.05], [-0.3, -0.4]] },
  { t: 13.1, x: 610, legs: [[-0.25, -0.05], [0.25, -0.05]] },
  { t: 13.35, x: 568, legs: [[-0.3, -0.4], [0.3, -0.05]] },
  { t: 13.6, x: 530, legs: [[0.25, -0.05], [-0.25, -0.35]] },
  { t: 13.8, x: 512, ...ZP.stand },
  { t: 14.05, arms: [[-0.05, 0.12], saiReachIK(512, G2, 1, -1, ZP.stand, 466, G2 - 64, false, true)], hands: ['fist', 'finger'] },
  { t: 14.3, arms: [[-0.05, 0.12], saiReachIK(512, G2, 1, -1, ZP.stand, 458, G2 - 62, false, true)] },
  { t: 14.6, ...ZP.stand, hands: ['fist', 'fist'] },
  { t: 15.4, dir: 1 },
  { t: 21.0, ...ZP.stand },
]);

const CAM8 = makeTrack([
  { t: 0, x: 925, y: 140, z: 1.45, r: 0 },
  { t: 1.2, x: 925, y: 140, z: 1.55, r: 0.02 },
  { t: 1.6, x: 760, y: 400, z: 1.0, r: 0, e: E.out3 },
  { t: 2.0, x: 860, y: 320, z: 1.08, r: 0 },
  { t: 2.6, x: 800, y: 430, z: 1.25, r: 0 },
  { t: 3.7, x: 730, y: 430, z: 1.5, r: 0.03 },
  { t: 5.9, x: 730, y: 430, z: 1.55, r: -0.03 },
  { t: 6.3, x: 760, y: 440, z: 1.35, r: 0 },
  { t: 8.0, x: 700, y: 430, z: 1.45, r: 0 },
  { t: 8.2, x: 690, y: 405, z: 1.95, r: 0.02, e: E.out3 },
  { t: 10.5, x: 690, y: 405, z: 1.95, r: 0.02 },
  { t: 10.6, x: 820, y: 440, z: 1.65, r: -0.03, e: E.out3 },
  { t: 12.5, x: 760, y: 440, z: 1.3, r: 0 },
  { t: 13.6, x: 640, y: 440, z: 1.25, r: 0 },
  { t: 15.4, x: 650, y: 440, z: 1.25, r: 0 },
  { t: 15.6, x: 800, y: 430, z: 1.55, r: 0.02, e: E.out3 },
  { t: 18.4, x: 800, y: 430, z: 1.55, r: 0.02 },
  { t: 18.6, x: 600, y: 420, z: 1.55, r: 0, e: E.out3 },
  { t: 20.9, x: 640, y: 420, z: 1.2, r: 0 },
  { t: 21.0, x: 660, y: 420, z: 1.18, r: 0.03, e: E.out3 },
  { t: 22.0, x: 520, y: 430, z: 1.05, r: 0 },
  { t: 26, x: 520, y: 430, z: 1.05, r: 0 },
]);

const L8b = [
  [0.2, 1.2, 'shadow', 'CHAOS...', { shout: true }],
  [1.2, 2.4, 'shadow', 'CONTROL!', { shout: true }],
  [2.8, 4.4, 'shadow', 'Time is mine now.'],
  [6.4, 8.0, 'shadow', 'And time resumes in three...'],
  [8.8, 10.6, 'saitama', 'Huh. Everything stopped.'],
  [11.0, 12.4, 'shadow', '...WHAT?!', { shout: true }],
  [13.0, 15.4, 'saitama', 'Is this your thing?'],
  [15.6, 18.4, 'shadow', 'You can MOVE in stopped time?!', { shout: true }],
  [18.6, 20.8, 'saitama', 'Was I not supposed to?'],
  [21.8, 25.4, 'sonic', 'Shadow, what did y- ...why is Saitama over THERE?'],
];

scene({
  id: 'chaos',
  name: 'Chaos Control',
  dur: 26,
  lines: L8b,
  music: [[0, 'rival'], [1.2, 'none'], [21.0, 'fight'], [22.6, 'calm']],
  cues: [[1.2, 'chaos'], [2.0, 'whoosh'], ...MARKS8.map(([t]) => [t, 'tick']), [8.2, 'pop'], [21.0, 'unfreeze'], [21.05, 'bigboom'], [21.1, 'punch'], [21.3, 'punch']],
  draw(ctx, lt) {
    const c = CAM8(lt);
    const frozen = lt > 1.4 && lt < 21.2;
    const k = lt < 1.4 ? prog(lt, 1.2, 1.4) : 1 - prog(lt, 21.0, 21.4);
    const [qx, qy] = shakeXY(lt, 18 * env(lt, 21.0, 22.2, 0.05));
    const sh = SH8(lt);
    const z = ZT8(lt);
    const sonicMoves = lt > 21.2;
    ctx.save();
    camApply(ctx, c, qx, qy);
    ruinsBG(ctx, { px: c.x - 640, t: frozen ? 1.4 : lt });
    ruinTower(ctx);
    ruinWall(ctx);
    groceriesSlab(ctx, true);
    const dustAt = [[520, G2 - 120], [450, G2 - 60], [880, G2 - 90], [300, G2 - 160]];
    if (frozen) for (const [i, [dx, dy]] of dustAt.entries()) puffs(ctx, dx, dy, 0.35, { n: 4, spread: 30, seed: 40 + i, size: 16, rise: 0 });
    if (frozen) drawBird(ctx, 980, 120, 1.4, 1.6);
    drawHog(drawSonic, ctx, { x: 160, y: G2, dir: 1, ...HP.stand }, sonicMoves ? lt : 1.4, {
      expr: sonicMoves ? 'shock' : 'smirk',
      blink: sonicMoves ? 0 : 0.6,
      talk: speaking(lt, L8b, 'sonic'),
    });
    const saiInColour = lt > 8.2;
    if (!saiInColour) drawSai(ctx, z, frozen ? 1.4 : lt, {});
    if (frozen || k > 0) desaturate(ctx, k);
    if (saiInColour) drawSai(ctx, z, lt, { blink: blinkAt(lt, 3.3), talk: speaking(lt, L8b, 'saitama') });
    drawHog(drawShadow, ctx, sh, lt, { talk: speaking(lt, L8b, 'shadow'), carry: lt < 1.9 ? emeraldIn : null });
    if (lt > 1.1 && lt < 1.8) shock(ctx, TOWER_TOP[0], TOWER_TOP[1] - 110, prog(lt, 1.1, 1.8), 1600, { w: 30, col: '#7dffb0' });
    // stored hits wait in the air until time comes back, then go off where Saitama used to be
    for (const [t0, mx, my] of MARKS8) {
      if (lt > t0 && lt < 21.0) {
        const pulse = 1 + 0.15 * Math.sin(lt * 8 + t0);
        circle(ctx, mx, my, 16 * pulse, 'rgba(255,220,80,0.25)');
        star4(ctx, mx, my, 15 * pulse, t0, '#ffe066');
        star4(ctx, mx, my, 7 * pulse, t0 + 0.8, '#ffffff');
      }
      hitFx(ctx, mx, my, lt - 21.0 - (t0 - 3.8) * 0.12, 1.3, '#ffe066', t0 * 7);
    }
    if (lt > 21.0) puffs(ctx, ZX8b, G2, prog(lt, 21.0, 23.0), { n: 14, spread: 240, seed: 88, size: 34 });
    ctx.restore();
    if (lt > 1.2 && lt < 1.55) flash(ctx, 0.55 * (1 - prog(lt, 1.2, 1.55)), '#d8ffe6');
    if (frozen) {
      bigText(ctx, 'TIME STOPPED', 1130, 50, 22, { fill: '#7dffb0', stroke: INK, sw: 5, alpha: 0.85, face: FONT_D });
    }
    talk(ctx, lt, L8b, anchorsFor(c, [['shadow', ...hogTop(sh.x, sh.y)], ['sonic', ...hogTop(160, G2)], ['saitama', ...saiTop2(z.x, z.y, 1, z.dir)]]));
  },
});

/* ---------- 9. Rings Off ---------- */

const SX9 = 560;
const ZX9b = 860;

const SH9 = makeTrack([
  { t: 0, x: SX9, y: G2, dir: 1, ...HP.stand, ground: 1, expr: 'angry', rings: 1, aura: 0 },
  { t: 3.6, ...HP.stand },
  { t: 3.9, arms: [[0.65, 1.7], [0.95, 1.25]], lean: 0.05 },
  { t: 4.3, arms: [[0.65, 1.7], [0.7, 0.35]], e: E.out3 },
  { t: 4.6, arms: [[0.95, 1.25], [0.65, 1.7]] },
  { t: 5.1, arms: [[0.35, 0.4], [0.65, 1.7]], e: E.out3 },
  { t: 5.3, rings: 0 },
  { t: 5.6, ...HP.stand, arms: [[-0.5, 0.6], [-0.4, 0.7]], lean: -0.1 },
  { t: 7.0, aura: 1.4, ground: 0, y: G2 - 50, arms: [[-0.9, 0.3], [-0.8, 0.35]], hands: ['open', 'open'], lean: -0.15, e: E.out },
  { t: 15.6, aura: 1.5, y: G2 - 56 },
  { t: 16.0, arms: [[-1.4, 0.3], [-1.3, 0.3]], lean: -0.3 },
  { t: 18.0, aura: 2.2, arms: [[-1.6, 0.2], [-1.5, 0.2]], y: G2 - 66 },
]);

const SON9 = makeTrack([
  { t: 0, x: 300, y: G2, dir: 1, ...HP.stand, ground: 1, expr: 'smirk', fig8: false, carry: 0 },
  { t: 7.6, expr: 'shock', arms: [[1.1, 0.7], [1.3, 0.6]], hands: ['open', 'open'] },
  { t: 13.4, ...HP.stance, expr: 'determined', hands: ['fist', 'fist'] },
  { t: 13.6, fig8: true, ground: 0, lean: 0.45, arms: [[-1.5, 0.3], [-1.3, 0.4]], expr: 'grin' },
  { t: 14.05, x: 1400, e: E.in },
  { t: 14.06, dir: -1, fig8: false, ground: 1, ...HP.skid },
  { t: 14.2, x: 1430, carry: 1, ...HP.stand, arms: [[1.3, 1.2], [1.4, 1.1]] },
  { t: 14.25, fig8: true, ground: 0, lean: 0.45 },
  { t: 14.7, x: 1010, e: E.in },
  { t: 14.71, fig8: false, ground: 1, ...HP.skid, arms: [[1.3, 1.2], [1.4, 1.1]] },
  { t: 15.0, x: 990, ...HP.stand, arms: [[1.3, 1.2], [1.4, 1.1]], expr: 'grin', e: E.out3 },
  { t: 16.0, expr: 'shock' },
]);

const ZT9 = makeTrack([
  { t: 0, x: ZX9b, y: G2, dir: -1, ...ZP.stand, ground: 1, wind: 0.4 },
  { t: 7.0, wind: 1.0 },
  { t: 10.6, dir: 1, tilt: 0.05 },
  { t: 13.4, tilt: 0 },
  { t: 15.5, dir: -1, ...ZP.stand },
  { t: 16.0, ...ZP.ready, wind: 1.3 },
]);

const CAM9 = makeTrack([
  { t: 0, x: 560, y: 440, z: 1.45, r: 0 },
  { t: 3.6, x: 560, y: 440, z: 1.5, r: 0 },
  { t: 3.8, x: 560, y: 470, z: 2.0, r: 0.03, e: E.out3 },
  { t: 5.5, x: 560, y: 470, z: 2.05, r: 0.03 },
  { t: 5.7, x: 640, y: 420, z: 1.1, r: 0, e: E.out3 },
  { t: 7.4, x: 640, y: 410, z: 1.15, r: -0.02 },
  { t: 7.8, x: 330, y: 470, z: 1.6, r: 0.02, e: E.out3 },
  { t: 10.4, x: 330, y: 470, z: 1.6, r: 0.02 },
  { t: 10.6, x: 980, y: 440, z: 1.3, r: 0, e: E.out3 },
  { t: 11.5, x: 1200, y: 450, z: 1.25, r: 0 },
  { t: 13.2, x: 1150, y: 450, z: 1.2, r: 0 },
  { t: 13.6, x: 900, y: 430, z: 1.0, r: 0 },
  { t: 15.4, x: 800, y: 430, z: 1.0, r: 0 },
  { t: 15.6, x: 600, y: 400, z: 1.35, r: -0.03 },
  { t: 18.0, x: 590, y: 390, z: 1.6, r: 0.04 },
]);

const L9b = [
  [0.5, 3.4, 'shadow', 'Enough. You leave me no choice.'],
  [7.9, 10.4, 'sonic', 'Whoa, whoa! He took his rings off!'],
  [11.0, 13.2, 'saitama', 'Hold on. The groceries.'],
  [13.4, 14.4, 'sonic', "I got 'em!"],
  [15.8, 18.0, 'shadow', 'CHAOS...', { shout: true }],
];

scene({
  id: 'rings',
  name: 'Rings Off',
  dur: 18,
  fadeOut: 0.05,
  lines: L9b,
  music: [[0, 'tension'], [5.6, 'rival']],
  cues: [[4.5, 'clink'], [5.3, 'clink'], [4.9, 'clink'], [5.7, 'clink'], [5.6, 'charge'], [5.8, 'rumble'], [13.6, 'zip'], [14.2, 'pop'], [14.25, 'zip'], [14.7, 'skid'], [15.8, 'charge'], [16.2, 'rumble']],
  draw(ctx, lt) {
    const c = CAM9(lt);
    const sh = SH9(lt);
    const s = SON9(lt);
    const z = ZT9(lt);
    const [qx, qy] = shakeXY(lt, 4 * prog(lt, 5.6, 7) + 10 * prog(lt, 15.8, 18));
    ctx.save();
    camApply(ctx, c, qx, qy);
    ruinsBG(ctx, { px: c.x - 640, t: lt });
    ruinTower(ctx);
    ruinWall(ctx);
    groceriesSlab(ctx, s.carry < 0.5);
    if (lt > 5.8) cracks(ctx, SX9, G2 + 4, prog(lt, 5.8, 7), 21, 1.4);
    for (let i = 0; i < 5; i++) {
      const up = E.out(prog(lt, 6 + i * 0.3, 9 + i * 0.3)) * (60 + hash(i + 3) * 120);
      pebble(ctx, SX9 - 220 + i * 110, G2 - 6 - up + Math.sin(lt * 2 + i) * 5, 9 + hash(i) * 9, i + 90);
    }
    ringDrop(ctx, SX9 + 10, G2 - 70, lt - 4.4, 1);
    ringDrop(ctx, SX9 + 2, G2 - 70, lt - 5.2, 2);
    drawSai(ctx, z, lt, { blink: blinkAt(lt, 3.4), talk: speaking(lt, L9b, 'saitama'), expr: lt > 10.8 && lt < 13.4 ? 'annoyed' : 'ok' });
    if (lt > 15.6) {
      const r = 60 + 100 * E.in(prog(lt, 15.8, 18));
      const g = ctx.createRadialGradient(sh.x, sh.y - 80, 4, sh.x, sh.y - 80, r);
      g.addColorStop(0, 'rgba(255,240,240,0.9)');
      g.addColorStop(0.6, 'rgba(255,60,60,0.5)');
      g.addColorStop(1, 'rgba(200,0,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sh.x, sh.y - 80, r, 0, TAU);
      ctx.fill();
    }
    drawHog(drawShadow, ctx, sh, lt, { talk: speaking(lt, L9b, 'shadow'), blink: blinkAt(lt, 4, 2) });
    const carryBags = s.carry > 0.5 ? (g, hx, hy) => bagStack(g, hx + 6, hy - 70, lt, 3) : null;
    if (s.fig8) ghosts(3, 0.03, lt, (ta, al) => drawHog(drawSonic, ctx, SON9(ta), ta, { alpha: al }), 0.3);
    drawHog(drawSonic, ctx, s, lt, { talk: speaking(lt, L9b, 'sonic'), blink: blinkAt(lt, 3, 5), carry: carryBags });
    ctx.restore();
    talk(ctx, lt, L9b, anchorsFor(c, [['shadow', ...hogTop(sh.x, sh.y)], ['sonic', ...hogTop(s.x, s.y)], ['saitama', ...saiTop2(z.x, z.y, 1, z.dir)]]));
  },
});

/* ---------- 10. Chaos Blast ---------- */

function flatRuinsBG(ctx, px, t) {
  sky(ctx, 'haze');
  sunDisc(ctx, 980 - px * 0.95, 200, 54, '#fff8e0', 'rgba(255,220,170,');
  tile(ctx, BG.day[0], 300 - px * 0.9, RUIN_G - 70 - BG.day[0].height, 0.7);
  tile(ctx, BG.ruinFar, 500 - px * 0.8, RUIN_G - 40 - BG.ruinFar.height, 0.6);
  const g = ctx.createLinearGradient(0, RUIN_G - 20, 0, H + 200);
  g.addColorStop(0, '#9a8c86');
  g.addColorStop(1, '#594c4c');
  ctx.fillStyle = g;
  ctx.fillRect(-1500, RUIN_G - 20, W + 3000, H + 600);
  ell(ctx, SX9, RUIN_G + 20, 330, 46, 0, '#6e5450', 4);
  ell(ctx, SX9, RUIN_G + 26, 270, 32, 0, '#4f3a38', 0);
  for (let i = 0; i < 12; i++) pebble(ctx, SX9 - 300 + i * 55, RUIN_G + 2 + Math.sin(i * 2.3) * 12, 5 + hash(i) * 6, i + 120);
  for (let i = 0; i < 6; i++) {
    const x = 1000 + i * 120;
    ctx.fillStyle = '#7b6a68';
    ctx.fillRect(x, RUIN_G - 30 - hash(i) * 30, 30, 40);
  }
}

const L10b = [
  [0.0, 1.6, 'shadow', 'BLAAAST!', { shout: true }],
  [6.8, 9.2, 'shadow', 'Impossible...'],
  [9.6, 11.4, 'saitama', 'That was close.'],
  [11.8, 14.2, 'saitama', 'The eggs almost broke.'],
  [14.4, 16.6, 'sonic', 'The eggs... are fine!'],
];

fightScene({
  id: 'blast',
  name: 'Chaos Blast',
  dur: 17,
  fadeIn: 0.01,
  lines: L10b,
  holds: [[0.25, 0.32, 26, true]],
  music: [[0, 'none'], [6.4, 'tension'], [9.4, 'calm']],
  cues: [[0.2, 'bigboom'], [0.25, 'punch'], [1.0, 'rumble'], [2.4, 'rumble'], [11.9, 'pop'], [14.6, 'sparkle']],
  render(ctx, a, lt, hs) {
    const c = { x: 700, y: 430, z: a < 6 ? 1.1 : 1.15, r: a < 4 ? 0.02 * Math.sin(lt * 9) : 0 };
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + 14 * env(a, 0.3, 4.4, 0.6));
    const dome = 2200 * E.out(prog(a, 0.25, 2.0));
    const fade = prog(a, 3.6, 5.6);
    const zx = kf(a, [[0, 860], [0.3, 840, E.out3]]);
    const zst = { x: zx, y: G2, dir: -1, ...(a < 5 ? ZP.spread : ZP.stand), ground: 1, wind: a < 5 ? 2.2 : 0.5, torn: a > 3.6 ? 1 : 0 };
    const sh = a < 3.6 ? { x: SX9, y: G2 - 66, dir: 1, ...HP.stand, arms: [[-1.6, 0.2], [-1.5, 0.2]], ground: 0, aura: 2.4, rings: 0, expr: 'angry' } : { x: SX9, y: G2 + 6, dir: 1, ...HP.crouch, hipLift: -6, ground: 1, rings: 0, expr: a > 6.6 ? 'pain' : 'angry', lean: 0.3 };
    const sonicSt = { x: 990, y: G2, dir: -1, ...HP.stand, arms: [[1.3, 1.2], [1.4, 1.1]], expr: a < 7 ? 'wince' : a > 14.4 ? 'grin' : 'smirk', lean: a < 7 ? 0.25 : 0 };
    const actors = (g) => {
      drawHog(drawSonic, g, sonicSt, a, { talk: speaking(lt, L10b, 'sonic'), carry: (gg, hx, hy) => bagStack(gg, hx + 6, hy - 70, a, 3) });
      drawSai(g, zst, a, { blink: blinkAt(a, 3.3), talk: speaking(lt, L10b, 'saitama') });
      if (a < 3.6 || a > 5) drawHog(drawShadow, g, sh, a, { talk: speaking(lt, L10b, 'shadow') });
    };
    ctx.save();
    camApply(ctx, c, qx, qy);
    if (a < 3.6) {
      ruinsBG(ctx, { px: c.x - 640, t: lt });
      ruinTower(ctx);
      ruinWall(ctx);
    } else flatRuinsBG(ctx, c.x - 640, lt);
    if (a > 5) puffs(ctx, SX9, G2, prog(a, 4.0, 9.0), { n: 18, spread: 420, seed: 66, size: 60, rise: 90, color: '#c9b9b2', shade: '#a8958e' });
    actors(ctx);
    if (a < 5.5 && dome > 0) {
      const g = ctx.createRadialGradient(SX9, G2 - 80, dome * 0.2, SX9, G2 - 80, dome);
      g.addColorStop(0, `rgba(255,250,250,${0.95 * (1 - fade)})`);
      g.addColorStop(0.55, `rgba(255,70,70,${0.85 * (1 - fade)})`);
      g.addColorStop(1, `rgba(180,0,30,${0.6 * (1 - fade)})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(SX9, G2 - 80, dome, 0, TAU);
      ctx.fill();
      // Saitama holds his ground in front of Sonic and the groceries
      ctx.save();
      ctx.globalAlpha = 1 - fade;
      silhouetteCam(ctx, c, (g2) => {
        drawSai(g2, zst, a, {});
        drawHog(drawSonic, g2, sonicSt, a, {});
      }, '#2a0610');
      ctx.restore();
      for (let i = 0; i < 14; i++) {
        const life = (a * 1.4 + hash(i)) % 1;
        const y = 200 + hash(i * 3) * 400;
        streak(ctx, SX9 + life * 900, y, SX9 + life * 900 + 160, y, 1, '#ffd0c0', 4, 1);
      }
    }
    if (a > 14.5 && a < 16.6) for (let i = 0; i < 3; i++) star4(ctx, 1000 + i * 26, G2 - 230 + Math.sin(a * 6 + i) * 8, 10, a * 3, '#fff6b0');
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, c, actors, SX9, G2 - 80, lt);
    talk(ctx, lt, L10b, anchorsFor(c, [['shadow', ...hogTop(sh.x, sh.y)], ['sonic', ...hogTop(990, G2)], ['saitama', ...saiTop2(zx, G2, 1, -1)]]));
  },
});

// Silhouette of actors drawn through camera c, composited where they stand.
function silhouetteCam(ctx, c, drawFn, col) {
  if (!_ifc.c) _ifc.c = makeCanvas(W, H);
  const g = _ifc.c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.clearRect(0, 0, W, H);
  g.save();
  camApply(g, c);
  drawFn(g);
  g.restore();
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  // ctx currently carries the camera transform; draw the screen-space silhouette back through its inverse
  ctx.save();
  const m = ctx.getTransform();
  const dpr = Math.hypot(m.a, m.b) / (c.z || 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(_ifc.c, 0, 0);
  ctx.restore();
}

/* ---------- 11. Team Up (hand-keyed) ---------- */

const ZX11 = 860;
const ZHEAD11 = (x) => saiPoint(x, G2, 1, -1, ZP.stand, 'head');
const PALM11 = [[14.3, 975, 316], [14.4, 975, 330], [14.55, 988, 382], [14.7, 980, 330], [14.85, 992, 384], [15.0, 966, 318]];
const palmIK = (tx, ty) => saiReachIK(980, G2, 1, -1, ZP.stand, tx, ty);

const ST11 = makeTrack([
  { t: 0, x: 330, y: G2, dir: -1, ...HP.stand, ground: 1, rot: 0, ball: 0, spin: 0, expr: 'grin' },
  { t: 0.4, ...POSE.sonicThumb(), legs: HP.stand.legs, lean: 0.05 },
  { t: 3.4, ...HP.stand, hands: ['fist', 'fist'] },
  { t: 6.6, arms: [[-0.1, 0.3], [1.1, 0.4]], lean: 0.1 },
  { t: 7.0, arms: [[-0.1, 0.3], [1.5, 0.05]], lean: 0.18, e: E.out3 },
  { t: 7.2, arms: [[-0.1, 0.3], [1.3, 0.3]] },
  { t: 7.3, dir: 1, ...HP.stance, expr: 'determined' },
  { t: 7.6, ...HP.crouch, e: E.out3 },
  { t: 7.85, ...HP.tuck, ground: 0, y: G2 - 40, x: 360 },
  { t: 8.05, ball: 1, x: 600, y: 260, spin: 6, e: E.out },
  { t: 8.25, x: 860, y: 222, spin: 12 },
  { t: 8.45, x: 1000, y: 380, spin: 18 },
  { t: 8.6, x: 1080, y: G2, spin: 24, e: E.in },
  { t: 8.61, dir: -1 },
  { t: 9.0, spin: 70, x: 1084, e: E.in },
  { t: 9.28, x: 890, spin: 90, e: E.in },
  { t: 9.6, x: 1100, y: G2 - 90, spin: 104, e: E.out },
  { t: 9.9, x: 1120, y: G2, spin: 112, e: E.in },
  { t: 9.91, ball: 0, ...HP.dizzy, ground: 1, expr: 'dizzy' },
  { t: 10.4, ...HP.dizzy, lean: 0.12, headTilt: 0.15 },
  { t: 10.9, ...HP.dizzy, lean: -0.1, headTilt: -0.1 },
  { t: 12.2, ...HP.stand, arms: [[1.1, 0.7], [1.3, 0.6]], hands: ['open', 'open'], headTilt: 0, expr: 'shock' },
  { t: 13.3, ...HP.stance, hands: ['fist', 'fist'], expr: 'determined' },
  { t: 14.0, ...HP.crouch, e: E.out3 },
  { t: 14.05, ...HP.tuck, ground: 0, y: G2 - 60 },
  { t: 14.12, ball: 1, x: 1090, y: 380, spin: 4, e: E.out },
  { t: 14.25, x: 1050, y: 300, spin: 9 },
  { t: 14.4, x: 975, y: 330 - BR - 8 + BALL_UP, spin: 16, e: E.in },
  { t: 14.55, x: 990, y: G2 + 4, spin: 22, e: E.in },
  { t: 14.7, x: 980, y: 330 - BR - 6 + BALL_UP, spin: 28, e: E.out },
  { t: 14.85, x: 994, y: G2 + 4, spin: 34, e: E.in },
  { t: 15.0, x: 966, y: 318 - BR - 6 + BALL_UP, spin: 40, e: E.out },
  { t: 15.35, x: 690, y: G2 - 75 + BALL_UP, spin: 58, e: E.lin },
]);

const SH11 = makeTrack([
  { t: 0, x: 230, y: G2, dir: 1, ...HP.cross2, ground: 1, rot: 0, ball: 0, spin: 0, rings: 0, expr: 'scowl', jet: 0 },
  { t: 3.8, expr: 'smirk' },
  { t: 6.6, ...HP.stand, arms: [[-0.1, 0.3], [1.1, 0.4]] },
  { t: 7.0, arms: [[-0.1, 0.3], [1.5, 0.05]], lean: 0.18, e: E.out3 },
  { t: 7.2, arms: [[-0.1, 0.3], [1.3, 0.3]] },
  { t: 7.3, ...HP.stance, expr: 'determined' },
  { t: 7.6, ...HP.crouch, e: E.out3 },
  { t: 7.85, ball: 1, spin: 0 },
  { t: 9.0, spin: 70, x: 226, e: E.in },
  { t: 9.28, x: 830, spin: 90, e: E.in },
  { t: 9.6, x: 620, y: G2 - 90, spin: 104, e: E.out },
  { t: 9.9, x: 600, y: G2, spin: 112, e: E.in },
  { t: 9.91, ball: 0, ...HP.dizzy, ground: 1, expr: 'pain' },
  { t: 10.3, ...HP.stand, expr: 'angry', arms: [[-0.4, 0.4], [1.2, 0.5]], hands: ['fist', 'point'], lean: 0.1 },
  { t: 12.2, ...HP.stance, hands: ['fist', 'fist'] },
  { t: 13.0, x: 640, ...HP.stance },
  { t: 13.4, ...HP.windThrow, e: E.out3 },
  { t: 13.5, ...HP.throw, e: E.out3 },
  { t: 13.62, ...HP.windThrow, lean: -0.28, arms: [[0.4, 1.3], [-2.1, 0.6]] },
  { t: 13.75, ...HP.throw, arms: [[-0.9, 0.5], [1.4, 0.0]], lean: 0.3, e: E.out3 },
  { t: 13.86, ...HP.windThrow, lean: -0.22, arms: [[0.3, 1.2], [-1.8, 0.5]] },
  { t: 13.98, ...HP.throw, arms: [[-0.8, 0.6], [1.2, 0.1]], lean: 0.28, e: E.out3 },
  { t: 14.2, ...HP.stance, expr: 'smirk' },
  { t: 15.2, ...HP.stance, arms: [[1.5, 0.6], [1.4, 0.7]], hands: ['open', 'open'], expr: 'shock' },
  { t: 15.35, arms: [[1.6, 0.9], [1.5, 1.0]], e: E.out3 },
  { t: 15.9, ...HP.heels, arms: [[1.6, 0.9], [1.5, 1.0]], x: 520, e: E.out },
  { t: 16.0, ...HP.stand, arms: [[1.6, 0.9], [1.5, 1.0]], expr: 'smirk' },
  { t: 16.2, arms: [[1.6, 0.15], [1.5, 0.15]], lean: -0.1 },
  { t: 16.4, dir: -1, lean: -0.15 },
  { t: 16.6, dir: 1, lean: -0.2 },
  { t: 16.8, dir: -1, lean: -0.2 },
  { t: 17.0, dir: 1, ...HP.throw, arms: [[-0.8, 0.6], [1.7, 0.05]], expr: 'determined', e: E.out3 },
  { t: 17.4, ...HP.stance, expr: 'smirk' },
  { t: 18.05, expr: 'shock' },
  { t: 18.1, ...HP.recoil, ground: 0, y: G2 - 20, rot: 0 },
  { t: 18.4, x: 620, y: G2 - 110, rot: 2.6, ...HP.tuck, e: E.out },
  { t: 18.7, x: 710, y: G2, rot: TAU, ...HP.land, ground: 1, expr: 'pain', e: E.in },
  { t: 18.701, rot: 0 },
  { t: 19.2, ...HP.stand, dir: -1, expr: 'angry', arms: [[-0.4, 0.4], [1.2, 0.5]], hands: ['fist', 'point'] },
  { t: 20.1, ...HP.skate, ground: 0.6, jet: 1, hands: ['fist', 'fist'] },
  { t: 20.9, x: 340, ...HP.skid, ground: 1, jet: 0.3, e: E.out },
  { t: 21.0, dir: 1, ...HP.stance, jet: 0, expr: 'determined' },
  { t: 21.3, headTilt: 0.2 },
  { t: 21.45, headTilt: 0 },
  { t: 21.8, ...HP.crouch },
]);

const SON11B = makeTrack([
  { t: 18.1, x: 476, y: G2 - 41 + BALL_UP, ball: 1, spin: 0, dir: 1, ...HP.stand },
  { t: 18.45, x: 430, y: G2 - 120, spin: 10, e: E.out },
  { t: 18.8, x: 400, y: G2, spin: 18, e: E.in },
  { t: 18.81, ball: 0, ...POSE.sonicSit(), expr: 'dizzy' },
  { t: 19.6, ...POSE.sonicSit(), expr: 'dizzy' },
  { t: 19.9, ...HP.stand, ground: 1, air: false, hipLift: 0, x: 420, expr: 'sheepish' },
  { t: 21.0, ...HP.stand, headTilt: -0.1, expr: 'determined' },
  { t: 21.3, headTilt: 0.2 },
  { t: 21.45, headTilt: 0 },
  { t: 21.6, ...HP.stance },
  { t: 21.8, ...HP.crouch },
]);

const ZT11 = makeTrack([
  { t: 0, x: ZX11, y: G2, dir: -1, ...ZP.stand, ground: 1, wind: 0.4, torn: 1 },
  { t: 9.0, ...ZP.stand },
  { t: 9.12, ...ZP.hop, ground: 0, y: G2 - 120, e: E.out },
  { t: 9.3, y: G2 - 140, e: E.out },
  { t: 9.62, ...ZP.stand, ground: 1, y: G2, e: E.in },
  { t: 13.5, ...ZP.stand },
  { t: 13.59, x: 880, legs: [[0.25, -0.05], [-0.15, -0.3]] },
  { t: 13.68, x: 900, ...ZP.stand },
  { t: 13.83, x: 920, legs: [[0.25, -0.05], [-0.15, -0.3]] },
  { t: 13.92, x: 940, ...ZP.stand },
  { t: 14.04, ...ZP.hop, ground: 0, y: G2 - 34, x: 960, e: E.out },
  { t: 14.16, ...ZP.stand, ground: 1, y: G2, x: 980, e: E.in },
  ...PALM11.map(([t, px, py], i) => ({ t, arms: [[-0.05, 0.12], palmIK(px, py)], hands: ['fist', i === PALM11.length - 1 ? 'open' : 'open'], e: i % 2 ? E.out : E.in })),
  { t: 15.15, arms: [[-0.05, 0.12], palmIK(930, 300)], e: E.out3 },
  { t: 15.4, ...ZP.stand, hands: ['fist', 'fist'] },
  { t: 17.05, ...ZP.stand },
  { t: 17.15, ...ZP.dodgeBack, e: E.out3 },
  { t: 17.35, ...ZP.stand },
  { t: 24.4, ...ZP.stand },
  { t: 24.8, ...ZP.ready },
]);

// The Sonic ball after Shadow catches it: held, swung, thrown, boomeranged into Shadow's back.
function sonic11(a) {
  if (a < 15.35) return ST11(a);
  if (a >= 18.1) return SON11B(a);
  const sh = SH11(a);
  const base = { dir: 1, ball: 1, ground: 1, legs: HP.stand.legs, arms: HP.stand.arms };
  if (a < 16.2) {
    const h = hogPoint(sh.x, sh.y, HS, sh.dir, sh, 'hand');
    return { ...base, x: h[0] + sh.dir * 26, y: h[1] + BALL_UP, spin: 58 + a * 4 };
  }
  if (a < 17.0) {
    const th = (a - 16.2) * Math.PI * 2.5;
    return { ...base, x: sh.x + Math.cos(th) * 70, y: G2 - 70 + Math.sin(th) * 18 + BALL_UP, spin: a * 30 };
  }
  if (a < 17.4) {
    const u = (a - 17.0) / 0.4;
    return { ...base, x: lerp(sh.x + 70, 1700, u), y: lerp(G2 - 70, G2 - 160, u) + BALL_UP, spin: a * 40 };
  }
  const u = E.in((a - 17.4) / 0.7);
  return { ...base, x: lerp(-400, 476, u), y: G2 - 41 + BALL_UP, spin: a * 40 };
}

function helix11(a) {
  const launch = E.in(prog(a, 25.0, 25.4));
  const cx = lerp(lerp(390, 520, prog(a, 22.2, 25.0)), 860, launch);
  const th = integ([[22.2, 4], [24, 32], [25.4, 40]], a);
  const cy = G2 - 70;
  return { cx, cy, th, s: [cx + Math.cos(th) * 42, cy + Math.sin(th) * 16], h: [cx - Math.cos(th) * 42, cy - Math.sin(th) * 16] };
}

function drawHelix(ctx, a, slow = 1) {
  const hx = helix11(a);
  const trailS = [];
  const trailH = [];
  for (let k = 0; k < 10; k++) {
    const p = helix11(a - k * 0.02 * slow);
    trailS.push(p.s);
    trailH.push(p.h);
  }
  smear(ctx, trailS, '#4f8cff', 26);
  smear(ctx, trailH, '#ff3b4a', 26);
  const front = Math.sin(hx.th) > 0;
  const drawS = () => drawSonic(ctx, hx.s[0], hx.s[1] + BALL_UP, HS, 1, { ball: 1, spin: a * 40, t: a });
  const drawH = () => drawShadow(ctx, hx.h[0], hx.h[1] + BALL_UP, HS, 1, { ball: 1, spin: a * 40, t: a, aura: 0.8 });
  if (front) {
    drawH();
    drawS();
  } else {
    drawS();
    drawH();
  }
  return hx;
}

const SPEAR11 = [[13.5, 13.66, [700, 520], [880, G2 - 10]], [13.75, 13.9, [700, 520], [920, G2 - 10]], [13.98, 14.12, [700, 520], [962, G2 - 8]]];

const CAM11 = makeTrack([
  { t: 0, x: 280, y: 470, z: 1.6, r: 0 },
  { t: 6.4, x: 290, y: 470, z: 1.65, r: 0 },
  { t: 6.6, x: 290, y: 460, z: 1.9, r: 0.03, e: E.out3 },
  { t: 7.3, x: 290, y: 460, z: 1.9, r: 0.03 },
  { t: 7.6, x: 560, y: 420, z: 1.05, r: 0, e: E.out3 },
  { t: 8.25, x: 700, y: 380, z: 1.05, r: -0.02 },
  { t: 8.9, x: 660, y: 420, z: 1.05, r: 0 },
  { t: 9.2, x: 860, y: 440, z: 1.3, r: 0.03 },
  { t: 9.3, x: 860, y: 450, z: 1.6, r: -0.05, e: E.out3 },
  { t: 9.9, x: 860, y: 430, z: 1.05, r: 0 },
  { t: 10.2, x: 620, y: 460, z: 1.6, r: 0.02, e: E.out3 },
  { t: 12.2, x: 630, y: 460, z: 1.6, r: 0.02 },
  { t: 12.3, x: 1110, y: 470, z: 1.6, r: -0.02, e: E.out3 },
  { t: 13.2, x: 1110, y: 470, z: 1.6, r: -0.02 },
  { t: 13.4, x: 800, y: 430, z: 1.1, r: 0, e: E.out3 },
  { t: 14.2, x: 900, y: 420, z: 1.2, r: 0 },
  { t: 14.4, x: 960, y: 400, z: 1.45, r: 0.04, e: E.out3 },
  { t: 15.0, x: 950, y: 410, z: 1.4, r: -0.03 },
  { t: 15.35, x: 680, y: 450, z: 1.4, r: 0.03, e: E.out },
  { t: 16.0, x: 560, y: 450, z: 1.35, r: 0 },
  { t: 17.0, x: 600, y: 440, z: 1.2, r: 0 },
  { t: 17.4, x: 760, y: 430, z: 1.05, r: 0 },
  { t: 18.0, x: 540, y: 440, z: 1.2, r: 0 },
  { t: 18.1, x: 520, y: 440, z: 1.5, r: 0.05, e: E.out3 },
  { t: 18.8, x: 580, y: 440, z: 1.2, r: 0 },
  { t: 20.9, x: 480, y: 440, z: 1.15, r: 0 },
  { t: 21.0, x: 380, y: 470, z: 1.6, r: 0, e: E.out3 },
  { t: 22.2, x: 400, y: 460, z: 1.5, r: 0.03 },
  { t: 24.6, x: 520, y: 440, z: 1.35, r: -0.04 },
  { t: 25.4, x: 700, y: 430, z: 1.2, r: 0 },
]);

const L11b = [
  [0.4, 3.4, 'sonic', 'Hey, Shadow. Truce? Two on one?'],
  [3.8, 6.4, 'shadow', '...Just this once, Faker.'],
  [10.2, 12.2, 'shadow', "Watch where you're going, Faker!"],
  [12.3, 13.2, 'sonic', 'ME?!', { shout: true }],
  [18.9, 20.0, 'shadow', 'FAKER!', { shout: true }],
  [20.0, 20.9, 'sonic', 'Sorry!!'],
  [23.4, 25.3, 'duo', 'DOUBLE BOOST!', { shout: true }],
];

fightScene({
  id: 'teamup',
  name: 'Team Up',
  dur: 25.4,
  fadeOut: 0.05,
  lines: L11b,
  holds: [[7.0, 0.06, 4], [9.28, 0.16, 16, true], [14.4, 0.06, 6], [15.35, 0.08, 8], [18.1, 0.12, 12, true]],
  music: [[0, 'calm'], [7.6, 'fight'], [10.0, 'none'], [13.4, 'fight'], [18.9, 'none'], [21.0, 'epic']],
  cues: [
    [7.0, 'clink'], [7.85, 'whoosh'], [7.9, 'rev'], [8.6, 'rev'], [9.0, 'zip'], [9.1, 'whoosh'], [9.28, 'punch'], [9.29, 'boom'], [9.9, 'thud'], [10.0, 'twinkle'],
    [13.5, 'spear'], [13.75, 'spear'], [13.98, 'spear'], [14.4, 'boing'], [14.55, 'thud'], [14.7, 'boing'], [14.85, 'thud'], [15.0, 'boing'], [15.35, 'hit'], [15.4, 'skid'],
    [16.2, 'whoosh'], [16.6, 'whoosh'], [17.0, 'zip'], [17.0, 'jet'], [17.15, 'miss'], [17.6, 'whoosh'], [18.1, 'punch'], [18.15, 'hit'], [20.1, 'jet'],
    [21.8, 'rev'], [22.2, 'charge'], [23.0, 'rev'], [24.0, 'transform'],
  ],
  render(ctx, a, lt, hs) {
    const c = CAM11(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + 5 * prog(a, 22.2, 25.4));
    const s = sonic11(a);
    const sh = SH11(a);
    const z = ZT11(a);
    const helixOn = a > 22.2;
    const actors = (g) => {
      drawBag(g, 110, G2 - 60, 1);
      drawBag(g, 150, G2 - 60, 0.95, 0.08);
      drawSai(g, z, a, { expr: a > 14.35 && a < 15.1 ? 'happy' : 'ok', blink: blinkAt(a, 3.4, 6), talk: speaking(lt, L11b, 'saitama') });
      if (helixOn) {
        drawHelix(g, a);
        return;
      }
      const fastS = s.ball && (a > 9 || a < 8.7);
      if (fastS) ghosts(3, 0.025, a, (ta, al) => drawHog(drawSonic, g, sonic11(ta), ta, { alpha: al }), 0.28);
      if (sh.ball || sh.jet > 0.5) ghosts(3, 0.025, a, (ta, al) => drawHog(drawShadow, g, SH11(ta), ta, { alpha: al }), 0.28);
      drawHog(drawShadow, g, sh, a, { talk: speaking(lt, L11b, 'shadow'), blink: blinkAt(a, 4, 9) });
      drawHog(drawSonic, g, s, a, { talk: speaking(lt, L11b, 'sonic'), blink: blinkAt(a, 3, 12) });
    };
    ctx.save();
    camApply(ctx, c, qx, qy);
    flatRuinsBG(ctx, c.x - 640, lt);
    if (helixOn) actionBackdrop(ctx, lt, { x: helix11(a).cx, y: G2 - 70, a: prog(a, 22.4, 23.2) * 0.85, c0: '#ffffff', c1: '#8a6cff', c2: '#2a0d3a', lines: '#ffd6f0' });
    actors(ctx);
    for (const [t0, t1, from, to] of SPEAR11) {
      const rot = Math.atan2(to[1] - from[1], to[0] - from[0]);
      if (a > t0 && a < t1) {
        const u = (a - t0) / (t1 - t0);
        chaosSpear(ctx, lerp(from[0], to[0], u), lerp(from[1], to[1], u), rot, 1);
      }
      if (a >= t1) {
        chaosSpear(ctx, to[0], to[1], rot, 1, 1 - prog(a, t1 + 0.3, t1 + 1.2));
        hitFx(ctx, to[0], to[1], lt - realT(t1, hs), 0.6, '#ffe066', t0 * 9);
      }
    }
    hitFx(ctx, 290, G2 - 100, lt - realT(7.0, hs), 0.4, '#ffffff', 2);
    hitFx(ctx, 860, G2 - 34, lt - realT(9.28, hs), 1.5, '#d8b4ff', 3);
    if (a > 9.9 && a < 11) {
      for (const [ox, n] of [[1120, 0], [600, 1]]) {
        for (let i = 0; i < 3; i++) {
          const ang = a * 5 + (i * TAU) / 3 + n;
          star4(ctx, ox + 10 + Math.cos(ang) * 40, G2 - 160 + Math.sin(ang) * 10, 8, a * 3, '#ffe066');
        }
      }
    }
    for (const [t, px, py] of PALM11.slice(1)) hitFx(ctx, px, py < G2 - 100 ? py - 20 : G2 - 4, lt - realT(t, hs), 0.3, '#ffffff', t * 5);
    hitFx(ctx, 680, G2 - 75, lt - realT(15.35, hs), 0.7, '#ffffff', 6);
    hitFx(ctx, 480, G2 - 80, lt - realT(18.1, hs), 1.1, '#ff9a6a', 7);
    if (a > 17.0 && a < 18.1) {
      const pts = [];
      for (let k = 0; k < 8; k++) {
        const p = sonic11(a - k * 0.02);
        pts.push([p.x, p.y - BALL_UP]);
      }
      smear(ctx, pts, '#ff5a3a', 22);
    }
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, c, actors, fr.h.a === 9.28 ? 860 : 480, G2 - 60, lt);
    const hx = helixOn ? helix11(a) : null;
    talk(ctx, lt, L11b, anchorsFor(c, [['shadow', ...hogTop(sh.x, sh.y)], ['sonic', ...hogTop(s.x, s.y)], ['duo', hx ? hx.cx : 400, G2 - 150]]));
  },
});

/* ---------- 12. Consecutive Normal Punches ---------- */

const ZX12 = 980;
// Every punch in the barrage gets its own target, so no two jabs land the same way.
const BARRAGE12 = Array.from({ length: 50 }, (_, i) => {
  const t = 4.4 + i * 0.072;
  const tx = ZX12 - 108 - hash(i * 2.3) * 26;
  const ty = G2 - 110 - hash(i * 5.1) * 90;
  return { t, tx, ty, far: i % 2 === 1 };
});
const READY12 = { ...ZP.ready };
const ZT12 = makeTrack([
  { t: 0, x: ZX12, y: G2, dir: -1, ...ZP.ready, ground: 1, wind: 0.6, torn: 1, tilt: 0 },
  { t: 4.3, ...ZP.ready },
  ...BARRAGE12.flatMap((p) => {
    const ik = saiReachIK(ZX12, G2, 1, -1, READY12, p.tx, p.ty, p.far);
    const arms = p.far ? [ik, READY12.arms[1]] : [READY12.arms[0], ik];
    return [
      { t: p.t, ...READY12, arms, lean: 0.12 + hash(p.t) * 0.06, e: E.out3 },
      { t: p.t + 0.04, ...READY12, lean: 0.06 },
    ];
  }),
  { t: 7.75, ...ZP.windup, e: E.out },
  { t: 8.0, ...ZP.punch, lean: 0.22, e: E.out3 },
  { t: 8.6, ...ZP.punch, lean: 0.18 },
  { t: 9.2, ...ZP.stand, tilt: 0 },
  { t: 9.8, tilt: -0.3 },
  { t: 12.0, tilt: -0.3 },
  { t: 12.4, tilt: 0 },
  { t: 14.5, tilt: 0 },
  { t: 14.7, dir: 1 },
]);

const L12b = [
  [0.2, 2.4, 'saitama', 'Okay. Lunch is getting cold.'],
  [9.8, 11.4, 'saitama', 'Oops.'],
  [16.0, 18.8, 'sonic', 'Best... fight... ever...', { at: [1110, 330] }],
  [19.0, 20.2, 'shadow', '...Hmph.', { at: [1220, 340] }],
  [20.4, 22.0, 'saitama', 'Lunch?'],
];

fightScene({
  id: 'cnp',
  name: 'Consecutive Normal Punches',
  dur: 22.5,
  fadeIn: 0.05,
  lines: L12b,
  holds: [[5.0, 0.08, 14, true], [6.6, 0.08, 14, true], [8.0, 0.3, 26, true]],
  music: [[0, 'epic'], [2.4, 'none'], [4.4, 'fight'], [8.3, 'none'], [12, 'none'], [20.2, 'happy']],
  cues: [[2.4, 'sting'], [2.9, 'punch'], ...BARRAGE12.map((p) => [p.t, 'hit']), [8.0, 'bigboom'], [8.05, 'punch'], [9.6, 'twinkle'], [9.75, 'twinkle'], [12.0, 'fall'], [14.6, 'thud'], [14.62, 'boom'], [15.0, 'thud']],
  render(ctx, a, lt, hs) {
    const c = a < 2.4 ? { x: 760, y: 430, z: 1.15 + a * 0.04, r: 0 } : a < 8.6 ? { x: 790, y: 420, z: 1.3, r: 0.02 * Math.sin(a * 7) } : { x: 760, y: 410, z: 1.05, r: 0 };
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + (a > 4.4 && a < 8 ? 6 : 0));
    const z = ZT12(a);
    const slow = a < 2.4 ? 0.12 : 1;
    const push = a < 4.4 ? 0 : -60 * prog(a, 4.4, 8.0);
    const approach = a < 2.4 ? lerp(520, 700, a / 2.4) : 700;
    const split = a > 6.8;
    const fly = prog(a, 8.0, 9.4);
    const actors = (g) => {
      drawSai(g, z, a, { expr: a > 20.2 ? 'happy' : 'ok', blink: blinkAt(a, 3.4, 2), talk: speaking(lt, L12b, 'saitama') });
      if (a < 6.8) {
        const th = a * (a < 2.4 ? 6 : 30);
        const cx = approach + push;
        const sP = [cx + Math.cos(th) * 42, G2 - 70 + Math.sin(th) * 16];
        const hP = [cx - Math.cos(th) * 42, G2 - 70 - Math.sin(th) * 16];
        drawShadow(g, hP[0], hP[1] + BALL_UP, HS, 1, { ball: 1, spin: th, t: a, aura: 0.8 });
        drawSonic(g, sP[0], sP[1] + BALL_UP, HS, 1, { ball: 1, spin: th, t: a });
      } else if (a < 9.4) {
        const jit = (k) => Math.sin(a * 60 + k) * 4;
        const k = E.out(fly);
        const sx = lerp(640 + jit(1), 160, k);
        const sy = lerp(G2 - 40, -60, k);
        const hx = lerp(590 + jit(2), 230, k);
        const hy = lerp(G2 - 30, -40, k);
        const sc = lerp(HS, 0.15, k);
        drawSonic(g, sx, sy, sc, 1, { ...HP.recoil, air: true, rot: -a * (fly > 0 ? 9 : 0), expr: 'wince', t: a });
        drawShadow(g, hx, hy, sc, 1, { ...HP.recoil, air: true, rot: -a * (fly > 0 ? 8 : 0), expr: 'pain', t: a, rings: 0 });
      }
    };
    ctx.save();
    camApply(ctx, c, qx, qy);
    flatRuinsBG(ctx, c.x - 640, lt);
    if (a < 2.4) speedLines(ctx, a * 0.2, { n: 20, alpha: 0.3, y0: 300, y1: 600, speed: 2000 });
    if (a > 4.4 && a < 8.3) actionBackdrop(ctx, lt, { x: 700, y: G2 - 110, a: 0.75 * prog(a, 4.4, 4.7), c0: '#fffbe8', c1: '#ffcf3a', c2: '#a8320f', lines: '#ffffff' });
    // the rubble pile they come down in, legs up
    if (a > 14.6) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-1500, -1500, W + 3000, G2 - 52 + 1500);
      ctx.clip();
      const kick = Math.sin(a * 13);
      drawSonic(ctx, 1110, G2 - 120, HS, 1, { air: true, rot: Math.PI, legs: [[0.5 * kick, -0.5], [-0.5 * kick, -0.5]], t: a });
      if (a > 15.0) drawShadow(ctx, 1210, G2 - 116, HS, 1, { air: true, rot: Math.PI, legs: [[-0.4 * kick, -0.4], [0.4 * kick, -0.4]], t: a, rings: 0 });
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(1050, G2 + 6);
      ctx.quadraticCurveTo(1160, G2 - 110, 1290, G2 + 6);
      ctx.closePath();
      ctx.fillStyle = '#958e9f';
      ctx.fill();
      strokeNow(ctx, 3.5, INK);
      for (let i = 0; i < 9; i++) {
        const rx = 1080 + i * 22 + hash(i) * 10;
        const ry = G2 - 10 - Math.sin(((rx - 1050) / 240) * Math.PI) * 50 + hash(i + 4) * 14;
        poly(ctx, [[rx - 14, ry + 8], [rx - 6, ry - 10], [rx + 10, ry - 8], [rx + 14, ry + 8]], i % 2 ? '#8a8494' : '#a39dab', 2.2);
      }
      puffs(ctx, 1150, G2 - 20, prog(a, 14.6, 16.4), { n: 12, spread: 200, seed: 55, size: 30 });
    }
    if (a > 12 && a < 15) {
      const u = prog(a, 12, 14.6);
      circle(ctx, lerp(160, 1110, u), lerp(-60, G2 - 60, u * u), 6, '#2463eb');
      const u2 = prog(a, 12.3, 15.0);
      circle(ctx, lerp(230, 1210, u2), lerp(-40, G2 - 60, u2 * u2), 6, '#2a2731');
    }
    actors(ctx);
    // the barrage itself: fists everywhere in front of him
    if (a > 4.4 && a < 8.3) {
      const shoulder = saiPoint(ZX12, G2, 1, -1, READY12, 'chest');
      const fr = Math.floor(lt * 24);
      for (let i = 0; i < 26; i++) {
        const seed = fr * 31 + i;
        const ang = Math.PI + (hash(seed) - 0.5) * 0.9;
        const d = 70 + hash(seed + 1) * 150;
        const fx = shoulder[0] + Math.cos(ang) * d;
        const fy = shoulder[1] + Math.sin(ang) * d * 0.8 + 20;
        drawFist(ctx, fx, fy, 0.75 + hash(seed + 2) * 0.35, ang, 0.35 + hash(seed + 3) * 0.55);
      }
      for (let i = 0; i < 5; i++) {
        const seed = fr * 7 + i;
        sparks(ctx, approach + push + 40 + hash(seed) * 40, G2 - 110 + hash(seed + 1) * 90, 0.3, { n: 6, len: 60, seed });
      }
    }
    if (a > 7.75) {
      const fp = saiPoint(z.x, z.y, 1, -1, z, 'hand');
      if (a > 7.95 && a < 8.5) drawFist(ctx, fp[0] - 40, fp[1], 2.4, Math.PI, 1 - prog(a, 8.2, 8.5));
      hitFx(ctx, fp[0] - 80, fp[1], lt - realT(8.0, hs), 2.2, '#ffe27a', 9);
    }
    if (a > 9.5 && a < 11) {
      star4(ctx, 180, 70, 22 * env(a, 9.5, 11, 0.2), a * 4, '#ffffff');
      star4(ctx, 240, 96, 18 * env(a, 9.65, 11, 0.2), -a * 4, '#ffffff');
    }
    ctx.restore();
    if (a > 2.4 && a < 4.4) {
      focusLines(ctx, 640, 360, lt, { alpha: 0.6, r0: 300 });
      const s1 = slam(a - 2.4);
      bigText(ctx, 'CONSECUTIVE', 640, 300, 110, { fill: '#ffd21f', stroke: INK, sw: 16, scale: s1.s, alpha: s1.a * (1 - prog(a, 4.1, 4.4)), shadow: '#e3262f', rot: -0.04, maxW: 1100 });
      const s2 = slam(a - 2.9);
      if (s2) bigText(ctx, 'NORMAL PUNCHES', 640, 430, 100, { fill: '#ffffff', stroke: INK, sw: 16, scale: s2.s, alpha: s2.a * (1 - prog(a, 4.1, 4.4)), shadow: '#e3262f', rot: 0.03, maxW: 1100 });
    }
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, c, actors, 700, G2 - 100, lt);
    talk(ctx, lt, L12b, anchorsFor(c, [['saitama', ...saiTop2(z.x, z.y, 1, z.dir)]]));
  },
});

/* ---------- 13. Hot Pot ---------- */

const L13b = [
  [1.0, 4.0, 'saitama', 'Dig in. Cabbage hot pot.'],
  [4.4, 7.0, 'sonic', 'Mmm! This is AMAZING!'],
  [7.4, 11.4, 'shadow', "I don't need food. I am the Ultimate Lifeform."],
  [13.4, 15.4, 'sonic', '...Ultimate Lifeform, huh?'],
  [15.8, 19.6, 'shadow', '...This cabbage is acceptable.'],
  [20.0, 23.6, 'sonic', 'Rematch next week? Three-way?'],
  [24.0, 27.8, 'saitama', 'Sure. Shadow buys the groceries.'],
  [28.2, 30.0, 'shadow', 'Hmph.'],
  [30.4, 33.6, 'saitama', '...And bring eggs.'],
];

const bowlIn = (ctx, hx, hy) => {
  ell(ctx, hx + 4, hy - 6, 20, 9, 0, '#f4f1e8', 2.5);
  ell(ctx, hx + 4, hy - 9, 15, 5, 0, '#e3c47f', 0);
};

const CAM13 = makeTrack([
  { t: 0, x: 640, y: 420, z: 1.05, r: 0 },
  { t: 4.2, x: 640, y: 420, z: 1.08, r: 0 },
  { t: 4.4, x: 430, y: 470, z: 1.6, r: 0.02, e: E.out3 },
  { t: 7.2, x: 430, y: 470, z: 1.62, r: 0.02 },
  { t: 7.4, x: 860, y: 470, z: 1.6, r: -0.02, e: E.out3 },
  { t: 13.2, x: 860, y: 470, z: 1.68, r: -0.02 },
  { t: 13.4, x: 640, y: 440, z: 1.15, r: 0, e: E.out3 },
  { t: 15.6, x: 640, y: 440, z: 1.15, r: 0 },
  { t: 15.8, x: 860, y: 470, z: 1.65, r: -0.02, e: E.out3 },
  { t: 19.8, x: 860, y: 470, z: 1.65, r: -0.02 },
  { t: 20.0, x: 640, y: 430, z: 1.05, r: 0, e: E.out3 },
  { t: 36, x: 640, y: 420, z: 1.1, r: 0 },
]);

scene({
  id: 'hotpot',
  name: 'Hot Pot',
  dur: 36,
  fadeOut: 1.4,
  lines: L13b,
  music: [[0, 'calm']],
  cues: [[11.6, 'growl'], [16.2, 'sparkle'], [28.3, 'pop']],
  draw(ctx, lt) {
    const c = CAM13(lt);
    ctx.save();
    camApply(ctx, c);
    apartmentRoom(ctx, lt);
    const eatS = lt < 4.4 || (lt > 7 && lt < 13) || lt > 23.6;
    drawSonic(ctx, 400, 624, 1.04, 1, {
      t: lt,
      ...HP.stand,
      arms: [[0.3, 0.6], eatS ? [1.5, 1.9 + Math.sin(lt * 3) * 0.1] : [1.2, 1.2]],
      expr: lt > 4.4 && lt < 7 ? 'happy' : lt > 13.2 && lt < 15.6 ? 'grin' : 'smirk',
      talk: speaking(lt, L13b, 'sonic'),
      blink: blinkAt(lt, 3, 3),
      carry: bowlIn,
    });
    const eatH = lt > 15.6;
    drawShadow(ctx, 885, 624, 1.04, -1, {
      t: lt,
      ...(eatH ? { ...HP.stand, arms: [[0.3, 0.6], [1.4, 1.9 + Math.sin(lt * 2.4) * 0.08]] } : HP.cross2),
      expr: lt > 7.4 && lt < 11.6 ? 'closed' : lt > 11.6 && lt < 13.4 ? 'shock' : eatH ? (lt > 28 && lt < 30 ? 'smile' : 'calm') : 'scowl',
      talk: speaking(lt, L13b, 'shadow'),
      carry: eatH ? bowlIn : null,
      rings: 1,
    });
    drawSaitama(ctx, 640, 672, 1, -1, {
      t: lt,
      arms: [[0.4, 0.8], [1.3, 1.6]],
      hands: ['fist', 'open'],
      expr: lt > 24 && lt < 27.8 ? 'ok' : 'happy',
      talk: speaking(lt, L13b, 'saitama'),
      wind: 0.1,
      torn: 1,
    });
    hotPotTable(ctx, lt);
    ctx.beginPath();
    rr(ctx, 330, 590, 620, 130, 16);
    ctx.fillStyle = '#c0504d';
    ctx.fill();
    strokeNow(ctx, 4, INK);
    ctx.strokeStyle = '#a63e3b';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(360 + i * 100, 600);
      ctx.lineTo(360 + i * 100, 712);
      ctx.stroke();
    }
    if (lt > 15.8 && lt < 19.6) {
      ctx.fillStyle = 'rgba(255,120,140,0.5)';
      ell(ctx, 902, 512, 10, 5, 0, 'rgba(255,120,140,0.55)', 0);
    }
    ctx.restore();
    sfx(ctx, 'GRRRUMBLE', 900, 300, 54, lt, 11.6, 1.8, { fill: '#ffffff', rot: 0.08 });
    talk(ctx, lt, L13b, anchorsFor(c, [['sonic', 400, 430], ['shadow', 885, 430], ['saitama', 645, 420]]));
  },
});

/* ---------- 14. Credits ---------- */

const CREDITS2 = [
  [2.0, 'SONIC vs ONE PUNCH MAN: ROUND 2', 32, '#ffffff', FONT_D],
  [3.6, 'Featuring Shadow the Hedgehog, uninvited', 26, '#ffb0b0', FONT_T],
  [5.0, 'Every fight hand-keyed, pose by pose', 24, '#d9d3ea', FONT_T],
  [6.2, 'Sonic and Shadow belong to SEGA', 22, '#9fbaff', FONT_T],
  [7.2, 'One-Punch Man belongs to ONE and Yusuke Murata', 22, '#ffe27a', FONT_T],
  [8.2, 'Made for fun. Not affiliated with either.', 22, '#d9d3ea', FONT_T],
  [9.8, 'Thanks for watching!', 40, '#ffd21f', FONT_D],
];

scene({
  id: 'credits2',
  name: 'Credits',
  dur: 27,
  fadeOut: 1.6,
  lines: [
    [17.6, 20.6, 'narrator', 'Meanwhile, in orbit...'],
    [21.2, 25.2, 'crab', '...I HATE CITY Z.', { shout: true, at: [700, 300] }],
  ],
  music: [[0, 'happy'], [16.4, 'none']],
  cues: [[0.6, 'punch'], [9.8, 'sparkle'], [21.2, 'twinkle']],
  draw(ctx, lt) {
    if (lt < 16.6) {
      sky(ctx, 'night');
      stars(ctx, lt);
      moon(ctx, 1120, 100, 38);
      const s = slam(lt - 0.6);
      if (s) bigText(ctx, 'THE END', 640, 100, 100, { fill: '#ff2a3a', stroke: INK, sw: 16, scale: s.s, alpha: s.a, shadow: '#ffd21f', rot: -0.03 });
      CREDITS2.forEach(([t0, text, size, col, face], i) => {
        const a = prog(lt, t0, t0 + 0.6);
        if (a <= 0) return;
        bigText(ctx, text, 640, 200 + i * 44 + (1 - a) * 12, size, { fill: col, alpha: a, face, stroke: INK, sw: face === FONT_D ? 8 : 5, maxW: 980 });
      });
      const up = E.out3(prog(lt, 1.2, 2.4));
      drawSonic(ctx, 200, 880 - up * 160, 1.2, 1, { t: lt, ...POSE.sonicThumb(), expr: 'grin', blink: blinkAt(lt, 3, 41) });
      drawShadow(ctx, 430, 880 - up * 160, 1.2, 1, { t: lt, ...HP.cross2, expr: 'smile', blink: blinkAt(lt, 4, 43) });
      drawSaitama(ctx, 1070, 910 - up * 160, 1.05, -1, { t: lt, ...POSE.saiWave(lt), expr: 'happy', wind: 0.3, torn: 1 });
      if (lt > 15.6) flash(ctx, prog(lt, 15.6, 16.6), '#000');
      return;
    }
    spaceBG(ctx, lt);
    const u = prog(lt, 16.6, 27);
    drawCrab(ctx, lerp(260, 900, u), 330 + Math.sin(lt) * 20, 0.42, -1, { t: lt, rot: lt * 0.4, claw: 0.6, talk: speaking(lt, [[21.2, 25.2, 'crab', '...I HATE CITY Z.']], 'crab') });
    ctx.save();
    ctx.translate(lerp(1180, 760, u), 220 + Math.sin(lt * 0.7) * 30);
    ctx.rotate(lt * 0.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 8, 0, 0, TAU);
    strokeNow(ctx, 8, INK);
    strokeNow(ctx, 5, SHD.ring);
    ctx.restore();
    if (lt < 17.6) flash(ctx, 1 - prog(lt, 16.6, 17.6), '#000');
    talk(ctx, lt, [[17.6, 20.6, 'narrator', 'Meanwhile, in orbit...'], [21.2, 25.2, 'crab', '...I HATE CITY Z.', { shout: true, at: [lerp(260, 900, u) - 60, 140] }]], {});
  },
});
