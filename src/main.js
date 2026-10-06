// Boot: loads narration + fonts, builds the shot list, exposes a deterministic frame API for render.js,
// and a realtime preview (voice + Web Audio SFX) for the browser.
import { Engine, W, H, DEFAULT_GRADE, disposeScene } from './core/engine.js';
import { setNarration } from './core/time.js';
import { buildShots } from './shots/index.js';
import { drawCaptions } from './2d/captions.js';
import { renderSfx, sfxToWav, setScore } from './audio/score.js';
import { clamp } from './core/math.js';
import { loadWorld } from './2d/maps.js';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
if (RENDER) document.body.classList.add('render');

const engine = new Engine(document.getElementById('gl'));
const ov = document.getElementById('ov'); const g = ov.getContext('2d');
let SHOTS = [], DURATION = 0, current = null, currentIdx = -1, showCaptions = params.get('captions') !== '0';

async function init() {
  const data = await (await fetch('assets/narration.json')).json();
  setNarration(data);
  await loadWorld();
  const fams = ['700 40px Oswald', '500 40px Oswald', '400 40px Oswald', 'italic 400 40px "Playfair Display"', '700 40px "Playfair Display"', 'italic 700 40px "Playfair Display"', '400 40px Inter', '600 40px Inter', '800 40px Inter', '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"', '700 40px "Noto Serif JP"'];
  await Promise.all(fams.map((f) => document.fonts.load(f, f.includes('Noto') ? '広島長崎被爆者安らかに眠って下さい過ちは繰返しませぬから朕深ク世界ノ大勢ト帝國現狀鑑' : 'Aa1')));
  await document.fonts.ready;
  DURATION = data.words[data.words.length - 1][2] + 1.2;
  SHOTS = buildShots({ engine, DURATION });
  for (let i = 0; i < SHOTS.length; i++) SHOTS[i].t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : DURATION;
  setScore(SHOTS);
  return { duration: DURATION, shots: SHOTS.length };
}

function findShot(t) {
  let lo = 0, hi = SHOTS.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m].t0 <= t) lo = m; else hi = m - 1; }
  return lo;
}

function frame(t) {
  const idx = findShot(t); const sh = SHOTS[idx];
  if (idx !== currentIdx) {
    if (current) { current.dispose && current.dispose(); disposeScene(current.scene); if (current.scene?.userData.envRT) current.scene.userData.envRT.dispose(); }
    current = sh.make({ engine, t0: sh.t0, t1: sh.t1, dur: sh.t1 - sh.t0 }) || {};
    currentIdx = idx;
  }
  const S = current; const lt = t - sh.t0; const dur = sh.t1 - sh.t0;
  if (S.update0) S.update0(lt, t, dur);
  if (S.update) S.update(lt, t, dur);
  if (S.sky && S.camera) S.sky.position.copy(S.camera.position);
  if (S.scene) S.scene.traverse((o) => { if (o.userData.tick) o.userData.tick(lt, t); });
  if (S.particles && S.camera) for (const p of S.particles) p.update(p.userData.t ? p.userData.t(lt, t) : lt, S.camera, S.scene);
  const gr = { ...DEFAULT_GRADE, ...(typeof S.grade === 'function' ? S.grade(lt, t, dur) : S.grade || {}) };
  // global transition: quick fade-in from black at shot head if requested
  if (S.fadeIn) gr.fade = Math.max(gr.fade, 1 - clamp(lt / S.fadeIn));
  if (S.fadeOut) gr.fade = Math.max(gr.fade, 1 - clamp((dur - lt) / S.fadeOut));
  if (S.flashIn) gr.flash = Math.max(gr.flash, 1 - clamp(lt / S.flashIn));
  engine.render(S.scene, S.camera, gr, Math.floor(t * 30));
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.globalAlpha = 1;
  if (S.draw) { g.save(); S.draw(g, lt, t, dur); g.restore(); }
  if (showCaptions && S.captions !== false) drawCaptions(g, t, S.captionStyle);
  if (gr.fade > 0 && S.fadeOverlay !== false) { g.fillStyle = `rgba(0,0,0,${gr.fade})`; g.fillRect(0, 0, W, H); }
}

// ---------- API for render.js ----------
let sfxPCM = null;
window.__init = init;
window.__frame = (t) => { frame(t); return true; };
window.__audioProgress = 0;
window.__buildAudio = async (sampleRate = 48000, from = 0, to = DURATION) => {
  const buf = await renderSfx(DURATION, sampleRate, from, to, (p) => (window.__audioProgress = p));
  sfxPCM = sfxToWav(buf); return { bytes: sfxPCM.length, chunks: Math.ceil(sfxPCM.length / (4 << 20)) };
};
window.__audioChunk = (i) => {
  const sz = 4 << 20; const part = sfxPCM.subarray(i * sz, Math.min(sfxPCM.length, (i + 1) * sz));
  let s = ''; for (let k = 0; k < part.length; k += 0x8000) s += String.fromCharCode.apply(null, part.subarray(k, k + 0x8000));
  return btoa(s);
};

// ---------- realtime preview ----------
async function preview() {
  const info = document.getElementById('info'), btn = document.getElementById('play'), bar = document.getElementById('bar'), fill = document.getElementById('fill');
  document.getElementById('cap').onchange = (e) => (showCaptions = e.target.checked);
  const fit = () => { const s = Math.min(innerWidth / W, (innerHeight - 40) / H); document.getElementById('stage').style.transform = `scale(${s})`; };
  addEventListener('resize', fit); fit();
  await init();
  info.textContent = 'building Web Audio SFX…';
  const ac = new AudioContext();
  const sfx0 = await renderSfx(DURATION, ac.sampleRate, 0, DURATION, (p) => (info.textContent = `building Web Audio SFX… ${Math.round(p * 100)}%`));
  const sfx = ac.createBuffer(2, sfx0.length, ac.sampleRate); sfx.copyToChannel(sfx0.getChannelData(0), 0); sfx.copyToChannel(sfx0.getChannelData(1), 1);
  const voice = await ac.decodeAudioData(await (await fetch('assets/voice.mp3')).arrayBuffer());
  let playing = false, startAt = 0, offset = +(params.get('t') || 0), srcs = [];
  const now = () => (playing ? ac.currentTime - startAt : offset);
  const stop = () => { srcs.forEach((s) => s.stop()); srcs = []; };
  const play = () => {
    stop(); const o = now();
    for (const [b, gain] of [[voice, 1], [sfx, 1]]) { const s = ac.createBufferSource(); s.buffer = b; const gn = ac.createGain(); gn.gain.value = gain; s.connect(gn).connect(ac.destination); s.start(0, Math.min(o, b.duration - .01)); srcs.push(s); }
    startAt = ac.currentTime - o; playing = true; btn.textContent = '❚❚ Pause';
  };
  const pause = () => { offset = now(); playing = false; stop(); btn.textContent = '▶ Play'; };
  btn.onclick = () => { ac.resume(); playing ? pause() : play(); };
  addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); btn.onclick(); } });
  bar.onclick = (e) => { const r = bar.getBoundingClientRect(); offset = (e.clientX - r.left) / r.width * DURATION; if (playing) { playing = false; play(); } };
  const loop = () => {
    const t = Math.min(now(), DURATION - .01); frame(t);
    const sh = SHOTS[currentIdx];
    info.textContent = `${t.toFixed(2)}s / ${DURATION.toFixed(0)}s · shot ${currentIdx + 1}/${SHOTS.length} ${sh.name || ''}`;
    fill.style.width = (t / DURATION * 100) + '%';
    requestAnimationFrame(loop);
  };
  loop();
}
if (!RENDER) preview();
