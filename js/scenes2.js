/* 第二幕：恋爱日常快剪 —— 密室 / 游山玩水 / 7·4 生日 + 恐怖片 / 海洋公园 / 羽毛球 / 哈利波特快闪 */
(function () {
  const S = window.SCENES;
  const SH = window.SH;
  const { shape, line, curve, dot, text } = SK;
  const F = CH.frog, G = CH.pig;
  const QUICK = ['paper', 0.22];

  /* ---------- 配饰 ---------- */
  SH.partyHat = function (color, x = 0, y = -100, rot = 0) {
    return (ctx) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      const cone = SK.poly([[-22, 0], [0, -62], [22, 0]], true, 8);
      shape(ctx, cone, { fill: color, lw: 2.4 });
      for (let i = 1; i < 4; i++) {
        const yy = -i * 15, w = 22 * (1 - i * 15 / 62);
        line(ctx, [[-w, yy + 5], [w, yy - 3]], { lw: 3.4, line: '#fff7d6' });
      }
      line(ctx, cone.concat([cone[0]]), { lw: 2.4 });
      shape(ctx, SK.circ(0, -64, 8), { fill: '#ffd35c', lw: 2.2 });
      ctx.restore();
    };
  };
  SH.wizardHat = function (ctx) {
    shape(ctx, SK.ell(4, -102, 58, 12, -0.08), { fill: '#6b5aa8', lw: 2.6 });
    shape(ctx, SK.spline([[-30, -104], [-8, -150], [10, -196], [40, -214], [30, -190], [22, -150], [36, -106]], true, 6), { fill: '#7a68ba', shade: '#5d4c9a' });
    P.star(ctx, 2, -140, 8, '#ffd35c');
    P.sparkle(ctx, 22, -170, 6, '#fff3a8');
  };
  SH.frogGlasses = function (ctx) {
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3b2a24';
    shape(ctx, SK.circ(-30, -101, 20), { fill: null, lw: 3.2 });
    shape(ctx, SK.circ(31, -99, 17), { fill: null, lw: 3.2 });
    curve(ctx, -11, -104, 0, -110, 14, -103, { lw: 3 });
    ctx.restore();
  };
  SH.scarf = function (y, w, c1, c2) {
    return (ctx) => {
      const band = SK.spline([[-w, y - 8], [0, y - 2], [w, y - 8], [w + 2, y + 8], [0, y + 14], [-w - 2, y + 8]]);
      shape(ctx, band, { fill: c1, lw: 2.4 });
      const tail = SK.poly([[w * 0.35, y + 6], [w * 0.55, y + 4], [w * 0.62, y + 46], [w * 0.38, y + 48]]);
      shape(ctx, tail, { fill: c1, lw: 2.4 });
      for (let i = 0; i < 3; i++) line(ctx, [[w * 0.36, y + 16 + i * 11], [w * 0.6, y + 14 + i * 11]], { lw: 4, line: c2 });
      for (let i = -2; i <= 2; i++) line(ctx, [[i * w * 0.32, y - 4], [i * w * 0.32 + 4, y + 10]], { lw: 4, line: c2 });
    };
  };
  SH.backpack = function (ctx) {
    shape(ctx, SK.rrect(-74, -86, 22, 64, 9), { fill: '#d98f5f', lw: 2.4 });
    shape(ctx, SK.rrect(52, -86, 22, 64, 9), { fill: '#d98f5f', lw: 2.4 });
  };
  SH.bucketHat = function (ctx) {
    shape(ctx, SK.ell(0, -112, 74, 14), { fill: '#f6d36b', lw: 2.6 });
    shape(ctx, SK.spline([[-46, -114], [-40, -146], [0, -156], [40, -146], [46, -114]], true, 6), { fill: '#f6d36b', shade: '#e2b545' });
    line(ctx, [[-44, -122], [44, -122]], { lw: 3, line: '#e86a6a' });
  };
  SH.camera = function (ctx) {
    shape(ctx, SK.rrect(-26, -20, 52, 34, 6), { fill: '#7a8aa8', lw: 2.4 });
    shape(ctx, SK.circ(0, -3, 11), { fill: '#3b4a6b', lw: 2.2 });
    dot(ctx, -3, -6, 3, '#cfe3ff');
    shape(ctx, SK.rect(10, -26, 12, 7), { fill: '#5a6a88', lw: 1.8 });
  };
  SH.combineAcc = function (...fns) {
    return (ctx) => fns.forEach((f) => f && f(ctx));
  };

  // 暗场 + 光源（用离屏蒙版挖出亮的区域）
  let maskCanvas = null;
  SH.darkness = function (ctx, alpha, color, lights) {
    const cv = ctx.canvas;
    if (!maskCanvas) maskCanvas = document.createElement('canvas');
    if (maskCanvas.width !== cv.width || maskCanvas.height !== cv.height) {
      maskCanvas.width = cv.width;
      maskCanvas.height = cv.height;
    }
    const m = maskCanvas.getContext('2d');
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalCompositeOperation = 'source-over';
    m.clearRect(0, 0, cv.width, cv.height);
    m.globalAlpha = alpha;
    m.fillStyle = color;
    m.fillRect(0, 0, cv.width, cv.height);
    m.globalAlpha = 1;
    m.setTransform(ctx.getTransform());
    m.globalCompositeOperation = 'destination-out';
    lights(m);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  };
  SH.softLight = function (m, x, y, r, a = 1) {
    const g = m.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g;
    m.fillRect(x - r, y - r, r * 2, r * 2);
  };
  SH.cone = function (m, x, y, ang, len, spread, a = 1) {
    const g = m.createRadialGradient(x, y, 0, x, y, len);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(0.7, `rgba(0,0,0,${a * 0.85})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g;
    m.beginPath();
    m.moveTo(x, y);
    m.arc(x, y, len, ang - spread, ang + spread);
    m.closePath();
    m.fill();
  };

  /* ================= 密室逃脱 ================= */
  function ghost(ctx, x, y, s, lt, scared) {
    ctx.save();
    ctx.translate(x, y + Math.sin(lt * 3) * 8);
    ctx.scale(s, s);
    const pts = [[-60, 40]];
    for (let i = 0; i <= 6; i++) pts.push([-60 + i * 20, 40 + (i % 2 ? -12 : 6) + Math.sin(lt * 6 + i) * 4]);
    pts.push([60, 40], [62, -40], [40, -96], [0, -112], [-40, -96], [-62, -40]);
    shape(ctx, SK.spline(pts, true, 6), { fill: '#fbfbff', shade: '#d8dcf0' });
    shape(ctx, SK.ell(-22, -50, 10, 15), { fill: SK.INK, line: false });
    shape(ctx, SK.ell(22, -50, 10, 15), { fill: SK.INK, line: false });
    shape(ctx, SK.ell(0, -10, scared ? 18 : 10, scared ? 20 : 8), { fill: SK.INK, line: false });
    shape(ctx, SK.ell(-40, -24, 8, 5), { fill: 'rgba(255,150,170,0.6)', line: false });
    shape(ctx, SK.ell(40, -24, 8, 5), { fill: 'rgba(255,150,170,0.6)', line: false });
    shape(ctx, CH.tube(CH.bend(-58, -20, -96, scared ? -90 : -10, 8), 18), { fill: '#fbfbff', lw: 2.4 });
    shape(ctx, CH.tube(CH.bend(58, -20, 96, scared ? -90 : -10, -8), 18), { fill: '#fbfbff', lw: 2.4 });
    ctx.restore();
  }
  function bricks(ctx, x0, y0, w, h, base, mortar) {
    SK.bg(ctx, base);
    for (let r = 0; r * 34 < h; r++) {
      for (let c = -1; c * 70 < w; c++) {
        const bx = x0 + c * 70 + (r % 2) * 35, by = y0 + r * 34;
        if (SK.hash(r * 13 + c * 7) < 0.55) shape(ctx, SK.rect(bx + 3, by + 3, 64, 28), { fill: SK.mix(base, mortar, 0.25 + SK.hash(r + c) * 0.2), line: SK.rgba('#000000', 0.25), lw: 1.6, tex: 0.3, wob: 1 });
      }
    }
  }
  function cobweb(ctx, x, y, s, flipX) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX ? -s : s, s);
    for (let i = 0; i < 5; i++) {
      const a = (i / 4) * (Math.PI / 2);
      line(ctx, [[0, 0], [Math.cos(a) * 120, Math.sin(a) * 120]], { lw: 1.2, line: 'rgba(230,230,240,0.7)' });
    }
    for (let r = 30; r <= 110; r += 26) {
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * (Math.PI / 2);
        const rr = r * (i % 2 ? 0.86 : 1);
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      line(ctx, pts, { lw: 1.2, line: 'rgba(230,230,240,0.7)' });
    }
    ctx.restore();
  }
  S.escape = {
    tin: ['ink', 0.25],
    tout: QUICK,
    draw(ctx, lt) {
      const C = TL.cue.escape;
      const scared = lt > C.scare;
      ctx.save();
      if (scared) SK.shake(ctx, lt, 6 * (1 - SK.prog(lt, C.scare, C.scare + 0.8)));
      bricks(ctx, 0, 0, SK.W, SK.H, '#4b3f55', '#2b2333');
      shape(ctx, SK.rect(-20, 600, SK.W + 40, 140), { fill: '#3a2f3f', lw: 2.6 });
      // 门 + 锁
      shape(ctx, SK.rrect(980, 250, 180, 352, 12), { fill: '#7a5238', lw: 2.8, shade: '#5c3c28' });
      for (let i = 0; i < 4; i++) line(ctx, [[1000, 300 + i * 80], [1140, 300 + i * 80]], { lw: 1.6, line: 'rgba(0,0,0,0.3)' });
      shape(ctx, SK.rrect(1010, 400, 44, 40, 6), { fill: '#e9c45a', lw: 2.4 });
      shape(ctx, SK.ell(1032, 392, 14, 16), { fill: null, lw: 4 });
      dot(ctx, 1032, 418, 4);
      // 衣柜（鬼藏在后面）
      shape(ctx, SK.rect(150, 230, 210, 372), { fill: '#6a4a3a', lw: 2.8, shade: '#4f3528' });
      line(ctx, [[255, 236], [255, 598]], { lw: 2.4 });
      cobweb(ctx, 0, 0, 1.2, false);
      cobweb(ctx, SK.W, 0, 1.1, true);
      // 墙上的蜡烛
      for (const cx of [560, 760]) {
        shape(ctx, SK.rect(cx - 8, 200, 16, 40), { fill: '#f3ead6', lw: 2 });
        const fl = Math.sin(lt * 18 + cx) * 2;
        shape(ctx, SK.spline([[cx, 176 + fl], [cx + 7, 192], [cx, 200], [cx - 7, 192]]), { fill: '#ffcf5c', lw: 1.6, tex: 0 });
      }
      // 鬼
      const gk = SK.backOut(SK.prog(lt, C.scare - 0.1, C.scare + 0.25));
      if (gk > 0) {
        ghost(ctx, SK.lerp(250, 330, gk), 420, 1.15 * gk, lt, true);
        const tk = SK.pop(lt, C.scare, 0.3);
        ctx.save();
        ctx.translate(320, 230);
        ctx.scale(tk, tk);
        ctx.rotate(-0.12);
        text(ctx, 'BOO!', 0, 0, { size: 70, font: SK.FONT_EN, weight: 'bold', color: '#fff', outline: SK.INK, outlineW: 8, seed: 3 });
        ctx.restore();
      }
      // 小猪拿手电，青蛙抓着小猪
      const sweep = scared ? SK.lerp(-0.5, Math.PI + 0.35, SK.easeOut(SK.prog(lt, C.scare, C.scare + 0.25))) : Math.PI + 0.25 + Math.sin(lt * 1.4) * 0.45;
      const flashAng = scared ? Math.PI + 0.35 : sweep;
      const pX = 820, fX = scared ? SK.lerp(640, 735, SK.easeOut(SK.prog(lt, C.scare + 0.3, C.scare + 0.8))) : 640;
      const hop = scared ? SH.hop(lt, C.scare + 0.05, 70, 0.55) : 0;
      G(ctx, pX, 640, 1.25, {
        t: lt,
        arms: { l: 'down', r: [64, -60] },
        holdR: (c) => {
          c.rotate(flashAng + Math.PI);
          shape(c, SK.rrect(-8, -36, 16, 40, 5), { fill: '#e86a6a', lw: 2.2 });
          shape(c, SK.rect(-11, -44, 22, 10), { fill: '#d0d4dc', lw: 2 });
        },
        face: scared ? (lt > C.scare + 1.3 ? 'happy' : 'o') : 'smile',
        look: [-0.8, -0.2],
        blush: 0.6,
      });
      F(ctx, fX, 640 - hop, 1.25, {
        t: lt,
        arms: scared && lt > C.scare + 0.8 ? { l: 'down', r: [90, -54] } : scared ? 'up' : { l: 'down', r: [96, -40] },
        face: scared && lt < C.scare + 0.8 ? 'yell' : 'scared',
        shiver: scared ? 6 : 3,
        sweat: true,
        look: [-0.6, -0.4],
        blush: 0.3,
        brows: 'worried',
      });
      if (scared && lt < C.scare + 1.2) P.exclaim(ctx, fX, 420 - hop, 1.3, 3);
      // 黑暗 + 手电光
      const lx = pX + 74, ly = 565;
      SH.darkness(ctx, 0.86, '#0d0a14', (m) => {
        SH.cone(m, lx - 20, ly, flashAng, 760, 0.33);
        SH.softLight(m, 730, 520, 260, 0.75);
        SH.softLight(m, 560, 210, 110, 0.6);
        SH.softLight(m, 760, 210, 110, 0.6);
      });
      ctx.restore();
    },
  };

  /* ================= 游山玩水，给小猪分享照片 ================= */
  function karst(ctx, x, y, w, h, color, line_) {
    const pts = SK.spline([[x - w, y], [x - w * 0.8, y - h * 0.6], [x - w * 0.5, y - h * 0.95], [x, y - h], [x + w * 0.45, y - h * 0.9], [x + w * 0.75, y - h * 0.5], [x + w, y]], false, 8);
    pts.push([x + w, y + 10], [x - w, y + 10]);
    shape(ctx, pts, { fill: color, line: line_ || SK.mix(color, SK.INK, 0.5), lw: 2.4, shade: SK.mix(color, '#1d3d4a', 0.18), shadeDist: 12 });
  }
  function landscape(ctx, lt, pan, kind) {
    SK.vgrad(ctx, [[0, '#bfe3f5'], [0.7, '#eef8ff']], 0, 520);
    P.sun(ctx, 1000 - pan * 0.1, 120, 36, '#ffe08a');
    P.cloud(ctx, 260 - pan * 0.15 + lt * 4, 110, 0.9);
    // 远山
    ctx.save();
    ctx.translate(-pan * 0.25, 0);
    [[120, 230, 110, 230], [330, 260, 130, 250], [560, 230, 120, 260], [800, 240, 140, 220], [1040, 230, 120, 260], [1280, 250, 130, 240]].forEach(([x, w2, w, h]) => karst(ctx, x, 470, w, h, '#a9cfc9'));
    ctx.restore();
    // 云雾
    for (let i = 0; i < 7; i++) {
      const x = ((i * 230 - pan * 0.3 + lt * 8) % 1500 + 1500) % 1500 - 120;
      ctx.save();
      ctx.translate(x, 420 + (i % 3) * 22);
      ctx.scale(3.2, 0.5);
      SK.glow(ctx, 0, 0, 60, '#ffffff', 0.75);
      ctx.restore();
    }
    // 近山 + 瀑布
    ctx.save();
    ctx.translate(-pan * 0.5, 0);
    karst(ctx, 160, 520, 200, 330, '#86bfa0');
    karst(ctx, 1220, 520, 230, 300, '#8cc4a0');
    // 瀑布
    const wx = 230;
    shape(ctx, SK.rect(wx, 260, 50, 270), { fill: '#d8f1ff', lw: 2.2, tex: 0.1 });
    for (let i = 0; i < 6; i++) {
      const yy = 260 + ((lt * 160 + i * 45) % 270);
      line(ctx, [[wx + 8 + i * 6, yy], [wx + 8 + i * 6, yy + 30]], { lw: 2, line: '#8cc6ea' });
    }
    // 塔
    shape(ctx, SK.rect(1180, 168, 34, 56), { fill: '#e8735f', lw: 2.2 });
    shape(ctx, SK.poly([[1166, 170], [1197, 140], [1228, 170]]), { fill: '#5f4b8b', lw: 2.2 });
    shape(ctx, SK.poly([[1170, 200], [1197, 182], [1224, 200]]), { fill: '#5f4b8b', lw: 2 });
    ctx.restore();
    // 河
    SK.vgrad(ctx, [[0, '#9ad4ec'], [1, '#c8ecfb']], 510, 600);
    line(ctx, [[-20, 512], [SK.W + 20, 512]], { lw: 2.4 });
    for (let i = 0; i < 12; i++) {
      const x = ((i * 137 - lt * 60 - pan * 0.8) % (SK.W + 200) + SK.W + 200) % (SK.W + 200) - 100;
      line(ctx, [[x, 530 + (i % 4) * 16], [x + 50, 530 + (i % 4) * 16]], { lw: 2.2, line: 'rgba(255,255,255,0.85)' });
    }
    // 岸
    shape(ctx, SK.rect(-20, 596, SK.W + 40, 160), { fill: '#b8dc8c', lw: 2.6 });
    P.grassTufts(ctx, -pan % 60, SK.W, 620, { gap: 60, seed: 3 });
    for (let i = 0; i < 8; i++) P.flower(ctx, ((i * 170 - pan) % (SK.W + 100) + SK.W + 100) % (SK.W + 100), 650 + (i % 3) * 22, 1, ['#ffb3c6', '#fff', '#ffd35c'][i % 3]);
  }
  function photoMountain(ctx, w, h) {
    SK.vgrad(ctx, [[0, '#bfe3f5'], [1, '#eef8ff']], 0, h, 0, w);
    karst(ctx, w * 0.3, h * 0.85, w * 0.3, h * 0.6, '#86bfa0');
    karst(ctx, w * 0.75, h * 0.85, w * 0.3, h * 0.5, '#a9cfc9');
    shape(ctx, SK.rect(0, h * 0.82, w, h * 0.2), { fill: '#9ad4ec', line: false });
  }
  function photoFall(ctx, w, h) {
    SK.vgrad(ctx, [[0, '#d7f0e0'], [1, '#bfe6c8']], 0, h, 0, w);
    shape(ctx, SK.rect(w * 0.4, 0, w * 0.22, h), { fill: '#e2f5ff', lw: 1.6 });
    P.sparkle(ctx, w * 0.3, h * 0.3, 8, '#fff');
    shape(ctx, SK.rect(0, h * 0.78, w, h * 0.3), { fill: '#9ad4ec', line: false });
  }
  function photoFlower(ctx, w, h) {
    SK.vgrad(ctx, [[0, '#ffd9c2'], [1, '#fff1dc']], 0, h, 0, w);
    P.sun(ctx, w * 0.7, h * 0.35, 12, '#ffd27a');
    shape(ctx, SK.rect(0, h * 0.65, w, h * 0.4), { fill: '#b8dc8c', line: false });
    for (let i = 0; i < 5; i++) P.flower(ctx, 10 + i * 20, h * 0.85, 0.8, ['#ffb3c6', '#fff', '#ffd35c'][i % 3]);
  }
  S.travel = {
    tin: QUICK,
    tout: QUICK,
    draw(ctx, lt) {
      const C = TL.cue.travel;
      const pan = lt * 18;
      landscape(ctx, lt, pan);
      // 青蛙背着包拿相机
      let arms = { l: 'down', r: [60, -40] };
      let holdR = (c) => SH.camera(c);
      let shooting = C.shots.some((s) => lt > s - 0.6 && lt < s + 0.4);
      if (shooting) {
        arms = { l: [-20, -88], r: [20, -88] };
        holdR = null;
      }
      const walking = !shooting;
      const fx = 470 + Math.sin(lt * 0.7) * 20;
      F(ctx, fx, 668, 1.3, {
        t: lt,
        walk: walking ? lt * 7 : null,
        arms,
        holdR,
        hold: shooting ? (c) => SH.camera(c) : null,
        face: shooting ? 'flat' : 'open',
        look: [0.4, -0.2],
        blush: 0.5,
        acc: SH.combineAcc(SH.backpack, SH.bucketHat),
      });
      C.shots.forEach((s) => {
        if (lt > s && lt < s + 0.35) {
          ctx.save();
          ctx.globalAlpha = 1 - SK.prog(lt, s, s + 0.35);
          SK.glow(ctx, fx, 668 - 115 * 1.3, 200, '#ffffff', 1);
          ctx.restore();
          P.sparkle(ctx, fx + 30, 668 - 140 * 1.3, 24 * (1 - SK.prog(lt, s, s + 0.35)), '#fffbe0');
        }
      });
      // 右上角：小猪的“视频窗口”
      const ix = 1060, iy = 170, ir = 110;
      const ik = SK.pop(lt, 0.5, 0.4);
      ctx.save();
      ctx.translate(ix, iy);
      ctx.scale(ik, ik);
      shape(ctx, SK.circ(0, 0, ir + 8), { fill: '#fffaf0', lw: 3 });
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, ir, 0, Math.PI * 2);
      ctx.clip();
      SK.bg(ctx, '#fde2ea');
      SH.wallDots(ctx, -ir, -ir, ir * 2, ir * 2, '#f8c6d3', 'heart');
      const got = C.shots.filter((s) => lt > s + 1.1).length;
      const react = C.shots.some((s) => lt > s + 1.1 && lt < s + 1.9);
      G(ctx, 0, 140 - (react ? SH.hop(lt % 100, C.shots.find((s) => lt > s + 1.1 && lt < s + 1.9) + 1.1, 12, 0.3) : 0), 1.25, {
        t: lt,
        arms: { l: [-13, -40], r: [13, -40] },
        hold: SH.phoneHeld('#e7849b', 1),
        face: got >= 2 ? 'love' : react ? 'open' : 'smile',
        look: [0, 0.6],
        blush: 0.6 + got * 0.15,
      });
      ctx.restore();
      P.tape(ctx, -70, -108, 70, 22, -0.5, P.COL.tape);
      ctx.restore();
      // 照片飞向小猪
      const photos = [photoMountain, photoFall, photoFlower];
      C.shots.forEach((s, i) => {
        const k = SK.prog(lt, s + 0.2, s + 1.1);
        if (k <= 0) return;
        const ke = SK.easeInOut(k);
        const sx = fx + 20, sy = 668 - 150 * 1.3;
        const tx = ix - 150 + i * 40, ty = iy + 150 + i * 14;
        const x = SK.lerp(sx, tx, ke), y = SK.lerp(sy, ty, ke) - Math.sin(k * Math.PI) * 120;
        P.polaroid(ctx, x, y, SK.lerp(0.5, 0.62, ke), SK.lerp(0, -0.25 + i * 0.22, ke), photos[i]);
        if (k >= 1) P.burst(ctx, lt, s + 1.1, tx, ty - 30, { kind: 'heart', n: 8, speed: 90, size: 8, life: 1.0 });
      });
      if (lt > C.shots[1] + 1.2) P.floatHearts(ctx, lt, ix, iy - 20, { n: 5, spread: 120, rise: 90, size: 8, alpha: SK.prog(lt, C.shots[1] + 1.2, C.shots[1] + 1.6) });
    },
  };

  /* ================= 7/4 小猪生日 + 一起看恐怖片 ================= */
  function bunting(ctx, lt, letters) {
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push([60 + i * 58, 70 + Math.sin((i / 20) * Math.PI) * 50]);
    line(ctx, pts, { lw: 2 });
    const cols = ['#f7a6b8', '#a9d9f2', '#ffd35c', '#b8e08a'];
    for (let i = 1; i < 20; i += 2) {
      const p = pts[i];
      const sw = Math.sin(lt * 3 + i) * 0.06;
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.rotate(sw);
      shape(ctx, SK.poly([[-24, 0], [24, 0], [0, 46]]), { fill: cols[(i >> 1) % 4], lw: 2.2 });
      const ch = letters[(i - 1) >> 1];
      if (ch) text(ctx, ch, 0, 14, { size: 22, seed: i });
      ctx.restore();
    }
  }
  function cake(ctx, x, y, lt, blown) {
    shape(ctx, SK.rrect(x - 100, y - 70, 200, 74, 14), { fill: '#fbd3df', lw: 2.8, shade: '#efb2c5' });
    shape(ctx, SK.rrect(x - 66, y - 128, 132, 62, 12), { fill: '#fff3f6', lw: 2.6, shade: '#f3d6df' });
    const drip = [];
    for (let i = 0; i <= 12; i++) drip.push([x - 100 + i * (200 / 12), y - 66 + (i % 2 ? 14 : 2)]);
    line(ctx, drip, { lw: 5, line: '#ffffff' });
    for (let i = 0; i < 5; i++) P.heart(ctx, x - 80 + i * 40, y - 30, 7, '#ef5a6f', { shine: false });
    shape(ctx, SK.ell(x, y + 4, 130, 12), { fill: '#e7eef6', lw: 2.4 });
    for (let i = 0; i < 4; i++) {
      const cx = x - 45 + i * 30;
      shape(ctx, SK.rect(cx - 4, y - 160, 8, 32), { fill: i % 2 ? '#a9d9f2' : '#ffd35c', lw: 1.8 });
      if (!blown) {
        const fl = Math.sin(lt * 20 + i) * 2;
        SK.glow(ctx, cx, y - 172, 26, '#ffcf5c', 0.6);
        shape(ctx, SK.spline([[cx, y - 186 + fl], [cx + 6, y - 172], [cx, y - 162], [cx - 6, y - 172]]), { fill: '#ffb84d', lw: 1.6, tex: 0 });
      } else {
        const k = SK.prog(lt, TL.cue.bday.blow, TL.cue.bday.blow + 1.4);
        if (k < 1) {
          ctx.save();
          ctx.globalAlpha = 1 - k;
          curve(ctx, cx, y - 164, cx + 10, y - 180 - k * 20, cx - 4, y - 196 - k * 40, { lw: 2, line: '#9a9aa8' });
          ctx.restore();
        }
      }
    }
  }
  function tvFrame(ctx, x, y, w, h, screen) {
    shape(ctx, SK.rrect(x - 12, y - 12, w + 24, h + 24, 14), { fill: '#3b3a48', lw: 2.8 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    screen(ctx, x, y, w, h);
    ctx.restore();
    line(ctx, SK.rect(x, y, w, h).concat([[x, y]]), { lw: 2 });
    shape(ctx, SK.rect(x + w / 2 - 30, y + h + 12, 60, 24), { fill: '#3b3a48', lw: 2.4 });
  }
  S.bday = {
    tin: QUICK,
    tout: QUICK,
    draw(ctx, lt) {
      const C = TL.cue.bday;
      if (lt < 1.4) {
        SK.bg(ctx, '#fff4dc');
        for (let i = 0; i < 18; i++) P.star(ctx, SK.hash(i * 2.1) * SK.W, SK.hash(i * 3.7) * SK.H, 7, '#ffe08a', { alpha: 0.7 });
        P.dateCard(ctx, lt, '7/4', { start: 0.05, end: 1.05, month: '七月', top: '#f2b84b', daySize: 100 });
        return;
      }
      if (lt < 4.4) {
        // 生日派对
        SK.bg(ctx, '#fde9d6');
        SH.wallDots(ctx, 0, 0, SK.W, 560, '#f8d4c0', 'dot');
        bunting(ctx, lt, ['生', '日', '快', '乐', '', '', '', '', '', '']);
        [[120, 260, '#f7a6b8'], [190, 220, '#a9d9f2'], [1120, 240, '#ffd35c'], [1180, 290, '#b8e08a']].forEach(([x, y, c], i) => {
          const b = Math.sin(lt * 2 + i) * 6;
          line(ctx, [[x, y + 40 + b], [x + 10, 560]], { lw: 1.4 });
          shape(ctx, SK.ell(x, y + b, 34, 42), { fill: c, lw: 2.4 });
        });
        SH.floor(ctx, 560, '#e9c9a8');
        const blown = lt > C.blow;
        // 桌子 + 蛋糕
        F(ctx, 400, 600, 1.3, { t: lt, arms: blown ? 'cheer' : { l: [-62, -40 + Math.sin(lt * 9) * 6], r: [62, -40 - Math.sin(lt * 9) * 6] }, face: 'open', look: [0.6, 0], blush: 0.7, acc: SH.partyHat('#a9d9f2', -6, -116, -0.15) });
        G(ctx, 880, 600, 1.3, { t: lt, arms: blown ? 'cheer' : 'down', face: lt > C.blow - 0.6 && !blown ? 'o' : blown ? 'happy' : 'smile', look: [-0.6, 0.2], blush: 0.9, acc: SH.partyHat('#f7a6b8', 8, -104, 0.12) });
        shape(ctx, SK.rrect(380, 560, 520, 40, 10), { fill: '#fffaf2', lw: 2.6 });
        shape(ctx, SK.rect(400, 598, 480, 140), { fill: '#f6b9c8', lw: 2.6, shade: '#e99aae' });
        cake(ctx, 640, 556, lt, blown);
        if (!blown) {
          for (let i = 0; i < 3; i++) {
            const k = (lt * 0.8 + i / 3) % 1;
            ctx.save();
            ctx.globalAlpha = Math.sin(k * Math.PI);
            P.note(ctx, 470 + i * 26 + k * 40, 380 - k * 90, 1, ['#ef5a6f', '#7aa6e8', '#5f9a6e'][i]);
            ctx.restore();
          }
        }
        if (lt > C.blow - 0.6 && lt < C.blow + 0.2) {
          for (let i = 0; i < 3; i++) line(ctx, [[790 - i * 6, 500 + i * 14], [740 - i * 6, 510 + i * 14]], { lw: 2.4, line: '#9fc8e8' });
        }
        if (blown) {
          P.confetti(ctx, lt, C.blow, { n: 60 });
          P.burst(ctx, lt, C.blow, 640, 380, { n: 16, speed: 260, size: 12 });
        }
        return;
      }
      // 恐怖片
      const scared = lt > C.scare;
      const flick = 0.5 + 0.5 * SK.noise(lt * 9);
      SK.bg(ctx, '#2a2438');
      ctx.save();
      if (scared) SK.shake(ctx, lt, 5 * (1 - SK.prog(lt, C.scare, C.scare + 0.7)));
      tvFrame(ctx, 70, 170, 380, 250, (c, x, y, w, h) => {
        if (scared && lt < C.scare + 1.4) {
          SK.bg(c, '#e8e8f4');
          ghost(c, x + w / 2, y + h * 0.75, 1.5, lt, true);
          return;
        }
        SK.vgrad(c, [[0, '#2c3560'], [1, '#5a4a7a']], y, y + h, x, w);
        shape(c, SK.circ(x + w * 0.78, y + 50, 26), { fill: '#f2f0d0', lw: 2 });
        shape(c, SK.poly([[x + 60, y + h], [x + 60, y + 120], [x + 110, y + 80], [x + 160, y + 120], [x + 160, y + h]]), { fill: '#1d1830', lw: 2 });
        shape(c, SK.rect(x + 95, y + 150, 22, 26), { fill: '#ffe27a', lw: 1.6 });
        const gx = x + 300 - (lt - 4.4) * 30;
        ghost(c, gx, y + h * 0.7, 0.5, lt, false);
      });
      // 沙发
      shape(ctx, SK.rrect(560, 380, 640, 240, 40), { fill: '#7f6aa8', lw: 2.8, shade: '#64528a' });
      const hop = scared ? SH.hop(lt, C.scare, 110, 0.7) : 0;
      const fxJump = scared ? SK.lerp(700, 960, SK.easeOut(SK.prog(lt, C.scare, C.scare + 0.7))) : 700;
      G(ctx, 990, 596, 1.25, { t: lt, arms: scared && lt > C.scare + 0.7 ? 'hug' : { l: [-30, -30], r: 'down' }, hold: scared ? null : (c) => P.popcorn(c, 0, 10, 0.9), face: scared ? (lt > C.scare + 0.9 ? 'happy' : 'o') : 'smile', look: [-0.9, -0.2], blush: 0.7, acc: SH.partyHat('#f7a6b8', 8, -104, 0.12) });
      F(ctx, fxJump, 596 - hop, 1.2, { t: lt, arms: scared ? (lt > C.scare + 0.7 ? 'hug' : 'up') : 'down', face: scared ? 'yell' : 'scared', shiver: scared ? 5 : 1.5, sweat: true, look: [-0.9, -0.3], brows: 'worried', blush: 0.3 });
      shape(ctx, SK.rrect(540, 586, 680, 150, 30), { fill: '#8d78b8', lw: 2.8, shade: '#6f5c98' });
      shape(ctx, SK.rrect(520, 480, 60, 220, 26), { fill: '#7f6aa8', lw: 2.6 });
      shape(ctx, SK.rrect(1180, 480, 60, 220, 26), { fill: '#7f6aa8', lw: 2.6 });
      if (scared) {
        for (let i = 0; i < 12; i++) {
          const k = SK.prog(lt, C.scare, C.scare + 1.2);
          const a = -Math.PI / 2 + (SK.hash(i) - 0.5) * 2;
          const x = 900 + Math.cos(a) * 200 * k, y = 520 + Math.sin(a) * 260 * k + 300 * k * k;
          shape(ctx, SK.circ(x, y, 7), { fill: '#fff6d8', lw: 1.6 });
        }
        if (lt < C.scare + 1.0) P.exclaim(ctx, fxJump, 380 - hop, 1.4, 3);
      }
      ctx.restore();
      // 屏幕光
      SH.darkness(ctx, 0.55, '#120f22', (m) => {
        SH.softLight(m, 260, 300, 340, 0.8 * flick + (scared && lt < C.scare + 0.3 ? 0.2 : 0));
        SH.softLight(m, 860, 520, 420, 0.55 * flick);
      });
      if (scared && lt < C.scare + 0.25) {
        ctx.save();
        ctx.globalAlpha = 0.7 * (1 - SK.prog(lt, C.scare, C.scare + 0.25));
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, SK.W, SK.H);
        ctx.restore();
      }
    },
  };

  /* ================= 海洋公园 ================= */
  function fish(ctx, x, y, s, dir, color, lt, i) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * dir, s);
    const wag = Math.sin(lt * 10 + i) * 0.25;
    ctx.save();
    ctx.translate(-22, 0);
    ctx.rotate(wag);
    shape(ctx, SK.poly([[0, 0], [-18, -14], [-18, 14]]), { fill: color, lw: 2 });
    ctx.restore();
    shape(ctx, SK.ell(0, 0, 26, 15), { fill: color, lw: 2.2, tex: 0.1 });
    dot(ctx, 12, -3, 2.6);
    line(ctx, [[2, -12], [2, 12]], { lw: 1.4, line: 'rgba(255,255,255,0.7)' });
    ctx.restore();
  }
  function jelly(ctx, x, y, s, lt, i) {
    const p = Math.sin(lt * 3 + i);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * (1 + p * 0.08), s * (1 - p * 0.08));
    SK.glow(ctx, 0, 0, 70, '#ffc6e8', 0.35);
    for (let k = -2; k <= 2; k++) {
      const pts = [];
      for (let j = 0; j <= 8; j++) pts.push([k * 9 + Math.sin(lt * 4 + j * 0.8 + k) * 5, 6 + j * 9]);
      line(ctx, pts, { lw: 1.8, line: 'rgba(255,200,230,0.9)' });
    }
    shape(ctx, SK.spline([[-34, 8], [-30, -18], [0, -32], [30, -18], [34, 8], [0, 4]]), { fill: 'rgba(255,190,225,0.7)', line: '#e98cbf', lw: 2.2, tex: 0.05 });
    dot(ctx, -10, -8, 2);
    dot(ctx, 10, -8, 2);
    ctx.restore();
  }
  S.ocean = {
    tin: QUICK,
    tout: QUICK,
    draw(ctx, lt) {
      SK.vgrad(ctx, [[0, '#2f6fa8'], [0.6, '#4fa3c9'], [1, '#8fd3df']]);
      // 光柱
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (let i = 0; i < 5; i++) {
        const x = 150 + i * 260 + Math.sin(lt + i) * 20;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x, -10);
        ctx.lineTo(x + 70, -10);
        ctx.lineTo(x - 80, 720);
        ctx.lineTo(x - 200, 720);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      // 鱼群
      for (let i = 0; i < 14; i++) {
        const dir = i % 2 ? 1 : -1;
        const sp = 70 + SK.hash(i) * 60;
        let x = ((SK.hash(i * 3.1) * 1600 + lt * sp * dir) % 1600 + 1600) % 1600 - 160;
        const y = 90 + SK.hash(i * 5.7) * 360 + Math.sin(lt * 2 + i) * 10;
        fish(ctx, x, y, 0.7 + SK.hash(i * 2) * 0.5, dir, ['#ffb35c', '#ffd35c', '#7fc8f0', '#ff8fa3'][i % 4], lt, i);
      }
      // 大鳐鱼
      const mx = SK.lerp(1500, -300, lt / 6);
      ctx.save();
      ctx.translate(mx, 170 + Math.sin(lt) * 20);
      const fl = Math.sin(lt * 3) * 18;
      shape(ctx, SK.spline([[-90, 0], [-20, -30], [60, -70 - fl], [40, -10], [120, 10], [40, 14], [60, 70 + fl], [-20, 30]]), { fill: '#3b5f8a', lw: 2.6, shade: '#2c4a70' });
      line(ctx, [[-90, 0], [-170, 6]], { lw: 3 });
      dot(ctx, -50, -8, 3, '#fff');
      ctx.restore();
      for (let i = 0; i < 3; i++) jelly(ctx, 200 + i * 430, 300 + Math.sin(lt * 0.8 + i) * 30 - (i === 1 ? 120 : 0), 1.1, lt, i);
      // 隧道玻璃拱
      ctx.save();
      ctx.globalAlpha = 0.9;
      for (let k = 0; k < 3; k++) {
        const pts = [];
        for (let i = 0; i <= 30; i++) {
          const a = Math.PI + (i / 30) * Math.PI;
          pts.push([640 + Math.cos(a) * (700 - k * 40), 700 + Math.sin(a) * (640 - k * 30)]);
        }
        line(ctx, pts, { lw: k ? 2 : 8, line: k ? 'rgba(255,255,255,0.5)' : '#d6e4ee' });
      }
      ctx.restore();
      // 气泡
      for (let i = 0; i < 18; i++) {
        const y = 720 - ((lt * (50 + SK.hash(i) * 40) + SK.hash(i * 3) * 720) % 760);
        shape(ctx, SK.circ(SK.hash(i * 7) * SK.W + Math.sin(lt * 2 + i) * 8, y, 4 + SK.hash(i * 2) * 6), { fill: 'rgba(255,255,255,0.35)', line: 'rgba(255,255,255,0.9)', lw: 1.4, tex: 0 });
      }
      // 走道
      shape(ctx, SK.rect(-20, 610, SK.W + 40, 140), { fill: '#7f93a8', lw: 2.6 });
      line(ctx, [[-20, 640], [SK.W + 20, 640]], { lw: 1.4, line: 'rgba(255,255,255,0.3)' });
      const look = [Math.sin(lt * 0.9) * 0.8, -0.8];
      F(ctx, 520, 660, 1.25, { t: lt, arms: { l: 'down', r: lt > 1.5 ? [70, -150] : 'down' }, face: 'o', look, blush: 0.5 });
      G(ctx, 760, 660, 1.25, { t: lt, arms: lt > 2.5 ? 'up' : 'down', face: lt > 2.5 ? 'open' : 'o', look, blush: 0.6, flapSpeed: 6, flapAmp: 0.2 });
      // 蓝色水光
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#3f8fd0';
      ctx.fillRect(0, 0, SK.W, SK.H);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 8; i++) {
        const x = (i * 180 + Math.sin(lt * 1.3 + i) * 40) % SK.W;
        SK.glow(ctx, x, 640 + Math.sin(lt + i) * 10, 80, '#ffffff', 1);
      }
      ctx.restore();
    },
  };

  /* ================= 羽毛球 ================= */
  function racket(ctx, ang) {
    ctx.save();
    ctx.rotate(ang);
    line(ctx, [[0, 0], [0, -46]], { lw: 4 });
    shape(ctx, SK.ell(0, -72, 18, 26), { fill: 'rgba(255,255,255,0.5)', line: '#e86a6a', lw: 4 });
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -72, 16, 24, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(80,60,60,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -16; i <= 16; i += 6) {
      ctx.moveTo(i, -100);
      ctx.lineTo(i, -44);
      ctx.moveTo(-20, -72 + i);
      ctx.lineTo(20, -72 + i);
    }
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
  function shuttle(ctx, x, y, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    shape(ctx, SK.poly([[0, -5], [-22, -12], [-22, 12], [0, 5]]), { fill: '#ffffff', lw: 1.8, tex: 0 });
    line(ctx, [[-22, -6], [0, -2]], { lw: 1 });
    line(ctx, [[-22, 6], [0, 2]], { lw: 1 });
    shape(ctx, SK.circ(4, 0, 6), { fill: '#ff9f5c', lw: 1.8, tex: 0 });
    ctx.restore();
  }
  S.badminton = {
    tin: QUICK,
    tout: QUICK,
    draw(ctx, lt) {
      const C = TL.cue.badminton;
      SK.vgrad(ctx, [[0, '#bfe6f7'], [1, '#effaff']], 0, 470);
      P.cloud(ctx, 300 + lt * 10, 110, 1);
      P.cloud(ctx, 960 + lt * 6, 160, 0.8);
      P.tree(ctx, 120, 480, 1.1);
      P.tree(ctx, 1170, 480, 1.2, { canopy: '#9fd07a' });
      shape(ctx, SK.rect(-20, 470, SK.W + 40, 300), { fill: '#9fd07a', lw: 2.6 });
      shape(ctx, SK.poly([[140, 520], [1140, 520], [1240, 700], [40, 700]]), { fill: '#7fbf6a', lw: 2.6 });
      line(ctx, [[640, 520], [640, 700]], { lw: 2.4, line: '#ffffff' });
      // 球的轨迹
      const F0 = [400, 470], P0 = [880, 470];
      const hits = C.hits;
      let sx = F0[0], sy = F0[1], sang = 0, swingF = 0, swingP = 0;
      for (let i = 0; i < hits.length; i++) {
        const t0 = hits[i], t1 = i + 1 < hits.length ? hits[i + 1] : C.land;
        if (lt >= t0 && lt < t1) {
          const fromF = i % 2 === 0;
          const smash = i === hits.length - 1;
          const a = fromF ? [F0[0] + 70, F0[1] - 110] : smash ? [P0[0] - 70, 250] : [P0[0] - 70, P0[1] - 110];
          const b = i + 1 < hits.length ? (fromF ? (i + 1 === hits.length - 1 ? [P0[0] - 70, 250] : [P0[0] - 70, P0[1] - 110]) : [F0[0] + 70, F0[1] - 110]) : [F0[0] + 140, 690];
          const k = (lt - t0) / (t1 - t0);
          sx = SK.lerp(a[0], b[0], k);
          sy = SK.lerp(a[1], b[1], k) - (smash ? 0 : Math.sin(k * Math.PI) * 220);
          const nk = Math.min(1, k + 0.02);
          const nx = SK.lerp(a[0], b[0], nk), ny = SK.lerp(a[1], b[1], nk) - (smash ? 0 : Math.sin(nk * Math.PI) * 220);
          sang = Math.atan2(ny - sy, nx - sx);
        }
      }
      hits.forEach((t0, i) => {
        const sw = Math.exp(-Math.pow((lt - t0) / 0.12, 2));
        if (i % 2 === 0) swingF = Math.max(swingF, sw);
        else swingP = Math.max(swingP, sw);
      });
      const landed = lt >= C.land;
      if (landed) {
        sx = F0[0] + 140;
        sy = 690;
        sang = 0.4;
      }
      // 网
      shape(ctx, SK.rect(560, 390, 160, 110), { fill: 'rgba(255,255,255,0.25)', line: false, tex: 0 });
      ctx.save();
      ctx.strokeStyle = 'rgba(59,42,36,0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        ctx.moveTo(560, 390 + i * 18);
        ctx.lineTo(720, 390 + i * 18);
      }
      for (let i = 0; i <= 10; i++) {
        ctx.moveTo(560 + i * 16, 390);
        ctx.lineTo(560 + i * 16, 498);
      }
      ctx.stroke();
      ctx.restore();
      shape(ctx, SK.rect(556, 382, 168, 12), { fill: '#ffffff', lw: 2.2 });
      line(ctx, [[556, 390], [556, 700]], { lw: 4 });
      line(ctx, [[724, 390], [724, 700]], { lw: 4 });
      // 小猪飞起来扣杀
      const smashT = hits[hits.length - 1];
      const flyUp = SK.smooth(SK.prog(lt, smashT - 0.6, smashT - 0.1)) * (1 - SK.smooth(SK.prog(lt, smashT + 0.5, smashT + 1.2)));
      const dive = SK.smooth(SK.prog(lt, C.land - 0.3, C.land));
      const laugh = lt > C.land + 0.6;
      F(ctx, F0[0] + dive * 60, 640, 1.2, {
        t: lt,
        tilt: dive * 0.5 * (1 - SK.prog(lt, C.land + 0.5, C.land + 1)),
        arms: { l: 'down', r: [64, -50] },
        holdR: (c) => racket(c, 0.2 - swingF * 1.8 + (laugh ? 0.6 : 0)),
        face: dive > 0 && !laugh ? 'o' : laugh ? 'open' : 'smile',
        look: [Math.max(-1, Math.min(1, (sx - F0[0]) / 300)), -0.6],
        blush: 0.5,
      });
      G(ctx, P0[0], 640 - flyUp * 230, 1.2, {
        t: lt,
        fly: flyUp > 0.05,
        arms: { l: [-64, -50], r: 'down' },
        holdL: (c) => racket(c, -0.2 + swingP * 1.8),
        face: laugh ? 'happy' : flyUp > 0.3 ? 'open' : 'smile',
        look: [Math.max(-1, Math.min(1, (sx - P0[0]) / 300)), -0.6],
        blush: 0.5,
      });
      if (lt > hits[0] - 0.01) {
        if (!landed && lt > smashT && lt < C.land) {
          for (let i = 1; i < 6; i++) line(ctx, [[sx + Math.cos(sang) * -i * 18, sy + Math.sin(sang) * -i * 18], [sx + Math.cos(sang) * -(i + 1) * 18, sy + Math.sin(sang) * -(i + 1) * 18]], { lw: 3, line: 'rgba(255,255,255,0.8)' });
        }
        shuttle(ctx, sx, sy, sang);
      }
      hits.forEach((t0) => P.burst(ctx, lt, t0, t0 === smashT ? P0[0] - 70 : sx, t0 === smashT ? 250 : sy, { kind: 'star', n: 5, speed: 60, size: 7, life: 0.35, colors: ['#fff6a8'] }));
      if (landed) {
        P.burst(ctx, lt, C.land, F0[0] + 140, 690, { kind: 'star', n: 8, speed: 80, size: 8, life: 0.5 });
        if (lt > C.land + 0.6) {
          P.floatHearts(ctx, lt - C.land, 640, 420, { n: 6, spread: 300, rise: 120, size: 9 });
          text(ctx, '哈哈哈', 640, 330, { size: 40, color: '#ef5a6f', outline: '#fff', outlineW: 6 });
        }
      }
    },
  };

  /* ================= 哈利波特快闪 ================= */
  function candle(ctx, x, y, lt, i) {
    const b = Math.sin(lt * 1.5 + i) * 8;
    SK.glow(ctx, x, y - 30 + b, 40, '#ffcf5c', 0.5);
    shape(ctx, SK.rect(x - 7, y - 20 + b, 14, 44), { fill: '#fff6e0', lw: 2 });
    const fl = Math.sin(lt * 15 + i) * 2;
    shape(ctx, SK.spline([[x, y - 40 + b + fl], [x + 6, y - 28 + b], [x, y - 20 + b], [x - 6, y - 28 + b]]), { fill: '#ffb84d', lw: 1.6, tex: 0 });
  }
  function owl(ctx, x, y, lt) {
    const fl = Math.sin(lt * 14) * 0.6;
    ctx.save();
    ctx.translate(x, y);
    shape(ctx, SK.poly([[-10, -4], [-60, -30 - fl * 30], [-30, 8]]), { fill: '#c9b39a', lw: 2 });
    shape(ctx, SK.poly([[10, -4], [60, -30 - fl * 30], [30, 8]]), { fill: '#c9b39a', lw: 2 });
    shape(ctx, SK.ell(0, 0, 24, 28), { fill: '#f3ead8', lw: 2.4 });
    shape(ctx, SK.circ(-9, -6, 8), { fill: '#fff', lw: 1.8, tex: 0 });
    shape(ctx, SK.circ(9, -6, 8), { fill: '#fff', lw: 1.8, tex: 0 });
    dot(ctx, -9, -6, 3.4);
    dot(ctx, 9, -6, 3.4);
    shape(ctx, SK.poly([[-4, 2], [4, 2], [0, 9]]), { fill: '#f2b84b', lw: 1.4, tex: 0 });
    ctx.restore();
  }
  function trolley(ctx, x, y) {
    shape(ctx, SK.rect(x - 70, y - 30, 140, 16), { fill: '#8a8f9c', lw: 2.4 });
    shape(ctx, SK.rect(x - 60, y - 92, 110, 62), { fill: '#a3683f', lw: 2.4 });
    line(ctx, [[x - 60, y - 70], [x + 50, y - 70]], { lw: 2 });
    shape(ctx, SK.rect(x - 50, y - 150, 80, 58), { fill: '#7a4f33', lw: 2.4 });
    shape(ctx, SK.rrect(x - 30, y - 210, 50, 60, 20), { fill: 'rgba(255,255,255,0.2)', lw: 2.2 });
    owl(ctx, x - 5, y - 178, 0);
    line(ctx, [[x + 70, y - 22], [x + 100, y - 90]], { lw: 3 });
    shape(ctx, SK.circ(x - 50, y - 6, 9), { fill: '#3b3a48', lw: 2 });
    shape(ctx, SK.circ(x + 50, y - 6, 9), { fill: '#3b3a48', lw: 2 });
  }
  S.wizard = {
    tin: QUICK,
    tout: ['paper', 0.4],
    draw(ctx, lt) {
      const C = TL.cue.wizard;
      bricks(ctx, 0, 0, SK.W, SK.H, '#8a7b7f', '#5f5258');
      SK.vgrad(ctx, [[0, 'rgba(40,20,60,0.5)'], [1, 'rgba(40,20,60,0)']], 0, 300);
      // 9¾ 牌子
      shape(ctx, SK.rrect(560, 150, 160, 70, 8), { fill: '#2f2a4a', lw: 2.8 });
      text(ctx, '9¾', 640, 186, { size: 46, color: '#f6e7b8', font: SK.FONT_EN, weight: 'bold', seed: 2 });
      // 学院旗帜
      [[180, '#b33a3a', '#e9b949'], [1100, '#2f6b4a', '#c9ccd6']].forEach(([x, c1, c2], i) => {
        const sw = Math.sin(lt * 2 + i) * 4;
        shape(ctx, SK.poly([[x - 50, 60], [x + 50, 60], [x + 50 + sw, 250], [x + sw, 220], [x - 50 + sw, 250]]), { fill: c1, lw: 2.6 });
        P.star(ctx, x + sw * 0.5, 140, 18, c2);
      });
      // 半截进墙的手推车
      trolley(ctx, 1040, 600);
      shape(ctx, SK.rect(-20, 600, SK.W + 40, 140), { fill: '#6b6470', lw: 2.6 });
      for (let i = 0; i < 6; i++) candle(ctx, 120 + i * 210, 330 - (i % 2) * 50, lt, i);
      // 猫头鹰飞过
      if (lt < 3) owl(ctx, SK.lerp(-80, 1360, lt / 3), 110 + Math.sin(lt * 4) * 20, lt);
      const spell = lt > C.spell;
      const lev = spell ? SK.smooth(SK.prog(lt, C.spell + 0.3, C.spell + 1.2)) * (1 - SK.smooth(SK.prog(lt, C.flash - 0.3, C.flash))) : 0;
      F(ctx, 470, 640 - lev * 90 - Math.sin(lt * 3) * 6 * lev, 1.3, {
        t: lt,
        arms: lt > C.flash ? 'cheer' : lev > 0.2 ? 'up' : 'down',
        face: lev > 0.2 ? 'o' : 'open',
        look: [0.5, -0.3],
        blush: 0.6,
        acc: SH.combineAcc(SH.scarf(-46, 62, '#b33a3a', '#e9b949'), SH.frogGlasses),
      });
      G(ctx, 820, 640, 1.3, {
        t: lt,
        arms: { l: spell && lt < C.flash ? [-80, -110] : lt > C.flash ? [-80, -94] : 'down', r: lt > C.flash ? [80, -94] : 'down' },
        holdL: (c) => {
          c.rotate(-0.6);
          line(c, [[0, 0], [0, -52]], { lw: 5, line: '#7a4f33' });
          line(c, [[0, 0], [0, -52]], { lw: 1.6 });
        },
        face: spell ? 'happy' : 'smile',
        look: [-0.6, -0.2],
        blush: 0.7,
        acc: SH.combineAcc(SH.scarf(-24, 56, '#2f6b4a', '#c9ccd6'), SH.wizardHat),
      });
      // 魔法星星
      if (spell) {
        const k = SK.prog(lt, C.spell, C.spell + 0.8);
        const wx = 820 - 80 * 1.3 - 40, wy = 640 - 110 * 1.3 - 40;
        for (let i = 0; i < 16; i++) {
          const kk = Math.max(0, k - i * 0.04);
          const a = lt * 4 + i * 0.7;
          const r = 70 + Math.sin(i) * 30;
          const tx = 470 + Math.cos(a) * r, ty = 640 - 70 * 1.3 - lev * 90 + Math.sin(a) * r * 0.5;
          const x = SK.lerp(wx, tx, SK.easeOut(kk)), y = SK.lerp(wy, ty, SK.easeOut(kk));
          ctx.save();
          ctx.globalAlpha = kk > 0 ? 0.9 : 0;
          if (i % 2) P.star(ctx, x, y, 7 + (i % 3) * 2, '#ffe27a');
          else P.sparkle(ctx, x, y, 9, '#ffffff', { line: false });
          ctx.restore();
        }
      }
      // 合照定格
      if (lt > C.flash) {
        const k = SK.prog(lt, C.flash, C.flash + 0.4);
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, SK.W, SK.H);
        ctx.restore();
        const fk = SK.backOut(SK.prog(lt, C.flash, C.flash + 0.4));
        ctx.save();
        ctx.globalAlpha = Math.min(1, fk);
        shape(ctx, SK.rect(330, 300, 640, 380).map(([x, y]) => [640 + (x - 640) * (2 - fk), 490 + (y - 490) * (2 - fk)]), { fill: null, lw: 6, line: '#fff' });
        ctx.restore();
        P.burst(ctx, lt, C.flash, 640, 400, { kind: 'star', n: 16, speed: 260, size: 12, colors: ['#ffe27a', '#fff'] });
      }
    },
  };
})();
