#!/usr/bin/env node
/* 导出角色素材到 characters/：
 *   node tools/export-characters.js [--only png,refs,sheets,loops] [--fps 24] [--keep-frames]
 *   png/     透明背景 PNG：每个角色的各种姿势、表情，以及两人同框
 *   refs/    纸色背景的干净参考图（给 AI 视频 / 图生视频当角色参考）
 *   sheets/  角色设定图（正面、背面、表情、色板、动作、两人比例）
 *   loops/   无缝循环动画：.webm（带透明通道）、.mp4 和 .gif（纸色背景）
 *   manifest.json  所有文件、画框和脚下锚点坐标
 * 依赖：playwright（Chromium）与 ffmpeg。 */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'characters');
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf('--' + k);
  return i >= 0 ? args[i + 1] : d;
};
const only = (opt('only', 'png,refs,sheets,loops') || '').split(',');
const FPS = parseInt(opt('fps', '24'), 10);
const P_PNG = 4; // 单个角色 PNG：300×240 单位 → 1200×960 像素
const P_SHEET = 1.5; // 设定图 1600×1000 单位 → 2400×1500 像素
const P_LOOP = 3; // 循环动画 900×720（两人同框 1800×720）

const rel = (p) => path.relative(OUT, p).split(path.sep).join('/');
function save(file, b64) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto('file://' + path.join(OUT, 'studio.html') + '?export');
  const src = ['characters/studio.js', 'js/chars.js'].map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('');
  const cjk = [...new Set(src.match(/[　-鿿＀-￯·♥]/g) || [])].join('');
  await page.evaluate(async (chars) => {
    try {
      await document.fonts.load('40px "ZCOOL KuaiLe"', chars);
      await document.fonts.load('bold 40px Gaegu', 'Froggy Piggy Poses #0123456789abcdef');
    } catch (e) {}
    await document.fonts.ready;
  }, cjk);
  return page;
}

// 在页面里执行一次渲染，返回 PNG 的 base64；同时检查画框边缘有没有把角色裁掉
async function grab(page, js, arg, type = 'image/png') {
  const [b64, clipped] = await page.evaluate(
    ([js, arg, type]) => {
      const c = new Function('arg', 'return ' + js)(arg);
      const g = c.getContext('2d');
      const { width: w, height: h } = c;
      const top = g.getImageData(0, 0, w, 1).data, bot = g.getImageData(0, h - 1, w, 1).data;
      const lft = g.getImageData(0, 0, 1, h).data, rgt = g.getImageData(w - 1, 0, 1, h).data;
      let clipped = false;
      for (const d of [top, bot, lft, rgt]) for (let i = 3; i < d.length; i += 4) if (d[i] > 40) clipped = true; // 只对透明背景有意义
      return [c.toDataURL(type, 0.92).split(',')[1], clipped];
    },
    [js, arg, type]
  );
  return { b64, clipped };
}

async function exportPng(page, manifest) {
  const list = await page.evaluate(() => ({
    poses: { frog: STUDIO.POSES.frog.map((p) => [p.id, p.name]), pig: STUDIO.POSES.pig.map((p) => [p.id, p.name]) },
    expr: { frog: STUDIO.EXPRESSIONS.frog.map((p) => [p.id, p.name]), pig: STUDIO.EXPRESSIONS.pig.map((p) => [p.id, p.name]) },
    duo: STUDIO.DUO.map((d) => [d.id, d.name]),
    box: STUDIO.BOX,
    duoBox: STUDIO.DUO_BOX,
  }));
  const anchor = (box) => [-box.x * P_PNG, -box.y * P_PNG];
  manifest.png = {
    note: '透明背景；anchor 为角色脚下中心在图片里的像素坐标，所有同类图片对齐，方便叠到视频里',
    single: { size: [list.box.w * P_PNG, list.box.h * P_PNG], anchor: anchor(list.box) },
    duo: { size: [list.duoBox.w * P_PNG, list.duoBox.h * P_PNG], anchor: anchor(list.duoBox) },
    files: [],
  };
  const jobs = [];
  for (const who of ['frog', 'pig']) {
    list.poses[who].forEach(([id, name]) => jobs.push(['pose', who, id, name, `png/${who}/${id}.png`]));
    list.expr[who].forEach(([id, name]) => jobs.push(['expression', who, id, name, `png/${who}/face-${id}.png`]));
  }
  list.duo.forEach(([id, name]) => jobs.push(['duo', null, id, name, `png/duo/${id}.png`]));
  for (const [kind, who, id, name, file] of jobs) {
    const { b64, clipped } = await grab(page, 'STUDIO.renderItem(document.createElement("canvas"), arg[0], arg[1], arg[2], { P: arg[3] })', [kind, who, id, P_PNG]);
    if (clipped) console.warn('  ! 画框边缘有内容，可能被裁切：', file);
    save(path.join(OUT, file), b64);
    manifest.png.files.push({ file, who: who || 'duo', kind, id, name });
  }
  console.log(`png: ${jobs.length} files`);
}

async function exportRefs(page, manifest) {
  const ids = await page.evaluate(() => STUDIO.REFS.map((r) => r.id));
  manifest.refs = [];
  for (const id of ids) {
    const { b64 } = await grab(page, 'STUDIO.renderRef(document.createElement("canvas"), arg, 4)', id, 'image/jpeg');
    save(path.join(OUT, `refs/${id}.jpg`), b64);
    manifest.refs.push(`refs/${id}.jpg`);
  }
  console.log(`refs: ${ids.length} files`);
}

async function exportSheets(page, manifest) {
  const ids = await page.evaluate(() => Object.keys(STUDIO.SHEETS));
  manifest.sheets = [];
  for (const id of ids) {
    const { b64 } = await grab(page, 'STUDIO.renderSheet(document.createElement("canvas"), arg[0], arg[1], 0.3)', [id, P_SHEET], 'image/jpeg');
    save(path.join(OUT, `sheets/${id}.jpg`), b64);
    manifest.sheets.push(`sheets/${id}.jpg`);
  }
  console.log(`sheets: ${ids.length} files`);
}

async function exportLoops(page, manifest) {
  const loops = await page.evaluate(() => STUDIO.LOOPS.map((l) => ({ id: l.id, name: l.name, dur: l.dur, who: l.who })));
  const keep = args.includes('--keep-frames');
  const box = await page.evaluate(() => [STUDIO.BOX, STUDIO.DUO_BOX]);
  const frame = (b) => ({ size: [b.w * P_LOOP, b.h * P_LOOP], anchor: [-b.x * P_LOOP, -b.y * P_LOOP] });
  manifest.loops = { fps: FPS, note: 'webm 带透明通道（VP9 alpha）；mp4 / gif 为纸色背景（gif 为一半尺寸、一半帧率）。首尾无缝，可以直接循环播放', single: frame(box[0]), duo: frame(box[1]), files: [] };
  for (const L of loops) {
    const n = Math.round(L.dur * FPS);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-'));
    const dirs = { alpha: path.join(tmp, 'alpha'), paper: path.join(tmp, 'paper') };
    Object.values(dirs).forEach((d) => fs.mkdirSync(d));
    for (let i = 0; i < n; i++) {
      const t = (i / n) * L.dur;
      for (const [k, bg] of [['alpha', null], ['paper', 'paper']]) {
        const { b64 } = await grab(page, 'STUDIO.renderItem(document.createElement("canvas"), "loop", null, arg[0], { P: arg[1], t: arg[2], bg: arg[3] })', [L.id, P_LOOP, t, bg]);
        save(path.join(dirs[k], `${String(i).padStart(4, '0')}.png`), b64);
      }
    }
    const base = path.join(OUT, 'loops', L.id);
    fs.mkdirSync(path.dirname(base), { recursive: true });
    const ff = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a]);
    const inp = (d) => ['-framerate', String(FPS), '-i', path.join(d, '%04d.png')];
    ff([...inp(dirs.alpha), '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '30', '-row-mt', '1', '-auto-alt-ref', '0', base + '.webm']);
    ff([...inp(dirs.paper), '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', base + '.mp4']);
    ff([...inp(dirs.paper), '-vf', `fps=${FPS / 2},scale=iw/2:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0', base + '.gif']);
    if (keep) {
      const fd = path.join(OUT, 'loops', 'frames', L.id);
      fs.rmSync(fd, { recursive: true, force: true });
      fs.mkdirSync(path.dirname(fd), { recursive: true });
      fs.cpSync(dirs.alpha, fd, { recursive: true });
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    manifest.loops.files.push({ id: L.id, name: L.name, seconds: +(n / FPS).toFixed(3), frames: n, files: ['webm', 'mp4', 'gif'].map((e) => `loops/${L.id}.${e}`) });
    console.log(`loop ${L.id}: ${n} frames`);
  }
}

(async () => {
  const browser = await chromium.launch();
  const manifestFile = path.join(OUT, 'manifest.json');
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};
  try {
    const page = await openPage(browser);
    manifest.palette = await page.evaluate(() => STUDIO.PALETTE);
    if (only.includes('png')) await exportPng(page, manifest);
    if (only.includes('refs')) await exportRefs(page, manifest);
    if (only.includes('sheets')) await exportSheets(page, manifest);
    if (only.includes('loops')) await exportLoops(page, manifest);
  } finally {
    await browser.close();
  }
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  console.log('wrote', rel(manifestFile));
})();
