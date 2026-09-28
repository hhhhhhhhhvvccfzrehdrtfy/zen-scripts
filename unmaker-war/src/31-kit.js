/* The Unmaker War — scene kit: damage continuity, keyframed actors, camera tracks, portrait shots. */
(function () {
  'use strict';
  const UW = window.UW;
  const { K, lerp, sat, hash, rgba } = UW;
  const R = UW.R;
  const FX = UW.FX;
  const KIT = (UW.KIT = {});

  /* ---------- damage continuity: injuries only accumulate ---------- */
  const DMG = (UW.DMG = {
    chase: [
      {},
      { wear: 0.12, dirt: 0.2 },
      { wear: 0.3, dirt: 0.3, blood: 0.2, burn: 0.12 },
      { wear: 0.42, dirt: 0.4, blood: 0.32, burn: 0.25, bruise: 0.3 },
      { wear: 0.55, dirt: 0.5, blood: 0.5, burn: 0.38, bruise: 0.4, eye: 'L', armor: 0.3 },
      { wear: 0.62, dirt: 0.55, blood: 0.6, burn: 0.45, bruise: 0.5, eye: 'L', armL: true, armor: 0.5 },
      { wear: 0.75, dirt: 0.6, blood: 0.72, burn: 0.65, bruise: 0.6, eye: 'L', armL: true, armor: 0.75 },
      { wear: 0.85, dirt: 0.7, blood: 0.8, burn: 0.8, bruise: 0.7, eye: 'L', armL: true, armor: 0.9 },
      { wear: 0.7, dirt: 0.3, blood: 0.2, burn: 0.6, bruise: 0.4, eye: 'L', armL: true, armor: 0.9 },
    ],
    malevolor: [
      {},
      { armor: 0.1, blood: 0.1 },
      { armor: 0.3, blood: 0.28, burn: 0.2 },
      { armor: 0.45, blood: 0.45, burn: 0.3 },
      { armor: 0.62, blood: 0.55, burn: 0.42 },
      { armor: 0.8, blood: 0.66, burn: 0.55 },
      { armor: 0.82, blood: 0.3, burn: 0.5 },
    ],
    maeve: [
      {},
      { wear: 0.1 },
      { wear: 0.28, blood: 0.18, dirt: 0.2 },
      { wear: 0.45, blood: 0.35, dirt: 0.3, burn: 0.15 },
      { wear: 0.65, blood: 0.5, dirt: 0.4, burn: 0.3 },
      { wear: 0.6, blood: 0.2, dirt: 0.2, burn: 0.25 },
    ],
    jack: [
      {},
      { wear: 0.1 },
      { wear: 0.3, blood: 0.3, dirt: 0.2 },
      { wear: 0.55, blood: 0.6, burn: 0.25, dirt: 0.35 },
      { wear: 0.8, blood: 0.85, burn: 0.4, dirt: 0.45 },
    ],
    seraphina: [
      {},
      { wear: 0.08 },
      { wingBurn: 0.15, armor: 0.15, blood: 0.1, wear: 0.15 },
      { wingBurn: 0.4, armor: 0.35, blood: 0.28, wear: 0.3, dirt: 0.2 },
      { wingBurn: 0.62, armor: 0.55, blood: 0.45, wear: 0.45, dirt: 0.3 },
      { wingBurn: 0.55, armor: 0.5, blood: 0.15, wear: 0.4, dirt: 0.2 },
    ],
    valorion: [{}, { armor: 0.3 }, { armor: 0.5, armL: true }],
  });
  /* generic escalation for everyone else */
  function generic(stage) {
    const k = Math.max(0, stage);
    return { wear: Math.min(0.8, 0.12 * k), blood: Math.min(0.75, 0.1 * k), dirt: Math.min(0.6, 0.1 * k), burn: Math.min(0.5, 0.05 * k) };
  }
  UW.dmg = function (id, stage) {
    if (stage == null) return null;
    const tbl = DMG[id];
    if (tbl) return tbl[Math.max(0, Math.min(tbl.length - 1, stage))];
    return generic(stage);
  };

  /* ---------- scene helpers attached to S ---------- */
  KIT.extend = function (S) {
    const t = S.t;
    const dt = 1 / 30;
    const val = (v, e) => (Array.isArray(v) && Array.isArray(v[0]) ? K(t, v, e) : v);
    const vel = (v, e) => (Array.isArray(v) && Array.isArray(v[0]) ? (K(t + dt, v, e) - K(t - dt, v, e)) / (2 * dt) : 0);
    /* actor with keyframes: x/y/scale/alpha/glow accept [[t,v],...]; pose accepts seq or fn; face accepts [[t,±1]] */
    S.a = function (id, o) {
      const st = Object.assign({}, o);
      st.x = val(o.x, o.xe);
      st.y = o.y == null ? 0 : val(o.y, o.ye);
      if (o.vx == null) st.vx = vel(o.x, o.xe);
      if (o.vy == null) st.vy = vel(o.y, o.ye);
      if (Array.isArray(o.pose)) st.pose = UW.RIG.seq(t, o.pose);
      else if (typeof o.pose === 'function') st.pose = o.pose(t);
      if (Array.isArray(o.face)) st.face = K(t, o.face, 'step');
      for (const k of ['scale', 'alpha', 'glow', 'eyeGlow', 'erase', 'talk', 'wings', 'silhouette', 'tintA']) {
        if (Array.isArray(o[k])) st[k] = K(t, o[k]);
      }
      if (o.dmg === undefined && S.shot.chapter && S.shot.chapter.stage != null) {
        const stage = typeof S.shot.chapter.stage === 'object' ? S.shot.chapter.stage[id] : S.shot.chapter.stage;
        st.dmg = UW.dmg(id.replace(/Titan$/, ''), stage == null ? S.shot.chapter.stageAll : stage);
      }
      if (typeof o.dmg === 'number') st.dmg = UW.dmg(id, o.dmg);
      return S.actor(id, st);
    };
    /* camera track: keys [[t, x, y, z, rot?, ease?], ...] */
    S.camK = function (keys) {
      const xs = keys.map((k) => [k[0], k[1], k[5]]), ys = keys.map((k) => [k[0], k[2], k[5]]), zs = keys.map((k) => [k[0], k[3], k[5]]);
      const rs = keys.map((k) => [k[0], k[4] || 0, k[5]]);
      R.setCam(K(t, xs), K(t, ys), K(t, zs), K(t, rs));
    };
    S.bg = function (name, o) {
      return UW.BG[name](S, o || {});
    };
    S.w = function () {
      return R.world(1);
    };
    S.sc = function () {
      return R.screen();
    };
    /* impact helper: shake + flash in a window */
    S.hitAt = function (t0, amp, flash, color) {
      const u = (t - t0) / 0.35;
      if (u >= 0 && u <= 1) R.shake(t, amp * (1 - u), 30);
      S.flashAt = S.flashAt || [];
      if (flash) S.flashAt.push([t0, flash, color || '#ffffff']);
    };
    S.post = function () {
      if (S.flashAt) {
        for (const [t0, a, c] of S.flashAt) {
          const u = (t - t0) / 0.25;
          if (u >= 0 && u <= 1) R.flash(c, a * (1 - u), c === '#ffffff' ? 'lighter' : 'source-over');
        }
      }
    };
    /* unmade crowd along a line */
    S.unmade = function (n, x0, x1, o) {
      o = o || {};
      const ctx = R.world(o.p || 1);
      for (let i = 0; i < n; i++) {
        const k = n === 1 ? 0.5 : i / (n - 1);
        UW.UNM.soldier(ctx, Object.assign({ x: lerp(x0, x1, k) + (hash(i * 3.3 + (o.seed || 0)) - 0.5) * (o.jit || 60) + (o.vx || 0) * t, y: o.y || 0, t: t + i * 0.37, seed: (o.seed || 0) + i * 7 + 1, face: o.face || -1, alpha: o.alpha }, o.extra || {}));
      }
    };
  };

  /* ---------- canned shot builders ---------- */
  /* Portrait close-up with slow push; o: {dur, id, expr, talk:[[t0,t1],...], caps, bg:[c1,c2,glow], dmg, eyeGlow, look, tears, rim, x, s0, s1, fx(t,S)} */
  UW.portraitShot = function (o) {
    return UW.shot({
      dur: o.dur || 6,
      caps: o.caps,
      sfx: o.sfx,
      music: o.music,
      fadeIn: o.fadeIn,
      fadeOut: o.fadeOut,
      letterbox: o.letterbox,
      draw(t, S) {
        const ctx = S.sc();
        const bg = o.bg || ['#15161c', '#07080b', null];
        if (o.under) o.under(t, S);
        else UW.PORT.backdrop(ctx, bg[0], bg[1], bg[2]);
        const s = lerp(o.s0 || 520, o.s1 || 580, UW.Ease.io(sat(t / (o.dur || 6))));
        let talk = 0;
        if (o.talk) for (const [a, b] of o.talk) talk = Math.max(talk, UW.pulse(t, a, b, 0.1, 0.15));
        const st = {
          x: o.x == null ? UW.W / 2 : o.x, y: (o.y == null ? 470 : o.y), s, t: S.T,
          expr: typeof o.expr === 'function' ? o.expr(t) : o.expr, talk,
          eyeGlow: typeof o.eyeGlow === 'function' ? o.eyeGlow(t) : o.eyeGlow || 0,
          dmg: o.dmg == null ? (S.shot.chapter && S.shot.chapter.stage != null ? UW.dmg(o.id, typeof S.shot.chapter.stage === 'object' ? S.shot.chapter.stage[o.id] : S.shot.chapter.stage) : null) : typeof o.dmg === 'number' ? UW.dmg(o.id, o.dmg) : o.dmg,
          look: o.look || 0, tears: o.tears, rim: o.rim, rimA: o.rimA, rimSide: o.rimSide, tilt: o.tilt || 0,
        };
        if (o.id === 'unmaker') UW.PORT.unmaker(ctx, Object.assign(st, { eyes: o.eyes == null ? 1 : o.eyes, mouth: talk }));
        else UW.PORT.draw(ctx, o.id, st);
        if (o.fx) o.fx(t, S);
        S.post();
      },
    });
  };

  /* A black interstitial with a single line (for time jumps). */
  UW.textShot = function (o) {
    return UW.shot({
      dur: o.dur || 4,
      music: o.music,
      sfx: o.sfx,
      fadeIn: 0.6,
      fadeOut: 0.6,
      vignette: 0.3,
      draw(t, S) {
        const ctx = S.sc();
        ctx.fillStyle = o.bgc || '#050506';
        ctx.fillRect(0, 0, UW.W, UW.H);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = o.color || '#e8e2d6';
        ctx.font = (o.italic === false ? '' : 'italic ') + '500 ' + (o.size || 52) + 'px ' + UW.FONTS.display;
        const lines = o.text.split('\n');
        lines.forEach((ln, i) => ctx.fillText(ln, UW.W / 2, UW.H / 2 - (lines.length - 1) * 36 + i * 72));
        ctx.restore();
        if (o.fx) o.fx(t, S);
      },
    });
  };
})();
