// Infographic building blocks (numbers, bars, dot grids, charts, gauges, radar, clocks, quotes).
import { text, reveal, measure, F, PAL, W, H, rrect, fmt, wrap } from './draw.js';
import { clamp, expoOut, easeOut, easeInOut, backOut, lerp, smooth, rng } from '../core/math.js';

export const count = (t, t0, t1, a, b, ease = expoOut) => lerp(a, b, ease((t - t0) / (t1 - t0)));

export function panel(g, x, y, w, h, { k = 1, fill = '#f7f5f0', r = 18, shadow = true, stroke = null } = {}) {
  if (k <= 0) return; const e = expoOut(k); g.save(); g.globalAlpha *= clamp(k * 2);
  g.translate(x + w / 2, y + h / 2); g.scale(.92 + .08 * e, .92 + .08 * e); g.translate(-w / 2, -h / 2);
  if (shadow) { g.shadowColor = 'rgba(0,0,0,.28)'; g.shadowBlur = 40; g.shadowOffsetY = 18; }
  rrect(g, 0, 0, w, h, r); g.fillStyle = fill; g.fill(); g.shadowColor = 'transparent';
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); }
  g.restore();
}

// words that pop exactly when spoken: items [{s, at, x, y, font, color, out}]
export function kinetic(g, t, items) {
  for (const it of items) { const k = clamp((t - it.at + .04) / (it.dur || .45)); if (k <= 0) continue; const out = it.out != null ? clamp((t - it.out) / .3) : 0; if (out >= 1) continue;
    reveal(g, it.s, it.x, it.y, k, { font: it.font || F.title(110), color: it.color || '#fff', dy: it.dy ?? 50, dx: it.dx ?? 0, track: it.track ?? 3, alpha: 1 - out, align: it.align || 'center', shadow: it.shadow, stagger: it.stagger ?? .5 }); }
}

export function dotGrid(g, { x, y, cols, rows, gap = 22, r = 7, k = 1, active = Infinity, col = '#e8e2d0', activeCol = PAL.red, dimCol = 'rgba(255,255,255,.12)', shape = 'person', seed = 1 }) {
  const n = cols * rows; const shown = Math.floor(n * clamp(k)); const rr = rng(seed);
  for (let i = 0; i < n; i++) {
    const cx = x + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap; const on = i < shown; if (!on) continue;
    const isA = i < active; g.fillStyle = active === Infinity ? col : isA ? activeCol : dimCol;
    if (shape === 'person') { g.beginPath(); g.arc(cx, cy - r * .9, r * .45, 0, 7); g.fill(); g.beginPath(); g.roundRect(cx - r * .55, cy - r * .35, r * 1.1, r * 1.25, r * .4); g.fill(); }
    else { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); }
  }
}

export function barH(g, { x, y, w, h = 46, frac, k = 1, color = PAL.red, track = 'rgba(255,255,255,.08)', label = '', value = '', labelCol = '#fff', font = F.title(40), valueFont = F.title(44) }) {
  const e = expoOut(k); g.save(); g.globalAlpha *= clamp(k * 3);
  g.fillStyle = track; g.fillRect(x, y, w, h);
  g.fillStyle = color; g.fillRect(x, y, w * frac * e, h);
  if (label) text(g, label, x, y - 30, { font, align: 'left', color: labelCol, track: 2 });
  if (value) text(g, value, x + w * frac * e + 18, y + h / 2, { font: valueFont, align: 'left', color: labelCol });
  g.restore();
}

export function checklist(g, t, items, { x, y, gap = 110, font = F.sans(54, 800), color = '#111', box = PAL.red, sub = null }) {
  items.forEach((it, i) => {
    const k = clamp((t - it.at + .1) / .5); if (k <= 0) return; const yy = y + i * gap;
    g.save(); g.globalAlpha = clamp(k * 2); g.strokeStyle = color; g.lineWidth = 5; rrect(g, x, yy - 28, 56, 56, 8); g.stroke();
    const c = clamp((t - (it.check ?? it.at + .4)) / .35);
    if (c > 0) { g.strokeStyle = box; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); const p1 = [x + 10, yy], p2 = [x + 24, yy + 16], p3 = [x + 50, yy - 22]; g.moveTo(...p1); if (c < .4) g.lineTo(lerp(p1[0], p2[0], c / .4), lerp(p1[1], p2[1], c / .4)); else { g.lineTo(...p2); const q = (c - .4) / .6; g.lineTo(lerp(p2[0], p3[0], q), lerp(p2[1], p3[1], q)); } g.stroke(); }
    g.restore();
    reveal(g, it.s, x + 90, yy, k, { font, color, align: 'left', dx: 40, dy: 0 });
    if (it.sub) text(g, it.sub, x + 92, yy + 48, { font: F.serif(30), color: 'rgba(0,0,0,.55)', align: 'left', alpha: clamp(k * 2 - .5) });
  });
}

export function lineChart(g, pts, k, { x, y, w, h, color = PAL.red, fill = true, max = 1, width = 6, dots = false, labels = null, axisCol = 'rgba(255,255,255,.25)' }) {
  g.save(); g.strokeStyle = axisCol; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h); g.lineTo(x + w, y + h); g.stroke();
  const n = pts.length; const upto = clamp(k) * (n - 1); const P = []; for (let i = 0; i <= Math.floor(upto); i++) P.push([x + i / (n - 1) * w, y + h - pts[i] / max * h]);
  const fi = Math.floor(upto), fr = upto - fi; if (fi < n - 1) P.push([x + upto / (n - 1) * w, y + h - lerp(pts[fi], pts[fi + 1], fr) / max * h]);
  if (P.length < 2) { g.restore(); return; }
  if (fill) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, color + '66'); gr.addColorStop(1, color + '00'); g.fillStyle = gr; g.beginPath(); g.moveTo(P[0][0], y + h); P.forEach((p) => g.lineTo(...p)); g.lineTo(P[P.length - 1][0], y + h); g.fill(); }
  g.strokeStyle = color; g.lineWidth = width; g.lineJoin = 'round'; g.shadowColor = color; g.shadowBlur = 18; g.beginPath(); P.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke();
  const L = P[P.length - 1]; g.fillStyle = '#fff'; g.beginPath(); g.arc(L[0], L[1], 9, 0, 7); g.fill();
  g.restore(); return L;
}

export function gauge(g, cx, cy, r, v, { label = 'FUEL', col = PAL.amber, warn = .2, k = 1, ticks = ['E', '¼', '½', '¾', 'F'] } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2);
  g.fillStyle = '#121416'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#3a3e42'; g.stroke();
  const a0 = Math.PI * .75, a1 = Math.PI * 2.25;
  g.lineWidth = 16; g.strokeStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(cx, cy, r * .78, a0, a1); g.stroke();
  g.strokeStyle = PAL.red; g.beginPath(); g.arc(cx, cy, r * .78, a0, a0 + (a1 - a0) * warn); g.stroke();
  ticks.forEach((tk, i) => { const a = a0 + (a1 - a0) * i / (ticks.length - 1); text(g, tk, cx + Math.cos(a) * r * .55, cy + Math.sin(a) * r * .55, { font: F.title(r * .16), color: '#cfc8b8' }); });
  const a = a0 + (a1 - a0) * clamp(v); g.strokeStyle = v < warn ? PAL.red : '#f3efe6'; g.lineWidth = 8; g.lineCap = 'round'; g.shadowColor = g.strokeStyle; g.shadowBlur = 14;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * .8, cy + Math.sin(a) * r * .8); g.stroke(); g.shadowBlur = 0;
  g.fillStyle = '#d0c8b8'; g.beginPath(); g.arc(cx, cy, r * .08, 0, 7); g.fill();
  text(g, label, cx, cy + r * .45, { font: F.title(r * .17), color: col, track: 4 });
  g.restore();
}

export function radar(g, cx, cy, r, t, { blips = [], k = 1, col = '#4dff9a', label = '' } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2);
  g.fillStyle = '#04120a'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.strokeStyle = col + '55'; g.lineWidth = 2; for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, r * i / 4, 0, 7); g.stroke(); }
  g.beginPath(); g.moveTo(cx - r, cy); g.lineTo(cx + r, cy); g.moveTo(cx, cy - r); g.lineTo(cx, cy + r); g.stroke();
  const a = t * 2.2; const gr = g.createConicGradient(a - .9, cx, cy); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.14, col + 'aa'); gr.addColorStop(.143, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a - .9, a); g.fill();
  g.strokeStyle = col; g.lineWidth = 3; g.shadowColor = col; g.shadowBlur = 16; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke();
  for (const b of blips) { const ba = Math.atan2(b[1], b[0]); let d = (a - ba) % (Math.PI * 2); if (d < 0) d += Math.PI * 2; const fade = clamp(1 - d / 5); const s = b[2] || 6;
    g.fillStyle = col; g.globalAlpha = fade * clamp(k * 2); g.beginPath(); if (b[3]) { g.ellipse(cx + b[0] * r, cy + b[1] * r, s * 3, s * 1.6, ba, 0, 7); } else g.arc(cx + b[0] * r, cy + b[1] * r, s, 0, 7); g.fill(); }
  g.globalAlpha = 1; g.shadowBlur = 0; g.lineWidth = 8; g.strokeStyle = '#1b2a22'; g.beginPath(); g.arc(cx, cy, r + 4, 0, 7); g.stroke();
  if (label) text(g, label, cx, cy + r + 50, { font: F.mono(28, 700), color: col, track: 6 });
  g.restore();
}

export function clockFace(g, cx, cy, r, h, m, s = 0, { k = 1, face = '#f1ead8', ink = '#141414', hand = PAL.red, roman = false } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2); g.translate(cx, cy); const e = backOut(clamp(k), 1.4); g.scale(e, e);
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 40; g.fillStyle = face; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.shadowBlur = 0;
  g.lineWidth = r * .06; g.strokeStyle = '#2a2420'; g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; const L = i % 5 ? r * .04 : r * .1; g.strokeStyle = ink; g.lineWidth = i % 5 ? 2 : 5; g.beginPath(); g.moveTo(Math.cos(a) * (r * .9 - L), Math.sin(a) * (r * .9 - L)); g.lineTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9); g.stroke(); }
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; text(g, String(i), Math.cos(a) * r * .7, Math.sin(a) * r * .7, { font: F.serifB(r * .16), color: ink }); }
  const hd = (ang, L, w, c) => { g.save(); g.rotate(ang); g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, L * .15); g.lineTo(0, -L); g.stroke(); g.restore(); };
  hd(((h % 12) + m / 60) / 12 * Math.PI * 2, r * .48, r * .06, ink); hd((m + s / 60) / 60 * Math.PI * 2, r * .72, r * .04, ink); hd(s / 60 * Math.PI * 2, r * .78, r * .015, hand);
  g.fillStyle = ink; g.beginPath(); g.arc(0, 0, r * .05, 0, 7); g.fill();
  g.restore();
}

export function altimeter(g, x, y, h, value, max, { k = 1, label = 'ALTITUDE', unit = 'FT', col = PAL.amber, marks = [] } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2);
  g.fillStyle = 'rgba(10,12,14,.75)'; rrect(g, x - 20, y - 70, 250, h + 140, 14); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 40, y); g.lineTo(x + 40, y + h); g.stroke();
  for (let i = 0; i <= 10; i++) { const yy = y + h - i / 10 * h; g.beginPath(); g.moveTo(x + 30, yy); g.lineTo(x + 50, yy); g.stroke(); }
  for (const [v, l] of marks) { const yy = y + h - v / max * h; g.strokeStyle = PAL.red; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x + 20, yy); g.lineTo(x + 220, yy); g.stroke(); g.setLineDash([]); text(g, l, x + 60, yy - 16, { font: F.mono(20, 700), color: PAL.red, align: 'left' }); }
  const yy = y + h - clamp(value / max) * h; g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 16; g.beginPath(); g.moveTo(x + 40, yy); g.lineTo(x + 62, yy - 12); g.lineTo(x + 62, yy + 12); g.fill(); g.shadowBlur = 0;
  text(g, fmt(value), x + 72, yy, { font: F.mono(34, 700), color: '#fff', align: 'left' }); text(g, unit, x + 72 + measure(g, fmt(value), F.mono(34, 700)) + 8, yy + 4, { font: F.mono(20), color: '#aaa', align: 'left' });
  text(g, label, x + 105, y - 36, { font: F.mono(22, 700), color: col, track: 4 });
  g.restore();
}

export function quote(g, lines, k, { x = W / 2, y = H / 2, font = F.serif(64), color = '#f4ecdc', lh = 1.25, align = 'center', marks = true, markCol = PAL.red } = {}) {
  const size = parseInt(font.match(/(\d+)px/)[1]); const y0 = y - (lines.length - 1) * size * lh / 2;
  if (marks) text(g, '“', x - (align === 'center' ? 0 : 0), y0 - size * 1.3, { font: F.serifB(size * 2.2), color: markCol, alpha: clamp(k * 3) });
  lines.forEach((l, i) => reveal(g, l, x, y0 + i * size * lh, clamp(k * lines.length - i * .8), { font, color, align, dy: 24, stagger: .35 }));
}

export function thermometer(g, x, y, h, frac, { k = 1, label = '', col = '#ff4a1a' } = {}) {
  if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k * 2);
  g.fillStyle = 'rgba(255,255,255,.12)'; rrect(g, x - 22, y, 44, h, 22); g.fill(); g.beginPath(); g.arc(x, y + h + 20, 44, 0, 7); g.fill();
  const v = frac * expoOut(k); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 30; rrect(g, x - 12, y + h - h * v, 24, h * v + 10, 12); g.fill(); g.beginPath(); g.arc(x, y + h + 20, 32, 0, 7); g.fill();
  if (label) text(g, label, x, y - 40, { font: F.title(36), color: '#fff', track: 3 });
  g.restore();
}

export function redactBar(g, x, y, w, h, k) { if (k <= 0) return; g.fillStyle = '#0a0a0a'; g.fillRect(x, y, w * expoOut(k), h); }

export function scanlines(g, a = .08) { g.save(); g.fillStyle = `rgba(0,0,0,${a})`; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2); g.restore(); }
