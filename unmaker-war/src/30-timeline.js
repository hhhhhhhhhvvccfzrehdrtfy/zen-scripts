/* The Unmaker War — timeline: chapters, shots, captions, title cards, fades, frame rendering. */
(function () {
  'use strict';
  const UW = window.UW;
  const { W, H, sat, lerp, clamp, rgba, hash } = UW;
  const R = UW.R;

  const TL = (UW.TL = { chapters: [], shots: [], total: 0, built: false });

  UW.FONTS = {
    display: '"Cormorant Garamond", "Cormorant", Georgia, "Times New Roman", serif',
    body: '"Instrument Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
  };

  /* Speaker colors for captions */
  UW.VOICE = {
    CHASE: '#9cc4ff', MAEVE: '#ff6b7d', MALEVOLOR: '#ff3b3b', 'GAMMA JACK': '#ffd84a', JACK: '#ffd84a',
    VALORION: '#c9a2ff', UNMAKER: '#b8b8b8', 'THE UNMAKER': '#b8b8b8', VALOR: '#7fb6ff', SERAPHINA: '#ffe7a6',
    ATTEREA: '#c9a7ff', DRAVEN: '#e0303f', CAELUM: '#9fb7cc', VIRA: '#b98cff', ASH: '#ff9a3c', ASHIRA: '#ffe9b0',
    KAEL: '#ffb347', APHRODITE: '#ff9ab0', TYRUS: '#c9a27a', JAKE: '#6f9dff', AXION: '#55e6ff', NYX: '#b47cff',
    BLAZE: '#ff7a3c', JACKSON: '#9a9a9a', LENA: '#ffe6a8', EZARA: '#e6e6ff', 'AEGIS PRIMUS': '#ffe08a',
    VARAKAL: '#ff7ae0', "KHAL'ATHOS": '#e0a050', CYRUS: '#bfe6ff', 'THE KING': '#ffb03a', KING: '#ffb03a',
    WARDEN: '#e8e8e8', GUARDIAN: '#9ff4ff', NARRATOR: '#ffffff',
  };

  let curChapter = null;
  UW.chapter = function (meta) {
    curChapter = Object.assign({ shots: [] }, meta);
    TL.chapters.push(curChapter);
    // automatic title card
    if (meta.card !== false) {
      UW.shot({
        dur: meta.cardDur || 5.5,
        card: true,
        music: meta.music,
        draw(t, S) {
          UW.titleCard(S, t, this.dur, meta);
        },
        sfx: [[0.2, 'boom', { v: 0.5 }]],
      });
    }
    return curChapter;
  };

  UW.shot = function (def) {
    if (!curChapter) UW.chapter({ id: 'pre', num: '', title: '', card: false });
    def.chapter = curChapter;
    curChapter.shots.push(def);
    TL.shots.push(def);
    return def;
  };

  TL.build = function () {
    let t = 0;
    TL.shots.forEach((s, i) => {
      s.index = i;
      s.start = t;
      t += s.dur;
    });
    TL.total = t;
    TL.chapters.forEach((c) => {
      c.start = c.shots.length ? c.shots[0].start : 0;
      c.end = c.shots.length ? c.shots[c.shots.length - 1].start + c.shots[c.shots.length - 1].dur : 0;
    });
    TL.built = true;
  };

  TL.find = function (T) {
    const shots = TL.shots;
    let lo = 0, hi = shots.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (shots[mid].start <= T) lo = mid; else hi = mid - 1;
    }
    return shots[lo];
  };

  TL.chapterAt = function (T) {
    const s = TL.find(T);
    return s ? s.chapter : null;
  };

  /* ---------- per-frame shot helper ---------- */
  function makeS(shot, t, T) {
    const S = {
      t, T, dur: shot.dur, u: sat(t / shot.dur), shot,
      ctx: R.ctx,
      cam(x, y, z, r) {
        R.setCam(x, y, z, r);
      },
      world(p) {
        return R.world(p);
      },
      screen() {
        return R.screen();
      },
      shake(amp, freq) {
        R.shake(t, amp, freq);
      },
      /* draw a character: id or spec, state */
      actor(id, st) {
        const spec = typeof id === 'string' ? UW.C[id] : id;
        if (!spec) return null;
        const ctx = R.world(st.p == null ? 1 : st.p);
        st.t = st.t == null ? T : st.t;
        if (st.buffer || st.erase > 0 || (st.alpha != null && st.alpha < 1 && st.alphaBuffer !== false)) {
          return UW.drawBuffered(ctx, spec, st);
        }
        return UW.RIG.draw(ctx, spec, st);
      },
      K(keys, e) {
        return UW.K(t, keys, e);
      },
      P(t0, t1, e) {
        return UW.P(t, t0, t1, e);
      },
      pulse(t0, t1, a, b) {
        return UW.pulse(t, t0, t1, a, b);
      },
      pose(seq) {
        return UW.RIG.seq(t, seq);
      },
      /* velocity of a keyframed position (for cloth), px/s */
      vel(keys, e) {
        const dt = 1 / 30;
        return (UW.K(t + dt, keys, e) - UW.K(t - dt, keys, e)) / (2 * dt);
      },
    };
    if (UW.KIT && UW.KIT.extend) UW.KIT.extend(S);
    return S;
  }
  TL.makeS = makeS;

  /* ---------- render a global time ---------- */
  TL.render = function (T, opts) {
    opts = opts || {};
    if (!TL.built) TL.build();
    T = clamp(T, 0, TL.total - 1e-4);
    const shot = TL.find(T);
    const t = T - shot.start;
    R.begin('#000');
    const S = makeS(shot, t, T);
    try {
      shot.draw.call(shot, t, S);
    } catch (e) {
      R.screen();
      R.ctx.fillStyle = '#300';
      R.ctx.fillRect(0, 0, W, H);
      R.ctx.fillStyle = '#fff';
      R.ctx.font = '28px monospace';
      R.ctx.fillText('Shot error: ' + e.message, 40, 60);
      if (!TL._warned) {
        console.error(e);
        TL._warned = true;
      }
    }
    // post
    const ctx = R.screen();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (shot.grain !== false) R.grain(shot.grain == null ? 0.07 : shot.grain, T);
    if (shot.vignette !== false) R.vignette(shot.vignette == null ? 0.55 : shot.vignette);
    if (shot.letterbox) R.letterbox(typeof shot.letterbox === 'function' ? shot.letterbox(t) : shot.letterbox);
    // fades
    const fi = shot.fadeIn == null ? (shot.card ? 0.8 : 0) : shot.fadeIn;
    const fo = shot.fadeOut == null ? (shot.card ? 0.8 : 0) : shot.fadeOut;
    let fade = 0;
    if (fi > 0 && t < fi) fade = Math.max(fade, 1 - t / fi);
    if (fo > 0 && t > shot.dur - fo) fade = Math.max(fade, (t - (shot.dur - fo)) / fo);
    if (fade > 0) R.flash(shot.fadeColor || '#000', fade);
    // captions
    if (opts.captions !== false) drawCaptions(shot, t);
    return shot;
  };

  /* ---------- captions ---------- */
  function wrap(ctx, text, maxW) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawCaptions(shot, t) {
    const caps = shot.caps;
    if (!caps) return;
    const ctx = R.screen();
    for (const c of caps) {
      const [t0, t1, text, who] = c;
      if (t < t0 || t > t1) continue;
      const a = Math.min(sat((t - t0) / 0.25), sat((t1 - t) / 0.3));
      if (a <= 0) continue;
      const narr = !who;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const size = narr ? 44 : 38;
      ctx.font = narr ? 'italic 500 ' + size + 'px ' + UW.FONTS.display : '500 ' + size + 'px ' + UW.FONTS.body;
      const lines = wrap(ctx, text, 1500);
      const lh = size * 1.28;
      const baseY = (shot.capY || 952) - (lines.length - 1) * lh;
      // soft band behind text for legibility
      const band = ctx.createLinearGradient(0, baseY - lh - (who ? 50 : 20), 0, H);
      band.addColorStop(0, 'rgba(0,0,0,0)');
      band.addColorStop(0.35, 'rgba(0,0,0,0.45)');
      band.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = band;
      ctx.fillRect(0, baseY - lh - (who ? 50 : 20), W, H);
      if (who) {
        ctx.font = '700 24px ' + UW.FONTS.body;
        ctx.fillStyle = UW.VOICE[who] || '#dddddd';
        ctx.letterSpacing = '4px';
        ctx.fillText(who, W / 2, baseY - lh + 6);
        ctx.letterSpacing = '0px';
        ctx.font = '500 ' + size + 'px ' + UW.FONTS.body;
      }
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = narr ? '#f1ece4' : '#ffffff';
      lines.forEach((ln, i) => ctx.fillText(narr ? ln : ln, W / 2, baseY + i * lh));
      ctx.restore();
    }
  }
  TL.drawCaptions = drawCaptions;

  /* ---------- title cards ---------- */
  UW.titleCard = function (S, t, dur, meta) {
    const ctx = R.screen();
    // backdrop: slow drifting void with a seam of light
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, 900);
    g.addColorStop(0, rgba(meta.color || '#6a4cff', 0.22));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    UW.FX.field(ctx, t, { n: 90, x0: 0, x1: W, y0: 0, y1: H, vx: -6, vy: -3, size: 2, color: '#ffffff', alpha: 0.35, twinkle: true, seed: 5 });
    const u = sat(t / 1.2);
    const out = sat((dur - t) / 0.8);
    const a = Math.min(u, out);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    // chapter number
    if (meta.num) {
      ctx.font = '600 30px ' + UW.FONTS.body;
      ctx.letterSpacing = '14px';
      ctx.fillStyle = rgba(meta.color || '#b9a8ff', 0.95);
      ctx.fillText(meta.num.toUpperCase(), W / 2, 400);
      ctx.letterSpacing = '0px';
    }
    // title with erasure bite
    ctx.font = '600 104px ' + UW.FONTS.display;
    ctx.fillStyle = '#f3efe6';
    ctx.fillText(meta.title, W / 2, 530);
    // hairline
    const lw = 520 * UW.Ease.out3(sat((t - 0.3) / 1.2));
    ctx.fillStyle = rgba(meta.color || '#b9a8ff', 0.8);
    ctx.fillRect(W / 2 - lw / 2, 580, lw, 2);
    if (meta.sub) {
      ctx.font = 'italic 500 40px ' + UW.FONTS.display;
      ctx.fillStyle = '#c9c3b8';
      ctx.fillText(meta.sub, W / 2, 650);
    }
    ctx.restore();
    // erasure bites across the title
    const bite = sat((t - (dur - 1.6)) / 1.2);
    if (bite > 0) {
      UW.FX.staticBlocks(ctx, t, W / 2, 500, 1100, 260, 40, 9, bite);
      R.glitch(bite * 0.6, t, 3);
    } else if (t < 0.6) {
      UW.FX.staticBlocks(ctx, t, W / 2, 500, 1100, 260, 30, 4, 1 - t / 0.6);
    }
  };

  /* ---------- buffered actor draw (for erasure, ghosts, clean transparency) ---------- */
  let pool = [];
  function getBuf(w, h) {
    let c = pool.pop();
    if (!c) c = document.createElement('canvas');
    if (c.width < w || c.height < h) {
      c.width = Math.max(c.width, w);
      c.height = Math.max(c.height, h);
    }
    return c;
  }
  UW.drawBuffered = function (ctx, spec, st) {
    const m = ctx.getTransform();
    const Hh = spec.ft * UW.FT * (st.scale || 1);
    // bounds in world coords around the actor
    const pad = Hh * (st.boundsK || 1.6);
    const x0 = (st.x || 0) - pad, x1 = (st.x || 0) + pad;
    const y0 = (st.y || 0) - Hh * 1.9 - pad * 0.3, y1 = (st.y || 0) + Hh * 0.6;
    const pts = [m.transformPoint({ x: x0, y: y0 }), m.transformPoint({ x: x1, y: y0 }), m.transformPoint({ x: x0, y: y1 }), m.transformPoint({ x: x1, y: y1 })];
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const p of pts) {
      bx0 = Math.min(bx0, p.x); by0 = Math.min(by0, p.y);
      bx1 = Math.max(bx1, p.x); by1 = Math.max(by1, p.y);
    }
    const cw = R.canvas.width, ch = R.canvas.height;
    bx0 = Math.max(0, Math.floor(bx0)); by0 = Math.max(0, Math.floor(by0));
    bx1 = Math.min(cw, Math.ceil(bx1)); by1 = Math.min(ch, Math.ceil(by1));
    const bw = bx1 - bx0, bh = by1 - by0;
    if (bw <= 2 || bh <= 2) return null;
    const buf = getBuf(bw, bh);
    const b = buf.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalAlpha = 1;
    b.globalCompositeOperation = 'source-over';
    b.clearRect(0, 0, bw, bh);
    b.setTransform(m.a, m.b, m.c, m.d, m.e - bx0, m.f - by0);
    const st2 = Object.assign({}, st, { alpha: 1 });
    const S = UW.RIG.draw(b, spec, st2);
    // effects in device space
    b.setTransform(1, 0, 0, 1, 0, 0);
    const er = st.erase || 0;
    if (er > 0) {
      // drain colour, only where the character is
      b.globalCompositeOperation = 'source-atop';
      b.globalAlpha = sat(er * 1.2) * 0.7;
      b.fillStyle = '#8a8a8a';
      b.fillRect(0, 0, bw, bh);
      // erase slices and blocks — missing information
      b.globalCompositeOperation = 'destination-out';
      b.globalAlpha = 1;
      const f = Math.floor((st.t || 0) * 12);
      const n = Math.floor(6 + er * 40);
      for (let i = 0; i < n; i++) {
        const s = (st.seed || 1) * 17 + i * 3.1 + (st.eraseStatic ? 0 : f * 0.13);
        const yy = hash(s) * bh, hh = (0.01 + hash(s + 1) * 0.06 * er) * bh;
        const xx = hash(s + 2) * bw, ww = (0.1 + hash(s + 3) * 0.8 * er) * bw;
        if (hash(s + 4) < er * 1.2) b.fillRect(xx - ww / 2, yy, ww, hh);
      }
      if (er > 0.85) {
        b.globalAlpha = (er - 0.85) / 0.15;
        b.fillRect(0, 0, bw, bh);
      }
      b.globalCompositeOperation = 'source-atop';
      b.globalAlpha = 0.5 * er;
      b.fillStyle = '#d8d8d8';
      for (let i = 0; i < 12; i++) {
        const s = i * 7.7 + f;
        if (hash(s) < 0.5) continue;
        b.fillRect(hash(s + 1) * bw, hash(s + 2) * bh, bw * 0.3 * hash(s + 3), 2);
      }
    }
    if (st.inside) {
      b.save();
      b.globalCompositeOperation = 'source-atop';
      b.setTransform(m.a, m.b, m.c, m.d, m.e - bx0, m.f - by0);
      b.translate(st.x || 0, st.y || 0);
      b.scale((st.face || 1) * (st.scale || 1), st.scale || 1);
      st.inside(b, S, st.t || 0);
      b.restore();
      b.setTransform(1, 0, 0, 1, 0, 0);
    }
    if (st.tint) {
      b.globalCompositeOperation = 'source-atop';
      b.globalAlpha = st.tintA == null ? 0.3 : st.tintA;
      b.fillStyle = st.tint;
      b.fillRect(0, 0, bw, bh);
    }
    if (st.silhouette) {
      b.globalCompositeOperation = 'source-atop';
      b.globalAlpha = st.silhouette;
      b.fillStyle = st.silC || '#000';
      b.fillRect(0, 0, bw, bh);
    }
    b.globalCompositeOperation = 'source-over';
    b.globalAlpha = 1;
    // composite
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = st.alpha == null ? 1 : st.alpha;
    if (st.blend) ctx.globalCompositeOperation = st.blend;
    const jit = er > 0 ? (hash(Math.floor((st.t || 0) * 20)) - 0.5) * 10 * er * R.s : 0;
    ctx.drawImage(buf, 0, 0, bw, bh, bx0 + jit, by0, bw, bh);
    ctx.restore();
    pool.push(buf);
    return S;
  };
})();
