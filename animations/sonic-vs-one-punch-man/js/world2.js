'use strict';
/* Round 2 sets: the ruined district of City Z, Saitama's apartment block by morning, his room at night,
   and a scrap of outer space. Everything is drawn far past the frame so the fight camera can roam. */

const RUIN_G = 600;
// Fixed set pieces in the ruins, in world units.
const RUIN = {
  wallX: 1150, // tall broken wall Sonic runs up
  wallTop: 230,
  towerX: 880, // leaning tower Shadow appears on
  towerTop: 150,
  slabX: 1420, // where the groceries sit
};

SKY.morning = [[0, '#6fb3f0'], [0.6, '#b9dcf7'], [1, '#ffe7c4']];
SKY.haze = [[0, '#6f9fd6'], [0.55, '#c8c9d6'], [1, '#f2c99a']];
SKY.space = [[0, '#02030a'], [1, '#0b1030']];

function brokenLayer(seed, w, h, col, win, minH, maxH) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const r = rnd(seed);
  let x = 0;
  while (x < w) {
    let bw = 90 + r() * 160;
    if (w - (x + bw) < 90) bw = w - x;
    const bh = minH + r() * (maxH - minH);
    const top = h - bh;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(x, h);
    g.lineTo(x, top + r() * 30);
    const n = 3 + Math.floor(r() * 4);
    for (let i = 1; i <= n; i++) g.lineTo(x + (bw * i) / n, top + r() * (i % 2 ? 60 : 18) + (r() < 0.3 ? 50 : 0));
    g.lineTo(x + bw, h);
    g.closePath();
    g.fill();
    g.fillStyle = win;
    for (let i = 0; i < Math.floor((bw - 14) / 22); i++) {
      for (let j = 0; j < Math.floor((bh - 60) / 30); j++) {
        if (r() < 0.55) g.fillRect(x + 10 + i * 22, top + 60 + j * 30, 10, 14);
      }
    }
    if (r() < 0.6) {
      g.strokeStyle = win;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x + bw * 0.3, top + 40);
      g.lineTo(x + bw * 0.45, top + 90);
      g.lineTo(x + bw * 0.38, top + 140);
      g.stroke();
    }
    x += bw + (r() < 0.4 ? 10 + r() * 40 : 0);
  }
  return c;
}

function buildWorld2() {
  BG.day = [
    skylineLayer(11, 2400, 360, { col: '#a9b6d2', win: '#e9eef8', lit: 0.12, minH: 110, maxH: 250, minW: 50, maxW: 120 }),
    skylineLayer(23, 2200, 420, { col: '#8996b8', win: '#f2f5fb', lit: 0.18, minH: 160, maxH: 330, minW: 70, maxW: 150 }),
    skylineLayer(37, 2000, 500, { col: '#66729a', win: '#dde5f5', lit: 0.25, minH: 220, maxH: 450, minW: 110, maxW: 210 }),
  ];
  BG.ruinFar = brokenLayer(41, 2400, 340, '#a7a3b8', '#8b879c', 120, 280);
  BG.ruinMid = brokenLayer(57, 2200, 420, '#7c7689', '#58536a', 170, 360);
}

function ruinsBG(ctx, o = {}) {
  const px = o.px || 0;
  const t = o.t || 0;
  sky(ctx, 'haze');
  sunDisc(ctx, 980 - px * 0.95, 200, 54, '#fff8e0', 'rgba(255,220,170,');
  clouds(ctx, BG.cloudsDay, t * 10 + px * 0.05, 180, 560, 0.9, 0.7, 7);
  tile(ctx, BG.day[0], 300 - px * 0.9, RUIN_G - 70 - BG.day[0].height, 0.7);
  tile(ctx, BG.ruinFar, 500 - px * 0.8, RUIN_G - 40 - BG.ruinFar.height);
  const hz = ctx.createLinearGradient(0, RUIN_G - 300, 0, RUIN_G);
  hz.addColorStop(0, 'rgba(242,201,154,0)');
  hz.addColorStop(1, 'rgba(242,201,154,0.45)');
  ctx.fillStyle = hz;
  ctx.fillRect(-1500, RUIN_G - 300, W + 3000, 300);
  tile(ctx, BG.ruinMid, 800 - px * 0.6, RUIN_G - 18 - BG.ruinMid.height);
  // ground
  const g = ctx.createLinearGradient(0, RUIN_G - 20, 0, H + 200);
  g.addColorStop(0, '#9a93a3');
  g.addColorStop(1, '#5b5463');
  ctx.fillStyle = g;
  ctx.fillRect(-1500, RUIN_G - 20, W + 3000, H + 600);
  ctx.fillStyle = '#b3acbb';
  ctx.fillRect(-1500, RUIN_G - 20, W + 3000, 4);
  ctx.strokeStyle = 'rgba(30,20,40,0.35)';
  ctx.lineWidth = 2;
  for (let i = -10; i < 22; i++) {
    const x = i * 150 + hash(i) * 70;
    const y = RUIN_G + 10 + hash(i * 3) * 90;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 30, y + 8);
    ctx.lineTo(x + 50, y + 2);
    ctx.lineTo(x + 80, y + 10);
    ctx.stroke();
  }
  for (let i = -6; i < 16; i++) {
    const x = i * 230 + hash(i + 50) * 120;
    if (Math.abs(x - RUIN.slabX) < 120 || Math.abs(x - 640) < 260) continue;
    rubble(ctx, x, RUIN_G - 6 + hash(i) * 30, 30 + hash(i + 9) * 40, i);
  }
}

function rubble(ctx, x, y, w, seed) {
  for (let k = 0; k < 4; k++) {
    const rx = x + (hash(seed * 7 + k) - 0.5) * w;
    const rw = w * (0.35 + hash(seed + k * 3) * 0.4);
    poly(ctx, [[rx - rw / 2, y], [rx - rw * 0.3, y - rw * 0.5], [rx + rw * 0.2, y - rw * 0.6], [rx + rw / 2, y]], k % 2 ? '#8a8494' : '#a39dab', 2.2);
  }
  ctx.beginPath();
  ctx.moveTo(x - w * 0.2, y - 4);
  ctx.lineTo(x + w * 0.1, y - w * 0.9);
  strokeNow(ctx, 2.5, '#6b4a3a');
}

// The tall broken wall Sonic runs up. Its right face is the running surface at x = wallX.
function ruinWall(ctx) {
  const x = RUIN.wallX;
  const top = RUIN.wallTop;
  ctx.beginPath();
  ctx.moveTo(x - 30, RUIN_G);
  ctx.lineTo(x - 30, top + 40);
  ctx.lineTo(x - 10, top + 10);
  ctx.lineTo(x + 20, top + 30);
  ctx.lineTo(x + 50, top);
  ctx.lineTo(x + 80, top + 50);
  ctx.lineTo(x + 140, top + 20);
  ctx.lineTo(x + 160, RUIN_G);
  ctx.closePath();
  ctx.fillStyle = '#8a8296';
  ctx.fill();
  strokeNow(ctx, 3.5, INK);
  ctx.fillStyle = '#4c4659';
  for (let j = 0; j < 7; j++) for (let i = 0; i < 3; i++) if (hash(i * 9 + j) < 0.7) ctx.fillRect(x - 12 + i * 50, top + 80 + j * 44, 24, 26);
  ctx.beginPath();
  ctx.moveTo(x + 10, top + 60);
  ctx.lineTo(x + 30, top + 140);
  ctx.lineTo(x + 18, top + 220);
  strokeNow(ctx, 2, INK);
}

// The leaning tower stump Shadow stands on.
function ruinTower(ctx, x = RUIN.towerX, top = RUIN.towerTop) {
  ctx.save();
  ctx.translate(x, RUIN_G);
  ctx.rotate(0.08);
  ctx.beginPath();
  ctx.moveTo(-60, 0);
  ctx.lineTo(-48, top - RUIN_G + 30);
  ctx.lineTo(-30, top - RUIN_G);
  ctx.lineTo(-8, top - RUIN_G + 18);
  ctx.lineTo(16, top - RUIN_G - 6);
  ctx.lineTo(40, top - RUIN_G + 26);
  ctx.lineTo(58, 0);
  ctx.closePath();
  ctx.fillStyle = '#6f687c';
  ctx.fill();
  strokeNow(ctx, 3.5, INK);
  ctx.fillStyle = '#433d50';
  for (let j = 0; j < 8; j++) ctx.fillRect(-30, top - RUIN_G + 60 + j * 50, 18, 26);
  for (let j = 0; j < 8; j++) ctx.fillRect(10, top - RUIN_G + 70 + j * 50, 18, 26);
  ctx.restore();
}

function groceriesSlab(ctx, bags = true) {
  const x = RUIN.slabX;
  ctx.beginPath();
  rr(ctx, x - 80, RUIN_G - 70, 160, 64, 6);
  ctx.fillStyle = '#b1aab9';
  ctx.fill();
  strokeNow(ctx, 3, INK);
  if (bags) {
    drawBag(ctx, x - 38, RUIN_G - 70 - 60, 1);
    drawBag(ctx, x + 2, RUIN_G - 70 - 60, 1.05, 0.05);
    drawBag(ctx, x + 40, RUIN_G - 70 - 56, 0.95, -0.06);
  }
}

/* ---------- Saitama's apartment block, morning ---------- */

function apartmentExterior(ctx, cam = 0) {
  sky(ctx, 'morning');
  sunDisc(ctx, 1080, 120, 48, '#fffbea', 'rgba(255,240,200,');
  clouds(ctx, BG.cloudsDay, cam * 0.04 + 200, 200, 520, 0.9, 0.9, 3);
  tile(ctx, BG.day[0], cam * 0.1, CITY_G - 20 - BG.day[0].height);
  tile(ctx, BG.day[1], cam * 0.25, CITY_G - 16 - BG.day[1].height);
  tile(ctx, BG.day[2], cam * 0.5, CITY_G - 14 - BG.day[2].height);
  // the apartment block
  const x0 = 170;
  const x1 = 760;
  const top = 170;
  const base = CITY_G - 14;
  ctx.fillStyle = '#e8dfcd';
  ctx.fillRect(x0, top, x1 - x0, base - top);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(x0, top, x1 - x0, base - top);
  for (let f = 0; f < 3; f++) {
    const fy = top + 40 + f * 135;
    ctx.fillStyle = '#c9bea9';
    ctx.fillRect(x0, fy + 92, x1 - x0, 10);
    for (let d = 0; d < 4; d++) {
      const dx = x0 + 40 + d * 140;
      ctx.fillStyle = d === 1 && f === 2 ? '#7d5a3c' : '#9a7a5a';
      ctx.fillRect(dx, fy + 10, 48, 82);
      ctx.strokeRect(dx, fy + 10, 48, 82);
      circle(ctx, dx + 40, fy + 54, 3, '#f2c230');
      ctx.fillStyle = '#bfe0f5';
      ctx.fillRect(dx + 64, fy + 22, 50, 38);
      ctx.strokeRect(dx + 64, fy + 22, 50, 38);
    }
    ctx.strokeStyle = '#6d6250';
    ctx.lineWidth = 3;
    for (let r = 0; r < 25; r++) {
      ctx.beginPath();
      ctx.moveTo(x0 + r * 24, fy + 92);
      ctx.lineTo(x0 + r * 24, fy + 70);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(x0, fy + 70);
    ctx.lineTo(x1, fy + 70);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
  }
  // outside stairs
  ctx.strokeStyle = '#6d6250';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x1, base);
  ctx.lineTo(x1 + 110, top + 310);
  ctx.lineTo(x1, top + 175);
  ctx.lineTo(x1 + 110, top + 40);
  ctx.stroke();
  bigText(ctx, 'APARTMENTS', (x0 + x1) / 2, top - 22, 22, { fill: INK, face: FONT_D });
  street(ctx, cam, false);
}

/* ---------- Saitama's room, night ---------- */

function apartmentRoom(ctx, t) {
  ctx.fillStyle = '#e8d9bd';
  ctx.fillRect(-1500, -1500, W + 3000, H + 3000);
  ctx.fillStyle = '#d9c7a5';
  ctx.fillRect(-1500, 0, W + 3000, 70);
  // window with the night city
  ctx.save();
  ctx.beginPath();
  ctx.rect(760, 110, 400, 260);
  ctx.clip();
  sky(ctx, 'night');
  ctx.drawImage(BG.stars, 0, 0);
  ctx.drawImage(BG.night[1], 200, 0, 1200, 420, 600, 160, 900, 315);
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(760, 110, 400, 260);
  ctx.beginPath();
  ctx.moveTo(960, 110);
  ctx.lineTo(960, 370);
  ctx.stroke();
  // poster and shelf
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(170, 130, 140, 190);
  ctx.strokeRect(170, 130, 140, 190);
  bigText(ctx, 'SALE', 240, 180, 30, { fill: '#e3262f' });
  bigText(ctx, 'TUESDAYS', 240, 222, 18, { fill: INK });
  drawCabbage(ctx, 240, 272, 26);
  // floor
  ctx.fillStyle = '#cdb98a';
  ctx.fillRect(-1500, 470, W + 3000, H + 600);
  ctx.strokeStyle = 'rgba(80,60,20,0.35)';
  ctx.lineWidth = 3;
  for (let i = -6; i < 14; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 180, 470);
    ctx.lineTo(i * 180 - 220, H + 40);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-1500, 470);
  ctx.lineTo(W + 1500, 470);
  strokeNow(ctx, 4, INK);
}

// Low table with the hot pot, drawn in front of whoever sits at it.
function hotPotTable(ctx, t) {
  ctx.beginPath();
  rr(ctx, 360, 560, 560, 40, 8);
  ctx.fillStyle = '#8a5a34';
  ctx.fill();
  strokeNow(ctx, 4, INK);
  ctx.fillStyle = '#6f4527';
  ctx.fillRect(390, 600, 30, 80);
  ctx.fillRect(860, 600, 30, 80);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(390, 600, 30, 80);
  ctx.strokeRect(860, 600, 30, 80);
  ell(ctx, 640, 548, 120, 30, 0, '#3b3b46', 4);
  ell(ctx, 640, 540, 104, 22, 0, '#d9a25a', 3);
  for (let i = 0; i < 7; i++) drawCabbage(ctx, 570 + i * 22, 538 + Math.sin(i * 2) * 4, 9, i);
  for (let i = 0; i < 5; i++) {
    const ph = (t * 0.35 + i * 0.2) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - ph) * 0.55;
    circle(ctx, 600 + i * 22 + Math.sin(t * 2 + i) * 8, 520 - ph * 140, 12 + ph * 16, '#ffffff');
    ctx.restore();
  }
  for (const bx of [470, 810]) {
    ell(ctx, bx, 552, 34, 12, 0, '#f4f1e8', 3);
    ell(ctx, bx, 548, 26, 7, 0, '#e3c47f', 0);
  }
}

/* ---------- space ---------- */

function spaceBG(ctx, t) {
  sky(ctx, 'space');
  stars(ctx, t);
  ctx.save();
  ctx.beginPath();
  ctx.arc(640, 1700, 1200, 0, TAU);
  const g = ctx.createRadialGradient(640, 1700, 900, 640, 1700, 1230);
  g.addColorStop(0, '#2a7bd6');
  g.addColorStop(0.92, '#6fc0ff');
  g.addColorStop(1, 'rgba(160,220,255,0)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = '#3ba55c';
  for (let i = 0; i < 6; i++) ell(ctx, 200 + i * 200 + Math.sin(i) * 40, 560 + (i % 2) * 40, 90, 26, 0.1, '#3ba55c', 0);
  ctx.restore();
}
