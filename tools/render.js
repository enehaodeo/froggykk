#!/usr/bin/env node
/* 离线渲染：
 *   node tools/render.js audio            生成 music.wav / music.mp3（页面播放用）
 *   node tools/render.js video [选项]      逐帧渲染 + 合成 froggy-and-piggy.mp4
 *     --width 1920 --fps 30 --crf 23 --from 0 --to <秒> --out 文件名
 * 依赖：playwright（Chromium）与 ffmpeg。 */
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const mode = args[0] || 'video';
const opt = (k, d) => {
  const i = args.indexOf('--' + k);
  return i >= 0 ? args[i + 1] : d;
};

async function openPage(browser, w, h) {
  const page = await browser.newPage({ viewport: { width: Math.min(w, 1920), height: Math.min(h, 1080) } });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?offline');
  await page.addScriptTag({ path: path.join(ROOT, 'js/music.js') });
  await page.evaluate(async () => {
    const chars = '青蛙和小飞猪那年秋天校园扑通同一天两个环球影城好巧哈晚安十月七在一起啦密室逃脱游山玩水分享给你生日快乐这看恐怖片海洋公园打羽毛球利波特闪时光流逝石膏画的作品吃马卡龙回转寿司电影游戏耶河边散步未完待续…';
    try {
      await document.fonts.load('40px "ZCOOL KuaiLe"', chars);
      await document.fonts.load('40px Gaegu', 'Froggy Piggy 0123456789/ yes or no BOO');
      await document.fonts.load('bold 40px Gaegu', 'Froggy Piggy 0123456789/ YES BOO');
    } catch (e) {}
    await document.fonts.ready;
  });
  return page;
}

async function renderAudio(browser) {
  const page = await openPage(browser, 1280, 720);
  console.log('rendering soundtrack…');
  const t0 = Date.now();
  const total = await page.evaluate(async () => {
    const buf = await MUSIC.render(44100);
    window.__wav = MUSIC.toWav(buf);
    return window.__wav.length;
  });
  console.log(`rendered in ${((Date.now() - t0) / 1000).toFixed(1)}s, ${total} bytes`);
  const chunks = [];
  const CH = 4 * 1024 * 1024;
  for (let o = 0; o < total; o += CH) {
    const b64 = await page.evaluate(([o, n]) => {
      const a = window.__wav.subarray(o, o + n);
      let s = '';
      for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
      return btoa(s);
    }, [o, CH]);
    chunks.push(Buffer.from(b64, 'base64'));
  }
  const wav = path.join(ROOT, 'music.wav');
  fs.writeFileSync(wav, Buffer.concat(chunks));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '160k', path.join(ROOT, 'music.mp3')]);
  console.log('wrote music.wav, music.mp3');
}

async function renderVideo(browser) {
  const W = parseInt(opt('width', '1920'), 10);
  const H = Math.round((W * 9) / 16);
  const fps = parseInt(opt('fps', '30'), 10);
  const page = await openPage(browser, W, H);
  const dur = await page.evaluate(() => window.FILM_DURATION);
  const from = parseFloat(opt('from', '0'));
  const to = Math.min(dur, parseFloat(opt('to', String(dur))));
  const out = path.resolve(ROOT, opt('out', 'froggy-and-piggy.mp4'));
  const wav = path.join(ROOT, 'music.wav');
  const ffArgs = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
  if (fs.existsSync(wav)) ffArgs.push('-ss', String(from), '-t', String(to - from), '-i', wav);
  ffArgs.push('-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', opt('crf', '23'), '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
  if (fs.existsSync(wav)) ffArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  ffArgs.push(out);
  const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round((to - from) * fps);
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = from + i / fps;
    const b64 = await page.evaluate(
      ([t, W, H]) => {
        window.renderAt(t, W, H);
        return document.getElementById('film').toDataURL('image/jpeg', 0.93).split(',')[1];
      },
      [t, W, H]
    );
    const buf = Buffer.from(b64, 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % (fps * 10) === 0) console.log(`frame ${i}/${frames}  t=${t.toFixed(1)}s  ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', out);
}

(async () => {
  const browser = await chromium.launch();
  try {
    if (mode === 'audio') await renderAudio(browser);
    else await renderVideo(browser);
  } finally {
    await browser.close();
  }
})();
