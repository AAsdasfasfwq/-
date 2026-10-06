// Architecture: Japanese houses, A-Bomb Dome, factories, towers, huts, cathedral, cenotaph, modern city.
import * as THREE from 'three';
import { M, MAT, U, Basic } from './materials.js';
import { box, cyl, sphere, sh } from './props.js';
import { canvas, tex, surface } from '../core/textures.js';
import { rng } from '../core/math.js';

// gabled roof prism (ridge along X)
export function gableGeo(w, d, h, over = .3) {
  const W = w / 2 + over, D = d / 2 + over;
  const g = new THREE.BufferGeometry();
  const v = [-W, 0, -D, W, 0, -D, W, h, 0, -W, h, 0, // back slope
    -W, 0, D, W, 0, D, W, h, 0, -W, h, 0, // front slope
    -W, 0, -D, -W, 0, D, -W, h, 0, W, 0, -D, W, 0, D, W, h, 0]; // gables
  const idx = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 8, 9, 10, 11, 13, 12];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
export function hipGeo(w, d, h, over = .3) { const g = new THREE.ConeGeometry(1, 1, 4, 1); g.rotateY(Math.PI / 4); g.scale((w / 2 + over) * 1.414, h, (d / 2 + over) * 1.414); g.translate(0, h / 2, 0); return g; }

const plaster = () => M('#e9e1cf', { rough: .95 });
const darkWood = () => M('#3b2618', { rough: .8 });
const tile = () => M('#3f4652', { rough: .55, metal: .15 });

function shojiTex() {
  return surface('shoji', '#efe6cf', { w: 256, h: 256, amt: .05, draw: (g) => { g.strokeStyle = '#4a2e1a'; g.lineWidth = 6; for (let x = 0; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); } for (let y = 0; y <= 256; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); } } });
}
function latticeTex() {
  return surface('lattice', '#2e1c10', { w: 256, h: 256, amt: .1, draw: (g) => { g.fillStyle = '#5a3a22'; for (let x = 0; x < 256; x += 16) g.fillRect(x, 0, 8, 256); } });
}

// detailed street-level machiya (2 storeys). front faces +Z
export function machiya(seed = 0, { w = 6, d = 9 } = {}) {
  const r = rng(seed + 1); const g = new THREE.Group(); const two = r() > .35;
  const h1 = 2.8, h2 = two ? 2.3 : 0; const wallM = r() > .5 ? plaster() : M('#5a3a24', { rough: .85 });
  g.add(box(w, h1, d, wallM, 0, h1 / 2, 0));
  // posts and beams
  for (const x of [-w / 2 + .1, -w / 6, w / 6, w / 2 - .1]) g.add(box(.18, h1, .18, darkWood(), x, h1 / 2, d / 2 + .02));
  g.add(box(w + .1, .22, .22, darkWood(), 0, h1 - .1, d / 2 + .04));
  // ground floor front: lattice + sliding doors
  const lat = new THREE.Mesh(new THREE.PlaneGeometry(w * .62, 1.9), new THREE.MeshStandardMaterial({ map: latticeTex(), roughness: .8 })); lat.position.set(-w * .17, 1.15, d / 2 + .03); g.add(lat);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(w * .28, 2.1), new THREE.MeshStandardMaterial({ map: shojiTex(), roughness: .9 })); door.position.set(w * .33, 1.1, d / 2 + .03); g.add(door);
  // pent roof (hisashi)
  const pent = box(w + .4, .08, 1.1, tile(), 0, h1 + .1, d / 2 + .45); pent.rotation.x = .32; g.add(pent);
  if (two) {
    g.add(box(w - .2, h2, d - 1, wallM, 0, h1 + h2 / 2, -.4));
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w * .6, 1.1), new THREE.MeshStandardMaterial({ map: latticeTex(), roughness: .8 })); win.position.set(0, h1 + h2 * .55, d / 2 - .88); g.add(win);
  }
  const roof = new THREE.Mesh(gableGeo(w - (two ? .2 : 0), d - (two ? 1 : 0), 1.6, .5), M('#ffffff', { rough: .6, map: null })); roof.material = tile(); roof.position.set(0, h1 + h2, two ? -.4 : 0); g.add(roof);
  if (r() > .4) { const c = canvas(64, 256), x = c.getContext('2d'); x.fillStyle = r.pick(['#1d3b5a', '#7a1f1f', '#e8e0cc']); x.fillRect(0, 0, 64, 256); x.fillStyle = '#f3ecd8'; x.font = '700 40px "Noto Serif JP"'; x.textAlign = 'center'; const ks = r.pick(['薬', '米', '酒', '茶', '本', '油']); x.fillText(ks, 32, 80); x.fillText(r.pick(['屋', '店', '堂']), 32, 150);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(.45, 1.6), new THREE.MeshStandardMaterial({ map: tex(c), side: THREE.DoubleSide })); sign.position.set(w / 2 - .3, 2.1, d / 2 + .5); sign.rotation.y = Math.PI / 2; g.add(sign); }
  return sh(g);
}

// low-detail house for instancing: returns {walls, roof} geometries (unit footprint)
export function houseGeos() {
  const walls = new THREE.BoxGeometry(1, 1, 1); walls.translate(0, .5, 0);
  const roof = gableGeo(1, 1, .55, .08); roof.translate(0, 1, 0);
  return { walls, roof };
}

// ---------- A-Bomb Dome (Hiroshima Prefectural Industrial Promotion Hall) ----------
export function promotionHall({ ruined = false } = {}) {
  const g = new THREE.Group(); const brick = M(ruined ? '#8a7a68' : '#c9b48a', { rough: .9 }); const trim = M(ruined ? '#6a5e50' : '#e8dfc8', { rough: .85 });
  const winM = M('#1c2228', { rough: .3, metal: .4 });
  const wing = (w, h, d, x, z) => {
    const o = new THREE.Group(); o.position.set(x, 0, z);
    if (ruined) { // broken shell: walls with jagged tops, no roof
      for (const [ww, dd, xx, zz] of [[w, .6, 0, d / 2], [w, .6, 0, -d / 2], [.6, d, w / 2, 0], [.6, d, -w / 2, 0]]) { const n = 8; for (let i = 0; i < n; i++) { const hh = h * (.4 + .6 * Math.abs(Math.sin(i * 1.7 + x))); const seg = box(ww > 1 ? ww / n : ww, hh, dd > 1 ? dd / n : dd, brick, ww > 1 ? xx - ww / 2 + (i + .5) * ww / n : xx, hh / 2, dd > 1 ? zz - dd / 2 + (i + .5) * dd / n : zz); o.add(seg); } }
    } else { o.add(box(w, h, d, brick, 0, h / 2, 0)); o.add(box(w + .4, .4, d + .4, trim, 0, h + .2, 0)); for (let fl = 0; fl < 3; fl++) for (let i = 0; i < Math.floor(w / 3); i++) o.add(box(1.1, 1.8, .1, winM, -w / 2 + 1.6 + i * 3, 2 + fl * 4.2, d / 2 + .02)); }
    return o;
  };
  g.add(wing(36, 13, 10, -14, 0)); g.add(wing(24, 13, 10, 16, 0)); g.add(wing(10, 13, 22, 26, -10));
  // central tower + dome
  const tw = new THREE.Group(); tw.position.set(0, 0, 0); g.add(tw);
  if (!ruined) {
    tw.add(box(11, 19, 11, brick, 0, 9.5, 0)); tw.add(box(11.6, .6, 11.6, trim, 0, 19.3, 0));
    const drum = cyl(5.2, 5.4, 3, brick, 0, 21, 0, 8); tw.add(drum);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(5.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M('#3f8a74', { rough: .45, metal: .6 })); dome.scale.y = 1.25; dome.position.y = 22.5; dome.castShadow = true; tw.add(dome);
    for (let fl = 0; fl < 4; fl++) for (const s of [-1, 1]) tw.add(box(1.4, 2.2, .1, winM, s * 2.6, 3 + fl * 4.2, 5.52));
  } else {
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const hh = 19.5 + Math.sin(i * 2.3) * 2.5; tw.add(box(4.4, hh, .7, brick, Math.cos(a) * 5.2, hh / 2, Math.sin(a) * 5.2)); tw.children[tw.children.length - 1].rotation.y = -a + Math.PI / 2; }
    const steel = M('#2a2420', { rough: .6, metal: .6 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2, .18, 6, 24), steel); ring.rotation.x = Math.PI / 2; ring.position.y = 22; tw.add(ring);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const pts = []; for (let k = 0; k <= 8; k++) { const ph = k / 8 * Math.PI / 2; pts.push(new THREE.Vector3(Math.cos(a) * 5.2 * Math.cos(ph), 22 + Math.sin(ph) * 6.5, Math.sin(a) * 5.2 * Math.cos(ph))); }
      tw.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, .12, 4), steel)); }
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.2, .12, 6, 16), steel); ring2.rotation.x = Math.PI / 2; ring2.position.y = 27.8; tw.add(ring2);
  }
  return sh(g);
}

// ---------- T-shaped Aioi bridge (relative to its own centre) ----------
export function tBridge({ bar = 260, stem = 70, w = 14 } = {}) {
  const g = new THREE.Group(); const c = M('#b8b0a2', { rough: .8 }); const rail = M('#8a8274', { rough: .7 });
  g.add(box(bar, 1.2, w, c, 0, 0, 0)); g.add(box(w, 1.2, stem, c, 0, 0, stem / 2));
  for (const s of [-1, 1]) g.add(box(bar, .9, .4, rail, 0, 1, s * w / 2));
  for (let i = -5; i <= 5; i++) g.add(box(3, 8, 3, c, i * bar / 11, -4, 0));
  return sh(g);
}

// ---------- Los Alamos / Manhattan Project ----------
export function barrack({ w = 30, d = 9, col = '#6f7a63', seed = 1 } = {}) {
  const g = new THREE.Group(); const wall = M(col, { rough: .85 }); g.add(box(w, 3.2, d, wall, 0, 1.6, 0));
  const roof = new THREE.Mesh(gableGeo(w, d, 1.6, .4), M('#4a4e52', { rough: .6, metal: .2 })); roof.position.y = 3.2; g.add(roof);
  for (let i = 0; i < Math.floor(w / 3); i++) g.add(box(1, 1.2, .08, M('#1e2a33', { rough: .2, metal: .5 }), -w / 2 + 1.8 + i * 3, 1.9, d / 2 + .02));
  g.add(box(1.1, 2.1, .08, M('#3a2a1a'), w / 2 - 1.5, 1.05, d / 2 + .03));
  return sh(g);
}
export function waterTower() { const g = new THREE.Group(); const m = M('#6a6e72', { rough: .5, metal: .5 }); for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) g.add(cyl(.15, .15, 12, m, x, 6, z, 6)); g.add(cyl(3, 3, 4, M('#9aa0a6', { rough: .4, metal: .6 }), 0, 14, 0)); const cap = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 20), M('#5a5e62', { metal: .6, rough: .4 })); cap.position.y = 16.8; g.add(cap); return sh(g); }
export function fence(len = 60, h = 2.4) { const g = new THREE.Group(); const m = M('#555', { metal: .7, rough: .4 }); for (let x = -len / 2; x <= len / 2; x += 3) g.add(cyl(.05, .05, h, m, x, h / 2, 0, 6)); for (const y of [.6, 1.4, 2.2]) g.add(box(len, .02, .02, m, 0, y, 0)); return g; }
export function trinityTower({ gadget = true } = {}) {
  const g = new THREE.Group(); const st = M('#7c7f84', { rough: .45, metal: .8 }); const H = 30, B = 3.5;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const leg = cyl(.12, .12, H, st, x * B * .8, H / 2, z * B * .8, 6); leg.rotation.set(-z * .045, 0, x * .045); g.add(leg); }
  for (let y = 2; y < H; y += 3) { const s = B * (1 - y / H * .35) * .8 * 2; for (const r of [0, Math.PI / 2]) { const bx = box(s, .08, .08, st, 0, y, 0); bx.rotation.y = r; const b2 = bx.clone(); bx.position.z = s / 2; b2.position.z = -s / 2; if (r) { bx.position.set(s / 2, y, 0); b2.position.set(-s / 2, y, 0); } g.add(bx, b2); } }
  const shack = box(4, 3, 4, M('#9a8a6a', { rough: .9 }), 0, H + 1.5, 0); g.add(shack); g.add(box(4.6, .2, 4.6, M('#5a5040'), 0, H + 3.1, 0));
  if (gadget) { const s = new THREE.Mesh(new THREE.SphereGeometry(.75, 24, 16), M('#6c6450', { rough: .5, metal: .5 })); s.position.set(0, H + 1.2, 2.4); g.add(s); for (let i = 0; i < 12; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.5, 4), M('#222')); w.position.set(Math.cos(i) * .6, H + 1.6, 2.4 + Math.sin(i) * .6); w.rotation.z = Math.cos(i * 3) * .8; g.add(w); } }
  return sh(g);
}
// K-25 style gaseous diffusion plant: very long building with roof monitors & lit windows
export function k25({ L = 400, W = 60, H = 18, windows = '#ffcf7a', night = false } = {}) {
  const g = new THREE.Group(); const wall = M('#9a9488', { rough: .85 }); const roof = M('#5c5c5e', { rough: .6, metal: .3 });
  for (const [x, z, l, rot] of [[0, 0, L, 0], [-L / 2 + W / 2, -L * .45, L * .9, Math.PI / 2], [L / 2 - W / 2, -L * .45, L * .9, Math.PI / 2]]) {
    const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rot; g.add(b);
    b.add(box(l, H, W, wall, 0, H / 2, 0)); b.add(box(l, 1, W + 2, roof, 0, H + .5, 0));
    for (let i = -l / 2 + 10; i < l / 2 - 10; i += 20) b.add(box(14, 3, W * .5, roof, i, H + 2.5, 0));
    const wm = new THREE.MeshStandardMaterial({ color: '#222', emissive: new THREE.Color(windows), emissiveIntensity: night ? 2.2 : .25, roughness: .3 });
    for (let i = -l / 2 + 4; i < l / 2 - 4; i += 6) for (const s of [-1, 1]) b.add(box(3, 2.2, .2, wm, i, H * .6, s * (W / 2 + .05)));
  }
  return sh(g);
}
export function reactorB() {
  const g = new THREE.Group(); const c = M('#b5ad9f', { rough: .9 }); const d = M('#8a8274', { rough: .9 });
  g.add(box(36, 26, 32, c, 0, 13, 0)); g.add(box(24, 14, 20, c, -4, 33, 0)); g.add(box(60, 9, 30, d, 46, 4.5, 0)); g.add(box(18, 18, 18, d, -28, 9, 10));
  g.add(cyl(3.2, 4.5, 60, M('#a8a094', { rough: .9 }), 30, 30, -24, 18));
  for (let i = 0; i < 6; i++) g.add(box(2, 10, .2, M('#2b2f33', { rough: .3, metal: .4 }), -14 + i * 5.5, 14, 16.05));
  return sh(g);
}
export function quonset({ L = 30, R = 6, col = '#8f9497' } = {}) {
  const g = new THREE.Group(); const m = M(col, { rough: .45, metal: .7, map: surface('corr', '#c8ccd0', { w: 256, h: 64, amt: .05, draw: (x) => { for (let i = 0; i < 256; i += 8) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(i, 0, 3, 64); } }, repeat: [12, 1] }), side: THREE.DoubleSide });
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 32, 1, true, -Math.PI / 2, Math.PI), m); shell.rotation.z = Math.PI / 2; shell.rotation.y = 0; shell.castShadow = shell.receiveShadow = true; g.add(shell);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CircleGeometry(R, 32, 0, Math.PI), M('#7a7f82', { rough: .7, side: THREE.DoubleSide })); e.position.x = s * L / 2; e.rotation.y = Math.PI / 2; g.add(e); }
  return g;
}
export function bombPit() {
  const g = new THREE.Group(); const c = M('#8a8478', { rough: .95 });
  g.add(box(6, .3, 4, M('#3a3632', { rough: .9 }), 0, -2.6, 0));
  for (const [w, d, x, z] of [[6.4, .2, 0, 2.1], [6.4, .2, 0, -2.1], [.2, 4.4, 3.1, 0], [.2, 4.4, -3.1, 0]]) g.add(box(w, 2.8, d, c, x, -1.4, z));
  const lift = new THREE.Group(); g.add(lift); lift.add(box(3.4, .2, 1.6, M('#5a5a50', { metal: .6, rough: .4 }), 0, 0, 0)); lift.add(cyl(.18, .18, 2.6, M('#9a9a90', { metal: 1, rough: .2 }), 0, -1.4, 0));
  g.userData.lift = lift; return sh(g);
}

// ---------- Kyoto pagoda + torii ----------
export function pagoda({ floors = 5 } = {}) {
  const g = new THREE.Group(); const wood = M('#7a2a1a', { rough: .7 }); const roofM = M('#2c3036', { rough: .5, metal: .3 }); let y = 0, s = 7;
  g.add(box(s + 2, 1.2, s + 2, M('#a59a88', { rough: .95 }), 0, .6, 0)); y = 1.2;
  for (let i = 0; i < floors; i++) { const h = 3.2 - i * .2; g.add(box(s, h, s, wood, 0, y + h / 2, 0)); const r = new THREE.Mesh(hipGeo(s + 3, s + 3, 1.6, 0), roofM); r.position.y = y + h; r.scale.y = .7; g.add(r); y += h + .8; s *= .86; }
  g.add(cyl(.15, .2, 9, MAT.brass, 0, y + 4, 0)); for (let k = 0; k < 9; k++) g.add(cyl(.6 - k * .03, .6 - k * .03, .12, MAT.brass, 0, y + 1 + k * .7, 0));
  return sh(g);
}
export function torii(col = '#c8371f') { const g = new THREE.Group(); const m = M(col, { rough: .6 }); for (const s of [-1, 1]) g.add(cyl(.35, .4, 7, m, s * 3, 3.5, 0, 16)); const top = box(9.5, .55, .7, M('#1a1a1a', { rough: .6 }), 0, 7.2, 0); g.add(top); g.add(box(8.6, .5, .6, m, 0, 6.6, 0)); g.add(box(8, .35, .45, m, 0, 5.6, 0)); return sh(g); }

// ---------- Nagasaki: Urakami Cathedral ----------
export function cathedral({ ruined = false } = {}) {
  const g = new THREE.Group(); const brick = M(ruined ? '#6a3a2c' : '#a5482e', { rough: .9 }); const stone = M('#cfc6b3', { rough: .9 });
  if (!ruined) { g.add(box(18, 16, 50, brick, 0, 8, 0)); const roof = new THREE.Mesh(gableGeo(50, 18, 7, .5), M('#3a3f45', { rough: .5 })); roof.rotation.y = Math.PI / 2; roof.position.y = 16; g.add(roof); }
  else for (let i = 0; i < 12; i++) { const h = 4 + Math.abs(Math.sin(i * 1.9)) * 9; g.add(box(1.2, h, 4, brick, (i % 2 ? 9 : -9), h / 2, -22 + Math.floor(i / 2) * 8.5)); }
  for (const s of [-1, 1]) {
    const tw = new THREE.Group(); tw.position.set(s * 7, 0, 27); g.add(tw);
    if (!ruined || s < 0) { tw.add(box(7, 26, 7, brick, 0, 13, 0)); for (const y of [8, 16, 24]) tw.add(box(7.4, .5, 7.4, stone, 0, y, 0)); tw.add(cyl(3, 3.2, 3, brick, 0, 27.5, 0, 8)); const d = new THREE.Mesh(new THREE.SphereGeometry(3.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#4a6a5a', { rough: .5, metal: .5 })); d.scale.y = 1.4; d.position.y = 29; tw.add(d); tw.add(box(.3, 3, .3, stone, 0, 34.5, 0)); tw.add(box(1.6, .3, .3, stone, 0, 35, 0)); }
    else tw.add(box(7, 9, 7, brick, 0, 4.5, 0));
  }
  if (!ruined) { const rose = new THREE.Mesh(new THREE.CircleGeometry(3, 24), M('#e8c060', { emissive: '#ff9a30', ei: .5, rough: .3 })); rose.position.set(0, 12, 25.05); g.add(rose); }
  return sh(g);
}

// ---------- Hiroshima Peace Memorial cenotaph (saddle arch) ----------
export function cenotaph() {
  const g = new THREE.Group(); const c = M('#b9b2a6', { rough: .8 });
  const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24 * 2 - 1; pts.push(new THREE.Vector2(u * 4.4, 4.2 * (1 - u * u) + .1)); }
  const shape = new THREE.Shape(); shape.moveTo(-4.6, 0); pts.forEach((p) => shape.lineTo(p.x * 1.05, p.y * 1.05 + .15)); shape.lineTo(4.6, 0); shape.lineTo(4.2, 0); [...pts].reverse().forEach((p) => shape.lineTo(p.x * .92, p.y * .92)); shape.lineTo(-4.2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.4, bevelEnabled: true, bevelSize: .1, bevelThickness: .1, bevelSegments: 2 }); geo.translate(0, 0, -1.2);
  const arch = new THREE.Mesh(geo, c); arch.castShadow = arch.receiveShadow = true; g.add(arch);
  const coffin = box(2.6, 1, 1.2, M('#3a3632', { rough: .4, metal: .2 }), 0, .5, 0); g.add(coffin);
  g.add(box(10, .2, 6, M('#8f877b', { rough: .9 }), 0, .1, 0));
  return sh(g);
}
export function peaceFlame() { const g = new THREE.Group(); const c = M('#9a9488', { rough: .85 }); g.add(box(4, 1.2, 1.2, c, 0, .6, 0)); for (const s of [-1, 1]) { const w = box(.8, 1.4, 1, c, s * 1.2, 1.3, 0); w.rotation.z = s * -.5; g.add(w); } return sh(g); }

// ---------- generic concrete / modern ----------
export function concreteBlock(w, h, d, { col = '#b7b0a3', windows = true, ruined = false, seed = 1 } = {}) {
  const g = new THREE.Group(); const m = M(col, { rough: .9 });
  if (!ruined) { g.add(box(w, h, d, m, 0, h / 2, 0)); if (windows) { const wm = M('#202830', { rough: .3, metal: .5 }); for (let y = 2; y < h - 1; y += 3.4) for (let x = -w / 2 + 2; x < w / 2 - 1; x += 2.6) g.add(box(1.3, 1.6, .1, wm, x, y, d / 2 + .02)); } }
  else { const r = rng(seed); for (const [ww, dd, xx, zz] of [[w, .5, 0, d / 2], [w, .5, 0, -d / 2], [.5, d, w / 2, 0], [.5, d, -w / 2, 0]]) { const hh = h * (.3 + r() * .6); g.add(box(ww, hh, dd, M('#6a645c', { rough: 1 }), xx, hh / 2, zz)); } }
  return sh(g);
}
export function glassTower(w, h, d, { seed = 1, lit = .7, tint = '#20354a', win = '#ffd9a0' } = {}) {
  const r = rng(seed); const c = canvas(64, 256), x = c.getContext('2d'); x.fillStyle = '#0c1118'; x.fillRect(0, 0, 64, 256);
  for (let yy = 0; yy < 256; yy += 8) for (let xx = 0; xx < 64; xx += 8) if (r() < lit) { x.fillStyle = r() < .2 ? '#9fd0ff' : win; x.globalAlpha = .4 + r() * .6; x.fillRect(xx + 1, yy + 1, 6, 5); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.max(1, w / 16), Math.max(1, h / 64)); t.magFilter = THREE.NearestFilter;
  const m = new THREE.MeshStandardMaterial({ color: tint, roughness: .15, metalness: .7, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 1.0 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.y = h / 2; b.castShadow = true; return b;
}
export function neonSign(textStr, { col = '#ff3b6b', w = 6, h = 2, vertical = false, jp = false, bg = '#0b0b10' } = {}) {
  const c = canvas(vertical ? 128 : 512, vertical ? 512 : 160), x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
  x.shadowColor = col; x.shadowBlur = 18; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = jp ? '700 96px "Noto Serif JP"' : '700 100px Oswald';
  if (vertical) [...textStr].forEach((ch, i) => x.fillText(ch, 64, 70 + i * 110)); else x.fillText(textStr, 256, 84);
  x.globalCompositeOperation = 'source-atop'; x.fillStyle = col; x.globalAlpha = .55; x.fillRect(0, 0, c.width, c.height);
  const m = new THREE.MeshBasicMaterial({ map: tex(c), color: new THREE.Color('#ffffff').multiplyScalar(2.2) });
  return new THREE.Mesh(new THREE.PlaneGeometry(vertical ? h : w, vertical ? w : h), m);
}
export function shack(seed = 1) {
  const r = rng(seed); const g = new THREE.Group(); const cols = ['#6a5a48', '#5a4a3a', '#7a6a55', '#4a4038', '#8a7a62'];
  const w = 3 + r() * 2, d = 3 + r() * 2, h = 2 + r() * .6;
  for (let i = 0; i < 6; i++) g.add(box(w / 6 + .05, h * (.9 + r() * .15), d, M(r.pick(cols), { rough: 1 }), -w / 2 + (i + .5) * w / 6, h / 2, 0));
  const roof = box(w + .5, .08, d + .5, M(r.pick(['#5a5e62', '#6a5040', '#3a3632']), { rough: .6, metal: .4 }), 0, h + .1, 0); roof.rotation.z = (r() - .5) * .15; g.add(roof);
  return sh(g);
}
