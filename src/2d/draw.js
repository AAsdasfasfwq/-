// 2D overlay toolkit: typography with motion blur, backgrounds, panels, lower thirds.
import { clamp, easeOut, expoOut, backOut, smooth, rng, lerp } from '../core/math.js';
export const W = 1920, H = 1080;

export const PAL = {
  red: '#e0312b', amber: '#f2a541', cream: '#efe8d8', ink: '#0d0e12', paper: '#e9e7e2', teal: '#4fb3bf', blood: '#8e0f12', gold: '#d9a441', steel: '#9aa7b4',
};
export const F = {
  title: (s, w = 700) => `${w} ${s}px Oswald`,
  serif: (s, w = 400) => `italic ${w} ${s}px "Playfair Display"`,
  serifB: (s) => `700 ${s}px "Playfair Display"`,
  sans: (s, w = 800) => `${w} ${s}px Inter`,
  mono: (s, w = 400) => `${w} ${s}px "JetBrains Mono"`,
  jp: (s) => `700 ${s}px "Noto Serif JP"`,
};

export function text(g, s, x, y, { font = F.sans(40), color = '#fff', align = 'center', base = 'middle', track = 0, alpha = 1, shadow = null, stroke = null, strokeW = 0 } = {}) {
  if (alpha <= 0) return 0;
  g.save(); g.globalAlpha *= alpha; g.font = font; g.textAlign = align; g.textBaseline = base; g.letterSpacing = track + 'px';
  if (shadow) { g.shadowColor = shadow[0]; g.shadowBlur = shadow[1]; g.shadowOffsetY = shadow[2] || 0; }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = strokeW; g.lineJoin = 'round'; g.strokeText(s, x + (align === 'center' ? track / 2 : 0), y); }
  const ox = align === 'center' ? track / 2 : align === 'right' ? track : 0;
  g.fillStyle = color; g.fillText(s, x + ox, y);
  const w = g.measureText(s).width - track; g.restore(); return w;
}
export function measure(g, s, font, track = 0) { g.save(); g.font = font; g.letterSpacing = track + 'px'; const w = g.measureText(s).width - track; g.restore(); return w; }

// per-letter reveal with directional motion blur (the "stylish montage" look)
export function reveal(g, s, x, y, p, { font = F.sans(80), color = '#fff', align = 'center', track = 0, stagger = .5, dy = 40, dx = 0, blur = true, shadow = null, alpha = 1, scaleFrom = 1 } = {}) {
  if (p <= 0 || alpha <= 0) return;
  g.save(); g.font = font; g.letterSpacing = '0px'; g.textBaseline = 'middle'; g.textAlign = 'left';
  const total = [...s].reduce((a, ch) => a + g.measureText(ch).width + track, 0) - track; let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const chars = [...s]; const n = chars.length;
  if (shadow) { g.shadowColor = shadow[0]; g.shadowBlur = shadow[1]; g.shadowOffsetY = shadow[2] || 0; }
  for (let i = 0; i < n; i++) {
    const ch = chars[i]; const cw = g.measureText(ch).width + track;
    const lp = clamp((p * (1 + stagger * (n - 1) / Math.max(1, n)) - (stagger * i / Math.max(1, n))) / 1);
    const e = expoOut(lp); const a = clamp(lp * 2.5) * alpha;
    const ox = (1 - e) * dx, oy = (1 - e) * dy;
    g.fillStyle = color;
    if (blur && e < .98) {
      for (let k = 3; k >= 1; k--) { g.globalAlpha = a * .18; g.fillText(ch, cx + ox + (dx ? k * (1 - e) * dx * .25 : 0), y + oy + (dy ? k * (1 - e) * dy * .25 : 0)); }
    }
    g.globalAlpha = a;
    if (scaleFrom !== 1) { const sc = lerp(scaleFrom, 1, e); g.save(); g.translate(cx + cw / 2 + ox, y + oy); g.scale(sc, sc); g.fillText(ch, -cw / 2, 0); g.restore(); }
    else g.fillText(ch, cx + ox, y + oy);
    cx += cw;
  }
  g.restore();
}

export function typeText(g, s, x, y, p, { font = F.mono(34), color = '#e8e2d0', align = 'left', cursor = true, alpha = 1, track = 0 } = {}) {
  const n = Math.floor(clamp(p) * s.length); const shown = s.slice(0, n);
  const w = text(g, shown, x, y, { font, color, align, alpha, track });
  if (cursor && p < 1.2 && Math.floor(performance.now ? 0 : 0) === 0) {
    const blink = (Math.floor(p * s.length) % 2 === 0) || p < 1;
    if (blink) { g.save(); g.globalAlpha = alpha; g.fillStyle = color; const fs = parseInt(font.match(/(\d+)px/)[1]); g.fillRect(align === 'left' ? x + w + 4 : x + w / 2 + 4, y - fs * .45, fs * .5, fs * .9); g.restore(); }
  }
  return w;
}

export function wrap(g, s, maxW, font) {
  g.save(); g.font = font; const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); g.restore(); return lines;
}

export function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// ---------- backgrounds ----------
let grainC = null;
function grainCanvas() {
  if (grainC) return grainC; grainC = document.createElement('canvas'); grainC.width = grainC.height = 256; const gg = grainC.getContext('2d');
  const im = gg.createImageData(256, 256); const r = rng(77); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 22; }
  gg.putImageData(im, 0, 0); return grainC;
}
export function grain(g, t, amt = 1) {
  const c = grainCanvas(); g.save(); g.globalAlpha = amt; const r = rng(Math.floor(t * 30) + 1);
  g.translate(-r() * 256, -r() * 256); g.fillStyle = g.createPattern(c, 'repeat'); g.fillRect(0, 0, W + 256, H + 256); g.restore();
}
export function paperBG(g, t, { tone = '#e8e6e1', deco = true } = {}) {
  g.fillStyle = tone; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W / 2, H * .45, 100, W / 2, H / 2, W * .75); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(0,0,0,.12)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (deco) { // soft dark petals in the corners, slowly rotating (ref: "stylish montage 2")
    for (const [cx, cy, ph] of [[-40, -30, 0], [W + 30, H + 40, 2]]) {
      g.save(); g.translate(cx, cy); g.rotate(t * .05 + ph);
      for (let i = 0; i < 5; i++) { g.rotate(Math.PI * 2 / 5); g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = '#111';
        g.beginPath(); g.ellipse(150, 0, 140, 34, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      g.restore();
    }
  }
  grain(g, t, .6);
}
export function inkBG(g, t, { top = '#14161c', bottom = '#07080a', gridA = .05, accent = null } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (gridA) { g.strokeStyle = `rgba(255,255,255,${gridA})`; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= W; x += 80) { g.moveTo(x + .5, 0); g.lineTo(x + .5, H); } for (let y = 0; y <= H; y += 80) { g.moveTo(0, y + .5); g.lineTo(W, y + .5); } g.stroke(); }
  if (accent) { const r = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .6); r.addColorStop(0, accent); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, W, H); }
  vignette(g, .55); grain(g, t, .8);
}
export function noirBG(g, t, { col = '#8f0d10', col2 = '#3a0204' } = {}) {
  const gr = g.createRadialGradient(W * .5, H * .4, 50, W * .5, H * .5, W * .8); gr.addColorStop(0, col); gr.addColorStop(1, col2); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .12; g.strokeStyle = '#fff'; g.lineWidth = 60; // big diagonal shapes
  for (let i = -2; i < 8; i++) { const x = i * 360 + (t * 20) % 360; g.beginPath(); g.moveTo(x, H + 100); g.lineTo(x + 500, -100); g.stroke(); }
  g.restore(); vignette(g, .6); grain(g, t, .9);
}
export function vignette(g, a = .5) {
  const r = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .72); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = r; g.fillRect(0, 0, W, H);
}

// ---------- lower third (name tag) ----------
export function lowerThird(g, lt, name, role, { x = 120, y = 860, out = 99, color = PAL.red, align = 'left' } = {}) {
  const pin = easeOut(lt / .45), pout = clamp((lt - out) / .35); if (pin <= 0 || pout >= 1) return;
  const a = 1 - pout; g.save(); g.globalAlpha = a;
  const nw = measure(g, name, F.title(56), 2), rw = measure(g, role, F.serif(30));
  const bw = Math.max(nw, rw) + 60; const xx = align === 'right' ? W - x - bw : x;
  g.fillStyle = 'rgba(8,8,10,.62)'; g.fillRect(xx, y - 52, bw * pin, 120);
  g.fillStyle = color; g.fillRect(xx, y - 52, 8, 120 * pin);
  g.save(); g.beginPath(); g.rect(xx, y - 60, bw * pin, 140); g.clip();
  text(g, name, xx + 34, y - 8, { font: F.title(56), align: 'left', track: 2, color: '#fff' });
  text(g, role, xx + 36, y + 40, { font: F.serif(30), align: 'left', color: '#e8d9c0' });
  g.restore(); g.restore();
}

// big label that pops in (for numbers / key facts on top of 3D)
export function stamp(g, lt, s, x, y, { font = F.title(120), color = '#fff', bg = null, out = 99, track = 4, pad = 30, rot = 0, shadow = ['rgba(0,0,0,.6)', 30, 8] } = {}) {
  const p = clamp(lt / .35), po = clamp((lt - out) / .3); if (p <= 0 || po >= 1) return;
  const sc = backOut(p, 2.2) * (1 + po * .2); g.save(); g.globalAlpha = (1 - po) * clamp(p * 3); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  if (bg) { const w = measure(g, s, font, track) + pad * 2; const fs = parseInt(font.match(/(\d+)px/)[1]); g.fillStyle = bg; g.fillRect(-w / 2, -fs * .7, w, fs * 1.4); }
  text(g, s, 0, 0, { font, color, track, shadow }); g.restore();
}

export function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
