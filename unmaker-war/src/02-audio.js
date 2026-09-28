/* The Unmaker War — procedural score and sound effects (WebAudio). Starts only after a click. */
(function () {
  'use strict';
  const UW = window.UW;
  const A = (UW.A = { ctx: null, ok: false, muted: false, bed: null, bedName: 'none', vol: 0.8 });

  let whiteBuf = null, brownBuf = null, verb = null, master = null, sfxBus = null, musBus = null, comp = null;

  A.init = function () {
    if (A.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      A.ctx = new AC();
    } catch (e) {
      return;
    }
    const ac = A.ctx;
    master = ac.createGain();
    master.gain.value = A.muted ? 0 : A.vol;
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.25;
    master.connect(comp);
    comp.connect(ac.destination);
    musBus = ac.createGain();
    musBus.gain.value = 0.55;
    sfxBus = ac.createGain();
    sfxBus.gain.value = 0.9;
    musBus.connect(master);
    sfxBus.connect(master);
    // reverb
    verb = ac.createConvolver();
    const len = Math.floor(ac.sampleRate * 3.2);
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    verb.buffer = ir;
    const vg = ac.createGain();
    vg.gain.value = 0.5;
    verb.connect(vg);
    vg.connect(master);
    A.verb = verb;
    // noise
    whiteBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const w = whiteBuf.getChannelData(0);
    for (let i = 0; i < w.length; i++) w[i] = Math.random() * 2 - 1;
    brownBuf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
    const b = brownBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < b.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      b[i] = last * 3.5;
    }
    A.ok = true;
  };

  A.resume = function () {
    if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume().catch(() => {});
  };
  A.pauseAll = function () {
    if (A.ctx && A.ctx.state === 'running') A.ctx.suspend().catch(() => {});
  };
  A.setMuted = function (m) {
    A.muted = m;
    if (master && A.ctx) master.gain.setTargetAtTime(m ? 0 : A.vol, A.ctx.currentTime, 0.05);
  };

  /* ---------- building blocks ---------- */
  function env(g, t0, a, peak, d, sus, r, len) {
    g.gain.cancelScheduledValues(t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sus), t0 + a + d);
    g.gain.setValueAtTime(Math.max(0.0002, peak * sus), t0 + Math.max(a + d, len));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(a + d, len) + r);
  }
  function noiseSrc(brown) {
    const s = A.ctx.createBufferSource();
    s.buffer = brown ? brownBuf : whiteBuf;
    s.loop = true;
    return s;
  }
  function out(node, wet) {
    node.connect(sfxBus);
    if (wet) {
      const g = A.ctx.createGain();
      g.gain.value = wet;
      node.connect(g);
      g.connect(verb);
    }
  }
  function osc(type, f) {
    const o = A.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    return o;
  }

  /* ---------- sound effects ---------- */
  const SFX = {
    boom(t, v) {
      const ac = A.ctx;
      const o = osc('sine', 110);
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(32, t + 1.1);
      const g = ac.createGain();
      env(g, t, 0.01, 0.9 * v, 0.3, 0.4, 1.0, 0.2);
      o.connect(g);
      out(g, 0.3);
      o.start(t);
      o.stop(t + 1.6);
      const n = noiseSrc(true);
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 400;
      const g2 = ac.createGain();
      env(g2, t, 0.005, 0.7 * v, 0.2, 0.3, 1.2, 0.1);
      n.connect(f);
      f.connect(g2);
      out(g2, 0.4);
      n.start(t);
      n.stop(t + 1.6);
    },
    hit(t, v) {
      const ac = A.ctx;
      const n = noiseSrc(false);
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 900;
      f.Q.value = 0.8;
      const g = ac.createGain();
      env(g, t, 0.002, 0.8 * v, 0.06, 0.2, 0.12, 0.02);
      n.connect(f);
      f.connect(g);
      out(g, 0.15);
      n.start(t);
      n.stop(t + 0.3);
      const o = osc('sine', 90);
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.2);
      const g2 = ac.createGain();
      env(g2, t, 0.003, 0.9 * v, 0.1, 0.2, 0.15, 0.02);
      o.connect(g2);
      out(g2, 0.1);
      o.start(t);
      o.stop(t + 0.4);
    },
    slash(t, v) {
      const ac = A.ctx;
      const n = noiseSrc(false);
      const f = ac.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.setValueAtTime(4000, t);
      f.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      const g = ac.createGain();
      env(g, t, 0.01, 0.6 * v, 0.1, 0.3, 0.2, 0.05);
      n.connect(f);
      f.connect(g);
      out(g, 0.3);
      n.start(t);
      n.stop(t + 0.5);
      const o = osc('triangle', 1760);
      const g2 = ac.createGain();
      env(g2, t + 0.02, 0.002, 0.15 * v, 0.2, 0.2, 0.6, 0.05);
      o.connect(g2);
      out(g2, 0.5);
      o.start(t);
      o.stop(t + 1);
    },
    whoosh(t, v) {
      const ac = A.ctx;
      const n = noiseSrc(false);
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 1.5;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(2400, t + 0.45);
      const g = ac.createGain();
      env(g, t, 0.12, 0.5 * v, 0.2, 0.4, 0.25, 0.2);
      n.connect(f);
      f.connect(g);
      out(g, 0.2);
      n.start(t);
      n.stop(t + 0.9);
    },
    speed(t, v) {
      const ac = A.ctx;
      const o = osc('sine', 300);
      o.frequency.setValueAtTime(260, t);
      o.frequency.exponentialRampToValueAtTime(2600, t + 0.25);
      const g = ac.createGain();
      env(g, t, 0.02, 0.2 * v, 0.1, 0.3, 0.2, 0.05);
      o.connect(g);
      out(g, 0.4);
      o.start(t);
      o.stop(t + 0.6);
      SFX.whoosh(t, v * 0.7);
    },
    zap(t, v) {
      const ac = A.ctx;
      const o = osc('sawtooth', 900);
      o.frequency.setValueAtTime(1200, t);
      o.frequency.exponentialRampToValueAtTime(140, t + 0.3);
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 3000;
      const g = ac.createGain();
      env(g, t, 0.005, 0.25 * v, 0.1, 0.3, 0.2, 0.05);
      o.connect(f);
      f.connect(g);
      out(g, 0.3);
      o.start(t);
      o.stop(t + 0.6);
    },
    glitch(t, v) {
      const ac = A.ctx;
      for (let i = 0; i < 7; i++) {
        const tt = t + i * 0.045 + Math.random() * 0.02;
        const o = osc('square', 80 + Math.random() * 1400);
        const g = ac.createGain();
        env(g, tt, 0.001, 0.08 * v, 0.02, 0.5, 0.02, 0.02);
        o.connect(g);
        out(g, 0.05);
        o.start(tt);
        o.stop(tt + 0.08);
      }
      const n = noiseSrc(false);
      const g2 = ac.createGain();
      env(g2, t, 0.002, 0.12 * v, 0.05, 0.5, 0.05, 0.25);
      n.connect(g2);
      out(g2, 0);
      n.start(t);
      n.stop(t + 0.4);
    },
    erase(t, v) {
      const ac = A.ctx;
      const n = noiseSrc(false);
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(200, t);
      f.frequency.exponentialRampToValueAtTime(5000, t + 0.9);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5 * v, t + 0.9);
      g.gain.setValueAtTime(0.0001, t + 0.92);
      n.connect(f);
      f.connect(g);
      out(g, 0.6);
      n.start(t);
      n.stop(t + 1);
      const o = osc('sine', 60);
      o.frequency.setValueAtTime(90, t + 0.9);
      o.frequency.exponentialRampToValueAtTime(28, t + 2.2);
      const g2 = ac.createGain();
      env(g2, t + 0.9, 0.01, 0.5 * v, 0.3, 0.5, 1, 0.2);
      o.connect(g2);
      out(g2, 0.3);
      o.start(t + 0.9);
      o.stop(t + 2.6);
    },
    rumble(t, v) {
      const ac = A.ctx;
      const n = noiseSrc(true);
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 140;
      const g = ac.createGain();
      env(g, t, 0.4, 0.9 * v, 0.6, 0.6, 1.4, 1.2);
      n.connect(f);
      f.connect(g);
      out(g, 0.2);
      n.start(t);
      n.stop(t + 4);
    },
    thunder(t, v) {
      SFX.crack(t, v);
      SFX.rumble(t + 0.05, v);
    },
    crack(t, v) {
      const ac = A.ctx;
      const n = noiseSrc(false);
      const f = ac.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 1500;
      const g = ac.createGain();
      env(g, t, 0.001, 0.7 * v, 0.05, 0.2, 0.25, 0.01);
      n.connect(f);
      f.connect(g);
      out(g, 0.4);
      n.start(t);
      n.stop(t + 0.5);
    },
    chime(t, v) {
      const ac = A.ctx;
      [1320, 1980, 2640].forEach((fq, i) => {
        const o = osc('sine', fq);
        const g = ac.createGain();
        env(g, t + i * 0.06, 0.005, 0.12 * v, 0.3, 0.3, 1.4, 0.1);
        o.connect(g);
        out(g, 0.6);
        o.start(t + i * 0.06);
        o.stop(t + 2.2);
      });
    },
    bell(t, v, f0) {
      const ac = A.ctx;
      const base = f0 || 220;
      [1, 2.76, 5.4, 8.93].forEach((r, i) => {
        const o = osc('sine', base * r);
        const g = ac.createGain();
        env(g, t, 0.003, (0.25 / (i + 1)) * v, 0.5, 0.3, 3.5 - i * 0.6, 0.1);
        o.connect(g);
        out(g, 0.6);
        o.start(t);
        o.stop(t + 4.5);
      });
    },
    choir(t, v, root) {
      const ac = A.ctx;
      const r = root || 146.8;
      [1, 1.5, 2, 2.5198].forEach((k, i) => {
        const o = osc('sawtooth', r * k);
        o.detune.value = (i - 1.5) * 7;
        const f1 = ac.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.value = 700;
        f1.Q.value = 3;
        const f2 = ac.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.value = 1150;
        f2.Q.value = 4;
        const g = ac.createGain();
        env(g, t, 1.2, 0.12 * v, 0.8, 0.7, 1.6, 1.8);
        o.connect(f1);
        o.connect(f2);
        f1.connect(g);
        f2.connect(g);
        out(g, 0.8);
        o.start(t);
        o.stop(t + 5.5);
      });
    },
    heartbeat(t, v) {
      [0, 0.28].forEach((d, i) => {
        const o = osc('sine', 60);
        o.frequency.setValueAtTime(75, t + d);
        o.frequency.exponentialRampToValueAtTime(38, t + d + 0.15);
        const g = A.ctx.createGain();
        env(g, t + d, 0.005, (i ? 0.5 : 0.8) * v, 0.08, 0.2, 0.15, 0.02);
        o.connect(g);
        out(g, 0.05);
        o.start(t + d);
        o.stop(t + d + 0.4);
      });
    },
    roar(t, v) {
      const ac = A.ctx;
      const o = osc('sawtooth', 70);
      const lfo = osc('sine', 18);
      const lg = ac.createGain();
      lg.gain.value = 12;
      lfo.connect(lg);
      lg.connect(o.frequency);
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 700;
      const g = ac.createGain();
      env(g, t, 0.1, 0.45 * v, 0.3, 0.7, 0.8, 1.0);
      o.connect(f);
      f.connect(g);
      out(g, 0.4);
      o.start(t);
      lfo.start(t);
      o.stop(t + 2.2);
      lfo.stop(t + 2.2);
      SFX.rumble(t, v * 0.5);
    },
    shatter(t, v) {
      SFX.crack(t, v);
      for (let i = 0; i < 9; i++) {
        const tt = t + Math.random() * 0.25;
        const o = osc('sine', 2000 + Math.random() * 3000);
        const g = A.ctx.createGain();
        env(g, tt, 0.001, 0.08 * v, 0.1, 0.2, 0.3, 0.02);
        o.connect(g);
        out(g, 0.5);
        o.start(tt);
        o.stop(tt + 0.5);
      }
    },
    teleport(t, v) {
      const o = osc('sine', 200);
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(1400, t + 0.3);
      const g = A.ctx.createGain();
      env(g, t, 0.01, 0.2 * v, 0.1, 0.3, 0.4, 0.1);
      o.connect(g);
      out(g, 0.8);
      o.start(t);
      o.stop(t + 1);
    },
    swell(t, v) {
      const ac = A.ctx;
      const n = noiseSrc(false);
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(200, t);
      f.frequency.exponentialRampToValueAtTime(6000, t + 2.5);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35 * v, t + 2.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      n.connect(f);
      f.connect(g);
      out(g, 0.5);
      n.start(t);
      n.stop(t + 3);
    },
    silence() {},
  };
  A.SFX = SFX;

  A.play = function (name, v, arg) {
    if (!A.ok || A.muted || !SFX[name]) return;
    try {
      SFX[name](A.ctx.currentTime + 0.01, v == null ? 1 : v, arg);
    } catch (e) {
      /* ignore */
    }
  };

  /* ---------- music beds ---------- */
  const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const BEDS = {
    void: { drones: [33, 40], type: 'sine', gain: 0.5, noise: 0.08, cut: 300 },
    realm: { drones: [50, 57, 66, 74], type: 'sine', gain: 0.22, shimmer: [86, 93], cut: 2400 },
    council: { drones: [41, 48, 57, 60], type: 'sawtooth', gain: 0.07, cut: 900 },
    war: { drones: [33, 40, 45], type: 'sawtooth', gain: 0.06, cut: 500, pulse: { bpm: 92, low: 38 } },
    fate: { drones: [57, 64, 69], type: 'sine', gain: 0.16, shimmer: [81, 88, 93], cut: 3000, arp: { notes: [81, 84, 88, 91], step: 0.36, v: 0.05 } },
    rage: { drones: [30, 37], type: 'sawtooth', gain: 0.1, cut: 380, dist: true, pulse: { bpm: 120, low: 34 } },
    grief: { drones: [45, 52, 57], type: 'sine', gain: 0.18, cut: 1400, arp: { notes: [69, 72, 76, 74, 72, 67, 69, 64], step: 1.3, v: 0.12, bell: true } },
    dead: { drones: [38, 45, 50], type: 'sawtooth', gain: 0.06, cut: 700, choir: 50 },
    door: { drones: [43, 50, 55, 62], type: 'sine', gain: 0.2, shimmer: [79, 86], cut: 2600, rise: true },
    storm: { drones: [31, 38], type: 'sawtooth', gain: 0.07, cut: 320, noise: 0.25, pulse: { bpm: 70, low: 36 } },
    final: { drones: [38, 45, 50, 54, 57], type: 'sine', gain: 0.18, shimmer: [81, 86], cut: 3200, rise: true },
    epilogue: { drones: [48, 55, 60, 64], type: 'sine', gain: 0.15, cut: 1800, arp: { notes: [72, 76, 79, 84, 79, 76], step: 1.1, v: 0.08, bell: true } },
    none: { drones: [], gain: 0 },
  };
  A.BEDS = BEDS;

  function makeBed(name) {
    const ac = A.ctx;
    const r = BEDS[name] || BEDS.none;
    const bed = { name, nodes: [], out: ac.createGain(), r, next: ac.currentTime + 0.1, step: 0 };
    bed.out.gain.value = 0.0001;
    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = r.cut || 1200;
    filt.Q.value = 0.7;
    bed.filt = filt;
    let chain = filt;
    if (r.dist) {
      const ws = ac.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) {
        const x = (i / 1023) * 2 - 1;
        curve[i] = Math.tanh(x * 3.5);
      }
      ws.curve = curve;
      filt.connect(ws);
      chain = ws;
    }
    chain.connect(bed.out);
    bed.out.connect(musBus);
    const vg = ac.createGain();
    vg.gain.value = 0.35;
    bed.out.connect(vg);
    vg.connect(verb);
    const lfo = osc('sine', 0.07);
    const lg = ac.createGain();
    lg.gain.value = (r.cut || 1200) * 0.35;
    lfo.connect(lg);
    lg.connect(filt.frequency);
    lfo.start();
    bed.nodes.push(lfo);
    (r.drones || []).forEach((m, i) => {
      for (const det of [-6, 6]) {
        const o = osc(r.type || 'sine', NOTE(m));
        o.detune.value = det + i;
        const g = ac.createGain();
        g.gain.value = r.gain / Math.max(1, (r.drones || []).length) * 1.6;
        o.connect(g);
        g.connect(filt);
        o.start();
        if (r.rise) o.detune.linearRampToValueAtTime(det + 40, ac.currentTime + 40);
        bed.nodes.push(o);
      }
    });
    (r.shimmer || []).forEach((m, i) => {
      const o = osc('sine', NOTE(m));
      const g = ac.createGain();
      g.gain.value = 0.02;
      const trem = osc('sine', 0.3 + i * 0.17);
      const tg = ac.createGain();
      tg.gain.value = 0.018;
      trem.connect(tg);
      tg.connect(g.gain);
      o.connect(g);
      g.connect(bed.out);
      o.start();
      trem.start();
      bed.nodes.push(o, trem);
    });
    if (r.noise) {
      const n = noiseSrc(true);
      const g = ac.createGain();
      g.gain.value = r.noise;
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 260;
      n.connect(f);
      f.connect(g);
      g.connect(bed.out);
      n.start();
      bed.nodes.push(n);
    }
    if (r.choir) {
      [0, 7, 12, 15].forEach((k) => {
        const o = osc('sawtooth', NOTE(r.choir + k));
        o.detune.value = Math.random() * 10 - 5;
        const f1 = ac.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.value = 650;
        f1.Q.value = 3;
        const g = ac.createGain();
        g.gain.value = 0.05;
        o.connect(f1);
        f1.connect(g);
        g.connect(bed.out);
        o.start();
        bed.nodes.push(o);
      });
    }
    return bed;
  }

  function tickBed(bed) {
    const ac = A.ctx;
    const r = bed.r;
    const ahead = ac.currentTime + 0.25;
    if (r.pulse) {
      const spb = 60 / r.pulse.bpm;
      while (bed.next < ahead) {
        const t = bed.next;
        const o = osc('sine', NOTE(r.pulse.low) * 2);
        o.frequency.setValueAtTime(NOTE(r.pulse.low) * 2.2, t);
        o.frequency.exponentialRampToValueAtTime(NOTE(r.pulse.low), t + 0.18);
        const g = ac.createGain();
        env(g, t, 0.004, bed.step % 4 === 0 ? 0.35 : 0.18, 0.1, 0.2, 0.2, 0.02);
        o.connect(g);
        g.connect(bed.out);
        o.start(t);
        o.stop(t + 0.5);
        bed.step++;
        bed.next += spb;
      }
    } else if (r.arp) {
      while (bed.next < ahead) {
        const t = bed.next;
        const m = r.arp.notes[bed.step % r.arp.notes.length];
        if (r.arp.bell) {
          [1, 2.01].forEach((k, i) => {
            const o = osc('sine', NOTE(m) * k);
            const g = ac.createGain();
            env(g, t, 0.004, r.arp.v / (i + 1), 0.4, 0.3, 1.6, 0.05);
            o.connect(g);
            g.connect(bed.out);
            o.start(t);
            o.stop(t + 2.4);
          });
        } else {
          const o = osc('sine', NOTE(m));
          const g = ac.createGain();
          env(g, t, 0.01, r.arp.v, 0.2, 0.4, 0.4, 0.05);
          o.connect(g);
          g.connect(bed.out);
          o.start(t);
          o.stop(t + 1);
        }
        bed.step++;
        bed.next += r.arp.step;
      }
    } else bed.next = ahead;
  }

  function setBed(name) {
    if (!A.ok) return;
    name = name || 'none';
    if (A.bedName === name && A.bed) return;
    const ac = A.ctx;
    const old = A.bed;
    if (old) {
      old.out.gain.cancelScheduledValues(ac.currentTime);
      old.out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.8);
      setTimeout(() => {
        old.nodes.forEach((n) => {
          try {
            n.stop();
          } catch (e) {
            /* already stopped */
          }
        });
        try {
          old.out.disconnect();
        } catch (e) {
          /* ignore */
        }
      }, 4000);
    }
    A.bedName = name;
    if (name === 'none') {
      A.bed = null;
      return;
    }
    const bed = makeBed(name);
    bed.out.gain.setTargetAtTime(1, ac.currentTime, 1.2);
    A.bed = bed;
  }
  A.setBed = setBed;

  function musicAt(T) {
    const shot = UW.TL.find(T);
    if (!shot) return 'none';
    return shot.music || (shot.chapter && shot.chapter.music) || 'none';
  }

  A.seek = function (T) {
    if (!A.ok) return;
    setBed(musicAt(T));
  };

  A.update = function (prevT, T) {
    if (!A.ok || !A.ctx || A.ctx.state !== 'running') return;
    if (T - prevT > 1) {
      A.seek(T);
      return;
    }
    setBed(musicAt(T));
    if (A.bed) tickBed(A.bed);
    // fire sfx whose time falls within (prevT, T]
    const shots = UW.TL.shots;
    let s = UW.TL.find(prevT);
    let i = s ? s.index : 0;
    for (; i < shots.length; i++) {
      const sh = shots[i];
      if (sh.start > T) break;
      if (!sh.sfx) continue;
      for (const c of sh.sfx) {
        const gt = sh.start + c[0];
        if (gt > prevT && gt <= T) A.play(c[1], c[2] && c[2].v != null ? c[2].v : 1, c[2] && c[2].f);
      }
    }
  };
})();
