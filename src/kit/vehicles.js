// Ships, tanks, trains, trams, trucks, missiles.
import * as THREE from 'three';
import { M, MAT } from './materials.js';
import { box, cyl, sphere, sh } from './props.js';
import { canvas, tex } from '../core/textures.js';

// heavy cruiser (USS Indianapolis-like), length ~ 180 m, bow = +Z
export function cruiser({ col = '#7d868e', deck = '#5a5a52' } = {}) {
  const g = new THREE.Group(); const hullM = M(col, { rough: .55, metal: .3 }); const dk = M(deck, { rough: .8 });
  const s = new THREE.Shape(); const L = 90, B = 10;
  s.moveTo(0, L); s.bezierCurveTo(B * .6, L * .7, B, L * .3, B, 0); s.lineTo(B, -L * .75); s.bezierCurveTo(B, -L * .95, B * .5, -L, 0, -L); s.bezierCurveTo(-B * .5, -L, -B, -L * .95, -B, -L * .75); s.lineTo(-B, 0); s.bezierCurveTo(-B, L * .3, -B * .6, L * .7, 0, L);
  const hg = new THREE.ExtrudeGeometry(s, { depth: 11, bevelEnabled: false, curveSegments: 24 }); hg.rotateX(Math.PI / 2); hg.translate(0, 8, 0);
  const hull = new THREE.Mesh(hg, hullM); g.add(hull);
  const deckS = new THREE.Mesh(new THREE.ShapeGeometry(s, 24), dk); deckS.rotation.x = -Math.PI / 2; deckS.position.y = 8.02; g.add(deckS);
  const boot = new THREE.Mesh(hg.clone(), M('#5a2420', { rough: .7 })); boot.scale.set(1.002, .25, 1.002); boot.position.y = -2.2; g.add(boot);
  g.add(box(14, 6, 26, hullM, 0, 11, 18)); g.add(box(9, 6, 10, hullM, 0, 17, 22)); g.add(box(6, 4, 6, hullM, 0, 22, 23));
  g.add(box(12, 5, 14, hullM, 0, 10.5, -20));
  for (const z of [6, -6]) { const f = cyl(2.2, 2.6, 12, hullM, 0, 18, z, 16); f.rotation.x = .12; g.add(f); g.add(cyl(2.3, 2.3, 1, M('#222'), 0, 24, z - .8, 16)); }
  const mast = cyl(.4, .5, 26, hullM, 0, 31, 18, 8); g.add(mast); g.add(box(8, .4, .4, hullM, 0, 38, 18));
  const turret = (z, flip) => { const t = new THREE.Group(); t.position.set(0, 8, z); t.rotation.y = flip ? Math.PI : 0; t.add(box(8, 3.2, 9, hullM, 0, 1.6, 0)); for (const x of [-2, 0, 2]) { const b = cyl(.35, .35, 14, M('#5e666e', { metal: .5, rough: .4 }), x, 2, 9.5, 10); b.rotation.x = Math.PI / 2 - .05; t.add(b); } return t; };
  g.add(turret(45, false)); g.add(turret(33, false)); g.add(turret(-40, true));
  for (const z of [-8, 0, 10]) for (const s2 of [-1, 1]) g.add(box(2.4, 2, 2.4, hullM, s2 * 8, 9, z));
  return sh(g);
}
export function landingShip(col = '#6f7a70') { const g = new THREE.Group(); const m = M(col, { rough: .6, metal: .3 }); g.add(box(14, 7, 80, m, 0, 3.5, 0)); g.add(box(10, 8, 14, m, 0, 11, -30)); g.add(cyl(1.2, 1.2, 6, m, 0, 17, -30)); return sh(g); }
export function tank({ col = '#4a5a35', star = true } = {}) {
  const g = new THREE.Group(); const m = M(col, { rough: .7, metal: .2 }); const tr = M('#1e1e1c', { rough: .9 });
  for (const s of [-1, 1]) { g.add(box(.7, 1, 6.5, tr, s * 1.45, .5, 0)); for (let i = 0; i < 5; i++) { const w = cyl(.42, .42, .3, M('#2c2c28'), s * 1.75, .5, -2.4 + i * 1.2, 12); w.rotation.z = Math.PI / 2; g.add(w); } }
  const hull = box(3, 1, 6, m, 0, 1.3, 0); g.add(hull); const glacis = box(3, .8, 1.6, m, 0, 1.2, 3.3); glacis.rotation.x = -.6; g.add(glacis);
  const tur = new THREE.Group(); tur.position.set(0, 2.1, -.3); g.add(tur);
  const tt = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, .9, 8), m); tt.castShadow = true; tur.add(tt); const gun = cyl(.1, .12, 4.5, M('#3a4528', { rough: .6 }), 0, .1, 2.6, 10); gun.rotation.x = Math.PI / 2; tur.add(gun);
  if (star) { const c = canvas(128, 128), x = c.getContext('2d'); x.fillStyle = '#c4161c'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 22 : 56; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.fill(); for (const s2 of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true })); d.position.set(s2 * 1.25, 0, 0); d.rotation.y = s2 * Math.PI / 2; tur.add(d); } }
  g.userData.turret = tur; return sh(g);
}
export function shinkansen(cars = 4) {
  const g = new THREE.Group(); const white = M('#f2f3f5', { rough: .25, metal: .3 }); const blue = M('#1f4fa8', { rough: .3 }); const win = M('#0f1820', { rough: .1, metal: .7, emissive: '#ffd9a0', ei: .6 });
  for (let i = 0; i < cars; i++) { const c = new THREE.Group(); c.position.z = -i * 26; g.add(c); c.add(box(3.4, 3.4, 25, white, 0, 2.2, 0)); c.add(box(3.42, .35, 25, blue, 0, 1.3, 0)); c.add(box(3.45, .6, 22, win, 0, 2.8, 0));
    if (i === 0) { const nose = new THREE.Mesh(new THREE.SphereGeometry(1.7, 24, 16), white); nose.scale.set(1, 1, 5.5); nose.position.set(0, 2.2, 12.5); nose.castShadow = true; c.add(nose); const st = new THREE.Mesh(new THREE.SphereGeometry(1.72, 24, 12, 0, Math.PI * 2, Math.PI * .62, Math.PI * .1), blue); st.scale.set(1, 1, 5.5); st.position.set(0, 2.2, 12.5); c.add(st); const lamp = new THREE.Mesh(new THREE.SphereGeometry(.25, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(5) })); lamp.position.set(.9, 1.7, 18); c.add(lamp); } }
  return sh(g);
}
export function tram({ col = '#4a6a3a' } = {}) {
  const g = new THREE.Group(); const m = M(col, { rough: .6 }); const cream = M('#e8dcc0', { rough: .7 });
  g.add(box(2.4, 1.2, 12, m, 0, 1.1, 0)); g.add(box(2.4, 1.2, 12, cream, 0, 2.3, 0)); g.add(box(2.5, .25, 12.2, m, 0, 3, 0));
  for (let i = -5; i <= 5; i++) for (const s of [-1, 1]) g.add(box(.05, .8, .8, M('#1a2228', { rough: .2, metal: .5 }), s * 1.21, 2.3, i * 1.05));
  const pole = cyl(.03, .03, 3, M('#222'), 0, 4.4, -2); pole.rotation.x = .5; g.add(pole);
  return sh(g);
}
export function truck(col = '#4f5a3a') { const g = new THREE.Group(); const m = M(col, { rough: .7 }); g.add(box(2.2, 1, 6, m, 0, 1.2, 0)); g.add(box(2.2, 1.5, 2, m, 0, 2.2, 2)); g.add(box(2.3, 1.4, 3.6, M('#5a6040', { rough: .9 }), 0, 2.4, -1)); for (const [x, z] of [[-1, 2], [1, 2], [-1, -1.8], [1, -1.8]]) { const w = cyl(.45, .45, .3, M('#151515'), x, .45, z, 12); w.rotation.z = Math.PI / 2; g.add(w); } return sh(g); }
export function jeep() { const g = new THREE.Group(); const m = M('#4f5a3a', { rough: .7 }); g.add(box(1.6, .7, 3.3, m, 0, .8, 0)); g.add(box(1.5, .5, .1, M('#1a2228', { metal: .5 }), 0, 1.4, .6)); for (const [x, z] of [[-.75, 1.1], [.75, 1.1], [-.75, -1.1], [.75, -1.1]]) { const w = cyl(.36, .36, .25, M('#151515'), x, .36, z, 12); w.rotation.z = Math.PI / 2; g.add(w); } const c = canvas(128, 128), x = c.getContext('2d'); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 20 : 50; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.fill(); const d = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true })); d.rotation.x = -Math.PI / 2; d.position.set(0, 1.16, -.5); g.add(d); return sh(g); }
export function icbm({ col = '#e9ebee', band = '#1a1a1a' } = {}) {
  const g = new THREE.Group(); const m = M(col, { rough: .35, metal: .2 }); const b = M(band, { rough: .4 });
  g.add(cyl(1, 1, 16, m, 0, 8, 0, 24)); g.add(cyl(1.01, 1.01, 1, b, 0, 6, 0, 24)); g.add(cyl(1.01, 1.01, .5, b, 0, 12, 0, 24));
  const n = new THREE.Mesh(new THREE.ConeGeometry(1, 4, 24), m); n.position.y = 18; g.add(n);
  for (let i = 0; i < 4; i++) { const f = box(.08, 2, 1.2, b, 0, 1, 0); const p = new THREE.Group(); p.rotation.y = i * Math.PI / 2; f.position.x = 1.3; p.add(f); g.add(p); }
  return sh(g);
}
export function warhead() { const g = new THREE.Group(); const m = M('#2c3036', { rough: .3, metal: .7 }); const n = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.8, 24), m); n.position.y = .9; g.add(n); g.add(cyl(.5, .5, .3, M('#5a6068', { metal: .8, rough: .3 }), 0, 0, 0, 24)); return sh(g); }
