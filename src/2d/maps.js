// Stylised 2D maps (d3-geo + world-atlas): Japan targets, Pacific routes, Europe, USA sites, Manchuria.
import { geoMercator, geoOrthographic, geoPath, geoGraticule10, geoDistance } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { text, F, PAL, W, H, measure } from './draw.js';
import { clamp, expoOut, easeInOut, lerp } from '../core/math.js';

let WORLD = null, BORDERS = null, LAND = null;
export async function loadWorld() {
  const topo = await (await fetch('node_modules/world-atlas/countries-50m.json')).json();
  WORLD = feature(topo, topo.objects.countries).features; BORDERS = mesh(topo, topo.objects.countries, (a, b) => a !== b);
  LAND = feature(topo, topo.objects.land);
}
export const ID = { japan: '392', germany: '276', usa: '840', russia: '643', china: '156', mongolia: '496', nkorea: '408', skorea: '410', uk: '826', france: '250', poland: '616', italy: '380', austria: '040', czech: '203', kazakhstan: '398' };

export function proj(center, scale, { rotate = 0 } = {}) { return geoMercator().rotate([-center[0], 0]).center([0, center[1]]).scale(scale).translate([W / 2, H / 2]).angle(rotate); }
export function globeProj(rot, scale = 420, cx = W / 2, cy = H / 2) { return geoOrthographic().rotate(rot).scale(scale).translate([cx, cy]).clipAngle(90); }

// theme: 'ink' (dark, glowing) or 'paper' (light editorial)
export function drawMap(g, p, { theme = 'ink', highlight = {}, dim = 0, grid = true, borders = true, landCol, seaCol, glow = true } = {}) {
  const path = geoPath(p, g);
  const T = theme === 'ink' ? { sea: '#0b1219', land: '#2a2f33', stroke: 'rgba(255,255,255,.18)', grid: 'rgba(120,170,200,.07)', coast: 'rgba(160,200,220,.35)' } : { sea: '#dcd8cf', land: '#f6f4ef', stroke: 'rgba(0,0,0,.18)', grid: 'rgba(0,0,0,.05)', coast: 'rgba(0,0,0,.35)' };
  g.fillStyle = seaCol || T.sea; g.fillRect(0, 0, W, H);
  if (grid) { g.beginPath(); path(geoGraticule10()); g.strokeStyle = T.grid; g.lineWidth = 1; g.stroke(); }
  if (p.clipAngle && p.clipAngle()) { g.beginPath(); path({ type: 'Sphere' }); g.fillStyle = theme === 'ink' ? '#0e1822' : '#e4e0d6'; g.fill(); }
  g.beginPath(); path(LAND); g.fillStyle = landCol || T.land; g.fill();
  if (glow) { g.save(); g.shadowColor = theme === 'ink' ? 'rgba(80,160,200,.35)' : 'rgba(0,0,0,.25)'; g.shadowBlur = 14; g.strokeStyle = T.coast; g.lineWidth = 1.2; g.stroke(); g.restore(); }
  for (const [id, col] of Object.entries(highlight)) { const f = WORLD.find((c) => c.id === (ID[id] || id)); if (!f) continue; g.beginPath(); path(f); g.fillStyle = col; g.fill(); }
  if (borders) { g.beginPath(); path(BORDERS); g.strokeStyle = T.stroke; g.lineWidth = 1; g.stroke(); }
  if (dim) { g.fillStyle = `rgba(0,0,0,${dim})`; g.fillRect(0, 0, W, H); }
  return path;
}
export const worldFeatures = () => WORLD;
export function country(id) { return WORLD.find((c) => c.id === (ID[id] || id)); }

// map marker with label: p = projection, ll = [lon,lat]
export function marker(g, p, ll, label, k, { color = PAL.red, sub = '', side = 1, size = 1, pulse = 0, font = F.title(40), labelCol = '#fff', strike = 0, dy = 0 } = {}) {
  if (k <= 0) return; const [x, y] = p(ll); const e = expoOut(k);
  g.save();
  if (pulse) { for (let i = 0; i < 2; i++) { const ph = (pulse + i * .5) % 1; g.beginPath(); g.arc(x, y, 10 + ph * 50 * size, 0, 7); g.strokeStyle = color; g.globalAlpha = (1 - ph) * .7 * k; g.lineWidth = 2; g.stroke(); } g.globalAlpha = 1; }
  g.beginPath(); g.arc(x, y, 9 * size * e, 0, 7); g.fillStyle = color; g.fill(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();
  if (label) {
    const lx = x + side * 26, ly = y + dy; const a = clamp((k - .15) / .4);
    text(g, label, lx, ly, { font, align: side > 0 ? 'left' : 'right', color: labelCol, alpha: a, track: 2, shadow: ['rgba(0,0,0,.7)', 10] });
    if (sub) text(g, sub, lx, ly + 34, { font: F.serif(24), align: side > 0 ? 'left' : 'right', color: '#e6d6bd', alpha: a, shadow: ['rgba(0,0,0,.7)', 8] });
    if (strike > 0) { const w = measure(g, label, font, 2); g.strokeStyle = PAL.red; g.lineWidth = 6; g.beginPath(); const x0 = side > 0 ? lx - 6 : lx - w - 6; g.moveTo(x0, ly + 2); g.lineTo(x0 + (w + 12) * expoOut(strike), ly + 2); g.stroke(); }
  }
  g.restore();
}
// animated great-circle-ish route (straight in projection) with travelling head
export function route(g, p, pts, k, { color = PAL.amber, width = 4, dash = [14, 10], head = true, glow = true } = {}) {
  if (k <= 0) return null; const P = pts.map((ll) => p(ll)); const segs = []; let L = 0;
  for (let i = 0; i < P.length - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); segs.push(l); L += l; }
  let rem = L * clamp(k); g.save(); g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash); g.lineCap = 'round'; if (glow) { g.shadowColor = color; g.shadowBlur = 16; }
  g.beginPath(); g.moveTo(...P[0]); let hx = P[0][0], hy = P[0][1], ang = 0;
  for (let i = 0; i < segs.length && rem > 0; i++) { const f = Math.min(1, rem / segs[i]); hx = lerp(P[i][0], P[i + 1][0], f); hy = lerp(P[i][1], P[i + 1][1], f); ang = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]); g.lineTo(hx, hy); rem -= segs[i]; }
  g.stroke(); g.setLineDash([]);
  if (head && k < 1.02) { g.translate(hx, hy); g.rotate(ang); g.fillStyle = '#fff'; planeIcon(g, 1.1); }
  g.restore(); return [hx, hy];
}
export function planeIcon(g, s = 1) { g.save(); g.scale(s, s); g.beginPath(); g.moveTo(18, 0); g.lineTo(4, 3); g.lineTo(-2, 16); g.lineTo(-6, 16); g.lineTo(-3, 3); g.lineTo(-12, 3); g.lineTo(-15, 8); g.lineTo(-17, 8); g.lineTo(-15, 0); g.lineTo(-17, -8); g.lineTo(-15, -8); g.lineTo(-12, -3); g.lineTo(-3, -3); g.lineTo(-6, -16); g.lineTo(-2, -16); g.lineTo(4, -3); g.closePath(); g.fill(); g.restore(); }
// thick arrow (offensives)
export function arrow(g, p, pts, k, { color = '#d22', width = 26 } = {}) {
  if (k <= 0) return; const P = pts.map((ll) => p(ll)); const n = P.length; let L = 0; const seg = []; for (let i = 0; i < n - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); seg.push(l); L += l; }
  let rem = L * clamp(k); const out = [P[0]]; let ang = 0;
  for (let i = 0; i < n - 1 && rem > 0; i++) { const f = Math.min(1, rem / seg[i]); out.push([lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f)]); ang = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]); rem -= seg[i]; }
  g.save(); g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'butt'; g.lineJoin = 'round'; g.globalAlpha = .9; g.shadowColor = color; g.shadowBlur = 20;
  g.beginPath(); out.forEach((q, i) => (i ? g.lineTo(...q) : g.moveTo(...q))); g.stroke();
  const [hx, hy] = out[out.length - 1]; g.translate(hx, hy); g.rotate(ang); g.fillStyle = color; g.beginPath(); g.moveTo(width * 1.4, 0); g.lineTo(-width * .2, width * 1.1); g.lineTo(-width * .2, -width * 1.1); g.closePath(); g.fill();
  g.restore();
}
// interpolate between two projections' parameters for smooth camera moves
export function mapCam(lt, keys) { // keys: [[t, [lon,lat], scale], ...]
  let a = keys[0], b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (lt >= keys[i][0] && lt <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
  if (lt < keys[0][0]) b = a; const f = a === b ? 0 : easeInOut((lt - a[0]) / (b[0] - a[0]));
  const ls = Math.log(a[2]), le = Math.log(b[2]);
  return proj([lerp(a[1][0], b[1][0], f), lerp(a[1][1], b[1][1], f)], Math.exp(lerp(ls, le, f)));
}
export const LL = {
  hiroshima: [132.455, 34.385], nagasaki: [129.873, 32.75], kokura: [130.88, 33.88], kyoto: [135.768, 35.011], yokohama: [139.638, 35.444], niigata: [139.036, 37.916], tokyo: [139.69, 35.69],
  tinian: [145.63, 15.0], okinawa: [127.8, 26.3], iwojima: [141.32, 24.78], sanfrancisco: [-122.42, 37.77], hawaii: [-157.95, 21.35], losalamos: [-106.3, 35.88], oakridge: [-84.27, 36.01], hanford: [-119.6, 46.6], washington: [-77.04, 38.9], trinity: [-106.47, 33.68],
  berlin: [13.4, 52.52], potsdam: [13.06, 52.4], moscow: [37.62, 55.75], london: [-0.12, 51.5], newyork: [-74.0, 40.71], manchuria: [125.3, 43.9], harbin: [126.6, 45.75], vladivostok: [131.9, 43.1], bikini: [165.4, 11.6], longisland: [-72.4, 41.0],
};
