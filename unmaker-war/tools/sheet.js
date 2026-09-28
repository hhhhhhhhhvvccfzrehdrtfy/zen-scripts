(async function(){
  const params = new URLSearchParams(location.search);
  const c = document.getElementById('c');
  UW.R.fixedWidth = 1920;
  UW.R.init(c);
  UW.TL.build();
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch(e) {}
  let times;
  if (params.get('shots')) {
    // sample each shot in a range at a relative position
    const [a, b] = params.get('shots').split('-').map(Number);
    const rel = +(params.get('rel') || 0.6);
    times = [];
    for (let i = a; i <= Math.min(b, UW.TL.shots.length - 1); i++) times.push(UW.TL.shots[i].start + UW.TL.shots[i].dur * rel);
  } else times = (params.get('times') || '1').split(',').map(Number);
  const cols = +(params.get('cols') || 4);
  const cw = 480, ch = 270;
  const rows = Math.ceil(times.length / cols);
  const sheet = document.getElementById('sheet');
  sheet.width = cw * cols; sheet.height = ch * rows;
  const sg = sheet.getContext('2d');
  sg.fillStyle = '#222'; sg.fillRect(0, 0, sheet.width, sheet.height);
  times.forEach((T, i) => {
    const shot = UW.TL.render(T, { captions: params.get('cc') !== '0' });
    sg.drawImage(c, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch);
    sg.fillStyle = 'rgba(0,0,0,0.6)'; sg.fillRect((i % cols) * cw, Math.floor(i / cols) * ch, 170, 20);
    sg.fillStyle = '#fff'; sg.font = '13px monospace';
    sg.fillText('#' + shot.index + ' T=' + T.toFixed(1), (i % cols) * cw + 4, Math.floor(i / cols) * ch + 14);
  });
  c.style.display = 'none';
  document.title = 'total=' + UW.TL.total.toFixed(1) + ' shots=' + UW.TL.shots.length;
  window.__done = true;
})();
