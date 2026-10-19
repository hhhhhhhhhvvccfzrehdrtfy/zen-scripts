'use strict';
/* Round 3, chapter 8: the Sun. Twelve blows met head-on as they circle each other, fourteen emeralds
   and a Hyper Chaos Blast against a Serious Punch, the shockwave across the solar system, and the
   fusion coming apart. */

// Each clash: [type, direction of the line from Saitama to Shadic (rad), where on the loop].
const CLASH8 = (() => {
  const types = ['punch', 'kick', 'cross', 'skick', 'punch', 'feet', 'punch', 'kick', 'cross', 'skick', 'punch', 'punch'];
  const angs = [0, 0.4, -0.5, 0.25, -0.2, 0.7, -0.75, 0.1, 0.5, -0.3, 0.15, 0];
  return types.map((type, i) => {
    const th = i * 0.95;
    const P = [640 + Math.cos(th) * 150, 370 + Math.sin(th) * 90];
    const phi = angs[i] + (i % 2 ? Math.PI : 0); // every other clash they have swapped sides
    return { t: 3.1 + i * 0.36, type, P, n: [Math.cos(phi), Math.sin(phi)] };
  });
})();

function clashPoses8(c) {
  const [nx, ny] = c.n;
  const zDir = nx >= 0 ? 1 : -1;
  const zRot = zDir > 0 ? Math.atan2(ny, nx) : Math.atan2(ny, -nx);
  const hRot = zRot; // Shadic faces the other way along the same line, so the same tilt mirrors
  const zPose = {
    punch: { part: 'hand', legs: [[-0.5, -0.2], [0.6, -0.7]], arms: [[-0.7, 1.9], [1.57, 0.04]], lean: 0.15 },
    kick: { part: 'hand', legs: [[-0.5, -0.2], [0.6, -0.7]], arms: [[-0.7, 1.9], [1.57, 0.04]], lean: 0.15 },
    cross: { part: 'handFar', legs: [[-0.45, -0.2], [0.55, -0.8]], arms: [[1.57, 0.04], [-0.5, 1.9]], lean: 0.2 },
    skick: { part: 'foot', legs: [[-0.4, -0.3], [1.62, -0.05]], arms: [[-0.6, 0.8], [0.3, 1.0]], lean: -0.3 },
    feet: { part: 'foot', legs: [[-0.4, -0.3], [1.62, -0.05]], arms: [[-0.9, 0.6], [0.4, 0.9]], lean: -0.35 },
  }[c.type];
  const hPose = {
    punch: { part: 'hand', legs: [[-0.6, -0.4], [0.7, -0.9]], arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.3 },
    kick: { part: 'foot', legs: [[-0.4, -0.5], [1.65, -0.05]], arms: [[-1.2, 0.6], [0.9, 1.4]], lean: -0.3 },
    cross: { part: 'handFar', legs: [[-0.5, -0.3], [0.6, -0.8]], arms: [[1.6, 0.05], [0.3, 1.7]], lean: 0.4 },
    skick: { part: 'hand', legs: [[-0.6, -0.4], [0.7, -0.9]], arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.3 },
    feet: { part: 'foot', legs: [[-0.4, -0.5], [1.65, -0.05]], arms: [[-1.2, 0.6], [0.9, 1.4]], lean: -0.3 },
  }[c.type];
  const z = putZ({ x: 0, y: 0, dir: zDir, rot: zRot, ground: 0, legs: zPose.legs, arms: zPose.arms, lean: zPose.lean, s: 1 }, zPose.part, c.P[0] - nx * 6, c.P[1] - ny * 6);
  const h = putH({ x: 0, y: 0, dir: -zDir, rot: hRot, ground: 0, legs: hPose.legs, arms: hPose.arms, lean: hPose.lean, s: SS }, hPose.part, c.P[0] + nx * 6, c.P[1] + ny * 6);
  return { z, h };
}

const CLASHK8 = CLASH8.map((c) => ({ ...c, ...clashPoses8(c) }));
const zClashKeys = CLASHK8.flatMap((c) => [
  { t: c.t - 0.12, ...c.z, x: c.z.x - c.n[0] * 80, y: c.z.y - c.n[1] * 80, arms: [[0.9, 1.6], [-0.7, 1.9]], still: 0, e: E.inOut },
  { t: c.t, ...c.z, still: 1, e: E.in },
  { t: c.t + 0.1, ...c.z, x: c.z.x - c.n[0] * 46, y: c.z.y - c.n[1] * 46, still: 0, e: E.out },
]);
const hClashKeys = CLASHK8.flatMap((c) => [
  { t: c.t - 0.12, ...c.h, x: c.h.x + c.n[0] * 90, y: c.h.y + c.n[1] * 90, arms: [[1.3, 0.3], [0.2, 2.2]], still: 0, e: E.inOut },
  { t: c.t, ...c.h, still: 1, e: E.in },
  { t: c.t + 0.1, ...c.h, x: c.h.x + c.n[0] * 64, y: c.h.y + c.n[1] * 64, still: 0, e: E.out },
]);

const MEET8 = [640, 360]; // the final meeting point
const ZP8 = putZ({ x: 0, y: 0, dir: 1, rot: 0, ground: 0, legs: [[-0.6, -0.1], [0.5, -0.5]], arms: [[-0.8, 1.9], [1.57, 0.02]], lean: 0.22, s: 1 }, 'hand', MEET8[0] - 34, MEET8[1]);
const HP8 = putH({ x: 0, y: 0, dir: -1, rot: 0, ground: 0, legs: [[-0.7, -0.2], [-0.4, -0.5]], arms: [[1.5, 0.05], [1.6, 0.05]], lean: 0.35, s: SS }, 'hand', MEET8[0] + 40, MEET8[1]);

const H8raw = makeTrack3([
  { t: 0, x: -200, y: 300, dir: 1, rot: 1.2, ground: 0, legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[-0.6, 0.3], [2.8, 0.15]], jet: 1, aura: 1.0, expr: 'determined', alpha: 1, hands: ['fist', 'fist'] },
  { t: 1.0, x: 840, y: 330, rot: 0, dir: -1, legs: [[0.9, -1.4], [1.1, -1.6]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: -0.3, jet: 0.4, e: E.out },
  { t: 1.35, legs: [[0.4, -0.9], [0.8, -1.3]], arms: [[-0.6, 0.9], [0.5, 1.9]], lean: 0.2, aura: 1.5, jet: 0, expr: 'yell' },
  { t: 2.2, expr: 'angry' },
  { t: 2.85, legs: [[1.0, -1.8], [1.25, -2.0]], arms: [[-1.0, 0.5], [-0.8, 0.6]], lean: 0.4 },
  ...hClashKeys,
  { t: 7.75, x: 960, y: 250, rot: -0.6, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [2.5, 0.5]], lean: -0.4, expr: 'pain', sq: 0.15, e: E.out },
  // the charge: fourteen emeralds, and everything he has
  { t: 8.3, x: 900, y: 250, rot: 0, legs: [[0.4, -0.9], [0.8, -1.3]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.1, sq: 0, expr: 'angry' },
  { t: 8.9, legs: [[-0.5, -0.2], [0.6, -0.3]], arms: [[-1.6, 0.3], [1.7, 0.3]], hands: ['open', 'open'], lean: -0.25, aura: 2.0, expr: 'yell', e: E.out3 },
  { t: 10.3, arms: [[-1.7, 0.25], [1.8, 0.25]], lean: -0.3 },
  { t: 10.6, legs: [[0.3, -0.7], [0.7, -1.0]], arms: [[0.9, 1.4], [1.1, 1.3]], lean: 0.1, expr: 'focus', e: E.inOut },
  { t: 12.6, arms: [[0.85, 1.5], [1.05, 1.4]], lean: 0.05 },
  { t: 13.2, legs: [[1.1, -1.9], [1.3, -2.0]], arms: [[0.4, 1.9], [0.6, 1.8]], lean: -0.15, expr: 'yell', e: E.out },
  { t: 13.6, x: 860, y: 300, legs: [[-0.7, -0.2], [-0.4, -0.5]], arms: [[1.5, 0.05], [1.6, 0.05]], lean: 0.35, sq: 0.2, e: E.out3 },
  { t: 13.95, ...HP8, still: 1, sq: 0, e: E.in },
  { t: 15.4, x: HP8.x + 6, still: 1 },
  { t: 15.6, alpha: 1 },
  { t: 24.5, alpha: 1 },
], { ...H_BASE, hands: ['fist', 'fist'] });

const Z8raw = makeTrack3([
  { t: 0, x: -400, y: 420, dir: 1, ground: 0, rot: 1.3, legs: [[-0.25, -0.15], [-0.05, -0.35]], arms: [[-0.6, 0.5], [2.95, 0.05]], lean: 0.05, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 1.2, x: 440, y: 400, rot: 0, legs: [[0.85, -1.35], [1.2, -1.7]], arms: [[0.6, 1.0], [0.8, 1.1]], lean: 0.05, e: E.out },
  { t: 2.3, arms: [[0.6, 1.0], [0.9, 2.0]], tilt: 0.05 },
  { t: 2.6, arms: [[0.6, 1.6], [0.85, 1.7]], tilt: 0 },
  { t: 2.85, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[0.9, 1.6], [-0.7, 1.9]], lean: -0.1 },
  ...zClashKeys,
  { t: 7.75, x: 330, y: 470, rot: 0.3, legs: [[-0.9, -0.3], [0.4, -1.0]], arms: [[-1.4, 0.6], [1.6, 0.8]], lean: -0.3, e: E.out },
  { t: 8.3, x: 420, y: 430, rot: 0, legs: [[0.85, -1.35], [1.2, -1.7]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.05 },
  // quiet. the fist comes back slowly.
  { t: 10.8, tilt: 0.05 },
  { t: 11.5, legs: [[-0.5, -0.1], [0.5, -0.5]], arms: [[1.0, 1.6], [-0.4, 2.2]], lean: -0.1, e: E.inOut },
  { t: 13.0, arms: [[1.1, 1.6], [-0.9, 2.3]], lean: -0.15 },
  { t: 13.6, x: 470, y: 400, legs: [[-0.6, -0.1], [0.5, -0.5]], arms: [[-0.8, 1.9], [1.0, 1.2]], lean: 0.15, sq: 0.15, e: E.out3 },
  { t: 13.95, ...ZP8, still: 1, sq: 0, e: E.in },
  { t: 15.4, x: ZP8.x - 4, still: 1 },
  // afterwards: suit in rags, fist still out
  { t: 19.0, ...ZP8, x: 560, y: 440, rip: 0.9, still: 0, cut: true },
  { t: 21.4, arms: [[-0.8, 1.9], [1.5, 0.1]] },
  { t: 21.8, arms: [[0.6, 1.0], [0.8, 1.1]], legs: [[0.85, -1.35], [1.2, -1.7]], lean: 0.05, expr: 'ok' },
  { t: 22.4, x: 600, y: 380, e: E.inOut },
  { t: 22.8, arms: [[1.5, 0.3], [1.6, 0.2]], hands: ['open', 'open'] },
  { t: 23.0, arms: [[1.2, 0.5], [1.3, 0.4]], hands: ['fist', 'fist'] },
  { t: 24.5 },
], { ...Z_BASE, torn: 1, rip: 0.6 });

const H8 = animate(H8raw, { seed: 23 });
const Z8 = animate(Z8raw, { seed: 24, cape: true });

// After the blast: Sonic and Shadow, separated, drifting.
function apart8(a, who) {
  const u = prog(a, 19.6, 24.5);
  const z = Z8(a);
  const hold = a > 23.0;
  const side = who === 'sonic' ? -1 : 1;
  if (hold) {
    const [hx, hy] = ptZ(z, side < 0 ? 'handFar' : 'hand');
    return { x: hx + side * 4, y: hy + 70, dir: side < 0 ? 1 : -1, rot: side * 0.15, legs: [[0.3, -0.6], [0.5, -0.8]], arms: [[-0.3, 0.4], [0.2, 0.5]], expr: 'dizzy', s: SS };
  }
  return {
    x: 600 + side * (70 + u * 170),
    y: 280 - u * 30 + side * 12,
    dir: side < 0 ? 1 : -1,
    rot: side * (0.5 + u * 1.5),
    legs: [[0.6, -0.3], [-0.2, -0.9]],
    arms: [[-1.6, 0.4], [1.8, 0.5]],
    expr: 'dizzy',
    s: SS,
  };
}

const CAM8 = makeTrack([
  { t: 0, x: 400, y: 380, z: 0.8, r: 0 },
  { t: 1.2, x: 640, y: 370, z: 1.05, r: 0, e: E.out },
  { t: 2.8, x: 640, y: 370, z: 1.1, r: 0 },
  { t: 3.1, x: 640, y: 370, z: 1.25, r: 0.04, e: E.out3 },
  { t: 7.5, x: 640, y: 370, z: 1.15, r: 0.55 },
  { t: 7.8, x: 640, y: 360, z: 0.9, r: 0, e: E.out },
  { t: 8.9, x: 820, y: 280, z: 1.15, r: 0, e: E.out },
  { t: 10.6, x: 840, y: 280, z: 1.3, r: 0.02 },
  { t: 10.8, x: 440, y: 420, z: 1.4, r: 0, e: E.out3 },
  { t: 13.0, x: 430, y: 410, z: 1.6, r: 0 },
  { t: 13.6, x: 640, y: 360, z: 0.95, r: 0, e: E.out3 },
  { t: 13.95, x: 640, y: 360, z: 1.3, r: -0.04, e: E.out3 },
  { t: 15.4, x: 640, y: 360, z: 1.7, r: 0.04 },
  { t: 19.0, x: 600, y: 370, z: 1.05, r: 0 },
  { t: 24.5, x: 620, y: 360, z: 1.15, r: 0 },
]);

const L8 = [
  [1.35, 2.3, 'shadic', "This is EVERYTHING I've got!", { shout: true }],
  [9.0, 10.5, 'shadic', 'HYPER... CHAOS...', { shout: true }],
  [11.2, 12.4, 'saitama', 'Serious Series...'],
  [22.9, 24.0, 'saitama', "Let's go home."],
];

fightScene({
  id: 'sun',
  name: 'The Sun',
  dur: 24.5,
  lines: L8,
  holds: [...CLASH8.map((c, i) => [c.t, i === 0 || i === 11 ? 0.12 : 0.05, i === 0 || i === 11 ? 20 : 10, i === 0 || i === 6 || i === 11]), [13.95, 0.25, 36, true], [14.6, 0.2, 30, true], [15.3, 0.25, 40, true]],
  music: [[0, 'hyper'], [2.6, 'serious'], [10.8, 'none'], [13.2, 'serious'], [15.6, 'none'], [19.0, 'space']],
  cues: [
    [0.6, 'jet'], [1.35, 'charge'], [2.6, 'serious'], ...CLASH8.map((c) => [c.t, c.type === 'punch' ? 'punch' : 'block']), [3.1, 'boom'], [7.06, 'bigboom'],
    [8.9, 'charge'], ...Array.from({ length: 14 }, (_, i) => [8.95 + i * 0.08, 'chime', i]), [10.6, 'transform'], [12.6, 'charge'],
    [13.6, 'blast'], [13.95, 'bigboom'], [13.97, 'punch'], [14.6, 'boom'], [15.3, 'bigboom'], [16.2, 'rumble'], [19.6, 'sparkle'], [20.0, 'fuse'], [22.8, 'pop'],
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM8(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + (a > 8.9 && a < 13.6 ? 4 : 0) + (a > 13.95 && a < 15.6 ? 14 : 0));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z };
    const z = Z8(a);
    const h = H8(a);
    const after = a >= 19.0;
    sunSky(ctx, cs, lt, { sx: 120, sy: 160, R: 560 });
    ctx.save();
    camApply(ctx, cs);
    // clash shockwaves: rings racing out from each meeting point
    for (const k of CLASHK8) {
      const s = lt - realT(k.t, hs);
      shock(ctx, k.P[0], k.P[1], s / 0.6, 260, { w: 14, col: '#fff2c0' });
      hit3(ctx, k.P[0], k.P[1], s, 0.55, Math.round(k.t * 100), true);
    }
    // fourteen emeralds wheel round him as he charges
    if (a > 8.9 && a < 13.6) {
      const hc = [h.x, h.y - 10];
      for (let i = 0; i < 14; i++) {
        if (a < 8.95 + i * 0.08) continue;
        const an = (i / 14) * TAU + a * 2.2;
        drawEmerald(ctx, hc[0] + Math.cos(an) * 130, hc[1] + Math.sin(an) * 70, i % 2 ? 18 : 13, GEM_COLS[Math.floor(i / 2)], 1, an);
      }
    }
    // the energy sphere between his hands
    const sphereR = a > 10.6 && a < 15.6 ? 20 + 70 * E.out(prog(a, 10.6, 13.2)) : 0;
    const drawSphere = (g) => {
      if (sphereR <= 0) return;
      const hp = ptH(h, 'hand');
      const sx = hp[0] - 26;
      const sy = hp[1];
      g.save();
      g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(sx, sy, 2, sx, sy, sphereR * 1.6);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.35, `hsla(${(lt * 300) % 360},100%,75%,0.8)`);
      gr.addColorStop(1, 'rgba(120,230,255,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(sx, sy, sphereR * 1.6, 0, TAU);
      g.fill();
      g.restore();
    };
    if (!after) {
      if (a > 13.6 && a < 13.95) {
        rainbowRibbon(ctx, pastPts(H8, a, 10, 0.02), 40, lt, 1);
        ghostsOf(ctx, Z8, a, 3, 0.03, drawZ, 0.25);
      }
      drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: blinkAt(a, 3.4, 14), expr: a > 10.8 ? 'serious' : z.expr });
      drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 24) });
      drawSphere(ctx);
      if (a > 13.95 && a < 15.6) {
        // the meeting: rings of light pressing out from between fist and blast
        const k = prog(a, 13.95, 15.6);
        for (let i = 0; i < 5; i++) shock(ctx, MEET8[0], MEET8[1], (k * 2 + i * 0.2) % 1, 600, { w: 26, col: i % 2 ? '#ffffff' : '#ffe9a8' });
        circle(ctx, MEET8[0], MEET8[1], 40 + 60 * k, 'rgba(255,255,255,0.9)');
        for (let i = 0; i < 14; i++) {
          const an = (i / 14) * TAU;
          drawEmerald(ctx, MEET8[0] + Math.cos(an) * (120 + k * 900), MEET8[1] + Math.sin(an) * (80 + k * 600), i % 2 ? 18 : 13, GEM_COLS[Math.floor(i / 2)], 1, an + k * 8);
        }
      }
    } else {
      // after: the glow comes apart into Sonic and Shadow
      const split = prog(a, 19.6, 20.2);
      if (split < 1) {
        const glowK = 1 - split;
        circle(ctx, 640, 360, 80 * glowK + 20, `rgba(255,255,255,${glowK})`);
      }
      if (a > 19.9) {
        drawHogC(drawSonic, ctx, apart8(a, 'sonic'), a, { blink: 0 });
        drawHogC(drawShadow, ctx, apart8(a, 'shadow'), a, { blink: 0, rings: 1 });
      }
      drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: blinkAt(a, 3.4, 14), wind: 0.5 });
      if (a < 20.5) puffs(ctx, ptZ(z, 'hand')[0], ptZ(z, 'hand')[1], prog(a, 19.0, 20.5), { n: 6, spread: 40, seed: 91, size: 14, rise: 40, color: '#e6e0d8', shade: '#b8b0a6' });
    }
    ctx.restore();
    if (a > 15.4 && a < 16.4) flash(ctx, prog(a, 15.4, 15.7) * (1 - prog(a, 16.2, 16.4)), '#ffffff');
    if (a >= 16.2 && a < 19.0) solarWave8(ctx, a, lt);
    if (a >= 19.0 && a < 19.6) flash(ctx, 1 - prog(a, 19.0, 19.6), '#ffffff');
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { drawZ(g, z, a, {}); drawH(g, h, a, {}); drawSphere(g); }, ...(a >= 13.9 ? MEET8 : CLASHK8.reduce((b, k) => (Math.abs(k.t - fr.h.a) < 0.01 ? k.P : b), MEET8)), lt);
    if (a > 13.2 && a < 13.95) {
      const s1 = slam(a - 13.25);
      if (s1) bigText(ctx, 'HYPER CHAOS BLAST', 640, 110, 70, { fill: rainbowFill(ctx, 700), stroke: INK, sw: 12, scale: s1.s, alpha: s1.a, shadow: '#ffffff', rot: -0.04, maxW: 1100 });
      const s2 = slam(a - 13.55);
      if (s2) bigText(ctx, 'SERIOUS PUNCH', 640, 630, 78, { fill: '#ffd21f', stroke: INK, sw: 13, scale: s2.s, alpha: s2.a, shadow: '#e3262f', rot: 0.03, maxW: 1100 });
    }
    if (!after) talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
    else talk(ctx, lt, LL, { saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
  },
});

// The shockwave crossing the solar system: a white ring sweeping past every planet they fought on.
function solarWave8(ctx, a, lt) {
  const u = prog(a, 16.2, 19.0);
  const c = { x: 640, y: 360, z: 1, r: 0 };
  starfield(ctx, c, lt, { neb: 0.6 });
  sunBody(ctx, 60, 380, 70, lt);
  const planets = [
    [190, 360, 6, '#b9a58f'], [260, 372, 10, '#e8c98c'], [350, 352, 12, 'earth'], [440, 380, 8, '#d0603c'],
    [620, 360, 34, 'jupiter'], [860, 370, 26, 'saturn'], [1060, 352, 16, '#a6e3f0'], [1200, 380, 15, '#4e7be6'],
  ];
  const pr = Math.min(0.999, u * 0.95 + 0.04);
  const R = 1500 * E.out3(pr);
  for (const [x, y, r, k] of planets) {
    const hitK = clamp(1 - Math.abs(R - (x - 60)) / 60);
    const wob = Math.sin(lt * 40) * 4 * hitK;
    if (k === 'earth') {
      earth(ctx, x + wob, y, r, lt, {});
      moonDisc(ctx, x + 22 + wob, y - 14, 4);
    } else if (k === 'jupiter') jupiter(ctx, x + wob, y, r, lt, { hole: 1, spot: [0.1, 0.05] });
    else if (k === 'saturn') saturn(ctx, x + wob, y, r * 0.8, lt);
    else {
      ell(ctx, x + wob, y, r, r, 0, k, 2);
    }
  }
  ctx.save();
  ctx.globalAlpha = 1 - prog(u, 0.8, 1);
  shock(ctx, 60, 380, pr, 1500, { w: 40, col: '#ffffff', flat: 0.35 });
  ctx.restore();
}
