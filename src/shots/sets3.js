// 3D sets, part 3: Hiroshima street (intact / ruined), students, shadow steps, cockpit, bomb bay, nose art, aerial attack.
import * as THREE from 'three';
import { stage, look } from './common.js';
import { M, MAT } from '../kit/materials.js';
import { CAST, POSE, person, walk, setPose } from '../kit/people.js';
import * as P from '../kit/props.js';
import * as B from '../kit/buildings.js';
import { b29 } from '../kit/aircraft.js';
import { littleBoy } from '../kit/bombs.js';
import { tram } from '../kit/vehicles.js';
import { ground, terrain, water, point, spot, C } from '../kit/env.js';
import { buildHiroshima } from '../kit/city.js';
import { motes, smoke, fire, mushroom, fireball, shockRing, domeShock, cloudLayer, Particles, rain } from '../kit/fx.js';
import { canvas, tex, softDot, concreteTex } from '../core/textures.js';
import { rng, clamp, fbm, lerp, smooth, easeOut, expoOut, easeIn } from '../core/math.js';

const SKY_MORNING = { top: '#3f7fc8', mid: '#dfeaf0', bot: '#9ab0c0', sun: [.9, .45, .35], sunCol: '#fff0d0', sunGlow: .3 };

// ---------- street-level Hiroshima ----------
export function street({ ruined = false, people = 26, tramOn = true, seed = 1, birds = true, dusk = false } = {}) {
  const S = stage({ sky: ruined ? { top: '#2a1a14', mid: '#7a3a20', bot: '#2a1a14', sun: [0, .2, -1], sunCol: '#ff6a2a', sunGlow: .6 } : SKY_MORNING, light: { sun: ruined ? [-20, 40, -80] : [60, 50, 30], sunCol: ruined ? '#ff8a4a' : '#fff0d8', sunI: ruined ? 1.6 : 3.2, hemiI: ruined ? .4 : .75, hemiTop: ruined ? '#8a4a3a' : '#9ab8e0', area: 45, mapSize: 4096 }, far: 3000, near: .2 });
  S.scene.fog = new THREE.Fog(ruined ? '#5a2a1a' : '#cad8e0', ruined ? 25 : 80, ruined ? 180 : 600);
  const r = rng(seed);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 400), M(ruined ? '#3a302a' : '#8a8070', { rough: .95 })); road.rotation.x = -Math.PI / 2; road.receiveShadow = true; S.scene.add(road);
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M(ruined ? '#2a2420' : '#6f6656', { rough: 1 })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -.02; gnd.receiveShadow = true; S.scene.add(gnd);
  for (const x of [-.75, .75]) { const rail = P.box(.08, .06, 400, M('#5a5550', { metal: .7, rough: .4 }), x, .03, 0); S.scene.add(rail); }
  const houses = [], poles = [], trees = [], walkers = [];
  for (const side of [-1, 1]) for (let i = 0; i < 16; i++) {
    const z = -120 + i * 8 + (side > 0 ? 3 : 0);
    if (!ruined) { const h = B.machiya(i * 7 + (side > 0 ? 100 : 0) + seed); h.position.set(side * 11, 0, z); h.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; S.scene.add(h); houses.push(h); }
    else { // charred posts & rubble
      const g = new THREE.Group(); g.position.set(side * 11, 0, z); S.scene.add(g); houses.push(g);
      for (let k = 0; k < 4; k++) { const post = P.box(.2, .5 + r() * 2.2, .2, M('#151210', { rough: 1 }), (r() - .5) * 5, 0, (r() - .5) * 6); post.position.y = post.geometry.parameters.height / 2; post.rotation.z = (r() - .5) * .5; g.add(post); }
      for (let k = 0; k < 9; k++) { const b = P.box(.4 + r() * 1.8, .1 + r() * .3, .2 + r() * .6, M(r.pick(['#2a2420', '#4a3a30', '#5a5048', '#1a1614']), { rough: 1 }), (r() - .5) * 6, .1, (r() - .5) * 7); b.rotation.set(r(), r() * 3, r() * .4); g.add(b); }
      const pile = new THREE.Mesh(new THREE.ConeGeometry(2 + r() * 1.5, .8 + r(), 7), M('#3a302a', { rough: 1 })); pile.position.set((r() - .5) * 3, .3, (r() - .5) * 3); g.add(pile);
    }
    if (i % 3 === 0) { const p = P.pole(8); p.position.set(side * 7.4, 0, z + 2); if (ruined) { p.rotation.z = side * (.3 + r() * .5); p.scale.y = .6 + r() * .4; } S.scene.add(p); poles.push(p); }
  }
  if (!ruined) { // overhead wires
    const wm = new THREE.LineBasicMaterial({ color: '#1a1a1a' }); for (const side of [-1, 1]) for (const dx of [-.6, -.2, .2, .6]) { const pts = []; for (let z = -120; z <= 10; z += 2) pts.push(new THREE.Vector3(side * 7.4 + dx, 7.65 - Math.abs(Math.sin(z / 24 * Math.PI)) * .5, z)); S.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wm)); }
    for (let i = 0; i < 6; i++) { const t = new THREE.Group(); t.position.set((i % 2 ? 1 : -1) * 6.2, 0, -100 + i * 20); t.add(P.cyl(.18, .25, 3, M('#3a2a1a'), 0, 1.5, 0, 6)); const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), M('#3f6a2f', { rough: .9, flat: true })); crown.position.y = 4; crown.castShadow = true; t.add(crown); S.scene.add(t); trees.push(t); }
  }
  const tr = tramOn && !ruined ? tram() : null; if (tr) { S.scene.add(tr); }
  // dome at end of street
  const dome = B.promotionHall({ ruined }); dome.position.set(0, 0, -220); dome.scale.setScalar(.9); S.scene.add(dome);
  const mount = terrain(S.scene, { size: 3000, seg: 80, height: (x, z) => (z < -500 ? Math.pow((-z - 500) / 300, 1.3) * 60 * (.5 + fbm(x / 300, z / 300)) : -1), color: () => C(ruined ? '#3a2a22' : '#4a6a48') }); mount.position.y = -.1;
  for (let i = 0; i < people; i++) {
    const k = r(); const p = k < .35 ? CAST.jpCivil(i) : k < .65 ? CAST.jpWoman(i) : CAST.student(i);
    const lane = (r() - .5) * 10; p.userData.walk = { x: lane, z0: -80 + r() * 90, dir: r() < .5 ? 1 : -1, speed: .9 + r() * .5, ph: r() * 10 };
    S.scene.add(p); walkers.push(p);
  }
  // birds
  const flock = []; if (birds && !ruined) for (let i = 0; i < 9; i++) { const b = new THREE.Group(); const wm2 = M('#2a2a2e'); const l = P.box(.35, .02, .12, wm2, -.18, 0, 0), rr = P.box(.35, .02, .12, wm2, .18, 0, 0); b.add(P.box(.08, .06, .25, wm2), l, rr); b.userData = { l, rr, ph: r() * 6, h: 14 + r() * 6, off: r() * 30 }; S.scene.add(b); flock.push(b); }
  S.update0 = (lt) => {
    walkers.forEach((p) => { const w = p.userData.walk; if (w.frozen) return; const z = w.z0 + w.dir * w.speed * lt; p.position.set(w.x, 0, z); p.rotation.y = w.dir > 0 ? 0 : Math.PI; walk(p, lt + w.ph, { speed: w.speed * .9, amp: .45 }); });
    if (tr) tr.position.set(0, 0, -70 + lt * 3.2);
    flock.forEach((b, i) => { const d = b.userData; const a = lt * .3 + d.off; b.position.set(Math.sin(a) * 18 + (i % 3) * 2, d.h + Math.sin(lt * 2 + i) * .5, -40 + Math.cos(a) * 18 + Math.floor(i / 3) * 2); b.rotation.y = -a; const f = Math.sin(lt * 14 + d.ph) * .6; d.l.rotation.z = f; d.rr.rotation.z = -f; });
  };
  if (ruined) {
    const spots = []; houses.forEach((h, i) => { if (i % 2 === 0) spots.push([h.position.x + (r() - .5) * 3, .3, h.position.z, 1.6 + r() * 1.4]); });
    const fi = fire(spots, { per: 14, height: 3.2 }); S.scene.add(fi); S.particles.push(fi); S.fireP = fi;
    const sm = smoke(spots.filter((_, i) => i % 2 === 0).map(([x, y, z, s]) => [x, 4, z, s]), { col: '#1a120e', col2: '#5a3a2a', alpha: .55, rise: 16, spread: 6, drift: [1.5, 0] }); S.scene.add(sm); S.particles.push(sm);
    const emb = motes(500, { box: [30, 18, 120], center: [0, 8, -50], col: '#ffa040', size: .08, speed: [.6, 1.4, .2] }); S.scene.add(emb); S.particles.push(emb);
    for (let i = 0; i < 6; i++) { const l = new THREE.PointLight('#ff6a2a', 60, 30, 2); l.position.set(spots[i * 2][0], 2, spots[i * 2][2]); S.scene.add(l); }
  }
  S.grade = ruined ? { tint: [1.12, .9, .82], sat: 1.05, contrast: 1.15, bloom: .9, vignette: .6 } : { tint: [1.03, 1, .96], sat: 1.12, bloom: .5 };
  return Object.assign(S, { walkers, houses, poles, trees, flock, tram: tr, dome });
}

// ---------- students demolishing a house for firebreaks ----------
export function students() {
  const S = stage({ sky: SKY_MORNING, light: { sun: [40, 45, 30], sunCol: '#fff0d8', sunI: 3.2, hemiI: .75, area: 25 }, near: .2, far: 3000 });
  S.scene.fog = new THREE.Fog('#cad8e0', 60, 500);
  ground(S.scene, { color: '#7a6e5c', size: 600 });
  const frame = new THREE.Group(); frame.position.set(0, 0, -6); S.scene.add(frame);
  const wd = M('#6a4a2a', { rough: .8 });
  for (const [x, z] of [[-3, -2], [3, -2], [-3, 2], [3, 2], [0, -2], [0, 2]]) { const p = P.box(.22, 5, .22, wd, x, 2.5, z); frame.add(p); }
  for (const z of [-2, 2]) frame.add(P.box(6.4, .25, .25, wd, 0, 5, z)); for (const x of [-3, 0, 3]) frame.add(P.box(.25, .25, 4.4, wd, x, 5, 0));
  const roof = new THREE.Mesh(B.gableGeo(6.4, 4.4, 1.6, .3), M('#3f4652', { rough: .6 })); roof.position.y = 5.1; roof.castShadow = true; frame.add(roof);
  const kids = []; const ropeM = new THREE.LineBasicMaterial({ color: '#c8b48a' });
  for (let i = 0; i < 10; i++) { const s = CAST.student(i); s.position.set(-2.4 + (i % 5) * 1.2, 0, 3 + Math.floor(i / 5) * 1.2); s.rotation.y = Math.PI; s.pose(POSE.pull); S.scene.add(s); kids.push(s); }
  const ropes = []; for (let i = 0; i < 2; i++) { const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); const l = new THREE.Line(geo, ropeM); S.scene.add(l); ropes.push(l); }
  const teacher = CAST.jpOfficer(); teacher.position.set(4, 0, 2); teacher.rotation.y = -1.2; teacher.pose(POSE.point); S.scene.add(teacher);
  const dust = motes(200, { box: [16, 4, 16], center: [0, 1, -4], col: '#d8c8a8', size: .15, speed: [.3, .2, 0], additive: false, alpha: .35, flicker: false }); S.scene.add(dust); S.particles.push(dust);
  S.update0 = (lt) => {
    const tilt = clamp((lt - 1.5) / 3) * .35 + Math.sin(lt * 3) * .01; frame.rotation.x = tilt; frame.position.z = -6 + tilt * 1.5;
    kids.forEach((k, i) => { const pull = Math.sin(lt * 3 + i * .4) * .1; setPose(k, { ...POSE.pull, spine: -.35 - pull, legL: .5 + pull }); k.position.z = 3 + Math.floor(i / 5) * 1.2 + tilt * 2; });
    ropes.forEach((l, i) => { const a = new THREE.Vector3(i ? 2 : -2, 4.6, -4.2).applyEuler(frame.rotation).add(frame.position); a.y = 4.6 - frame.rotation.x * 2; const b = new THREE.Vector3(i ? 2.4 : -2.4, 1.1, kids[i * 5].position.z + 4); l.geometry.setFromPoints([a, b]); });
  };
  S.grade = { tint: [1.04, 1, .95], sat: 1.12, bloom: .5 };
  return S;
}

// ---------- granite steps with a person / shadow ----------
function shadowTex() {
  const c = canvas(512, 512), g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, 512, 512);
  g.fillStyle = 'rgba(25,20,18,.85)'; g.filter = 'blur(6px)';
  g.beginPath(); g.ellipse(250, 120, 42, 50, 0, 0, 7); g.fill(); // head
  g.beginPath(); g.moveTo(200, 170); g.quadraticCurveTo(250, 150, 310, 175); g.lineTo(330, 330); g.quadraticCurveTo(260, 360, 190, 330); g.closePath(); g.fill(); // torso
  g.beginPath(); g.moveTo(190, 320); g.lineTo(420, 330); g.lineTo(430, 380); g.lineTo(190, 380); g.fill(); // thighs
  g.beginPath(); g.moveTo(320, 200); g.lineTo(380, 300); g.lineTo(350, 310); g.lineTo(300, 230); g.fill(); // arm
  return tex(c);
}
export function shadowSteps() {
  const S = stage({ sky: false, bg: '#000', light: { sun: [0, 30, 20], sunCol: '#fff6e8', sunI: 1.4, hemiI: .3, area: 6 } });
  const stone = M('#b8b0a2', { rough: .95, map: concreteTex() });
  for (let i = 0; i < 4; i++) S.scene.add(P.box(14, .3, .5, stone, 0, .15 + i * .3, -i * .5 + .75));
  const wall = P.box(14, 5, .4, stone, 0, 3.6, -1.3); S.scene.add(wall);
  S.scene.add(P.box(14, .1, 8, M('#9a9284', { rough: 1 }), 0, -.05, 2));
  const man = CAST.jpCivil(3); man.position.set(-.3, .62, -.25); man.pose({ sit: true, seat: .48, armL: [.6, .1], elbowL: 1.2, armR: [.4, .2], elbowR: 1.4, head: [.15, 0, 0] }); S.scene.add(man);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: shadowTex(), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); sh.position.set(-.25, 1.5, -1.09); S.scene.add(sh);
  const flashL = new THREE.DirectionalLight('#ffffff', 0); flashL.position.set(.5, 6, 8); flashL.castShadow = true; flashL.shadow.mapSize.set(2048, 2048); const c = flashL.shadow.camera; c.left = -4; c.right = 4; c.top = 4; c.bottom = -4; S.scene.add(flashL);
  S.flash = (k, gone) => { flashL.intensity = k * 30; man.visible = !gone; sh.material.opacity = gone ? .95 : 0; stone.color.set(gone ? '#d8d0c0' : '#b8b0a2'); };
  S.grade = { sat: .7, contrast: 1.15, bloom: .8 };
  return S;
}

// ---------- B-29 cockpit looking forward through the glazed nose ----------
export function cockpit({ outside = 'cloud', tod = 'morning' } = {}) {
  const S = stage({ sky: tod === 'morning' ? { top: '#2f6fb8', mid: '#e0ecf2', bot: '#8aa6c0', sun: [.6, .3, -1], sunCol: '#fff0d8' } : { top: '#203a6a', mid: '#ffb27a', bot: '#5a6a8a', sun: [.6, .1, -1], sunCol: '#ffc890' }, light: { sun: [20, 40, -60], sunCol: '#fff0d8', sunI: 2.4, hemiI: .7, area: 6 }, far: 60000, near: .05 });
  const dash = new THREE.Group(); S.scene.add(dash);
  const c = canvas(1024, 384), g = c.getContext('2d'); g.fillStyle = '#1c1e20'; g.fillRect(0, 0, 1024, 384);
  for (let i = 0; i < 14; i++) { const x = 70 + (i % 7) * 140, y = 100 + Math.floor(i / 7) * 170; g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(x, y, 56, 0, 7); g.fill(); g.strokeStyle = '#ddd'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 46, Math.PI * .8, Math.PI * 2.2); g.stroke(); g.strokeStyle = '#f2a541'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); const a = Math.PI * (1 + i * .13); g.lineTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40); g.stroke(); }
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .9), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .6, emissive: '#ffffff', emissiveMap: tex(c), emissiveIntensity: .15 })); panel.position.set(0, .9, -1.1); panel.rotation.x = -.35; dash.add(panel);
  dash.add(P.box(2.6, .1, .8, M('#2a2c2e', { rough: .6 }), 0, .55, -.9));
  // glazing frames (dome of bars)
  const fm = M('#3a3e42', { rough: .4, metal: .7 });
  for (let k = -4; k <= 4; k++) { const pts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; pts.push(new THREE.Vector3(Math.cos(a) * 1.6 + 0, Math.sin(a) * 1.4 + .3, -1.6 - Math.sin(a) * .8 + k * .0)); } const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .025, 5), fm); tube.rotation.x = k * .14; tube.position.z = -.2; dash.add(tube); }
  const pilot = CAST.pilot(), co = CAST.pilot(); pilot.position.set(-.65, 0, .2); co.position.set(.65, 0, .2); pilot.rotation.y = co.rotation.y = Math.PI; [pilot, co].forEach((p) => { p.pose({ sit: true, seat: .45, armL: [.9, .1], armR: [.9, .1], elbowL: .6, elbowR: .6 }); dash.add(p); });
  co.userData.rig.neck.rotation.y = -.25;
  const cl = cloudLayer(300, { y: -1500, area: 20000, thick: 200, size: [400, 900], seed: 4 }); S.scene.add(cl); S.particles.push(cl);
  if (outside === 'mushroom') { const m = mushroom({ H: 9000, tau: 12, n: 1500, hot: '#ffe8c8', fire: '#ff7a2a', dark: '#3a3240', light: '#9c92a2', glow: '#ff6a2a', base: '#6a5a58' }); m.position.set(-6000, -9400, -16000); S.scene.add(m); S.particles.push(m); S.mush = m; }
  S.grade = { tint: [1.02, 1, .98], sat: 1.05, bloom: .6, vignette: .6 };
  return Object.assign(S, { pilot, co });
}

// ---------- inside the bomb bay ----------
export function bombBay() {
  const S = stage({ sky: false, bg: '#030406', light: { sun: [0, 5, 0], sunI: .05, hemiI: .05, shadow: false } });
  const m = M('#3a4048', { rough: .5, metal: .7 });
  for (let i = -3; i <= 3; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(1.45, .05, 6, 32, Math.PI * 1.4), m); rib.rotation.set(0, 0, -Math.PI * .2); rib.position.z = i * .7; rib.rotation.y = Math.PI / 2; rib.rotation.order = 'YXZ'; S.scene.add(rib); }
  const lb = littleBoy(); lb.position.set(0, 0, 0); S.scene.add(lb);
  S.scene.add(P.box(.3, .05, 5, M('#2a2e33', { metal: .6, rough: .4 }), .9, -.6, 0));
  const parsons = person({ shirt: '#34404f', pants: '#34404f', hat: 'garrison', hatColor: '#2a3442' }); parsons.position.set(.95, -.6, .6); parsons.rotation.y = -Math.PI / 2; parsons.pose({ sit: true, seat: .3, armL: [1.3, .1], armR: [1.2, -.1], elbowL: .4, elbowR: .7, spine: .4, head: [.2, 0, 0] }); S.scene.add(parsons);
  const torch = new THREE.SpotLight('#fff2d8', 40, 8, .35, .6, 2); torch.position.set(.7, .2, .5); torch.target.position.set(0, 0, -.9); torch.castShadow = true; torch.shadow.mapSize.set(1024, 1024); S.scene.add(torch, torch.target);
  const cold = new THREE.PointLight('#6a90d0', 6, 8, 2); cold.position.set(-1, .8, 2); S.scene.add(cold); const fillB = new THREE.PointLight('#9ab0d0', 3, 6, 2); fillB.position.set(.2, 1.2, -1.5); S.scene.add(fillB);
  const breath = motes(80, { box: [1, 1, 1], center: [.6, .5, .5], col: '#cfe0ff', size: .06, speed: [-.1, .15, 0], additive: true, alpha: .25, flicker: false }); S.scene.add(breath); S.particles.push(breath);
  S.grade = { tint: [.88, .96, 1.15], sat: .85, contrast: 1.18, bloom: .8, vignette: .7 };
  return Object.assign(S, { bomb: lb, parsons, torch });
}

// ---------- painting ENOLA GAY on the nose ----------
export function noseArt() {
  const S = stage({ sky: { top: '#2f6fb0', mid: '#d6e8f0', bot: '#7a9ab0', sun: [.7, .5, .2], sunCol: '#fff4e0' }, light: { sun: [30, 25, 12], sunCol: '#fff2dc', sunI: 3, hemiI: .8, area: 25 }, near: .1, far: 6000 });
  ground(S.scene, { color: '#b8b2a4', size: 800 });
  const pl = b29({ name: '' }); pl.rotation.y = Math.PI / 2; pl.position.y = 4.2; S.scene.add(pl);
  const c = canvas(1024, 256), g = c.getContext('2d'); const t = tex(c);
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .9), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  decal.position.set(10.2, 4.55, -1.47); decal.rotation.y = Math.PI; S.scene.add(decal);
  const ladder = new THREE.Group(); for (const x of [-.25, .25]) ladder.add(P.box(.06, 4, .06, M('#8a6a3a'), x, 2, 0)); for (let y = .3; y < 4; y += .35) ladder.add(P.box(.5, .04, .04, M('#8a6a3a'), 0, y, 0)); ladder.position.set(10.2, 0, -2.4); ladder.rotation.x = -.18; S.scene.add(ladder);
  const painter = CAST.tech(); painter.position.set(10.0, 2.0, -2.1); painter.rotation.y = Math.PI; painter.pose({ armR: [1.6, .2], elbowR: .5, armL: [.4, .1] }); S.scene.add(painter);
  const tibbets = CAST.pilot(); tibbets.position.set(7, 0, -6); tibbets.rotation.y = 2.6; tibbets.pose({ armL: [.2, .1], armR: [.2, .1], head: [-.2, 0, 0] }); S.scene.add(tibbets);
  S.paint = (k) => { g.clearRect(0, 0, 1024, 256); g.font = 'italic 700 120px "Playfair Display"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#111'; const s = 'ENOLA GAY'; const w = g.measureText(s).width; g.save(); g.beginPath(); g.rect(512 - w / 2 - 10, 0, (w + 20) * k, 256); g.clip(); g.fillText(s, 512 - w / 2, 128); g.restore(); t.needsUpdate = true; };
  S.update0 = (lt) => { painter.userData.rig.armR.el.rotation.x = -(.5 + Math.sin(lt * 8) * .2); };
  S.grade = { sat: 1.08, bloom: .45 };
  return Object.assign(S, { plane: pl, painter, tibbets });
}

// ---------- the attack, seen from above (Hiroshima aerial with blast machinery) ----------
export function attack({ tod = 'morning', houses = 7000, cloudScale = 1 } = {}) {
  const S = stage({ sky: SKY_MORNING, light: { sun: [900, 1100, 1200], sunCol: '#fff0d8', sunI: 3.2, hemiI: .7, area: 2800, mapSize: 4096 }, far: 60000, near: 10 });
  S.scene.fog = new THREE.Fog('#c8d6e0', 4000, 22000);
  const city = buildHiroshima(S.scene, { houses }); S.city = city;
  const burst = [0, 580, 0]; // ~1,900 ft
  const fb = fireball(150); fb.position.set(...burst); fb.visible = false; S.scene.add(fb);
  const mush = mushroom({ n: 1800, H: 4200 * cloudScale, tau: 10, hot: '#fff3dc', fire: '#ff8a3a', dark: '#3a3240', light: '#9c92a2', glow: '#ff6a2a', base: '#6a5a58' }); S.scene.add(mush); S.particles.push(mush); S.mush = mush;
  const ring = shockRing('#fff4e0'); ring.position.y = 4; S.scene.add(ring);
  const dome = domeShock('#ffffff'); dome.position.set(...burst); S.scene.add(dome);
  const L = new THREE.PointLight('#fff0d0', 0, 0, 2); L.position.set(...burst); S.scene.add(L);
  const spots = city.fireSpots(220, 2000, 11); const fi = fire(spots, { per: 5, height: 3.4, rate: .7, intensity: 2.6, start: (e) => S.fireStart + Math.hypot(e[0], e[2]) / 1600 }); S.scene.add(fi); S.particles.push(fi); S.fireStart = 999;
  const sm = smoke(spots.filter((_, i) => i % 5 === 0).map(([x, y, z]) => [x, 20, z, 10]), { col: '#2a201c', col2: '#6a5048', alpha: .5, rise: 70, spread: 9, drift: [3, 1], start: 0 }); S.scene.add(sm); S.particles.push(sm); S.smokeP = sm;
  S.blastAt = 999;
  S.update0 = (lt) => {
    const k = lt - S.blastAt; const on = k > 0;
    fb.visible = on && k < 9; if (on) fb.userData.fbTick(k); fb.position.y = burst[1] + Math.max(0, k) * 60;
    mush.userData.t = () => k; L.intensity = on ? Math.exp(-k * .9) * 5e6 : 0;
    const R = on ? Math.min(3200, k * 340 + Math.pow(k, .5) * 300) : -1; city.apply(R, on ? 160 : -1, on ? clamp(k / 2) : 0);
    ring.userData.set(on ? R : 0, on ? clamp(1 - k / 9) * .7 : 0); dome.userData.set(on ? R * .9 : 0, on ? clamp(1 - k / 3) * .35 : 0);
    sm.userData.t = () => lt - S.fireStart - 1;
  };
  S.grade = (lt) => { const k = lt - S.blastAt; return k > 0 ? { flash: k < .9 ? 1 - k / .9 : 0, bloom: .8, bloomThreshold: .8, exposure: 1.05 - clamp(k / 8) * .2, tint: [1.06, .98, .96], sat: 1.05 } : { sat: 1.08, bloom: .45 }; };
  return S;
}
