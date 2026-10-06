// Word-accurate timing from the narration JSON. Every visual beat is anchored to a spoken word.
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
let WORDS = [];
let SEGS = [];
export function setNarration(data) {
  WORDS = [];
  for (const [w, s, e] of data.words) { // whisper splits "U.S." -> "U" ".S." and "130,000" -> "130" ",000": merge them back
    const prev = WORDS[WORDS.length - 1];
    if (prev && /^[.,-][A-Za-z0-9]/.test(w)) { prev.w += w; prev.e = e; prev.n = norm(prev.w); continue; }
    WORDS.push({ w, s, e, n: norm(w) });
  }
  SEGS = data.segments;
}
export const words = () => WORDS;
export const segments = () => SEGS;

// find the k-th occurrence (0-based) of a phrase, optionally after time `after`
function find(phrase, k = 0, after = -1) {
  const p = phrase.split(/\s+/).map(norm).filter(Boolean);
  let hit = 0;
  for (let i = 0; i <= WORDS.length - p.length; i++) {
    if (WORDS[i].s < after) continue;
    let ok = true;
    for (let j = 0; j < p.length; j++) if (WORDS[i + j].n !== p[j]) { ok = false; break; }
    if (ok) { if (hit === k) return i; hit++; }
  }
  console.warn('phrase not found:', phrase);
  return -1;
}
// start time of phrase
export function T(phrase, k = 0, after = -1) {
  const i = find(phrase, k, after);
  return i < 0 ? NaN : WORDS[i].s;
}
// end time of phrase
export function TE(phrase, k = 0, after = -1) {
  const i = find(phrase, k, after);
  const n = phrase.split(/\s+/).map(norm).filter(Boolean).length;
  return i < 0 ? NaN : WORDS[i + n - 1].e;
}
// list of [word, start, end] spoken inside [a,b)
export function wordsIn(a, b) { return WORDS.filter((w) => w.s >= a && w.s < b); }
