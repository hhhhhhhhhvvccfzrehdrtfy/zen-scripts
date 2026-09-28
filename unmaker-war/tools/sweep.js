(async function(){
  const params = new URLSearchParams(location.search);
  const c = document.getElementById('c');
  UW.R.fixedWidth = +(params.get('w') || 1920);
  UW.R.init(c);
  UW.TL.build();
  await new Promise(r => setTimeout(r, 300));
  const rels = [0.02, 0.25, 0.5, 0.75, 0.98];
  const out = [];
  const times = [];
  const origErr = console.error;
  let errs = [];
  console.error = function(){ errs.push([...arguments].join(' ')); origErr.apply(console, arguments); };
  for (let pass = 0; pass < 2; pass++) { if (pass === 1) times.length = 0;
  UW.TL.shots.forEach((s, i) => {
    let worst = 0;
    for (const r of rels) {
      const T = s.start + s.dur * r;
      UW.TL._warned = false;
      const t0 = performance.now();
      UW.TL.render(T, {});
      UW.R.ctx.getImageData(0, 0, 1, 1);
      const dt = performance.now() - t0;
      worst = Math.max(worst, dt);
    }
    times.push([i, worst]);
  });
  }
  times.sort((a, b) => b[1] - a[1]);
  document.title = JSON.stringify({ total: UW.TL.total, errs: errs.slice(0, 10), slowest: times.slice(0, 12).map(([i, ms]) => i + ':' + ms.toFixed(0) + 'ms'), median: times[Math.floor(times.length/2)][1].toFixed(1) });
  window.__done = true;
})();
