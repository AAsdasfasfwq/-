// Procedural Hiroshima (river delta), Nagasaki (Urakami valley), generic Japanese city. Units: metres.
import * as THREE from 'three';
import { M } from './materials.js';
import { canvas, tex } from '../core/textures.js';
import { rng, fbm, clamp, smooth, lerp } from '../core/math.js';
import { houseGeos, promotionHall, tBridge, concreteBlock, cathedral } from './buildings.js';

export const HIRO = {
  size: 7000,
  rivers: [
    { pts: [[260, -3600], [120, -2400], [-120, -1300], [-250, -420], [-300, -150]], w: 170 },
    { pts: [[-300, -150], [-205, -40], [-150, 500], [-120, 1400], [-60, 2400], [0, 3600]], w: 95 },
    { pts: [[-300, -150], [-420, -20], [-520, 600], [-620, 1500], [-700, 2400], [-760, 3600]], w: 110 },
    { pts: [[-250, -420], [-700, -300], [-1000, 400], [-1150, 1500], [-1250, 3600]], w: 80 },
    { pts: [[-120, -1300], [-1300, -1100], [-1900, -200], [-2100, 1500], [-2300, 3600]], w: 230 },
    { pts: [[120, -2400], [500, -1200], [800, 0], [950, 1500], [1100, 3600]], w: 100 },
    { pts: [[500, -1200], [1500, -700], [2200, 300], [2600, 3600]], w: 90 },
  ],
  bay: 2650, hypo: [0, 0], dome: [-140, 35], bridge: [-300, -150], castle: [120, -900], station: [1500, -700],
};

function segDist(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az; const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)); const x = ax + dx * t - px, z = az + dz * t - pz; return Math.sqrt(x * x + z * z); }
export function riverDist(rivers, x, z) { let best = 1e9; for (const r of rivers) for (let i = 0; i < r.pts.length - 1; i++) { const d = segDist(x, z, ...r.pts[i], ...r.pts[i + 1]) - r.w / 2; if (d < best) best = d; } return best; }

// paints the ground texture: land fabric, streets, rivers, mountains; ruined = charred
function groundCanvas(def, { ruined = false, px = 2048, mountains, burnR = 2000 }) {
  const S = def.size, c = canvas(px, px), g = c.getContext('2d'); const k = px / S; const r = rng(4);
  const P = (x, z) => [(x + S / 2) * k, (z + S / 2) * k];
  g.fillStyle = '#6f6a55'; g.fillRect(0, 0, px, px);
  // city fabric: blocks between streets, slightly rotated grid
  g.save(); g.translate(px / 2, px / 2); g.rotate(.06);
  for (let x = -S / 2; x < S / 2; x += 105) for (let z = -S / 2; z < S / 2; z += 105) {
    const [X, Z] = [x * k, z * k]; const d = Math.hypot(x, z); const dens = clamp(1.25 - d / 3200);
    g.fillStyle = `rgb(${120 + r() * 25},${112 + r() * 20},${96 + r() * 18})`; g.fillRect(X, Z, 95 * k, 95 * k);
    const n = Math.floor(dens * 14); for (let i = 0; i < n; i++) { const v = 45 + r() * 50; g.fillStyle = r() < .7 ? `rgb(${v},${v + 4},${v + 10})` : `rgb(${v + 40},${v + 20},${v})`; g.fillRect(X + r() * 85 * k, Z + r() * 85 * k, (8 + r() * 10) * k, (8 + r() * 10) * k); }
  }
  g.restore();
  // greenery fringe & mountains
  for (let i = 0; i < 9000; i++) { const x = (r() - .5) * S, z = (r() - .5) * S; const m = mountains ? mountains(x, z) : 0; if (m > 4) { g.fillStyle = `rgba(${40 + r() * 30},${70 + r() * 30},${35 + r() * 20},.85)`; const [X, Z] = P(x, z); g.beginPath(); g.arc(X, Z, (14 + r() * 30) * k, 0, 7); g.fill(); } }
  if (ruined) { // charred zone with rubble speckle
    const [cx, cz] = P(0, 0); const gr = g.createRadialGradient(cx, cz, 0, cx, cz, burnR * k); gr.addColorStop(0, 'rgba(40,32,28,1)'); gr.addColorStop(.6, 'rgba(70,55,45,.95)'); gr.addColorStop(1, 'rgba(70,55,45,0)'); g.fillStyle = gr; g.fillRect(0, 0, px, px);
    for (let i = 0; i < 26000; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * burnR; const [X, Z] = P(Math.cos(a) * d, Math.sin(a) * d); const v = 30 + r() * 70; g.fillStyle = `rgba(${v + 20},${v},${v - 10},.7)`; g.fillRect(X, Z, 2 + r() * 3, 2 + r() * 3); }
  }
  // streets (wide avenues)
  g.strokeStyle = ruined ? 'rgba(150,135,115,.55)' : 'rgba(190,180,160,.65)'; g.lineWidth = 9 * k * 2;
  g.save(); g.translate(px / 2, px / 2); g.rotate(.06); for (let v = -S / 2; v < S / 2; v += 420) { g.beginPath(); g.moveTo(v * k, -px); g.lineTo(v * k, px); g.stroke(); g.beginPath(); g.moveTo(-px, v * k); g.lineTo(px, v * k); g.stroke(); } g.restore();
  // rivers
  for (const rv of def.rivers) {
    for (const [col, extra] of [['#8f8a74', 22], ['#24505e', 0]]) { g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = (rv.w + extra) * k; g.beginPath(); rv.pts.forEach(([x, z], i) => { const [X, Z] = P(x, z); i ? g.lineTo(X, Z) : g.moveTo(X, Z); }); g.stroke(); }
  }
  if (def.bay) { const [, bz] = P(0, def.bay); const gr = g.createLinearGradient(0, bz - 30, 0, bz + 60); gr.addColorStop(0, '#8f8a74'); gr.addColorStop(.3, '#24505e'); gr.addColorStop(1, '#1d4352'); g.fillStyle = gr; g.fillRect(0, bz - 30, px, px); }
  return c;
}

export function buildHiroshima(scene, { ruined = false, houses = 7000, seed = 3, detailR = 2600, texPx = 2048 } = {}) {
  const def = HIRO; const S = def.size; const r = rng(seed);
  const mount = (x, z) => { const d = Math.max(-z - 2300, x - 2300, -x - 2900, 0); return d > 0 ? Math.pow(d / 900, 1.3) * 260 * (.6 + fbm(x / 600, z / 600, 4) * .8) : 0; };
  const gc = groundCanvas(def, { ruined, px: texPx, mountains: mount }); const gt = tex(gc); gt.anisotropy = 16;
  const seg = 320; const geo = new THREE.PlaneGeometry(S, S, seg, seg); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const rd = riverDist(def.rivers, x, z); let h = rd < 0 ? -12 : rd < 25 ? -12 + (rd / 25) * 13 : 1; if (z > def.bay) h = Math.min(h, -12 - (z - def.bay) * .01); h += mount(x, z); p.setY(i, h); }
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: gt, roughness: .95 })); ground.receiveShadow = true; scene.add(ground);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(S * 3, S * 3), new THREE.MeshStandardMaterial({ color: '#2a5a6a', roughness: .15, metalness: .2 })); water.rotation.x = -Math.PI / 2; water.position.y = -5; scene.add(water);
  // instanced houses
  const { walls, roof } = houseGeos(); const wm = new THREE.MeshStandardMaterial({ roughness: .9 }), rm = new THREE.MeshStandardMaterial({ roughness: .6, metalness: .1 });
  const IW = new THREE.InstancedMesh(walls, wm, houses), IR = new THREE.InstancedMesh(roof, rm, houses);
  IW.castShadow = IR.castShadow = true; IW.receiveShadow = IR.receiveShadow = true;
  const data = []; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  let n = 0, tries = 0;
  while (n < houses && tries < houses * 20) {
    tries++; const a = r() * Math.PI * 2, d = Math.pow(r(), .7) * detailR; const x = Math.cos(a) * d, z = Math.sin(a) * d * 1.05;
    if (riverDist(def.rivers, x, z) < 14 || z > def.bay - 30 || mount(x, z) > 2) continue;
    if (Math.hypot(x - def.dome[0], z - def.dome[1]) < 45) continue;
    const w = 7 + r() * 7, dd = 8 + r() * 8, h = 3 + r() * 3.5 * (r() < .3 ? 1.6 : 1);
    data.push({ x, z, w, d: dd, h, rot: .06 + (r() < .5 ? 0 : Math.PI / 2) + (r() - .5) * .1, dist: Math.hypot(x, z), s: r(), wall: new THREE.Color().setHSL(.08 + r() * .05, .25 + r() * .2, .45 + r() * .25), roof: new THREE.Color().setHSL(.6 + r() * .04, .08 + r() * .08, .2 + r() * .15) });
    n++;
  }
  IW.count = IR.count = n;
  const charW = new THREE.Color('#2a221e'), charR = new THREE.Color('#1a1614'), tmpC = new THREE.Color();
  const apply = (blastR = -1, vapR = -1, burn = 0) => {
    for (let i = 0; i < n; i++) {
      const o = data[i]; let sy = 1, tilt = 0, gone = false;
      if (ruined || o.dist < blastR) { const k = ruined ? 1 : clamp((blastR - o.dist) / 60); sy = lerp(1, .14 + o.s * .1, k); tilt = (o.s - .5) * .6 * k; }
      if (o.dist < vapR || (ruined && o.dist < 1800 && o.s > .25)) gone = true;
      e.set(tilt, o.rot, tilt * .5); q.setFromEuler(e); sc.set(o.w, gone ? .001 : o.h * sy, o.d); ps.set(o.x, 1, o.z);
      m4.compose(ps, q, sc); IW.setMatrixAt(i, m4); IR.setMatrixAt(i, m4);
      const b = ruined ? 1 : (o.dist < blastR ? burn : 0);
      IW.setColorAt(i, tmpC.copy(o.wall).lerp(charW, b)); IR.setColorAt(i, tmpC.copy(o.roof).lerp(charR, b));
    }
    IW.instanceMatrix.needsUpdate = IR.instanceMatrix.needsUpdate = true; IW.instanceColor.needsUpdate = IR.instanceColor.needsUpdate = true;
  };
  apply(); scene.add(IW, IR);
  // concrete buildings near the centre
  const blocks = []; for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = 150 + r() * 1100; const x = Math.cos(a) * d, z = Math.sin(a) * d; if (riverDist(def.rivers, x, z) < 40) continue; const b = concreteBlock(25 + r() * 25, 12 + r() * 16, 20 + r() * 20, { ruined, seed: i, windows: false, col: ['#b9b2a4', '#a8a090', '#c4bba8'][i % 3] }); b.position.set(x, .5, z); b.rotation.y = .06; scene.add(b); blocks.push(b); }
  const dome = promotionHall({ ruined }); dome.position.set(def.dome[0], .5, def.dome[1]); dome.rotation.y = .06 + Math.PI; scene.add(dome);
  const br = tBridge(); br.position.set(def.bridge[0], 1.2, def.bridge[1]); scene.add(br);
  // more bridges across rivers
  for (const [x, z, rot, L] of [[-150, 700, 0, 140], [-560, 1000, 0, 160], [-1080, 900, 0, 120], [860, 400, 0, 150], [-160, 1800, 0, 140], [-640, 1900, 0, 150]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(L, 1.5, 12), M('#a59d8f', { rough: .8 })); b.position.set(x, 1, z); b.rotation.y = rot; b.castShadow = true; scene.add(b); }
  return { ground, water, houses: { IW, IR, data }, apply, dome, bridge: br, def, mount, blocks, fireSpots: (count, maxR, s = 9) => { const rr = rng(s); const out = []; for (let i = 0; i < count; i++) { const o = data[Math.floor(rr() * n)]; if (o.dist < maxR) out.push([o.x, 2, o.z, 6 + rr() * 10]); } return out; } };
}

// ----- Nagasaki: Urakami valley running N-S between ridges, harbour to the south -----
export const NAGA = { size: 7000, river: [[0, -3500], [60, -1500], [0, 0], [-120, 1200], [-200, 2000]], harbour: 1900, hypo: [0, -300], cathedral: [500, -200], stadium: [-150, -900], mitsubishi: [-250, 600] };
export function buildNagasaki(scene, { ruined = false, houses = 4000, seed = 8 } = {}) {
  const S = NAGA.size; const r = rng(seed);
  const valley = (x, z) => { const cx = z < 1500 ? 0 : -150; const wv = 650 + (z > 1200 ? (z - 1200) * .6 : 0); const d = Math.abs(x - cx); let h = d < wv ? 0 : Math.pow((d - wv) / 600, 1.5) * 210; h *= .7 + fbm(x / 500, z / 500, 4) * .6; if (z < -2800) h += (-2800 - z) * .2; return h; };
  const c = canvas(2048, 2048), g = c.getContext('2d'); const k = 2048 / S; const P = (x, z) => [(x + S / 2) * k, (z + S / 2) * k];
  for (let py = 0; py < 2048; py += 4) for (let px = 0; px < 2048; px += 4) { const x = px / k - S / 2, z = py / k - S / 2; const h = valley(x, z); const v = r(); g.fillStyle = h > 8 ? `rgb(${45 + v * 25 + h * .05},${70 + v * 25},${38 + v * 15})` : ruined && Math.hypot(x - NAGA.hypo[0], z - NAGA.hypo[1]) < 1600 ? `rgb(${50 + v * 40},${42 + v * 30},${36 + v * 25})` : `rgb(${110 + v * 40},${102 + v * 30},${88 + v * 25})`; g.fillRect(px, py, 4, 4); }
  g.strokeStyle = '#24505e'; g.lineWidth = 50 * k; g.lineCap = 'round'; g.beginPath(); NAGA.river.forEach(([x, z], i) => { const [X, Z] = P(x, z); i ? g.lineTo(X, Z) : g.moveTo(X, Z); }); g.stroke();
  { const [, hz] = P(0, NAGA.harbour); g.fillStyle = '#1f4a5a'; g.beginPath(); g.moveTo(P(-500, 0)[0], hz); g.lineTo(P(300, 0)[0], hz); g.lineTo(P(900, 0)[0], 2048); g.lineTo(P(-900, 0)[0], 2048); g.fill(); }
  const geo = new THREE.PlaneGeometry(S, S, 260, 260); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let h = valley(x, z); if (z > NAGA.harbour && Math.abs(x) < 300 + (z - NAGA.harbour) * .5) h = -8; p.setY(i, h + .5); }
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex(c), roughness: .95 })); ground.receiveShadow = true; scene.add(ground);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(S * 3, S * 3), new THREE.MeshStandardMaterial({ color: '#244e5c', roughness: .15, metalness: .2 })); water.rotation.x = -Math.PI / 2; water.position.y = -3; scene.add(water);
  const { walls, roof } = houseGeos(); const IW = new THREE.InstancedMesh(walls, new THREE.MeshStandardMaterial({ roughness: .9 }), houses), IR = new THREE.InstancedMesh(roof, new THREE.MeshStandardMaterial({ roughness: .6 }), houses);
  IW.castShadow = IR.castShadow = true; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let n = 0;
  const data = [];
  for (let t = 0; t < houses * 10 && n < houses; t++) { const x = (r() - .5) * 2600, z = (r() - .5) * 5200; const h0 = valley(x, z); if (h0 > 40 || z > NAGA.harbour - 20 || Math.abs(x - (z < 1500 ? 0 : -150)) < 40) continue;
    const w = 7 + r() * 6, d = 8 + r() * 7, h = 3 + r() * 3; const dist = Math.hypot(x - NAGA.hypo[0], z - NAGA.hypo[1]); data.push({ x, z, y: h0 + .5, w, d, h, dist, s: r(), rot: r() < .5 ? 0 : Math.PI / 2 }); n++; }
  const apply = (blastR = -1, burn = 0) => { const cw = new THREE.Color(), cr = new THREE.Color(); for (let i = 0; i < n; i++) { const o = data[i]; const hit = ruined || o.dist < blastR; const sy = hit ? .15 : 1; const gone = (ruined && o.dist < 1300 && o.s > .3);
    e.set(hit ? (o.s - .5) * .5 : 0, o.rot, 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(o.x, o.y, o.z), q, new THREE.Vector3(o.w, gone ? .001 : o.h * sy, o.d)); IW.setMatrixAt(i, m4); IR.setMatrixAt(i, m4);
    cw.setHSL(.08, .25, .5).lerp(new THREE.Color('#2a221e'), hit ? (ruined ? 1 : burn) : 0); cr.setHSL(.6, .1, .28).lerp(new THREE.Color('#1a1614'), hit ? (ruined ? 1 : burn) : 0); IW.setColorAt(i, cw); IR.setColorAt(i, cr); }
    IW.count = IR.count = n; IW.instanceMatrix.needsUpdate = IR.instanceMatrix.needsUpdate = true; IW.instanceColor.needsUpdate = IR.instanceColor.needsUpdate = true; };
  apply(); scene.add(IW, IR);
  const cat = cathedral({ ruined }); cat.position.set(NAGA.cathedral[0], valley(...NAGA.cathedral) + .5, NAGA.cathedral[1]); cat.rotation.y = Math.PI; scene.add(cat);
  // Mitsubishi works: long sawtooth sheds
  for (let i = 0; i < 6; i++) { const b = concreteBlock(140, 14, 40, { ruined, windows: false, col: '#8f8a80', seed: i }); b.position.set(NAGA.mitsubishi[0] + (i % 2) * 160, .5, NAGA.mitsubishi[1] + Math.floor(i / 2) * 60); scene.add(b); }
  // stadium oval
  const st = new THREE.Mesh(new THREE.TorusGeometry(70, 8, 6, 40), M('#b0a890', { rough: .9 })); st.scale.z = 1.5; st.rotation.x = Math.PI / 2; st.position.set(NAGA.stadium[0], 3, NAGA.stadium[1]); scene.add(st);
  const field = new THREE.Mesh(new THREE.CircleGeometry(68, 40), M('#5a7a3a', { rough: 1 })); field.scale.y = 1.5; field.rotation.x = -Math.PI / 2; field.position.set(NAGA.stadium[0], 1, NAGA.stadium[1]); scene.add(field);
  return { ground, water, apply, valley, data, cat, fireSpots: (count, maxR, s = 9) => { const rr = rng(s); const out = []; for (let i = 0; i < count; i++) { const o = data[Math.floor(rr() * n)]; if (o.dist < maxR) out.push([o.x, o.y + 2, o.z, 6 + rr() * 10]); } return out; } };
}
