/* The Unmaker War — the Unmaker, the Unmade, and the vast beings (Guardians, Titans, Wardens, Judges, Ferrymen, Valorion). */
(function () {
  'use strict';
  const UW = window.UW;
  const { TAU, lerp, sat, hash, noise, mix, shade, rgba, clamp } = UW;
  const R = UW.R;
  const FX = UW.FX;
  const RIG = UW.RIG;

  /* ================= THE UNMAKER ================= */
  const UNM = (UW.UNM = {});
  let ubuf = null;

  /* Front-facing silhouette parts in units of height h (origin at feet, y negative up). */
  function unmakerShapes(ctx, h, st, t) {
    const tr = st.pain ? noise(t * 30) * st.pain * 0.004 * h : 0;
    const lean = st.lean || 0;
    const hy = -0.93 * h;
    const armL = st.armL == null ? 0.06 : st.armL, armR = st.armR == null ? 0.06 : st.armR;
    const reachL = st.reachL || 0, reachR = st.reachR || 0; // forward reach, foreshortening
    ctx.save();
    ctx.translate(tr, 0);
    ctx.rotate(lean);
    // legs
    const leg = (s) => {
      ctx.beginPath();
      ctx.moveTo(s * 0.02 * h, -0.49 * h);
      ctx.lineTo(s * 0.085 * h, -0.49 * h);
      ctx.quadraticCurveTo(s * 0.075 * h, -0.25 * h, s * 0.07 * h, 0);
      ctx.lineTo(s * 0.04 * h, 0);
      ctx.quadraticCurveTo(s * 0.035 * h, -0.25 * h, s * 0.02 * h, -0.49 * h);
      ctx.fill();
      // long pointed feet
      ctx.beginPath();
      ctx.moveTo(s * 0.04 * h, 0);
      ctx.lineTo(s * 0.12 * h, 0.006 * h);
      ctx.lineTo(s * 0.07 * h, -0.02 * h);
      ctx.fill();
    };
    leg(-1);
    leg(1);
    // torso
    ctx.beginPath();
    ctx.moveTo(-0.14 * h, -0.8 * h);
    ctx.quadraticCurveTo(0, -0.86 * h, 0.14 * h, -0.8 * h);
    ctx.quadraticCurveTo(0.1 * h, -0.66 * h, 0.065 * h, -0.55 * h);
    ctx.lineTo(0.09 * h, -0.46 * h);
    ctx.lineTo(-0.09 * h, -0.46 * h);
    ctx.lineTo(-0.065 * h, -0.55 * h);
    ctx.quadraticCurveTo(-0.1 * h, -0.66 * h, -0.14 * h, -0.8 * h);
    ctx.fill();
    // neck + head
    ctx.fillRect(-0.02 * h, -0.88 * h, 0.04 * h, 0.08 * h);
    ctx.beginPath();
    ctx.ellipse(0, hy, 0.052 * h, 0.074 * h, 0, 0, TAU);
    ctx.fill();
    // arms
    const arm = (s, a, reach) => {
      const sx = s * 0.13 * h, sy = -0.79 * h;
      const L = 0.46 * h * (1 - reach * 0.55);
      const ex = sx + s * Math.sin(a) * L * 0.5, ey = sy + Math.cos(a) * L * 0.5;
      const hx = sx + s * Math.sin(a * 1.15) * L, hy2 = sy + Math.cos(a * 1.15) * L;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.036 * h;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.lineWidth = 0.026 * h;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(hx, hy2);
      ctx.stroke();
      // long fingers
      ctx.lineWidth = 0.007 * h;
      for (let f = -2; f <= 2; f++) {
        const fa = a * 1.15 + f * 0.12;
        ctx.beginPath();
        ctx.moveTo(hx, hy2);
        ctx.lineTo(hx + s * Math.sin(fa) * 0.08 * h, hy2 + Math.cos(fa) * 0.08 * h);
        ctx.stroke();
      }
      if (reach > 0) {
        // foreshortened reaching hand grows toward the viewer
        ctx.beginPath();
        ctx.ellipse(hx, hy2, 0.03 * h * (1 + reach * 1.5), 0.045 * h * (1 + reach * 1.5), 0, 0, TAU);
        ctx.fill();
      }
      return [hx, hy2];
    };
    const hl = arm(-1, armL, reachL), hr = arm(1, armR, reachR);
    ctx.restore();
    return { head: [0, hy], handL: hl, handR: hr };
  }

  /* Draw the Unmaker. st: {x, y, h, t, form, flicker, eyes, mouth, float, lean, armL, armR, reachL, reachR, pain, alpha, shards, cloak} */
  UNM.draw = function (ctx, st) {
    const t = st.t || 0;
    const h = st.h || 8.6 * UW.FT;
    const x = st.x || 0, y = (st.y || 0) - (st.float || 0) + Math.sin(t * 0.9) * (st.float ? 6 : 0);
    const f = Math.floor(t * 9);
    let form = st.form || 'humanoid';
    if (st.flicker && hash(f * 1.7 + 3) < st.flicker) {
      form = ['hole', 'stretch', 'outline', 'missing'][Math.floor(hash(f * 2.9) * 4)];
    }
    const alpha = st.alpha == null ? 1 : st.alpha;
    if (alpha <= 0) return {};
    // halo of light that fails to illuminate
    FX.darkGlow(ctx, x, y - h * 0.6, h * 0.9, 0.55 * alpha);
    if (form === 'hole') {
      FX.voidHole(ctx, t, x, y - h * 0.6, h * 0.32, alpha, 7, 0.8, 1.2);
      FX.voidShards(ctx, t, x, y - h * 0.6, h * 0.55, 26, 3, alpha);
      return { head: [x, y - h * 0.93] };
    }
    if (form === 'missing') {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#8b8b8b';
      ctx.fillRect(x - h * 0.16, y - h, h * 0.32, h);
      FX.staticBlocks(ctx, t, x, y - h * 0.5, h * 0.32, h, 40, 5, 1);
      ctx.restore();
      return { head: [x, y - h * 0.93] };
    }
    // buffer the body so hollow parts reveal what is behind it
    const m = ctx.getTransform();
    const pad = h * 0.75;
    const corners = [[x - pad, y - h * 1.35], [x + pad, y - h * 1.35], [x - pad, y + h * 0.15], [x + pad, y + h * 0.15]].map((p) => m.transformPoint({ x: p[0], y: p[1] }));
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const p of corners) {
      bx0 = Math.min(bx0, p.x); by0 = Math.min(by0, p.y); bx1 = Math.max(bx1, p.x); by1 = Math.max(by1, p.y);
    }
    bx0 = Math.max(0, Math.floor(bx0)); by0 = Math.max(0, Math.floor(by0));
    bx1 = Math.min(R.canvas.width, Math.ceil(bx1)); by1 = Math.min(R.canvas.height, Math.ceil(by1));
    const bw = bx1 - bx0, bh = by1 - by0;
    const out = { head: [x, y - h * 0.93] };
    if (bw < 2 || bh < 2) return out;
    if (!ubuf) ubuf = document.createElement('canvas');
    if (ubuf.width < bw || ubuf.height < bh) {
      ubuf.width = Math.max(ubuf.width, bw);
      ubuf.height = Math.max(ubuf.height, bh);
    }
    const b = ubuf.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalCompositeOperation = 'source-over';
    b.globalAlpha = 1;
    b.clearRect(0, 0, bw, bh);
    b.setTransform(m.a, m.b, m.c, m.d, m.e - bx0, m.f - by0);
    b.translate(x, y);
    let sx = 1, sy = 1;
    if (form === 'stretch') {
      sx = 0.55;
      sy = 1.45;
    }
    b.scale(sx * (st.flip || 1), sy);
    // broken cloak fragments from the shoulders
    if (st.cloak !== false) {
      for (let side = -1; side <= 1; side += 2) {
        let px = side * 0.12 * h, py = -0.8 * h;
        for (let i = 0; i < 9; i++) {
          const a = side * (0.25 + i * 0.05) + Math.sin(t * 1.3 + i * 0.7 + side) * 0.18 + (st.wind || 0) * 0.3;
          const len = h * 0.075;
          const nx = px + Math.sin(a) * len, ny = py + Math.cos(a) * len;
          if (hash(i * 3.1 + side + Math.floor(t * 4) * 0.1) > 0.22) {
            const w = h * (0.07 - i * 0.006);
            b.fillStyle = '#000';
            b.beginPath();
            b.moveTo(px - w, py);
            b.lineTo(px + w, py);
            b.lineTo(nx + w * 0.8, ny);
            b.lineTo(nx - w * 0.8, ny);
            b.closePath();
            b.fill();
          }
          px = nx + (hash(i + side * 9) - 0.5) * h * 0.02;
          py = ny;
        }
      }
    }
    b.fillStyle = '#000';
    const geo = unmakerShapes(b, h, st, t);
    // hollow chest: reveal what is behind
    b.globalCompositeOperation = 'destination-out';
    b.beginPath();
    const hc = [[-0.05, -0.74], [0.02, -0.77], [0.06, -0.7], [0.03, -0.6], [0.05, -0.55], [-0.02, -0.57], [-0.06, -0.64]];
    const jitter = (i) => (hash(i + Math.floor(t * 6)) - 0.5) * 0.008;
    hc.forEach((p, i) => {
      const px = (p[0] + jitter(i)) * h, py = (p[1] + jitter(i + 9)) * h;
      if (i === 0) b.moveTo(px, py); else b.lineTo(px, py);
    });
    b.closePath();
    b.fill();
    // edge failure: slivers removed
    for (let i = 0; i < 10; i++) {
      const s = i * 5.3 + f * 0.71;
      if (hash(s) < 0.5) continue;
      const yy = (-1 + hash(s + 1)) * h;
      b.fillRect((hash(s + 2) - 0.5) * h * 0.5, yy, h * (0.05 + hash(s + 3) * 0.2), h * 0.006);
    }
    b.globalCompositeOperation = 'source-atop';
    // faint dead static inside the body
    b.fillStyle = 'rgba(120,120,120,0.35)';
    for (let i = 0; i < 26; i++) {
      const s = i * 2.7 + f * 1.3;
      b.fillRect((hash(s) - 0.5) * h * 0.3, (-hash(s + 1)) * h, h * 0.02 * hash(s + 2) + 1, 1.5);
    }
    b.globalCompositeOperation = 'source-over';
    // face
    const eyes = st.eyes == null ? 0 : st.eyes;
    if (eyes > 0) {
      const ey = -0.935 * h, ew = 0.022 * h;
      b.save();
      b.globalAlpha = eyes;
      b.fillStyle = '#c9c9c9';
      for (const s of [-1, 1]) {
        b.beginPath();
        b.moveTo(s * 0.011 * h, ey + 0.0015 * h);
        b.lineTo(s * (0.011 * h + ew), ey - 0.001 * h);
        b.lineTo(s * (0.011 * h + ew * 0.9), ey + 0.0025 * h);
        b.lineTo(s * 0.012 * h, ey + 0.003 * h);
        b.closePath();
        b.fill();
      }
      b.restore();
    }
    const mouth = st.mouth || 0;
    if (mouth > 0.02) {
      // a mouth exists only while it speaks: a seam that parts, no lips, no smile
      const my = -0.892 * h;
      const open = mouth * Math.abs(Math.sin(t * 9) * 0.7 + Math.sin(t * 23) * 0.3);
      b.fillStyle = '#6e6e6e';
      b.fillRect(-0.016 * h, my - 0.0008 * h, 0.032 * h, 0.0016 * h + open * 0.006 * h);
    }
    // composite
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= alpha;
    const jx = (hash(f * 3.3) - 0.5) * 6 * R.s * (st.jitter == null ? 1 : st.jitter);
    if (form === 'outline') {
      // outline only: use the buffer as a mask for a hollow drawing
      ctx.globalAlpha *= 0.9;
      ctx.drawImage(ubuf, 0, 0, bw, bh, bx0 + jx + 3, by0, bw, bh);
      ctx.globalCompositeOperation = 'destination-out';
    }
    if (form !== 'outline') ctx.drawImage(ubuf, 0, 0, bw, bh, bx0 + jx, by0, bw, bh);
    // offset ghost slice: the edge that did not stay where it was
    if (hash(f * 5.1) < 0.35) {
      const sy0 = Math.floor(hash(f * 2.2) * bh), shh = Math.floor(bh * (0.03 + hash(f) * 0.08));
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(ubuf, 0, sy0, bw, shh, bx0 + jx + (hash(f * 7.7) - 0.5) * 40 * R.s, by0 + sy0, bw, shh);
    }
    ctx.restore();
    // shards and static around the figure
    FX.voidShards(ctx, t, x, y - h * 0.62, h * 0.62, st.shards == null ? 22 : st.shards, 11, alpha);
    FX.staticBlocks(ctx, t, x, y - h * 0.55, h * 0.8, h * 1.1, 12, 21, 0.6 * alpha);
    // edges that fail to remain continuous: a pale, broken contour offset from the body
    const contour = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      contour.push([x + Math.cos(a) * h * 0.16 * sx, y - h * 0.55 + Math.sin(a) * h * 0.46 * sy]);
    }
    FX.brokenOutline(ctx, contour, t, 'rgba(200,200,200,0.35)', 1.5, 0.6 * alpha, 17, 16);
    if (eyes > 0.3) {
      FX.glow(ctx, x - 0.024 * h, y - 0.935 * h, 0.03 * h, '#d0d0d0', eyes * 0.35);
      FX.glow(ctx, x + 0.024 * h, y - 0.935 * h, 0.03 * h, '#d0d0d0', eyes * 0.35);
    }
    out.handL = [x + geo.handL[0] * sx, y + geo.handL[1] * sy];
    out.handR = [x + geo.handR[0] * sx, y + geo.handR[1] * sy];
    out.head = [x, y - h * 0.93 * sy];
    out.chest = [x, y - h * 0.66 * sy];
    return out;
  };

  /* The conceptual erasure gaze: a cone of drained, glitching reality. */
  UNM.gaze = function (ctx, t, x, y, tx, ty, a, width) {
    if (a <= 0) return;
    const ang = Math.atan2(ty - y, tx - x), L = Math.hypot(tx - x, ty - y);
    const w = width || L * 0.25;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, 0, L, 0);
    g.addColorStop(0, rgba('#d8d8d8', 0.35 * a));
    g.addColorStop(1, rgba('#8a8a8a', 0.12 * a));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(L, -w / 2);
    ctx.lineTo(L, w / 2);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    FX.staticBlocks(ctx, t, (x + tx) / 2, (y + ty) / 2, L * 0.9, w, 26, 41, a);
  };

  /* ---------- the Unmade ---------- */
  /* Lightweight side-view soldier, parts erased rather than injured. */
  UNM.soldier = function (ctx, st) {
    const t = st.t || 0;
    const seed = st.seed || 1;
    const h = (st.h || 6.4 * UW.FT) * (0.85 + hash(seed * 3.1) * 0.35);
    const x = st.x || 0, y = st.y || 0;
    const face = st.face || 1;
    const ph = t * (st.speed || 1.4) * TAU + seed;
    const walk = st.walk == null ? 1 : st.walk;
    const c1 = ['#26262a', '#333336', '#1c1c1f', '#3c3c40'][Math.floor(hash(seed) * 4)];
    const c2 = shade(c1, -0.35);
    const miss = Math.floor(hash(seed * 7.7) * 5); // which part is erased
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face, 1);
    ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    const lw = Math.max(1, h * 0.012);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const bob = Math.abs(Math.sin(ph)) * h * 0.015 * walk;
    const hipY = -h * 0.48 - bob;
    const lean = (st.lean || 0.12) + (st.attack ? Math.sin(t * 8) * 0.2 : 0);
    const shY = hipY - h * 0.3;
    const shX = Math.sin(lean) * h * 0.3;
    const limb = (x1, y1, x2, y2, w, c, erased) => {
      if (erased) {
        ctx.save();
        ctx.setLineDash([h * 0.02, h * 0.02]);
        ctx.strokeStyle = 'rgba(200,200,200,0.45)';
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        return;
      }
      ctx.strokeStyle = '#050505';
      ctx.lineWidth = w + lw * 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = c;
      ctx.lineWidth = w;
      ctx.stroke();
    };
    const legs = (side, off) => {
      const a = Math.sin(ph + off) * 0.5 * walk;
      const kx = Math.sin(a) * h * 0.25, ky = hipY + Math.cos(a) * h * 0.25;
      const fx = kx + Math.sin(a - 0.3 * walk) * h * 0.24, fy = ky + h * 0.24;
      limb(0, hipY, kx, ky, h * 0.07, side ? c1 : c2, miss === 3 && side);
      limb(kx, ky, fx, Math.min(0, fy), h * 0.05, side ? c1 : c2, miss === 3 && side);
    };
    legs(0, Math.PI);
    // back arm
    const armA = st.attack ? 1.4 + Math.sin(t * 8 + seed) * 0.6 : Math.sin(ph) * 0.4;
    const ex = shX + Math.sin(armA) * h * 0.18, ey = shY + Math.cos(armA) * h * 0.18;
    limb(shX, shY, ex, ey, h * 0.05, c2, miss === 1);
    limb(ex, ey, ex + Math.sin(armA + 0.5) * h * 0.16, ey + Math.cos(armA + 0.5) * h * 0.16, h * 0.04, c2, miss === 1);
    // torso — armor made from destroyed laws: angular plates
    ctx.fillStyle = c1;
    ctx.strokeStyle = '#050505';
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(-h * 0.07, hipY + h * 0.02);
    ctx.lineTo(h * 0.08, hipY);
    ctx.lineTo(shX + h * 0.11, shY + h * 0.02);
    ctx.lineTo(shX + h * 0.02, shY - h * 0.03);
    ctx.lineTo(shX - h * 0.1, shY + h * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (miss === 2) {
      // a missing section of torso — outline without interior
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(-h * 0.04, (hipY + shY) / 2 - h * 0.05, h * 0.12, h * 0.08);
      ctx.restore();
      ctx.strokeStyle = 'rgba(210,210,210,0.6)';
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(-h * 0.04, (hipY + shY) / 2 - h * 0.05, h * 0.12, h * 0.08);
      ctx.setLineDash([]);
    }
    // incorrect geometry fragment
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    const gx = shX - h * 0.05, gy = shY + h * 0.08;
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx - h * 0.08, gy - h * 0.12);
    ctx.lineTo(gx + h * 0.02, gy - h * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    legs(1, 0);
    // head
    const hx = shX + Math.sin(lean) * h * 0.06, hy = shY - h * 0.09;
    if (miss !== 0) {
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.ellipse(hx, hy, h * 0.055, h * 0.07, lean, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // features that keep disappearing
      if (hash(seed * 2.2) < 0.6 && hash(Math.floor(t * 3) + seed) > 0.35) {
        ctx.fillStyle = '#d6d6d6';
        ctx.fillRect(hx + h * 0.018, hy - h * 0.012, h * 0.026, h * 0.007);
        UW.FX.glow(ctx, hx + h * 0.03, hy - h * 0.009, h * 0.03, '#cfcfcf', 0.5);
      } else {
        // face whose features are being forgotten: flat blank plate
        ctx.fillStyle = '#5a5a5e';
        ctx.fillRect(hx - h * 0.005, hy - h * 0.035, h * 0.05, h * 0.05);
      }
    } else {
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(210,210,210,0.55)';
      ctx.beginPath();
      ctx.ellipse(hx, hy, h * 0.055, h * 0.07, lean, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    // front arm with weapon made of stolen structure
    const fa = st.attack ? 1.6 + Math.sin(t * 8 + seed + 1) * 0.7 : -Math.sin(ph) * 0.4 + 0.3;
    const fex = shX + Math.sin(fa) * h * 0.18, fey = shY + Math.cos(fa) * h * 0.18;
    const fhx = fex + Math.sin(fa + 0.4) * h * 0.16, fhy = fey + Math.cos(fa + 0.4) * h * 0.16;
    limb(shX, shY, fex, fey, h * 0.055, c1, miss === 4);
    limb(fex, fey, fhx, fhy, h * 0.045, c1, miss === 4);
    if (miss !== 4) {
      ctx.strokeStyle = '#9a9a9a';
      ctx.lineWidth = h * 0.015;
      ctx.beginPath();
      ctx.moveTo(fhx, fhy);
      ctx.lineTo(fhx + Math.sin(fa + 1.2) * h * 0.35, fhy + Math.cos(fa + 1.2) * h * 0.35);
      ctx.stroke();
    }
    ctx.restore();
    if (st.static !== false) FX.staticBlocks(ctx, t, x, y - h * 0.5, h * 0.5, h, 4, seed, 0.5);
  };

  /* Colossal Unmade entity carrying swallowed worlds. */
  UNM.colossus = function (ctx, st) {
    const t = st.t || 0;
    const h = st.h || 2400;
    const x = st.x || 0, y = st.y || 0;
    const sway = Math.sin(t * 0.3 + (st.seed || 0)) * 0.03;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sway);
    ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    ctx.fillStyle = st.c || '#1b1b1d';
    ctx.beginPath();
    ctx.moveTo(-h * 0.14, 0);
    ctx.lineTo(-h * 0.1, -h * 0.45);
    ctx.lineTo(-h * 0.22, -h * 0.72);
    ctx.lineTo(-h * 0.08, -h * 0.82);
    ctx.lineTo(-h * 0.05, -h * 0.98);
    ctx.lineTo(h * 0.06, -h * 0.97);
    ctx.lineTo(h * 0.09, -h * 0.83);
    ctx.lineTo(h * 0.25, -h * 0.7);
    ctx.lineTo(h * 0.12, -h * 0.45);
    ctx.lineTo(h * 0.15, 0);
    ctx.closePath();
    ctx.fill();
    // embedded remains: a ruined city, a dead star, a ring of a collapsed dimension
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#2c2c30';
    for (let i = 0; i < 18; i++) {
      const bx = -h * 0.08 + i * h * 0.009, bh = h * (0.02 + hash(i * 3.3) * 0.06);
      ctx.fillRect(bx, -h * 0.55 - bh, h * 0.007, bh);
      if (hash(i) < 0.5) {
        ctx.fillStyle = rgba('#e0c080', 0.4);
        ctx.fillRect(bx + 1, -h * 0.55 - bh * 0.6, 2, 2);
        ctx.fillStyle = '#2c2c30';
      }
    }
    ctx.fillStyle = '#3a3634';
    ctx.beginPath();
    ctx.arc(h * 0.03, -h * 0.74, h * 0.05, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,190,170,0.3)';
    ctx.lineWidth = h * 0.004;
    ctx.beginPath();
    ctx.ellipse(-h * 0.02, -h * 0.3, h * 0.08, h * 0.02, 0.3, 0, TAU);
    ctx.stroke();
    ctx.restore();
    // eyes that are only absences
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(-h * 0.03, -h * 0.9, h * 0.02, h * 0.004);
    ctx.fillRect(h * 0.015, -h * 0.9, h * 0.02, h * 0.004);
    ctx.restore();
    FX.staticBlocks(ctx, t, x, y - h * 0.5, h * 0.4, h, 18, st.seed || 3, 0.5);
  };

  /* ================= VAST BEINGS ================= */
  const BEINGS = (UW.BEINGS = {});

  /* Valorion — true/spiritual form: a colossal purple ethereal presence. */
  BEINGS.valorionTrue = function (ctx, st) {
    const t = st.t || 0;
    const s = st.s || 900;
    const x = st.x || 0, y = st.y || 0;
    const a = st.alpha == null ? 1 : st.alpha;
    ctx.save();
    ctx.globalAlpha *= a;
    // shoulders and head as drifting vapor masses
    const blobs = [];
    for (let i = 0; i < 26; i++) {
      const k = i / 26;
      const ang = Math.PI + k * Math.PI;
      const rx = Math.cos(ang) * s * 0.9, ry = Math.sin(ang) * s * 0.28 + s * 0.1;
      blobs.push([rx + noise(t * 0.2 + i) * s * 0.05, ry + noise(t * 0.25 + i * 3) * s * 0.05, s * (0.22 + hash(i) * 0.12)]);
    }
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * TAU;
      blobs.push([Math.cos(ang) * s * 0.22 + noise(t * 0.3 + i) * s * 0.03, -s * 0.45 + Math.sin(ang) * s * 0.28, s * (0.16 + hash(i * 3) * 0.08)]);
    }
    if (st.soft) {
      // on bright skies additive light washes out: paint the vapor instead
      for (const [bx, by, br] of blobs) FX.soft(ctx, x + bx, y + by, br * 1.5, hash(bx) < 0.5 ? '#5a2ab0' : '#7a3ae0', 0.18);
      for (const [bx, by, br] of blobs) FX.soft(ctx, x + bx, y + by, br * 0.7, '#9a6ae8', 0.14);
    } else {
      ctx.globalCompositeOperation = 'lighter';
      for (const [bx, by, br] of blobs) FX.glow(ctx, x + bx, y + by, br * 1.6, hash(bx) < 0.5 ? '#6a2cc8' : '#8a4aff', 0.22);
      for (const [bx, by, br] of blobs) FX.glow(ctx, x + bx, y + by, br * 0.8, '#b58aff', 0.12);
    }
    // internal stars and structures
    for (let i = 0; i < 120; i++) {
      const px = x + (hash(i * 1.3) - 0.5) * s * 1.8, py = y - s * 0.7 + hash(i * 2.9) * s * 1.1;
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
      ctx.fillStyle = rgba('#ffffff', 0.5 * tw);
      ctx.fillRect(px, py, 2, 2);
    }
    FX.ring(ctx, x - s * 0.3, y - s * 0.1, s * 0.12, 2, '#d8c0ff', 0.25);
    FX.ring(ctx, x + s * 0.4, y + s * 0.05, s * 0.08, 2, '#d8c0ff', 0.2);
    // the two eyes
    const ey = y - s * 0.48, ex = s * 0.11;
    const bl = st.eyes == null ? 1 : st.eyes;
    FX.glow(ctx, x - ex, ey, s * 0.16, '#e8dcff', 0.7 * bl, true);
    FX.glow(ctx, x + ex, ey, s * 0.16, '#e8dcff', 0.7 * bl, true);
    FX.glow(ctx, x - ex, ey, s * 0.04, '#ffffff', bl, true);
    FX.glow(ctx, x + ex, ey, s * 0.04, '#ffffff', bl, true);
    ctx.restore();
  };

  /* Silent Judge: huge motionless robed figure, metallic mask, six long arms writing names. */
  BEINGS.judge = function (ctx, st) {
    const t = st.t || 0;
    const h = st.h || 900;
    const x = st.x || 0, y = st.y || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    const g = ctx.createLinearGradient(0, -h, 0, 0);
    g.addColorStop(0, '#20222c');
    g.addColorStop(1, '#0a0b10');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#040406';
    ctx.lineWidth = h * 0.006;
    ctx.beginPath();
    ctx.moveTo(-h * 0.08, -h * 0.86);
    ctx.quadraticCurveTo(0, -h * 0.98, h * 0.08, -h * 0.86);
    ctx.lineTo(h * 0.22, 0);
    ctx.lineTo(-h * 0.22, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // folds
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * h * 0.015, -h * 0.75);
      ctx.lineTo(i * h * 0.06, 0);
      ctx.stroke();
    }
    // hood & mask
    ctx.fillStyle = '#12131a';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.86, h * 0.07, h * 0.085, 0, 0, TAU);
    ctx.fill();
    const mg = ctx.createLinearGradient(-h * 0.04, -h * 0.9, h * 0.04, -h * 0.82);
    mg.addColorStop(0, '#d8dde6');
    mg.addColorStop(0.5, '#7d8591');
    mg.addColorStop(1, '#c5ccd6');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.855, h * 0.045, h * 0.06, 0, 0, TAU);
    ctx.fill();
    // six arms writing
    const slabY = -h * (st.slabY || 0.42);
    for (let i = 0; i < 6; i++) {
      const side = i < 3 ? -1 : 1;
      const k = i % 3;
      const sx = side * h * 0.07, sy = -h * (0.74 - k * 0.07);
      const hx = side * h * (0.12 + k * 0.05) + Math.sin(t * 3 + i) * h * 0.01, hy = slabY - h * 0.02 + k * h * 0.02;
      ctx.strokeStyle = '#0d0e14';
      ctx.lineWidth = h * 0.012;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(side * h * 0.2, sy + h * 0.08, hx, hy);
      ctx.stroke();
      FX.glow(ctx, hx, hy, h * 0.02, '#e6ecff', 0.6 + 0.4 * Math.sin(t * 9 + i));
    }
    // floating slab of names
    ctx.fillStyle = 'rgba(20,22,30,0.85)';
    ctx.fillRect(-h * 0.26, slabY, h * 0.52, h * 0.12);
    ctx.globalCompositeOperation = 'lighter';
    const rows = 7;
    for (let r = 0; r < rows; r++) {
      const prog = sat(((t * 0.35 + r * 0.13) % 1.4));
      ctx.fillStyle = rgba('#dfe6ff', 0.75);
      const ww = h * 0.46 * prog * (0.6 + hash(r) * 0.4);
      for (let c = 0; c < Math.floor(ww / (h * 0.012)); c++) {
        if (hash(r * 40 + c) < 0.2) continue;
        ctx.fillRect(-h * 0.23 + c * h * 0.012, slabY + h * 0.012 + r * h * 0.015, h * 0.008, h * 0.004 + hash(c + r) * h * 0.004);
      }
    }
    ctx.restore();
  };

  /* Archival Warden: tall robed archivist, script-mask, orbiting books and data-rings. */
  BEINGS.warden = function (ctx, st) {
    const t = st.t || 0;
    const h = st.h || 340;
    const x = st.x || 0, y = st.y || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    const lw = h * 0.008;
    ctx.lineWidth = lw;
    ctx.strokeStyle = '#0a0a0c';
    // robe layers
    ctx.fillStyle = '#e9e5dc';
    ctx.beginPath();
    ctx.moveTo(-h * 0.09, -h * 0.78);
    ctx.lineTo(h * 0.09, -h * 0.78);
    ctx.lineTo(h * 0.2, 0);
    ctx.lineTo(-h * 0.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#16161a';
    ctx.beginPath();
    ctx.moveTo(-h * 0.05, -h * 0.76);
    ctx.lineTo(h * 0.05, -h * 0.76);
    ctx.lineTo(h * 0.1, 0);
    ctx.lineTo(-h * 0.1, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // ceremonial pauldrons
    ctx.fillStyle = '#1a1a1e';
    ctx.beginPath();
    ctx.ellipse(-h * 0.1, -h * 0.76, h * 0.06, h * 0.03, -0.3, 0, TAU);
    ctx.ellipse(h * 0.1, -h * 0.76, h * 0.06, h * 0.03, 0.3, 0, TAU);
    ctx.fill();
    // hood & mask with moving script
    ctx.fillStyle = '#e9e5dc';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.86, h * 0.062, h * 0.08, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f7f5ef';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.855, h * 0.043, h * 0.058, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#2a2a30';
    for (let r = 0; r < 6; r++) {
      const off = ((t * 12 * (r % 2 ? 1 : -1)) % (h * 0.02));
      for (let c = 0; c < 10; c++) {
        if (hash(r * 11 + c) < 0.3) continue;
        ctx.fillRect(-h * 0.05 + c * h * 0.011 + off, -h * 0.9 + r * h * 0.015, h * 0.006, h * 0.004);
      }
    }
    ctx.restore();
    // orbiting books, crystals, rings
    for (let i = 0; i < 5; i++) {
      const a = t * 0.6 + (i / 5) * TAU;
      const ox = Math.cos(a) * h * 0.28, oy = -h * 0.55 + Math.sin(a) * h * 0.08;
      const front = Math.sin(a) > 0;
      ctx.save();
      ctx.globalAlpha *= front ? 1 : 0.6;
      if (i % 2 === 0) {
        ctx.fillStyle = '#5a3a24';
        ctx.fillRect(ox - h * 0.03, oy - h * 0.02, h * 0.06, h * 0.04);
        ctx.fillStyle = '#efe6d0';
        ctx.fillRect(ox - h * 0.027, oy - h * 0.017, h * 0.054, h * 0.006);
      } else {
        FX.glow(ctx, ox, oy, h * 0.04, '#9fe8ff', 0.8);
        ctx.fillStyle = '#c8f4ff';
        ctx.beginPath();
        ctx.moveTo(ox, oy - h * 0.025);
        ctx.lineTo(ox + h * 0.012, oy);
        ctx.lineTo(ox, oy + h * 0.025);
        ctx.lineTo(ox - h * 0.012, oy);
        ctx.fill();
      }
      ctx.restore();
    }
    FX.ring(ctx, 0, -h * 0.5, h * 0.3, h * 0.004, '#bfeaff', 0.45, 0.25);
    ctx.restore();
  };

  /* Vayrix Ferryman with a star-lantern pole; optional boat. */
  BEINGS.ferryman = function (ctx, st) {
    const t = st.t || 0;
    const h = st.h || 320;
    const x = st.x || 0, y = st.y || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(st.face || 1, 1);
    ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    if (st.boat) {
      ctx.fillStyle = '#0c0a0a';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-h * 0.8, -h * 0.05);
      ctx.quadraticCurveTo(0, h * 0.18, h * 0.9, -h * 0.12);
      ctx.lineTo(h * 0.7, -h * 0.02);
      ctx.quadraticCurveTo(0, h * 0.08, -h * 0.65, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 14; i++) {
        const px = -h * 0.6 + i * h * 0.1, py = h * 0.03 + Math.sin(i) * h * 0.02;
        ctx.fillStyle = rgba('#ffe9b0', 0.5 + 0.5 * Math.sin(t * 3 + i));
        ctx.fillRect(px, py, 2, 2);
      }
      ctx.translate(0, -h * 0.04);
    }
    // robe
    ctx.fillStyle = '#121014';
    ctx.strokeStyle = '#030303';
    ctx.lineWidth = h * 0.008;
    ctx.beginPath();
    ctx.moveTo(-h * 0.05, -h * 0.82);
    ctx.quadraticCurveTo(h * 0.02, -h * 0.9, h * 0.07, -h * 0.8);
    ctx.lineTo(h * 0.14, 0);
    ctx.lineTo(-h * 0.14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // thin skeletal hands on pole
    const px = h * 0.14;
    ctx.strokeStyle = '#1e1a16';
    ctx.lineWidth = h * 0.012;
    ctx.beginPath();
    ctx.moveTo(px, h * 0.02);
    ctx.lineTo(px + h * 0.06, -h * 1.05);
    ctx.stroke();
    ctx.fillStyle = '#d9d2c0';
    ctx.beginPath();
    ctx.ellipse(px + h * 0.03, -h * 0.55, h * 0.014, h * 0.03, 0.2, 0, TAU);
    ctx.fill();
    // ivory mask under hood
    ctx.fillStyle = '#0c0a0c';
    ctx.beginPath();
    ctx.ellipse(h * 0.01, -h * 0.84, h * 0.06, h * 0.075, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#efe7d4';
    ctx.beginPath();
    ctx.ellipse(h * 0.03, -h * 0.83, h * 0.034, h * 0.05, 0.15, 0, TAU);
    ctx.fill();
    // lantern at pole top
    const lx = px + h * 0.07, ly = -h * 1.02 + Math.sin(t * 1.4) * 2;
    ctx.fillStyle = '#2a2016';
    ctx.fillRect(lx - h * 0.025, ly, h * 0.05, h * 0.06);
    FX.glow(ctx, lx, ly + h * 0.03, h * 0.25, '#ffe6a8', 0.6);
    FX.glow(ctx, lx, ly + h * 0.03, h * 0.04, '#ffffff', 1, true);
    ctx.restore();
  };

  /* ---------- rig-based vast beings share the rig with special styles ---------- */
  const C = UW.C;
  const TP = C.TP, tpoly = C.tpoly, tline = C.tline, tband = C.tband;

  /* Primordial Guardian: crystalline monumental armor, stone mask face, creation runes. */
  C.guardian = {
    id: 'guardian', name: 'Primordial Guardian', ft: 7, seed: 71,
    skin: '#aebccb', line: '#1a2430', shadeAmt: 0.22,
    b: RIG.build({
      head: 0.115, neckR: 0.05, torso: 0.33, chest: 0.24, waist: 0.19, hips: 0.2, pecs: 0.01, traps: 0.03,
      rDelt: 0.08, rUarm: [0.055, 0.058, 0.045], rFarm: [0.05, 0.052, 0.042], rHand: 0.032,
      rThigh: [0.075, 0.07, 0.055], rShin: [0.055, 0.058, 0.045], rFoot: 0.034, foot: 0.13,
    }),
    face: {
      noEar: true, noBlink: true, jaw: 1.4, chin: 1.2, nose: 0.6, brow: 1.3, scleraC: '#0b1a24', eyeC: '#7ff4ff', eyeGlowC: '#8ff8ff',
      extra(ctx, S, L) {
        // stone mask seams
        ctx.strokeStyle = 'rgba(20,30,40,0.6)';
        ctx.lineWidth = L * 0.7;
        ctx.beginPath();
        ctx.moveTo(0.1, -0.45);
        ctx.lineTo(0.2, 0.45);
        ctx.moveTo(-0.2, -0.3);
        ctx.lineTo(0.35, -0.12);
        ctx.stroke();
      },
    },
    hair: { style: 'bald' },
    hold: { F: { type: 'creationSpear', abs: 0 }, B: { type: 'shield', ang: 0 } },
    costume: {
      torso: {
        c: '#c3d0dc',
        detail(ctx, S) {
          tpoly(ctx, S, [[-1.2, 1], [1.2, 1], [1.2, 0.55], [-1.2, 0.5]], '#d6e1ea', { hi: 0.4 });
          tpoly(ctx, S, [[0.1, 0.5], [1.2, 0.5], [1.2, 0.15], [0.2, 0.1]], '#b7c6d4', {});
          tband(ctx, S, -0.05, 0.08, '#8fa3b5', {});
          for (let i = 0; i < 4; i++) {
            const p = TP(S, -0.3 + i * 0.3, 0.7 - (i % 2) * 0.35);
            UW.FX.rune(ctx, p[0], p[1], S.Hh * 0.05, i * 3 + 1, '#8ff4ff', 0.9, S.lw * 0.8);
          }
          tline(ctx, S, [[-1, 0.52], [1, 0.55]], 'rgba(20,30,40,0.5)', S.lw * 0.8);
        },
      },
      delt: { c: '#d6e1ea' },
      uarm: { c: '#aebccb', bands: [{ a: 0.0, b: 0.55, c: '#c9d6e1', pad: 0.01, metal: true }] },
      farm: { c: '#aebccb', bands: [{ a: 0.2, b: 1, c: '#c9d6e1', pad: 0.01, metal: true }] },
      hand: { c: '#9fb0c0' },
      thigh: { c: '#aebccb', bands: [{ a: 0.1, b: 0.9, c: '#c9d6e1', pad: 0.008, metal: true }] },
      shin: { c: '#aebccb', bands: [{ a: 0.0, b: 1, c: '#d0dce6', pad: 0.01, metal: true }] },
      foot: { c: '#9fb0c0', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        const c = TP(S, 0, 0.6);
        UW.FX.glow(ctx, c[0], c[1], S.Hh * 0.8, '#7fe8ff', 0.18 + (S.st.glow || 0) * 0.4);
      },
      afterHead(ctx, S) {
        // crystalline crest
        const hp = S.J.head;
        ctx.fillStyle = '#e3f6ff';
        ctx.strokeStyle = S.line;
        ctx.lineWidth = S.lw;
        ctx.beginPath();
        ctx.moveTo(hp[0] - S.Hh * 0.05, hp[1] - S.Hh * 0.05);
        ctx.lineTo(hp[0] - S.Hh * 0.01, hp[1] - S.Hh * 0.13);
        ctx.lineTo(hp[0] + S.Hh * 0.02, hp[1] - S.Hh * 0.06);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      },
    },
  };

  /* Armor Without a Definition: plates drift away from a Guardian, occupant exposed. */
  BEINGS.guardianDrift = function (ctx, st) {
    const spec = C.guardian;
    const drift = st.drift || 0;
    // the occupant: a slender, frightened crystalline being
    UW.RIG.draw(ctx, C.guardianOccupant, Object.assign({}, st, { hold: {} }));
    if (drift <= 0) return;
    const pose = RIG.get(st.pose);
    const sc = st.scale || 1;
    const Hh = spec.ft * UW.FT;
    const J = RIG.solve(spec, pose, Hh);
    ctx.save();
    ctx.translate(st.x || 0, st.y || 0);
    ctx.scale((st.face || 1) * sc, sc);
    const plates = [
      ['sh' + 'F', 'elF', 0.07], ['elF', 'wrF', 0.06], ['hipF', 'knF', 0.08], ['knF', 'anF', 0.07],
      ['shB', 'elB', 0.07], ['elB', 'wrB', 0.06], ['hipB', 'knB', 0.08], ['knB', 'anB', 0.07],
      ['pelvis', 'neck', 0.14], ['neck', 'head', 0.07],
    ];
    plates.forEach(([a, b, r], i) => {
      const pa = J[a], pb = J[b];
      if (!pa || !pb) return;
      const mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
      const dx = mx - J.pelvis[0] * 0.5, dy = my - (J.neck[1] + J.pelvis[1]) / 2;
      const dl = Math.hypot(dx, dy) || 1;
      const k = drift * Hh * (0.35 + hash(i * 3.1) * 0.5);
      const ox = (dx / dl) * k * 1.3 + (hash(i) - 0.5) * k * 0.6, oy = Math.min((dy / dl) * k * 0.6, 0) - drift * Hh * (0.08 + hash(i * 5) * 0.2);
      const rot = (hash(i * 7.7) - 0.5) * drift * 1.2;
      ctx.save();
      ctx.translate(mx + ox, my + oy);
      ctx.rotate(rot);
      ctx.translate(-mx, -my);
      const cap = RIG.capsule(pa, pb, r * Hh, r * Hh * 1.05, r * Hh * 0.9, 0, 0);
      ctx.beginPath();
      // faceted plate: hexagonal outline along the segment
      const L0 = cap.left, R0 = cap.right;
      const q = [L0[1], L0[4], L0[7], [pb[0] + cap.ux * r * Hh * 0.6, pb[1] + cap.uy * r * Hh * 0.6], R0[7], R0[4], R0[1], [pa[0] - cap.ux * r * Hh * 0.6, pa[1] - cap.uy * r * Hh * 0.6]];
      UW.poly(ctx, q, true);
      ctx.fillStyle = i % 2 ? '#c9d6e1' : '#d6e1ea';
      ctx.fill();
      ctx.strokeStyle = spec.line;
      ctx.lineWidth = Hh * 0.01;
      ctx.stroke();
      // hollow interior visible
      ctx.save();
      ctx.clip();
      ctx.fillStyle = 'rgba(20,40,55,0.55)';
      ctx.fillRect(mx - Hh * 0.02, my - Hh * 0.3, Hh * 0.2, Hh * 0.6);
      ctx.restore();
      UW.FX.rune(ctx, mx, my, Hh * 0.04, i + 5, '#8ff4ff', 0.9 * (1 - drift * 0.5), Hh * 0.006);
      ctx.restore();
    });
    ctx.restore();
  };

  C.guardianOccupant = {
    id: 'guardianOccupant', ft: 6.2, seed: 72, skin: '#9fe6f2', line: '#0e2a33', shadeAmt: 0.2,
    b: RIG.build({ chest: 0.12, waist: 0.085, hips: 0.1, rDelt: 0.03, rUarm: [0.022, 0.022, 0.017], rFarm: [0.018, 0.018, 0.013], rThigh: [0.036, 0.034, 0.022], rShin: [0.022, 0.024, 0.014] }),
    face: { noEar: true, jaw: 0.9, nose: 0.5, eyeC: '#ffffff', scleraC: '#0e2a33', eyeGlowC: '#dffcff', expr: 'pain' },
    hair: { style: 'bald' },
    costume: { torso: { c: '#8fdbe8' } },
    hooks: {
      aura(ctx, S) {
        const c = TP(S, 0, 0.5);
        UW.FX.glow(ctx, c[0], c[1], S.Hh * 0.5, '#9ff4ff', 0.35);
      },
    },
  };

  /* Temporal Titan: slender, translucent; stars and clocks inside. Use via S.actor with buffer + inside. */
  C.titan = {
    id: 'titan', name: 'Temporal Titan', ft: 9, seed: 81, skin: '#b8c8ff', line: '#1a2040', shadeAmt: 0.15,
    b: RIG.build({ head: 0.1, headD: 0.1, neckLen: 0.05, neckR: 0.02, torso: 0.32, chest: 0.1, waist: 0.07, hips: 0.09, rDelt: 0.025, rUarm: [0.018, 0.018, 0.013], rFarm: [0.015, 0.015, 0.011], rHand: 0.013, uarm: 0.2, farm: 0.18, thigh: 0.26, shin: 0.25, rThigh: [0.03, 0.028, 0.018], rShin: [0.018, 0.02, 0.012] }),
    face: { noEar: true, long: 0.8, jaw: 0.8, nose: 0.4, brow: 0.6, scleraC: '#ffffff', eyeC: '#ffffff', eyeGlowC: '#ffffff', noBlink: true },
    hair: { style: 'bald' },
    costume: { torso: { c: '#c8d6ff' } },
    hooks: {
      aura(ctx, S) {
        const c = TP(S, 0, 0.6);
        UW.FX.glow(ctx, c[0], c[1], S.Hh * 0.7, '#9fb6ff', 0.25);
      },
    },
  };
  /* inside painter for Titans: stars, clocks, a city aging */
  BEINGS.titanInside = function (b, S, t) {
    const J = S.J;
    b.save();
    b.fillStyle = 'rgba(20,24,60,0.55)';
    b.fillRect(-4000, -4000, 8000, 8000);
    b.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) {
      b.fillStyle = 'rgba(255,255,255,0.8)';
      b.fillRect((hash(i) - 0.5) * S.Hh * 0.5, -hash(i * 3) * S.Hh, 2, 2);
    }
    for (let k = 0; k < 3; k++) {
      const cx = (hash(k * 5) - 0.5) * S.Hh * 0.12, cy = -S.Hh * (0.35 + k * 0.2);
      const r = S.Hh * 0.04;
      b.strokeStyle = 'rgba(230,236,255,0.8)';
      b.lineWidth = 1.5;
      b.beginPath();
      b.arc(cx, cy, r, 0, TAU);
      b.stroke();
      const a = t * (0.5 + k) + k;
      b.beginPath();
      b.moveTo(cx, cy);
      b.lineTo(cx + Math.sin(a) * r * 0.9, cy - Math.cos(a) * r * 0.9);
      b.moveTo(cx, cy);
      b.lineTo(cx + Math.sin(a / 12) * r * 0.6, cy - Math.cos(a / 12) * r * 0.6);
      b.stroke();
    }
    b.restore();
  };

  /* Valorion's avatar: tall celestial armor, purple cosmic skin, hair dissolving into energy. */
  const VAL_SKIN = '#7b4fc9';
  C.valorion = {
    id: 'valorion', name: 'Valorion', ft: 7, seed: 91, skin: VAL_SKIN, line: '#140a26',
    b: RIG.build({ head: 0.125, torso: 0.31, chest: 0.17, waist: 0.12, hips: 0.135, pecs: 0.012, rDelt: 0.046, rUarm: [0.033, 0.035, 0.026], rFarm: [0.028, 0.03, 0.021] }),
    face: {
      jaw: 1.05, nose: 0.85, brow: 0.9, lips: 0.95, scleraC: '#f5eeff', eyeC: '#f5eeff', eyeGlowC: '#e7d8ff', noBlink: false,
      extra(ctx, S, L) {
        UW.FX.glow(ctx, 0.29, -0.01, 0.12, '#e7d8ff', 0.8, true);
      },
    },
    hair: { style: 'long', c: '#3a1a6a', c2: '#4a2480', hl: '#6a3ab0', len: 1.6, locks: 3, w0: 0.4, w1: 0.1, energy: '#c9a2ff', sweep: -0.5, sideLock: false, amp: 0.2 },
    costume: {
      torso: {
        c: '#f2eefb',
        detail(ctx, S) {
          tpoly(ctx, S, [[-2, 0.45], [2, 0.42], [2, 0.12], [-2, 0.15]], '#1c1030', {});
          tpoly(ctx, S, [[0.0, 1.0], [0.9, 0.95], [0.85, 0.5], [0.05, 0.46]], '#ffffff', { hi: 0.5 });
          tpoly(ctx, S, [[0.2, 0.9], [0.7, 0.86], [0.66, 0.6], [0.24, 0.56]], '#7a4ad0', {});
          tline(ctx, S, [[-1, 0.3], [1, 0.28]], 'rgba(214,190,255,0.95)', S.lw * 0.8, true);
          tline(ctx, S, [[0.45, 0.98], [0.45, 0.5], [0.1, 0.3]], 'rgba(214,190,255,0.95)', S.lw * 0.8, true);
          // reflections of other realities
          const p = TP(S, 0.45, 0.73);
          const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], S.Hh * 0.03);
          g.addColorStop(0, 'rgba(160,220,255,0.9)');
          g.addColorStop(1, 'rgba(160,220,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(p[0] - 30, p[1] - 30, 60, 60);
          tband(ctx, S, -0.02, 0.06, '#1c1030', {});
          const br = S.dmg ? S.dmg.armor || 0 : 0;
          if (br > 0) {
            for (let i = 0; i < 3 + br * 5; i++) {
              const q = TP(S, (hash(i * 3.3) - 0.3) * 1.2, 0.2 + hash(i * 1.1) * 0.7);
              const rr = S.Hh * (0.02 + hash(i) * 0.03) * (0.5 + br);
              ctx.fillStyle = '#12082a';
              UW.RIG.blob(ctx, q[0], q[1], rr, i * 9);
              UW.FX.glow(ctx, q[0], q[1], rr * 1.8, '#c9a2ff', 0.8);
              ctx.fillStyle = 'rgba(255,255,255,0.8)';
              ctx.fillRect(q[0], q[1], 2, 2);
            }
          }
        },
      },
      delt: { c: '#f2eefb' },
      uarm: { c: '#1c1030', bands: [{ a: 0, b: 0.5, c: '#f2eefb', pad: 0.006, metal: true }] },
      farm: { c: '#1c1030', bands: [{ a: 0.25, b: 1, c: '#f2eefb', pad: 0.006, metal: true, glow: '#d6beff', glowA: 0.8 }] },
      hand: { c: VAL_SKIN },
      thigh: { c: '#1c1030', bands: [{ a: 0.0, b: 0.7, c: '#e9e3f7', pad: 0.005, metal: true }] },
      shin: { c: '#1c1030', bands: [{ a: 0.0, b: 1, c: '#f2eefb', pad: 0.006, metal: true, glow: '#d6beff', glowA: 0.7 }] },
      foot: { c: '#e9e3f7', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        const c = TP(S, 0, 0.55);
        UW.FX.glow(ctx, c[0], c[1], S.Hh * 0.75, '#9a6aff', 0.25 + (S.st.glow || 0) * 0.5);
      },
    },
  };
})();
