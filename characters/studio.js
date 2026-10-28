/* 角色工作台：把青蛙和苍蝇猪从影片里单独拿出来画。
 * 直接复用 js/sketch.js + js/chars.js + js/props.js，所以和影片里是完全同一套形象。
 * - tools/export-characters.js 用它批量导出 PNG / 设定图 / 循环动画
 * - characters/studio.html 用它手动摆姿势、下载 PNG
 * 坐标单位与影片相同（1280×720 画面里的像素），角色原点在脚下中心。 */
(function () {
  const ST = (window.STUDIO = {});
  const { shape, line } = SK;
  const TAU = Math.PI * 2;

  // 单个角色的画框：原点（脚下中心）在框内 (150, 215)
  ST.BOX = { x: -150, y: -215, w: 300, h: 240 };
  // 两个角色同框
  ST.DUO_BOX = { x: -300, y: -215, w: 600, h: 240 };

  /* ---------- 配件（与影片一致） ---------- */
  ST.ACC = {
    // 同 scenes3.js 里石膏画一场的贝雷帽
    beret(ctx) {
      shape(ctx, SK.spline([[-54, -112], [-40, -136], [0, -142], [36, -130], [42, -112], [0, -118]]), { fill: '#e8605f', lw: 2.6 });
      line(ctx, [[0, -140], [4, -150]], { lw: 3 });
    },
  };
  // 同 scenes1.js 的 SH.phoneHeld：双手捧着的手机
  ST.phone = (color) => (ctx) => {
    SK.glow(ctx, 0, -20, 60, '#fff6c0', 0.45);
    P.phone(ctx, 0, -14, 0.62, { color, on: true });
  };

  /* ---------- 表情 ---------- */
  // [id, 中文名, 选项]；所有表情都可以和任意手臂姿势 / 动作组合
  const EXPR = [
    ['smile', '微笑', {}],
    ['shy', '害羞', { blush: 1.2, look: [0.3, 0.5] }],
    ['happy', '开心', { face: 'happy' }],
    ['excited', '兴奋', { face: 'open' }],
    ['yell', '大喊', { face: 'yell' }],
    ['love', '心动', { face: 'love', blush: 1 }],
    ['surprised', '惊讶', { face: 'o' }],
    ['scared', '害怕', { face: 'scared', brows: 'worried', sweat: true }],
    ['sad', '难过', { face: 'sad', blush: 0.2, look: [0, 0.6] }],
    ['cry', '哭', { face: 'cry', blush: 0.3 }], // 眼泪只在青蛙的大眼睛里画得出来
    ['sleep', '睡着', { face: 'sleep' }],
    ['flat', '无语', { face: 'flat', blush: 0, look: [0.8, 0] }],
    ['kiss', '亲亲', { face: 'kiss', blush: 1 }],
  ];
  ST.EXPRESSIONS = {
    frog: EXPR.map(([id, name, o]) => ({ id, name, o })),
    pig: EXPR.filter(([id]) => id !== 'cry').map(([id, name, o]) => ({ id, name, o })),
  };

  /* ---------- 姿势 ---------- */
  ST.POSES = {
    frog: [
      { id: 'front', name: '正面', o: {} },
      { id: 'back', name: '背面', o: { back: true } },
      { id: 'walk', name: '走路', o: { walk: 1.1, face: 'happy' } },
      { id: 'wave', name: '打招呼', o: { arms: 'wave', face: 'open', look: [0.4, -0.2] }, t: 0.12 },
      { id: 'cheer', name: '欢呼', o: { arms: 'cheer', face: 'open', look: [0, -0.5] } },
      { id: 'jump', name: '蹦起来', y: -34, o: { arms: 'up', face: 'open', squash: 1.06, look: [0, -0.5] } },
      { id: 'heart', name: '比心', o: { arms: 'heart', face: 'happy', blush: 1 } },
      { id: 'hug', name: '抱抱', o: { arms: 'hug', face: 'happy', blush: 1 } },
      { id: 'hands-on-hips', name: '叉腰', o: { arms: 'hip', face: 'smile', look: [0.5, -0.1] } },
      { id: 'phone', name: '看手机', o: { arms: 'phone', hold: ST.phone('#5f9a6e'), look: [0, 0.8], blush: 0.8 } },
      { id: 'scared', name: '吓得发抖', o: { arms: 'front', face: 'scared', brows: 'worried', sweat: true, shiver: 3 } },
      { id: 'painter', name: '贝雷帽', o: { acc: ST.ACC.beret, face: 'happy', arms: { l: 'down', r: [64, -76] } } },
    ],
    pig: [
      { id: 'front', name: '正面', o: {} },
      { id: 'back', name: '背面', o: { back: true } },
      { id: 'fly', name: '飞', o: { fly: true }, t: 0.3 },
      { id: 'walk', name: '走路', o: { walk: 1.1, face: 'happy' } },
      { id: 'wave', name: '打招呼', o: { fly: true, arms: 'wave', face: 'open', look: [-0.6, 0] }, t: 0.12 },
      { id: 'cheer', name: '欢呼', o: { arms: 'cheer', face: 'open', look: [0, -0.5] } },
      { id: 'jump', name: '蹦起来', y: -30, o: { arms: 'up', face: 'open', squash: 1.06 } },
      { id: 'heart', name: '比心', o: { arms: 'heart', face: 'love', blush: 1 } },
      { id: 'hug', name: '抱抱', o: { arms: 'hug', face: 'happy', blush: 1 } },
      { id: 'hands-on-hips', name: '叉腰', o: { arms: 'hip', face: 'smile', look: [-0.5, -0.1] } },
      { id: 'phone', name: '看手机', o: { arms: 'phone', hold: ST.phone('#e7849b'), look: [0, 0.8], blush: 0.8 } },
      { id: 'back-fly', name: '背面飞', o: { back: true, fly: true }, t: 0.3 },
    ],
  };

  /* ---------- 两人同框 ---------- */
  const F = (ctx, x, y, s, o, t) => CH.frog(ctx, x, y, s, Object.assign({ t, blink: false }, o));
  const G = (ctx, x, y, s, o, t) => CH.pig(ctx, x, y, s, Object.assign({ t, blink: false }, o));
  ST.DUO = [
    {
      id: 'lineup', name: '并排站', draw(ctx, t) {
        F(ctx, -95, 0, 1, { look: [0.6, 0] }, t);
        G(ctx, 95, 0, 1, { look: [-0.6, 0] }, t);
      },
    },
    {
      // 河边散步一场的牵手姿势
      id: 'hand-in-hand', name: '手牵手', draw(ctx, t) {
        F(ctx, -76, 0, 1, { walk: 0.5, arms: { l: 'down', r: [76, -32] }, face: 'happy', look: [1, 0], blush: 0.8 }, t);
        G(ctx, 76, 0, 1, { walk: 0.5 + Math.PI, arms: { l: [-76, -32], r: 'down' }, face: 'happy', look: [-1, 0], blush: 0.8 }, t);
      },
    },
    {
      // 10/20 一场的拥抱
      id: 'hug', name: '拥抱', draw(ctx, t) {
        G(ctx, 57, 0, 1, { arms: { l: [-104, -58], r: 'down' }, face: 'happy', look: [-1, 0], blush: 1 }, t);
        F(ctx, -58, 0, 1, { arms: { l: 'down', r: [112, -26] }, face: 'happy', look: [1, -0.2], blush: 1, squash: 0.97 }, t);
        P.heart(ctx, 0, -168, 16);
      },
    },
    {
      // 分叉的路一场：背影，手牵手
      id: 'walk-away', name: '背影', draw(ctx, t) {
        F(ctx, -95, 0, 1, { back: true, walk: 0.5, backArm: { l: [-60, -24], r: [76, -30] } }, t);
        G(ctx, 95, 0, 1, { back: true, walk: 0.5 + Math.PI, backArm: { l: [-76, -30], r: [60, -24] } }, t);
      },
    },
  ];

  /* ---------- 循环动画 ----------
   * 时长取各个周期运动（走路相位、扇翅膀、上下浮动、挥手）的公倍数，首尾可以无缝衔接。
   * t0 用来挑一个刚好在循环中间眨眼的时间段。 */
  ST.LOOPS = [
    { id: 'frog-idle', name: '青蛙 · 待机（眨眼）', who: 'frog', dur: 2, t0: 1.2, o: () => ({ blink: true }) },
    { id: 'frog-walk', name: '青蛙 · 走路', who: 'frog', dur: TAU / 3, o: (t) => ({ walk: t * 9, face: 'happy' }) },
    { id: 'frog-wave', name: '青蛙 · 打招呼', who: 'frog', dur: Math.PI, o: () => ({ arms: 'wave', face: 'open', look: [0.4, -0.2] }) },
    { id: 'frog-cheer', name: '青蛙 · 欢呼蹦跳', who: 'frog', dur: Math.PI, o: (t) => ({ arms: 'cheer', face: 'open', look: [0, -0.5], hop: Math.abs(Math.sin(t * 4)) * 26 }) },
    { id: 'pig-idle', name: '苍蝇猪 · 待机（扇翅膀、眨眼）', who: 'pig', dur: TAU / 3, o: () => ({ blink: true }) },
    { id: 'pig-fly', name: '苍蝇猪 · 飞', who: 'pig', dur: TAU, o: () => ({ fly: true, blink: true }) },
    { id: 'pig-walk', name: '苍蝇猪 · 走路', who: 'pig', dur: TAU / 3, o: (t) => ({ walk: t * 9, face: 'happy' }) },
    { id: 'pig-wave', name: '苍蝇猪 · 边飞边打招呼', who: 'pig', dur: TAU, o: () => ({ fly: true, arms: 'wave', face: 'open', look: [-0.6, 0] }) },
    {
      id: 'duo-walk', name: '手牵手散步', who: 'duo', dur: TAU / 3, draw(ctx, t) {
        F(ctx, -76, 0, 1, { walk: t * 6, arms: { l: 'down', r: [76, -32] }, face: 'happy', look: [1, 0], blush: 0.8 }, t);
        G(ctx, 76, 0, 1, { walk: t * 6 + Math.PI, arms: { l: [-76, -32], r: 'down' }, face: 'happy', look: [-1, 0], blush: 0.8 }, t);
      },
    },
    {
      id: 'duo-walk-away', name: '背影手牵手往前走', who: 'duo', dur: TAU / 3, draw(ctx, t) {
        F(ctx, -95, 0, 1, { back: true, walk: t * 6, backArm: { l: [-60, -24], r: [76, -30] } }, t);
        G(ctx, 95, 0, 1, { back: true, walk: t * 6 + Math.PI, backArm: { l: [-76, -30], r: [60, -24] } }, t);
      },
    },
  ];

  /* ---------- 绘制 ---------- */
  // 画一个角色：who = 'frog' | 'pig'
  ST.drawChar = function (ctx, who, x, y, s, o, t) {
    (who === 'frog' ? F : G)(ctx, x, y, s, o, t);
  };

  // 把 draw(ctx) 画到 canvas 上；box 为影片单位的画框，P 为每单位像素数
  // bg: null（透明）| 'paper'（纸色 + 纸纹）| 任意颜色
  ST.render = function (canvas, box, P, t, bg, draw) {
    const w = Math.round(box.w * P), h = Math.round(box.h * P);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    SK.pxScale = P;
    SK.beginFrame(t);
    ctx.setTransform(P, 0, 0, P, -box.x * P, -box.y * P);
    if (bg) {
      ctx.fillStyle = bg === 'paper' ? SK.PAPER : bg;
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }
    ctx.save();
    draw(ctx);
    ctx.restore();
    if (bg === 'paper') SK.paperOverlay(ctx, w, h, 0.7);
    return canvas;
  };

  // 渲染一个条目：kind = 'pose' | 'expression' | 'duo' | 'loop'
  ST.renderItem = function (canvas, kind, who, id, opt = {}) {
    const P = opt.P || 4;
    const bg = opt.bg || null;
    if (kind === 'duo') {
      const d = ST.DUO.find((x) => x.id === id);
      const t = opt.t == null ? 0 : opt.t;
      return ST.render(canvas, ST.DUO_BOX, P, t, bg, (ctx) => d.draw(ctx, t));
    }
    if (kind === 'loop') {
      const L = ST.LOOPS.find((x) => x.id === id);
      const lt = opt.t || 0;
      const t = (L.t0 || 0) + lt;
      const box = L.who === 'duo' ? ST.DUO_BOX : ST.BOX;
      return ST.render(canvas, box, P, t, bg, (ctx) => {
        if (L.draw) L.draw(ctx, t);
        else ST.drawChar(ctx, L.who, 0, 0, 1, L.o(t), t);
      });
    }
    const list = kind === 'expression' ? ST.EXPRESSIONS[who] : ST.POSES[who];
    const item = list.find((x) => x.id === id);
    const t = opt.t != null ? opt.t : item.t || 0;
    return ST.render(canvas, ST.BOX, P, t, bg, (ctx) => ST.drawChar(ctx, who, 0, item.y || 0, 1, item.o, t));
  };

  /* ---------- 设定图 ---------- */
  const NAMES = { frog: ['青蛙', 'Froggy'], pig: ['苍蝇猪', 'Piggy'] };
  const NOTES = {
    frog: [
      '草绿色、矮墩墩的梨形身体 + 奶油色椭圆肚皮，身上几块深绿斑点',
      '头顶两只凸起的大眼睛：左大右小，两只眼睛看的方向略不一样',
      '超宽的笑嘴，嘴角各有一道小短线；粉色腮红；三根圆指头',
    ],
    pig: [
      '粉色圆滚滚的身体，大大的椭圆猪鼻子，头顶一根卷呆毛',
      '小豆豆眼一大一小；嘴角露一颗小虎牙；螺旋小尾巴；短腿带蹄子',
      '背上一对透明淡蓝的苍蝇翅膀（有翅脉），会嗡嗡地飞',
    ],
  };
  const PALETTE = {
    frog: [
      ['身体', CH.FROG.body],
      ['阴影 / 斑点', CH.FROG.dark],
      ['肚皮', CH.FROG.belly],
      ['腮红 55%', '#ff7891'],
      ['嘴巴', '#83343a'],
      ['墨线', SK.INK],
    ],
    pig: [
      ['身体', CH.PIG.body],
      ['阴影 / 耳内', CH.PIG.dark],
      ['鼻子', CH.PIG.snout],
      ['鼻孔', CH.PIG.nostril],
      ['蹄子', CH.PIG.hoof],
      ['翅膀', '#cdecff'],
      ['翅脉', CH.PIG.wingLine],
      ['墨线', SK.INK],
    ],
  };
  ST.PALETTE = PALETTE;
  ST.NOTES = NOTES;
  ST.NAMES = NAMES;

  const label = (ctx, str, x, y, size = 24, color = SK.INK, align) =>
    SK.text(ctx, str, x, y, { size, color, align, jitter: 0.6 });

  function title(ctx, who, x, y, sub) {
    const [zh, en] = NAMES[who] || who;
    const col = who === 'frog' ? '#5d8f35' : who === 'pig' ? '#d9718a' : SK.INK;
    const w = SK.text(ctx, zh, x, y, { size: 64, color: col, align: 'left', outline: '#fffaf0', outlineW: 8 });
    SK.text(ctx, en, x + w + 20, y + 8, { size: 44, font: SK.FONT_EN, weight: 'bold', color: SK.INK, align: 'left' });
    if (sub) label(ctx, sub, x + 2, y + 52, 22, '#8a7468', 'left');
  }

  // 圆角卡片 + 头像特写
  function faceCard(ctx, who, x, y, w, h, o, name, t) {
    const card = SK.rrect(x, y, w, h, 18);
    shape(ctx, card, { fill: who === 'frog' ? '#eef6dd' : '#fde9ee', lw: 2.2, tex: 0.1, seed: x * 0.13 + y * 0.07, boil: false });
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 3, y + 3, w - 6, h - 6);
    ctx.clip();
    const s = 1.22;
    ST.drawChar(ctx, who, x + w / 2, y + h / 2 + (who === 'frog' ? 78 : 72) * s, s, o, t);
    ctx.restore();
    label(ctx, name, x + w / 2, y + h + 22, 22);
  }

  function swatches(ctx, who, x, y, cols) {
    const list = PALETTE[who];
    list.forEach(([name, hex], i) => {
      const cx = x + (i % cols) * 178, cy = y + Math.floor(i / cols) * 74;
      shape(ctx, SK.circ(cx + 22, cy, 22), { fill: hex === '#cdecff' ? 'rgba(205,236,255,0.9)' : hex, lw: 2.2, tex: 0.1, boil: false, seed: i + 3 });
      label(ctx, name, cx + 54, cy - 11, 19, SK.INK, 'left');
      SK.text(ctx, hex, cx + 54, cy + 14, { size: 22, font: SK.FONT_EN, weight: 'bold', color: '#8a7468', align: 'left', jitter: 0.3 });
    });
  }

  ST.SHEETS = {
    // 单个角色设定图：正面大图 + 背面 + 动作 + 表情 + 色板
    frog: { w: 1600, h: 1000, draw: (ctx, t) => modelSheet(ctx, 'frog', t) },
    pig: { w: 1600, h: 1000, draw: (ctx, t) => modelSheet(ctx, 'pig', t) },
    poses: { w: 1600, h: 1260, draw: posesSheet },
    together: { w: 1600, h: 900, draw: togetherSheet },
  };

  function modelSheet(ctx, who, t) {
    title(ctx, who, 64, 76, null);
    NOTES[who].forEach((s, i) => label(ctx, '· ' + s, 66, 140 + i * 32, 21, '#6b564b', 'left'));
    const big = who === 'frog' ? 2.9 : 2.45;
    ST.drawChar(ctx, who, 300, 860, big, { look: who === 'frog' ? [0.15, 0.1] : [0, 0] }, t);
    label(ctx, '正面', 300, 920, 26);
    const side = who === 'frog' ? [{ back: true }, '背面', { walk: 1.1, face: 'happy' }, '走路'] : [{ back: true }, '背面', { fly: true }, '飞'];
    ST.drawChar(ctx, who, 715, 520, 1.3, side[0], t);
    label(ctx, side[1], 715, 560, 24);
    ST.drawChar(ctx, who, 715, 870, 1.3, side[2], t + 0.3);
    label(ctx, side[3], 715, 910, 24);
    // 表情
    label(ctx, '表情', 870, 178, 26, '#8a7468', 'left');
    const ex = ST.EXPRESSIONS[who].slice(0, 12);
    ex.forEach((e, i) => {
      const c = i % 4, r = Math.floor(i / 4);
      faceCard(ctx, who, 870 + c * 177, 205 + r * 200, 165, 150, e.o, e.name, t);
    });
    swatches(ctx, who, 880, who === 'frog' ? 850 : 828, 4);
  }

  function posesSheet(ctx, t) {
    SK.text(ctx, '动作', 64, 70, { size: 60, align: 'left' });
    SK.text(ctx, 'Poses', 200, 78, { size: 42, font: SK.FONT_EN, weight: 'bold', align: 'left' });
    ['frog', 'pig'].forEach((who, wi) => {
      ST.POSES[who].forEach((p, i) => {
        const c = i % 6, r = wi * 2 + Math.floor(i / 6);
        const x = 140 + c * 264, y = 330 + r * 268;
        ST.drawChar(ctx, who, x, y + (p.y || 0) * 1.08, 1.08, p.o, p.t != null ? p.t : t);
        label(ctx, p.name, x, y + 34, 22);
      });
    });
  }

  function togetherSheet(ctx, t) {
    SK.text(ctx, '青蛙 ♥ 苍蝇猪', 64, 70, { size: 58, align: 'left' });
    label(ctx, '两个人差不多高；苍蝇猪带上翅膀更宽一些', 66, 124, 22, '#8a7468', 'left');
    // 身高参考线
    const s = 2.6, base = 790;
    ctx.save();
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(59,42,36,0.25)';
    ctx.lineWidth = 2;
    [0, -100, -128].forEach((u) => {
      ctx.beginPath();
      ctx.moveTo(90, base + u * s);
      ctx.lineTo(1150, base + u * s);
      ctx.stroke();
    });
    ctx.restore();
    ST.drawChar(ctx, 'frog', 300, base, s, { look: [0.6, 0] }, t);
    ST.drawChar(ctx, 'pig', 830, base, s, { look: [-0.6, 0] }, t);
    label(ctx, '青蛙', 300, base + 6 + 34, 26);
    label(ctx, '苍蝇猪', 830, base + 6 + 34, 26);
    const duo = (id, x, y, sc, name) => {
      const d = ST.DUO.find((q) => q.id === id);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);
      d.draw(ctx, t);
      ctx.restore();
      label(ctx, name, x, y + 34, 24);
    };
    duo('hand-in-hand', 1370, 400, 1, '手牵手');
    duo('hug', 1370, 770, 1, '拥抱');
  }

  ST.renderSheet = function (canvas, id, P = 2, t = 0) {
    const S = ST.SHEETS[id];
    return ST.render(canvas, { x: 0, y: 0, w: S.w, h: S.h }, P, t, 'paper', (ctx) => S.draw(ctx, t));
  };

  // 纯净参考图（纸色背景、无文字），给 AI 视频 / 图生视频当角色参考
  ST.REFS = [
    { id: 'frog', box: { x: -170, y: -190, w: 340, h: 220 }, draw: (ctx, t) => F(ctx, 0, 0, 1, {}, t) },
    { id: 'pig', box: { x: -170, y: -190, w: 340, h: 220 }, draw: (ctx, t) => G(ctx, 0, 0, 1, {}, t) },
    { id: 'pig-flying', box: { x: -170, y: -200, w: 340, h: 220 }, draw: (ctx, t) => G(ctx, 0, 0, 1, { fly: true }, 0.3) },
    { id: 'frog-back', box: { x: -170, y: -190, w: 340, h: 220 }, draw: (ctx, t) => F(ctx, 0, 0, 1, { back: true }, t) },
    { id: 'pig-back', box: { x: -170, y: -190, w: 340, h: 220 }, draw: (ctx, t) => G(ctx, 0, 0, 1, { back: true }, t) },
    { id: 'frog-and-pig', box: { x: -300, y: -195, w: 600, h: 230 }, draw: (ctx, t) => ST.DUO[0].draw(ctx, t) },
  ];
  ST.renderRef = function (canvas, id, P = 4, t = 0) {
    const R = ST.REFS.find((r) => r.id === id);
    return ST.render(canvas, R.box, P, t, 'paper', (ctx) => R.draw(ctx, t));
  };
})();
