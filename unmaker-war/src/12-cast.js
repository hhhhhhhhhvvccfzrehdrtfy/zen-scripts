/* The Unmaker War — cast: design-locked character specs built on the rig. */
(function () {
  'use strict';
  const UW = window.UW;
  const { TAU, lerp, sat, hash, mix, shade, rgba } = UW;
  const RIG = UW.RIG;
  const FX = UW.FX;
  const C = (UW.C = {});

  /* ---------- torso-space helpers: f = fraction of chest depth forward, u = fraction of torso length up ---------- */
  function TP(S, f, u) {
    return S.J.TP(f * S.b.chest * S.Hh, u * S.b.torso * S.Hh);
  }
  function tpoly(ctx, S, pts, c, o) {
    o = o || {};
    ctx.beginPath();
    const P = pts.map((p) => TP(S, p[0], p[1]));
    if (o.smooth) UW.spline(ctx, P, true, 0.6);
    else UW.poly(ctx, P, true);
    if (c) {
      ctx.fillStyle = c;
      ctx.fill();
    }
    if (o.line !== false) {
      ctx.strokeStyle = o.line || S.line;
      ctx.lineWidth = o.lw || S.lw;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    if (o.hi) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = rgba('#ffffff', o.hi);
      ctx.lineWidth = S.lw * 1.2;
      ctx.beginPath();
      const a = P[0], b = P[1];
      ctx.moveTo(a[0] + (S.lx || 0), a[1] + (S.ly || 0) + S.lw);
      ctx.lineTo(b[0] + (S.lx || 0), b[1] + (S.ly || 0) + S.lw);
      ctx.stroke();
      ctx.restore();
    }
  }
  function tline(ctx, S, pts, c, w, glow) {
    ctx.save();
    if (glow) ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = c;
    ctx.lineWidth = w || S.lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = TP(S, p[0], p[1]);
      if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
    });
    ctx.stroke();
    ctx.restore();
  }
  /* Horizontal band across whole torso between u0 and u1 */
  function tband(ctx, S, u0, u1, c, o) {
    tpoly(ctx, S, [[-2, u1], [2, u1 + (o && o.slope || 0)], [2, u0 + (o && o.slope || 0)], [-2, u0]], c, o);
  }
  C.TP = TP;
  C.tpoly = tpoly;
  C.tline = tline;
  C.tband = tband;

  /* Glowing crack network along points (Malevolor's armor, Valorion's damage). */
  function cracks(ctx, S, n, color, a, seed, region) {
    if (a <= 0) return;
    region = region || [-0.6, 0.6, 0.05, 0.95];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const s = (seed || 0) + i * 3.7;
      let f = lerp(region[0], region[1], hash(s)), u = lerp(region[2], region[3], hash(s + 1));
      const pts = [[f, u]];
      for (let j = 0; j < 4; j++) {
        f += (hash(s + j * 2.1 + 5) - 0.5) * 0.3;
        u += (hash(s + j * 1.7 + 9) - 0.5) * 0.18;
        pts.push([f, u]);
      }
      const pul = 0.6 + 0.4 * Math.sin(S.t * 2.2 + i);
      tline(ctx, S, pts, rgba(color, a * 0.35 * pul), S.lw * 2.6, false);
      tline(ctx, S, pts, rgba(color, a * pul), S.lw * 0.9, false);
    }
    ctx.restore();
  }
  C.cracks = cracks;

  /* Segment crack lines (limbs) */
  function segCracks(ctx, S, cap, color, a, seed, n) {
    if (a <= 0 || !cap) return;
    const { a: p0, ux, uy, nx, ny, L } = cap;
    const r = Math.max(cap.r1, cap.r2);
    ctx.save();
    ctx.beginPath();
    RIG.capsulePath(ctx, cap);
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < (n || 3); i++) {
      const s = seed + i * 4.1;
      let k = hash(s) * 0.9 + 0.05, o = (hash(s + 1) - 0.5) * r;
      ctx.beginPath();
      for (let j = 0; j < 4; j++) {
        const x = p0[0] + ux * L * k + nx * o, y = p0[1] + uy * L * k + ny * o;
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        k += (hash(s + j + 3) - 0.3) * 0.12;
        o += (hash(s + j + 7) - 0.5) * r * 0.5;
      }
      const pul = 0.6 + 0.4 * Math.sin(S.t * 2.2 + i + seed);
      ctx.strokeStyle = rgba(color, a * 0.35 * pul);
      ctx.lineWidth = S.lw * 2.4;
      ctx.stroke();
      ctx.strokeStyle = rgba(color, a * pul);
      ctx.lineWidth = S.lw * 0.8;
      ctx.stroke();
    }
    ctx.restore();
  }
  C.segCracks = segCracks;

  /* Aura: layered glow around the pelvis/torso plus crawling energy for powered states. */
  function aura(ctx, S, color, a, crawl) {
    if (a <= 0) return;
    const J = S.J, Hh = S.Hh;
    const c = TP(S, 0, 0.5);
    FX.glow(ctx, c[0], c[1], Hh * (0.55 + 0.1 * Math.sin(S.t * 3)), color, a * 0.45);
    if (crawl) {
      const pts = ['head', 'shoulder', 'elF', 'wrF', 'elB', 'wrB', 'knF', 'anF', 'knB', 'anB', 'pelvis'];
      for (let i = 0; i < 6; i++) {
        const f = Math.floor(S.t * 14 + i * 3);
        const a1 = J[pts[Math.floor(hash(f + i) * pts.length)]];
        const a2 = J[pts[Math.floor(hash(f * 1.3 + i + 5) * pts.length)]];
        if (!a1 || !a2) continue;
        FX.lightning(ctx, a1[0], a1[1], a2[0], a2[1], f * 7 + i, crawl, S.lw * 0.8, a * 0.7, 0);
      }
    }
  }
  C.aura = aura;

  /* Curved shoulder plate over the deltoid (in body space). */
  function pauldron(ctx, S, side, c, k, spikes) {
    const cap = S['delt' + side];
    if (!cap) return;
    const sh = S.J['sh' + side];
    const r = S.b.rDelt * S.Hh * (k || 1);
    const aU = S.J['aU' + side];
    ctx.save();
    ctx.translate(sh[0], sh[1]);
    ctx.rotate(-aU);
    // plate: dome from behind to front, covering top of deltoid
    ctx.beginPath();
    ctx.moveTo(-r * 1.05, r * 0.35);
    ctx.quadraticCurveTo(-r * 1.2, -r * 0.9, 0, -r * 1.05);
    ctx.quadraticCurveTo(r * 1.2, -r * 0.9, r * 1.05, r * 0.35);
    ctx.quadraticCurveTo(0, r * 0.05, -r * 1.05, r * 0.35);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    ctx.strokeStyle = S.line;
    ctx.lineWidth = S.lw;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.05);
    ctx.quadraticCurveTo(0, -r * 0.35, r * 0.8, r * 0.05);
    ctx.strokeStyle = rgba('#000000', 0.35);
    ctx.lineWidth = S.lw * 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.7);
    ctx.quadraticCurveTo(0, -r * 0.9, r * 0.45, -r * 0.72);
    ctx.strokeStyle = rgba('#ffffff', 0.3);
    ctx.stroke();
    if (spikes) {
      ctx.fillStyle = c;
      ctx.strokeStyle = S.line;
      ctx.lineWidth = S.lw;
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * r * 0.55;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.18, -r * 0.92 + Math.abs(i - 1) * r * 0.1);
        ctx.lineTo(x - r * 0.35, -r * (1.65 - Math.abs(i - 1) * 0.3));
        ctx.lineTo(x + r * 0.18, -r * 0.95 + Math.abs(i - 1) * r * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  C.pauldron = pauldron;

  /* ---------- CHASE FLOOD ---------- */
  const CHASE_SKIN = '#6b4330';
  C.chase = {
    id: 'chase', name: 'Chase', ft: 6.92, seed: 11,
    skin: CHASE_SKIN, line: '#120c0a',
    b: RIG.build({
      head: 0.124, headD: 0.118, neckR: 0.045, neckLen: 0.034,
      torso: 0.312, chest: 0.228, waist: 0.158, hips: 0.168, pecs: 0.022, traps: 0.02, glutes: 0.012,
      rDelt: 0.064, shX: -0.03, shY: 0.84, rUarm: [0.052, 0.058, 0.038], bUarm: [0.015, 0.01],
      rFarm: [0.043, 0.046, 0.03], bFarm: [0.01, 0.005], rHand: 0.03, hand: 0.078,
      rThigh: [0.074, 0.07, 0.044], bThigh: [0.014, 0.006],
      rShin: [0.044, 0.049, 0.029], bShin: [0.003, 0.013], rFoot: 0.028, foot: 0.118,
    }),
    face: { jaw: 1.35, chin: 1.15, nose: 1.35, brow: 1.4, lips: 1.05, stubble: 0.7, eyeC: '#2a180e', eyeGlowC: '#d6ecff', browW: 2.8 },
    hair: { style: 'messy', c: '#131113', hl: '#2f2c33', front: 1, frontLen: 0.45 },
    costume: {
      torso: {
        c: '#1d1e24', cloth: true,
        detail(ctx, S) {
          // pants region
          tband(ctx, S, -0.4, 0.02, '#23242b', { line: false });
          // ribbed underlayer lines
          for (let i = 0; i < 4; i++) tline(ctx, S, [[-1, 0.2 + i * 0.1], [1, 0.22 + i * 0.1]], rgba('#000000', 0.25), S.lw * 0.7);
          // muted silver chest plate
          const armorA = S.dmg ? 1 - (S.dmg.armor || 0) : 1;
          if (armorA > 0.3) {
            tpoly(ctx, S, [[0.02, 0.96], [0.8, 0.94], [0.8, 0.6], [0.3, 0.55], [0.02, 0.6]], '#7f858e', { hi: 0.5 });
            tline(ctx, S, [[0.06, 0.78], [0.8, 0.77]], rgba('#2b2d33', 0.8), S.lw * 0.8);
            // back plate
            tpoly(ctx, S, [[-1, 0.95], [-0.25, 0.97], [-0.3, 0.64], [-1, 0.6]], '#6d727b', {});
          }
          // abdominal segments
          for (let i = 0; i < 3; i++) tpoly(ctx, S, [[0.12, 0.5 - i * 0.12], [0.9, 0.5 - i * 0.12], [0.9, 0.41 - i * 0.12], [0.12, 0.41 - i * 0.12]], '#2b2d34', { lw: S.lw * 0.7 });
          // belt
          tband(ctx, S, 0.0, 0.08, '#111115', { lw: S.lw * 0.8 });
          tpoly(ctx, S, [[0.28, 0.1], [0.5, 0.1], [0.5, -0.02], [0.28, -0.02]], '#9aa0a8', { lw: S.lw * 0.7 });
          // harness strap
          tline(ctx, S, [[-0.5, 0.96], [0.5, 0.1]], '#0d0d10', S.lw * 3);
          tline(ctx, S, [[-0.5, 0.96], [0.5, 0.1]], '#34363e', S.lw * 1.2);
        },
      },
      delt: { c: '#1d1e24' },
      uarm: { c: '#1d1e24', cloth: true },
      farm: { c: '#1d1e24', cloth: true, bands: [{ a: 0.28, b: 0.98, c: '#858b94', pad: 0.007, metal: true, line: '#3a3d44' }] },
      hand: { c: CHASE_SKIN },
      thigh: { c: '#23242b', cloth: true },
      shin: { c: '#23242b', cloth: true, bands: [{ a: 0.0, b: 0.16, c: '#747a83', pad: 0.006, metal: true }, { a: 0.42, b: 1, c: '#101013' }] },
      foot: { c: '#101013', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        if (S.st.glow > 0) aura(ctx, S, '#bcd9ff', S.st.glow, S.st.glow > 0.5 ? '#e2f0ff' : null);
      },
      arm(ctx, S, side) {
        if (S.dmg && S.dmg.armor > 0.6) return;
        pauldron(ctx, S, side, side === 'B' ? '#5f646c' : '#7c828b', 0.9);
      },
    },
  };

  /* Maeve's thigh-length armored sections: curved plates riding the thigh. */
  function tasset(ctx, S, side) {
    const J = S.J;
    const hip = J['hip' + side], kn = J['kn' + side];
    const aT = J['aT' + side];
    const len = S.b.thigh * S.Hh;
    const w = S.b.rThigh[0] * S.Hh;
    const far = side === 'B';
    ctx.save();
    ctx.translate(hip[0], hip[1]);
    ctx.rotate(-aT);
    // local: +y along the thigh downward, +x forward
    for (let i = 0; i < 2; i++) {
      const y0 = -w * 0.3 + i * len * 0.28, y1 = y0 + len * 0.42;
      ctx.beginPath();
      ctx.moveTo(-w * 1.25, y0);
      ctx.quadraticCurveTo(0, y0 - w * 0.25, w * 1.35, y0 + w * 0.1);
      ctx.lineTo(w * 1.2, y1 - w * 0.2);
      ctx.quadraticCurveTo(w * 0.1, y1 + w * 0.35, -w * 1.1, y1 - w * 0.1);
      ctx.closePath();
      ctx.fillStyle = far ? '#16101a' : '#221923';
      ctx.fill();
      ctx.strokeStyle = S.line;
      ctx.lineWidth = S.lw;
      ctx.stroke();
      ctx.strokeStyle = far ? '#6d6f78' : '#a9acb6';
      ctx.lineWidth = S.lw * 0.8;
      ctx.beginPath();
      ctx.moveTo(w * 1.1, y1 - w * 0.25);
      ctx.quadraticCurveTo(w * 0.1, y1 + w * 0.2, -w * 1.0, y1 - w * 0.15);
      ctx.stroke();
      ctx.fillStyle = '#8e0f22';
      ctx.beginPath();
      ctx.arc(w * 0.1, y0 + w * 0.35, S.lw * 1.1, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- MAEVE ---------- */
  const MAEVE_SKIN = '#efe5ea';
  C.maeve = {
    id: 'maeve', name: 'Maeve', ft: 6.4, seed: 23,
    skin: MAEVE_SKIN, line: '#1a0f16',
    b: RIG.build({
      head: 0.124, neckR: 0.023, neckLen: 0.04,
      torso: 0.3, chest: 0.15, waist: 0.092, hips: 0.152, pecs: 0.022, traps: 0, glutes: 0.016,
      rDelt: 0.033, rUarm: [0.025, 0.026, 0.019], bUarm: [0.002, 0.002],
      rFarm: [0.021, 0.022, 0.015], bFarm: [0.002, 0.001], rHand: 0.017, hand: 0.07,
      rThigh: [0.05, 0.046, 0.027], bThigh: [0.006, 0.003],
      rShin: [0.027, 0.03, 0.016], bShin: [0.001, 0.006], rFoot: 0.018, foot: 0.1,
    }),
    face: { fem: 1, jaw: 0.8, chin: 0.9, nose: 0.85, brow: 0.8, lips: 1.1, lashes: true, eyeC: '#9a0c1c', eyeGlowC: '#ff2438', fangs: true, lipC: '#5a1222', browW: 1.5, browC: '#cfc8c8' },
    hair: { style: 'long', c: '#f3f0ec', c2: '#dcd7d4', hl: '#ffffff', len: 4.6, locks: 4, w0: 0.5, w1: 0.26, amp: 0.1, curl: 0.15 },
    costume: {
      neck: {
        detail(ctx, S, cap) {
          // choker with ruby
          const p = [lerp(cap.a[0], cap.b[0], 0.5), lerp(cap.a[1], cap.b[1], 0.5)];
          ctx.strokeStyle = '#0e0a0e';
          ctx.lineWidth = S.lw * 2.2;
          ctx.beginPath();
          ctx.moveTo(p[0] - cap.r1, p[1]);
          ctx.lineTo(p[0] + cap.r1, p[1]);
          ctx.stroke();
          ctx.fillStyle = '#b3122a';
          ctx.beginPath();
          ctx.arc(p[0] + cap.r1 * 0.9, p[1] + S.lw, S.lw * 1.4, 0, TAU);
          ctx.fill();
        },
      },
      torso: {
        c: '#141016', cloth: true,
        detail(ctx, S) {
          // pale décolletage above bodice
          tpoly(ctx, S, [[-0.2, 1.1], [1.2, 1.1], [1.2, 0.86], [0.5, 0.8], [0.0, 0.86], [-0.2, 0.9]], MAEVE_SKIN, { line: false });
          // bodice top edge (silver)
          tline(ctx, S, [[-0.2, 0.9], [0.0, 0.86], [0.5, 0.8], [1.2, 0.86]], '#b9bcc6', S.lw * 1.3);
          // corset lacing & silver detailing
          for (let i = 0; i < 5; i++) tline(ctx, S, [[0.3, 0.72 - i * 0.1], [0.6, 0.67 - i * 0.1]], rgba('#8d8f99', 0.9), S.lw * 0.8);
          tline(ctx, S, [[0.45, 0.78], [0.42, 0.2]], '#6a0f1d', S.lw * 1.2);
          // waist cincher
          tband(ctx, S, 0.18, 0.28, '#0c090d', { lw: S.lw * 0.8 });
          tline(ctx, S, [[-1, 0.23], [1, 0.23]], '#a6a9b3', S.lw * 0.8);
          // assassin belt with dagger sheaths
          tband(ctx, S, 0.02, 0.1, '#1e1418', { lw: S.lw * 0.8 });
          tpoly(ctx, S, [[0.5, 0.12], [0.72, 0.12], [0.62, -0.3], [0.54, -0.3]], '#2a1c22', { lw: S.lw * 0.7 });
          tpoly(ctx, S, [[-0.5, 0.12], [-0.3, 0.12], [-0.36, -0.3], [-0.44, -0.3]], '#2a1c22', { lw: S.lw * 0.7 });
        },
      },
      delt: { c: '#16121a' },
      uarm: { c: '#16121a', cloth: true },
      farm: { c: '#16121a', cloth: true, bands: [{ a: 0.8, b: 1, c: '#6a0f1d', seam: '#b9bcc6' }] },
      hand: { c: MAEVE_SKIN },
      thigh: { c: '#1b141d', cloth: true, bands: [{ a: 0.55, b: 0.66, c: '#0c090d' }] },
      shin: { c: '#0f0b10', bands: [{ a: 0.0, b: 0.08, c: '#9ea1ab' }] },
      foot: { c: '#0f0b10', boot: true },
    },
    hooks: {
      behind(ctx, S) {
        // long flowing dress panels behind (torn hems)
        const J = S.J;
        const wear = S.dmg ? S.dmg.wear || 0 : 0;
        const anchor = TP(S, -0.35, 0.05);
        const pts = RIG.chain(anchor, 0.25, S.Hh * 0.5, 7, S, { amp: 0.08, freq: 0.8, curl: -0.15, streamV: 700 });
        RIG.ribbon(ctx, S, pts, S.Hh * 0.13, S.Hh * 0.2, '#120d14', { ragged: S.Hh * (0.02 + wear * 0.05), seed: 3, fold: 2 });
      },
      midBack(ctx, S) {
        tasset(ctx, S, 'B');
      },
      mid(ctx, S) {
        // front flowing panel
        const wear = S.dmg ? S.dmg.wear || 0 : 0;
        const a1 = TP(S, 0.4, 0.04);
        const pts = RIG.chain(a1, 0.05, S.Hh * 0.44, 6, S, { amp: 0.08, freq: 0.9, phase: 2, curl: -0.3, streamV: 700 });
        RIG.ribbon(ctx, S, pts, S.Hh * 0.09, S.Hh * 0.12, '#1a1320', { ragged: S.Hh * (0.015 + wear * 0.04), seed: 7, fold: 1 });
        tasset(ctx, S, 'F');
      },
      headBack(ctx, S, L) {
        // sheer gothic bridal veil falling from the crown
        const base = S.J.headAng;
        const pts = RIG.chain([-0.05, -0.5], base - 0.5, 4.2, 8, S, { amp: 0.12, freq: 0.7, curl: 0.35, phase: 1, streamV: 600 });
        RIG.ribbon(ctx, Object.assign({}, S, { lw: L }), pts, 1.1, 2.0, '#0a070b', { alpha: 0.62, edge: rgba('#3a2a3a', 0.9) });
        // lace scallops along the hem
        ctx.save();
        ctx.globalAlpha *= 0.5;
        ctx.fillStyle = '#1a1119';
        for (let i = 2; i < pts.length; i++) {
          const p = pts[i];
          ctx.beginPath();
          ctx.arc(p[0], p[1], 0.06, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      },
      headFront(ctx, S, L) {
        // silver comb with dark-red stones anchoring the veil
        ctx.fillStyle = '#b8bbc6';
        ctx.strokeStyle = S.line;
        ctx.lineWidth = L;
        ctx.beginPath();
        ctx.moveTo(-0.2, -0.58);
        ctx.quadraticCurveTo(0.05, -0.72, 0.28, -0.56);
        ctx.lineTo(0.24, -0.5);
        ctx.quadraticCurveTo(0.05, -0.62, -0.16, -0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        for (const x of [-0.08, 0.05, 0.17]) {
          ctx.fillStyle = '#9c0f22';
          ctx.beginPath();
          ctx.arc(x, -0.6, 0.03, 0, TAU);
          ctx.fill();
        }
      },
      aura(ctx, S) {
        if (S.st.glow > 0) {
          const c = TP(S, 0, 0.5);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.6, '#c0102a', S.st.glow * 0.5);
        }
      },
    },
  };

  /* ---------- MALEVOLOR ---------- */
  const MAL_SKIN = '#5a463d';
  function malArmorBreak(S) {
    return S.dmg ? S.dmg.armor || 0 : 0;
  }
  C.malevolor = {
    id: 'malevolor', name: 'Malevolor', ft: 6.92, seed: 37,
    skin: MAL_SKIN, line: '#0c0808',
    b: RIG.build(Object.assign({}, C.chase.b, { traps: 0.028 })),
    face: {
      jaw: 1.35, chin: 1.2, nose: 1.3, brow: 1.5, lips: 0.95, stubble: 0.35, eyeC: '#9c0a12', scleraC: '#1a1111',
      eyeGlowC: '#ff1818', deadlights: true, scars: 3, scarC: '#7a4a40', browW: 3,
    },
    hair: { style: 'long', c: '#0f0d10', c2: '#1a171c', hl: '#2e2a33', len: 1.7, locks: 3, w0: 0.46, w1: 0.2, ragged: true, front: 3, frontLen: 0.75, sideLock: false, amp: 0.12 },
    hold: { F: { type: 'scythe', abs: -8, g: 0.45 } },
    costume: {
      torso: {
        c: '#131116',
        detail(ctx, S) {
          const br = malArmorBreak(S);
          // under-suit where armor has broken away
          tband(ctx, S, -0.4, 1.2, '#1c181f', { line: false });
          if (br > 0.2) {
            tpoly(ctx, S, [[0.1, 0.7], [0.9, 0.66], [0.9, 0.38], [0.2, 0.34]], MAL_SKIN, { line: false });
          }
          // jagged chest plates
          if (br < 0.85) tpoly(ctx, S, [[0.0, 0.98], [0.62, 0.96], [0.86, 0.84], [0.7, 0.72], [0.9, 0.62], [0.35, 0.56], [0.02, 0.62]], '#1d1a21', { hi: 0.18 });
          if (br < 0.5) {
            tpoly(ctx, S, [[0.15, 0.52], [0.95, 0.5], [0.8, 0.42], [0.95, 0.34], [0.2, 0.3]], '#19161c', { hi: 0.12 });
            tpoly(ctx, S, [[0.15, 0.28], [0.95, 0.26], [0.85, 0.18], [0.95, 0.1], [0.2, 0.08]], '#19161c', {});
          }
          // back plates
          if (br < 0.7) tpoly(ctx, S, [[-1, 0.98], [-0.2, 1.0], [-0.1, 0.8], [-0.35, 0.7], [-1, 0.62]], '#1a171e', { hi: 0.1 });
          // spined waist guard
          tband(ctx, S, -0.02, 0.07, '#0e0c10', { lw: S.lw * 0.8 });
          // blood-red cracks
          cracks(ctx, S, 5 + Math.floor(br * 6), '#e0101c', 0.5 + br * 0.5, 7);
        },
      },
      delt: { c: '#18151b' },
      uarm: { c: '#16131a' },
      farm: { c: '#16131a', bands: [{ a: 0.1, b: 1, c: '#1d1a21', pad: 0.006, metal: true }] },
      hand: { c: '#141116' },
      thigh: { c: '#16131a', bands: [{ a: 0.05, b: 0.6, c: '#1b181f', pad: 0.005, metal: true }] },
      shin: { c: '#16131a', bands: [{ a: 0.0, b: 1, c: '#1b181f', pad: 0.006, metal: true }] },
      foot: { c: '#111014', boot: true },
    },
    hooks: {
      arm(ctx, S, side, up, fo) {
        const br = malArmorBreak(S);
        segCracks(ctx, S, up, '#e0101c', 0.5 + br * 0.5, side === 'F' ? 3 : 5, 2);
        segCracks(ctx, S, fo, '#e0101c', 0.5 + br * 0.5, side === 'F' ? 7 : 9, 2);
        if (br < 0.6) pauldron(ctx, S, side, side === 'B' ? '#141116' : '#211d26', 1.0, true);
      },
      leg(ctx, S, side, th, sh) {
        segCracks(ctx, S, th, '#e0101c', 0.4, side === 'F' ? 13 : 15, 2);
        segCracks(ctx, S, sh, '#e0101c', 0.4, side === 'F' ? 17 : 19, 1);
      },
      aura(ctx, S) {
        if (S.st.glow > 0) {
          const c = TP(S, 0, 0.5);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.7, '#8a0010', S.st.glow * 0.6);
          FX.darkGlow(ctx, c[0], c[1] - S.Hh * 0.1, S.Hh * 0.6, S.st.glow * 0.3);
        }
      },
    },
  };

  /* ---------- GAMMA JACK ---------- */
  const JACK_SKIN = '#efc6a2';
  const JACK_BLUE = '#1f5fe6', JACK_YEL = '#ffd21a';
  C.jack = {
    id: 'jack', name: 'Gamma Jack', ft: 5.92, seed: 41,
    skin: JACK_SKIN, line: '#0e1020',
    b: RIG.build({
      head: 0.128, neckR: 0.028, neckLen: 0.034,
      torso: 0.3, chest: 0.16, waist: 0.105, hips: 0.13, pecs: 0.014, traps: 0.008, glutes: 0.01,
      rDelt: 0.043, rUarm: [0.031, 0.034, 0.024], bUarm: [0.007, 0.004],
      rFarm: [0.027, 0.029, 0.02], bFarm: [0.005, 0.002], rHand: 0.021,
      rThigh: [0.051, 0.048, 0.03], bThigh: [0.008, 0.004],
      rShin: [0.03, 0.033, 0.019], bShin: [0.002, 0.009], rFoot: 0.021,
    }),
    face: {
      jaw: 1.18, chin: 1.12, nose: 0.95, brow: 1.0, lips: 1.0, eyeC: '#2f86ff', browC: '#b8962e',
      extra(ctx, S, L) {
        // blue domino mask
        ctx.fillStyle = '#1846b8';
        ctx.strokeStyle = S.line;
        ctx.lineWidth = L;
        ctx.beginPath();
        ctx.moveTo(0.44, -0.07);
        ctx.quadraticCurveTo(0.3, -0.13, 0.12, -0.1);
        ctx.lineTo(0.05, -0.02);
        ctx.quadraticCurveTo(0.14, 0.07, 0.3, 0.06);
        ctx.quadraticCurveTo(0.4, 0.05, 0.45, 0.02);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // eye hole
        ctx.fillStyle = '#f5f1ea';
        ctx.beginPath();
        ctx.ellipse(0.3, -0.01, 0.055, 0.03, -0.1, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#2f86ff';
        ctx.beginPath();
        ctx.arc(0.33, -0.012, 0.024, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#050505';
        ctx.beginPath();
        ctx.arc(0.34, -0.012, 0.01, 0, TAU);
        ctx.fill();
        if (S.st.expr === 'smirk' || S.st.expr === 'neutral' || !S.st.expr) {
          ctx.strokeStyle = S.line;
          ctx.lineWidth = L * 1.1;
          ctx.beginPath();
          ctx.moveTo(0.25, -0.035);
          ctx.quadraticCurveTo(0.31, -0.06, 0.37, -0.03);
          ctx.stroke();
        }
      },
    },
    hair: { style: 'quiff', c: '#f0c948', hl: '#fff1a6' },
    costume: {
      torso: {
        c: JACK_BLUE, cloth: true,
        detail(ctx, S) {
          // yellow shorts over pelvis
          tpoly(ctx, S, [[-2, 0.06], [2, 0.06], [2, -0.6], [-2, -0.6]], JACK_YEL, { lw: S.lw * 0.8 });
          // belt
          tband(ctx, S, 0.02, 0.1, '#f1b800', { lw: S.lw * 0.8 });
          tpoly(ctx, S, [[0.3, 0.12], [0.52, 0.12], [0.52, 0.0], [0.3, 0.0]], '#fff0a0', { lw: S.lw * 0.7 });
          // chest emblem: yellow disc, black V/radiation mark
          const c = TP(S, 0.42, 0.74);
          const r = S.b.chest * S.Hh * 0.2;
          ctx.fillStyle = JACK_YEL;
          ctx.strokeStyle = S.line;
          ctx.lineWidth = S.lw;
          ctx.beginPath();
          ctx.ellipse(c[0], c[1], r * 0.8, r, S.J.lean, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#111';
          ctx.save();
          ctx.translate(c[0], c[1]);
          ctx.rotate(S.J.lean);
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r * 0.82, -Math.PI / 2 + i * TAU / 3 - 0.45, -Math.PI / 2 + i * TAU / 3 + 0.45);
            ctx.closePath();
            ctx.fill();
          }
          ctx.fillStyle = JACK_YEL;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.18, 0, TAU);
          ctx.fill();
          ctx.restore();
          // suit seam highlights
          tline(ctx, S, [[0.6, 0.95], [0.5, 0.3]], rgba('#ffffff', 0.18), S.lw * 1.2);
        },
      },
      delt: { c: JACK_BLUE },
      uarm: { c: JACK_BLUE, cloth: true },
      farm: { c: JACK_BLUE, cloth: true, bands: [{ a: 0.55, b: 1, c: JACK_YEL, pad: 0.004 }] },
      hand: { c: JACK_YEL },
      thigh: { c: JACK_BLUE, cloth: true, bands: [{ a: 0, b: 0.2, c: JACK_YEL }] },
      shin: { c: JACK_BLUE, cloth: true, bands: [{ a: 0.4, b: 1, c: JACK_YEL, pad: 0.003 }] },
      foot: { c: JACK_YEL, boot: true },
    },
    hooks: {
      behind(ctx, S) {
        // long yellow cape from the shoulders
        const a = TP(S, -0.3, 0.97);
        const pts = RIG.chain(a, -0.35, S.Hh * 0.78, 8, S, { amp: 0.14, freq: 1.2, curl: 0.25, streamV: 700, follow: 1 });
        const wear = S.dmg ? S.dmg.wear || 0 : 0;
        RIG.ribbon(ctx, S, pts, S.Hh * 0.09, S.Hh * 0.26, JACK_YEL, { ragged: S.Hh * (0.005 + wear * 0.05), seed: 5, fold: 2, shadeC: '#d8a400' });
      },
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          aura(ctx, S, '#ffd84a', g * 0.8, '#fff3b0');
          FX.glow(ctx, S.J.wrF[0], S.J.wrF[1], S.Hh * 0.12, '#7dff6a', g * 0.5);
          FX.glow(ctx, S.J.wrB[0], S.J.wrB[1], S.Hh * 0.1, '#7dff6a', g * 0.4);
        }
      },
    },
  };

  C.get = function (id) {
    return C[id];
  };
})();
