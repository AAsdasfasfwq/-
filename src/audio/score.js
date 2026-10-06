// Collects SFX cues + ambience beds from the shot list and renders them with an OfflineAudioContext.
import { SFX, BED, makeReverb } from './synth.js';

let CUES = [], BEDS = [];
export function setScore(shots) {
  CUES = []; BEDS = [];
  for (const s of shots) { if (s.sfx) for (const c of s.sfx) CUES.push(c); if (s.bed) for (const b of s.bed) BEDS.push(b); }
}
export const getCues = () => CUES;

// Renders [from,to) in overlapping segments: each segment gets a pre-roll (so long one-shots and bed fade-ins
// that started earlier are reproduced) and a short crossfade with its neighbour. Bounded memory, steady speed.
async function renderSegment(o, len, sr) {
  const ctx = new OfflineAudioContext(2, Math.ceil(len * sr), sr);
  const master = ctx.createGain(); master.gain.value = .55; // keep SFX well under the voice-over
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4; comp.attack.value = .005; comp.release.value = .25;
  master.connect(comp).connect(ctx.destination);
  const dry = ctx.createGain(); dry.connect(master);
  const rev = makeReverb(ctx, 3.4, 2.4); const wet = ctx.createGain(); wet.gain.value = .32; rev.connect(wet).connect(master);
  const out = { dry, wet: rev }; const end = o + len;
  for (const [t0, t1, type, opt] of BEDS) { const a = Math.max(t0, o), b = Math.min(t1, end + 4); if (BED[type] && b - a > .2) BED[type](ctx, out, a - o, b - o, opt || {}); }
  for (const [t, type, opt] of CUES) { if (t >= o && t < end) { if (SFX[type]) SFX[type](ctx, out, t - o, opt || {}); else console.warn('unknown sfx', type); } }
  return ctx.startRendering();
}
export async function renderSfx(duration, sr = 48000, from = 0, to = duration, onProgress = null) {
  const SEG = 60, PRE = 12, X = 1; to = Math.min(to, duration);
  const N = Math.ceil((to - from) * sr); const L = new Float32Array(N), R = new Float32Array(N);
  for (let a = from; a < to; a += SEG) {
    const b = Math.min(a + SEG, to); const o = Math.max(0, a - PRE); const buf = await renderSegment(o, b + X - o, sr);
    const l = buf.getChannelData(0), r = buf.getChannelData(1);
    const i0 = Math.round((a - from) * sr), i1 = Math.min(N, Math.round((b + X - from) * sr));
    for (let i = i0; i < i1; i++) {
      const t = from + i / sr; let w = 1;
      if (a > from && t < a + X) w = (t - a) / X;
      if (b < to && t >= b) w = 1 - (t - b) / X;
      const k = Math.round((t - o) * sr); if (k >= l.length) break;
      L[i] += l[k] * w; R[i] += r[k] * w;
    }
    if (onProgress) onProgress((b - from) / (to - from));
  }
  return { numberOfChannels: 2, length: N, sampleRate: sr, getChannelData: (c) => (c ? R : L) };
}

export function sfxToWav(buf) {
  const ch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate; const out = new Uint8Array(44 + len * ch * 2); const v = new DataView(out.buffer);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + len * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, len * ch * 2, true);
  const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
  let o = 44; for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, data[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
  return out;
}
