/* The Unmaker War — side-view humanoid rig: skeleton, poses, cel-shaded limbs, cloth, heads, hair. */
(function () {
  'use strict';
  const UW = window.UW;
  const { TAU, lerp, clamp, sat, hash, noise, mix, shade, rgba } = UW;
  const RIG = (UW.RIG = {});
  const D = Math.PI / 180;

  /* ---------- proportions (fractions of total height) ---------- */
  const DEF_B = {
    head: 0.132, headD: 0.118, headY: 0,
    neckLen: 0.036, neckR: 0.03, neckOff: 0.012,
    torso: 0.305, chest: 0.17, waist: 0.12, hips: 0.14, belly: 0, pecs: 0.012, traps: 0.01, glutes: 0.01,
    shX: -0.02, shY: 0.855,
    uarm: 0.168, farm: 0.15, hand: 0.072,
    thigh: 0.245, shin: 0.225, ankleH: 0.036, foot: 0.11,
    rDelt: 0.046,
    rUarm: [0.034, 0.037, 0.026], bUarm: [0.006, 0.004],
    rFarm: [0.029, 0.031, 0.021], bFarm: [0.005, 0.003],
    rHand: 0.022,
    rThigh: [0.054, 0.052, 0.032], bThigh: [0.008, 0.004],
    rShin: [0.031, 0.034, 0.02], bShin: [0.002, 0.009],
    rFoot: 0.021,
  };
  RIG.DEF_B = DEF_B;
  RIG.build = function (b) {
    return Object.assign({}, DEF_B, b || {});
  };

  /* ---------- poses (degrees in source, converted to radians) ---------- */
  const NUM_FIELDS = ['lean', 'pelvis', 'neck', 'head', 'sF', 'eF', 'wF', 'sB', 'eB', 'wB', 'hF', 'kF', 'aF', 'hB', 'kB', 'aB', 'air', 'dx', 'dy', 'rot', 'jaw'];
  const ANG_FIELDS = { lean: 1, pelvis: 1, neck: 1, head: 1, sF: 1, eF: 1, wF: 1, sB: 1, eB: 1, wB: 1, hF: 1, kF: 1, aF: 1, hB: 1, kB: 1, aB: 1, rot: 1 };
  RIG.NUM_FIELDS = NUM_FIELDS;

  function mk(deg) {
    const p = {};
    for (const k of NUM_FIELDS) p[k] = 0;
    p.handF = 'relax';
    p.handB = 'relax';
    p.ground = 'feet';
    for (const k in deg) {
      if (ANG_FIELDS[k]) p[k] = deg[k] * D;
      else p[k] = deg[k];
    }
    return p;
  }
  RIG.pose = mk;

  const POSES = (RIG.POSES = {
    idle: mk({ lean: 2, sF: 6, eF: 14, sB: -8, eB: 16, hF: 4, kF: 5, hB: -5, kB: 7 }),
    stand: mk({ lean: 0, sF: 3, eF: 8, sB: -3, eB: 8, hF: 2, kF: 2, hB: -2, kB: 3 }),
    proud: mk({ lean: -3, head: -6, sF: 10, eF: 10, sB: -12, eB: 12, hF: 8, kF: 2, hB: -8, kB: 2 }),
    tired: mk({ lean: 14, head: 16, neck: 8, sF: 4, eF: 10, sB: -2, eB: 12, hF: 10, kF: 16, hB: -6, kB: 14 }),
    stance: mk({ lean: 10, head: 6, sF: 28, eF: 118, sB: 62, eB: 72, hF: 24, kF: 26, hB: -22, kB: 14, handF: 'fist', handB: 'fist' }),
    guard: mk({ lean: 6, head: 12, sF: 62, eF: 128, sB: 58, eB: 122, hF: 16, kF: 22, hB: -18, kB: 16, handF: 'fist', handB: 'fist' }),
    punchWind: mk({ lean: -4, head: 8, sF: -26, eF: 118, sB: 72, eB: 36, hF: 26, kF: 20, hB: -26, kB: 10, handF: 'fist', handB: 'open' }),
    punch: mk({ lean: 20, head: 4, sF: 88, eF: 2, sB: 6, eB: 112, hF: 34, kF: 22, hB: -32, kB: 4, handF: 'fist', handB: 'fist' }),
    jab: mk({ lean: 12, head: 6, sF: 30, eF: 110, sB: 90, eB: 4, hF: 24, kF: 20, hB: -24, kB: 10, handF: 'fist', handB: 'fist' }),
    uppercut: mk({ lean: -14, head: -16, sF: 158, eF: 42, sB: 20, eB: 100, hF: 12, kF: 6, hB: -24, kB: 4, handF: 'fist', handB: 'fist' }),
    hammer: mk({ lean: 22, head: 10, sF: 96, eF: 30, sB: 100, eB: 34, hF: 30, kF: 36, hB: -30, kB: 20, handF: 'fist', handB: 'fist' }),
    hammerWind: mk({ lean: -18, head: -18, sF: 175, eF: 40, sB: 170, eB: 44, hF: 16, kF: 14, hB: -16, kB: 10, handF: 'fist', handB: 'fist' }),
    kick: mk({ lean: -18, head: 8, sF: -30, eF: 60, sB: 60, eB: 80, hF: 98, kF: 6, aF: -20, hB: -6, kB: 10, handF: 'fist', handB: 'fist' }),
    kickWind: mk({ lean: 4, head: 6, sF: 20, eF: 90, sB: 50, eB: 90, hF: 70, kF: 110, hB: -4, kB: 10, handF: 'fist', handB: 'fist' }),
    block: mk({ lean: 4, head: 14, sF: 74, eF: 134, sB: 66, eB: 126, hF: 18, kF: 26, hB: -22, kB: 20, handF: 'fist', handB: 'fist' }),
    hit: mk({ lean: -26, head: -24, neck: -8, sF: -34, eF: 40, sB: 46, eB: 30, hF: -6, kF: 30, hB: 22, kB: 14, handF: 'open', handB: 'open' }),
    hitHard: mk({ lean: -40, head: -30, neck: -10, sF: 30, eF: 20, sB: 90, eB: 20, hF: 30, kF: 60, hB: 10, kB: 40, handF: 'open', handB: 'open', ground: 'none' }),
    fly: mk({ rot: 76, head: -52, neck: -20, sF: 172, eF: 4, sB: 14, eB: 14, hF: 4, kF: 8, hB: -6, kB: 18, handF: 'fist', handB: 'relax', ground: 'none' }),
    flyFast: mk({ rot: 84, head: -60, neck: -24, sF: 176, eF: 0, sB: 176, eB: 0, hF: 0, kF: 4, hB: -4, kB: 10, handF: 'fist', handB: 'fist', ground: 'none' }),
    hover: mk({ lean: 2, sF: 20, eF: 24, sB: -12, eB: 26, hF: 10, kF: 28, hB: -6, kB: 38, aF: 30, aB: 34, ground: 'none' }),
    fall: mk({ lean: -30, head: -30, sF: 140, eF: 30, sB: 110, eB: 40, hF: 40, kF: 60, hB: 10, kB: 50, handF: 'open', handB: 'open', ground: 'none' }),
    kneel: mk({ lean: 8, head: 14, sF: 18, eF: 30, sB: 8, eB: 40, hF: 86, kF: 88, aF: 0, hB: -4, kB: 100, aB: 50, ground: 'feet' }),
    kneelLow: mk({ lean: 30, head: 26, neck: 10, sF: 30, eF: 20, sB: 10, eB: 20, hF: 90, kF: 100, hB: 0, kB: 105, aB: 50, handF: 'open', handB: 'open' }),
    crouch: mk({ lean: 34, head: -14, sF: 50, eF: 70, sB: 30, eB: 80, hF: 76, kF: 118, aF: 30, hB: 36, kB: 112, aB: 40, handF: 'fist', handB: 'fist' }),
    land: mk({ lean: 30, head: -20, sF: -40, eF: 30, sB: 80, eB: 20, hF: 70, kF: 110, aF: 30, hB: 10, kB: 100, aB: 40, handF: 'fist', handB: 'open' }),
    raise: mk({ lean: -8, head: -24, sF: 164, eF: 10, sB: 158, eB: 16, hF: 4, kF: 2, hB: -6, kB: 4, handF: 'open', handB: 'open' }),
    cast: mk({ lean: 10, head: 2, sF: 88, eF: 6, sB: 78, eB: 12, hF: 20, kF: 16, hB: -22, kB: 8, handF: 'open', handB: 'open' }),
    castUp: mk({ lean: -6, head: -20, sF: 130, eF: 8, sB: 120, eB: 14, hF: 12, kF: 8, hB: -14, kB: 6, handF: 'open', handB: 'open' }),
    point: mk({ lean: 4, head: 0, sF: 90, eF: 0, sB: -6, eB: 14, hF: 6, kF: 4, hB: -6, kB: 4, handF: 'point', handB: 'relax' }),
    reach: mk({ lean: 22, head: -4, sF: 100, eF: 8, sB: 10, eB: 30, hF: 30, kF: 20, hB: -30, kB: 8, handF: 'open', handB: 'relax' }),
    throwWind: mk({ lean: -14, head: 6, sF: -60, eF: 60, sB: 80, eB: 20, hF: 20, kF: 16, hB: -24, kB: 8, handF: 'grip', handB: 'open' }),
    throw: mk({ lean: 24, head: 4, sF: 120, eF: 10, sB: -20, eB: 30, hF: 34, kF: 26, hB: -30, kB: 6, handF: 'open', handB: 'open' }),
    lift: mk({ lean: -4, head: -18, sF: 172, eF: 26, sB: 166, eB: 30, hF: 22, kF: 28, hB: -20, kB: 22, handF: 'open', handB: 'open' }),
    hold: mk({ lean: 2, head: 4, sF: 44, eF: 70, sB: 36, eB: 80, hF: 6, kF: 6, hB: -6, kB: 6, handF: 'open', handB: 'open' }),
    shout: mk({ lean: -8, head: -26, neck: -10, sF: -18, eF: 24, sB: -24, eB: 26, hF: 14, kF: 10, hB: -14, kB: 8, handF: 'fist', handB: 'fist', jaw: 1 }),
    roar: mk({ lean: 16, head: -30, neck: -10, sF: 30, eF: 70, sB: 20, eB: 80, hF: 30, kF: 34, hB: -26, kB: 16, handF: 'claw', handB: 'claw', jaw: 1 }),
    slashWind: mk({ lean: -14, head: 0, sF: 150, eF: 50, sB: 130, eB: 64, hF: 18, kF: 18, hB: -26, kB: 10, handF: 'grip', handB: 'grip' }),
    slash: mk({ lean: 26, head: 10, sF: 32, eF: 16, sB: 20, eB: 36, hF: 40, kF: 34, hB: -34, kB: 6, handF: 'grip', handB: 'grip' }),
    slashUp: mk({ lean: -18, head: -20, sF: 170, eF: 10, sB: 150, eB: 24, hF: 20, kF: 10, hB: -26, kB: 6, handF: 'grip', handB: 'grip' }),
    scytheRest: mk({ lean: 2, head: 4, sF: 30, eF: 70, sB: -10, eB: 20, hF: 6, kF: 4, hB: -8, kB: 6, handF: 'grip', handB: 'relax' }),
    scytheShoulder: mk({ lean: 0, head: 0, sF: 60, eF: 140, sB: -10, eB: 20, hF: 6, kF: 4, hB: -8, kB: 6, handF: 'grip', handB: 'relax' }),
    crutch: mk({ lean: 16, head: 22, neck: 10, sF: 44, eF: 40, sB: 0, eB: 10, hF: 12, kF: 22, hB: -12, kB: 20, handF: 'grip', handB: 'relax' }),
    stabDown: mk({ lean: 30, head: 20, sF: 60, eF: 10, sB: 50, eB: 20, hF: 60, kF: 90, hB: -20, kB: 60, handF: 'grip', handB: 'grip' }),
    lieBack: mk({ rot: -88, head: 10, sF: 20, eF: 10, sB: -10, eB: 20, hF: 6, kF: 20, hB: -4, kB: 10, handF: 'relax', handB: 'relax', ground: 'all' }),
    lieFront: mk({ rot: 90, head: -30, sF: 150, eF: 20, sB: 10, eB: 20, hF: 0, kF: 10, hB: -4, kB: 6, handF: 'open', handB: 'open', ground: 'all' }),
    sit: mk({ lean: 6, head: 6, sF: 20, eF: 60, sB: 10, eB: 60, hF: 88, kF: 86, hB: 84, kB: 90, handF: 'relax', handB: 'relax', ground: 'all' }),
    carry: mk({ lean: 4, head: 20, sF: 40, eF: 64, sB: 34, eB: 70, hF: 8, kF: 8, hB: -8, kB: 8, handF: 'open', handB: 'open' }),
    limp: mk({ lean: 20, head: 40, neck: 20, sF: -4, eF: 6, sB: -8, eB: 10, hF: 20, kF: 40, hB: 10, kB: 50, handF: 'relax', handB: 'relax', ground: 'none' }),
    dash: mk({ lean: 40, head: -30, sF: -50, eF: 20, sB: -40, eB: 30, hF: 40, kF: 60, hB: -40, kB: 30, handF: 'open', handB: 'open' }),
    daggerThrow: mk({ lean: 16, head: 4, sF: 110, eF: 6, sB: -30, eB: 40, hF: 24, kF: 20, hB: -24, kB: 8, handF: 'open', handB: 'open' }),
    glaive: mk({ lean: 18, head: 6, sF: 70, eF: 30, sB: 60, eB: 40, hF: 30, kF: 30, hB: -28, kB: 12, handF: 'grip', handB: 'grip' }),
    lantern: mk({ lean: 0, head: -8, sF: 70, eF: 50, sB: -6, eB: 16, hF: 4, kF: 4, hB: -4, kB: 4, handF: 'grip', handB: 'relax' }),
    salute: mk({ lean: -2, head: -4, sF: 150, eF: 150, sB: -4, eB: 10, hF: 4, kF: 2, hB: -4, kB: 2, handF: 'open', handB: 'relax' }),
    cross: mk({ lean: -2, head: 0, sF: 60, eF: 120, sB: 55, eB: 118, hF: 4, kF: 2, hB: -4, kB: 2, handF: 'relax', handB: 'relax' }),
    mourn: mk({ lean: 34, head: 40, neck: 16, sF: 20, eF: 30, sB: 10, eB: 30, hF: 86, kF: 90, hB: -2, kB: 104, aB: 50, handF: 'relax', handB: 'relax' }),
  });

  RIG.get = function (name) {
    if (!name) return POSES.idle;
    if (typeof name === 'object') return name;
    return POSES[name] || POSES.idle;
  };

  RIG.blend = function (a, b, u) {
    a = RIG.get(a);
    b = RIG.get(b);
    if (u <= 0) return a;
    if (u >= 1) return b;
    const p = {};
    for (const k of NUM_FIELDS) p[k] = lerp(a[k] || 0, b[k] || 0, u);
    p.handF = u < 0.5 ? a.handF : b.handF;
    p.handB = u < 0.5 ? a.handB : b.handB;
    p.ground = u < 0.5 ? a.ground : b.ground;
    return p;
  };

  /* Pose with overrides in degrees: RIG.mod(pose, {sF: 10}) adds; RIG.set replaces */
  RIG.mod = function (pose, add) {
    const p = Object.assign({}, RIG.get(pose));
    for (const k in add) {
      if (ANG_FIELDS[k]) p[k] = (p[k] || 0) + add[k] * D;
      else if (typeof add[k] === 'number' && NUM_FIELDS.includes(k)) p[k] = (p[k] || 0) + add[k];
      else p[k] = add[k];
    }
    return p;
  };

  /* Keyframed pose sequence: seq = [[t, 'pose' | poseObj, ease?], ...] */
  RIG.seq = function (t, seq) {
    const n = seq.length;
    if (t <= seq[0][0]) return RIG.get(seq[0][1]);
    if (t >= seq[n - 1][0]) return RIG.get(seq[n - 1][1]);
    let i = 0;
    while (i < n - 1 && seq[i + 1][0] <= t) i++;
    const a = seq[i], b = seq[i + 1];
    const u = UW.easeFn(b[2] || 'io')(sat((t - a[0]) / (b[0] - a[0] || 1)));
    return RIG.blend(a[1], b[1], u);
  };

  /* Procedural cycles */
  RIG.run = function (t, speed, style) {
    const ph = t * (speed || 2.2) * TAU;
    const s = Math.sin(ph), c = Math.cos(ph);
    const hero = style === 'hero';
    return mk({
      lean: hero ? 22 : 16,
      head: hero ? -12 : -6,
      sF: -s * 55 + 10, eF: 80 + c * 10,
      sB: s * 55 + 10, eB: 80 - c * 10,
      hF: s * 48 + 12, kF: 50 + Math.max(0, -c) * 70,
      hB: -s * 48 + 12, kB: 50 + Math.max(0, c) * 70,
      aF: 10, aB: 10,
      dy: -Math.abs(Math.sin(ph)) * 0.025,
      handF: 'fist', handB: 'fist',
    });
  };
  RIG.walk = function (t, speed, heavy) {
    const ph = t * (speed || 1) * TAU;
    const s = Math.sin(ph), c = Math.cos(ph);
    const k = heavy ? 0.7 : 1;
    return mk({
      lean: heavy ? 12 : 4,
      head: heavy ? 14 : 0,
      sF: -s * 20 * k + 4, eF: 16 + c * 6,
      sB: s * 20 * k - 4, eB: 16 - c * 6,
      hF: s * 24 * k + 2, kF: 8 + Math.max(0, -c) * 34 * k,
      hB: -s * 24 * k + 2, kB: 8 + Math.max(0, c) * 34 * k,
      handF: 'relax', handB: 'relax',
    });
  };
  RIG.limpWalk = function (t, speed) {
    const ph = t * (speed || 0.6) * TAU;
    const s = Math.sin(ph), c = Math.cos(ph);
    return mk({
      lean: 16 + Math.max(0, s) * 8, head: 18, neck: 8,
      sF: 42, eF: 42,
      sB: s * 8 - 4, eB: 14,
      hF: s * 16 + 8, kF: 16 + Math.max(0, -c) * 20,
      hB: -s * 12, kB: 18 + Math.max(0, c) * 18,
      handF: 'grip', handB: 'relax',
    });
  };

  /* ---------- skeleton solve ---------- */
  const dir = (a) => [Math.sin(a), Math.cos(a)]; // 0 = down, + toward facing
  const up = (a) => [Math.sin(a), -Math.cos(a)]; // 0 = up, + leans forward
  const add = (p, v, s) => [p[0] + v[0] * s, p[1] + v[1] * s];

  RIG.solve = function (spec, pose, px) {
    const b = spec.b;
    const Hh = px; // pixel height
    const J = { Hh };
    const pel = pose.pelvis || 0;
    const lean = pel + (pose.lean || 0);
    const tl = b.torso * Hh;
    const U = up(lean), F = [Math.cos(lean), Math.sin(lean)];
    const T = (fwd, upk) => [fwd * F[0] + upk * U[0], fwd * F[1] + upk * U[1]];
    J.lean = lean;
    J.T = T;
    J.U = U;
    J.F = F;
    J.pelvis = [0, 0];
    J.neck = T(b.neckOff * Hh, tl);
    J.shoulder = T(b.shX * Hh, tl * b.shY);
    J.shoulderB = T(b.shX * Hh - 0.012 * Hh, tl * b.shY + 0.004 * Hh);
    const na = lean + (pose.neck || 0);
    J.neckTop = add(J.neck, up(na), b.neckLen * Hh);
    const ha = na + (pose.head || 0);
    J.headAng = ha;
    J.head = add(J.neckTop, up(ha), b.head * Hh * 0.48);
    // arms
    const arm = (side) => {
      const sh = side === 'F' ? J.shoulder : J.shoulderB;
      const aU = -lean + (pose['s' + side] || 0);
      const aF = aU + (pose['e' + side] || 0);
      const aH = aF + (pose['w' + side] || 0);
      const el = add(sh, dir(aU), b.uarm * Hh);
      const wr = add(el, dir(aF), b.farm * Hh);
      const tip = add(wr, dir(aH), b.hand * Hh);
      J['sh' + side] = sh;
      J['el' + side] = el;
      J['wr' + side] = wr;
      J['tip' + side] = tip;
      J['aU' + side] = aU;
      J['aF' + side] = aF;
      J['aH' + side] = aH;
    };
    arm('F');
    arm('B');
    // legs
    const leg = (side) => {
      const hip = side === 'F' ? [0.004 * Hh, 0] : [-0.01 * Hh, -0.004 * Hh];
      const aT = -pel + (pose['h' + side] || 0);
      const aS = aT - (pose['k' + side] || 0);
      const aFt = aS + Math.PI / 2 + (pose['a' + side] || 0);
      const kn = add(hip, dir(aT), b.thigh * Hh);
      const an = add(kn, dir(aS), b.shin * Hh);
      const df = dir(aFt), dn = dir(aFt - Math.PI / 2);
      const sole = add(an, dn, b.ankleH * Hh);
      const heel = add(sole, df, -b.foot * Hh * 0.24);
      const toe = add(sole, df, b.foot * Hh * 0.76);
      J['hip' + side] = hip;
      J['kn' + side] = kn;
      J['an' + side] = an;
      J['heel' + side] = heel;
      J['toe' + side] = toe;
      J['aT' + side] = aT;
      J['aS' + side] = aS;
      J['aFt' + side] = aFt;
    };
    leg('F');
    leg('B');
    // whole-body rotation around pelvis
    const rot = pose.rot || 0;
    if (rot) {
      const c = Math.cos(rot), s = Math.sin(rot);
      for (const k in J) {
        const v = J[k];
        if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && k !== 'U' && k !== 'F') {
          J[k] = [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
        }
      }
      for (const k of ['aUF', 'aFF', 'aHF', 'aUB', 'aFB', 'aHB', 'aTF', 'aSF', 'aFtF', 'aTB', 'aSB', 'aFtB']) J[k] -= rot;
      J.lean += rot;
      J.headAng += rot;
      const U2 = up(J.lean);
      J.U = U2;
      J.F = [Math.cos(J.lean), Math.sin(J.lean)];
      const F2 = J.F;
      J.T = (fwd, upk) => [fwd * F2[0] + upk * U2[0], fwd * F2[1] + upk * U2[1]];
    }
    // grounding
    let oy;
    const g = pose.ground || 'feet';
    if (g === 'none') {
      oy = -(b.thigh + b.shin + b.ankleH) * Hh;
    } else {
      let maxY = -1e9;
      const pts = g === 'all'
        ? ['heelF', 'toeF', 'heelB', 'toeB', 'knF', 'knB', 'wrF', 'wrB', 'elF', 'elB', 'head', 'neck', 'pelvis', 'shoulder']
        : ['heelF', 'toeF', 'heelB', 'toeB', 'knF', 'knB'];
      for (const k of pts) {
        let y = J[k][1];
        if (k === 'knF' || k === 'knB') y += b.rShin[0] * Hh * 0.8;
        else if (k === 'head') y += b.head * Hh * 0.5;
        else if (g === 'all' && k !== 'heelF' && k !== 'toeF' && k !== 'heelB' && k !== 'toeB') y += b.rThigh[1] * Hh * 0.6;
        if (y > maxY) maxY = y;
      }
      oy = -maxY;
    }
    oy -= (pose.air || 0) * Hh;
    oy += (pose.dy || 0) * Hh;
    const ox = (pose.dx || 0) * Hh;
    for (const k in J) {
      const v = J[k];
      if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && k !== 'U' && k !== 'F') J[k] = [v[0] + ox, v[1] + oy];
    }
    J.off = [ox, oy];
    const T0 = J.T;
    J.TP = (fwd, upk) => {
      const v = T0(fwd, upk);
      return [v[0] + ox, v[1] + oy];
    };
    return J;
  };

  /* ---------- limb geometry ---------- */
  /* Outline points for a tapered, bulging capsule from a to b. */
  function capsule(a, b, r1, rm, r2, bf, bb) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 0.001;
    const ux = dx / L, uy = dy / L;
    const nx = -uy, ny = ux;
    const N = 8;
    const left = [], right = [];
    for (let i = 0; i <= N; i++) {
      const k = i / N;
      const base = k < 0.5 ? lerp(r1, rm, k * 2) : lerp(rm, r2, (k - 0.5) * 2);
      const sb = Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.15)), 1.3);
      const rl = base + (bf || 0) * sb;
      const rr = base + (bb || 0) * sb;
      const px = a[0] + ux * L * k, py = a[1] + uy * L * k;
      left.push([px + nx * rl, py + ny * rl]);
      right.push([px - nx * rr, py - ny * rr]);
    }
    return { left, right, a, b, r1, r2, ux, uy, nx, ny, L };
  }
  RIG.capsule = capsule;

  function capsulePath(ctx, c) {
    const { left, right, a, b, r1, r2 } = c;
    const ang = Math.atan2(c.uy, c.ux);
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < left.length; i++) ctx.lineTo(left[i][0], left[i][1]);
    ctx.arc(b[0], b[1], r2, ang + Math.PI / 2, ang - Math.PI / 2, true);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.arc(a[0], a[1], r1, ang - Math.PI / 2, ang + Math.PI / 2, true);
    ctx.closePath();
  }
  RIG.capsulePath = capsulePath;

  /* Draw a group of path builders as one cel-shaded silhouette.
     items: [{path: (ctx)=>void, c: fill color, shadeC?, noShade?}] */
  function celGroup(ctx, items, S) {
    const lw = S.lw;
    // outline pass
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = S.line;
    ctx.lineWidth = lw * 2;
    for (const it of items) {
      if (it.noLine) continue;
      ctx.beginPath();
      it.path(ctx);
      ctx.stroke();
    }
    // fill pass with cel shadow
    for (const it of items) {
      const base = it.c;
      ctx.beginPath();
      it.path(ctx);
      if (it.noShade || UW.LITE) {
        ctx.fillStyle = base;
        ctx.fill();
        continue;
      }
      ctx.save();
      ctx.clip();
      ctx.fillStyle = it.shadeC || shade(base, -S.shadeAmt);
      ctx.fillRect(-4000, -4000, 8000, 8000);
      ctx.translate(S.lx * (it.lk || 1), S.ly * (it.lk || 1));
      ctx.beginPath();
      it.path(ctx);
      ctx.fillStyle = base;
      ctx.fill();
      ctx.restore();
    }
  }
  RIG.celGroup = celGroup;

  /* Bands along a capsule (sleeves, gloves, boots, armor). */
  function drawBands(ctx, cap, bands, S, far) {
    if (!bands || !bands.length) return;
    const { a, ux, uy, nx, ny, L } = cap;
    for (const bd of bands) {
      const k0 = bd.a, k1 = bd.b;
      const pad = (bd.pad || 0) * S.Hh;
      const rmax = Math.max(cap.r1, cap.r2) * 1.6 + pad + 4;
      const p0 = [a[0] + ux * L * k0, a[1] + uy * L * k0];
      const p1 = [a[0] + ux * L * k1, a[1] + uy * L * k1];
      let col = bd.c;
      if (far) col = shade(col, -S.far);
      ctx.save();
      if (pad > 0) {
        // armor plate: its own capsule slightly larger
        const r1 = lerpR(cap, k0) + pad, r2 = lerpR(cap, k1) + pad;
        const pc = capsule(p0, p1, r1, (r1 + r2) / 2 + pad * 0.3, r2, 0, 0);
        const path = (c2) => capsulePath(c2, pc);
        celGroup(ctx, [{ path, c: col, lk: 0.6 }], S);
        if (bd.metal) {
          ctx.beginPath();
          path(ctx);
          ctx.clip();
          ctx.strokeStyle = rgba('#ffffff', 0.28);
          ctx.lineWidth = Math.max(1, S.lw * 0.7);
          ctx.beginPath();
          ctx.moveTo(lerp(p0[0], p1[0], 0.2) + nx * r1 * 0.5, lerp(p0[1], p1[1], 0.2) + ny * r1 * 0.5);
          ctx.lineTo(lerp(p0[0], p1[0], 0.75) + nx * r2 * 0.5, lerp(p0[1], p1[1], 0.75) + ny * r2 * 0.5);
          ctx.stroke();
        }
        if (bd.line) {
          ctx.strokeStyle = bd.line;
          ctx.lineWidth = Math.max(1, S.lw * 0.9);
          ctx.beginPath();
          ctx.moveTo(p0[0] - nx * r1 * 0.1 + ux * 2, p0[1] - ny * r1 * 0.1 + uy * 2);
          ctx.lineTo(p1[0] - nx * r2 * 0.1 - ux * 2, p1[1] - ny * r2 * 0.1 - uy * 2);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        capsulePath(ctx, cap);
        ctx.clip();
        const e0 = k0 <= 0 ? -rmax : 0, e1 = k1 >= 1 ? rmax : 0;
        const q0 = [p0[0] - ux * -e0, p0[1] - uy * -e0];
        const q1 = [p1[0] + ux * e1, p1[1] + uy * e1];
        ctx.beginPath();
        ctx.moveTo(q0[0] + nx * rmax, q0[1] + ny * rmax);
        ctx.lineTo(q1[0] + nx * rmax, q1[1] + ny * rmax);
        ctx.lineTo(q1[0] - nx * rmax, q1[1] - ny * rmax);
        ctx.lineTo(q0[0] - nx * rmax, q0[1] - ny * rmax);
        ctx.closePath();
        ctx.fillStyle = shade(col, -S.shadeAmt);
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.translate(S.lx, S.ly);
        ctx.beginPath();
        capsulePath(ctx, cap);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.restore();
        // seam lines
        ctx.strokeStyle = bd.seam || S.line;
        ctx.lineWidth = Math.max(1, S.lw * 0.8);
        ctx.beginPath();
        if (k0 > 0) {
          ctx.moveTo(p0[0] + nx * rmax, p0[1] + ny * rmax);
          ctx.lineTo(p0[0] - nx * rmax, p0[1] - ny * rmax);
        }
        if (k1 < 1) {
          ctx.moveTo(p1[0] + nx * rmax, p1[1] + ny * rmax);
          ctx.lineTo(p1[0] - nx * rmax, p1[1] - ny * rmax);
        }
        ctx.stroke();
        if (bd.glow) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = rgba(bd.glow, bd.glowA == null ? 0.9 : bd.glowA);
          ctx.lineWidth = Math.max(1, S.lw * 0.9);
          ctx.beginPath();
          ctx.moveTo(p0[0], p0[1]);
          ctx.lineTo(p1[0], p1[1]);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
  function lerpR(cap, k) {
    return lerp(cap.r1, cap.r2, k);
  }
  RIG.drawBands = drawBands;

  /* ---------- damage marks on a capsule ---------- */
  function drawDamage(ctx, cap, S, id, kind) {
    const dm = S.dmg;
    if (!dm) return;
    const { a, ux, uy, nx, ny, L } = cap;
    const r = Math.max(cap.r1, cap.r2);
    ctx.save();
    ctx.beginPath();
    capsulePath(ctx, cap);
    ctx.clip();
    const seed = S.seed * 7.1 + id * 13.3;
    // burns
    if (dm.burn > 0) {
      const n = Math.floor(dm.burn * 4 + 0.5);
      for (let i = 0; i < n; i++) {
        const k = hash(seed + i * 2.1);
        const o = (hash(seed + i * 3.3) - 0.5) * r * 1.2;
        const px = a[0] + ux * L * k + nx * o, py = a[1] + uy * L * k + ny * o;
        const rr = r * (0.5 + hash(seed + i) * 0.9) * (0.5 + dm.burn * 0.6);
        ctx.fillStyle = rgba('#1a0c07', 0.55 + dm.burn * 0.3);
        blob(ctx, px, py, rr, seed + i);
        ctx.fillStyle = rgba('#7a2a12', 0.5);
        blob(ctx, px + rr * 0.15, py - rr * 0.1, rr * 0.45, seed + i + 9);
      }
    }
    // wear (tears in cloth: show skin under)
    if (dm.wear > 0 && kind === 'cloth' && S.skin) {
      const n = Math.floor(dm.wear * 3 + 0.3);
      for (let i = 0; i < n; i++) {
        const k = 0.15 + hash(seed + i * 5.7) * 0.7;
        const o = (hash(seed + i * 4.9) - 0.5) * r;
        const px = a[0] + ux * L * k + nx * o, py = a[1] + uy * L * k + ny * o;
        const rr = r * (0.3 + hash(seed + i * 1.9) * 0.5) * (0.6 + dm.wear * 0.5);
        ctx.fillStyle = S.skin;
        tear(ctx, px, py, rr, seed + i);
        ctx.strokeStyle = S.line;
        ctx.lineWidth = Math.max(1, S.lw * 0.7);
        ctx.stroke();
      }
    }
    // blood
    if (dm.blood > 0) {
      const n = Math.floor(dm.blood * 5 + 0.5);
      ctx.fillStyle = rgba('#6d0a0a', 0.75 + dm.blood * 0.2);
      for (let i = 0; i < n; i++) {
        const k = hash(seed + i * 7.7);
        const o = (hash(seed + i * 6.1) - 0.5) * r * 1.4;
        const px = a[0] + ux * L * k + nx * o, py = a[1] + uy * L * k + ny * o;
        const rr = r * (0.18 + hash(seed + i * 8.3) * 0.35);
        blob(ctx, px, py, rr, seed + i * 3);
        // drip
        ctx.fillRect(px - rr * 0.18, py, rr * 0.36, rr * (1 + hash(seed + i) * 2.5));
      }
      // cuts
      ctx.strokeStyle = rgba('#7a0c0c', 0.85);
      ctx.lineWidth = Math.max(1, S.lw * 0.45);
      for (let i = 0; i < Math.ceil(n / 2); i++) {
        const k = hash(seed + i * 9.9);
        const px = a[0] + ux * L * k, py = a[1] + uy * L * k;
        const ang = hash(seed + i * 4.4) * TAU;
        const len = r * 0.45;
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(ang) * len, py - Math.sin(ang) * len);
        ctx.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len);
        ctx.stroke();
      }
    }
    if (dm.dirt > 0) {
      ctx.fillStyle = rgba('#3a3228', dm.dirt * 0.35);
      for (let i = 0; i < 3; i++) {
        const k = hash(seed + i * 11.1);
        const px = a[0] + ux * L * k, py = a[1] + uy * L * k;
        blob(ctx, px, py, r * 1.1, seed + i * 5);
      }
    }
    ctx.restore();
  }
  RIG.drawDamage = drawDamage;

  function blob(ctx, x, y, r, seed) {
    ctx.beginPath();
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const ang = (i / n) * TAU;
      const rr = r * (0.65 + hash(seed + i * 1.37) * 0.5);
      const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  RIG.blob = blob;
  function tear(ctx, x, y, r, seed) {
    ctx.beginPath();
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const ang = (i / n) * TAU;
      const rr = r * (0.62 + hash(seed + i * 1.7) * 0.45) * (i % 3 === 0 ? 0.8 : 1);
      const px = x + Math.cos(ang) * rr * 1.4, py = y + Math.sin(ang) * rr * 0.8;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  RIG.tear = tear;

  /* ---------- cloth ribbons ---------- */
  /* Returns chain points from anchor; baseAng in rig convention (0 = hanging down, + forward). */
  RIG.chain = function (anchor, baseAng, len, n, S, o) {
    o = o || {};
    const t = S.t;
    const vx = (S.vx || 0) * S.face + (S.wind || 0) * S.face, vy = S.vy || 0;
    const speed = Math.hypot(vx, vy);
    const stream = sat(speed / (o.streamV || 900));
    // direction the cloth streams: opposite to motion
    const streamAng = Math.atan2(-vx, -vy); // rig angle: atan2(x, y) with (sin, cos)
    let base = baseAng;
    if (stream > 0.01) {
      let dA = streamAng - base;
      while (dA > Math.PI) dA -= TAU;
      while (dA < -Math.PI) dA += TAU;
      base += dA * stream * (o.follow == null ? 0.95 : o.follow);
    }
    const pts = [anchor];
    let p = anchor;
    const amp = (o.amp == null ? 0.12 : o.amp) * (1 + stream * 1.5);
    const freq = (o.freq || 1.6) * (1 + stream * 2.5);
    for (let i = 1; i <= n; i++) {
      const k = i / n;
      const wave = Math.sin(t * freq * TAU - i * (o.wl || 0.8) + (o.phase || 0)) * amp * (0.2 + k);
      const nz = noise(t * 1.3 + i * 0.7 + (o.phase || 0) * 3) * (o.noise == null ? 0.08 : o.noise) * k;
      const a = base + (o.curl || 0) * k + wave + nz;
      const seg = len / n;
      p = [p[0] + Math.sin(a) * seg, p[1] + Math.cos(a) * seg];
      pts.push(p);
    }
    return pts;
  };

  /* Ribbon polygon along chain with width w0→w1 (perpendicular), optional ragged hem. */
  RIG.ribbonPath = function (ctx, pts, w0, w1, ragged, seed, offset) {
    const n = pts.length;
    const L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const q = pts[Math.min(n - 1, i + 1)], pp = pts[Math.max(0, i - 1)];
      let dx = q[0] - pp[0], dy = q[1] - pp[1];
      const l = Math.hypot(dx, dy) || 1;
      dx /= l;
      dy /= l;
      const k = i / (n - 1);
      const w = lerp(w0, w1, k) / 2;
      const off = (offset || 0) * w;
      L.push([p[0] - dy * (w + off), p[1] + dx * (w + off)]);
      Rr.push([p[0] + dy * (w - off), p[1] - dx * (w - off)]);
    }
    ctx.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
    // hem
    const lastL = L[n - 1], lastR = Rr[n - 1];
    if (ragged) {
      const m = 7;
      const pl = pts[n - 1], pq = pts[n - 2];
      const dx = pl[0] - pq[0], dy = pl[1] - pq[1];
      const dl = Math.hypot(dx, dy) || 1;
      for (let j = 1; j < m; j++) {
        const k = j / m;
        const x = lerp(lastL[0], lastR[0], k), y = lerp(lastL[1], lastR[1], k);
        const d = (j % 2 ? ragged : -ragged * 0.3) * (0.5 + hash((seed || 0) + j) * 0.8);
        ctx.lineTo(x + (dx / dl) * d, y + (dy / dl) * d);
      }
    }
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(Rr[i][0], Rr[i][1]);
    ctx.closePath();
  };

  /* Filled cel ribbon helper */
  RIG.ribbon = function (ctx, S, pts, w0, w1, c, o) {
    o = o || {};
    const path = (c2) => RIG.ribbonPath(c2, pts, w0, w1, o.ragged, o.seed, o.offset);
    if (o.alpha != null && o.alpha < 1) {
      ctx.save();
      ctx.globalAlpha *= o.alpha;
      ctx.beginPath();
      path(ctx);
      ctx.fillStyle = c;
      ctx.fill();
      if (o.edge) {
        ctx.strokeStyle = o.edge;
        ctx.lineWidth = S.lw * 0.8;
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    celGroup(ctx, [{ path, c, lk: 0.8, shadeC: o.shadeC }], S);
    if (o.fold) {
      ctx.save();
      ctx.beginPath();
      path(ctx);
      ctx.clip();
      ctx.strokeStyle = rgba('#000000', 0.25);
      ctx.lineWidth = S.lw;
      for (let f = 1; f <= o.fold; f++) {
        const off = (f / (o.fold + 1) - 0.5) * 2;
        ctx.beginPath();
        for (let i = 1; i < pts.length; i++) {
          const p = pts[i], q = pts[i - 1];
          let dx = p[0] - q[0], dy = p[1] - q[1];
          const l = Math.hypot(dx, dy) || 1;
          const w = lerp(w0, w1, i / (pts.length - 1)) / 2;
          const x = p[0] - (dy / l) * w * off * 0.8, y = p[1] + (dx / l) * w * off * 0.8;
          if (i === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  /* ---------- hands & feet ---------- */
  function handPath(ctx, wr, aH, r, len, type) {
    const d = dir(aH), n = [-d[1], d[0]];
    ctx.save();
    ctx.translate(wr[0], wr[1]);
    ctx.rotate(Math.atan2(d[1], d[0]));
    // local: +x along forearm direction, +y = n
    if (type === 'open' || type === 'claw') {
      const l = len;
      ctx.moveTo(0, -r * 0.9);
      ctx.quadraticCurveTo(l * 0.5, -r * 1.1, l * 0.62, -r * 0.8);
      ctx.lineTo(l * 1.05, -r * 0.55);
      ctx.quadraticCurveTo(l * 1.18, 0, l * 1.05, r * 0.45);
      ctx.lineTo(l * 0.6, r * 0.7);
      ctx.lineTo(l * 0.55, r * 1.25); // thumb
      ctx.quadraticCurveTo(l * 0.3, r * 1.35, l * 0.2, r * 0.9);
      ctx.quadraticCurveTo(0, r * 1.0, 0, r * 0.7);
      ctx.closePath();
    } else if (type === 'point') {
      const l = len;
      ctx.moveTo(0, -r * 0.9);
      ctx.lineTo(l * 0.55, -r);
      ctx.lineTo(l * 1.2, -r * 0.55);
      ctx.lineTo(l * 1.22, -r * 0.1);
      ctx.lineTo(l * 0.6, -r * 0.05);
      ctx.quadraticCurveTo(l * 0.75, r * 0.9, l * 0.35, r * 1.0);
      ctx.quadraticCurveTo(0, r, 0, r * 0.7);
      ctx.closePath();
    } else if (type === 'relax') {
      const l = len * 0.95;
      ctx.moveTo(0, -r * 0.85);
      ctx.quadraticCurveTo(l * 0.6, -r * 1.0, l * 0.95, -r * 0.3);
      ctx.quadraticCurveTo(l * 1.02, r * 0.5, l * 0.6, r * 0.85);
      ctx.quadraticCurveTo(l * 0.2, r * 1.05, 0, r * 0.75);
      ctx.closePath();
    } else {
      // fist / grip
      const l = len * 0.78;
      const rr = r * 1.15;
      ctx.moveTo(0, -rr * 0.8);
      ctx.quadraticCurveTo(l * 0.4, -rr * 1.15, l * 0.85, -rr * 0.9);
      ctx.quadraticCurveTo(l * 1.12, -rr * 0.2, l * 0.95, rr * 0.55);
      ctx.quadraticCurveTo(l * 0.6, rr * 1.12, l * 0.2, rr * 0.95);
      ctx.quadraticCurveTo(0, rr * 0.8, 0, rr * 0.5);
      ctx.closePath();
    }
    ctx.restore();
  }
  RIG.handPath = handPath;

  function footPath(ctx, J, side, b, Hh, boot) {
    const an = J['an' + side], heel = J['heel' + side], toe = J['toe' + side];
    const aFt = J['aFt' + side];
    const df = dir(aFt), dn = dir(aFt - Math.PI / 2);
    const r = b.rFoot * Hh * (boot ? 1.25 : 1);
    const top = add(an, dn, -r * 0.6);
    const instep = add(add(an, df, b.foot * Hh * 0.45), dn, b.ankleH * Hh * 0.2);
    ctx.moveTo(top[0] - df[0] * r, top[1] - df[1] * r);
    ctx.quadraticCurveTo(top[0] + df[0] * r * 1.5, top[1] + df[1] * r * 1.5, instep[0] - dn[0] * r * 0.3, instep[1] - dn[1] * r * 0.3);
    ctx.quadraticCurveTo(toe[0] - dn[0] * r * 0.9 + df[0] * r * 0.4, toe[1] - dn[1] * r * 0.9 + df[1] * r * 0.4, toe[0] + df[0] * r * 0.2, toe[1] + df[1] * r * 0.2);
    ctx.lineTo(heel[0] - df[0] * r * 0.3, heel[1] - df[1] * r * 0.3);
    ctx.quadraticCurveTo(heel[0] - df[0] * r * 1.2 - dn[0] * r, heel[1] - df[1] * r * 1.2 - dn[1] * r, top[0] - df[0] * r * 1.1, top[1] - df[1] * r * 1.1);
    ctx.closePath();
  }

  /* ---------- torso ---------- */
  function torsoPts(J, b, Hh) {
    const T = J.TP;
    const tl = b.torso * Hh;
    const c = b.chest * Hh, w = b.waist * Hh, h = b.hips * Hh;
    const pecs = b.pecs * Hh, traps = b.traps * Hh, glu = b.glutes * Hh, belly = b.belly * Hh;
    const nr = b.neckR * Hh;
    return [
      T(b.neckOff * Hh + nr * 0.9, tl * 0.99), // neck front base
      T(c * 0.46 + pecs * 0.3, tl * 0.9), // upper chest
      T(c * 0.52 + pecs, tl * 0.74), // pec
      T(c * 0.44 + pecs * 0.4, tl * 0.6), // under pec
      T(w * 0.5 + belly * 0.6, tl * 0.42), // abs
      T(w * 0.5 + belly, tl * 0.26), // belly
      T(h * 0.46, tl * 0.08), // lower abdomen
      T(h * 0.3, -tl * 0.06), // groin
      T(-h * 0.05, -tl * 0.12), // crotch
      T(-h * 0.5 - glu, -tl * 0.02), // glute
      T(-h * 0.52, tl * 0.1), // upper glute
      T(-w * 0.44, tl * 0.3), // lumbar (inward)
      T(-c * 0.47, tl * 0.58), // lats
      T(-c * 0.5 - traps * 0.3, tl * 0.82), // upper back
      T(b.neckOff * Hh - nr * 0.7 - traps, tl * 1.0 - traps * 0.2), // trapezius
      T(b.neckOff * Hh - nr * 0.6, tl * 1.02 + traps * 0.8), // neck back base
    ];
  }
  RIG.torsoPts = torsoPts;

  /* ---------- the main draw ---------- */
  /*
    st: {x, y, face, scale, pose, t, vx, vy, wind, dmg, expr, talk, eyeGlow, glow, glowC,
         hold:{F,B}, alpha, light (angle), rim, tint, tintA, hide:{...}}
  */
  RIG.draw = function (ctx, spec, st) {
    if (spec.vary) spec = Object.assign({}, spec, { b: Object.assign({}, spec.b, spec.vary(st.t || 0)) });
    const pose = RIG.get(st.pose);
    const sc = st.scale || 1;
    const Hh = spec.ft * UW.FT;
    const J = RIG.solve(spec, pose, Hh);
    const face = st.face || 1;
    const lw = Math.max(1.2, (spec.lineK || 0.0105) * Hh);
    const la = st.light == null ? -2.3 : st.light; // light direction (screen), default from upper-left
    const lk = 0.3 * lw * 3.2;
    const S = {
      J, spec, st, pose, Hh, lw, face, t: st.t || 0,
      vx: st.vx || 0, vy: st.vy || 0, wind: st.wind || 0,
      line: spec.line || '#100c10',
      shadeAmt: spec.shadeAmt == null ? 0.28 : spec.shadeAmt,
      far: spec.far == null ? 0.2 : spec.far,
      lx: Math.cos(la) * lk * face, ly: Math.sin(la) * lk,
      dmg: st.dmg || spec.dmg0 || null,
      seed: spec.seed || 1,
      skin: spec.skin,
      b: spec.b,
    };
    S.lx = Math.cos(la) * lk * face;
    ctx.save();
    ctx.translate(st.x || 0, st.y || 0);
    ctx.scale(face * sc, sc);
    if (st.alpha != null && st.alpha < 1) ctx.globalAlpha *= st.alpha;
    const H = spec.hooks || {};
    const hold = Object.assign({}, spec.hold || {}, st.hold || {});
    const missing = (st.dmg && st.dmg.armL) ? (face === 1 ? 'B' : 'F') : null;
    S.missing = missing;

    if (H.aura) H.aura(ctx, S);
    if (H.behind) H.behind(ctx, S);
    // back arm
    if (missing !== 'B') {
      if (hold.B && UW.GEAR) UW.GEAR.draw(ctx, S, 'B', hold.B, 'back');
      drawArm(ctx, S, 'B');
      if (hold.B && UW.GEAR) UW.GEAR.draw(ctx, S, 'B', hold.B, 'front');
    } else drawStump(ctx, S, 'B');
    drawLeg(ctx, S, 'B');
    if (H.midBack) H.midBack(ctx, S);
    drawTorso(ctx, S);
    drawLeg(ctx, S, 'F');
    if (H.mid) H.mid(ctx, S);
    drawHead(ctx, S);
    if (H.afterHead) H.afterHead(ctx, S);
    if (hold.F && UW.GEAR && missing !== 'F') UW.GEAR.draw(ctx, S, 'F', hold.F, 'back');
    if (missing !== 'F') drawArm(ctx, S, 'F');
    else drawStump(ctx, S, 'F');
    if (hold.F && UW.GEAR && missing !== 'F') UW.GEAR.draw(ctx, S, 'F', hold.F, 'front');
    if (H.front) H.front(ctx, S);
    if (st.glow > 0 && H.glow) H.glow(ctx, S);
    ctx.restore();
    return S;
  };

  function segCol(S, part, far) {
    const cs = S.spec.costume || {};
    const p = cs[part] || {};
    let c = p.c || S.spec.skin;
    if (far) c = shade(c, -S.far);
    return c;
  }

  function drawArm(ctx, S, side) {
    const { J, b, Hh } = S;
    const far = side === 'B';
    const sh = J['sh' + side], el = J['el' + side], wr = J['wr' + side];
    const cs = S.spec.costume || {};
    const k = far ? 0.96 : 1;
    const up = capsule(sh, el, b.rUarm[0] * Hh * k, b.rUarm[1] * Hh * k, b.rUarm[2] * Hh * k, b.bUarm[0] * Hh, b.bUarm[1] * Hh);
    const fo = capsule(el, wr, b.rFarm[0] * Hh * k, b.rFarm[1] * Hh * k, b.rFarm[2] * Hh * k, b.bFarm[0] * Hh, b.bFarm[1] * Hh);
    const handType = S.pose['hand' + side] || 'relax';
    const hr = b.rHand * Hh * k, hl = b.hand * Hh;
    const dr = b.rDelt * Hh * k;
    const deltC = capsule(add(sh, J.U, -dr * 0.15), add(sh, dir(J['aU' + side]), dr * 0.75), dr * 0.82, dr * 0.8, dr * 0.62, 0, 0);
    S['delt' + side] = deltC;
    const items = [
      { path: (c) => capsulePath(c, deltC), c: segCol(S, 'delt', far) || segCol(S, 'uarm', far) },
      { path: (c) => capsulePath(c, up), c: segCol(S, 'uarm', far) },
      { path: (c) => capsulePath(c, fo), c: segCol(S, 'farm', far) },
      { path: (c) => handPath(c, wr, J['aH' + side], hr, hl, handType), c: segCol(S, 'hand', far), lk: 0.5 },
    ];
    if (!cs.delt) items[0].c = segCol(S, 'uarm', far);
    celGroup(ctx, items, S);
    drawBands(ctx, up, cs.uarm && cs.uarm.bands, S, far);
    drawBands(ctx, fo, cs.farm && cs.farm.bands, S, far);
    if (cs.delt && cs.delt.bands) drawBands(ctx, deltC, cs.delt.bands, S, far);
    drawDamage(ctx, up, S, side === 'F' ? 1 : 2, cs.uarm && cs.uarm.cloth ? 'cloth' : 'skin');
    drawDamage(ctx, fo, S, side === 'F' ? 3 : 4, cs.farm && cs.farm.cloth ? 'cloth' : 'skin');
    if (cs.farm && cs.farm.detail) cs.farm.detail(ctx, S, side, fo);
    if (cs.hand && cs.hand.detail) cs.hand.detail(ctx, S, side);
    if (S.spec.hooks && S.spec.hooks.arm) S.spec.hooks.arm(ctx, S, side, up, fo);
  }

  function drawStump(ctx, S, side) {
    const { J, b, Hh } = S;
    const sh = J['sh' + side];
    const r = b.rDelt * Hh * 0.95;
    const c = capsule(add(sh, J.U, r * 0.2), add(sh, dir(-J.lean), r * 0.55), r, r * 0.95, r * 0.8, 0, 0);
    celGroup(ctx, [{ path: (cx) => capsulePath(cx, c), c: S.spec.skin }], S);
    // raw wound: seared, blackened, with the faint glow of unfinished erasure
    ctx.save();
    const end = add(sh, dir(-J.lean), r * 0.7);
    ctx.fillStyle = '#2a0f0a';
    blob(ctx, end[0], end[1], r * 0.75, 91);
    ctx.fillStyle = '#6e1410';
    blob(ctx, end[0], end[1] - r * 0.08, r * 0.45, 93);
    ctx.fillStyle = '#0a0a0a';
    for (let i = 0; i < 4; i++) {
      const a = hash(i * 7.1) * TAU;
      ctx.fillRect(end[0] + Math.cos(a) * r * 0.7, end[1] + Math.sin(a) * r * 0.5, r * 0.25, r * 0.12);
    }
    ctx.restore();
  }

  function drawLeg(ctx, S, side) {
    const { J, b, Hh } = S;
    const far = side === 'B';
    const cs = S.spec.costume || {};
    const k = far ? 0.97 : 1;
    const hip = J['hip' + side], kn = J['kn' + side], an = J['an' + side];
    const th = capsule(hip, kn, b.rThigh[0] * Hh * k, b.rThigh[1] * Hh * k, b.rThigh[2] * Hh * k, b.bThigh[0] * Hh, b.bThigh[1] * Hh);
    const sh = capsule(kn, an, b.rShin[0] * Hh * k, b.rShin[1] * Hh * k, b.rShin[2] * Hh * k, b.bShin[0] * Hh, b.bShin[1] * Hh);
    const boot = !!(cs.foot && cs.foot.boot);
    const items = [
      { path: (c) => capsulePath(c, th), c: segCol(S, 'thigh', far) },
      { path: (c) => capsulePath(c, sh), c: segCol(S, 'shin', far) },
      { path: (c) => footPath(c, J, side, b, Hh, boot), c: segCol(S, 'foot', far), lk: 0.4 },
    ];
    celGroup(ctx, items, S);
    drawBands(ctx, th, cs.thigh && cs.thigh.bands, S, far);
    drawBands(ctx, sh, cs.shin && cs.shin.bands, S, far);
    drawDamage(ctx, th, S, side === 'F' ? 5 : 6, cs.thigh && cs.thigh.cloth ? 'cloth' : 'skin');
    drawDamage(ctx, sh, S, side === 'F' ? 7 : 8, cs.shin && cs.shin.cloth ? 'cloth' : 'skin');
    if (S.spec.hooks && S.spec.hooks.leg) S.spec.hooks.leg(ctx, S, side, th, sh);
  }

  function drawTorso(ctx, S) {
    const { J, b, Hh } = S;
    const cs = S.spec.costume || {};
    const pts = torsoPts(J, b, Hh);
    S.torsoPts = pts;
    const neckC = capsule(add(J.neck, J.U, -b.neckR * Hh * 0.6), J.neckTop, b.neckR * Hh * 1.05, b.neckR * Hh, b.neckR * Hh * 0.92, 0, 0);
    S.neckCap = neckC;
    const tpath = (c) => UW.spline(c, pts, true, 0.9);
    S.torsoPath = tpath;
    celGroup(ctx, [
      { path: (c) => capsulePath(c, neckC), c: (cs.neck && cs.neck.c) || S.spec.skin },
      { path: tpath, c: (cs.torso && cs.torso.c) || S.spec.skin },
    ], S);
    if (cs.neck && cs.neck.detail) cs.neck.detail(ctx, S, neckC);
    ctx.save();
    ctx.beginPath();
    tpath(ctx);
    ctx.clip();
    if (cs.torso && cs.torso.detail) cs.torso.detail(ctx, S);
    torsoDamage(ctx, S, cs.torso && cs.torso.cloth);
    ctx.restore();
    if (cs.torso && cs.torso.over) cs.torso.over(ctx, S);
  }

  function torsoDamage(ctx, S, cloth) {
    const dm = S.dmg;
    if (!dm) return;
    const { J, b, Hh } = S;
    const T = J.TP;
    const tl = b.torso * Hh, c = b.chest * Hh;
    const seed = S.seed * 3.3;
    if (dm.wear > 0 && cloth) {
      const n = Math.floor(dm.wear * 5 + 0.4);
      for (let i = 0; i < n; i++) {
        const p = T((hash(seed + i) - 0.4) * c * 0.9, tl * (0.15 + hash(seed + i * 2.7) * 0.75));
        const rr = c * (0.12 + hash(seed + i * 3.1) * 0.16) * (0.6 + dm.wear * 0.6);
        ctx.fillStyle = S.skin;
        tear(ctx, p[0], p[1], rr, seed + i);
        ctx.strokeStyle = S.line;
        ctx.lineWidth = Math.max(1, S.lw * 0.7);
        ctx.stroke();
      }
    }
    if (dm.burn > 0) {
      const n = Math.floor(dm.burn * 6 + 0.5);
      for (let i = 0; i < n; i++) {
        const p = T((hash(seed * 2 + i) - 0.5) * c, tl * hash(seed * 3 + i * 1.7));
        const rr = c * (0.1 + hash(seed + i * 5.9) * 0.18);
        ctx.fillStyle = rgba('#140906', 0.6 + dm.burn * 0.3);
        blob(ctx, p[0], p[1], rr, seed + i * 3);
        ctx.fillStyle = rgba('#6a2210', 0.45);
        blob(ctx, p[0], p[1], rr * 0.45, seed + i * 5);
      }
    }
    if (dm.blood > 0) {
      const n = Math.floor(dm.blood * 7 + 0.5);
      ctx.fillStyle = rgba('#6a0808', 0.8);
      for (let i = 0; i < n; i++) {
        const p = T((hash(seed * 5 + i) - 0.3) * c * 0.9, tl * (0.2 + hash(seed * 7 + i) * 0.75));
        const rr = c * (0.04 + hash(seed + i * 9.1) * 0.07);
        blob(ctx, p[0], p[1], rr, seed + i * 7);
        ctx.fillRect(p[0] - rr * 0.2, p[1], rr * 0.4, rr * (2 + hash(seed + i) * 5));
      }
      ctx.strokeStyle = rgba('#7a0c0c', 0.85);
      ctx.lineWidth = Math.max(1, S.lw * 0.45);
      for (let i = 0; i < Math.ceil(n / 2); i++) {
        const p = T((hash(seed * 9 + i) - 0.4) * c, tl * (0.2 + hash(seed * 4 + i) * 0.7));
        const a = hash(seed + i * 2) * TAU, l = c * 0.07;
        ctx.beginPath();
        ctx.moveTo(p[0] - Math.cos(a) * l, p[1] - Math.sin(a) * l);
        ctx.lineTo(p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l);
        ctx.stroke();
      }
    }
  }

  /* ---------- head ---------- */
  const HEAD_BASE = [
    [0.02, -0.52], [-0.3, -0.46], [-0.47, -0.2], [-0.45, 0.08], [-0.3, 0.3], [-0.08, 0.4],
    [0.17, 0.47], [0.31, 0.5], [0.37, 0.44], [0.385, 0.36], [0.37, 0.325], [0.4, 0.29],
    [0.405, 0.22], [0.48, 0.165], [0.43, 0.02], [0.44, -0.07], [0.4, -0.27], [0.25, -0.46],
  ];
  RIG.headPts = function (f) {
    f = f || {};
    const jaw = f.jaw == null ? 1 : f.jaw; // squareness
    const nose = f.nose == null ? 1 : f.nose;
    const chin = f.chin == null ? 1 : f.chin;
    const brow = f.brow == null ? 1 : f.brow;
    const fem = f.fem || 0;
    const lips = f.lips == null ? 1 : f.lips;
    const long = f.long || 0;
    const pts = HEAD_BASE.map((p) => [p[0], p[1]]);
    // jaw corner and line
    pts[5][0] -= 0.04 * (jaw - 1); pts[5][1] += 0.05 * (jaw - 1) - fem * 0.03;
    pts[6][1] += 0.04 * (jaw - 1) - fem * 0.03;
    pts[7][0] += 0.02 * (chin - 1); pts[7][1] += 0.03 * (chin - 1) - fem * 0.02 + long * 0.05;
    pts[8][0] += 0.03 * (chin - 1) - fem * 0.02; pts[8][1] += long * 0.05;
    pts[6][1] += long * 0.04;
    // lips
    pts[9][0] += 0.01 * (lips - 1) + fem * 0.01;
    pts[11][0] += 0.015 * (lips - 1) + fem * 0.012;
    // nose
    pts[13][0] += 0.05 * (nose - 1) - fem * 0.03; pts[13][1] += 0.01 * (nose - 1);
    pts[12][0] += 0.02 * (nose - 1);
    // brow
    pts[15][0] += 0.03 * (brow - 1) - fem * 0.02;
    return pts;
  };

  function drawHead(ctx, S) {
    const { J, b, Hh, spec, st } = S;
    const f = spec.face || {};
    const hs = b.head * Hh; // head height px
    ctx.save();
    ctx.translate(J.head[0], J.head[1]);
    ctx.rotate(J.headAng);
    ctx.scale(hs, hs);
    S.headScale = hs;
    const L = S.lw / hs;
    const hp = st.hair ? Object.assign({}, spec.hair || {}, st.hair) : spec.hair || {};
    const H = spec.hooks || {};
    // veils/hoods behind, then hair behind head
    if (H.headBack) H.headBack(ctx, S, L);
    if (UW.HAIR && hp.style) UW.HAIR.back(ctx, S, hp, L);
    if (!f.noHead) {
      const pts = RIG.headPts(f);
      const path = (c) => UW.spline(c, pts, true, 0.75);
      const S2 = Object.assign({}, S, { lw: L, lx: S.lx / hs * 0.5, ly: S.ly / hs * 0.5 });
      celGroup(ctx, [{ path, c: f.skinC || spec.skin, lk: 0.9 }], S2);
      S.headPath = path;
      if (H.face) H.face(ctx, S, L);
      else drawFace(ctx, S, f, L);
      // head damage
      if (S.dmg) headDamage(ctx, S, path, L);
    }
    if (UW.HAIR && hp.style) UW.HAIR.front(ctx, S, hp, L);
    if (H.headFront) H.headFront(ctx, S, L);
    ctx.restore();
  }
  RIG.drawHead = drawHead;

  function headDamage(ctx, S, path, L) {
    const dm = S.dmg;
    ctx.save();
    ctx.beginPath();
    path(ctx);
    ctx.clip();
    if (dm.burn > 0.2) {
      ctx.fillStyle = rgba('#1a0a06', 0.45 * dm.burn);
      blob(ctx, -0.2, 0.1, 0.18 * dm.burn + 0.05, 17);
      blob(ctx, 0.1, -0.3, 0.12 * dm.burn, 19);
    }
    if (dm.blood > 0.1) {
      ctx.fillStyle = rgba('#6a0808', 0.8);
      blob(ctx, 0.3, -0.3, 0.05 + dm.blood * 0.04, 23);
      ctx.fillRect(0.29, -0.3, 0.025, 0.25 * dm.blood + 0.08);
      if (dm.blood > 0.5) {
        blob(ctx, 0.36, 0.34, 0.04, 29);
        ctx.fillRect(0.35, 0.34, 0.02, 0.16);
      }
    }
    if (dm.bruise > 0) {
      ctx.fillStyle = rgba('#3a1e3a', 0.35 * dm.bruise);
      blob(ctx, 0.28, 0.02, 0.1, 31);
    }
    ctx.restore();
  }

  function drawFace(ctx, S, f, L) {
    const st = S.st;
    const expr = st.expr || f.expr || 'neutral';
    const t = S.t;
    const line = S.line;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // cheek shadow
    ctx.fillStyle = rgba('#000000', 0.12);
    ctx.beginPath();
    ctx.moveTo(0.1, 0.12);
    ctx.quadraticCurveTo(0.25, 0.22, 0.32, 0.12);
    ctx.quadraticCurveTo(0.22, 0.3, 0.05, 0.3);
    ctx.closePath();
    ctx.fill();
    // stubble / beard
    if (f.stubble > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-0.06, 0.18);
      ctx.quadraticCurveTo(0.1, 0.24, 0.32, 0.36);
      ctx.lineTo(0.4, 0.42);
      ctx.lineTo(0.36, 0.52);
      ctx.lineTo(0.14, 0.5);
      ctx.lineTo(-0.1, 0.42);
      ctx.closePath();
      ctx.fillStyle = rgba(f.stubbleC || '#15100c', 0.22 * f.stubble);
      ctx.fill();
      ctx.restore();
    }
    if (f.beard) {
      ctx.fillStyle = f.beardC || '#d8c38a';
      ctx.strokeStyle = line;
      ctx.lineWidth = L;
      ctx.beginPath();
      ctx.moveTo(-0.08, 0.14);
      ctx.quadraticCurveTo(0.08, 0.26, 0.3, 0.3);
      ctx.lineTo(0.42, 0.31);
      ctx.quadraticCurveTo(0.46, 0.5, 0.38, 0.6 + f.beard * 0.2);
      ctx.quadraticCurveTo(0.2, 0.62 + f.beard * 0.2, 0.0, 0.48);
      ctx.quadraticCurveTo(-0.14, 0.36, -0.08, 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // ear
    if (!f.noEar) {
      ctx.fillStyle = shade(f.skinC || S.spec.skin, -0.08);
      ctx.strokeStyle = line;
      ctx.lineWidth = L * 0.6;
      ctx.beginPath();
      ctx.ellipse(-0.06, 0.06, 0.06, 0.1, 0.15, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-0.055, 0.06, 0.03, -1.2, 1.4);
      ctx.stroke();
    }
    // eye
    const eyeLost = S.dmg && S.dmg.eye && ((S.dmg.eye === 'R' && S.face === 1) || (S.dmg.eye === 'L' && S.face === -1));
    const blink = f.noBlink ? 0 : (UW.fract(t * 0.23 + S.seed * 0.37) < 0.025 ? 1 : 0);
    const ex = 0.27, ey = -0.005;
    const eyeW = f.eyeW || 0.1;
    let browTilt = 0;
    if (expr === 'angry' || expr === 'shout' || expr === 'rage') browTilt = 0.05;
    if (expr === 'sad' || expr === 'pain') browTilt = -0.04;
    if (eyeLost) {
      // swollen shut, scarred
      ctx.strokeStyle = rgba('#3a0d0a', 0.95);
      ctx.lineWidth = L * 1.4;
      ctx.beginPath();
      ctx.moveTo(ex - eyeW * 0.5, ey);
      ctx.quadraticCurveTo(ex, ey + 0.02, ex + eyeW * 0.45, ey - 0.005);
      ctx.stroke();
      ctx.fillStyle = rgba('#4a1612', 0.55);
      blob(ctx, ex, ey, 0.075, 41);
      ctx.strokeStyle = rgba('#8a1a14', 0.9);
      ctx.lineWidth = L * 1.1;
      ctx.beginPath();
      ctx.moveTo(ex - 0.03, ey - 0.14);
      ctx.lineTo(ex + 0.05, ey + 0.13);
      ctx.stroke();
    } else if (blink || expr === 'closed') {
      ctx.strokeStyle = line;
      ctx.lineWidth = L * 1.2;
      ctx.beginPath();
      ctx.moveTo(ex - eyeW * 0.5, ey + 0.005);
      ctx.quadraticCurveTo(ex, ey + 0.025, ex + eyeW * 0.45, ey);
      ctx.stroke();
    } else {
      ctx.fillStyle = f.scleraC || '#f2ede6';
      ctx.beginPath();
      ctx.moveTo(ex - eyeW * 0.5, ey);
      ctx.quadraticCurveTo(ex, ey - 0.045, ex + eyeW * 0.5, ey - 0.012);
      ctx.quadraticCurveTo(ex + 0.01, ey + 0.035, ex - eyeW * 0.5, ey);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = f.eyeC || '#3b2618';
      ctx.beginPath();
      ctx.arc(ex + eyeW * 0.28, ey - 0.008, 0.032, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.arc(ex + eyeW * 0.32, ey - 0.008, 0.013, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = line;
      ctx.lineWidth = L * (f.lashes ? 1.1 : 0.75);
      ctx.beginPath();
      ctx.moveTo(ex - eyeW * 0.52, ey + 0.002);
      ctx.quadraticCurveTo(ex, ey - 0.05, ex + eyeW * 0.54, ey - 0.014);
      ctx.stroke();
      if (f.lashes) {
        ctx.lineWidth = L * 0.8;
        ctx.beginPath();
        ctx.moveTo(ex + eyeW * 0.5, ey - 0.016);
        ctx.lineTo(ex + eyeW * 0.72, ey - 0.04);
        ctx.moveTo(ex + eyeW * 0.35, ey - 0.03);
        ctx.lineTo(ex + eyeW * 0.5, ey - 0.06);
        ctx.stroke();
      }
    }
    // eye glow
    const eg = st.eyeGlow || 0;
    if (eg > 0 && !eyeLost) {
      UW.FX.glow(ctx, ex + eyeW * 0.28, ey - 0.01, 0.14 + eg * 0.1, f.eyeGlowC || '#bfe3ff', eg, true);
    }
    // brow
    ctx.strokeStyle = f.browC || line;
    ctx.lineWidth = L * (f.browW || 2.2) * 0.6;
    ctx.beginPath();
    ctx.moveTo(ex - 0.08, ey - 0.07 - browTilt * 0.3);
    ctx.quadraticCurveTo(ex + 0.04, ey - 0.1 + browTilt * 0.2, ex + 0.14, ey - 0.075 + browTilt);
    ctx.stroke();
    // nostril
    ctx.strokeStyle = rgba('#000000', 0.45);
    ctx.lineWidth = L * 0.55;
    ctx.beginPath();
    ctx.arc(0.43, 0.2, 0.025, 0.2, 2.6);
    ctx.stroke();
    // mouth
    const talk = st.talk || 0;
    const jawOpen = Math.max(talk * (0.5 + 0.5 * Math.abs(Math.sin(t * 13))), S.pose.jaw || 0, expr === 'shout' || expr === 'rage' ? 0.9 : 0);
    if (jawOpen > 0.05) {
      ctx.fillStyle = f.mouthC || '#2a0c0c';
      ctx.beginPath();
      ctx.moveTo(0.4, 0.31);
      ctx.quadraticCurveTo(0.33, 0.33 + jawOpen * 0.1, 0.3, 0.32);
      ctx.quadraticCurveTo(0.34, 0.31, 0.4, 0.31);
      ctx.closePath();
      ctx.fill();
      if (f.deadlights && jawOpen > 0.3) {
        UW.FX.glow(ctx, 0.35, 0.33, 0.07 * jawOpen, '#f5e6c8', 0.9 * jawOpen, true);
      }
      if (f.fangs) {
        ctx.fillStyle = '#f4f4f0';
        ctx.beginPath();
        ctx.moveTo(0.37, 0.312);
        ctx.lineTo(0.365, 0.345);
        ctx.lineTo(0.355, 0.312);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = rgba('#2a1010', 0.85);
      ctx.lineWidth = L * 0.6;
      ctx.beginPath();
      const smirk = expr === 'smirk' ? -0.025 : 0;
      const frown = expr === 'sad' || expr === 'angry' || expr === 'pain' ? 0.015 : 0;
      ctx.moveTo(0.385, 0.318);
      ctx.quadraticCurveTo(0.34, 0.323, 0.3, 0.32 + smirk + frown);
      ctx.stroke();
      if (f.lipC) {
        ctx.fillStyle = f.lipC;
        ctx.beginPath();
        ctx.ellipse(0.39, 0.335, 0.018, 0.012, 0.3, 0, TAU);
        ctx.fill();
      }
    }
    if (f.scars) {
      ctx.strokeStyle = rgba(f.scarC || '#5a2a22', 0.8);
      ctx.lineWidth = L * 0.9;
      for (let i = 0; i < f.scars; i++) {
        const x = 0.05 + hash(i * 3.3 + 1) * 0.3, y = -0.3 + hash(i * 5.1 + 2) * 0.6;
        ctx.beginPath();
        ctx.moveTo(x - 0.05, y - 0.05);
        ctx.lineTo(x + 0.05, y + 0.06);
        ctx.stroke();
      }
    }
    if (f.extra) f.extra(ctx, S, L);
  }
  RIG.drawFace = drawFace;
})();
