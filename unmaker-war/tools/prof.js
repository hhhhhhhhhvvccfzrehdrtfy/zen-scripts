(async function(){
  const params = new URLSearchParams(location.search);
  const c = document.getElementById('c');
  UW.R.fixedWidth = 1920;
  UW.R.init(c);
  UW.TL.build();
  await new Promise(r => setTimeout(r, 200));
  const idx = (params.get('shots') || '84').split(',').map(Number);
  const off = (params.get('off') || '').split(',');
  if (off.includes('grain')) UW.R.grain = () => {};
  if (off.includes('vig')) UW.R.vignette = () => {};
  if (off.includes('desat')) UW.R.desat = () => {};
  if (off.includes('caps')) UW.TL.drawCaptions = () => {};
  if (params.get('lite')) UW.LITE = true;
  if (params.get('w')) { UW.R.fixedWidth = +params.get('w'); UW.R.resize(true); }
  const res = {};
  for (const i of idx) {
    const s = UW.TL.shots[i];
    const row = [];
    for (let pass = 0; pass < 2; pass++) {
      for (let k = 0; k < 12; k++) {
        const T = s.start + s.dur * (k + 0.5) / 12;
        const t0 = performance.now();
        UW.TL.render(T, {});
        UW.R.ctx.getImageData(0, 0, 1, 1);
        const dt = performance.now() - t0;
        if (pass === 1) row.push(Math.round(dt) + (performance.memory ? '/' + Math.round(performance.memory.usedJSHeapSize / 1e6) : ''));
      }
    }
    res[i] = row.join(' ');
  }
  document.title = JSON.stringify(res);
  window.__done = true;
})();
