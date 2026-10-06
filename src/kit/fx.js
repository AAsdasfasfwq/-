// Stateless particle systems (a pure function of time => perfect for frame-by-frame rendering).
import * as THREE from 'three';
import * as TX from '../core/textures.js';
import { rng, clamp, lerp, smooth, fbm, noise1 } from '../core/math.js';

const vs = `
attribute vec3 iPos; attribute float iSize; attribute vec4 iCol; attribute float iRot;
varying vec2 vUv; varying vec4 vCol; varying float vFog;
void main(){
  vUv = uv; vCol = iCol;
  vec4 mv = modelViewMatrix * vec4(iPos, 1.);
  float c = cos(iRot), s = sin(iRot);
  vec2 p = mat2(c, s, -s, c) * position.xy;
  mv.xy += p * iSize;
  vFog = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const fs = `
uniform sampler2D map; uniform vec3 fogColor; uniform float fogNear, fogFar, useFog, shade, emissive;
varying vec2 vUv; varying vec4 vCol; varying float vFog;
void main(){
  vec4 t = texture2D(map, vUv);
  float a = t.a * vCol.a; if (a < .003) discard;
  vec3 col = vCol.rgb * mix(1., t.r * 1.25, shade) * mix(1. - shade*.25, 1., vUv.y);
  col *= 1. + emissive;
  if (useFog > .5) col = mix(col, fogColor, smoothstep(fogNear, fogFar, vFog));
  gl_FragColor = vec4(col, a);
}`;

export class Particles extends THREE.Mesh {
  constructor(n, { map = TX.cloudSprite(1), additive = false, shade = 1, emissive = 0, sort = !additive, depthTest = true } = {}) {
    const g = new THREE.InstancedBufferGeometry(); const q = new THREE.PlaneGeometry(1, 1);
    g.index = q.index; g.attributes.position = q.attributes.position; g.attributes.uv = q.attributes.uv;
    g.instanceCount = n;
    const mk = (k, s) => { const a = new THREE.InstancedBufferAttribute(new Float32Array(n * s), s); a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(k, a); return a; };
    const mat = new THREE.ShaderMaterial({
      vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, depthTest,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { map: { value: map }, fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 }, useFog: { value: 0 }, shade: { value: shade }, emissive: { value: emissive } },
    });
    super(g, mat);
    this.n = n; this.frustumCulled = false; this.sort = sort;
    this.A = { pos: mk('iPos', 3), size: mk('iSize', 1), col: mk('iCol', 4), rot: mk('iRot', 1) };
    this.tmp = []; for (let i = 0; i < n; i++) this.tmp.push({ x: 0, y: 0, z: 0, s: 1, r: 1, g: 1, b: 1, a: 1, rot: 0, d: 0 });
    this.fn = null; this.renderOrder = 5;
  }
  update(t, camera, scene) {
    if (!this.fn) return;
    const P = this.tmp; const v = new THREE.Vector3(); const cp = camera.position;
    this.updateMatrixWorld();
    for (let i = 0; i < this.n; i++) { const o = P[i]; o.a = 1; o.rot = 0; this.fn(i, t, o); v.set(o.x, o.y, o.z).applyMatrix4(this.matrixWorld); o.d = v.distanceToSquared(cp); }
    const order = this.sort ? [...P.keys()].sort((a, b) => P[b].d - P[a].d) : null;
    const { pos, size, col, rot } = this.A;
    for (let k = 0; k < this.n; k++) {
      const o = P[order ? order[k] : k];
      pos.array[k * 3] = o.x; pos.array[k * 3 + 1] = o.y; pos.array[k * 3 + 2] = o.z;
      size.array[k] = o.a > 0 ? o.s : 0; rot.array[k] = o.rot;
      col.array[k * 4] = o.r; col.array[k * 4 + 1] = o.g; col.array[k * 4 + 2] = o.b; col.array[k * 4 + 3] = clamp(o.a);
    }
    pos.needsUpdate = size.needsUpdate = col.needsUpdate = rot.needsUpdate = true;
    const f = scene && scene.fog; const u = this.material.uniforms;
    if (f && f.isFog) { u.useFog.value = 1; u.fogColor.value.copy(f.color); u.fogNear.value = f.near; u.fogFar.value = f.far; } else u.useFog.value = 0;
  }
}

const setC = (o, c, a = 1) => { o.r = c.r; o.g = c.g; o.b = c.b; o.a = a; };
const tmpC = new THREE.Color();
const mixC = (a, b, t) => tmpC.copy(a).lerp(b, clamp(t));

// --- fire field: emitters = [[x,y,z,scale], ...]
export function fire(emitters, { per = 14, rate = .9, seed = 1, height = 3, colA = '#fff2b0', colB = '#ff6a10', colC = '#7a1200', intensity = 2.2, start = () => 0 } = {}) {
  const n = emitters.length * per; const p = new Particles(n, { map: TX.flameSprite(), additive: true, shade: 0, emissive: 0 });
  const r = rng(seed); const S = []; for (let i = 0; i < n; i++) S.push([r(), r(), r(), r()]);
  const A = new THREE.Color(colA), B = new THREE.Color(colB), Cc = new THREE.Color(colC);
  p.fn = (i, t, o) => {
    const e = emitters[Math.floor(i / per)]; const s = S[i]; const sc = e[3] ?? 1;
    const st = typeof start === 'function' ? start(e, i) : start; if (t < st) { o.a = 0; return; }
    const grow = clamp((t - st) / 1.5);
    const ph = (t * rate * (0.8 + s[0] * .5) + s[1]) % 1;
    o.x = e[0] + (s[2] - .5) * sc * .9 + Math.sin(t * 3 + s[3] * 9) * .15 * sc * ph;
    o.z = e[2] + (s[3] - .5) * sc * .9;
    o.y = e[1] + ph * height * sc * grow;
    o.s = sc * (1.6 - ph * 1.1) * grow; o.rot = (s[0] - .5) * .6;
    const c = ph < .3 ? mixC(A, B, ph / .3) : mixC(B, Cc, (ph - .3) / .7);
    setC(o, c, (1 - ph) * intensity * Math.min(1, ph * 8));
  };
  return p;
}

// --- smoke columns: sources = [[x,y,z,scale], ...]
export function smoke(sources, { per = 24, rate = .12, seed = 2, rise = 30, spread = 8, col = '#2b2724', col2 = '#6d625a', alpha = .55, drift = [4, 0], start = 0 } = {}) {
  const n = sources.length * per; const p = new Particles(n, { map: TX.cloudSprite(2), shade: 1 });
  const r = rng(seed); const S = []; for (let i = 0; i < n; i++) S.push([r(), r(), r(), r(), r()]);
  const A = new THREE.Color(col), B = new THREE.Color(col2);
  p.fn = (i, t, o) => {
    const e = sources[Math.floor(i / per)]; const s = S[i]; const sc = e[3] ?? 1;
    const tt = t - start; if (tt < 0) { o.a = 0; return; }
    const ph = (tt * rate * (.7 + s[0] * .6) + s[1]) % 1; const born = clamp(tt * rate * 3);
    o.y = e[1] + ph * rise * sc; const sp = ph * spread * sc;
    o.x = e[0] + (s[2] - .5) * sp + drift[0] * ph * sc; o.z = e[2] + (s[3] - .5) * sp + drift[1] * ph * sc;
    o.s = sc * (2 + ph * spread * 1.4); o.rot = s[4] * 6 + tt * .1 * (s[0] - .5);
    setC(o, mixC(A, B, ph), alpha * Math.min(1, ph * 6) * (1 - ph) ** .7 * born);
  };
  return p;
}

// --- floating embers / ash / dust within a box
export function motes(n, { box = [40, 20, 40], center = [0, 0, 0], col = '#ffb050', size = .15, speed = [0, .8, 0], additive = true, seed = 3, alpha = 1, flicker = true, map = null } = {}) {
  const p = new Particles(n, { map: map || TX.softDot(), additive, shade: 0 });
  const r = rng(seed); const S = []; for (let i = 0; i < n; i++) S.push([r(), r(), r(), r(), r()]);
  const C = new THREE.Color(col);
  p.fn = (i, t, o) => {
    const s = S[i]; const w = (v, L) => ((v % L) + L) % L - L / 2;
    o.x = center[0] + w(s[0] * box[0] + speed[0] * t * (.6 + s[3]) + Math.sin(t + s[4] * 9) * .5, box[0]);
    o.y = center[1] + w(s[1] * box[1] + speed[1] * t * (.6 + s[3]), box[1]);
    o.z = center[2] + w(s[2] * box[2] + speed[2] * t * (.6 + s[3]), box[2]);
    o.s = size * (.5 + s[4]);
    setC(o, C, alpha * (flicker ? .5 + .5 * Math.sin(t * 6 + s[3] * 30) : 1));
  };
  return p;
}

// --- rain streaks (falling along -y), camera-facing (approx)
export function rain(n, { box = [60, 40, 60], center = [0, 20, 0], col = '#20201f', speed = 22, len = 1.6, alpha = .6, seed = 4, additive = false } = {}) {
  const p = new Particles(n, { map: TX.streakSprite(), additive, shade: 0, sort: false });
  const r = rng(seed); const S = []; for (let i = 0; i < n; i++) S.push([r(), r(), r(), r()]);
  const C = new THREE.Color(col);
  p.fn = (i, t, o) => {
    const s = S[i];
    o.x = center[0] + (s[0] - .5) * box[0]; o.z = center[2] + (s[2] - .5) * box[2];
    o.y = center[1] + box[1] / 2 - (((s[1] * box[1] + t * speed * (.8 + s[3] * .4)) % box[1]));
    o.s = len; setC(o, C, alpha);
  };
  return p;
}

// --- cloud layer (big soft sprites around a plane at height y)
export function cloudLayer(n, { area = 1200, y = 0, thick = 40, size = [60, 140], col = '#ffffff', shadow = '#8f9bb0', alpha = .9, seed = 5, drift = [0, 0], holes = 0 } = {}) {
  const p = new Particles(n, { map: TX.cloudSprite(3), shade: 1 });
  const r = rng(seed); const S = []; for (let i = 0; i < n; i++) S.push([r(), r(), r(), r()]);
  const A = new THREE.Color(col), B = new THREE.Color(shadow);
  p.fn = (i, t, o) => {
    const s = S[i]; const w = (v) => ((v % area) + area) % area - area / 2;
    o.x = w(s[0] * area + drift[0] * t); o.z = w(s[1] * area + drift[1] * t); o.y = y + (s[2] - .5) * thick;
    o.s = lerp(size[0], size[1], s[3]); o.rot = s[0] * 6;
    const hole = holes ? clamp((Math.hypot(o.x, o.z) - holes) / (holes * .3 + 1)) : 1;
    setC(o, mixC(B, A, s[2]), alpha * hole);
  };
  return p;
}

// --- mushroom cloud. params: H max height, tau rise time, colors by stage.
export function mushroom({ n = 1400, H = 120, tau = 6, seed = 7, hot = '#fff1c9', fire = '#ff7a1a', dark = '#5a4a52', light = '#b8a8b0', glow = '#ff5a10', base = '#9a7a60', dust = true } = {}) {
  const p = new Particles(n, { map: TX.cloudSprite(4), shade: 1 });
  const r = rng(seed); const S = []; for (let i = 0; i < n; i++) S.push([r(), r(), r(), r(), r(), r()]);
  const Hot = new THREE.Color(hot), Fi = new THREE.Color(fire), Dk = new THREE.Color(dark), Lt = new THREE.Color(light), Gl = new THREE.Color(glow), Ba = new THREE.Color(base);
  p.fn = (i, t, o) => {
    if (t < 0) { o.a = 0; return; }
    const s = S[i]; const k = s[0];
    const hgt = H * (1 - Math.exp(-t / tau)) + H * .02 * t / tau; // keeps creeping upward
    const cool = clamp(t / (tau * .9)); // 0 hot -> 1 smoke
    if (k < .55) { // cap: rolling torus
      const th = s[1] * Math.PI * 2, ph = s[2] * Math.PI * 2 + t * (1.2 / (1 + t * .15));
      const R = hgt * (.22 + .08 * cool) + 2, rr = hgt * (.16 + .03 * s[3]) + 1.5;
      const rad = R + rr * Math.cos(ph) * .9;
      o.x = Math.cos(th) * rad; o.z = Math.sin(th) * rad; o.y = hgt + rr * Math.sin(ph) * .75 + (s[4] - .5) * rr * .3;
      o.s = rr * (.6 + s[5] * 1.1) * (.6 + .4 * clamp(t));
      const inner = clamp(.5 - .5 * Math.sin(ph)); // underside glows
      const base = mixC(Dk, Lt, .3 + .7 * clamp(Math.sin(ph) * .5 + .5 + (s[3] - .5) * .4)).clone();
      const hotc = mixC(Hot, Fi, clamp(t / (tau * .25))).clone();
      const c = hotc.lerp(base, cool); c.lerp(Gl, inner * clamp(1 - cool * .85) * .55);
      setC(o, c, .95); o.rot = s[5] * 6 + t * .05;
    } else if (k < .85) { // stem
      const u = s[1]; const sw = t * .8 + s[2] * 6.28;
      const rad = (hgt * .05 + 1.2) * (1 + u * .9) * (.4 + s[3] * .7);
      o.x = Math.cos(sw) * rad; o.z = Math.sin(sw) * rad; o.y = u * hgt * .92;
      o.s = (hgt * .06 + 1.5) * (1 + u * .7) * (.8 + s[4] * .6);
      const c = mixC(Hot, Fi, clamp(t / (tau * .2))).clone().lerp(mixC(Ba, Dk, u).clone(), clamp(cool * 1.2));
      c.lerp(Gl, clamp(1 - u * 2) * clamp(1 - cool) * .5);
      setC(o, c, clamp(t * 3 - u * 2) * .9); o.rot = s[5] * 6;
    } else { // base surge / dust skirt
      if (!dust) { o.a = 0; return; }
      const th = s[1] * Math.PI * 2; const rad = (H * .9) * (1 - Math.exp(-t / (tau * .5))) * (.35 + s[2] * .75);
      o.x = Math.cos(th) * rad; o.z = Math.sin(th) * rad; o.y = s[3] * H * .05 + H * .02;
      o.s = H * .11 * (.7 + s[4]);
      setC(o, mixC(Fi, Ba, clamp(t / 2)).clone().lerp(Dk, cool * .3), clamp(t * 2) * .45 * clamp(1.4 - t / (tau * 4))); o.rot = s[5] * 6;
    }
  };
  return p;
}

// glowing fireball sphere (emissive, scales with t)
export function fireball(radius = 10) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4d6').multiplyScalar(8), transparent: true, toneMapped: true });
  const s = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), m); s.userData.r = radius;
  s.userData.fbTick = (t) => {
    const g = clamp(t / .6); s.scale.setScalar(radius * (.2 + .8 * Math.sqrt(g)) * (1 + t * .03));
    const heat = clamp(1 - t / 5); const c = new THREE.Color('#ff6a1a').lerp(new THREE.Color('#fff6e0'), heat);
    m.color.copy(c).multiplyScalar(1.5 + heat * 5); m.opacity = clamp(1.4 - t / 6);
    s.visible = m.opacity > .01;
  };
  return s;
}

// expanding shock ring on ground
export function shockRing(color = '#fff0d0') {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(3), transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(new THREE.RingGeometry(.92, 1, 128, 1), m); ring.rotation.x = -Math.PI / 2;
  ring.userData.set = (rad, a) => { ring.scale.setScalar(Math.max(.01, rad)); m.opacity = a; ring.visible = a > .01; };
  return ring;
}
export function domeShock(color = '#ffffff') {
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const d = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), m);
  d.userData.set = (rad, a) => { d.scale.setScalar(Math.max(.01, rad)); m.opacity = a; d.visible = a > .01; };
  return d;
}

export { noise1, fbm };
