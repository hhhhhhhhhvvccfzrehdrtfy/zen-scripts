'use strict';
/* Playback: builds the timeline from SCENES, runs the render loop, fires sound cues, and wires the controls. */

(function () {
  let acc = 0;
  for (const s of SCENES) {
    s.start = acc;
    acc += s.dur;
  }
  const TOTAL = acc;
  const posterScene = SCENES.find((s) => s.poster != null);
  const POSTER = posterScene ? posterScene.start + posterScene.poster : 9;

  const CUES = [];
  const MUSIC = [];
  for (const s of SCENES) {
    for (const [t, name, arg] of s.cues) CUES.push({ t: s.start + t, name, arg });
    for (const L of s.lines) CUES.push({ t: s.start + L[0], name: 'pop' });
    for (const [t, mood] of s.music) MUSIC.push({ start: s.start + t, mood, key: MUSIC.length });
  }
  CUES.sort((a, b) => a.t - b.t);

  const sceneIndexAt = (T) => {
    for (let i = SCENES.length - 1; i >= 0; i--) if (T >= SCENES[i].start) return i;
    return 0;
  };
  const musicAt = (T) => {
    let m = null;
    for (const seg of MUSIC) {
      if (seg.start <= T) m = seg;
      else break;
    }
    return m;
  };

  const $ = (id) => document.getElementById(id);
  const canvas = $('screen');
  const ctx = canvas.getContext('2d');
  const stage = $('stage');
  const playBtn = $('play');
  const bigPlay = $('bigplay');
  const bigWrap = $('bigplay-wrap');
  const scrub = $('scrub');
  const timeEl = $('time');
  const soundBtn = $('sound');
  const fullBtn = $('full');
  const chapterList = $('chapters');
  const ticks = $('ticks');
  const endCard = $('endcard');

  let T = 0;
  let playing = false;
  let started = false;
  let last = null;
  let dirty = true;
  let scale = 1;

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || W;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(((w * 9) / 16) * dpr));
    scale = canvas.width / W;
    dirty = true;
  }

  function render(t) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const s = SCENES[sceneIndexAt(t)];
    const lt = t - s.start;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();
    s.draw(ctx, lt, s);
    ctx.restore();
    const fi = s.fadeIn > 0 ? 1 - clamp(lt / s.fadeIn) : 0;
    const fo = s.fadeOut > 0 ? 1 - clamp((s.dur - lt) / s.fadeOut) : 0;
    if (fi > 0) {
      ctx.globalAlpha = fi;
      ctx.fillStyle = s.fadeInColor;
      ctx.fillRect(0, 0, W, H);
    }
    if (fo > 0) {
      ctx.globalAlpha = fo;
      ctx.fillStyle = s.fadeOutColor;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }

  function fire(a, b) {
    for (const c of CUES) {
      if (c.t > b) break;
      if (c.t > a) Sound.play(c.name, c.arg);
    }
  }

  function updateUI() {
    timeEl.textContent = `${fmt(T)} / ${fmt(TOTAL)}`;
    scrub.value = String(T);
    scrub.style.setProperty('--p', `${(T / TOTAL) * 100}%`);
    const idx = sceneIndexAt(T);
    chapterList.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === idx));
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    playBtn.classList.toggle('is-playing', playing);
  }

  function tick(now) {
    if (playing) {
      const dt = last == null ? 0 : Math.min(0.1, (now - last) / 1000);
      const prev = T;
      T = Math.min(TOTAL, T + dt);
      fire(prev, T);
      Sound.music(musicAt(T), T, false);
      if (T >= TOTAL) {
        playing = false;
        endCard.hidden = false;
      }
      dirty = true;
      updateUI();
    }
    last = now;
    if (dirty) {
      render(started || T > 0 ? T : POSTER);
      dirty = false;
    }
    requestAnimationFrame(tick);
  }

  function play() {
    Sound.init();
    if (T >= TOTAL) T = 0;
    started = true;
    playing = true;
    last = null;
    bigWrap.hidden = true;
    endCard.hidden = true;
    Sound.reset();
    updateUI();
  }

  function pause() {
    playing = false;
    updateUI();
  }

  function toggle() {
    if (playing) pause();
    else play();
  }

  function seek(t) {
    T = clamp(t, 0, TOTAL);
    started = true;
    if (T > 0) bigWrap.hidden = true;
    endCard.hidden = T < TOTAL;
    Sound.reset();
    dirty = true;
    updateUI();
  }

  // chapters and scrubber ticks
  SCENES.forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="num">${i + 1}</span><span class="nm"></span><span class="tc">${fmt(s.start)}</span>`;
    b.querySelector('.nm').textContent = s.name;
    b.addEventListener('click', () => {
      seek(s.start + 0.01);
      play();
    });
    li.appendChild(b);
    chapterList.appendChild(li);
    if (i > 0) {
      const tk = document.createElement('span');
      tk.style.left = `${(s.start / TOTAL) * 100}%`;
      ticks.appendChild(tk);
    }
  });

  scrub.max = String(TOTAL);
  scrub.addEventListener('input', () => seek(parseFloat(scrub.value)));
  playBtn.addEventListener('click', toggle);
  bigPlay.addEventListener('click', play);
  $('replay').addEventListener('click', () => {
    seek(0);
    play();
  });
  canvas.addEventListener('click', () => {
    if (started) toggle();
    else play();
  });
  soundBtn.addEventListener('click', () => {
    Sound.setOn(!Sound.isOn());
    soundBtn.classList.toggle('muted', !Sound.isOn());
    soundBtn.setAttribute('aria-label', Sound.isOn() ? 'Mute sound' : 'Turn sound on');
  });
  fullBtn.addEventListener('click', () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
    } catch (e) {
      /* fullscreen is optional */
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') && e.key === ' ') return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight') seek(T + 5);
    else if (e.key === 'ArrowLeft') seek(T - 5);
    else if (e.key === 'm') soundBtn.click();
    else if (e.key === 'f') fullBtn.click();
  });
  document.addEventListener('fullscreenchange', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize);

  window.claude?.hot?.snapshot?.(() => ({ t: T }));

  function boot(data) {
    buildWorld();
    if (typeof buildWorld2 === 'function') buildWorld2();
    resize();
    if (data && data.t > 0) seek(data.t);
    $('dur').textContent = fmt(TOTAL);
    updateUI();
    requestAnimationFrame(tick);
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load(`400 40px ${FONT_D}`),
        document.fonts.load(`700 27px ${FONT_T}`),
      ])
        .then(() => (dirty = true))
        .catch(() => {});
    }
  }

  // For frame checks from tests: render any time without playing.
  window.SVOPM = { total: TOTAL, scenes: SCENES, frame: (t) => { T = t; started = true; render(t); } };

  if (window.claude?.hot?.ready) window.claude.hot.ready(boot);
  else boot(window.claude?.hot?.data ?? {});
})();
