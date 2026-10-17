/* 手绘渲染引擎：抖动的墨线（line boil）、蜡笔纹理、纸张颗粒。
 * 所有绘制都是时间 t 的纯函数，方便任意跳转和逐帧离线渲染。 */
(function () {
  const SK = (window.SK = {});
  SK.W = 1280;
  SK.H = 720;
  SK.INK = '#3b2a24';
  SK.PAPER = '#fbf5e8';
  SK.pxScale = 1; // 画布像素 / 影片像素
  SK.FONT = '"ZCOOL KuaiLe", "Gaegu", "PingFang SC", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif';
  SK.FONT_EN = '"Gaegu", "ZCOOL KuaiLe", "Comic Sans MS", sans-serif';

  /* ---------- 随机与噪声 ---------- */
  SK.hash = function (x) {
    const s = Math.sin(x * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  };
  SK.rand = function (seed) {
    let a = (Math.floor(seed * 9973) ^ 0x9e3779b9) >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  SK.noise = function (x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return SK.hash(i) * (1 - u) + SK.hash(i + 1) * u;
  };

  /* ---------- 缓动 ---------- */
  SK.clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  SK.lerp = (a, b, k) => a + (b - a) * k;
  SK.prog = (t, a, b) => SK.clamp((t - a) / (b - a));
  SK.smooth = (k) => k * k * (3 - 2 * k);
  SK.easeOut = (k) => 1 - Math.pow(1 - k, 3);
  SK.easeIn = (k) => k * k * k;
  SK.easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  SK.backOut = (k) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
  };
  SK.elastic = (k) => {
    if (k <= 0) return 0;
    if (k >= 1) return 1;
    return Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  };
  // 弹跳出现：0→1 带回弹
  SK.pop = (t, start, dur = 0.35) => SK.backOut(SK.prog(t, start, start + dur));

  /* ---------- 颜色 ---------- */
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  SK.rgb = hexToRgb;
  SK.mix = function (a, b, k) {
    const A = hexToRgb(a), B = hexToRgb(b);
    const c = A.map((v, i) => Math.round(v + (B[i] - v) * k));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  SK.rgba = function (hex, a) {
    const c = hexToRgb(hex);
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  };

  /* ---------- 帧状态 ---------- */
  SK.t = 0;
  SK.boil = 0;
  SK.seedCounter = 0;
  SK.beginFrame = function (t) {
    SK.t = t;
    SK.boil = Math.floor(t * 8); // 每秒 8 次线条抖动，模拟手绘逐张作画
    SK.seedCounter = 0;
  };
  SK.scaleOf = function (ctx) {
    const m = ctx.getTransform();
    return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) / SK.pxScale || 1;
  };

  /* ---------- 点集生成 ---------- */
  SK.ell = function (cx, cy, rx, ry, rot = 0, n) {
    ry = ry == null ? rx : ry;
    n = n || Math.max(14, Math.min(72, Math.round((Math.abs(rx) + Math.abs(ry)) * 0.4)));
    const out = [];
    const c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      out.push([cx + x * c - y * s, cy + x * s + y * c]);
    }
    return out;
  };
  SK.circ = (cx, cy, r) => SK.ell(cx, cy, r, r);
  // 带分段的多边形（直线边细分，方便抖动）
  SK.poly = function (pts, closed = true, step = 10) {
    const out = [];
    const n = pts.length;
    const m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const k = Math.max(1, Math.round(d / step));
      for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
    }
    if (!closed) out.push(pts[n - 1].slice());
    return out;
  };
  SK.rect = (x, y, w, h) => SK.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  SK.rrect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    const out = [];
    const corner = (cx, cy, a0) => {
      for (let i = 0; i <= 6; i++) {
        const a = a0 + (i / 6) * (Math.PI / 2);
        out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    };
    const edge = (x0, y0, x1, y1) => {
      const d = Math.hypot(x1 - x0, y1 - y0);
      const k = Math.max(1, Math.round(d / 12));
      for (let j = 1; j < k; j++) out.push([x0 + ((x1 - x0) * j) / k, y0 + ((y1 - y0) * j) / k]);
    };
    corner(x + w - r, y + r, -Math.PI / 2);
    edge(x + w, y + r, x + w, y + h - r);
    corner(x + w - r, y + h - r, 0);
    edge(x + w - r, y + h, x + r, y + h);
    corner(x + r, y + h - r, Math.PI / 2);
    edge(x, y + h - r, x, y + r);
    corner(x + r, y + r, Math.PI);
    edge(x + r, y, x + w - r, y);
    return out;
  };
  // Catmull-Rom 样条
  SK.spline = function (ctrl, closed = true, seg = 8) {
    const out = [];
    const n = ctrl.length;
    const get = (i) => (closed ? ctrl[(i + n) % n] : ctrl[Math.max(0, Math.min(n - 1, i))]);
    const m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const k = Math.max(2, Math.round(d / seg));
      for (let j = 0; j < k; j++) {
        const t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        ]);
      }
    }
    if (!closed) out.push(ctrl[n - 1].slice());
    return out;
  };
  SK.heartPts = function (cx, cy, size, n = 48) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(a), 3);
      const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      out.push([cx + (x * size) / 16, cy + (y * size) / 16]);
    }
    return out;
  };
  SK.starPts = function (cx, cy, r1, r2, k = 5, rot = 0) {
    const out = [];
    for (let i = 0; i < k * 2; i++) {
      const a = rot - Math.PI / 2 + (i / (k * 2)) * Math.PI * 2;
      const r = i % 2 ? r2 : r1;
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return SK.poly(out, true, 6);
  };
  SK.transform = function (pts, dx, dy, sx = 1, sy = sx, rot = 0, ox = 0, oy = 0) {
    const c = Math.cos(rot), s = Math.sin(rot);
    return pts.map(([x, y]) => {
      x = (x - ox) * sx;
      y = (y - oy) * sy;
      return [ox + x * c - y * s + dx, oy + x * s + y * c + dy];
    });
  };

  /* ---------- 抖动 ---------- */
  function wobble(pts, amp, seed, extra) {
    const out = [];
    let s = 0;
    const n = pts.length;
    const total = n + extra;
    for (let i = 0; i < total; i++) {
      const p = pts[i % n];
      if (i > 0) {
        const q = pts[(i - 1) % n];
        s += Math.hypot(p[0] - q[0], p[1] - q[1]);
      }
      const k = s * 0.045;
      const nx = SK.noise(k + seed * 1.37) - 0.5;
      const ny = SK.noise(k + seed * 2.11 + 57.3) - 0.5;
      out.push([p[0] + nx * 2 * amp, p[1] + ny * 2 * amp, s]);
    }
    return out;
  }

  function tracePath(ctx, pts, closed, count) {
    const n = count || pts.length;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (closed) ctx.closePath();
  }
  SK.tracePath = tracePath;

  // 将中心线变成粗细不均、两端收笔的墨线多边形并填充
  function brush(ctx, W, lw, seed, taperLen) {
    const n = W.length;
    if (n < 2) return;
    const L = W[n - 1][2] || 1;
    const left = [], right = [];
    const tl = Math.min(taperLen, L * 0.35);
    for (let i = 0; i < n; i++) {
      const a = W[Math.max(0, i - 1)], b = W[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const d = Math.hypot(tx, ty) || 1;
      tx /= d;
      ty /= d;
      const s = W[i][2];
      let w = lw * (0.72 + 0.56 * SK.noise(s * 0.02 + seed * 3.3));
      if (tl > 0) w *= Math.min(1, 0.25 + 0.75 * Math.min(s / tl, (L - s) / tl));
      const hw = w / 2;
      left.push([W[i][0] - ty * hw, W[i][1] + tx * hw]);
      right.push([W[i][0] + ty * hw, W[i][1] - tx * hw]);
    }
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  /* ---------- 纹理 ---------- */
  let texCanvas = null, texPattern = null, texCtxOwner = null;
  function makeTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const r = SK.rand(42);
    // 蜡笔斜线
    for (let i = 0; i < 520; i++) {
      const x = r() * 256, y = r() * 256, len = 6 + r() * 18;
      const light = r() < 0.6;
      g.strokeStyle = light ? `rgba(255,255,255,${0.25 + r() * 0.5})` : `rgba(40,20,10,${0.12 + r() * 0.25})`;
      g.lineWidth = 0.6 + r() * 1.4;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + len * 0.8, y - len * 0.6);
      g.stroke();
      // 平铺无缝
      g.beginPath();
      g.moveTo(x - 256, y);
      g.lineTo(x - 256 + len * 0.8, y - len * 0.6);
      g.stroke();
      g.beginPath();
      g.moveTo(x, y + 256);
      g.lineTo(x + len * 0.8, y + 256 - len * 0.6);
      g.stroke();
    }
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = r() < 0.5 ? `rgba(255,255,255,${r() * 0.5})` : `rgba(60,30,10,${r() * 0.18})`;
      g.fillRect(r() * 256, r() * 256, 1 + r() * 1.5, 1 + r() * 1.5);
    }
    return c;
  }
  SK.texture = function (ctx) {
    if (!texCanvas) texCanvas = makeTexture();
    if (texCtxOwner !== ctx) {
      texPattern = ctx.createPattern(texCanvas, 'repeat');
      texCtxOwner = ctx;
    }
    return texPattern;
  };

  /* ---------- 主绘制函数 ---------- */
  // opt: fill, line(颜色|false), lw, wob, tex, alpha, closed, shade, seed, boil, offset(填色错位)
  SK.shape = function (ctx, pts, opt = {}) {
    if (!pts || pts.length < 2) return;
    const closed = opt.closed !== false;
    const sc = SK.scaleOf(ctx);
    const amp = (opt.wob == null ? 1.3 : opt.wob) / sc;
    let seed = opt.seed != null ? opt.seed : SK.seedCounter++;
    if (opt.boil !== false) seed = seed * 0.731 + SK.boil * 7.31;
    const lineColor = opt.line === undefined ? SK.INK : opt.line;
    const lw = (opt.lw == null ? 3 : opt.lw) / Math.pow(sc, 0.75);
    // 闭合图形多画一小段，制造手绘的“收笔交叠”
    let extra = 0;
    if (closed && lineColor) {
      let acc = 0;
      for (let i = 1; i < pts.length && acc < 14 / sc; i++) {
        acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        extra = i + 1;
      }
    }
    const W = wobble(pts, amp, seed, extra);
    const prevAlpha = ctx.globalAlpha;
    if (opt.alpha != null) ctx.globalAlpha = prevAlpha * opt.alpha;

    if (opt.fill && closed) {
      const off = opt.offset == null ? 0.8 : opt.offset;
      if (off) {
        ctx.save();
        ctx.translate(off / sc, off * 0.6 / sc);
      }
      tracePath(ctx, W, true, pts.length);
      ctx.fillStyle = opt.fill;
      ctx.fill();
      if (opt.shade) {
        ctx.save();
        ctx.clip();
        const sd = opt.shadeDist || 9;
        const ang = opt.shadeAng == null ? -2.3 : opt.shadeAng;
        ctx.beginPath();
        ctx.rect(-5000, -5000, 10000, 10000);
        const dx = Math.cos(ang) * sd, dy = Math.sin(ang) * sd;
        ctx.moveTo(W[0][0] + dx, W[0][1] + dy);
        for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(W[i][0] + dx, W[i][1] + dy);
        ctx.closePath();
        ctx.fillStyle = opt.shade;
        ctx.fill('evenodd');
        ctx.restore();
        tracePath(ctx, W, true, pts.length);
      }
      const tex = opt.tex == null ? 0.22 : opt.tex;
      if (tex > 0) {
        ctx.globalAlpha = (opt.alpha != null ? prevAlpha * opt.alpha : prevAlpha) * tex;
        ctx.fillStyle = SK.texture(ctx);
        ctx.fill();
        ctx.globalAlpha = opt.alpha != null ? prevAlpha * opt.alpha : prevAlpha;
      }
      if (off) ctx.restore();
    }
    if (lineColor) {
      ctx.fillStyle = lineColor;
      brush(ctx, W, lw, seed, closed ? 8 / sc : 10 / sc);
    }
    ctx.globalAlpha = prevAlpha;
  };

  // 开放线条（毛发、嘴巴、装饰线）
  SK.line = function (ctx, pts, opt = {}) {
    SK.shape(ctx, pts, Object.assign({}, opt, { closed: false, fill: null }));
  };
  // 二次贝塞尔线
  SK.curve = function (ctx, x0, y0, cx, cy, x1, y1, opt = {}) {
    const pts = [];
    const n = opt.n || 14;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1]);
    }
    SK.line(ctx, pts, opt);
  };
  SK.seg = function (ctx, x0, y0, x1, y1, opt = {}) {
    SK.line(ctx, SK.poly([[x0, y0], [x1, y1]], false, 8), opt);
  };
  SK.dot = function (ctx, x, y, r, color = SK.INK) {
    SK.shape(ctx, SK.circ(x, y, r), { fill: color, line: false, wob: 0.4, tex: 0, offset: 0 });
  };
  // 实心软边光晕
  SK.glow = function (ctx, x, y, r, color, a = 0.5) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, SK.rgba(color, a));
    g.addColorStop(1, SK.rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  // 蜡笔排线（用于阴影/草地）
  SK.hatch = function (ctx, x, y, w, h, color, opt = {}) {
    const r = SK.rand((opt.seed || 7) + (opt.boil === false ? 0 : SK.boil * 0.37));
    const gap = opt.gap || 7;
    const lw = opt.lw || 1.6;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.globalAlpha *= opt.alpha == null ? 0.5 : opt.alpha;
    ctx.beginPath();
    for (let i = -h; i < w; i += gap) {
      const j = (r() - 0.5) * 3;
      ctx.moveTo(x + i + j, y + h);
      ctx.lineTo(x + i + h * 0.6 + j + (r() - 0.5) * 3, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  /* ---------- 手写文字 ---------- */
  SK.text = function (ctx, str, x, y, opt = {}) {
    const size = opt.size || 32;
    const font = opt.font || SK.FONT;
    ctx.save();
    ctx.font = `${opt.weight || ''} ${size}px ${font}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const chars = Array.from(str);
    const widths = chars.map((c) => ctx.measureText(c).width);
    const spacing = (opt.spacing || 0) * size;
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let cx = opt.align === 'left' ? x : opt.align === 'right' ? x - total : x - total / 2;
    const jit = opt.jitter == null ? 1 : opt.jitter;
    const seedBase = (opt.seed || 0) + (opt.boil === false ? 0 : SK.boil * 13.7);
    for (let i = 0; i < chars.length; i++) {
      const h1 = SK.hash(seedBase + i * 3.1), h2 = SK.hash(seedBase + i * 5.7 + 2);
      ctx.save();
      ctx.translate(cx + widths[i] / 2, y + (h2 - 0.5) * 2 * jit);
      ctx.rotate((h1 - 0.5) * 0.09 * jit);
      if (opt.outline) {
        ctx.lineWidth = opt.outlineW || size * 0.16;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = opt.outline;
        ctx.strokeText(chars[i], -widths[i] / 2, 0);
      }
      ctx.fillStyle = opt.color || SK.INK;
      ctx.fillText(chars[i], -widths[i] / 2, 0);
      ctx.restore();
      cx += widths[i] + spacing;
    }
    ctx.restore();
    return total;
  };
  SK.measure = function (ctx, str, size, font) {
    ctx.save();
    ctx.font = `${size}px ${font || SK.FONT}`;
    const w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  };

  /* ---------- 纸张 ---------- */
  let paperCanvas = null, paperKey = '';
  SK.paperOverlay = function (ctx, w, h, strength = 1) {
    const key = w + 'x' + h;
    if (!paperCanvas || paperKey !== key) {
      paperKey = key;
      paperCanvas = document.createElement('canvas');
      paperCanvas.width = w;
      paperCanvas.height = h;
      const g = paperCanvas.getContext('2d');
      g.fillStyle = '#fff';
      g.fillRect(0, 0, w, h);
      const img = g.getImageData(0, 0, w, h);
      const d = img.data;
      const r = SK.rand(7);
      for (let i = 0; i < d.length; i += 4) {
        const v = 244 + r() * 11;
        d[i] = v;
        d[i + 1] = v - 2;
        d[i + 2] = v - 7;
      }
      g.putImageData(img, 0, 0);
      // 纤维
      const k = w / 1280;
      for (let i = 0; i < 900; i++) {
        const x = r() * w, y = r() * h, len = (8 + r() * 40) * k, a = r() * Math.PI;
        g.strokeStyle = `rgba(150,110,70,${0.04 + r() * 0.07})`;
        g.lineWidth = (0.5 + r()) * k;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 6 * k, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
        g.stroke();
      }
      // 暗角
      const vg = g.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.95);
      vg.addColorStop(0, 'rgba(120,80,40,0)');
      vg.addColorStop(1, 'rgba(120,80,40,0.16)');
      g.fillStyle = vg;
      g.fillRect(0, 0, w, h);
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = strength;
    ctx.drawImage(paperCanvas, 0, 0);
    ctx.restore();
  };

  /* ---------- 镜头 ---------- */
  // 以 (cx, cy) 为画面中心、zoom 倍率
  SK.camera = function (ctx, cx, cy, zoom = 1, rot = 0) {
    ctx.translate(SK.W / 2, SK.H / 2);
    if (rot) ctx.rotate(rot);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  };
  SK.shake = function (ctx, t, amp) {
    ctx.translate((SK.noise(t * 30) - 0.5) * 2 * amp, (SK.noise(t * 30 + 40) - 0.5) * 2 * amp);
  };
  SK.bg = function (ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(-20, -20, SK.W + 40, SK.H + 40);
  };
  SK.vgrad = function (ctx, stops, y0 = 0, y1 = SK.H, x = -20, w = SK.W + 40) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(x, y0, w, y1 - y0);
  };
})();
