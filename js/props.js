/* 通用道具与小特效（都是 t 的纯函数） */
(function () {
  const P = (window.P = {});
  const { shape, line, curve, dot, text } = SK;

  P.COL = {
    frogMsg: '#d9f2bf',
    pigMsg: '#ffd9e2',
    tape: '#a9d9f2',
    tapeDark: '#7cbfe3',
    heart: '#ef5a6f',
    gold: '#ffd35c',
    sky: '#cfe8f7',
  };

  /* ---------- 手机 ---------- */
  P.phone = function (ctx, x, y, s = 1, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    if (o.buzz) ctx.translate((SK.noise(SK.t * 60) - 0.5) * 4 * o.buzz, 0);
    ctx.rotate(o.rot || 0);
    ctx.scale(s, s);
    const w = o.w || 34, h = o.h || 60;
    if (o.glow) SK.glow(ctx, 0, 0, h * 1.3, o.glowColor || '#fff7c8', 0.55 * o.glow);
    shape(ctx, SK.rrect(-w / 2, -h / 2, w, h, 7), { fill: o.color || '#5a6f8f', lw: 2.6 });
    const sw = w - 7, sh = h - 12;
    shape(ctx, SK.rrect(-sw / 2, -sh / 2 - 1, sw, sh, 3), { fill: o.screenColor || (o.on === false ? '#2b3445' : '#eaf6ff'), line: false, tex: 0.08 });
    if (o.screen) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-sw / 2, -sh / 2 - 1, sw, sh);
      ctx.clip();
      ctx.translate(-sw / 2, -sh / 2 - 1);
      o.screen(ctx, sw, sh);
      ctx.restore();
    }
    dot(ctx, 0, h / 2 - 3.5, 1.6, '#cfd8e6');
    ctx.restore();
  };

  /* ---------- 聊天气泡 ---------- */
  // tail: 'left' | 'right' | 'down' | null
  P.bubble = function (ctx, x, y, o = {}) {
    const size = o.size || 26;
    let w = o.w, h = o.h;
    if (o.text && !w) w = SK.measure(ctx, o.text, size, o.font) + size * 1.1;
    w = w || 80;
    h = h || size * 1.75;
    ctx.save();
    ctx.translate(x, y);
    const sc = o.scale == null ? 1 : o.scale;
    ctx.scale(sc, sc);
    if (o.rot) ctx.rotate(o.rot);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    const pts = SK.rrect(-w / 2, -h / 2, w, h, Math.min(h / 2, 18));
    const col = o.color || '#fff';
    if (o.tail) {
      const tw = 12;
      let tri;
      if (o.tail === 'left') tri = [[-w / 2 + 14, h / 2 - 6], [-w / 2 - 6, h / 2 + 10], [-w / 2 + 26, h / 2 - 2]];
      else if (o.tail === 'right') tri = [[w / 2 - 14, h / 2 - 6], [w / 2 + 6, h / 2 + 10], [w / 2 - 26, h / 2 - 2]];
      else tri = [[-tw, h / 2 - 4], [0, h / 2 + 14], [tw, h / 2 - 4]];
      shape(ctx, tri, { fill: col, lw: o.lw || 2.4, tex: 0.1 });
    }
    shape(ctx, pts, { fill: col, lw: o.lw || 2.6, tex: 0.12 });
    if (o.tail) {
      // 盖住尾巴与气泡的接缝
      let tri;
      if (o.tail === 'left') tri = [[-w / 2 + 12, h / 2 - 9], [-w / 2 + 2, h / 2 + 2], [-w / 2 + 26, h / 2 - 7]];
      else if (o.tail === 'right') tri = [[w / 2 - 12, h / 2 - 9], [w / 2 - 2, h / 2 + 2], [w / 2 - 26, h / 2 - 7]];
      else tri = [[-9, h / 2 - 7], [0, h / 2 + 5], [9, h / 2 - 7]];
      shape(ctx, tri, { fill: col, line: false, tex: 0, wob: 0.3, offset: 0 });
    }
    if (o.text) text(ctx, o.text, 0, 1, { size, color: o.textColor || SK.INK, font: o.font, seed: o.seed || 0 });
    if (o.icon) o.icon(ctx, w, h);
    if (o.scribble) {
      // 用波浪线代表长长的文字
      const rows = o.scribble;
      for (let r = 0; r < rows; r++) {
        const yy = -h / 2 + 16 + r * 16;
        const len = r === rows - 1 ? w * 0.45 : w - 30;
        const pts = [];
        for (let i = 0; i <= 20; i++) pts.push([-w / 2 + 15 + (i / 20) * len, yy + Math.sin(i * 1.7 + r * 3 + (o.seed || 0)) * 2.4]);
        line(ctx, pts, { lw: 2.4, line: 'rgba(80,60,60,0.55)', wob: 0.6 });
      }
    }
    ctx.restore();
    return w;
  };

  /* ---------- 小图标 ---------- */
  P.heart = function (ctx, x, y, size, color = P.COL.heart, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    shape(ctx, SK.heartPts(0, 0, size), { fill: color, lw: o.lw || Math.min(3, 1 + size * 0.12), tex: 0.15, line: o.line });
    if (size > 7 && o.shine !== false) curve(ctx, -size * 0.55, -size * 0.35, -size * 0.5, -size * 0.65, -size * 0.2, -size * 0.6, { lw: Math.max(1.2, size * 0.12), line: 'rgba(255,255,255,0.85)' });
    ctx.restore();
  };
  P.sparkle = function (ctx, x, y, r, color = '#fff5b8', o = {}) {
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + (o.rot || 0);
      const rr = i % 2 ? r * 0.28 : r;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    shape(ctx, SK.spline(pts, true, 3), { fill: color, lw: o.lw || 1.8, tex: 0, line: o.line });
  };
  P.star = function (ctx, x, y, r, color = P.COL.gold, o = {}) {
    shape(ctx, SK.starPts(x, y, r, r * 0.48, 5, o.rot || 0), { fill: color, lw: o.lw || 2, tex: 0.12, line: o.line });
  };
  P.note = function (ctx, x, y, s = 1, color = SK.INK) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    shape(ctx, SK.ell(0, 0, 7, 5.2, -0.4), { fill: color, line: false, tex: 0 });
    line(ctx, [[6, -2], [6, -26]], { lw: 2.4, line: color });
    curve(ctx, 6, -26, 14, -20, 14, -12, { lw: 2.4, line: color });
    ctx.restore();
  };
  P.exclaim = function (ctx, x, y, s = 1, n = 1, color = '#ff6b6b') {
    for (let i = 0; i < n; i++) {
      const ox = (i - (n - 1) / 2) * 16 * s;
      ctx.save();
      ctx.translate(x + ox, y);
      ctx.rotate((i - (n - 1) / 2) * 0.2);
      shape(ctx, SK.poly([[-5 * s, -26 * s], [5 * s, -26 * s], [2 * s, 0], [-2 * s, 0]]), { fill: color, lw: 2, tex: 0 });
      shape(ctx, SK.circ(0, 9 * s, 3.6 * s), { fill: color, lw: 2, tex: 0 });
      ctx.restore();
    }
  };
  P.question = function (ctx, x, y, s = 1, color = '#7aa6e8') {
    text(ctx, '?', x, y, { size: 44 * s, color, outline: SK.INK, outlineW: 4, font: SK.FONT_EN, weight: 'bold' });
  };
  P.steam = function (ctx, x, y, t, s = 1) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 1.6 + i / 3) % 1;
      const r = (6 + k * 12) * s;
      ctx.save();
      ctx.globalAlpha *= Math.sin(k * Math.PI) * 0.9;
      shape(ctx, SK.circ(x + (i - 1) * 16 * s + Math.sin(k * 6 + i) * 6, y - k * 50 * s, r), { fill: '#fff', lw: 2, tex: 0 });
      ctx.restore();
    }
  };
  P.dizzy = function (ctx, x, y, t, s = 1) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + (i / 3) * Math.PI * 2;
      P.star(ctx, x + Math.cos(a) * 34 * s, y + Math.sin(a) * 10 * s, 8 * s, P.COL.gold);
    }
  };

  /* ---------- 粒子：漂浮爱心 / 彩纸 / 闪光 ---------- */
  P.floatHearts = function (ctx, t, x, y, o = {}) {
    const n = o.n || 6, seed = o.seed || 1, rise = o.rise || 120, life = o.life || 2.2;
    for (let i = 0; i < n; i++) {
      const off = SK.hash(seed + i * 7.1) * life;
      const k = ((t + off) % life) / life;
      if (o.start != null && t < o.start + off * 0) continue;
      const px = x + (SK.hash(seed + i * 3.3) - 0.5) * (o.spread || 80) + Math.sin(k * 6 + i) * 10;
      const py = y - k * rise;
      const a = Math.sin(k * Math.PI);
      ctx.save();
      ctx.globalAlpha *= a * (o.alpha == null ? 1 : o.alpha);
      P.heart(ctx, px, py, (o.size || 10) * (0.7 + SK.hash(seed + i) * 0.6), o.color || P.COL.heart, { rot: Math.sin(k * 5 + i) * 0.2 });
      ctx.restore();
    }
  };
  // 一次性爆发（t0 起）
  P.burst = function (ctx, t, t0, x, y, o = {}) {
    const dt = t - t0;
    const life = o.life || 1.6;
    if (dt < 0 || dt > life) return;
    const n = o.n || 12, seed = o.seed || 3;
    const k = dt / life;
    const colors = o.colors || [P.COL.heart, '#ffb3c6', P.COL.gold, '#a9d9f2', '#b8e08a'];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + SK.hash(seed + i) * 0.5;
      const sp = (o.speed || 220) * (0.6 + SK.hash(seed + i * 2.3) * 0.6);
      const d = sp * SK.easeOut(Math.min(1, k * 1.3));
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d + (o.gravity || 60) * k * k;
      ctx.save();
      ctx.globalAlpha *= 1 - SK.smooth(SK.prog(k, 0.6, 1));
      const c = colors[i % colors.length];
      const kind = o.kind || 'mix';
      if (kind === 'heart' || (kind === 'mix' && i % 3 === 0)) P.heart(ctx, px, py, (o.size || 11) * (0.8 + SK.hash(i + seed) * 0.5), c, { rot: a });
      else if (kind === 'star' || (kind === 'mix' && i % 3 === 1)) P.sparkle(ctx, px, py, (o.size || 11) * 1.1, c);
      else {
        ctx.translate(px, py);
        ctx.rotate(a + k * 8);
        shape(ctx, SK.rect(-5, -3, 10, 6), { fill: c, lw: 1.4, tex: 0 });
      }
      ctx.restore();
    }
  };
  P.confetti = function (ctx, t, t0, o = {}) {
    const dt = t - t0;
    if (dt < 0) return;
    const n = o.n || 60, seed = o.seed || 9;
    const colors = o.colors || [P.COL.heart, '#ffb3c6', P.COL.gold, '#a9d9f2', '#b8e08a', '#c7b3ff'];
    for (let i = 0; i < n; i++) {
      const delay = SK.hash(seed + i) * (o.spreadT || 1.2);
      const d = dt - delay;
      if (d < 0) continue;
      const x = (o.x0 || 0) + SK.hash(seed + i * 1.7) * (o.w || SK.W);
      const y = (o.y0 || -20) + d * (90 + SK.hash(seed + i * 2.9) * 80);
      if (y > SK.H + 30) continue;
      ctx.save();
      ctx.translate(x + Math.sin(d * 3 + i) * 20, y);
      ctx.rotate(d * 4 + i);
      ctx.scale(1, Math.cos(d * 6 + i));
      shape(ctx, SK.rect(-6, -3.5, 12, 7), { fill: colors[i % colors.length], line: false, tex: 0 });
      ctx.restore();
    }
  };
  P.twinkles = function (ctx, t, o = {}) {
    const n = o.n || 30, seed = o.seed || 2;
    for (let i = 0; i < n; i++) {
      const x = (o.x || 0) + SK.hash(seed + i * 1.3) * (o.w || SK.W);
      const y = (o.y || 0) + SK.hash(seed + i * 2.7) * (o.h || SK.H * 0.6);
      const tw = 0.5 + 0.5 * Math.sin(t * (2 + SK.hash(i) * 3) + i * 2);
      const r = (o.r || 5) * (0.5 + SK.hash(seed + i * 5.1)) * (0.6 + 0.4 * tw);
      ctx.save();
      ctx.globalAlpha *= (o.alpha || 1) * (0.4 + 0.6 * tw);
      if (o.dots && i % 2) SK.dot(ctx, x, y, r * 0.35, o.color || '#fff8d0');
      else P.sparkle(ctx, x, y, r, o.color || '#fff8d0', { line: o.line === undefined ? false : o.line });
      ctx.restore();
    }
  };

  /* ---------- 自然 ---------- */
  P.cloud = function (ctx, x, y, s = 1, color = '#ffffff', o = {}) {
    const pts = SK.spline(
      [
        [-60, 10], [-66, -8], [-48, -24], [-30, -22], [-18, -42], [8, -46], [26, -30], [46, -36], [64, -20], [66, 0], [52, 14], [0, 16],
      ].map(([a, b]) => [x + a * s, y + b * s])
    );
    shape(ctx, pts, { fill: color, lw: o.lw || 2.4, tex: 0.1, line: o.line, alpha: o.alpha });
  };
  P.tree = function (ctx, x, y, s = 1, o = {}) {
    const kind = o.kind || 'round';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const trunk = o.trunk || '#a5774f';
    shape(ctx, SK.poly([[-10, 0], [-7, -70], [7, -70], [11, 0]], true, 8), { fill: trunk, lw: 2.6 });
    line(ctx, [[-2, -40], [-18, -66]], { lw: 3 });
    const sway = Math.sin(SK.t * 1.3 + x * 0.01) * 2;
    if (kind === 'willow') {
      shape(ctx, SK.ell(sway, -100, 62, 46), { fill: o.canopy || '#9ccc6c', shade: SK.mix(o.canopy || '#9ccc6c', '#3a6a2a', 0.25) });
      for (let i = 0; i < 9; i++) {
        const xx = -50 + i * 12.5 + sway;
        line(ctx, [[xx, -80], [xx + Math.sin(SK.t * 1.5 + i) * 4, -40 + (i % 3) * 8]], { lw: 2.2, line: SK.mix(o.canopy || '#9ccc6c', SK.INK, 0.35) });
      }
    } else if (kind === 'pine') {
      for (let k = 0; k < 3; k++) {
        const yy = -60 - k * 34, w = 52 - k * 13;
        shape(ctx, SK.poly([[-w, yy], [0, yy - 54], [w, yy]], true, 8), { fill: o.canopy || '#6fae6a', shade: '#4f8a50' });
      }
    } else {
      const c = o.canopy || '#a5d47a';
      const blobs = o.blobs || [[-30, -96, 40], [28, -100, 40], [0, -128, 44], [0, -92, 46]];
      blobs.forEach(([a, b, r], i) => shape(ctx, SK.circ(a + sway, b, r), { fill: c, shade: SK.mix(c, '#5a3a1a', 0.22), shadeDist: 8 }));
      if (o.dots) o.dots.forEach(([a, b], i) => SK.dot(ctx, a + sway, b, 4, o.dotColor || '#ff9fb8'));
    }
    ctx.restore();
  };
  P.flower = function (ctx, x, y, s = 1, color = '#ffb3c6') {
    line(ctx, [[x, y], [x, y - 14 * s]], { lw: 2, line: '#5d8f45' });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      SK.dot(ctx, x + Math.cos(a) * 4 * s, y - 16 * s + Math.sin(a) * 4 * s, 3.4 * s, color);
    }
    SK.dot(ctx, x, y - 16 * s, 2.4 * s, '#ffd35c');
  };
  P.grassTufts = function (ctx, x0, x1, y, o = {}) {
    const r = SK.rand(o.seed || 5);
    const col = o.color || '#6c9f4a';
    const gap = o.gap || 40;
    for (let x = x0; x < x1; x += gap * (0.6 + r() * 0.8)) {
      const yy = y + (r() - 0.5) * (o.jy || 10);
      for (let k = -1; k <= 1; k++) line(ctx, [[x + k * 4, yy], [x + k * 7 + Math.sin(SK.t * 2 + x) * 1.5, yy - 10 - r() * 6]], { lw: 1.8, line: col });
    }
  };
  P.moon = function (ctx, x, y, r) {
    SK.glow(ctx, x, y, r * 3, '#fff6c9', 0.35);
    shape(ctx, SK.circ(x, y, r), { fill: '#fff3b8', lw: 2.6 });
    shape(ctx, SK.circ(x - r * 0.3, y + r * 0.2, r * 0.18), { fill: '#f3e3a0', line: false });
    shape(ctx, SK.circ(x + r * 0.32, y - r * 0.25, r * 0.12), { fill: '#f3e3a0', line: false });
  };
  P.sun = function (ctx, x, y, r, color = '#ffd76a') {
    SK.glow(ctx, x, y, r * 3.2, color, 0.45);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + SK.t * 0.2;
      line(ctx, [[x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25], [x + Math.cos(a) * r * 1.55, y + Math.sin(a) * r * 1.55]], { lw: 3, line: '#f2b84b' });
    }
    shape(ctx, SK.circ(x, y, r), { fill: color, lw: 2.6 });
  };

  /* ---------- 胶带 ---------- */
  P.tape = function (ctx, x, y, w, h, rot = 0, color = P.COL.tape, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    const pts = [];
    const zig = (x0, top, bot, dir) => {
      const n = 6;
      for (let i = 0; i <= n; i++) {
        const yy = top + ((bot - top) * i) / n;
        pts.push([x0 + (i % 2 ? dir * 3 : 0), yy]);
      }
    };
    pts.push([-w / 2, -h / 2]);
    for (let i = 1; i < 8; i++) pts.push([-w / 2 + (w * i) / 8, -h / 2]);
    zig(w / 2, -h / 2, h / 2, 1);
    for (let i = 7; i > 0; i--) pts.push([-w / 2 + (w * i) / 8, h / 2]);
    zig(-w / 2, h / 2, -h / 2, -1);
    shape(ctx, pts, { fill: SK.rgba(color, o.opacity || 0.85), lw: o.lw || 1.6, line: o.line || SK.rgba(P.COL.tapeDark, 0.9), tex: 0.18, wob: 0.6 });
    // 光泽
    line(ctx, [[-w / 2 + 8, -h / 2 + 5], [w / 2 - 8, -h / 2 + 5]], { lw: 2, line: 'rgba(255,255,255,0.55)', wob: 0.4 });
    if (o.text) text(ctx, o.text, 0, 1, { size: o.size || h * 0.6, color: o.textColor || SK.INK, seed: 4 });
    ctx.restore();
  };
  /* ---------- 日历 ---------- */
  P.calendar = function (ctx, x, y, s = 1, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (o.rot) ctx.rotate(o.rot);
    const w = 220, h = 230;
    shape(ctx, SK.rrect(-w / 2 + 8, -h / 2 + 10, w, h, 16), { fill: 'rgba(80,50,30,0.18)', line: false, tex: 0 });
    shape(ctx, SK.rrect(-w / 2, -h / 2, w, h, 16), { fill: '#fffaf0', lw: 3.2 });
    shape(ctx, SK.rrect(-w / 2, -h / 2, w, 62, 14).map(([a, b]) => [a, Math.min(b, -h / 2 + 62)]), { fill: o.top || '#f07a8a', lw: 3 });
    // 线圈
    for (let i = -2; i <= 2; i++) {
      shape(ctx, SK.rrect(i * 36 - 5, -h / 2 - 16, 10, 28, 5), { fill: '#cfd3dc', lw: 2.2, tex: 0 });
    }
    text(ctx, o.month || '', 0, -h / 2 + 34, { size: 30, color: '#fff', seed: 2 });
    text(ctx, o.day || '', 0, 30, { size: o.daySize || 92, color: o.dayColor || SK.INK, font: SK.FONT_EN, weight: 'bold', seed: 5 });
    if (o.deco) o.deco(ctx, w, h);
    ctx.restore();
  };
  // 日期大字卡：显示 “10/19” 这样的日期
  P.dateCard = function (ctx, lt, str, o = {}) {
    const k = SK.pop(lt, o.start || 0.1, 0.5);
    const out = o.end ? SK.easeIn(SK.prog(lt, o.end, o.end + 0.4)) : 0;
    ctx.save();
    ctx.translate(o.x || SK.W / 2, (o.y || SK.H / 2) - out * 700);
    ctx.rotate((o.rot || -0.05) + out * 0.5);
    ctx.scale(k, k);
    P.calendar(ctx, 0, 0, o.s || 1.25, { month: o.month || '', day: str, daySize: o.daySize || (str.length > 3 ? 70 : 92), top: o.top, deco: o.deco });
    ctx.restore();
  };

  /* ---------- 拍立得 ---------- */
  P.polaroid = function (ctx, x, y, s, rot, draw, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(s, s);
    const w = 120, h = 140;
    shape(ctx, SK.rect(-w / 2 + 5, -h / 2 + 6, w, h), { fill: 'rgba(60,40,20,0.2)', line: false, tex: 0 });
    shape(ctx, SK.rect(-w / 2, -h / 2, w, h), { fill: '#fffdf7', lw: 2.4 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w / 2 + 9, -h / 2 + 9, w - 18, w - 18);
    ctx.clip();
    ctx.translate(-w / 2 + 9, -h / 2 + 9);
    if (draw) draw(ctx, w - 18, w - 18);
    ctx.restore();
    line(ctx, SK.rect(-w / 2 + 9, -h / 2 + 9, w - 18, w - 18).concat([[-w / 2 + 9, -h / 2 + 9]]), { lw: 1.6 });
    if (o.label) text(ctx, o.label, 0, h / 2 - 15, { size: 16, seed: 3 });
    if (o.tape) P.tape(ctx, 0, -h / 2, 50, 16, 0.08, o.tapeColor || P.COL.tape);
    ctx.restore();
  };

  /* ---------- 室内物件 ---------- */
  P.book = function (ctx, x, y, w, h, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    shape(ctx, SK.rect(-w / 2, -h / 2, w, h), { fill: color, lw: 2.4 });
    shape(ctx, SK.rect(-w / 2, h / 2 - 5, w, 5), { fill: '#fffaf0', lw: 1.6, tex: 0 });
    line(ctx, [[-w / 2 + 6, -h / 2 + 2], [-w / 2 + 6, h / 2 - 5]], { lw: 1.5 });
    ctx.restore();
  };
  P.window = function (ctx, x, y, w, h, o = {}) {
    shape(ctx, SK.rrect(x - 6, y - 6, w + 12, h + 12, 6), { fill: o.frame || '#fff4e0', lw: 2.6 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    if (o.view) o.view(ctx, x, y, w, h);
    else SK.vgrad(ctx, [[0, o.sky1 || '#bfe3f5'], [1, o.sky2 || '#e8f6ff']], y, y + h, x, w);
    ctx.restore();
    line(ctx, SK.rect(x, y, w, h).concat([[x, y]]), { lw: 2.2 });
    line(ctx, [[x + w / 2, y], [x + w / 2, y + h]], { lw: 2.4 });
    line(ctx, [[x, y + h / 2], [x + w, y + h / 2]], { lw: 2.4 });
    if (o.curtain) {
      shape(ctx, SK.spline([[x - 10, y - 8], [x + 30, y - 8], [x + 18, y + h * 0.5], [x + 24, y + h + 8], [x - 10, y + h + 8]]), { fill: o.curtain });
      shape(ctx, SK.spline([[x + w + 10, y - 8], [x + w - 30, y - 8], [x + w - 18, y + h * 0.5], [x + w - 24, y + h + 8], [x + w + 10, y + h + 8]]), { fill: o.curtain });
    }
  };
  P.clock = function (ctx, x, y, r, hours, o = {}) {
    shape(ctx, SK.circ(x, y, r), { fill: o.face || '#fffaf0', lw: 2.6 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      SK.dot(ctx, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, 1.4);
    }
    const ah = (hours / 12) * Math.PI * 2 - Math.PI / 2;
    const am = (hours % 1) * Math.PI * 2 - Math.PI / 2;
    line(ctx, [[x, y], [x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5]], { lw: 3 });
    line(ctx, [[x, y], [x + Math.cos(am) * r * 0.72, y + Math.sin(am) * r * 0.72]], { lw: 2.2 });
    SK.dot(ctx, x, y, 2.4);
  };
  P.lamp = function (ctx, x, y, s = 1, on = 1, color = '#ffe9a8') {
    if (on > 0) SK.glow(ctx, x, y - 70 * s, 140 * s, color, 0.4 * on);
    shape(ctx, SK.rect(x - 3 * s, y - 60 * s, 6 * s, 60 * s), { fill: '#d9b48a', lw: 2 });
    shape(ctx, SK.poly([[x - 26 * s, y - 60 * s], [x - 16 * s, y - 95 * s], [x + 16 * s, y - 95 * s], [x + 26 * s, y - 60 * s]]), { fill: SK.mix('#c9b28e', color, on), lw: 2.4 });
    shape(ctx, SK.ell(x, y, 18 * s, 5 * s), { fill: '#b98e64', lw: 2 });
  };
  P.bed = function (ctx, x, y, w, o = {}) {
    // x,y 床面左上；o.blanket 颜色
    shape(ctx, SK.rrect(x - 10, y - 70, 26, 110, 8), { fill: o.wood || '#c99b6d', lw: 2.6 });
    shape(ctx, SK.rrect(x, y, w, 40, 10), { fill: '#fffaf2', lw: 2.6 });
    shape(ctx, SK.rrect(x + w - 16, y - 30, 22, 70, 8), { fill: o.wood || '#c99b6d', lw: 2.6 });
    line(ctx, [[x + 10, y + 40], [x + 10, y + 56]], { lw: 3 });
    line(ctx, [[x + w - 10, y + 40], [x + w - 10, y + 56]], { lw: 3 });
  };
  P.popcorn = function (ctx, x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (let i = 0; i < 7; i++) {
      const a = -0.4 + i * 0.27;
      shape(ctx, SK.circ(-18 + i * 6, -36 - Math.sin(i * 1.7) * 6, 8), { fill: '#fff6d8', lw: 1.8, tex: 0.1 });
    }
    const bucket = SK.poly([[-22, -34], [22, -34], [16, 8], [-16, 8]]);
    shape(ctx, bucket, { fill: '#fffaf0', lw: 2.4 });
    for (let i = -1; i <= 1; i++) shape(ctx, SK.poly([[i * 14 - 4, -34], [i * 14 + 4, -34], [i * 11 + 3, 8], [i * 11 - 3, 8]]), { fill: '#ef6b75', line: false, tex: 0.1 });
    line(ctx, bucket.concat([bucket[0]]), { lw: 2.4 });
    ctx.restore();
  };

  /* ---------- 镜头效果 ---------- */
  P.radialLines = function (ctx, cx, cy, t, o = {}) {
    const n = o.n || 40;
    ctx.save();
    ctx.globalAlpha *= o.alpha || 0.5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + SK.hash(i + SK.boil) * 0.12;
      const r0 = (o.r0 || 260) + SK.hash(i * 3 + SK.boil) * 80;
      const r1 = 1000;
      ctx.fillStyle = o.color || SK.INK;
      ctx.beginPath();
      const w = 0.012 + SK.hash(i * 7) * 0.012;
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1);
      ctx.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
  P.speedLines = function (ctx, t, o = {}) {
    const n = o.n || 24;
    ctx.save();
    ctx.globalAlpha *= o.alpha || 0.4;
    for (let i = 0; i < n; i++) {
      const x = SK.hash(i * 1.7 + SK.boil * 0.3) * SK.W;
      const y = SK.hash(i * 3.1 + SK.boil * 0.7) * SK.H;
      const len = 80 + SK.hash(i) * 200;
      if (o.vertical) line(ctx, [[x, y], [x, y + len]], { lw: 2, line: o.color || '#fff' });
      else line(ctx, [[x, y], [x + len, y]], { lw: 2, line: o.color || '#fff' });
    }
    ctx.restore();
  };
  // 心形遮罩（iris）：k=0 全开，k=1 全闭
  P.heartIris = function (ctx, k, cx = SK.W / 2, cy = SK.H / 2, color = '#3b2a24') {
    if (k <= 0) return;
    const size = SK.lerp(900, 0, SK.easeIn(k));
    ctx.save();
    ctx.beginPath();
    ctx.rect(-50, -50, SK.W + 100, SK.H + 100);
    const pts = SK.heartPts(cx, cy, Math.max(0.01, size), 60);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill('evenodd');
    ctx.restore();
  };
  P.circleIris = function (ctx, k, cx = SK.W / 2, cy = SK.H / 2, color = '#3b2a24') {
    if (k <= 0) return;
    const r = SK.lerp(800, 0, SK.easeIn(k));
    ctx.save();
    ctx.beginPath();
    ctx.rect(-50, -50, SK.W + 100, SK.H + 100);
    ctx.arc(cx, cy, Math.max(0.01, r), 0, Math.PI * 2, true);
    ctx.fillStyle = color;
    ctx.fill('evenodd');
    ctx.restore();
  };
  // 分屏的手绘分割线
  P.divider = function (ctx, x, color = SK.INK) {
    const pts = [];
    for (let i = 0; i <= 30; i++) pts.push([x + Math.sin(i * 0.9) * 3, -10 + (i / 30) * (SK.H + 20)]);
    SK.line(ctx, pts, { lw: 6, line: '#fffaf0', wob: 1 });
    SK.line(ctx, pts.map(([a, b]) => [a - 5, b]), { lw: 2.6, line: color });
    SK.line(ctx, pts.map(([a, b]) => [a + 5, b]), { lw: 2.6, line: color });
  };
  // 在矩形区域内绘制（分屏）
  P.panel = function (ctx, x, y, w, h, draw) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    draw(ctx);
    ctx.restore();
  };
})();
