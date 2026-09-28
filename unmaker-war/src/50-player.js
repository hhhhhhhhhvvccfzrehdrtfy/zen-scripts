/* The Unmaker War — player: playback loop, scrubbing, chapters, captions, sound, fullscreen, keys. */
(function () {
  'use strict';
  const UW = window.UW;
  const $ = (id) => document.getElementById(id);

  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    const m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem('uw.' + k);
      localStorage.setItem('uw.' + k, v);
    } catch (e) {
      return null;
    }
    return null;
  }

  function boot() {
    const canvas = $('film');
    const screen = $('screen');
    UW.R.init(canvas);
    UW.TL.build();
    const total = UW.TL.total;
    let T = 0, playing = false, speed = 1, last = 0, dirty = true;
    let captions = store('cc') !== '0';
    let muted = store('mute') === '1';
    const seek = $('seek');
    const play = $('play');
    const big = $('bigplay');
    const timeEl = $('time');
    const chapEl = $('chapnow');
    seek.max = String(Math.round(total * 10));

    // chapter list + ticks
    const list = $('chapters');
    const ticks = $('ticks');
    UW.TL.chapters.forEach((c, i) => {
      if (c.hidden) return;
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chap';
      b.innerHTML = '<span class="cn"></span><span class="ct"></span><span class="cs"></span><span class="cd"></span>';
      b.querySelector('.cn').textContent = c.num || '';
      b.querySelector('.ct').textContent = c.title;
      b.querySelector('.cs').textContent = c.sub || '';
      b.querySelector('.cd').textContent = fmt(c.start);
      b.addEventListener('click', () => {
        go(c.start + 0.01);
        if (!playing) setPlaying(true);
        screen.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      c._btn = b;
      li.appendChild(b);
      list.appendChild(li);
      if (i > 0) {
        const tk = document.createElement('span');
        tk.className = 'tick';
        tk.style.left = (c.start / total) * 100 + '%';
        ticks.appendChild(tk);
      }
    });

    let started = false;
    function setPlaying(p) {
      if (p) started = true;
      playing = p;
      play.textContent = p ? 'Pause' : 'Play';
      play.setAttribute('aria-label', p ? 'Pause' : 'Play');
      big.hidden = p || T > 0.5;
      if (p) {
        last = performance.now();
        if (UW.A) {
          UW.A.init();
          UW.A.setMuted(muted);
          UW.A.resume();
        }
        if (T >= total - 0.05) go(0);
      } else if (UW.A) UW.A.pauseAll();
    }
    function go(t) {
      T = Math.max(0, Math.min(total - 0.001, t));
      if (UW.A) UW.A.seek(T);
      dirty = true;
    }
    function updateUI() {
      seek.value = String(Math.round(T * 10));
      seek.style.setProperty('--p', (T / total) * 100 + '%');
      timeEl.textContent = fmt(T) + ' / ' + fmt(total);
      const c = UW.TL.chapterAt(T);
      if (c && chapEl.textContent !== (c.num ? c.num + ' · ' : '') + c.title) {
        chapEl.textContent = (c.num ? c.num + ' · ' : '') + c.title;
        UW.TL.chapters.forEach((x) => x._btn && x._btn.classList.toggle('on', x === c));
      }
    }

    // adaptive quality: watch the real frame interval while playing (it includes rasterization)
    let acc = 0, frames = 0, lastAdj = 0;
    function perf(interval, now) {
      if (interval > 250) return; // tab switch or stall
      acc += interval;
      frames++;
      if (now - lastAdj > 1500 && frames > 30) {
        const avg = acc / frames;
        const q = UW.R.quality;
        if (avg > 30) {
          if (q > 0.55) {
            UW.R.quality = Math.max(0.5, q - 0.15);
            UW.R.resize(true);
          } else UW.LITE = true;
        } else if (avg < 19) {
          if (UW.LITE) UW.LITE = false;
          else if (q < 1) {
            UW.R.quality = Math.min(1, q + 0.1);
            UW.R.resize(true);
          }
        }
        acc = 0;
        frames = 0;
        lastAdj = now;
      }
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (playing) {
        const interval = now - last;
        const dt = Math.min(0.1, interval / 1000);
        last = now;
        perf(interval, now);
        const prev = T;
        T += dt * speed;
        if (T >= total - 0.001) {
          T = total - 0.001;
          setPlaying(false);
        }
        if (UW.A) UW.A.update(prev, T);
        dirty = true;
      }
      if (dirty) {
        UW.TL.render(T, { captions });
        updateUI();
        dirty = false;
      }
    }

    // controls
    play.addEventListener('click', () => setPlaying(!playing));
    big.addEventListener('click', () => {
      if (!started) go(0);
      setPlaying(true);
    });
    canvas.addEventListener('click', () => setPlaying(!playing));
    seek.addEventListener('input', () => {
      go(+seek.value / 10);
      big.hidden = true;
    });
    const cc = $('cc');
    const syncCC = () => {
      cc.setAttribute('aria-pressed', captions ? 'true' : 'false');
      cc.textContent = captions ? 'Captions on' : 'Captions off';
    };
    syncCC();
    cc.addEventListener('click', () => {
      captions = !captions;
      store('cc', captions ? '1' : '0');
      syncCC();
      dirty = true;
    });
    const snd = $('snd');
    const syncSnd = () => {
      snd.setAttribute('aria-pressed', muted ? 'false' : 'true');
      snd.textContent = muted ? 'Sound off' : 'Sound on';
    };
    syncSnd();
    snd.addEventListener('click', () => {
      muted = !muted;
      store('mute', muted ? '1' : '0');
      if (UW.A) {
        UW.A.init();
        UW.A.setMuted(muted);
        if (playing) UW.A.resume();
      }
      syncSnd();
    });
    const sp = $('speed');
    sp.addEventListener('change', () => {
      speed = +sp.value;
    });
    const fs = $('fs');
    fs.addEventListener('click', () => {
      const el = screen;
      const doc = document;
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
      } else {
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) {
          const p = req.call(el);
          if (p && p.catch) p.catch(() => {});
        }
      }
    });
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        UW.R.resize(true);
        dirty = true;
      }, 60);
    });

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
        if (e.key !== ' ') return;
      }
      const k = e.key;
      if (k === ' ' || k === 'k') {
        e.preventDefault();
        setPlaying(!playing);
      } else if (k === 'ArrowRight') go(T + 5);
      else if (k === 'ArrowLeft') go(T - 5);
      else if (k === 'l') go(T + 10);
      else if (k === 'j') go(T - 10);
      else if (k === '.') go(T + 1 / 30);
      else if (k === ',') go(T - 1 / 30);
      else if (k === ']' || k === '[') {
        const cs = UW.TL.chapters.filter((c) => !c.hidden);
        let i = cs.indexOf(UW.TL.chapterAt(T));
        i = k === ']' ? Math.min(cs.length - 1, i + 1) : T - cs[i].start > 2 ? i : Math.max(0, i - 1);
        go(cs[i].start + 0.01);
      } else if (k === 'c') cc.click();
      else if (k === 'm') snd.click();
      else if (k === 'f') fs.click();
    });

    let rs = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rs);
      rs = setTimeout(() => {
        UW.R.resize();
        dirty = true;
      }, 80);
    });
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        UW.R.resize();
        dirty = true;
      }).observe(canvas);
    }

    // deep link: #ch3 (bare token)
    const h = (location.hash || '').replace('#', '');
    const m = h.match(/^ch(\d+)$/);
    if (m) {
      const c = UW.TL.chapters.filter((x) => !x.hidden)[+m[1] - 1];
      if (c) go(c.start + 0.01);
    } else {
      // poster frame: the title card
      const title = UW.TL.shots.find((sh) => sh.poster);
      go(title ? title.start + 2.4 : 2.4);
    }
    big.hidden = false;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => (dirty = true));
    requestAnimationFrame(frame);
    UW.player = { go, setPlaying, get T() { return T; }, get playing() { return playing; } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
