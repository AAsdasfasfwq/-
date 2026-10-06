// ACT X–XIV: Nagasaki → surrender (616s – 862s)
import * as THREE from 'three';
import { T, TE } from '../core/time.js';
import { titleCard, stage, look, camPath, shake, handheld, toScreen } from './common.js';
import { flat, words, quoteShot } from './two.js';
import * as S2 from './sets2.js';
import * as S3 from './sets3.js';
import * as S4 from './sets4.js';
import { implosion, mountainShield, blueprintBG } from './blueprint.js';
import { text, reveal, F, PAL, W, H, lowerThird, stamp, measure, fmt, vignette, grain, typeText, inkBG, paperBG, rrect } from '../2d/draw.js';
import { kinetic, clockFace, gauge, radar, panel, dotGrid, barH, scanlines, count } from '../2d/info.js';
import { drawMap, proj, marker, route, LL, mapCam, arrow } from '../2d/maps.js';
import { NAGA } from '../kit/city.js';
import { fighter, b29 } from '../kit/aircraft.js';
import { fatMan } from '../kit/bombs.js';
import { Particles, motes, smoke, fire } from '../kit/fx.js';
import * as P from '../kit/props.js';
import { M } from '../kit/materials.js';
import { CAST, POSE, setPose } from '../kit/people.js';
import { clamp, expoOut, easeOut, easeIn, easeInOut, lerp, smooth, rng } from '../core/math.js';
import { softDot } from '../core/textures.js';

const side = (g, lt, t, title, sub, subAt) => { reveal(g, title, 140, 150, clamp(lt / .6), { font: F.title(84), align: 'left', track: 8, dx: -40, dy: 0, shadow: ['#000', 20] }); if (sub) reveal(g, sub, 146, 228, clamp((t - (subAt ?? -1e9)) / .6) * clamp((lt - .3) / .6), { font: F.serif(40), align: 'left', color: '#ffe8d0', dx: -30, dy: 0, shadow: ['#000', 10] }); };
const BOCK = { name: 'BOCKSCAR', tail: 'N', tailShape: 'tri', tailNum: '77' };

export default function act4(add) {
  add(T('Three days later') - .15, 'title-3d', () => titleCard({ big: '3 DAYS LATER', small: 'HOURS BEFORE THE SECOND ATTACK', date: 'August 9, 1945', dateAt: T('the second attack') }),
    { sfx: [[T('Three days later') - .1, 'boom']], bed: [[T('Three days later'), T('At dawn, the Soviet'), 'ticking', { gain: .14 }]] });

  add(T('At dawn, the Soviet') - .1, 'soviet-war', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [118, 47], 900], [9, [124, 45], 1150]]); drawMap(g, p, { theme: 'ink', highlight: { russia: '#4a1214', mongolia: '#4a1214', japan: '#3a3a30', china: '#2a2e30' } });
    stamp(g, t - T('declaring war'), 'USSR DECLARES WAR ON JAPAN', W / 2, 140, { font: F.title(64), color: '#fff', bg: 'rgba(180,20,25,.9)', pad: 30 });
    const k = clamp((t - T('massive offensive')) / 2.5);
    arrow(g, p, [[116, 49.5], [121, 46.5], [124.5, 44.5]], k, { color: '#e0312b' }); arrow(g, p, [[131, 45], [128, 44.6], [126, 44.2]], k, { color: '#e0312b' }); arrow(g, p, [[127.5, 50.2], [127, 47.5], [126.5, 45.8]], k, { color: '#e0312b' });
    marker(g, p, LL.manchuria, 'MANCHURIA', clamp((t - T('in Manchuria')) / .4), { side: -1, color: '#ffcf6a' });
    reveal(g, 'as promised at the Yalta Conference', 140, H - 150, clamp((t - T('Yalta Conference')) / .6), { font: F.serif(40), align: 'left', color: '#d8c8b8', dx: -20, dy: 0 });
    if (t > T('becomes hopeless')) stamp(g, t - T('becomes hopeless'), 'HOPELESS', W / 2, H / 2 + 60, { font: F.title(150), color: 'rgba(255,255,255,.95)', track: 24 });
  }), { sfx: [[T('declaring war'), 'stamp', { gain: .45 }], [T('massive offensive'), 'rumble', { dur: 3, gain: .5 }], [T('becomes hopeless'), 'boom', { gain: .4 }]] });

  add(T('Meanwhile, on Tinian') - .1, 'tinian-second', () => {
    const S = S2.assemblyHut({ bomb: 'fm' });
    S.update = (lt) => camPath(S.camera, lt, [[0, [3.6, 2.2, 3.4], [0, 1.1, 0], 40], [4, [2.8, 1.8, 2.6], [0, 1.1, 0], 38]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'TINIAN', 'rushing to prepare a second strike', T('a second strike'));
    return S;
  }, { bed: [[T('Meanwhile, on Tinian'), T('An approaching typhoon'), 'hum', { gain: .05, f: 120 }]] });

  add(T('An approaching typhoon') - .1, 'typhoon-calendar', () => flat('paper', (g, lt, t) => {
    const cx = 620, cy = 560; g.save(); g.translate(cx, cy); g.rotate(-lt * 1.6); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.strokeStyle = 'rgba(30,60,90,.65)'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); for (let a = 0; a < 3; a += .05) { const r = 20 + a * 70; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); } g.restore();
    text(g, 'TYPHOON', cx, cy + 300, { font: F.sans(50, 800), color: '#1e3c5a', track: 6, alpha: clamp(lt / .5) });
    const flip = clamp((t - T('forward by two days')) / .8);
    const card = (x, label, day, k, strike) => { panel(g, x - 170, 330, 340, 420, { k: 1 }); g.save(); g.fillStyle = PAL.red; g.fillRect(x - 170, 330, 340, 90); g.restore(); text(g, label, x, 375, { font: F.sans(42, 800), color: '#fff' }); text(g, day, x, 580, { font: F.sans(200, 800), color: '#151515', alpha: 1 }); if (strike > 0) { g.strokeStyle = PAL.red; g.lineWidth = 14; g.beginPath(); g.moveTo(x - 140, 470); g.lineTo(x - 140 + 280 * expoOut(strike), 470 + 220 * expoOut(strike)); g.stroke(); } };
    card(1150, 'AUGUST', '11', 1, flip); if (flip > .2) { g.save(); g.globalAlpha = clamp((flip - .2) * 2); card(1550, 'AUGUST', '9', 1, 0); g.restore(); text(g, '← 2 DAYS', 1350, 820, { font: F.sans(46, 800), color: PAL.red, alpha: clamp((flip - .4) * 2) }); }
    reveal(g, 'mission moved forward', 1350, 900, clamp((t - T('forward by two days')) / .6), { font: F.serif(44), color: '#333' });
  }), { sfx: [[T('An approaching typhoon'), 'wind', { gain: .1 }], [T('forward by two days'), 'paper', { gain: .2 }], [T('two days.'), 'pop', {}]] });

  add(T('A B-29 named') - .1, 'bockscar-takeoff', () => {
    const S = S2.tinian({ night: true, planes: 1 }); const old = S.fleet[0]; S.scene.remove(old);
    const p = b29(BOCK); p.position.copy(old.position); p.rotation.copy(old.rotation); S.scene.add(p); const y0 = p.position.y; p.userData.exhaust(true);
    const key = new THREE.PointLight('#cfe0ff', 9000, 120, 2); S.scene.add(key); const rim = new THREE.PointLight('#ffb070', 5000, 80, 2); S.scene.add(rim);
    const rl = []; for (let i = 0; i < 30; i++) for (const z of [-5230, -5170]) { const m = new THREE.Mesh(new THREE.SphereGeometry(.8, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(i % 2 ? '#ffd27a' : '#7ab0ff').multiplyScalar(4) })); m.position.set(-1500 + i * 100, y0 + .5, z); S.scene.add(m); }
    S.update = (lt) => { const x = -1300 + Math.pow(lt, 2) * 28; p.position.set(x, y0 + Math.max(0, lt - 4) ** 2 * 6, -5200); p.rotation.x = -Math.min(.12, Math.max(0, lt - 4) * .08); p.userData.spin(lt + 3); key.position.set(x + 30, y0 + 25, -5160); rim.position.set(x - 30, y0 + 6, -5240); look(S.camera, [x + 55, y0 + 5, -5150], [x, y0 + 4, -5200]); };
    S.draw = (g, lt, t) => { side(g, lt, t, 'BOCKSCAR', 'B-29 · second atomic mission'); lowerThird(g, t - T('Major Charles'), 'MAJ. CHARLES SWEENEY', 'pilot, Bockscar'); };
    S.grade = { tint: [.94, .98, 1.08], bloom: .8 };
    return S;
  }, { bed: [[T('A B-29 named'), T('In its bomb bay'), 'engine', { gain: .2, f: 50 }]] });

  add(T('In its bomb bay') - .1, 'fat-man', () => {
    const S = stage({ sky: false, bg: '#030303', light: { sun: [0, 10, 0], sunI: 0, hemiI: .03, shadow: false } });
    const b = fatMan(); S.scene.add(b); const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M('#0a0a0a', { rough: .3, metal: .5 })); fl.rotation.x = -Math.PI / 2; fl.position.y = -.8; S.scene.add(fl);
    const sp = (pos, col, i) => { const l = new THREE.SpotLight(col, i, 0, .6, .4, 2); l.position.set(...pos); l.target.position.set(0, 0, 0); l.castShadow = true; S.scene.add(l, l.target); }; sp([3, 3, -2], '#ffb060', 140); sp([-3, 2.5, 2], '#7ab0ff', 90); sp([0, 6, 1], '#ffffff', 40);
    S.update = (lt) => { const a = lt * .2 + .8; look(S.camera, [Math.sin(a) * 5, .7, Math.cos(a) * 5], [0, 0, -.2]); };
    S.draw = (g, lt, t) => { stamp(g, t - T('is Fat Man'), 'FAT MAN', W / 2, 150, { font: F.title(130), color: '#fff', track: 30 }); kinetic(g, t, [{ s: 'MORE POWERFUL THAN LITTLE BOY', at: T('more complex'), x: W / 2, y: H - 200, font: F.title(56), color: '#ffcf8a', track: 8 }]); };
    S.grade = { bloom: .7, vignette: .7, contrast: 1.15 };
    return S;
  }, { sfx: [[T('is Fat Man'), 'boom', { gain: .5 }]] });

  add(T('a plutonium implosion') - .1, 'implosion', () => flat(null, (g, lt, t) => implosion(g, lt, t, { at: .9 })), { sfx: [[T('a plutonium implosion') + .9, 'whoosh', { gain: .3, up: false, dur: .7 }], [T('a plutonium implosion') + 1.6, 'boom', { gain: .4 }]] });

  add(T('The primary target is Kokura') - .1, 'kokura-target', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [132, 33.5], 2400], [4, [131, 33.7], 3800]]); drawMap(g, p, { theme: 'ink', highlight: { japan: '#30373a' } });
    marker(g, p, LL.hiroshima, 'HIROSHIMA', 1, { side: 1, color: '#555', font: F.title(30), labelCol: '#888' });
    marker(g, p, LL.kokura, 'KOKURA', clamp(lt / .4), { side: 1, color: PAL.red, pulse: lt * .8, sub: 'major military arsenal' });
    marker(g, p, LL.nagasaki, 'NAGASAKI', 1, { side: -1, color: '#8a8a8a', font: F.title(30), labelCol: '#aaa' });
    reveal(g, 'PRIMARY TARGET', 120, 120, clamp(lt / .6), { font: F.mono(32, 700), align: 'left', color: PAL.red, dy: 0, dx: -20, track: 6 });
  }), { sfx: [[T('The primary target is Kokura'), 'pop', {}]] });

  add(T('From the beginning, things') - .1, 'go-wrong', () => words('noir', [{ s: 'FROM THE BEGINNING,', at: T('From the beginning, things'), x: W / 2, y: H / 2 - 70, font: F.title(80, 500), color: '#f0d8d0', track: 10 }, { s: 'THINGS GO WRONG', at: T('things go wrong'), x: W / 2, y: H / 2 + 60, font: F.title(140), color: '#fff', track: 14 }], { captions: false }), { sfx: [[T('things go wrong'), 'boom', { gain: .45, pitch: 1.2 }]] });

  add(T('A faulty fuel pump') - .1, 'fuel-pump', () => flat('ink', (g, lt, t) => {
    gauge(g, 600, 560, 270, lerp(.72, .55, clamp(lt / 3)), { k: clamp(lt / .4), label: 'MAIN FUEL' });
    gauge(g, 1320, 560, 270, .6, { k: clamp((lt - .2) / .4), label: 'RESERVE · 640 GAL', col: '#888' });
    const k = clamp((t - T('reserve fuel')) / .4); if (k > 0) { g.save(); g.globalAlpha = k; g.strokeStyle = PAL.red; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(1140, 380); g.lineTo(1500, 740); g.moveTo(1500, 380); g.lineTo(1140, 740); g.stroke(); g.restore(); stamp(g, t - T('inaccessible'), 'INACCESSIBLE', 1320, 900, { font: F.title(70), color: '#fff', bg: 'rgba(200,20,20,.9)', pad: 24 }); }
    reveal(g, 'FAULTY FUEL PUMP', W / 2, 140, clamp(lt / .6), { font: F.title(80), color: '#fff', track: 12 });
  }), { sfx: [[T('A faulty fuel pump'), 'clunk', { gain: .4 }], [T('inaccessible'), 'stamp', { gain: .4 }]] });

  add(T('When Boxcar reaches') - .1, 'kokura-clouds', () => {
    const S = S2.skyFlight({ ...BOCK, tod: 'storm', cloudY: -260 }); const p = S.plane;
    const sm = smoke([[0, -400, -3000, 40], [600, -400, -3600, 40]], { col: '#3a3632', col2: '#7a746c', alpha: .55, rise: 30, spread: 6, rate: .05 }); S.scene.add(sm); S.particles.push(sm);
    S.update = (lt) => { p.position.set(0, 0, -lt * 90); p.rotation.y = Math.PI; p.userData.spin(lt); look(S.camera, [40, 14, -lt * 90 + 60], [0, -40, -lt * 90 - 300]); };
    S.draw = (g, lt, t) => { side(g, lt, t, 'KOKURA', 'clouds and smoke hide the target', T('obscure the target')); };
    S.grade = { sat: .7, tint: [.98, 1, 1.03], bloom: .4 };
    return S;
  }, { bed: [[T('When Boxcar reaches'), T('Sweeney decides'), 'engine', { gain: .15 }]] });

  add(T('The crew makes three') - .1, 'three-passes', () => flat(null, (g, lt, t) => {
    blueprintBG(g, t); reveal(g, 'KOKURA · BOMBING RUNS', 120, 110, clamp(lt / .6), { font: F.mono(32, 700), align: 'left', color: '#bfe2ff', dy: 0, dx: -20, track: 6 });
    g.save(); g.fillStyle = 'rgba(200,210,220,.18)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(800 + Math.sin(i * 2.3) * 300, 540 + Math.cos(i * 1.7) * 200, 90 + (i % 4) * 30, 0, 7); g.fill(); } g.restore();
    const pk = clamp((lt - .3) / 3.6); const passes = Math.min(3, Math.floor(pk * 3 + 1));
    for (let i = 0; i < 3; i++) { const k = clamp(pk * 3 - i); if (k <= 0) continue; g.save(); g.strokeStyle = i === passes - 1 ? '#ffcf6a' : 'rgba(191,226,255,.6)'; g.lineWidth = 5; g.beginPath(); g.ellipse(900 + i * 30, 540 + i * 20, 520 - i * 40, 230 - i * 20, -.15, Math.PI, Math.PI + Math.PI * 2 * k); g.stroke(); g.restore(); }
    text(g, `PASS ${passes} / 3`, W - 200, 200, { font: F.mono(60, 700), color: '#ffcf6a', align: 'right' });
    stamp(g, t - T('cannot identify'), 'TARGET NOT VISIBLE', W / 2, H - 170, { font: F.title(64), color: '#fff', bg: 'rgba(200,20,20,.85)', pad: 26 });
  }), { sfx: [[T('three passes'), 'whoosh', { gain: .2 }], [T('cannot identify'), 'stamp', { gain: .35 }]] });

  add(T('Anti-aircraft guns') - .1, 'flak', () => {
    const S = S2.skyFlight({ ...BOCK, tod: 'storm', cloudY: -260 }); const p = S.plane; const r = rng(4); const D = []; for (let i = 0; i < 60; i++) D.push([r(), r(), r(), r()]);
    const fl = new Particles(60, { shade: 1 }); fl.fn = (i, lt, o) => { const d = D[i]; const t0 = d[0] * 3; const k = lt - t0; if (k < 0) { o.a = 0; return; } o.x = (d[1] - .5) * 160; o.y = (d[2] - .5) * 60; o.z = -lt * 90 - 30 - d[3] * 200; o.s = 6 + k * 10; o.r = o.g = o.b = .12; o.a = clamp(1.2 - k / 3); }; S.scene.add(fl); S.particles.push(fl);
    const fx = new Particles(60, { map: softDot(), additive: true, shade: 0 }); fx.fn = (i, lt, o) => { const d = D[i]; const k = lt - d[0] * 3; if (k < 0 || k > .25) { o.a = 0; return; } o.x = (d[1] - .5) * 160; o.y = (d[2] - .5) * 60; o.z = -lt * 90 - 30 - d[3] * 200; o.s = 14; o.r = 1; o.g = .7; o.b = .3; o.a = 1 - k * 4; }; S.scene.add(fx); S.particles.push(fx);
    S.update = (lt) => { p.position.set(0, 0, -lt * 90); p.rotation.y = Math.PI; p.userData.spin(lt); look(S.camera, [-36, 8, -lt * 90 + 46], [0, 0, -lt * 90 - 40]); shake(S.camera, lt, .6); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'ANTI-AIRCRAFT FIRE', at: T('Anti-aircraft guns'), x: W / 2, y: 140, font: F.title(70), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    S.grade = { sat: .7, bloom: .7 };
    return S;
  }, { sfx: Array.from({ length: 6 }, (_, i) => [T('Anti-aircraft guns') + i * .45, 'flak', { gain: .35, p: (i % 2 ? .5 : -.5) }]) });

  add(T('Japanese fighters take off') - .1, 'fighters', () => {
    const S = S2.skyFlight({ name: '', tail: '', tailNum: '', tod: 'storm', cloudY: -260 }); S.scene.remove(S.plane); const fs = []; for (let i = 0; i < 4; i++) { const f = fighter(); S.scene.add(f); fs.push(f); }
    S.update = (lt) => { fs.forEach((f, i) => { f.position.set(-30 + i * 22, -240 + lt * 60 + i * 8, -lt * 40 - i * 30); f.rotation.set(-.45, 0, Math.sin(lt + i) * .2); }); look(S.camera, [60, -200 + lt * 60, 60], [0, -230 + lt * 60, -60]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'FIGHTERS SCRAMBLE', at: T('Japanese fighters take off'), x: W / 2, y: 140, font: F.title(70), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    S.grade = { sat: .75, bloom: .5 };
    return S;
  }, { bed: [[T('Japanese fighters take off'), T('Fuel is running low'), 'engine', { gain: .14, f: 90 }]] });

  add(T('Fuel is running low') - .1, 'fuel-low', () => flat('ink', (g, lt, t) => { const blink = Math.sin(lt * 12) > 0; gauge(g, W / 2, 560, 330, lerp(.22, .14, clamp(lt / 1.5)), { k: 1, label: 'FUEL', warn: .25 }); if (blink) stamp(g, 3, 'LOW FUEL', W / 2, 160, { font: F.title(90), color: '#ff3a2a', track: 16 }); }),
    { sfx: [[T('Fuel is running low'), 'blip', { gain: .15, f: 900 }], [T('Fuel is running low') + .3, 'blip', { gain: .15, f: 900 }], [T('Fuel is running low') + .6, 'blip', { gain: .15, f: 900 }]] });

  add(T('Sweeney decides') - .1, 'to-nagasaki', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [130.8, 33.4], 4200], [3.4, [130.5, 33.3], 4800]]); drawMap(g, p, { theme: 'ink', highlight: { japan: '#30373a' } });
    marker(g, p, LL.kokura, 'KOKURA', 1, { side: 1, color: '#666', labelCol: '#888', strike: clamp((lt - .2) / .5) });
    route(g, p, [LL.kokura, LL.nagasaki], clamp((t - T('alternate target')) / 1.4), { color: PAL.amber });
    marker(g, p, LL.nagasaki, 'NAGASAKI', clamp((t - T('target, Nagasaki')) / .4), { side: 1, color: PAL.red, pulse: lt * .8, sub: 'alternate target' });
  }), { sfx: [[T('alternate target'), 'whoosh', { gain: .2 }], [T('target, Nagasaki') + .2, 'boom', { gain: .4 }]] });

  // ── NAGASAKI ─────────────────────────────────────────────────
  add(T('The attack on Nagasaki') - .15, 'title-nagasaki', () => titleCard({ big: 'NAGASAKI', small: 'THE SECOND ATTACK', date: '11:00 a.m.', dateAt: T('11 AM'), accent: '#ff3a2a' }),
    { sfx: [[T('The attack on Nagasaki') - .1, 'boom'], [T('11 AM'), 'tick', { gain: .5 }]], bed: [[T('The attack on Nagasaki'), T('Nagasaki is a major'), 'ticking', { gain: .16 }]] });

  add(T('Nagasaki is a major') - .1, 'nagasaki-valley', () => {
    const S = S4.nagasaki({ clouds: false });
    S.update = (lt) => camPath(S.camera, lt, [[0, [2600, 1500, 3600], [0, 0, -400], 40], [4.2, [2000, 1200, 2800], [0, 0, -400], 40]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'NAGASAKI', 'a port city in valleys between mountains', T('spread through valleys'));
    return S;
  }, { bed: [[T('Nagasaki is a major'), T('Then, a break'), 'engine', { gain: .1 }]] });

  add(T('Boxcar approaches with') - .1, 'okinawa-range', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [129, 29.5], 1700], [3.5, [128.8, 29.6], 1900]]); drawMap(g, p, { theme: 'ink', highlight: { japan: '#30373a' } });
    marker(g, p, LL.nagasaki, 'NAGASAKI', 1, { side: 1, color: PAL.red });
    marker(g, p, LL.okinawa, 'OKINAWA', clamp((t - T('reach Okinawa')) / .4), { side: 1, color: '#7ad0ff', sub: 'nearest friendly base' });
    route(g, p, [LL.nagasaki, LL.okinawa], clamp((t - T('barely enough')) / 1.8), { color: '#ffcf6a', dash: [6, 10], head: false });
    gauge(g, 260, H - 250, 150, .1, { k: clamp(lt / .4), label: 'FUEL', warn: .25 });
  }), { sfx: [[T('barely enough'), 'blip', { gain: .12, f: 800 }]] });

  add(T('Nagasaki, too, is hidden') - .1, 'nagasaki-clouds', () => {
    const S = S4.nagasaki({ clouds: true });
    S.update = (lt) => camPath(S.camera, lt, [[0, [1800, 4200, 3000], [0, 2000, -400], 40], [2.6, [1500, 4100, 2600], [0, 2000, -400], 40]]);
    return S;
  });

  add(T('The city is visible on radar') - .1, 'radar', () => flat(null, (g, lt, t) => {
    g.fillStyle = '#020604'; g.fillRect(0, 0, W, H);
    radar(g, 700, H / 2, 380, lt, { blips: [[.1, .05, 10, 1], [.15, -.1, 8, 1], [-.05, .2, 7, 1], [.3, .25, 6], [-.35, -.2, 6], [.22, .02, 9, 1]], label: 'AN/APQ-13 RADAR · NAGASAKI' });
    reveal(g, 'ORDERS:', 1260, 380, clamp((t - T('under orders')) / .5), { font: F.mono(44, 700), align: 'left', color: '#4dff9a', dy: 0, dx: -20 });
    reveal(g, 'IDENTIFY THE', 1260, 470, clamp((t - T('identify the target')) / .5), { font: F.title(80), align: 'left', color: '#fff', dy: 0, dx: -20 });
    reveal(g, 'TARGET VISUALLY', 1260, 560, clamp((t - T('target visually')) / .5), { font: F.title(80), align: 'left', color: '#ffcf6a', dy: 0, dx: -20 });
    vignette(g, .6); grain(g, t, .9);
  }), { bed: [[T('The city is visible on radar'), T('Sweeney is almost'), 'static', { gain: .04 }]], sfx: [[T('The city is visible on radar'), 'blip', { gain: .12 }], [T('target visually'), 'stamp', { gain: .3 }]] });

  add(T('Sweeney is almost') - .1, 'options', () => flat('paper', (g, lt, t) => {
    reveal(g, 'ALMOST OUT OF OPTIONS', W / 2, 190, clamp(lt / .6), { font: F.sans(80, 800), color: '#151515' });
    const k1 = clamp((t - T('drop the weapon')) / .5), k2 = clamp((t - T('emergency landing')) / .5);
    panel(g, 220, 330, 680, 520, { k: k1, fill: '#f8f6f1' }); panel(g, 1020, 330, 680, 520, { k: k2, fill: '#f8f6f1' });
    if (k1 > 0) { g.save(); g.globalAlpha = k1; text(g, 'A', 560, 450, { font: F.sans(120, 800), color: PAL.red }); text(g, 'DROP THE BOMB', 560, 600, { font: F.sans(56, 800), color: '#151515' }); text(g, 'into the ocean', 560, 680, { font: F.serif(46), color: '#444' }); g.restore(); }
    if (k2 > 0) { g.save(); g.globalAlpha = k2; text(g, 'B', 1360, 450, { font: F.sans(120, 800), color: PAL.red }); text(g, 'EMERGENCY LANDING', 1360, 600, { font: F.sans(52, 800), color: '#151515' }); text(g, 'on Okinawa — bomb still aboard', 1360, 680, { font: F.serif(40), color: '#444' }); g.restore(); }
  }, { captions: true }), { sfx: [[T('drop the weapon'), 'pop', {}], [T('emergency landing'), 'pop', { f: 700 }]] });

  add(T('Then, a break appears') - .1, 'cloud-break', () => {
    const S = S4.nagasaki({ clouds: true, gap: 1 }); const cl = S.clouds; const base = cl.fn;
    S.update = (lt) => { const hole = 200 + easeOut(clamp(lt / 2)) * 1500; cl.fn = (i, t, o) => { base(i, t, o); const d = Math.hypot(o.x - NAGA.stadium[0], o.z - NAGA.stadium[1]); o.a *= clamp((d - hole) / 400); }; camPath(S.camera, lt, [[0, [600, 5400, 1500], [-100, 0, -800], 40], [2.4, [500, 5000, 1200], [-100, 0, -800], 38]]); };
    S.grade = { sat: 1.05, bloom: .7, exposure: 1.05 };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'A BREAK IN THE CLOUDS', at: T('a break appears'), x: W / 2, y: 140, font: F.title(70), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { sfx: [[T('a break appears'), 'riser', { dur: 2, gain: .25 }]] });

  add(T('Bombardier Kermit') - .1, 'beahan-sight', () => {
    const S = S4.nagasaki({ clouds: false }); const t0 = T('Bombardier Kermit') - .1;
    S.update = (lt) => { look(S.camera, [NAGA.stadium[0] + 2, 9000, NAGA.stadium[1] + 3], [NAGA.stadium[0], 0, NAGA.stadium[1]]); S.camera.fov = lerp(16, 7, easeInOut(clamp(lt / 3))); };
    S.draw = (g, lt, t) => { g.save(); g.strokeStyle = 'rgba(255,60,40,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(W / 2, H / 2, 300, 0, 7); g.stroke(); g.beginPath(); g.moveTo(W / 2 - 520, H / 2); g.lineTo(W / 2 + 520, H / 2); g.moveTo(W / 2, H / 2 - 420); g.lineTo(W / 2, H / 2 + 420); g.stroke(); g.restore();
      g.save(); g.fillStyle = 'rgba(0,0,0,.88)'; g.beginPath(); g.rect(0, 0, W, H); g.moveTo(W / 2 + 500, H / 2); g.arc(W / 2, H / 2, 500, 0, Math.PI * 2, true); g.fill('evenodd'); g.restore();
      lowerThird(g, t - T('Bombardier Kermit'), 'CAPT. KERMIT BEAHAN', 'bombardier, Bockscar', { y: 950 }); stamp(g, t - T('a stadium'), 'STADIUM', W / 2 + 260, H / 2 - 160, { font: F.title(50), color: '#ffcf6a', track: 6 }); stamp(g, t - T('Urakami Valley'), 'URAKAMI VALLEY', W / 2, H / 2 + 240, { font: F.title(50), color: '#fff', track: 6 }); };
    S.grade = { sat: .6, tint: [.95, 1.05, .95], contrast: 1.2, grain: .09 };
    return S;
  }, { sfx: [[T('a stadium'), 'pop', { f: 900 }]] });

  add(T('11.02 AM') - .1, 'clock-1102', () => flat('black', (g, lt, t) => { clockFace(g, W / 2, H / 2 - 40, 300, 11, 2, (lt * 10) % 60, { k: clamp(lt / .5) }); text(g, '11:02 A.M.', W / 2, H - 120, { font: F.mono(60, 700), color: '#fff', alpha: clamp(lt / .5), track: 8 }); }, { captions: false }), { sfx: [[T('11.02 AM'), 'tick', { gain: .5 }], [T('11.02 AM') + .5, 'tick', { gain: .5, hi: false }], [T('11.02 AM') + 1, 'tick', { gain: .5 }]] });

  add(T('Fat Man leaves') - .1, 'fatman-drop', () => {
    const S = S2.skyFlight({ ...BOCK, tod: 'day', cloudY: -2600, bombVisible: true, bomb: 'fm' }); const p = S.plane; p.userData.openDoors(1); const b = p.userData.bomb; const tr = .35; let freed = false;
    S.update = (lt) => { p.position.set(0, 0, lt * 90); p.userData.spin(lt); const k = lt - tr; if (k > 0 && !freed) { freed = true; p.userData.bombMount.remove(b); S.scene.add(b); } const by = freed ? -.65 - 4.9 * k * k : -.65; if (freed) { b.position.set(0, by, lt * 90 + 3.2 - k * 5); b.rotation.x = Math.min(1.3, k * .5); } look(S.camera, [10, -6 + by * .6, lt * 90 - 6], [0, by, lt * 90 + 3]); };
    return S;
  }, { sfx: [[T('Fat Man leaves'), 'clunk', { gain: .6 }], [T('Fat Man leaves') + .2, 'whoosh', { gain: .3, up: false }]] });

  const tN = T('It explodes roughly');
  add(tN - .1, 'nagasaki-blast', () => {
    const S = S4.nagasaki({ clouds: false }); S.blastAt = .25;
    S.update = (lt) => { camPath(S.camera, lt, [[0, [5200, 900, 6200], [0, 900, -300], 40], [6, [4700, 900, 5600], [0, 1600, -300], 42]]); const k = lt - S.blastAt; if (k > 0) shake(S.camera, lt, clamp(1 - k / 3) * 18); };
    S.draw = (g, lt, t) => { stamp(g, t - T('1,600 feet'), '1,600 FT', W / 2 + 330, 300, { font: F.title(64), color: '#fff', bg: 'rgba(0,0,0,.5)', pad: 20 }); reveal(g, 'URAKAMI · a large Christian community', 140, 150, clamp((t - T('above Urakami')) / .6), { font: F.serif(46), align: 'left', color: '#fff', dx: -30, dy: 0, shadow: ['#000', 14] }); };
    return S;
  }, { sfx: [[tN + .15, 'flash', { gain: .3 }], [tN + .2, 'explosion', { gain: 1, dur: 9 }]] });

  add(T('The blast is more powerful') - .1, 'yield-compare', () => flat('ink', (g, lt, t) => {
    reveal(g, 'EXPLOSIVE YIELD · TONS OF TNT', 200, 210, clamp(lt / .6), { font: F.title(64), align: 'left', color: '#fff', dx: -30, dy: 0, track: 6 });
    barH(g, { x: 200, y: 400, w: 1500, frac: 15 / 21, k: clamp(lt / 1), label: 'HIROSHIMA · LITTLE BOY', value: '≈ 15,000 t', color: '#e08a3a' });
    const k2 = clamp((t - T('21,000 tons')) / 1); barH(g, { x: 200, y: 620, w: 1500, frac: 1, k: k2, label: 'NAGASAKI · FAT MAN', value: k2 > 0 ? fmt(count(t, T('21,000 tons'), T('21,000 tons') + 1, 0, 21000)) + ' t' : '', color: PAL.red });
    if (t > T('21,000 tons')) { const n = Math.floor(clamp((t - T('21,000 tons')) / 1.4) * 42); for (let i = 0; i < n; i++) { g.fillStyle = 'rgba(255,200,120,.75)'; g.fillRect(200 + (i % 21) * 34, 800 + Math.floor(i / 21) * 34, 26, 26); } text(g, '■ = 500 t TNT', 200 + 21 * 34 + 30, 830, { font: F.mono(26), align: 'left', color: '#aaa', alpha: clamp(n / 10) }); }
  }), { sfx: [[T('21,000 tons'), 'counter', { dur: 1 }]] });

  add(T('The fireball instantly') - .1, 'cathedral', () => {
    const S = stage({ sky: { top: '#5a2a1a', mid: '#ff9a50', bot: '#3a2018', sun: [0, .3, -1], sunCol: '#ffb070', sunGlow: .8 }, light: { sun: [0, 120, -300], sunCol: '#ffb070', sunI: 3.5, hemiI: .6, area: 90 }, near: .5, far: 4000 });
    S.scene.fog = new THREE.Fog('#c86a3a', 100, 900);
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), M('#5a4030', { rough: 1 })); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; S.scene.add(gnd);
    const c = S4B.cathedral(); S.scene.add(c); const fi = fire([[-10, 4, 20, 6], [10, 4, 20, 6], [0, 10, -10, 8], [-30, 2, 40, 5], [30, 2, 40, 5]], { per: 26, height: 3 }); S.scene.add(fi); S.particles.push(fi);
    const glow = new THREE.PointLight('#ff8a3a', 30000, 300, 2); glow.position.set(0, 60, -120); S.scene.add(glow);
    S.update = (lt) => { camPath(S.camera, lt, [[0, [60, 12, 110], [0, 18, 0], 40], [8.6, [40, 10, 80], [0, 20, 0], 40]]); glow.intensity = 30000 + Math.sin(lt * 7) * 4000; };
    S.draw = (g, lt, t) => { side(g, lt, t, 'URAKAMI CATHEDRAL', 'largest Catholic cathedral in Asia', T('the largest Catholic')); kinetic(g, t, [{ s: 'MITSUBISHI FACTORIES', at: T('Mitsubishi factories'), x: 420, y: H - 200, font: F.title(46), color: '#fff', track: 6, shadow: ['#000', 20] }, { s: 'SCHOOLS', at: T('schools, and'), x: W / 2 + 120, y: H - 200, font: F.title(46), color: '#fff', track: 6, shadow: ['#000', 20] }, { s: 'HOSPITALS', at: T('and hospitals'), x: W - 360, y: H - 200, font: F.title(46), color: '#fff', track: 6, shadow: ['#000', 20] }]); };
    S.grade = { tint: [1.12, .94, .86], bloom: .9, contrast: 1.1 };
    return S;
  }, { bed: [[T('The fireball instantly'), T('The surrounding mountains'), 'fire', { gain: .16 }]], sfx: [[T('The fireball instantly'), 'whoosh', { gain: .35, dur: 1 }]] });

  add(T('The surrounding mountains') - .1, 'mountain-shield', () => flat(null, (g, lt, t) => mountainShield(g, lt, t, { waveAt: .6 })), { sfx: [[T('The surrounding mountains') + .6, 'rumble', { dur: 4, gain: .5 }]] });

  add(T('But within the valley') - .1, 'valley-total', () => {
    const S = S4.nagasaki({ ruined: true, clouds: false }); S.scene.fog.color.set('#9a8a7a');
    const sm = smoke(S.city.fireSpots(40, 1200, 4).map(([x, y, z]) => [x, y + 10, z, 10]), { col: '#3a3430', col2: '#7a7068', alpha: .4, rise: 60, spread: 9, drift: [4, 0], rate: .06 }); S.scene.add(sm); S.particles.push(sm);
    S.update = (lt) => camPath(S.camera, lt, [[0, [1400, 900, 1800], [0, 0, -300], 40], [3, [1100, 700, 1400], [0, 0, -300], 40]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'THE DESTRUCTION IS TOTAL', at: T('destruction is total'), x: W / 2, y: 140, font: F.title(70), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    S.grade = { sat: .55, tint: [1.04, 1, .96], bloom: .4 };
    return S;
  }, { bed: [[T('But within the valley'), T('24 hours after the Nagasaki'), 'wind', { gain: .12, f: 300 }]] });

  add(T('Tens of thousands more') - .1, 'more-lives', () => flat('black', (g, lt, t) => { reveal(g, 'TENS OF THOUSANDS MORE', W / 2, H / 2 - 40, clamp(lt / .6), { font: F.title(100), color: '#fff', track: 10 }); reveal(g, 'lives end in an instant', W / 2, H / 2 + 80, clamp((lt - .6) / .6), { font: F.serif(56), color: PAL.red }); }, { captions: false }),
    { sfx: [[T('Tens of thousands more'), 'piano', { notes: [40, 47], gain: .2, dur: 5 }]] });

  // ── 24 HOURS AFTER NAGASAKI ──────────────────────────────────
  add(T('24 hours after the Nagasaki') - .15, 'two-cities', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [133, 34.5], 2600], [5, [132.6, 34], 2900]]); drawMap(g, p, { theme: 'ink', highlight: { japan: '#30373a' } });
    marker(g, p, LL.hiroshima, 'HIROSHIMA', clamp(lt / .4), { side: 1, color: PAL.red, pulse: lt * .7, sub: 'August 6' }); marker(g, p, LL.nagasaki, 'NAGASAKI', clamp((lt - .4) / .4), { side: -1, color: PAL.red, pulse: lt * .7 + .5, sub: 'August 9' });
    reveal(g, '24 HOURS AFTER NAGASAKI', 120, 120, clamp(lt / .6), { font: F.mono(32, 700), align: 'left', color: '#ffcf6a', dy: 0, dx: -20, track: 6 });
    stamp(g, t - T('two cities'), 'TWO CITIES DEVASTATED', W / 2, H - 170, { font: F.title(64), color: '#fff', bg: 'rgba(180,20,25,.9)', pad: 26 });
  }), { sfx: [[T('24 hours after the Nagasaki') - .1, 'boom'], [T('two cities'), 'stamp', { gain: .35 }]] });

  add(T('Soviet tanks are advancing') - .1, 'soviet-tanks', () => {
    const S = S4.sovietTanks();
    S.update = (lt) => { camPath(S.camera, lt, [[0, [24, 3, 40], [0, 2, -20], 40], [3, [18, 2.5, 34], [0, 2, -10], 40]]); shake(S.camera, lt, .05); };
    S.draw = (g, lt, t) => side(g, lt, t, 'MANCHURIA', 'Soviet tanks advance rapidly');
    return S;
  }, { bed: [[T('Soviet tanks are advancing'), T('In Tokyo, the Supreme'), 'engine', { gain: .14, f: 38 }]], sfx: [[T('Soviet tanks are advancing') + .4, 'rumble', { dur: 3, gain: .4 }]] });

  add(T('In Tokyo, the Supreme') - .1, 'war-council', () => {
    const S = S4.warRoom({ council: true });
    S.update = (lt) => camPath(S.camera, lt, [[0, [-4, 2.4, 3], [0, .9, 0], 40], [4.3, [-3.2, 2, 2.4], [0, 1, 0], 38]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'SUPREME WAR COUNCIL', 'in continuous session', T('continuous session'));
    return S;
  }, { bed: [[T('In Tokyo, the Supreme'), T('One week later, across'), 'drone', { gain: .08, root: 36, chord: [0, 3, 7] }]] });

  add(T('Its members are evenly') - .1, 'divided', () => flat('paper', (g, lt, t) => {
    reveal(g, 'EVENLY DIVIDED', W / 2, 170, clamp(lt / .6), { font: F.sans(84, 800), color: '#151515' });
    g.fillStyle = '#151515'; g.fillRect(W / 2 - 3, 270, 6, 600 * expoOut(clamp(lt / .8)));
    const kL = clamp((t - T('Half favor')) / .5), kR = clamp((t - T('The others, including')) / .5);
    const ppl = (x0, k, col) => { for (let i = 0; i < 3; i++) { const x = x0 + i * 170, y = 470; g.save(); g.globalAlpha = clamp(k * 3 - i * .5); g.fillStyle = col; g.beginPath(); g.arc(x, y - 70, 40, 0, 7); g.fill(); g.beginPath(); g.roundRect(x - 55, y - 20, 110, 160, 30); g.fill(); g.restore(); } };
    ppl(330, kL, '#2a2a2a'); ppl(1250, kR, PAL.red);
    if (kL > 0) { text(g, 'SURRENDER', 500, 750, { font: F.sans(64, 800), color: '#151515', alpha: kL }); text(g, 'accept the Potsdam terms', 500, 820, { font: F.serif(38), color: '#555', alpha: kL }); }
    if (kR > 0) { text(g, 'FIGHT ON', 1420, 750, { font: F.sans(64, 800), color: PAL.red, alpha: kR }); text(g, 'army minister · army chief of staff', 1420, 820, { font: F.serif(36), color: '#555', alpha: kR }); }
    kinetic(g, t, [{ s: 'A FINAL BATTLE ON THE HOME ISLANDS', at: T('a final battle'), x: W / 2, y: 940, font: F.sans(44, 800), color: '#151515', dy: 20 }, { s: 'even at the cost of millions of civilian lives', at: T('even at the cost'), x: W / 2, y: 1010, font: F.serif(40), color: PAL.red, dy: 14 }]);
  }, { captions: false }), { sfx: [[T('Half favor'), 'pop', {}], [T('The others, including'), 'pop', { f: 500 }], [T('millions of civilian'), 'heartbeat', { beats: 2, gain: .3 }]] });

  add(T("For the first time in Japan's") - .1, 'hirohito', () => {
    const S = S4.warRoom({ council: true }); const sp = new THREE.SpotLight('#ffe2a0', 160, 0, .35, .5, 2); sp.position.set(2.75, 3, 0); sp.target.position.set(2.75, 1, 0); S.scene.add(sp, sp.target);
    S.update = (lt) => camPath(S.camera, lt, [[0, [-1.4, 1.4, 1.4], [2.75, 1.2, 0], 40], [6, [-.4, 1.3, .9], [2.75, 1.25, 0], 34]]);
    S.draw = (g, lt, t) => lowerThird(g, t - T('Emperor Hirohito'), 'EMPEROR HIROHITO', 'breaks the customary silence', { align: 'right' });
    return S;
  }, { sfx: [[T('Emperor Hirohito'), 'bell', { gain: .2, f: 147 }]] });

  add(T("Breaking the monarch's") - .1, 'one-condition', () => flat('paper', (g, lt, t) => {
    reveal(g, 'ACCEPT THE POTSDAM DECLARATION', W / 2, 280, clamp((t - T('accept the Potsdam')) / .6), { font: F.sans(70, 800), color: '#151515' });
    stamp(g, t - T('with one condition'), '1 CONDITION', W / 2, 520, { font: F.sans(150, 800), color: PAL.red, rot: -.04 });
    reveal(g, 'preserve imperial authority', W / 2, 720, clamp((t - T('preserving imperial')) / .6), { font: F.serif(64), color: '#333' });
  }), { sfx: [[T('accept the Potsdam'), 'paper', { gain: .2 }], [T('with one condition'), 'stamp', { gain: .5 }]] });

  // ── ONE WEEK LATER: the broadcast ────────────────────────────
  add(T('One week later, across') - .15, 'title-1w-later', () => titleCard({ big: '1 WEEK LATER', small: '', date: 'August 15, 1945 · noon', dateAt: T('One week later, across') + .3 }), { sfx: [[T('One week later, across') - .1, 'boom']] });

  add(T('across Japan, people gather') - .1, 'radio-family', () => {
    const S = S4.radioFamily();
    S.update = (lt) => camPath(S.camera, lt, [[0, [3.4, 1.8, 3.6], [0, .6, -.6], 40], [6.4, [2.6, 1.5, 2.8], [0, .5, -.9], 38]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: "THE EMPEROR'S VOICE", at: T("emperor's voice"), x: W / 2, y: 140, font: F.title(70), color: '#ffe8c8', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('across Japan, people gather'), T('But the central message'), 'static', { gain: .05 }]] });

  const RESCRIPT = ['朕深ク世界ノ大勢ト', '帝國ノ現狀トニ鑑ミ', '非常ノ措置ヲ以テ', '時局ヲ收拾セムト欲シ'];
  add(T('Through the static') - .1, 'rescript', () => flat(null, (g, lt, t) => {
    g.fillStyle = '#0c0a08'; g.fillRect(0, 0, W, H);
    const k = clamp(lt / 6); RESCRIPT.forEach((col, i) => { const x = W - 360 - i * 150; [...col].forEach((ch, j) => { const a = clamp(k * 40 - (i * 9 + j) * .9); text(g, ch, x, 140 + j * 92, { font: F.jp(76), color: '#efe4cc', alpha: a, shadow: ['rgba(255,200,120,.3)', 16] }); }); });
    const wv = []; for (let i = 0; i < 200; i++) wv.push(Math.sin(i * .37 + lt * 20) * Math.sin(i * .05 + lt * 3) * (.4 + .6 * Math.abs(Math.sin(lt * 2.3 + i * .02))));
    g.save(); g.strokeStyle = '#ffb050'; g.lineWidth = 3; g.shadowColor = '#ffb050'; g.shadowBlur = 14; g.beginPath(); wv.forEach((v, i) => { const x = 140 + i * 4, y = H / 2 + v * 120 + (Math.sin(i * 91.7 + lt * 50) * 8); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.restore();
    reveal(g, 'THE JEWEL VOICE BROADCAST', 140, 200, clamp(lt / .6), { font: F.mono(30, 700), align: 'left', color: '#ffcf8a', dy: 0, dx: -20, track: 6 });
    reveal(g, 'formal, archaic court language', 140, 860, clamp((t - T('archaic language')) / .6), { font: F.serif(48), align: 'left', color: '#d8ccb8', dx: -20, dy: 0 });
    vignette(g, .6); grain(g, t, 1);
  }), { bed: [[T('Through the static'), T('But the central message'), 'static', { gain: .08 }]] });

  add(T('But the central message') - .1, 'message', () => words('black', [
    { s: 'THE WAR HAS TURNED AGAINST JAPAN', at: T('The war has turned'), x: W / 2, y: 260, font: F.title(64), color: '#fff', track: 6, out: T('The enemy has begun') - .3 },
    { s: '"a new and exceptionally cruel bomb"', at: T('exceptionally cruel'), x: W / 2, y: 420, font: F.serif(70), color: '#ffcf9a', out: T('Continuing the war') - .3 },
    { s: '"of immeasurable destructive power"', at: T('immeasurable destructive'), x: W / 2, y: 540, font: F.serif(60), color: '#e8dccb', out: T('Continuing the war') - .3 },
    { s: 'taking countless innocent lives', at: T('countless innocent'), x: W / 2, y: 650, font: F.serif(56), color: PAL.red, out: T('Continuing the war') - .3 },
    { s: 'CONTINUING THE WAR', at: T('Continuing the war'), x: W / 2, y: 470, font: F.title(90), color: '#fff', track: 10 },
    { s: 'WOULD DESTROY THE NATION', at: T('destroy the Japanese'), x: W / 2, y: 590, font: F.title(90), color: PAL.red, track: 10 },
  ]), { bed: [[T('But the central message'), T('Japan surrenders.', 0, 800), 'static', { gain: .03 }], [T('But the central message'), T('Japan surrenders.', 0, 800), 'drone', { gain: .07, root: 38, chord: [0, 5, 7, 12] }]] });

  add(T('Japan surrenders.', 0, 800) - .1, 'surrender', () => words('black', [{ s: 'JAPAN SURRENDERS', at: T('Japan surrenders.', 0, 800), x: W / 2, y: H / 2 - 60, font: F.title(150), color: '#fff', track: 16 }, { s: 'WORLD WAR II IS OVER', at: T('World War II'), x: W / 2, y: H / 2 + 100, font: F.title(80, 500), color: PAL.amber, track: 20 }], { captions: false }),
    { sfx: [[T('Japan surrenders.', 0, 800), 'boom', { gain: .6 }], [T('World War II'), 'bell', { gain: .25, f: 196 }]] });

  add(T('In Tokyo, people weep') - .1, 'tokyo-weep', () => {
    const S = S4.crowd({ mood: 'mourn', city: 'tokyo', n: 50 });
    S.update = (lt) => camPath(S.camera, lt, [[0, [0, 3, 30], [0, 1.2, 0], 40], [4, [0, 2.4, 24], [0, 1.2, 0], 38]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'TOKYO', 'despair and relief', T('despair and relief'));
    return S;
  });
  add(T('In New York, London') - .1, 'celebrate', () => {
    const S = S4.crowd({ mood: 'cheer', city: 'west', n: 70 });
    S.update = (lt) => camPath(S.camera, lt, [[0, [0, 3, 34], [0, 6, -20], 42], [4, [2, 4, 26], [0, 8, -30], 42]]);
    S.draw = (g, lt, t) => { kinetic(g, t, [{ s: 'NEW YORK', at: T('In New York'), x: 420, y: 150, font: F.title(70), color: '#fff', track: 8, shadow: ['#000', 24] }, { s: 'LONDON', at: T('London, and'), x: W / 2, y: 150, font: F.title(70), color: '#fff', track: 8, shadow: ['#000', 24] }, { s: 'MOSCOW', at: T('and Moscow'), x: W - 420, y: 150, font: F.title(70), color: '#fff', track: 8, shadow: ['#000', 24] }]); };
    return S;
  }, { sfx: [[T('crowds celebrate'), 'crowd', { dur: 4, gain: .22 }]] });
  add(T('In the ruins of Hiroshima and Nagasaki, people') - .1, 'keep-dying', () => {
    const S = S3.street({ ruined: true, people: 0, seed: 61 }); S.fireP.visible = false; S.particles = S.particles.filter((p) => p !== S.fireP);
    S.update = (lt) => camPath(S.camera, lt, [[0, [0, 1.6, 8], [0, 1.6, -60], 40], [5, [0, 1.6, 4], [0, 1.6, -60], 40]]);
    S.grade = { sat: .35, contrast: 1.15, tint: [1, .98, .96], exposure: .85, vignette: .75 };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'PEOPLE KEEP DYING', at: T('people keep dying'), x: W / 2, y: H - 230, font: F.title(80), color: '#fff', track: 14, shadow: ['#000', 30] }]);
    return S;
  }, { sfx: [[T('people keep dying'), 'piano', { notes: [45, 52, 57], gain: .14, dur: 6 }]], bed: [[T('In the ruins of Hiroshima and Nagasaki, people'), T('One month later, American'), 'wind', { gain: .1, f: 250 }]] });
}
import * as S4B from '../kit/buildings.js';
