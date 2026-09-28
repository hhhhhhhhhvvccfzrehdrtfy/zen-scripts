/* The Unmaker War — Prologue, Title, Chapter I (The Weapon That Forgot), Chapter II (The Council). */
(function () {
  'use strict';
  const UW = window.UW;
  const { K, lerp, sat, hash, rgba, Ease } = UW;
  const R = UW.R, FX = UW.FX, BG = UW.BG, UNM = UW.UNM, BEINGS = UW.BEINGS, RIG = UW.RIG;
  const W = UW.W, H = UW.H;

  /* ============================== PROLOGUE ============================== */
  UW.chapter({ id: 'prologue', num: 'Prologue', title: 'Between Definitions', sub: 'Before the first law', color: '#9a9aa8', music: 'void', stage: 0, card: false });

  UW.shot({
    dur: 9, fadeIn: 1.6,
    caps: [[1.2, 8.4, 'Before the first law was written, there was a place between definitions.']],
    sfx: [[0.2, 'swell', { v: 0.35 }], [5.2, 'glitch', { v: 0.35 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -60], [9, 60]]), -300, K(t, [[0, 1.0], [9, 1.12]]));
      S.bg('space', { neb: ['#1a0e2e', '#0a1430', '#2a0e24'], key: 'pro', seed: 2, nebA: 0.8 });
      const ctx = S.w();
      // a seam of missing information opening across the dark
      const k = S.P(4.5, 8.5, 'io');
      if (k > 0) {
        const len = 900 * k;
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(-len / 2, -304, len, 8 * k);
        ctx.restore();
        FX.staticBlocks(ctx, S.T, 0, -300, len, 60, 26, 3, k);
        FX.darkGlow(ctx, 0, -300, 300 * k, 0.6 * k);
      }
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[0.8, 8.4, 'Something woke there. It had no name. Names are made of edges.']],
    sfx: [[0.5, 'erase', { v: 0.4 }], [4.5, 'glitch', { v: 0.5 }]],
    draw(t, S) {
      S.cam(0, -180, K(t, [[0, 1.2], [9, 1.55]]));
      S.bg('space', { neb: ['#1a0e2e', '#0a1430', '#2a0e24'], key: 'pro', seed: 2, nebA: 0.65 });
      R.desat(S.P(0, 6) * 0.5);
      const ctx = S.w();
      const form = t < 3 ? 'outline' : 'humanoid';
      UNM.draw(ctx, { x: 0, y: 0, t: S.T, form, flicker: t < 5 ? 0.45 : 0.08, eyes: 0, float: 30, alpha: S.P(0, 1.5) });
      if (t > 4.5 && t < 5.1) R.glitch(0.6, S.T, 2);
      S.post();
    },
  });

  UW.portraitShot({
    id: 'unmaker', dur: 8, s0: 480, s1: 560,
    eyes: 0,
    caps: [[1.6, 7.6, 'Every edge it touched felt like a wound.']],
    sfx: [[2.4, 'heartbeat', { v: 0.6 }], [5, 'heartbeat', { v: 0.4 }]],
    under(t, S) {
      UW.PORT.backdrop(S.sc(), '#0c0c10', '#020203', null);
    },
    fx(t, S) {
      // eyes open slowly
      const ctx = S.sc();
      const e = S.P(2.2, 4.2, 'io');
      UW.PORT.unmaker(ctx, { x: W / 2, y: 470, s: lerp(480, 560, Ease.io(sat(t / 8))), t: S.T, eyes: e });
      if (t > 2.2 && t < 2.6) R.glitch(0.5, S.T, 5);
    },
  });

  UW.shot({
    dur: 9,
    caps: [[1.2, 8.4, 'So it began to take them apart. Not with rage. With the need for it to stop.']],
    sfx: [[2.4, 'erase', { v: 0.6 }], [5.2, 'erase', { v: 0.5 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 120], [9, 60]]), -320, 1.05);
      S.bg('space', { neb: ['#1a0e2e', '#0a1430', '#2a0e24'], key: 'pro', seed: 2, nebA: 0.75 });
      const ctx = S.w();
      // a small cluster of young stars — being forgotten one by one
      for (let i = 0; i < 14; i++) {
        const sx = 300 + (hash(i * 3.1) - 0.5) * 700, sy = -520 + (hash(i * 5.7) - 0.5) * 400;
        const tk = 2 + hash(i * 1.9) * 5.5;
        const gone = S.P(tk, tk + 0.6);
        if (gone < 1) {
          FX.glow(ctx, sx, sy, 60 * (1 - gone), '#ffe3b0', 0.8 * (1 - gone), true);
          if (gone > 0) {
            ctx.fillStyle = rgba('#8a8a8a', 1 - gone);
            ctx.fillRect(sx - 10, sy - 10, 20, 20);
          }
        }
      }
      UNM.draw(ctx, { x: -420, y: 0, t: S.T, eyes: 1, armR: K(t, [[0, 0.1], [1.5, 1.9]]), float: 20, shards: 30 });
      R.desat(S.P(2, 9) * 0.35);
      S.post();
    },
  });

  /* The title */
  UW.shot({
    dur: 7.5, fadeIn: 0.4, fadeOut: 1.2, music: 'void', poster: true,
    sfx: [[0.3, 'boom', { v: 0.9 }], [0.3, 'choir', { v: 0.6 }], [5.6, 'erase', { v: 0.5 }]],
    draw(t, S) {
      const ctx = S.sc();
      ctx.fillStyle = '#030304';
      ctx.fillRect(0, 0, W, H);
      FX.glow(ctx, W / 2, H / 2, 900, '#3a2a6a', 0.35 * S.P(0, 2));
      FX.field(ctx, S.T, { n: 120, x0: 0, x1: W, y0: 0, y1: H, vx: -10, vy: -4, size: 2, color: '#ffffff', alpha: 0.35, twinkle: true, seed: 9 });
      const a = S.P(0.2, 1.6);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.font = '600 30px ' + UW.FONTS.body;
      ctx.letterSpacing = '18px';
      ctx.fillStyle = '#b9b3a8';
      ctx.fillText('THE BOUNDLESS NEXUS', W / 2 + 9, 390);
      ctx.letterSpacing = '6px';
      ctx.font = '600 150px ' + UW.FONTS.display;
      ctx.fillStyle = '#f3efe6';
      ctx.fillText('THE UNMAKER WAR', W / 2 + 3, 560);
      ctx.letterSpacing = '0px';
      ctx.restore();
      // the title is being unmade from the right edge
      const bite = S.P(4.2, 7.2, 'in');
      if (bite > 0) {
        ctx.save();
        ctx.fillStyle = '#030304';
        const f = Math.floor(S.T * 14);
        for (let i = 0; i < 40; i++) {
          if (hash(i * 3.1 + f * 0.2) > bite * 1.3) continue;
          const y = 440 + hash(i * 1.7) * 160;
          const x = W / 2 + 700 - bite * 1500 * hash(i * 7.7);
          ctx.fillRect(x, y, 30 + hash(i) * 400 * bite, 3 + hash(i * 2) * 14);
        }
        ctx.restore();
        R.glitch(bite * 0.7, S.T, 4);
      }
      FX.staticBlocks(ctx, S.T, W / 2, 520, 1400, 200, 20, 1, 0.4 * (1 - a) + bite * 0.8);
    },
  });

  /* ============================== CHAPTER I ============================== */
  UW.chapter({ id: 'ch1', num: 'Chapter I', title: 'The Weapon That Forgot', sub: 'The Primordial Aegis Realms', color: '#7fe8ff', music: 'realm', stage: 0 });

  const GS = 5; // guardian scale in the Aegis
  UW.shot({
    dur: 9, fadeIn: 0.6,
    caps: [[0.8, 8.6, 'At the Primordial Aegis Realms, where universes are drafted before they are born, the Guardians keep watch.']],
    sfx: [[0.2, 'swell', { v: 0.3 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -300], [9, 200]]), -700, 0.42);
      S.bg('aegis');
      [[-1300, 1], [-200, -1], [1100, -1]].forEach(([x, f], i) => {
        S.a('guardian', { x, y: 0, face: f, scale: GS, pose: RIG.mod('idle', { head: Math.sin(S.T * 0.3 + i) * 4 }), glow: 0.3 });
      });
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[3.6, 8.6, 'Unauthorized presence. State your definition.', 'GUARDIAN']],
    sfx: [[0.6, 'erase', { v: 0.6 }], [3, 'rumble', { v: 0.6 }], [3.4, 'glitch', { v: 0.5 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 200], [9, 140]]), -420, K(t, [[0, 0.46], [9, 0.52]]));
      S.bg('aegis');
      const ctx = S.w();
      // blueprint ring near the breach going grey
      const k = S.P(0.5, 3);
      FX.voidHole(ctx, S.T, 250, -620, 150 * k, k * (1 - S.P(3, 4.5)), 3, 1, 1.25);
      FX.staticBlocks(ctx, S.T, 250, -500, 800 * k, 700 * k, 30, 7, k * 0.7);
      S.a('guardian', { x: -800, y: 0, face: [[0, -1], [2.6, 1]], scale: GS * 0.6, pose: [[0, 'idle'], [2.8, 'idle'], [3.6, RIG.mod('guard', { sF: 30 })]], glow: 0.4 });
      S.a('guardian', { x: 1300, y: 0, face: -1, scale: GS * 0.6, pose: [[0, 'idle'], [3.0, 'idle'], [3.8, 'guard']], glow: 0.4 });
      UNM.draw(ctx, { x: 250, y: 0, t: S.T, eyes: S.P(4, 5.5), alpha: S.P(2, 3.2), flicker: 0.1 });
      R.desat(k * 0.25);
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.4, 3.6, 'A Primoran drove its creation-spear into the field.'], [4.4, 9.6, 'Before it landed, the spear forgot the difference between sharp and blunt.']],
    sfx: [[1.4, 'whoosh', { v: 0.8 }], [3.3, 'erase', { v: 0.8 }], [3.6, 'chime', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [3.4, 60], [10, 0]]), K(t, [[0, -500], [10, -380]]), K(t, [[0, 0.55], [3.4, 0.62], [10, 0.58]]));
      S.shake(S.pulse(3.3, 3.9, 0.02, 0.5) * 10);
      S.bg('aegis');
      const ctx = S.w();
      // the Unmaker's field: a sphere of drained reality
      FX.ring(ctx, 280, -170, 260, 3, '#bdbdbd', 0.35 + 0.1 * Math.sin(S.T * 3));
      R.world(1);
      const thrust = S.P(1.2, 3.3, 'in3');
      const forgot = t > 3.3;
      S.a('guardian', {
        x: -620, y: 0, face: 1, scale: GS * 0.72, glow: 0.4,
        pose: [[0, 'guard'], [1.2, RIG.mod('stabDown', { lean: -20, sF: 40 })], [3.3, 'stabDown'], [6, RIG.mod('stabDown', { lean: 10 })]],
        hold: { F: forgot ? { type: 'creationSpear', abs: 118, forgot: true, layer: 'none' } : { type: 'creationSpear', abs: lerp(80, 118, thrust) }, B: { type: 'shield' } },
      });
      if (forgot) {
        // the spear unfolds into meaningless light; the Guardian keeps only a memory of it
        const u = S.P(3.3, 9.5);
        const x0 = -250, y0 = -520, x1 = 250, y1 = -250;
        ctx.save();
        ctx.setLineDash([10, 12]);
        ctx.strokeStyle = rgba('#bff6ff', 0.55 * (1 - u * 0.5));
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x0 - 200, y0 - 100);
        ctx.lineTo(x0 + (x1 - x0) * 0.4, y0 + (y1 - y0) * 0.4);
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 40; i++) {
          const k = i / 40;
          const px = lerp(x0, x1, k) + Math.sin(S.T * 1.5 + i) * 30 * u + (hash(i) - 0.5) * 240 * u;
          const py = lerp(y0, y1, k) - u * 220 * hash(i * 3) + Math.cos(S.T * 1.2 + i) * 20;
          FX.glow(ctx, px, py, 40 + hash(i) * 40, i % 3 ? '#9ff4ff' : '#ffffff', 0.6 * (1 - u * 0.7));
        }
      }
      UNM.draw(ctx, { x: 280, y: 0, t: S.T, eyes: 1, armL: 0.2 });
      if (t > 3.3 && t < 3.55) R.flash('#ffffff', 0.5, 'lighter');
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.5, 4.8, 'Seven Guardians closed around it.'], [5.2, 10.6, 'It did not break their armor. It removed the idea that made the plates a suit.']],
    sfx: [[4.6, 'erase', { v: 0.9 }], [5.2, 'shatter', { v: 0.6 }], [6, 'choir', { v: 0.4 }]],
    draw(t, S) {
      S.cam(0, -520, K(t, [[0, 0.3], [11, 0.36]]));
      S.bg('aegis');
      const ctx = S.w();
      const drift = S.P(4.6, 10, 'out3');
      const ring = [-1900, -1300, -700, 700, 1300, 1900, 0];
      ring.forEach((x, i) => {
        const back = i === 6;
        const st = { x, y: back ? -40 : 0, face: x < 0 ? 1 : -1, scale: back ? 3.2 : 3.6, pose: drift > 0 ? RIG.mod('guard', { head: -10 }) : 'guard', t: S.T };
        if (drift > 0) BEINGS.guardianDrift(ctx, Object.assign(st, { drift: drift * (0.7 + hash(i) * 0.5) }));
        else S.a('guardian', Object.assign(st, { glow: 0.4 }));
      });
      UNM.draw(ctx, { x: 0, y: 0, t: S.T, eyes: 1, h: 8.6 * UW.FT, shards: 26 });
      if (t > 4.6 && t < 5) R.glitch(0.8, S.T, 8);
      S.post();
    },
  });

  UW.shot({
    dur: 8,
    caps: [[0.8, 7.6, 'In the Omniscape, where everything that ever happened is kept, a page of history went white.']],
    sfx: [[3.2, 'erase', { v: 0.5 }]],
    draw(t, S) {
      S.cam(0, -300, K(t, [[0, 0.9], [8, 1.05]]));
      S.bg('judgesHall');
      const ctx = S.w();
      BEINGS.warden(ctx, { x: -520, y: 0, t: S.T, h: 360 });
      BEINGS.warden(ctx, { x: 520, y: 0, t: S.T + 2, h: 340 });
      // a floating record being read — its lines vanish
      const px = 0, py = -420, pw = 520, ph = 320;
      ctx.save();
      ctx.fillStyle = '#e9e3d2';
      ctx.strokeStyle = '#2a2a30';
      ctx.lineWidth = 3;
      ctx.fillRect(px - pw / 2, py - ph / 2, pw, ph);
      ctx.strokeRect(px - pw / 2, py - ph / 2, pw, ph);
      const wipe = S.P(3.2, 6.5, 'io');
      for (let r = 0; r < 12; r++) {
        const y = py - ph / 2 + 30 + r * 24;
        const gone = hash(r * 3.3) < wipe * 1.1 || wipe > 0.95;
        if (gone) continue;
        ctx.fillStyle = '#2a2a30';
        for (let c = 0; c < 18; c++) {
          if (hash(r * 20 + c) < 0.18) continue;
          ctx.fillRect(px - pw / 2 + 30 + c * 26, y, 18, 6);
        }
      }
      ctx.restore();
      FX.glow(ctx, px, py, 400, '#fff6e0', 0.25);
      if (wipe > 0 && wipe < 1) FX.staticBlocks(ctx, S.T, px, py, pw, ph, 20, 9, 0.8);
      S.post();
    },
  });

  /* ============================== CHAPTER II ============================== */
  UW.chapter({ id: 'ch2', num: 'Chapter II', title: 'The Council at the Citadel', sub: 'Everyone who would stand', color: '#ffb070', music: 'council', stage: 0 });

  UW.shot({
    dur: 10,
    caps: [[5.2, 7.4, 'Brother.', 'VALORION'], [7.6, 9.8, 'You only come down here when something is ending.', 'CHASE']],
    sfx: [[1.2, 'swell', { v: 0.5 }], [4.4, 'chime', { v: 0.7 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [10, 0]]), -220, K(t, [[0, 0.9], [10, 1.25]]));
      S.bg('citadel');
      const ctx = S.w();
      // a column of light: Valorion's avatar descends
      const land = S.P(0.8, 4.4, 'out3');
      const beamA = S.pulse(0.5, 6, 0.8, 1.5);
      if (beamA > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(260, -2000, 260, 0);
        g.addColorStop(0, rgba('#b58aff', 0));
        g.addColorStop(1, rgba('#d8c2ff', 0.35 * beamA));
        ctx.fillStyle = g;
        ctx.fillRect(170, -2000, 180, 2000);
        ctx.restore();
      }
      S.a('valorion', { x: 260, y: [[0, -900], [4.4, 0]], ye: 'out3', face: -1, pose: t < 4.2 ? 'hover' : [[4.2, 'land'], [5.2, 'stand']], glow: [[0, 1], [6, 0.25]], talk: [[5.2, 0], [5.4, 1], [7, 1], [7.2, 0]], hair: {} });
      S.a('chase', { x: -160, y: 0, face: [[0, 1]], pose: [[0, 'idle'], [3, RIG.mod('idle', { head: -12 })], [5, 'idle']], talk: [[7.6, 0], [7.8, 1], [9.6, 1], [9.8, 0]], expr: 'neutral' });
      if (land > 0.98 && t < 4.8) FX.shock(ctx, t, 4.4, 0.8, 260, 0, 300, '#c9a2ff', 10, 0.2);
      S.post();
    },
  });

  UW.portraitShot({
    id: 'valorion', dur: 9, s0: 470, s1: 520, expr: 'sad',
    bg: ['#2a1a3a', '#0a0612', '#6a3aa0'],
    talk: [[0.4, 8.4]],
    caps: [[0.4, 4.2, 'Something is. It does not hate us, Chase.', 'VALORION'], [4.4, 8.6, 'It hurts. Everything we are is shaped like a blade to it.', 'VALORION']],
  });

  UW.shot({
    dur: 10,
    caps: [[6.4, 9.8, 'Then we give it nothing to cut.', 'MAEVE']],
    sfx: [[0.6, 'teleport', { v: 0.7 }], [2.2, 'whoosh', { v: 0.6 }], [3.2, 'speed', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [10, -60]]), -230, K(t, [[0, 0.72], [10, 0.8]]));
      S.bg('citadel');
      const ctx = S.w();
      const mA = S.P(0.6, 1.0);
      if (t > 0.5 && t < 1.4) {
        FX.burst(ctx, t, 0.6, { n: 40, x: -330, y: -140, speed: [100, 500], g: 0, drag: 3, size: [3, 7], color: ['#c0102a', '#ff3a4a'], kind: 'glow', life: [0.4, 0.9], seed: 3 });
        FX.glow(ctx, -330, -140, 260 * (1 - S.P(0.6, 1.4)), '#ff2a3a', 0.8);
      }
      S.a('chase', { x: -120, y: 0, face: 1, pose: 'idle' });
      S.a('maeve', { x: -330, y: 0, face: 1, pose: [[0, 'idle'], [7, RIG.mod('idle', { head: -6 })]], alpha: mA, alphaBuffer: false, talk: [[6.4, 0], [6.6, 1], [9.4, 1], [9.6, 0]] });
      S.a('valorion', { x: 300, y: 0, face: -1, pose: 'stand', glow: 0.2 });
      // family arriving
      S.a('valor', { x: [[1.2, -900], [2.6, -560]], y: [[1.2, -500], [2.6, 0]], ye: 'out', face: 1, pose: t < 2.5 ? 'hover' : [[2.5, 'land'], [3.3, 'proud']] });
      S.a('seraphina', { x: [[1.6, -800], [3.2, -700]], y: [[1.6, -420], [3.2, 0]], face: 1, pose: t < 3.1 ? 'hover' : 'idle', wings: [[1.6, 0.9], [3.4, 0.3]], flap: 0.3 });
      S.a('atterea', { x: [[2.2, -1600], [2.6, -820]], xe: 'out3', face: 1, pose: t < 2.6 ? RIG.run(S.T, 3) : 'idle' });
      if (t > 2.1 && t < 3) FX.trail(ctx, [[-1600, -120], [-1100, -125], [-850, -120]], 6, '#c9a7ff', 1 - S.P(2.6, 3));
      [['draven', -960], ['caelum', -1080], ['vira', -1190], ['ash', -1280], ['ashira', -1360]].forEach(([id, x], i) => {
        S.a(id, { x: [[2.8 + i * 0.25, x - 400], [4.6 + i * 0.25, x]], face: 1, pose: t < 4.6 + i * 0.25 ? RIG.walk(S.T + i, 1.3) : 'idle' });
      });
      S.post();
    },
  });

  UW.shot({
    dur: 8,
    caps: [[2.2, 7.6, 'Relax, everyone. The fastest mortal in the Nexus is here.', 'GAMMA JACK']],
    sfx: [[0.3, 'speed', { v: 0.9 }], [1.0, 'hit', { v: 0.3 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 100], [8, 180]]), -200, K(t, [[0, 1.1], [8, 1.3]]));
      S.shake(S.pulse(0.9, 1.3, 0.02, 0.3) * 6);
      S.bg('citadel');
      const ctx = S.w();
      const arrive = S.P(0.2, 1.0, 'out5');
      const jx = lerp(-1400, 200, arrive);
      if (t < 1.4) {
        FX.trail(ctx, [[-1500, -110], [jx - 400, -115], [jx, -110]], 3, '#ffd84a', 1 - S.P(1.0, 1.4));
        FX.trail(ctx, [[-1500, -60], [jx - 300, -62], [jx, -60]], 2, '#fff2a0', 1 - S.P(1.0, 1.4));
      }
      if (t > 0.9 && t < 1.8) FX.burst(ctx, t, 0.95, { n: 26, x: jx, y: -4, speed: [80, 400], dir: Math.PI, spread: 1.4, g: 400, size: [2, 5], color: ['#ffd84a', '#fff'], kind: 'spark', life: [0.3, 0.8], seed: 7 });
      S.a('jack', { x: jx, y: 0, face: 1, vx: t < 1 ? 1800 : 0, pose: t < 0.95 ? 'flyFast' : [[0.95, 'land'], [1.6, 'proud']], glow: [[0, 1], [1.4, 0.4], [3, 0]], expr: 'smirk', talk: [[2.2, 0], [2.4, 1], [7.2, 1], [7.4, 0]] });
      // the Coalition walking in behind him
      [['tyrus', -140], ['jake', -300], ['axion', -440], ['nyx', -560], ['blaze', -680]].forEach(([id, x], i) => {
        S.a(id, { x: [[1.8, x - 500], [5 + i * 0.2, x]], face: 1, pose: t < 5 + i * 0.2 ? RIG.walk(S.T + i * 0.3, 1.2) : 'idle' });
      });
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[2.6, 7.6, 'If this world is going to be ruined, it will be ruined by me. Not by that.', 'MALEVOLOR']],
    sfx: [[0.4, 'crack', { v: 0.8 }], [0.5, 'rumble', { v: 0.6 }], [8, 'chime', { v: 0.3 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 400], [7.6, 360], [10, 250]]), -220, K(t, [[0, 0.95], [10, 1.05]]));
      S.bg('citadel');
      const ctx = S.w();
      // red lightning tear
      const open = S.pulse(0.3, 9.5, 0.6, 1.2);
      if (open > 0) {
        for (let i = 0; i < 3; i++) FX.lightning(ctx, 700, -640, 700 + (hash(i + Math.floor(S.T * 8)) - 0.5) * 60, 0, Math.floor(S.T * 12) + i, '#ff1a2a', 3, open * 0.8, 2);
        ctx.save();
        ctx.fillStyle = rgba('#000000', open);
        ctx.beginPath();
        ctx.ellipse(700, -300, 60 * open, 320 * open, 0, 0, UW.TAU);
        ctx.fill();
        ctx.restore();
        FX.glow(ctx, 700, -300, 400, '#b0101a', 0.5 * open);
      }
      S.a('malevolor', { x: [[0.6, 720], [2.4, 560]], face: -1, pose: t < 2.4 ? RIG.walk(S.T, 0.9, true) : 'idle', talk: [[2.6, 0], [2.8, 1], [7.4, 1], [7.6, 0]], glow: [[0, 0.6], [3, 0.2]] });
      S.a('aphrodite', { x: [[1.4, 760], [3.2, 700]], face: -1, pose: t < 3.2 ? RIG.walk(S.T, 0.9) : 'idle' });
      S.a('kael', { x: [[1.8, 800], [3.6, 810]], face: [[0, -1], [7.8, -1]], pose: t < 3.6 ? RIG.walk(S.T, 1.1) : RIG.mod('idle', { head: -8 }) });
      S.a('atterea', { x: 60, y: 0, face: 1, pose: RIG.mod('idle', { head: -6 }), expr: 'neutral' });
      S.a('chase', { x: -120, y: 0, face: 1, pose: 'idle' });
      S.a('maeve', { x: -300, y: 0, face: 1, pose: 'idle' });
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[0.6, 4.4, 'Seven armies. One line. I will hold it.', 'VALOR'], [4.8, 8.6, 'Hold it. Just do not let it hold you.', 'CHASE']],
    draw(t, S) {
      S.cam(K(t, [[0, -80], [9, -40]]), -200, 1.55);
      S.bg('citadel');
      S.a('valor', { x: 70, y: 0, face: -1, pose: [[0, 'proud'], [4.6, RIG.mod('idle', { head: 6 })]], talk: [[0.6, 0], [0.8, 1], [4.2, 1], [4.4, 0]], glow: [[0, 0.3], [4, 0.1]], eyeGlow: 0.4 });
      S.a('chase', { x: -210, y: 0, face: 1, pose: [[0, 'idle'], [4.8, RIG.mod('idle', { head: 8 })]], talk: [[4.8, 0], [5, 1], [8.4, 1], [8.6, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 11, fadeOut: 1.2,
    caps: [[1, 10.4, 'The war began the way endings usually do. Quietly, at the edge of the map.']],
    sfx: [[3.2, 'erase', { v: 0.6 }], [3.4, 'rumble', { v: 0.7 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [11, 120]]), -420, K(t, [[0, 0.5], [11, 0.56]]));
      S.bg('citadel', { sky: ['#140c24', '#3a1a36', '#8a3a36', '#c87050'] });
      const ctx = S.w();
      // a black seam across the evening sky
      const k = S.P(3, 9, 'io');
      const sc = R.world(0.15);
      sc.save();
      sc.fillStyle = '#000';
      sc.beginPath();
      sc.moveTo(-1400 * k, -250);
      sc.quadraticCurveTo(0, -290 - 40 * k, 1400 * k, -230);
      sc.lineTo(1400 * k, -222);
      sc.quadraticCurveTo(0, -268 - 30 * k, -1400 * k, -240);
      sc.closePath();
      sc.fill();
      sc.restore();
      FX.staticBlocks(sc, S.T, 0, -250, 2800 * k, 90, 30, 5, k);
      R.world(1);
      const cast = ['ashira', 'ash', 'vira', 'caelum', 'draven', 'atterea', 'kael', 'aphrodite', 'malevolor', 'maeve', 'chase', 'valorion', 'valor', 'seraphina', 'jack', 'tyrus', 'jake', 'axion', 'nyx', 'blaze'];
      cast.forEach((id, i) => {
        const x = -1500 + i * 158;
        S.a(id, { x, y: 0, face: 1, pose: RIG.mod('idle', { head: -14 }), silhouette: 0.82, silC: '#140a14', buffer: true });
      });
      S.post();
    },
  });
})();
