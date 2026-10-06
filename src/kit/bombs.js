// Little Boy, Fat Man, pumpkin practice bomb. Axis: nose = +Z, centred on origin.
import * as THREE from 'three';
import { M } from './materials.js';
import { canvas, tex } from '../core/textures.js';

const sh = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

function stencil(lines, col = '#e9e2c8', bg = null, w = 512, h = 256) {
  const c = canvas(w, h), g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = col; g.font = '700 46px "JetBrains Mono"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * 56)); return tex(c);
}

export function littleBoy({ color = '#4d5538' } = {}) {
  const r = new THREE.Group(); const body = M(color, { rough: .45, metal: .45 }); const dark = M('#2b2f25', { rough: .5, metal: .5 });
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, 2.05, 32), body); cyl.rotation.x = Math.PI / 2; cyl.position.z = .05; r.add(cyl);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.36, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), body); nose.rotation.x = Math.PI / 2; nose.scale.y = .55; nose.position.z = 1.07; r.add(nose);
  for (const z of [-.6, .3, .95]) { const band = new THREE.Mesh(new THREE.TorusGeometry(.362, .012, 6, 32), dark); band.position.z = z; r.add(band); }
  const taper = new THREE.Mesh(new THREE.CylinderGeometry(.36, .22, .45, 32), body); taper.rotation.x = Math.PI / 2; taper.position.z = -1.2; r.add(taper);
  const tail = new THREE.Group(); tail.position.z = -1.75; r.add(tail);
  const sw = .74, sl = .75; for (const [x, y, rx, ry] of [[0, sw / 2, sw, .03], [0, -sw / 2, sw, .03], [sw / 2, 0, .03, sw], [-sw / 2, 0, .03, sw]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(rx, ry, sl), body); p.position.set(x, y, 0); tail.add(p); }
  for (const a of [Math.PI / 4, -Math.PI / 4]) { const f = new THREE.Mesh(new THREE.BoxGeometry(1.0, .02, sl * .9), dark); f.rotation.z = a; tail.add(f); }
  const lug = new THREE.Mesh(new THREE.TorusGeometry(.07, .02, 6, 12), dark); lug.position.set(0, .38, .1); lug.rotation.y = Math.PI / 2; r.add(lug);
  for (const s of [1, -1]) { const ant = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .5, 4), dark); ant.position.set(s * .2, .25, -1.2); ant.rotation.x = -.6; r.add(ant); }
  const st = new THREE.Mesh(new THREE.PlaneGeometry(.9, .45), new THREE.MeshStandardMaterial({ map: stencil(['L-11', 'MK-I']), transparent: true, roughness: .6 }));
  st.position.set(.365, 0, -.2); st.rotation.y = Math.PI / 2; r.add(st);
  return sh(r);
}

export function fatMan({ color = '#c9a227', tar = true } = {}) {
  const r = new THREE.Group(); const body = M(color, { rough: .55, metal: .25 }); const dark = M('#1a1a17', { rough: .7 });
  const e = new THREE.Mesh(new THREE.SphereGeometry(.76, 40, 24), body); e.scale.z = 1.28; r.add(e);
  if (tar) { for (const a of [0, Math.PI / 2]) { const seam = new THREE.Mesh(new THREE.TorusGeometry(.765, .03, 6, 40), dark); seam.scale.set(1, 1.28, 1); seam.rotation.set(0, Math.PI / 2, a); r.add(seam); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.765, .035, 6, 40), dark); r.add(ring); }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.5, .3, .5, 24), body); neck.rotation.x = Math.PI / 2; neck.position.z = -.95; r.add(neck);
  const tail = new THREE.Group(); tail.position.z = -1.55; r.add(tail);
  const s = 1.5, L = .85;
  for (const [x, y, w, h] of [[0, s / 2, s, .04], [0, -s / 2, s, .04], [s / 2, 0, .04, s], [-s / 2, 0, .04, s]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, L), body); p.position.set(x, y, 0); tail.add(p); }
  for (const a of [Math.PI / 4, -Math.PI / 4]) { const f = new THREE.Mesh(new THREE.BoxGeometry(2.05, .03, L * .95), body); f.rotation.z = a; tail.add(f); }
  for (const [x, y] of [[.25, .62], [-.25, .62], [.62, .25], [.62, -.25]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .1, 8), dark); b.position.set(x * .7, y * .7, .55); b.rotation.x = Math.PI / 2; r.add(b); }
  return sh(r);
}
export const pumpkin = () => fatMan({ color: '#e0751c', tar: false });
