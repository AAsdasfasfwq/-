// Generic 2D shot factories (infographics, kinetic type, quotes, maps).
import { text, reveal, F, PAL, W, H, paperBG, inkBG, noirBG, grain, vignette, stamp, measure, fmt } from '../2d/draw.js';
import { kinetic, quote } from '../2d/info.js';
import { clamp, expoOut } from '../core/math.js';

export const BG = { paper: paperBG, ink: inkBG, noir: noirBG, black: (g, t) => { g.fillStyle = '#040404'; g.fillRect(0, 0, W, H); vignette(g, .5); grain(g, t, .9); } };

// 2D-only shot: bg + draw(g, lt, t, dur)
export function flat(bg, draw, extra = {}) {
  return { captions: extra.captions ?? true, grade: { bloom: 0, grain: .03, vignette: .2, ca: 0 }, ...extra,
    draw(g, lt, t, dur) { const b = typeof bg === 'string' ? BG[bg] : bg; if (b) b(g, t, extra.bgOpt || {}); draw && draw(g, lt, t, dur); } };
}
// kinetic words timed to speech: items [{s, at, x, y, font, color}]
export function words(bg, items, extra = {}) { return flat(bg, (g, lt, t, dur) => { extra.under && extra.under(g, lt, t, dur); kinetic(g, t, items); extra.over && extra.over(g, lt, t, dur); }, extra); }
export function quoteShot(lines, { bg = 'black', font = F.serif(70), color = '#f4ecdc', sub = '', subAt = 0, markCol = PAL.red, speed = 1.6, ...extra } = {}) {
  return flat(bg, (g, lt, t, dur) => {
    quote(g, lines, clamp(lt / speed), { font, color, markCol });
    if (sub) text(g, sub, W / 2, H / 2 + lines.length * 60 + 80, { font: F.title(30, 500), color: '#a9a296', track: 8, alpha: clamp((lt - subAt) / .6) });
  }, { captions: false, ...extra });
}
