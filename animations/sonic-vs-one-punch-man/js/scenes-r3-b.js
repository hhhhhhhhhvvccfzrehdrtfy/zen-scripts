'use strict';
/* Round 3, chapter 2: the fight in Earth orbit. Every key is posed for its moment; contacts are solved
   onto their targets (and held still there), everything else gets the secondary-motion layer. */

// A pose shifted so that one of its parts lands on a point.
const atH = (part, pt, pose) => putH({ x: 0, y: 0, ...pose }, part, pt[0], pt[1]);

/* ---------- Saitama's frame for the blitz ---------- */

const ZB2 = { x: 860, y: 392, dir: -1, legs: [[0.85, -1.35], [1.2, -1.7]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.05, rot: 0.06 };
const ZH2 = ptZ(ZB2, 'head');
const T21 = [ZH2[0] - 24, ZH2[1] - 16];
const P21 = [T21[0] - 8, T21[1] + 8];
const T22 = [ZH2[0] - 18, ZH2[1] + 28];
const P22 = [T22[0] - 4, T22[1] + 10];
const T23 = [ZH2[0] + 26, ZH2[1] - 6];
const P23 = [T23[0] + 10, T23[1]];
const T24 = [ZH2[0] - 6, ZH2[1] - 52];
const P24 = [T24[0], T24[1] - 12];
const ZKNEE2 = { ...ZB2, legs: [[0.8, -1.3], [1.6, -2.0]] };
const P25 = (() => {
  const k = kneeZ(ZKNEE2);
  return [k[0] - 12, k[1]];
})();
const T26 = [ZH2[0] - 32, ZH2[1] + 6];
const P26 = [T26[0] - 9, T26[1]];

// Shadic's strike poses, each placed so the striking part lands on its point.
const C21 = atH('foot', P21, { dir: 1, legs: [[-0.45, -0.7], [2.15, -0.05]], arms: [[-1.7, 0.5], [0.9, 1.4]], lean: -0.45, rot: 0.25, expr: 'angry' });
const C22 = atH('hand', P22, { dir: 1, legs: [[-0.35, -0.45], [0.55, -1.0]], arms: [[-1.0, 0.6], [2.55, 0.2]], lean: -0.15, rot: -0.35, expr: 'determined' });
const C23 = atH('foot', P23, { dir: -1, legs: [[-0.45, -0.3], [2.3, -0.1]], arms: [[-1.2, 0.5], [-0.7, 0.9]], lean: -0.3, rot: -1.15, expr: 'angry' });
const C24 = atH('foot', P24, { dir: 1, legs: [[-0.55, -0.45], [1.35, 0.0]], arms: [[1.5, 0.8], [1.8, 0.6]], lean: 0.4, rot: 0.4, expr: 'angry' });
const C25 = atH('foot', P25, { dir: 1, legs: [[-0.4, -0.35], [1.62, -0.05]], arms: [[-0.9, 0.7], [0.5, 1.5]], lean: -0.3, rot: 0.05, expr: 'determined' });
const C26 = atH('hand', P26, { dir: 1, legs: [[-0.65, -0.35], [0.7, -0.85]], arms: [[-0.6, 0.8], [1.57, 0.05]], lean: 0.35, rot: 0, expr: 'angry' });
const off = (c, dx, dy, o = {}) => ({ ...c, x: c.x + dx, y: c.y + dy, ...o });
// While he studies the caught spear, Shadic tries a flying kick; the free forearm takes it.
const ZS2 = { ...ZB2, x: 864 };
const TB2 = [ZH2[0] - 36, ZH2[1] + 30];
const CB2 = atH('foot', [TB2[0] - 8, TB2[1]], { dir: 1, legs: [[-0.45, -0.65], [1.65, -0.05]], arms: [[-1.5, 0.5], [0.9, 1.4]], lean: -0.4, rot: 0.15, expr: 'angry' });

/* ---------- the exchange ---------- */

const ZX2 = { x: 345, y: 300, dir: 1, legs: [[0.85, -1.35], [1.2, -1.75]], arms: [[0.55, 1.65], [0.8, 1.75]], lean: 0.06, rot: 0.05 };
const ZXH = ptZ(ZX2, 'head');
const HX2 = { x: 482, y: 266, dir: -1, legs: [[0.6, -1.2], [1.05, -1.55]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.12, rot: 0, expr: 'angry' };
const KICK2 = (t, near, pt) => {
  const legs = near ? [[0.85, -1.5], [1.66, -0.05]] : [[1.66, -0.05], [0.9, -1.55]];
  return atH(near ? 'foot' : 'footFar', pt, { dir: -1, legs, arms: [[-1.3, 0.6], [-1.0, 0.8]], lean: -0.35, rot: -0.45, expr: 'angry' });
};
const B2a = [ZXH[0] + 30, ZXH[1] + 34];
const B2b = [ZXH[0] + 26, ZXH[1] + 56];
const B2c = [ZXH[0] + 32, ZXH[1] + 20];
const K2a = KICK2(20.28, true, [B2a[0] + 8, B2a[1]]);
const K2b = KICK2(20.4, false, [B2b[0] + 8, B2b[1]]);
const K2c = KICK2(20.52, true, [B2c[0] + 8, B2c[1]]);
const CATCH2 = ptH(K2c, 'foot');

// Shadic's knee, met by Saitama's palm.
const KN2 = { dir: -1, legs: [[-0.6, -0.3], [1.85, -2.5]], arms: [[-1.4, 0.6], [1.2, 1.5]], lean: 0.2, rot: 0.5, expr: 'angry' };
const PALM2 = [ZXH[0] + 36, ZXH[1] + 70];
const KN2P = (() => {
  const st = { x: 0, y: 0, ...KN2 };
  const k = kneeH(st);
  return { ...st, x: PALM2[0] + 10 - k[0], y: PALM2[1] - k[1] };
})();

/* ---------- tracks ---------- */

const Z2raw = makeTrack3([
  { t: 0, x: 880, y: 1060, dir: -1, legs: [[-0.05, -0.03], [0.06, -0.08]], arms: [[-0.16, 0.08], [0.1, 0.06]], lean: 0, rot: 0, expr: 'puff', hands: ['fist', 'fist'] },
  { t: 0.85, y: 420, e: E.out3 },
  { t: 1.15, y: 400, legs: [[0.8, -1.25], [1.1, -1.55]], arms: [[0.7, 0.8], [0.9, 0.9]], lean: 0.03, rot: 0.08 },
  { t: 1.6, y: 396 },
  { t: 2.25, arms: [[0.6, 0.8], [0.9, 1.5]], hands: ['fist', 'thumb'], lean: 0.05, e: E.out3 },
  { t: 3.4, arms: [[0.65, 0.85], [0.8, 1.4]] },
  { t: 4.25, arms: [[0.6, 0.8], [0.7, 0.9]], hands: ['fist', 'fist'], expr: 'puff' },
  { t: 4.3, expr: 'ok' },
  { t: 4.65, arms: [[0.6, 0.8], [0.95, 1.3]], hands: ['fist', 'open'], tilt: 0.16, e: E.out },
  { t: 5.3, arms: [[0.6, 0.8], [0.9, 1.25]], tilt: 0.12 },
  { t: 5.6, arms: [[0.6, 0.85], [0.7, 0.85]], hands: ['fist', 'fist'], tilt: 0 },
  { t: 6.5, ...ZB2, y: 396, arms: [[0.4, 1.0], [0.5, 1.1]], expr: 'ok' },
  { t: 6.6, expr: 'serious' },
  { t: 7.0, ...ZB2 },
  // blitz blocks
  { t: 7.17, arms: [[0.6, 1.6], [1.5, 1.9]] },
  { t: 7.25, ...hitArmZ(ZB2, T21[0], T21[1]), still: 1, e: E.out3 },
  { t: 7.4, ...ZB2, still: 0 },
  { t: 7.5, arms: [[0.75, 1.1], [0.85, 1.7]] },
  { t: 7.58, ...hitArmZ(ZB2, T22[0], T22[1], true), hands: ['open', 'fist'], still: 1, e: E.out3 },
  { t: 7.72, ...ZB2, hands: ['fist', 'fist'], still: 0 },
  { t: 7.8, arms: [[-0.9, 1.5], [0.85, 1.7]] },
  { t: 7.88, ...hitArmZ(ZB2, T23[0], T23[1], true), hands: ['open', 'fist'], tilt: 0.1, still: 1, e: E.out3 },
  { t: 8.0, ...ZB2, hands: ['fist', 'fist'], tilt: 0, still: 0 },
  { t: 8.1, arms: [[0.6, 1.6], [2.3, 0.8]] },
  { t: 8.18, ...hitArmZ(ZB2, T24[0], T24[1]), still: 1, e: E.out3 },
  { t: 8.3, ...ZB2, still: 0 },
  { t: 8.38, legs: [[-0.3, -0.35], [1.0, -1.4]] },
  { t: 8.46, ...ZKNEE2, still: 1, e: E.out3 },
  { t: 8.58, ...ZB2, still: 0 },
  { t: 8.66, arms: [[1.0, 1.0], [0.85, 1.7]] },
  { t: 8.74, ...hitArmZ(ZB2, T26[0], T26[1], true), hands: ['open', 'fist'], still: 1, e: E.out3 },
  { t: 9.02, hands: ['open', 'fist'] },
  { t: 9.06, arms: [[0.9, 1.2], [0.85, 1.7]], hands: ['fist', 'fist'], still: 0 },
  { t: 9.14, lean: -0.3, tilt: -0.25, x: 866, e: E.out3 },
  { t: 9.45, ...ZB2, tilt: 0 },
  // the catch
  { t: 10.3, look: -0.5 },
  { t: 10.62, arms: [[0.6, 1.6], [1.2, 0.6]], hands: ['fist', 'open'], look: 0 },
  { t: 10.84, ...hitArmZ(ZB2, 790, 368), hands: ['fist', 'open'], still: 1, e: E.out3 },
  { t: 10.95, x: 866 },
  { t: 11.3, arms: [[1.2, 0.9], hitArmZ(ZB2, 790, 368).arms[1]], hands: ['fist', 'open'] },
  { t: 11.38, arms: [[1.4, 1.4], hitArmZ(ZB2, 790, 368).arms[1]], hands: ['fist', 'open'] },
  { t: 11.45, arms: [armZ({ ...ZB2, x: 866, lean: 0.12 }, 760, 338, true, true), hitArmZ(ZB2, 790, 368).arms[1]], hands: ['finger', 'open'], lean: 0.12, e: E.out3 },
  { t: 11.7, ...ZB2, hands: ['fist', 'fist'], still: 0 },
  // spears
  { t: 12.9, ...ZB2 },
  { t: 12.95, tilt: 0.28, x: 868, e: E.out3 },
  { t: 13.0, x: 880, lean: -0.1, tilt: 0.1, e: E.out3 },
  { t: 13.05, arms: [[0.6, 1.6], [1.3, 0.6]], hands: ['fist', 'open'], lean: 0, e: E.out3 },
  { t: 13.12, legs: [[0.85, -1.35], [1.5, -1.9]], arms: [[0.6, 1.6], [0.85, 1.7]], hands: ['fist', 'fist'], x: 872 },
  { t: 13.2, legs: ZB2.legs, arms: [[1.3, 0.5], [0.85, 1.7]], hands: ['open', 'fist'], e: E.out3 },
  { t: 13.27, arms: ZB2.arms, hands: ['fist', 'fist'], lean: 0.4, y: 402, tilt: 0.2, e: E.out3 },
  { t: 13.33, lean: 0.05, y: 392, tilt: 0, rot: 0.2 },
  { t: 13.38, rot: 0, arms: [[0.6, 1.6], [1.2, 0.5]], hands: ['fist', 'open'], e: E.out3 },
  { t: 13.45, ...ZB2, x: 864 },
  { t: 13.53, ...hitArmZ({ ...ZB2, x: 864 }, 836, 354, false, true), hands: ['fist', 'finger'], still: 1, e: E.out3 },
  { t: 13.75, still: 0 },
  { t: 13.95, arms: [[1.2, 1.5], [1.0, 2.1]], tilt: 0.12, hands: ['fist', 'finger'] },
  { t: 14.05, arms: [armZ(ZS2, TB2[0], TB2[1], true), [1.0, 2.1]], tilt: 0.12, still: 1, e: E.out3 },
  { t: 14.25, arms: [[0.6, 1.6], [1.0, 2.1]], tilt: 0.12, still: 0 },
  { t: 14.75, arms: [[0.6, 1.6], [1.05, 2.15]] },
  { t: 14.82, hands: ['fist', 'fist'], arms: [[0.6, 1.6], [1.1, 2.25]], e: E.out3 },
  { t: 15.0, ...ZB2, tilt: 0 },
  // the satellite push-off
  { t: 15.1, tilt: -0.15, look: 1 },
  { t: 15.55, x: 905, y: 318, rot: 1.45, legs: [[1.2, -2.0], [1.4, -2.1]], arms: [[-0.6, 0.6], [1.6, 1.2]], lean: 0.1, tilt: 0, look: 0, e: E.inOut },
  { t: 15.72, x: 880, y: 316, legs: [[0.15, -0.1], [0.25, -0.15]], arms: [[-0.6, 0.5], [2.95, 0.05]], e: E.out3 },
  { t: 16.03, x: 392, y: 296, e: E.in },
  { t: 16.35, x: 345, y: 300, rot: 0.6, e: E.out },
  { t: 16.7, rot: 0.1, legs: [[0.8, -1.3], [1.1, -1.6]], arms: [[-0.6, 0.6], [1.4, 0.4]] },
  { t: 16.85, rot: 0.1, tilt: 0.16, still: 1, e: E.out3 },
  { t: 17.1, still: 0 },
  { t: 17.4, tilt: 0.12, arms: [[0.5, 1.4], [0.7, 1.5]], rot: 0 },
  { t: 17.45, dir: 1, tilt: 0, look: 0.6 },
  { t: 18.3, ...ZX2, look: 0 },
  // the exchange
  { t: 18.4, tilt: -0.2, lean: -0.12, e: E.out3 },
  { t: 18.5, tilt: 0, lean: 0.06 },
  { t: 18.56, ...hitArmZ(ZX2, ZXH[0] + 30, ZXH[1] + 6), still: 1, e: E.out3 },
  { t: 18.64, ...ZX2, still: 0 },
  { t: 18.72, arms: [[0.55, 1.65], [1.57, 0.0]], lean: 0.15, e: E.out3 },
  { t: 18.8, ...ZX2 },
  { t: 18.88, arms: [[0.55, 1.65], [0.25, 2.3]], lean: 0.1, still: 1, e: E.out3 },
  { t: 18.96, ...ZX2, still: 0 },
  { t: 19.04, legs: [[0.85, -1.35], [1.5, -2.0]], still: 1, e: E.out3 },
  { t: 19.12, ...ZX2, still: 0 },
  { t: 19.18, arms: [[-1.2, 1.4], [0.8, 1.75]] },
  { t: 19.24, ...hitArmZ(ZX2, 416, 258, true), lean: 0.12, still: 1, e: E.out3 },
  { t: 19.36, ...ZX2, still: 0 },
  { t: 19.46, arms: [[0.55, 1.65], [1.1, 0.8]], hands: ['fist', 'open'] },
  { t: 19.5, ...hitArmZ(ZX2, PALM2[0], PALM2[1]), hands: ['fist', 'open'], still: 1, e: E.out3 },
  { t: 19.6, ...ZX2, hands: ['fist', 'fist'], still: 0 },
  { t: 19.72, lean: 0.42, y: 318, tilt: 0.22, legs: [[0.7, -1.4], [0.9, -1.5]], e: E.out3 },
  { t: 19.9, ...ZX2 },
  { t: 19.98, arms: [[0.55, 1.65], [0.2, 2.2]], lean: 0.2, y: 306 },
  { t: 20.05, arms: [[0.4, 1.7], [2.6, 0.2]], lean: -0.1, y: 290, e: E.out3 },
  { t: 20.18, ...ZX2 },
  { t: 20.28, ...hitArmZ(ZX2, B2a[0], B2a[1]), still: 1, e: E.out3 },
  { t: 20.4, ...hitArmZ(ZX2, B2b[0], B2b[1], true), e: E.out3 },
  { t: 20.52, ...hitArmZ(ZX2, B2c[0], B2c[1]), e: E.out3 },
  { t: 20.64, ...hitArmZ(ZX2, CATCH2[0] - 4, CATCH2[1]), hands: ['fist', 'fist'], e: E.out3 },
  { t: 20.7, still: 0 },
  { t: 24.9 },
], Z_BASE);

// Saitama's head at the instant of the back-heel.
const ZT2H = ptZ(Z2raw(16.85), 'head');

// The heel kick lands on wherever Saitama's head really is.
function backHeel2(base) {
  return atH('foot', [ZT2H[0] + 14, ZT2H[1] - 6], { dir: -1, legs: [[-0.45, -0.3], [2.3, -0.1]], arms: [[-1.1, 0.5], [-0.7, 0.9]], lean: -0.3, rot: -1.6, expr: 'angry', ...base });
}
const BH2 = backHeel2({});

const H2raw = makeTrack3([
  { t: 0, x: 430, y: 352, dir: 1, legs: [[0.6, -1.2], [1.0, -1.55]], arms: HP.cross2.arms, lean: -0.08, headTilt: -0.06, rot: 0, expr: 'smirk', aura: 0.3, alpha: 1, ball: 0, spin: 0, hands: ['fist', 'fist'] },
  { t: 1.0, headTilt: 0.06, lean: -0.02 },
  { t: 2.0, y: 348 },
  { t: 2.7, arms: [[0.3, 1.35], [1.45, 0.25]], hands: ['fist', 'point'], lean: 0.12, headTilt: 0, e: E.out3 },
  { t: 3.6, arms: [[-0.3, 0.5], [0.7, 0.9]], hands: ['fist', 'fist'], headTilt: 0.12, lean: 0.04 },
  { t: 5.0, headTilt: 0.04, expr: 'smirk' },
  { t: 5.95, y: 356, legs: [[0.4, -1.1], [0.7, -1.4]], arms: [[-0.6, 0.9], [0.5, 1.9]], lean: 0.2, aura: 1.3, expr: 'grin', e: E.out3 },
  { t: 6.9, legs: [[0.6, -1.4], [0.9, -1.7]], lean: 0.3, y: 360 },
  // the blitz: he flickers in for each blow and out again
  { t: 7.0, alpha: 0, aura: 0.4 },
  { t: 7.16, ...off(C21, -46, -40, { legs: [[1.2, -2.0], [1.6, -2.3]], arms: [[-0.8, 0.9], [0.9, 1.6]], lean: 0.2, rot: 0.5 }), alpha: 1, cut: true },
  { t: 7.25, ...C21, still: 1, e: E.out3 },
  { t: 7.33, ...off(C21, -34, -14, { legs: [[-0.2, -0.8], [1.4, -1.2]], rot: 0.05 }), still: 0 },
  { t: 7.36, alpha: 0 },
  { t: 7.5, ...off(C22, -30, 56, { legs: [[1.0, -1.8], [1.3, -2.0]], arms: [[-0.5, 0.8], [0.3, 2.0]], lean: 0.35, rot: -0.3 }), alpha: 1, cut: true },
  { t: 7.58, ...C22, still: 1, e: E.out3 },
  { t: 7.65, ...off(C22, -22, 26), still: 0 },
  { t: 7.68, alpha: 0 },
  { t: 7.8, ...off(C23, 52, -8, { legs: [[0.2, -0.6], [1.7, -2.2]], arms: [[-1.0, 0.6], [-0.6, 1.0]], rot: -0.4 }), alpha: 1, cut: true },
  { t: 7.88, ...C23, still: 1, e: E.out3 },
  { t: 7.95, ...off(C23, 30, -10, { rot: -1.4 }), still: 0 },
  { t: 7.98, alpha: 0 },
  { t: 8.1, ...off(C24, -10, -64, { legs: [[-0.2, -0.4], [3.0, -0.1]], arms: [[-1.3, 0.6], [-1.0, 0.8]], lean: -0.3, rot: 0.3 }), alpha: 1, cut: true },
  { t: 8.18, ...C24, still: 1, e: E.in3 },
  { t: 8.25, ...off(C24, -14, -34, { rot: 0.1 }), still: 0 },
  { t: 8.28, alpha: 0 },
  { t: 8.38, ...off(C25, -50, 6, { legs: [[-0.3, -0.4], [1.7, -2.3]], arms: [[-0.6, 1.0], [0.4, 1.6]], lean: 0.1 }), alpha: 1, cut: true },
  { t: 8.46, ...C25, still: 1, e: E.out3 },
  { t: 8.53, ...off(C25, -30, 4), still: 0 },
  { t: 8.56, alpha: 0 },
  { t: 8.66, ...off(C26, -56, -8, { arms: [[1.3, 0.3], [0.2, 2.2]], lean: 0.1 }), alpha: 1, cut: true },
  { t: 8.74, ...C26, still: 1, e: E.out3 },
  { t: 8.85, expr: 'shock', legs: [[-0.4, -0.8], [0.9, -0.5]] },
  { t: 8.93, legs: [[0.4, -1.2], [1.2, -0.6]] },
  { t: 9.02, legs: [[-0.6, -0.2], [0.2, -1.0]], expr: 'angry' },
  { t: 9.1, ...off(C26, -6, 12, { legs: [[-0.3, -0.4], [2.6, -0.1]], arms: [[-1.4, 0.5], [-1.1, 0.7]], rot: -1.2, lean: -0.2 }), still: 0, e: E.out3 },
  { t: 9.32, x: 700, y: 300, legs: [[1.7, -2.4], [1.9, -2.5]], arms: [[1.1, 1.8], [1.3, 1.7]], lean: 0.4, rot: -3.4, e: E.lin },
  { t: 9.56, x: 540, y: 318, rot: -5.3, e: E.lin },
  { t: 9.82, x: 442, y: 344, legs: [[0.35, -0.95], [0.75, -1.3]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.12, rot: -TAU, e: E.out },
  { t: 9.821, rot: 0 },
  // the homing attack, caught
  { t: 9.95, legs: [[1.7, -2.4], [1.9, -2.5]], arms: [[1.1, 1.9], [1.3, 1.8]], lean: 0.5, rot: 0.3, e: E.out },
  { t: 10.0, ball: 1, spin: 0, rot: 0, y: 304 },
  { t: 10.3, spin: 30, x: 436, e: E.in },
  { t: 10.62, spin: 64, x: 418, e: E.inOut },
  { t: 10.84, x: 790 - 34, y: 368 - 40, spin: 82, still: 1, e: E.in },
  { t: 11.4, spin: 128 },
  { t: 11.45, spin: 132 },
  { t: 11.85, x: 250, y: 150, spin: 170, still: 0, e: E.out },
  { t: 11.9, ball: 0, legs: [[-0.6, -0.3], [0.9, -0.4]], arms: [[-2.0, 0.4], [2.2, 0.5]], lean: -0.3, rot: -0.8, expr: 'shock' },
  { t: 12.15, x: 290, y: 205, legs: [[0.6, -1.0], [0.9, -1.3]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: -0.3, rot: -0.2, jet: 1, e: E.out },
  { t: 12.4, x: 300, y: 222, rot: 0, lean: -0.1, legs: [[0.2, -0.6], [0.8, -1.0]], expr: 'angry', jet: 0.3 },
  // Chaos Spear, twice
  { t: 12.5, arms: [[0.2, 1.4], [-2.1, 0.5]], lean: -0.25, rot: -0.1, e: E.out },
  { t: 12.62, arms: [[-0.9, 0.6], [1.75, 0.05]], lean: 0.35, rot: 0.12, e: E.out3 },
  { t: 12.8, arms: [[-2.0, 0.6], [0.4, 1.5]], lean: -0.2, rot: -0.05 },
  { t: 12.95, arms: [[1.7, 0.1], [-0.6, 0.9]], lean: 0.35, rot: 0.12, e: E.out3 },
  { t: 13.3, arms: [[-0.4, 0.8], [0.3, 1.2]], lean: 0.05, rot: 0, jet: 0 },
  { t: 13.72, legs: [[1.2, -2.0], [1.5, -2.2]], arms: [[-0.9, 0.7], [-0.6, 0.9]], lean: 0.3, rot: -0.25, e: E.out },
  { t: 13.92, ...off(CB2, -150, -60, { legs: [[-0.3, -0.25], [-0.1, -0.5]], arms: [[-0.7, 0.4], [2.6, 0.2]], lean: 0.1, rot: 1.0 }), jet: 1, e: E.in },
  { t: 14.05, ...CB2, still: 1, jet: 0.4, e: E.out3 },
  { t: 14.16, ...off(CB2, -54, -46, { rot: -0.7, legs: [[0.6, -1.2], [1.1, -1.4]], arms: [[-2.0, 0.4], [1.8, 0.6]], lean: -0.3 }), still: 0, expr: 'shock' },
  { t: 14.5, x: 430, y: 250, rot: -0.1, legs: [[0.7, -1.1], [1.0, -1.4]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: -0.3, jet: 1, expr: 'angry', e: E.out },
  { t: 14.8, x: 440, y: 256, rot: 0, legs: [[0.3, -0.85], [0.75, -1.2]], arms: [[1.1, 1.8], [1.35, 1.7]], lean: 0.1, jet: 0.2 },
  { t: 14.95, expr: 'shock', lean: -0.12 },
  { t: 15.6, expr: 'angry', lean: 0.05, legs: [[0.3, -0.85], [0.75, -1.2]], arms: [[1.1, 1.8], [1.35, 1.7]] },
  // Chaos Control: gone before the punch lands, back behind him
  { t: 15.94, alpha: 1 },
  { t: 15.96, alpha: 0 },
  { t: 16.58, x: 446, y: 246, dir: -1, legs: [[0.3, -0.9], [0.7, -1.2]], arms: [[1.0, 1.7], [1.3, 1.6]], lean: 0.1, rot: 0, alpha: 0, expr: 'angry', cut: true },
  { t: 16.6, alpha: 1 },
  { t: 16.72, ...off(BH2, 26, -16, { legs: [[0.2, -0.6], [1.7, -2.2]], arms: [[-1.0, 0.6], [-0.6, 1.0]], rot: -0.9, lean: -0.2 }), e: E.out },
  { t: 16.85, ...BH2, still: 1, e: E.in },
  { t: 17.0, ...off(BH2, 18, -10, { rot: -1.25 }), still: 0 },
  { t: 17.25, x: 470, y: 250, rot: -0.3, legs: [[0.3, -0.85], [0.75, -1.2]], arms: [[1.0, 1.7], [1.3, 1.6]], lean: 0, expr: 'shock' },
  { t: 17.9, expr: 'angry', lean: 0.15 },
  { t: 18.3, ...HX2, e: E.out },
  // the exchange
  { t: 18.4, x: 408, arms: [[1.1, 1.8], [1.55, 0.05]], lean: 0.3, e: E.out3 },
  { t: 18.47, ...HX2, x: 452 },
  { t: 18.56, x: 404, arms: [[1.6, 0.0], [1.0, 1.6]], lean: 0.42, e: E.out3 },
  { t: 18.64, ...HX2, x: 446 },
  { t: 18.72, y: 286, x: 430, lean: 0.55, rot: 0.22, e: E.out3 },
  { t: 18.88, x: 404, arms: [[1.0, 1.7], [1.25, 0.9]], lean: 0.35, rot: 0.1, e: E.out3 },
  { t: 18.96, ...HX2, x: 440 },
  { t: 19.04, x: 406, legs: [[0.3, -0.85], [1.7, -2.3]], lean: 0.1, rot: -0.05, e: E.out3 },
  { t: 19.14, ...HX2, x: 432, arms: [[1.35, 2.0], [1.55, 1.95]] },
  { t: 19.24, x: 428, arms: [[1.4, 2.1], [1.6, 2.0]], lean: -0.1, still: 1, e: E.out },
  { t: 19.4, x: 506, y: 262, rot: -0.25, lean: -0.15, sq: -0.12, still: 0, e: E.out },
  { t: 19.44, x: 512, legs: [[1.0, -1.8], [1.3, -2.0]], arms: [[-0.8, 0.8], [0.4, 1.6]], lean: 0.3, rot: 0.2, sq: 0 },
  { t: 19.5, ...KN2P, still: 1, e: E.in },
  { t: 19.58, x: KN2P.x + 18, y: KN2P.y - 10, still: 0 },
  { t: 19.62, ...HX2, x: 470, y: 262, rot: 0 },
  { t: 19.85, x: 418, y: 262, legs: [[-0.45, -0.3], [1.66, -0.05]], arms: [[-1.3, 0.6], [-1.0, 0.8]], rot: TAU, lean: -0.3, e: E.inOut },
  { t: 19.851, rot: 0 },
  { t: 19.95, ...HX2, x: 430, y: 266 },
  { t: 20.05, x: 470, y: 258, rot: -0.75, lean: -0.35, e: E.out3 },
  { t: 20.2, x: 466, rot: -0.45, legs: [[0.8, -1.4], [1.6, -2.2]], arms: [[-1.3, 0.6], [-1.0, 0.8]], lean: -0.35 },
  { t: 20.28, ...K2a, still: 1, e: E.out3 },
  { t: 20.4, ...K2b, e: E.out3 },
  { t: 20.52, ...K2c, e: E.out3 },
  { t: 20.64, ...K2c, expr: 'shock' },
  { t: 20.7, still: 0 },
  { t: 24.9, alpha: 1 },
], H_BASE);



const H2 = animate(H2raw, { seed: 4 });
const Z2 = animate(Z2raw, { seed: 5, cape: true });

/* ---------- the giant swing and the throw ---------- */

const SWING2 = [20.7, 22.4];
// Two and a half turns, letting go with his arm up and back so Shadic flies off up and to the right.
const SWING2_END = 4 * Math.PI + 3.93;
function swing2(a) {
  const u = prog(a, SWING2[0], SWING2[1]);
  return SWING2_END * (0.55 * u * u + 0.45 * u * u * u);
}
function swingZ2(a) {
  const th = swing2(a);
  const base = Z2(Math.min(a, SWING2[0]));
  return { ...base, rot: th, arms: [[0.55, 1.6], [1.57, 0.05]], hands: ['fist', 'fist'], still: 1, tilt: 0.1, stretch: 0 };
}
function swingH2(a) {
  const z = swingZ2(a);
  const [hx, hy] = ptZ(z, 'hand');
  const [cx, cy] = [z.x, z.y];
  const dx = hx - cx;
  const dy = hy - cy;
  const d = Math.hypot(dx, dy) || 1;
  const rot = Math.atan2(dx / d, -dy / d);
  const st = { x: 0, y: 0, dir: 1, rot, legs: [[0.05, -0.05], [-0.05, -0.05]], arms: [[-2.6 + Math.sin(a * 30) * 0.4, 0.3], [2.7 + Math.sin(a * 27) * 0.4, 0.4]], lean: 0, expr: 'shock', s: SS };
  return { ...putH(st, 'foot', hx, hy), quillWob: 2.5, stretch: 0.12, stretchAng: rot - Math.PI / 2 };
}
// After the release: flung along the tangent, tumbling, toward the Moon.
const REL2 = (() => {
  const a = swingH2(SWING2[1]);
  const b = swingH2(SWING2[1] - 0.01);
  return { p: [a.x, a.y], v: [(a.x - b.x) * 100, (a.y - b.y) * 100], rot: a.rot };
})();
function thrownH2(a) {
  const u = a - SWING2[1];
  return { ...swingH2(SWING2[1]), x: REL2.p[0] + REL2.v[0] * u * 0.7, y: REL2.p[1] + REL2.v[1] * u * 0.7, rot: REL2.rot + u * 14, stretch: 0.15 };
}

function z2At(a) {
  if (a >= SWING2[0] && a < SWING2[1] + 0.25) {
    const z = swingZ2(Math.min(a, SWING2[1] + 0.25));
    if (a > SWING2[1]) z.rot = swing2(SWING2[1]) + (a - SWING2[1]) * 6;
    return z;
  }
  if (a >= SWING2[1] + 0.25) return Z2b(a);
  return Z2(a);
}
function h2At(a) {
  if (a >= SWING2[0] && a < SWING2[1]) return swingH2(a);
  if (a >= SWING2[1]) return thrownH2(a);
  return H2(a);
}

// Saitama after the throw: he looks after Shadic, works out how to move, and punches the void to fly.
const Z2b = animate(makeTrack3([
  { t: SWING2[1] + 0.25, x: 345, y: 300, dir: 1, rot: SWING2_END - 4 * Math.PI + 1.5 - TAU, legs: [[0.85, -1.35], [1.15, -1.65]], arms: [[0.55, 1.6], [1.4, 0.3]], lean: 0, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 22.95, rot: 0, arms: [[0.4, 0.8], [0.5, 0.9]], tilt: -0.22, look: 0.8, e: E.out },
  { t: 23.6, tilt: -0.1, look: 0.2, arms: [[0.3, 0.6], [0.9, 1.3]], hands: ['fist', 'open'], expr: 'ok' },
  { t: 24.0, arms: [[0.3, 0.6], [0.2, 0.4]], hands: ['fist', 'fist'], tilt: 0, expr: 'serious' },
  { t: 24.15, arms: [[0.5, 1.0], [0.9, 2.2]], lean: 0.12, legs: [[0.3, -0.7], [0.9, -1.2]], e: E.out },
  { t: 24.28, arms: [[0.6, 1.2], [-1.57, 0.05]], lean: 0.3, e: E.out3 },
  { t: 24.32, rot: 0.9, e: E.out },
  { t: 24.9, x: 1500, y: -200, rot: 1.1, arms: [[-0.6, 0.6], [2.95, 0.05]], legs: [[-0.1, -0.05], [0.05, -0.1]], lean: 0.05, e: E.in },
]), { seed: 6, cape: true });

/* ---------- effects and camera ---------- */

const HITS2 = [
  [7.25, P21, 0.7], [7.58, P22, 0.6], [7.88, P23, 0.7], [8.18, P24, 0.8], [8.46, P25, 0.6], [8.74, P26, 0.9],
  [10.84, [784, 368], 1.0], [11.45, [760, 334], 0.6], [14.05, TB2, 0.8],
  [18.56, [ZXH[0] + 30, ZXH[1] + 6], 0.5], [18.88, [ZXH[0] + 26, ZXH[1] + 60], 0.5], [19.04, [ZXH[0] + 40, ZXH[1] + 110], 0.5],
  [19.24, [418, 258], 1.0], [19.5, PALM2, 0.6], [20.28, B2a, 0.5], [20.4, B2b, 0.5], [20.52, B2c, 0.5], [20.64, CATCH2, 0.4],
];
const MISS2 = [[9.12, [800, 330], -2.2], [18.4, [ZXH[0] + 10, ZXH[1] - 2], 3.0], [18.72, [430, 240], 0.2], [19.85, [ZXH[0], ZXH[1] - 30], 3.5], [20.05, [450, 220], -1.2]];
// Blitz streaks: when he blinks from one blow to the next, a rainbow arc shows the path.
const BLITZ2 = [[7.0, 7.16], [7.36, 7.5], [7.68, 7.8], [7.98, 8.1], [8.28, 8.38], [8.56, 8.66]];

// Spears: [release, from (Shadic's hand), to, flight, fate] with fate 'pass', 'swat' (time, new angle) or 'catch'.
const SPEAR2 = (() => {
  const out = [];
  const v1 = [[850, 330, 'pass'], [872, 424, 'pass'], [840, 360, 13.05, -2.2], [884, 300, 'pass'], [846, 470, 'pass'], [848, 350, 13.2, -0.9]];
  const v2 = [[852, 340, 'pass'], [872, 384, 'pass'], [846, 398, 13.38, 2.4], [862, 300, 'pass'], [842, 424, 'pass'], [836, 354, 'catch']];
  v1.forEach(([x, y, f, ang], i) => out.push({ t0: 12.62 + i * 0.05, from: [342, 214], to: [x, y], dur: 0.32, fate: f, ang }));
  v2.forEach(([x, y, f, ang], i) => out.push({ t0: 12.95 + i * 0.05, from: [340, 226], to: [x, y], dur: 0.32 + (f === 'catch' ? 0.01 : 0), fate: f, ang }));
  return out;
})();

const CAM2 = makeTrack([
  { t: 0, x: 700, y: 430, z: 0.95, r: 0 },
  { t: 1.2, x: 680, y: 384, z: 1.08, r: 0, e: E.out },
  { t: 2.3, x: 650, y: 372, z: 1.25, r: 0 },
  { t: 5.9, x: 650, y: 366, z: 1.3, r: 0.01 },
  { t: 6.35, x: 830, y: 352, z: 1.7, r: 0.03, e: E.out3 },
  { t: 6.85, x: 826, y: 354, z: 1.75, r: 0.03 },
  { t: 7.0, x: 800, y: 372, z: 1.35, r: -0.02, e: E.out3 },
  { t: 7.6, x: 812, y: 360, z: 1.42, r: 0.02 },
  { t: 8.2, x: 830, y: 346, z: 1.45, r: -0.02 },
  { t: 8.74, x: 805, y: 356, z: 1.6, r: 0 },
  { t: 9.1, x: 770, y: 356, z: 1.35, r: 0 },
  { t: 9.82, x: 650, y: 360, z: 1.08, r: 0 },
  { t: 10.62, x: 640, y: 360, z: 1.05, r: 0 },
  { t: 10.84, x: 770, y: 368, z: 1.55, r: 0.03, e: E.out3 },
  { t: 11.4, x: 770, y: 368, z: 1.6, r: 0.03 },
  { t: 11.6, x: 560, y: 300, z: 0.95, r: -0.02, e: E.out },
  { t: 12.4, x: 520, y: 290, z: 1.0, r: 0 },
  { t: 12.62, x: 600, y: 300, z: 0.98, r: 0 },
  { t: 13.6, x: 790, y: 356, z: 1.3, r: 0, e: E.inOut },
  { t: 13.8, x: 700, y: 330, z: 1.05, r: 0 },
  { t: 14.05, x: 760, y: 350, z: 1.3, r: -0.03, e: E.out3 },
  { t: 14.5, x: 700, y: 330, z: 1.1, r: 0 },
  { t: 14.8, x: 760, y: 345, z: 1.3, r: 0.01 },
  { t: 15.1, x: 900, y: 340, z: 1.05, r: 0, e: E.out },
  { t: 15.6, x: 910, y: 330, z: 1.12, r: 0 },
  { t: 15.75, x: 760, y: 320, z: 1.0, r: -0.03, e: E.out },
  { t: 16.05, x: 420, y: 300, z: 1.15, r: 0.02, e: E.inOut },
  { t: 16.149, x: 420, y: 300, z: 1.15, r: 0.02 },
  { t: 16.15, x: 500, y: 430, z: 0.45, r: 0 },
  { t: 16.58, x: 480, y: 420, z: 0.5, r: 0 },
  { t: 16.59, x: 400, y: 280, z: 1.35, r: 0.02 },
  { t: 16.85, x: 392, y: 270, z: 1.55, r: -0.04, e: E.out3 },
  { t: 17.5, x: 396, y: 278, z: 1.5, r: -0.02 },
  { t: 18.3, x: 398, y: 282, z: 1.55, r: 0 },
  { t: 19.24, x: 412, y: 278, z: 1.4, r: 0.02 },
  { t: 19.5, x: 404, y: 284, z: 1.5, r: -0.02 },
  { t: 20.05, x: 398, y: 276, z: 1.45, r: 0.02 },
  { t: 20.64, x: 390, y: 290, z: 1.4, r: 0 },
  { t: 20.9, x: 360, y: 300, z: 0.95, r: 0.05, e: E.out },
  { t: 22.4, x: 370, y: 300, z: 0.85, r: -0.1 },
  { t: 22.75, x: 640, y: 220, z: 0.72, r: 0, e: E.out },
  { t: 22.9, x: 380, y: 300, z: 1.35, r: 0 },
  { t: 24.15, x: 372, y: 300, z: 1.45, r: 0 },
  { t: 24.5, x: 600, y: 220, z: 1.0, r: 0.03, e: E.in },
  { t: 24.9, x: 900, y: 120, z: 0.9, r: 0.05 },
]);

const L2 = [
  [0.4, 2.2, 'shadic', 'Took you long enough.'],
  [2.6, 4.2, 'shadic', '...Can you even breathe up here?'],
  [4.55, 5.9, 'saitama', '...Huh. Guess I don\'t need to.'],
  [6.0, 7.0, 'shadic', 'Then no holding back!', { shout: true }],
  [12.0, 12.9, 'shadic', 'CHAOS... SPEAR!', { shout: true }],
  [17.55, 18.3, 'shadic', '...Tch.'],
  [20.9, 22.3, 'shadic', 'WHOA-WHOA-WHOA!', { shout: true }],
  [23.0, 24.0, 'saitama', '...How do I move up here?'],
];

fightScene({
  id: 'orbit',
  name: 'Orbit',
  dur: 24.9,
  lines: L2,
  holds: [
    [7.25, 0.05, 8], [7.58, 0.05, 8], [7.88, 0.05, 9], [8.18, 0.06, 10], [8.46, 0.05, 9], [8.74, 0.1, 12, true],
    [10.84, 0.12, 14, true], [11.45, 0.06, 10], [14.05, 0.06, 10], [16.03, 0.08, 14], [16.85, 0.22, 20, true],
    [18.56, 0.04, 6], [18.88, 0.04, 6], [19.04, 0.04, 7], [19.24, 0.08, 12, true], [19.5, 0.05, 8],
    [20.28, 0.03, 6], [20.4, 0.03, 6], [20.52, 0.03, 6], [20.64, 0.06, 8], [22.4, 0.08, 14], [24.28, 0.1, 18],
  ],
  music: [[0, 'hyper']],
  cues: [
    [0.1, 'whoosh'], [2.3, 'pop'], [4.3, 'pff'], [5.95, 'charge'], [6.6, 'serious'],
    [7.12, 'tele'], [7.25, 'block'], [7.46, 'tele'], [7.58, 'block'], [7.76, 'tele'], [7.88, 'block'], [8.06, 'tele'], [8.18, 'block'], [8.34, 'tele'], [8.46, 'block'], [8.62, 'tele'], [8.74, 'punch'],
    [9.12, 'miss'], [9.3, 'whoosh'], [10.0, 'rev'], [10.5, 'rev'], [10.66, 'spear'], [10.84, 'punch'], [10.86, 'grind'], [11.45, 'flick'], [11.5, 'whoosh'],
    [12.62, 'spear'], [12.72, 'spear'], [12.95, 'spear'], [13.05, 'spear'], [13.05, 'block'], [13.2, 'block'], [13.38, 'block'], [13.53, 'clink'], [13.75, 'jet'], [14.05, 'block'], [14.82, 'snap'], [14.83, 'clink'],
    [15.55, 'thud'], [15.72, 'crunch'], [15.73, 'blast'], [15.94, 'tele'], [16.03, 'punch'], [16.05, 'boom'], [16.6, 'tele'], [16.85, 'punch'], [16.86, 'hit'],
    [18.4, 'miss'], [18.56, 'block'], [18.72, 'miss'], [18.88, 'block'], [19.04, 'block'], [19.24, 'punch'], [19.5, 'block'], [19.85, 'miss'], [20.05, 'miss'],
    [20.28, 'block'], [20.4, 'block'], [20.52, 'block'], [20.64, 'snap'], [20.8, 'whirl'], [21.6, 'whirl'], [22.4, 'blast'], [24.28, 'punch'], [24.3, 'boom'], [24.32, 'blast'],
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM2(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + (a > 20.8 && a < 22.4 ? 3 : 0));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z, r: c.r + (a > 20.7 && a < 22.4 ? 0.12 * Math.sin((a - 20.7) * 4) : 0) };
    const z = z2At(a);
    const h = h2At(a);
    const holeK = prog(a, 16.1, 16.9);
    starfield(ctx, cs, lt);
    layer(ctx, cs, 0.05, (g) => {
      const gl = g.createRadialGradient(470, -250, 4, 470, -250, 200);
      gl.addColorStop(0, 'rgba(255,252,230,1)');
      gl.addColorStop(0.15, 'rgba(255,230,160,0.45)');
      gl.addColorStop(1, 'rgba(255,210,140,0)');
      g.fillStyle = gl;
      g.fillRect(270, -450, 400, 400);
    });
    layer(ctx, cs, 0.14, (g) => earth(g, -80, 1420, 1220, lt, { spin: 0.003, shade: 0.5, hole: holeK > 0 ? [-0.22, -0.82, 0.12 * E.out3(holeK)] : null }));
    ctx.save();
    camApply(ctx, cs);
    // the satellite he kicks off
    if (a > 14.4 && a < 17.2) {
      const u = a - 14.4;
      const kicked = a > 15.72;
      const k = a - 15.72;
      const sx = kicked ? 1012 + k * 900 : 1190 - u * 115;
      const sy = kicked ? 296 + k * 120 : 282 + u * 10;
      satellite(ctx, sx, sy, 0.9, 0.3 + u * 0.35 + (kicked ? k * 6 : 0), kicked ? clamp(k * 6) : 0);
      if (kicked) spaceDebris(ctx, 1000, 300, k, { n: 10, seed: 41, v: 500, a0: 0.2, spread: 1.6, col: '#c8c2b0', size: 8 });
    }
    // the breath he did not need
    if (a > 4.3 && a < 5.2) {
      const u = prog(a, 4.3, 5.2);
      const [mx, my] = ptZ(z, 'head');
      for (let i = 0; i < 3; i++) circle(ctx, mx - 22 - u * 60 - i * 14, my + 12 - u * 10 + i * 4, (8 + i * 4) * (0.5 + u), `rgba(235,245,255,${0.6 * (1 - u)})`);
    }
    // blitz streaks between blows
    for (const [t0, t1] of BLITZ2) {
      if (a < t0 || a > t1 + 0.12) continue;
      const A = ptH(H2raw(t0 - 0.001), 'center');
      const B = ptH(H2raw(t1 + 0.001), 'center');
      const mid = [(A[0] + B[0]) / 2 + (A[1] - B[1]) * 0.5, (A[1] + B[1]) / 2 - (A[0] - B[0]) * 0.5];
      const pts = [];
      const head = prog(a, t0, t1);
      for (let k = 0; k < 14; k++) {
        const u = clamp(head - k * 0.06);
        pts.push([(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * mid[0] + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * mid[1] + u * u * B[1]]);
      }
      rainbowRibbon(ctx, pts, 22, lt, 1 - prog(a, t1, t1 + 0.12));
    }
    // fast moves leave afterimages
    const fastH = (a > 9.2 && a < 9.8) || (a > 11.45 && a < 11.9) || (a > 19.75 && a < 19.86) || a > SWING2[1];
    if (fastH) ghostsOf(ctx, h2At, a, 3, 0.025, drawH, 0.28);
    if (a > 15.72 && a < 16.05) ghostsOf(ctx, z2At, a, 3, 0.03, drawZ, 0.25);
    if (a > 10.0 && a < 10.84) rainbowRibbon(ctx, pastPts(H2, a, 8, 0.015).map(([x, y]) => [x, y + 40]), 30, lt, 0.8);
    drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: blinkAt(a, 3.4, 2), wind: z.wind });
    drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 7) });
    // the ball grinding in his palm
    if (a > 10.84 && a < 11.45) for (let i = 0; i < 3; i++) sparks(ctx, 786, 368 + (i - 1) * 10, ((a * 7 + i * 0.33) % 1), { n: 6, len: 60, seed: Math.floor(a * 7) * 3 + i, a0: Math.PI * 0.8, spread: 1.6 });
    // spears
    for (const s of SPEAR2) {
      const u = (a - s.t0) / s.dur;
      if (u < 0) continue;
      const ang = Math.atan2(s.to[1] - s.from[1], s.to[0] - s.from[0]);
      if (u < 1) {
        hyperSpear(ctx, lerp(s.from[0], s.to[0], u), lerp(s.from[1], s.to[1], u), ang, 0.7, 1, lt);
        continue;
      }
      const after = a - (s.t0 + s.dur);
      if (s.fate === 'pass') {
        if (after < 0.4) hyperSpear(ctx, s.to[0] + Math.cos(ang) * after * 1400, s.to[1] + Math.sin(ang) * after * 1400, ang, 0.7, 1 - after / 0.4, lt);
      } else if (s.fate === 'catch') {
        if (a < 14.82) {
          const [fx, fy] = ptZ(z, 'finger');
          hyperSpear(ctx, fx + 8, fy, ang + 0.2 * Math.sin(a * 2), 0.6, 1, lt);
        } else spaceDebris(ctx, ptZ(z, 'hand')[0], ptZ(z, 'hand')[1], a - 14.82, { n: 8, seed: 77, v: 240, col: '#bff6ff', size: 5, life: 0.8 });
      } else if (after < 0.5) {
        hyperSpear(ctx, s.to[0] + Math.cos(s.ang) * after * 1200, s.to[1] + Math.sin(s.ang) * after * 1200, s.ang, 0.7, 1 - after / 0.5, lt);
        hit3(ctx, s.to[0], s.to[1], after, 0.25, 11, true);
      }
    }
    // the missed punch: a pressure wave toward Earth
    punchWave(ctx, 330, 300, 2.5, a - 16.03, 1100, { life: 0.8 });
    if (a > 24.28) punchWave(ctx, ptZ(z, 'hand')[0], ptZ(z, 'hand')[1], Math.PI + 0.25, a - 24.28, 700, { life: 0.6 });
    for (const [ha, [hx, hy], sz] of HITS2) hit3(ctx, hx, hy, lt - realT(ha, hs), sz * 0.42, Math.round(ha * 10), true);
    hit3(ctx, ZT2H[0] + 14, ZT2H[1] - 6, lt - realT(16.85, hs), 0.8, 9, true);
    for (const [ma, [mx, my], ang] of MISS2) whiff(ctx, mx, my, ang, a - ma, 46);
    if (a > 10.15 && a < 10.84) reticle(ctx, 800, 360, lt, prog(a, 10.15, 10.45));
    for (const t0 of [7.15, 7.49, 7.79, 8.09, 8.37, 8.65]) warpRing(ctx, ...ptH(H2raw(t0 + 0.02), 'center'), (a - t0) * 1.6, 0.28);
    warpRing(ctx, 300, 222, a - 15.95, 1);
    warpRing(ctx, 446, 246, a - 16.58, 1);
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { drawZ(g, z, a, {}); drawH(g, h, a, {}); }, ...(fr.h.a === 16.85 ? [ZT2H[0], ZT2H[1]] : [z.x, z.y - 40]), lt);
    talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
  },
});
