// Blueprint-style technical diagrams (2.5D): gun-type assembly, 155° escape turn, implosion, mountain shielding.
import { text, reveal, F, PAL, W, H, grain, vignette, measure } from '../2d/draw.js';
import { clamp, expoOut, easeInOut, lerp, easeOut } from '../core/math.js';

export function blueprintBG(g, t, { col = '#0d2a4a', col2 = '#06162a' } = {}) {
  const gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * .75); gr.addColorStop(0, col); gr.addColorStop(1, col2); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(160,210,255,.08)'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= W; x += 40) { g.moveTo(x + .5, 0); g.lineTo(x + .5, H); } for (let y = 0; y <= H; y += 40) { g.moveTo(0, y + .5); g.lineTo(W, y + .5); } g.stroke();
  g.strokeStyle = 'rgba(160,210,255,.16)'; g.beginPath(); for (let x = 0; x <= W; x += 200) { g.moveTo(x + .5, 0); g.lineTo(x + .5, H); } for (let y = 0; y <= H; y += 200) { g.moveTo(0, y + .5); g.lineTo(W, y + .5); } g.stroke();
  vignette(g, .5); grain(g, t, .7);
}
const BL = '#bfe2ff';
function callout(g, x, y, x2, y2, label, k, align = 'left') {
  if (k <= 0) return; const e = expoOut(k); g.save(); g.globalAlpha = clamp(k * 2); g.strokeStyle = BL; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(lerp(x, x2, e), lerp(y, y2, e)); g.stroke(); g.beginPath(); g.arc(x, y, 5, 0, 7); g.fillStyle = BL; g.fill();
  text(g, label, x2 + (align === 'left' ? 12 : -12), y2, { font: F.mono(26, 700), color: '#fff', align, track: 2 }); g.restore();
}

// Little Boy cut-away: projectile fired down the barrel into the target rings
export function gunType(g, lt, t, { fireAt = 2, title = 'LITTLE BOY · GUN-TYPE ASSEMBLY' } = {}) {
  blueprintBG(g, t);
  reveal(g, title, 120, 110, clamp(lt / .7), { font: F.mono(32, 700), align: 'left', color: BL, dy: 0, dx: -20, track: 6 });
  const x0 = 260, x1 = 1660, cy = 560, R = 150; const k = clamp(lt / 1.2);
  g.save(); g.globalAlpha = k; g.strokeStyle = BL; g.lineWidth = 3;
  // casing
  g.beginPath(); g.moveTo(x0 + 120, cy - R); g.lineTo(x1 - 120, cy - R); g.arc(x1 - 120, cy, R, -Math.PI / 2, Math.PI / 2); g.lineTo(x0 + 120, cy + R); g.lineTo(x0, cy + R * 1.4); g.lineTo(x0, cy - R * 1.4); g.closePath(); g.stroke();
  g.fillStyle = 'rgba(160,210,255,.06)'; g.fill();
  // barrel
  g.strokeStyle = 'rgba(191,226,255,.8)'; g.strokeRect(x0 + 200, cy - 34, x1 - x0 - 520, 68);
  g.restore();
  const fire = lt - fireAt; const prog = clamp(fire / .55); const px = lerp(x0 + 230, x1 - 470, easeOut(prog) ** 2);
  // propellant
  const pk = clamp((lt - .8) / .5); g.save(); g.globalAlpha = pk; g.fillStyle = fire > 0 && fire < .6 ? '#ffb040' : '#c8a060'; g.fillRect(x0 + 205, cy - 30, 26, 60); g.restore();
  // projectile (uranium "bullet")
  g.save(); g.globalAlpha = clamp((lt - .6) / .5); g.fillStyle = '#ff6a4a'; g.shadowColor = '#ff6a4a'; g.shadowBlur = 20; g.fillRect(px, cy - 28, 160, 56); g.restore();
  if (fire > 0 && fire < .55) { g.save(); for (let i = 1; i < 6; i++) { g.globalAlpha = .12 * (6 - i); g.fillStyle = '#ff6a4a'; g.fillRect(px - i * 26, cy - 28, 160, 56); } g.restore(); }
  // target rings
  g.save(); g.globalAlpha = clamp((lt - .9) / .5); g.fillStyle = '#ff6a4a'; for (let i = 0; i < 6; i++) g.fillRect(x1 - 300 + i * 24, cy - 70, 16, 140); g.restore();
  callout(g, x0 + 218, cy - 30, x0 + 160, cy - 230, 'CORDITE PROPELLANT', clamp((lt - 1) / .5));
  callout(g, x0 + 420, cy + 28, x0 + 520, cy + 260, 'URANIUM-235 "BULLET"', clamp((lt - 1.2) / .5));
  callout(g, x1 - 230, cy - 70, x1 - 140, cy - 250, 'URANIUM-235 TARGET', clamp((lt - 1.4) / .5));
  if (fire > .5) { const f = fire - .5; g.save(); const r = 40 + f * 900; const gr = g.createRadialGradient(x1 - 260, cy, 0, x1 - 260, cy, r); gr.addColorStop(0, `rgba(255,250,230,${clamp(1.2 - f)})`); gr.addColorStop(.4, `rgba(255,160,60,${clamp(.9 - f * .8)})`); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    reveal(g, 'SUPERCRITICAL → CHAIN REACTION', W / 2, H - 140, clamp(f / .5), { font: F.title(64), color: '#fff', track: 8 }); }
}

// top-down escape manoeuvre: release, 155° banking turn, blast circle
export function escapeTurn(g, lt, t, { turnAt = 1 } = {}) {
  blueprintBG(g, t);
  reveal(g, 'ESCAPE MANOEUVRE', 120, 110, clamp(lt / .7), { font: F.mono(32, 700), align: 'left', color: BL, dy: 0, dx: -20, track: 6 });
  const cx = 900, cy = 600; const k = clamp(lt / 1);
  // inbound track
  g.save(); g.strokeStyle = BL; g.lineWidth = 4; g.setLineDash([16, 12]); g.beginPath(); g.moveTo(100, cy); g.lineTo(lerp(100, cx, k), cy); g.stroke(); g.restore();
  const tk = clamp((lt - turnAt) / 2.2); const R = 220; const ang = 155 * Math.PI / 180;
  if (lt > turnAt) {
    g.save(); g.strokeStyle = '#ffcf6a'; g.lineWidth = 6; g.shadowColor = '#ffcf6a'; g.shadowBlur = 16; g.beginPath(); g.arc(cx, cy - R, R, Math.PI / 2, Math.PI / 2 - ang * easeInOut(tk), true); g.stroke(); g.restore();
    // protractor
    g.save(); g.globalAlpha = clamp(tk * 2); g.strokeStyle = 'rgba(191,226,255,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy - R, 90, Math.PI / 2, Math.PI / 2 - ang, true); g.stroke();
    for (let d = 0; d <= 155; d += 15) { const a = Math.PI / 2 - d * Math.PI / 180; g.beginPath(); g.moveTo(cx + Math.cos(a) * 80, cy - R + Math.sin(a) * 80); g.lineTo(cx + Math.cos(a) * 95, cy - R + Math.sin(a) * 95); g.stroke(); }
    g.restore();
    const deg = Math.round(155 * easeInOut(tk)); text(g, deg + '°', cx + 10, cy - R, { font: F.title(120), color: '#ffcf6a', shadow: ['rgba(255,200,100,.5)', 30] });
    // bomb continues forward
    const bk = clamp((lt - turnAt) / 3); g.save(); g.fillStyle = '#ff6a4a'; g.beginPath(); g.arc(cx + bk * 420, cy, 10, 0, 7); g.fill(); g.restore();
    callout(g, cx + bk * 420, cy, cx + 520, cy + 170, 'BOMB CONTINUES FORWARD', clamp((lt - turnAt - .6) / .5));
  }
  callout(g, cx, cy, cx - 200, cy + 200, 'RELEASE POINT', clamp((lt - .4) / .5), 'right');
  // plane icon
  const a = lt > turnAt ? Math.PI / 2 - ang * easeInOut(tk) : Math.PI / 2; const px = lt > turnAt ? cx + Math.cos(a) * R : lerp(100, cx, k), py = lt > turnAt ? cy - R + Math.sin(a) * R : cy;
  g.save(); g.translate(px, py); g.rotate(lt > turnAt ? a - Math.PI : 0); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(26, 0); g.lineTo(-12, -30); g.lineTo(-6, 0); g.lineTo(-12, 30); g.closePath(); g.fill(); g.restore();
}

// implosion: spherical lenses squeeze a plutonium core
export function implosion(g, lt, t, { at = 1.2 } = {}) {
  blueprintBG(g, t, { col: '#2a1d0a', col2: '#120a04' });
  reveal(g, 'FAT MAN · PLUTONIUM IMPLOSION', 120, 110, clamp(lt / .7), { font: F.mono(32, 700), align: 'left', color: '#ffd9a0', dy: 0, dx: -20, track: 6 });
  const cx = W / 2, cy = 560, k = clamp((lt - at) / .7), e = easeInOut(k);
  for (let i = 0; i < 32; i++) { const a0 = i / 32 * Math.PI * 2, a1 = (i + 1) / 32 * Math.PI * 2; const r0 = lerp(170, 95, e), r1 = lerp(330, 250, e);
    g.beginPath(); g.arc(cx, cy, r1, a0 + .01, a1 - .01); g.arc(cx, cy, r0, a1 - .01, a0 + .01, true); g.closePath(); g.fillStyle = i % 2 ? 'rgba(255,190,90,.35)' : 'rgba(255,150,60,.25)'; g.fill(); g.strokeStyle = '#ffd9a0'; g.lineWidth = 1.5; g.stroke(); }
  if (k > 0 && k < 1) for (let i = 0; i < 32; i++) { const a = (i + .5) / 32 * Math.PI * 2; g.strokeStyle = 'rgba(255,240,200,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + Math.cos(a) * 400, cy + Math.sin(a) * 400); g.lineTo(cx + Math.cos(a) * lerp(400, 120, e), cy + Math.sin(a) * lerp(400, 120, e)); g.stroke(); }
  const cr = lerp(90, 52, e); g.save(); g.fillStyle = '#c8c8d0'; g.shadowColor = '#ffe0a0'; g.shadowBlur = k >= 1 ? 80 : 10; g.beginPath(); g.arc(cx, cy, cr, 0, 7); g.fill(); g.restore();
  text(g, 'Pu-239', cx, cy, { font: F.mono(26, 700), color: '#222' });
  callout(g, cx + 250, cy - 120, cx + 520, cy - 260, 'EXPLOSIVE LENSES', clamp((lt - .4) / .5));
  callout(g, cx - 40, cy + 40, cx - 480, cy + 280, 'PLUTONIUM CORE', clamp((lt - .6) / .5), 'right');
}

// valley cross-section: mountains shield the city
export function mountainShield(g, lt, t, { waveAt = .8 } = {}) {
  blueprintBG(g, t);
  reveal(g, 'NAGASAKI · URAKAMI VALLEY CROSS-SECTION', 120, 110, clamp(lt / .7), { font: F.mono(30, 700), align: 'left', color: BL, dy: 0, dx: -20, track: 4 });
  const base = 800; const prof = (x) => { const u = (x - 960) / 960; return base - (Math.abs(u) > .28 ? Math.pow((Math.abs(u) - .28) / .72, 1.2) * 420 : 0) - (u > .55 ? 0 : 0); };
  g.save(); g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, prof(x)); g.lineTo(W, H); g.closePath(); g.fillStyle = 'rgba(160,210,255,.12)'; g.fill(); g.strokeStyle = BL; g.lineWidth = 3; g.stroke(); g.restore();
  for (let i = 0; i < 18; i++) { const x = 700 + i * 30; g.fillStyle = 'rgba(191,226,255,.5)'; g.fillRect(x, base - 14 - (i % 3) * 6, 18, 14 + (i % 3) * 6); }
  for (const x of [200, 300, 1620, 1720]) { g.fillStyle = 'rgba(191,226,255,.5)'; g.fillRect(x, prof(x) - 260 + 250, 18, 12); }
  const cx = 960, cy = base - 160; const k = clamp((lt - waveAt) / 3); const R = k * 900;
  if (k > 0) {
    g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
    g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= W; x += 8) g.lineTo(x, prof(x) - 2); g.lineTo(W, 0); g.closePath(); g.clip();
    const gr = g.createRadialGradient(cx, cy, Math.max(0, R - 60), cx, cy, R); gr.addColorStop(0, 'rgba(255,120,60,0)'); gr.addColorStop(.7, 'rgba(255,140,70,.55)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.restore();
    // blocked arrows
    if (R > 520) { for (const s of [-1, 1]) { const x = cx + s * 560; g.save(); g.strokeStyle = '#ff8a5a'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx + s * 380, base - 120); g.lineTo(x, prof(x) - 40); g.stroke(); text(g, '✕', x + s * 20, prof(x) - 80, { font: F.title(60), color: '#ff8a5a' }); g.restore(); } }
  }
  g.save(); g.fillStyle = '#fff'; g.shadowColor = '#ffd080'; g.shadowBlur = 40; g.beginPath(); g.arc(cx, cy, 16, 0, 7); g.fill(); g.restore();
  callout(g, cx, cy, cx + 160, cy - 180, '≈ 1,600 FT · DETONATION', clamp((lt - .3) / .5));
  callout(g, 300, prof(300), 200, prof(300) - 140, 'REST OF THE CITY', clamp((lt - 2) / .5), 'left');
}
