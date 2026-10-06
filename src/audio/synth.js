// Web Audio sound design. Every function schedules nodes on any BaseAudioContext (real-time or offline).
import { rng } from '../core/math.js';

let NOISE = null, BROWN = null;
function noiseBuf(ctx) {
  if (NOISE && NOISE.sampleRate === ctx.sampleRate) return NOISE;
  const len = ctx.sampleRate * 4; NOISE = ctx.createBuffer(2, len, ctx.sampleRate);
  const r = rng(42); for (let c = 0; c < 2; c++) { const d = NOISE.getChannelData(c); for (let i = 0; i < len; i++) d[i] = r() * 2 - 1; }
  BROWN = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = BROWN.getChannelData(c); let last = 0; for (let i = 0; i < len; i++) { last = (last + .02 * (r() * 2 - 1)) / 1.02; d[i] = last * 3.5; } }
  return NOISE;
}
export function noise(ctx, t, dur, { brown = false, loop = true } = {}) {
  noiseBuf(ctx); const s = ctx.createBufferSource(); s.buffer = brown ? BROWN : NOISE; s.loop = loop;
  s.start(t, (t * 1.37) % 3.5); s.stop(t + dur + .05); return s;
}
const env = (ctx, t, a, d, peak = 1, sustain = 0, rel = 0, hold = 0) => {
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a);
  if (hold) g.gain.setValueAtTime(peak, t + a + hold);
  g.gain.exponentialRampToValueAtTime(Math.max(sustain, .0001), t + a + hold + d);
  if (rel) g.gain.exponentialRampToValueAtTime(.0001, t + a + hold + d + rel);
  return g;
};
const filt = (ctx, type, f, q = .7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
const osc = (ctx, type, f, t, dur) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur + .05); return o; };
const pan = (ctx, p) => { const n = ctx.createStereoPanner(); n.pan.value = p; return n; };

export function makeReverb(ctx, secs = 3.2, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * secs); const b = ctx.createBuffer(2, len, ctx.sampleRate); const r = rng(7);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, decay); }
  const cv = ctx.createConvolver(); cv.buffer = b; return cv;
}

// ---------------- one-shots ----------------
export const SFX = {
  // cinematic low hit for title cards
  boom(ctx, out, t, { gain = 1, pitch = 1 } = {}) {
    const o = osc(ctx, 'sine', 70 * pitch, t, 3); o.frequency.exponentialRampToValueAtTime(28 * pitch, t + 1.8);
    const g = env(ctx, t, .005, 2.6, .9 * gain); o.connect(g).connect(out.dry); g.connect(out.wet);
    const n = noise(ctx, t, 1.2, { brown: true }); const lp = filt(ctx, 'lowpass', 400); const ng = env(ctx, t, .002, .9, .8 * gain); n.connect(lp).connect(ng).connect(out.dry); ng.connect(out.wet);
    const c = noise(ctx, t, .08); const hp = filt(ctx, 'bandpass', 2500, 1); const cg = env(ctx, t, .001, .07, .25 * gain); c.connect(hp).connect(cg).connect(out.dry);
  },
  // reversed-swell riser into a hit
  riser(ctx, out, t, { dur = 2, gain = .6 } = {}) {
    const n = noise(ctx, t, dur); const bp = filt(ctx, 'bandpass', 300, 2); bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(6000, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain * .5, t + dur * .95); g.gain.linearRampToValueAtTime(0, t + dur + .02);
    n.connect(bp).connect(g).connect(out.dry); g.connect(out.wet);
    const o = osc(ctx, 'sawtooth', 110, t, dur); o.frequency.exponentialRampToValueAtTime(440, t + dur); const lp = filt(ctx, 'lowpass', 900); const og = ctx.createGain(); og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(gain * .08, t + dur); og.gain.linearRampToValueAtTime(0, t + dur + .02); o.connect(lp).connect(og).connect(out.wet);
  },
  whoosh(ctx, out, t, { dur = .55, gain = .35, up = true, p = 0 } = {}) {
    const n = noise(ctx, t, dur); const bp = filt(ctx, 'bandpass', up ? 400 : 3000, 1.2); bp.frequency.exponentialRampToValueAtTime(up ? 3000 : 300, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur * .55); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    const pn = pan(ctx, p); n.connect(bp).connect(g).connect(pn).connect(out.dry); g.connect(out.wet);
  },
  tick(ctx, out, t, { gain = .35, hi = true } = {}) {
    const n = noise(ctx, t, .04); const bp = filt(ctx, 'bandpass', hi ? 3200 : 1800, 6); const g = env(ctx, t, .0005, .03, gain); n.connect(bp).connect(g).connect(out.dry); g.connect(out.wet);
    const o = osc(ctx, 'sine', hi ? 1400 : 900, t, .05); const og = env(ctx, t, .0005, .03, gain * .25); o.connect(og).connect(out.dry);
  },
  ticking(ctx, out, t, { dur = 3, gain = .3, rate = 1 } = {}) { for (let k = 0; k * rate < dur; k++) SFX.tick(ctx, out, t + k * rate, { gain, hi: k % 2 === 0 }); },
  key(ctx, out, t, { gain = .25, seed = 1 } = {}) {
    const r = rng(Math.floor(t * 1000) + seed); const n = noise(ctx, t, .05); const bp = filt(ctx, 'bandpass', 1800 + r() * 1500, 3); const g = env(ctx, t, .0005, .035 + r() * .02, gain * (.7 + r() * .4));
    n.connect(bp).connect(g).connect(out.dry); g.connect(out.wet); const th = osc(ctx, 'sine', 160 + r() * 40, t, .05); const tg = env(ctx, t, .001, .04, gain * .5); th.connect(tg).connect(out.dry);
  },
  typing(ctx, out, t, { dur = 1.5, gain = .22, cps = 14 } = {}) { const r = rng(Math.floor(t * 100)); let x = 0; while (x < dur) { SFX.key(ctx, out, t + x, { gain }); x += (1 / cps) * (.6 + r() * .9); } },
  bell(ctx, out, t, { gain = .35, f = 220 } = {}) { // temple bell, inharmonic partials
    for (const [m, a, d] of [[1, 1, 7], [2.76, .5, 4], [5.4, .25, 2.5], [8.9, .12, 1.4], [.5, .4, 8]]) { const o = osc(ctx, 'sine', f * m, t, d + .1); const g = env(ctx, t, .004, d, gain * a * .4); o.connect(g).connect(out.dry); g.connect(out.wet); }
  },
  ding(ctx, out, t, { gain = .2, f = 1760 } = {}) { const o = osc(ctx, 'sine', f, t, 1.5); const g = env(ctx, t, .002, 1.2, gain); o.connect(g).connect(out.dry); g.connect(out.wet); },
  pop(ctx, out, t, { gain = .22, f = 600 } = {}) { const o = osc(ctx, 'sine', f, t, .2); o.frequency.exponentialRampToValueAtTime(f * 1.8, t + .06); const g = env(ctx, t, .002, .12, gain); o.connect(g).connect(out.dry); g.connect(out.wet); },
  blip(ctx, out, t, { gain = .12, f = 1200 } = {}) { const o = osc(ctx, 'square', f, t, .06); const lp = filt(ctx, 'lowpass', 3000); const g = env(ctx, t, .001, .05, gain); o.connect(lp).connect(g).connect(out.dry); },
  data(ctx, out, t, { gain = .1, n = 8 } = {}) { const r = rng(Math.floor(t * 77)); for (let i = 0; i < n; i++) SFX.blip(ctx, out, t + i * .045, { gain, f: 800 + Math.floor(r() * 6) * 200 }); },
  counter(ctx, out, t, { dur = 1.2, gain = .08 } = {}) { let x = 0, k = 0; while (x < dur) { SFX.blip(ctx, out, t + x, { gain: gain * (1 - x / dur * .5), f: 1500 + (k % 3) * 120 }); x += .03 + x * .05; k++; } },
  stamp(ctx, out, t, { gain = .55 } = {}) {
    const n = noise(ctx, t, .25, { brown: true }); const lp = filt(ctx, 'lowpass', 600); const g = env(ctx, t, .001, .2, gain); n.connect(lp).connect(g).connect(out.dry); g.connect(out.wet);
    const o = osc(ctx, 'sine', 110, t, .3); o.frequency.exponentialRampToValueAtTime(50, t + .2); const og = env(ctx, t, .001, .22, gain * .8); o.connect(og).connect(out.dry);
  },
  paper(ctx, out, t, { dur = .6, gain = .2 } = {}) { const r = rng(Math.floor(t * 31)); for (let i = 0; i < 7; i++) { const tt = t + r() * dur; const n = noise(ctx, tt, .12); const hp = filt(ctx, 'bandpass', 3000 + r() * 4000, .8); const g = env(ctx, tt, .005, .06 + r() * .08, gain * (.4 + r() * .6)); n.connect(hp).connect(g).connect(out.dry); } },
  clunk(ctx, out, t, { gain = .5 } = {}) { const n = noise(ctx, t, .3, { brown: true }); const bp = filt(ctx, 'bandpass', 300, 2); const g = env(ctx, t, .001, .25, gain); n.connect(bp).connect(g).connect(out.dry); g.connect(out.wet); const o = osc(ctx, 'triangle', 180, t, .2); o.frequency.exponentialRampToValueAtTime(80, t + .15); const og = env(ctx, t, .001, .15, gain * .6); o.connect(og).connect(out.dry); },
  metal(ctx, out, t, { gain = .3, f = 420 } = {}) { for (const m of [1, 1.47, 2.09, 2.83, 3.9]) { const o = osc(ctx, 'sine', f * m, t, 2); const g = env(ctx, t, .002, 1.4 / m, gain * .25 / m); o.connect(g).connect(out.dry); g.connect(out.wet); } SFX.clunk(ctx, out, t, { gain: gain * .8 }); },
  glass(ctx, out, t, { gain = .15 } = {}) { const r = rng(Math.floor(t * 9)); for (let i = 0; i < 9; i++) { const tt = t + r() * .8; const o = osc(ctx, 'sine', 2500 + r() * 4000, tt, .6); const g = env(ctx, tt, .001, .3 + r() * .4, gain * r()); o.connect(g).connect(out.dry); g.connect(out.wet); } },
  explosion(ctx, out, t, { gain = 1, dur = 7 } = {}) {
    const n = noise(ctx, t, dur, { brown: true }); const lp = filt(ctx, 'lowpass', 2500); lp.frequency.exponentialRampToValueAtTime(140, t + dur * .7);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.4 * gain, t + .02); g.gain.exponentialRampToValueAtTime(.35 * gain, t + .8); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    const ws = ctx.createWaveShaper(); const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 2.5); } ws.curve = curve;
    n.connect(lp).connect(ws).connect(g).connect(out.dry); g.connect(out.wet);
    const o = osc(ctx, 'sine', 55, t, dur); o.frequency.exponentialRampToValueAtTime(22, t + dur * .8); const og = env(ctx, t, .01, dur * .8, 1.1 * gain); o.connect(og).connect(out.dry);
    const c = noise(ctx, t, .3); const hp = filt(ctx, 'highpass', 1500); const cg = env(ctx, t, .001, .25, .6 * gain); c.connect(hp).connect(cg).connect(out.dry); cg.connect(out.wet);
  },
  flash(ctx, out, t, { gain = .25, dur = 3 } = {}) { // ear-ringing tinnitus after the flash
    const o = osc(ctx, 'sine', 3800, t, dur); const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain * .25, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(out.dry);
    const n = noise(ctx, t, .4); const g2 = env(ctx, t, .001, .35, gain * 1.2); n.connect(g2).connect(out.dry); g2.connect(out.wet);
  },
  rumble(ctx, out, t, { dur = 4, gain = .6 } = {}) { const n = noise(ctx, t, dur, { brown: true }); const lp = filt(ctx, 'lowpass', 180); const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur * .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur); n.connect(lp).connect(g).connect(out.dry); g.connect(out.wet); },
  siren(ctx, out, t, { dur = 6, gain = .18 } = {}) {
    const o = osc(ctx, 'sawtooth', 300, t, dur); const o2 = osc(ctx, 'sawtooth', 302, t, dur);
    o.frequency.setValueAtTime(260, t); o.frequency.linearRampToValueAtTime(620, t + dur * .35); o.frequency.setValueAtTime(620, t + dur * .6); o.frequency.linearRampToValueAtTime(200, t + dur);
    o2.frequency.setValueAtTime(262, t); o2.frequency.linearRampToValueAtTime(624, t + dur * .35); o2.frequency.setValueAtTime(624, t + dur * .6); o2.frequency.linearRampToValueAtTime(201, t + dur);
    const bp = filt(ctx, 'bandpass', 900, .7); const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 1); g.gain.setValueAtTime(gain, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(bp); o2.connect(bp); bp.connect(g).connect(out.wet); g.connect(out.dry);
  },
  morse(ctx, out, t, { pattern = '-.-. .-.. . .- .-.', gain = .12, unit = .07, f = 760 } = {}) {
    let x = 0; for (const ch of pattern) { if (ch === ' ') { x += unit * 3; continue; } const L = ch === '-' ? unit * 3 : unit; const o = osc(ctx, 'sine', f, t + x, L); const g = ctx.createGain(); g.gain.setValueAtTime(0, t + x); g.gain.linearRampToValueAtTime(gain, t + x + .005); g.gain.setValueAtTime(gain, t + x + L - .005); g.gain.linearRampToValueAtTime(0, t + x + L); o.connect(g).connect(out.dry); x += L + unit; }
  },
  static(ctx, out, t, { dur = 2, gain = .12 } = {}) { const n = noise(ctx, t, dur); const bp = filt(ctx, 'bandpass', 2200, .6); const g = ctx.createGain(); const r = rng(Math.floor(t * 13)); g.gain.setValueAtTime(0, t); for (let x = 0; x < dur; x += .05) g.gain.setValueAtTime(gain * (.3 + r() * .7) * (r() < .1 ? 2 : 1), t + x); g.gain.setValueAtTime(0, t + dur); n.connect(bp).connect(g).connect(out.dry); },
  geiger(ctx, out, t, { dur = 3, rate = 12, gain = .2 } = {}) { const r = rng(Math.floor(t * 17)); let x = 0; while (x < dur) { const tt = t + x; const n = noise(ctx, tt, .01); const hp = filt(ctx, 'highpass', 2000); const g = env(ctx, tt, .0002, .004, gain); n.connect(hp).connect(g).connect(out.dry); x += -Math.log(1 - r()) / rate; } },
  heartbeat(ctx, out, t, { beats = 4, bpm = 62, gain = .5 } = {}) { for (let i = 0; i < beats; i++) for (const [o, a] of [[0, 1], [.16, .7]]) { const tt = t + i * 60 / bpm + o; const s = osc(ctx, 'sine', 60, tt, .2); s.frequency.exponentialRampToValueAtTime(35, tt + .12); const g = env(ctx, tt, .004, .15, gain * a); s.connect(g).connect(out.dry); } },
  shutter(ctx, out, t, { gain = .3 } = {}) { SFX.tick(ctx, out, t, { gain }); SFX.tick(ctx, out, t + .06, { gain: gain * .7, hi: false }); const n = noise(ctx, t + .02, .1); const bp = filt(ctx, 'highpass', 4000); const g = env(ctx, t + .02, .001, .08, gain * .3); n.connect(bp).connect(g).connect(out.dry); },
  flak(ctx, out, t, { gain = .4, p = 0 } = {}) { const n = noise(ctx, t, .6, { brown: true }); const lp = filt(ctx, 'lowpass', 900); const g = env(ctx, t, .001, .5, gain); const pn = pan(ctx, p); n.connect(lp).connect(g).connect(pn).connect(out.dry); g.connect(out.wet); },
  fall(ctx, out, t, { dur = 6, gain = .12 } = {}) { const o = osc(ctx, 'sine', 1800, t, dur); o.frequency.exponentialRampToValueAtTime(500, t + dur); const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur); o.connect(g).connect(out.wet); g.connect(out.dry); },
  piano(ctx, out, t, { notes = [57], gain = .18, dur = 4 } = {}) { notes.forEach((m, i) => { const f = 440 * Math.pow(2, (m - 69) / 12); const tt = t + i * 0; for (const [h, a] of [[1, 1], [2, .35], [3, .15], [4, .07]]) { const o = osc(ctx, 'sine', f * h, tt, dur); const g = env(ctx, tt, .004, dur / h, gain * a); o.connect(g).connect(out.dry); g.connect(out.wet); } }); },
  crowd(ctx, out, t, { dur = 4, gain = .25 } = {}) { for (const f of [500, 900, 1400]) { const n = noise(ctx, t, dur); const bp = filt(ctx, 'bandpass', f, 1.5); const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain * .5, t + .6); g.gain.linearRampToValueAtTime(0, t + dur); n.connect(bp).connect(g).connect(out.wet); g.connect(out.dry); } },
  doors(ctx, out, t, { dur = 2, gain = .3 } = {}) { const o = osc(ctx, 'sawtooth', 90, t, dur); o.frequency.linearRampToValueAtTime(140, t + dur); const lp = filt(ctx, 'lowpass', 500); const g = env(ctx, t, .2, dur, gain * .4, .0001); o.connect(lp).connect(g).connect(out.dry); SFX.rumble(ctx, out, t, { dur, gain: gain }); SFX.clunk(ctx, out, t + dur, { gain: gain * 1.2 }); },
};

// ---------------- beds (continuous ambiences) ----------------
function fadeGain(ctx, t0, t1, gain, fi = 1.5, fo = 1.5) { const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + fi); g.gain.setValueAtTime(gain, Math.max(t0 + fi, t1 - fo)); g.gain.linearRampToValueAtTime(0, t1); return g; }
export const BED = {
  drone(ctx, out, t0, t1, { gain = .12, root = 41, chord = [0, 7, 12, 15], dark = 600 } = {}) { // tension pad
    const g = fadeGain(ctx, t0, t1, gain, 3, 3); const lp = filt(ctx, 'lowpass', dark, .5); lp.connect(g); g.connect(out.dry); g.connect(out.wet);
    chord.forEach((iv, i) => { for (const det of [-6, 6]) { const o = osc(ctx, i ? 'sawtooth' : 'sine', 440 * Math.pow(2, (root + iv - 69) / 12), t0, t1 - t0); o.detune.value = det; const og = ctx.createGain(); og.gain.value = (i ? .05 : .4) / chord.length; const lfo = osc(ctx, 'sine', .07 + i * .03, t0, t1 - t0); const lg = ctx.createGain(); lg.gain.value = .3 * og.gain.value; lfo.connect(lg).connect(og.gain); o.connect(og).connect(lp); } });
  },
  wind(ctx, out, t0, t1, { gain = .12, f = 500 } = {}) { const n = noise(ctx, t0, t1 - t0); const bp = filt(ctx, 'bandpass', f, .8); const lfo = osc(ctx, 'sine', .13, t0, t1 - t0); const lg = ctx.createGain(); lg.gain.value = f * .5; lfo.connect(lg).connect(bp.frequency); const g = fadeGain(ctx, t0, t1, gain); n.connect(bp).connect(g).connect(out.dry); },
  engine(ctx, out, t0, t1, { gain = .15, f = 46, inside = false } = {}) { // B-29: four radial engines beating
    const g = fadeGain(ctx, t0, t1, gain, .8, .8); const lp = filt(ctx, 'lowpass', inside ? 300 : 700); lp.connect(g).connect(out.dry);
    for (const [k, det] of [[1, 0], [1.01, 3], [.995, -4], [2, 7]]) { const o = osc(ctx, 'sawtooth', f * k, t0, t1 - t0); o.detune.value = det; const og = ctx.createGain(); og.gain.value = .18; o.connect(og).connect(lp); }
    const n = noise(ctx, t0, t1 - t0, { brown: true }); const ng = ctx.createGain(); ng.gain.value = .9; const am = osc(ctx, 'sine', 9, t0, t1 - t0); const amg = ctx.createGain(); amg.gain.value = .35; am.connect(amg).connect(ng.gain); n.connect(ng).connect(lp);
  },
  fire(ctx, out, t0, t1, { gain = .14 } = {}) { const n = noise(ctx, t0, t1 - t0, { brown: true }); const lp = filt(ctx, 'lowpass', 900); const g = fadeGain(ctx, t0, t1, gain); n.connect(lp).connect(g).connect(out.dry); const r = rng(Math.floor(t0)); for (let x = t0; x < t1; x += .03 + r() * .2) { const c = noise(ctx, x, .02); const hp = filt(ctx, 'highpass', 2500 + r() * 3000); const cg = env(ctx, x, .0005, .01 + r() * .02, gain * (r() * 1.5) * Math.min(1, (x - t0) / 1.5, (t1 - x) / 1.5)); c.connect(hp).connect(cg).connect(out.dry); } },
  rain(ctx, out, t0, t1, { gain = .1 } = {}) { const n = noise(ctx, t0, t1 - t0); const hp = filt(ctx, 'highpass', 1200); const lp = filt(ctx, 'lowpass', 7000); const g = fadeGain(ctx, t0, t1, gain); n.connect(hp).connect(lp).connect(g).connect(out.dry); },
  sea(ctx, out, t0, t1, { gain = .12 } = {}) { const n = noise(ctx, t0, t1 - t0, { brown: true }); const lp = filt(ctx, 'lowpass', 600); const g = fadeGain(ctx, t0, t1, gain); const am = ctx.createGain(); am.gain.value = .6; const lfo = osc(ctx, 'sine', .11, t0, t1 - t0); const lg = ctx.createGain(); lg.gain.value = .4; lfo.connect(lg).connect(am.gain); n.connect(lp).connect(am).connect(g).connect(out.dry); },
  city(ctx, out, t0, t1, { gain = .07 } = {}) { const n = noise(ctx, t0, t1 - t0); const bp = filt(ctx, 'bandpass', 700, .5); const g = fadeGain(ctx, t0, t1, gain); n.connect(bp).connect(g).connect(out.dry); const r = rng(Math.floor(t0) + 3); for (let x = t0 + 1; x < t1 - 1; x += 1.5 + r() * 3) SFX.ding(ctx, out, x, { gain: gain * .5, f: 1200 + r() * 1200 }); },
  room(ctx, out, t0, t1, { gain = .05 } = {}) { const n = noise(ctx, t0, t1 - t0, { brown: true }); const lp = filt(ctx, 'lowpass', 250); const g = fadeGain(ctx, t0, t1, gain); n.connect(lp).connect(g).connect(out.dry); },
  hum(ctx, out, t0, t1, { gain = .05, f = 60 } = {}) { const o = osc(ctx, 'sawtooth', f, t0, t1 - t0); const lp = filt(ctx, 'lowpass', 400); const g = fadeGain(ctx, t0, t1, gain); o.connect(lp).connect(g).connect(out.dry); },
  static(ctx, out, t0, t1, { gain = .06 } = {}) { const n = noise(ctx, t0, t1 - t0); const bp = filt(ctx, 'bandpass', 1800, .5); const g = fadeGain(ctx, t0, t1, gain, .3, .3); n.connect(bp).connect(g).connect(out.dry); },
  ticking(ctx, out, t0, t1, { gain = .18, rate = 1 } = {}) { for (let x = t0, k = 0; x < t1; x += rate, k++) SFX.tick(ctx, out, x, { gain: gain * Math.min(1, (x - t0) / 1, (t1 - x) / 1), hi: k % 2 === 0 }); },
  geiger(ctx, out, t0, t1, { gain = .14, rate = 8 } = {}) { SFX.geiger(ctx, out, t0, { dur: t1 - t0, rate, gain }); },
  pianoMotif(ctx, out, t0, t1, { gain = .14, notes = [57, 60, 64, 62, 60, 59, 57], step = 2.4 } = {}) { let i = 0; for (let x = t0; x < t1 - 2; x += step, i++) SFX.piano(ctx, out, x, { notes: [notes[i % notes.length]], gain, dur: step * 1.8 }); },
};
