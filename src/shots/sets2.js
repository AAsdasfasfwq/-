// 3D sets, part 2: Pacific war, fire raids, Trinity, bunker, Tinian, cruiser, assembly hut, briefing, loading, flight.
import * as THREE from 'three';
import { stage, look } from './common.js';
import { M, MAT } from '../kit/materials.js';
import { CAST, POSE, person, walk } from '../kit/people.js';
import * as P from '../kit/props.js';
import * as B from '../kit/buildings.js';
import { b29, fighter } from '../kit/aircraft.js';
import { littleBoy, fatMan, pumpkin } from '../kit/bombs.js';
import { cruiser, truck, jeep } from '../kit/vehicles.js';
import { ground, terrain, water, point, spot, C } from '../kit/env.js';
import { buildHiroshima } from '../kit/city.js';
import { motes, smoke, fire, mushroom, fireball, shockRing, domeShock, cloudLayer, Particles, rain } from '../kit/fx.js';
import { canvas, tex, sandTex, softDot } from '../core/textures.js';
import { rng, clamp, fbm, lerp, smooth, easeOut, expoOut } from '../core/math.js';

// ---------- Pacific naval battle at dusk ----------
export function pacificBattle() {
  const S = stage({ sky: { top: '#1b1f2e', mid: '#d0603a', bot: '#2a1a1a', sun: [1, .03, -.4], sunCol: '#ff7a3a', sunGlow: .6 }, light: { sun: [600, 60, -300], sunCol: '#ff9a5a', sunI: 2.6, hemiI: .45, hemiTop: '#6a6a8a', area: 300, mapSize: 2048 }, far: 9000, near: 1 });
  S.scene.fog = new THREE.Fog('#7a4a3a', 400, 3000);
  const w = water(S.scene, { color: '#1a2a35', y: 0 });
  const r = rng(5); const ships = [];
  for (let i = 0; i < 6; i++) { const s = cruiser({ col: i % 2 ? '#6a7278' : '#7d868e' }); s.scale.setScalar(.7 + r() * .4); s.position.set((r() - .5) * 1400, -1.5, -300 - r() * 1400); s.rotation.y = .4 + (r() - .5) * .5; S.scene.add(s); ships.push(s); }
  const burn = [[ships[1].position.x, 12, ships[1].position.z, 8], [ships[3].position.x, 12, ships[3].position.z, 10]];
  const fi = fire(burn, { per: 22, height: 2.5 }); S.scene.add(fi); S.particles.push(fi);
  const sm = smoke(burn.map(([x, y, z, s]) => [x, y + 10, z, s * 1.4]), { col: '#1a1614', col2: '#4a403a', alpha: .7, rise: 40, spread: 10, drift: [6, 0] }); S.scene.add(sm); S.particles.push(sm);
  const flak = motes(80, { box: [1500, 300, 1500], center: [0, 350, -900], col: '#ffcf7a', size: 6, speed: [0, 0, 0], alpha: .9 }); S.scene.add(flak); S.particles.push(flak);
  const planes = []; for (let i = 0; i < 5; i++) { const f = fighter(); f.scale.setScalar(3); S.scene.add(f); planes.push(f); }
  S.update0 = (lt) => planes.forEach((f, i) => { const a = lt * .25 + i * 1.2; f.position.set(Math.cos(a) * 500 + 100, 220 + Math.sin(a * 2) * 40, -800 + Math.sin(a) * 400); f.rotation.set(0, -a, .6); });
  S.grade = { tint: [1.08, .95, .88], sat: 1.05, contrast: 1.12, bloom: .8 };
  return S;
}

// ---------- incendiary raid over a sleeping wooden city (night) ----------
export function firebomb({ ashes = false } = {}) {
  const S = stage({ sky: { top: '#05060c', mid: ashes ? '#4a4038' : '#2a1410', bot: '#0a0806', stars: ashes ? 0 : .6, sunGlow: 0 }, light: { sun: [400, 900, 300], sunCol: ashes ? '#bfb8a8' : '#6a7aa0', sunI: ashes ? 1.6 : .35, hemiI: ashes ? .6 : .15, area: 2000, mapSize: 2048 }, far: 14000, near: 5 });
  S.scene.fog = new THREE.Fog(ashes ? '#6a6058' : '#1a0c08', 1200, 7000);
  const city = buildHiroshima(S.scene, { ruined: ashes, houses: 6000, seed: 21, texPx: 1536 });
  if (!ashes) {
    const spots = city.fireSpots(160, 2000, 4); S.fires = spots;
    const fi = fire(spots, { per: 6, height: 3, rate: .7, intensity: 2.6, start: (e, i) => (Math.hypot(e[0] - 400, e[2] + 600) / 2600) * 5 }); fi.scale.setScalar(1); S.scene.add(fi); S.particles.push(fi);
    for (let i = 0; i < 10; i++) { const p = spots[i * 13]; if (!p) continue; const l = new THREE.PointLight('#ff6a20', 90000, 900, 2); l.position.set(p[0], 40, p[2]); S.scene.add(l); }
    const sm = smoke(spots.filter((_, i) => i % 4 === 0).map(([x, y, z]) => [x, 30, z, 9]), { col: '#2a1a14', col2: '#6a3a24', alpha: .55, rise: 60, spread: 9, drift: [3, 1], start: 1.5 }); S.scene.add(sm); S.particles.push(sm);
    const bombers = []; for (let i = 0; i < 7; i++) { const b = b29({ name: '', tail: '', tailNum: '' }); b.userData.exhaust(true); S.scene.add(b); bombers.push(b); }
    // falling incendiary sticks (streaks)
    const sticks = new Particles(500, { map: softDot(), additive: true, shade: 0, sort: false }); const rr = rng(8); const SD = []; for (let i = 0; i < 500; i++) SD.push([rr(), rr(), rr(), rr()]);
    sticks.fn = (i, t, o) => { const s = SD[i]; const b = Math.floor(s[0] * 7); const ph = (t * .35 + s[1]) % 1; const bx = -1500 + t * 90 + b * 120 - 300, bz = -400 + b * 160; o.x = bx + (s[2] - .5) * 160 - ph * 300; o.z = bz + (s[3] - .5) * 160; o.y = 900 * (1 - ph); o.s = 6; o.r = 1; o.g = .55; o.b = .2; o.a = ph < .95 ? .9 : 0; };
    S.scene.add(sticks); S.particles.push(sticks);
    S.update0 = (lt) => bombers.forEach((b, i) => { b.position.set(-1500 + lt * 90 + i * 120 - 300, 950 + (i % 2) * 40, -400 + i * 160); b.rotation.y = Math.PI / 2; b.userData.spin(lt); b.scale.setScalar(1.6); });
    S.grade = { tint: [1.1, .92, .85], sat: 1.1, contrast: 1.15, bloom: 1.1, bloomThreshold: .6 };
  } else {
    const sm = smoke(city.fireSpots(40, 1800, 7).map(([x, y, z]) => [x, 10, z, 10]), { col: '#3a3632', col2: '#7a746c', alpha: .35, rise: 70, spread: 10, drift: [8, 0], rate: .05 }); S.scene.add(sm); S.particles.push(sm);
    const ash = motes(500, { box: [3000, 600, 3000], center: [0, 300, 0], col: '#cfc8bc', size: 3, speed: [6, -4, 2], additive: false, alpha: .6, flicker: false }); S.scene.add(ash); S.particles.push(ash);
    S.grade = { sat: .45, tint: [1.02, 1, .98], contrast: 1.08, bloom: .4 };
  }
  return Object.assign(S, { city });
}

// ---------- Trinity: desert, tower, explosion ----------
export function trinity({ blastAt = 999, view = 'far' } = {}) {
  const S = stage({ sky: { top: '#03060f', mid: '#24304a', bot: '#141010', sun: [0, -.2, -1], sunCol: '#4a5a8a', stars: 1.1, sunGlow: .1 }, light: { sun: [-300, 400, 600], sunCol: '#8aa0d0', sunI: .25, hemiI: .12, hemiTop: '#3a4a7a', area: 600, mapSize: 2048 }, far: 30000, near: 1 });
  S.scene.fog = new THREE.Fog('#1a1c26', 3000, 16000);
  terrain(S.scene, { size: 30000, seg: 200, height: (x, z) => { const d = Math.hypot(x, z); return fbm(x / 400, z / 400) * 8 + (d > 6000 ? Math.pow((d - 6000) / 3000, 1.4) * 900 * fbm(x / 2000, z / 2000) : 0); }, color: (x, z, h) => C('#8a6a4a').lerp(C('#5a4a3a'), clamp(h / 600)).lerp(C('#a07a52'), fbm(x / 90, z / 90) * .4) });
  const tw = B.trinityTower(); S.scene.add(tw);
  const flood = []; for (const [x, z] of [[60, 40], [-50, 70], [40, -60]]) { const l = spot(S.scene, [x, 8, z], [0, 20, 0], '#fff2d0', 3000, .5, .5, false); flood.push(l); const lamp = new THREE.Mesh(new THREE.SphereGeometry(.6, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4d0').multiplyScalar(6) })); lamp.position.set(x, 8, z); S.scene.add(lamp); }
  // explosion elements (scaled for ~2 km cloud in metres -> use 1 unit = 1 m but cloud is huge)
  const fb = fireball(220); fb.position.set(0, 30, 0); fb.visible = false; S.scene.add(fb);
  const mush = mushroom({ H: 4000, tau: 9, n: 1600, hot: '#fff3d0', fire: '#ff8a2a', dark: '#5a3a30', light: '#e0b090', glow: '#ff6a20', base: '#b08a60' }); S.scene.add(mush); S.particles.push(mush);
  mush.userData.t = (lt) => lt - blastAt;
  const ring = shockRing('#ffe0b0'); ring.position.y = 3; S.scene.add(ring);
  const blastLight = new THREE.PointLight('#fff0d0', 0, 0, 2); blastLight.position.set(0, 300, 0); S.scene.add(blastLight);
  const hemi = S.L.hemi, sun = S.L.sun; const skyU = S.sky.material.uniforms;
  const baseMid = skyU.mid.value.clone(), baseTop = skyU.top.value.clone();
  S.update0 = (lt) => {
    const k = lt - blastAt; fb.visible = k > 0 && k < 7; if (k > 0) fb.userData.fbTick(k); fb.position.y = 200 + Math.max(0, k) * 120;
    tw.visible = k < .05; flood.forEach((l) => (l.visible = k < 0));
    const glow = k > 0 ? Math.exp(-k * .5) : 0; blastLight.intensity = glow * 4e7; blastLight.color.set(k < 1.5 ? '#fff4e0' : '#ff9a50');
    skyU.mid.value.copy(baseMid).lerp(new THREE.Color('#ff9a50'), clamp(glow * 1.2)); skyU.top.value.copy(baseTop).lerp(new THREE.Color('#5a3a5a'), clamp(glow));
    hemi.intensity = .12 + glow * 3; ring.userData.set(k > 0 ? Math.min(9000, k * 1400) : 0, k > 0 ? clamp(1 - k / 5) * .8 : 0);
  };
  S.grade = (lt) => { const k = lt - blastAt; return { bloom: k > 0 ? 1.4 : .9, bloomThreshold: k > 0 ? .7 : .5, flash: k > 0 && k < 1.2 ? 1 - k / 1.2 : 0, exposure: k > 0 ? 1.2 - clamp(k / 6) * .3 : 1, tint: k > 0 ? [1.1, .98, .88] : [.92, .98, 1.1], sat: k > 0 ? 1.1 : .85 }; };
  return Object.assign(S, { tower: tw, mushroom: mush });
}
export function trinitite() {
  const S = stage({ sky: { top: '#2a3a5a', mid: '#e8a070', bot: '#3a2a20', sun: [1, .15, .2], sunCol: '#ffb070' }, light: { sun: [10, 4, 3], sunCol: '#ffc080', sunI: 2.4, hemiI: .4, area: 6 } });
  terrain(S.scene, { size: 60, seg: 120, height: (x, z) => fbm(x / 3, z / 3) * .35 - Math.max(0, 6 - Math.hypot(x, z + 4)) * .1, color: (x, z) => C('#a07a52').lerp(C('#5a6a3a'), clamp(1 - Math.hypot(x, z) / 9)) });
  const r = rng(6); const gm = [M('#5fae6a', { rough: .08, metal: .3, emissive: '#2a6a3a', ei: .3 }), M('#3f8a5a', { rough: .1, metal: .3 }), M('#7fca7a', { rough: .05, metal: .2, transparent: true, opacity: .85 })];
  for (let i = 0; i < 420; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(.03 + r() * .08, 0), r.pick(gm)); s.position.set((r() - .5) * 6, .05, (r() - .5) * 6); s.scale.y = .35; s.rotation.set(r() * 3, r() * 3, r() * 3); s.castShadow = true; S.scene.add(s); }
  S.grade = { tint: [1.02, 1.04, .95], sat: 1.15, bloom: .9 };
  return S;
}
export function bunker() {
  const S = stage({ sky: false, bg: '#020202', light: { sun: [0, 2, 10], sunCol: '#fff0d0', sunI: 0, hemiI: .08, shadow: false } });
  const cm = M('#5a5650', { rough: 1 });
  S.scene.add(P.box(10, .2, 8, cm, 0, -.1, 0)); S.scene.add(P.box(10, 3, .4, cm, 0, 1.5, -2)); S.scene.add(P.box(10, .4, 8, cm, 0, 3.1, 0));
  // viewing slit
  const slit = new THREE.Mesh(new THREE.PlaneGeometry(3, .35), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4dc').multiplyScalar(1) })); slit.position.set(0, 1.75, -1.79); S.scene.add(slit);
  S.scene.add(P.box(10, 1.55, .4, cm, 0, .78, -1.8)); S.scene.add(P.box(10, 1.2, .4, cm, 0, 2.55, -1.8));
  const opp = CAST.oppenheimer(); opp.position.set(-.3, 0, -1.1); opp.rotation.y = Math.PI; opp.pose({ armL: [.5, .2], elbowL: 1.6, head: [-.05, 0, 0] }); S.scene.add(opp);
  const men = [CAST.scientist(), CAST.groves()]; men[0].position.set(.9, 0, -1.2); men[0].rotation.y = Math.PI; men[1].position.set(-1.4, 0, -1.0); men[1].rotation.y = Math.PI + .2; men.forEach((m) => S.scene.add(m));
  const light = new THREE.SpotLight('#fff2d8', 0, 20, .35, .5, 1.5); light.position.set(0, 1.75, -2.5); light.target.position.set(0, 1, 3); light.castShadow = true; light.shadow.mapSize.set(1024, 1024); S.scene.add(light, light.target);
  const dust = motes(200, { box: [6, 3, 4], center: [0, 1.5, 0], col: '#fff0d0', size: .015, speed: [.02, .01, .02], alpha: .8 }); S.scene.add(dust); S.particles.push(dust);
  S.setFlash = (k) => { light.intensity = k * 500; slit.material.color.set('#fff4dc').multiplyScalar(.3 + k * 2.2); };
  S.grade = { bloom: .7, bloomThreshold: .8, sat: .8, contrast: 1.2, vignette: .7 };
  return Object.assign(S, { opp });
}

// ---------- open ocean + cruiser ----------
export function cruiserSea({ dawn = true } = {}) {
  const S = stage({ sky: { top: '#2a4a7a', mid: dawn ? '#f0b480' : '#a8c8e0', bot: '#3a4a5a', sun: [-1, .1, .6], sunCol: '#ffc890', sunGlow: .45 }, light: { sun: [-400, 120, 300], sunCol: '#ffd0a0', sunI: 3, hemiI: .6, area: 160, mapSize: 2048 }, far: 12000, near: 1 });
  S.scene.fog = new THREE.Fog('#c8a890', 800, 6000);
  const w = water(S.scene, { color: '#1d4a62', rough: .08, repeat: 80 });
  const ship = cruiser(); S.scene.add(ship);
  const wake = new Particles(500, { map: softDot(), shade: 0, sort: false }); const r = rng(3); const D = []; for (let i = 0; i < 500; i++) D.push([r(), r(), r()]);
  wake.fn = (i, t, o) => { const d = D[i]; const ph = (d[0] + t * .25) % 1; const side = d[1] < .5 ? -1 : 1; o.z = ship.position.z + 85 - ph * 400; o.x = ship.position.x + side * (8 + ph * 60 * d[2]); o.y = .5; o.s = 6 + ph * 12; o.r = o.g = o.b = 1; o.a = (1 - ph) * .55; o.z = ship.position.z - (90 - ph * -10) - ph * 380 + 180; };
  S.scene.add(wake); S.particles.push(wake);
  S.update0 = (lt) => { ship.position.z = lt * 14; ship.rotation.z = Math.sin(lt * .6) * .012; ship.rotation.x = Math.sin(lt * .4) * .008; };
  S.grade = { tint: [1.05, 1, .95], sat: 1.1, bloom: .6 };
  return Object.assign(S, { ship });
}

// ---------- Tinian island & North Field ----------
export function tinian({ night = false, planes = 14 } = {}) {
  const S = stage({ sky: night ? { top: '#02040a', mid: '#0c1424', bot: '#05070a', stars: 1.2, sunGlow: 0 } : { top: '#2f6fb0', mid: '#cfe6f2', bot: '#6a8aa0', sun: [.5, .8, .3], sunCol: '#fff4e0' }, light: { sun: [600, 1200, 400], sunCol: night ? '#6a80b0' : '#fff2dc', sunI: night ? .25 : 3.3, hemiI: night ? .12 : .8, area: 1600, mapSize: 4096 }, far: 30000, near: 2 });
  S.scene.fog = new THREE.Fog(night ? '#05080e' : '#bfd8e4', 3000, 22000);
  water(S.scene, { color: night ? '#06121c' : '#1a6a8a', repeat: 200, size: 60000, y: -2 });
  const isl = (x, z) => { const nx = x / 5200, nz = z / 9000; const d = Math.hypot(nx, nz); return d < 1 ? (1 - d) * 50 * (.6 + fbm(x / 1500, z / 1500) * .7) + 2 : -20; };
  terrain(S.scene, { size: 24000, seg: 220, height: isl, color: (x, z, h) => h < 0 ? C('#4ab0b8') : h < 5 ? C('#e8dcb0') : C('#5a7a3a').lerp(C('#8a8a5a'), fbm(x / 300, z / 300)).lerp(C('#3a5a2a'), clamp((fbm(x / 90, z / 90) - .5) * 2)) });
  // four parallel runways (North Field)
  const rw = M('#c9c4b8', { rough: .9 }); for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(2600, 60), rw); r.rotation.x = -Math.PI / 2; r.position.set(-200, isl(-200, -5200 + i * 300) + .6, -5200 + i * 300); r.receiveShadow = true; S.scene.add(r); }
  const r = rng(12); const fleet = [];
  for (let i = 0; i < planes; i++) { const b = b29({ name: '', tail: 'R', tailNum: String(70 + i), bare: i % 3 === 0 }); b.position.set(-1200 + (i % 7) * 120, isl(0, -5000) + 4, -5050 + Math.floor(i / 7) * 480); b.rotation.y = -Math.PI / 2; b.userData.spin(0, 'off'); S.scene.add(b); fleet.push(b); }
  S.grade = night ? { tint: [.9, .97, 1.1], sat: .9, bloom: .9 } : { sat: 1.12, bloom: .5 };
  return Object.assign(S, { fleet, h: isl });
}

// ---------- assembly hut (Little Boy on cradle) ----------
export function assemblyHut({ bomb = 'lb' } = {}) {
  const S = stage({ sky: false, bg: '#0a0b0c', light: { sun: [3, 10, 4], sunCol: '#e0ecff', sunI: .6, hemiI: .3, area: 10 } });
  const q = B.quonset({ L: 24, R: 6 }); q.rotation.y = Math.PI / 2; S.scene.add(q);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(13, 26), M('#6a6a66', { rough: .85 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; S.scene.add(fl);
  const b = bomb === 'lb' ? littleBoy() : fatMan(); b.position.set(0, 1.1, 0); b.rotation.y = .5; S.scene.add(b);
  const cradle = new THREE.Group(); for (const z of [-.8, .8]) { cradle.add(P.box(1, .1, .15, M('#2a2a2a'), 0, .55, z)); for (const x of [-.4, .4]) cradle.add(P.box(.08, .55, .08, M('#2a2a2a'), x, .27, z)); } cradle.rotation.y = .5; S.scene.add(cradle);
  const techs = []; [[-1.7, .9, 1.9], [1.7, -1.4, -.9], [-1.3, -2.3, .4]].forEach(([x, z, ry], i) => { const t = CAST.tech(); t.position.set(x, 0, z); t.rotation.y = ry; t.pose(i === 0 ? { armR: [1.2, .1], elbowR: .6, armL: [.9, .2], elbowL: .8, spine: .3, head: [.3, 0, 0] } : POSE.hold); S.scene.add(t); techs.push(t); });
  for (const z of [-6, 0, 6]) { const l = new THREE.PointLight('#e8f0ff', 18, 14, 2); l.position.set(0, 5, z); l.castShadow = z === 0; S.scene.add(l); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff').multiplyScalar(5) })); bulb.position.copy(l.position); S.scene.add(bulb); }
  for (let i = 0; i < 4; i++) { const c = P.crate(.9, .6, .7, i === 0 ? 'L-11' : null); c.position.set(-4 + i * .1, 0, -6 + i * 1.2); S.scene.add(c); }
  const fan = P.cyl(.5, .5, .1, M('#3a3a3a', { metal: .6, rough: .4 }), 4, 2.2, 4); fan.rotation.z = Math.PI / 2; S.scene.add(fan);
  S.grade = { tint: [.95, 1, 1.06], sat: .95, bloom: .5 };
  return Object.assign(S, { bomb: b, techs });
}

// ---------- B-29 in the sky (generic, configurable) ----------
export function skyFlight({ name = 'ENOLA GAY', tail = 'R', tailNum = '82', tod = 'dawn', clouds = true, cloudY = -900, sea = true, tailShape = 'circle', bombVisible = false, bomb = 'lb' } = {}) {
  const skies = { dawn: { top: '#203a6a', mid: '#ffb27a', bot: '#5a6a8a', sun: [1, .08, .4], sunCol: '#ffc890', sunGlow: .55 }, day: { top: '#2a62aa', mid: '#bcdcf0', bot: '#7a9ab8', sun: [.4, .7, .4], sunCol: '#fff6e8' }, morning: { top: '#2f6fb8', mid: '#d6e6f0', bot: '#8aa6c0', sun: [.8, .35, .3], sunCol: '#fff0d8' }, night: { top: '#02040a', mid: '#0a1222', bot: '#04060a', stars: 1.2, sunGlow: 0 }, storm: { top: '#3a4048', mid: '#8a9098', bot: '#5a6068', sunGlow: 0 } };
  const lightPos = { dawn: [800, 200, 300], day: [300, 900, 300], morning: [800, 500, 300], night: [-300, 600, -200], storm: [200, 800, 200] }[tod];
  const S = stage({ sky: skies[tod], light: { sun: lightPos, sunCol: skies[tod].sunCol || '#9ab0d0', sunI: tod === 'night' ? .4 : tod === 'storm' ? 1.4 : 3.2, hemiI: tod === 'night' ? .15 : .7, area: 40, mapSize: 2048 }, far: 30000, near: .5 });
  const plane = b29({ name, tail, tailNum, tailShape }); S.scene.add(plane); if (tod === 'night') plane.userData.exhaust(true);
  if (bombVisible) { const b = bomb === 'lb' ? littleBoy() : fatMan(); plane.userData.bombMount.add(b); plane.userData.bomb = b; }
  if (clouds) { const cl = cloudLayer(420, { y: cloudY, area: 9000, thick: 120, size: [260, 560], col: tod === 'night' ? '#4a5a7a' : tod === 'dawn' ? '#ffe2c8' : '#ffffff', shadow: tod === 'dawn' ? '#8a7a9a' : tod === 'storm' ? '#5a6068' : '#9aa8c0', seed: 9 }); S.scene.add(cl); S.particles.push(cl); S.clouds = cl; }
  if (sea) { const w = water(S.scene, { y: cloudY - 6000, color: '#16405a', size: 200000, repeat: 400 }); }
  S.grade = tod === 'dawn' ? { tint: [1.06, .98, .94], sat: 1.08, bloom: .7 } : tod === 'night' ? { tint: [.9, .96, 1.1], bloom: .9 } : { sat: 1.05, bloom: .55 };
  return Object.assign(S, { plane });
}

// ---------- briefing hut ----------
export function briefing() {
  const S = stage({ sky: false, bg: '#050505', light: { sun: [0, 9, 4], sunCol: '#ffe8c0', sunI: .3, hemiI: .12, area: 10 } });
  const room = P.room({ w: 12, d: 14, h: 4, wall: '#5a5a48', wainscot: null, floor: M('#4a4038', { rough: .9 }), ceiling: false }); S.scene.add(room);
  // wall map of Japan with targets
  const c = canvas(1600, 1000), g = c.getContext('2d'); g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, 1600, 1000); g.strokeStyle = 'rgba(0,0,0,.15)'; for (let x = 0; x < 1600; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1000); g.stroke(); } for (let y = 0; y < 1000; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(1600, y); g.stroke(); }
  g.fillStyle = '#8a9a6a'; g.beginPath(); g.ellipse(900, 450, 520, 140, -.6, 0, 7); g.fill(); g.beginPath(); g.ellipse(430, 700, 170, 110, -.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(640, 640, 120, 60, -.3, 0, 7); g.fill();
  for (const [x, y, n] of [[520, 610, 'HIROSHIMA'], [360, 600, 'KOKURA'], [300, 760, 'NAGASAKI']]) { g.fillStyle = '#b3202a'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); g.font = '700 34px "JetBrains Mono"'; g.fillStyle = '#111'; g.fillText(n, x + 22, y + 10); }
  g.strokeStyle = '#b3202a'; g.lineWidth = 6; g.setLineDash([20, 14]); g.beginPath(); g.moveTo(1500, 980); g.lineTo(520, 610); g.stroke();
  const mp = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .9 })); mp.position.set(0, 2.1, -6.9); S.scene.add(mp);
  const screenL = spot(S.scene, [0, 3.5, -2], [0, 2, -7], '#fff0d0', 45, .55, .4, true);
  const crew = []; const r = rng(2);
  for (let row = 0; row < 4; row++) { const bench = P.box(6, .45, .4, M('#5a3a20'), 0, .23, -2 + row * 1.6); S.scene.add(bench); for (let k = 0; k < 6; k++) { const p = r() < .5 ? CAST.pilot() : CAST.flyer(); p.position.set(-2.5 + k + (r() - .5) * .2, 0, -1.8 + row * 1.6); p.rotation.y = Math.PI; p.pose({ sit: true, seat: .45, armL: [.5, .2], armR: [.5, .2], elbowL: 1.2, elbowR: 1.2, head: [-.05 + r() * .1, (r() - .5) * .3, 0] }); S.scene.add(p); crew.push(p); } }
  const off = CAST.groves(); off.position.set(-2.8, 0, -6.2); off.pose(POSE.point); off.rotation.y = .5; S.scene.add(off);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.4, 9, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#fff0d0', transparent: true, opacity: .025, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); beam.rotation.x = Math.PI / 2; beam.position.set(0, 2.6, -2.5); S.scene.add(beam);
  const smk = motes(300, { box: [8, 3, 10], center: [0, 2.6, -2], col: '#d8d0c0', size: .2, speed: [.05, .02, 0], additive: true, alpha: .04, flicker: false, map: null }); S.scene.add(smk); S.particles.push(smk);
  S.grade = { tint: [1.04, 1, .92], sat: .85, contrast: 1.12, bloom: .45, bloomThreshold: .85, vignette: .7 };
  return Object.assign(S, { crew });
}

// ---------- night loading pit ----------
export function loadingPit() {
  const S = stage({ sky: { top: '#02040a', mid: '#0b1422', bot: '#04060a', stars: 1.3, sunGlow: 0 }, light: { sun: [-100, 200, -60], sunCol: '#5a70a0', sunI: .25, hemiI: .1, area: 40 }, near: .3, far: 4000 });
  S.scene.fog = new THREE.Fog('#0a1018', 40, 400);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), M('#3a3e40', { rough: .85 })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; S.scene.add(gr);
  const pit = B.bombPit(); S.scene.add(pit);
  const lb = littleBoy(); lb.position.set(0, -1.6, 0); S.scene.add(lb);
  const plane = b29(); plane.position.set(0, 3.4, -3.2); plane.rotation.y = Math.PI; plane.userData.openDoors(1); S.scene.add(plane);
  for (const [x, z] of [[14, 10], [-16, 8], [10, -20]]) { const l = spot(S.scene, [x, 9, z], [0, 1, 0], '#fff4dc', 700, .45, .5, true); const lamp = new THREE.Mesh(new THREE.BoxGeometry(1, .8, .6), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff8e0').multiplyScalar(1.6) })); lamp.position.set(x, 9, z); lamp.lookAt(0, 1, 0); S.scene.add(lamp); S.scene.add(P.cyl(.1, .1, 9, M('#333'), x, 4.5, z)); }
  const crew = []; [[3, 2, -.4], [-3, 1.5, .5], [2.5, -2, -2.5], [-4, -3, 2]].forEach(([x, z, ry], i) => { const p = i % 2 ? CAST.gi() : CAST.tech(); p.position.set(x, 0, z); p.rotation.y = ry; p.pose(i === 0 ? POSE.point : POSE.hold); S.scene.add(p); crew.push(p); });
  const haze = motes(500, { box: [60, 15, 60], center: [0, 6, 0], col: '#c8d8f0', size: .35, speed: [.3, .05, 0], additive: true, alpha: .07, flicker: false }); S.scene.add(haze); S.particles.push(haze);
  S.grade = { tint: [.92, .98, 1.12], sat: .9, contrast: 1.12, bloom: .6, bloomThreshold: .85 };
  return Object.assign(S, { pit, bomb: lb, plane });
}
