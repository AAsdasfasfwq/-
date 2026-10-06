// ACT IV–VI: Trinity → Tinian → Enola Gay → the approach (166s – 400s)
import * as THREE from 'three';
import { T, TE } from '../core/time.js';
import { titleCard, stage, look, camPath, shake, handheld, toScreen, pin3D } from './common.js';
import { flat, words, quoteShot } from './two.js';
import * as S1 from './sets1.js';
import * as S2 from './sets2.js';
import * as S3 from './sets3.js';
import { gunType, escapeTurn } from './blueprint.js';
import { aerialCity } from './act1.js';
import { text, reveal, F, PAL, W, H, lowerThird, stamp, measure, fmt, vignette, grain, typeText } from '../2d/draw.js';
import { kinetic, clockFace, altimeter, panel, redactBar, scanlines } from '../2d/info.js';
import { drawMap, proj, marker, route, LL, mapCam, planeIcon } from '../2d/maps.js';
import { b29 } from '../kit/aircraft.js';
import { littleBoy, pumpkin } from '../kit/bombs.js';
import { fire, smoke, motes } from '../kit/fx.js';
import * as P from '../kit/props.js';
import { M } from '../kit/materials.js';
import { CAST, POSE } from '../kit/people.js';
import { spot, point } from '../kit/env.js';
import { clamp, expoOut, easeOut, easeIn, easeInOut, lerp, smooth } from '../core/math.js';
import { canvas, tex } from '../core/textures.js';

const side = (g, lt, t, title, sub, subAt) => { reveal(g, title, 140, 150, clamp(lt / .6), { font: F.title(84), align: 'left', track: 8, dx: -40, dy: 0, shadow: ['#000', 20] }); if (sub) reveal(g, sub, 146, 228, clamp((t - (subAt ?? -1e9)) / .6) * clamp((lt - .3) / .6), { font: F.serif(40), align: 'left', color: '#ffe8d0', dx: -30, dy: 0, shadow: ['#000', 10] }); };

export default function act2(add) {
  // ── 1 month before: Trinity ───────────────────────────────────
  add(T('One month before') - .15, 'title-1m', () => titleCard({ big: '1 MONTH', small: 'BEFORE THE ATTACK', date: 'July 16, 1945', dateAt: T('One month before') + .6 }),
    { sfx: [[T('One month before') - .1, 'boom']], bed: [[T('One month before'), T('The Jornada'), 'ticking', { gain: .14 }]] });

  const tFlash = T('a flash brighter');
  add(T('The Jornada') - .1, 'trinity-night', () => {
    const S = S2.trinity({ blastAt: 999 });
    S.update = (lt) => camPath(S.camera, lt, [[0, [60, 6, 90], [0, 22, 0], 40], [3.4, [40, 10, 60], [0, 26, 0], 40]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'JORNADA DEL MUERTO', 'New Mexico · "the journey of the dead man"', T('Desert, New Mexico'));
    return S;
  }, { bed: [[T('The Jornada'), tFlash, 'wind', { gain: .1, f: 300 }]], sfx: [[T('Before dawn'), 'riser', { dur: tFlash - T('Before dawn'), gain: .35 }]] });

  add(T('Before dawn') - .1, 'trinity-flash', () => {
    const t0 = T('Before dawn') - .1; const S = S2.trinity({ blastAt: tFlash - t0 });
    S.update = (lt) => { look(S.camera, [0, 25, 5200], [0, 700, 0]); S.camera.fov = 40; if (lt > tFlash - t0) shake(S.camera, lt, clamp(1.5 - (lt - (tFlash - t0)) * .3) * 14); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'BRIGHTER THAN A THOUSAND SUNS', at: T('thousand suns'), x: W / 2, y: 150, font: F.title(64), color: '#fff', track: 10, shadow: ['#000', 30] }]);
    return S;
  }, { sfx: [[tFlash, 'flash', { gain: .3 }], [tFlash + .05, 'explosion', { gain: 1, dur: 9 }], [tFlash + 2.5, 'rumble', { dur: 6, gain: .5 }]] });

  add(T('This is Trinity') - .1, 'trinity-title', () => {
    const t0 = T('This is Trinity') - .1; const S = S2.trinity({ blastAt: tFlash - t0 });
    S.update = (lt) => { look(S.camera, [-2200, 150, 5000], [0, 1300, 0]); S.camera.fov = 42; };
    S.draw = (g, lt, t) => { stamp(g, t - T('Trinity,'), 'TRINITY', W / 2, H / 2 - 40, { font: F.title(220), color: '#fff', track: 40 }); reveal(g, 'the first nuclear explosion in human history', W / 2, H / 2 + 110, clamp((t - T('the first nuclear')) / .6), { font: F.serif(48), color: '#ffe8d0', dy: 16 }); };
    return S;
  }, { sfx: [[T('Trinity,'), 'boom', { gain: .5 }]], bed: [[T('This is Trinity'), T('Sand beneath'), 'wind', { gain: .12, f: 200 }]] });

  add(T('A fireball rises') - .1, 'trinity-mushroom', () => {
    const t0 = T('A fireball rises') - .1; const S = S2.trinity({ blastAt: tFlash - t0 - 2 });
    S.update = (lt) => { camPath(S.camera, lt, [[0, [3400, 120, 5200], [0, 1900, 0], 46], [6.5, [2800, 160, 4600], [0, 2500, 0], 50]]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'SMOKE & RADIOACTIVE DUST', at: T('radioactive dust'), x: W / 2, y: H - 230, font: F.title(56), color: '#ffe0c0', track: 8, shadow: ['#000', 24] }]);
    return S;
  });

  add(T('Sand beneath') - .1, 'trinitite', () => {
    const S = S2.trinitite();
    S.update = (lt) => camPath(S.camera, lt, [[0, [1.6, .9, 1.8], [0, 0, 0], 40], [3.3, [.9, .6, 1.1], [0, 0, 0], 40]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'TRINITITE', 'sand fused into green glass', T('greenish glass'));
    return S;
  }, { sfx: [[T('greenish glass'), 'glass', { gain: .2 }]] });

  add(T('Watching the apocalyptic') - .1, 'bunker-oppenheimer', () => {
    const S = S2.bunker();
    S.update = (lt) => { S.setFlash(.35 + .25 * Math.sin(lt * 2) ** 2); camPath(S.camera, lt, [[0, [1.6, 1.6, 2.6], [-.2, 1.6, -1.4], 40], [7, [.6, 1.65, 1.4], [-.3, 1.7, -1.2], 34]]); };
    S.draw = (g, lt, t) => { lowerThird(g, t - T('Oppenheimer recalls'), 'J. ROBERT OPPENHEIMER', 'recalls the Bhagavad Gita'); };
    return S;
  }, { bed: [[T('Watching the apocalyptic'), T('Now I am become'), 'drone', { gain: .1, root: 33, chord: [0, 7, 12, 16] }]] });

  add(T('Now I am become') - .2, 'quote-death', () => quoteShot(['Now I am become Death,', 'the destroyer of worlds.'], { font: F.serif(86), sub: '— BHAGAVAD GITA · QUOTED BY J. ROBERT OPPENHEIMER', subAt: 2.2, speed: 1.8 }),
    { sfx: [[T('Now I am become') - .1, 'bell', { gain: .3, f: 110 }], [T('the destroyer'), 'piano', { notes: [45], gain: .2, dur: 5 }]] });

  add(T('A few days later') - .1, 'truman-telegram', () => {
    const S = S1.oval({ reading: true }); S.scene.remove(S.fdr); const tr = CAST.truman(); tr.position.set(0, 0, -2.95); tr.pose({ sit: true, armL: [1.1, .2], armR: [1.1, .2], elbowL: .9, elbowR: .9, head: [.3, 0, 0] }); S.scene.add(tr);
    const aide = CAST.stimson(); aide.position.set(1.5, 0, -2.6); aide.rotation.y = -1.5; aide.pose({ armR: [.9, .1], elbowR: .3 }); S.scene.add(aide);
    S.update = (lt) => camPath(S.camera, lt, [[0, [2.4, 1.6, .4], [0, 1.1, -2.6], 34], [8, [1.6, 1.5, -.4], [0, 1.15, -2.7], 30]]);
    S.draw = (g, lt, t) => {
      lowerThird(g, t - T('President Harry'), 'HARRY S. TRUMAN', '33rd President · at Potsdam', { out: T('receives word') - T('President Harry') + .2 });
      const k = clamp((t - T('receives word')) / 3.5); if (k > 0) { panel(g, 1040, 620, 760, 300, { k: clamp((t - T('receives word')) / .4), fill: '#efe7d4' }); g.save(); g.globalAlpha = clamp((t - T('receives word')) / .4); text(g, 'TOP SECRET · URGENT', 1080, 670, { font: F.mono(22, 700), color: '#b3202a', align: 'left' });
        typeText(g, 'OPERATED ON THIS MORNING.', 1080, 730, k * 2, { font: F.mono(28, 700), color: '#1d1a16', cursor: false }); typeText(g, 'DIAGNOSIS NOT YET COMPLETE BUT', 1080, 780, k * 2 - .6, { font: F.mono(28, 700), color: '#1d1a16', cursor: false }); typeText(g, 'RESULTS SEEM SATISFACTORY.', 1080, 830, k * 2 - 1.1, { font: F.mono(28, 700), color: '#1d1a16', cursor: false }); g.restore(); }
    };
    return S;
  }, { sfx: [[T('receives word'), 'typing', { dur: 3, gain: .15 }]] });

  add(T('The United States now possesses') - .1, 'hero-bomb', () => {
    const S = stage({ sky: false, bg: '#020202', light: { sun: [0, 10, 0], sunI: 0, hemiI: .02, shadow: false } });
    const b = littleBoy(); S.scene.add(b); const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M('#0a0a0a', { rough: .3, metal: .5 })); fl.rotation.x = -Math.PI / 2; fl.position.y = -.5; S.scene.add(fl);
    spot(S.scene, [3, 3, -2], [0, 0, 0], '#ff8a4a', 120, .5, .4, true); spot(S.scene, [-3, 2.5, 2], [0, 0, 0], '#7ab0ff', 80, .5, .4, false); spot(S.scene, [0, 6, 0], [0, 0, 0], '#ffffff', 30, .3, .8, true);
    S.update = (lt) => { const a = lt * .15 + .6; look(S.camera, [Math.sin(a) * 4.2, .6, Math.cos(a) * 4.2], [0, 0, 0]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'THE MOST POWERFUL', at: T('the most powerful'), x: W / 2, y: 150, font: F.title(70), color: '#fff', track: 12 }, { s: 'WEAPON ON EARTH', at: T('weapon on earth'), x: W / 2, y: 240, font: F.title(70), color: '#ff6a3a', track: 12 }]);
    S.grade = { bloom: .7, vignette: .7, contrast: 1.15 };
    return S;
  }, { sfx: [[T('the most powerful'), 'boom', { gain: .45 }]], bed: [[T('The United States now possesses'), T('The Allies issue'), 'drone', { gain: .08, root: 31 }]] });

  add(T('The Allies issue') - .1, 'potsdam-doc', () => {
    const S = stage({ sky: false, bg: '#050505', light: { sun: [1, 6, 2], sunCol: '#ffe8c0', sunI: 1.2, hemiI: .2, area: 2 } });
    const tbl = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), M('#3a2414', { rough: .45 })); tbl.rotation.x = -Math.PI / 2; S.scene.add(tbl);
    const hi = []; const c = P.docCanvas(P.POTSDAM, { center: 3, lh: 40, font: '27px "JetBrains Mono"' }); const t = tex(c);
    const doc = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.1), new THREE.MeshStandardMaterial({ map: t, roughness: .85 })); doc.rotation.x = -Math.PI / 2; doc.position.y = .003; doc.castShadow = true; S.scene.add(doc);
    const t0 = T('The Allies issue') - .1; let last = -1;
    S.update = (lt, tt) => {
      const st = (tt > T('unconditional surrender') ? 1 : 0) + (tt > T('prompt and utter') ? 2 : 0);
      if (st !== last) { last = st; const H2 = []; if (st & 1) H2.push(11, 12); if (st & 2) H2.push(13, 14); const nc = P.docCanvas(P.POTSDAM, { center: 3, lh: 40, font: '27px "JetBrains Mono"', highlight: H2 }); t.image = nc; t.needsUpdate = true; }
      camPath(S.camera, lt, [[0, [0, 1.3, .5], [0, 0, -.05], 40], [4, [0, .95, .35], [0, 0, .05], 36], [10, [0, .75, .45], [0, 0, .15], 34]]);
    };
    S.draw = (g, lt, tt) => { kinetic(g, tt, [{ s: 'THE POTSDAM DECLARATION', at: T('Potsdam Declaration'), x: W / 2, y: 120, font: F.title(64), color: '#fff', track: 10, shadow: ['#000', 30] }]); stamp(g, tt - T('prompt and utter'), 'PROMPT AND UTTER DESTRUCTION', W / 2, H - 200, { font: F.title(64), color: '#fff', bg: 'rgba(180,20,25,.9)', pad: 30 }); };
    S.grade = { tint: [1.05, 1, .92], vignette: .6, bloom: .4 };
    return S;
  }, { sfx: [[T('The Allies issue'), 'paper', { gain: .2 }], [T('prompt and utter'), 'stamp', { gain: .45 }]] });

  add(T("Japan's government dismisses") - .1, 'mokusatsu', () => flat('noir', (g, lt, t) => {
    text(g, '黙殺', W / 2, H / 2 - 60, { font: F.jp(300), color: 'rgba(255,255,255,.92)', alpha: clamp(lt / .6), shadow: ['rgba(0,0,0,.5)', 40] });
    reveal(g, 'MOKUSATSU · "to kill with silence"', W / 2, H / 2 + 150, clamp((lt - .5) / .7), { font: F.serif(46), color: '#f0d8c8' });
    kinetic(g, t, [{ s: 'DISMISSED AS A BLUFF', at: T('another bluff') - .3, x: W / 2, y: H - 180, font: F.title(60), color: '#fff', track: 10 }]);
  }), { sfx: [[T("Japan's government dismisses"), 'boom', { gain: .35, pitch: 1.3 }]] });

  // ── 1 week before: Tinian ─────────────────────────────────────
  add(T('One week before') - .15, 'title-1w', () => titleCard({ big: '1 WEEK', small: 'BEFORE THE ATTACK', date: 'July 26, 1945', dateAt: T('One week before') + .6 }),
    { sfx: [[T('One week before') - .1, 'boom']], bed: [[T('One week before'), T('Under strict secrecy'), 'ticking', { gain: .14 }]] });

  add(T('Under strict secrecy') - .1, 'indianapolis', () => {
    const S = S2.cruiserSea();
    S.update = (lt) => camPath(S.camera, lt, [[0, [-140, 30, lt * 14 + 260], [0, 14, lt * 14], 38], [7, [-110, 22, 7 * 14 + 150], [0, 14, 7 * 14], 38]]);
    S.update = ((u) => (lt) => { const z = lt * 14; look(S.camera, [lerp(-150, -95, lt / 7), lerp(32, 20, lt / 7), z + lerp(250, 140, lt / 7)], [0, 14, z]); })();
    S.draw = (g, lt, t) => { side(g, lt, t, 'USS INDIANAPOLIS', 'heavy cruiser · top-secret cargo'); kinetic(g, t, [{ s: 'URANIUM CORE', at: T('uranium core'), x: W / 2, y: H - 220, font: F.title(70), color: '#ffcf8a', track: 12, shadow: ['#000', 24] }]); };
    return S;
  }, { bed: [[T('Under strict secrecy'), T('to Tinian'), 'sea', { gain: .12 }]] });

  add(T('to Tinian') - .1, 'route-tinian', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [175, 25], 520], [2.5, [160, 20], 640]]); drawMap(g, p, { theme: 'ink' });
    route(g, p, [LL.sanfrancisco, LL.hawaii, LL.tinian], clamp(lt / 2), { color: PAL.amber });
    marker(g, p, LL.sanfrancisco, 'SAN FRANCISCO', clamp(lt / .3), { side: -1, font: F.title(30) });
    marker(g, p, LL.tinian, 'TINIAN', clamp((lt - 1.6) / .4), { side: 1, color: PAL.red, pulse: lt * .7 });
    marker(g, p, LL.tokyo, 'JAPAN', clamp((lt - 1.9) / .4), { side: 1, font: F.title(30), color: '#888' });
  }), { sfx: [[T('to Tinian'), 'data', { gain: .07 }], [T('in the Pacific'), 'pop', {}]] });

  add(T('The island has become') - .1, 'tinian-field', () => {
    const S = S2.tinian({ planes: 14 });
    S.update = (lt) => camPath(S.camera, lt, [[0, [-2300, 420, -3900], [-800, 0, -4900], 40], [4.2, [-1900, 300, -4200], [-800, 0, -4950], 40]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'TINIAN · NORTH FIELD', "the world's largest military air base", T("world's largest"));
    return S;
  }, { bed: [[T('The island has become'), T('Inside an air-conditioned'), 'wind', { gain: .1 }]] });

  add(T('From here, B-29') - .1, 'b29-takeoff', () => {
    const S = S2.tinian({ planes: 6 }); const p = S.fleet[0]; const y0 = p.position.y;
    S.update = (lt) => { const x = -1400 + Math.pow(lt, 2) * 38; p.position.set(x, y0 + Math.max(0, lt - 3.2) ** 2 * 6, -5200); p.rotation.z = 0; p.rotation.x = -Math.min(.15, Math.max(0, lt - 3.2) * .1); p.userData.spin(lt + 3); look(S.camera, [-1180, y0 + 3, -5165], [x, y0 + 4, -5200]); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'RAIDS AGAINST JAPAN', at: T('launch raids'), x: W / 2, y: 140, font: F.title(64), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('From here, B-29'), T('Inside an air-conditioned'), 'engine', { gain: .18, f: 52 }]] });

  add(T('Inside an air-conditioned') - .1, 'assembly-hut', () => {
    const S = S2.assemblyHut();
    S.update = (lt) => camPath(S.camera, lt, [[0, [3.4, 1.9, 2.2], [0, 1.0, 0], 38], [8, [2.5, 1.5, 1.5], [0, 1.05, 0], 36]]);
    S.draw = (g, lt, t) => {
      const b = S.bomb; const nose = new THREE.Vector3(0, 0, 1.25).applyMatrix4(b.matrixWorld), tail = new THREE.Vector3(0, 0, -2.15).applyMatrix4(b.matrixWorld);
      const [x1, y1] = toScreen(S.camera, [nose.x, nose.y + .55, nose.z]), [x2, y2] = toScreen(S.camera, [tail.x, tail.y + .55, tail.z]);
      const k = clamp((t - T('10 feet long')) / .6);
      if (k > 0) { g.save(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.globalAlpha = k; const mx = lerp(x1, x2, .5), my = lerp(y1, y2, .5); g.beginPath(); g.moveTo(mx, my); g.lineTo(lerp(mx, x1, expoOut(k)), lerp(my, y1, expoOut(k))); g.moveTo(mx, my); g.lineTo(lerp(mx, x2, expoOut(k)), lerp(my, y2, expoOut(k))); g.stroke(); g.restore(); stamp(g, t - T('10 feet long'), '10 FT · 3 M', mx, my - 60, { font: F.title(56), color: '#fff', bg: 'rgba(0,0,0,.6)', pad: 20 }); }
      stamp(g, t - T('8,800 pounds'), '8,800 LB · 4 TONNES', W - 380, H - 240, { font: F.title(60), color: '#fff', bg: 'rgba(200,30,30,.9)', pad: 24 });
      reveal(g, 'ASSEMBLY BUILDING · TINIAN', 120, 110, clamp(lt / .7), { font: F.mono(28, 700), align: 'left', color: '#d8e0ea', dy: 0, dx: -20, track: 6 });
    };
    return S;
  }, { bed: [[T('Inside an air-conditioned'), T('Its name is'), 'hum', { gain: .06, f: 120 }]], sfx: [[T('10 feet long'), 'pop', {}], [T('8,800 pounds'), 'stamp', { gain: .4 }]] });

  add(T('Its name is') - .1, 'little-boy-name', () => {
    const S = S2.assemblyHut();
    S.update = (lt) => camPath(S.camera, lt, [[0, [1.6, 1.1, 1.6], [0, 1.1, 0], 34], [2, [1.2, 1.15, 1.3], [0, 1.1, 0], 30]]);
    S.draw = (g, lt, t) => stamp(g, t - T('Little Boy.'), 'LITTLE BOY', W / 2, H / 2, { font: F.title(200), color: '#fff', track: 30 });
    S.grade = { tint: [.95, 1, 1.06], bloom: .5, vignette: .7 };
    return S;
  }, { sfx: [[T('Little Boy.'), 'boom', { gain: .55 }]] });

  add(T('Meanwhile, crews') - .1, 'practice-drop', () => {
    const S = S2.skyFlight({ tod: 'day', name: '', tail: 'R', tailNum: '84', cloudY: -1400 }); const pl = S.plane; const pb = pumpkin(); S.scene.add(pb);
    const tdrop = T('dummy bombs') - (T('Meanwhile, crews') - .1);
    S.update = (lt) => { pl.position.set(0, 0, lt * 90); pl.userData.spin(lt); pl.userData.openDoors(clamp((lt - tdrop + 1.5) / 1)); const k = lt - tdrop; if (k < 0) { pb.position.set(0, -.6, lt * 90 + 3.2); pb.rotation.set(0, 0, 0); } else { pb.position.set(0, -.6 - 4.9 * k * k, lt * 90 + 3.2 - k * 12); pb.rotation.x = Math.min(1.2, k * .4); }
      look(S.camera, [32, -18, lt * 90 - 30], [0, -8 - Math.max(0, k) * 12, lt * 90]); };
    S.draw = (g, lt, t) => { lowerThird(g, t - T('509th'), '509TH COMPOSITE GROUP', 'the only unit trained to drop the bomb'); stamp(g, t - T('dummy bombs'), '"PUMPKIN" PRACTICE BOMB', W - 450, 160, { font: F.title(44), color: '#fff', bg: 'rgba(224,117,28,.92)', pad: 24 }); };
    return S;
  }, { bed: [[T('Meanwhile, crews'), T('and making a sharp'), 'engine', { gain: .12 }]], sfx: [[T('dummy bombs'), 'clunk', { gain: .4 }], [T('dummy bombs') + .2, 'whoosh', { gain: .2, up: false }]] });

  add(T('and making a sharp') - .1, 'escape-155', () => flat(null, (g, lt, t) => escapeTurn(g, lt, t, { turnAt: T('155 degree') - (T('and making a sharp') - .1) - .3 })),
    { sfx: [[T('155 degree'), 'whoosh', { gain: .25 }], [T('chance to escape'), 'pop', {}]] });

  // ── 24 hours before ───────────────────────────────────────────
  add(T('24 hours before') - .15, 'title-24h', () => titleCard({ big: '24 HOURS', small: 'BEFORE THE ATTACK', date: 'August 5, 1945', dateAt: T('August 5, 1945') }),
    { sfx: [[T('24 hours before') - .1, 'boom'], [T('August 5, 1945'), 'tick', { gain: .4 }]], bed: [[T('24 hours before'), T('Colonel Paul'), 'ticking', { gain: .14 }]] });

  add(T('Colonel Paul') - .1, 'nose-art', () => {
    const S = S3.noseArt(); const t0 = T('Colonel Paul') - .1;
    S.update = (lt, t) => { S.paint(clamp((t - T("his mother's name")) / (T('Enola Gay.') + .4 - T("his mother's name")))); camPath(S.camera, lt, [[0, [16, 2.8, -9], [10, 4.2, -1.5], 38], [3.5, [14.5, 3.4, -6.5], [10.2, 4.5, -1.5], 34], [5.8, [12.4, 4.4, -4.6], [10.2, 4.55, -1.5], 30]]); };
    S.draw = (g, lt, t) => { lowerThird(g, t - T('Colonel Paul'), 'COL. PAUL TIBBETS', 'commander · 509th Composite Group', { out: T("his mother's name") - T('Colonel Paul') + 1.2 }); stamp(g, t - T('Enola Gay.'), 'ENOLA GAY', W / 2, H - 230, { font: F.serif(110), color: '#fff' }); };
    return S;
  }, { sfx: [[T('Enola Gay.'), 'boom', { gain: .4, pitch: 1.3 }]], bed: [[T('Colonel Paul'), T('At the evening'), 'wind', { gain: .08 }]] });

  add(T('At the evening briefing') - .1, 'briefing', () => {
    const S = S2.briefing();
    S.update = (lt) => camPath(S.camera, lt, [[0, [4, 2.6, 5], [0, 1.6, -5], 40], [9, [2.4, 2.2, 2.6], [0, 1.9, -6.5], 36]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'EXTRAORDINARY DESTRUCTIVE POWER', at: T('extraordinary destructive'), x: W / 2, y: 140, font: F.title(60), color: '#fff', track: 10, shadow: ['#000', 24] }, { s: 'A WEAPON THAT COULD END THE WAR', at: T('a weapon that could'), x: W / 2, y: H - 230, font: F.title(56), color: '#ffcf8a', track: 8, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('At the evening briefing'), T('No one uses'), 'room', { gain: .06 }]] });

  add(T('No one uses') - .1, 'atomic-redacted', () => flat('paper', (g, lt, t) => {
    reveal(g, 'No one uses the word', W / 2, 330, clamp(lt / .6), { font: F.serif(56), color: '#333' });
    const w = measure(g, 'ATOMIC', F.sans(220, 800)); text(g, 'ATOMIC', W / 2, 560, { font: F.sans(220, 800), color: '#151515', alpha: clamp((lt - .3) / .4) });
    const k = clamp((t - TE('the word atomic') - .15) / .5); g.fillStyle = '#0b0b0b'; g.fillRect(W / 2 - w / 2 - 30, 470, (w + 60) * expoOut(k), 190);
    reveal(g, 'the tension is unmistakable', W / 2, 800, clamp((t - T('the tension')) / .6), { font: F.serif(52), color: PAL.red });
  }, { captions: false }), { sfx: [[TE('the word atomic') + .15, 'stamp', { gain: .45 }]] });

  add(T('Pilots receive cyanide') - .1, 'cyanide', () => {
    const S = stage({ sky: false, bg: '#050505', light: { sun: [2, 5, 3], sunCol: '#ffe2b8', sunI: 1.2, hemiI: .15, area: 1.5 } });
    const tb = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), M('#4a3a2a', { rough: .7 })); tb.rotation.x = -Math.PI / 2; tb.receiveShadow = true; S.scene.add(tb);
    const box = P.box(.14, .03, .09, M('#7a5a3a', { rough: .6 }), 0, .015, 0); S.scene.add(box);
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(.008, .02, 4, 8), M('#e8e2d2', { rough: .2, metal: .1 })); c.rotation.z = Math.PI / 2; c.position.set(-.03 + i * .03, .036, 0); S.scene.add(c); }
    const jacket = P.box(.6, .04, .5, M('#5c3b22', { rough: .65 }), .35, .02, -.1); jacket.rotation.y = .3; S.scene.add(jacket);
    const dog = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .003, 16), M('#c0c4c8', { metal: 1, rough: .3 })); dog.position.set(-.12, .003, .07); dog.scale.x = 1.6; S.scene.add(dog);
    const goggles = new THREE.Group(); for (const s of [-1, 1]) goggles.add(P.cyl(.035, .035, .025, M('#111', { rough: .2, metal: .4 }), s * .045, .02, 0)); goggles.position.set(.15, .03, .12); S.scene.add(goggles);
    S.update = (lt) => camPath(S.camera, lt, [[0, [.15, .32, .35], [0, .02, 0], 34], [4, [.08, .22, .22], [0, .02, 0], 30]]);
    S.draw = (g, lt, t) => side(g, lt, t, 'CYANIDE CAPSULES', 'in case they are captured', T('in case they'));
    S.grade = { tint: [1.04, 1, .92], vignette: .7, bloom: .4 };
    return S;
  }, { sfx: [[T('cyanide capsules'), 'clunk', { gain: .15 }]] });

  add(T('Around midnight') - .1, 'loading-pit', () => {
    const S = S2.loadingPit();
    S.update = (lt) => { const k = clamp(lt / 3.4); S.pit.userData.lift.position.y = lerp(-2.2, .1, easeInOut(k)); S.bomb.position.y = lerp(-1.6, .7, easeInOut(k)); camPath(S.camera, lt, [[0, [9, 3, 9], [0, .6, 0], 40], [4, [6.5, 2.2, 6.5], [0, 1.2, -.5], 40]]); };
    S.draw = (g, lt, t) => side(g, lt, t, 'AROUND MIDNIGHT', 'Little Boy is hoisted into the bomb bay');
    return S;
  }, { bed: [[T('Around midnight'), T('The heavily loaded'), 'wind', { gain: .08 }]], sfx: [[T('Around midnight') + .2, 'doors', { dur: 3, gain: .2 }]] });

  add(T('Navy Captain') - .1, 'parsons', () => {
    const S = S2.loadingPit(); S.bomb.position.y = .7; S.pit.userData.lift.position.y = .1;
    const pa = CAST.sailor(); pa.position.set(1.4, 0, 1.4); pa.rotation.y = -2.3; pa.pose({ armL: [.6, .2], elbowL: 1.2, head: [.2, 0, 0] }); S.scene.add(pa);
    S.update = (lt) => camPath(S.camera, lt, [[0, [3.4, 1.7, 3.6], [.6, 1.1, .4], 36], [7, [2.6, 1.6, 2.7], [.6, 1.2, .4], 32]]);
    S.draw = (g, lt, t) => { lowerThird(g, t - T('Navy Captain'), 'CAPT. WILLIAM "DEAK" PARSONS', "the mission's weapons officer"); kinetic(g, t, [{ s: 'ARM IT IN THE AIR', at: T('in the air'), x: W / 2, y: 140, font: F.title(64), color: '#ffcf8a', track: 12, shadow: ['#000', 24] }]); };
    return S;
  });

  add(T('The heavily loaded') - .1, 'night-takeoff', () => {
    const S = S2.tinian({ night: true, planes: 3 }); const p = S.fleet[0]; const y0 = p.position.y; p.userData.exhaust(true);
    const wreck = [[1300, y0, -5200, 18], [1200, y0, -5100, 12]]; const fi = fire(wreck, { per: 30, height: 3 }); S.scene.add(fi); S.particles.push(fi); const l = new THREE.PointLight('#ff6a20', 80000, 600, 2); l.position.set(1250, y0 + 30, -5150); S.scene.add(l);
    const rl = []; for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.8, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(i % 2 ? '#ffd27a' : '#7ab0ff').multiplyScalar(4) })); m.position.set(-1500 + i * 100, y0 + .5, -5230 + (i % 2) * 0); S.scene.add(m); const m2 = m.clone(); m2.position.z = -5170; S.scene.add(m2); }
    S.update = (lt) => { const x = -1300 + Math.pow(lt, 2) * 30; p.position.set(x, y0 + Math.max(0, lt - 4.6) ** 2 * 7, -5200); p.rotation.x = -Math.min(.12, Math.max(0, lt - 4.6) * .08); p.userData.spin(lt + 3); look(S.camera, [x - 70, y0 + 6, -5130], [x + 60, y0 + 4, -5200]); handheld(S.camera, lt, .02); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'A DANGEROUS TAKEOFF', at: T('dangerous takeoff'), x: W / 2, y: 140, font: F.title(64), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    S.grade = { tint: [.94, .98, 1.08], bloom: 1, bloomThreshold: .55 };
    return S;
  }, { bed: [[T('The heavily loaded'), T('One hour before'), 'engine', { gain: .2, f: 50 }]], sfx: [[T('accidental detonation'), 'heartbeat', { beats: 3, gain: .35 }]] });

  // ── 1 hour before ─────────────────────────────────────────────
  add(T('One hour before') - .15, 'title-1h', () => titleCard({ big: '1 HOUR', small: 'BEFORE THE ATTACK', date: 'August 6, 1945 · 7:15 a.m.', dateAt: T('One hour before') + .6 }),
    { sfx: [[T('One hour before') - .1, 'boom']], bed: [[T('One hour before'), T('The aircraft has been'), 'ticking', { gain: .16 }]] });

  add(T('The aircraft has been') - .1, 'enola-dawn', () => {
    const S = S2.skyFlight({ tod: 'dawn' }); const p = S.plane;
    S.update = (lt) => { p.position.set(0, 0, lt * 90); p.userData.spin(lt); p.rotation.z = Math.sin(lt * .5) * .03; look(S.camera, [-30, 6 + lt * .4, lt * 90 + 34], [0, 0, lt * 90]); };
    S.draw = (g, lt, t) => side(g, lt, t, 'ENOLA GAY', 'airborne for several hours', T('several hours'));
    return S;
  }, { bed: [[T('The aircraft has been'), T('Parsons has climbed'), 'engine', { gain: .16 }]] });

  add(T('Parsons has climbed') - .1, 'bomb-bay', () => {
    const S = S3.bombBay();
    S.update = (lt) => { camPath(S.camera, lt, [[0, [-.9, .5, 2.2], [0, 0, 0], 50], [5, [-.7, .35, 1.4], [.2, 0, -.5], 46]]); S.torch.target.position.set(Math.sin(lt * 1.5) * .2, 0, -1 + Math.sin(lt) * .3); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'PROPELLANT CHARGES', at: T('propellant charges'), x: W / 2, y: 140, font: F.title(64), color: '#cfe0ff', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { bed: [[T('Parsons has climbed'), T('The bomb is armed'), 'engine', { gain: .12, inside: true }]], sfx: [[T('inserted the'), 'clunk', { gain: .2 }], [T('propellant charges') + .5, 'clunk', { gain: .2 }]] });

  add(T('designed to drive') - .1, 'gun-type', () => flat(null, (g, lt, t) => gunType(g, lt, t, { fireAt: T('into another') - (T('designed to drive') - .1) - .2 })),
    { sfx: [[T('into another') - .2, 'clunk', { gain: .4 }], [T('into another') + .3, 'boom', { gain: .5 }], [T('starting the chain'), 'riser', { dur: 1.5, gain: .2 }]] });

  add(T('The bomb is armed') - .1, 'armed', () => {
    const S = S3.bombBay(); const red = new THREE.PointLight('#ff2a1a', 0, 6, 2); red.position.set(-.5, .6, -.5); S.scene.add(red);
    S.update = (lt) => { red.intensity = (Math.sin(lt * 10) > 0 ? 8 : 1); camPath(S.camera, lt, [[0, [.6, .35, 1.2], [0, 0, 0], 40], [2, [.45, .3, .9], [0, 0, 0], 36]]); };
    S.draw = (g, lt, t) => stamp(g, t - T('The bomb is armed'), 'ARMED', W / 2, H / 2, { font: F.title(240), color: '#fff', bg: 'rgba(200,20,20,.88)', pad: 50, track: 30 });
    return S;
  }, { sfx: [[T('The bomb is armed'), 'stamp', { gain: .6 }], [T('The bomb is armed') + .05, 'boom', { gain: .4 }]] });

  add(T('The plane approaches') - .1, 'approach-map', () => flat('ink', (g, lt, t) => {
    const p = mapCam(lt, [[0, [138, 26], 900], [6, [134, 31], 1300]]); drawMap(g, p, { theme: 'ink', highlight: { japan: '#30373a' } });
    route(g, p, [LL.tinian, LL.iwojima, [136.2, 33.6], LL.hiroshima], clamp(lt / 5.5) * .92, { color: PAL.amber });
    const wk = clamp((t - T('Weather reconnaissance')) / 2.5);
    for (const [ll, n] of [[LL.hiroshima, 'HIROSHIMA'], [LL.kokura, 'KOKURA'], [LL.nagasaki, 'NAGASAKI']]) { route(g, p, [LL.iwojima, ll], wk, { color: '#7ad0ff', width: 2, dash: [6, 8] }); marker(g, p, ll, n, clamp((wk - .7) / .3), { side: 1, font: F.title(30), color: '#7ad0ff' }); }
    reveal(g, 'WEATHER PLANES SCOUT THE TARGETS', 120, 110, clamp((t - T('Weather reconnaissance')) / .6), { font: F.mono(28, 700), align: 'left', color: '#7ad0ff', dy: 0, dx: -20, track: 4 });
  }), { sfx: [[T('Weather reconnaissance'), 'data', { gain: .08 }], [T('check conditions'), 'morse', { gain: .08 }]] });

  add(T('Meanwhile, Hiroshima wakes') - .1, 'hiroshima-morning', () => {
    const S = S3.street({ people: 24, seed: 3 });
    S.update = (lt) => camPath(S.camera, lt, [[0, [0, 30, 40], [0, 2, -60], 45], [3, [3, 6, 20], [0, 3, -60], 42], [7, [2.5, 1.7, 10], [0, 2, -40], 40]]);
    S.draw = (g, lt, t) => { side(g, lt, t, 'HIROSHIMA', 'an ordinary hot summer morning', T('ordinary hot')); clockFace(g, W - 200, 200, 110, 7, 30 + lt * .5, (lt * 6) % 60, { k: clamp((lt - .5) / .5) }); };
    return S;
  }, { bed: [[T('Meanwhile, Hiroshima wakes'), T('None of them'), 'city', { gain: .07 }]] });

  add(T('The streets are crowded') - .1, 'crowded-street', () => {
    const S = S3.street({ people: 40, seed: 7 });
    S.update = (lt) => camPath(S.camera, lt, [[0, [-4, 1.2, 0], [2, 1.5, -30], 40], [2, [-3.4, 1.3, -3], [2, 1.5, -34], 40]]);
    return S;
  });

  add(T('Thousands of teenage') - .1, 'students', () => {
    const S = S3.students();
    S.update = (lt) => camPath(S.camera, lt, [[0, [9, 3, 9], [0, 2, -3], 40], [7, [6, 2.2, 7.5], [0, 2.2, -4], 38]]);
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'THOUSANDS OF STUDENTS', at: T('Thousands of teenage'), x: W / 2, y: 130, font: F.title(64), color: '#fff', track: 12, shadow: ['#000', 24] }, { s: 'FIRE BREAKS', at: T('fire breaks'), x: W / 2, y: H - 220, font: F.title(60), color: '#ffcf8a', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { sfx: [[T('tear down') + .4, 'clunk', { gain: .3 }], [T('tear down') + 1.4, 'clunk', { gain: .25 }], [T('fire breaks'), 'rumble', { dur: 2, gain: .3 }]] });

  add(T('None of them is looking') - .1, 'nobody-looks-up', () => {
    const S = S3.street({ people: 30, seed: 9 }); const pl = b29({ name: '', tail: '', tailNum: '' }); pl.scale.setScalar(1); S.scene.add(pl);
    S.update = (lt) => { camPath(S.camera, lt, [[0, [0, 2, 5], [0, 2, -40], 40], [1.8, [0, 1.5, 5], [0, 60, -40], 50]]); pl.position.set(-400 + lt * 120, 9400, -9000); };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'NONE OF THEM IS LOOKING UP', at: T('None of them is looking'), x: W / 2, y: H - 200, font: F.title(64), color: '#fff', track: 12, shadow: ['#000', 24] }]);
    return S;
  });

  add(T('An air raid warning') - .1, 'all-clear', () => {
    const S = S3.street({ people: 18, seed: 13 });
    const siren = new THREE.Group(); siren.add(P.cyl(.1, .12, 10, M('#3a3a3a'), 0, 5, 0)); for (let i = 0; i < 2; i++) { const horn = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.2, 16, 1, true), M('#8a8f94', { metal: .6, rough: .4, side: THREE.DoubleSide })); horn.rotation.z = i ? -Math.PI / 2 : Math.PI / 2; horn.position.set(i ? .8 : -.8, 10.4, 0); siren.add(horn); } siren.add(P.cyl(.35, .35, .6, M('#6a6f74', { metal: .6, rough: .4 }), 0, 10.4, 0)); siren.position.set(-8, 7, -14); S.scene.add(siren);
    S.update = (lt) => camPath(S.camera, lt, [[0, [-4, 14, -2], [-8, 17, -14], 40], [4, [-2.5, 13, 0], [-8, 17, -14], 36]]);
    S.draw = (g, lt, t) => stamp(g, t - T('already been lifted'), 'ALL CLEAR', W / 2, H - 260, { font: F.title(110), color: '#fff', bg: 'rgba(30,120,60,.9)', pad: 40, track: 20 });
    return S;
  }, { sfx: [[T('An air raid warning'), 'siren', { dur: T('already been lifted') - T('An air raid warning') + .8, gain: .14 }], [T('already been lifted'), 'ding', { gain: .15, f: 880 }]] });

  add(T("The weather plane's") - .1, 'straight-flush-msg', () => flat(null, (g, lt, t) => {
    g.fillStyle = '#05080a'; g.fillRect(0, 0, W, H); scanlines(g, .2);
    reveal(g, 'STRAIGHT FLUSH  →  ENOLA GAY', 200, 260, clamp((t - T('straight flush')) / .6), { font: F.mono(40, 700), align: 'left', color: '#7ad0ff', dy: 0, dx: -20, track: 4 });
    const a = T('Clear skies'), b = T('Visibility is'); typeText(g, 'CLEAR SKIES OVER HIROSHIMA.', 200, 450, clamp((t - a) / (b - a - .1)), { font: F.mono(64, 700), color: '#e8f4ff' });
    typeText(g, 'VISIBILITY IS EXCELLENT.', 200, 560, clamp((t - b) / 1.2), { font: F.mono(64, 700), color: '#e8f4ff' });
    reveal(g, 'ADVICE: BOMB PRIMARY', 200, 720, clamp((t - b - 1.3) / .5), { font: F.mono(44, 700), align: 'left', color: PAL.red, dy: 0, dx: -20, track: 6 });
    vignette(g, .6); grain(g, t, .9);
  }), { sfx: [[T('straight flush'), 'morse', { pattern: '-.-. .-.. . .- .-. ... -.- .. . ...', gain: .1 }], [T('Clear skies'), 'typing', { dur: 1.6, gain: .15 }], [T('Visibility is'), 'typing', { dur: 1.2, gain: .15 }]], bed: [[T("The weather plane's"), T('At 8.14'), 'static', { gain: .05 }]] });

  add(T('At 8.14') - .1, 'final-approach', () => {
    const S = S2.skyFlight({ tod: 'morning', cloudY: -3000 }); const p = S.plane;
    S.update = (lt) => { p.position.set(0, 0, lt * 95); p.userData.spin(lt); look(S.camera, [26, -9, lt * 95 + 46], [0, 0, lt * 95]); };
    S.draw = (g, lt, t) => { clockFace(g, 230, 240, 130, 8, 14, (lt * 8) % 60, { k: clamp((t - T('At 8.14')) / .4) }); altimeter(g, W - 330, 260, 520, count31(t), 35000, { k: clamp((t - T('31,000 feet')) / .4), marks: [[31000, '31,000 FT']] }); };
    return S;
  }, { bed: [[T('At 8.14'), T('Through his bombsite'), 'engine', { gain: .15 }]], sfx: [[T('At 8.14'), 'tick', { gain: .4 }], [T('31,000 feet'), 'data', { gain: .07 }]] });
  const count31 = (t) => lerp(0, 31060, expoOut((t - T('31,000 feet')) / 1));

  add(T('The city lies clearly') - .1, 'city-below', () => {
    const S = aerialCity({ tod: 'morning' });
    S.update = (lt) => { look(S.camera, [lerp(-1200, -700, lt / 2.5), 9400, lerp(1600, 1000, lt / 2.5)], [-200, 0, -100]); S.camera.fov = lerp(32, 26, lt / 2.5); };
    return S;
  });

  add(T('Through his bombsite') - .1, 'bombsight', () => {
    const S = aerialCity({ tod: 'morning' }); const t0 = T('Through his bombsite') - .1; const tb = T('T-shaped') - t0;
    S.update = (lt) => { const z = lerp(28, 6, easeInOut(clamp(lt / (tb + 1)))); look(S.camera, [-300 + 2, 9400, -150 + 3], [-300, 0, -150]); S.camera.fov = z; };
    S.draw = (g, lt, t) => {
      g.save(); g.strokeStyle = 'rgba(255,60,40,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(W / 2, H / 2, 300, 0, 7); g.stroke(); g.beginPath(); g.moveTo(W / 2 - 520, H / 2); g.lineTo(W / 2 - 40, H / 2); g.moveTo(W / 2 + 40, H / 2); g.lineTo(W / 2 + 520, H / 2); g.moveTo(W / 2, H / 2 - 420); g.lineTo(W / 2, H / 2 - 40); g.moveTo(W / 2, H / 2 + 40); g.lineTo(W / 2, H / 2 + 420); g.stroke();
      for (let i = -5; i <= 5; i++) { if (!i) continue; g.beginPath(); g.moveTo(W / 2 + i * 50, H / 2 - 10); g.lineTo(W / 2 + i * 50, H / 2 + 10); g.moveTo(W / 2 - 10, H / 2 + i * 50); g.lineTo(W / 2 + 10, H / 2 + i * 50); g.stroke(); }
      g.restore();
      const out = (rr) => { g.save(); g.fillStyle = 'rgba(0,0,0,.88)'; g.beginPath(); g.rect(0, 0, W, H); g.moveTo(W / 2 + rr, H / 2); g.arc(W / 2, H / 2, rr, 0, Math.PI * 2, true); g.fill('evenodd'); g.restore(); }; out(500);
      lowerThird(g, t - T('bombardier Thomas'), 'MAJ. THOMAS FEREBEE', 'bombardier', { y: 950 });
      const k = clamp((t - T('T-shaped')) / .5); if (k > 0) { g.save(); g.strokeStyle = '#ffcf6a'; g.lineWidth = 5; g.shadowColor = '#ffcf6a'; g.shadowBlur = 20; g.globalAlpha = k; const s = 1; g.beginPath(); g.moveTo(W / 2 - 170, H / 2 - 10); g.lineTo(W / 2 + 170, H / 2 - 10); g.moveTo(W / 2, H / 2 - 10); g.lineTo(W / 2, H / 2 + 60); g.stroke(); g.restore(); text(g, 'AIOI BRIDGE', W / 2 + 200, H / 2 - 60, { font: F.title(48), color: '#ffcf6a', align: 'left', alpha: k, track: 6 }); }
    };
    S.grade = { sat: .6, tint: [.95, 1.05, .95], contrast: 1.2, grain: .09 };
    return S;
  }, { bed: [[T('Through his bombsite'), T('The bomb bay doors'), 'engine', { gain: .1, inside: true }]], sfx: [[T('T-shaped'), 'pop', { gain: .25, f: 900 }]] });

  add(T('The bomb bay doors') - .1, 'doors-open', () => {
    const S = S2.skyFlight({ tod: 'morning', cloudY: -3000, bombVisible: true }); const p = S.plane; const t0 = T('The bomb bay doors') - .1;
    S.update = (lt) => { p.position.set(0, 0, lt * 95); p.userData.spin(lt); p.userData.openDoors(clamp((lt - .6) / 1.6)); look(S.camera, [6, -7, lt * 95 + 8], [0, -.6, lt * 95 + 3]); shake(S.camera, lt, .05); };
    return S;
  }, { sfx: [[T('rumble open') - .2, 'doors', { dur: 1.8, gain: .35 }]] });

  add(T('The crew puts on') - .1, 'goggles', () => {
    const S = S3.cockpit(); const t0 = T('The crew puts on') - .1; const tg = T('dark protective') - t0;
    S.update = (lt) => { camPath(S.camera, lt, [[0, [0, 1.35, 1.2], [0, 1.1, -3], 50], [3.6, [0, 1.3, .9], [0, 1.1, -3], 46]]); };
    S.grade = (lt) => { const k = clamp((lt - tg) / .5); return { exposure: lerp(1, .32, k), tint: [lerp(1, .7, k), lerp(1, 1.05, k), lerp(1, .6, k)], sat: lerp(1.05, .5, k), vignette: lerp(.6, .85, k), bloom: .6 }; };
    S.draw = (g, lt, t) => kinetic(g, t, [{ s: 'DARK PROTECTIVE GOGGLES', at: T('dark protective'), x: W / 2, y: H - 220, font: F.title(60), color: '#d8ffd0', track: 12, shadow: ['#000', 24] }]);
    return S;
  }, { sfx: [[T('The crew puts on'), 'heartbeat', { beats: 4, bpm: 70, gain: .45 }]] });
}
