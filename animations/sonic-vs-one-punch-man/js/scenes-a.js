'use strict';
/* Act one: title, City Z, Sonic's run, the stolen groceries, the chase, and the standoff.
   Each scene draws local time lt (seconds). Lines are [start, end, speaker, text, opts];
   cues are [time, sound, arg]. Times are local to the scene. */

const SCENES = [];
function scene(d) {
  SCENES.push(
    Object.assign({ fadeIn: 0.6, fadeOut: 0.6, fadeInColor: '#000', fadeOutColor: '#000', cues: [], lines: [], music: [[0, 'none']] }, d)
  );
}

const SS = 0.8;
const ZS = 1;
const sonTop = (x, y, s = SS, dir = 1) => [x + dir * 10 * s, y - 182 * s];
const saiTop = (x, y, s = ZS, dir = 1) => [x + dir * 5 * s, y - 236 * s];
const bagIn = (s = 1, rot = 0) => (ctx, hx, hy) => drawBag(ctx, hx, hy + 6, s, rot);
const dogIn = (ctx, hx, hy) => drawChiliDog(ctx, hx + 2, hy + 14, 0.9, -0.3);

function drawBarricade(ctx, x, y) {
  seg(ctx, [[x - 60, y], [x - 48, y - 86]], 6, '#d7d2c4');
  seg(ctx, [[x + 60, y], [x + 48, y - 86]], 6, '#d7d2c4');
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 72, y - 92, 144, 30);
  ctx.clip();
  for (let i = -6; i < 8; i++) {
    ctx.fillStyle = i % 2 ? '#ff7a1a' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - 72 + i * 22, y - 62);
    ctx.lineTo(x - 72 + i * 22 + 22, y - 62);
    ctx.lineTo(x - 72 + i * 22 + 52, y - 92);
    ctx.lineTo(x - 72 + i * 22 + 30, y - 92);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 72, y - 92, 144, 30);
  for (const cx of [x - 100, x + 98]) {
    poly(ctx, [[cx - 16, y], [cx - 5, y - 46], [cx + 5, y - 46], [cx + 16, y]], '#ff7a1a', 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 9, y - 30, 18, 7);
  }
}

/* ---------- 1. Title ---------- */

scene({
  id: 'title',
  name: 'Title',
  dur: 14,
  fadeIn: 0.01,
  music: [[0, 'none'], [5, 'speed']],
  cues: [[1.3, 'whoosh'], [2.9, 'whoosh'], [4.85, 'boom'], [5.0, 'hit'], [5.6, 'hit'], [6.2, 'punch']],
  draw(ctx, lt) {
    const amp = lt > 4.85 ? 16 * (1 - prog(lt, 4.85, 6.4)) : 0;
    const [qx, qy] = shakeXY(lt, amp);
    ctx.save();
    ctx.translate(qx, qy);
    sky(ctx, 'night');
    stars(ctx, lt, prog(lt, 0, 2));
    if (lt > 4.85) rays(ctx, 640, 380, lt, { a: 0.3 * prog(lt, 4.85, 5.6), c1: '#1d4ed8', c2: '#f5b700' });
    if (lt < 5.3) {
      streak(ctx, -150, 700, 640, 380, E.in(prog(lt, 1.3, 4.85)), '#4f8cff', 18);
      streak(ctx, 1430, 40, 640, 380, E.in(prog(lt, 2.9, 4.85)), '#ffd84a', 18);
    }
    if (lt > 4.85) flash(ctx, 0.75 * (1 - prog(lt, 4.85, 5.5)));
    burst(ctx, 640, 380, prog(lt, 4.85, 5.7), 260, { c1: '#ffffff', c2: '#ffe27a' });
    shock(ctx, 640, 380, prog(lt, 4.85, 6.1), 760, { w: 28 });
    const sx = kf(lt, [[5.0, -300], [5.7, 175, E.out3]]);
    const zx = kf(lt, [[5.6, 1560], [6.3, 1105, E.out3]]);
    if (lt > 5.0) drawSonic(ctx, sx, 770, 1.7, 1, { t: lt, expr: 'grin', ...POSE.sonicThumb(), blink: blinkAt(lt, 3, 4) });
    if (lt > 5.6) drawSaitama(ctx, zx, 800, 1.5, -1, { t: lt, wind: 0.5, ...POSE.saiCross(), blink: blinkAt(lt, 3.5) });
    const a = slam(lt - 5.0);
    const b = slam(lt - 5.6);
    const c = slam(lt - 6.2);
    if (a) bigText(ctx, 'SONIC', 640, 215, 128, { fill: '#2f6bff', stroke: '#ffffff', sw: 16, scale: a.s, alpha: a.a, rot: -0.04, shadow: INK });
    if (b) bigText(ctx, 'VS', 640, 352, 150, { fill: '#ff3b3b', stroke: '#ffffff', sw: 16, scale: b.s, alpha: b.a, rot: 0.06, shadow: INK });
    if (c) bigText(ctx, 'ONE PUNCH MAN', 640, 488, 84, { fill: '#ffd21f', stroke: INK, sw: 14, scale: c.s, alpha: c.a, maxW: 740, rot: -0.02, shadow: '#ffffff' });
    const st = prog(lt, 7.6, 8.6);
    if (st > 0) bigText(ctx, 'a fan-made cartoon', 640, 578, 30, { fill: '#ffffff', alpha: st, face: FONT_T, stroke: INK, sw: 6 });
    ctx.restore();
  },
});

/* ---------- 2. City Z ---------- */

const L2 = [
  [0.6, 5.6, 'narrator', 'CITY Z. Monsters attack here every single week.'],
  [5.8, 10.4, 'narrator', 'Lucky for everyone, one hero lives here.'],
  [7.2, 11.2, 'saitama', 'Cabbage was half price today...', { think: true }],
  [11.6, 15.6, 'saitama', "That's dinner for three days.", { think: true }],
  [18.6, 24.8, 'crab', 'I AM THE CRAB EMPEROR! HAND OVER YOUR GROCERIES, HUMAN!', { shout: true }],
  [25.4, 27.8, 'saitama', '...No.'],
  [32.2, 35.4, 'saitama', '...Boring.'],
  [36.2, 41.2, 'narrator', 'One punch, every time. That is his whole problem.'],
];

scene({
  id: 'cityz',
  name: 'City Z',
  dur: 42,
  lines: L2,
  music: [[0, 'calm'], [16, 'tension'], [29.4, 'none'], [32, 'calm']],
  cues: [[16, 'rumble'], [17, 'whoosh'], [18, 'thud'], [29.45, 'punch'], [29.5, 'boom'], [31.6, 'twinkle'], [38.6, 'zip']],
  draw(ctx, lt) {
    const walkT = clamp(lt, 1, 16) - 1 + Math.max(0, lt - 36);
    const cam = 200 + 74 * walkT - 520;
    const camY = kf(lt, [[0, 300], [3.4, 0]]);
    const amp = 6 * env(lt, 16, 18.4, 0.4) + 14 * env(lt, 18, 18.7, 0.04) + 18 * env(lt, 29.45, 30.5, 0.04);
    const [qx, qy] = shakeXY(lt, amp);
    const G = CITY_G;
    const X = 520;
    ctx.save();
    ctx.translate(qx, qy);
    cityBG(ctx, cam, { camY });
    if (lt > 38.4 && lt < 40.4) streak(ctx, -100, 300 + camY, 1400, 300 + camY, (lt - 38.4) / 1.2, '#4f8cff', 5, 0.5);
    ctx.save();
    ctx.translate(0, camY);

    let cx = 1000;
    let cy = G;
    let crot = 0;
    let cs = 1;
    if (lt < 18) {
      const u = prog(lt, 17, 18);
      cx = lerp(1500, 1000, u);
      cy = G - Math.sin(Math.PI * u) * 260;
    } else if (lt >= 28 && lt < 29.45) cx = kf(lt, [[28, 1000], [29.45, 725, E.in]]);
    else if (lt >= 29.45) {
      const u = prog(lt, 29.45, 31.6);
      cx = lerp(725, 1180, E.out(u));
      cy = lerp(G, 70, E.out(u));
      crot = u * 14;
      cs = lerp(1, 0.05, E.out(u));
    }
    if (lt > 17 && lt < 31.6) {
      const claw = lt < 18.4 ? 0.2 : lt > 28 ? 1 : 0.55 + 0.25 * Math.sin(lt * 3);
      drawCrab(ctx, cx, cy, cs, -1, { t: lt, rot: crot, claw, snap: lt * 9, walk: lt * 12, talk: speaking(lt, L2, 'crab') });
    }
    if (lt > 31.5 && lt < 32.6) star4(ctx, 1180, 70, 28 * env(lt, 31.5, 32.6, 0.15), lt * 4, '#ffffff');
    puffs(ctx, 1000, G, prog(lt, 18, 19.4), { n: 10, spread: 170, seed: 3, size: 32 });

    const walking = (lt > 1 && lt < 16) || lt > 36;
    let pose = walking ? POSE.saiWalk(walkT * 7.4) : {};
    const pk = lt < 29.15 ? 0 : lt < 29.45 ? E.out3(prog(lt, 29.15, 29.45)) : lt < 30.3 ? 1 : 1 - E.inOut(prog(lt, 30.3, 30.9));
    if (pk > 0) pose = POSE.saiPunch(pk);
    else if (lt > 31.2 && lt < 35.6) pose = POSE.saiLookFist();
    const bagHeld = lt < 26.2 || lt > 35.6;
    if (!bagHeld) drawBag(ctx, X + 62, G - 60, 1);
    drawSaitama(ctx, X, G, ZS, 1, {
      ...pose,
      t: lt,
      blink: blinkAt(lt, 3.3),
      talk: speaking(lt, L2, 'saitama'),
      carry: bagHeld ? bagIn(1) : null,
      look: lt > 18 && lt < 29 ? 1 : 0,
      wind: lt > 29.45 && lt < 31 ? 0.9 : 0.15,
    });
    if (lt > 29.45 && lt < 30.6) focusLines(ctx, X + 95, G - 170, lt, { alpha: 0.45 * (1 - prog(lt, 29.45, 30.6)) });
    burst(ctx, X + 100, G - 168, prog(lt, 29.45, 30.2), 170, { c2: '#ffe27a' });
    ctx.restore();
    sfx(ctx, 'ONE PUNCH!', 800, 230, 92, lt, 29.5, 2.4, { rot: -0.1 });
    ctx.restore();
    talk(ctx, lt, L2, { saitama: saiTop(X, G + camY), crab: [cx - 50, cy - 280] });
  },
});

/* ---------- 3. The Blue Blur ---------- */

const LOOP3 = 4400;
const V3 = 750;
const REST3 = LOOP3 + V3 * 9.6;
const CLIFF3 = REST3 + 110;
const ROBOT3 = LOOP3 + V3 * 5.2;

function sx3(lt) {
  if (lt < 6) return -100 + V3 * lt;
  if (lt < 7.4) return LOOP3;
  if (lt < 16) return LOOP3 + V3 * (lt - 7.4);
  if (lt < 18) {
    const u = lt - 16;
    return LOOP3 + V3 * 8.6 + V3 * (u - (u * u) / 4);
  }
  if (lt < 32.6) return REST3;
  return REST3 + 2600 * (lt - 32.6) * (lt - 32.6);
}

function tAt3(wx) {
  return wx < LOOP3 ? (wx + 100) / V3 : 7.4 + (wx - LOOP3) / V3;
}

const RINGS3 = [];
for (let i = 0; i < 10; i++) RINGS3.push([1000 + i * 110, HILL_G - 80]);
for (let i = 0; i < 6; i++) RINGS3.push([LOOP3 + 700 + i * 110, HILL_G - 80]);
for (let i = 0; i < 4; i++) {
  const t = 12.0 + i * 0.15;
  RINGS3.push([LOOP3 + V3 * (t - 7.4), HILL_G - 34 - Math.sin((Math.PI * (t - 11.9)) / 0.7) * 170]);
}
for (let i = 0; i < 8; i++) RINGS3.push([ROBOT3 + 500 + i * 110, HILL_G - 80]);

const L3 = [
  [19.6, 23.2, 'sonic', "So THAT's City Z."],
  [23.6, 28.8, 'sonic', 'Word is, some bald guy there wins every fight with one punch.'],
  [29.2, 32.4, 'sonic', "Heh. Let's see if he can keep up with ME!"],
];

scene({
  id: 'blur',
  name: 'The Blue Blur',
  dur: 34,
  lines: L3,
  music: [[0, 'speed'], [18.5, 'calm']],
  cues: [
    ...RINGS3.map(([wx]) => [tAt3(wx), 'ring']),
    [6, 'whoosh'],
    [11.9, 'spring'],
    [12.6, 'hit'],
    [12.65, 'twinkle'],
    [16.1, 'skid'],
    [32.6, 'whoosh'],
    [32.8, 'boom'],
  ],
  draw(ctx, lt) {
    const x = sx3(lt);
    let cam = lt < 6 ? Math.max(0, x - 520) : lt < 7.4 ? LOOP3 - 520 : Math.min(x, REST3) - 520;
    cam = lerp(cam, REST3 - 430, E.inOut(prog(lt, 16.5, 19.5)));
    const cliff = CLIFF3 - cam;
    hillsBG(ctx, cam, { t: lt, cliffX: cliff < W + 60 ? cliff : null });
    const G = HILL_G;
    if (Math.abs(LOOP3 - cam - 640) < 1000) drawLoop(ctx, LOOP3 - cam, G, 150);
    if (lt < 16.5) speedLines(ctx, lt, { n: 24, alpha: 0.35, speed: 2600, y0: 90, y1: 520 });

    let count = 0;
    RINGS3.forEach(([rx, ry], i) => {
      const got = x >= rx;
      if (got) count++;
      const sxr = rx - cam;
      if (sxr < -40 || sxr > W + 40) return;
      if (!got) drawRing(ctx, sxr, ry, lt + i * 0.13, 1);
      else {
        const age = lt - tAt3(rx);
        if (age < 0.35) star4(ctx, sxr, ry, 22 * (1 - age / 0.35), age * 8, '#fff6b0');
      }
    });

    if (lt < 12.6) drawRobot(ctx, ROBOT3 - cam, G, lt, 1.1);
    burst(ctx, ROBOT3 - cam, G - 30, prog(lt, 12.6, 13.1), 90, { c2: '#ffb347' });
    if (lt > 12.6 && lt < 15.5) {
      const u = lt - 12.6;
      drawBird(ctx, ROBOT3 - cam + u * 160, G - 40 - u * 170, lt, 1.2);
    }

    let sxs = x - cam;
    let sy = G;
    let rot = 0;
    if (lt >= 6 && lt < 7.4) {
      const ph = TAU * prog(lt, 6, 7.4);
      sxs = LOOP3 + 150 * Math.sin(ph) - cam;
      sy = G - 150 + 150 * Math.cos(ph);
      rot = -ph;
    }
    sy -= hop(lt, 11.9, 12.6, 170) + hop(lt, 12.6, 13.25, 110);
    let o;
    if (lt < 16) o = lt > 11.9 && lt < 13.25 ? { ball: 1, spin: lt * 25 } : { ...POSE.sonicDash(lt * 30), quillWob: 1.5, expr: 'grin' };
    else if (lt < 18) o = { ...POSE.sonicSkid(), expr: 'grin' };
    else if (lt < 32.2) o = lt < 23 ? { ...POSE.sonicTap(lt), look: 1 } : lt > 29 ? { ...POSE.sonicThumb(), expr: 'grin' } : POSE.sonicHip();
    else if (lt < 32.6) o = { ...POSE.sonicCrouch(), expr: 'determined' };
    else o = { ...POSE.sonicDash(lt * 34), expr: 'grin' };
    if (lt > 16 && lt < 18.2) puffs(ctx, sxs - 10, G, (lt * 3) % 1, { n: 5, spread: 70, seed: Math.floor(lt * 3), size: 18, dx: -60 });
    if (lt > 32.6) streak(ctx, REST3 - cam, G - 60, sxs, G - 60, 1, '#4f8cff', 20, 1);
    drawSonic(ctx, sxs, sy, SS, 1, { t: lt, rot, ...o, talk: speaking(lt, L3, 'sonic'), blink: blinkAt(lt, 3.1, 2) });
    shock(ctx, REST3 - cam + 40, G - 70, prog(lt, 32.8, 33.6), 180, { flat: 1.4, col: '#cfe6ff' });

    const hud = Math.min(1, prog(lt, 0.3, 0.8)) * (1 - prog(lt, 18.5, 19.2));
    if (hud > 0) {
      bigText(ctx, 'RINGS', 110, 52, 30, { fill: '#ffd21f', stroke: '#1d3aa8', sw: 7, alpha: hud });
      bigText(ctx, String(count).padStart(3, '0'), 232, 52, 32, { fill: '#ffffff', stroke: '#1d3aa8', sw: 7, alpha: hud });
    }
    talk(ctx, lt, L3, { sonic: sonTop(sxs, sy) });
  },
});

/* ---------- 4. The Groceries ---------- */

const L4 = [
  [11.0, 15.4, 'sonic', "Nice groceries! Mind if I borrow 'em?"],
  [15.9, 19.9, 'saitama', '...That cabbage was on sale.'],
  [20.4, 24.6, 'sonic', 'Then come and get it! If you can keep up!'],
  [28.6, 31.0, 'saitama', '...OK.'],
];

scene({
  id: 'groceries',
  name: 'The Groceries',
  dur: 36,
  lines: L4,
  music: [[0, 'calm'], [10, 'speed'], [25.6, 'none'], [27.5, 'tension']],
  cues: [[6.3, 'whoosh'], [8.2, 'pop'], [9.9, 'skid'], [25.2, 'whoosh'], [27.4, 'pop'], [32.2, 'boom'], [32.25, 'whoosh']],
  draw(ctx, lt) {
    const G = CITY_G;
    const [qx, qy] = shakeXY(lt, 14 * env(lt, 32.2, 33.1, 0.04));
    ctx.save();
    ctx.translate(qx, qy);
    cityBG(ctx, 2600);
    const zx = 180 + 70 * Math.min(lt, 6.4);
    const gust = lt > 6.3 ? Math.max(0, 1 - Math.abs(lt - 6.9) / 1.8) : 0;

    if (lt > 32.2) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(zx, G + 4);
        ctx.lineTo(zx + Math.cos(a) * (50 + hash(i) * 50), G + 4 + Math.sin(a) * -12);
        ctx.stroke();
      }
    }

    if (lt < 32.2) {
      let pose = lt < 6.4 ? POSE.saiWalk(lt * 7.4) : lt > 7.6 && lt < 10.4 ? POSE.saiLookHand() : {};
      if (lt > 31.2) pose = POSE.saiCrouch(E.out(prog(lt, 31.2, 31.9)));
      const annoyed = lt > 27.4;
      drawSaitama(ctx, zx, G, ZS, 1, {
        ...pose,
        t: lt,
        expr: annoyed ? 'annoyed' : 'ok',
        vein: annoyed ? E.back(prog(lt, 27.4, 27.8)) : 0,
        blink: blinkAt(lt, 3.4),
        talk: speaking(lt, L4, 'saitama'),
        carry: lt < 6.45 ? bagIn(1) : null,
        wind: 0.15 + gust * 1.1,
        look: lt > 10.4 && lt < 27 ? 1 : 0,
      });
    }
    for (let i = 0; i < 6; i++) {
      const t0 = 0.8 + i * 0.9;
      const k = env(lt, t0, t0 + 1.6, 0.3);
      if (k > 0) drawNote(ctx, zx + 30 + (lt - t0) * 30 + i * 6, G - 250 - (lt - t0) * 50, 1, Math.sin(lt * 4 + i) * 0.3, k);
    }
    if (lt > 8.2 && lt < 10.4) bigText(ctx, '?', zx + 14, G - 285, 64, { fill: '#ffffff', stroke: INK, sw: 9, scale: E.back(prog(lt, 8.2, 8.5)) });

    for (let i = 0; i < 7; i++) {
      const u = prog(lt, 6.4 + i * 0.08, 9.4);
      if (u <= 0 || u >= 1) continue;
      const px = zx + u * (700 + hash(i) * 400);
      const py = G - 60 - hash(i + 3) * 160 + Math.sin(u * 9 + i) * 30;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(u * 12 + i);
      ctx.fillStyle = i % 2 ? '#7cc96f' : '#f2eee2';
      ctx.fillRect(-9, -6, 18, 12);
      ctx.restore();
    }
    if (lt > 6.3 && lt < 7.2) streak(ctx, -250, G - 70, 1550, G - 70, (lt - 6.3) / 0.45, '#4f8cff', 24, 0.6);

    if (lt > 9.9 && lt < 25.9) {
      let sx = kf(lt, [[9.9, 1450], [10.5, 1000, E.out3]]);
      let dir = -1;
      let o = lt < 10.5 ? { ...POSE.sonicSkid(), expr: 'grin' } : lt < 15.4 ? POSE.sonicHip() : { expr: 'smirk' };
      if (lt > 20.4 && lt < 24.6) o = { ...POSE.sonicPointUp(lt), expr: 'grin' };
      if (lt > 24.6) o = { ...POSE.sonicThumb(), expr: 'grin' };
      if (lt > 25.2) {
        dir = 1;
        sx = 1000 + 3000 * (lt - 25.2) * (lt - 25.2);
        o = { ...POSE.sonicDash(lt * 34), expr: 'grin' };
        streak(ctx, 1000, G - 60, sx, G - 60, 1, '#4f8cff', 20, 1);
      }
      if (lt < 10.6) puffs(ctx, sx + 20, G, prog(lt, 9.9, 10.7), { n: 6, spread: 80, seed: 5, size: 20, dx: 50 });
      drawSonic(ctx, sx, G, SS, dir, { t: lt, ...o, talk: speaking(lt, L4, 'sonic'), carry: bagIn(0.7), blink: blinkAt(lt, 2.8, 3) });
      talk(ctx, lt, L4, { sonic: sonTop(sx, G, SS, dir) });
    }
    puffs(ctx, zx, G, prog(lt, 32.2, 35.4), { n: 14, spread: 220, seed: 9, size: 38 });
    if (lt > 32.2 && lt < 33) streak(ctx, zx, G - 100, zx + 30, -200, (lt - 32.2) / 0.3, '#ffe27a', 16, 0.8);
    ctx.restore();
    talk(ctx, lt, L4.filter((l) => l[2] !== 'sonic'), { saitama: saiTop(zx, G) });
  },
});

/* ---------- 5. The Chase ---------- */

const CAM5 = [[0, 1900], [13.2, 1900], [13.6, 3200], [25.0, 3200], [25.5, 350], [27.6, 350], [28.0, 3200], [44, 3200]];
const BAR5 = integ(CAM5, 26.5) + 760;

const L5 = [
  [2.0, 5.0, 'sonic', 'Too easy!'],
  [9.0, 10.6, 'saitama', 'Hey.'],
  [11.0, 13.0, 'sonic', 'WHAT?!', { shout: true }],
  [16.4, 19.6, 'saitama', 'Can I have my cabbage back?'],
  [20.0, 23.2, 'sonic', 'Not until you catch me!'],
  [30.0, 33.0, 'sonic', "Okay... you're not bad."],
  [33.4, 37.4, 'sonic', 'But this city is too small for us. Follow me!'],
];

scene({
  id: 'chase',
  name: 'The Chase',
  dur: 44,
  lines: L5,
  fadeOutColor: '#ffffff',
  fadeOut: 1.4,
  music: [[0, 'speed']],
  cues: [[0.2, 'whoosh'], [6.2, 'whoosh'], [13.4, 'zip'], [13.45, 'boom'], [15.4, 'whoosh'], [26.0, 'spring'], [26.55, 'boing'], [27.0, 'thud'], [27.5, 'thud'], [38.4, 'whoosh'], [40.2, 'zip']],
  draw(ctx, lt) {
    const G = CITY_G;
    const cam = integ(CAM5, lt);
    const slow = env(lt, 25.0, 28.0, 0.5);
    cityBG(ctx, cam);
    const bx = BAR5 - cam;
    if (bx > -250 && bx < W + 250) drawBarricade(ctx, bx, G + 6);
    speedLines(ctx, lt * (1 - slow * 0.85), { n: 30, alpha: 0.45 * (1 - slow * 0.75), speed: 3000, y0: 110, y1: 600 });

    const sxs = kf(lt, [[0, -160], [1.4, 600, E.out3], [13.3, 640], [14.1, 900, E.out3], [22, 880], [24, 760], [38, 760], [40.5, 1500, E.in]]);
    const zxs = kf(lt, [[0, -220], [6, -220], [8.4, 470, E.out3], [13.4, 480], [13.9, 250, E.out], [15.8, 700], [22, 690], [24, 600], [38, 600], [40.8, 1500, E.in]]);
    const sy = G - hop(lt, 26.0, 27.0, 190);
    const zy = G - hop(lt, 26.55, 27.45, 170);
    const zAir = lt > 26.55 && lt < 27.45;
    drawSaitama(ctx, zxs, zy, ZS, 1, {
      ...(zAir ? POSE.saiJump() : POSE.saiJog(cam / 260)),
      t: lt,
      wind: 0.9,
      blink: blinkAt(lt, 3.6),
      talk: speaking(lt, L5, 'saitama'),
    });
    let expr = lt < 10.8 ? 'smirk' : lt < 13.4 ? 'shock' : lt < 16 ? 'determined' : lt < 30 ? 'smirk' : 'grin';
    const ball = lt > 26.0 && lt < 27.0;
    shock(ctx, sxs - 40, G - 70, prog(lt, 13.4, 14.3), 170, { flat: 1.4, col: '#cfe6ff' });
    drawSonic(ctx, sxs, sy, SS, 1, {
      ...(ball ? { ball: 1, spin: lt * 22 } : POSE.sonicDash(cam / 55)),
      t: lt,
      expr,
      quillWob: 1.5,
      talk: speaking(lt, L5, 'sonic'),
      carry: bagIn(0.7),
      blink: blinkAt(lt, 2.9, 7),
    });
    if (slow > 0) {
      ctx.fillStyle = `rgba(60,110,255,${0.14 * slow})`;
      ctx.fillRect(0, 0, W, H);
    }
    talk(ctx, lt, L5, { sonic: sonTop(sxs, sy), saitama: saiTop(zxs, zy) });
  },
});

/* ---------- 6. Green Hills ---------- */

const V6 = 1100;
const LX6 = 5500;
const CAMK6 = [[6.3, 1100], [26.6, 1100], [28.8, 0]];
const cam6Follow = (lt) => (lt < 5 ? V6 * lt - 600 : lt < 6.3 ? LX6 - 600 : LX6 - 600 + integ(CAMK6, lt));
const SPRING6 = cam6Follow(16.3) + 600;

const L6 = [
  [7.4, 10.6, 'sonic', 'Did you just... skip the loop?!'],
  [11.0, 14.2, 'saitama', 'Was I supposed to do it?'],
  [17.4, 19.2, 'sonic', 'SERIOUSLY?!', { shout: true }],
  [21.0, 24.4, 'sonic', 'Fine! Somewhere with more room, then!'],
];

scene({
  id: 'hills',
  name: 'Green Hills',
  dur: 32,
  lines: L6,
  fadeInColor: '#ffffff',
  fadeIn: 1.2,
  music: [[0, 'speed'], [29, 'tension']],
  cues: [[5, 'whoosh'], [16.3, 'spring'], [19.3, 'thud'], [19.4, 'thud'], [27.6, 'skid'], [28.0, 'skid']],
  draw(ctx, lt) {
    const follow = cam6Follow(lt);
    const w = lt < 4.6 ? 0 : lt < 5.0 ? E.inOut(prog(lt, 4.6, 5.0)) : lt < 6.3 ? 1 : 1 - E.inOut(prog(lt, 6.3, 6.8));
    const cam = lerp(follow, LX6 - 640, w);
    const air = Math.max(hop(lt, 16.3, 19.3, 380), hop(lt, 16.45, 19.35, 380));
    const camY = air * 0.75;
    const m = prog(lt, 23.5, 26.5);
    const G = lerp(HILL_G, MESA_G, m);
    if (m < 1) hillsBG(ctx, cam, { t: lt, camY });
    if (m > 0) {
      ctx.save();
      ctx.globalAlpha = m;
      mesaBG(ctx, cam, { t: lt });
      ctx.restore();
    }
    ctx.save();
    ctx.translate(0, camY);
    if (Math.abs(LX6 - cam - 640) < 1000) drawLoop(ctx, LX6 - cam, HILL_G, 150);
    const spx = SPRING6 - cam;
    if (spx > -100 && spx < W + 100 && m < 1) drawSpring(ctx, spx, HILL_G + 2, env(lt, 16.25, 16.6, 0.1));
    if (cam6Follow(lt + 0.05) - cam6Follow(lt) > 20) speedLines(ctx, lt, { n: 22, alpha: 0.32, speed: 2400, y0: 120 - camY, y1: 520 - camY });

    let zxs;
    let zWalk = false;
    if (lt < 6.3) {
      zxs = kf(lt, [[0, -220], [4, 4180], [4.6, 4760], [5, 4960], [6.3, 5620]], E.lin) - cam;
      zWalk = lt > 4.6;
    } else zxs = kf(lt, [[6.3, 760], [7, 720], [20, 720], [22, 470], [26.8, 470], [29.6, 400, E.out3]]);
    const zy = G - hop(lt, 16.45, 19.35, 380);
    const stopped = lt > 28.6;
    let zp = zWalk ? POSE.saiWalk(lt * 6.5) : stopped ? {} : POSE.saiJog(follow / 260);
    if (lt > 16.45 && lt < 19.35) zp = POSE.saiJump();
    drawSaitama(ctx, zxs, zy, ZS, 1, { ...zp, t: lt, wind: stopped ? 0.3 : 0.9, blink: blinkAt(lt, 3.2), talk: speaking(lt, L6, 'saitama') });

    let sxs;
    let sy = G;
    let rot = 0;
    if (lt < 5) sxs = V6 * lt - cam;
    else if (lt < 6.3) {
      const ph = TAU * prog(lt, 5, 6.3);
      sxs = LX6 + 150 * Math.sin(ph) - cam;
      sy = HILL_G - 150 + 150 * Math.cos(ph);
      rot = -ph;
    } else sxs = kf(lt, [[6.3, 640], [7, 600], [26.8, 600], [29.4, 860, E.out3]]);
    sy -= hop(lt, 16.3, 19.3, 380);
    let so = POSE.sonicDash(follow / 55);
    let expr = lt > 7.4 && lt < 10.6 ? 'shock' : lt > 20.5 ? 'determined' : 'grin';
    if (lt > 16.3 && lt < 19.3) {
      so = { air: true, legs: [[0.1, -0.05], [-0.1, -0.05]], arms: [[2.9, 0.2], [2.8, 0.25]], hands: ['open', 'open'] };
      expr = lt > 17.2 ? 'shock' : 'grin';
    }
    let dir = 1;
    if (lt > 27.4 && lt < 29.6) so = POSE.sonicSkid();
    if (lt >= 29.6) {
      so = POSE.sonicHip();
      dir = -1;
      expr = 'smirk';
    }
    if (lt > 27.4 && lt < 29.5) puffs(ctx, sxs - 20, G, (lt * 3) % 1, { n: 5, spread: 80, seed: Math.floor(lt * 3) + 40, size: 20, dx: -70, color: '#e8b98f', shade: '#c48a62' });
    drawSonic(ctx, sxs, sy, SS, dir, { t: lt, rot, ...so, expr, quillWob: stopped ? 0 : 1.5, talk: speaking(lt, L6, 'sonic'), carry: bagIn(0.7), blink: blinkAt(lt, 3, 9) });
    ctx.restore();
    talk(ctx, lt, L6, { sonic: sonTop(sxs, sy + camY, SS, dir), saitama: saiTop(zxs, zy + camY) });
  },
});

/* ---------- 7. The Standoff ---------- */

const L7 = [
  [3.0, 7.6, 'sonic', "Alright. You earned it. Let's have a REAL fight."],
  [8.0, 11.6, 'sonic', 'Winner gets the cabbage!'],
  [12.0, 15.6, 'saitama', "It's already my cabbage."],
  [28.0, 30.0, 'sonic', "Let's GO!", { shout: true }],
];
const ROCK_X = 640;

function standoffProps(ctx) {
  drawRock(ctx, ROCK_X, MESA_G - 26, 150, 70, 4);
}

scene({
  id: 'standoff',
  name: 'The Standoff',
  dur: 30,
  lines: L7,
  fadeOut: 0.2,
  music: [[0, 'tension']],
  cues: [[2.0, 'zip'], [16, 'sting'], [18.5, 'whoosh'], [24, 'wind']],
  draw(ctx, lt) {
    const G = MESA_G;
    const close = lt > 16 && lt < 24;
    if (!close) {
      mesaBG(ctx, 900, { t: lt });
      standoffProps(ctx);
      drawBag(ctx, ROCK_X, MESA_G - 96 - 60, 1);
      const sx = kf(lt, [[2, 730], [2.25, 900, E.out3]]);
      let so = lt < 2 ? { arms: [[-0.1, 0.3], [1.2, 0.3]], hands: ['fist', 'open'], lean: 0.2 } : POSE.sonicHip();
      let expr = 'smirk';
      if (lt > 8 && lt < 11.6) so = { arms: [[-0.1, 0.3], [1.55, 0.05]], hands: ['fist', 'point'] };
      if (lt > 24) {
        so = { legs: [[-0.5, -0.4], [0.5, -0.5]], arms: [[-0.9, 1.5], [0.6, 1.6]], lean: 0.2 };
        expr = 'determined';
      }
      if (lt > 28) expr = 'grin';
      if (lt > 2 && lt < 2.3) streak(ctx, 730, G - 60, sx, G - 60, 1, '#4f8cff', 18, 1);
      drawSonic(ctx, sx, G, SS, -1, { t: lt, ...so, expr, talk: speaking(lt, L7, 'sonic'), blink: blinkAt(lt, 3.2, 11) });
      const zp = lt > 24 ? { legs: [[-0.35, -0.05], [0.3, -0.12]], arms: [[-0.1, 0.4], [0.25, 0.5]] } : POSE.saiCross();
      drawSaitama(ctx, 380, G, ZS, 1, { ...zp, t: lt, wind: 0.35, blink: blinkAt(lt, 3.6), talk: speaking(lt, L7, 'saitama') });
      if (lt > 24 && lt < 28.6) {
        const u = prog(lt, 24, 28.6);
        drawTumbleweed(ctx, lerp(-60, 1340, u), G - 26 - Math.abs(Math.sin(u * 14)) * 30, 26, u * 30);
      }
      for (let i = 0; i < 8; i++) {
        const y = 150 + hash(i) * 380;
        const x = ((lt * 500 + hash(i + 4) * 2000) % 1800) - 200;
        ctx.strokeStyle = 'rgba(255,240,220,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 60, y - 10, x + 140, y);
        ctx.stroke();
      }
      talk(ctx, lt, L7, { sonic: sonTop(sx, G, SS, -1), saitama: saiTop(380, G) });
      return;
    }
    // split-screen close-ups
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const topIn = E.out3(prog(lt, 16, 16.45));
    const botIn = E.out3(prog(lt, 18.5, 18.95));
    ctx.save();
    ctx.translate((1 - topIn) * -W, 0);
    ctx.beginPath();
    ctx.rect(0, 64, W, 290);
    ctx.clip();
    sky(ctx, 'sunset');
    focusLines(ctx, 640, 210, lt, { color: '#ffffff', alpha: 0.35, r0: 260 });
    drawSonic(ctx, 661, 790, 4.2, -1, { t: lt, expr: 'determined', look: 1 });
    ctx.restore();
    if (botIn > 0) {
      ctx.save();
      ctx.translate((1 - botIn) * W, 0);
      ctx.beginPath();
      ctx.rect(0, 366, W, 290);
      ctx.clip();
      sky(ctx, 'dusk');
      focusLines(ctx, 640, 510, lt, { color: '#ffffff', alpha: 0.3, r0: 260 });
      drawSaitama(ctx, 617, 1446, 4.6, 1, { t: lt, blink: lt > 22 && lt < 22.15 ? 1 : 0, wind: 0.4 });
      ctx.restore();
    }
    letterbox(ctx, 1);
    for (let i = 0; i < 10; i++) {
      const y = 70 + hash(i) * 580;
      const x = ((lt * 900 + hash(i + 4) * 2000) % 1800) - 300;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 200, y);
      ctx.stroke();
    }
  },
});
