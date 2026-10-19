'use strict';
/* Round 3, chapter 4: the asteroid belt. A rock-hopping chase, a barrage of thrown asteroids, Serious
   Side Hops against Chaos Control (a frozen-time flurry, every blow its own), and the first time
   anything moves Saitama. Ends with Shadic punched through five asteroids toward Jupiter. */

// Rocks fixed in the action plane: [x, y, r, sprite, breaks at].
const ROCKS4 = [
  [560, 520, 80, 1, 2.05], [260, 560, 70, 4, 2.25], [900, 600, 80, 6, 2.9], [1500, 420, 70, 2, 3.6], [2100, 600, 85, 8, 4.3],
  [2650, 440, 75, 3, 5.0], [2980, 600, 90, 5, 99], [3450, 520, 110, 9, 99],
];
const top4 = (i) => ROCKS4[i][1] - ROCKS4[i][2] * 0.9;
const ZON4 = (i, dx = 0) => ({ x: ROCKS4[i][0] + dx, y: top4(i) - 150, ground: 1 }); // Saitama standing on rock i
const HON4 = (i, dx = 0) => ({ x: ROCKS4[i][0] + dx, y: top4(i) - SS * HC, ground: 1 });

// Saitama's spot on rock 6 for the barrage, and where each thrown asteroid meets him.
const ZB4 = { ...ZON4(6), dir: 1, legs: [[-0.35, -0.1], [0.4, -0.3]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.05, rot: 0 };
const ZB4H = ptZ(ZB4, 'head');
const BAR4 = [
  { t0: 6.7, t1: 7.05, from: [3380, 250], to: [ZB4.x + 64, ZB4H[1] + 60], how: 'punch' },
  { t0: 7.25, t1: 7.6, from: [3520, 230], to: [ZB4.x + 60, ZB4H[1] + 24], how: 'kick' },
  { t0: 7.75, t1: 8.1, from: [3420, 180], to: [ZB4H[0] + 34, ZB4H[1] - 4], how: 'head' },
  { t0: 8.25, t1: 8.6, from: [3560, 300], to: [ZB4H[0] + 26, ZB4H[1] + 2], how: 'face' },
];

// Side hops: afterimages ringed round Shadic's rock; index 2 is the real one.
const HOP4 = Array.from({ length: 9 }, (_, i) => {
  const a = -Math.PI * 0.95 + (i / 8) * Math.PI * 1.15;
  return [3450 + Math.cos(a) * 230, 330 + Math.sin(a) * 120, i];
});
const REAL4 = HOP4[6];
const ZF4 = { x: REAL4[0], y: REAL4[1], dir: -1, ground: 0, legs: [[-0.7, -0.35], [0.75, -0.6]], arms: [[0.45, 1.3], [0.65, 1.35]], lean: 0.08, rot: 0.08, expr: 'serious' };
const ZF4C = [ZF4.x, ZF4.y];

// The frozen-time flurry: every blow lands somewhere new, from a new side, with a new limb.
const FLURRY4 = (() => {
  const P = {
    jab: { part: 'hand', legs: [[-0.6, -0.4], [0.7, -0.9]], arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.3, rot: 0.1 },
    cross: { part: 'handFar', legs: [[-0.5, -0.3], [0.6, -0.8]], arms: [[1.6, 0.05], [0.3, 1.7]], lean: 0.4, rot: 0.05 },
    front: { part: 'foot', legs: [[-0.4, -0.5], [1.65, -0.05]], arms: [[-1.2, 0.6], [0.9, 1.4]], lean: -0.3, rot: 0 },
    round: { part: 'foot', legs: [[-0.3, -0.4], [2.3, -0.05]], arms: [[-1.4, 0.5], [-1.0, 0.7]], lean: -0.55, rot: 0.2 },
    axe: { part: 'foot', legs: [[-0.5, -0.4], [1.3, 0.0]], arms: [[1.5, 0.8], [1.8, 0.6]], lean: 0.4, rot: 0.5 },
    upper: { part: 'hand', legs: [[-0.3, -0.4], [0.5, -0.9]], arms: [[-0.9, 0.6], [2.5, 0.2]], lean: -0.1, rot: -0.3 },
    low: { part: 'foot', legs: [[-0.3, -0.3], [1.15, -0.05]], arms: [[-0.8, 0.8], [-0.5, 0.9]], lean: -0.1, rot: 0.3 },
    hammer: { part: 'hand', legs: [[0.6, -1.2], [0.9, -1.4]], arms: [[2.9, 0.3], [3.0, 0.2]], lean: 0.4, rot: 0.3 },
  };
  // [type, attacking from (1 his front, -1 behind), target offset from Saitama's centre]
  const list = [
    ['jab', 1, [-26, -56]], ['cross', 1, [-24, -12]], ['front', 1, [-24, 20]], ['round', 1, [-22, -60]], ['jab', -1, [22, -24]],
    ['round', -1, [20, -56]], ['axe', 1, [0, -86]], ['upper', 1, [-20, -40]], ['cross', 1, [-24, 24]], ['low', 1, [-20, 62]],
    ['front', -1, [24, -4]], ['jab', 1, [-22, -50]], ['front', 1, [-24, -8]], ['cross', -1, [20, -50]], ['round', 1, [-26, -58]], ['hammer', 1, [-6, -84]],
  ];
  return list.map(([type, side, [dx, dy]], i) => {
    const p = P[type];
    // Saitama faces left, so "his front" is to the left and the attacker faces right
    const dir = side > 0 ? 1 : -1;
    const pt = [ZF4C[0] + dx, ZF4C[1] + dy];
    const pose = atH(p.part, pt, { dir, legs: p.legs, arms: p.arms, lean: p.lean, rot: p.rot, expr: i % 3 ? 'angry' : 'determined', ground: 0 });
    return { t: 12.65 + i * 0.09, pose, pt, dir };
  });
})();

/* ---------- tracks ---------- */

const flurryKeys = FLURRY4.flatMap(({ t, pose, dir }) => [
  { t: t - 0.035, ...pose, x: pose.x - dir * 38, y: pose.y - 10, still: 0, e: E.out },
  { t, ...pose, still: 1, e: E.out3 },
  { t: t + 0.03, ...pose, x: pose.x - dir * 16, y: pose.y - 4, still: 0 },
]);

const H4raw = makeTrack3([
  { t: 0, x: -200, y: 300, dir: 1, ball: 1, spin: 0, rot: 0, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[-0.5, 0.7], [0.3, 1.2]], expr: 'angry', aura: 0.35, alpha: 1, ground: 0, jet: 0, hands: ['fist', 'fist'] },
  { t: 0.7, x: 520, y: 380, spin: 60, e: E.out },
  { t: 0.78, ball: 0, legs: [[1.3, -2.1], [1.5, -2.2]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: 0.4, rot: -0.3 },
  { t: 0.95, ...HON4(0, -6), legs: [[1.0, -1.9], [1.25, -2.0]], lean: 0.45, rot: 0, sq: -0.12, e: E.in },
  { t: 1.1, x: ROCKS4[0][0] + 12, legs: [[0.8, -1.4], [1.05, -1.6]], sq: 0, lean: 0.3 },
  { t: 1.45, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: [[-0.2, 0.4], [0.8, 1.6]], hands: ['fist', 'point'], lean: -0.05, expr: 'grin' },
  { t: 1.95, legs: [[0.9, -1.7], [1.1, -1.8]], arms: [[-1.0, 0.5], [-0.8, 0.6]], hands: ['fist', 'fist'], lean: 0.4, e: E.out },
  // the chase: jets lit, weaving through the rocks
  { t: 2.05, ground: 0, rot: 1.0, legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[-0.6, 0.3], [2.8, 0.15]], lean: 0.1, jet: 1, sq: 0.15, e: E.out3 },
  { t: 2.3, x: 760, y: 330, rot: 1.25, sq: 0 },
  { t: 3.0, x: 1300, y: 290, rot: 1.35, arms: [[-0.4, 0.5], [2.6, 0.3]], expr: 'grin' },
  { t: 3.4, x: 1620, y: 360, rot: 1.6, legs: [[-0.5, -0.3], [-0.2, -0.7]] },
  { t: 3.8, x: 1900, y: 430, rot: 1.2 },
  { t: 4.6, x: 2500, y: 300, rot: 0.9, arms: [[-0.7, 0.4], [2.85, 0.1]] },
  { t: 5.3, x: 3200, y: 330, rot: 1.3 },
  { t: 5.55, x: 3420, y: 300, rot: 0.2, legs: [[1.2, -2.0], [1.4, -2.1]], arms: [[-1.3, 0.5], [-1.1, 0.6]], lean: -0.3, jet: 0.4, e: E.out },
  { t: 5.75, ...HON4(7), legs: [[1.0, -1.9], [1.25, -2.0]], rot: 0, lean: 0.35, sq: -0.1, jet: 0, e: E.in },
  { t: 5.9, dir: -1, legs: [[-0.15, -0.05], [0.2, -0.1]], arms: [[-0.4, 0.6], [0.3, 0.8]], lean: 0, sq: 0, expr: 'smirk' },
  // asteroids raised with chaos energy and thrown, one by one
  { t: 6.15, arms: [[2.6, 0.3], [2.8, 0.2]], hands: ['open', 'open'], lean: -0.15, aura: 1.0, expr: 'angry', e: E.out3 },
  { t: 6.55, arms: [[2.5, 0.4], [-0.6, 1.2]], lean: -0.2 },
  { t: 6.7, arms: [[2.5, 0.4], [1.6, 0.1]], lean: 0.25, e: E.out3 },
  { t: 7.1, arms: [[-0.6, 1.2], [2.5, 0.4]], lean: -0.15 },
  { t: 7.25, arms: [[1.6, 0.1], [2.5, 0.4]], lean: 0.25, e: E.out3 },
  { t: 7.6, arms: [[2.5, 0.4], [-0.6, 1.2]], lean: -0.15 },
  { t: 7.75, arms: [[2.5, 0.4], [1.6, 0.1]], lean: 0.25, e: E.out3 },
  { t: 8.1, arms: [[2.6, 0.3], [-0.5, 1.3]], lean: -0.2 },
  { t: 8.25, arms: [[1.5, 0.2], [1.6, 0.1]], lean: 0.3, e: E.out3 },
  { t: 8.75, arms: [[-0.3, 0.5], [0.2, 0.7]], hands: ['fist', 'fist'], lean: 0.05, aura: 0.5, expr: 'shock' },
  { t: 9.6, expr: 'angry', arms: [[1.1, 1.8], [1.35, 1.7]], legs: [[-0.35, -0.1], [0.4, -0.3]], lean: 0.1 },
  // surrounded by side hops: he looks every way
  { t: 10.1, look: -1, expr: 'shock' },
  { t: 10.3, dir: 1, look: 1 },
  { t: 10.55, dir: -1, look: -0.5, headTilt: -0.2 },
  { t: 10.8, dir: 1, look: 0, headTilt: 0.1 },
  { t: 11.0, arms: [[2.4, 0.5], [2.6, 0.3]], hands: ['open', 'open'], expr: 'angry', aura: 1.2, e: E.out3 },
  { t: 11.85, arms: [[-0.9, 0.4], [1.6, 0.2]], hands: ['fist', 'open'], lean: 0.25, e: E.out3 },
  // frozen time: he walks among the afterimages, finds the real one, and unloads
  { t: 12.1, ground: 0, x: 3330, y: 260, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[-0.5, 0.7], [0.3, 1.2]], hands: ['fist', 'fist'], lean: 0, aura: 0.6, expr: 'determined', e: E.inOut },
  { t: 12.4, x: 3520, y: 230, dir: 1, look: 0.6 },
  { t: 12.58, dir: 1, ...FLURRY4[0].pose, x: FLURRY4[0].pose.x - 60, y: FLURRY4[0].pose.y - 20, look: 0 },
  ...flurryKeys,
  { t: 14.2, x: 3520, y: 240, rot: -TAU * 0.8, legs: [[1.6, -2.3], [1.8, -2.4]], arms: [[1.1, 1.8], [1.3, 1.7]], lean: 0.4, e: E.lin },
  { t: 14.38, ...HON4(7, 10), dir: 1, ground: 1, rot: -TAU, legs: [[0.6, -1.3], [0.8, -1.5]], lean: 0.3, e: E.out },
  { t: 14.381, rot: 0 },
  { t: 14.5, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: HP.cross2.arms, lean: -0.05, expr: 'smirk' },
  { t: 15.9, expr: 'shock' },
  { t: 16.25, arms: [[1.3, 2.1], [1.45, 2.05]], legs: [[-0.4, -0.2], [0.45, -0.4]], lean: 0.15, expr: 'determined' },
  { t: 16.75, still: 1 },
  // punched through five asteroids
  { t: 16.85, x: 3300, y: 340, ground: 0, rot: -0.6, legs: [[0.6, -0.3], [1.2, -0.4]], arms: [[-2.0, 0.4], [-2.2, 0.5]], lean: -0.4, expr: 'pain', still: 0, sq: 0.2, e: E.out },
  { t: 17.6, x: 1900, y: 380, rot: -3.2, e: E.lin },
  { t: 17.8, x: 1500, rot: -4.2 },
], H_BASE);

const Z4raw = makeTrack3([
  { t: 0, x: -300, y: 260, dir: 1, ground: 0, legs: [[-0.05, -0.05], [0.05, -0.1]], arms: [[2.6, 0.2], [2.4, 0.3]], rot: 0.9, lean: 0, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 1.3, ...ZON4(1, 10), rot: 0.3, legs: [[0.3, -0.4], [0.5, -0.6]], arms: [[0.8, 0.7], [1.0, 0.8]], e: E.out },
  { t: 1.42, ...ZON4(1), rot: 0, legs: [[0.95, -1.75], [1.15, -1.85]], arms: [[-0.6, 0.5], [-0.4, 0.6]], lean: 0.32, sq: -0.1, e: E.in },
  { t: 1.65, legs: [[-0.25, -0.05], [0.3, -0.1]], arms: [[0.4, 0.9], [0.6, 1.0]], lean: 0.06, sq: 0 },
  // rock to rock; each one he kicks off breaks
  { t: 2.1, legs: [[0.9, -1.7], [1.1, -1.8]], arms: [[-1.1, 0.4], [-0.9, 0.5]], lean: 0.35, e: E.out },
  { t: 2.25, y: ZON4(1).y - 30, ground: 0, legs: [[-0.1, -0.1], [0.1, -0.2]], arms: [[2.4, 0.3], [2.2, 0.4]], rot: 0.6, lean: 0, sq: 0.15, e: E.out3 },
  { t: 2.55, x: 640, y: 330, rot: 1.2, legs: [[0.4, -0.8], [-0.1, -0.4]], arms: [[-0.6, 0.6], [2.95, 0.05]], sq: 0 },
  { t: 2.75, ...ZON4(2), rot: 0, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.7, 0.5], [-0.5, 0.6]], lean: 0.35, sq: -0.1, e: E.in },
  { t: 2.9, y: ZON4(2).y - 30, ground: 0, legs: [[-0.1, -0.1], [0.1, -0.2]], arms: [[2.2, 0.4], [2.5, 0.2]], rot: 0.4, lean: 0, sq: 0.15, e: E.out3 },
  { t: 3.15, x: 1200, y: 200, rot: TAU * 0.5, legs: [[1.6, -2.3], [1.8, -2.4]], arms: [[1.0, 1.6], [1.2, 1.5]], lean: 0.4, sq: 0, e: E.lin },
  { t: 3.35, x: 1420, y: 210, rot: TAU * 0.92, legs: [[0.4, -0.6], [0.6, -0.8]], lean: 0.1, e: E.lin },
  { t: 3.45, ...ZON4(3), rot: TAU, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.6, 0.5], [-0.4, 0.6]], lean: 0.35, sq: -0.1, e: E.in },
  { t: 3.451, rot: 0 },
  { t: 3.6, y: ZON4(3).y - 20, ground: 0, legs: [[-0.1, -0.1], [0.1, -0.2]], arms: [[-0.8, 0.5], [2.95, 0.05]], rot: 1.3, sq: 0.15, e: E.out3 },
  { t: 3.9, x: 1820, y: 330, rot: 1.45, sq: 0 },
  { t: 4.15, ...ZON4(4), rot: 0, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.6, 0.5], [-0.4, 0.6]], lean: 0.4, sq: -0.12, e: E.in },
  { t: 4.3, y: ZON4(4).y - 30, ground: 0, legs: [[-0.6, -0.1], [0.7, -0.3]], arms: [[2.6, 0.3], [-0.6, 0.8]], rot: 0.5, sq: 0.15, e: E.out3 },
  { t: 4.6, x: 2400, y: 160, rot: 0.25, legs: [[0.7, -1.4], [-0.4, -0.3]], arms: [[1.2, 1.0], [0.4, 0.7]], sq: 0 },
  { t: 4.85, ...ZON4(5), rot: 0, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.6, 0.5], [-0.4, 0.6]], lean: 0.35, sq: -0.1, e: E.in },
  { t: 5.0, y: ZON4(5).y - 30, ground: 0, legs: [[-0.1, -0.1], [0.1, -0.2]], arms: [[2.4, 0.3], [2.2, 0.4]], rot: 0.5, sq: 0.12, e: E.out3 },
  { t: 5.3, x: 2840, y: 240, rot: 0.3, legs: [[0.9, -1.5], [1.1, -1.6]], arms: [[0.7, 0.8], [0.9, 0.9]], sq: 0 },
  { t: 5.55, ...ZB4, rot: 0, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.6, 0.5], [-0.4, 0.6]], lean: 0.3, sq: -0.1, e: E.in },
  { t: 5.8, ...ZB4, sq: 0 },
  // the barrage
  { t: 6.9, arms: [[0.9, 1.6], [-0.8, 1.9]], lean: -0.1, e: E.out },
  { t: 7.05, legs: [[-0.5, -0.05], [0.45, -0.4]], arms: [[-0.7, 1.9], armZ(ZB4, BAR4[0].to[0] - 22, BAR4[0].to[1])], lean: 0.18, still: 1, e: E.out3 },
  { t: 7.2, ...ZB4, still: 0 },
  { t: 7.45, legs: [[-0.35, -0.1], [1.7, -2.2]], arms: [[-0.6, 0.8], [0.3, 1.0]], lean: -0.15 },
  { t: 7.6, ...hitLegZ({ ...ZB4, lean: -0.35, arms: [[-0.9, 0.6], [0.5, 0.8]] }, BAR4[1].to[0] - 20, BAR4[1].to[1]), still: 1, e: E.out3 },
  { t: 7.75, ...ZB4, still: 0 },
  { t: 7.95, lean: -0.3, tilt: -0.15, e: E.out },
  { t: 8.1, lean: 0.4, tilt: 0.2, still: 1, e: E.out3 },
  { t: 8.25, ...ZB4, tilt: 0, still: 0 },
  { t: 8.45, arms: [[0.2, 0.5], [0.3, 0.6]], lean: 0, expr: 'ok' },
  { t: 8.6, tilt: -0.08, still: 1 },
  { t: 8.75, tilt: 0, still: 0, blink: 1 },
  { t: 8.85, blink: 0 },
  { t: 9.0, expr: 'serious' },
  { t: 9.65, legs: [[0.9, -1.7], [1.1, -1.8]], arms: [[-1.0, 0.4], [-0.8, 0.5]], lean: 0.35, e: E.out },
  { t: 9.9, x: 3250, y: 300, ground: 0, legs: [[-0.6, -0.3], [0.7, -0.5]], arms: [[0.45, 1.3], [0.65, 1.35]], lean: 0.08, rot: 0.08, e: E.out3 },
  { t: 10.0, ...ZF4, alpha: 1, still: 1 },
  { t: 15.0, ...ZF4, still: 1 },
  // time resumes: every frozen blow lands at once, and he actually moves
  { t: 15.12, x: ZF4.x + 70, y: ZF4.y - 12, still: 0, rot: 0.45, legs: [[-0.9, -0.3], [0.4, -1.0]], arms: [[-1.4, 0.6], [1.6, 0.8]], lean: -0.3, expr: 'ok', e: E.out3 },
  { t: 15.5, x: ZF4.x + 96, y: ZF4.y - 8, rot: 0.1, legs: [[0.8, -1.3], [1.15, -1.7]], arms: [[0.6, 1.0], [0.9, 2.1]], hands: ['fist', 'open'], lean: 0.05, tilt: 0.12, e: E.out },
  { t: 15.95, arms: [[0.6, 1.0], [0.85, 2.05]], tilt: 0.1 },
  { t: 16.3, arms: [[0.6, 1.6], [0.85, 1.7]], hands: ['fist', 'fist'], tilt: 0, expr: 'serious', vein: 1 },
  { t: 16.45, legs: [[0.9, -1.7], [1.1, -1.8]], arms: [[0.9, 1.6], [-0.7, 1.9]], lean: -0.2, rot: 0, e: E.out },
  { t: 16.75, x: 3540, y: 330, legs: [[-0.5, -0.1], [0.45, -0.4]], arms: [[-0.7, 1.9], [1.57, 0.04]], lean: 0.22, rot: 0, still: 1, sq: 0.1, e: E.in },
  { t: 16.95, x: 3520, still: 0, sq: 0 },
  { t: 17.8, x: 3500 },
], Z_BASE);

const H4 = animate(H4raw, { seed: 10 });
const Z4 = animate(Z4raw, { seed: 11, cape: true });

const CAM4 = makeTrack([
  { t: 0, x: 300, y: 380, z: 0.85, r: 0 },
  { t: 1.0, x: 430, y: 420, z: 1.0, r: 0 },
  { t: 1.9, x: 430, y: 410, z: 1.05, r: 0 },
  { t: 2.6, x: 760, y: 380, z: 0.85, r: 0.02, e: E.in },
  { t: 3.4, x: 1450, y: 330, z: 0.85, r: -0.02, e: E.lin },
  { t: 4.2, x: 2050, y: 380, z: 0.85, r: 0.02, e: E.lin },
  { t: 5.0, x: 2700, y: 330, z: 0.85, r: 0, e: E.lin },
  { t: 5.7, x: 3200, y: 380, z: 0.85, r: 0, e: E.out },
  { t: 6.2, x: 3220, y: 360, z: 0.9, r: 0 },
  { t: 7.05, x: 3080, y: 340, z: 1.2, r: 0.02, e: E.inOut },
  { t: 8.6, x: 3060, y: 330, z: 1.35, r: 0 },
  { t: 9.2, x: 3030, y: 330, z: 1.3, r: 0 },
  { t: 10.0, x: 3450, y: 330, z: 0.95, r: 0, e: E.out },
  { t: 11.0, x: 3450, y: 330, z: 1.05, r: 0 },
  { t: 12.0, x: 3500, y: 320, z: 1.0, r: 0 },
  { t: 12.6, x: 3640, y: 330, z: 1.35, r: 0.02, e: E.out },
  { t: 14.1, x: 3620, y: 320, z: 1.25, r: -0.02 },
  { t: 14.5, x: 3540, y: 320, z: 1.0, r: 0 },
  { t: 15.0, x: 3560, y: 330, z: 1.05, r: 0 },
  { t: 15.5, x: 3700, y: 330, z: 1.4, r: 0, e: E.out },
  { t: 16.35, x: 3700, y: 330, z: 1.45, r: 0 },
  { t: 16.75, x: 3540, y: 340, z: 1.2, r: -0.03, e: E.out3 },
  { t: 17.0, x: 3200, y: 350, z: 0.8, r: 0, e: E.out },
  { t: 17.8, x: 2200, y: 370, z: 0.7, r: 0, e: E.in },
]);

const L4 = [
  [1.45, 2.4, 'shadic', 'Try to keep up!'],
  [9.0, 10.0, 'saitama', 'Serious Series: Serious Side Hops.'],
  [11.0, 11.85, 'shadic', 'CHAOS... CONTROL!', { shout: true }],
  [14.45, 15.0, 'shadic', '...And time resumes.'],
  [15.95, 16.4, 'saitama', '...Okay.'],
];

// Five asteroids Shadic is punched through on his way out.
const THRU4 = [[3300, 340, 70, 2], [3000, 360, 80, 4], [2700, 350, 60, 6], [2400, 370, 75, 8], [2100, 380, 65, 1]];

fightScene({
  id: 'asteroids',
  name: 'Asteroid Belt',
  dur: 17.8,
  lines: L4,
  holds: [[0.95, 0.05, 8], [7.05, 0.08, 12], [7.6, 0.07, 10], [8.1, 0.06, 10], [8.6, 0.1, 6], [15.0, 0.3, 26, true], [16.75, 0.22, 26, true]],
  music: [[0, 'hyper']],
  cues: [
    [0.6, 'whoosh'], [0.95, 'thud'], [1.42, 'thud'], [2.05, 'jet'], [2.25, 'crack'], [2.9, 'crack'], [3.6, 'crack'], [4.3, 'crack'], [5.0, 'crack'], [5.55, 'thud'], [5.75, 'thud'],
    [6.15, 'charge'], [6.7, 'whoosh'], [7.05, 'punch'], [7.07, 'crack'], [7.25, 'whoosh'], [7.6, 'punch'], [7.62, 'crack'], [7.75, 'whoosh'], [8.1, 'thud'], [8.12, 'crack'], [8.25, 'whoosh'], [8.6, 'crunch'], [8.75, 'pop'],
    [9.9, 'whoosh'], [10.0, 'whirl'], [10.6, 'whirl'], [11.85, 'chaos'], ...FLURRY4.map((f) => [f.t, 'hit']), [14.45, 'tele'], [15.0, 'unfreeze'], [15.02, 'bigboom'],
    [16.45, 'serious'], [16.75, 'punch'], [16.77, 'bigboom'], ...THRU4.map((r, i) => [16.95 + i * 0.13, 'crack']),
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM4(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z };
    const z = Z4(a);
    const h = H4(a);
    const frozen = a > 11.9 && a < 15.0;
    asteroidField(ctx, cs, frozen ? 11.9 : lt, { fg: a > 2.05 && a < 5.6, sunX: 620, sunY: -260 });
    layer(ctx, cs, 0.04, (g) => jupiter(g, -380, -60, 70, lt), 2200, 360);
    if (a > 2.05 && a < 5.6) starStreaks(ctx, lt, 0, 0.45, { speed: 2600, n: 40 });
    ctx.save();
    camApply(ctx, cs);
    ROCKS4.forEach(([x, y, r, sp, br], i) => {
      if (a < br) rock(ctx, x, y + Math.sin(a * 0.7 + i) * 4, r, sp, i + 0.3 * Math.sin(a * 0.2 + i));
      else spaceDebris(ctx, x, y, a - br, { n: 12, seed: 20 + i, v: 260, size: 14, col: '#7d6f64', life: 2.2 });
    });
    // the thrown asteroids, glowing with chaos energy until they meet him
    BAR4.forEach((b, i) => {
      const lift = prog(a, 6.15, 6.5);
      if (a < b.t0) {
        if (lift > 0) {
          const [x, y] = [b.from[0], lerp(b.from[1] + 120, b.from[1], E.out3(lift)) + Math.sin(a * 3 + i) * 5];
          circle(ctx, x, y, 52, 'rgba(120,240,255,0.25)');
          rock(ctx, x, y, 36, 3 + i * 2, a + i);
        }
      } else if (a < b.t1) {
        const u = prog(a, b.t0, b.t1);
        const x = lerp(b.from[0], b.to[0], E.in(u));
        const y = lerp(b.from[1], b.to[1], E.in(u));
        circle(ctx, x, y, 50, 'rgba(120,240,255,0.25)');
        rock(ctx, x, y, 36, 3 + i * 2, a * 4 + i);
      } else {
        const k = a - b.t1;
        if (b.how === 'kick') {
          rock(ctx, b.to[0] - 40 - k * 300, b.to[1] - 30 - k * 200, 22, 7, k * 5);
          rock(ctx, b.to[0] - 40 - k * 320, b.to[1] + 30 + k * 220, 22, 8, -k * 5);
        } else if (b.how === 'face') spaceDebris(ctx, b.to[0], b.to[1], k, { n: 14, seed: 70, v: 90, size: 5, col: '#7d6f64', life: 1.4, a0: 0, spread: TAU });
        else {
          spaceDebris(ctx, b.to[0], b.to[1], k, { n: 16, seed: 60 + i, v: 420, size: 10, col: '#7d6f64', life: 1.6, a0: Math.PI, spread: 2.4 });
          puffs(ctx, b.to[0], b.to[1], prog(k, 0, 1.4), { n: 8, spread: 90, seed: 61 + i, size: 26, rise: 0, color: '#a39385', shade: '#7d6f64' });
        }
      }
    });
    // Serious Side Hops: a ring of Saitamas, every one hopping on its own beat
    if (a > 10.0 && a < 15.0) {
      HOP4.forEach(([x, y, i]) => {
        if (i === REAL4[2]) return;
        const hop = frozen ? Math.sin(11.9 * 9 + i * 1.9) : Math.sin(a * 9 + i * 1.9);
        drawZ(ctx, { ...ZF4, x: x + hop * 22, y, dir: x < 3450 ? 1 : -1, legs: hop > 0 ? [[-0.7, -0.35], [0.75, -0.6]] : [[0.2, -0.6], [-0.2, -0.5]] }, a, { alpha: 0.82, blink: 0, wind: 0.6, capeRot: 0 });
      });
    }
    const hopping = a > 10.0 && a < 11.9;
    // the real one's hop is timed to be centred at the instant time stops
    const zDraw = hopping ? { ...z, x: z.x + Math.sin((a - 11.9) * 9) * 22 } : z;
    if (a > 1.0 && a < 5.6) ghostsOf(ctx, Z4, a, 2, 0.04, drawZ, 0.2);
    drawZ(ctx, zDraw, a, { talk: speaking(lt, LL, 'saitama'), blink: z.blink || blinkAt(a, 3.4, 6) });
    ctx.restore();
    // time stops for everyone but him
    if (frozen) desaturate(ctx, prog(a, 11.9, 12.1) * (1 - prog(a, 14.9, 15.0)));
    ctx.save();
    camApply(ctx, cs);
    // stored blows: a little star wherever one landed, all bursting when time resumes
    for (const f of FLURRY4) {
      if (a < f.t) continue;
      if (a < 15.0) star4(ctx, f.pt[0], f.pt[1], 9 + 3 * Math.sin(a * 20 + f.t * 30), f.t * 7, '#fff6b0');
      else hit3(ctx, f.pt[0], f.pt[1], lt - realT(15.0, hs) - (f.t - 12.65) * 0.02, 0.5, Math.round(f.t * 100), true);
    }
    if (a > 2.05 && a < 5.6) rainbowRibbon(ctx, pastPts(H4, a, 10, 0.03), 22, lt, 0.8);
    if (a > 12.55 && a < 14.25) ghostsOf(ctx, H4, a, 3, 0.02, drawH, 0.3);
    if (a > 16.8) rainbowRibbon(ctx, pastPts(H4, a, 10, 0.025), 30, lt, 0.9);
    drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 12) });
    // punched through the asteroids
    THRU4.forEach(([x, y, r, sp], i) => {
      const tb = 16.95 + i * 0.13;
      if (a < tb) {
        if (a > 16.0) rock(ctx, x, y, r, sp, i, prog(a, 16.0, 16.4));
      }
      else {
        spaceDebris(ctx, x, y, a - tb, { n: 16, seed: 80 + i, v: 520, size: 12, col: '#7d6f64', life: 2, a0: Math.PI, spread: 2.6 });
        hit3(ctx, x, y, a - tb, 0.6, 90 + i, true);
      }
    });
    hit3(ctx, ...ptZ(Z4(7.05), 'hand'), lt - realT(7.05, hs), 0.6, 71, false);
    hit3(ctx, ...ptZ(Z4(7.6), 'foot'), lt - realT(7.6, hs), 0.6, 72, false);
    hit3(ctx, ZB4H[0] + 26, ZB4H[1], lt - realT(8.1, hs), 0.5, 73, false);
    hit3(ctx, 3500, 330, lt - realT(16.75, hs), 1.5, 74, false);
    warpRing(ctx, 3450, 360, a - 11.85, 1.6);
    ctx.restore();
    if (a > 11.85 && a < 12.15) flash(ctx, 0.55 * (1 - prog(a, 11.85, 12.15)), '#bfffd8');
    if (a > 15.0 && a < 15.35) flash(ctx, 0.7 * (1 - prog(a, 15.0, 15.35)), '#ffffff');
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { drawZ(g, z, a, {}); drawH(g, h, a, {}); }, fr.h.a === 15.0 ? z.x : 3500, fr.h.a === 15.0 ? z.y : 330, lt);
    if (a > 9.0 && a < 10.0) {
      const sl = slam(a - 9.35);
      if (sl) bigText(ctx, 'SERIOUS SIDE HOPS', 640, 640, 64, { fill: '#ffd21f', stroke: INK, sw: 12, scale: sl.s, alpha: sl.a * (1 - prog(a, 9.8, 10.0)), shadow: '#e3262f', rot: -0.03, maxW: 1000 });
    }
    talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(zDraw, 'head'), 50) });
  },
});
