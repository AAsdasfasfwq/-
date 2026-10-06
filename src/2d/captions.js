// Word-synced captions (chunks of a few words, the spoken word highlighted).
import { words } from '../core/time.js';
import { text, measure, F, W, H } from './draw.js';
import { clamp } from '../core/math.js';

let CH = null;
function chunks() {
  if (CH) return CH; CH = []; const ws = words(); let cur = [];
  const flush = () => { if (cur.length) CH.push({ w: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i]; const prev = cur[cur.length - 1];
    if (prev && (w.s - prev.e > .45 || cur.length >= 5)) flush();
    cur.push(w);
    if (/[.,?!;:]$/.test(w.w) && cur.length >= 2) flush();
  }
  flush();
  for (let i = 0; i < CH.length; i++) CH[i].until = i + 1 < CH.length ? Math.min(CH[i + 1].s, CH[i].e + .6) : CH[i].e + 1;
  return CH;
}
export function drawCaptions(g, t, style = {}) {
  const cs = chunks(); let lo = 0, hi = cs.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (cs[m].s - .04 <= t) lo = m; else hi = m - 1; }
  const c = cs[lo]; if (!c || t < c.s - .04 || t > c.until) return;
  const y = style.y || H - 92; const font = F.sans(46, 800); const sp = 14;
  const parts = c.w.map((w) => w.w.replace(/^\s+/, ''));
  const ws = parts.map((p) => measure(g, p, font)); const total = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = W / 2 - total / 2; const pop = clamp((t - c.s + .04) / .12);
  g.save(); g.globalAlpha = pop;
  parts.forEach((p, i) => {
    const w = c.w[i]; const active = t >= w.s - .03 && t < (c.w[i + 1] ? c.w[i + 1].s : w.e + .3);
    const said = t >= w.s - .03;
    text(g, p, x, y, { font, align: 'left', color: active ? '#ffc53d' : said ? '#ffffff' : 'rgba(255,255,255,.55)', stroke: 'rgba(0,0,0,.85)', strokeW: 9, shadow: ['rgba(0,0,0,.6)', 18, 4] });
    x += ws[i] + sp;
  });
  g.restore();
}
