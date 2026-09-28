/* The Unmaker War — the rest of the cast: Flood family, Malevolor's family, Coalition, the Dead, Omnilords, Apostles, allies. */
(function () {
  'use strict';
  const UW = window.UW;
  const { TAU, lerp, sat, hash, mix, shade, rgba, noise } = UW;
  const RIG = UW.RIG;
  const FX = UW.FX;
  const C = UW.C;
  const TP = C.TP, tpoly = C.tpoly, tline = C.tline, tband = C.tband, cracks = C.cracks, segCracks = C.segCracks, aura = C.aura;

  /* ---------- shared costume hooks ---------- */
  function cape(c, o) {
    o = o || {};
    return function (ctx, S) {
      const a = TP(S, -0.32, 0.96);
      const pts = RIG.chain(a, o.ang == null ? -0.3 : o.ang, S.Hh * (o.len || 0.75), 8, S, { amp: o.amp || 0.12, freq: o.freq || 1.0, curl: o.curl == null ? 0.25 : o.curl, streamV: 700 });
      const wear = S.dmg ? S.dmg.wear || 0 : 0;
      RIG.ribbon(ctx, S, pts, S.Hh * (o.w0 || 0.1), S.Hh * (o.w1 || 0.26), c, { ragged: S.Hh * ((o.ragged || 0.005) + wear * 0.05), seed: 5, fold: o.fold == null ? 2 : o.fold, shadeC: o.shadeC });
    };
  }
  /* Coat tails / long panels from the waist. side: 'back' | 'front' */
  function coatPanel(ctx, S, o, side) {
    const back = side === 'back';
    const a = TP(S, back ? -0.45 : 0.4, o.top == null ? 0.12 : o.top);
    const ang = back ? (o.angB == null ? 0.18 : o.angB) : (o.angF == null ? -0.05 : o.angF);
    const len = S.Hh * (back ? o.len || 0.42 : (o.lenF || o.len || 0.42) * (o.asym ? 0.55 : 1));
    const pts = RIG.chain(a, ang, len, 6, S, { amp: o.amp || 0.07, freq: 0.9, phase: back ? 0 : 2, curl: back ? 0.12 : -0.2, streamV: o.streamV || 800 });
    const wear = S.dmg ? S.dmg.wear || 0 : 0;
    RIG.ribbon(ctx, S, pts, S.Hh * (o.w0 || 0.1), S.Hh * (o.w1 || 0.13), back ? shade(o.c, -0.12) : o.c, { ragged: S.Hh * ((o.ragged || 0.004) + wear * 0.04), seed: back ? 3 : 7, fold: o.fold == null ? 1 : o.fold });
    if (o.trim) {
      ctx.save();
      ctx.strokeStyle = o.trim;
      ctx.lineWidth = S.lw * 0.9;
      ctx.beginPath();
      RIG.ribbonPath(ctx, pts, S.Hh * (o.w0 || 0.1) * 0.82, S.Hh * (o.w1 || 0.13) * 0.82);
      ctx.stroke();
      ctx.restore();
    }
  }
  function coat(o) {
    return {
      midBack(ctx, S) { coatPanel(ctx, S, o, 'back'); },
      mid(ctx, S) { if (o.front !== false) coatPanel(ctx, S, o, 'front'); },
    };
  }
  /* Long robe to the floor */
  function robe(o) {
    return {
      midBack(ctx, S) {
        const a = TP(S, -0.3, o.top == null ? 0.2 : o.top);
        const pts = RIG.chain(a, 0.12, S.Hh * (o.len || 0.62), 7, S, { amp: 0.05, freq: 0.7, curl: 0.05, streamV: 800 });
        if (o.sheer) RIG.ribbon(ctx, S, pts, S.Hh * (o.w0 || 0.16), S.Hh * (o.w1 || 0.3), shade(o.c, -0.1), { alpha: o.sheer });
        else RIG.ribbon(ctx, S, pts, S.Hh * (o.w0 || 0.16), S.Hh * (o.w1 || 0.3), shade(o.c, -0.12), { fold: 2, ragged: o.ragged ? S.Hh * o.ragged : 0, seed: 2 });
      },
      mid(ctx, S) {
        const a = TP(S, 0.35, o.top == null ? 0.2 : o.top);
        const pts = RIG.chain(a, 0.02, S.Hh * (o.len || 0.62) * 0.98, 7, S, { amp: 0.05, freq: 0.75, phase: 1.5, curl: -0.08, streamV: 800 });
        if (o.sheer) RIG.ribbon(ctx, S, pts, S.Hh * (o.w0 || 0.16) * 0.9, S.Hh * (o.w1 || 0.3) * 0.85, o.c, { alpha: o.sheer, edge: o.edge });
        else RIG.ribbon(ctx, S, pts, S.Hh * (o.w0 || 0.16) * 0.9, S.Hh * (o.w1 || 0.3) * 0.85, o.c, { fold: 2, ragged: o.ragged ? S.Hh * o.ragged : 0, seed: 4 });
        if (o.trim) {
          ctx.save();
          ctx.strokeStyle = o.trim;
          ctx.lineWidth = S.lw;
          ctx.beginPath();
          RIG.ribbonPath(ctx, pts, S.Hh * (o.w0 || 0.16) * 0.8, S.Hh * (o.w1 || 0.3) * 0.75);
          ctx.stroke();
          ctx.restore();
        }
      },
    };
  }
  function merge() {
    const out = {};
    for (const h of arguments) {
      if (!h) continue;
      for (const k in h) {
        if (out[k]) {
          const a = out[k], b = h[k];
          out[k] = function () { a.apply(this, arguments); b.apply(this, arguments); };
        } else out[k] = h[k];
      }
    }
    return out;
  }
  C.hooks = { cape, coat, robe, merge, coatPanel };

  /* Angelic wing (Seraphina). */
  function wing(ctx, S, anchor, open, flap, far) {
    const L = S.Hh * 0.62;
    const burn = S.dmg ? S.dmg.wingBurn || 0 : 0;
    const blood = S.dmg ? S.dmg.blood || 0 : 0;
    const P = (a, b) => [lerp(a[0], b[0], open) * L, lerp(a[1], b[1], open) * L];
    const el = P([-0.12, -0.28], [-0.35, -0.5]);
    const wr = P([-0.22, 0.12], [-0.85, -0.78]);
    const tip = P([-0.18, 0.95], [-1.55, -0.45]);
    ctx.save();
    ctx.translate(anchor[0], anchor[1]);
    ctx.rotate(flap);
    const bone = [[0, 0], el, wr, tip];
    const N = 16;
    const pt = (u) => {
      const s = u * 3, i = Math.min(2, Math.floor(s)), f = s - i;
      return [lerp(bone[i][0], bone[i + 1][0], f), lerp(bone[i][1], bone[i + 1][1], f)];
    };
    const dirDown = [lerp(-0.2, 0.25, open), 1];
    const white = far ? '#d9d6d0' : '#f6f3ee';
    const gold = far ? '#b89a50' : '#e3c26a';
    for (let layer = 0; layer < 2; layer++) {
      for (let i = N; i >= 0; i--) {
        const u = i / N;
        const p = pt(u);
        const len = L * (layer === 0 ? 0.25 + u * u * 0.55 : 0.1 + u * 0.12);
        const w = L * (layer === 0 ? 0.05 : 0.045);
        const ang = Math.atan2(dirDown[0] - u * 0.5 * open, dirDown[1]) - u * 0.6 * open - (1 - open) * 0.1;
        const burnt = burn > 0 && hash(i * 3.3 + layer) < burn;
        ctx.save();
        ctx.translate(p[0], p[1]);
        ctx.rotate(-ang);
        ctx.beginPath();
        ctx.ellipse(0, len / 2, w, len / 2, 0, 0, TAU);
        const g = ctx.createLinearGradient(0, 0, 0, len);
        g.addColorStop(0, u < 0.35 || layer === 1 ? gold : white);
        g.addColorStop(0.45, white);
        g.addColorStop(1, burnt ? '#1c1410' : white);
        ctx.fillStyle = burnt && hash(i + layer * 7) < 0.5 ? '#2a1c16' : g;
        ctx.fill();
        ctx.strokeStyle = S.line;
        ctx.lineWidth = S.lw * 0.7;
        ctx.stroke();
        if (blood > 0.4 && hash(i * 5.1) < blood * 0.5) {
          ctx.fillStyle = 'rgba(110,10,10,0.8)';
          ctx.beginPath();
          ctx.ellipse(0, len * 0.7, w * 0.8, len * 0.2, 0, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    ctx.restore();
  }
  C.wing = wing;

  /* Visor helper for masks */
  function visor(color, glow) {
    return function (ctx, S, L) {
      ctx.fillStyle = color;
      ctx.strokeStyle = S.line;
      ctx.lineWidth = L * 0.8;
      ctx.beginPath();
      ctx.moveTo(0.46, -0.1);
      ctx.lineTo(0.1, -0.12);
      ctx.lineTo(0.08, 0.06);
      ctx.lineTo(0.47, 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (glow) UW.FX.glow(ctx, 0.3, -0.03, 0.2, glow, 0.5);
    };
  }

  /* ================= FLOOD FAMILY ================= */
  C.valor = {
    id: 'valor', name: 'Valor', ft: 6.33, seed: 101, skin: '#704634', line: '#0d0b12',
    b: RIG.build({ head: 0.128, neckR: 0.038, torso: 0.31, chest: 0.2, waist: 0.135, hips: 0.15, pecs: 0.018, traps: 0.014, rDelt: 0.056, shX: -0.026, rUarm: [0.043, 0.047, 0.032], bUarm: [0.011, 0.007], rFarm: [0.036, 0.038, 0.026], bFarm: [0.008, 0.004], rHand: 0.026, rThigh: [0.063, 0.06, 0.037], rShin: [0.037, 0.041, 0.024] }),
    face: { jaw: 1.3, chin: 1.1, nose: 1.2, brow: 1.25, eyeC: '#2aa8ff', eyeGlowC: '#8fd8ff', browW: 2.4 },
    hair: { style: 'swept', c: '#121114', hl: '#34303a' },
    costume: {
      torso: {
        c: '#141c33',
        detail(ctx, S) {
          tpoly(ctx, S, [[0.0, 0.97], [0.85, 0.93], [0.85, 0.58], [0.05, 0.54]], '#9aa3b4', { hi: 0.4 });
          tline(ctx, S, [[0.1, 0.75], [0.85, 0.74]], '#2fb4ff', S.lw * 0.9, true);
          tband(ctx, S, 0.0, 0.07, '#0c1122', { lw: S.lw * 0.8 });
          tline(ctx, S, [[-1, 0.035], [1, 0.035]], '#8f98a8', S.lw * 0.8);
          tline(ctx, S, [[0.6, 0.5], [0.4, 0.1]], 'rgba(47,180,255,0.6)', S.lw * 0.8, true);
        },
      },
      delt: { c: '#141c33' },
      uarm: { c: '#141c33', cloth: true },
      farm: { c: '#141c33', cloth: true, bands: [{ a: 0.3, b: 0.98, c: '#9aa3b4', pad: 0.005, metal: true, glow: '#2fb4ff', glowA: 0.7 }] },
      hand: { c: '#1b2440' },
      thigh: { c: '#141c33', cloth: true },
      shin: { c: '#141c33', cloth: true, bands: [{ a: 0.35, b: 1, c: '#8f98a8', pad: 0.004, metal: true }] },
      foot: { c: '#1b2440', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) aura(ctx, S, '#3fb8ff', g, '#bfeaff');
      },
    },
  };

  const SERA_SKIN = '#f3dfcd';
  C.seraphina = {
    id: 'seraphina', name: 'Seraphina', ft: 5.92, seed: 107, skin: SERA_SKIN, line: '#2a1c12',
    b: RIG.build({ head: 0.13, neckR: 0.022, neckLen: 0.04, torso: 0.3, chest: 0.145, waist: 0.095, hips: 0.145, pecs: 0.018, glutes: 0.014, rDelt: 0.033, rUarm: [0.025, 0.026, 0.019], bUarm: [0.002, 0.002], rFarm: [0.021, 0.022, 0.015], rHand: 0.017, rThigh: [0.048, 0.045, 0.027], rShin: [0.027, 0.03, 0.016] }),
    face: { fem: 1, jaw: 0.85, nose: 0.85, lips: 1.08, lashes: true, eyeC: '#e8b21e', eyeGlowC: '#fff0b0', browC: '#b89a50', browW: 1.4, lipC: '#c46a6a' },
    hair: { style: 'long', c: '#f0dc9a', c2: '#e4cc82', hl: '#fff6d0', len: 4.2, locks: 4, w0: 0.46, w1: 0.2, amp: 0.1 },
    costume: {
      torso: {
        c: '#f5f1e6',
        detail(ctx, S) {
          tpoly(ctx, S, [[0.0, 0.98], [0.9, 0.95], [0.85, 0.5], [0.1, 0.4], [-0.1, 0.6]], '#fbf8ef', { hi: 0.5 });
          tline(ctx, S, [[0.05, 0.94], [0.8, 0.9], [0.8, 0.55]], '#d4b050', S.lw * 1.2);
          tband(ctx, S, 0.15, 0.24, '#d8b45a', { lw: S.lw * 0.8 });
          if (S.dmg && S.dmg.armor > 0) cracks(ctx, S, 3 + Math.floor(S.dmg.armor * 5), '#ffe3a0', 0.6, 3);
        },
      },
      delt: { c: '#f5f1e6', bands: [{ a: 0, b: 0.9, c: '#e8d08a', pad: 0.004, metal: true }] },
      uarm: { c: SERA_SKIN },
      farm: { c: SERA_SKIN, bands: [{ a: 0.45, b: 0.98, c: '#f5f1e6', pad: 0.004, metal: true, seam: '#d4b050' }] },
      hand: { c: SERA_SKIN },
      thigh: { c: '#efe7d2', cloth: true },
      shin: { c: '#efe7d2', cloth: true, bands: [{ a: 0.4, b: 1, c: '#f5f1e6', pad: 0.004, metal: true, seam: '#d4b050' }] },
      foot: { c: '#e8d08a', boot: true },
    },
    hooks: merge(robe({ c: '#f1e9d6', len: 0.5, top: 0.18, w0: 0.14, w1: 0.26, trim: '#d4b050' }), {
      behind(ctx, S) {
        const open = S.st.wings == null ? 0.35 : S.st.wings;
        const flap = Math.sin(S.t * (S.st.flapF || 1.2)) * (S.st.flap || 0.04);
        wing(ctx, S, TP(S, -0.52, 0.86), open, flap - 0.04, true);
        wing(ctx, S, TP(S, -0.38, 0.9), open, flap, false);
      },
      headFront(ctx, S, L) {
        ctx.strokeStyle = '#e0bb4e';
        ctx.lineWidth = L * 2.4;
        ctx.beginPath();
        ctx.moveTo(-0.3, -0.36);
        ctx.quadraticCurveTo(0.1, -0.44, 0.4, -0.28);
        ctx.stroke();
        ctx.fillStyle = '#fff3c0';
        ctx.beginPath();
        ctx.arc(0.36, -0.3, 0.035, 0, TAU);
        ctx.fill();
      },
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          const c = TP(S, 0.3, 0.6);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.6, '#ffe7a6', g * 0.6);
          FX.glow(ctx, S.J.wrF[0], S.J.wrF[1], S.Hh * 0.2, '#fff6d6', g, true);
        }
      },
    }),
  };

  const ATT_SKIN = '#f8e6d8';
  C.atterea = {
    id: 'atterea', name: 'Atterea', ft: 6.0, seed: 113, skin: ATT_SKIN, line: '#2a1a2a',
    b: RIG.build({ head: 0.13, neckR: 0.022, neckLen: 0.04, torso: 0.3, chest: 0.15, waist: 0.094, hips: 0.155, pecs: 0.02, glutes: 0.016, rDelt: 0.033, rUarm: [0.025, 0.026, 0.019], rFarm: [0.021, 0.022, 0.015], rHand: 0.017, rThigh: [0.05, 0.047, 0.028], rShin: [0.028, 0.031, 0.017] }),
    face: { fem: 1, jaw: 0.85, nose: 0.85, lips: 1.08, lashes: true, eyeC: '#4bd67a', eyeGlowC: '#9dffb8', browC: '#c8a860', browW: 1.4, lipC: '#d27a82' },
    hair: { style: 'long', c: '#f2d27a', c2: '#e8c266', hl: '#fff0b8', len: 3.6, locks: 4, w0: 0.5, w1: 0.2, amp: 0.16, curl: 0.4 },
    costume: {
      torso: {
        c: '#b89ae6',
        detail(ctx, S) {
          // wrapped lilac fabric
          for (let i = 0; i < 4; i++) tline(ctx, S, [[-1, 0.2 + i * 0.18], [1, 0.36 + i * 0.18]], 'rgba(90,60,140,0.35)', S.lw);
          tband(ctx, S, 0.16, 0.24, '#e6c054', { lw: S.lw * 0.8 });
          tline(ctx, S, [[-1, 0.2], [1, 0.2]], '#fff0a0', S.lw * 0.6);
          tpoly(ctx, S, [[0.3, 1.02], [0.9, 0.98], [0.8, 0.86], [0.35, 0.9]], '#e6c054', { lw: S.lw * 0.7 });
        },
      },
      delt: { c: '#b89ae6', bands: [{ a: 0.1, b: 0.5, c: '#e6c054', pad: 0.003, metal: true }] },
      uarm: { c: ATT_SKIN },
      farm: { c: ATT_SKIN, bands: [{ a: 0.72, b: 0.86, c: '#e6c054', pad: 0.003, metal: true }] },
      hand: { c: ATT_SKIN },
      thigh: { c: '#a98ad8', cloth: true },
      shin: { c: '#a98ad8', cloth: true, bands: [{ a: 0.5, b: 1, c: '#8e6fc2' }] },
      foot: { c: '#e6c054', boot: true },
    },
    hooks: merge(coat({ c: '#c4a8ee', len: 0.36, w0: 0.12, w1: 0.1, top: 0.14, asym: true, trim: '#e6c054' }), {
      behind(ctx, S) {
        // trailing lilac ribbons
        for (let i = 0; i < 3; i++) {
          const a = TP(S, -0.4, 0.2 + i * 0.25);
          const pts = RIG.chain(a, -0.6 - i * 0.2, S.Hh * (0.45 + i * 0.1), 7, S, { amp: 0.2, freq: 1.2, phase: i * 1.7, curl: 0.3, streamV: 500, follow: 1 });
          RIG.ribbon(ctx, S, pts, S.Hh * 0.035, S.Hh * 0.012, i % 2 ? '#d7c2f5' : '#c4a8ee', {});
        }
      },
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) FX.glow(ctx, S.J.pelvis[0], S.J.pelvis[1] - S.Hh * 0.2, S.Hh * 0.5, '#b89aff', g * 0.4);
      },
    }),
  };

  const DRAVEN_SKIN = '#b0826a';
  C.draven = {
    id: 'draven', name: 'Draven', ft: 6.25, seed: 127, skin: DRAVEN_SKIN, line: '#120a0c',
    b: RIG.build({ head: 0.128, neckR: 0.033, torso: 0.31, chest: 0.18, waist: 0.12, hips: 0.14, pecs: 0.014, rDelt: 0.05, rUarm: [0.038, 0.041, 0.028], bUarm: [0.008, 0.005], rFarm: [0.032, 0.034, 0.023], rHand: 0.024, rThigh: [0.058, 0.055, 0.034], rShin: [0.034, 0.037, 0.022] }),
    face: { jaw: 1.15, chin: 1.05, nose: 1.05, brow: 1.1, eyeC: '#8c0e1c', eyeGlowC: '#ff3a4a', fangs: true, browW: 2.2 },
    hair: { style: 'wild', c: '#0e0c0f', hl: '#2a2530', front: 2, frontLen: 0.5 },
    costume: {
      torso: {
        c: '#141014',
        detail(ctx, S) {
          tpoly(ctx, S, [[0.0, 0.97], [0.85, 0.93], [0.8, 0.52], [0.05, 0.5]], '#1c161c', { hi: 0.15 });
          tline(ctx, S, [[0.1, 0.9], [0.5, 0.7], [0.2, 0.52]], '#b0101f', S.lw * 1.1, true);
          tline(ctx, S, [[-0.8, 0.9], [-0.4, 0.4]], '#8a0c18', S.lw, true);
          tband(ctx, S, 0.0, 0.07, '#0a0809', {});
        },
      },
      delt: { c: '#1c161c' },
      uarm: { c: '#141014', bands: [{ a: 0.2, b: 0.9, c: '#1c161c', seam: '#8a0c18' }] },
      farm: { c: '#141014', bands: [{ a: 0.3, b: 1, c: '#1f181f', pad: 0.004, metal: true, glow: '#b0101f', glowA: 0.6 }] },
      hand: { c: '#141014' },
      thigh: { c: '#141014', bands: [{ a: 0.3, b: 0.4, c: '#8a0c18' }] },
      shin: { c: '#141014', bands: [{ a: 0.2, b: 1, c: '#1c161c', pad: 0.005, metal: true }] },
      foot: { c: '#0e0a0e', boot: true },
    },
    hooks: merge(coat({ c: '#161016', len: 0.5, lenF: 0.22, asym: true, w0: 0.12, w1: 0.16, trim: '#6a0a14', ragged: 0.01 }), {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          const c = TP(S, 0, 0.5);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.7, '#7a0014', g * 0.6);
          FX.darkGlow(ctx, c[0], c[1], S.Hh * 0.5, g * 0.35);
        }
      },
    }),
  };

  const CAELUM_SKIN = '#8a5a40';
  C.caelum = {
    id: 'caelum', name: 'Caelum', ft: 6.08, seed: 131, skin: CAELUM_SKIN, line: '#0c1018',
    b: RIG.build({ head: 0.13, neckR: 0.029, torso: 0.31, chest: 0.16, waist: 0.105, hips: 0.13, rDelt: 0.044, rUarm: [0.032, 0.034, 0.024], rFarm: [0.027, 0.029, 0.02], rThigh: [0.05, 0.048, 0.03], rShin: [0.03, 0.033, 0.019] }),
    face: { jaw: 1.05, nose: 1.0, brow: 1.0, eyeC: '#9ab2c6', eyeGlowC: '#d6ecff', browW: 1.9 },
    hair: { style: 'short', c: '#161a2e', hl: '#2e3656', vol: 0.6 },
    costume: {
      torso: {
        c: '#1a2238',
        detail(ctx, S) {
          tpoly(ctx, S, [[-0.1, 0.98], [0.85, 0.94], [0.8, 0.6], [-0.1, 0.56]], '#8e98a6', { hi: 0.3 });
          tband(ctx, S, 0.0, 0.07, '#10162a', {});
          // spine pressure device
          const p = TP(S, -0.55, 0.62);
          ctx.fillStyle = '#c6d4e2';
          ctx.strokeStyle = S.line;
          ctx.lineWidth = S.lw;
          ctx.beginPath();
          ctx.arc(p[0], p[1], S.Hh * 0.022, 0, TAU);
          ctx.fill();
          ctx.stroke();
          FX.glow(ctx, p[0], p[1], S.Hh * 0.03, '#9fd8ff', 0.6);
        },
      },
      delt: { c: '#8e98a6' },
      uarm: { c: '#1a2238' },
      farm: { c: '#1a2238', bands: [{ a: 0.72, b: 0.92, c: '#c6d4e2', pad: 0.006, metal: true, glow: '#9fd8ff', glowA: 0.6 }] },
      hand: { c: '#252e48' },
      thigh: { c: '#8e98a6' },
      shin: { c: '#8e98a6', bands: [{ a: 0.4, b: 1, c: '#1a2238' }] },
      foot: { c: '#141a2c', boot: true },
    },
    hooks: merge(coat({ c: '#232c46', len: 0.4, w0: 0.07, w1: 0.06, top: 0.1, trim: '#8e98a6', amp: 0.1 }), {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          // pressure distortion: rings of disturbed air, not a glow
          const c = TP(S, 0, 0.5);
          for (let i = 0; i < 3; i++) {
            const r = S.Hh * (0.35 + ((S.t * 0.6 + i / 3) % 1) * 0.5);
            ctx.save();
            ctx.strokeStyle = rgba('#cfe6ff', g * 0.25 * (1 - ((S.t * 0.6 + i / 3) % 1)));
            ctx.lineWidth = S.lw * 1.5;
            ctx.setLineDash([S.lw * 6, S.lw * 4]);
            ctx.beginPath();
            ctx.ellipse(c[0], c[1], r, r * 0.9, 0, 0, TAU);
            ctx.stroke();
            ctx.restore();
          }
        }
      },
    }),
  };

  const VIRA_SKIN = '#8b5b41';
  C.vira = {
    id: 'vira', name: 'Vira', ft: 5.25, seed: 137, skin: VIRA_SKIN, line: '#120c16',
    b: RIG.build({ head: 0.14, headD: 0.125, neckR: 0.024, neckLen: 0.04, torso: 0.3, chest: 0.13, waist: 0.095, hips: 0.12, pecs: 0.004, rDelt: 0.032, rUarm: [0.024, 0.024, 0.018], rFarm: [0.02, 0.021, 0.015], rHand: 0.018, rThigh: [0.042, 0.04, 0.025], rShin: [0.025, 0.028, 0.016] }),
    face: { fem: 0.7, jaw: 0.85, nose: 0.85, chin: 0.9, eyeC: '#a45cff', eyeGlowC: '#d6b0ff', browW: 1.6, eyeW: 0.11 },
    hair: { style: 'layered', c: '#141018', hl: '#6a3aa0', len: 1.25, locks: 3, w0: 0.36, w1: 0.16 },
    costume: {
      torso: {
        c: '#16141a',
        detail(ctx, S) {
          tpoly(ctx, S, [[0.1, 0.95], [0.9, 0.92], [0.85, 0.6], [0.12, 0.56]], '#a9adb8', { hi: 0.3 });
          tline(ctx, S, [[0.15, 0.7], [0.85, 0.68]], '#9a5cff', S.lw, true);
          tband(ctx, S, 0.0, 0.07, '#0e0c12', {});
        },
      },
      delt: { c: '#a9adb8' },
      uarm: { c: '#16141a' },
      farm: { c: '#16141a', bands: [{ a: 0.5, b: 1, c: '#a9adb8', pad: 0.003, metal: true }] },
      hand: { c: '#1e1c24' },
      thigh: { c: '#16141a', bands: [{ a: 0.8, b: 1, c: '#9a5cff' }] },
      shin: { c: '#16141a', bands: [{ a: 0.0, b: 0.2, c: '#a9adb8', pad: 0.003, metal: true }] },
      foot: { c: '#0e0c12', boot: true },
    },
  };

  const ASH_SKIN = '#8a5a3c';
  C.ash = {
    id: 'ash', name: 'Ash', ft: 5.0, seed: 139, skin: ASH_SKIN, line: '#160c08',
    b: RIG.build({ head: 0.145, headD: 0.13, neckR: 0.024, neckLen: 0.035, torso: 0.3, chest: 0.13, waist: 0.1, hips: 0.115, rDelt: 0.033, rUarm: [0.024, 0.025, 0.019], rFarm: [0.021, 0.022, 0.017], rHand: 0.024, hand: 0.08, rThigh: [0.042, 0.04, 0.026], rShin: [0.026, 0.028, 0.018], rFoot: 0.024 }),
    face: {
      jaw: 0.9, nose: 0.9, chin: 0.9, eyeC: '#ff9a2a', eyeGlowC: '#ffc070', browC: '#5a2a18', browW: 1.8, eyeW: 0.11,
      extra(ctx, S, L) {
        ctx.fillStyle = 'rgba(70,30,15,0.55)';
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.arc(0.2 + hash(i) * 0.15, 0.1 + hash(i * 3) * 0.1, 0.012, 0, TAU);
          ctx.fill();
        }
      },
    },
    hair: { style: 'messy', c: '#5a2414', hl: '#8a3a1e', front: 2, frontLen: 0.4 },
    costume: {
      torso: {
        c: '#2a2a2e',
        detail(ctx, S) {
          const heat = S.st.glow || 0;
          const col = mix('#8a3a10', '#ffb030', heat);
          tline(ctx, S, [[0.45, 1], [0.45, 0.05]], col, S.lw * (1 + heat), heat > 0.2);
          tline(ctx, S, [[-1, 0.5], [1, 0.52]], col, S.lw * (1 + heat), heat > 0.2);
          tband(ctx, S, 0.0, 0.07, '#1c1c20', {});
        },
      },
      delt: { c: '#2a2a2e' },
      uarm: { c: '#2a2a2e' },
      farm: { c: '#2a2a2e', bands: [{ a: 0.55, b: 1, c: '#3a3a40', pad: 0.008 }] },
      hand: { c: '#3a3a40' },
      thigh: { c: '#2a2a2e', bands: [{ a: 0.45, b: 0.5, c: '#b0501a' }] },
      shin: { c: '#2a2a2e', bands: [{ a: 0.55, b: 1, c: '#1c1c20', pad: 0.004 }] },
      foot: { c: '#1c1c20', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          FX.glow(ctx, S.J.wrF[0], S.J.wrF[1], S.Hh * 0.25, '#ff7a1a', g);
          FX.glow(ctx, S.J.wrB[0], S.J.wrB[1], S.Hh * 0.2, '#ff7a1a', g * 0.8);
          const c = TP(S, 0, 0.5);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.6, '#ff5a10', g * 0.4);
        }
      },
    },
  };

  const ASHIRA_SKIN = '#8f5d42';
  C.ashira = {
    id: 'ashira', name: 'Ashira', ft: 4.1, seed: 149, skin: ASHIRA_SKIN, line: '#1a100c',
    b: RIG.build({ head: 0.18, headD: 0.16, neckR: 0.028, neckLen: 0.03, torso: 0.28, chest: 0.14, waist: 0.12, hips: 0.13, shY: 0.86, rDelt: 0.034, uarm: 0.15, farm: 0.13, hand: 0.07, rUarm: [0.027, 0.027, 0.022], rFarm: [0.023, 0.024, 0.02], rHand: 0.022, thigh: 0.215, shin: 0.19, rThigh: [0.048, 0.046, 0.032], rShin: [0.031, 0.033, 0.022], rFoot: 0.026, foot: 0.12 }),
    face: { fem: 0.6, jaw: 0.75, nose: 0.7, chin: 0.8, eyeC: '#4a2a14', eyeW: 0.14, browW: 1.4, lips: 1.05 },
    hair: { style: 'curly', c: '#1a110c', c2: '#2a1a10', len: 1.1 },
    costume: {
      torso: {
        c: '#f4efe2',
        detail(ctx, S) {
          tline(ctx, S, [[-1, 0.3], [1, 0.3]], '#e0bb4e', S.lw * 1.4);
          tline(ctx, S, [[0.4, 1.0], [0.4, 0.3]], '#e0bb4e', S.lw);
          tpoly(ctx, S, [[-1, 0.08], [1.2, 0.08], [1.2, -0.3], [-1, -0.3]], '#f4efe2', { lw: S.lw * 0.8 });
        },
      },
      delt: { c: '#e8cf7a', bands: [{ a: 0, b: 0.8, c: '#ecd688', pad: 0.004, metal: true }] },
      uarm: { c: '#141216' },
      farm: { c: '#141216' },
      hand: { c: ASHIRA_SKIN },
      thigh: { c: '#141216' },
      shin: { c: '#141216', bands: [{ a: 0.55, b: 1, c: '#e0bb4e' }] },
      foot: { c: '#e0bb4e', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          const c = TP(S, 0.2, 0.6);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.9, '#fff0c0', g * 0.6);
          FX.glow(ctx, S.J.wrF[0], S.J.wrF[1], S.Hh * 0.25, '#ffffff', g, true);
        }
      },
    },
  };

  /* ================= MALEVOLOR'S FAMILY ================= */
  const KAEL_SKIN = '#c08a62';
  C.kael = {
    id: 'kael', name: 'Kael', ft: 6.17, seed: 151, skin: KAEL_SKIN, line: '#120c0a',
    b: RIG.build({ head: 0.13, neckR: 0.031, torso: 0.31, chest: 0.17, waist: 0.112, hips: 0.135, rDelt: 0.047, rUarm: [0.035, 0.037, 0.026], bUarm: [0.007, 0.004], rFarm: [0.029, 0.031, 0.021], rThigh: [0.054, 0.051, 0.032], rShin: [0.032, 0.035, 0.02] }),
    face: {
      jaw: 1.1, nose: 1.05, eyeC: '#e0901a', eyeGlowC: '#ff4a20', fangs: true, browW: 2.1,
      extra(ctx, S, L) {
        const g = S.st.glow || 0;
        if (g > 0.3) {
          ctx.fillStyle = '#3a1a14';
          ctx.strokeStyle = S.line;
          ctx.lineWidth = L * 0.7;
          ctx.beginPath();
          ctx.moveTo(0.1, -0.42);
          ctx.quadraticCurveTo(0.05, -0.62, -0.08, -0.7);
          ctx.quadraticCurveTo(0.12, -0.56, 0.22, -0.42);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      },
    },
    hair: { style: 'wild', c: '#0f0d0e', hl: '#2c2830', front: 1 },
    costume: {
      torso: {
        c: '#121012',
        detail(ctx, S) {
          tpoly(ctx, S, [[-2, 1.05], [0.1, 1.02], [0.2, 0.2], [-2, 0.1]], '#3a1010', { hi: 0.12 });
          tpoly(ctx, S, [[0.72, 1.02], [2, 1.0], [2, 0.18], [0.66, 0.15]], '#3a1010', { hi: 0.12 });
          tline(ctx, S, [[0.1, 1.0], [0.2, 0.2]], '#1a0808', S.lw);
          tband(ctx, S, -0.4, 0.04, '#141414', { line: false });
        },
      },
      delt: { c: '#3a1010' },
      uarm: { c: '#3a1010', cloth: true },
      farm: { c: '#3a1010', cloth: true, bands: [{ a: 0.8, b: 1, c: '#1a0a0a' }] },
      hand: { c: KAEL_SKIN, detail(ctx, S, side) {} },
      thigh: { c: '#161616', cloth: true },
      shin: { c: '#161616', cloth: true, bands: [{ a: 0.45, b: 1, c: '#0e0e0e', pad: 0.004 }] },
      foot: { c: '#0e0e0e', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          const c = TP(S, 0, 0.5);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.6, '#c0301a', g * 0.5);
        }
      },
    },
  };

  const APH_SKIN = '#a8744e';
  C.aphrodite = {
    id: 'aphrodite', name: 'Aphrodite', ft: 6.2, seed: 157, skin: APH_SKIN, line: '#1a0c0c',
    b: RIG.build({ head: 0.125, neckR: 0.022, neckLen: 0.042, torso: 0.3, chest: 0.15, waist: 0.094, hips: 0.152, pecs: 0.02, glutes: 0.015, rDelt: 0.033, rUarm: [0.025, 0.026, 0.019], rFarm: [0.021, 0.022, 0.015], rHand: 0.017, rThigh: [0.049, 0.046, 0.027], rShin: [0.027, 0.03, 0.016] }),
    face: { fem: 1, jaw: 0.85, nose: 0.9, lips: 1.12, lashes: true, eyeC: '#b8862a', eyeGlowC: '#ffd27a', browC: '#3a1a10', browW: 1.5, lipC: '#8a2a30' },
    hair: { style: 'long', c: '#5a2414', c2: '#6a2c18', hl: '#8a3a20', len: 4.6, locks: 4, w0: 0.5, w1: 0.2, amp: 0.1 },
    costume: {
      neck: {
        detail(ctx, S, cap) {
          const p = [lerp(cap.a[0], cap.b[0], 0.35), lerp(cap.a[1], cap.b[1], 0.35)];
          ctx.strokeStyle = '#e6c054';
          ctx.lineWidth = S.lw * 1.6;
          ctx.beginPath();
          ctx.moveTo(p[0] - cap.r1, p[1] + S.lw);
          ctx.quadraticCurveTo(p[0], p[1] + cap.r1 * 0.7, p[0] + cap.r1, p[1] + S.lw);
          ctx.stroke();
        },
      },
      torso: {
        c: '#5a0e1e',
        detail(ctx, S) {
          tpoly(ctx, S, [[-0.1, 0.96], [0.85, 0.92], [0.8, 0.62], [-0.05, 0.58]], '#221416', { hi: 0.2 });
          tline(ctx, S, [[0.0, 0.93], [0.8, 0.9]], '#e6c054', S.lw * 1.1);
          tband(ctx, S, 0.18, 0.26, '#221416', {});
          tline(ctx, S, [[-1, 0.22], [1, 0.22]], '#e6c054', S.lw * 0.8);
        },
      },
      delt: { c: '#221416', bands: [{ a: 0, b: 0.8, c: '#2a1a1c', pad: 0.004, metal: true }] },
      uarm: { c: APH_SKIN },
      farm: { c: APH_SKIN, bands: [{ a: 0.78, b: 0.9, c: '#e6c054', pad: 0.003, metal: true }] },
      hand: { c: APH_SKIN },
      thigh: { c: '#5a0e1e', cloth: true },
      shin: { c: '#5a0e1e', cloth: true },
      foot: { c: '#221416', boot: true },
    },
    hooks: robe({ c: '#6a1224', len: 0.6, top: 0.22, w0: 0.15, w1: 0.34, trim: '#1a0a0c' }),
  };

  /* ================= HERO COALITION ================= */
  const TY_SKIN = '#c49474';
  C.tyrus = {
    id: 'tyrus', name: 'Tyrus', ft: 6.42, seed: 163, skin: TY_SKIN, line: '#120c0a',
    b: RIG.build({ head: 0.122, neckR: 0.045, torso: 0.31, chest: 0.205, waist: 0.145, hips: 0.155, pecs: 0.018, traps: 0.02, rDelt: 0.06, shX: -0.03, rUarm: [0.047, 0.051, 0.034], bUarm: [0.012, 0.008], rFarm: [0.039, 0.041, 0.028], bFarm: [0.008, 0.004], rHand: 0.028, rThigh: [0.066, 0.062, 0.04], rShin: [0.04, 0.044, 0.026] }),
    face: { jaw: 1.45, chin: 1.2, nose: 1.15, brow: 1.3, eyeC: '#4a2a14', browW: 2.6 },
    hair: { style: 'short', c: '#3a2416', hl: '#5a3a22', vol: 0.5 },
    costume: {
      torso: {
        c: '#3a3c40',
        detail(ctx, S) {
          tband(ctx, S, -0.5, 0.02, '#222326', { line: false });
          tband(ctx, S, 0.0, 0.07, '#141416', {});
          tline(ctx, S, [[0.0, 0.95], [0.1, 0.1]], 'rgba(0,0,0,0.3)', S.lw);
        },
      },
      delt: { c: TY_SKIN },
      uarm: { c: TY_SKIN },
      farm: { c: TY_SKIN },
      hand: { c: TY_SKIN },
      thigh: { c: '#2a2b2f', cloth: true, bands: [{ a: 0.35, b: 0.55, c: '#34363a' }] },
      shin: { c: '#2a2b2f', cloth: true, bands: [{ a: 0.55, b: 1, c: '#141416' }] },
      foot: { c: '#141416', boot: true },
    },
  };
  C.tyrusTitan = Object.assign({}, C.tyrus, {
    id: 'tyrusTitan', name: 'Tyrus (Titan)', ft: 8.58, seed: 164, skin: '#b8866a',
    b: RIG.build({ head: 0.11, neckR: 0.062, neckLen: 0.028, torso: 0.33, chest: 0.26, waist: 0.18, hips: 0.18, pecs: 0.03, traps: 0.04, rDelt: 0.082, shX: -0.035, shY: 0.82, rUarm: [0.064, 0.07, 0.048], bUarm: [0.016, 0.012], rFarm: [0.055, 0.058, 0.042], bFarm: [0.012, 0.006], rHand: 0.046, hand: 0.1, rThigh: [0.08, 0.076, 0.05], rShin: [0.05, 0.056, 0.034], rFoot: 0.035, foot: 0.13 }),
    face: {
      jaw: 1.7, chin: 1.3, nose: 1.2, brow: 1.6, eyeC: '#4a2a14', browW: 3,
      extra(ctx, S, L) {
        ctx.strokeStyle = 'rgba(90,40,30,0.45)';
        ctx.lineWidth = L * 0.8;
        ctx.beginPath();
        ctx.moveTo(-0.1, -0.3);
        ctx.quadraticCurveTo(0.0, -0.2, 0.05, -0.1);
        ctx.moveTo(-0.2, 0.2);
        ctx.quadraticCurveTo(-0.1, 0.3, 0.0, 0.42);
        ctx.stroke();
      },
    },
    costume: Object.assign({}, C.tyrus.costume, {
      torso: {
        c: '#3a3c40', cloth: true,
        detail(ctx, S) {
          tpoly(ctx, S, [[-2, 1.1], [2, 1.1], [2, 0.5], [-2, 0.56]], '#b8866a', { line: false });
          tband(ctx, S, -0.5, 0.02, '#222326', { line: false });
          tband(ctx, S, 0.0, 0.07, '#141416', {});
          // prominent veins and tendon lines
          tline(ctx, S, [[0.5, 0.95], [0.4, 0.8], [0.55, 0.65]], 'rgba(90,40,30,0.5)', S.lw * 0.9);
          tline(ctx, S, [[-0.3, 0.9], [-0.35, 0.7]], 'rgba(90,40,30,0.5)', S.lw * 0.9);
        },
      },
      delt: { c: '#b8866a' }, uarm: { c: '#b8866a' }, farm: { c: '#b8866a' }, hand: { c: '#a87a5e' },
      thigh: { c: '#2a2b2f', cloth: true }, shin: { c: '#2a2b2f', cloth: true, bands: [{ a: 0.55, b: 1, c: '#141416' }] },
    }),
    dmg0: { wear: 0.6 },
    hooks: {
      arm(ctx, S, side, up, fo) {
        ctx.save();
        ctx.strokeStyle = 'rgba(90,40,30,0.5)';
        ctx.lineWidth = S.lw * 0.9;
        ctx.beginPath();
        ctx.moveTo(lerp(fo.a[0], fo.b[0], 0.2), lerp(fo.a[1], fo.b[1], 0.2));
        ctx.lineTo(lerp(fo.a[0], fo.b[0], 0.8) + fo.nx * 3, lerp(fo.a[1], fo.b[1], 0.8) + fo.ny * 3);
        ctx.stroke();
        ctx.restore();
      },
    },
  });

  const JAKE_SKIN = '#c98f68';
  C.jake = {
    id: 'jake', name: 'Jake', ft: 6.17, seed: 167, skin: JAKE_SKIN, line: '#0c0e18',
    b: RIG.build({ head: 0.13, neckR: 0.031, torso: 0.31, chest: 0.17, waist: 0.112, hips: 0.135, rDelt: 0.047, rUarm: [0.035, 0.037, 0.026], rFarm: [0.029, 0.031, 0.021], rThigh: [0.055, 0.052, 0.032], rShin: [0.032, 0.035, 0.02] }),
    face: { jaw: 1.1, nose: 1.05, eyeC: '#4a2e18', browW: 2 },
    hair: { style: 'short', c: '#3a2618', hl: '#5a3e28', vol: 0.6 },
    costume: {
      torso: {
        c: '#2e3138',
        detail(ctx, S) {
          tpoly(ctx, S, [[0.1, 1.0], [0.9, 0.96], [0.85, 0.3], [0.2, 0.2]], '#2a4fc0', { hi: 0.3 });
          tband(ctx, S, 0.0, 0.07, '#1a1c22', {});
        },
      },
      delt: { c: '#2a4fc0' },
      uarm: { c: '#2e3138', cloth: true },
      farm: { c: '#2e3138', cloth: true, bands: [{ a: 0.4, b: 0.5, c: '#2a4fc0' }] },
      hand: { c: '#1a1c22' },
      thigh: { c: '#2e3138', cloth: true, bands: [{ a: 0.0, b: 0.15, c: '#2a4fc0' }] },
      shin: { c: '#2e3138', cloth: true, bands: [{ a: 0.5, b: 1, c: '#1a1c22' }] },
      foot: { c: '#2a4fc0', boot: true },
    },
  };

  const AX_SKIN = '#8a5a3e';
  C.axion = {
    id: 'axion', name: 'Axion', ft: 6.0, seed: 173, skin: AX_SKIN, line: '#070a0e',
    b: RIG.build({ head: 0.13, neckR: 0.03, torso: 0.31, chest: 0.17, waist: 0.115, hips: 0.135, rDelt: 0.05, rUarm: [0.036, 0.037, 0.028], rFarm: [0.031, 0.032, 0.024], rThigh: [0.055, 0.052, 0.034], rShin: [0.034, 0.036, 0.024] }),
    face: {
      jaw: 1.05, nose: 1.0, eyeC: '#2a1a10', browW: 2,
      extra(ctx, S) {
        if (S.st.helmet) {
          ctx.fillStyle = '#16191e';
          ctx.strokeStyle = S.line;
          ctx.lineWidth = S.lw / S.headScale;
          ctx.beginPath();
          ctx.ellipse(0.0, -0.05, 0.56, 0.62, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(80,230,255,0.45)';
          ctx.beginPath();
          ctx.moveTo(0.52, -0.2);
          ctx.lineTo(0.12, -0.18);
          ctx.lineTo(0.1, 0.12);
          ctx.lineTo(0.5, 0.14);
          ctx.closePath();
          ctx.fill();
          UW.FX.glow(ctx, 0.35, -0.02, 0.3, '#55e6ff', 0.5);
        }
      },
    },
    hair: { style: 'undercut', c: '#101014', hl: '#2a2a32', vol: 0.7, side: 'rgba(40,40,44,0.7)' },
    costume: {
      torso: {
        c: '#1c1f24',
        detail(ctx, S) {
          tpoly(ctx, S, [[-0.1, 0.98], [0.9, 0.95], [0.88, 0.5], [-0.05, 0.46]], '#24282f', { hi: 0.2 });
          tline(ctx, S, [[0.1, 0.9], [0.7, 0.88], [0.72, 0.55]], '#55e6ff', S.lw * 0.8, true);
          tline(ctx, S, [[0.2, 0.4], [0.8, 0.38]], '#55e6ff', S.lw * 0.7, true);
          tband(ctx, S, 0.0, 0.07, '#12151a', {});
          // spine sensor packs
          for (let i = 0; i < 3; i++) {
            const p = TP(S, -0.6, 0.35 + i * 0.22);
            ctx.fillStyle = '#2a2f38';
            ctx.strokeStyle = S.line;
            ctx.lineWidth = S.lw * 0.8;
            ctx.fillRect(p[0] - S.Hh * 0.018, p[1] - S.Hh * 0.012, S.Hh * 0.03, S.Hh * 0.024);
            ctx.strokeRect(p[0] - S.Hh * 0.018, p[1] - S.Hh * 0.012, S.Hh * 0.03, S.Hh * 0.024);
            FX.glow(ctx, p[0], p[1], S.Hh * 0.01, '#55e6ff', 0.8);
          }
        },
      },
      delt: { c: '#24282f' },
      uarm: { c: '#1c1f24', bands: [{ a: 0.1, b: 0.6, c: '#24282f', pad: 0.004, metal: true, glow: '#55e6ff', glowA: 0.5 }] },
      farm: { c: '#1c1f24', bands: [{ a: 0.1, b: 1, c: '#262a31', pad: 0.005, metal: true, glow: '#55e6ff', glowA: 0.6 }] },
      hand: { c: '#262a31' },
      thigh: { c: '#1c1f24', bands: [{ a: 0.1, b: 0.8, c: '#24282f', pad: 0.004, metal: true, glow: '#55e6ff', glowA: 0.4 }] },
      shin: { c: '#1c1f24', bands: [{ a: 0, b: 1, c: '#262a31', pad: 0.005, metal: true, glow: '#55e6ff', glowA: 0.5 }] },
      foot: { c: '#262a31', boot: true },
    },
    hooks: {
      afterHead(ctx, S) {
        // shoulder drones
        const sh = S.J.shoulder;
        for (let i = 0; i < 2; i++) {
          const x = sh[0] - S.Hh * (0.05 + i * 0.06) + Math.sin(S.t * 2 + i) * S.Hh * 0.01;
          const y = sh[1] - S.Hh * (0.12 + i * 0.03) + Math.cos(S.t * 2.4 + i) * S.Hh * 0.01;
          ctx.fillStyle = '#2a2f38';
          ctx.strokeStyle = S.line;
          ctx.lineWidth = S.lw * 0.8;
          ctx.beginPath();
          ctx.ellipse(x, y, S.Hh * 0.02, S.Hh * 0.01, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
          FX.glow(ctx, x, y, S.Hh * 0.012, '#55e6ff', 0.9);
        }
      },
    },
  };

  const NYX_SKIN = '#d6b89a';
  C.nyx = {
    id: 'nyx', name: 'Nyx', ft: 5.5, seed: 179, skin: NYX_SKIN, line: '#0c0a10',
    b: RIG.build({ head: 0.13, neckR: 0.022, neckLen: 0.04, torso: 0.3, chest: 0.145, waist: 0.092, hips: 0.14, pecs: 0.016, glutes: 0.013, rDelt: 0.032, rUarm: [0.024, 0.025, 0.018], rFarm: [0.02, 0.021, 0.015], rHand: 0.017, rThigh: [0.047, 0.044, 0.026], rShin: [0.027, 0.03, 0.016] }),
    face: {
      fem: 1, jaw: 0.85, nose: 0.85, lips: 1.02, lashes: true, eyeC: '#8a7fa6', browW: 1.4,
      extra(ctx, S, L) {
        // heavy eyeliner flick
        ctx.strokeStyle = '#050407';
        ctx.lineWidth = L * 1.2;
        ctx.beginPath();
        ctx.moveTo(0.22, 0.0);
        ctx.lineTo(0.34, -0.015);
        ctx.lineTo(0.39, -0.04);
        ctx.stroke();
      },
    },
    hair: { style: 'layered', c: '#0c0a0e', hl: '#2a2430', streak: '#4a1a6a', len: 1.35, locks: 3, w0: 0.38, w1: 0.12, ragged: true },
    costume: {
      torso: {
        c: '#121014',
        detail(ctx, S) {
          tband(ctx, S, -0.02, 0.07, '#0a080c', {});
          tline(ctx, S, [[-0.8, 0.9], [0.6, 0.1]], '#9a9aa6', S.lw * 0.8);
          tpoly(ctx, S, [[-2, 0.02], [2, 0.02], [2, -0.6], [-2, -0.6]], '#1a161c', { lw: S.lw * 0.8 });
        },
      },
      delt: { c: '#121014' },
      uarm: { c: '#121014', cloth: true },
      farm: { c: '#121014', cloth: true },
      hand: { c: NYX_SKIN, detail(ctx, S, side) {} },
      thigh: { c: '#0c0a0e', bands: [{ a: 0, b: 0.3, c: '#1a161c' }, { a: 0.45, b: 0.55, c: '#26222a' }] },
      shin: { c: '#0c0a0e', bands: [{ a: 0.35, b: 1, c: '#060508', pad: 0.005 }] },
      foot: { c: '#060508', boot: true },
    },
    hooks: {
      leg(ctx, S, side, th) {
        if (side === 'B') return;
        // thigh knife harness
        const m = [lerp(th.a[0], th.b[0], 0.5), lerp(th.a[1], th.b[1], 0.5)];
        ctx.fillStyle = '#c9ccd6';
        ctx.strokeStyle = S.line;
        ctx.lineWidth = S.lw * 0.7;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.rect(m[0] + S.Hh * (0.012 + i * 0.012), m[1] - S.Hh * 0.03, S.Hh * 0.006, S.Hh * 0.05);
          ctx.fill();
          ctx.stroke();
        }
      },
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          const c = TP(S, 0, 0.5);
          FX.darkGlow(ctx, c[0], c[1], S.Hh * 0.7, g * 0.7);
          FX.glow(ctx, c[0], c[1], S.Hh * 0.5, '#5a1a8a', g * 0.5);
        }
      },
    },
  };

  const BLAZE_SKIN = '#8f5a3c';
  C.blaze = {
    id: 'blaze', name: 'Blaze', ft: 6.08, seed: 181, skin: BLAZE_SKIN, line: '#120806',
    b: RIG.build({ head: 0.13, neckR: 0.031, torso: 0.31, chest: 0.17, waist: 0.112, hips: 0.135, rDelt: 0.047, rUarm: [0.035, 0.037, 0.026], rFarm: [0.029, 0.031, 0.021], rThigh: [0.055, 0.052, 0.032], rShin: [0.032, 0.035, 0.02] }),
    face: { jaw: 1.1, nose: 1.05, eyeC: '#d88a1a', eyeGlowC: '#ffb040', browW: 2 },
    hair: { style: 'short', c: '#4a1e12', hl: '#6a2e1a', vol: 0.6 },
    costume: {
      torso: {
        c: '#141214',
        detail(ctx, S) {
          const heat = S.st.glow || 0;
          tpoly(ctx, S, [[0.1, 0.96], [0.9, 0.93], [0.85, 0.55], [0.15, 0.5]], '#4a0c0c', { hi: 0.2 });
          tpoly(ctx, S, [[-1, 0.9], [-0.2, 0.92], [-0.25, 0.4], [-1, 0.38]], '#3a0a0a', {});
          if (heat > 0) {
            tline(ctx, S, [[0.2, 0.9], [0.5, 0.6], [0.3, 0.2]], rgba('#ff8a2a', heat), S.lw * 1.2, true);
            tline(ctx, S, [[-0.6, 0.9], [-0.5, 0.3]], rgba('#ff8a2a', heat), S.lw * 1.2, true);
          }
          tband(ctx, S, 0.0, 0.07, '#0c0a0c', {});
        },
      },
      delt: { c: '#4a0c0c' },
      uarm: { c: '#141214' },
      farm: { c: '#141214', bands: [{ a: 0.3, b: 0.95, c: '#4a0c0c', pad: 0.004, metal: true }] },
      hand: { c: '#1c1a1c' },
      thigh: { c: '#141214' },
      shin: { c: '#141214', bands: [{ a: 0, b: 0.5, c: '#3a0a0a', pad: 0.004 }] },
      foot: { c: '#0c0a0c', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          const col = g > 0.8 ? '#fff4d0' : g > 0.5 ? '#ffb040' : '#ff5a1a';
          FX.glow(ctx, S.J.wrF[0], S.J.wrF[1], S.Hh * (0.15 + g * 0.2), col, 0.5 + g * 0.5, g > 0.7);
          FX.glow(ctx, S.J.wrB[0], S.J.wrB[1], S.Hh * (0.12 + g * 0.18), col, 0.4 + g * 0.5);
          FX.glow(ctx, S.J.elF[0], S.J.elF[1], S.Hh * 0.12 * g, '#ff7a1a', g * 0.6);
        }
      },
    },
  };

  /* ================= THE DEAD ================= */
  C.jackson = {
    id: 'jackson', name: 'Jackson Storm', ft: 6.33, seed: 191, skin: '#d8c8b8', line: '#050505',
    b: RIG.build({ head: 0.125, neckR: 0.042, torso: 0.31, chest: 0.205, waist: 0.16, hips: 0.16, pecs: 0.012, traps: 0.02, rDelt: 0.056, rUarm: [0.045, 0.048, 0.034], rFarm: [0.038, 0.04, 0.028], rHand: 0.028, rThigh: [0.064, 0.06, 0.04], rShin: [0.04, 0.043, 0.026] }),
    face: {
      noEar: true, noBlink: true, skinC: '#101012', jaw: 1.2, nose: 0.8, brow: 1.1,
      extra(ctx, S, L) {
        // Original design: a smooth, emotionless black mask. Hollow eye holes.
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(0.27, -0.01, 0.07, 0.045, -0.1, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(80,80,90,0.5)';
        ctx.lineWidth = L * 0.6;
        ctx.beginPath();
        ctx.moveTo(0.45, 0.02);
        ctx.quadraticCurveTo(0.5, 0.12, 0.43, 0.2);
        ctx.moveTo(0.34, 0.33);
        ctx.lineTo(0.4, 0.33);
        ctx.stroke();
        // vibranium liner edge at the temple
        ctx.strokeStyle = 'rgba(140,140,160,0.35)';
        ctx.beginPath();
        ctx.moveTo(-0.3, -0.35);
        ctx.quadraticCurveTo(0.0, -0.45, 0.25, -0.38);
        ctx.stroke();
      },
      scleraC: '#000', eyeC: '#000',
    },
    hair: { style: 'bald' },
    hold: { F: { type: 'machete', ang: 0 } },
    costume: {
      neck: { c: '#101012' },
      torso: { c: '#18181a', detail(ctx, S) { tband(ctx, S, -0.4, 0.05, '#101012', { line: false }); } },
      delt: { c: '#101012' },
      uarm: { c: '#101012', cloth: true },
      farm: { c: '#101012', cloth: true },
      hand: { c: '#0a0a0c' },
      thigh: { c: '#121214', cloth: true },
      shin: { c: '#121214', cloth: true, bands: [{ a: 0.55, b: 1, c: '#0a0a0a', pad: 0.005 }] },
      foot: { c: '#0a0a0a', boot: true },
    },
    hooks: merge(coat({ c: '#0e0e10', len: 0.52, lenF: 0.5, w0: 0.14, w1: 0.19, top: 0.62, angB: 0.22, angF: 0.02, fold: 2, streamV: 1200 }), {
      behind(ctx, S) {
        // trench coat collar/back from the shoulders
        const a = TP(S, -0.5, 0.95);
        const pts = RIG.chain(a, 0.1, S.Hh * 0.5, 6, S, { amp: 0.04, freq: 0.6, streamV: 1400 });
        RIG.ribbon(ctx, S, pts, S.Hh * 0.08, S.Hh * 0.16, '#0c0c0e', { fold: 1 });
      },
    }),
  };

  const LENA_SKIN = '#8a5a3e';
  C.lena = {
    id: 'lena', name: 'Lena', ft: 4.6, seed: 193, skin: LENA_SKIN, line: '#120c0a',
    b: RIG.build({ head: 0.155, headD: 0.14, neckR: 0.025, neckLen: 0.035, torso: 0.29, chest: 0.13, waist: 0.11, hips: 0.12, rDelt: 0.032, uarm: 0.155, farm: 0.135, rUarm: [0.025, 0.025, 0.02], rFarm: [0.021, 0.022, 0.017], rHand: 0.02, thigh: 0.23, shin: 0.2, rThigh: [0.043, 0.041, 0.028], rShin: [0.027, 0.03, 0.019], rFoot: 0.024, foot: 0.115 }),
    face: { fem: 0.6, jaw: 0.8, nose: 0.75, chin: 0.85, eyeC: '#7a6a2a', eyeW: 0.13, browW: 1.4 },
    hair: { style: 'curly', c: '#1c120c', c2: '#2a1a10', len: 0.9 },
    hold: { F: { type: 'lantern', side: 'F' } },
    costume: {
      torso: { c: '#6a6a6e', cloth: true, detail(ctx, S) { tline(ctx, S, [[0.45, 1], [0.4, 0]], 'rgba(0,0,0,0.35)', S.lw); for (let i = 0; i < 3; i++) { const p = TP(S, 0.55, 0.8 - i * 0.2); ctx.fillStyle = '#2a2a2c'; ctx.beginPath(); ctx.arc(p[0], p[1], S.lw * 1.3, 0, TAU); ctx.fill(); } } },
      delt: { c: '#6a6a6e' },
      uarm: { c: '#6a6a6e', cloth: true },
      farm: { c: '#6a6a6e', cloth: true, bands: [{ a: 0.75, b: 1, c: '#5a5a5e', pad: 0.006 }] },
      hand: { c: LENA_SKIN },
      thigh: { c: '#2a2a30' },
      shin: { c: '#2a2a30', bands: [{ a: 0.5, b: 1, c: '#3a2a1e' }] },
      foot: { c: '#3a2a1e', boot: true },
    },
    hooks: coat({ c: '#6e6e72', len: 0.34, lenF: 0.34, w0: 0.13, w1: 0.16, top: 0.3, trim: '#4a4a4e' }),
  };

  /* ================= FOUR OMNILORDS ================= */
  C.aegis = {
    id: 'aegis', name: 'Aegis Primus', ft: 9, seed: 211, skin: '#f4f2ec', line: '#2a2418', shadeAmt: 0.18,
    b: RIG.build({ head: 0.105, neckR: 0.04, torso: 0.33, chest: 0.2, waist: 0.14, hips: 0.15, rDelt: 0.06, rUarm: [0.042, 0.044, 0.034], rFarm: [0.036, 0.038, 0.03], rThigh: [0.06, 0.056, 0.042], rShin: [0.042, 0.045, 0.034] }),
    face: {
      noEar: true, noBlink: true, jaw: 1.0, nose: 0.3, brow: 0.9, lips: 0.6, skinC: '#fbfaf6', scleraC: '#fbfaf6', eyeC: '#ffcf40',
      extra(ctx, S, L) {
        ctx.fillStyle = '#ffcf40';
        ctx.fillRect(0.2, -0.03, 0.2, 0.025);
        UW.FX.glow(ctx, 0.3, -0.02, 0.2, '#ffd860', 0.7);
      },
    },
    hair: { style: 'bald' },
    costume: {
      torso: {
        c: '#f4f2ec',
        detail(ctx, S) {
          tpoly(ctx, S, [[-0.9, 0.98], [0.9, 0.98], [0.9, 0.6], [-0.9, 0.6]], '#fffdf6', { hi: 0.5 });
          tline(ctx, S, [[-1, 0.8], [1, 0.8]], '#d8b040', S.lw * 1.2);
          tline(ctx, S, [[0, 1], [0, 0]], '#d8b040', S.lw);
          tline(ctx, S, [[-1, 0.3], [1, 0.3]], '#d8b040', S.lw * 1.2);
          for (let i = 0; i < 3; i++) {
            const p = TP(S, 0.4, 0.45 + i * 0.15);
            ctx.strokeStyle = '#d8b040';
            ctx.lineWidth = S.lw;
            ctx.strokeRect(p[0] - S.Hh * 0.01, p[1] - S.Hh * 0.01, S.Hh * 0.02, S.Hh * 0.02);
          }
        },
      },
      delt: { c: '#fffdf6', bands: [{ a: 0, b: 1, c: '#fbf6e6', pad: 0.006, metal: true, seam: '#d8b040' }] },
      uarm: { c: '#f4f2ec', bands: [{ a: 0.4, b: 0.5, c: '#d8b040' }] },
      farm: { c: '#f4f2ec', bands: [{ a: 0.2, b: 1, c: '#fbf6e6', pad: 0.005, metal: true, seam: '#d8b040' }] },
      hand: { c: '#e6e2d6' },
      thigh: { c: '#f4f2ec', bands: [{ a: 0.3, b: 0.4, c: '#d8b040' }] },
      shin: { c: '#f4f2ec', bands: [{ a: 0, b: 1, c: '#fbf6e6', pad: 0.005, metal: true, seam: '#d8b040' }] },
      foot: { c: '#e6e2d6', boot: true },
    },
    hooks: {
      behind(ctx, S) {
        // halo of rotating geometric rings
        const h = S.J.head;
        const r = S.Hh * 0.14;
        ctx.save();
        ctx.translate(h[0] - S.Hh * 0.04, h[1]);
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.rotate(S.t * (0.4 + i * 0.25) * (i % 2 ? -1 : 1));
          ctx.strokeStyle = '#e8c250';
          ctx.lineWidth = S.lw * (1.4 - i * 0.3);
          const n = 3 + i * 2;
          ctx.beginPath();
          for (let k = 0; k <= n; k++) {
            const a = (k / n) * TAU;
            const px = Math.cos(a) * r * (1 + i * 0.35), py = Math.sin(a) * r * (1 + i * 0.35);
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.restore();
        }
        FX.glow(ctx, 0, 0, r * 2.2, '#ffe08a', 0.35);
        ctx.restore();
      },
    },
  };

  C.varakal = {
    id: 'varakal', name: 'Varakal', ft: 6.1, seed: 223, skin: '#1a1420', line: '#050308',
    b: RIG.build({ head: 0.13, rDelt: 0.045, rUarm: [0.032, 0.034, 0.024], rFarm: [0.028, 0.029, 0.02] }),
    face: { noEar: true, jaw: 1.0, nose: 1.0, scleraC: '#ffe0f0', eyeC: '#ff3ad8', eyeGlowC: '#ff7ae8' },
    hair: { style: 'bald' },
    costume: {
      torso: {
        c: '#2a1a3a',
        detail(ctx, S) {
          // broken royal garments of several cultures, layered incorrectly
          const k = Math.floor(S.t * 2);
          const cols = ['#8a1a2a', '#1a5a8a', '#c89a2a', '#2a8a4a', '#6a2a8a'];
          for (let i = 0; i < 4; i++) {
            const c = cols[(i + k) % cols.length];
            const y = 0.2 + i * 0.2 + (hash(i + k) - 0.5) * 0.1;
            tpoly(ctx, S, [[-2, y + 0.12], [2, y + 0.1 + (hash(i * 3 + k) - 0.5) * 0.2], [2, y], [-2, y + (hash(i + k * 2) - 0.5) * 0.15]], c, { lw: S.lw * 0.7 });
          }
          tline(ctx, S, [[-0.8, 1], [0.9, 0.1]], '#e8c250', S.lw);
        },
      },
      delt: { c: '#c89a2a' },
      uarm: { c: '#1a1420' },
      farm: { c: '#1a1420', bands: [{ a: 0.6, b: 0.8, c: '#8a1a2a' }] },
      hand: { c: '#1a1420' },
      thigh: { c: '#2a1a3a', cloth: true },
      shin: { c: '#1a1420' },
      foot: { c: '#c89a2a', boot: true },
    },
    hooks: {
      aura(ctx, S) {
        // iridescence that will not hold still
        const c = TP(S, 0, 0.5);
        const hue = Math.round(((S.t * 90) % 360) / 15) * 15;
        FX.glow(ctx, c[0], c[1], S.Hh * 0.5, UW.toHex(...hslToRgb(hue / 360, 0.8, 0.5)), 0.35);
      },
    },
    /* per-frame asymmetric proportions */
    vary(t) {
      const f = Math.floor(t * 3);
      return { uarm: 0.14 + hash(f) * 0.08, farm: 0.13 + hash(f + 1) * 0.08, rDelt: 0.035 + hash(f + 2) * 0.03, chest: 0.14 + hash(f + 3) * 0.06 };
    },
  };
  function hslToRgb(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h * 12) % 12;
      return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
    };
    return [f(0), f(8), f(4)];
  }

  C.ezara = {
    id: 'ezara', name: 'Ezara', ft: 7.0, seed: 227, skin: '#3a2a26', line: '#0a0808',
    b: RIG.build({ head: 0.12, neckR: 0.02, neckLen: 0.05, torso: 0.3, chest: 0.12, waist: 0.08, hips: 0.12, pecs: 0.012, rDelt: 0.028, rUarm: [0.02, 0.02, 0.015], rFarm: [0.017, 0.017, 0.012], rHand: 0.014, rThigh: [0.04, 0.037, 0.022], rShin: [0.023, 0.025, 0.014] }),
    face: {
      fem: 1, jaw: 0.8, nose: 0.9, lashes: true, scleraC: '#e8ecf6', eyeC: '#e8ecf6', eyeGlowC: '#ffffff', noBlink: true, browC: '#c8ccd6', browW: 1.2,
      extra(ctx, S, L) {
        ctx.strokeStyle = 'rgba(220,228,255,0.7)';
        ctx.lineWidth = L * 0.5;
        ctx.beginPath();
        ctx.moveTo(0.3, 0.1);
        ctx.lineTo(0.25, 0.35);
        ctx.moveTo(-0.1, -0.3);
        ctx.lineTo(0.05, 0.2);
        ctx.stroke();
      },
    },
    hair: { style: 'long', c: '#d6dae6', c2: '#bfc4d2', hl: '#ffffff', len: 5.2, locks: 5, w0: 0.4, w1: 0.15, amp: 0.25, curl: -1.6, sweep: -2.2, sideLock: false },
    costume: {
      torso: { c: '#9aa0b4', detail(ctx, S) { tline(ctx, S, [[0.2, 1], [0.1, 0]], 'rgba(230,236,255,0.8)', S.lw * 0.7, true); } },
      delt: { c: '#9aa0b4' },
      uarm: { c: '#3a2a26' },
      farm: { c: '#3a2a26' },
      hand: { c: '#3a2a26' },
      thigh: { c: '#9aa0b4' },
      shin: { c: '#9aa0b4' },
      foot: { c: '#c8ccd6' },
    },
    hooks: merge(robe({ c: '#c8cede', len: 0.66, top: 0.3, w0: 0.16, w1: 0.34, sheer: 0.55, edge: 'rgba(240,244,255,0.8)' }), {
      behind(ctx, S) {
        // circular web of fate-threads behind her
        const c = TP(S, -0.2, 0.9);
        const r = S.Hh * 0.55;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 28; i++) {
          const a = (i / 28) * TAU + S.t * 0.05;
          ctx.strokeStyle = rgba('#e6ecff', 0.18);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(c[0], c[1]);
          ctx.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r);
          ctx.stroke();
        }
        for (let k = 1; k <= 5; k++) FX.ring(ctx, c[0], c[1], (r * k) / 5, 1, '#dfe6ff', 0.2);
        ctx.restore();
      },
      front(ctx, S) {
        // threads from the fingertips
        for (const side of ['F', 'B']) {
          const p = S.J['tip' + side];
          for (let i = 0; i < 6; i++) {
            const a = -Math.PI / 2 + (i - 2.5) * 0.35 + Math.sin(S.t + i) * 0.1;
            FX.thread(ctx, p[0], p[1], p[0] + Math.cos(a) * S.Hh * 0.4, p[1] + Math.sin(a) * S.Hh * 0.4 - S.Hh * 0.1, S.Hh * 0.05, '#dfe6ff', 0.8, 0.5, S.t, i);
          }
        }
      },
    }),
  };

  C.khalathos = {
    id: 'khalathos', name: "Khal'athos", ft: 7.5, seed: 229, skin: '#8a8680', line: '#0a0806',
    b: RIG.build({ head: 0.12, neckR: 0.03, neckLen: 0.042, torso: 0.32, chest: 0.17, waist: 0.12, hips: 0.13, rDelt: 0.048, rUarm: [0.034, 0.035, 0.026], rFarm: [0.029, 0.03, 0.021] }),
    face: { noEar: false, long: 0.7, jaw: 1.1, nose: 1.1, brow: 1.5, scleraC: '#1a1208', eyeC: '#ffae2a', eyeGlowC: '#ffb84a', browW: 2.6, scars: 2 },
    hair: { style: 'bald' },
    costume: {
      torso: {
        c: '#1a1612',
        detail(ctx, S) {
          tpoly(ctx, S, [[0.0, 0.98], [0.85, 0.94], [0.8, 0.5], [0.05, 0.46]], '#6a4a26', { hi: 0.2 });
          tpoly(ctx, S, [[-1, 0.95], [-0.2, 0.97], [-0.25, 0.5], [-1, 0.48]], '#231c16', {});
          // corrosion eating the plate
          ctx.fillStyle = '#0a0806';
          for (let i = 0; i < 6; i++) {
            const k = (S.t * 0.3 + i / 6) % 1;
            const p = TP(S, 0.2 + hash(i) * 0.6, 0.5 + hash(i * 3) * 0.45);
            UW.RIG.blob(ctx, p[0], p[1], S.Hh * 0.012 * Math.sin(Math.PI * k) + 1, i * 13);
          }
          tband(ctx, S, 0.0, 0.07, '#4a3418', {});
        },
      },
      delt: { c: '#6a4a26' },
      uarm: { c: '#1a1612' },
      farm: { c: '#1a1612', bands: [{ a: 0.3, b: 1, c: '#5a3e20', pad: 0.005, metal: true }] },
      hand: { c: '#7a766e' },
      thigh: { c: '#1a1612' },
      shin: { c: '#1a1612', bands: [{ a: 0, b: 1, c: '#4a3418', pad: 0.005, metal: true }] },
      foot: { c: '#231c16', boot: true },
    },
    hooks: {
      behind: cape('#1c1814', { len: 0.8, w0: 0.12, w1: 0.3, ragged: 0.04, amp: 0.05, freq: 0.5 }),
      front(ctx, S) {
        // dust falling from the armor as it decays and regenerates
        FX.burst(ctx, S.t % 1.6, 0, { n: 18, x: S.J.pelvis[0], y: S.J.pelvis[1] - S.Hh * 0.3, rx: S.Hh * 0.2, ry: S.Hh * 0.4, speed: [5, 30], dir: Math.PI / 2, spread: 1, g: 60, drag: 1, size: [1.5, 3], color: ['#6a5a40', '#3a3020'], kind: 'ash', life: [1, 1.6], seed: Math.floor(S.t / 1.6) });
      },
    },
  };

  /* ================= TWELVE APOSTLES ================= */
  function apostle(o) {
    return Object.assign({ line: '#0a0808', shadeAmt: 0.28 }, o);
  }
  C.cyrus = apostle({
    id: 'cyrus', name: 'Cyrus', ft: 6.4, seed: 301, skin: '#c8b8a8',
    b: RIG.build({ head: 0.125, neckR: 0.024, torso: 0.31, chest: 0.14, waist: 0.1, hips: 0.12, rDelt: 0.038, rUarm: [0.027, 0.028, 0.02], rFarm: [0.023, 0.024, 0.017], rThigh: [0.045, 0.042, 0.027], rShin: [0.027, 0.03, 0.017] }),
    face: { long: 0.4, jaw: 0.9, nose: 1.1, brow: 1.2, eyeC: '#bfe6ff', scleraC: '#e8f6ff', eyeGlowC: '#dff4ff', browW: 1.8 },
    hair: { style: 'slick', c: '#141216', hl: '#34303a' },
    costume: {
      torso: { c: '#1a1c24', detail(ctx, S) { tpoly(ctx, S, [[0.1, 0.95], [0.9, 0.9], [0.85, 0.4], [0.1, 0.35]], '#242833', { hi: 0.2 }); tline(ctx, S, [[0.2, 0.8], [0.8, 0.78]], '#9fdcff', S.lw * 0.7, true); } },
      delt: { c: '#2a2a2e' }, uarm: { c: '#2a2a2e' }, farm: { c: '#2a2a2e' }, hand: { c: '#c8b8a8' },
      thigh: { c: '#1a1c24' }, shin: { c: '#1a1c24' }, foot: { c: '#0e0e12', boot: true },
    },
    hooks: merge(coat({ c: '#2e2e32', len: 0.55, w0: 0.13, w1: 0.18, top: 0.6, angB: 0.2, fold: 2 }), {
      aura(ctx, S) {
        const g = S.st.glow || 0;
        if (g > 0) {
          const h = S.J.head;
          FX.glow(ctx, h[0], h[1], S.Hh * 0.35, '#bfe6ff', g * 0.6);
        }
      },
    }),
  });
  C.aethelred = apostle({
    id: 'aethelred', name: 'Aethelred', ft: 6.9, seed: 303, skin: '#e0c8b0',
    b: RIG.build({ head: 0.12, neckR: 0.045, torso: 0.32, chest: 0.21, waist: 0.16, hips: 0.16, traps: 0.02, rDelt: 0.065, shX: -0.03, rUarm: [0.048, 0.052, 0.036], rFarm: [0.041, 0.043, 0.03], rThigh: [0.068, 0.064, 0.042], rShin: [0.043, 0.047, 0.03] }),
    face: { jaw: 1.3, nose: 1.2, brow: 1.3, eyeC: '#5a7a9a', beard: 0.3, beardC: '#e0cc90', browC: '#b8a060', browW: 2.4 },
    hair: { style: 'long', c: '#e8d49a', c2: '#d8c084', hl: '#fff0c0', len: 1.9, locks: 3, w0: 0.42, w1: 0.2 },
    hold: { F: { type: 'hellBlade', ang: 90 }, B: { type: 'hellBlade', ang: 90, cold: true } },
    costume: {
      torso: { c: '#3a3a40', detail(ctx, S) { tpoly(ctx, S, [[-1, 1], [1, 1], [1, 0.45], [-1, 0.45]], '#4a4a52', { hi: 0.3 }); tpoly(ctx, S, [[-1, 0.42], [1, 0.42], [1, 0.1], [-1, 0.1]], '#5a0a10', {}); tband(ctx, S, 0.02, 0.1, '#2a2a30', {}); } },
      delt: { c: '#4a4a52', bands: [{ a: -0.1, b: 1, c: '#52525a', pad: 0.01, metal: true }] },
      uarm: { c: '#5a0a10', bands: [{ a: 0.3, b: 1, c: '#3a3a40', pad: 0.005, metal: true }] },
      farm: { c: '#3a3a40', bands: [{ a: 0, b: 1, c: '#45454c', pad: 0.006, metal: true }] },
      hand: { c: '#2a2a30' },
      thigh: { c: '#5a0a10', bands: [{ a: 0, b: 0.8, c: '#3a3a40', pad: 0.006, metal: true }] },
      shin: { c: '#3a3a40', bands: [{ a: 0, b: 1, c: '#45454c', pad: 0.007, metal: true }] },
      foot: { c: '#2a2a30', boot: true },
    },
  });
  C.vesper = apostle({
    id: 'vesper', name: 'Vesper', ft: 6.0, seed: 305, skin: '#e8dcd8',
    b: RIG.build({ head: 0.13, neckR: 0.022, torso: 0.3, chest: 0.13, waist: 0.09, hips: 0.12, rDelt: 0.032, rUarm: [0.023, 0.024, 0.017], rFarm: [0.019, 0.02, 0.014], rThigh: [0.042, 0.039, 0.024], rShin: [0.025, 0.027, 0.015] }),
    face: { fem: 0.5, jaw: 0.9, nose: 0.9, eyeC: '#c8a8ff', eyeGlowC: '#e0ccff', browC: '#dcdce0', browW: 1.4 },
    hair: { style: 'layered', c: '#eeeef2', hl: '#ffffff', len: 1.2, locks: 3, w0: 0.34, w1: 0.12 },
    costume: {
      torso: { c: '#2a1a3e', detail(ctx, S) { tline(ctx, S, [[-1, 0.8], [1, 0.6]], '#c8ccd6', S.lw); tline(ctx, S, [[-1, 0.4], [1, 0.2]], '#c8ccd6', S.lw); } },
      delt: { c: '#c8ccd6' }, uarm: { c: '#2a1a3e' }, farm: { c: '#2a1a3e', bands: [{ a: 0.7, b: 1, c: '#c8ccd6' }] }, hand: { c: '#e8dcd8' },
      thigh: { c: '#2a1a3e' }, shin: { c: '#2a1a3e' }, foot: { c: '#c8ccd6', boot: true },
    },
  });
  C.solari = apostle({
    id: 'solari', name: 'Solari', ft: 6.2, seed: 307, skin: '#b8844e',
    b: RIG.build({ head: 0.128, neckR: 0.024, torso: 0.3, chest: 0.15, waist: 0.1, hips: 0.145, pecs: 0.018, rDelt: 0.036, rUarm: [0.027, 0.028, 0.02], rFarm: [0.023, 0.024, 0.017], rThigh: [0.05, 0.047, 0.028], rShin: [0.029, 0.032, 0.018] }),
    face: { fem: 1, jaw: 0.95, nose: 0.9, lashes: true, eyeC: '#ffc83a', eyeGlowC: '#ffe8a0', browC: '#e8d8a0', browW: 1.5 },
    hair: { style: 'long', c: '#f6e8b8', c2: '#ecd8a0', hl: '#ffffff', len: 3.2, locks: 3, w0: 0.42, w1: 0.16 },
    hold: { F: { type: 'lightSpear', abs: 70 } },
    costume: {
      torso: { c: '#f6f2e6', detail(ctx, S) { tpoly(ctx, S, [[0.0, 0.98], [0.9, 0.94], [0.85, 0.5], [0.05, 0.46]], '#fffbef', { hi: 0.5 }); tline(ctx, S, [[0.05, 0.94], [0.85, 0.9]], '#e8c050', S.lw * 1.2); tband(ctx, S, 0.0, 0.08, '#e8c050', {}); } },
      delt: { c: '#fffbef', bands: [{ a: -0.1, b: 0.9, c: '#f6ecd0', pad: 0.006, metal: true, seam: '#e8c050' }] },
      uarm: { c: '#b8844e' }, farm: { c: '#b8844e', bands: [{ a: 0.4, b: 1, c: '#f6f2e6', pad: 0.004, metal: true }] }, hand: { c: '#b8844e' },
      thigh: { c: '#f6f2e6' }, shin: { c: '#f6f2e6', bands: [{ a: 0.3, b: 1, c: '#e8c050', pad: 0.003 }] }, foot: { c: '#e8c050', boot: true },
    },
  });
  C.ignis = apostle({
    id: 'ignis', name: 'Ignis', ft: 6.5, seed: 309, skin: '#b8765a',
    b: RIG.build({ head: 0.122, neckR: 0.042, torso: 0.31, chest: 0.21, waist: 0.155, hips: 0.16, rDelt: 0.06, rUarm: [0.046, 0.05, 0.034], rFarm: [0.039, 0.041, 0.028], rThigh: [0.064, 0.06, 0.04], rShin: [0.04, 0.044, 0.026] }),
    face: { jaw: 1.25, nose: 1.15, brow: 1.2, eyeC: '#ff8a1a', eyeGlowC: '#ffb040', browW: 2.4 },
    hair: { style: 'wild', c: '#7a1410', hl: '#b02818' },
    costume: {
      torso: { c: '#141012', detail(ctx, S) { cracks(ctx, S, 7, '#ff6a1a', 0.9, 31); tband(ctx, S, 0.0, 0.07, '#0c0a0a', {}); } },
      delt: { c: '#1a1414' }, uarm: { c: '#141012' }, farm: { c: '#141012' }, hand: { c: '#1a1414' },
      thigh: { c: '#141012' }, shin: { c: '#141012' }, foot: { c: '#0c0a0a', boot: true },
    },
    hooks: {
      arm(ctx, S, side, up, fo) {
        segCracks(ctx, S, up, '#ff6a1a', 0.9, side === 'F' ? 41 : 43, 2);
        segCracks(ctx, S, fo, '#ff6a1a', 0.9, side === 'F' ? 45 : 47, 2);
      },
      front(ctx, S) {
        for (const k of ['shoulder', 'elF', 'wrF']) {
          const p = S.J[k];
          FX.glow(ctx, p[0], p[1] - S.Hh * 0.02, S.Hh * 0.12, '#ff6a1a', 0.5 + 0.2 * Math.sin(S.t * 8 + p[0]));
        }
      },
    },
  });
  C.apostleAsh = apostle({
    id: 'apostleAsh', name: 'Ash (Apostle)', ft: 5.9, seed: 311, skin: '#8a8a88',
    b: RIG.build({ head: 0.13, neckR: 0.022, torso: 0.3, chest: 0.135, waist: 0.09, hips: 0.135, pecs: 0.012, rDelt: 0.032, rUarm: [0.023, 0.024, 0.017], rFarm: [0.019, 0.02, 0.014], rThigh: [0.045, 0.042, 0.025], rShin: [0.026, 0.028, 0.016] }),
    face: { fem: 1, jaw: 0.85, nose: 0.85, lashes: true, scleraC: '#0a0806', eyeC: '#ff8a2a', eyeGlowC: '#ff9a3a', browC: '#bdbdbd', browW: 1.3 },
    hair: { style: 'long', c: '#c8c6c2', c2: '#aeaca8', len: 2.2, locks: 3, w0: 0.36, w1: 0.14, ragged: true },
    costume: {
      torso: { c: '#2a2826', cloth: true, detail(ctx, S) { tline(ctx, S, [[-1, 0.3], [1, 0.5]], '#ff7a2a', S.lw, true); } },
      delt: { c: '#2a2826' }, uarm: { c: '#8a8a88' }, farm: { c: '#8a8a88' }, hand: { c: '#8a8a88' },
      thigh: { c: '#2a2826' }, shin: { c: '#2a2826' }, foot: { c: '#1a1816' },
    },
    hooks: merge(robe({ c: '#242220', len: 0.55, top: 0.2, w0: 0.14, w1: 0.26, ragged: 0.03 }), {
      front(ctx, S) {
        FX.burst(ctx, S.t % 1.4, 0, { n: 20, x: S.J.pelvis[0], y: S.J.pelvis[1] - S.Hh * 0.35, rx: S.Hh * 0.25, ry: S.Hh * 0.5, speed: [10, 40], dir: -Math.PI / 2, spread: 1.2, g: -20, drag: 0.8, size: [1.5, 3.5], color: ['#9a9894', '#5a5854', '#ff7a2a'], kind: 'ash', life: [1, 1.4], seed: Math.floor(S.t / 1.4) });
      },
    }),
  });
  C.krell = apostle({
    id: 'krell', name: 'Krell', ft: 7.5, seed: 313, skin: '#8a8c8e',
    b: RIG.build({ head: 0.108, neckR: 0.06, neckLen: 0.02, torso: 0.33, chest: 0.26, waist: 0.22, hips: 0.2, traps: 0.04, rDelt: 0.08, shX: -0.04, shY: 0.82, rUarm: [0.064, 0.068, 0.052], rFarm: [0.056, 0.058, 0.048], rHand: 0.042, rThigh: [0.085, 0.082, 0.06], rShin: [0.06, 0.064, 0.05], rFoot: 0.04, foot: 0.14 }),
    face: { jaw: 1.8, chin: 1.4, nose: 1.4, brow: 1.8, eyeC: '#2a2a2a', browW: 3.2 },
    hair: { style: 'bald' },
    costume: {
      torso: { c: '#4a4c50', detail(ctx, S) { for (let i = 0; i < 5; i++) tpoly(ctx, S, [[-1, 0.95 - i * 0.2], [1, 0.95 - i * 0.2], [1, 0.8 - i * 0.2], [-1, 0.8 - i * 0.2]], i % 2 ? '#3a3c40' : '#444649', { lw: S.lw * 0.8 }); } },
      delt: { c: '#4a4c50', bands: [{ a: 0, b: 1, c: '#3a3c40', pad: 0.01 }] },
      uarm: { c: '#8a8c8e' }, farm: { c: '#4a4c50', bands: [{ a: 0, b: 1, c: '#3a3c40', pad: 0.008 }] }, hand: { c: '#7a7c7e' },
      thigh: { c: '#4a4c50' }, shin: { c: '#3a3c40', bands: [{ a: 0, b: 1, c: '#444649', pad: 0.01 }] }, foot: { c: '#3a3c40', boot: true },
    },
  });
  C.morphic = apostle({
    id: 'morphic', name: 'Morphic', ft: 6.3, seed: 317, skin: '#3a3e46', line: '#040406',
    b: RIG.build({ head: 0.125, rDelt: 0.045, rUarm: [0.033, 0.035, 0.025], rFarm: [0.03, 0.034, 0.024], rThigh: [0.052, 0.05, 0.032], rShin: [0.032, 0.035, 0.022] }),
    face: { noEar: true, jaw: 1.0, nose: 0.4, lips: 0.6, scleraC: '#ffffff', eyeC: '#ffffff', eyeGlowC: '#ffffff', noBlink: true },
    hair: { style: 'bald' },
    costume: {
      torso: {
        c: '#4a505a',
        detail(ctx, S) {
          const g = ctx.createLinearGradient(-50, -200, 50, 0);
          g.addColorStop(0, 'rgba(255,255,255,0.25)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          tpoly(ctx, S, [[-1, 0.9], [1, 0.95], [1, 0.3], [-1, 0.2]], null, { line: false });
          tline(ctx, S, [[-0.5, 0.8], [0.4, 0.5], [0.8, 0.6]], 'rgba(160,40,40,0.6)', S.lw * 1.2);
          if (S.st.shell) tpoly(ctx, S, [[-1.2, 1.05], [1.2, 1.05], [1.2, -0.1], [-1.2, -0.1]], '#9aa2ae', { hi: 0.6 });
        },
      },
      delt: { c: '#4a505a' }, uarm: { c: '#3a3e46' }, farm: { c: '#4a505a' }, hand: { c: '#3a3e46' },
      thigh: { c: '#3a3e46' }, shin: { c: '#4a505a' }, foot: { c: '#3a3e46', boot: true },
    },
  });
  C.lyra = apostle({
    id: 'lyra', name: 'Lyra', ft: 6.0, seed: 319, skin: '#e6d0c8',
    b: RIG.build({ head: 0.13, neckR: 0.022, torso: 0.3, chest: 0.14, waist: 0.092, hips: 0.14, pecs: 0.016, rDelt: 0.032, rUarm: [0.024, 0.025, 0.018], rFarm: [0.02, 0.021, 0.015], rThigh: [0.046, 0.043, 0.026], rShin: [0.027, 0.029, 0.016] }),
    face: { fem: 1, jaw: 0.85, nose: 0.85, lashes: true, eyeC: '#2ae6ff', eyeGlowC: '#9ff4ff', browC: '#6a3aa0', browW: 1.3 },
    hair: { style: 'long', c: '#7a3ac8', c2: '#6a2eb0', hl: '#b88af0', len: 3.6, locks: 4, w0: 0.44, w1: 0.16 },
    costume: {
      torso: { c: '#2a1446', detail(ctx, S) { for (let i = 0; i < 6; i++) { const p = TP(S, (hash(i) - 0.3), 0.2 + hash(i * 2) * 0.7); ctx.fillStyle = '#e6e6ff'; ctx.fillRect(p[0], p[1], 2, 2); } } },
      delt: { c: '#2a1446' }, uarm: { c: '#e6d0c8' }, farm: { c: '#e6d0c8' }, hand: { c: '#e6d0c8' },
      thigh: { c: '#2a1446' }, shin: { c: '#2a1446' }, foot: { c: '#c8ccd6' },
    },
    hooks: merge(robe({ c: '#34185a', len: 0.6, top: 0.25, w0: 0.14, w1: 0.3, trim: '#c8ccd6' }), {
      arm(ctx, S, side, up, fo) {
        for (let i = 0; i < 2; i++) {
          const k = 0.35 + i * 0.35;
          const p = [lerp(fo.a[0], fo.b[0], k), lerp(fo.a[1], fo.b[1], k)];
          ctx.save();
          ctx.strokeStyle = '#d8dce6';
          ctx.lineWidth = S.lw * 0.9;
          ctx.beginPath();
          ctx.ellipse(p[0], p[1] + Math.sin(S.t * 2 + i) * 2, S.Hh * 0.035, S.Hh * 0.012, Math.atan2(fo.uy, fo.ux) + Math.PI / 2, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      },
    }),
  });
  C.xenon = apostle({
    id: 'xenon', name: 'Xenon', ft: 6.1, seed: 321, skin: '#9aa6b8',
    b: RIG.build({ head: 0.13, neckR: 0.028, torso: 0.31, chest: 0.155, waist: 0.105, hips: 0.125, rDelt: 0.042, rUarm: [0.03, 0.032, 0.022], rFarm: [0.026, 0.027, 0.019], rThigh: [0.05, 0.047, 0.029], rShin: [0.029, 0.032, 0.018] }),
    face: { jaw: 1.05, eyeC: '#2a6aff', eyeGlowC: '#8ab4ff', browC: '#e8ecf4', browW: 1.8 },
    hair: { style: 'short', c: '#eef2f8', hl: '#ffffff', vol: 0.5 },
    costume: {
      torso: { c: '#142a5a', detail(ctx, S) { tline(ctx, S, [[0.4, 1], [0.3, 0.5], [0.6, 0.1]], '#e8f0ff', S.lw * 1.1, true); tline(ctx, S, [[-0.6, 0.9], [-0.5, 0.2]], '#e8f0ff', S.lw * 1.1, true); } },
      delt: { c: '#1a3470' }, uarm: { c: '#142a5a', bands: [{ a: 0.2, b: 0.8, c: '#1a3470', glow: '#e8f0ff', glowA: 0.8 }] }, farm: { c: '#142a5a', bands: [{ a: 0.1, b: 1, c: '#1a3470', pad: 0.004, metal: true, glow: '#e8f0ff', glowA: 0.8 }] }, hand: { c: '#1a3470' },
      thigh: { c: '#142a5a' }, shin: { c: '#142a5a', bands: [{ a: 0, b: 1, c: '#1a3470', pad: 0.005, metal: true, glow: '#e8f0ff' }] }, foot: { c: '#1a3470', boot: true },
    },
  });
  C.boreas = apostle({
    id: 'boreas', name: 'Boreas', ft: 7.0, seed: 323, skin: '#e8e0dc',
    b: RIG.build({ head: 0.12, neckR: 0.045, torso: 0.32, chest: 0.22, waist: 0.17, hips: 0.17, belly: 0.01, traps: 0.02, rDelt: 0.065, rUarm: [0.048, 0.05, 0.036], rFarm: [0.04, 0.042, 0.03], rThigh: [0.066, 0.062, 0.042], rShin: [0.043, 0.046, 0.03] }),
    face: { jaw: 1.2, nose: 1.3, brow: 1.4, eyeC: '#7ac8ff', eyeGlowC: '#bfe8ff', beard: 0.9, beardC: '#f2f2f4', browC: '#f2f2f4', browW: 2.8 },
    hair: { style: 'long', c: '#f2f2f4', c2: '#dedee4', len: 2.4, locks: 3, w0: 0.5, w1: 0.2 },
    costume: {
      torso: { c: '#9ab8d0', detail(ctx, S) { tpoly(ctx, S, [[-1, 1], [1, 1], [1, 0.3], [-1, 0.3]], '#a8c6de', { hi: 0.5 }); for (let i = 0; i < 8; i++) { const p = TP(S, hash(i) - 0.4, 0.3 + hash(i * 3) * 0.7); ctx.fillStyle = 'rgba(240,250,255,0.7)'; ctx.fillRect(p[0], p[1], 3, 3); } } },
      delt: { c: '#a8c6de', bands: [{ a: -0.1, b: 1, c: '#b4d0e6', pad: 0.01, metal: true }] },
      uarm: { c: '#9ab8d0' }, farm: { c: '#9ab8d0', bands: [{ a: 0, b: 1, c: '#a8c6de', pad: 0.006, metal: true }] }, hand: { c: '#8aa6be' },
      thigh: { c: '#9ab8d0' }, shin: { c: '#9ab8d0', bands: [{ a: 0, b: 1, c: '#a8c6de', pad: 0.007, metal: true }] }, foot: { c: '#8aa6be', boot: true },
    },
    hooks: {
      behind: cape('#f0f0f2', { len: 0.55, w0: 0.2, w1: 0.28, ragged: 0.02, fold: 3 }),
      front(ctx, S) {
        FX.field(ctx, S.t, { n: 12, x0: S.J.pelvis[0] - S.Hh * 0.5, x1: S.J.pelvis[0] + S.Hh * 0.5, y0: S.J.pelvis[1] - S.Hh * 0.9, y1: S.J.pelvis[1] + S.Hh * 0.3, vx: -60, vy: 10, size: 2, color: '#e8f6ff', kind: 'dot', alpha: 0.5, seed: 9 });
      },
    },
  });
  C.nyktos = apostle({
    id: 'nyktos', name: 'Nyktos', ft: 6.7, seed: 325, skin: '#0c0a10', line: '#000000',
    b: RIG.build({ head: 0.125, neckR: 0.026, torso: 0.31, chest: 0.14, waist: 0.1, hips: 0.12, rDelt: 0.036, rUarm: [0.026, 0.027, 0.02], rFarm: [0.022, 0.023, 0.016], rThigh: [0.045, 0.042, 0.027], rShin: [0.027, 0.03, 0.017] }),
    face: {
      noEar: true, noBlink: true, skinC: '#0a080c', scleraC: '#0a080c', eyeC: '#0a080c',
      extra(ctx, S, L) {
        ctx.fillStyle = '#b48aff';
        ctx.fillRect(0.24, -0.03, 0.08, 0.02);
        UW.FX.glow(ctx, 0.28, -0.02, 0.15, '#a878ff', 0.7);
      },
    },
    hair: { style: 'hood' },
    costume: {
      torso: { c: '#121016', detail(ctx, S) { for (let i = 0; i < 4; i++) tline(ctx, S, [[-1, 0.2 + i * 0.22], [1, 0.3 + i * 0.22]], 'rgba(0,0,0,0.6)', S.lw); } },
      delt: { c: '#16141a' }, uarm: { c: '#121016' }, farm: { c: '#121016' }, hand: { c: '#0c0a10' },
      thigh: { c: '#121016' }, shin: { c: '#121016' }, foot: { c: '#0c0a10', boot: true },
    },
    hooks: {
      headBack(ctx, S, L) {
        ctx.fillStyle = '#0e0c12';
        ctx.strokeStyle = S.line;
        ctx.lineWidth = L;
        ctx.beginPath();
        ctx.moveTo(0.46, -0.35);
        ctx.quadraticCurveTo(0.2, -0.78, -0.4, -0.6);
        ctx.quadraticCurveTo(-0.75, -0.2, -0.55, 0.55);
        ctx.lineTo(0.2, 0.62);
        ctx.quadraticCurveTo(0.55, 0.3, 0.46, -0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      },
      front(ctx, S) {
        // edges dissolving into shadow
        FX.voidShards(ctx, S.t, S.J.pelvis[0], S.J.pelvis[1] - S.Hh * 0.35, S.Hh * 0.45, 10, 5, 0.5);
      },
    },
  });

  /* ================= OTHER DESIGNS ================= */
  C.king = {
    id: 'king', name: 'King of Nine Burning Heavens', ft: 7.0, seed: 401, skin: '#e8c6a0', line: '#1a0c06',
    b: RIG.build({ head: 0.125, neckR: 0.03, torso: 0.31, chest: 0.17, waist: 0.13, hips: 0.14, belly: 0.008, rDelt: 0.05, rUarm: [0.034, 0.035, 0.025], rFarm: [0.029, 0.03, 0.021] }),
    face: { jaw: 1.05, nose: 1.15, brow: 1.1, eyeC: '#ffc020', eyeGlowC: '#ffe070', browC: '#c86a20', browW: 1.8 },
    hair: { style: 'long', c: '#d8702a', c2: '#e8a040', hl: '#ffd070', len: 2.6, locks: 4, w0: 0.46, w1: 0.2 },
    costume: {
      torso: {
        c: '#f4ece0',
        detail(ctx, S) {
          tpoly(ctx, S, [[-0.3, 1.0], [0.95, 0.96], [0.9, 0.35], [-0.2, 0.3]], '#e8b830', { hi: 0.6 });
          tpoly(ctx, S, [[0.1, 0.92], [0.8, 0.9], [0.75, 0.45], [0.15, 0.42]], '#f6d050', { hi: 0.5 });
          for (let i = 0; i < 5; i++) { const p = TP(S, 0.45, 0.5 + i * 0.09); ctx.fillStyle = '#c01a1a'; ctx.beginPath(); ctx.arc(p[0], p[1], S.lw * 1.5, 0, TAU); ctx.fill(); }
          tband(ctx, S, 0.0, 0.1, '#b01818', {});
          tline(ctx, S, [[-1, 0.05], [1, 0.05]], '#f6d050', S.lw);
        },
      },
      delt: { c: '#e8b830', bands: [{ a: -0.1, b: 1, c: '#f6d050', pad: 0.012, metal: true }] },
      uarm: { c: '#b01818', bands: [{ a: 0.4, b: 0.55, c: '#f6d050' }] },
      farm: { c: '#f4ece0', bands: [{ a: 0.3, b: 1, c: '#e8b830', pad: 0.006, metal: true }] },
      hand: { c: '#e8c6a0' },
      thigh: { c: '#b01818' }, shin: { c: '#f4ece0', bands: [{ a: 0.2, b: 1, c: '#e8b830', pad: 0.006, metal: true }] },
      foot: { c: '#e8b830', boot: true },
    },
    hooks: merge(robe({ c: '#b81c1c', len: 0.62, top: 0.1, w0: 0.16, w1: 0.34, trim: '#f6d050' }), {
      behind(ctx, S) {
        // crown of nine small suns floating behind the head
        const h = S.J.head;
        const r = S.Hh * 0.13;
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI + (i / 8) * Math.PI;
          const x = h[0] - S.Hh * 0.03 + Math.cos(a) * r, y = h[1] - S.Hh * 0.02 + Math.sin(a) * r * 1.1;
          FX.glow(ctx, x, y, S.Hh * 0.035, '#ffb020', 0.8);
          ctx.fillStyle = '#ffe070';
          ctx.strokeStyle = '#a05a10';
          ctx.lineWidth = S.lw * 0.6;
          ctx.beginPath();
          ctx.arc(x, y, S.Hh * 0.012, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      },
    }),
  };

  /* Celestial troopers of the Nine Burning Heavens */
  C.trooper = {
    id: 'trooper', name: 'Celestial Trooper', ft: 6.2, seed: 431, skin: '#d8b48a', line: '#1a0c06',
    b: RIG.build({ head: 0.125, rDelt: 0.045, rUarm: [0.032, 0.034, 0.024], rFarm: [0.028, 0.029, 0.02], rThigh: [0.052, 0.05, 0.032], rShin: [0.031, 0.034, 0.02] }),
    face: { noEar: true, extra: visor('#3a1a08', '#ffcf6a') },
    hair: { style: 'short', c: '#e8b830', hl: '#fff0a0', vol: 0.9 },
    hold: { F: { type: 'rifle', abs: 80 } },
    costume: {
      torso: { c: '#f2e6c8', detail(ctx, S) { tpoly(ctx, S, [[0.0, 0.96], [0.9, 0.92], [0.85, 0.5], [0.05, 0.46]], '#e8b830', { hi: 0.5 }); tband(ctx, S, 0.0, 0.08, '#b01818', {}); } },
      delt: { c: '#e8b830' }, uarm: { c: '#f2e6c8' }, farm: { c: '#f2e6c8', bands: [{ a: 0.4, b: 1, c: '#e8b830', pad: 0.004, metal: true }] }, hand: { c: '#b8964a' },
      thigh: { c: '#b01818' }, shin: { c: '#f2e6c8', bands: [{ a: 0.3, b: 1, c: '#e8b830', pad: 0.004, metal: true }] }, foot: { c: '#e8b830', boot: true },
    },
  };

  C.futureAlly = {
    id: 'futureAlly', name: 'Extinct-Future Soldier', ft: 7.2, seed: 411, skin: '#e6ecf2', line: '#10141a', shadeAmt: 0.2,
    b: RIG.build({ head: 0.115, neckR: 0.022, neckLen: 0.045, torso: 0.31, chest: 0.12, waist: 0.085, hips: 0.1, rDelt: 0.03, uarm: 0.185, farm: 0.165, thigh: 0.26, shin: 0.24, rUarm: [0.021, 0.022, 0.016], rFarm: [0.018, 0.019, 0.014], rThigh: [0.036, 0.034, 0.022], rShin: [0.022, 0.024, 0.014] }),
    face: { noEar: true, extra: visor('#08090c', '#8ad8ff') },
    hair: { style: 'bald' },
    costume: {
      torso: {
        c: '#eef2f6',
        detail(ctx, S) {
          // fractures and moving projections of possible futures
          tline(ctx, S, [[-0.5, 0.9], [0.1, 0.6], [-0.2, 0.3]], '#6a7a8a', S.lw * 0.8);
          tline(ctx, S, [[0.5, 0.95], [0.3, 0.7]], '#6a7a8a', S.lw * 0.8);
          for (let i = 0; i < 3; i++) {
            const k = (S.t * 0.4 + i / 3) % 1;
            const p = TP(S, -0.4 + i * 0.4, 0.2 + k * 0.7);
            ctx.fillStyle = rgba(['#8ad8ff', '#ffd08a', '#b08aff'][i], 0.6 * Math.sin(Math.PI * k));
            ctx.fillRect(p[0] - S.Hh * 0.02, p[1] - S.Hh * 0.01, S.Hh * 0.04, S.Hh * 0.02);
          }
        },
      },
      delt: { c: '#eef2f6' }, uarm: { c: '#dde3ea' }, farm: { c: '#eef2f6' }, hand: { c: '#c8d0da' },
      thigh: { c: '#dde3ea' }, shin: { c: '#eef2f6' }, foot: { c: '#c8d0da', boot: true },
    },
  };

  C.collapsedAlly = {
    id: 'collapsedAlly', name: 'Collapsed-Universe Knight', ft: 12, seed: 421, skin: '#0c0c12', line: '#000000', shadeAmt: 0.3,
    b: RIG.build({ head: 0.1, neckR: 0.045, torso: 0.32, chest: 0.22, waist: 0.16, hips: 0.16, traps: 0.03, rDelt: 0.07, rUarm: [0.052, 0.055, 0.042], rFarm: [0.046, 0.048, 0.038], rHand: 0.034, rThigh: [0.07, 0.066, 0.05], rShin: [0.05, 0.053, 0.04] }),
    face: {
      noEar: true, noBlink: true, skinC: '#16161e', jaw: 1.3, nose: 0.4, lips: 0.5, scleraC: '#000', eyeC: '#000',
      extra(ctx, S, L) {
        // angular skull helm, no mouth
        ctx.strokeStyle = 'rgba(140,150,200,0.5)';
        ctx.lineWidth = L * 0.8;
        ctx.beginPath();
        ctx.moveTo(0.44, -0.3);
        ctx.lineTo(0.2, 0.0);
        ctx.lineTo(0.42, 0.28);
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0.18, -0.08);
        ctx.lineTo(0.38, -0.1);
        ctx.lineTo(0.33, 0.04);
        ctx.closePath();
        ctx.fill();
      },
    },
    hair: { style: 'bald' },
    costume: {
      torso: { c: '#101018', detail(ctx, S) { for (let i = 0; i < 7; i++) { const p = TP(S, (hash(i * 3) - 0.4) * 1.2, 0.15 + hash(i * 7) * 0.8); universe(ctx, S, p[0], p[1], S.Hh * 0.014, i); } } },
      delt: { c: '#16161e' }, uarm: { c: '#101018' }, farm: { c: '#16161e' }, hand: { c: '#101018' },
      thigh: { c: '#101018' }, shin: { c: '#16161e' }, foot: { c: '#101018', boot: true },
    },
    hooks: {
      arm(ctx, S, side, up, fo) {
        universe(ctx, S, lerp(up.a[0], up.b[0], 0.5), lerp(up.a[1], up.b[1], 0.5), S.Hh * 0.012, side === 'F' ? 11 : 12);
        universe(ctx, S, lerp(fo.a[0], fo.b[0], 0.6), lerp(fo.a[1], fo.b[1], 0.6), S.Hh * 0.012, side === 'F' ? 13 : 14);
      },
    },
  };
  function universe(ctx, S, x, y, r, i) {
    ctx.save();
    ctx.fillStyle = '#05050a';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    FX.glow(ctx, x, y, r * 2.2, ['#8a9aff', '#ffb0d8', '#9affe8'][i % 3], 0.6);
    ctx.strokeStyle = rgba('#ffffff', 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.7, r * 0.25, S.t * 0.5 + i, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  C.universe = universe;
})();
