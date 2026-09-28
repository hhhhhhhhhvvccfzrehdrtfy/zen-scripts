/* The Unmaker War — front-facing close-up portraits for emotional beats. */
(function () {
  'use strict';
  const UW = window.UW;
  const { TAU, lerp, sat, hash, noise, mix, shade, rgba } = UW;
  const FX = UW.FX;
  const PORT = (UW.PORT = { P: {} });

  /* ---------- per-character portrait params ---------- */
  const P = PORT.P;
  P.chase = {
    skin: '#6b4330', line: '#120c0a', jaw: 1.28, chin: 1.12, faceW: 1.06, nose: 1.25, noseW: 1.3, lips: 1.0, brow: 1.5, browC: '#120e0c',
    eyeC: '#2a180e', eyeGlowC: '#d6ecff', stubble: 0.7, neckW: 1.55, tired: 0.5,
    hair: { style: 'messy', c: '#131113', hl: '#34303a' },
    body: { c: '#1d1e24', trim: '#7c828b', plate: '#7f858e', collar: true },
  };
  P.maeve = {
    skin: '#efe5ea', line: '#1a0f16', fem: 1, jaw: 0.82, chin: 0.9, faceW: 0.92, nose: 0.8, noseW: 0.8, lips: 1.12, lipC: '#5e1424',
    brow: 0.7, browC: '#c9c2c2', eyeC: '#a10d1e', eyeGlowC: '#ff2438', lashes: true, fangs: true, neckW: 0.85,
    hair: { style: 'long', c: '#f3f0ec', hl: '#ffffff', sh: '#d2ccc8', len: 1.9, part: 0.08 },
    veil: '#0a070b', comb: true,
    body: { c: '#141016', trim: '#b9bcc6', choker: '#9c0f22', skinTop: true },
  };
  P.malevolor = {
    skin: '#5a463d', line: '#0c0808', jaw: 1.3, chin: 1.15, faceW: 1.06, nose: 1.25, noseW: 1.25, lips: 0.95, brow: 1.6, browC: '#0c0a0c',
    eyeC: '#b00c16', scleraC: '#1a1111', eyeGlowC: '#ff1818', stubble: 0.35, neckW: 1.55, scars: 4, deadlights: true,
    hair: { style: 'long', c: '#0f0d10', hl: '#2c2830', sh: '#070608', len: 1.1, rough: true, strands: 4, part: -0.05 },
    body: { c: '#131116', trim: '#1d1a21', cracks: '#e0101c', plate: '#1d1a21', spikes: true },
  };
  P.jack = {
    skin: '#efc6a2', line: '#0e1020', jaw: 1.15, chin: 1.12, faceW: 0.98, nose: 0.95, noseW: 0.95, lips: 1.0, brow: 1.0, browC: '#a8862a',
    eyeC: '#2f86ff', neckW: 1.0, mask: '#1846b8',
    hair: { style: 'quiff', c: '#f0c948', hl: '#fff1a6', sh: '#c89a2a' },
    body: { c: '#1f5fe6', trim: '#ffd21a', cape: '#ffd21a', emblem: true },
  };
  P.valorion = {
    skin: '#7b4fc9', line: '#140a26', jaw: 1.02, chin: 1.0, faceW: 0.96, nose: 0.85, noseW: 0.85, lips: 0.95, brow: 0.8, browC: '#3a1a6a',
    eyeC: '#f5eeff', scleraC: '#f5eeff', noPupil: true, eyeGlowC: '#e7d8ff', glowEyes: 0.9, neckW: 1.0,
    hair: { style: 'swept', c: '#3a1a6a', hl: '#6a3ab0', sh: '#24104a', energy: '#c9a2ff' },
    body: { c: '#f2eefb', trim: '#9a6aff', plate: '#ffffff', glowLines: '#d6beff' },
  };
  P.valor = {
    skin: '#704634', line: '#0d0b12', jaw: 1.25, chin: 1.1, faceW: 1.02, nose: 1.15, noseW: 1.2, brow: 1.3, browC: '#121014',
    eyeC: '#2aa8ff', eyeGlowC: '#8fd8ff', neckW: 1.3,
    hair: { style: 'swept', c: '#121114', hl: '#34303a', sh: '#070608' },
    body: { c: '#141c33', trim: '#2fb4ff', plate: '#9aa3b4' },
  };
  P.seraphina = {
    skin: '#f3dfcd', line: '#2a1c12', fem: 1, jaw: 0.86, chin: 0.92, faceW: 0.94, nose: 0.85, noseW: 0.85, lips: 1.08, lipC: '#c46a6a',
    brow: 0.7, browC: '#b89a50', eyeC: '#e8b21e', eyeGlowC: '#fff0b0', lashes: true, neckW: 0.85, circlet: '#e0bb4e',
    hair: { style: 'long', c: '#f0dc9a', hl: '#fff6d0', sh: '#d4bc76', len: 1.8, part: 0.0 },
    body: { c: '#f5f1e6', trim: '#d4b050', wings: true },
  };
  P.ashira = {
    skin: '#8f5d42', line: '#1a100c', child: 1, jaw: 0.75, chin: 0.8, faceW: 1.05, nose: 0.7, noseW: 0.9, lips: 1.05, brow: 0.8, browC: '#1a110c',
    eyeC: '#4a2a14', eyeScale: 1.35, neckW: 0.8,
    hair: { style: 'curly', c: '#1a110c', hl: '#3a2618', sh: '#0e0806', len: 1.4 },
    body: { c: '#f4efe2', trim: '#e0bb4e' },
  };
  P.lena = {
    skin: '#8a5a3e', line: '#120c0a', child: 1, jaw: 0.8, chin: 0.85, faceW: 1.0, nose: 0.75, noseW: 0.9, brow: 0.8, browC: '#1c120c',
    eyeC: '#8a7a3a', eyeScale: 1.25, neckW: 0.8,
    hair: { style: 'curly', c: '#1c120c', hl: '#3a2618', sh: '#0e0806', len: 1.0 },
    body: { c: '#6e6e72', trim: '#4a4a4e', coat: true },
  };
  P.kael = {
    skin: '#c08a62', line: '#120c0a', jaw: 1.1, chin: 1.05, faceW: 0.98, nose: 1.05, noseW: 1.05, brow: 1.2, browC: '#0f0d0e',
    eyeC: '#e0901a', eyeGlowC: '#ff4a20', fangs: true, neckW: 1.1,
    hair: { style: 'wild', c: '#0f0d0e', hl: '#2c2830', sh: '#060506' },
    body: { c: '#3a1010', trim: '#1a0808', jacket: true },
  };
  P.atterea = {
    skin: '#f8e6d8', line: '#2a1a2a', fem: 1, jaw: 0.85, chin: 0.9, faceW: 0.93, nose: 0.85, noseW: 0.85, lips: 1.08, lipC: '#d27a82',
    brow: 0.7, browC: '#c8a860', eyeC: '#4bd67a', eyeGlowC: '#9dffb8', lashes: true, neckW: 0.85,
    hair: { style: 'long', c: '#f2d27a', hl: '#fff0b8', sh: '#d4b060', len: 1.7, wavy: true, part: 0.1 },
    body: { c: '#b89ae6', trim: '#e6c054' },
  };
  P.draven = {
    skin: '#b0826a', line: '#120a0c', jaw: 1.12, chin: 1.05, faceW: 0.98, nose: 1.05, noseW: 1.05, brow: 1.2, browC: '#0e0c0f',
    eyeC: '#8c0e1c', eyeGlowC: '#ff3a4a', fangs: true, neckW: 1.1,
    hair: { style: 'wild', c: '#0e0c0f', hl: '#2a2530', sh: '#060506' },
    body: { c: '#141014', trim: '#b0101f' },
  };
  P.jackson = {
    skin: '#101012', line: '#050505', jaw: 1.15, chin: 1.05, faceW: 1.08, nose: 0.9, noseW: 1.0, brow: 1.0, browC: '#101012',
    maskJ: true, neckW: 1.5,
    hair: { style: 'none' },
    body: { c: '#0e0e10', trim: '#1a1a1c', coat: true },
  };
  P.cyrus = {
    skin: '#c8b8a8', line: '#0a0808', jaw: 0.92, chin: 1.0, faceW: 0.88, long: 0.12, nose: 1.1, noseW: 0.9, brow: 1.0, browC: '#141216',
    eyeC: '#bfe6ff', scleraC: '#e8f6ff', eyeGlowC: '#dff4ff', glowEyes: 0.7, neckW: 0.9, gaunt: 1,
    hair: { style: 'slick', c: '#141216', hl: '#34303a', sh: '#08070a' },
    body: { c: '#2e2e32', trim: '#9fdcff', coat: true },
  };
  P.ezara = {
    skin: '#3a2a26', line: '#0a0808', fem: 1, jaw: 0.82, chin: 0.9, faceW: 0.88, nose: 0.9, noseW: 0.9, lips: 1.05, lipC: '#5a3a36',
    brow: 0.6, browC: '#c8ccd6', eyeC: '#e8ecf6', scleraC: '#e8ecf6', noPupil: true, eyeGlowC: '#ffffff', glowEyes: 0.6, lashes: true, neckW: 0.8,
    hair: { style: 'long', c: '#d6dae6', hl: '#ffffff', sh: '#aeb4c4', len: 2.2, float: true, part: 0 },
    body: { c: '#c8cede', trim: '#e8ecff' },
  };
  P.king = {
    skin: '#e8c6a0', line: '#1a0c06', jaw: 1.05, chin: 1.05, faceW: 1.0, nose: 1.15, noseW: 1.05, brow: 1.0, browC: '#c86a20',
    eyeC: '#ffc020', eyeGlowC: '#ffe070', neckW: 1.0, crown: true,
    hair: { style: 'long', c: '#d8702a', hl: '#ffd070', sh: '#a04a18', len: 1.3, part: 0 },
    body: { c: '#e8b830', trim: '#b01818', plate: '#f6d050' },
  };
  P.tyrus = {
    skin: '#c49474', line: '#120c0a', jaw: 1.45, chin: 1.2, faceW: 1.1, nose: 1.15, noseW: 1.2, brow: 1.4, browC: '#2a1a10',
    eyeC: '#4a2a14', neckW: 1.7,
    hair: { style: 'short', c: '#3a2416', hl: '#5a3a22', sh: '#1e120a' },
    body: { c: '#3a3c40', trim: '#222326', skinArms: true },
  };
  P.aphrodite = {
    skin: '#a8744e', line: '#1a0c0c', fem: 1, jaw: 0.85, chin: 0.92, faceW: 0.93, nose: 0.9, noseW: 0.9, lips: 1.15, lipC: '#8a2a30',
    brow: 0.75, browC: '#3a1a10', eyeC: '#b8862a', eyeGlowC: '#ffd27a', lashes: true, neckW: 0.85,
    hair: { style: 'long', c: '#5a2414', hl: '#8a3a20', sh: '#3a140a', len: 2.0, wavy: true, part: 0.12 },
    body: { c: '#5a0e1e', trim: '#e6c054', necklace: '#e6c054' },
  };
  P.nyx = {
    skin: '#d6b89a', line: '#0c0a10', fem: 1, jaw: 0.86, chin: 0.9, faceW: 0.92, nose: 0.85, noseW: 0.85, lips: 1.02, lipC: '#6a4a52',
    brow: 0.75, browC: '#0c0a0e', eyeC: '#8a7fa6', lashes: true, liner: true, neckW: 0.85,
    hair: { style: 'long', c: '#0c0a0e', hl: '#2a2430', sh: '#050407', len: 1.25, streak: '#4a1a6a', part: -0.1, rough: true },
    body: { c: '#121014', trim: '#9a9aa6' },
  };
  P.axion = {
    skin: '#8a5a3e', line: '#070a0e', jaw: 1.05, chin: 1.0, faceW: 0.98, nose: 1.0, noseW: 1.05, brow: 1.1, browC: '#101014',
    eyeC: '#2a1a10', neckW: 1.1,
    hair: { style: 'short', c: '#101014', hl: '#2a2a32', sh: '#050507' },
    body: { c: '#1c1f24', trim: '#55e6ff', plate: '#24282f' },
  };

  /* ---------- geometry ---------- */
  function facePts(p) {
    const j = p.jaw || 1, c = p.chin || 1, w = p.faceW || 1, fem = p.fem || 0, ch = p.child || 0, lg = p.long || 0;
    const pts = [
      [0, -0.56 - lg * 0.05],
      [0.26 * w, -0.5],
      [0.37 * w, -0.3],
      [0.38 * w + ch * 0.03, -0.08],
      [0.36 * w + ch * 0.04, 0.08],
      [(0.31 + 0.02 * (j - 1)) * w + ch * 0.03, 0.29 + lg * 0.05 - fem * 0.02],
      [(0.13 + 0.06 * (c - 1)) * w, 0.47 + lg * 0.08 - ch * 0.04],
      [0, 0.52 + lg * 0.1 - ch * 0.05 - fem * 0.01],
    ];
    const full = pts.slice();
    for (let i = pts.length - 2; i >= 1; i--) full.push([-pts[i][0], pts[i][1]]);
    return full;
  }

  function cel(ctx, path, base, shadeC, lx, line, lw) {
    ctx.beginPath();
    path(ctx);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = shadeC;
    ctx.fillRect(-10, -10, 20, 20);
    ctx.translate(lx, -Math.abs(lx) * 0.4);
    ctx.beginPath();
    path(ctx);
    ctx.fillStyle = base;
    ctx.fill();
    ctx.restore();
    if (line) {
      ctx.beginPath();
      path(ctx);
      ctx.strokeStyle = line;
      ctx.lineWidth = lw;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }

  /* ---------- hair (front view) ---------- */
  function hairBack(ctx, p, st, L) {
    const h = p.hair || {};
    if (!h.style || h.style === 'none' || h.style === 'bald') return;
    const t = st.t || 0;
    const c = h.c;
    if (h.style === 'long') {
      const len = h.len || 1.5;
      const sway = Math.sin(t * 0.8) * 0.02;
      const fl = h.float ? 1 : 0;
      if (fl) {
        // hair floating regardless of gravity: many slow strands drifting upward and outward
        ctx.lineCap = 'round';
        for (let i = 0; i < 26; i++) {
          const s = i % 2 ? 1 : -1;
          const k = hash(i * 3.7);
          const x0 = s * (0.18 + k * 0.2), y0 = -0.45 + hash(i) * 0.3;
          const ph = t * 0.7 + i;
          ctx.strokeStyle = i % 3 ? c : (h.sh || shade(c, -0.2));
          ctx.lineWidth = 0.05 + hash(i * 2) * 0.04;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.bezierCurveTo(x0 + s * (0.3 + k * 0.3), y0 - 0.3 + Math.sin(ph) * 0.06, x0 + s * (0.5 + k * 0.4) + Math.sin(ph * 0.8) * 0.08, y0 - 0.55 - k * 0.3, x0 + s * (0.8 + k * 0.5), y0 - 0.45 - k * 0.5 + Math.sin(ph) * 0.1);
          ctx.stroke();
        }
      } else {
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * 0.34, -0.42);
          ctx.bezierCurveTo(s * 0.56, -0.2, s * (0.52 + sway), 0.4, s * (0.6 + sway), 0.3 + len * 0.6);
          ctx.lineTo(s * (0.34 + sway), 0.25 + len * 0.62);
          ctx.quadraticCurveTo(s * 0.3, 0.3, s * 0.3, -0.1);
          ctx.closePath();
          ctx.fillStyle = h.sh || shade(c, -0.25);
          ctx.fill();
          ctx.strokeStyle = p.line;
          ctx.lineWidth = L;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.ellipse(0, -0.12, 0.47, 0.5, 0, Math.PI, TAU);
      ctx.fillStyle = h.sh || shade(c, -0.25);
      ctx.fill();
    } else if (h.style === 'curly') {
      const len = h.len || 1.2;
      for (let i = 0; i < 26; i++) {
        const a = Math.PI * 0.95 + (i / 25) * Math.PI * 1.1;
        const r = 0.5 + hash(i) * 0.08;
        const x = Math.cos(a) * r, y = -0.1 + Math.sin(a) * r * 1.05;
        ctx.fillStyle = i % 2 ? c : h.sh || shade(c, -0.2);
        ctx.beginPath();
        ctx.arc(x, y, 0.12 + hash(i * 3) * 0.05, 0, TAU);
        ctx.fill();
      }
      for (const s of [-1, 1]) {
        for (let i = 0; i < 6; i++) {
          const y = -0.05 + i * 0.12 * len;
          ctx.fillStyle = i % 2 ? c : h.sh || shade(c, -0.2);
          ctx.beginPath();
          ctx.arc(s * (0.44 + Math.sin(i + t) * 0.02), y, 0.12, 0, TAU);
          ctx.fill();
        }
      }
    } else if (h.style === 'wild' || h.style === 'messy') {
      ctx.beginPath();
      const n = 16;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI + (i / n) * Math.PI;
        const r = (i % 2 ? 0.5 : 0.6) + (h.style === 'wild' ? 0.05 : 0);
        const x = Math.cos(a) * r, y = -0.14 + Math.sin(a) * r * 1.02;
        if (i === 0) ctx.moveTo(x, y + 0.2); else ctx.lineTo(x, y);
      }
      ctx.lineTo(0.5, 0.1);
      ctx.lineTo(-0.5, 0.1);
      ctx.closePath();
      ctx.fillStyle = h.sh || shade(c, -0.25);
      ctx.fill();
    }
  }

  function hairFront(ctx, p, st, L) {
    const h = p.hair || {};
    if (!h.style || h.style === 'none') return;
    const t = st.t || 0;
    const c = h.c, hl = h.hl || shade(c, 0.25), sh = h.sh || shade(c, -0.25);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const drawShape = (pts, fill, tension) => {
      ctx.beginPath();
      UW.spline(ctx, pts, true, tension == null ? 0.5 : tension);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L;
      ctx.stroke();
    };
    const strands = (lines, col, w) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = L * (w || 0.8);
      for (const ln of lines) {
        ctx.beginPath();
        ctx.moveTo(ln[0][0], ln[0][1]);
        ctx.quadraticCurveTo(ln[1][0], ln[1][1], ln[2][0], ln[2][1]);
        ctx.stroke();
      }
    };
    if (h.style === 'bald') {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.ellipse(-0.08, -0.42, 0.14, 0.06, -0.3, 0, TAU);
      ctx.fill();
      return;
    }
    if (h.style === 'messy') {
      drawShape([[-0.4, -0.12], [-0.46, -0.42], [-0.3, -0.62], [-0.1, -0.66], [0.12, -0.68], [0.32, -0.6], [0.46, -0.42], [0.4, -0.12], [0.34, -0.3], [0.22, -0.26], [0.2, -0.4], [0.06, -0.3], [-0.04, -0.4], [-0.12, -0.28], [-0.24, -0.38], [-0.3, -0.26]], c, 0.35);
      strands([[[-0.3, -0.55], [-0.15, -0.5], [-0.05, -0.36]], [[0.1, -0.6], [0.2, -0.5], [0.24, -0.32]], [[0.3, -0.52], [0.38, -0.4], [0.36, -0.22]]], hl);
      // loose strands falling forward
      strands([[[0.05, -0.36], [0.1, -0.22], [0.02, -0.1]], [[-0.1, -0.34], [-0.14, -0.2], [-0.08, -0.08]]], c, 1.4);
    } else if (h.style === 'quiff') {
      const bob = Math.sin(t * 2) * 0.005;
      drawShape([[-0.4, -0.16], [-0.44, -0.44], [-0.3, -0.66], [-0.05, -0.8 + bob], [0.2, -0.9 + bob], [0.44, -0.8 + bob], [0.5, -0.6], [0.4, -0.44], [0.42, -0.2], [0.3, -0.36], [0.1, -0.4], [-0.12, -0.36], [-0.3, -0.3]], c, 0.5);
      strands([[[-0.3, -0.5], [-0.05, -0.8], [0.3, -0.84]], [[-0.2, -0.4], [0.05, -0.66], [0.42, -0.72]], [[-0.05, -0.38], [0.2, -0.56], [0.46, -0.6]]], hl, 1.2);
      // the curl
      ctx.strokeStyle = c;
      ctx.lineWidth = L * 3.5;
      ctx.beginPath();
      ctx.moveTo(0.08, -0.42);
      ctx.bezierCurveTo(0.14, -0.3, 0.02, -0.22, -0.02, -0.28);
      ctx.bezierCurveTo(-0.05, -0.33, 0.02, -0.36, 0.05, -0.31);
      ctx.stroke();
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L * 0.8;
      ctx.stroke();
    } else if (h.style === 'swept' || h.style === 'slick') {
      drawShape([[-0.4, -0.12], [-0.46, -0.44], [-0.28, -0.64], [0.0, -0.7], [0.28, -0.64], [0.46, -0.44], [0.4, -0.12], [0.34, -0.36], [0.12, -0.46], [-0.12, -0.46], [-0.34, -0.36]], c, 0.6);
      strands([[[-0.3, -0.42], [-0.2, -0.6], [0.0, -0.66]], [[-0.1, -0.46], [0.0, -0.62], [0.2, -0.64]], [[0.14, -0.46], [0.24, -0.58], [0.38, -0.54]]], hl, 1);
      if (h.energy) {
        for (let i = 0; i < 6; i++) {
          const a = Math.PI * 1.1 + i * 0.16;
          const x = Math.cos(a) * 0.55, y = -0.2 + Math.sin(a) * 0.6;
          FX.glow(ctx, x, y + Math.sin(t * 2 + i) * 0.02, 0.1, h.energy, 0.6);
        }
      }
    } else if (h.style === 'short') {
      drawShape([[-0.39, -0.16], [-0.43, -0.44], [-0.26, -0.62], [0.0, -0.66], [0.26, -0.62], [0.43, -0.44], [0.39, -0.16], [0.33, -0.36], [0.0, -0.44], [-0.33, -0.36]], c, 0.6);
    } else if (h.style === 'wild') {
      drawShape([[-0.42, -0.1], [-0.52, -0.3], [-0.4, -0.4], [-0.5, -0.56], [-0.3, -0.6], [-0.26, -0.76], [-0.06, -0.66], [0.1, -0.8], [0.2, -0.64], [0.42, -0.68], [0.4, -0.5], [0.54, -0.4], [0.42, -0.3], [0.46, -0.1], [0.3, -0.3], [0.16, -0.22], [0.08, -0.36], [-0.04, -0.2], [-0.14, -0.34], [-0.26, -0.2], [-0.32, -0.34]], c, 0.3);
      strands([[[-0.3, -0.5], [-0.2, -0.4], [-0.16, -0.26]], [[0.2, -0.56], [0.24, -0.4], [0.2, -0.26]]], hl);
    } else if (h.style === 'long') {
      const part = h.part || 0;
      const sway = Math.sin(t * 0.8) * 0.01;
      drawShape([[-0.42, 0.2], [-0.46, -0.3], [-0.3, -0.6], [part, -0.66], [0.3, -0.6], [0.46, -0.3], [0.42, 0.2], [0.34, -0.1], [0.3, -0.36], [part + 0.04, -0.5], [-0.3, -0.36], [-0.34, -0.1]], c, 0.55);
      // framing locks falling past the face
      for (const s of [-1, 1]) {
        drawShape([[s * 0.3, -0.36], [s * (0.44 + sway), 0.1], [s * (0.46 + sway), 0.55 + (h.len || 1) * 0.35], [s * (0.36 + sway), 0.5 + (h.len || 1) * 0.3], [s * 0.34, 0.1]], s > 0 ? c : shade(c, -0.08), 0.6);
      }
      strands([[[part, -0.62], [-0.2, -0.5], [-0.34, -0.2]], [[part, -0.62], [0.2, -0.5], [0.34, -0.2]], [[-0.36, -0.1], [-0.4, 0.2], [-0.4, 0.5]], [[0.36, -0.1], [0.4, 0.2], [0.4, 0.5]]], hl);
      if (h.streak) strands([[[0.2, -0.58], [0.34, -0.3], [0.4, 0.3]]], h.streak, 3);
      if (h.rough || h.strands) {
        const n = h.strands || 2;
        for (let i = 0; i < n; i++) {
          const x0 = -0.2 + i * 0.13;
          strands([[[x0, -0.5], [x0 + 0.03 + Math.sin(t + i) * 0.01, -0.2], [x0 - 0.02, 0.05 + hash(i) * 0.12]]], c, 1.6);
        }
      }
    } else if (h.style === 'curly') {
      for (let i = 0; i < 9; i++) {
        const x = -0.34 + i * 0.085, y = -0.52 + Math.abs(i - 4) * 0.035 + (i % 2) * 0.03;
        ctx.fillStyle = i % 2 ? c : shade(c, 0.08);
        ctx.beginPath();
        ctx.arc(x, y, 0.1, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = p.line;
        ctx.lineWidth = L * 0.7;
        ctx.stroke();
      }
    }
  }

  /* ---------- bust / costume ---------- */
  function bust(ctx, p, st, L) {
    const b = p.body || {};
    const nw = 0.15 * (p.neckW || 1);
    const t = st.t || 0;
    const dm = st.dmg || {};
    const missingL = dm.armL; // Chase's left arm (viewer's right in front view)
    // shoulders
    const sw = p.child ? 0.62 : p.fem ? 0.7 : 0.95 + (p.neckW || 1) * 0.08;
    const path = (c) => {
      c.moveTo(-nw, 0.38);
      c.lineTo(-nw * 1.05, 0.62);
      c.quadraticCurveTo(-sw * 0.6, 0.66, -sw, missingL ? 0.9 : 0.86);
      c.lineTo(-sw * 1.15, 1.6);
      c.lineTo(missingL ? sw * 0.8 : sw * 1.15, 1.6);
      if (missingL) {
        c.lineTo(sw * 0.72, 1.0);
        c.quadraticCurveTo(sw * 0.7, 0.72, sw * 0.5, 0.66);
      } else c.lineTo(sw, 0.86);
      c.quadraticCurveTo(sw * 0.6, 0.66, nw * 1.05, 0.62);
      c.lineTo(nw, 0.38);
      c.closePath();
    };
    if (b.wings) {
      for (const s of [-1, 1]) {
        for (let i = 0; i < 7; i++) {
          const x = s * (sw * 0.9 + i * 0.12), y = 0.3 - i * 0.12 + Math.sin(t * 1.2) * 0.02;
          ctx.fillStyle = i < 2 ? '#e8d08a' : '#f6f3ee';
          ctx.strokeStyle = p.line;
          ctx.lineWidth = L * 0.7;
          ctx.beginPath();
          ctx.ellipse(x, y, 0.06, 0.26, s * 0.5, 0, TAU);
          ctx.fill();
          ctx.stroke();
          if (dm.wingBurn && hash(i + s * 7) < dm.wingBurn) {
            ctx.fillStyle = 'rgba(20,12,8,0.85)';
            ctx.beginPath();
            ctx.ellipse(x, y + 0.12, 0.05, 0.12, s * 0.5, 0, TAU);
            ctx.fill();
          }
        }
      }
    }
    if (b.cape) {
      ctx.fillStyle = shade(b.cape, -0.15);
      ctx.beginPath();
      ctx.moveTo(-sw * 1.1, 0.9);
      ctx.lineTo(-sw * 1.25, 1.6);
      ctx.lineTo(sw * 1.25, 1.6);
      ctx.lineTo(sw * 1.1, 0.9);
      ctx.closePath();
      ctx.fill();
    }
    // neck
    cel(ctx, (c) => { c.moveTo(-nw, 0.2); c.lineTo(-nw * 1.08, 0.7); c.lineTo(nw * 1.08, 0.7); c.lineTo(nw, 0.2); c.closePath(); }, p.skin, shade(p.skin, -0.28), -0.03, p.line, L);
    // clothing / armor
    const top = b.skinTop ? p.skin : b.c;
    cel(ctx, path, top, shade(top, -0.3), -0.05, p.line, L);
    if (b.skinTop) {
      // bodice below the collarbones
      ctx.save();
      ctx.beginPath();
      path(ctx);
      ctx.clip();
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.moveTo(-2, 1.0);
      ctx.quadraticCurveTo(0, 0.86, 2, 1.0);
      ctx.lineTo(2, 2);
      ctx.lineTo(-2, 2);
      ctx.fill();
      ctx.strokeStyle = b.trim;
      ctx.lineWidth = L * 1.4;
      ctx.beginPath();
      ctx.moveTo(-2, 1.0);
      ctx.quadraticCurveTo(0, 0.86, 2, 1.0);
      ctx.stroke();
      ctx.restore();
    }
    if (b.choker) {
      ctx.fillStyle = '#0e0a0e';
      ctx.fillRect(-nw * 1.05, 0.46, nw * 2.1, 0.05);
      ctx.fillStyle = b.choker;
      ctx.beginPath();
      ctx.arc(0, 0.53, 0.025, 0, TAU);
      ctx.fill();
    }
    if (b.necklace) {
      ctx.strokeStyle = b.necklace;
      ctx.lineWidth = L * 1.6;
      ctx.beginPath();
      ctx.moveTo(-nw * 1.1, 0.55);
      ctx.quadraticCurveTo(0, 0.78, nw * 1.1, 0.55);
      ctx.stroke();
    }
    if (b.collar || b.coat || b.jacket) {
      ctx.fillStyle = shade(b.c, b.coat ? -0.1 : 0.1);
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * nw * 1.1, 0.45);
        ctx.lineTo(s * nw * 2.3, 0.6);
        ctx.lineTo(s * nw * 1.4, 1.2);
        ctx.lineTo(s * nw * 0.9, 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    if (b.plate) {
      for (const s of [-1, 1]) {
        if (s > 0 && missingL) continue;
        ctx.fillStyle = b.plate;
        ctx.strokeStyle = p.line;
        ctx.lineWidth = L;
        ctx.beginPath();
        ctx.moveTo(s * sw * 0.55, 0.72);
        ctx.quadraticCurveTo(s * sw * 1.0, 0.62, s * sw * 1.12, 0.95);
        ctx.lineTo(s * sw * 0.9, 1.05);
        ctx.quadraticCurveTo(s * sw * 0.8, 0.82, s * sw * 0.5, 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (b.spikes) {
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const x = s * sw * (0.7 + i * 0.12);
            ctx.moveTo(x - 0.03, 0.72 - i * 0.02);
            ctx.lineTo(x + s * 0.04, 0.5 - i * 0.04);
            ctx.lineTo(x + 0.03, 0.72 - i * 0.02);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    }
    if (b.cracks) {
      ctx.save();
      ctx.beginPath();
      path(ctx);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 8; i++) {
        let x = (hash(i * 3.1) - 0.5) * sw * 1.8, y = 0.8 + hash(i * 1.7) * 0.7;
        ctx.strokeStyle = rgba(b.cracks, 0.5 + 0.4 * Math.sin(t * 2 + i));
        ctx.lineWidth = L * 1.1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          x += (hash(i * 7 + k) - 0.5) * 0.14;
          y += (hash(i * 5 + k) - 0.3) * 0.1;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    if (b.glowLines) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(b.glowLines, 0.9);
      ctx.lineWidth = L * 1.1;
      ctx.beginPath();
      ctx.moveTo(-sw * 0.8, 1.2);
      ctx.lineTo(-nw * 1.2, 0.9);
      ctx.lineTo(nw * 1.2, 0.9);
      ctx.lineTo(sw * 0.8, 1.2);
      ctx.stroke();
      ctx.restore();
    }
    if (b.emblem) {
      ctx.fillStyle = b.trim;
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L;
      ctx.beginPath();
      ctx.arc(0, 1.25, 0.16, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 1.25);
        ctx.arc(0, 1.25, 0.14, -Math.PI / 2 + i * TAU / 3 - 0.45, -Math.PI / 2 + i * TAU / 3 + 0.45);
        ctx.closePath();
        ctx.fill();
      }
    }
    if (missingL) {
      // the empty shoulder
      ctx.fillStyle = '#2a0f0a';
      UW.RIG.blob(ctx, sw * 0.62, 0.85, 0.12, 5);
      ctx.fillStyle = '#6e1410';
      UW.RIG.blob(ctx, sw * 0.62, 0.84, 0.06, 7);
    }
    // damage on clothing
    if (dm.wear > 0) {
      ctx.save();
      ctx.beginPath();
      path(ctx);
      ctx.clip();
      for (let i = 0; i < Math.floor(dm.wear * 5); i++) {
        const tx = (hash(i * 2.2) - 0.5) * sw * 1.6, ty = 0.8 + hash(i * 4.1) * 0.6, tr = 0.05 + hash(i) * 0.04;
        ctx.fillStyle = shade(p.skin, -0.15);
        UW.RIG.tear(ctx, tx, ty, tr, i);
        ctx.strokeStyle = rgba('#000000', 0.55);
        ctx.lineWidth = L * 0.9;
        ctx.stroke();
        ctx.strokeStyle = rgba('#000000', 0.25);
        ctx.beginPath();
        ctx.moveTo(tx - tr * 1.6, ty - tr * 0.3);
        ctx.lineTo(tx + tr * 1.6, ty + tr * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (dm.blood > 0 || dm.burn > 0) {
      ctx.save();
      ctx.beginPath();
      path(ctx);
      ctx.clip();
      ctx.fillStyle = 'rgba(20,8,5,0.6)';
      for (let i = 0; i < Math.floor((dm.burn || 0) * 6); i++) UW.RIG.blob(ctx, (hash(i * 5.5) - 0.5) * sw * 1.8, 0.75 + hash(i * 2.9) * 0.7, 0.08, i * 3);
      ctx.fillStyle = 'rgba(100,8,8,0.8)';
      for (let i = 0; i < Math.floor((dm.blood || 0) * 6); i++) UW.RIG.blob(ctx, (hash(i * 7.7) - 0.5) * sw * 1.6, 0.75 + hash(i * 3.3) * 0.7, 0.04, i * 5);
      ctx.restore();
    }
  }

  /* ---------- eyes & mouth ---------- */
  function eye(ctx, p, st, s, L, lost) {
    if (!p.eyeC) p = Object.assign({}, p, { eyeC: '#3a2618' });
    const ex = s * 0.155 * (p.faceW || 1), ey = 0.0;
    const sc = p.eyeScale || 1;
    const w = 0.09 * sc * (p.fem ? 1.05 : 1), hgt = 0.036 * sc * (p.tired ? 0.9 : 1);
    const t = st.t || 0;
    const blink = st.blink != null ? st.blink : (UW.fract(t * 0.21 + (p.skin.length * 0.07)) < 0.03 ? 1 : 0);
    const expr = st.expr || 'neutral';
    let open = 1 - blink;
    if (expr === 'closed') open = 0;
    if (expr === 'pain') open *= 0.55;
    if (expr === 'angry' || expr === 'rage') open *= 0.8;
    if (expr === 'wide' || expr === 'shock') open *= 1.3;
    if (p.tired && expr !== 'wide') open *= 0.85;
    const lookX = (st.look || 0) * 0.03, lookY = (st.lookY || 0) * 0.02;
    ctx.save();
    ctx.translate(ex, ey);
    if (lost) {
      ctx.fillStyle = 'rgba(74,22,18,0.55)';
      UW.RIG.blob(ctx, 0, 0, 0.1, 41);
      ctx.strokeStyle = '#3a0d0a';
      ctx.lineWidth = L * 1.6;
      ctx.beginPath();
      ctx.moveTo(-w, 0.005);
      ctx.quadraticCurveTo(0, 0.03, w, 0.0);
      ctx.stroke();
      ctx.strokeStyle = '#8a1a14';
      ctx.lineWidth = L * 1.3;
      ctx.beginPath();
      ctx.moveTo(-0.03, -0.18);
      ctx.lineTo(0.05, 0.16);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (open <= 0.08) {
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L * 1.2;
      ctx.beginPath();
      ctx.moveTo(-w, 0.0);
      ctx.quadraticCurveTo(0, 0.02, w, 0.0);
      ctx.stroke();
      if (p.lashes) {
        ctx.beginPath();
        ctx.moveTo(s * w, 0.0);
        ctx.lineTo(s * w * 1.25, -0.015);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    const hh = hgt * open;
    ctx.beginPath();
    ctx.moveTo(-w, 0.004);
    ctx.bezierCurveTo(-w * 0.5, -hh * 1.3, w * 0.5, -hh * 1.3, w, -0.002);
    ctx.bezierCurveTo(w * 0.5, hh * 0.9, -w * 0.5, hh * 0.9, -w, 0.004);
    ctx.closePath();
    ctx.fillStyle = p.scleraC || '#f3eee7';
    ctx.fill();
    ctx.save();
    ctx.clip();
    if (!p.noPupil) {
      ctx.fillStyle = p.eyeC;
      ctx.beginPath();
      ctx.arc(lookX, lookY, 0.034 * sc, 0, TAU);
      ctx.fill();
      ctx.fillStyle = shade(p.eyeC, -0.4);
      ctx.beginPath();
      ctx.arc(lookX, lookY - 0.012 * sc, 0.034 * sc, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.arc(lookX, lookY, 0.015 * sc, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(lookX + 0.01, lookY - 0.012, 0.007 * sc, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = rgba(p.eyeGlowC || '#ffffff', 0.9);
      ctx.fillRect(-w, -hh, w * 2, hh * 2);
    }
    ctx.restore();
    // lids
    ctx.strokeStyle = p.line;
    ctx.lineWidth = L * (p.lashes ? 1.5 : 1.1);
    ctx.beginPath();
    ctx.moveTo(-w * 1.02, 0.004);
    ctx.bezierCurveTo(-w * 0.5, -hh * 1.35, w * 0.5, -hh * 1.35, w * 1.02, -0.002);
    ctx.stroke();
    if (p.lashes) {
      ctx.lineWidth = L * 0.9;
      ctx.beginPath();
      ctx.moveTo(s * w, -0.004);
      ctx.lineTo(s * w * 1.3, -0.03);
      ctx.moveTo(s * w * 0.7, -hh * 0.9);
      ctx.lineTo(s * w * 0.9, -hh * 1.4);
      ctx.stroke();
    }
    if (p.liner) {
      ctx.lineWidth = L * 1.6;
      ctx.beginPath();
      ctx.moveTo(s * w * 0.6, -hh * 0.8);
      ctx.lineTo(s * w * 1.35, -0.035);
      ctx.stroke();
    }
    if (p.tired) {
      ctx.strokeStyle = rgba('#000000', 0.25);
      ctx.lineWidth = L * 0.7;
      ctx.beginPath();
      ctx.moveTo(-w * 0.7, hh * 1.3);
      ctx.quadraticCurveTo(0, hh * 2.1, w * 0.7, hh * 1.2);
      ctx.stroke();
    }
    ctx.restore();
    const eg = Math.max(st.eyeGlow || 0, p.glowEyes || 0);
    if (eg > 0) FX.glow(ctx, ex + lookX, ey + lookY, 0.12 + eg * 0.1, p.eyeGlowC || '#ffffff', eg, true);
  }

  function brows(ctx, p, st, L) {
    const expr = st.expr || 'neutral';
    let inner = 0, outer = 0;
    if (expr === 'angry' || expr === 'rage' || expr === 'shout') { inner = 0.045; outer = -0.015; }
    if (expr === 'sad' || expr === 'pain' || expr === 'grief') { inner = -0.04; outer = 0.02; }
    if (expr === 'wide' || expr === 'shock') { inner = -0.03; outer = -0.03; }
    if (expr === 'smirk') { inner = 0; outer = -0.02; }
    const w = p.brow || 1;
    ctx.fillStyle = p.browC || p.line;
    for (const s of [-1, 1]) {
      const x0 = s * 0.07 * (p.faceW || 1), x1 = s * 0.25 * (p.faceW || 1);
      const y0 = -0.085 + inner, y1 = -0.095 + outer;
      const th = 0.018 * w;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 0.03, x1, y1);
      ctx.lineTo(x1, y1 + th * 0.5);
      ctx.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 0.03 + th, x0, y0 + th);
      ctx.closePath();
      ctx.fill();
    }
  }

  function mouth(ctx, p, st, L) {
    const expr = st.expr || 'neutral';
    const t = st.t || 0;
    const talk = st.talk || 0;
    const mw = 0.085 * (p.lips || 1) * (p.child ? 0.85 : 1);
    const my = 0.3 + (p.long || 0) * 0.05 - (p.child ? 0.03 : 0);
    const open = Math.max(talk * (0.35 + 0.65 * Math.abs(Math.sin(t * 11) * Math.sin(t * 5.3 + 1))), expr === 'shout' || expr === 'rage' ? 0.9 : 0, expr === 'shock' ? 0.4 : 0, expr === 'pain' ? 0.25 : 0);
    ctx.save();
    ctx.translate(0, my);
    if (open > 0.06) {
      const oh = 0.012 + open * 0.07;
      ctx.beginPath();
      ctx.moveTo(-mw, 0);
      ctx.quadraticCurveTo(0, -oh * 0.5, mw, 0);
      ctx.quadraticCurveTo(0, oh * 1.6, -mw, 0);
      ctx.closePath();
      ctx.fillStyle = '#2a0c0c';
      ctx.fill();
      if (p.deadlights && open > 0.3) FX.glow(ctx, 0, oh * 0.5, 0.08 * open, '#f5e6c8', open, true);
      if (p.fangs) {
        ctx.fillStyle = '#f4f4f0';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * mw * 0.55, -oh * 0.25);
          ctx.lineTo(s * mw * 0.45, oh * 0.4);
          ctx.lineTo(s * mw * 0.35, -oh * 0.25);
          ctx.fill();
        }
      }
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L * 0.9;
      ctx.stroke();
    } else {
      let lift = 0, dip = 0;
      if (expr === 'smirk') lift = 0.03;
      if (expr === 'smile') { lift = 0.025; dip = 0.02; }
      if (expr === 'sad' || expr === 'grief' || expr === 'angry') lift = -0.02;
      ctx.strokeStyle = rgba('#2a1010', 0.9);
      ctx.lineWidth = L * 1.0;
      ctx.beginPath();
      ctx.moveTo(-mw, -(expr === 'smirk' ? 0 : lift));
      ctx.quadraticCurveTo(0, dip + 0.006, mw, -lift);
      ctx.stroke();
      if (p.lipC) {
        ctx.fillStyle = p.lipC;
        ctx.beginPath();
        ctx.moveTo(-mw * 0.85, 0.002);
        ctx.quadraticCurveTo(0, 0.045 * (p.lips || 1), mw * 0.85, 0.002);
        ctx.quadraticCurveTo(0, 0.012, -mw * 0.85, 0.002);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-mw * 0.85, 0);
        ctx.quadraticCurveTo(-mw * 0.3, -0.028, 0, -0.012);
        ctx.quadraticCurveTo(mw * 0.3, -0.028, mw * 0.85, 0);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ---------- main ---------- */
  /* st: {x, y, s (head height px), t, expr, talk, eyeGlow, look, tilt, dmg, rim, rimA, alpha, breathe} */
  PORT.draw = function (ctx, id, st) {
    const p = P[id];
    if (!p) return;
    const s = st.s || 520;
    const t = st.t || 0;
    const L = (st.lw || 4) / s * 1.4;
    ctx.save();
    ctx.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    const breathe = Math.sin(t * 1.3) * 0.006;
    ctx.translate(st.x || 0, (st.y || 0) + breathe * s);
    ctx.scale(s, s);
    ctx.rotate(st.tilt || 0);
    const dm = st.dmg || {};
    // veil and bust first (behind head)
    if (p.veil) {
      ctx.save();
      ctx.globalAlpha *= 0.85;
      ctx.fillStyle = p.veil;
      ctx.beginPath();
      ctx.moveTo(-0.3, -0.62);
      ctx.bezierCurveTo(-0.9, -0.3, -0.9, 0.6, -0.8, 1.6);
      ctx.lineTo(0.8, 1.6);
      ctx.bezierCurveTo(0.9, 0.6, 0.9, -0.3, 0.3, -0.62);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    bust(ctx, p, st, L);
    hairBack(ctx, p, st, L);
    // ears
    for (const sx of [-1, 1]) {
      ctx.fillStyle = shade(p.skin, -0.12);
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L;
      ctx.beginPath();
      ctx.ellipse(sx * 0.38 * (p.faceW || 1), 0.05, 0.05, 0.1, sx * 0.15, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    // face
    const fp = facePts(p);
    const facePath = (c) => UW.spline(c, fp, true, 0.7);
    const lightX = st.lightX == null ? -0.05 : st.lightX;
    cel(ctx, facePath, p.skin, shade(p.skin, -0.26), lightX, p.line, L * 1.3);
    ctx.save();
    ctx.beginPath();
    facePath(ctx);
    ctx.clip();
    // cheek & jaw shading
    ctx.fillStyle = rgba('#000000', 0.1);
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sx * 0.27, 0.2, 0.08, 0.14, sx * 0.2, 0, TAU);
      ctx.fill();
    }
    if (p.gaunt) {
      ctx.fillStyle = rgba('#000000', 0.18);
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx * 0.24, 0.16, 0.06, 0.12, sx * 0.1, 0, TAU);
        ctx.fill();
      }
    }
    if (p.stubble) {
      ctx.fillStyle = rgba('#140e0a', 0.18 * p.stubble);
      ctx.beginPath();
      ctx.moveTo(-0.34, 0.1);
      ctx.quadraticCurveTo(-0.3, 0.45, 0, 0.55);
      ctx.quadraticCurveTo(0.3, 0.45, 0.34, 0.1);
      ctx.quadraticCurveTo(0.2, 0.26, 0.1, 0.24);
      ctx.quadraticCurveTo(0, 0.2, -0.1, 0.24);
      ctx.quadraticCurveTo(-0.2, 0.26, -0.34, 0.1);
      ctx.fill();
    }
    if (p.scars) {
      ctx.strokeStyle = rgba('#7a4a40', 0.9);
      ctx.lineWidth = L * 0.9;
      for (let i = 0; i < p.scars; i++) {
        const x = (hash(i * 3.1) - 0.5) * 0.5, y = (hash(i * 5.7) - 0.4) * 0.6;
        ctx.beginPath();
        ctx.moveTo(x - 0.05, y - 0.06);
        ctx.lineTo(x + 0.06, y + 0.07);
        ctx.stroke();
      }
    }
    // damage
    if (dm.burn > 0) {
      ctx.fillStyle = rgba('#1a0a06', 0.5 * dm.burn);
      UW.RIG.blob(ctx, -0.22, 0.15, 0.12 * dm.burn + 0.03, 3);
      UW.RIG.blob(ctx, 0.2, -0.38, 0.1 * dm.burn, 5);
      ctx.fillStyle = rgba('#7a2a12', 0.4 * dm.burn);
      UW.RIG.blob(ctx, -0.22, 0.15, 0.06 * dm.burn, 7);
    }
    if (dm.blood > 0) {
      ctx.fillStyle = 'rgba(110,10,10,0.85)';
      UW.RIG.blob(ctx, 0.18, -0.35, 0.04 + dm.blood * 0.03, 9);
      ctx.fillRect(0.17, -0.35, 0.022, 0.2 + dm.blood * 0.2);
      if (dm.blood > 0.5) {
        UW.RIG.blob(ctx, -0.05, 0.42, 0.03, 11);
        ctx.fillRect(-0.06, 0.42, 0.018, 0.12);
      }
    }
    if (dm.dirt > 0) {
      ctx.fillStyle = rgba('#3a3228', dm.dirt * 0.3);
      UW.RIG.blob(ctx, 0.25, 0.25, 0.12, 13);
    }
    ctx.restore();
    // nose
    const nw = 0.045 * (p.noseW || 1), nl = 0.2 * (p.nose || 1) * (p.child ? 0.8 : 1);
    ctx.strokeStyle = rgba('#000000', 0.45);
    ctx.lineWidth = L * 0.9;
    ctx.beginPath();
    ctx.moveTo(-0.03, 0.02);
    ctx.quadraticCurveTo(-0.045, nl * 0.6, -nw, nl);
    ctx.quadraticCurveTo(0, nl + 0.03, nw, nl);
    ctx.stroke();
    ctx.fillStyle = rgba('#000000', 0.18);
    ctx.beginPath();
    ctx.moveTo(0.03, 0.03);
    ctx.quadraticCurveTo(0.05, nl * 0.7, nw * 0.9, nl * 0.95);
    ctx.lineTo(0.02, nl * 0.8);
    ctx.closePath();
    ctx.fill();
    // eyes
    const lostR = dm.eye === 'L'; // the viewer's right is the character's left
    eye(ctx, p, st, -1, L, dm.eye === 'R');
    eye(ctx, p, st, 1, L, lostR);
    brows(ctx, p, st, L);
    mouth(ctx, p, st, L);
    if (st.tears) {
      ctx.fillStyle = 'rgba(200,230,255,0.75)';
      for (const sx of [-1, 1]) {
        const k = (t * 0.3 + (sx > 0 ? 0.4 : 0)) % 1;
        ctx.beginPath();
        ctx.ellipse(sx * 0.17, 0.05 + k * 0.3, 0.012, 0.02, 0, 0, TAU);
        ctx.fill();
      }
    }
    // masks
    if (p.mask) {
      ctx.fillStyle = p.mask;
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L;
      ctx.beginPath();
      ctx.moveTo(-0.34, -0.06);
      ctx.bezierCurveTo(-0.3, -0.14, -0.08, -0.14, 0, -0.08);
      ctx.bezierCurveTo(0.08, -0.14, 0.3, -0.14, 0.34, -0.06);
      ctx.bezierCurveTo(0.36, 0.06, 0.26, 0.1, 0.16, 0.08);
      ctx.bezierCurveTo(0.08, 0.07, 0.04, 0.05, 0, 0.06);
      ctx.bezierCurveTo(-0.04, 0.05, -0.08, 0.07, -0.16, 0.08);
      ctx.bezierCurveTo(-0.26, 0.1, -0.36, 0.06, -0.34, -0.06);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // eye holes re-drawn on top
      eye(ctx, p, st, -1, L, false);
      eye(ctx, p, st, 1, L, false);
    }
    if (p.maskJ) {
      // Jackson: a blank black mask with dark hollow eye holes — the face shows nothing at all
      ctx.fillStyle = '#0c0c0e';
      ctx.beginPath();
      facePath(ctx);
      ctx.fill();
      ctx.fillStyle = '#000';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx * 0.155, 0.0, 0.07, 0.04, sx * -0.1, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(70,70,80,0.6)';
      ctx.lineWidth = L * 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0.02);
      ctx.lineTo(0, 0.2);
      ctx.moveTo(-0.07, 0.3);
      ctx.lineTo(0.07, 0.3);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(120,120,140,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, -0.08, 0.36, 0.48, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    hairFront(ctx, p, st, L);
    if (p.circlet) {
      ctx.strokeStyle = p.circlet;
      ctx.lineWidth = L * 3;
      ctx.beginPath();
      ctx.moveTo(-0.38, -0.3);
      ctx.quadraticCurveTo(0, -0.42, 0.38, -0.3);
      ctx.stroke();
      ctx.fillStyle = '#fff3c0';
      ctx.beginPath();
      ctx.arc(0, -0.38, 0.03, 0, TAU);
      ctx.fill();
    }
    if (p.comb) {
      ctx.fillStyle = '#b8bbc6';
      ctx.strokeStyle = p.line;
      ctx.lineWidth = L;
      ctx.beginPath();
      ctx.moveTo(-0.32, -0.6);
      ctx.quadraticCurveTo(0, -0.8, 0.32, -0.6);
      ctx.quadraticCurveTo(0, -0.7, -0.32, -0.6);
      ctx.fill();
      ctx.stroke();
      for (const x of [-0.16, 0, 0.16]) {
        ctx.fillStyle = '#9c0f22';
        ctx.beginPath();
        ctx.arc(x, -0.69, 0.025, 0, TAU);
        ctx.fill();
      }
    }
    if (p.crown) {
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        const x = Math.cos(a) * 0.62, y = -0.2 + Math.sin(a) * 0.62;
        FX.glow(ctx, x, y, 0.1, '#ffb020', 0.8);
        ctx.fillStyle = '#ffe070';
        ctx.beginPath();
        ctx.arc(x, y, 0.035, 0, TAU);
        ctx.fill();
      }
    }
    // rim light
    if (st.rim) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(st.rim, st.rimA == null ? 0.6 : st.rimA);
      ctx.lineWidth = L * 2.4;
      ctx.beginPath();
      const side = st.rimSide || 1;
      ctx.moveTo(side * 0.3, -0.5);
      ctx.quadraticCurveTo(side * 0.44, -0.1, side * 0.33, 0.3);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  };

  /* The Unmaker's face in close-up: a smooth absence with two pale slits. */
  PORT.unmaker = function (ctx, st) {
    const s = st.s || 520;
    const t = st.t || 0;
    ctx.save();
    ctx.translate(st.x || 0, st.y || 0);
    ctx.scale(s, s);
    FX.darkGlow(ctx, 0, 0.2, 1.4, 0.8);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, -0.02, 0.36, 0.52, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.16, 0.4);
    ctx.lineTo(-0.2, 0.8);
    ctx.lineTo(-1.1, 1.0);
    ctx.lineTo(-1.2, 1.7);
    ctx.lineTo(1.2, 1.7);
    ctx.lineTo(1.1, 1.0);
    ctx.lineTo(0.2, 0.8);
    ctx.lineTo(0.16, 0.4);
    ctx.fill();
    const eyes = st.eyes == null ? 1 : st.eyes;
    if (eyes > 0) {
      ctx.fillStyle = rgba('#cacaca', eyes);
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * 0.05, -0.005);
        ctx.lineTo(sx * 0.24, -0.02);
        ctx.lineTo(sx * 0.22, 0.008);
        ctx.lineTo(sx * 0.055, 0.012);
        ctx.closePath();
        ctx.fill();
        FX.glow(ctx, sx * 0.15, 0, 0.12, '#d0d0d0', 0.3 * eyes);
      }
    }
    const m = st.mouth || 0;
    if (m > 0.02) {
      const o = m * Math.abs(Math.sin(t * 9) * 0.7 + Math.sin(t * 23) * 0.3);
      ctx.fillStyle = '#707070';
      ctx.fillRect(-0.09, 0.28, 0.18, 0.006 + o * 0.03);
    }
    // failing edges
    const f = Math.floor(t * 10);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU;
      if (hash(i + f * 0.3) < 0.4) continue;
      const r1 = 0.36, r2 = 0.52;
      ctx.strokeStyle = 'rgba(210,210,210,0.35)';
      ctx.lineWidth = 0.006;
      ctx.beginPath();
      const ox = (hash(i + f) - 0.5) * 0.06;
      ctx.moveTo(Math.cos(a) * r1 + ox, Math.sin(a) * r2 - 0.02);
      ctx.lineTo(Math.cos(a + 0.3) * r1 + ox, Math.sin(a + 0.3) * r2 - 0.02);
      ctx.stroke();
    }
    ctx.restore();
    FX.staticBlocks(ctx, t, st.x || 0, (st.y || 0) + s * 0.1, s * 1.2, s * 1.4, 26, 7, 0.7);
  };

  /* Portrait backdrop: dimmed gradient with a colored wash, in screen space. */
  PORT.backdrop = function (ctx, c1, c2, glowC) {
    const W = UW.W, H = UW.H;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (glowC) FX.glow(ctx, W * 0.5, H * 0.45, 700, glowC, 0.35);
  };
})();
