(function(){
  const c = document.getElementById('c');
  UW.R.fixedWidth = 1920;
  UW.R.init(c);
  const params = new URLSearchParams(location.search);
  const mode = params.get('m') || 'lineup';
  const t = parseFloat(params.get('t') || '0.5');
  const zoom = parseFloat(params.get('z') || '1');
  UW.R.begin('#2b2f3a');
  const ctx = UW.R.world(1);
  UW.R.setCam(0, -150, zoom);
  UW.R.world(1);
  // floor
  ctx.fillStyle = '#3a3f4c'; ctx.fillRect(-3000, 0, 6000, 800);
  ctx.strokeStyle='#555'; ctx.beginPath(); ctx.moveTo(-3000,0); ctx.lineTo(3000,0); ctx.stroke();
  // height marks per foot
  ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='14px sans-serif';
  for (let f=0; f<=9; f++){ ctx.fillRect(-940, -f*UW.FT, 1880, 1); ctx.fillText(f+"'", -935, -f*UW.FT-3); }
  const list = (params.get('who') || 'chase,maeve,malevolor,jack').split(',');
  const poses = (params.get('poses') || 'idle').split(',');
  const dmg = params.get('dmg') ? JSON.parse(params.get('dmg')) : null;
  let x = -700;
  const step = 1400 / Math.max(1, list.length*poses.length - 1);
  for (const who of list) for (const p of poses) {
    const spec = UW.C[who];
    const face = params.get('face') ? +params.get('face') : 1;
    UW.RIG.draw(ctx, spec, { x, y: 0, face, pose: p, t, dmg, glow: +(params.get('glow')||0), eyeGlow: +(params.get('eg')||0), expr: params.get('expr')||undefined, vx: +(params.get('vx')||0) });
    ctx.fillStyle='#fff'; ctx.font='16px sans-serif'; ctx.fillText(who+':'+p, x-40, 40);
    x += step;
  }
  window.__done = true;
})();
