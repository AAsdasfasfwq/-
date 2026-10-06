// B-29 Superfortress (polished aluminium), Japanese fighter, small recon plane. Units: metres, nose = +Z.
import * as THREE from 'three';
import { M, MAT, U } from './materials.js';
import { canvas, tex } from '../core/textures.js';

const sh = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

function insigniaTex() {
  const c = canvas(512, 256), g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(40, 96, 432, 64); g.fillStyle = '#1d2e5c'; g.fillRect(48, 104, 416, 48);
  g.fillStyle = '#ffffff'; g.fillRect(60, 110, 392, 36);
  g.fillStyle = '#b8202a'; g.fillRect(60, 122, 392, 12);
  g.beginPath(); g.arc(256, 128, 100, 0, Math.PI * 2); g.fillStyle = '#1d2e5c'; g.fill();
  g.fillStyle = '#ffffff'; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 36 : 92; g.lineTo(256 + Math.cos(a) * r, 128 + Math.sin(a) * r); }
  g.fill(); return tex(c);
}
function noseTex(name) {
  const c = canvas(1024, 256), g = c.getContext('2d');
  g.font = 'italic 700 120px "Playfair Display"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#111'; g.fillText(name, 512, 128); return tex(c);
}
function tailTex(letter, shape = 'circle') {
  const c = canvas(512, 512), g = c.getContext('2d'); g.strokeStyle = '#111'; g.lineWidth = 36; g.fillStyle = '#111';
  if (shape === 'circle') { g.beginPath(); g.arc(256, 256, 200, 0, Math.PI * 2); g.stroke(); }
  else { g.beginPath(); g.moveTo(256, 50); g.lineTo(470, 440); g.lineTo(42, 440); g.closePath(); g.stroke(); }
  g.font = '700 300px Oswald'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 256, shape === 'circle' ? 270 : 320); return tex(c);
}
function decal(texture, w, h) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: .5, metalness: .2, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); }

function wing(span, rootC, tipC, sweep, thick, mat) {
  const s = new THREE.Shape(); s.moveTo(0, rootC * .55); s.lineTo(span, tipC * .55 - sweep); s.lineTo(span, -tipC * .45 - sweep); s.lineTo(0, -rootC * .45); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * .4, bevelSize: thick * .5, bevelSegments: 3 });
  g.rotateX(Math.PI / 2); g.translate(0, thick / 2, 0);
  return new THREE.Mesh(g, mat);
}

export function b29({ name = 'ENOLA GAY', tail = 'R', tailShape = 'circle', tailNum = '82', bare = false } = {}) {
  const root = new THREE.Group(); const alu = MAT.alu, dark = M('#2a2e33', { rough: .5, metal: .6 });
  // fuselage via lathe (profile along +Y then rotated so +Y -> +Z)
  const prof = [];
  for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; prof.push(new THREE.Vector2(Math.sin(a) * 1.45, 12.6 + Math.cos(a) * 2.4)); }
  prof.reverse();
  const body = [[1.45, 12.6], [1.45, -4], [1.38, -7], [1.15, -10], [.8, -12.6], [.45, -14.2], [.25, -14.9]];
  const lp = [new THREE.Vector2(0, 15), ...prof.map((v) => v), ...body.map(([r, y]) => new THREE.Vector2(r, y))];
  // glazed nose is a separate mesh; aluminium starts at y=12.6
  const fusG = new THREE.LatheGeometry(body.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 32); fusG.rotateX(Math.PI / 2);
  const fus = new THREE.Mesh(fusG, alu); root.add(fus);
  const noseG = new THREE.LatheGeometry([new THREE.Vector2(0.001, 15), ...prof], 32); noseG.rotateX(Math.PI / 2);
  const nose = new THREE.Mesh(noseG, M('#1a2a38', { rough: .05, metal: .9, key: 'noseglass' })); root.add(nose);
  // nose frames
  const fm = M('#c3c9cf', { rough: .3, metal: .9 });
  for (const yy of [13.4, 14.2]) { const a = Math.acos((yy - 12.6) / 2.4); const r = Math.sin(a) * 1.45; const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .035, 6, 32), fm); ring.position.z = yy; root.add(ring); }
  for (let k = 0; k < 8; k++) {
    const pts = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector3(Math.cos(k / 8 * Math.PI * 2) * Math.sin(a) * 1.46, Math.sin(k / 8 * Math.PI * 2) * Math.sin(a) * 1.46, 12.6 + Math.cos(a) * 2.41)); }
    root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, .03, 4), fm));
  }
  // wings
  const wl = wing(21.3, 5.6, 2.1, 1.2, .38, alu); wl.position.set(.9, -.35, 1.2); root.add(wl);
  const wr = wing(21.3, 5.6, 2.1, 1.2, .38, alu); wr.scale.x = -1; wr.position.set(-.9, -.35, 1.2); root.add(wr);
  // horizontal stabilisers + fin
  for (const s of [1, -1]) { const st = wing(7, 3.4, 1.6, .9, .2, alu); st.scale.x = s; st.position.set(s * .5, .2, -12.5); root.add(st); }
  const finS = new THREE.Shape(); finS.moveTo(0, 0); finS.lineTo(6.5, -.5); finS.lineTo(7.4, -3.5); finS.lineTo(5.2, -3.9); finS.lineTo(0, -5.8); finS.closePath();
  const finG = new THREE.ExtrudeGeometry(finS, { depth: .25, bevelEnabled: true, bevelThickness: .08, bevelSize: .1, bevelSegments: 2 });
  finG.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1)); // shape x->Y, y->Z, depth->X
  const finMesh = new THREE.Mesh(finG, alu); finMesh.position.set(-.125, .6, -8.6); root.add(finMesh);
  // engines
  const props = [];
  for (const x of [-11.6, -6.2, 6.2, 11.6]) {
    const zLE = 1.2 + 5.6 * .55 - (Math.abs(x) - .9) / 21.3 * 1.2 - .2;
    const nac = new THREE.Mesh(new THREE.CylinderGeometry(.82, .7, 6.2, 20), alu); nac.rotation.x = Math.PI / 2; nac.position.set(x, -.25, zLE - 1.3); root.add(nac);
    const cowl = new THREE.Mesh(new THREE.CylinderGeometry(.86, .86, .9, 20, 1, true), M('#30343a', { rough: .4, metal: .7 })); cowl.rotation.x = Math.PI / 2; cowl.position.set(x, -.25, zLE + 1.9); root.add(cowl);
    const face = new THREE.Mesh(new THREE.CircleGeometry(.84, 20), M('#141618', { rough: .6 })); face.position.set(x, -.25, zLE + 2.3); root.add(face);
    const prop = new THREE.Group(); prop.position.set(x, -.25, zLE + 2.55); root.add(prop);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(.32, 12, 8), alu); hub.scale.z = 1.5; prop.add(hub);
    const blades = new THREE.Group(); prop.add(blades);
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.3, 2.5, .06), M('#141414', { rough: .4, metal: .3 })); b.position.y = 1.35; b.rotation.y = .35; const piv = new THREE.Group(); piv.rotation.z = k * Math.PI / 2; piv.add(b); blades.add(piv);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(.31, .25, .07), M('#e8c020', { rough: .5 })); tip.position.y = 2.5; piv.add(tip); }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshBasicMaterial({ color: '#222', transparent: true, opacity: .18, depthWrite: false, side: THREE.DoubleSide })); prop.add(disc);
    props.push({ prop, blades, disc });
    // exhaust glow (visible at night)
    const ex = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff7a2a').multiplyScalar(3) })); ex.position.set(x + .5, -.7, zLE - 1); root.add(ex); ex.name = 'exhaust';
  }
  // turrets, antennas, gear doors
  for (const [z, y] of [[8, 1.45], [-2, 1.45], [7, -1.45], [-5, -1.4]]) { const t = new THREE.Mesh(new THREE.SphereGeometry(.45, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), dark); t.position.set(0, y, z); if (y < 0) t.rotation.x = Math.PI; root.add(t); }
  const blister = new THREE.Mesh(new THREE.SphereGeometry(.35, 12, 8), M('#1a2a38', { rough: .05, metal: .9, key: 'noseglass' })); blister.position.set(0, .45, -14.6); root.add(blister);
  // bomb bay doors (front bay)
  const doors = [];
  for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * .95, -1.12, 3.2); const d = new THREE.Mesh(new THREE.BoxGeometry(.95, .05, 4.6), alu); d.position.x = -s * .47; piv.add(d); root.add(piv); doors.push({ piv, s }); }
  const bay = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.3, 4.5), M('#1c1f22', { rough: .8 })); bay.position.set(0, -.6, 3.2); root.add(bay);
  const bombMount = new THREE.Group(); bombMount.position.set(0, -.65, 3.2); root.add(bombMount);
  // markings
  if (!bare) {
    const ins = insigniaTex();
    for (const s of [1, -1]) { const d = decal(ins, 2.8, 1.4); d.position.set(s * 1.4, .1, -6.5); d.rotation.y = s * Math.PI / 2; root.add(d); }
    const dw = decal(ins, 3.2, 1.6); dw.rotation.x = -Math.PI / 2; dw.position.set(15, .05, 1.2); root.add(dw);
    if (name) { const nt = noseTex(name); const d = decal(nt, 3.6, .9); d.position.set(-1.47, .35, 10.2); d.rotation.y = -Math.PI / 2; root.add(d); const d2 = decal(nt, 3.6, .9); d2.position.set(1.47, .35, 10.2); d2.rotation.y = Math.PI / 2; d2.visible = false; root.add(d2); root.userData.noseDecal = d; }
    if (tail) { const tt = tailTex(tail, tailShape); for (const s of [1, -1]) { const d = decal(tt, 2.6, 2.6); d.position.set(s * .27, 4.8, -11.6); d.rotation.y = s * Math.PI / 2; root.add(d); } }
    if (tailNum) { const c = canvas(256, 128), g = c.getContext('2d'); g.font = '700 100px Oswald'; g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tailNum, 128, 64); const t = tex(c); for (const s of [1, -1]) { const d = decal(t, 1.6, .8); d.position.set(s * 1.36, .45, 4.8); d.rotation.y = s * Math.PI / 2; root.add(d); } }
  }
  sh(root);
  root.userData.props = props; root.userData.doors = doors; root.userData.bombMount = bombMount;
  root.userData.spin = (t, mode = 'fly') => {
    for (const p of props) {
      if (mode === 'fly') { p.blades.rotation.z = t * 2.3; p.disc.visible = true; p.disc.material.opacity = .22; }
      else if (mode === 'off') { p.blades.rotation.z = 0; p.disc.visible = false; }
      else { p.blades.rotation.z = t * (mode === 'start' ? Math.min(t, 6) * 2 : 4); p.disc.visible = false; }
    }
  };
  root.userData.openDoors = (p) => { for (const d of doors) d.piv.rotation.z = d.s * p * 1.45; };
  root.userData.exhaust = (on) => root.traverse((o) => { if (o.name === 'exhaust') o.visible = on; });
  root.userData.exhaust(false);
  return root;
}

export function fighter({ color = '#5a6b3a', belly = '#a8a89a' } = {}) {
  const r = new THREE.Group(); const m = M(color, { rough: .5, metal: .3 }); const b = M(belly, { rough: .5 });
  const f = new THREE.Mesh(new THREE.CapsuleGeometry(.6, 6, 4, 12), m); f.rotation.x = Math.PI / 2; r.add(f);
  const cow = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, 1, 14), M('#151515')); cow.rotation.x = Math.PI / 2; cow.position.z = 3.2; r.add(cow);
  const can = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 8), MAT.glass); can.scale.set(.8, .8, 2); can.position.set(0, .55, .6); r.add(can);
  for (const s of [1, -1]) { const w = wing(5.5, 2.4, 1, .4, .15, m); w.scale.x = s; w.position.set(s * .4, -.3, .6); r.add(w);
    const st = wing(2, 1.2, .6, .2, .08, m); st.scale.x = s; st.position.set(s * .2, .1, -3.2); r.add(st);
    const c = canvas(128, 128), g = c.getContext('2d'); g.fillStyle = '#c4161c'; g.beginPath(); g.arc(64, 64, 56, 0, Math.PI * 2); g.fill(); const d = decal(tex(c), 1.3, 1.3); d.rotation.x = -Math.PI / 2; d.position.set(s * 4, -.05, .5); r.add(d); }
  const fin = new THREE.Mesh(new THREE.BoxGeometry(.1, 1.3, 1.2), m); fin.position.set(0, .7, -3.3); r.add(fin);
  const prop = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshBasicMaterial({ color: '#111', transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false })); prop.position.z = 3.75; r.add(prop);
  return sh(r);
}
