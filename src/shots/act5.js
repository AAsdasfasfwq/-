// ACT XV–XVII: occupation, radiation sickness, Cold War, today, the promise (862s – end)
import * as THREE from 'three';
import { T, TE } from '../core/time.js';
import { titleCard, stage, look, camPath, shake, handheld, toScreen } from './common.js';
import { flat, words, quoteShot } from './two.js';
import * as S1 from './sets1.js';
import * as S3 from './sets3.js';
import * as S4 from './sets4.js';
import { text, reveal, F, PAL, W, H, lowerThird, stamp, measure, fmt, vignette, grain, inkBG, paperBG } from '../2d/draw.js';
import { kinetic, dotGrid, barH, panel, lineChart, count, clockFace, thermometer, redactBar } from '../2d/info.js';
import { drawMap, marker, route, LL, mapCam, arrow } from '../2d/maps.js';
import { jeep, truck } from '../kit/vehicles.js';
import { CAST, POSE, setPose, walk } from '../kit/people.js';
import { motes } from '../kit/fx.js';
import { clamp, expoOut, easeOut, easeInOut, lerp, rng } from '../core/math.js';

const side = (g, lt, t, title, sub, subAt) => { reveal(g, title, 140, 150, clamp(lt / .6), { font: F.title(84), align: 'left', track: 8, dx: -40, dy: 0, shadow: ['#000', 20] }); if (sub) reveal(g, sub, 146, 228, clamp((t - (subAt ?? -1e9)) / .6) * clamp((lt - .3) / .6), { font: F.serif(40), align: 'left', color: '#ffe8d0', dx: -30, dy: 0, shadow: ['#000', 10] }); };
const CLIN = (g, t) => inkBG(g, t, { top: '#0c1a1a', bottom: '#050a0a', gridA: .04 });

export default function act5(add) {
  add(T('One month later, American') - .15, 'title-1mo-later', () => titleCard({ big: '1 MONTH LATER', small: '', date: 'September 1945', dateAt: T('One month later, American') + .3 }), { sfx: [[T('One month later, American') - .1, 'boom']] });

  add(T('American occupation forces') - .1, 'occupation', () => {
    const S = S3.street({ ruined: true, people: 0, seed: 71 }); S.fireP.visible = false; S.particles = S.particles.filter((p) => p !== S.fireP);
    S.sky.material.uniforms.mid.value.set('#b8b0a0'); S.sky.material.uniforms.top.value.set('#5a6a80'); S.scene.fog.color.set('#9a9288'); S.scene.fog.far = 300;
    const j = jeep(); j.position.set(-2, 0, -10); S.scene.add(j); const tr = truck(); tr.position.set(2.5, 0, -25); S.scene.add(tr);
    const gis = []; for (let i = 0; i < 6; i++) { const p = CAST.gi(); p.position.set(-4 + i * 1.6, 0, -6 - (i % 2) * 2); S.scene.add(p); gis.push(p); }
    S.update = (lt) => { j.position.z = -30 + lt * 5; gis.forEach((p, i) => { p.position.z = -14 + lt * 1.2 - (i % 2) * 2; walk(p, lt + i); }); camPath(S.camera, lt, [[0, [3, 1.7, 10], [-1, 1.4, -20], 40], [5, [2, 1.6, 7], [-1, 1.4, -20], 40]]); };
    S.draw = (g, lt, t) => side(g, lt, t, 'OCCUPATION', 'American forces arrive in Japan');
    S.grade = { sat: .6, tint: [1.02, 1, .96], bloom: .4 };
    return S;
  }, { sfx: [[T('American occupation forces'), 'rumble', { dur: 3, gain: .3 }]] });

  add(T('The first Western journalists') - .1, 'journalists', () => {
    const S = S3.street({ ruined: true, people: 0, seed: 73 }); S.fireP.visible = false; S.particles = S.particles.filter((p) => p !== S.fireP); S.scene.fog.far = 300;
    const js = []; for (let i = 0; i < 3; i++) { const p = i === 2 ? CAST.scientist() : CAST.journalist(); p.position.set(-2 + i * 2, 0, -4); p.rotation.y = Math.PI + (i - 1) * .4; p.pose({ armL: [1.3, .1], armR: [1.3, .1], elbowL: 1.4, elbowR: 1.4, head: [.1, 0, 0] }); S.scene.add(p); js.push(p); }
    const fl = new THREE.PointLight('#ffffff', 0, 20, 2); fl.position.set(0, 2, -5); S.scene.add(fl);
    S.update = (lt) => { fl.intensity = (lt % 1.3) < .06 ? 400 : 0; camPath(S.camera, lt, [[0, [2, 1.6, 2], [-1, 1.3, -10], 40], [4, [1.4, 1.5, 0], [-1, 1.3, -12], 38]]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'WHAT THEY FIND SHOCKS THE WORLD', at: T('What they find'), x: W / 2, y: 150, font: F.title(64), color: '#fff', track: 10, shadow: ['#000', 24] }]);
    S.grade = { sat: .55, bloom: .6 };
    return S;
  }, { sfx: [0, 1.3, 2.6, 3.9].map((d) => [T('The first Western journalists') + d, 'shutter', { gain: .25 }]) });

  add(T('An invisible killer') - .1, 'disease-x', () => flat(CLIN, (g, lt, t) => {
    const r = rng(3); for (let i = 0; i < 160; i++) { const x = r() * W, y = r() * H; const a = clamp(lt / 2) * (.3 + .7 * Math.abs(Math.sin(lt * 3 + i))); g.fillStyle = `rgba(120,255,200,${a * .5})`; g.beginPath(); g.arc(x + Math.sin(lt + i) * 20, y, 2 + r() * 3, 0, 7); g.fill(); }
    reveal(g, 'AN INVISIBLE KILLER', W / 2, 300, clamp(lt / .6), { font: F.title(80), color: '#cfeee4', track: 14 });
    stamp(g, t - T('Disease X'), 'DISEASE X', W / 2, H / 2 + 80, { font: F.title(230), color: '#fff', track: 20, shadow: ['rgba(80,255,180,.6)', 50] });
  }), { bed: [[T('An invisible killer'), T('This is acute'), 'geiger', { gain: .1, rate: 7 }]], sfx: [[T('Disease X'), 'boom', { gain: .5 }]] });

  const SYM = [['Hair falls out', 'Their hair falls'], ['Gums bleed', 'Their gums bleed'], ['Dark red patches under the skin', 'Dark red patches'], ['Fever 104 °F · 40 °C', 'Fevers climb'], ['White blood cells collapse', 'White blood cell']];
  add(T('People who survived the explosions') - .1, 'symptoms', () => flat(CLIN, (g, lt, t) => {
    reveal(g, 'SURVIVED WITHOUT A SCRATCH…', 140, 150, clamp(lt / .6), { font: F.title(64), align: 'left', color: '#cfeee4', dx: -30, dy: 0, track: 6 });
    reveal(g, '…then suddenly grow weak', 146, 225, clamp((t - T('suddenly grow weak')) / .6), { font: F.serif(46), align: 'left', color: '#ff8a7a', dx: -30, dy: 0 });
    SYM.forEach(([s, w], i) => { const k = clamp((t - T(w)) / .5); if (k <= 0) return; const y = 360 + i * 105; g.save(); g.globalAlpha = k; g.fillStyle = PAL.red; g.beginPath(); g.arc(160, y, 12, 0, 7); g.fill(); g.restore(); reveal(g, s.toUpperCase(), 200, y, k, { font: F.title(56), align: 'left', color: '#fff', dx: 30, dy: 0, track: 4 }); });
    const kt = clamp((t - T('Fevers climb')) / .8); if (kt > 0) thermometer(g, 1350, 340, 380, .85, { k: kt, label: '104 °F' });
    const kw = clamp((t - T('White blood cell')) / 1.5); if (kw > 0) { const pts = [1, .98, .9, .7, .45, .25, .12, .06]; lineChart(g, pts, kw, { x: 1500, y: 360, w: 320, h: 380, color: '#7ad0ff', max: 1.1, axisCol: 'rgba(255,255,255,.25)' }); text(g, 'WBC', 1660, 790, { font: F.mono(26, 700), color: '#7ad0ff' }); }
  }), { sfx: SYM.map(([, w]) => [T(w), 'pop', { gain: .15, f: 500 }]) });

  add(T('This is acute') - .1, 'ars', () => flat(CLIN, (g, lt, t) => {
    reveal(g, 'ACUTE RADIATION SICKNESS', W / 2, 220, clamp(lt / .6), { font: F.title(90), color: '#fff', track: 10 });
    const k = clamp((t - T('bone marrow')) / 2); const r = rng(5);
    for (let i = 0; i < 14; i++) { const cx = 300 + (i % 7) * 220, cy = 520 + Math.floor(i / 7) * 220; const dmg = clamp(k * 2 - (i % 5) * .2); g.save(); g.fillStyle = `rgba(${200 + dmg * 40},${120 - dmg * 80},${130 - dmg * 90},.55)`; g.strokeStyle = `rgba(255,${200 - dmg * 150},${200 - dmg * 150},.9)`; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 80 * (1 - dmg * .25), 70, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(80,20,40,.8)'; g.beginPath(); g.arc(cx + 10, cy, 26 * (1 - dmg * .5), 0, 7); g.fill(); g.restore(); }
    for (let i = 0; i < 40; i++) { const ph = (lt * .7 + r()) % 1; g.strokeStyle = `rgba(150,255,200,${(1 - ph) * k})`; g.lineWidth = 2; const x = r() * W, y = 380 + r() * 400; g.beginPath(); g.moveTo(x - 60 * ph, y - 60 * ph); g.lineTo(x - 60 * ph - 30, y - 60 * ph - 30); g.stroke(); }
    reveal(g, 'bone marrow and cells destroyed', W / 2, 960, clamp((t - T('bone marrow')) / .6), { font: F.serif(48), color: '#ff9a8a' });
  }), { sfx: [[T('This is acute'), 'boom', { gain: .35 }]] });

  add(T('Doctors can do little') - .1, 'ward', () => { const S = S4.ward(); S.update = (lt) => camPath(S.camera, lt, [[0, [4, 2.2, 3.5], [-1, .5, -1], 40], [4.5, [3, 1.9, 2.6], [-1, .5, -1.2], 38]]); return S; }, { bed: [[T('Doctors can do little'), T('Weeks after'), 'drone', { gain: .07, root: 40, chord: [0, 3, 7] }]] });

  add(T('Weeks after') - .1, 'toll-climbs', () => flat(CLIN, (g, lt, t) => {
    reveal(g, 'THE DEATH TOLL KEEPS CLIMBING', 160, 180, clamp(lt / .6), { font: F.title(70), align: 'left', color: '#fff', dx: -30, dy: 0, track: 6 });
    const pts = [0, .45, .55, .62, .68, .73, .77, .8, .83, .86, .9]; const L = lineChart(g, pts, clamp(lt / 3.4), { x: 200, y: 300, w: 1500, h: 560, color: PAL.red, max: 1 });
    text(g, 'AUG', 200, 900, { font: F.mono(26), color: '#aaa' }); text(g, 'DEC 1945', 1700, 900, { font: F.mono(26), color: '#aaa' });
  }), { sfx: [[T('Weeks after'), 'riser', { dur: 3, gain: .15 }]] });

  add(T('Occupation authorities') - .1, 'censorship', () => flat('paper', (g, lt, t) => {
    panel(g, 560, 120, 800, 860, { k: 1, fill: '#efe7d4' });
    const lines = ['RADIATION INJURIES — FIELD REPORT', 'Hiroshima / Nagasaki, Sept. 1945', '', 'Patients without external injury', 'develop epilation, bleeding gums,', 'purpura and high fever. White', 'cell counts fall below 1,000.', 'Mortality in this group is high.', 'Cause: delayed radiation effects.'];
    lines.forEach((l, i) => text(g, l, 620, 220 + i * 56, { font: F.mono(i === 0 ? 28 : 26, i === 0 ? 700 : 400), color: '#1d1a16', align: 'left' }));
    for (let i = 3; i < 9; i++) redactBar(g, 612, 196 + i * 56, 640 - (i % 3) * 60, 44, clamp((t - T('impose censorship')) * 3 - (i - 3) * .4));
    stamp(g, t - T('trying to conceal'), 'CENSORED', W / 2, 760, { font: F.title(150), color: 'rgba(200,20,25,.92)', rot: -.12, track: 12 });
  }), { sfx: [[T('impose censorship'), 'paper', { gain: .2 }], [T('trying to conceal'), 'stamp', { gain: .55 }]] });

  add(T('One year later, the ruins') - .15, 'title-1y-later', () => titleCard({ big: '1 YEAR LATER', small: '', date: '1946', dateAt: T('One year later, the ruins') + .3 }), { sfx: [[T('One year later, the ruins') - .1, 'boom']] });
  add(T('the ruins of Hiroshima and Nagasaki are') - .1, 'shanty', () => { const S = S4.shanty(); S.update = (lt) => camPath(S.camera, lt, [[0, [-12, 4, 24], [5, 2, -40], 40], [7.8, [-6, 3, 16], [8, 3, -60], 40]]); S.draw = (g, lt, t) => side(g, lt, t, 'MAKESHIFT SHACKS', 'built from the debris', T('built from debris')); return S; }, { bed: [[T('the ruins of Hiroshima and Nagasaki are'), T('A new group'), 'wind', { gain: .08 }]] });

  add(T('A new group') - .1, 'hibakusha', () => flat('paper', (g, lt, t) => {
    text(g, '被爆者', W / 2, 420, { font: F.jp(260), color: '#151515', alpha: clamp((t - T('The Hibakusha')) / .6) });
    reveal(g, 'HIBAKUSHA', W / 2, 650, clamp((t - T('The Hibakusha')) / .6), { font: F.sans(90, 800), color: PAL.red, track: 30 });
    reveal(g, '"people affected by the bomb"', W / 2, 760, clamp((t - T('people affected')) / .6), { font: F.serif(56), color: '#333' });
    reveal(g, 'A NEW GROUP EMERGES', W / 2, 180, clamp(lt / .5), { font: F.sans(46, 800), color: '#555', track: 10 });
  }, { captions: false }), { sfx: [[T('The Hibakusha'), 'bell', { gain: .25, f: 165 }]] });

  add(T('They face rejection') - .1, 'rejection', () => flat('paper', (g, lt, t) => {
    reveal(g, 'REJECTED BY THEIR OWN SOCIETY', W / 2, 170, clamp(lt / .6), { font: F.sans(70, 800), color: '#151515' });
    const person = (x, col, a) => { g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(x, 420, 50, 0, 7); g.fill(); g.beginPath(); g.roundRect(x - 70, 480, 140, 200, 40); g.fill(); g.restore(); };
    person(W / 2, PAL.red, 1);
    const k1 = clamp((t - T('Employers hesitate')) / .8), k2 = clamp((t - T('Potential spouses')) / .8);
    person(W / 2 - 220 - k1 * 300, '#2a2a2a', clamp(k1 * 3)); if (k1 > 0) text(g, 'JOBS ✕', W / 2 - 520, 760, { font: F.sans(50, 800), color: '#2a2a2a', alpha: k1 });
    person(W / 2 + 220 + k2 * 300, '#2a2a2a', clamp(k2 * 3)); if (k2 > 0) text(g, 'MARRIAGE ✕', W / 2 + 520, 760, { font: F.sans(50, 800), color: '#2a2a2a', alpha: k2 });
    const k3 = clamp((t - T('is contagious')) / .5); if (k3 > 0) stamp(g, t - T('is contagious'), 'MYTH: "CONTAGIOUS"', W / 2, 900, { font: F.sans(60, 800), color: '#fff', bg: PAL.red, pad: 28, rot: -.03 });
    reveal(g, 'fear of genetic damage', W / 2, 820, clamp((t - T('genetic damage')) / .5), { font: F.serif(44), color: '#444' });
  }, { captions: true }), { sfx: [[T('Employers hesitate'), 'whoosh', { gain: .15 }], [T('Potential spouses'), 'whoosh', { gain: .15 }], [T('is contagious'), 'stamp', { gain: .3 }]] });

  add(T('Meanwhile, the world has changed') - .1, 'world-changed', () => { const S = S1.globe({ highlight: {} }); S.update = (lt) => { S.face(lerp(60, 30, lt / 3), 40); look(S.camera, [0, 0, lerp(40, 32, lt / 3)], [0, 0, 0]); }; S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'CHANGED IRREVERSIBLY', at: T('changed irreversibly'), x: W / 2, y: H - 200, font: F.title(70), color: '#fff', track: 12 }]); return S; });

  add(T('The Iron Curtain') - .1, 'iron-curtain', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [18, 50], 1300], [2.5, [18, 50], 1400]]); drawMap(g, p, { theme: 'ink', highlight: { russia: '#4a1214', poland: '#3a1416', czech: '#3a1416' } });
    const line = [[14.55, 53.43], [14.3, 51], [12.5, 50.3], [13.8, 48.8], [16.9, 48.1], [16.5, 46.5], [13.77, 45.65]];
    const k = clamp(lt / 1.6); const P = line.map((ll) => p(ll)); g.save(); g.strokeStyle = '#c8ccd0'; g.lineWidth = 12; g.shadowColor = '#fff'; g.shadowBlur = 20; g.beginPath(); const n = Math.max(1, Math.floor(k * (P.length - 1)) + 1); P.slice(0, n + 1).forEach((q, i) => (i ? g.lineTo(...q) : g.moveTo(...q))); g.stroke(); g.restore();
    stamp(g, t - T('Iron Curtain'), 'THE IRON CURTAIN', W / 2, 140, { font: F.title(80), color: '#fff', track: 14 });
  }), { sfx: [[T('Iron Curtain'), 'metal', { gain: .35, f: 120 }]] });

  add(T('In the summer of 1946') - .1, 'bikini', () => {
    const S = S4.bikini(); const tb = T('staging nuclear tests') - (T('In the summer of 1946') - .1); S.colm.userData.t = (lt) => lt - tb;
    S.update = (lt) => camPath(S.camera, lt, [[0, [5200, 260, 5200], [0, 500, 0], 40], [8.9, [4400, 260, 4400], [0, 900, 0], 40]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'OPERATION CROSSROADS', 'Bikini Atoll · July 1946', T('Bikini Atoll'));
    return S;
  }, { sfx: [[T('staging nuclear tests'), 'explosion', { gain: .6, dur: 7 }]], bed: [[T('In the summer of 1946'), T('The Soviet Union accelerates'), 'sea', { gain: .1 }]] });

  add(T('The Soviet Union accelerates') - .1, 'soviet-bomb', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [75, 55], 450], [3, [80, 52], 520]]); drawMap(g, p, { theme: 'ink', highlight: { russia: '#5a1214', kazakhstan: '#3a1416' } });
    marker(g, p, [78.0, 50.4], 'SEMIPALATINSK', clamp((lt - .6) / .4), { side: 1, color: '#ffcf6a', sub: 'first Soviet test · 1949', pulse: lt });
    kinetic(g, t, [{ s: 'THE COLD WAR HAS BEGUN', at: T('The Cold War'), x: W / 2, y: H - 170, font: F.title(80), color: '#fff', track: 14, shadow: ['#000', 24] }]);
  }), { sfx: [[T('The Cold War'), 'boom', { gain: .55 }]] });

  const arcs = (S, n, k, seed = 2) => { const r = rng(seed); const out = []; for (let i = 0; i < n; i++) { const a = [r() * 360 - 180, r() * 120 - 50], b = [r() * 360 - 180, r() * 120 - 50]; out.push([a, b]); } return out; };
  add(T('The atomic bomb, introduced') - .1, 'hostage-globe', () => {
    const S = S1.globe({ highlight: {}, atmos: '#ff5a3a' }); const A = arcs(S, 36); const geo = A.map(() => { const g2 = new THREE.BufferGeometry(); const l = new THREE.Line(g2, new THREE.LineBasicMaterial({ color: new THREE.Color('#ff4a3a').multiplyScalar(2), transparent: true, opacity: .9 })); S.scene.add(l); return g2; });
    S.update = (lt) => { S.face(lt * 8, 25); look(S.camera, [0, 4, lerp(44, 34, lt / 9)], [0, 0, 0]); const k = clamp(lt / 6); A.forEach(([a, b], i) => { const ki = clamp(k * 1.5 - i / A.length * .5); const pts = []; const va = S.ll2v(...a, 10), vb = S.ll2v(...b, 10); for (let j = 0; j <= 30 * ki; j++) { const f = j / 30; const v = va.clone().lerp(vb, f).normalize().multiplyScalar(10 + Math.sin(f * Math.PI) * 3.5); pts.push(v); } geo[i].setFromPoints(pts.length > 1 ? pts : [va, va]); }); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'THE DEFINING FEAR OF GENERATIONS', at: T('defining fear'), x: W / 2, y: 150, font: F.title(64), color: '#fff', track: 10 }, { s: 'HUMANITY HAS TAKEN ITSELF HOSTAGE', at: T('Humanity has taken'), x: W / 2, y: H - 170, font: F.title(70), color: '#ff6a5a', track: 10 }]);
    return S;
  }, { bed: [[T('The atomic bomb, introduced'), T('Eighty years later'), 'drone', { gain: .09, root: 34, chord: [0, 1, 7] }]] });

  // ── 80 YEARS LATER ───────────────────────────────────────────
  add(T('Eighty years later') - .15, 'title-80y', () => titleCard({ big: '80 YEARS LATER', small: '', date: 'Today', dateAt: T('Eighty years later') + .5 }), { sfx: [[T('Eighty years later') - .1, 'bell', { gain: .3, f: 220 }]] });

  add(T('Today, Hiroshima and Nagasaki') - .1, 'modern-city', () => { const S = S4.modernCity(); S.update = (lt, t) => { if (t < T('High-speed trains')) camPath(S.camera, lt, [[0, [0, 60, 260], [0, 20, -200], 45], [4, [0, 40, 180], [0, 20, -200], 45]]); else if (t < T('Neon signs')) look(S.camera, [14, 11, S.train.position.z + 60], [0, 11, S.train.position.z]); else camPath(S.camera, lt, [[6, [-6, 1.7, 40], [10, 14, -40], 50], [10, [-6, 1.7, 20], [10, 10, -60], 50]]); }; S.draw = (g, lt, t) => side(g, lt, t, 'HIROSHIMA', 'a thriving modern city', T('thriving modern')); return S; },
    { bed: [[T('Today, Hiroshima and Nagasaki'), T('But the memory remains'), 'city', { gain: .08 }]], sfx: [[T('High-speed trains'), 'whoosh', { gain: .3, dur: 1.5 }]] });

  add(T('Time and human effort') - .1, 'dome-today', () => { const S = S4.memorial(); S.update = (lt) => camPath(S.camera, lt, [[0, [10, 6, -150], [0, 14, -200], 40], [4.6, [6, 5, -165], [0, 15, -200], 36]]); S.draw = (g, lt, t) => side(g, lt, t, 'THE A-BOMB DOME', 'the memory remains', T('the memory remains')); return S; },
    { sfx: [[T('But the memory remains'), 'piano', { notes: [57], gain: .16, dur: 5 }]] });

  add(T('At the Hiroshima Peace Memorial Museum') - .1, 'museum', () => { const S = S4.museum(); S.update = (lt, t) => { if (t < T('There are burned')) camPath(S.camera, lt, [[0, [.6, 1.6, 1.2], [0, 1.08, 0], 40], [4, [.15, 1.35, .45], [0, 1.08, 0], 30]]); else camPath(S.camera, lt, [[5.4, [-1.3, 1.5, 1.2], [-1.5, 1.1, 0], 36], [9, [-.4, 1.5, 1.6], [-1, 1.1, 0], 40]]); };
    S.draw = (g, lt, t) => { side(g, lt, t, 'PEACE MEMORIAL MUSEUM', 'watches stopped forever at 8:15', T('forever stopped')); if (t > T('forever stopped') && t < T('There are burned')) clockFace(g, W - 260, H - 300, 150, 8, 15, 0, { k: clamp((t - T('at 8.15')) / .5) }); kinetic(g, t, [{ s: "CHILDREN'S SCHOOL BAGS", at: T("children's school"), x: W / 2, y: H - 230, font: F.title(56), color: '#fff', track: 8, out: T('shadows preserved') - .1 }, { s: 'SHADOWS ON STONE', at: T('shadows preserved'), x: W / 2, y: H - 230, font: F.title(56), color: '#fff', track: 8 }]); };
    return S; }, { sfx: [[T('at 8.15'), 'tick', { gain: .5 }]], bed: [[T('At the Hiroshima Peace Memorial Museum'), T('The total number'), 'room', { gain: .05 }]] });

  add(T('The total number') - .1, 'death-toll', () => flat('black', (g, lt, t) => {
    reveal(g, 'DEATHS · BLAST, FIRE & RADIATION', W / 2, 160, clamp(lt / .6), { font: F.title(56), color: '#cfc6b8', track: 8 });
    const kh = clamp((t - T('200,000')) / 1.5), kn = clamp((t - T('140,000')) / 1.5);
    const grid = (x, n, k, col) => { const shown = Math.floor(n * k); for (let i = 0; i < shown; i++) { g.fillStyle = col; g.fillRect(x + (i % 20) * 30, 300 + Math.floor(i / 20) * 30, 22, 22); } };
    grid(220, 200, kh, PAL.red); grid(1100, 140, kn, '#e08a3a');
    if (kh > 0) { text(g, fmt(count(t, T('200,000'), T('200,000') + 1.5, 0, 200000)) + '+', 520, 680, { font: F.title(110), color: '#fff' }); text(g, 'HIROSHIMA', 520, 770, { font: F.title(48), color: PAL.red, track: 10 }); }
    if (kn > 0) { text(g, '≈ ' + fmt(count(t, T('140,000'), T('140,000') + 1.5, 0, 140000)), 1400, 680, { font: F.title(110), color: '#fff' }); text(g, 'NAGASAKI', 1400, 770, { font: F.title(48), color: '#e08a3a', track: 10 }); }
    text(g, '■ = 1,000 lives', W / 2, 900, { font: F.mono(28), color: '#888', alpha: kh });
  }, { captions: true }), { sfx: [[T('200,000'), 'counter', { dur: 1.5 }], [T('140,000'), 'counter', { dur: 1.5 }]] });

  add(T('Today, the world has') - .1, 'warheads-12000', () => flat('ink', (g, lt, t) => {
    const k = clamp(lt / 3); const n = Math.floor(12000 * k); const cols = 200;
    for (let i = 0; i < n; i++) { g.fillStyle = 'rgba(255,90,70,.8)'; g.fillRect(160 + (i % cols) * 8, 300 + Math.floor(i / cols) * 9, 5, 5); }
    text(g, fmt(count(t, T('12,000'), T('12,000') + 2.5, 0, 12000)) + '+', 160, 200, { font: F.title(140), color: '#fff', align: 'left' }); text(g, 'NUCLEAR WARHEADS TODAY', 160 + 560, 220, { font: F.title(56, 500), color: '#ff9a8a', align: 'left', track: 8 });
    text(g, '● = 1 warhead', W - 160, 1000, { font: F.mono(26), color: '#888', align: 'right' });
  }), { sfx: [[T('12,000'), 'counter', { dur: 2.5 }]] });

  add(T('Many are tens or hundreds') - .1, 'yield-circles', () => flat('ink', (g, lt, t) => {
    reveal(g, 'TENS OR HUNDREDS OF TIMES MORE POWERFUL', W / 2, 140, clamp(lt / .6), { font: F.title(58), color: '#fff', track: 6 });
    const items = [['LITTLE BOY', 15, '#ffcf6a'], ['W76', 100, '#ff9a5a'], ['W88', 455, '#ff6a4a'], ['B83', 1200, '#e0312b']];
    let x = 280; items.forEach(([n, kt, col], i) => { const k = clamp((lt - i * .6) / .8); const r = Math.sqrt(kt) * 9 * expoOut(k); g.save(); g.globalAlpha = clamp(k * 2); g.fillStyle = col + '55'; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(x + r, 620, r, 0, 7); g.fill(); g.stroke(); g.restore(); text(g, n, x + r, 620 - r - 60, { font: F.title(36), color: '#fff', alpha: k }); text(g, kt >= 1000 ? (kt / 1000) + ' Mt' : kt + ' kt', x + r, 620 - r - 22, { font: F.mono(26), color: col, alpha: k }); x += r * 2 + 90; });
  }), { sfx: [0, .6, 1.2, 1.8].map((d) => [T('Many are tens or hundreds') + d, 'pop', { f: 400 + d * 300 }]) });

  add(T('Technology has advanced') - .1, 'minutes', () => {
    const S = S1.globe({ highlight: {} }); const A = [[[-100, 45], [60, 55]], [[60, 55], [-95, 40]], [[38, 55], [-0.1, 51.5]], [[-77, 39], [37.6, 55.7]]]; const geo = A.map(() => { const g2 = new THREE.BufferGeometry(); S.scene.add(new THREE.Line(g2, new THREE.LineBasicMaterial({ color: new THREE.Color('#ffcf6a').multiplyScalar(2) }))); return g2; });
    S.update = (lt) => { S.face(-20 + lt * 3, 50); look(S.camera, [0, 8, 36], [0, 2, 0]); const k = clamp(lt / 6); A.forEach(([a, b], i) => { const pts = []; const va = S.ll2v(...a, 10), vb = S.ll2v(...b, 10); for (let j = 0; j <= 40 * k; j++) { const f = j / 40; pts.push(va.clone().lerp(vb, f).normalize().multiplyScalar(10 + Math.sin(f * Math.PI) * 3)); } geo[i].setFromPoints(pts.length > 1 ? pts : [va, va]); }); };
    S.draw = (g, lt, t) => { kinetic(g, t, [{ s: 'EXTRAORDINARILY PRECISE', at: T('extraordinarily precise'), x: W / 2, y: 140, font: F.title(60), color: '#fff', track: 10 }]); if (t > T('in minutes')) { const s = Math.max(0, 30 * 60 - (t - T('in minutes')) * 120); text(g, `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`, W / 2, H - 170, { font: F.mono(110, 700), color: '#ff4a3a' }); } };
    return S;
  }, { sfx: [[T('in minutes'), 'blip', { gain: .15 }]] });

  add(T('But their fundamental') - .1, 'purpose', () => words('black', [{ s: 'THEIR PURPOSE REMAINS UNCHANGED', at: T('But their fundamental'), x: W / 2, y: H / 2 - 80, font: F.title(64, 500), color: '#cfc6b8', track: 10 }, { s: 'TOTAL, INDISCRIMINATE DESTRUCTION', at: T('Total indiscriminate'), x: W / 2, y: H / 2 + 60, font: F.title(90), color: '#ff4a3a', track: 8 }], { captions: false }), { sfx: [[T('Total indiscriminate'), 'boom', { gain: .5 }]] });

  add(T('Every year, fewer') - .1, 'fewer-hibakusha', () => flat('paper', (g, lt, t) => {
    reveal(g, 'LIVING HIBAKUSHA', 200, 180, clamp(lt / .6), { font: F.sans(70, 800), color: '#151515', align: 'left', dx: -30, dy: 0 });
    const pts = [372, 360, 340, 310, 280, 250, 220, 190, 160, 130, 107]; lineChart(g, pts, clamp(lt / 3), { x: 220, y: 300, w: 1480, h: 520, color: '#c41f1a', max: 400, axisCol: 'rgba(0,0,0,.3)' });
    text(g, '1980 · 372,000', 220, 870, { font: F.mono(28, 700), color: '#333', align: 'left' }); text(g, '2024 · ≈107,000', 1700, 870, { font: F.mono(28, 700), color: '#c41f1a', align: 'right', alpha: clamp((lt - 3) / .5) });
  }, { captions: true }), { sfx: [[T('Every year, fewer'), 'piano', { notes: [52, 57], gain: .14, dur: 6 }]] });

  add(T('Throughout their lives') - .1, 'cranes', () => { const S = S4.memorial({ cranes: 60 }); S.update = (lt) => camPath(S.camera, lt, [[0, [0, 3, 40], [0, 8, -40], 44], [7, [0, 5, 26], [0, 10, -60], 44]]); S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'ONE MESSAGE', at: T('one message'), x: W / 2, y: 150, font: F.title(80), color: '#fff', track: 20, shadow: ['#000', 24] }, { s: 'the lesson of August 1945', at: T('the lesson of'), x: W / 2, y: H - 220, font: F.serif(56), color: '#ffe8d0', shadow: ['#000', 16] }]); return S; },
    { bed: [[T('Throughout their lives'), T('We can only hope') + 10, 'pianoMotif', { gain: .12 }]] });

  add(T('It is inscribed') - .1, 'cenotaph', () => { const S = S4.memorial({ cranes: 20 }); S.update = (lt) => camPath(S.camera, lt, [[0, [0, 2.2, 14], [0, 2.5, 0], 40], [4.2, [0, 1.8, 8], [0, 2.5, -100], 40]]); S.draw = (g, lt, t) => side(g, lt, t, 'THE CENOTAPH', 'Peace Memorial Park, Hiroshima'); return S; });

  add(T('Let all the souls') - .2, 'inscription', () => flat('black', (g, lt, t) => {
    const jp = ['安らかに眠って下さい', '過ちは繰返しませぬから']; jp.forEach((col, i) => [...col].forEach((ch, j) => text(g, ch, W - 200 - i * 120, 140 + j * 76, { font: F.jp(62), color: '#efe4cc', alpha: clamp(lt * 3 - j * .15 - i) })));
    reveal(g, 'Let all the souls here rest in peace,', 160, 470, clamp((t - T('Let all the souls')) / 1.2), { font: F.serif(52), align: 'left', color: '#f4ecdc', dy: 10, stagger: .3 });
    reveal(g, 'for we shall not repeat the evil.', 160, 560, clamp((t - T('for we shall not')) / 1.2), { font: F.serif(52), align: 'left', color: PAL.amber, dy: 10, stagger: .3 });
  }, { captions: false }), { sfx: [[T('Let all the souls') - .1, 'bell', { gain: .3, f: 196 }]] });

  add(T('We can only hope') - .1, 'promise', () => { const S = S4.memorial({ cranes: 80 }); S.update = (lt) => camPath(S.camera, lt, [[0, [0, 4, 30], [0, 8, -100], 44], [7, [0, 30, 70], [0, 10, -150], 50]]); S.fadeOut = 2.2;
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'KEEPING THAT PROMISE', at: T('keeping that promise'), x: W / 2, y: H / 2, font: F.title(90), color: '#fff', track: 20, shadow: ['#000', 30] }]); return S; },
    { sfx: [[T('keeping that promise'), 'bell', { gain: .3, f: 147 }]] });
}
