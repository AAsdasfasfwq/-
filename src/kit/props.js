// Interior props, documents, furniture, signage. Units: metres.
import * as THREE from 'three';
import { M, MAT, U, Basic } from './materials.js';
import { canvas, tex, woodTex } from '../core/textures.js';
import { rng } from '../core/math.js';

export const sh = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
export const box = (w, h, d, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
export const cyl = (rt, rb, h, m, x = 0, y = 0, z = 0, seg = 20) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
export const sphere = (r, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); o.position.set(x, y, z); o.castShadow = true; return o; };

// ---------- documents ----------
export const LETTER = ['Albert Einstein', 'Old Grove Rd.', 'Nassau Point', 'Peconic, Long Island', '', 'August 2nd, 1939', '', 'F.D. Roosevelt,', 'President of the United States,', 'White House', 'Washington, D.C.', '', 'Sir:', '',
  'Some recent work by E. Fermi and L. Szilard, which has been', 'communicated to me in manuscript, leads me to expect that the', 'element uranium may be turned into a new and important source', 'of energy in the immediate future. ...', '',
  'In the course of the last four months it has been made probable', '... that it may become possible to set up a nuclear chain', 'reaction in a large mass of uranium, by which vast amounts of', 'power and large quantities of new radium-like elements', 'would be generated. ...', '',
  'This new phenomenon would also lead to the construction of', 'bombs, and it is conceivable — though much less certain — that', 'extremely powerful bombs of a new type may thus be constructed.', 'A single bomb of this type, carried by boat and exploded in a', 'port, might very well destroy the whole port together with', 'some of the surrounding territory. ...', '', 'Yours very truly,', '', '          A. Einstein'];
export const POTSDAM = ['PROCLAMATION DEFINING TERMS', 'FOR JAPANESE SURRENDER', 'Issued, at Potsdam, July 26, 1945', '', '(1) We — the President of the United States, the President', 'of the National Government of the Republic of China, and the', 'Prime Minister of Great Britain, representing the hundreds of', 'millions of our countrymen, have conferred and agree that', 'Japan shall be given an opportunity to end this war. ...', '',
  '(13) We call upon the government of Japan to proclaim now the', 'unconditional surrender of all Japanese armed forces, and to', 'provide proper and adequate assurances of their good faith in', 'such action. The alternative for Japan is prompt and utter', 'destruction.'];

export function docCanvas(lines, { w = 1024, h = 1400, font = '25px "Courier New", "JetBrains Mono", monospace', color = '#1d1a16', paper = '#efe7d4', top = 90, lh = 34, left = 80, title = null, stamp = null, highlight = null, sig = false, center = 0 } = {}) {
  const c = canvas(w, h), g = c.getContext('2d'); g.fillStyle = paper; g.fillRect(0, 0, w, h);
  const r = rng(11); for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(90,70,40,${r() * .05})`; g.fillRect(r() * w, r() * h, r() * 3, r() * 3); }
  const gr = g.createRadialGradient(w / 2, h / 2, w * .3, w / 2, h / 2, w * .9); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(90,60,20,.22)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  let y = top;
  if (title) { g.font = '700 44px "Playfair Display"'; g.fillStyle = color; g.textAlign = 'center'; g.fillText(title, w / 2, y); y += 70; }
  g.font = font; g.fillStyle = color; g.textAlign = 'left';
  lines.forEach((l, i) => {
    if (highlight && highlight.includes(i)) { const tw = g.measureText(l).width; g.fillStyle = 'rgba(224,49,43,.28)'; g.fillRect(left - 6, y - lh * .72, tw + 12, lh * .95); g.fillStyle = color; }
    if (i < center) { g.textAlign = 'center'; g.fillText(l, w / 2, y); g.textAlign = 'left'; } else g.fillText(l, left, y);
    y += lh;
  });
  if (stamp) { g.save(); g.translate(w * .64, h * .2); g.rotate(-.18); g.strokeStyle = 'rgba(190,20,25,.85)'; g.lineWidth = 8; g.font = '700 74px Oswald'; const tw = g.measureText(stamp).width; g.strokeRect(-tw / 2 - 24, -56, tw + 48, 112); g.fillStyle = 'rgba(190,20,25,.85)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(stamp, 0, 4); g.restore(); }
  return c;
}
export function paper(lines, opt = {}, size = [.216, .279]) {
  const t = tex(docCanvas(lines, opt)); const m = new THREE.MeshStandardMaterial({ map: t, roughness: .85, side: THREE.DoubleSide });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1], 8, 8), m); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; p.castShadow = true; return p;
}

// ---------- furniture ----------
export function desk({ w = 1.8, d = .9, h = .76, wood = MAT.wood } = {}) {
  const g = new THREE.Group();
  g.add(box(w, .05, d, wood, 0, h, 0));
  for (const s of [-1, 1]) { g.add(box(.45, h - .05, d - .06, wood, s * (w / 2 - .25), (h - .05) / 2, 0)); for (let k = 0; k < 3; k++) { g.add(box(.38, .18, .01, M('#6a3d20', { rough: .6 }), s * (w / 2 - .25), .15 + k * .22, d / 2 - .02)); g.add(box(.08, .015, .02, MAT.brass, s * (w / 2 - .25), .15 + k * .22, d / 2)); } }
  g.add(box(w - .9, .5, .02, wood, 0, h - .3, -d / 2 + .05));
  const blotter = box(w * .45, .006, d * .5, M('#2f4a3a', { rough: .9 }), 0, h + .028, .1); g.add(blotter);
  return sh(g);
}
export function chair({ col = '#4a2a1a', leather = true } = {}) {
  const g = new THREE.Group(); const m = M(col, { rough: leather ? .5 : .8 }); const wd = MAT.wood;
  g.add(box(.5, .08, .5, m, 0, .46, 0)); g.add(box(.5, .6, .08, m, 0, .82, -.22));
  for (const [x, z] of [[-.21, -.21], [.21, -.21], [-.21, .21], [.21, .21]]) g.add(box(.05, .44, .05, wd, x, .22, z));
  return sh(g);
}
export function bankerLamp(scene, { on = true } = {}) {
  const g = new THREE.Group(); g.add(cyl(.08, .1, .03, MAT.brass, 0, .015, 0)); g.add(cyl(.012, .012, .3, MAT.brass, 0, .17, 0));
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.06, .13, .1, 20, 1, true, 0, Math.PI), M('#1f6b3a', { rough: .25, metal: .1, side: THREE.DoubleSide }));
  shade.rotation.z = Math.PI / 2; shade.rotation.y = Math.PI / 2; shade.position.set(0, .33, 0); shade.scale.set(1, 2.4, 1); g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd28a').multiplyScalar(on ? 6 : .3) })); bulb.position.set(0, .3, 0); g.add(bulb);
  if (on) { const l = new THREE.PointLight('#ffc070', 3.2, 4, 2); l.position.set(0, .28, .05); l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.bias = -.003; g.add(l); g.userData.light = l; }
  return sh(g);
}
export function typewriter() {
  const g = new THREE.Group(); const b = M('#151515', { rough: .3, metal: .4 });
  g.add(box(.36, .1, .3, b, 0, .05, 0)); const top = box(.36, .08, .14, b, 0, .12, -.08); top.rotation.x = -.3; g.add(top);
  g.add(cyl(.03, .03, .44, M('#222', { rough: .6 }), 0, .17, -.1)); g.children[g.children.length - 1].rotation.z = Math.PI / 2;
  const r = rng(3); for (let row = 0; row < 4; row++) for (let k = 0; k < 10; k++) g.add(cyl(.011, .011, .012, M('#e8e2d0', { rough: .4 }), -.12 + k * .027 + row * .006, .11 + row * .012, .12 - row * .03, 10));
  const sheet = paper(LETTER.slice(0, 12), {}, [.2, .16]); sheet.rotation.x = -.2; sheet.position.set(0, .26, -.12); g.add(sheet);
  return sh(g);
}
export function phone() { const g = new THREE.Group(); const b = M('#121212', { rough: .25, metal: .3 }); g.add(cyl(.06, .08, .1, b, 0, .05, 0)); g.add(cyl(.02, .02, .2, b, 0, .2, 0)); const h = box(.04, .04, .22, b, 0, .3, 0); g.add(h); return sh(g); }
export function books(n = 30, { w = 1.6, h = .3, seed = 1 } = {}) {
  const g = new THREE.Group(); const r = rng(seed); const cols = ['#7a1f1f', '#1f3a5a', '#2f4a2f', '#6a5a2a', '#3a2a4a', '#8a6a3a', '#202020', '#5a2a1a'];
  let x = -w / 2; for (let i = 0; i < n && x < w / 2; i++) { const bw = .025 + r() * .04, bh = h * (.7 + r() * .3); g.add(box(bw, bh, .2, M(r.pick(cols), { rough: .7 }), x + bw / 2, bh / 2, 0)); x += bw + .002; }
  return g;
}
export function bookshelf({ w = 2, h = 2.2 } = {}) {
  const g = new THREE.Group(); const wd = M('#4a2c18', { rough: .7 }); g.add(box(w, h, .05, wd, 0, h / 2, -.15));
  for (let k = 0; k < 5; k++) { g.add(box(w, .03, .32, wd, 0, .1 + k * .45, 0)); const b = books(40, { w: w - .1, h: .32, seed: k + 1 }); b.position.set(0, .115 + k * .45, 0); g.add(b); }
  for (const s of [-1, 1]) g.add(box(.04, h, .32, wd, s * w / 2, h / 2, 0));
  return sh(g);
}
export function flag(kind = 'us', { w = 1.5, h = .95 } = {}) {
  const c = canvas(512, 324), g = c.getContext('2d');
  if (kind === 'us') { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f1ea' : '#b22234'; g.fillRect(0, i * 324 / 13, 512, 324 / 13 + 1); } g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, 205, 174); g.fillStyle = '#fff'; for (let y = 0; y < 9; y++) for (let x = 0; x < (y % 2 ? 5 : 6); x++) { g.beginPath(); g.arc(17 + x * 34 + (y % 2) * 17, 12 + y * 18.5, 4, 0, Math.PI * 2); g.fill(); } }
  if (kind === 'jp') { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 512, 324); g.fillStyle = '#c4161c'; g.beginPath(); g.arc(256, 162, 96, 0, Math.PI * 2); g.fill(); }
  if (kind === 'su') { g.fillStyle = '#c4161c'; g.fillRect(0, 0, 512, 324); g.fillStyle = '#f2c14e'; g.font = '700 60px serif'; g.fillText('☭', 30, 80); }
  const t = tex(c); const geo = new THREE.PlaneGeometry(w, h, 24, 12); const m = new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: .8 });
  const f = new THREE.Mesh(geo, m); f.castShadow = true; const base = geo.attributes.position.array.slice();
  f.userData.tick = (lt) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3] + w / 2; p.setZ(i, Math.sin(x * 3 - lt * 4) * .06 * x / w + Math.sin(base[i * 3 + 1] * 2 + lt * 2) * .02 * x / w); } p.needsUpdate = true; geo.computeVertexNormals(); };
  const pole = new THREE.Group(); pole.add(cyl(.02, .02, 2.6, MAT.brass, 0, 1.3, 0)); pole.add(sphere(.04, MAT.brass, 0, 2.62, 0)); f.position.set(w / 2 + .02, 2.6 - h / 2 - .05, 0); pole.add(f);
  return pole;
}
export function chalkboard(lines, { w = 3.2, h = 1.6 } = {}) {
  const c = canvas(1600, 800), g = c.getContext('2d'); g.fillStyle = '#1f3329'; g.fillRect(0, 0, 1600, 800);
  const r = rng(5); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(255,255,255,${r() * .06})`; g.lineWidth = 20 + r() * 40; g.beginPath(); const x = r() * 1600, y = r() * 800; g.moveTo(x, y); g.lineTo(x + r() * 200 - 100, y + r() * 60 - 30); g.stroke(); }
  g.fillStyle = 'rgba(240,240,230,.92)'; g.textBaseline = 'middle';
  lines.forEach(([s, x, y, size = 64, col]) => { g.fillStyle = col || 'rgba(240,240,230,.92)'; g.font = `italic 400 ${size}px "Playfair Display"`; g.fillText(s, x, y); });
  const gr = new THREE.Group(); gr.add(box(w + .12, h + .12, .05, M('#5a3a20', { rough: .6 }), 0, 0, -.03));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .95 })); p.receiveShadow = true; gr.add(p);
  gr.add(box(w, .04, .08, M('#5a3a20'), 0, -h / 2 - .04, .04));
  return gr;
}
export function wallClock({ h = 8, m = 14, r = .25 } = {}) {
  const c = canvas(512, 512), g = c.getContext('2d'); g.fillStyle = '#f2ecdc'; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#111'; g.font = '700 54px "Playfair Display"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; g.fillText(String(i), 256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; g.fillRect(256 + Math.cos(a) * 232 - 2, 256 + Math.sin(a) * 232 - 2, 4, 4); }
  const grp = new THREE.Group(); const face = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .4 })); grp.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, r * .08, 10, 48), MAT.brass); grp.add(rim);
  const hand = (len, wdt, z) => { const p = new THREE.Group(); const hm = box(wdt, len, .006, M('#111', { rough: .3 }), 0, len / 2 - len * .12, z); p.add(hm); p.position.z = .01; grp.add(p); return p; };
  const hh = hand(r * .55, r * .07, .01), mh = hand(r * .8, r * .045, .02), sh2 = hand(r * .85, r * .015, .03); sh2.children[0].material = M('#b3202a');
  grp.userData.set = (H, Mi, S = 0) => { hh.rotation.z = -((H % 12) + Mi / 60) / 12 * Math.PI * 2; mh.rotation.z = -(Mi + S / 60) / 60 * Math.PI * 2; sh2.rotation.z = -S / 60 * Math.PI * 2; };
  grp.userData.set(h, m); return grp;
}
export function radio() {
  const g = new THREE.Group(); const wd = M('#6b3a1e', { rough: .35 });
  const body = box(.5, .4, .28, wd, 0, .2, 0); g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .28, 24, 1, false, 0, Math.PI), wd); top.rotation.z = Math.PI / 2; top.rotation.y = Math.PI / 2; top.position.y = .4; top.castShadow = true; g.add(top);
  const grille = new THREE.Mesh(new THREE.CircleGeometry(.13, 32), M('#c9b38a', { rough: .9 })); grille.position.set(0, .38, .142); g.add(grille);
  for (let i = -3; i <= 3; i++) g.add(box(.012, .22, .01, wd, i * .035, .38, .146));
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(.22, .05), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb84a').multiplyScalar(2) })); dial.position.set(0, .14, .142); g.add(dial);
  for (const s of [-1, 1]) g.add(cyl(.025, .025, .03, M('#2a1a10'), s * .17, .1, .15)); g.children.slice(-2).forEach((k) => (k.rotation.x = Math.PI / 2));
  return sh(g);
}
export function microphone() {
  const g = new THREE.Group(); const ch = M('#c8ccd0', { rough: .15, metal: 1 });
  g.add(cyl(.12, .14, .03, M('#1a1a1a', { rough: .3 }), 0, .015, 0)); g.add(cyl(.012, .012, .5, ch, 0, .26, 0));
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .08, 6, 16), ch); head.position.y = .58; g.add(head);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.085, .01, 6, 24), ch); ring.position.y = .58; ring.rotation.y = Math.PI / 2; g.add(ring);
  return sh(g);
}
export function crate(w = .8, h = .6, d = .6, label = null) {
  const g = new THREE.Group(); g.add(box(w, h, d, M('#8a6a3e', { rough: .85 }), 0, h / 2, 0));
  for (const y of [.05, h - .05]) g.add(box(w + .02, .06, d + .02, M('#6a4e2a'), 0, y, 0));
  if (label) { const c = canvas(256, 128), x = c.getContext('2d'); x.fillStyle = '#1a1a1a'; x.font = '700 48px "JetBrains Mono"'; x.textAlign = 'center'; x.fillText(label, 128, 80); const p = new THREE.Mesh(new THREE.PlaneGeometry(w * .7, h * .4), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true })); p.position.set(0, h / 2, d / 2 + .012); g.add(p); }
  return sh(g);
}
export function drum(col = '#3f5a3a') { const g = new THREE.Group(); g.add(cyl(.29, .29, .88, M(col, { rough: .5, metal: .4 }), 0, .44, 0)); for (const y of [.25, .62]) g.add(cyl(.3, .3, .03, M(col, { rough: .5, metal: .4 }), 0, y, 0)); return sh(g); }
export function sandbags(n = 8, seed = 2) { const g = new THREE.Group(); const r = rng(seed); for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(.14, .3, 4, 8), M('#a08a62', { rough: 1 })); b.rotation.z = Math.PI / 2; b.scale.y = .7; b.position.set((i % 4) * .48 - .7 + (Math.floor(i / 4) % 2) * .24, .12 + Math.floor(i / 4) * .2, r() * .05); b.castShadow = true; g.add(b); } return g; }
export function pole(h = 7) { const g = new THREE.Group(); g.add(cyl(.09, .12, h, M('#4a3a2a', { rough: .9 }), 0, h / 2, 0, 8)); g.add(box(1.4, .08, .08, M('#4a3a2a'), 0, h - .4, 0)); for (const x of [-.6, -.2, .2, .6]) g.add(cyl(.03, .03, .08, M('#ddd', { rough: .2 }), x, h - .32, 0, 6)); return sh(g); }
export function lampPost(scene, color = '#ffb36a') { const g = new THREE.Group(); g.add(cyl(.06, .08, 4, M('#222'), 0, 2, 0)); g.add(box(.25, .3, .25, M('#ffe0a0', { emissive: color, ei: 3 }), 0, 4.05, 0)); return g; }

// ---------- room shell ----------
export function room({ w = 8, d = 7, h = 3.4, wall = '#7a6a55', floor = MAT.planks, wainscot = '#4a2e1c', ceiling = true, windowSide = null, windowCol = '#ffe2b0' } = {}) {
  const g = new THREE.Group(); const wm = M(wall, { rough: .92 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floor); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  if (floor.map) { floor.map.repeat.set(w / 2, d / 2); }
  const back = box(w, h, .1, wm, 0, h / 2, -d / 2); g.add(back);
  for (const s of [-1, 1]) g.add(box(.1, h, d, wm, s * w / 2, h / 2, 0));
  if (wainscot) { g.add(box(w, .9, .04, M(wainscot, { rough: .5 }), 0, .45, -d / 2 + .07)); for (const s of [-1, 1]) g.add(box(.04, .9, d, M(wainscot, { rough: .5 }), s * (w / 2 - .07), .45, 0)); g.add(box(w, .05, .06, M('#2e1c10'), 0, .92, -d / 2 + .08)); }
  if (ceiling) { const c = box(w, .1, d, M('#d8d0c0', { rough: 1 }), 0, h, 0); c.castShadow = false; g.add(c); }
  if (windowSide) { // glowing window on the left wall
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.8), new THREE.MeshBasicMaterial({ color: new THREE.Color(windowCol).multiplyScalar(2.2) }));
    win.position.set(windowSide * (w / 2 - .06), 1.8, -d * .15); win.rotation.y = -windowSide * Math.PI / 2; g.add(win);
    for (const o of [-.4, .4]) { const mull = box(.06, 1.8, .06, M('#3a2a1a'), windowSide * (w / 2 - .08), 1.8, -d * .15 + o); g.add(mull); }
    g.add(box(.06, .06, 1.6, M('#3a2a1a'), windowSide * (w / 2 - .08), 1.8, -d * .15));
  }
  return g;
}
