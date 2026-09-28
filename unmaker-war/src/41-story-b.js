/* The Unmaker War — Chapter III (Distance Eaten First), IV (The Nameless Counter), V (The Apostles' Mistake). */
(function () {
  'use strict';
  const UW = window.UW;
  const { K, lerp, sat, hash, rgba, Ease, TAU } = UW;
  const R = UW.R, FX = UW.FX, BG = UW.BG, UNM = UW.UNM, BEINGS = UW.BEINGS, RIG = UW.RIG;
  const W = UW.W, H = UW.H;

  /* shared props */
  function flyingScythe(ctx, x, y, ang, t, glow) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    UW.GEAR.scythe(ctx, { Hh: 277, lw: 3, line: '#0c0808', t, J: {} }, { g: 0.5, glow: glow || 0.6, charge: 1 });
    ctx.restore();
  }
  UW.flyingScythe = flyingScythe;

  function nineHeavens(S) {
    BG.sky(['#3a1606', '#8a3a10', '#e08a2a', '#ffd070']);
    const sc = R.world(0.05);
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * 1.08 + (i / 8) * Math.PI * 0.84;
      const x = Math.cos(a) * 1500, y = -300 + Math.sin(a) * 700;
      FX.glow(sc, x, y, 160, '#ffb020', 0.45);
      FX.glow(sc, x, y, 40, '#fff4d0', 0.9, true);
    }
    BG.stars(S.T, 0.08, 40, 77, { size: 1.5, alpha: 0.3, y0: -1500, h: 700 });
    // clouds far below the floating battery
    const c = R.world(0.3);
    for (let i = 0; i < 18; i++) {
      const x = (hash(i * 3.3) - 0.5) * 5000 + ((S.T * 20) % 400);
      FX.soft(c, x, 420 + hash(i) * 200, 260 + hash(i * 2) * 200, '#f4c890', 0.4);
    }
  }
  function battery(S, tilt) {
    const ctx = R.world(1);
    const v = R.view(1);
    ctx.save();
    ctx.rotate(tilt || 0);
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, '#e8c070');
    g.addColorStop(0.1, '#9a6a2a');
    g.addColorStop(1, '#3a2410');
    ctx.fillStyle = g;
    ctx.fillRect(v.x0 - 200, 0, v.x1 - v.x0 + 400, 120);
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(v.x0 - 200, 120);
    ctx.lineTo(v.x1 + 200, 120);
    ctx.lineTo(v.x1 + 200, 170);
    ctx.lineTo(v.x0 - 200, 170);
    ctx.fill();
    for (let x = Math.floor(v.x0 / 300) * 300; x < v.x1 + 300; x += 300) FX.glow(ctx, x, 170, 90, '#ffb040', 0.5);
    ctx.restore();
  }
  function cannon(ctx, x, charge, fired, t) {
    ctx.save();
    ctx.translate(x, 0);
    ctx.fillStyle = '#b8862a';
    ctx.strokeStyle = '#2a1606';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(-40, -70);
    ctx.lineTo(40, -70);
    ctx.lineTo(60, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e8b830';
    ctx.beginPath();
    ctx.rect(-190, -110, 190, 44);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff0b0';
    ctx.beginPath();
    ctx.rect(-205, -116, 22, 56);
    ctx.fill();
    ctx.stroke();
    if (charge > 0) FX.glow(ctx, -200, -88, 70 * charge, '#ffcf6a', charge);
    ctx.restore();
  }

  /* ============================== CHAPTER III ============================== */
  UW.chapter({ id: 'ch3', num: 'Chapter III', title: 'Distance Eaten First', sub: 'The firing line of the Nine Burning Heavens', color: '#ffb03a', music: 'war', stageAll: 1, stage: { chase: 1, maeve: 1, malevolor: 1, jack: 1, seraphina: 1 } });

  UW.shot({
    dur: 10,
    caps: [[0.8, 4.6, 'The King of Nine Burning Heavens raised a firing line past the end of every map.'], [5, 9.6, 'Nothing reaches us here. We stand beyond every range it has.', 'THE KING']],
    sfx: [[0.3, 'swell', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -900], [10, -300]]), -300, K(t, [[0, 0.62], [10, 0.8]]));
      nineHeavens(S);
      battery(S);
      const ctx = S.w();
      for (let i = -6; i <= 8; i++) cannon(ctx, i * 360 + 120, 0.25 + 0.2 * Math.sin(S.T * 2 + i), false, S.T);
      for (let i = -5; i <= 6; i++) S.a('trooper', { x: i * 360 + 260, y: 0, face: -1, pose: RIG.mod('idle', { sF: 20, eF: 40 }), hold: { F: { type: 'rifle', abs: 70 } } });
      S.a('king', { x: -520, y: 0, face: -1, pose: t < 5 ? 'proud' : RIG.mod('point', { head: -6 }), talk: [[5, 0], [5.2, 1], [9.4, 1], [9.6, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 7,
    caps: [[1, 6.6, 'Far beyond the last star, something lifted its head.']],
    sfx: [[3.2, 'glitch', { v: 0.4 }]],
    draw(t, S) {
      S.cam(0, -200, K(t, [[0, 0.7], [7, 1.2]]));
      S.bg('dead', {});
      const ctx = S.w();
      UNM.draw(ctx, { x: 0, y: 0, t: S.T, eyes: S.P(3, 4.5), lean: K(t, [[0, 0.1], [3, 0]]) });
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.4, 2.6, 'Fire!', 'THE KING'], [4.6, 10.6, 'It removed the definition of between. Every muzzle was touching it at once.']],
    sfx: [[2.2, 'zap', { v: 0.8 }], [2.3, 'boom', { v: 0.6 }], [3.8, 'erase', { v: 1 }], [4.4, 'glitch', { v: 0.8 }]],
    draw(t, S) {
      const near = t > 4.2;
      S.cam(near ? K(t, [[4.2, -320], [11, -380]]) : K(t, [[0, 400], [4.2, 200]]), -260, near ? K(t, [[4.2, 1.0], [11, 1.15]]) : 0.75);
      S.shake(S.pulse(2.2, 2.9, 0.02, 0.5) * 8 + S.pulse(4.2, 5, 0.02, 0.6) * 14);
      nineHeavens(S);
      battery(S);
      const ctx = S.w();
      const charge = S.P(0.5, 2.2);
      for (let i = -6; i <= 8; i++) cannon(ctx, i * 360 + 120, near ? 0.9 : charge, t > 2.2, S.T);
      if (t > 2.2 && t < 4.2) {
        // shots racing away toward the horizon
        for (let i = -6; i <= 8; i++) {
          const u = S.P(2.2, 4.2);
          const x0 = i * 360 + 120 - 205;
          FX.beam(ctx, x0, -88, x0 - 3000 * u, -88 - 40 * u, 10, '#ffcf6a', 1 - u * 0.5, S.T);
        }
      }
      for (let i = -5; i <= 6; i++) S.a('trooper', { x: i * 360 + 260, y: 0, face: -1, pose: near ? RIG.mod('hit', { sF: 60 }) : RIG.mod('idle', { sF: 30, eF: 30 }), hold: { F: { type: 'rifle', abs: 80 } } });
      if (near) {
        // the Unmaker is simply here now: the distance was removed
        UNM.draw(ctx, { x: -760, y: 0, t: S.T, eyes: 1, armR: 0.4 });
        FX.ring(ctx, -760, -160, 330, 3, '#bdbdbd', 0.5);
        R.desat(0.45);
        if (t < 4.6) R.glitch(0.9, S.T, 12);
      }
      S.post();
    },
  });

  UW.shot({
    dur: 10,
    caps: [[0.6, 3.2, 'DROP YOUR WEAPONS!', 'VALOR'], [5.2, 9.6, 'Their own shots came out behind them. The soldiers lived because they let go.']],
    sfx: [[0.2, 'thunder', { v: 0.8 }], [3.4, 'boom', { v: 1 }], [3.7, 'boom', { v: 0.7 }], [4.1, 'boom', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -100], [10, 100]]), -280, K(t, [[0, 0.9], [10, 0.8]]));
      S.shake(S.pulse(3.4, 5, 0.05, 0.8) * 16);
      nineHeavens(S);
      battery(S);
      const ctx = S.w();
      // the dropped weapons and the shells coming out behind them
      const drop = S.P(1.2, 2.2);
      for (let i = -4; i <= 5; i++) {
        const x = i * 360 + 260;
        const gx = x - 60 + drop * 20, gy = lerp(-120, -10, Ease.in(drop));
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(lerp(1.4, 1.62, drop));
        ctx.fillStyle = '#e8b830';
        ctx.strokeStyle = '#1a0c06';
        ctx.lineWidth = 3;
        ctx.fillRect(-8, -110, 16, 150);
        ctx.strokeRect(-8, -110, 16, 150);
        ctx.restore();
        const tb = 3.4 + (i + 4) * 0.08;
        if (t > tb) FX.impact(ctx, t, tb, 0.8, gx, -40, 220, '#ffb040', i + 4);
        if (t > tb) FX.burst(ctx, t, tb, { n: 24, x: gx, y: -30, speed: [200, 700], g: 900, size: [3, 8], color: ['#e8b830', '#6a4a20', '#fff0b0'], kind: 'debris', life: [0.8, 1.6], seed: i + 20 });
      }
      for (let i = -4; i <= 5; i++) {
        S.a('trooper', { x: i * 360 + 330, y: 0, face: -1, pose: [[0, 'hit'], [1.2, RIG.mod('hit', { sF: 70, eF: 10 })], [2.2, 'crouch'], [5, 'crouch']], hold: t < 1.3 ? { F: { type: 'rifle', abs: 90 } } : { F: null } });
      }
      // Valor streaks in with lightning around his arms
      S.a('valor', { x: [[0, 900], [1.2, 200]], xe: 'out3', y: [[0, -500], [1.2, -260]], face: -1, pose: t < 1.2 ? 'flyFast' : 'hover', glow: 1, eyeGlow: 1, talk: [[0.6, 0], [0.7, 1], [3, 1], [3.2, 0]] });
      if (t < 1.3) FX.trail(ctx, [[1400, -600], [900, -500], [lerp(900, 200, S.P(0, 1.2, 'out3')), lerp(-500, -380, S.P(0, 1.2))]], 5, '#6fd0ff', 1);
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[0.6, 4.4, 'The battery began to fall. Tyrus caught it. Caelum held the sky still around it.'], [4.8, 8.8, 'It never attacked their weapons. It removed the space their weapons needed.']],
    sfx: [[0.4, 'rumble', { v: 0.8 }], [1.6, 'roar', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [9, -80]]), -200, K(t, [[0, 0.8], [9, 0.9]]));
      nineHeavens(S);
      const tilt = K(t, [[0, 0.02], [1.5, 0.08], [3.2, 0.03], [9, 0.0]]);
      battery(S, tilt);
      const ctx = S.w();
      // Caelum's skylock: nested pressure fronts, disturbed air
      for (let i = 0; i < 5; i++) {
        const r = 300 + i * 160 + Math.sin(S.T * 2 + i) * 10;
        ctx.save();
        ctx.strokeStyle = rgba('#dfefff', 0.18);
        ctx.lineWidth = 4;
        ctx.setLineDash([30, 20]);
        ctx.beginPath();
        ctx.ellipse(500, -500, r, r * 0.45, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      S.a('caelum', { x: 500, y: -520, face: -1, pose: 'castUp', glow: 1 });
      // a broken section of the battery, held up on Tyrus's hands
      const lift = S.P(0.6, 2.2, 'out');
      ctx.save();
      ctx.translate(-190, lerp(-150, -470, lift));
      ctx.rotate(lerp(0.35, 0.08, lift) + Math.sin(S.T * 3) * 0.01);
      ctx.fillStyle = '#9a6a2a';
      ctx.strokeStyle = '#2a1606';
      ctx.lineWidth = 4;
      ctx.fillRect(-420, -60, 840, 70);
      ctx.strokeRect(-420, -60, 840, 70);
      ctx.fillStyle = '#e8c070';
      ctx.fillRect(-420, -60, 840, 12);
      cannon(ctx, 180, 0.2, false, S.T);
      ctx.restore();
      S.a('tyrusTitan', { x: -200, y: 0, face: 1, pose: [[0, 'crouch'], [2.2, 'lift'], [9, 'lift']], glow: 0.2 });
      S.a('king', { x: 260, y: 0, face: -1, pose: RIG.mod('tired', { head: 20 }) });
      S.post();
    },
  });

  UW.portraitShot({
    id: 'king', dur: 7, expr: 'shock', s0: 460, s1: 520,
    bg: ['#3a1606', '#140804', '#ff9a30'],
    talk: [[0.8, 6.2]],
    caps: [[0.8, 6.6, 'It was never out of range. Nothing is.', 'THE KING']],
  });

  /* ============================== CHAPTER IV ============================== */
  UW.chapter({ id: 'ch4', num: 'Chapter IV', title: 'The Nameless Counter', sub: 'The Omnilords at the Tapestry', color: '#e6ecff', music: 'fate', stageAll: 1, stage: { chase: 1, maeve: 1, malevolor: 1, jack: 1, seraphina: 1 } });

  UW.shot({
    dur: 10,
    caps: [[0.6, 4.2, 'The four Omnilords came down to the Tapestry of Narratives.'], [4.6, 9.6, 'Everything that exists has a thread. I will find its.', 'EZARA']],
    sfx: [[0.4, 'chime', { v: 0.6 }], [4.6, 'bell', { v: 0.5, f: 330 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 0], [10, 60]]), -380, K(t, [[0, 0.62], [10, 0.72]]));
      S.bg('tapestry');
      const bob = (i) => Math.sin(S.T * 0.8 + i) * 10;
      S.a('aegis', { x: -760, y: -120 + bob(0), face: 1, pose: 'stand' });
      S.a('varakal', { x: 760, y: -60 + bob(1), face: -1, pose: RIG.mod('idle', { head: Math.sin(S.T * 3) * 10 }) });
      S.a('khalathos', { x: -380, y: 40 + bob(2), face: 1, pose: 'proud' });
      S.a('ezara', { x: 300, y: -40 + bob(3), face: -1, pose: RIG.mod('cast', { sF: 20, sB: 30 }), talk: [[4.6, 0], [4.8, 1], [9.2, 1], [9.4, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.4, 3.6, 'Aegis Primus locked every motion into place.'], [3.8, 6.6, 'Varakal made every outcome random.'], [7, 10.6, 'There is nothing in it to decay.', "KHAL'ATHOS"]],
    sfx: [[0.4, 'bell', { v: 0.6, f: 220 }], [3.8, 'glitch', { v: 0.6 }], [7, 'rumble', { v: 0.5 }]],
    draw(t, S) {
      S.cam(0, -260, 0.9);
      S.bg('tapestry');
      const ctx = S.w();
      const ux = 0, uy = 0;
      // Order: a perfect geometric cage
      const order = S.pulse(0.3, 4.2, 0.4, 0.4);
      if (order > 0) {
        ctx.save();
        ctx.strokeStyle = rgba('#ffd860', order);
        ctx.lineWidth = 3;
        for (let i = -4; i <= 4; i++) {
          ctx.beginPath();
          ctx.moveTo(ux + i * 60, -560);
          ctx.lineTo(ux + i * 60, 40);
          ctx.stroke();
        }
        for (let j = 0; j <= 10; j++) {
          ctx.beginPath();
          ctx.moveTo(ux - 240, -560 + j * 60);
          ctx.lineTo(ux + 240, -560 + j * 60);
          ctx.stroke();
        }
        ctx.restore();
        FX.glow(ctx, ux, -260, 400, '#ffd860', order * 0.3);
      }
      // Chaos: the cage breaks into random colors
      const chaos = S.pulse(3.8, 7, 0.2, 0.6);
      if (chaos > 0) {
        for (let i = 0; i < 30; i++) {
          const f = Math.floor(S.T * 10) + i;
          const c = ['#ff3ad8', '#3ad8ff', '#ffe03a', '#7aff5a', '#ff5a3a'][f % 5];
          FX.glow(ctx, ux + (hash(f * 1.3) - 0.5) * 900, -280 + (hash(f * 2.9) - 0.5) * 700, 50 + hash(f) * 80, c, 0.6 * chaos);
        }
      }
      // Entropy: dust waves pass straight through, finding nothing to hold
      const ent = S.pulse(6.8, 11, 0.5, 0.8);
      if (ent > 0) {
        for (let i = 0; i < 4; i++) {
          const x = lerp(-1200, 1200, ((t - 6.8) * 0.35 + i * 0.25) % 1);
          FX.smoke(ctx, t, 6.8, { n: 10, x, y: -260, rx: 60, dir: 0, spread: 0.6, speed: 40, size: 90, color: '#6a5234', alpha: 0.35 * ent, life: 4, seed: i });
        }
      }
      UNM.draw(ctx, { x: ux, y: uy, t: S.T, eyes: 1, flicker: chaos * 0.3, jitter: 1 + chaos * 2 });
      S.a('aegis', { x: -820, y: -100, face: 1, pose: 'cast', glow: order });
      S.a('varakal', { x: 820, y: -60, face: -1, pose: RIG.mod('cast', { sF: Math.sin(S.T * 7) * 30 }), glow: chaos });
      S.a('khalathos', { x: -560, y: 40, face: 1, pose: t > 6.8 ? 'cast' : 'proud', talk: [[7, 0], [7.2, 1], [10.2, 1], [10.4, 0]] });
      S.post();
    },
  });

  UW.shot({
    dur: 12,
    caps: [[0.4, 4.4, 'Ezara wrote its name into the Tapestry, and bound it to a fate.'], [5.4, 11.6, 'It erased the bond between itself and the name, and stepped outside the prophecy.']],
    sfx: [[0.6, 'choir', { v: 0.5 }], [5.6, 'erase', { v: 0.9 }], [7.6, 'shatter', { v: 0.6 }]],
    draw(t, S) {
      S.cam(K(t, [[0, -100], [12, 100]]), -300, K(t, [[0, 0.75], [12, 0.85]]));
      S.bg('tapestry');
      const ctx = S.w();
      // the written name: glowing glyph string above
      const write = S.P(0.6, 4.6);
      const gx0 = -700, gy = -680;
      const n = 22;
      const burn = S.P(6.8, 10.5);
      for (let i = 0; i < Math.floor(n * write); i++) {
        const gone = hash(i * 3.3) < burn * 1.1;
        if (gone) continue;
        const fall = burn * 200 * hash(i * 1.7);
        FX.rune(ctx, gx0 + i * 64, gy + fall, 44, i * 5 + 11, burn > 0 ? '#ffb070' : '#ffe8a8', 1 - burn * 0.5, 4);
      }
      // threads binding toward the Unmaker
      const ux = K(t, [[0, 0], [5.4, 0], [6.6, 520]], 'io');
      const bind = S.pulse(2.5, 6.4, 1, 0.3);
      for (let i = 0; i < 9; i++) {
        FX.thread(ctx, gx0 + i * 150, gy + 20, (t < 5.6 ? ux : 0) + (i - 4) * 12, -260 + (i - 4) * 20, 120, '#e6ecff', 2, bind, S.T, i);
      }
      // after it steps out, the threads strike the empty title where it stood
      const strike = S.pulse(5.8, 8.2, 0.15, 1.2);
      if (strike > 0) {
        ctx.save();
        ctx.setLineDash([12, 10]);
        ctx.strokeStyle = rgba('#e6ecff', 0.8 * strike);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -170, 60, 170, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
        FX.impact(ctx, t, 5.8, 1.2, 0, -200, 300, '#e6ecff', 5);
      }
      UNM.draw(ctx, { x: ux, y: 0, t: S.T, eyes: 1, flicker: S.pulse(5.4, 6.6, 0.1, 0.1) * 0.8 });
      S.a('ezara', { x: -900, y: -80, face: 1, pose: t < 5.8 ? 'cast' : RIG.mod('hit', { lean: 10 }) });
      if (t > 5.4 && t < 6) R.glitch(0.8, S.T, 21);
      S.post();
    },
  });

  UW.portraitShot({
    id: 'ezara', dur: 7, expr: 'shock', s0: 470, s1: 510,
    bg: ['#1a1830', '#06060e', '#bfc8ff'],
    talk: [[1.2, 5.6]],
    caps: [[1.2, 6.6, 'It stepped outside its own name.', 'EZARA']],
    fx(t, S) {
      const ctx = S.sc();
      for (let i = 0; i < 16; i++) FX.thread(ctx, 200 + i * 100, 1080, 960 + (i - 8) * 30, 200, 80, '#e6ecff', 1.5, 0.35, S.T, i);
    },
  });

  /* ============================== CHAPTER V ============================== */
  UW.chapter({ id: 'ch5', num: 'Chapter V', title: "The Apostles' Mistake", sub: 'The Red Hall', color: '#ff3b3b', music: 'rage', stageAll: 1, stage: { malevolor: 1, chase: 1 } });

  const APOSTLES = [
    ['krell', 330], ['morphic', 460], ['aethelred', 590],
    ['cyrus', 900], ['vesper', 1020], ['solari', 1140], ['ignis', 1260], ['apostleAsh', 1360], ['lyra', 1470], ['xenon', 1580], ['boreas', 1710], ['nyktos', 1840],
  ];

  UW.shot({
    dur: 10,
    caps: [[0.6, 4.2, 'While the war raged, the Twelve Apostles made their own plans.'], [4.6, 9.6, 'While the gods stare into the dark, we cleanse the malice from the Nexus. Begin with him.', 'CYRUS']],
    sfx: [[0.3, 'rumble', { v: 0.4 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 700], [10, 900]]), -260, K(t, [[0, 0.58], [10, 0.62]]));
      S.bg('redHall');
      APOSTLES.forEach(([id, x], i) => S.a(id, { x, y: i < 3 ? 0 : -20, face: -1, pose: i < 3 ? 'guard' : 'idle', talk: id === 'cyrus' ? [[4.6, 0], [4.8, 1], [9.4, 1], [9.6, 0]] : undefined }));
      S.a('malevolor', { x: -200, y: 0, face: 1, pose: 'scytheRest' });
      // resurrection seals above each Apostle
      const ctx = S.w();
      APOSTLES.forEach(([id, x], i) => FX.runeRing(ctx, S.T, x, -380, 40, 6, '#ffd0a0', 0.5, i * 7, 0.6));
      S.post();
    },
  });

  UW.shot({
    dur: 9,
    caps: [[0.4, 3.4, 'Cyrus went into his mind, looking for a lever.'], [5.4, 8.8, 'He found the Nexus.']],
    sfx: [[0.3, 'zap', { v: 0.5 }], [3.6, 'glitch', { v: 0.8 }], [3.8, 'heartbeat', { v: 0.8 }], [6.2, 'heartbeat', { v: 0.9 }]],
    draw(t, S) {
      const flash = t > 3.6;
      if (!flash) {
        S.cam(K(t, [[0, 300], [3.6, 350]]), -240, 1.05);
        S.bg('redHall');
        const ctx = S.w();
        S.a('malevolor', { x: 0, y: 0, face: 1, pose: [[0, 'scytheRest'], [1.6, RIG.mod('hit', { head: -20, lean: -10 })]], glow: 0.3 });
        S.a('cyrus', { x: 700, y: 0, face: -1, pose: 'cast', glow: 1, eyeGlow: 1 });
        for (let i = 0; i < 5; i++) FX.lightning(ctx, 640, -250, 30, -240 + (i - 2) * 16, Math.floor(S.T * 14) + i * 7, '#bfe6ff', 2, 0.8, 1);
      } else {
        // memory: a cold white room, a boy in restraints
        S.cam(0, -160, K(t, [[3.6, 1.2], [9, 1.5]]));
        S.bg('lab');
        const ctx = S.w();
        ctx.fillStyle = '#6a767c';
        ctx.fillRect(-260, -110, 520, 30);
        ctx.fillRect(-240, -80, 20, 80);
        ctx.fillRect(220, -80, 20, 80);
        S.a('ash', { x: 0, y: -110, face: 1, pose: 'lieBack', silhouette: 0.7, silC: '#20282c', buffer: true });
        ctx.strokeStyle = '#2a3236';
        ctx.lineWidth = 8;
        for (const x of [-140, 40, 160]) {
          ctx.beginPath();
          ctx.moveTo(x, -150);
          ctx.lineTo(x, -80);
          ctx.stroke();
        }
        R.desat(0.6);
        if ((t * 7) % 1 < 0.15) R.flash('#ffffff', 0.4, 'lighter');
        R.glitch(0.3 + S.pulse(3.6, 4.2, 0.05, 0.3), S.T, 31);
      }
      S.post();
    },
  });

  UW.portraitShot({
    id: 'malevolor', dur: 8, s0: 480, s1: 560,
    expr: (t) => (t < 2 ? 'pain' : 'rage'),
    eyeGlow: (t) => UW.sat((t - 1.5) / 1.5),
    bg: ['#2a0406', '#050000', '#ff1010'],
    talk: [[3.4, 7.2]],
    caps: [[3.4, 7.6, 'You should not have opened that door.', 'MALEVOLOR']],
    sfx: [[1.5, 'roar', { v: 0.7 }]],
    fx(t, S) {
      const ctx = S.sc();
      const k = S.P(1.5, 4);
      FX.glow(ctx, W / 2, 900, 700, '#ff1010', 0.3 * k);
      if (t > 1.5) R.shake(S.T, 3 * k, 30);
    },
  });

  UW.shot({
    dur: 11,
    caps: [[0.4, 3.4, 'He threw the scythe past their shield wall. They thought it missed.'], [4.6, 10.6, 'It came back through the formation from behind. Armor, resurrection seals, and soul tethers were cut in one pass.']],
    sfx: [[1.0, 'whoosh', { v: 1 }], [4.4, 'whoosh', { v: 1 }], [4.8, 'slash', { v: 1 }], [5.2, 'slash', { v: 0.9 }], [5.6, 'shatter', { v: 0.8 }], [6.8, 'choir', { v: 0.5, f: 110 }]],
    draw(t, S) {
      S.cam(K(t, [[0, 600], [4.4, 800], [6, 900], [11, 850]]), -260, K(t, [[0, 0.55], [11, 0.6]]));
      S.shake(S.pulse(4.6, 6.2, 0.05, 0.6) * 12);
      S.bg('redHall');
      const ctx = S.w();
      // the returning edge sweeps right to left through the formation
      const ret = S.P(4.5, 6.0, 'in');
      const sx = lerp(2400, -100, ret);
      APOSTLES.forEach(([id, x], i) => {
        const hitT = 4.5 + (1 - (x + 100) / 2500) * 1.5;
        const hit = t > hitT;
        const seal = hit ? 1 - S.P(hitT, hitT + 0.6) : 0.5;
        if (seal > 0) FX.runeRing(ctx, S.T, x, -380, 40, 6, '#ffd0a0', seal, i * 7, 0.6);
        if (hit && t < hitT + 0.5) FX.shatter && 0;
        S.a(id, { x, y: i < 3 ? 0 : -20, face: -1, pose: hit ? [[hitT, 'hitHard'], [hitT + 0.6, 'lieBack']] : t > 1.5 ? 'idle' : 'guard', erase: hit ? S.P(hitT + 1, hitT + 4) * 0.9 : 0, eraseStatic: true });
        if (hit && t < hitT + 3) {
          // the deadlights take what remains: souls drawn toward him
          const u = S.P(hitT + 0.5, hitT + 3);
          const px = lerp(x, -200, Ease.in(u)), py = lerp(-200, -250, u) + Math.sin(u * 9 + i) * 30;
          if (u > 0 && u < 1) FX.glow(ctx, px, py, 24, '#f5e6c8', 1 - u);
        }
      });
      if (t > 4.5 && t < 6.4) {
        flyingScythe(ctx, sx, -230, -S.T * 16, S.T, 1);
        FX.slash(ctx, sx + 200, -230, 220, -2.2, 0.6, 60, '#e0101c', 1, 0);
      }
      if (t > 0.9 && t < 3) flyingScythe(ctx, lerp(-60, 2600, S.P(0.9, 2.4)), lerp(-300, -560, S.P(0.9, 2.4)), -S.T * 16, S.T, 1);
      S.a('malevolor', { x: -200, y: 0, face: 1, pose: [[0, 'throwWind'], [0.9, 'throw'], [2, 'idle'], [4.3, 'reach'], [6.2, 'roar']], hold: t < 0.9 || t > 6.1 ? { F: { type: 'scythe', abs: t < 0.9 ? -60 : 10, g: 0.45 } } : { F: null }, glow: 0.9, eyeGlow: 1 });
      S.post();
    },
  });

  /* The hunt: one survivor at a time */
  const HUNT = [
    ['krell', 'KRELL', 'Absolute density did not save him.', '#8a8c8e'],
    ['vesper', 'VESPER', 'She pinned him in time. He waited it out.', '#c8a8ff'],
    ['nyktos', 'NYKTOS', 'There was nothing left to phase through.', '#a878ff'],
    ['solari', 'SOLARI', 'Dead light, cut in half.', '#ffe8a0'],
    ['ignis', 'IGNIS AND ASH', 'They burned together. They fell together.', '#ff7a2a'],
    ['boreas', 'BOREAS', 'The wind stopped.', '#bfe8ff'],
  ];
  UW.shot({
    dur: 12,
    caps: [[0.2, 11.8, 'Afterward, he hunted the survivors down, one at a time.']],
    sfx: HUNT.map((h, i) => [i * 2 + 1.1, 'slash', { v: 0.9 }]),
    capY: 1000,
    draw(t, S) {
      const i = Math.min(HUNT.length - 1, Math.floor(t / 2));
      const lt = t - i * 2;
      const [id, name, line, col] = HUNT[i];
      S.cam(0, -160, 1.4 + lt * 0.05);
      const ctx = S.sc();
      ctx.fillStyle = '#060304';
      ctx.fillRect(0, 0, W, H);
      FX.glow(ctx, W / 2, H / 2, 600, col, 0.18);
      S.a(id, { x: 60, y: 0, face: -1, pose: lt < 1.1 ? 'guard' : 'hitHard', silhouette: lt < 1.1 ? 0.9 : 1, silC: '#000', buffer: true, tint: col, tintA: 0.35 });
      const w = S.w();
      if (lt > 1.0) FX.slash(w, 60, -140, 260, -2.6, 0.8, 70, '#e0101c', S.P(i * 2 + 1.0, i * 2 + 1.25), S.P(i * 2 + 1.3, i * 2 + 1.9));
      const sc = S.sc();
      sc.save();
      sc.textAlign = 'left';
      sc.font = '600 64px ' + UW.FONTS.display;
      sc.fillStyle = rgba('#f2ede4', Math.min(1, lt * 3) * (1 - S.P(i * 2 + 1.6, i * 2 + 2)));
      sc.fillText(name, 180, 300);
      sc.font = 'italic 500 34px ' + UW.FONTS.display;
      sc.fillStyle = rgba(col, Math.min(1, lt * 3) * (1 - S.P(i * 2 + 1.6, i * 2 + 2)));
      sc.fillText(line, 180, 350);
      sc.restore();
      if (lt > 1.1 && lt < 1.3) R.flash('#ff2020', 0.35);
    },
  });

  UW.shot({
    dur: 10, fadeOut: 1,
    caps: [[2.4, 4.6, 'Adrian.', 'APHRODITE'], [5.6, 9.6, 'He did not answer. He did not pull away either.']],
    sfx: [[2.4, 'chime', { v: 0.4 }]],
    music: 'grief',
    draw(t, S) {
      S.cam(K(t, [[0, 80], [10, 40]]), -200, K(t, [[0, 1.3], [10, 1.6]]));
      S.bg('redHall');
      const ctx = S.w();
      FX.smoke(ctx, t, 0, { n: 16, x: 300, y: -40, rx: 900, speed: 20, size: 120, color: '#2a0a0c', alpha: 0.4, life: 10, seed: 3 });
      S.a('malevolor', { x: -60, y: 0, face: 1, pose: RIG.mod('tired', { head: 10 }), hold: { F: { type: 'scythe', abs: 12, g: 0.45, charge: 0.3 } }, eyeGlow: [[0, 0.8], [5, 0.1]] });
      S.a('aphrodite', { x: [[0, 520], [2.2, 130]], face: -1, pose: t < 2.2 ? RIG.walk(S.T, 0.8) : [[2.2, 'idle'], [3, RIG.mod('reach', { lean: 0, sF: 70, eF: 50, head: -4 })]], talk: [[2.4, 0], [2.6, 1], [3.6, 1], [3.8, 0]] });
      S.post();
    },
  });
})();
