import { setEngine } from './common.js';
import act1 from './act1.js';
import act2 from './act2.js';
import act3 from './act3.js';
import act4 from './act4.js';
import act5 from './act5.js';
export function buildShots({ engine }) {
  setEngine(engine);
  const shots = [];
  const add = (t0, name, make, opt = {}) => { if (!Number.isFinite(t0)) { console.warn('bad t0 for', name); return; } shots.push({ t0: Math.max(0, t0), name, make, sfx: opt.sfx, bed: opt.bed }); };
  act1(add);
  act2(add);
  act3(add);
  act4(add);
  act5(add);
  shots.sort((a, b) => a.t0 - b.t0);
  for (const s of shots) for (const c of s.sfx || []) if (!Number.isFinite(c[0])) console.warn('bad sfx time in', s.name, c[1]);
  return shots;
}
