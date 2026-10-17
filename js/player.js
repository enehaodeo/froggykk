/* 播放器：画面时钟跟随音乐，支持暂停 / 拖动 / 全屏 */
(function () {
  const canvas = document.getElementById('film');
  const ctx = canvas.getContext('2d');
  const audio = document.getElementById('music');
  const stage = document.getElementById('stage');
  const startBtn = document.getElementById('start');
  const cover = document.getElementById('cover');
  const playBtn = document.getElementById('play');
  const seek = document.getElementById('seek');
  const timeEl = document.getElementById('time');
  const fsBtn = document.getElementById('fullscreen');
  const offline = /[?&]offline\b/.test(location.search);

  let t = 0;
  let playing = false;
  let lastNow = 0;
  let dirty = true;

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  function draw(w, h) {
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    SK.pxScale = w / SK.W;
    ctx.setTransform(SK.pxScale, 0, 0, SK.pxScale, 0, 0);
    ctx.fillStyle = SK.PAPER;
    ctx.fillRect(0, 0, SK.W, SK.H);
    Film.render(ctx, t, w, h);
  }

  // 供离线渲染脚本调用
  window.renderAt = function (time, w = 1280, h = 720) {
    t = time;
    draw(w, h);
  };
  window.FILM_DURATION = Film.duration;
  if (offline) return;

  function sizeForScreen() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(320, Math.round(r.width * dpr));
    return [w, Math.round((w * 9) / 16)];
  }

  /* 音乐：优先用 <audio>；被拦截或加载失败时，改用 fetch + Web Audio 播放 */
  const music = {
    mode: 'element',
    ctx: null,
    buf: null,
    src: null,
    startAt: 0,
    unlock() {
      // 必须在用户点击时创建 / 唤醒 AudioContext
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx && AC) this.ctx = new AC();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },
    play(at) {
      if (this.mode === 'element') {
        try {
          audio.currentTime = at;
          const pr = audio.play();
          if (pr && pr.catch) pr.catch(() => this.useWebAudio());
        } catch (e) {
          this.useWebAudio();
        }
      } else if (this.mode === 'webaudio') this.playBuffer(at);
    },
    pause() {
      if (this.mode === 'element') audio.pause();
      else this.stopBuffer();
    },
    seek(at) {
      if (this.mode === 'element') {
        try {
          audio.currentTime = at;
        } catch (e) {}
      } else if (playing) this.playBuffer(at);
    },
    // 正在播放时返回音乐时间，否则 null
    time() {
      if (this.mode === 'element') return !audio.paused && audio.readyState >= 3 ? audio.currentTime : null;
      if (this.mode === 'webaudio' && this.src) return this.ctx.currentTime - this.startAt;
      return null;
    },
    // 音乐还在加载：画面先等一等
    waiting() {
      if (this.mode === 'element') return !audio.paused && audio.readyState < 3;
      if (this.mode === 'webaudio') return !this.buf;
      return false;
    },
    useWebAudio() {
      if (this.mode !== 'element') return;
      this.mode = 'webaudio';
      try {
        audio.pause();
      } catch (e) {}
      if (!this.ctx) {
        this.mode = 'none';
        return;
      }
      fetch('music.mp3')
        .then((r) => {
          if (!r.ok) throw new Error('music ' + r.status);
          return r.arrayBuffer();
        })
        .then((b) => new Promise((res, rej) => this.ctx.decodeAudioData(b, res, rej)))
        .then((buf) => {
          this.buf = buf;
          if (playing) this.playBuffer(t);
        })
        .catch(() => {
          this.mode = 'none';
        });
    },
    playBuffer(at) {
      this.stopBuffer();
      if (!this.buf) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const s = this.ctx.createBufferSource();
      s.buffer = this.buf;
      s.connect(this.ctx.destination);
      s.start(0, Math.max(0, Math.min(at, this.buf.duration - 0.01)));
      this.src = s;
      this.startAt = this.ctx.currentTime - at;
    },
    stopBuffer() {
      if (this.src) {
        try {
          this.src.stop();
        } catch (e) {}
        this.src = null;
      }
    },
  };
  audio.addEventListener('error', () => music.useWebAudio());

  function setPlaying(p) {
    playing = p;
    stage.classList.toggle('is-playing', p);
    playBtn.setAttribute('aria-label', p ? '暂停' : '播放');
    playBtn.dataset.state = p ? 'pause' : 'play';
    if (p) {
      music.unlock();
      if (t >= Film.duration - 0.05) t = 0;
      lastNow = performance.now();
      music.play(t);
    } else {
      music.pause();
    }
  }

  function tick(now) {
    if (playing) {
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      if (!music.waiting()) t += dt;
      // 以音乐为准，轻微校正漂移
      const at = music.time();
      if (at != null) {
        if (Math.abs(at - t) > 0.12) t = at;
        else t += (at - t) * 0.08;
      }
      if (t >= Film.duration) {
        t = Film.duration;
        setPlaying(false);
      }
      dirty = true;
    }
    if (dirty) {
      const [w, h] = sizeForScreen();
      draw(w, h);
      seek.value = String((t / Film.duration) * 1000);
      timeEl.textContent = fmt(t) + ' / ' + fmt(Film.duration);
      dirty = false;
    }
    requestAnimationFrame(tick);
  }

  startBtn.addEventListener('click', () => {
    cover.hidden = true;
    t = 0;
    setPlaying(true);
  });
  playBtn.addEventListener('click', () => {
    cover.hidden = true;
    setPlaying(!playing);
  });
  canvas.addEventListener('click', () => {
    if (!cover.hidden) return;
    setPlaying(!playing);
  });
  seek.addEventListener('input', () => {
    t = (parseFloat(seek.value) / 1000) * Film.duration;
    music.seek(t);
    cover.hidden = true;
    dirty = true;
  });
  fsBtn.addEventListener('click', () => {
    const el = stage;
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) {}
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      cover.hidden = true;
      setPlaying(!playing);
    }
  });
  window.addEventListener('resize', () => (dirty = true));
  document.addEventListener('fullscreenchange', () => (dirty = true));

  // 封面：停在片头标题
  t = 5.2;
  const ready = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('40px "ZCOOL KuaiLe"', '青蛙小飞猪晚安在一起啦扑通好巧哈'), document.fonts.load('40px Gaegu', 'Froggy 10/19')]).catch(() => {})
    : Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 2500))]).then(() => {
    dirty = true;
  });
  requestAnimationFrame(tick);
})();
