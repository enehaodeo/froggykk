/* 第三幕：时光流逝 → 石膏画 → 马卡龙 & 回转寿司 → 看电影 → 打游戏 → 河边散步
 *          → 镜头下潜到地下的爱心 → 回到 10/20 → 分叉的路 → 结尾 */
(function () {
  const S = window.SCENES;
  const SH = window.SH;
  const { shape, line, curve, dot, text } = SK;
  const F = CH.frog, G = CH.pig;
  const CAVE = '#1e1218';

  /* ================= 时光流逝：一棵树的四季 ================= */
  const SEASONS = [
    { sky: ['#cfe9f7', '#fde7ef'], canopy: '#ffc4d4', ground: '#b8dc8c', p: 'petal' },
    { sky: ['#9fd6f2', '#e3f6ff'], canopy: '#7cc26a', ground: '#9fd07a', p: 'shine' },
    { sky: ['#f6cfa4', '#fff0dc'], canopy: '#f2a443', ground: '#d6c27a', p: 'leaf' },
    { sky: ['#cfdbe8', '#f4f8fc'], canopy: '#f4f7fb', ground: '#f2f5fa', p: 'snow' },
  ];
  S.seasons = {
    draw(ctx, lt, dur) {
      const D = dur / 4;
      const i = Math.min(3, Math.floor(lt / D));
      const k = (lt - i * D) / D;
      const j = Math.min(3, i + 1);
      const b = i < 3 ? SK.smooth(SK.prog(k, 0.7, 1)) : 0;
      const A = SEASONS[i], B = SEASONS[j];
      const mix = (a, c) => SK.mix(a, c, b);
      SK.vgrad(ctx, [[0, mix(A.sky[0], B.sky[0])], [1, mix(A.sky[1], B.sky[1])]], 0, 560);
      // 每个季节一个太阳的东升西落
      const sx = SK.lerp(120, 1160, k), sy = 330 - Math.sin(k * Math.PI) * 240;
      P.sun(ctx, sx, sy, 34, i === 3 ? '#fff3c4' : '#ffd76a');
      P.cloud(ctx, 260 + lt * 20, 120, 0.9, '#ffffff');
      P.cloud(ctx, 900 + lt * 14, 90, 0.7, '#ffffff');
      shape(ctx, SK.ell(640, 780, 820, 240), { fill: mix(A.ground, B.ground), lw: 2.8, shade: SK.mix(mix(A.ground, B.ground), '#3a5a2a', 0.15) });
      // 大树
      const canopy = mix(A.canopy, B.canopy);
      ctx.save();
      ctx.translate(640, 580);
      ctx.scale(2.0, 2.0);
      shape(ctx, SK.poly([[-14, 0], [-10, -90], [10, -90], [15, 0]], true, 8), { fill: '#a5774f', lw: 2.4 });
      line(ctx, [[-4, -60], [-30, -96]], { lw: 3.4 });
      line(ctx, [[4, -70], [30, -104]], { lw: 3.4 });
      const blobs = [[-46, -118, 46], [44, -122, 46], [0, -160, 54], [-6, -112, 56], [62, -92, 32], [-64, -92, 32]];
      blobs.forEach(([x, y, r]) => shape(ctx, SK.circ(x, y, r), { fill: canopy, shade: SK.mix(canopy, '#5a3a1a', i === 3 && b < 0.5 ? 0.08 : 0.2), shadeDist: 8 }));
      if (i === 0 && b < 0.6) for (let q = 0; q < 14; q++) dot(ctx, -70 + SK.hash(q) * 140, -180 + SK.hash(q * 3) * 120, 4, '#ff9fb8');
      if (i === 2 && b < 0.6) for (let q = 0; q < 10; q++) dot(ctx, -70 + SK.hash(q) * 140, -180 + SK.hash(q * 3) * 120, 4, '#e2702f');
      ctx.restore();
      // 坐在树下的两个人
      const sway = Math.sin(lt * 2) * 0.05;
      const winter = i === 3 || (i === 2 && b > 0.5);
      F(ctx, 545, 650, 1.15, { t: lt, tilt: sway, face: 'happy', blush: 0.7, acc: winter ? SH.scarf(-46, 62, '#e86a6a', '#ffffff') : null });
      G(ctx, 735, 650, 1.15, { t: lt, tilt: sway, face: 'happy', blush: 0.7, acc: winter ? SH.scarf(-24, 56, '#7aa6e8', '#ffffff') : null });
      // 粒子
      const p = b > 0.5 ? B.p : A.p;
      for (let q = 0; q < 26; q++) {
        const sp = 50 + SK.hash(q * 1.3) * 60;
        const y = ((lt * sp + SK.hash(q * 2.7) * 800) % 800) - 40;
        const x = SK.hash(q * 4.1) * SK.W + Math.sin(lt * 1.5 + q) * 30;
        if (p === 'petal') shape(ctx, SK.ell(x, y, 6, 3.6, lt * 2 + q), { fill: '#ffc4d4', lw: 1.2, tex: 0 });
        else if (p === 'leaf') SH.ginkgoLeaf(ctx, x, y, 0.8, lt * 2 + q, q % 2 ? '#f2a443' : '#e2702f');
        else if (p === 'snow') dot(ctx, x, y, 3 + SK.hash(q) * 3, '#ffffff');
        else if (q % 3 === 0) {
          ctx.save();
          ctx.globalAlpha = 0.6 + 0.4 * Math.sin(lt * 4 + q);
          P.sparkle(ctx, x, (y % 400) + 60, 6, '#fff6b0', { line: false });
          ctx.restore();
        }
      }
      // 日历一页页飞走
      const months = 12;
      const mk = lt / dur;
      const m = Math.floor(mk * months);
      const label = (n) => ((n + 2) % 12) + 1 + '月';
      P.calendar(ctx, 1120, 170, 0.5, { month: '', day: label(m), daySize: 80, top: '#7aa6e8' });
      const pk = (mk * months) % 1;
      if (pk < 0.6) {
        const e = SK.easeIn(pk / 0.6);
        ctx.save();
        ctx.translate(1120 + e * 140, 170 - e * 160);
        ctx.rotate(e * 1.6);
        ctx.globalAlpha = 1 - e;
        P.calendar(ctx, 0, 0, 0.5, { month: '', day: label(m - 1), daySize: 80, top: '#7aa6e8' });
        ctx.restore();
      }
    },
  };

  /* ================= 青蛙的石膏画 ================= */
  const PAINT_PATH = (() => {
    const pts = [];
    let row = 0;
    for (let y = -112; y <= 112; y += 28, row++) {
      const w = Math.sqrt(Math.max(0, 1 - (y / 130) ** 2)) * 98;
      const n = 5;
      for (let i = 0; i <= n; i++) {
        const x = -w + ((row % 2 ? n - i : i) / n) * 2 * w;
        pts.push([x + (SK.hash(pts.length) - 0.5) * 10, y + (SK.hash(pts.length * 3) - 0.5) * 8]);
      }
    }
    return pts;
  })();
  function plaqueArt(ctx, painted) {
    shape(ctx, SK.ell(0, 0, 100, 120), { fill: painted ? '#bfe3f5' : '#f6f3ec', lw: 2, line: painted ? SK.INK : '#bdb5a8' });
    if (painted) for (let i = 0; i < 6; i++) P.sparkle(ctx, -70 + SK.hash(i) * 140, -90 + SK.hash(i * 2) * 40 + (i % 2) * 140, 6, '#ffffff', { line: false });
    shape(ctx, SK.heartPts(0, 4, 74), { fill: painted ? '#ffb3c6' : '#f2eee6', lw: 2.4, line: painted ? SK.INK : '#bdb5a8' });
    if (painted) {
      SH.miniFrogFace(ctx, -30, 8, 22);
      SH.miniPigFace(ctx, 30, 12, 21);
    } else {
      ctx.save();
      ctx.globalAlpha = 0.5;
      SH.miniFrogFace(ctx, -30, 8, 22);
      SH.miniPigFace(ctx, 30, 12, 21);
      ctx.restore();
    }
  }
  function plaque(ctx, x, y, s, k, lt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    shape(ctx, SK.ell(6, 8, 122, 142), { fill: 'rgba(60,40,20,0.2)', line: false, tex: 0 });
    shape(ctx, SK.ell(0, 0, 122, 142), { fill: '#fbf9f4', shade: '#dcd6ca', shadeDist: 8, lw: 2.8 });
    // 未上色的石膏（浅浅的浮雕）
    ctx.save();
    ctx.globalAlpha = 1;
    plaqueArt(ctx, false);
    ctx.restore();
    // 已经刷上颜色的部分
    const n = Math.floor(k * PAINT_PATH.length);
    if (n > 0) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const [px, py] = PAINT_PATH[i];
        ctx.moveTo(px + 34, py);
        ctx.arc(px, py, 34, 0, Math.PI * 2);
      }
      if (k >= 0.999) {
        ctx.moveTo(130, 0);
        ctx.ellipse(0, 0, 130, 150, 0, 0, Math.PI * 2);
      }
      ctx.clip();
      plaqueArt(ctx, true);
      ctx.restore();
    }
    ctx.restore();
    return n > 0 ? PAINT_PATH[Math.min(PAINT_PATH.length - 1, n)] : PAINT_PATH[0];
  }
  SH.beret = function (ctx) {
    shape(ctx, SK.spline([[-54, -112], [-40, -136], [0, -142], [36, -130], [42, -112], [0, -118]]), { fill: '#e8605f', lw: 2.6 });
    line(ctx, [[0, -140], [4, -150]], { lw: 3 });
  };
  S.plaster = {
    draw(ctx, lt) {
      const C = TL.cue.plaster;
      SK.bg(ctx, '#f6ead8');
      P.window(ctx, 960, 90, 220, 180, { curtain: '#f7d77a' });
      // 墙上的小画
      [[120, 120, '#bfe3f5'], [300, 90, '#ffd9e2']].forEach(([x, y, c], i) => {
        shape(ctx, SK.rect(x, y, 120, 90), { fill: '#fffaf0', lw: 2.6 });
        shape(ctx, SK.rect(x + 10, y + 10, 100, 70), { fill: c, lw: 1.6 });
        if (i === 0) P.heart(ctx, x + 60, y + 46, 18, '#ef5a6f');
        else P.star(ctx, x + 60, y + 46, 20, '#ffd35c');
      });
      // 架子 + 颜料罐
      shape(ctx, SK.rect(80, 300, 300, 14), { fill: '#c99b6d', lw: 2.4 });
      ['#ef5a6f', '#7cc3ea', '#9ccc68', '#ffd35c', '#c7b3ff'].forEach((c, i) => {
        shape(ctx, SK.rrect(96 + i * 56, 256, 40, 44, 8), { fill: '#fffaf0', lw: 2.2 });
        shape(ctx, SK.rect(98 + i * 56, 268, 36, 18), { fill: c, line: false });
      });
      SH.floor(ctx, 600, '#e3c39d');
      // 画架
      const ex = 680, ey = 380;
      line(ctx, [[ex - 90, 640], [ex - 30, 220]], { lw: 7, line: '#b98a5c' });
      line(ctx, [[ex + 90, 640], [ex + 30, 220]], { lw: 7, line: '#b98a5c' });
      line(ctx, [[ex, 650], [ex, 300]], { lw: 6, line: '#a5774f' });
      shape(ctx, SK.rect(ex - 110, 520, 220, 16), { fill: '#c99b6d', lw: 2.4 });
      const paintK = SK.prog(lt, 0.6, C.done);
      const lifted = SK.easeInOut(SK.prog(lt, C.love + 0.6, C.love + 1.4));
      const pigX = SK.lerp(1460, 960, SK.easeOut(SK.prog(lt, C.done + 0.1, C.love - 0.2)));
      const px = SK.lerp(ex, pigX - 118, lifted), py = SK.lerp(ey, 520, lifted), ps = SK.lerp(0.95, 0.55, lifted);
      const spin = lifted > 0 ? -0.15 * lifted + Math.sin((lt - C.love - 0.6) * 5) * 0.06 * lifted : 0;
      let tip = PAINT_PATH[0];
      const drawPlaque = () => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(spin);
        tip = plaque(ctx, 0, 0, ps, paintK, lt);
        ctx.restore();
      };
      if (lifted < 0.5) drawPlaque();
      // 调色盘
      shape(ctx, SK.spline([[470, 690], [520, 650], [600, 652], [640, 690], [600, 716], [500, 716]]), { fill: '#e9c9a0', lw: 2.4 });
      ['#ef5a6f', '#7cc3ea', '#9ccc68', '#ffd35c', '#ffb3c6'].forEach((c, i) => dot(ctx, 500 + i * 26, 680 + (i % 2) * 10, 8, c));
      // 青蛙作画
      const painting = lt > 0.5 && lt < C.done;
      const tx = ex + tip[0] * 0.95, ty = ey + tip[1] * 0.95;
      const fx = 420, fy = 660, fs = 1.35;
      let arms = 'down', holdR = null;
      if (painting) {
        const wig = Math.sin(lt * 14) * 6;
        const hx = (tx - 60 - fx) / fs + wig * 0.3, hy = (ty + 40 - fy) / fs;
        arms = { l: 'down', r: [Math.min(120, hx), hy] };
        holdR = (c) => {
          const ang = Math.atan2(ty - (fy + hy * fs), tx - (fx + Math.min(120, hx) * fs));
          c.rotate(ang);
          line(c, [[-10, 0], [62, 0]], { lw: 5, line: '#c99b6d' });
          line(c, [[-10, 0], [62, 0]], { lw: 1.6 });
          shape(c, SK.ell(70, 0, 10, 5), { fill: ['#7cc3ea', '#ffb3c6', '#9ccc68'][Math.floor(lt * 2) % 3], lw: 1.8 });
        };
      } else if (lt >= C.done) {
        arms = lt < C.love ? { l: 'down', r: [90, -80] } : 'cheer';
      }
      F(ctx, fx, fy, fs, {
        t: lt,
        arms,
        holdR,
        face: painting ? (Math.floor(lt * 1.5) % 2 ? 'flat' : 'smile') : 'open',
        look: painting ? [0.9, -0.3] : [0.8, 0],
        blush: lt > C.love ? 1 : 0.5,
        acc: SH.beret,
      });
      if (painting) {
        for (let i = 0; i < 3; i++) {
          const k = (lt * 2 + i / 3) % 1;
          ctx.save();
          ctx.globalAlpha = Math.sin(k * Math.PI);
          P.note(ctx, fx - 40 - k * 30, fy - 220 - k * 60, 0.8, '#7aa6e8');
          ctx.restore();
        }
      }
      if (lt > C.done && lt < C.done + 0.8) P.burst(ctx, lt, C.done, ex, ey, { kind: 'star', n: 12, speed: 180, size: 10, colors: ['#ffe27a', '#ffffff'] });
      // 小猪飞来，超级喜欢
      if (lt > C.done) {
        const love = lt > C.love;
        G(ctx, pigX, 640, 1.35, {
          t: lt,
          fly: lt < C.love - 0.1,
          arms: lifted > 0.5 ? { l: [-96, -70], r: 'down' } : love ? 'up' : 'down',
          face: love ? 'love' : 'o',
          look: [-0.9, -0.2],
          blush: love ? 1 : 0.6,
        });
        if (lifted >= 0.5) drawPlaque();
        if (lt > C.love - 0.5 && lt < C.love) P.exclaim(ctx, pigX, 440, 1.2, 2);
        if (love) {
          P.burst(ctx, lt, C.love, pigX, 470, { kind: 'heart', n: 16, speed: 260, size: 12, life: 1.8 });
          P.floatHearts(ctx, lt - C.love, pigX, 430, { n: 8, spread: 200, rise: 200, size: 11 });
        }
      }
    },
  };

  /* ================= 马卡龙 & 回转寿司 ================= */
  function macaron(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const shell = (yy) => shape(ctx, SK.rrect(-22, yy - 8, 44, 16, 8), { fill: color, lw: 2.2, shade: SK.mix(color, '#5a3040', 0.18), shadeDist: 4 });
    shell(-9);
    shape(ctx, SK.rect(-19, -3, 38, 6), { fill: '#fffaf0', lw: 1.6, tex: 0 });
    shell(9);
    ctx.restore();
  }
  function bitten(ctx, x, y, s, color, bg) {
    macaron(ctx, x, y, s, color);
    shape(ctx, SK.circ(x + 20 * s, y - 6 * s, 11 * s), { fill: bg, line: SK.INK, lw: 2, tex: 0 });
    shape(ctx, SK.circ(x + 22 * s, y + 8 * s, 9 * s), { fill: bg, line: SK.INK, lw: 2, tex: 0 });
  }
  function sushi(ctx, x, y, kind) {
    shape(ctx, SK.ell(x, y + 8, 34, 11), { fill: '#ffffff', lw: 2.2, tex: 0 });
    shape(ctx, SK.ell(x, y + 8, 26, 7), { fill: null, line: ['#7aa6e8', '#ef5a6f', '#ffd35c', '#9ccc68'][kind % 4], lw: 2.2 });
    if (kind % 4 === 0) {
      shape(ctx, SK.rrect(x - 16, y - 6, 32, 14, 6), { fill: '#fffdf6', lw: 2, tex: 0 });
      shape(ctx, SK.rrect(x - 19, y - 14, 38, 11, 5), { fill: '#ff9a6a', lw: 2, tex: 0.1 });
      line(ctx, [[x - 12, y - 12], [x - 6, y - 6]], { lw: 1.6, line: '#fff' });
      line(ctx, [[x, y - 12], [x + 6, y - 6]], { lw: 1.6, line: '#fff' });
    } else if (kind % 4 === 1) {
      shape(ctx, SK.rrect(x - 16, y - 6, 32, 14, 6), { fill: '#fffdf6', lw: 2, tex: 0 });
      shape(ctx, SK.rrect(x - 18, y - 16, 36, 13, 4), { fill: '#ffd85c', lw: 2, tex: 0.1 });
      shape(ctx, SK.rect(x - 5, y - 17, 10, 22), { fill: '#2f3b2f', line: false, tex: 0 });
    } else if (kind % 4 === 2) {
      for (let i = -1; i <= 1; i++) {
        shape(ctx, SK.circ(x + i * 14, y, 8), { fill: '#2f3b2f', lw: 1.8, tex: 0 });
        dot(ctx, x + i * 14, y, 5, '#fffdf6');
        dot(ctx, x + i * 14, y, 2.4, i ? '#ff9a6a' : '#9ccc68');
      }
    } else {
      shape(ctx, SK.rrect(x - 16, y - 6, 32, 14, 6), { fill: '#fffdf6', lw: 2, tex: 0 });
      shape(ctx, SK.spline([[x - 20, y - 6], [x - 6, y - 18], [x + 14, y - 16], [x + 22, y - 8], [x + 10, y - 6]]), { fill: '#ff7f62', lw: 2, tex: 0.1 });
      line(ctx, [[x - 4, y - 16], [x - 2, y - 8]], { lw: 1.6, line: '#fff' });
      line(ctx, [[x + 6, y - 16], [x + 8, y - 8]], { lw: 1.6, line: '#fff' });
    }
  }
  function plateStack(ctx, x, y, n) {
    const cols = ['#7aa6e8', '#ef5a6f', '#ffd35c', '#9ccc68'];
    for (let i = 0; i < n; i++) {
      shape(ctx, SK.ell(x, y - i * 10, 36, 9), { fill: '#ffffff', lw: 2, tex: 0, seed: 400 + i });
      line(ctx, [[x - 30, y - i * 10 + 3], [x + 30, y - i * 10 + 3]], { lw: 2.2, line: cols[i % 4], seed: 450 + i });
    }
  }
  S.food = {
    tout: ['ink', 0.4],
    draw(ctx, lt, dur) {
      const C = TL.cue.food;
      const half = dur / 2;
      if (lt < half) {
        // 马卡龙：互相喂一口
        const bg = '#dff2ea';
        SK.bg(ctx, bg);
        for (let i = 0; i < 14; i++) shape(ctx, SK.rect(i * 96, 0, 48, 520), { fill: '#d0eadf', line: false, tex: 0.1 });
        for (const lx of [360, 920]) {
          line(ctx, [[lx, 0], [lx, 90]], { lw: 2 });
          SK.glow(ctx, lx, 120, 120, '#fff3c0', 0.5);
          shape(ctx, SK.poly([[lx - 50, 140], [lx - 22, 90], [lx + 22, 90], [lx + 50, 140]]), { fill: '#f7d77a', lw: 2.4 });
        }
        const fx = 500, px = 780, y = 572;
        const pick = lt > 0.6;
        const toMouth = SK.easeInOut(SK.prog(lt, 1.0, C.bites[0]));
        const bit = lt > C.bites[0];
        const chewing = bit && lt < C.bites[1] + 0.6;
        const chew = chewing && Math.floor(lt * 6) % 2;
        F(ctx, fx, y, 1.35, {
          t: lt,
          arms: pick ? { l: 'down', r: [SK.lerp(70, 26, toMouth), SK.lerp(-26, -52, toMouth)] } : 'down',
          holdR: pick ? (c) => (bit ? bitten(c, 0, -6, 0.9, '#ffb3c6', '#ffffff') : macaron(c, 0, -6, 0.9, '#ffb3c6')) : null,
          face: chewing ? (chew ? 'open' : 'happy') : bit ? 'happy' : 'open',
          look: [0.8, 0],
          blush: bit ? 1 : 0.6,
        });
        G(ctx, px, y, 1.35, {
          t: lt,
          arms: pick ? { l: [SK.lerp(-70, -24, toMouth), SK.lerp(-26, -30, toMouth)], r: 'down' } : 'down',
          holdL: pick ? (c) => (bit ? bitten(c, 0, -6, 0.9, '#b8e08a', '#ffffff') : macaron(c, 0, -6, 0.9, '#b8e08a')) : null,
          face: chewing ? (chew ? 'open' : 'happy') : bit ? 'happy' : 'open',
          look: [-0.8, 0],
          blush: bit ? 1 : 0.6,
        });
        // 桌子
        shape(ctx, SK.ell(640, 600, 360, 50), { fill: '#fffaf2', lw: 2.6 });
        shape(ctx, SK.poly([[300, 600], [980, 600], [960, 730], [320, 730]]), { fill: '#fde3ea', lw: 2.6, shade: '#f2c3d0' });
        for (let i = 0; i < 8; i++) shape(ctx, SK.ell(330 + i * 88, 646, 40, 22), { fill: '#fff', line: false, tex: 0, alpha: 0.5 });
        shape(ctx, SK.ell(640, 590, 120, 22), { fill: '#ffffff', lw: 2.4 });
        const cols = ['#ffb3c6', '#b8e08a', '#c7b3ff', '#ffd35c', '#a9d9f2', '#ffb3c6', '#b8e08a'];
        [[-64, 6], [-22, 8], [22, 8], [64, 6], [-42, -10], [0, -8], [42, -10]].forEach(([dx, dy], i) => macaron(ctx, 640 + dx, 584 + dy, 0.8, cols[i % cols.length]));
        if (bit) {
          P.burst(ctx, lt, C.bites[0], 640, 480, { kind: 'heart', n: 12, speed: 160, size: 11 });
          for (let i = 0; i < 6; i++) {
            const k = SK.prog(lt, C.bites[0], C.bites[0] + 0.8);
            dot(ctx, 640 + (i - 2.5) * 30 * k, 520 + k * k * 120, 3, i % 2 ? '#ffb3c6' : '#b8e08a');
          }
        }
        if (lt > C.bites[1]) P.floatHearts(ctx, lt - C.bites[1], 640, 440, { n: 6, spread: 200, rise: 150, size: 10 });
        return;
      }
      // 回转寿司
      SK.bg(ctx, '#f4e6cf');
      for (let i = 0; i < 26; i++) line(ctx, [[i * 52, 0], [i * 52, 420]], { lw: 1.6, line: 'rgba(150,110,70,0.3)' });
      // 门帘
      for (let i = 0; i < 5; i++) {
        const sw = Math.sin(lt * 1.5 + i) * 3;
        shape(ctx, SK.poly([[380 + i * 104, 0], [478 + i * 104, 0], [478 + i * 104 + sw, 120], [380 + i * 104 + sw, 120]]), { fill: i % 2 ? '#2f4f7a' : '#3b5f8a', lw: 2.4 });
      }
      for (const lx of [200, 1080]) {
        line(ctx, [[lx, 0], [lx, 70]], { lw: 2 });
        SK.glow(ctx, lx, 130, 90, '#ffcf8a', 0.5);
        shape(ctx, SK.ell(lx, 130, 34, 50), { fill: '#f07a6a', lw: 2.4 });
        line(ctx, [[lx - 34, 130], [lx + 34, 130]], { lw: 1.6 });
      }
      const grabs = C.grabs;
      const nF = grabs.filter((g, i) => i % 2 === 0 && lt > g + 0.4).length;
      const nP = grabs.filter((g, i) => i % 2 === 1 && lt > g + 0.4).length;
      const chewF = grabs.some((g, i) => i % 2 === 0 && lt > g + 0.4 && lt < g + 1.2);
      const chewP = grabs.some((g, i) => i % 2 === 1 && lt > g + 0.4 && lt < g + 1.2);
      const full = SK.smooth(SK.prog(lt, 8.6, 9.2));
      const fx = 470, px = 810;
      const grabArm = (who) => {
        let best = null;
        grabs.forEach((g, i) => {
          if ((i % 2 === 0) !== (who === 'F')) return;
          const k = SK.prog(lt, g - 0.3, g + 0.4);
          if (k > 0 && k < 1) best = Math.sin(k * Math.PI);
        });
        return best;
      };
      const gF = grabArm('F'), gP = grabArm('P');
      F(ctx, fx, 522, 1.3, { t: lt, arms: gF != null ? { l: 'down', r: [60 + gF * 20, -20 + gF * 50] } : 'down', face: chewF ? (Math.floor(lt * 8) % 2 ? 'open' : 'happy') : full > 0 ? 'happy' : 'smile', look: [0, 0.8], blush: 0.6 + full * 0.4, squash: 1 - full * 0.08 });
      G(ctx, px, 522, 1.3, { t: lt, arms: gP != null ? { l: [-60 - gP * 20, -20 + gP * 50], r: 'down' } : 'down', face: chewP ? (Math.floor(lt * 8) % 2 ? 'open' : 'happy') : full > 0 ? 'happy' : 'smile', look: [0, 0.8], blush: 0.6 + full * 0.4, squash: 1 - full * 0.08 });
      // 吧台 + 传送带
      shape(ctx, SK.rect(-20, 500, SK.W + 40, 26), { fill: '#d9b07a', lw: 2.6 });
      shape(ctx, SK.rect(-20, 524, SK.W + 40, 54), { fill: '#c9ccd6', lw: 2.6 });
      for (let i = 0; i < 30; i++) {
        const x = ((i * 50 + lt * 120) % 1500) - 100;
        line(ctx, [[x, 526], [x, 576]], { lw: 1.4, line: 'rgba(80,80,100,0.35)' });
      }
      const L = 1530;
      for (let i = 0; i < 9; i++) {
        const x = ((i * 170 + lt * 120) % L) - 120;
        let hidden = false;
        grabs.forEach((g, gi) => {
          const gx = gi % 2 === 0 ? fx + 80 : px - 80;
          const xg = ((i * 170 + g * 120) % L) - 120;
          if (Math.abs(xg - gx) < 85 && lt > g && x > xg - 1 && x < 1400) hidden = true;
        });
        if (!hidden) sushi(ctx, x, 538, i);
      }
      shape(ctx, SK.rect(-20, 576, SK.W + 40, 160), { fill: '#b98a5c', lw: 2.6, shade: '#9c7048' });
      for (let i = 0; i < 6; i++) line(ctx, [[i * 230 + 40, 610], [i * 230 + 160, 610]], { lw: 1.6, line: 'rgba(80,50,30,0.35)' });
      // 越叠越高的盘子
      plateStack(ctx, 170, 494, 4 + nF * 3);
      plateStack(ctx, 1110, 494, 4 + nP * 3);
      grabs.forEach((g, gi) => {
        const k = SK.prog(lt, g, g + 0.4);
        if (k <= 0 || k >= 1) return;
        const sx = gi % 2 === 0 ? fx + 80 : px - 80;
        const tx = gi % 2 === 0 ? 170 : 1110;
        sushi(ctx, SK.lerp(sx, tx, k), 520 - Math.sin(k * Math.PI) * 120, gi + 1);
      });
      if (full > 0) P.floatHearts(ctx, lt, 640, 400, { n: 6, spread: 360, rise: 120, size: 9, alpha: full });
    },
  };

  /* ================= 看电影：青蛙靠在小猪肩上 ================= */
  S.movie = {
    tin: ['ink', 0.4],
    draw(ctx, lt) {
      const C = TL.cue.movie;
      const flick = SK.noise(lt * 6);
      ctx.save();
      const z = SK.lerp(1, 1.22, SK.easeInOut(SK.prog(lt, 0, 9.6)));
      SK.camera(ctx, 640, SK.lerp(360, 430, SK.prog(lt, 0, 9.6)), z);
      SK.bg(ctx, '#241b2e');
      // 后排座椅
      for (let r = 0; r < 2; r++) {
        for (let i = -1; i < 9; i++) {
          const x = i * 160 + (r % 2) * 80, y = 300 - r * 90;
          shape(ctx, SK.rrect(x, y, 130, 120, 30), { fill: SK.mix('#8e2f3a', '#241b2e', 0.35 + r * 0.25), lw: 2.2, seed: 600 + r * 20 + i });
        }
      }
      // 两张座椅
      const seat = (x) => shape(ctx, SK.rrect(x - 105, 380, 210, 290, 50), { fill: '#c8434e', lw: 2.8, shade: '#a2323d' });
      seat(540);
      seat(760);
      const lean = SK.easeInOut(SK.prog(lt, C.lean, C.lean + 1.6));
      const shy = lt > C.lean + 1.8;
      G(ctx, 760, 650, 1.45, {
        t: lt,
        arms: 'front',
        hold: (c) => P.popcorn(c, 0, 16, 0.8),
        face: shy ? 'happy' : 'smile',
        look: lean > 0.3 ? [-0.9, 0.2] : [0, -0.2],
        blush: 0.5 + lean * 0.6,
      });
      F(ctx, 540 + lean * 18, 650, 1.45, {
        t: lt,
        tilt: lean * 0.34,
        arms: 'down',
        face: lean > 0.5 ? 'happy' : 'smile',
        look: [0, -0.2],
        blush: 0.5 + lean * 0.5,
      });
      // 扶手 & 前排靠背
      shape(ctx, SK.rrect(626, 560, 48, 140, 18), { fill: '#7a2a33', lw: 2.6 });
      shape(ctx, SK.rect(-200, 640, SK.W + 400, 200), { fill: '#3a2030', lw: 2.6 });
      if (lt > C.lean + 2.0) {
        P.floatHearts(ctx, lt - C.lean - 2.0, 660, 400, { n: 6, spread: 60, rise: 160, size: 11 });
        const k = SK.pop(lt, C.lean + 2.0, 0.5);
        P.heart(ctx, 660, 380 - Math.sin(lt * 2) * 6, 22 * k, '#ff7d93');
      }
      ctx.restore();
      // 银幕的光
      SH.darkness(ctx, 0.62, '#0e0a18', (m) => {
        SH.softLight(m, 650, 520, 430 + flick * 60, 0.85);
      });
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = flick > 0.6 ? '#8fb8ff' : '#ffd29a';
      ctx.fillRect(0, 0, SK.W, SK.H);
      ctx.restore();
    },
  };

  /* ================= 一起打游戏 ================= */
  const SPR_FROG = ['.gg..gg.', 'gwkggwkg', 'gggggggg', 'gddddddg', '.gggggg.', 'g.g..g.g'];
  const SPR_PIG = ['p.pppp.p', 'bppppppb', 'bpkppkpb', 'pppnnppp', '.pppppp.', '.p.pp.p.'];
  const PAL = { g: '#7ec850', w: '#ffffff', k: '#222222', d: '#3d7a2a', p: '#ff9fb8', n: '#e86a8a', b: '#bfe8ff' };
  function sprite(ctx, rows, x, y, px) {
    rows.forEach((r, j) => {
      for (let i = 0; i < r.length; i++) {
        const c = PAL[r[i]];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x + i * px, y + j * px, px, px);
      }
    });
  }
  function pixelGame(ctx, x, y, w, h, lt, won) {
    ctx.fillStyle = '#7fc7ff';
    ctx.fillRect(x, y, w, h);
    const px = 8;
    const scroll = won ? 0 : lt * 60;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const cx = x + ((i * 170 - scroll * 0.3) % (w + 100) + w + 100) % (w + 100) - 50;
      ctx.fillRect(cx, y + 30 + (i % 2) * 20, 48, 16);
      ctx.fillRect(cx + 8, y + 22 + (i % 2) * 20, 28, 8);
    }
    // 地面砖块
    for (let i = -1; i < w / 32 + 2; i++) {
      const bx = x + i * 32 - (scroll % 32);
      ctx.fillStyle = '#c87a3c';
      ctx.fillRect(bx, y + h - 40, 31, 40);
      ctx.fillStyle = '#8a4f22';
      ctx.fillRect(bx, y + h - 40, 31, 4);
    }
    // 金币
    for (let i = 0; i < 5; i++) {
      const cx = x + ((i * 110 + 60 - scroll) % (w + 60) + w + 60) % (w + 60) - 30;
      const sq = Math.abs(Math.cos(lt * 4 + i));
      ctx.fillStyle = '#ffd35c';
      ctx.fillRect(cx - 6 * sq, y + h - 110, 12 * sq + 1, 16);
    }
    const jf = Math.abs(Math.sin(lt * 4)) * 50, jp = Math.abs(Math.sin(lt * 4 + 1.3)) * 50;
    sprite(ctx, SPR_FROG, x + w * 0.3, y + h - 40 - 6 * px - (won ? Math.abs(Math.sin(lt * 8)) * 30 : jf), px);
    sprite(ctx, SPR_PIG, x + w * 0.55, y + h - 40 - 6 * px - (won ? Math.abs(Math.sin(lt * 8 + 1)) * 30 : jp), px);
    ctx.fillStyle = '#222';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('1P ♥♥♥', x + 12, y + 10);
    ctx.fillText('2P ♥♥♥', x + w - 100, y + 10);
    if (won) {
      const blink = Math.floor(lt * 4) % 2;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x, y + h / 2 - 50, w, 70);
      ctx.fillStyle = blink ? '#ffd35c' : '#ffffff';
      ctx.font = 'bold 44px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', x + w / 2, y + h / 2 - 40);
      ctx.textAlign = 'left';
    }
  }
  function controller(ctx) {
    shape(ctx, SK.rrect(-16, -9, 32, 18, 8), { fill: '#f4f4f8', lw: 2 });
    dot(ctx, -8, 0, 2.5, '#7aa6e8');
    dot(ctx, 8, 0, 2.5, '#ef5a6f');
  }
  S.game = {
    draw(ctx, lt) {
      const C = TL.cue.game;
      const won = lt > C.win;
      SK.bg(ctx, '#f3e3cf');
      SH.wallDots(ctx, 0, 0, SK.W, 560, '#ead3b8', 'star');
      shape(ctx, SK.rect(300, 440, 680, 90), { fill: '#c99b6d', lw: 2.6 });
      shape(ctx, SK.rrect(330, 80, 620, 370, 18), { fill: '#3b3a48', lw: 3 });
      ctx.save();
      ctx.beginPath();
      ctx.rect(350, 100, 580, 330);
      ctx.clip();
      pixelGame(ctx, 350, 100, 580, 330, lt, won);
      ctx.restore();
      SK.glow(ctx, 640, 265, 420, '#bfe3ff', 0.18);
      SH.floor(ctx, 560, '#e3c39d');
      const lean = won ? 0 : Math.sin(lt * 3) * 0.1;
      const hop = won ? Math.abs(Math.sin((lt - C.win) * 7)) * 34 * (lt < C.win + 1.0 ? 1 : 0) : 0;
      const five = lt > C.win + 1.1;
      const fArm = won ? (five ? { l: [-70, -110], r: [82, -150] } : { l: [-76, -130], r: [76, -130] }) : { l: [-56, -36], r: [56, -36] };
      const pArm = won ? (five ? { l: [-82, -150], r: [70, -110] } : { l: [-76, -124], r: [76, -124] }) : { l: [-56, -32], r: [56, -32] };
      F(ctx, 520, 650 - hop, 1.5, { t: lt, back: true, tilt: lean, backArm: fArm });
      G(ctx, 760, 650 - hop, 1.5, { t: lt, back: true, tilt: lean, backArm: pArm });
      if (won && !five) {
        [[520 - 76 * 1.5, 650 - hop - 130 * 1.5], [520 + 76 * 1.5, 650 - hop - 130 * 1.5]].forEach(([x, y]) => {
          ctx.save();
          ctx.translate(x, y - 10);
          controller(ctx);
          ctx.restore();
        });
      }
      if (five) {
        P.burst(ctx, lt, C.win + 1.15, 640, 425, { kind: 'star', n: 12, speed: 160, size: 11, colors: ['#ffe27a', '#ffffff'] });
        const k = SK.pop(lt, C.win + 1.15, 0.3);
        ctx.save();
        ctx.translate(640, 360);
        ctx.scale(k, k);
        text(ctx, '耶!', 0, 0, { size: 54, color: '#ef5a6f', outline: '#fff', outlineW: 8 });
        ctx.restore();
      }
      // 沙发靠背
      shape(ctx, SK.rrect(240, 590, 800, 200, 50), { fill: '#7cc0b8', lw: 3, shade: '#5ea39b' });
      shape(ctx, SK.rrect(200, 560, 90, 220, 40), { fill: '#6fb3ab', lw: 2.6 });
      shape(ctx, SK.rrect(990, 560, 90, 220, 40), { fill: '#6fb3ab', lw: 2.6 });
      if (won) P.confetti(ctx, lt, C.win, { n: 40, x0: 350, w: 580, y0: 90 });
    },
  };

  /* ================= 河边散步（黄昏） ================= */
  function willow(ctx, x, y, s, lt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    shape(ctx, SK.poly([[-10, 0], [-6, -150], [8, -150], [12, 0]], true, 10), { fill: '#8a6248', lw: 2.4 });
    shape(ctx, SK.ell(0, -170, 90, 52), { fill: '#86b874', shade: '#5f9356' });
    for (let i = 0; i < 12; i++) {
      const xx = -80 + i * 14.5;
      const sw = Math.sin(lt * 1.2 + i * 0.6) * 6;
      SK.curve(ctx, xx, -150, xx + sw * 0.5, -100, xx + sw, -40 - (i % 3) * 14, { lw: 3, line: '#6fa35e' });
    }
    ctx.restore();
  }
  function streetLamp(ctx, x, y, on) {
    line(ctx, [[x, y], [x, y - 190]], { lw: 5, line: '#4a3a4a' });
    line(ctx, [[x, y - 190], [x + 30, y - 200]], { lw: 4, line: '#4a3a4a' });
    SK.glow(ctx, x + 34, y - 190, 90, '#ffe4a0', 0.55 * on);
    shape(ctx, SK.rrect(x + 22, y - 200, 24, 22, 8), { fill: SK.mix('#d8cfc0', '#ffe9a0', on), lw: 2.2 });
  }
  SH.riverWorld = function (ctx, lt, camX, walk = true) {
    // 天空（不随镜头移动）
    SK.vgrad(ctx, [[0, '#f4a9a0'], [0.55, '#ffd2a8'], [1, '#ffe9c4']], -20, 360);
    P.sun(ctx, 860, 312, 54, '#ffcf6a');
    P.cloud(ctx, 220 - camX * 0.05, 90, 1.0, '#ffe3d6', { line: '#c98a7a' });
    P.cloud(ctx, 760 - camX * 0.05, 140, 0.7, '#ffe3d6', { line: '#c98a7a' });
    // 远岸
    ctx.save();
    ctx.translate(-camX * 0.3, 0);
    for (let i = -2; i < 12; i++) {
      const x = i * 180, h = 30 + SK.hash(i * 3) * 50;
      shape(ctx, SK.rect(x, 330 - h, 120, h + 20), { fill: '#b88fae', lw: 2, line: '#7d5a7a', seed: 700 + i });
      for (let k = 0; k < 3; k++) dot(ctx, x + 20 + k * 30, 330 - h + 14, 3, '#ffe9a0');
    }
    ctx.restore();
    // 河水
    SK.vgrad(ctx, [[0, '#f2b4a6'], [0.5, '#d6a8c2'], [1, '#9fb6dc']], 340, 540);
    line(ctx, [[-20, 342], [SK.W + 20, 342]], { lw: 2.4 });
    for (let i = 0; i < 9; i++) {
      const yy = 360 + i * 20;
      const w = 30 + i * 6;
      const sh = Math.sin(lt * 3 + i) * 8;
      line(ctx, [[860 - w + sh, yy], [860 + w + sh, yy]], { lw: 3, line: 'rgba(255,230,150,0.85)' });
    }
    for (let i = 0; i < 14; i++) {
      const x = ((i * 170 - camX * 0.6 - lt * 20) % 1500 + 1500) % 1500 - 100;
      line(ctx, [[x, 380 + (i % 5) * 30], [x + 60, 380 + (i % 5) * 30]], { lw: 2, line: 'rgba(255,255,255,0.6)' });
    }
    // 近岸
    ctx.save();
    ctx.translate(-camX, 0);
    const x0 = camX - 200, x1 = camX + SK.W + 200;
    shape(ctx, SK.rect(x0, 530, x1 - x0, 40), { fill: '#a3c97a', lw: 2.6, seed: 720 });
    shape(ctx, SK.rect(x0, 566, x1 - x0, 300), { fill: '#efd7b8', lw: 2.6, seed: 721 });
    // 栏杆
    for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) line(ctx, [[x, 548], [x, 500]], { lw: 3.2, line: '#8a6248', seed: 730 + (x / 70) % 40 });
    line(ctx, [[x0, 506], [x1, 506]], { lw: 3.2, line: '#8a6248', seed: 790 });
    line(ctx, [[x0, 528], [x1, 528]], { lw: 3.2, line: '#8a6248', seed: 791 });
    for (let k = Math.floor(x0 / 640); k * 640 < x1; k++) {
      willow(ctx, k * 640 + 120, 560, 1.1, lt);
      streetLamp(ctx, k * 640 + 420, 580, 0.7 + 0.3 * Math.sin(lt * 2 + k));
    }
    ctx.restore();
  };
  function riverCharX(lt) {
    return 300 + lt * 40;
  }
  function riverCouple(ctx, lt, camX, walkPhase) {
    const x = riverCharX(lt) - camX;
    const s = 1.25;
    F(ctx, x, 670, s, { t: lt, walk: walkPhase, arms: { l: 'down', r: [76, -32] }, face: 'happy', look: [1, 0], blush: 0.8 });
    G(ctx, x + 190, 670, s, { t: lt, walk: walkPhase + Math.PI, arms: { l: [-76, -32], r: 'down' }, face: 'happy', look: [-1, 0], blush: 0.8 });
  }
  S.river = {
    tout: ['cut', 0],
    draw(ctx, lt) {
      const camX = riverCharX(lt) - 545;
      SH.riverWorld(ctx, lt, camX);
      riverCouple(ctx, lt, camX, lt * 6);
      if (lt > 4) P.floatHearts(ctx, lt, 640, 470, { n: 5, spread: 120, rise: 110, size: 8, alpha: SK.prog(lt, 4, 5) });
      // 萤火
      for (let i = 0; i < 12; i++) {
        const x = (SK.hash(i * 2.3) * SK.W + Math.sin(lt * 0.8 + i) * 40) % SK.W;
        const y = 420 + SK.hash(i * 4.1) * 220 + Math.sin(lt * 1.3 + i * 2) * 20;
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(lt * 3 + i);
        SK.glow(ctx, x, y, 14, '#fff2a0', 0.9);
        ctx.restore();
      }
    },
  };

  /* ================= 镜头下潜：地下 ================= */
  const SOIL = [
    [720, '#9a6a45'],
    [980, '#87593b'],
    [1300, '#734a33'],
    [1650, '#5f3c2b'],
    [2000, '#4a2e25'],
    [2350, '#38221f'],
  ];
  function underground(ctx, camY) {
    // camY：世界坐标中画面顶端
    const top = camY - 20, bot = camY + SK.H + 20;
    SOIL.forEach(([y, c], i) => {
      const y1 = i + 1 < SOIL.length ? SOIL[i + 1][0] : 3400;
      if (y1 < top || y > bot) return;
      const pts = [];
      for (let x = -40; x <= SK.W + 40; x += 40) pts.push([x, y + Math.sin(x * 0.01 + i) * 14]);
      pts.push([SK.W + 40, y1 + 20], [-40, y1 + 20]);
      shape(ctx, pts, { fill: c, lw: 2.6, tex: 0.3, seed: 800 + i });
    });
    // 石子
    for (let i = 0; i < 70; i++) {
      const x = SK.hash(i * 1.7) * SK.W, y = 760 + SK.hash(i * 2.9) * 1900;
      if (y < top - 30 || y > bot + 30) continue;
      shape(ctx, SK.ell(x, y, 8 + SK.hash(i) * 14, 6 + SK.hash(i * 5) * 8, SK.hash(i * 7)), { fill: SK.mix('#b8a090', '#6a5446', SK.hash(i * 3)), lw: 2, seed: 900 + i });
    }
    // 根须
    for (let i = 0; i < 8; i++) {
      const x = 80 + i * 160;
      if (top > 1200) break;
      const pts = [];
      for (let k = 0; k <= 12; k++) pts.push([x + Math.sin(k * 0.8 + i) * 20, 730 + k * 30 * (0.6 + SK.hash(i) * 0.6)]);
      line(ctx, pts, { lw: 3, line: '#c9a27a', seed: 1000 + i });
    }
    // 小蚯蚓
    if (top < 1300 && bot > 1000) {
      const pts = [];
      for (let k = 0; k <= 10; k++) pts.push([820 + k * 9, 1120 + Math.sin(k * 0.9 + SK.t * 4) * 7]);
      line(ctx, pts, { lw: 14, line: '#f3a3b5', seed: 1100 });
      dot(ctx, 912, 1118, 2.4);
    }
    // 鱼化石
    if (top < 1700 && bot > 1400) {
      line(ctx, [[260, 1540], [380, 1540]], { lw: 3, line: '#d8c8b0' });
      for (let k = 0; k < 6; k++) line(ctx, [[280 + k * 16, 1520], [280 + k * 16, 1560]], { lw: 2.4, line: '#d8c8b0' });
      shape(ctx, SK.poly([[380, 1540], [410, 1520], [410, 1560]]), { fill: null, line: '#d8c8b0', lw: 3 });
      shape(ctx, SK.circ(250, 1540, 14), { fill: null, line: '#d8c8b0', lw: 3 });
    }
    // 水晶
    if (top < 2100 && bot > 1800) {
      [[1000, 1940, '#c7b3ff'], [1040, 1960, '#a9d9f2'], [960, 1964, '#ffb3c6']].forEach(([x, y, c], i) => shape(ctx, SK.poly([[x - 14, y], [x - 8, y - 46 - i * 8], [x + 8, y - 52 - i * 6], [x + 14, y]]), { fill: c, lw: 2.2, seed: 1200 + i }));
    }
    // 洞穴：红色的光
    if (bot > 2400) {
      shape(ctx, SK.spline([[200, 2620], [320, 2470], [640, 2420], [960, 2470], [1080, 2620], [960, 2800], [640, 2860], [320, 2800]]), { fill: CAVE, lw: 3, seed: 1300 });
      SK.glow(ctx, 640, 2630, 320, '#ff5c70', 0.55);
    }
  }
  S.dive = {
    tin: ['cut', 0],
    tout: [CAVE, 0.45],
    draw(ctx, lt, dur) {
      const k = SK.prog(lt, 0.3, dur);
      const camY = SK.easeIn(k) * 2270;
      const riverLt = 9.6;
      const camX = riverCharX(riverLt) - 545;
      ctx.save();
      ctx.translate(0, -camY);
      if (camY < SK.H + 40) {
        SH.riverWorld(ctx, riverLt + lt, camX);
        riverCouple(ctx, riverLt + lt * 0.4, camX + lt * 16, (riverLt + lt) * 6);
      }
      underground(ctx, camY);
      ctx.restore();
      const speed = k > 0.15 && k < 0.95 ? 1 : 0;
      if (speed) P.speedLines(ctx, lt, { vertical: true, n: 20, alpha: 0.35, color: '#ffe9d0' });
    },
  };

  /* ================= 地下：被一次次修补的爱心 ================= */
  const CRACKS = [
    [[-0.92, -0.42], [-0.75, -0.3], [-0.7, -0.18], [-0.55, -0.12], [-0.48, 0.0], [-0.36, 0.04]],
    [[0.98, -0.05], [0.82, 0.0], [0.75, 0.12], [0.6, 0.14], [0.52, 0.26], [0.4, 0.3]],
    [[0.0, -0.33], [0.08, -0.15], [-0.05, 0.05], [0.07, 0.25], [-0.04, 0.45], [0.06, 0.68], [0.0, 1.08]],
    [[-0.66, 0.42], [-0.52, 0.4], [-0.46, 0.5], [-0.32, 0.5], [-0.22, 0.6]],
  ];
  // [出现时间索引, 中心 x, y, 角度, 长度] —— 单位为爱心尺寸
  const TAPES = [
    [0, -0.6, -0.18, 0.95, 0.62],
    [1, 0.7, 0.12, 0.6, 0.56],
    [2, 0.68, 0.14, -0.75, 0.56],
    [3, 0.02, -0.08, 0.06, 0.9],
    [4, 0.0, 0.3, -0.08, 1.0],
    [5, 0.02, 0.66, 0.1, 0.66],
    [6, -0.42, 0.5, -0.5, 0.5],
  ];
  const TAPED = [0, 1, 5, 6]; // 每道裂痕在第几条胶带贴上后被修好
  function heartPath(ctx, size) {
    const pts = SK.heartPts(0, 0, size, 80);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }
  S.heart = {
    tin: [CAVE, 0.6],
    tout: [CAVE, 0.45],
    draw(ctx, lt) {
      const C = TL.cue.heart;
      const SZ = 160;
      const done = SK.smooth(SK.prog(lt, C.wrap[1] - 1.0, C.wrap[1] + 0.4));
      // 背景：洞穴
      const bgc = SK.mix('#3d2029', '#2a3550', done * 0.7);
      const g = ctx.createRadialGradient(640, 360, 60, 640, 360, 760);
      g.addColorStop(0, bgc);
      g.addColorStop(1, CAVE);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, SK.W, SK.H);
      const vg = ctx.createRadialGradient(640, 360, 280, 640, 360, 760);
      vg.addColorStop(0, 'rgba(10,5,8,0)');
      vg.addColorStop(1, 'rgba(10,5,8,0.75)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, SK.W, SK.H);
      for (let i = 0; i < 26; i++) {
        const x = SK.hash(i * 1.9) * SK.W + Math.sin(lt * 0.4 + i) * 20;
        const y = ((SK.hash(i * 3.3) * SK.H - lt * 10 * (0.5 + SK.hash(i))) % SK.H + SK.H) % SK.H;
        ctx.save();
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(lt * 2 + i);
        dot(ctx, x, y, 2, done > 0.5 ? '#cfefff' : '#ffb0a0');
        ctx.restore();
      }
      // 心跳
      const period = TL.BEAT * 2;
      const ph = (lt % period) / period;
      const pulse = Math.exp(-Math.pow((ph - 0.02) / 0.05, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.2) / 0.05, 2));
      let sc = 1 + 0.035 * pulse * (1 + done);
      let shakeAmt = 0;
      let dim = 0;
      C.cracks.forEach((tc, i) => {
        if (lt > tc && lt < tc + 0.45) {
          const k = (lt - tc) / 0.45;
          sc *= 1 - 0.07 * (1 - k);
          shakeAmt = Math.max(shakeAmt, 8 * (1 - k));
        }
        const fixT = C.tapes[TAPED[i]];
        if (lt > tc && lt < fixT + 0.3) dim += 0.22;
      });
      dim = Math.min(0.5, dim);
      const red = SK.mix('#e8505f', '#7a2d3a', dim);
      const glowC = SK.mix(SK.mix('#ff6070', '#7a2d3a', dim), '#9fdcff', done);
      SK.glow(ctx, 640, 360, 330 + pulse * 30, glowC, 0.45 + 0.15 * pulse);
      ctx.save();
      ctx.translate(640, 330);
      if (shakeAmt) SK.shake(ctx, lt, shakeAmt);
      ctx.scale(sc, sc);
      // 第三道裂痕：爱心几乎裂成两半
      const c3 = C.cracks[2];
      const sep = 16 * SK.easeOut(SK.prog(lt, c3, c3 + 0.3)) * (1 - SK.easeInOut(SK.prog(lt, C.tapes[3] - 0.1, C.tapes[5] + 0.2)));
      const body = (dx) => {
        ctx.save();
        ctx.translate(dx, 0);
        shape(ctx, SK.heartPts(0, 0, SZ, 80), { fill: red, shade: SK.mix(red, '#3a0a14', 0.3), shadeDist: 16, lw: 4, seed: 1500 });
        curve(ctx, -SZ * 0.62, -SZ * 0.38, -SZ * 0.58, -SZ * 0.72, -SZ * 0.22, -SZ * 0.66, { lw: 6, line: 'rgba(255,255,255,0.75)', seed: 1501 });
        ctx.restore();
      };
      if (sep > 0.2) {
        const cr = CRACKS[2].map(([x, y]) => [x * SZ, y * SZ]);
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cr[0][0], -SZ * 2);
          cr.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.lineTo(cr[cr.length - 1][0], SZ * 2);
          ctx.lineTo(side * SZ * 3, SZ * 2);
          ctx.lineTo(side * SZ * 3, -SZ * 2);
          ctx.closePath();
          ctx.clip();
          body(side * sep);
          ctx.restore();
        }
      } else body(0);
      // 裂痕
      C.cracks.forEach((tc, i) => {
        if (lt < tc) return;
        const k = SK.prog(lt, tc, tc + 0.18);
        const pts = CRACKS[i].map(([x, y]) => [x * SZ, y * SZ]);
        const n = Math.max(2, Math.ceil(k * pts.length));
        const shown = pts.slice(0, n);
        if (i === 2 && sep > 0.2) return;
        line(ctx, shown, { lw: 5, line: '#3a0d16', seed: 1600 + i });
        line(ctx, shown.map(([x, y]) => [x + 2, y + 2]), { lw: 1.6, line: 'rgba(255,200,200,0.6)', seed: 1610 + i });
      });
      if (sep > 0.2) {
        // 裂缝中间的黑暗
        const cr = CRACKS[2].map(([x, y]) => [x * SZ, y * SZ]);
        line(ctx, cr, { lw: 3, line: '#3a0d16', seed: 1620 });
      }
      // 淡蓝色胶带
      TAPES.forEach(([ti, x, y, ang, len], i) => {
        const t0 = C.tapes[ti];
        if (lt < t0) return;
        const k = SK.prog(lt, t0, t0 + 0.32);
        const e = SK.easeOut(k);
        const from = [x * SZ + (i % 2 ? 1 : -1) * 260, y * SZ - 300];
        const px = SK.lerp(from[0], x * SZ, e), py = SK.lerp(from[1], y * SZ, e);
        const rot = ang + (1 - e) * 1.4 * (i % 2 ? -1 : 1);
        const sc2 = k < 1 ? 1 + (1 - SK.backOut(k)) * 0.4 : 1;
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(sc2, sc2);
        P.tape(ctx, 0, 0, len * SZ, SZ * 0.24, rot, P.COL.tape, { opacity: 0.9 });
        ctx.restore();
        if (k >= 1 && lt < t0 + 0.6) P.burst(ctx, lt, t0 + 0.32, x * SZ, y * SZ, { kind: 'star', n: 6, speed: 60, size: 7, life: 0.4, colors: ['#e6f6ff', '#ffffff'] });
      });
      // 一圈圈缠绕的胶带
      const [w0, w1] = C.wrap;
      const N = 30;
      if (lt > w0) {
        ctx.save();
        heartPath(ctx, SZ * 1.03);
        ctx.clip();
        for (let i = 0; i < N; i++) {
          const ts = w0 + (i * (w1 - w0 - 0.7)) / N;
          if (lt < ts) break;
          const gk = SK.easeOut(SK.prog(lt, ts, ts + 0.45));
          const ang = -1.0 + SK.hash(i * 3.7) * 2.0 + (i % 2 ? 0.25 : -0.25);
          const off = (((i * 0.382) % 1) * 2 - 1) * SZ * 1.05;
          const L = SZ * 3, W = SZ * 0.34;
          ctx.save();
          ctx.rotate(ang);
          ctx.translate(0, off);
          const x0 = -L / 2;
          const len = L * gk;
          ctx.fillStyle = SK.rgba(i % 3 === 0 ? '#bfe5f7' : P.COL.tape, 0.86);
          ctx.fillRect(x0, -W / 2, len, W);
          ctx.fillStyle = 'rgba(124,191,227,0.55)';
          ctx.fillRect(x0, -W / 2, len, 2.2);
          ctx.fillRect(x0, W / 2 - 2.2, len, 2.2);
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.fillRect(x0, -W / 2 + 6, len, 3);
          ctx.restore();
        }
        if (done > 0) {
          ctx.globalAlpha = done * 0.75;
          ctx.fillStyle = '#ace0f6';
          ctx.fillRect(-SZ * 2, -SZ * 2, SZ * 4, SZ * 4);
          ctx.globalAlpha = done * 0.5;
          for (let i = 0; i < 9; i++) {
            ctx.save();
            ctx.rotate(-0.8 + SK.hash(i * 5.1) * 1.6);
            ctx.fillStyle = 'rgba(124,191,227,0.5)';
            ctx.fillRect(-SZ * 2, (i - 4) * SZ * 0.24, SZ * 4, 2);
            ctx.restore();
          }
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }
      // 外轮廓 + 高光
      shape(ctx, SK.heartPts(0, 0, SZ * (1 + 0.01), 80), { fill: null, lw: 4.4, seed: 1700 });
      if (done > 0) {
        ctx.save();
        ctx.globalAlpha = done;
        curve(ctx, -SZ * 0.62, -SZ * 0.38, -SZ * 0.58, -SZ * 0.72, -SZ * 0.22, -SZ * 0.66, { lw: 7, line: 'rgba(255,255,255,0.9)', seed: 1702 });
        ctx.restore();
      }
      ctx.restore();
      // 碎片
      C.cracks.forEach((tc, i) => {
        const k = SK.prog(lt, tc, tc + 1.2);
        if (k <= 0 || k >= 1) return;
        const p0 = CRACKS[i][0];
        for (let q = 0; q < 3; q++) {
          const dir = (p0[0] >= 0 ? 1 : -1) * (0.6 + q * 0.3);
          const x = 640 + p0[0] * SZ + dir * 180 * k;
          const y = 330 + p0[1] * SZ - 120 * k + 420 * k * k;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(k * 8 + q);
          ctx.globalAlpha = 1 - k;
          shape(ctx, SK.poly([[-8, -6], [9, -3], [0, 9]]), { fill: red, lw: 2, tex: 0 });
          ctx.restore();
        }
      });
      // 修好之后：闪闪发光
      if (done > 0) {
        ctx.save();
        ctx.globalAlpha = done;
        P.twinkles(ctx, lt, { x: 300, y: 80, w: 680, h: 520, n: 22, r: 9, color: '#e6f6ff', line: false });
        ctx.restore();
        P.burst(ctx, lt, C.wrap[1], 640, 330, { kind: 'star', n: 20, speed: 320, size: 12, life: 1.6, colors: ['#e6f6ff', '#bfe5f7', '#ffffff'] });
      }
    },
  };

  /* ================= 镜头回到地面 → 日期回到 10/20 ================= */
  const FLIP_DATES = ['11/02', '12/25', '1/1', '2/14', '3/14', '5/20', '6/01', '7/4', '8/15', '9/10', '10/01', '10/18', '10/19', '10/20'];
  S.rise = {
    tin: [CAVE, 0.4],
    draw(ctx, lt) {
      const C = TL.cue.rise;
      if (lt < C.flips[0]) {
        const k = SK.easeInOut(SK.prog(lt, 0, C.flips[0] - 0.1));
        const camY = SK.lerp(2270, -200, k);
        ctx.save();
        ctx.translate(0, -camY);
        SK.vgrad(ctx, [[0, '#cfe6f7'], [1, '#ffe6cc']], -400, 720);
        shape(ctx, SK.rect(-40, 690, SK.W + 80, 60), { fill: '#a8d27a', lw: 2.6, seed: 1800 });
        underground(ctx, camY);
        ctx.restore();
        if (k > 0.05 && k < 0.95) P.speedLines(ctx, lt, { vertical: true, n: 20, alpha: 0.35, color: '#ffe9d0' });
        // 到达地面时闪白
        ctx.save();
        ctx.globalAlpha = SK.prog(lt, C.flips[0] - 0.4, C.flips[0]);
        ctx.fillStyle = '#fdf1e2';
        ctx.fillRect(0, 0, SK.W, SK.H);
        ctx.restore();
        return;
      }
      SK.bg(ctx, '#fdf1e2');
      for (let i = 0; i < 18; i++) P.heart(ctx, SK.hash(i * 2.1) * SK.W, SK.hash(i * 3.7) * SK.H, 8, i % 2 ? '#bfe5f7' : '#ffd0db', { alpha: 0.7, shine: false });
      const k = SK.easeOut(SK.prog(lt, C.flips[0], C.flips[1]));
      const n = FLIP_DATES.length;
      const idx = Math.min(n - 1, Math.floor(k * (n - 1) + 0.0001));
      const frac = k * (n - 1) - idx;
      const landed = lt >= C.land;
      const pk = landed ? SK.pop(lt, C.land, 0.5) : 1;
      ctx.save();
      ctx.translate(640, 360);
      ctx.scale(1 + (landed ? (1 - pk) * -0.2 + 0.0 : 0), 1 + (landed ? (1 - pk) * -0.2 : 0));
      P.calendar(ctx, 0, 0, 1.25, { month: landed ? '十月' : '', day: landed ? '10/20' : FLIP_DATES[Math.min(n - 1, idx + 1)], daySize: 70, top: '#f07a8a' });
      ctx.restore();
      if (!landed && idx < n - 1) {
        const e = SK.easeIn(frac);
        ctx.save();
        ctx.translate(640 + e * 120, 360 - e * 380);
        ctx.rotate(e * 0.9);
        ctx.globalAlpha = 1 - e * 0.6;
        P.calendar(ctx, 0, 0, 1.25, { month: '', day: FLIP_DATES[idx], daySize: 70, top: '#f07a8a' });
        ctx.restore();
      }
      if (landed) {
        P.burst(ctx, lt, C.land, 640, 380, { kind: 'heart', n: 16, speed: 260, size: 12, colors: ['#ef5a6f', '#a9d9f2', '#ffb3c6'] });
        P.floatHearts(ctx, lt - C.land, 640, 220, { n: 6, spread: 300, rise: 120, size: 10, color: '#a9d9f2' });
      }
    },
  };

  /* ================= 分叉的路：始终一起向前 ================= */
  const HZ = 300, FOC = 400, CAMH = 0.65;
  function proj(x, z, camZ) {
    const dz = z - camZ;
    return [640 + (x * FOC) / dz, HZ + (CAMH * FOC) / dz, FOC / dz];
  }
  const BRANCHES = [];
  for (let k = 0; k < 14; k++) {
    const z0 = 3.2 + k * 1.9;
    const sides = k % 3 === 2 ? [-1, 1] : [k % 2 ? 1 : -1];
    sides.forEach((side) => BRANCHES.push({ z0, side, len: 3.4 + SK.hash(k) * 1.2, sub: SK.hash(k * 3.1) > 0.35 }));
  }
  const ROADW = 0.62;
  function roadStrip(ctx, centerFn, widthFn, u0, u1, camZ, color, lw) {
    const L = [], R = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const u = u0 + ((u1 - u0) * i) / n;
      const [x, z] = centerFn(u);
      if (z - camZ < 0.35) continue;
      const w = widthFn(u);
      L.push(proj(x - w, z, camZ));
      R.push(proj(x + w, z, camZ));
    }
    if (L.length < 2) return;
    const pts = L.map((p) => [p[0], p[1]]).concat(R.reverse().map((p) => [p[0], p[1]]));
    shape(ctx, pts, { fill: color, lw: lw || 2.4, tex: 0.25 });
  }
  function drawRoad(ctx, camZ) {
    const col = '#f3dfbf';
    BRANCHES.forEach((b, bi) => {
      if (b.z0 + b.len < camZ + 0.3 || b.z0 > camZ + 13) return;
      ctx.save();
      ctx.globalAlpha = 1 - SK.smooth(SK.prog(b.z0 - camZ, 8, 13));
      const cf = (u) => [b.side * (ROADW * 0.6 + u * 1.6 + u * u * 1.4), b.z0 + u * b.len];
      roadStrip(ctx, cf, (u) => 0.32 * (1 - u * 0.55), 0, 1, camZ, col, 2.2);
      if (b.sub) {
        const [mx, mz] = cf(0.45);
        const sf = (v) => [mx + b.side * (v * 1.2 - v * v * 0.6), mz + v * 2.6];
        roadStrip(ctx, sf, (v) => 0.18 * (1 - v * 0.5), 0, 1, camZ, col, 2);
        const sf2 = (v) => [mx + b.side * (v * 2.6 + v * v), mz + v * 1.2];
        roadStrip(ctx, sf2, (v) => 0.16 * (1 - v * 0.5), 0, 1, camZ, col, 2);
      }
      ctx.restore();
    });
    roadStrip(ctx, (u) => [0, camZ + 0.36 + u * u * 80], () => ROADW, 0, 1, camZ, col, 2.8);
    // 路中间的小石子
    for (let i = 0; i < 40; i++) {
      const z = Math.floor(camZ) + i * 0.7 + SK.hash(i) * 0.5;
      const x = (SK.hash(i * 3.3) - 0.5) * ROADW * 1.6;
      if (z - camZ < 0.5) continue;
      const [sx, sy, s] = proj(x, z, camZ);
      dot(ctx, sx, sy, Math.max(0.8, s * 0.006), 'rgba(170,130,90,0.6)');
    }
  }
  S.road = {
    tin: ['paper', 0.6],
    tout: ['paper', 0.9],
    draw(ctx, lt, dur) {
      const stop = 11;
      const camZ = Math.min(lt, stop) * 0.5;
      const charZ = camZ + 1.0 + Math.max(0, lt - stop) * 0.62;
      // 天空：黎明
      SK.vgrad(ctx, [[0, '#bcd9f2'], [0.6, '#ffe2c8'], [1, '#ffd2b4']], 0, HZ + 4);
      const sunY = SK.lerp(318, 230, SK.prog(lt, 0, dur));
      P.sun(ctx, 640, sunY, 46, '#ffd77a');
      [[200, 110, 1.0], [1000, 80, 0.9], [760, 170, 0.6]].forEach(([x, y, s], i) => P.cloud(ctx, x + lt * (6 + i * 3), y, s, '#fff8f2', { line: '#d6b0a0' }));
      // 天上慢慢出现的爱心
      const hk = SK.smooth(SK.prog(lt, 12, 15.5));
      if (hk > 0) {
        ctx.save();
        ctx.globalAlpha = hk;
        SK.glow(ctx, 640, 170, 240, '#ffb8cb', 0.55);
        shape(ctx, SK.heartPts(640, 160, 100 + hk * 10, 60), { fill: 'rgba(255,190,210,0.35)', line: 'rgba(239,90,111,0.55)', lw: 3, tex: 0 });
        const pts = SK.heartPts(640, 160, 100 + hk * 10, 26);
        pts.forEach(([x, y], i) => P.sparkle(ctx, x, y, 6 + 3 * Math.sin(lt * 3 + i), i % 2 ? '#ffffff' : '#ffe08a', { line: false }));
        ctx.restore();
      }
      // 远山
      shape(ctx, SK.spline([[-40, HZ + 2], [120, HZ - 40], [300, HZ - 20], [460, HZ - 46], [560, HZ - 14], [720, HZ - 14], [860, HZ - 50], [1040, HZ - 24], [1320, HZ - 44], [1320, HZ + 10], [-40, HZ + 10]], true, 10), { fill: '#c7d8e8', lw: 2, line: '#9fb3c8', seed: 1900 });
      // 地面
      SK.vgrad(ctx, [[0, '#cfe3a2'], [1, '#93c46c']], HZ, SK.H + 20);
      line(ctx, [[-20, HZ], [SK.W + 20, HZ]], { lw: 2, seed: 1901 });
      drawRoad(ctx, camZ);
      // 花 & 树（远→近）
      const items = [];
      for (let i = 0; i < 160; i++) {
        const z = Math.floor(camZ / 6) * 6 + (i % 80) * 0.3 + SK.hash(i * 1.7) * 0.3 + (i >= 80 ? 0 : 0);
        const side = SK.hash(i * 2.3) > 0.5 ? 1 : -1;
        const x = side * (0.9 + SK.hash(i * 5.1) * 5);
        items.push({ x, z, kind: 'flower', i });
      }
      for (let i = 0; i < 30; i++) {
        const z = Math.floor(camZ / 3) * 3 + i * 1.3 + 0.6;
        const side = i % 2 ? 1 : -1;
        items.push({ x: side * (2.6 + SK.hash(i * 7.3) * 3.5), z, kind: 'tree', i });
      }
      items.sort((a, b) => b.z - a.z);
      const near = [];
      items.forEach((it) => {
        const dz = it.z - camZ;
        if (dz < 0.4 || dz > 40) return;
        if (it.z < charZ) {
          near.push(it);
          return;
        }
        drawItem(ctx, it, camZ);
      });
      // 两个人：背影，手牵手
      const [cx, cy, cs] = proj(0, charZ, camZ);
      const s = cs * 0.0031;
      const off = 95 * s;
      const ph = lt * 7;
      F(ctx, cx - off, cy, s, { t: lt, back: true, walk: ph, backArm: { l: [-60, -24], r: [76, -30] } });
      G(ctx, cx + off, cy, s, { t: lt, back: true, walk: ph + Math.PI, backArm: { l: [-76, -30], r: [60, -24] } });
      // 每走过一个岔路口，冒出一颗小爱心
      BRANCHES.forEach((b, bi) => {
        if (bi > 0 && BRANCHES[bi - 1].z0 === b.z0) return;
        const tPass = b.z0 - 1.0 < 5.5 ? (b.z0 - 1.0) / 0.5 : null;
        if (tPass == null || tPass > stop) return;
        const k = SK.prog(lt, tPass, tPass + 1.4);
        if (k <= 0 || k >= 1) return;
        ctx.save();
        ctx.globalAlpha = Math.sin(k * Math.PI);
        P.heart(ctx, cx, cy - 170 * s - k * 70, 14 * s + 4, '#ef5a6f');
        ctx.restore();
      });
      near.forEach((it) => drawItem(ctx, it, camZ));
      // 飘落的花瓣
      for (let i = 0; i < 16; i++) {
        const y = ((lt * (30 + SK.hash(i) * 30) + SK.hash(i * 3) * 760) % 760) - 20;
        const x = SK.hash(i * 7) * SK.W + Math.sin(lt + i) * 30;
        shape(ctx, SK.ell(x, y, 5, 3, lt * 2 + i), { fill: i % 2 ? '#ffc4d4' : '#ffffff', lw: 1.2, tex: 0 });
      }
    },
  };
  function drawItem(ctx, it, camZ) {
    const [x, y, s] = proj(it.x, it.z, camZ);
    if (x < -200 || x > SK.W + 200) return;
    if (it.kind === 'tree') {
      const sc = s * 0.0042;
      if (sc < 0.06) return;
      P.tree(ctx, x, y, sc, { canopy: it.i % 3 ? '#9fd07a' : '#ffc4d4', blobs: [[-30, -96, 40], [28, -100, 40], [0, -128, 44], [0, -92, 46]] });
    } else {
      const sc = s * 0.0035;
      if (sc < 0.12) {
        dot(ctx, x, y, Math.max(1, sc * 6), ['#ffb3c6', '#ffffff', '#ffd35c'][it.i % 3]);
        return;
      }
      P.flower(ctx, x, y, sc * 1.4, ['#ffb3c6', '#ffffff', '#ffd35c', '#c7b3ff'][it.i % 4]);
    }
  }

  /* ================= 结尾 ================= */
  S.end = {
    tin: ['paper', 0.9],
    draw(ctx, lt, dur) {
      SK.bg(ctx, '#fdf4e6');
      for (let i = 0; i < 24; i++) {
        const x = SK.hash(i * 2.1) * SK.W, y = SK.hash(i * 3.7) * SK.H;
        if (x > 300 && x < 980 && y > 120 && y < 500) continue;
        P.heart(ctx, x, y + Math.sin(lt + i) * 4, 8, i % 2 ? '#bfe5f7' : '#ffd0db', { alpha: 0.7, shine: false });
      }
      // 淡蓝色的爱心
      const period = TL.BEAT * 2;
      const ph = (lt % period) / period;
      const pulse = Math.exp(-Math.pow((ph - 0.02) / 0.05, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.2) / 0.05, 2));
      const hk = SK.pop(lt, 0.4, 0.6);
      SK.glow(ctx, 640, 170, 140, '#bfe5f7', 0.6 * hk);
      P.heart(ctx, 640, 170 + Math.sin(lt * 1.5) * 6, 56 * hk * (1 + pulse * 0.05), '#a9d9f2');
      // 文字
      const tk = SK.pop(lt, 1.2, 0.5);
      if (tk > 0) {
        ctx.save();
        ctx.translate(640, 318);
        ctx.scale(tk, tk);
        text(ctx, '未完待续 …', 0, 0, { size: 70, color: '#ef7a8f', outline: SK.INK, outlineW: 8, seed: 9 });
        ctx.restore();
      }
      const ek = SK.pop(lt, 1.8, 0.5);
      if (ek > 0) {
        ctx.save();
        ctx.translate(640, 398);
        ctx.scale(ek, ek);
        text(ctx, 'Froggy  &  Piggy', 0, 0, { size: 38, font: SK.FONT_EN, weight: 'bold', color: '#8a6a58', seed: 2 });
        ctx.restore();
      }
      // 小草坡上的两个人
      shape(ctx, SK.ell(640, 760, 380, 120), { fill: '#bfe3a0', lw: 2.6 });
      for (let i = 0; i < 7; i++) P.flower(ctx, 340 + i * 100, 668 + (i % 2) * 16, 1, i % 2 ? '#ffb3c6' : '#fff');
      F(ctx, 562, 668, 1.15, { t: lt, face: 'happy', arms: { l: 'down', r: [72, -22] }, blush: 0.8, tilt: 0.05 });
      G(ctx, 728, 668, 1.15, { t: lt, face: 'happy', arms: { l: [-72, -22], r: 'down' }, blush: 0.8, tilt: -0.04 });
      P.floatHearts(ctx, lt, 647, 520, { n: 5, spread: 60, rise: 110, size: 8 });
      // 片尾淡出
      const fade = SK.prog(lt, dur - 0.2, dur + 1.6);
      if (fade > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#fdf4e6';
        ctx.fillRect(0, 0, SK.W, SK.H);
        ctx.restore();
      }
    },
  };
})();
