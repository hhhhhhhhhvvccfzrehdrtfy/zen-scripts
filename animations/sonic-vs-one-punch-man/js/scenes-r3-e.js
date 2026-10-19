'use strict';
/* Round 3, chapter 5: Jupiter. A giant Chaos Spear split with a chop, a dive into the clouds, a fight
   seen only in lightning flashes, and the Serious Sneeze that blows a hole through Jupiter. */

const JS5 = { x: 840, y: 330 };
// Lightning flashes inside the storm: each one lights a different exchange.
const FLASH5 = [6.8, 7.15, 7.5, 7.85, 8.2, 8.55, 8.9];
const flashK5 = (a) => {
  let k = 0;
  for (const f of FLASH5) if (a >= f && a < f + 0.16) k = Math.max(k, 1 - (a - f) / 0.16);
  return k;
};

// Saitama inside the clouds and the points the storm exchanges meet.
const ZC5 = { x: 560, y: 380, dir: 1, ground: 0, legs: [[0.85, -1.35], [1.2, -1.7]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.05, rot: 0.05 };
const ZC5H = ptZ(ZC5, 'head');
const SF5 = {
  // F1: roundhouse to the head, forearm block
  1: atH('foot', [ZC5H[0] + 34, ZC5H[1] - 4], { dir: -1, legs: [[-0.3, -0.4], [2.3, -0.05]], arms: [[-1.4, 0.5], [-1.0, 0.7]], lean: -0.55, rot: 0.2, expr: 'angry' }),
  // F3: uppercut to the chin
  3: atH('hand', [ZC5H[0] + 16, ZC5H[1] + 20], { dir: -1, legs: [[0.4, -0.9], [0.8, -1.3]], arms: [[-0.9, 0.6], [2.5, 0.2]], lean: -0.1, rot: -0.3, expr: 'angry' }),
  // F4: fist meets fist
  4: atH('hand', [ZC5.x + 96, ZC5.y - 22], { dir: -1, legs: [[-0.5, -0.4], [0.6, -0.9]], arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.35, rot: 0, expr: 'determined' }),
  // F5: heel from above, palm catch
  5: atH('foot', [ZC5H[0] + 8, ZC5H[1] - 70], { dir: -1, legs: [[-0.5, -0.4], [1.35, 0.0]], arms: [[1.5, 0.8], [1.8, 0.6]], lean: 0.4, rot: 0.6, expr: 'angry' }),
};

const H5raw = makeTrack3([
  { t: 0, x: -150, y: 100, dir: 1, ball: 1, spin: 0, rot: 0, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[-0.5, 0.7], [0.3, 1.2]], expr: 'pain', aura: 0.35, alpha: 1, ground: 0, jet: 0, hands: ['fist', 'fist'] },
  { t: 1.1, x: 480, y: 310, spin: 70, e: E.out },
  { t: 1.2, ball: 0, legs: [[1.0, -1.6], [1.3, -1.9]], arms: [[-1.3, 0.5], [-1.1, 0.6]], lean: -0.35, rot: -0.3, jet: 1, expr: 'angry' },
  { t: 1.6, x: 520, y: 300, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.1, rot: 0, jet: 0.3, e: E.out },
  { t: 2.6, arms: [[-0.6, 0.9], [0.5, 1.9]], lean: 0.2, expr: 'angry', aura: 0.8 },
  // the giant spear, raised overhead and hurled
  { t: 2.95, y: 290, arms: [[2.8, 0.25], [2.95, 0.15]], hands: ['open', 'open'], lean: -0.1, aura: 1.3, e: E.out3 },
  { t: 3.85, legs: [[0.2, -0.6], [0.7, -1.0]], arms: [[3.0, 0.6], [3.1, 0.5]], lean: -0.3, rot: -0.15, e: E.out },
  { t: 4.05, legs: [[-0.5, -0.3], [0.6, -0.7]], arms: [[1.4, 0.1], [1.5, 0.05]], lean: 0.4, rot: 0.15, e: E.out3 },
  { t: 4.6, arms: [[-0.4, 0.8], [0.3, 1.2]], hands: ['fist', 'fist'], lean: 0.05, rot: 0, aura: 0.8, expr: 'shock' },
  // spin in and drive him down into the clouds
  { t: 5.15, legs: [[1.6, -2.3], [1.8, -2.4]], arms: [[1.1, 1.8], [1.3, 1.7]], lean: 0.45, rot: 0.3, expr: 'angry', e: E.out },
  { t: 5.25, ball: 1, spin: 0, rot: 0 },
  { t: 5.55, x: JS5.x - 70, y: JS5.y - 30, spin: 40, e: E.in },
  { t: 5.62, ball: 0, legs: [[-0.6, -0.3], [-0.3, -0.6]], arms: [[1.55, 0.1], [1.45, 0.15]], hands: ['open', 'open'], lean: 0.35, rot: 1.4, jet: 1.4, aura: 1.2 },
  { t: 6.45, x: JS5.x - 30, y: 900, rot: 1.6, e: E.in },
  // inside the storm: positions and poses for each flash
  { t: 6.55, x: 760, y: 340, dir: -1, rot: 0, jet: 0.3, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.1, aura: 0.6, cut: true },
  { t: 6.72, ...SF5[1], x: SF5[1].x + 30, y: SF5[1].y - 12, legs: [[0.2, -0.6], [1.7, -2.2]] },
  { t: 6.8, ...SF5[1], still: 1, e: E.out3 },
  { t: 6.95, x: 700, y: 330, rot: 0, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.1, still: 0 },
  { t: 7.15, x: 650, y: 410, legs: [[1.1, -1.9], [1.3, -2.0]], arms: [[1.3, 2.0], [1.5, 1.9]], lean: 0.55, rot: 0.3, still: 1, e: E.out3 },
  { t: 7.3, still: 0 },
  { t: 7.42, ...SF5[3], x: SF5[3].x + 20, y: SF5[3].y + 30, arms: [[-0.9, 0.6], [0.3, 2.0]], lean: 0.35, rot: -0.1 },
  { t: 7.5, ...SF5[3], still: 1, e: E.out3 },
  { t: 7.65, x: 700, y: 340, rot: 0, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.1, still: 0 },
  { t: 7.77, ...SF5[4], x: SF5[4].x + 40, arms: [[1.3, 0.3], [0.2, 2.2]], lean: 0.1 },
  { t: 7.85, ...SF5[4], still: 1, e: E.out3 },
  { t: 8.0, x: SF5[4].x + 60, y: SF5[4].y - 40, rot: -0.5, still: 0 },
  { t: 8.12, ...SF5[5], x: SF5[5].x + 20, y: SF5[5].y - 40, legs: [[-0.2, -0.4], [3.0, -0.1]], rot: 0.3 },
  { t: 8.2, ...SF5[5], still: 1, e: E.in },
  { t: 8.4, x: 690, y: 300, rot: -0.4, legs: [[0.6, -1.2], [1.0, -1.5]], still: 0 },
  { t: 8.55, x: 780, y: 280, rot: -1.6, legs: [[0.6, -0.4], [1.2, -0.6]], arms: [[-2.0, 0.4], [2.2, 0.5]], lean: -0.4, expr: 'pain', still: 0, e: E.out3 },
  { t: 8.75, x: 840, y: 320, rot: -0.2, legs: [[0.8, -1.4], [1.1, -1.6]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: -0.2, expr: 'angry' },
  { t: 8.9, x: 820, y: 340, rot: 0, legs: [[0.4, -1.0], [0.9, -1.4]], arms: [[-0.6, 0.9], [0.5, 1.9]], lean: 0.25, aura: 1.3, e: E.out },
  { t: 10.2, x: 790, aura: 1.4 },
  { t: 10.5, expr: 'shock', lean: -0.1, arms: [[1.3, 2.0], [1.5, 1.9]] },
  // the sneeze
  { t: 11.55, alpha: 1 },
  { t: 11.6, x: 900, y: 290, rot: -1.2, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [2.5, 0.5]], lean: -0.5, expr: 'pain', sq: 0.2, e: E.out3 },
  { t: 12.3, x: 1900, y: -600, rot: -9, e: E.out },
  { t: 17.2, x: 1900, y: -600 },
], H_BASE);

const Z5raw = makeTrack3([
  { t: 0, x: 1700, y: 60, dir: -1, ground: 0, legs: [[-0.5, -0.3], [0.5, -0.4]], arms: [[-1.4, 0.3], [1.4, 0.3]], lean: 0.1, rot: 0, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 2.4, x: JS5.x, y: JS5.y - 10, lean: 0.15, e: E.out },
  { t: 2.5, y: JS5.y - 4, legs: [[0.4, -0.9], [0.9, -1.2]], arms: [[-1.0, 0.4], [1.0, 0.5]], lean: 0.25, sq: -0.06 },
  { t: 2.7, ...JS5, legs: [[0.85, -1.35], [1.2, -1.7]], arms: [[0.6, 1.0], [0.8, 1.1]], lean: 0.05, sq: 0, rot: 0.05 },
  { t: 4.1, arms: [[0.6, 1.0], [2.85, 0.15]], hands: ['fist', 'open'], lean: -0.1, e: E.out },
  { t: 4.35, arms: [[0.6, 1.0], [1.25, 0.2]], lean: 0.25, still: 1, e: E.out3 },
  { t: 4.6, arms: [[0.6, 1.0], [0.9, 0.6]], hands: ['fist', 'fist'], lean: 0.05, still: 0 },
  { t: 5.3, arms: HP.cross2.arms, lean: -0.05, expr: 'ok' },
  { t: 5.55, x: JS5.x + 6, still: 1 },
  { t: 5.62, rot: -0.3, still: 0 },
  { t: 6.45, x: JS5.x + 40, y: 980, rot: -0.2, e: E.in },
  // the storm
  { t: 6.55, ...ZC5, expr: 'serious', cut: true },
  { t: 6.72, arms: [[0.6, 1.6], [1.6, 1.8]] },
  { t: 6.8, ...hitArmZ(ZC5, ZC5H[0] + 26, ZC5H[1] - 10), still: 1, e: E.out3 },
  { t: 6.95, ...ZC5, still: 0 },
  { t: 7.05, arms: [[0.9, 1.6], [-0.7, 1.9]], lean: -0.12 },
  { t: 7.15, arms: [[-0.7, 1.9], [1.57, 0.04]], legs: [[0.6, -1.0], [1.0, -1.4]], lean: 0.2, still: 1, e: E.out3 },
  { t: 7.3, ...ZC5, still: 0 },
  { t: 7.5, tilt: -0.22, lean: -0.15, still: 1, e: E.out3 },
  { t: 7.65, tilt: 0, lean: 0.05, still: 0 },
  { t: 7.77, arms: [[0.9, 1.6], [-0.6, 1.9]], lean: -0.1 },
  { t: 7.85, arms: [[-0.7, 1.9], [1.57, 0.04]], lean: 0.2, still: 1, e: E.out3 },
  { t: 8.0, ...ZC5, still: 0 },
  { t: 8.12, arms: [[0.6, 1.6], [2.4, 0.6]], hands: ['fist', 'open'] },
  { t: 8.2, ...hitArmZ(ZC5, ZC5H[0] + 8, ZC5H[1] - 64), hands: ['fist', 'open'], still: 1, e: E.out3 },
  { t: 8.4, arms: [[0.6, 1.6], [2.2, 0.8]], still: 0 },
  { t: 8.55, arms: [[0.6, 1.6], [1.9, -0.4]], hands: ['fist', 'fist'], lean: 0.2, e: E.out3 },
  { t: 8.9, ...ZC5 },
  // the nose
  { t: 9.2, tilt: -0.08, expr: 'ok' },
  { t: 9.3, expr: 'ah' },
  { t: 9.9, tilt: -0.2, lean: -0.18, arms: [[0.3, 0.9], [0.5, 1.0]], e: E.inOut },
  { t: 10.6, tilt: -0.32, lean: -0.32, arms: [[-0.2, 0.7], [0.0, 0.8]], e: E.inOut },
  { t: 11.4, tilt: -0.42, lean: -0.42, arms: [[-0.6, 0.6], [-0.4, 0.7]], e: E.in },
  { t: 11.55, tilt: 0.3, lean: 0.55, arms: [[-1.3, 0.4], [-1.1, 0.5]], expr: 'achoo', still: 1, sq: -0.1, e: E.out3 },
  { t: 11.75, x: ZC5.x - 60, sq: 0, still: 0 },
  { t: 12.3, x: ZC5.x - 260, y: ZC5.y + 40, expr: 'ok', tilt: 0, lean: 0.1, rot: -0.3, e: E.out },
  { t: 17.2 },
], Z_BASE);

const H5 = animate(H5raw, { seed: 13 });
const Z5 = animate(Z5raw, { seed: 14, cape: true });

const CAM5 = makeTrack([
  { t: 0, x: 500, y: 300, z: 0.8, r: 0 },
  { t: 1.6, x: 600, y: 310, z: 0.95, r: 0 },
  { t: 2.6, x: 680, y: 310, z: 1.0, r: 0 },
  { t: 3.85, x: 640, y: 290, z: 0.95, r: 0 },
  { t: 4.35, x: 790, y: 320, z: 1.3, r: 0.03, e: E.out3 },
  { t: 4.8, x: 760, y: 340, z: 1.05, r: 0 },
  { t: 5.55, x: 800, y: 330, z: 1.2, r: -0.02 },
  { t: 6.45, x: 820, y: 900, z: 1.0, r: 0.05, e: E.in },
  { t: 6.55, x: 640, y: 360, z: 1.15, r: 0 },
  { t: 8.9, x: 650, y: 350, z: 1.2, r: 0 },
  { t: 9.3, x: 590, y: 340, z: 1.5, r: 0, e: E.out },
  { t: 11.4, x: 570, y: 330, z: 1.65, r: -0.02 },
  { t: 11.55, x: 680, y: 340, z: 1.0, r: 0, e: E.out3 },
  { t: 12.3, x: 640, y: 330, z: 0.9, r: 0 },
]);

const L5 = [
  [2.6, 4.0, 'shadic', 'ENOUGH! HYPER CHAOS SPEAR!', { shout: true }],
  [9.3, 9.85, 'saitama', '...Ah.'],
  [9.95, 10.6, 'saitama', '...AH...'],
  [10.55, 11.35, 'shadic', 'Wait, what are you--'],
  [11.45, 12.4, 'saitama', 'AH-CHOO!!!', { shout: true }],
];
const L5b = [
  [1.0, 2.6, 'shadic', '...He SNEEZED a hole in JUPITER?!', { shout: true, at: [1010, 220] }],
  [2.9, 4.0, 'saitama', 'Sorry. Dusty.'],
];

fightScene({
  id: 'jupiter',
  name: 'Jupiter',
  dur: 12.6,
  lines: L5,
  holds: [[4.35, 0.12, 16, true], [5.55, 0.08, 12], [6.8, 0.05, 8], [7.5, 0.05, 8], [7.85, 0.1, 14], [8.2, 0.05, 8], [11.55, 0.35, 34, true]],
  music: [[0, 'hyper']],
  cues: [
    [0.6, 'whoosh'], [1.2, 'jet'], [2.4, 'crunch'], [2.95, 'charge'], [4.05, 'spear'], [4.35, 'snap'], [4.36, 'punch'], [4.9, 'boom'], [5.0, 'boom'],
    [5.3, 'rev'], [5.55, 'punch'], [5.62, 'jet'], [6.45, 'boom'], ...FLASH5.map((f) => [f, 'zap']), [6.8, 'block'], [7.15, 'miss'], [7.5, 'punch'], [7.85, 'punch'], [7.86, 'boom'], [8.2, 'block'], [8.55, 'punch'],
    [9.3, 'pop'], [10.0, 'pop'], [11.55, 'bigsneeze'], [11.56, 'bigboom'],
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM5(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + (a > 5.62 && a < 6.45 ? 8 : 0) + (a > 11.55 ? 18 * (1 - prog(a, 11.55, 12.6)) : 0));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z };
    const z = Z5(a);
    const h = H5(a);
    const inside = a >= 6.55;
    if (!inside) {
      starfield(ctx, cs, lt, { neb: 0.7 });
      layer(ctx, cs, 0.12, (g) => jupiter(g, 0, 980 - prog(a, 5.62, 6.45) * 500, 860 + prog(a, 5.62, 6.45) * 600, lt), 640, 360);
    } else {
      const fk = flashK5(a);
      jupiterClouds(ctx, cs, lt, { flash: fk });
    }
    ctx.save();
    camApply(ctx, cs);
    if (!inside) {
      // Saitama's ride in: an asteroid surfboard
      if (a < 3.4) {
        const st = Z5(Math.min(a, 2.45));
        const drift = Math.max(0, a - 2.45);
        rock(ctx, st.x + 6 + drift * 120, st.y + 150 + 62 + drift * 80, 72, 4, 0.2 + drift * 0.6);
      }
      // the giant spear forms over his head, then flies, then splits on the chop
      const hp = ptH(H5(Math.min(a, 3.85)), 'hand');
      if (a > 2.95 && a < 4.05) {
        const g = E.out3(prog(a, 2.95, 3.7));
        hyperSpear(ctx, hp[0] + 10, hp[1] - 30, 0.15, 1.2 + 2.4 * g, g, lt);
      } else if (a >= 4.05 && a < 4.35) {
        const u = prog(a, 4.05, 4.35);
        hyperSpear(ctx, lerp(hp[0] + 20, JS5.x - 70, u), lerp(hp[1] - 20, JS5.y - 52, u), 0.2, 3.6, 1, lt);
      } else if (a >= 4.35 && a < 5.2) {
        const k = a - 4.35;
        hyperSpear(ctx, JS5.x - 40 + k * 1300, JS5.y - 80 - k * 300, -0.2, 1.8, 1 - prog(k, 0.4, 0.6), lt);
        hyperSpear(ctx, JS5.x - 40 + k * 1300, JS5.y - 20 + k * 520, 0.4, 1.8, 1 - prog(k, 0.4, 0.6), lt);
        hit3(ctx, JS5.x - 30, JS5.y - 50, k, 1.0, 5, true);
      }
      for (const [tb, x, y] of [[4.9, 1500, 120], [5.0, 1500, 760]]) {
        if (a > tb && a < tb + 1.2) {
          shock(ctx, x, y, prog(a, tb, tb + 0.8), 300, { w: 20, col: '#bff6ff' });
          circle(ctx, x, y, 140 * (1 - prog(a, tb, tb + 0.6)), 'rgba(220,250,255,0.6)');
        }
      }
      if (a > 5.62) {
        rainbowRibbon(ctx, pastPts(H5, a, 8, 0.03), 26, lt, 0.8);
        speedLines(ctx, a, { n: 30, alpha: 0.4 });
      }
    }
    // in the dark between flashes they are silhouettes; a flash shows everything
    const fk = inside ? flashK5(a) : 1;
    const dark = inside && a < 9.1 ? 1 - fk : 0;
    if (dark < 0.98) {
      drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: a > 9.3 ? 0 : blinkAt(a, 3.4, 8) });
      drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 15) });
    }
    if (inside && fk > 0.05 && a < 9.1) {
      const f = FLASH5.find((t) => a >= t && a < t + 0.16) ?? 6.8;
      lightning(ctx, 200 + hash(f) * 900, -100, 300 + hash(f * 3) * 700, 900, Math.round(f * 100), fk);
    }
    // the sneeze: a blast cone from his face, clouds torn away behind it
    if (a > 11.55) {
      const k = a - 11.55;
      const [hx, hy] = ptZ(Z5(11.55), 'head');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const ang = (hash(i * 3.3) - 0.5) * 0.9;
        const len = 200 + k * 2600 * (0.5 + hash(i * 7.1));
        ctx.strokeStyle = `rgba(255,250,235,${0.7 * (1 - prog(k, 0.3, 1.0))})`;
        ctx.lineWidth = 3 + hash(i) * 10;
        ctx.beginPath();
        ctx.moveTo(hx + 30 + Math.cos(ang) * 40, hy + Math.sin(ang) * 40);
        ctx.lineTo(hx + 30 + Math.cos(ang) * len, hy + Math.sin(ang) * len);
        ctx.stroke();
      }
      ctx.restore();
      punchWave(ctx, hx + 30, hy, 0, k, 1500, { life: 1.0 });
      punchWave(ctx, hx + 30, hy, 0, k - 0.15, 1200, { life: 1.0 });
    }
    ctx.restore();
    if (inside && a < 9.1) {
      // darkness and silhouettes between flashes
      ctx.save();
      ctx.globalAlpha = dark * 0.78;
      ctx.fillStyle = '#1a0a05';
      ctx.fillRect(-50, -50, W + 100, H + 100);
      ctx.restore();
      if (dark > 0.02) {
        ctx.save();
        ctx.globalAlpha = dark;
        silhouette(ctx, (g) => {
          g.save();
          camApply(g, cs);
          drawZ(g, z, a, {});
          drawH(g, h, a, {});
          g.restore();
        }, '#0d0503');
        ctx.restore();
      }
    }
    if (a > 6.45 && a < 6.7) flash(ctx, 1 - prog(a, 6.45, 6.7), '#fff3dc');
    if (a > 11.55 && a < 12.0) flash(ctx, 0.85 * (1 - prog(a, 11.55, 12.0)), '#fffaf0');
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { drawZ(g, z, a, {}); drawH(g, h, a, {}); }, ...(fr.h.a === 11.55 ? ptZ(z, 'head') : [JS5.x - 40, JS5.y - 50]), lt);
    if (a > 11.5) {
      const sl = slam(a - 11.62);
      if (sl) bigText(ctx, 'SERIOUS SNEEZE', 640, 600, 84, { fill: '#ffffff', stroke: INK, sw: 14, scale: sl.s, alpha: sl.a * (1 - prog(a, 12.3, 12.6)), shadow: '#e3262f', rot: -0.04, maxW: 1100 });
    }
    talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
  },
});

// The wide view after the sneeze: Jupiter with a hole blown through its clouds.
scene({
  id: 'jupiter2',
  name: 'Gesundheit',
  dur: 4.6,
  lines: L5b,
  music: [[0, 'hyper']],
  cues: [[0.1, 'rumble'], [2.9, 'pop'], [4.0, 'whoosh']],
  draw(ctx, lt) {
    const c = { x: 640, y: 360, z: 1, r: 0 };
    starfield(ctx, c, lt, { neb: 0.8 });
    const hole = E.out3(prog(lt, 0, 1.6));
    jupiter(ctx, 520, 470, 330, lt, { hole, spot: [0.1, 0.05] });
    for (let i = 0; i < 3; i++) shock(ctx, 553, 486, prog(lt, i * 0.25, 1.6 + i * 0.25), 420, { w: 10, col: '#ffe9c8', flat: 0.6 });
    // Shadic, tiny, tumbling off up and right; Saitama shot out the far side by the recoil
    const u = prog(lt, 0, 2.6);
    drawH(ctx, { x: lerp(820, 1150, u), y: lerp(220, 80, u), s: 0.25, dir: 1, rot: lt * 7, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [2.5, 0.5]], expr: 'pain' }, lt, {});
    if (lt > 2.7) {
      // Saitama, wiping his nose as he coasts
      const k = prog(lt, 2.7, 4.6);
      starStreaks(ctx, lt, Math.PI, 0.5, { speed: 2200, n: 40 });
      drawZ(ctx, { x: lerp(820, 560, k), y: 420, s: 1.25, dir: -1, rot: 0.15, legs: [[0.85, -1.35], [1.2, -1.7]], arms: [[0.6, 1.0], [0.75 + Math.sin(lt * 9) * 0.08, 2.2]], hands: ['fist', 'open'], tilt: 0.08 }, lt, { expr: 'ok', talk: speaking(lt, L5b, 'saitama'), wind: 0.9, capeRot: 0.4 });
    }
    talk(ctx, lt, L5b, { saitama: [lerp(820, 560, prog(lt, 2.7, 4.6)), 110] });
  },
});
