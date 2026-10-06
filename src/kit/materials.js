// Shared PBR materials (kept alive across shots).
import * as THREE from 'three';
import * as TX from '../core/textures.js';

const cache = new Map();
export function M(color, { rough = .7, metal = 0, emissive = null, ei = 1, map = null, flat = false, side = THREE.FrontSide, transparent = false, opacity = 1, key = '' } = {}) {
  const k = [color, rough, metal, emissive, ei, map && map.uuid, flat, side, transparent, opacity, key].join('|');
  if (cache.has(k)) return cache.get(k);
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, map, flatShading: flat, side, transparent, opacity });
  if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = ei; }
  m.userData.keep = true; cache.set(k, m); return m;
}
// unique (animatable) material
export const U = (color, o = {}) => {
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? .7, metalness: o.metal ?? 0, map: o.map || null, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide });
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; }
  return m;
};
export const Basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, map: o.map || null, depthWrite: o.depthWrite ?? true, blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: o.toneMapped ?? true, fog: o.fog ?? true });

export const MAT = {
  get alu() { return M('#cfd5db', { rough: .28, metal: .92, map: TX.metalTex(), key: 'alu' }); },
  get aluDark() { return M('#8d949b', { rough: .35, metal: .9 }); },
  get glass() { return M('#9fc4d8', { rough: .05, metal: .6, transparent: true, opacity: .45, key: 'glass' }); },
  get rubber() { return M('#141414', { rough: .9 }); },
  get olive() { return M('#4f5a3a', { rough: .55, metal: .3 }); },
  get gunmetal() { return M('#3c4249', { rough: .4, metal: .7 }); },
  get wood() { return M('#ffffff', { rough: .75, map: TX.woodTex(), key: 'wood' }); },
  get planks() { return M('#ffffff', { rough: .8, map: TX.planksTex(), key: 'planks' }); },
  get concrete() { return M('#ffffff', { rough: .95, map: TX.concreteTex(), key: 'conc' }); },
  get paper() { return M('#ffffff', { rough: .9, map: TX.paperTex(), key: 'paper' }); },
  get roof() { return M('#ffffff', { rough: .6, map: TX.roofTileTex(), key: 'roof' }); },
  get brass() { return M('#c79a43', { rough: .3, metal: 1 }); },
  get black() { return M('#0d0d0f', { rough: .5 }); },
  get red() { return M('#b3202a', { rough: .5 }); },
  get leather() { return M('#4a2a1a', { rough: .6 }); },
  get green() { return M('#2f5d3a', { rough: .7 }); },
};
