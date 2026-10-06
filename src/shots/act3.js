// ACT VII–IX: the attack, one minute, one hour, 24 hours (400s – 616s)
import * as THREE from 'three';
import { T, TE } from '../core/time.js';
import { titleCard, stage, look, camPath, shake, handheld, toScreen } from './common.js';
import { flat, words, quoteShot } from './two.js';
import * as S2 from './sets2.js';
import * as S3 from './sets3.js';
import * as S4 from './sets4.js';
import { aerialCity } from './act1.js';
import { text, reveal, F, PAL, W, H, lowerThird, stamp, measure, fmt, vignette, grain, typeText, inkBG } from '../2d/draw.js';
import { kinetic, clockFace, altimeter, panel, dotGrid, thermometer, lineChart, scanlines } from '../2d/info.js';
import { drawMap, proj, marker, route, LL, mapCam, arrow } from '../2d/maps.js';
import { HIRO } from '../kit/city.js';
import { b29, fighter } from '../kit/aircraft.js';
import { littleBoy } from '../kit/bombs.js';
import { Particles, motes, smoke, fire, rain, mushroom } from '../kit/fx.js';
import * as P from '../kit/props.js';
import { M } from '../kit/materials.js';
import { CAST, POSE, setPose, walk } from '../kit/people.js';
import { clamp, expoOut, easeOut, easeIn, easeInOut, lerp, smooth, rng } from '../core/math.js';
import { softDot } from '../core/textures.js';

const side = (g, lt, t, title, sub, subAt) => { reveal(g, title, 140, 150, clamp(lt / .6), { font: F.title(84), align: 'left', track: 8, dx: -40, dy: 0, shadow: ['#000', 20] }); if (sub) reveal(g, sub, 146, 228, clamp((t - (subAt ?? -1e9)) / .6) * clamp((lt - .3) / .6), { font: F.serif(40), align: 'left', color: '#ffe8d0', dx: -30, dy: 0, shadow: ['#000', 10] }); };

// 2D map of the Hiroshima delta (same geometry as the 3D city)
export function hiroMap(g, lt, t, { burn = 0, ring = 0, ringLabel = '', area = 0, scale = .22, hypo = true } = {}) {
  inkBG(g, t, { gridA: .03 }); const cx = W / 2 + 120, cy = H / 2 + 40; const P2 = (x, z) => [cx + x * scale, cy + z * scale];
  g.save(); g.beginPath(); g.rect(0, 0, W, H); g.fillStyle = '#20252a'; g.fill();
  const rr = rng(3); for (let x = -7000; x < 7000; x += 105) for (let z = -6000; z < 2650; z += 105) { const [X, Y] = P2(x, z); if (X < -40 || X > W + 40 || Y < -40 || Y > H + 40) continue; const d = Math.hypot(x, z); const v = rr(); g.fillStyle = d < 2000 * burn ? `rgba(${110 + 70 * (1 - d / 2000) + v * 30},${30 + v * 20},${20 + v * 10},${.55 + .3 * (1 - d / 2000)})` : `rgba(${120 + v * 50},${130 + v * 40},${130 + v * 35},${.16 + v * .14})`; g.fillRect(X + v * 3, Y + v * 2, 80 * scale, 80 * scale); }
  for (const rv of HIRO.rivers) { g.strokeStyle = '#2f6a80'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = rv.w * scale; g.beginPath(); rv.pts.forEach(([x, z], i) => { const [X, Y] = P2(x, z); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); }
  g.fillStyle = '#1d4352'; g.fillRect(0, P2(0, HIRO.bay)[1], W, H);
  g.restore();
  if (area > 0) { const [X, Y] = P2(0, 0); const R = 2000 * scale * expoOut(area); g.save(); g.fillStyle = 'rgba(224,49,43,.18)'; g.strokeStyle = PAL.red; g.lineWidth = 4; g.setLineDash([14, 10]); g.beginPath(); g.arc(X, Y, R, 0, 7); g.fill(); g.stroke(); g.restore(); }
  if (ring > 0) { const [X, Y] = P2(0, 0); const R = 2000 * scale; const e = expoOut(ring); g.save(); g.strokeStyle = '#ffcf6a'; g.lineWidth = 4; g.beginPath(); g.moveTo(X, Y); g.lineTo(X + R * e, Y); g.stroke(); g.beginPath(); g.arc(X, Y, R, 0, 7 * e); g.stroke(); g.restore(); if (ringLabel) text(g, ringLabel, X + R / 2, Y - 34, { font: F.title(40), color: '#ffcf6a', track: 3, alpha: clamp(ring * 2) }); }
  if (hypo) { const [X, Y] = P2(0, 0); g.save(); g.fillStyle = '#fff'; g.shadowColor = '#ff8a3a'; g.shadowBlur = 30; g.beginPath(); g.arc(X, Y, 10, 0, 7); g.fill(); g.restore(); text(g, 'HYPOCENTRE', X + 18, Y + 30, { font: F.mono(22, 700), color: '#ddd', align: 'left' }); const [bx, by] = P2(...HIRO.bridge); text(g, 'T', bx, by, { font: F.title(30), color: '#ffcf6a' }); }
}

export default function act3(add) {
  const tDet = T('it detonates');

  // ── THE ATTACK ────────────────────────────────────────────────
  add(T('The attack. Little') - .15, 'title-attack', () => titleCard({ big: 'THE ATTACK', small: '', date: 'August 6, 1945 · 8:15 a.m.', dateAt: T('The attack. Little') + .2, accent: '#ff3a2a' }),
    { sfx: [[T('The attack. Little') - .1, 'boom', { gain: 1 }]] });

  add(T('Little boy, weighing') - .1, 'release', () => {
    const S = S2.skyFlight({ tod: 'morning', cloudY: -3000, bombVisible: true }); const p = S.plane; p.userData.openDoors(1); const b = p.userData.bomb; const t0 = T('Little boy, weighing') - .1; const tr = T('drops from') - t0;
    let freed = false;
    S.update = (lt) => { p.position.set(0, 0, lt * 95); p.userData.spin(lt); const k = lt - tr;
      if (k > 0 && !freed) { freed = true; p.userData.bombMount.remove(b); S.scene.add(b); }
      if (freed) { b.position.set(0, -.65 - 4.9 * k * k, lt * 95 + 3.2 - k * 5); b.rotation.x = Math.min(1.3, k * .5); }
      const by = k > 0 ? -.65 - 4.9 * k * k : -.65; look(S.camera, [9, -6 + by * .6, lt * 95 - 4], [0, by, lt * 95 + 3]); };
    S.draw = (g, lt, t) => stamp(g, t - T('9,000 pounds'), '≈ 9,000 LB', W - 360, 170, { font: F.title(72), color: '#fff', bg: 'rgba(0,0,0,.55)', pad: 24 });
    return S;
  }, { bed: [[T('Little boy, weighing'), T('The bomb falls'), 'engine', { gain: .17 }]], sfx: [[T('drops from'), 'clunk', { gain: .6 }], [T('drops from') + .1, 'whoosh', { gain: .3, up: false }]] });

  add(T('Suddenly lighter') - .1, 'plane-jumps', () => {
    const S = S2.skyFlight({ tod: 'morning', cloudY: -3000 }); const p = S.plane; p.userData.openDoors(1); const tj = T('jumps upward') - (T('Suddenly lighter') - .1);
    S.update = (lt) => { const k = lt - tj; p.position.set(0, k > 0 ? 4 * easeOut(k / .5) : 0, lt * 95); p.rotation.x = k > 0 && k < .6 ? -Math.sin(k / .6 * Math.PI) * .08 : 0; p.userData.spin(lt); look(S.camera, [-30, 2, lt * 95 + 10], [0, 1, lt * 95]); if (k > 0) shake(S.camera, lt, clamp(1 - k) * 1.5); };
    return S;
  }, { sfx: [[T('jumps upward'), 'metal', { gain: .3, f: 300 }]] });

  add(T('Tibbetts immediately') - .1, 'steep-bank', () => {
    const S = S2.skyFlight({ tod: 'morning', cloudY: -3000 }); const p = S.plane; p.userData.openDoors(.2);
    S.update = (lt) => { const k = easeInOut(clamp(lt / 2)); const yaw = lt * .32 * k; const R = 900; p.position.set(Math.cos(yaw) * R - R, 0, Math.sin(yaw) * R); p.rotation.set(0, -yaw, 1.05 * k); p.userData.spin(lt);
      const cp = new THREE.Vector3(-26, 6, -32).applyAxisAngle(new THREE.Vector3(0, 1, 0), -yaw).add(p.position); look(S.camera, [cp.x, cp.y, cp.z], [p.position.x, p.position.y, p.position.z]); };
    S.draw = (g, lt, t) => { stamp(g, t - T('steep turn'), '155° TURN', W / 2, 150, { font: F.title(80), color: '#ffcf6a', track: 10 }); kinetic(g, t, [{ s: 'AS MUCH DISTANCE AS POSSIBLE', at: T('as much distance'), x: W / 2, y: H - 220, font: F.title(56), color: '#fff', track: 8, shadow: ['#000', 24] }]); };
    return S;
  }, { sfx: [[T('steep turn'), 'whoosh', { gain: .35, dur: 1.2 }]], bed: [[T('Tibbetts immediately'), T('The bomb falls'), 'engine', { gain: .2, f: 54 }]] });

  add(T('The bomb falls') - .1, 'fall-43', () => {
    const S = aerialCity({ tod: 'morning' }); const b = littleBoy(); b.scale.setScalar(14); S.scene.add(b); const t0 = T('The bomb falls') - .1; const td = tDet - t0;
    S.update = (lt) => { const k = clamp(lt / td); const alt = lerp(5500, 580, Math.pow(k, 1.25)); b.position.set(-300 + k * 260, alt, -150 + k * 120); b.rotation.set(Math.PI / 2 - .25, 0, Math.sin(lt * 3) * .05); look(S.camera, [b.position.x - 120, alt + 160, b.position.z + 220], [b.position.x, alt - 160, b.position.z - 60]); S.camera.fov = 50; };
    S.draw = (g, lt, t) => {
      const k = clamp(lt / td); const sec = Math.max(0, 43 - Math.floor(k * 43));
      g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(70, 70, 420, 230); g.restore();
      text(g, 'TIME TO DETONATION', 100, 110, { font: F.mono(24, 700), color: '#ffcf6a', align: 'left', track: 4 });
      text(g, String(sec).padStart(2, '0') + ' s', 100, 220, { font: F.mono(130, 700), color: sec < 6 ? '#ff4a3a' : '#fff', align: 'left' });
      altimeter(g, W - 330, 240, 560, Math.round(lerp(31060, 1900, Math.pow(k, 1.25))), 32000, { k: clamp((t - T('track its altitude')) / .4) + clamp(lt / .4) * .5, marks: [[1900, 'DETONATE · 1,900 FT']] });
    };
    return S;
  }, { sfx: Array.from({ length: 43 }, (_, i) => [T('The bomb falls') + (tDet - T('The bomb falls')) * i / 43, 'tick', { gain: .22 + i / 43 * .25, hi: i % 2 === 0 }]).concat([[T('The bomb falls'), 'fall', { dur: tDet - T('The bomb falls'), gain: .1 }]]) });

  add(tDet - .05, 'new-sun', () => {
    const S = S3.attack(); S.blastAt = TE('it detonates') - (tDet - .05) - .05;
    S.update = (lt) => { camPath(S.camera, lt, [[0, [3000, 300, 7000], [0, 600, 0], 40], [9, [2600, 350, 6200], [0, 1000, 0], 42]]); const k = lt - S.blastAt; if (k > 0) shake(S.camera, lt, clamp(1 - k / 3) * 20); };
    S.draw = (g, lt, t) => { kinetic(g, t, [{ s: 'A NEW SUN', at: T('a new sun'), x: W / 2, y: 150, font: F.title(110), color: '#fff', track: 30, shadow: ['rgba(255,140,40,.8)', 40] }]); if (t > T('several million')) { thermometer(g, W - 220, 260, 460, 1, { k: clamp((t - T('several million')) / .6), label: '' }); stamp(g, t - T('several million'), 'MILLIONS OF DEGREES', W / 2, H - 220, { font: F.title(80), color: '#fff', bg: 'rgba(220,60,20,.88)', pad: 30 }); } };
    return S;
  }, { sfx: [[tDet + .02, 'flash', { gain: .35 }], [tDet + .05, 'explosion', { gain: 1, dur: 10 }], [T('a new sun'), 'rumble', { dur: 6, gain: .5 }]] });

  // vaporise: people, trees, birds, wooden homes
  add(T('Directly beneath it') - .1, 'vaporise', () => {
    const S = S3.street({ people: 28, seed: 21 }); const t0 = T('Directly beneath it') - .1;
    const groups = [['people,', S.walkers], ['trees,', S.trees], ['birds in flight', S.flock], ['wooden homes', S.houses]];
    const trig = groups.map(([w]) => T(w, 0, 430) - t0);
    const pts = []; groups.forEach(([, objs], gi) => objs.forEach((o) => { const n = gi === 3 ? 26 : gi === 1 ? 14 : 8; for (let i = 0; i < n; i++) pts.push([gi, o, Math.random() * 0 + i / n]); }));
    const r = rng(7); const D = pts.map(() => [r() - .5, r(), r() - .5, r()]);
    const burst = new Particles(pts.length, { map: softDot(), additive: true, shade: 0, sort: false });
    burst.fn = (i, lt, o) => { const [gi, ob, f] = pts[i]; const k = lt - trig[gi]; if (k < 0) { o.a = 0; return; } const d = D[i]; const box = ob.userData.box || (ob.userData.box = new THREE.Box3().setFromObject(ob)); const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      o.x = c.x + d[0] * s.x + d[0] * k * 6; o.y = c.y + (d[1] - .5) * s.y + k * (2 + d[3] * 4); o.z = c.z + d[2] * s.z + d[2] * k * 6 - k * 3; o.s = .3 + d[3] * .5; o.r = 1; o.g = .8 - k * .3; o.b = .5 - k * .3; o.a = clamp(1.5 - k * .8); };
    S.scene.add(burst); S.particles.push(burst);
    S.update = (lt) => { groups.forEach(([, objs], gi) => objs.forEach((o) => { if (!o.userData.box) o.userData.box = new THREE.Box3().setFromObject(o); o.visible = lt < trig[gi]; })); S.walkers.forEach((w) => (w.userData.walk.frozen = true)); look(S.camera, [4, 3, 22], [0, 4, -40]); };
    S.grade = (lt) => ({ exposure: 1.35 + Math.sin(lt * 30) * .04, sat: .45, contrast: 1.3, tint: [1.12, 1.0, .86], bloom: .9, bloomThreshold: .7, flash: lt < .4 ? .8 - lt * 2 : 0 });
    S.draw = (g, lt, t) => kinetic(g, t, groups.map(([w], i) => ({ s: w.replace(',', '').toUpperCase(), at: T(w, 0, 430), x: 300 + i * 440, y: H - 230, font: F.title(56), color: '#fff', track: 6, shadow: ['rgba(60,20,0,.9)', 24] })));
    return S;
  }, { sfx: [['people,', 'trees,', 'birds in flight', 'wooden homes'].map((w) => [T(w, 0, 430), 'whoosh', { gain: .3, up: false }])].flat().concat([[T('vaporize into plasma'), 'boom', { gain: .5, pitch: .8 }]]), bed: [[T('Directly beneath it'), T('Dark silhouettes'), 'wind', { gain: .14, f: 900 }]] });

  add(T('Dark silhouettes') - .1, 'shadow-steps', () => {
    const S = S3.shadowSteps(); const t0 = T('Dark silhouettes') - .1; const tg = T('remain on walls') - t0;
    S.update = (lt) => { S.flash(lt < tg ? 1 : .15, lt >= tg); camPath(S.camera, lt, [[0, [1.5, 1.4, 3.6], [-.2, 1.3, -1], 40], [4, [.9, 1.5, 2.6], [-.25, 1.4, -1.1], 36]]); };
    S.grade = (lt) => lt < tg ? { exposure: 2.4, sat: .2, flash: .3, bloom: 1.2 } : { sat: .55, contrast: 1.2, bloom: .4, vignette: .7 };
    S.draw = (g, lt, t) => { if (lt > tg) side(g, lt - tg, t, 'HUMAN SHADOW ETCHED IN STONE', 'Sumitomo Bank steps · Hiroshima'); };
    return S;
  }, { sfx: [[T('remain on walls'), 'piano', { notes: [50], gain: .16, dur: 6 }]] });

  add(T('The flash is so bright') - .1, 'blinding', () => {
    const S = S3.attack(); S.blastAt = -1.2; const watcher = CAST.jpCivil(5); watcher.scale.setScalar(60); watcher.position.set(5200, 0, 9400); watcher.rotation.y = Math.PI * .85; setPose(watcher, { armR: [2.2, .2], elbowR: 1.6, head: [-.1, 0, 0] }); S.scene.add(watcher);
    S.update = (lt) => { look(S.camera, [5600, 70, 10400], [0, 900, 0]); S.camera.fov = 46; };
    S.grade = (lt) => ({ exposure: 1.35 - lt * .06, bloom: 1, bloomThreshold: .7, sat: .7, tint: [1.1, 1.02, .92], flash: Math.max(0, .5 - lt * .25) });
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'BLINDING · MILES AWAY', at: T('blinds people'), x: W / 2, y: 150, font: F.title(70), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { sfx: [[T('The flash is so bright'), 'flash', { gain: .2, dur: 4 }]] });

  add(T('A fraction of a second') - .1, 'blast-wave', () => {
    const S = S3.attack(); S.blastAt = .6;
    S.update = (lt) => { camPath(S.camera, lt, [[0, [2600, 1500, 3200], [0, 0, 0], 40], [4.4, [2200, 1300, 2800], [0, 0, 0], 40]]); if (lt > 1) shake(S.camera, lt, 8); };
    S.grade = (lt) => ({ bloom: .8, bloomThreshold: .8, exposure: 1.05, flash: lt > .6 && lt < 1 ? (1 - (lt - .6) / .4) * .5 : 0 });
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'THE BLAST WAVE', at: T('the blast wave'), x: W / 2, y: 140, font: F.title(80), color: '#fff', track: 14, shadow: ['#000', 30] }]);
    return S;
  }, { sfx: [[T('the blast wave'), 'rumble', { dur: 5, gain: .8 }], [T('the blast wave') + .2, 'explosion', { gain: .7, dur: 5 }]] });

  add(T('Superheated air') - .1, 'wall-of-air', () => {
    const S = S3.street({ people: 20, seed: 33 }); const r = rng(3); const N = 1400; const D = []; for (let i = 0; i < N; i++) D.push([r(), r(), r(), r()]);
    const wall = new Particles(N, { map: (S.particles[0] && null) || undefined, shade: 1 }); const c1 = new THREE.Color('#fff2d0'), c2 = new THREE.Color('#a87a5a');
    const front = (lt) => -140 + lt * 32; S.walkers.forEach((w) => (w.userData.walk.frozen = false));
    wall.fn = (i, lt, o) => { const d = D[i]; const z = front(lt) - d[0] * 30; o.x = (d[1] - .5) * 60; o.y = d[2] * 22; o.z = z; o.s = 5 + d[3] * 7; const c = c1.clone().lerp(c2, d[0]); o.r = c.r; o.g = c.g; o.b = c.b; o.a = .9; o.rot = d[3] * 6 + lt; };
    S.scene.add(wall); S.particles.push(wall);
    S.update = (lt) => { const f = front(lt); S.houses.forEach((h) => { const k = clamp((f - h.position.z) / 6); h.rotation.x = -k * .9; h.position.y = -k * 1.5; }); S.walkers.forEach((p) => { const k = f > p.position.z; if (k) p.visible = false; }); look(S.camera, [3, 2.2, 24], [0, 5, -60]); shake(S.camera, lt, clamp((f + 40) / 60) * .5); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'FASTER THAN SOUND', at: T('faster than sound'), x: W / 2, y: 150, font: F.title(90), color: '#fff', track: 16, shadow: ['#000', 30] }]);
    S.grade = { tint: [1.08, 1, .9], bloom: .7 };
    return S;
  }, { sfx: [[T('Superheated air'), 'rumble', { dur: 4, gain: .9 }], [T('It tears the city') - .2, 'explosion', { gain: .6, dur: 3 }]] });

  add(T('It tears the city') - .1, 'tears-apart', () => {
    const S = S3.attack(); S.blastAt = -.5;
    S.update = (lt) => { look(S.camera, [1400, 260, 1600], [-200, 0, -200]); shake(S.camera, lt, 10); S.camera.fov = 44; };
    S.grade = { bloom: .9, exposure: 1.15, tint: [1.1, .96, .9] };
    return S;
  });

  add(T('Reinforced concrete') - .1, 'concrete-crumple', () => {
    const S = stage({ sky: { top: '#6a5a50', mid: '#d8b090', bot: '#5a4a40', sun: [.5, .4, .4], sunCol: '#ffd0a0' }, light: { sun: [60, 50, 40], sunCol: '#ffd8b0', sunI: 2.8, hemiI: .6, area: 50 }, near: .3, far: 2000 });
    S.scene.fog = new THREE.Fog('#b89070', 60, 400);
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), M('#7a6a5a', { rough: 1 })); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; S.scene.add(gnd);
    const blds = []; const r = rng(4);
    for (let i = 0; i < 5; i++) { const g = new THREE.Group(); const w = 14 + r() * 6, h = 16 + r() * 10; const n = 5; for (let k = 0; k < n; k++) { const fl = P.box(w, h / n - .3, 12, M(['#b8b0a0', '#a8a090', '#c4baa8'][i % 3], { rough: .95 }), 0, k * h / n + h / n / 2, 0); g.add(fl); for (let x = -w / 2 + 2; x < w / 2 - 1; x += 3) g.add(P.box(1.4, 1.4, .1, M('#202830'), x, k * h / n + h / n / 2, 6.02)); } g.position.set(-40 + i * 20, 0, -20 - (i % 2) * 18); S.scene.add(g); blds.push(g); }
    const dust = smoke(blds.map((b) => [b.position.x, 2, b.position.z, 3]), { per: 30, col: '#a89070', col2: '#d8c8a8', alpha: .6, rise: 10, spread: 14, drift: [6, 0], rate: .25, start: .8 }); S.scene.add(dust); S.particles.push(dust);
    S.update = (lt) => { blds.forEach((b, i) => { const k = clamp((lt - .5 - i * .15) / 1.2); b.children.forEach((c, j) => { const fl = Math.floor(j / 1); c.position.y = Math.max(.5, c.userData.y0 ?? (c.userData.y0 = c.position.y)) * (1 - easeIn(k) * .85); c.rotation.z = k * (j % 2 ? .1 : -.08); }); b.scale.y = 1 - easeIn(k) * .3; b.rotation.x = k * .08; }); look(S.camera, [10, 6, 40], [0, 8, -20]); shake(S.camera, lt, lt > .5 ? .6 : 0); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'LIKE CARDBOARD BOXES', at: T('like cardboard'), x: W / 2, y: 150, font: F.title(80), color: '#fff', track: 12, shadow: ['#000', 30] }]);
    S.grade = { tint: [1.08, .98, .9], bloom: .5 };
    return S;
  }, { sfx: [[T('crumple'), 'metal', { gain: .35, f: 180 }], [T('crumple') + .4, 'rumble', { dur: 3, gain: .6 }]] });

  add(T('Wooden neighborhoods') - .1, 'swept-away', () => {
    const S = S3.attack(); S.blastAt = .3;
    S.update = (lt) => { look(S.camera, [-900, 180, 1300], [200, 0, -200]); S.camera.fov = 40; shake(S.camera, lt, 6); };
    S.grade = { bloom: .8, exposure: 1.1, tint: [1.1, .96, .9] };
    const r = rng(5); const N = 900; const D = []; for (let i = 0; i < N; i++) D.push([r(), r(), r(), r()]);
    const deb = new Particles(N, { map: softDot(), shade: 0, sort: false }); deb.fn = (i, lt, o) => { const d = D[i]; const a = d[0] * 6.28, rr = (d[1] * 1500 + lt * 500); o.x = Math.cos(a) * rr; o.z = Math.sin(a) * rr; o.y = 5 + d[2] * 80 * Math.sin(clamp(lt / 3) * Math.PI); o.s = 4 + d[3] * 6; o.r = .25; o.g = .18; o.b = .12; o.a = clamp(lt * 2) * .8; }; S.scene.add(deb); S.particles.push(deb);
    return S;
  }, { sfx: [[T('Wooden neighborhoods'), 'rumble', { dur: 3, gain: .6 }]] });

  add(T('Behind the blast') - .1, 'inward-rush', () => {
    const S = S3.attack(); S.blastAt = -4; S.fireStart = .6;
    S.update = (lt) => { look(S.camera, [0, 4200, 2600], [0, 0, 0]); S.camera.fov = 40; };
    S.draw = (g, lt, t) => { const [cx, cy] = toScreen(S.camera, [0, 0, 0]); const k = clamp((t - T('inward rush')) / 2); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const r0 = 760 - k * 300, r1 = 520 - k * 300; g.save(); g.globalAlpha = clamp(k * 3) * .9; g.strokeStyle = '#7ad0ff'; g.lineWidth = 8; g.shadowColor = '#7ad0ff'; g.shadowBlur = 20; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .6); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .6); g.stroke(); g.restore(); }
      kinetic(g, t, [{ s: 'INWARD RUSH OF AIR', at: T('inward rush'), x: W / 2, y: 140, font: F.title(70), color: '#cfeeff', track: 12, shadow: ['#000', 30] }, { s: 'FEEDING THE FIRES', at: T('feeding the fires'), x: W / 2, y: H - 220, font: F.title(64), color: '#ffb070', track: 12, shadow: ['#000', 30] }]); };
    S.grade = { bloom: 1, tint: [1.1, .96, .9] };
    return S;
  }, { sfx: [[T('inward rush'), 'whoosh', { gain: .4, dur: 1.5, up: false }]], bed: [[T('feeding the fires'), T('One minute later'), 'fire', { gain: .14 }]] });

  add(T('Above the devastated') - .1, 'mushroom-9mi', () => {
    const S = S3.attack({ cloudScale: 1.4 }); S.blastAt = -6; S.fireStart = -3; S.scene.fog.far = 70000; S.scene.fog.near = 9000;
    S.update = (lt) => { camPath(S.camera, lt, [[0, [9000, 600, 16000], [0, 3500, 0], 40], [12, [7600, 700, 13500], [0, 5200, 0], 44]]); };
    S.draw = (g, lt, t) => {
      const k = clamp((t - T('nine miles')) / 1.6); if (k > 0) { const [, yb] = toScreen(S.camera, [0, 0, 0]); const [, yt] = toScreen(S.camera, [0, 14500, 0]); const x = W - 300; const y = lerp(yb, yt, expoOut(k)); g.save(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, yb); g.lineTo(x, y); g.stroke(); for (let i = 0; i <= 9; i++) { const yy = lerp(yb, yt, i / 9); if (yy < y) continue; g.beginPath(); g.moveTo(x - 14, yy); g.lineTo(x + 14, yy); g.stroke(); } g.restore(); text(g, '9 MILES', x - 30, y - 50, { font: F.title(64), color: '#fff', align: 'right', track: 4, alpha: k }); text(g, '≈ 15 KM', x - 30, y + 4, { font: F.mono(28, 700), color: '#ddd', align: 'right', alpha: k }); }
      kinetic(g, t, [{ s: 'PURPLE-GRAY MUSHROOM CLOUD', at: T('purple-gray'), x: 120, y: 140, font: F.title(56), color: '#e8d8f0', align: 'left', track: 8, shadow: ['#000', 24] }]); };
    S.grade = (lt, t) => ({ exposure: lerp(1.15, .75, clamp((t - T('blotting out')) / 2.5)), tint: [1.05, .96, 1.02], bloom: .8, sat: 1.05 });
    return S;
  }, { sfx: [[T('Above the devastated'), 'rumble', { dur: 9, gain: .45 }], [T('nine miles'), 'riser', { dur: 2, gain: .2 }]] });

  // ── ONE MINUTE LATER ─────────────────────────────────────────
  add(T('One minute later') - .15, 'title-1min', () => titleCard({ big: '1 MINUTE', small: 'LATER', accent: '#ff3a2a' }), { sfx: [[T('One minute later') - .1, 'boom']] });

  add(T('The first shockwave') - .1, 'shockwave-hits', () => {
    const S = S2.skyFlight({ tod: 'morning', cloudY: -3000 }); const p = S.plane; const m = mushroom({ H: 9000, tau: 12, n: 1500, hot: '#ffe8c8', fire: '#ff7a2a', dark: '#3a3240', light: '#9c92a2', glow: '#ff6a2a', base: '#6a5a58' }); m.position.set(0, -9400, -14000); m.userData.t = (lt) => lt + 40; S.scene.add(m); S.particles.push(m);
    const th = T('shudders') - (T('The first shockwave') - .1);
    S.update = (lt) => { p.position.set(0, 0, -lt * 95); p.rotation.y = Math.PI; p.userData.spin(lt); const k = lt - th; if (k > 0) { p.rotation.z = Math.sin(k * 30) * .05 * clamp(1 - k / 2); p.position.y = Math.sin(k * 25) * .8 * clamp(1 - k / 2); } look(S.camera, [22, 6, -lt * 95 - 40], [0, -2, -lt * 95 - 400]); if (k > 0) shake(S.camera, lt, clamp(1 - k / 2) * 2); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'LIKE A GIANT SLEDGEHAMMER', at: T('giant sledgehammer'), x: W / 2, y: H - 220, font: F.title(60), color: '#fff', track: 10, shadow: ['#000', 24] }]);
    return S;
  }, { sfx: [[T('shudders'), 'metal', { gain: .5, f: 160 }], [T('giant sledgehammer'), 'boom', { gain: .5 }]], bed: [[T('The first shockwave'), T('My god'), 'engine', { gain: .16 }]] });

  add(T('Co-pilot Robert') - .1, 'lewis-cockpit', () => {
    const S = S3.cockpit({ outside: 'mushroom' }); S.mush.userData.t = (lt) => lt + 44;
    S.update = (lt) => camPath(S.camera, lt, [[0, [.1, 1.45, 1.4], [-.2, 1.1, -3], 50], [6.5, [.2, 1.4, 1.0], [-.4, 1.2, -3], 44]]);
    S.draw = (g, lt, t) => lowerThird(g, t - T('Co-pilot Robert'), 'CAPT. ROBERT LEWIS', 'co-pilot, Enola Gay');
    return S;
  });

  add(T('My god') - .2, 'quote-mygod', () => quoteShot(['My God,', 'what have we done?'], { font: F.serif(110), sub: '— CAPT. ROBERT LEWIS', subAt: 1.6, speed: 1.2 }), { sfx: [[T('My god') - .1, 'piano', { notes: [45, 52], gain: .2, dur: 6 }]] });

  add(T('Hiroshima, as it existed') - .1, 'gone-map', () => flat(null, (g, lt, t) => { hiroMap(g, lt, t, { burn: clamp((t - T('is gone')) / 1.2) }); stamp(g, t - T('is gone'), 'GONE', W / 2 - 520, 260, { font: F.title(160), color: '#fff', track: 20 }); }),
    { sfx: [[T('is gone'), 'boom', { gain: .45 }]] });

  add(T('Across nearly five') - .1, 'five-sq-mi', () => flat(null, (g, lt, t) => { hiroMap(g, lt, t, { burn: 1, area: clamp((t - T('five square miles')) / 1) }); reveal(g, '≈ 5 SQUARE MILES', 140, 200, clamp((t - T('five square miles')) / .6), { font: F.title(90), align: 'left', color: '#fff', dx: -30, dy: 0 }); reveal(g, '13 km² destroyed', 146, 280, clamp((t - T('five square miles') - .3) / .6), { font: F.serif(44), align: 'left', color: '#ffb0a0', dx: -30, dy: 0 }); }),
    { sfx: [[T('five square miles'), 'pop', { gain: .2 }]] });

  add(T('Within roughly a mile') - .1, 'mile-quarter', () => flat(null, (g, lt, t) => { hiroMap(g, lt, t, { burn: 1, area: 1, ring: clamp((t - T('a mile and a quarter')) / 1), ringLabel: '1.25 MI · 2 KM' }); reveal(g, 'WITHOUT THICK CONCRETE WALLS:', 140, 200, clamp((t - T('anyone without')) / .6), { font: F.title(60), align: 'left', color: '#fff', dx: -30, dy: 0 }); reveal(g, 'DEAD OR DYING', 140, 290, clamp((t - T('dead or dying')) / .5), { font: F.title(90), align: 'left', color: PAL.red, dx: -30, dy: 0 }); }),
    { sfx: [[T('a mile and a quarter'), 'data', { gain: .07 }], [T('dead or dying'), 'stamp', { gain: .35 }]] });

  add(T('Tens of thousands have been') - .1, 'first-second', () => flat('black', (g, lt, t) => {
    const k = clamp(lt / 1.2); dotGrid(g, { x: 290, y: 330, cols: 56, rows: 18, gap: 24, r: 8, k: 1, active: Math.floor(56 * 18 * (1 - k * .55)), col: '#d8cfbd', activeCol: '#d8cfbd', dimCol: 'rgba(224,49,43,.35)' });
    reveal(g, 'TENS OF THOUSANDS', W / 2, 200, clamp(lt / .6), { font: F.title(100), color: '#fff', track: 10 });
    reveal(g, 'killed in the first second', W / 2, 860, clamp((t - T('in the first')) / .6), { font: F.serif(56), color: PAL.red });
  }), { sfx: [[T('Tens of thousands have been'), 'piano', { notes: [41], gain: .2, dur: 5 }], [T('first second') + .2, 'heartbeat', { beats: 1, gain: .4 }]] });

  // ── ONE HOUR LATER ───────────────────────────────────────────
  add(T('One hour later') - .15, 'title-1h-later', () => titleCard({ big: '1 HOUR', small: 'LATER', accent: '#ff6a2a' }), { sfx: [[T('One hour later') - .1, 'boom']] });

  add(T('The city becomes an inferno') - .1, 'inferno', () => {
    const S = S4.inferno();
    S.update = (lt) => camPath(S.camera, lt, [[0, [-2600, 900, 2200], [0, 100, 0], 40], [10, [-1700, 600, 1500], [0, 200, 0], 40]]);
    S.draw = (g, lt, t) => { kinetic(g, t, [{ s: 'FIRESTORM', at: T('into a firestorm'), x: W / 2, y: 160, font: F.title(140), color: '#ffcf8a', track: 30, shadow: ['rgba(255,80,20,.8)', 40] }]);
      const k = clamp((t - T('drawing air in')) / 2); if (k > 0) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const cx = W / 2, cy = H / 2 + 80; const r0 = 900 - k * 380, r1 = 640 - k * 380; g.save(); g.globalAlpha = clamp(k * 3) * clamp(2 - k * 1.5); g.strokeStyle = '#ffd0a0'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .5); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .5); g.stroke(); g.restore(); } };
    return S;
  }, { bed: [[T('The city becomes an inferno'), T('Soon, rain'), 'fire', { gain: .2 }], [T('The city becomes an inferno'), T('Soon, rain'), 'drone', { gain: .08, root: 33, chord: [0, 1, 7, 12] }]], sfx: [[T('into a firestorm'), 'whoosh', { gain: .4, dur: 1.4 }]] });

  add(T('The heat in the streets') - .1, 'heat-streets', () => {
    const S = S3.street({ ruined: true, people: 0, seed: 41 });
    S.update = (lt) => { camPath(S.camera, lt, [[0, [0, 1.7, 10], [0, 2, -60], 40], [1.5, [0, 1.6, 7], [0, 2, -60], 40]]); handheld(S.camera, lt, .03); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'UNBEARABLE HEAT', at: T('is unbearable'), x: W / 2, y: 150, font: F.title(80), color: '#ffe0c0', track: 14, shadow: ['#000', 30] }]);
    return S;
  });

  add(T('Survivors emerge') - .1, 'ghosts', () => {
    const S = S3.street({ ruined: true, people: 0, seed: 43 }); const r = rng(9); const gh = [];
    for (let i = 0; i < 9; i++) { const p = CAST.jpCivil(i + 3); p.traverse((o) => { if (o.isMesh) { o.material = M('#2a201a', { rough: 1 }); } }); p.position.set((r() - .5) * 8, 0, -10 - r() * 30); p.userData.ph = r() * 9; S.scene.add(p); gh.push(p); }
    S.update = (lt) => { gh.forEach((p, i) => { p.position.z += 0; const z0 = p.userData.z0 ?? (p.userData.z0 = p.position.z); p.position.z = z0 + lt * .45; walk(p, lt * .55 + p.userData.ph, { speed: .5, amp: .25, extra: { armL: [1.35, .1], armR: [1.35, .1], elbowL: .25, elbowR: .25, spine: .12, head: [.2, 0, 0] } }); }); camPath(S.camera, lt, [[0, [1.5, 1.4, 6], [0, 1.4, -20], 40], [13, [.5, 1.3, 2], [0, 1.4, -20], 38]]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'LIKE GHOSTS', at: T('like ghosts'), x: W / 2, y: 150, font: F.title(90), color: '#ffe0c0', track: 20, shadow: ['#000', 30] }]);
    S.grade = { tint: [1.12, .9, .82], sat: .8, contrast: 1.2, bloom: .9, vignette: .7 };
    return S;
  });

  add(T('Soon, rain') - .1, 'black-rain', () => {
    const S = S3.street({ ruined: true, people: 0, seed: 47 }); S.scene.fog.color.set('#1a1412'); S.sky.material.uniforms.mid.value.set('#2a2220'); S.sky.material.uniforms.top.value.set('#0a0808');
    const rn = rain(2600, { box: [40, 30, 80], center: [0, 15, -20], col: '#4a4038', speed: 18, len: 1.5, alpha: .9 }); const fillR = new THREE.PointLight('#ffb080', 60, 30, 2); fillR.position.set(3, 4, 6); S.scene.add(fillR); S.scene.add(rn); S.particles.push(rn);
    const fig = CAST.jpCivil(7); fig.position.set(-.6, 0, 2); fig.rotation.y = .4; S.scene.add(fig);
    S.update = (lt, t) => { const k = clamp((t - T('open their mouths')) / 1); setPose(fig, { head: [-.75 * k, 0, 0], armL: [.6 * k, .3], armR: [.6 * k, .3], elbowL: 1.2 * k, elbowR: 1.2 * k }); camPath(S.camera, lt, [[0, [2.5, 1.4, 7], [-.4, 1.5, -10], 40], [17, [1.2, 1.5, 4.5], [-.6, 1.7, 1.5], 36]]); };
    S.draw = (g, lt, t) => { kinetic(g, t, [{ s: 'BLACK RAIN', at: T('It is black'), x: W / 2, y: 150, font: F.title(110), color: '#e8e0d8', track: 30, shadow: ['#000', 30] }]); if (t > T('a poison')) { stamp(g, t - T('a poison'), '☢  POISON', W / 2, H - 230, { font: F.title(84), color: '#1a1a1a', bg: 'rgba(240,200,40,.92)', pad: 30, track: 8 }); } };
    S.grade = { tint: [1.02, .96, .92], sat: .5, contrast: 1.15, bloom: .5, vignette: .7, exposure: 1.15 };
    return S;
  }, { bed: [[T('Soon, rain'), T('24 hours after'), 'rain', { gain: .14 }], [T('Soon, rain'), T('24 hours after'), 'geiger', { gain: .07, rate: 5 }]] });

  // ── 24 HOURS AFTER ───────────────────────────────────────────
  add(T('24 hours after') - .15, 'title-24h-after', () => titleCard({ big: '24 HOURS', small: 'AFTER THE ATTACK', date: 'August 7, 1945', dateAt: T('24 hours after') + .7 }), { sfx: [[T('24 hours after') - .1, 'boom']] });

  add(T("Japan's military leadership") - .1, 'tokyo-hq', () => {
    const S = S4.warRoom();
    S.update = (lt) => camPath(S.camera, lt, [[0, [3, 2.4, 3], [0, .9, 0], 40], [4, [2.4, 2, 2.4], [0, 1, 0], 38]]);
    S.draw = (g, lt, t) => { side(g, lt, t, 'IMPERIAL HQ · TOKYO', 'what has happened?', T('cannot understand')); };
    return S;
  }, { bed: [[T("Japan's military leadership"), T('All communication'), 'room', { gain: .06 }]] });

  add(T('All communication') - .1, 'no-signal', () => flat(null, (g, lt, t) => {
    g.fillStyle = '#040806'; g.fillRect(0, 0, W, H); scanlines(g, .2);
    const flat0 = T('has stopped') - (T('All communication') - .1); const pts = []; for (let i = 0; i < 120; i++) { const x = i / 119; const tt = lt - (1 - x) * 2.5; pts.push(tt < flat0 ? .5 + Math.sin(i * 1.7) * .3 * (i % 7 === 0 ? 1.6 : .4) + Math.sin(i * .5 + lt * 9) * .1 : .5); }
    lineChart(g, pts, 1, { x: 200, y: 320, w: 1520, h: 360, color: '#4dff9a', fill: false, max: 1, width: 4, axisCol: 'rgba(77,255,154,.25)' });
    text(g, 'TELEGRAPH · HIROSHIMA LINE', 200, 250, { font: F.mono(30, 700), color: '#4dff9a', align: 'left', track: 6 });
    stamp(g, t - T('has stopped'), 'NO SIGNAL', W / 2, 820, { font: F.mono(90, 700), color: '#ff4a3a', track: 12 });
    reveal(g, 'lines north of the city are down', W / 2, 940, clamp((t - T('lines north')) / .6), { font: F.serif(44), color: '#b8d8c8' });
    vignette(g, .6); grain(g, t, .9);
  }), { sfx: [[T('All communication'), 'morse', { pattern: '.... .. .-. --- ...', gain: .1 }], [T('has stopped'), 'static', { dur: 3, gain: .1 }]] });

  add(T('The general staff sends') - .1, 'recon-flight', () => {
    const S = S4.reconToSmoke(); const p = S.plane;
    S.update = (lt) => { p.position.set(0, 0, -lt * 120); p.rotation.y = Math.PI; look(S.camera, [6, 4, -lt * 120 + 22], [0, 1500, -lt * 120 - 60000]); };
    S.draw = (g, lt, t) => { stamp(g, t - T('a hundred miles'), '≈ 100 MILES AWAY', W / 2, 150, { font: F.title(72), color: '#fff', bg: 'rgba(0,0,0,.5)', pad: 26 }); };
    return S;
  }, { bed: [[T('The general staff sends'), T('Below it lies'), 'engine', { gain: .1, f: 70 }]] });

  add(T('Below it lies') - .1, 'endless-ruins', () => {
    const S = S2.firebomb({ ashes: true });
    S.scene.fog.near = 3000; S.scene.fog.far = 14000; S.update = (lt) => camPath(S.camera, lt, [[0, [1600, 1100, 2200], [0, 0, 0], 40], [5, [1200, 800, 1600], [0, 0, 0], 40]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'BURNED RUINS', at: T('burned ruins'), x: W / 2, y: 150, font: F.title(80), color: '#fff', track: 16, shadow: ['#000', 30] }]);
    return S;
  }, { bed: [[T('Below it lies'), T('President Truman announces'), 'wind', { gain: .12, f: 300 }]] });

  add(T('President Truman announces') - .1, 'truman-radio', () => {
    const S = S4.radioAddress();
    S.update = (lt) => camPath(S.camera, lt, [[0, [.8, 1.25, .6], [0, 1.2, -1.6], 40], [5.5, [.5, 1.2, .1], [0, 1.25, -1.7], 36]]);
    S.draw = (g, lt, t) => { lowerThird(g, t - T('President Truman announces'), 'PRESIDENT TRUMAN', 'radio address · August 6, 1945'); const k = clamp((t - T('by radio')) / .5); for (let i = 0; i < 3; i++) { const ph = (lt * .7 + i / 3) % 1; g.save(); g.strokeStyle = '#ffd08a'; g.globalAlpha = k * (1 - ph) * .7; g.lineWidth = 4; g.beginPath(); g.arc(W / 2 + 60, H / 2 - 40, 60 + ph * 400, -.6, .6); g.stroke(); g.restore(); } };
    return S;
  }, { sfx: [[T('by radio'), 'static', { dur: 1.2, gain: .08 }]] });

  add(T('Unless Japan surrenders') - .1, 'rain-of-ruin', () => quoteShot(['…a rain of ruin', 'from the air.'], { font: F.serif(100), sub: '— PRESIDENT HARRY S. TRUMAN', subAt: 1.4, speed: 1 }), { sfx: [[T('rain of ruin'), 'boom', { gain: .45 }]] });

  add(T('Many Japanese military leaders') - .1, 'only-one', () => flat('ink', (g, lt, t) => {
    const k1 = clamp(lt / .6), k2 = clamp((t - T('more than one')) / .6);
    const bomb = (x, a, ghost) => { g.save(); g.globalAlpha = a; g.translate(x, 520); g.fillStyle = ghost ? 'rgba(255,255,255,.15)' : '#d8d0c0'; g.strokeStyle = ghost ? 'rgba(255,255,255,.5)' : 'transparent'; g.setLineDash(ghost ? [10, 8] : []); g.lineWidth = 3; g.beginPath(); g.roundRect(-220, -60, 380, 120, 60); g.fill(); g.stroke(); g.beginPath(); g.rect(160, -80, 90, 160); g.fill(); g.stroke(); g.restore(); };
    bomb(560, k1, false); text(g, '1', 560, 760, { font: F.title(120), color: '#fff', alpha: k1 });
    bomb(1300, k2, true); text(g, '?', 1300, 760, { font: F.title(140), color: PAL.red, alpha: k2 });
    reveal(g, 'ONLY ONE SUCH WEAPON?', W / 2, 200, clamp(lt / .6), { font: F.title(80), color: '#fff', track: 10 });
  }), { sfx: [[T('more than one'), 'pop', { gain: .2 }]] });

  add(T('Japan does not surrender') - .1, 'no-surrender', () => flat('black', (g, lt, t) => { reveal(g, 'JAPAN DOES NOT SURRENDER', W / 2, H / 2, clamp(lt / .5), { font: F.title(110), color: '#fff', track: 14 }); }, { captions: false }),
    { sfx: [[T('Japan does not surrender'), 'boom', { gain: .5 }]] });
}
