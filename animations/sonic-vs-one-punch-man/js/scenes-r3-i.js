'use strict';
/* Round 3, chapter 9 and credits: the ride home as a fireball, a landing outside Saitama's apartment,
   the question of who pays, and the crab, still in orbit. */

const L9 = [
  [6.4, 7.8, 'sonic', '...Did we win?'],
  [8.0, 8.8, 'shadow', 'No.'],
  [9.0, 10.6, 'saitama', 'The supermarket opens in ten minutes.'],
  [10.8, 11.8, 'sonic', '...Is there a sale?'],
  [12.0, 13.1, 'saitama', 'Cabbage. Half price.'],
  [14.3, 15.6, 'saitama', '...Wait. Who\'s paying?'],
];

const ZH9 = 880;
const SON9 = 750;
const SHD9 = 1010;

scene({
  id: 'home',
  name: 'Home',
  dur: 16.4,
  fadeOut: 0.4,
  lines: L9,
  music: [[0, 'space'], [5.6, 'calm'], [13.4, 'speed']],
  cues: [[0.2, 'wind'], [1.4, 'whoosh'], [3.0, 'jet'], [4.4, 'bigboom'], [4.42, 'thud'], [5.8, 'thud'], [5.9, 'thud'], [13.5, 'zip'], [13.8, 'zip'], [15.6, 'whoosh']],
  draw(ctx, lt) {
    if (lt < 3.0) {
      // re-entry: a fireball dropping onto the Earth
      const c = { x: 640, y: 360, z: 1, r: 0 };
      starfield(ctx, c, lt, { neb: 0.6 });
      earth(ctx, 560, 1260, 900, lt, { spin: 0.01, shade: 0.4 });
      const u = E.in(prog(lt, 0, 3.0));
      const fx = lerp(1180, 600, u);
      const fy = lerp(-60, 520, u);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const k = i / 6;
        circle(ctx, fx + (1180 - 600) * 0.06 * i, fy - (580 * 0.06) * i, 34 * (1 - k * 0.6) * (0.6 + u), `rgba(255,${180 - i * 20},80,${0.55 * (1 - k)})`);
      }
      ctx.restore();
      drawZ(ctx, { x: fx, y: fy, s: 0.3, dir: -1, rot: 2.4, legs: [[0.4, -0.6], [0.6, -0.8]], arms: [[1.3, 0.4], [1.5, 0.3]] }, lt, { torn: 1, rip: 0.9 });
      return;
    }
    if (lt < 4.6) {
      apartmentExterior(ctx, 0);
      const u = E.in(prog(lt, 3.0, 4.4));
      const fx = lerp(1300, ZH9, u);
      const fy = lerp(-100, CITY_G - 60, u);
      if (lt < 4.4) {
        streak(ctx, 1500, -400, fx, fy, 1, '#ffa040', 34, 0.6);
        circle(ctx, fx, fy, 40, 'rgba(255,230,160,0.9)');
      } else {
        flash(ctx, 1 - prog(lt, 4.4, 4.6), '#fff4dc');
      }
      return;
    }
    const [qx, qy] = shakeXY(lt, 14 * (1 - prog(lt, 4.6, 5.4)));
    ctx.save();
    ctx.translate(qx, qy);
    apartmentExterior(ctx, 0);
    ell(ctx, ZH9, CITY_G + 4, 210, 34, 0, '#6d6458', 3);
    ell(ctx, ZH9, CITY_G, 180, 24, 0, '#4f4840', 0);
    cracks(ctx, ZH9, CITY_G + 2, 1, 9, 1.6);
    const down = lt > 5.8;
    // Saitama in rags, holding them both by the scruff, then setting them down
    const zArms = down ? (lt > 9.0 && lt < 10.6 ? [[-0.1, 0.2], [0.9, 1.3]] : [[-0.05, 0.15], [0.1, 0.15]]) : [[1.1, 0.3], [1.2, 0.25]];
    const leave = prog(lt, 15.6, 16.4);
    drawSaitama(ctx, ZH9 - leave * 500, CITY_G, 1, -1, {
      t: lt,
      ...(leave > 0 ? POSE.saiJog(lt * 12) : { legs: ZP.stand.legs }),
      arms: leave > 0 ? POSE.saiJog(lt * 12).arms : zArms,
      hands: lt > 9.0 && lt < 10.6 ? ['fist', 'open'] : ['fist', 'fist'],
      expr: lt > 14.2 ? 'shock' : 'ok',
      talk: speaking(lt, L9, 'saitama'),
      blink: blinkAt(lt, 3.4, 5),
      torn: 1,
      rip: 0.9,
      wind: 0.3,
    });
    const dizzy = lt < 9.5;
    if (!down) {
      const [lhx, lhy] = saiPoint(ZH9, CITY_G, 1, -1, { legs: ZP.stand.legs, arms: zArms, ground: 1 }, 'handFar');
      const [rhx, rhy] = saiPoint(ZH9, CITY_G, 1, -1, { legs: ZP.stand.legs, arms: zArms, ground: 1 }, 'hand');
      drawSonic(ctx, lhx + 30, lhy + 130, SS, 1, { t: lt, air: true, legs: [[0.2, -0.3], [-0.1, -0.2]], arms: [[-0.3, 0.3], [0.2, 0.3]], expr: 'dizzy' });
      drawShadow(ctx, rhx - 30, rhy + 130, SS, -1, { t: lt, air: true, legs: [[0.2, -0.3], [-0.1, -0.2]], arms: [[-0.3, 0.3], [0.2, 0.3]], expr: 'pain' });
    } else {
      const sonLeave = prog(lt, 13.5, 13.75);
      const shdLeave = prog(lt, 13.8, 14.05);
      if (sonLeave < 1) {
        const sway = dizzy ? Math.sin(lt * 4) * 0.12 : 0;
        drawSonic(ctx, SON9 - sonLeave * 900, CITY_G, SS, lt > 13.3 ? -1 : 1, {
          t: lt,
          ...(sonLeave > 0 ? POSE.sonicDash(lt * 30) : { ...HP.stand, lean: sway }),
          expr: dizzy ? 'dizzy' : lt > 13.1 ? 'grin' : 'neutral',
          look: lt > 13.0 && lt < 13.4 ? 1 : 0,
          talk: speaking(lt, L9, 'sonic'),
          blink: blinkAt(lt, 3, 3),
        });
        if (sonLeave > 0) streak(ctx, SON9 + 100, CITY_G - 60, SON9 - sonLeave * 900, CITY_G - 60, 1, '#4f8cff', 20, 1);
      }
      if (shdLeave < 1) {
        const sway = dizzy ? Math.sin(lt * 3.6 + 1) * 0.1 : 0;
        drawShadow(ctx, SHD9 - shdLeave * 1300, CITY_G, SS, -1, {
          t: lt,
          ...(shdLeave > 0 ? { ...HP.skate, jet: 1 } : { ...HP.cross2, lean: sway }),
          expr: dizzy ? 'pain' : lt > 13.1 ? 'smirk' : 'scowl',
          look: lt > 13.0 && lt < 13.4 ? -1 : 0,
          talk: speaking(lt, L9, 'shadow'),
          blink: blinkAt(lt, 4, 6),
        });
        if (shdLeave > 0) streak(ctx, SHD9, CITY_G - 60, SHD9 - shdLeave * 1300, CITY_G - 60, 1, '#ff3b3b', 20, 1);
      }
    }
    puffs(ctx, ZH9, CITY_G, prog(lt, 4.6, 7.0), { n: 16, spread: 320, seed: 93, size: 40, rise: 40 });
    ctx.restore();
    talk(ctx, lt, L9, { saitama: [ZH9 - 5 - leave * 500, CITY_G - 250], sonic: [SON9, CITY_G - 160], shadow: [SHD9, CITY_G - 160] });
  },
});

/* ---------- credits ---------- */

const CREDITS3 = [
  [2.0, 'SONIC vs ONE PUNCH MAN: ROUND 3', 32, '#ffffff', FONT_D],
  [3.4, 'Hyper Shadic vs Serious Saitama', 26, '#bff6ff', FONT_T],
  [4.6, 'Every blow hand-keyed', 24, '#d9d3ea', FONT_T],
  [5.8, 'Sonic, Shadow and their fusion belong to SEGA and the fans', 21, '#9fbaff', FONT_T],
  [6.8, 'One-Punch Man belongs to ONE and Yusuke Murata', 22, '#ffe27a', FONT_T],
  [7.8, 'Made for fun. Not affiliated with either.', 22, '#d9d3ea', FONT_T],
  [9.4, 'Thanks for watching!', 40, '#ffd21f', FONT_D],
];

scene({
  id: 'credits3',
  name: 'Credits',
  dur: 22,
  fadeOut: 1.4,
  lines: [
    [16.0, 18.4, 'narrator', 'Meanwhile, near Saturn...'],
    [19.0, 21.4, 'crab', '...I HATE CITY Z.', { shout: true, at: [560, 260] }],
  ],
  music: [[0, 'happy'], [14.6, 'none']],
  cues: [[0.6, 'punch'], [9.4, 'sparkle'], [18.4, 'thud'], [18.42, 'ice']],
  draw(ctx, lt) {
    if (lt < 14.8) {
      sky(ctx, 'night');
      stars(ctx, lt);
      moon(ctx, 1120, 100, 38);
      const s = slam(lt - 0.6);
      if (s) bigText(ctx, 'THE END', 640, 100, 100, { fill: rainbowFill(ctx, 600), stroke: INK, sw: 16, scale: s.s, alpha: s.a, shadow: '#ffffff', rot: -0.03 });
      CREDITS3.forEach(([t0, text, size, col, face], i) => {
        const a = prog(lt, t0, t0 + 0.6);
        if (a <= 0) return;
        bigText(ctx, text, 640, 200 + i * 44 + (1 - a) * 12, size, { fill: col, alpha: a, face, stroke: INK, sw: face === FONT_D ? 8 : 5, maxW: 1000 });
      });
      const up = E.out3(prog(lt, 1.2, 2.4));
      drawSonic(ctx, 170, 880 - up * 160, 1.15, 1, { t: lt, ...POSE.sonicThumb(), expr: 'grin', blink: blinkAt(lt, 3, 41) });
      drawShadow(ctx, 370, 880 - up * 160, 1.15, 1, { t: lt, ...HP.cross2, expr: 'smile', blink: blinkAt(lt, 4, 43) });
      drawShadic(ctx, 640, 900 - up * 170, 0.8, 1, { t: lt, ...HP.cross2, expr: 'smirk', aura: 0.4, blink: blinkAt(lt, 3.5, 47), alpha: 0.9 });
      drawSaitama(ctx, 1090, 910 - up * 160, 1.05, -1, { t: lt, ...POSE.saiWave(lt), expr: 'happy', wind: 0.3, torn: 1, rip: 0.9 });
      if (lt > 13.8) flash(ctx, prog(lt, 13.8, 14.8), '#000');
      return;
    }
    // post-credits: the crab, adrift near Saturn, meets some ring ice
    const c = { x: 640, y: 360, z: 1, r: 0 };
    starfield(ctx, c, lt, { neb: 0.7 });
    saturn(ctx, 980, 430, 170, lt);
    const u = prog(lt, 14.8, 22);
    const bonk = lt > 18.4;
    const k = lt - 18.4;
    const cx = lerp(220, 640, u) + (bonk ? k * 60 : 0);
    const cy = 330 + Math.sin(lt) * 16 + (bonk ? k * 40 : 0);
    drawCrab(ctx, cx, cy, 0.42, -1, { t: lt, rot: lt * 0.4 + (bonk ? k * 3 : 0), claw: 0.6, talk: lt > 19.0 && lt < 21.4 });
    const ix = bonk ? cx + 60 - k * 300 : lerp(1400, cx + 60, prog(lt, 16.6, 18.4));
    const iy = bonk ? cy - 70 - k * 200 : lerp(120, cy - 70, prog(lt, 16.6, 18.4));
    ctx.drawImage(BG.ice[1], ix - 30, iy - 30, 60, 60);
    if (bonk) {
      hitFx(ctx, cx + 40, cy - 60, k, 0.6, '#bff6ff', 3);
      for (let i = 0; i < 3; i++) star4(ctx, cx - 20 + i * 30, cy - 110 + Math.sin(lt * 6 + i) * 6, 10 * env(lt, 18.5, 21.5, 0.3), lt * 4 + i, '#ffffff');
    }
    if (lt < 15.8) flash(ctx, 1 - prog(lt, 14.8, 15.8), '#000');
    talk(ctx, lt, [[16.0, 18.4, 'narrator', 'Meanwhile, near Saturn...'], [19.0, 21.4, 'crab', '...I HATE CITY Z.', { shout: true, at: [cx - 60, 170] }]], {});
  },
});
