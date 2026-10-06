// Stylised low-poly characters with a simple rig (Zack-D-style miniature humans).
import * as THREE from 'three';
import { M } from './materials.js';
import { clamp } from '../core/math.js';

const geo = {};
function G(key, make) { if (!geo[key]) { geo[key] = make(); geo[key].userData.keep = true; } return geo[key]; }
const cap = (r, l) => G('cap' + r + l, () => new THREE.CapsuleGeometry(r, l, 4, 10));
const sph = (r, w = 16, h = 12) => G('sph' + r + w, () => new THREE.SphereGeometry(r, w, h));
const box = (x, y, z) => G(`box${x},${y},${z}`, () => new THREE.BoxGeometry(x, y, z));
const cyl = (a, b, h, s = 12) => G(`cyl${a},${b},${h},${s}`, () => new THREE.CylinderGeometry(a, b, h, s));

const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };

export const SKIN = { light: '#e8b996', mid: '#d29a72', tan: '#c08560', pale: '#efc9aa' };

/**
 * opts: skin, shirt, pants, jacket(null=no jacket), shoes, hair, hairColor, hat, hatColor, tie, glasses, mustache, beard, female, build(1), height(1)
 */
export function person(o = {}) {
  const op = { skin: SKIN.light, shirt: '#e9e4d8', pants: '#3a3d45', jacket: null, shoes: '#1d1712', hair: 'short', hairColor: '#2a1d14', hat: null, hatColor: '#3b3f46', tie: null, glasses: false, mustache: false, female: false, build: 1, height: 1, skirt: null, ...o };
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const sk = M(op.skin, { rough: .65 }); const top = M(op.jacket || op.shirt, { rough: .8 }); const pm = M(op.pants, { rough: .85 });
  const sh = M(op.shoes, { rough: .5 }); const hm = M(op.hairColor, { rough: .9 }); const dark = M('#121212', { rough: .4 });
  const b = op.build;
  body.scale.setScalar(op.height);
  // hips
  const hips = new THREE.Group(); hips.position.y = .95; body.add(hips);
  const pel = mesh(cyl(.165 * b, .15 * b, .2, 12), pm, 0, -.01, 0); pel.scale.z = .7; hips.add(pel);
  // spine / torso
  const spine = new THREE.Group(); spine.position.y = .06; hips.add(spine);
  const torso = mesh(cyl(.215 * b, .16 * b, .5, 14), top, 0, .3, 0); torso.scale.z = .64; spine.add(torso);
  const chest = mesh(sph(.2, 14, 10), top, 0, .48, 0); chest.scale.set(1.12 * b, .42, .64); spine.add(chest);
  if (op.jacket) { // shirt collar + tie visible in a V
    const v = mesh(box(.1, .2, .02), M(op.shirt), 0, .45, .13); v.rotation.x = -.15; spine.add(v);
    if (op.tie) { const t = mesh(box(.045, .26, .02), M(op.tie), 0, .38, .145); t.rotation.x = -.12; spine.add(t); }
    const lap1 = mesh(box(.06, .22, .02), top, -.07, .43, .135); lap1.rotation.z = -.35; spine.add(lap1);
    const lap2 = mesh(box(.06, .22, .02), top, .07, .43, .135); lap2.rotation.z = .35; spine.add(lap2);
  } else if (op.tie) { const t = mesh(box(.045, .26, .02), M(op.tie), 0, .38, .125); spine.add(t); }
  if (op.female && op.skirt) { const s = mesh(cyl(.2, .3, .42, 14), M(op.skirt, { rough: .85 }), 0, -.2, 0); hips.add(s); }
  if (op.belt) spine.add(mesh(box(.37 * b, .05, .24), M(op.belt), 0, .02, 0));
  // neck + head
  const neck = new THREE.Group(); neck.position.y = .58; spine.add(neck);
  neck.add(mesh(cyl(.055, .06, .1), sk, 0, .03, 0));
  const head = new THREE.Group(); head.position.y = .19; head.scale.setScalar(1.25); neck.add(head);
  const skull = mesh(sph(.115, 20, 16), sk); skull.scale.set(.92, 1.08, 1); head.add(skull);
  // face
  for (const s of [-1, 1]) {
    head.add(mesh(sph(.016, 8, 6), dark, s * .04, .02, .1));
    const brow = mesh(box(.045, .01, .01), hm, s * .042, .055, .105); brow.rotation.z = s * -.1; head.add(brow);
    head.add(mesh(sph(.03, 8, 6), sk, s * .108, 0, 0)); // ears
  }
  const nose = mesh(G('nose', () => new THREE.ConeGeometry(.018, .05, 6)), sk, 0, -.005, .118); nose.rotation.x = Math.PI / 2; head.add(nose);
  head.add(mesh(box(.04, .008, .01), M('#7a3b33'), 0, -.05, .105));
  if (op.mustache) head.add(mesh(box(.07, .022, .02), M(op.mustacheColor || op.hairColor), 0, -.03, .11));
  if (op.glasses) { const gm = M('#1a1a1a', { metal: .6, rough: .3 }); for (const s of [-1, 1]) { const r = mesh(G('glass', () => new THREE.TorusGeometry(.024, .004, 6, 16)), gm, s * .042, .018, .112); head.add(r); } head.add(mesh(box(.03, .004, .004), gm, 0, .02, .114)); }
  // hair styles
  const hs = op.hair;
  const capG = G('hairCap', () => new THREE.SphereGeometry(.127, 20, 12, 0, Math.PI * 2, 0, Math.PI * .5));
  const hairCap = (sx = 1, sy = 1, tilt = -.45, y = .012) => { const h = mesh(capG, hm, 0, y, -.008); h.rotation.x = tilt; h.scale.set(sx, sy, 1.02); head.add(h); return h; };
  if (hs === 'short' || hs === 'side') { hairCap(.97, .95); if (hs === 'side') { const p = mesh(box(.09, .03, .1), hm, -.05, .105, .04); p.rotation.z = .3; head.add(p); } }
  if (hs === 'wild') { const r = [[0, .1, 0, .1], [-.09, .06, -.02, .08], [.09, .06, -.02, .08], [-.11, 0, -.05, .07], [.11, 0, -.05, .07], [0, .07, -.08, .1], [-.06, .1, .04, .07], [.06, .1, .04, .07]]; for (const [x, y, z, s] of r) head.add(mesh(sph(s, 10, 8), hm, x, y, z)); }
  if (hs === 'bun') { hairCap(1, 1); head.add(mesh(sph(.06, 10, 8), hm, 0, .06, -.13)); }
  if (hs === 'bob') { hairCap(1.06, 1.05, -.3); for (const s of [-1, 1]) { const sd = mesh(box(.04, .13, .14), hm, s * .11, -.01, -.02); head.add(sd); } const bk = mesh(box(.2, .14, .05), hm, 0, -.02, -.105); head.add(bk); }
  if (hs === 'bald') { const r = mesh(G('baldRing', () => new THREE.TorusGeometry(.11, .025, 6, 16, Math.PI)), hm, 0, -.005, -.015); r.rotation.set(Math.PI / 2, 0, Math.PI); head.add(r); }
  // hats
  const hc = M(op.hatColor, { rough: .7 });
  if (op.hat === 'fedora' || op.hat === 'porkpie') {
    head.add(mesh(cyl(.19, .19, .012, 20), hc, 0, .085, 0));
    head.add(mesh(cyl(.105, .115, op.hat === 'porkpie' ? .07 : .11, 16), hc, 0, .13, 0));
    head.add(mesh(cyl(.117, .117, .02, 16), M('#141414'), 0, .1, 0));
  }
  if (op.hat === 'cap' || op.hat === 'officer') { // military peaked cap
    head.add(mesh(cyl(.13, .115, .07, 16), hc, 0, .12, 0));
    const v = mesh(box(.15, .01, .07), M('#151515', { rough: .3 }), 0, .09, .11); v.rotation.x = .25; head.add(v);
    head.add(mesh(sph(.016, 6, 6), M('#d4a83a', { metal: 1, rough: .3 }), 0, .13, .125));
  }
  if (op.hat === 'garrison') { const c = mesh(box(.2, .06, .24), hc, 0, .11, 0); c.rotation.z = .1; head.add(c); }
  if (op.hat === 'student') { head.add(mesh(cyl(.122, .118, .06, 16), hc, 0, .1, 0)); const v = mesh(box(.15, .01, .07), M('#111'), 0, .075, .11); v.rotation.x = .2; head.add(v); }
  if (op.hat === 'helmet') { const h = mesh(G('helm', () => new THREE.SphereGeometry(.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)), hc, 0, .03, 0); h.scale.set(1, 1, 1.1); head.add(h); }
  if (op.hat === 'flight') { const h = mesh(sph(.128, 16, 12), M('#5a3a22', { rough: .6 }), 0, .02, 0); h.scale.set(1, .95, 1.05); head.add(h); head.add(mesh(box(.2, .045, .04), M('#2a2a2a', { metal: .5, rough: .2 }), 0, .065, .1)); }
  if (op.hat === 'hachimaki') head.add(mesh(cyl(.12, .12, .03, 16), M('#f5f2ea'), 0, .05, 0));
  if (op.hat === 'bandana') { const h = mesh(sph(.128, 16, 12), hc, 0, .03, 0); h.scale.set(1, .8, 1.04); head.add(h); }
  // arms
  const mkArm = (s) => {
    const sh0 = new THREE.Group(); sh0.position.set(s * .23 * b, .48, 0); spine.add(sh0);
    sh0.add(mesh(cap(.06, .2), top, 0, -.14, 0));
    const el = new THREE.Group(); el.position.y = -.29; sh0.add(el);
    el.add(mesh(cap(.05, .19, 4, 8), op.sleeves === 'short' ? sk : top, 0, -.13, 0));
    el.add(mesh(sph(.05, 10, 8), sk, 0, -.29, .01));
    return { sh: sh0, el };
  };
  const armL = mkArm(-1), armR = mkArm(1);
  const mkLeg = (s) => {
    const hp = new THREE.Group(); hp.position.set(s * .1 * b, -.04, 0); hips.add(hp);
    hp.add(mesh(cap(.075 * b, .3), pm, 0, -.2, 0));
    const kn = new THREE.Group(); kn.position.y = -.43; hp.add(kn);
    kn.add(mesh(cap(.062, .3), op.female && op.skirt ? sk : pm, 0, -.2, 0));
    kn.add(mesh(box(.11, .07, .24), sh, 0, -.44, .05));
    return { hp, kn };
  };
  const legL = mkLeg(-1), legR = mkLeg(1);
  root.userData.rig = { body, hips, spine, neck, head, armL, armR, legL, legR };
  root.pose = (p = {}) => setPose(root, p);
  root.pose({});
  return root;
}

// angles in radians; arm: [forward(x), sideways(z)], elbow: bend
export function setPose(root, p) {
  const r = root.userData.rig;
  const a = (v, d = 0) => (v === undefined ? d : v);
  r.armL.sh.rotation.set(-a(p.armL?.[0]), 0, -a(p.armL?.[1], .08)); r.armL.el.rotation.set(-a(p.elbowL, .1), 0, 0);
  r.armR.sh.rotation.set(-a(p.armR?.[0]), 0, a(p.armR?.[1], .08)); r.armR.el.rotation.set(-a(p.elbowR, .1), 0, 0);
  r.legL.hp.rotation.set(-a(p.legL), 0, 0); r.legL.kn.rotation.set(a(p.kneeL), 0, 0);
  r.legR.hp.rotation.set(-a(p.legR), 0, 0); r.legR.kn.rotation.set(a(p.kneeR), 0, 0);
  r.spine.rotation.set(a(p.spine), a(p.twist), a(p.lean));
  r.neck.rotation.set(a(p.head?.[0]), a(p.head?.[1]), a(p.head?.[2]));
  r.hips.position.y = .95 - a(p.drop);
  if (p.sit) { r.legL.hp.rotation.x = r.legR.hp.rotation.x = -Math.PI / 2; r.legL.kn.rotation.x = r.legR.kn.rotation.x = Math.PI / 2; r.hips.position.y = a(p.seat, .5); }
}
export const POSE = {
  stand: {},
  sit: { sit: true, armL: [.5, .1], armR: [.5, .1], elbowL: .9, elbowR: .9 },
  sitDesk: { sit: true, armL: [.9, .15], armR: [.9, .15], elbowL: .6, elbowR: .6, spine: .12 },
  write: { sit: true, armL: [.8, .2], armR: [1.0, .05], elbowL: .9, elbowR: .7, spine: .25, head: [.3, 0, 0] },
  point: { armR: [1.5, .1], elbowR: .05 },
  armsUp: { armL: [2.6, .3], armR: [2.6, .3], elbowL: .2, elbowR: .2 },
  ghost: { armL: [1.3, .1], armR: [1.3, .1], elbowL: .3, elbowR: .3, spine: .15, head: [.25, 0, 0] },
  pull: { armL: [1.2, 0], armR: [1.1, 0], elbowL: .3, elbowR: .3, spine: -.35, legL: .5, kneeL: .3, legR: -.4, kneeR: .1 },
  hold: { armL: [.9, .1], armR: [.9, .1], elbowL: 1.0, elbowR: 1.0 },
  salute: { armR: [.6, 1.2], elbowR: 2.4 },
  lookUp: { head: [-.6, 0, 0] },
  cheer: { armL: [2.9, .4], armR: [2.9, .4], elbowL: .1, elbowR: .1, head: [-.2, 0, 0] },
  mourn: { head: [.6, 0, 0], spine: .25, armL: [.4, .1], armR: [.4, .1], elbowL: 1.4, elbowR: 1.4 },
};
export function walk(root, t, { speed = 1, amp = .55, extra = {} } = {}) {
  const s = Math.sin(t * speed * 5), c = Math.cos(t * speed * 5);
  setPose(root, { legL: s * amp, legR: -s * amp, kneeL: Math.max(0, -c) * amp * 1.2, kneeR: Math.max(0, c) * amp * 1.2, armL: [-s * amp * .7, .08], armR: [s * amp * .7, .08], elbowL: .3, elbowR: .3, drop: Math.abs(c) * .03, ...extra });
}

// character presets
export const CAST = {
  einstein: () => person({ jacket: '#6f6a62', shirt: '#d8d2c4', pants: '#4a4640', hair: 'wild', hairColor: '#e9e6e0', mustache: true, mustacheColor: '#d8d4cc', skin: SKIN.pale, build: 1.05 }),
  szilard: () => person({ jacket: '#5a4634', shirt: '#efe9dd', tie: '#5b1a1a', pants: '#4a3a2c', hair: 'side', hairColor: '#2b2017', build: 1.15 }),
  roosevelt: () => person({ jacket: '#1f2a44', shirt: '#f2efe8', tie: '#3a2a55', pants: '#1f2a44', hair: 'side', hairColor: '#a9a59e', glasses: true, build: 1.1 }),
  truman: () => person({ jacket: '#555b63', shirt: '#f2efe8', tie: '#2a3550', pants: '#555b63', hair: 'side', hairColor: '#b9b4ab', glasses: true }),
  groves: () => person({ jacket: '#8b7b55', shirt: '#b8a77d', tie: '#5e5236', pants: '#8b7b55', hat: 'cap', hatColor: '#8b7b55', build: 1.3, belt: '#4a3420' }),
  oppenheimer: () => person({ jacket: '#6d7078', shirt: '#eae6dc', tie: '#2a2f3a', pants: '#6d7078', hat: 'porkpie', hatColor: '#8a8170', build: .85, height: 1.03 }),
  stimson: () => person({ jacket: '#2e2e33', shirt: '#f2efe8', tie: '#5a1f1f', pants: '#2e2e33', hair: 'bald', hairColor: '#cfcac0', mustache: true, mustacheColor: '#d6d2ca' }),
  pilot: (c = '#5b5a3c') => person({ shirt: c, jacket: null, pants: c, hat: 'garrison', hatColor: '#5a5536', belt: '#3a2b1b' }),
  flyer: () => person({ shirt: '#4c4a33', jacket: '#5c3b22', pants: '#4c4a33', hat: 'flight', build: 1.1 }),
  tech: () => person({ shirt: '#e8e6df', jacket: null, pants: '#2f3a4a', hair: 'short', hairColor: '#3a2a1c' }),
  scientist: () => person({ jacket: '#f2f0ea', shirt: '#cfd6e0', tie: '#2a3550', pants: '#4a4f58', hair: 'side', hairColor: '#4a3a2a', glasses: true }),
  worker: () => person({ shirt: '#3f5d7d', pants: '#2b3a4f', hat: 'cap', hatColor: '#2b3a4f' }),
  operator: () => person({ female: true, shirt: '#6c8fb3', skirt: '#2c3e57', pants: '#2c3e57', hair: 'bun', hairColor: '#4a2f1d' }),
  sailor: () => person({ shirt: '#f1f1ee', pants: '#1d2b49', hat: 'helmet', hatColor: '#f1f1ee', sleeves: 'short' }),
  gi: () => person({ shirt: '#5c5a3a', pants: '#5c5a3a', hat: 'helmet', hatColor: '#4d4b30', belt: '#3a2b1b' }),
  jpCivil: (seed = 0) => { const sh = ['#ece6d6', '#d9d2c0', '#c9c2b0', '#e4dccb'][seed % 4]; const pa = ['#5a5a48', '#6b5d45', '#3e4a52', '#4d4535'][(seed >> 2) % 4]; return person({ shirt: sh, pants: pa, skin: SKIN.mid, hair: 'short', hairColor: '#141210', sleeves: 'short', hat: seed % 3 === 0 ? 'hachimaki' : null }); },
  jpWoman: (seed = 0) => { const sk = ['#5c4a6a', '#3d4e6a', '#6a4a3a', '#4a5a4a'][seed % 4]; return person({ female: true, shirt: ['#e9e1d0', '#d8c9ae', '#c8d0d8'][seed % 3], pants: sk, skin: SKIN.mid, hair: 'bob', hairColor: '#141210', hat: seed % 2 ? 'bandana' : null, hatColor: '#cfc6b0' }); },
  student: (seed = 0) => person({ shirt: '#262d3d', pants: '#262d3d', skin: SKIN.mid, hair: 'short', hairColor: '#111', hat: seed % 2 ? 'student' : 'hachimaki', hatColor: '#1f2533', build: .9, height: .95 }),
  jpOfficer: () => person({ jacket: '#6b6340', shirt: '#cfc6a6', pants: '#6b6340', hat: 'officer', hatColor: '#6b6340', skin: SKIN.mid, mustache: true, mustacheColor: '#1a1612', belt: '#3a2b1b' }),
  jpMinister: () => person({ jacket: '#1b1b1f', shirt: '#f0ede6', tie: '#3a3a3a', pants: '#1b1b1f', skin: SKIN.mid, hair: 'bald', hairColor: '#2a2a2a', glasses: true }),
  emperor: () => person({ jacket: '#2b2a24', shirt: '#2b2a24', pants: '#2b2a24', skin: SKIN.mid, hair: 'side', hairColor: '#141210', glasses: true, mustache: true, mustacheColor: '#141210', belt: '#b08a3a' }),
  journalist: () => person({ jacket: '#7a6a50', shirt: '#e8e2d2', tie: '#33302a', pants: '#5a5040', hat: 'fedora', hatColor: '#5a5040' }),
  doctor: () => person({ jacket: '#f3f2ee', shirt: '#f3f2ee', pants: '#e8e6e0', skin: SKIN.mid, hair: 'short', hairColor: '#111', glasses: true }),
  modern: (seed = 0) => person({ shirt: ['#d94a3a', '#2f6fb3', '#f2c14e', '#e8e8e8', '#3a3a3a', '#4fb38a'][seed % 6], pants: ['#2a3a5a', '#222', '#6a6a6a', '#c8b89a'][seed % 4], skin: SKIN.mid, hair: seed % 3 ? 'short' : 'bob', hairColor: '#141210', sleeves: 'short' }),
};
