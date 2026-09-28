/* The Unmaker War — Chapter VIII (The Dead Remember), IX (Holding the Door), X (Wounds Without Sequence). */
(function () {
  'use strict';
  const UW = window.UW;
  const { K, lerp, sat, hash, rgba, Ease, TAU } = UW;
  const R = UW.R, FX = UW.FX, BG = UW.BG, UNM = UW.UNM, BEINGS = UW.BEINGS, RIG = UW.RIG;
  const W = UW.W, H = UW.H;

  /* world position of a joint from an actor draw result */
  function jw(res, st, key) {
    if (!res || !res.J || !res.J[key]) return [st.x || 0, (st.y || 0) - 150];
    const sc = st.scale || 1, f = st.face || 1;
    return [(st.x || 0) + res.J[key][0] * f * sc, (st.y || 0) + res.J[key][1] * sc];
  }
  UW.jw = jw;

  /* Valorion's re-authored avatar: a body the erasure cannot read */
  const C = UW.C;
  C.valorion2 = Object.assign({}, C.valorion, {
    id: 'valorion2', skin: '#1a0e36', line: '#e8dcff', seed: 92,
    face: Object.assign({}, C.valorion.face, { scleraC: '#ffffff', eyeC: '#ffffff' }),
    hair: Object.assign({}, C.valorion.hair, { c: '#0c0620', c2: '#160a30', hl: '#8a6ad0', energy: '#ffffff' }),
    costume: {
      torso: { c: '#0c0818', detail(ctx, S) { UW.C.tline(ctx, S, [[-1, 0.3], [1, 0.28]], 'rgba(255,255,255,0.95)', S.lw, true); UW.C.tline(ctx, S, [[0.45, 0.98], [0.45, 0.5], [0.1, 0.3]], 'rgba(255,255,255,0.9)', S.lw, true); for (let i = 0; i < 18; i++) { const p = UW.C.TP(S, hash(i) * 1.6 - 0.8, hash(i * 3) * 1.1); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(p[0], p[1], 2, 2); } } },
      delt: { c: '#120c22' },
      uarm: { c: '#0c0818', bands: [{ a: 0, b: 1, c: '#120c22', glow: '#ffffff', glowA: 0.8 }] },
      farm: { c: '#0c0818', bands: [{ a: 0.2, b: 1, c: '#120c22', pad: 0.005, glow: '#ffffff', glowA: 0.9 }] },
      hand: { c: '#1a0e36' },
      thigh: { c: '#0c0818', bands: [{ a: 0, b: 1, c: '#120c22', glow: '#ffffff', glowA: 0.6 }] },
      shin: { c: '#0c0818', bands: [{ a: 0, b: 1, c: '#120c22', pad: 0.005, glow: '#ffffff', glowA: 0.8 }] },
      foot: { c: '#120c22', boot: true },
    },
  });

  /* ============================== CHAPTER VIII ============================== */
  UW.chapter({ id: 'ch8', num: 'Chapter VIII', title: 'The Dead Remember', sub: 'Jackson Storm, and a girl with a star-lantern', color: '#ffe6a8', music: 'dead', stageAll: 3, stage: { chase: 3, maeve: 3, malevolor: 3, seraphina: 3, jackson: 1, lena: 1 } });

  UW.shot({
    dur: 11,
    caps: [[0.8, 5.4, 'In the Shadow Verse, Jackson Storm put a body back together, the way he always had.'], [6, 10.6, 'Pale first. Then incomplete. Then real.']],
    sfx: [[0.6, 'rumble', { v: 0.5 }], [4, 'heartbeat', { v: 0.7 }], [7, 'heartbeat', { v: 0.9 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [11, 40]]), -200, K(t, [[0, 1.1], [11, 1.35]]));
      S.bg('shadowVerse');
      const form = S.P(0.5, 9, 'io');
      S.a('jackson', { x: 0, y: 0, face: 1, pose: [[0, 'kneelLow'], [6, 'kneel'], [9, 'stand']], alpha: lerp(0.25, 1, form), tint: '#e8e4f0', tintA: 1 - form, erase: (1 - form) * 0.7, eraseStatic: true, buffer: true });
      S.a('lena', { x: -330, y: 0, face: 1, pose: 'lantern', hold: { F: { type: 'lantern', side: 'F', power: 1.3 } } });
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.8, 5.6, 'Julius crossed the river an hour ago. He was still running.', 'LENA'], [7, 10.4, '...Of course he was.', 'JACKSON']],
    draw(t, S) {
      S.cam(K(t, [[0, -120], [11, -90]]), -190, K(t, [[0, 1.6], [11, 1.8]]));
      S.bg('shadowVerse');
      S.a('lena', { x: -260, y: 0, face: 1, pose: RIG.mod('lantern', { head: -18 }), hold: { F: { type: 'lantern', side: 'F', power: 1.2 } }, talk: [[0.8, 0], [1, 1], [5.4, 1], [5.6, 0]] });
      S.a('jackson', { x: 60, y: 0, face: -1, pose: [[0, 'stand'], [6, RIG.mod('stand', { head: 22 })], [9, RIG.mod('stand', { head: 30 })]], hold: { F: { type: 'machete', ang: 0 } } });
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.8, 4.8, 'The Vayrix ferrymen turned their boats around on the Celestial River.'], [5.2, 9.6, 'The dead stood up out of the water.']],
    sfx: [[0.6, 'choir', { v: 0.5, f: 110 }], [5, 'swell', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -300], [10, 200]]), -300, 0.7);
      S.bg('river');
      const ctx = S.w();
      for (let i = 0; i < 4; i++) BEINGS.ferryman(ctx, { x: -1200 + i * 700 + Math.sin(S.T * 0.4 + i) * 20, y: 40 + (i % 2) * 60, t: S.T + i, h: 300, boat: true, face: 1 });
      const rise = S.P(5, 9.5);
      for (let i = 0; i < 9; i++) {
        const x = -900 + i * 230;
        const k = sat(rise * 1.6 - i * 0.07);
        if (k <= 0) continue;
        S.a(['trooper', 'jake', 'blaze', 'axion', 'trooper', 'nyx', 'trooper', 'caelum', 'trooper'][i], { x, y: lerp(160, 60, k), face: 1, pose: 'stand', alpha: 0.45 * k, tint: '#cfe0ff', tintA: 0.8, buffer: true, dmg: 0 });
      }
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[0.8, 8.4, 'The Unmaker erased the living. The dead remembered them.']],
    sfx: [[1, 'chime', { v: 0.6 }], [2, 'chime', { v: 0.4 }], [3, 'chime', { v: 0.3 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [9, 0]]), -320, K(t, [[0, 0.9], [9, 0.62]]));
      S.bg('river');
      const ctx = S.w();
      S.a('lena', { x: -200, y: 40, face: 1, pose: [[0, 'lantern'], [1, RIG.mod('raise', { sB: -160, eB: 10 })]], hold: { F: { type: 'lantern', side: 'F', power: 1.6 } } });
      // a chain of lanterns lighting across the river
      for (let i = 0; i < 16; i++) {
        const k = S.P(1 + i * 0.3, 1.6 + i * 0.3);
        if (k <= 0) continue;
        const x = -60 + i * 180, y = -80 - Math.sin(i * 0.7) * 60;
        FX.glow(ctx, x, y, 90, '#ffe6a8', 0.5 * k);
        FX.glow(ctx, x, y, 16, '#ffffff', k, true);
      }
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.6, 5.2, 'They marched out of the dark with Jackson at the front.'], [5.6, 10.6, 'There was nothing left in the dead for it to take.']],
    sfx: [[0.6, 'rumble', { v: 0.7 }], [4.6, 'slash', { v: 0.8 }], [5.6, 'hit', { v: 0.8 }], [6.8, 'slash', { v: 0.7 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -500], [11, 100]]), -250, 0.66);
      S.bg('battlefield', { mood: 'gray' });
      const ctx = S.w();
      // the Unmade coming to meet them
      S.unmade(7, 300, 1500, { seed: 5, face: -1, vx: -70, extra: { attack: t > 4 } });
      // the dead
      for (let i = 0; i < 8; i++) {
        const x = -900 - i * 160 + t * 110;
        S.a(['trooper', 'trooper', 'jake', 'trooper', 'blaze', 'trooper', 'nyx', 'trooper'][i], { x, y: 0, face: 1, pose: RIG.walk(S.T + i * 0.3, 1), alpha: 0.5, tint: '#cfe0ff', tintA: 0.75, buffer: true, dmg: 0 });
      }
      S.a('jackson', { x: [[0, -700], [11, 520]], face: 1, pose: t < 4.4 ? RIG.walk(S.T, 0.8, true) : [[4.4, 'slashWind'], [4.8, 'slash'], [6.4, 'slashWind'], [6.8, 'slash'], [8, RIG.walk(S.T, 0.8, true)]], hold: { F: { type: 'machete', ang: 0, blood: t > 5 } } });
      S.a('lena', { x: [[0, -900], [11, 280]], y: 0, face: 1, pose: RIG.walk(S.T, 1.1), hold: { F: { type: 'lantern', side: 'F', power: 1.5 } } });
      S.post();
    },
  });

  /* ============================== CHAPTER IX ============================== */
  UW.chapter({ id: 'ch9', num: 'Chapter IX', title: 'Holding the Door', sub: 'Valorion, at the edge of an undefined wound', color: '#c9a2ff', music: 'door', stageAll: 3, stage: { chase: 3, maeve: 3, malevolor: 4, seraphina: 3, valorion: 1 } });

  UW.shot({
    dur: 10,
    caps: [[0.8, 5, 'Then it opened a wound with no definition at all.'], [5.4, 9.6, 'Several realities bled through the same hole.']],
    sfx: [[0.6, 'erase', { v: 1 }], [2, 'rumble', { v: 0.9 }], [5, 'glitch', { v: 0.6 }]],
    draw(t, S) {
      S.cam(0, -400, K(t, [[0, 0.5], [10, 0.42]]));
      S.shake(S.P(0.5, 4) * 6);
      BG.wound(S, { k: S.P(0.6, 6, 'io'), y: -420 });
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.6, 4.4, 'Valorion stood on the boundary and wrote back every law the breach tore away.'], [5, 10.4, 'Every law you take, I will write again.', 'VALORION']],
    sfx: [[0.6, 'choir', { v: 0.6, f: 196 }], [3, 'chime', { v: 0.6 }], [6, 'chime', { v: 0.5 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -100], [11, 0]]), -360, K(t, [[0, 0.62], [11, 0.7]]));
      BG.wound(S, { k: 1, y: -420, x: 200 });
      const ctx = S.w();
      // rune rings stitching the edges of the wound
      const pts = S.woundPts || [];
      for (let i = 0; i < pts.length; i += 5) {
        const p = pts[i];
        const k = UW.pulse(((t * 0.8 + i * 0.07) % 3), 0, 2, 0.3, 0.6);
        FX.runeRing(ctx, S.T, p[0] * 1.66 - 160 * 0.66, p[1] * 1.0, 40, 5, '#d8c2ff', 0.7 * k, i, 1);
      }
      S.a('valorion', { x: -300, y: 0, face: 1, pose: RIG.mod('castUp', { sF: 20 }), glow: 1, eyeGlow: 1, talk: [[5, 0], [5.2, 1], [10.2, 1], [10.4, 0]] });
      FX.beam(ctx, -260, -300, 180, -500, 14, '#c9a2ff', 0.5 + 0.2 * Math.sin(S.T * 5), S.T);
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.6, 4.8, 'The Unmaker touched the avatar’s arm.'], [5.2, 10.6, 'It erased the limb, and the local rule that allowed it to grow back.']],
    sfx: [[3.8, 'erase', { v: 1 }], [4.4, 'glitch', { v: 0.8 }], [7, 'shatter', { v: 0.5 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -100], [11, -60]]), -240, K(t, [[0, 1.0], [11, 1.2]]));
      BG.wound(S, { k: 1, y: -420, x: 400, p: 0.4 });
      const ctx = S.w();
      const gone = t > 4.2;
      const res = S.a('valorion', { x: -140, y: 0, face: 1, pose: gone ? [[4.2, 'hit'], [6, RIG.mod('stance', { lean: 4 })]] : RIG.mod('cast', { sF: 10 }), glow: 0.6, eyeGlow: 1, dmg: gone ? 2 : 1 });
      const reach = S.P(1.5, 3.9, 'io');
      UNM.draw(ctx, { x: 360, y: 0, t: S.T, eyes: 1, reachL: reach, armL: lerp(0.1, 1.4, reach) });
      if (t > 3.8 && t < 5.2) {
        const p = jw(res, { x: -140, y: 0, face: 1 }, 'elB');
        FX.staticBlocks(ctx, S.T, p[0], p[1], 180, 180, 30, 5, 1 - S.P(4.6, 5.2));
        FX.voidShards(ctx, S.T, p[0], p[1], 120, 16, 4, 1 - S.P(4.6, 5.2));
      }
      if (gone) {
        // the regrowth tries, and fails: an outline of an arm that keeps crumbling
        const sh = jw(res, { x: -140, y: 0, face: 1 }, 'shB');
        const k = (t * 0.7) % 1;
        ctx.save();
        ctx.setLineDash([6, 8]);
        ctx.strokeStyle = rgba('#d8c2ff', 0.8 * (1 - k));
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sh[0], sh[1]);
        ctx.lineTo(sh[0] + 60 * k, sh[1] + 90 * k);
        ctx.lineTo(sh[0] + 110 * k, sh[1] + 170 * k);
        ctx.stroke();
        ctx.restore();
        FX.glow(ctx, sh[0], sh[1], 60, '#c9a2ff', 0.8);
        FX.burst(ctx, (t - 4.2) % 1.2, 0, { n: 12, x: sh[0], y: sh[1], speed: [30, 120], g: 60, size: [2, 4], color: ['#c9a2ff', '#ffffff'], kind: 'glow', life: [0.6, 1.2], seed: Math.floor((t - 4.2) / 1.2) });
      }
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.6, 4.6, 'He withdrew the avatar.'], [5, 9.6, 'Behind the place it stood, something far larger opened its eyes, and wrote a different way back.']],
    sfx: [[0.6, 'teleport', { v: 0.6 }], [4.6, 'choir', { v: 0.8, f: 130 }], [5, 'swell', { v: 0.5 }]],
    draw(t, S) {
      S.cam(0, -380, K(t, [[0, 0.8], [10, 0.5]]));
      BG.space(S, { neb: ['#2a1a5a', '#5a1a3a', '#1a3a5a'], key: 'wound', seed: 9, nebA: 0.6 });
      const ctx = S.w();
      BEINGS.valorionTrue(ctx, { x: 0, y: -380, t: S.T, s: 900, alpha: S.P(3.5, 7), eyes: S.P(5, 6.5) });
      S.a('valorion', { x: 0, y: 0, face: 1, pose: 'stance', dmg: 2, glow: 1, erase: S.P(0.6, 3.4), buffer: true });
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.8, 4.4, 'It returned in a body the erasure could not read.'], [5, 9.6, 'Go, brother. I will keep the door.', 'VALORION']],
    sfx: [[0.6, 'chime', { v: 0.8 }], [1, 'boom', { v: 0.5 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [10, -80]]), -230, K(t, [[0, 1.0], [10, 1.15]]));
      BG.wound(S, { k: 1, y: -420, x: 500, p: 0.4 });
      const ctx = S.w();
      const form = S.P(0.4, 3, 'out3');
      FX.glow(ctx, 0, -150, 300 * form, '#ffffff', 0.6 * (1 - S.P(2, 4)));
      S.a('valorion2', { x: 0, y: 0, face: 1, pose: [[0, 'kneel'], [3, 'stand'], [5, RIG.mod('point', { head: -4 })]], alpha: form, glow: 0.8, eyeGlow: 1, buffer: true, talk: [[5, 0], [5.2, 1], [9.4, 1], [9.6, 0]] });
      S.a('chase', { x: -360, y: 0, face: 1, pose: 'idle' });
      S.post();
    },
  });

  UW.shot({
    dur: 8, fadeOut: 0.8,
    caps: [[1, 7.4, 'Chase walked into the wound, where nothing had a name.']],
    sfx: [[1, 'heartbeat', { v: 0.6 }], [4, 'heartbeat', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [8, 200]]), -300, K(t, [[0, 0.7], [8, 0.9]]));
      BG.wound(S, { k: 1, y: -420, x: 300, p: 0.5 });
      S.a('chase', { x: [[0, -500], [8, 300]], face: 1, pose: RIG.walk(S.T, 0.8, true), silhouette: 0.5, silC: '#000', buffer: true });
      S.post();
    },
  });

  /* ============================== CHAPTER X ============================== */
  UW.chapter({ id: 'ch10', num: 'Chapter X', title: 'Wounds Without Sequence', sub: 'What it cost to reach it', color: '#ff6b7d', music: 'rage', stageAll: 3, stage: { chase: 3, maeve: 3, malevolor: 4, seraphina: 3 } });

  function inside(S) {
    // inside the wound: grey, with drifting slabs of other realities
    const ctx = S.sc();
    ctx.fillStyle = '#16161a';
    ctx.fillRect(0, 0, W, H);
    const w = R.world(0.3);
    for (let i = 0; i < 8; i++) {
      const c = ['#3a5a8a', '#6a3a5a', '#3a6a4a', '#8a6a3a'][i % 4];
      w.fillStyle = rgba(c, 0.18);
      const x = -2000 + i * 560 + Math.sin(S.T * 0.2 + i) * 40, y = -700 + (i % 3) * 260;
      w.fillRect(x, y, 380, 120);
    }
    FX.staticBlocks(ctx, S.T, W / 2, H / 2, W, H, 30, 91, 0.35);
    BG.ground(S, { c1: '#2a2a2e', c2: '#0c0c0e', seed: 9 });
  }

  UW.shot({
    dur: 10,
    caps: [[0.6, 4.8, 'No one had survived its gaze. Not even the Primordial Guardians.'], [5.2, 9.6, 'Chase walked through it.']],
    sfx: [[1.4, 'erase', { v: 0.8 }], [3, 'glitch', { v: 0.6 }], [6, 'heartbeat', { v: 0.8 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -100], [10, 60]]), -240, K(t, [[0, 0.8], [10, 0.95]]));
      inside(S);
      const ctx = S.w();
      const g = S.pulse(1.2, 9.8, 0.8, 0.8);
      UNM.gaze(ctx, S.T, 520, -300, K(t, [[0, -520], [10, 150]]), -170, g, 380);
      S.a('chase', { x: [[0, -520], [10, 150]], face: 1, pose: RIG.walk(S.T, 0.7, true), erase: g * 0.18, eraseStatic: false, glow: 0.3 });
      UNM.draw(ctx, { x: 520, y: 0, t: S.T, eyes: 1 });
      R.desat(g * 0.35);
      S.post();
    },
  });

  UW.portraitShot({
    id: 'chase', dur: 8, s0: 480, s1: 540,
    dmg: null,
    expr: (t) => (t < 3 ? 'angry' : 'pain'),
    bg: ['#1a1a1e', '#060607', '#9a9a9a'],
    sfx: [[2.8, 'glitch', { v: 0.9 }], [3, 'heartbeat', { v: 1 }]],
    caps: [[3.6, 7.6, 'It cost him his left eye.']],
    under(t, S) {
      UW.PORT.backdrop(S.sc(), '#1a1a1e', '#060607', '#9a9a9a');
    },
    fx(t, S) {
      const ctx = S.sc();
      UW.PORT.backdrop(ctx, '#1a1a1e', '#060607', '#9a9a9a');
      UW.PORT.draw(ctx, 'chase', { x: W / 2, y: 470, s: lerp(480, 540, Ease.io(sat(t / 8))), t: S.T, expr: t < 3 ? 'angry' : 'pain', dmg: UW.dmg('chase', t < 3 ? 3 : 4), eyeGlow: t < 3 ? 0.6 : 0 });
      if (t > 2.8 && t < 3.3) R.glitch(0.9, S.T, 55);
      R.desat(0.25);
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.4, 4.6, 'Three stabilizing blows, to anchor its past, its present, and its future together.']],
    sfx: [[1.2, 'hit', { v: 1 }], [1.3, 'bell', { v: 0.4, f: 330 }], [2.6, 'hit', { v: 1 }], [2.7, 'bell', { v: 0.4, f: 392 }], [4, 'hit', { v: 1 }], [4.1, 'bell', { v: 0.4, f: 494 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 60], [11, 100]]), -230, K(t, [[0, 1.0], [11, 1.1]]));
      S.shake(S.pulse(1.2, 1.5, 0.01, 0.3) * 8 + S.pulse(2.6, 2.9, 0.01, 0.3) * 10 + S.pulse(4, 4.4, 0.01, 0.3) * 14);
      inside(S);
      const ctx = S.w();
      const cols = ['#6fb8ff', '#ffffff', '#ffd84a'];
      [1.2, 2.6, 4].forEach((tb, i) => {
        FX.shock(ctx, t, tb, 1.2, 330, -170, 360, cols[i], 12);
        if (t > tb) {
          // an anchored version of it, pinned in place
          const k = S.P(tb, tb + 0.6);
          UNM.draw(ctx, { x: 330 + (i - 1) * 220 * k, y: 0, t: S.T + i, eyes: 0.6, alpha: 0.35 * (1 - S.P(6, 10)), form: 'outline' });
        }
      });
      S.a('chase', { x: 40, y: 0, face: 1, pose: [[0, 'stance'], [1, 'punchWind'], [1.2, 'punch'], [2.2, 'stance'], [2.4, 'punchWind'], [2.6, RIG.mod('uppercut', { lean: 0 })], [3.6, 'stance'], [3.8, 'hammerWind'], [4, 'hammer'], [6, 'stance']], glow: 0.6, eyeGlow: 0.5, dmg: 4, hair: { front: 3 } });
      UNM.draw(ctx, { x: 330, y: 0, t: S.T, eyes: 1, lean: S.pulse(1.2, 4.6, 0.1, 0.4) * -0.1 });
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.4, 5.2, 'It removed the order the wounds happened in. The third wound came before the first blow.'], [5.6, 10.6, 'Chase was nearly trapped inside his own unfinished combination.']],
    sfx: [[0.6, 'erase', { v: 1 }], [1.2, 'glitch', { v: 0.9 }], [3, 'glitch', { v: 0.7 }], [5, 'glitch', { v: 0.7 }], [7, 'heartbeat', { v: 0.9 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 60], [11, 60]]), -230, K(t, [[0, 1.0], [11, 1.15]]));
      inside(S);
      const ctx = S.w();
      // the same combination replaying out of order, again and again
      const loop = ['hammer', 'uppercut', 'punch'];
      for (let g = 0; g < 3; g++) {
        const ph = ((S.T * 1.4 + g / 3) % 1);
        const p = loop[Math.floor(((S.T * 1.4 + g / 3) % 3))];
        S.a('chase', { x: 40 + (g - 1) * 70, y: 0, face: 1, pose: RIG.blend('stance', p, UW.pulse(ph, 0, 1, 0.2, 0.5)), alpha: 0.28, dmg: 4, buffer: true, tint: '#bcd9ff', tintA: 0.4 });
      }
      S.a('chase', { x: 40, y: 0, face: 1, pose: RIG.blend('punch', 'stance', 0.5 + 0.5 * Math.sin(S.T * 9)), dmg: 4, glow: 0.4, hair: { front: 3 } });
      UNM.draw(ctx, { x: 330, y: 0, t: S.T, eyes: 1 });
      R.doubleImage(0.5, Math.sin(S.T * 7) * 14, 0);
      if (((t * 2.3) % 1) < 0.08) R.glitch(0.7, S.T, 61);
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.6, 5.2, 'He tore himself out of the loop.'], [5.6, 10.6, 'His left arm stayed behind in it.']],
    sfx: [[3.4, 'erase', { v: 1 }], [4, 'roar', { v: 0.6 }], [4.1, 'glitch', { v: 1 }], [6.6, 'hit', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 120], [11, 60]]), -200, K(t, [[0, 1.2], [11, 1.45]]));
      S.shake(S.pulse(3.8, 5, 0.02, 0.6) * 16);
      inside(S);
      const ctx = S.w();
      const lost = t > 4.1;
      const st = { x: -60, y: 0, face: -1 };
      const res = S.a('chase', Object.assign({}, st, { pose: lost ? [[4.1, 'hitHard'], [5, 'kneelLow'], [11, RIG.mod('kneelLow', { head: 30 })]] : [[0, 'punch'], [3.4, RIG.mod('punch', { lean: -20 })]], dmg: lost ? 5 : 4, glow: 0.3, expr: 'pain', hair: { front: 3 } }));
      if (t > 3.3 && t < 5.5) {
        const p = jw(res, st, lost ? 'shoulder' : 'elF');
        FX.staticBlocks(ctx, S.T, p[0], p[1], 260, 220, 40, 13, 1 - S.P(4.8, 5.5));
        FX.voidShards(ctx, S.T, p[0], p[1], 150, 20, 2, 1 - S.P(4.8, 5.5));
        if (t > 4.1) FX.burst(ctx, t, 4.1, { n: 30, x: p[0], y: p[1], speed: [60, 280], g: 500, size: [2, 6], color: ['#8a0808', '#5a0404'], kind: 'blood', life: [0.6, 1.4], seed: 71 });
      }
      UNM.draw(ctx, { x: -420, y: 0, t: S.T, eyes: 1, flip: 1 });
      if (t > 4 && t < 4.4) R.flash('#ffffff', 0.5, 'lighter');
      S.post();
    },
  });

  UW.portraitShot({
    id: 'maeve', dur: 7, s0: 470, s1: 520, expr: (t) => (t < 1.2 ? 'neutral' : 'shock'),
    eyeGlow: (t) => UW.sat((t - 1) / 1),
    bg: ['#2a0a12', '#050204', '#ff2438'],
    talk: [[3.2, 4.6]],
    caps: [[3.2, 6.6, 'Chase.', 'MAEVE']],
    sfx: [[1, 'heartbeat', { v: 1 }], [1.1, 'crack', { v: 0.4 }]],
    fx(t, S) {
      if (t > 1 && t < 1.4) R.flash('#ff2438', 0.25);
    },
  });

  UW.shot({
    dur: 12,
    caps: [[2.6, 5.6, 'I have you. I have you.', 'MAEVE'], [6.4, 11.6, 'There is nothing there for me to heal. It is not injured. It is undefined.', 'SERAPHINA']],
    sfx: [[0.4, 'teleport', { v: 0.8 }], [3.6, 'whoosh', { v: 0.5 }], [5, 'chime', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -40], [12, 0]]), -170, K(t, [[0, 1.4], [12, 1.55]]));
      inside(S);
      const ctx = S.w();
      if (t > 0.3 && t < 1.2) {
        FX.burst(ctx, t, 0.4, { n: 40, x: -260, y: -140, speed: [100, 500], g: 0, drag: 3, size: [3, 7], color: ['#c0102a', '#ff3a4a'], kind: 'glow', life: [0.4, 0.9], seed: 13 });
        FX.glow(ctx, -260, -140, 240 * (1 - S.P(0.4, 1.2)), '#ff2a3a', 0.8);
      }
      S.a('chase', { x: -60, y: 0, face: -1, pose: RIG.mod('kneelLow', { head: 24 }), dmg: 5, expr: 'pain' });
      S.a('maeve', { x: -230, y: 0, face: 1, pose: [[0.4, 'land'], [1.4, RIG.mod('kneel', { sF: 60, eF: 60, head: 20 })]], alpha: S.P(0.4, 0.8), alphaBuffer: false, talk: [[2.6, 0], [2.8, 1], [5.4, 1], [5.6, 0]], eyeGlow: 0.6 });
      S.a('seraphina', { x: [[3.4, 400], [4.8, 150]], y: [[3.4, -400], [4.8, 0]], face: -1, pose: t < 4.8 ? 'hover' : [[4.8, 'land'], [5.4, RIG.mod('kneel', { sF: 80, eF: 10 })]], wings: [[3.4, 0.9], [5.2, 0.4]], glow: [[5, 0], [5.6, 1], [9, 1], [11, 0.3]], talk: [[6.4, 0], [6.6, 1], [11.4, 1], [11.6, 0]] });
      if (t > 5.6) FX.glow(ctx, 40, -170, 120, '#fff0b0', 0.5 * (1 - S.P(9, 11)));
      S.post();
    },
  });

  UW.shot({
    dur: 13,
    caps: [[1.6, 5.6, 'Get up. Nobody gets to finish you but me.', 'MALEVOLOR'], [8, 12.4, 'Then stay alive long enough to try.', 'CHASE']],
    sfx: [[1, 'boom', { v: 0.8 }], [1.05, 'crack', { v: 0.6 }], [7, 'rumble', { v: 0.5 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [13, 40]]), K(t, [[0, -170], [13, -210]]), K(t, [[0, 1.2], [13, 1.35]]));
      S.shake(S.pulse(1, 1.4, 0.01, 0.3) * 12);
      inside(S);
      const ctx = S.w();
      const planted = t > 1;
      if (t > 1) FX.shock(ctx, t, 1, 0.8, 40, 0, 200, '#e0101c', 8, 0.2);
      S.a('malevolor', { x: [[0, 520], [1, 240], [13, 260]], face: -1, pose: t < 1 ? 'stabDown' : [[1, 'stabDown'], [2, 'idle']], hold: planted ? { F: null } : { F: { type: 'scythe', abs: 160, g: 0.4 } }, talk: [[1.6, 0], [1.8, 1], [5.4, 1], [5.6, 0]], dmg: 4, eyeGlow: 0.6 });
      const rise = S.P(6.2, 9, 'io');
      // the scythe planted in the ground; Chase takes it with his remaining hand
      const takes = t > 6.2;
      if (!takes) {
        ctx.save();
        ctx.translate(40, -260);
        UW.GEAR.scythe(ctx, { Hh: 277, lw: 3, line: '#0c0808', t: S.T, J: {} }, { g: 0.72, charge: 0.4 });
        ctx.restore();
      }
      S.a('chase', { x: -40, y: 0, face: 1, pose: takes ? RIG.blend(RIG.mod('kneelLow', { sF: 70, eF: 30, head: 10 }), 'crutch', rise) : RIG.mod('kneelLow', { head: 20 }), hold: takes ? { F: { type: 'scythe', abs: 2, g: lerp(0.6, 0.5, rise), charge: 0.4 } } : { F: null }, dmg: 5, talk: [[8, 0], [8.2, 1], [12.2, 1], [12.4, 0]], expr: 'pain' });
      S.a('maeve', { x: -320, y: 0, face: 1, pose: RIG.mod('idle', { head: 8 }), eyeGlow: 0.4 });
      S.post();
    },
  });
})();
