// Sky, light rigs, grounds, terrain, water, environment maps.
import * as THREE from 'three';
import { M, Basic } from './materials.js';
import * as TX from '../core/textures.js';
import { fbm, rng } from '../core/math.js';

const SkyShader = {
  uniforms: { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, .3, -1) }, sunCol: { value: new THREE.Color() }, sunSize: { value: .02 }, sunGlow: { value: .3 }, stars: { value: 0 }, horizon: { value: .0 } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w*.99999; }`,
  fragmentShader: `uniform vec3 top,mid,bot,sunCol,sunDir; uniform float sunSize,sunGlow,stars,horizon; varying vec3 vDir;
    float h(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453); }
    void main(){ vec3 d = normalize(vDir); float y = d.y - horizon;
      vec3 c = y > 0. ? mix(mid, top, pow(clamp(y*1.6,0.,1.), .7)) : mix(mid, bot, clamp(-y*5.,0.,1.));
      float s = max(dot(d, normalize(sunDir)), 0.);
      c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.3, s) * 8. + pow(s, 6.) * sunGlow + pow(s, 120.) * sunGlow * 2.);
      if (stars > 0.) { vec3 q = floor(d*420.); float st = step(.9975, h(q)) * clamp(y*3.,0.,1.); c += st * stars * (0.5+h(q+1.)); }
      gl_FragColor = vec4(c, 1.); }`,
};

export function sky(scene, { top = '#1b2a4a', mid = '#d98a5a', bot = '#2a2420', sun = [0, .15, -1], sunCol = '#ffd7a0', sunSize = .0006, sunGlow = .18, stars = 0, fog = null, horizon = 0 } = {}) {
  const mat = new THREE.ShaderMaterial({ ...SkyShader, uniforms: THREE.UniformsUtils.clone(SkyShader.uniforms), side: THREE.BackSide, depthWrite: false, fog: false });
  mat.uniforms.top.value.set(top); mat.uniforms.mid.value.set(mid); mat.uniforms.bot.value.set(bot);
  mat.uniforms.sunDir.value.set(...sun).normalize(); mat.uniforms.sunCol.value.set(sunCol);
  mat.uniforms.sunSize.value = sunSize; mat.uniforms.sunGlow.value = sunGlow; mat.uniforms.stars.value = stars; mat.uniforms.horizon.value = horizon;
  const m = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), mat); m.frustumCulled = false; m.renderOrder = -10; m.name = 'sky';
  scene.add(m);
  if (fog) scene.fog = new THREE.Fog(fog[0], fog[1], fog[2]);
  return m;
}

// image-based lighting from the sky dome only, so metals reflect the right mood
export function envFromSky(renderer, scene, skyMesh, strength = 1) {
  const pm = new THREE.PMREMGenerator(renderer);
  const s = new THREE.Scene(); const clone = skyMesh.clone(); clone.scale.setScalar(.01); s.add(clone);
  const rt = pm.fromScene(s, 0, .1, 100); pm.dispose();
  scene.environment = rt.texture; scene.environmentIntensity = strength;
  scene.userData.envRT = rt;
  return rt;
}

export function lights(scene, { sun = [30, 40, -20], sunCol = '#ffe0b8', sunI = 3, hemiTop = '#9ab8ff', hemiBot = '#4a3a2a', hemiI = .8, shadow = true, area = 40, mapSize = 2048, target = [0, 0, 0], bias = -.0004 } = {}) {
  const hemi = new THREE.HemisphereLight(hemiTop, hemiBot, hemiI); scene.add(hemi);
  const d = new THREE.DirectionalLight(sunCol, sunI); d.position.set(...sun); d.target.position.set(...target);
  if (shadow) {
    d.castShadow = true; d.shadow.mapSize.set(mapSize, mapSize); const c = d.shadow.camera;
    c.left = -area; c.right = area; c.top = area; c.bottom = -area; c.near = .5; c.far = 2000; d.shadow.bias = bias; d.shadow.normalBias = .02;
  }
  scene.add(d, d.target);
  return { hemi, sun: d };
}

export function point(scene, pos, color = '#ffb070', intensity = 30, dist = 30, shadow = false) {
  const l = new THREE.PointLight(color, intensity, dist, 2); l.position.set(...pos);
  if (shadow) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.002; }
  scene.add(l); return l;
}
export function spot(scene, pos, target, color = '#fff', intensity = 200, angle = .5, pen = .5, shadow = true) {
  const l = new THREE.SpotLight(color, intensity, 0, angle, pen, 2); l.position.set(...pos); l.target.position.set(...target);
  if (shadow) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.0005; }
  scene.add(l, l.target); return l;
}

export function ground(scene, { size = 400, color = '#ffffff', map = null, rough = .95, y = 0, repeat = null } = {}) {
  const m = map ? map : null;
  const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ color, map: m, roughness: rough }));
  g.rotation.x = -Math.PI / 2; g.position.y = y; g.receiveShadow = true; scene.add(g);
  if (m && repeat) { m.repeat.set(...repeat); }
  return g;
}

// heightfield terrain with vertex colours: fn(x,z) -> height, colorFn(x,z,h) -> THREE.Color
export function terrain(scene, { size = 400, seg = 200, height = (x, z) => 0, color = () => new THREE.Color('#8a7a5a'), rough = .95, map = null } = {}) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position; const cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i); const h = height(x, z); p.setY(i, h);
    const c = color(x, z, h); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, map }));
  mesh.receiveShadow = true; mesh.castShadow = false; scene.add(mesh); return mesh;
}

export function water(scene, { size = 4000, color = '#1f4a5c', y = 0, rough = .12, repeat = 60 } = {}) {
  const n = TX.waterNormal().clone(); n.userData.keep = false; n.wrapS = n.wrapT = THREE.RepeatWrapping; n.repeat.set(repeat, repeat); n.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: .1, normalMap: n, normalScale: new THREE.Vector2(.6, .6) });
  const w = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m); w.rotation.x = -Math.PI / 2; w.position.y = y; w.receiveShadow = true; scene.add(w);
  w.userData.tick = (t) => { n.offset.set(t * .01, t * .006); };
  return w;
}

export const C = (c) => new THREE.Color(c);
export { fbm, rng };
