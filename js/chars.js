/* 角色：丑萌青蛙 & 长着透明小翅膀的丑萌小猪
 * 坐标原点在角色脚下中心，单位≈影片像素（缩放 s 后）。 */
(function () {
  const CH = (window.CH = {});
  const { shape, line, curve, dot } = SK;

  CH.FROG = {
    body: '#9ccc68',
    dark: '#74a84a',
    belly: '#e4f1b4',
    line: SK.INK,
  };
  CH.PIG = {
    body: '#f8bccb',
    dark: '#ec97ab',
    snout: '#f19bb0',
    nostril: '#7d3445',
    hoof: '#c9798c',
    wing: 'rgba(205,236,255,0.5)',
    wingLine: '#6fa9cc',
  };
  const BLUSH = 'rgba(255,120,145,0.55)';
  const MOUTH = '#83343a';
  const TONGUE = '#ff9aa8';

  /* 管状肢体：中心线 → 闭合轮廓 */
  function tube(pts, w) {
    const n = pts.length;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const d = Math.hypot(tx, ty) || 1;
      tx /= d;
      ty /= d;
      const hw = w / 2;
      L.push([pts[i][0] - ty * hw, pts[i][1] + tx * hw]);
      R.push([pts[i][0] + ty * hw, pts[i][1] - tx * hw]);
    }
    // 端头半圆
    const out = L.slice();
    const e = pts[n - 1], pe = pts[n - 2];
    const ae = Math.atan2(e[1] - pe[1], e[0] - pe[0]);
    for (let k = 1; k < 6; k++) {
      const a = ae + Math.PI / 2 - (k / 6) * Math.PI;
      out.push([e[0] + Math.cos(a) * w / 2, e[1] + Math.sin(a) * w / 2]);
    }
    for (let i = n - 1; i >= 0; i--) out.push(R[i]);
    return out;
  }
  function bend(x0, y0, x1, y1, bulge, n = 10) {
    // 二次曲线，向法线方向弯曲 bulge
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const dx = x1 - x0, dy = y1 - y0;
    const d = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / d) * bulge, cy = my + (dx / d) * bulge;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1]);
    }
    return pts;
  }
  CH.tube = tube;
  CH.bend = bend;

  function blinkAt(t, seed) {
    if (t == null) return false;
    const period = 3.3 + SK.hash(seed) * 1.4;
    const ph = (t + seed * 1.7) % period;
    return ph < 0.13;
  }

  function sweat(ctx, x, y, s = 1) {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const r = 1 - 0.5 * Math.max(0, -Math.sin(a));
      pts.push([x + Math.cos(a) * 5 * s * r, y + Math.sin(a) * 7 * s - (Math.sin(a) < 0 ? Math.abs(Math.cos(a)) * 0 : 0)]);
    }
    const drop = [[x, y - 9 * s]];
    for (let i = 0; i <= 12; i++) {
      const a = -0.25 + (i / 12) * (Math.PI + 0.5);
      drop.push([x + Math.cos(a) * 5 * s, y + Math.sin(a) * 5 * s]);
    }
    shape(ctx, drop, { fill: '#bfe6ff', lw: 2, tex: 0 });
  }
  CH.sweat = sweat;

  function heartEye(ctx, x, y, r) {
    shape(ctx, SK.heartPts(x, y + r * 0.1, r * 1.05), { fill: '#ff5d78', lw: 2.2, tex: 0.1 });
  }

  /* 眼睛（白眼球 + 瞳孔） */
  function eye(ctx, x, y, rw, rp, look, o, side) {
    const face = o.face;
    const closed = face === 'sleep' || face === 'happy' || o.blinking;
    if (face === 'love') {
      shape(ctx, SK.circ(x, y, rw), { fill: '#fff', lw: 2.4, tex: 0 });
      heartEye(ctx, x, y, rw * 0.78);
      return;
    }
    if (closed) {
      if (face === 'happy') curve(ctx, x - rw * 0.7, y + 3, x, y - rw * 0.8, x + rw * 0.7, y + 3, { lw: 3 });
      else curve(ctx, x - rw * 0.7, y - 1, x, y + rw * 0.6, x + rw * 0.7, y - 1, { lw: 3 });
      return;
    }
    const sc = face === 'o' || face === 'scared' ? 1.1 : 1;
    shape(ctx, SK.circ(x, y, rw * sc), { fill: '#fffdf6', lw: 2.4, tex: 0 });
    const lx = (look ? look[0] : 0) * (rw - rp - 2), ly = (look ? look[1] : 0) * (rw - rp - 2);
    const pr = face === 'o' || face === 'scared' ? rp * 0.7 : rp;
    dot(ctx, x + lx, y + ly, pr, SK.INK);
    dot(ctx, x + lx - pr * 0.35, y + ly - pr * 0.4, pr * 0.32, '#fff');
    if (face === 'cry' || o.tears) {
      SK.shape(ctx, SK.ell(x, y + rw * 0.9, rw * 0.9, rw * 0.35), { fill: 'rgba(160,215,255,0.8)', line: false, tex: 0 });
    }
  }

  /* =========================== 青蛙 =========================== */
  CH.frog = function (ctx, x, y, s = 1, o = {}) {
    const C = CH.FROG;
    const t = o.t == null ? SK.t : o.t;
    ctx.save();
    ctx.translate(x, y);
    if (o.shiver) ctx.translate((SK.noise(t * 47) - 0.5) * o.shiver * 2, (SK.noise(t * 51 + 9) - 0.5) * o.shiver);
    ctx.scale(s * (o.flip ? -1 : 1), s);
    let bob = 0, footL = 0, footR = 0, tilt = o.tilt || 0;
    if (o.walk != null) {
      const p = o.walk;
      bob = Math.abs(Math.sin(p)) * 5;
      footL = Math.max(0, Math.sin(p)) * 11;
      footR = Math.max(0, -Math.sin(p)) * 11;
      tilt += Math.sin(p) * 0.045;
    }
    if (o.hop) bob += o.hop;
    const sq = o.squash || 1;
    o.blinking = o.blink !== false && blinkAt(t, 1.3);

    // 脚（不随身体上下）
    const footPts = (sx, lift) => {
      const pts = [];
      const bx = sx * 46, by = -3 - lift;
      return { base: SK.ell(bx, by, 22, 8, sx * 0.08), toes: [[bx + sx * 20, by + 1], [bx + sx * 13, by + 6], [bx + sx * 3, by + 7]] };
    };
    const drawFoot = (sx, lift) => {
      const f = footPts(sx, lift);
      f.toes.forEach((p) => shape(ctx, SK.circ(p[0], p[1], 4.6), { fill: C.body, lw: 2.2 }));
      shape(ctx, f.base, { fill: C.body, lw: 2.6 });
    };
    drawFoot(-1, footL);
    drawFoot(1, footR);

    ctx.translate(0, -bob);
    ctx.rotate(tilt);
    ctx.scale(1 / Math.sqrt(sq), sq);

    // 大腿
    shape(ctx, SK.ell(-50, -20, 19, 17, -0.4), { fill: C.body, shade: C.dark, shadeDist: 5 });
    shape(ctx, SK.ell(50, -20, 19, 17, 0.4), { fill: C.body, shade: C.dark, shadeDist: 5 });

    // 身体
    const body = SK.spline([
      [0, -94], [26, -98], [48, -88], [60, -66], [64, -40], [60, -14], [42, -1], [0, 2], [-42, -1], [-60, -14], [-64, -40], [-60, -66], [-48, -88], [-26, -98],
    ]);
    // 眼睛凸起（先画以便身体线覆盖下半部分？——卡通里眼睛盖在头上）
    const eL = [-30, -100, 25], eR = [31, -98, 21];
    if (o.back) {
      shape(ctx, body, { fill: C.body, shade: C.dark, shadeDist: 10, shadeAng: -2.3 });
      shape(ctx, SK.circ(eL[0], eL[1] + 4, eL[2]), { fill: C.body });
      shape(ctx, SK.circ(eR[0], eR[1] + 4, eR[2]), { fill: C.body });
      [[-20, -70, 7], [24, -52, 6], [-36, -36, 5], [8, -30, 4], [36, -80, 4]].forEach(([a, b, r]) => shape(ctx, SK.circ(a, b, r), { fill: C.dark, line: false }));
      // 后视手臂
      const aL = o.backArm ? o.backArm.l : [-62, -26];
      const aR = o.backArm ? o.backArm.r : [62, -26];
      shape(ctx, tube(bend(-52, -48, aL[0], aL[1], 6), 12), { fill: C.body, lw: 2.6 });
      shape(ctx, tube(bend(52, -48, aR[0], aR[1], -6), 12), { fill: C.body, lw: 2.6 });
      ctx.restore();
      return;
    }
    shape(ctx, body, { fill: C.body, shade: C.dark, shadeDist: 9, shadeAng: -2.4 });
    // 肚皮
    shape(ctx, SK.ell(0, -28, 38, 22), { fill: C.belly, lw: 2, line: SK.mix(C.dark, SK.INK, 0.3) });
    // 斑点
    [[-44, -72, 6], [-52, -46, 3.6], [47, -52, 4.6], [42, -78, 3.4]].forEach(([a, b, r]) => shape(ctx, SK.circ(a, b, r), { fill: C.dark, line: false }));
    // 眼睛
    shape(ctx, SK.circ(eL[0], eL[1], eL[2]), { fill: C.body, shade: C.dark, shadeDist: 4 });
    shape(ctx, SK.circ(eR[0], eR[1], eR[2]), { fill: C.body, shade: C.dark, shadeDist: 4 });
    const look = o.look || [0.15, 0.1];
    // 丑萌：两只眼睛看向略不同的方向
    eye(ctx, eL[0], eL[1] - 1, 17, 6.5, [look[0] - 0.12, look[1]], o, -1);
    eye(ctx, eR[0], eR[1] - 1, 14, 5.4, [look[0] + 0.12, look[1] + 0.1], o, 1);
    if (o.brows) {
      const b = o.brows; // 'worried' | 'angry'
      if (b === 'worried') {
        line(ctx, [[-44, -126], [-22, -122]], { lw: 2.6 });
        line(ctx, [[20, -120], [40, -124]], { lw: 2.6 });
      }
    }
    // 鼻孔
    dot(ctx, -6, -76, 1.9);
    dot(ctx, 7, -76, 1.9);
    // 腮红
    const bl = o.blush == null ? 0.6 : o.blush;
    if (bl > 0) {
      shape(ctx, SK.ell(-44, -56, 10, 5.5), { fill: BLUSH, line: false, tex: 0, alpha: Math.min(1, bl * 1.4) });
      shape(ctx, SK.ell(45, -56, 10, 5.5), { fill: BLUSH, line: false, tex: 0, alpha: Math.min(1, bl * 1.4) });
      if (bl > 0.8) {
        for (let i = 0; i < 3; i++) {
          line(ctx, [[-50 + i * 5, -53], [-47 + i * 5, -59]], { lw: 1.6, line: '#e76a83' });
          line(ctx, [[40 + i * 5, -53], [43 + i * 5, -59]], { lw: 1.6, line: '#e76a83' });
        }
      }
    }
    // 嘴
    mouth(ctx, o.face || 'smile', 0, -58, 34, t, 'frog');
    // 手臂
    drawArms(ctx, o, C.body, -46, -50, 'frog', t);
    if (o.sweat) sweat(ctx, 58, -108, 1);
    if (o.acc) o.acc(ctx);
    ctx.restore();
  };

  function mouth(ctx, face, x, y, w, t, who) {
    if (face === 'open' || face === 'grin' || face === 'yell') {
      const h = face === 'yell' ? 26 : 18;
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const k = i / 12;
        pts.push([x - w * 0.8 + k * w * 1.6, y - 3 + Math.sin(k * Math.PI) * 3]);
      }
      for (let i = 0; i <= 14; i++) {
        const k = i / 14;
        pts.push([x + w * 0.8 - k * w * 1.6, y - 1 + Math.sin(k * Math.PI) * h]);
      }
      shape(ctx, pts, { fill: MOUTH, lw: 2.6, tex: 0.05 });
      shape(ctx, SK.ell(x + 2, y + h * 0.62, w * 0.36, h * 0.28), { fill: TONGUE, line: false, tex: 0 });
    } else if (face === 'o') {
      shape(ctx, SK.ell(x, y + 2, 7, 9), { fill: MOUTH, lw: 2.4, tex: 0 });
    } else if (face === 'scared') {
      const pts = [];
      for (let i = 0; i <= 16; i++) {
        const k = i / 16;
        pts.push([x - w * 0.6 + k * w * 1.2, y + 4 + Math.sin(k * Math.PI * 4 + t * 30) * 3]);
      }
      line(ctx, pts, { lw: 2.6 });
    } else if (face === 'flat') {
      line(ctx, [[x - w * 0.4, y + 2], [x + w * 0.4, y + 3]], { lw: 2.6 });
    } else if (face === 'sad' || face === 'cry') {
      curve(ctx, x - w * 0.5, y + 8, x, y - 6, x + w * 0.5, y + 8, { lw: 2.8 });
    } else if (face === 'sleep') {
      curve(ctx, x - w * 0.35, y, x, y + 8, x + w * 0.35, y, { lw: 2.6 });
    } else if (face === 'kiss') {
      shape(ctx, SK.heartPts(x, y + 2, 8), { fill: MOUTH, lw: 2, tex: 0 });
    } else {
      // smile（宽嘴，丑萌）
      curve(ctx, x - w, y - 2, x, y + 22, x + w, y - 2, { lw: 3, n: 18 });
      if (who === 'frog') {
        line(ctx, [[x - w - 3, y - 6], [x - w + 2, y + 1]], { lw: 2.2 });
        line(ctx, [[x + w + 3, y - 6], [x + w - 2, y + 1]], { lw: 2.2 });
      }
    }
  }
  CH.mouth = mouth;

  const ARM_PRESET = {
    frog: {
      down: [[-58, -20], [58, -20]],
      up: [[-80, -122], [80, -122]],
      front: [[-16, -40], [16, -40]],
      phone: [[-13, -34], [13, -34]],
      hip: [[-70, -34], [70, -34]],
      wave: [[-62, -20], [84, -104]],
      cheer: [[-86, -100], [86, -100]],
      hug: [[-30, -40], [30, -40]],
    },
    pig: {
      down: [[-58, -20], [58, -20]],
      up: [[-76, -112], [76, -112]],
      front: [[-16, -24], [16, -24]],
      phone: [[-13, -20], [13, -20]],
      hip: [[-68, -30], [68, -30]],
      wave: [[-62, -22], [80, -96]],
      cheer: [[-80, -94], [80, -94]],
      hug: [[-28, -36], [28, -36]],
      heart: [[-6, -136], [6, -136]],
    },
  };

  function resolveArm(who, spec, side, t) {
    if (Array.isArray(spec)) return spec;
    const P = ARM_PRESET[who][spec || 'down'] || ARM_PRESET[who].down;
    let p = P[side].slice();
    if (spec === 'wave') {
      if (side === 1) {
        p[0] += Math.sin(t * 14) * 10;
        p[1] += Math.cos(t * 14) * 4;
      }
    }
    if (spec === 'cheer') p[1] += Math.sin(t * 16 + side) * 8;
    return p;
  }

  function hand(ctx, x, y, ang, color, who) {
    if (who === 'frog') {
      for (let k = -1; k <= 1; k++) {
        const a = ang + k * 0.65;
        shape(ctx, SK.circ(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 4), { fill: color, lw: 2 });
      }
      shape(ctx, SK.circ(x, y, 7.5), { fill: color, lw: 2.4 });
    } else {
      shape(ctx, SK.circ(x, y, 8), { fill: color, lw: 2.4 });
      // 蹄子
      const hx = x + Math.cos(ang) * 4.5, hy = y + Math.sin(ang) * 4.5;
      shape(ctx, SK.ell(hx, hy, 4.2, 4.2), { fill: CH.PIG.hoof, line: false, tex: 0 });
      line(ctx, [[hx - Math.sin(ang) * 3, hy + Math.cos(ang) * 3], [hx + Math.cos(ang) * 3.5, hy + Math.sin(ang) * 3.5]], { lw: 1.5 });
    }
  }

  function drawArms(ctx, o, color, sx, sy, who, t) {
    const arms = o.arms || 'down';
    const specL = typeof arms === 'object' && !Array.isArray(arms) ? arms.l : arms;
    const specR = typeof arms === 'object' && !Array.isArray(arms) ? arms.r : arms;
    const sides = [
      [-1, specL, 0],
      [1, specR, 1],
    ];
    // heart：双臂举过头顶围出爱心
    if (arms === 'heart') {
      const top = who === 'pig' ? -100 : -120;
      for (const s of [-1, 1]) {
        const pts = SK.spline(
          [
            [s * 48, sy - 6],
            [s * 74, top - 6],
            [s * 50, top - 44],
            [s * 20, top - 44],
            [s * 4, top - 26],
          ],
          false,
          5
        );
        shape(ctx, tube(pts, 11), { fill: color, lw: 2.4 });
        hand(ctx, s * 5, top - 24, s > 0 ? Math.PI * 0.9 : Math.PI * 0.1, color, who);
      }
      return;
    }
    for (const [s, spec, idx] of sides) {
      const p = resolveArm(who, spec, idx, t);
      const shx = s * Math.abs(sx), shy = sy;
      const pts = bend(shx, shy, p[0], p[1], s * (p[1] < shy - 30 ? -10 : 5));
      shape(ctx, tube(pts, who === 'frog' ? 11 : 13), { fill: color, lw: 2.4 });
      const ang = Math.atan2(p[1] - pts[pts.length - 2][1], p[0] - pts[pts.length - 2][0]);
      hand(ctx, p[0], p[1], ang, color, who);
      const holdFn = idx === 0 ? o.holdL : o.holdR;
      if (holdFn) {
        ctx.save();
        ctx.translate(p[0], p[1]);
        holdFn(ctx);
        ctx.restore();
      }
    }
    if (o.hold) {
      // 双手共同拿着的物件，画在两手之间
      const a = resolveArm(who, specL, 0, t), b = resolveArm(who, specR, 1, t);
      ctx.save();
      ctx.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      o.hold(ctx);
      ctx.restore();
      // 手画在物件之上
      for (const [s, spec, idx] of sides) {
        const p = resolveArm(who, spec, idx, t);
        hand(ctx, p[0], p[1], s > 0 ? Math.PI * 0.8 : Math.PI * 0.2, color, who);
      }
    }
  }

  /* =========================== 小猪 =========================== */
  function wing(ctx, ax, ay, side, ang, scale = 1) {
    ctx.save();
    ctx.translate(ax, ay);
    ctx.scale(side * scale, scale);
    ctx.rotate(ang);
    const upper = SK.spline([[0, 0], [14, -26], [42, -46], [66, -44], [70, -28], [52, -10], [22, 2]]);
    const lower = SK.spline([[2, 4], [26, 6], [46, 18], [42, 32], [24, 30], [8, 16]]);
    shape(ctx, lower, { fill: CH.PIG.wing, line: CH.PIG.wingLine, lw: 2, tex: 0.12 });
    shape(ctx, upper, { fill: CH.PIG.wing, line: CH.PIG.wingLine, lw: 2.2, tex: 0.12 });
    curve(ctx, 6, -2, 30, -26, 58, -34, { lw: 1.2, line: CH.PIG.wingLine });
    curve(ctx, 8, 0, 34, -10, 54, -18, { lw: 1.1, line: CH.PIG.wingLine });
    curve(ctx, 6, 6, 22, 12, 36, 22, { lw: 1.1, line: CH.PIG.wingLine });
    // 高光
    SK.line(ctx, [[30, -36], [44, -40]], { lw: 2.4, line: 'rgba(255,255,255,0.9)' });
    ctx.restore();
  }
  CH.wing = wing;

  CH.pig = function (ctx, x, y, s = 1, o = {}) {
    const C = CH.PIG;
    const t = o.t == null ? SK.t : o.t;
    ctx.save();
    ctx.translate(x, y);
    if (o.shiver) ctx.translate((SK.noise(t * 47) - 0.5) * o.shiver * 2, (SK.noise(t * 51 + 9) - 0.5) * o.shiver);
    ctx.scale(s * (o.flip ? -1 : 1), s);
    let bob = 0, legL = 0, legR = 0, tilt = o.tilt || 0;
    if (o.walk != null) {
      const p = o.walk;
      bob = Math.abs(Math.sin(p)) * 4;
      legL = Math.max(0, Math.sin(p)) * 8;
      legR = Math.max(0, -Math.sin(p)) * 8;
      tilt += Math.sin(p) * 0.04;
    }
    const flying = !!o.fly;
    if (flying) {
      bob += 6 + Math.sin(t * 5) * 6;
      legL = legR = -2;
    }
    if (o.hop) bob += o.hop;
    const flapSpeed = flying ? 22 : o.flapSpeed || 3;
    const flapAmp = flying ? 0.45 : o.flapAmp == null ? 0.12 : o.flapAmp;
    const flap = Math.sin(t * flapSpeed) * flapAmp;
    const sq = o.squash || 1;
    o.blinking = o.blink !== false && blinkAt(t, 4.1);

    // 腿
    const leg = (lx, lift) => {
      const y0 = -16 - lift, y1 = 2 - lift;
      shape(ctx, SK.rrect(lx - 11, y0, 22, y1 - y0, 7), { fill: C.body, lw: 2.4 });
      shape(ctx, SK.rrect(lx - 10, y1 - 6, 20, 6, 3), { fill: C.hoof, line: false, tex: 0 });
      line(ctx, [[lx, y1 - 6], [lx, y1]], { lw: 1.6 });
    };
    ctx.save();
    ctx.translate(0, -bob * 0.5);
    leg(-22, legL);
    leg(22, legR);
    ctx.restore();

    ctx.translate(0, -bob);
    ctx.rotate(tilt);
    ctx.scale(1 / Math.sqrt(sq), sq);

    const body = SK.spline([
      [0, -104], [30, -101], [52, -86], [62, -60], [60, -30], [48, -9], [24, 1], [0, 3], [-24, 1], [-48, -9], [-60, -30], [-62, -60], [-52, -86], [-30, -101],
    ]);
    const earL = SK.spline([[-46, -86], [-30, -100], [-46, -116], [-66, -112], [-62, -98]]);
    const earR = SK.spline([[28, -100], [48, -88], [60, -114], [50, -128], [38, -118]]);

    if (o.back) {
      shape(ctx, earL, { fill: C.body });
      shape(ctx, earR, { fill: C.body });
      shape(ctx, body, { fill: C.body, shade: C.dark, shadeDist: 10 });
      // 卷尾巴
      tail(ctx, 0, -26, 1);
      const aL = o.backArm ? o.backArm.l : [-64, -24];
      const aR = o.backArm ? o.backArm.r : [64, -24];
      shape(ctx, tube(bend(-50, -44, aL[0], aL[1], 6), 13), { fill: C.body, lw: 2.4 });
      shape(ctx, tube(bend(50, -44, aR[0], aR[1], -6), 13), { fill: C.body, lw: 2.4 });
      wing(ctx, -16, -74, -1, -flap - 0.1, 0.95);
      wing(ctx, 16, -74, 1, -flap - 0.1, 0.95);
      ctx.restore();
      return;
    }

    wing(ctx, -42, -76, -1, -flap, 1);
    wing(ctx, 42, -76, 1, -flap, 1);
    tail(ctx, 58, -30, 1);
    shape(ctx, body, { fill: C.body, shade: C.dark, shadeDist: 9, shadeAng: -2.4 });
    // 耳朵
    shape(ctx, earL, { fill: C.body });
    shape(ctx, SK.spline([[-46, -92], [-36, -100], [-48, -110], [-60, -108]]), { fill: C.dark, line: false });
    shape(ctx, earR, { fill: C.body });
    shape(ctx, SK.spline([[36, -102], [46, -94], [54, -114], [48, -120]]), { fill: C.dark, line: false });
    // 呆毛
    SK.line(ctx, SK.spline([[-2, -103], [-6, -116], [2, -124], [10, -118], [4, -112]], false, 3), { lw: 2.4 });
    // 眼睛：小豆豆眼，一大一小
    const look = o.look || [0, 0];
    if (o.face === 'love') {
      heartEye(ctx, -24, -72, 9);
      heartEye(ctx, 24, -74, 8);
    } else if (o.face === 'sleep' || o.blinking) {
      curve(ctx, -31, -71, -24, -65, -17, -71, { lw: 2.6 });
      curve(ctx, 17, -73, 24, -67, 31, -73, { lw: 2.6 });
    } else if (o.face === 'happy') {
      curve(ctx, -31, -68, -24, -77, -17, -68, { lw: 2.8 });
      curve(ctx, 17, -70, 24, -79, 31, -70, { lw: 2.8 });
    } else if (o.face === 'o' || o.face === 'scared') {
      shape(ctx, SK.circ(-24, -72, 8), { fill: '#fffdf6', lw: 2.2, tex: 0 });
      shape(ctx, SK.circ(24, -74, 7), { fill: '#fffdf6', lw: 2.2, tex: 0 });
      dot(ctx, -24 + look[0] * 3, -72 + look[1] * 3, 3);
      dot(ctx, 24 + look[0] * 3, -74 + look[1] * 3, 2.6);
    } else {
      dot(ctx, -24 + look[0] * 3, -71 + look[1] * 3, 5.2);
      dot(ctx, 23 + look[0] * 3, -73 + look[1] * 3, 4.4);
      dot(ctx, -25.5 + look[0] * 3, -73 + look[1] * 3, 1.7, '#fff');
      dot(ctx, 21.8 + look[0] * 3, -74.6 + look[1] * 3, 1.4, '#fff');
    }
    // 腮红
    const bl = o.blush == null ? 0.6 : o.blush;
    if (bl > 0) {
      shape(ctx, SK.ell(-42, -47, 10, 6), { fill: BLUSH, line: false, tex: 0, alpha: Math.min(1, bl * 1.4) });
      shape(ctx, SK.ell(42, -48, 10, 6), { fill: BLUSH, line: false, tex: 0, alpha: Math.min(1, bl * 1.4) });
      if (bl > 0.8) {
        for (let i = 0; i < 3; i++) {
          line(ctx, [[-48 + i * 5, -44], [-45 + i * 5, -50]], { lw: 1.6, line: '#e76a83' });
          line(ctx, [[37 + i * 5, -45], [40 + i * 5, -51]], { lw: 1.6, line: '#e76a83' });
        }
      }
    }
    // 大鼻子
    shape(ctx, SK.ell(0, -51, 24, 16, 0.05), { fill: C.snout, lw: 2.6, shade: C.dark, shadeDist: 4 });
    shape(ctx, SK.ell(-8.5, -51, 4.2, 6.6, 0.1), { fill: C.nostril, line: false, tex: 0 });
    shape(ctx, SK.ell(9, -50, 3.8, 6, -0.1), { fill: C.nostril, line: false, tex: 0 });
    SK.line(ctx, [[-14, -61], [-6, -63]], { lw: 2, line: 'rgba(255,255,255,0.8)' });
    // 嘴
    const face = o.face || 'smile';
    if (face === 'smile' || face === 'love' || face === 'happy') curve(ctx, -11, -31, 0, -23, 11, -31, { lw: 2.6 });
    else if (face === 'sleep') curve(ctx, -6, -30, 0, -26, 6, -30, { lw: 2.4 });
    else mouth(ctx, face, 0, -30, 13, t, 'pig');
    // 小虎牙
    if (face === 'smile' || face === 'love') shape(ctx, [[3, -28], [7, -28.6], [5.2, -24]], { fill: '#fff', lw: 1.5, tex: 0, wob: 0.2 });
    drawArms(ctx, o, C.body, -46, -44, 'pig', t);
    if (o.sweat) sweat(ctx, 56, -104, 1);
    if (o.acc) o.acc(ctx);
    ctx.restore();
  };

  function tail(ctx, x, y, s) {
    const pts = [];
    for (let i = 0; i <= 26; i++) {
      const k = i / 26;
      const a = k * Math.PI * 3.2;
      const r = 3 + k * 9;
      pts.push([x + k * 14 * s + Math.cos(a) * r * 0.6, y - Math.sin(a) * r * 0.6 - k * 4]);
    }
    SK.line(ctx, pts, { lw: 3.4, line: SK.INK });
    SK.line(ctx, pts, { lw: 1.6, line: CH.PIG.dark, wob: 0.5 });
  }

  /* 两个角色的小工具 */
  CH.zzz = function (ctx, x, y, t, s = 1) {
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.6 + i / 3) % 1);
      const a = Math.sin(k * Math.PI);
      ctx.save();
      ctx.globalAlpha *= a;
      SK.text(ctx, 'Z', x + k * 40 * s + Math.sin(k * 8) * 6, y - k * 60 * s, { size: (18 + k * 16) * s, font: SK.FONT_EN, color: '#6c7fb8', weight: 'bold' });
      ctx.restore();
    }
  };
})();
