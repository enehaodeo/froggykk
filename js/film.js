/* 组装：时间 → 场景 → 画面（含转场与纸张质感） */
(function () {
  const Film = (window.Film = {});
  const S = (window.SCENES = window.SCENES || {});

  // 默认转场：前后各 0.35 秒淡入淡出到纸色；场景可在 S[id].tin / tout 中覆盖
  Film.duration = TL.duration;

  Film.sceneAt = function (t) {
    const L = TL.scenes;
    for (let i = L.length - 1; i >= 0; i--) if (t >= L[i].start) return L[i];
    return L[0];
  };

  function overlay(ctx, color, a) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, a);
    ctx.fillStyle = color;
    ctx.fillRect(-20, -20, SK.W + 40, SK.H + 40);
    ctx.restore();
  }

  // ctx 已经被缩放到 1280×720 的影片坐标；pw/ph 为实际像素
  Film.render = function (ctx, t, pw, ph) {
    SK.beginFrame(t);
    const sc = Film.sceneAt(t);
    const def = S[sc.id];
    const lt = t - sc.start;
    const isEnd = sc === TL.scenes[TL.scenes.length - 1];
    ctx.save();
    if (def && def.draw) def.draw(ctx, lt, sc.dur, sc);
    else {
      SK.bg(ctx, SK.PAPER);
      SK.text(ctx, sc.id, SK.W / 2, SK.H / 2, { size: 60 });
    }
    ctx.restore();
    const tin = (def && def.tin) || ['paper', 0.35];
    const tout = (def && def.tout) || ['paper', 0.35];
    const colors = { paper: '#fbf5e8', ink: '#2a1e1a', white: '#ffffff', night: '#1c1b33' };
    if (tin[0] !== 'cut' && lt < tin[1]) overlay(ctx, colors[tin[0]] || tin[0], 1 - lt / tin[1]);
    const rem = sc.dur - lt;
    if (!isEnd && tout[0] !== 'cut' && rem < tout[1]) overlay(ctx, colors[tout[0]] || tout[0], 1 - rem / tout[1]);
    SK.paperOverlay(ctx, pw, ph, 1);
  };
})();
