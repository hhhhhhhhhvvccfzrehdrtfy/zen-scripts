'use strict';
/* Round 3, chapter 3b: Mars. A dust storm Saitama fights with his eyes shut and ends with one clap,
   Phobos thrown at him and handed back, and a throw that sends Shadic on toward the asteroid belt. */

const ZG3b = MARS_G - 150;
const HG3b = MARS_G - SS * HC;
const ZS3b = { x: 430, y: ZG3b, dir: 1, ground: 1, legs: [[-0.35, -0.1], [0.4, -0.3]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.06, rot: 0 };
const ZS3bH = ptZ(ZS3b, 'head');

// Blows from inside the storm: [time, Shadic's pose placed on its target, Saitama's block].
const STORM3b = [
  { t: 4.5, h: atH('foot', [ZS3bH[0] - 34, ZS3bH[1] + 30], { dir: 1, legs: [[-0.45, -0.65], [1.65, -0.05]], arms: [[-1.5, 0.5], [0.9, 1.4]], lean: -0.4, rot: 0.1, expr: 'angry' }), zt: [ZS3bH[0] - 28, ZS3bH[1] + 30], far: true },
  { t: 5.0, h: atH('hand', [ZS3bH[0] + 40, ZS3bH[1] + 4], { dir: -1, legs: [[-0.6, -0.4], [0.7, -0.9]], arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.3, rot: 0.15, expr: 'angry' }), zt: [ZS3bH[0] + 30, ZS3bH[1] + 4], far: false },
  { t: 5.5, h: atH('foot', [ZS3b.x + 26, MARS_G - 14], { dir: -1, ground: 1, legs: [[1.2, -2.1], [1.45, -0.05]], arms: [[-1.6, 0.4], [-1.4, 0.5]], lean: 0.65, rot: 0.15, expr: 'determined' }), zt: null, far: false },
  { t: 6.0, h: atH('foot', [ZS3bH[0] + 4, ZS3bH[1] - 56], { dir: 1, legs: [[-0.5, -0.4], [1.3, 0.0]], arms: [[1.5, 0.8], [1.8, 0.6]], lean: 0.4, rot: 0.5, expr: 'angry' }), zt: [ZS3bH[0] + 2, ZS3bH[1] - 46], far: false },
];
const PHOBOS3b = { r: 110, from: [1150, -170] };

const H3braw = () => makeTrack3([
  { t: 0, x: 100, y: -100, dir: 1, ball: 1, spin: 0, rot: 0, ground: 0, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[-0.5, 0.7], [0.3, 1.2]], expr: 'pain', aura: 0.4, alpha: 1, jet: 0, fig8: false, hands: ['fist', 'fist'] },
  { t: 0.8, x: 760, y: MARS_G - 29 - BALLUP, spin: 50, lin: true, e: E.in },
  { t: 0.82, alpha: 0 },
  { t: 1.6, ...{ x: 790, y: HG3b, ground: 1 }, ball: 0, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.6, 0.6], [0.5, 1.2]], lean: 0.4, expr: 'angry', alpha: 0, dir: -1, cut: true },
  { t: 1.65, alpha: 1 },
  { t: 1.9, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: [[-0.4, 0.6], [0.2, 0.8]], lean: 0, headTilt: 0.1 },
  { t: 2.2, legs: [[0.9, -1.7], [1.1, -1.8]], arms: [[-1.0, 0.5], [-0.8, 0.6]], lean: 0.45, dir: 1, headTilt: 0, expr: 'grin', e: E.out },
  // whipping up the storm: sprinting back and forth past him
  { t: 2.3, fig8: true, ph: 0, lean: 0.42, arms: [[-1.5, 0.3], [-1.3, 0.4]] },
  { t: 3.1, x: 1400, ph: 50, e: E.in },
  { t: 3.12, dir: -1 },
  { t: 3.9, x: -300, ph: 100, e: E.lin },
  { t: 3.95, alpha: 0, fig8: false },
  ...STORM3b.flatMap((s) => [
    { t: s.t - 0.12, ...s.h, x: s.h.x - (s.h.dir ?? 1) * 50, y: s.h.y - 20, alpha: 0, cut: true },
    { t: s.t - 0.1, alpha: 1 },
    { t: s.t, ...s.h, still: 1, e: E.out3 },
    { t: s.t + 0.08, x: s.h.x - (s.h.dir ?? 1) * 40, y: s.h.y - 16, still: 0 },
    { t: s.t + 0.11, alpha: 0 },
  ]),
  // the clap blows the storm away and him with it
  { t: 6.85, x: 900, y: 320, dir: -1, ground: 0, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.1, rot: 0, alpha: 0, cut: true },
  { t: 6.88, alpha: 1, expr: 'shock' },
  { t: 7.35, x: 1020, y: 250, rot: -2.2, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [2.5, 0.5]], lean: -0.4, e: E.out },
  { t: 7.55, rot: -TAU, legs: [[0.9, -1.4], [1.1, -1.6]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: -0.2, jet: 1, expr: 'angry', e: E.out },
  { t: 7.551, rot: 0 },
  { t: 7.9, arms: [[-0.4, 0.6], [1.5, 0.15]], hands: ['fist', 'point'], lean: 0.15, jet: 0.4 },
  { t: 8.6, legs: [[1.2, -2.0], [1.4, -2.1]], arms: [[-1.0, 0.5], [-0.8, 0.6]], hands: ['fist', 'fist'], lean: 0.3 },
  { t: 8.9, x: 1100, y: -320, rot: -0.6, legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[2.8, 0.15], [-0.6, 0.3]], jet: 1.3, e: E.in },
  // riding Phobos down, pushing it with both hands
  { t: 9.4, ...PUSH3b(9.4), rot: 0.9, dir: -1, legs: [[-0.6, -0.3], [-0.3, -0.6]], arms: [[1.55, 0.1], [1.45, 0.15]], hands: ['open', 'open'], lean: 0.35, jet: 1.4, expr: 'yell', cut: true },
  { t: 10.5, ...PUSH3b(10.5), lin: true, e: E.in },
  { t: 10.85, x: 960, y: 110, rot: -TAU, legs: [[0.6, -1.2], [1.0, -1.5]], arms: [[1.1, 1.8], [1.35, 1.7]], hands: ['fist', 'fist'], lean: 0, jet: 0.4, expr: 'grin', e: E.out },
  { t: 10.851, rot: 0 },
  { t: 11.0, expr: 'shock' },
  { t: 12.7, headTilt: -0.3, look: 0.5 },
  { t: 13.4, headTilt: 0, look: 0, expr: 'angry' },
  // a rage dive, then the exchange on the sand
  { t: 13.6, legs: [[1.2, -2.0], [1.4, -2.1]], arms: [[-1.0, 0.5], [-0.8, 0.6]], lean: 0.35, rot: -0.3, e: E.out },
  { t: 13.85, x: 640, y: 360, rot: 1.4, legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[-0.6, 0.3], [2.8, 0.15]], lean: 0.1, jet: 1, sq: 0.2, e: E.in },
  { t: 14.05, x: 512, y: 370, rot: 0.4, legs: [[-0.6, -0.4], [0.7, -0.9]], arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.3, sq: 0, still: 1, e: E.out3 },
  { t: 14.18, x: 560, y: HG3b, ground: 1, rot: 0, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.6, 0.6], [0.5, 1.2]], lean: 0.4, still: 0, jet: 0 },
  { t: 14.35, x: 540, legs: [[1.2, -2.1], [1.45, -0.05]], arms: [[-1.6, 0.4], [-1.4, 0.5]], lean: 0.65, rot: 0.15, e: E.out3 },
  { t: 14.5, legs: [[1.0, -1.9], [1.25, -2.0]], arms: [[-0.6, 0.6], [0.5, 1.2]], lean: 0.4, rot: 0 },
  { t: 14.62, alpha: 1 },
  { t: 14.64, alpha: 0 },
  { t: 14.85, x: 300, y: 340, dir: 1, ground: 0, legs: [[0.2, -0.6], [1.7, -2.2]], arms: [[-1.0, 0.6], [-0.6, 1.0]], rot: 0.4, lean: -0.2, alpha: 0, expr: 'angry', cut: true },
  { t: 14.87, alpha: 1 },
  { t: 14.97, x: 330, y: 330, legs: [[-0.45, -0.3], [2.3, -0.1]], rot: 1.1, lean: -0.3, e: E.out3 },
  { t: 15.1, x: 320, y: 340, rot: 0.6, legs: [[-0.45, -0.3], [2.0, -0.1]] },
  // caught by the foot, swung once, thrown at the sky
  { t: 15.2, x: 330, y: 340, rot: 0.9, expr: 'shock', still: 1 },
  { t: 15.45, x: 470, y: 230, rot: 3.2, legs: [[0.05, -0.05], [-0.05, -0.05]], arms: [[-2.6, 0.3], [2.7, 0.4]], still: 0, e: E.inOut },
  { t: 15.65, x: 580, y: 260, rot: 5.4, e: E.inOut },
  { t: 16.3, x: 1500, y: -500, rot: 9, sq: 0.2, e: E.out },
  { t: 17.2, x: 1500, y: -500 },
], H_BASE);

const Z3braw = makeTrack3([
  { t: 0, x: 120, y: -200, dir: 1, ground: 0, rot: 0.8, legs: [[-0.05, -0.05], [0.05, -0.1]], arms: [[2.6, 0.2], [2.4, 0.3]], lean: 0, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 0.9, x: 200, y: -150 },
  { t: 1.45, ...ZS3b, x: 425, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.7, 0.5], [-0.5, 0.6]], lean: 0.35, sq: -0.12, e: E.in },
  { t: 1.75, ...ZS3b, sq: 0 },
  // eyes shut in the storm; he blocks by ear
  { t: 4.1, blink: 1 },
  ...STORM3b.flatMap((s, i) => {
    const prep = s.zt ? hitArmZ(ZS3b, s.zt[0] + (s.far ? -14 : 14), s.zt[1] + 10, s.far) : { legs: [[-0.35, -0.1], [1.0, -1.5]] };
    const hitK = s.zt ? hitArmZ(ZS3b, s.zt[0], s.zt[1], s.far) : { ...ZS3b, y: ZG3b - 26, legs: [[0.9, -1.6], [1.1, -1.7]] };
    return [
      { t: s.t - 0.08, ...ZS3b, ...prep, blink: 1 },
      { t: s.t, ...hitK, blink: 1, still: 1, e: E.out3 },
      { t: s.t + 0.14, ...ZS3b, blink: 1, still: 0 },
    ];
  }),
  { t: 6.5, arms: [[-1.4, 0.3], [1.4, 0.3]], hands: ['open', 'open'], lean: -0.05, blink: 1, e: E.out },
  { t: 6.85, arms: [[1.45, 0.15], [1.55, 0.1]], lean: 0.12, blink: 0, still: 1, e: E.in3 },
  { t: 7.2, still: 0 },
  { t: 7.6, ...ZS3b, hands: ['fist', 'fist'], tilt: -0.15 },
  // Phobos: brace, catch, a long slide, hand it back
  { t: 9.6, tilt: -0.3 },
  { t: 10.1, x: 470, legs: [[-0.6, -0.1], [0.6, -0.4]], arms: [[2.4, 0.5], [2.6, 0.4]], hands: ['open', 'open'], lean: -0.05, tilt: -0.25, e: E.out },
  { t: 10.6, x: 470, legs: [[-0.7, -0.4], [0.6, -0.9]], arms: [[2.9, 0.15], [3.0, 0.1]], lean: 0, still: 1, sq: -0.08, e: E.in },
  { t: 11.0, x: 400, legs: [[-0.8, -0.5], [0.5, -1.0]], sq: 0, e: E.out },
  { t: 11.4, legs: [[-0.35, -0.1], [0.4, -0.3]] },
  { t: 12.4, tilt: -0.15 },
  { t: 12.55, legs: [[0.6, -1.2], [0.8, -1.3]], arms: [[2.6, 0.6], [2.7, 0.5]], lean: 0.1, e: E.out },
  { t: 12.75, legs: [[-0.2, -0.05], [0.25, -0.1]], arms: [[3.05, 0.05], [3.1, 0.05]], lean: -0.1, still: 0, e: E.out3 },
  { t: 13.2, ...ZS3b, x: 400, hands: ['fist', 'fist'], tilt: 0 },
  // the exchange
  { t: 13.95, arms: [[1.35, 2.0], [1.55, 1.95]], lean: 0.05 },
  { t: 14.05, x: 400, still: 1 },
  { t: 14.15, x: 384, still: 0, e: E.out },
  { t: 14.3, y: ZG3b - 30, legs: [[0.9, -1.6], [1.1, -1.7]], e: E.out3 },
  { t: 14.45, y: ZG3b, legs: [[-0.35, -0.1], [0.4, -0.3]], e: E.in },
  { t: 14.52, arms: [[0.9, 1.6], [-0.7, 1.9]], lean: -0.1 },
  { t: 14.65, legs: [[-0.5, -0.05], [0.45, -0.4]], arms: [[-0.7, 1.9], [1.57, 0.04]], lean: 0.2, e: E.out3 },
  { t: 14.95, legs: [[0.8, -1.6], [1.0, -1.7]], lean: 0.45, tilt: 0.2, arms: [[0.6, 1.6], [0.85, 1.7]], e: E.out3 },
  { t: 15.1, dir: -1, legs: [[-0.35, -0.1], [0.4, -0.3]], lean: 0.05, tilt: 0 },
  { t: 15.2, arms: [armZ({ ...ZS3b, x: 384, dir: -1 }, 352, 300, true), [0.85, 1.7]], hands: ['open', 'fist'], still: 1, e: E.out3 },
  { t: 15.45, rot: -0.4, arms: [[2.6, 0.3], [0.85, 1.7]], hands: ['fist', 'fist'], lean: -0.2, still: 0, e: E.inOut },
  { t: 15.65, rot: 0.2, arms: [[1.6, 0.3], [0.6, 1.4]], lean: 0.25, e: E.out3 },
  { t: 16.1, rot: 0, ...ZS3b, x: 384, dir: 1, tilt: -0.3 },
  { t: 16.6, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.9, 0.4], [-0.7, 0.5]], lean: 0.4, tilt: 0 },
  { t: 16.8, y: ZG3b - 40, ground: 0, legs: [[-0.05, -0.05], [0.05, -0.1]], arms: [[2.6, 0.2], [2.4, 0.3]], lean: 0, rot: 0.5, sq: 0.15, e: E.out3 },
  { t: 17.2, x: 900, y: -300, sq: 0, e: E.in },
], Z_BASE);

const Z3b = animate(Z3braw, { seed: 26, cape: true });

// Where Phobos is: in the sky, carried down, caught, held overhead, thrown back.
function phobosAt3b(a, z) {
  if (a < 9.4) return null;
  if (a < 10.6) {
    const [hx, hy] = ptZ(Z3b(10.6), 'hand');
    const u = E.in(prog(a, 9.4, 10.6));
    return [lerp(PHOBOS3b.from[0], hx - 10, u), lerp(PHOBOS3b.from[1], hy - PHOBOS3b.r + 8, u), 1];
  }
  if (a < 12.75) {
    const [hx, hy] = ptZ(z, 'hand');
    return [hx - 10, hy - PHOBOS3b.r + 8, 0.6];
  }
  const u = E.out(prog(a, 12.75, 13.6));
  const [hx, hy] = ptZ(Z3b(12.75), 'hand');
  return u < 1 ? [lerp(hx - 10, 900, u), lerp(hy - PHOBOS3b.r + 8, -700, u), 0.6] : null;
}
// Shadic riding behind Phobos with both hands on it.
const PUSH3b = (a) => {
  const [px, py] = phobosAt3b(a, null);
  return { x: px + 120, y: py - 70 };
};
const H3b = animate(H3braw(), { seed: 25 });

const CAM3b = makeTrack([
  { t: 0, x: 600, y: 360, z: 0.85, r: 0 },
  { t: 1.5, x: 600, y: 440, z: 1.0, r: 0 },
  { t: 2.3, x: 640, y: 430, z: 0.95, r: 0 },
  { t: 4.1, x: 470, y: 420, z: 1.3, r: 0, e: E.out },
  { t: 6.5, x: 470, y: 420, z: 1.4, r: 0 },
  { t: 6.85, x: 560, y: 400, z: 0.95, r: 0, e: E.out3 },
  { t: 7.9, x: 760, y: 340, z: 0.9, r: 0 },
  { t: 9.0, x: 700, y: 300, z: 0.8, r: 0 },
  { t: 9.4, x: 800, y: 110, z: 0.7, r: 0 },
  { t: 9.9, x: 760, y: 170, z: 0.7, r: 0 },
  { t: 10.6, x: 520, y: 360, z: 0.85, r: 0.02, e: E.out3 },
  { t: 12.4, x: 500, y: 360, z: 1.0, r: 0 },
  { t: 13.0, x: 580, y: 220, z: 0.72, r: 0, e: E.out },
  { t: 13.4, x: 520, y: 300, z: 0.8, r: 0 },
  { t: 14.05, x: 460, y: 400, z: 1.15, r: 0, e: E.out3 },
  { t: 15.2, x: 420, y: 380, z: 1.2, r: 0 },
  { t: 15.65, x: 520, y: 320, z: 0.9, r: 0, e: E.out },
  { t: 17.2, x: 700, y: 100, z: 0.8, r: 0, e: E.in },
]);

const L3b = [
  [7.65, 8.55, 'shadic', 'Fine! Catch THIS!', { shout: true }],
  [11.5, 12.4, 'saitama', '...Is this yours?'],
];

fightScene({
  id: 'mars',
  name: 'Mars',
  dur: 17.2,
  lines: L3b,
  holds: [[0.8, 0.1, 18], ...STORM3b.map((s) => [s.t, 0.05, 8]), [6.85, 0.2, 26, true], [10.6, 0.15, 22, true], [14.05, 0.05, 8], [15.2, 0.06, 10]],
  music: [[0, 'hyper']],
  cues: [
    [0.8, 'bigboom'], [1.45, 'thud'], [2.3, 'zip'], [3.12, 'zip'], [2.6, 'wind'], [3.6, 'wind'], ...STORM3b.map((s) => [s.t, 'block']),
    [6.85, 'punch'], [6.86, 'boom'], [7.55, 'jet'], [8.6, 'blast'], [9.4, 'rumble'], [10.6, 'bigboom'], [10.62, 'thud'], [12.75, 'blast'], [13.85, 'whoosh'],
    [14.05, 'block'], [14.35, 'swing'], [14.62, 'tele'], [14.65, 'punch'], [14.67, 'boom'], [14.85, 'tele'], [14.97, 'miss'], [15.2, 'snap'], [15.45, 'whirl'], [15.65, 'blast'], [16.8, 'whoosh'],
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM3b(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + (a > 10.6 && a < 11.2 ? 10 : 0));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z };
    const z = Z3b(a);
    const ph = phobosAt3b(a, z);
    let h = H3b(a);
    if (a >= 9.4 && a < 10.5) h = { ...h, ...PUSH3b(a) };
    // his foot stays in Saitama's hand through the swing
    if (a >= 15.2 && a < 15.65) h = putH(h, 'foot', ...ptZ(z, 'handFar'));
    marsSurface(ctx, cs, lt, { phobos: a < 9.0 || a > 13.4 ? [-380, -200] : null, craters: a > 0.8 ? [[760, 170]] : [] });
    ctx.save();
    camApply(ctx, cs);
    puffs(ctx, 760, MARS_G, prog(a, 0.8, 2.6), { n: 16, spread: 260, seed: 41, size: 44, rise: 120, color: '#e3a07c', shade: '#b46a4a' });
    puffs(ctx, 425, MARS_G, prog(a, 1.45, 2.4), { n: 8, spread: 120, seed: 44, size: 26, rise: 40, color: '#e3a07c', shade: '#b46a4a' });
    // the slide back under Phobos's weight
    for (let i = 0; i < 4; i++) puffs(ctx, 470 - i * 22, MARS_G, prog(a, 10.6 + i * 0.1, 11.9 + i * 0.1), { n: 5, spread: 70, seed: 47 + i, size: 26, rise: 50, dx: 30, color: '#e3a07c', shade: '#b46a4a' });
    if (a < 0.8) rainbowRibbon(ctx, pastPts(H3b, a, 10, 0.03), 30, lt, 0.9);
    // the trench from the punch that met nothing
    if (a > 14.65) {
      const k = E.out(prog(a, 14.65, 15.2));
      ctx.fillStyle = '#6a2e1e';
      ctx.beginPath();
      ctx.moveTo(470, MARS_G + 2);
      ctx.lineTo(470 + 1800 * k, MARS_G + 2);
      ctx.lineTo(470 + 1800 * k, MARS_G + 40);
      ctx.lineTo(470, MARS_G + 20);
      ctx.closePath();
      ctx.fill();
      strokeNow(ctx, 3, INK);
      for (let i = 0; i < 5; i++) puffs(ctx, 520 + i * 300 * k, MARS_G, prog(a, 14.7 + i * 0.06, 16.4), { n: 5, spread: 80, seed: 50 + i, size: 34, rise: 130, color: '#e3a07c', shade: '#b46a4a' });
    }
    if (a > 2.3 && a < 3.95) rainbowRibbon(ctx, pastPts(H3b, a, 10, 0.02), 24, lt, 0.85);
    if (ph && a < 10.6) {
      // Phobos coming down hot, with Shadic behind it pushing
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const off = (i - 2.5) * 30;
        ctx.beginPath();
        ctx.moveTo(ph[0] + off * 0.6, ph[1] + off * 0.8);
        ctx.lineTo(ph[0] + off * 0.6 + 360 + hash(i) * 200, ph[1] + off * 0.8 - 300 - hash(i) * 160);
        strokeNow(ctx, 14 - Math.abs(i - 2.5) * 3, i % 2 ? '#ffd28a' : '#9af2ff');
      }
      ctx.restore();
      drawH(ctx, h, a, { blink: 0 });
    }
    if (ph && a > 12.75) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      for (let i = 4; i > 0; i--) {
        const q = phobosAt3b(a - i * 0.04, z);
        if (q) phobos(ctx, q[0], q[1], PHOBOS3b.r * (1 - i * 0.08), a * 0.3);
      }
      ctx.restore();
    }
    if (ph) phobos(ctx, ph[0], ph[1], PHOBOS3b.r, a * 0.3, ph[2]);
    if ((a > 7.0 && a < 7.5) || (a > 15.6 && a < 16.3)) ghostsOf(ctx, H3b, a, 3, 0.03, drawH, 0.25);
    drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: z.blink ?? blinkAt(a, 3.4, 16), wind: a > 2.6 && a < 6.9 ? 1.2 : undefined });
    if (!(ph && a < 10.6)) drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 27) });
    whiff(ctx, ZS3b.x + 20, MARS_G - 20, Math.PI / 2, a - 5.5, 40);
    whiff(ctx, ZS3bH[0], ZS3bH[1] - 10, -2.6, a - 14.97, 46);
    hit3(ctx, ...ptZ(Z3b(14.05), 'hand'), lt - realT(14.05, hs), 0.5, 63, true);
    if (a > 14.6) punchWave(ctx, ...ptZ(Z3b(14.65), 'hand'), 0, a - 14.65, 1200, { life: 0.8 });
    warpRing(ctx, 520, HG3b, a - 14.62, 0.6);
    warpRing(ctx, 300, 340, a - 14.85, 0.6);
    ctx.restore();
    // the storm over everything, until one clap ends it
    const storm = prog(a, 2.6, 3.8) * (1 - prog(a, 6.85, 7.3));
    dustStorm(ctx, lt, storm);
    if (a > 6.85 && a < 7.5) {
      const [cx, cy] = camPoint(cs, ...ptZ(z, 'hand'));
      shock(ctx, cx, cy, prog(a, 6.85, 7.4), 1100, { w: 30, col: '#fff2dc' });
    }
    if (storm > 0.3) {
      // through the dust, the two of them as silhouettes
      ctx.save();
      ctx.globalAlpha = 0.6 * storm;
      silhouette(ctx, (g) => {
        g.save();
        camApply(g, cs);
        drawZ(g, z, a, {});
        if ((h.alpha ?? 1) > 0.5) drawH(g, h, a, {});
        g.restore();
      }, '#4a1c10');
      ctx.restore();
    }
    // the blocks spark through the dust
    ctx.save();
    camApply(ctx, cs);
    for (const s of STORM3b) if (s.zt) hit3(ctx, s.zt[0], s.zt[1], lt - realT(s.t, hs), 0.45, Math.round(s.t * 10), true);
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { drawZ(g, z, a, {}); drawH(g, h, a, {}); if (ph) phobos(g, ph[0], ph[1], PHOBOS3b.r, a * 0.3); }, ...ptZ(z, 'hand'), lt);
    if (a > 6.85 && a < 7.6) {
      const sl = slam(a - 6.9);
      if (sl) bigText(ctx, 'CLAP.', 640, 120, 80, { fill: '#ffffff', stroke: INK, sw: 12, scale: sl.s, alpha: sl.a * (1 - prog(a, 7.4, 7.6)), shadow: '#b8603e', rot: -0.03 });
    }
    talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
  },
});
