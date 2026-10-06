// Procedural canvas textures (all deterministic, cached where shared).
import * as THREE from 'three';
import { rng, fbm, noise2 } from './math.js';

const cache = new Map();
export function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

export function tex(c, { repeat = null, srgb = true, keep = false, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.userData.keep = keep;
  return t;
}
function cached(key, make) { if (!cache.has(key)) { const t = make(); t.userData.keep = true; cache.set(key, t); } return cache.get(key); }

// pre-lit billowy puff: union of sphere bumps -> height field -> lambert shading in RGB, coverage in A
export function cloudSprite(seed = 1) {
  return cached('cloud' + seed, () => {
    const s = 256, c = canvas(s, s), g = c.getContext('2d'); const img = g.createImageData(s, s); const r = rng(seed * 31 + 7);
    const blobs = [[.5, .55, .36]]; for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, d = r() * .2; blobs.push([.5 + Math.cos(a) * d, .52 + Math.sin(a) * d * .9 - .03, .13 + r() * .14]); }
    const H = new Float32Array(s * s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const u = x / s, v = y / s; let h = 0;
      for (const [bx, by, br] of blobs) { const d2 = ((u - bx) ** 2 + (v - by) ** 2) / (br * br); if (d2 < 1) h = Math.max(h, Math.sqrt(1 - d2) * br); }
      h += (fbm(x / 18 + seed * 9, y / 18, 4) - .5) * .05; H[y * s + x] = Math.max(0, h);
    }
    for (let y = 1; y < s - 1; y++) for (let x = 1; x < s - 1; x++) {
      const i = y * s + x; const h = H[i];
      const nx = (H[i - 1] - H[i + 1]) * 40, ny = (H[i - s] - H[i + s]) * 40; const nz = 1;
      const len = Math.hypot(nx, ny, nz); const L = (-nx * .45 + ny * .75 * -1 + nz * .5) / len; // light from top-left
      const lit = Math.max(0, Math.min(1, .55 + L * .5));
      const cov = h / .36, nn = fbm(x / 14 + seed * 3, y / 14, 4); const e0 = Math.min(1, Math.max(0, (cov + (nn - .5) * .45 - .03) / .4)); const a = e0 * e0 * (3 - 2 * e0) * (.82 + nn * .3);
      const o = i * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = lit * 255; img.data[o + 3] = Math.min(255, a * 255);
    }
    g.putImageData(img, 0, 0); return tex(c, { srgb: false });
  });
}
export function softDot() {
  return cached('dot', () => {
    const s = 128, c = canvas(s, s), g = c.getContext('2d'); const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.8)'); gr.addColorStop(.6, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s); return tex(c, { srgb: false });
  });
}
export function flameSprite() {
  return cached('flame', () => {
    const s = 128, c = canvas(s, s), g = c.getContext('2d'); const img = g.createImageData(s, s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const dx = (x - s / 2) / (s / 2), dy = (y - s * .62) / (s / 2);
      const w = .55 * (1 - Math.max(0, -dy) * .8); const d = Math.sqrt((dx / w) ** 2 + dy * dy * (dy < 0 ? .5 : 1.6));
      const n = fbm(x / 20, y / 14, 4); let a = Math.max(0, 1 - d) * (.6 + n * .8); a = Math.min(1, a * 1.4);
      const i = (y * s + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a * 255;
    }
    g.putImageData(img, 0, 0); return tex(c, { srgb: false });
  });
}
export function streakSprite() {
  return cached('streak', () => {
    const c = canvas(16, 128), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.7, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(6, 0, 4, 128); return tex(c, { srgb: false });
  });
}

// generic noisy surface texture
export function surface(key, base, { w = 512, h = 512, scale = 40, amt = .18, lines = null, seed = 3, draw = null, repeat = [1, 1] } = {}) {
  return cached('surf' + key, () => {
    const c = canvas(w, h), g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, w, h);
    const img = g.getImageData(0, 0, w, h); const r = rng(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = (fbm(x / scale, y / scale, 4) - .5) * 2 * amt + (r() - .5) * amt * .35; const i = (y * w + x) * 4;
      for (let k = 0; k < 3; k++) img.data[i + k] = Math.max(0, Math.min(255, img.data[i + k] * (1 + n)));
    }
    g.putImageData(img, 0, 0);
    if (draw) draw(g, w, h, r);
    const t = tex(c, { repeat }); return t;
  });
}

export const woodTex = () => surface('wood', '#7a4b2a', { scale: 6, amt: .22, draw: (g, w, h, r) => {
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(40,20,8,${r() * .25})`; g.lineWidth = r() * 2 + .5; const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + r() * 10 - 5, w * .7, y + r() * 10 - 5, w, y + r() * 6 - 3); g.stroke(); }
}, repeat: [1, 1] });
export const planksTex = () => surface('planks', '#5b3a22', { scale: 10, amt: .2, draw: (g, w, h, r) => {
  for (let y = 0; y < h; y += 32) { g.fillStyle = `rgba(0,0,0,${.15 + r() * .2})`; g.fillRect(0, y, w, 2); g.fillStyle = `rgba(255,220,180,${r() * .06})`; g.fillRect(0, y + 2, w, 30); }
}, repeat: [2, 2] });
export const concreteTex = () => surface('concrete', '#9a948a', { scale: 30, amt: .14, repeat: [2, 2] });
export const sandTex = () => surface('sand', '#c9a06a', { scale: 25, amt: .16, draw: (g, w, h, r) => { for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(90,60,30,${r() * .25})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); } }, repeat: [30, 30] });
export const grassTex = () => surface('grass', '#4d6b2e', { scale: 14, amt: .3, repeat: [40, 40] });
export const asphaltTex = () => surface('asph', '#3a3a3c', { scale: 8, amt: .2, repeat: [10, 10] });
export const metalTex = () => surface('metal', '#c9ced3', { scale: 60, amt: .06, draw: (g, w, h, r) => {
  g.strokeStyle = 'rgba(40,45,50,.35)'; g.lineWidth = 1.5;
  for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = 'rgba(40,45,50,.25)'; for (let x = 4; x < w; x += 64) for (let y = 3; y < h; y += 8) g.fillRect(x, y, 1.5, 1.5);
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,255,255,${r() * .08})`; g.fillRect(Math.floor(r() * 8) * 64, Math.floor(r() * 12) * 42, 64, 42); }
}, repeat: [4, 1] });
export const roofTileTex = () => surface('roof', '#3d4450', { scale: 10, amt: .2, draw: (g, w, h) => {
  for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, w, 3); for (let x = (y / 16) % 2 * 8; x < w; x += 16) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x, y, 2, 16); } }
}, repeat: [1, 1] });
export const paperTex = () => surface('paper', '#eee6d3', { scale: 50, amt: .06, seed: 9, repeat: [1, 1] });

// normal-ish bump for water: we fake with a noise texture used as normalMap
export function waterNormal() {
  return cached('waternrm', () => {
    const s = 256, c = canvas(s, s), g = c.getContext('2d'); const img = g.createImageData(s, s);
    const hgt = (x, y) => fbm(x / 22, y / 22, 4) + .5 * fbm(x / 7 + 40, y / 7, 2);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const dx = hgt((x + 1) % s, y) - hgt((x - 1 + s) % s, y), dy = hgt(x, (y + 1) % s) - hgt(x, (y - 1 + s) % s);
      const i = (y * s + x) * 4; img.data[i] = 128 + dx * 500; img.data[i + 1] = 128 + dy * 500; img.data[i + 2] = 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); return tex(c, { srgb: false, repeat: [20, 20] });
  });
}

// text drawn on a transparent/colored canvas
export function textTex(lines, { w = 1024, h = 256, font = '700 120px Oswald', color = '#fff', bg = null, align = 'center', lineH = 1.1, stroke = null, pad = 20, shadow = null } = {}) {
  const c = canvas(w, h), g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
  const L = Array.isArray(lines) ? lines : [lines]; const size = parseInt(font.match(/(\d+)px/)[1]);
  const x = align === 'center' ? w / 2 : align === 'left' ? pad : w - pad;
  L.forEach((s, i) => {
    const y = h / 2 + (i - (L.length - 1) / 2) * size * lineH;
    if (shadow) { g.shadowColor = shadow; g.shadowBlur = 12; }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = size * .08; g.strokeText(s, x, y); }
    g.fillText(s, x, y);
  });
  return tex(c);
}
