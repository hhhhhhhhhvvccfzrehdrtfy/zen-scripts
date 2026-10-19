'use strict';
/* Act two: the fight, the tornado, the emeralds, the sky clash, the lost cabbage, the sale, and the credits. */

function bez(a, b, c, u) {
  const v = 1 - u;
  return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]];
}

// Zoom the whole stage toward (fx, fy): at z = 1 nothing moves, at zMax the focus point sits mid-screen.
function zoomTo(ctx, z, fx, fy, zMax) {
  if (z <= 1.0001) return;
  const k = clamp((z - 1) / (zMax - 1));
  const cx = lerp(W / 2, fx, k);
  const cy = lerp(H / 2, fy, k);
  ctx.translate(W / 2, H / 2);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

function pebble(ctx, x, y, r, seed) {
  ell(ctx, x, y, r * (1 + hash(seed) * 0.4), r * (0.75 + hash(seed + 1) * 0.3), hash(seed + 2) * 3, '#a8603e', 2.5);
}

/* ---------- 8. Round One ---------- */

const ZX8 = 470;
const HIT8 = Array.from({ length: 23 }, (_, i) => 1.5 + i * 0.47);
const IMP8 = HIT8.map((_, i) => [[ZX8 + 30, MESA_G - 150], [ZX8 + 8, MESA_G - 238], [ZX8 - 36, MESA_G - 140], [ZX8 + 18, MESA_G - 62]][Math.floor(hash(i * 3.3) * 4)]);
const OUT8 = HIT8.map((_, i) => {
  const a = -Math.PI / 2 + (hash(i + 7) - 0.5) * 2.8;
  return [ZX8 + Math.cos(a) * 290, Math.min(MESA_G - 70, MESA_G - 160 + Math.sin(a) * 250)];
});
const FINGER8 = [ZX8 + 100, MESA_G - 166];

function ball8(lt) {
  const start = [900, MESA_G - 34];
  if (lt < 0.9) return start;
  for (let i = 0; i < HIT8.length; i++) {
    const t0 = i ? HIT8[i - 1] : 0.9;
    if (lt <= HIT8[i]) return bez(i ? IMP8[i - 1] : start, OUT8[i], IMP8[i], (lt - t0) / (HIT8[i] - t0));
  }
  const tl = HIT8[HIT8.length - 1];
  if (lt < 13) return bez(IMP8[IMP8.length - 1], [760, MESA_G - 340], start, (lt - tl) / (13 - tl));
  return start;
}

const L8 = [
  [13.6, 17.0, 'sonic', "Huff... He didn't even flinch?!"],
  [31.0, 35.0, 'sonic', "Ow! Okay, okay... you're tough."],
  [35.5, 40.5, 'saitama', 'Are we done? I need to cook that cabbage.'],
  [41.0, 46.5, 'sonic', "Done? I'm just getting warmed up!"],
];

scene({
  id: 'round1',
  name: 'Round One',
  dur: 48,
  lines: L8,
  music: [[0, 'fight'], [13, 'none'], [17.5, 'tension'], [26.4, 'fight'], [31, 'calm']],
  cues: [[0.9, 'zip'], ...HIT8.map((t) => [t, 'hit']), [13, 'thud'], [17.5, 'rev'], [22, 'whoosh'], [22.25, 'punch'], [22.3, 'grind'], [26.4, 'flick'], [26.9, 'boom']],
  draw(ctx, lt) {
    const G = MESA_G;
    const amp = 10 * env(lt, 22.25, 22.7, 0.05) + 16 * env(lt, 26.9, 27.6, 0.05);
    const [qx, qy] = shakeXY(lt, amp);
    ctx.save();
    ctx.translate(qx, qy);
    mesaBG(ctx, 900, { t: lt });
    drawRock(ctx, 1150, G - 8, 180, 92, 7);
    drawRock(ctx, 1225, G, 110, 56, 8);

    const nHits = HIT8.filter((t) => t <= lt).length;
    const lastHit = nHits ? HIT8[nHits - 1] : -9;
    const headHit = nHits && Math.floor(hash((nHits - 1) * 3.3) * 4) === 1 ? Math.max(0, 1 - (lt - lastHit) / 0.3) : 0;
    let zp = {};
    let zexpr = 'ok';
    if (lt > 7.6 && lt < 9.4) zexpr = 'yawn';
    const fingerOn = lt > 21.9 && lt < 26.7;
    if (fingerOn) zp = POSE.saiFinger();
    if (lt > 26.4 && lt < 26.7) zp = { arms: [[-0.05, 0.12], [1.5, -0.35]], hands: ['fist', 'finger'] };
    drawSaitama(ctx, ZX8, G, ZS, 1, { ...zp, t: lt, expr: zexpr, tilt: -0.18 * headHit, blink: blinkAt(lt, 3.4), talk: speaking(lt, L8, 'saitama'), wind: 0.25 });

    // Sonic
    let sx = 900;
    let sy = G;
    let so = {};
    let dir = -1;
    let show = true;
    if (lt < 13) {
      const [bx, by] = ball8(lt);
      for (let k = 3; k >= 1; k--) {
        const [gx, gy] = ball8(lt - k * 0.035);
        if (lt > 1) drawSonic(ctx, gx, gy + 42 * SS, SS, dir, { ball: 1, spin: lt * 30, alpha: 0.18 * (4 - k) });
      }
      sx = bx;
      sy = by + 42 * SS;
      so = { ball: 1, spin: lt * 30 };
    } else if (lt < 17.5) so = { expr: lt < 15 ? 'shock' : 'determined' };
    else if (lt < 22.25) {
      const u = E.in(prog(lt, 22, 22.25));
      sx = lerp(900, FINGER8[0] + 30, u);
      sy = lerp(G, FINGER8[1] + 42 * SS, u);
      so = { ball: 1, spin: integ([[17.5, 40], [22.25, 70]], lt) };
      if (lt < 22) {
        puffs(ctx, 950, G, (lt * 4) % 1, { n: 5, spread: 70, seed: Math.floor(lt * 4), size: 18, dx: 80, color: '#e8b98f', shade: '#c48a62' });
        speedLines(ctx, lt, { n: 10, alpha: 0.4, speed: 3000, y0: G - 80, y1: G - 10 });
      }
    } else if (lt < 24.6) {
      sx = FINGER8[0] + 30 + Math.sin(lt * 80) * 2;
      sy = FINGER8[1] + 42 * SS;
      so = { ball: 1, spin: integ([[17.5, 40], [22.25, 70], [24.6, 0]], lt) };
      for (let i = 0; i < 6; i++) {
        const age = (lt * 3 + hash(i)) % 1;
        const a = Math.PI * 0.6 + hash(i + Math.floor(lt * 3 + hash(i))) * Math.PI * 0.9;
        star4(ctx, FINGER8[0] + 4 + Math.cos(a) * age * 90, FINGER8[1] + Math.sin(a) * age * 90, 9 * (1 - age), age * 6, '#fff3a0');
      }
    } else if (lt < 26.4) {
      sx = FINGER8[0] + 30;
      sy = G - 64;
      so = { air: true, legs: [[0.1, -0.2], [-0.1, -0.25]], arms: [[-0.4, 0.3], [-0.2, 0.3]], expr: lt < 25.4 ? 'shock' : 'sheepish', look: 1 };
    } else if (lt < 26.9) {
      const u = prog(lt, 26.4, 26.9);
      sx = lerp(FINGER8[0] + 30, 1150, E.out(u));
      sy = lerp(G - 64, G - 30, u) - Math.sin(Math.PI * u) * 60;
      so = { air: true, rot: u * TAU * 2, expr: 'wince' };
    } else if (lt < 29) show = false;
    else if (lt < 31) {
      sx = lerp(1150, 1000, prog(lt, 29, 31));
      so = { ...POSE.sonicRun(lt * 9, 0.35), arms: [[-0.2, 0.4], [2.6, 1.6]], expr: 'wince' };
    } else {
      sx = 1000;
      so = lt > 46.5 ? { ...POSE.sonicCrouch(), expr: 'grin' } : lt > 41 ? { ...POSE.sonicPointUp(lt), expr: 'grin' } : { expr: 'smirk' };
    }
    if (show) drawSonic(ctx, sx, sy, SS, dir, { t: lt, blink: blinkAt(lt, 2.7, 13), talk: speaking(lt, L8, 'sonic'), ...so });
    if (lt < 13 && lastHit > 0) {
      const p = (lt - lastHit) / 0.3;
      burst(ctx, IMP8[nHits - 1][0], IMP8[nHits - 1][1], p, 70, { c2: '#bcd6ff' });
    }
    burst(ctx, FINGER8[0] + 4, FINGER8[1], prog(lt, 22.25, 22.7), 110, { c2: '#ffe27a' });
    puffs(ctx, 1150, G - 20, prog(lt, 26.9, 30), { n: 16, spread: 220, seed: 21, size: 44, color: '#e8b98f', shade: '#c48a62' });
    ctx.restore();

    if (lt > 1.5 && lt < 14.5) {
      const pop = 1 + 0.25 * Math.max(0, 1 - (lt - lastHit) / 0.15);
      const a = Math.min(1, prog(lt, 1.5, 1.7)) * (1 - prog(lt, 13.8, 14.5));
      bigText(ctx, `${nHits} HITS`, 1080, 80, 54, { fill: '#ffd21f', stroke: INK, sw: 10, scale: pop, alpha: a, rot: 0.06, shadow: '#e3262f' });
      bigText(ctx, 'DAMAGE: 0', 1080, 138, 26, { fill: '#ffffff', stroke: INK, sw: 6, alpha: a * prog(lt, 4, 4.4), rot: 0.06 });
    }
    sfx(ctx, 'FLICK!', 640, 220, 80, lt, 26.4, 1.4, { fill: '#ffffff', rot: -0.12 });
    talk(ctx, lt, L8, { sonic: sonTop(sx, sy, SS, dir), saitama: saiTop(ZX8, G) });
  },
});

/* ---------- 9. The Blue Tornado ---------- */

const ZX9 = 560;
const OM9 = [[0.8, 3], [3, 26], [15.5, 26]];

function funnelRing(ctx, cx, y, rx, ry, t, j, k, front) {
  for (let s = 0; s < 3; s++) {
    const a0 = t * 9 + j * 0.7 + s * 2.1;
    ctx.beginPath();
    let pen = false;
    for (let q = 0; q <= 14; q++) {
      const a = a0 + (q / 14) * 1.3;
      const isFront = Math.sin(a) > 0;
      const px = cx + Math.cos(a) * rx;
      const py = y + Math.sin(a) * ry;
      if (isFront === front) {
        if (pen) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
        pen = true;
      } else pen = false;
    }
    ctx.globalAlpha = k * (0.45 + 0.35 * hash(j * 3 + s));
    ctx.lineWidth = 3 + 3 * hash(j + s * 7);
    ctx.strokeStyle = ['#bfe0ff', '#3b74ff', '#ffffff'][(j + s) % 3];
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function tornado(ctx, cx, gy, t, k, front) {
  if (k <= 0) return;
  for (let j = 0; j < 14; j++) {
    const rx = 120 + j * 14 + Math.sin(t * 3 + j) * 6;
    funnelRing(ctx, cx + Math.sin(t * 2 + j * 0.4) * 8, gy - 10 - j * 34, rx, rx * 0.2, t, j, k, front);
  }
}

function debris9(lt, i) {
  const th = integ(OM9, Math.min(lt, 15.5)) * 0.35 + i * 0.8;
  const r = 210 + hash(i) * 90;
  const y = MESA_G - 50 - hash(i + 3) * 360 * prog(lt, 2 + i * 0.3, 5 + i * 0.3);
  let x = ZX9 + Math.cos(th) * r;
  let yy = y + Math.sin(th) * r * 0.2;
  if (lt > 15.5) {
    const d = (lt - 15.5) * 1100;
    const ang = Math.atan2(yy - (MESA_G - 190), x - ZX9);
    x += Math.cos(ang) * d;
    yy += Math.sin(ang) * d;
  }
  return [x, yy, Math.sin(th) > 0];
}

const L9 = [
  [5.0, 10.0, 'sonic', "How's THIS?! Can't punch what you can't catch!", { at: [ZX9, 150] }],
  [11.0, 12.8, 'saitama', 'Ah...'],
  [13.0, 15.2, 'saitama', 'Ahhh...'],
  [19.0, 22.6, 'saitama', 'Sorry. Dusty in there.'],
  [30.0, 34.0, 'sonic', 'Fine. You asked for it!'],
];

scene({
  id: 'tornado',
  name: 'The Blue Tornado',
  dur: 36,
  lines: L9,
  music: [[0, 'fight'], [15.5, 'none'], [19, 'calm'], [29.5, 'tension']],
  cues: [[0.2, 'whoosh'], [1.6, 'wind'], [4.8, 'wind'], [8.2, 'wind'], [15.45, 'sneeze'], [15.5, 'boom'], [17.5, 'thud'], [24.6, 'boing'], [25.6, 'twinkle'], [34.4, 'sparkle']],
  draw(ctx, lt) {
    const G = MESA_G;
    const z = kf(lt, [[10.8, 1], [13, 1.9], [15.45, 1.9], [15.5, 1, E.lin]]);
    const [qx, qy] = shakeXY(lt, 18 * env(lt, 15.5, 16.4, 0.04) + 3 * env(lt, 2, 15.4, 1));
    ctx.save();
    ctx.translate(qx, qy);
    zoomTo(ctx, z, ZX9 + 12, G - 200, 1.9);
    mesaBG(ctx, 900, { t: lt });
    const tk = prog(lt, 1.8, 4.5) * (lt < 15.5 ? 1 : 0);
    const th = integ(OM9, lt);
    tornado(ctx, ZX9, G, lt, tk, false);
    for (let i = 0; i < 9; i++) {
      const [x, y, front] = debris9(lt, i);
      if (!front && lt > 2 && lt < 17) pebble(ctx, x, y, 7 + hash(i) * 8, i);
    }
    const discrete = lt > 0 && lt < 3.4;
    const sonicAt = () => [ZX9 + 200 * Math.cos(th), G + 26 * Math.sin(th)];
    const drawOrbit = (front) => {
      if (!discrete) return;
      for (let g = 0; g < 4; g++) {
        const a = th - g * 0.35;
        if (Math.sin(a) > 0 !== front) continue;
        const x = lt < 0.8 ? lerp(1100, ZX9 + 200, prog(lt, 0, 0.8)) : ZX9 + 200 * Math.cos(a);
        const y = lt < 0.8 ? G : G + 26 * Math.sin(a);
        const dir = -Math.sin(a) >= 0 ? 1 : -1;
        if (g > 0 && lt < 1.6) continue;
        drawSonic(ctx, x, y, SS, lt < 0.8 ? -1 : dir, { ...POSE.sonicDash(lt * 34), t: lt, alpha: g ? 0.35 - g * 0.08 : 1, quillWob: 1.5 });
      }
    };
    drawOrbit(false);
    let zexpr = lt > 10.8 && lt < 15.4 ? 'ah' : lt >= 15.4 && lt < 16.4 ? 'achoo' : 'ok';
    drawSaitama(ctx, ZX9, G, ZS, 1, {
      t: lt,
      expr: zexpr,
      wind: tk > 0 ? 1.2 : 0.2,
      lean: lt >= 15.4 && lt < 16.2 ? 0.25 : 0,
      blink: blinkAt(lt, 3.3),
      talk: speaking(lt, L9, 'saitama'),
    });
    if (tk > 0) {
      ctx.fillStyle = `rgba(120,170,255,${0.16 * tk})`;
      ctx.beginPath();
      ctx.moveTo(ZX9 - 125, G);
      ctx.lineTo(ZX9 - 310, G - 480);
      ctx.lineTo(ZX9 + 310, G - 480);
      ctx.lineTo(ZX9 + 125, G);
      ctx.closePath();
      ctx.fill();
    }
    drawOrbit(true);
    tornado(ctx, ZX9, G, lt, tk, true);
    for (let i = 0; i < 9; i++) {
      const [x, y, front] = debris9(lt, i);
      const nearFace = Math.hypot(x - (ZX9 + 10), y - (MESA_G - 205)) < 80;
      if ((front || lt > 15.5) && lt > 2 && lt < 17 && !nearFace) pebble(ctx, x, y, 7 + hash(i) * 8, i);
    }
    for (let r = 0; r < 3; r++) shock(ctx, ZX9 + 24, G - 190, prog(lt, 15.5 + r * 0.15, 16.6 + r * 0.15), 650, { w: 22, col: '#ffffff' });

    // Sonic thrown, stuck, and back on his feet
    if (lt > 15.5 && lt < 17.5) {
      const u = prog(lt, 15.5, 17.5);
      const x = lerp(ZX9 - 200, 150, u);
      const y = lerp(G - 260, G - 90, E.in(u)) - Math.sin(Math.PI * u) * 140;
      drawSonic(ctx, x, y, SS, -1, { t: lt, air: true, rot: Math.PI * E.out(u) + TAU * u, expr: 'shock' });
    } else if (lt >= 17.5 && lt < 24.6) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-400, -400, W + 800, G + 404);
      ctx.clip();
      const kick = Math.sin(lt * 14);
      drawSonic(ctx, 150, G - 92, SS, -1, { t: lt, air: true, rot: Math.PI, legs: [[0.6 * kick, -0.5], [-0.6 * kick, -0.5]], arms: [[1.2, 0.4], [-1.2, 0.4]] });
      ctx.restore();
      ell(ctx, 150, G + 4, 46, 9, 0, '#b8714a', 2.5);
      puffs(ctx, 150, G, prog(lt, 17.5, 18.8), { n: 8, spread: 120, seed: 31, size: 26, color: '#e8b98f', shade: '#c48a62' });
    } else if (lt >= 24.6) {
      const u = prog(lt, 24.6, 25.3);
      const x = lerp(150, 230, u);
      const y = lerp(G - 92, G, u) - Math.sin(Math.PI * u) * 130;
      let so = { expr: 'dizzy' };
      if (lt < 25.3) so = { air: true, rot: lerp(Math.PI, TAU, E.inOut(u)), expr: 'shock' };
      else if (lt > 29.5) so = lt > 34 ? { arms: [[-0.2, 0.4], [2.7, 0.2]], expr: 'determined' } : { expr: 'determined' };
      drawSonic(ctx, x, y, SS, 1, { t: lt, ...so, talk: speaking(lt, L9, 'sonic'), blink: blinkAt(lt, 3, 17) });
      if (lt > 25.3 && lt < 29.4) {
        for (let i = 0; i < 3; i++) {
          const a = lt * 5 + (i * TAU) / 3;
          star4(ctx, 238 + Math.cos(a) * 44, G - 172 + Math.sin(a) * 10, 9, lt * 3, '#ffe066');
        }
      }
      if (lt > 34.4) star4(ctx, 1120, 90, 18 + 8 * Math.sin(lt * 12), lt * 2, '#ffffff');
    }
    ctx.restore();
    if (lt > 15.45 && lt < 16) flash(ctx, 0.5 * (1 - prog(lt, 15.45, 16)));
    sfx(ctx, 'ACHOO!', 820, 200, 110, lt, 15.45, 2.2, { fill: '#ffffff', rot: -0.1 });
    const sonicNow = lt < 3.4 ? sonicAt() : [lt < 25.3 ? 150 : 230, G];
    talk(ctx, lt, L9, { saitama: z > 1.01 ? [640, 150] : saiTop(ZX9, G), sonic: sonTop(sonicNow[0], sonicNow[1]) });
  },
});

/* ---------- 10. Seven Emeralds ---------- */

const SX10 = 840;
const ZX10 = 400;
const EM_SPIN = [[0, 1.4], [5, 1.4], [11, 10]];

function gemPos(lt, i) {
  const lift = 70 * E.inOut(prog(lt, 5, 11));
  const cy = MESA_G - 76 - lift;
  const r = lerp(125, 60, prog(lt, 5, 11)) * (1 - prog(lt, 11.1, 11.5));
  const a = (i * TAU) / 7 + integ(EM_SPIN, lt);
  return [SX10 + Math.cos(a) * r, cy + Math.sin(a) * r * 0.38, Math.sin(a) > 0];
}

const L10 = [
  [13.5, 18.5, 'sonic', 'Now THIS is my top speed!'],
  [19.5, 23.5, 'saitama', 'Oh. You turned gold.'],
  [24.0, 27.5, 'saitama', "So... you're getting serious?"],
  [30.0, 34.0, 'saitama', "Then I'll get a little serious too.", { at: [640, 160] }],
];

scene({
  id: 'emeralds',
  name: 'Seven Emeralds',
  dur: 40,
  lines: L10,
  music: [[0, 'tension'], [11.5, 'epic'], [27.5, 'none'], [28.5, 'epic']],
  cues: [...GEM_COLS.map((_, i) => [1.3 + i * 0.5, 'chime', i]), [5.4, 'rumble'], [7, 'transform'], [11.5, 'boom'], [11.55, 'sparkle'], [28.5, 'sting'], [35, 'rumble'], [37.2, 'whoosh'], [37.4, 'boom']],
  draw(ctx, lt) {
    const G = MESA_G;
    const z = kf(lt, [[27.5, 1], [28.4, 2.3, E.out3], [34.6, 2.3], [35.4, 1]]);
    const [qx, qy] = shakeXY(lt, 10 * env(lt, 11.5, 13, 0.05) + 5 * env(lt, 34.8, 38, 0.3) + 2 * env(lt, 6, 11.5, 1));
    ctx.save();
    ctx.translate(qx, qy);
    zoomTo(ctx, z, ZX10 + 10, G - 205, 2.3);
    mesaBG(ctx, 900, { t: lt, dark: prog(lt, 3, 11.5) });

    const sup = lt > 11.5;
    if (sup) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,210,80,${0.6 * prog(lt, 11.5, 12.5)})`;
      ctx.lineWidth = 4;
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(SX10, G + 4);
        ctx.lineTo(SX10 + Math.cos(a) * (120 + hash(i) * 120), G + 4 - Math.sin(a) * 14 + 10);
        ctx.stroke();
      }
      ctx.restore();
    }
    const rocksUp = (i) => {
      const x = [520, 610, 690, 990, 1090, 1190][i];
      const up = E.out(prog(lt, 11.8 + i * 0.3, 16 + i * 0.3)) * (70 + hash(i) * 150);
      const fall = lt > 37.4 ? (lt - 37.4) * (lt - 37.4) * 400 : 0;
      return [x, Math.min(G - 6, G - 6 - up + fall + Math.sin(lt * 2 + i) * 5)];
    };
    for (let i = 0; i < 6; i++) {
      const [x, y] = rocksUp(i);
      pebble(ctx, x, y, 10 + hash(i * 5) * 12, i + 40);
    }
    if (lt > 34.8) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(ZX10, G + 4);
        ctx.lineTo(ZX10 + Math.cos(a) * (60 + hash(i + 9) * 80) * prog(lt, 34.8, 35.3), G + 4 + 10);
        ctx.stroke();
      }
    }

    const gems = (front) => {
      if (lt >= 11.5) return;
      GEM_COLS.forEach((col, i) => {
        const ta = 0.5 + i * 0.5;
        if (lt < ta) return;
        let [x, y, f] = gemPos(lt, i);
        if (lt < ta + 0.8) {
          const [ox, oy] = gemPos(ta + 0.8, i);
          const u = E.inOut(prog(lt, ta, ta + 0.8));
          x = lerp(160 + hash(i * 9) * 1000, ox, u);
          y = lerp(-60, oy, u);
          f = true;
        }
        if (f !== front) return;
        drawEmerald(ctx, x, y, 24, col, 0.4 + 0.6 * prog(lt, 5, 11), Math.sin(lt * 2 + i) * 0.2);
      });
    };
    if (lt > 5 && lt < 11.5) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.28 + Math.sin(lt * 2 + i) * 0.05;
        ctx.fillStyle = `rgba(255,240,180,${0.12 * prog(lt, 5, 11)})`;
        ctx.beginPath();
        ctx.moveTo(SX10, G - 140);
        ctx.lineTo(SX10 + Math.cos(a - 0.06) * 900, G - 140 + Math.sin(a - 0.06) * 900);
        ctx.lineTo(SX10 + Math.cos(a + 0.06) * 900, G - 140 + Math.sin(a + 0.06) * 900);
        ctx.fill();
      }
      ctx.restore();
    }
    gems(false);
    const lift = sup ? 70 + Math.sin(lt * 2.2) * 6 : 70 * E.inOut(prog(lt, 5, 11));
    let sy = G - lift;
    if (lt > 37.4) sy -= 3200 * (lt - 37.4) * (lt - 37.4);
    let so;
    if (lt < 5) so = { expr: 'determined', arms: [[-0.2, 0.4], [2.7, 0.2]], look: 0.5 };
    else if (!sup) so = { ...POSE.sonicHover(lt), blink: 1, expr: 'determined', arms: [[-0.6, 0.2], [-0.4, 0.2]], hands: ['open', 'open'] };
    else so = { ...POSE.sonicHover(lt), expr: lt > 13.5 && lt < 18.5 ? 'grin' : 'determined' };
    if (lt > 37.4) streak(ctx, SX10, G - 70, SX10, sy - 60, 1, '#ffd84a', 24, 1);
    drawSonic(ctx, SX10, sy, SS, -1, {
      t: lt,
      ...so,
      air: lt >= 5,
      sup: sup ? 1 : 0,
      aura: sup ? 1 : 0.5 * prog(lt, 8, 11.5),
      quillWob: sup ? 1 : 0,
      talk: speaking(lt, L10, 'sonic'),
    });
    gems(true);

    const serious = lt > 28.5;
    let zp = serious ? { legs: [[-0.3, -0.05], [0.3, -0.12]], arms: [[-0.2, 0.5], [0.25, 0.6]] } : {};
    let zy = G;
    if (lt > 36.4 && lt < 37.2) zp = POSE.saiCrouch(E.out(prog(lt, 36.4, 36.9)));
    if (lt >= 37.2) {
      zp = POSE.saiJump();
      zy = G - 3200 * (lt - 37.2) * (lt - 37.2);
      streak(ctx, ZX10, G - 100, ZX10, zy - 100, 1, '#fff0b0', 20, 1);
    }
    drawSaitama(ctx, ZX10, zy, ZS, 1, {
      ...zp,
      t: lt,
      expr: serious ? 'serious' : 'ok',
      look: lt > 19 ? 0.6 : 0,
      wind: sup ? 0.7 : 0.25,
      blink: serious ? 0 : blinkAt(lt, 3.2),
      talk: speaking(lt, L10, 'saitama'),
    });
    puffs(ctx, ZX10, G, prog(lt, 37.2, 39.5), { n: 12, spread: 200, seed: 51, size: 34, color: '#e8b98f', shade: '#c48a62' });
    ctx.restore();

    if (lt > 11.5) flash(ctx, 0.85 * (1 - prog(lt, 11.5, 13)));
    const mz = clamp((z - 1) / 1.3);
    if (mz > 0) {
      vignette(ctx, mz);
      focusLines(ctx, 640, 330, lt, { alpha: 0.55 * mz, r0: 250 });
    }
    if (lt > 28.5 && lt < 29) flash(ctx, 0.6 * (1 - prog(lt, 28.5, 29)));
    talk(ctx, lt, L10, { sonic: sonTop(SX10, sy, SS, -1), saitama: saiTop(ZX10, G) });
  },
});

/* ---------- 11. Above the Clouds ---------- */

const C11 = Array.from({ length: 10 }, (_, i) => [280 + hash(i * 4.1) * 720, 150 + hash(i * 2.7 + 5) * 280]);
const TC11 = C11.map((_, i) => 1.0 + i * 1.3);
const ROCK11 = [300, 500];

function fighter11(lt, who) {
  const start = who > 0 ? [1350, 560] : [-70, 640];
  const i = TC11.findIndex((t) => lt <= t);
  if (i === -1) return C11[C11.length - 1];
  const t0 = i ? TC11[i - 1] : 0;
  const P0 = i ? C11[i - 1] : start;
  const P2 = C11[i];
  const dx = P2[0] - P0[0];
  const dy = P2[1] - P0[1];
  const len = Math.hypot(dx, dy) || 1;
  const off = who * (130 + 70 * hash(i));
  const P1 = [(P0[0] + P2[0]) / 2 - (dy / len) * off, (P0[1] + P2[1]) / 2 + (dx / len) * off];
  return bez(P0, P1, P2, E.inOut((lt - t0) / (TC11[i] - t0)));
}

function trail(ctx, pts, col, w) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) {
    ctx.globalAlpha = (1 - i / pts.length) * 0.8;
    ctx.strokeStyle = col;
    ctx.lineWidth = w * (1 - i / pts.length) + 2;
    ctx.beginPath();
    ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
    ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  ctx.restore();
}

function skyRock(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 110, y);
  ctx.quadraticCurveTo(x - 100, y - 16, x - 60, y - 14);
  ctx.lineTo(x + 70, y - 16);
  ctx.quadraticCurveTo(x + 112, y - 12, x + 110, y);
  ctx.quadraticCurveTo(x + 60, y + 30, x + 20, y + 80);
  ctx.quadraticCurveTo(x - 30, y + 40, x - 110, y);
  ctx.closePath();
  ctx.fillStyle = '#b9683f';
  ctx.fill();
  strokeNow(ctx, 3.5, INK);
  ctx.fillStyle = '#d98f5f';
  ctx.fillRect(x - 96, y - 16, 190, 6);
}

const L11 = [
  [15.0, 18.6, 'sonic', "You're incredible! But this ends NOW!"],
  [21.0, 24.6, 'saitama', 'Serious Series...'],
];

scene({
  id: 'sky',
  name: 'Above the Clouds',
  dur: 40,
  lines: L11,
  fadeOut: 1.2,
  music: [[0, 'epic'], [29, 'none'], [33, 'tension']],
  cues: [...TC11.map((t) => [t, 'punch']), [14.2, 'whoosh'], [19, 'rev'], [19.3, 'transform'], [26.5, 'sting'], [28.5, 'whoosh'], [29, 'bigboom'], [33, 'fall']],
  draw(ctx, lt) {
    const hole = 600 * E.out3(prog(lt, 29, 31.6));
    const amp = 8 * TC11.reduce((m, t) => Math.max(m, env(lt, t, t + 0.3, 0.02)), 0) + 24 * env(lt, 29, 32, 0.05);
    const [qx, qy] = shakeXY(lt, amp);
    ctx.save();
    ctx.translate(qx, qy);
    skyBattleBG(ctx, lt, { hole });
    const rockY = ROCK11[1] + Math.sin(lt * 1.6) * 6;
    if (lt > 13 && lt < 29.2) skyRock(ctx, ROCK11[0], rockY);

    if (lt < 13.7) {
      const idx = TC11.filter((t) => t <= lt).length - 1;
      const since = idx >= 0 ? lt - TC11[idx] : 9;
      const frozen = since < 0.4;
      const sTrail = [];
      const zTrail = [];
      for (let k = 0; k < 10; k++) {
        sTrail.push(fighter11(Math.max(0, lt - k * 0.03), 1));
        zTrail.push(fighter11(Math.max(0, lt - k * 0.03), -1));
      }
      trail(ctx, sTrail, '#ffd84a', 22);
      trail(ctx, zTrail, '#fff4c8', 18);
      if (frozen) {
        const [cx, cy] = C11[idx];
        drawSaitama(ctx, cx - 70, cy + 120, 0.8, 1, { ...POSE.saiPunch(1), air: true, t: lt, expr: 'serious', wind: 1 });
        drawSonic(ctx, cx + 60, cy + 70, 0.75, -1, { ...POSE.sonicKick(), t: lt, sup: 1, aura: 1, expr: 'determined' });
        burst(ctx, cx, cy, since / 0.4, 120, { c2: '#ffe27a' });
        shock(ctx, cx, cy, since / 0.4, 220, { w: 12 });
      } else {
        const [sx, sy] = sTrail[0];
        const [zx, zy] = zTrail[0];
        drawSonic(ctx, sx, sy + 34, 0.75, sx > sTrail[3][0] ? 1 : -1, { ball: 1, spin: lt * 30, sup: 1, aura: 0.7, t: lt });
        drawSaitama(ctx, zx, zy + 110, 0.75, zx > zTrail[3][0] ? 1 : -1, { ...POSE.saiJump(), t: lt, expr: 'serious', wind: 1 });
      }
    } else if (lt < 29.2) {
      const u = E.inOut(prog(lt, 13.7, 15));
      const last = C11[C11.length - 1];
      let sx = lerp(last[0], 980, u);
      let sy = lerp(last[1], 330, u);
      let zx = lerp(last[0], ROCK11[0], u);
      let zy = lerp(last[1] + 100, rockY - 16, u);
      const charge = prog(lt, 19, 26);
      if (lt > 19) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 26; i++) {
          const life = (lt * 0.9 + hash(i)) % 1;
          const r = 320 * (1 - life);
          const a = hash(i * 7) * TAU + life * 3;
          circle(ctx, sx + Math.cos(a) * r, sy - 80 + Math.sin(a) * r * 0.7, 3 + 3 * life, `rgba(255,220,100,${0.8 * life * charge})`);
        }
        ctx.restore();
      }
      let so = { ...POSE.sonicHover(lt), expr: lt > 15 && lt < 18.6 ? 'grin' : 'determined' };
      let zp = { legs: [[-0.3, -0.05], [0.3, -0.12]], arms: [[-0.2, 0.5], [0.25, 0.6]] };
      if (lt > 25) zp = POSE.saiWindup(E.out(prog(lt, 25, 26.2)));
      if (lt > 28.5) {
        const r = E.in(prog(lt, 28.5, 29));
        sx = lerp(980, 720, r);
        sy = lerp(330, 470, r);
        zx = lerp(ROCK11[0], 560, r);
        zy = lerp(rockY - 16, 520, r);
        so = { ...POSE.sonicKick(), expr: 'determined' };
        zp = { ...POSE.saiPunch(1), air: true };
        streak(ctx, 980, 250, sx, sy - 80, 1, '#ffd84a', 30, 1);
      }
      drawSaitama(ctx, zx, zy, 0.85, 1, { ...zp, t: lt, expr: 'serious', wind: 0.9, talk: speaking(lt, L11, 'saitama') });
      drawSonic(ctx, sx, sy, 0.8, -1, { ...so, t: lt, sup: 1, aura: 1 + charge, air: true, quillWob: 1, talk: speaking(lt, L11, 'sonic') });
      talk(ctx, lt, L11, { sonic: sonTop(sx, sy, 0.8, -1), saitama: saiTop(zx, zy, 0.85) });
    } else if (lt > 31) {
      const u = prog(lt, 32, 39);
      const sup = 1 - prog(lt, 31, 32.5);
      drawSonic(ctx, lerp(700, 680, u), lerp(380, 700, E.in(u)), 0.32, -1, { t: lt, sup, rot: lt * 3, air: true, expr: 'dizzy', legs: [[0.6, -0.3], [-0.4, -0.4]] });
      drawSaitama(ctx, lerp(580, 610, u), lerp(400, 720, E.in(u)), 0.3, 1, { t: lt, rot: -lt * 2.2, air: true, wind: 1 });
    }
    for (let r = 0; r < 3; r++) shock(ctx, 640, 380, prog(lt, 29 + r * 0.25, 31 + r * 0.25), 900, { w: 30, col: '#ffffff' });
    ctx.restore();
    if (lt > 26.5 && lt < 28.6) {
      focusLines(ctx, 640, 360, lt, { alpha: 0.5, r0: 300 });
      const s1 = slam(lt - 26.5);
      bigText(ctx, 'SERIOUS', 640, 300, 130, { fill: '#ffd21f', stroke: INK, sw: 16, scale: s1.s, alpha: s1.a * (1 - prog(lt, 28.3, 28.6)), shadow: '#e3262f', rot: -0.05 });
      const s2 = slam(lt - 26.9);
      if (s2) bigText(ctx, 'PUNCH', 640, 440, 150, { fill: '#ffffff', stroke: INK, sw: 18, scale: s2.s, alpha: s2.a * (1 - prog(lt, 28.3, 28.6)), shadow: '#e3262f', rot: 0.03 });
    }
    if (lt > 29) flash(ctx, 1 - prog(lt, 29.4, 31.8));
    sfx(ctx, 'BOOOOOM!', 640, 200, 120, lt, 29.3, 2.8, { fill: '#ff7a1a', rot: -0.06 });
  },
});

/* ---------- 12. The Cabbage ---------- */

const L12 = [
  [5.0, 9.0, 'sonic', '...You missed me. On purpose?'],
  [9.5, 13.5, 'saitama', 'You looked like you were having fun.'],
  [14.0, 18.0, 'sonic', "Heh... yeah. Best fight I've had in ages!"],
  [22.0, 25.5, 'saitama', 'MY CABBAGE!!!', { shout: true }],
  [26.0, 28.6, 'sonic', 'Uh... my bad.'],
  [29.0, 32.6, 'saitama', 'The sale ends in five minutes. The store is across town...'],
  [33.0, 37.0, 'sonic', 'Five minutes? I only need five SECONDS. Hop on!'],
];

scene({
  id: 'cabbage',
  name: 'The Cabbage',
  dur: 38,
  lines: L12,
  music: [[0, 'none'], [4, 'calm'], [22, 'none'], [26, 'calm'], [33, 'speed']],
  cues: [[0.4, 'thud'], [3.0, 'boing'], [20.5, 'pop'], [22, 'sting'], [37.3, 'whoosh'], [37.4, 'zip']],
  draw(ctx, lt) {
    const G = MESA_G;
    const ZX = 430;
    const SX = 720;
    const [qx, qy] = shakeXY(lt, 6 * env(lt, 22, 25.5, 0.2));
    ctx.save();
    ctx.translate(qx, qy);
    mesaBG(ctx, 900, { t: lt });
    ell(ctx, 760, G + 22, 300, 44, 0, '#8a4a2c', 3.5);
    ell(ctx, 760, G + 28, 240, 30, 0, '#6e3820', 0);
    for (let i = 0; i < 9; i++) pebble(ctx, 470 + i * 70, G + 4 + Math.sin(i * 2) * 10, 6 + hash(i + 70) * 6, i + 70);
    ell(ctx, ROCK_X, G - 4, 26, 8, 0, '#3a2318', 2.5);

    if (lt > 22 && lt < 25.5) focusLines(ctx, ZX, G - 200, lt, { alpha: 0.4, r0: 200 });

    const gone = lt > 37.2;
    const zDrop = lt < 0.4 ? lerp(-300, G, E.in(prog(lt, 0, 0.4))) : G;
    if (!gone) {
      let zexpr = 'ok';
      if (lt > 22 && lt < 25.5) zexpr = 'shock';
      else if (lt > 29 && lt < 32.6) zexpr = 'sad';
      const leafOn = lt > 20.5;
      drawSaitama(ctx, ZX, zDrop, ZS, 1, {
        t: lt,
        expr: zexpr,
        look: lt > 20.6 && lt < 22 ? 1 : 0,
        blink: blinkAt(lt, 3.3),
        talk: speaking(lt, L12, 'saitama'),
        carry: null,
        ...(lt > 22 && lt < 25.5 ? { arms: [[0.6, 2.4], [0.8, 2.5]], hands: ['open', 'open'] } : {}),
      });
      if (leafOn) {
        ctx.save();
        ctx.translate(ZX + 2, zDrop - 228);
        ctx.rotate(-0.3);
        ell(ctx, 0, 0, 20, 9, 0, '#7cc96f', 2.5);
        ctx.restore();
      }
    }
    if (lt > 18 && lt < 20.5) {
      const u = prog(lt, 18, 20.5);
      ctx.save();
      ctx.translate(ZX + 2 + Math.sin(lt * 3.2) * 60 * (1 - u), lerp(-30, zDrop - 228, u));
      ctx.rotate(Math.sin(lt * 3.2) * 0.8);
      ell(ctx, 0, 0, 20, 9, 0, '#7cc96f', 2.5);
      ctx.restore();
    }
    puffs(ctx, ZX, G, prog(lt, 0.4, 1.8), { n: 8, spread: 140, seed: 61, size: 28, color: '#e8b98f', shade: '#c48a62' });

    let sx = SX;
    let sy = G + 6;
    if (!gone) {
      let so;
      if (lt < 3) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-50, -50, W + 100, G + 74);
        ctx.clip();
        drawSonic(ctx, 640, G + 8, SS, -1, { t: lt, rot: -Math.PI / 2, air: true, legs: [[0.1, -0.1], [0.25, -0.1]], arms: [[-0.4, 0.2], [0.3, 0.2]], expr: 'dizzy' });
        ctx.restore();
      } else {
        sy = G - hop(lt, 3, 3.4, 60);
        if (lt < 26) so = { ...POSE.sonicSit(), expr: lt > 14 && lt < 18 ? (speaking(lt, L12, 'sonic') ? 'grin' : 'laugh') : lt > 20.6 ? 'neutral' : 'smirk', look: lt > 20.6 && lt < 22 ? -1 : 0 };
        else if (lt < 33) so = { expr: 'sheepish' };
        else so = { ...POSE.sonicThumb(), expr: 'grin' };
        drawSonic(ctx, sx, sy, SS, -1, { t: lt, ...so, talk: speaking(lt, L12, 'sonic'), blink: blinkAt(lt, 2.9, 23) });
      }
    } else {
      streak(ctx, ZX, G - 80, 1500, G - 80, (lt - 37.2) / 0.35, '#4f8cff', 26, 0.8);
      puffs(ctx, ZX + 120, G, prog(lt, 37.2, 38.5), { n: 10, spread: 180, seed: 81, size: 30, color: '#e8b98f', shade: '#c48a62' });
    }
    puffs(ctx, 760, G, prog(lt, 0, 6), { n: 18, spread: 420, seed: 91, size: 70, rise: 80, color: '#d9cbb8', shade: '#b9a68e' });
    ctx.restore();
    talk(ctx, lt, L12, { saitama: saiTop(ZX, G), sonic: sonTop(sx, lt < 26 ? G - 0 : G, SS, -1) });
  },
});

/* ---------- 13. The Sale ---------- */

const L13 = [
  [4.0, 6.4, 'sonic', 'Go, go, go!'],
  [13.0, 16.0, 'saitama', 'Made it. Thanks.'],
  [16.2, 18.4, 'sonic', 'No problem!'],
  [21.0, 25.0, 'sonic', 'Same time tomorrow? Rematch?'],
  [25.5, 29.5, 'saitama', "Sure. But you're buying the groceries."],
  [30.0, 32.0, 'sonic', 'Deal!'],
  [34.0, 37.5, 'saitama', "Huh. That crab's still flying."],
];

scene({
  id: 'sale',
  name: 'The Sale',
  dur: 38,
  lines: L13,
  music: [[0, 'happy']],
  cues: [[2.4, 'whoosh'], [2.6, 'skid'], [3.2, 'thud'], [6.5, 'zip'], [7.4, 'beep'], [8.0, 'tick'], [8.2, 'beep'], [8.9, 'beep'], [9.6, 'beep'], [10.2, 'beep'], [10.9, 'beep'], [12.0, 'whoosh'], [12.6, 'tick'], [32.6, 'twinkle']],
  draw(ctx, lt) {
    const G = CITY_G;
    if (lt < 19.6) {
      const secs = 52 + Math.floor(Math.max(0, lt));
      const clock = secs < 60 ? `18:59:${String(secs).padStart(2, '0')}` : `19:00:${String(secs - 60).padStart(2, '0')}`;
      martBG(ctx, lt, { clock, clockRed: secs >= 60, closed: lt > 12.6, shake: 4 * env(lt, 7, 12, 0.3) });
      const inside = lt > 6.6 && lt < 12;
      if (lt > 2.4 && !inside) {
        let sx = kf(lt, [[2.4, -200], [3.0, 470, E.out3]]);
        let so = { expr: 'grin' };
        let carry = null;
        if (lt < 3.2) so = { arms: [[2.9, 0.15], [2.8, 0.2]], hands: ['open', 'open'], expr: 'grin' };
        else if (lt < 6.5) so = { arms: [[-0.2, 0.4], [1.55, 0.05]], hands: ['fist', 'point'], expr: 'grin' };
        if (lt > 12) {
          sx = 790;
          so = lt > 16.2 && lt < 18.4 ? { ...POSE.sonicThumb(), expr: 'grin' } : { expr: 'happy' };
          carry = dogIn;
        }
        if (lt < 3.2) {
          drawSaitama(ctx, sx + 118, G - 180, 0.9, 1, { t: lt, rot: -Math.PI / 2, air: true, legs: [[0.05, 0], [-0.05, 0]], wind: 0.8 });
        }
        drawSonic(ctx, sx, G, SS, lt > 12 ? -1 : 1, { t: lt, ...so, carry, talk: speaking(lt, L13, 'sonic'), blink: blinkAt(lt, 3, 29) });
        if (lt > 3.2) {
          const zx = lt > 12 ? 560 : 610;
          const zy = G - hop(lt, 3.2, 3.6, 70);
          drawSaitama(ctx, zx, zy, ZS, 1, {
            t: lt,
            expr: lt > 12 ? 'happy' : 'ok',
            talk: speaking(lt, L13, 'saitama'),
            carry: lt > 12 ? bagIn(1.1) : null,
            blink: blinkAt(lt, 3.3),
          });
        }
        if (lt < 3.1) puffs(ctx, sx - 30, G, prog(lt, 2.6, 3.4), { n: 6, spread: 90, seed: 101, size: 22, dx: -40 });
        talk(ctx, lt, L13, { sonic: sonTop(sx, G, SS, lt > 12 ? -1 : 1), saitama: saiTop(lt > 12 ? 560 : 610, G) });
      }
      if (lt > 6.5 && lt < 7.1) streak(ctx, 470, G - 70, 640, G - 70, (lt - 6.5) / 0.25, '#4f8cff', 22, 0.7);
      if (lt > 12 && lt < 12.5) streak(ctx, 640, G - 70, 790, G - 70, (lt - 12) / 0.25, '#4f8cff', 22, 0.7);
      const pops = [['BEEP!', 420, 330, 7.4], ['SALE!!', 860, 300, 8.0], ['BEEP!', 470, 400, 8.9], ['CABBAGE!', 820, 390, 9.6], ['BEEP!', 400, 310, 10.2], ['THANK YOU!', 860, 330, 10.9]];
      for (const [s, x, y, t0] of pops) sfx(ctx, s, x, y, 40, lt, t0, 0.9, { fill: '#ffffff', rot: (hash(t0) - 0.5) * 0.4 });
      if (lt > 18.4) flash(ctx, prog(lt, 18.4, 19.4), '#000');
      return;
    }
    rooftopBG(ctx, lt);
    drawBag(ctx, 420, 548 - 60, 1);
    drawBag(ctx, 380, 548 - 60, 0.9, 0.1);
    drawSaitama(ctx, 520, 556, ZS, 1, { ...POSE.saiSitLedge(lt), hipLift: -98, t: lt, expr: 'ok', wind: 0.25, blink: blinkAt(lt, 3.4), talk: speaking(lt, L13, 'saitama'), look: lt > 32.6 && lt < 37.5 ? 1 : 0 });
    const eat = lt < 20.5 || (lt > 32 && lt < 34) ? 1 : 0;
    drawSonic(ctx, 700, 556, SS, 1, {
      t: lt,
      air: true,
      hipLift: -58,
      legs: [[1.5, -1.45 + Math.sin(lt * 2.4) * 0.15], [1.6, -1.55 + Math.sin(lt * 2.4 + 1.4) * 0.15]],
      arms: [[0.3, 0.5], eat ? [1.6, 2.2] : [0.6, 1.4]],
      expr: lt > 30 && lt < 32 ? 'laugh' : 'smirk',
      carry: dogIn,
      talk: speaking(lt, L13, 'sonic'),
      blink: blinkAt(lt, 3.1, 31),
    });
    if (lt > 32.6 && lt < 34.4) {
      const u = prog(lt, 32.6, 34.2);
      const x = lerp(1340, 640, u);
      const y = lerp(40, 250, u);
      streak(ctx, 1340, 40, 640, 250, u, '#ffffff', 5, 0.35);
      drawCrab(ctx, x, y, 0.12, -1, { t: lt, rot: lt * 8, claw: 1 });
    }
    if (lt < 20.6) flash(ctx, 1 - prog(lt, 19.6, 20.6), '#000');
    talk(ctx, lt, L13, { sonic: sonTop(700, 556 - 40, SS), saitama: saiTop(520, 556 - 96) });
  },
});

/* ---------- 14. Credits ---------- */

const CREDITS = [
  [3.0, 'SONIC vs ONE PUNCH MAN', 34, '#ffffff', FONT_D],
  [4.6, 'A fan-made cartoon, drawn live in HTML canvas', 26, '#d9d3ea', FONT_T],
  [6.2, 'Sonic the Hedgehog belongs to SEGA', 24, '#9fbaff', FONT_T],
  [7.2, 'One-Punch Man belongs to ONE and Yusuke Murata', 24, '#ffe27a', FONT_T],
  [8.2, 'Made for fun. Not affiliated with either.', 24, '#d9d3ea', FONT_T],
  [10.0, 'Thanks for watching!', 40, '#ffd21f', FONT_D],
];

scene({
  id: 'credits',
  name: 'Credits',
  dur: 22,
  fadeOut: 1.6,
  music: [[0, 'happy']],
  cues: [[1.0, 'punch'], [10, 'sparkle']],
  draw(ctx, lt) {
    sky(ctx, 'night');
    stars(ctx, lt);
    moon(ctx, 1110, 110, 40);
    const s = slam(lt - 1.0);
    if (s) bigText(ctx, 'THE END', 640, 120, 110, { fill: '#ffd21f', stroke: INK, sw: 16, scale: s.s, alpha: s.a, shadow: '#2f6bff', rot: -0.03 });
    CREDITS.forEach(([t0, text, size, col, face], i) => {
      const a = prog(lt, t0, t0 + 0.6);
      if (a <= 0) return;
      bigText(ctx, text, 640, 238 + i * 50 + (1 - a) * 12, size, { fill: col, alpha: a, face, stroke: INK, sw: face === FONT_D ? 8 : 5, maxW: 900 });
    });
    const up = E.out3(prog(lt, 1.5, 2.6));
    drawSonic(ctx, 250, 870 - up * 150, 1.25, 1, { t: lt, ...POSE.sonicThumb(), expr: 'grin', blink: blinkAt(lt, 3, 41) });
    drawSaitama(ctx, 1040, 900 - up * 150, 1.05, -1, { t: lt, ...POSE.saiWave(lt), expr: 'happy', wind: 0.3 });
  },
});
