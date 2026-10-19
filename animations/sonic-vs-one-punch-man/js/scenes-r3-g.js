'use strict';
/* Round 3, chapter 7: riding a comet toward the Sun. A spin dash stopped under a foot, three homing
   attacks, a geyser, an aerial exchange where Shadic finally lands one, a frozen-time ring of spears,
   and the comet breaking up as they race for the Sun. */

const ZONc = (x) => ({ x, y: cometY(x) - 150, ground: 1 });
const HONc = (x) => ({ x, y: cometY(x) - SS * HC, ground: 1 });
const BALLc = (x) => cometY(x) - 29 - BALLUP; // keyed centre of a ball rolling on the surface

const ZS7 = { ...ZONc(700), dir: 1, legs: [[-0.35, -0.1], [0.4, -0.3]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.06, rot: 0 };
const ZS7H = ptZ(ZS7, 'head');
// homing attacks from above: [time, ball centre, Saitama's block target, far arm?]
const HOM7 = [
  [3.65, [ZS7H[0] - 46, ZS7H[1] - 44], [ZS7H[0] - 26, ZS7H[1] - 30], true],
  [3.95, [ZS7H[0] + 48, ZS7H[1] - 46], [ZS7H[0] + 28, ZS7H[1] - 32], false],
  [4.3, [ZS7H[0], ZS7H[1] - 80], [ZS7H[0] + 6, ZS7H[1] - 56], false],
];
const STOMP7 = [760, cometY(760) - 58];

// The aerial exchange above the comet.
const ZA7 = { x: 900, y: 270, dir: 1, ground: 0, legs: [[0.85, -1.35], [1.2, -1.7]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.05, rot: 0.05 };
const ZA7H = ptZ(ZA7, 'head');
const HA7 = { x: 1010, y: 250, dir: -1, ground: 0, legs: [[0.6, -1.2], [1.05, -1.55]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.12, rot: 0, expr: 'angry' };
const KA7 = atH('foot', [ZA7H[0] + 34, ZA7H[1] + 20], { dir: -1, legs: [[-0.45, -0.65], [1.65, -0.05]], arms: [[-1.5, 0.5], [0.9, 1.4]], lean: -0.4, rot: 0.1, expr: 'angry' });
const DK7a = atH('foot', [ZA7H[0] + 30, ZA7H[1] + 46], { dir: -1, legs: [[0.9, -1.6], [1.6, -0.05]], arms: [[-1.3, 0.6], [-1.0, 0.8]], lean: -0.4, rot: -0.35, expr: 'angry' });
const DK7b = atH('footFar', [ZA7H[0] + 22, ZA7H[1] + 2], { dir: -1, legs: [[1.75, -0.05], [0.9, -1.6]], arms: [[-1.3, 0.6], [-1.0, 0.8]], lean: -0.45, rot: -0.5, expr: 'grin' });

// Frozen time: spears set in a ring around him.
const ZF7 = { ...ZONc(950), dir: 1, legs: [[-0.35, -0.1], [0.4, -0.3]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.06, rot: 0 };
const RING7 = Array.from({ length: 14 }, (_, i) => {
  const th = -Math.PI + (i / 14) * TAU + 0.1;
  return { th, x: ZF7.x + Math.cos(th) * 250, y: ZF7.y + Math.sin(th) * 190, t: 10.65 + i * 0.09 };
});

const H7raw = makeTrack3([
  { t: 0, x: 300, y: 120, dir: 1, rot: 1.2, ground: 0, legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[-0.6, 0.3], [2.8, 0.15]], jet: 1, aura: 0.5, expr: 'determined', alpha: 1, ball: 0, fig8: false, spin: 0, hands: ['fist', 'fist'] },
  { t: 0.65, x: 1250, y: HONc(1250).y - 40, rot: 0.15, legs: [[1.2, -2.0], [1.4, -2.1]], arms: [[-1.3, 0.5], [-1.1, 0.6]], lean: -0.3, jet: 0.5, e: E.out },
  { t: 0.85, ...HONc(1320), legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.6, 0.6], [0.5, 1.2]], rot: 0, lean: 0.4, sq: -0.1, jet: 0, e: E.in },
  { t: 1.1, dir: -1, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: HP.cross2.arms, lean: -0.05, sq: 0, expr: 'smirk' },
  { t: 2.3, legs: [[0.9, -1.7], [1.1, -1.8]], arms: [[-1.0, 0.5], [-0.8, 0.6]], lean: 0.45, expr: 'determined', e: E.out },
  // the dash: figure-eight legs, then a spin dash at his shins
  { t: 2.45, fig8: true, ph: 0, x: 1280, lean: 0.42, arms: [[-1.5, 0.3], [-1.3, 0.4]] },
  { t: 2.8, x: 940, y: HONc(940).y, ph: 40, e: E.in },
  { t: 2.85, fig8: false, ball: 1, spin: 0, x: 900, y: BALLc(900) },
  { t: 2.95, x: STOMP7[0], y: BALLc(STOMP7[0]), spin: 20, still: 1, e: E.in },
  { t: 3.3, spin: 80 },
  { t: 3.36, x: 600, y: 380 - BALLUP, spin: 96, still: 0, e: E.out },
  // three homing attacks, each from a new angle
  { t: 3.5, x: 560, y: 300 - BALLUP, spin: 110 },
  { t: 3.65, x: HOM7[0][1][0], y: HOM7[0][1][1] - BALLUP, spin: 124, lin: true, e: E.in },
  { t: 3.8, x: 860, y: 220 - BALLUP, spin: 140, lin: true, e: E.out },
  { t: 3.95, x: HOM7[1][1][0], y: HOM7[1][1][1] - BALLUP, spin: 156, lin: true, e: E.in },
  { t: 4.1, x: 720, y: 150 - BALLUP, spin: 170, lin: true, e: E.out },
  { t: 4.3, x: HOM7[2][1][0], y: HOM7[2][1][1] - BALLUP, spin: 190, lin: true, e: E.in },
  { t: 4.42, x: 760, y: 170 - BALLUP, spin: 200, lin: true, e: E.out },
  { t: 4.5, ball: 0, x: 790, y: 150, legs: [[0.6, -0.3], [-0.2, -0.9]], arms: [[-1.8, 0.4], [1.9, 0.5]], lean: -0.2, rot: 0.4 },
  { t: 4.75, ...HONc(900), dir: -1, rot: 0, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.6, 0.6], [0.5, 1.2]], lean: 0.4, sq: -0.08, e: E.in },
  { t: 4.9, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: [[-0.3, 0.5], [0.2, 0.7]], lean: 0, sq: 0, expr: 'grin' },
  // the geyser launches him
  { t: 5.0, expr: 'shock', still: 0 },
  { t: 5.35, ...HA7, x: 1000, y: 200, ground: 0, rot: -2.4, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [2.5, 0.5]], lean: -0.3, expr: 'shock', e: E.out },
  { t: 5.48, ...HA7, rot: 0, e: E.out },
  { t: 5.55, ...KA7, still: 1, e: E.out3 },
  { t: 5.65, ...HA7, still: 0 },
  { t: 5.8, arms: [[1.2, 1.9], [2.2, 0.9]], lean: -0.1, still: 1, e: E.out3 },
  { t: 5.9, ...HA7, still: 0 },
  { t: 6.05, x: 975, arms: [[1.1, 1.8], [1.55, 0.05]], lean: 0.32, e: E.out3 },
  { t: 6.15, ...HA7 },
  { t: 6.3, arms: [[1.4, 2.1], [1.6, 2.0]], lean: -0.1, still: 1, e: E.out },
  { t: 6.42, x: 1060, y: 246, rot: -0.2, sq: -0.1, still: 0, e: E.out },
  { t: 6.52, ...HA7, x: 1040, legs: [[0.8, -1.5], [1.6, -2.2]], lean: -0.3, rot: -0.2, sq: 0 },
  { t: 6.6, ...DK7a, still: 1, e: E.out3 },
  { t: 6.72, ...DK7b, e: E.out3 },
  { t: 6.95, still: 0, x: DK7b.x + 20 },
  { t: 7.1, ...HA7, x: 1040, expr: 'grin' },
  { t: 7.5, legs: [[0.4, -0.9], [0.8, -1.3]], arms: [[1.3, 0.3], [0.2, 2.2]], lean: 0.1, expr: 'angry' },
  { t: 7.62, x: 985, y: 262, arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.35, still: 1, e: E.out3 },
  // caught by the wrist, swung, thrown down into the comet
  { t: 7.75, x: 940, y: 200, rot: -1.5, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [1.0, 0.2]], lean: -0.3, expr: 'shock', still: 0, e: E.inOut },
  { t: 7.97, x: 1100, y: HONc(1100).y + 20, rot: -3.4, sq: 0.2, e: E.in },
  { t: 8.0, alpha: 1, sq: 0 },
  { t: 8.45, ...HONc(1110), rot: 0, dir: -1, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.3, 0.4], [0.1, 0.5]], lean: 0.45, expr: 'tired', cut: true },
  { t: 8.9, legs: [[0.4, -0.8], [0.6, -1.0]], lean: 0.25 },
  { t: 9.5, legs: [[-0.3, -0.1], [0.4, -0.3]], arms: [[-0.6, 0.9], [0.5, 1.9]], lean: 0.2, aura: 1.2, expr: 'angry', e: E.out3 },
  { t: 9.8, arms: [[-1.2, 0.4], [1.3, 0.4]], hands: ['open', 'open'], lean: -0.2, aura: 1.5, expr: 'yell' },
  { t: 10.5, expr: 'angry' },
  { t: 10.6, alpha: 1 },
  // (10.6-12.0 the spear ring is placed procedurally, see spearRun7)
  { t: 12.05, ...HONc(1190), dir: -1, rot: 0, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: HP.cross2.arms, hands: ['fist', 'fist'], lean: -0.05, aura: 0.9, expr: 'smirk', cut: true },
  { t: 13.9, expr: 'shock', lean: -0.15, arms: [[0.3, 0.6], [0.5, 0.7]] },
  { t: 15.0, expr: 'shock', look: -0.6 },
  { t: 15.1, arms: [[-0.6, 0.6], [1.4, 0.3]], hands: ['fist', 'point'], expr: 'yell', look: 0 },
  { t: 16.1, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-1.0, 0.5], [-0.8, 0.6]], hands: ['fist', 'fist'], lean: 0.4, dir: 1, expr: 'determined' },
  { t: 16.3, y: HONc(1190).y - 40, ground: 0, rot: 1.2, legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[-0.6, 0.3], [2.8, 0.15]], lean: 0.1, jet: 1.2, sq: 0.2, e: E.out3 },
  { t: 18.2, x: 2900, y: 260, sq: 0.1, e: E.in },
], H_BASE);

const Z7raw = makeTrack3([
  { t: 0, x: -300, y: 60, dir: 1, ground: 0, rot: 1.0, legs: [[-0.25, -0.15], [-0.05, -0.35]], arms: [[-0.6, 0.5], [2.95, 0.05]], lean: 0.05, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 0.9, x: 0, y: 100 },
  { t: 1.45, ...ZONc(700), rot: 0, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.7, 0.5], [-0.5, 0.6]], lean: 0.35, sq: -0.12, e: E.in },
  { t: 1.7, ...ZS7, sq: 0 },
  { t: 2.9, legs: [[-0.35, -0.1], [1.25, -1.7]], lean: 0.02 },
  { t: 2.95, ...hitLegZ(ZS7, STOMP7[0], STOMP7[1]), still: 1, e: E.out3 },
  { t: 3.3, ...hitLegZ(ZS7, STOMP7[0], STOMP7[1] + 4), still: 1 },
  { t: 3.38, ...ZS7, still: 0 },
  { t: 3.58, arms: [[-1.2, 1.6], [0.85, 1.7]], tilt: -0.1 },
  { t: 3.65, ...hitArmZ(ZS7, ...HOM7[0][2], true), still: 1, e: E.out3 },
  { t: 3.75, ...ZS7, still: 0 },
  { t: 3.88, arms: [[0.6, 1.6], [2.0, 1.0]] },
  { t: 3.95, ...hitArmZ(ZS7, ...HOM7[1][2]), still: 1, e: E.out3 },
  { t: 4.05, ...ZS7, still: 0 },
  { t: 4.22, arms: [[2.2, 1.0], [2.4, 0.9]], tilt: -0.1 },
  { t: 4.3, arms: [armZ(ZS7, HOM7[2][2][0] - 10, HOM7[2][2][1], true), armZ(ZS7, ...HOM7[2][2])], still: 1, e: E.out3 },
  { t: 4.4, ...ZS7, tilt: 0, still: 0 },
  { t: 4.5, arms: [[0.6, 1.6], [2.7, 0.1]], lean: -0.15, e: E.out3 },
  { t: 4.7, ...ZS7 },
  { t: 4.8, arms: [[0.6, 1.6], [2.4, 0.6]], lean: -0.1 },
  { t: 4.9, arms: [[0.6, 1.6], [1.0, 0.1]], legs: [[0.6, -1.3], [0.8, -1.4]], lean: 0.55, e: E.out3 },
  { t: 5.15, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-1.0, 0.4], [-0.8, 0.5]], lean: 0.35 },
  { t: 5.3, y: ZS7.y - 30, ground: 0, legs: [[-0.1, -0.1], [0.1, -0.2]], arms: [[2.4, 0.3], [2.2, 0.4]], lean: 0, sq: 0.15, e: E.out3 },
  { t: 5.48, ...ZA7, sq: 0, e: E.out },
  // the aerial exchange
  { t: 5.55, ...hitArmZ(ZA7, ZA7H[0] + 30, ZA7H[1] + 14), still: 1, e: E.out3 },
  { t: 5.65, ...ZA7, still: 0 },
  { t: 5.72, arms: [[0.9, 1.6], [-0.7, 1.9]], lean: -0.1 },
  { t: 5.8, arms: [[-0.7, 1.9], [1.57, 0.04]], lean: 0.2, still: 1, e: E.out3 },
  { t: 5.9, ...ZA7, still: 0 },
  { t: 6.05, tilt: -0.22, lean: -0.15, e: E.out3 },
  { t: 6.15, ...ZA7, tilt: 0 },
  { t: 6.22, legs: [[0.85, -1.35], [1.8, -2.3]], lean: -0.05 },
  { t: 6.3, legs: [[0.85, -1.35], [1.62, -0.05]], lean: -0.3, still: 1, e: E.out3 },
  { t: 6.42, ...ZA7, still: 0 },
  { t: 6.6, ...hitArmZ(ZA7, ZA7H[0] + 26, ZA7H[1] + 46), still: 1, e: E.out3 },
  // the one that lands
  { t: 6.72, tilt: -0.35, lean: -0.25, x: ZA7.x - 10, e: E.out3 },
  { t: 7.0, tilt: -0.1, lean: -0.1, still: 0, expr: 'ok' },
  { t: 7.1, arms: [[0.6, 1.0], [0.9, 2.1]], hands: ['fist', 'open'], tilt: 0.1, e: E.out },
  { t: 7.42, arms: [[0.6, 1.0], [0.85, 2.05]] },
  { t: 7.5, ...ZA7, hands: ['fist', 'fist'], tilt: 0, expr: 'serious' },
  { t: 7.62, arms: [armZ(ZA7, 970, 266, true), [0.85, 1.7]], hands: ['open', 'fist'], still: 1, e: E.out3 },
  { t: 7.75, arms: [[2.6, 0.3], [0.85, 1.7]], hands: ['fist', 'fist'], rot: -0.5, lean: -0.2, still: 0, e: E.inOut },
  { t: 7.97, arms: [[1.2, 0.2], [0.6, 1.4]], rot: 0.3, lean: 0.4, e: E.out3 },
  { t: 8.25, ...ZF7, legs: [[1.0, -1.8], [1.2, -1.9]], lean: 0.35, rot: 0, sq: -0.1, e: E.in },
  { t: 8.45, ...ZF7, sq: 0 },
  { t: 10.55, ...ZF7, still: 1 },
  { t: 12.75, ...ZF7, still: 1 },
  // after the explosion: cape gone, suit torn, arms folded
  { t: 13.85, ...ZF7, arms: [[0.43, 2.0], [0.95, -2.5]], torn: 1, rip: 0.5, expr: 'ok', still: 0, cut: true },
  { t: 15.2, tilt: 0.15, look: -0.5 },
  { t: 16.0, tilt: 0, look: 0, expr: 'serious', legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.9, 0.4], [-0.7, 0.5]], lean: 0.4 },
  { t: 16.3, y: ZF7.y - 30, ground: 0, rot: 1.3, legs: [[-0.25, -0.15], [-0.05, -0.35]], arms: [[-0.6, 0.5], [2.95, 0.05]], lean: 0.05, sq: 0.15, e: E.out3 },
  { t: 18.2, x: 2750, y: 330, sq: 0.1, e: E.in },
], { ...Z_BASE, torn: 0, rip: 0.25 });

const H7 = animate(H7raw, { seed: 19 });
const Z7 = animate(Z7raw, { seed: 20, cape: true });

// While time is stopped Shadic runs a ring round him, setting a spear at each stop.
function spearRun7(a) {
  const u = prog(a, 10.6, 12.0);
  const th = -Math.PI + u * TAU + 0.1;
  const r = [250, 190];
  return {
    ...H7(10.6),
    x: ZF7.x + Math.cos(th) * (r[0] + 40),
    y: ZF7.y + Math.sin(th) * (r[1] + 40),
    ground: 0,
    rot: 0,
    dir: Math.cos(th) > 0 ? -1 : 1,
    legs: [[0.6, -1.2], [1.0, -1.5]],
    arms: [[-0.9, 0.6], [1.75, 0.05]],
    hands: ['fist', 'open'],
    lean: 0.2,
    expr: 'focus',
    still: 1,
  };
}
const h7At = (a) => (a >= 10.6 && a < 12.05 ? spearRun7(a) : H7(a));

const CAM7 = makeTrack([
  { t: 0, x: 700, y: 360, z: 0.75, r: 0 },
  { t: 1.45, x: 940, y: 420, z: 0.95, r: 0, e: E.out },
  { t: 2.4, x: 960, y: 430, z: 1.0, r: 0 },
  { t: 2.95, x: 760, y: 440, z: 1.3, r: 0.02, e: E.out3 },
  { t: 3.4, x: 720, y: 380, z: 1.1, r: 0 },
  { t: 4.45, x: 740, y: 360, z: 1.05, r: 0 },
  { t: 5.0, x: 860, y: 400, z: 0.95, r: 0 },
  { t: 5.5, x: 950, y: 290, z: 1.3, r: 0.02, e: E.out },
  { t: 6.72, x: 940, y: 290, z: 1.5, r: -0.04, e: E.out3 },
  { t: 7.5, x: 950, y: 290, z: 1.4, r: 0 },
  { t: 8.0, x: 1000, y: 400, z: 0.95, r: 0, e: E.out },
  { t: 9.6, x: 1050, y: 420, z: 1.1, r: 0 },
  { t: 10.6, x: 980, y: 380, z: 0.85, r: 0 },
  { t: 12.1, x: 1010, y: 390, z: 0.9, r: 0 },
  { t: 13.85, x: 960, y: 410, z: 1.35, r: 0, e: E.out },
  { t: 15.0, x: 1020, y: 420, z: 1.1, r: 0 },
  { t: 16.1, x: 1050, y: 440, z: 0.85, r: 0.02 },
  { t: 18.2, x: 2700, y: 300, z: 0.9, r: 0, e: E.in },
]);

const L7 = [
  [1.25, 2.3, 'shadic', 'Last stop before the Sun!'],
  [7.0, 7.45, 'shadic', 'GOT you!', { shout: true }],
  [8.6, 9.5, 'shadic', 'Not... done... YET!', { shout: true }],
  [9.8, 10.55, 'shadic', 'CHAOS CONTROL!', { shout: true }],
  [12.15, 12.7, 'shadic', '...And time resumes.'],
  [14.05, 15.0, 'saitama', '...Okay. That one stung.'],
  [15.1, 16.0, 'shadic', "The comet's breaking up!", { shout: true }],
];

fightScene({
  id: 'comet',
  name: 'The Comet',
  dur: 18.2,
  lines: L7,
  holds: [[2.95, 0.06, 10], [3.65, 0.05, 8], [3.95, 0.05, 8], [4.3, 0.06, 10], [5.55, 0.04, 6], [5.8, 0.04, 6], [6.3, 0.05, 8], [6.6, 0.04, 6], [6.72, 0.24, 22, true], [7.97, 0.1, 18], [12.9, 0.3, 30, true]],
  music: [[0, 'hyper'], [10.55, 'none'], [12.9, 'hyper']],
  cues: [
    [0.65, 'jet'], [0.85, 'thud'], [1.45, 'thud'], [2.45, 'zip'], [2.85, 'rev'], [2.95, 'thud'], [2.96, 'grind'], [3.36, 'spring'],
    [3.65, 'block'], [3.95, 'block'], [4.3, 'block'], [4.5, 'miss'], [4.9, 'punch'], [4.92, 'crack'], [5.0, 'jet'], [5.02, 'boom'],
    [5.55, 'block'], [5.8, 'block'], [6.05, 'miss'], [6.3, 'block'], [6.6, 'block'], [6.72, 'punch'], [6.73, 'hit'], [7.62, 'snap'], [7.75, 'whirl'], [7.97, 'bigboom'],
    [9.5, 'charge'], [10.55, 'chaos'], ...RING7.map((r) => [r.t, 'spear']), [12.75, 'unfreeze'], [12.9, 'bigboom'], [12.92, 'boom'],
    [15.0, 'rumble'], [15.3, 'crack'], [16.1, 'bigboom'], [16.3, 'blast'],
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM7(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + (a > 15.0 ? 5 + 8 * prog(a, 15.0, 16.2) : 0) + (a > 1.45 && a < 1.7 ? 8 : 0));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z };
    const z = Z7(a);
    const h = h7At(a);
    const frozen = a > 10.55 && a < 12.75;
    const tt = frozen ? 10.55 : lt;
    cometBG(ctx, cs, tt, {
      geysers: [[900, 5.0], [400, 15.3], [1500, 15.45], [1250, 15.7], [600, 15.85], [1800, 15.6]].map(([x, t0]) => [x, t0 + (lt - a)]),
      craters: a > 7.97 ? [[1100, 120]] : [],
      glow: 0.9 * prog(a, 15.0, 16.0),
      split: E.in(prog(a, 16.1, 18.2)),
    });
    ctx.save();
    camApply(ctx, cs);
    // the crack running from his punch to the geyser
    if (a > 4.9 && a < 6.5) {
      const k = prog(a, 4.9, 5.0);
      ctx.beginPath();
      ctx.moveTo(760, cometY(760) + 2);
      for (let x = 760; x <= lerp(760, 900, k); x += 14) ctx.lineTo(x, cometY(x) + 4 + (hash(x) - 0.5) * 8);
      strokeNow(ctx, 3, '#2b3442');
    }
    if (a > 7.97 && a < 9.5) puffs(ctx, 1100, cometY(1100), prog(a, 7.97, 9.5), { n: 12, spread: 160, seed: 79, size: 30, rise: 60, color: '#e9f2fa', shade: '#b9c8d8' });
    // the spear ring: set one by one in frozen time, then all at once
    for (const r of RING7) {
      if (a < r.t) continue;
      const ang = Math.atan2(ZF7.y - r.y, ZF7.x - r.x);
      if (a < 12.75) hyperSpear(ctx, r.x, r.y, ang, 0.8, 1, tt);
      else if (a < 12.9) {
        const u = prog(a, 12.75, 12.9);
        hyperSpear(ctx, lerp(r.x, ZF7.x, u), lerp(r.y, ZF7.y - 30, u), ang, 0.8, 1, lt);
      }
    }
    if ((a > 2.45 && a < 2.95) || (a > 3.36 && a < 4.45)) rainbowRibbon(ctx, pastPts(H7, a, 9, 0.016).map(([x, y]) => [x, y + (h.ball ? BALLUP : 0)]), 26, lt, 0.85);
    if (a > 10.6 && a < 12.05) {
      const pts = [];
      for (let k = 0; k < 12; k++) pts.push(ptH(spearRun7(Math.max(10.6, a - k * 0.03)), 'center'));
      rainbowRibbon(ctx, pts, 26, lt, 0.9);
    }
    const hide = a > 12.9 && a < 13.85;
    if (!hide) drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: blinkAt(a, 3.4, 12) });
    if (frozen) {
      ctx.restore();
      desaturate(ctx, prog(a, 10.55, 10.75) * (1 - prog(a, 12.65, 12.75)));
      ctx.save();
      camApply(ctx, cs);
    }
    if (a > 7.62 && a < 7.97) ghostsOf(ctx, H7, a, 3, 0.025, drawH, 0.3);
    if (a > 16.3) {
      rainbowRibbon(ctx, pastPts(H7, a, 10, 0.03), 30, lt, 0.9);
      ghostsOf(ctx, Z7, a, 3, 0.03, drawZ, 0.25);
    }
    drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 21) });
    // the explosion where the ring met
    if (a > 12.9 && a < 14.2) {
      const k = prog(a, 12.9, 14.2);
      circle(ctx, ZF7.x, ZF7.y - 20, 60 + 220 * E.out3(Math.min(1, k * 2.5)), `rgba(255,250,235,${0.9 * (1 - prog(k, 0.15, 0.4))})`);
      puffs(ctx, ZF7.x, ZF7.y + 60, k, { n: 18, spread: 260, seed: 81, size: 64, rise: 30, flat: 0.8, color: '#e2e6ee', shade: '#a9b0bf' });
    }
    for (const [ht, , tgt] of HOM7) hit3(ctx, tgt[0], tgt[1] - 10, lt - realT(ht, hs), 0.5, Math.round(ht * 10), true);
    hit3(ctx, STOMP7[0], STOMP7[1] - 10, lt - realT(2.95, hs), 0.6, 29, true);
    hit3(ctx, ZA7H[0] + 22, ZA7H[1] + 2, lt - realT(6.72, hs), 0.9, 67, true);
    hit3(ctx, 1100, cometY(1100), lt - realT(7.97, hs), 1.2, 79, false);
    whiff(ctx, ZS7H[0], ZS7H[1] - 60, -Math.PI / 2, a - 4.5, 50);
    if (a > 10.55 && a < 10.8) warpRing(ctx, h.x, h.y, (a - 10.55) * 2, 1.4);
    ctx.restore();
    if (a > 10.55 && a < 10.8) flash(ctx, 0.5 * (1 - prog(a, 10.55, 10.8)), '#bfffd8');
    if (a > 12.75 && a < 12.9) flash(ctx, 0.4, '#ffffff');
    if (a > 17.6) flash(ctx, prog(a, 17.6, 18.2), '#fff6dc');
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { if (fr.h.a !== 12.9) drawZ(g, z, a, {}); drawH(g, h, a, {}); }, ...(fr.h.a === 12.9 ? [ZF7.x, ZF7.y] : [ZA7H[0], ZA7H[1]]), lt);
    talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
  },
});
