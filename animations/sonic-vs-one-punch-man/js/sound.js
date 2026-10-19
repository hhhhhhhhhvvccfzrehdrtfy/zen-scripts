'use strict';
/* Every sound is synthesized with Web Audio: effects from noise and oscillators, plus a small
   step-sequenced score whose mood follows the scene. Nothing is loaded from files. */

const Sound = (() => {
  let ac = null;
  let master = null;
  let sfxBus = null;
  let musBus = null;
  let noiseBuf = null;
  let on = true;
  let mus = { key: null, next: 0 };

  function init() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master = ac.createGain();
      master.gain.value = on ? 0.9 : 0;
      master.connect(comp);
      comp.connect(ac.destination);
      sfxBus = ac.createGain();
      sfxBus.gain.value = 0.75;
      sfxBus.connect(master);
      musBus = ac.createGain();
      musBus.gain.value = 0.3;
      musBus.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
    return true;
  }

  function setOn(v) {
    on = v;
    if (master) master.gain.setTargetAtTime(v ? 0.9 : 0, ac.currentTime, 0.04);
  }

  function tone(f, t0, dur, o = {}) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
    if (o.detune) osc.detune.value = o.detune;
    const v = o.vol ?? 0.3;
    const at = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + at);
    if (o.sustain) g.gain.setValueAtTime(v, t0 + dur * o.sustain);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let out = osc;
    if (o.lp) {
      const f2 = ac.createBiquadFilter();
      f2.type = 'lowpass';
      f2.frequency.value = o.lp;
      osc.connect(f2);
      out = f2;
    }
    out.connect(g);
    g.connect(o.bus || sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function hiss(t0, dur, o = {}) {
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.f0 ?? 1000, t0);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t0 + dur);
    f.Q.value = o.q ?? 1;
    const g = ac.createGain();
    const v = o.vol ?? 0.3;
    const at = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + at);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(o.bus || sfxBus);
    src.start(t0, Math.random() * 1.5);
    src.stop(t0 + dur + 0.05);
  }

  const SFX = {
    whoosh: (t) => hiss(t, 0.7, { f0: 300, f1: 2600, q: 1.4, vol: 0.4, attack: 0.22 }),
    zip: (t) => hiss(t, 0.35, { f0: 900, f1: 5200, q: 2, vol: 0.3, attack: 0.05 }),
    punch: (t) => {
      tone(150, t, 0.28, { f1: 42, vol: 0.8 });
      hiss(t, 0.14, { type: 'lowpass', f0: 3200, f1: 300, vol: 0.55 });
    },
    hit: (t) => {
      tone(240, t, 0.13, { f1: 90, vol: 0.45, type: 'triangle' });
      hiss(t, 0.07, { type: 'highpass', f0: 2000, vol: 0.28 });
    },
    boom: (t) => {
      tone(72, t, 2.2, { f1: 28, vol: 0.85 });
      hiss(t, 2.6, { type: 'lowpass', f0: 1400, f1: 60, vol: 0.75 });
    },
    bigboom: (t) => {
      tone(60, t, 3.5, { f1: 22, vol: 1 });
      tone(90, t, 2.5, { f1: 30, vol: 0.6, type: 'triangle' });
      hiss(t, 4, { type: 'lowpass', f0: 2400, f1: 50, vol: 0.9 });
    },
    thud: (t) => {
      tone(95, t, 0.3, { f1: 40, vol: 0.65 });
      hiss(t, 0.12, { type: 'lowpass', f0: 800, f1: 200, vol: 0.3 });
    },
    rumble: (t) => hiss(t, 2.2, { type: 'lowpass', f0: 220, f1: 120, vol: 0.55, attack: 0.35 }),
    ring: (t) => {
      tone(1568, t, 0.08, { type: 'square', vol: 0.06, lp: 5000 });
      tone(2093, t + 0.06, 0.32, { type: 'square', vol: 0.055, lp: 6000 });
    },
    pop: (t) => tone(620, t, 0.09, { f1: 980, vol: 0.12, type: 'triangle' }),
    skid: (t) => hiss(t, 0.7, { type: 'highpass', f0: 2600, f1: 1100, vol: 0.28 }),
    rev: (t) => {
      tone(70, t, 1.8, { type: 'sawtooth', f1: 700, vol: 0.13, lp: 2400, sustain: 0.8 });
      hiss(t, 1.8, { f0: 400, f1: 3000, q: 3, vol: 0.12, attack: 0.3 });
    },
    spring: (t) => tone(260, t, 0.45, { f1: 980, type: 'triangle', vol: 0.3 }),
    chime: (t, i = 0) => tone(523.25 * Math.pow(2, [0, 2, 4, 7, 9, 12, 16][i % 7] / 12), t, 0.9, { vol: 0.16 }),
    transform: (t) => {
      tone(110, t, 3, { type: 'sawtooth', f1: 880, vol: 0.12, lp: 3000, sustain: 0.7 });
      hiss(t, 3, { f0: 200, f1: 6000, q: 0.8, vol: 0.18, attack: 2 });
    },
    sparkle: (t) => [0, 0.07, 0.14, 0.21].forEach((d, i) => tone(2637 + i * 420, t + d, 0.18, { vol: 0.06 })),
    sneeze: (t) => {
      hiss(t, 0.5, { f0: 2200, f1: 600, q: 0.7, vol: 0.6, attack: 0.02 });
      tone(180, t, 0.35, { f1: 70, vol: 0.5, type: 'triangle' });
    },
    tick: (t) => tone(1800, t, 0.03, { type: 'square', vol: 0.05 }),
    beep: (t) => tone(1320, t, 0.09, { type: 'square', vol: 0.05, lp: 4000 }),
    twinkle: (t) => {
      tone(2349, t, 0.3, { vol: 0.09 });
      tone(3136, t + 0.1, 0.45, { vol: 0.07 });
    },
    fall: (t) => tone(1600, t, 2.6, { f1: 280, vol: 0.08 }),
    flick: (t) => {
      tone(900, t, 0.07, { f1: 200, type: 'triangle', vol: 0.35 });
      hiss(t, 0.05, { type: 'highpass', f0: 3000, vol: 0.3 });
    },
    wind: (t) => hiss(t, 3.5, { f0: 380, f1: 700, q: 0.7, vol: 0.16, attack: 1.2 }),
    grind: (t) => hiss(t, 1.8, { type: 'highpass', f0: 3000, f1: 5000, vol: 0.18, attack: 0.05 }),
    sting: (t) => {
      [146.8, 174.6, 220, 293.7].forEach((f) => tone(f, t, 2.4, { type: 'sawtooth', vol: 0.07, lp: 1800, sustain: 0.5 }));
      tone(73.4, t, 2.4, { vol: 0.4 });
    },
    boing: (t) => tone(200, t, 0.35, { f1: 520, type: 'square', vol: 0.06, lp: 2000 }),
    miss: (t) => hiss(t, 0.18, { f0: 1800, f1: 600, q: 2.5, vol: 0.22, attack: 0.03 }),
    spear: (t) => {
      tone(1400, t, 0.35, { f1: 300, type: 'sawtooth', vol: 0.07, lp: 5000 });
      hiss(t, 0.3, { type: 'highpass', f0: 4000, f1: 1500, vol: 0.12 });
    },
    chaos: (t) => {
      tone(220, t, 1.6, { f1: 1760, type: 'sine', vol: 0.2 });
      tone(330, t + 0.05, 1.6, { f1: 2640, type: 'triangle', vol: 0.08 });
      hiss(t, 1.4, { f0: 6000, f1: 300, q: 1.5, vol: 0.2, attack: 0.05 });
    },
    unfreeze: (t) => {
      tone(1760, t, 0.9, { f1: 220, type: 'sine', vol: 0.18 });
      hiss(t, 0.8, { f0: 300, f1: 6000, q: 1.2, vol: 0.18, attack: 0.3 });
    },
    clink: (t) => {
      tone(2637, t, 0.25, { vol: 0.12, type: 'triangle' });
      tone(3520, t + 0.03, 0.3, { vol: 0.08 });
    },
    snap: (t) => {
      hiss(t, 0.06, { type: 'highpass', f0: 2500, vol: 0.45 });
      tone(500, t, 0.08, { f1: 120, type: 'square', vol: 0.12, lp: 2500 });
    },
    jet: (t) => hiss(t, 0.9, { f0: 500, f1: 1400, q: 0.8, vol: 0.22, attack: 0.1 }),
    poke: (t) => tone(880, t, 0.12, { f1: 1320, type: 'triangle', vol: 0.18 }),
    growl: (t) => tone(70, t, 1.1, { f1: 55, type: 'sawtooth', vol: 0.14, lp: 300, sustain: 0.6 }),
    whirl: (t) => hiss(t, 1.2, { f0: 600, f1: 2200, q: 4, vol: 0.2, attack: 0.2 }),
    pff: (t) => hiss(t, 0.35, { f0: 900, f1: 400, q: 0.8, vol: 0.25, attack: 0.02 }),
    charge: (t) => {
      tone(55, t, 2.6, { f1: 220, type: 'sawtooth', vol: 0.16, lp: 900, sustain: 0.8 });
      hiss(t, 2.6, { type: 'lowpass', f0: 300, f1: 1800, vol: 0.22, attack: 1.2 });
    },
  };

  function play(name, arg) {
    if (!ac || !on || !SFX[name]) return;
    SFX[name](ac.currentTime + 0.01, arg);
  }

  /* ---------- score ---------- */

  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const kick = (t, v = 0.55) => tone(130, t, 0.22, { f1: 45, vol: v, bus: musBus });
  const snare = (t, v = 0.28) => hiss(t, 0.14, { f0: 1800, q: 0.8, vol: v, bus: musBus });
  const hat = (t, v = 0.08) => hiss(t, 0.04, { type: 'highpass', f0: 7000, vol: v, bus: musBus });
  const bass = (n, t, d, v = 0.32, type = 'triangle') => tone(NOTE(n), t, d, { type, vol: v, bus: musBus, sustain: 0.6 });
  const lead = (n, t, d, v = 0.1, type = 'square') => tone(NOTE(n), t, d, { type, vol: v, bus: musBus, lp: 3200, sustain: 0.5 });
  const pad = (ns, t, d, v = 0.05) => ns.forEach((n) => tone(NOTE(n), t, d, { type: 'sawtooth', vol: v, bus: musBus, lp: 1400, attack: 0.25, sustain: 0.7 }));

  // Each mood: bpm, and step(i, t, sd) scheduling one sixteenth note at audio time t.
  const MOODS = {
    calm: {
      bpm: 92,
      step(i, t, sd) {
        const bar = Math.floor(i / 16) % 4;
        const roots = [48, 45, 41, 43];
        const r = roots[bar];
        if (i % 16 === 0) bass(r, t, sd * 14, 0.25);
        if (i % 8 === 4) hat(t, 0.05);
        const mel = [72, null, 76, null, 79, null, 76, 74, null, 72, null, 69, null, 72, null, null];
        const m = mel[i % 16];
        if (m && (bar !== 3 || i % 16 < 8)) tone(NOTE(m + (bar === 1 ? -3 : bar === 2 ? -7 : 0)), t, sd * 3, { type: 'triangle', vol: 0.08, bus: musBus });
      },
    },
    speed: {
      bpm: 152,
      step(i, t, sd) {
        const bar = Math.floor(i / 16) % 4;
        const roots = [48, 44, 46, 48];
        const chord = [[0, 4, 7], [0, 4, 7], [0, 4, 7], [0, 4, 7]][bar];
        const r = roots[bar];
        if (i % 2 === 0) bass(r + (i % 4 === 2 ? 12 : 0), t, sd * 1.8, 0.3);
        if (i % 8 === 0) kick(t);
        if (i % 8 === 4) snare(t);
        hat(t, i % 2 ? 0.05 : 0.08);
        const arp = r + 24 + chord[i % 3] + (i % 6 >= 3 ? 12 : 0);
        lead(arp, t, sd * 0.9, 0.05);
        const mel = [0, null, 4, 7, null, 12, null, 11, null, 7, null, 4, 5, null, 7, null];
        const m = mel[i % 16];
        if (m !== null && bar % 2 === 0) lead(r + 24 + m, t, sd * 1.6, 0.07, 'triangle');
      },
    },
    tension: {
      bpm: 72,
      step(i, t, sd) {
        if (i % 32 === 0) pad([38, 45, 50], t, sd * 31, 0.05);
        if (i % 8 === 0) kick(t, 0.4);
        if (i % 8 === 2) kick(t, 0.2);
        if (i % 16 === 12) tone(NOTE(86), t, 0.6, { vol: 0.04, bus: musBus });
      },
    },
    fight: {
      bpm: 164,
      step(i, t, sd) {
        const bar = Math.floor(i / 16) % 4;
        const roots = [45, 41, 43, 40];
        const r = roots[bar];
        if (i % 2 === 0) bass(r + (i % 8 === 6 ? 12 : 0), t, sd * 1.7, 0.32, 'sawtooth');
        if (i % 4 === 0) kick(t);
        if (i % 8 === 4) snare(t, 0.32);
        hat(t);
        const stab = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0][i % 16];
        if (stab) [0, 3, 7].forEach((d) => lead(r + 24 + d, t, sd * 0.8, 0.035));
      },
    },
    epic: {
      bpm: 138,
      step(i, t, sd) {
        const bar = Math.floor(i / 16) % 4;
        const roots = [50, 46, 48, 45];
        const r = roots[bar];
        if (i % 16 === 0) pad([r + 12, r + 15 + (bar === 3 ? 1 : 0), r + 19, r + 24], t, sd * 16, 0.04);
        if (i % 4 === 0) bass(r - 12, t, sd * 3.5, 0.35);
        if (i % 8 === 0) kick(t, 0.7);
        if (i % 16 === 8) snare(t, 0.4);
        if (i % 16 === 14 || i % 16 === 15) tone(NOTE(r - 5), t, 0.2, { f1: NOTE(r - 17), vol: 0.3, bus: musBus });
        const mel = [12, null, null, 15, null, null, 19, null, 17, null, 15, null, 14, null, null, null];
        const m = mel[i % 16];
        if (m !== null) lead(r + 12 + m, t, sd * 2.5, 0.06, 'sawtooth');
      },
    },
    rival: {
      bpm: 150,
      step(i, t, sd) {
        const bar = Math.floor(i / 16) % 4;
        const roots = [40, 40, 43, 38];
        const r = roots[bar];
        if (i % 2 === 0) bass(r + (i % 16 === 10 ? 3 : 0), t, sd * 1.7, 0.33, 'sawtooth');
        if (i % 4 === 0) kick(t, 0.6);
        if (i % 8 === 4) snare(t, 0.34);
        if (i % 2) hat(t, 0.06);
        const riff = [0, null, 3, null, 5, 6, null, 5, 3, null, 0, null, 10, null, 7, null];
        const m = riff[i % 16];
        if (m !== null) lead(r + 24 + m, t, sd * 1.3, 0.05, 'sawtooth');
        if (i % 32 === 0) pad([r + 12, r + 15, r + 19], t, sd * 32, 0.03);
      },
    },
    happy: {
      bpm: 112,
      step(i, t, sd) {
        const bar = Math.floor(i / 16) % 4;
        const roots = [48, 43, 45, 41];
        const tri = [[0, 4, 7], [0, 4, 7], [0, 3, 7], [0, 4, 7]][bar];
        const r = roots[bar];
        if (i % 4 === 0) bass(r + (i % 8 === 4 ? 7 : 0), t, sd * 2.5, 0.28);
        if (i % 8 === 0) kick(t, 0.35);
        if (i % 8 === 4) snare(t, 0.15);
        if (i % 2 === 0) hat(t, 0.05);
        if (i % 4 === 2) tri.forEach((d) => lead(r + 24 + d, t, sd * 1.2, 0.025));
        const mel = [12, null, 16, null, 19, null, 16, null, 21, null, 19, 16, null, 14, null, null];
        const m = mel[i % 16];
        if (m !== null) lead(r + 12 + m - (bar === 2 ? 3 : 0), t, sd * 1.8, 0.06, 'triangle');
      },
    },
  };

  // Called every frame while playing. seg: { key, mood, start } for the current music segment.
  function music(seg, T, jumped) {
    if (!ac || !on) return;
    if (!seg || !MOODS[seg.mood]) {
      mus.key = null;
      return;
    }
    const m = MOODS[seg.mood];
    const sd = 60 / m.bpm / 4;
    if (seg.key !== mus.key || jumped) {
      mus.key = seg.key;
      mus.next = Math.max(0, Math.ceil((T - seg.start) / sd));
    }
    const ahead = T + 0.15;
    let guard = 0;
    while (seg.start + mus.next * sd < ahead && guard++ < 64) {
      const tt = seg.start + mus.next * sd;
      if (tt >= T - 0.03) m.step(mus.next, ac.currentTime + Math.max(0, tt - T) + 0.02, sd);
      mus.next++;
    }
  }

  function reset() {
    mus.key = null;
  }

  return { init, play, music, reset, setOn, isOn: () => on, ready: () => !!ac };
})();
