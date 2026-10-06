// 3D sets, part 4: aftermath, Tokyo, Nagasaki, surrender, occupation, hospital, Cold War, today, memorial.
import * as THREE from 'three';
import { stage, look } from './common.js';
import { M, MAT } from '../kit/materials.js';
import { CAST, POSE, person, walk, setPose } from '../kit/people.js';
import * as P from '../kit/props.js';
import * as B from '../kit/buildings.js';
import { b29, fighter } from '../kit/aircraft.js';
import { fatMan } from '../kit/bombs.js';
import { tank, jeep, truck, shinkansen, cruiser, landingShip, icbm, warhead } from '../kit/vehicles.js';
import { ground, terrain, water, point, spot, C } from '../kit/env.js';
import { buildHiroshima, buildNagasaki, NAGA } from '../kit/city.js';
import { motes, smoke, fire, mushroom, fireball, shockRing, domeShock, cloudLayer, Particles, rain } from '../kit/fx.js';
import { canvas, tex, softDot, concreteTex, paperTex } from '../core/textures.js';
import { rng, clamp, fbm, lerp, smooth, easeOut, expoOut } from '../core/math.js';

// ---------- burning Hiroshima from the air ----------
export function inferno({ dark = .6 } = {}) {
  const S = stage({ sky: { top: '#140a08', mid: '#7a2a14', bot: '#1a0c08', sun: [0, .1, -1], sunCol: '#ff5a1a', sunGlow: .2 }, light: { sun: [-800, 900, -400], sunCol: '#ff7a3a', sunI: .9, hemiI: .3, hemiTop: '#6a2a1a', area: 2600, mapSize: 2048 }, far: 40000, near: 10 });
  S.scene.fog = new THREE.Fog('#3a1a10', 1500, 9000);
  const city = buildHiroshima(S.scene, { ruined: true, houses: 6000, texPx: 1536 }); S.city = city;
  const spots = city.fireSpots(320, 2100, 5); const fi = fire(spots, { per: 5, height: 3.5, rate: .8, intensity: 2.8 }); S.scene.add(fi); S.particles.push(fi); S.fire = fi;
  for (let i = 0; i < 12; i++) { const p = spots[i * 20]; if (!p) continue; const l = new THREE.PointLight('#ff6a20', 120000, 900, 2); l.position.set(p[0], 60, p[2]); S.scene.add(l); }
  const sm = smoke(spots.filter((_, i) => i % 4 === 0).map(([x, y, z]) => [x, 30, z, 14]), { col: '#1a100c', col2: '#5a2a1a', alpha: .6, rise: 80, spread: 9, drift: [-2, 1], rate: .08 }); S.scene.add(sm); S.particles.push(sm);
  const emb = motes(600, { box: [4000, 800, 4000], center: [0, 400, 0], col: '#ff9a40', size: 4, speed: [0, 30, 0] }); S.scene.add(emb); S.particles.push(emb);
  S.L.hemi.intensity = .55; S.grade = { tint: [1.15, .9, .8], sat: 1.1, contrast: 1.1, bloom: .9, bloomThreshold: .65, exposure: 1.25 };
  return S;
}

// ---------- Imperial HQ war room, Tokyo ----------
export function warRoom({ council = false } = {}) {
  const S = stage({ sky: false, bg: '#050403', light: { sun: [0, 8, 2], sunCol: '#ffe0b0', sunI: .3, hemiI: .12, area: 6 } });
  const room = P.room({ w: 10, d: 9, h: 3.2, wall: council ? '#3a3228' : '#4a4436', wainscot: '#2a1c12', ceiling: true }); S.scene.add(room);
  const tbl = P.box(council ? 5.2 : 3.4, .08, council ? 1.4 : 2, M('#3a2414', { rough: .35 }), 0, .78, 0); S.scene.add(tbl);
  for (const [x, z] of [[-1.5, -.5], [1.5, -.5], [-1.5, .5], [1.5, .5]]) S.scene.add(P.box(.1, .78, .1, M('#2a1a10'), x * (council ? 1.6 : 1), .39, z * (council ? .6 : .9)));
  if (!council) { const c = canvas(1024, 700), g = c.getContext('2d'); g.fillStyle = '#d6cba8'; g.fillRect(0, 0, 1024, 700); g.fillStyle = '#9aa878'; g.beginPath(); g.ellipse(560, 330, 330, 90, -.6, 0, 7); g.fill(); g.beginPath(); g.ellipse(260, 520, 110, 70, -.2, 0, 7); g.fill(); g.fillStyle = '#b3202a'; g.beginPath(); g.arc(330, 470, 12, 0, 7); g.fill(); g.font = '700 30px "Noto Serif JP"'; g.fillStyle = '#111'; g.fillText('広島 ?', 350, 470);
    const mp = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.7), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .9 })); mp.rotation.x = -Math.PI / 2; mp.position.y = .825; S.scene.add(mp); }
  const men = []; const seats = council ? [[-2, -.95, 0], [-.7, -.95, 0], [.7, -.95, 0], [-2, .95, Math.PI], [-.7, .95, Math.PI], [.7, .95, Math.PI]] : [[-1.2, -1.4, 0], [0, -1.5, 0], [1.2, -1.4, 0], [-1.2, 1.4, Math.PI], [1.2, 1.4, Math.PI]];
  seats.forEach(([x, z, ry], i) => { const p = i % 2 ? CAST.jpOfficer() : CAST.jpMinister(); p.position.set(x, 0, z); p.rotation.y = ry; p.pose(council ? { sit: true, seat: .48, armL: [.9, .1], armR: [.9, .1], elbowL: .8, elbowR: .8, head: [.25, 0, 0] } : { armL: [.6, .1], armR: [.8, .1], elbowR: .4, spine: .2, head: [.4, 0, 0] }); S.scene.add(p); men.push(p); });
  if (council) { const emp = CAST.emperor(); emp.position.set(2.75, 0, 0); emp.rotation.y = -Math.PI / 2; emp.pose({ sit: true, seat: .5, armL: [.7, .1], armR: [.7, .1], elbowL: 1, elbowR: 1 }); S.scene.add(emp); S.emperor = emp; const scr = P.box(.05, 2.2, 2.4, M('#b08a3a', { rough: .3, metal: .6 }), 4.9, 1.1, 0); S.scene.add(scr); }
  const ph = P.phone(); ph.position.set(-1.2, .82, .4); S.scene.add(ph);
  const lamp = new THREE.SpotLight('#ffd9a0', 22, 0, .9, .6, 2); lamp.position.set(0, 3, 0); lamp.target.position.set(0, .8, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); S.scene.add(lamp, lamp.target);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe0a0').multiplyScalar(4) })); bulb.position.set(0, 2.9, 0); S.scene.add(bulb);
  const smk = smoke([[.9, 1.2, .3, .05], [-1.4, 1.3, -1, .05]], { col: '#8a8078', col2: '#c0b8b0', alpha: .22, rise: 30, spread: 20, rate: .08 }); S.scene.add(smk); S.particles.push(smk);
  S.grade = { tint: [1.06, 1, .9], sat: .8, contrast: 1.12, bloom: .5, vignette: .72 };
  return Object.assign(S, { men });
}

// ---------- recon plane approaching a gigantic smoke column ----------
export function reconToSmoke() {
  const S = stage({ sky: { top: '#3a4a60', mid: '#c8b8a0', bot: '#6a6a6a', sun: [.6, .4, .3], sunCol: '#ffe8c8' }, light: { sun: [800, 900, 400], sunCol: '#ffe8c8', sunI: 2.6, hemiI: .6, area: 40 }, far: 400000, near: .5 });
  S.scene.fog = new THREE.Fog('#b0a898', 30000, 180000);
  terrain(S.scene, { size: 400000, seg: 160, height: (x, z) => fbm(x / 20000, z / 20000) * 2500 - 2600, color: (x, z, h) => C('#4a6a3a').lerp(C('#6a7a4a'), fbm(x / 9000, z / 9000)) }).position.y = -1000;
  water(S.scene, { y: -3200, color: '#2a4a5a', size: 800000, repeat: 1000 });
  const col = smoke([[0, -2000, -60000, 1]], { per: 260, rate: .02, rise: 15000, spread: 4500, col: '#3a302c', col2: '#8a7a70', alpha: .85, drift: [0, 0] }); S.scene.add(col); S.particles.push(col);
  const pl = fighter({ color: '#6a6a50' }); S.scene.add(pl); S.plane = pl;
  S.grade = { sat: .85, tint: [1.02, 1, .96], bloom: .5 };
  return S;
}

// ---------- Truman at the radio microphone ----------
export function radioAddress() {
  const S = stage({ sky: false, bg: '#060504', light: { sun: [2, 5, 4], sunCol: '#ffe2b8', sunI: 1, hemiI: .2, area: 4 } });
  const room = P.room({ w: 6, d: 5, h: 3, wall: '#5a4a38', wainscot: '#3a2416', ceiling: false }); S.scene.add(room);
  const desk = P.desk({ w: 1.8 }); desk.position.set(0, 0, -1); S.scene.add(desk);
  const tr = CAST.truman(); tr.position.set(0, 0, -1.75); tr.pose({ sit: true, armL: [.9, .2], armR: [.9, .2], elbowL: .7, elbowR: .7, head: [.1, 0, 0] }); S.scene.add(tr);
  const mic = P.microphone(); mic.position.set(0, .79, -.85); S.scene.add(mic);
  const f = P.flag('us'); f.position.set(-1.5, 0, -2.2); S.scene.add(f);
  const paper = P.paper(['STATEMENT BY THE PRESIDENT', '', 'Sixteen hours ago an American', 'airplane dropped one bomb on', 'Hiroshima...'], { title: null }); paper.position.set(-.3, .8, -.95); S.scene.add(paper);
  point(S.scene, [0, 2, .5], '#ffe0c0', 5, 6);
  S.grade = { tint: [1.04, 1, .9], sat: .85, bloom: .5, vignette: .65 };
  return Object.assign(S, { mic });
}

// ---------- Soviet offensive in Manchuria ----------
export function sovietTanks() {
  const S = stage({ sky: { top: '#2a2a40', mid: '#e07a4a', bot: '#4a3a30', sun: [1, .06, .2], sunCol: '#ff9a5a', sunGlow: .55 }, light: { sun: [600, 80, 150], sunCol: '#ffa060', sunI: 3, hemiI: .5, area: 80 }, far: 9000, near: .5 });
  S.scene.fog = new THREE.Fog('#c08a6a', 150, 2000);
  terrain(S.scene, { size: 6000, seg: 160, height: (x, z) => fbm(x / 300, z / 300) * 14, color: (x, z) => C('#8a7a4a').lerp(C('#6a6a3a'), fbm(x / 60, z / 60)) });
  const tanks = []; for (let i = 0; i < 14; i++) { const t = tank(); t.position.set((i % 3) * 14 - 14, 0, -i * 22); S.scene.add(t); tanks.push(t); }
  const dust = smoke(tanks.map((t) => [t.position.x, 1, t.position.z - 4, 1]), { per: 8, col: '#b09070', col2: '#d8c0a0', alpha: .4, rise: 6, spread: 6, drift: [0, -6], rate: .3 }); S.scene.add(dust); S.particles.push(dust);
  S.update0 = (lt) => { tanks.forEach((t, i) => { t.position.z = -i * 22 + lt * 9; t.position.y = fbm(t.position.x / 300, t.position.z / 300) * 14 + .1; }); dust.position.z = lt * 9; };
  S.grade = { tint: [1.08, .97, .9], sat: 1.05, bloom: .6 };
  return Object.assign(S, { tanks });
}

// ---------- Nagasaki valley ----------
export function nagasaki({ ruined = false, clouds = true, gap = 0 } = {}) {
  const S = stage({ sky: { top: '#3a5a80', mid: '#c8d4dc', bot: '#7a8a98', sun: [.4, .7, .4], sunCol: '#fff0d8' }, light: { sun: [700, 1300, 900], sunCol: '#fff0d8', sunI: 3, hemiI: .7, area: 3200, mapSize: 4096 }, far: 60000, near: 10 });
  S.scene.fog = new THREE.Fog('#b8c6d0', 5000, 24000);
  const city = buildNagasaki(S.scene, { ruined }); S.city = city;
  if (clouds) { const cl = cloudLayer(500, { y: 2600, area: 14000, thick: 300, size: [600, 1300], seed: 14, holes: gap, col: '#f4f6f8', shadow: '#8a96a8' }); S.scene.add(cl); S.particles.push(cl); S.clouds = cl; }
  const burst = [NAGA.hypo[0], 500, NAGA.hypo[1]];
  const fb = fireball(170); fb.position.set(...burst); fb.visible = false; S.scene.add(fb);
  const mush = mushroom({ n: 1700, H: 5000, tau: 10, hot: '#fff3dc', fire: '#ff8a3a', dark: '#5a4a44', light: '#c8b4a4', glow: '#ff5a1a', base: '#8a7060' }); mush.position.set(burst[0], 0, burst[2]); S.scene.add(mush); S.particles.push(mush);
  const L = new THREE.PointLight('#fff0d0', 0, 0, 2); L.position.set(...burst); S.scene.add(L);
  const spots = city.fireSpots(160, 1500, 3); const fi = fire(spots, { per: 5, height: 3.4, intensity: 2.6, start: (e) => S.blastAt + 1 + Math.hypot(e[0] - burst[0], e[2] - burst[2]) / 1500 }); S.scene.add(fi); S.particles.push(fi);
  S.blastAt = 999;
  S.update0 = (lt) => { const k = lt - S.blastAt; const on = k > 0; fb.visible = on && k < 9; if (on) fb.userData.fbTick(k); fb.position.y = burst[1] + Math.max(0, k) * 60; mush.userData.t = () => k; L.intensity = on ? Math.exp(-k * .9) * 5e6 : 0; if (!ruined) city.apply(on ? Math.min(2400, k * 340 + 200) : -1, on ? clamp(k / 2) : 0); };
  S.grade = (lt) => { const k = lt - S.blastAt; return k > 0 ? { flash: k < .9 ? 1 - k / .9 : 0, bloom: 1.2, bloomThreshold: .65, exposure: 1.2 - clamp(k / 8) * .3, tint: [1.08, .98, .94] } : { sat: 1.05, bloom: .45 }; };
  return S;
}

// ---------- family around a radio (Gyokuon-hōsō) ----------
export function radioFamily() {
  const S = stage({ sky: false, bg: '#040302', light: { sun: [2, 6, 3], sunCol: '#ffd8a0', sunI: .4, hemiI: .15, area: 4 } });
  const tat = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ map: (() => { const c = canvas(512, 512), g = c.getContext('2d'); g.fillStyle = '#b8a870'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#3a2a1a'; g.lineWidth = 8; for (const [x, y, w, h] of [[0, 0, 256, 512], [256, 0, 256, 256], [256, 256, 256, 256]]) g.strokeRect(x, y, w, h); for (let i = 0; i < 512; i += 6) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, i, 512, 2); } return tex(c); })(), roughness: .9 }));
  tat.rotation.x = -Math.PI / 2; S.scene.add(tat);
  const shoji = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.6), new THREE.MeshBasicMaterial({ map: (() => { const c = canvas(512, 256), g = c.getContext('2d'); g.fillStyle = '#f2e8d0'; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#3a2416'; g.lineWidth = 5; for (let x = 0; x <= 512; x += 42) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); } for (let y = 0; y <= 256; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); } return tex(c); })(), color: new THREE.Color('#ffffff').multiplyScalar(.9) }));
  shoji.position.set(0, 1.3, -2.4); S.scene.add(shoji);
  const rad = P.radio(); rad.position.set(0, .3, -1.4); S.scene.add(rad); S.scene.add(P.box(.8, .3, .5, M('#3a2416', { rough: .5 }), 0, .15, -1.4));
  const fam = []; [[-1, -.2, .5, 'jpCivil'], [1, -.3, -.5, 'jpWoman'], [-.4, .5, .1, 'student'], [.5, .6, -.2, 'jpWoman'], [0, 1.2, 0, 'jpCivil']].forEach(([x, z, ry, k], i) => { const p = CAST[k](i + 2); p.position.set(x, 0, z); p.rotation.y = Math.PI + ry; p.pose({ sit: true, seat: .25, legL: 1.4, legR: 1.4, kneeL: 2.5, kneeR: 2.5, armL: [.4, .1], armR: [.4, .1], elbowL: 1.2, elbowR: 1.2, head: [.45, 0, 0], spine: .2 }); p.userData.rig.legL.hp.rotation.x = -.2; p.userData.rig.legR.hp.rotation.x = -.2; p.userData.rig.legL.kn.rotation.x = 2.6; p.userData.rig.legR.kn.rotation.x = 2.6; p.userData.rig.hips.position.y = .3; S.scene.add(p); fam.push(p); });
  const glow = new THREE.PointLight('#ffb050', 4, 4, 2); glow.position.set(0, .7, -1.1); S.scene.add(glow);
  const hang = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd090').multiplyScalar(3) })); hang.position.set(0, 2.2, 0); S.scene.add(hang); point(S.scene, [0, 2.1, 0], '#ffc070', 5, 6, true);
  S.grade = { tint: [1.08, 1, .86], sat: .85, bloom: .6, vignette: .72 };
  return Object.assign(S, { fam, radio: rad });
}

// ---------- crowds: weeping (Tokyo) or cheering (NY/London/Moscow) ----------
export function crowd({ mood = 'cheer', n = 60, city = 'west' } = {}) {
  const day = mood === 'cheer';
  const S = stage({ sky: day ? { top: '#3a6aa0', mid: '#d8e4ea', bot: '#8a9aa8', sun: [.5, .7, .3] } : { top: '#3a3a40', mid: '#8a8a88', bot: '#5a5a58', sunGlow: 0 }, light: { sun: [30, 60, 30], sunCol: day ? '#fff0d8' : '#c8c8c0', sunI: day ? 3 : 1.4, hemiI: .7, area: 40 }, near: .2, far: 3000 });
  S.scene.fog = new THREE.Fog(day ? '#c8d4dc' : '#7a7a78', 60, 400);
  ground(S.scene, { color: day ? '#8a8a88' : '#6a645c', size: 800 });
  const r = rng(5);
  if (city === 'west') for (let i = 0; i < 20; i++) { const b = B.concreteBlock(14 + r() * 10, 30 + r() * 60, 14, { col: r.pick(['#b8a890', '#9a8a78', '#c8bca8', '#8a7a6a']), seed: i }); b.position.set((i % 2 ? 1 : -1) * (22 + r() * 6), 0, -i * 16 + 40); b.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2; S.scene.add(b); }
  else { const pal = B.concreteBlock(80, 14, 30, { col: '#6a6458', windows: false }); pal.position.set(0, 0, -60); S.scene.add(pal); for (let i = 0; i < 12; i++) { const tr = new THREE.Mesh(new THREE.ConeGeometry(2.4, 8, 7), M('#2f4a2a', { rough: .9 })); tr.position.set(-40 + i * 7, 4, -40); S.scene.add(tr); } }
  const ppl = []; for (let i = 0; i < n; i++) { const p = city === 'west' ? (r() < .3 ? CAST.sailor() : r() < .5 ? CAST.journalist() : CAST.gi()) : (r() < .5 ? CAST.jpCivil(i) : CAST.jpWoman(i)); p.position.set((r() - .5) * 26, 0, (r() - .5) * 40); p.rotation.y = day ? Math.PI + (r() - .5) * 1.5 : (r() - .5) * .6 + Math.PI; p.userData.ph = r() * 6; S.scene.add(p); ppl.push(p); }
  if (day) { const conf = new Particles(700, { map: softDot(), shade: 0, sort: false }); const cols = ['#ffffff', '#ffd23a', '#ff4a4a', '#4a8aff'].map((c) => new THREE.Color(c)); const D = []; for (let i = 0; i < 700; i++) D.push([r(), r(), r(), r(), r()]);
    conf.fn = (i, t, o) => { const d = D[i]; o.x = (d[0] - .5) * 50 + Math.sin(t * 2 + d[3] * 9) * 1.5; o.z = (d[1] - .5) * 80; o.y = 40 - ((d[2] * 40 + t * (2 + d[3] * 2)) % 40); o.s = .25; const c = cols[Math.floor(d[4] * 4)]; o.r = c.r; o.g = c.g; o.b = c.b; o.a = 1; }; S.scene.add(conf); S.particles.push(conf); }
  S.update0 = (lt) => ppl.forEach((p, i) => { const ph = p.userData.ph; if (day) setPose(p, { ...POSE.cheer, armL: [2.6 + Math.sin(lt * 5 + ph) * .3, .4], armR: [2.6 + Math.cos(lt * 5 + ph) * .3, .4], drop: Math.abs(Math.sin(lt * 4 + ph)) * .06 }); else setPose(p, { ...POSE.mourn, head: [.6 + Math.sin(lt + ph) * .05, 0, 0] }); });
  S.grade = day ? { sat: 1.1, bloom: .5 } : { sat: .4, tint: [1, 1, 1.02], contrast: 1.1, bloom: .3 };
  return S;
}

// ---------- occupation: GIs, jeeps, journalists among ruins ----------
export function occupation() {
  const S = street({ ruined: true, people: 0 });
  return S;
}

// ---------- makeshift ward ----------
export function ward() {
  const S = stage({ sky: false, bg: '#040505', light: { sun: [3, 6, 2], sunCol: '#d8e8e0', sunI: .5, hemiI: .2, area: 6 } });
  const room = P.room({ w: 10, d: 8, h: 3.2, wall: '#6a6a60', wainscot: null, floor: M('#5a5048', { rough: .9 }), ceiling: false, windowSide: -1, windowCol: '#d8f0ff' }); S.scene.add(room);
  const pts = []; for (let i = 0; i < 8; i++) { const x = -3.5 + (i % 4) * 2.2, z = -2.2 + Math.floor(i / 4) * 2.6; const fut = P.box(1, .1, 2, M('#d8d2c4', { rough: 1 }), x, .05, z); S.scene.add(fut); const p = CAST.jpCivil(i); p.rotation.x = -Math.PI / 2; p.position.set(x, .2, z + .9); p.pose({ armL: [.2, .2], armR: [.2, .2] }); S.scene.add(p); pts.push(p); const bl = P.box(.95, .06, 1.2, M('#8a8070', { rough: 1 }), x, .2, z + .2); S.scene.add(bl); }
  const doc = CAST.doctor(); doc.position.set(-1.3, 0, -.9); doc.rotation.y = .3; doc.pose({ armL: [.8, .1], elbowL: .9, spine: .35, head: [.4, 0, 0] }); S.scene.add(doc);
  const nurse = CAST.jpWoman(2); nurse.position.set(1.8, 0, .4); nurse.rotation.y = -2; nurse.pose(POSE.hold); S.scene.add(nurse);
  point(S.scene, [0, 2.8, 0], '#e0f0e8', 8, 8, true);
  const dust = motes(200, { box: [8, 3, 6], center: [-2, 1.5, -1], col: '#e8f4ff', size: .015, speed: [.03, .02, 0], alpha: .6 }); S.scene.add(dust); S.particles.push(dust);
  S.grade = { tint: [.94, 1.04, 1], sat: .65, contrast: 1.1, bloom: .55, vignette: .7 };
  return Object.assign(S, { pts, doc });
}

// ---------- shacks among ruins (one year later) ----------
export function shanty() {
  const S = stage({ sky: { top: '#5a7a9a', mid: '#d8d0c0', bot: '#8a8070', sun: [.6, .5, .4], sunCol: '#fff0d8' }, light: { sun: [60, 50, 40], sunCol: '#fff0d8', sunI: 2.8, hemiI: .7, area: 50 }, near: .3, far: 5000 });
  S.scene.fog = new THREE.Fog('#c8c0b0', 80, 700);
  ground(S.scene, { color: '#6a5e50', size: 1200 });
  const r = rng(8); for (let i = 0; i < 40; i++) { const s = B.shack(i + 1); s.position.set((r() - .5) * 120, 0, -r() * 120 + 10); s.rotation.y = r() * .5; S.scene.add(s); }
  for (let i = 0; i < 30; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(2 + r() * 2, 1 + r(), 6), M('#4a4038', { rough: 1 })); p.position.set((r() - .5) * 160, .4, -r() * 160); S.scene.add(p); }
  const dome = B.promotionHall({ ruined: true }); dome.position.set(30, 0, -160); S.scene.add(dome);
  const ppl = []; for (let i = 0; i < 12; i++) { const p = r() < .5 ? CAST.jpCivil(i) : CAST.jpWoman(i); p.position.set((r() - .5) * 30, 0, -r() * 30); p.userData.w = { x: p.position.x, z0: p.position.z, d: r() < .5 ? 1 : -1, ph: r() * 9 }; S.scene.add(p); ppl.push(p); }
  S.update0 = (lt) => ppl.forEach((p) => { const w = p.userData.w; p.position.x = w.x + w.d * lt * .8; p.rotation.y = w.d > 0 ? Math.PI / 2 : -Math.PI / 2; walk(p, lt + w.ph, { speed: .8 }); });
  S.grade = { sat: .75, tint: [1.04, 1, .94], bloom: .4 };
  return S;
}

// ---------- Operation Crossroads (Baker shot) at Bikini ----------
export function bikini() {
  const S = stage({ sky: { top: '#2a6ab0', mid: '#cfe6f0', bot: '#6a9ab8', sun: [.4, .6, .5], sunCol: '#fff4e0' }, light: { sun: [800, 1000, 600], sunCol: '#fff2dc', sunI: 3.2, hemiI: .8, area: 1500 }, far: 40000, near: 2 });
  S.scene.fog = new THREE.Fog('#c8e0ec', 4000, 22000);
  water(S.scene, { color: '#1e7a9a', repeat: 300, size: 60000 });
  const atoll = new THREE.Mesh(new THREE.TorusGeometry(5000, 140, 6, 80), M('#e8dcb0', { rough: 1 })); atoll.rotation.x = Math.PI / 2; atoll.scale.z = .02; atoll.position.y = -1; S.scene.add(atoll);
  const r = rng(4); for (let i = 0; i < 40; i++) { const palm = new THREE.Mesh(new THREE.ConeGeometry(12, 30, 6), M('#3a6a3a', { rough: .9 })); const a = r() * 6.28; palm.position.set(Math.cos(a) * 5000, 14, Math.sin(a) * 5000); S.scene.add(palm); }
  for (let i = 0; i < 16; i++) { const s = i % 3 ? landingShip() : cruiser(); s.scale.setScalar(.8); s.position.set((r() - .5) * 2600, -1, (r() - .5) * 2600); s.rotation.y = r() * 6.28; S.scene.add(s); }
  // Baker: water column + Wilson condensation cloud
  const colm = new Particles(900, { map: TX_cloud(), shade: 1 }); const D = []; for (let i = 0; i < 900; i++) D.push([r(), r(), r(), r()]);
  const white = new THREE.Color('#f4f6f8'), grey = new THREE.Color('#9aa4ae');
  colm.fn = (i, t, o) => { if (t < 0) { o.a = 0; return; } const d = D[i]; const h = 1800 * (1 - Math.exp(-t / 2.2)); if (d[0] < .6) { const u = d[1]; const a = d[2] * 6.28; const rad = 300 + u * 120 + Math.max(0, t - 3) * 60 * u; o.x = Math.cos(a) * rad; o.z = Math.sin(a) * rad; o.y = u * h; o.s = 260 + u * 200; } else { const a = d[1] * 6.28; const rad = Math.min(4000, t * 500) * (.5 + d[2] * .6); o.x = Math.cos(a) * rad; o.z = Math.sin(a) * rad; o.y = 80 + d[3] * 300; o.s = 500 + d[3] * 400; } o.r = white.r; o.g = white.g; o.b = white.b; const c = grey.clone().lerp(white, d[3]); o.r = c.r; o.g = c.g; o.b = c.b; o.a = clamp(t * 2) * .95; o.rot = d[3] * 6; };
  S.scene.add(colm); S.particles.push(colm); S.colm = colm;
  S.grade = { sat: 1.1, bloom: .5 };
  return S;
}
import { cloudSprite } from '../core/textures.js';
const TX_cloud = () => cloudSprite(6);

// ---------- Hiroshima today: neon night + shinkansen ----------
export function modernCity({ train = true } = {}) {
  const S = stage({ sky: { top: '#05071a', mid: '#2a1a4a', bot: '#0a0a14', stars: .3, sunGlow: 0 }, light: { sun: [-100, 200, 100], sunCol: '#8a9ad0', sunI: .3, hemiI: .25, hemiTop: '#5a4a9a', area: 200 }, far: 8000, near: .3 });
  S.scene.fog = new THREE.Fog('#1a1430', 120, 1400);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: '#15161c', roughness: .25, metalness: .5 })); gr.rotation.x = -Math.PI / 2; S.scene.add(gr);
  const r = rng(3); const cols = ['#ff3b6b', '#3bd2ff', '#ffd23b', '#7a5bff', '#3bff9a'];
  for (let i = 0; i < 70; i++) { const w = 18 + r() * 24, h = 30 + r() * 140, d = 18 + r() * 20; const b = B.glassTower(w, h, d, { seed: i, lit: .45 + r() * .4 }); const side = i % 2 ? 1 : -1; b.position.set(side * (30 + r() * 60 + w / 2), 0, -i * 30 + 300); S.scene.add(b);
    if (r() < .55) { const vert = r() < .5; const s = B.neonSign(vert ? r.pick(['広島', 'カラオケ', '居酒屋', 'ラーメン']) : r.pick(['HIROSHIMA', 'CAFE', 'RAMEN', 'OPEN 24H', 'BAR']), { col: r.pick(cols), vertical: vert, jp: vert, w: vert ? 10 : 14, h: vert ? 2.6 : 4 }); s.position.set(b.position.x - side * (w / 2 + .3), 12 + r() * 20, b.position.z + (r() - .5) * d * .6); s.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; S.scene.add(s); const l = new THREE.PointLight(s.material.map ? '#ff6a9a' : '#fff', 0, 0); } }
  // elevated track + train
  S.scene.add(P.box(10, 1.2, 4000, M('#3a3c44', { rough: .5 }), 0, 9, 0)); for (let z = -1500; z < 1500; z += 40) S.scene.add(P.box(3, 9, 3, M('#2a2c34'), 0, 4.5, z));
  const tr = train ? shinkansen(6) : null; if (tr) { tr.position.y = 9.6; S.scene.add(tr); }
  const street = []; for (let i = 0; i < 40; i++) { const p = CAST.modern(i); p.position.set((r() < .5 ? -1 : 1) * (8 + r() * 10), 0, -r() * 300 + 100); p.userData.w = { d: r() < .5 ? 1 : -1, ph: r() * 9, z0: p.position.z }; S.scene.add(p); street.push(p); }
  const lights = []; for (let i = 0; i < 16; i++) { const l = new THREE.PointLight(cols[i % 5], 2000, 120, 2); l.position.set((i % 2 ? 1 : -1) * 25, 14, -i * 60 + 200); S.scene.add(l); }
  S.update0 = (lt) => { if (tr) tr.position.z = -900 + lt * 70; street.forEach((p) => { const w = p.userData.w; p.position.z = w.z0 + w.d * lt * 1.3; p.rotation.y = w.d > 0 ? 0 : Math.PI; walk(p, lt + w.ph); }); };
  S.grade = { sat: 1.2, contrast: 1.1, bloom: .7, bloomThreshold: .75, tint: [1.02, .98, 1.08] };
  return Object.assign(S, { train: tr });
}

// ---------- museum: stopped watch, lunchbox, shadow stone ----------
export function museum() {
  const S = stage({ sky: false, bg: '#020202', light: { sun: [0, 6, 2], sunI: .05, hemiI: .03, shadow: false } });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M('#0e0e10', { rough: .3, metal: .3 })); fl.rotation.x = -Math.PI / 2; S.scene.add(fl);
  const ped = (x) => { const g = new THREE.Group(); g.position.x = x; g.add(P.box(.9, 1, .9, M('#1a1a1c', { rough: .4 }), 0, .5, 0)); const glass = new THREE.Mesh(new THREE.BoxGeometry(.86, .7, .86), new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: .08, roughness: 0, metalness: .2 })); glass.position.y = 1.35; g.add(glass); const s = new THREE.SpotLight('#fff2dc', 6, 6, .3, .5, 2); s.position.set(x, 3.4, .6); s.target.position.set(x, 1.05, 0); s.castShadow = true; S.scene.add(s, s.target); S.scene.add(g); return g; };
  // pocket watch stopped at 8:15
  const w = ped(0); const watch = new THREE.Group(); watch.position.set(0, 1.08, 0); w.add(watch);
  const face = P.wallClock({ h: 8, m: 15, r: .12 }); face.rotation.x = -Math.PI / 2 + .5; watch.add(face);
  const burnt = new THREE.Mesh(new THREE.CircleGeometry(.12, 32), new THREE.MeshBasicMaterial({ color: '#2a1a10', transparent: true, opacity: .35 })); burnt.rotation.x = -Math.PI / 2 + .5; burnt.position.y = .003; burnt.position.z = .002; watch.add(burnt);
  // charred lunchbox / school bag
  const bag = ped(-1.5); bag.add(P.box(.34, .26, .14, M('#2a1c14', { rough: .9 }), 0, 1.15, 0)); bag.add(P.box(.3, .04, .02, M('#4a3020'), 0, 1.24, .08));
  const lunch = ped(1.5); const lb = P.box(.22, .08, .14, M('#3a3632', { rough: .6, metal: .5 }), 0, 1.05, 0); lunch.add(lb);
  S.grade = { bloom: .5, vignette: .75, sat: .8, contrast: 1.15 };
  return Object.assign(S, { watch });
}

// ---------- Peace Memorial Park: cenotaph framing the A-Bomb Dome ----------
export function memorial({ cranes = 0 } = {}) {
  const S = stage({ sky: { top: '#2a3a6a', mid: '#ffb27a', bot: '#5a4a5a', sun: [-.2, .05, -1], sunCol: '#ffa060', sunGlow: .6 }, light: { sun: [-40, 20, -200], sunCol: '#ffb070', sunI: 2.8, hemiI: .6, area: 120 }, near: .2, far: 5000 });
  S.scene.fog = new THREE.Fog('#d8a080', 200, 1600);
  ground(S.scene, { color: '#7a7a6a', size: 2000 });
  const pond = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), new THREE.MeshStandardMaterial({ color: '#2a3a4a', roughness: .05, metalness: .6 })); pond.rotation.x = -Math.PI / 2; pond.position.set(0, .02, -45); S.scene.add(pond);
  const cen = B.cenotaph(); S.scene.add(cen);
  const fl = B.peaceFlame(); fl.position.set(0, 0, -40); S.scene.add(fl); const flame = fire([[0, 1.6, -40, .6]], { per: 30, height: 2 }); S.scene.add(flame); S.particles.push(flame); point(S.scene, [0, 2, -40], '#ff8a30', 30, 20);
  const dome = B.promotionHall({ ruined: true }); dome.position.set(0, 0, -200); dome.rotation.y = Math.PI; S.scene.add(dome);
  const r = rng(2); for (let i = 0; i < 30; i++) { const t = new THREE.Group(); t.add(P.cyl(.25, .35, 4, M('#3a2a1a'), 0, 2, 0, 6)); const c = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + r() * 1.5, 1), M('#3a5a2a', { rough: .9, flat: true })); c.position.y = 5.5; t.add(c); t.position.set((r() < .5 ? -1 : 1) * (16 + r() * 30), 0, -r() * 220 + 20); S.scene.add(t); }
  if (cranes) { const cc = ['#ff4a4a', '#ffd23a', '#4a9aff', '#ff8ad0', '#6ad06a', '#ffffff']; const crs = []; for (let i = 0; i < cranes; i++) { const c = crane(r.pick(cc)); c.userData.d = [r() * 40 - 20, 2 + r() * 14, -r() * 80, r() * 6]; S.scene.add(c); crs.push(c); } S.update0 = (lt) => crs.forEach((c, i) => { const d = c.userData.d; c.position.set(d[0] + Math.sin(lt * .3 + d[3]) * 3, d[1] + Math.sin(lt * .8 + d[3]) * .6 + lt * .4, d[2] + lt * 1.2); c.rotation.set(Math.sin(lt + d[3]) * .2, lt * .2 + d[3], 0); }); }
  S.grade = { tint: [1.06, .98, .94], sat: 1.08, bloom: .7 };
  return S;
}
// origami crane (paper)
export function crane(col = '#ff4a4a') {
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: col, roughness: .8, side: THREE.DoubleSide, flatShading: true });
  const tri = (a, b, c) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3)); geo.computeVertexNormals(); return new THREE.Mesh(geo, m); };
  g.add(tri([0, 0, -.3], [0, .12, 0], [0, 0, .3])); g.add(tri([0, .02, 0], [-.45, .15, -.05], [0, .02, .12])); g.add(tri([0, .02, 0], [.45, .15, -.05], [0, .02, .12]));
  g.add(tri([0, 0, .25], [0, .3, .42], [0, .02, .3])); g.add(tri([0, 0, -.25], [0, .25, -.45], [0, .02, -.3]));
  g.scale.setScalar(1.2); return g;
}
import { street } from './sets3.js';
