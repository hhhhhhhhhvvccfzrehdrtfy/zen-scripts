/* The Unmaker War — Chapter VI (The Missing Battlefield), Chapter VII (The Last Lap). */
(function () {
  'use strict';
  const UW = window.UW;
  const { K, lerp, sat, hash, rgba, Ease, TAU } = UW;
  const R = UW.R, FX = UW.FX, BG = UW.BG, UNM = UW.UNM, BEINGS = UW.BEINGS, RIG = UW.RIG;
  const W = UW.W, H = UW.H;

  const ST2 = { chase: 2, maeve: 2, malevolor: 2, jack: 1, seraphina: 2 };

  /* ============================== CHAPTER VI ============================== */
  UW.chapter({ id: 'ch6', num: 'Chapter VI', title: 'The Missing Battlefield', sub: 'A dead universe, and the army that boxed it in', color: '#bcd9ff', music: 'war', stageAll: 2, stage: ST2 });

  function army(S, drift, t) {
    // the coalition line, with allies from erased futures and collapsed universes
    const line = [
      ['collapsedAlly', -1500, 0], ['futureAlly', -1180, 0], ['tyrusTitan', -900, 0], ['valor', -660, 0], ['jake', -520, 0], ['blaze', -400, 0],
      ['axion', 420, 0], ['nyx', 560, 0], ['kael', 700, 0], ['atterea', 830, 0], ['draven', 960, 0], ['futureAlly', 1180, 0], ['collapsedAlly', 1480, 0],
    ];
    line.forEach(([id, x], i) => {
      const d = drift || 0;
      const rot = d * (hash(i * 3.1) - 0.5) * 140;
      const dy = -d * (60 + hash(i * 1.7) * 220) + Math.sin(t * 1.3 + i) * 12 * d;
      const face = x < 0 ? 1 : -1;
      S.a(id, {
        x: x + d * (hash(i * 5.3) - 0.5) * 200, y: dy, face: d > 0.4 && hash(i) < 0.4 ? -face : face,
        pose: d > 0.2 ? RIG.mod('fall', { rot }) : id.indexOf('Ally') > 0 || id === 'tyrusTitan' ? 'guard' : 'stance',
        glow: id === 'valor' ? 0.3 : 0,
      });
    });
  }

  UW.shot({
    dur: 10,
    caps: [[0.5, 4.2, 'The Coalition boxed it inside a dead universe.'], [4.6, 9.6, 'Containment lattice at full strength. It is boxed in.', 'AXION']],
    sfx: [[0.4, 'swell', { v: 0.4 }], [4.6, 'zap', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [10, 0]]), -420, K(t, [[0, 0.46], [10, 0.52]]));
      S.bg('dead');
      const ctx = S.w();
      // temporal titans at the flanks
      S.a('titan', { x: -1900, y: 0, face: 1, scale: 2.8, pose: 'stand', alpha: 0.7, inside: BEINGS.titanInside });
      S.a('titan', { x: 1900, y: 0, face: -1, scale: 2.8, pose: 'stand', alpha: 0.7, inside: BEINGS.titanInside });
      // lattice cage
      const lat = S.P(1, 3);
      ctx.save();
      ctx.strokeStyle = rgba('#55e6ff', 0.5 * lat);
      ctx.lineWidth = 3;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 70, -560);
        ctx.lineTo(i * 70, 0);
        ctx.stroke();
      }
      for (let j = 0; j < 9; j++) {
        ctx.beginPath();
        ctx.moveTo(-210, -j * 70);
        ctx.lineTo(210, -j * 70);
        ctx.stroke();
      }
      ctx.restore();
      FX.glow(ctx, 0, -280, 380, '#55e6ff', 0.25 * lat);
      UNM.draw(ctx, { x: 0, y: 0, t: S.T, eyes: 1 });
      army(S, 0, S.T);
      S.a('axion', { x: 420, y: 0, face: -1, pose: 'point', talk: [[4.6, 0], [4.8, 1], [9.4, 1], [9.6, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.8, 5.2, 'It unmade the idea that the region was a place.'], [5.6, 9.6, 'The formation lost distance, direction, and frontage all at once.']],
    sfx: [[0.6, 'erase', { v: 1 }], [1.6, 'glitch', { v: 0.8 }], [4, 'rumble', { v: 0.6 }]],
    draw(t, S) {
      const k = S.P(0.6, 3.2, 'io');
      S.cam(K(t, [[0, 0], [10, 80]]), -420, 0.52, Math.sin(S.T * 0.4) * 0.12 * k);
      if (k < 1) S.bg('dead');
      const ctx = S.sc();
      if (k > 0) {
        ctx.save();
        ctx.globalAlpha = k;
        UW.BG.nowhere(S, { k: 0 });
        ctx.restore();
      }
      R.world(1);
      UNM.draw(S.w(), { x: 0, y: -80 * k, t: S.T, eyes: 1, form: k > 0.5 ? 'humanoid' : 'humanoid', flicker: 0.1 });
      army(S, k, S.T);
      if (t > 0.6 && t < 1.3) R.glitch(0.9, S.T, 41);
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.6, 4.4, 'So Chase built them a place to stand.'], [4.8, 7.6, 'On me! Find the floor!', 'CHASE'], [8, 10.8, 'He rebuilt the arena while defending everyone trapped inside it.']],
    sfx: [[1.4, 'boom', { v: 1 }], [1.5, 'chime', { v: 0.6 }], [4.8, 'hit', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [11, -120]]), -330, K(t, [[0, 0.62], [11, 0.66]]));
      S.shake(S.pulse(1.4, 2.2, 0.02, 0.6) * 14);
      const build = S.P(1.4, 5.5, 'out3');
      UW.BG.nowhere(S, { k: build * 0.85 });
      BG.lightFloor(S, build, -200, '#bcd9ff');
      const ctx = S.w();
      if (t > 1.4) FX.shock(ctx, t, 1.4, 1.4, -200, 0, 1400, '#bcd9ff', 18, 0.18);
      // the army dropping back onto a real floor
      const settle = S.P(2.5, 6.5, 'out');
      const cast = [['valor', -700], ['jake', -560], ['blaze', -430], ['axion', 250], ['nyx', 380], ['kael', 520], ['atterea', 650], ['draven', 780]];
      cast.forEach(([id, x], i) => {
        const d = 1 - settle;
        S.a(id, { x, y: -d * (80 + hash(i) * 200), face: x < -200 ? 1 : -1, pose: settle > 0.95 ? 'stance' : RIG.mod('fall', { rot: d * (hash(i * 3) - 0.5) * 100 }) });
      });
      S.a('chase', { x: -200, y: 0, face: 1, pose: [[0, 'hammerWind'], [1.4, 'land'], [3, 'land'], [4.2, 'stance'], [4.8, RIG.mod('point', { sF: 150 })], [7.6, 'stance']], glow: [[1, 1], [3, 0.4]], eyeGlow: [[1, 1], [3, 0.3]], talk: [[4.8, 0], [5, 1], [7.4, 1], [7.6, 0]], hair: { front: 3 } });
      UNM.draw(ctx, { x: 900, y: 0, t: S.T, eyes: 1 });
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.4, 3.8, 'Linking everyone. Nothing surprises us now.', 'AXION'], [4.8, 10.6, 'It erased the line between their viewpoints. Every soldier felt every body, every wound, every panic, all at once.']],
    sfx: [[0.6, 'zap', { v: 0.5 }], [4.4, 'erase', { v: 1 }], [5, 'glitch', { v: 1 }], [5.4, 'heartbeat', { v: 1 }]],
    draw(t, S) {
      S.cam(0, -300, 0.6);
      UW.BG.nowhere(S, { k: 0.85 });
      BG.lightFloor(S, 1, -200, '#bcd9ff');
      const ctx = S.w();
      const pos = [[-900, 0], [-760, 0], [-620, 0], [-480, 0], [320, 0], [460, 0], [600, 0], [740, 0], [880, 0]];
      const ids = ['valor', 'jake', 'blaze', 'futureAlly', 'axion', 'nyx', 'kael', 'atterea', 'draven'];
      const link = S.pulse(0.6, 5, 0.6, 0.3);
      for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
        if (hash(i * 9 + j) < 0.55) continue;
        FX.line(ctx, pos[i][0], -180, pos[j][0], -180 - Math.abs(i - j) * 20, 2, '#55e6ff', link * 0.5, true);
      }
      const merge = S.P(4.4, 6.5);
      ids.forEach((id, i) => {
        const collapse = S.P(4.6 + i * 0.1, 5.6 + i * 0.1);
        S.a(id, { x: pos[i][0], y: 0, face: pos[i][0] < 0 ? 1 : -1, pose: collapse > 0 ? [[4.6 + i * 0.1, 'hit'], [5.8 + i * 0.1, 'kneelLow']] : 'stance', expr: collapse > 0 ? 'pain' : undefined });
      });
      UNM.draw(ctx, { x: -120, y: 0, t: S.T, eyes: 1 });
      // everyone seeing through every eye: overlaid eye-panels
      if (merge > 0) {
        const sc = S.sc();
        for (let i = 0; i < 12; i++) {
          const x = (i % 4) * 480 + 240, y = Math.floor(i / 4) * 360 + 180;
          sc.save();
          sc.globalAlpha = merge * 0.25 * (0.5 + 0.5 * Math.sin(S.T * 6 + i));
          sc.strokeStyle = '#ffffff';
          sc.lineWidth = 3;
          sc.beginPath();
          sc.ellipse(x, y, 160, 60, 0, 0, TAU);
          sc.stroke();
          sc.fillStyle = '#ffffff';
          sc.beginPath();
          sc.arc(x + Math.sin(S.T * 3 + i) * 40, y, 34, 0, TAU);
          sc.fill();
          sc.restore();
        }
        R.doubleImage(merge * 0.8, Math.sin(S.T * 20) * 12, 0);
        R.desat(merge * 0.4);
      }
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.5, 4.8, 'The knight from a collapsed universe released the worlds in its armor.'], [5.2, 9.6, 'Each one unfolded into meaningless light before it arrived.']],
    sfx: [[1, 'zap', { v: 0.7 }], [1.6, 'zap', { v: 0.7 }], [2.2, 'zap', { v: 0.7 }], [4.4, 'chime', { v: 0.6 }], [6.4, 'bell', { v: 0.4, f: 180 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -300], [10, -100]]), -300, 0.62);
      UW.BG.nowhere(S, { k: 0.85 });
      BG.lightFloor(S, 1, -200, '#bcd9ff');
      const ctx = S.w();
      UNM.draw(ctx, { x: 700, y: 0, t: S.T, eyes: 1 });
      S.a('collapsedAlly', { x: -700, y: 0, face: 1, pose: [[0, 'guard'], [0.8, 'cast'], [4, 'cast'], [6, 'stance']] });
      S.a('futureAlly', { x: -300, y: 0, face: 1, pose: [[0, 'stance'], [5, 'point']], alpha: 0.95 });
      // afterimages of the extinct-future soldier
      for (let g = 1; g <= 2; g++) S.a('futureAlly', { x: -300 - g * 40, y: 0, face: 1, pose: [[0, 'stance'], [5, 'point']], alpha: 0.25 / g, t: S.T - g * 0.2 });
      for (let i = 0; i < 5; i++) {
        const t0 = 1 + i * 0.6;
        const u = S.P(t0, t0 + 1.4);
        if (u <= 0) continue;
        const x = lerp(-560, 600, u), y = -300 - Math.sin(u * Math.PI) * 120 + i * 20;
        if (u < 0.85) UW.C.universe(ctx, { t: S.T }, x, y, 26, i);
        else FX.burst(ctx, t, t0 + 1.2, { n: 30, x: 600, y: -300 + i * 20, speed: [40, 180], g: -20, drag: 1, size: [3, 7], color: ['#8a9aff', '#ffb0d8', '#ffffff'], kind: 'glow', life: [1, 2.5], seed: i * 11 });
      }
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.6, 3.6, 'Fall back! Everyone behind me!', 'CHASE'], [4.4, 9.6, 'The army retreated. Chase stayed where it could see him.']],
    sfx: [[0.6, 'rumble', { v: 0.6 }], [6, 'heartbeat', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [10, 100]]), -250, K(t, [[0, 0.8], [10, 1.0]]));
      UW.BG.nowhere(S, { k: 0.85 });
      BG.lightFloor(S, 1, -200, '#bcd9ff');
      const ctx = S.w();
      ['valor', 'jake', 'axion', 'nyx', 'atterea', 'draven'].forEach((id, i) => {
        S.a(id, { x: [[1, -300 - i * 80], [6, -1600 - i * 100]], face: -1, pose: RIG.run(S.T + i * 0.3, 2.2) });
      });
      S.a('chase', { x: 0, y: 0, face: 1, pose: [[0, RIG.mod('point', { sF: -80 })], [3, 'stance'], [10, 'guard']], talk: [[0.6, 0], [0.8, 1], [3.4, 1], [3.6, 0]], glow: 0.3 });
      UNM.draw(ctx, { x: 620, y: 0, t: S.T, eyes: 1, lean: -0.05 });
      S.post();
    },
  });

  /* ============================== CHAPTER VII ============================== */
  UW.chapter({ id: 'ch7', num: 'Chapter VII', title: 'The Last Lap', sub: 'Four Guardians, one human', color: '#ffd84a', music: 'war', stageAll: 2, stage: { chase: 2, maeve: 2, malevolor: 3, jack: 1 } });

  const GSC = 6; // guardian scale in orbit
  const GUARD4 = [[-1500, -800], [-500, -1050], [600, -1000], [1550, -700]];

  UW.shot({
    dur: 10,
    caps: [[0.6, 4.6, 'The Guardians decided a touched realm could not be saved.'], [5, 9.6, 'This realm is compromised. It will be unmade from the root.', 'GUARDIAN']],
    sfx: [[0.4, 'swell', { v: 0.4 }], [5, 'rumble', { v: 0.5 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [10, 60]]), -520, K(t, [[0, 0.3], [10, 0.33]]));
      BG.orbit(S, { y: 500, r: 5200, p: 0.45 });
      GUARD4.forEach(([x, y], i) => {
        S.a('guardian', { x, y: y + 200, face: x < 0 ? 1 : -1, scale: GSC * 0.62, pose: RIG.mod('stabDown', { rot: 0, lean: 10 }), glow: 0.5 + 0.3 * Math.sin(S.T * 2 + i), hold: { F: { type: 'creationSpear', abs: 150 + (x < 0 ? -10 : 10) }, B: { type: 'shield' } } });
      });
      const ctx = S.w();
      const aim = S.P(5, 9.5);
      GUARD4.forEach(([x, y], i) => FX.glow(ctx, x + (x < 0 ? 200 : -200), y + 620, 110, '#9ff4ff', 0.3 + aim * 0.6));
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[1.6, 8.6, 'Hey. Big guys. Nobody told you? This part of the show is mine.', 'GAMMA JACK']],
    sfx: [[0.3, 'speed', { v: 1 }], [0.9, 'hit', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [9, -120]]), -260, K(t, [[0, 1.0], [9, 1.2]]));
      BG.orbit(S, { y: 900, r: 5200, p: 0.3 });
      const ctx = S.w();
      const arr = S.P(0.2, 0.9, 'out5');
      if (t < 1.4) FX.trail(ctx, [[-1800, -300], [-900, -250], [lerp(-1800, -120, arr), -170]], 4, '#ffd84a', 1 - S.P(0.9, 1.4));
      S.a('jack', { x: lerp(-1800, -120, arr), y: 0, face: 1, vx: t < 0.9 ? 2000 : 0, pose: t < 0.9 ? 'flyFast' : [[0.9, 'land'], [1.6, 'proud']], glow: [[0, 1], [1.4, 0.5], [9, 0.3]], expr: 'smirk', talk: [[1.6, 0], [1.8, 1], [8.4, 1], [8.6, 0]], dmg: 1 });
      // a Guardian's enormous spear in the foreground
      S.a('guardian', { x: 900, y: 600, face: -1, scale: GSC * 0.9, pose: 'guard', glow: 0.5, hold: { F: { type: 'creationSpear', abs: -30 }, B: { type: 'shield' } } });
      S.post();
    },
  });

  /* Jack's path: zig-zags between Guardians */
  function jackPath(t) {
    const pts = [[-600, -300], [200, -700], [900, -200], [-200, -500], [-900, -900], [600, -1000], [1000, -600]];
    const u = (t / 1.4) % pts.length;
    const i = Math.floor(u), f = Ease.io(u - i);
    const a = pts[i], b = pts[(i + 1) % pts.length];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  }

  UW.shot({
    dur: 11,
    caps: [[0.4, 3.8, 'He shattered the runes on one spear with a hundred gamma taps.'], [4, 7.2, 'He blinded the second with its own reflected beam.'], [7.4, 10.8, 'He ran the third into the fourth one’s shield line.']],
    sfx: [[0.6, 'speed', { v: 0.8 }], [1.2, 'zap', { v: 0.6 }], [1.6, 'zap', { v: 0.6 }], [2.2, 'shatter', { v: 0.8 }], [4.4, 'zap', { v: 0.9 }], [5, 'crack', { v: 0.7 }], [8.4, 'boom', { v: 1 }], [8.6, 'shatter', { v: 0.7 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [11, 100]]), -560, 0.4);
      S.shake(S.pulse(8.3, 9, 0.02, 0.6) * 14);
      BG.orbit(S, { y: 1100, r: 5200, p: 0.3 });
      const ctx = S.w();
      GUARD4.forEach(([x, y], i) => {
        let gx = x, gy = y;
        if (i === 2 && t > 7.4) gx = lerp(x, -300 + 200, S.P(7.4, 8.4, 'in3'));
        const blind = i === 1 && t > 4.4;
        S.a('guardian', { x: gx, y: gy, face: x < 0 ? 1 : -1, scale: GSC * 0.55, pose: blind ? RIG.mod('hit', { head: -30 }) : i === 2 && t > 8.4 ? 'hitHard' : 'guard', glow: i === 0 && t > 2.2 ? 0 : 0.5, hold: { F: { type: 'creationSpear', abs: 40 * (x < 0 ? 1 : -1) }, B: { type: 'shield' } } });
      });
      // rune shatter sparks on the first spear
      if (t > 0.6 && t < 2.4) for (let k = 0; k < 6; k++) FX.burst(ctx, t, 0.6 + k * 0.25, { n: 10, x: -700 + k * 20, y: -1100 + k * 40, speed: [100, 400], g: 0, size: [2, 5], color: ['#ffd84a', '#9ff4ff'], kind: 'spark', life: [0.2, 0.5], seed: k });
      if (t > 4.3 && t < 5.3) {
        FX.beam(ctx, 300, -1200, 700, -700, 10, '#9ff4ff', 1 - S.P(4.8, 5.3), S.T);
        FX.beam(ctx, 700, -700, 300, -1150, 10, '#ffffff', 1 - S.P(4.8, 5.3), S.T);
        FX.glow(ctx, 300, -1180, 300, '#ffffff', 1 - S.P(4.4, 5.3), true);
      }
      if (t > 8.4) FX.impact(ctx, t, 8.4, 1, -250, -500, 500, '#9ff4ff', 3);
      // the golden blur
      const trail = [];
      for (let k = 0; k < 14; k++) trail.push(jackPath(S.T * 1 - k * 0.05));
      FX.trail(ctx, trail.reverse(), 4, '#ffd84a', 0.9, true);
      const jp = jackPath(S.T);
      S.a('jack', { x: jp[0], y: jp[1] + 120, face: 1, pose: 'flyFast', glow: 1, vx: 1500, dmg: 2, scale: 1.4 });
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[0.4, 3.8, 'Every exchange cost him. Their attacks covered space faster than his body could turn.'], [5, 8.6, "That's... fine. I've got plenty of angles.", 'GAMMA JACK']],
    sfx: [[1.2, 'slash', { v: 0.9 }], [1.3, 'hit', { v: 1 }], [5, 'heartbeat', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [9, -60]]), -220, K(t, [[0, 1.1], [9, 1.4]]));
      S.shake(S.pulse(1.2, 1.8, 0.02, 0.5) * 16);
      BG.orbit(S, { y: 900, r: 5200, p: 0.3 });
      const ctx = S.w();
      // a spear passes, grazing
      if (t > 0.8 && t < 1.8) {
        const u = S.P(0.8, 1.6);
        ctx.save();
        ctx.translate(lerp(1400, -1400, u), -240);
        ctx.rotate(-Math.PI / 2 + 0.1);
        UW.GEAR.creationSpear(ctx, { Hh: 1400, lw: 6, line: '#1a2430', t: S.T }, {});
        ctx.restore();
      }
      if (t > 1.25) FX.burst(ctx, t, 1.25, { n: 24, x: 0, y: -180, speed: [100, 400], dir: Math.PI * 1.2, spread: 1.2, g: 0, drag: 2, size: [2, 5], color: ['#8a0808', '#b01010'], kind: 'blood', life: [0.6, 1.4], seed: 3 });
      const spin = S.P(1.25, 2.6, 'out');
      S.a('jack', { x: lerp(0, -140, spin), y: -60 + Math.sin(spin * 3) * 20, face: 1, pose: t < 1.25 ? 'fly' : t < 2.6 ? RIG.mod('hitHard', { rot: spin * 360 }) : RIG.mod('hover', { lean: 18, head: 14 }), dmg: 3, glow: 0.4, expr: t > 4 ? 'smirk' : 'pain', talk: [[5, 0], [5.2, 1], [8.4, 1], [8.6, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 13,
    caps: [[0.5, 5.6, 'Ribs through one lung. One leg failing.'], [6, 12.6, 'He kept circling, so they would keep firing at him instead of the people below.']],
    sfx: [[0.3, 'speed', { v: 0.6 }], [2, 'zap', { v: 0.5 }], [3.4, 'zap', { v: 0.5 }], [5, 'zap', { v: 0.5 }], [7, 'zap', { v: 0.5 }], [9, 'zap', { v: 0.5 }], [6, 'heartbeat', { v: 0.8 }], [9, 'heartbeat', { v: 0.8 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [13, 0]]), K(t, [[0, -300], [13, -200]]), K(t, [[0, 0.36], [13, 0.3]]));
      BG.orbit(S, { y: 800, r: 5200, p: 0.35 });
      const ctx = S.w();
      const cx = 0, cy = -700, rx = 1300, ry = 480;
      const ang = S.T * 2.4;
      const jp = [cx + Math.cos(ang) * rx, cy + Math.sin(ang) * ry];
      // the golden ring of his last lap
      const ring = [];
      for (let k = 0; k < 40; k++) {
        const a = ang - k * 0.08;
        ring.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
      }
      FX.trail(ctx, ring.reverse(), 5, '#ffd84a', 0.9, true);
      GUARD4.forEach(([x, y], i) => {
        const gx = x * 0.72, gy = cy + (y + 900) * 0.6 + (i % 2) * 120;
        if (i === 0 && t > 0) {
          /* the marked one */
        }
        S.a('guardian', { x: gx, y: gy + 250, face: jp[0] < gx ? -1 : 1, scale: GSC * 0.4, pose: RIG.mod('cast', { sF: 40 }), glow: 0.6, hold: { F: { type: 'creationSpear', abs: 60 }, B: { type: 'shield' } } });
        // their fire chasing him, missing the realm below
        if (((S.T * 1.3 + i * 0.37) % 1) < 0.45) {
          const lag = 0.25;
          const a2 = ang - lag;
          FX.beam(ctx, gx, gy + 60, cx + Math.cos(a2) * rx, cy + Math.sin(a2) * ry, 8, '#9ff4ff', 0.8, S.T);
        }
      });
      S.a('jack', { x: jp[0], y: jp[1] + 100, face: -Math.sin(ang) > 0 ? 1 : -1, pose: RIG.mod('flyFast', { kB: 70 }), glow: 1, vx: 1500, dmg: 4, scale: 1.6 });
      S.post();
    },
  });

  UW.shot({
    dur: 12,
    caps: [[0.4, 3.6, 'Malevolor arrived late, for the one Guardian he had already marked.'], [4, 7.6, 'He let its spear pin his shoulder, and stepped into contact instead of away.'], [8, 11.6, 'Absolute Severance, across the neck seal.']],
    sfx: [[0.3, 'crack', { v: 0.8 }], [3.8, 'slash', { v: 0.6 }], [4.1, 'hit', { v: 1 }], [7.8, 'slash', { v: 1 }], [8, 'shatter', { v: 0.9 }], [8.2, 'boom', { v: 0.8 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [4, 60], [12, 100]]), -330, K(t, [[0, 0.62], [7.6, 0.82], [12, 0.76]]));
      S.shake(S.pulse(3.9, 4.6, 0.02, 0.5) * 10 + S.pulse(7.8, 8.8, 0.02, 0.6) * 18);
      BG.orbit(S, { y: 1100, r: 5200, p: 0.3 });
      const ctx = S.w();
      // red tear
      const tear = S.pulse(0.2, 3, 0.4, 1);
      if (tear > 0) {
        for (let i = 0; i < 3; i++) FX.lightning(ctx, -900, -800, -900 + (hash(i + Math.floor(S.T * 9)) - 0.5) * 80, -200, Math.floor(S.T * 12) + i, '#ff1a2a', 3, tear, 2);
        FX.glow(ctx, -900, -500, 400, '#b0101a', 0.5 * tear);
      }
      const dead = t > 7.9;
      S.a('guardian', {
        x: 450, y: 0, face: -1, scale: 2.4, glow: dead ? 0 : 0.6,
        pose: dead ? [[7.9, 'hitHard'], [9.5, RIG.mod('fall', { rot: -30 })]] : [[0, 'guard'], [3.4, RIG.mod('stabDown', { lean: -10 })], [4.1, 'stabDown']],
        hold: { F: { type: 'creationSpear', abs: lerp(20, 112, S.P(3.4, 4.1)) }, B: { type: 'shield', layer: 'back' } },
        erase: dead ? S.P(8.5, 12) * 0.35 : 0, eraseStatic: true,
      });
      S.a('malevolor', {
        x: [[0.4, -900], [3.2, -240], [4.1, -200], [7.2, -80]], y: [[0.4, -300], [3.2, 0]], face: 1,
        pose: t < 3.2 ? 'hover' : [[3.2, 'stance'], [4.1, RIG.mod('hit', { lean: 10 })], [6.6, 'slashWind'], [7.8, 'slash']],
        glow: 0.9, eyeGlow: 1,
        hold: { F: { type: 'scythe', abs: t < 6.6 ? 20 : lerp(-40, 140, S.P(6.8, 7.9, 'in3')), g: 0.4 } },
      });
      if (t > 4.1 && t < 8) FX.burst(ctx, t, 4.1, { n: 30, x: -170, y: -230, speed: [60, 260], g: 300, size: [2, 5], color: ['#8a0808', '#5a0404'], kind: 'blood', life: [0.8, 1.6], seed: 12 });
      if (t > 7.6) FX.slash(ctx, 200, -420, 300, -2.5, 0.2, 80, '#e0101c', S.P(7.6, 7.95), S.P(8.1, 9.2));
      if (dead) {
        FX.impact(ctx, t, 7.95, 1.2, 330, -560, 500, '#ff3040', 9);
        FX.burst(ctx, t, 7.95, { n: 40, x: 330, y: -560, speed: [100, 600], g: 60, size: [4, 12], color: ['#d6e1ea', '#8ff4ff', '#aebccb'], kind: 'shard', life: [1, 2.5], seed: 31 });
      }
      S.post();
    },
  });

  UW.shot({
    dur: 8,
    caps: [[1, 7.6, 'The other three withdrew. The realm below never knew how close it came.']],
    sfx: [[0.4, 'swell', { v: 0.3 }]],
    music: 'grief',
    draw(t, S) {
      S.cam(K(t, [[0, 0], [8, 60]]), -240, K(t, [[0, 0.7], [8, 0.9]]));
      BG.orbit(S, { y: 900, r: 5200, p: 0.3 });
      const ctx = S.w();
      // a floating slab of rock where he comes down
      ctx.save();
      ctx.fillStyle = '#2a2a30';
      ctx.strokeStyle = '#0c0c10';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-500, 0);
      ctx.lineTo(500, 0);
      ctx.lineTo(380, 120);
      ctx.lineTo(80, 200);
      ctx.lineTo(-300, 140);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      GUARD4.slice(1).forEach(([x, y], i) => S.a('guardian', { x: x * 1.6, y: y - 400 - t * 60, face: x < 0 ? 1 : -1, scale: 4, pose: 'idle', alpha: 1 - S.P(1, 6), glow: 0.2 }));
      S.a('jack', { x: [[0, -500], [1.8, -40]], y: [[0, -300], [1.8, 0]], face: 1, pose: t < 1.8 ? 'fall' : [[1.8, 'land'], [3, 'kneelLow'], [5, RIG.mod('sit', { lean: 20, head: 20 })]], dmg: 4, glow: [[0, 0.4], [2, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 14,
    caps: [[1.4, 3.4, "You're late.", 'GAMMA JACK'], [4, 5.8, 'You are still breathing.', 'MALEVOLOR'], [6.6, 10, 'Admit it. That was beautiful.', 'GAMMA JACK'], [11, 13.6, '...It was.', 'MALEVOLOR']],
    sfx: [[5, 'heartbeat', { v: 0.6 }], [9.6, 'heartbeat', { v: 0.4 }]],
    music: 'grief',
    draw(t, S) {
      S.cam(K(t, [[0, -60], [14, -30]]), -170, K(t, [[0, 1.5], [14, 1.75]]));
      BG.orbit(S, { y: 900, r: 5200, p: 0.2 });
      const ctx = S.w();
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(-900, 0, 1800, 300);
      S.a('jack', { x: -60, y: 0, face: 1, pose: RIG.mod('sit', { lean: 20, head: [0, 10][0] + (t > 10 ? 24 : 12) }), dmg: 4, expr: t > 6 ? 'smirk' : 'pain', talk: [[1.4, 0], [1.6, 1], [3.2, 1], [3.4, 0], [6.6, 0], [6.8, 1], [9.8, 1], [10, 0]] });
      S.a('malevolor', { x: 190, y: 0, face: -1, pose: [[0, 'idle'], [10.6, RIG.mod('tired', { head: 18 })]], hold: { F: { type: 'scythe', abs: 8, g: 0.45, charge: 0.3 } }, talk: [[4, 0], [4.2, 1], [5.6, 1], [5.8, 0], [11, 0], [11.2, 1], [13.4, 1], [13.6, 0]] });
      S.post();
    },
  });

  UW.portraitShot({
    id: 'jack', dur: 9, s0: 470, s1: 520, dmg: 4, music: 'grief',
    expr: (t) => (t < 3.5 ? 'smirk' : t < 6 ? 'neutral' : 'closed'),
    bg: ['#0a0c1a', '#020206', '#ffd84a'],
    caps: [[6.4, 8.8, 'He had never been as invincible as his speed looked.']],
    sfx: [[6, 'bell', { v: 0.5, f: 196 }]],
    fx(t, S) {
      const ctx = S.sc();
      // the last of the golden light leaving him
      const k = S.P(4, 8.5);
      FX.field(ctx, S.T, { n: 30, x0: 600, x1: 1320, y0: 200, y1: 900, vy: -30, size: 3, color: ['#ffd84a', '#fff3b0'], kind: 'glow', alpha: 0.6 * (1 - k), seed: 17 });
      R.desat(k * 0.5);
    },
  });

  UW.shot({
    dur: 13, fadeOut: 1.6, music: 'grief',
    caps: [[1, 6, 'Malevolor carried him home to the pocket dimension he never let anyone see.'], [6.6, 12.4, 'He buried Julius beneath the lawn.']],
    sfx: [[7, 'bell', { v: 0.4, f: 147 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [13, 80]]), -240, K(t, [[0, 0.9], [13, 1.0]]));
      S.bg('lawn');
      const ctx = S.w();
      const carry = t < 6.2;
      if (!carry) {
        // the fresh mound, a corner of yellow cape at the edge
        const g = S.P(6.2, 8);
        ctx.fillStyle = '#1a1208';
        ctx.beginPath();
        ctx.ellipse(120, 4, 180, 26 * g, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#c8a000';
        ctx.fillRect(250, -6, 26, 8);
      }
      S.a('malevolor', { x: carry ? K(t, [[0, -700], [5.8, 20]]) : -40, y: 0, face: 1, pose: carry ? RIG.mod('carry', { lean: 6 }) : [[6.2, RIG.mod('kneel', { head: 30 })], [9, 'tired'], [13, 'tired']], hold: carry ? { F: null } : { F: { type: 'scythe', abs: 6, g: 0.45, charge: 0.2 } }, dmg: 3 });
      if (carry) {
        const mx = K(t, [[0, -700], [5.8, 20]]);
        S.a('jack', { x: mx + 60, y: -150, face: -1, pose: RIG.mod('lieBack', { head: 40, sF: -30, sB: -20, kF: 30, rot: 0 }), dmg: 4 });
      }
      S.a('aphrodite', { x: 520, y: -60, face: -1, pose: 'idle', alpha: S.P(7, 9), scale: 0.8 });
      S.post();
    },
  });
})();
