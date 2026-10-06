// Shared shot builders: title cards, 3D stage setup, camera helpers.
import * as THREE from 'three';
import { sky, lights, envFromSky } from '../kit/env.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
let ROOM_ENV = null;
import { clamp, easeOut, expoOut, smooth, noise1, lerp, keys, easeInOut } from '../core/math.js';
import { text, reveal, grain, measure, F, PAL, W, H, vignette } from '../2d/draw.js';

let ENGINE = null; export const setEngine = (e) => (ENGINE = e);

// ---------- black title cards: "6 YEARS BEFORE THE ATTACK" ----------
export function titleCard({ big, small = '', date = '', dateAt = null, sub = '', accent = PAL.red, captions = false }) {
  return {
    captions,
    grade: { bloom: 0 },
    draw(g, lt, t, dur) {
      g.fillStyle = '#030303'; g.fillRect(0, 0, W, H);
      const out = 1 - clamp((dur - lt) / .25);
      const push = 1 + lt * .012; g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
      g.globalAlpha = 1 - out;
      const hasSmall = !!small; const y0 = hasSmall ? H / 2 - 60 : H / 2 - 10;
      reveal(g, big, W / 2, y0, clamp(lt / .7), { font: F.title(big.length > 14 ? 130 : 190), track: 16, dy: 60, color: '#f4efe6', stagger: .6 });
      if (hasSmall) reveal(g, small, W / 2, y0 + 128, clamp((lt - .25) / .7), { font: F.title(46, 500), track: 22, dy: 26, color: '#a9a296' });
      const lw = 520 * expoOut((lt - .35) / .8); g.fillStyle = accent; g.fillRect(W / 2 - lw / 2, y0 + (hasSmall ? 182 : 120), lw, 3);
      if (date) {
        const da = dateAt != null ? dateAt : 0; const p = clamp((t - da + .05) / .6);
        reveal(g, date, W / 2, y0 + (hasSmall ? 250 : 190), p, { font: F.serif(58), dy: 20, color: PAL.amber, stagger: .4 });
      }
      if (sub) text(g, sub, W / 2, y0 + 320, { font: F.mono(26), color: '#8a857c', track: 6, alpha: clamp((lt - .8) / .5) });
      g.restore();
      vignette(g, .6); grain(g, t, .9);
    },
  };
}

// ---------- 3D stage ----------
export function stage({ sky: skyOpt = {}, light = {}, fov = 40, near = .1, far = 6000, env = 1, bg = null } = {}) {
  const scene = new THREE.Scene();
  const s = skyOpt === false ? null : sky(scene, skyOpt);
  if (bg) scene.background = new THREE.Color(bg);
  const L = light === false ? null : lights(scene, light);
  if (s && env && ENGINE) envFromSky(ENGINE.renderer, scene, s, env);
  if (!s && env && ENGINE) { // studio reflections for interiors so metals never go black
    if (!ROOM_ENV) { const pm = new THREE.PMREMGenerator(ENGINE.renderer); ROOM_ENV = pm.fromScene(new RoomEnvironment(), .04).texture; ROOM_ENV.userData.keep = true; pm.dispose(); }
    scene.environment = ROOM_ENV; scene.environmentIntensity = .3 * env;
  }
  const camera = new THREE.PerspectiveCamera(fov, W / H, near, far);
  return { scene, camera, sky: s, L, particles: [] };
}
export function look(cam, p, tgt, roll = 0) {
  cam.position.set(p[0], p[1], p[2]); cam.up.set(0, 1, 0); cam.lookAt(tgt[0], tgt[1], tgt[2]);
  if (roll) cam.rotateZ(roll);
}
// interpolate camera along keyframes [[t,[px,py,pz],[tx,ty,tz], fov?], ...]
export function camPath(cam, lt, kf, ease = easeInOut) {
  const P = keys(lt, kf.map((k) => [k[0], k[1]]), ease), Tg = keys(lt, kf.map((k) => [k[0], k[2]]), ease);
  look(cam, P, Tg);
  if (kf[0][3]) { cam.fov = keys(lt, kf.map((k) => [k[0], k[3] || kf[0][3]]), ease); }
}
export function shake(cam, t, amt, freq = 18) {
  if (amt <= 0) return;
  cam.position.x += (noise1(t * freq) - .5) * amt; cam.position.y += (noise1(t * freq + 50) - .5) * amt;
  cam.rotation.z += (noise1(t * freq + 99) - .5) * amt * .02;
}
// handheld micro-motion (keeps 3D alive)
export function handheld(cam, t, amt = .02) {
  cam.rotation.x += (noise1(t * .7 + 3) - .5) * amt; cam.rotation.y += (noise1(t * .6 + 9) - .5) * amt;
}
const v3 = new THREE.Vector3();
export function toScreen(cam, p) { v3.set(p[0], p[1], p[2]).project(cam); return [(v3.x * .5 + .5) * W, (-v3.y * .5 + .5) * H, v3.z < 1]; }

// pin label anchored to a 3D point
export function pin3D(g, cam, p, label, lt, { sub = '', color = PAL.red, dy = -120, side = 1, out = 99 } = {}) {
  const [x, y, vis] = toScreen(cam, p); if (!vis) return;
  const a = clamp(lt / .3) * (1 - clamp((lt - out) / .3)); if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.strokeStyle = '#fff'; g.lineWidth = 2;
  const len = expoOut(lt / .5);
  g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fillStyle = color; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + side * 40 * len, y + dy * len); g.lineTo(x + side * (40 + 30) * len, y + dy * len); g.stroke();
  const lx = x + side * 80, ly = y + dy;
  text(g, label, lx, ly - 4, { font: F.title(44), align: side > 0 ? 'left' : 'right', track: 3, shadow: ['rgba(0,0,0,.8)', 14], alpha: clamp((lt - .2) / .3) });
  if (sub) text(g, sub, lx, ly + 36, { font: F.serif(26), align: side > 0 ? 'left' : 'right', color: '#f0dcc0', shadow: ['rgba(0,0,0,.8)', 10], alpha: clamp((lt - .35) / .3) });
  g.restore();
}
export { THREE };
