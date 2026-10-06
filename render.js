// Offline renderer: Puppeteer drives the page frame-by-frame (deterministic, 30 fps, 1920x1080),
// pipes JPEG frames into ffmpeg, renders the Web Audio SFX offline, then mixes them under the voice-over.
//
//   node render.js                      full video  -> out/hiroshima_countdown.mp4
//   node render.js --workers 3          parallel chunks (each worker = own browser)
//   node render.js --start 400 --end 480 --out out/test.mp4
//   node render.js --stills 5,60,430    PNG stills into out/stills/
//   options: --fps 30 --crf 17 --captions 0 --no-audio --chunk 30 --sfx-gain 1.0
//   env: CHROME_PATH=/path/to/chrome   FFMPEG_PATH=/path/to/ffmpeg
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { startServer } from './server.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const FPS = +arg('fps', 30), CRF = +arg('crf', 17), CHUNK = +arg('chunk', 30), WORKERS = +arg('workers', 1);
const CAPTIONS = arg('captions', '1') !== '0', NO_AUDIO = !!arg('no-audio', false), SFX_GAIN = +arg('sfx-gain', 1);
const OUT = path.resolve(arg('out', 'out/hiroshima_countdown.mp4'));
const STILLS = arg('stills', null);

let FFMPEG = process.env.FFMPEG_PATH;
if (!FFMPEG) { try { FFMPEG = (await import('ffmpeg-static')).default; } catch { FFMPEG = 'ffmpeg'; } }

const chromeArgs = ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-unsafe-swiftshader',
  '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--hide-scrollbars'];

async function openPage(port) {
  const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined, args: chromeArgs, protocolTimeout: 0 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on('console', (m) => { const x = m.text(); if ((m.type() === 'error' || m.type() === 'warn') && !/GL Driver|GPU stall|favicon|404/.test(x)) console.log('[page]', x); });
  page.on('pageerror', (e) => console.log('[page error]', e.message));
  await page.goto(`http://localhost:${port}/?render&captions=${CAPTIONS ? 1 : 0}`, { waitUntil: 'load', timeout: 0 });
  const info = await page.evaluate(() => window.__init());
  return { browser, page, info };
}

function ffmpeg(args, opts = {}) {
  const p = spawn(FFMPEG, args, { stdio: [opts.stdin ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
  let err = ''; p.stderr.on('data', (d) => { err += d; if (err.length > 20000) err = err.slice(-10000); });
  p.done = new Promise((res, rej) => p.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg failed:\n' + err.slice(-3000))))));
  return p;
}
const write = (s, b) => new Promise((res) => (s.write(b) ? res() : s.once('drain', res)));
const hms = (s) => `${Math.floor(s / 3600)}h${String(Math.floor(s / 60) % 60).padStart(2, '0')}m${String(Math.floor(s % 60)).padStart(2, '0')}s`;

async function renderChunk(page, f0, f1, file) {
  const tmp = file + '.part.mp4';
  const ff = ffmpeg(['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-r', String(FPS), '-f', 'mp4', tmp], { stdin: true });
  for (let f = f0; f < f1; f++) {
    await page.evaluate((t) => window.__frame(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 94, optimizeForSpeed: true });
    await write(ff.stdin, buf);
    progress.done++;
  }
  ff.stdin.end(); await ff.done; fs.renameSync(tmp, file);
}

const progress = { done: 0, total: 0, t0: Date.now() };
function report() {
  const el = (Date.now() - progress.t0) / 1000, r = progress.done / Math.max(1, el);
  process.stdout.write(`\r  frames ${progress.done}/${progress.total}  ${r.toFixed(1)} fps  elapsed ${hms(el)}  ETA ${hms((progress.total - progress.done) / Math.max(r, .001))}   `);
}

async function main() {
  const server = await startServer(0); const port = server.address().port;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  if (STILLS) {
    const { browser, page } = await openPage(port); const dir = path.join(ROOT, 'out', 'stills'); fs.mkdirSync(dir, { recursive: true });
    for (const s of String(STILLS).split(',')) {
      const t = +s; const t0 = Date.now(); await page.evaluate((x) => window.__frame(x), t);
      const f = path.join(dir, `t_${t.toFixed(2).padStart(7, '0')}.png`); await page.screenshot({ path: f });
      console.log('still', f, (Date.now() - t0) + 'ms');
    }
    await browser.close(); server.close(); return;
  }

  // probe duration
  const probe = await openPage(port); const DUR = probe.info.duration;
  const start = +arg('start', 0), end = Math.min(+arg('end', DUR), DUR);
  const F0 = Math.round(start * FPS), F1 = Math.round(end * FPS);
  console.log(`Rendering ${start}s → ${end.toFixed(2)}s  (${F1 - F0} frames @ ${FPS}fps, ${probe.info.shots} shots, ${WORKERS} worker(s))`);

  // chunked + resumable: out/<name>_chunks/cXXXXX.mp4
  const chunkDir = OUT.replace(/\.mp4$/, '') + `_chunks_${F0}_${F1}`; fs.mkdirSync(chunkDir, { recursive: true });
  const jobs = []; for (let f = F0; f < F1; f += CHUNK * FPS) jobs.push([f, Math.min(F1, f + CHUNK * FPS)]);
  const files = jobs.map(([a]) => path.join(chunkDir, `c${String(a).padStart(6, '0')}.mp4`));
  const todo = jobs.map((j, i) => [...j, files[i]]).filter(([, , f]) => !fs.existsSync(f));
  progress.total = todo.reduce((s, [a, b]) => s + b - a, 0);
  const timer = setInterval(report, 1000);

  const pages = [probe]; for (let i = 1; i < Math.min(WORKERS, todo.length); i++) pages.push(await openPage(port));
  let next = 0;
  await Promise.all(pages.map(async ({ page }) => { while (next < todo.length) { const [a, b, f] = todo[next++]; await renderChunk(page, a, b, f); } }));
  clearInterval(timer); report(); console.log('');

  // audio from the same page (OfflineAudioContext)
  let wav = null;
  if (!NO_AUDIO) {
    console.log('Rendering Web Audio SFX offline…');
    const prog = setInterval(async () => { try { const p = await probe.page.evaluate(() => window.__audioProgress); process.stdout.write(`\r  audio ${Math.round(p * 100)}%   `); } catch {} }, 2000);
    const { chunks } = await probe.page.evaluate((a, b) => window.__buildAudio(48000, a, b), start, end);
    clearInterval(prog); console.log('');
    const parts = []; for (let i = 0; i < chunks; i++) parts.push(Buffer.from(await probe.page.evaluate((k) => window.__audioChunk(k), i), 'base64'));
    wav = path.join(chunkDir, 'sfx.wav'); fs.writeFileSync(wav, Buffer.concat(parts));
  }
  for (const p of pages) await p.browser.close();
  server.close();

  console.log('Concatenating…');
  const list = path.join(chunkDir, 'list.txt'); fs.writeFileSync(list, files.map((f) => `file '${f.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  const silent = OUT.replace(/\.mp4$/, '') + '_video_only.mp4';
  await ffmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]).done;
  if (NO_AUDIO) { fs.renameSync(silent, OUT); console.log('Done →', OUT); return; }

  console.log('Mixing voice-over + SFX (SFX ducked under the voice)…');
  const voice = path.join(ROOT, 'assets', 'voice.mp3');
  await ffmpeg(['-y', '-i', silent, '-ss', String(start), '-t', String(end - start), '-i', voice, '-i', wav,
    '-filter_complex', `[1:a]aresample=48000,asplit=2[v1][v2];[2:a]volume=${SFX_GAIN}[s];[s][v1]sidechaincompress=threshold=0.04:ratio=3:attack=15:release=350[sd];[v2][sd]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', OUT]).done;
  fs.unlinkSync(silent);
  console.log('Done →', OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
