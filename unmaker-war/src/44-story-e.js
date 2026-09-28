/* The Unmaker War — Chapter XI (Pain Made Weather), XII (The Stabilization), Epilogue (What Remains). */
(function () {
  'use strict';
  const UW = window.UW;
  const { K, lerp, sat, hash, rgba, Ease, TAU, pulse } = UW;
  const R = UW.R, FX = UW.FX, BG = UW.BG, UNM = UW.UNM, BEINGS = UW.BEINGS, RIG = UW.RIG;
  const W = UW.W, H = UW.H;
  const jw = UW.jw;

  /* ---------- weather that dissolves laws ---------- */
  function lawRain(S, a, seed) {
    if (a <= 0) return;
    const ctx = R.world(1);
    const v = R.view(1);
    const t = S.T;
    ctx.save();
    ctx.strokeStyle = rgba('#b8b8c0', 0.45 * a);
    ctx.lineWidth = 2;
    const n = Math.floor(160 * a);
    for (let i = 0; i < n; i++) {
      const hx = hash(i * 1.31 + (seed || 0)), hy = hash(i * 2.77 + (seed || 0));
      const x = v.x0 + (((hx * (v.x1 - v.x0) - t * 180) % (v.x1 - v.x0)) + (v.x1 - v.x0)) % (v.x1 - v.x0);
      const span = v.y1 - v.y0 + 400;
      const y = v.y0 - 200 + ((hy * span + t * 1400 * (0.8 + hx * 0.4)) % span);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 14, y + 46);
      ctx.stroke();
    }
    ctx.restore();
    // where the rain lands, tiny patches of reality go missing
    FX.staticBlocks(ctx, t, (v.x0 + v.x1) / 2, -10, v.x1 - v.x0, 40, Math.floor(40 * a), 17, a * 0.8);
  }
  /* lightning that erases what it lights: returns strike position when active */
  function eraseBolt(S, t0, x, color) {
    const t = S.t;
    if (t < t0 || t > t0 + 1.4) return;
    const ctx = R.world(1);
    const a = 1 - (t - t0) / 1.4;
    if (t < t0 + 0.35) FX.lightning(ctx, x + 200, -1600, x, -20, Math.floor(t0 * 17), color || '#e8e8f0', 5, 1, 4);
    FX.voidHole(ctx, S.T, x, -40, 90 * a, a, Math.floor(t0 * 3), 1.6, 0.6);
    FX.staticBlocks(ctx, S.T, x, -80, 360, 200, 20, Math.floor(t0 * 7), a);
    if (t < t0 + 0.12) R.flash('#ffffff', 0.55, 'lighter');
  }
  function stormSky(S) {
    S.bg('battlefield', { mood: 'storm', smoke: false });
    const sc = R.world(0.1);
    for (let i = 0; i < 10; i++) {
      FX.soft(sc, (hash(i * 3.3) - 0.5) * 3600 + Math.sin(S.T * 0.1 + i) * 80, -900 + hash(i) * 300, 500, '#0c0c12', 0.8);
    }
  }
  /* stability field dome */
  function dome(ctx, x, r, a, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba('#6fb8ff', 0.08 * a);
    ctx.beginPath();
    ctx.arc(x, 0, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba('#bfe0ff', 0.6 * a);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, 0, r, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
    FX.glow(ctx, x, -r * 0.9, r * 0.5, '#9fd8ff', 0.2 * a);
  }
  /* a plain survivor silhouette, cheap enough for crowds */
  function survivor(ctx, x, h, col, t, seed, crouch) {
    ctx.save();
    ctx.translate(x, 0);
    const k = crouch ? 0.7 : 1;
    ctx.fillStyle = col;
    ctx.strokeStyle = '#0a0a0c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.9 * k, h * 0.07, h * 0.085, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-h * 0.11, -h * 0.78 * k);
    ctx.lineTo(h * 0.11, -h * 0.78 * k);
    ctx.lineTo(h * 0.09, -h * 0.45 * k);
    ctx.lineTo(h * 0.07, 0);
    ctx.lineTo(-h * 0.07, 0);
    ctx.lineTo(-h * 0.09, -h * 0.45 * k);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /* ============================== CHAPTER XI ============================== */
  UW.chapter({ id: 'ch11', num: 'Chapter XI', title: 'Pain Made Weather', sub: 'Every front at once', color: '#b8b8c0', music: 'storm', stageAll: 4, stage: { chase: 6, maeve: 4, malevolor: 4, seraphina: 4, jack: 4, valorion: 0 } });

  UW.shot({
    dur: 10,
    caps: [[0.6, 4.6, 'As reality pressed against it, its pain became weather.'], [5, 9.6, 'Where the rain fell, laws dissolved. Its lightning erased whatever it lit.']],
    sfx: [[0.4, 'rumble', { v: 0.8 }], [3.2, 'thunder', { v: 1 }], [6.4, 'thunder', { v: 0.9 }], [8.2, 'thunder', { v: 0.8 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [10, 200]]), -420, K(t, [[0, 0.5], [10, 0.55]]));
      stormSky(S);
      const ctx = S.w();
      UNM.draw(ctx, { x: 0, y: 0, t: S.T, eyes: 1, pain: 1, h: 8.6 * UW.FT * 1.4, shards: 40 });
      lawRain(S, S.P(0.5, 3), 1);
      eraseBolt(S, 3.2, -700);
      eraseBolt(S, 6.4, 900);
      eraseBolt(S, 8.2, -300);
      S.post();
    },
  });

  UW.shot({
    dur: 12,
    caps: [[0.6, 5, 'Chase crossed the battlefield with survivors sheltered beneath portable stability fields.'], [5.4, 11.6, "Axion's devices. His own body, on the side the rain came from."]],
    sfx: [[2, 'zap', { v: 0.4 }], [5, 'thunder', { v: 0.8 }], [9, 'thunder', { v: 0.7 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -700], [12, 300]]), -240, 0.78);
      stormSky(S);
      const ctx = S.w();
      const cx = K(t, [[0, -900], [12, 380]]);
      [[-300, 150], [0, 180], [340, 150]].forEach(([dx, r], i) => {
        dome(ctx, cx + dx, r, 0.9, S.T);
        for (let k = 0; k < 4; k++) survivor(ctx, cx + dx - r * 0.5 + k * r * 0.33, 150 + hash(i * 4 + k) * 40, ['#6a4a3a', '#3a4a6a', '#6a6a3a', '#4a3a5a'][(i + k) % 4], S.T, i * 4 + k, true);
      });
      S.a('axion', { x: cx - 520, y: 0, face: 1, pose: RIG.walk(S.T, 0.9), hold: {} });
      S.a('chase', { x: cx + 560, y: 0, face: 1, pose: RIG.limpWalk(S.T, 0.55), hold: { F: { type: 'scythe', abs: 4, g: 0.5, charge: 0.3 } } });
      lawRain(S, 1, 2);
      eraseBolt(S, 5, cx + 900);
      eraseBolt(S, 9, cx - 900);
      S.post();
    },
  });

  /* every front at once — a montage */
  const FRONTS = [
    ['Valor held seven armies together with his own movement at the front.', (t, S) => {
      stormSky(S);
      S.a('valor', { x: 0, y: 0, face: 1, pose: RIG.mod('raise', { head: -10 }), glow: 1, eyeGlow: 1 });
      const ctx = S.w();
      for (let i = 0; i < 5; i++) FX.lightning(ctx, 0, -300, (i - 2) * 260, -800, Math.floor(S.T * 10) + i, '#6fd0ff', 3, 0.8, 1);
      FX.ring(ctx, 0, -330, 60, 4, '#bfeaff', 0.9);
    }],
    ['Tyrus planted himself and would not be moved.', (t, S) => {
      stormSky(S);
      S.a('tyrusTitan', { x: 0, y: 0, face: 1, pose: RIG.mod('lift', { kF: 40, kB: 40 }), glow: 0.3 });
      const ctx = S.w();
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(-500, -470, 1000, 60);
    }],
    ['Jake held a closing rift open with his shoulders.', (t, S) => {
      stormSky(S);
      const ctx = S.w();
      FX.voidHole(ctx, S.T, 0, -170, 180, 1, 3, 0.7, 1.2);
      S.a('jake', { x: 0, y: 0, face: 1, pose: RIG.mod('lift', { sF: 110, sB: 250, eF: 20, eB: 20 }) });
    }],
    ['Draven cut. Caelum held the air still so the cuts landed.', (t, S) => {
      stormSky(S);
      S.a('draven', { x: -160, y: 0, face: 1, pose: 'glaive', hold: { F: { type: 'glaive', abs: 60 } }, glow: 0.8, eyeGlow: 1 });
      S.a('caelum', { x: 220, y: -40, face: -1, pose: 'cast', glow: 1 });
      S.unmade(3, 460, 900, { seed: 31, face: -1, extra: { attack: true } });
    }],
    ['Vira would not leave Ash. Ash would not stop burning.', (t, S) => {
      stormSky(S);
      S.a('ash', { x: 80, y: 0, face: 1, pose: 'cast', glow: 1 });
      S.a('vira', { x: -120, y: 0, face: 1, pose: 'guard' });
      const ctx = S.w();
      FX.beam(ctx, 180, -110, 900, -140, 30, '#ff7a1a', 0.9, S.T);
      S.unmade(2, 700, 1000, { seed: 41, face: -1 });
    }],
    ['Jackson and the dead cut through the Unmade under Lena’s lantern.', (t, S) => {
      S.bg('battlefield', { mood: 'gray' });
      S.a('jackson', { x: 0, y: 0, face: 1, pose: RIG.blend('slashWind', 'slash', pulse((S.T * 1.2) % 1, 0, 1, 0.3, 0.3)), hold: { F: { type: 'machete', blood: true } } });
      S.a('lena', { x: -300, y: 0, face: 1, pose: RIG.mod('raise', { sB: -160 }), hold: { F: { type: 'lantern', side: 'F', power: 1.6 } } });
      S.unmade(2, 250, 500, { seed: 51, face: -1, extra: { attack: true } });
    }],
  ];
  UW.shot({
    dur: 15,
    caps: FRONTS.map((f, i) => [i * 2.5 + 0.1, i * 2.5 + 2.4, f[0]]),
    sfx: FRONTS.map((f, i) => [i * 2.5 + 0.1, i % 2 ? 'hit' : 'thunder', { v: 0.7 }]),
    draw(t, S) {
      const i = Math.min(FRONTS.length - 1, Math.floor(t / 2.5));
      const lt = t - i * 2.5;
      S.cam(-60 + lt * 30, -200, 1.1 + lt * 0.03);
      FRONTS[i][1](lt, S);
      lawRain(S, 0.7, 3 + i);
      if (lt < 0.12) R.flash('#ffffff', 0.4, 'lighter');
      S.post();
    },
  });

  UW.shot({
    dur: 12,
    caps: [[0.6, 4.6, 'Ashira put a ward over her siblings. Seven layers of it.'], [5, 11.6, 'The lightning erased them one at a time. She kept making new ones.']],
    sfx: [[3, 'thunder', { v: 0.8 }], [5, 'thunder', { v: 0.8 }], [7, 'thunder', { v: 0.8 }], [9, 'thunder', { v: 0.8 }], [3.3, 'chime', { v: 0.4 }], [5.3, 'chime', { v: 0.4 }], [7.3, 'chime', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -60], [12, -20]]), -220, K(t, [[0, 1.0], [12, 1.12]]));
      stormSky(S);
      const ctx = S.w();
      const lost = Math.min(5, Math.max(0, Math.floor((t - 3) / 2) + 1));
      for (let L = 6; L >= 0; L--) {
        const gone = L >= 7 - lost;
        const regrow = gone ? S.P(3 + (6 - L) * 2 + 1.2, 3 + (6 - L) * 2 + 2) : 1;
        const a = gone ? regrow * 0.6 : 1;
        if (a <= 0.02) continue;
        const r = 170 + L * 34;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba('#ffe9b0', 0.55 * a);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = rgba('#fff0c0', 0.04 * a);
        ctx.fill();
        ctx.restore();
      }
      [3, 5, 7, 9, 11].forEach((tb, i) => eraseBolt(S, tb, (i % 2 ? 1 : -1) * (320 + i * 20)));
      S.a('vira', { x: -140, y: 0, face: 1, pose: 'guard' });
      S.a('ash', { x: 150, y: 0, face: -1, pose: 'guard', glow: 0.5 });
      S.a('ashira', { x: 0, y: 0, face: 1, pose: RIG.mod('castUp', { head: -10 }), glow: 1, expr: 'pain' });
      lawRain(S, 1, 4);
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.6, 5, 'Seraphina shielded a crowd with her wings until they burned.'], [5.4, 10.6, "Maeve turned the storm's debris into a blood-red wall of knives."]],
    sfx: [[0.8, 'thunder', { v: 0.7 }], [3, 'crack', { v: 0.5 }], [6, 'slash', { v: 0.6 }], [7, 'slash', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -300], [5.4, -300], [6, 300], [11, 380]]), -220, 0.95);
      stormSky(S);
      const ctx = S.w();
      if (t < 5.6) {
        const res = S.a('seraphina', { x: -300, y: 0, face: 1, pose: RIG.mod('cast', { lean: 20 }), wings: 1, flap: 0.02, glow: 1 });
        for (let k = 0; k < 5; k++) survivor(ctx, -60 + k * 70, 160, ['#6a4a3a', '#3a4a6a', '#6a6a3a'][k % 3], S.T, k, true);
        // burning feathers
        FX.burst(ctx, (t % 1.5), 0, { n: 14, x: -520, y: -420, rx: 300, ry: 200, speed: [20, 90], dir: Math.PI / 2, spread: 1, g: 90, drag: 1, size: [4, 7], color: ['#f6f3ee', '#2a1c16'], kind: 'feather', life: [1.2, 1.5], seed: Math.floor(t / 1.5) });
        FX.burst(ctx, (t % 1.1), 0, { n: 18, x: -520, y: -420, rx: 320, ry: 200, speed: [20, 90], dir: -Math.PI / 2, spread: 1, g: -60, size: [2, 4], color: ['#ff9a3a', '#ffcf6a'], kind: 'ember', life: [0.8, 1.1], seed: Math.floor(t / 1.1) + 9 });
        lawRain(S, 1, 5);
      } else {
        S.a('maeve', { x: 380, y: 0, face: 1, pose: RIG.mod('cast', { lean: 4 }), glow: 1, eyeGlow: 1, hold: { F: { type: 'dagger', ang: 0 } } });
        for (let i = 0; i < 36; i++) {
          const a = (i / 36) * TAU + S.T * 1.4;
          const rr = 240 + Math.sin(S.T * 2 + i) * 30;
          const x = 380 + Math.cos(a) * rr, y = -160 + Math.sin(a) * rr * 0.55;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(a + Math.PI / 2);
          ctx.fillStyle = i % 3 ? '#c9ccd6' : '#8a0e1c';
          ctx.fillRect(-2, -14, 4, 28);
          ctx.restore();
        }
        FX.glow(ctx, 380, -160, 360, '#c0102a', 0.35);
        lawRain(S, 0.8, 6);
      }
      S.post();
    },
  });

  UW.shot({
    dur: 11, fadeOut: 0.6,
    caps: [[0.6, 5, 'Above the storm, the Silent Judges wrote down the name of everything the rain touched.'], [5.4, 10.6, 'Below it, Chase kept walking toward the center.']],
    sfx: [[0.6, 'choir', { v: 0.5, f: 98 }], [6, 'thunder', { v: 0.8 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [11, 200]]), K(t, [[0, -900], [5.4, -900], [11, -300]]), K(t, [[0, 0.36], [11, 0.5]]));
      stormSky(S);
      const ctx = S.w();
      BEINGS.judge(ctx, { x: -900, y: -700, t: S.T, h: 1100, alpha: 0.8 });
      BEINGS.judge(ctx, { x: 1000, y: -760, t: S.T + 3, h: 1000, alpha: 0.7 });
      UNM.draw(ctx, { x: 700, y: 0, t: S.T, eyes: 1, pain: 1, h: 8.6 * UW.FT * 1.4 });
      S.a('chase', { x: [[0, -600], [11, 150]], face: 1, pose: RIG.limpWalk(S.T, 0.55), hold: { F: { type: 'scythe', abs: 4, g: 0.5, charge: 0.3 } } });
      lawRain(S, 1, 7);
      eraseBolt(S, 6, -300);
      S.post();
    },
  });

  /* ============================== CHAPTER XII ============================== */
  UW.chapter({ id: 'ch12', num: 'Chapter XII', title: 'The Stabilization', sub: 'The eye of the storm', color: '#f3dcc8', music: 'final', stageAll: 4, stage: { chase: 7, maeve: 4, malevolor: 5, seraphina: 4, valorion: 0 } });

  UW.shot({
    dur: 10,
    caps: [[0.8, 5.4, 'He reached it at the eye of the storm. One arm. One eye. Burned. Leaning on his enemy’s scythe.'], [5.8, 9.6, 'He was not there to win.']],
    sfx: [[0.6, 'rumble', { v: 0.5 }], [5.8, 'heartbeat', { v: 0.7 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -100], [10, 0]]), -230, K(t, [[0, 0.8], [10, 0.95]]));
      stormSky(S);
      R.desat(0.3);
      const ctx = S.w();
      UNM.draw(ctx, { x: 380, y: 0, t: S.T, eyes: 1, pain: 0.8 });
      S.a('chase', { x: [[0, -500], [7, -120]], face: 1, pose: t < 7 ? RIG.limpWalk(S.T, 0.5) : 'crutch', hold: { F: { type: 'scythe', abs: 4, g: 0.5, charge: 0.3 } }, glow: 0.2 });
      lawRain(S, 0.5, 8);
      S.post();
    },
  });

  UW.shot({
    dur: 13,
    caps: [[0.4, 4, 'It removed his momentum.'], [4.4, 8.4, 'It removed his identity.'], [8.8, 12.6, 'It removed the meaning of impact.']],
    sfx: [[0.6, 'erase', { v: 0.9 }], [4.6, 'erase', { v: 1 }], [5, 'glitch', { v: 0.9 }], [9.2, 'silence', {}]],
    draw(t, S) {
      S.cam(K(t, [[0, -60], [13, -40]]), -220, K(t, [[0, 1.1], [13, 1.25]]));
      stormSky(S);
      R.desat(0.35);
      const ctx = S.w();
      UNM.draw(ctx, { x: 360, y: 0, t: S.T, eyes: 1, pain: 0.8, armR: t > 8.8 ? lerp(0.2, 1.6, S.P(8.8, 9.6)) : 0.1 });
      // momentum removed: his step freezes in the air, then he forces it down
      const frozen = t > 0.8 && t < 3.6;
      const idLoss = pulse(t, 4.6, 8.2, 0.3, 1.2);
      const anchorGlow = S.P(6.4, 8);
      S.a('chase', { x: -100, y: 0, face: 1, pose: frozen ? RIG.mod('crutch', { hF: 30, kF: 40 }) : t < 8.8 ? 'crutch' : RIG.mod('hit', { lean: 6 }), t: frozen ? 0.8 + S.shot.start : S.T, hold: { F: { type: 'scythe', abs: 4, g: 0.5, charge: 0.3 } }, erase: idLoss * 0.8, glow: anchorGlow * 0.5 });
      if (frozen) FX.staticBlocks(ctx, S.T, -100, -150, 160, 300, 10, 3, 0.6);
      // the blow that means nothing: contact with no sound, no shockwave
      if (t > 9.4 && t < 12.5) {
        ctx.save();
        ctx.strokeStyle = rgba('#dddddd', 0.5 * (1 - S.P(9.4, 12.5)));
        ctx.setLineDash([4, 10]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-40, -200, 70, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      S.post();
    },
  });

  /* the anchors: everyone he was holding on to */
  const ANCHORS = [
    ['maeve', '#ff2438'], ['valor', '#6fb8ff'], ['seraphina', '#ffe7a6'], ['atterea', '#9dffb8'], ['draven', '#ff3a4a'],
    ['kael', '#ffb347'], ['ashira', '#fff0c0'], ['lena', '#ffe6a8'], ['jack', '#ffd84a'], ['malevolor', '#ff1818'], ['tyrus', '#c9a27a'], ['axion', '#55e6ff'],
  ];
  UW.shot({
    dur: 13,
    caps: [[0.6, 5, 'He anchored himself to the people he was protecting.'], [5.8, 12.4, "I'm not the strongest thing here. I'm just not alone.", 'CHASE']],
    sfx: ANCHORS.map((a, i) => [1 + i * 0.35, 'chime', { v: 0.25 }]).concat([[5.8, 'choir', { v: 0.6, f: 147 }]]),
    draw(t, S) {
      const ctx = S.sc();
      ctx.fillStyle = '#0c0c10';
      ctx.fillRect(0, 0, W, H);
      FX.glow(ctx, W / 2, H / 2, 900, '#3a3040', 0.5);
      const cx = W / 2, cy = H / 2 + 20;
      const k = S.P(0.6, 5);
      ANCHORS.forEach(([id, col], i) => {
        const a = -Math.PI / 2 + (i / ANCHORS.length) * TAU;
        const px = cx + Math.cos(a) * 640, py = cy + Math.sin(a) * 380;
        const on = S.P(1 + i * 0.35, 1.6 + i * 0.35);
        if (on <= 0) return;
        const fade = id === 'jack' ? 0.45 : 1;
        FX.thread(ctx, cx, cy, px, py, 30, col, 2.5, on * fade, S.T, i);
        UW.PORT.draw(ctx, id, { x: px, y: py, s: 118, t: S.T + i, expr: id === 'jack' ? 'smirk' : 'neutral', alpha: on * fade, dmg: UW.dmg(id, id === 'jack' ? 0 : id === 'malevolor' ? 5 : 4) });
      });
      UW.PORT.draw(ctx, 'chase', { x: cx, y: cy, s: 230, t: S.T, expr: 'grief', dmg: UW.dmg('chase', 7), talk: pulse(t, 5.8, 12.2, 0.1, 0.2) });
      FX.glow(ctx, cx, cy, 300, '#ffffff', 0.12 + k * 0.1);
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.8, 5.2, "It's not attacking us. It's flinching.", 'CHASE'], [5.8, 10.6, 'Every blow made its pain worse. So he stopped throwing them.']],
    sfx: [[5.2, 'crack', { v: 0.3 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 40], [11, 60]]), -210, K(t, [[0, 1.35], [11, 1.5]]));
      stormSky(S);
      R.desat(0.3);
      const ctx = S.w();
      UNM.draw(ctx, { x: 300, y: 0, t: S.T, eyes: 1, pain: 1, lean: -0.05 });
      const plant = t > 5.2;
      if (plant) {
        ctx.save();
        ctx.translate(-190, -200);
        ctx.rotate(-0.12);
        UW.GEAR.scythe(ctx, { Hh: 277, lw: 3, line: '#0c0808', t: S.T, J: {} }, { g: 0.72, charge: 0.1 });
        ctx.restore();
      }
      S.a('chase', { x: -60, y: 0, face: 1, pose: plant ? [[5.2, 'tired'], [7, RIG.mod('reach', { lean: 4, sF: 60, eF: 20, head: 6 })]] : 'crutch', hold: plant ? { F: null } : { F: { type: 'scythe', abs: 4, g: 0.5, charge: 0.3 } }, talk: [[0.8, 0], [1, 1], [5, 1], [5.2, 0]] });
      lawRain(S, 0.4 * (1 - S.P(6, 11)), 9);
      S.post();
    },
  });

  UW.shot({
    dur: 13,
    caps: [[0.8, 6, 'Instead of a finishing blow, he built a reality whose definitions did not hurt it.'], [6.6, 12.4, 'Soft edges. Room enough. Nothing shaped like a blade.']],
    sfx: [[0.6, 'swell', { v: 0.6 }], [2, 'choir', { v: 0.7, f: 147 }], [6, 'bell', { v: 0.5, f: 294 }]],
    draw(t, S) {
      const k = S.P(0.8, 9, 'io');
      S.cam(K(t, [[0, 0], [13, 60]]), -260, K(t, [[0, 1.0], [13, 0.82]]));
      if (k < 1) stormSky(S);
      const ctx = S.sc();
      if (k > 0) {
        ctx.save();
        ctx.globalAlpha = k;
        BG.stable(S, { k });
        ctx.restore();
      }
      R.world(1);
      const w = S.w();
      // light spreading from his open hand
      FX.glow(w, 20, -200, 900 * k, '#fff3e0', 0.35 * (1 - k * 0.5));
      FX.shock(w, t, 0.8, 5, 20, -200, 2400, '#fff0e0', 20);
      UNM.draw(w, { x: 300, y: 0, t: S.T, eyes: 1, pain: 1 - k, jitter: 1 - k, shards: Math.floor(30 * (1 - k * 0.6)), flicker: 0.1 * (1 - k) });
      const planted = w;
      planted.save();
      planted.translate(-190, -200);
      planted.rotate(-0.12);
      UW.GEAR.scythe(planted, { Hh: 277, lw: 3, line: '#0c0808', t: S.T, J: {} }, { g: 0.72, charge: 0.05 });
      planted.restore();
      S.a('chase', { x: -60, y: 0, face: 1, pose: RIG.mod('reach', { lean: 4, sF: 60, eF: 20, head: 6 }), hold: { F: null }, glow: k * 0.6, eyeGlow: k });
      lawRain(S, 0.4 * (1 - k), 10);
      S.post();
    },
  });

  UW.shot({
    dur: 12,
    caps: [[0.6, 4.2, 'Its final attack came anyway.'], [6.4, 11.6, 'It stopped an inch from his face.']],
    sfx: [[2.4, 'whoosh', { v: 0.6 }], [3.9, 'silence', {}], [6.4, 'heartbeat', { v: 0.8 }], [9.4, 'heartbeat', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 60], [4, 80], [12, 60]]), K(t, [[0, -220], [12, -250]]), K(t, [[0, 1.5], [3.9, 2.1], [12, 2.3]]));
      BG.stable(S, { k: 1 });
      const ctx = S.w();
      const reach = S.P(2.2, 3.9, 'in3');
      UNM.draw(ctx, { x: 290, y: 0, t: S.T, eyes: 1, armL: lerp(0.1, 1.55, reach), reachL: reach * 0.3, jitter: 0.2, shards: 8 });
      S.a('chase', { x: -40, y: 0, face: 1, pose: RIG.mod('reach', { lean: 0, sF: 20, eF: 10, head: 4 }), hold: { F: null }, expr: 'neutral', eyeGlow: 0.3 });
      S.post();
    },
  });

  UW.portraitShot({
    id: 'unmaker', dur: 9, s0: 470, s1: 500, eyes: 1,
    talk: [[3.2, 6.4]],
    caps: [[3.2, 8.4, '...It does not hurt.', 'THE UNMAKER']],
    under(t, S) {
      BG.stable(S, { k: 1 });
      R.screen();
    },
  });

  UW.portraitShot({
    id: 'chase', dur: 8, s0: 480, s1: 520, dmg: 7, expr: (t) => (t < 4 ? 'grief' : 'smirk'),
    talk: [[1.2, 4.6]],
    caps: [[1.2, 7.6, "Then stay. There's room.", 'CHASE']],
    under(t, S) {
      BG.stable(S, { k: 1 });
      R.screen();
    },
  });

  UW.shot({
    dur: 12, fadeOut: 1.6,
    caps: [[1, 6, 'The Unmaker sat down in the reality he had built for it. Its edges stopped failing.'], [6.6, 11.4, 'For the first time, existence did not feel like a wound.']],
    sfx: [[1, 'bell', { v: 0.5, f: 196 }], [6.6, 'choir', { v: 0.6, f: 196 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [12, 80]]), -300, K(t, [[0, 0.9], [12, 0.62]]));
      BG.stable(S, { k: 1 });
      const ctx = S.w();
      UNM.draw(ctx, { x: 260, y: 40, t: S.T, eyes: 1, lean: 0.05, armL: 0.5, armR: 0.5, jitter: 0, shards: 0, h: 8.6 * UW.FT * 0.72, cloak: true });
      // the shards settle like snow
      FX.field(ctx, S.T, { n: 60, x0: -1400, x1: 1600, y0: -1200, y1: 100, vy: 30, vx: 5, size: 5, color: ['#1a1a1c', '#3a3a3e'], kind: 'ash', alpha: 0.6, seed: 5 });
      S.a('chase', { x: -200, y: 0, face: 1, pose: RIG.mod('sit', { lean: 10, head: 10 }), hold: { F: null } });
      S.post();
    },
  });

  /* ============================== EPILOGUE ============================== */
  UW.chapter({ id: 'epilogue', num: 'Epilogue', title: 'What Remains', sub: 'After the weather cleared', color: '#e8d6b8', music: 'epilogue', stageAll: 5, stage: { chase: 8, maeve: 5, malevolor: 6, seraphina: 5, valorion: 0 } });

  UW.shot({
    dur: 11,
    caps: [[0.8, 6, 'The Silent Judges wrote down every name, even the ones reality had forgotten.'], [6.6, 10.6, 'One of them was Julius.']],
    sfx: [[6.6, 'bell', { v: 0.5, f: 220 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [11, 0]]), -600, K(t, [[0, 0.62], [11, 0.9]]));
      S.bg('judgesHall');
      const ctx = S.w();
      BEINGS.judge(ctx, { x: 0, y: 0, t: S.T, h: 1100 });
      const name = S.P(6.4, 8);
      if (name > 0) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '600 ' + 44 + 'px ' + UW.FONTS.display;
        ctx.letterSpacing = '8px';
        ctx.fillStyle = rgba('#ffe7a0', name);
        ctx.fillText('JULIUS', 0, -1100 * 0.42 + 90);
        ctx.letterSpacing = '0px';
        ctx.restore();
        FX.glow(ctx, 0, -1100 * 0.42 + 76, 200, '#ffd84a', 0.4 * name);
      }
      S.post();
    },
  });

  UW.shot({
    dur: 15,
    caps: [[1.4, 3.6, "It's yours.", 'CHASE'], [4.4, 6.2, 'You held it.', 'MALEVOLOR'], [7, 9.6, "Holding isn't owning.", 'CHASE'], [10.4, 14.6, 'Malevolor took the scythe back. Neither of them said anything else, which was its own kind of answer.']],
    sfx: [[2.2, 'crack', { v: 0.2 }], [10.6, 'bell', { v: 0.3, f: 147 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -60], [15, -20]]), -200, K(t, [[0, 1.2], [15, 1.35]]));
      S.bg('lawn');
      const ctx = S.w();
      ctx.fillStyle = '#1a1208';
      ctx.beginPath();
      ctx.ellipse(40, 4, 170, 22, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#c8a000';
      ctx.fillRect(160, -6, 24, 8);
      // a few small flowers, new since the war
      for (let i = 0; i < 5; i++) {
        const x = -60 + i * 45, y = -18 - hash(i) * 10;
        ctx.strokeStyle = '#2a4a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 2);
        ctx.lineTo(x, y);
        ctx.stroke();
        FX.glow(ctx, x, y, 10, '#ffd84a', 0.8);
      }
      const lay = S.P(1.6, 2.4);
      const took = t > 10.6;
      if (!took) {
        ctx.save();
        ctx.translate(lerp(-240, -140, lay), lerp(-230, -12, lay));
        ctx.rotate(lerp(0.1, Math.PI / 2 - 0.05, lay));
        UW.GEAR.scythe(ctx, { Hh: 277, lw: 3, line: '#0c0808', t: S.T, J: {} }, { g: 0.5, charge: 0.1 });
        ctx.restore();
      }
      S.a('malevolor', { x: 300, y: 0, face: -1, pose: took ? [[10.6, RIG.mod('stabDown', { lean: 20 })], [12, 'scytheRest']] : RIG.mod('sit', { head: 10 }), hold: took ? { F: { type: 'scythe', abs: 8, g: 0.45, charge: 0.2 } } : { F: null }, talk: [[4.4, 0], [4.6, 1], [6, 1], [6.2, 0]] });
      S.a('chase', { x: -300, y: 0, face: 1, pose: t < 2.4 ? RIG.mod('reach', { lean: 20, sF: 40 }) : 'tired', hold: { F: null }, talk: [[1.4, 0], [1.6, 1], [3.4, 1], [3.6, 0], [7, 0], [7.2, 1], [9.4, 1], [9.6, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[1, 5.6, 'On the Celestial River, something golden was still running.'], [6.4, 10.6, 'Jackson watched it until it was gone.']],
    sfx: [[2, 'speed', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [11, -100]]), -280, 0.9);
      S.bg('river');
      const ctx = S.w();
      const u = S.P(1.6, 6.5, 'io');
      const x = lerp(-1600, 1800, u);
      FX.trail(ctx, [[x - 700, 60], [x - 350, 50], [x, 40]], 3, '#ffd84a', 1 - S.P(6, 7));
      FX.glow(ctx, x, 20, 40, '#fff3b0', 1 - S.P(6, 7), true);
      BEINGS.ferryman(ctx, { x: 700, y: 120, t: S.T, h: 280, boat: true, face: -1, alpha: 0.9 });
      S.a('jackson', { x: -520, y: 0, face: 1, pose: RIG.mod('stand', { head: -8 }), hold: { F: null } });
      S.a('lena', { x: -700, y: 0, face: 1, pose: 'lantern', hold: { F: { type: 'lantern', side: 'F' } } });
      S.post();
    },
  });

  UW.shot({
    dur: 12,
    caps: [[0.8, 5.6, 'At dawn they counted who was left.'], [6.2, 11.4, 'Then they counted who was not, and said the names out loud.']],
    sfx: [[0.6, 'swell', { v: 0.3 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -200], [12, 100]]), -240, K(t, [[0, 0.62], [12, 0.7]]));
      S.bg('citadel', { sky: ['#2a2c4a', '#8a6a7a', '#f0b890', '#ffe0b0'] });
      const cast = [
        ['caelum', -1100], ['draven', -960], ['vira', -820], ['ash', -720], ['atterea', -560], ['kael', -440],
        ['seraphina', -250], ['maeve', 20], ['chase', 200], ['valor', 420], ['tyrus', 640], ['jake', 780], ['axion', 910], ['nyx', 1030], ['blaze', 1150],
      ];
      cast.forEach(([id, x], i) => {
        const st = { x, y: 0, face: x < 100 ? 1 : -1, pose: RIG.mod('idle', { head: 6 }) };
        if (id === 'seraphina') st.wings = 0.1;
        if (id === 'chase') st.hold = { F: null };
        if (id === 'valor') {
          st.pose = 'carry';
        }
        S.a(id, st);
      });
      // Ashira asleep in Valor's arms
      S.a('ashira', { x: 470, y: -150, face: -1, pose: RIG.mod('lieBack', { head: 30, sF: -40, sB: -20 }) });
      S.post();
    },
  });

  UW.shot({
    dur: 13,
    caps: [[1, 4.2, 'You did not win, brother.', 'VALORION'], [5, 8, 'No. We made room.', 'CHASE'], [8.8, 12.6, 'Far off, in the soft place Chase had built, the Unmaker was resting.']],
    sfx: [[1, 'choir', { v: 0.4, f: 196 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [13, 100]]), -420, K(t, [[0, 0.62], [13, 0.52]]));
      BG.stable(S, { k: 1 });
      const ctx = S.w();
      BEINGS.valorionTrue(ctx, { x: -200, y: -900, t: S.T, s: 900, alpha: 0.9, soft: true });
      UNM.draw(ctx, { x: 1100, y: 0, t: S.T, eyes: 0.8, h: 8.6 * UW.FT * 0.5, jitter: 0, shards: 0, armL: 0.4, armR: 0.4 });
      S.a('chase', { x: -300, y: 0, face: 1, pose: RIG.mod('tired', { head: -14 }), hold: { F: null }, talk: [[5, 0], [5.2, 1], [7.8, 1], [8, 0]] });
      S.a('maeve', { x: -500, y: 0, face: 1, pose: RIG.mod('idle', { head: -10 }) });
      S.post();
    },
  });

  UW.shot({
    dur: 10, fadeIn: 1.2, fadeOut: 2,
    sfx: [[0.6, 'boom', { v: 0.6 }], [0.8, 'bell', { v: 0.5, f: 147 }]],
    draw(t, S) {
      const ctx = S.sc();
      ctx.fillStyle = '#050506';
      ctx.fillRect(0, 0, W, H);
      FX.glow(ctx, W / 2, H / 2, 800, '#e8d6b8', 0.12);
      FX.field(ctx, S.T, { n: 80, x0: 0, x1: W, y0: 0, y1: H, vy: 12, size: 3, color: ['#2a2a2e', '#4a4a50'], kind: 'ash', alpha: 0.5, seed: 12 });
      const a = S.P(0.6, 2.4);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.font = '600 120px ' + UW.FONTS.display;
      ctx.letterSpacing = '6px';
      ctx.fillStyle = '#f3efe6';
      ctx.fillText('THE UNMAKER WAR', W / 2 + 3, 500);
      ctx.letterSpacing = '0px';
      ctx.font = 'italic 500 44px ' + UW.FONTS.display;
      ctx.fillStyle = '#c9c3b8';
      ctx.fillText('End', W / 2, 580);
      ctx.globalAlpha = S.P(3, 5);
      ctx.font = '500 24px ' + UW.FONTS.body;
      ctx.letterSpacing = '4px';
      ctx.fillStyle = '#97928a';
      ctx.fillText('CHARACTERS AND STORY FROM THE BOUNDLESS NEXUS', W / 2 + 2, 700);
      ctx.letterSpacing = '0px';
      ctx.restore();
    },
  });
})();
