// 3D sets, part 1: 1939–1944 (study, Oval Office, globe, lab, chain reaction, Los Alamos, plants, committee, Kyoto).
import * as THREE from 'three';
import { stage, look, THREE as T3 } from './common.js';
import { M, MAT, U, Basic } from '../kit/materials.js';
import { CAST, POSE, person, walk } from '../kit/people.js';
import * as P from '../kit/props.js';
import * as B from '../kit/buildings.js';
import { ground, terrain, water, point, spot, C } from '../kit/env.js';
import { canvas, tex, sandTex } from '../core/textures.js';
import { motes, smoke, fire, Particles } from '../kit/fx.js';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { country, worldFeatures } from '../2d/maps.js';
import { rng, clamp, fbm, lerp, smooth, easeOut, expoOut } from '../core/math.js';
import { softDot } from '../core/textures.js';

// ---------- Einstein's summer cottage study, 1939 ----------
export function study() {
  const S = stage({ sky: { top: '#7aa8d0', mid: '#f3dcb5', bot: '#c9b494', sun: [-1, .5, .2] }, light: { sun: [-12, 8, 3], sunCol: '#ffd9a8', sunI: 2.4, hemiI: .35, area: 6, target: [0, 1, 0] } });
  const room = P.room({ w: 7, d: 6, h: 3.2, wall: '#8c6f4f', wainscot: '#4a2e1c', windowSide: -1, ceiling: false }); S.scene.add(room);
  const desk = P.desk(); desk.position.set(0, 0, -1.2); desk.rotation.y = Math.PI; S.scene.add(desk);
  const lamp = P.bankerLamp(S.scene); lamp.position.set(-.65, .78, -1.0); lamp.rotation.y = Math.PI; S.scene.add(lamp);
  const tw = P.typewriter(); tw.position.set(.5, .79, -1.35); tw.rotation.y = Math.PI + .3; S.scene.add(tw);
  const letter = P.paper(P.LETTER, { highlight: [26, 27] }); letter.position.set(-.1, .795, -1.25); letter.rotation.z = Math.PI + .12; S.scene.add(letter);
  const shelf = P.bookshelf({ w: 2.4 }); shelf.position.set(1.4, 0, -2.85); S.scene.add(shelf);
  const ein = CAST.einstein(); ein.position.set(-.05, 0, -2.0); ein.pose(POSE.write); S.scene.add(ein);
  const chair = P.chair(); chair.position.set(-.05, 0, -2.1); S.scene.add(chair);
  const szi = CAST.szilard(); szi.position.set(1.25, 0, -1.3); szi.rotation.y = -1.9; szi.pose({ armR: [.7, .1], elbowR: 1.2, head: [.25, 0, 0] }); S.scene.add(szi);
  const pipe = P.cyl(.012, .012, .12, M('#3a2010'), 0, 0, 0); S.scene.add(pipe);
  point(S.scene, [-2.5, 2.4, .5], '#ffc890', 4, 8); point(S.scene, [.5, 1.8, 1.5], '#ffd8b0', 3, 6);
  const dust = motes(220, { box: [4, 2.5, 4], center: [-1.2, 1.6, -.5], col: '#ffe2b0', size: .012, speed: [.02, .03, 0], alpha: .7 }); S.scene.add(dust); S.particles.push(dust);
  S.grade = { tint: [1.06, 1, .9], sat: .95, lift: [.04, .02, 0], bloom: .7 };
  return Object.assign(S, { ein, szi, letter, desk });
}

// ---------- Oval Office ----------
export function oval({ reading = true } = {}) {
  const S = stage({ sky: { top: '#a8c4dc', mid: '#f4f0e6', bot: '#ddd', sun: [.2, .5, -1] }, light: { sun: [3, 6, -10], sunCol: '#fff2dc', sunI: 2, hemiI: .5, area: 6, target: [0, 1, -1] } });
  const room = P.room({ w: 9, d: 8, h: 3.8, wall: '#c8bea2', wainscot: '#e9e2cf', ceiling: false }); S.scene.add(room);
  // tall windows behind desk with glowing daylight
  for (const x of [-1.6, 0, 1.6]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff3dc').multiplyScalar(1.15) })); w.position.set(x, 1.9, -3.94); S.scene.add(w); S.scene.add(P.box(1.3, .12, .1, M('#e9e2cf'), x, .66, -3.9)); for (const o of [-.58, .58]) { const cur = P.box(.5, 3, .08, M('#7a1f24', { rough: .9 }), x + o, 1.9, -3.85); S.scene.add(cur); } }
  const desk = P.desk({ w: 2.2, d: 1.1, wood: M('#5a3018', { rough: .4 }) }); desk.position.set(0, 0, -2.2); S.scene.add(desk);
  const fdr = CAST.roosevelt(); fdr.position.set(0, 0, -2.95); fdr.pose(reading ? { sit: true, armL: [1.1, .2], armR: [1.1, .2], elbowL: .9, elbowR: .9, head: [.35, 0, 0], spine: .1 } : POSE.sitDesk); S.scene.add(fdr);
  const chair = P.chair({ col: '#2a3a5a' }); chair.position.set(0, 0, -3.05); S.scene.add(chair);
  const letter = P.paper(P.LETTER, { highlight: [26, 27] }); letter.position.set(0, .82, -2.45); letter.rotation.set(-1.2, 0, 0); S.scene.add(letter);
  const f1 = P.flag('us'); f1.position.set(-1.9, 0, -3.4); S.scene.add(f1);
  const lamp = P.bankerLamp(S.scene); lamp.position.set(.85, .79, -2.3); S.scene.add(lamp);
  const ph = P.phone(); ph.position.set(-.8, .79, -2.2); S.scene.add(ph);
  // presidential rug
  const c = canvas(1024, 1024), g = c.getContext('2d'); g.fillStyle = '#1f3050'; g.beginPath(); g.arc(512, 512, 510, 0, 7); g.fill(); g.strokeStyle = '#d6b45a'; g.lineWidth = 16; g.beginPath(); g.arc(512, 512, 470, 0, 7); g.stroke(); g.beginPath(); g.arc(512, 512, 200, 0, 7); g.fillStyle = '#d6b45a'; g.fill(); g.fillStyle = '#1f3050'; g.font = '700 70px "Playfair Display"'; g.textAlign = 'center'; g.fillText('★ ★ ★', 512, 535);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 64), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .01, -.6); rug.receiveShadow = true; S.scene.add(rug);
  point(S.scene, [0, 2.2, -.4], '#ffe8cc', 6, 7); point(S.scene, [1.8, 1.6, -1.2], '#ffd8a8', 2.5, 5);
  S.grade = { tint: [1.02, 1, .95], sat: 1, bloom: .45, bloomThreshold: .85 };
  return Object.assign(S, { fdr, letter });
}

// ---------- 3D Earth (equirectangular canvas texture from world-atlas) ----------
let EARTH = null;
function earthTex() {
  if (EARTH) return EARTH; const c = canvas(4096, 2048), g = c.getContext('2d');
  const p = geoEquirectangular().scale(4096 / (2 * Math.PI)).translate([2048, 1024]); const path = geoPath(p, g);
  const gr = g.createLinearGradient(0, 0, 0, 2048); gr.addColorStop(0, '#0b1a2a'); gr.addColorStop(.5, '#0f2a40'); gr.addColorStop(1, '#0b1a2a'); g.fillStyle = gr; g.fillRect(0, 0, 4096, 2048);
  g.strokeStyle = 'rgba(120,180,220,.08)'; g.lineWidth = 2; for (let x = 0; x < 4096; x += 4096 / 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 2048); g.stroke(); } for (let y = 0; y < 2048; y += 2048 / 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(4096, y); g.stroke(); }
  const W = worldFeatures(); if (W) { g.beginPath(); for (const f of W) path(f); g.fillStyle = '#3b4a44'; g.fill(); g.strokeStyle = 'rgba(200,230,220,.25)'; g.lineWidth = 1.5; g.stroke(); }
  EARTH = c; return c;
}
export function globe({ highlight = {}, stars = true, atmos = '#4aa0ff' } = {}) {
  const S = stage({ sky: { top: '#020308', mid: '#05070d', bot: '#020308', stars: stars ? 1.2 : 0, sunGlow: 0 }, light: { sun: [-8, 4, 10], sunCol: '#fff2e0', sunI: 3.2, hemiI: .15, shadow: false }, env: .2 });
  const base = earthTex(); const c = canvas(4096, 2048); const g = c.getContext('2d'); g.drawImage(base, 0, 0);
  const p = geoEquirectangular().scale(4096 / (2 * Math.PI)).translate([2048, 1024]); const path = geoPath(p, g);
  for (const [id, col] of Object.entries(highlight)) { const f = country(id); if (!f) continue; g.save(); g.shadowColor = col; g.shadowBlur = 30; g.beginPath(); path(f); g.fillStyle = col; g.fill(); g.restore(); }
  const t = tex(c); const sph = new THREE.Mesh(new THREE.SphereGeometry(10, 128, 64), new THREE.MeshStandardMaterial({ map: t, roughness: .8, metalness: 0, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: .35 }));
  S.scene.add(sph);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(10.6, 64, 32), new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { c: { value: new THREE.Color(atmos) } },
    vertexShader: 'varying vec3 n; varying vec3 v; void main(){ n = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); v = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; varying vec3 n; varying vec3 v; void main(){ float f = pow(1. - abs(dot(n, v)), 2.5); gl_FragColor = vec4(c * f * 2.2, f); }' }));
  S.scene.add(atm);
  // rotate so lon/lat faces camera: helper
  const face = (lon, lat) => { sph.rotation.set(0, 0, 0); sph.rotation.order = 'XYZ'; sph.rotation.y = -Math.PI / 2 - lon * Math.PI / 180; sph.rotation.x = lat * Math.PI / 180; };
  S.grade = { bloom: .9, bloomThreshold: .5, vignette: .6 };
  return Object.assign(S, { globe: sph, face, ll2v: (lon, lat, r = 10.05) => { const v = new THREE.Vector3(); const la = lat * Math.PI / 180, lo = lon * Math.PI / 180; v.set(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)); return v.applyEuler(sph.rotation); } });
}

// ---------- physics lab ----------
export function atomModel({ scale = 1, glow = 1 } = {}) {
  const g = new THREE.Group(); const r = rng(3);
  for (let i = 0; i < 26; i++) { const v = new THREE.Vector3(r() - .5, r() - .5, r() - .5).normalize().multiplyScalar(Math.cbrt(r()) * .32); const s = new THREE.Mesh(new THREE.SphereGeometry(.09, 16, 12), M(i % 2 ? '#e0402a' : '#3a7bd5', { rough: .3, emissive: i % 2 ? '#ff4020' : '#2a6aff', ei: .6 * glow })); s.position.copy(v); g.add(s); }
  const rings = []; for (let i = 0; i < 3; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, .008, 6, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9fd8ff').multiplyScalar(1.1 * glow) })); ring.rotation.set(Math.PI / 2 + i * .9, i * 1.1, 0); g.add(ring);
    const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bfe8ff').multiplyScalar(5 * glow) })); ring.add(e); rings.push(e); }
  const l = new THREE.PointLight('#7ab8ff', 1.2 * glow, 6, 2); g.add(l);
  g.scale.setScalar(scale); g.userData.tick = (lt) => { rings.forEach((e, i) => { const a = lt * (1.4 + i * .5) + i * 2; e.position.set(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0); }); g.rotation.y = lt * .2; };
  return g;
}
export function lab({ night = true } = {}) {
  const S = stage({ sky: { top: '#0a1220', mid: '#1a2a3a', bot: '#0a0a0a', stars: .5 }, light: { sun: [5, 8, 6], sunCol: '#9ab8ff', sunI: .5, hemiI: .2, area: 6 } });
  const room = P.room({ w: 9, d: 7, h: 3.6, wall: '#3e4a4e', wainscot: '#2a2420', ceiling: false }); S.scene.add(room);
  const board = P.chalkboard([['E = mc²', 120, 160, 120], ['²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n', 120, 340, 72], ['k > 1  ⇒  chain reaction', 140, 480, 64, '#ffd27a'], ['λ = h / p', 1050, 180, 70], ['ΔE ≈ 200 MeV', 1000, 640, 70, '#ff9a8a'], ['n → n → n', 130, 650, 60]], { w: 4.4, h: 2.1 });
  board.position.set(0, 1.9, -3.4); S.scene.add(board);
  const table = P.desk({ w: 2.6, d: 1 }); table.position.set(0, 0, -1.2); S.scene.add(table);
  const atom = atomModel({ scale: .35 }); atom.position.set(0, 1.2, -1.2); S.scene.add(atom);
  const glassM = M('#bfe0f0', { rough: .05, metal: .1, transparent: true, opacity: .35 });
  for (let i = 0; i < 6; i++) { const b = P.cyl(.04 + (i % 3) * .015, .05 + (i % 2) * .02, .18 + (i % 3) * .08, glassM, -1 + i * .16, .86, -1.35); S.scene.add(b); }
  const lamp = P.bankerLamp(S.scene); lamp.position.set(1, .79, -1.4); S.scene.add(lamp);
  const sci = CAST.scientist(); sci.position.set(1.5, 0, -2.3); sci.rotation.y = -.5; sci.pose({ armR: [1.3, .2], elbowR: .3, head: [-.1, -.5, 0] }); S.scene.add(sci);
  S.grade = { tint: [.95, 1, 1.08], sat: 1.05, bloom: .6, bloomThreshold: .85 };
  return Object.assign(S, { atom, board });
}

// ---------- nuclear chain reaction (abstract, generation-timed) ----------
export function chainReaction({ gens = 6 } = {}) {
  const S = stage({ sky: { top: '#030509', mid: '#06080f', bot: '#030509', stars: .4, sunGlow: 0 }, light: { sun: [5, 8, 6], sunI: 1, hemiI: .3, shadow: false }, env: .3 });
  const r = rng(11); const nodes = []; // tree of nuclei
  const add = (pos, gen, parent) => { nodes.push({ pos, gen, parent }); if (gen >= gens) return; const k = gen < 2 ? 2 : r() < .7 ? 2 : 3; for (let i = 0; i < k; i++) { const dir = new THREE.Vector3(r() - .5, r() - .5, r() - .5).normalize(); add(pos.clone().add(dir.multiplyScalar(2.2 + gen * .25)), gen + 1, nodes.length - 1 - 0); } };
  // build properly: iterative BFS
  nodes.length = 0; const q = [{ pos: new THREE.Vector3(0, 0, 0), gen: 0, parent: -1 }];
  while (q.length) { const n = q.shift(); const idx = nodes.length; nodes.push(n); if (n.gen >= gens) continue; const k = n.gen < 2 ? 2 : (r() < .6 ? 2 : 3); for (let i = 0; i < k; i++) { const a = r() * Math.PI * 2, b = (r() - .5) * 1.6; const dir = new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)); q.push({ pos: n.pos.clone().add(dir.multiplyScalar(2.3 + n.gen * .3)), gen: n.gen + 1, parent: idx }); } }
  const nucM = [M('#3a7bd5', { rough: .35, emissive: '#1a4aaa', ei: .5 }), M('#d5483a', { rough: .35, emissive: '#aa2a1a', ei: .5 })];
  const nuc = nodes.map((n) => { const g = new THREE.Group(); g.position.copy(n.pos); for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10), nucM[i % 2]); s.position.set((r() - .5) * .35, (r() - .5) * .35, (r() - .5) * .35); g.add(s); } S.scene.add(g); return g; });
  const flashM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe6a0').multiplyScalar(2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const flashes = nodes.map((n) => { const f = new THREE.Mesh(new THREE.SphereGeometry(.6, 16, 12), flashM.clone()); f.position.copy(n.pos); f.visible = false; S.scene.add(f); return f; });
  const neutrons = nodes.map((n) => { const s = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#cfefff').multiplyScalar(6) })); s.visible = false; S.scene.add(s); return s; });
  const trailG = new THREE.BufferGeometry(); const trailPos = new Float32Array(nodes.length * 6); trailG.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trails = new THREE.LineSegments(trailG, new THREE.LineBasicMaterial({ color: new THREE.Color('#7fd0ff').multiplyScalar(2), transparent: true, opacity: .55 })); S.scene.add(trails);
  // timing: generation g hit at time genT(g)
  S.setTimes = (fn) => { S.genT = fn; };
  S.genT = (g) => g * .9;
  S.update0 = (lt) => {
    nodes.forEach((n, i) => {
      const th = S.genT(n.gen); const tp = n.parent >= 0 ? S.genT(n.gen) - .7 : th - .8; const travel = clamp((lt - tp) / (th - tp));
      const from = n.parent >= 0 ? nodes[n.parent].pos : n.pos.clone().add(new THREE.Vector3(-6, 0, 0));
      const nm = neutrons[i]; nm.visible = travel > 0 && travel < 1; nm.position.lerpVectors(from, n.pos, travel);
      const k = (i * 6); const cur = new THREE.Vector3().lerpVectors(from, n.pos, travel);
      trailPos.set([from.x, from.y, from.z, cur.x, cur.y, cur.z], k);
      if (travel <= 0) trailPos.set([from.x, from.y, from.z, from.x, from.y, from.z], k);
      const split = lt - th; const g = nuc[i];
      if (split > 0) { g.children.forEach((c, j) => { const d = c.position.clone().normalize(); c.position.addScaledVector(d, .0); }); g.scale.setScalar(Math.max(.001, 1 - split * 1.5)); }
      else g.scale.setScalar(1 + Math.sin(lt * 9 + i) * .03);
      const f = flashes[i]; f.visible = split > 0 && split < .5; f.scale.setScalar(.3 + split * 2.2); f.material.opacity = clamp(1 - split / .6);
    });
    trailG.attributes.position.needsUpdate = true;
  };
  S.grade = { bloom: .9, bloomThreshold: .6, vignette: .65 };
  return Object.assign(S, { nodes });
}

// ---------- Los Alamos mesa town rising ----------
export function losAlamos() {
  const S = stage({ sky: { top: '#2b4f7a', mid: '#f0a868', bot: '#6a4a3a', sun: [-1, .12, -.5], sunCol: '#ffc080', sunGlow: .35 }, light: { sun: [-200, 60, -100], sunCol: '#ffbe7a', sunI: 3.4, hemiI: .55, hemiTop: '#9ab8e0', hemiBot: '#8a5a3a', area: 160, mapSize: 4096 }, far: 9000, near: .5 });
  S.scene.fog = new THREE.Fog('#d9a27a', 300, 2600);
  terrain(S.scene, { size: 6000, seg: 220, height: (x, z) => { const d = Math.hypot(x, z); const mesa = d < 340 ? 0 : -Math.min(90, (d - 340) * .6); const far = Math.max(0, -z - 900) * .25 * (.6 + fbm(x / 400, z / 400) * .8); return mesa + fbm(x / 120, z / 120) * 4 + far; },
    color: (x, z, h) => C('#b98a5a').lerp(C('#7a5a3a'), clamp(-h / 90)).lerp(C('#4a5a34'), clamp((fbm(x / 60, z / 60) - .45) * 3) * .5) });
  const r = rng(9); const bld = [];
  for (let i = 0; i < 38; i++) { const b = i % 7 === 0 ? B.waterTower() : B.barrack({ w: 20 + r() * 25, col: r.pick(['#6f7a63', '#7a7a6a', '#5d6a55', '#8a7f68']) }); b.position.set((r() - .5) * 420, 0, (r() - .5) * 360); b.rotation.y = r() < .5 ? 0 : Math.PI / 2; S.scene.add(b); bld.push({ b, at: r() }); }
  const f = B.fence(500); f.position.set(0, 0, 200); S.scene.add(f);
  // pines
  const treeM = M('#2f4a2a', { rough: .9 }); for (let i = 0; i < 160; i++) { const a = r() * 6.28, d = 230 + r() * 160; const tr = new THREE.Mesh(new THREE.ConeGeometry(3 + r() * 2, 10 + r() * 8, 7), treeM); tr.position.set(Math.cos(a) * d, 5, Math.sin(a) * d); tr.castShadow = true; S.scene.add(tr); }
  S.grow = (k) => bld.forEach(({ b, at }) => { const e = easeOut(clamp((k - at * .8) / .25)); b.scale.set(1, Math.max(.001, e), 1); b.visible = e > .01; });
  const dust = motes(300, { box: [500, 40, 500], center: [0, 20, 0], col: '#ffd8a8', size: .6, speed: [3, .2, 0], alpha: .35 }); S.scene.add(dust); S.particles.push(dust);
  S.grade = { tint: [1.06, .98, .9], sat: 1.08, bloom: .6 };
  return S;
}

// ---------- K-25 (Oak Ridge) and Hanford B Reactor ----------
export function oakRidge() {
  const S = stage({ sky: { top: '#1a2a44', mid: '#e09060', bot: '#3a3a40', sun: [1, .08, -.3], sunCol: '#ffb070' }, light: { sun: [400, 120, -200], sunCol: '#ffb880', sunI: 3, hemiI: .5, area: 450, mapSize: 4096 }, far: 9000, near: 1 });
  S.scene.fog = new THREE.Fog('#c08a70', 500, 3500);
  terrain(S.scene, { size: 7000, seg: 160, height: (x, z) => (Math.hypot(x, z) > 700 ? Math.pow((Math.hypot(x, z) - 700) / 500, 1.4) * 60 * fbm(x / 300, z / 300) : 0), color: (x, z, h) => C('#4a5a38').lerp(C('#2e3e2a'), clamp(h / 80)).lerp(C('#6a6a5a'), Math.hypot(x, z) < 650 ? .7 : 0) });
  const k = B.k25({ night: true }); S.scene.add(k);
  const sm = smoke([[180, 30, -220, 4], [-150, 30, -220, 4]], { col: '#8a8a90', col2: '#c8c0c0', alpha: .3, rise: 40 }); S.scene.add(sm); S.particles.push(sm);
  for (const [x, z] of [[180, -220], [-150, -220]]) S.scene.add(P.cyl(5, 6, 40, M('#8a8278'), x, 20, z));
  // uranium glow core visible inside
  S.grade = { tint: [1.02, 1, 1.02], bloom: .8 };
  return S;
}
export function hanford() {
  const S = stage({ sky: { top: '#1e2240', mid: '#8a6aa0', bot: '#2a2a35', sun: [-1, .05, .3], sunCol: '#d8a0ff' }, light: { sun: [-300, 80, 200], sunCol: '#e8c0ff', sunI: 2.6, hemiI: .45, hemiTop: '#7a8ad0', area: 160, mapSize: 4096 }, far: 9000, near: .5 });
  S.scene.fog = new THREE.Fog('#5a4a70', 300, 3000);
  terrain(S.scene, { size: 6000, seg: 160, height: (x, z) => fbm(x / 200, z / 200) * 6 + (z > 300 ? -8 : 0), color: (x, z) => z > 320 ? C('#2a3a5a') : C('#8a7a5a').lerp(C('#6a6040'), fbm(x / 80, z / 80)) });
  water(S.scene, { y: -4, color: '#2a4060' });
  const re = B.reactorB(); S.scene.add(re);
  const glow = new THREE.PointLight('#8a5aff', 400, 120, 2); glow.position.set(0, 10, 30); S.scene.add(glow);
  S.grade = { tint: [1, .97, 1.06], bloom: .8 };
  return S;
}

// ---------- calutron control room ----------
function panelTex(seed) {
  const c = canvas(1024, 512), g = c.getContext('2d'); g.fillStyle = '#2f5a52'; g.fillRect(0, 0, 1024, 512); const r = rng(seed);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const cx = 140 + i * 250, cy = 140 + j * 230; g.fillStyle = '#e9e3d0'; g.beginPath(); g.arc(cx, cy, 90, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 6; g.stroke(); for (let k = 0; k < 11; k++) { const a = Math.PI * .8 + k / 10 * Math.PI * 1.4; g.beginPath(); g.moveTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70); g.lineTo(cx + Math.cos(a) * 84, cy + Math.sin(a) * 84); g.lineWidth = 3; g.stroke(); } const a = Math.PI * .8 + r() * Math.PI * 1.4; g.strokeStyle = '#b3202a'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 75, cy + Math.sin(a) * 75); g.stroke(); }
  for (let i = 0; i < 14; i++) { g.fillStyle = '#111'; g.beginPath(); g.arc(70 + i * 68, 480, 14, 0, 7); g.fill(); }
  return tex(c);
}
export function calutron() {
  const S = stage({ sky: false, bg: '#0a0c0e', light: { sun: [4, 8, 6], sunCol: '#d8e8ff', sunI: 1.2, hemiI: .5, area: 10 } });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M('#3a3e40', { rough: .7 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; S.scene.add(fl);
  const ops = [];
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group(); g.position.set(i * 2.2 - 8, 0, 0); S.scene.add(g);
    g.add(P.box(2, 2.4, .6, M('#3b6a60', { rough: .5, metal: .3 }), 0, 1.2, -.3));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .95), new THREE.MeshStandardMaterial({ map: panelTex(i), roughness: .4, emissive: '#ffffff', emissiveMap: panelTex(i), emissiveIntensity: .12 })); face.position.set(0, 1.55, .01); g.add(face);
    g.add(P.box(2, .1, .4, M('#2a4a44'), 0, .95, .1));
    const op = CAST.operator(); op.position.set(0, 0, .8); op.rotation.y = Math.PI; op.pose({ sit: true, seat: .62, armL: [1.2, .1], armR: [1.4, .1], elbowL: .6, elbowR: .4, head: [-.1, 0, 0] }); g.add(op); ops.push(op);
    const stool = P.cyl(.18, .18, .6, M('#222'), 0, .3, .85); g.add(stool);
    const l = new THREE.PointLight('#ffe8c0', 3, 4, 2); l.position.set(0, 2.8, .8); g.add(l);
  }
  S.grade = { tint: [.96, 1.03, 1.02], sat: .95, bloom: .5 };
  return Object.assign(S, { ops });
}

// ---------- target committee: map of Japan on a table ----------
export function committee(mapCanvas) {
  const S = stage({ sky: false, bg: '#050505', light: { sun: [0, 9, 2], sunCol: '#ffe0b0', sunI: .6, hemiI: .15, area: 5 } });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M('#1a1410', { rough: .9 })); fl.rotation.x = -Math.PI / 2; S.scene.add(fl);
  const table = P.box(3.6, .08, 2.2, M('#3a2414', { rough: .4 }), 0, .78, 0); S.scene.add(table); for (const [x, z] of [[-1.6, -.9], [1.6, -.9], [-1.6, .9], [1.6, .9]]) S.scene.add(P.box(.1, .78, .1, M('#2a1a10'), x, .39, z));
  const mapT = tex(mapCanvas); const mp = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshStandardMaterial({ map: mapT, roughness: .8 })); mp.rotation.x = -Math.PI / 2; mp.position.set(0, .825, 0); mp.receiveShadow = true; S.scene.add(mp);
  const sp = P.box(.01, .01, .01, M('#000')); S.scene.add(sp);
  const lampL = new THREE.SpotLight('#ffd9a0', 60, 0, .7, .6, 2); lampL.position.set(0, 3, 0); lampL.target.position.set(0, .8, 0); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); S.scene.add(lampL, lampL.target);
  const shadeM = M('#1f5a3a', { rough: .3 }); const shade = new THREE.Mesh(new THREE.ConeGeometry(.5, .35, 24, 1, true), shadeM); shade.position.set(0, 3.1, 0); S.scene.add(shade);
  const men = []; const kinds = ['groves', 'stimson', 'oppenheimer', 'szilard', 'truman', 'groves'];
  [[-1.3, -1.5, 0], [0, -1.6, 0], [1.3, -1.5, 0], [-1.3, 1.5, Math.PI], [0, 1.6, Math.PI], [1.3, 1.5, Math.PI]].forEach(([x, z, ry], i) => { const p = i === 2 ? CAST.oppenheimer() : (i % 2 ? CAST.stimson() : CAST.groves()); p.position.set(x, 0, z); p.rotation.y = ry; p.pose({ armL: [.5, .1], armR: [.8, .1], elbowR: .5, spine: .25, head: [.4, 0, 0] }); S.scene.add(p); men.push(p); });
  const smk = smoke([[.8, 1.2, .3, .05]], { col: '#8a8078', col2: '#c0b8b0', alpha: .25, rise: 30, spread: 20, rate: .08 }); S.scene.add(smk); S.particles.push(smk);
  S.grade = { tint: [1.05, 1, .92], sat: .9, bloom: .5, vignette: .7 };
  return Object.assign(S, { map: mp, men });
}

// ---------- Kyoto temple at sunset ----------
export function kyoto() {
  const S = stage({ sky: { top: '#3a3a6a', mid: '#ffb070', bot: '#5a3a3a', sun: [.8, .08, -1], sunCol: '#ffb070', sunGlow: .5 }, light: { sun: [80, 20, -100], sunCol: '#ffb070', sunI: 3, hemiI: .5, area: 60 }, near: .5, far: 4000 });
  S.scene.fog = new THREE.Fog('#e0a080', 120, 900);
  terrain(S.scene, { size: 2000, seg: 120, height: (x, z) => (z < -200 ? Math.pow((-z - 200) / 200, 1.3) * 60 * fbm(x / 150, z / 150) : 0), color: (x, z, h) => C('#5a5a3a').lerp(C('#3a4a2a'), clamp(h / 40)) });
  const pg = B.pagoda(); pg.position.set(0, 0, -40); S.scene.add(pg);
  const to = B.torii(); to.position.set(0, 0, 10); S.scene.add(to);
  const r = rng(4); const leafM = [M('#c8371f', { rough: .8 }), M('#e06a2a', { rough: .8 }), M('#b02a2a', { rough: .8 })];
  for (let i = 0; i < 40; i++) { const g = new THREE.Group(); const x = (r() < .5 ? -1 : 1) * (12 + r() * 40), z = -80 + r() * 100; g.position.set(x, 0, z); g.add(P.cyl(.3, .4, 4, M('#3a2a1a'), 0, 2, 0, 6)); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4 + r() * 1.2, 0), r.pick(leafM)); b.position.set((r() - .5) * 3, 4.5 + r() * 2, (r() - .5) * 3); b.castShadow = true; g.add(b); } S.scene.add(g); }
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4, 120), M('#a59a88', { rough: .95 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .05, -10); S.scene.add(path);
  const leaves = motes(260, { box: [80, 30, 80], center: [0, 12, -10], col: '#e06030', size: .25, speed: [.8, -1, .3], additive: false, alpha: .9, flicker: false }); S.scene.add(leaves); S.particles.push(leaves);
  S.grade = { tint: [1.06, .98, .92], sat: 1.12, bloom: .7 };
  return S;
}
