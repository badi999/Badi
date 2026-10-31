#!/usr/bin/env node
// Renders scene.html frame-by-frame with Chromium (Playwright) and encodes with ffmpeg.
// usage: node render.js [--fps 30] [--workers 3] [--from s] [--to s] [--still t1,t2,...]
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = __dirname, B = p => path.join(ROOT, 'build', p);
const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; };
const FPS = +(opt('fps') || 30), WORKERS = +(opt('workers') || 3);

function writeData() {
  const tl = JSON.parse(fs.readFileSync(B('timeline.json'))), subs = JSON.parse(fs.readFileSync(B('subs.json')));
  delete tl.marks;
  fs.writeFileSync(B('data.js'), `window.TL=${JSON.stringify(tl)};\nwindow.SUBS=${JSON.stringify(subs)};\n`);
  return tl;
}
async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + path.join(ROOT, 'scene.html'));
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  return page;
}
async function stills(times) {
  const browser = await chromium.launch();
  const page = await openPage(browser);
  fs.mkdirSync(B('stills'), { recursive: true });
  for (const t of times) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: B(`stills/t_${String(t).padStart(6, '0')}.jpg`), type: 'jpeg', quality: 85 });
  }
  await browser.close();
}
async function renderRange(idx, f0, f1) {
  const out = B(`part_${idx}.mp4`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const browser = await chromium.launch();
  const page = await openPage(browser);
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 300 === 0) console.log(`[w${idx}] frame ${f - f0}/${f1 - f0}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  return out;
}
(async () => {
  const tl = writeData();
  const st = opt('still');
  if (st) { await stills(st.split(',').map(Number)); return; }
  const from = +(opt('from') || 0), to = +(opt('to') || tl.duration);
  const F0 = Math.round(from * FPS), F1 = Math.ceil(to * FPS);
  const per = Math.ceil((F1 - F0) / WORKERS);
  const jobs = [];
  for (let w = 0; w < WORKERS; w++) { const a = F0 + w * per, b = Math.min(F1, a + per); if (a < b) jobs.push(renderRange(w, a, b)); }
  const parts = await Promise.all(jobs);
  fs.writeFileSync(B('parts.txt'), parts.map(p => `file '${p}'`).join('\n'));
  const name = opt('out') || 'maktabi-ai.mp4';
  fs.mkdirSync(path.join(ROOT, 'output'), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', B('parts.txt'), '-ss', String(from), '-t', String(to - from), '-i', B('soundtrack.wav'),
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', path.join(ROOT, 'output', name)], { stdio: 'inherit' });
  console.log('done ->', path.join(ROOT, 'output', name));
})();
