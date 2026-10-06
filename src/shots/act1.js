// ACT I–III: 1939 → 1944 (0s – 166s)
import * as THREE from 'three';
import { T, TE } from '../core/time.js';
import { titleCard, stage, look, camPath, shake, handheld, toScreen, pin3D } from './common.js';
import { flat, words, quoteShot } from './two.js';
import * as S1 from './sets1.js';
import * as S2 from './sets2.js';
import { text, reveal, F, PAL, W, H, lowerThird, stamp, measure, fmt, vignette, grain, inkBG, paperBG } from '../2d/draw.js';
import { kinetic, dotGrid, barH, checklist, count, panel, clockFace } from '../2d/info.js';
import { drawMap, proj, marker, route, LL, mapCam } from '../2d/maps.js';
import { buildHiroshima } from '../kit/city.js';
import { b29 } from '../kit/aircraft.js';
import { shockRing } from '../kit/fx.js';
import * as P from '../kit/props.js';
import { M } from '../kit/materials.js';
import { CAST, POSE } from '../kit/people.js';
import { clamp, expoOut, easeOut, easeInOut, lerp, smooth, keys } from '../core/math.js';
import { canvas, tex } from '../core/textures.js';

export function aerialCity({ tod = 'day', ruined = false, houses = 7000 } = {}) {
  const skies = { day: { top: '#3a6aa0', mid: '#d0e2ec', bot: '#8090a0', sun: [.5, .6, .3] }, dusk: { top: '#1d2a4a', mid: '#e09a6a', bot: '#4a4a5a', sun: [1, .1, .3], sunCol: '#ffb080' }, morning: { top: '#2f6fb8', mid: '#e0ecf2', bot: '#8aa6c0', sun: [.8, .4, .5], sunCol: '#fff0d8' } };
  const S = stage({ sky: skies[tod], light: { sun: tod === 'dusk' ? [2500, 500, 800] : [900, 1500, 1200], sunCol: tod === 'dusk' ? '#ffb070' : '#fff2e0', area: 2600, sunI: tod === 'dusk' ? 2.6 : 3.2, mapSize: 4096 }, far: 40000, near: 10 });
  S.scene.fog = new THREE.Fog(tod === 'dusk' ? '#b08070' : '#c0d0dc', 3000, 16000);
  S.city = buildHiroshima(S.scene, { ruined, houses });
  S.grade = tod === 'dusk' ? { tint: [1.06, .97, .92], sat: 1.05, bloom: .5 } : { sat: 1.08, bloom: .45 };
  return S;
}

export default function act1(add) {
  // ── 6 years before ──────────────────────────────────────────────
  add(0, 'title-6y', () => titleCard({ big: '6 YEARS', small: 'BEFORE THE ATTACK', date: 'August 1939', dateAt: T('August 1939') }),
    { sfx: [[0.05, 'boom'], [T('August 1939'), 'tick', { gain: .4 }]], bed: [[0, T('The world stands'), 'ticking', { gain: .14 }]] });

  add(T('The world stands') - .1, 'globe-europe', () => {
    const S = S1.globe({ highlight: { germany: '#d42a1a', austria: '#b0301f', czech: '#8a3a2a' } });
    S.update = (lt) => { S.face(lerp(-5, 18, easeOut(lt / 5)), 48); look(S.camera, [0, 0, lerp(42, 26, easeInOut(lt / 4.6))], [0, 0, 0]); S.globe.rotation.z = -.05; };
    S.draw = (g, lt, t) => {
      const v = S.ll2v(...LL.berlin); const [x, y] = toScreen(S.camera, [v.x, v.y, v.z]);
      const k = clamp((t - T('brink')) / .4);
      if (k > 0) { g.save(); g.globalAlpha = k; g.strokeStyle = PAL.red; g.lineWidth = 3; for (let i = 0; i < 2; i++) { const ph = ((lt * .8) + i * .5) % 1; g.beginPath(); g.arc(x, y, 12 + ph * 60, 0, 7); g.globalAlpha = k * (1 - ph); g.stroke(); } g.restore(); text(g, 'GERMANY', x + 30, y - 30, { font: F.title(40), align: 'left', alpha: k, track: 4, shadow: ['#000', 12] }); }
      reveal(g, 'EUROPE · 1939', 120, 120, clamp(lt / .8), { font: F.mono(30, 700), align: 'left', color: '#d8cfc0', dy: 0, dx: -30, track: 6 });
      kinetic(g, t, [{ s: 'THE MOST DESTRUCTIVE WAR', at: T('most destructive war'), x: W / 2, y: H - 230, font: F.title(64), color: '#f2e6d6', track: 6 }]);
    };
    return S;
  }, { sfx: [[T('The world stands') - .1, 'whoosh', { gain: .25 }], [T('brink'), 'boom', { gain: .5, pitch: 1.4 }]], bed: [[T('The world stands'), T('Six years', 0) + 47, 'drone', { gain: .1, root: 38 }]] });

  add(T('but the greatest threat') - .15, 'lab-equations', () => {
    const S = S1.lab();
    S.update = (lt, t) => { camPath(S.camera, t - T('but the greatest threat'), [[0, [0.3, 1.25, -.35], [0, 1.2, -1.2], 32], [2.4, [0.15, 1.35, .2], [0, 1.25, -1.4], 36], [4.6, [-.2, 1.8, -1.8], [0, 1.9, -3.4], 42]]); handheld(S.camera, lt, .01); };
    S.draw = (g, lt, t) => { kinetic(g, t, [{ s: 'INVISIBLE', at: T('invisible'), x: W / 2, y: H / 2 - 40, font: F.title(150), color: 'rgba(255,255,255,.9)', track: 30, out: T('hidden in') }]); };
    return S;
  }, { sfx: [[T('invisible'), 'whoosh', { gain: .2, up: false }], [T('equations'), 'paper', { gain: .12 }]], bed: [[T('but the greatest threat'), T('At the urging'), 'hum', { gain: .03 }]] });

  add(T('At the urging') - .1, 'study-szilard-einstein', () => {
    const S = S1.study();
    S.update = (lt) => { camPath(S.camera, lt, [[0, [-1.2, 1.55, 1.5], [.4, 1.15, -1.6], 38], [5, [-.8, 1.45, 1.0], [.3, 1.15, -1.7], 32]]); S.szi.pose({ armR: [.7 + Math.sin(lt * 3) * .15, .1], elbowR: 1.2, head: [.25, Math.sin(lt) * .1, 0] }); };
    S.draw = (g, lt, t) => {
      lowerThird(g, t - T('Leo Szilard'), 'LEO SZILARD', 'physicist · conceived the chain reaction', { out: T('Albert Einstein') - T('Leo Szilard') - .2 });
      lowerThird(g, t - T('Albert Einstein'), 'ALBERT EINSTEIN', 'the most famous scientist alive', { x: 120 });
    };
    return S;
  }, { sfx: [[T('Leo Szilard'), 'whoosh', { gain: .15 }], [T('Albert Einstein'), 'whoosh', { gain: .15 }], [T('sends a letter'), 'paper', { gain: .2 }]], bed: [[T('At the urging'), T('President Franklin'), 'room', { gain: .05 }]] });

  add(T('President Franklin') - .1, 'oval-fdr', () => {
    const S = S1.oval({ reading: false });
    S.update = (lt) => camPath(S.camera, lt, [[0, [2.8, 1.5, .8], [0, 1.1, -2.6], 34], [2.5, [2.2, 1.4, .2], [0, 1.1, -2.7], 30]]);
    S.draw = (g, lt, t) => lowerThird(g, t - T('President Franklin'), 'FRANKLIN D. ROOSEVELT', '32nd President of the United States');
    return S;
  }, { sfx: [[T('President Franklin'), 'whoosh', { gain: .15 }]] });

  add(T('Its warning is chilling') - .1, 'letter-close', () => {
    const S = S1.study();
    S.update = (lt) => camPath(S.camera, lt, [[0, [-.1, 1.2, -1.9], [-.1, .79, -1.27], 30], [1.6, [-.08, 1.08, -1.75], [-.1, .79, -1.22], 26]]);
    S.grade = { tint: [1.08, 1, .88], sat: .9, bloom: .5, vignette: .65 };
    return S;
  }, { sfx: [[T('Its warning is chilling'), 'heartbeat', { beats: 2, gain: .35 }]] });

  add(T('Nazi Germany') - .1, 'map-germany-bomb', () => flat(null, (g, lt, t) => {
    const p = mapCam(lt, [[0, [14, 51], 1500], [5, [12, 51], 1900]]);
    drawMap(g, p, { theme: 'ink', landCol: '#2a1414', seaCol: '#0d0506', highlight: { germany: '#b3191f' } });
    const [x, y] = p(LL.berlin); const pl = (lt * .9) % 1;
    g.save(); g.strokeStyle = '#ff4a3a'; for (let i = 0; i < 3; i++) { const ph = (pl + i / 3) % 1; g.globalAlpha = 1 - ph; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 20 + ph * 220, 0, 7); g.stroke(); } g.restore();
    stamp(g, t - T('Nazi Germany'), 'NAZI GERMANY', x, y - 120, { font: F.title(84), track: 8, out: T('may already') - T('Nazi Germany') + 1.5 });
    kinetic(g, t, [{ s: 'AN ENTIRELY NEW', at: T('an entirely new'), x: W / 2, y: H - 300, font: F.title(64, 500), color: '#e6d6c6', track: 10 }, { s: 'KIND OF BOMB', at: T('kind of bomb'), x: W / 2, y: H - 210, font: F.title(110), color: '#ff4a3a', track: 8 }]);
    vignette(g, .6); grain(g, t, .8);
  }), { sfx: [[T('Nazi Germany'), 'stamp', { gain: .5 }], [T('kind of bomb'), 'boom', { gain: .6 }]] });

  add(T('one powered by') - .1, 'chain-reaction', () => {
    const S = S1.chainReaction({ gens: 6 }); const t0 = T('one powered by') - .1; const tc = T('chain reaction') - t0;
    S.genT = (gn) => tc - .9 + gn * .42;
    S.update = (lt) => { const r = lerp(10, 34, easeInOut(lt / 4)); const a = lt * .25; look(S.camera, [Math.sin(a) * r, 3 + lt, Math.cos(a) * r], [0, 0, 0]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'NUCLEAR CHAIN REACTION', at: T('nuclear chain'), x: W / 2, y: 150, font: F.title(72), color: '#cfeeff', track: 10, shadow: ['#3aa0ff', 30] }]);
    return S;
  }, { sfx: [0, 1, 2, 3, 4, 5].map((gn) => [T('chain reaction') - .9 + gn * .42 + .1, 'pop', { gain: .14 + gn * .03, f: 500 + gn * 120 }]).concat([[T('one powered by'), 'riser', { dur: 1.8, gain: .3 }]]) });

  add(T('The scientists warned') - .1, 'one-bomb-one-city', () => {
    const S = aerialCity({ tod: 'dusk', houses: 5000 }); const t0 = T('The scientists warned') - .1;
    const plane = b29({ name: '', tail: '', tailNum: '' }); plane.scale.setScalar(4); S.scene.add(plane);
    const ring = shockRing('#ff3a2a'); ring.position.y = 20; S.scene.add(ring);
    const td = T('destroy an entire city') - t0;
    S.update = (lt) => {
      look(S.camera, [lerp(3800, 3000, lt / 6), lerp(5200, 4300, lt / 6), lerp(5200, 4300, lt / 6)], [0, 0, 0]);
      plane.position.set(lerp(-3500, 2500, lt / 6.5), 1700, -600); plane.rotation.y = Math.PI / 2; plane.userData.spin(lt);
      const k = lt - td; ring.userData.set(k > 0 ? 2400 * expoOut(k / 1.2) : 0, k > 0 ? .9 : 0);
    };
    S.draw = (g, lt, t) => {
      stamp(g, t - T('a single bomb'), '1 BOMB', W / 2 - 250, 170, { font: F.title(110), color: '#fff', out: 99 });
      stamp(g, t - T('destroy an entire city'), '= 1 CITY', W / 2 + 200, 170, { font: F.title(110), color: '#ff4a3a' });
    };
    return S;
  }, { sfx: [[T('a single bomb'), 'pop', { gain: .2 }], [T('destroy an entire city'), 'boom', { gain: .55 }]], bed: [[T('The scientists warned'), T('Einstein urges'), 'engine', { gain: .06 }]] });

  add(T('Einstein urges') - .1, 'fdr-reads', () => {
    const S = S1.oval({ reading: true });
    S.update = (lt) => camPath(S.camera, lt, [[0, [-1.4, 1.5, -.6], [.05, 1.2, -2.8], 34], [3.6, [-1.0, 1.42, -1.0], [0, 1.25, -2.9], 30]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'BEGIN AMERICA\'S OWN RESEARCH', at: T("America's own research"), x: W / 2, y: 150, font: F.title(56), color: '#fff', track: 6, shadow: ['#000', 20] }]);
    return S;
  });

  add(T('The letter sets') - .1, 'kinetic-history', () => words('paper', [
    { s: 'The letter sets something in motion…', at: T('The letter sets'), x: W / 2, y: 250, font: F.serif(52), color: '#2a2622', dy: 20 },
    { s: 'HISTORY', at: T('history,', 0, 40), x: W / 2, y: 430, font: F.sans(150, 800), color: '#151515', track: 4 },
    { s: 'WARFARE', at: T('warfare'), x: W / 2, y: 600, font: F.sans(150, 800), color: '#151515', track: 4 },
    { s: 'HUMAN FEAR', at: T('human fear'), x: W / 2, y: 790, font: F.sans(170, 800), color: PAL.red, track: 2 },
  ], { captions: false }), { sfx: [[T('history,', 0, 40), 'whoosh', { gain: .18 }], [T('warfare'), 'whoosh', { gain: .18 }], [T('human fear'), 'boom', { gain: .45, pitch: 1.2 }]] });

  // ── 3 years before ──────────────────────────────────────────────
  add(T('Three years before') - .15, 'title-3y', () => titleCard({ big: '3 YEARS', small: 'BEFORE THE ATTACK', date: 'August 1942', dateAt: T('August 1942') }),
    { sfx: [[T('Three years before') - .1, 'boom'], [T('August 1942'), 'tick', { gain: .4 }]], bed: [[T('Three years before'), T('The U.S. government') , 'ticking', { gain: .14 }]] });

  add(T('The U.S. government') - .1, 'manhattan-folder', () => {
    const S = stage({ sky: false, bg: '#050505', light: { sun: [1, 6, 2], sunCol: '#ffe8c0', sunI: 1.1, hemiI: .2, area: 2 } });
    const tbl = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), M('#4a2c18', { rough: .45 })); tbl.rotation.x = -Math.PI / 2; tbl.receiveShadow = true; S.scene.add(tbl);
    const c = canvas(1024, 1300), g = c.getContext('2d'); g.fillStyle = '#c9a86a'; g.fillRect(0, 0, 1024, 1300); g.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 400; i++) g.fillRect(Math.random() * 1024, Math.random() * 1300, 3, 3);
    g.fillStyle = '#1d1a16'; g.font = '700 46px "JetBrains Mono"'; g.textAlign = 'center'; g.fillText('WAR DEPARTMENT', 512, 160); g.font = '400 30px "JetBrains Mono"'; g.fillText('CORPS OF ENGINEERS', 512, 210);
    g.font = '700 92px Oswald'; g.fillText('MANHATTAN', 512, 520); g.fillText('ENGINEER DISTRICT', 512, 630); g.font = '400 34px "JetBrains Mono"'; g.fillText('FILE No. 1942-S-1', 512, 760);
    const folder = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.15), new THREE.MeshStandardMaterial({ map: tex(c), roughness: .85 })); folder.rotation.x = -Math.PI / 2; folder.position.y = .005; folder.castShadow = true; S.scene.add(folder);
    const sc = canvas(1024, 400), sg = sc.getContext('2d'); sg.strokeStyle = sg.fillStyle = 'rgba(200,20,25,.9)'; sg.lineWidth = 16; sg.strokeRect(40, 40, 944, 320); sg.font = '700 190px Oswald'; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillText('TOP SECRET', 512, 210);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(.7, .27), new THREE.MeshBasicMaterial({ map: tex(sc), transparent: true, opacity: 0, depthWrite: false })); st.rotation.set(-Math.PI / 2, 0, .15); st.position.set(.05, .008, -.3); S.scene.add(st);
    const stamper = new THREE.Group(); stamper.add(P.cyl(.06, .06, .18, M('#2a1a10', { rough: .3 }), 0, .2, 0)); stamper.add(P.box(.36, .06, .16, M('#3a2414'), 0, .05, 0)); S.scene.add(stamper);
    const lamp = P.bankerLamp(S.scene); lamp.position.set(-.8, 0, -.7); S.scene.add(lamp);
    const ts = T('Manhattan Project') - (T('The U.S. government') - .1);
    S.update = (lt) => { look(S.camera, [0, lerp(1.9, 1.5, lt / 3), lerp(.9, .6, lt / 3)], [0, 0, -.1]); const k = lt - ts; const y = k < -.25 ? .8 : k < 0 ? lerp(.8, 0, (k + .25) / .25) : k < .3 ? 0 : lerp(0, .9, (k - .3) / .4); stamper.position.set(.05, y + .01, -.3); st.material.opacity = k > 0 ? 1 : 0; if (k > 0 && k < .2) shake(S.camera, lt, .02); };
    S.grade = { tint: [1.06, 1, .9], bloom: .5, vignette: .65 };
    return S;
  }, { sfx: [[T('Manhattan Project'), 'stamp', { gain: .7 }]] });

  add(T('the largest') - .05, 'kinetic-largest', () => words('paper', [
    { s: 'THE MANHATTAN PROJECT', at: T('the largest') - .3, x: W / 2, y: 200, font: F.serif(46), color: '#555', dy: 10, track: 4 },
    { s: 'LARGEST', at: T('the largest'), x: W / 2, y: 380, font: F.sans(140, 800), color: '#151515' },
    { s: 'MOST EXPENSIVE', at: T('most expensive'), x: W / 2, y: 560, font: F.sans(120, 800), color: '#151515' },
    { s: 'MOST SECRETIVE', at: T('most secretive'), x: W / 2, y: 740, font: F.sans(120, 800), color: PAL.red },
    { s: '≈ $2 billion  ·  30+ sites  ·  1942–1946', at: T('research program'), x: W / 2, y: 880, font: F.serif(40), color: '#444', dy: 10 },
  ], { captions: false }), { sfx: [[T('the largest'), 'whoosh', { gain: .15 }], [T('most expensive'), 'whoosh', { gain: .15 }], [T('most secretive'), 'stamp', { gain: .4 }]] });

  add(T('Under General') - .1, 'groves-oppenheimer', () => {
    const S = S1.losAlamos(); S.grow(1);
    const gv = CAST.groves(), op = CAST.oppenheimer(); gv.position.set(-1.1, 0, 230); op.position.set(1.0, 0, 230.2); gv.rotation.y = .25; op.rotation.y = -.3; op.pose({ armL: [.4, .1], elbowL: 1.8, armR: [.3, .1] }); S.scene.add(gv, op);
    S.update = (lt) => camPath(S.camera, lt, [[0, [0, 1.6, 236], [0, 1.45, 229], 34], [4, [-.6, 1.55, 235], [0, 1.45, 229], 30]]);
    S.draw = (g, lt, t) => { lowerThird(g, t - T('General Leslie'), 'GEN. LESLIE GROVES', 'military director', { out: T('brilliant physicist') - T('General Leslie') - .1 }); lowerThird(g, t - T('J. Robert'), 'J. ROBERT OPPENHEIMER', 'scientific director', { align: 'right' }); };
    return S;
  }, { sfx: [[T('General Leslie'), 'whoosh', { gain: .15 }], [T('J. Robert'), 'whoosh', { gain: .15 }]], bed: [[T('Under General'), T('Across the country'), 'wind', { gain: .1 }]] });

  add(T('a secret town') - .1, 'los-alamos-rise', () => {
    const S = S1.losAlamos(); const t0 = T('a secret town') - .1;
    S.update = (lt) => { S.grow(clamp(lt / 2.6)); camPath(S.camera, lt, [[0, [-330, 70, 330], [0, 0, 0], 40], [4, [-230, 95, 240], [0, 0, 0], 40]]); };
    S.draw = (g, lt, t) => { reveal(g, 'LOS ALAMOS', 140, 150, clamp(lt / .8), { font: F.title(90), align: 'left', track: 8, dx: -40, dy: 0, shadow: ['#000', 20] }); reveal(g, 'Site Y · New Mexico desert', 146, 225, clamp((lt - .3) / .8), { font: F.serif(40), align: 'left', color: '#ffe0c0', dx: -30, dy: 0 }); };
    return S;
  }, { sfx: [[T('a secret town'), 'rumble', { dur: 3, gain: .35 }]] });

  add(T('Across the country') - .1, 'usa-sites', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [-98, 39], 900], [4, [-98, 39], 1050]]); drawMap(g, p, { theme: 'ink', highlight: { usa: '#23343c' } });
    marker(g, p, LL.losalamos, 'LOS ALAMOS', clamp(lt / .4), { sub: 'design', side: 1, color: PAL.amber });
    marker(g, p, LL.oakridge, 'OAK RIDGE', clamp((t - T('enormous industrial')) / .4), { sub: 'uranium', side: 1 });
    marker(g, p, LL.hanford, 'HANFORD', clamp((t - T('facilities take shape')) / .4), { sub: 'plutonium', side: 1, color: '#a070ff' });
    reveal(g, 'THE MANHATTAN PROJECT', 120, 110, clamp(lt / .7), { font: F.mono(30, 700), align: 'left', color: '#b8c4cc', dy: 0, dx: -20, track: 6 });
  }), { sfx: [[T('Across the country'), 'data', { gain: .07 }], [T('enormous industrial'), 'pop'], [T('facilities take shape'), 'pop', { f: 700 }]] });

  add(T('Oak Ridge') - .1, 'oak-ridge', () => {
    const S = S1.oakRidge();
    S.update = (lt) => camPath(S.camera, lt, [[0, [-420, 55, 260], [0, 10, -80], 40], [2.2, [-340, 45, 210], [0, 10, -80], 40]]);
    S.draw = (g, lt, t) => { reveal(g, 'OAK RIDGE, TENNESSEE', 140, 150, clamp(lt / .6), { font: F.title(76), align: 'left', track: 6, dx: -40, dy: 0, shadow: ['#000', 20] }); reveal(g, 'enriches uranium-235 · K-25 plant', 146, 220, clamp((t - T('enriches')) / .6), { font: F.serif(40), align: 'left', color: '#ffe0b0', dx: -30, dy: 0 }); };
    return S;
  }, { bed: [[T('Oak Ridge'), T('More than 130,000'), 'hum', { gain: .05, f: 50 }]] });

  add(T('Hanford produces') - .1, 'hanford', () => {
    const S = S1.hanford();
    S.update = (lt) => camPath(S.camera, lt, [[0, [160, 50, 190], [0, 18, 0], 40], [2.4, [120, 40, 150], [0, 18, 0], 40]]);
    S.draw = (g, lt, t) => { reveal(g, 'HANFORD, WASHINGTON', 140, 150, clamp(lt / .6), { font: F.title(76), align: 'left', track: 6, dx: -40, dy: 0, shadow: ['#000', 20] }); reveal(g, 'produces plutonium · B Reactor', 146, 220, clamp((t - T('produces plutonium')) / .6), { font: F.serif(40), align: 'left', color: '#e8d0ff', dx: -30, dy: 0 }); };
    return S;
  });

  add(T('More than 130,000') - .1, 'people-130k', () => flat('ink', (g, lt, t) => {
    const k = clamp((t - T('More than 130,000')) / 1.4); const n = count(t, T('More than 130,000'), T('More than 130,000') + 1.6, 0, 130000);
    const few = t > T('only a select few') ? 7 : Infinity;
    dotGrid(g, { x: 260, y: 360, cols: 60, rows: 22, gap: 24, r: 8, k, active: few, col: '#d8cfbd', activeCol: PAL.amber });
    text(g, fmt(n), 260, 220, { font: F.title(150), align: 'left', color: '#fff', track: 2 });
    text(g, 'PEOPLE', 260 + measure(g, fmt(n), F.title(150), 2) + 30, 245, { font: F.title(60, 500), align: 'left', color: '#a9a296', track: 8 });
    if (t > T('only a select few')) { reveal(g, 'only a select few knew why', 260, 950, clamp((t - T('only a select few')) / .6), { font: F.serif(50), align: 'left', color: PAL.amber, dx: -20, dy: 0 }); }
  }), { sfx: [[T('More than 130,000'), 'counter', { dur: 1.6 }], [T('only a select few'), 'pop', { f: 900 }]] });

  add(T('Most workers simply') - .1, 'calutron-girls', () => {
    const S = S1.calutron();
    S.update = (lt) => { camPath(S.camera, lt, [[0, [-9, 1.6, 3.2], [-4, 1.3, 0], 40], [5, [-2, 1.5, 3.2], [3, 1.3, 0], 40]]); S.ops.forEach((o, i) => o.userData.rig.armR.el.rotation.x = -(.4 + Math.sin(lt * 2 + i) * .15)); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'WITHOUT UNDERSTANDING', at: T('without understanding'), x: W / 2, y: 140, font: F.title(64), color: '#fff', track: 8, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('Most workers simply'), T('The resources'), 'hum', { gain: .05 }]], sfx: [[T('monitor instruments'), 'data', { gain: .06 }]] });

  add(T('The resources of') - .1, 'atom-energy', () => {
    const S = stage({ sky: { top: '#020308', mid: '#060a14', bot: '#020308', stars: .8, sunGlow: 0 }, light: { sun: [5, 8, 6], sunI: .5, hemiI: .2, shadow: false }, env: .3 });
    const a = S1.atomModel({ scale: 1, glow: 1.2 }); S.scene.add(a);
    S.update = (lt) => { const z = lerp(7, 1.4, easeInOut(lt / 6)); look(S.camera, [Math.sin(lt * .2) * z * .3, .4, z], [0, 0, 0]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'THE ENERGY INSIDE THE ATOM', at: T('the energy inside'), x: W / 2, y: H - 230, font: F.title(64), color: '#cfeeff', track: 8, shadow: ['#3aa0ff', 24] }]);
    S.grade = { bloom: .9, bloomThreshold: .7 };
    return S;
  }, { sfx: [[T('The resources of'), 'riser', { dur: 5, gain: .25 }]] });

  add(T('The race is on') - .1, 'race-bars', () => flat('ink', (g, lt, t) => {
    const t0 = T('The race is on'); const tb = T('hopelessly behind');
    reveal(g, 'THE RACE FOR THE BOMB', 200, 220, clamp((t - t0) / .6), { font: F.title(84), align: 'left', track: 6, dx: -30, dy: 0 });
    const us = clamp((t - t0) / 6) * .82, de = Math.min(.24, clamp((t - t0) / 6) * .5);
    barH(g, { x: 200, y: 430, w: 1400, frac: us, label: 'UNITED STATES', value: '', color: '#3a8ad8' });
    barH(g, { x: 200, y: 640, w: 1400, frac: de, label: 'NAZI GERMANY', value: t > tb ? 'HOPELESSLY BEHIND' : '', color: t > tb ? '#7a1a1a' : PAL.red, valueFont: F.title(40) });
    if (t > T('later discover')) reveal(g, 'as the Americans will later discover', 200, 860, clamp((t - T('later discover')) / .6), { font: F.serif(44), align: 'left', color: '#a9a296', dx: -20, dy: 0 });
  }), { sfx: [[T('The race is on'), 'whoosh', { gain: .2 }], [T('hopelessly behind'), 'stamp', { gain: .4 }]] });

  // ── 1 year before ──────────────────────────────────────────────
  add(T('One year before') - .15, 'title-1y', () => titleCard({ big: '1 YEAR', small: 'BEFORE THE ATTACK', date: 'Summer 1944', dateAt: T('summer 1944') }),
    { sfx: [[T('One year before') - .1, 'boom'], [T('summer 1944'), 'tick', { gain: .4 }]], bed: [[T('One year before'), T('The Pacific War'), 'ticking', { gain: .14 }]] });

  add(T('The Pacific War') - .1, 'pacific-battle', () => {
    const S = S2.pacificBattle();
    S.update = (lt) => { camPath(S.camera, lt, [[0, [-300, 40, 600], [0, 60, -600], 40], [5, [-150, 55, 420], [100, 60, -700], 40]]); handheld(S.camera, lt, .015); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'A RELENTLESS SLAUGHTER', at: T('relentless slaughter'), x: W / 2, y: 150, font: F.title(70), color: '#ffe0c8', track: 8, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('The Pacific War'), T('American aircraft'), 'sea', { gain: .1 }]], sfx: [[T('The Pacific War') + .5, 'flak', { gain: .3, p: -.5 }], [T('relentless'), 'flak', { gain: .35, p: .4 }], [T('slaughter') + .3, 'explosion', { gain: .3, dur: 3 }]] });

  add(T('American aircraft') - .1, 'firebombing', () => {
    const S = S2.firebomb();
    S.update = (lt) => camPath(S.camera, lt, [[0, [-2600, 1400, 2400], [0, 300, 0], 40], [5.5, [-1900, 1200, 2000], [400, 200, -200], 40]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'INCENDIARY RAIDS', at: T('incendiary bombing'), x: W / 2, y: 150, font: F.title(70), color: '#ffcf9a', track: 10, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('American aircraft'), T('Tokyo has been'), 'engine', { gain: .1 }], [T('devastating'), T('Meanwhile, scientists'), 'fire', { gain: .12 }]] });

  add(T('Tokyo has been') - .1, 'tokyo-ashes', () => {
    const S = S2.firebomb({ ashes: true });
    S.update = (lt) => camPath(S.camera, lt, [[0, [1800, 900, 1800], [0, 0, 0], 40], [6, [1300, 700, 1300], [0, 0, 0], 40]]);
    S.draw = (g, lt, t) => { reveal(g, 'TOKYO', 140, 150, clamp(lt / .5), { font: F.title(110), align: 'left', track: 14, dx: -40, dy: 0, shadow: ['#000', 20] }); reveal(g, 'reduced to ashes', 146, 240, clamp((t - T('reduced to ashes')) / .6), { font: F.serif(46), align: 'left', color: '#e8dccb', dx: -30, dy: 0 });
      stamp(g, t - T('Hundreds of thousands'), 'HUNDREDS OF THOUSANDS', W / 2, H - 260, { font: F.title(80), color: '#fff', bg: 'rgba(160,20,20,.85)', pad: 40 }); };
    return S;
  }, { sfx: [[T('Hundreds of thousands'), 'boom', { gain: .4 }]], bed: [[T('Tokyo has been'), T('Meanwhile, scientists'), 'wind', { gain: .1, f: 300 }]] });

  add(T('Meanwhile, scientists') - .1, 'los-alamos-clock', () => {
    const S = S1.lab(); const clk = P.wallClock({ h: 11, m: 50, r: .32 }); clk.position.set(2.8, 2.5, -3.44); S.scene.add(clk);
    S.update = (lt, t) => { clk.userData.set(11, 50 + lt / 5, (lt * 6) % 60); camPath(S.camera, lt, [[0, [1, 1.6, .8], [1.4, 2, -3.3], 40], [5, [1.8, 2.1, -1.3], [2.8, 2.5, -3.4], 30]]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'ONLY A MATTER OF TIME', at: T('only a matter of time'), x: W / 2, y: H - 230, font: F.title(70), color: '#fff', track: 10, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('Meanwhile, scientists'), T('A special committee'), 'ticking', { gain: .2 }]] });

  const japanCanvas = () => { const c = canvas(2048, 1260); const g = c.getContext('2d'); const p = proj([136, 36], 3600 * 2048 / 1920 * .85); g.save(); g.scale(2048 / 1920, 1260 / 1080); drawMap(g, p, { theme: 'paper', landCol: '#d9cfb3', seaCol: '#9fb4b8', highlight: { japan: '#e6dcc0' } }); g.restore(); return c; };
  add(T('A special committee') - .1, 'target-committee', () => {
    const S = S1.committee(japanCanvas());
    S.update = (lt) => camPath(S.camera, lt, [[0, [0, 3.4, 2.6], [0, .8, 0], 40], [2.6, [0, 2.9, 1.9], [0, .8, -.1], 40]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'TARGET COMMITTEE', at: T('A special committee') + .2, x: W / 2, y: 130, font: F.title(68), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { sfx: [[T('A special committee'), 'paper', { gain: .2 }]], bed: [[T('A special committee'), T('Secretary of War') + 8, 'drone', { gain: .09, root: 36, chord: [0, 3, 7, 10] }]] });

  const cities = [['KYOTO', LL.kyoto, 'Kyoto,', 1, 'ancient capital'], ['HIROSHIMA', LL.hiroshima, 'Hiroshima,', -1, ''], ['YOKOHAMA', LL.yokohama, 'Yokohama,', 1, ''], ['KOKURA', LL.kokura, 'Kokura,', -1, ''], ['NIIGATA', LL.niigata, 'Niigata.', 1, '']];
  const japanMap = (g, lt, t, { strike = 0, focus = 0 } = {}) => {
    const p = mapCam(lt, [[0, [135.5, 35.6], 2600], [6, [135, 35.4], 2900]]);
    drawMap(g, p, { theme: 'ink', highlight: { japan: '#30373a' } });
    cities.forEach(([n, ll, w, side], i) => marker(g, p, ll, n, clamp((t - T(w)) / .35), { side, strike: n === 'KYOTO' ? strike : 0, color: n === 'HIROSHIMA' && focus ? PAL.red : PAL.amber, pulse: n === 'HIROSHIMA' && focus ? lt * .8 : 0 }));
    return p;
  };
  add(T('The list includes') - .1, 'japan-targets', () => flat('ink', (g, lt, t) => { japanMap(g, lt, t); reveal(g, 'TARGET LIST · 1945', 120, 110, clamp(lt / .7), { font: F.mono(30, 700), align: 'left', color: '#b8c4cc', dy: 0, dx: -20, track: 6 }); }),
    { sfx: cities.map(([, , w]) => [T(w), 'pop', { gain: .18, f: 700 }]) });

  add(T('The criteria are specific') - .1, 'criteria', () => flat('paper', (g, lt, t) => {
    reveal(g, 'THE CRITERIA', 260, 230, clamp(lt / .6), { font: F.sans(90, 800), align: 'left', color: '#111', dx: -30, dy: 0 });
    checklist(g, t, [{ s: 'Military or industrial importance', at: T('military or industrial'), check: T('importance,') }, { s: 'Relatively undamaged by bombing', at: T('relatively undamaged'), check: T('conventional bombing') }, { s: 'So the effects can be measured', at: T('the effects of'), check: T('measured.') }], { x: 260, y: 430, gap: 150 });
  }), { sfx: [[T('importance,'), 'tick', { gain: .4 }], [T('conventional bombing'), 'tick', { gain: .4 }], [T('measured.'), 'tick', { gain: .4 }]] });

  add(T('Secretary of War') - .1, 'stimson-kyoto', () => flat('ink', (g, lt, t) => {
    japanMap(g, lt + 6, t, { strike: clamp((t - T('remove Kyoto')) / .5) });
    lowerThird(g, t - T('Henry Stimson'), 'HENRY L. STIMSON', 'Secretary of War');
  }), { sfx: [[T('remove Kyoto'), 'whoosh', { gain: .3, up: false }], [T('remove Kyoto') + .3, 'stamp', { gain: .4 }]] });

  add(T('He recognizes') - .1, 'kyoto-temple', () => {
    const S = S1.kyoto();
    S.update = (lt) => camPath(S.camera, lt, [[0, [0, 3, 60], [0, 14, -40], 40], [6, [-8, 4, 34], [0, 16, -40], 40]]);
    S.draw = (g, lt, t) => { reveal(g, 'KYOTO', 140, 150, clamp(lt / .6), { font: F.title(100), align: 'left', track: 14, dx: -40, dy: 0, shadow: ['#000', 20] }); reveal(g, 'cultural heart of Japan · spared', 146, 235, clamp((t - T('cultural importance')) / .6), { font: F.serif(42), align: 'left', color: '#ffe8d0', dx: -30, dy: 0 }); };
    return S;
  }, { sfx: [[T('He recognizes') + .3, 'bell', { gain: .25, f: 196 }]], bed: [[T('He recognizes'), T('Hiroshima, a major'), 'wind', { gain: .08 }]] });

  add(T('Hiroshima, a major') - .1, 'hiroshima-target', () => {
    const S = aerialCity({ tod: 'day' });
    S.update = (lt) => camPath(S.camera, lt, [[0, [4200, 5200, 5200], [0, 0, 0], 40], [6.5, [1400, 3200, 2200], [0, 0, 0], 40]]);
    S.draw = (g, lt, t) => {
      const [x, y] = toScreen(S.camera, [0, 0, 0]); const k = clamp((t - T('primary target')) / .5);
      reveal(g, 'HIROSHIMA', 140, 150, clamp(lt / .6), { font: F.title(100), align: 'left', track: 14, dx: -40, dy: 0, shadow: ['#000', 20] });
      reveal(g, 'industrial centre · military port · pop. ~350,000', 146, 235, clamp((t - T('industrial center')) / .6), { font: F.serif(40), align: 'left', color: '#ffeedd', dx: -30, dy: 0, shadow: ['#000', 10] });
      if (k > 0) { g.save(); g.strokeStyle = PAL.red; g.lineWidth = 4; g.globalAlpha = k; const r = lerp(400, 120, expoOut(k)); g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.beginPath(); g.moveTo(x + dx * r * .6, y + dy * r * .6); g.lineTo(x + dx * r * 1.4, y + dy * r * 1.4); g.stroke(); } g.restore();
        stamp(g, t - T('primary target'), 'PRIMARY TARGET', x, y + 200, { font: F.title(64), color: '#fff', bg: 'rgba(200,20,25,.9)', pad: 30 }); }
    };
    return S;
  }, { sfx: [[T('primary target'), 'boom', { gain: .5 }]], bed: [[T('Hiroshima, a major'), T('One month before'), 'wind', { gain: .07 }]] });
}
