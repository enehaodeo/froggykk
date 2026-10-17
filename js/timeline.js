/* 时间轴：画面与音乐共用，保证音效与动作对齐。
 * 整部片子用同一个速度：100 BPM，一小节 2.4 秒。 */
(function () {
  const TL = (window.TL = {});
  TL.BPM = 100;
  TL.BEAT = 60 / TL.BPM;
  TL.BAR = TL.BEAT * 4;

  // [场景 id, 小节数]
  const LIST = [
    ['title', 3],
    ['campus', 6],
    ['chat', 6],
    ['universal', 5],
    ['night', 5],
    ['dream', 5],
    ['d1019', 6],
    ['d1020', 5],
    ['escape', 2.5],
    ['travel', 3],
    ['bday', 3.5],
    ['ocean', 2.5],
    ['badminton', 2.5],
    ['wizard', 3],
    ['seasons', 3],
    ['plaster', 4],
    ['food', 4],
    ['movie', 4],
    ['game', 3],
    ['river', 4],
    ['dive', 2],
    ['heart', 10],
    ['rise', 2.5],
    ['road', 7],
    ['end', 3],
  ];
  let acc = 0;
  TL.scenes = LIST.map(([id, bars]) => {
    const s = { id, bars, startBar: acc, start: acc * TL.BAR, dur: bars * TL.BAR };
    acc += bars;
    return s;
  });
  TL.totalBars = acc;
  TL.duration = acc * TL.BAR + 1.6; // 结尾留一点余音
  TL.byId = {};
  TL.scenes.forEach((s) => (TL.byId[s.id] = s));

  /* ---------- 各场景的关键时间点（相对场景开始，秒） ---------- */
  const C = (TL.cue = {});

  C.campus = { bump: 4.2, look: 6.0, touch: 9.0, thump: [10.8, 12.0] };

  // 互发消息：越来越频繁
  const msgs = [];
  const texts = {
    F: ['你好呀', '吃饭了吗', '在干嘛', '嘿嘿', '哈哈哈哈', '!!!', '嘻嘻', '冲!', '晚点聊?', '好耶'],
    P: ['嗨~', '哈哈哈', '好呀!', '不困!', '笑死', '好耶', '嘿', '真的吗', '哈哈'],
  };
  let t = 1.0, gap = 1.6, fi = 0, pi = 0, k = 0;
  while (t < 12.4) {
    const from = k % 2 === 0 ? 'F' : 'P';
    let kind = 'text';
    if (k >= 5 && k % 3 === 2) kind = 'sticker';
    if (k >= 9 && k % 3 === 0) kind = 'heart';
    const m = { t: +t.toFixed(3), from, kind };
    if (kind === 'text') m.text = from === 'F' ? texts.F[fi++ % texts.F.length] : texts.P[pi++ % texts.P.length];
    msgs.push(m);
    t += gap;
    gap = Math.max(0.15, gap * 0.82);
    k++;
  }
  C.chat = { msgs, flight: 1.0 };

  C.universal = { selfie: 4.0, flash: 5.0, fly: 5.6, land: 7.2 };
  C.night = { send: 2.0, star: [3.8, 5.6], read: 6.6, lightsOff: 8.2 };
  C.dream = { turn: 3.6, heart: 5.0, catch: 7.4 };
  C.d1019 = { msgs: [3.0, 3.9, 4.8, 5.7, 6.6, 7.5], yesno: 8.4, burst: 9.6 };
  C.d1020 = { tear: 0.6, yes: 3.0, hug: 6.0, iris: 10.6 };
  C.escape = { scare: 2.6 };
  C.travel = { shots: [1.4, 3.2, 5.0] };
  C.bday = { blow: 3.5, scare: 6.4 };
  C.badminton = { hits: [0.5, 1.4, 2.3, 3.3], land: 3.75 };
  C.wizard = { spell: 3.0, flash: 5.2 };
  C.plaster = { done: 5.2, love: 6.4 };
  C.food = { bites: [1.6, 2.6], grabs: [5.6, 6.3, 7.0, 7.7, 8.4] };
  C.movie = { lean: 3.0 };
  C.game = { win: 4.2 };
  C.heart = {
    cracks: [3.0, 6.6, 10.2, 13.8],
    tapes: [4.2, 7.6, 8.2, 11.2, 11.8, 12.4, 14.8],
    wrap: [16.0, 21.0],
  };
  C.rise = { flips: [2.2, 4.2], land: 4.4 };
})();
