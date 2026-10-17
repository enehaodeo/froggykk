/* 配乐：全部用 Web Audio 合成（尤克里里感的拨弦、八音盒/钟琴、柔和铺底、钢琴、轻打击乐和音效），
 * 按 timeline.js 的场景与关键时间点编排。用 OfflineAudioContext 渲染成一整段音频。 */
(function () {
  const M = (window.MUSIC = {});
  const BEAT = TL.BEAT, BAR = TL.BAR;

  /* ---------------- 音高工具 ---------------- */
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function n(name) {
    if (typeof name === 'number') return name;
    const m = /^([A-G])(b|#)?(-?\d)$/.exec(name);
    return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0);
  }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const CH = {
    F: { v: ['A3', 'C4', 'F4'], b: 'F2' },
    'F/A': { v: ['A3', 'C4', 'F4'], b: 'A2' },
    'F/C': { v: ['A3', 'C4', 'F4'], b: 'C3' },
    Fmaj7: { v: ['A3', 'C4', 'E4', 'F4'], b: 'F2' },
    Fsus: { v: ['Bb3', 'C4', 'F4'], b: 'F2' },
    C: { v: ['G3', 'C4', 'E4'], b: 'C3' },
    'C/E': { v: ['G3', 'C4', 'E4'], b: 'E2' },
    C7: { v: ['G3', 'Bb3', 'E4'], b: 'C3' },
    Csus: { v: ['G3', 'C4', 'F4'], b: 'C3' },
    Dm: { v: ['A3', 'D4', 'F4'], b: 'D3' },
    Dm7: { v: ['A3', 'C4', 'F4'], b: 'D3' },
    Bb: { v: ['Bb3', 'D4', 'F4'], b: 'Bb2' },
    Bbmaj7: { v: ['A3', 'D4', 'F4'], b: 'Bb2' },
    Gm: { v: ['G3', 'Bb3', 'D4'], b: 'G2' },
    Gm7: { v: ['F3', 'Bb3', 'D4'], b: 'G2' },
    Am: { v: ['A3', 'C4', 'E4'], b: 'A2' },
    Am7: { v: ['G3', 'C4', 'E4'], b: 'A2' },
    G: { v: ['G3', 'B3', 'D4'], b: 'G2' },
    A: { v: ['A3', 'C#4', 'E4'], b: 'A2' },
    A7: { v: ['G3', 'C#4', 'E4'], b: 'A2' },
    'Bb/D': { v: ['Bb3', 'D4', 'F4'], b: 'D3' },
    Ddim: { v: ['Ab3', 'D4', 'F4'], b: 'D3' },
  };
  const chordNotes = (c) => CH[c].v.map(n);
  const chordBass = (c) => n(CH[c].b);

  /* ---------------- 旋律 ---------------- */
  const THEME_A = [
    [['F4', 0.5], ['A4', 0.5], ['C5', 1], ['A4', 0.5], ['C5', 0.5], ['F5', 1]],
    [['E5', 1], ['D5', 0.5], ['C5', 0.5], ['G4', 2]],
    [['A4', 0.5], ['D5', 0.5], ['F5', 1], ['E5', 0.5], ['D5', 0.5], ['A4', 1]],
    [['Bb4', 1], ['C5', 0.5], ['D5', 0.5], ['C5', 2]],
    [['F4', 0.5], ['A4', 0.5], ['C5', 1], ['A4', 0.5], ['C5', 0.5], ['F5', 1]],
    [['G5', 1], ['F5', 0.5], ['E5', 0.5], ['D5', 1], ['C5', 1]],
    [['D5', 0.5], ['C5', 0.5], ['Bb4', 0.5], ['A4', 0.5], ['G4', 1], ['C5', 1]],
    [['A4', 1], ['G4', 1], ['F4', 2]],
  ];
  const CHORDS_A = ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', [['C', 2], ['F', 2]]];
  const THEME_B = [
    [['D5', 1], ['F5', 1], ['D5', 0.5], ['C5', 0.5], ['Bb4', 1]],
    [['C5', 1], ['E5', 1], ['G5', 2]],
    [['E5', 0.5], ['F5', 0.5], ['E5', 0.5], ['C5', 0.5], ['A4', 2]],
    [['D5', 1], ['F5', 0.5], ['A5', 0.5], ['F5', 2]],
    [['G5', 1], ['F5', 0.5], ['D5', 0.5], ['Bb4', 1], ['D5', 1]],
    [['C5', 0.5], ['E5', 0.5], ['G5', 1], ['Bb5', 1], ['G5', 1]],
    [['A5', 1.5], ['G5', 0.5], ['F5', 1], ['C5', 1]],
    [['F5', 3], ['r', 1]],
  ];
  const CHORDS_B = ['Bb', 'C', 'Am', 'Dm', 'Gm', 'C7', 'F', 'F'];
  const LULLABY = [
    [['A4', 1.5], ['Bb4', 0.5], ['C5', 2]],
    [['E5', 1.5], ['D5', 0.5], ['C5', 2]],
    [['D5', 1], ['C5', 1], ['Bb4', 1], ['A4', 1]],
    [['G4', 2], ['C5', 2]],
    [['F4', 4]],
  ];
  const DREAM = [
    [['F5', 2], ['E5', 1], ['D5', 1]],
    [['C5', 2], ['A4', 2]],
    [['Bb4', 1], ['D5', 1], ['F5', 1], ['A5', 1]],
    [['G5', 4]],
    [['A5', 4]],
  ];
  const MOVIE = [
    [['A5', 2], ['G5', 1], ['F5', 1]],
    [['E5', 2], ['C5', 2]],
    [['D5', 1], ['F5', 1], ['A5', 1], ['C6', 1]],
    [['Bb5', 2], ['A5', 1], ['G5', 1]],
  ];

  /* ---------------- 合成器 ---------------- */
  M.build = function (ac) {
    const T0 = 0.05; // 留一点点前置
    const noiseBuf = (() => {
      const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = b.getChannelData(0);
      let s = 12345;
      for (let i = 0; i < d.length; i++) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        d[i] = (s / 0x7fffffff) * 2 - 1;
      }
      return b;
    })();
    const ir = (() => {
      const len = Math.floor(ac.sampleRate * 2.6);
      const b = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        let s = 777 + c * 31;
        for (let i = 0; i < len; i++) {
          s = (s * 1103515245 + 12345) & 0x7fffffff;
          const r = (s / 0x7fffffff) * 2 - 1;
          const k = i / len;
          d[i] = r * Math.pow(1 - k, 2.2) * (i < 400 ? i / 400 : 1);
        }
      }
      return b;
    })();

    const master = ac.createGain();
    master.gain.value = 1.0;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 10;
    comp.ratio.value = 3;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    const limit = ac.createDynamicsCompressor();
    limit.threshold.value = -3;
    limit.knee.value = 0;
    limit.ratio.value = 20;
    limit.attack.value = 0.001;
    limit.release.value = 0.1;
    master.connect(comp);
    comp.connect(limit);
    limit.connect(ac.destination);
    const rev = ac.createConvolver();
    rev.buffer = ir;
    const revOut = ac.createGain();
    revOut.gain.value = 0.32;
    rev.connect(revOut);
    revOut.connect(master);

    function channel(vol, pan = 0, send = 0.2) {
      const g = ac.createGain();
      g.gain.value = vol;
      const p = ac.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      p.connect(master);
      if (send) {
        const s = ac.createGain();
        s.gain.value = send;
        p.connect(s);
        s.connect(rev);
      }
      return g;
    }
    const ch = {
      mel: channel(0.9, 0.05, 0.45),
      mel2: channel(0.7, -0.1, 0.5),
      pluck: channel(0.75, -0.18, 0.28),
      pad: channel(0.55, 0.1, 0.6),
      bass: channel(0.95, 0, 0.04),
      drum: channel(0.9, 0, 0.08),
      perc: channel(0.6, 0.25, 0.1),
      sfx: channel(0.9, 0, 0.25),
      piano: channel(0.8, 0, 0.5),
      chip: channel(0.95, 0, 0.12),
    };

    const osc = (type, f, t, stop) => {
      const o = ac.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f, t);
      o.start(t);
      o.stop(stop);
      return o;
    };
    const gainEnv = (t, a, peak, d, out) => {
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0008, t + a + d);
      g.connect(out);
      return g;
    };
    const noise = (t, dur) => {
      const s = ac.createBufferSource();
      s.buffer = noiseBuf;
      s.loop = true;
      s.start(t, (t * 7.31) % 1.5);
      s.stop(t + dur);
      return s;
    };
    const filt = (type, f, q, t) => {
      const b = ac.createBiquadFilter();
      b.type = type;
      b.frequency.setValueAtTime(f, t);
      b.Q.value = q;
      return b;
    };

    /* ----- 乐器 ----- */
    const I = {};
    I.pluck = (t, m, dur, vel = 0.7, out = ch.pluck) => {
      const f = mtof(n(m));
      const end = t + Math.max(0.3, dur) + 0.6;
      const lp = filt('lowpass', 1800 + vel * 2200, 0.8, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + 0.35);
      const env = gainEnv(t, 0.004, 0.22 * vel, Math.max(0.35, dur) + 0.45, out);
      lp.connect(env);
      osc('triangle', f, t, end).connect(lp);
      const g2 = ac.createGain();
      g2.gain.value = 0.22;
      osc('sawtooth', f * 1.002, t, end).connect(g2);
      g2.connect(lp);
    };
    I.bell = (t, m, dur, vel = 0.7, out = ch.mel) => {
      const f = mtof(n(m));
      const parts = [[1, 1, 1.6], [2, 0.16, 0.6], [3, 0.06, 0.25], [5.4, 0.05, 0.08]];
      parts.forEach(([mul, a, d]) => {
        const e = gainEnv(t, 0.002, 0.2 * vel * a, d + dur * 0.3, out);
        osc('sine', f * mul, t, t + d + dur * 0.3 + 0.1).connect(e);
      });
    };
    I.celesta = (t, m, dur, vel = 0.6, out = ch.mel2) => {
      const f = mtof(n(m));
      [[1, 1, 1.2], [2, 0.3, 0.45], [4, 0.05, 0.12]].forEach(([mul, a, d]) => {
        const e = gainEnv(t, 0.006, 0.17 * vel * a, d + dur * 0.2, out);
        osc('sine', f * mul, t, t + d + dur * 0.2 + 0.1).connect(e);
      });
    };
    I.piano = (t, m, dur, vel = 0.6, out = ch.piano) => {
      const f = mtof(n(m));
      const end = t + dur + 1.6;
      const lp = filt('lowpass', 1800 + vel * 2200, 0.5, t);
      lp.frequency.exponentialRampToValueAtTime(900, t + 1.2);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2 * vel, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.07 * vel, t + 0.4);
      g.gain.setTargetAtTime(0.0008, t + dur, 0.35);
      lp.connect(g);
      g.connect(out);
      osc('triangle', f, t, end).connect(lp);
      const g2 = ac.createGain();
      g2.gain.value = 0.3;
      osc('sine', f * 2, t, end).connect(g2);
      g2.connect(lp);
      const g3 = ac.createGain();
      g3.gain.value = 0.08;
      osc('sine', f * 3, t, end).connect(g3);
      g3.connect(lp);
    };
    I.pad = (t, m, dur, vel = 0.5, out = ch.pad, cutoff = 1100) => {
      const f = mtof(n(m));
      const a = Math.min(0.6, dur * 0.3), r = 0.9;
      const end = t + dur + r + 0.1;
      const lp = filt('lowpass', cutoff, 0.4, t);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06 * vel, t + a);
      g.gain.setValueAtTime(0.06 * vel, t + dur);
      g.gain.linearRampToValueAtTime(0, t + dur + r);
      lp.connect(g);
      g.connect(out);
      [-0.004, 0.004].forEach((dt) => osc('sawtooth', f * (1 + dt), t, end).connect(lp));
      const s = ac.createGain();
      s.gain.value = 0.6;
      osc('sine', f / 2, t, end).connect(s);
      s.connect(lp);
    };
    I.bass = (t, m, dur, vel = 0.8, out = ch.bass) => {
      const f = mtof(n(m));
      const end = t + dur + 0.2;
      const lp = filt('lowpass', 700, 0.7, t);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.32 * vel, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.18 * vel, t + 0.2);
      g.gain.setValueAtTime(0.18 * vel, t + dur * 0.9);
      g.gain.linearRampToValueAtTime(0, t + dur + 0.1);
      lp.connect(g);
      g.connect(out);
      osc('triangle', f, t, end).connect(lp);
      const s = ac.createGain();
      s.gain.value = 0.7;
      osc('sine', f, t, end).connect(s);
      s.connect(lp);
    };
    I.square = (t, m, dur, vel = 0.6, out = ch.chip) => {
      const f = mtof(n(m));
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12 * vel, t + 0.005);
      g.gain.setValueAtTime(0.1 * vel, t + dur * 0.85);
      g.gain.linearRampToValueAtTime(0, t + dur * 0.95);
      g.connect(out);
      const lp = filt('lowpass', 3200, 0.5, t);
      lp.connect(g);
      osc('square', f, t, t + dur + 0.05).connect(lp);
    };
    // 打击乐
    I.kick = (t, vel = 0.9, low = false) => {
      const o = osc('sine', low ? 95 : 150, t, t + 0.5);
      o.frequency.exponentialRampToValueAtTime(low ? 38 : 46, t + (low ? 0.2 : 0.12));
      o.connect(gainEnv(t, 0.002, 0.7 * vel, low ? 0.42 : 0.32, ch.drum));
    };
    I.snare = (t, vel = 0.6) => {
      const s = noise(t, 0.25);
      const bp = filt('bandpass', 1900, 0.7, t);
      s.connect(bp);
      bp.connect(gainEnv(t, 0.001, 0.28 * vel, 0.16, ch.drum));
      osc('triangle', 190, t, t + 0.15).connect(gainEnv(t, 0.001, 0.18 * vel, 0.09, ch.drum));
    };
    I.clap = (t, vel = 0.6) => {
      [0, 0.011, 0.023].forEach((d, i) => {
        const s = noise(t + d, 0.2);
        const bp = filt('bandpass', 1400, 1.2, t + d);
        s.connect(bp);
        bp.connect(gainEnv(t + d, 0.001, 0.3 * vel, i === 2 ? 0.14 : 0.02, ch.drum));
      });
    };
    I.shaker = (t, vel = 0.4) => {
      const s = noise(t, 0.12);
      const bp = filt('bandpass', 6500, 1.0, t);
      s.connect(bp);
      bp.connect(gainEnv(t, 0.012, 0.12 * vel, 0.06, ch.perc));
    };
    I.hat = (t, vel = 0.4) => {
      const s = noise(t, 0.08);
      const hp = filt('highpass', 8000, 0.7, t);
      s.connect(hp);
      hp.connect(gainEnv(t, 0.001, 0.12 * vel, 0.035, ch.perc));
    };
    I.crash = (t, vel = 0.5) => {
      const s = noise(t, 2);
      const hp = filt('highpass', 4500, 0.5, t);
      s.connect(hp);
      hp.connect(gainEnv(t, 0.002, 0.14 * vel, 1.4, ch.perc));
    };
    I.heartbeat = (t, vel = 0.8) => {
      I.kick(t, vel, true);
      I.kick(t + 0.22, vel * 0.65, true);
    };

    /* ----- 音效 ----- */
    const X = {};
    X.pop = (t, pitch = 1, vel = 0.6) => {
      const o = osc('sine', 420 * pitch, t, t + 0.2);
      o.frequency.exponentialRampToValueAtTime(980 * pitch, t + 0.05);
      o.connect(gainEnv(t, 0.002, 0.3 * vel, 0.12, ch.sfx));
    };
    X.ding = (t, m = 'C6', vel = 0.7) => I.bell(t, m, 0.4, vel, ch.sfx);
    X.whoosh = (t, dur = 0.5, up = true, vel = 0.6) => {
      const s = noise(t, dur + 0.1);
      const bp = filt('bandpass', up ? 400 : 3000, 1.4, t);
      bp.frequency.exponentialRampToValueAtTime(up ? 3200 : 300, t + dur);
      s.connect(bp);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35 * vel, t + dur * 0.5);
      g.gain.linearRampToValueAtTime(0, t + dur);
      bp.connect(g);
      g.connect(ch.sfx);
    };
    X.slide = (t, f0, f1, dur, vel = 0.5) => {
      const o = osc('sine', f0, t, t + dur + 0.05);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const lfo = osc('sine', 9, t, t + dur + 0.05);
      const lg = ac.createGain();
      lg.gain.value = f0 * 0.03;
      lfo.connect(lg);
      lg.connect(o.frequency);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18 * vel, t + 0.03);
      g.gain.setValueAtTime(0.18 * vel, t + dur * 0.8);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g);
      g.connect(ch.sfx);
    };
    X.boing = (t, vel = 0.6) => {
      const o = osc('sine', 180, t, t + 0.6);
      o.frequency.exponentialRampToValueAtTime(520, t + 0.08);
      o.frequency.exponentialRampToValueAtTime(260, t + 0.5);
      const lfo = osc('sine', 18, t, t + 0.6);
      const lg = ac.createGain();
      lg.gain.setValueAtTime(40, t);
      lg.gain.linearRampToValueAtTime(0, t + 0.5);
      lfo.connect(lg);
      lg.connect(o.frequency);
      o.connect(gainEnv(t, 0.004, 0.32 * vel, 0.5, ch.sfx));
    };
    X.bonk = (t, vel = 0.8) => {
      osc('sine', 720, t, t + 0.2).connect(gainEnv(t, 0.001, 0.4 * vel, 0.09, ch.sfx));
      osc('triangle', 360, t, t + 0.3).connect(gainEnv(t, 0.001, 0.3 * vel, 0.16, ch.sfx));
      I.kick(t, vel * 0.7);
    };
    X.shutter = (t, vel = 0.6) => {
      [0, 0.07].forEach((d) => {
        const s = noise(t + d, 0.05);
        const hp = filt('highpass', 2500, 0.8, t + d);
        s.connect(hp);
        hp.connect(gainEnv(t + d, 0.001, 0.35 * vel, 0.025, ch.sfx));
      });
    };
    X.crack = (t, big = false, vel = 0.8) => {
      for (let i = 0; i < (big ? 6 : 3); i++) {
        const d = i * 0.018 + (i % 2) * 0.006;
        const s = noise(t + d, 0.08);
        const hp = filt('bandpass', 2600 - i * 200, 1.5, t + d);
        s.connect(hp);
        hp.connect(gainEnv(t + d, 0.001, 0.4 * vel, 0.05, ch.sfx));
      }
      const o = osc('sine', big ? 70 : 110, t, t + 0.8);
      o.frequency.exponentialRampToValueAtTime(big ? 32 : 55, t + 0.5);
      o.connect(gainEnv(t, 0.002, (big ? 0.6 : 0.35) * vel, big ? 0.7 : 0.35, ch.sfx));
    };
    X.tape = (t, dur = 0.32, vel = 0.6) => {
      const s = noise(t, dur + 0.05);
      const bp = filt('bandpass', 1100, 2.5, t);
      bp.frequency.linearRampToValueAtTime(1700, t + dur);
      s.connect(bp);
      const am = ac.createGain();
      am.gain.value = 0;
      const lfo = osc('square', 46, t, t + dur + 0.05);
      const lg = ac.createGain();
      lg.gain.value = 0.5;
      lfo.connect(lg);
      lg.connect(am.gain);
      bp.connect(am);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5 * vel, t + 0.03);
      g.gain.setValueAtTime(0.5 * vel, t + dur * 0.7);
      g.gain.linearRampToValueAtTime(0, t + dur);
      am.connect(g);
      g.connect(ch.sfx);
      // 贴上去的“啪”
      const s2 = noise(t + dur, 0.06);
      const lp = filt('lowpass', 1200, 0.7, t + dur);
      s2.connect(lp);
      lp.connect(gainEnv(t + dur, 0.001, 0.35 * vel, 0.05, ch.sfx));
    };
    X.gliss = (t, notes, step = 0.05, vel = 0.5, inst = 'bell') => notes.forEach((m, i) => I[inst](t + i * step, m, 0.3, vel, ch.sfx));
    X.sparkle = (t, vel = 0.5) => X.gliss(t, ['C6', 'E6', 'G6', 'C7'], 0.045, vel);
    X.crunch = (t, vel = 0.6) => {
      for (let i = 0; i < 4; i++) {
        const d = i * 0.045;
        const s = noise(t + d, 0.05);
        const bp = filt('bandpass', 2400 + i * 300, 1.2, t + d);
        s.connect(bp);
        bp.connect(gainEnv(t + d, 0.001, 0.3 * vel, 0.03, ch.sfx));
      }
    };
    X.click = (t, vel = 0.5) => {
      osc('sine', 2200, t, t + 0.04).connect(gainEnv(t, 0.001, 0.2 * vel, 0.02, ch.sfx));
      const s = noise(t, 0.03);
      s.connect(gainEnv(t, 0.001, 0.15 * vel, 0.01, ch.sfx));
    };
    X.hoot = (t, vel = 0.5) => {
      [0, 0.32].forEach((d) => {
        const o = osc('sine', 520, t + d, t + d + 0.3);
        o.frequency.exponentialRampToValueAtTime(440, t + d + 0.25);
        o.connect(gainEnv(t + d, 0.04, 0.2 * vel, 0.22, ch.sfx));
      });
    };
    X.boo = (t, vel = 0.7) => {
      const o = osc('sawtooth', 130, t, t + 0.9);
      o.frequency.linearRampToValueAtTime(90, t + 0.8);
      const lfo = osc('sine', 7, t, t + 0.9);
      const lg = ac.createGain();
      lg.gain.value = 10;
      lfo.connect(lg);
      lg.connect(o.frequency);
      const lp = filt('lowpass', 900, 1, t);
      o.connect(lp);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25 * vel, t + 0.08);
      g.gain.linearRampToValueAtTime(0, t + 0.85);
      lp.connect(g);
      g.connect(ch.sfx);
    };
    X.stinger = (t, vel = 0.8) => {
      ['D3', 'Ab3', 'Db4', 'G4', 'D5'].forEach((m) => {
        I.pluck(t, m, 0.5, vel);
        I.pad(t, m, 0.8, vel * 1.2, ch.sfx, 2000);
      });
      I.crash(t, vel);
      I.kick(t, vel, true);
    };
    X.blow = (t, vel = 0.6) => {
      const s = noise(t, 0.6);
      const bp = filt('bandpass', 900, 0.6, t);
      s.connect(bp);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3 * vel, t + 0.08);
      g.gain.linearRampToValueAtTime(0, t + 0.5);
      bp.connect(g);
      g.connect(ch.sfx);
    };
    X.hit = (t, vel = 0.6) => {
      const s = noise(t, 0.05);
      const bp = filt('bandpass', 1500, 2, t);
      s.connect(bp);
      bp.connect(gainEnv(t, 0.001, 0.4 * vel, 0.03, ch.sfx));
      osc('sine', 980, t, t + 0.1).connect(gainEnv(t, 0.001, 0.22 * vel, 0.05, ch.sfx));
    };
    X.flip = (t, vel = 0.4) => {
      const s = noise(t, 0.08);
      const bp = filt('bandpass', 3000, 0.8, t);
      bp.frequency.exponentialRampToValueAtTime(1200, t + 0.07);
      s.connect(bp);
      bp.connect(gainEnv(t, 0.004, 0.25 * vel, 0.05, ch.sfx));
    };
    X.rip = (t, vel = 0.6) => {
      const s = noise(t, 0.4);
      const bp = filt('bandpass', 2000, 1, t);
      bp.frequency.linearRampToValueAtTime(3500, t + 0.3);
      s.connect(bp);
      const am = ac.createGain();
      am.gain.value = 0;
      const lfo = osc('sawtooth', 60, t, t + 0.4);
      const lg = ac.createGain();
      lg.gain.value = 0.5;
      lfo.connect(lg);
      lg.connect(am.gain);
      bp.connect(am);
      am.connect(gainEnv(t, 0.01, 0.4 * vel, 0.3, ch.sfx));
    };

    /* ----- 按需创建节点：编排时先排队，渲染到附近时才真正创建 ----- */
    let live = false;
    const queue = [];
    const wrap = (fn) =>
      function (t, ...rest) {
        if (live) return fn(t, ...rest);
        queue.push([t, () => fn(t, ...rest)]);
      };
    Object.keys(I).forEach((k) => (I[k] = wrap(I[k])));
    Object.keys(X).forEach((k) => (X[k] = wrap(X[k])));

    /* ----- 编曲辅助 ----- */
    const at = (sceneId, lt) => TL.byId[sceneId].start + lt + T0;
    const bar = (sceneId, b, beat = 0) => at(sceneId, b * BAR + beat * BEAT);

    // 一小节内的和弦拆分：'F' 或 [['C',2],['F',2]]
    const splitBar = (spec) => (typeof spec === 'string' ? [[spec, 4]] : spec);
    function forChords(t0, list, fn) {
      let t = t0;
      list.forEach((spec) => {
        splitBar(spec).forEach(([c, beats]) => {
          fn(t, c, beats);
          t += beats * BEAT;
        });
      });
    }
    function melody(t0, bars, inst = 'bell', vel = 0.7, opts = {}) {
      let t = t0;
      const sp = opts.speed || 1;
      bars.forEach((b) =>
        b.forEach(([m, beats]) => {
          const d = beats * BEAT * sp;
          if (m !== 'r') {
            I[inst](t, n(m) + (opts.oct || 0) * 12, d * 0.95, vel * (0.9 + 0.2 * SK.hash(t * 13.7)), opts.out);
            if (opts.double) I[opts.double](t, n(m) + (opts.doubleOct || 0) * 12, d * 0.9, vel * 0.5, opts.doubleOut);
          }
          t += d;
        })
      );
      return t;
    }
    function uke(t, c, beats, energy = 1, vel = 0.6) {
      const N = chordNotes(c);
      const pat = [1, 0.35, 0.7, 0.5, 0.35, 0.7, 0.85, 0.5];
      for (let i = 0; i < beats * 2; i++) {
        const v = pat[i % 8] * vel;
        if (energy < 1 && i % 2) continue;
        const up = i % 2 === 1;
        const order = up ? N.slice().reverse() : N;
        order.forEach((m, k) => I.pluck(t + i * BEAT * 0.5 + k * 0.011, m, BEAT * 0.45, v));
      }
    }
    function bassLine(t, c, beats, energy = 1, vel = 0.8) {
      const B = chordBass(c);
      I.bass(t, B, Math.min(beats, 2) * BEAT * 0.9, vel);
      if (beats >= 4) {
        I.bass(t + 2 * BEAT, energy >= 1 ? B + 7 : B, BEAT * 1.4, vel * 0.85);
        if (energy >= 2) I.bass(t + 3.5 * BEAT, B + 5, BEAT * 0.4, vel * 0.6);
      }
    }
    function drums(t, beats, energy = 1) {
      for (let i = 0; i < beats; i++) {
        const bt = t + i * BEAT;
        if (i % 2 === 0) I.kick(bt, energy >= 2 ? 0.75 : 0.5);
        if (energy >= 2 && i % 2 === 1) I.clap(bt, 0.45);
        if (energy >= 3 && i % 4 === 3) I.kick(bt + BEAT * 0.5, 0.5);
        I.shaker(bt, 0.5);
        I.shaker(bt + BEAT * 0.5, 0.3);
        if (energy >= 3) {
          I.hat(bt + BEAT * 0.25, 0.25);
          I.hat(bt + BEAT * 0.75, 0.25);
        }
      }
    }
    function pad(t, c, beats, vel = 0.5, oct = 0) {
      chordNotes(c).forEach((m) => I.pad(t, m + oct * 12, beats * BEAT, vel));
    }
    function boxArp(t, c, beats, vel = 0.35, inst = 'celesta', oct = 1, step = 0.5) {
      const N = chordNotes(c).map((m) => m + oct * 12);
      const seq = [N[0], N[1], N[2], N[1], N[2], N[1]];
      const k = Math.round(beats / step);
      for (let i = 0; i < k; i++) I[inst](t + i * step * BEAT, i % 4 === 3 ? N[2] + 12 : seq[i % seq.length], step * BEAT, vel * (i % 2 ? 0.7 : 1));
    }
    function band(t0, chords, opts = {}) {
      const e = opts.energy == null ? 1 : opts.energy;
      forChords(t0, chords, (t, c, beats) => {
        if (opts.uke !== false) uke(t, c, beats, e, opts.ukeVel || 0.55);
        if (opts.bass !== false) bassLine(t, c, beats, e, opts.bassVel || 0.75);
        if (opts.drums !== false && e >= 1) drums(t, beats, e);
        if (opts.pad) pad(t, c, beats, opts.pad);
        if (opts.box) boxArp(t, c, beats, opts.box);
      });
    }

    /* ================= 编排 ================= */
    // 1. 片头：八音盒
    {
      const id = 'title';
      [0.5, 0.66, 0.82, 0.98, 1.14].forEach((tt, i) => I.bell(at(id, tt), ['F5', 'A5', 'C6', 'D6', 'F6'][i], 0.4, 0.55));
      X.sparkle(at(id, 0.9), 0.35);
      pad(bar(id, 0), 'F', 4, 0.35);
      boxArp(bar(id, 0, 2), 'F', 2, 0.3);
      melody(bar(id, 1), THEME_A.slice(0, 2), 'bell', 0.6);
      forChords(bar(id, 1), ['F', 'C'], (t, c, b) => {
        pad(t, c, b, 0.4);
        boxArp(t, c, b, 0.25);
        bassLine(t, c, b, 0, 0.45);
      });
      X.boing(at(id, 2.55), 0.5);
      X.whoosh(at(id, 2.8), 0.9, true, 0.4);
      X.pop(at(id, 3.65), 1.2, 0.4);
      X.pop(at(id, 3.95), 1.4, 0.4);
    }
    // 2. 校园相遇
    {
      const id = 'campus', C = TL.cue.campus;
      const t0 = bar(id, 0);
      band(t0, ['F', [['C', 3]]], { energy: 1, ukeVel: 0.5 });
      melody(t0, [THEME_A[0], [['E5', 1], ['D5', 0.5], ['C5', 0.5], ['G4', 1]]], 'bell', 0.65);
      X.bonk(at(id, C.bump), 0.9);
      I.crash(at(id, C.bump), 0.5);
      X.slide(at(id, C.bump + 0.25), 1300, 380, 0.8, 0.5);
      ['C6', 'B5', 'Bb5', 'A5'].forEach((m, i) => I.celesta(at(id, C.bump + 0.5 + i * 0.32), m, 0.3, 0.4));
      // 抬头对视：踮脚的拨弦
      const tl = at(id, C.look);
      ['D4', 'F4', 'A4', 'F4', 'Bb3', 'D4', 'F4', 'D4'].forEach((m, i) => I.pluck(tl + i * BEAT * 0.5 + (i >= 4 ? BEAT : 0), m, 0.2, 0.45));
      pad(tl, 'Dm', 2, 0.3);
      pad(tl + 2 * BEAT, 'Bb', 3, 0.3);
      X.pop(at(id, C.look + 0.05), 1.6, 0.4);
      // 手碰到的瞬间
      const tt = at(id, C.touch);
      X.gliss(tt - 0.25, ['F5', 'A5', 'C6', 'F6', 'A6', 'C7'], 0.04, 0.45);
      I.crash(tt, 0.25);
      forChords(tt, ['Fmaj7', 'Bbmaj7', [['C', 4]]], (t, c, b) => {
        pad(t, c, b, 0.55);
        boxArp(t, c, b, 0.28, 'celesta', 1, 1);
        bassLine(t, c, b, 0, 0.45);
      });
      melody(tt, [[['A5', 2], ['G5', 1], ['F5', 1]], [['D5', 2], ['F5', 2]], [['E5', 3], ['r', 1]]], 'bell', 0.55);
      C.thump.forEach((x) => I.heartbeat(at(id, x), 0.8));
    }
    // 3. 互发消息
    {
      const id = 'chat', C = TL.cue.chat;
      const t0 = bar(id, 0);
      band(t0, CHORDS_A.slice(0, 6), { energy: 2, ukeVel: 0.5 });
      melody(t0, THEME_A.slice(0, 6), 'bell', 0.6);
      C.msgs.forEach((m, i) => {
        const late = i > 10;
        X.pop(at(id, m.t), m.from === 'F' ? 1.0 : 1.25, late ? 0.25 : 0.4);
        X.ding(at(id, m.t + C.flight), m.from === 'F' ? 'A6' : 'E6', late ? 0.18 : 0.35);
      });
      X.gliss(at(id, 12.6), ['F5', 'A5', 'C6', 'F6', 'A6'], 0.06, 0.3, 'celesta');
    }
    // 4. 两个环球影城
    {
      const id = 'universal', C = TL.cue.universal;
      const t0 = bar(id, 0);
      band(t0, CHORDS_B.slice(0, 5), { energy: 3, ukeVel: 0.55 });
      melody(t0, THEME_B.slice(0, 5), 'pluck', 0.8, { out: ch.mel, double: 'bell', doubleOct: 1, doubleOut: ch.mel2 });
      X.shutter(at(id, C.flash), 0.8);
      X.whoosh(at(id, C.fly), 1.2, true, 0.5);
      X.ding(at(id, C.fly + 0.8), 'C7', 0.4);
      X.ding(at(id, C.land), 'E6', 0.5);
      X.ding(at(id, C.land + 0.08), 'G6', 0.5);
      X.pop(at(id, C.land + 0.9), 1.1, 0.4);
      X.pop(at(id, C.land + 1.1), 1.3, 0.4);
    }
    // 5. 晚安
    {
      const id = 'night', C = TL.cue.night;
      const t0 = bar(id, 0);
      forChords(t0, ['F', 'Am', 'Bb', 'C', 'F'], (t, c, b) => {
        pad(t, c, b, 0.4);
        boxArp(t, c, b, 0.22, 'celesta', 1, 1);
        I.bass(t, chordBass(c), b * BEAT * 0.9, 0.4);
      });
      melody(t0, LULLABY, 'bell', 0.5);
      for (let i = 0; i < 6; i++) X.click(at(id, 0.9 + i * 0.16), 0.25);
      X.pop(at(id, C.send), 1.2, 0.45);
      X.whoosh(at(id, C.send + 0.6), 0.8, true, 0.3);
      // 流星
      const s0 = at(id, C.star[0]);
      for (let i = 0; i < 12; i++) I.celesta(s0 + i * 0.13, ['C7', 'A6', 'F6', 'C6'][i % 4], 0.2, 0.25, ch.sfx);
      X.ding(at(id, C.star[1]), 'F6', 0.55);
      X.ding(at(id, C.read), 'A6', 0.45);
      X.click(at(id, C.lightsOff), 0.6);
    }
    // 6. 梦
    {
      const id = 'dream', C = TL.cue.dream;
      const t0 = bar(id, 0);
      forChords(t0, ['Bbmaj7', 'Am7', 'Gm7', 'Csus', 'Fmaj7'], (t, c, b) => {
        pad(t, c, b, 0.55);
        for (let i = 0; i < b * 2; i++) {
          const N = chordNotes(c);
          I.celesta(t + i * BEAT * 0.5, N[(i * 2 + (i >> 2)) % N.length] + 24, 0.3, 0.16);
        }
        I.bass(t, chordBass(c), b * BEAT * 0.95, 0.35);
      });
      melody(t0, DREAM, 'celesta', 0.6, { out: ch.mel });
      X.sparkle(at(id, C.turn), 0.35);
      X.gliss(at(id, C.heart - 0.2), ['C6', 'E6', 'G6', 'A6', 'C7', 'E7'], 0.05, 0.4);
      X.pop(at(id, C.heart + 0.1), 0.9, 0.5);
      I.heartbeat(at(id, C.catch), 0.6);
      X.sparkle(at(id, C.catch + 0.1), 0.4);
    }
    // 7. 10/19 告白
    {
      const id = 'd1019', C = TL.cue.d1019;
      X.ding(at(id, 0.15), 'C6', 0.5);
      X.ding(at(id, 0.27), 'F6', 0.4);
      pad(bar(id, 0), 'Dm', 4, 0.3);
      X.whoosh(at(id, 2.1), 0.5, true, 0.3);
      // 越来越快的心跳 + 渐强
      let t = 2.8, gap = 1.25;
      while (t < C.yesno - 0.2) {
        I.heartbeat(at(id, t), 0.45 + 0.4 * ((t - 2.8) / (C.yesno - 2.8)));
        t += gap;
        gap = Math.max(0.55, gap * 0.9);
      }
      forChords(bar(id, 1), ['Dm', 'Bb', 'F', [['C', 2]]], (tt, c, b) => {
        pad(tt, c, b, 0.4 + (tt - bar(id, 1)) / 10);
        const N = chordNotes(c);
        for (let i = 0; i < b * 2; i++) I.pluck(tt + i * BEAT * 0.5, N[i % 3] + 12, 0.2, 0.25 + (tt - bar(id, 1)) / 14);
        I.bass(tt, chordBass(c), b * BEAT * 0.9, 0.5);
      });
      C.msgs.forEach((m) => X.pop(at(id, m), 1.15, 0.3));
      // yes or no：全部停下，只剩一声叮
      X.ding(at(id, C.yesno), 'C6', 0.7);
      I.heartbeat(at(id, C.yesno + 0.45), 0.9);
      // 爆发！
      const tb = at(id, C.burst);
      I.crash(tb, 0.7);
      X.gliss(tb - 0.2, ['C5', 'F5', 'A5', 'C6', 'F6', 'A6'], 0.035, 0.5);
      band(tb, ['F', 'C'], { energy: 3, ukeVel: 0.6 });
      melody(tb, THEME_A.slice(0, 2), 'bell', 0.75);
      X.boing(tb + 0.3, 0.4);
    }
    // 8. 10/20 在一起
    {
      const id = 'd1020', C = TL.cue.d1020;
      pad(bar(id, 0), 'F', 4, 0.35);
      boxArp(bar(id, 0), 'F', 4, 0.22);
      X.rip(at(id, C.tear), 0.6);
      for (let i = 0; i < 5; i++) X.click(at(id, 2.5 + i * 0.1), 0.2);
      const ty = at(id, C.yes);
      I.crash(ty, 0.6);
      ['F3', 'A3', 'C4', 'F4', 'A4', 'C5'].forEach((m) => I.pluck(ty, m, 0.6, 0.8));
      X.gliss(ty, ['F5', 'A5', 'C6', 'F6', 'A6', 'C7'], 0.04, 0.5);
      I.kick(ty, 0.9);
      X.pop(at(id, C.yes + 0.7), 1.3, 0.5);
      pad(ty, 'Bb', 4, 0.4);
      boxArp(ty, 'Bb', 2, 0.25);
      boxArp(ty + 2 * BEAT, 'C', 2, 0.25);
      X.whoosh(at(id, 5.4), 0.6, true, 0.5);
      const th = at(id, C.hug);
      X.boing(th, 0.5);
      I.crash(th, 0.6);
      band(th, ['F', 'C', 'Bb', [['C', 2], ['F', 2]]], { energy: 3, ukeVel: 0.6 });
      melody(th, [THEME_A[4], THEME_A[5], THEME_A[6], THEME_A[7]], 'bell', 0.75, { double: 'pluck', doubleOut: ch.mel2 });
      [1.2, 1.8, 2.6].forEach((d, i) => {
        X.pop(at(id, C.hug + d), 1.5 + i * 0.2, 0.4);
        X.sparkle(at(id, C.hug + d + 0.05), 0.25);
      });
    }
    // 9. 蒙太奇：密室逃脱
    {
      const id = 'escape', C = TL.cue.escape;
      const t0 = bar(id, 0);
      I.pad(t0, 'D2', 6 * BEAT, 0.8);
      I.pad(t0, 'A2', 6 * BEAT, 0.5);
      ['D3', 'r', 'F3', 'r', 'D3', 'Ab3', 'r', 'G3'].forEach((m, i) => m !== 'r' && I.pluck(t0 + i * BEAT * 0.5, m, 0.12, 0.6));
      I.celesta(t0 + 1.5 * BEAT, 'Ab5', 0.5, 0.35);
      I.celesta(t0 + 3.5 * BEAT, 'D6', 0.5, 0.3);
      for (let i = 0; i < 10; i++) X.click(at(id, 0.3 + i * 0.18), 0.12);
      X.stinger(at(id, C.scare), 0.8);
      X.boo(at(id, C.scare + 0.05), 0.8);
      X.slide(at(id, C.scare + 0.1), 500, 1600, 0.35, 0.5);
      // 滑稽的“哇哇”
      ['Bb3', 'A3', 'Ab3', 'G3'].forEach((m, i) => I.square(at(id, C.scare + 1.3 + i * 0.32), m, i === 3 ? 0.7 : 0.28, 0.5));
    }
    // 游山玩水
    {
      const id = 'travel', C = TL.cue.travel;
      const t0 = bar(id, 0);
      band(t0, ['F', 'C', 'Dm'], { energy: 2, ukeVel: 0.55 });
      melody(t0, THEME_A.slice(0, 3), 'bell', 0.65);
      C.shots.forEach((s) => {
        X.shutter(at(id, s), 0.7);
        X.whoosh(at(id, s + 0.2), 0.8, true, 0.3);
        X.ding(at(id, s + 1.1), 'A6', 0.4);
      });
    }
    // 7/4 生日 + 恐怖片
    {
      const id = 'bday', C = TL.cue.bday;
      X.ding(at(id, 0.1), 'C6', 0.5);
      X.ding(at(id, 0.22), 'A6', 0.4);
      pad(at(id, 0), 'F', 2.5, 0.3);
      const tb = at(id, 1.5);
      melody(tb, [[['C5', 0.5], ['C5', 0.25], ['D5', 0.75], ['C5', 0.75], ['F5', 0.75], ['E5', 1.5]]], 'bell', 0.75, { double: 'pluck', doubleOut: ch.mel2 });
      forChords(tb, [[['F', 2.25], ['C7', 2.25]]], (t, c, b) => {
        uke(t, c, b, 1, 0.45);
        I.bass(t, chordBass(c), b * BEAT * 0.9, 0.6);
      });
      for (let i = 0; i < 4; i++) {
        I.shaker(tb + i * BEAT, 0.5);
        I.kick(tb + i * 2 * BEAT, 0.5);
      }
      X.blow(at(id, C.blow - 0.15), 0.7);
      I.crash(at(id, C.blow + 0.05), 0.5);
      X.gliss(at(id, C.blow + 0.05), ['F5', 'A5', 'C6', 'F6'], 0.05, 0.5);
      for (let i = 0; i < 6; i++) X.pop(at(id, C.blow + 0.1 + i * 0.09), 1.2 + (i % 3) * 0.3, 0.3);
      // 恐怖片
      const th = at(id, 4.4);
      I.pad(th, 'D2', 4.0, 0.9, ch.pad, 700);
      I.pad(th, 'Ab2', 4.0, 0.6, ch.pad, 700);
      [['D5', 0], ['F5', 0.6], ['Ab5', 1.2], ['G5', 1.6]].forEach(([m, d]) => I.celesta(th + d, m, 0.5, 0.35));
      I.heartbeat(at(id, 5.5), 0.4);
      X.stinger(at(id, C.scare), 0.9);
      X.slide(at(id, C.scare + 0.05), 600, 1800, 0.4, 0.5);
      for (let i = 0; i < 8; i++) X.pop(at(id, C.scare + 0.15 + i * 0.07 + (i % 2) * 0.02), 1.6 + (i % 4) * 0.25, 0.35);
      ['F4', 'D4', 'F4', 'D4'].forEach((m, i) => I.pluck(at(id, C.scare + 1.0 + i * 0.22), m, 0.15, 0.5));
    }
    // 海洋公园
    {
      const id = 'ocean';
      const t0 = bar(id, 0);
      forChords(t0, ['Bbmaj7', 'Fmaj7', [['Gm7', 2]]], (t, c, b) => {
        pad(t, c, b, 0.45);
        const N = chordNotes(c);
        for (let i = 0; i < b * 4; i++) I.pluck(t + i * BEAT * 0.25, N[[0, 1, 2, 1][i % 4]] + 12 + (i % 8 >= 4 ? 12 : 0), 0.15, 0.35);
        I.bass(t, chordBass(c), b * BEAT * 0.9, 0.5);
      });
      melody(t0, [[['F5', 1], ['A5', 1], ['C6', 2]], [['A5', 1], ['G5', 1], ['E5', 2]], [['D5', 2]]], 'celesta', 0.6, { out: ch.mel });
      for (let i = 0; i < 10; i++) X.pop(at(id, 0.3 + i * 0.55 + (i % 3) * 0.1), 0.8 + (i % 4) * 0.2, 0.22);
    }
    // 羽毛球
    {
      const id = 'badminton', C = TL.cue.badminton;
      const t0 = bar(id, 0);
      band(t0, ['F', 'Bb', [['C', 2]]], { energy: 2, ukeVel: 0.5 });
      melody(t0, [[['C5', 0.5], ['F5', 0.5], ['r', 0.5], ['A5', 0.5], ['G5', 1], ['F5', 1]], [['D5', 0.5], ['F5', 0.5], ['r', 0.5], ['Bb5', 0.5], ['A5', 1], ['F5', 1]], [['G5', 2]]], 'bell', 0.6);
      C.hits.forEach((h, i) => X.hit(at(id, h), i === C.hits.length - 1 ? 0.9 : 0.6));
      X.whoosh(at(id, C.hits[C.hits.length - 1] - 0.55), 0.5, true, 0.4);
      X.bonk(at(id, C.land), 0.6);
      X.slide(at(id, C.land + 0.1), 900, 300, 0.4, 0.4);
    }
    // 哈利波特快闪
    {
      const id = 'wizard', C = TL.cue.wizard;
      const t0 = bar(id, 0);
      forChords(t0, ['Dm', 'Bb', [['Gm', 2], ['A7', 2]]], (t, c, b) => {
        pad(t, c, b, 0.45);
        const N = chordNotes(c);
        for (let i = 0; i < b * 2; i++) I.celesta(t + i * BEAT * 0.5, N[[0, 2, 1, 2][i % 4]] + 12, 0.3, 0.3);
        I.bass(t, chordBass(c), b * BEAT * 0.9, 0.45);
      });
      melody(t0, [[['A5', 1.5], ['D6', 0.5], ['F6', 1], ['E6', 1]], [['D6', 2], ['F6', 1], ['D6', 1]], [['Bb5', 2], ['C#6', 2]]], 'bell', 0.55);
      X.hoot(at(id, 0.8), 0.5);
      X.gliss(at(id, C.spell), ['A5', 'D6', 'F6', 'A6', 'D7', 'F7', 'A7'], 0.05, 0.45, 'celesta');
      X.sparkle(at(id, C.spell + 0.5), 0.3);
      X.shutter(at(id, C.flash), 0.7);
      I.crash(at(id, C.flash), 0.4);
      ['D4', 'F#4', 'A4', 'D5'].forEach((m) => I.pluck(at(id, C.flash), m, 1.0, 0.6));
      pad(at(id, C.flash), 'F', 3, 0.4);
    }
    // 时光流逝
    {
      const id = 'seasons';
      const t0 = bar(id, 0);
      forChords(t0, ['F', 'C', 'Dm'], (t, c, b) => {
        pad(t, c, b, 0.45);
        boxArp(t, c, b, 0.22);
        I.bass(t, chordBass(c), b * BEAT * 0.9, 0.45);
      });
      melody(t0, THEME_A.slice(0, 3), 'bell', 0.55);
      [1.8, 3.6, 5.4].forEach((s) => X.gliss(at(id, s - 0.15), ['C6', 'F6', 'A6'], 0.05, 0.25, 'celesta'));
      for (let i = 0; i < 12; i++) X.flip(at(id, (i + 0.1) * (7.2 / 12)), 0.18);
    }
    // 石膏画
    {
      const id = 'plaster', C = TL.cue.plaster;
      const t0 = bar(id, 0);
      band(t0, ['Bb', 'F', 'Gm', 'C'], { energy: 1, ukeVel: 0.45, bassVel: 0.6 });
      melody(t0, [THEME_A[3], [['A4', 0.5], ['C5', 0.5], ['F5', 1], ['C5', 0.5], ['F5', 0.5], ['A5', 1]], [['Bb5', 1], ['A5', 0.5], ['G5', 0.5], ['D5', 2]], [['E5', 1], ['G5', 1], ['C6', 2]]], 'pluck', 0.7, { out: ch.mel });
      for (let i = 0; i < 8; i++) X.click(at(id, 0.7 + i * 0.55), 0.1);
      X.sparkle(at(id, C.done), 0.5);
      X.whoosh(at(id, C.done + 0.1), 0.9, true, 0.35);
      X.ding(at(id, C.love - 0.3), 'E6', 0.4);
      X.gliss(at(id, C.love), ['A6', 'F6', 'D6', 'A5'], 0.09, 0.45);
      X.pop(at(id, C.love + 0.05), 1.3, 0.4);
    }
    // 马卡龙 & 回转寿司
    {
      const id = 'food', C = TL.cue.food;
      const t0 = bar(id, 0);
      band(t0, ['F', 'Dm', 'Bb', 'C'], { energy: 2, ukeVel: 0.5 });
      melody(t0, [[['C6', 0.5], ['A5', 0.5], ['F5', 0.5], ['A5', 0.5], ['C6', 1], ['r', 1]], [['D6', 0.5], ['A5', 0.5], ['F5', 0.5], ['A5', 0.5], ['D6', 1], ['r', 1]], [['Bb5', 0.5], ['F5', 0.5], ['D5', 0.5], ['F5', 0.5], ['Bb5', 1], ['A5', 1]], [['G5', 1], ['E5', 1], ['C5', 2]]], 'bell', 0.55);
      X.pop(at(id, 0.6), 1.2, 0.35);
      X.crunch(at(id, C.bites[0]), 0.7);
      X.pop(at(id, C.bites[0] + 0.1), 1.6, 0.3);
      X.sparkle(at(id, C.bites[1]), 0.3);
      C.grabs.forEach((g, i) => {
        X.pop(at(id, g), i % 2 ? 1.25 : 1.0, 0.45);
        X.click(at(id, g + 0.4), 0.3);
      });
      X.ding(at(id, 8.7), 'F6', 0.4);
    }
    // 看电影
    {
      const id = 'movie', C = TL.cue.movie;
      const t0 = bar(id, 0);
      forChords(t0, ['Fmaj7', 'Am7', 'Bbmaj7', 'Csus'], (t, c, b) => {
        pad(t, c, b, 0.75);
        const N = chordNotes(c);
        I.piano(t, chordBass(c) + 12, b * BEAT, 0.7);
        for (let i = 0; i < b; i++) I.piano(t + i * BEAT + BEAT * 0.5, N[i % N.length], BEAT, 0.45);
        I.bass(t, chordBass(c), b * BEAT * 0.9, 0.45);
      });
      melody(t0, MOVIE, 'bell', 0.65);
      X.gliss(at(id, C.lean + 0.8), ['F5', 'A5', 'C6', 'E6', 'F6'], 0.08, 0.3, 'celesta');
      I.heartbeat(at(id, C.lean + 2.0), 0.45);
      X.ding(at(id, C.lean + 2.1), 'A6', 0.35);
    }
    // 打游戏：8-bit
    {
      const id = 'game', C = TL.cue.game;
      const t0 = bar(id, 0);
      const winT = at(id, C.win);
      forChords(t0, ['F', 'C', 'Dm'], (t, c, b) => {
        const N = chordNotes(c);
        for (let i = 0; i < b * 4; i++) {
          const tt = t + i * BEAT * 0.25;
          if (tt > winT - 0.05) break;
          I.square(tt, N[i % 3] + 12, BEAT * 0.22, 0.35);
        }
        for (let i = 0; i < b * 2; i++) {
          const tt = t + i * BEAT * 0.5;
          if (tt > winT - 0.05) break;
          I.square(tt, chordBass(c), BEAT * 0.4, 0.6);
          if (i % 2) I.hat(tt, 0.4);
          else I.kick(tt, 0.4);
        }
      });
      let t = t0;
      THEME_A.slice(0, 3).forEach((b) =>
        b.forEach(([m, beats]) => {
          if (t < winT - 0.05 && m !== 'r') I.square(t, n(m) + 12, beats * BEAT * 0.9, 0.6);
          t += beats * BEAT;
        })
      );
      [['C5', 0.25], ['F5', 0.25], ['A5', 0.25], ['C6', 0.25], ['r', 0.25], ['A5', 0.25], ['C6', 1.5]].reduce((tt, [m, b]) => {
        if (m !== 'r') I.square(tt, m, b * BEAT * 0.95, 0.7);
        return tt + b * BEAT;
      }, winT);
      ['F3', 'F3', 'C4'].forEach((m, i) => I.square(winT + i * BEAT * 0.5, m, BEAT * 0.45, 0.6));
      X.sparkle(winT + 0.9, 0.35);
      I.clap(winT + 1.15, 0.8);
      X.pop(winT + 1.2, 1.4, 0.4);
    }
    // 河边散步
    {
      const id = 'river';
      const t0 = bar(id, 0);
      band(t0, ['F', 'C', 'Bb', [['C', 2], ['F', 2]]], { energy: 1, ukeVel: 0.45, pad: 0.35, bassVel: 0.6 });
      melody(t0, THEME_A.slice(4, 8), 'bell', 0.6);
    }
    // 下潜
    {
      const id = 'dive';
      const t0 = bar(id, 0);
      X.whoosh(t0 + 0.4, 3.6, false, 1.0);
      ['F6', 'C6', 'A5', 'F5', 'C5', 'A4', 'F4', 'C4'].forEach((m, i) => I.celesta(t0 + 0.5 + i * 0.35, m, 0.3, 0.55));
      I.pad(t0, 'F2', 2 * BAR, 1.0, ch.pad, 600);
      I.pad(t0, 'C3', 2 * BAR, 0.6, ch.pad, 600);
      I.pad(t0 + BAR, 'E2', BAR, 0.8, ch.pad, 500);
    }
    // 地下的爱心
    {
      const id = 'heart', C = TL.cue.heart;
      const T = (x) => at(id, x);
      // 心跳：与画面一致，每两拍一次
      for (let x = 0; x < 24; x += TL.BEAT * 2) {
        const done = x > C.wrap[1] - 0.6;
        I.heartbeat(T(x + 0.01), done ? 0.85 : 0.5);
      }
      const prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'];
      prog.forEach((c, i) => {
        const t = T(i * BAR);
        if (i * BAR > C.wrap[0] - 0.2) return;
        const N = chordNotes(c);
        I.piano(t, chordBass(c), BAR * 0.95, 0.55);
        N.forEach((m) => I.piano(t + 0.02, m + 12, BAR * 0.9, 0.3));
        I.pad(t, N[0], BAR, 0.4);
        I.pad(t, N[2], BAR, 0.3);
      });
      // 一点点旋律
      melody(T(0), [[['E5', 2], ['C5', 2]], [['A4', 2], ['C5', 2]], [['G4', 2], ['E5', 2]], [['D5', 4]], [['E5', 2], ['C5', 2]], [['A4', 2], ['F5', 2]], [['E5', 4]]], 'piano', 0.5, { out: ch.mel });
      C.cracks.forEach((x, i) => {
        X.crack(T(x), i === 2, 0.85);
        I.piano(T(x), i === 2 ? 'Bb2' : 'B2', 1.2, 0.5);
        I.piano(T(x), 'F2', 1.2, 0.45);
      });
      const fixNotes = ['C6', 'E6', 'G6', 'C6', 'E6', 'G6', 'A6'];
      C.tapes.forEach((x, i) => {
        X.tape(T(x - 0.05), 0.3, 0.65);
        I.bell(T(x + 0.3), fixNotes[i], 0.5, 0.4, ch.sfx);
      });
      // 缠绕：渐强
      const [w0, w1] = C.wrap;
      const wrapChords = [['F', w0], ['G', w0 + 1.2], ['Am', w0 + 2.4], ['F', w0 + 3.6]];
      wrapChords.forEach(([c, x], i) => {
        const N = chordNotes(c);
        const dur = 1.2;
        N.forEach((m) => I.pad(T(x), m, dur, 0.45 + i * 0.12));
        I.piano(T(x), chordBass(c), dur, 0.5 + i * 0.08);
        for (let k = 0; k < 8; k++) I.celesta(T(x + k * 0.15), N[k % 3] + 12 + (k >= 4 ? 12 : 0), 0.15, 0.25 + i * 0.07);
      });
      for (let i = 0; i < 30; i += 2) X.tape(T(w0 + (i * (w1 - w0 - 0.7)) / 30), 0.22, 0.22);
      X.whoosh(T(w1 - 1.4), 1.4, true, 0.4);
      // 修好了：明亮的 F 大调
      const tf = T(w1);
      I.crash(tf, 0.6);
      X.gliss(tf - 0.25, ['C5', 'F5', 'A5', 'C6', 'F6', 'A6', 'C7'], 0.04, 0.55);
      ['F2', 'C3', 'F3', 'A3', 'C4', 'F4', 'A4'].forEach((m) => I.pad(tf, m, 3.6, 0.6));
      ['F3', 'A3', 'C4', 'F4'].forEach((m) => I.piano(tf, m, 2.4, 0.55));
      melody(tf, [[['A5', 2], ['C6', 2]], [['F6', 2]]], 'bell', 0.6);
    }
    // 回到地面 → 10/20
    {
      const id = 'rise', C = TL.cue.rise;
      X.whoosh(at(id, 0.1), 2.0, true, 0.9);
      ['C4', 'F4', 'A4', 'C5', 'F5', 'A5', 'C6'].forEach((m, i) => I.celesta(at(id, 0.3 + i * 0.27), m, 0.3, 0.5));
      pad(at(id, 0), 'C', 3.6, 0.6);
      // 翻页声：与画面上的缓动一致
      const n = 14;
      let last = -1;
      for (let x = C.flips[0]; x < C.flips[1]; x += 1 / 120) {
        const k = SK.easeOut(SK.prog(x, C.flips[0], C.flips[1]));
        const idx = Math.floor(k * (n - 1) + 0.0001);
        if (idx !== last) {
          X.flip(at(id, x), 0.35);
          last = idx;
        }
      }
      pad(at(id, C.flips[0]), 'C', 3, 0.5);
      boxArp(at(id, C.flips[0]), 'C', 3, 0.25);
      X.ding(at(id, C.land), 'F6', 0.6);
      X.gliss(at(id, C.land + 0.05), ['A5', 'C6', 'F6', 'A6'], 0.05, 0.45);
      pad(at(id, C.land), 'F', 2.6, 0.45);
    }
    // 分叉的路：主题完整再现
    {
      const id = 'road';
      const t0 = bar(id, 0);
      band(t0, CHORDS_A.slice(0, 7), { energy: 2, ukeVel: 0.5, pad: 0.35 });
      melody(t0, THEME_A.slice(0, 7), 'bell', 0.7, { double: 'celesta', doubleOct: 1, doubleOut: ch.mel2 });
      [4.4, 8.2].forEach((x) => X.ding(at(id, x), 'A6', 0.35));
      X.gliss(at(id, 12.2), ['F5', 'A5', 'C6', 'F6', 'A6', 'C7'], 0.07, 0.35, 'celesta');
    }
    // 结尾
    {
      const id = 'end';
      const t0 = bar(id, 0);
      forChords(t0, [[['C', 2], ['F', 2]], 'Bb', 'F'], (t, c, b) => {
        pad(t, c, b, 0.45);
        boxArp(t, c, b, 0.22);
        I.bass(t, chordBass(c), b * BEAT * 0.9, 0.45);
      });
      melody(t0, [THEME_A[7], [['D5', 1], ['C5', 1], ['Bb4', 1], ['D5', 1]], [['C5', 2], ['F5', 2]]], 'bell', 0.55);
      X.gliss(bar(id, 2, 2), ['F5', 'A5', 'C6', 'F6'], 0.08, 0.3, 'celesta');
    }

    queue.sort((a, b) => a[0] - b[0]);
    let idx = 0;
    return function runUntil(tEnd) {
      live = true;
      while (idx < queue.length && queue[idx][0] < tEnd) {
        queue[idx][1]();
        idx++;
      }
      live = false;
      return queue.length - idx;
    };
  };

  M.render = async function (sampleRate = 44100, duration = TL.duration) {
    const len = Math.ceil(duration * sampleRate);
    const ac = new OfflineAudioContext(2, len, sampleRate);
    const runUntil = M.build(ac);
    const STEP = 1.0, AHEAD = 0.6;
    runUntil(STEP + AHEAD);
    for (let k = 1; k * STEP < duration; k++) {
      const ts = k * STEP;
      ac.suspend(ts).then(() => {
        runUntil(ts + STEP + AHEAD);
        ac.resume();
      });
    }
    return ac.startRendering();
  };

  // AudioBuffer → 16-bit PCM WAV（Uint8Array）
  M.toWav = function (buf) {
    const ch = buf.numberOfChannels, sr = buf.sampleRate, len = buf.length;
    const data = new DataView(new ArrayBuffer(44 + len * ch * 2));
    const w = (o, s) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF');
    data.setUint32(4, 36 + len * ch * 2, true);
    w(8, 'WAVE');
    w(12, 'fmt ');
    data.setUint32(16, 16, true);
    data.setUint16(20, 1, true);
    data.setUint16(22, ch, true);
    data.setUint32(24, sr, true);
    data.setUint32(28, sr * ch * 2, true);
    data.setUint16(32, ch * 2, true);
    data.setUint16(34, 16, true);
    w(36, 'data');
    data.setUint32(40, len * ch * 2, true);
    const chans = [];
    for (let c = 0; c < ch; c++) chans.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < len; i++) {
      for (let c = 0; c < ch; c++) {
        const v = Math.max(-1, Math.min(1, chans[c][i]));
        data.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
        o += 2;
      }
    }
    return new Uint8Array(data.buffer);
  };
})();
