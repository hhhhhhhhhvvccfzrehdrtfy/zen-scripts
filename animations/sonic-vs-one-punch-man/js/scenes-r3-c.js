'use strict';
/* Round 3, chapter 3: the Moon. Low gravity, so every landing bounces and every jump floats. Shadic
   craters in, spin-dashes out, rains Chaos Spears, and ricochets between rocks the missed punch threw
   up; Saitama ends it with a kick. On the surface feet are planted (ground 1) at y = MOON_G. */

const ZG3 = MOON_G - 150; // Saitama's centre when standing on the Moon
const HG3 = MOON_G - SS * HC; // Shadic's
const BALLUP = 40; // a curled-up hedgehog's ball sits this far below his keyed centre

// Saitama's standing guard on the Moon, and the points his blocks meet.
const ZS3 = { x: 640, y: ZG3, dir: 1, ground: 1, legs: [[-0.35, -0.1], [0.4, -0.3]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.06, rot: 0 };
const ZS3L = { ...ZS3, dir: -1, x: 640 };
const SPC3 = [606, 394]; // where he catches the spear
const KF3 = (() => {
  // Shadic's rising kick, its foot meeting Saitama's raised forearm
  return atH('foot', [676, 410], { dir: -1, ground: 1, legs: [[-0.15, -0.05], [2.45, -0.05]], arms: [[-1.4, 0.5], [-1.2, 0.6]], lean: -0.6, rot: 0, expr: 'angry' });
})();
const BLK3 = [[12.15, [596, 440], true], [12.57, [686, 378], false], [12.97, [672, 562], false], [13.37, [628, 316], true]];
const KICK3 = [692, 524];

const ROCKS3 = [[300, 470, 40, 2], [930, 360, 46, 5], [1010, 520, 38, 7], [440, 300, 42, 3]];

const H3raw = makeTrack3([
  { t: 0, x: 260, y: 60, dir: 1, rot: 2.2, legs: [[0.6, -0.4], [-0.3, -0.8]], arms: [[-2.2, 0.4], [2.4, 0.5]], expr: 'shock', aura: 0.3, ball: 0, spin: 0, alpha: 1, ground: 0, hands: ['fist', 'fist'] },
  { t: 0.88, x: 900, y: 560, rot: 8.6, lin: true, e: E.in },
  { t: 0.9, alpha: 0 },
  { t: 2.7, x: 900, y: HG3 + 5, ball: 1, spin: 0, rot: 0, alpha: 0, cut: true },
  { t: 2.72, alpha: 1 },
  { t: 3.0, x: 906, spin: 26, e: E.in },
  { t: 3.55, x: 548, spin: 72, e: E.in },
  { t: 3.85, x: 300, spin: 104, e: E.out },
  { t: 4.05, x: 245, y: 470, spin: 118 },
  { t: 4.3, x: 360, y: 260, spin: 140, e: E.out },
  { t: 4.4, ball: 0, x: 400, y: 240, legs: [[0.5, -1.1], [0.95, -1.5]], arms: [[-0.5, 0.7], [0.3, 1.2]], rot: -0.1, lean: -0.1, expr: 'angry', jet: 0.6 },
  // Chaos Spear rain, thrown down at him as he runs
  { t: 4.52, x: 420, arms: [[0.2, 1.4], [-2.4, 0.5]], lean: -0.2, e: E.out },
  { t: 4.62, arms: [[-0.8, 0.6], [1.0, 0.1]], lean: 0.35, rot: 0.2, e: E.out3 },
  { t: 4.76, arms: [[-2.4, 0.5], [0.4, 1.2]], lean: -0.15, rot: 0 },
  { t: 4.86, arms: [[1.0, 0.1], [-0.7, 0.8]], lean: 0.35, rot: 0.2, e: E.out3 },
  { t: 5.0, x: 480, arms: [[0.2, 1.4], [-2.4, 0.5]], lean: -0.2, rot: 0 },
  { t: 5.1, arms: [[-0.8, 0.6], [1.0, 0.1]], lean: 0.35, rot: 0.2, e: E.out3 },
  { t: 5.24, arms: [[-2.4, 0.5], [0.4, 1.2]], lean: -0.15, rot: 0 },
  { t: 5.34, arms: [[1.0, 0.1], [-0.7, 0.8]], lean: 0.35, rot: 0.2, e: E.out3 },
  { t: 5.5, x: 560, arms: [[-2.3, 0.5], [-2.2, 0.6]], lean: -0.25, rot: -0.05 },
  { t: 5.62, arms: [[1.1, 0.1], [0.9, 0.1]], lean: 0.4, rot: 0.25, e: E.out3 },
  { t: 6.0, x: 600, y: 236, arms: [[-0.4, 0.8], [0.3, 1.2]], lean: 0, rot: 0, expr: 'grin' },
  { t: 6.55, arms: [[0.2, 1.4], [-2.4, 0.5]], lean: -0.2, expr: 'angry', e: E.out },
  { t: 6.65, arms: [[-0.8, 0.6], [1.0, 0.1]], lean: 0.35, rot: 0.2, e: E.out3 },
  { t: 6.9, arms: [[-0.4, 0.8], [0.3, 1.2]], lean: 0.05, rot: 0 },
  { t: 7.36, arms: [[-0.4, 0.8], [1.6, 1.4]], lean: -0.1, expr: 'shock' },
  { t: 7.42, arms: [[-0.4, 0.8], [2.2, 0.4]], hands: ['fist', 'open'], lean: -0.15, still: 1, e: E.out3 },
  { t: 7.5, arms: [[-0.4, 0.8], [0.3, 1.2]], hands: ['fist', 'fist'], lean: 0, still: 0, expr: 'angry' },
  // dive in, sweep, rising kick, then gone before the counter lands
  { t: 7.6, legs: [[1.4, -2.2], [1.6, -2.3]], lean: 0.35, rot: -0.4, jet: 0, e: E.out },
  { t: 7.72, x: 700, y: 420, legs: [[-0.2, -0.15], [-0.05, -0.25]], arms: [[2.75, 0.2], [2.95, 0.1]], rot: 2.6, lean: 0.05, e: E.in },
  { t: 7.82, x: 770, y: HG3, dir: -1, ground: 1, rot: 0, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.6, 0.6], [0.5, 1.2]], lean: 0.4, sq: -0.14, e: E.in },
  { t: 7.92, sq: 0 },
  { t: 8.0, x: 758, legs: [[1.2, -2.1], [1.45, -0.05]], arms: [[-1.6, 0.4], [-1.4, 0.5]], lean: 0.65, rot: 0.15, e: E.out3 },
  { t: 8.14, x: 762, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.6, 0.6], [0.5, 1.2]], lean: 0.4, rot: 0 },
  { t: 8.3, legs: [[0.9, -1.8], [1.4, -2.2]], lean: 0.2, e: E.out },
  { t: 8.4, ...KF3, still: 1, e: E.out3 },
  { t: 8.55, x: KF3.x + 22, legs: [[0.4, -0.8], [1.0, -1.6]], lean: -0.1, still: 0 },
  { t: 8.66, alpha: 1 },
  { t: 8.68, alpha: 0 },
  // back on a rock to the left, staring at the canyon
  { t: 9.0, x: 470, y: HG3, dir: 1, ground: 1, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: [[0.1, 0.4], [0.0, 0.4]], lean: -0.05, rot: 0, expr: 'shock', alpha: 0, cut: true },
  { t: 9.02, alpha: 1 },
  { t: 9.9, arms: [[0.1, 0.4], [1.5, 0.1]], hands: ['fist', 'point'], lean: 0.15, expr: 'angry', e: E.out3 },
  { t: 10.9, arms: HP.cross2.arms, hands: ['fist', 'fist'], lean: 0, expr: 'scowl' },
  { t: 11.5, legs: [[1.0, -1.9], [1.25, -2.0]], lean: 0.45, e: E.out },
  // pinball: rock, Saitama, rock, Saitama...
  { t: 11.62, ball: 1, spin: 0, x: 470, y: HG3 + 5 - 0 },
  { t: 11.8, x: 444, spin: 20 },
  { t: 11.95, x: 300, y: 470 - BALLUP, spin: 40, lin: true, e: E.lin, ground: 0 },
  { t: 12.15, x: 568, y: 440 - BALLUP, spin: 52, lin: true, e: E.lin },
  { t: 12.37, x: 930, y: 360 - BALLUP, spin: 66, lin: true, e: E.lin },
  { t: 12.57, x: 712, y: 372 - BALLUP, spin: 80, lin: true, e: E.lin },
  { t: 12.77, x: 1010, y: 520 - BALLUP, spin: 94, lin: true, e: E.lin },
  { t: 12.97, x: 700, y: 578 - BALLUP, spin: 108, lin: true, e: E.lin },
  { t: 13.17, x: 440, y: 300 - BALLUP, spin: 122, lin: true, e: E.lin },
  { t: 13.37, x: 620, y: 290 - BALLUP, spin: 136, lin: true, e: E.lin },
  { t: 13.6, x: 860, y: 590 - BALLUP, spin: 150, lin: true, e: E.lin },
  { t: 13.85, x: 718, y: 520 - BALLUP, spin: 166, lin: true, e: E.lin },
  { t: 14.3, x: 1500, y: -380 - BALLUP, spin: 260, lin: true, e: E.out },
  { t: 14.32, alpha: 0 },
  { t: 15.0 },
], H_BASE);

const Z3raw = makeTrack3([
  { t: 0, x: 380, y: 80, dir: 1, ground: 0, legs: [[0.85, -1.3], [1.15, -1.65]], arms: [[1.0, 0.8], [1.2, 0.9]], rot: 0.25, lean: 0, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 1.5, x: 515, y: ZG3 - 5, rot: 0, legs: [[0.3, -0.4], [0.5, -0.6]], arms: [[0.8, 0.7], [1.0, 0.8]], ground: 1, e: E.in },
  { t: 1.6, x: 520, y: ZG3, legs: [[0.95, -1.75], [1.15, -1.85]], arms: [[-0.6, 0.5], [-0.4, 0.6]], lean: 0.32, sq: -0.1, e: E.out },
  { t: 1.95, y: ZG3 - 34, legs: [[0.2, -0.3], [0.35, -0.45]], arms: [[0.3, 0.5], [0.5, 0.6]], lean: 0.05, sq: 0.05, e: E.out },
  { t: 2.3, y: ZG3, legs: [[0.4, -0.7], [0.6, -0.9]], lean: 0.12, sq: -0.04, e: E.in },
  { t: 2.5, legs: [[-0.2, -0.05], [0.25, -0.1]], arms: [[0.3, 0.9], [0.5, 1.0]], lean: 0.04, sq: 0 },
  { t: 3.25, legs: [[0.75, -1.45], [0.95, -1.55]], arms: [[-1.0, 0.4], [-0.8, 0.5]], lean: 0.28, e: E.out },
  { t: 3.42, y: ZG3 - 30, legs: [[-0.1, -0.1], [0.1, -0.2]], arms: [[2.3, 0.3], [2.1, 0.4]], lean: -0.05, sq: 0.1, e: E.out3 },
  { t: 3.75, x: 548, y: 335, legs: [[1.2, -2.0], [1.4, -2.1]], arms: [[0.6, 1.0], [0.8, 1.1]], lean: 0.2, rot: 0.12, sq: 0, e: E.out },
  { t: 4.12, x: 572, y: ZG3 - 4, legs: [[0.3, -0.4], [0.5, -0.6]], rot: 0, e: E.in },
  { t: 4.2, y: ZG3, legs: [[0.95, -1.7], [1.1, -1.8]], lean: 0.3, sq: -0.08 },
  // bounding across the plain, each stride its own
  { t: 4.4, x: 590, legs: [[-0.75, -0.2], [0.8, -0.9]], arms: [[0.7, 1.5], [-0.5, 1.4]], lean: 0.28, sq: 0 },
  { t: 4.62, x: 640, y: ZG3 - 24, legs: [[-0.3, -1.3], [0.45, -0.5]], arms: [[0.3, 1.5], [-0.1, 1.4]] },
  { t: 4.85, x: 690, y: ZG3, legs: [[0.8, -0.85], [-0.7, -0.25]], arms: [[-0.5, 1.4], [0.7, 1.6]], lean: 0.3 },
  { t: 5.07, x: 742, y: ZG3 - 26, legs: [[0.4, -0.5], [-0.3, -1.3]], lean: 0.26 },
  { t: 5.3, x: 792, y: ZG3, legs: [[-0.75, -0.2], [0.85, -0.9]], arms: [[0.7, 1.5], [-0.5, 1.4]], lean: 0.3 },
  { t: 5.52, x: 832, y: ZG3 - 18, legs: [[0.2, -0.6], [0.9, -0.6]], lean: -0.15 },
  { t: 5.72, x: 850, y: ZG3, legs: [[0.75, -0.3], [1.0, -0.15]], arms: [[-1.4, 0.4], [-1.6, 0.3]], lean: -0.32 },
  { t: 5.8, dir: -1, legs: [[-0.6, -0.2], [0.7, -0.8]], arms: [[0.7, 1.5], [-0.5, 1.4]], lean: 0.25 },
  { t: 6.0, x: 800, y: ZG3 - 24, legs: [[-0.3, -1.2], [0.45, -0.5]], arms: [[0.3, 1.5], [-0.1, 1.4]] },
  { t: 6.22, x: 748, y: ZG3, legs: [[0.8, -0.85], [-0.7, -0.25]], arms: [[-0.5, 1.4], [0.7, 1.6]] },
  { t: 6.45, x: 700, y: ZG3 - 22, legs: [[0.4, -0.5], [-0.3, -1.3]] },
  { t: 6.68, x: 655, y: ZG3, legs: [[-0.6, -0.2], [0.7, -0.7]], lean: 0.15 },
  { t: 6.85, ...ZS3L, legs: [[-0.3, -0.1], [0.35, -0.25]], lean: 0.02 },
  { t: 7.0, ...hitArmZ(ZS3L, SPC3[0], SPC3[1], false, true), hands: ['fist', 'finger'], still: 1, e: E.out3 },
  { t: 7.12, arms: [[0.6, 1.6], [-1.9, 1.2]], lean: -0.2, still: 0, e: E.out },
  { t: 7.25, arms: [[0.6, 1.6], [2.6, 0.1]], hands: ['fist', 'open'], lean: 0.15, e: E.out3 },
  { t: 7.45, ...ZS3L, hands: ['fist', 'fist'] },
  { t: 7.6, dir: 1, x: 640 },
  { t: 7.88, legs: [[0.6, -1.2], [0.8, -1.3]], lean: 0.2, e: E.out },
  { t: 7.95, y: ZG3 - 30, legs: [[0.9, -1.6], [1.1, -1.7]], e: E.out3 },
  { t: 8.05, y: ZG3 - 40, legs: [[1.1, -1.9], [1.3, -2.0]], lean: 0.1 },
  { t: 8.25, y: ZG3, legs: [[0.5, -1.0], [0.7, -1.1]], sq: -0.05, e: E.in },
  { t: 8.32, ...ZS3, sq: 0 },
  { t: 8.4, ...hitArmZ(ZS3, 672, 410), still: 1, e: E.out3 },
  { t: 8.52, arms: [[0.9, 1.6], [-0.7, 1.9]], lean: -0.12, still: 0 },
  { t: 8.7, legs: [[-0.5, -0.05], [0.45, -0.4]], arms: [[-0.7, 1.9], [1.57, 0.04]], lean: 0.2, e: E.out3 },
  { t: 9.6, lean: 0.18 },
  { t: 9.9, arms: [[0.1, 0.4], [1.4, 0.2]], lean: 0.05, tilt: -0.05 },
  { t: 10.9, arms: [[0.1, 0.4], [0.9, 1.3]], hands: ['fist', 'open'], tilt: 0.15, expr: 'ok' },
  { t: 11.5, ...ZS3, hands: ['fist', 'fist'], tilt: 0, expr: 'serious' },
  // pinball blocks
  { t: 12.05, arms: [[-1.0, 1.0], [0.85, 1.7]] },
  { t: 12.15, ...hitArmZ(ZS3, ...BLK3[0][1], true), still: 1, e: E.out3 },
  { t: 12.25, ...ZS3, still: 0 },
  { t: 12.5, arms: [[0.6, 1.6], [1.6, 1.2]] },
  { t: 12.57, ...hitArmZ(ZS3, ...BLK3[1][1]), still: 1, e: E.out3 },
  { t: 12.67, ...ZS3, still: 0 },
  { t: 12.9, arms: [[0.6, 1.6], [0.9, 0.6]], lean: 0.15 },
  { t: 12.97, ...hitArmZ({ ...ZS3, lean: 0.2 }, ...BLK3[2][1]), still: 1, e: E.out3 },
  { t: 13.07, ...ZS3, still: 0 },
  { t: 13.3, arms: [[2.0, 0.8], [0.85, 1.7]], tilt: -0.1 },
  { t: 13.37, ...hitArmZ(ZS3, ...BLK3[3][1], true), tilt: -0.15, still: 1, e: E.out3 },
  { t: 13.47, ...ZS3, tilt: 0, still: 0 },
  { t: 13.7, legs: [[-0.35, -0.1], [1.6, -2.2]], arms: [[-0.6, 0.8], [0.3, 1.0]], lean: -0.15 },
  { t: 13.85, ...hitLegZ({ ...ZS3, lean: -0.35, arms: [[-0.9, 0.6], [0.5, 0.8]] }, KICK3[0], KICK3[1]), still: 1, e: E.out3 },
  { t: 14.0, legs: [[-0.35, -0.1], [2.4, -0.1]], lean: -0.4, still: 0 },
  { t: 14.3, legs: [[1.0, -1.9], [1.2, -2.0]], arms: [[-1.0, 0.4], [-0.8, 0.5]], lean: 0.35 },
  { t: 14.5, y: 300, ground: 0, legs: [[-0.05, -0.05], [0.05, -0.1]], arms: [[2.6, 0.2], [2.4, 0.3]], lean: 0, rot: 0.4, sq: 0.15, e: E.out3 },
  { t: 14.8, x: 900, y: -200, sq: 0, e: E.in },
  { t: 15.0 },
], Z_BASE);

const H3 = animate(H3raw, { seed: 7 });
const Z3 = animate(Z3raw, { seed: 8, cape: true });

// Spears: [release, from, to, flight].
const SPEAR3 = [
  [4.62, [430, 232], [650, MOON_G]], [4.62, [430, 232], [720, MOON_G]], [4.86, [430, 236], [700, MOON_G]], [4.86, [430, 236], [790, MOON_G]],
  [5.1, [490, 232], [760, MOON_G]], [5.1, [490, 232], [860, MOON_G]], [5.34, [490, 236], [810, MOON_G]], [5.34, [490, 236], [900, MOON_G]],
  [5.62, [570, 236], [900, MOON_G]], [5.62, [570, 236], [940, MOON_G]], [5.62, [550, 236], [860, MOON_G]], [5.62, [550, 236], [980, MOON_G]],
].map(([t0, from, to]) => ({ t0, from, to, dur: 0.24 }));
const CATCH3 = { t0: 6.65, from: [612, 230], to: SPC3, dur: 0.35 };

const CAM3 = makeTrack([
  { t: 0, x: 520, y: 300, z: 0.8, r: 0 },
  { t: 0.88, x: 820, y: 470, z: 0.9, r: 0.02, e: E.in },
  { t: 1.6, x: 640, y: 470, z: 1.0, r: 0 },
  { t: 2.6, x: 700, y: 480, z: 1.05, r: 0 },
  { t: 3.0, x: 800, y: 500, z: 1.1, r: 0 },
  { t: 3.55, x: 600, y: 460, z: 0.95, r: -0.02 },
  { t: 4.3, x: 520, y: 420, z: 0.95, r: 0 },
  { t: 4.62, x: 620, y: 430, z: 1.05, r: 0 },
  { t: 5.3, x: 760, y: 440, z: 1.1, r: 0.01 },
  { t: 5.75, x: 820, y: 440, z: 1.1, r: 0 },
  { t: 6.8, x: 660, y: 420, z: 1.05, r: 0 },
  { t: 7.25, x: 640, y: 380, z: 0.95, r: 0 },
  { t: 7.82, x: 700, y: 470, z: 1.15, r: 0 },
  { t: 8.4, x: 700, y: 450, z: 1.3, r: 0.02 },
  { t: 8.7, x: 760, y: 470, z: 1.2, r: 0 },
  { t: 9.35, x: 1400, y: 470, z: 0.55, r: 0, e: E.inOut },
  { t: 9.86, x: 1380, y: 470, z: 0.55, r: 0 },
  { t: 9.87, x: 560, y: 470, z: 1.15, r: 0 },
  { t: 11.6, x: 600, y: 460, z: 1.05, r: 0 },
  { t: 11.9, x: 660, y: 440, z: 1.0, r: 0, e: E.out },
  { t: 12.6, x: 680, y: 430, z: 1.05, r: 0.02 },
  { t: 13.2, x: 650, y: 420, z: 1.05, r: -0.02 },
  { t: 13.6, x: 690, y: 450, z: 1.05, r: 0 },
  { t: 13.85, x: 700, y: 470, z: 1.05, r: 0, e: E.out3 },
  { t: 14.3, x: 900, y: 300, z: 0.85, r: 0 },
  { t: 15.0, x: 1000, y: 100, z: 0.8, r: 0.03 },
]);

const L3 = [
  [9.9, 10.9, 'shadic', "You'll BREAK the Moon!", { shout: true }],
  [10.95, 11.6, 'saitama', '...Oops.'],
];

fightScene({
  id: 'moon',
  name: 'The Moon',
  dur: 15.0,
  lines: L3,
  holds: [[0.88, 0.12, 22], [7.42, 0.04, 6], [8.4, 0.06, 10], [8.7, 0.12, 20, true], [12.15, 0.05, 8], [12.57, 0.05, 8], [12.97, 0.05, 8], [13.37, 0.05, 8], [13.85, 0.12, 18, true]],
  music: [[0, 'hyper']],
  cues: [
    [0, 'whoosh'], [0.88, 'bigboom'], [0.9, 'crack'], [1.6, 'thud'], [2.3, 'thud'], [2.72, 'rev'], [3.0, 'grind'], [3.42, 'whoosh'], [4.2, 'thud'],
    ...SPEAR3.map((s) => [s.t0, 'spear']), ...SPEAR3.map((s) => [s.t0 + s.dur, 'hit']), [6.65, 'spear'], [7.0, 'clink'], [7.25, 'swing'], [7.42, 'block'],
    [7.72, 'whoosh'], [7.82, 'thud'], [8.0, 'swing'], [8.4, 'block'], [8.66, 'tele'], [8.7, 'punch'], [8.72, 'bigboom'], [8.9, 'rumble'], [9.0, 'tele'],
    [11.62, 'rev'], [11.95, 'crunch'], [12.15, 'block'], [12.37, 'crunch'], [12.57, 'block'], [12.77, 'crunch'], [12.97, 'block'], [13.17, 'crunch'], [13.37, 'block'], [13.6, 'thud'],
    [13.85, 'punch'], [13.87, 'boom'], [14.5, 'blast'],
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM3(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + 8 * env(a, 0.88, 2.0, 0.1) + 6 * env(a, 8.7, 10.0, 0.2));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z };
    const z = Z3(a);
    const h = H3(a);
    moonSurface(ctx, cs, lt, {
      ex: 280,
      ey: -230,
      crater: a > 0.88 ? [900, 210, E.out3(prog(a, 0.88, 1.1))] : null,
      trench: a > 3.0 ? [906, 300, prog(a, 3.0, 3.85)] : null,
      canyon: a > 8.7 ? [700, E.out(prog(a, 8.7, 9.5))] : null,
    });
    ctx.save();
    camApply(ctx, cs);
    // the crash: a dust plume that hangs and drifts in the low gravity
    puffs(ctx, 900, MOON_G, prog(a, 0.88, 3.4), { n: 18, spread: 260, seed: 31, size: 46, rise: 130, color: '#d8d4e2', shade: '#a39fb2' });
    debris(ctx, 900, MOON_G - 10, a - 0.88, { n: 14, seed: 32, v: 520, floor: MOON_G + 6, size: 11, col: '#9a95a8', life: 3 });
    if (a > 2.72 && a < 3.9) puffs(ctx, h.x + 30, MOON_G, (a * 5) % 1, { n: 4, spread: 50, seed: Math.floor(a * 5), size: 20, dx: 60, color: '#d8d4e2', shade: '#a39fb2' });
    // floating rocks the punch threw up, for the pinball
    if (a > 8.8) {
      const k = E.out3(prog(a, 8.8, 9.6));
      ROCKS3.forEach(([rx, ry, rr, seed], i) => {
        const bob = Math.sin(a * 0.8 + i) * 6;
        rock(ctx, lerp(700 + i * 40, rx, k), lerp(MOON_G, ry, k) + bob, rr, seed, a * 0.2 * (i % 2 ? 1 : -1) + i);
      });
    }
    for (const s of SPEAR3) {
      const u = (a - s.t0) / s.dur;
      if (u < 0) continue;
      const ang = Math.atan2(s.to[1] - s.from[1], s.to[0] - s.from[0]);
      if (u < 1) hyperSpear(ctx, lerp(s.from[0], s.to[0], u), lerp(s.from[1], s.to[1], u), ang, 0.7, 1, lt);
      else {
        const after = a - s.t0 - s.dur;
        hyperSpear(ctx, s.to[0] - Math.cos(ang) * 14, s.to[1] - Math.sin(ang) * 14, ang, 0.7, 1 - prog(after, 0.2, 0.8), lt);
        puffs(ctx, s.to[0], MOON_G, prog(after, 0, 1.6), { n: 7, spread: 70, seed: s.to[0], size: 22, rise: 90, color: '#d8d4e2', shade: '#a39fb2' });
        hit3(ctx, s.to[0], MOON_G - 6, after, 0.35, s.to[0], true);
      }
    }
    if (a > CATCH3.t0) {
      const u = (a - CATCH3.t0) / CATCH3.dur;
      const ang = Math.atan2(CATCH3.to[1] - CATCH3.from[1], CATCH3.to[0] - CATCH3.from[0]);
      if (u < 1) hyperSpear(ctx, lerp(CATCH3.from[0], CATCH3.to[0], u), lerp(CATCH3.from[1], CATCH3.to[1], u), ang, 0.7, 1, lt);
      else if (a < 7.25) {
        const [fx, fy] = ptZ(z, 'finger');
        hyperSpear(ctx, fx, fy, a < 7.12 ? ang : ang + Math.PI, 0.6, 1, lt);
      } else if (a < 7.42) {
        // thrown back up at him
        const st = ptZ(Z3(7.25), 'hand');
        const tg = ptH(H3(7.42), 'hand');
        const u2 = prog(a, 7.25, 7.42);
        hyperSpear(ctx, lerp(st[0], tg[0], u2), lerp(st[1], tg[1], u2), Math.atan2(tg[1] - st[1], tg[0] - st[0]), 0.7, 1, lt);
      } else if (a < 8.0) {
        const tg = ptH(H3(7.42), 'hand');
        const k = a - 7.42;
        hyperSpear(ctx, tg[0] + k * 900, tg[1] - k * 1200, -0.93, 0.7, 1 - prog(k, 0.2, 0.5), lt);
      }
    }
    if (a > 3.0 && a < 3.85) rainbowRibbon(ctx, pastPts(H3, a, 8, 0.018).map(([x, y]) => [x, y + BALLUP]), 26, lt, 0.8);
    if (a > 11.8 && a < 14.3) rainbowRibbon(ctx, pastPts(H3, a, 9, 0.016).map(([x, y]) => [x, y + BALLUP]), 26, lt, 0.85);
    if ((a > 0.3 && a < 0.88) || (a > 7.6 && a < 7.82)) ghostsOf(ctx, H3, a, 3, 0.03, drawH, 0.25);
    if (a > 14.45) ghostsOf(ctx, Z3, a, 3, 0.03, drawZ, 0.25);
    drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: blinkAt(a, 3.4, 4) });
    drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 9) });
    for (const [ha, pt, far] of BLK3) hit3(ctx, pt[0] + (far ? -10 : 12), pt[1], lt - realT(ha, hs), 0.4, Math.round(ha * 10), true);
    ROCKS3.forEach(([rx, ry], i) => hit3(ctx, rx, ry, lt - realT([11.95, 12.37, 12.77, 13.17][i], hs), 0.35, 40 + i, true));
    hit3(ctx, KICK3[0] + 14, KICK3[1], lt - realT(13.85, hs), 0.9, 13, false);
    hit3(ctx, 676, 410, lt - realT(8.4, hs), 0.45, 84, true);
    hit3(ctx, ...ptH(H3(7.42), 'hand'), lt - realT(7.42, hs), 0.3, 74, true);
    whiff(ctx, 640, MOON_G - 30, Math.PI / 2, a - 8.0, 40);
    punchWave(ctx, 720, 410, 0, a - 8.7, 1300, { life: 0.8 });
    warpRing(ctx, KF3.x + 22, KF3.y, a - 8.66, 0.6);
    warpRing(ctx, 470, HG3, a - 9.0, 0.6);
    if (a > 9.0 && a < 9.86) {
      // the canyon tearing toward the horizon kicks up a wall of dust
      const u = prog(a, 8.7, 9.5);
      for (let i = 0; i < 6; i++) puffs(ctx, 760 + u * 1900 * (i / 6), MOON_G, prog(a, 8.75 + i * 0.1, 10.5), { n: 5, spread: 80, seed: 90 + i, size: 34, rise: 140, color: '#d8d4e2', shade: '#a39fb2' });
    }
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { drawZ(g, z, a, {}); drawH(g, h, a, {}); }, z.x + 40, z.y, lt);
    talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
  },
});
