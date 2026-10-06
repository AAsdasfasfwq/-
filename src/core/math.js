// Deterministic helpers: seeded random, noise, easing, keyframes.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => clamp((x - a) / (b - a));
export const remap = (x, a, b, c, d) => lerp(c, d, invLerp(a, b, x));
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const easeInOut = (t) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const expoOut = (t) => { t = clamp(t); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
export const backOut = (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
export const elastic = (t) => { t = clamp(t); return t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1; };
export const pulse = (t, a, b) => (t >= a && t <= b ? 1 : 0);
// window: rises over `fi` after a, falls over `fo` before b
export const win = (t, a, b, fi = .3, fo = .3) => Math.min(smooth((t - a) / fi), smooth((b - t) / fo));

export function rng(seed = 1) {
  let s = (seed >>> 0) || 1;
  const f = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  f.range = (a, b) => a + (b - a) * f();
  f.int = (a, b) => Math.floor(a + (b - a + 1) * f());
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.sign = () => (f() < .5 ? -1 : 1);
  return f;
}
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const hash2 = (x, y) => hash(x * 157.31 + y * 113.97);

export function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export function fbm(x, y, oct = 4) {
  let v = 0, a = .5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise2(x * f, y * f); f *= 2; a *= .5; }
  return v;
}
export const noise1 = (x) => { const i = Math.floor(x), f = x - i; return lerp(hash(i), hash(i + 1), f * f * (3 - 2 * f)); };

// keyframes: [[t, value], ...] value can be number or array; ease applies per segment
export function keys(t, kf, ease = easeInOut) {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [t0, v0] = kf[i], [t1, v1] = kf[i + 1];
    if (t <= t1) {
      const e = (kf[i + 1][2] || ease)((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], e)) : lerp(v0, v1, e);
    }
  }
  return kf[kf.length - 1][1];
}
