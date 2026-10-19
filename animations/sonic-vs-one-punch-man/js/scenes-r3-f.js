'use strict';
/* Round 3, chapter 6: Saturn's rings. Shadic grinds the ring edge like a rail while Saitama skates
   after him on the ice; an ice tornado; and the Serious Table Flip, a slab of ring flipped up like a
   table. The ring surface is at y = RING_Y. */

const ZG6 = RING_Y - 150;
const HG6 = RING_Y - SS * HC;
const SLAB6 = { pivot: [2950, RING_Y], len: 520, thick: 64 };
const FLIP6 = [10.36, 10.8]; // the slab reaches Shadic at 10.48
const slabAng6 = (a) => -1.5 * E.out3(prog(a, FLIP6[0], FLIP6[1]));
const TORN6 = [2900, 410];

const H6raw = makeTrack3([
  { t: 0, x: 60, y: 80, dir: 1, rot: 3.0, ground: 0, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [2.5, 0.5]], expr: 'pain', aura: 0.4, alpha: 1, jet: 0, hands: ['fist', 'fist'] },
  { t: 0.75, x: 420, y: 470, rot: TAU, e: E.in },
  { t: 0.751, rot: 0 },
  { t: 0.8, x: 440, y: HG6, ground: 1, legs: [[0.9, -1.6], [1.2, -1.7]], arms: [[-1.5, 0.4], [-1.3, 0.5]], lean: -0.2, sq: -0.12, e: E.in },
  { t: 1.6, x: 680, legs: [[0.6, -1.2], [0.9, -1.3]], arms: [[-1.6, 0.4], [1.4, 0.5]], lean: 0.1, sq: 0, expr: 'angry', e: E.out },
  // grinding the ring edge, arms out for balance
  { t: 2.2, x: 760, legs: [[0.75, -1.4], [1.05, -1.5]], arms: [[-1.5, 0.5], [1.5, 0.4]], lean: 0.28 },
  { t: 2.8, x: 1150, legs: [[0.9, -1.6], [1.2, -1.7]], arms: [[-1.8, 0.3], [1.2, 0.6]], lean: 0.22, e: E.lin },
  { t: 3.25, x: 1450, arms: [[0.6, 1.6], [1.2, 1.8]], lean: 0.1, e: E.lin },
  { t: 3.4, x: 1550, arms: [[0.6, 1.6], [-1.9, 0.1]], lean: -0.05, e: E.lin },
  { t: 3.7, x: 1760, arms: [[-1.4, 0.5], [1.6, 0.4]], lean: 0.3, legs: [[0.7, -1.3], [1.0, -1.45]], e: E.lin },
  { t: 4.2, x: 2100, legs: [[1.0, -1.7], [1.25, -1.8]], arms: [[-1.7, 0.4], [1.3, 0.6]], lean: 0.24, e: E.lin },
  { t: 4.65, x: 2380, arms: [[0.6, 1.6], [1.2, 1.8]], lean: 0.1, e: E.lin },
  { t: 4.8, x: 2480, arms: [[0.6, 1.6], [-1.9, 0.1]], lean: -0.05, e: E.lin },
  { t: 5.6, x: 2950, arms: [[-1.5, 0.5], [1.5, 0.4]], lean: 0.3, legs: [[0.8, -1.5], [1.1, -1.6]], e: E.lin },
  { t: 6.2, x: 3250, legs: [[0.75, -0.3], [1.0, -0.15]], arms: [[-1.4, 0.4], [-1.6, 0.3]], lean: -0.32, e: E.out },
  { t: 6.4, x: 3300, dir: -1, legs: [[-0.12, -0.04], [0.16, -0.06]], arms: [[-0.3, 0.5], [0.2, 0.7]], lean: 0.05 },
  { t: 6.55, arms: [[-0.3, 0.5], [1.5, 0.1]], hands: ['fist', 'point'], lean: 0.15, expr: 'grin', e: E.out3 },
  { t: 6.95, legs: [[0.9, -1.7], [1.1, -1.8]], arms: [[-1.0, 0.5], [-0.8, 0.6]], hands: ['fist', 'fist'], lean: 0.4, e: E.out },
  { t: 7.0, alpha: 0 },
  // above the tornado, daring him
  { t: 7.9, x: 3120, y: 300, ground: 0, legs: [[0.6, -1.2], [1.0, -1.5]], arms: HP.cross2.arms, lean: -0.05, alpha: 0, expr: 'grin', cut: true },
  { t: 7.95, alpha: 1 },
  { t: 8.0, arms: [[-0.3, 0.5], [1.4, 0.3]], hands: ['fist', 'point'], lean: 0.1 },
  { t: 8.8, arms: HP.cross2.arms, hands: ['fist', 'fist'], lean: -0.05, expr: 'smirk' },
  { t: 10.3, expr: 'shock', lean: -0.2, arms: [[1.3, 2.0], [1.5, 1.9]] },
  // smacked by the slab
  { t: 10.48, rot: 0, still: 1 },
  { t: 10.5, x: 3090, y: 280, rot: -0.8, legs: [[0.9, -0.3], [-0.4, -0.9]], arms: [[-2.3, 0.4], [2.5, 0.5]], lean: -0.4, expr: 'pain', sq: -0.2, still: 0 },
  { t: 11.0, x: 2700, y: 120, rot: -5.5, sq: 0.15, e: E.out },
  { t: 11.25, x: 2760, y: 150, rot: -TAU, legs: [[0.9, -1.4], [1.1, -1.6]], arms: [[-1.2, 0.5], [-1.0, 0.6]], lean: -0.3, sq: 0, jet: 1, expr: 'tired', e: E.out },
  { t: 11.251, rot: 0 },
  { t: 11.5, legs: [[0.7, -1.3], [1.0, -1.6]], arms: [[-0.3, 0.4], [0.1, 0.5]], lean: 0.25, jet: 0.3 },
  { t: 12.0, lean: 0.15 },
  { t: 12.5, lean: 0.28 },
  { t: 13.0, lean: 0.12 },
  { t: 13.9, arms: [[-0.6, 0.9], [0.5, 1.9]], lean: 0.2, expr: 'grin' },
  { t: 14.4, arms: [[-1.2, 0.4], [1.3, 0.4]], legs: [[-0.5, -0.2], [0.6, -0.3]], lean: -0.25, aura: 1.6, expr: 'yell', e: E.out3 },
  { t: 15.0, legs: [[1.2, -2.0], [1.4, -2.1]], arms: [[-1.0, 0.5], [-0.8, 0.6]], lean: 0.4, rot: -0.4, expr: 'determined' },
  { t: 15.2, x: 2300, y: -500, legs: [[-0.35, -0.25], [-0.15, -0.55]], arms: [[-0.6, 0.3], [2.8, 0.15]], rot: -1.2, lean: 0.1, jet: 1.2, sq: 0.25, e: E.in },
  { t: 16.0, x: 2300, y: -500 },
], H_BASE);

const ICE6 = [
  { t0: 3.4, t1: 3.75, how: 'punch' },
  { t0: 4.8, t1: 5.15, how: 'catch' },
];

const Z6raw = makeTrack3([
  { t: 0, x: -300, y: -200, dir: 1, ground: 0, rot: 1.0, legs: [[-0.25, -0.15], [-0.05, -0.35]], arms: [[-0.6, 0.5], [2.95, 0.05]], lean: 0.05, expr: 'serious', hands: ['fist', 'fist'] },
  { t: 1.4, x: -200, y: 0 },
  { t: 1.9, x: 230, y: ZG6, ground: 1, rot: 0, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.7, 0.5], [-0.5, 0.6]], lean: 0.35, sq: -0.12, e: E.in },
  { t: 2.15, legs: [[-0.3, -0.1], [0.35, -0.3]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.05, sq: 0 },
  // skating after him: push, glide, push
  { t: 2.4, x: 270, legs: [[-0.7, -0.2], [0.7, -1.0]], arms: [[0.9, 1.4], [-0.5, 1.3]], lean: 0.35, e: E.out },
  { t: 2.9, x: 700, legs: [[-0.5, -0.1], [0.5, -0.25]], arms: [[0.7, 1.3], [-0.3, 1.2]], lean: 0.28, e: E.lin },
  { t: 3.4, x: 1150, legs: [[0.7, -1.0], [-0.7, -0.2]], arms: [[-0.5, 1.3], [0.9, 1.4]], lean: 0.33, e: E.lin },
  { t: 3.62, x: 1330, arms: [[0.9, 1.6], [-0.7, 1.9]], lean: 0.1, e: E.lin },
  { t: 3.75, x: 1430, arms: [[-0.7, 1.9], [1.57, 0.04]], legs: [[-0.5, -0.1], [0.5, -0.3]], lean: 0.2, e: E.lin },
  // the slip
  { t: 4.0, x: 1600, legs: [[1.3, -0.2], [-0.3, -0.1]], arms: [[2.5, 0.3], [-2.2, 0.4]], lean: -0.45, tilt: -0.2, e: E.lin },
  { t: 4.15, x: 1700, arms: [[-2.3, 0.4], [2.6, 0.3]], lean: -0.3, e: E.lin },
  { t: 4.35, x: 1830, legs: [[-0.6, -0.15], [0.6, -0.9]], arms: [[0.8, 1.4], [-0.4, 1.3]], lean: 0.25, tilt: 0, e: E.lin },
  { t: 4.8, x: 2150, legs: [[0.7, -1.0], [-0.7, -0.2]], arms: [[-0.5, 1.3], [0.9, 1.4]], lean: 0.33, e: E.lin },
  { t: 5.05, x: 2300, arms: [[0.6, 1.4], [1.3, 0.6]], hands: ['fist', 'open'], lean: 0.2, e: E.lin },
  { t: 5.15, x: 2360, arms: [[0.6, 1.4], [1.5, 0.3]], e: E.lin },
  { t: 5.3, x: 2450, arms: [[0.6, 1.4], [1.2, 1.4]], hands: ['fist', 'fist'], e: E.lin },
  { t: 5.6, x: 2620, legs: [[-0.5, -0.1], [0.5, -0.25]], arms: [[0.7, 1.3], [-0.3, 1.2]], lean: 0.28, e: E.lin },
  { t: 6.2, x: 2850, legs: [[0.7, -0.3], [1.0, -0.15]], arms: [[-1.4, 0.4], [-1.6, 0.3]], lean: -0.3, e: E.out },
  { t: 6.5, x: 2900, legs: [[-0.3, -0.1], [0.35, -0.3]], arms: [[0.6, 1.6], [0.85, 1.7]], lean: 0.05 },
  // in the tornado: looks up, declines to sneeze, grabs the ring
  { t: 7.6, tilt: -0.2, arms: [[0.3, 0.8], [0.5, 0.9]] },
  { t: 8.6, tilt: -0.1, expr: 'ok' },
  { t: 9.2, tilt: 0, expr: 'serious' },
  { t: 9.5, legs: [[1.1, -2.0], [1.3, -2.1]], arms: [[1.0, 0.3], [1.2, 0.2]], hands: ['open', 'open'], lean: 0.55, e: E.out },
  { t: 10.2, legs: [[1.15, -2.05], [1.35, -2.15]], lean: 0.6 },
  { t: 10.3, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[1.2, 0.5], [1.4, 0.4]], lean: 0.5 },
  { t: 10.55, legs: [[-0.3, -0.05], [0.35, -0.1]], arms: [[2.6, 0.3], [2.8, 0.2]], hands: ['fist', 'fist'], lean: -0.3, sq: 0.08, e: E.out3 },
  { t: 10.9, arms: [[1.4, 0.6], [1.6, 0.5]], lean: 0, sq: 0 },
  { t: 11.4, legs: [[-0.3, -0.1], [0.35, -0.3]], arms: [[0.2, 0.5], [0.4, 0.6]], lean: 0.02 },
  { t: 12.8, tilt: -0.15, arms: [[0.2, 0.5], [0.8, 1.6]], hands: ['fist', 'point'] },
  { t: 13.8, tilt: -0.05, arms: [[0.2, 0.5], [0.4, 0.6]], hands: ['fist', 'fist'] },
  { t: 15.3, legs: [[1.0, -1.8], [1.2, -1.9]], arms: [[-0.9, 0.4], [-0.7, 0.5]], lean: 0.4, e: E.out },
  { t: 15.5, y: ZG6 - 40, ground: 0, legs: [[-0.05, -0.05], [0.05, -0.1]], arms: [[2.6, 0.2], [2.4, 0.3]], lean: 0, rot: -0.5, sq: 0.15, e: E.out3 },
  { t: 16.0, x: 2500, y: -400, sq: 0, e: E.in },
], Z_BASE);

const H6 = animate(H6raw, { seed: 16 });
const Z6 = animate(Z6raw, { seed: 17, cape: true });

const CAM6 = makeTrack([
  { t: 0, x: 400, y: 380, z: 0.9, r: 0 },
  { t: 1.9, x: 460, y: 440, z: 1.0, r: 0 },
  { t: 2.2, x: 560, y: 440, z: 0.95, r: 0 },
  { t: 3.4, x: 1350, y: 440, z: 0.95, r: 0.01, e: E.lin },
  { t: 4.2, x: 1900, y: 440, z: 0.95, r: -0.01, e: E.lin },
  { t: 5.6, x: 2780, y: 440, z: 0.95, r: 0, e: E.lin },
  { t: 6.5, x: 3080, y: 430, z: 1.0, r: 0, e: E.out },
  { t: 7.0, x: 2950, y: 380, z: 0.85, r: 0 },
  { t: 8.7, x: 2980, y: 360, z: 0.95, r: 0 },
  { t: 9.5, x: 2920, y: 440, z: 1.3, r: 0, e: E.out },
  { t: 10.3, x: 2920, y: 440, z: 1.35, r: 0 },
  { t: 10.6, x: 3000, y: 340, z: 0.75, r: -0.03, e: E.out3 },
  { t: 11.3, x: 2860, y: 280, z: 0.8, r: 0 },
  { t: 14.4, x: 2850, y: 290, z: 0.85, r: 0 },
  { t: 16.0, x: 2600, y: 0, z: 0.75, r: -0.04, e: E.in },
]);

const L6 = [
  [6.55, 7.4, 'shadic', 'Remember THIS one?!', { shout: true }],
  [8.0, 8.6, 'shadic', 'Go on. Sneeze.'],
  [8.7, 9.2, 'saitama', '...Nah.'],
  [9.6, 10.5, 'saitama', 'Serious Series: Serious Table Flip.'],
  [11.5, 12.7, 'shadic', '...Not bad, egg.'],
  [12.8, 13.8, 'saitama', "I'm bald. Not an egg."],
  [13.9, 15.0, 'shadic', "Then let's FINISH this!", { shout: true }],
];

function iceTornado(ctx, x, y, t, k) {
  if (k <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let j = 0; j < 11; j++) {
    const ry = 14 + j * 3;
    const rx = (70 + j * 18) * k;
    const yy = y + 160 - j * 42 * k;
    ctx.globalAlpha = 0.65 * Math.min(1, k * 1.5);
    ctx.strokeStyle = j % 2 ? '#e6f6ff' : '#9fd8f0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    const a0 = t * 12 + j;
    ctx.ellipse(x + Math.sin(t * 7 + j) * 6, yy, rx, ry, 0, a0, a0 + 4.4);
    ctx.stroke();
  }
  for (let i = 0; i < 18; i++) {
    const ang = t * (5 + hash(i) * 3) + i * 1.3;
    const hgt = (hash(i * 3) * 400 - 40) * k;
    const rr = (60 + hgt * 0.45) * (0.8 + hash(i * 5) * 0.4);
    const img = BG.ice[i % BG.ice.length];
    const r = 10 + hash(i * 7) * 14;
    ctx.globalAlpha = Math.sin(ang) > 0 ? 1 : 0.5;
    ctx.drawImage(img, x + Math.cos(ang) * rr - r, y + 160 - hgt + Math.sin(ang) * 16 - r, r * 2, r * 2);
  }
  ctx.restore();
}

function drawSlab6(ctx, ang) {
  const [px, py] = SLAB6.pivot;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(ang);
  const cols = ['#f0e1bd', '#d9c093', '#efdcb2', '#c9ab78'];
  cols.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, (i * SLAB6.thick) / cols.length, SLAB6.len, SLAB6.thick / cols.length + 1);
  });
  ctx.strokeStyle = '#3a2f20';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, SLAB6.len, SLAB6.thick);
  for (let i = 0; i < 6; i++) {
    const img = BG.ice[i % BG.ice.length];
    ctx.drawImage(img, 40 + i * 80, -18 + hash(i) * 8, 30, 30);
  }
  ctx.restore();
}

fightScene({
  id: 'saturn',
  name: "Saturn's Rings",
  dur: 16.0,
  lines: L6,
  holds: [[0.8, 0.05, 8], [3.75, 0.06, 10], [10.48, 0.25, 26, true]],
  music: [[0, 'hyper']],
  cues: [
    [0.75, 'thud'], [0.8, 'grind'], [1.9, 'thud'], [2.2, 'grind'], [2.8, 'skid'], [3.4, 'whoosh'], [3.75, 'punch'], [3.76, 'ice'], [4.0, 'boing'], [4.8, 'whoosh'], [5.15, 'clink'], [5.3, 'ice'], [6.2, 'skid'],
    [7.0, 'whirl'], [7.6, 'wind'], [8.4, 'whirl'], [9.5, 'thud'], [10.3, 'crack'], [10.32, 'rumble'], [10.48, 'punch'], [10.5, 'bigboom'], [10.55, 'ice'], [14.4, 'charge'], [15.2, 'blast'], [15.5, 'whoosh'],
  ],
  render(ctx, a, lt, hs, def) {
    const LL = def.lines;
    const c = CAM6(a);
    const [qx, qy] = shakeXY(lt, holdShake(lt, hs) + (a > 10.3 && a < 11.0 ? 10 : 0));
    const cs = { ...c, x: c.x - qx / c.z, y: c.y - qy / c.z };
    const z = Z6(a);
    const h = H6(a);
    const flipped = a >= FLIP6[0];
    ringPlane(ctx, cs, lt, { sx: -230, sy: -190, R: 190, gone: flipped ? [SLAB6.pivot[0], SLAB6.pivot[0] + SLAB6.len] : null });
    ctx.save();
    camApply(ctx, cs);
    if (flipped) {
      // the hole the slab came out of
      ctx.fillStyle = '#0b0a18';
      ctx.fillRect(SLAB6.pivot[0], RING_Y, SLAB6.len, 400);
      drawSlab6(ctx, slabAng6(a));
      spaceDebris(ctx, SLAB6.pivot[0] + 260, RING_Y, a - FLIP6[0], { n: 16, seed: 61, v: 400, ice: true, size: 12, a0: -Math.PI / 2, spread: 2.4, life: 2 });
    }
    // grind sparks and ice spray behind Shadic, skate spray behind Saitama
    if (a > 0.8 && a < 6.3) {
      const [fx] = ptH(h, 'foot');
      sparks(ctx, fx - 10, RING_Y - 4, (a * 6) % 1, { n: 8, len: 50, seed: Math.floor(a * 6), a0: Math.PI + 0.3, spread: 0.9, col: '#ffffff' });
      puffs(ctx, fx - 30, RING_Y, (a * 4) % 1, { n: 3, spread: 40, seed: Math.floor(a * 4) + 9, size: 12, dx: -50, color: '#eef8ff', shade: '#bcd8ec' });
    }
    if (a > 2.2 && a < 6.5) puffs(ctx, ptZ(z, 'foot')[0] - 20, RING_Y, (a * 3) % 1, { n: 3, spread: 30, seed: Math.floor(a * 3) + 40, size: 10, dx: -40, color: '#eef8ff', shade: '#bcd8ec' });
    if (a > 1.85 && a < 3.0) spaceDebris(ctx, 230, RING_Y, a - 1.9, { n: 12, seed: 66, v: 300, ice: true, size: 10, a0: -Math.PI / 2, spread: 2.2, life: 1.4 });
    // the ice chunks thrown back at him
    for (const b of ICE6) {
      if (a < b.t0) continue;
      const from = ptH(H6(b.t0), 'hand');
      const to = ptZ(Z6(b.t1), 'hand');
      if (a < b.t1) {
        const u = prog(a, b.t0, b.t1);
        const img = BG.ice[2];
        const x = lerp(from[0], to[0] + 20, u);
        const y = lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 40;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a * 8);
        ctx.drawImage(img, -24, -24, 48, 48);
        ctx.restore();
      } else if (b.how === 'punch') {
        spaceDebris(ctx, to[0] + 20, to[1], a - b.t1, { n: 14, seed: 67, v: 300, ice: true, size: 8, life: 1.2 });
        puffs(ctx, to[0] + 20, to[1], prog(a, b.t1, b.t1 + 0.8), { n: 6, spread: 50, seed: 68, size: 18, rise: 0, color: '#f4fbff', shade: '#cfe6f4' });
      } else if (a < 5.3) {
        const hp = ptZ(z, 'hand');
        ctx.drawImage(BG.ice[2], hp[0] - 20, hp[1] - 24, 44, 44);
      } else spaceDebris(ctx, ptZ(z, 'hand')[0], ptZ(z, 'hand')[1], a - 5.3, { n: 12, seed: 69, v: 160, ice: true, size: 6, life: 1.0 });
    }
    // the tornado, with Shadic as a rainbow blur running rings round it
    const tk = a < 10.48 ? prog(a, 7.1, 8.0) : 1 - prog(a, 10.48, 10.7);
    if (tk > 0 && a < 10.7) {
      iceTornado(ctx, TORN6[0], TORN6[1], lt, tk);
      if (a > 7.0 && a < 7.95) {
        const pts = [];
        for (let k = 0; k < 14; k++) {
          const an = (a - k * 0.012) * 26;
          pts.push([TORN6[0] + Math.cos(an) * 190, TORN6[1] + 140 + Math.sin(an) * 30]);
        }
        rainbowRibbon(ctx, pts, 24, lt, 0.9);
      }
    }
    if (a > 10.48 && a < 11.6) spaceDebris(ctx, TORN6[0], TORN6[1], a - 10.48, { n: 20, seed: 71, v: 700, ice: true, size: 12, life: 1.2 });
    if ((a > 0 && a < 0.75) || (a > 10.5 && a < 11.0) || a > 15.15) ghostsOf(ctx, H6, a, 3, 0.03, drawH, 0.25);
    drawZ(ctx, z, a, { talk: speaking(lt, LL, 'saitama'), blink: blinkAt(a, 3.4, 10) });
    drawH(ctx, h, a, { talk: speaking(lt, LL, 'shadic'), blink: blinkAt(a, 3.1, 18) });
    if (a > 15.15) rainbowRibbon(ctx, pastPts(H6, a, 10, 0.03), 30, lt, 0.9);
    hit3(ctx, ...ptZ(Z6(3.75), 'hand'), lt - realT(3.75, hs), 0.5, 31, false);
    hit3(ctx, 3110, 300, lt - realT(10.48, hs), 1.4, 32, false);
    ctx.restore();
    const fr = frameAt(lt, hs);
    if (fr) impactFrame(ctx, fr.phase, cs, (g) => { drawSlab6(g, slabAng6(a)); drawH(g, h, a, {}); drawZ(g, z, a, {}); }, 3110, 300, lt);
    if (a > 9.6 && a < 10.6) {
      const sl = slam(a - 9.95);
      if (sl) bigText(ctx, 'SERIOUS TABLE FLIP', 640, 640, 64, { fill: '#ffd21f', stroke: INK, sw: 12, scale: sl.s, alpha: sl.a * (1 - prog(a, 10.4, 10.6)), shadow: '#e3262f', rot: -0.03, maxW: 1100 });
    }
    talk(ctx, lt, LL, { shadic: headAnchor(cs, ptH(h, 'head'), 60), saitama: headAnchor(cs, ptZ(z, 'head'), 50) });
  },
});
