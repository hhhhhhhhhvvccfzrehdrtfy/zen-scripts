/* The Unmaker War — hair styles (head-normalized space) and held gear/weapons. */
(function () {
  'use strict';
  const UW = window.UW;
  const { TAU, lerp, sat, hash, noise, mix, shade, rgba } = UW;
  const RIG = UW.RIG;
  const HAIR = (UW.HAIR = {});

  /* Base skull cap (head units: height 1, center 0,0, facing +x, y down). */
  function capPts(vol, style) {
    const v = vol == null ? 1 : vol;
    const pts = [
      [0.37, -0.27], [0.34, -0.43 - 0.03 * v], [0.12, -0.56 - 0.06 * v], [-0.22, -0.55 - 0.05 * v],
      [-0.49 - 0.04 * v, -0.3], [-0.53 - 0.04 * v, 0.02], [-0.42, 0.28], [-0.22, 0.2],
      [-0.14, 0.0], [0.02, -0.15], [0.2, -0.2],
    ];
    if (style === 'short' || style === 'undercut') {
      pts[4][0] += 0.03; pts[5][0] += 0.04; pts[6] = [-0.38, 0.2]; pts[7] = [-0.2, 0.14];
    }
    return pts;
  }

  function celFill(ctx, S, path, c, L, noLine) {
    const S2 = { lw: L, line: S.line, shadeAmt: 0.3, lx: -0.025 * S.face, ly: -0.03, far: 0 };
    if (noLine) {
      ctx.beginPath();
      path(ctx);
      ctx.fillStyle = c;
      ctx.fill();
      return;
    }
    RIG.celGroup(ctx, [{ path, c, lk: 1 }], S2);
  }

  function strands(ctx, pts, c, L, n, seed) {
    ctx.save();
    ctx.strokeStyle = c;
    ctx.lineWidth = L * 0.9;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const a = pts[Math.floor(hash(seed + i) * pts.length)];
      const b = pts[Math.floor(hash(seed + i * 2.3 + 1) * pts.length)];
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo((a[0] + b[0]) / 2 + 0.05, (a[1] + b[1]) / 2 - 0.05, b[0], b[1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* Long locks hanging from the back of the head; returns nothing. */
  function locks(ctx, S, hp, L, front) {
    const len = hp.len || 2;
    const n = hp.locks || 3;
    const base = S.J.headAng; // world-down in head frame
    for (let i = 0; i < n; i++) {
      const k = n === 1 ? 0.5 : i / (n - 1);
      const anchor = front
        ? [-0.1 - k * 0.1, -0.2 + k * 0.05]
        : [-0.3 - k * 0.18, -0.25 + k * 0.4];
      const ang = base + (front ? -0.08 : -0.25 - k * 0.2) + (hp.sweep || 0);
      const pts = RIG.chain(anchor, ang, len * (front ? 0.55 : 1) * (0.85 + hash(i + 3) * 0.3), 7, S, {
        amp: hp.amp == null ? 0.14 : hp.amp, freq: 0.9, phase: i * 1.3, curl: hp.curl || 0.25, streamV: 700,
      });
      const w0 = front ? (hp.w0 || 0.2) : (hp.w0 || 0.42), w1 = front ? 0.02 : (hp.w1 || 0.16);
      const c = i % 2 && hp.c2 ? hp.c2 : hp.c;
      RIG.ribbon(ctx, Object.assign({}, S, { lw: L, lx: -0.02 * S.face, ly: -0.02, shadeAmt: 0.28 }), pts, w0, w1, c, { ragged: hp.ragged ? 0.1 : 0, seed: i });
      if (hp.streak && i === 1) {
        RIG.ribbon(ctx, Object.assign({}, S, { lw: L * 0.5 }), pts, w0 * 0.3, w1 * 0.3, hp.streak, { alpha: 0.95 });
      }
      if (hp.energy) {
        const tip = pts[pts.length - 1];
        UW.FX.glow(ctx, tip[0], tip[1], 0.45, hp.energy, 0.7);
        UW.FX.burst(ctx, S.t % 1.2, 0, { n: 5, x: tip[0], y: tip[1], speed: [0.2, 0.8], g: 0, drag: 0.5, size: [0.03, 0.06], color: hp.energy, kind: 'dot', life: [0.8, 1.2], seed: i * 17 + Math.floor(S.t / 1.2) });
      }
    }
  }

  HAIR.back = function (ctx, S, hp, L) {
    const st = hp.style;
    if (st === 'long' || st === 'layered' || st === 'veil') locks(ctx, S, hp, L, false);
    if (st === 'curly') {
      const len = hp.len || 1.2;
      const base = S.J.headAng;
      const pts = RIG.chain([-0.35, 0.0], base - 0.2, len, 5, S, { amp: 0.06, freq: 0.7 });
      ctx.save();
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        for (let j = 0; j < 4; j++) {
          const a = hash(i * 4 + j) * TAU;
          const r = 0.13 + hash(i * 3 + j * 1.3) * 0.08;
          const x = p[0] + Math.cos(a) * 0.14, y = p[1] + Math.sin(a) * 0.1;
          celFill(ctx, S, (c) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }, j % 2 ? hp.c : (hp.c2 || shade(hp.c, 0.08)), L);
        }
      }
      ctx.restore();
    }
    if (st === 'wild' || st === 'messy') {
      // back tufts
      const pts = [[-0.3, -0.5], [-0.62, -0.42], [-0.5, -0.3], [-0.72, -0.18], [-0.54, -0.05], [-0.7, 0.12], [-0.5, 0.2], [-0.56, 0.36], [-0.3, 0.3]];
      if (st === 'wild') pts.forEach((p) => { p[0] *= 1.08; p[1] *= 1.05; });
      celFill(ctx, S, (c) => UW.poly(c, pts, true), hp.c, L);
    }
  };

  HAIR.front = function (ctx, S, hp, L) {
    const st = hp.style;
    const c = hp.c || '#222222';
    const hl = hp.hl || shade(c, 0.22);
    if (st === 'bald') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgba('#ffffff', 0.1);
      ctx.beginPath();
      ctx.ellipse(0.05, -0.38, 0.18, 0.06, -0.2, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (st === 'hood') return;
    let cap = capPts(hp.vol, st);
    if (st === 'quiff') {
      cap = [
        [0.38, -0.28], [0.52, -0.52], [0.5, -0.74], [0.3, -0.82], [0.02, -0.74], [-0.3, -0.62],
        [-0.5, -0.36], [-0.5, -0.02], [-0.38, 0.2], [-0.22, 0.16], [-0.14, 0.0], [0.04, -0.16], [0.22, -0.26],
      ];
    }
    if (st === 'swept' || st === 'slick') {
      cap = [
        [0.36, -0.3], [0.3, -0.5], [0.05, -0.6], [-0.3, -0.56], [-0.56, -0.32], [-0.6, -0.02],
        [-0.46, 0.22], [-0.24, 0.16], [-0.14, 0.0], [0.02, -0.16], [0.2, -0.24],
      ];
      if (st === 'slick') cap.forEach((p) => { p[1] *= 0.96; });
    }
    if (st === 'wild') {
      cap = [
        [0.42, -0.2], [0.34, -0.34], [0.46, -0.44], [0.24, -0.52], [0.3, -0.66], [0.02, -0.62],
        [-0.12, -0.74], [-0.24, -0.6], [-0.5, -0.62], [-0.46, -0.44], [-0.66, -0.3], [-0.56, -0.12],
        [-0.64, 0.08], [-0.44, 0.24], [-0.22, 0.16], [-0.14, 0.0], [0.02, -0.12], [0.22, -0.18],
      ];
    }
    if (st === 'messy') {
      cap = [
        [0.4, -0.24], [0.32, -0.36], [0.42, -0.44], [0.22, -0.5], [0.26, -0.62], [0.0, -0.6],
        [-0.14, -0.68], [-0.28, -0.56], [-0.5, -0.5], [-0.5, -0.34], [-0.6, -0.16], [-0.52, 0.06],
        [-0.42, 0.24], [-0.22, 0.16], [-0.14, 0.0], [0.02, -0.14], [0.22, -0.2],
      ];
    }
    if (st === 'layered') {
      cap = [
        [0.44, -0.12], [0.38, -0.4], [0.14, -0.6], [-0.24, -0.58], [-0.54, -0.32], [-0.58, 0.02],
        [-0.46, 0.3], [-0.24, 0.2], [-0.13, 0.0], [0.04, -0.12], [0.24, -0.1],
      ];
    }
    if (st === 'curly') {
      cap = [
        [0.38, -0.26], [0.36, -0.46], [0.14, -0.62], [-0.24, -0.62], [-0.56, -0.36], [-0.6, 0.0],
        [-0.46, 0.26], [-0.22, 0.18], [-0.14, 0.0], [0.02, -0.14], [0.2, -0.22],
      ];
    }
    const jagged = st === 'messy' || st === 'wild' || st === 'quiff';
    const path = (cx) => (jagged ? UW.spline(cx, cap, true, 0.35) : UW.spline(cx, cap, true, 0.8));
    celFill(ctx, S, path, c, L);
    // strands / highlights
    ctx.save();
    ctx.beginPath();
    path(ctx);
    ctx.clip();
    ctx.strokeStyle = hl;
    ctx.lineWidth = L * 1.1;
    ctx.lineCap = 'round';
    const lines = st === 'quiff'
      ? [[[0.36, -0.3], [0.46, -0.62], [0.1, -0.74]], [[0.28, -0.34], [0.3, -0.64], [-0.16, -0.64]], [[0.18, -0.3], [0.1, -0.56], [-0.34, -0.5]], [[0.0, -0.2], [-0.2, -0.4], [-0.44, -0.24]]]
      : [[[0.34, -0.34], [0.1, -0.5], [-0.3, -0.48]], [[0.2, -0.28], [-0.05, -0.4], [-0.42, -0.3]], [[0.05, -0.18], [-0.2, -0.26], [-0.46, -0.08]]];
    for (const ln of lines) {
      ctx.beginPath();
      ctx.moveTo(ln[0][0], ln[0][1]);
      ctx.quadraticCurveTo(ln[1][0], ln[1][1], ln[2][0], ln[2][1]);
      ctx.stroke();
    }
    if (st === 'undercut') {
      ctx.fillStyle = hp.side || rgba('#2a2a2a', 0.6);
      ctx.beginPath();
      ctx.moveTo(0.1, -0.22);
      ctx.lineTo(-0.5, -0.2);
      ctx.lineTo(-0.6, 0.3);
      ctx.lineTo(0.1, 0.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    if (hp.streak && st === 'layered') {
      ctx.save();
      ctx.strokeStyle = hp.streak;
      ctx.lineWidth = L * 3;
      ctx.beginPath();
      ctx.moveTo(0.38, -0.36);
      ctx.quadraticCurveTo(0.44, -0.1, 0.4, 0.14);
      ctx.stroke();
      ctx.restore();
    }
    // forward-falling strands
    if (hp.front) {
      const base = S.J.headAng;
      for (let i = 0; i < hp.front; i++) {
        const anchor = [0.3 - i * 0.07, -0.42 + i * 0.03];
        const pts = RIG.chain(anchor, base + 0.35 + i * 0.1, (hp.frontLen || 0.55) * (0.8 + hash(i) * 0.4), 5, S, { amp: 0.12, freq: 1.1, phase: i * 2.1, curl: -0.2 });
        RIG.ribbon(ctx, Object.assign({}, S, { lw: L * 0.8, lx: 0, ly: 0 }), pts, 0.07, 0.015, c, {});
      }
    }
    if (st === 'quiff') {
      // the signature curl
      ctx.save();
      ctx.strokeStyle = c;
      ctx.lineWidth = L * 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0.38, -0.32);
      ctx.bezierCurveTo(0.5, -0.24, 0.5, -0.12, 0.42, -0.12);
      ctx.bezierCurveTo(0.36, -0.12, 0.38, -0.2, 0.43, -0.2);
      ctx.stroke();
      ctx.strokeStyle = S.line;
      ctx.lineWidth = L * 0.8;
      ctx.stroke();
      ctx.restore();
    }
    if (st === 'long' || st === 'layered' || st === 'veil') {
      if (hp.sideLock !== false) locks(ctx, S, { c, c2: hp.c2, len: Math.min(2.6, hp.len * 0.5), locks: 1, w0: 0.16, w1: 0.05, amp: 0.1 }, L, true);
    }
  };

  /* ---------------- GEAR ---------------- */
  const GEAR = (UW.GEAR = {});
  const dir = (a) => [Math.sin(a), Math.cos(a)];

  /* Hand frame: origin at grip center, +x along hand, +y perpendicular (toward thumb side). */
  function handFrame(ctx, S, side) {
    const J = S.J;
    const wr = J['wr' + side], aH = J['aH' + side];
    const d = dir(aH);
    const gx = wr[0] + d[0] * S.b.hand * S.Hh * 0.42, gy = wr[1] + d[1] * S.b.hand * S.Hh * 0.42;
    ctx.translate(gx, gy);
    const r = Math.atan2(d[1], d[0]);
    ctx.rotate(r);
    return r;
  }
  GEAR.handFrame = handFrame;

  GEAR.draw = function (ctx, S, side, item, layer) {
    if (!item) return;
    const it = typeof item === 'string' ? { type: item } : item;
    const want = it.layer || (it.type === 'lantern' ? 'front' : 'back');
    if (want !== layer) return;
    const fn = GEAR[it.type];
    if (!fn) return;
    ctx.save();
    const hr = handFrame(ctx, S, side);
    if (it.abs != null) {
      // absolute orientation in body space: 0 = head of weapon straight up, + tilts forward
      ctx.rotate(-hr + (it.abs * Math.PI) / 180);
    } else ctx.rotate(((it.ang || 0) * Math.PI) / 180);
    fn(ctx, S, it, side);
    ctx.restore();
  };

  function outline(ctx, S, w) {
    ctx.strokeStyle = S.line;
    ctx.lineWidth = w || S.lw * 1.4;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  /* Malevolor's god-killing scythe. Shaft runs along the hand frame's y axis. g = grip fraction from butt. */
  GEAR.scythe = function (ctx, S, it) {
    const Hs = (it.size || 1) * 6.9 * UW.FT; // sized to a 6'11" wielder
    const Ls = Hs * 1.22, g = it.g == null ? 0.42 : it.g;
    const t = S.t;
    const sw = Hs * 0.021;
    // shaft from butt (y = +g*Ls) to head (y = -(1-g)*Ls)
    const yb = g * Ls, yh = -(1 - g) * Ls;
    const flip = it.flip ? -1 : 1;
    ctx.save();
    ctx.scale(1, flip);
    // shaft
    ctx.beginPath();
    ctx.rect(-sw / 2, yh, sw, yb - yh);
    ctx.fillStyle = '#16151a';
    ctx.fill();
    outline(ctx, S);
    ctx.fillStyle = rgba('#8e8a9c', 0.35);
    ctx.fillRect(-sw * 0.3, yh, sw * 0.18, yb - yh);
    // wraps & ferrules
    for (const k of [0.08, 0.36, 0.62]) {
      const y = lerp(yb, yh, k);
      ctx.beginPath();
      ctx.rect(-sw * 0.75, y - sw * 0.9, sw * 1.5, sw * 1.8);
      ctx.fillStyle = '#2a2530';
      ctx.fill();
      outline(ctx, S, S.lw);
    }
    // butt spike
    ctx.beginPath();
    ctx.moveTo(-sw * 0.6, yb);
    ctx.lineTo(0, yb + sw * 3.2);
    ctx.lineTo(sw * 0.6, yb);
    ctx.closePath();
    ctx.fillStyle = '#1d1a22';
    ctx.fill();
    outline(ctx, S, S.lw);
    // red channel in shaft
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba('#c0101a', 0.35 + pulse * 0.4 * (it.charge == null ? 1 : it.charge));
    ctx.lineWidth = sw * 0.16;
    ctx.beginPath();
    ctx.moveTo(sw * 0.05, yb - Ls * 0.05);
    ctx.lineTo(sw * 0.05, yh + Ls * 0.02);
    ctx.stroke();
    ctx.restore();
    // head collar
    ctx.beginPath();
    ctx.moveTo(-sw * 1.1, yh + sw * 2.5);
    ctx.lineTo(sw * 1.4, yh + sw * 1.6);
    ctx.lineTo(sw * 1.2, yh - sw * 1.2);
    ctx.lineTo(-sw * 1.3, yh - sw * 0.8);
    ctx.closePath();
    ctx.fillStyle = '#221e28';
    ctx.fill();
    outline(ctx, S);
    // blade: sweeps forward (+x) and curls down
    const Lb = Hs * 0.78;
    ctx.save();
    ctx.translate(0, yh);
    const spine = [[0, -sw * 0.6], [Lb * 0.3, -Lb * 0.16], [Lb * 0.66, -Lb * 0.12], [Lb * 0.94, Lb * 0.05], [Lb * 1.06, Lb * 0.22]];
    const edge = [[Lb * 1.06, Lb * 0.22], [Lb * 0.8, Lb * 0.05], [Lb * 0.5, -Lb * 0.01], [Lb * 0.2, Lb * 0.02], [0, sw * 1.5]];
    ctx.beginPath();
    ctx.moveTo(spine[0][0], spine[0][1]);
    ctx.bezierCurveTo(spine[1][0], spine[1][1], spine[2][0], spine[2][1], spine[3][0], spine[3][1]);
    ctx.quadraticCurveTo(Lb * 1.02, Lb * 0.1, spine[4][0], spine[4][1]);
    ctx.bezierCurveTo(edge[1][0], edge[1][1], edge[2][0], edge[2][1], edge[3][0], edge[3][1]);
    ctx.quadraticCurveTo(Lb * 0.08, Lb * 0.02, edge[4][0], edge[4][1]);
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, -Lb * 0.15, 0, Lb * 0.1);
    gr.addColorStop(0, '#2c2934');
    gr.addColorStop(0.6, '#121015');
    gr.addColorStop(1, '#3a3644');
    ctx.fillStyle = gr;
    ctx.fill();
    outline(ctx, S);
    // engraved channel
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ch = 0.3 + (it.charge == null ? 0.5 : it.charge) * 0.7;
    ctx.strokeStyle = rgba('#e0141f', 0.35 + 0.45 * ch * (0.6 + 0.4 * Math.sin(t * 3.1)));
    ctx.lineWidth = Math.max(1, sw * 0.16);
    ctx.beginPath();
    ctx.moveTo(Lb * 0.06, -Lb * 0.04);
    ctx.bezierCurveTo(Lb * 0.3, -Lb * 0.11, Lb * 0.6, -Lb * 0.08, Lb * 0.9, Lb * 0.08);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const x = Lb * (0.15 + i * 0.15);
      ctx.beginPath();
      ctx.moveTo(x, -Lb * 0.07 + i * Lb * 0.012);
      ctx.lineTo(x + Lb * 0.04, -Lb * 0.02 + i * Lb * 0.012);
      ctx.stroke();
    }
    ctx.restore();
    // the impossibly thin edge
    ctx.strokeStyle = rgba('#f4f0ff', 0.95);
    ctx.lineWidth = Math.max(0.8, S.lw * 0.45);
    ctx.beginPath();
    ctx.moveTo(edge[0][0], edge[0][1]);
    ctx.bezierCurveTo(edge[1][0], edge[1][1], edge[2][0], edge[2][1], edge[3][0], edge[3][1]);
    ctx.stroke();
    if (it.glow) UW.FX.glow(ctx, Lb * 0.6, 0, Lb * 0.6, '#d0101c', it.glow * 0.6);
    ctx.restore();
    ctx.restore();
  };

  GEAR.dagger = function (ctx, S, it) {
    const L = (it.size || 1) * S.Hh * 0.13;
    const rev = it.reverse ? -1 : 1;
    ctx.save();
    ctx.scale(1, rev);
    // grip across hand (y axis), blade extends toward -y (thumb side)
    ctx.beginPath();
    ctx.rect(-L * 0.06, -L * 0.05, L * 0.12, L * 0.34);
    ctx.fillStyle = '#1a1418';
    ctx.fill();
    outline(ctx, S, S.lw);
    ctx.beginPath();
    ctx.rect(-L * 0.16, -L * 0.1, L * 0.32, L * 0.07);
    ctx.fillStyle = '#b8b8c4';
    ctx.fill();
    outline(ctx, S, S.lw);
    ctx.beginPath();
    ctx.moveTo(-L * 0.07, -L * 0.1);
    ctx.lineTo(0, -L * 1.0);
    ctx.lineTo(L * 0.07, -L * 0.1);
    ctx.closePath();
    ctx.fillStyle = '#dcdce6';
    ctx.fill();
    outline(ctx, S, S.lw);
    if (it.blood) {
      ctx.fillStyle = rgba('#9a0e14', 0.9);
      ctx.beginPath();
      ctx.moveTo(-L * 0.05, -L * 0.5);
      ctx.lineTo(0, -L * 1.0);
      ctx.lineTo(L * 0.05, -L * 0.5);
      ctx.fill();
    }
    ctx.restore();
  };

  GEAR.knife = function (ctx, S, it) {
    GEAR.dagger(ctx, S, Object.assign({ size: 0.8 }, it));
  };

  GEAR.machete = function (ctx, S, it) {
    const L = S.Hh * 0.3 * (it.size || 1);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-L * 0.035, -L * 0.02, L * 0.07, L * 0.2);
    ctx.fillStyle = '#1b1612';
    ctx.fill();
    outline(ctx, S, S.lw);
    ctx.beginPath();
    ctx.moveTo(-L * 0.04, -L * 0.03);
    ctx.lineTo(-L * 0.06, -L * 0.8);
    ctx.quadraticCurveTo(L * 0.02, -L * 1.02, L * 0.1, -L * 0.9);
    ctx.lineTo(L * 0.045, -L * 0.03);
    ctx.closePath();
    ctx.fillStyle = '#8f9496';
    ctx.fill();
    outline(ctx, S, S.lw);
    ctx.strokeStyle = rgba('#e8ecee', 0.8);
    ctx.lineWidth = S.lw * 0.6;
    ctx.beginPath();
    ctx.moveTo(L * 0.04, -L * 0.05);
    ctx.lineTo(L * 0.09, -L * 0.88);
    ctx.stroke();
    if (it.blood) {
      ctx.fillStyle = rgba('#5e0808', 0.85);
      RIG.blob(ctx, 0, -L * 0.6, L * 0.06, 4);
      RIG.blob(ctx, L * 0.03, -L * 0.8, L * 0.05, 7);
    }
    ctx.restore();
  };

  /* Draven's blood-forged glaive: semi-transparent crimson with moving liquid. */
  GEAR.glaive = function (ctx, S, it) {
    const Hs = S.Hh;
    const L = Hs * 1.05, g = 0.45;
    const yb = g * L, yh = -(1 - g) * L;
    const t = S.t;
    ctx.save();
    ctx.globalAlpha *= 0.85;
    ctx.beginPath();
    ctx.rect(-Hs * 0.009, yh, Hs * 0.018, yb - yh);
    ctx.fillStyle = '#5a0610';
    ctx.fill();
    ctx.globalAlpha = 1;
    // blade
    const Lb = Hs * 0.36;
    ctx.beginPath();
    ctx.moveTo(-Hs * 0.012, yh);
    ctx.quadraticCurveTo(Lb * 0.35, yh - Lb * 0.3, Lb * 0.05, yh - Lb);
    ctx.quadraticCurveTo(-Lb * 0.05, yh - Lb * 0.5, -Hs * 0.02, yh + Hs * 0.02);
    ctx.closePath();
    ctx.fillStyle = rgba('#b0101e', 0.72);
    ctx.fill();
    ctx.strokeStyle = rgba('#ff5a60', 0.9);
    ctx.lineWidth = S.lw * 0.8;
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const y = yh - ((t * 0.4 + i / 6) % 1) * Lb;
      ctx.fillStyle = rgba('#ff3040', 0.35);
      ctx.beginPath();
      ctx.ellipse(Lb * 0.05, y, Lb * 0.12, Lb * 0.04, 0.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    UW.FX.glow(ctx, 0, yh - Lb * 0.5, Lb * 0.8, '#c0102a', 0.35);
    ctx.restore();
  };

  /* Solari's photonic spear of dead light. */
  GEAR.lightSpear = function (ctx, S, it) {
    const L = S.Hh * 1.3, g = 0.4;
    const yb = g * L, yh = -(1 - g) * L;
    UW.FX.beam(ctx, 0, yb, 0, yh, S.Hh * 0.012, it.color || '#ffe9a6', 0.9, S.t);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba('#fff6d6', 0.9);
    ctx.beginPath();
    ctx.moveTo(-S.Hh * 0.025, yh);
    ctx.lineTo(0, yh - S.Hh * 0.18);
    ctx.lineTo(S.Hh * 0.025, yh);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    UW.FX.glow(ctx, 0, yh - S.Hh * 0.08, S.Hh * 0.18, it.color || '#ffe9a6', 0.8, true);
  };

  /* Primordial creation-spear (giant scale — size relative to wielder height). */
  GEAR.creationSpear = function (ctx, S, it) {
    const L = S.Hh * 1.35, g = 0.42;
    const yb = g * L, yh = -(1 - g) * L;
    const w = S.Hh * 0.016;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w, yh, w * 2, yb - yh);
    ctx.fillStyle = '#b9c4cf';
    ctx.fill();
    outline(ctx, S);
    ctx.beginPath();
    ctx.moveTo(-w * 3, yh);
    ctx.lineTo(0, yh - S.Hh * 0.2);
    ctx.lineTo(w * 3, yh);
    ctx.lineTo(0, yh + w * 4);
    ctx.closePath();
    ctx.fillStyle = it.forgot ? rgba('#ffffff', 0.3) : '#dfe9f2';
    ctx.fill();
    outline(ctx, S);
    for (let i = 0; i < 6; i++) UW.FX.rune(ctx, 0, lerp(yb, yh, 0.2 + i * 0.12), w * 3, i + 3, '#8ff0ff', 0.9, S.lw);
    UW.FX.glow(ctx, 0, yh - S.Hh * 0.08, S.Hh * 0.12, '#9ff4ff', 0.5);
    ctx.restore();
  };

  /* Vayrix star-lantern: hangs below the hand. */
  GEAR.lantern = function (ctx, S, it) {
    // undo hand rotation so the lantern hangs with gravity
    const J = S.J;
    const side = it.side || 'F';
    ctx.rotate(-Math.atan2(Math.cos(J['aH' + side]), Math.sin(J['aH' + side])));
    const s = S.Hh * 0.14 * (it.size || 1);
    const sway = Math.sin(S.t * 1.7) * 0.08;
    ctx.rotate(sway);
    ctx.strokeStyle = '#2a241c';
    ctx.lineWidth = S.lw;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, s * 0.45);
    ctx.stroke();
    ctx.translate(0, s * 0.45);
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.1);
    ctx.lineTo(s * 0.3, s * 0.1);
    ctx.lineTo(s * 0.36, s * 0.9);
    ctx.lineTo(-s * 0.36, s * 0.9);
    ctx.closePath();
    ctx.fillStyle = rgba('#fff4d0', 0.25);
    ctx.fill();
    outline(ctx, S, S.lw);
    ctx.fillStyle = '#3b2e1e';
    ctx.fillRect(-s * 0.4, 0, s * 0.8, s * 0.14);
    ctx.fillRect(-s * 0.44, s * 0.86, s * 0.88, s * 0.14);
    ctx.strokeStyle = '#1a140e';
    ctx.lineWidth = S.lw * 0.8;
    ctx.strokeRect(-s * 0.4, 0, s * 0.8, s * 0.14);
    ctx.strokeRect(-s * 0.44, s * 0.86, s * 0.88, s * 0.14);
    for (const x of [-0.33, 0, 0.33]) {
      ctx.beginPath();
      ctx.moveTo(x * s, s * 0.12);
      ctx.lineTo(x * s * 1.08, s * 0.88);
      ctx.stroke();
    }
    const fl = 0.85 + 0.15 * Math.sin(S.t * 9) * Math.sin(S.t * 5.3);
    UW.FX.glow(ctx, 0, s * 0.5, s * 3.2 * (it.power || 1), '#ffe6a8', 0.55 * fl);
    UW.FX.glow(ctx, 0, s * 0.5, s * 0.5, '#ffffff', 1, true);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, s * 0.5, s * 0.07, 0, TAU);
    ctx.fill();
  };

  /* Aethelred's remembered blades */
  GEAR.hellBlade = function (ctx, S, it) {
    const L = S.Hh * 0.62;
    ctx.save();
    ctx.globalAlpha *= 0.85;
    ctx.beginPath();
    ctx.moveTo(-L * 0.04, 0);
    ctx.lineTo(-L * 0.035, -L);
    ctx.lineTo(0, -L * 1.1);
    ctx.lineTo(L * 0.035, -L);
    ctx.lineTo(L * 0.04, 0);
    ctx.closePath();
    ctx.fillStyle = rgba(it.cold ? '#bfe6ff' : '#7a0a10', 0.7);
    ctx.fill();
    ctx.strokeStyle = it.cold ? '#e8f6ff' : '#ff4a30';
    ctx.lineWidth = S.lw;
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.fillRect(-L * 0.12, -L * 0.02, L * 0.24, L * 0.04);
    ctx.fillRect(-L * 0.025, 0, L * 0.05, L * 0.16);
    UW.FX.glow(ctx, 0, -L * 0.55, L * 0.45, it.cold ? '#bfe6ff' : '#ff3010', 0.45);
    ctx.restore();
  };

  /* Oversized geometric shield (Guardians) — held on forearm. */
  GEAR.shield = function (ctx, S, it) {
    const s = S.Hh * 0.42;
    ctx.save();
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    const pts = [[0, -s], [s * 0.55, -s * 0.6], [s * 0.6, s * 0.4], [0, s], [-s * 0.6, s * 0.4], [-s * 0.55, -s * 0.6]];
    UW.poly(ctx, pts, true);
    ctx.fillStyle = it.c || '#9fb4c4';
    ctx.fill();
    outline(ctx, S);
    ctx.beginPath();
    UW.poly(ctx, pts.map((p) => [p[0] * 0.7, p[1] * 0.7]), true);
    ctx.strokeStyle = rgba('#dff7ff', 0.6);
    ctx.lineWidth = S.lw;
    ctx.stroke();
    for (let i = 0; i < 5; i++) UW.FX.rune(ctx, (hash(i) - 0.5) * s * 0.6, (hash(i + 3) - 0.5) * s, s * 0.14, i * 7, '#8ff0ff', 0.9, S.lw * 0.8);
    ctx.restore();
  };

  /* Celestial long-rifle */
  GEAR.rifle = function (ctx, S, it) {
    const L = S.Hh * 0.62;
    ctx.save();
    ctx.fillStyle = '#e8b830';
    ctx.strokeStyle = S.line;
    ctx.lineWidth = S.lw;
    ctx.beginPath();
    ctx.rect(-S.Hh * 0.018, -L * 0.75, S.Hh * 0.036, L);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a5a20';
    ctx.fillRect(-S.Hh * 0.03, L * 0.05, S.Hh * 0.06, L * 0.2);
    ctx.strokeRect(-S.Hh * 0.03, L * 0.05, S.Hh * 0.06, L * 0.2);
    if (it.charge) UW.FX.glow(ctx, 0, -L * 0.75, S.Hh * 0.08, '#ffcf6a', it.charge);
    ctx.restore();
  };

  GEAR.throwingKnife = function (ctx, S, it) {
    GEAR.dagger(ctx, S, Object.assign({ size: 0.55 }, it));
  };
})();
