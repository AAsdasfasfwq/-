// Verifies every T('...')/TE('...') phrase used in src/shots exists in the narration.
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('assets/narration.json', 'utf8'));
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const W = []; for (const [w, s, e] of data.words) { const p = W[W.length - 1]; if (p && /^[.,-][A-Za-z0-9]/.test(w)) { p.w += w; p.n = norm(p.w); continue; } W.push({ w, s, n: norm(w) }); }
const hits = (ph) => { const p = ph.split(/\s+/).map(norm).filter(Boolean); const out = []; for (let i = 0; i <= W.length - p.length; i++) { let ok = true; for (let j = 0; j < p.length; j++) if (W[i + j].n !== p[j]) { ok = false; break; } if (ok) out.push(W[i].s); } return out; };
let bad = 0;
for (const f of fs.readdirSync('src/shots')) {
  const src = fs.readFileSync('src/shots/' + f, 'utf8');
  for (const m of src.matchAll(/\bTE?\((['"])(.+?)\1(?:,\s*(\d+))?(?:,\s*(\d+))?\)/g)) {
    const h = hits(m[2]); const k = +(m[3] || 0), after = +(m[4] || -1); const hh = h.filter((x) => x >= after);
    if (!hh.length) { console.log('MISSING', f, JSON.stringify(m[2])); bad++; }
    else if (h.length > 1 && !m[3] && !m[4]) console.log('multi', f, JSON.stringify(m[2]), h.map((x) => x.toFixed(1)).join(' '));
  }
}
console.log(bad ? `${bad} missing` : 'all phrases found');
