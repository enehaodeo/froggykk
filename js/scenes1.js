/* 第一幕：片头 → 校园相遇 → 聊天 → 环球影城 → 晚安 → 梦 → 10/19 → 10/20 */
(function () {
  const S = (window.SCENES = window.SCENES || {});
  const SH = (window.SH = window.SH || {});
  const { shape, line, curve, dot, text } = SK;
  const F = CH.frog, G = CH.pig;

  /* ================= 场景通用小工具 ================= */
  SH.walk = function (lt, t0, t1, x0, x1, ease) {
    const k = SK.prog(lt, t0, t1);
    const e = ease ? ease(k) : k;
    return { x: SK.lerp(x0, x1, e), moving: lt > t0 && lt < t1, k };
  };
  SH.hop = function (lt, t0, h = 14, d = 0.3) {
    const k = (lt - t0) / d;
    return k > 0 && k < 1 ? Math.sin(k * Math.PI) * h : 0;
  };
  SH.wallDots = function (ctx, x, y, w, h, color, kind = 'dot', seed = 1) {
    for (let yy = y + 20, r = 0; yy < y + h; yy += 46, r++) {
      for (let xx = x + 20 + (r % 2) * 23; xx < x + w; xx += 46) {
        if (kind === 'heart') P.heart(ctx, xx, yy, 5, color, { lw: 0.1, shine: false, line: false });
        else if (kind === 'star') P.sparkle(ctx, xx, yy, 5, color, { line: false });
        else SK.dot(ctx, xx, yy, 3.2, color);
      }
    }
  };
  SH.floor = function (ctx, y, color, x = -20, w = SK.W + 40) {
    shape(ctx, SK.rect(x, y, w, SK.H - y + 30), { fill: color, lw: 2.6, tex: 0.25 });
    for (let i = 0; i < 6; i++) line(ctx, [[x + i * (w / 6) + 40, y + 20 + (i % 2) * 30], [x + i * (w / 6) + 120, y + 20 + (i % 2) * 30]], { lw: 1.4, line: SK.rgba('#7a5230', 0.35) });
  };
  SH.ginkgoLeaf = function (ctx, x, y, s, rot, color = '#f6c945') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    const pts = [[0, 0]];
    for (let i = 0; i <= 12; i++) {
      const a = -Math.PI / 2 - 0.95 + (i / 12) * 1.9;
      const notch = Math.abs(i - 6) < 1 ? 0.75 : 1;
      pts.push([Math.cos(a) * 13 * notch, -4 + Math.sin(a) * 13 * notch]);
    }
    shape(ctx, pts, { fill: color, lw: 1.3, tex: 0.1 });
    line(ctx, [[0, 0], [0, 7]], { lw: 1.3 });
    ctx.restore();
  };
  SH.fallingLeaves = function (ctx, lt, o = {}) {
    const n = o.n || 18;
    for (let i = 0; i < n; i++) {
      const sp = 40 + SK.hash(i * 3.7) * 50;
      const y = ((lt * sp + SK.hash(i * 1.9) * (SK.H + 80)) % (SK.H + 80)) - 40;
      const x = SK.hash(i * 5.3) * SK.W + Math.sin(lt * 1.3 + i) * 34 + (o.drift || 0) * lt;
      SH.ginkgoLeaf(ctx, ((x % (SK.W + 40)) + SK.W + 40) % (SK.W + 40) - 20, y, 0.8 + SK.hash(i) * 0.5, lt * (1 + SK.hash(i * 2)) + i, o.color || (i % 3 ? '#f6c945' : '#f0a93b'));
    }
  };
  SH.ginkgoTree = function (ctx, x, y, s) {
    P.tree(ctx, x, y, s, { canopy: '#f6cd52', blobs: [[-40, -100, 44], [36, -104, 46], [0, -140, 50], [-6, -92, 52], [50, -70, 30], [-54, -70, 30]] });
  };
  // 拿书的手持物
  SH.books = function (ctx) {
    P.book(ctx, 0, -4, 50, 12, 0.03, '#7fb0e0');
    P.book(ctx, 2, -15, 46, 11, -0.04, '#f29b9b');
  };
  SH.phoneHeld = function (color, glow) {
    return (ctx) => {
      if (glow) SK.glow(ctx, 0, -20, 60, '#fff6c0', 0.45 * glow);
      P.phone(ctx, 0, -14, 0.62, { color, on: true });
    };
  };
  SH.miniFrogFace = function (ctx, x, y, r) {
    shape(ctx, SK.ell(x, y + r * 0.15, r, r * 0.8), { fill: CH.FROG.body, lw: 2 });
    shape(ctx, SK.circ(x - r * 0.45, y - r * 0.55, r * 0.38), { fill: CH.FROG.body, lw: 1.8 });
    shape(ctx, SK.circ(x + r * 0.45, y - r * 0.55, r * 0.34), { fill: CH.FROG.body, lw: 1.8 });
    SK.dot(ctx, x - r * 0.45, y - r * 0.55, r * 0.14);
    SK.dot(ctx, x + r * 0.45, y - r * 0.55, r * 0.13);
    curve(ctx, x - r * 0.5, y + r * 0.15, x, y + r * 0.6, x + r * 0.5, y + r * 0.15, { lw: 1.8 });
  };
  SH.miniPigFace = function (ctx, x, y, r) {
    shape(ctx, SK.poly([[x - r * 0.8, y - r * 0.5], [x - r * 0.6, y - r * 1.1], [x - r * 0.25, y - r * 0.7]]), { fill: CH.PIG.body, lw: 1.6 });
    shape(ctx, SK.poly([[x + r * 0.8, y - r * 0.5], [x + r * 0.6, y - r * 1.1], [x + r * 0.25, y - r * 0.7]]), { fill: CH.PIG.body, lw: 1.6 });
    shape(ctx, SK.circ(x, y, r), { fill: CH.PIG.body, lw: 2 });
    shape(ctx, SK.ell(x, y + r * 0.2, r * 0.42, r * 0.3), { fill: CH.PIG.snout, lw: 1.6 });
    SK.dot(ctx, x - r * 0.14, y + r * 0.2, r * 0.08, CH.PIG.nostril);
    SK.dot(ctx, x + r * 0.14, y + r * 0.2, r * 0.08, CH.PIG.nostril);
    SK.dot(ctx, x - r * 0.42, y - r * 0.25, r * 0.1);
    SK.dot(ctx, x + r * 0.42, y - r * 0.25, r * 0.1);
  };
  SH.moonIcon = function (ctx, x, y, r) {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI * 0.25 + (i / 20) * Math.PI * 1.5;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    for (let i = 20; i >= 0; i--) {
      const a = Math.PI * 0.25 + (i / 20) * Math.PI * 1.5;
      pts.push([x + r * 0.45 + Math.cos(a) * r * 0.8, y - r * 0.15 + Math.sin(a) * r * 0.8]);
    }
    shape(ctx, pts, { fill: '#ffe27a', lw: 1.8, tex: 0 });
  };
  SH.blanket = function (ctx, x, y, w, color, pattern) {
    // y：被子上沿
    const pts = SK.spline([[x - w / 2, y + 4], [x - w / 4, y - 6], [x, y + 2], [x + w / 4, y - 6], [x + w / 2, y + 4], [x + w / 2 + 6, y + 70], [x - w / 2 - 6, y + 70]]);
    shape(ctx, pts, { fill: color, lw: 2.8, shade: SK.mix(color, '#3a2050', 0.2) });
    shape(ctx, SK.rrect(x - w / 2 - 2, y - 4, w + 4, 18, 8), { fill: '#fffaf2', lw: 2.4 });
    if (pattern) for (let i = 0; i < 5; i++) pattern(ctx, x - w / 2 + 30 + i * (w - 60) / 4, y + 40 + (i % 2) * 10);
  };
  SH.pillow = function (ctx, x, y, w, h) {
    shape(ctx, SK.spline([[x - w / 2, y], [x - w / 4, y - h / 2 - 4], [x + w / 4, y - h / 2 - 4], [x + w / 2, y], [x + w / 4, y + h / 2 + 2], [x - w / 4, y + h / 2 + 2]]), { fill: '#fffdf7', lw: 2.4 });
  };
  SH.zoomTo = function (ctx, lt, t0, t1, from, to) {
    const k = SK.easeInOut(SK.prog(lt, t0, t1));
    const cx = SK.lerp(from[0], to[0], k), cy = SK.lerp(from[1], to[1], k), z = SK.lerp(from[2], to[2], k);
    SK.camera(ctx, cx, cy, z);
    return k;
  };

  /* ================= 1. 片头 ================= */
  S.title = {
    tin: ['paper', 0.8],
    draw(ctx, lt, dur) {
      SK.bg(ctx, '#fdf1e2');
      // 背景小涂鸦
      for (let i = 0; i < 34; i++) {
        const x = SK.hash(i * 1.3) * SK.W, y = SK.hash(i * 2.9) * SK.H;
        if (x > 280 && x < 1120 && y > 160 && y < 410) continue;
        const a = 0.35 * SK.smooth(SK.prog(lt, 0.2 + SK.hash(i) * 1.5, 1.0 + SK.hash(i) * 1.5));
        ctx.save();
        ctx.globalAlpha = a;
        const k = i % 4;
        const rot = Math.sin(lt * 0.8 + i) * 0.3;
        if (k === 0) P.heart(ctx, x, y, 9, '#ffb6c6', { rot });
        else if (k === 1) P.sparkle(ctx, x, y, 10, '#ffe08a');
        else if (k === 2) SH.ginkgoLeaf(ctx, x, y, 0.9, rot + i, '#f6c945');
        else SK.dot(ctx, x, y, 5, '#bfe0f2');
        ctx.restore();
      }
      // 标题
      const y0 = 250;
      const drawChar = (c, x, i) => {
        const k = SK.pop(lt, 0.5 + i * 0.16, 0.45);
        if (k <= 0) return;
        ctx.save();
        ctx.translate(x, y0 + Math.sin(lt * 2 + i) * 3);
        ctx.scale(k, k);
        text(ctx, c, 0, 0, { size: 104, color: i < 2 ? '#7fb956' : '#f08aa3', outline: SK.INK, outlineW: 9, seed: i * 7 });
        ctx.restore();
      };
      drawChar('青', 370, 0);
      drawChar('蛙', 478, 1);
      const hk = SK.pop(lt, 0.9, 0.5);
      if (hk > 0) {
        const beat = 1 + 0.08 * Math.max(0, Math.sin(lt * Math.PI * 2 / TL.BEAT * 0.5));
        P.heart(ctx, 640, y0 + 4, 40 * hk * beat, '#ef5a6f');
      }
      drawChar('苍', 790, 2);
      drawChar('蝇', 898, 3);
      drawChar('猪', 1006, 4);
      const sk = SK.pop(lt, 2.0, 0.5);
      if (sk > 0) {
        ctx.save();
        ctx.translate(640, 360);
        ctx.scale(sk, sk);
        text(ctx, 'Froggy  &  Piggy', 0, 0, { size: 46, font: SK.FONT_EN, weight: 'bold', color: '#8a6a58', seed: 11 });
        ctx.restore();
      }
      // 青蛙从荷叶后探头，小猪飞进来
      const fk = SK.backOut(SK.prog(lt, 2.4, 3.0));
      shape(ctx, SK.ell(330, 690, 170, 46), { fill: '#86c06a', shade: '#5f9a4c' });
      line(ctx, [[330, 690], [260, 660]], { lw: 2.4 });
      F(ctx, 330, SK.lerp(980, 680, fk), 1.25, { t: lt, arms: lt > 3.6 ? 'wave' : 'down', look: [0.6, -0.2], face: lt > 3.6 ? 'open' : 'smile' });
      const pk = SK.easeOut(SK.prog(lt, 2.8, 4.0));
      G(ctx, SK.lerp(1450, 960, pk), 600, 1.15, { t: lt, fly: true, arms: lt > 3.9 ? 'wave' : 'down', look: [-0.8, 0], face: lt > 3.9 ? 'open' : 'smile', flip: false });
      if (lt > 4.4) P.floatHearts(ctx, lt - 4.4, 640, 600, { n: 6, spread: 260, rise: 150, size: 9 });
    },
  };

  /* ================= 2. 校园相遇 ================= */
  function school(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    shape(ctx, SK.rect(-250, -250, 500, 250), { fill: '#f6e4c6', shade: '#e3c79c', shadeDist: 14 });
    shape(ctx, SK.rect(-266, -272, 532, 28), { fill: '#d9785f' });
    shape(ctx, SK.rect(-60, -372, 120, 104), { fill: '#f6e4c6', shade: '#e3c79c' });
    shape(ctx, SK.poly([[-78, -370], [0, -440], [78, -370]]), { fill: '#d9785f' });
    line(ctx, [[0, -440], [0, -486]], { lw: 2.6 });
    const wav = Math.sin(SK.t * 4) * 4;
    shape(ctx, SK.poly([[0, -486], [36, -478 + wav], [0, -466]]), { fill: '#ef5a6f', lw: 2.2 });
    P.clock(ctx, 0, -322, 30, 10.2 + SK.t * 0.02);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 6; c++) {
        if (r === 1 && (c === 2 || c === 3)) continue;
        const wx = -218 + c * 76 + (c >= 3 ? 8 : 0), wy = -226 + r * 100;
        shape(ctx, SK.rect(wx, wy, 52, 60), { fill: '#bfe2f4', lw: 2.4 });
        line(ctx, [[wx + 26, wy], [wx + 26, wy + 60]], { lw: 1.8 });
        line(ctx, [[wx, wy + 30], [wx + 52, wy + 30]], { lw: 1.8 });
        line(ctx, [[wx + 8, wy + 8], [wx + 18, wy + 18]], { lw: 1.8, line: 'rgba(255,255,255,0.9)' });
      }
    }
    shape(ctx, SK.rrect(-44, -116, 88, 116, 40), { fill: '#b98258', lw: 2.6 });
    line(ctx, [[0, -112], [0, 0]], { lw: 2 });
    dot(ctx, -9, -54, 2.6);
    dot(ctx, 9, -54, 2.6);
    shape(ctx, SK.rect(-74, -6, 148, 10), { fill: '#e2d2b8', lw: 2 });
    ctx.restore();
  }

  S.campus = {
    draw(ctx, lt) {
      const C = TL.cue.campus;
      const touchK = SK.smooth(SK.prog(lt, C.touch - 0.1, C.touch + 0.6));
      ctx.save();
      SH.zoomTo(ctx, lt, C.touch - 0.3, C.touch + 1.6, [640, 425, 1.18], [548, 520, 1.75]);
      // 背景
      SK.vgrad(ctx, [[0, '#cfe9f6'], [0.7, '#fbf1dc']], -200, 560, -400, 2200);
      P.cloud(ctx, 200 + lt * 8, 110, 1.1);
      P.cloud(ctx, 980 + lt * 5, 80, 0.8);
      school(ctx, 760, 548, 0.95);
      SH.ginkgoTree(ctx, 150, 560, 1.35);
      SH.ginkgoTree(ctx, 1190, 560, 1.25);
      shape(ctx, SK.rect(-400, 540, 2200, 30), { fill: '#a8d27a', lw: 2.6 });
      shape(ctx, SK.rect(-400, 566, 2200, 400), { fill: '#efdcbc', lw: 2.6 });
      for (let i = -3; i < 20; i++) line(ctx, [[i * 90, 600 + (i % 2) * 40], [i * 90 + 50, 600 + (i % 2) * 40]], { lw: 1.6, line: 'rgba(150,110,70,0.4)' });
      // 地上的落叶
      for (let i = 0; i < 14; i++) SH.ginkgoLeaf(ctx, SK.hash(i * 4.1) * 1300, 580 + SK.hash(i * 6.2) * 120, 0.8, i * 1.3, i % 2 ? '#f6c945' : '#efa13a');
      // 粉色心动时刻
      if (touchK > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = touchK * 0.75;
        ctx.fillStyle = '#ffd6e2';
        ctx.fillRect(-400, -300, 2200, 1400);
        ctx.restore();
        for (let i = 0; i < 14; i++) {
          const bx = 300 + SK.hash(i * 2.2) * 520, by = 380 + SK.hash(i * 3.3) * 280;
          const r = 14 + SK.hash(i) * 26;
          ctx.save();
          ctx.globalAlpha = touchK * 0.5 * (0.5 + 0.5 * Math.sin(lt * 2 + i));
          SK.glow(ctx, bx, by + Math.sin(lt + i) * 6, r, '#ffffff', 0.9);
          ctx.restore();
        }
      }
      // ---- 角色 ----
      const s = 1.1, gy = 640;
      // 书本
      const bookStart = [[548, 586], [552, 572], [550, 560]];
      const bookEnd = [[608, 664, 0.4, '#f29b9b'], [418, 668, -0.25, '#f6d36b'], [652, 662, 0.15, '#7fb0e0']];
      // 青蛙
      let fx, fface = 'smile', farms = { l: [-20, -16], r: [20, -16] }, fsq = 1, flook = [0.2, 0.5], fhold = SH.books, fblush = 0.4;
      if (lt < C.bump) {
        fx = SH.walk(lt, 0.3, C.bump, -140, 520).x;
      } else {
        const k = SK.backOut(SK.prog(lt, C.bump, C.bump + 0.45));
        fx = 520 - 60 * k;
        fhold = null;
        farms = lt < C.bump + 0.6 ? 'up' : 'down';
        fface = lt < C.look - 0.3 ? 'o' : 'smile';
        fsq = lt < C.bump + 0.6 ? 0.82 : 1;
        flook = lt > C.look ? [1, 0] : [0, -0.6];
      }
      const pickT = C.look + 1.0; // 小猪去捡书
      // 小猪
      let px, py = gy, pfly = lt < C.bump, pface = 'smile', parms = 'phone', plook = [0, 0.6], phold = SH.phoneHeld('#e7849b', 1), pholdL = null;
      if (lt < C.bump) {
        px = SH.walk(lt, 0.6, C.bump, 1420, 760).x;
      } else {
        const k = SK.backOut(SK.prog(lt, C.bump, C.bump + 0.45));
        px = 760 + 70 * k;
        phold = null;
        parms = lt < C.bump + 0.6 ? 'up' : 'down';
        pface = lt < C.look - 0.3 ? 'o' : 'smile';
        plook = lt > C.look ? [-1, 0] : [0, -0.6];
        if (lt > pickT) {
          const m = SK.easeInOut(SK.prog(lt, pickT, pickT + 0.8));
          px = SK.lerp(830, 650, m);
          pfly = lt < pickT + 1.2;
          if (lt > pickT + 0.8) {
            parms = { l: lt > pickT + 1.2 ? [-80, -62] : [-50, -2], r: 'down' };
            pholdL = (c) => P.book(c, -6, -6, 44, 12, 0.2, '#7fb0e0');
          }
        }
      }
      // 青蛙伸手
      if (lt > pickT + 1.1) {
        const m = SK.easeOut(SK.prog(lt, pickT + 1.1, C.touch));
        farms = { l: 'down', r: [SK.lerp(58, 80, m), SK.lerp(-20, -64, m)] };
      }
      if (lt > C.touch) {
        fblush = 1;
        fface = lt > C.touch + 1.4 ? 'love' : 'o';
        pface = lt > C.touch + 1.4 ? 'happy' : 'o';
      }
      // 地上的书
      bookEnd.forEach((b, i) => {
        if (lt < C.bump) return;
        if (i === 2 && lt > pickT + 0.8) return;
        const k = SK.prog(lt, C.bump, C.bump + 0.8 + i * 0.1);
        const st = [fx + 30, 560 - i * 12];
        const x = SK.lerp(548 + 30, b[0], k), y = SK.lerp(570 - i * 12, b[1], k) - Math.sin(k * Math.PI) * (130 + i * 30);
        P.book(ctx, x, y, 44, 12, k < 1 ? k * 9 + i : b[2], b[3]);
      });
      F(ctx, fx, gy, s, { t: lt, walk: lt < C.bump && lt > 0.3 ? lt * 9 : null, arms: farms, hold: fhold, face: fface, squash: fsq, look: flook, blush: fblush });
      G(ctx, px, py, s, { t: lt, fly: pfly, walk: null, arms: parms, hold: phold, holdL: pholdL, face: pface, look: plook, blush: lt > C.touch ? 1 : 0.5, flip: false });
      // 碰撞特效
      if (lt > C.bump && lt < C.bump + 0.5) {
        const k = SK.prog(lt, C.bump, C.bump + 0.5);
        ctx.save();
        ctx.globalAlpha = 1 - k;
        P.star(ctx, 640, 545, 30 + k * 40, '#fff1a8', { rot: k });
        ctx.restore();
        P.burst(ctx, lt, C.bump, 640, 545, { kind: 'star', n: 8, speed: 140, size: 9, colors: ['#ffd35c', '#fff'] });
      }
      if (lt > C.bump + 0.2 && lt < C.look - 0.3) {
        P.dizzy(ctx, fx, gy - 160 * s, lt, 0.9);
        P.dizzy(ctx, px, gy - 150 * s, lt + 1, 0.9);
      }
      if (lt > C.look && lt < C.look + 0.9) {
        P.exclaim(ctx, fx + 10, gy - 175 * s, 1, 1);
        P.exclaim(ctx, px, gy - 165 * s, 1, 1);
      }
      // 触碰：爱心
      if (lt > C.touch) {
        P.burst(ctx, lt, C.touch, 560, 572, { kind: 'heart', n: 10, speed: 150, size: 10, gravity: -40, life: 1.8 });
        P.floatHearts(ctx, lt - C.touch, 560, 540, { n: 7, spread: 90, rise: 140, size: 8 });
        P.twinkles(ctx, lt, { x: 360, y: 360, w: 420, h: 260, n: 14, r: 7, alpha: touchK, line: false, color: '#fff' });
      }
      C.thump.forEach((tt, i) => {
        if (lt > tt && lt < tt + 1.1) {
          const k = SK.pop(lt, tt, 0.25);
          ctx.save();
          ctx.globalAlpha = 1 - SK.prog(lt, tt + 0.7, tt + 1.1);
          ctx.translate(i ? 660 : 450, 450);
          ctx.scale(k * 0.8, k * 0.8);
          text(ctx, '扑通', 0, 0, { size: 40, color: '#ef5a6f', outline: '#fff', outlineW: 6, seed: i });
          ctx.restore();
        }
      });
      ctx.restore();
      // 落叶在最前
      if (touchK < 1) {
        ctx.save();
        ctx.globalAlpha = 1 - touchK;
        SH.fallingLeaves(ctx, lt, { n: 16 });
        ctx.restore();
      }
    },
  };

  /* ================= 3. 互发消息 ================= */
  function room(ctx, x, w, wall, dotCol, kind, floorCol, lt, side) {
    SK.bg(ctx, wall);
    ctx.save();
    ctx.globalAlpha = 0.6;
    SH.wallDots(ctx, x, 0, w, 600, dotCol, kind);
    ctx.restore();
    const k = SK.prog(lt, 0, 14.4);
    const sky1 = k < 0.5 ? SK.mix('#bfe3f5', '#ffc9a0', k * 2) : SK.mix('#ffc9a0', '#3c3f7a', (k - 0.5) * 2);
    const sky2 = k < 0.5 ? SK.mix('#e8f6ff', '#ffe6c0', k * 2) : SK.mix('#ffe6c0', '#6b5c9a', (k - 0.5) * 2);
    const wx = side === 'L' ? x + 70 : x + w - 240;
    P.window(ctx, wx, 110, 170, 150, {
      view: (c, X, Y, W, H) => {
        SK.vgrad(c, [[0, sky1], [1, sky2]], Y, Y + H, X, W);
        if (k > 0.6) P.twinkles(c, lt, { x: X, y: Y, w: W, h: H * 0.6, n: 5, r: 5, alpha: SK.prog(k, 0.6, 0.8) });
        P.cloud(c, X + 50 + lt * 6, Y + 50, 0.45, k > 0.6 ? '#8a7fb8' : '#fff');
      },
      curtain: side === 'L' ? '#b9dca0' : '#f7b6c8',
    });
    const hours = 15 + 8 * Math.pow(k, 1.6);
    P.clock(ctx, side === 'L' ? x + 470 : x + 170, 140, 34, hours);
    SH.floor(ctx, 600, floorCol, x - 20, w + 40);
  }

  function chatSticker(from) {
    return (ctx) => (from === 'F' ? SH.miniFrogFace(ctx, 0, 2, 14) : SH.miniPigFace(ctx, 0, 4, 13));
  }

  S.chat = {
    draw(ctx, lt) {
      const C = TL.cue.chat;
      const FR = [320, 592], PG = [960, 612]; // 两部手机的位置
      // 左：青蛙的房间
      P.panel(ctx, 0, 0, 640, SK.H, (c) => {
        room(c, 0, 640, '#e4f0d0', '#cfe3b5', 'dot', '#e3c39d', lt, 'L');
      });
      P.panel(ctx, 640, 0, 640, SK.H, (c) => {
        room(c, 640, 640, '#fde4ea', '#f8c6d3', 'heart', '#ead0b4', lt, 'R');
      });
      // 计算谁在被“叮”到
      let fHop = 0, pHop = 0, fType = 0, pType = 0;
      C.msgs.forEach((m) => {
        const arrive = m.t + C.flight;
        if (m.from === 'F') {
          pHop = Math.max(pHop, SH.hop(lt, arrive, 10, 0.28));
          if (lt > m.t - 0.5 && lt < m.t) fType = 1;
        } else {
          fHop = Math.max(fHop, SH.hop(lt, arrive, 10, 0.28));
          if (lt > m.t - 0.5 && lt < m.t) pType = 1;
        }
      });
      const heat = SK.prog(lt, 0, 12);
      // 豆袋沙发 & 坐垫
      shape(ctx, SK.spline([[150, 676], [190, 575], [320, 548], [460, 575], [495, 676], [440, 714], [200, 714]]), { fill: '#f4b183', shade: '#d98f5f' });
      shape(ctx, SK.ell(960, 684, 180, 38), { fill: '#c9b6ea', shade: '#a792d4' });
      const jf = fType ? Math.sin(lt * 40) * 2 : 0, jp = pType ? Math.sin(lt * 40) * 2 : 0;
      F(ctx, 320, 668 - fHop, 1.65, { t: lt, arms: { l: [-13 + jf, -34], r: [13 - jf, -34] }, hold: SH.phoneHeld('#5f9a6e', 0.8), face: fHop > 2 ? 'open' : 'smile', look: [0, 0.7], blush: 0.3 + heat * 0.8 });
      G(ctx, 960, 676 - pHop, 1.65, { t: lt, arms: { l: [-13 + jp, -20], r: [13 - jp, -20] }, hold: SH.phoneHeld('#e7849b', 0.8), face: pHop > 2 ? 'open' : 'smile', look: [0, 0.7], blush: 0.3 + heat * 0.8 });
      P.divider(ctx, 640);
      // 飞行的消息气泡
      C.msgs.forEach((m, i) => {
        const k = (lt - m.t) / C.flight;
        if (k < 0 || k > 1.25) return;
        const a = m.from === 'F' ? FR : PG, b = m.from === 'F' ? PG : FR;
        const kk = SK.easeInOut(Math.min(1, k));
        const peak = 150 + (i % 3) * 50;
        const x = SK.lerp(a[0], b[0], kk);
        const y = SK.lerp(a[1] - 40, b[1] - 40, kk) - Math.sin(kk * Math.PI) * (a[1] - peak);
        const sc = k > 1 ? Math.max(0, 1 - (k - 1) * 4) * 0.5 : 0.45 + Math.sin(Math.min(1, k) * Math.PI) * 0.6;
        const col = m.from === 'F' ? P.COL.frogMsg : P.COL.pigMsg;
        const opt = { scale: sc, color: col, tail: m.from === 'F' ? 'left' : 'right', size: 26, seed: i };
        if (m.kind === 'text') opt.text = m.text;
        else if (m.kind === 'heart') {
          opt.w = 58;
          opt.h = 46;
          opt.icon = (c) => P.heart(c, 0, 0, 13, P.COL.heart);
        } else {
          opt.w = 60;
          opt.h = 50;
          opt.icon = chatSticker(m.from);
        }
        P.bubble(ctx, x, y, opt);
        if (k > 1 && k < 1.25) P.burst(ctx, lt, m.t + C.flight, b[0], b[1] - 40, { kind: 'star', n: 6, speed: 60, size: 6, life: 0.3, colors: ['#fff6a8', '#ffffff'] });
      });
      // 越聊越开心：爱心冒泡
      if (lt > 9) {
        const a = SK.prog(lt, 9, 11);
        P.floatHearts(ctx, lt, FR[0], FR[1] - 60, { n: 8, spread: 160, rise: 260, size: 10, alpha: a, seed: 3 });
        P.floatHearts(ctx, lt, PG[0], PG[1] - 60, { n: 8, spread: 160, rise: 260, size: 10, alpha: a, seed: 8 });
      }
      if (lt > 12.4) {
        const a = SK.smooth(SK.prog(lt, 12.4, 14));
        P.floatHearts(ctx, lt, 640, 720, { n: 26, spread: 1300, rise: 800, life: 3, size: 16, alpha: a, seed: 21 });
      }
    },
  };

  /* ================= 4. 两个环球影城 ================= */
  function globe(ctx, x, y, r, lt, dir, label) {
    // 底座 & 喷泉
    shape(ctx, SK.ell(x, y + r + 34, r * 1.3, 24), { fill: '#b9dcef', lw: 2.6 });
    shape(ctx, SK.ell(x, y + r + 28, r * 1.1, 16), { fill: '#d9f0fb', line: false });
    for (let i = 0; i < 6; i++) {
      const k = (lt * 1.5 + i / 6) % 1;
      SK.dot(ctx, x - r + (i / 5) * 2 * r, y + r + 20 - Math.sin(k * Math.PI) * 30, 3, '#ffffff');
    }
    shape(ctx, SK.rect(x - 10, y + r - 6, 20, 34), { fill: '#c9ccd6', lw: 2.2 });
    const ringTilt = -0.28 * dir;
    const ring = (front) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ringTilt);
      ctx.beginPath();
      if (front) ctx.rect(-r * 1.6, 0, r * 3.2, r);
      else ctx.rect(-r * 1.6, -r, r * 3.2, r);
      ctx.clip();
      shape(ctx, SK.ell(0, 0, r * 1.42, r * 0.36), { fill: null, line: SK.INK, lw: 14 });
      shape(ctx, SK.ell(0, 0, r * 1.42, r * 0.36), { fill: null, line: '#e7ebf2', lw: 9, wob: 0.6 });
      ctx.restore();
    };
    ring(false);
    shape(ctx, SK.circ(x, y, r), { fill: '#7cc3ea', shade: '#4c9ccc', shadeDist: 14 });
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r - 2, 0, Math.PI * 2);
    ctx.clip();
    const lands = [[0.0, -0.3, 0.6, 0.35], [1.4, 0.2, 0.45, 0.4], [2.6, -0.15, 0.7, 0.3], [4.2, 0.35, 0.5, 0.28], [5.2, -0.4, 0.35, 0.25]];
    lands.forEach(([lon, lat, w, h], i) => {
      const L = lon + lt * 0.7 * dir;
      const cz = Math.cos(L);
      if (cz < 0.05) return;
      const lx = x + Math.sin(L) * r * Math.cos(lat), ly = y + Math.sin(lat) * r;
      shape(ctx, SK.ell(lx, ly, w * r * 0.5 * cz, h * r * 0.6, i), { fill: '#9ed27a', line: '#4f8a50', lw: 1.6 });
    });
    ctx.restore();
    SK.line(ctx, [[x - r * 0.55, y - r * 0.45], [x - r * 0.35, y - r * 0.65]], { lw: 4, line: 'rgba(255,255,255,0.8)' });
    ring(true);
    ctx.save();
    ctx.translate(x, y + r * 0.3);
    ctx.rotate(ringTilt);
    text(ctx, label, 0, 4, { size: 22, color: '#3b4a6b', seed: 3, spacing: 0.15 });
    ctx.restore();
  }
  function castle(ctx, x, y, lt) {
    const wall = '#f8cfdc', sh = '#e7a9bf', roof = '#b79be0';
    const tower = (tx, w, h, rh) => {
      shape(ctx, SK.rect(tx - w / 2, y - h, w, h), { fill: wall, shade: sh });
      shape(ctx, SK.poly([[tx - w / 2 - 8, y - h], [tx, y - h - rh], [tx + w / 2 + 8, y - h]]), { fill: roof, shade: '#957ac4' });
      shape(ctx, SK.rrect(tx - 7, y - h + 26, 14, 22, 7), { fill: '#8fc3e8', lw: 2 });
    };
    tower(x - 92, 50, 230, 70);
    tower(x + 92, 50, 230, 70);
    shape(ctx, SK.rect(x - 70, y - 170, 140, 170), { fill: wall, shade: sh });
    for (let i = 0; i < 5; i++) shape(ctx, SK.rect(x - 70 + i * 30, y - 186, 18, 18), { fill: wall, lw: 2.2 });
    tower(x, 56, 290, 90);
    const wv = Math.sin(lt * 4) * 4;
    line(ctx, [[x, y - 380], [x, y - 410]], { lw: 2.4 });
    shape(ctx, SK.poly([[x, y - 410], [x + 28, y - 402 + wv], [x, y - 394]]), { fill: '#ffd35c', lw: 2 });
    shape(ctx, SK.rrect(x - 26, y - 70, 52, 70, 26), { fill: '#b98258', lw: 2.4 });
  }
  function coaster(ctx, x0, lt) {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const k = i / 40;
      pts.push([x0 + k * 560, 300 - Math.sin(k * Math.PI * 2.2) * 90 - k * 40]);
    }
    for (let i = 0; i <= 40; i += 4) line(ctx, [[pts[i][0], pts[i][1]], [pts[i][0], 560]], { lw: 2, line: '#9aa3b5' });
    SK.line(ctx, pts, { lw: 7, line: '#e86a6a' });
    SK.line(ctx, pts.map(([a, b]) => [a, b + 8]), { lw: 2.4 });
    const k = (lt * 0.25) % 1;
    const i = Math.floor(k * 40);
    const p = pts[i];
    shape(ctx, SK.rrect(p[0] - 18, p[1] - 22, 36, 18, 6), { fill: '#ffd35c', lw: 2.2 });
  }
  function palm(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const trunk = [];
    for (let i = 0; i <= 10; i++) trunk.push([Math.sin(i * 0.3) * 10, -i * 18]);
    SK.line(ctx, trunk, { lw: 14, line: '#b98a5c' });
    SK.line(ctx, trunk, { lw: 2.4 });
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.62 + Math.sin(SK.t * 1.5 + i) * 0.05;
      const ex = Math.cos(a) * 90, ey = -180 + Math.sin(a) * 50 + 30;
      const pts = SK.spline([[8, -180], [ex * 0.5, -200 + Math.sin(a) * 30], [ex, ey], [ex * 0.55, -170 + Math.sin(a) * 10]]);
      shape(ctx, pts, { fill: '#7cbf6a', lw: 2.2 });
    }
    ctx.restore();
  }
  function dino(ctx, x, y, lt) {
    const bob = Math.sin(lt * 1.6) * 8;
    const neck = SK.spline([[x - 30, y + 120], [x - 20, y], [x + 10, y - 90 + bob], [x + 40, y - 120 + bob], [x + 90, y - 110 + bob], [x + 96, y - 88 + bob], [x + 50, y - 84 + bob], [x + 30, y - 50 + bob], [x + 34, y + 120]]);
    shape(ctx, neck, { fill: '#9fc98a', shade: '#78a866' });
    dot(ctx, x + 66, y - 106 + bob, 3.4);
    curve(ctx, x + 70, y - 92 + bob, x + 80, y - 88 + bob, x + 90, y - 94 + bob, { lw: 2 });
    [[x + 4, y - 40], [x + 16, y - 70], [x + 30, y - 98]].forEach(([a, b]) => dot(ctx, a, b + bob * 0.5, 5, '#78a866'));
  }
  function balloon(ctx, lt) {
    const sw = Math.sin(lt * 2) * 6;
    curve(ctx, 0, 0, -6 + sw, -60, -10 + sw, -112, { lw: 1.4 });
    shape(ctx, SK.ell(-10 + sw, -140, 24, 28), { fill: '#ff8fa3', lw: 2.4 });
    line(ctx, [[-20 + sw, -152], [-14 + sw, -158]], { lw: 2.4, line: 'rgba(255,255,255,0.8)' });
  }
  function cottonCandy(ctx) {
    line(ctx, [[0, 0], [0, -46]], { lw: 3 });
    shape(ctx, SK.spline([[-22, -50], [-26, -70], [-10, -88], [12, -86], [26, -70], [20, -50], [0, -42]]), { fill: '#ffc6e0', lw: 2.2 });
  }
  function selfiePhoto(who) {
    return (ctx, w, h) => {
      if (who === 'F') {
        SK.vgrad(ctx, [[0, '#bfe4f7'], [1, '#eaf7ff']], 0, h, 0, w);
        shape(ctx, SK.circ(w * 0.75, h * 0.4, 26), { fill: '#7cc3ea', lw: 1.8 });
        F(ctx, w * 0.4, h + 10, 0.55, { t: SK.t, face: 'open', arms: 'cheer', blink: false });
      } else {
        SK.vgrad(ctx, [[0, '#ffd9b8'], [1, '#fff1dc']], 0, h, 0, w);
        palm(ctx, w * 0.82, h, 0.32);
        G(ctx, w * 0.45, h + 14, 0.55, { t: SK.t, face: 'open', arms: 'cheer', blink: false });
      }
    };
  }

  S.universal = {
    draw(ctx, lt) {
      const C = TL.cue.universal;
      const selfie = lt > C.selfie && lt < C.fly + 0.2;
      const landed = lt > C.land;
      // 左：青蛙
      P.panel(ctx, 0, 0, 640, SK.H, (c) => {
        SK.vgrad(c, [[0, '#bfe4f7'], [1, '#effaff']], 0, 560);
        P.cloud(c, 120 + lt * 6, 90, 0.8);
        castle(c, 470, 560, lt);
        coaster(c, 40, lt);
        shape(c, SK.rect(-20, 556, 680, 200), { fill: '#efe0c8', lw: 2.6 });
        for (let i = 0; i < 8; i++) line(c, [[i * 90, 556], [i * 90 - 40, 720]], { lw: 1.4, line: 'rgba(150,110,70,0.35)' });
        globe(c, 170, 380, 92, lt, 1, '环球影城');
        const hop = lt < C.selfie ? Math.abs(Math.sin(lt * 5)) * 12 : landed ? SH.hop(lt, C.land + 0.4, 18, 0.35) + SH.hop(lt, C.land + 0.9, 14, 0.3) : 0;
        let arms = { l: [-58, -30], r: 'down' };
        let holdR = null;
        if (selfie) {
          arms = { l: [-58, -30], r: [72, -124] };
          holdR = (cc) => P.phone(cc, 0, -14, 0.62, { color: '#5f9a6e', rot: -0.2 });
        } else if (landed) {
          arms = { l: [-58, -30], r: [72, -96] };
          holdR = (cc) => P.polaroid(cc, 6, -50, 0.5, 0.1, selfiePhoto('P'));
        }
        F(c, 430, 640 - hop, 1.15, { t: lt, arms, holdL: (cc) => balloon(cc, lt), holdR, face: selfie ? 'open' : landed ? (lt < C.land + 0.4 ? 'o' : 'open') : 'smile', look: selfie ? [0.5, -0.5] : [0.3, 0], blush: 0.6 });
        if (lt > C.land && lt < C.land + 0.8) P.exclaim(c, 430, 440, 1, 2);
        if (lt > C.land + 0.9) P.bubble(c, 250, 420, { text: '好巧!', color: P.COL.frogMsg, tail: 'right', size: 28, scale: SK.pop(lt, C.land + 0.9) });
      });
      // 右：小猪
      P.panel(ctx, 640, 0, 640, SK.H, (c) => {
        SK.vgrad(c, [[0, '#ffcfae'], [1, '#fff3df']], 0, 560);
        P.sun(c, 1180, 110, 34, '#ffd27a');
        dino(c, 700, 300, lt);
        palm(c, 690, 560, 1.1);
        palm(c, 1230, 560, 1.2);
        palm(c, 800, 560, 0.8);
        shape(c, SK.rect(620, 556, 680, 200), { fill: '#f3dcc2', lw: 2.6 });
        for (let i = 0; i < 8; i++) line(c, [[680 + i * 90, 556], [720 + i * 90, 720]], { lw: 1.4, line: 'rgba(150,110,70,0.35)' });
        globe(c, 1110, 380, 92, lt, -1, '环球影城');
        const hop = landed ? SH.hop(lt, C.land + 0.5, 18, 0.35) : 0;
        let arms = { l: 'down', r: [58, -30] };
        let holdL = null;
        if (selfie) {
          arms = { l: [-72, -120], r: [58, -30] };
          holdL = (cc) => P.phone(cc, 0, -14, 0.62, { color: '#e7849b', rot: 0.2 });
        } else if (landed) {
          arms = { l: [-72, -92], r: [58, -30] };
          holdL = (cc) => P.polaroid(cc, -6, -50, 0.5, -0.1, selfiePhoto('F'));
        }
        G(c, 860, 610 - hop, 1.1, { t: lt, fly: true, arms, holdL, holdR: cottonCandy, face: selfie ? 'open' : landed ? (lt < C.land + 0.4 ? 'o' : 'open') : 'smile', look: selfie ? [-0.5, -0.5] : [-0.3, 0] });
        if (lt > C.land && lt < C.land + 0.8) P.exclaim(c, 860, 410, 1, 2);
        if (lt > C.land + 1.1) P.bubble(c, 1040, 330, { text: '哈哈哈!', color: P.COL.pigMsg, tail: 'left', size: 28, scale: SK.pop(lt, C.land + 1.1) });
      });
      // 闪光
      if (lt > C.flash && lt < C.flash + 0.5) {
        ctx.save();
        ctx.globalAlpha = 1 - SK.prog(lt, C.flash, C.flash + 0.5);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, SK.W, SK.H);
        ctx.restore();
      }
      P.divider(ctx, 640);
      // 照片交叉飞过
      if (lt > C.fly && lt < C.land) {
        const k = SK.easeInOut(SK.prog(lt, C.fly, C.land));
        const arc = Math.sin(k * Math.PI) * 260;
        P.polaroid(ctx, SK.lerp(520, 800, k), SK.lerp(500, 450, k) - arc, 0.5 + Math.sin(k * Math.PI) * 0.3, k * 6.28, selfiePhoto('F'));
        P.polaroid(ctx, SK.lerp(760, 480, k), SK.lerp(480, 450, k) - arc, 0.5 + Math.sin(k * Math.PI) * 0.3, -k * 6.28, selfiePhoto('P'));
        if (Math.abs(k - 0.5) < 0.1) P.sparkle(ctx, 640, 210, 30, '#fff3a0');
      }
      P.burst(ctx, lt, C.fly + 0.8, 640, 230, { kind: 'heart', n: 10, speed: 120, size: 10 });
    },
  };

  /* ================= 5. 晚安 ================= */
  function nightRoom(ctx, x, w, wall, lamp, lt) {
    SK.bg(ctx, wall);
    ctx.save();
    ctx.globalAlpha = 0.25;
    SH.wallDots(ctx, x, 0, w, 600, '#ffffff', 'star');
    ctx.restore();
    P.window(ctx, x + w - 230, 90, 160, 150, {
      view: (c, X, Y, W, H) => {
        SK.vgrad(c, [[0, '#1f2450'], [1, '#4b3f78']], Y, Y + H, X, W);
        P.twinkles(c, lt, { x: X, y: Y, w: W, h: H, n: 7, r: 5 });
        P.moon(c, X + W * 0.68, Y + H * 0.35, 18);
      },
      frame: '#d8cbe8',
    });
    SH.floor(ctx, 610, SK.mix(wall, '#7a5a40', 0.4), x - 20, w + 40);
  }
  function inBed(ctx, who, x, y, s, o, blanketCol, pattern, sink = 0) {
    // y：床垫高度；sink：躺下去的程度
    ctx.save();
    shape(ctx, SK.rrect(x - 170 * s, y - 150 * s, 30 * s, 220 * s, 10), { fill: '#c99b6d', lw: 2.6 });
    SH.pillow(ctx, x - 10 * s, y - 104 * s + sink * 30 * s, 190 * s, 64 * s);
    (who === 'F' ? F : G)(ctx, x, y + (6 + sink * 34) * s, s, o);
    SH.blanket(ctx, x + 10 * s, y - 8 * s, 300 * s, blanketCol, pattern);
    shape(ctx, SK.rect(x - 160 * s, y + 30 * s, 340 * s, 40 * s), { fill: '#c99b6d', lw: 2.6 });
    ctx.restore();
  }
  function houseOnHill(ctx, x, y, roof, lit) {
    shape(ctx, SK.rect(x - 50, y - 70, 100, 70), { fill: '#f1e3cf', lw: 2.6 });
    shape(ctx, SK.poly([[x - 66, y - 66], [x, y - 120], [x + 66, y - 66]]), { fill: roof, lw: 2.6 });
    SK.glow(ctx, x, y - 38, 70 * lit, '#ffe9a0', 0.6);
    shape(ctx, SK.rect(x - 18, y - 54, 36, 30), { fill: SK.mix('#3b3a5a', '#ffe9a0', lit), lw: 2.2 });
    line(ctx, [[x, y - 54], [x, y - 24]], { lw: 1.8 });
  }
  function goodnightBubble(ctx, x, y, sc, color) {
    P.bubble(ctx, x, y, { text: '晚安', size: 30, color, w: 120, tail: 'down', scale: sc, icon: (c, w) => SH.moonIcon(c, w / 2 - 20, -4, 9) });
  }

  S.night = {
    tin: ['night', 0.5],
    tout: ['white', 0.6],
    draw(ctx, lt) {
      const C = TL.cue.night;
      if (lt < 3.6) {
        // A：小猪在床上打字
        nightRoom(ctx, 0, SK.W, '#5a5487', 1, lt);
        P.lamp(ctx, 250, 520, 1.2, 1);
        shape(ctx, SK.rect(160, 520, 180, 90), { fill: '#b98e64', lw: 2.6 });
        const typing = lt < C.send ? Math.sin(lt * 40) * 2 : 0;
        SK.glow(ctx, 640, 470, 220, '#ffe9b0', 0.25);
        inBed(ctx, 'P', 640, 560, 1.35, { t: lt, arms: { l: [-13 + typing, -28], r: [13 - typing, -28] }, hold: SH.phoneHeld('#e7849b', 1), face: lt > C.send ? 'happy' : 'smile', look: [0, 0.8], blush: 0.8 }, '#f4a9bd', (c, x, y) => P.heart(c, x, y, 7, '#ffe0ea', { shine: false }));
        if (lt > C.send) {
          const k = SK.prog(lt, C.send + 0.6, 3.4);
          const x = SK.lerp(640, 1040, SK.easeIn(k)), y = SK.lerp(380, 150, SK.easeIn(k));
          goodnightBubble(ctx, x, y, SK.pop(lt, C.send) * (1 - k * 0.7), P.COL.pigMsg);
        }
        return;
      }
      if (lt < 6.4) {
        // B：夜空中划过的“晚安”
        const l2 = lt - 3.6;
        SK.vgrad(ctx, [[0, '#1b1f48'], [1, '#54448a']]);
        P.twinkles(ctx, lt, { n: 40, h: 420, r: 6 });
        P.moon(ctx, 640, 120, 52);
        shape(ctx, SK.spline([[-40, 560], [120, 470], [300, 430], [470, 480], [560, 600], [560, 760], [-40, 760]]), { fill: '#3f5a7a', lw: 2.6 });
        shape(ctx, SK.spline([[1320, 560], [1160, 470], [980, 430], [810, 480], [720, 600], [720, 760], [1320, 760]]), { fill: '#4a5f86', lw: 2.6 });
        const arrive = C.star[1] - 3.6;
        houseOnHill(ctx, 290, 440, '#7fb956', 1 + SH.hop(l2, arrive, 0.8, 0.6));
        houseOnHill(ctx, 990, 440, '#f08aa3', 1);
        const k = SK.easeInOut(SK.prog(lt, C.star[0], C.star[1]));
        if (k > 0 && k < 1) {
          for (let i = 0; i < 14; i++) {
            const kk = Math.max(0, k - i * 0.02);
            const x = SK.lerp(990, 290, kk), y = SK.lerp(400, 400, kk) - Math.sin(kk * Math.PI) * 230;
            ctx.save();
            ctx.globalAlpha = (1 - i / 14) * 0.8;
            P.sparkle(ctx, x + (SK.hash(i + SK.boil) - 0.5) * 10, y, 10 - i * 0.5, '#fff3a8', { line: false });
            ctx.restore();
          }
          const x = SK.lerp(990, 290, k), y = 400 - Math.sin(k * Math.PI) * 230;
          SK.glow(ctx, x, y, 90, '#fff3c0', 0.5);
          goodnightBubble(ctx, x, y - 10, 0.8, P.COL.pigMsg);
        }
        if (l2 > arrive) P.burst(ctx, l2, arrive, 290, 400, { kind: 'star', n: 10, speed: 90, size: 8, colors: ['#fff3a8', '#ffffff'] });
        return;
      }
      // C：两个人都安心睡着
      const off = SK.smooth(SK.prog(lt, C.lightsOff, C.lightsOff + 0.6));
      const zoom = SK.easeIn(SK.prog(lt, 10.2, 12));
      ctx.save();
      SK.camera(ctx, SK.lerp(640, 320, zoom), SK.lerp(360, 330, zoom), 1 + zoom * 1.6);
      P.panel(ctx, 0, 0, 640, SK.H, (c) => {
        nightRoom(c, 0, 640, '#4f6a6a', 1, lt);
        SK.glow(c, 320, 470, 200, '#fff3b0', 0.35 * (1 - off) + 0.2 * SK.prog(lt, C.read - 0.2, C.read));
        const hugK = SK.prog(lt, C.read + 0.6, C.read + 1.0);
        const arms = lt < C.read + 0.6 ? { l: [-13, -28], r: [13, -28] } : 'hug';
        inBed(c, 'F', 320, 560, 1.2, { t: lt, arms, hold: SH.phoneHeld('#5f9a6e', 1 - off), face: lt > C.lightsOff ? 'sleep' : lt > C.read ? 'happy' : 'smile', look: [0, 0.8], blush: lt > C.read ? 1 : 0.5 }, '#9cd08a', (cc, x, y) => SK.dot(cc, x, y, 6, '#c9e8b8'), off);
        if (lt > C.read && lt < C.lightsOff + 0.4) goodnightBubble(c, 320, 330, SK.pop(lt, C.read), P.COL.pigMsg);
        if (lt > C.read + 0.4 && lt < C.lightsOff) P.floatHearts(c, lt, 320, 380, { n: 5, spread: 80, rise: 100, size: 9 });
        if (lt > C.lightsOff + 0.5) CH.zzz(c, 380, 380, lt, 1);
      });
      P.panel(ctx, 640, 0, 640, SK.H, (c) => {
        nightRoom(c, 640, 640, '#5a5487', 1, lt);
        inBed(c, 'P', 960, 560, 1.2, { t: lt, arms: lt < C.read ? { l: [-13, -28], r: [13, -28] } : 'hug', hold: SH.phoneHeld('#e7849b', 0.6 * (1 - off)), face: lt > C.lightsOff ? 'sleep' : 'happy', look: [0, 0.8], blush: 0.8 }, '#f4a9bd', (cc, x, y) => P.heart(cc, x, y, 7, '#ffe0ea', { shine: false }), off);
        if (lt > C.lightsOff + 0.8) CH.zzz(c, 1020, 380, lt + 0.4, 1);
      });
      // 关灯
      if (off > 0) {
        ctx.save();
        ctx.globalAlpha = off * 0.45;
        ctx.fillStyle = '#141433';
        ctx.fillRect(-100, -100, SK.W + 200, SK.H + 200);
        ctx.restore();
      }
      P.divider(ctx, 640);
      ctx.restore();
      // 梦的气泡
      if (lt > 9.6) {
        const k = SK.easeIn(SK.prog(lt, 9.6, 12));
        const cx = SK.lerp(420, 640, k), cy = SK.lerp(250, 360, k);
        for (let i = 0; i < 3; i++) {
          const kk = SK.pop(lt, 9.6 + i * 0.25, 0.3);
          shape(ctx, SK.circ(SK.lerp(330, cx, (i + 1) / 4), SK.lerp(380, cy, (i + 1) / 4), (6 + i * 6) * kk), { fill: '#f6f0ff', lw: 2.2 });
        }
        const r = SK.pop(lt, 10.4, 0.5) * (90 + k * 900);
        if (r > 1) P.cloud(ctx, cx, cy + r * 0.2, r / 60, '#f6f0ff');
      }
    },
  };

  /* ================= 6. 梦：楼梯上的比心 ================= */
  function dreamBg(ctx, lt) {
    SK.vgrad(ctx, [[0, '#d8c8f2'], [0.6, '#f8d4e6'], [1, '#ffe8d6']], -400, 1100, -400, 2200);
    P.twinkles(ctx, lt, { x: -200, y: -300, w: 1800, h: 1100, n: 40, r: 7, color: '#ffffff' });
    for (let i = 0; i < 6; i++) P.cloud(ctx, -100 + i * 280 + Math.sin(lt * 0.3 + i) * 20, 120 + (i % 2) * 70 - 200, 1.1 + (i % 3) * 0.3, '#fff8fd', { line: '#c9b4e0' });
  }
  function stairs(ctx, n) {
    for (let i = n - 1; i >= 0; i--) {
      const x = 60 + i * 130, y = 640 - i * 62;
      shape(ctx, SK.poly([[x, y], [x + 150, y], [x + 150, y + 40], [x, y + 40]]), { fill: i % 2 ? '#fff6fb' : '#fde3ef', lw: 2.6, shade: '#efc6dc' });
      shape(ctx, SK.poly([[x, y], [x + 20, y - 14], [x + 170, y - 14], [x + 150, y]]), { fill: '#ffffff', lw: 2.2 });
      shape(ctx, SK.poly([[x + 150, y], [x + 170, y - 14], [x + 170, y + 26], [x + 150, y + 40]]), { fill: '#f3cfe2', lw: 2.2 });
    }
  }
  function dreamFrame(ctx, lt) {
    const g = ctx.createRadialGradient(640, 360, 300, 640, 360, 760);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,250,255,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SK.W, SK.H);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + lt * 0.05;
      const x = 640 + Math.cos(a) * 700, y = 360 + Math.sin(a) * 440;
      shape(ctx, SK.circ(x, y, 110 + SK.hash(i) * 40), { fill: '#fffaff', line: false, tex: 0 });
    }
  }

  S.dream = {
    tin: ['white', 0.8],
    tout: ['white', 0.8],
    draw(ctx, lt) {
      const C = TL.cue.dream;
      const step = (i) => [60 + i * 130 + 85, 640 - i * 62 - 6];
      const fp = step(1), pp = step(5);
      ctx.save();
      // 镜头：从青蛙往上看到小猪，再拉远
      const k1 = SK.easeInOut(SK.prog(lt, 0.4, 3.0));
      const k2 = SK.easeInOut(SK.prog(lt, C.heart + 0.4, C.catch));
      let cx = SK.lerp(fp[0] + 60, pp[0], k1), cy = SK.lerp(fp[1] - 120, pp[1] - 100, k1), z = SK.lerp(1.6, 1.5, k1);
      cx = SK.lerp(cx, 600, k2);
      cy = SK.lerp(cy, 400, k2);
      z = SK.lerp(z, 1.0, k2);
      SK.camera(ctx, cx, cy, z);
      dreamBg(ctx, lt);
      stairs(ctx, 8);
      // 小猪：先背对着往上走，然后转身比心
      const turned = lt > C.turn;
      const heartPose = lt > C.heart - 0.3;
      G(ctx, pp[0], pp[1], 1.0, {
        t: lt,
        back: !turned,
        walk: !turned && lt > 0.5 ? lt * 7 : null,
        arms: heartPose ? 'heart' : 'down',
        face: heartPose ? 'happy' : 'smile',
        look: [-0.6, 0.4],
        blush: 1,
      });
      if (lt > C.turn && lt < C.turn + 0.3) P.sparkle(ctx, pp[0] + 50, pp[1] - 120, 14, '#fff');
      // 青蛙
      const caught = lt > C.catch;
      const melt = caught ? 1 + Math.sin((lt - C.catch) * 6) * 0.04 - 0.08 : 1;
      F(ctx, fp[0], fp[1], 1.0, {
        t: lt,
        face: caught ? 'love' : lt > C.heart ? 'o' : 'smile',
        look: [0.7, -0.8],
        arms: caught ? 'hug' : lt > C.heart + 1.2 ? 'up' : 'down',
        blush: caught ? 1 : 0.5,
        squash: melt,
        hold: caught ? (c) => P.heart(c, 0, -6, 26, '#ff7d93') : null,
      });
      // 比心飞出的大爱心
      if (lt > C.heart && lt < C.catch) {
        const k = SK.prog(lt, C.heart, C.catch);
        const sx = pp[0], sy = pp[1] - 150;
        const ex = fp[0], ey = fp[1] - 50;
        const x = SK.lerp(sx, ex, SK.easeInOut(k)), y = SK.lerp(sy, ey, SK.easeInOut(k)) - Math.sin(k * Math.PI) * 80;
        const size = SK.lerp(20, 34, Math.sin(k * Math.PI)) * SK.pop(lt, C.heart, 0.4);
        SK.glow(ctx, x, y, size * 3, '#ffc2d1', 0.6);
        P.heart(ctx, x, y, size, '#ff7d93', { rot: Math.sin(lt * 6) * 0.2 });
        for (let i = 1; i < 8; i++) {
          const kk = Math.max(0, k - i * 0.03);
          ctx.save();
          ctx.globalAlpha = 0.6 * (1 - i / 8);
          P.sparkle(ctx, SK.lerp(sx, ex, SK.easeInOut(kk)), SK.lerp(sy, ey, SK.easeInOut(kk)) - Math.sin(kk * Math.PI) * 80, 8, '#fff', { line: false });
          ctx.restore();
        }
      }
      if (caught) {
        P.burst(ctx, lt, C.catch, fp[0], fp[1] - 60, { kind: 'heart', n: 12, speed: 160, size: 10 });
        P.floatHearts(ctx, lt - C.catch, fp[0], fp[1] - 100, { n: 6, spread: 100, rise: 150, size: 9 });
      }
      ctx.restore();
      dreamFrame(ctx, lt);
    },
  };

  /* ================= 7. 10/19 表白 ================= */
  S.d1019 = {
    draw(ctx, lt) {
      const C = TL.cue.d1019;
      if (lt < 2.6) {
        SK.bg(ctx, '#fdf1e2');
        for (let i = 0; i < 16; i++) P.heart(ctx, SK.hash(i * 2.1) * SK.W, SK.hash(i * 3.7) * SK.H, 8, '#ffd0db', { alpha: 0.6, shine: false });
        P.dateCard(ctx, lt, '10/19', { start: 0.15, end: 2.1, month: '十月', top: '#f07a8a' });
        return;
      }
      const burst = lt > C.burst;
      const bk = SK.smooth(SK.prog(lt, C.burst, C.burst + 0.4));
      // 房间
      SK.bg(ctx, SK.mix('#e9e2f4', '#ffd6e2', bk));
      ctx.save();
      ctx.globalAlpha = 0.5 * (1 - bk);
      SH.wallDots(ctx, 0, 0, SK.W, SK.H, '#d9cfee', 'dot');
      ctx.restore();
      if (burst) {
        P.radialLines(ctx, 330, 420, lt, { color: '#ffffff', alpha: 0.8 * bk, r0: 200, n: 48 });
        P.radialLines(ctx, 330, 420, lt, { color: '#ffb3c6', alpha: 0.5 * bk, r0: 240, n: 30 });
      }
      // 青蛙（左）
      const read = SK.prog(lt, C.msgs[0], C.yesno);
      let hop = 0, face = 'smile', arms = { l: [-13, -40], r: [13, -40] }, hold = SH.phoneHeld('#5f9a6e', 1), shiver = 0;
      if (lt > C.msgs[2]) face = 'o';
      if (lt > C.yesno) {
        face = 'o';
        shiver = 2;
      }
      if (burst) {
        const b = lt - C.burst;
        hop = Math.abs(Math.sin(b * 6.5)) * 46;
        face = Math.floor(b * 3) % 2 ? 'open' : 'love';
        arms = 'cheer';
        hold = null;
        shiver = 0;
      }
      SK.shake(ctx, lt, burst ? 3 * (1 - SK.prog(lt, C.burst, C.burst + 2)) : 0);
      const fx = 320, fy = 700, FS = 2.1;
      F(ctx, fx, fy - hop, FS, { t: lt, arms, hold, face, look: burst ? [0, -0.3] : [0.6, 0.5], blush: 0.4 + read * 0.8, shiver, sweat: lt > C.yesno && !burst });
      // 心跳：胸口的小心脏
      const bpm = SK.lerp(1.4, 4.5, read) + (burst ? 2 : 0);
      const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * bpm)), 6);
      if (lt > C.msgs[1]) {
        const size = (burst ? 40 : 14 + read * 10) * (1 + beat * 0.35);
        P.heart(ctx, fx - 8, fy - hop - 60 * FS, size * 1.15, '#ef5a6f');
      }
      if (burst) {
        P.steam(ctx, fx, fy - hop - 290, lt, 1.3);
        P.exclaim(ctx, fx + 170, fy - hop - 300, 1.5, 3);
        P.burst(ctx, lt, C.burst, fx, fy - 150, { kind: 'heart', n: 16, speed: 300, size: 14, life: 2 });
        P.floatHearts(ctx, lt - C.burst, fx, fy - 150, { n: 10, spread: 260, rise: 300, size: 12 });
      }
      // 大手机（右）
      const pk = SK.backOut(SK.prog(lt, 2.6, 3.1));
      const away = SK.easeIn(SK.prog(lt, C.burst + 0.6, C.burst + 1.4));
      ctx.save();
      ctx.translate(880 + away * 500, 370 + (1 - pk) * 500);
      ctx.rotate(0.04 + away * 0.6);
      const W = 330, H = 560;
      shape(ctx, SK.rrect(-W / 2, -H / 2, W, H, 36), { fill: '#5f9a6e', lw: 3.2 });
      shape(ctx, SK.rrect(-W / 2 + 14, -H / 2 + 46, W - 28, H - 92, 14), { fill: '#fffaf4', lw: 2.4, tex: 0.08 });
      shape(ctx, SK.rrect(-40, -H / 2 + 18, 80, 14, 7), { fill: '#3e6a4c', line: false });
      // 顶栏：小猪头像
      SH.miniPigFace(ctx, -W / 2 + 46, -H / 2 + 76, 14);
      text(ctx, '苍蝇猪', -W / 2 + 104, -H / 2 + 76, { size: 22, seed: 5 });
      line(ctx, [[-W / 2 + 16, -H / 2 + 100], [W / 2 - 16, -H / 2 + 100]], { lw: 1.6, line: 'rgba(60,40,30,0.4)' });
      ctx.save();
      ctx.beginPath();
      ctx.rect(-W / 2 + 14, -H / 2 + 102, W - 28, H - 150);
      ctx.clip();
      // 消息：一条接一条，长长的告白（用波浪线代表文字）
      const rows = [3, 2, 4, 3, 2, 3];
      let y = -H / 2 + 130;
      const items = [];
      C.msgs.forEach((t0, i) => {
        if (lt < t0) return;
        const h = 22 + rows[i] * 16;
        items.push({ t0, h, rows: rows[i], i });
      });
      const yesShown = lt > C.yesno;
      let total = items.reduce((a, b) => a + b.h + 12, 0) + (yesShown ? 100 : 0);
      const maxH = H - 170;
      const scroll = Math.max(0, total - maxH);
      y -= scroll;
      items.forEach((it) => {
        const k = SK.pop(lt, it.t0, 0.3);
        ctx.save();
        ctx.translate(-W / 2 + 26, y);
        ctx.scale(k, k);
        P.bubble(ctx, 120, it.h / 2, { w: 240, h: it.h, color: P.COL.pigMsg, scribble: it.rows, seed: it.i * 3, tail: 'left' });
        ctx.restore();
        y += it.h + 12;
      });
      if (yesShown) {
        const k = SK.pop(lt, C.yesno, 0.45);
        ctx.save();
        ctx.translate(-W / 2 + 26 + 118, y + 44);
        ctx.scale(k, k);
        ctx.rotate(Math.sin(lt * 20) * 0.03 * (1 - SK.prog(lt, C.yesno, C.yesno + 0.6)));
        SK.glow(ctx, 0, 0, 150, '#ff9fb6', 0.45 + 0.2 * Math.sin(lt * 6));
        P.bubble(ctx, 0, 0, { text: 'yes or no', size: 48, color: '#ffc1d0', tail: 'left', font: SK.FONT_EN, seed: 9 });
        ctx.restore();
      }
      ctx.restore();
      // 输入栏
      shape(ctx, SK.rrect(-W / 2 + 24, H / 2 - 42, W - 48, 30, 15), { fill: '#fff', lw: 2 });
      ctx.restore();
      if (lt > C.msgs[3] && !burst) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        text(ctx, '……', fx + 170, fy - 330, { size: 44, seed: 2 });
        ctx.restore();
      }
    },
  };

  /* ================= 8. 10/20 在一起 ================= */
  S.d1020 = {
    tout: ['cut', 0],
    draw(ctx, lt) {
      const C = TL.cue.d1020;
      if (lt < 2.4) {
        SK.bg(ctx, '#fdf1e2');
        for (let i = 0; i < 16; i++) P.heart(ctx, SK.hash(i * 2.1) * SK.W, SK.hash(i * 3.7) * SK.H, 8, '#ffd0db', { alpha: 0.6, shine: false });
        P.dateCard(ctx, lt, '10/20', { start: -1, month: '十月', top: '#f07a8a', end: 2.0 });
        // 10/19 被撕下
        if (lt < C.tear + 0.9) {
          const k = SK.easeIn(SK.prog(lt, C.tear, C.tear + 0.9));
          ctx.save();
          ctx.translate(SK.W / 2 + k * 180, SK.H / 2 + k * 520);
          ctx.rotate(-0.05 + k * 1.2);
          P.calendar(ctx, 0, 0, 1.25, { month: '十月', day: '10/19', daySize: 70, top: '#f07a8a' });
          ctx.restore();
        }
        return;
      }
      if (lt < 5.2) {
        // 青蛙的回复
        SK.bg(ctx, '#e8f4dc');
        SH.wallDots(ctx, 0, 0, SK.W, SK.H, '#d6eac2', 'dot');
        const sent = lt > C.yes;
        const hop = sent ? Math.abs(Math.sin((lt - C.yes) * 7)) * 30 : 0;
        const ty = !sent && lt > 2.6 ? Math.sin(lt * 40) * 2 : 0;
        F(ctx, 330, 700 - hop, 1.9, {
          t: lt,
          arms: sent ? 'cheer' : { l: [-13 + ty, -34], r: [13 - ty, -34] },
          hold: sent ? null : SH.phoneHeld('#5f9a6e', 1),
          face: sent ? 'open' : 'o',
          look: sent ? [0, -0.3] : [0.5, 0.6],
          blush: 1,
        });
        if (sent) P.floatHearts(ctx, lt - C.yes, 330, 420, { n: 7, spread: 200, rise: 200, size: 11 });
        const W = 400, H = 580;
        ctx.save();
        ctx.translate(850, 370);
        ctx.rotate(0.03);
        shape(ctx, SK.rrect(-W / 2, -H / 2, W, H, 40), { fill: '#5f9a6e', lw: 3.2 });
        shape(ctx, SK.rrect(-W / 2 + 16, -H / 2 + 48, W - 32, H - 96, 16), { fill: '#fffaf4', lw: 2.4, tex: 0.08 });
        shape(ctx, SK.rrect(-40, -H / 2 + 18, 80, 14, 7), { fill: '#3e6a4c', line: false });
        P.bubble(ctx, -50, -150, { text: 'yes or no', size: 40, color: '#ffc1d0', tail: 'left', font: SK.FONT_EN, seed: 9 });
        if (sent) {
          const k = SK.pop(lt, C.yes, 0.5);
          ctx.save();
          ctx.translate(50, -20);
          ctx.scale(k, k);
          ctx.rotate(-0.03);
          P.bubble(ctx, 0, 0, { text: 'YES !!!', size: 62, color: P.COL.frogMsg, tail: 'right', font: SK.FONT_EN, seed: 3 });
          ctx.restore();
          P.burst(ctx, lt, C.yes, 50, -20, { kind: 'heart', n: 14, speed: 220, size: 12 });
        }
        if (lt > C.yes + 0.7) {
          const k = SK.pop(lt, C.yes + 0.7, 0.4);
          ctx.save();
          ctx.translate(-70, 130);
          ctx.scale(k, k);
          P.bubble(ctx, 0, 0, { w: 100, h: 78, color: P.COL.pigMsg, tail: 'left', icon: (c) => P.heart(c, 0, 0, 24, P.COL.heart) });
          ctx.restore();
        }
        ctx.restore();
        return;
      }
      // 拥抱
      const l3 = lt - 5.2;
      SK.vgrad(ctx, [[0, '#ffe0e8'], [1, '#fff3e6']]);
      ctx.save();
      ctx.translate(640, 420);
      ctx.rotate(lt * 0.1);
      for (let i = 0; i < 16; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.45)' : 'rgba(255,200,215,0.35)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 1200, (i / 16) * Math.PI * 2, ((i + 1) / 16) * Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      shape(ctx, SK.ell(640, 690, 500, 64), { fill: '#bfe3a0', lw: 2.6 });
      for (let i = 0; i < 11; i++) P.flower(ctx, 190 + i * 90, 678 + (i % 2) * 18, 1.2, i % 2 ? '#ffb3c6' : '#fff');
      const hugged = lt > C.hug;
      const pk = SK.easeInOut(SK.prog(lt, 5.4, C.hug));
      const px = hugged ? 742 : SK.lerp(1450, 760, pk);
      const fx = 540;
      G(ctx, px, hugged ? 690 : 650, 1.75, { t: lt, fly: !hugged, arms: hugged ? { l: [-104, -58], r: 'down' } : 'up', face: hugged ? 'happy' : 'open', look: [-1, 0], blush: 1 });
      F(ctx, fx, 690, 1.75, { t: lt, arms: hugged ? { l: 'down', r: [112, -26] } : 'up', face: hugged ? 'happy' : 'open', look: [1, -0.2], blush: 1, squash: hugged ? 0.97 : 1 });
      if (hugged) {
        P.burst(ctx, lt, C.hug, 640, 480, { kind: 'heart', n: 18, speed: 320, size: 14, life: 2 });
        P.burst(ctx, lt, C.hug + 1.2, 400, 260, { n: 14, speed: 200, size: 10 });
        P.burst(ctx, lt, C.hug + 1.8, 900, 240, { n: 14, speed: 200, size: 10, seed: 6 });
        P.burst(ctx, lt, C.hug + 2.6, 640, 200, { n: 16, speed: 240, size: 11, seed: 2 });
        P.floatHearts(ctx, lt - C.hug, 640, 460, { n: 8, spread: 160, rise: 200, size: 12 });
        P.confetti(ctx, lt, C.hug, { n: 70 });
      }
      P.heartIris(ctx, SK.prog(lt, C.iris, 12), 640, 520, '#2a1e1a');
    },
  };
})();
