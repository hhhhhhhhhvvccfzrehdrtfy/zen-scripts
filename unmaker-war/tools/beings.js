(function(){
  const c = document.getElementById('c');
  UW.R.fixedWidth = 1920;
  UW.R.init(c);
  const params = new URLSearchParams(location.search);
  const t = parseFloat(params.get('t') || '1.3');
  const scene = params.get('s') || 'a';
  UW.R.begin('#000');
  const S = UW.TL.makeS({dur:10}, t, t);
  if (scene === 'a') {
    S.cam(0, -300, 1);
    UW.BG.battlefield(S, { mood: params.get('mood') || 'fire' });
    const ctx = S.world(1);
    UW.UNM.draw(ctx, { x: -500, y: 0, t, eyes: 1, mouth: 0.4, form: params.get('form') || 'humanoid' });
    S.actor('chase', { x: 100, y: 0, face: -1, pose: 'stance', dmg: {wear:0.3, blood:0.2} });
    S.actor('guardian', { x: 600, y: 0, face: -1, pose: 'idle', scale: 1.4 });
    UW.UNM.soldier(ctx, { x: -150, y: 0, t, seed: 3 });
    UW.UNM.soldier(ctx, { x: -250, y: 0, t, seed: 7, face: 1 });
    S.actor('valorion', { x: 350, y: 0, face: -1, pose: 'cast' });
  } else if (scene === 'b') {
    S.cam(0, -380, 0.8);
    UW.BG.judgesHall(S, {});
    const ctx = S.world(1);
    UW.BEINGS.judge(ctx, { x: -600, y: 0, t, h: 900 });
    UW.BEINGS.warden(ctx, { x: 0, y: 0, t, h: 380 });
    UW.BEINGS.ferryman(ctx, { x: 400, y: 0, t, h: 320, boat: true });
    UW.BEINGS.valorionTrue(ctx, { x: 700, y: -500, t, s: 400 });
  } else if (scene === 'c') {
    S.cam(0, -300, 1);
    UW.BG.aegis(S, {});
    const ctx = S.world(1);
    UW.BEINGS.guardianDrift(ctx, { x: -300, y: 0, t, drift: +(params.get('d')||0.6), pose: 'idle', scale: 1.2 });
    S.actor('titan', { x: 300, y: 0, t, pose: 'idle', alpha: 0.8, face: -1, scale: 1.6, inside: UW.BEINGS.titanInside });
  } else if (scene === 'd') {
    S.cam(0, -300, 1);
    UW.BG[params.get('bg') || 'wound'](S, {});
    const ctx = S.world(1);
  }
  window.__done = true;
})();
