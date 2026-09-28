(function(){
  const c = document.getElementById('c');
  UW.R.fixedWidth = 1920;
  UW.R.init(c);
  const params = new URLSearchParams(location.search);
  const t = parseFloat(params.get('t') || '0.7');
  UW.R.begin('#000');
  const ctx = UW.R.screen();
  UW.PORT.backdrop(ctx, '#20222c', '#0a0b10', null);
  const list = (params.get('who') || 'chase,maeve,malevolor,jack,valorion,valor').split(',');
  const cols = Math.min(list.length, +(params.get('cols') || 6));
  const rows = Math.ceil(list.length / cols);
  const cw = 1920 / cols, ch = 1080 / rows;
  const dmg = params.get('dmg') ? JSON.parse(params.get('dmg')) : null;
  list.forEach((id, i) => {
    const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + ch * 0.42;
    ctx.save();
    ctx.beginPath(); ctx.rect((i % cols) * cw, Math.floor(i / cols) * ch, cw, ch); ctx.clip();
    if (id === 'unmaker') UW.PORT.unmaker(ctx, { x, y, s: ch * 0.5, t, eyes: 1, mouth: +(params.get('talk')||0) });
    else UW.PORT.draw(ctx, id, { x, y, s: ch * 0.5, t, expr: params.get('expr') || undefined, talk: +(params.get('talk')||0), eyeGlow: +(params.get('eg')||0), dmg, rim: params.get('rim') || null });
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.fillText(id, (i % cols) * cw + 10, Math.floor(i / cols) * ch + 24);
    ctx.restore();
  });
})();
